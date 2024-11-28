import { All, Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Route } from '../api/route.entity';
import { RoutesService } from './routes.service';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  findAll() {
    return this.routesService.findAll();
  }

  @Post()
  create(@Body() route: Partial<Route>) {
    return this.routesService.create(route);
  }

  @All('*')
  async handleDynamicRoutes(@Req() req: Request, @Res() res: Response) {
    const { method, path } = req;
    const route = await this.routesService.findDynamicRoute(method, path);

    if (route) {
      res.json(JSON.parse(route.responseConfig));
    } else {
      res.status(404).json({ error: 'Route not found' });
    }
  }
}
