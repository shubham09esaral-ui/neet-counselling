-- CreateTable
CREATE TABLE "neet_counselling_data" (
    "id" INTEGER NOT NULL,
    "counselling_id" INTEGER NOT NULL,
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
    "fee_id" INTEGER,
    "fee" TEXT,
    "stipend_year_1" TEXT,
    "bond_years" TEXT,
    "bond_penalty" TEXT,
    "beds" TEXT,
    "choice_list_count" INTEGER,
    "cr_2025_1" JSONB,
    "cr_2025_2" JSONB,
    "cr_2025_3" JSONB,
    "cr_2025_4" JSONB,
    "cr_2025_5" JSONB,
    "cr_2025_6" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "neet_counselling_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "neet_counselling_data_counselling_id_idx" ON "neet_counselling_data"("counselling_id");

-- CreateIndex
CREATE INDEX "neet_counselling_data_state_idx" ON "neet_counselling_data"("state");

-- CreateIndex
CREATE INDEX "neet_counselling_data_institute_id_idx" ON "neet_counselling_data"("institute_id");

-- AddForeignKey
ALTER TABLE "neet_counselling_data" ADD CONSTRAINT "neet_counselling_data_counselling_id_fkey" FOREIGN KEY ("counselling_id") REFERENCES "Counselling"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
