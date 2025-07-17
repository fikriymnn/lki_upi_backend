const Invoice = require("../model/invoice_model.js");
const Order = require("../model/order_model.js");
const Foto_sample = require("../model/file/foto_sample.js");
const Jurnal_pendukung = require("../model/file/jurnal_pendukung.js");
const Hasil_analisis = require("../model/file/hasil_analisis.js");
const Bukti_pembayaran = require("../model/file/bukti_pembayaran.js");
const month_bahasa = require("../utils/month_bahasa");
const { TemplateHandler } = require("easy-template-x");
const fs = require("fs");
const path = require("path");
const replaceTextInPDF = require("../utils/pdfreplace.js");
const angkaketext = require("../utils/angkatotext.js");
var convertapi = require("convertapi")("p0YBWdWjshWqx58HPoo0qmV2kkrZ7Y4L");

const invoice_controller = {
    get_invoice: async (req, res) => {
        try {
            const { no_invoice } = req.query
            const invoice = await Invoice.findOne({ no_invoice: no_invoice }).populate("id_user")
            const order = await Order.find({ no_invoice: no_invoice })
            let total_harga = 0
            async function jp_function() {
                // let list_jp = []
                let data_pesan = []
                invoice.harga_satuan.forEach((v, i) => {
                    let obj = { jumlah: 0 }
                    obj.no = i + 1
                    obj.deskripsi = v.keterangan
                    obj.jumlah = v.jumlah
                    obj.jb = (parseInt(v.hargaSatuan).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })).replace(/\bRp\b/g, "");
                    total_harga += v.hargaSatuan * v.jumlah
                    // obj.deskripsi = `Analisis ${v.jenis_pengujian}`
                    // list_jp.forEach((v2) => {
                    //     if (v2 == v.jenis_pengujian) {
                    //         obj.jumlah += 1
                    //     }
                    // })
                    // obj.jumlah += 1
                    // list_jp.push(v.jenis_pengujian)
                    // obj.jumlah = v.jumlah_sample
                    //obj.hs = ((v.total_harga / v.jumlah_sample).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })).replace(/\bRp\b/g, "");
                    // obj.jb = (v.total_harga.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })).replace(/\bRp\b/g, "");
                    data_pesan.push(obj)
                })
                return data_pesan
            }
            const pesan = await jp_function()
            console.log("2")
            if (pesan) {
                const templateFile = fs.readFileSync(path.join(__dirname, '../templates/invoice.docx'));
                // 2. process the template
                const data = {
                    nama: invoice.nama_lengkap,
                    instansi: invoice.id_user.nama_institusi,
                    nosurat: no_invoice,
                    tanggal: invoice.date_format,
                    pesan: pesan,
                    total: (total_harga.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })).replace(/\bRp\b/g, ""),
                    jumlah: order[0].jumlah_sample,
                }
                const handler = new TemplateHandler();
                const doc = await handler.process(templateFile, data);
                // 3. send output
                const fileName = `${new Date().toISOString().slice(0, 10)}-${invoice.id_user.nama_lengkap.replace(" ", "_")}`
                const filePath = path.join(`/tmp/${fileName}.docx`);
                console.log("1")
                fs.writeFileSync(filePath, doc);
                const outputPath = path.join(`/tmp/${fileName}.pdf`);
                // replaceTextInPDF(filePath,outputPath)
                // const cek = await replaceTextInPDF(filePath,outputPath)
                await convertapi.convert('pdf', {
                    File: filePath
                }, 'docx').then(function (result) {
                    result.saveFiles(outputPath);
                    console.log('Penggantian teks selesai. File hasil disimpan di:', outputPath);
                    setTimeout(() => {
                        res.download(outputPath, `${fileName}.pdf`, (err) => {
                            if (err) {
                                console.error({ err });
                                res.status(500).send('Internal server error');
                                fs.unlinkSync(`${outputPath}`)
                                fs.unlinkSync(`${filePath}`)
                            }
                            fs.unlinkSync(`${outputPath}`)
                            fs.unlinkSync(`${filePath}`)


                        });
                    }, 1500)

                });

                // return res.download(outputPath, `${fileName}.pdf`, (err) => {
                //     if (err) {
                //          console.error({ err });
                //          res.status(500).send('Internal server error');
                //          fs.unlinkSync(`${filePath}`);
                //          fs.unlinkSync(`${outputPath}`);          
                //         }
                //          fs.unlinkSync(`${filePath}`);
                //          fs.unlinkSync(`${outputPath}`);    

                //      })

            }
        } catch (err) {
            console.log(err)
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
console.log("as")
            let jenis_jasa = [];
            let total_harga = 0;
            // const deskripsi_function = ()=>{
                
            // }
            console.log("1")
            data_invoice.harga_satuan.forEach((v) => {
                jenis_jasa.push(`${v.jumlah} ${v.keterangan}`);
                total_harga += v.hargaSatuan * v.jumlah;
            });

          jenis_jasa = jenis_jasa.join(', ')
          console.log(jenis_jasa)
          console.log("as")
            // async function deskripsi_function() {
            //     let deskripsi = "Analisiss"
            //     let jenis_pengujian = []
            //     const order = await Order.find({ no_invoice: no_invoice })

            //     order.forEach((v, i) => {
            //         if (!jenis_pengujian.includes(v.jenis_pengujian)) {
            //             deskripsi += ` ${v.jenis_pengujian}`

            //             jenis_pengujian.push(v.jenis_pengujian)
            //             console.log(deskripsi)
            //         }

            //     })
            //     return deskripsi
            // }
            console.log("2")
            const dateString = data_invoice?.s8_date?.split(' ')
            const templateFile = fs.readFileSync(path.join(__dirname, '../templates/bon.docx'));
            console.log("3")
            const handler = new TemplateHandler();
            let value = {
                tanggal: data_invoice.no_invoice,
                penerima: data_invoice.nama_lengkap,
                jenisjasa: `Analisis ${jenis_jasa||data_invoice.jenis_pengujian}`,
                // jenis_jasa: jenis_jasa,
                total: (data_invoice.total_harga.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })).replace(/\bRp\b/g, ""),
                tgltanda: `Bandung, ${dateString[1]} ${dateString[2]} ${dateString[3]}`,
                terbilang: `${angkaketext(parseInt(data_invoice.total_harga))} Rupiah`
            }
            console.log(value)
            console.log('4')
            const doc = await handler.process(templateFile, value);
            console.log('5')
            const fileName = `kuitansi_${data_invoice?.id_user?.nama_lengkap?.replace(" ", "_")}_${dateString[1]}_${dateString[2]}_${dateString[3]}`
            const filePath = path.join(`/tmp/${fileName}.docx`);
            fs.writeFileSync(filePath, doc);
            const outputPath = path.join(`/tmp/${fileName}.pdf`);
            // const cek = await replaceTextInPDF(filePath,outputPath)
            console.log("1")

            await convertapi.convert('pdf', {
                File: filePath
            }, 'docx').then(function (result) {
                result.saveFiles(outputPath);
                console.log('Penggantian teks selesai. File hasil disimpan di:', outputPath);
                setTimeout(() => {
                    res.download(outputPath, `${fileName}.pdf`, (err) => {
                        if (err) {
                            console.error({ err });
                            res.status(500).send('Internal server error');
                            fs.unlinkSync(`${outputPath}`)
                            fs.unlinkSync(`${filePath}`)
                        }
                        fs.unlinkSync(`${outputPath}`)
                        fs.unlinkSync(`${filePath}`)


                    });
                }, 1500)

            });



        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    },
    get_file: async (req, res) => {
        try {
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    },
    foto_sample: async (req, res) => {
        try {
            const { foto_sample } = req.body;
            const { id } = req.params;
            await Order.updateMany({ uuid: id }, { foto_sample });
            res.send("success");
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    },
    download_foto_sample: async (req, res) => {
        try {
            const dataorder = await Foto_sample.find({ uuid: req.params.id });

            res.setHeader("Content-Type", dataorder[0].foto_sample.contentType);

            res.setHeader(
                "Content-Disposition",
                `attachment; filename=${dataorder[0].foto_sample.originalName}`
            );
            res.send(dataorder[0].foto_sample.data);
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    },
    jurnal_pendukung: async (req, res) => {
        try {
            const { jurnal_pendukung } = req.body;
            const { id } = req.params;
            await Order.updateMany({ uuid: id }, { jurnal_pendukung });
            res.send("success");
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    },
    download_jurnal_pendukung: async (req, res) => {
        try {
            const dataorder = await Jurnal_pendukung.find({ uuid: req.params.id });
            const data = dataorder[0].jurnal_pendukung;

            res.setHeader("Content-Type", data.contentType);
            res.setHeader(
                "Content-Disposition",
                `attachment; filename=${data.originalName}`
            );
            res.send(data.data);
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    },
    hasil_analisis: async (req, res) => {
        try {
            const { id } = req.params;
            const { task, invoice_id } = req.query
            const { hasil_analisis } = req.body;
            await Order.updateOne({ _id: id }, { hasil_analisis })
            console.log(invoice_id);
            if (task == "operator") {
                console.log(task);
                await Invoice.updateOne({ _id: invoice_id }, { opTask: true })
                res.send("success");
            } else {
                res.send("success");
            }

        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    },
    download_hasil_analisis: async (req, res) => {
        try {
            const dataorder = await Hasil_analisis.aggregate([
                { $match: { uuid: req.params.id } },
                { $sort: { _id: -1 } },
            ]);
            const data = dataorder[0].hasil_analisis;

            res.setHeader("Content-Type", data.contentType);

            res.setHeader(
                "Content-Disposition",
                `attachment; filename=${data.originalName}`
            );
            res.send(data.data);
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    },
    bukti_pembayaran: async (req, res) => {
        try {
            function timeNow() {
                var d = new Date(),
                    h = (d.getHours() < 10 ? "0" : "") + d.getHours(),
                    m = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
                return h + ":" + m;
            }
            const { bukti_pembayaran } = req.body;
            const { id } = req.params;
            await Invoice.updateOne(
                { _id: id },
                {
                    bukti_pembayaran: bukti_pembayaran,
                    status: "Menunggu Konfirmasi Pembayaran",
                    s7_date: `${timeNow()} ${new Date().getDate()} ${month_bahasa(
                        new Date().getMonth()
                    )} ${new Date().getFullYear()}`,
                }
            );
            res.send("success");
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    },
    download_bukti_pembayaran: async (req, res) => {
        try {
            const dataorder = await Bukti_pembayaran.aggregate([
                { $match: { id_invoice: req.params.id } },
                { $sort: { _id: -1 } },
            ]);
            const data = dataorder[0].bukti_pembayaran;

            res.setHeader("Content-Type", data.contentType);

            res.setHeader(
                "Content-Disposition",
                `attachment; filename=${data.originalName}`
            );
            res.send(data.data);
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    },
};

module.exports = invoice_controller;
