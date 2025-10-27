// State management
let uploadedPhotos = [];
let currentPrompt = '';

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const photoGallery = document.getElementById('photoGallery');
const galleryActions = document.getElementById('galleryActions');
const photoCount = document.getElementById('photoCount');
const clearPhotosBtn = document.getElementById('clearPhotos');
const promptInput = document.getElementById('promptInput');
const charCount = document.getElementById('charCount');
const generateBtn = document.getElementById('generateBtn');
const generateHint = document.getElementById('generateHint');
const resultSection = document.getElementById('resultSection');
const resultContainer = document.getElementById('resultContainer');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const errorClose = document.getElementById('errorClose');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateGenerateButton();
});

// Event Listeners Setup
function setupEventListeners() {
    // Upload area click
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Clear photos
    clearPhotosBtn.addEventListener('click', clearAllPhotos);
    
    // Prompt input
    promptInput.addEventListener('input', handlePromptInput);
    
    // Generate button
    generateBtn.addEventListener('click', generateVideo);
    
    // Error close
    errorClose.addEventListener('click', hideError);
}

// File handling
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    addPhotos(files);
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/')
    );
    
    if (files.length === 0) {
        showError('Please drop only image files (JPG, PNG, GIF)');
        return;
    }
    
    addPhotos(files);
}

function addPhotos(files) {
    files.forEach(file => {
        if (!file.type.startsWith('image/')) {
            showError(`${file.name} is not an image file`);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const photo = {
                id: Date.now() + Math.random(),
                file: file,
                dataUrl: e.target.result,
                name: file.name
            };
            
            uploadedPhotos.push(photo);
            renderPhotoGallery();
            updateGenerateButton();
        };
        reader.readAsDataURL(file);
    });
}

function renderPhotoGallery() {
    if (uploadedPhotos.length === 0) {
        photoGallery.innerHTML = '';
        galleryActions.style.display = 'none';
        return;
    }
    
    galleryActions.style.display = 'flex';
    photoCount.textContent = `${uploadedPhotos.length} photo${uploadedPhotos.length !== 1 ? 's' : ''} selected`;
    
    photoGallery.innerHTML = uploadedPhotos.map(photo => `
        <div class="photo-item" data-id="${photo.id}">
            <img src="${photo.dataUrl}" alt="${photo.name}">
            <button class="photo-remove" onclick="removePhoto(${photo.id})">×</button>
        </div>
    `).join('');
}

function removePhoto(photoId) {
    uploadedPhotos = uploadedPhotos.filter(photo => photo.id !== photoId);
    renderPhotoGallery();
    updateGenerateButton();
}

function clearAllPhotos() {
    if (confirm('Are you sure you want to remove all photos?')) {
        uploadedPhotos = [];
        fileInput.value = '';
        renderPhotoGallery();
        updateGenerateButton();
    }
}

// Prompt handling
function handlePromptInput(e) {
    currentPrompt = e.target.value;
    charCount.textContent = `${currentPrompt.length} characters`;
    updateGenerateButton();
}

// Generate button state
function updateGenerateButton() {
    const hasPhotos = uploadedPhotos.length > 0;
    const hasPrompt = currentPrompt.trim().length > 0;
    
    generateBtn.disabled = !(hasPhotos && hasPrompt);
    
    if (!hasPhotos && !hasPrompt) {
        generateHint.textContent = 'Upload at least one photo and add a prompt to continue';
    } else if (!hasPhotos) {
        generateHint.textContent = 'Upload at least one photo to continue';
    } else if (!hasPrompt) {
        generateHint.textContent = 'Add a prompt to describe your video';
    } else {
        generateHint.textContent = 'Ready to generate your video!';
        generateHint.style.color = 'var(--success)';
    }
}

// Video generation
async function generateVideo() {
    if (uploadedPhotos.length === 0 || !currentPrompt.trim()) {
        showError('Please upload photos and provide a prompt');
        return;
    }
    
    // Show loading state
    const btnText = generateBtn.querySelector('.btn-text');
    const btnLoader = generateBtn.querySelector('.btn-loader');
    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';
    btnLoader.querySelector('span:last-child').textContent = 'Generating video... This may take 30-60 seconds...';
    generateBtn.disabled = true;
    
    try {
        // Convert photos to base64
        const photosData = uploadedPhotos.map(photo => ({
            name: photo.name,
            data: photo.dataUrl
        }));
        
        // Call Netlify function
        const response = await fetch('/.netlify/functions/generate-video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                photos: photosData,
                prompt: currentPrompt
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate video');
        }
        
        const result = await response.json();
        displayResult(result);
        
    } catch (error) {
        console.error('Error generating video:', error);
        showError(error.message || 'Failed to generate video. Please try again.');
    } finally {
        // Reset button state
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        generateBtn.disabled = false;
    }
}

// Display result
function displayResult(result) {
    resultSection.style.display = 'block';
    
    // Scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    let resultHTML = '<div class="result-info">';
    
    if (result.videoUrl) {
        resultHTML += `
            <video class="result-video" controls autoplay>
                <source src="${result.videoUrl}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            <div class="result-actions">
                <a href="${result.videoUrl}" download="ai-generated-video.mp4" class="btn btn-primary">
                    Download Video
                </a>
            </div>
        `;
    } else if (result.message) {
        resultHTML += `<p style="color: var(--text-primary); margin-bottom: 1rem;">${result.message}</p>`;
    }
    
    // Show full response for debugging
    resultHTML += `
        <details style="margin-top: 1rem;">
            <summary style="cursor: pointer; color: var(--text-secondary); margin-bottom: 0.5rem;">View API Response</summary>
            <pre>${JSON.stringify(result, null, 2)}</pre>
        </details>
    `;
    
    resultHTML += '</div>';
    
    resultContainer.innerHTML = resultHTML;
}

// Error handling
function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
    
    // Auto-hide after 5 seconds
    setTimeout(hideError, 5000);
}

function hideError() {
    errorMessage.style.display = 'none';
}

// Make removePhoto available globally
window.removePhoto = removePhoto;
