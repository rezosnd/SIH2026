import { Test, TestingModule } from '@nestjs/testing';
import { QrService } from './qr.service';
import { PrismaService } from '../prisma/prisma.service';

describe('QrService', () => {
  let service: QrService;
  let prismaMock: any;
  
  beforeEach(async () => {
    prismaMock = {
      batchContainer: {
        findUnique: jest.fn(),
      },
      qRScan: {
        create: jest.fn(),
      },
      notification: {
        create: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      }
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QrService,
        { provide: PrismaService, useValue: prismaMock }
      ],
    }).compile();

    service = module.get<QrService>(QrService);
  });

  it('should flag unrealistic geographic movement', async () => {
    const twoHoursAgo = new Date(Date.now() - 3600000); // 1 hr ago
    prismaMock.batchContainer.findUnique.mockResolvedValue({
      id: 'container_1',
      batchId: 'batch_1',
      scans: [
        { city: 'Delhi', timestamp: twoHoursAgo }
      ]
    });
    prismaMock.qRScan.create.mockImplementation((args: any) => Promise.resolve(args.data));

    const res = await service.recordScan('fake_qr', { city: 'Mumbai' });
    
    expect(res.status).toBe('SUSPICIOUS');
    expect(prismaMock.notification.create).toHaveBeenCalled();
  });
});
