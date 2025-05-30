/* eslint-disable @typescript-eslint/no-var-requires */

import { Injectable, OnModuleInit } from '@nestjs/common'
import { Browser, BrowserEvent, HTTPRequest, HTTPResponse, Page } from 'puppeteer'
import { USER_AGENT } from '../../../constant/app.constant'
import { Logger } from '../../../shared/logger'
import { SpdbService } from './spdb.service'

const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

@Injectable()
export class SpdbPuppeteerService implements OnModuleInit {
  private readonly logger = new Logger(SpdbPuppeteerService.name, { timestamp: true })
  private readonly debug = false

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

    puppeteer.use(StealthPlugin())

    const browser = await puppeteer.launch({
      headless: !this.debug,
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

    page.on('request', (request) => this.onRequest(request))
    page.on('response', (response) => this.onResponse(response))

    await page.setUserAgent(USER_AGENT)
    await page.goto(url, { timeout: 0 })
  }

  private onRequest(request: HTTPRequest) {
    const blockTypes = [
      'image',
      'font',
      'stylesheet',
    ]

    if (!this.debug) {
      if (blockTypes.includes(request.resourceType())) {
        request.abort()
        return
      }
    }

    request.continue()
  }

  private async onResponse(response: HTTPResponse) {
    const status = response.status()
    const method = response.request().method()
    const url = new URL(response.url())
    if (url.hostname !== this.hostname || [302].includes(status) || ['.png', '.jpg'].some((v) => url.href.endsWith(v))) {
      return
    }

    this.logger.debug([status, method, url.href].join(' '))

    try {
      const body = await response.text()
      await this.handleBody(body)
    } catch (error) {
      this.logger.error(`onResponse: ${error.message} | ${JSON.stringify({ method, url: url.href })}`)
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
    this.logger.log(`handleBody | ${JSON.stringify({ count: ids.length })}`)
    await Promise.allSettled(ids.map((id) => this.addToQueueById(id)))
  }

  private async addToQueueById(id: string) {
    try {
      await this.spdbService.addById(id)
    } catch (error) {
      this.logger.error(`addToQueueById: ${error.message} | ${JSON.stringify({ id })}`)
    }
  }
}
