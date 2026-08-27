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
    const role = req.query.role || 'BEEKEEPER';
    const email = `demo_${role.toLowerCase()}@honeychain.com`;
    const user = await this.authService['usersService'].findOrCreateGoogleUser(
      email,
      'Demo',
      role
    );
    // Force role update if different (since findOrCreateGoogleUser creates BEEKEEPER by default)
    if (user.role !== role) {
      await this.authService['usersService']['prisma'].user.update({
        where: { id: user.id },
        data: { role: role }
      });
      user.role = role;
    }
    return this.authService.generateJwtForGoogleUser(user);
  }
}
