import { createBarcode, createQrCode, createRfidTag } from "@/lib/barcode";
import { encodeMockPassword } from "@/lib/auth";
import { makeId, randomPick } from "@/lib/utils";
import {
  AccessLevel,
  AcquisitionRequest,
  AuditLog,
  BibliographicRecord,
  BookCopy,
  DemoAccount,
  DigitalResource,
  Fine,
  LibraryBranch,
  LibraryDatabase,
  Loan,
  Notification,
  ReadingRoom,
  ReadingRoomBooking,
  Reservation,
  ResourceType,
  Seat,
  User,
  UserRole,
  Vendor
} from "@/types";

const faculties = [
  "Axborot texnologiyalari",
  "Iqtisodiyot",
  "Pedagogika",
  "Muhandislik",
  "Filologiya",
  "Huquq",
  "Tibbiyot"
];

const departments = [
  "Dasturiy injiniring",
  "Raqamli iqtisodiyot",
  "Pedagogik innovatsiyalar",
  "Kompyuter injiniringi",
  "Amaliy filologiya",
  "Konstitutsiyaviy huquq",
  "Tibbiy informatika"
];

const publishers = [
  "Universitet nashriyoti",
  "O‘zbekiston Milliy kutubxonasi nashri",
  "Academic Press Tashkent",
  "Ilm Ziyo",
  "Raqamli Ta'lim Markazi"
];

const authors = [
  "Aziza Karimova",
  "Bekzod To‘raev",
  "Dilshod Nazarov",
  "Farida Sattorova",
  "Jamshid Xasanov",
  "Malika Ergasheva",
  "Nodira Qodirova",
  "Olimjon Rahimov",
  "Sardor Mo‘minov",
  "Sevara Hamidova",
  "Shohruh Yusupov",
  "Zarnigor Ismoilova"
];

const titles = [
  "Ma’lumotlar bazasi tizimlari",
  "Algoritmlar va ma’lumotlar tuzilmalari",
  "Sun’iy intellekt asoslari",
  "Kompyuter tarmoqlari",
  "Raqamli iqtisodiyot",
  "Pedagogik texnologiyalar",
  "Ilmiy tadqiqot metodologiyasi",
  "Oliy matematika",
  "Dasturlash asoslari",
  "Kiberxavfsizlikka kirish",
  "Axborot tizimlari auditi",
  "Raqamli marketing",
  "Menejment nazariyasi",
  "Dasturiy injiniring",
  "Operatsion tizimlar",
  "Web dasturlash",
  "Bulutli texnologiyalar",
  "Ma’lumotlar tahlili",
  "Elektron hukumat",
  "Tizimli tahlil"
];

const academicProfiles = [
  {
    title: "Sun'iy intellekt asoslari",
    faculty: "Axborot texnologiyalari",
    department: "Dasturiy injiniring",
    resourceType: "Printed book" as ResourceType,
    subjects: ["sun'iy intellekt", "machine learning", "neyron tarmoqlar"],
    keywords: ["AI", "machine learning", "algoritmlar"],
    shelfPrefix: "AI"
  },
  {
    title: "Kiberxavfsizlikka kirish",
    faculty: "Axborot texnologiyalari",
    department: "Kompyuter injiniringi",
    resourceType: "Printed book" as ResourceType,
    subjects: ["kiberxavfsizlik", "tarmoq xavfsizligi", "axborot xavfsizligi"],
    keywords: ["cybersecurity", "internet xavfsizligi", "threats"],
    shelfPrefix: "SEC"
  },
  {
    title: "Kompyuter tarmoqlari",
    faculty: "Axborot texnologiyalari",
    department: "Kompyuter injiniringi",
    resourceType: "Printed book" as ResourceType,
    subjects: ["kompyuter tarmoqlari", "routing", "switching"],
    keywords: ["network", "tcp/ip", "internet"],
    shelfPrefix: "NET"
  },
  {
    title: "Ma'lumotlar bazasi tizimlari",
    faculty: "Axborot texnologiyalari",
    department: "Dasturiy injiniring",
    resourceType: "E-book" as ResourceType,
    subjects: ["ma'lumotlar bazasi", "sql", "data modeling"],
    keywords: ["database", "sql", "normalization"],
    shelfPrefix: "DB"
  },
  {
    title: "Raqamli iqtisodiyot",
    faculty: "Iqtisodiyot",
    department: "Raqamli iqtisodiyot",
    resourceType: "Printed book" as ResourceType,
    subjects: ["raqamli iqtisodiyot", "platform economics", "fintech"],
    keywords: ["digital economy", "fintech", "analytics"],
    shelfPrefix: "ECO"
  },
  {
    title: "Raqamli marketing",
    faculty: "Iqtisodiyot",
    department: "Raqamli iqtisodiyot",
    resourceType: "Article" as ResourceType,
    subjects: ["marketing analytics", "digital strategy", "consumer data"],
    keywords: ["marketing", "customer journey", "brand"],
    shelfPrefix: "MKT"
  },
  {
    title: "Menejment nazariyasi",
    faculty: "Iqtisodiyot",
    department: "Raqamli iqtisodiyot",
    resourceType: "Printed book" as ResourceType,
    subjects: ["menejment", "leadership", "organizational design"],
    keywords: ["management", "strategy", "governance"],
    shelfPrefix: "MNG"
  },
  {
    title: "Pedagogik texnologiyalar",
    faculty: "Pedagogika",
    department: "Pedagogik innovatsiyalar",
    resourceType: "Methodical guide" as ResourceType,
    subjects: ["pedagogik texnologiyalar", "lesson design", "assessment"],
    keywords: ["education", "learning design", "curriculum"],
    shelfPrefix: "PED"
  },
  {
    title: "Raqamli ta'limda AI",
    faculty: "Pedagogika",
    department: "Pedagogik innovatsiyalar",
    resourceType: "Lecture notes" as ResourceType,
    subjects: ["raqamli ta'lim", "AI in education", "learning analytics"],
    keywords: ["edtech", "adaptive learning", "lms"],
    shelfPrefix: "EDU"
  },
  {
    title: "Ilmiy tadqiqot metodologiyasi",
    faculty: "Pedagogika",
    department: "Pedagogik innovatsiyalar",
    resourceType: "Thesis" as ResourceType,
    subjects: ["research methodology", "academic writing", "citation"],
    keywords: ["methodology", "research design", "bibliography"],
    shelfPrefix: "RSH"
  },
  {
    title: "Dasturiy injiniring",
    faculty: "Muhandislik",
    department: "Dasturiy injiniring",
    resourceType: "Printed book" as ResourceType,
    subjects: ["software engineering", "architecture", "testing"],
    keywords: ["software", "agile", "testing"],
    shelfPrefix: "SWE"
  },
  {
    title: "Operatsion tizimlar",
    faculty: "Muhandislik",
    department: "Kompyuter injiniringi",
    resourceType: "Printed book" as ResourceType,
    subjects: ["operatsion tizimlar", "process management", "memory"],
    keywords: ["os", "kernel", "threads"],
    shelfPrefix: "OPS"
  },
  {
    title: "Bulutli texnologiyalar",
    faculty: "Muhandislik",
    department: "Kompyuter injiniringi",
    resourceType: "E-book" as ResourceType,
    subjects: ["cloud computing", "virtualization", "distributed systems"],
    keywords: ["cloud", "containers", "microservices"],
    shelfPrefix: "CLD"
  },
  {
    title: "Amaliy filologiya tadqiqotlari",
    faculty: "Filologiya",
    department: "Amaliy filologiya",
    resourceType: "Journal issue" as ResourceType,
    subjects: ["philology", "linguistics", "text analysis"],
    keywords: ["language", "corpus", "stylistics"],
    shelfPrefix: "PHL"
  },
  {
    title: "Akademik yozuv uslublari",
    faculty: "Filologiya",
    department: "Amaliy filologiya",
    resourceType: "Methodical guide" as ResourceType,
    subjects: ["academic writing", "citation ethics", "editing"],
    keywords: ["writing", "apa", "mla"],
    shelfPrefix: "WRT"
  },
  {
    title: "Elektron hukumat",
    faculty: "Huquq",
    department: "Konstitutsiyaviy huquq",
    resourceType: "Printed book" as ResourceType,
    subjects: ["e-government", "public services", "digital policy"],
    keywords: ["government", "services", "law"],
    shelfPrefix: "LAW"
  },
  {
    title: "Axborot tizimlari auditi",
    faculty: "Huquq",
    department: "Konstitutsiyaviy huquq",
    resourceType: "Article" as ResourceType,
    subjects: ["audit", "compliance", "information systems"],
    keywords: ["audit", "risk", "governance"],
    shelfPrefix: "AUD"
  },
  {
    title: "Tibbiy informatika",
    faculty: "Tibbiyot",
    department: "Tibbiy informatika",
    resourceType: "Printed book" as ResourceType,
    subjects: ["medical informatics", "health data", "clinical systems"],
    keywords: ["health", "informatics", "ehr"],
    shelfPrefix: "MED"
  },
  {
    title: "Ma'lumotlar tahlili",
    faculty: "Tibbiyot",
    department: "Tibbiy informatika",
    resourceType: "E-book" as ResourceType,
    subjects: ["data analysis", "statistics", "visualization"],
    keywords: ["analytics", "statistics", "visualization"],
    shelfPrefix: "DAT"
  },
  {
    title: "Oliy matematika",
    faculty: "Muhandislik",
    department: "Kompyuter injiniringi",
    resourceType: "Printed book" as ResourceType,
    subjects: ["calculus", "linear algebra", "discrete mathematics"],
    keywords: ["mathematics", "analysis", "equations"],
    shelfPrefix: "MAT"
  }
] as const;

const resourceTypes = [
  "Printed book",
  "E-book",
  "Article",
  "Thesis",
  "Methodical guide",
  "Lecture notes",
  "Journal issue"
] as const;

const languages = ["O‘zbek", "Русский", "English"];

const accessLevels: AccessLevel[] = [
  "public",
  "university only",
  "faculty only",
  "staff only",
  "restricted"
];

const coverGradients = [
  "from-sky-500 via-cyan-500 to-teal-500",
  "from-emerald-500 via-green-500 to-lime-500",
  "from-amber-500 via-orange-500 to-rose-500",
  "from-blue-700 via-indigo-600 to-cyan-500",
  "from-slate-700 via-slate-600 to-slate-500"
];

function isoOffset(days: number, hours = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(date.getHours() + hours, 0, 0, 0);
  return date.toISOString();
}

function buildUsers(role: UserRole, count: number, startIndex: number, demo?: Partial<User>): User[] {
  return Array.from({ length: count }, (_, index) => {
    const absolute = startIndex + index;
    const faculty = randomPick(faculties, absolute);
    const department = randomPick(departments, absolute);
    const fullName = `${randomPick(authors, absolute).split(" ")[0]} ${randomPick(
      ["Karimov", "Tursunova", "Saidov", "Yo‘ldoshev", "Umarova", "Aliyev"],
      absolute + 1
    )}`;

    const base: User = {
      id: makeId(role, absolute + 1),
      fullName,
      email: `${role.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}${absolute + 1}@unilibrary.uz`,
      passwordHashMock: encodeMockPassword("password123"),
      role,
      studentId: role === "student" ? `ST-${202400 + absolute}` : undefined,
      employeeId: role !== "student" ? `EMP-${7000 + absolute}` : undefined,
      phone: `+998 90 ${String(absolute).padStart(3, "0")} ${String(absolute + 11).padStart(2, "0")} ${String(
        absolute + 29
      ).padStart(2, "0")}`,
      faculty,
      department,
      group: role === "student" ? `SE-${(absolute % 4) + 1}-${(absolute % 3) + 1}` : undefined,
      status: absolute % 17 === 0 && role === "student" ? "blocked" : "active",
      membershipNumber: `M-${role.slice(0, 3).toUpperCase()}-${9000 + absolute}`,
      cardQrCode: createQrCode(`user-${role}-${absolute}`),
      cardBarcode: createBarcode(`user-${role}-${absolute}`),
      cardStatus: "active",
      cardExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().slice(0, 10),
      createdAt: isoOffset(-300 + absolute)
    };

    return { ...base, ...demo };
  });
}

function createRecords(catalogerId: string): BibliographicRecord[] {
  return Array.from({ length: 100 }, (_, index) => {
    const profile = academicProfiles[index % academicProfiles.length]!;
    const title = profile.title;
    const author = randomPick(authors, index);
    const faculty = profile.faculty;
    const department = profile.department;
    const publicationYear = 2014 + (index % 12);
    const resourceType = profile.resourceType;
    const gapMode = index % 5;
    const isbn = gapMode >= 2 ? "" : `978-9943-${1000 + index}-${(index % 8) + 1}`;
    const subtitle = [
      "nazariy va amaliy yondashuv",
      "universitet kursi uchun qo'llanma",
      "amaliy mashg'ulotlar to'plami",
      "raqamli transformatsiya kontekstida"
    ][index % 4];
    const annotation = `${title} bo'yicha yozuv ${faculty.toLocaleLowerCase()} yo'nalishi uchun tuzilgan. Resurs ${department.toLocaleLowerCase()} fanlari, amaliy mashg'ulotlar va ilmiy izlanishlarda foydalanish uchun tavsiya etiladi.`;
    const publisher = gapMode >= 1 ? "" : randomPick(publishers, index);
    const subjects = gapMode >= 3 ? [] : [...profile.subjects, faculty, department];
    const keywords = [...profile.keywords, faculty, department];
    const udc = gapMode >= 4 ? "" : `004.${index % 90}/${(index % 8) + 1}`;
    const bbk = gapMode >= 4 ? "" : `32.97${index % 10}`;
    const ddc = gapMode >= 4 ? "" : `005.${index % 30}`;

    const marcFields = [
      { tag: "LDR", label: "Leader", value: "00000nam a2200000 i 4500" },
      { tag: "001", label: "Control number", value: `CN-${10000 + index}` },
      { tag: "008", label: "Fixed-length data", value: `${String(publicationYear).slice(-2)}0101s${publicationYear}    uz ||||| |||| 00| 0 uz d` },
      { tag: "040", label: "Cataloging source", value: "UZ-TUIL |b uz |e rda |c UZ-TUIL" },
      { tag: "020", label: "ISBN", value: isbn },
      { tag: "041", label: "Language", value: randomPick(languages, index) },
      { tag: "100", label: "Main author", value: author },
      { tag: "245", label: "Title", value: `${title} : ${subtitle}` },
      { tag: "260", label: "Publication", value: `${randomPick(["Toshkent", "Samarqand", "Namangan"], index)} : ${publisher || "Nashriyot aniqlanmoqda"}, ${publicationYear}` },
      { tag: "082", label: "DDC", value: ddc || "Classification pending" },
      { tag: "084", label: "BBK", value: bbk || "Classification pending" },
      { tag: "490", label: "Series statement", value: "Universitet kursi kutubxonasi" },
      { tag: "300", label: "Physical description", value: `${180 + (index % 220)} pages` },
      { tag: "500", label: "General note", value: "Universitet fondi uchun kataloglashtirilgan yozuv" },
      { tag: "504", label: "Bibliography note", value: "Bibliografiya va ko'rsatkichlar bilan." },
      { tag: "650", label: "Subject heading", value: subjects[0] ?? "Subject pending" },
      { tag: "700", label: "Added author", value: randomPick(authors, index + 3) },
      { tag: "710", label: "Corporate author", value: "Universitet axborot-resurs markazi" },
      { tag: "852", label: "Location", value: `Main stack / Shelf ${profile.shelfPrefix}-${String.fromCharCode(65 + (index % 6))}` },
      { tag: "856", label: "Electronic access", value: index < 50 ? `https://repository.mock/${index + 1}` : "No file" }
    ];

    const dublinCore = [
      { key: "dc:title", value: title },
      { key: "dc:creator", value: author },
      { key: "dc:subject", value: subjects.join("; ") },
      { key: "dc:description", value: annotation },
      { key: "dc:publisher", value: publisher || "Publisher pending" },
      { key: "dc:date", value: String(publicationYear) },
      { key: "dc:type", value: resourceType },
      { key: "dc:format", value: "text/pdf" },
      { key: "dc:identifier", value: isbn || `CN-${10000 + index}` },
      { key: "dc:language", value: randomPick(languages, index) },
      { key: "dc:rights", value: "University educational use" }
    ];

    return {
      id: makeId("record", index + 1),
      controlNumber: `CN-${10000 + index}`,
      title,
      subtitle,
      authors: [author, randomPick(authors, index + 4)],
      editors: [randomPick(authors, index + 7)],
      translators: index % 3 === 0 ? [randomPick(authors, index + 9)] : [],
      publisher,
      publicationPlace: randomPick(["Toshkent", "Samarqand", "Buxoro", "Andijon"], index),
      publicationYear,
      isbn,
      issn: `20${10 + (index % 10)}-1${100 + index}`,
      language: randomPick(languages, index),
      pages: 180 + (index % 220),
      edition: `${(index % 4) + 1}-nashr`,
      description: `${title} bo‘yicha to‘liq bibliografik tavsif va universitet fondidagi nusxalar holati.`,
      annotation,
      keywords,
      resourceType,
      udc,
      bbk,
      ddc,
      lcc: `QA76.${100 + index}`,
      subjects,
      faculty,
      department,
      marcFields,
      dublinCore,
      status: index < 8 ? "draft" : "published",
      createdBy: catalogerId,
      createdAt: isoOffset(-200 + index),
      updatedAt: isoOffset(-10 + (index % 9)),
      coverGradient: randomPick(coverGradients, index),
      borrowCount: 8 + ((index * 3) % 74),
      isNewArrival: index > 79
    };
  });
}

function createBranches(): LibraryBranch[] {
  return [
    {
      id: "branch-main",
      name: "Asosiy kutubxona",
      address: "Toshkent shahri, Universitet ko‘chasi 12",
      description: "Markaziy fond, OPAC xizmati va raqamli resurslar markazi"
    },
    {
      id: "branch-it",
      name: "IT fakulteti fondi",
      address: "2-o‘quv bino, 1-qavat",
      description: "Texnik va dasturiy injiniring fondlari"
    },
    {
      id: "branch-humanities",
      name: "Gumanitar fond",
      address: "3-o‘quv bino, 2-qavat",
      description: "Pedagogika, filologiya va huquq bo‘limlari"
    }
  ];
}

function createRooms(branches: LibraryBranch[]): ReadingRoom[] {
  return [
    { id: "room-1", branchId: branches[0].id, name: "Ilmiy tadqiqot zali", capacity: 50, floor: 2, workingHours: "08:00-22:00" },
    { id: "room-2", branchId: branches[0].id, name: "Elektron resurslar zali", capacity: 60, floor: 1, workingHours: "08:00-23:00" },
    { id: "room-3", branchId: branches[1].id, name: "IT laboratoriya zali", capacity: 40, floor: 3, workingHours: "09:00-20:00" },
    { id: "room-4", branchId: branches[2].id, name: "Pedagogika o‘quv zali", capacity: 50, floor: 2, workingHours: "08:30-21:00" },
    { id: "room-5", branchId: branches[0].id, name: "Dissertatsiyalar zali", capacity: 50, floor: 4, workingHours: "09:00-18:00" }
  ];
}

function createSeats(rooms: ReadingRoom[]): Seat[] {
  const disabled = new Set([7, 19, 42, 77, 109, 143, 181, 222]);
  return rooms.flatMap((room, roomIndex) =>
    Array.from({ length: room.capacity }, (_, index) => {
      const seatIndex = roomIndex * 50 + index + 1;
      return {
        id: makeId("seat", seatIndex),
        roomId: room.id,
        seatNumber: `${roomIndex + 1}-${String(index + 1).padStart(2, "0")}`,
        status: disabled.has(seatIndex) ? "disabled" : index % 17 === 0 ? "occupied" : "available"
      } as Seat;
    })
  );
}

function createCopies(records: BibliographicRecord[], branches: LibraryBranch[], rooms: ReadingRoom[]): BookCopy[] {
  return Array.from({ length: 250 }, (_, index) => {
    const recordIndex = ((index + 10) % 90) + 10;
    const record = records[recordIndex]!;
    const inventoryNumber = `INV-${2026}${String(index + 1).padStart(5, "0")}`;
    const branch = randomPick(branches, index);
    const roomOnly = recordIndex % 11 === 0;
    const room = roomOnly ? randomPick(rooms, index) : index % 9 === 0 ? randomPick(rooms, index) : undefined;
    const status =
      index % 37 === 0
        ? "repair"
        : index % 43 === 0
          ? "damaged"
          : index % 61 === 0
            ? "lost"
            : index % 8 === 0
              ? "reserved"
              : "available";
    return {
      id: makeId("copy", index + 1),
      recordId: record.id,
      inventoryNumber,
      barcode: createBarcode(inventoryNumber),
      qrCode: createQrCode(inventoryNumber),
      rfidTag: createRfidTag(inventoryNumber),
      branchId: branch.id,
      roomId: room?.id,
      shelf: `S-${String.fromCharCode(65 + (index % 6))}${(index % 9) + 1}`,
      row: `R-${(index % 12) + 1}`,
      status,
      acquisitionDate: isoOffset(-600 + index),
      price: 85000 + (index % 7) * 22000,
      fundingSource: index % 3 === 0 ? "University budget" : index % 3 === 1 ? "Grant" : "Donor fund"
    };
  });
}

function createDigitalResources(records: BibliographicRecord[], repositoryManagerId: string): DigitalResource[] {
  return Array.from({ length: 50 }, (_, index) => {
    const record = records[index]!;
    return {
      id: makeId("resource", index + 1),
      recordId: record.id,
      title: `${record.title} — raqamli nusxa`,
      type: index % 3 === 0 ? "E-book" : index % 3 === 1 ? "Article" : "Lecture notes",
      faculty: record.faculty,
      department: record.department,
      year: record.publicationYear,
      language: record.language,
      abstract: record.annotation,
      keywords: record.keywords,
      doi: index % 3 === 0 ? `10.2026/unilib.${index + 100}` : undefined,
      handle: `hdl:123456/${index + 1000}`,
      accessLevel: accessLevels[index % accessLevels.length],
      fileUrl: `/mock/repository/${index + 1}.pdf`,
      fileName: `${record.title.replace(/\s+/g, "_").toLowerCase()}.pdf`,
      fileSize: 4_500_000 + index * 52_000,
      license: index % 2 === 0 ? "CC BY-NC 4.0" : "University licensed use",
      embargoDate: index % 8 === 0 ? isoOffset(90 + index) : undefined,
      version: `v${1 + (index % 3)}.0`,
      views: 120 + index * 11,
      downloads: 50 + index * 7,
      uploadedBy: repositoryManagerId,
      createdAt: isoOffset(-120 + index)
    };
  });
}

function createVendors(): Vendor[] {
  return Array.from({ length: 10 }, (_, index) => ({
    id: makeId("vendor", index + 1),
    name: `${randomPick(["Akademnashr", "Bookline", "EduTech", "Sharq Press", "Global Text"], index)} ${index + 1}`,
    contactPerson: randomPick(authors, index),
    phone: `+998 71 20${index} 45 ${30 + index}`,
    email: `vendor${index + 1}@books.uz`,
    address: `${randomPick(["Toshkent", "Samarqand", "Buxoro"], index)} shahri, ${index + 10}-uy`,
    rating: 3 + (index % 3),
    paymentTerms: index % 2 === 0 ? "30 days after delivery" : "50% advance / 50% after receiving"
  }));
}

function createLoans(users: User[], copies: BookCopy[], librarianId: string): Loan[] {
  const borrowers = users.filter((user) => user.role === "student" || user.role === "teacher");
  return Array.from({ length: 55 }, (_, index) => {
    const loan: Loan = {
      id: makeId("loan", index + 1),
      userId: borrowers[index % borrowers.length]!.id,
      copyId: copies[index]!.id,
      issuedBy: librarianId,
      issuedAt: isoOffset(-20 + (index % 9)),
      dueAt: index < 15 ? isoOffset(-5 + (index % 4)) : isoOffset(3 + (index % 12)),
      returnedAt: undefined,
      status: index < 15 ? "overdue" : "issued",
      renewCount: index % 3,
      fineAmount: 0
    };
    copies[index]!.status = "borrowed";
    return loan;
  });
}

function createReservations(users: User[], records: BibliographicRecord[], copies: BookCopy[]): Reservation[] {
  const students = users.filter((user) => user.role === "student");
  return Array.from({ length: 20 }, (_, index) => {
    const record = records[(index + 20) % records.length]!;
    const copy = copies[(index + 80) % copies.length]!;
    if (copy.status === "available") {
      copy.status = "reserved";
    }

    return {
      id: makeId("reservation", index + 1),
      userId: students[index % students.length]!.id,
      recordId: record.id,
      copyId: copy.id,
      status: index % 3 === 0 ? "approved" : "pending",
      reservedAt: isoOffset(-index),
      expiresAt: isoOffset(3 + index)
    };
  });
}

function createFines(loans: Loan[]): Fine[] {
  return Array.from({ length: 12 }, (_, index) => {
    const loan = loans[index]!;
    const amount = 4000 + index * 2000;
    loan.fineAmount = amount;
    return {
      id: makeId("fine", index + 1),
      userId: loan.userId,
      loanId: loan.id,
      reason: index < 9 ? "overdue" : index === 9 ? "damaged" : index === 10 ? "lost" : "card_reissue",
      amount,
      status: index < 3 ? "paid" : index < 6 ? "pending_confirmation" : "unpaid",
      paymentMethod: index < 3 ? "Click" : undefined,
      receiptUrl: index >= 3 && index < 6 ? `/receipts/fine-${index + 1}.png` : undefined,
      createdAt: isoOffset(-14 + index),
      paidAt: index < 3 ? isoOffset(-7 + index) : undefined
    };
  });
}

function createBookings(users: User[], rooms: ReadingRoom[], seats: Seat[]): ReadingRoomBooking[] {
  const bookers = users.filter((user) => user.role === "student");
  return Array.from({ length: 18 }, (_, index) => {
    const room = rooms[index % rooms.length]!;
    const seat = seats.find((item) => item.roomId === room.id && item.status === "available" && Number(item.id.slice(-4)) % 3 === index % 3) ??
      seats.find((item) => item.roomId === room.id && item.status === "available")!;
    if (index % 3 === 0) {
      seat.status = "booked";
    }
    if (index % 5 === 0) {
      seat.status = "occupied";
    }

    return {
      id: makeId("booking", index + 1),
      userId: bookers[index % bookers.length]!.id,
      roomId: room.id,
      seatId: seat.id,
      date: isoOffset(index % 2).slice(0, 10),
      startTime: `${8 + (index % 8)}:00`,
      endTime: `${10 + (index % 8)}:00`,
      status: index % 5 === 0 ? "checked_in" : "booked",
      qrCode: createQrCode(`booking-${index + 1}`)
    };
  });
}

function createRequests(users: User[], vendors: Vendor[]): AcquisitionRequest[] {
  const requesters = users.filter((user) => user.role === "teacher" || user.role === "acquisitionManager");
  return Array.from({ length: 25 }, (_, index) => ({
    id: makeId("request", index + 1),
    requestedBy: requesters[index % requesters.length]!.id,
    title: `${randomPick(titles, index)} bo‘yicha qo‘shimcha adabiyot`,
    author: randomPick(authors, index),
    isbn: `978-9910-${2000 + index}-${(index % 8) + 1}`,
    quantity: 1 + (index % 4),
    faculty: randomPick(faculties, index),
    priority: index % 3 === 0 ? "high" : index % 3 === 1 ? "medium" : "low",
    justification: "Fan dasturi va semestr yuklamasiga muvofiq qo‘shimcha nusxalar talab etiladi.",
    estimatedPrice: 180000 + index * 12000,
    vendorId: vendors[index % vendors.length]!.id,
    status: index % 5 === 0 ? "received" : index % 4 === 0 ? "ordered" : index % 3 === 0 ? "approved" : "requested",
    createdAt: isoOffset(-35 + index)
  }));
}

function createNotifications(users: User[]): Notification[] {
  const targetUsers = users.filter((user) => user.role !== "guest");
  return Array.from({ length: 30 }, (_, index) => ({
    id: makeId("notification", index + 1),
    userId: targetUsers[index % targetUsers.length]!.id,
    title: [
      "Rezervatsiya holati yangilandi",
      "Qaytarish muddati yaqinlashmoqda",
      "Repositoryga yangi resurs qo‘shildi",
      "O‘quv zali booking tasdiqlandi",
      "Jarima bo‘yicha bildirishnoma"
    ][index % 5]!,
    message: [
      "Bibliografik yozuv bo‘yicha kutib turilgan nusxa kelib tushdi.",
      "Aktiv loan uchun due date 48 soatdan keyin tugaydi.",
      "Fakultetingiz bo‘yicha yangi elektron resurs joylandi.",
      "QR check-in uchun booking kodi tayyor.",
      "To‘lov kvitansiyasi tasdiqlash navbatiga qo‘yildi."
    ][index % 5]!,
    type: index % 5 === 0 ? "reservation" : index % 5 === 1 ? "loan" : index % 5 === 2 ? "repository" : index % 5 === 3 ? "room" : "fine",
    isRead: index % 4 === 0,
    createdAt: isoOffset(-index)
  }));
}

function createAuditLogs(users: User[]): AuditLog[] {
  const actors = users.filter((user) => user.role !== "student");
  return Array.from({ length: 24 }, (_, index) => ({
    id: makeId("audit", index + 1),
    userId: actors[index % actors.length]!.id,
    action: [
      "ISSUE_LOAN",
      "RETURN_COPY",
      "PUBLISH_RECORD",
      "UPLOAD_RESOURCE",
      "APPROVE_REQUEST",
      "CONFIRM_FINE"
    ][index % 6]!,
    entity: ["Loan", "Copy", "BibliographicRecord", "DigitalResource", "AcquisitionRequest", "Fine"][index % 6]!,
    entityId: `${index + 1}`,
    details: "Demo audit trail entry for operational monitoring.",
    createdAt: isoOffset(-index)
  }));
}

export const demoAccounts: DemoAccount[] = [
  { label: "Student", email: "student@unilibrary.uz", password: "password123", role: "student" },
  { label: "Teacher", email: "teacher@unilibrary.uz", password: "password123", role: "teacher" },
  { label: "Librarian", email: "librarian@unilibrary.uz", password: "password123", role: "librarian" },
  { label: "Cataloger", email: "cataloger@unilibrary.uz", password: "password123", role: "cataloger" },
  { label: "Acquisition Manager", email: "acquisition@unilibrary.uz", password: "password123", role: "acquisitionManager" },
  { label: "Repository Manager", email: "repository@unilibrary.uz", password: "password123", role: "repositoryManager" },
  { label: "Admin", email: "admin@unilibrary.uz", password: "password123", role: "admin" },
  { label: "Super Admin", email: "superadmin@unilibrary.uz", password: "password123", role: "superAdmin" }
];

export function createSeedData(): LibraryDatabase {
  const demoStudent = {
    fullName: "Aziza Usmonova",
    email: "student@unilibrary.uz",
    studentId: "ST-2024001",
    group: "SE-21-1"
  };
  const demoTeacher = {
    fullName: "Bekzod To‘raev",
    email: "teacher@unilibrary.uz",
    employeeId: "EMP-8001"
  };
  const demoLibrarian = {
    fullName: "Nodira Qodirova",
    email: "librarian@unilibrary.uz",
    employeeId: "EMP-8100",
    faculty: "Library Services",
    department: "Circulation Desk"
  };
  const demoCataloger = {
    fullName: "Malika Ergasheva",
    email: "cataloger@unilibrary.uz",
    employeeId: "EMP-8200",
    faculty: "Library Services",
    department: "Cataloging"
  };
  const demoAcquisition = {
    fullName: "Jamshid Xasanov",
    email: "acquisition@unilibrary.uz",
    employeeId: "EMP-8300",
    faculty: "Library Services",
    department: "Acquisition"
  };
  const demoRepository = {
    fullName: "Sevara Hamidova",
    email: "repository@unilibrary.uz",
    employeeId: "EMP-8400",
    faculty: "Library Services",
    department: "Repository"
  };
  const demoAdmin = {
    fullName: "Olimjon Rahimov",
    email: "admin@unilibrary.uz",
    employeeId: "EMP-8500",
    faculty: "Administration",
    department: "Library IT"
  };
  const demoSuperAdmin = {
    fullName: "Shohruh Yusupov",
    email: "superadmin@unilibrary.uz",
    employeeId: "EMP-8600",
    faculty: "Administration",
    department: "Infrastructure"
  };

  const students = buildUsers("student", 80, 0, demoStudent);
  const teachers = buildUsers("teacher", 20, 80, demoTeacher);
  const librarians = buildUsers("librarian", 8, 100, demoLibrarian);
  const catalogers = buildUsers("cataloger", 4, 108, demoCataloger);
  const acquisitionManagers = buildUsers("acquisitionManager", 3, 112, demoAcquisition);
  const repositoryManagers = buildUsers("repositoryManager", 2, 115, demoRepository);
  const admins = buildUsers("admin", 2, 117, demoAdmin);
  const superAdmins = buildUsers("superAdmin", 1, 119, demoSuperAdmin);
  const users = [
    ...students,
    ...teachers,
    ...librarians,
    ...catalogers,
    ...acquisitionManagers,
    ...repositoryManagers,
    ...admins,
    ...superAdmins
  ];

  const branches = createBranches();
  const rooms = createRooms(branches);
  const seats = createSeats(rooms);
  const records = createRecords(catalogers[0]!.id);
  const copies = createCopies(records, branches, rooms);
  const digitalResources = createDigitalResources(records, repositoryManagers[0]!.id);
  const loans = createLoans(users, copies, librarians[0]!.id);
  const reservations = createReservations(users, records, copies);
  const fines = createFines(loans);
  const vendors = createVendors();
  const bookings = createBookings(users, rooms, seats);
  const acquisitionRequests = createRequests(users, vendors);
  const notifications = createNotifications(users);
  const auditLogs = createAuditLogs(users);

  return {
    users,
    branches,
    rooms,
    seats,
    records,
    copies,
    digitalResources,
    resourceAccessRequests: [],
    loans,
    reservations,
    fines,
    bookings,
    acquisitionRequests,
    vendors,
    notifications,
    auditLogs,
    aiChats: [],
    aiRecommendations: [],
    readingPlans: [],
    quizzes: [],
    flashcards: [],
    bibliographyItems: [],
    aiUsageLogs: [],
    biometricProfiles: [],
    biometricConsents: [],
    biometricAuditLogs: [],
    passkeyCredentials: [],
    identityRiskFlags: [],
    identityVerificationRecords: [],
    identitySettings: {
      faceIdLoginEnabled: true,
      faceIdCirculationVerificationEnabled: true,
      qrCardLoginEnabled: true,
      passkeyEnabled: true,
      requireLivenessCheck: true,
      livenessThreshold: 0.82,
      maxFailedAttempts: 3,
      biometricRetentionDays: 365,
      manualFallbackEnabled: true
    }
  };
}
