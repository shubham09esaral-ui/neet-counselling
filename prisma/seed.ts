import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const counsellings = [
  { id: 43, name: "All India UG - Medical & Dental" },
  { id: 84, name: "Andaman & Nicobar Islands - UG Medical" },
  { id: 51, name: "Andhra Pradesh Government Quota - UG Medical" },
  { id: 52, name: "Andhra Pradesh Management Quota - UG Medical" },
  { id: 85, name: "Arunachal Pradesh - UG Medical" },
  { id: 53, name: "Assam - UG Medical" },
  { id: 54, name: "Bihar - UG Medical" },
  { id: 56, name: "Chhattisgarh - UG Medical" },
  { id: 86, name: "Dadra & Nagar Haveli - UG Medical" },
  { id: 88, name: "Delhi - UG Medical" },
  { id: 57, name: "Goa - UG Medical" },
  { id: 58, name: "Gujarat - UG Medical" },
  { id: 59, name: "Haryana - UG Medical" },
  { id: 60, name: "Himachal Pradesh - UG Medical" },
  { id: 61, name: "Jammu & Kashmir - UG Medical" },
  { id: 62, name: "Jharkhand - UG Medical" },
  { id: 63, name: "Karnataka - UG Medical" },
  { id: 64, name: "Kerala - UG Medical" },
  { id: 65, name: "Madhya Pradesh - UG Medical" },
  { id: 66, name: "Maharashtra - UG Medical" },
  { id: 67, name: "Manipur - UG Medical" },
  { id: 125, name: "Meghalaya - UG Medical" },
  { id: 69, name: "NEIGRIHMS - UG Medical" },
  { id: 118, name: "Nagaland - UG Medical" },
  { id: 70, name: "Odisha - UG Medical" },
  { id: 71, name: "Pondicherry - UG Medical" },
  { id: 72, name: "Punjab - UG Medical" },
  { id: 75, name: "Tamil Nadu Government Quota - UG Medical" },
  { id: 76, name: "Tamil Nadu Management Quota - UG Medical" },
  { id: 77, name: "Telangana Government Quota - UG Medical" },
  { id: 78, name: "Telangana Management Quota - UG Medical" },
  { id: 79, name: "Tripura - UG Medical" },
  { id: 80, name: "Uttar Pradesh - UG Medical" },
  { id: 81, name: "Uttarakhand - UG Medical" },
  { id: 82, name: "West Bengal - UG Medical" },
] as const;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  for (const counselling of counsellings) {
    await prisma.counselling.upsert({
      where: { id: counselling.id },
      update: { name: counselling.name },
      create: counselling,
    });
  }

  console.log(`Seeded ${counsellings.length} counselling records`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
