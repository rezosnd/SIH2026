import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: any) {
    // Passport will redirect to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: any) {
    const user = req.user;
    
    // In production, we findOrCreate user by google email and generate a JWT
    const jwtResult = await this.authService.generateJwtForGoogleUser(user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Redirect to the frontend with the token
    res.redirect(`${frontendUrl}/auth/success?token=${jwtResult.access_token}`);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    return req.user;
  }

  // ONLY FOR DEVELOPMENT / SIH DEMO Purposes
  @Get('dev-login')
  async devLogin(@Req() req: any) {
    const role = (req.query.role || 'BEEKEEPER').toUpperCase();
    const nameMap: Record<string, string> = {
      BEEKEEPER: 'Demo Beekeeper',
      ADMIN: 'Demo Admin',
      KVIC: 'Demo KVIC Officer',
      PROCESSOR: 'Demo Processor',
    };
    const displayName = nameMap[role] || `Demo ${role}`;
    const emailMap: Record<string, string> = {
      BEEKEEPER: 'beekeeper@honeychain.local',
      ADMIN: 'admin@honeychain.gov.in',
      KVIC: 'kvic@honeychain.gov.in',
      PROCESSOR: 'processor@honeychain.local',
    };
    const email = emailMap[role] || `demo_${role.toLowerCase()}@honeychain.com`;

    // findOrCreate the user with correct role
    const user = await this.authService['usersService'].findOrCreateGoogleUser(
      email,
      displayName,
      role,
    );

    // Force role update if it changed in DB
    if (user.role !== role) {
      await this.authService['usersService']['prisma'].user.update({
        where: { id: user.id },
        data: { role },
      });
      user.role = role;
    }

    // Ensure BeekeeperProfile exists for BEEKEEPER demo user
    if (role === 'BEEKEEPER') {
      const existing = await this.authService['usersService']['prisma'].beekeeperProfile.findUnique({
        where: { userId: user.id },
      });
      if (!existing) {
        await this.authService['usersService']['prisma'].beekeeperProfile.create({
          data: { userId: user.id, name: displayName, farmLocation: 'Sundarbans Apiary' },
        });
      }
    }

    return this.authService.generateJwtForGoogleUser(user);
  }

}
