const { PDFDocument } = require('pdf-lib');

// Extract PDF field names and types
async function extractPdfFields(pdfBytes) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  // Extract field name, type, and supported values (if applicable)
  return fields.map(field => {
    const fieldType = field.constructor.name;
    let supportedValues = [];

    if (fieldType === 'RadioGroup' || fieldType === 'Dropdown') {
      supportedValues = field.getOptions(); // Get dropdown/radio values
    }

    return {
      name: field.getName(),
      type: fieldType,
      supportedValues: supportedValues
    };
  });
}

// Fill PDF fields dynamically
async function fillPdfFields(pdfBytes, fieldDetails, formData) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();

  // Fill fields dynamically based on field details
  fieldDetails.forEach(fieldDetail => {
    const { name, type } = fieldDetail;
    try {
      const value = formData[name];
      console.log(`Filling field: ${name} with value: ${value}`); // Debugging output

      if (type === 'PDFTextField') {
        const textField = form.getTextField(name);
        if (textField) {
          textField.setText(value || '');
        } else {
          console.error(`Text field "${name}" not found in the form.`);
        }
      } else if (type === 'PDFCheckBox') {
        const checkBox = form.getCheckBox(name);
        if (checkBox) {
          if (value === 'on') {
            checkBox.check();
          } else {
            checkBox.uncheck();
          }
        } else {
          console.error(`Checkbox "${name}" not found in the form.`);
        }
      }
    } catch (err) {
      console.error(`Error filling field "${name}": ${err.message}`);
    }
  });

  // Flatten the form to prevent future edits
  form.flatten();

  // Serialize the PDFDocument to bytes (a Uint8Array)
  return await pdfDoc.save();
}

module.exports = { extractPdfFields, fillPdfFields };
