-- CreateTable
CREATE TABLE "allotments_table_data" (
    "id" INTEGER NOT NULL,
    "neet_counselling_data_id" INTEGER NOT NULL,
    "counselling_id" INTEGER NOT NULL,
    "session" TEXT,
    "round" TEXT,
    "rank" INTEGER,
    "ai_rank" INTEGER,
    "counselling_rank" INTEGER,
    "state" TEXT,
    "category" TEXT,
    "institute_id" INTEGER,
    "institute_name" TEXT,
    "institute_short_name" TEXT,
    "institute_logo_url" TEXT,
    "institute_district" TEXT,
    "course_id" INTEGER,
    "course_name" TEXT,
    "course_short_name" TEXT,
    "quota_id" INTEGER,
    "quota_name" TEXT,
    "quota_short_name" TEXT,
    "quota_tooltip_content" TEXT,
    "quota_tooltip_content_html" TEXT,
    "quota_master_quota" TEXT,
    "inservice_candidate" BOOLEAN,
    "candidate_flag" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allotments_table_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "allotments_table_data_neet_counselling_data_id_idx" ON "allotments_table_data"("neet_counselling_data_id");

-- CreateIndex
CREATE INDEX "allotments_table_data_counselling_id_idx" ON "allotments_table_data"("counselling_id");

-- CreateIndex
CREATE INDEX "allotments_table_data_institute_id_idx" ON "allotments_table_data"("institute_id");

-- CreateIndex
CREATE INDEX "allotments_table_data_round_session_idx" ON "allotments_table_data"("round", "session");

-- AddForeignKey
ALTER TABLE "allotments_table_data" ADD CONSTRAINT "allotments_table_data_neet_counselling_data_id_fkey" FOREIGN KEY ("neet_counselling_data_id") REFERENCES "neet_counselling_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allotments_table_data" ADD CONSTRAINT "allotments_table_data_counselling_id_fkey" FOREIGN KEY ("counselling_id") REFERENCES "Counselling"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
