import { databases } from './appwrite';
import { ID, Query } from 'appwrite';

// Database and Collection IDs
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'ftclivescout_db';
const CHECKLISTS_COLLECTION_ID = 'checklists';

export type ChecklistRole = 'driver' | 'engineer' | 'technician';

export interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
    completedBy?: string;
    completedByName?: string;
    completedAt?: string;
}

export interface Checklist {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    eventId: string;
    role: ChecklistRole;
    items: string; // JSON stringified array of ChecklistItem[]
    lastEditedBy?: string;
    lastEditedByName?: string;
    lastEditedAt?: string;
}

export interface ChecklistData {
    eventId: string;
    role: ChecklistRole;
    items: ChecklistItem[];
}

/**
 * Parse items from JSON string
 */
export const parseItems = (itemsJson: string): ChecklistItem[] => {
    try {
        return JSON.parse(itemsJson);
    } catch {
        return [];
    }
};

/**
 * Create a new checklist for an event
 */
export const createChecklist = async (
    eventId: string,
    role: ChecklistRole,
    userId: string,
    userName: string
): Promise<Checklist> => {
    try {
        const defaultItems: ChecklistItem[] = getDefaultItems(role);

        const checklist = await databases.createDocument(
            DATABASE_ID,
            CHECKLISTS_COLLECTION_ID,
            ID.unique(),
            {
                eventId,
                role,
                items: JSON.stringify(defaultItems),
                lastEditedBy: userId,
                lastEditedByName: userName,
                lastEditedAt: new Date().toISOString(),
            }
        );
        return checklist as unknown as Checklist;
    } catch (error) {
        console.error('Error creating checklist:', error);
        throw error;
    }
};

/**
 * Get default checklist items based on role
 */
const getDefaultItems = (role: ChecklistRole): ChecklistItem[] => {
    // Start with empty checklist - users will add their own items
    return [];
};

/**
 * Get checklists for an event
 */
export const getChecklists = async (eventId: string): Promise<Checklist[]> => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            CHECKLISTS_COLLECTION_ID,
            [Query.equal('eventId', eventId), Query.orderAsc('role')]
        );
        return response.documents as unknown as Checklist[];
    } catch (error) {
        console.error('Error getting checklists:', error);
        throw error;
    }
};

/**
 * Get a specific checklist by event and role
 */
export const getChecklistByRole = async (
    eventId: string,
    role: ChecklistRole
): Promise<Checklist | null> => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            CHECKLISTS_COLLECTION_ID,
            [Query.equal('eventId', eventId), Query.equal('role', role), Query.limit(1)]
        );
        return response.documents.length > 0
            ? (response.documents[0] as unknown as Checklist)
            : null;
    } catch (error) {
        console.error('Error getting checklist by role:', error);
        throw error;
    }
};

/**
 * Update a checklist
 */
export const updateChecklist = async (
    checklistId: string,
    items: ChecklistItem[],
    userId: string,
    userName: string
): Promise<Checklist> => {
    try {
        const checklist = await databases.updateDocument(
            DATABASE_ID,
            CHECKLISTS_COLLECTION_ID,
            checklistId,
            {
                items: JSON.stringify(items),
                lastEditedBy: userId,
                lastEditedByName: userName,
                lastEditedAt: new Date().toISOString(),
            }
        );
        return checklist as unknown as Checklist;
    } catch (error) {
        console.error('Error updating checklist:', error);
        throw error;
    }
};

/**
 * Initialize checklists for an event (create all three if they don't exist)
 */
export const initializeChecklists = async (
    eventId: string,
    userId: string,
    userName: string
): Promise<void> => {
    const roles: ChecklistRole[] = ['driver', 'engineer', 'technician'];

    for (const role of roles) {
        try {
            const existing = await getChecklistByRole(eventId, role);
            if (!existing) {
                await createChecklist(eventId, role, userId, userName);
            }
        } catch (error) {
            console.error(`Error initializing ${role} checklist:`, error);
        }
    }
};

/**
 * Delete all checklists for an event
 */
export const deleteEventChecklists = async (eventId: string): Promise<void> => {
    try {
        const checklists = await getChecklists(eventId);
        await Promise.all(
            checklists.map(checklist =>
                databases.deleteDocument(DATABASE_ID, CHECKLISTS_COLLECTION_ID, checklist.$id)
            )
        );
    } catch (error) {
        console.error('Error deleting event checklists:', error);
        throw error;
    }
};
