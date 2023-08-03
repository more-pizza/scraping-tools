import { Browser, BrowserContext, LaunchOptions, Page, chromium } from 'playwright';
import { addExtra, PlaywrightExtraClass } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

type ScraperFn<TResult> = (page: Page) => Promise<TResult>;

interface IOptions {
  headless: boolean;
}

export class PlaywrightScraper {
  public chromium: PlaywrightExtraClass;
  public browser: Browser;
  public defaultContext: BrowserContext;
  public defaultPage: Page;

  public options: IOptions;

  private chromiumConfigured: boolean;

  constructor(options: IOptions) {
    this.chromiumConfigured = false;
    this.chromium = undefined;

    this.options = options;
  }

  private configureChromium() {
    if (this.chromiumConfigured) {
      return;
    }
    this.chromium = addExtra(chromium);
    this.chromium.use(StealthPlugin());
    this.chromiumConfigured = true;
  }

  private getLaunchOptions(): LaunchOptions {
    return {
      headless: this.options.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };
  }

  public async launch() {
    this.configureChromium();
    if (this.browser) {
      return this.browser;
    }
    this.browser = await this.chromium.launch(this.getLaunchOptions());
  }

  public async close() {
    await this.browser.close();
    this.browser = undefined;
  }

  public async getDefaultContext() {
    if (this.defaultContext) {
      return this.defaultContext;
    }
    await this.launch();
    const contexts = await this.browser.contexts();
    if (contexts.length) {
      this.defaultContext = contexts[0];
    } else {
      this.defaultContext = await this.browser.newContext();
    }
    return this.defaultContext;
  }

  public async getDefaultPage() {
    if (this.defaultPage) {
      return this.defaultPage;
    }
    const defaultContext = await this.getDefaultContext();
    const pages = await defaultContext.pages();
    if (pages.length) {
      this.defaultPage = pages[0];
    } else {
      this.defaultPage = await defaultContext.newPage();
    }
    return this.defaultPage;
  }

  public async scrape<TResult>(scraperFn: ScraperFn<TResult>) {
    const page = await this.getDefaultPage();
    const result = await scraperFn(page);
    return result;
  }

  public async backoffMs(ms?: number) {
    const backoffMs = ms || 1000;
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
