import { PdfConverter } from './src/pdf-converter.js';
import * as path from 'path';

async function convertSample() {
  const converter = new PdfConverter();

  console.log('Converting sample.html to PDF...\n');

  const htmlPath = path.join(process.cwd(), 'sample.html');
  const outputPath = path.join(process.cwd(), 'sample.pdf');

  console.log('Input:', htmlPath);
  console.log('Output:', outputPath);
  console.log('');

  const result = await converter.convertToPdf({
    htmlPath,
    outputPath,
    printBackground: true,
    waitForNetworkIdle: true,  // Wait for Chart.js to load
    format: 'A4',
    scale: 0.8,  // 80% scale
    marginTop: '15mm',
    marginBottom: '15mm',
    marginLeft: '15mm',
    marginRight: '15mm',
    timeout: 45000  // 45 seconds for chart rendering
  });

  if (result.success) {
    console.log('✅ Success!');
    console.log('📄 Output:', result.outputPath);
    console.log('⏱️  Processing time:', result.details?.processingTime + 'ms');
    console.log('📦 File size:', result.details?.fileSize ? (result.details.fileSize / 1024).toFixed(2) + ' KB' : 'unknown');
  } else {
    console.error('❌ Failed:', result.error);
  }

  await converter.cleanup();
}

convertSample().catch(console.error);
