const Invoice = require("../model/invoice_model.js")
const Order = require("../model/order_model.js")
const Foto_sample = require("../model/file/foto_sample.js")
const Jurnal_pendukung = require("../model/file/jurnal_pendukung.js")
const Hasil_analisis = require("../model/file/hasil_analisis.js")
const Bukti_pembayaran = require("../model/file/bukti_pembayaran.js")
const month_bahasa = require("../utils/month_bahasa")
const { TemplateHandler } = require('easy-template-x');
const XlsxTemplate = require('xlsx-template');
const fs = require('fs')
const path = require('path');

const invoice_controller = {
    get_invoice: async (req, res) => {
        try {
            const { no_invoice } = req.query
            const invoice = await Invoice.findOne({ no_invoice: no_invoice }).populate("id_user")


            async function jp_function() {

                let list_jp = []
                let data_pesan = []
                const order = await Order.find({ no_invoice: no_invoice })
                

                order.forEach((v, i) => {
                    let obj = { jumlah: 0 }
                    obj.deskripsi = `Analisis ${v.jenis_pengujian}`

                    list_jp.forEach((v2) => {
                        if (v2 == v.jenis_pengujian) {
                            obj.jumlah += 1
                        }
                    })
                    obj.jumlah += 1
                    list_jp.push(v.jenis_pengujian)

                    obj.hs = '-'
                    obj.jb = '-'
                    data_pesan.push(obj)
                })
                return data_pesan
            }
            const pesan = await jp_function()

            if (pesan) {
                const templateFile = fs.readFileSync('./templates/invoice.docx');

                // 2. process the template
                const data = {
                    nama: invoice.id_user.nama_lengkap,
                    instansi: invoice.id_user.nama_institusi,
                    nosurat: no_invoice,
                    tanggal: invoice.date_format,
                    pesan: pesan,
                    total: invoice.total_harga
                }
                const handler = new TemplateHandler();
                const doc = await handler.process(templateFile, data);

                // 3. send output
                const fileName = `${new Date().toISOString().slice(0, 10)}-${invoice.id_user.nama_lengkap.replace(" ", "_")}.docx`
                const filePath = path.join(`./templates/${fileName}`);
                fs.writeFileSync(filePath, doc);




                return res.download(`${filePath}`, fileName, (err) => {
                    if (err) {
                        console.error({ err });
                        res.status(500).send('Internal server error');
                        fs.unlinkSync(`${filePath}`);
                    }

                    fs.unlinkSync(filePath);
                })
            }
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            })
        }

    },
    get_kuitansi: async (req, res) => {
        try {
            const { no_invoice } = req.query
           
            const data_invoice = await Invoice.findOne({ no_invoice: no_invoice }).populate('id_user')

            async function deskripsi_function() {
                let deskripsi = "Analisis"
                let jenis_pengujian = []
                const order = await Order.find({ no_invoice: data_invoice.no_invoice })

                order.forEach((v, i) => {
                    if (!jenis_pengujian.includes(v.jenis_pengujian)) {
                        deskripsi += ` ${v.jenis_pengujian}`
                        jenis_pengujian.push(v.jenis_pengujian)
                    }
                })
                return deskripsi
            }
            const deskripsi = await deskripsi_function()
           
            if (deskripsi) {
          
                fs.readFile(path.join('./templates/bon.xlsx'), function (err, data) {
                    
                    // Create a template
                    var template = new XlsxTemplate(data);

                    // Replacements take place on first sheet
                    var sheetNumber = 1;

                    // Set up some placeholder values matching the placeholders in the template
                    var dateString = data_invoice?.s8_date?.split(' ')
                    var values = {
                        tanggal: data_invoice.no_invoice,
                        penerima: data_invoice?.id_user?.nama_lengkap,
                        jenis_jasa: deskripsi,
                        total: data_invoice.total_harga,
                        tgltanda: `Bandung, ${dateString[1]} ${dateString[2]} ${dateString[3]}`
                    };
                   
                   
                    // Perform substitution
                    template.substitute(sheetNumber, values);
                  
                    // Get binary data
                    if (values) {

                    }
                    var data = template.generate();
                    const fileName = `${data_invoice?.id_user?.nama_lengkap?.replace(" ", "_")}_${dateString[1]}_${dateString[2]}_${dateString[3]}_kuitansi.xlsx`
                    const filePath = path.join(__dirname, `../templates/${fileName}`);
                 
                    fs.writeFileSync(filePath, data, 'binary');
                 
                    res.download(`${filePath}`, fileName, (err) => {
                        if (err) {
                            console.error({ err });
                            res.status(500).send('Internal server error');
                            fs.unlinkSync(`${filePath}`);
                        }
                        fs.unlinkSync(filePath);
                    });


                })
            }



        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            })
        }

    },
    get_file: async (req, res) => {
        try {


        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            })
        }

    },
    foto_sample: async (req, res) => {
        try {
            const { buffer, mimetype, originalname } = req.file
            const { id } = req.params
            const obj = {
                data: buffer,
                contentType: mimetype,
                originalName: originalname
            }

          
            await Order.updateMany({uuid:id},{foto_sample:originalname})
            const newFile = new Foto_sample({
                foto_sample: obj,
                uuid: id
            })
            await newFile.save()
            res.send("success")


        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            })
        }
    },
    download_foto_sample: async (req, res) => {
        try {
            const dataorder = await Foto_sample.find({ uuid: req.params.id })
          
           

            res.setHeader("Content-Type", dataorder[0].foto_sample.contentType);

            res.setHeader(
                "Content-Disposition",
                `attachment; filename=${dataorder[0].foto_sample.originalName}`
            );
            res.send(dataorder[0].foto_sample.data)
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            })
        }
    },
    jurnal_pendukung: async (req, res) => {
        try {
            const { buffer, mimetype, originalname } = req.file
            const { id } = req.params
            const obj = {
                data: buffer,
                contentType: mimetype,
                originalName: originalname
            }
            await Order.updateMany({uuid:id},{jurnal_pendukung:originalname})
            const newFile = new Jurnal_pendukung({
                jurnal_pendukung: obj,
                uuid: id
            })
            await newFile.save()
            res.send("success")




        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            })
        }
    },
    download_jurnal_pendukung: async (req, res) => {
        try {
            const dataorder = await Jurnal_pendukung.find({ uuid: req.params.id })
            const data = dataorder[0].jurnal_pendukung

            res.setHeader("Content-Type", data.contentType);
            res.setHeader(
                "Content-Disposition",
                `attachment; filename=${data.originalName}`
            );
            res.send(data.data)
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            })
        }
    },
    hasil_analisis: async (req, res) => {
        try {
            const { buffer, mimetype, originalname } = req.file
            const {id} = req.params;
            const obj = {
                data: buffer,
                contentType: mimetype,
                originalName: originalname
            }
            console.log(req.file)

         
            await Order.updateOne({_id:id},{hasil_analisis:originalname})
            if(obj){
                const newFile = new Hasil_analisis({
                    hasil_analisis: obj,
                    uuid: id
                })
                await newFile.save()
                res.send("success")
            }
           
           
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            })
        }
    },
    download_hasil_analisis: async (req, res) => {
        try {
            const dataorder = await Hasil_analisis.aggregate([{$match:{ uuid: req.params.id }},{$sort:{_id:-1}}])
            const data =  dataorder[0].hasil_analisis

            res.setHeader("Content-Type", data.contentType);

            res.setHeader(
                "Content-Disposition",
                `attachment; filename=${data.originalName}`
            );
            res.send(data.data)
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            })
        }
    },
    bukti_pembayaran: async (req, res) => {
        try {
            function timeNow() {
                var d = new Date(),
                  h = (d.getHours() < 10 ? '0' : '') + d.getHours(),
                  m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
                return h + ':' + m;
              }
            const { buffer, mimetype, originalname } = req.file
            const {id} = req.params
            
            const obj = {
                data: buffer,
                contentType: mimetype,
                originalName: originalname
            }
            await Invoice.updateOne({_id:id},{bukti_pembayaran:originalname,status:'menunggu konfirmasi pembayaran',s7_date:`${timeNow()} ${new Date().getDate()} ${month_bahasa(new Date().getMonth())} ${new Date().getFullYear()}`})
           
            const newFile = new Bukti_pembayaran({
                bukti_pembayaran: obj,
                id_invoice: id
            })
           
            await newFile.save()
            res.send("success")
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            })
        }
    },
    download_bukti_pembayaran: async (req, res) => {
        try {
            const dataorder = await Bukti_pembayaran.aggregate([{$match:{ id_invoice: req.params.id }},{$sort:{_id:-1}}])
            const data = dataorder[0].bukti_pembayaran

            res.setHeader("Content-Type", data.contentType);

            res.setHeader(
                "Content-Disposition",
                `attachment; filename=${data.originalName}`
            );
            res.send(data.data)
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            })
        }
    }



}

module.exports = invoice_controller