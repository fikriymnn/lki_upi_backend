const Invoice = require("../model/invoice_model");

const dashboard_controller = async (req, res) => {
  try {
    const { periode } = req.query; // minggu | bulan | 6bulan | tahun | all

    const now = new Date();

    // ── Status ───────────────────────────────────────────────────────────
    const STATUS_SELESAI = ["Selesai", "Menunggu Pembayaran"];
    const STATUS_EXCLUDE_AKTIF = ["Selesai", "Menunggu Pembayaran", "Sembunyikan", "Order Dibatalkan"];

    // ── Tentukan rentang tanggal berdasarkan periode ─────────────────────
    let startDate;
    let groupFormat;

    if (periode === "minggu") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      groupFormat = "%Y-%m-%d";
    } else if (periode === "bulan") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      groupFormat = "%Y-%m-%d";
    } else if (periode === "6bulan") {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 5);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      groupFormat = "%Y-%m";
    } else if (periode === "tahun") {
      startDate = new Date(now.getFullYear(), 0, 1);
      groupFormat = "%Y-%m";
    } else {
      // all
      startDate = new Date(2020, 0, 1);
      groupFormat = "%Y";
    }

    // ── Query filter ─────────────────────────────────────────────────────
    // totalOrder tidak menghitung yang Sembunyikan
    const matchFilter = {
      date: { $gte: startDate },
      status: { $nin: ["Sembunyikan", "Order Dibatalkan"] }
    };

    // ── 1. Stat cards ────────────────────────────────────────────────────
    const [totalOrder, totalSelesai, totalAktif] = await Promise.all([
      Invoice.countDocuments(matchFilter),
      Invoice.countDocuments({ ...matchFilter, status: { $in: STATUS_SELESAI } }),
      Invoice.countDocuments({ ...matchFilter, status: { $nin: STATUS_EXCLUDE_AKTIF } }),
    ]);

    // ── 2. Tren order selesai (untuk chart) ──────────────────────────────
    const trenSelesai = await Invoice.aggregate([
      {
        $match: {
          date: { $gte: startDate },
          status: { $in: STATUS_SELESAI },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: groupFormat, date: "$date" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // ── 3. Generate label lengkap (isi 0 untuk yang kosong) ──────────────
    const trenMap = {};
    trenSelesai.forEach((item) => {
      trenMap[item._id] = item.count;
    });

    const labels = [];
    const dataSelesai = [];

    if (periode === "minggu") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const key = d.toISOString().split("T")[0];
        const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
        labels.push(HARI[d.getDay()]);
        dataSelesai.push(trenMap[key] || 0);
      }
    } else if (periode === "bulan") {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        labels.push(String(d));
        dataSelesai.push(trenMap[key] || 0);
      }
    } else if (periode === "6bulan") {
      const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        labels.push(BULAN[d.getMonth()]);
        dataSelesai.push(trenMap[key] || 0);
      }
    } else if (periode === "tahun") {
      const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
      for (let m = 0; m < 12; m++) {
        const key = `${now.getFullYear()}-${String(m + 1).padStart(2, "0")}`;
        labels.push(BULAN[m]);
        dataSelesai.push(trenMap[key] || 0);
      }
    } else {
      // all — 5 tahun terakhir
      for (let i = 4; i >= 0; i--) {
        const year = String(now.getFullYear() - i);
        labels.push(year);
        dataSelesai.push(trenMap[year] || 0);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        stat: {
          totalOrder,
          totalSelesai,
          totalAktif,
        },
        tren: {
          labels,
          selesai: dataSelesai,
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = dashboard_controller;