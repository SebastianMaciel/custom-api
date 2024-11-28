import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiController } from './api/api.controller';
import { ApiModule } from './api/api.module';
import { ApiService } from './api/api.service';
import { Route } from './api/route.entity';
import { RoutesModule } from './routes/routes.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [Route],
      synchronize: true, // Solo para desarrollo; desactivar en producción
    }),
    ApiModule,
    RoutesModule,
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class AppModule {}
