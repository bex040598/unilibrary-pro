export type Language = "uz" | "ru" | "en";

export type UserRole =
  | "guest"
  | "student"
  | "teacher"
  | "librarian"
  | "cataloger"
  | "acquisitionManager"
  | "repositoryManager"
  | "admin"
  | "superAdmin";

export type UserStatus = "active" | "blocked" | "pending";

export type ResourceType =
  | "Printed book"
  | "E-book"
  | "Article"
  | "Thesis"
  | "Dissertation"
  | "Methodical guide"
  | "Lecture notes"
  | "Video lecture"
  | "Audio book"
  | "Journal issue";

export type CopyStatus =
  | "available"
  | "borrowed"
  | "reserved"
  | "lost"
  | "damaged"
  | "repair";

export type LoanStatus = "issued" | "returned" | "overdue";
export type ReservationStatus = "pending" | "approved" | "collected" | "expired" | "cancelled";
export type FineStatus = "unpaid" | "pending_confirmation" | "paid" | "waived" | "rejected";
export type FineReason = "overdue" | "lost" | "damaged" | "card_reissue";
export type PaymentMethod = "Click" | "Payme" | "Uzum Pay" | "Bank transfer" | "Cash";
export type SeatStatus = "available" | "booked" | "occupied" | "disabled";
export type BookingStatus = "booked" | "checked_in" | "cancelled" | "no_show";
export type AccessLevel = "public" | "university only" | "faculty only" | "staff only" | "restricted";
export type AcquisitionStatus = "requested" | "approved" | "ordered" | "received" | "rejected";
export type NotificationType = "reservation" | "loan" | "fine" | "repository" | "room" | "system";
export type RecordStatus = "draft" | "published";

export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHashMock: string;
  role: UserRole;
  studentId?: string;
  employeeId?: string;
  phone: string;
  faculty: string;
  department: string;
  group?: string;
  status: UserStatus;
  membershipNumber: string;
  cardQrCode: string;
  createdAt: string;
}

export interface LibraryBranch {
  id: string;
  name: string;
  address: string;
  description: string;
}

export interface ReadingRoom {
  id: string;
  branchId: string;
  name: string;
  capacity: number;
  floor: number;
  workingHours: string;
}

export interface Seat {
  id: string;
  roomId: string;
  seatNumber: string;
  status: SeatStatus;
}

export interface MarcField {
  tag: string;
  label: string;
  value: string;
}

export interface DublinCoreField {
  key: string;
  value: string;
}

export interface BibliographicRecord {
  id: string;
  controlNumber: string;
  title: string;
  subtitle: string;
  authors: string[];
  editors: string[];
  translators: string[];
  publisher: string;
  publicationPlace: string;
  publicationYear: number;
  isbn: string;
  issn: string;
  language: string;
  pages: number;
  edition: string;
  description: string;
  annotation: string;
  keywords: string[];
  resourceType: ResourceType;
  udc: string;
  bbk: string;
  ddc: string;
  lcc: string;
  subjects: string[];
  faculty: string;
  department: string;
  marcFields: MarcField[];
  dublinCore: DublinCoreField[];
  status: RecordStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  coverGradient: string;
  borrowCount: number;
  isNewArrival: boolean;
}

export interface BookCopy {
  id: string;
  recordId: string;
  inventoryNumber: string;
  barcode: string;
  qrCode: string;
  rfidTag: string;
  branchId: string;
  roomId?: string;
  shelf: string;
  row: string;
  status: CopyStatus;
  acquisitionDate: string;
  price: number;
  fundingSource: string;
}

export interface DigitalResource {
  id: string;
  recordId?: string;
  title: string;
  type: ResourceType;
  faculty: string;
  department: string;
  year: number;
  language: string;
  abstract: string;
  keywords: string[];
  doi?: string;
  handle: string;
  accessLevel: AccessLevel;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  license: string;
  embargoDate?: string;
  version: string;
  views: number;
  downloads: number;
  uploadedBy: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  userId: string;
  copyId: string;
  issuedBy: string;
  returnedBy?: string;
  issuedAt: string;
  dueAt: string;
  returnedAt?: string;
  status: LoanStatus;
  renewCount: number;
  fineAmount: number;
}

export interface Reservation {
  id: string;
  userId: string;
  recordId: string;
  copyId?: string;
  status: ReservationStatus;
  reservedAt: string;
  expiresAt: string;
}

export interface Fine {
  id: string;
  userId: string;
  loanId?: string;
  reason: FineReason;
  amount: number;
  status: FineStatus;
  paymentMethod?: PaymentMethod;
  receiptUrl?: string;
  createdAt: string;
  paidAt?: string;
  note?: string;
}

export interface ReadingRoomBooking {
  id: string;
  userId: string;
  roomId: string;
  seatId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  qrCode: string;
}

export interface AcquisitionRequest {
  id: string;
  requestedBy: string;
  title: string;
  author: string;
  isbn: string;
  quantity: number;
  faculty: string;
  priority: "low" | "medium" | "high";
  justification: string;
  estimatedPrice: number;
  vendorId?: string;
  status: AcquisitionStatus;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  rating: number;
  paymentTerms: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  createdAt: string;
}

export interface LibraryDatabase {
  users: User[];
  branches: LibraryBranch[];
  rooms: ReadingRoom[];
  seats: Seat[];
  records: BibliographicRecord[];
  copies: BookCopy[];
  digitalResources: DigitalResource[];
  loans: Loan[];
  reservations: Reservation[];
  fines: Fine[];
  bookings: ReadingRoomBooking[];
  acquisitionRequests: AcquisitionRequest[];
  vendors: Vendor[];
  notifications: Notification[];
  auditLogs: AuditLog[];
}

export interface DemoAccount {
  label: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AppState extends LibraryDatabase {
  currentUserId: string | null;
  language: Language;
  hydrated: boolean;
}
