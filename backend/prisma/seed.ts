import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');
  
  // Clean up existing data (in a specific order due to constraints)
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.qRScan.deleteMany();
  await prisma.qualityRecord.deleteMany();
  await prisma.supplyChainEvent.deleteMany();
  await prisma.batchContainer.deleteMany();
  await prisma.honeyBatch.deleteMany();
  await prisma.hive.deleteMany();
  await prisma.beekeeperProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.cluster.deleteMany();

  // Create Clusters
  const clusterKhurda = await prisma.cluster.create({
    data: {
      name: 'Khurda Honey Cluster',
      location: 'Odisha, India',
      description: 'Primary testing cluster for HoneyChain.',
    },
  });

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@honeychain.gov.in',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const kvicUser = await prisma.user.create({
    data: {
      email: 'kvic@honeychain.gov.in',
      password: hashedPassword,
      role: 'KVIC',
    },
  });

  const beekeeperUser = await prisma.user.create({
    data: {
      email: 'beekeeper@honeychain.local',
      password: hashedPassword,
      role: 'BEEKEEPER',
      clusterId: clusterKhurda.id,
      beekeeperProfile: {
        create: {
          name: 'Subodh Kumar',
          farmLocation: 'Village 1, Khurda',
          contact: '+919876543210',
        },
      },
    },
    include: {
      beekeeperProfile: true,
    },
  });

  // Create Hives
  const hive1 = await prisma.hive.create({
    data: {
      beekeeperId: beekeeperUser.beekeeperProfile!.id,
      location: 'Forest Edge Sector A',
      status: 'ACTIVE',
    },
  });

  const hive2 = await prisma.hive.create({
    data: {
      beekeeperId: beekeeperUser.beekeeperProfile!.id,
      location: 'River Bank Sector B',
      status: 'ACTIVE',
    },
  });

  // Create Honey Batch
  const qrData1 = 'QR-2026-000001';
  const batch1 = await prisma.honeyBatch.create({
    data: {
      beekeeperId: beekeeperUser.beekeeperProfile!.id,
      hiveId: hive1.id,
      status: 'HARVESTED',
      quantity: 50, // 50kg
      qrData: 'HNY-2026-0001',
      txHash: '0x99a98... (Simulated)',
    },
  });

  // Create Containers for Batch
  const container1 = await prisma.batchContainer.create({
    data: {
      batchId: batch1.id,
      qrData: qrData1,
      containerSize: 1, // 1kg
    },
  });

  // Add Events
  await prisma.supplyChainEvent.create({
    data: {
      batchId: batch1.id,
      eventType: 'HARVESTED',
      userId: beekeeperUser.id,
      description: 'Harvested from Forest Edge Sector A',
      location: 'Khurda, Odisha',
    },
  });

  await prisma.supplyChainEvent.create({
    data: {
      batchId: batch1.id,
      eventType: 'QUALITY_CHECKED',
      userId: admin.id,
      description: 'Passed Moisture and HMF Check',
      location: 'Regional Testing Lab',
    },
  });

  // Simulate a QR Scan
  await prisma.qRScan.create({
    data: {
      containerId: container1.id,
      city: 'Bhubaneswar',
      state: 'Odisha',
      country: 'India',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X)',
      isSuspicious: false,
    },
  });

  console.log('Seeding completed successfully!');
  console.log('--- Test Accounts ---');
  console.log('Admin: admin@honeychain.gov.in / password123');
  console.log('Beekeeper: beekeeper@honeychain.local / password123');
  console.log('KVIC: kvic@honeychain.gov.in / password123');
  console.log(`Test QR Code for scanning: ${qrData1}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
