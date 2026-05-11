import {
  AcquisitionRequest,
  BibliographicRecord,
  DigitalResource,
  Fine,
  Loan,
  ReadingRoomBooking
} from "@/types";
import { formatCurrency } from "@/lib/utils";

export function buildReport(
  kind:
    | "daily_circulation"
    | "monthly_loans"
    | "overdues"
    | "fines"
    | "collection_growth"
    | "downloads"
    | "occupancy"
    | "faculty_usage"
    | "most_borrowed"
    | "lost_damaged",
  payload: {
    loans: Loan[];
    fines: Fine[];
    records: BibliographicRecord[];
    bookings: ReadingRoomBooking[];
    acquisitionRequests: AcquisitionRequest[];
    digitalResources: DigitalResource[];
  }
) {
  const lines: string[] = [`Report: ${kind}`, `Generated at: ${new Date().toISOString()}`, ""];

  if (kind === "daily_circulation") {
    lines.push("Loan ID,Status,Issued At,Due At");
    payload.loans.slice(0, 20).forEach((loan) => {
      lines.push(`${loan.id},${loan.status},${loan.issuedAt},${loan.dueAt}`);
    });
  }

  if (kind === "overdues") {
    lines.push("Loan ID,User ID,Due At,Status");
    payload.loans
      .filter((loan) => loan.status === "overdue")
      .forEach((loan) => {
        lines.push(`${loan.id},${loan.userId},${loan.dueAt},${loan.status}`);
      });
  }

  if (kind === "fines") {
    lines.push("Reason,Status,Amount");
    payload.fines.forEach((fine) => {
      lines.push(`${fine.reason},${fine.status},${fine.amount}`);
    });
  }

  if (kind === "most_borrowed") {
    lines.push("Title,Borrow count");
    payload.records
      .slice()
      .sort((a, b) => b.borrowCount - a.borrowCount)
      .slice(0, 10)
      .forEach((record) => {
        lines.push(`${record.title},${record.borrowCount}`);
      });
  }

  if (kind === "occupancy") {
    lines.push("Booking ID,Seat,Status,Time");
    payload.bookings.forEach((booking) => {
      lines.push(`${booking.id},${booking.seatId},${booking.status},${booking.date} ${booking.startTime}`);
    });
  }

  if (kind === "downloads") {
    lines.push("Resource ID,Title,Downloads,Views");
    payload.digitalResources.forEach((resource) => {
      lines.push(`${resource.id},${resource.title},${resource.downloads},${resource.views}`);
    });
  }

  if (kind === "collection_growth") {
    const total = payload.records.length;
    const orders = payload.acquisitionRequests.filter((item) => item.status === "received").length;
    lines.push(`Catalog records,${total}`);
    lines.push(`Received acquisition requests,${orders}`);
    lines.push(`Estimated collection value,${formatCurrency(total * 78000)}`);
  }

  if (lines.length === 3) {
    lines.push("Metric,Value");
    lines.push(`Loans,${payload.loans.length}`);
    lines.push(`Fines,${payload.fines.length}`);
    lines.push(`Bookings,${payload.bookings.length}`);
  }

  return lines.join("\n");
}
