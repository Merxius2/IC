import { X } from 'lucide-react';
import { useSecretSettings } from '../context/SecretSettingsContext';

export default function SecretSettingsModal() {
  const { isSecretSettingsOpen, closeSecretSettings } = useSecretSettings();

  if (!isSecretSettingsOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="card bg-gradient-to-br from-purple-900 to-indigo-900 border-2 border-purple-400 p-8 max-w-md mx-auto rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-purple-300">🔐 Secret Settings</h2>
          <button
            onClick={closeSecretSettings}
            className="text-purple-300 hover:text-purple-100 transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-purple-800/50 border border-purple-400 rounded-lg p-4">
            <p className="text-purple-100 text-sm font-semibold mb-2">✨ You found the secret settings!</p>
            <p className="text-purple-200 text-xs">This is a hidden area for fun and experimental features.</p>
          </div>

          <div className="bg-indigo-800/50 border border-indigo-400 rounded-lg p-4">
            <p className="text-indigo-100 text-sm font-semibold mb-2">🚀 Coming Soon</p>
            <p className="text-indigo-200 text-xs">More fun features will be added here in the future!</p>
          </div>

          <div className="text-center mt-6">
            <p className="text-purple-300 text-xs mb-2">Easter egg unlocked!</p>
            <p className="text-purple-400 text-2xl">🎉</p>
          </div>
        </div>

        <button
          onClick={closeSecretSettings}
          className="w-full mt-6 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
        >
          Close Secret Settings
        </button>
      </div>
    </div>
  );
}
