const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo data...');

  // Create a Cluster
  const cluster = await prisma.cluster.create({
    data: {
      name: 'Northeast Organic Honey Cluster',
      location: 'Shillong, Meghalaya',
      description: 'A cooperative of organic beekeepers in the northeast region.',
    },
  });

  console.log('Created Cluster:', cluster.name);

  // Dummy Beekeepers Data
  const beekeepers = [
    { name: 'Amit Sharma', email: 'amit.sharma@demo.com', location: 'Cherrapunji Hills', contact: '+91-9876543210' },
    { name: 'Rahul Verma', email: 'rahul.verma@demo.com', location: 'Dawki Riverside', contact: '+91-9876543211' },
    { name: 'Sunita Devi', email: 'sunita.devi@demo.com', location: 'Mawlynnong Village', contact: '+91-9876543212' },
  ];

  for (const b of beekeepers) {
    const user = await prisma.user.create({
      data: {
        email: b.email,
        password: 'password123',
        role: 'BEEKEEPER',
        clusterId: cluster.id,
        beekeeperProfile: {
          create: {
            name: b.name,
            farmLocation: b.location,
            contact: b.contact,
          }
        }
      },
      include: {
        beekeeperProfile: true,
      }
    });

    console.log(`Created Beekeeper: ${b.name}`);

    // Create 2 Hives for each beekeeper
    for (let i = 1; i <= 2; i++) {
      const hive = await prisma.hive.create({
        data: {
          beekeeperId: user.beekeeperProfile.id,
          location: `${b.location} - Sector ${i}`,
          status: 'ACTIVE',
        }
      });
      console.log(`  Created Hive: ${hive.location}`);

      // Create a batch for the first hive
      if (i === 1) {
        await prisma.honeyBatch.create({
          data: {
            beekeeperId: user.beekeeperProfile.id,
            hiveId: hive.id,
            quantity: 15.5 + Math.random() * 10,
            status: 'HARVESTED',
            qrData: `DEMO-QR-${user.beekeeperProfile.id.substring(0,4)}-${Math.floor(Math.random() * 1000)}`,
          }
        });
      }
    }
  }

  console.log('Seeding complete! KVIC Dashboard will now look amazing.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
