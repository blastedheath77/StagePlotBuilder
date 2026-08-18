import React, { useState, useEffect } from 'react';
import {
  auth,
  isFirebaseConfigured,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
} from '../../config/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { StorageService, SavedProject } from '../../services/storageService';
import { useStageStore } from '../../store/useStageStore';
import {
  Cloud,
  Save,
  Trash2,
  X,
  LogIn,
  LogOut,
  User as UserIcon,
  Clock,
  Check,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [projectName, setProjectName] = useState('');
  const [venueName, setVenueName] = useState('');
  const [engineerName, setEngineerName] = useState('');
  const [bandName, setBandName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const metadata = useStageStore((s) => s.metadata);
  const setMetadata = useStageStore((s) => s.setMetadata);
  const getExportData = useStageStore((s) => s.getExportData);
  const loadFromData = useStageStore((s) => s.loadFromData);

  useEffect(() => {
    if (metadata) {
      setProjectName(metadata.name || '');
      setVenueName(metadata.venueName || '');
      setEngineerName(metadata.engineerName || '');
      setBandName(metadata.bandName || '');
    }
  }, [metadata, isOpen]);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsub = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        loadProjects();
      });
      return () => unsub();
    } else {
      loadProjects();
    }
  }, [isOpen]);

  const loadProjects = async () => {
    const list = await StorageService.loadUserProjects();
    setProjects(list);
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      alert(`Google sign in failed: ${err.message}`);
    }
  };

  const handleGuestSignIn = async () => {
    if (!auth) return;
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      alert(`Guest sign in failed: ${err.message}`);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
    loadProjects();
  };

  const handleSaveCurrent = async () => {
    setIsSaving(true);
    const updatedMeta = {
      ...metadata,
      name: projectName.trim() || 'Stage Plot',
      venueName: venueName.trim(),
      engineerName: engineerName.trim(),
      bandName: bandName.trim(),
      updatedAt: Date.now(),
    };
    setMetadata(updatedMeta);

    await StorageService.saveProject(updatedMeta, getExportData());
    await loadProjects();
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleLoadProject = (project: SavedProject) => {
    loadFromData(project.plotData, project.metadata);
    onClose();
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this saved project?')) {
      await StorageService.deleteProject(id);
      await loadProjects();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-studio-900 border border-studio-700/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-4 border-b border-studio-800 bg-studio-950/50">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Cloud size={18} className="text-sky-400" />
            <span>Projects & Persistence (Firebase / Local)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-studio-800 text-studio-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="p-3.5 rounded-xl bg-studio-850 border border-studio-750 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-studio-800 border border-studio-700 flex items-center justify-center text-sky-400">
                <UserIcon size={18} />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">
                  {user
                    ? user.displayName || user.email || 'Anonymous Guest'
                    : 'Local Offline Mode'}
                </div>
                <div className="text-[11px] text-studio-400">
                  {isFirebaseConfigured
                    ? user
                      ? 'Connected to Firebase Firestore'
                      : 'Sign in to sync your stage plots across devices'
                    : 'Firebase keys not set; saving safely to browser LocalStorage'}
                </div>
              </div>
            </div>

            {isFirebaseConfigured && (
              <div>
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-studio-800 hover:bg-studio-750 text-studio-300 text-xs font-medium transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGoogleSignIn}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition-colors"
                    >
                      <LogIn size={14} />
                      <span>Google</span>
                    </button>
                    <button
                      onClick={handleGuestSignIn}
                      className="px-2.5 py-1.5 rounded-lg bg-studio-800 hover:bg-studio-750 text-studio-300 text-xs font-medium transition-colors"
                    >
                      Guest
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold text-studio-300 uppercase tracking-wider">
              Current Project Details
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-studio-400 mb-1">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-studio-950 border border-studio-750 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  placeholder="e.g. Festival Main Stage Plot"
                />
              </div>

              <div>
                <label className="block text-[11px] text-studio-400 mb-1">Band / Artist</label>
                <input
                  type="text"
                  value={bandName}
                  onChange={(e) => setBandName(e.target.value)}
                  className="w-full bg-studio-950 border border-studio-750 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  placeholder="e.g. The Headliners"
                />
              </div>

              <div>
                <label className="block text-[11px] text-studio-400 mb-1">Venue / Room</label>
                <input
                  type="text"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full bg-studio-950 border border-studio-750 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  placeholder="e.g. O2 Academy 2"
                />
              </div>

              <div>
                <label className="block text-[11px] text-studio-400 mb-1">FOH Sound Tech</label>
                <input
                  type="text"
                  value={engineerName}
                  onChange={(e) => setEngineerName(e.target.value)}
                  className="w-full bg-studio-950 border border-studio-750 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  placeholder="e.g. Sound Engineer"
                />
              </div>
            </div>

            <button
              onClick={handleSaveCurrent}
              disabled={isSaving}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-colors disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <Check size={16} className="text-emerald-300" />
                  <span>Saved Successfully!</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isSaving ? 'Saving...' : 'Save Current Diagram'}</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-studio-300 uppercase tracking-wider">
              <span>Saved Stage Plots ({projects.length})</span>
            </div>

            {projects.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-studio-800 rounded-xl text-xs text-studio-500">
                No saved stage plots yet. Click &ldquo;Save Current Diagram&rdquo; above to store your first plot.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {projects.map((proj) => (
                  <div
                    key={proj.metadata.id}
                    onClick={() => handleLoadProject(proj)}
                    className="p-3 rounded-xl bg-studio-850 hover:bg-studio-800 border border-studio-750 hover:border-sky-500/50 flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white group-hover:text-sky-300 truncate">
                          {proj.metadata.name}
                        </span>
                        {proj.metadata.bandName && (
                          <span className="text-[10px] text-studio-400 truncate">
                            &bull; {proj.metadata.bandName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-studio-500 mt-0.5">
                        <Clock size={11} />
                        <span>
                          {new Date(proj.metadata.updatedAt).toLocaleDateString()} at{' '}
                          {new Date(proj.metadata.updatedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span>&bull;</span>
                        <span>{proj.plotData.elements.length} items</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteProject(proj.metadata.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-studio-400 hover:text-red-300 transition-all"
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
