import { PDFDocument } from 'pdf-lib';

export const generatePDFHash = async (file: File): Promise<string> => {
  try {
    // Step 1: Load the PDF and strip metadata
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Remove metadata fields
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');
    pdfDoc.setCreationDate(new Date(0));
    pdfDoc.setModificationDate(new Date(0));

    // Serialize the stripped PDF
    const strippedPdfBytes = await pdfDoc.save();

    // Step 2: Hash the stripped PDF using SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', strippedPdfBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
  } catch (error) {
    console.error('Error generating PDF hash:', error);
    throw error;
  }
};
