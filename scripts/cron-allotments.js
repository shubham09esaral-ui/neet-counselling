import "dotenv/config";
import cron from "node-cron";
import { processAllotmentBatch } from "./sync-allotments-data.js";

const CRON_SCHEDULE = process.env.ALLOTMENT_CRON_SCHEDULE ?? "* * * * *";
const RECORDS_PER_TICK = Number(process.env.ALLOTMENT_RECORDS_PER_TICK ?? 4);

let isRunning = false;

async function runTick() {
  if (isRunning) {
    console.log("[cron] Previous tick still running, skipping this minute.");
    return;
  }

  isRunning = true;

  try {
    console.log(
      `\n[cron] ${new Date().toISOString()} — processing up to ${RECORDS_PER_TICK} record(s) for active counselling...`,
    );

    const result = await processAllotmentBatch(RECORDS_PER_TICK);

    if (result.counsellingId) {
      console.log(
        `[cron] counselling_id=${result.counsellingId}${result.counsellingName ? ` (${result.counsellingName})` : ""}`,
      );
    }

    if (result.results) {
      for (const [i, r] of result.results.entries()) {
        console.log(`[cron] [${i + 1}/${result.recordsProcessed}] ${r.message}`);
      }
    } else {
      console.log(`[cron] ${result.message}`);
    }

    console.log(
      `[cron] Tick finished — ${result.recordsProcessed ?? 0} record(s), ${result.saved ?? 0} allotments saved.`,
    );

    if (result.nextCounsellingId) {
      console.log(
        `[cron] Next tick → counselling_id=${result.nextCounsellingId} (${result.nextCounsellingName})`,
      );
    }
    if (result.done) {
      console.log("[cron] All counsellings complete.");
    }
  } catch (error) {
    console.error("[cron] Tick failed:", error.message);
  } finally {
    isRunning = false;
  }
}

console.log("Allotment cron scheduler started.");
console.log(`Schedule: "${CRON_SCHEDULE}" (every minute)`);
console.log(`Records per tick: ${RECORDS_PER_TICK}`);
console.log(
  "Picks counselling ids from Counselling table (asc). When one is done, moves to the next automatically.\n",
);

cron.schedule(CRON_SCHEDULE, runTick);
