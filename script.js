/**
 * ************************************************************
 * INTERAKTIF MEDYA KITAPLIGI - JAVASCRIPT MOTORU
 * ************************************************************
 */

let allMediaData = []; // Veri setini tutar
let favorites = JSON.parse(localStorage.getItem('favorites')) || []; // Favorileri LocalStorage'dan çeker

// DOM Elementleri
const mediaContainer = document.getElementById('media-container');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('movieModal');
const modalDetails = document.getElementById('modal-details');
const closeBtn = document.querySelector('.close-button');

/**
 * 1. VERİLERİ ÇEKME (FETCH)
 */
async function loadMediaData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error("Dosya bulunamadı!");
        allMediaData = await response.json();
        
        // İlk açılışta tüm medyayı göster
        renderMediaCards(allMediaData);
    } catch (error) {
        console.error("Hata:", error);
        mediaContainer.innerHTML = `<p style="color:red; text-align:center;">Veri yüklenemedi: ${error.message}</p>`;
    }
}

/**
 * 2. EKRANA KARTLARI BASMA
 */
function renderMediaCards(data) {
    mediaContainer.innerHTML = ''; // Temizle

    if (data.length === 0) {
        mediaContainer.innerHTML = '<div class="no-results">Aradığınız kriterlere uygun sonuç bulunamadı... 🎬</div>';
        return;
    }

    data.forEach(item => {
        const isFavorite = favorites.includes(item.id);
        
        const card = document.createElement('div');
        card.className = 'card';
        
        // Kart içeriğini oluştur
        card.innerHTML = `
            <button class="fav-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite(event, ${item.id})">
                ${isFavorite ? '❤' : '🤍'}
            </button>
            <img src="${item.posterUrl}" alt="${item.ad}" onclick="showMovieDetails(${item.id})">
            <div class="card-info" onclick="showMovieDetails(${item.id})">
                <h3>${item.ad}</h3>
                <p><strong>Yıl:</strong> ${item.yil}</p>
                <p><strong>Tür:</strong> ${item.tur}</p>
                <p class="rating">⭐ ${item.puan}</p>
            </div>
        `;
        
        mediaContainer.appendChild(card);
    });
}

/**
 * 3. ARAMA MOTORU (REAL-TIME)
 */
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    const filteredResults = allMediaData.filter(item => {
        return item.ad.toLowerCase().includes(searchTerm) || 
               item.oyuncular.toLowerCase().includes(searchTerm) ||
               item.tur.toLowerCase().includes(searchTerm);
    });
    
    renderMediaCards(filteredResults);
});

/**
 * 4. KATEGORİ FİLTRELEME
 */
const filterButtons = document.querySelectorAll('.filter-btn');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Aktif butonu değiştir
        document.querySelector('.filter-btn.active').classList.remove('active');
        button.classList.add('active');
        
        const selectedGenre = button.getAttribute('data-genre');
        
        if (selectedGenre === 'all') {
            renderMediaCards(allMediaData);
        } else if (selectedGenre === 'favoriler') {
            const favMovies = allMediaData.filter(m => favorites.includes(m.id));
            renderMediaCards(favMovies);
        } else {
            const filtered = allMediaData.filter(m => m.tur.includes(selectedGenre));
            renderMediaCards(filtered);
        }
    });
});

/**
 * 5. SIRALAMA SİSTEMİ (PUAN VE YIL)
// Puana Göre Sırala Butonu
document.getElementById('sortByPuan').addEventListener('click', () => {
    const order = document.getElementById('sortOrder').value;
    const sorted = [...allMediaData].sort((a, b) => {
        return order === 'desc' ? b.puan - a.puan : a.puan - b.puan;
    });
    renderMediaCards(sorted);
});

// Yıla Göre Sırala Butonu
document.getElementById('sortByYil').addEventListener('click', () => {
    const order = document.getElementById('sortOrder').value;
    const sorted = [...allMediaData].sort((a, b) => {
        return order === 'desc' ? b.yil - a.yil : a.yil - b.yil;
    });
    renderMediaCards(sorted);
});

document.getElementById('sortByYil').addEventListener('click', () => {
    const sorted = [...allMediaData].sort((a, b) => b.yil - a.yil);
    renderMediaCards(sorted);
});

/**
 * 6. FAVORİ EKLEME / ÇIKARMA
 */
function toggleFavorite(event, id) {
    event.stopPropagation(); // Kart tıklamasını engelle (modal açılmasın)
    
    const index = favorites.indexOf(id);
    if (index > -1) {
        favorites.splice(index, 1); // Çıkar
    } else {
        favorites.push(id); // Ekle
    }
    
    // Güncelle ve Kaydet
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Eğer o an "Favorilerim" sekmesindeysek ekranı hemen güncelle
    const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-genre');
    if (activeFilter === 'favoriler') {
        const favMovies = allMediaData.filter(m => favorites.includes(m.id));
        renderMediaCards(favMovies);
    } else {
        renderMediaCards(allMediaData);
    }
}

/**
 * 7. MODAL (DETAY) PENCERESİ
 */
function showMovieDetails(id) {
    const movie = allMediaData.find(m => m.id === id);
    if (!movie) return;

    modalDetails.innerHTML = `
        <div class="modal-flex">
            <div class="modal-left">
                <img src="${movie.posterUrl}" alt="${movie.ad}">
            </div>
            <div class="modal-right">
                <h2>${movie.ad}</h2>
                <p><strong>Yayın Yılı:</strong> ${movie.yil}</p>
                <p><strong>Kategori:</strong> ${movie.tur}</p>
                <p><strong>IMDb Puanı:</strong> ⭐ ${movie.puan}</p>
                <p><strong>Oyuncular:</strong> ${movie.oyuncular}</p>
                <hr style="margin: 20px 0; border: 0; border-top: 1px solid #333;">
                <p><strong>Konu:</strong><br>${movie.ozet}</p>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Arka plan kaymasın
}

// Modal Kapatma
closeBtn.onclick = () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
};

window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};
const backToTopBtn = document.getElementById("backToTop");

window.onscroll = function() {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        backToTopBtn.style.display = "block";
    } else {
        backToTopBtn.style.display = "none";
    }
};

backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth" // Yumuşak geçiş
    });
});

/**
 * PROJEYİ BAŞLAT
 */
loadMediaData();

