export interface PdfOptions {
  format?: 'A4' | 'A3' | 'Letter' | 'Legal' | 'Tabloid';
  landscape?: boolean;
  printBackground?: boolean;
  scale?: number;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  preferCSSPageSize?: boolean;
}

export interface ConvertOptions extends PdfOptions {
  htmlPath?: string;
  htmlContent?: string;
  outputPath?: string;
  waitForNetworkIdle?: boolean;
  timeout?: number;
}

export interface ConvertResult {
  success: boolean;
  outputPath?: string;
  error?: string;
  details?: {
    processingTime: number;
    fileSize?: number;
  };
}
