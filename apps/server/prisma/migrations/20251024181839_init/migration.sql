-- CreateTable
CREATE TABLE "Voter" (
    "id" SERIAL NOT NULL,
    "nin" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "eligible" BOOLEAN NOT NULL DEFAULT false,
    "wallet" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Voter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Voter_nin_key" ON "Voter"("nin");
