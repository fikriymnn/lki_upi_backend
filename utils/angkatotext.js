module.exports = angkaKeTeks = (angka)=>{
    const angkaHuruf = ['Nol', 'Sa', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan'];
    const satuanHuruf = ['', 'Ribu', 'Juta'];
    let teks = '';
    
    // Konversi angka menjadi teks
    if (angka === 0) {
        teks = 'Nol';
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
                    ratusanTeks += angkaHuruf[ratus] + ' Ratus ';
                }
                if (puluhan > 0) {
                    if (puluhan === 1) {
                        if (satuan === 1) {
                            ratusanTeks += 'Sebelas ';
                        } else if (satuan === 0) {
                            ratusanTeks += 'Sepuluh ';
                        } else {
                            ratusanTeks += angkaHuruf[satuan] + ' Belas ';
                        }
                        // Jangan proses angka satuan lagi
                        satuan = 0;
                    } else if (puluhan === 2) {
                        ratusanTeks += 'Dua Puluh ';
                    } else {
                        ratusanTeks += angkaHuruf[puluhan] + ' Puluh ';
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
    
    return teks.trim();
}