/**
 * BST-207 WEB PROGRAMLAMA VE TASARIMI 1 - PROJE ÖDEVİ [cite: 1, 2]
 * Seçenek 1: İnteraktif Medya Kitaplığı (SPA) [cite: 20]
 */

// 1. GLOBAL DEĞİŞKENLER
let allMediaData = []; // Tüm film verilerini tutan ana liste 
let currentFilter = 'Hepsi'; // Aktif kategori filtresi [cite: 24]

/**
 * 2. VERİ ÇEKME (FETCH API)
 * Ödev Gereksinimi: Yerel JSON dosyasından fetch ile veri okuma.
 */
async function fetchMedia() {
    try {
        // 'data.json' dosyasından asenkron veri çekme [cite: 10, 66, 67]
        const response = await fetch('data.json');
        
        if (!response.ok) {
            throw new Error('Veri dosyası (data.json) yüklenemedi! Dosya adını ve yolunu kontrol edin.');
        }

        // Gelen veriyi işle [cite: 68]
        allMediaData = await response.json();
        
        // İlk açılışta tüm medyaları ekrana bas [cite: 23, 68]
        displayMedia(allMediaData);
        
        // Kategorileri (türleri) dinamik olarak oluştur [cite: 24]
        generateGenreButtons();

    } catch (error) {
        console.error("Fetch Hatası:", error);
        const container = document.getElementById('media-container');
        if(container) {
            container.innerHTML = `<p style="color:red; text-align:center;">Hata: ${error.message}</p>`;
        }
    }
}

/**
 * 3. MEDYA LİSTELEME (DOM MANIPULATION)
 * Tüm medyaların kartlar halinde gösterilmesi[cite: 23].
 */
function displayMedia(data) {
    const container = document.getElementById('media-container');
    const detailView = document.getElementById('detail-view');
    
data.forEach((media, index) => { // 'index' parametresinin burada olduğundan emin ol
    const isFav = checkFavorite(media.id);
    const card = document.createElement('div');
    card.className = `media-card`;

    card.style.animationDelay = `${index * 0.05}s`; 
    
    card.innerHTML = `
        <img src="${media.posterUrl}" alt="${media.ad}" onclick="displayDetails(${media.id})">
        `;
    container.appendChild(card);
});
// ... (alttaki kodlar)
    if(container && detailView) {
        container.style.display = 'grid';
        detailView.style.display = 'none';
        container.innerHTML = '';
    }

    if (data.length === 0) {
        container.innerHTML = '<p style="color:white; grid-column: 1/-1; text-align:center;">Sonuç bulunamadı.</p>';
        return;
    }

    // Her medya için dinamik kart oluşturma [cite: 23]
    data.forEach(media => {
        const isFav = checkFavorite(media.id);
        const card = document.createElement('div');
        card.className = `media-card ${isFav ? 'is-favorite' : ''}`;
        
        card.innerHTML = `
            <img src="${media.posterUrl}" alt="${media.ad}" onclick="displayDetails(${media.id})" onerror="this.src='https://via.placeholder.com/300x450?text=Resim+Yok'">
            <div class="card-info" onclick="displayDetails(${media.id})">
                <h3>${media.ad}</h3>
                <p><strong>Tür:</strong> ${media.tur}</p>
                <p><strong>Yıl:</strong> ${media.yil} | ⭐ ${media.puan}</p>
            </div>
            <button class="favorite-btn" onclick="toggleFavorite(${media.id})">
                ${isFav ? '❤️ Favorilerden Çıkar' : '🤍 Favorilere Ekle'}
            </button>
        `;
        container.appendChild(card);
    });
}

/**
 * 4. DETAY SAYFASI (SINGLE PAGE APPLICATION)
 * Sayfa yenilenmeden detayların gösterilmesi[cite: 25, 26].
 */
function displayDetails(mediaId) {
    const media = allMediaData.find(m => m.id === mediaId);
    if (!media) return;

    const container = document.getElementById('media-container');
    const detailView = document.getElementById('detail-view');

    // Görünürlüğü değiştir (SPA) [cite: 26, 32]
    container.style.display = 'none';
    detailView.style.display = 'block';
    window.scrollTo(0, 0);

    detailView.innerHTML = `
        <div class="detail-view-container">
            <button class="back-btn" onclick="displayMedia(allMediaData)">← Geri Dön</button>
            <div class="detail-header">
                <img src="${media.posterUrl}" alt="${media.ad}">
                <div class="info-side">
                    <h1>${media.ad}</h1>
                    <p><strong>Yıl:</strong> ${media.yil}</p>
                    <p><strong>Tür:</strong> ${media.tur}</p>
                    <p><strong>Puan:</strong> ⭐ ${media.puan} / 10</p>
                    <div class="cast-section">
                        <strong>🎬 Oyuncu Kadrosu:</strong>
                        <p>${media.oyuncular}</p>
                    </div>
                </div>
            </div>
            <hr style="margin: 20px 0; border: 0; border-top: 1px solid #f39c12;">
            <div class="detail-summary">
                <h2>Özet</h2>
                <p>${media.ozet}</p>
            </div>
        </div>
    `;
}

/**
 * 5. FAVORİLERİM (LOCAL STORAGE)
 * Seçilen medyaların localStorage'da saklanması[cite: 11, 28, 70].
 */
function toggleFavorite(id) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    if (favorites.includes(id)) {
        favorites = favorites.filter(favId => favId !== id);
    } else {
        favorites.push(id);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    applyFilters(); // Mevcut görünümü güncelle
}

function checkFavorite(id) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites.includes(id);
}

// Favorilerim butonuna basıldığında sadece favorileri listele [cite: 28]
function showFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoriteMedia = allMediaData.filter(m => favorites.includes(m.id));
    displayMedia(favoriteMedia);
}

/**
 * 6. ARAMA, FİLTRELEME VE SIRALAMA [cite: 24]
 */
function applyFilters() {
    const searchInput = document.getElementById('search-input');
    const term = searchInput ? searchInput.value.toLowerCase() : '';
    
    const filtered = allMediaData.filter(media => {
        const matchesSearch = media.ad.toLowerCase().includes(term);
        const matchesGenre = (currentFilter === 'Hepsi' || media.tur === currentFilter);
        return matchesSearch && matchesGenre;
    });
    
    displayMedia(filtered);
}

// BONUS: Sıralama Fonksiyonu [cite: 93]
function sortMedia(kriter) {
    let sorted = [...allMediaData];
    if (kriter === 'puan') {
        sorted.sort((a, b) => b.puan - a.puan);
    } else if (kriter === 'yil') {
        sorted.sort((a, b) => b.yil - a.yil);
    }
    displayMedia(sorted);
}

// BONUS: Gece Modu [cite: 93]
function toggleDarkMode() {
    document.body.classList.toggle('light-mode');
    const btn = document.getElementById('theme-toggle');
    if(btn) {
        btn.innerText = document.body.classList.contains('light-mode') ? "☀️ Aydınlık Mod" : "🌙 Gece Modu";
    }
}

/**
 * 7. DİNAMİK KATEGORİ BUTONLARI
 */
function generateGenreButtons() {
    const container = document.querySelector('.genre-filter-container');
    if (!container) return;

    const genres = ['Hepsi', ...new Set(allMediaData.map(m => m.tur))];
    container.innerHTML = '';
    
    genres.forEach(genre => {
        const btn = document.createElement('button');
        btn.className = `genre-btn ${genre === currentFilter ? 'active' : ''}`;
        btn.innerText = genre;
        btn.onclick = () => {
            currentFilter = genre;
            // Aktif buton görselini güncelle
            document.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilters();
        };
        container.appendChild(btn);
    });
}

// Olay Dinleyicileri (Event Listeners)
document.getElementById('search-input')?.addEventListener('input', applyFilters);

// Uygulamayı Başlat
fetchMedia();
