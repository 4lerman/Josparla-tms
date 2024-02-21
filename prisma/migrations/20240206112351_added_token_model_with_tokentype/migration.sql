-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('RESET_PASSWORD', 'EMAIL_VERIFICATION');

-- CreateTable
CREATE TABLE "Token" (
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "type" "TokenType" NOT NULL,
    "expirationTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
