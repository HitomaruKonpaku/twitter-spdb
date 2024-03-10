import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { SPDB_SPACE_QUEUE_NAME } from './constant/spdb.constant'
import { SpdbController } from './controller/spdb.controller'
import { SpdbPuppeteerService } from './service/spdb-puppeteer.service'
import { SpdbService } from './service/spdb.service'

@Module({
  imports: [
    BullModule.registerQueue({
      name: SPDB_SPACE_QUEUE_NAME,
    }),
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
