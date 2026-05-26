import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ReviewsService } from './reviews.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('reviews')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('donation/:id')
  @ApiOperation({ summary: 'Reviews de uma doação' })
  findByDonation(@Param('id') id: string) {
    return this.reviewsService.findByDonation(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.DONOR, Role.RECEIVER)
  @ApiOperation({ summary: 'Criar review' })
  create(
    @CurrentUser('id') authorId: string,
    @Body() body: { targetId: string; donationId: string; rating: number; comment?: string },
  ) {
    return this.reviewsService.create(authorId, body);
  }
}
