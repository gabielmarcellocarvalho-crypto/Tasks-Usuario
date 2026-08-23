import "dotenv/config";
import { resetDatabase, seedDemoData } from "../src/lib/seed";

async function main() {
  await resetDatabase();
  await seedDemoData();
  console.log("Demo data seeded.");
}

main();
