import { databases, storage } from './appwrite';
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
  createdBy?: string; // User ID who created this scout
  createdByName?: string; // Name of user who created
  lastEditedBy?: string; // User ID who last edited
  lastEditedByName?: string; // Name of user who last edited
  lastEditedAt?: string; // Timestamp of last edit
  randomization?: 'GPP' | 'PGP' | 'PPG';
  // Legacy fields (kept for backward compatibility)
  autoScore?: number;
  teleopScore?: number;
  totalScore?: number;
  endgameScore?: number;
  fouls?: number;
  defense?: number;
  notes: string;
  // DECODE 2025-26 Season Fields
  // AUTO Period
  overflowArtifactsAuto?: number;
  classifiedArtifactsAuto?: number;
  gatesAuto?: string; // JSON string of gate statuses
  robotLeave?: boolean;
  // TELEOP Period
  depotArtifacts?: number;
  overflowArtifactsTeleop?: number;
  classifiedArtifactsTeleop?: number;
  gatesTeleop?: string; // JSON string of gate statuses
  robotBase?: 'NONE' | 'PARTIAL' | 'FULL';
  // Fouls
  minorFouls?: number;
  majorFouls?: number;
}

export interface PitScout {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  eventId: string;
  userId: string;
  teamNumber: string;
  teamName?: string;
  drivetrainType?: string;
  programmingLanguage?: string;
  robotWeight?: number;
  strengths?: string;
  weaknesses?: string;
  notes?: string;
  imageId?: string;
  pitNumber?: string;
  createdBy?: string; // User ID who created
  lastEditedBy?: string; // User ID who last edited
  lastEditedAt?: string; // ISO date string
}

export interface CreateMatchScoutData {
  eventId: string;
  userId: string;
  teamNumber: string;
  matchNumber: string;
  alliance: 'red' | 'blue';
  randomization?: 'GPP' | 'PGP' | 'PPG';
  notes: string;
  // Calculated Scores
  autoScore?: number;
  teleopScore?: number;
  totalScore?: number;
  endgameScore?: number;
  fouls?: number;
  defense?: number;
  // DECODE 2025-26 Season Fields
  // AUTO Period
  overflowArtifactsAuto?: number;
  classifiedArtifactsAuto?: number;
  gatesAuto?: string;
  robotLeave?: boolean;
  // TELEOP Period
  depotArtifacts?: number;
  overflowArtifactsTeleop?: number;
  classifiedArtifactsTeleop?: number;
  gatesTeleop?: string;
  robotBase?: 'NONE' | 'PARTIAL' | 'FULL';
  // Fouls
  minorFouls?: number;
  majorFouls?: number;
}

export interface CreatePitScoutData {
  eventId: string;
  userId: string;
  teamNumber: string;
  teamName: string;
  pitNumber?: string;
  drivetrainType: string;
  programmingLanguage: string;
  robotWeight: number;
  strengths: string;
  weaknesses: string;
  notes: string;
  imageId?: string;
}

/**
 * Create a new match scout report
 */
export const createMatchScout = async (
  data: CreateMatchScoutData, 
  createdByUserId: string, 
  createdByUserName: string
): Promise<MatchScout> => {
  try {
    const scout = await databases.createDocument(
      DATABASE_ID,
      MATCH_SCOUTS_COLLECTION_ID,
      ID.unique(),
      {
        ...data,
        createdBy: createdByUserId,
        createdByName: createdByUserName,
      }
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
export const createPitScout = async (
  data: CreatePitScoutData, 
  createdByUserId: string, 
  createdByUserName: string
): Promise<PitScout> => {
  try {
    const scout = await databases.createDocument(
      DATABASE_ID,
      PIT_SCOUTS_COLLECTION_ID,
      ID.unique(),
      {
        ...data,
        createdBy: createdByUserId,
      }
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
 * Get a single pit scout by ID
 */
export const getPitScout = async (pitScoutId: string): Promise<PitScout> => {
  try {
    console.log('getPitScout called with ID:', pitScoutId);
    console.log('Database ID:', DATABASE_ID);
    console.log('Collection ID:', PIT_SCOUTS_COLLECTION_ID);
    
    const scout = await databases.getDocument(
      DATABASE_ID,
      PIT_SCOUTS_COLLECTION_ID,
      pitScoutId
    );
    console.log('Retrieved scout:', scout);
    return scout as unknown as PitScout;
  } catch (error: any) {
    console.error('Error getting pit scout:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      response: error.response
    });
    throw error;
  }
};

/**
 * Get a single match scout by ID
 */
export const getMatchScout = async (matchScoutId: string): Promise<MatchScout> => {
  try {
    const scout = await databases.getDocument(
      DATABASE_ID,
      MATCH_SCOUTS_COLLECTION_ID,
      matchScoutId
    );
    return scout as unknown as MatchScout;
  } catch (error) {
    console.error('Error getting match scout:', error);
    throw error;
  }
};

/**
 * Update an existing match scout
 */
export const updateMatchScout = async (
  matchScoutId: string,
  data: Partial<CreateMatchScoutData>,
  editedByUserId: string,
  editedByUserName: string
): Promise<MatchScout> => {
  try {
    const scout = await databases.updateDocument(
      DATABASE_ID,
      MATCH_SCOUTS_COLLECTION_ID,
      matchScoutId,
      {
        ...data,
        lastEditedBy: editedByUserId,
        lastEditedByName: editedByUserName,
        lastEditedAt: new Date().toISOString(),
      }
    );
    return scout as unknown as MatchScout;
  } catch (error) {
    console.error('Error updating match scout:', error);
    throw error;
  }
};

/**
 * Update an existing pit scout
 */
export const updatePitScout = async (
  scoutId: string, 
  data: Partial<CreatePitScoutData>,
  editedByUserId: string,
  editedByUserName: string
): Promise<PitScout> => {
  try {
    const scout = await databases.updateDocument(
      DATABASE_ID,
      PIT_SCOUTS_COLLECTION_ID,
      scoutId,
      {
        ...data,
        lastEditedBy: editedByUserId,
        lastEditedAt: new Date().toISOString(),
      }
    );
    return scout as unknown as PitScout;
  } catch (error) {
    console.error('Error updating pit scout:', error);
    throw error;
  }
};

/**
 * Delete a pit scout and its associated image
 */
export const deletePitScout = async (pitScoutId: string): Promise<void> => {
  try {
    // First, get the pit scout to check if it has an image
    const pitScout = await databases.getDocument(
      DATABASE_ID,
      PIT_SCOUTS_COLLECTION_ID,
      pitScoutId
    ) as unknown as PitScout;

    // If there's an image, delete it from storage
    if (pitScout.imageId) {
      try {
        await storage.deleteFile('pit_scout_images', pitScout.imageId);
      } catch (storageError) {
        // Log but don't fail if image deletion fails (image might already be deleted)
        console.warn('Error deleting pit scout image:', storageError);
      }
    }

    // Delete the pit scout document
    await databases.deleteDocument(
      DATABASE_ID,
      PIT_SCOUTS_COLLECTION_ID,
      pitScoutId
    );
  } catch (error) {
    console.error('Error deleting pit scout:', error);
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
