'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEvent } from '@/context/EventContext';
import { Navigation } from '@/components/Navigation';
import { createPitScout, getPitScout, updatePitScout, deletePitScout } from '@/lib/scouts';
import { storage, databases } from '@/lib/appwrite';
import { ID } from 'appwrite';

export default function PitScoutPage() {
  const { user, loading } = useAuth();
  const { currentEvent } = useEvent();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [existingImageId, setExistingImageId] = useState<string | undefined>();
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

  // Load existing pit scout for editing
  useEffect(() => {
    const loadPitScout = async () => {
      if (editId && user) {
        try {
          const pit = await getPitScout(editId);
          setFormData({
            teamNumber: pit.teamNumber,
            teamName: pit.teamName,
            drivetrainType: pit.drivetrainType,
            robotWeight: pit.robotWeight,
            programmingLanguage: pit.programmingLanguage,
            strengths: pit.strengths,
            weaknesses: pit.weaknesses,
            notes: pit.notes,
          });
          if (pit.imageId) {
            setExistingImageId(pit.imageId);
            // Generate preview URL for existing image
            const imageUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/pit_scout_images/files/${pit.imageId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
            setImagePreview(imageUrl);
          }
        } catch (err: any) {
          setError('Failed to load pit scout: ' + err.message);
        }
      }
    };
    loadPitScout();
  }, [editId, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5000000) {
        setError('Image must be smaller than 5MB');
        return;
      }
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setExistingImageId(undefined);
  };

  const handleDelete = async () => {
    if (!editId) return;
    
    const confirmed = confirm('Are you sure you want to delete this pit scout? This action cannot be undone.');
    if (!confirmed) return;

    try {
      setDeleting(true);
      setError('');

      // Delete the image from storage if it exists
      const pit = await getPitScout(editId);
      if (pit.imageId) {
        try {
          await storage.deleteFile('pit_scout_images', pit.imageId);
        } catch (imgError) {
          console.error('Failed to delete image:', imgError);
          // Continue with document deletion even if image deletion fails
        }
      }

      // Delete the pit scout document
      await deletePitScout(editId);

      // Redirect to pits page
      router.push('/pits');
    } catch (err: any) {
      setError('Failed to delete pit scout: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

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

      let imageId: string | undefined = existingImageId;

      // Upload new image if provided
      if (imageFile) {
        setUploading(true);
        try {
          // Delete old image if updating
          if (editId && existingImageId) {
            try {
              await storage.deleteFile('pit_scout_images', existingImageId);
            } catch (imgError) {
              console.error('Failed to delete old image:', imgError);
            }
          }
          
          const fileId = ID.unique();
          await storage.createFile('pit_scout_images', fileId, imageFile);
          imageId = fileId;
        } catch (uploadError: any) {
          setError('Failed to upload image: ' + uploadError.message);
          setSubmitting(false);
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      const scoutData = {
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
        imageId: imageId,
      };

      if (editId) {
        // Update existing pit scout
        await updatePitScout(editId, scoutData);
      } else {
        // Create new pit scout
        await createPitScout(scoutData);
      }

      setSuccess(true);

      // Redirect to pits page after a short delay
      setTimeout(() => {
        router.push('/pits');
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
            {editId ? 'Edit Pit Scout' : 'Add Pit Scout'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {editId ? 'Update robot specifications and team information' : 'Document robot specifications and team information'}
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

            {/* Robot Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Robot Image
              </label>
              <div className="space-y-3">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Robot preview" 
                      className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-300 dark:border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                      title="Remove image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="robot-image" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, WEBP (MAX. 5MB)
                        </p>
                      </div>
                      <input 
                        id="robot-image" 
                        type="file" 
                        className="hidden" 
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                )}
                {uploading && (
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    Uploading image...
                  </div>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={!currentEvent || submitting || uploading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (editId ? 'Updating...' : 'Submitting...') : (editId ? 'Update Report' : 'Submit Report')}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={submitting || deleting}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
              <button
                type="button"
                onClick={() => router.push('/pits')}
                disabled={submitting || deleting}
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
