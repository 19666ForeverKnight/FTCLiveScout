'use client';

import { createT } from '@/lib/simple-i18n';
const t = createT('analytics/page')
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEvent } from '@/context/EventContext';
import { Navigation } from '@/components/Navigation';
import { getMatchScouts, getPitScouts, MatchScout, PitScout } from '@/lib/scouts';

interface ScoreStatistics {
  mean: number;
  min: number;
  max: number;
  mode: number;
  median: number;
}

interface TeamStats {
  teamNumber: string;
  teamName?: string;
  matchCount: number;
  // Legacy average fields
  avgAutoScore: number;
  avgTeleopScore: number;
  avgTotalScore: number;
  avgEndgameScore: number;
  highestScore: number;
  lowestScore: number;
  winRate: number;
  avgDepotArtifacts: number;
  avgClassifiedArtifacts: number;
  avgOverflowArtifactsAuto: number;
  avgOverflowArtifactsTeleop: number;
  robotLeaveRate: number;
  endgamePositions: {
    none: number;
    partial: number;
    full: number;
  };
  // Statistical analysis for each score component
  totalScore: ScoreStatistics;
  autoScore: ScoreStatistics;
  teleopScore: ScoreStatistics;
  endgameScore: ScoreStatistics;
  depotArtifacts: ScoreStatistics;
  classifiedArtifacts: ScoreStatistics;
  overflowArtifactsAuto: ScoreStatistics;
  overflowArtifactsTeleop: ScoreStatistics;
}

interface AllianceStats {
  red: {
    matches: number;
    avgScore: number;
    highestScore: number;
  };
  blue: {
    matches: number;
    avgScore: number;
    highestScore: number;
  };
}

// Helper function to calculate statistics
const calculateStatistics = (values: number[]): ScoreStatistics => {
  if (values.length === 0) {
    return { mean: 0, min: 0, max: 0, mode: 0, median: 0 };
  }

  // Mean
  const mean = Math.round((values.reduce((sum, val) => sum + val, 0) / values.length) * 10) / 10;

  // Min and Max
  const min = Math.min(...values);
  const max = Math.max(...values);

  // Median
  const sortedValues = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sortedValues.length / 2);
  const median = sortedValues.length % 2 === 0
    ? Math.round(((sortedValues[mid - 1] + sortedValues[mid]) / 2) * 10) / 10
    : sortedValues[mid];

  // Mode (most frequent value)
  const frequency: { [key: number]: number } = {};
  values.forEach(val => {
    frequency[val] = (frequency[val] || 0) + 1;
  });
  const maxFreq = Math.max(...Object.values(frequency));
  const modes = Object.keys(frequency)
    .filter(key => frequency[Number(key)] === maxFreq)
    .map(Number);
  const mode = modes.length === values.length ? mean : modes[0]; // If all unique, use mean

  return { mean, min, max, mode, median };
};

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const { currentEvent } = useEvent();
  const router = useRouter();

  const [matchScouts, setMatchScouts] = useState<MatchScout[]>([]);
  const [pitScouts, setPitScouts] = useState<PitScout[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);
  const [allianceStats, setAllianceStats] = useState<AllianceStats>({
    red: { matches: 0, avgScore: 0, highestScore: 0 },
    blue: { matches: 0, avgScore: 0, highestScore: 0 }
  });
  const [loadingData, setLoadingData] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'teams' | 'detailed' | 'matches'>('overview');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && !currentEvent) {
      router.push('/events');
    }
  }, [user, loading, currentEvent, router]);

  useEffect(() => {
    if (currentEvent?.$id) {
      loadAnalyticsData();
    }
  }, [currentEvent]);

  const loadAnalyticsData = async () => {
    if (!currentEvent?.$id) return;

    setLoadingData(true);
    try {
      const [matches, pits] = await Promise.all([
        getMatchScouts(currentEvent.$id),
        getPitScouts(currentEvent.$id)
      ]);

      setMatchScouts(matches);
      setPitScouts(pits);
      calculateTeamStats(matches, pits);
      calculateAllianceStats(matches);
    } catch (error) {
      console.error(t('Error loading analytics:'), error);
    } finally {
      setLoadingData(false);
    }
  };

  const calculateTeamStats = (matches: MatchScout[], pits: PitScout[]) => {
    // Group matches by team
    const teamMatchesMap = new Map<string, MatchScout[]>();

    matches.forEach(match => {
      const teamNumber = match.teamNumber;
      if (!teamMatchesMap.has(teamNumber)) {
        teamMatchesMap.set(teamNumber, []);
      }
      teamMatchesMap.get(teamNumber)!.push(match);
    });

    // Calculate statistics for each team
    const stats: TeamStats[] = Array.from(teamMatchesMap.entries()).map(([teamNumber, teamMatches]) => {
      // Extract all values for each metric
      const totalScores = teamMatches.map(m => m.totalScore || 0);
      const autoScores = teamMatches.map(m => m.autoScore || 0);
      const teleopScores = teamMatches.map(m => m.teleopScore || 0);
      // Calculate endgame score from robotBase field (FULL=10, PARTIAL=5, NONE=0)
      const endgameScores: number[] = teamMatches.map(m => {
        if (m.robotBase === 'FULL') return 10;
        if (m.robotBase === 'PARTIAL') return 5;
        return 0;
      });
      const depotArtifactsValues = teamMatches.map(m => m.depotArtifacts || 0);
      const classifiedArtifactsValues = teamMatches.map(m =>
        (m.classifiedArtifactsAuto || 0) + (m.classifiedArtifactsTeleop || 0)
      );
      const overflowAutoValues = teamMatches.map(m => m.overflowArtifactsAuto || 0);
      const overflowTeleopValues = teamMatches.map(m => m.overflowArtifactsTeleop || 0);

      // Count endgame positions
      const endgamePositions = {
        none: teamMatches.filter(m => (m.robotBase || 'NONE') === 'NONE').length,
        partial: teamMatches.filter(m => m.robotBase === 'PARTIAL').length,
        full: teamMatches.filter(m => m.robotBase === 'FULL').length,
      };

      // Count robot leave
      const robotLeaveCount = teamMatches.filter(m => m.robotLeave).length;

      return {
        teamNumber,
        teamName: pits.find(p => p.teamNumber === teamNumber)?.teamName,
        matchCount: teamMatches.length,
        // Legacy fields for compatibility
        avgAutoScore: Math.round(autoScores.reduce((sum, val) => sum + val, 0) / teamMatches.length),
        avgTeleopScore: Math.round(teleopScores.reduce((sum, val) => sum + val, 0) / teamMatches.length),
        avgTotalScore: Math.round(totalScores.reduce((sum, val) => sum + val, 0) / teamMatches.length),
        avgEndgameScore: Math.round(endgameScores.reduce((sum, val) => sum + val, 0) / teamMatches.length),
        highestScore: Math.max(...totalScores),
        lowestScore: Math.min(...totalScores),
        winRate: 0,
        avgDepotArtifacts: Math.round((depotArtifactsValues.reduce((sum, val) => sum + val, 0) / teamMatches.length) * 10) / 10,
        avgClassifiedArtifacts: Math.round((classifiedArtifactsValues.reduce((sum, val) => sum + val, 0) / teamMatches.length) * 10) / 10,
        avgOverflowArtifactsAuto: Math.round((overflowAutoValues.reduce((sum, val) => sum + val, 0) / teamMatches.length) * 10) / 10,
        avgOverflowArtifactsTeleop: Math.round((overflowTeleopValues.reduce((sum, val) => sum + val, 0) / teamMatches.length) * 10) / 10,
        robotLeaveRate: Math.round((robotLeaveCount / teamMatches.length) * 100),
        endgamePositions,
        // Statistical analysis for each metric
        totalScore: calculateStatistics(totalScores),
        autoScore: calculateStatistics(autoScores),
        teleopScore: calculateStatistics(teleopScores),
        endgameScore: calculateStatistics(endgameScores),
        depotArtifacts: calculateStatistics(depotArtifactsValues),
        classifiedArtifacts: calculateStatistics(classifiedArtifactsValues),
        overflowArtifactsAuto: calculateStatistics(overflowAutoValues),
        overflowArtifactsTeleop: calculateStatistics(overflowTeleopValues),
      };
    }).sort((a, b) => b.avgTotalScore - a.avgTotalScore);

    setTeamStats(stats);
  };

  const calculateAllianceStats = (matches: MatchScout[]) => {
    const redMatches = matches.filter(m => m.alliance === 'red');
    const blueMatches = matches.filter(m => m.alliance === 'blue');

    const redStats = {
      matches: redMatches.length,
      avgScore: redMatches.length > 0
        ? Math.round(redMatches.reduce((sum, m) => sum + (m.totalScore || 0), 0) / redMatches.length)
        : 0,
      highestScore: Math.max(...redMatches.map(m => m.totalScore || 0), 0)
    };

    const blueStats = {
      matches: blueMatches.length,
      avgScore: blueMatches.length > 0
        ? Math.round(blueMatches.reduce((sum, m) => sum + (m.totalScore || 0), 0) / blueMatches.length)
        : 0,
      highestScore: Math.max(...blueMatches.map(m => m.totalScore || 0), 0)
    };

    setAllianceStats({ red: redStats, blue: blueStats });
  };

  if (loading || !user || !currentEvent) {
    return null;
  }

  return (
    (<div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />
      <main className="lg:pl-64 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('📊 Analytics Dashboard')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('Data insights for')} {currentEvent.name}
            </p>
          </div>

          {/* View Selector */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedView('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${selectedView === 'overview'
                ? 'bg-gradient-to-r from-blue-600 to-amber-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              {t('📈 Overview')}
            </button>
            <button
              onClick={() => setSelectedView('teams')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${selectedView === 'teams'
                ? 'bg-gradient-to-r from-blue-600 to-amber-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              {t('🏆 Team Rankings')}
            </button>
            <button
              onClick={() => setSelectedView('detailed')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${selectedView === 'detailed'
                ? 'bg-gradient-to-r from-blue-600 to-amber-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              {t('📊 Detailed Stats')}
            </button>
            <button
              onClick={() => setSelectedView('matches')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${selectedView === 'matches'
                ? 'bg-gradient-to-r from-blue-600 to-amber-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              {t('🏁 Match Analysis')}
            </button>
          </div>

          {loadingData ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">{t('Loading analytics...')}</p>
            </div>
          ) : (
            <>
              {/* Overview View */}
              {selectedView === 'overview' && (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-2xl">
                          🏁
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{t('Total Matches')}</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{matchScouts.length > 0 ? matchScouts.length : '-'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-2xl">
                          🔧
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{t('Teams Scouted')}</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{teamStats.length > 0 ? teamStats.length : '-'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-2xl">
                          📊
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{t('Pit Scouts')}</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{pitScouts.length > 0 ? pitScouts.length : '-'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-2xl">
                          ⭐
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{t('Avg Score')}</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {teamStats.length > 0
                              ? Math.round(teamStats.reduce((sum, t) => sum + t.avgTotalScore, 0) / teamStats.length)
                              : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alliance Comparison */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('Alliance Performance')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Red Alliance */}
                      <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-6 border-2 border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-red-500 rounded-lg"></div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('Red Alliance')}</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">{t('Matches:')}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{allianceStats.red.matches > 0 ? allianceStats.red.matches : '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">{t('Avg Score:')}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{allianceStats.red.avgScore > 0 ? allianceStats.red.avgScore : '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">{t('Highest Score:')}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{allianceStats.red.highestScore > 0 ? allianceStats.red.highestScore : '-'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Blue Alliance */}
                      <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg"></div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('Blue Alliance')}</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">{t('Matches:')}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{allianceStats.blue.matches > 0 ? allianceStats.blue.matches : '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">{t('Avg Score:')}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{allianceStats.blue.avgScore > 0 ? allianceStats.blue.avgScore : '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">{t('Highest Score:')}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{allianceStats.blue.highestScore > 0 ? allianceStats.blue.highestScore : '-'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Performers */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('🏆 Top 5 Teams')}</h2>
                    <div className="space-y-3">
                      {teamStats.slice(0, 5).map((team, index) => (
                        <div key={team.teamNumber} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                              index === 2 ? 'bg-amber-600' :
                                'bg-blue-500'
                            }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 dark:text-white">
                              {t('Team')} {team.teamNumber}
                              {team.teamName && <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">({team.teamName})</span>}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{team.matchCount} matches</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{team.avgTotalScore}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">avg score</p>
                          </div>
                        </div>
                      ))}
                      {teamStats.length === 0 && (
                        <p className="text-center py-8 text-gray-500 dark:text-gray-400">{t('No team data available yet')}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Team Rankings View */}
              {selectedView === 'teams' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-blue-600 to-amber-500 text-white">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold">{t('Rank')}</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">{t('Team')}</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold">{t('Matches')}</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold">{t('Avg Total')}</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold">{t('Avg Auto')}</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold">{t('Avg Teleop')}</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold">{t('Highest')}</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold">{t('Robot Leave %')}</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold">{t('Endgame')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {teamStats.map((team, index) => (
                          <tr key={team.teamNumber} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' :
                                index === 1 ? 'bg-gray-400' :
                                  index === 2 ? 'bg-amber-600' :
                                    'bg-blue-500'
                                }`}>
                                {index + 1}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white">{t('Team')} {team.teamNumber}</p>
                                {team.teamName && <p className="text-sm text-gray-600 dark:text-gray-400">{team.teamName}</p>}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center text-gray-900 dark:text-white">{team.matchCount}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-semibold">
                                {team.avgTotalScore}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center text-gray-900 dark:text-white">{team.avgAutoScore}</td>
                            <td className="px-6 py-4 text-center text-gray-900 dark:text-white">{team.avgTeleopScore}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-semibold">
                                {team.highestScore}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center text-gray-900 dark:text-white">{team.robotLeaveRate}%</td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2 text-xs">
                                {(team.endgamePositions?.full ?? 0) > 0 && (
                                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-semibold">
                                    {t('Full:')} {team.endgamePositions.full}
                                  </span>
                                )}
                                {(team.endgamePositions?.partial ?? 0) > 0 && (
                                  <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full font-semibold">
                                    {t('Partial:')} {team.endgamePositions.partial}
                                  </span>
                                )}
                                {(team.endgamePositions?.none ?? 0) > 0 && (
                                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-semibold">
                                    {t('None:')} {team.endgamePositions.none}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {teamStats.length === 0 && (
                          <tr>
                            <td colSpan={9} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                              {t('No team data available yet')}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Detailed Stats View */}
              {selectedView === 'detailed' && (
                <div className="space-y-4">
                  {/* Team Selector */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('Select a Team')}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {teamStats.map((team) => (
                        <button
                          key={team.teamNumber}
                          onClick={() => setSelectedTeam(team.teamNumber)}
                          className={`p-3 rounded-lg font-semibold transition-all ${selectedTeam === team.teamNumber
                            ? 'bg-gradient-to-r from-blue-600 to-amber-500 text-white shadow-lg scale-105'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                          {team.teamNumber}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedTeam && (() => {
                    const team = teamStats.find(t => t.teamNumber === selectedTeam);
                    if (!team) return null;

                    const maxScore = Math.max(...teamStats.map(t => t.avgTotalScore));
                    const pitInfo = pitScouts.find(p => p.teamNumber === selectedTeam);
                    const pitNumber = pitInfo?.pitNumber || '?';

                    return (
                      (<div className="space-y-4">
                        {/* Team Header */}
                        <div className="bg-gradient-to-br from-blue-50 via-amber-50 to-blue-50 dark:from-blue-950/30 dark:via-amber-950/30 dark:to-blue-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {t('Team')} {team.teamNumber}
                              </h2>
                              {team.teamName && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">{team.teamName}</p>
                              )}
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {team.matchCount} matches played
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-600 dark:text-gray-400">{t('Average Score')}</p>
                              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{team.avgTotalScore}</p>
                            </div>
                          </div>
                        </div>
                        {/* Score Statistics - Compact Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('📊 Score Statistics')}</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">{t('Metric')}</th>
                                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">{t('Mean')}</th>
                                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">{t('Median')}</th>
                                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">{t('Mode')}</th>
                                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">{t('Max')}</th>
                                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">{t('Min')}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                  <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{t('🏆 Total Score')}</td>
                                  <td className="px-3 py-2 text-center text-blue-600 dark:text-blue-400 font-bold">{team.totalScore.mean}</td>
                                  <td className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold">{team.totalScore.median}</td>
                                  <td className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold">{team.totalScore.mode}</td>
                                  <td className="px-3 py-2 text-center text-green-600 dark:text-green-400 font-semibold">{team.totalScore.max}</td>
                                  <td className="px-3 py-2 text-center text-red-600 dark:text-red-400 font-semibold">{team.totalScore.min}</td>
                                </tr>
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                  <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{t('🚀 Auto Score')}</td>
                                  <td className="px-3 py-2 text-center text-purple-600 dark:text-purple-400 font-bold">{team.autoScore.mean}</td>
                                  <td className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold">{team.autoScore.median}</td>
                                  <td className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold">{team.autoScore.mode}</td>
                                  <td className="px-3 py-2 text-center text-green-600 dark:text-green-400 font-semibold">{team.autoScore.max}</td>
                                  <td className="px-3 py-2 text-center text-red-600 dark:text-red-400 font-semibold">{team.autoScore.min}</td>
                                </tr>
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                  <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{t('🎮 Teleop Score')}</td>
                                  <td className="px-3 py-2 text-center text-green-600 dark:text-green-400 font-bold">{team.teleopScore.mean}</td>
                                  <td className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold">{team.teleopScore.median}</td>
                                  <td className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold">{team.teleopScore.mode}</td>
                                  <td className="px-3 py-2 text-center text-green-600 dark:text-green-400 font-semibold">{team.teleopScore.max}</td>
                                  <td className="px-3 py-2 text-center text-red-600 dark:text-red-400 font-semibold">{team.teleopScore.min}</td>
                                </tr>
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                  <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{t('🏁 Endgame Score')}</td>
                                  <td className="px-3 py-2 text-center text-indigo-600 dark:text-indigo-400 font-bold">{team.endgameScore.mean}</td>
                                  <td className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold">{team.endgameScore.median}</td>
                                  <td className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold">{team.endgameScore.mode}</td>
                                  <td className="px-3 py-2 text-center text-green-600 dark:text-green-400 font-semibold">{team.endgameScore.max}</td>
                                  <td className="px-3 py-2 text-center text-red-600 dark:text-red-400 font-semibold">{team.endgameScore.min}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                        {/* Artifact Statistics - Compact Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('📦 Artifact Statistics')}</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">{t('Metric')}</th>
                                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">{t('Mean')}</th>
                                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">{t('Median')}</th>
                                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">{t('Mode')}</th>
                                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">{t('Max')}</th>
                                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">{t('Min')}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                  <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{t('📦 Depot Artifacts')}</td>
                                  <td className="px-3 py-2 text-center text-amber-600 dark:text-amber-400 font-bold">{team.depotArtifacts.mean}</td>
                                  <td className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold">{team.depotArtifacts.median}</td>
                                  <td className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold">{team.depotArtifacts.mode}</td>
                                  <td className="px-3 py-2 text-center text-green-600 dark:text-green-400 font-semibold">{team.depotArtifacts.max}</td>
                                  <td className="px-3 py-2 text-center text-red-600 dark:text-red-400 font-semibold">{team.depotArtifacts.min}</td>
                                </tr>
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                  <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{t('⚙️ Classified Artifacts')}</td>
                                  <td className="px-3 py-2 text-center text-pink-600 dark:text-pink-400 font-bold">{team.classifiedArtifacts.mean}</td>
                                  <td className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold">{team.classifiedArtifacts.median}</td>
                                  <td className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold">{team.classifiedArtifacts.mode}</td>
                                  <td className="px-3 py-2 text-center text-green-600 dark:text-green-400 font-semibold">{team.classifiedArtifacts.max}</td>
                                  <td className="px-3 py-2 text-center text-red-600 dark:text-red-400 font-semibold">{team.classifiedArtifacts.min}</td>
                                </tr>
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                  <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{t('🔷 Overflow (Auto)')}</td>
                                  <td className="px-3 py-2 text-center text-cyan-600 dark:text-cyan-400 font-bold">{team.overflowArtifactsAuto.mean}</td>
                                  <td className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold">{team.overflowArtifactsAuto.median}</td>
                                  <td className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold">{team.overflowArtifactsAuto.mode}</td>
                                  <td className="px-3 py-2 text-center text-green-600 dark:text-green-400 font-semibold">{team.overflowArtifactsAuto.max}</td>
                                  <td className="px-3 py-2 text-center text-red-600 dark:text-red-400 font-semibold">{team.overflowArtifactsAuto.min}</td>
                                </tr>
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                  <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{t('🔶 Overflow (Teleop)')}</td>
                                  <td className="px-3 py-2 text-center text-teal-600 dark:text-teal-400 font-bold">{team.overflowArtifactsTeleop.mean}</td>
                                  <td className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold">{team.overflowArtifactsTeleop.median}</td>
                                  <td className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold">{team.overflowArtifactsTeleop.mode}</td>
                                  <td className="px-3 py-2 text-center text-green-600 dark:text-green-400 font-semibold">{team.overflowArtifactsTeleop.max}</td>
                                  <td className="px-3 py-2 text-center text-red-600 dark:text-red-400 font-semibold">{team.overflowArtifactsTeleop.min}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                        {/* Endgame Distribution - Compact */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('🏁 Endgame Distribution')}</h3>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                              <div className="text-2xl mb-1">✅</div>
                              <p className="text-xl font-bold text-green-600 dark:text-green-400">{team.endgamePositions.full}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('Full')}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                {Math.round((team.endgamePositions.full / team.matchCount) * 100)}%
                              </p>
                            </div>
                            <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
                              <div className="text-2xl mb-1">⚠️</div>
                              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{team.endgamePositions.partial}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('Partial')}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                {Math.round((team.endgamePositions.partial / team.matchCount) * 100)}%
                              </p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                              <div className="text-2xl mb-1">❌</div>
                              <p className="text-xl font-bold text-gray-600 dark:text-gray-400">{team.endgamePositions.none}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('None')}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                {Math.round((team.endgamePositions.none / team.matchCount) * 100)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>)
                    );
                  })()}

                  {!selectedTeam && teamStats.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-md text-center">
                      <div className="text-6xl mb-4">📊</div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('Select a Team')}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{t(
                        'Choose a team from above to view detailed statistics and performance graphs'
                      )}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Match Analysis View */}
              {selectedView === 'matches' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('Recent Matches')}</h2>
                    <div className="space-y-3">
                      {matchScouts.slice(0, 10).map((match) => (
                        <div key={match.$id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white ${match.alliance === 'red' ? 'bg-red-500' : 'bg-blue-500'
                            }`}>
                            {match.matchNumber}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 dark:text-white">
                              {t('Team')} {match.teamNumber}
                              <span className={`ml-3 text-sm px-2 py-1 rounded ${match.alliance === 'red'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                }`}>
                                {match.alliance.toUpperCase()}
                              </span>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('Auto')}: {match.autoScore} | {t('Teleop')}: {match.teleopScore}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{match.totalScore}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">total</p>
                          </div>
                        </div>
                      ))}
                      {matchScouts.length === 0 && (
                        <p className="text-center py-8 text-gray-500 dark:text-gray-400">{t('No match data available yet')}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>)
  );
}
