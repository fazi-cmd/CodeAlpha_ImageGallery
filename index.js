const menuBtn = document.querySelector(".menu-btn");
const navigation = document.querySelector(".navigation");

menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("active");
    navigation.classList.toggle("active");
});

const dots = document.querySelectorAll(".slider-dots .dot");
const slides = document.querySelectorAll(".video-slide");
let currentSlide = 0;
let slideInterval;

function changeSlide(manualIndex) {

    slides.forEach(slide => slide.classList.remove("active"));
    dots.forEach(dot => dot.classList.remove("active"));

    currentSlide = manualIndex;
    slides[currentSlide].classList.add("active");
    dots[currentSlide].classList.add("active");

    const activeVideo = slides[currentSlide];
    activeVideo.currentTime = 0;
    activeVideo.play();
}

function startSlideShow() {
    slideInterval = setInterval(() => {
        const nextSlide = (currentSlide + 1) % slides.length;
        changeSlide(nextSlide);
    }, 5000);
}

const homeSection = document.querySelector('.home');
homeSection.addEventListener('mouseenter', () => clearInterval(slideInterval));
homeSection.addEventListener('mouseleave', startSlideShow);

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        clearInterval(slideInterval);
        changeSlide(index);
        startSlideShow();
    });
});

changeSlide(0);
startSlideShow();

emailjs.init('mHgIKp4tUlWWKiQ3s');

document.getElementById('myContactForm').addEventListener('submit', function (event) {
    event.preventDefault();

    emailjs.sendForm('service_vbg5bhf', 'template_8wpf5pp', this)
        .then(function () {
            alert('Message Sent Successfully!');
            event.target.reset();
        }, function (error) {
            alert('Failed to send message: ' + JSON.stringify(error));
        });
});

const contactSection = document.querySelector('.contact-section');
const contactObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

contactObserver.observe(contactSection);

const footer = document.querySelector('footer');
const footerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

footerObserver.observe(footer);

const aboutSection = document.querySelector('.about-section');
const aboutObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

aboutObserver.observe(aboutSection);

const navLinks = document.querySelectorAll('.navigation-items a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuBtn.classList.remove('active');
        navigation.classList.remove('active');
    });
});

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');
const faqObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelector('.faq-section') && faqObserver.observe(document.querySelector('.faq-section'));

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        const currentlyActive = document.querySelector('.faq-item.active');

        // If this item is already active, close it
        if (currentlyActive && currentlyActive !== item) {
            currentlyActive.classList.remove('active');
        }

        // Toggle current item
        item.classList.toggle('active');
    });
});
// All categories data
const categories = [
    { name: 'Nature', count: '2.2M', img: 'images/Nature.jpg' },
    { name: 'Business', count: '1.7M', img: 'images/Bussiness.jpg' },
    { name: 'Food', count: '3.3M', img: 'images/Food.jpg' },
    { name: 'Backgrounds', count: '4.4M', img: 'images/Backgrounds.jpg' },
    { name: 'Flowers', count: '1.5M', img: 'images/Flowers.jpg' },
    { name: 'Coffee', count: '451K', img: 'images/Coffee.jpg' },
    { name: 'Dogs', count: '210K', img: 'images/Dogs.jpg' },
    { name: 'Lifestyle', count: '2.2M', img: 'images/Lifestyle.jpg' },
    { name: 'Abstract', count: '1.6M', img: 'images/Abstract.jpg' },
    { name: 'Space', count: '1.6M', img: 'images/Space.jpg' },
    { name: 'People', count: '1.2M', img: 'images/People.jpg' },
    { name: 'Beach', count: '950K', img: 'images/Beach.jpg' },
    { name: 'Mountains', count: '1.1M', img: 'images/Mountains.jpg' },
    { name: 'Technology', count: '800K', img: 'images/Technology.jpg' },
    { name: 'City', count: '1.5M', img: 'images/City.jpg' },
    { name: 'Cars', count: '600K', img: 'images/Cars.jpg' },
    { name: 'Music', count: '550K', img: 'images/Music.jpg' },
    { name: 'Sports', count: '1.3M', img: 'images/Sports.jpg' },
];

const grid = document.querySelector('.categories-grid');
const showMoreBtn = document.querySelector('.show-more-btn');
let visibleCount = 8;

const loadImage = (imgElement, src) => {
    imgElement.style.background = '#e5e7eb';

    const img = new Image();
    img.src = src;
    img.onload = () => {
        imgElement.src = src;
        imgElement.classList.add('loaded');
    };
    img.onerror = () => {
        imgElement.style.background = '#f3f4f6';
        imgElement.style.display = 'flex';
        imgElement.style.alignItems = 'center';
        imgElement.style.justifyContent = 'center';
        imgElement.innerHTML = '<span style="color:#6b7280; font-size:0.8rem;">Image failed to load</span>';
    };
};

// Function to render categories
const renderCategories = (count) => {
    grid.innerHTML = '';

    categories.slice(0, count).forEach(category => {
        const card = document.createElement('a');
        card.href = `images.html?search=${encodeURIComponent(category.name)}`;
        card.className = 'category-card';
        card.innerHTML = `
            <div class="category-image">
                <img data-src="${category.img}" alt="${category.name}" loading="lazy">
                <div class="category-info">
                    <h3>${category.name}</h3>
                    <p>${category.count} Photos</p>
                </div>
            </div>
        `;

        grid.appendChild(card);
        loadImage(card.querySelector('img'), category.img);
    });

    showMoreBtn.textContent = count >= categories.length ?
        'All Categories Loaded' :
        'Show More';

    showMoreBtn.disabled = count >= categories.length;
};

renderCategories(visibleCount);

showMoreBtn.addEventListener('click', () => {
    visibleCount += 4;
    if (visibleCount > categories.length) {
        visibleCount = categories.length;
    }
    renderCategories(visibleCount);
});






document.addEventListener('DOMContentLoaded', function () {
    const categories = [
        'Travel', 'Technology', 'Arts', 'Family',
        'Urban', 'Fashion', 'Industry', 'Seasons'
    ];

    const categoriesScroll = document.getElementById('categoriesScroll');

    categories.forEach(category => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';

        const imgContainer = document.createElement('div');
        imgContainer.className = 'category-img-container';

        const img = document.createElement('img');
        img.className = 'category-img';
        img.alt = category;

        const placeholder = document.createElement('div');
        placeholder.className = 'category-placeholder';
        placeholder.innerHTML = '📷';

        imgContainer.appendChild(img);
        imgContainer.appendChild(placeholder);

        const name = document.createElement('div');
        name.className = 'category-name';
        name.textContent = category;

        categoryItem.appendChild(imgContainer);
        categoryItem.appendChild(name);

        categoryItem.addEventListener('click', function () {
            window.location.href = `images.html?search=${encodeURIComponent(category)}`;
        });

        categoriesScroll.appendChild(categoryItem);
    });

    let isDown = false;
    let startX;
    let scrollLeft;

    categoriesScroll.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - categoriesScroll.offsetLeft;
        scrollLeft = categoriesScroll.scrollLeft;
    });

    categoriesScroll.addEventListener('mouseleave', () => {
        isDown = false;
    });

    categoriesScroll.addEventListener('mouseup', () => {
        isDown = false;
    });

    categoriesScroll.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - categoriesScroll.offsetLeft;
        const walk = (x - startX) * 2;
        categoriesScroll.scrollLeft = scrollLeft - walk;
    });

    // When you're ready to add images:
    // 1. Uncomment the following code
    // 2. Replace 'images/' with your actual image path
    // 3. Make sure your image filenames match the category names


    const categoryImages = document.querySelectorAll('.category-img');
    categoryImages.forEach(img => {
        const categoryName = img.alt.toLowerCase();
        img.src = `images/${categoryName}.jpg`;
        img.style.display = 'block';
        img.nextElementSibling.style.display = 'none'; // Hide placeholder
    });

});


function openLightbox(imgElement) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    lightbox.style.display = 'flex';
    lightboxImg.src = imgElement.src;
}

function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
}

function downloadImage(event, imgPath) {
    event.stopPropagation();
    const link = document.createElement('a');
    link.href = imgPath;
    link.download = imgPath.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


document.addEventListener("DOMContentLoaded", function () {
    emailjs.init('mHgIKp4tUlWWKiQ3s');

    function toggleContactForm() {
        const form = document.getElementById('contact-popup');
        form.style.display = form.style.display === 'block' ? 'none' : 'block';
    }

    window.toggleContactForm = toggleContactForm;

    document.getElementById('myContactForm').addEventListener('submit', function (event) {
        event.preventDefault();

        emailjs.sendForm('service_vbg5bhf', 'template_8wpf5pp', this)
            .then(function () {
                alert('Message Sent Successfully!');
                event.target.reset();
                toggleContactForm();
            }, function (error) {
                alert('Failed to send message: ' + JSON.stringify(error));
            });
    });
});