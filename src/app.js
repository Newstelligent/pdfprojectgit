const express = require('express');
const { extractPdfFields, fillPdfFields } = require('./pdf-utils');
const { generateHtmlForm } = require('./form-utils');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
let fieldDetails = []; // To store field details globally

app.use(express.urlencoded({ extended: true }));

// Route to dynamically generate form based on the PDF fields
app.get('/', async (req, res) => {
  try {
    const pdfPath = path.resolve(__dirname, '../visumantrag-schengen.pdf');
    const pdfBytes = fs.readFileSync(pdfPath);

    // Extract the PDF field names and types
    fieldDetails = await extractPdfFields(pdfBytes);
    console.log("Extracted field details:", fieldDetails); // Debugging output

    // Dynamically generate the HTML form based on the extracted field types
    const formHtml = generateHtmlForm(fieldDetails);
    res.send(formHtml);
  } catch (err) {
    console.error('Error loading PDF:', err);
    res.status(500).send('Error loading PDF');
  }
});

// Route to handle form submission and fill the PDF fields dynamically
app.get('/generate-pdf', async (req, res) => {
  try {
    console.log("Received form data:", req.query); // Debug form data

    const pdfPath = path.resolve(__dirname, '../visumantrag-schengen.pdf');
    const pdfBytes = fs.readFileSync(pdfPath);

    // Fill the PDF fields based on submitted form data
    const filledPdfBytes = await fillPdfFields(pdfBytes, fieldDetails, req.query);

    // Return the filled PDF as a downloadable file
    res.setHeader('Content-Disposition', 'attachment; filename="filled_form.pdf"');
    res.send(Buffer.from(filledPdfBytes));
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).send('Error generating PDF');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
