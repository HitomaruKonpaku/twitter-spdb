import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { QueueOptions } from 'bullmq'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SpdbModule } from './module/spdb/spdb.module'

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => {
        const opts: QueueOptions = {
          connection: {
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT || 6379),
          },
        }
        // console.debug(opts)
        return opts
      },
    }),

    SpdbModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule { }
