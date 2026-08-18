import { db, auth, isFirebaseConfigured, User } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
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
    const project: SavedProject = {
      metadata: {
        ...metadata,
        updatedAt: Date.now(),
        ownerId: currentUser?.uid || metadata.ownerId,
      },
      plotData,
    };

    // 1. Instant local cache mirror
    this.saveLocalProject(project);
    this.saveActiveState(plotData, project.metadata);

    // 2. Cloud Firestore sync if authenticated
    if (isFirebaseConfigured && db && currentUser) {
      try {
        const docRef = doc(db, 'stageplots', metadata.id);
        await setDoc(docRef, {
          metadata: {
            ...project.metadata,
            ownerEmail: currentUser.email || '',
          },
          plotData: project.plotData,
          ownerId: currentUser.uid,
          updatedAt: Date.now(),
        });
      } catch (err) {
        console.warn('Firestore cloud save failed, saved locally:', err);
        throw err;
      }
    }
  }

  static async loadUserProjects(user?: User | null): Promise<SavedProject[]> {
    const localProjects = this.getLocalProjects();
    const currentUser = user !== undefined ? user : auth?.currentUser;

    if (!isFirebaseConfigured || !db || !currentUser) {
      return localProjects;
    }

    try {
      const q = query(
        collection(db, 'stageplots'),
        where('ownerId', '==', currentUser.uid),
        orderBy('updatedAt', 'desc')
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
        (a, b) => b.metadata.updatedAt - a.metadata.updatedAt
      );
    } catch (err) {
      console.warn('Error fetching cloud projects, using local cache:', err);
      return localProjects;
    }
  }

  static async deleteProject(projectId: string, user?: User | null): Promise<void> {
    this.deleteLocalProject(projectId);
    const currentUser = user !== undefined ? user : auth?.currentUser;

    if (isFirebaseConfigured && db && currentUser) {
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
