import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCharacterDto, UpdateCharacterDto } from './dto/character.dto';

@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('archetype') archetype?: string,
    @Query('isPremium') isPremium?: string,
    @Query('tags') tags?: string
  ) {
    return this.charactersService.findAll(
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 20,
      {
        archetype,
        isPremium: isPremium === 'true' ? true : isPremium === 'false' ? false : undefined,
        tags: tags ? tags.split(',') : undefined,
      }
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.charactersService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req, @Body() dto: CreateCharacterDto) {
    return this.charactersService.create(req.user.id, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req, @Param('id') id: string, @Body() dto: UpdateCharacterDto) {
    return this.charactersService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Req() req, @Param('id') id: string) {
    await this.charactersService.delete(req.user.id, id);
    return { success: true };
  }
}

