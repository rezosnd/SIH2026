import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private logger = new Logger(BlockchainService.name);

  // Minimal ABI required for interaction
  private abi = [
    "function registerBatch(string memory _batchId, string memory _location) public",
    "function addBatchEvent(string memory _batchId, string memory _eventType, string memory _location, string memory _ipfsHash) public"
  ];

  constructor(private prisma: PrismaService) {
    // Defaulting to Hardhat local node for development
    const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
    const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; 
    const CONTRACT_ADDRESS = process.env.BLOCKCHAIN_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, this.abi, this.wallet);
  }

  async recordBatchCreated(batchId: string, location: string) {
    try {
      this.logger.log(`Registering batch ${batchId} on-chain...`);
      const tx = await this.contract.registerBatch(batchId, location);
      
      // Update Prisma with pending tx hash
      await this.prisma.honeyBatch.update({
        where: { id: batchId },
        data: { txHash: tx.hash }
      });
      
      // Wait for confirmation in background
      tx.wait().then((receipt: any) => {
        this.logger.log(`Batch ${batchId} confirmed on block ${receipt.blockNumber}`);
      }).catch((err: any) => {
        this.logger.error(`Blockchain confirmation failed for ${batchId}`, err);
      });

      return tx.hash;
    } catch (error) {
      this.logger.error(`Failed to record batch ${batchId} on blockchain`, error);
      return null; // Graceful degradation if blockchain is down
    }
  }

  async recordSupplyChainEvent(batchId: string, eventType: string, location: string, ipfsHash: string = "") {
    try {
      this.logger.log(`Recording event ${eventType} for batch ${batchId} on-chain...`);
      const tx = await this.contract.addBatchEvent(batchId, eventType, location, ipfsHash);
      
      tx.wait().catch((err: any) => {
        this.logger.error(`Blockchain event confirmation failed for ${batchId}`, err);
      });

      return tx.hash;
    } catch (error) {
      this.logger.error(`Failed to record event ${eventType} for batch ${batchId} on blockchain`, error);
      return null;
    }
  }
}
