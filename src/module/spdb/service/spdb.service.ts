import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import ms from 'ms'
import { NumberUtil } from '../../../shared/util/number.util'
import { SPDB_SPACE_QUEUE_NAME } from '../constant/spdb.constant'

@Injectable()
export class SpdbService {
  constructor(
    @InjectQueue(SPDB_SPACE_QUEUE_NAME)
    private readonly spaceQueue: Queue,
  ) { }

  public async addById(id: string) {
    const job = await this.spaceQueue.add(
      id,
      { id },
      {
        jobId: id,
        attempts: NumberUtil.parse(process.env.TWITTER_SPACE_QUEUE_ATTEMPTS, 3),
        backoff: {
          type: 'fixed',
          delay: ms('1m'),
        },
        removeOnComplete: {
          age: ms('1h') * 1e-3,
        },
        removeOnFail: {
          age: ms('1d') * 1e-3,
        },
      },
    )
    return job
  }
}
