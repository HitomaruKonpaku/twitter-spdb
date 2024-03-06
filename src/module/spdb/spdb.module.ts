import { Module } from '@nestjs/common'
import { SpdbController } from './controller/spdb.controller'
import { SpdbPuppeteerService } from './service/spdb-puppeteer.service'
import { SpdbService } from './service/spdb.service'

@Module({
  imports: [
    // BullModule.registerQueue({
    //   name: SPDB_SPACE_QUEUE_NAME,
    // }),
  ],
  controllers: [
    SpdbController,
  ],
  providers: [
    SpdbService,
    SpdbPuppeteerService,
  ],
})
export class SpdbModule { }
