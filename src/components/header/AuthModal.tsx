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
      name: projectName || 'Untitled Stage Plot',
      venueName,
      engineerName,
      bandName,
    };
    setMetadata(updatedMeta);
    await StorageService.saveProject(updatedMeta, getExportData());
    await loadProjects();
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleLoadProject = (proj: SavedProject) => {
    loadFromData(proj.plotData, proj.metadata);
    onClose();
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this saved plot?')) {
      await StorageService.deleteProject(id);
      await loadProjects();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-studio-900 border border-slate-200 dark:border-studio-700/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-studio-800 bg-slate-50 dark:bg-studio-950/50">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Cloud size={18} className="text-sky-600 dark:text-sky-400" />
            <span>Projects & Cloud Sync</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-studio-800 text-slate-500 dark:text-studio-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* User Account / Auth Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-studio-850 border border-slate-200 dark:border-studio-750 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-studio-800 border border-slate-300 dark:border-studio-700 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <UserIcon size={18} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  {user
                    ? user.displayName || user.email || 'Anonymous Guest'
                    : 'Local Storage Mode'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-studio-400">
                  {isFirebaseConfigured
                    ? user
                      ? 'Connected to Firebase Firestore'
                      : 'Sign in to sync your stage plots across devices'
                    : 'Saved securely to browser LocalStorage'}
                </div>
              </div>
            </div>

            {isFirebaseConfigured && (
              <div>
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-studio-800 hover:bg-slate-300 dark:hover:bg-studio-750 text-slate-700 dark:text-studio-300 text-xs font-medium transition-colors"
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
                      className="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-studio-800 hover:bg-slate-300 dark:hover:bg-studio-750 text-slate-700 dark:text-studio-300 text-xs font-medium transition-colors"
                    >
                      Guest
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Project Details Form */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-700 dark:text-studio-300 uppercase tracking-wider">
              Current Project Details
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-studio-400 mb-1">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-studio-950 border border-slate-300 dark:border-studio-750 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  placeholder="e.g. Festival Main Stage Plot"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-studio-400 mb-1">Band / Artist</label>
                <input
                  type="text"
                  value={bandName}
                  onChange={(e) => setBandName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-studio-950 border border-slate-300 dark:border-studio-750 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  placeholder="e.g. Electric Echoes"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-studio-400 mb-1">Venue / Stage Name</label>
                <input
                  type="text"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-studio-950 border border-slate-300 dark:border-studio-750 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  placeholder="e.g. The Soundstage"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-studio-400 mb-1">Sound Engineer</label>
                <input
                  type="text"
                  value={engineerName}
                  onChange={(e) => setEngineerName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-studio-950 border border-slate-300 dark:border-studio-750 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  placeholder="e.g. Alex FOH"
                />
              </div>
            </div>

            <button
              onClick={handleSaveCurrent}
              disabled={isSaving}
              className={`w-full mt-2 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold text-white shadow-md transition-colors ${
                saveSuccess
                  ? 'bg-emerald-600'
                  : 'bg-sky-600 hover:bg-sky-500'
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check size={15} />
                  <span>Saved to Projects!</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>{isSaving ? 'Saving...' : 'Save Current Plot'}</span>
                </>
              )}
            </button>
          </div>

          {/* Saved Projects List */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700 dark:text-studio-300 uppercase tracking-wider">
              Saved Plots ({projects.length})
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-6 text-slate-400 dark:text-studio-500 text-xs border border-dashed border-slate-300 dark:border-studio-800 rounded-xl">
                No saved stage plots found. Click &ldquo;Save Current Plot&rdquo; above to store your layout.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {projects.map((p) => {
                  const dateStr = new Date(p.metadata.updatedAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={p.metadata.id}
                      onClick={() => handleLoadProject(p)}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-studio-950 border border-slate-200 dark:border-studio-800 hover:border-sky-500/50 cursor-pointer group transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 truncate">
                          {p.metadata.name}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-studio-400 mt-0.5">
                          {p.metadata.bandName && <span>Band: {p.metadata.bandName} •</span>}
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {dateStr}
                          </span>
                          <span>• {p.plotData.elements?.length || 0} items</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteProject(p.metadata.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 dark:text-studio-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-200 dark:hover:bg-studio-800 transition-colors ml-2"
                        title="Delete Plot"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
