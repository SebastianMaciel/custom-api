import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { Route } from './route.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Route])],
  exports: [TypeOrmModule],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
