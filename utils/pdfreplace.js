var convertapi = require('convertapi')('tUY1SAueJrc3tlrL');

module.exports = replaceTextInPDF = async (inputFilePath, outputFilePath) => {
    try {
        const apis = 'tUY1SAueJrc3tlrL'
        const apik = '386024650'
  
        await convertapi.convert('pdf', {
            File: inputFilePath
        }, 'docx').then(function (result) {
            result.saveFiles(outputFilePath);
            console.log('Penggantian teks selesai. File hasil disimpan di:', outputFilePath);  
        });
        
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
    }
}



// Contoh penggunaan
// const inputPDF = 'invoice.pdf';
// const outputPDF = 'modified_invoice.pdf';
// const replacements = {
//     'CUSTOMER_NAME': 'John Doe',
//     'INVOICE_NUMBER': 'INV-12345',
//     // Tambahkan lebih banyak penggantian teks di sini sesuai kebutuhan
// };

// replaceTextInPDF(inputPDF, outputPDF, replacements);