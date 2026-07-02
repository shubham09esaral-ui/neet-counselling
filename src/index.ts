import "dotenv/config";
import { prisma } from "./lib/prisma.js";

async function main() {
  await prisma.$connect();
  console.log("Connected to PostgreSQL via Prisma");
  console.log(`Database: neet_counselling`);
}

main()
  .catch((error) => {
    console.error("Failed to start:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
