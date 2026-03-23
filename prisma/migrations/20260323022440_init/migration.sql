/*
  Warnings:

  - You are about to drop the column `assignedAt` on the `Assigment` table. All the data in the column will be lost.
  - You are about to drop the column `mechanicId` on the `Assigment` table. All the data in the column will be lost.
  - You are about to drop the column `sosRequestId` on the `Assigment` table. All the data in the column will be lost.
  - The `status` column on the `Assigment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdAt` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `SOSRequest` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `SOSRequest` table. All the data in the column will be lost.
  - You are about to drop the column `vehicleId` on the `SOSRequest` table. All the data in the column will be lost.
  - You are about to drop the column `assignedAt` on the `ServiceLog` table. All the data in the column will be lost.
  - You are about to drop the column `mechanicId` on the `ServiceLog` table. All the data in the column will be lost.
  - You are about to drop the column `sosRequestId` on the `ServiceLog` table. All the data in the column will be lost.
  - The `status` column on the `ServiceLog` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isAvailable` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `plateNumber` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Vehicle` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sos_request_id]` on the table `Assigment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[plate_number]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mechanic_id` to the `Assigment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sos_request_id` to the `Assigment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `SOSRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicle_id` to the `SOSRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mechanic_id` to the `ServiceLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sos_request_id` to the `ServiceLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plate_number` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "Assigment" DROP CONSTRAINT "Assigment_mechanicId_fkey";

-- DropForeignKey
ALTER TABLE "Assigment" DROP CONSTRAINT "Assigment_sosRequestId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "SOSRequest" DROP CONSTRAINT "SOSRequest_userId_fkey";

-- DropForeignKey
ALTER TABLE "SOSRequest" DROP CONSTRAINT "SOSRequest_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceLog" DROP CONSTRAINT "ServiceLog_sosRequestId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_userId_fkey";

-- DropIndex
DROP INDEX "Assigment_sosRequestId_key";

-- DropIndex
DROP INDEX "Vehicle_plateNumber_key";

-- AlterTable
ALTER TABLE "Assigment" DROP COLUMN "assignedAt",
DROP COLUMN "mechanicId",
DROP COLUMN "sosRequestId",
ADD COLUMN     "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "mechanic_id" TEXT NOT NULL,
ADD COLUMN     "sos_request_id" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "createdAt",
DROP COLUMN "isRead",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SOSRequest" DROP COLUMN "createdAt",
DROP COLUMN "userId",
DROP COLUMN "vehicleId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD COLUMN     "vehicle_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ServiceLog" DROP COLUMN "assignedAt",
DROP COLUMN "mechanicId",
DROP COLUMN "sosRequestId",
ADD COLUMN     "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "mechanic_id" TEXT NOT NULL,
ADD COLUMN     "sos_request_id" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "isAvailable",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_available" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "createdAt",
DROP COLUMN "plateNumber",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "plate_number" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- DropEnum
DROP TYPE "AssigmentStatus";

-- CreateIndex
CREATE UNIQUE INDEX "Assigment_sos_request_id_key" ON "Assigment"("sos_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plate_number_key" ON "Vehicle"("plate_number");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SOSRequest" ADD CONSTRAINT "SOSRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SOSRequest" ADD CONSTRAINT "SOSRequest_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assigment" ADD CONSTRAINT "Assigment_sos_request_id_fkey" FOREIGN KEY ("sos_request_id") REFERENCES "SOSRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assigment" ADD CONSTRAINT "Assigment_mechanic_id_fkey" FOREIGN KEY ("mechanic_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceLog" ADD CONSTRAINT "ServiceLog_sos_request_id_fkey" FOREIGN KEY ("sos_request_id") REFERENCES "SOSRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
