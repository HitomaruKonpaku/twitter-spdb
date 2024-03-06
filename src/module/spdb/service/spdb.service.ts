import { Injectable } from '@nestjs/common'

@Injectable()
export class SpdbService {
  constructor(
    // @InjectQueue(SPDB_SPACE_QUEUE_NAME)
    // private readonly spaceQueue: Queue,
  ) { }

  public async addById(id: string) {
    // const job = await this.spaceQueue.add(
    //   id,
    //   { id },
    //   {
    //     jobId: id,
    //     attempts: 5,
    //     backoff: {
    //       type: 'fixed',
    //       delay: 60 * 1000,
    //     },
    //     removeOnComplete: {
    //       age: 3600,
    //     },
    //   },
    // )
    // return job
  }
}
