require("dotenv").config({ path: "config.env" });
const fs = require('fs')
const path = require('path')
const express = require('express')
const body_parser = require('body-parser')
const cookie_parser = require('cookie-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()
const {TemplateHandler} = require('easy-template-x');
app.use(cors({credentials: true, origin: true }))
const XlsxTemplate = require('xlsx-template');
// const { __dirname } = require("./global.js");
console.log(__dirname);
const URL = process.env.DATABASE_URL
const PORT = process.env.PORT || 5000
try{
    mongoose.connect(URL)
}catch(err){
    console.log(err.message)
}



app.use(cors({credentials: true, origin: true }))
app.use(body_parser.json())
app.use(body_parser.urlencoded({extended:true}))
app.use(cookie_parser())

app.use("/api",require('./routes/router'))

// app.post('/api/generate-word-document', async (req, res) => {
//     // 1. read template file
//     const templateFile = fs.readFileSync('./public/doc/template/LaporanHasil.docx');

//     // 2. process the template
//     const data = req.body
//     const handler = new TemplateHandler();
//     const doc = await handler.process(templateFile, data);

//     // 3. send output
//     const fileName = `${new Date().toISOString().slice(0, 10)}-${data.nama.replace(" ", "_")}.docx`
//     const filePath = path.join(__dirname, `/public/doc/hasil/${fileName}`);
//     fs.writeFileSync(filePath, doc);
//     console.log(filePath);
//     res.download(`${filePath}`, fileName, (err) => {
//         if (err) {
//             console.error(err);
//             res.status(500).send('Internal server error');
//             fs.unlinkSync(`${filePath}`);
//         }
//     });
// });

// app.get('/api/generate-invoice/:id', async (req, res) => {
//     // 1. read template file
//     const templateFile = fs.readFileSync('./public/doc/template/invoice.docx');

//     // 2. process the template
//     const data = {
//         nama: "Sumanto",
//         instansi:"UPI/KIMIA",
//         nosurat:"LK/231/12/2024/01",
//         tanggal:"32/12/2024",
//         deskripsi:"Analisis GMCH",
//         jumlah:2,
//         hs:300000,
//         jb:600000,
//         total:600000
//     }
//     const handler = new TemplateHandler();
//     const doc = await handler.process(templateFile, data);

//     // 3. send output
//     const fileName = `${new Date().toISOString().slice(0, 10)}-${data.nama.replace(" ", "_")}.docx`
//     const filePath = path.join(__dirname, `/public/doc/template/${fileName}`);

//     fs.writeFileSync(filePath, doc);
//     res.download(`${filePath}`, fileName, (err) => {
//         if (err) {
//             console.error({ err });
//             res.status(500).send('Internal server error');
//             fs.unlinkSync(`${filePath}`);
//         }
//     });
// });

// app.post('/api/generate-excel', async (req, res) => {

//     fs.readFile(path.join('./public/xlsx/template/bon.xlsx'), function (err, data) {

//         // Create a template
//         var template = new XlsxTemplate(data);

//         // Replacements take place on first sheet
//         var sheetNumber = 1;

//         // Set up some placeholder values matching the placeholders in the template
//         var values = {
//             tanggal: '2023-11-22',
//             penerima: 'gilang',
//             jenis_jasa: 'cek tanah',
//             total: 20000,
//             tgltanda: "bandung,24 mei 2024"
//         };
//         console.log("2")
//         // Perform substitution
//         template.substitute(sheetNumber, values);

//         // Get binary data
//         var data = template.generate();
//         const fileName = `${new Date().toISOString().slice(0, 10)}-${values.penerima.replace(" ", "_")}.xlsx`
//         const filePath = path.join(__dirname, `./public/xlsx/output/${fileName}`);
//         console.log("3")
//         fs.writeFileSync(filePath, data, 'binary');

//         console.log("4")
//         res.download(`${filePath}`, fileName, (err) => {
//             if (err) {
//                 console.error({ err });
//                 res.status(500).send('Internal server error');
//                 fs.unlinkSync(`${filePath}`);
//             }
//             console.log("download berhasil");
//         });
//     })
// })


app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})
