"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookCopy,
  BookMarked,
  BookOpen,
  Bookmark,
  Building2,
  CircleDollarSign,
  ClipboardList,
  Database,
  Download,
  FileArchive,
  FileText,
  Filter,
  Fingerprint,
  GraduationCap,
  IdCard,
  Languages,
  LayoutDashboard,
  Library,
  MapPinned,
  ScanLine,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Upload,
  Users
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { DataTable } from "@/components/ui/data-table";
import { PasskeyButton } from "@/components/auth/PasskeyButton";
import { IDCardScanner } from "@/components/identity/IDCardScanner";
import { IdentityVerificationPanel } from "@/components/identity/IdentityVerificationPanel";
import { PdfPreviewMock } from "@/components/ui/pdf-preview";
import { AccessRequestModal } from "@/components/repository/AccessRequestModal";
import { AccessPolicyBadge } from "@/components/repository/AccessPolicyBadge";
import { RepositoryAccessGuard } from "@/components/repository/RepositoryAccessGuard";
import {
  AIAssistantPanel,
} from "@/components/ai/AIAssistantPanel";
import { AIRecommendationCard } from "@/components/ai/AIRecommendationCard";
import { AISummaryBox } from "@/components/ai/AISummaryBox";
import { CitationAssistant } from "@/components/ai/CitationAssistant";
import { FlashcardDeck } from "@/components/ai/FlashcardDeck";
import { QuizGenerator } from "@/components/ai/QuizGenerator";
import { ReadingPlanGenerator } from "@/components/ai/ReadingPlanGenerator";
import { ResearchExplorer } from "@/components/ai/ResearchExplorer";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  KpiCard,
  Label,
  Modal,
  SectionTitle,
  Select,
  Skeleton,
  Textarea
} from "@/components/ui/primitives";
import { ScannerMock } from "@/components/ui/scanner-mock";
import { SeatMap } from "@/components/ui/seat-map";
import { useToast } from "@/components/ui/toast";
import { buildSummaryFromRecord, buildStudentInsights } from "@/lib/ai/aiService";
import { buildDublinCoreXml, buildMarcExport, buildStyledCitation, getMissingMetadata } from "@/lib/ai/citationAssistant";
import { biometricConsentText } from "@/lib/biometric/faceEnrollment";
import { livenessSteps } from "@/lib/biometric/livenessMock";
import { buildStudentRecommendations } from "@/lib/ai/recommendationEngine";
import { explainCatalogMatch, getAvailabilitySummary, getMetadataCompleteness } from "@/lib/catalog";
import { semanticSearchRecords } from "@/lib/ai/semanticSearch";
import { buildCitation } from "@/lib/citation";
import { t } from "@/lib/i18n";
import { dashboardByRole, hasPermission, permissionMatrix, routeRole } from "@/lib/permissions";
import { buildReport } from "@/lib/reportGenerator";
import { getRepositoryAccessDecision } from "@/lib/repositoryAccess";
import { downloadTextFile, formatCurrency, formatDate, safeContains } from "@/lib/utils";
import { demoAccounts } from "@/data/seed";
import { AppStore, selectCurrentUser, useAppStore } from "@/features/store/useAppStore";
import {
  AccessLevel,
  AcquisitionRequest,
  BibliographicRecord,
  BookCopy as BookCopyModel,
  CopyStatus,
  Language,
  ResourceType,
  ReadingRoom,
  Reservation,
  User,
  UserRole
} from "@/types";

const publicMenu = [
  { href: "/", key: "appName", icon: Library },
  { href: "/catalog", key: "openCatalog", icon: BookOpen },
  { href: "/repository", key: "eResources", icon: FileArchive },
  { href: "/new-arrivals", key: "newArrivals", icon: Sparkles },
  { href: "/popular-books", key: "popularBooks", icon: BarChart3 },
  { href: "/about", key: "about", icon: ShieldCheck },
  { href: "/rules", key: "rules", icon: FileText },
  { href: "/contact", key: "contact", icon: Bell }
] as const;

const roleMenu: Record<
  "student" | "teacher" | "librarian" | "cataloger" | "acquisitionManager" | "repositoryManager" | "admin",
  { href: string; label: string; icon: typeof LayoutDashboard; permission?: string }[]
> = {
  student: [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/borrowed", label: "Borrowed", icon: BookMarked },
    { href: "/student/reservations", label: "Reservations", icon: Bookmark },
    { href: "/student/fines", label: "Fines", icon: CircleDollarSign },
    { href: "/student/reading-room", label: "Reading room", icon: MapPinned },
    { href: "/student/recommendations", label: "Recommendations", icon: Sparkles },
    { href: "/student/reading-plans", label: "Reading plans", icon: BookOpen, permission: "use_ai_tools" },
    { href: "/student/ai-assistant", label: "AI assistant", icon: Sparkles, permission: "use_ai_tools" },
    { href: "/student/ai-quiz", label: "AI quiz", icon: GraduationCap, permission: "use_ai_tools" },
    { href: "/student/flashcards", label: "Flashcards", icon: BookMarked, permission: "use_ai_tools" },
    { href: "/student/bibliography", label: "Bibliography", icon: FileText, permission: "manage_bibliography" },
    { href: "/student/research-explorer", label: "Research explorer", icon: Search, permission: "use_ai_tools" },
    { href: "/student/identity", label: "Identity", icon: IdCard },
    { href: "/student/face-enrollment", label: "Face enrollment", icon: Fingerprint },
    { href: "/student/privacy-center", label: "Privacy center", icon: ShieldCheck },
    { href: "/student/profile", label: "Profile", icon: IdCard }
  ],
  teacher: [
    { href: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/teacher/reading-lists", label: "Reading lists", icon: BookMarked },
    { href: "/teacher/resources", label: "Resources", icon: FileArchive },
    { href: "/teacher/submissions", label: "Submissions", icon: Upload },
    { href: "/teacher/profile", label: "Profile", icon: IdCard }
  ],
  librarian: [
    { href: "/librarian/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/librarian/circulation", label: "Circulation", icon: ScanLine },
    { href: "/librarian/issue", label: "Issue", icon: BookOpen },
    { href: "/librarian/return", label: "Return", icon: Download },
    { href: "/librarian/reservations", label: "Reservations", icon: Bookmark },
    { href: "/librarian/overdues", label: "Overdues", icon: CircleDollarSign },
    { href: "/librarian/reading-room", label: "Reading room", icon: MapPinned },
    { href: "/librarian/identity-check", label: "Identity check", icon: ShieldCheck }
  ],
  cataloger: [
    { href: "/cataloger/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/cataloger/records", label: "Records", icon: Database },
    { href: "/cataloger/records/new", label: "New record", icon: FileText },
    { href: "/cataloger/authority", label: "Authority", icon: ShieldCheck },
    { href: "/cataloger/copies", label: "Copies", icon: BookCopy },
    { href: "/cataloger/import-export", label: "Import / export", icon: Upload }
  ],
  acquisitionManager: [
    { href: "/acquisition/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/acquisition/requests", label: "Requests", icon: ClipboardList },
    { href: "/acquisition/vendors", label: "Vendors", icon: Building2 },
    { href: "/acquisition/orders", label: "Orders", icon: FileArchive },
    { href: "/acquisition/budget", label: "Budget", icon: CircleDollarSign }
  ],
  repositoryManager: [
    { href: "/repository-manager/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/repository-manager/resources", label: "Resources", icon: FileArchive },
    { href: "/repository-manager/upload", label: "Upload", icon: Upload },
    { href: "/repository-manager/access-control", label: "Access control", icon: ShieldCheck }
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/roles", label: "Roles", icon: ShieldCheck },
    { href: "/admin/books", label: "Books", icon: Library },
    { href: "/admin/copies", label: "Copies", icon: BookCopy },
    { href: "/admin/branches", label: "Branches", icon: Building2 },
    { href: "/admin/rooms", label: "Rooms", icon: MapPinned },
    { href: "/admin/fines", label: "Fines", icon: CircleDollarSign },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
    { href: "/admin/biometric-audit", label: "Biometric audit", icon: Fingerprint },
    { href: "/admin/security/identity-settings", label: "Identity security", icon: ShieldCheck },
    { href: "/admin/settings", label: "Settings", icon: Settings },
    { href: "/admin/audit-logs", label: "Audit logs", icon: FileText }
  ]
};

const paymentMethods = ["Click", "Payme", "Uzum Pay", "Bank transfer", "Cash"] as const;

const registerSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["student", "teacher"]),
  faculty: z.string().min(2),
  department: z.string().min(2),
  group: z.string().optional(),
  studentId: z.string().optional(),
  phone: z.string().optional(),
  cardExpiryDate: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const acquisitionSchema = z.object({
  title: z.string().min(2),
  author: z.string().min(2),
  isbn: z.string().min(4),
  quantity: z.coerce.number().min(1),
  faculty: z.string().min(2),
  priority: z.enum(["low", "medium", "high"]),
  justification: z.string().min(10),
  estimatedPrice: z.coerce.number().min(1000),
  vendorId: z.string().optional()
});

const vendorSchema = z.object({
  name: z.string().min(2),
  contactPerson: z.string().min(2),
  phone: z.string().min(5),
  email: z.string().email(),
  address: z.string().min(5),
  rating: z.coerce.number().min(1).max(5),
  paymentTerms: z.string().min(5)
});

const resourceSchema = z.object({
  recordId: z.string().optional(),
  title: z.string().min(3),
  type: z.string().min(2),
  faculty: z.string().min(2),
  department: z.string().min(2),
  year: z.coerce.number().min(2000).max(2035),
  language: z.string().min(2),
  abstract: z.string().min(20),
  keywords: z.string().min(2),
  doi: z.string().optional(),
  accessLevel: z.enum(["public", "university only", "faculty only", "staff only", "restricted"]),
  fileUrl: z.string().min(2),
  fileName: z.string().min(2).refine((value) => /\.(pdf|docx|pptx|mp4|mp3)$/i.test(value), {
    message: "File type must be PDF, DOCX, PPTX, MP4 or MP3."
  }),
  fileSize: z.coerce.number().min(1).max(20_000_000, "File size must be under 20 MB."),
  license: z.string().min(2),
  embargoDate: z.string().optional(),
  version: z.string().min(1)
});

const recordSchema = z.object({
  title: z.string().min(2),
  subtitle: z.string().min(2),
  authors: z.string().min(2),
  editors: z.string().optional(),
  translators: z.string().optional(),
  publisher: z.string().min(2),
  publicationPlace: z.string().min(2),
  publicationYear: z.coerce.number().min(1950).max(2035),
  isbn: z.string().min(4),
  issn: z.string().min(4),
  language: z.string().min(2),
  pages: z.coerce.number().min(1),
  edition: z.string().min(1),
  description: z.string().min(10),
  annotation: z.string().min(20),
  keywords: z.string().min(3),
  resourceType: z.string().min(2),
  udc: z.string().min(2),
  bbk: z.string().min(2),
  ddc: z.string().min(2),
  lcc: z.string().min(2),
  subjects: z.string().min(2),
  faculty: z.string().min(2),
  department: z.string().min(2),
  leader: z.string().min(2),
  control001: z.string().min(2),
  marc008: z.string().min(2),
  marc040: z.string().min(2),
  marc020: z.string().min(2),
  marc041: z.string().min(2),
  marc100: z.string().min(2),
  marc245: z.string().min(2),
  marc260: z.string().min(2),
  marc082: z.string().min(2),
  marc084: z.string().min(2),
  marc490: z.string().min(2),
  marc300: z.string().min(2),
  marc500: z.string().min(2),
  marc504: z.string().min(2),
  marc650: z.string().min(2),
  marc700: z.string().min(2),
  marc710: z.string().min(2),
  marc852: z.string().min(2),
  marc856: z.string().min(2),
  dcTitle: z.string().min(2),
  dcCreator: z.string().min(2),
  dcSubject: z.string().min(2),
  dcDescription: z.string().min(2),
  dcPublisher: z.string().min(2),
  dcDate: z.string().min(2),
  dcType: z.string().min(2),
  dcFormat: z.string().min(2),
  dcIdentifier: z.string().min(2),
  dcLanguage: z.string().min(2),
  dcRights: z.string().min(2)
});

function statusTone(status: string) {
  if (["available", "approved", "paid", "public", "checked_in", "received", "published"].includes(status)) {
    return "emerald" as const;
  }
  if (["reserved", "pending", "pending_confirmation", "booked", "ordered", "requested"].includes(status)) {
    return "orange" as const;
  }
  if (["borrowed", "occupied", "faculty only", "staff only", "digital only"].includes(status)) {
    return "cyan" as const;
  }
  if (["reading room only"].includes(status)) {
    return "gold" as const;
  }
  if (["overdue", "lost", "damaged", "rejected", "restricted"].includes(status)) {
    return "rose" as const;
  }
  return "slate" as const;
}

function metadataCompleteness(record: BibliographicRecord) {
  return getMetadataCompleteness(record);
}

function availabilityForRecord(state: AppStore, recordId: string) {
  return getAvailabilitySummary(state, recordId);
}

function resourceForRecord(state: AppStore, recordId: string) {
  return state.digitalResources.find((item) => item.recordId === recordId);
}

function roomById(state: AppStore, roomId: string) {
  return state.rooms.find((item) => item.id === roomId);
}

function branchName(state: AppStore, branchId: string) {
  return state.branches.find((item) => item.id === branchId)?.name ?? "Main stack";
}

function roleCanAccess(role: UserRole, portal: string) {
  if (role === "admin" || role === "superAdmin") {
    return true;
  }
  const mapped = routeRole(portal);
  return mapped === role;
}

function useReadingList(userId?: string) {
  const storageKey = `unilibrary_reading_list_${userId ?? "guest"}`;
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) {
      return;
    }
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      try {
        setItems(JSON.parse(raw) as string[]);
      } catch {
        setItems([]);
      }
    }
  }, [storageKey, userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey, userId]);

  return {
    items,
    toggle: (recordId: string) =>
      setItems((current) =>
        current.includes(recordId) ? current.filter((item) => item !== recordId) : [...current, recordId]
      )
  };
}

function LanguageSwitcher({
  language,
  onChange
}: {
  language: Language;
  onChange: (value: Language) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
      {(["uz", "ru", "en"] as const).map((item) => (
        <button
          key={item}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase ${
            item === language ? "bg-ink text-white" : "text-slate-600"
          }`}
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function PublicHeader({
  language,
  onChangeLanguage,
  currentUser
}: {
  language: Language;
  onChangeLanguage: (value: Language) => void;
  currentUser: User | null;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 text-white lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-500">
            <Library className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-cyan-200">UniLibrary Pro</p>
            <p className="text-xs text-slate-300">Universitet Elektron Kutubxonasi</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-slate-200 xl:flex">
          {publicMenu.slice(1, 6).map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.key === "appName" ? "Platforma" : t(language, item.key)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher language={language} onChange={onChangeLanguage} />
          <Link href={currentUser ? dashboardByRole[currentUser.role as Exclude<UserRole, "guest">] : "/login"}>
            <Button variant="accent">{currentUser ? "Kabinet" : t(language, "login")}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-slate-600 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-semibold text-ink">UniLibrary Pro</p>
          <p className="mt-2">Bibliografik yozuvlar, circulation, repository, AI learning tools va o&apos;quv zali jarayonlari yagona akademik platformada boshqariladi.</p>
        </div>
        <div>
          <p className="font-semibold text-ink">Kutubxona aloqasi</p>
          <p className="mt-2">Toshkent shahri, Universitet ko‘chasi 12</p>
          <p>library@unilibrary.uz</p>
          <p>+998 71 200 10 10</p>
        </div>
        <div>
          <p className="font-semibold text-ink">Standart tayyorgarlik</p>
          <p className="mt-2">MARC-like fields, Dublin Core metadata, QR/RFID identification va OAI-PMH-ready repository tuzilmasi bilan ilmiy fond boshqaruvi qo&apos;llab-quvvatlanadi.</p>
        </div>
      </div>
    </footer>
  );
}

function ProtectedShell({
  currentUser,
  language,
  onChangeLanguage,
  children
}: {
  currentUser: User;
  language: Language;
  onChangeLanguage: (value: Language) => void;
  children: React.ReactNode;
}) {
  const menu =
    currentUser.role === "superAdmin"
      ? roleMenu.admin
      : currentUser.role === "acquisitionManager"
        ? roleMenu.acquisitionManager
        : currentUser.role === "repositoryManager"
          ? roleMenu.repositoryManager
          : roleMenu[currentUser.role as keyof typeof roleMenu];
  const filteredMenu = menu.filter((item) => !item.permission || hasPermission(currentUser.role, item.permission));
  const pathname = usePathname();
  const { logout, notifications, markNotificationRead } = useAppStore();
  const userNotifications = notifications.filter((item) => item.userId === currentUser.id).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f2f6fb]">
      <div className="grid min-h-screen lg:grid-cols-[290px_1fr]">
        <aside className="border-r border-slate-200 bg-ink text-white">
          <div className="border-b border-white/10 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-500">
                <Library className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.2em] text-cyan-200">UniLibrary Pro</p>
                <p className="text-xs text-slate-400">{currentUser.fullName}</p>
              </div>
            </div>
          </div>
          <nav className="space-y-2 px-4 py-5">
            {filteredMenu.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                    active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 lg:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-600">Academic operations</p>
                <h1 className="text-xl font-semibold text-ink">{currentUser.role === "superAdmin" ? "Super admin console" : `${currentUser.role} workspace`}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <LanguageSwitcher language={language} onChange={onChangeLanguage} />
                <div className="relative">
                  <details className="group">
                    <summary className="list-none">
                      <Button variant="secondary" aria-label="Bildirishnomalarni ochish">
                        <Bell className="h-4 w-4" />
                        {userNotifications.length}
                      </Button>
                    </summary>
                    <Card className="absolute right-0 mt-3 w-[320px] p-3">
                      <div className="space-y-2">
                        {userNotifications.length === 0 ? (
                          <p className="text-sm text-slate-500">Yangi notification yo‘q.</p>
                        ) : (
                          userNotifications.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => markNotificationRead(item.id)}
                              className="w-full rounded-2xl border border-slate-200 p-3 text-left transition hover:bg-slate-50"
                            >
                              <p className="text-sm font-semibold text-ink">{item.title}</p>
                              <p className="mt-1 text-xs text-slate-500">{item.message}</p>
                            </button>
                          ))
                        )}
                      </div>
                    </Card>
                  </details>
                </div>
                <Button variant="secondary" onClick={logout}>
                  Chiqish
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
      <div className="absolute right-5 top-5 rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
        QR / RFID circulation
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.8fr]">
        <div className="space-y-4">
          <div className="rounded-[28px] border border-white/10 bg-slate-950/35 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs text-slate-200">
                <Search className="h-4 w-4" />
                Title / author / ISBN / inventory number
              </div>
              <Badge tone="gold">OPAC</Badge>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className={`h-24 rounded-3xl bg-gradient-to-br ${
                    ["from-cyan-500 to-blue-700", "from-emerald-500 to-green-700", "from-amber-400 to-orange-600", "from-slate-500 to-slate-700"][index % 4]
                  } p-3 text-white shadow-xl`}
                >
                  <div className="h-full rounded-2xl border border-white/20 p-2">
                    <div className="mt-auto text-xs opacity-90">Shelf {String.fromCharCode(65 + index)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-slate-950/35 p-4">
              <p className="text-sm font-semibold text-white">Dashboard preview</p>
              <div className="mt-4 grid gap-3">
                <div className="h-20 rounded-3xl bg-gradient-to-r from-emerald-400/20 to-cyan-400/20" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-16 rounded-2xl bg-white/10" />
                  <div className="h-16 rounded-2xl bg-white/10" />
                  <div className="h-16 rounded-2xl bg-white/10" />
                </div>
              </div>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-950/35 p-4">
              <p className="text-sm font-semibold text-white">Book stack + ID card</p>
              <div className="relative mt-6 flex items-end gap-3">
                <div className="h-36 w-16 rounded-[22px] bg-gradient-to-b from-amber-300 to-orange-600 shadow-2xl" />
                <div className="h-44 w-16 rounded-[22px] bg-gradient-to-b from-cyan-300 to-blue-700 shadow-2xl" />
                <div className="h-32 w-16 rounded-[22px] bg-gradient-to-b from-emerald-300 to-green-700 shadow-2xl" />
                <div className="ml-auto w-40 animate-float rounded-[28px] border border-cyan-200/30 bg-cyan-400/10 p-4">
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-center text-white">
                    <IdCard className="mx-auto h-8 w-8 text-cyan-100" />
                    <p className="mt-2 text-xs uppercase tracking-[0.28em] text-cyan-100">Card QR</p>
                    <div className="mt-3 grid grid-cols-5 gap-1">
                      {Array.from({ length: 25 }).map((_, index) => (
                        <div key={index} className={`h-2 w-2 rounded-sm ${index % 2 === 0 ? "bg-white" : "bg-cyan-200/40"}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <ScannerMock title="Reader station" code="RFID-INV-2026000031" mode="RFID" />
          <Card className="border-white/10 bg-white/10 text-white">
            <p className="text-sm font-semibold">Fond analitikasi</p>
            <div className="mt-4 space-y-3">
              {[
                ["Borrowed today", "148"],
                ["Pending reservations", "36"],
                ["Repository downloads", "912"],
                ["Reading room occupancy", "81%"]
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-sm text-slate-200">{label}</span>
                  <span className="text-lg font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function LandingPage({ language }: { language: Language }) {
  return (
    <div className="bg-mesh-academic text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-8">
            <Badge tone="gold">Academic SaaS library operations</Badge>
            <div className="space-y-5">
              <h1 className="text-4xl leading-tight text-white md:text-6xl">{t(language, "landingHeroTitle")}</h1>
              <p className="max-w-2xl text-lg text-slate-200">{t(language, "landingHeroSubtitle")}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                ["AI yordamchi bilan aqlli qidiruv", "Fan nomi, subject heading, synonym va faculty konteksti bo'yicha tavsiya."],
                ["Talaba uchun shaxsiy o'qish yo'li", "Reading plan, quiz, flashcard va bibliography jarayonlari bir kabinetda."],
                ["Kutubxonachi uchun real circulation desk", "Issue, return, renew, fine va receipt oqimlari bir ish stoli ichida."]
              ].map(([title, description]) => (
                <div key={title} className="rounded-[28px] border border-white/12 bg-white/8 p-4 backdrop-blur">
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-2 text-sm text-slate-300">{description}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/catalog">
                <Button size="lg">{t(language, "openCatalog")}</Button>
              </Link>
              <Link href="/repository">
                <Button variant="secondary" size="lg">
                  {t(language, "eResources")}
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="accent" size="lg">
                  {t(language, "cabinetAccess")}
                </Button>
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {[
                ["80 000+", "kitob fondi"],
                ["12 000+", "elektron resurs"],
                ["18 000+", "foydalanuvchi"],
                ["250+", "o‘quv zali joylari"],
                ["24/7", "elektron katalog"]
              ].map(([value, label]) => (
                <div key={label} className="rounded-[28px] border border-white/10 bg-white/5 p-4">
                  <p className="text-2xl font-semibold">{value}</p>
                  <p className="mt-2 text-sm text-slate-300">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <HeroVisual />
        </div>
      </div>
      <div className="mx-auto max-w-7xl space-y-6 px-4 pb-16 lg:px-8">
        <SectionTitle
          eyebrow="Platform modules"
          title="Universitet fondi, repository va AI learning workflow yagona platformada"
          description="Har bir modul bibliografik yozuv, circulation, repository access policy, reading analytics va audit talablariga mos ravishda ishlaydi."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["AI yordamchi bilan aqlli qidiruv", "Catalog va repository ichidagi grounded manbalar asosida prompt chips, confidence badge va source cards qaytaradi."],
            ["Talaba uchun shaxsiy o'qish yo'li", "Borrowed kitoblar, due soon risk, reading plan progress, quiz natijalari va bibliography bitta kabinetda jamlanadi."],
            ["Kutubxonachi uchun real circulation desk", "Student ID, barcode, RFID, active loans, return, renew, overdue fine va receipt oqimlari to'liq qayd etiladi."],
            ["Repository va ilmiy manbalar markazi", "Access policy, embargo, faculty-only resurslar, so'rov yuborish va download audit nazorati bilan."],
            ["Jahon standartlariga tayyor metadata", "MARC-like fields, Dublin Core mapping, OAI-PMH mock eksport va metadata quality warnings."],
            ["Analitika va qaror qabul qilish paneli", "Faculty usage, AI feature usage, fine status, reading room occupancy va audit signals asosida boshqaruv ko'rsatkichlari."],
            ["QR/RFID circulation preview", "Self-check identifikatsiya va inventory-level copy monitoring operatsion holatda ko'rsatiladi."],
            ["Reading room occupancy preview", "Seat map, QR check-in va no-show monitoring bilan o'quv zali oqimi boshqariladi."]
          ].map(([title, description]) => (
            <Card key={title} className="bg-white/95 text-ink">
              <p className="text-lg font-semibold">{title}</p>
              <p className="mt-3 text-sm text-slate-600">{description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookCover({ record }: { record: BibliographicRecord }) {
  return (
    <div className={`flex h-36 w-28 flex-col justify-between rounded-[24px] bg-gradient-to-br ${record.coverGradient} p-4 text-white shadow-xl`}>
      <div className="text-[10px] uppercase tracking-[0.28em] opacity-80">{record.publicationYear}</div>
      <div>
        <p className="text-sm font-semibold leading-snug">{record.title}</p>
        <p className="mt-2 text-xs opacity-80">{record.authors[0]}</p>
      </div>
    </div>
  );
}

function CatalogPage({
  state,
  language,
  initialMode = "catalog",
  recordId
}: {
  state: AppStore;
  language: Language;
  initialMode?: "catalog" | "new-arrivals" | "popular";
  recordId?: string;
}) {
  const { reserveBook, logAIUsage, trackEntityView } = state;
  const router = useRouter();
  const { push } = useToast();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [resourceType, setResourceType] = useState("all");
  const [faculty, setFaculty] = useState("all");
  const [lang, setLang] = useState("all");
  const [publisher, setPublisher] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [sort, setSort] = useState(
    initialMode === "new-arrivals" ? "newest" : initialMode === "popular" ? "most-borrowed" : "relevance"
  );
  const [citationRecord, setCitationRecord] = useState<BibliographicRecord | null>(null);
  const [lastSemanticLog, setLastSemanticLog] = useState("");
  const currentViewerId = state.currentUserId;

  const filtered = useMemo(() => {
    const base = state.records.filter((record) => record.status === "published");
    const semanticBase = deferredQuery
      ? semanticSearchRecords(base, deferredQuery, {
          faculty: state.users.find((item) => item.id === state.currentUserId)?.faculty,
          department: state.users.find((item) => item.id === state.currentUserId)?.department
        })
      : base;
    return semanticBase
      .filter((record) => {
        const { available } = availabilityForRecord(state, record.id);
        const searchSpace = [
          record.title,
          record.subtitle,
          record.authors.join(" "),
          record.isbn,
          record.udc,
          record.bbk,
          record.ddc,
          record.publisher,
          record.subjects.join(" "),
          ...state.copies.filter((copy) => copy.recordId === record.id).map((copy) => copy.inventoryNumber)
        ].join(" ");

        const matchesQuery = deferredQuery ? safeContains(searchSpace, deferredQuery) || semanticBase.some((item) => item.id === record.id) : true;
        const matchesType = resourceType === "all" ? true : record.resourceType === resourceType;
        const matchesFaculty = faculty === "all" ? true : record.faculty === faculty;
        const matchesLanguage = lang === "all" ? true : record.language === lang;
        const matchesPublisher = publisher === "all" ? true : record.publisher === publisher;
        const matchesAvailability =
          availability === "all"
            ? true
            : availability === "available"
              ? available > 0
              : available === 0;
        const matchesArrival = initialMode === "new-arrivals" ? record.isNewArrival : true;
        return (
          matchesQuery &&
          matchesType &&
          matchesFaculty &&
          matchesLanguage &&
          matchesPublisher &&
          matchesAvailability &&
          matchesArrival
        );
      })
      .sort((a, b) => {
        if (sort === "newest") return b.publicationYear - a.publicationYear;
        if (sort === "title") return a.title.localeCompare(b.title);
        if (sort === "most-borrowed") return b.borrowCount - a.borrowCount;
        if (sort === "available-first") return availabilityForRecord(state, b.id).available - availabilityForRecord(state, a.id).available;
        return 0;
      });
  }, [availability, deferredQuery, faculty, initialMode, lang, publisher, resourceType, sort, state]);

  const selectedRecord = recordId ? state.records.find((item) => item.id === recordId) ?? null : null;

  useEffect(() => {
    if (deferredQuery.trim().length < 3 || currentViewerId === null || deferredQuery === lastSemanticLog) {
      return;
    }
    logAIUsage({
      userId: currentViewerId,
      feature: "semantic_search",
      input: deferredQuery,
      outputSummary: `${filtered.length} result`,
      sourceIds: filtered.slice(0, 5).map((record) => record.id)
    });
    setLastSemanticLog(deferredQuery);
  }, [currentViewerId, deferredQuery, filtered, lastSemanticLog, logAIUsage]);

  useEffect(() => {
    if (!selectedRecord || !currentViewerId) {
      return;
    }
    trackEntityView({
      actorId: currentViewerId,
      entity: "record",
      entityId: selectedRecord.id,
      details: selectedRecord.title
    });
  }, [currentViewerId, selectedRecord, trackEntityView]);

  if (selectedRecord) {
    const resource = resourceForRecord(state, selectedRecord.id);
    const copies = state.copies.filter((item) => item.recordId === selectedRecord.id);
    const availabilityInfo = availabilityForRecord(state, selectedRecord.id);
    const similar = state.records
      .filter((item) => item.id !== selectedRecord.id && item.faculty === selectedRecord.faculty)
      .slice(0, 4);
    const relatedResources = state.digitalResources
      .filter((item) => item.recordId === selectedRecord.id || item.faculty === selectedRecord.faculty)
      .slice(0, 4);
    const reservationQueue = state.reservations
      .filter((item) => item.recordId === selectedRecord.id && ["pending", "approved"].includes(item.status))
      .slice(0, 6);
    const circulationHistory = state.loans
      .filter((loan) => copies.some((copy) => copy.id === loan.copyId))
      .slice(0, 6);
    const summary = buildSummaryFromRecord({
      title: selectedRecord.title,
      annotation: selectedRecord.annotation,
      keywords: selectedRecord.keywords,
      subjects: selectedRecord.subjects,
      resourceType: selectedRecord.resourceType
    });
    const completeness = metadataCompleteness(selectedRecord);

    const columns: ColumnDef<BookCopyModel>[] = [
      { header: "Inventory", cell: ({ row }) => row.original.inventoryNumber },
      { header: "Barcode", cell: ({ row }) => row.original.barcode },
      { header: "Shelf", cell: ({ row }) => `${row.original.shelf} / ${row.original.row}` },
      { header: "Branch", cell: ({ row }) => branchName(state, row.original.branchId) },
      {
        header: "Status",
        cell: ({ row }) => <Badge tone={statusTone(row.original.status)}>{row.original.status}</Badge>
      }
    ];

    return (
      <div className="space-y-6">
        <SectionTitle
          eyebrow="Catalog detail"
          title={selectedRecord.title}
          description={`${selectedRecord.authors.join(", ")} · ${selectedRecord.publicationYear} · ${selectedRecord.publisher}`}
          actions={
            <>
              <Button
                onClick={() => {
                  const result = reserveBook(selectedRecord.id);
                  push({
                    tone: result.success ? "success" : "error",
                    title: result.message
                  });
                }}
              >
                {t(language, "reserve")}
              </Button>
              {resource ? (
                <Button variant="secondary" onClick={() => router.push(`/repository/${resource.id}`)}>
                  {t(language, "readOnline")}
                </Button>
              ) : null}
              <Button variant="secondary" onClick={() => setCitationRecord(selectedRecord)}>
                {t(language, "citation")}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const result = state.addBibliographyItem({
                    recordId: selectedRecord.id,
                    style: "APA 7",
                    citationText: buildStyledCitation(selectedRecord, "APA 7")
                  });
                  push({ tone: result.success ? "success" : "error", title: result.message });
                }}
              >
                Bibliografiyaga qo‘shish
              </Button>
              <Button variant="secondary" onClick={() => router.push(currentViewerId ? "/student/reading-plans" : "/login")}>
                Generate AI study plan
              </Button>
              <Button variant="secondary" onClick={() => router.push(currentViewerId ? "/student/ai-quiz" : "/login")}>
                Generate quiz
              </Button>
            </>
          }
        />
        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <Card className="space-y-5">
            <BookCover record={selectedRecord} />
            <Badge tone={completeness.tone}>Metadata completeness {completeness.score}%</Badge>
            {completeness.warnings.length ? (
              <div className="flex flex-wrap gap-2">
                {completeness.warnings.map((warning) => (
                  <Badge key={warning} tone="orange">{warning}</Badge>
                ))}
              </div>
            ) : null}
            <div className="space-y-3 text-sm text-slate-700">
              <p><span className="font-semibold">ISBN:</span> {selectedRecord.isbn}</p>
              <p><span className="font-semibold">ISSN:</span> {selectedRecord.issn}</p>
              <p><span className="font-semibold">UDK / BBK / DDC / LCC:</span> {selectedRecord.udc} / {selectedRecord.bbk} / {selectedRecord.ddc} / {selectedRecord.lcc}</p>
              <p><span className="font-semibold">Language:</span> {selectedRecord.language}</p>
              <p><span className="font-semibold">Pages:</span> {selectedRecord.pages}</p>
              <p><span className="font-semibold">Shelf location:</span> {copies[0] ? `${copies[0].shelf} / ${copies[0].row}` : "No holdings"}</p>
              <p><span className="font-semibold">Availability:</span> {availabilityInfo.available} / {availabilityInfo.total}</p>
              <p><span className="font-semibold">Access pattern:</span> {availabilityInfo.label}</p>
            </div>
          </Card>
          <div className="space-y-6">
            <Card>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Annotation</p>
                  <p className="mt-2 text-sm text-slate-700">{selectedRecord.annotation}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Subjects</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedRecord.subjects.map((item) => (
                      <Badge key={item} tone="cyan">{item}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between gap-3">
                <p className="text-lg font-semibold text-ink">Holdings and availability</p>
                <Badge tone={statusTone(availabilityInfo.label)}>{availabilityInfo.label}</Badge>
              </div>
              <div className="mt-4">
                <DataTable data={copies} columns={columns} />
              </div>
            </Card>
            <Card className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className="text-lg font-semibold text-ink">Reservation queue</p>
                <div className="mt-4 space-y-3">
                  {reservationQueue.length === 0 ? (
                    <p className="text-sm text-slate-500">Bu yozuv bo&apos;yicha faol navbat mavjud emas.</p>
                  ) : (
                    reservationQueue.map((item) => {
                      const user = state.users.find((userItem) => userItem.id === item.userId);
                      return (
                        <div key={item.id} className="rounded-2xl border border-slate-200 p-3">
                          <p className="font-semibold text-ink">{user?.fullName ?? "Anonim foydalanuvchi"}</p>
                          <p className="mt-1 text-sm text-slate-500">{item.status} · expires {formatDate(item.expiresAt)}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              <div>
                <p className="text-lg font-semibold text-ink">Circulation history</p>
                <div className="mt-4 space-y-3">
                  {circulationHistory.length === 0 ? (
                    <p className="text-sm text-slate-500">Circulation tarixi hali shakllanmagan.</p>
                  ) : (
                    circulationHistory.map((loan) => (
                      <div key={loan.id} className="rounded-2xl border border-slate-200 p-3">
                        <p className="font-semibold text-ink">{loan.status}</p>
                        <p className="mt-1 text-sm text-slate-500">Issued {formatDate(loan.issuedAt)} · Due {formatDate(loan.dueAt)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
            <AISummaryBox
              title={selectedRecord.title}
              summary={summary.summary}
              concepts={summary.concepts}
              keyQuestions={summary.keyQuestions}
              examTheses={summary.examTheses}
              discussionQuestions={summary.discussionQuestions}
            />
            <Card className="grid gap-4 xl:grid-cols-2">
              <div>
                <p className="text-lg font-semibold text-ink">MARC-like fields</p>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  {selectedRecord.marcFields.slice(0, 10).map((field) => (
                    <div key={`${field.tag}-${field.value}`} className="rounded-2xl border border-slate-200 p-3">
                      <p className="font-semibold text-ink">{field.tag} · {field.label}</p>
                      <p className="mt-1">{field.value || "Maydon to'ldirilmagan"}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-lg font-semibold text-ink">Dublin Core fields</p>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  {selectedRecord.dublinCore.map((field) => (
                    <div key={`${field.key}-${field.value}`} className="rounded-2xl border border-slate-200 p-3">
                      <p className="font-semibold text-ink">{field.key}</p>
                      <p className="mt-1">{field.value || "Maydon to'ldirilmagan"}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            {resource ? <PdfPreviewMock title={resource.title} watermark="University access" /> : null}
            <Card>
              <p className="text-lg font-semibold text-ink">Similar books</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {similar.map((item) => (
                  <button key={item.id} onClick={() => router.push(`/catalog/${item.id}`)} className="rounded-[24px] border border-slate-200 p-4 text-left transition hover:border-cyan-300 hover:bg-cyan-50">
                    <p className="font-semibold text-ink">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.authors.join(", ")}</p>
                  </button>
                ))}
              </div>
            </Card>
            <Card>
              <p className="text-lg font-semibold text-ink">Related digital resources</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {relatedResources.map((item) => (
                  <button key={item.id} onClick={() => router.push(`/repository/${item.id}`)} className="rounded-2xl border border-slate-200 p-4 text-left transition hover:bg-slate-50">
                    <p className="font-semibold text-ink">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.type} · {item.accessLevel}</p>
                  </button>
                ))}
              </div>
            </Card>
            <AIAssistantPanel promptSeed={selectedRecord.title} title="Shu kitob bo'yicha AI yordam" />
          </div>
        </div>
        <Modal
          open={Boolean(citationRecord)}
          title="Citation"
          onClose={() => setCitationRecord(null)}
          footer={
            <Button
              onClick={() => {
                if (citationRecord) {
                  navigator.clipboard.writeText(buildCitation(citationRecord));
                  push({ tone: "success", title: "Citation copied to clipboard." });
                }
              }}
            >
              Copy citation
            </Button>
          }
        >
          <p className="text-sm text-slate-700">{citationRecord ? buildCitation(citationRecord) : ""}</p>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Electronic catalog"
        title={initialMode === "popular" ? "Most borrowed records" : initialMode === "new-arrivals" ? "New arrivals" : "OPAC electronic catalog"}
        description="Title, author, ISBN, inventory number, classification code va subject heading bo‘yicha qidiruv."
      />
      <div className="grid gap-6 xl:grid-cols-[280px_1fr_280px]">
        <Card className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-ink">{t(language, "advancedSearch")}</p>
            <p className="mt-1 text-xs text-slate-500">MARC-like metadata va circulation holati bo‘yicha filterlar.</p>
          </div>
          <div>
            <Label>Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-10" placeholder="Title, author, ISBN, inventory number" />
            </div>
          </div>
          <div>
            <Label>Resource type</Label>
            <Select value={resourceType} onChange={(event) => setResourceType(event.target.value)}>
              <option value="all">All</option>
              {[...new Set(state.records.map((item) => item.resourceType))].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Faculty</Label>
            <Select value={faculty} onChange={(event) => setFaculty(event.target.value)}>
              <option value="all">All</option>
              {[...new Set(state.records.map((item) => item.faculty))].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Language</Label>
            <Select value={lang} onChange={(event) => setLang(event.target.value)}>
              <option value="all">All</option>
              {[...new Set(state.records.map((item) => item.language))].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Publisher</Label>
            <Select value={publisher} onChange={(event) => setPublisher(event.target.value)}>
              <option value="all">All</option>
              {[...new Set(state.records.map((item) => item.publisher))].slice(0, 8).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Availability</Label>
            <Select value={availability} onChange={(event) => setAvailability(event.target.value)}>
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </Select>
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Filter className="h-4 w-4" />
              {filtered.length} bibliographic records
            </div>
            <div className="flex items-center gap-3">
              <Label>Sort</Label>
              <Select value={sort} onChange={(event) => setSort(event.target.value)} className="min-w-[220px]">
                <option value="relevance">Relevance</option>
                <option value="newest">Newest</option>
                <option value="title">Title A-Z</option>
                <option value="most-borrowed">Most borrowed</option>
                <option value="available-first">Available first</option>
              </Select>
            </div>
          </Card>
          {filtered.length === 0 ? (
            <EmptyState title={t(language, "noResults")} description="Qidiruv mezonlarini kengaytirib ko‘ring yoki boshqa metadata maydonlari bo‘yicha izlang." />
          ) : (
            filtered.slice(0, 24).map((record) => {
              const availabilityData = availabilityForRecord(state, record.id);
              const resource = resourceForRecord(state, record.id);
              return (
                <Card key={record.id}>
                  <div className="grid gap-5 md:grid-cols-[128px_1fr_auto] md:items-center">
                    <BookCover record={record} />
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={statusTone(availabilityData.label)}>{availabilityData.label}</Badge>
                        <Badge tone="cyan">{record.resourceType}</Badge>
                        <Badge tone={metadataCompleteness(record).tone}>metadata {metadataCompleteness(record).score}%</Badge>
                        {record.isNewArrival ? <Badge tone="gold">new arrival</Badge> : null}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-ink">{record.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">{record.authors.join(", ")}</p>
                      </div>
                      <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                        <p><span className="font-semibold">ISBN:</span> {record.isbn}</p>
                        <p><span className="font-semibold">Category:</span> {record.faculty}</p>
                        <p><span className="font-semibold">Year:</span> {record.publicationYear}</p>
                        <p><span className="font-semibold">Location:</span> {branchName(state, state.copies.find((item) => item.recordId === record.id)?.branchId ?? "branch-main")}</p>
                        <p><span className="font-semibold">Available copies:</span> {availabilityData.available}</p>
                        <p><span className="font-semibold">Total copies:</span> {availabilityData.total}</p>
                      </div>
                      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-600">
                        <span className="font-semibold text-ink">Why this result?</span> {explainCatalogMatch(record, deferredQuery, resource)}
                      </div>
                      {metadataCompleteness(record).warnings.length ? (
                        <div className="flex flex-wrap gap-2">
                          {metadataCompleteness(record).warnings.map((warning) => (
                            <Badge key={warning} tone="orange">{warning}</Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button onClick={() => router.push(`/catalog/${record.id}`)}>{t(language, "viewDetail")}</Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const result = reserveBook(record.id);
                          push({ tone: result.success ? "success" : "error", title: result.message });
                        }}
                      >
                        {t(language, "reserve")}
                      </Button>
                      {resource ? (
                        <Button variant="secondary" onClick={() => router.push(`/repository/${resource.id}`)}>
                          {t(language, "readOnline")}
                        </Button>
                      ) : null}
                      <Button variant="secondary" onClick={() => setCitationRecord(record)}>
                        {t(language, "citation")}
                      </Button>
                      <Button variant="secondary" onClick={() => router.push(currentViewerId ? "/student/reading-plans" : "/login")}>
                        Study plan
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
        <div className="space-y-4">
          <Card>
            <p className="text-sm font-semibold text-ink">Preview & recommendations</p>
            <div className="mt-4 space-y-3">
              {state.records
                .filter((item) => item.status === "published")
                .sort((a, b) => b.borrowCount - a.borrowCount)
                .slice(0, 4)
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => router.push(`/catalog/${item.id}`)}
                    className="w-full rounded-2xl border border-slate-200 p-3 text-left transition hover:bg-slate-50"
                  >
                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.borrowCount} borrow circulation count</p>
                  </button>
                ))}
            </div>
          </Card>
          <AIAssistantPanel promptSeed={deferredQuery || "OPAC katalogi"} />
          <Card className="bg-slate-950 text-white">
            <p className="text-sm font-semibold">Digital shelf</p>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {filtered.slice(0, 8).map((item) => (
                <div key={item.id} className={`h-24 rounded-2xl bg-gradient-to-br ${item.coverGradient}`} />
              ))}
            </div>
          </Card>
        </div>
      </div>
      <Modal
        open={Boolean(citationRecord)}
        title="Citation"
        onClose={() => setCitationRecord(null)}
        footer={
          <Button
            onClick={() => {
              if (citationRecord) {
                navigator.clipboard.writeText(buildCitation(citationRecord));
                push({ tone: "success", title: "Citation copied to clipboard." });
              }
            }}
          >
            Copy citation
          </Button>
        }
      >
        <p className="text-sm text-slate-700">{citationRecord ? buildCitation(citationRecord) : ""}</p>
      </Modal>
    </div>
  );
}

function RepositoryPage({
  state,
  resourceId
}: {
  state: AppStore;
  resourceId?: string;
}) {
  const router = useRouter();
  const { push } = useToast();
  const { trackEntityView } = state;
  const [citation, setCitation] = useState<string | null>(null);
  const [requestingResourceId, setRequestingResourceId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");
  const currentViewerId = state.currentUserId;
  const currentUser = state.users.find((item) => item.id === currentViewerId) ?? null;

  const resource = resourceId ? state.digitalResources.find((item) => item.id === resourceId) ?? null : null;
  useEffect(() => {
    if (!resource || !currentViewerId) {
      return;
    }
    trackEntityView({
      actorId: currentViewerId,
      entity: "resource",
      entityId: resource.id,
      details: resource.title
    });
  }, [currentViewerId, resource, trackEntityView]);

  if (resource) {
    const linkedRecord = resource.recordId ? state.records.find((item) => item.id === resource.recordId) : null;
    const access = getRepositoryAccessDecision(resource, currentUser);
    const summary = buildSummaryFromRecord({
      title: resource.title,
      annotation: resource.abstract,
      keywords: resource.keywords,
      subjects: linkedRecord?.subjects ?? [resource.faculty, resource.department],
      resourceType: resource.type
    });
    return (
      <div className="space-y-6">
        <SectionTitle
          eyebrow="Digital repository"
          title={resource.title}
          description={`${resource.type} · ${resource.faculty} · ${resource.year}`}
          actions={
            <>
              {access.canDownload ? (
                <Button
                  onClick={() => {
                    state.downloadResource({ resourceId: resource.id, actorId: currentUser?.id });
                    downloadTextFile(`${resource.fileName}.txt`, `${resource.title}\n${resource.abstract}`);
                    push({ tone: "success", title: "Mock download generated." });
                  }}
                >
                  Download
                </Button>
              ) : null}
              {access.canRequestAccess ? (
                <Button variant="secondary" onClick={() => setRequestingResourceId(resource.id)}>
                  Ruxsat so&apos;rovi yuborish
                </Button>
              ) : null}
              <Button
                variant="secondary"
                onClick={() =>
                  setCitation(
                    linkedRecord
                      ? buildCitation(linkedRecord)
                      : `${resource.title}. ${resource.faculty} repository resource. ${resource.year}.`
                  )
                }
              >
                Citation
              </Button>
            </>
          }
        />
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {access.canOpen ? (
              <PdfPreviewMock title={resource.title} watermark={resource.accessLevel} />
            ) : (
              <RepositoryAccessGuard
                resource={resource}
                user={currentUser}
                onRequestAccess={access.canRequestAccess ? () => setRequestingResourceId(resource.id) : undefined}
              >
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6">
                  <p className="text-sm text-slate-600">
                    Fayl preview yopiq. Hozircha metadata, annotatsiya va bibliografik tavsif bilan tanishishingiz mumkin.
                  </p>
                </div>
              </RepositoryAccessGuard>
            )}
            <AISummaryBox
              title={resource.title}
              summary={summary.summary}
              concepts={summary.concepts}
              keyQuestions={summary.keyQuestions}
              examTheses={summary.examTheses}
              discussionQuestions={summary.discussionQuestions}
            />
          </div>
          <div className="space-y-4">
            <RepositoryAccessGuard
              resource={resource}
              user={currentUser}
              compact
              onOpen={access.canOpen ? () => push({ tone: "info", title: "Preview panel orqali ko'rish mumkin." }) : undefined}
              onDownload={
                access.canDownload
                  ? () => {
                      state.downloadResource({ resourceId: resource.id, actorId: currentUser?.id });
                      downloadTextFile(`${resource.fileName}.txt`, `${resource.title}\n${resource.abstract}`);
                      push({ tone: "success", title: "Mock download generated." });
                    }
                  : undefined
              }
              onRequestAccess={access.canRequestAccess ? () => setRequestingResourceId(resource.id) : undefined}
            />
            <Card>
              <p className="text-sm font-semibold text-ink">Repository metadata</p>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <p><span className="font-semibold">Handle:</span> {resource.handle}</p>
                <p><span className="font-semibold">Access level:</span> {resource.accessLevel}</p>
                <p><span className="font-semibold">License:</span> {resource.license}</p>
                <p><span className="font-semibold">Version:</span> {resource.version}</p>
                <p><span className="font-semibold">Downloads:</span> {resource.downloads}</p>
                <p><span className="font-semibold">Views:</span> {resource.views}</p>
                <p><span className="font-semibold">Keywords:</span> {resource.keywords.join(", ")}</p>
                {resource.doi ? <p><span className="font-semibold">DOI:</span> {resource.doi}</p> : null}
              </div>
            </Card>
            <Card>
              <p className="text-sm font-semibold text-ink">Abstract</p>
              <p className="mt-3 text-sm text-slate-600">{resource.abstract}</p>
            </Card>
            <AIAssistantPanel promptSeed={resource.title} title="Elektron resurs bo'yicha AI yordam" />
          </div>
        </div>
        <Modal
          open={Boolean(citation)}
          title="Citation"
          onClose={() => setCitation(null)}
          footer={<Button onClick={() => citation && navigator.clipboard.writeText(citation)}>Copy</Button>}
        >
          <p className="text-sm text-slate-700">{citation}</p>
        </Modal>
        <AccessRequestModal
          open={requestingResourceId === resource.id}
          onClose={() => setRequestingResourceId(null)}
          resourceTitle={resource.title}
          defaultName={currentUser?.fullName ?? ""}
          defaultEmail={currentUser?.email ?? ""}
          onSubmit={(payload) => {
            const result = state.requestResourceAccess({ resourceId: resource.id, ...payload });
            push({ tone: result.success ? "success" : "error", title: result.message });
          }}
        />
      </div>
    );
  }

  const items = state.digitalResources.filter((item) => {
    const matchesQuery = query ? safeContains(`${item.title} ${item.abstract} ${item.keywords.join(" ")}`, query) : true;
    const matchesType = typeFilter === "all" ? true : item.type === typeFilter;
    const matchesFaculty = facultyFilter === "all" ? true : item.faculty === facultyFilter;
    const matchesAccess = accessFilter === "all" ? true : item.accessLevel === accessFilter;
    return matchesQuery && matchesType && matchesFaculty && matchesAccess;
  });

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Institutional repository"
        title="Digital repository"
        description="E-book, article, thesis, lecture notes va boshqa elektron resurslar."
      />
      <Card className="grid gap-4 lg:grid-cols-4">
        <div>
          <Label>Search</Label>
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title, keyword, abstract" />
        </div>
        <div>
          <Label>Type</Label>
          <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="all">All</option>
            {[...new Set(state.digitalResources.map((item) => item.type))].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Faculty</Label>
          <Select value={facultyFilter} onChange={(event) => setFacultyFilter(event.target.value)}>
            <option value="all">All</option>
            {[...new Set(state.digitalResources.map((item) => item.faculty))].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Access</Label>
          <Select value={accessFilter} onChange={(event) => setAccessFilter(event.target.value)}>
            <option value="all">All</option>
            {[...new Set(state.digitalResources.map((item) => item.accessLevel))].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </Select>
        </div>
      </Card>
      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id}>
            <div className="flex items-center justify-between">
              <AccessPolicyBadge resource={item} />
              <Badge tone="cyan">{item.type}</Badge>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-ink">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.abstract.slice(0, 140)}...</p>
            <div className="mt-4 grid gap-2 text-sm text-slate-600">
              <p><span className="font-semibold">Faculty:</span> {item.faculty}</p>
              <p><span className="font-semibold">Department:</span> {item.department}</p>
              <p><span className="font-semibold">Year:</span> {item.year}</p>
              <p><span className="font-semibold">Downloads:</span> {item.downloads}</p>
            </div>
            <div className="mt-5">
              <RepositoryAccessGuard
                resource={item}
                user={currentUser}
                compact
                onOpen={getRepositoryAccessDecision(item, currentUser).canOpen ? () => router.push(`/repository/${item.id}`) : undefined}
                onDownload={
                  getRepositoryAccessDecision(item, currentUser).canDownload
                    ? () => {
                        state.downloadResource({ resourceId: item.id, actorId: currentUser?.id });
                        downloadTextFile(`${item.fileName}.txt`, item.abstract);
                        push({ tone: "success", title: "Mock download generated." });
                      }
                    : undefined
                }
                onRequestAccess={
                  getRepositoryAccessDecision(item, currentUser).canRequestAccess
                    ? () => setRequestingResourceId(item.id)
                    : undefined
                }
              />
            </div>
          </Card>
        ))}
      </div>
      <AIAssistantPanel promptSeed={query || "repository"} title="Repository AI yordamchisi" />
      {requestingResourceId ? (
        <AccessRequestModal
          open={Boolean(requestingResourceId)}
          onClose={() => setRequestingResourceId(null)}
          resourceTitle={state.digitalResources.find((item) => item.id === requestingResourceId)?.title ?? "Resource"}
          defaultName={currentUser?.fullName ?? ""}
          defaultEmail={currentUser?.email ?? ""}
          onSubmit={(payload) => {
            const result = state.requestResourceAccess({ resourceId: requestingResourceId, ...payload });
            push({ tone: result.success ? "success" : "error", title: result.message });
          }}
        />
      ) : null}
    </div>
  );
}

function AuthPage({ mode, language }: { mode: "login" | "register"; language: Language }) {
  const router = useRouter();
  const store = useAppStore();
  const { push } = useToast();
  const [identityIdentifier, setIdentityIdentifier] = useState(demoAccounts[0]!.email);
  const [faceLoginOpen, setFaceLoginOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [completedLivenessSteps, setCompletedLivenessSteps] = useState(0);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: demoAccounts[0]!.email, password: demoAccounts[0]!.password }
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "password123",
      role: "student",
      faculty: "Axborot texnologiyalari",
      department: "Dasturiy injiniring",
      group: "SE-24-1",
      studentId: "",
      phone: "+998 90 000 00 00",
      cardExpiryDate: "2028-06-30"
    }
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <SectionTitle
            eyebrow="Authentication"
            title={mode === "login" ? "Kabinetga kirish" : "Yangi foydalanuvchi ro‘yxati"}
            description="Role-based redirect va localStorage persist bilan ishlaydigan mock auth oqimi."
          />
          <Card>
            {mode === "login" ? (
              <div className="space-y-5">
                <form
                  className="space-y-4"
                  onSubmit={loginForm.handleSubmit((values) => {
                    const result = store.login(values.email, values.password);
                    push({ tone: result.success ? "success" : "error", title: result.message });
                    if (result.redirect) {
                      router.push(result.redirect);
                    }
                  })}
                >
                  <div>
                    <Label>{t(language, "email")}</Label>
                    <Input
                      {...loginForm.register("email")}
                      onChange={(event) => {
                        loginForm.register("email").onChange(event);
                        setIdentityIdentifier(event.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <Label>{t(language, "password")}</Label>
                    <Input type="password" {...loginForm.register("password")} />
                  </div>
                  <Button type="submit" className="w-full">{t(language, "login")}</Button>
                </form>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-ink">Alternative identity methods</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Email yoki Student ID kiriting. Face ID, QR student card va passkey alternativ kirish sifatida ishlaydi.
                  </p>
                  <div className="mt-4 space-y-3">
                    <Input
                      value={identityIdentifier}
                      onChange={(event) => setIdentityIdentifier(event.target.value)}
                      placeholder="student@unilibrary.uz yoki ST-2024001"
                    />
                    <div className="grid gap-3 md:grid-cols-3">
                      <Button variant="secondary" onClick={() => setFaceLoginOpen(true)}>
                        <Fingerprint className="h-4 w-4" />
                        Face ID orqali kirish
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const result = store.loginWithQrCard(identityIdentifier);
                          push({ tone: result.success ? "success" : "error", title: result.message });
                          if (result.redirect) router.push(result.redirect);
                        }}
                      >
                        <ScanLine className="h-4 w-4" />
                        QR student card orqali kirish
                      </Button>
                      <PasskeyButton
                        compact
                        label="Passkey orqali kirish"
                        onClick={() => {
                          const result = store.loginWithPasskey(identityIdentifier);
                          push({ tone: result.success ? "success" : "error", title: result.message });
                          if (result.redirect) router.push(result.redirect);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <Link href="/register" className="block text-center text-sm text-cyan-700">
                  {t(language, "register")}
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                <IDCardScanner
                  onExtract={(payload) => {
                    registerForm.setValue("fullName", payload.fullName.value);
                    registerForm.setValue("studentId", payload.studentId.value);
                    registerForm.setValue("faculty", payload.faculty.value);
                    registerForm.setValue("department", payload.department.value);
                    registerForm.setValue("group", payload.group.value);
                    registerForm.setValue("cardExpiryDate", payload.expiryDate.value);
                    push({ tone: "success", title: "ID card OCR mock form maydonlarini to'ldirdi." });
                  }}
                />
                <form
                  className="grid gap-4 md:grid-cols-2"
                  onSubmit={registerForm.handleSubmit((values) => {
                    const result = store.register(values);
                    push({ tone: result.success ? "success" : "error", title: result.message });
                    if (result.redirect) {
                      router.push(result.redirect);
                    }
                  })}
                >
                  <div className="md:col-span-2">
                    <Label>{t(language, "fullName")}</Label>
                    <Input {...registerForm.register("fullName")} />
                  </div>
                  <div>
                    <Label>{t(language, "email")}</Label>
                    <Input {...registerForm.register("email")} />
                  </div>
                  <div>
                    <Label>{t(language, "password")}</Label>
                    <Input type="password" {...registerForm.register("password")} />
                  </div>
                  <div>
                    <Label>{t(language, "role")}</Label>
                    <Select {...registerForm.register("role")}>
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Student ID</Label>
                    <Input {...registerForm.register("studentId")} />
                  </div>
                  <div>
                    <Label>{t(language, "faculty")}</Label>
                    <Input {...registerForm.register("faculty")} />
                  </div>
                  <div>
                    <Label>{t(language, "department")}</Label>
                    <Input {...registerForm.register("department")} />
                  </div>
                  <div>
                    <Label>{t(language, "group")}</Label>
                    <Input {...registerForm.register("group")} />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input {...registerForm.register("phone")} />
                  </div>
                  <div>
                    <Label>Card expiry</Label>
                    <Input type="date" {...registerForm.register("cardExpiryDate")} />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="submit" className="w-full">{t(language, "register")}</Button>
                  </div>
                </form>
              </div>
            )}
          </Card>
        </div>
        <Card className="bg-ink text-white">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-6 w-6 text-cyan-300" />
            <div>
              <p className="text-lg font-semibold">{t(language, "demoAccounts")}</p>
              <p className="text-sm text-slate-300">{t(language, "loginHint")}</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                onClick={() => {
                  loginForm.setValue("email", account.email);
                  loginForm.setValue("password", account.password);
                  push({ tone: "info", title: `${account.label} credentials loaded.` });
                }}
                className="w-full rounded-[24px] border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{account.label}</p>
                  <Badge tone="gold">{account.role}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-300">{account.email}</p>
                <p className="text-sm text-slate-400">{account.password}</p>
              </button>
            ))}
          </div>
        </Card>
      </div>
      <Modal
        open={faceLoginOpen}
        title="Face ID orqali kirish"
        onClose={() => {
          setFaceLoginOpen(false);
          setCameraReady(false);
          setCompletedLivenessSteps(0);
        }}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setFaceLoginOpen(false);
                setCameraReady(false);
                setCompletedLivenessSteps(0);
              }}
            >
              Bekor qilish
            </Button>
            <Button
              onClick={() => {
                const result = store.loginWithFaceId(identityIdentifier);
                push({ tone: result.success ? "success" : "error", title: result.message });
                if (result.redirect) router.push(result.redirect);
                if (result.success) {
                  setFaceLoginOpen(false);
                  setCameraReady(false);
                  setCompletedLivenessSteps(0);
                }
              }}
              disabled={!cameraReady || completedLivenessSteps < livenessSteps.length}
            >
              Verify and login
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Card className="bg-slate-950 text-white">
            <div className="rounded-[28px] border border-cyan-300/20 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">Camera verification</p>
              <p className="mt-2 text-sm text-slate-300">
                Identity: {identityIdentifier || "Student ID yoki email kiriting"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setCameraReady(true)}>
                  Camera permission grant
                </Button>
                <Badge tone={cameraReady ? "emerald" : "gold"}>{cameraReady ? "camera_ready" : "permission_required"}</Badge>
              </div>
            </div>
          </Card>
          <Card>
            <p className="font-semibold text-ink">Liveness mock stepper</p>
            <div className="mt-4 space-y-3">
              {livenessSteps.map((step, index) => (
                <button
                  key={step}
                  onClick={() => setCompletedLivenessSteps((current) => Math.max(current, index + 1))}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  <span className="text-sm text-ink">{step}</span>
                  <Badge tone={completedLivenessSteps > index ? "emerald" : "slate"}>
                    {completedLivenessSteps > index ? "done" : "pending"}
                  </Badge>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </Modal>
    </div>
  );
}

function UserSummaryCard({ currentUser, state }: { currentUser: User; state: AppStore }) {
  const activeLoans = state.loans.filter(
    (item) => item.userId === currentUser.id && item.status !== "returned"
  ).length;
  const unpaidFines = state.fines
    .filter((item) => item.userId === currentUser.id && item.status !== "paid" && item.status !== "waived")
    .reduce((acc, item) => acc + item.amount, 0);
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-ink">{currentUser.fullName}</p>
          <p className="text-sm text-slate-500">{currentUser.membershipNumber}</p>
        </div>
        <Badge tone={currentUser.status === "active" ? "emerald" : "rose"}>{currentUser.status}</Badge>
      </div>
      <div className="grid gap-3 text-sm text-slate-600">
        <p><span className="font-semibold">Faculty:</span> {currentUser.faculty}</p>
        <p><span className="font-semibold">Department:</span> {currentUser.department}</p>
        <p><span className="font-semibold">Student ID / Employee ID:</span> {currentUser.studentId ?? currentUser.employeeId}</p>
        <p><span className="font-semibold">Active loans:</span> {activeLoans}</p>
        <p><span className="font-semibold">Outstanding fines:</span> {formatCurrency(unpaidFines)}</p>
      </div>
      <ScannerMock title="Membership QR" code={currentUser.cardQrCode} mode="QR" />
    </Card>
  );
}

function StudentAndTeacherArea({
  currentUser,
  state,
  path
}: {
  currentUser: User;
  state: AppStore;
  path: string[];
}) {
  const router = useRouter();
  const { push } = useToast();
  const { logAIUsage } = state;
  const readingList = useReadingList(currentUser.id);
  const [methodByFine, setMethodByFine] = useState<Record<string, string>>({});
  const [lastAiPageLog, setLastAiPageLog] = useState("");
  const [cardPreview, setCardPreview] = useState<string | null>(null);
  const [passkeyDeviceName, setPasskeyDeviceName] = useState("Student laptop");
  const [enrollmentConsent, setEnrollmentConsent] = useState(false);
  const [enrollmentCameraReady, setEnrollmentCameraReady] = useState(false);
  const [enrollmentStepsDone, setEnrollmentStepsDone] = useState(0);

  const loans = state.loans.filter((item) => item.userId === currentUser.id && item.status !== "returned");
  const reservations = state.reservations.filter((item) => item.userId === currentUser.id);
  const fines = state.fines.filter((item) => item.userId === currentUser.id);
  const bookings = state.bookings.filter((item) => item.userId === currentUser.id);
  const notifications = state.notifications.filter((item) => item.userId === currentUser.id).slice(0, 6);
  const recommendations = state.records
    .filter((item) => item.faculty === currentUser.faculty && item.status === "published")
    .slice(0, 8);
  const aiRecommendations = useMemo(
    () => (currentUser.role === "student" ? buildStudentRecommendations(state, currentUser) : []),
    [currentUser, state]
  );
  const learningInsights = currentUser.role === "student" ? buildStudentInsights(state, currentUser) : null;
  const readingPlans = state.readingPlans.filter((item) => item.userId === currentUser.id);
  const quizzes = state.quizzes.filter((item) => item.userId === currentUser.id);
  const flashcards = state.flashcards.filter((item) => item.userId === currentUser.id);
  const bibliographyItems = state.bibliographyItems.filter((item) => item.userId === currentUser.id);
  const biometricProfile = state.biometricProfiles.find((item) => item.userId === currentUser.id) ?? null;
  const biometricConsent = state.biometricConsents.find((item) => item.userId === currentUser.id) ?? null;
  const passkeys = state.passkeyCredentials.filter((item) => item.userId === currentUser.id && item.status === "active");
  const biometricAuditHistory = state.biometricAuditLogs.filter((item) => item.userId === currentUser.id).slice(0, 8);
  const dueSoonLoans = loans.filter((loan) => {
    const diff = new Date(loan.dueAt).getTime() - Date.now();
    return diff > 0 && diff <= 3 * 24 * 60 * 60 * 1000;
  });
  const unpaidFineTotal = fines
    .filter((item) => item.status !== "paid" && item.status !== "waived")
    .reduce((acc, item) => acc + item.amount, 0);
  const weeklyActivityDays = new Set(
    state.auditLogs
      .filter((item) => item.userId === currentUser.id)
      .filter((item) => new Date(item.createdAt).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000)
      .map((item) => item.createdAt.slice(0, 10))
  ).size;
  const activityPoints =
    loans.length * 5 +
    reservations.length * 3 +
    readingPlans.filter((plan) => plan.status === "completed").length * 12 +
    quizzes.filter((quiz) => typeof quiz.score === "number").reduce((sum, quiz) => sum + (quiz.score ?? 0), 0) +
    flashcards.filter((card) => card.status === "learned").length * 2;
  const badges = [
    activityPoints > 40 ? "Faol kitobxon" : null,
    readingPlans.length > 0 ? "Imtihon tayyorgarligi" : null,
    state.digitalResources.some((resource) => resource.uploadedBy === currentUser.id) ? "Elektron resurs foydalanuvchisi" : null,
    quizzes.some((quiz) => (quiz.score ?? 0) >= Math.max(1, quiz.totalQuestions - 1)) ? "Ilmiy izlanuvchi" : null,
    state.aiUsageLogs.filter((item) => item.userId === currentUser.id).length > 2 ? "Repository Explorer" : null
  ].filter(Boolean) as string[];
  const quizProgress = quizzes.map((quiz) => ({
    name: quiz.topic.split(" ")[0],
    score: quiz.score ?? 0,
    total: quiz.totalQuestions
  }));
  const nextRecommendedResource = aiRecommendations[0] ?? null;
  const activityTimeline = state.auditLogs.filter((item) => item.userId === currentUser.id).slice(0, 8);
  const subjectDistribution = Array.from(
    new Set(
      loans
        .map((loan) => state.copies.find((copy) => copy.id === loan.copyId))
        .map((copy) => state.records.find((record) => record.id === copy?.recordId)?.faculty)
        .filter(Boolean) as string[]
    )
  ).map((facultyName) => ({
    faculty: facultyName.split(" ")[0],
    value: loans.filter((loan) => {
      const copy = state.copies.find((item) => item.id === loan.copyId);
      return state.records.find((record) => record.id === copy?.recordId)?.faculty === facultyName;
    }).length
  }));

  useEffect(() => {
    if (currentUser.role !== "student") {
      return;
    }
    const aiPages = ["recommendations", "ai-assistant", "ai-quiz", "flashcards", "bibliography", "research-explorer"];
    if (!aiPages.includes(path[1] ?? "") || lastAiPageLog === path[1]) {
      return;
    }
    logAIUsage({
      userId: currentUser.id,
      feature: path[1] === "recommendations" ? "recommendation_page" : path[1] ?? "student_ai",
      input: currentUser.faculty,
      outputSummary: `Opened ${path[1]}`,
      sourceIds: aiRecommendations.slice(0, 5).map((item) => item.recordId).filter(Boolean) as string[]
    });
    setLastAiPageLog(path[1] ?? "");
  }, [aiRecommendations, currentUser, lastAiPageLog, logAIUsage, path]);

  if (currentUser.role === "teacher") {
    if (path[1] === "reading-lists") {
      const selected = state.records.filter((record) => readingList.items.includes(record.id));
      return (
        <div className="space-y-6">
          <SectionTitle title="Course reading lists" description="Fan ro‘yxati uchun bibliografik yozuvlarni tanlang va kabinetda saqlang." />
          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <div className="grid gap-4 md:grid-cols-2">
              {recommendations.map((record) => (
                <Card key={record.id}>
                  <div className="flex gap-4">
                    <BookCover record={record} />
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-ink">{record.title}</p>
                        <p className="text-sm text-slate-500">{record.authors.join(", ")}</p>
                      </div>
                      <Button
                        variant={readingList.items.includes(record.id) ? "accent" : "secondary"}
                        onClick={() => readingList.toggle(record.id)}
                      >
                        {readingList.items.includes(record.id) ? "Remove from reading list" : "Add to reading list"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Card>
              <p className="text-lg font-semibold text-ink">Selected list</p>
              <div className="mt-4 space-y-3">
                {selected.length === 0 ? (
                  <p className="text-sm text-slate-500">Reading list hali shakllantirilmagan.</p>
                ) : (
                  selected.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 p-3">
                      <p className="font-semibold text-ink">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.authors.join(", ")}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      );
    }

    if (path[1] === "resources" || path[1] === "submissions") {
      return <RepositoryUploadArea currentUser={currentUser} state={state} actorRoute={path[1]} />;
    }
  }

  if (path[1] === "borrowed") {
    return (
      <div className="space-y-6">
        <SectionTitle title="Borrowed books" description="Faol circulation va due date holati." />
        <div className="grid gap-4">
          {loans.map((loan) => {
            const copy = state.copies.find((item) => item.id === loan.copyId);
            const record = state.records.find((item) => item.id === copy?.recordId);
            return (
              <Card key={loan.id}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-ink">{record?.title}</p>
                    <p className="mt-1 text-sm text-slate-500">Inventory {copy?.inventoryNumber} · Due {formatDate(loan.dueAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge tone={statusTone(loan.status)}>{loan.status}</Badge>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const result = state.renewLoan({ loanId: loan.id, actorId: currentUser.id });
                        push({ tone: result.success ? "success" : "error", title: result.message });
                      }}
                    >
                      Renew
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  if (path[1] === "reservations") {
    return (
      <div className="space-y-6">
        <SectionTitle title="Reservations" description="Bibliografik yozuv bo‘yicha pending va approved holatlar." />
        <div className="grid gap-4">
          {reservations.map((reservation) => {
            const record = state.records.find((item) => item.id === reservation.recordId);
            return (
              <Card key={reservation.id}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-ink">{record?.title}</p>
                    <p className="text-sm text-slate-500">Reserved at {formatDate(reservation.reservedAt)} · Expires {formatDate(reservation.expiresAt)}</p>
                  </div>
                  <Badge tone={statusTone(reservation.status)}>{reservation.status}</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  if (path[1] === "fines") {
    return (
      <div className="space-y-6">
        <SectionTitle title="Fines and payment" description="Overdue fine, lost/damaged fee va receipt submission mock." />
        <div className="grid gap-4">
          {fines.map((fine) => (
            <Card key={fine.id}>
              <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
                <div>
                  <p className="text-lg font-semibold text-ink">{fine.reason}</p>
                  <p className="text-sm text-slate-500">Created {formatDate(fine.createdAt)} · Status {fine.status}</p>
                </div>
                <div className="text-lg font-semibold text-ink">{formatCurrency(fine.amount)}</div>
                <div className="flex flex-wrap gap-2">
                  <Select
                    className="min-w-[180px]"
                    value={methodByFine[fine.id] ?? "Click"}
                    onChange={(event) => setMethodByFine((current) => ({ ...current, [fine.id]: event.target.value }))}
                  >
                    {paymentMethods.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </Select>
                  <Button
                    onClick={() => {
                      const result = state.payFine({
                        fineId: fine.id,
                        method: (methodByFine[fine.id] as typeof paymentMethods[number]) ?? "Click",
                        receiptUrl: `/receipts/${fine.id}.png`
                      });
                      push({ tone: result.success ? "success" : "error", title: result.message });
                    }}
                    disabled={fine.status === "paid" || fine.status === "waived"}
                  >
                    Pay
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (path[1] === "reading-room") {
    return <ReadingRoomArea currentUser={currentUser} state={state} />;
  }

  if (path[1] === "recommendations") {
    return (
      <div className="space-y-6">
        <SectionTitle title="Shaxsiy tavsiyalar" description="Faculty, reservations, viewed resources va popularity signallari asosidagi tavsiyalar." />
        <AIAssistantPanel promptSeed={`${currentUser.faculty} uchun tavsiyalar`} title="Tavsiyalar bo'yicha AI yordam" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {aiRecommendations.map((item) => (
            <AIRecommendationCard
              key={`${item.category}-${item.recordId}`}
              title={item.title}
              reason={item.reason}
              category={item.category}
              difficulty={item.difficulty}
              estimatedReadingTime={item.estimatedReadingTime}
              availability={item.availability}
              href={`/catalog/${item.recordId}`}
              actionLabel="Manbani ochish"
              secondaryActionLabel="Reserve"
              onSecondaryAction={() => {
                if (!item.recordId) return;
                const result = state.reserveBook(item.recordId);
                push({ tone: result.success ? "success" : "error", title: result.message });
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (path[1] === "reading-plans") {
    return (
      <div className="space-y-6">
        <SectionTitle title="AI reading plans" description="Kunma-kun o'qish rejasi, self-check savollar va bajarilish jarayoni." />
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <ReadingPlanGenerator />
          <Card>
            <p className="text-lg font-semibold text-ink">Saved plans</p>
            <div className="mt-4 space-y-4">
              {readingPlans.length === 0 ? (
                <EmptyState title="Reja hali yaratilmagan" description="Mavzu, daraja va davomiylik asosida birinchi AI reading plan yarating." />
              ) : (
                readingPlans.map((plan) => (
                  <div key={plan.id} className="rounded-3xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink">{plan.topic}</p>
                        <p className="mt-1 text-sm text-slate-500">{plan.durationDays} kun · {plan.goal}</p>
                      </div>
                      <Badge tone={plan.status === "completed" ? "emerald" : "cyan"}>{plan.status}</Badge>
                    </div>
                    <div className="mt-4 space-y-2">
                      {plan.items.slice(0, 4).map((item) => (
                        <button
                          key={`${plan.id}-${item.day}`}
                          onClick={() => state.toggleReadingPlanItem({ planId: plan.id, day: item.day, actorId: currentUser.id })}
                          className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:bg-slate-50"
                        >
                          <div>
                            <p className="font-semibold text-ink">Day {item.day}: {item.title}</p>
                            <p className="mt-1 text-sm text-slate-500">{item.task}</p>
                          </div>
                          <Badge tone={item.completed ? "emerald" : "gold"}>{item.completed ? "done" : "active"}</Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (path[1] === "ai-assistant") {
    return <AIAssistantPanel title="AI Kutubxona Yordamchisi" promptSeed={currentUser.faculty} />;
  }

  if (path[1] === "ai-quiz") {
    return <QuizGenerator />;
  }

  if (path[1] === "flashcards") {
    return <FlashcardDeck />;
  }

  if (path[1] === "bibliography") {
    return <CitationAssistant />;
  }

  if (path[1] === "research-explorer") {
    return <ResearchExplorer />;
  }

  if (currentUser.role === "student" && path[1] === "identity") {
    const activeLoansCount = state.loans.filter((item) => item.userId === currentUser.id && item.status !== "returned").length;
    const unpaidFinesCount = state.fines.filter((item) => item.userId === currentUser.id && item.status !== "paid" && item.status !== "waived").length;
    return (
      <div className="space-y-6">
        <SectionTitle
          title="Smart student identity"
          description="Digital student card, Face ID consent, QR/barcode identifikatsiyasi va passkey boshqaruvi."
          actions={
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => router.push("/student/face-enrollment")}>
                <Fingerprint className="h-4 w-4" />
                Enable Face ID
              </Button>
              <Button variant="secondary" onClick={() => router.push("/student/privacy-center")}>
                <ShieldCheck className="h-4 w-4" />
                Privacy center
              </Button>
            </div>
          }
        />
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="grid h-24 w-24 place-items-center rounded-[28px] bg-gradient-to-br from-slate-900 to-cyan-700 text-2xl font-semibold text-white">
                  {currentUser.fullName.split(" ").map((item) => item[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-2xl font-semibold text-ink">{currentUser.fullName}</p>
                  <p className="mt-1 text-sm text-slate-500">{currentUser.studentId ?? currentUser.employeeId}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone={currentUser.cardStatus === "active" ? "emerald" : "rose"}>{currentUser.cardStatus}</Badge>
                    <Badge tone={biometricProfile?.enabled ? "cyan" : "gold"}>{biometricProfile?.enabled ? "face_id_enabled" : "face_id_optional"}</Badge>
                    <Badge tone={passkeys.length > 0 ? "emerald" : "slate"}>{passkeys.length > 0 ? "passkey_ready" : "no_passkey"}</Badge>
                  </div>
                </div>
              </div>
              <div className="grid gap-2 text-sm text-slate-600">
                <p><span className="font-semibold">Membership:</span> {currentUser.membershipNumber}</p>
                <p><span className="font-semibold">Faculty:</span> {currentUser.faculty}</p>
                <p><span className="font-semibold">Department:</span> {currentUser.department}</p>
                <p><span className="font-semibold">Group:</span> {currentUser.group ?? "—"}</p>
                <p><span className="font-semibold">Expiry:</span> {currentUser.cardExpiryDate}</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <ScannerMock title="Student card QR" code={currentUser.cardQrCode} mode="QR" />
              <ScannerMock title="Student card barcode" code={currentUser.cardBarcode} mode="Barcode" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <KpiCard label="Active loans" value={String(activeLoansCount)} hint="Circulation limit monitoring" accent="cyan" />
              <KpiCard label="Unpaid fines" value={String(unpaidFinesCount)} hint="Identity risk signal" accent="rose" />
              <KpiCard label="Passkeys" value={String(passkeys.length)} hint="Device-bound credentials" accent="emerald" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  const content = `${currentUser.fullName}\n${currentUser.studentId}\n${currentUser.faculty}\n${currentUser.membershipNumber}\nQR:${currentUser.cardQrCode}`;
                  downloadTextFile("student-card.txt", content);
                  push({ tone: "success", title: "Digital student card downloaded." });
                }}
              >
                Download card mock
              </Button>
              <Button variant="secondary" onClick={() => setCardPreview(`Student card print preview\n${currentUser.fullName}\n${currentUser.studentId ?? currentUser.employeeId}\n${currentUser.faculty}`)}>
                Print card mock
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const result = state.regenerateStudentCard(currentUser.id, currentUser.id);
                  push({ tone: result.success ? "success" : "error", title: result.message });
                }}
              >
                Regenerate QR mock
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  const result = state.reportLostCard(currentUser.id, currentUser.id);
                  push({ tone: result.success ? "success" : "error", title: result.message });
                }}
              >
                Report lost card
              </Button>
            </div>
          </Card>
          <div className="space-y-6">
            <Card>
              <p className="text-lg font-semibold text-ink">Identity methods</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>Face ID: {biometricProfile?.enabled ? "enabled" : "not enabled"}</p>
                <p>Biometric consent: {biometricConsent?.status ?? "not granted"}</p>
                <p>QR student card login: {state.identitySettings.qrCardLoginEnabled ? "enabled" : "disabled"}</p>
              </div>
              <div className="mt-4 space-y-3">
                <Input value={passkeyDeviceName} onChange={(event) => setPasskeyDeviceName(event.target.value)} placeholder="Passkey device name" />
                <PasskeyButton
                  label="Passkey yaratish"
                  onClick={() => {
                    const result = state.createPasskey({ userId: currentUser.id, deviceName: passkeyDeviceName });
                    push({ tone: result.success ? "success" : "error", title: result.message });
                  }}
                />
              </div>
            </Card>
            <Card>
              <p className="text-lg font-semibold text-ink">Privacy notice</p>
              <p className="mt-3 text-sm text-slate-600">{biometricConsentText}</p>
            </Card>
          </div>
        </div>
        <Modal
          open={Boolean(cardPreview)}
          title="Student card preview"
          onClose={() => setCardPreview(null)}
          footer={
            <Button
              onClick={() => {
                if (cardPreview) {
                  downloadTextFile("student-card-print.txt", cardPreview);
                  push({ tone: "success", title: "Print preview exported." });
                }
              }}
            >
              Download preview
            </Button>
          }
        >
          <pre className="whitespace-pre-wrap text-sm text-slate-700">{cardPreview}</pre>
        </Modal>
      </div>
    );
  }

  if (currentUser.role === "student" && path[1] === "face-enrollment") {
    const allStepsDone = enrollmentStepsDone >= livenessSteps.length;
    return (
      <div className="space-y-6">
        <SectionTitle title="Face ID enrollment" description="Consent-based biometric enrollment, liveness mock va privacy-aware template saqlash." />
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Consent required</p>
              <p className="mt-3 text-sm text-slate-600">{biometricConsentText}</p>
              <button
                onClick={() => setEnrollmentConsent((current) => !current)}
                className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:bg-white"
              >
                <Badge tone={enrollmentConsent ? "emerald" : "gold"}>{enrollmentConsent ? "consent_granted" : "consent_required"}</Badge>
                <span className="text-sm text-ink">I explicitly consent to optional Face ID enrollment.</span>
              </button>
            </div>
            <div className="rounded-3xl border border-slate-200 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">Camera permission</p>
                  <p className="mt-1 text-sm text-slate-500">Raw face photo saqlanmaydi. Faqat mock encrypted face template yaratiladi.</p>
                </div>
                <Button variant="secondary" onClick={() => setEnrollmentCameraReady(true)}>
                  Camera permission request
                </Button>
              </div>
              <div className="mt-4 rounded-[28px] border border-dashed border-cyan-300/40 bg-slate-950 p-6 text-white">
                <p className="text-sm text-cyan-200">Biometric scan frame</p>
                <p className="mt-2 text-sm text-slate-300">{enrollmentCameraReady ? "Camera ready" : "Permission required"}</p>
              </div>
            </div>
            <Card muted>
              <p className="text-lg font-semibold text-ink">Liveness check mock</p>
              <div className="mt-4 space-y-3">
                {livenessSteps.map((step, index) => (
                  <button
                    key={step}
                    onClick={() => setEnrollmentStepsDone((current) => Math.max(current, index + 1))}
                    disabled={!enrollmentCameraReady}
                    className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="text-sm text-ink">{step}</span>
                    <Badge tone={enrollmentStepsDone > index ? "emerald" : "slate"}>{enrollmentStepsDone > index ? "done" : "pending"}</Badge>
                  </button>
                ))}
              </div>
            </Card>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  if (!enrollmentConsent) {
                    push({ tone: "error", title: "Avval explicit consent bering." });
                    return;
                  }
                  const result = state.enrollFaceId({
                    userId: currentUser.id,
                    templateSeed: currentUser.studentId ?? currentUser.email,
                    completedSteps: enrollmentStepsDone,
                    consentVersion: "2026.05"
                  });
                  push({ tone: result.success ? "success" : "error", title: result.message });
                }}
                disabled={!enrollmentConsent || !enrollmentCameraReady || !allStepsDone}
              >
                Generate face template
              </Button>
              <Button variant="secondary" onClick={() => { setEnrollmentCameraReady(false); setEnrollmentStepsDone(0); }}>
                Retry
              </Button>
              <Button variant="ghost" onClick={() => router.push("/student/identity")}>
                Skip Face ID
              </Button>
              {biometricProfile ? (
                <Button
                  variant="danger"
                  onClick={() => {
                    const result = state.deleteFaceId(currentUser.id, currentUser.id);
                    push({ tone: result.success ? "success" : "error", title: result.message });
                  }}
                >
                  Delete enrollment
                </Button>
              ) : null}
            </div>
          </Card>
          <div className="space-y-6">
            <Card>
              <p className="text-lg font-semibold text-ink">Enrollment status</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>Face ID enabled: {biometricProfile?.enabled ? "yes" : "no"}</p>
                <p>Liveness score: {biometricProfile?.livenessScore ? biometricProfile.livenessScore.toFixed(2) : "not available"}</p>
                <p>Consent status: {biometricConsent?.status ?? "not granted"}</p>
              </div>
            </Card>
            <Card>
              <p className="text-lg font-semibold text-ink">Privacy safeguards</p>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>Raw face photo localStorage&apos;da saqlanmaydi.</p>
                <p>Faqat mock encrypted face template va audit logs saqlanadi.</p>
                <p>Delete my Face ID va Withdraw consent actions privacy center orqali mavjud.</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role === "student" && path[1] === "privacy-center") {
    const privacyReport = [
      `User: ${currentUser.fullName}`,
      `Face ID: ${biometricProfile?.enabled ? "enabled" : "disabled"}`,
      `Consent: ${biometricConsent?.status ?? "not granted"}`,
      `Passkeys: ${passkeys.length}`,
      `Card status: ${currentUser.cardStatus}`
    ].join("\n");
    return (
      <div className="space-y-6">
        <SectionTitle title="Privacy center" description="Biometric consent, identity methods, audit history va data control." />
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Card>
              <p className="text-lg font-semibold text-ink">Enabled identity methods</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-ink">Face ID</p>
                  <p className="mt-1 text-sm text-slate-500">{biometricProfile?.enabled ? "Enabled with consent" : "Optional and currently disabled"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-ink">Passkey</p>
                  <p className="mt-1 text-sm text-slate-500">{passkeys.length > 0 ? `${passkeys.length} device linked` : "No active passkey"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-ink">QR student card</p>
                  <p className="mt-1 text-sm text-slate-500">{currentUser.cardStatus === "active" ? "Active card for library access" : "Card reported lost"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-ink">Alternative login</p>
                  <p className="mt-1 text-sm text-slate-500">Email/password har doim fallback sifatida mavjud.</p>
                </div>
              </div>
            </Card>
            <Card>
              <p className="text-lg font-semibold text-ink">Privacy actions</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    const result = state.withdrawBiometricConsent(currentUser.id, currentUser.id);
                    push({ tone: result.success ? "success" : "error", title: result.message });
                  }}
                >
                  Withdraw consent
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    const result = state.deleteFaceId(currentUser.id, currentUser.id);
                    push({ tone: result.success ? "success" : "error", title: result.message });
                  }}
                >
                  Delete my Face ID
                </Button>
                {passkeys[0] ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const result = state.deactivatePasskey(passkeys[0]!.id, currentUser.id);
                      push({ tone: result.success ? "success" : "error", title: result.message });
                    }}
                  >
                    Deactivate passkey
                  </Button>
                ) : null}
                <Button
                  variant="secondary"
                  onClick={() => {
                    downloadTextFile("privacy-report.txt", privacyReport);
                    push({ tone: "success", title: "Mock privacy report downloaded." });
                  }}
                >
                  Download privacy report
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    state.logIdentityVerification({
                      actorId: currentUser.id,
                      userId: currentUser.id,
                      method: "manual",
                      result: "pending",
                      confidence: "medium",
                      purpose: "Privacy data correction request",
                      details: "Student requested data correction review"
                    });
                    push({ tone: "success", title: "Data correction request mock created." });
                  }}
                >
                  Request data correction
                </Button>
              </div>
            </Card>
            <Card>
              <p className="text-lg font-semibold text-ink">Privacy notice</p>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>Purpose: Face ID kutubxona kabineti va verification jarayonini soddalashtiradi.</p>
                <p>Stored: raw photo emas, faqat mock encrypted face template, consent record va audit log.</p>
                <p>Not stored: emotion analysis, hidden surveillance yoki behavior scoring ma&apos;lumotlari.</p>
                <p>Alternatives: email/password, QR student card va passkey mock.</p>
                <p>Contact point: dpo@unilibrary.uz.</p>
              </div>
            </Card>
          </div>
          <Card>
            <p className="text-lg font-semibold text-ink">Identity audit history</p>
            <div className="mt-4 space-y-3">
              {biometricAuditHistory.length === 0 ? (
                <EmptyState title="Audit qaydlari yo'q" description="Enrollment, login va deletion harakatlari bu yerda ko'rsatiladi." />
              ) : (
                biometricAuditHistory.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 p-3">
                    <p className="font-semibold text-ink">{item.action}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.result} • {item.deviceInfo}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatDate(item.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (path[1] === "profile") {
    return <UserSummaryCard currentUser={currentUser} state={state} />;
  }

  return (
    <div className="space-y-6">
      <SectionTitle title={currentUser.role === "teacher" ? "Teacher dashboard" : "Student dashboard"} description="Circulation, AI reading plans, quiz progress, fines va notifications bo'yicha tezkor ko'rsatkichlar." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <KpiCard label="Borrowed books" value={String(loans.length)} hint="Faol loan yozuvlari" accent="cyan" />
        <KpiCard label="Reservations" value={String(reservations.length)} hint="Pending + approved reservations" accent="gold" />
        <KpiCard label="Outstanding fines" value={formatCurrency(unpaidFineTotal)} hint="To'lov kutayotgan majburiyatlar" accent="rose" />
        <KpiCard label="Reading room bookings" value={String(bookings.length)} hint="Faol QR bookinglar" accent="emerald" />
        <KpiCard label="Reading plans" value={String(readingPlans.length)} hint="Saqlangan AI o'qish rejalar" accent="cyan" />
        <KpiCard label="Activity points" value={String(activityPoints)} hint={`${weeklyActivityDays} kunlik faol reading streak`} accent="gold" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <p className="text-lg font-semibold text-ink">Due soon and active loans</p>
            <div className="mt-4 space-y-3">
              {loans.slice(0, 5).map((loan) => {
                const copy = state.copies.find((item) => item.id === loan.copyId);
                const record = state.records.find((item) => item.id === copy?.recordId);
                return (
                  <div key={loan.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-3">
                    <div>
                      <p className="font-semibold text-ink">{record?.title}</p>
                      <p className="text-sm text-slate-500">Due {formatDate(loan.dueAt)} • {copy?.inventoryNumber}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {dueSoonLoans.some((item) => item.id === loan.id) ? <Badge tone="gold">due soon</Badge> : null}
                      <Badge tone={statusTone(loan.status)}>{loan.status}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          {currentUser.role === "student" ? (
            <div className="grid gap-6 xl:grid-cols-2">
              <Card>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-ink">Continue learning</p>
                    <p className="mt-1 text-sm text-slate-500">Faol planlar, quiz va reading tasklar bo&apos;yicha keyingi qadamlar.</p>
                  </div>
                  <Button variant="secondary" onClick={() => router.push("/student/reading-plans")}>
                    Open plans
                  </Button>
                </div>
                <div className="mt-4 space-y-3">
                  {readingPlans.length === 0 ? (
                    <EmptyState
                      title="Faol o'qish reja topilmadi"
                      description="AI yordamida 7, 14 yoki 30 kunlik reja yarating va kabinetdagi progressni kuzating."
                    />
                  ) : (
                    readingPlans.slice(0, 2).map((plan) => {
                      const completed = plan.items.filter((item) => item.completed).length;
                      return (
                        <div key={plan.id} className="rounded-2xl border border-slate-200 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold text-ink">{plan.topic}</p>
                            <Badge tone={plan.status === "completed" ? "emerald" : "cyan"}>{plan.status}</Badge>
                          </div>
                          <p className="mt-2 text-sm text-slate-500">
                            {completed}/{plan.items.length} task bajarilgan • {plan.durationDays} kunlik reja
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
              <Card>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-ink">Recommended next resource</p>
                    <p className="mt-1 text-sm text-slate-500">Faculty va AI usage signallari asosida navbatdagi tavsiya.</p>
                  </div>
                  <Button variant="secondary" onClick={() => router.push("/student/recommendations")}>
                    All recommendations
                  </Button>
                </div>
                <div className="mt-4">
                  {nextRecommendedResource ? (
                    <AIRecommendationCard
                      title={nextRecommendedResource.title}
                      reason={nextRecommendedResource.reason}
                      category={nextRecommendedResource.category}
                      difficulty={nextRecommendedResource.difficulty}
                      estimatedReadingTime={nextRecommendedResource.estimatedReadingTime}
                      availability={nextRecommendedResource.availability}
                      href={`/catalog/${nextRecommendedResource.recordId}`}
                      actionLabel="Open resource"
                      secondaryActionLabel="Bibliografiyaga qo'shish"
                      onSecondaryAction={() => {
                        if (!nextRecommendedResource.recordId) return;
                        const record = state.records.find((item) => item.id === nextRecommendedResource.recordId);
                        if (!record) return;
                        const result = state.addBibliographyItem({
                          recordId: nextRecommendedResource.recordId,
                          style: "APA 7",
                          citationText: buildStyledCitation(record, "APA 7")
                        });
                        push({ tone: result.success ? "success" : "error", title: result.message });
                      }}
                    />
                  ) : (
                    <EmptyState
                      title="Tavsiya tayyor emas"
                      description="Katalog bilan ishlash yoki AI sahifalarini ochish orqali tavsiya signallari shakllanadi."
                    />
                  )}
                </div>
              </Card>
            </div>
          ) : null}
          {currentUser.role === "student" ? (
            <Card className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-lg font-semibold text-ink">AI learning analytics</p>
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge) => (
                    <Badge key={badge} tone="cyan">{badge}</Badge>
                  ))}
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <Card muted className="h-[260px]">
                  <p className="mb-3 text-sm font-semibold text-ink">Quiz progress</p>
                  <p className="sr-only">Quiz progress chart for the current student.</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={quizProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="score" fill="#0f9f6e" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="total" fill="#15b7d6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
                <Card muted className="h-[260px]">
                  <p className="mb-3 text-sm font-semibold text-ink">Borrowed subject distribution</p>
                  <p className="sr-only">Borrowed subject distribution chart grouped by faculty.</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={subjectDistribution} dataKey="value" nameKey="faculty" outerRadius={90}>
                        {subjectDistribution.map((entry, index) => (
                          <Cell key={entry.faculty} fill={["#0f9f6e", "#15b7d6", "#c79b2d", "#fb7185", "#2563eb"][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </div>
              {learningInsights ? (
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-ink">Research interest profile</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {learningInsights.researchProfile.map((item) => (
                      <Badge key={item} tone="gold">{item}</Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </Card>
          ) : null}
          <Card>
            <p className="text-lg font-semibold text-ink">Recommended collection</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {recommendations.slice(0, 4).map((record) => (
                <button key={record.id} onClick={() => router.push(`/catalog/${record.id}`)} className="rounded-[24px] border border-slate-200 p-4 text-left transition hover:bg-slate-50">
                  <p className="font-semibold text-ink">{record.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{record.faculty}</p>
                </button>
              ))}
            </div>
          </Card>
          {currentUser.role === "student" ? (
            <Card>
              <p className="text-lg font-semibold text-ink">Saved reading plans</p>
              <div className="mt-4 space-y-3">
                {readingPlans.length === 0 ? (
                  <EmptyState title="Reading plan topilmadi" description="AI reja yaratilib, bu yerda progress ko'rsatiladi." />
                ) : (
                  readingPlans.slice(0, 3).map((plan) => (
                    <div key={plan.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-ink">{plan.topic}</p>
                        <Badge tone={plan.status === "completed" ? "emerald" : "cyan"}>{plan.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{plan.durationDays} kun • {plan.goal}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          ) : null}
        </div>
        <div className="space-y-6">
          <UserSummaryCard currentUser={currentUser} state={state} />
          {currentUser.role === "student" ? (
            <Card>
              <p className="text-lg font-semibold text-ink">Academic badges</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {badges.length === 0 ? (
                  <p className="text-sm text-slate-500">Badge olish uchun AI reja, quiz va repository ishlatish faolligi oshiriladi.</p>
                ) : (
                  badges.map((badge) => (
                    <Badge key={badge} tone="gold">{badge}</Badge>
                  ))
                )}
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-600">
                <p>Bibliography items: {bibliographyItems.length}</p>
                <p>Due soon loans: {dueSoonLoans.length}</p>
                <p>Quiz attempts: {quizzes.length}</p>
              </div>
            </Card>
          ) : null}
          {currentUser.role === "student" ? <AIAssistantPanel promptSeed={currentUser.faculty} title="Kabinet AI yordamchisi" /> : null}
          <Card>
            <p className="text-lg font-semibold text-ink">Notifications</p>
            <div className="mt-4 space-y-3">
              {notifications.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 p-3">
                  <p className="font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.message}</p>
                </div>
              ))}
            </div>
          </Card>
          {currentUser.role === "student" ? (
            <Card>
              <p className="text-lg font-semibold text-ink">Activity timeline</p>
              <div className="mt-4 space-y-3">
                {activityTimeline.length === 0 ? (
                  <EmptyState title="Faoliyat qaydlari yo'q" description="Circulation, AI va repository harakatlari audit timeline sifatida shu yerda ko'rsatiladi." />
                ) : (
                  activityTimeline.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 p-3">
                      <p className="font-semibold text-ink">{item.action}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.details}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatDate(item.createdAt)}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          ) : null}
        </div>
      </div>
      {currentUser.role === "student" ? <ReadingPlanGenerator /> : null}
    </div>
  );
}

function ReadingRoomArea({ currentUser, state }: { currentUser: User; state: AppStore }) {
  const { push } = useToast();
  const [roomId, setRoomId] = useState(state.rooms[0]?.id ?? "");
  const [selectedSeatId, setSelectedSeatId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");

  const seats = state.seats.filter((item) => item.roomId === roomId);
  const bookings = state.bookings.filter((item) => item.userId === currentUser.id);

  return (
    <div className="space-y-6">
      <SectionTitle title="Reading room booking" description="Seat map, time slot va QR booking generatsiyasi." />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Room</Label>
              <Select value={roomId} onChange={(event) => setRoomId(event.target.value)}>
                {state.rooms.map((room) => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
            <div>
              <Label>Start time</Label>
              <Input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
            </div>
            <div>
              <Label>End time</Label>
              <Input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
            </div>
          </Card>
          <SeatMap seats={seats} selectedSeatId={selectedSeatId} onSelect={setSelectedSeatId} />
          <Button
            onClick={() => {
              const result = state.bookSeat({ roomId, seatId: selectedSeatId, date, startTime, endTime });
              push({ tone: result.success ? "success" : "error", title: result.message });
            }}
            disabled={!selectedSeatId}
          >
            Book seat with QR
          </Button>
        </div>
        <div className="space-y-4">
          <Card>
            <p className="text-lg font-semibold text-ink">Active bookings</p>
            <div className="mt-4 space-y-3">
              {bookings.map((booking) => (
                <div key={booking.id} className="rounded-2xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-ink">{roomById(state, booking.roomId)?.name}</p>
                    <Badge tone={statusTone(booking.status)}>{booking.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{booking.date} · {booking.startTime} - {booking.endTime}</p>
                  <p className="mt-2 text-xs text-slate-500">{booking.qrCode}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function RepositoryUploadArea({
  currentUser,
  state,
  actorRoute
}: {
  currentUser: User;
  state: AppStore;
  actorRoute: string;
}) {
  const { push } = useToast();
  const form = useForm<z.infer<typeof resourceSchema>>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      recordId: "",
      title: "",
      type: "E-book",
      faculty: currentUser.faculty,
      department: currentUser.department,
      year: new Date().getFullYear(),
      language: "O‘zbek",
      abstract: "",
      keywords: "",
      doi: "",
      accessLevel: currentUser.role === "teacher" ? "university only" : "public",
      fileUrl: "/mock/upload.pdf",
      fileName: "resource.pdf",
      fileSize: 3200000,
      license: "CC BY-NC 4.0",
      embargoDate: "",
      version: "v1.0"
    }
  });

  const resources = state.digitalResources.filter((item) =>
    actorRoute === "submissions" ? item.uploadedBy === currentUser.id : true
  );

  return (
    <div className="space-y-6">
      <SectionTitle
        title={actorRoute === "submissions" ? "Repository submissions" : "Digital resources"}
        description="Metadata, access level va file preview mock bilan resurs joylash."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={form.handleSubmit((values) => {
              const result = state.uploadResource(
                {
                  recordId: values.recordId || undefined,
                  title: values.title,
                  type: values.type as ResourceType,
                  faculty: values.faculty,
                  department: values.department,
                  year: values.year,
                  language: values.language,
                  abstract: values.abstract,
                  keywords: values.keywords.split(",").map((item) => item.trim()),
                  doi: values.doi || undefined,
                  accessLevel: values.accessLevel,
                  fileUrl: values.fileUrl,
                  fileName: values.fileName,
                  fileSize: values.fileSize,
                  license: values.license,
                  embargoDate: values.embargoDate || undefined,
                  version: values.version
                },
                currentUser.id
              );
              push({ tone: result.success ? "success" : "error", title: result.message });
              if (result.success) {
                form.reset({ ...form.getValues(), title: "", abstract: "", keywords: "", doi: "" });
              }
            })}
          >
            <div className="md:col-span-2">
              <Label>Title</Label>
              <Input {...form.register("title")} />
            </div>
            <div>
              <Label>Type</Label>
              <Select {...form.register("type")}>
                <option>E-book</option>
                <option>Article</option>
                <option>Thesis</option>
                <option>Methodical guide</option>
                <option>Lecture notes</option>
                <option>Video lecture</option>
              </Select>
            </div>
            <div>
              <Label>Year</Label>
              <Input type="number" {...form.register("year")} />
            </div>
            <div>
              <Label>Faculty</Label>
              <Input {...form.register("faculty")} />
            </div>
            <div>
              <Label>Department</Label>
              <Input {...form.register("department")} />
            </div>
            <div className="md:col-span-2">
              <Label>Abstract</Label>
              <Textarea {...form.register("abstract")} />
            </div>
            <div className="md:col-span-2">
              <Label>Keywords</Label>
              <Input {...form.register("keywords")} placeholder="keyword1, keyword2" />
            </div>
            <div>
              <Label>Access level</Label>
              <Select {...form.register("accessLevel")}>
                <option value="public">public</option>
                <option value="university only">university only</option>
                <option value="faculty only">faculty only</option>
                <option value="staff only">staff only</option>
                <option value="restricted">restricted</option>
              </Select>
            </div>
            <div>
              <Label>License</Label>
              <Input {...form.register("license")} />
            </div>
            <div>
              <Label>File name</Label>
              <Input {...form.register("fileName")} />
            </div>
            <div>
              <Label>File size (bytes)</Label>
              <Input type="number" {...form.register("fileSize")} />
            </div>
            <div>
              <Label>Embargo date</Label>
              <Input type="date" {...form.register("embargoDate")} />
            </div>
            <div>
              <Label>Version</Label>
              <Input {...form.register("version")} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="w-full">Upload resource</Button>
            </div>
          </form>
        </Card>
        <div className="space-y-4">
          {resources.slice(0, 8).map((resource) => (
            <Card key={resource.id}>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-ink">{resource.title}</p>
                <Badge tone={statusTone(resource.accessLevel)}>{resource.accessLevel}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-500">{resource.faculty} · {resource.type}</p>
              <p className="mt-3 text-sm text-slate-600">{resource.abstract.slice(0, 120)}...</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function LibrarianArea({
  currentUser,
  state,
  path
}: {
  currentUser: User;
  state: AppStore;
  path: string[];
}) {
  const { push } = useToast();
  const [studentSearch, setStudentSearch] = useState("ST-2024001");
  const [bookSearch, setBookSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedCopyId, setSelectedCopyId] = useState<string | null>(null);
  const [verifiedStudentId, setVerifiedStudentId] = useState<string | null>(null);
  const [receiptModal, setReceiptModal] = useState<string | null>(null);

  const students = state.users.filter(
    (user) =>
      user.role === "student" &&
      (!studentSearch ||
        safeContains(`${user.fullName} ${user.studentId ?? ""} ${user.membershipNumber}`, studentSearch))
  );
  const copies = state.copies.filter((copy) => {
    const record = state.records.find((item) => item.id === copy.recordId);
    return bookSearch
      ? safeContains(
          `${copy.inventoryNumber} ${copy.barcode} ${copy.rfidTag} ${record?.title ?? ""} ${copy.qrCode}`,
          bookSearch
        )
      : true;
  });
  const selectedStudent = state.users.find((user) => user.id === selectedStudentId) ?? students[0] ?? null;
  const selectedCopy = state.copies.find((copy) => copy.id === selectedCopyId) ?? copies[0] ?? null;
  const activeLoans = selectedStudent
    ? state.loans.filter((loan) => loan.userId === selectedStudent.id && loan.status !== "returned")
    : [];
  const recentTransactions = state.auditLogs
    .filter((log) => ["ISSUE_LOAN", "RETURN_COPY", "RENEW_LOAN"].includes(log.action))
    .slice(0, 8);

  if (path[1] === "reservations") {
    const pending = state.reservations.filter((item) => item.status === "pending" || item.status === "approved");
    return (
      <div className="space-y-6">
        <SectionTitle title="Reservation approval desk" description="Pending reservationlar va pickup window nazorati." />
        <div className="grid gap-4">
          {pending.map((reservation) => {
            const record = state.records.find((item) => item.id === reservation.recordId);
            const user = state.users.find((item) => item.id === reservation.userId);
            return (
              <Card key={reservation.id}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-ink">{record?.title}</p>
                    <p className="text-sm text-slate-500">{user?.fullName} · expires {formatDate(reservation.expiresAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge tone={statusTone(reservation.status)}>{reservation.status}</Badge>
                    {reservation.status === "pending" ? (
                      <Button
                        onClick={() => {
                          const result = state.approveReservation(reservation.id, currentUser.id);
                          push({ tone: result.success ? "success" : "error", title: result.message });
                        }}
                      >
                        Approve
                      </Button>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  if (path[1] === "overdues") {
    const overdues = state.loans.filter((loan) => loan.status === "overdue");
    return (
      <div className="space-y-6">
        <SectionTitle title="Overdues" description="Muddati o‘tgan loan yozuvlari va kutilayotgan fine." />
        <div className="grid gap-4">
          {overdues.map((loan) => {
            const user = state.users.find((item) => item.id === loan.userId);
            const copy = state.copies.find((item) => item.id === loan.copyId);
            const record = state.records.find((item) => item.id === copy?.recordId);
            return (
              <Card key={loan.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-ink">{record?.title}</p>
                    <p className="text-sm text-slate-500">{user?.fullName} · due {formatDate(loan.dueAt)}</p>
                  </div>
                  <Badge tone="rose">overdue</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  if (path[1] === "identity-check") {
    return (
      <div className="space-y-6">
        <SectionTitle title="Identity check desk" description="QR student card, Face ID va manual fallback orqali talaba shaxsini tasdiqlash." />
        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <IdentityVerificationPanel
            state={state}
            actorId={currentUser.id}
            purpose="Librarian identity desk"
            onResolved={(user) => setSelectedStudentId(user?.id ?? null)}
          />
          <div className="space-y-6">
            {selectedStudent ? (
              <>
                <UserSummaryCard currentUser={selectedStudent} state={state} />
                <Card>
                  <p className="text-lg font-semibold text-ink">Verification readiness</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm text-slate-600">
                    <p>Borrowing limit: 5 items</p>
                    <p>Blocked status: {selectedStudent.status}</p>
                    <p>Unpaid fines: {formatCurrency(state.fines.filter((item) => item.userId === selectedStudent.id && item.status !== "paid" && item.status !== "waived").reduce((sum, item) => sum + item.amount, 0))}</p>
                    <p>Biometric enrolled: {state.biometricProfiles.some((item) => item.userId === selectedStudent.id && item.enabled) ? "yes" : "no"}</p>
                  </div>
                </Card>
              </>
            ) : (
              <EmptyState title="Talaba tanlanmagan" description="QR card yoki student ID orqali foydalanuvchini aniqlang." />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (path[1] === "reading-room") {
    const todaysBookings = state.bookings.filter((item) => item.date === new Date().toISOString().slice(0, 10));
    return (
      <div className="space-y-6">
        <SectionTitle title="Reading room occupancy" description="QR check-in, cancel booking va no-show nazorati." />
        <div className="grid gap-4 md:grid-cols-3">
          <KpiCard label="Active room usage" value={String(todaysBookings.length)} hint="Today bookings" accent="cyan" />
          <KpiCard label="Checked-in" value={String(todaysBookings.filter((item) => item.status === "checked_in").length)} hint="Occupied seats" accent="emerald" />
          <KpiCard label="No-show" value={String(todaysBookings.filter((item) => item.status === "no_show").length)} hint="Missed arrivals" accent="rose" />
        </div>
        <div className="grid gap-4">
          {todaysBookings.map((booking) => {
            const user = state.users.find((item) => item.id === booking.userId);
            const room = state.rooms.find((item) => item.id === booking.roomId);
            return (
              <Card key={booking.id}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-ink">{room?.name}</p>
                    <p className="text-sm text-slate-500">{user?.fullName} · {booking.startTime} - {booking.endTime}</p>
                    <p className="mt-1 text-xs text-slate-500">{booking.qrCode}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={statusTone(booking.status)}>{booking.status}</Badge>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const result = state.checkInBooking(booking.id, currentUser.id);
                        push({ tone: result.success ? "success" : "error", title: result.message });
                      }}
                    >
                      QR check-in
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const result = state.cancelBooking(booking.id, currentUser.id);
                        push({ tone: result.success ? "success" : "error", title: result.message });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        const result = state.markNoShow(booking.id, currentUser.id);
                        push({ tone: result.success ? "success" : "error", title: result.message });
                      }}
                    >
                      No-show
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  if (path[1] === "issue" || path[1] === "return") {
    return (
      <Card>
        <SectionTitle
          title={path[1] === "issue" ? "Focused issue station" : "Focused return station"}
          description="Asosiy circulation deskdagi tanlangan student va copy bilan ishlaydi."
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ScannerMock title="Student ID channel" code={selectedStudent?.studentId ?? selectedStudent?.membershipNumber} mode="QR" />
          <ScannerMock title="Copy channel" code={selectedCopy?.barcode ?? "Awaiting barcode"} mode="Barcode" />
        </div>
      </Card>
    );
  }

  const selectedRecord = selectedCopy ? state.records.find((item) => item.id === selectedCopy.recordId) : null;

  return (
    <div className="space-y-6">
      <SectionTitle title="Librarian circulation desk" description="Student identification, copy identification, circulation actions va audit trail." />
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Today issued" value={String(state.auditLogs.filter((item) => item.action === "ISSUE_LOAN").length)} hint="Audit log based" accent="emerald" />
        <KpiCard label="Today returned" value={String(state.auditLogs.filter((item) => item.action === "RETURN_COPY").length)} hint="Audit log based" accent="cyan" />
        <KpiCard label="Pending reservations" value={String(state.reservations.filter((item) => item.status === "pending").length)} hint="Approval queue" accent="gold" />
        <KpiCard label="Overdues" value={String(state.loans.filter((item) => item.status === "overdue").length)} hint="Immediate follow-up required" accent="rose" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[320px_320px_1fr]">
        <div className="space-y-4">
          <Card>
            <p className="text-sm font-semibold text-ink">Student identification</p>
            <div className="mt-4 space-y-3">
              <Input value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Student ID, full name, membership number" />
              <ScannerMock title="Student QR scan" code={selectedStudent?.cardQrCode} mode="QR" />
              <div className="space-y-2">
                {students.slice(0, 5).map((student) => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`w-full rounded-2xl border p-3 text-left transition ${selectedStudent?.id === student.id ? "border-cyan-400 bg-cyan-50" : "border-slate-200 hover:bg-slate-50"}`}
                  >
                    <p className="font-semibold text-ink">{student.fullName}</p>
                    <p className="text-xs text-slate-500">{student.studentId} · {student.membershipNumber}</p>
                  </button>
                ))}
              </div>
            </div>
          </Card>
          {selectedStudent ? <UserSummaryCard currentUser={selectedStudent} state={state} /> : null}
        </div>
        <div className="space-y-4">
          <Card>
            <p className="text-sm font-semibold text-ink">Book identification</p>
            <div className="mt-4 space-y-3">
              <Input value={bookSearch} onChange={(event) => setBookSearch(event.target.value)} placeholder="Barcode, RFID, inventory number, title" />
              <ScannerMock title="Copy barcode / RFID scan" code={selectedCopy?.barcode ?? selectedCopy?.rfidTag} mode={selectedCopy ? "Barcode" : "RFID"} />
              <div className="space-y-2">
                {copies.slice(0, 5).map((copy) => {
                  const record = state.records.find((item) => item.id === copy.recordId);
                  return (
                    <button
                      key={copy.id}
                      onClick={() => setSelectedCopyId(copy.id)}
                      className={`w-full rounded-2xl border p-3 text-left transition ${selectedCopy?.id === copy.id ? "border-cyan-400 bg-cyan-50" : "border-slate-200 hover:bg-slate-50"}`}
                    >
                      <p className="font-semibold text-ink">{record?.title}</p>
                      <p className="text-xs text-slate-500">{copy.inventoryNumber} · {copy.barcode}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <IdentityVerificationPanel
            state={state}
            actorId={currentUser.id}
            purpose="Circulation issue and return verification"
            onResolved={(user) => {
              if (user) {
                setSelectedStudentId(user.id);
                setVerifiedStudentId(user.id);
              }
            }}
          />
          <Card>
            <p className="text-lg font-semibold text-ink">Actions panel</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <Button
                onClick={() => {
                  if (!selectedStudent || !selectedCopy) return;
                  if (verifiedStudentId !== selectedStudent.id) {
                    push({ tone: "info", title: "Manual fallback ishlatilmoqda: Face ID verification bajarilmagan yoki boshqa talaba tanlangan." });
                  }
                  const result = state.issueBook({
                    userId: selectedStudent.id,
                    copyId: selectedCopy.id,
                    issuedBy: currentUser.id
                  });
                  push({ tone: result.success ? "success" : "error", title: result.message });
                  if (result.success) {
                    setReceiptModal(`Issue receipt\nMember: ${selectedStudent.fullName}\nCopy: ${selectedCopy.inventoryNumber}\nTitle: ${selectedRecord?.title}`);
                  }
                }}
              >
                Issue book
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  if (!selectedCopy) return;
                  const result = state.returnBook({ copyId: selectedCopy.id, returnedBy: currentUser.id });
                  push({ tone: result.success ? "success" : "error", title: result.message });
                  if (result.success) {
                    setReceiptModal(`Return receipt\nCopy: ${selectedCopy.inventoryNumber}\n${result.message}`);
                  }
                }}
              >
                Return book
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const loan = state.loans.find((item) => item.copyId === selectedCopy?.id && item.status !== "returned");
                  if (!loan) {
                    push({ tone: "error", title: "Renew uchun faol loan topilmadi." });
                    return;
                  }
                  const result = state.renewLoan({ loanId: loan.id, actorId: currentUser.id });
                  push({ tone: result.success ? "success" : "error", title: result.message });
                }}
              >
                Renew loan
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  if (!selectedRecord) return;
                  const result = state.reserveBook(selectedRecord.id);
                  push({ tone: result.success ? "success" : "error", title: result.message });
                }}
              >
                Reserve book
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (!selectedCopy) return;
                  const result = state.markCopyState({ copyId: selectedCopy.id, status: "lost", actorId: currentUser.id });
                  push({ tone: result.success ? "success" : "error", title: result.message });
                }}
              >
                Mark lost
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (!selectedCopy) return;
                  const result = state.markCopyState({ copyId: selectedCopy.id, status: "damaged", actorId: currentUser.id });
                  push({ tone: result.success ? "success" : "error", title: result.message });
                }}
              >
                Mark damaged
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const loan = state.loans.find((item) => item.copyId === selectedCopy?.id && item.status !== "returned");
                  if (!loan) {
                    push({ tone: "info", title: "Faol loan bo‘lmasa overdue fine hisoblanmaydi." });
                    return;
                  }
                  const now = new Date().toISOString();
                  const due = new Date(loan.dueAt).getTime();
                  const fine = now > loan.dueAt ? Math.ceil((new Date(now).getTime() - due) / 86400000) * 2000 : 0;
                  push({ tone: "info", title: `Estimated fine: ${formatCurrency(fine)}` });
                }}
              >
                Calculate fine
              </Button>
              <Button variant="secondary" onClick={() => setReceiptModal("Receipt preview\nCirculation event confirmation")}>
                Print receipt
              </Button>
            </div>
          </Card>
          <Card>
            <p className="text-lg font-semibold text-ink">Active loans</p>
            <div className="mt-4 space-y-3">
              {activeLoans.map((loan) => {
                const copy = state.copies.find((item) => item.id === loan.copyId);
                const record = state.records.find((item) => item.id === copy?.recordId);
                return (
                  <div key={loan.id} className="rounded-2xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-ink">{record?.title}</p>
                      <Badge tone={statusTone(loan.status)}>{loan.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{copy?.inventoryNumber} · due {formatDate(loan.dueAt)}</p>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card>
            <p className="text-lg font-semibold text-ink">Recent transactions</p>
            <div className="mt-4 space-y-3">
              {recentTransactions.map((log) => (
                <div key={log.id} className="rounded-2xl border border-slate-200 p-3">
                  <p className="font-semibold text-ink">{log.action}</p>
                  <p className="mt-1 text-sm text-slate-500">{log.details}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <Modal
        open={Boolean(receiptModal)}
        title="Receipt mock"
        onClose={() => setReceiptModal(null)}
        footer={
          <Button
            onClick={() => {
              if (receiptModal) {
                downloadTextFile("receipt.txt", receiptModal);
                push({ tone: "success", title: "Receipt exported as text." });
              }
            }}
          >
            Download receipt
          </Button>
        }
      >
        <pre className="whitespace-pre-wrap text-sm text-slate-700">{receiptModal}</pre>
      </Modal>
    </div>
  );
}

function CatalogerArea({
  currentUser,
  state,
  path
}: {
  currentUser: User;
  state: AppStore;
  path: string[];
}) {
  const { push } = useToast();
  const router = useRouter();
  const [exportModal, setExportModal] = useState<string | null>(null);

  if (path[1] === "authority") {
    const authorities = state.records.slice(0, 8).map((record) => ({
      id: record.id,
      heading: record.authors[0],
      variant: record.authors[1] ?? record.authors[0],
      status: record.authors[0] === record.authors[1] ? "normalized" : "review"
    }));
    return (
      <div className="space-y-6">
        <SectionTitle title="Authority records" description="Author heading va added entry variantlari bo‘yicha mock conflict resolution." />
        <div className="grid gap-4">
          {authorities.map((authority) => (
            <Card key={authority.id}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-ink">{authority.heading}</p>
                  <p className="text-sm text-slate-500">Variant: {authority.variant}</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => push({ tone: "success", title: `Authority heading normalized for ${authority.heading}` })}
                >
                  Normalize
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (path[1] === "copies") {
    const columns: ColumnDef<BookCopyModel>[] = [
      { header: "Inventory", cell: ({ row }) => row.original.inventoryNumber },
      { header: "Barcode", cell: ({ row }) => row.original.barcode },
      { header: "QR", cell: ({ row }) => row.original.qrCode },
      { header: "RFID", cell: ({ row }) => row.original.rfidTag },
      { header: "Status", cell: ({ row }) => <Badge tone={statusTone(row.original.status)}>{row.original.status}</Badge> }
    ];
    return (
      <div className="space-y-6">
        <SectionTitle title="Copy registry" description="Barcode, QR code, RFID tag va copy statuslar." />
        <DataTable data={state.copies.slice(0, 30)} columns={columns} />
      </div>
    );
  }

  if (path[1] === "import-export") {
    const sample = state.records[0];
    return (
      <div className="space-y-6">
        <SectionTitle title="Import / export" description="MARC mock import, MARC export va Dublin Core XML." />
        <Card className="grid gap-4 md:grid-cols-3">
          <Button onClick={() => setExportModal(buildMarcExport(sample!))}>Import MARC mock</Button>
          <Button onClick={() => setExportModal(buildMarcExport(sample!))}>Export MARC mock</Button>
          <Button onClick={() => setExportModal(buildDublinCoreXml(sample!))}>Export Dublin Core XML</Button>
        </Card>
        <Modal
          open={Boolean(exportModal)}
          title="Import / export preview"
          onClose={() => setExportModal(null)}
          footer={
            <Button
              onClick={() => {
                if (exportModal) {
                  downloadTextFile("catalog-export.txt", exportModal);
                  push({ tone: "success", title: "Export mock downloaded." });
                }
              }}
            >
              Download
            </Button>
          }
        >
          <pre className="whitespace-pre-wrap text-sm text-slate-700">{exportModal}</pre>
        </Modal>
      </div>
    );
  }

  if (path[1] === "records" && path[2] !== "new") {
    return (
      <div className="space-y-6">
        <SectionTitle
          title="Bibliographic records"
          description="Published va draft yozuvlar ro‘yxati."
          actions={<Button onClick={() => router.push("/cataloger/records/new")}>Create record</Button>}
        />
        <div className="grid gap-4">
          {state.records.slice(0, 20).map((record) => (
            <Card key={record.id}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-ink">{record.title}</p>
                  <p className="text-sm text-slate-500">{record.controlNumber} · {record.publisher} · {record.publicationYear}</p>
                </div>
                <Badge tone={statusTone(record.status)}>{record.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (path[1] === "records" && path[2] === "new") {
    return <CatalogRecordForm currentUser={currentUser} state={state} />;
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Cataloger dashboard" description="Draft queue, metadata completeness va copy registry overview." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Draft records" value={String(state.records.filter((item) => item.status === "draft").length)} hint="Cataloger review queue" accent="gold" />
        <KpiCard label="Published records" value={String(state.records.filter((item) => item.status === "published").length)} hint="Live OPAC entries" accent="emerald" />
        <KpiCard label="Records missing metadata" value={String(state.records.filter((item) => item.keywords.length < 4).length)} hint="Needs enrichment" accent="rose" />
        <KpiCard label="New copies" value={String(state.copies.filter((item) => item.status === "available").length)} hint="Holdings registered" accent="cyan" />
      </div>
    </div>
  );
}

function CatalogRecordForm({ currentUser, state }: { currentUser: User; state: AppStore }) {
  const { push } = useToast();
  const router = useRouter();
  const [copies, setCopies] = useState<
    {
      inventoryNumber: string;
      branchId: string;
      roomId: string;
      shelf: string;
      row: string;
      status: CopyStatus;
      acquisitionDate: string;
      price: number;
      fundingSource: string;
      barcode: string;
      qrCode: string;
      rfidTag: string;
    }[]
  >([
    {
      inventoryNumber: `INV-${new Date().getFullYear()}00001`,
      branchId: state.branches[0]?.id ?? "branch-main",
      roomId: "",
      shelf: "S-A1",
      row: "R-1",
      status: "available",
      acquisitionDate: new Date().toISOString().slice(0, 10),
      price: 125000,
      fundingSource: "University budget",
      barcode: "",
      qrCode: "",
      rfidTag: ""
    }
  ]);

  const form = useForm<z.infer<typeof recordSchema>>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      authors: "",
      editors: "",
      translators: "",
      publisher: "",
      publicationPlace: "Toshkent",
      publicationYear: new Date().getFullYear(),
      isbn: "",
      issn: "",
      language: "O‘zbek",
      pages: 200,
      edition: "1-nashr",
      description: "",
      annotation: "",
      keywords: "",
      resourceType: "Printed book",
      udc: "004.1",
      bbk: "32.97",
      ddc: "005.1",
      lcc: "QA76.1",
      subjects: "",
      faculty: currentUser.faculty,
      department: currentUser.department,
      leader: "00000nam a2200000 i 4500",
      control001: "auto",
      marc008: "260101s2026    uz ||||| |||| 00| 0 uz d",
      marc040: "UZ-TUIL |b uz |e rda |c UZ-TUIL",
      marc020: "",
      marc041: "O‘zbek",
      marc100: "",
      marc245: "",
      marc260: "",
      marc082: "005.1",
      marc084: "32.97",
      marc490: "Universitet kursi kutubxonasi",
      marc300: "",
      marc500: "Universitet fondi uchun katalog yozuvi",
      marc504: "Bibliografiya bilan",
      marc650: "",
      marc700: "",
      marc710: "Universitet axborot-resurs markazi",
      marc852: "Main stack",
      marc856: "No file",
      dcTitle: "",
      dcCreator: "",
      dcSubject: "",
      dcDescription: "",
      dcPublisher: "",
      dcDate: String(new Date().getFullYear()),
      dcType: "Printed book",
      dcFormat: "text",
      dcIdentifier: "",
      dcLanguage: "O‘zbek",
      dcRights: "University educational use"
    }
  });

  const handleSubmit = (status: "draft" | "published") =>
    form.handleSubmit((values) => {
      const result = state.saveRecord(
        {
          title: values.title,
          subtitle: values.subtitle,
          authors: values.authors.split(",").map((item) => item.trim()),
          editors: values.editors ? values.editors.split(",").map((item) => item.trim()) : [],
          translators: values.translators ? values.translators.split(",").map((item) => item.trim()) : [],
          publisher: values.publisher,
          publicationPlace: values.publicationPlace,
          publicationYear: values.publicationYear,
          isbn: values.isbn,
          issn: values.issn,
          language: values.language,
          pages: values.pages,
          edition: values.edition,
          description: values.description,
          annotation: values.annotation,
          keywords: values.keywords.split(",").map((item) => item.trim()),
          resourceType: values.resourceType as any,
          udc: values.udc,
          bbk: values.bbk,
          ddc: values.ddc,
          lcc: values.lcc,
          subjects: values.subjects.split(",").map((item) => item.trim()),
          faculty: values.faculty,
          department: values.department,
          marcFields: [
            { tag: "LDR", label: "Leader", value: values.leader },
            { tag: "001", label: "Control number", value: values.control001 },
            { tag: "008", label: "Fixed-length data", value: values.marc008 },
            { tag: "040", label: "Cataloging source", value: values.marc040 },
            { tag: "020", label: "ISBN", value: values.marc020 || values.isbn },
            { tag: "041", label: "Language", value: values.marc041 },
            { tag: "100", label: "Main author", value: values.marc100 || values.authors },
            { tag: "245", label: "Title", value: values.marc245 || values.title },
            { tag: "260", label: "Publication", value: values.marc260 || values.publisher },
            { tag: "082", label: "DDC", value: values.marc082 || values.ddc },
            { tag: "084", label: "BBK", value: values.marc084 || values.bbk },
            { tag: "490", label: "Series statement", value: values.marc490 },
            { tag: "300", label: "Physical description", value: values.marc300 || `${values.pages} pages` },
            { tag: "500", label: "General note", value: values.marc500 },
            { tag: "504", label: "Bibliography note", value: values.marc504 },
            { tag: "650", label: "Subject heading", value: values.marc650 || values.subjects },
            { tag: "700", label: "Added author", value: values.marc700 || values.editors || "" },
            { tag: "710", label: "Corporate author", value: values.marc710 },
            { tag: "852", label: "Location", value: values.marc852 },
            { tag: "856", label: "Electronic access", value: values.marc856 }
          ],
          dublinCore: [
            { key: "dc:title", value: values.dcTitle || values.title },
            { key: "dc:creator", value: values.dcCreator || values.authors },
            { key: "dc:subject", value: values.dcSubject || values.subjects },
            { key: "dc:description", value: values.dcDescription || values.annotation },
            { key: "dc:publisher", value: values.dcPublisher || values.publisher },
            { key: "dc:date", value: values.dcDate },
            { key: "dc:type", value: values.dcType },
            { key: "dc:format", value: values.dcFormat },
            { key: "dc:identifier", value: values.dcIdentifier || values.isbn },
            { key: "dc:language", value: values.dcLanguage },
            { key: "dc:rights", value: values.dcRights }
          ],
          status,
          copies
        },
        currentUser.id
      );
      push({ tone: result.success ? "success" : "error", title: result.message });
      if (result.success) {
        router.push("/cataloger/records");
      }
    });

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Create bibliographic record"
        description="Core metadata, classification, MARC-like fields, Dublin Core va holdings ma’lumotlari."
        actions={
          <>
            <Button variant="secondary" onClick={() => push({ tone: "info", title: "MARC import mock opened." })}>Import MARC</Button>
            <Button variant="secondary" onClick={() => push({ tone: "info", title: "Export MARC mock prepared." })}>Export MARC</Button>
            <Button variant="secondary" onClick={() => push({ tone: "info", title: "Dublin Core XML export prepared." })}>Export Dublin Core XML</Button>
          </>
        }
      />
      <form className="space-y-6">
        <Card>
          <p className="text-lg font-semibold text-ink">Core</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              ["title", "Title"],
              ["subtitle", "Subtitle"],
              ["authors", "Authors"],
              ["editors", "Editors"],
              ["translators", "Translators"],
              ["publisher", "Publisher"],
              ["publicationPlace", "Publication place"],
              ["publicationYear", "Publication year"],
              ["isbn", "ISBN"],
              ["issn", "ISSN"],
              ["language", "Language"],
              ["pages", "Pages"],
              ["edition", "Edition"],
              ["faculty", "Faculty"],
              ["department", "Department"],
              ["resourceType", "Resource type"]
            ].map(([name, label]) => (
              <div key={name}>
                <Label>{label}</Label>
                <Input type={name.includes("Year") || name === "pages" ? "number" : "text"} {...form.register(name as keyof z.infer<typeof recordSchema>)} />
              </div>
            ))}
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea {...form.register("description")} />
            </div>
            <div className="md:col-span-2">
              <Label>Annotation</Label>
              <Textarea {...form.register("annotation")} />
            </div>
            <div className="md:col-span-2">
              <Label>Keywords</Label>
              <Input {...form.register("keywords")} placeholder="keyword1, keyword2" />
            </div>
          </div>
        </Card>
        <Card>
          <p className="text-lg font-semibold text-ink">Classification</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              ["udc", "UDK / UDC"],
              ["bbk", "BBK"],
              ["ddc", "DDC"],
              ["lcc", "LCC"],
              ["subjects", "Subject headings"]
            ].map(([name, label]) => (
              <div key={name}>
                <Label>{label}</Label>
                <Input {...form.register(name as keyof z.infer<typeof recordSchema>)} />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <p className="text-lg font-semibold text-ink">MARC-like section</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              ["leader", "Leader"],
              ["control001", "001 Control number"],
              ["marc008", "008 Fixed-length data"],
              ["marc040", "040 Cataloging source"],
              ["marc020", "020 ISBN"],
              ["marc041", "041 Language"],
              ["marc100", "100 Main author"],
              ["marc245", "245 Title"],
              ["marc260", "260 Publication"],
              ["marc082", "082 DDC"],
              ["marc084", "084 BBK"],
              ["marc490", "490 Series statement"],
              ["marc300", "300 Physical description"],
              ["marc500", "500 General note"],
              ["marc504", "504 Bibliography note"],
              ["marc650", "650 Subject heading"],
              ["marc700", "700 Added author"],
              ["marc710", "710 Corporate author"],
              ["marc852", "852 Location"],
              ["marc856", "856 Electronic access"]
            ].map(([name, label]) => (
              <div key={name}>
                <Label>{label}</Label>
                <Input {...form.register(name as keyof z.infer<typeof recordSchema>)} />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <p className="text-lg font-semibold text-ink">Dublin Core</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              ["dcTitle", "dc:title"],
              ["dcCreator", "dc:creator"],
              ["dcSubject", "dc:subject"],
              ["dcDescription", "dc:description"],
              ["dcPublisher", "dc:publisher"],
              ["dcDate", "dc:date"],
              ["dcType", "dc:type"],
              ["dcFormat", "dc:format"],
              ["dcIdentifier", "dc:identifier"],
              ["dcLanguage", "dc:language"],
              ["dcRights", "dc:rights"]
            ].map(([name, label]) => (
              <div key={name}>
                <Label>{label}</Label>
                <Input {...form.register(name as keyof z.infer<typeof recordSchema>)} />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-ink">Copies / holdings</p>
              <p className="text-sm text-slate-500">Inventory number, barcode, QR, RFID va shelf mapping.</p>
            </div>
            <Button
              variant="secondary"
              onClick={() =>
                setCopies((current) => [
                  ...current,
                  {
                    inventoryNumber: `INV-${new Date().getFullYear()}${String(current.length + 2).padStart(5, "0")}`,
                    branchId: state.branches[0]?.id ?? "branch-main",
                    roomId: "",
                    shelf: "S-B1",
                    row: "R-2",
                    status: "available",
                    acquisitionDate: new Date().toISOString().slice(0, 10),
                    price: 98000,
                    fundingSource: "Grant",
                    barcode: "",
                    qrCode: "",
                    rfidTag: ""
                  }
                ])
              }
            >
              Add copy
            </Button>
          </div>
          <div className="mt-4 space-y-4">
            {copies.map((copy, index) => (
              <div key={`${copy.inventoryNumber}-${index}`} className="grid gap-3 rounded-3xl border border-slate-200 p-4 md:grid-cols-4">
                <div>
                  <Label>Inventory number</Label>
                  <Input value={copy.inventoryNumber} onChange={(event) => setCopies((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, inventoryNumber: event.target.value } : item))} />
                </div>
                <div>
                  <Label>Branch</Label>
                  <Select value={copy.branchId} onChange={(event) => setCopies((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, branchId: event.target.value } : item))}>
                    {state.branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Shelf</Label>
                  <Input value={copy.shelf} onChange={(event) => setCopies((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, shelf: event.target.value } : item))} />
                </div>
                <div>
                  <Label>Row</Label>
                  <Input value={copy.row} onChange={(event) => setCopies((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, row: event.target.value } : item))} />
                </div>
                <div>
                  <Label>Barcode</Label>
                  <Input value={copy.barcode} onChange={(event) => setCopies((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, barcode: event.target.value } : item))} />
                </div>
                <div>
                  <Label>QR code</Label>
                  <Input value={copy.qrCode} onChange={(event) => setCopies((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, qrCode: event.target.value } : item))} />
                </div>
                <div>
                  <Label>RFID</Label>
                  <Input value={copy.rfidTag} onChange={(event) => setCopies((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, rfidTag: event.target.value } : item))} />
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setCopies((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                barcode: `BAR-${item.inventoryNumber.replace(/[^0-9A-Z]/gi, "").slice(-10)}`,
                                rfidTag: `RFID-${item.inventoryNumber.slice(-4)}-${index + 1}`
                              }
                            : item
                        )
                      )
                    }
                  >
                    Generate barcode
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setCopies((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                qrCode: `QR:${item.inventoryNumber}:${index + 1}`
                              }
                            : item
                        )
                      )
                    }
                  >
                    Generate QR
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={handleSubmit("draft")}>Save draft</Button>
          <Button onClick={handleSubmit("published")}>Publish record</Button>
        </div>
      </form>
    </div>
  );
}

function AcquisitionArea({
  currentUser,
  state,
  path
}: {
  currentUser: User;
  state: AppStore;
  path: string[];
}) {
  const { push } = useToast();
  const requestForm = useForm<z.infer<typeof acquisitionSchema>>({
    resolver: zodResolver(acquisitionSchema),
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      quantity: 2,
      faculty: currentUser.faculty,
      priority: "medium",
      justification: "Fan dasturi va semestr yuklamasi uchun qo‘shimcha nusxalar kerak.",
      estimatedPrice: 240000,
      vendorId: state.vendors[0]?.id
    }
  });
  const vendorForm = useForm<z.infer<typeof vendorSchema>>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      rating: 4,
      paymentTerms: "30 days after delivery"
    }
  });

  const budgetUsed = state.acquisitionRequests
    .filter((item) => item.status !== "rejected")
    .reduce((acc, item) => acc + item.estimatedPrice * item.quantity, 0);
  const annualBudget = 120_000_000;
  const budgetData = state.acquisitionRequests.slice(0, 6).map((item) => ({
    faculty: item.faculty.split(" ")[0],
    amount: item.estimatedPrice * item.quantity
  }));

  if (path[1] === "vendors") {
    return (
      <div className="space-y-6">
        <SectionTitle title="Vendor management" description="Contact person, payment terms va rating bilan vendor registry." />
        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <Card>
            <form
              className="space-y-4"
              onSubmit={vendorForm.handleSubmit((values) => {
                const result = state.addVendor(values, currentUser.id);
                push({ tone: result.success ? "success" : "error", title: result.message });
                if (result.success) vendorForm.reset();
              })}
            >
              {(["name", "contactPerson", "phone", "email", "address", "rating", "paymentTerms"] as const).map((name) => (
                <div key={name}>
                  <Label>{name}</Label>
                  <Input type={name === "rating" ? "number" : "text"} {...vendorForm.register(name)} />
                </div>
              ))}
              <Button type="submit" className="w-full">Add vendor</Button>
            </form>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            {state.vendors.map((vendor) => (
              <Card key={vendor.id}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-ink">{vendor.name}</p>
                  <Badge tone="gold">{vendor.rating}/5</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-500">{vendor.contactPerson}</p>
                <p className="text-sm text-slate-500">{vendor.phone} · {vendor.email}</p>
                <p className="mt-3 text-sm text-slate-600">{vendor.paymentTerms}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (path[1] === "orders") {
    const orders = state.acquisitionRequests.filter((item) => item.status === "ordered" || item.status === "received");
    return (
      <div className="space-y-6">
        <SectionTitle title="Orders and receiving" description="Ordered va received statusdagi xarid oqimlari." />
        <div className="grid gap-4">
          {orders.map((request) => (
            <Card key={request.id}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-ink">{request.title}</p>
                  <p className="text-sm text-slate-500">{request.author} · qty {request.quantity}</p>
                </div>
                <div className="flex gap-2">
                  <Badge tone={statusTone(request.status)}>{request.status}</Badge>
                  {request.status === "ordered" ? (
                    <Button
                      onClick={() => {
                        const result = state.updateAcquisitionStatus(request.id, "received", currentUser.id);
                        push({ tone: result.success ? "success" : "error", title: result.message });
                      }}
                    >
                      Mark received
                    </Button>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (path[1] === "budget") {
    return (
      <div className="space-y-6">
        <SectionTitle title="Budget dashboard" description="Annual budget, remaining balance va faculty usage." />
        <div className="grid gap-4 md:grid-cols-3">
          <KpiCard label="Annual budget" value={formatCurrency(annualBudget)} hint="Allocated acquisition budget" accent="cyan" />
          <KpiCard label="Used amount" value={formatCurrency(budgetUsed)} hint="Approved and ordered requests" accent="gold" />
          <KpiCard label="Remaining" value={formatCurrency(annualBudget - budgetUsed)} hint="Available for new orders" accent="emerald" />
        </div>
        <Card className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={budgetData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="faculty" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#0f9f6e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    );
  }

  if (path[1] === "requests") {
    return (
      <div className="space-y-6">
        <SectionTitle title="Acquisition requests" description="Faculty book request, priority, justification va vendor assignment." />
        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <Card>
            <form
              className="space-y-4"
              onSubmit={requestForm.handleSubmit((values) => {
                const result = state.createAcquisitionRequest(values, currentUser.id);
                push({ tone: result.success ? "success" : "error", title: result.message });
              })}
            >
              {(["title", "author", "isbn", "quantity", "faculty", "estimatedPrice"] as const).map((name) => (
                <div key={name}>
                  <Label>{name}</Label>
                  <Input type={name === "quantity" || name === "estimatedPrice" ? "number" : "text"} {...requestForm.register(name)} />
                </div>
              ))}
              <div>
                <Label>Priority</Label>
                <Select {...requestForm.register("priority")}>
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </Select>
              </div>
              <div>
                <Label>Vendor</Label>
                <Select {...requestForm.register("vendorId")}>
                  {state.vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Justification</Label>
                <Textarea {...requestForm.register("justification")} />
              </div>
              <Button type="submit" className="w-full">Create request</Button>
            </form>
          </Card>
          <div className="space-y-4">
            {state.acquisitionRequests.map((request) => (
              <Card key={request.id}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-ink">{request.title}</p>
                    <p className="text-sm text-slate-500">{request.author} · {request.isbn} · qty {request.quantity}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge tone={statusTone(request.status)}>{request.status}</Badge>
                    <Select
                      value={request.status}
                      onChange={(event) => {
                        const result = state.updateAcquisitionStatus(
                          request.id,
                          event.target.value as AcquisitionRequest["status"],
                          currentUser.id
                        );
                        push({ tone: result.success ? "success" : "error", title: result.message });
                      }}
                    >
                      <option value="requested">requested</option>
                      <option value="approved">approved</option>
                      <option value="ordered">ordered</option>
                      <option value="received">received</option>
                      <option value="rejected">rejected</option>
                    </Select>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Acquisition dashboard" description="Request queue, vendor performance va budget consumption." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Purchase requests" value={String(state.acquisitionRequests.length)} hint="All request entries" accent="cyan" />
        <KpiCard label="Approved orders" value={String(state.acquisitionRequests.filter((item) => item.status === "approved" || item.status === "ordered").length)} hint="Pending procurement" accent="gold" />
        <KpiCard label="Received items" value={String(state.acquisitionRequests.filter((item) => item.status === "received").length)} hint="Ready for cataloging" accent="emerald" />
        <KpiCard label="Budget usage" value={`${Math.round((budgetUsed / annualBudget) * 100)}%`} hint="Current annual spend" accent="rose" />
      </div>
    </div>
  );
}

function RepositoryManagerArea({
  currentUser,
  state,
  path
}: {
  currentUser: User;
  state: AppStore;
  path: string[];
}) {
  const { push } = useToast();

  if (path[1] === "upload") {
    return <RepositoryUploadArea currentUser={currentUser} state={state} actorRoute="upload" />;
  }

  if (path[1] === "access-control") {
    const groups = ["public", "university only", "faculty only", "staff only", "restricted"] as const;
    const pendingRequests = state.resourceAccessRequests.filter((item) => item.status === "pending");
    return (
      <div className="space-y-6">
        <SectionTitle title="Access control" description="Access policy, restricted request queue va repository governance oqimi." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {groups.map((level) => (
            <KpiCard
              key={level}
              label={level}
              value={String(state.digitalResources.filter((item) => item.accessLevel === level).length)}
              hint="Resource count"
              accent={level === "restricted" ? "rose" : level === "public" ? "emerald" : "cyan"}
            />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <Card>
            <p className="text-lg font-semibold text-ink">Restricted access requests</p>
            <div className="mt-4 space-y-3">
              {pendingRequests.length === 0 ? (
                <EmptyState
                  title="Faol ruxsat so'rovlari yo'q"
                  description="Restricted resurslar bo'yicha yangi so'rov tushganda shu yerda ko'rinadi."
                />
              ) : (
                pendingRequests.map((request) => {
                  const resource = state.digitalResources.find((item) => item.id === request.resourceId);
                  return (
                    <div key={request.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink">{resource?.title ?? "Resurs topilmadi"}</p>
                          <p className="mt-1 text-sm text-slate-500">{request.requesterName} • {request.requesterEmail}</p>
                        </div>
                        <AccessPolicyBadge level={resource?.accessLevel ?? "restricted"} />
                      </div>
                      <p className="mt-3 text-sm text-slate-600">{request.reason}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          onClick={() => {
                            const result = state.updateResourceAccessRequestStatus(request.id, "approved", currentUser.id);
                            push({ tone: result.success ? "success" : "error", title: result.message });
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            const result = state.updateResourceAccessRequestStatus(request.id, "rejected", currentUser.id);
                            push({ tone: result.success ? "success" : "error", title: result.message });
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
          <Card>
            <p className="text-lg font-semibold text-ink">Policy notes</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p><span className="font-semibold text-ink">Public:</span> metadata, open and download barcha foydalanuvchilar uchun ochiq.</p>
              <p><span className="font-semibold text-ink">University only:</span> guest faqat metadata ko&apos;radi, login qilingan foydalanuvchi to&apos;liq kiradi.</p>
              <p><span className="font-semibold text-ink">Faculty only:</span> faqat bir xil faculty foydalanuvchilari ochadi yoki yuklab oladi.</p>
              <p><span className="font-semibold text-ink">Staff only:</span> student download qilolmaydi, staff rollari ishlata oladi.</p>
              <p><span className="font-semibold text-ink">Restricted:</span> to&apos;g&apos;ridan-to&apos;g&apos;ri download yopiq, access request audit bilan yuritiladi.</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (path[1] === "resources") {
    return <RepositoryPage state={state} />;
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Repository manager dashboard" description="Upload queue, access policy va usage metrics." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="New uploads" value={String(state.digitalResources.filter((item) => new Date(item.createdAt).getMonth() === new Date().getMonth()).length)} hint="This month" accent="cyan" />
        <KpiCard label="Restricted resources" value={String(state.digitalResources.filter((item) => item.accessLevel === "restricted").length)} hint="Review carefully" accent="rose" />
        <KpiCard label="Downloads" value={String(state.digitalResources.reduce((acc, item) => acc + item.downloads, 0))} hint="All-time usage" accent="emerald" />
        <KpiCard label="Most viewed" value={state.digitalResources.slice().sort((a, b) => b.views - a.views)[0]?.title.slice(0, 12) ?? "—"} hint="Top repository item" accent="gold" />
      </div>
    </div>
  );
}

function AdminArea({
  currentUser,
  state,
  path
}: {
  currentUser: User;
  state: AppStore;
  path: string[];
}) {
  const { push } = useToast();
  const [reportModal, setReportModal] = useState<string | null>(null);
  const totalUnpaidFines = state.fines
    .filter((item) => item.status !== "paid" && item.status !== "waived")
    .reduce((acc, item) => acc + item.amount, 0);
  const activeLoansCount = state.loans.filter((item) => item.status !== "returned").length;
  const overdueLoansCount = state.loans.filter((item) => item.status === "overdue").length;
  const reservationsCount = state.reservations.filter((item) => item.status === "pending" || item.status === "approved").length;
  const repositoryDownloads = state.digitalResources.reduce((acc, item) => acc + item.downloads, 0);
  const occupancyRate = Math.round(
    (state.seats.filter((item) => item.status === "occupied" || item.status === "booked").length / state.seats.length) * 100
  );
  const metadataQuality = state.records.map((record) => getMetadataCompleteness(record));

  if (path[1] === "users") {
    const columns: ColumnDef<User>[] = [
      { header: "Name", cell: ({ row }) => row.original.fullName },
      { header: "Email", cell: ({ row }) => row.original.email },
      { header: "Role", cell: ({ row }) => row.original.role },
      { header: "Faculty", cell: ({ row }) => row.original.faculty },
      { header: "Status", cell: ({ row }) => <Badge tone={statusTone(row.original.status)}>{row.original.status}</Badge> }
    ];
    return (
      <div className="space-y-6">
        <SectionTitle title="Users" description="Role-based user registry, membership status va faculty mapping." />
        <DataTable data={state.users.slice(0, 40)} columns={columns} />
      </div>
    );
  }

  if (path[1] === "roles") {
    return (
      <div className="space-y-6">
        <SectionTitle title="Roles and permissions" description="Permission matrix for guest, student, librarian, cataloger and admin roles." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(permissionMatrix).map(([role, perms]) => (
            <Card key={role}>
              <p className="font-semibold capitalize text-ink">{role}</p>
              <p className="mt-2 text-sm text-slate-600">{perms.join(", ")}</p>
              <p className="mt-3 text-xs text-slate-500">RBAC route protection va menu visibility ushbu matritsaga tayangan.</p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (path[1] === "books") {
    return <CatalogPage state={state} language={state.language} />;
  }

  if (path[1] === "copies") {
    const columns: ColumnDef<BookCopyModel>[] = [
      { header: "Inventory", cell: ({ row }) => row.original.inventoryNumber },
      { header: "Barcode", cell: ({ row }) => row.original.barcode },
      { header: "Branch", cell: ({ row }) => branchName(state, row.original.branchId) },
      { header: "Status", cell: ({ row }) => <Badge tone={statusTone(row.original.status)}>{row.original.status}</Badge> }
    ];
    return (
      <div className="space-y-6">
        <SectionTitle title="Copies" description="Holdings registry across branches and reading rooms." />
        <DataTable data={state.copies.slice(0, 40)} columns={columns} />
      </div>
    );
  }

  if (path[1] === "branches") {
    return (
      <div className="space-y-6">
        <SectionTitle title="Branches" description="Library branch directory with holdings scope." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {state.branches.map((branch) => (
            <Card key={branch.id}>
              <p className="text-lg font-semibold text-ink">{branch.name}</p>
              <p className="mt-2 text-sm text-slate-600">{branch.address}</p>
              <p className="mt-3 text-sm text-slate-500">{branch.description}</p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (path[1] === "rooms") {
    const occupancy = state.rooms.map((room) => {
      const seats = state.seats.filter((item) => item.roomId === room.id);
      const occupied = seats.filter((item) => item.status === "occupied" || item.status === "booked").length;
      return { room, occupied, percentage: Math.round((occupied / room.capacity) * 100) };
    });
    return (
      <div className="space-y-6">
        <SectionTitle title="Rooms" description="Reading room occupancy, capacity va working hours." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {occupancy.map(({ room, occupied, percentage }) => (
            <Card key={room.id}>
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-ink">{room.name}</p>
                <Badge tone={percentage > 80 ? "rose" : percentage > 55 ? "gold" : "emerald"}>{percentage}%</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-500">Capacity {room.capacity} · floor {room.floor}</p>
              <p className="mt-2 text-sm text-slate-600">{occupied} seats in active usage.</p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (path[1] === "fines") {
    return (
      <div className="space-y-6">
        <SectionTitle title="Fine management" description="Confirm payment, reject receipt, waive fine va manual fine creation." />
        <div className="grid gap-4">
          {state.fines.map((fine) => {
            const user = state.users.find((item) => item.id === fine.userId);
            return (
              <Card key={fine.id}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-ink">{user?.fullName}</p>
                    <p className="text-sm text-slate-500">{fine.reason} · {formatCurrency(fine.amount)} · {fine.status}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const result = state.confirmFinePayment(fine.id, currentUser.id);
                        push({ tone: result.success ? "success" : "error", title: result.message });
                      }}
                    >
                      Confirm payment
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const result = state.rejectFineReceipt(fine.id, currentUser.id);
                        push({ tone: result.success ? "success" : "error", title: result.message });
                      }}
                    >
                      Reject receipt
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        const result = state.waiveFine(fine.id, currentUser.id, "Administrative waiver");
                        push({ tone: result.success ? "success" : "error", title: result.message });
                      }}
                    >
                      Waive
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  if (path[1] === "reports") {
    const kinds = [
      "daily_circulation",
      "overdues",
      "fines",
      "collection_growth",
      "downloads",
      "occupancy",
      "faculty_usage",
      "most_borrowed",
      "lost_damaged",
      "ai_usage",
      "metadata_completeness"
    ] as const;

    return (
      <div className="space-y-6">
        <SectionTitle title="Reports export" description="PDF mock, CSV/text export va print view preview." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {kinds.map((kind) => (
            <Card key={kind}>
              <p className="font-semibold text-ink">{kind.replace(/_/g, " ")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    setReportModal(
                      buildReport(kind, {
                        loans: state.loans,
                        fines: state.fines,
                        records: state.records,
                        bookings: state.bookings,
                        acquisitionRequests: state.acquisitionRequests,
                        digitalResources: state.digitalResources,
                        aiUsageLogs: state.aiUsageLogs,
                        copies: state.copies
                      })
                    )
                  }
                >
                  PDF mock
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const content = buildReport(kind, {
                      loans: state.loans,
                      fines: state.fines,
                      records: state.records,
                      bookings: state.bookings,
                      acquisitionRequests: state.acquisitionRequests,
                      digitalResources: state.digitalResources,
                      aiUsageLogs: state.aiUsageLogs,
                      copies: state.copies
                    });
                    downloadTextFile(`${kind}.csv`, content);
                    push({ tone: "success", title: "CSV/text report exported." });
                  }}
                >
                  CSV
                </Button>
                <Button variant="secondary" onClick={() => setReportModal(`Print view\n\n${kind}`)}>Print view</Button>
              </div>
            </Card>
          ))}
        </div>
        <Modal
          open={Boolean(reportModal)}
          title="Report preview"
          onClose={() => setReportModal(null)}
          footer={
            <Button
              onClick={() => {
                if (reportModal) {
                  downloadTextFile("report.txt", reportModal);
                  push({ tone: "success", title: "Report preview downloaded." });
                }
              }}
            >
              Download preview
            </Button>
          }
        >
          <pre className="whitespace-pre-wrap text-sm text-slate-700">{reportModal}</pre>
        </Modal>
      </div>
    );
  }

  if (path[1] === "biometric-audit") {
    return (
      <div className="space-y-6">
        <SectionTitle title="Biometric and identity audit" description="Enrollment, Face ID login, liveness failure, QR regeneration va duplicate risk monitoring." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Enrollments" value={String(state.biometricAuditLogs.filter((item) => item.action === "FACE_ENROLLMENT" && item.result === "enrolled").length)} hint="Active face registrations" accent="emerald" />
          <KpiCard label="Failed face logins" value={String(state.biometricAuditLogs.filter((item) => item.action === "FACE_ID_LOGIN" && item.result !== "matched").length)} hint="Verification failures" accent="rose" />
          <KpiCard label="QR regenerations" value={String(state.biometricAuditLogs.filter((item) => item.action === "REGENERATE_QR_CARD").length)} hint="Card identity changes" accent="cyan" />
          <KpiCard label="Risk flags" value={String(state.identityRiskFlags.length)} hint="Duplicate or suspicious attempts" accent="gold" />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <Card>
            <p className="text-lg font-semibold text-ink">Biometric audit timeline</p>
            <div className="mt-4 space-y-3">
              {state.biometricAuditLogs.slice(0, 20).map((item) => {
                const user = state.users.find((entry) => entry.id === item.userId);
                return (
                  <div key={item.id} className="rounded-2xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-ink">{item.action}</p>
                      <Badge tone={item.result.includes("fail") || item.result.includes("not") ? "rose" : "emerald"}>{item.result}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{user?.fullName ?? item.userId} • {item.deviceInfo}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatDate(item.createdAt)} • {item.ipAddressMock}</p>
                  </div>
                );
              })}
            </div>
          </Card>
          <div className="space-y-6">
            <Card>
              <p className="text-lg font-semibold text-ink">Identity risk flags</p>
              <div className="mt-4 space-y-3">
                {state.identityRiskFlags.length === 0 ? (
                  <EmptyState title="Risk flag topilmadi" description="Duplicate student ID, face template va suspicious attempts shu yerda ko'rinadi." />
                ) : (
                  state.identityRiskFlags.slice(0, 10).map((flag) => (
                    <div key={flag.id} className="rounded-2xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-ink">{flag.riskType}</p>
                        <Badge tone={flag.severity === "high" ? "rose" : flag.severity === "medium" ? "gold" : "cyan"}>{flag.severity}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{flag.description}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
            <Card>
              <p className="text-lg font-semibold text-ink">Verification logs</p>
              <div className="mt-4 space-y-3">
                {state.identityVerificationRecords.slice(0, 8).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-ink">{item.method}</p>
                      <Badge tone={item.confidence === "high" ? "emerald" : item.confidence === "medium" ? "gold" : "rose"}>{item.result}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{item.purpose}</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <p className="text-lg font-semibold text-ink">Export biometric audit CSV</p>
              <Button
                className="mt-4"
                onClick={() => {
                  const content = ["action,result,userId,deviceInfo,createdAt", ...state.biometricAuditLogs.map((item) => `${item.action},${item.result},${item.userId},${item.deviceInfo},${item.createdAt}`)].join("\n");
                  downloadTextFile("biometric-audit.csv", content);
                  push({ tone: "success", title: "Biometric audit CSV exported." });
                }}
              >
                Export CSV
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (path[1] === "security" && path[2] === "identity-settings") {
    const settings = state.identitySettings;
    return (
      <div className="space-y-6">
        <SectionTitle title="Identity security settings" description="Face ID, QR card login, passkey, liveness threshold va manual fallback boshqaruvi." />
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <Card className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["faceIdLoginEnabled", "Face ID login"],
                ["faceIdCirculationVerificationEnabled", "Face ID for circulation"],
                ["qrCardLoginEnabled", "QR card login"],
                ["passkeyEnabled", "Passkey mock"],
                ["requireLivenessCheck", "Require liveness"],
                ["manualFallbackEnabled", "Manual fallback"]
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    const result = state.updateIdentitySettings({ [key]: !settings[key as keyof typeof settings] } as Partial<typeof settings>, currentUser.id);
                    push({ tone: result.success ? "success" : "error", title: result.message });
                  }}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
                >
                  <span className="font-semibold text-ink">{label}</span>
                  <Badge tone={settings[key as keyof typeof settings] ? "emerald" : "rose"}>{settings[key as keyof typeof settings] ? "enabled" : "disabled"}</Badge>
                </button>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Liveness threshold</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.livenessThreshold}
                  onChange={(event) => state.updateIdentitySettings({ livenessThreshold: Number(event.target.value) }, currentUser.id)}
                />
              </div>
              <div>
                <Label>Max failed attempts</Label>
                <Input
                  type="number"
                  value={settings.maxFailedAttempts}
                  onChange={(event) => state.updateIdentitySettings({ maxFailedAttempts: Number(event.target.value) }, currentUser.id)}
                />
              </div>
              <div>
                <Label>Retention days</Label>
                <Input
                  type="number"
                  value={settings.biometricRetentionDays}
                  onChange={(event) => state.updateIdentitySettings({ biometricRetentionDays: Number(event.target.value) }, currentUser.id)}
                />
              </div>
            </div>
          </Card>
          <Card>
            <p className="text-lg font-semibold text-ink">Security notes</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>Face ID ixtiyoriy, consent-based va raw photo saqlanmaydi.</p>
              <p>Passkey qurilma-side autentifikatsiyaga tayyor mock arxitekturaga ulangan.</p>
              <p>Biometric audit CSV va risk flag monitoring admin nazorat panelidan eksport qilinadi.</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (path[1] === "settings") {
    return (
      <div className="space-y-6">
        <SectionTitle title="System settings" description="System health, security, backup and API key mock controls." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="System health" value="99.4%" hint="Mock uptime for application layer" accent="emerald" />
          <KpiCard label="Audit queue" value={String(state.auditLogs.length)} hint="Logged operational events" accent="cyan" />
          <KpiCard label="Backup status" value="Latest OK" hint="Nightly snapshot mock" accent="gold" />
          <KpiCard label="Security posture" value="Hardened" hint="JWT-ready auth structure planned" accent="rose" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <p className="text-lg font-semibold text-ink">Security settings</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>RBAC matrix enforced for portal routes.</p>
              <p>File validation mock enabled for repository uploads.</p>
              <p>Audit logging ակտիվ for circulation, cataloging and fines.</p>
            </div>
          </Card>
          <Card>
            <p className="text-lg font-semibold text-ink">Super admin controls</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>Backup rotation dashboard mock</p>
              <p>API key registry placeholder cards without real secrets</p>
              <p>OAI-PMH endpoint mapping readiness summary</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (path[1] === "audit-logs") {
    const columns: ColumnDef<AppStore["auditLogs"][number]>[] = [
      { header: "When", cell: ({ row }) => formatDate(row.original.createdAt) },
      { header: "Action", cell: ({ row }) => row.original.action },
      { header: "Entity", cell: ({ row }) => `${row.original.entity} #${row.original.entityId}` },
      { header: "Details", cell: ({ row }) => row.original.details }
    ];
    return (
      <div className="space-y-6">
        <SectionTitle title="Audit logs" description="Operational audit trail for circulation, cataloging, repository and acquisitions." />
        <DataTable data={state.auditLogs.slice(0, 40)} columns={columns} />
      </div>
    );
  }

  const chartData = state.records.slice(0, 8).map((record) => ({
    name: record.title.split(" ")[0],
    growth: record.borrowCount,
    copies: state.copies.filter((item) => item.recordId === record.id).length
  }));
  const facultyUsage = Array.from(new Set(state.records.map((item) => item.faculty))).map((faculty) => ({
    faculty: faculty.split(" ")[0],
    value: state.records.filter((item) => item.faculty === faculty).reduce((acc, item) => acc + item.borrowCount, 0)
  }));
  const topBorrowed = state.records.slice().sort((a, b) => b.borrowCount - a.borrowCount).slice(0, 5);
  const aiFeatureUsage = Array.from(new Set(state.aiUsageLogs.map((item) => item.feature))).map((feature) => ({
    feature,
    value: state.aiUsageLogs.filter((item) => item.feature === feature).length
  }));
  const searchedTopics = state.aiUsageLogs
    .filter((item) => item.feature === "semantic_search" || item.feature === "research_explorer")
    .slice(0, 5);
  const roleDistribution = Array.from(new Set(state.users.map((item) => item.role))).map((role) => ({
    role,
    value: state.users.filter((item) => item.role === role).length
  }));
  const fineStatus = ["unpaid", "pending_confirmation", "paid", "waived", "rejected"].map((status) => ({
    status,
    value: state.fines.filter((item) => item.status === status).length
  }));
  const metadataQualityPanel = {
    excellent: metadataQuality.filter((item) => item.score === 100 || item.score === 93).length,
    review: metadataQuality.filter((item) => item.score === 81 || item.score === 74).length,
    weak: metadataQuality.filter((item) => item.score === 62).length
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Admin dashboard" description="System statistics, collection growth, faculty usage va audit overview." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <KpiCard label="Total users" value={String(state.users.length)} hint="All active roles" accent="cyan" />
        <KpiCard label="Total records" value={String(state.records.length)} hint="Bibliographic records" accent="emerald" />
        <KpiCard label="Active loans" value={String(activeLoansCount)} hint="Current circulation" accent="gold" />
        <KpiCard label="Overdue loans" value={String(overdueLoansCount)} hint="Requires librarian follow-up" accent="rose" />
        <KpiCard label="Reservations" value={String(reservationsCount)} hint="Active queue entries" accent="cyan" />
        <KpiCard label="Unpaid fines" value={formatCurrency(totalUnpaidFines)} hint="Outstanding obligations" accent="gold" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <KpiCard label="Total copies" value={String(state.copies.length)} hint="Inventory-level holdings" accent="emerald" />
        <KpiCard label="Digital resources" value={String(state.digitalResources.length)} hint="Repository items" accent="rose" />
        <KpiCard label="AI usage" value={String(state.aiUsageLogs.length)} hint="Logged AI interactions" accent="cyan" />
        <KpiCard label="Reading plan users" value={String(new Set(state.readingPlans.map((item) => item.userId)).size)} hint="Students using AI plans" accent="emerald" />
        <KpiCard label="Repository downloads" value={String(repositoryDownloads)} hint="Download audit counter" accent="gold" />
        <KpiCard label="Room occupancy" value={`${occupancyRate}%`} hint="Booked and occupied seats" accent="rose" />
        <KpiCard label="Acquisition requests" value={String(state.acquisitionRequests.length)} hint="Procurement pipeline" accent="cyan" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="h-[340px]">
          <p className="mb-4 text-lg font-semibold text-ink">Collection growth chart</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="growth" stroke="#0f9f6e" strokeWidth={3} />
              <Line type="monotone" dataKey="copies" stroke="#15b7d6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="h-[340px]">
          <p className="mb-4 text-lg font-semibold text-ink">Usage by faculty</p>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={facultyUsage} dataKey="value" nameKey="faculty" outerRadius={110}>
                {facultyUsage.map((entry, index) => (
                  <Cell key={entry.faculty} fill={["#0f9f6e", "#15b7d6", "#c79b2d", "#2563eb", "#fb7185", "#7c3aed"][index % 6]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="h-[320px]">
          <p className="mb-4 text-lg font-semibold text-ink">AI feature usage</p>
          <p className="sr-only">Bar chart showing how often semantic search, reading plans, quizzes and other AI tools were used.</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aiFeatureUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="feature" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#15b7d6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <p className="text-lg font-semibold text-ink">Most searched topics</p>
          <div className="mt-4 space-y-3">
            {searchedTopics.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-slate-200 p-3">
                <p className="font-semibold text-ink">{entry.input}</p>
                <p className="mt-1 text-sm text-slate-500">{entry.feature} • {entry.outputSummary}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="h-[320px]">
          <p className="mb-4 text-lg font-semibold text-ink">Role distribution</p>
          <p className="sr-only">Pie chart of system users grouped by role.</p>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={roleDistribution} dataKey="value" nameKey="role" outerRadius={105}>
                {roleDistribution.map((entry, index) => (
                  <Cell key={entry.role} fill={["#0f9f6e", "#15b7d6", "#c79b2d", "#2563eb", "#fb7185", "#7c3aed", "#0f172a"][index % 7]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card className="h-[320px]">
          <p className="mb-4 text-lg font-semibold text-ink">Fine status overview</p>
          <p className="sr-only">Bar chart of fine statuses including unpaid, pending confirmation, paid and waived.</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fineStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#fb7185" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card>
          <p className="text-lg font-semibold text-ink">Top borrowed books</p>
          <div className="mt-4 space-y-3">
            {topBorrowed.map((record) => (
              <div key={record.id} className="rounded-2xl border border-slate-200 p-3">
                <p className="font-semibold text-ink">{record.title}</p>
                <p className="mt-1 text-sm text-slate-500">{record.borrowCount} circulation count</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <p className="text-lg font-semibold text-ink">System health and audit highlights</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="font-semibold text-ink">Reading room occupancy</p>
                <p className="mt-1 text-sm text-slate-500">{occupancyRate}% active seat usage</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="font-semibold text-ink">Fines collected</p>
                <p className="mt-1 text-sm text-slate-500">{formatCurrency(state.fines.filter((item) => item.status === "paid").reduce((acc, item) => acc + item.amount, 0))}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="font-semibold text-ink">Metadata quality panel</p>
                <p className="mt-1 text-sm text-slate-500">Excellent: {metadataQualityPanel.excellent} • Review: {metadataQualityPanel.review} • Weak: {metadataQualityPanel.weak}</p>
              </div>
            </div>
            <div className="space-y-3">
              {state.auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-ink">{log.action}</p>
                  <p className="mt-1 text-sm text-slate-500">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function AboutRulesContact({
  mode
}: {
  mode: "about" | "rules" | "contact";
}) {
  const content = {
    about: {
      title: "Tizim haqida",
      text: "UniLibrary Pro universitet kutubxonasining elektron katalog, circulation, repository, acquisition va analytic jarayonlarini birlashtiruvchi demo platforma sifatida ishlab chiqilgan."
    },
    rules: {
      title: "Foydalanish qoidalari",
      text: "Loan muddati, reservation pickup window, reading room seat etiquette, repository access policy va fine settlement jarayonlari ushbu modulda aniq ko‘rsatiladi."
    },
    contact: {
      title: "Aloqa",
      text: "Asosiy kutubxona axborot xizmati: library@unilibrary.uz, +998 71 200 10 10, Toshkent shahri, Universitet ko‘chasi 12."
    }
  }[mode];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
      <SectionTitle title={content.title} description={content.text} />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <p className="font-semibold text-ink">Bibliographic control</p>
          <p className="mt-2 text-sm text-slate-600">MARC-like metadata, authority heading va holdings mapping tayyorlangan.</p>
        </Card>
        <Card>
          <p className="font-semibold text-ink">Service operations</p>
          <p className="mt-2 text-sm text-slate-600">Issue, return, renew, reservation va reading room check-in desk oqimlari jonli ishlaydi.</p>
        </Card>
        <Card>
          <p className="font-semibold text-ink">Data portability</p>
          <p className="mt-2 text-sm text-slate-600">Dublin Core, CSV/text exports va OAI-PMH-ready repository structure ko‘zda tutilgan.</p>
        </Card>
      </div>
    </div>
  );
}

export function RoutePage({ segments }: { segments: string[] }) {
  const router = useRouter();
  const pathname = `/${segments.join("/")}`;
  const state = useAppStore();
  const currentUser = selectCurrentUser(state);
  const { push } = useToast();
  const protectedPortal = routeRole(segments[0]);

  useEffect(() => {
    if (!state.hydrated) {
      return;
    }
    if ((segments[0] === "login" || segments[0] === "register") && currentUser) {
      router.replace(dashboardByRole[currentUser.role as Exclude<UserRole, "guest">]);
      return;
    }

    if (protectedPortal) {
      if (!currentUser) {
        router.replace("/login");
        return;
      }
      if (!roleCanAccess(currentUser.role, segments[0]!)) {
        push({ tone: "error", title: "Bu bo‘lim uchun ruxsat yetarli emas." });
        router.replace("/unauthorized");
      }
    }
  }, [currentUser, protectedPortal, push, router, segments, state.hydrated]);

  if (!state.hydrated && protectedPortal) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="grid gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-80 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const publicPage = () => {
    if (segments.length === 0) return <LandingPage language={state.language} />;
    if (segments[0] === "catalog") return <CatalogPage state={state} language={state.language} recordId={segments[1]} />;
    if (segments[0] === "repository") return <RepositoryPage state={state} resourceId={segments[1]} />;
    if (segments[0] === "new-arrivals") return <CatalogPage state={state} language={state.language} initialMode="new-arrivals" />;
    if (segments[0] === "popular-books") return <CatalogPage state={state} language={state.language} initialMode="popular" />;
    if (segments[0] === "about") return <AboutRulesContact mode="about" />;
    if (segments[0] === "rules") return <AboutRulesContact mode="rules" />;
    if (segments[0] === "contact") return <AboutRulesContact mode="contact" />;
    if (segments[0] === "login") return <AuthPage mode="login" language={state.language} />;
    if (segments[0] === "register") return <AuthPage mode="register" language={state.language} />;
    return (
      <div className="mx-auto max-w-4xl px-4 py-14 lg:px-8">
        <EmptyState title="Page not found" description={`The route ${pathname} is not mapped in this demo.`} action={<Link href="/"><Button>Return to landing</Button></Link>} />
      </div>
    );
  };

  if (!protectedPortal) {
    return (
      <>
        <PublicHeader language={state.language} onChangeLanguage={state.setLanguage} currentUser={currentUser} />
        {publicPage()}
        <PublicFooter />
      </>
    );
  }

  if (!currentUser) {
    return null;
  }

  const protectedContent = () => {
    if (currentUser.role === "student" || currentUser.role === "teacher") {
      return <StudentAndTeacherArea currentUser={currentUser} state={state} path={segments} />;
    }
    if (currentUser.role === "librarian") {
      return <LibrarianArea currentUser={currentUser} state={state} path={segments} />;
    }
    if (currentUser.role === "cataloger") {
      return <CatalogerArea currentUser={currentUser} state={state} path={segments} />;
    }
    if (currentUser.role === "acquisitionManager") {
      return <AcquisitionArea currentUser={currentUser} state={state} path={segments} />;
    }
    if (currentUser.role === "repositoryManager") {
      return <RepositoryManagerArea currentUser={currentUser} state={state} path={segments} />;
    }
    return <AdminArea currentUser={currentUser} state={state} path={segments} />;
  };

  return (
    <ProtectedShell currentUser={currentUser} language={state.language} onChangeLanguage={state.setLanguage}>
      {protectedContent()}
    </ProtectedShell>
  );
}
