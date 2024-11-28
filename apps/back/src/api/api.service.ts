import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from './route.entity';

@Injectable()
export class ApiService {
  constructor(
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
  ) {}

  async findAll() {
    return this.routeRepository.find();
  }

  // async findByPath(path: string) {
  //   return this.routeRepository.findOneBy({ path });
  // }

  async findByPath(path: string) {
    const route = await this.routeRepository.findOneBy({ path });

    if (!route) {
      throw new Error(`Route with path "${path}" not found`);
    }

    if (route.responseConfig) {
      // Si existe configuración, generar datos dinámicos
      const config = JSON.parse(route.responseConfig);
      console.log('LOG | ApiService | findByPath | config:', config);
      const generatedData = this.generateData(config, 10);
      return generatedData;
    }

    // Si no hay configuración, retornar la respuesta predeterminada
    return route.responseConfig ? JSON.parse(route.responseConfig) : {};
  }

  // async createRoute(route: Partial<Route>) {
  //   const newRoute = this.routeRepository.create(route);
  //   return this.routeRepository.save(newRoute);
  // }

  // async updateRoute(id: number, route: Partial<Route>) {
  //   await this.routeRepository.update(id, route);
  //   return this.routeRepository.findOneBy({ id });
  // }

  async createRoute(route: Partial<Route>) {
    if (route.responseConfig && typeof route.responseConfig !== 'string') {
      route.responseConfig = JSON.stringify(route.responseConfig); // Serializa el objeto si no es string
    }
    const newRoute = this.routeRepository.create(route);
    return this.routeRepository.save(newRoute);
  }

  async updateRoute(id: number, route: Partial<Route>) {
    if (route.responseConfig && typeof route.responseConfig !== 'string') {
      route.responseConfig = JSON.stringify(route.responseConfig); // Serializa el objeto si no es string
    }
    await this.routeRepository.update(id, route);
    return this.routeRepository.findOneBy({ id });
  }

  async deleteRoute(id: number) {
    return this.routeRepository.delete(id);
  }

  async createFakeResponse(route: Route) {
    const fakeResponse = {
      path: route.path,
      method: route.method,
      response: faker.lorem.paragraphs(3), // Generamos una respuesta aleatoria con Faker
    };

    return fakeResponse;
  }

  generateData(config: Record<string, string>, count: number = 10) {
    const data = [];

    for (let i = 0; i < count; i++) {
      const item: Record<string, any> = {};

      for (const [key, method] of Object.entries(config)) {
        try {
          console.log(`Generando valor para key: ${key}, method: ${method}`);
          item[key] = this.executeFakerMethod(method);
        } catch (error) {
          console.error(
            `Error ejecutando Faker para key: ${key}, method: ${method}`,
            error,
          );
          item[key] = null; // Devolver null si falla
        }
      }

      data.push(item);
    }

    return data;
  }

  private executeFakerMethod(method: string | [string, string]): any {
    if (Array.isArray(method)) {
      // Caso donde method es un array [método, argumentos]
      const [rawMethod, rawArgs] = method;
      console.log('LOG | ApiService | executeFakerMethod | rawArgs:', rawArgs);

      // Parsear argumentos
      let args: any;
      try {
        args = JSON.parse(rawArgs); // Intenta parsear como JSON válido
      } catch (error) {
        console.log('LOG | ApiService | executeFakerMethod | error:', error);
        try {
          args = Function(`return ${rawArgs}`)(); // Evalúa como código JS si JSON falla
        } catch (evalError) {
          console.log(
            'LOG | ApiService | executeFakerMethod | evalError:',
            evalError,
          );
          throw new Error(
            `Invalid argument format for Faker method: ${rawArgs}`,
          );
        }
      }

      // Validar que args es un array
      if (!Array.isArray(args)) {
        throw new Error(
          `Arguments for Faker method "${rawMethod}" must be an array. Received: ${rawArgs}`,
        );
      }

      // Ejecutar el método con los argumentos
      const [category, ...rest] = rawMethod.split('.');
      if (!faker[category]) {
        throw new Error(`Faker category "${category}" does not exist`);
      }

      console.log('LOG | ApiService | executeFakerMethod | rest:', rest);
      const fakerMethod =
        rest.length === 0
          ? faker[category]
          : rest.reduce((acc, key) => acc?.[key], faker[category]);
      console.log(
        'LOG | ApiService | executeFakerMethod | fakerMethod:',
        fakerMethod,
      );

      if (typeof fakerMethod !== 'function') {
        throw new Error(`Faker method "${rawMethod}" is not valid`);
      }

      const result = fakerMethod([...args]);
      console.log(`Result for ${rawMethod} with args ${rawArgs}:`, result);
      return result;
    }

    // Caso donde method es un string simple (sin argumentos)
    const [category, ...rest] = method.split('.');
    if (!faker[category]) {
      throw new Error(`Faker category "${category}" does not exist`);
    }

    const fakerMethod =
      rest.length === 0
        ? faker[category]
        : rest.reduce((acc, key) => acc?.[key], faker[category]);

    if (typeof fakerMethod !== 'function') {
      throw new Error(`Faker method "${method}" is not valid`);
    }

    const result = fakerMethod();
    console.log(`Result for ${method}:`, result);
    return result;
  }
}
