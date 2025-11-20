import puppeteer, { Browser, PDFOptions as PuppeteerPDFOptions } from 'puppeteer';
import { promises as fs } from 'fs';
import * as path from 'path';
import { ConvertOptions, ConvertResult } from './types.js';

export class PdfConverter {
  private browser: Browser | null = null;
  private browserPromise: Promise<Browser> | null = null;

  /**
   * Initialize browser instance with connection pooling
   */
  private async getBrowser(): Promise<Browser> {
    if (this.browser && this.browser.isConnected()) {
      return this.browser;
    }

    if (this.browserPromise) {
      return this.browserPromise;
    }

    this.browserPromise = puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    this.browser = await this.browserPromise;
    this.browserPromise = null;
    return this.browser;
  }

  /**
   * Convert HTML to PDF
   */
  async convertToPdf(options: ConvertOptions): Promise<ConvertResult> {
    const startTime = Date.now();
    let page = null;

    try {
      // Validate input
      if (!options.htmlPath && !options.htmlContent) {
        throw new Error('Either htmlPath or htmlContent must be provided');
      }

      // Get or create browser instance
      const browser = await this.getBrowser();
      page = await browser.newPage();

      // Set timeout
      const timeout = options.timeout || 30000;
      page.setDefaultTimeout(timeout);

      // Load HTML content
      if (options.htmlPath) {
        const htmlPath = path.resolve(options.htmlPath);
        await fs.access(htmlPath); // Check file exists
        const fileUrl = `file://${htmlPath}`;

        const waitUntil = options.waitForNetworkIdle ? 'networkidle0' : 'load';
        await page.goto(fileUrl, {
          waitUntil,
          timeout
        });
      } else if (options.htmlContent) {
        await page.setContent(options.htmlContent, {
          waitUntil: options.waitForNetworkIdle ? 'networkidle0' : 'load',
          timeout
        });
      }

      // Wait a bit for any dynamic content to render
      await page.evaluate(() => {
        return new Promise<void>((resolve) => {
          // @ts-ignore - document and window are available in browser context
          if (document.readyState === 'complete') {
            resolve();
          } else {
            // @ts-ignore - document and window are available in browser context
            window.addEventListener('load', () => resolve());
          }
        });
      });

      // Prepare PDF options
      const pdfOptions: PuppeteerPDFOptions = {
        format: options.format || 'A4',
        landscape: options.landscape || false,
        printBackground: options.printBackground !== false, // default true
        scale: options.scale || 1,
        displayHeaderFooter: options.displayHeaderFooter || false,
        preferCSSPageSize: options.preferCSSPageSize || false,
        margin: {
          top: options.marginTop || '10mm',
          bottom: options.marginBottom || '10mm',
          left: options.marginLeft || '10mm',
          right: options.marginRight || '10mm'
        }
      };

      if (options.headerTemplate) {
        pdfOptions.headerTemplate = options.headerTemplate;
      }
      if (options.footerTemplate) {
        pdfOptions.footerTemplate = options.footerTemplate;
      }

      // Generate output path if not provided
      let outputPath = options.outputPath;
      if (!outputPath) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        outputPath = path.join(process.cwd(), `output-${timestamp}.pdf`);
      } else {
        outputPath = path.resolve(outputPath);
      }

      // Generate PDF
      if (outputPath) {
        pdfOptions.path = outputPath;
      }

      await page.pdf(pdfOptions);

      // Get file size
      let fileSize: number | undefined;
      try {
        const stats = await fs.stat(outputPath);
        fileSize = stats.size;
      } catch (e) {
        // Ignore error
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        outputPath,
        details: {
          processingTime,
          fileSize
        }
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        details: {
          processingTime
        }
      };
    } finally {
      // Close the page to free resources
      if (page) {
        await page.close().catch(() => {});
      }
    }
  }

  /**
   * Close browser and cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
