import { Loan } from "@/types";
import { daysBetween } from "@/lib/utils";

export const overdueFinePerDay = 2000;

export function calculateOverdueFine(loan: Loan, returnDate = new Date().toISOString()) {
  const overdueDays = daysBetween(returnDate, loan.dueAt);
  return {
    overdueDays,
    amount: overdueDays * overdueFinePerDay
  };
}
