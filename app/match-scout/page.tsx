'use client';

import { createT } from '@/lib/simple-i18n';
const t = createT('match-scout/page')
import { Suspense, useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEvent } from '@/context/EventContext';
import { Navigation } from '@/components/Navigation';
import { createMatchScout } from '@/lib/scouts';
import { databases } from '@/lib/appwrite';
import { canEditData } from '@/lib/events';

function MatchScoutForm() {
  const { user, loading } = useAuth();
  const { currentEvent } = useEvent();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [formData, setFormData] = useState({
    matchNumber: '',
    teamNumber: '',
    alliance: '' as '' | 'red' | 'blue',
    randomization: '' as '' | 'GPP' | 'PGP' | 'PPG',
    // AUTO Period
    overflowArtifactsAuto: 0,
    classifiedArtifactsAuto: 0,
    gatesAuto: {} as Record<number, 'NONE' | 'GREEN' | 'PURPLE'>,
    robotLeave: false,
    // TELEOP Period
    depotArtifacts: 0,
    overflowArtifactsTeleop: 0,
    classifiedArtifactsTeleop: 0,
    gatesTeleop: {} as Record<number, 'NONE' | 'GREEN' | 'PURPLE'>,
    robotBase: 'NONE' as 'NONE' | 'PARTIAL' | 'FULL',
    // Fouls
    minorFouls: 0,
    majorFouls: 0,
    notes: '',
  });

  // Score calculation function
  const calculateScores = useMemo(() => {
    // Helper function to calculate gate bonus based on motif
    const calculateGateBonus = (gates: Record<number, 'NONE' | 'GREEN' | 'PURPLE'>, motif: 'GPP' | 'PGP' | 'PPG' | '') => {
      if (!motif) return 0;

      const motifPattern = motif.split(''); // ['G', 'P', 'P']
      let bonus = 0;

      // Each gate is checked sequentially against the motif pattern
      // Gate 1 vs motif[0], Gate 2 vs motif[1], Gate 3 vs motif[2]
      // Gate 4 vs motif[0], Gate 5 vs motif[1], Gate 6 vs motif[2]
      // Gate 7 vs motif[0], Gate 8 vs motif[1], Gate 9 vs motif[2]
      for (let i = 1; i <= 9; i++) {
        const gateValue = gates[i];
        if (!gateValue || gateValue === 'NONE') continue;

        const motifIndex = (i - 1) % 3; // Cycles through 0, 1, 2
        const expectedColor = motifPattern[motifIndex] === t('G') ? 'GREEN' : 'PURPLE';

        if (gateValue === expectedColor) {
          bonus += 2; // 2 points for each correct gate
        }
      }

      return bonus;
    };

    // Calculate AUTO score
    const autoOverflow = formData.overflowArtifactsAuto * 1;
    const autoClassified = formData.classifiedArtifactsAuto * 3;
    const autoGateBonus = calculateGateBonus(formData.gatesAuto, formData.randomization);
    const autoLeaveBonus = formData.robotLeave ? 3 : 0;
    const autoScore = autoOverflow + autoClassified + autoGateBonus + autoLeaveBonus;

    // Calculate TELEOP score
    const teleopDepot = formData.depotArtifacts * 1;
    const teleopOverflow = formData.overflowArtifactsTeleop * 1;
    const teleopClassified = formData.classifiedArtifactsTeleop * 3;
    const teleopGateBonus = calculateGateBonus(formData.gatesTeleop, formData.randomization);
    const teleopBaseBonus = formData.robotBase === 'FULL' ? 10 : formData.robotBase === 'PARTIAL' ? 5 : 0;
    const teleopScore = teleopDepot + teleopOverflow + teleopClassified + teleopGateBonus + teleopBaseBonus;

    // Calculate penalties
    const penalties = (formData.minorFouls * -5) + (formData.majorFouls * -10);

    // Total score
    const totalScore = autoScore + teleopScore + penalties;

    return { autoScore, teleopScore, totalScore, penalties };
  }, [
    formData.overflowArtifactsAuto,
    formData.classifiedArtifactsAuto,
    formData.gatesAuto,
    formData.robotLeave,
    formData.depotArtifacts,
    formData.overflowArtifactsTeleop,
    formData.classifiedArtifactsTeleop,
    formData.gatesTeleop,
    formData.robotBase,
    formData.minorFouls,
    formData.majorFouls,
    formData.randomization,
  ]);

  // Load existing match scout for editing
  useEffect(() => {
    const loadMatchScout = async () => {
      if (!editId) return;

      setLoadingMatch(true);
      try {
        const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'ftclivescout_db';
        const match = await databases.getDocument(DATABASE_ID, 'match_scouts', editId);

        // Parse gates data
        const gatesAuto = match.gatesAuto ? JSON.parse(match.gatesAuto) : {};
        const gatesTeleop = match.gatesTeleop ? JSON.parse(match.gatesTeleop) : {};

        setFormData({
          matchNumber: match.matchNumber,
          teamNumber: match.teamNumber,
          alliance: match.alliance,
          randomization: match.randomization || '',
          overflowArtifactsAuto: match.overflowArtifactsAuto || 0,
          classifiedArtifactsAuto: match.classifiedArtifactsAuto || 0,
          gatesAuto: gatesAuto,
          robotLeave: match.robotLeave || false,
          depotArtifacts: match.depotArtifacts || 0,
          overflowArtifactsTeleop: match.overflowArtifactsTeleop || 0,
          classifiedArtifactsTeleop: match.classifiedArtifactsTeleop || 0,
          gatesTeleop: gatesTeleop,
          robotBase: match.robotBase || 'NONE',
          minorFouls: match.minorFouls || 0,
          majorFouls: match.majorFouls || 0,
          notes: match.notes || '',
        });
      } catch (err: any) {
        setError(t('Failed to load match scout: ') + err.message);
      } finally {
        setLoadingMatch(false);
      }
    };

    loadMatchScout();
  }, [editId]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentEvent) {
      setError(t('Please select an event first'));
      return;
    }

    if (!user) {
      setError(t('You must be logged in'));
      return;
    }

    // Check if user has permission to edit data
    if (!canEditData(currentEvent, user.$id)) {
      setError(t(
        'You do not have permission to create or edit match scouts. Your role is set to Viewer.'
      ));
      return;
    }

    if (!formData.alliance) {
      setError(t('Please select an alliance color'));
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess(false);

      const scoutData = {
        eventId: currentEvent.$id,
        userId: user.$id,
        teamNumber: formData.teamNumber,
        matchNumber: formData.matchNumber,
        alliance: formData.alliance as 'red' | 'blue',
        randomization: formData.randomization || undefined,
        overflowArtifactsAuto: formData.overflowArtifactsAuto,
        classifiedArtifactsAuto: formData.classifiedArtifactsAuto,
        gatesAuto: JSON.stringify(formData.gatesAuto),
        robotLeave: formData.robotLeave,
        depotArtifacts: formData.depotArtifacts,
        overflowArtifactsTeleop: formData.overflowArtifactsTeleop,
        classifiedArtifactsTeleop: formData.classifiedArtifactsTeleop,
        gatesTeleop: JSON.stringify(formData.gatesTeleop),
        robotBase: formData.robotBase,
        minorFouls: formData.minorFouls,
        majorFouls: formData.majorFouls,
        notes: formData.notes,
        // Include calculated scores
        autoScore: calculateScores.autoScore,
        teleopScore: calculateScores.teleopScore,
        totalScore: calculateScores.totalScore,
        endgameScore: 0, // Not used in DECODE 2025-26 season
        fouls: (formData.minorFouls || 0) + (formData.majorFouls || 0), // Total fouls count
        defense: 0, // Not tracked in DECODE 2025-26 season
      };

      if (editId) {
        // Update existing match scout - inline update with user tracking
        const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'ftclivescout_db';
        await databases.updateDocument(DATABASE_ID, 'match_scouts', editId, {
          ...scoutData,
          lastEditedBy: user.$id,
          lastEditedByName: user.name || user.email,
          lastEditedAt: new Date().toISOString(),
        });
      } else {
        // Create new match scout
        await createMatchScout(scoutData, user.$id, user.name || user.email);
      }

      setSuccess(true);
      // Reset form
      setFormData({
        matchNumber: '',
        teamNumber: '',
        alliance: 'red',
        randomization: '',
        overflowArtifactsAuto: 0,
        classifiedArtifactsAuto: 0,
        gatesAuto: {},
        robotLeave: false,
        depotArtifacts: 0,
        overflowArtifactsTeleop: 0,
        classifiedArtifactsTeleop: 0,
        gatesTeleop: {},
        robotBase: 'NONE',
        minorFouls: 0,
        majorFouls: 0,
        notes: '',
      });

      // Redirect to matches page after a short delay
      setTimeout(() => {
        router.push('/matches');
      }, 1500);
    } catch (err: any) {
      setError(err.message || t('Failed to submit match scout'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editId) return;

    if (!currentEvent || !user) return;

    // Check if user has permission to delete data
    if (!canEditData(currentEvent, user.$id)) {
      setError(t(
        'You do not have permission to delete match scouts. Your role is set to Viewer.'
      ));
      return;
    }

    const confirmed = window.confirm(t(
      'Are you sure you want to delete this match scout? This action cannot be undone.'
    ));
    if (!confirmed) return;

    try {
      setDeleting(true);
      setError('');

      const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'ftclivescout_db';
      await databases.deleteDocument(DATABASE_ID, 'match_scouts', editId);

      // Redirect to matches page
      router.push('/matches');
    } catch (err: any) {
      setError(err.message || t('Failed to delete match scout'));
      setDeleting(false);
    }
  };

  if (loading || loadingMatch) {
    return (
      (<div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{loadingMatch ? t('Loading match data...') : t('Loading...')}</div>
      </div>)
    );
  }

  if (!user) {
    return null;
  }

  const userCanEdit = currentEvent ? canEditData(currentEvent, user.$id) : true;

  return (
    (<div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />
      {/* Main Content with proper padding for sidebar and bottom nav */}
      <main className="lg:pl-64 pb-20 lg:pb-8">
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => router.push('/matches')}
            className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('Back to Matches')}
          </button>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {editId ? t('Edit Match Scout') : t('Add Match Scout')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {editId ? t('Update match performance and data') : t('Record match performance and data')}
            </p>
          </div>

          {/* Viewer Role Warning */}
          {currentEvent && !userCanEdit && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👁️</span>
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-100">{t('Viewer Role - Read Only Access')}</h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {t(
                      'You have view-only access to this event. Contact the event owner to change your role if you need to create or edit scouts.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Event Warning */}
          {!currentEvent && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
              <p className="text-amber-800 dark:text-amber-200">
                {t(
                  '⚠️ Please select an event from the sidebar before creating a scout report.'
                )}
              </p>
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <fieldset disabled={!userCanEdit} className="space-y-6">
                {/* Success Message */}
                {success && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-green-800 dark:text-green-200">✓ {t('Match scout')} {editId ? t('updated') : t('submitted')} {t('successfully! Redirecting to matches...')}</p>
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
                    {t('Match Information')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="matchNumber" className="block text-sm font-medium mb-2">
                        {t('Match Number *')}
                      </label>
                      <input
                        type="text"
                        id="matchNumber"
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
                        placeholder="e.g., Q12, SF1, F1"
                        value={formData.matchNumber}
                        onChange={(e) => setFormData({ ...formData, matchNumber: e.target.value })}
                      />
                    </div>

                    <div>
                      <label htmlFor="teamNumber" className="block text-sm font-medium mb-2">
                        {t('Team Number *')}
                      </label>
                      <input
                        type="text"
                        id="teamNumber"
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
                        placeholder="e.g., 12345"
                        value={formData.teamNumber}
                        onChange={(e) => setFormData({ ...formData, teamNumber: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3">
                        {t('Alliance Color *')}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, alliance: 'red' })}
                          className={`px-6 py-4 rounded-xl font-semibold text-white transition-all duration-200 ${formData.alliance === 'red'
                            ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-lg scale-105 ring-4 ring-red-500/30'
                            : 'bg-gray-300 dark:bg-gray-700 hover:bg-red-400 dark:hover:bg-red-600 opacity-60 hover:opacity-100'
                            } disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none`}
                        >
                          {t('🔴 Red Alliance')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, alliance: 'blue' })}
                          className={`px-6 py-4 rounded-xl font-semibold text-white transition-all duration-200 ${formData.alliance === 'blue'
                            ? 'bg-gradient-to-br from-blue-500 to-amber-600 shadow-lg scale-105 ring-4 ring-blue-500/30'
                            : 'bg-gray-300 dark:bg-gray-700 hover:bg-blue-400 dark:hover:bg-blue-600 opacity-60 hover:opacity-100'
                            } disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none`}
                        >
                          {t('🔵 Blue Alliance')}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3">
                        {t('Randomization (Motif Selection)')}
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, randomization: 'GPP' })}
                          className={`px-4 py-4 rounded-xl font-semibold transition-all duration-200 ${formData.randomization === 'GPP'
                            ? 'bg-gradient-to-br from-blue-500 to-amber-600 text-white shadow-lg scale-105 ring-4 ring-blue-500/30'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300'
                            }`}
                        >
                          <span className="text-2xl block mb-1">🟢 🟣 🟣</span>
                          <div className="text-sm">GPP</div>
                          <div className="text-xs opacity-75">{t('Motif 1 (ID 21)')}</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, randomization: 'PGP' })}
                          className={`px-4 py-4 rounded-xl font-semibold transition-all duration-200 ${formData.randomization === 'PGP'
                            ? 'bg-gradient-to-br from-amber-500 to-rose-600 text-white shadow-lg scale-105 ring-4 ring-amber-500/30'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900 hover:text-amber-700 dark:hover:text-amber-300'
                            }`}
                        >
                          <span className="text-2xl block mb-1">🟣 🟢 🟣</span>
                          <div className="text-sm">PGP</div>
                          <div className="text-xs opacity-75">{t('Motif 2 (ID 22)')}</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, randomization: 'PPG' })}
                          className={`px-4 py-4 rounded-xl font-semibold transition-all duration-200 ${formData.randomization === 'PPG'
                            ? 'bg-gradient-to-br from-amber-500 to-blue-600 text-white shadow-lg scale-105 ring-4 ring-amber-500/30'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900 hover:text-amber-700 dark:hover:text-amber-300'
                            }`}
                        >
                          <span className="text-2xl block mb-1">🟣 🟣 🟢</span>
                          <div className="text-sm">PPG</div>
                          <div className="text-xs opacity-75">{t('Motif 3 (ID 23)')}</div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Score Display - Compact */}
                <div className="relative overflow-hidden rounded-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-amber-600 to-blue-600 dark:from-blue-700 dark:via-amber-700 dark:to-blue-700 rounded-xl"></div>

                  <div className="relative p-4 border-2 border-white/20 shadow-xl rounded-xl">
                    <div className="flex items-center justify-between gap-4">
                      {/* Trophy and Total */}
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🏆</span>
                        <div>
                          <div className="text-xs font-semibold text-white/80 uppercase tracking-wide">{t('Total Score')}</div>
                          <div className="text-4xl font-black text-white">{calculateScores.totalScore}</div>
                        </div>
                      </div>

                      {/* Score Breakdown */}
                      <div className="flex items-center gap-2 text-white">
                        <div className="text-center">
                          <div className="text-xs opacity-80">{t('Auto')}</div>
                          <div className="text-xl font-bold">{calculateScores.autoScore}</div>
                        </div>
                        <div className="text-lg opacity-60">+</div>
                        <div className="text-center">
                          <div className="text-xs opacity-80">{t('Teleop')}</div>
                          <div className="text-xl font-bold">{calculateScores.teleopScore}</div>
                        </div>
                        {calculateScores.penalties !== 0 && (
                          <>
                            <div className="text-lg opacity-60">−</div>
                            <div className="text-center bg-red-500/30 rounded px-2 py-1">
                              <div className="text-xs opacity-80">{t('Penalties')}</div>
                              <div className="text-xl font-bold">{Math.abs(calculateScores.penalties)}</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AUTO Period */}
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="text-2xl">🤖</span> {t('AUTO Period')}
                    </h2>
                    <div className="bg-blue-500 dark:bg-blue-600 text-white px-6 py-3 rounded-lg">
                      <div className="text-xs font-medium opacity-90">AUTO SCORE</div>
                      <div className="text-3xl font-bold">{calculateScores.autoScore}</div>
                    </div>
                  </div>

                  {/* Artifacts */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{t('Artifacts')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('Overflow Artifacts')}</label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, overflowArtifactsAuto: Math.max(0, formData.overflowArtifactsAuto - 1) })}
                            className="w-12 h-12 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-md"
                          >
                            −
                          </button>
                          <div className="flex-1 text-center">
                            <div className="text-4xl font-bold text-gray-900 dark:text-white">{formData.overflowArtifactsAuto}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, overflowArtifactsAuto: formData.overflowArtifactsAuto + 1 })}
                            className="w-12 h-12 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-md"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('Classified Artifacts')}</label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, classifiedArtifactsAuto: Math.max(0, formData.classifiedArtifactsAuto - 1) })}
                            className="w-12 h-12 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-md"
                          >
                            −
                          </button>
                          <div className="flex-1 text-center">
                            <div className="text-4xl font-bold text-gray-900 dark:text-white">{formData.classifiedArtifactsAuto}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, classifiedArtifactsAuto: formData.classifiedArtifactsAuto + 1 })}
                            className="w-12 h-12 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-md"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gates Grid */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{t('Gates (1-9)')}</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-700 overflow-hidden">
                      {/* Header Row */}
                      <div className="grid grid-cols-4 border-b-2 border-gray-300 dark:border-gray-700">
                        <div className="p-3 bg-gray-100 dark:bg-gray-900 font-bold text-center border-r-2 border-gray-300 dark:border-gray-700">GATE 🎯</div>
                        <div className="p-3 bg-gray-100 dark:bg-gray-900 font-bold text-center border-r-2 border-gray-300 dark:border-gray-700">GREEN</div>
                        <div className="p-3 bg-gray-100 dark:bg-gray-900 font-bold text-center border-r-2 border-gray-300 dark:border-gray-700">PURPLE</div>
                        <div className="p-3 bg-gray-100 dark:bg-gray-900 font-bold text-center">NONE</div>
                      </div>

                      {/* Gate Rows */}
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((gateNum) => (
                        <div key={`auto-gate-${gateNum}`} className="grid grid-cols-4 border-b border-gray-200 dark:border-gray-700">
                          <div className="p-3 font-bold text-center border-r-2 border-gray-300 dark:border-gray-700 flex items-center justify-center">{gateNum}</div>
                          <div className="p-2 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, gatesAuto: { ...formData.gatesAuto, [gateNum]: 'GREEN' } })}
                              className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-xl transition-all ${formData.gatesAuto[gateNum] === 'GREEN'
                                ? 'bg-green-600 text-white shadow-lg scale-110'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-green-100 dark:hover:bg-green-900'
                                }`}
                            >
                              {t('G')}
                            </button>
                          </div>
                          <div className="p-2 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, gatesAuto: { ...formData.gatesAuto, [gateNum]: 'PURPLE' } })}
                              className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-xl transition-all ${formData.gatesAuto[gateNum] === 'PURPLE'
                                ? 'bg-blue-600 text-white shadow-lg scale-110'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-blue-100 dark:hover:bg-blue-900'
                                }`}
                            >
                              {t('P')}
                            </button>
                          </div>
                          <div className="p-2 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, gatesAuto: { ...formData.gatesAuto, [gateNum]: 'NONE' } })}
                              className={`w-14 h-14 rounded-lg flex items-center justify-center transition-all ${!formData.gatesAuto[gateNum] || formData.gatesAuto[gateNum] === 'NONE'
                                ? 'bg-gray-500 dark:bg-gray-600 shadow-lg scale-110'
                                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                              <div className="w-8 h-8 rounded-full border-4 border-white"></div>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Robot Leave */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{t('Robot Leave')}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, robotLeave: false })}
                        className={`px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${!formData.robotLeave
                          ? 'bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-lg scale-105 ring-4 ring-gray-500/30'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                      >
                        <span className="text-2xl block mb-1">❌</span>
                        {t('Stayed')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, robotLeave: true })}
                        className={`px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${formData.robotLeave
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg scale-105 ring-4 ring-green-500/30'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900 hover:text-green-700 dark:hover:text-green-300'
                          }`}
                      >
                        <span className="text-2xl block mb-1">🏃</span>
                        {t('Left Zone')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* TELEOP Period */}
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="text-2xl">🎮</span> {t('TELEOP Period')}
                    </h2>
                    <div className="bg-green-500 dark:bg-green-600 text-white px-6 py-3 rounded-lg">
                      <div className="text-xs font-medium opacity-90">TELEOP SCORE</div>
                      <div className="text-3xl font-bold">{calculateScores.teleopScore}</div>
                    </div>
                  </div>

                  {/* Artifacts */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{t('Artifacts')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('Depot Artifacts')}</label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, depotArtifacts: Math.max(0, formData.depotArtifacts - 1) })}
                            className="w-12 h-12 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-md"
                          >
                            −
                          </button>
                          <div className="flex-1 text-center">
                            <div className="text-4xl font-bold text-gray-900 dark:text-white">{formData.depotArtifacts}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, depotArtifacts: formData.depotArtifacts + 1 })}
                            className="w-12 h-12 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-md"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('Overflow Artifacts')}</label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, overflowArtifactsTeleop: Math.max(0, formData.overflowArtifactsTeleop - 1) })}
                            className="w-12 h-12 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-md"
                          >
                            −
                          </button>
                          <div className="flex-1 text-center">
                            <div className="text-4xl font-bold text-gray-900 dark:text-white">{formData.overflowArtifactsTeleop}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, overflowArtifactsTeleop: formData.overflowArtifactsTeleop + 1 })}
                            className="w-12 h-12 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-md"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('Classified Artifacts')}</label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, classifiedArtifactsTeleop: Math.max(0, formData.classifiedArtifactsTeleop - 1) })}
                            className="w-12 h-12 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-md"
                          >
                            −
                          </button>
                          <div className="flex-1 text-center">
                            <div className="text-4xl font-bold text-gray-900 dark:text-white">{formData.classifiedArtifactsTeleop}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, classifiedArtifactsTeleop: formData.classifiedArtifactsTeleop + 1 })}
                            className="w-12 h-12 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-md"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gates Grid */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{t('Gates (1-9)')}</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-700 overflow-hidden">
                      {/* Header Row */}
                      <div className="grid grid-cols-4 border-b-2 border-gray-300 dark:border-gray-700">
                        <div className="p-3 bg-gray-100 dark:bg-gray-900 font-bold text-center border-r-2 border-gray-300 dark:border-gray-700">GATE 🎯</div>
                        <div className="p-3 bg-gray-100 dark:bg-gray-900 font-bold text-center border-r-2 border-gray-300 dark:border-gray-700">GREEN</div>
                        <div className="p-3 bg-gray-100 dark:bg-gray-900 font-bold text-center border-r-2 border-gray-300 dark:border-gray-700">PURPLE</div>
                        <div className="p-3 bg-gray-100 dark:bg-gray-900 font-bold text-center">NONE</div>
                      </div>

                      {/* Gate Rows */}
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((gateNum) => (
                        <div key={`teleop-gate-${gateNum}`} className="grid grid-cols-4 border-b border-gray-200 dark:border-gray-700">
                          <div className="p-3 font-bold text-center border-r-2 border-gray-300 dark:border-gray-700 flex items-center justify-center">{gateNum}</div>
                          <div className="p-2 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, gatesTeleop: { ...formData.gatesTeleop, [gateNum]: 'GREEN' } })}
                              className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-xl transition-all ${formData.gatesTeleop[gateNum] === 'GREEN'
                                ? 'bg-green-600 text-white shadow-lg scale-110'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-green-100 dark:hover:bg-green-900'
                                }`}
                            >
                              {t('G')}
                            </button>
                          </div>
                          <div className="p-2 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, gatesTeleop: { ...formData.gatesTeleop, [gateNum]: 'PURPLE' } })}
                              className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-xl transition-all ${formData.gatesTeleop[gateNum] === 'PURPLE'
                                ? 'bg-blue-600 text-white shadow-lg scale-110'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-blue-100 dark:hover:bg-blue-900'
                                }`}
                            >
                              {t('P')}
                            </button>
                          </div>
                          <div className="p-2 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, gatesTeleop: { ...formData.gatesTeleop, [gateNum]: 'NONE' } })}
                              className={`w-14 h-14 rounded-lg flex items-center justify-center transition-all ${!formData.gatesTeleop[gateNum] || formData.gatesTeleop[gateNum] === 'NONE'
                                ? 'bg-gray-500 dark:bg-gray-600 shadow-lg scale-110'
                                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                              <div className="w-8 h-8 rounded-full border-4 border-white"></div>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Robot Base Position */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{t('Robot Base Position')}</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, robotBase: 'NONE' })}
                        className={`px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${formData.robotBase === 'NONE'
                          ? 'bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-lg scale-105 ring-4 ring-gray-500/30'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                      >
                        <span className="text-2xl block mb-1">❌</span>
                        {t('None')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, robotBase: 'PARTIAL' })}
                        className={`px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${formData.robotBase === 'PARTIAL'
                          ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg scale-105 ring-4 ring-yellow-500/30'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-yellow-100 dark:hover:bg-yellow-900 hover:text-yellow-700 dark:hover:text-yellow-300'
                          }`}
                      >
                        <span className="text-2xl block mb-1">🏗️</span>
                        {t('Partial')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, robotBase: 'FULL' })}
                        className={`px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${formData.robotBase === 'FULL'
                          ? 'bg-gradient-to-br from-blue-500 to-amber-600 text-white shadow-lg scale-105 ring-4 ring-blue-500/30'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300'
                          }`}
                      >
                        <span className="text-2xl block mb-1">🏠</span>
                        {t('Full')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Fouls */}
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">⚠️</span> {t('Fouls')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('Minor Fouls')}</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, minorFouls: Math.max(0, formData.minorFouls - 1) })}
                          className="w-12 h-12 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-md"
                        >
                          −
                        </button>
                        <div className="flex-1 text-center">
                          <div className="text-4xl font-bold text-gray-900 dark:text-white">{formData.minorFouls}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, minorFouls: formData.minorFouls + 1 })}
                          className="w-12 h-12 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-md"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('Major Fouls')}</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, majorFouls: Math.max(0, formData.majorFouls - 1) })}
                          className="w-12 h-12 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-md"
                        >
                          −
                        </button>
                        <div className="flex-1 text-center">
                          <div className="text-4xl font-bold text-gray-900 dark:text-white">{formData.majorFouls}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, majorFouls: formData.majorFouls + 1 })}
                          className="w-12 h-12 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-md"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium mb-2">
                    {t('Additional Notes')}
                  </label>
                  <textarea
                    id="notes"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('Record any observations, strategies, or notable events...')}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={!currentEvent || submitting || deleting || !userCanEdit}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!userCanEdit ? t('You do not have permission to edit (Viewer role)') : ''}
                  >
                    {submitting ? (editId ? t('Updating...') : t('Submitting...')) : (editId ? t('Update Report') : t('Submit Report'))}
                  </button>

                  {editId && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={submitting || deleting || !userCanEdit}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                      title={!userCanEdit ? t('You do not have permission to delete (Viewer role)') : ''}
                    >
                      {deleting ? t('Deleting...') : t('Delete')}
                    </button>
                  )}
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      </main>
    </div>)
  );
}

export default function MatchScoutPage() {
  return (
    (<Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('Loading...')}</p>
        </div>
      </div>
    }>
      <MatchScoutForm />
    </Suspense>)
  );
}
