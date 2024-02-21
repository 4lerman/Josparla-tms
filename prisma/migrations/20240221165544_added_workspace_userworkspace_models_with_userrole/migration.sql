/*
  Warnings:

  - You are about to drop the `Token` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'USER');

-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_userId_fkey";

-- DropTable
DROP TABLE "Token";

-- CreateTable
CREATE TABLE "tokens" (
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "type" "TokenType" NOT NULL,
    "expirationTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaceusers" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "role" "UserRole" NOT NULL,

    CONSTRAINT "workspaceusers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaceusers" ADD CONSTRAINT "workspaceusers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaceusers" ADD CONSTRAINT "workspaceusers_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
