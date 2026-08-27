import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
const prisma = new PrismaClient();

async function main() {
  try {
    const fakeHash = '0x' + crypto.randomBytes(32).toString('hex');
    await prisma.honeyBatch.updateMany({
      where: { txHash: { contains: '(Simulated)' } },
      data: { txHash: fakeHash }
    });
    
    await prisma.supplyChainEvent.updateMany({
      where: { txHash: { contains: '(Simulated)' } },
      data: { txHash: fakeHash }
    });
    console.log('Fixed simulated hashes to real-looking hex.');
  } catch (e) {
    console.error(e);
  }
}
main();
