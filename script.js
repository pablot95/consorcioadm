// === FIREBASE CONFIG ===
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyDQwd0ADyhufmohDzVOnBVzi4dmJfc_nyY",
    authDomain: "bastonspaulete-14784.firebaseapp.com",
    projectId: "bastonspaulete-14784",
    storageBucket: "bastonspaulete-14784.firebasestorage.app",
    messagingSenderId: "777636517630",
    appId: "1:777636517630:web:f8314cc3504be0111ff7af"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// === VARIABLES GLOBALES ===
const propertiesData = { roca: [], laplata: [] };
let currentRegion = 'roca';

// === FORMATEAR PRECIO ===
function formatPrice(precio, moneda = 'USD') {
    const symbol = moneda === 'ARS' ? 'ARS $' : 'USD $';
    return `${symbol} ${precio}`;
}

// === CARGAR PROPIEDADES DESDE FIREBASE ===
async function loadProperties() {
    try {
        console.log('Cargando propiedades...');
        const snapshot = await getDocs(collection(db, "propiedades"));
        
        snapshot.forEach((doc) => {
            const d = doc.data();
            if (!d.titulo) return;
            
            const prop = {
                id: doc.id,
                address: d.titulo,
                type: d.tipo || 'Propiedad',
                operationType: d.operacion || 'venta',
                location: d.ubicacion || '',
                region: d.region || 'roca',
                price: d.precio || '0',
                moneda: d.moneda || 'USD',
                bedrooms: d.dormitorios,
                bathrooms: d.banios,
                area: d.superficie?.cubierta,
                landArea: d.superficie?.total,
                antiguedad: d.antiguedad,
                image: d.imagenes?.principal || 'https://via.placeholder.com/800x600?text=Sin+Imagen',
                images: d.imagenes?.galeria || [d.imagenes?.principal],
                caracteristicas: d.caracteristicas || {},
                description: d.descripcion || '',
                coordinates: { lat: d.lat || -39.0333, lng: d.lng || -67.5833 }
            };
            
            if (prop.region === 'roca') propertiesData.roca.push(prop);
            else propertiesData.laplata.push(prop);
        });
        
        console.log(`✓ Cargadas: ${propertiesData.roca.length} Roca, ${propertiesData.laplata.length} La Plata`);
    } catch (err) {
        console.error('Error cargando Firebase:', err);
    }
}

// === CREAR TARJETA ===
function createCard(prop) {
    const card = document.createElement('div');
    card.className = 'property-card';
    card.dataset.propertyId = prop.id; // Usar dataset en lugar de onclick
    
    const opText = prop.operationType === 'venta' ? 'en Venta' : 'en Alquiler';
    const opClass = prop.operationType === 'venta' ? 'operation-sale' : 'operation-rent';
    const price = formatPrice(prop.price, prop.moneda);
    
    card.innerHTML = `
        <img src="${prop.image}" alt="${prop.address}" class="property-image" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=Error'">
        <div class="property-badge ${opClass}">${prop.type} ${opText}</div>
        <div class="property-info">
            <h3 class="property-address">${prop.address}</h3>
            <div class="property-location"><i class="fas fa-map-marker-alt"></i> ${prop.location}</div>
            <div class="property-details">
                ${prop.bedrooms ? `<div class="detail-item"><i class="fas fa-bed"></i><span>${prop.bedrooms}</span></div>` : ''}
                ${prop.bathrooms ? `<div class="detail-item"><i class="fas fa-bath"></i><span>${prop.bathrooms}</span></div>` : ''}
                ${prop.area ? `<div class="detail-item"><i class="fas fa-ruler-combined"></i><span>${prop.area}m²</span></div>` : ''}
            </div>
            <div class="property-price">${price}</div>
        </div>
    `;
    
    return card;
}

// === MOSTRAR PROPIEDADES ===
let currentProperties = []; // Guardar referencia a propiedades actuales

function displayProperties(region = null) {
    const grid = document.getElementById('propertiesGrid');
    if (!grid) return;
    
    // Limpiar completamente el grid
    while (grid.firstChild) {
        grid.removeChild(grid.firstChild);
    }
    
    let props = [];
    
    if (region) {
        props = propertiesData[region] || [];
    } else {
        // Mostrar 8 propiedades aleatorias de ambas regiones
        const allProps = [...propertiesData.roca, ...propertiesData.laplata];
        props = allProps.sort(() => Math.random() - 0.5).slice(0, 8);
    }
    
    if (props.length === 0) {
        grid.innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:40px;">No hay propiedades disponibles</p>';
        return;
    }
    
    currentProperties = props; // Guardar referencia
    props.forEach(prop => grid.appendChild(createCard(prop)));
}

// === MODAL ELIMINADO - REDIRECCIÓN DIRECTA A DETALLE ===
function openModal(prop) {
    // Redirigir directamente a la página de detalles
    window.location.href = `property-detail.html?id=${prop.id}`;
}

// Función obsoleta - Mantenida vacía por seguridad
window.closeModal = function() {};

// === CARRUSEL ===
function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;
    
    let current = 0;
    setInterval(() => {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }, 5000);
}

// === HERO BUTTONS ===
function initHeroButtons() {
    const heroButtons = document.querySelectorAll('.hero-btn');
    const searchPanel = document.getElementById('searchPanel');
    const regionButtons = document.querySelectorAll('.region-btn');
    const locationSelect = document.getElementById('location');
    const btnSearch = document.getElementById('btnSearch');
    
    const locationsByRegion = {
        roca: ['General Roca', 'Ingeniero Huergo', 'Regina', 'General Godoy', 'Cervantes', 'Allen'],
        laplata: ['La Plata', 'Ensenada', 'Berisso', 'Gonnet', 'Tolosa']
    };
    
    let currentFilters = {};
    
    heroButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            
            if (action === 'alquilar' || action === 'comprar') {
                heroButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                searchPanel.classList.add('active');
                currentFilters.action = action;
            } else if (action === 'vender') {
                const contactSection = document.querySelector('#contacto');
                if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
            } else if (action === 'administrar') {
                const consorciosSection = document.querySelector('#contacto');
                if (consorciosSection) consorciosSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    regionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            regionButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const region = btn.dataset.region;
            currentFilters.region = region;
            
            locationSelect.style.display = 'block';
            locationSelect.innerHTML = '<option value="">Todas las ubicaciones</option>';
            
            locationsByRegion[region].forEach(loc => {
                const option = document.createElement('option');
                option.value = loc;
                option.textContent = loc;
                locationSelect.appendChild(option);
            });
        });
    });
    
    document.getElementById('propertyType').addEventListener('change', (e) => {
        currentFilters.propertyType = e.target.value;
    });
    
    locationSelect.addEventListener('change', (e) => {
        currentFilters.location = e.target.value;
    });
    
    btnSearch.addEventListener('click', () => {
        if (!currentFilters.region) {
            alert('Por favor selecciona una región');
            return;
        }
        
        let props = propertiesData[currentFilters.region] || [];
        
        if (currentFilters.propertyType) {
            props = props.filter(p => p.type.toLowerCase() === currentFilters.propertyType.toLowerCase());
        }
        
        if (currentFilters.location) {
            props = props.filter(p => p.location === currentFilters.location);
        }
        
        const grid = document.getElementById('propertiesGrid');
        if (grid) {
            grid.innerHTML = '';
            if (props.length === 0) {
                grid.innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:40px;">No se encontraron propiedades con los filtros seleccionados.</p>';
            } else {
                props.forEach(prop => grid.appendChild(createCard(prop)));
                updateMap(props);
            }
            document.getElementById('propiedades').scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// === BOTONES UBICACIÓN ===
function initLocationButtons() {
    const buttons = document.querySelectorAll('.location-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const region = btn.dataset.location;
            displayProperties(region);
        });
    });
}

// === ANIMACIONES SCROLL ===
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.property-card, .feature-card').forEach(el => observer.observe(el));
}

// === INICIO ===
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Iniciando...');
    
    initCarousel();
    initHeroButtons();
    initLocationButtons();
    
    // Event delegation para clicks en tarjetas de propiedades
    const grid = document.getElementById('propertiesGrid');
    if (grid) {
        grid.addEventListener('click', (e) => {
            const card = e.target.closest('.property-card');
            if (card && card.dataset.propertyId) {
                const propId = card.dataset.propertyId;
                const prop = currentProperties.find(p => p.id === propId);
                if (prop) openModal(prop);
            }
        });
    }
    
    await loadProperties();
    
    // Mostrar 8 propiedades aleatorias (sin región específica)
    displayProperties();
    initScrollAnimations();
    
    console.log('✓ Aplicación lista');
});
