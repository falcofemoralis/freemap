import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { FeatureTypeDto } from '../../../dto/map/feature-type.dto';

@Entity('featuretypes')
export class FeatureType {
  @ObjectIdColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  geometryTypeId: string;

  constructor(props: FeatureTypeDto) {
    Object.assign(this, props);
  }
}
