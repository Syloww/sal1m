// Page Loader — rectangles blanc & violet à vitesses différentes
const initPageLoader = () => {
    const loader = document.getElementById('page-loader');
    if (!loader) return;

    document.body.classList.add('is-loading');

    const MIN_DISPLAY_MS = 1000;
    const startTime = performance.now();

    const exitLoader = () => {
        const elapsed = performance.now() - startTime;
        const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);

        setTimeout(() => {
            loader.classList.add('is-exiting');

            const violetPanel = loader.querySelector('.loader-panel--violet');
            if (violetPanel) {
                violetPanel.addEventListener('animationend', () => {
                    loader.remove();
                    document.body.classList.remove('is-loading');
                }, { once: true });
            } else {
                loader.remove();
                document.body.classList.remove('is-loading');
            }
        }, remaining);
    };

    if (document.readyState === 'complete') {
        exitLoader();
    } else {
        window.addEventListener('load', exitLoader, { once: true });
    }
};

initPageLoader();

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar effect on scroll
const navbar = document.querySelector('.navbar');
const darkNavbarSections = document.querySelectorAll('.about-section, .footer');

const updateNavbarState = () => {
    if (!navbar) return;

    navbar.classList.toggle('is-scrolled', window.scrollY > 100);

    const navProbeY = navbar.getBoundingClientRect().top + navbar.offsetHeight * 0.35;
    let onDark = false;

    darkNavbarSections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= navProbeY && rect.bottom > navProbeY) {
            onDark = true;
        }
    });

    navbar.classList.toggle('on-dark', onDark);
};

window.addEventListener('scroll', updateNavbarState, { passive: true });
window.addEventListener('resize', updateNavbarState);
updateNavbarState();

// Parallax effect for about image (désactivé sur mobile pour éviter le chevauchement)
window.addEventListener('scroll', () => {
    const aboutSection = document.querySelector('.about-section');
    if (!aboutSection) return;

    if (window.innerWidth <= 1024) {
        aboutSection.style.transform = '';
        return;
    }

    const rect = aboutSection.getBoundingClientRect();

    if (rect.top < window.innerHeight && rect.bottom > 0) {
        const parallaxValue = window.pageYOffset * 0.3;
        aboutSection.style.transform = `translateY(${parallaxValue}px)`;
    } else {
        aboutSection.style.transform = '';
    }
});

// Slot machine animation
const animateSlotMachine = (slotColumn, target) => {
    const firstDigit = slotColumn.querySelector('.slot-digit');
    if (!firstDigit) return;

    const digitHeight = firstDigit.offsetHeight || 80;
    const fullRotations = 1;
    const targetPosition = fullRotations * 10 + target;
    const translateY = -(targetPosition * digitHeight);

    slotColumn.style.transform = `translateY(${translateY}px)`;
};

// Observer pour les animations de machine à sous
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            const targetValue = parseInt(entry.target.getAttribute('data-target'));
            const slotColumn = entry.target.querySelector('.slot-column');

            if (slotColumn && !isNaN(targetValue)) {
                setTimeout(() => {
                    animateSlotMachine(slotColumn, targetValue);
                }, 100);
                entry.target.classList.add('animated');
            }
        }
    });
}, { threshold: 0.5 });

function initSlotMachines() {
    const slotMachines = document.querySelectorAll('.stat-slot-machine');

    slotMachines.forEach((machine, index) => {
        statsObserver.observe(machine);

        setTimeout(() => {
            const rect = machine.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible && !machine.classList.contains('animated')) {
                const targetValue = parseInt(machine.getAttribute('data-target'));
                const slotColumn = machine.querySelector('.slot-column');
                if (slotColumn && !isNaN(targetValue)) {
                    animateSlotMachine(slotColumn, targetValue);
                    machine.classList.add('animated');
                }
            }
        }, 500);
    });
}

// Hover effect on social icons
document.querySelectorAll('.social-icon, .footer-social-icon').forEach(icon => {
    icon.addEventListener('mouseenter', () => {
        icon.style.transform = 'scale(1.1) rotate(5deg)';
    });
    
    icon.addEventListener('mouseleave', () => {
        icon.style.transform = 'scale(1) rotate(0deg)';
    });
});

// Title reveal animation
const titleLines = document.querySelectorAll('.title-line');
titleLines.forEach((line, index) => {
    line.style.opacity = '0';
    line.style.transform = 'translateY(50px)';
    
    setTimeout(() => {
        line.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
        line.style.opacity = '1';
        line.style.transform = 'translateY(0)';
    }, index * 300);
});

// Add subtle parallax to accent block
window.addEventListener('scroll', () => {
    const accentBlock = document.querySelector('.accent-block');
    if (accentBlock) {
        const rect = accentBlock.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const windowCenter = window.innerHeight / 2;
        const offset = (center - windowCenter) * 0.1;
        
        accentBlock.style.transform = `translateY(${offset}px) rotate(${offset * 0.05}deg)`;
    }
});

// Smooth scroll for all links
document.addEventListener('DOMContentLoaded', () => {
    updateMediaProjectsStat();
    initSlotMachines();

    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    if (document.getElementById('portfolio-grid')) {
        initPortfolio();
    }

    const hash = window.location.hash;
    if (hash && hash.length > 1) {
        const target = document.getElementById(hash.slice(1));
        if (target) {
            requestAnimationFrame(() => {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({ top: Math.max(0, offsetTop), behavior: 'auto' });
            });
        }
    }
});

// Base de données des projets
const projects = [
    {
        id: 8,
        title: "Centre de réadaptation de Mulhouse",
        type: "Photographie",
        date: "2026",
        client: "Centre de réadaptation de Mulhouse",
        description: "Réalisation de contenus photographiques dans le cadre de mon stage chargée de communication au Centre de réadaptation de Mulhouse. Shooting et post-production pour valoriser les activités et l'établissement.",
        image: "projets/CentreReadaptationMulhouse/P1030180.jpg",
        images: [
            "projets/CentreReadaptationMulhouse/P1030180.jpg",
            "projets/CentreReadaptationMulhouse/P1030215-3.jpg",
            "projets/CentreReadaptationMulhouse/P1030216.jpg"
        ],
        technologies: ["Lightroom", "Photoshop", "Communication", "Sony A7"]
    },
    {
        id: 9,
        title: "Côte Sushi",
        type: "Photographie",
        date: "2025",
        client: "Côte Sushi",
        description: "Shooting photographique pour le restaurant Côte Sushi. Mise en valeur des plats, de l'ambiance et de l'identité visuelle du lieu.",
        image: "projets/cotesushi/P1016341.jpg",
        images: [
            "projets/cotesushi/P1016341.jpg",
            "projets/cotesushi/P1016366.jpg",
            "projets/cotesushi/P1016375.jpg",
            "projets/cotesushi/12134.jpg",
            "projets/cotesushi/EDIT- 3G.png"
        ],
        technologies: ["Lightroom", "Photoshop"]
    },
    {
        id: 1,
        title: "Croix Rouge",
        type: "Photographie",
        date: "2025",
        client: "Croix Rouge - Mulhouse",
        description: "Responsable de la communication au sein de la Croix-Rouge, Unité Locale de Mulhouse, où j'assure la gestion des réseaux sociaux, la création de supports visuels et la valorisation des actions menées par l'équipe sur le terrain.",
        image: "projets/CroixRouge/P1018218.jpg",
        images: [
            "projets/CroixRouge/P1018205.jpg",
            "projets/CroixRouge/P1018218.jpg",
            "projets/CroixRouge/P1018312.jpg",
            "projets/CroixRouge/P1018383-2.jpg"
        ],
        technologies: ["Lightroom", "Photoshop", "Lumix S5", "Communication"]
    },
    {
        id: 2,
        title: "Blvck Crystal",
        type: "Photographie",
        date: "2024",
        client: "Blvck Crystal",
        description: "Série photographique artistique mettant en valeur l'élégance et le minimalisme. Travail sur la composition, la lumière et le contraste pour créer des images impactantes et raffinées.",
        image: "projets/blvckcrystal/DSC_0061.jpg",
        images: [
            "projets/blvckcrystal/DSC_0061.jpg",
            "projets/blvckcrystal/DSC_0063.jpg",
            "projets/blvckcrystal/DSC_0066.jpg"
        ],
        technologies: ["Lightroom", "Photoshop"]
    },
    {
        id: 3,
        title: "La Petite Manchester",
        type: "Photographie",
        date: "2025",
        client: "La Petite Manchester",
        description: "Projet photographique d'identité visuelle avec direction artistique moderne. Série d'images capturant l'essence et l'atmosphère unique du projet avec une attention particulière aux détails et à la post-production.",
        image: "projets/manchester/postale_modifie-4.jpg",
        images: [
            "projets/manchester/postale_modifie-4.jpg",
            "projets/manchester/postale_modifie-5.jpg",
            "projets/manchester/postale_modifie-7.jpg",
            "projets/manchester/postale_modifie-8.jpg",
            "projets/manchester/postale_modifie-9.jpg"
        ],
        technologies: ["Lightroom", "Photoshop"]
    },
    {
        id: 4,
        title: "Rasso",
        type: "Photographie",
        date: "2024",
        client: "Rasso",
        description: "",
        image: "projets/rasso1/DSC_0015.jpg",
        images: [
            "projets/rasso1/DSC_0015.jpg",
            "projets/rasso1/DSC_0026.jpg",
            "projets/rasso1/IMG_0948.jpg",
            "projets/rasso1/IMG_0949.jpg"
        ],
        technologies: ["Lightroom", "Photoshop", "Photographie événementielle"]
    },
    {
        id: 5,
        title: "Montage Vidéo",
        type: "Vidéo",
        date: "2025",
        client: "Projet personnel",
        description: "Création et montage de vidéos, notamment des shorts YouTube. Travail sur le rythme, les transitions et l'impact visuel pour créer des contenus engageants et dynamiques.",
        image: "https://img.youtube.com/vi/RKkokeZPKoU/maxresdefault.jpg",
        youtubeUrl: "https://www.youtube.com/shorts/RKkokeZPKoU",
        technologies: ["Premiere Pro", "After Effects", "Montage vidéo"]
    },
    {
        id: 6,
        title: "Site web – Lise Hummel",
        type: "Développement Web",
        date: "2025",
        client: "Lise Hummel",
        description: "Intégration et développement du portfolio de la graphiste Lise Hummel, avec une mise en page claire, un design épuré et une attention portée à l'expérience utilisateur.",
        image: "https://lisehummel.fr/images/pandaroux.jpg",
        url: "https://lisehummel.fr/",
        technologies: ["HTML", "CSS", "JavaScript", "UX/UI"]
    },
    {
        id: 7,
        title: "Collecte de dons – Croix-Rouge Mulhouse",
        type: "Vidéo",
        date: "2025",
        client: "Croix Rouge - Mulhouse",
        description: "Vidéo de sensibilisation pour la collecte de dons de la Croix-Rouge de Mulhouse. Réalisation et montage pour les réseaux sociaux dans le cadre de ma mission de responsable communication à l'Unité Locale.",
        image: "projets/CroixRouge/Vidéocroixrouge1.png",
        url: "https://www.instagram.com/p/DVVqqhIjt_b/",
        technologies: ["Premiere Pro", "After Effects", "Réseaux sociaux"]
    }
];

function getMediaProjectsCount() {
    return projects.filter(project =>
        (project.type === 'Photographie' || project.type === 'Vidéo') && !project.closed
    ).length;
}

function updateMediaProjectsStat() {
    const stat = document.getElementById('stat-media-projects');
    if (stat) {
        stat.setAttribute('data-target', getMediaProjectsCount());
    }
}

// Fonction pour initialiser le portfolio
function initPortfolio() {
    const portfolioGrid = document.getElementById('portfolio-grid');
    
    if (!portfolioGrid) {
        console.warn('Portfolio grid not found on this page');
        return;
    }
    
    // Générer les items de portfolio
    projects.forEach((project, index) => {
        const portfolioItem = createPortfolioItem(project, index);
        portfolioGrid.appendChild(portfolioItem);
    });
    
    // Initialiser les filtres
    initPortfolioFilters();
    
    // Observer pour les animations (après création de tous les items)
    setTimeout(() => {
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        const portfolioObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 150);
                }
            });
        }, { threshold: 0.2 });

        portfolioItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(50px)';
            item.style.transition = 'all 0.8s ease';
            portfolioObserver.observe(item);
        });
    }, 100);
}

// Fonction pour initialiser les filtres du portfolio
function initPortfolioFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioGrid = document.getElementById('portfolio-grid');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Retirer la classe active de tous les boutons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Ajouter la classe active au bouton cliqué
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter');
            
            // Filtrer les projets
            const portfolioItems = Array.from(document.querySelectorAll('.portfolio-item'));
            let visibleIndex = 0;
            
            portfolioItems.forEach((item) => {
                const projectId = parseInt(item.dataset.projectId);
                const project = projects.find(p => p.id === projectId);
                
                // Retirer toutes les classes large-item
                item.classList.remove('large-item');
                
                if (filterValue === 'all' || project.type === filterValue) {
                    // Ajouter large-item uniquement au premier élément visible
                    if (visibleIndex === 0) {
                        item.classList.add('large-item');
                    }
                    visibleIndex++;
                    
                    item.style.display = 'flex';
                    // Réanimer l'élément
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, visibleIndex * 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Fonction pour créer un item de portfolio
function createPortfolioItem(project, index) {
    const item = document.createElement('div');
    // Le premier item sera large pour mettre en valeur
    const isLarge = index === 0;
    const isClosed = project.closed === true;
    item.className = `portfolio-item ${isLarge ? 'large-item' : ''} ${isClosed ? 'closed-item' : ''}`;
    item.style.backgroundImage = `url(${project.image})`;
    item.dataset.projectId = project.id;
    
    // Si le projet est fermé, ajouter le texte "FERME"
    const closedBadge = isClosed ? '<div class="closed-badge">FERME</div>' : '';
    
    item.innerHTML = `
        <div class="portfolio-overlay"></div>
        ${closedBadge}
        <h3>${project.title}</h3>
    `;

    item.addEventListener('click', () => {
        openProjectModal(project);
    });

    return item;
}

// Fonction pour ouvrir la modal de détail de projet
function openProjectModal(project) {
    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-body');
    
    // Ajouter ou retirer la classe "closed-project" selon le statut
    if (project.closed) {
        modal.classList.add('closed-project');
    } else {
        modal.classList.remove('closed-project');
    }
    
    // Générer le contenu vidéo ou images selon le type de projet
    let mediaHTML = '';
    let linkHTML = '';
    
    if (project.youtubeUrl) {
        // Extraire l'ID de la vidéo YouTube depuis l'URL
        const videoId = project.youtubeUrl.match(/(?:shorts\/|watch\?v=|embed\/)([a-zA-Z0-9_-]{11})/)?.[1];
        if (videoId) {
            mediaHTML = `
                <div class="project-video-container">
                    <iframe 
                        class="project-video-iframe"
                        src="https://www.youtube.com/embed/${videoId}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                    <a href="${project.youtubeUrl}" target="_blank" rel="noopener noreferrer" class="project-video-link">
                        Voir sur YouTube →
                    </a>
                </div>
            `;
        } else {
            // Fallback si l'URL n'est pas reconnue
            mediaHTML = `
                <div class="project-video-container">
                    <a href="${project.youtubeUrl}" target="_blank" rel="noopener noreferrer" class="project-video-link">
                        Voir la vidéo sur YouTube →
                    </a>
                </div>
            `;
        }
    } else if (project.images) {
        // Générer toutes les images du projet dans une grille bento
        mediaHTML = `<div class="project-images-grid project-grid-${project.images.length}">${project.images.map((img, idx) => `<img src="${img}" alt="${project.title}" class="project-detail-image grid-item-${idx + 1}">`).join('')}</div>`;
    } else {
        // Image unique
        mediaHTML = `<div class="project-images-grid project-grid-1"><img src="${project.image}" alt="${project.title}" class="project-detail-image grid-item-1"></div>`;
    }
    
    // Lien externe vers un site web si disponible
    if (project.url) {
        const isInstagram = project.url.includes('instagram.com');
        const linkText = isInstagram ? 'Voir la vidéo sur Instagram →' : 'Visiter le site →';
        linkHTML = `
            <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="project-video-link">
                ${linkText}
            </a>
        `;
    }
    
    // Badge "FERME" pour la modal si le projet est fermé
    const closedBadgeModal = project.closed ? '<div class="closed-badge-modal">FERME</div>' : '';
    
    // Générer le contenu de la modal
    modalBody.innerHTML = `
        <div class="project-detail-header">
            <h1 class="project-detail-title">${project.title}</h1>
            ${closedBadgeModal}
            <div class="project-detail-meta">
                <div class="project-meta-item">
                    <span class="project-meta-label">Type</span>
                    <span class="project-meta-value">${project.type}</span>
                </div>
                <div class="project-meta-item">
                    <span class="project-meta-label">Date</span>
                    <span class="project-meta-value">${project.date}</span>
                </div>
                <div class="project-meta-item">
                    <span class="project-meta-label">Client</span>
                    <span class="project-meta-value">${project.client}</span>
                </div>
            </div>
        </div>
        <p class="project-detail-description">${project.description}</p>
        <div class="project-tech">
            ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
        ${mediaHTML}
        ${linkHTML}
    `;
    
    // Afficher la modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Gérer la fermeture - utiliser once pour éviter les doublons
    const closeBtn = document.getElementById('modal-close');
    const backdrop = document.getElementById('modal-backdrop');
    
    closeBtn.onclick = closeProjectModal;
    backdrop.onclick = closeProjectModal;
    
    // Fermer avec Escape
    document.addEventListener('keydown', handleEscapeKey);
}

// Fonction pour fermer la modal
function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleEscapeKey);
}

// Fonction pour gérer la touche Escape
function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        closeProjectModal();
    }
}

// ===== DRAGGABLE STICKERS SYSTEM =====
// Fonction pour initialiser les stickers déplaçables
function initDraggableStickers() {
    const stickers = document.querySelectorAll('.draggable-sticker');
    
    stickers.forEach(sticker => {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;
        
        // Rotation par défaut selon la classe
        let initialRotation = '';
        if (sticker.classList.contains('sticker-1')) initialRotation = 'rotate(-15deg)';
        else if (sticker.classList.contains('sticker-2')) initialRotation = 'rotate(20deg)';
        else if (sticker.classList.contains('sticker-3')) initialRotation = 'rotate(10deg)';
        else if (sticker.classList.contains('sticker-4')) initialRotation = 'rotate(-25deg)';
        
        // Récupérer la position sauvegardée depuis localStorage
        const stickerId = sticker.classList[1]; // sticker-1, sticker-2, etc.
        const savedPosition = localStorage.getItem(`sticker-${stickerId}`);
        
        if (savedPosition) {
            const pos = JSON.parse(savedPosition);
            xOffset = pos.x || 0;
            yOffset = pos.y || 0;
            sticker.style.transform = `translate(${xOffset}px, ${yOffset}px) ${initialRotation}`;
        } else {
            // Appliquer la rotation initiale si pas de position sauvegardée
            sticker.style.transform = `translate(0px, 0px) ${initialRotation}`;
        }
        
        // Démarrer le drag
        function dragStart(e) {
            if (e.target === sticker || sticker.contains(e.target)) {
                isDragging = true;
                sticker.style.cursor = 'grabbing';
                sticker.style.zIndex = '1000';
                
                if (e.type === "touchstart") {
                    initialX = e.touches[0].clientX - xOffset;
                    initialY = e.touches[0].clientY - yOffset;
                } else {
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                }
            }
        }
        
        // Pendant le drag
        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                
                if (e.type === "touchmove") {
                    currentX = e.touches[0].clientX - initialX;
                    currentY = e.touches[0].clientY - initialY;
                } else {
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                }
                
                xOffset = currentX;
                yOffset = currentY;
                
                // Appliquer la transformation avec la rotation
                sticker.style.transform = `translate(${currentX}px, ${currentY}px) ${initialRotation}`;
            }
        }
        
        // Arrêter le drag
        function dragEnd(e) {
            if (isDragging) {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
                sticker.style.cursor = 'grab';
                sticker.style.zIndex = '10';
                
                // Sauvegarder la position dans localStorage
                const stickerId = sticker.classList[1];
                localStorage.setItem(`sticker-${stickerId}`, JSON.stringify({
                    x: xOffset,
                    y: yOffset
                }));
            }
        }
        
        // Événements souris
        sticker.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        
        // Événements tactiles (pour mobile)
        sticker.addEventListener('touchstart', dragStart, { passive: false });
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', dragEnd);
    });
}

// Initialiser les stickers déplaçables au chargement
document.addEventListener('DOMContentLoaded', () => {
    // Attendre un peu pour que les éléments soient bien chargés
    setTimeout(() => {
        initDraggableStickers();
    }, 500);
});
