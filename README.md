UniLibrary Pro Backend Readiness
Planned persistence layer
Frontend state models already map 1:1 to future persistence entities:

User
LibraryBranch
ReadingRoom
Seat
BibliographicRecord
BookCopy
DigitalResource
Loan
Reservation
Fine
ReadingRoomBooking
AcquisitionRequest
Vendor
Notification
AuditLog
These entities are currently represented in strict TypeScript at src/types/index.ts and used centrally by the Zustand store in src/features/store/useAppStore.ts.

Prisma model direction
Recommended future Prisma modules:

auth.prisma: User, Session, RefreshToken, RoleAssignment
catalog.prisma: BibliographicRecord, BookCopy, AuthorityRecord, ClassificationMap
circulation.prisma: Loan, Reservation, Fine, AuditLog
repository.prisma: DigitalResource, ResourceVersion, AccessPolicy
reading-room.prisma: ReadingRoom, Seat, ReadingRoomBooking
acquisition.prisma: Vendor, AcquisitionRequest, PurchaseOrder, BudgetLedger
Suggested relation highlights:

BibliographicRecord 1..n BookCopy
BibliographicRecord 0..n DigitalResource
User 1..n Loan
User 1..n Reservation
Loan 0..n Fine
ReadingRoom 1..n Seat
Seat 1..n ReadingRoomBooking
Vendor 1..n AcquisitionRequest
REST API mapping
Suggested resource endpoints:

POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET /api/catalog
GET /api/catalog/:id
POST /api/catalog
PATCH /api/catalog/:id
POST /api/catalog/:id/copies
GET /api/repository
GET /api/repository/:id
POST /api/repository
POST /api/circulation/issue
POST /api/circulation/return
POST /api/circulation/renew
POST /api/reservations
PATCH /api/reservations/:id/approve
GET /api/fines
POST /api/fines/:id/pay
PATCH /api/fines/:id/confirm
POST /api/reading-room/bookings
PATCH /api/reading-room/bookings/:id/check-in
GET /api/acquisition/requests
POST /api/acquisition/requests
PATCH /api/acquisition/requests/:id/status
GET /api/vendors
POST /api/vendors
GET /api/admin/reports/:kind
JWT-ready auth notes
Current mock auth stores currentUserId in localStorage-backed state.
Future auth can replace this with:
short-lived access token
refresh token rotation
role claims
branch/faculty scope claims
Route protection logic is already centralized in the UI router and permission mapping.
OAI-PMH and metadata readiness
BibliographicRecord contains MARC-like fields and Dublin Core fields.
DigitalResource already stores repository-friendly identifiers (handle, doi, accessLevel, version metadata).
Future OAI-PMH responses can expose:
oai_dc
marcxml
internal JSON record schema
Current limitation
This document describes the backend cut-over path. The current implementation remains a frontend-first demo powered by localStorage and mock workflows.
