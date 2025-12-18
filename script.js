// Global değişkenler
let allMediaData = []; 
let currentFilter = 'Hepsi';
let isFavoriteView = false; // Favori modunu takip etmek için eklenen kritik değişken

// 1. Verileri JSON'dan Çekme
async function fetchMedia() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Veri çekilemedi');
        allMediaData = await response.json();
        
        displayMedia(allMediaData);
        generateGenreButtons();
    } catch (error) {
        console.error("Hata:", error);
    }
}

// 2. Medyaları Listeleme
function displayMedia(data) {
    const container = document.getElementById('media-container');
    const detailView = document.getElementById('detail-view');
    const appContent = document.querySelector('.app-content') || document.getElementById('app-content');
    
    // SPA Görünüm Ayarları
    if (appContent) appContent.style.display = 'block';
    if (detailView) detailView.style.display = 'none';
    
    container.innerHTML = '';

    data.forEach(media => {
        const isFav = checkFavorite(media.id);
        const card = document.createElement('div');
        card.className = `media-card ${isFav ? 'is-favorite' : ''}`;
        
        card.innerHTML = `
            <img src="${media.posterUrl}" alt="${media.ad}" onclick="displayDetails(${media.id})">
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

// 3. Favori Yönetimi (LocalStorage)
function toggleFavorite(id) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    if (favorites.includes(id)) {
        favorites = favorites.filter(favId => favId !== id);
    } else {
        favorites.push(id);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    // Ekranda anlık değişim olması için filtreleri tekrar uygula
    applyFilters();
}

function checkFavorite(id) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites.includes(id);
}

// 4. Merkezi Filtreleme (Arama + Kategori + Favoriler)
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    const filteredData = allMediaData.filter(media => {
        const matchesSearch = media.ad.toLowerCase().includes(searchTerm);
        const matchesGenre = (currentFilter === 'Hepsi' || media.tur === currentFilter);
        const matchesFav = !isFavoriteView || favorites.includes(media.id); // Favori modu kontrolü
        
        return matchesSearch && matchesGenre && matchesFav;
    });
    
    displayMedia(filteredData);
}

// 5. Navigasyon Tıklama Olayları (Yeni Eklenen Kısım)
// HTML'deki "Tümü" linkine tıklandığında
document.getElementById('show-all')?.addEventListener('click', (e) => {
    e.preventDefault();
    isFavoriteView = false;
    document.getElementById('show-all').classList.add('active');
    document.getElementById('show-favorites').classList.remove('active');
    applyFilters();
});

// HTML'deki "Favorilerim" linkine tıklandığında
document.getElementById('show-favorites')?.addEventListener('click', (e) => {
    e.preventDefault();
    isFavoriteView = true;
    document.getElementById('show-favorites').classList.add('active');
    document.getElementById('show-all').classList.remove('active');
    applyFilters();
});

// Arama kutusu dinleyicisi
document.getElementById('search-input').addEventListener('input', applyFilters);

// 6. Detay Sayfası
function displayDetails(mediaId) {
    const media = allMediaData.find(m => m.id === mediaId);
    const detailView = document.getElementById('detail-view');
    const appContent = document.querySelector('.app-content') || document.getElementById('app-content');

    if (appContent) appContent.style.display = 'none';
    detailView.style.display = 'block';
    window.scrollTo(0, 0);

    detailView.innerHTML = `
        <div class="detail-view-container">
            <button class="back-btn" onclick="applyFilters()">← Listeye Geri Dön</button>
            <div class="detail-header">
                <img src="${media.posterUrl}" alt="${media.ad}">
                <div class="info-side">
                    <h1>${media.ad}</h1>
                    <p><strong>Yıl:</strong> ${media.yil} | <strong>Tür:</strong> ${media.tur}</p>
                    <p><strong>Puan:</strong> ⭐ ${media.puan} / 10</p>
                    <div class="cast-section">
                        <strong>🎬 Oyuncular:</strong>
                        <p>${media.oyuncular}</p>
                    </div>
                </div>
            </div>
            <hr style="margin: 30px 0; border: 0; border-top: 1px solid #f39c12;">
            <div class="detail-summary">
                <h2>📝 Özet</h2>
                <p>${media.ozet}</p>
            </div>
        </div>
    `;
}

// 7. Kategori Butonları
function generateGenreButtons() {
    const filterContainer = document.getElementById('genre-filter-container');
    const genres = ['Hepsi', ...new Set(allMediaData.map(m => m.tur))];
    
    filterContainer.innerHTML = '';
    genres.forEach(genre => {
        const btn = document.createElement('button');
        btn.className = `genre-btn ${genre === 'Hepsi' ? 'active' : ''}`;
        btn.innerText = genre;
        btn.onclick = () => {
            document.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = genre;
            applyFilters();
        };
        filterContainer.appendChild(btn);
    });
}

fetchMedia();

