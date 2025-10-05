'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navigation } from '@/components/Navigation';

export default function PitScoutPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    teamNumber: '',
    teamName: '',
    driveType: '',
    weight: '',
    dimensions: '',
    programmingLanguage: '',
    controlSystem: '',
    robotCapabilities: '',
    notes: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement save to database
    console.log('Pit Scout Data:', formData);
    alert('Pit scout submitted! (Database integration coming soon)');
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

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                  <label htmlFor="driveType" className="block text-sm font-medium mb-2">
                    Drive Type
                  </label>
                  <select
                    id="driveType"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.driveType}
                    onChange={(e) => setFormData({ ...formData, driveType: e.target.value })}
                  >
                    <option value="">Select drive type</option>
                    <option value="mecanum">Mecanum</option>
                    <option value="tank">Tank</option>
                    <option value="omni">Omni</option>
                    <option value="swerve">Swerve</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="weight" className="block text-sm font-medium mb-2">
                    Weight (lbs)
                  </label>
                  <input
                    type="number"
                    id="weight"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 40"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="dimensions" className="block text-sm font-medium mb-2">
                    Dimensions (LxWxH)
                  </label>
                  <input
                    type="text"
                    id="dimensions"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 18x18x18"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  />
                </div>

                <div>
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

                <div className="md:col-span-2">
                  <label htmlFor="controlSystem" className="block text-sm font-medium mb-2">
                    Control System
                  </label>
                  <input
                    type="text"
                    id="controlSystem"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., REV Control Hub"
                    value={formData.controlSystem}
                    onChange={(e) => setFormData({ ...formData, controlSystem: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Robot Capabilities */}
            <div>
              <label htmlFor="robotCapabilities" className="block text-sm font-medium mb-2">
                Robot Capabilities
              </label>
              <textarea
                id="robotCapabilities"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what the robot can do (scoring, autonomous, special features)..."
                value={formData.robotCapabilities}
                onChange={(e) => setFormData({ ...formData, robotCapabilities: e.target.value })}
              />
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
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors touch-manipulation"
              >
                Submit Report
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors touch-manipulation"
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
