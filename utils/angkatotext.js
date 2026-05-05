module.exports = angkaKeTeks = (angka) => {
    const angkaHuruf = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
    const satuanHuruf = ['', 'ribu', 'juta'];
    let teks = '';

    if (angka === 0) {
        teks = 'nol';
    } else {
        let satuanIndex = 0;

        while (angka > 0) {
            let ratusan = angka % 1000;
            let ratusanTeks = '';

            if (ratusan > 0) {
                let satuan = ratusan % 10;
                let puluhan = Math.floor((ratusan % 100) / 10);
                let ratus = Math.floor(ratusan / 100);

                if (ratus > 0) {
                    // ✅ Fix Bug 1: 1 ratus → "Seratus"
                    ratusanTeks += (ratus === 1 ? 'se' : angkaHuruf[ratus] + ' ') + 'ratus ';
                }
                if (puluhan > 0) {
                    if (puluhan === 1) {
                        if (satuan === 1) {
                            ratusanTeks += 'sebelas ';
                        } else if (satuan === 0) {
                            ratusanTeks += 'sepuluh ';
                        } else {
                            ratusanTeks += angkaHuruf[satuan] + ' belas ';
                        }
                        satuan = 0;
                    } else if (puluhan === 2) {
                        ratusanTeks += 'dua puluh ';
                    } else {
                        ratusanTeks += angkaHuruf[puluhan] + ' puluh ';
                    }
                }
                if (satuan > 0 && puluhan !== 1) {
                    ratusanTeks += angkaHuruf[satuan] + ' ';
                }
            }

            if (ratusanTeks !== '') {
                teks = ratusanTeks + satuanHuruf[satuanIndex] + ' ' + teks;
            }

            angka = Math.floor(angka / 1000);
            satuanIndex++;
        }
    }

    // ✅ Fix Bug 2: "Satu Ribu" → "Seribu"
    teks = teks.replace(/^satu ribu/, 'seribu');

    return teks.trim();
}