import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Role, DonationStatus } from '@prisma/client';
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { QueryDonationDto } from './dto/query-donation.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('donations')
@ApiBearerAuth()
@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar doações com filtros' })
  findAll(@Query() query: QueryDonationDto) {
    return this.donationsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes da doação' })
  findOne(@Param('id') id: string) {
    return this.donationsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.DONOR, Role.ADMIN)
  @ApiOperation({ summary: 'Criar doação (Doador)' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateDonationDto) {
    return this.donationsService.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar doação' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
    @Body() dto: UpdateDonationDto,
  ) {
    return this.donationsService.update(id, userId, role, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Alterar status da doação' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
    @Body('status') status: DonationStatus,
  ) {
    return this.donationsService.updateStatus(id, userId, role, status);
  }

  @Patch(':id/reserve')
  @UseGuards(RolesGuard)
  @Roles(Role.RECEIVER)
  @ApiOperation({ summary: 'Reservar doação (Recebedor)' })
  reserve(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.donationsService.reserve(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar doação' })
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.donationsService.remove(id, userId, role);
  }
}
