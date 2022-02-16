import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly FilesService: FilesService) {}
}
