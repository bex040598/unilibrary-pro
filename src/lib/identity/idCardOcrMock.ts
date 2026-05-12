export type OcrConfidence = "high" | "medium" | "low";

export type OcrField = {
  value: string;
  confidence: OcrConfidence;
};

export type OcrPayload = {
  fullName: OcrField;
  studentId: OcrField;
  faculty: OcrField;
  department: OcrField;
  group: OcrField;
  expiryDate: OcrField;
};

const ocrProfiles = [
  {
    fullName: "Aziza Usmonova",
    studentId: "ST-2024001",
    faculty: "Axborot texnologiyalari",
    department: "Dasturiy injiniring",
    group: "SE-24-1"
  },
  {
    fullName: "Sardor Karimov",
    studentId: "ST-2024058",
    faculty: "Iqtisodiyot",
    department: "Raqamli iqtisodiyot",
    group: "DE-23-2"
  },
  {
    fullName: "Dilnoza Rahimova",
    studentId: "ST-2024094",
    faculty: "Pedagogika",
    department: "Pedagogik innovatsiyalar",
    group: "PG-24-3"
  }
];

export function parseIdCardOcrMock(fileName: string) {
  const seed = fileName.toLowerCase();
  const profile =
    seed.includes("iqtisod")
      ? ocrProfiles[1]!
      : seed.includes("ped")
        ? ocrProfiles[2]!
        : ocrProfiles[0]!;

  return {
    fullName: { value: profile.fullName, confidence: "high" },
    studentId: { value: profile.studentId, confidence: "high" },
    faculty: { value: profile.faculty, confidence: "medium" },
    department: { value: profile.department, confidence: "medium" },
    group: { value: profile.group, confidence: "medium" },
    expiryDate: { value: "2028-06-30", confidence: "low" }
  } satisfies OcrPayload;
}
