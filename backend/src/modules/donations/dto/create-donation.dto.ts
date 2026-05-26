import { IsString, IsOptional, IsInt, Min, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDonationDto {
  @ApiProperty({ example: 'Roupas de inverno' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Roupas em bom estado para doação' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'uuid-da-categoria' })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ example: 'Rua das Flores, 123 - São Paulo, SP' })
  @IsOptional()
  @IsString()
  locationText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}
