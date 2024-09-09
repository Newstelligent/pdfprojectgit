// Dynamically generate HTML form based on PDF field types
function generateHtmlForm(fieldDetails) {
  let formHtml = '<form action="/generate-pdf" method="GET">';

  fieldDetails.forEach(field => {
    const { name, type } = field;

    // Generate a label and input based on field type
    if (type === 'PDFTextField') {
      formHtml += `
        <label for="${name}">${name}:</label>
        <input type="text" id="${name}" name="${name}" required>
        <br>
      `;
    } else if (type === 'PDFCheckBox') {
      formHtml += `
        <label for="${name}">${name}:</label>
        <input type="checkbox" id="${name}" name="${name}">
        <br>
      `;
    } else if (type === 'PDFRadioGroup' || type === 'PDFDropdown') {
      formHtml += `<label>${name}:</label><br>`;
      field.supportedValues.forEach(option => {
        formHtml += `
          <input type="radio" id="${option}" name="${name}" value="${option}">
          <label for="${option}">${option}</label><br>
        `;
      });
    }
  });

  formHtml += '<button type="submit">Generate PDF</button></form>';
  return formHtml;
}

module.exports = { generateHtmlForm };
