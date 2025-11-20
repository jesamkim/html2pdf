import { PdfConverter } from './src/pdf-converter.js';
import * as path from 'path';

async function test() {
  const converter = new PdfConverter();

  console.log('Testing HTML to PDF conversion...\n');

  // Test with sample HTML file
  const htmlPath = path.join(process.cwd(), 'AWS_Expert_Feedback_Summary.html');
  const outputPath = path.join(process.cwd(), 'AWS_Expert_Feedback_Summary.pdf');

  console.log('Converting:', htmlPath);
  console.log('Output to:', outputPath);
  console.log('');

  const result = await converter.convertToPdf({
    htmlPath,
    outputPath,
    printBackground: true,
    waitForNetworkIdle: false,
    format: 'A4',
    scale: 0.8,  // 80% scale
    marginTop: '10mm',
    marginBottom: '10mm',
    marginLeft: '10mm',
    marginRight: '10mm'
  });

  if (result.success) {
    console.log('Success!');
    console.log('Output:', result.outputPath);
    console.log('Processing time:', result.details?.processingTime + 'ms');
    console.log('File size:', result.details?.fileSize ? (result.details.fileSize / 1024).toFixed(2) + ' KB' : 'unknown');
  } else {
    console.error('Failed:', result.error);
  }

  await converter.cleanup();
}

test().catch(console.error);
