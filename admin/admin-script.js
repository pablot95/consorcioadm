// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

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
const storage = getStorage(app);

// Credenciales de acceso
const ADMIN_CREDENTIALS = {
    username: 'bastonspaulete',
    password: 'Bastonspaulete2025'
};

// Localidades por región
const locationsByRegion = {
    roca: ['General Roca', 'Ingeniero Huergo', 'Regina', 'General Godoy', 'Cervantes', 'Villa Regina'],
    laplata: ['La Plata', 'Ensenada', 'Berisso', 'Gonnet', 'Tolosa']
};

// Check if logged in
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    
    if (isLoggedIn) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainSection').style.display = 'block';
        loadProperties();
    } else {
        document.getElementById('loginSection').style.display = 'flex';
        document.getElementById('mainSection').style.display = 'none';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', checkAuth);

// Login
window.login = function(event) {
    event.preventDefault();
    const username = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        checkAuth();
    } else {
        alert('Usuario o contraseña incorrectos');
    }
};

// Logout
window.logout = function() {
    sessionStorage.removeItem('adminLoggedIn');
    alert('Sesión cerrada');
    checkAuth();
};

// Update Locations based on Region
window.updateLocations = function() {
    const region = document.getElementById('region').value;
    const locationSelect = document.getElementById('location');
    
    locationSelect.innerHTML = '<option value="">Seleccionar...</option>';
    
    if (region && locationsByRegion[region]) {
        locationsByRegion[region].forEach(loc => {
            const option = document.createElement('option');
            option.value = loc;
            option.textContent = loc;
            locationSelect.appendChild(option);
        });
    }
};

// Preview Images
window.previewImages = function() {
    const files = document.getElementById('images').files;
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    
    if (files.length > 0) {
        Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.className = 'preview-item';
                div.innerHTML = `
                    <img src="${e.target.result}" alt="Preview ${index + 1}">
                    <span class="preview-label">${index === 0 ? 'Principal' : `Imagen ${index + 1}`}</span>
                `;
                preview.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    }
};

// Load Properties
async function loadProperties() {
    const propertiesList = document.getElementById('propertiesList');
    propertiesList.innerHTML = '<p class="loading"><i class="fas fa-spinner fa-spin"></i> Cargando propiedades...</p>';

    try {
        const q = query(collection(db, "propiedades"), orderBy("fechaCreacion", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            propertiesList.innerHTML = '<p class="no-data">No hay propiedades publicadas</p>';
            return;
        }

        propertiesList.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const property = doc.data();
            const card = createPropertyCard(doc.id, property);
            propertiesList.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading properties:", error);
        propertiesList.innerHTML = '<p class="error">Error al cargar propiedades</p>';
    }
}

// Create Property Card
function createPropertyCard(id, property) {
    const div = document.createElement('div');
    div.className = 'property-card';
    
    const operationType = property.operacion === 'venta' ? 'Venta' : 'Alquiler';
    const operationClass = property.operacion === 'venta' ? 'operation-sale' : 'operation-rent';
    
    const isReserved = property.estado === 'reservada';
    const reservedClass = isReserved ? 'status-reserved' : '';
    const reservedText = isReserved ? 'Reservada' : 'Marcar Reservada';
    const reservedIcon = isReserved ? 'fa-bookmark' : 'fa-bookmark';
    const reservedBtnClass = isReserved ? 'btn-unreserve' : 'btn-reserve';
    const reservedBtnTitle = isReserved ? 'Quitar Reserva' : 'Marcar como Reservada';

    // Badge visible en la card del admin si está reservada
    const reservedBadge = isReserved ? '<span class="badge badge-reserved-admin" style="background:var(--color-accent-gold); color:white; margin-left:5px;">RESERVADA</span>' : '';

    div.innerHTML = `
        <div class="property-card-image">
            <img src="${property.imagenes?.principal || property.imagenes?.[0] || ''}" alt="${property.titulo}">
            <span class="badge ${operationClass}">${operationType}</span>
            ${reservedBadge}
        </div>
        <div class="property-card-content">
            <h3>${property.titulo}</h3>
            <p class="location"><i class="fas fa-map-marker-alt"></i> ${property.ubicacion}</p>
            <p class="price">${property.precio}</p>
            <div class="card-actions">
                <button onclick="toggleReservation('${id}', '${property.estado || 'disponible'}')" class="${reservedBtnClass}" title="${reservedBtnTitle}" style="background: ${isReserved ? '#666' : '#CCA352'}; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">
                    <i class="fas ${reservedIcon}"></i>
                </button>
                <button onclick="editProperty('${id}')" class="btn-edit" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteProperty('${id}')" class="btn-delete" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    return div;
}

// Toggle Reservation Status
window.toggleReservation = async function(id, currentStatus) {
    const newStatus = currentStatus === 'reservada' ? 'disponible' : 'reservada';
    const confirmMsg = newStatus === 'reservada' ? '¿Marcar esta propiedad como RESERVADA?' : '¿Quitar la marca de RESERVADA y ponerla como disponible?';

    if (!confirm(confirmMsg)) return;

    try {
        await updateDoc(doc(db, "propiedades", id), {
            estado: newStatus,
            fechaActualizacion: new Date()
        });
        // alert(`Propiedad marcada como ${newStatus}`);
        loadProperties();
    } catch (error) {
        console.error("Error updating status:", error);
        alert('Error al actualizar el estado');
    }
};

// Global array to store current images
window.currentImages = [];

// Add images incrementally
window.addImages = function() {
    const imageFiles = document.getElementById('images').files;
    const preview = document.getElementById('imagePreview');
    
    Array.from(imageFiles).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgData = {
                file: file,
                url: e.target.result,
                isNew: true
            };
            window.currentImages.push(imgData);
            renderImagePreview();
        };
        reader.readAsDataURL(file);
    });
    
    // Clear input
    document.getElementById('images').value = '';
};

// Remove image from list
window.removeImage = function(index) {
    window.currentImages.splice(index, 1);
    renderImagePreview();
};

// Render image preview
function renderImagePreview() {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = window.currentImages.map((img, index) => `
        <div class="preview-item">
            <img src="${img.url}" alt="Preview ${index + 1}">
            <button type="button" class="remove-img" onclick="removeImage(${index})" title="Eliminar imagen">
                <i class="fas fa-times"></i>
            </button>
            ${index === 0 ? '<span class="main-badge">Principal</span>' : ''}
        </div>
    `).join('');
}

// Save Property
window.saveProperty = async function(event) {
    event.preventDefault();
    
    const propertyId = document.getElementById('propertyId').value;
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    try {
        // Upload new images
        let imageUrls = [];
        
        for (let i = 0; i < window.currentImages.length; i++) {
            const imgData = window.currentImages[i];
            if (imgData.isNew && imgData.file) {
                // Upload new image
                const storageRef = ref(storage, `propiedades/${Date.now()}_${imgData.file.name}`);
                await uploadBytes(storageRef, imgData.file);
                const url = await getDownloadURL(storageRef);
                imageUrls.push(url);
            } else {
                // Keep existing image URL
                imageUrls.push(imgData.url);
            }
        }

        // Prepare property data
        const moneda = document.getElementById('moneda').value;
        const precio = document.getElementById('price').value;
        const currentStatus = document.getElementById('propertyStatus').value || 'disponible';
        
        const propertyData = {
            titulo: document.getElementById('address').value,
            tipo: document.getElementById('type').value,
            operacion: document.getElementById('operationType').value,
            ubicacion: document.getElementById('location').value,
            zona: document.getElementById('location').value,
            region: document.getElementById('region').value,
            precio: precio,
            moneda: moneda,
            ambientes: parseInt(document.getElementById('bedrooms').value) || null,
            dormitorios: parseInt(document.getElementById('bedrooms').value) || null,
            banios: parseInt(document.getElementById('bathrooms').value) || null,
            antiguedad: parseInt(document.getElementById('antiguedad').value) || null,
            descripcion: document.getElementById('description').value,
            lat: parseFloat(document.getElementById('lat').value),
            lng: parseFloat(document.getElementById('lng').value),
            superficie: {
                cubierta: parseInt(document.getElementById('area').value) || null,
                total: parseInt(document.getElementById('landArea').value) || parseInt(document.getElementById('area').value) || null
            },
            caracteristicas: {
                aguaCorriente: document.getElementById('aguaCorriente').checked,
                luzElectrica: document.getElementById('luzElectrica').checked,
                gasNatural: document.getElementById('gasNatural').checked,
                pileta: document.getElementById('pileta').checked,
                parrilla: document.getElementById('parrilla').checked,
                jardin: document.getElementById('jardin').checked,
                seguridad: document.getElementById('seguridad').checked,
                aptoMascotas: document.getElementById('aptoMascotas').checked,
                aptoCredito: document.getElementById('aptoCredito').checked,
                escrituraInmediata: document.getElementById('escrituraInmediata').checked,
                planosAprobados: document.getElementById('planosAprobados').checked
            },
            estado: currentStatus
        };

        // Add images if uploaded
        if (imageUrls.length > 0) {
            propertyData.imagenes = {
                principal: imageUrls[0],
                galeria: imageUrls
            };
        }

        // Save or update
        if (propertyId) {
            // Update existing
            await updateDoc(doc(db, "propiedades", propertyId), {
                ...propertyData,
                fechaActualizacion: new Date()
            });
            alert('Propiedad actualizada exitosamente');
        } else {
            // Create new
            await addDoc(collection(db, "propiedades"), {
                ...propertyData,
                fechaCreacion: new Date()
            });
            alert('Propiedad creada exitosamente');
        }

        resetForm();
        loadProperties();
    } catch (error) {
        console.error("Error saving property:", error);
        alert('Error al guardar la propiedad: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Propiedad';
    }
};

// Edit Property
window.editProperty = async function(id) {
    try {
        const docSnap = await getDocs(query(collection(db, "propiedades")));
        let property = null;
        
        docSnap.forEach((doc) => {
            if (doc.id === id) {
                property = doc.data();
            }
        });

        if (!property) return;

        document.getElementById('propertyId').value = id;
        document.getElementById('propertyStatus').value = property.estado || 'disponible'; // Cargar estado
        document.getElementById('formTitle').textContent = 'Editar Propiedad';
        document.getElementById('address').value = property.titulo || '';
        document.getElementById('type').value = property.tipo || '';
        document.getElementById('operationType').value = property.operacion || '';
        document.getElementById('region').value = property.region || '';
        
        updateLocations();
        
        document.getElementById('location').value = property.ubicacion || '';
        document.getElementById('moneda').value = property.moneda || 'USD';
        document.getElementById('price').value = property.precio || '';
        document.getElementById('bedrooms').value = property.dormitorios || '';
        document.getElementById('bathrooms').value = property.banios || '';
        document.getElementById('area').value = property.superficie?.cubierta || '';
        document.getElementById('landArea').value = property.superficie?.total || '';
        document.getElementById('antiguedad').value = property.antiguedad || '';
        document.getElementById('lat').value = property.lat || '';
        document.getElementById('lng').value = property.lng || '';
        document.getElementById('description').value = property.descripcion || '';
        
        // Load existing images
        window.currentImages = [];
        if (property.imagenes) {
            if (property.imagenes.principal) {
                window.currentImages.push({ url: property.imagenes.principal, isNew: false });
            }
            if (property.imagenes.galeria && Array.isArray(property.imagenes.galeria)) {
                property.imagenes.galeria.forEach(url => {
                    window.currentImages.push({ url: url, isNew: false });
                });
            }
        }
        renderImagePreview();

        // Características
        if (property.caracteristicas) {
            document.getElementById('aguaCorriente').checked = property.caracteristicas.aguaCorriente || false;
            document.getElementById('luzElectrica').checked = property.caracteristicas.luzElectrica || false;
            document.getElementById('gasNatural').checked = property.caracteristicas.gasNatural || false;
            document.getElementById('pileta').checked = property.caracteristicas.pileta || false;
            document.getElementById('parrilla').checked = property.caracteristicas.parrilla || false;
            document.getElementById('jardin').checked = property.caracteristicas.jardin || false;
            document.getElementById('seguridad').checked = property.caracteristicas.seguridad || false;
            document.getElementById('aptoMascotas').checked = property.caracteristicas.aptoMascotas || false;
            document.getElementById('aptoCredito').checked = property.caracteristicas.aptoCredito || false;
            document.getElementById('escrituraInmediata').checked = property.caracteristicas.escrituraInmediata || false;
            document.getElementById('planosAprobados').checked = property.caracteristicas.planosAprobados || false;
        }

        document.getElementById('propertyForm').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error("Error editing property:", error);
        alert('Error al cargar la propiedad');
    }
};

// Delete Property
window.deleteProperty = async function(id) {
    if (!confirm('¿Está seguro de que desea eliminar esta propiedad?')) return;

    try {
        await deleteDoc(doc(db, "propiedades", id));
        alert('Propiedad eliminada exitosamente');
        loadProperties();
    } catch (error) {
        console.error("Error deleting property:", error);
        alert('Error al eliminar la propiedad');
    }
};

// Reset Form
window.resetForm = function() {
    window.currentImages = [];
    renderImagePreview();
    document.getElementById('propertyForm').reset();
    document.getElementById('propertyId').value = '';
    document.getElementById('propertyStatus').value = 'disponible';
    document.getElementById('antiguedad').value = '';
    document.getElementById('formTitle').textContent = 'Nueva Propiedad';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('location').innerHTML = '<option value="">Primero seleccione región...</option>';
};
