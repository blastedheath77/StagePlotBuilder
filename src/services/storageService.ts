import { db, auth, isFirebaseConfigured, User } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { StagePlotExportSchema, ProjectMetadata } from '../types/stage';

export interface SavedProject {
  metadata: ProjectMetadata;
  plotData: StagePlotExportSchema;
}

const LOCAL_STORAGE_KEY = 'stageplot_projects_local';
const ACTIVE_PROJECT_KEY = 'stageplot_active_project';

/**
 * Deep sanitizes an object to remove undefined values which Firestore rejects.
 */
function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) => (value === undefined ? null : value))
  );
}

export class StorageService {
  static getLocalProjects(): SavedProject[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveLocalProject(project: SavedProject): void {
    const list = this.getLocalProjects();
    const index = list.findIndex((p) => p.metadata.id === project.metadata.id);
    if (index >= 0) {
      list[index] = project;
    } else {
      list.unshift(project);
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    } catch {}
  }

  static deleteLocalProject(projectId: string): void {
    const list = this.getLocalProjects().filter((p) => p.metadata.id !== projectId);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    } catch {}
  }

  static async saveProject(
    metadata: ProjectMetadata,
    plotData: StagePlotExportSchema,
    user?: User | null
  ): Promise<void> {
    const currentUser = user !== undefined ? user : auth?.currentUser;
    const ownerId = currentUser?.uid || metadata.ownerId || 'guest_local';

    const project: SavedProject = {
      metadata: {
        id: metadata.id,
        name: metadata.name || 'Untitled Stage Plot',
        venueName: metadata.venueName || '',
        engineerName: metadata.engineerName || '',
        bandName: metadata.bandName || '',
        notes: metadata.notes || '',
        createdAt: metadata.createdAt || Date.now(),
        updatedAt: Date.now(),
        ownerId,
      },
      plotData: {
        templateId: plotData.templateId,
        version: plotData.version || '1.0',
        elements: plotData.elements.map((el) => ({
          id: el.id,
          type: el.type,
          label: el.label || '',
          x: Math.round(el.x),
          y: Math.round(el.y),
          rotation: Math.round(el.rotation || 0),
          colorTint: el.colorTint || null,
        })) as any,
        connections: plotData.connections || [],
      },
    };

    // 1. Instant local cache mirror (0ms sync)
    this.saveLocalProject(project);
    this.saveActiveState(project.plotData, project.metadata);

    // 2. Cloud Firestore sync if authenticated
    if (isFirebaseConfigured && db && currentUser && currentUser.uid) {
      try {
        const docRef = doc(db, 'stageplots', metadata.id);
        const payload = sanitizeForFirestore({
          metadata: {
            ...project.metadata,
            ownerEmail: currentUser.email || '',
          },
          plotData: project.plotData,
          ownerId: currentUser.uid,
          updatedAt: Date.now(),
        });
        await setDoc(docRef, payload);
      } catch (err) {
        console.warn('Firestore cloud save failed, saved locally:', err);
        throw err;
      }
    }
  }

  static async loadUserProjects(user?: User | null): Promise<SavedProject[]> {
    const localProjects = this.getLocalProjects();
    const currentUser = user !== undefined ? user : auth?.currentUser;

    if (!isFirebaseConfigured || !db || !currentUser || !currentUser.uid) {
      return localProjects;
    }

    try {
      const q = query(
        collection(db, 'stageplots'),
        where('ownerId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const cloudProjects: SavedProject[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        if (data && data.metadata && data.plotData) {
          cloudProjects.push({
            metadata: data.metadata,
            plotData: data.plotData,
          });
        }
      });

      // Merge local and cloud projects (cloud taking priority)
      const mergedMap = new Map<string, SavedProject>();
      localProjects.forEach((p) => mergedMap.set(p.metadata.id, p));
      cloudProjects.forEach((p) => mergedMap.set(p.metadata.id, p));

      return Array.from(mergedMap.values()).sort(
        (a, b) => (b.metadata.updatedAt || 0) - (a.metadata.updatedAt || 0)
      );
    } catch (err) {
      console.warn('Error fetching cloud projects, using local cache:', err);
      return localProjects;
    }
  }

  static async deleteProject(projectId: string, user?: User | null): Promise<void> {
    this.deleteLocalProject(projectId);
    const currentUser = user !== undefined ? user : auth?.currentUser;

    if (isFirebaseConfigured && db && currentUser && currentUser.uid) {
      try {
        await deleteDoc(doc(db, 'stageplots', projectId));
      } catch (err) {
        console.error('Failed to delete cloud project:', err);
      }
    }
  }

  static subscribeToProject(
    projectId: string,
    callback: (project: SavedProject) => void
  ): Unsubscribe | null {
    if (!isFirebaseConfigured || !db) return null;
    try {
      const docRef = doc(db, 'stageplots', projectId);
      return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.metadata && data.plotData) {
            callback({
              metadata: data.metadata,
              plotData: data.plotData,
            });
          }
        }
      });
    } catch (err) {
      console.warn('Failed to subscribe to project:', err);
      return null;
    }
  }

  static saveActiveState(plotData: StagePlotExportSchema, metadata: ProjectMetadata): void {
    try {
      localStorage.setItem(ACTIVE_PROJECT_KEY, JSON.stringify({ plotData, metadata }));
    } catch {}
  }

  static loadActiveState(): { plotData: StagePlotExportSchema; metadata: ProjectMetadata } | null {
    try {
      const data = localStorage.getItem(ACTIVE_PROJECT_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
}
