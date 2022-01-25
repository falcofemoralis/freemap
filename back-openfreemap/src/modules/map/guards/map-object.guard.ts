import { CanActivate, ExecutionContext, Inject, NotFoundException } from '@nestjs/common';
import { MapService } from '../map.service';

export class MapObjectGuard implements CanActivate {
  constructor(@Inject(MapService) private mapService: MapService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const mapObject = await this.mapService.getObjectById(req.params.id);

    if (!mapObject) {
      throw new NotFoundException();
    }

    return true;
  }
}
