import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req) {
    return req.user;
  }

  @Put('preferences')
  async updatePreferences(@Req() req, @Body() dto: UpdatePreferencesDto) {
    return this.usersService.updatePreferences(req.user.id, dto);
  }
}

