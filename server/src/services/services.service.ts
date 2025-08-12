import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceFiltersDto } from './dto/service-filters.dto';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createServiceDto: CreateServiceDto, userId: string): Promise<Service> {
    const user = await this.userModel.findById(userId).exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.location) {
      throw new BadRequestException('User must have a location set to create services');
    }

    const objectIdUserId = new Types.ObjectId(userId);

    const service = new this.serviceModel({
      ...createServiceDto,
      requesterId: objectIdUserId,
      location: user.location,
    });

    const savedService = await service.save();
    
    return savedService;
  }

  async findAll(filters: ServiceFiltersDto = {}, userLocation?: { latitude: number; longitude: number; range: number }): Promise<Service[]> {
    const query: any = {};

    if (filters.category && filters.category.length > 0) {
      query.category = { $in: filters.category };
    }

    if (filters.minBudget || filters.maxBudget) {
      query.budget = {};
      if (filters.minBudget) query.budget.$gte = filters.minBudget;
      if (filters.maxBudget) query.budget.$lte = filters.maxBudget;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    let services = await this.serviceModel
      .find(query)
      .populate('requesterId', 'name email')
      .sort({ createdAt: -1 })
      .exec();

    if (userLocation && userLocation.latitude && userLocation.longitude && userLocation.range) {
      services = services.filter(service => {
        if (!service.location || !service.location.latitude || !service.location.longitude) {
          return false;
        }

        const distance = this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          service.location.latitude,
          service.location.longitude
        );

        return distance <= userLocation.range;
      });
    }

    return services;
  }

  async findByUser(userId: string): Promise<Service[]> {
    let objectIdUserId;
    try {
      objectIdUserId = new Types.ObjectId(userId);
    } catch (error) {
      throw new BadRequestException('Invalid user ID format');
    }
    
    const services = await this.serviceModel
      .find({ requesterId: objectIdUserId })
      .populate('requesterId', 'name email')
      .sort({ createdAt: -1 })
      .exec();
    
    return services;
  }

  /**
   * Calculate distance between two points using Haversine formula
   * @param lat1 - Latitude of first point
   * @param lon1 - Longitude of first point
   * @param lat2 - Latitude of second point
   * @param lon2 - Longitude of second point
   * @returns Distance in kilometers
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceModel
      .findById(id)
      .populate('requesterId', 'name email')
      .populate('applicants', 'name email')
      .populate('selectedApplicant', 'name email')
      .exec();

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto, userId: string): Promise<Service> {
    const service = await this.serviceModel.findById(id).exec();
    
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.requesterId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own services');
    }

    const updatedService = await this.serviceModel
      .findByIdAndUpdate(id, updateServiceDto, { new: true })
      .populate('requesterId', 'name email')
      .exec();

    return updatedService as Service;
  }

  async remove(id: string, userId: string): Promise<void> {
    const service = await this.serviceModel.findById(id).exec();
    
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.requesterId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own services');
    }

    await this.serviceModel.findByIdAndDelete(id).exec();
  }

  async applyToService(serviceId: string, userId: string): Promise<Service> {
    const service = await this.serviceModel.findById(serviceId).exec();
    
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.requesterId.toString() === userId) {
      throw new ForbiddenException('You cannot apply to your own service');
    }

    if (service.status !== 'open') {
      throw new ForbiddenException('Service is not open for applications');
    }

    if (service.applicants.includes(new Types.ObjectId(userId))) {
      throw new ForbiddenException('You have already applied to this service');
    }

    service.applicants.push(new Types.ObjectId(userId));
    return service.save();
  }

  async selectApplicant(serviceId: string, applicantId: string, userId: string): Promise<Service> {
    const service = await this.serviceModel.findById(serviceId).exec();
    
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.requesterId.toString() !== userId) {
      throw new ForbiddenException('You can only select applicants for your own services');
    }

    if (!service.applicants.includes(new Types.ObjectId(applicantId))) {
      throw new ForbiddenException('User has not applied to this service');
    }

    service.selectedApplicant = new Types.ObjectId(applicantId);
    service.status = 'in_progress';
    return service.save();
  }

  async getCategories(): Promise<string[]> {
    const services = await this.serviceModel.find({}, 'category').exec();
    const allCategories = services.flatMap(service => 
      Array.isArray(service.category) ? service.category : [service.category]
    );
    const uniqueCategories = [...new Set(allCategories)].filter(Boolean);
    return uniqueCategories;
  }
}
