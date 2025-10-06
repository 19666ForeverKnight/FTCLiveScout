'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { updateName, updateEmail, updatePassword } from '@/lib/auth';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      setNewName(user.name || '');
      setNewEmail(user.email);
    }
  }, [user, loading, router]);

  const showMessage = (message: string, isError = false) => {
    if (isError) {
      setErrorMessage(message);
      setSuccessMessage('');
    } else {
      setSuccessMessage(message);
      setErrorMessage('');
    }
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 5000);
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateName(newName);
      setIsEditingName(false);
      showMessage('Name updated successfully!');
      window.location.reload();
    } catch (error: any) {
      showMessage(error?.message || 'Failed to update name', true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateEmail(newEmail, emailPassword);
      setIsEditingEmail(false);
      setEmailPassword('');
      showMessage('Email updated successfully!');
      window.location.reload();
    } catch (error: any) {
      showMessage(error?.message || 'Failed to update email. Check your password.', true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      showMessage('Password must be at least 8 characters long', true);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showMessage('New passwords do not match', true);
      return;
    }
    
    setIsLoading(true);
    try {
      await updatePassword(newPassword, oldPassword);
      setIsChangingPassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMessage('Password updated successfully!');
    } catch (error: any) {
      showMessage(error?.message || 'Failed to update password. Check your old password.', true);
    } finally {
      setIsLoading(false);
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
      {/* Main Content - Full width without sidebar */}
      <main className="min-h-screen">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/events')}
          className="mb-8 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
        >
          <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-semibold text-lg">Back to Events</span>
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Profile Settings
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage your account information and preferences
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{errorMessage}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Account Information */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Account Information
            </h2>
            
            {/* User ID */}
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                User ID
              </label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded flex-1">
                  {user.$id}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(user.$id);
                    showMessage('User ID copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-md text-sm font-medium transition-colors"
                  title="Copy User ID"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Share this ID with others to collaborate on events
              </p>
            </div>

            {/* Name */}
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Name
              </label>
              {!isEditingName ? (
                <div className="flex items-center justify-between">
                  <p className="text-base">{user.name || 'Not set'}</p>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateName} className="space-y-3">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your name"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50 touch-manipulation"
                    >
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingName(false);
                        setNewName(user.name || '');
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 touch-manipulation"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Email */}
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Email
              </label>
              {!isEditingEmail ? (
                <div className="flex items-center justify-between">
                  <p className="text-base">{user.email}</p>
                  <button
                    onClick={() => setIsEditingEmail(true)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateEmail} className="space-y-3">
                  <div>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter new email"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your current password"
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Password required to update email
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50 touch-manipulation"
                    >
                      {isLoading ? 'Updating...' : 'Update Email'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingEmail(false);
                        setNewEmail(user.email);
                        setEmailPassword('');
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 touch-manipulation"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Password
              </label>
              {!isChangingPassword ? (
                <div className="flex items-center justify-between">
                  <p className="text-base">••••••••</p>
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Change Password
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdatePassword} className="space-y-3">
                  <div>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Current password"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="New password (min. 8 characters)"
                      required
                      minLength={8}
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm new password"
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50 touch-manipulation"
                    >
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setOldPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 touch-manipulation"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
        </div>
      </main>
    </div>
  );
}
