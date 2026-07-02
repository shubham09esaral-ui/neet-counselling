import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const PAGE_SIZE = 50;
const API_BASE = "https://infra.zynerd.com/api_v2/closing_ranks/table_data";

const DISPLAYED_FIELDS = [
  "quota",
  "category",
  "state",
  "institute",
  "course",
  "fee",
  "beds",
  "bond_years",
  "bond_penalty",
  "stipend_year_1",
  "cr_2025_1",
  "cr_2025_2",
  "cr_2025_3",
  "cr_2025_4",
  "cr_2025_5",
  "cr_2025_6",
];

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

function getAuthToken() {
  const token = process.env.ZYNERD_AUTH_TOKEN;
  if (!token) {
    throw new Error(
      "ZYNERD_AUTH_TOKEN is missing. Add it to your .env file.",
    );
  }
  return token;
}

function extractRecords(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.table_data)) return response.table_data;
  if (Array.isArray(response?.records)) return response.records;
  if (Array.isArray(response?.data?.records)) return response.data.records;
  if (Array.isArray(response?.data?.table_data)) return response.data.table_data;
  return [];
}

function mapClosingRank(rank) {
  if (!rank || typeof rank !== "object") return null;
  return {
    value: rank.value ?? null,
    session: rank.session ?? null,
    round: rank.round ?? null,
    closing_rank: rank.closing_rank ?? null,
    counselling_rank: rank.counselling_rank ?? null,
    ai_rank: rank.ai_rank ?? null,
    allotments_count: rank.allotments_count ?? null,
    inservice_candidate: rank.inservice_candidate ?? null,
    candidate_flag: rank.candidate_flag ?? null,
  };
}

function mapRecordToDb(record) {
  const counselling = record.counselling ?? {};

  return {
    id: record.id,
    counsellingId: counselling.id,
    state: record.state ?? null,
    category: record.category ?? null,
    institute: record.institute ?? null,
    course: record.course ?? null,
    quota: record.quota ?? null,
    feeId: record.fee_id ?? null,
    fee: record.fee ?? null,
    stipendYear1: record.stipend_year_1 ?? null,
    bondYears: record.bond_years ?? null,
    bondPenalty: record.bond_penalty ?? null,
    beds: record.beds ?? null,
    choiceListCount: record.choice_list_count ?? null,
    cr2025Round1: mapClosingRank(record.cr_2025_1),
    cr2025Round2: mapClosingRank(record.cr_2025_2),
    cr2025Round3: mapClosingRank(record.cr_2025_3),
    cr2025Round4: mapClosingRank(record.cr_2025_4),
    cr2025Round5: mapClosingRank(record.cr_2025_5),
    cr2025Round6: mapClosingRank(record.cr_2025_6),
    counsellingMeta: {
      id: counselling.id,
      name: counselling.name ?? counselling.short_name ?? `Counselling ${counselling.id}`,
    },
  };
}

async function ensureCounselling(counselling) {
  if (!counselling?.id) {
    throw new Error("Record is missing counselling.id");
  }

  await prisma.counselling.upsert({
    where: { id: counselling.id },
    update: { name: counselling.name },
    create: {
      id: counselling.id,
      name: counselling.name,
    },
  });
}

async function saveRecord(record) {
  const mapped = mapRecordToDb(record);

  await ensureCounselling(mapped.counsellingMeta);

  const { counsellingMeta, ...data } = mapped;

  await prisma.neetCounsellingData.upsert({
    where: { id: data.id },
    update: data,
    create: data,
  });
}

async function fetchPage(counsellingId, offset, authToken) {
  const url = `${API_BASE}?counselling_id=${counsellingId}&offset=${offset}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json, text/plain, */*",
      "app-type": "web",
      authorization: authToken,
      "content-type": "application/json",
      origin: "https://www.zynerd.com",
      referer: "https://www.zynerd.com/",
    },
    body: JSON.stringify({
      has_joined: false,
      displayed_fields: DISPLAYED_FIELDS,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API failed (${response.status}): ${body.slice(0, 300)}`);
  }

  return response.json();
}

export async function syncCounsellingData(counsellingId) {
  const authToken = getAuthToken();
  let offset = 0;
  let totalSaved = 0;

  console.log(`Syncing counselling_id=${counsellingId}...`);

  while (true) {
    console.log(`Fetching offset=${offset}...`);
    const payload = await fetchPage(counsellingId, offset, authToken);
    const records = extractRecords(payload);

    if (records.length === 0) {
      console.log("No more records. Sync complete.");
      break;
    }

    for (const record of records) {
      await saveRecord(record);
      totalSaved += 1;
    }

    console.log(`Saved ${records.length} records (total: ${totalSaved})`);

    if (records.length < PAGE_SIZE) {
      console.log("Last page reached. Sync complete.");
      break;
    }

    offset += PAGE_SIZE;
  }

  return totalSaved;
}

export async function syncAllCounsellings() {
  const counsellings = await prisma.counselling.findMany({
    orderBy: { id: "asc" },
  });

  if (counsellings.length === 0) {
    throw new Error(
      "No counselling records found. Run npm run db:seed first.",
    );
  }

  console.log(`Found ${counsellings.length} counselling(s) to sync (asc order)...\n`);

  let grandTotal = 0;

  for (const [index, counselling] of counsellings.entries()) {
    console.log(
      `\n========== [${index + 1}/${counsellings.length}] counselling_id=${counselling.id} — ${counselling.name} ==========`,
    );

    const saved = await syncCounsellingData(counselling.id);
    grandTotal += saved;
    console.log(
      `Finished counselling_id=${counselling.id}: ${saved} records saved.`,
    );
  }

  console.log(
    `\nAll done. ${grandTotal} total records saved across ${counsellings.length} counselling(s).`,
  );

  return grandTotal;
}

async function main() {
  const singleId = process.env.COUNSELLING_ID
    ? Number(process.env.COUNSELLING_ID)
    : null;

  if (singleId != null) {
    if (!Number.isInteger(singleId)) {
      throw new Error("COUNSELLING_ID must be an integer");
    }
    const totalSaved = await syncCounsellingData(singleId);
    console.log(`Done. ${totalSaved} records saved for counselling_id=${singleId}`);
    return;
  }

  await syncAllCounsellings();
}

const isDirectRun = process.argv[1]?.includes("sync-counselling-data");

if (isDirectRun) {
  main()
    .catch((error) => {
      console.error("Sync failed:", error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
