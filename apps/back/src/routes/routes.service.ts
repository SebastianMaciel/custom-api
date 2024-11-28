import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from '../api/route.entity';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
  ) {}

  findAll() {
    return this.routeRepository.find();
  }

  create(route: Partial<Route>) {
    const newRoute = this.routeRepository.create(route);
    return this.routeRepository.save(newRoute);
  }

  async findDynamicRoute(method: string, path: string) {
    return this.routeRepository.findOne({ where: { method, path } });
  }
}
