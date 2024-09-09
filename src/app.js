const express = require('express');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve the updated form
app.get('/', (req, res) => {
  res.send(`
    <form action="/generate-pdf" method="GET">
      <label for="name">Name (Familienname):</label>
      <input type="text" id="name" name="name" required>
      <br>
      <label for="firstName">First Name (Vorname):</label>
      <input type="text" id="firstName" name="firstName" required>
      <br>
      <label for="birthDate">Birth Date (Geburtsdatum):</label>
      <input type="date" id="birthDate" name="birthDate" required>
      <br>
      <label for="birthPlace">Place of Birth (Geburtsort):</label>
      <input type="text" id="birthPlace" name="birthPlace" required>
      <br>
      <label for="nationality">Nationality (Staatsangehörigkeit):</label>
      <input type="text" id="nationality" name="nationality" required>
      <br>
      <label for="docNumber">Document Number (Reisedokumentnummer):</label>
      <input type="text" id="docNumber" name="docNumber" required>
      <br>
      <button type="submit">Generate PDF</button>
    </form>
  `);
});

// Generate PDF with form data
app.get('/generate-pdf', async (req, res) => {
  const { name, firstName, birthDate, birthPlace, nationality, docNumber } = req.query;

  try {
    // Determine if running locally or in production
    const pdfPath = process.env.NODE_ENV === 'production' 
      ? path.resolve(__dirname, '../90-antrag-schengenvisum-data.pdf') 
      : path.resolve(__dirname, '90-antrag-schengenvisum-data.pdf');
    
    const pdfBytes = fs.readFileSync(pdfPath);

    // Load a PDFDocument from the existing PDF bytes
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Get the form containing all fields in the PDF
    const form = pdfDoc.getForm();

    // Get specific form fields by their names in the PDF
    const nameField = form.getTextField('name');
    const firstNameField = form.getTextField('firstName');
    const birthDateField = form.getTextField('birthDate');
    const birthPlaceField = form.getTextField('birthPlace');
    const nationalityField = form.getTextField('nationality');
    const docNumberField = form.getTextField('docNumber');

    // Set the values of the form fields
    nameField.setText(name);
    firstNameField.setText(firstName);
    birthDateField.setText(birthDate);
    birthPlaceField.setText(birthPlace);
    nationalityField.setText(nationality);
    docNumberField.setText(docNumber);

    // Flatten the form to prevent future edits
    form.flatten();

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const updatedPdfBytes = await pdfDoc.save();

    // Set response headers for downloading the PDF
    res.setHeader('Content-Disposition', 'attachment; filename="filled_schengen_form.pdf"');
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
