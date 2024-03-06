import { Controller, Param, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { SpdbService } from '../service/spdb.service'

@Controller('spdb')
@ApiTags('spdb')
export class SpdbController {
  constructor(private readonly service: SpdbService) { }

  @Post(':id')
  addById(
    @Param('id') id: string,
  ) {
    return this.service.addById(id)
  }
}
