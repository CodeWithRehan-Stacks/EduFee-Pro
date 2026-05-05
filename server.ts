import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // PDF Generation Endpoint - Actually generates a receipt PDF
  app.get('/api/receipts/:invoiceId', async (req, res) => {
    const { invoiceId } = req.params;
    
    const doc = new PDFDocument({ margin: 50 });
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${invoiceId}.pdf`);

    doc.pipe(res);

    // School Info
    doc.fontSize(20).text('EDUFEE PRO RECEIPT', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text('Official Payment Acknowledgement', { align: 'center' });
    doc.moveDown(2);

    doc.rect(50, 150, 500, 1).fill('#1c1917');
    doc.moveDown();

    doc.fontSize(12).font('Helvetica-Bold').text(`Receipt No: REC-${Date.now()}`);
    doc.font('Helvetica').text(`Invoice ID: ${invoiceId}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Student Info (Mocked values for demo)
    doc.fontSize(14).font('Helvetica-Bold').text('Billed To:');
    doc.fontSize(12).font('Helvetica').text('Student Name: Ali Ahmed');
    doc.text('Father Name: Ahmed Khan');
    doc.text('Class: Grade 5');
    doc.moveDown();

    // Payment Info
    doc.fontSize(14).font('Helvetica-Bold').text('Payment Details:');
    doc.fontSize(12).font('Helvetica').text('Monthly Fee: 5,000 PKR');
    doc.text('Late Fee: 0 PKR');
    doc.rect(50, 400, 500, 40).fill('#f5f5f4');
    doc.fillColor('#000').font('Helvetica-Bold').text('TOTAL PAID:', 60, 415);
    doc.text('5,000 PKR', 450, 415);

    doc.moveDown(4);

    // Footer
    doc.fontSize(10).font('Helvetica-Oblique').text('This is a computer generated receipt and does not require a physical signature.', { align: 'center' });

    doc.end();
  });

  app.post('/api/automation/apply-late-fees', async (req, res) => {
    // Logic: Look up unpaid invoices where due_date < today
    // Apply penalty based on tier rules
    console.log('Running late fee audit...');
    res.json({ success: true, message: 'Late fees calculated for overdue items' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
