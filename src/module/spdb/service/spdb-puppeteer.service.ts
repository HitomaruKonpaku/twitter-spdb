import { Injectable, OnModuleInit } from '@nestjs/common'
import puppeteer, { Browser, BrowserEvent, HTTPResponse, Page } from 'puppeteer'
import { USER_AGENT } from '../../../constant/app.constant'
import { Logger } from '../../../shared/logger/logger'
import { SpdbService } from './spdb.service'

@Injectable()
export class SpdbPuppeteerService implements OnModuleInit {
  private readonly logger = new Logger(SpdbPuppeteerService.name, { timestamp: true })

  private readonly hostname = [...'moc.draobhsadsecaps'].reverse().join('')
  private readonly pageUrl = [...'tsetal=edom&=gnal?/moc.draobhsadsecaps//:sptth'].reverse().join('')

  private intervalId: any

  private browser: Browser
  private page: Page

  constructor(
    private readonly spdbService: SpdbService,
  ) { }

  onModuleInit() {
    this.init()
  }

  private async init() {
    this.logger.debug('init')
    await this.initBrowser()
    await this.initPage(this.pageUrl)
  }

  private async initBrowser() {
    this.logger.debug('initBrowser')
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      // executablePath: '/usr/bin/google-chrome',
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox',
      ],
    })
    this.browser = browser

    browser.on(BrowserEvent.Disconnected, () => {
      this.logger.warn('browser disconnected')
      process.exit(0)
    })
  }

  private async initPage(url: string) {
    this.logger.debug('initPage')
    const page = this.page || await this.browser.newPage()
    this.page = page

    await page.setRequestInterception(true)

    page.on('request', (request) => {
      const blockTypes = [
        'image',
        'font',
        'stylesheet',
      ]

      if (blockTypes.includes(request.resourceType())) {
        request.abort()
      } else {
        request.continue()
      }
    })

    page.on('response', (response) => this.onResponse(response))

    await page.setUserAgent(USER_AGENT)
    await page.goto(url, { timeout: 0 })
  }

  private async onResponse(response: HTTPResponse) {
    const status = response.status()
    const method = response.request().method()
    const url = new URL(response.url())
    if (url.hostname !== this.hostname || [302].includes(status) || ['.png'].some((v) => url.href.endsWith(v))) {
      return
    }

    this.logger.debug([status, method, url.href].join(' '))

    try {
      const body = await response.text()
      await this.handleBody(body)
    } catch (error) {
      this.logger.error(`onResponse: ${error.message}`, null, { method, url: url.href })
    }

    clearInterval(this.intervalId)

    this.intervalId = setInterval(() => {
      this.logger.warn('reload')
      this.page.reload({ timeout: 0 })
    }, 30 * 1000)
  }

  private async handleBody(body: string) {
    const regex = /(?<=(?:\/i\/spaces\/)|(?:\\\/i\\\/spaces\\\/))\w+/g
    let ids = body.match(regex) as string[]
    if (!ids?.length) {
      return
    }

    ids = [...new Set(ids)]
    this.logger.debug('handleBody', { count: ids.length })
    await Promise.allSettled(ids.map((id) => this.spdbService.addById(id)))
  }
}
