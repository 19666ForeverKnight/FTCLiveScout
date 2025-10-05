import { databases } from './appwrite';
import { ID, Query } from 'appwrite';

// Database and Collection IDs
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'ftclivescout_db';
const EVENTS_COLLECTION_ID = 'events';

export interface Event {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  userId: string;
  isActive: boolean;
}

export interface CreateEventData {
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  userId: string;
}

/**
 * Create a new event
 */
export const createEvent = async (data: CreateEventData): Promise<Event> => {
  try {
    const event = await databases.createDocument(
      DATABASE_ID,
      EVENTS_COLLECTION_ID,
      ID.unique(),
      {
        ...data,
        isActive: false,
      }
    );
    return event as Event;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

/**
 * Get all events for a user
 */
export const getEvents = async (userId: string): Promise<Event[]> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      EVENTS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt'),
      ]
    );
    return response.documents as Event[];
  } catch (error) {
    console.error('Error getting events:', error);
    throw error;
  }
};

/**
 * Get a single event by ID
 */
export const getEvent = async (eventId: string): Promise<Event> => {
  try {
    const event = await databases.getDocument(
      DATABASE_ID,
      EVENTS_COLLECTION_ID,
      eventId
    );
    return event as Event;
  } catch (error) {
    console.error('Error getting event:', error);
    throw error;
  }
};

/**
 * Update an event
 */
export const updateEvent = async (eventId: string, data: Partial<CreateEventData>): Promise<Event> => {
  try {
    const event = await databases.updateDocument(
      DATABASE_ID,
      EVENTS_COLLECTION_ID,
      eventId,
      data
    );
    return event as Event;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

/**
 * Delete an event
 */
export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      EVENTS_COLLECTION_ID,
      eventId
    );
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

/**
 * Set active event in localStorage
 */
export const setCurrentEventId = (eventId: string | null): void => {
  if (eventId) {
    localStorage.setItem('currentEventId', eventId);
  } else {
    localStorage.removeItem('currentEventId');
  }
};

/**
 * Get active event ID from localStorage
 */
export const getCurrentEventId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('currentEventId');
};
