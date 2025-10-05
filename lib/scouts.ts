import { databases } from './appwrite';
import { ID, Query } from 'appwrite';

// Database and Collection IDs
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'ftclivescout_db';
const MATCH_SCOUTS_COLLECTION_ID = 'match_scouts';
const PIT_SCOUTS_COLLECTION_ID = 'pit_scouts';

export interface MatchScout {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  eventId: string;
  userId: string;
  teamNumber: string;
  matchNumber: string;
  alliance: 'red' | 'blue';
  autoScore: number;
  teleopScore: number;
  endgameScore: number;
  fouls: number;
  defense: number;
  notes: string;
}

export interface PitScout {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  eventId: string;
  userId: string;
  teamNumber: string;
  teamName: string;
  drivetrainType: string;
  programmingLanguage: string;
  robotWeight: number;
  strengths: string;
  weaknesses: string;
  notes: string;
}

export interface CreateMatchScoutData {
  eventId: string;
  userId: string;
  teamNumber: string;
  matchNumber: string;
  alliance: 'red' | 'blue';
  autoScore: number;
  teleopScore: number;
  endgameScore: number;
  fouls: number;
  defense: number;
  notes: string;
}

export interface CreatePitScoutData {
  eventId: string;
  userId: string;
  teamNumber: string;
  teamName: string;
  drivetrainType: string;
  programmingLanguage: string;
  robotWeight: number;
  strengths: string;
  weaknesses: string;
  notes: string;
}

/**
 * Create a new match scout report
 */
export const createMatchScout = async (data: CreateMatchScoutData): Promise<MatchScout> => {
  try {
    const scout = await databases.createDocument(
      DATABASE_ID,
      MATCH_SCOUTS_COLLECTION_ID,
      ID.unique(),
      data
    );
    return scout as unknown as MatchScout;
  } catch (error) {
    console.error('Error creating match scout:', error);
    throw error;
  }
};

/**
 * Get all match scouts for an event
 */
export const getMatchScouts = async (eventId: string): Promise<MatchScout[]> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      MATCH_SCOUTS_COLLECTION_ID,
      [
        Query.equal('eventId', eventId),
        Query.orderDesc('$createdAt'),
      ]
    );
    return response.documents as unknown as MatchScout[];
  } catch (error) {
    console.error('Error getting match scouts:', error);
    throw error;
  }
};

/**
 * Create a new pit scout report
 */
export const createPitScout = async (data: CreatePitScoutData): Promise<PitScout> => {
  try {
    const scout = await databases.createDocument(
      DATABASE_ID,
      PIT_SCOUTS_COLLECTION_ID,
      ID.unique(),
      data
    );
    return scout as unknown as PitScout;
  } catch (error) {
    console.error('Error creating pit scout:', error);
    throw error;
  }
};

/**
 * Get all pit scouts for an event
 */
export const getPitScouts = async (eventId: string): Promise<PitScout[]> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      PIT_SCOUTS_COLLECTION_ID,
      [
        Query.equal('eventId', eventId),
        Query.orderDesc('$createdAt'),
      ]
    );
    return response.documents as unknown as PitScout[];
  } catch (error) {
    console.error('Error getting pit scouts:', error);
    throw error;
  }
};

/**
 * Get recent scout activity for an event (both match and pit)
 */
export interface RecentActivity {
  type: 'match' | 'pit';
  id: string;
  createdAt: string;
  teamNumber: string;
  matchNumber?: string;
}

export const getRecentActivity = async (eventId: string, limit: number = 10): Promise<RecentActivity[]> => {
  try {
    const [matchScouts, pitScouts] = await Promise.all([
      databases.listDocuments(
        DATABASE_ID,
        MATCH_SCOUTS_COLLECTION_ID,
        [
          Query.equal('eventId', eventId),
          Query.orderDesc('$createdAt'),
          Query.limit(limit),
        ]
      ),
      databases.listDocuments(
        DATABASE_ID,
        PIT_SCOUTS_COLLECTION_ID,
        [
          Query.equal('eventId', eventId),
          Query.orderDesc('$createdAt'),
          Query.limit(limit),
        ]
      ),
    ]);

    const activities: RecentActivity[] = [
      ...matchScouts.documents.map((doc: any) => ({
        type: 'match' as const,
        id: doc.$id,
        createdAt: doc.$createdAt,
        teamNumber: doc.teamNumber,
        matchNumber: doc.matchNumber,
      })),
      ...pitScouts.documents.map((doc: any) => ({
        type: 'pit' as const,
        id: doc.$id,
        createdAt: doc.$createdAt,
        teamNumber: doc.teamNumber,
      })),
    ];

    // Sort by date and limit
    return activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting recent activity:', error);
    throw error;
  }
};
