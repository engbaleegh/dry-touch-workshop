import { PrismaClient, BookingStatus, ServiceCategory } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays } from "date-fns";

const prisma = new PrismaClient();

const DEFAULT_SERVICES = [
  {
    nameAr: "ميكانيكا",
    nameEn: "Mechanical",
    description: "صيانة ميكانيكية عامة",
    estimatedDuration: 90,
    category: ServiceCategory.MECHANICAL,
  },
  {
    nameAr: "كهرباء",
    nameEn: "Electrical",
    description: "إصلاح الأنظمة الكهربائية",
    estimatedDuration: 120,
    category: ServiceCategory.ELECTRICAL,
  },
  {
    nameAr: "دهان",
    nameEn: "Paint",
    description: "خدمات الدهان والطلاء",
    estimatedDuration: 180,
    category: ServiceCategory.PAINT,
  },
  {
    nameAr: "سمكرة",
    nameEn: "Body Repair",
    description: "إصلاح الهيكل والسمكرة",
    estimatedDuration: 150,
    category: ServiceCategory.BODY_REPAIR,
  },
  {
    nameAr: "تنظيف بالثلج الجاف",
    nameEn: "Dry Ice Cleaning",
    description: "تنظيف جاف بالثلج الجاف",
    estimatedDuration: 120,
    category: ServiceCategory.DRY_ICE_CLEANING,
  },
  {
    nameAr: "تغيير زيت",
    nameEn: "Oil Change",
    description: "تغيير زيت وفلتر",
    estimatedDuration: 60,
    category: ServiceCategory.OIL_CHANGE,
  },
  {
    nameAr: "فحص",
    nameEn: "Inspection",
    description: "فحص دوري شامل",
    estimatedDuration: 45,
    category: ServiceCategory.INSPECTION,
  },
  {
    nameAr: "أخرى",
    nameEn: "Other",
    description: "خدمات أخرى",
    estimatedDuration: 60,
    category: ServiceCategory.OTHER,
  },
];

async function seedServices() {
  const count = await prisma.service.count();
  if (count > 0) return;

  for (const s of DEFAULT_SERVICES) {
    await prisma.service.create({
      data: {
        nameAr: s.nameAr,
        nameEn: s.nameEn,
        description: s.description,
        estimatedDuration: s.estimatedDuration,
        isActive: true,
      },
    });
  }
  console.log("Default services seeded.");
}

async function main() {
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD ??
    (process.env.NODE_ENV === "production" ? undefined : "admin123");

  if (!adminPassword) {
    throw new Error(
      "SEED_ADMIN_PASSWORD must be set when seeding in production"
    );
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: { password: passwordHash, isActive: true, role: "ADMIN" },
    create: {
      username: "admin",
      password: passwordHash,
      isActive: true,
      role: "ADMIN",
    },
  });

  await seedServices();

  const existing = await prisma.booking.count();
  if (existing > 0) {
    console.log("Bookings already exist, skipping sample bookings.");
    return;
  }

  const services = await prisma.service.findMany();
  const byCategory = Object.fromEntries(
    DEFAULT_SERVICES.map((s, i) => [s.category, services[i]?.id])
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const samples = [
    {
      bookingNumber: "DT-20250601-001",
      customerName: "أحمد محمد",
      phone: "0501234567",
      plateNumber: "أ ب ج 1234",
      vehicleMake: "Toyota",
      vehicleModel: "Camry",
      vehicleYear: 2022,
      serviceCategory: ServiceCategory.OIL_CHANGE,
      serviceDescription: "تغيير زيت وفلتر",
      serviceId: byCategory[ServiceCategory.OIL_CHANGE],
      bookingDate: today,
      bookingTime: "09:00",
      estimatedDuration: 60,
      status: BookingStatus.CONFIRMED,
    },
    {
      bookingNumber: "DT-20250601-002",
      customerName: "سارة علي",
      phone: "0559876543",
      plateNumber: "د هـ و 5678",
      vehicleMake: "Hyundai",
      vehicleModel: "Tucson",
      vehicleYear: 2021,
      serviceCategory: ServiceCategory.MECHANICAL,
      serviceDescription: "فحص مكابح وصيانة عامة",
      serviceId: byCategory[ServiceCategory.MECHANICAL],
      bookingDate: today,
      bookingTime: "11:00",
      estimatedDuration: 90,
      status: BookingStatus.IN_PROGRESS,
    },
    {
      bookingNumber: "DT-20250602-001",
      customerName: "خالد العتيبي",
      phone: "0541112233",
      plateNumber: "ز ح ط 9012",
      vehicleMake: "BMW",
      vehicleModel: "X5",
      vehicleYear: 2020,
      serviceCategory: ServiceCategory.DRY_ICE_CLEANING,
      serviceDescription: "تنظيف جاف بالثلج الجاف",
      serviceId: byCategory[ServiceCategory.DRY_ICE_CLEANING],
      bookingDate: addDays(today, 1),
      bookingTime: "10:00",
      estimatedDuration: 120,
      status: BookingStatus.PENDING,
    },
    {
      bookingNumber: "DT-20250603-001",
      customerName: "نورة السعيد",
      phone: "0534445566",
      plateNumber: "ي ك ل 3456",
      vehicleMake: "Mercedes",
      vehicleModel: "C200",
      vehicleYear: 2019,
      serviceCategory: ServiceCategory.PAINT,
      serviceDescription: "إصلاح خدوش وطلاء جزئي",
      serviceId: byCategory[ServiceCategory.PAINT],
      bookingDate: addDays(today, 2),
      bookingTime: "14:00",
      estimatedDuration: 180,
      status: BookingStatus.CONFIRMED,
    },
    {
      bookingNumber: "DT-20250528-001",
      customerName: "فهد القحطاني",
      phone: "0567778899",
      plateNumber: "م ن س 7890",
      vehicleMake: "Nissan",
      vehicleModel: "Patrol",
      vehicleYear: 2023,
      serviceCategory: ServiceCategory.INSPECTION,
      serviceDescription: "فحص دوري شامل",
      serviceId: byCategory[ServiceCategory.INSPECTION],
      bookingDate: addDays(today, -3),
      bookingTime: "08:30",
      estimatedDuration: 45,
      status: BookingStatus.COMPLETED,
    },
    {
      bookingNumber: "DT-20250527-001",
      customerName: "ريم الحربي",
      phone: "0512223344",
      plateNumber: "ع ف ق 1122",
      vehicleMake: "Kia",
      vehicleModel: "Sportage",
      vehicleYear: 2018,
      serviceCategory: ServiceCategory.ELECTRICAL,
      serviceDescription: "إصلاح نظام كهربائي",
      serviceId: byCategory[ServiceCategory.ELECTRICAL],
      bookingDate: addDays(today, -4),
      bookingTime: "15:00",
      estimatedDuration: 120,
      status: BookingStatus.CANCELLED,
      notes: "ألغى العميل الموعد",
    },
  ];

  for (const sample of samples) {
    await prisma.booking.create({ data: sample });
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
