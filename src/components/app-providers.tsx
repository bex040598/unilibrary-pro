"use client";

import { PropsWithChildren, useEffect } from "react";

import { STORAGE_KEYS } from "@/lib/storage";
import { AppStore, useAppStore } from "@/features/store/useAppStore";

function extractPersistedState(state: AppStore) {
  return {
    users: state.users,
    branches: state.branches,
    rooms: state.rooms,
    seats: state.seats,
    records: state.records,
    copies: state.copies,
    digitalResources: state.digitalResources,
    loans: state.loans,
    reservations: state.reservations,
    fines: state.fines,
    bookings: state.bookings,
    acquisitionRequests: state.acquisitionRequests,
    vendors: state.vendors,
    notifications: state.notifications,
    auditLogs: state.auditLogs,
    aiChats: state.aiChats,
    aiRecommendations: state.aiRecommendations,
    readingPlans: state.readingPlans,
    quizzes: state.quizzes,
    flashcards: state.flashcards,
    bibliographyItems: state.bibliographyItems,
    aiUsageLogs: state.aiUsageLogs,
    currentUserId: state.currentUserId,
    language: state.language
  };
}

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEYS.app);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<AppStore>;
        useAppStore.getState().bootstrap(parsed);
      } catch {
        useAppStore.getState().bootstrap();
      }
    } else {
      useAppStore.getState().bootstrap();
    }

    const unsubscribe = useAppStore.subscribe((state) => {
      if (!state.hydrated) {
        return;
      }

      window.localStorage.setItem(STORAGE_KEYS.app, JSON.stringify(extractPersistedState(state)));
    });

    return () => unsubscribe();
  }, []);

  return children;
}
