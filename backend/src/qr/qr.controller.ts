import { Controller, Post, Param, Body, Req } from '@nestjs/common';
import { QrService } from './qr.service';

@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Post(':qrData/scan')
  async scanQr(
    @Param('qrData') qrData: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const locationData = {
      city: body.city,
      state: body.state,
      country: body.country,
      ipAddress: req.ip || body.ipAddress,
      userAgent: req.headers['user-agent'],
    };

    return this.qrService.recordScan(qrData, locationData);
  }
}
