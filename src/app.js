const express = require('express');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// Serve the form
app.get('/', (req, res) => {
  res.send(`
    <form action="/generate-pdf" method="GET">
      <label for="name">Name:</label>
      <input type="text" id="name" name="name" required>
      <button type="submit">Generate PDF</button>
    </form>
  `);
});

// Generate PDF
app.get('/generate-pdf', async (req, res) => {
  const { name } = req.query;

  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { width, height } = page.getSize();

    // Embed the Helvetica font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Draw text on the PDF
    page.drawText(`Name: ${name}`, {
      x: 50,
      y: height - 100,
      size: 24,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Serialize the PDF document to bytes
    const pdfBytes = await pdfDoc.save();

    // Set response headers for downloading the PDF
    res.setHeader('Content-Disposition', 'attachment; filename="form.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).send('Error generating PDF');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
