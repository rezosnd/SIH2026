import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private usersService: UsersService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || 'PLACEHOLDER_CLIENT_ID',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'PLACEHOLDER_SECRET',
      callbackURL: process.env.GOOGLE_REDIRECT_URI || 'https://sih-2026-kiit.vercel.app/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { name, emails, photos } = profile;
    
    // Actually find or create the user in the database
    const dbUser = await this.usersService.findOrCreateGoogleUser(
      emails[0].value,
      name?.givenName || 'Google',
      name?.familyName || 'User'
    );

    const user = {
      ...dbUser,
      picture: photos?.[0]?.value,
      accessToken
    };
    
    done(null, user);
  }
}
