'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEvent } from '@/context/EventContext';
import { Navigation } from '@/components/Navigation';
import { createPitScout } from '@/lib/scouts';

export default function PitScoutPage() {
  const { user, loading } = useAuth();
  const { currentEvent } = useEvent();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    teamNumber: '',
    teamName: '',
    drivetrainType: '',
    robotWeight: 0,
    programmingLanguage: '',
    strengths: '',
    weaknesses: '',
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

      await createPitScout({
        eventId: currentEvent.$id,
        userId: user.$id,
        teamNumber: formData.teamNumber,
        teamName: formData.teamName,
        drivetrainType: formData.drivetrainType,
        programmingLanguage: formData.programmingLanguage,
        robotWeight: formData.robotWeight,
        strengths: formData.strengths,
        weaknesses: formData.weaknesses,
        notes: formData.notes,
      });

      setSuccess(true);
      // Reset form
      setFormData({
        teamNumber: '',
        teamName: '',
        drivetrainType: '',
        robotWeight: 0,
        programmingLanguage: '',
        strengths: '',
        weaknesses: '',
        notes: '',
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit pit scout');
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
            Pit Scout Report
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Document robot specifications and team information
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
                  ✓ Pit scout submitted successfully! Redirecting to dashboard...
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

            {/* Team Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Team Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label htmlFor="teamName" className="block text-sm font-medium mb-2">
                    Team Name
                  </label>
                  <input
                    type="text"
                    id="teamName"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., RoboWarriors"
                    value={formData.teamName}
                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Robot Specifications */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Robot Specifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="drivetrainType" className="block text-sm font-medium mb-2">
                    Drivetrain Type
                  </label>
                  <select
                    id="drivetrainType"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.drivetrainType}
                    onChange={(e) => setFormData({ ...formData, drivetrainType: e.target.value })}
                  >
                    <option value="">Select drivetrain type</option>
                    <option value="mecanum">Mecanum</option>
                    <option value="tank">Tank</option>
                    <option value="omni">Omni</option>
                    <option value="swerve">Swerve</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="robotWeight" className="block text-sm font-medium mb-2">
                    Weight (lbs)
                  </label>
                  <input
                    type="number"
                    id="robotWeight"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 40"
                    value={formData.robotWeight}
                    onChange={(e) => setFormData({ ...formData, robotWeight: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="programmingLanguage" className="block text-sm font-medium mb-2">
                    Programming Language
                  </label>
                  <select
                    id="programmingLanguage"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.programmingLanguage}
                    onChange={(e) => setFormData({ ...formData, programmingLanguage: e.target.value })}
                  >
                    <option value="">Select language</option>
                    <option value="java">Java</option>
                    <option value="blocks">Blocks</option>
                    <option value="onbot">OnBot Java</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="strengths" className="block text-sm font-medium mb-2">
                  Strengths
                </label>
                <textarea
                  id="strengths"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What does this robot do well?"
                  value={formData.strengths}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="weaknesses" className="block text-sm font-medium mb-2">
                  Weaknesses
                </label>
                <textarea
                  id="weaknesses"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What are potential areas of concern?"
                  value={formData.weaknesses}
                  onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-2">
                Additional Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any other observations or comments..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={!currentEvent || submitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
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
