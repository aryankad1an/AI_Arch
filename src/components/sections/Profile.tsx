import { useState, useEffect } from 'react';
import { useSettingsStore } from '../../store/settings';

interface UserProfile {
  displayName: string;
  email: string;
  bio: string;
}

interface UserPreferences {
  gridSize: string;
  quality: string;
  autoRotate: boolean;
  showAxes: boolean;
  darkMode: boolean;
}

const defaultProfile: UserProfile = {
  displayName: '',
  email: '',
  bio: '',
};

const defaultPreferences: UserPreferences = {
  gridSize: '20',
  quality: 'standard',
  autoRotate: true,
  showAxes: true,
  darkMode: true,
};

const Profile = () => {
  const { geminiApiKey, setGeminiApiKey } = useSettingsStore();
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey || '');
  const [keyStatus, setKeyStatus] = useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle');

  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'history'>('profile');

  // Load from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('aiarch_profile');
    const savedPrefs = localStorage.getItem('aiarch_preferences');
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedPrefs) setPreferences(JSON.parse(savedPrefs));
  }, []);

  const handleSave = () => {
    localStorage.setItem('aiarch_profile', JSON.stringify(profile));
    localStorage.setItem('aiarch_preferences', JSON.stringify(preferences));
    setGeminiApiKey(apiKeyInput);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const verifyApiKey = async () => {
    if (!apiKeyInput) return;
    setKeyStatus('verifying');
    try {
      const res = await fetch('http://localhost:4000/verify-key', {
        headers: { 'x-gemini-key': apiKeyInput }
      });
      const data = await res.json();
      setKeyStatus(data.valid ? 'valid' : 'invalid');
      if (data.valid) {
        setGeminiApiKey(apiKeyInput);
      } else {
        console.error("Verification failed:", data.error);
        alert(`Verification failed: ${data.error || 'Unknown error'}`);
      }
    } catch (e) {
      setKeyStatus('invalid');
      console.error(e);
      alert("Network or verification error. Check console.");
    }
  };

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handlePrefChange = (field: keyof UserPreferences, value: string | boolean) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };

  const getInitials = () => {
    if (!profile.displayName) return '?';
    return profile.displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile' },
    { id: 'preferences' as const, label: 'Preferences' },
    { id: 'history' as const, label: 'History' },
  ];

  return (
    <section className="page-wrapper px-6 sm:px-16">
      <div className="relative z-10 mx-auto max-w-3xl pt-32 pb-20">
        {/* Header with avatar */}
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#1a1a1a] bg-[#0a0a0a] text-2xl font-bold text-white">
            {getInitials()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {profile.displayName || 'Your Profile'}
            </h1>
            <p className="mt-1 text-[14px] text-[#555]">
              {profile.email || 'Set up your profile below'}
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="mt-10 flex gap-1 border-b border-[#1a1a1a]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-[14px] font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-white text-white'
                  : 'text-[#555] hover:text-[#888]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {activeTab === 'profile' && (
          <div className="mt-8 space-y-6">
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#888]">
                Display Name
              </label>
              <input
                type="text"
                value={profile.displayName}
                onChange={(e) => handleProfileChange('displayName', e.target.value)}
                placeholder="Enter your name"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#888]">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                placeholder="you@example.com"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#888]">
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => handleProfileChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                className="input-field resize-none"
              />
            </div>
          </div>
        )}

        {/* Preferences tab */}
        {activeTab === 'preferences' && (
          <div className="mt-8 space-y-6">

            {/* API Key */}
            <div className="rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[15px] font-medium text-white">Gemini API Key</p>
                  <p className="mt-1 text-[13px] text-[#555]">
                    Enter your Google Gemini API key to enable 3D generation.
                  </p>
                </div>
                <button
                  onClick={verifyApiKey}
                  disabled={keyStatus === 'verifying' || !apiKeyInput}
                  className="rounded-full bg-white/5 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50"
                >
                  {keyStatus === 'verifying' ? 'Verifying...' : keyStatus === 'valid' ? 'Verified ✓' : 'Verify'}
                </button>
              </div>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  setKeyStatus('idle');
                }}
                placeholder="AIzaSy..."
                className="w-full rounded-lg border border-[#1a1a1a] bg-[#111] px-4 py-2 text-[14px] text-white outline-none"
              />
              {keyStatus === 'invalid' && <p className="text-red-500 text-xs mt-2">Invalid API Key or connection failed.</p>}
            </div>

            {/* Grid Size */}
            <div className="flex items-center justify-between rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-5">
              <div>
                <p className="text-[15px] font-medium text-white">Grid Size</p>
                <p className="mt-1 text-[13px] text-[#555]">
                  Default grid dimensions for generation
                </p>
              </div>
              <select
                value={preferences.gridSize}
                onChange={(e) => handlePrefChange('gridSize', e.target.value)}
                className="rounded-lg border border-[#1a1a1a] bg-[#111] px-4 py-2 text-[14px] text-white outline-none"
              >
                <option value="10">10 × 10</option>
                <option value="20">20 × 20</option>
                <option value="30">30 × 30</option>
                <option value="50">50 × 50</option>
              </select>
            </div>

            {/* Quality */}
            <div className="flex items-center justify-between rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-5">
              <div>
                <p className="text-[15px] font-medium text-white">Render Quality</p>
                <p className="mt-1 text-[13px] text-[#555]">
                  Higher quality uses more compute
                </p>
              </div>
              <select
                value={preferences.quality}
                onChange={(e) => handlePrefChange('quality', e.target.value)}
                className="rounded-lg border border-[#1a1a1a] bg-[#111] px-4 py-2 text-[14px] text-white outline-none"
              >
                <option value="draft">Draft</option>
                <option value="standard">Standard</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Toggle: Auto-rotate */}
            <div className="flex items-center justify-between rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-5">
              <div>
                <p className="text-[15px] font-medium text-white">Auto-Rotate</p>
                <p className="mt-1 text-[13px] text-[#555]">
                  Automatically rotate models in viewport
                </p>
              </div>
              <div
                onClick={() => handlePrefChange('autoRotate', !preferences.autoRotate)}
                className={`toggle-switch ${preferences.autoRotate ? 'active' : ''}`}
              />
            </div>

            {/* Toggle: Show Axes */}
            <div className="flex items-center justify-between rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-5">
              <div>
                <p className="text-[15px] font-medium text-white">Show Axes</p>
                <p className="mt-1 text-[13px] text-[#555]">
                  Display XYZ axis helpers in the scene
                </p>
              </div>
              <div
                onClick={() => handlePrefChange('showAxes', !preferences.showAxes)}
                className={`toggle-switch ${preferences.showAxes ? 'active' : ''}`}
              />
            </div>

            {/* Toggle: Dark Mode */}
            <div className="flex items-center justify-between rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-5">
              <div>
                <p className="text-[15px] font-medium text-white">Dark Mode</p>
                <p className="mt-1 text-[13px] text-[#555]">
                  Always dark — as it should be
                </p>
              </div>
              <div
                onClick={() => handlePrefChange('darkMode', !preferences.darkMode)}
                className={`toggle-switch ${preferences.darkMode ? 'active' : ''}`}
              />
            </div>
          </div>
        )}

        {/* History tab */}
        {activeTab === 'history' && (
          <div className="mt-8">
            <div className="flex flex-col items-center justify-center rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] py-16">
              <p className="text-4xl">∅</p>
              <p className="mt-4 text-[15px] font-medium text-white">No generations yet</p>
              <p className="mt-2 text-[13px] text-[#555]">
                Your generated models will appear here
              </p>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="mt-10 flex items-center gap-4">
          <button onClick={handleSave} className="btn-primary">
            Save Changes
          </button>
          {saved && (
            <span className="text-[14px] font-medium text-green-400">
              ✓ Saved successfully
            </span>
          )}
        </div>
      </div>
    </section>
  );
};

export default Profile;
