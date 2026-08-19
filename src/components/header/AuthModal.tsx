import React, { useState, useEffect } from 'react';
import { AuthService, AppUser } from '../../services/authService';
import { isFirebaseConfigured } from '../../config/firebase';
import { StorageService, SavedProject } from '../../services/storageService';
import { useStageStore } from '../../store/useStageStore';
import {
  Save,
  Trash2,
  X,
  LogIn,
  LogOut,
  User as UserIcon,
  Clock,
  Check,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Plus,
  Copy,
  FolderOpen,
  ArrowLeft,
  Sparkles,
  Search,
  CheckCircle,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'projects' | 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'projects',
}) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'signin' | 'signup' | 'reset'>('projects');
  const [user, setUser] = useState<AppUser | null>(null);
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Alerts
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Metadata Form Fields
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
  const createNewProject = useStageStore((s) => s.createNewProject);
  const setUserInStore = useStageStore((s) => s.setUser);

  useEffect(() => {
    if (metadata) {
      setProjectName(metadata.name || '');
      setVenueName(metadata.venueName || '');
      setEngineerName(metadata.engineerName || '');
      setBandName(metadata.bandName || '');
    }
  }, [metadata, isOpen]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  useEffect(() => {
    const unsub = AuthService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setUserInStore(currentUser as any);
      loadProjects(currentUser);
    });
    return () => unsub();
  }, [isOpen]);

  const loadProjects = async (currentUser?: AppUser | null) => {
    const list = await StorageService.loadUserProjects(currentUser as any);
    setProjects(list);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);

    try {
      await AuthService.signInWithEmail(email.trim(), password);
      setActiveTab('projects');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setAuthError(formatAuthError(err.code || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.signUpWithEmail(email.trim(), password, displayName.trim());
      setActiveTab('projects');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setDisplayName('');
    } catch (err: any) {
      setAuthError(formatAuthError(err.code || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthMessage(null);
    setIsLoading(true);

    try {
      await AuthService.sendPasswordReset(email.trim());
      setAuthMessage(`Password reset link sent to ${email.trim()}. Please check your inbox.`);
    } catch (err: any) {
      setAuthError(formatAuthError(err.code || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await AuthService.signInWithGoogle();
      setActiveTab('projects');
    } catch (err: any) {
      setAuthError(formatAuthError(err.code || err.message));
    }
  };

  const handleGuestSignIn = async () => {
    setAuthError(null);
    try {
      await AuthService.signInAsGuest();
      setActiveTab('projects');
    } catch (err: any) {
      setAuthError(formatAuthError(err.code || err.message));
    }
  };

  const handleSignOut = async () => {
    await AuthService.signOut();
    setUser(null);
    setUserInStore(null);
    loadProjects(null);
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
    await StorageService.saveProject(updatedMeta, getExportData(), user as any);
    await loadProjects(user);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleLoadProject = (proj: SavedProject) => {
    loadFromData(proj.plotData, proj.metadata);
    onClose();
  };

  const handleCreateNew = () => {
    createNewProject('New Stage Plot');
    onClose();
  };

  const handleDuplicateProject = async (proj: SavedProject, e: React.MouseEvent) => {
    e.stopPropagation();
    const copyMeta = {
      ...proj.metadata,
      id: `plot_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: `${proj.metadata.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await StorageService.saveProject(copyMeta, proj.plotData, user as any);
    await loadProjects(user);
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this saved stage plot permanently?')) {
      await StorageService.deleteProject(id, user as any);
      await loadProjects(user);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.metadata.name.toLowerCase().includes(q) ||
      p.metadata.bandName?.toLowerCase().includes(q) ||
      p.metadata.venueName?.toLowerCase().includes(q) ||
      p.metadata.engineerName?.toLowerCase().includes(q)
    );
  });

  const formatAuthError = (code: string) => {
    switch (code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Try signing in.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/popup-closed-by-user':
        return 'Sign in window was closed before completing.';
      default:
        return code.replace(/^auth\//, '').replace(/-/g, ' ');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-studio-900 border border-slate-200 dark:border-studio-700/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-studio-800 bg-slate-50 dark:bg-studio-950/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <FolderOpen size={16} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                StagePlot Accounts & Projects
              </div>
              <div className="text-[10px] text-slate-500 dark:text-studio-400 mt-0.5">
                {isFirebaseConfigured
                  ? 'Connected to Firebase Cloud Sync'
                  : 'Local Storage Mode (Configured for Cloud Sync)'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-studio-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 dark:border-studio-800 px-4 bg-slate-50/50 dark:bg-studio-950/20 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('projects');
              setAuthError(null);
            }}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'projects'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 dark:text-studio-400 hover:text-slate-800 dark:hover:text-studio-200'
            }`}
          >
            <FolderOpen size={14} />
            <span>Saved Projects ({projects.length})</span>
          </button>

          {!user ? (
            <>
              <button
                onClick={() => {
                  setActiveTab('signin');
                  setAuthError(null);
                }}
                className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'signin'
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-slate-500 dark:text-studio-400 hover:text-slate-800 dark:hover:text-studio-200'
                }`}
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('signup');
                  setAuthError(null);
                }}
                className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'signup'
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-slate-500 dark:text-studio-400 hover:text-slate-800 dark:hover:text-studio-200'
                }`}
              >
                <UserIcon size={14} />
                <span>Register</span>
              </button>
            </>
          ) : (
            <div className="ml-auto flex items-center gap-2 py-1.5">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle size={12} className="text-emerald-500" />
                <span>Signed In: {user.email || user.displayName}</span>
              </span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* User Status Ribbon */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-studio-850 border border-slate-200 dark:border-studio-750 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0 font-bold text-xs">
                {user?.displayName ? (
                  user.displayName.charAt(0).toUpperCase()
                ) : user?.email ? (
                  user.email.charAt(0).toUpperCase()
                ) : (
                  <UserIcon size={16} />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {user
                    ? user.displayName || user.email || 'Anonymous Sound Tech'
                    : 'Guest / Offline Mode'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-studio-400 truncate">
                  {user
                    ? user.email ? `Logged in as ${user.email}` : 'Signed in as guest'
                    : 'Register an account or sign in to keep your stage plots organized'}
                </div>
              </div>
            </div>

            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-studio-800 hover:bg-slate-300 dark:hover:bg-studio-750 text-slate-700 dark:text-studio-300 text-xs font-medium shrink-0 transition-colors ml-2"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            ) : (
              activeTab === 'projects' && (
                <button
                  onClick={() => setActiveTab('signin')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shrink-0 transition-colors shadow-sm ml-2"
                >
                  <LogIn size={13} />
                  <span>Sign In</span>
                </button>
              )
            )}
          </div>

          {/* TAB 1: SAVED PROJECTS DASHBOARD */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              {/* Project Metadata Details Form */}
              <div className="space-y-3 p-3.5 rounded-xl border border-slate-200 dark:border-studio-800 bg-slate-50/50 dark:bg-studio-950/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-studio-200 uppercase tracking-wider">
                    Current Stage Plot
                  </span>
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    className="flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 hover:underline font-medium"
                  >
                    <Plus size={13} />
                    <span>Create New Blank Plot</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-studio-400 mb-1">
                      Plot Title
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full bg-white dark:bg-studio-900 border border-slate-300 dark:border-studio-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                      placeholder="e.g. Festival Main Stage"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-studio-400 mb-1">
                      Band / Artist
                    </label>
                    <input
                      type="text"
                      value={bandName}
                      onChange={(e) => setBandName(e.target.value)}
                      className="w-full bg-white dark:bg-studio-900 border border-slate-300 dark:border-studio-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                      placeholder="e.g. The Headliners"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-studio-400 mb-1">
                      Venue / Stage
                    </label>
                    <input
                      type="text"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      className="w-full bg-white dark:bg-studio-900 border border-slate-300 dark:border-studio-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                      placeholder="e.g. Royal Arena"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-studio-400 mb-1">
                      FOH Engineer
                    </label>
                    <input
                      type="text"
                      value={engineerName}
                      onChange={(e) => setEngineerName(e.target.value)}
                      className="w-full bg-white dark:bg-studio-900 border border-slate-300 dark:border-studio-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                      placeholder="e.g. Lead Sound Tech"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveCurrent}
                  disabled={isSaving}
                  className={`w-full mt-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold text-white shadow-sm transition-colors ${
                    saveSuccess ? 'bg-emerald-600' : 'bg-sky-600 hover:bg-sky-500'
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <Check size={14} />
                      <span>Saved to Projects!</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>{isSaving ? 'Saving...' : 'Save & Sync Now'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Projects List Header & Search */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-studio-200 uppercase tracking-wider">
                    Saved Stage Plots ({projects.length})
                  </span>

                  <div className="relative w-44">
                    <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter plots..."
                      className="w-full bg-slate-100 dark:bg-studio-950 border border-slate-200 dark:border-studio-750 rounded-md pl-6 pr-2 py-1 text-[11px] text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {filteredProjects.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 dark:text-studio-500 text-xs border border-dashed border-slate-200 dark:border-studio-800 rounded-xl">
                    No stage plots match your search.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {filteredProjects.map((p) => {
                      const isCurrent = p.metadata.id === metadata.id;
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
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group ${
                            isCurrent
                              ? 'bg-sky-500/10 border-sky-500/50'
                              : 'bg-slate-50 dark:bg-studio-950 border-slate-200 dark:border-studio-800 hover:border-sky-500/40 hover:bg-slate-100 dark:hover:bg-studio-850'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 truncate">
                                {p.metadata.name}
                              </span>
                              {isCurrent && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-600 dark:text-sky-400 font-semibold">
                                  CURRENT
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-studio-400 mt-0.5">
                              {p.metadata.bandName && <span>{p.metadata.bandName} •</span>}
                              <span className="flex items-center gap-1">
                                <Clock size={10} />
                                {dateStr}
                              </span>
                              <span>• {p.plotData.elements?.length || 0} assets</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 ml-2">
                            <button
                              type="button"
                              onClick={(e) => handleDuplicateProject(p, e)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-200 dark:hover:bg-studio-800 transition-colors"
                              title="Duplicate Plot"
                            >
                              <Copy size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleDeleteProject(p.metadata.id, e)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-studio-800 transition-colors"
                              title="Delete Plot"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL SIGN IN */}
          {activeTab === 'signin' && (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              {authError && (
                <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-studio-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@soundcompany.com"
                    className="w-full bg-slate-50 dark:bg-studio-950 border border-slate-300 dark:border-studio-750 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-studio-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('reset');
                      setAuthError(null);
                    }}
                    className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-studio-950 border border-slate-300 dark:border-studio-750 rounded-lg pl-9 pr-9 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors shadow-md shadow-sky-600/20"
              >
                <LogIn size={15} />
                <span>{isLoading ? 'Signing In...' : 'Sign In with Email'}</span>
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="h-px bg-slate-200 dark:bg-studio-800 w-full" />
                <span className="bg-white dark:bg-studio-900 px-2 text-[11px] text-slate-400">or</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-300 dark:border-studio-750 bg-slate-50 dark:bg-studio-950 hover:bg-slate-100 dark:hover:bg-studio-800 text-slate-700 dark:text-studio-200 text-xs font-medium transition-colors"
                >
                  <LogIn size={14} className="text-sky-500" />
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleGuestSignIn}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-300 dark:border-studio-750 bg-slate-50 dark:bg-studio-950 hover:bg-slate-100 dark:hover:bg-studio-800 text-slate-700 dark:text-studio-200 text-xs font-medium transition-colors"
                >
                  <UserIcon size={14} className="text-slate-400" />
                  <span>Guest Mode</span>
                </button>
              </div>

              <div className="text-center text-xs text-slate-500 dark:text-studio-400 pt-2">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setAuthError(null);
                  }}
                  className="text-sky-600 dark:text-sky-400 font-semibold hover:underline"
                >
                  Create one now
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: EMAIL SIGN UP */}
          {activeTab === 'signup' && (
            <form onSubmit={handleEmailSignUp} className="space-y-3.5">
              {authError && (
                <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-studio-300 mb-1">
                  Full Name / Sound Engineer
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Alex Tech"
                  className="w-full bg-slate-50 dark:bg-studio-950 border border-slate-300 dark:border-studio-750 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-studio-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@soundcompany.com"
                    className="w-full bg-slate-50 dark:bg-studio-950 border border-slate-300 dark:border-studio-750 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-studio-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 chars"
                    className="w-full bg-slate-50 dark:bg-studio-950 border border-slate-300 dark:border-studio-750 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-studio-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-slate-50 dark:bg-studio-950 border border-slate-300 dark:border-studio-750 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors shadow-md shadow-sky-600/20"
              >
                <Sparkles size={15} />
                <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
              </button>

              <div className="text-center text-xs text-slate-500 dark:text-studio-400 pt-2">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setAuthError(null);
                  }}
                  className="text-sky-600 dark:text-sky-400 font-semibold hover:underline"
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: PASSWORD RESET */}
          {activeTab === 'reset' && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <ArrowLeft size={16} />
                </button>
                <span className="text-xs font-semibold text-slate-800 dark:text-studio-200">
                  Reset Account Password
                </span>
              </div>

              {authError && (
                <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authMessage && (
                <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                  <Check size={15} className="shrink-0" />
                  <span>{authMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-studio-300 mb-1">
                  Your Account Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@soundcompany.com"
                  className="w-full bg-slate-50 dark:bg-studio-950 border border-slate-300 dark:border-studio-750 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors shadow-md"
              >
                <Mail size={15} />
                <span>{isLoading ? 'Sending Link...' : 'Send Password Reset Email'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
