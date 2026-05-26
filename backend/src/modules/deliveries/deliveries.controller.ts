import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role, DeliveryStatus } from '@prisma/client';
import { DeliveriesService } from './deliveries.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('deliveries')
@ApiBearerAuth()
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VOLUNTEER)
  @ApiOperation({ summary: 'Listar entregas' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('volunteerId') volunteerId?: string,
    @Query('status') status?: DeliveryStatus,
  ) {
    return this.deliveriesService.findAll({ page, limit, volunteerId, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes da entrega' })
  findOne(@Param('id') id: string) {
    return this.deliveriesService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.VOLUNTEER)
  @ApiOperation({ summary: 'Aceitar entrega (Voluntário)' })
  acceptDelivery(
    @Body('donationId') donationId: string,
    @CurrentUser('id') volunteerId: string,
  ) {
    return this.deliveriesService.acceptDelivery(donationId, volunteerId);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.VOLUNTEER, Role.ADMIN)
  @ApiOperation({ summary: 'Atualizar status da entrega' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
    @Body('status') status: DeliveryStatus,
  ) {
    return this.deliveriesService.updateStatus(id, userId, role, status);
  }
}
