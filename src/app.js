const express = require('express');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming request query data
app.use(express.urlencoded({ extended: true }));

// Serve the form
app.get('/', (req, res) => {
  res.send(`
    <form action="/generate-pdf" method="GET">
      <label for="name">Name:</label>
      <input type="text" id="name" name="name" required>
      <br>
      <label for="city">City:</label>
      <input type="text" id="city" name="city" required>
      <br>
      <button type="submit">Generate PDF</button>
    </form>
  `);
});

// Generate PDF with form data
app.get('/generate-pdf', async (req, res) => {
  const { name, city } = req.query;

  try {
    // Load the PDF form
    const pdfPath = path.resolve(__dirname, '../Test123.pdf');
    const pdfBytes = fs.readFileSync(pdfPath);

    // Load a PDFDocument from the existing PDF bytes
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Get the form containing all fields in the PDF
    const form = pdfDoc.getForm();

    // Get specific form fields (Name and City) by their names in the PDF
    const nameField = form.getTextField('name');
    const cityField = form.getTextField('city');

    // Set the values of the form fields
    nameField.setText(name);
    cityField.setText(city);

    // Flatten the form to prevent future edits
    form.flatten();

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const updatedPdfBytes = await pdfDoc.save();

    // Set response headers for downloading the PDF
    res.setHeader('Content-Disposition', 'attachment; filename="filled_form.pdf"');
    res.send(Buffer.from(updatedPdfBytes));
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).send('Error generating PDF');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
