import { DigitalResource, User, UserRole } from "@/types";

export type RepositoryAccessDecision = {
  canPreviewMetadata: boolean;
  canOpen: boolean;
  canDownload: boolean;
  canRequestAccess: boolean;
  reason: string;
  stateLabel: string;
  tone: "emerald" | "cyan" | "gold" | "orange" | "rose";
};

const staffRoles: UserRole[] = ["teacher", "librarian", "cataloger", "repositoryManager", "admin", "superAdmin"];

export function isStaffRole(role?: UserRole | null) {
  return role ? staffRoles.includes(role) : false;
}

export function getRepositoryAccessDecision(resource: DigitalResource, user?: User | null): RepositoryAccessDecision {
  switch (resource.accessLevel) {
    case "public":
      return {
        canPreviewMetadata: true,
        canOpen: true,
        canDownload: true,
        canRequestAccess: false,
        reason: "Ochiq resurs barcha foydalanuvchilar uchun mavjud.",
        stateLabel: "Ochiq kirish",
        tone: "emerald"
      };
    case "university only":
      return user
        ? {
            canPreviewMetadata: true,
            canOpen: true,
            canDownload: true,
            canRequestAccess: false,
            reason: "Universitet a'zolari uchun to'liq kirish ruxsat etilgan.",
            stateLabel: "Universitet a'zosi",
            tone: "cyan"
          }
        : {
            canPreviewMetadata: true,
            canOpen: false,
            canDownload: false,
            canRequestAccess: false,
            reason: "Guest foydalanuvchi uchun faqat metadata preview ochiq.",
            stateLabel: "Login talab qilinadi",
            tone: "gold"
          };
    case "faculty only":
      return user && user.faculty === resource.faculty
        ? {
            canPreviewMetadata: true,
            canOpen: true,
            canDownload: true,
            canRequestAccess: false,
            reason: "Resurs foydalanuvchining fakultetiga biriktirilgan.",
            stateLabel: "Fakultet bo'yicha ruxsat",
            tone: "cyan"
          }
        : {
            canPreviewMetadata: true,
            canOpen: false,
            canDownload: false,
            canRequestAccess: false,
            reason: "Ruxsat cheklangan: bu resurs faqat mos fakultet a'zolari uchun.",
            stateLabel: "Ruxsat cheklangan",
            tone: "orange"
          };
    case "staff only":
      return user && isStaffRole(user.role)
        ? {
            canPreviewMetadata: true,
            canOpen: true,
            canDownload: true,
            canRequestAccess: false,
            reason: "Xodimlar uchun xizmat resursi.",
            stateLabel: "Xodimlar uchun",
            tone: "cyan"
          }
        : {
            canPreviewMetadata: true,
            canOpen: false,
            canDownload: false,
            canRequestAccess: false,
            reason: "Talaba va guest foydalanuvchilar uchun to'liq fayl ochilmaydi.",
            stateLabel: "Xodimlar uchun",
            tone: "orange"
          };
    case "restricted":
    default:
      return {
        canPreviewMetadata: true,
        canOpen: false,
        canDownload: false,
        canRequestAccess: true,
        reason: "To'g'ridan-to'g'ri yuklab olish yopiq. Ruxsat so'rovi yuborish kerak.",
        stateLabel: "Ruxsat so'rovi talab qilinadi",
        tone: "rose"
      };
  }
}
