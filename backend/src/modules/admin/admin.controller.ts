import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Métricas do dashboard' })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('reports')
  @ApiOperation({ summary: 'Relatórios' })
  getReports(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getReports({ startDate, endDate });
  }

  @Get('logs')
  @ApiOperation({ summary: 'Logs de auditoria' })
  getLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getLogs({ page, limit });
  }

  @Get('reports/export')
  @ApiOperation({ summary: 'Exportar relatório CSV' })
  async exportReports(@Res() res: Response) {
    const csv = await this.adminService.exportReportsCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio-doacoes.csv');
    res.send(csv);
  }
}
