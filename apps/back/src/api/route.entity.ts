import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// @Entity()
// export class Route {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column()
//   path: string;

//   @Column('text')
//   response: string;

//   @Column()
//   method: string;
// }

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  path: string;

  @Column()
  method: string;

  @Column('text')
  responseConfig: string;

  @Column('text', { nullable: true }) // Guardar la semilla
  seedConfig: string | null;
}
