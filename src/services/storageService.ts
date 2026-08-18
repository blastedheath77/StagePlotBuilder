import { db, auth, isFirebaseConfigured } from '../config/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, where, orderBy } from 'firebase/firestore';
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
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  }

  static deleteLocalProject(projectId: string): void {
    const list = this.getLocalProjects().filter((p) => p.metadata.id !== projectId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  }

  static async saveProject(
    metadata: ProjectMetadata,
    plotData: StagePlotExportSchema
  ): Promise<void> {
    const project: SavedProject = {
      metadata: {
        ...metadata,
        updatedAt: Date.now(),
      },
      plotData,
    };

    this.saveLocalProject(project);

    if (isFirebaseConfigured && db && auth?.currentUser) {
      const docRef = doc(db, 'stageplots', metadata.id);
      await setDoc(docRef, {
        ...project,
        ownerId: auth.currentUser.uid,
        updatedAt: Date.now(),
      });
    }
  }

  static async loadUserProjects(): Promise<SavedProject[]> {
    const localProjects = this.getLocalProjects();

    if (!isFirebaseConfigured || !db || !auth?.currentUser) {
      return localProjects;
    }

    try {
      const q = query(
        collection(db, 'stageplots'),
        where('ownerId', '==', auth.currentUser.uid),
        orderBy('metadata.updatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const cloudProjects: SavedProject[] = [];
      snapshot.forEach((d) => {
        cloudProjects.push(d.data() as SavedProject);
      });

      const combined = [...cloudProjects];
      for (const local of localProjects) {
        if (!combined.some((c) => c.metadata.id === local.metadata.id)) {
          combined.push(local);
        }
      }
      return combined;
    } catch (err) {
      console.warn('Error fetching cloud projects, using local cache:', err);
      return localProjects;
    }
  }

  static async deleteProject(projectId: string): Promise<void> {
    this.deleteLocalProject(projectId);

    if (isFirebaseConfigured && db && auth?.currentUser) {
      try {
        await deleteDoc(doc(db, 'stageplots', projectId));
      } catch (err) {
        console.error('Failed to delete cloud project:', err);
      }
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
