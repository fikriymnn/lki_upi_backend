const Invoice = require("../model/invoice_model");
const month_bahasa = require("../utils/month_bahasa");
const Order = require("../model/order_model");
const mongoose = require("mongoose");
const user_model = require("../model/user_model");

// ── Helper untuk auto-hitung estimasi_date ──────────────────────────
function get_hari_kerja(lama_pengerjaan_str) {
  if (!lama_pengerjaan_str) return 0;
  const match = lama_pengerjaan_str.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

function parse_tanggal_indo(date_str) {
  // format: "HH:mm D Month YYYY" contoh "14:32 27 Juli 2026"
  if (!date_str) return null;
  const parts = date_str.trim().split(" ");
  const tahun = parseInt(parts[parts.length - 1]);
  const bulanNama = parts[parts.length - 2];
  const tanggal = parseInt(parts[parts.length - 3]);

  const bulanIndex = [...Array(12).keys()].findIndex(
    (i) => month_bahasa(i) === bulanNama
  );

  if (isNaN(tahun) || isNaN(tanggal) || bulanIndex === -1) return null;
  return new Date(tahun, bulanIndex, tanggal);
}

function add_hari_kerja(startDate, jumlahHari) {
  const result = new Date(startDate);
  let added = 0;
  while (added < jumlahHari) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay(); // 0 = Minggu, 6 = Sabtu
    if (day !== 0 && day !== 6) {
      added++;
    }
  }
  return result;
}

function format_tanggal_indo(date) {
  return `${date.getDate()} ${month_bahasa(date.getMonth())} ${date.getFullYear()}`;
}

function formatUserData(invoice) {
  if (invoice.user_data) {
    invoice.id_user = [
      {
        nama_lengkap: invoice.user_data.nama_lengkap,
        email: invoice.user_data.email,
        no_telp: invoice.user_data.no_telp,
        no_whatsapp: invoice.user_data.no_whatsapp,
        jenis_institusi: invoice.user_data.jenis_institusi,
        nama_institusi: invoice.user_data.nama_institusi,
        program_studi: invoice.user_data.program_studi,
        fakultas: invoice.user_data.fakultas
      }
    ];
  }

  return invoice;
}


const invoice_controller = {
  get_invoice: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        skip,
        limit,
        status,
        id_user,
        from,
        to,
        no_invoice,
        month,
        year,
        success,
        jenis_pengujian,
        nama_lengkap
      } = req.query;


      if (id) {
        const data = await Invoice.findOne({ _id: id })
          .populate("id_user")
          .select({ id_user: { _id: 0 } });

        const raw = data.toObject();

        if (raw.user_data) {
          raw.id_user = {
            nama_lengkap: raw.user_data.nama_lengkap,
            email: raw.user_data.email,
            no_telp: raw.user_data.no_telp,
            no_whatsapp: raw.user_data.no_whatsapp,
            jenis_institusi: raw.user_data.jenis_institusi,
            nama_institusi: raw.user_data.nama_institusi,
            program_studi: raw.user_data.program_studi,
            fakultas: raw.user_data.fakultas,
          };
        }

        res.status(200).json({
          success: true,
          data: raw,
        });


      } else if (
        nama_lengkap &&
        skip &&
        limit &&
        (status ||
          no_invoice ||
          id_user ||
          from ||
          to ||
          month ||
          year ||
          success ||
          jenis_pengujian)
      ) {

        let obj = {};

        const s = parseInt(skip);
        const l = parseInt(limit);


        if (status) {
          obj.status = status instanceof Array ? { $in: status } : status;
        }

        if (id_user) {
          obj.id_user = new mongoose.Types.ObjectId(id_user);
        }

        if (no_invoice) {
          obj.no_invoice = no_invoice;
        }

        if (from && to) {
          obj.date = { $lt: to, $gt: from };
        }

        if (year) {
          obj.year = year;
        }

        if (month) {
          obj.month = month;
        }

        if (success) {
          obj.success = success == "true";
        }

        if (jenis_pengujian) {
          obj.jenis_pengujian = jenis_pengujian;
        }

        if (nama_lengkap) {
          obj.nama_lengkap = {
            $regex: nama_lengkap,
            $options: "i"
          };
        }


        let data = await Invoice.aggregate([
          {
            $match: obj
          },
          {
            $lookup: {
              foreignField: "_id",
              localField: "id_user",
              from: "users",
              as: "id_user",
            },
          },
          {
            $sort: {
              _id: -1
            }
          }
        ])
          .skip(s)
          .limit(l);

        data = data.map(item => formatUserData(item));

        const length_data = await Invoice.aggregate([
          {
            $match: obj
          }
        ]);

        res.status(200).json({
          success: true,
          length_total: length_data.length,
          data,
        });


      } else if (
        skip &&
        limit &&
        (status ||
          no_invoice ||
          id_user ||
          from ||
          to ||
          month ||
          year ||
          success ||
          jenis_pengujian)
      ) {

        let obj = {};

        const s = parseInt(skip);
        const l = parseInt(limit);


        if (status) {
          obj.status = status instanceof Array ? { $in: status } : status;
        }

        if (id_user) {
          obj.id_user = new mongoose.Types.ObjectId(id_user);
        }

        if (no_invoice) {
          obj.no_invoice = no_invoice;
        }

        if (from && to) {
          obj.date = { $lt: to, $gt: from };
        }

        if (year) {
          obj.year = year;
        }

        if (month) {
          obj.month = month;
        }

        if (success) {
          obj.success = success == "true";
        }

        if (jenis_pengujian) {
          obj.jenis_pengujian = jenis_pengujian;
        }


        let data = await Invoice.aggregate([
          {
            $match: obj
          },
          {
            $lookup: {
              foreignField: "_id",
              localField: "id_user",
              from: "users",
              as: "id_user",
            },
          },
          {
            $sort: {
              _id: -1
            }
          }
        ])
          .skip(s)
          .limit(l);

        data = data.map(item => formatUserData(item));

        const length_data = await Invoice.aggregate([
          {
            $match: obj
          }
        ]);

        res.status(200).json({
          success: true,
          length_total: length_data.length,
          data,
        });


      } else if (
        status ||
        no_invoice ||
        id_user ||
        from ||
        to ||
        month ||
        year ||
        success ||
        jenis_pengujian
      ) {

        let obj = {};

        if (status) {
          obj.status = status instanceof Array ? { $in: status } : status;
        }

        if (id_user) {
          obj.id_user = new mongoose.Types.ObjectId(id_user);
        }

        if (no_invoice) {
          obj.no_invoice = no_invoice;
        }

        if (from && to) {
          obj.date = { $lt: to, $gt: from };
        }

        if (year) {
          obj.year = year;
        }

        if (month) {
          obj.month = month;
        }

        if (success) {
          obj.success = success == "true";
        }

        if (jenis_pengujian) {
          obj.jenis_pengujian = jenis_pengujian;
        }

        let data = await Invoice.aggregate([
          {
            $match: obj
          },
          {
            $lookup: {
              foreignField: "_id",
              localField: "id_user",
              from: "users",
              as: "id_user",
            },
          },
          {
            $sort: {
              _id: -1
            }
          }
        ]);

        data = data.map(item => formatUserData(item));

        const length_data = await Invoice.aggregate([
          {
            $match: obj
          }
        ]);

        res.status(200).json({
          success: true,
          length_total: length_data.length,
          data,
        });


      } else if (skip && limit) {

        let data = await Invoice.aggregate([
          {
            $lookup: {
              from: "users",
              localField: "id_user",
              foreignField: "_id",
              as: "id_user",
            },
          },
          {
            $sort: {
              _id: -1
            }
          }
        ])
          .skip(parseInt(skip))
          .limit(parseInt(limit));

        data = data.map(item => formatUserData(item));

        const length_data = await Invoice.find();

        res.status(200).json({
          success: true,
          length_total: length_data.length,
          data
        });


      } else {

        let data = await Invoice.aggregate([
          {
            $lookup: {
              from: "users",
              localField: "id_user",
              foreignField: "_id",
              as: "id_user"
            }
          },
          {
            $sort: {
              _id: -1
            }
          }
        ]);

        data = data.map(item => formatUserData(item));

        res.status(200).json({
          success: true,
          data
        });

      }


    } catch (err) {

      res.status(500).json({
        success: false,
        message: err.message
      });

    }
  },
  update_invoice: async (req, res) => {
    try {
      const { id } = req.params;
      let { total_harga, s5_date, s6_date, s8_date, status, harga_satuan, estimasi_date, catatan } = req.body;

      // ── NEW: auto-hitung estimasi_date saat status jadi "Form Dikonfirmasi" ──
      if (status === "Form Dikonfirmasi" && req.body.s2_date) {
        const invoiceMeta = await Invoice.findOne({ _id: id }).select("no_invoice");
        const orders = await Order.find({ no_invoice: invoiceMeta?.no_invoice });

        const maxHariKerja = orders.length > 0
          ? Math.max(...orders.map((o) => get_hari_kerja(o.lama_pengerjaan)))
          : 0;

        const tanggalMulai = parse_tanggal_indo(req.body.s2_date);
        if (tanggalMulai && maxHariKerja > 0) {
          const tanggalEstimasi = add_hari_kerja(tanggalMulai, maxHariKerja);
          estimasi_date = format_tanggal_indo(tanggalEstimasi);
          req.body.estimasi_date = estimasi_date;
        }
      }
      // ────────────────────────────────────────────────────────────────────────

      if (status == "Order Dibatalkan") {
        await Invoice.updateOne({ _id: id }, { status: "Order Dibatalkan", success: true });
      } else {
        if (harga_satuan && req.body.harga_satuan.length > 0) {
          let jumlahHarga = 0;
          harga_satuan.forEach((v) => {
            jumlahHarga += parseInt(v.hargaSatuan) * parseInt(v.jumlah);
          })
          console.log(req.body)
          if (jumlahHarga > 0) {
            await Invoice.updateOne({ _id: id }, {
              total_harga: jumlahHarga, status,
              estimasi_date,
              catatan, harga_satuan
            })
          } else {
            await Invoice.updateOne({ _id: id }, req.body)
          }

        }
      }
      const data = await Invoice.findOne({ _id: id });
      if (data) {
        console.log(1)
        if (total_harga) {
          await Order.updateOne(
            { no_invoice: data?.no_invoice },
            { total_harga: total_harga }
          );
        }
        if (status == "Menunggu Pembayaran") {
          await Order.updateOne(
            { no_invoice: data?.no_invoice },
            { status_pengujian: "success", status_report: "success", admin_date: s8_date }
          );
        }

        if (status == "menunggu form dikonfirmasi" || status == "Sample Dikerjakan Operator" || status == "Menunggu Verifikasi") {
          await Order.updateOne(
            { no_invoice: data?.no_invoice },
            { status_pengujian: "-", status_report: "-" }
          );
        }

        if (status == "Selesai" && s8_date) {
          await Invoice.updateOne({ _id: id }, { s8_date: s8_date });
          await Order.updateOne(
            { no_invoice: data?.no_invoice },
            { status_pengujian: "success", status_report: "success" },
            { admin_date: s8_date }
          );
        } else if (status == "Selesai") {
          await Invoice.updateOne({ _id: id }, { s8_date: `${timeNow()} ${new Date().getDate()} ${month_bahasa(new Date().getMonth())} ${new Date().getFullYear()}` });
          await Order.updateOne(
            { no_invoice: data?.no_invoice },
            { status_pengujian: "success", status_report: "success" },
          );
        } else if (s8_date) {
          await Invoice.updateOne({ _id: id }, { s8_date: s8_date });
          await Order.updateOne(
            { no_invoice: data?.no_invoice },
            { admin_date: s8_date }
          );
        }

        if (status == "Order Dibatalkan") {
          await Order.updateOne(
            { no_invoice: data?.no_invoice },
            { status_pengujian: "-", status_report: "-" },
          );
        }

        if (status == "Sembunyikan") {
          await Order.updateOne(
            { no_invoice: data?.no_invoice },
            { status_pengujian: "-", status_report: "-" },
          );
        }

        if (s5_date) {
          await Order.updateOne(
            { no_invoice: data?.no_invoice },
            { operator_date: s5_date }
          );
        }
        if (s6_date) {
          await Order.updateOne(
            { no_invoice: data?.no_invoice },
            { pj_date: s6_date }
          );
          console.log(s6_date);
        }

        await Invoice.updateOne({ _id: id }, req.body);

      }
      res.status(200).json({
        success: true,
        message: "Update successfully!",
        data,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
  delete_invoice: async (req, res) => {
    try {
      const { no_invoice } = req.query;
      await Order.deleteOne({ no_invoice: no_invoice });
      await Invoice.deleteOne({ no_invoice: no_invoice });

      res.status(200).json({
        success: true,
        message: "Delete successfully!",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
};

module.exports = invoice_controller;