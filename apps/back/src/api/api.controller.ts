import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiService } from './api.service';
import { Route } from './route.entity';

@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get()
  async getAllRoutes() {
    return this.apiService.findAll();
  }

  // @Get(':path')
  // async getRoute(@Param('path') path: string) {
  //   const route = await this.apiService.findByPath(path);
  //   if (route) {
  //     return JSON.parse(route.response);
  //   }
  //   return { error: 'Route not found' };
  // }

  @Get(':path')
  async getRoute(@Param('path') path: string) {
    try {
      return await this.apiService.findByPath(path);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Post()
  async createRoute(@Body() route: Partial<Route>) {
    return this.apiService.createRoute(route);
  }

  @Put(':id')
  async updateRoute(@Param('id') id: number, @Body() route: Partial<Route>) {
    return this.apiService.updateRoute(id, route);
  }

  @Delete(':id')
  async deleteRoute(@Param('id') id: number) {
    return this.apiService.deleteRoute(id);
  }

  @Post('create-fake-response')
  async createFakeResponse(@Body() route: Route) {
    return this.apiService.createFakeResponse(route);
  }

  @Post('generate-data')
  generateData(@Body() body: any) {
    // body contiene la configuración enviada desde el frontend
    return this.apiService.generateData(body);
  }
}
