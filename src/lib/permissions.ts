import { UserRole } from "@/types";

export const dashboardByRole: Record<Exclude<UserRole, "guest">, string> = {
  student: "/student/dashboard",
  teacher: "/teacher/dashboard",
  librarian: "/librarian/dashboard",
  cataloger: "/cataloger/dashboard",
  acquisitionManager: "/acquisition/dashboard",
  repositoryManager: "/repository-manager/dashboard",
  admin: "/admin/dashboard",
  superAdmin: "/admin/settings"
};

export const permissionMatrix: Record<UserRole, string[]> = {
  guest: ["view_public", "view_catalog", "view_repository"],
  student: [
    "view_public",
    "view_catalog",
    "view_repository",
    "reserve",
    "view_own_loans",
    "book_room",
    "use_ai_tools",
    "manage_bibliography"
  ],
  teacher: [
    "view_public",
    "view_catalog",
    "view_repository",
    "reserve",
    "create_reading_list",
    "upload_resource"
  ],
  librarian: [
    "view_public",
    "view_catalog",
    "view_repository",
    "issue_return",
    "manage_reservations",
    "manage_room_checkin",
    "view_fines",
    "manage_payments"
  ],
  cataloger: ["view_public", "view_catalog", "create_record", "edit_metadata", "manage_copies", "manage_authority"],
  acquisitionManager: ["view_public", "manage_acquisition", "manage_vendors", "view_budget"],
  repositoryManager: ["view_public", "manage_repository", "set_access_policy"],
  admin: ["*"],
  superAdmin: ["*"]
};

export function hasPermission(role: UserRole, permission: string) {
  return permissionMatrix[role]?.includes("*") || permissionMatrix[role]?.includes(permission);
}

export function routeRole(segment?: string): UserRole | null {
  switch (segment) {
    case "student":
      return "student";
    case "teacher":
      return "teacher";
    case "librarian":
      return "librarian";
    case "cataloger":
      return "cataloger";
    case "acquisition":
      return "acquisitionManager";
    case "repository-manager":
      return "repositoryManager";
    case "admin":
      return "admin";
    default:
      return null;
  }
}
