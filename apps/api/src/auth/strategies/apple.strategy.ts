import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('APPLE_CLIENT_ID'),
      teamID: configService.get<string>('APPLE_TEAM_ID'),
      keyID: configService.get<string>('APPLE_KEY_ID'),
      privateKeyString: configService.get<string>('APPLE_PRIVATE_KEY'),
      callbackURL: '/api/auth/apple/callback',
      scope: ['email', 'name'],
    });
  }

  async validate(accessToken: string, refreshToken: string, idToken: string, profile: any, done: Function) {
    const user = {
      id: profile.id,
      email: profile.email,
      name: profile.name?.givenName + ' ' + profile.name?.familyName,
      accessToken,
    };
    done(null, user);
  }
}

