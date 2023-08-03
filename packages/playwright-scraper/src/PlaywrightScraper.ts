import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { addExtra, PlaywrightExtraClass } from 'playwright-extra';
import StealthPlugin from 'playwright-extra-plugin-stealth';

interface IOptions {
  headless: boolean;
}

export class PlaywrightScraper {
  private chromiumConfigured: boolean;
  public chromium: PlaywrightExtraClass;

  public options: IOptions;

  public browser: Browser;

  constructor(options: IOptions) {
    this.chromiumConfigured = false;
    this.chromium = undefined;

    this.options = options;
  }

  public configureChromium() {
    if (this.chromiumConfigured) {
      return;
    }
    this.chromium = addExtra(chromium);
    this.chromium.use(StealthPlugin());
    this.chromiumConfigured = true;
  }

  public async launch() {
    this.configureChromium();
    const browser = await this.chromium.launch({
      headless: this.options.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
}
