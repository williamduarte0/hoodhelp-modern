import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceFiltersDto } from './dto/service-filters.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createServiceDto: CreateServiceDto, @Request() req) {
    return this.servicesService.create(createServiceDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query() filters: ServiceFiltersDto, @Request() req) {
    let userLocation: { latitude: number; longitude: number; range: number } | undefined;
    
    if (req.user && req.user.location && req.user.locationRange) {
      userLocation = {
        latitude: req.user.location.latitude,
        longitude: req.user.location.longitude,
        range: req.user.locationRange
      };
    }

    return this.servicesService.findAll(filters, userLocation);
  }

  @Get('my-services')
  @UseGuards(JwtAuthGuard)
  findMyServices(@Request() req) {
    return this.servicesService.findByUser(req.user.userId);
  }

  @Get('categories')
  getCategories() {
    return this.servicesService.getCategories();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto, @Request() req) {
    return this.servicesService.update(id, updateServiceDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.servicesService.remove(id, req.user.userId);
  }

  @Post(':id/apply')
  @UseGuards(JwtAuthGuard)
  applyToService(@Param('id') id: string, @Request() req) {
    return this.servicesService.applyToService(id, req.user.userId);
  }

  @Post(':id/select-applicant/:applicantId')
  @UseGuards(JwtAuthGuard)
  selectApplicant(@Param('id') id: string, @Param('applicantId') applicantId: string, @Request() req) {
    return this.servicesService.selectApplicant(id, applicantId, req.user.userId);
  }
}
