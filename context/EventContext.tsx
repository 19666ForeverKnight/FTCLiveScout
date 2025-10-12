'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  Event,
  CreateEventData,
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  getCurrentEventId,
  setCurrentEventId,
  getEvent,
} from '@/lib/events';

interface EventContextType {
  currentEvent: Event | null;
  events: Event[];
  loading: boolean;
  setCurrentEvent: (event: Event | null) => void;
  createNewEvent: (data: CreateEventData) => Promise<Event>;
  updateEventData: (eventId: string, data: Partial<CreateEventData>) => Promise<Event>;
  deleteEventData: (eventId: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentEvent, setCurrentEventState] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Load events when user is authenticated
  useEffect(() => {
    if (user?.$id) {
      loadEvents();
    } else {
      setEvents([]);
      setCurrentEventState(null);
      setLoading(false);
    }
  }, [user?.$id]);

  // Load current event from localStorage
  useEffect(() => {
    if (events.length > 0 && !currentEvent) {
      const savedEventId = getCurrentEventId();
      if (savedEventId) {
        const savedEvent = events.find(e => e.$id === savedEventId);
        if (savedEvent) {
          setCurrentEventState(savedEvent);
        } else {
          // If saved event not found, set first event as current
          setCurrentEventState(events[0]);
          setCurrentEventId(events[0].$id);
        }
      } else if (events.length > 0) {
        // No saved event, set first as current
        setCurrentEventState(events[0]);
        setCurrentEventId(events[0].$id);
      }
    }
  }, [events, currentEvent]);

  const loadEvents = async () => {
    if (!user?.$id) return;

    try {
      setLoading(true);
      const fetchedEvents = await getEvents(user.$id);
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const setCurrentEvent = (event: Event | null) => {
    setCurrentEventState(event);
    setCurrentEventId(event?.$id || null);
  };

  const createNewEvent = async (data: CreateEventData): Promise<Event> => {
    if (!user?.$id) throw new Error('User not authenticated');

    const eventData = {
      ...data,
      userId: user.$id,
      ownerName: user.name,
    };

    const newEvent = await createEvent(eventData);
    await loadEvents();

    // Set as current event if it's the first one
    if (events.length === 0) {
      setCurrentEvent(newEvent);
    }

    return newEvent;
  };

  const updateEventData = async (eventId: string, data: Partial<CreateEventData>): Promise<Event> => {
    const updatedEvent = await updateEvent(eventId, data);
    await loadEvents();

    // Update current event if it's the one being updated
    if (currentEvent?.$id === eventId) {
      const refreshedEvent = await getEvent(eventId);
      setCurrentEventState(refreshedEvent);
    }

    return updatedEvent;
  };

  const deleteEventData = async (eventId: string): Promise<void> => {
    await deleteEvent(eventId);

    // If deleting current event, switch to another
    if (currentEvent?.$id === eventId) {
      setCurrentEvent(null);
      setCurrentEventId(null);
    }

    await loadEvents();
  };

  const refreshEvents = async () => {
    await loadEvents();
  };

  return (
    <EventContext.Provider
      value={{
        currentEvent,
        events,
        loading,
        setCurrentEvent,
        createNewEvent,
        updateEventData,
        deleteEventData,
        refreshEvents,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
}
