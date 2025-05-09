const Order = require("../model/order_model");
const Invoice = require("../model/invoice_model");
const month_bahasa = require("../utils/month_bahasa");

const order_controller = {
  get_order: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        report,
        skip,
        limit,
        status_pengujian,
        status_report,
        kode_pengujian,
        jenis_pengujian,
        id_user,
        from,
        to,
        month,
        year,
        no_invoice,
      } = req.query;


      if (id) {
        const data = await Order.findOne({ _id: id }).populate("id_user");
        res.status(200).json({
          success: true,
          data,
        });
      } else if (
        report &&
        skip &&
        limit &&
        (status_pengujian ||
          status_report ||
          kode_pengujian ||
          jenis_pengujian ||
          id_user ||
          from ||
          to ||
          month ||
          year ||
          no_invoice)
      ) {
        let obj = {};
        if (status_pengujian) {
          obj.status_pengujian = status_pengujian;
        }
        if (status_report) {
          obj.status_report = status_report;
        }
        if (kode_pengujian) {
          obj.kode_pengujian = kode_pengujian;
        }
        if (jenis_pengujian) {
          obj.jenis_pengujian = jenis_pengujian;
        }
        if (id_user) {
          obj.id_user = id_user;
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
        if (no_invoice) {
          obj.no_invoice = no_invoice;
        }

        const data = await Order.aggregate([
          { $match: obj },
          { $sort: { _id: -1 } },
          {
            $lookup: {
              foreignField: "_id",
              localField: "id_user",
              from: "users",
              as: "id_user",
            },
          },
          {
            $project: {
              jurnal_pendukung: 0,
              foto_sample: 0,
              hasil_analisis: 0,
            },
          },
        ])
          .skip(parseInt(skip))
          .limit(parseInt(limit));


        const length_data = await Order.aggregate([{ $match: obj }]);

        res.status(200).json({
          success: true,
          length_total: length_data.length,
          data,
        });
      } else if (
        skip &&
        limit &&
        (status_pengujian ||
          status_report ||
          kode_pengujian ||
          jenis_pengujian ||
          id_user ||
          from ||
          to ||
          month ||
          year ||
          no_invoice)
      ) {
        
        let obj = {};
        if (status_pengujian) {
          obj.status_pengujian = status_pengujian;
        }
        if (status_report) {
          obj.status_report = status_report;
        }
        if (kode_pengujian) {
          obj.kode_pengujian = kode_pengujian;
        }
        if (jenis_pengujian) {
          obj.jenis_pengujian = jenis_pengujian;
        }
        if (id_user) {
          obj.id_user = id_user;
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
        if (no_invoice) {
          obj.no_invoice = no_invoice;
        }

        const data = await Order.aggregate([
          { $match: obj },
          { $sort: { _id: -1 } },
          {
            $lookup: {
              foreignField: "_id",
              localField: "id_user",
              from: "users",
              as: "id_user",
            },
          },
        ])
          .skip(parseInt(skip))
          .limit(parseInt(limit));
        const length_data = await Order.aggregate([{ $match: obj }]);
        res.status(200).json({
          success: true,
          length_total: length_data.length,
          data,
        });
      }else if (
        status_pengujian ||
          status_report ||
          kode_pengujian ||
          jenis_pengujian ||
          id_user ||
          from ||
          to ||
          month ||
          year ||
          no_invoice
      ) {
        
        let obj = {};
        if (status_pengujian) {
          obj.status_pengujian = status_pengujian;
        }
        if (status_report) {
          obj.status_report = status_report;
        }
        if (kode_pengujian) {
          obj.kode_pengujian = kode_pengujian;
        }
        if (jenis_pengujian) {
          obj.jenis_pengujian = jenis_pengujian;
        }
        if (id_user) {
          obj.id_user = id_user;
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
        if (no_invoice) {
          obj.no_invoice = no_invoice;
        }

        const data = await Order.aggregate([
          { $match: obj },
          { $sort: { _id: -1 } },
          {
            $lookup: {
              foreignField: "_id",
              localField: "id_user",
              from: "users",
              as: "id_user",
            },
          },
        ])
        const length_data = await Order.aggregate([{ $match: obj }]);
        res.status(200).json({
          success: true,
          length_total: length_data.length,
          data,
        });
      } else if (skip && limit) {
        const data = await Order.aggregate([
          { $sort: { _id: -1 } },
          {
            $lookup: {
              foreignField: "_id",
              localField: "id_user",
              from: "users",
              as: "id_user",
            },
          },
        ])
          .skip(parseInt(skip))
          .limit(parseInt(limit));

        const length_data = await Order.find();
        return res.status(200).json({
          success: true,
          length_total: length_data.length,
          data,
        });
      } else if (no_invoice) {
        const data = await Order.findOne({ no_invoice: no_invoice }).populate(
          "id_user"
        );
        res.status(200).json({
          success: true,
          data,
        });
      } else {
        await Order.updateMany({"status_pengujian": "prasuccess"}, {"$set":{"status_pengujian": "success"}})
        
        const data = await Order.aggregate([
          { $sort: { _id: -1 } },
          {
            $lookup: {
              foreignField: "_id",
              localField: "id_user",
              from: "users",
              as: "id_user",
            },
          },
        ]);
        //  data.forEach((v,i)=>{
        //   async function cek(){
        //     await Order.findByIdAndUpdate(v._id,{nama_lengkap : v.id_user[0].nama_lengkap})
        //   } 
        //  cek()
        // })
        res.status(200).json({
          success: true,
          data,
        });
      }
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  add_order: async (req, res) => {
    try {
      const current_year = new Date().getFullYear().toString();
      const month = new Date().getMonth().toString();
      const current_month = month_bahasa(new Date().getMonth());
      let no_urut = 0;
      const data_order = await Invoice.find({ year: new Date().getFullYear() });
      function timeNow() {
        var d = new Date(),
          h = (d.getHours() < 10 ? "0" : "") + d.getHours(),
          m = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
        return h + ":" + m;
      }
      const dateFormatTgl = `${timeNow()} ${new Date().getDate()} ${month_bahasa(
        new Date().getMonth()
      )} ${new Date().getFullYear()}`;

      if (data_order.length >= 1) {
        no_urut = data_order.length;
      }

      let invoice = `${no_urut + 1}/LKI/UPI/${current_year}`;
      let arr = [];
      async function jenis_pengujian() {
        let jp = [];
        var no = 0;
        for (let i = 0; i < req.body.length; i++) {
          for (let a = 0; a < req.body[i]?.jenis_pengujian?.length; a++) {
            try {
              if (jp.includes(req.body[i].jenis_pengujian[a])) {
                jp.forEach((v) => {
                  if (v == req.body[i].jenis_pengujian[a]) {
                    no++;
                  }
                });
              }

              jp.push(req.body[0].jenis_pengujian[0]);
              const data = await Order.find({
                jenis_pengujian: req.body[i].jenis_pengujian[a],
                year: current_year,
                month: month,
              });

              let obj = {};
              let kode = `${
                req.body[i].kode_pengujian[a]
              }-${current_month}/${current_year}/${data.length + no + 1}`;
              obj.date_format = `${new Date().getDate()} ${month_bahasa(
                new Date().getMonth()
              )} ${new Date().getFullYear()}`;

              obj.id_user = req.user._id;
              obj.nama_lengkap = req.user.nama_lengkap;
              obj.no_invoice = invoice;
              obj.jenis_pengujian = req.body[0].jenis_pengujian[0];
              obj.kode_pengujian = kode;
              obj.nama_sample = req.body[i].nama_sample;
              obj.jumlah_sample = req.body[i].jumlah_sample;
              obj.wujud_sample = req.body[i].wujud_sample;
              obj.pelarut = req.body[i].pelarut;
              obj.preparasi_khusus = req.body[i].preparasi_khusus;
              obj.target_senyawa = req.body[i].target_senyawa;
              obj.metode_parameter = req.body[i].metode_parameter;
              obj.deskripsi_sample = req.body[i].deskripsi_sample;
              obj.riwayat_pengujian = req.body[i].riwayat_pengujian;
              obj.sample_dikembalikan = req.body[i].sample_dikembalikan;
              obj.nama_pembimbing = req.body[i].nama_pembimbing;
              obj.lama_pengerjaan = req.body[i].lama_pengerjaan;
              obj.dana_penelitian = req.body[i].dana_penelitian;

              obj.uuid = req.body[i].uuid;
              
              if(data && obj.uuid) arr.push(obj);
              
              no = 0;
            } catch (err) {
              console.log(err);
            }
          }
        }
        return true;
      }
      const arry = await jenis_pengujian();
      if (arr.length > 0) {
        await Order.insertMany(arr);
        const new_invoice = new Invoice({
          no_invoice: invoice,
          total_harga: 0,
          estimasi_harga: 0,
          nama_lengkap : req.user.nama_lengkap,
          id_user: req.user._id,
          status: "menunggu form dikonfirmasi",
          jenis_pengujian: req.body[0].jenis_pengujian[0],
          s1_date: dateFormatTgl,
          date_format: `${new Date().getDate()} ${month_bahasa(
            new Date().getMonth()
          )} ${new Date().getFullYear()}`,
        });
        await new_invoice.save();
        return res.status(200).json({
          success: true,
          data: new_invoice,
        });
      }
    } catch (err) {
      console.log(err.message);
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
  update_order: async (req, res) => {
    try {
      const { id } = req.params;

      const body = req.body;
      await Order.updateOne({ _id: id }, body);
      const data = await Order.findOne({ _id: id });
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
  delete_order: async (req, res) => {
    try {
      const { id } = req.params;
      await Order.deleteOne({ _id: id });
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

module.exports = order_controller;
