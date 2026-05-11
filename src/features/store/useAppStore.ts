"use client";

import { create } from "zustand";

import { createSeedData } from "@/data/seed";
import { createBarcode, createQrCode, createRfidTag } from "@/lib/barcode";
import { calculateOverdueFine } from "@/lib/fineCalculator";
import { dashboardByRole } from "@/lib/permissions";
import { STORAGE_KEYS } from "@/lib/storage";
import { makeId } from "@/lib/utils";
import {
  AccessLevel,
  AcquisitionRequest,
  AppState,
  BibliographicRecord,
  BookCopy,
  CopyStatus,
  DigitalResource,
  FineReason,
  FineStatus,
  Loan,
  PaymentMethod,
  RecordStatus,
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

type AppActions = {
  bootstrap: (raw?: Partial<AppState>) => void;
  setHydrated: (value: boolean) => void;
  setLanguage: (language: AppState["language"]) => void;
  login: (email: string, password: string) => ActionResult;
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

function getCurrentUser(state: AppState) {
  return state.users.find((item) => item.id === state.currentUserId) ?? null;
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
      return {
        ...state,
        ...raw,
        language,
        hydrated: true
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
    if (!user || user.passwordHashMock !== password) {
      return { success: false, message: "Email yoki parol noto‘g‘ri." };
    }

    if (user.status === "blocked") {
      return { success: false, message: "Ushbu a’zo bloklangan. Librarian desk orqali tekshiring." };
    }

    set({ currentUserId: user.id });
    return {
      success: true,
      message: "Kirish muvaffaqiyatli bajarildi.",
      redirect: user.role === "guest" ? "/" : dashboardByRole[user.role]
    };
  },
  register: (payload) => {
    const state = get();
    const exists = state.users.some((item) => item.email.toLowerCase() === payload.email.toLowerCase());
    if (exists) {
      return { success: false, message: "Bu email allaqachon ro‘yxatdan o‘tgan." };
    }

    const role = payload.role;
    const nextUser: User = {
      id: makeId(role, state.users.length + 1),
      fullName: payload.fullName,
      email: payload.email,
      passwordHashMock: payload.password,
      role,
      studentId: role === "student" ? payload.studentId ?? `ST-${2026000 + state.users.length}` : undefined,
      employeeId: role === "teacher" ? `EMP-${9000 + state.users.length}` : undefined,
      phone: "+998 90 000 00 00",
      faculty: payload.faculty,
      department: payload.department,
      group: role === "student" ? payload.group : undefined,
      status: "active",
      membershipNumber: `M-${role === "student" ? "STU" : "TEA"}-${state.users.length + 1000}`,
      cardQrCode: createQrCode(payload.email),
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
      )
    });

    return {
      success: true,
      message: "Ro‘yxatdan o‘tish muvaffaqiyatli bajarildi.",
      redirect: dashboardByRole[role]
    };
  },
  logout: () => set({ currentUserId: null }),
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
          ? { ...item, paymentMethod: method, receiptUrl, status: "pending_confirmation" }
          : item
      )
    });

    return { success: true, message: "To‘lov tasdiqlash uchun yuborildi." };
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
  }
}));

export function selectCurrentUser(state: AppStore) {
  return state.users.find((item) => item.id === state.currentUserId) ?? null;
}
