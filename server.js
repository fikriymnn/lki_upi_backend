require("dotenv").config({ path: "config.env" });
const express = require('express')
const body_parser = require('body-parser')
const cookie_parser = require('cookie-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()
const {TemplateHandler} = require('easy-template-x');
console.log(__dirname);
const URL = process.env.DATABASE_URL
const PORT = process.env.PORT || 5000


app.use(cors({credentials: true, origin: true }))
app.use(body_parser.json())
app.use(body_parser.urlencoded({extended:true}))
app.use(cookie_parser())
app.use("/api",require('./routes/router'))

app.post('/api/generate-word-document', async (req, res) => {
    // 1. read template file
    const templateFile = fs.readFileSync('./public/doc/template/LaporanHasil.docx');

    // 2. process the template
    const data = req.body
    const handler = new TemplateHandler();
    const doc = await handler.process(templateFile, data);

    // 3. send output
    const fileName = `${new Date().toISOString().slice(0, 10)}-${data.nama.replace(" ", "_")}.docx`
    const filePath = path.join(__dirname, `/public/doc/hasil/${fileName}`);
    fs.writeFileSync(filePath, doc);
    console.log(filePath);
    res.download(`${filePath}`, fileName, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal server error');
            fs.unlinkSync(`${filePath}`);
        }
    });
});

app.get('/api/generate-invoice', async (req, res) => {
    // 1. read template file
    const templateFile = fs.readFileSync('./public/doc/template/invoice.docx');

    // 2. process the template
    const data = {
        nama: "Sumanto",
        instansi:"UPI/KIMIA",
        nosurat:"LK/231/12/2024/01",
        tanggal:"32/12/2024",
        deskripsi:"Analisis GMCH",
        jumlah:2,
        hs:300000,
        jb:600000,
        total:600000
    }
    const handler = new TemplateHandler();
    const doc = await handler.process(templateFile, data);

    // 3. send output
    const fileName = `${new Date().toISOString().slice(0, 10)}-${data.nama.replace(" ", "_")}.docx`
    const filePath = path.join(__dirname, `/public/doc/template/${fileName}`);

    fs.writeFileSync(filePath, doc);
    res.download(`${filePath}`, fileName, (err) => {
        if (err) {
            console.error({ err });
            res.status(500).send('Internal server error');
            fs.unlinkSync(`${filePath}`);
        }
    });
});

mongoose.connect(URL)
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})
