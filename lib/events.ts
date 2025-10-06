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
  sharedWith?: string[]; // Array of user IDs who have access
  sharedWithNames?: string[]; // Array of user names for display
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
 * Get all events for a user (owned by user OR shared with user)
 */
export const getEvents = async (userId: string): Promise<Event[]> => {
  try {
    // Get events owned by user
    const ownedResponse = await databases.listDocuments(
      DATABASE_ID,
      EVENTS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt'),
      ]
    );
    
    let sharedEvents: any[] = [];
    
    // Try to get events shared with user (may fail if attribute doesn't exist yet)
    try {
      const sharedResponse = await databases.listDocuments(
        DATABASE_ID,
        EVENTS_COLLECTION_ID,
        [
          Query.contains('sharedWith', userId),
          Query.orderDesc('$createdAt'),
        ]
      );
      sharedEvents = sharedResponse.documents;
    } catch (sharedError: any) {
      // If sharedWith attribute doesn't exist in database yet, that's okay
      // Just log it and continue with owned events only
      if (sharedError.code === 400 && sharedError.message?.includes('Attribute not found')) {
        console.log('Note: sharedWith attribute not yet added to database. Showing owned events only.');
      } else {
        // Re-throw if it's a different error
        throw sharedError;
      }
    }
    
    // Combine and deduplicate events
    const allEvents = [...ownedResponse.documents, ...sharedEvents];
    const uniqueEvents = Array.from(
      new Map(allEvents.map(event => [event.$id, event])).values()
    );
    
    // Sort by creation date
    uniqueEvents.sort((a, b) => 
      new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
    );
    
    return uniqueEvents as Event[];
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

/**
 * Share an event with another user by their user ID
 * Note: In a production app, you'd want to look up users by email using a server-side API
 * For now, we'll accept userId directly
 */
export const shareEvent = async (eventId: string, targetUserId: string, targetUserName: string): Promise<Event> => {
  try {
    // Get the current event to check existing shares
    const event = await getEvent(eventId);
    
    // Initialize arrays if they don't exist
    const sharedWith = event.sharedWith || [];
    const sharedWithNames = event.sharedWithNames || [];
    
    // Check if already shared
    if (sharedWith.includes(targetUserId)) {
      throw new Error('Event is already shared with this user');
    }
    
    // Add the new user
    sharedWith.push(targetUserId);
    sharedWithNames.push(targetUserName);
    
    // Update the event
    try {
      const updatedEvent = await databases.updateDocument(
        DATABASE_ID,
        EVENTS_COLLECTION_ID,
        eventId,
        {
          sharedWith,
          sharedWithNames,
        }
      );
      
      return updatedEvent as Event;
    } catch (updateError: any) {
      // Check if the error is due to missing attributes
      if (updateError.code === 400 && updateError.message?.includes('Unknown attribute')) {
        throw new Error('Event sharing is not yet enabled. Please add the "sharedWith" and "sharedWithNames" attributes to the events collection in your Appwrite database.');
      }
      throw updateError;
    }
  } catch (error: any) {
    console.error('Error sharing event:', error);
    throw error;
  }
};

/**
 * Remove a user's access to an event
 */
export const unshareEvent = async (eventId: string, targetUserId: string): Promise<Event> => {
  try {
    // Get the current event
    const event = await getEvent(eventId);
    
    // Initialize arrays if they don't exist
    const sharedWith = event.sharedWith || [];
    const sharedWithNames = event.sharedWithNames || [];
    
    // Find the user's index
    const userIndex = sharedWith.indexOf(targetUserId);
    
    if (userIndex === -1) {
      throw new Error('User does not have access to this event');
    }
    
    // Remove the user
    sharedWith.splice(userIndex, 1);
    sharedWithNames.splice(userIndex, 1);
    
    // Update the event
    try {
      const updatedEvent = await databases.updateDocument(
        DATABASE_ID,
        EVENTS_COLLECTION_ID,
        eventId,
        {
          sharedWith,
          sharedWithNames,
        }
      );
      
      return updatedEvent as Event;
    } catch (updateError: any) {
      // Check if the error is due to missing attributes
      if (updateError.code === 400 && updateError.message?.includes('Unknown attribute')) {
        throw new Error('Event sharing is not yet enabled. Please add the "sharedWith" and "sharedWithNames" attributes to the events collection in your Appwrite database.');
      }
      throw updateError;
    }
  } catch (error: any) {
    console.error('Error unsharing event:', error);
    throw error;
  }
};
