'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEvent } from '@/context/EventContext';
import { Navigation } from '@/components/Navigation';
import { createMatchScout } from '@/lib/scouts';

export default function MatchScoutPage() {
  const { user, loading } = useAuth();
  const { currentEvent } = useEvent();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    matchNumber: '',
    teamNumber: '',
    alliance: 'red' as 'red' | 'blue',
    autoScore: 0,
    teleopScore: 0,
    endgameScore: 0,
    fouls: 0,
    defense: 5,
    notes: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentEvent) {
      setError('Please select an event first');
      return;
    }

    if (!user) {
      setError('You must be logged in');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess(false);

      await createMatchScout({
        eventId: currentEvent.$id,
        userId: user.$id,
        teamNumber: formData.teamNumber,
        matchNumber: formData.matchNumber,
        alliance: formData.alliance,
        autoScore: formData.autoScore,
        teleopScore: formData.teleopScore,
        endgameScore: formData.endgameScore,
        fouls: formData.fouls,
        defense: formData.defense,
        notes: formData.notes,
      });

      setSuccess(true);
      // Reset form
      setFormData({
        matchNumber: '',
        teamNumber: '',
        alliance: 'red',
        autoScore: 0,
        teleopScore: 0,
        endgameScore: 0,
        fouls: 0,
        defense: 5,
        notes: '',
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit match scout');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />

      {/* Main Content with proper padding for sidebar and bottom nav */}
      <main className="lg:pl-64 pb-20 lg:pb-8">
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Match Scout Report
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Record match performance and data
          </p>
        </div>

        {/* Event Warning */}
        {!currentEvent && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
            <p className="text-amber-800 dark:text-amber-200">
              ⚠️ Please select an event from the sidebar before creating a scout report.
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Success Message */}
            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-200">
                  ✓ Match scout submitted successfully! Redirecting to dashboard...
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
            )}

            {/* Match Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Match Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="matchNumber" className="block text-sm font-medium mb-2">
                    Match Number *
                  </label>
                  <input
                    type="text"
                    id="matchNumber"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Q12, SF1, F1"
                    value={formData.matchNumber}
                    onChange={(e) => setFormData({ ...formData, matchNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="teamNumber" className="block text-sm font-medium mb-2">
                    Team Number *
                  </label>
                  <input
                    type="text"
                    id="teamNumber"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 12345"
                    value={formData.teamNumber}
                    onChange={(e) => setFormData({ ...formData, teamNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="alliance" className="block text-sm font-medium mb-2">
                    Alliance Color *
                  </label>
                  <select
                    id="alliance"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.alliance}
                    onChange={(e) => setFormData({ ...formData, alliance: e.target.value as 'red' | 'blue' })}
                  >
                    <option value="red">Red Alliance</option>
                    <option value="blue">Blue Alliance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Performance Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="autoScore" className="block text-sm font-medium mb-2">
                    Autonomous Score
                  </label>
                  <input
                    type="number"
                    id="autoScore"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    value={formData.autoScore}
                    onChange={(e) => setFormData({ ...formData, autoScore: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label htmlFor="teleopScore" className="block text-sm font-medium mb-2">
                    TeleOp Score
                  </label>
                  <input
                    type="number"
                    id="teleopScore"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    value={formData.teleopScore}
                    onChange={(e) => setFormData({ ...formData, teleopScore: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label htmlFor="endgameScore" className="block text-sm font-medium mb-2">
                    Endgame Points
                  </label>
                  <input
                    type="number"
                    id="endgameScore"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    value={formData.endgameScore}
                    onChange={(e) => setFormData({ ...formData, endgameScore: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-2">
                Additional Notes
              </label>
              <textarea
                id="notes"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Record any observations, strategies, or notable events..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={!currentEvent || submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                disabled={submitting}
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
        </div>
      </main>
    </div>
  );
}
