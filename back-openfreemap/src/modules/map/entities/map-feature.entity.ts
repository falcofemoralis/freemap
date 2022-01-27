import { Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn } from 'typeorm';
import { CreateFeatureDataDto } from '../../../dto/map/map-data.dto';

export interface Coordinate {
  lon: number;
  lat: number;
}

@Entity('features')
export class MapFeature {
  @ObjectIdColumn()
  id: string;

  @Column()
  userId: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  typeId: string;

  @Column()
  zoom: number;

  @Column()
  coordinates: Coordinate[]; // [[lon, lat]]

  @Column()
  address?: string;

  @Column()
  links?: string[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt?: Date;

  constructor(props: CreateFeatureDataDto, userId: string) {
    Object.assign(this, props);
    this.userId = userId;
  }
}
