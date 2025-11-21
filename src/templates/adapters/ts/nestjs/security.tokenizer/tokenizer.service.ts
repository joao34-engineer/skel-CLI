import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign, verify } from '@skel/{{PRIMITIVE_ID}}';

@Injectable()
export class TokenizerService {
  private readonly algorithm: 'HS256' | 'RS256';

  constructor(private readonly configService: ConfigService) {
    this.algorithm = this.configService.getOrThrow<'HS256' | 'RS256'>('JWT_ALGORITHM');
  }

  signToken(payload: string): string {
    try {
      return sign(payload, this.algorithm);
    } catch (error) {
      throw new BadRequestException(
        `Token signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  verifyToken(token: string): boolean {
    try {
      return verify(token, this.algorithm);
    } catch (error) {
      throw new UnauthorizedException(
        `Token verification failed: ${error instanceof Error ? error.message : 'Invalid token'}`
      );
    }
  }
}
