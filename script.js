// =======================================================
// script.js - Medya Kitaplığı Mantığı (Final Sürüm + Ek Puan)
// Zorunlu: const/let, async/await, fetch() API'si, LocalStorage, filter(), find()
// =======================================================

// 1. DOM Elementlerini Seçme (const kullanımı zorunludur)
const mediaContainer = document.getElementById('media-container');
const detailView = document.getElementById('detail-view');
const searchInput = document.getElementById('search-input');
const showAllLink = document.getElementById('show-all');
const showFavoritesLink = document.getElementById('show-favorites');
const genreFilterContainer = document.getElementById('genre-filter-container'); // Yeni

// Favori verilerini ve ana medya listesini tutacak global değişken
let allMediaData = []; // let kullanımı zorunludur

// =======================================================
// 5. Local Storage ve Favoriler Yönetimi
// =======================================================

const loadFavorites = () => {
    const favoritesJSON = localStorage.getItem('favoriteMedia');
    return favoritesJSON ? JSON.parse(favoritesJSON) : [];
};

const saveFavorites = (favoritesArray) => {
    localStorage.setItem('favoriteMedia', JSON.stringify(favoritesArray));
};

const isFavorite = (mediaId) => {
    const favorites = loadFavorites();
    return favorites.includes(mediaId);
};

const toggleFavorite = (mediaId) => {
    let favorites = loadFavorites();
    const id = parseInt(mediaId); 

    if (isFavorite(id)) {
        favorites = favorites.filter(favId => favId !== id); // filter() zorunlu
    } else {
        favorites.push(id);
    }
    saveFavorites(favorites);
    
    // Ekranı güncelle
    if (detailView.style.display === 'block') {
        const favButton = detailView.querySelector('.favorite-btn');
        favButton.textContent = isFavorite(id) ? 'Favorilerden Çıkar' : 'Favorilere Ekle';
    } else if (showFavoritesLink.classList.contains('active')) {
        showFavorites();
    } else {
        displayMedia(allMediaData);
    }
};

// =======================================================
// 2. Veri Çekme (Fetch) Fonksiyonu - Zorunlu: async/await ve Promise
// =======================================================
async function fetchMediaData() {
    try {
        const response = await fetch('data.json'); 
        
        if (!response.ok) {
            throw new Error(`Veri dosyası bulunamadı! Durum kodu: ${response.status}`);
        }
        
        const media = await response.json(); 
        
        allMediaData = media;

        displayMedia(allMediaData);
        
        // EK PUAN - Tür filtrelerini oluştur
        createGenreFilters();

        showAllLink.classList.add('active'); 

    } catch (error) {
        console.error("Veri çekilirken kritik bir hata oluştu:", error);
        mediaContainer.innerHTML = `
            <h2>Veriler yüklenemedi. Lütfen konsolu kontrol edin.</h2>
            <p>Detay: ${error.message}</p>
        `;
    }
}


// =======================================================
// 3. Medyayı Ekranda Gösteren Fonksiyon
// =======================================================
function displayMedia(mediaList) {
    mediaContainer.style.display = 'grid'; 
    detailView.style.display = 'none';

    mediaContainer.innerHTML = ''; 
    
    if (mediaList.length === 0) {
        mediaContainer.innerHTML = '<h2>Gösterilecek medya bulunamadı.</h2>';
        return;
    }

    mediaList.forEach(media => {
        const card = document.createElement('div');
        card.className = 'media-card'; 
        card.dataset.id = media.id; 
        
        if (isFavorite(media.id)) {
            card.classList.add('is-favorite'); 
        }

        card.innerHTML = `
            <img src="${media.posterUrl}" alt="${media.ad}">
            <h3>${media.ad} (${media.yil})</h3>
            <p>Puan: ${media.puan}</p>
            <p>Tür: ${media.tur}</p>
            <button class="favorite-btn" data-id="${media.id}"></button>
        `;
        
        const favButton = card.querySelector('.favorite-btn');
        favButton.textContent = isFavorite(media.id) ? 'Favorilerden Çıkar' : 'Favorilere Ekle'; 

        favButton.addEventListener('click', (e) => {
            e.stopPropagation(); 
            toggleFavorite(media.id); 
        });
        
        card.addEventListener('click', () => {
             displayDetails(media.id); 
        });

        mediaContainer.appendChild(card);
    });
}


// =======================================================
// 8. Detay Sayfası (SPA) Mantığı
// =======================================================

function displayDetails(mediaId) {
    const media = allMediaData.find(m => m.id === parseInt(mediaId)); // find() zorunlu

    if (!media) {
        detailView.innerHTML = "<h2>Hata: Medya bulunamadı.</h2>";
        return;
    }

    mediaContainer.style.display = 'none';
    detailView.style.display = 'block'; 

    // Geri Dön butonu onclick="displayMedia(allMediaData)" ile listeye döner
    detailView.innerHTML = `
        <div class="detail-content">
            <button class="back-btn" onclick="displayMedia(allMediaData)">← Geri Dön</button>
            <div class="detail-header">
                <img src="${media.posterUrl}" alt="${media.ad}">
                <div>
                    <h1>${media.ad} (${media.yil})</h1>
                    <p><strong>Tür:</strong> ${media.tur}</p>
                    <p><strong>IMDb Puanı:</strong> ${media.puan}</p>
                    <button class="favorite-btn" data-id="${media.id}"></button>
                </div>
            </div>
            <div class="detail-summary">
                <h2>Özet</h2>
                <p>${media.ozet}</p>
            </div>
        </div>
    `;

    const favButton = detailView.querySelector('.favorite-btn');
    favButton.textContent = isFavorite(media.id) ? 'Favorilerden Çıkar' : 'Favorilere Ekle'; 

    favButton.addEventListener('click', () => {
        toggleFavorite(media.id);
    });
}


// =======================================================
// 6. Navigasyon Olayları
// =======================================================

// Favoriler listesini gösterme fonksiyonu (Kısayol)
const showFavorites = () => {
    const favoriteIds = loadFavorites();
    const favoriteMedia = allMediaData.filter(media => favoriteIds.includes(media.id)); // filter() zorunlu
    displayMedia(favoriteMedia); 
    
    // Aktif durum ve filtre temizliği
    showFavoritesLink.classList.add('active');
    showAllLink.classList.remove('active');
    searchInput.value = '';
    document.querySelectorAll('.genre-btn').forEach(btn => btn.classList.remove('active'));
};

showAllLink.addEventListener('click', (e) => {
    e.preventDefault(); 
    displayMedia(allMediaData); 
    
    // Aktif durum ve filtre temizliği
    showAllLink.classList.add('active');
    showFavoritesLink.classList.remove('active');
    searchInput.value = '';
    // "Hepsi" butonu aktif olsun
    document.querySelectorAll('.genre-btn').forEach(btn => btn.classList.remove('active'));
    const hepsiBtn = document.querySelector('.genre-btn');
    if(hepsiBtn) hepsiBtn.classList.add('active');
});

showFavoritesLink.addEventListener('click', (e) => {
    e.preventDefault();
    showFavorites();
});


// =======================================================
// 7. Arama (Filtreleme) İşlevi
// =======================================================

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase(); 

    showAllLink.classList.add('active');
    showFavoritesLink.classList.remove('active');
    document.querySelectorAll('.genre-btn').forEach(btn => btn.classList.remove('active'));

    const filteredMedia = allMediaData.filter(media => { // filter() zorunlu
        const mediaName = media.ad.toLowerCase();
        const mediaGenre = media.tur.toLowerCase();
        
        return mediaName.includes(searchTerm) || mediaGenre.includes(searchTerm); // includes() zorunlu
    });

    displayMedia(filteredMedia);
});

// =======================================================
// 9. EK PUAN: Türlere Göre Filtreleme Butonları Mantığı
// =======================================================

function createGenreFilters() {
    genreFilterContainer.innerHTML = '';
    
    // map() ve Set() kullanımı zorunludur
    const allGenres = allMediaData.map(media => media.tur);
    const uniqueGenres = ['Hepsi', ...new Set(allGenres)];

    uniqueGenres.forEach(genre => {
        const button = document.createElement('button');
        button.textContent = genre;
        button.className = 'genre-btn';
        
        if (genre === 'Hepsi') {
            button.classList.add('active');
        }

        button.addEventListener('click', () => {
            // Aktif butonu değiştir
            document.querySelectorAll('.genre-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            if (genre === 'Hepsi') {
                displayMedia(allMediaData);
            } else {
                const filtered = allMediaData.filter(media => media.tur === genre); // filter() zorunlu
                displayMedia(filtered);
            }

            // Diğer filtreleri sıfırla
            showAllLink.classList.add('active');
            showFavoritesLink.classList.remove('active');
            searchInput.value = '';
        });
        genreFilterContainer.appendChild(button);
    });
}

// =======================================================
// 4. Uygulamayı Başlatma
// =======================================================
fetchMediaData();