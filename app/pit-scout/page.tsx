'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEvent } from '@/context/EventContext';
import { Navigation } from '@/components/Navigation';
import { createPitScout, getPitScout, updatePitScout, deletePitScout } from '@/lib/scouts';
import { storage } from '@/lib/appwrite';
import { ID } from 'appwrite';
import { canEditData } from '@/lib/events';

function PitScoutForm() {
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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImageIds, setExistingImageIds] = useState<string[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]); // Track images to delete
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [formData, setFormData] = useState({
    teamNumber: '',
    teamName: '',
    pitNumber: '',
    drivetrainType: '',
    robotWeight: '',
    programmingLanguage: '',
    robotStructure: '',
    strengths: '',
    weaknesses: '',
    notes: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;

      if (e.key === 'Escape') {
        setLightboxOpen(false);
      } else if (e.key === 'ArrowLeft' && lightboxIndex > 0) {
        setLightboxIndex(lightboxIndex - 1);
      } else if (e.key === 'ArrowRight' && lightboxIndex < imagePreviews.length - 1) {
        setLightboxIndex(lightboxIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, lightboxIndex, imagePreviews.length]);

  // Load existing pit scout for editing
  useEffect(() => {
    const loadPitScout = async () => {
      if (editId && user) {
        try {
          console.log('Loading pit scout:', editId);
          const pit = await getPitScout(editId);
          console.log('Loaded pit scout:', pit);

          setFormData({
            teamNumber: pit.teamNumber,
            teamName: pit.teamName || '',
            pitNumber: pit.pitNumber || '',
            drivetrainType: pit.drivetrainType || '',
            robotWeight: pit.robotWeight ? String(pit.robotWeight) : '',
            programmingLanguage: pit.programmingLanguage || '',
            robotStructure: pit.robotStructure || '',
            strengths: pit.strengths || '',
            weaknesses: pit.weaknesses || '',
            notes: pit.notes || '',
          });

          // Load existing images
          const ids: string[] = [];
          const previews: string[] = [];

          // Parse comma-separated image IDs
          if (pit.imageId && pit.imageId !== 'undefined' && pit.imageId.trim() !== '') {
            // Split by comma and filter out empty strings and 'undefined'
            const imageIdArray = pit.imageId
              .split(',')
              .map(id => id.trim())
              .filter(id => id && id !== 'undefined' && id !== '' && id.length > 0);

            // Validate that IDs look like Appwrite IDs (alphanumeric, usually 20 chars)
            const validIds = imageIdArray.filter(id => /^[a-zA-Z0-9_-]+$/.test(id) && id.length >= 10);

            if (validIds.length > 0) {
              ids.push(...validIds);
              console.log('Valid image IDs:', validIds);

              // Generate preview URLs only for valid IDs
              validIds.forEach(id => {
                const imageUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/pit_scout_images/files/${id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
                previews.push(imageUrl);
              });
            } else {
              console.log('No valid image IDs found');
            }
          }

          setExistingImageIds(ids);
          setImagePreviews(previews);
        } catch (err: any) {
          console.error('Error loading pit scout:', err);
          setError('Failed to load pit scout: ' + (err.message || 'Unknown error'));
          // If pit scout doesn't exist, redirect back to pits page
          if (err.code === 404 || err.message?.includes('not found')) {
            setTimeout(() => router.push('/pits'), 2000);
          }
        }
      }
    };
    loadPitScout();
  }, [editId, user, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    let hasError = false;

    Array.from(files).forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files');
        hasError = true;
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5000000) {
        setError('Each image must be smaller than 5MB');
        hasError = true;
        return;
      }
      newFiles.push(file);
    });

    if (hasError) return;

    // Create previews for all new files
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setImageFiles(prev => [...prev, ...newFiles]);
    setError('');
  };

  const handleRemoveImage = (index: number) => {
    // If removing an existing image (not a newly added file), track it for deletion
    if (index < existingImageIds.length) {
      const imageIdToRemove = existingImageIds[index];
      setRemovedImageIds(prev => [...prev, imageIdToRemove]);
      setExistingImageIds(prev => prev.filter((_, i) => i !== index));
    } else {
      // Removing a newly added file (not yet uploaded)
      const fileIndex = index - existingImageIds.length;
      setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }

    // Remove preview
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDelete = async () => {
    if (!editId) return;

    if (!currentEvent || !user) return;

    // Check if user has permission to delete data
    if (!canEditData(currentEvent, user.$id)) {
      setError('You do not have permission to delete pit scouts. Your role is set to Viewer.');
      return;
    }

    const confirmed = confirm('Are you sure you want to delete this pit scout? This action cannot be undone.');
    if (!confirmed) return;

    try {
      setDeleting(true);
      setError('');

      // Delete all images from storage
      const pit = await getPitScout(editId);
      const imageIdsToDelete: string[] = [];

      // Parse comma-separated image IDs
      if (pit.imageId) {
        const ids = pit.imageId.split(',').filter(id => id.trim());
        imageIdsToDelete.push(...ids);
      }

      // Delete all images
      for (const imageId of imageIdsToDelete) {
        try {
          await storage.deleteFile('pit_scout_images', imageId);
        } catch (imgError) {
          console.error('Failed to delete image:', imgError);
          // Continue with other deletions even if one fails
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

    // Check if user has permission to edit data
    if (!canEditData(currentEvent, user.$id)) {
      setError('You do not have permission to create or edit pit scouts. Your role is set to Viewer.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess(false);

      // Delete removed images from storage when editing
      if (editId && removedImageIds.length > 0) {
        for (const imageId of removedImageIds) {
          try {
            await storage.deleteFile('pit_scout_images', imageId);
          } catch (deleteError) {
            console.error('Failed to delete image:', deleteError);
            // Continue even if deletion fails
          }
        }
      }

      const allImageIds: string[] = [...existingImageIds];

      // Upload new images if provided
      if (imageFiles.length > 0) {
        setUploading(true);
        try {
          for (const file of imageFiles) {
            const fileId = ID.unique();
            await storage.createFile('pit_scout_images', fileId, file);
            allImageIds.push(fileId);
          }
        } catch (uploadError: any) {
          setError('Failed to upload images: ' + uploadError.message);
          setSubmitting(false);
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      // Build scout data - only include imageId if we have valid IDs
      const scoutData: any = {
        eventId: currentEvent.$id,
        userId: user.$id,
        teamNumber: formData.teamNumber,
        teamName: formData.teamName,
        pitNumber: formData.pitNumber,
        drivetrainType: formData.drivetrainType,
        programmingLanguage: formData.programmingLanguage,
        robotWeight: formData.robotWeight ? parseFloat(formData.robotWeight) : 0,
        robotStructure: formData.robotStructure,
        strengths: formData.strengths,
        weaknesses: formData.weaknesses,
        notes: formData.notes,
      };

      // Only add imageId if we have valid image IDs
      if (allImageIds.length > 0) {
        scoutData.imageId = allImageIds.join(',');
      } else if (editId) {
        // When editing and removing all images, explicitly set to empty string
        scoutData.imageId = '';
      }

      if (editId) {
        // Update existing pit scout
        await updatePitScout(editId, scoutData, user.$id, user.name || user.email);
      } else {
        // Create new pit scout
        await createPitScout(scoutData, user.$id, user.name || user.email);
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

  const userCanEdit = currentEvent ? canEditData(currentEvent, user.$id) : true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-amber-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-amber-950/20">
      <Navigation />

      {/* Main Content with proper padding for sidebar and bottom nav */}
      <main className="lg:pl-64 pb-20 lg:pb-8">
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => router.push('/pits')}
            className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Pits
          </button>

          {/* Modern Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-amber-600 dark:from-blue-400 dark:to-amber-400 bg-clip-text text-transparent">
                  {editId ? 'Edit Pit Scout' : 'New Pit Scout'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {editId ? 'Update robot specifications and team information' : 'Document robot specifications and team information'}
                </p>
              </div>
            </div>
          </div>

          {/* Viewer Role Warning */}
          {currentEvent && !userCanEdit && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👁️</span>
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-100">Viewer Role - Read Only Access</h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    You have view-only access to this event. Contact the event owner to change your role if you need to create or edit scouts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Event Warning */}
          {!currentEvent && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-l-4 border-amber-500 rounded-xl p-5 mb-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-amber-800 dark:text-amber-200 font-medium">
                  Please select an event from the sidebar before creating a scout report
                </p>
              </div>
            </div>
          )}

          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <fieldset disabled={!userCanEdit} className="space-y-8">
                {/* Success Message */}
                {success && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-l-4 border-green-500 rounded-xl p-5 shadow-sm animate-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-green-800 dark:text-green-200 font-medium">
                        {editId ? 'Pit scout updated successfully!' : 'Pit scout submitted successfully!'} Redirecting...
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-l-4 border-red-500 rounded-xl p-5 shadow-sm animate-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <p className="text-red-800 dark:text-red-200 font-medium">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {/* Team Information */}
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Team Information
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label htmlFor="teamNumber" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Team Number *
                      </label>
                      <input
                        type="text"
                        id="teamNumber"
                        required
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
                        placeholder="e.g., 12345"
                        value={formData.teamNumber}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow numbers
                          if (value === '' || /^\d+$/.test(value)) {
                            setFormData({ ...formData, teamNumber: value });
                          }
                        }}
                      />
                    </div>

                    <div className="group">
                      <label htmlFor="teamName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Team Name
                      </label>
                      <input
                        type="text"
                        id="teamName"
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
                        placeholder="e.g., RoboWarriors"
                        value={formData.teamName}
                        onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                      />
                    </div>

                    <div className="group">
                      <label htmlFor="pitNumber" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Pit Number
                      </label>
                      <input
                        type="text"
                        id="pitNumber"
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
                        placeholder="e.g., A12, B3, C5"
                        value={formData.pitNumber}
                        onChange={(e) => setFormData({ ...formData, pitNumber: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Robot Specifications */}
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Robot Specifications
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label htmlFor="drivetrainType" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Drivetrain Type
                      </label>
                      <select
                        id="drivetrainType"
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer"
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

                    <div className="group">
                      <label htmlFor="robotWeight" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Weight (lbs)
                      </label>
                      <input
                        type="text"
                        id="robotWeight"
                        inputMode="decimal"
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
                        placeholder="e.g., 40.5"
                        value={formData.robotWeight}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty, numbers, and decimal point
                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            setFormData({ ...formData, robotWeight: value });
                          }
                        }}
                      />
                    </div>

                    <div className="md:col-span-2 group">
                      <label htmlFor="programmingLanguage" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Programming Language
                      </label>
                      <select
                        id="programmingLanguage"
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer"
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

                    <div className="md:col-span-2 group">
                      <label htmlFor="robotStructure" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        🏗️ Robot Structure Description
                      </label>
                      <textarea
                        id="robotStructure"
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 resize-none"
                        placeholder="Describe the robot's structure, design, mechanisms, subsystems, etc..."
                        value={formData.robotStructure}
                        onChange={(e) => setFormData({ ...formData, robotStructure: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label htmlFor="strengths" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      💪 Strengths
                    </label>
                    <textarea
                      id="strengths"
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-400 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 resize-none"
                      placeholder="What does this robot do well?"
                      value={formData.strengths}
                      onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                    />
                  </div>
                  <div className="group">
                    <label htmlFor="weaknesses" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      ⚠️ Weaknesses
                    </label>
                    <textarea
                      id="weaknesses"
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:focus:ring-orange-400 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 resize-none"
                      placeholder="What are potential areas of concern?"
                      value={formData.weaknesses}
                      onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                    />
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="group">
                  <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📝 Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 resize-none"
                    placeholder="Any other observations or comments..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                {/* Robot Images Upload */}
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-rose-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Robot Images {imagePreviews.length > 0 && <span className="text-blue-600 dark:text-blue-400">({imagePreviews.length})</span>}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {/* Image Previews Grid */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={`img-${index}-${preview.substring(preview.length - 10)}`} className="relative group">
                            <div
                              className="cursor-pointer relative overflow-hidden rounded-lg"
                              onClick={() => {
                                setLightboxIndex(index);
                                setLightboxOpen(true);
                              }}
                            >
                              <img
                                src={preview}
                                alt={`Robot ${index + 1}`}
                                className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-700 transition-transform duration-200 group-hover:scale-105"
                                onError={(e) => {
                                  // Replace with placeholder when image fails to load
                                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="14" fill="%239ca3af"%3EImage not found%3C/text%3E%3C/svg%3E';
                                  e.currentTarget.onerror = null; // Prevent infinite loop
                                  console.warn('Failed to load image:', preview);
                                }}
                              />
                              {/* Zoom indicator */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                                <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(index);
                              }}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors opacity-0 group-hover:opacity-100 z-10"
                              title="Remove image"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Area */}
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="robot-images" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex flex-col items-center justify-center py-4">
                          <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Multiple images supported • PNG, JPG, WEBP (MAX. 5MB each)
                          </p>
                        </div>
                        <input
                          id="robot-images"
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          multiple
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>

                    {uploading && (
                      <div className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading images...
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 relative">
                  <button
                    type="submit"
                    disabled={!currentEvent || submitting || uploading || !userCanEdit}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-700 hover:to-amber-700 text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    title={!userCanEdit ? 'You do not have permission to edit (Viewer role)' : ''}
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {editId ? 'Updating...' : 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {editId ? 'Update Report' : 'Submit Report'}
                      </>
                    )}
                  </button>
                  {editId && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={submitting || deleting || !userCanEdit}
                      className="sm:w-auto bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      title={!userCanEdit ? 'You do not have permission to delete (Viewer role)' : ''}
                    >
                      {deleting ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </>
                      )}
                    </button>
                  )}
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      </main>

      {/* Image Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            title="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous button */}
          {imagePreviews.length > 1 && lightboxIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex - 1);
              }}
              className="absolute left-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              title="Previous"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div className="max-w-7xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={imagePreviews[lightboxIndex]}
              alt={`Robot ${lightboxIndex + 1}`}
              className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
            />
            {/* Image counter */}
            {imagePreviews.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium">
                {lightboxIndex + 1} / {imagePreviews.length}
              </div>
            )}
          </div>

          {/* Next button */}
          {imagePreviews.length > 1 && lightboxIndex < imagePreviews.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex + 1);
              }}
              className="absolute right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              title="Next"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function PitScoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <PitScoutForm />
    </Suspense>
  );
}
