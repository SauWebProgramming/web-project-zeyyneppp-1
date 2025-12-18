

let masterData = []; // Ana veritabanı
let myFavorites = JSON.parse(localStorage.getItem('my_fav_list')) || []; // Yerel depolama

// HTML Elemanları
const container = document.getElementById('media-container');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const modalOverlay = document.getElementById('movieModal');
const modalBody = document.getElementById('modal-details-content');
const closeBtn = document.querySelector('.close-modal');

/**
 * 1. VERI YÜKLEME (DATA FETCH)
 */
async function initializeApp() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error("Veri dosyası yüklenemedi!");
        masterData = await response.json();
        
        // İlk yüklemede kartları oluştur
        renderUI(masterData);
    } catch (err) {
        console.error("Hata Meydana Geldi:", err);
        container.innerHTML = `<h2 style='color:red;'>Veri Hatası: ${err.message}</h2>`;
    }
}

/**
 * 2. ARAYÜZÜ OLUŞTURMA (RENDER)
 */
function renderUI(dataList) {
    container.innerHTML = ''; // Temizle

    if (dataList.length === 0) {
        container.innerHTML = `<div class="no-results">Aradığınız kriterlere uygun içerik bulunamadı... 🎬</div>`;
        return;
    }

    dataList.forEach(item => {
        const isFav = myFavorites.includes(item.id);
        
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        
        cardElement.innerHTML = `
            <button class="fav-btn ${isFav ? 'active' : ''}" onclick="handleFavorite(event, ${item.id})">
                ${isFav ? '❤️' : '🤍'}
            </button>
            <img src="${item.posterUrl}" alt="${item.ad}" onclick="openMovieDetails(${item.id})">
            <div class="card-info" onclick="openMovieDetails(${item.id})">
                <h3>${item.ad}</h3>
                <p><strong>Yıl:</strong> ${item.yil} | <span class="rating-star">⭐ ${item.puan}</span></p>
                <p><strong>Tür:</strong> ${item.tur}</p>
            </div>
        `;
        
        container.appendChild(cardElement);
    });
}

/**
 * 3. GELİŞMİŞ SIRALAMA MOTORU (Yeni İstediğin Özellik)
 */
sortSelect.addEventListener('change', (e) => {
    const mode = e.target.value;
    let workingCopy = [...masterData]; // Orijinal veriyi bozmamak için kopyala

    switch (mode) {
        case 'yil-yeni':
            workingCopy.sort((a, b) => b.yil - a.yil);
            break;
        case 'yil-eski':
            workingCopy.sort((a, b) => a.yil - b.yil);
            break;
        case 'puan-cok':
            workingCopy.sort((a, b) => b.puan - a.puan);
            break;
        case 'puan-az':
            workingCopy.sort((a, b) => a.puan - b.puan);
            break;
        default:
            workingCopy.sort((a, b) => a.id - b.id);
    }
    
    renderUI(workingCopy);
});

/**
 * 4. CANLI ARAMA (SEARCH)
 */
searchInput.addEventListener('input', (e) => {
    const text = e.target.value.toLowerCase().trim();
    
    const results = masterData.filter(m => 
        m.ad.toLowerCase().includes(text) || 
        m.oyuncular.toLowerCase().includes(text)
    );
    
    renderUI(results);
});

/**
 * 5. KATEGORİ FİLTRELEME
 */
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        
        const type = btn.getAttribute('data-genre');
        
        if (type === 'all') {
            renderUI(masterData);
        } else if (type === 'favoriler') {
            const onlyFavs = masterData.filter(m => myFavorites.includes(m.id));
            renderUI(onlyFavs);
        } else {
            const onlyGenre = masterData.filter(m => m.tur.includes(type));
            renderUI(onlyGenre);
        }
    });
});

/**
 * 6. FAVORİ YÖNETİMİ
 */
function handleFavorite(event, filmId) {
    event.stopPropagation(); // Kart tıklamasını durdur
    
    const pos = myFavorites.indexOf(filmId);
    if (pos > -1) {
        myFavorites.splice(pos, 1);
    } else {
        myFavorites.push(filmId);
    }
    
    localStorage.setItem('my_fav_list', JSON.stringify(myFavorites));
    
    // Anlık güncelleme için mevcut filtreyi bul ve render et
    const activeType = document.querySelector('.filter-btn.active').getAttribute('data-genre');
    if (activeType === 'favoriler') {
        renderUI(masterData.filter(m => myFavorites.includes(m.id)));
    } else {
        renderUI(masterData);
    }
}

/**
 * 7. DETAY MODALINI AÇMA
 */
function openMovieDetails(id) {
    const movie = masterData.find(m => m.id === id);
    if (!movie) return;

    modalBody.innerHTML = `
        <div class="modal-flex-container">
            <div class="modal-poster">
                <img src="${movie.posterUrl}" alt="${movie.ad}">
            </div>
            <div class="modal-info">
                <h2>${movie.ad}</h2>
                <p><strong>Yayın Yılı:</strong> ${movie.yil}</p>
                <p><strong>Kategori:</strong> ${movie.tur}</p>
                <p><strong>IMDb Puanı:</strong> ⭐ ${movie.puan}</p>
                <p><strong>Oyuncular:</strong><br>${movie.oyuncular}</p>
                <hr style="margin:20px 0; border:0; border-top:1px solid #333;">
                <p><strong>Özet:</strong><br>${movie.ozet}</p>
            </div>
        </div>
    `;
    
    modalOverlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Modal Kapatma Olayları
closeBtn.onclick = () => {
    modalOverlay.style.display = 'none';
    document.body.style.overflow = 'auto';
};

window.onclick = (e) => {
    if (e.target == modalOverlay) {
        modalOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

// UYGULAMAYI BAŞLAT
initializeApp();