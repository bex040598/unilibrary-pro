"use client";

import { create } from "zustand";

import { createSeedData } from "@/data/seed";
import { createPasskeyCredentialMock } from "@/lib/auth/passkeyMock";
import { verifyMockPassword, encodeMockPassword } from "@/lib/auth";
import { createBarcode, createQrCode, createRfidTag } from "@/lib/barcode";
import { buildBiometricAuditLog, buildIdentityVerificationRecord } from "@/lib/biometric/biometricAudit";
import { buildBiometricConsent, buildBiometricProfile, biometricConsentText } from "@/lib/biometric/faceEnrollment";
import { compareFaceTemplateHashMock } from "@/lib/biometric/faceTemplate";
import { evaluateLivenessMock, livenessSteps } from "@/lib/biometric/livenessMock";
import { calculateOverdueFine } from "@/lib/fineCalculator";
import { dashboardByRole } from "@/lib/permissions";
import { STORAGE_KEYS } from "@/lib/storage";
import { makeId } from "@/lib/utils";
import {
  AccessLevel,
  AcquisitionRequest,
  AIChatMessage,
  AIRecommendation,
  AIUsageLog,
  AppState,
  BibliographyItem,
  BibliographicRecord,
  BookCopy,
  CopyStatus,
  DigitalResource,
  Flashcard,
  FineReason,
  FineStatus,
  IdentityRiskFlag,
  IdentitySettings,
  IdentityVerificationRecord,
  Loan,
  PaymentMethod,
  Quiz,
  ReadingPlan,
  RecordStatus,
  RepositoryAccessRequest,
  Reservation,
  User,
  UserRole,
  Vendor
} from "@/types";

const baseData = createSeedData();

type ActionResult = {
  success: boolean;
  message: string;
  redirect?: string;
  entityId?: string;
};

type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  role: "student" | "teacher";
  faculty: string;
  department: string;
  group?: string;
  studentId?: string;
  phone?: string;
  cardExpiryDate?: string;
};

type RecordCopyInput = {
  inventoryNumber: string;
  branchId: string;
  roomId?: string;
  shelf: string;
  row: string;
  status: CopyStatus;
  acquisitionDate: string;
  price: number;
  fundingSource: string;
  barcode?: string;
  qrCode?: string;
  rfidTag?: string;
};

type RecordPayload = Omit<
  BibliographicRecord,
  | "id"
  | "controlNumber"
  | "status"
  | "createdBy"
  | "createdAt"
  | "updatedAt"
  | "coverGradient"
  | "borrowCount"
  | "isNewArrival"
> & {
  status: RecordStatus;
  copies: RecordCopyInput[];
};

type ResourcePayload = Omit<
  DigitalResource,
  "id" | "handle" | "views" | "downloads" | "uploadedBy" | "createdAt"
> & {
  accessLevel: AccessLevel;
};

type AcquisitionPayload = Omit<AcquisitionRequest, "id" | "requestedBy" | "createdAt" | "status">;
type VendorPayload = Omit<Vendor, "id">;
type AIUsagePayload = Omit<AIUsageLog, "id" | "createdAt">;
type AIChatPayload = Omit<AIChatMessage, "id" | "createdAt">;
type RecommendationPayload = Omit<AIRecommendation, "id" | "createdAt">;
type BibliographyPayload = Omit<BibliographyItem, "id" | "createdAt" | "userId">;
type ResourceAccessRequestPayload = {
  resourceId: string;
  requesterName: string;
  requesterEmail: string;
  reason: string;
};

type AppActions = {
  bootstrap: (raw?: Partial<AppState>) => void;
  setHydrated: (value: boolean) => void;
  setLanguage: (language: AppState["language"]) => void;
  login: (email: string, password: string) => ActionResult;
  loginWithFaceId: (identifier: string) => ActionResult;
  loginWithQrCard: (identifier: string) => ActionResult;
  loginWithPasskey: (identifier: string) => ActionResult;
  register: (payload: RegisterPayload) => ActionResult;
  logout: () => void;
  markNotificationRead: (notificationId: string) => void;
  reserveBook: (recordId: string) => ActionResult;
  approveReservation: (reservationId: string, actorId: string) => ActionResult;
  issueBook: (payload: { userId: string; copyId: string; issuedBy: string }) => ActionResult;
  returnBook: (payload: { copyId: string; returnedBy: string }) => ActionResult;
  renewLoan: (payload: { loanId: string; actorId: string }) => ActionResult;
  markCopyState: (payload: { copyId: string; status: CopyStatus; actorId: string }) => ActionResult;
  payFine: (payload: { fineId: string; method: PaymentMethod; receiptUrl?: string }) => ActionResult;
  confirmFinePayment: (fineId: string, actorId: string) => ActionResult;
  rejectFineReceipt: (fineId: string, actorId: string) => ActionResult;
  waiveFine: (fineId: string, actorId: string, note: string) => ActionResult;
  addManualFine: (payload: { userId: string; reason: FineReason; amount: number; actorId: string }) => ActionResult;
  saveRecord: (payload: RecordPayload, actorId: string) => ActionResult;
  uploadResource: (payload: ResourcePayload, actorId: string) => ActionResult;
  downloadResource: (payload: { resourceId: string; actorId?: string | null }) => ActionResult;
  requestResourceAccess: (payload: ResourceAccessRequestPayload) => ActionResult;
  updateResourceAccessRequestStatus: (
    requestId: string,
    status: RepositoryAccessRequest["status"],
    actorId: string
  ) => ActionResult;
  bookSeat: (payload: {
    roomId: string;
    seatId: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => ActionResult;
  checkInBooking: (bookingId: string, actorId: string) => ActionResult;
  cancelBooking: (bookingId: string, actorId: string) => ActionResult;
  markNoShow: (bookingId: string, actorId: string) => ActionResult;
  createAcquisitionRequest: (payload: AcquisitionPayload, actorId: string) => ActionResult;
  updateAcquisitionStatus: (requestId: string, status: AcquisitionRequest["status"], actorId: string) => ActionResult;
  addVendor: (payload: VendorPayload, actorId: string) => ActionResult;
  trackEntityView: (payload: { actorId: string; entity: "record" | "resource"; entityId: string; details: string }) => void;
  appendAIChat: (payload: AIChatPayload) => void;
  saveAIRecommendations: (payload: RecommendationPayload[]) => void;
  saveReadingPlan: (plan: ReadingPlan) => ActionResult;
  toggleReadingPlanItem: (payload: { planId: string; day: number; actorId: string }) => void;
  saveQuiz: (quiz: Quiz) => ActionResult;
  scoreQuiz: (payload: { quizId: string; score: number; actorId: string }) => ActionResult;
  saveFlashcards: (cards: Flashcard[]) => ActionResult;
  updateFlashcardStatus: (payload: { flashcardId: string; status: Flashcard["status"]; actorId: string }) => ActionResult;
  addBibliographyItem: (payload: BibliographyPayload) => ActionResult;
  removeBibliographyItem: (bibliographyId: string) => void;
  logAIUsage: (payload: AIUsagePayload) => void;
  enrollFaceId: (payload: { userId: string; templateSeed: string; completedSteps: number; consentVersion?: string }) => ActionResult;
  deleteFaceId: (userId: string, actorId: string) => ActionResult;
  withdrawBiometricConsent: (userId: string, actorId: string) => ActionResult;
  createPasskey: (payload: { userId: string; deviceName: string }) => ActionResult;
  deactivatePasskey: (credentialId: string, actorId: string) => ActionResult;
  regenerateStudentCard: (userId: string, actorId: string) => ActionResult;
  reportLostCard: (userId: string, actorId: string) => ActionResult;
  verifyStudentIdentity: (payload: {
    actorId: string;
    userId: string;
    identifier: string;
    purpose: string;
  }) => { success: boolean; message: string; result: IdentityVerificationRecord["result"]; confidence: IdentityVerificationRecord["confidence"] };
  logIdentityVerification: (payload: Omit<IdentityVerificationRecord, "id" | "createdAt">) => void;
  updateIdentitySettings: (payload: Partial<IdentitySettings>, actorId: string) => ActionResult;
};

export type AppStore = AppState & AppActions;

const initialState: AppState = {
  ...baseData,
  currentUserId: null,
  language: "uz",
  hydrated: false
};

function addAudit(
  state: AppState,
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  details: string
) {
  return [
    {
      id: makeId("audit", state.auditLogs.length + 1),
      userId,
      action,
      entity,
      entityId,
      details,
      createdAt: new Date().toISOString()
    },
    ...state.auditLogs
  ];
}

function addNotification(
  state: AppState,
  userId: string,
  title: string,
  message: string,
  type: AppState["notifications"][number]["type"]
) {
  return [
    {
      id: makeId("notification", state.notifications.length + 1),
      userId,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    },
    ...state.notifications
  ];
}

function addAIUsage(state: AppState, payload: AIUsagePayload) {
  return [
    {
      id: makeId("aiuse", state.aiUsageLogs.length + 1),
      createdAt: new Date().toISOString(),
      ...payload
    },
    ...state.aiUsageLogs
  ];
}

function addBiometricAudit(state: AppState, payload: {
  userId: string;
  action: string;
  result: string;
  deviceInfo?: string;
}) {
  return [buildBiometricAuditLog(payload), ...state.biometricAuditLogs];
}

function addIdentityVerification(state: AppState, payload: Omit<IdentityVerificationRecord, "id" | "createdAt">) {
  return [buildIdentityVerificationRecord(payload), ...state.identityVerificationRecords];
}

function addRiskFlag(state: AppState, payload: Omit<IdentityRiskFlag, "id" | "createdAt" | "status">) {
  return [
    {
      id: makeId("risk", state.identityRiskFlags.length + 1),
      createdAt: new Date().toISOString(),
      status: "open" as const,
      ...payload
    },
    ...state.identityRiskFlags
  ];
}

function getCurrentUser(state: AppState) {
  return state.users.find((item) => item.id === state.currentUserId) ?? null;
}

function getTemplateSeed(user: User) {
  return user.studentId || user.email;
}

function resolveUserByIdentifier(state: AppState, identifier: string) {
  const normalized = identifier.trim().toLowerCase();
  return (
    state.users.find((item) => item.email.toLowerCase() === normalized) ||
    state.users.find((item) => item.studentId?.toLowerCase() === normalized) ||
    state.users.find((item) => item.membershipNumber.toLowerCase() === normalized) ||
    state.users.find((item) => item.cardQrCode.toLowerCase() === normalized)
  );
}

function getLoanLimit(role: UserRole) {
  if (role === "teacher") {
    return 10;
  }
  if (role === "student") {
    return 5;
  }
  return 0;
}

function syncLanguageStorage(language: AppState["language"]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEYS.language, language);
  }
}

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,
  bootstrap: (raw) =>
    set((state) => {
      const language =
        raw?.language ??
        (typeof window !== "undefined"
          ? (window.localStorage.getItem(STORAGE_KEYS.language) as AppState["language"] | null)
          : null) ??
        state.language;

      syncLanguageStorage(language);
      const nextState = {
        ...state,
        ...raw,
        language,
        hydrated: true
      };
      return {
        ...nextState,
        users: (nextState.users ?? state.users).map((user) => ({
          ...user,
          cardBarcode: user.cardBarcode ?? createBarcode(user.studentId ?? user.email),
          cardStatus: user.cardStatus ?? "active",
          cardExpiryDate:
            user.cardExpiryDate ?? new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().slice(0, 10)
        })),
        biometricProfiles: nextState.biometricProfiles ?? state.biometricProfiles,
        biometricConsents: nextState.biometricConsents ?? state.biometricConsents,
        biometricAuditLogs: nextState.biometricAuditLogs ?? state.biometricAuditLogs,
        passkeyCredentials: nextState.passkeyCredentials ?? state.passkeyCredentials,
        identityRiskFlags: nextState.identityRiskFlags ?? state.identityRiskFlags,
        identityVerificationRecords: nextState.identityVerificationRecords ?? state.identityVerificationRecords,
        identitySettings: nextState.identitySettings ?? state.identitySettings
      };
    }),
  setHydrated: (value) => set({ hydrated: value }),
  setLanguage: (language) => {
    syncLanguageStorage(language);
    set({ language });
  },
  login: (email, password) => {
    const state = get();
    const user = state.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (!user || !verifyMockPassword(user.passwordHashMock, password)) {
      return { success: false, message: "Email yoki parol noto‘g‘ri." };
    }

    if (user.status === "blocked") {
      return { success: false, message: "Ushbu a’zo bloklangan. Librarian desk orqali tekshiring." };
    }

    set({
      currentUserId: user.id,
      auditLogs: addAudit(state, user.id, "LOGIN", "User", user.id, "User signed in via mock authentication"),
      identityVerificationRecords: addIdentityVerification(state, {
        userId: user.id,
        method: "email_password",
        result: "verified",
        confidence: "high",
        purpose: "Portal login",
        details: "Email and password login"
      })
    });
    return {
      success: true,
      message: "Kirish muvaffaqiyatli bajarildi.",
      redirect: user.role === "guest" ? "/" : dashboardByRole[user.role]
    };
  },
  loginWithFaceId: (identifier) => {
    const state = get();
    if (!state.identitySettings.faceIdLoginEnabled) {
      return { success: false, message: "Face ID login vaqtincha o'chirilgan." };
    }

    const user = resolveUserByIdentifier(state, identifier);
    if (!user) {
      return { success: false, message: "Foydalanuvchi topilmadi." };
    }

    const profile = state.biometricProfiles.find((item) => item.userId === user.id && item.enabled && item.status === "active");
    const consent = state.biometricConsents.find((item) => item.userId === user.id && item.status === "granted");
    if (!profile || !consent) {
      return {
        success: false,
        message: "Ushbu akkaunt uchun Face ID yoqilmagan. Email/parol orqali kiring yoki Face IDni profil sozlamalarida yoqing."
      };
    }

    const liveness = evaluateLivenessMock(identifier, livenessSteps.length);
    if (!liveness.success || liveness.score < state.identitySettings.livenessThreshold) {
      set({
        biometricAuditLogs: addBiometricAudit(state, {
          userId: user.id,
          action: "FACE_ID_LOGIN",
          result: "liveness_failed"
        }),
        identityRiskFlags: addRiskFlag(state, {
          userId: user.id,
          riskType: "repeated_liveness_failure",
          severity: "medium",
          description: "Face ID login liveness tekshiruvi muvaffaqiyatsiz yakunlandi."
        }),
        identityVerificationRecords: addIdentityVerification(state, {
          userId: user.id,
          method: "face_id",
          result: "liveness_failed",
          confidence: "low",
          purpose: "Portal login",
          details: "Face ID login liveness failed"
        })
      });
      return { success: false, message: "Liveness tekshiruvi muvaffaqiyatsiz tugadi." };
    }

    const comparison = compareFaceTemplateHashMock(profile.templateHashMock, getTemplateSeed(user));
    if (!comparison.matched) {
      set({
        biometricAuditLogs: addBiometricAudit(state, {
          userId: user.id,
          action: "FACE_ID_LOGIN",
          result: "not_matched"
        }),
        identityVerificationRecords: addIdentityVerification(state, {
          userId: user.id,
          method: "face_id",
          result: "not_matched",
          confidence: "low",
          purpose: "Portal login",
          details: "Template comparison failed"
        })
      });
      return { success: false, message: "Face ID mos kelmadi." };
    }

    set({
      currentUserId: user.id,
      biometricProfiles: state.biometricProfiles.map((item) =>
        item.userId === user.id ? { ...item, lastVerifiedAt: new Date().toISOString() } : item
      ),
      biometricAuditLogs: addBiometricAudit(state, {
        userId: user.id,
        action: "FACE_ID_LOGIN",
        result: "matched"
      }),
      auditLogs: addAudit(state, user.id, "FACE_ID_LOGIN", "User", user.id, "User signed in via Face ID mock"),
      identityVerificationRecords: addIdentityVerification(state, {
        userId: user.id,
        method: "face_id",
        result: "matched",
        confidence: "high",
        purpose: "Portal login",
        details: "Face ID login succeeded"
      })
    });
    return { success: true, message: "Face ID orqali kirish muvaffaqiyatli bajarildi.", redirect: dashboardByRole[user.role as Exclude<UserRole, "guest">] };
  },
  loginWithQrCard: (identifier) => {
    const state = get();
    if (!state.identitySettings.qrCardLoginEnabled) {
      return { success: false, message: "QR card login vaqtincha o'chirilgan." };
    }
    const user = resolveUserByIdentifier(state, identifier);
    if (!user || user.cardStatus === "reported_lost") {
      return { success: false, message: "QR student card faol emas yoki topilmadi." };
    }

    set({
      currentUserId: user.id,
      biometricAuditLogs: addBiometricAudit(state, {
        userId: user.id,
        action: "QR_CARD_LOGIN",
        result: "verified"
      }),
      auditLogs: addAudit(state, user.id, "QR_CARD_LOGIN", "User", user.id, "User signed in via QR student card"),
      identityVerificationRecords: addIdentityVerification(state, {
        userId: user.id,
        method: "qr_card",
        result: "verified",
        confidence: "high",
        purpose: "Portal login",
        details: "QR student card login"
      })
    });
    return { success: true, message: "QR student card orqali kirish bajarildi.", redirect: dashboardByRole[user.role as Exclude<UserRole, "guest">] };
  },
  loginWithPasskey: (identifier) => {
    const state = get();
    if (!state.identitySettings.passkeyEnabled) {
      return { success: false, message: "Passkey login vaqtincha o'chirilgan." };
    }

    const user = resolveUserByIdentifier(state, identifier);
    if (!user) {
      return { success: false, message: "Foydalanuvchi topilmadi." };
    }

    const credential = state.passkeyCredentials.find((item) => item.userId === user.id && item.status === "active");
    if (!credential) {
      return { success: false, message: "Ushbu akkaunt uchun passkey yaratilmagan." };
    }

    set({
      currentUserId: user.id,
      passkeyCredentials: state.passkeyCredentials.map((item) =>
        item.id === credential.id ? { ...item, lastUsedAt: new Date().toISOString() } : item
      ),
      biometricAuditLogs: addBiometricAudit(state, {
        userId: user.id,
        action: "PASSKEY_LOGIN",
        result: "verified",
        deviceInfo: credential.deviceName
      }),
      auditLogs: addAudit(state, user.id, "PASSKEY_LOGIN", "PasskeyCredential", credential.id, "User signed in via passkey mock"),
      identityVerificationRecords: addIdentityVerification(state, {
        userId: user.id,
        method: "passkey",
        result: "verified",
        confidence: "high",
        purpose: "Portal login",
        details: credential.deviceName
      })
    });
    return { success: true, message: "Passkey orqali kirish bajarildi.", redirect: dashboardByRole[user.role as Exclude<UserRole, "guest">] };
  },
  register: (payload) => {
    const state = get();
    const exists = state.users.some((item) => item.email.toLowerCase() === payload.email.toLowerCase());
    if (exists) {
      return { success: false, message: "Bu email allaqachon ro‘yxatdan o‘tgan." };
    }

    const duplicateStudent = payload.studentId
      ? state.users.find((item) => item.studentId?.toLowerCase() === payload.studentId?.toLowerCase())
      : null;
    if (duplicateStudent) {
      set({
        identityRiskFlags: addRiskFlag(state, {
          userId: duplicateStudent.id,
          riskType: "duplicate_student_id",
          severity: "high",
          description: `${payload.studentId} raqami bilan takroriy ro'yxatdan o'tish urinishi aniqlangan.`
        }),
        biometricAuditLogs: addBiometricAudit(state, {
          userId: duplicateStudent.id,
          action: "DUPLICATE_STUDENT_ID",
          result: "review_required"
        }),
        auditLogs: addAudit(state, duplicateStudent.id, "IDENTITY_RISK_FLAG", "IdentityRiskFlag", duplicateStudent.id, payload.studentId ?? "duplicate")
      });
      return { success: false, message: "Student ID takrorlandi. Librarian yoki admin review talab qilinadi." };
    }

    const role = payload.role;
    const nextUser: User = {
      id: makeId(role, state.users.length + 1),
      fullName: payload.fullName,
      email: payload.email,
      passwordHashMock: encodeMockPassword(payload.password),
      role,
      studentId: role === "student" ? payload.studentId ?? `ST-${2026000 + state.users.length}` : undefined,
      employeeId: role === "teacher" ? `EMP-${9000 + state.users.length}` : undefined,
      phone: payload.phone ?? "+998 90 000 00 00",
      faculty: payload.faculty,
      department: payload.department,
      group: role === "student" ? payload.group : undefined,
      status: "active",
      membershipNumber: `M-${role === "student" ? "STU" : "TEA"}-${state.users.length + 1000}`,
      cardQrCode: createQrCode(payload.email),
      cardBarcode: createBarcode(payload.studentId ?? payload.email),
      cardStatus: "active",
      cardExpiryDate: payload.cardExpiryDate ?? new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().slice(0, 10),
      createdAt: new Date().toISOString()
    };

    set({
      users: [nextUser, ...state.users],
      currentUserId: nextUser.id,
      notifications: addNotification(
        state,
        nextUser.id,
        "Kabinet yaratildi",
        "Foydalanuvchi kabineti va a’zolik kartasi yaratildi.",
        "system"
      ),
      auditLogs: addAudit(state, nextUser.id, "REGISTER", "User", nextUser.id, "New member account registered")
    });

    return {
      success: true,
      message: "Ro‘yxatdan o‘tish muvaffaqiyatli bajarildi.",
      redirect: dashboardByRole[role]
    };
  },
  logout: () =>
    set((state) => ({
      currentUserId: null,
      auditLogs:
        state.currentUserId
          ? addAudit(state, state.currentUserId, "LOGOUT", "User", state.currentUserId, "User signed out")
          : state.auditLogs
    })),
  markNotificationRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((item) =>
        item.id === notificationId ? { ...item, isRead: true } : item
      )
    })),
  reserveBook: (recordId) => {
    const state = get();
    const user = getCurrentUser(state);
    if (!user || (user.role !== "student" && user.role !== "teacher")) {
      return { success: false, message: "Rezervatsiya uchun tizimga a’zo sifatida kiring." };
    }

    const existing = state.reservations.find(
      (item) =>
        item.recordId === recordId &&
        item.userId === user.id &&
        ["pending", "approved", "collected"].includes(item.status)
    );
    if (existing) {
      return { success: false, message: "Ushbu bibliografik yozuv bo‘yicha faol rezervatsiya mavjud." };
    }

    const availableCopy = state.copies.find((item) => item.recordId === recordId && item.status === "available");
    if (!availableCopy) {
      return { success: false, message: "Hozircha mavjud nusxa topilmadi." };
    }

    const nextReservation: Reservation = {
      id: makeId("reservation", state.reservations.length + 1),
      userId: user.id,
      recordId,
      copyId: availableCopy.id,
      status: "pending",
      reservedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    };

    set({
      reservations: [nextReservation, ...state.reservations],
      copies: state.copies.map((copy) =>
        copy.id === availableCopy.id ? { ...copy, status: "reserved" } : copy
      ),
      notifications: addNotification(
        state,
        user.id,
        "Rezervatsiya qabul qilindi",
        "Bibliografik yozuv bo‘yicha nusxa band qilindi.",
        "reservation"
      ),
      auditLogs: addAudit(
        state,
        user.id,
        "CREATE_RESERVATION",
        "Reservation",
        nextReservation.id,
        `Record ${recordId} reserved by ${user.fullName}`
      )
    });

    return { success: true, message: "Rezervatsiya yaratildi.", entityId: nextReservation.id };
  },
  approveReservation: (reservationId, actorId) => {
    const state = get();
    const reservation = state.reservations.find((item) => item.id === reservationId);
    if (!reservation) {
      return { success: false, message: "Rezervatsiya topilmadi." };
    }

    set({
      reservations: state.reservations.map((item) =>
        item.id === reservationId ? { ...item, status: "approved" } : item
      ),
      notifications: addNotification(
        state,
        reservation.userId,
        "Rezervatsiya tasdiqlandi",
        "Kutubxonachi nusxani olib ketish uchun tayyorladi.",
        "reservation"
      ),
      auditLogs: addAudit(state, actorId, "APPROVE_RESERVATION", "Reservation", reservationId, "Reservation approved")
    });
    return { success: true, message: "Rezervatsiya tasdiqlandi." };
  },
  issueBook: ({ userId, copyId, issuedBy }) => {
    const state = get();
    const user = state.users.find((item) => item.id === userId);
    const copy = state.copies.find((item) => item.id === copyId);
    if (!user || !copy) {
      return { success: false, message: "Talaba yoki nusxa aniqlanmadi." };
    }

    if (!["available", "reserved"].includes(copy.status)) {
      return { success: false, message: "Nusxa circulation uchun tayyor emas." };
    }

    if (user.status === "blocked") {
      return { success: false, message: "Foydalanuvchi bloklangan." };
    }

    const activeLoans = state.loans.filter(
      (item) => item.userId === user.id && (item.status === "issued" || item.status === "overdue")
    ).length;
    if (activeLoans >= getLoanLimit(user.role)) {
      return { success: false, message: "Borrowing limit oshib ketgan." };
    }

    const unpaidFines = state.fines
      .filter((item) => item.userId === user.id && ["unpaid", "pending_confirmation"].includes(item.status))
      .reduce((acc, item) => acc + item.amount, 0);
    if (unpaidFines > 20000) {
      return { success: false, message: "To‘lanmagan jarimalar miqdori juda yuqori." };
    }

    const nextLoan: Loan = {
      id: makeId("loan", state.loans.length + 1),
      userId: user.id,
      copyId,
      issuedBy,
      issuedAt: new Date().toISOString(),
      dueAt: new Date(Date.now() + (user.role === "teacher" ? 21 : 14) * 24 * 60 * 60 * 1000).toISOString(),
      status: "issued",
      renewCount: 0,
      fineAmount: 0
    };

    const reservations = state.reservations.map((item) =>
      item.copyId === copyId && item.userId === user.id && item.status !== "cancelled"
        ? { ...item, status: "collected" as const }
        : item
    );

    set({
      loans: [nextLoan, ...state.loans],
      copies: state.copies.map((item) =>
        item.id === copyId ? { ...item, status: "borrowed" } : item
      ),
      reservations,
      notifications: addNotification(
        state,
        user.id,
        "Kitob berildi",
        "Circulation desk orqali loan rasmiylashtirildi.",
        "loan"
      ),
      auditLogs: addAudit(
        state,
        issuedBy,
        "ISSUE_LOAN",
        "Loan",
        nextLoan.id,
        `Issued copy ${copy.inventoryNumber} to ${user.fullName}`
      )
    });

    return { success: true, message: "Kitob berildi.", entityId: nextLoan.id };
  },
  returnBook: ({ copyId, returnedBy }) => {
    const state = get();
    const loan = state.loans.find((item) => item.copyId === copyId && (item.status === "issued" || item.status === "overdue"));
    const copy = state.copies.find((item) => item.id === copyId);
    if (!loan || !copy) {
      return { success: false, message: "Faol loan topilmadi." };
    }

    const user = state.users.find((item) => item.id === loan.userId);
    const fine = calculateOverdueFine(loan);
    const nextFines =
      fine.amount > 0
        ? [
            {
              id: makeId("fine", state.fines.length + 1),
              userId: loan.userId,
              loanId: loan.id,
              reason: "overdue" as const,
              amount: fine.amount,
              status: "unpaid" as FineStatus,
              createdAt: new Date().toISOString()
            },
            ...state.fines
          ]
        : state.fines;

    set({
      loans: state.loans.map((item) =>
        item.id === loan.id
          ? {
              ...item,
              returnedAt: new Date().toISOString(),
              returnedBy,
              status: "returned",
              fineAmount: fine.amount
            }
          : item
      ),
      copies: state.copies.map((item) =>
        item.id === copyId ? { ...item, status: "available" } : item
      ),
      fines: nextFines,
      notifications:
        user && fine.amount > 0
          ? addNotification(
              state,
              user.id,
              "Muddati o‘tgan loan yopildi",
              `Qaytarish vaqtida ${fine.amount} UZS jarima hisoblandi.`,
              "fine"
            )
          : state.notifications,
      auditLogs: addAudit(
        state,
        returnedBy,
        "RETURN_COPY",
        "Loan",
        loan.id,
        fine.amount > 0 ? `Returned with overdue fine ${fine.amount}` : "Returned without fine"
      )
    });

    return {
      success: true,
      message: fine.amount > 0 ? `Qaytarish yakunlandi. Jarima: ${fine.amount} UZS.` : "Qaytarish yakunlandi."
    };
  },
  renewLoan: ({ loanId, actorId }) => {
    const state = get();
    const loan = state.loans.find((item) => item.id === loanId);
    if (!loan) {
      return { success: false, message: "Loan topilmadi." };
    }

    if (loan.renewCount >= 2) {
      return { success: false, message: "Renew limit tugagan." };
    }

    const copy = state.copies.find((item) => item.id === loan.copyId);
    const hasReservationConflict = state.reservations.some(
      (item) => item.copyId === loan.copyId && item.userId !== loan.userId && item.status === "approved"
    );
    if (!copy || hasReservationConflict) {
      return { success: false, message: "Rezervatsiya konflikti sabab renew rad etildi." };
    }

    const user = state.users.find((item) => item.id === loan.userId);
    const nextDue = new Date(loan.dueAt);
    nextDue.setDate(nextDue.getDate() + 7);

    set({
      loans: state.loans.map((item) =>
        item.id === loanId
          ? {
              ...item,
              dueAt: nextDue.toISOString(),
              renewCount: item.renewCount + 1,
              status: "issued"
            }
          : item
      ),
      notifications:
        user
          ? addNotification(
              state,
              user.id,
              "Loan muddati uzaytirildi",
              `Yangi due date: ${nextDue.toLocaleDateString("uz-UZ")}`,
              "loan"
            )
          : state.notifications,
      auditLogs: addAudit(state, actorId, "RENEW_LOAN", "Loan", loanId, "Loan due date extended")
    });

    return { success: true, message: "Muddat uzaytirildi." };
  },
  markCopyState: ({ copyId, status, actorId }) => {
    const state = get();
    const copy = state.copies.find((item) => item.id === copyId);
    if (!copy) {
      return { success: false, message: "Nusxa topilmadi." };
    }

    set({
      copies: state.copies.map((item) => (item.id === copyId ? { ...item, status } : item)),
      auditLogs: addAudit(state, actorId, "UPDATE_COPY_STATUS", "Copy", copyId, `Status set to ${status}`)
    });
    return { success: true, message: "Nusxa holati yangilandi." };
  },
  payFine: ({ fineId, method, receiptUrl }) => {
    const state = get();
    const fine = state.fines.find((item) => item.id === fineId);
    if (!fine) {
      return { success: false, message: "Jarima topilmadi." };
    }

    set({
      fines: state.fines.map((item) =>
        item.id === fineId
          ? { ...item, paymentMethod: method, receiptUrl, status: "paid", paidAt: new Date().toISOString() }
          : item
      ),
      notifications: addNotification(
        state,
        fine.userId,
        "Jarima to'landi",
        "To'lov mock usuli bilan qabul qilindi va hisob yopildi.",
        "fine"
      ),
      auditLogs: addAudit(state, fine.userId, "PAY_FINE", "Fine", fineId, `Fine paid with ${method}`)
    });

    return { success: true, message: "Jarima to'landi." };
  },
  confirmFinePayment: (fineId, actorId) => {
    const state = get();
    const fine = state.fines.find((item) => item.id === fineId);
    if (!fine) {
      return { success: false, message: "Jarima topilmadi." };
    }

    set({
      fines: state.fines.map((item) =>
        item.id === fineId ? { ...item, status: "paid", paidAt: new Date().toISOString() } : item
      ),
      auditLogs: addAudit(state, actorId, "CONFIRM_FINE", "Fine", fineId, "Payment confirmed")
    });
    return { success: true, message: "To‘lov tasdiqlandi." };
  },
  rejectFineReceipt: (fineId, actorId) => {
    const state = get();
    const fine = state.fines.find((item) => item.id === fineId);
    if (!fine) {
      return { success: false, message: "Jarima topilmadi." };
    }

    set({
      fines: state.fines.map((item) =>
        item.id === fineId ? { ...item, status: "rejected" } : item
      ),
      auditLogs: addAudit(state, actorId, "REJECT_FINE_RECEIPT", "Fine", fineId, "Receipt rejected")
    });
    return { success: true, message: "Chek rad etildi." };
  },
  waiveFine: (fineId, actorId, note) => {
    const state = get();
    const fine = state.fines.find((item) => item.id === fineId);
    if (!fine) {
      return { success: false, message: "Jarima topilmadi." };
    }

    set({
      fines: state.fines.map((item) =>
        item.id === fineId ? { ...item, status: "waived", note } : item
      ),
      auditLogs: addAudit(state, actorId, "WAIVE_FINE", "Fine", fineId, note)
    });
    return { success: true, message: "Jarima bekor qilindi." };
  },
  addManualFine: ({ userId, reason, amount, actorId }) => {
    const state = get();
    const fineId = makeId("fine", state.fines.length + 1);
    set({
      fines: [
        {
          id: fineId,
          userId,
          reason,
          amount,
          status: "unpaid",
          createdAt: new Date().toISOString()
        },
        ...state.fines
      ],
      auditLogs: addAudit(state, actorId, "ADD_MANUAL_FINE", "Fine", fineId, `Manual fine ${amount} for ${reason}`)
    });
    return { success: true, message: "Qo‘lda jarima qo‘shildi." };
  },
  saveRecord: (payload, actorId) => {
    const state = get();
    const nextId = makeId("record", state.records.length + 1);
    const record: BibliographicRecord = {
      ...payload,
      id: nextId,
      controlNumber: `CN-${10000 + state.records.length + 1}`,
      status: payload.status,
      createdBy: actorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      coverGradient: "from-blue-700 via-cyan-500 to-emerald-500",
      borrowCount: 0,
      isNewArrival: true
    };

    const nextCopies: BookCopy[] = payload.copies.map((copy, index) => {
      const inventory = copy.inventoryNumber || `INV-${2026}${String(state.copies.length + index + 1).padStart(5, "0")}`;
      return {
        id: makeId("copy", state.copies.length + index + 1),
        recordId: nextId,
        inventoryNumber: inventory,
        barcode: copy.barcode || createBarcode(inventory),
        qrCode: copy.qrCode || createQrCode(inventory),
        rfidTag: copy.rfidTag || createRfidTag(inventory),
        branchId: copy.branchId,
        roomId: copy.roomId,
        shelf: copy.shelf,
        row: copy.row,
        status: copy.status,
        acquisitionDate: copy.acquisitionDate,
        price: copy.price,
        fundingSource: copy.fundingSource
      };
    });

    set({
      records: [record, ...state.records],
      copies: [...nextCopies, ...state.copies],
      auditLogs: addAudit(
        state,
        actorId,
        payload.status === "published" ? "PUBLISH_RECORD" : "SAVE_RECORD_DRAFT",
        "BibliographicRecord",
        nextId,
        `Record ${record.title}`
      )
    });

    return {
      success: true,
      message: payload.status === "published" ? "Yozuv katalogga qo‘shildi." : "Qoralama saqlandi.",
      entityId: nextId
    };
  },
  uploadResource: (payload, actorId) => {
    const state = get();
    const nextId = makeId("resource", state.digitalResources.length + 1);
    const resource: DigitalResource = {
      ...payload,
      id: nextId,
      handle: `hdl:123456/${5000 + state.digitalResources.length + 1}`,
      views: 0,
      downloads: 0,
      uploadedBy: actorId,
      createdAt: new Date().toISOString()
    };

    set({
      digitalResources: [resource, ...state.digitalResources],
      auditLogs: addAudit(state, actorId, "UPLOAD_RESOURCE", "DigitalResource", nextId, resource.title)
    });
    return { success: true, message: "Resurs repositoryga qo‘shildi.", entityId: nextId };
  },
  downloadResource: ({ resourceId, actorId }) => {
    const state = get();
    const resource = state.digitalResources.find((item) => item.id === resourceId);
    if (!resource) {
      return { success: false, message: "Resurs topilmadi." };
    }

    const auditActor = actorId ?? state.currentUserId ?? "guest";
    set({
      digitalResources: state.digitalResources.map((item) =>
        item.id === resourceId ? { ...item, downloads: item.downloads + 1 } : item
      ),
      auditLogs: addAudit(state, auditActor, "DOWNLOAD_RESOURCE", "DigitalResource", resourceId, resource.title)
    });

    return { success: true, message: "Yuklab olish qayd etildi." };
  },
  requestResourceAccess: ({ resourceId, requesterName, requesterEmail, reason }) => {
    const state = get();
    const currentUser = getCurrentUser(state);
    const resource = state.digitalResources.find((item) => item.id === resourceId);
    if (!resource) {
      return { success: false, message: "Resurs topilmadi." };
    }

    const existing = state.resourceAccessRequests.find(
      (item) =>
        item.resourceId === resourceId &&
        item.requesterEmail.toLowerCase() === requesterEmail.toLowerCase() &&
        item.status === "pending"
    );
    if (existing) {
      return { success: false, message: "Bu resurs uchun faol ruxsat so'rovi mavjud." };
    }

    const requestId = makeId("access", state.resourceAccessRequests.length + 1);
    set({
      resourceAccessRequests: [
        {
          id: requestId,
          resourceId,
          userId: currentUser?.id,
          requesterName,
          requesterEmail,
          reason,
          status: "pending",
          createdAt: new Date().toISOString()
        },
        ...state.resourceAccessRequests
      ],
      identityRiskFlags: currentUser?.id
        ? addRiskFlag(state, {
            userId: currentUser.id,
            riskType: "restricted_access_attempt",
            severity: "medium",
            description: `${resource.title} resursi uchun restricted access so'rovi yuborildi.`
          })
        : state.identityRiskFlags,
      identityVerificationRecords: addIdentityVerification(state, {
        userId: currentUser?.id,
        actorId: currentUser?.id,
        method: "repository_access",
        result: "pending",
        confidence: "medium",
        purpose: "Restricted repository access request",
        details: resource.title
      }),
      auditLogs: addAudit(
        state,
        currentUser?.id ?? "guest",
        "REQUEST_RESOURCE_ACCESS",
        "RepositoryAccessRequest",
        requestId,
        `${resource.title} access requested`
      )
    });

    return { success: true, message: "Ruxsat so'rovi yuborildi.", entityId: requestId };
  },
  updateResourceAccessRequestStatus: (requestId, status, actorId) => {
    const state = get();
    const request = state.resourceAccessRequests.find((item) => item.id === requestId);
    if (!request) {
      return { success: false, message: "Ruxsat so'rovi topilmadi." };
    }

    set({
      resourceAccessRequests: state.resourceAccessRequests.map((item) =>
        item.id === requestId
          ? { ...item, status, reviewedBy: actorId, reviewedAt: new Date().toISOString() }
          : item
      ),
      notifications:
        request.userId
          ? addNotification(
              state,
              request.userId,
              "Repository ruxsati yangilandi",
              `${status === "approved" ? "So'rov ma'qullandi." : "So'rov rad etildi."}`,
              "repository"
            )
          : state.notifications,
      auditLogs: addAudit(state, actorId, "REVIEW_RESOURCE_ACCESS", "RepositoryAccessRequest", requestId, status)
    });

    return { success: true, message: "Ruxsat so'rovi yangilandi." };
  },
  bookSeat: ({ roomId, seatId, date, startTime, endTime }) => {
    const state = get();
    const currentUser = getCurrentUser(state);
    if (!currentUser) {
      return { success: false, message: "Booking uchun tizimga kiring." };
    }

    const seat = state.seats.find((item) => item.id === seatId && item.roomId === roomId);
    if (!seat || seat.status === "disabled") {
      return { success: false, message: "Tanlangan joy mavjud emas." };
    }

    const seatConflict = state.bookings.some(
      (item) =>
        item.roomId === roomId &&
        item.seatId === seatId &&
        item.date === date &&
        item.status !== "cancelled" &&
        item.startTime === startTime
    );
    const userConflict = state.bookings.some(
      (item) =>
        item.userId === currentUser.id &&
        item.date === date &&
        item.startTime === startTime &&
        item.status !== "cancelled"
    );
    if (seatConflict || userConflict) {
      return { success: false, message: "Ushbu vaqt oralig‘i bo‘yicha booking konflikti mavjud." };
    }

    const bookingId = makeId("booking", state.bookings.length + 1);
    set({
      bookings: [
        {
          id: bookingId,
          userId: currentUser.id,
          roomId,
          seatId,
          date,
          startTime,
          endTime,
          status: "booked",
          qrCode: createQrCode(`${currentUser.id}-${seatId}-${date}-${startTime}`)
        },
        ...state.bookings
      ],
      seats: state.seats.map((item) =>
        item.id === seatId ? { ...item, status: "booked" } : item
      ),
      notifications: addNotification(
        state,
        currentUser.id,
        "O‘quv zali booking yaratildi",
        "QR check-in kodi yaratildi va booking kabinetga qo‘shildi.",
        "room"
      ),
      auditLogs: addAudit(
        state,
        currentUser.id,
        "BOOK_SEAT",
        "ReadingRoomBooking",
        bookingId,
        `Seat ${seatId} booked for ${date} ${startTime}`
      )
    });
    return { success: true, message: "Joy band qilindi.", entityId: bookingId };
  },
  checkInBooking: (bookingId, actorId) => {
    const state = get();
    const booking = state.bookings.find((item) => item.id === bookingId);
    if (!booking) {
      return { success: false, message: "Booking topilmadi." };
    }

    set({
      bookings: state.bookings.map((item) =>
        item.id === bookingId ? { ...item, status: "checked_in" } : item
      ),
      seats: state.seats.map((item) =>
        item.id === booking.seatId ? { ...item, status: "occupied" } : item
      ),
      auditLogs: addAudit(state, actorId, "CHECKIN_BOOKING", "ReadingRoomBooking", bookingId, "QR check-in completed")
    });
    return { success: true, message: "QR check-in bajarildi." };
  },
  cancelBooking: (bookingId, actorId) => {
    const state = get();
    const booking = state.bookings.find((item) => item.id === bookingId);
    if (!booking) {
      return { success: false, message: "Booking topilmadi." };
    }

    set({
      bookings: state.bookings.map((item) =>
        item.id === bookingId ? { ...item, status: "cancelled" } : item
      ),
      seats: state.seats.map((item) =>
        item.id === booking.seatId ? { ...item, status: "available" } : item
      ),
      auditLogs: addAudit(state, actorId, "CANCEL_BOOKING", "ReadingRoomBooking", bookingId, "Booking cancelled")
    });
    return { success: true, message: "Booking bekor qilindi." };
  },
  markNoShow: (bookingId, actorId) => {
    const state = get();
    const booking = state.bookings.find((item) => item.id === bookingId);
    if (!booking) {
      return { success: false, message: "Booking topilmadi." };
    }

    set({
      bookings: state.bookings.map((item) =>
        item.id === bookingId ? { ...item, status: "no_show" } : item
      ),
      seats: state.seats.map((item) =>
        item.id === booking.seatId ? { ...item, status: "available" } : item
      ),
      auditLogs: addAudit(state, actorId, "NO_SHOW_BOOKING", "ReadingRoomBooking", bookingId, "Booking marked as no-show")
    });
    return { success: true, message: "No-show qayd etildi." };
  },
  createAcquisitionRequest: (payload, actorId) => {
    const state = get();
    const requestId = makeId("request", state.acquisitionRequests.length + 1);
    set({
      acquisitionRequests: [
        {
          id: requestId,
          requestedBy: actorId,
          status: "requested",
          createdAt: new Date().toISOString(),
          ...payload
        },
        ...state.acquisitionRequests
      ],
      auditLogs: addAudit(state, actorId, "CREATE_ACQUISITION", "AcquisitionRequest", requestId, payload.title)
    });
    return { success: true, message: "Xarid so‘rovi yaratildi.", entityId: requestId };
  },
  updateAcquisitionStatus: (requestId, status, actorId) => {
    const state = get();
    const exists = state.acquisitionRequests.some((item) => item.id === requestId);
    if (!exists) {
      return { success: false, message: "So‘rov topilmadi." };
    }

    set({
      acquisitionRequests: state.acquisitionRequests.map((item) =>
        item.id === requestId ? { ...item, status } : item
      ),
      auditLogs: addAudit(state, actorId, "UPDATE_ACQUISITION_STATUS", "AcquisitionRequest", requestId, status)
    });
    return { success: true, message: "Holat yangilandi." };
  },
  addVendor: (payload, actorId) => {
    const state = get();
    const vendorId = makeId("vendor", state.vendors.length + 1);
    set({
      vendors: [{ id: vendorId, ...payload }, ...state.vendors],
      auditLogs: addAudit(state, actorId, "ADD_VENDOR", "Vendor", vendorId, payload.name)
    });
    return { success: true, message: "Vendor qo‘shildi.", entityId: vendorId };
  },
  trackEntityView: ({ actorId, entity, entityId, details }) =>
    set((state) => ({
      auditLogs: addAudit(
        state,
        actorId,
        entity === "record" ? "VIEW_RECORD" : "VIEW_RESOURCE",
        entity === "record" ? "BibliographicRecord" : "DigitalResource",
        entityId,
        details
      )
    })),
  appendAIChat: (payload) =>
    set((state) => ({
      aiChats: [
        {
          id: makeId("aichat", state.aiChats.length + 1),
          createdAt: new Date().toISOString(),
          ...payload
        },
        ...state.aiChats
      ]
    })),
  saveAIRecommendations: (payload) =>
    set((state) => ({
      aiRecommendations: [
        ...payload.map((item, index) => ({
          id: makeId("airec", state.aiRecommendations.length + index + 1),
          createdAt: new Date().toISOString(),
          ...item
        })),
        ...state.aiRecommendations.filter((existing) => existing.userId !== payload[0]?.userId)
      ]
    })),
  saveReadingPlan: (plan) => {
    const state = get();
    set({
      readingPlans: [plan, ...state.readingPlans],
      notifications: addNotification(
        state,
        plan.userId,
        "Reja saqlandi",
        `${plan.topic} bo'yicha o'qish rejasi kabinetga qo'shildi.`,
        "system"
      ),
      auditLogs: addAudit(state, plan.userId, "SAVE_READING_PLAN", "ReadingPlan", plan.id, plan.topic)
    });
    return { success: true, message: "O'qish reja saqlandi.", entityId: plan.id };
  },
  toggleReadingPlanItem: ({ planId, day, actorId }) =>
    set((state) => ({
      readingPlans: state.readingPlans.map((plan) =>
        plan.id === planId
          ? (() => {
              const nextItems = plan.items.map((item) =>
                item.day === day ? { ...item, completed: !item.completed } : item
              );
              return {
                ...plan,
                items: nextItems,
                status: nextItems.every((item) => item.completed) ? "completed" : "active"
              };
            })()
          : plan
      ),
      auditLogs: addAudit(state, actorId, "TOGGLE_READING_PLAN_ITEM", "ReadingPlan", planId, `Day ${day} toggled`)
    })),
  saveQuiz: (quiz) => {
    const state = get();
    set({
      quizzes: [quiz, ...state.quizzes],
      auditLogs: addAudit(state, quiz.userId, "CREATE_AI_QUIZ", "Quiz", quiz.id, quiz.topic)
    });
    return { success: true, message: "AI test yaratildi.", entityId: quiz.id };
  },
  scoreQuiz: ({ quizId, score, actorId }) => {
    const state = get();
    const quiz = state.quizzes.find((item) => item.id === quizId);
    if (!quiz) {
      return { success: false, message: "Quiz topilmadi." };
    }

    set({
      quizzes: state.quizzes.map((item) => (item.id === quizId ? { ...item, score } : item)),
      auditLogs: addAudit(state, actorId, "SCORE_AI_QUIZ", "Quiz", quizId, `Score ${score}/${quiz.totalQuestions}`)
    });
    return { success: true, message: "Quiz natijasi saqlandi." };
  },
  saveFlashcards: (cards) => {
    const state = get();
    set({
      flashcards: [...cards, ...state.flashcards],
      auditLogs: addAudit(
        state,
        cards[0]?.userId ?? "system",
        "CREATE_FLASHCARDS",
        "Flashcard",
        cards[0]?.id ?? "n/a",
        `${cards.length} flashcard generated`
      )
    });
    return { success: true, message: "Flashcardlar yaratildi." };
  },
  updateFlashcardStatus: ({ flashcardId, status, actorId }) => {
    const state = get();
    set({
      flashcards: state.flashcards.map((item) =>
        item.id === flashcardId
          ? {
              ...item,
              status,
              nextReviewAt: new Date(
                Date.now() + (status === "learned" ? 7 : status === "learning" ? 3 : 1) * 24 * 60 * 60 * 1000
              ).toISOString()
            }
          : item
      ),
      auditLogs: addAudit(state, actorId, "UPDATE_FLASHCARD", "Flashcard", flashcardId, status)
    });
    return { success: true, message: "Flashcard holati yangilandi." };
  },
  addBibliographyItem: (payload) => {
    const state = get();
    const currentUser = getCurrentUser(state);
    if (!currentUser) {
      return { success: false, message: "Bibliografiya uchun tizimga kiring." };
    }
    const bibliographyId = makeId("bib", state.bibliographyItems.length + 1);
    set({
      bibliographyItems: [
        {
          id: bibliographyId,
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
          ...payload
        },
        ...state.bibliographyItems
      ],
      auditLogs: addAudit(state, currentUser.id, "ADD_BIBLIOGRAPHY_ITEM", "BibliographyItem", bibliographyId, payload.recordId)
    });
    return { success: true, message: "Bibliografiyaga qo'shildi.", entityId: bibliographyId };
  },
  removeBibliographyItem: (bibliographyId) =>
    set((state) => ({
      bibliographyItems: state.bibliographyItems.filter((item) => item.id !== bibliographyId)
    })),
  enrollFaceId: ({ userId, templateSeed, completedSteps, consentVersion }) => {
    const state = get();
    const user = state.users.find((item) => item.id === userId);
    if (!user) {
      return { success: false, message: "Foydalanuvchi topilmadi." };
    }

    const liveness = evaluateLivenessMock(templateSeed, completedSteps);
    if (!liveness.success || liveness.score < state.identitySettings.livenessThreshold) {
      set({
        biometricAuditLogs: addBiometricAudit(state, {
          userId,
          action: "FACE_ENROLLMENT",
          result: "liveness_failed"
        }),
        identityRiskFlags: addRiskFlag(state, {
          userId,
          riskType: "repeated_liveness_failure",
          severity: "medium",
          description: "Face enrollment vaqtida liveness tekshiruvi muvaffaqiyatsiz yakunlandi."
        })
      });
      return { success: false, message: "Liveness tekshiruvi muvaffaqiyatsiz tugadi." };
    }

    const profile = buildBiometricProfile({
      userId,
      templateSeed,
      livenessScore: liveness.score,
      consentVersion
    });
    const duplicateFace = state.biometricProfiles.find(
      (item) => item.userId !== userId && item.templateHashMock === profile.templateHashMock && item.status === "active"
    );

    set({
      biometricProfiles: [
        profile,
        ...state.biometricProfiles.filter((item) => item.userId !== userId)
      ],
      biometricConsents: [
        buildBiometricConsent(userId, consentVersion),
        ...state.biometricConsents.filter((item) => item.userId !== userId)
      ],
      biometricAuditLogs: addBiometricAudit(state, {
        userId,
        action: "FACE_ENROLLMENT",
        result: duplicateFace ? "duplicate_face_template" : "enrolled"
      }),
      identityRiskFlags: duplicateFace
        ? addRiskFlag(state, {
            userId,
            riskType: "duplicate_face_template",
            severity: "high",
            description: "Face template boshqa foydalanuvchi bilan mos keldi."
          })
        : state.identityRiskFlags,
      auditLogs: addAudit(state, userId, "ENROLL_FACE_ID", "BiometricProfile", profile.id, "Face ID enrollment completed")
    });

    return { success: true, message: "Face ID muvaffaqiyatli yoqildi.", entityId: profile.id };
  },
  deleteFaceId: (userId, actorId) => {
    const state = get();
    const profile = state.biometricProfiles.find((item) => item.userId === userId);
    if (!profile) {
      return { success: false, message: "Face ID topilmadi." };
    }
    set({
      biometricProfiles: state.biometricProfiles.map((item) =>
        item.userId === userId ? { ...item, enabled: false, status: "deleted", templateHashMock: "deleted" } : item
      ),
      biometricAuditLogs: addBiometricAudit(state, {
        userId,
        action: "DELETE_FACE_ID",
        result: "deleted"
      }),
      auditLogs: addAudit(state, actorId, "DELETE_FACE_ID", "BiometricProfile", profile.id, "Face ID deleted")
    });
    return { success: true, message: "Face ID o'chirildi." };
  },
  withdrawBiometricConsent: (userId, actorId) => {
    const state = get();
    set({
      biometricConsents: state.biometricConsents.map((item) =>
        item.userId === userId
          ? { ...item, status: "withdrawn", withdrawnAt: new Date().toISOString() }
          : item
      ),
      biometricProfiles: state.biometricProfiles.map((item) =>
        item.userId === userId ? { ...item, enabled: false, status: "disabled" } : item
      ),
      biometricAuditLogs: addBiometricAudit(state, {
        userId,
        action: "WITHDRAW_BIOMETRIC_CONSENT",
        result: "withdrawn"
      }),
      auditLogs: addAudit(state, actorId, "WITHDRAW_BIOMETRIC_CONSENT", "BiometricConsent", userId, biometricConsentText)
    });
    return { success: true, message: "Biometrik consent bekor qilindi." };
  },
  createPasskey: ({ userId, deviceName }) => {
    const state = get();
    if (!state.identitySettings.passkeyEnabled) {
      return { success: false, message: "Passkey funksiyasi vaqtincha o'chirilgan." };
    }
    const credential = createPasskeyCredentialMock(userId, deviceName);
    set({
      passkeyCredentials: [credential, ...state.passkeyCredentials.filter((item) => item.userId !== userId)],
      biometricAuditLogs: addBiometricAudit(state, {
        userId,
        action: "CREATE_PASSKEY",
        result: "created",
        deviceInfo: deviceName
      }),
      auditLogs: addAudit(state, userId, "CREATE_PASSKEY", "PasskeyCredential", credential.id, deviceName)
    });
    return { success: true, message: "Passkey yaratildi.", entityId: credential.id };
  },
  deactivatePasskey: (credentialId, actorId) => {
    const state = get();
    const credential = state.passkeyCredentials.find((item) => item.id === credentialId);
    if (!credential) {
      return { success: false, message: "Passkey topilmadi." };
    }
    set({
      passkeyCredentials: state.passkeyCredentials.map((item) =>
        item.id === credentialId ? { ...item, status: "revoked" } : item
      ),
      biometricAuditLogs: addBiometricAudit(state, {
        userId: credential.userId,
        action: "DEACTIVATE_PASSKEY",
        result: "revoked",
        deviceInfo: credential.deviceName
      }),
      auditLogs: addAudit(state, actorId, "DEACTIVATE_PASSKEY", "PasskeyCredential", credentialId, credential.deviceName)
    });
    return { success: true, message: "Passkey o'chirildi." };
  },
  regenerateStudentCard: (userId, actorId) => {
    const state = get();
    const user = state.users.find((item) => item.id === userId);
    if (!user) {
      return { success: false, message: "Foydalanuvchi topilmadi." };
    }
    const nextQr = createQrCode(`${user.email}-${Date.now()}`);
    set({
      users: state.users.map((item) =>
        item.id === userId
          ? {
              ...item,
              cardQrCode: nextQr,
              cardBarcode: createBarcode(`${item.studentId ?? item.email}-${Date.now()}`),
              cardStatus: "active"
            }
          : item
      ),
      biometricAuditLogs: addBiometricAudit(state, {
        userId,
        action: "REGENERATE_QR_CARD",
        result: "regenerated"
      }),
      auditLogs: addAudit(state, actorId, "REGENERATE_QR_CARD", "User", userId, "Digital student card regenerated")
    });
    return { success: true, message: "Student card QR qayta yaratildi." };
  },
  reportLostCard: (userId, actorId) => {
    const state = get();
    set({
      users: state.users.map((item) =>
        item.id === userId ? { ...item, cardStatus: "reported_lost" } : item
      ),
      identityRiskFlags: addRiskFlag(state, {
        userId,
        riskType: "card_reported_lost",
        severity: "medium",
        description: "Student kartasi yo'qolgan deb belgilandi."
      }),
      biometricAuditLogs: addBiometricAudit(state, {
        userId,
        action: "REPORT_LOST_CARD",
        result: "reported_lost"
      }),
      auditLogs: addAudit(state, actorId, "REPORT_LOST_CARD", "User", userId, "Student card reported lost")
    });
    return { success: true, message: "Student card yo'qolgan deb belgilandi." };
  },
  verifyStudentIdentity: ({ actorId, userId, identifier, purpose }) => {
    const state = get();
    const user = state.users.find((item) => item.id === userId);
    if (!user) {
      return { success: false, message: "Foydalanuvchi topilmadi.", result: "not_matched", confidence: "low" };
    }
    const profile = state.biometricProfiles.find((item) => item.userId === userId && item.enabled && item.status === "active");
    if (!profile) {
      set({
        biometricAuditLogs: addBiometricAudit(state, {
          userId,
          action: "VERIFY_IDENTITY",
          result: "no_biometric"
        }),
        identityVerificationRecords: addIdentityVerification(state, {
          userId,
          actorId,
          method: "face_id",
          result: "no_biometric",
          confidence: "low",
          purpose,
          details: "No biometric enrolled"
        })
      });
      return { success: false, message: "No biometric enrolled. Manual verification fallback tavsiya etiladi.", result: "no_biometric", confidence: "low" };
    }

    const liveness = evaluateLivenessMock(identifier, livenessSteps.length);
    if (!liveness.success || liveness.score < state.identitySettings.livenessThreshold) {
      set({
        biometricAuditLogs: addBiometricAudit(state, {
          userId,
          action: "VERIFY_IDENTITY",
          result: "liveness_failed"
        }),
        identityVerificationRecords: addIdentityVerification(state, {
          userId,
          actorId,
          method: "face_id",
          result: "liveness_failed",
          confidence: "low",
          purpose,
          details: "Liveness failed during staff verification"
        })
      });
      return { success: false, message: "Liveness failed.", result: "liveness_failed", confidence: "low" };
    }

    const comparison = compareFaceTemplateHashMock(profile.templateHashMock, getTemplateSeed(user));
    const result = comparison.matched ? "matched" : "not_matched";
    const confidence = comparison.matched ? "high" : "low";
    set({
      biometricProfiles: state.biometricProfiles.map((item) =>
        item.userId === userId ? { ...item, lastVerifiedAt: new Date().toISOString() } : item
      ),
      biometricAuditLogs: addBiometricAudit(state, {
        userId,
        action: "VERIFY_IDENTITY",
        result
      }),
      identityVerificationRecords: addIdentityVerification(state, {
        userId,
        actorId,
        method: "face_id",
        result,
        confidence,
        purpose,
        details: comparison.matched ? "Student identity matched" : "Student identity did not match"
      }),
      auditLogs: addAudit(state, actorId, "VERIFY_STUDENT_IDENTITY", "User", userId, `${purpose}: ${result}`)
    });
    return {
      success: comparison.matched,
      message: comparison.matched ? "Student identity matched." : "Student identity not matched.",
      result,
      confidence
    };
  },
  logIdentityVerification: (payload) =>
    set((state) => ({
      identityVerificationRecords: addIdentityVerification(state, payload),
      biometricAuditLogs:
        payload.userId
          ? addBiometricAudit(state, {
              userId: payload.userId,
              action: `IDENTITY_${payload.method.toUpperCase()}`,
              result: payload.result
            })
          : state.biometricAuditLogs
    })),
  updateIdentitySettings: (payload, actorId) => {
    const state = get();
    set({
      identitySettings: {
        ...state.identitySettings,
        ...payload
      },
      auditLogs: addAudit(state, actorId, "UPDATE_IDENTITY_SETTINGS", "IdentitySettings", "identity-settings", JSON.stringify(payload))
    });
    return { success: true, message: "Identity security settings yangilandi." };
  },
  logAIUsage: (payload) =>
    set((state) => ({
      aiUsageLogs: addAIUsage(state, payload)
    }))
}));

export function selectCurrentUser(state: AppStore) {
  return state.users.find((item) => item.id === state.currentUserId) ?? null;
}
