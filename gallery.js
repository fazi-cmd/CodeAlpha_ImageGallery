document.addEventListener('DOMContentLoaded', function () {
    const config = {
        API_KEY: '51064427-d622031a39f62654fdbb461ba',
        PER_PAGE: 20,
        cacheDuration: 5 * 60 * 1000
    };

    const elements = {
        searchInput: document.getElementById('search-input'),
        searchBtn: document.getElementById('search-btn'),
        mediaTypeBtns: document.querySelectorAll('.media-type-btn'),
        resultsCount: document.getElementById('results-count'),
        loader: document.getElementById('loader'),
        mediaGrid: document.getElementById('media-grid'),
        lightbox: document.getElementById('lightbox'),
        lightboxImg: document.getElementById('lightbox-img'),
        lightboxVideo: document.getElementById('lightbox-video'),
        lightboxCaption: document.getElementById('lightbox-caption'),
        closeBtn: document.getElementById('close-btn'),
        prevBtn: document.getElementById('prev-btn'),
        nextBtn: document.getElementById('next-btn'),
        downloadBtn: document.getElementById('download-btn'),
        loadMoreBtn: document.getElementById('load-more-btn'),
        categoryTitle: document.getElementById('category-title')
    };

    let state = {
        allMedia: [],
        currentIndex: 0,
        activeMediaType: 'image',
        isLoading: false,
        currentQuery: '',
        currentCategory: '',
        currentPage: 1,
        cache: {}
    };

    init();

    function init() {
        setupEventListeners();
        loadInitialContent();
    }

    function setupEventListeners() {
        elements.searchBtn.addEventListener('click', handleSearch);
        elements.searchInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') handleSearch();
        });

        elements.mediaTypeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.classList.contains('active')) return;

                elements.mediaTypeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.activeMediaType = btn.dataset.type;
                state.currentPage = 1;
                state.allMedia = [];

                if (state.currentQuery) {
                    searchMedia(state.currentQuery, false);
                } else if (state.currentCategory) {
                    loadCategoryMedia(state.currentCategory, false);
                } else {
                    loadPopularMedia(false);
                }
            });
        });

        elements.closeBtn?.addEventListener('click', closeLightbox);
        elements.lightbox?.addEventListener('click', e => {
            if (e.target === elements.lightbox) closeLightbox();
        });

        elements.prevBtn?.addEventListener('click', () => navigateMedia(-1));
        elements.nextBtn?.addEventListener('click', () => navigateMedia(1));
        elements.downloadBtn?.addEventListener('click', downloadCurrentMedia);
        elements.mediaGrid.addEventListener('click', handleGridClick);
        elements.loadMoreBtn.addEventListener('click', handleLoadMore);

        document.addEventListener('keydown', e => {
            if (!elements.lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            else if (e.key === 'ArrowLeft') navigateMedia(-1);
            else if (e.key === 'ArrowRight') navigateMedia(1);
        });
    }

    function handleSearch() {
        const query = elements.searchInput.value.trim();
        if (!query) return;
        window.history.pushState({}, '', `?search=${encodeURIComponent(query)}`);
        state.currentQuery = query;
        state.currentCategory = '';
        state.currentPage = 1;
        state.allMedia = [];
        searchMedia(query, false);
    }

    function handleLoadMore() {
        state.currentPage++;
        if (state.currentQuery) {
            searchMedia(state.currentQuery, true);
        } else if (state.currentCategory) {
            loadCategoryMedia(state.currentCategory, true);
        } else {
            loadPopularMedia(true);
        }
    }

    function getCategoryQuery(category) {
        const map = {
            nature: 'nature+landscape',
            sports: 'sports+action',
            wallpaper: 'wallpaper+background',
            fashion: 'fashion+model',
            gym: 'gym+fitness'
        };
        return map[category] || 'popular';
    }

    async function loadInitialContent() {
        const urlParams = new URLSearchParams(window.location.search);
        const search = urlParams.get('search');
        const category = urlParams.get('category');

        if (search) {
            elements.searchInput.value = search;
            state.currentQuery = search;
            state.currentPage = 1;
            state.allMedia = [];
            await searchMedia(search, false);
        } else if (category) {
            state.currentCategory = category;
            state.currentPage = 1;
            state.allMedia = [];
            await loadCategoryMedia(category, false);
        } else {
            state.allMedia = [];
            await loadPopularMedia(false);
        }

        const scrollInfo = JSON.parse(sessionStorage.getItem('scrollRestore'));
        if (scrollInfo && scrollInfo.url === location.href && scrollInfo.y) {
            setTimeout(() => {
                window.scrollTo(0, scrollInfo.y);
                sessionStorage.removeItem('scrollRestore');
            }, 200);
        }
    }

    async function searchMedia(query, append = false) {
        if (!append) state.currentPage = 1;
        await fetchAndRender(query, null, append);
        elements.categoryTitle.textContent = `Search: "${query}"`;
    }

    async function loadCategoryMedia(category, append = false) {
        if (!append) state.currentPage = 1;
        const q = getCategoryQuery(category);
        await fetchAndRender(q, category, append);
        elements.categoryTitle.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} Gallery`;
    }

    async function loadPopularMedia(append = false) {
        if (!append) state.currentPage = 1;
        await fetchAndRender('popular', null, append);
        elements.categoryTitle.textContent = `Popular ${state.activeMediaType === 'image' ? 'Images' : 'Videos'}`;
    }

    async function fetchAndRender(query, category = null, append = false) {
        if (state.isLoading) return;
        state.isLoading = true;

        try {
            showLoader();
            const cacheKey = `${query}_${state.currentPage}_${state.activeMediaType}`;
            const cached = getCachedData(cacheKey);
            let newMedia;

            if (cached) {
                newMedia = cached;
            } else {
                if (state.activeMediaType === 'image') {
                    const imgRes = await fetchData(`https://pixabay.com/api/?key=${config.API_KEY}&q=${query}&image_type=photo&per_page=${config.PER_PAGE}&page=${state.currentPage}`);
                    newMedia = imgRes.hits.map(item => ({ ...item, type: 'image' }));
                } else {
                    const vidRes = await fetchData(`https://pixabay.com/api/videos/?key=${config.API_KEY}&q=${query}&per_page=${config.PER_PAGE}&page=${state.currentPage}`);
                    newMedia = vidRes.hits.map(item => ({ ...item, type: 'video' }));
                }

                setCachedData(cacheKey, newMedia);
            }

            const existingKeys = new Set(state.allMedia.map(m => `${m.type}_${m.id}`));
            const uniqueNewMedia = newMedia.filter(item => !existingKeys.has(`${item.type}_${item.id}`));

            if (append) {
                state.allMedia = [...state.allMedia, ...uniqueNewMedia];
            } else {
                state.allMedia = uniqueNewMedia;
            }

            renderMedia();
            elements.loadMoreBtn.style.display = newMedia.length ? 'block' : 'none';

        } finally {
            hideLoader();
            state.isLoading = false;
        }
    }

    function renderMedia() {
        elements.resultsCount.textContent = `${state.allMedia.length} results`;
        elements.mediaGrid.innerHTML = '';
        const fragment = document.createDocumentFragment();

        state.allMedia.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'media-card';
            card.dataset.index = index;

            const downloadIcon = `<div class="download-icon" data-index="${index}"><i class="fas fa-download"></i></div>`;

            if (item.type === 'image') {
                card.innerHTML = `
                    <div class="media-thumbnail">
                        ${downloadIcon}
                        <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy">
                    </div>
                    <div class="media-info">
                        <p class="media-tags">${item.tags?.split(',').slice(0, 3).join(', ') || 'No Tags'}</p>
                        <div class="media-stats">
                            <span><i class="fas fa-eye"></i> ${item.views?.toLocaleString() || 0}</span>
                            <span><i class="fas fa-heart"></i> ${item.likes?.toLocaleString() || 0}</span>
                        </div>
                    </div>`;
            } else {
                const thumbnail = item.videos?.tiny?.url || 'https://via.placeholder.com/350x200?text=No+Thumbnail';
                const videoUrl = item.videos?.tiny?.url.replace('_640', '_180') || '';
                card.innerHTML = `
                    <div class="media-thumbnail has-video">
                        ${downloadIcon}
                        <img src="${thumbnail}" alt="${item.tags || 'No Tags'}" loading="lazy">
                        <video loop muted playsinline>
                            <source src="${videoUrl}" type="video/mp4">
                        </video>
                        <div class="video-play-icon"><i class="fas fa-play"></i></div>
                    </div>
                    <div class="media-info">
                        <p class="media-tags">${item.tags?.split(',').slice(0, 3).join(', ') || 'No Tags'}</p>
                        <div class="media-stats">
                            <span><i class="fas fa-eye"></i> ${item.views?.toLocaleString() || 0}</span>
                            <span><i class="fas fa-heart"></i> ${item.likes?.toLocaleString() || 0}</span>
                        </div>
                    </div>`;
            }

            fragment.appendChild(card);
        });

        elements.mediaGrid.appendChild(fragment);

        document.querySelectorAll('.download-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(icon.dataset.index);
                downloadMedia(index);
            });
        });

        document.querySelectorAll('.has-video').forEach(thumbnail => {
            const video = thumbnail.querySelector('video');

            thumbnail.addEventListener('mouseenter', () => {
                video.play().catch(e => console.log('Autoplay prevented:', e));
            });

            thumbnail.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0;
            });
        });
    }

    function handleGridClick(e) {
        const card = e.target.closest('.media-card');
        if (!card) return;
        const index = parseInt(card.dataset.index);
        if (isNaN(index)) return;
        state.currentIndex = index;
        openLightbox(index);
    }

    function openLightbox(index) {
        const media = state.allMedia[index];

        elements.lightboxImg.style.display = 'none';
        elements.lightboxVideo.style.display = 'none';
        elements.lightboxVideo.innerHTML = '';

        if (media.type === 'image') {
            elements.lightboxImg.src = media.webformatURL;
            elements.lightboxImg.style.display = 'block';
            const img = new Image();
            img.src = media.largeImageURL;
            img.onload = () => elements.lightboxImg.src = media.largeImageURL;
        } else {
            const source = document.createElement('source');
            source.src = media.videos.medium.url;
            source.type = 'video/mp4';
            elements.lightboxVideo.appendChild(source);
            elements.lightboxVideo.style.display = 'block';
            elements.lightboxVideo.autoplay = true;
            elements.lightboxVideo.controls = true;
            elements.lightboxVideo.load();
        }

        elements.lightboxCaption.textContent = media.tags;
        elements.lightbox.classList.add('active');
    }

    function closeLightbox() {
        elements.lightbox.classList.remove('active');
        if (elements.lightboxVideo) {
            elements.lightboxVideo.pause();
            elements.lightboxVideo.currentTime = 0;
        }
    }

    function navigateMedia(dir) {
        let newIndex = state.currentIndex + dir;
        if (newIndex < 0) newIndex = state.allMedia.length - 1;
        else if (newIndex >= state.allMedia.length) newIndex = 0;
        state.currentIndex = newIndex;
        openLightbox(newIndex);
    }

    function downloadMedia(index) {
        const media = state.allMedia[index];
        const link = document.createElement('a');
        link.href = media.type === 'image' ? media.largeImageURL : media.videos.medium.url;
        link.download = `${media.type}-${media.id}.${media.type === 'image' ? 'jpg' : 'mp4'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function downloadCurrentMedia() {
        downloadMedia(state.currentIndex);
    }

    function showLoader() {
        elements.loader.style.display = 'flex';
    }

    function hideLoader() {
        elements.loader.style.display = 'none';
    }

    function getCachedData(key) {
        const cached = state.cache[key];
        if (!cached) return null;
        if (Date.now() - cached.timestamp > config.cacheDuration) {
            delete state.cache[key];
            return null;
        }
        return cached.data;
    }

    function setCachedData(key, data) {
        state.cache[key] = { data, timestamp: Date.now() };
    }

    async function fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error('API error');
        return await response.json();
    }
});

window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('scrollRestore', JSON.stringify({
        y: window.scrollY,
        url: location.href
    }));
});