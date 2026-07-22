const axios = require('axios');
const cheerio = require('cheerio');
const xml2js = require('xml2js');
const fs = require('fs');

// Masukkan URL sitemap XML Blogger Anda di sini
const SITEMAP_URL = 'https://katakanji.blogspot.com/sitemap.xml';

async function fetchAndParseSitemap() {
    try {
        console.log('Mengambil sitemap...');
        const response = await axios.get(SITEMAP_URL);
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(response.data);
        
        const urls = result.urlset.url.map(item => item.loc[0]);
        console.log(`Ditemukan ${urls.length} tautan. Memulai scraping judul...`);
        
        let postsData = [];

        for (let i = 0; i < urls.length; i++) {
            let url = urls[i];
            try {
                const pageRes = await axios.get(url);
                const $ = cheerio.load(pageRes.data);
                
                // Mengambil judul dari tag <title>
                let title = $('title').text().trim();
                
                // Opsional: Membersihkan judul jika Blogger menambahkan nama blog di belakang (misal: "Judul Artikel - Katakanji")
                // Jika ingin dihapus, hapus komentar pada baris di bawah ini dan sesuaikan teksnya.
                // title = title.replace(' - Katakanji', '');

                postsData.push({
                    url: url,
                    judul_asli: title
                });
                
                console.log(`[${i+1}/${urls.length}] Berhasil: ${title}`);
            } catch (err) {
                console.log(`[${i+1}/${urls.length}] Gagal mengakses: ${url}`);
            }
        }

        // Menyimpan hasil ke posts.json
        fs.writeFileSync('posts.json', JSON.stringify(postsData, null, 2));
        console.log('Proses selesai. File posts.json telah diperbarui.');

    } catch (error) {
        console.error('Terjadi kesalahan saat memproses sitemap:', error.message);
    }
}

fetchAndParseSitemap();
