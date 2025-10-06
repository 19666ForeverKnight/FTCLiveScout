'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEvent } from '@/context/EventContext';
import { Navigation } from '@/components/Navigation';
import { getMatchScouts, getPitScouts, MatchScout, PitScout } from '@/lib/scouts';

interface TeamStats {
  teamNumber: string;
  teamName?: string;
  matchCount: number;
  avgAutoScore: number;
  avgTeleopScore: number;
  avgTotalScore: number;
  highestScore: number;
  lowestScore: number;
  winRate: number;
  avgDepotArtifacts: number;
  avgClassifiedArtifacts: number;
  robotLeaveRate: number;
  endgamePositions: {
    none: number;
    partial: number;
    full: number;
  };
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
  const [selectedView, setSelectedView] = useState<'overview' | 'teams' | 'matches'>('overview');

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
      console.error('Error loading analytics:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const calculateTeamStats = (matches: MatchScout[], pits: PitScout[]) => {
    const teamMap = new Map<string, TeamStats>();
    
    matches.forEach(match => {
      const teamNumber = match.teamNumber;
      const existing = teamMap.get(teamNumber) || {
        teamNumber,
        teamName: pits.find(p => p.teamNumber === teamNumber)?.teamName,
        matchCount: 0,
        avgAutoScore: 0,
        avgTeleopScore: 0,
        avgTotalScore: 0,
        highestScore: 0,
        lowestScore: Infinity,
        winRate: 0,
        avgDepotArtifacts: 0,
        avgClassifiedArtifacts: 0,
        robotLeaveRate: 0,
        endgamePositions: {
          none: 0,
          partial: 0,
          full: 0,
        },
      };
      
      const totalScore = match.totalScore || 0;
      const autoScore = match.autoScore || 0;
      const teleopScore = match.teleopScore || 0;
      
      existing.matchCount++;
      existing.avgAutoScore += autoScore;
      existing.avgTeleopScore += teleopScore;
      existing.avgTotalScore += totalScore;
      existing.highestScore = Math.max(existing.highestScore, totalScore);
      existing.lowestScore = Math.min(existing.lowestScore, totalScore);
      existing.avgDepotArtifacts += (match.depotArtifacts || 0);
      existing.avgClassifiedArtifacts += ((match.classifiedArtifactsAuto || 0) + (match.classifiedArtifactsTeleop || 0));
      if (match.robotLeave) existing.robotLeaveRate++;
      
      // Track endgame positions
      const robotBase = match.robotBase || 'NONE';
      if (robotBase === 'NONE') existing.endgamePositions.none++;
      else if (robotBase === 'PARTIAL') existing.endgamePositions.partial++;
      else if (robotBase === 'FULL') existing.endgamePositions.full++;
      
      teamMap.set(teamNumber, existing);
    });
    
    const stats = Array.from(teamMap.values()).map(team => ({
      ...team,
      avgAutoScore: Math.round(team.avgAutoScore / team.matchCount),
      avgTeleopScore: Math.round(team.avgTeleopScore / team.matchCount),
      avgTotalScore: Math.round(team.avgTotalScore / team.matchCount),
      lowestScore: team.lowestScore === Infinity ? 0 : team.lowestScore,
      avgDepotArtifacts: Math.round(team.avgDepotArtifacts / team.matchCount),
      avgClassifiedArtifacts: Math.round(team.avgClassifiedArtifacts / team.matchCount),
      robotLeaveRate: Math.round((team.robotLeaveRate / team.matchCount) * 100),
      winRate: 0, // Would need match results to calculate
    })).sort((a, b) => b.avgTotalScore - a.avgTotalScore);
    
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />
      
      <main className="lg:pl-64 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              📊 Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Data insights for {currentEvent.name}
            </p>
          </div>

          {/* View Selector */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedView('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedView === 'overview'
                  ? 'bg-gradient-to-r from-blue-600 to-amber-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              📈 Overview
            </button>
            <button
              onClick={() => setSelectedView('teams')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedView === 'teams'
                  ? 'bg-gradient-to-r from-blue-600 to-amber-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              🏆 Team Rankings
            </button>
            <button
              onClick={() => setSelectedView('matches')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedView === 'matches'
                  ? 'bg-gradient-to-r from-blue-600 to-amber-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              🏁 Match Analysis
            </button>
          </div>

          {loadingData ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
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
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Matches</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{matchScouts.length}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-2xl">
                          🔧
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Teams Scouted</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{teamStats.length}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-2xl">
                          📊
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Pit Scouts</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{pitScouts.length}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-2xl">
                          ⭐
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Score</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {teamStats.length > 0 
                              ? Math.round(teamStats.reduce((sum, t) => sum + t.avgTotalScore, 0) / teamStats.length)
                              : 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alliance Comparison */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Alliance Performance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Red Alliance */}
                      <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-6 border-2 border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-red-500 rounded-lg"></div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Red Alliance</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Matches:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{allianceStats.red.matches}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Avg Score:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{allianceStats.red.avgScore}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Highest Score:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{allianceStats.red.highestScore}</span>
                          </div>
                        </div>
                      </div>

                      {/* Blue Alliance */}
                      <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg"></div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Blue Alliance</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Matches:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{allianceStats.blue.matches}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Avg Score:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{allianceStats.blue.avgScore}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Highest Score:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{allianceStats.blue.highestScore}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Performers */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">🏆 Top 5 Teams</h2>
                    <div className="space-y-3">
                      {teamStats.slice(0, 5).map((team, index) => (
                        <div key={team.teamNumber} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-amber-600' :
                            'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 dark:text-white">
                              Team {team.teamNumber}
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
                        <p className="text-center py-8 text-gray-500 dark:text-gray-400">No team data available yet</p>
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
                          <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Team</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold">Matches</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold">Avg Total</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold">Avg Auto</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold">Avg Teleop</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold">Highest</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold">Robot Leave %</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold">Endgame</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {teamStats.map((team, index) => (
                          <tr key={team.teamNumber} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                index === 0 ? 'bg-yellow-500' :
                                index === 1 ? 'bg-gray-400' :
                                index === 2 ? 'bg-amber-600' :
                                'bg-blue-500'
                              }`}>
                                {index + 1}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white">Team {team.teamNumber}</p>
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
                                    Full: {team.endgamePositions.full}
                                  </span>
                                )}
                                {(team.endgamePositions?.partial ?? 0) > 0 && (
                                  <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full font-semibold">
                                    Partial: {team.endgamePositions.partial}
                                  </span>
                                )}
                                {(team.endgamePositions?.none ?? 0) > 0 && (
                                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-semibold">
                                    None: {team.endgamePositions.none}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {teamStats.length === 0 && (
                          <tr>
                            <td colSpan={9} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                              No team data available yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Match Analysis View */}
              {selectedView === 'matches' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Matches</h2>
                    <div className="space-y-3">
                      {matchScouts.slice(0, 10).map((match) => (
                        <div key={match.$id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white ${
                            match.alliance === 'red' ? 'bg-red-500' : 'bg-blue-500'
                          }`}>
                            {match.matchNumber}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 dark:text-white">
                              Team {match.teamNumber}
                              <span className={`ml-3 text-sm px-2 py-1 rounded ${
                                match.alliance === 'red' 
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              }`}>
                                {match.alliance.toUpperCase()}
                              </span>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Auto: {match.autoScore} | Teleop: {match.teleopScore}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{match.totalScore}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">total</p>
                          </div>
                        </div>
                      ))}
                      {matchScouts.length === 0 && (
                        <p className="text-center py-8 text-gray-500 dark:text-gray-400">No match data available yet</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
