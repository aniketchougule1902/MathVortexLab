// script.js - Main JavaScript for Linear Algebra Vector Checker

// ===== Global Variables =====
let currentDimension = 3; // Default to 3D
let vectors = [];
let isRotating = false;
let showLabels = true;
let graphRotation = { x: 30, y: 45, z: 0 };
let isMobile = false;
let alertContainer = null;

// ===== DOM Elements =====
const dimensionInput = document.getElementById('dimensionInput');
const vectorCountSpan = document.getElementById('vectorCount');
const vectorInputsContainer = document.getElementById('vectorInputs');
const addVectorBtn = document.getElementById('addVectorBtn');
const removeVectorBtn = document.getElementById('removeVectorBtn');
const clearVectorsBtn = document.getElementById('clearVectorsBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const randomBtn = document.getElementById('randomBtn');
const mathResults = document.getElementById('mathResults');
const graphCanvas = document.getElementById('graphCanvas');
const graphPlaceholder = document.getElementById('graphPlaceholder');
const graphicalResults = document.getElementById('graphicalResults');
const highDimNote = document.getElementById('highDimNote');
const rotateBtn = document.getElementById('rotateBtn');
const exportGraphBtn = document.getElementById('exportGraphBtn');
const toggleLabelsBtn = document.getElementById('toggleLabelsBtn');
const exportResultsBtn = document.getElementById('exportResultsBtn');
const exportGraphImageBtn = document.getElementById('exportGraphImageBtn');
const copyResultsBtn = document.getElementById('copyResultsBtn');
const exampleBtns = document.querySelectorAll('.example-btn');
const quickDimBtns = document.querySelectorAll('.quick-dim-btn');

// ===== Alert System =====
function initAlertSystem() {
    // Create alert container if it doesn't exist
    if (!document.querySelector('.alert-container')) {
        alertContainer = document.createElement('div');
        alertContainer.className = 'alert-container';
        document.body.appendChild(alertContainer);
    } else {
        alertContainer = document.querySelector('.alert-container');
    }
}

function showAlert(type, title, message, duration = 5000) {
    if (!alertContainer) initAlertSystem();
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    
    // Set icon based on type
    let icon = 'info-circle';
    switch(type) {
        case 'success': icon = 'check-circle'; break;
        case 'error': icon = 'exclamation-circle'; break;
        case 'warning': icon = 'exclamation-triangle'; break;
        case 'info': icon = 'info-circle'; break;
    }
    
    alert.innerHTML = `
        <i class="fas fa-${icon} alert-icon"></i>
        <div class="alert-content">
            <div class="alert-title">${title}</div>
            <div class="alert-message">${message}</div>
        </div>
        <button class="alert-close"><i class="fas fa-times"></i></button>
    `;
    
    alertContainer.appendChild(alert);
    
    // Trigger animation
    setTimeout(() => {
        alert.style.opacity = '1';
        alert.style.transform = 'translateX(0)';
    }, 10);
    
    // Close button event
    alert.querySelector('.alert-close').addEventListener('click', () => {
        closeAlert(alert);
    });
    
    // Auto close after duration
    if (duration > 0) {
        setTimeout(() => {
            if (alert.parentNode) {
                closeAlert(alert);
            }
        }, duration);
    }
    
    return alert;
}

function closeAlert(alert) {
    alert.classList.add('hide');
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 300);
}

// ===== Mobile Navigation =====
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// ===== Initialize Application =====
document.addEventListener('DOMContentLoaded', function() {
    // Check if mobile device
    isMobile = window.innerWidth <= 768;
    
    // Initialize alert system
    initAlertSystem();
    
    // Show welcome message
    showAlert('info', 'Welcome to MathVortex Labs!', 'Start by entering vectors or trying the quick examples.');
    
    // Initialize vector inputs
    vectors = Array(3).fill().map(() => Array(currentDimension).fill(0));
    
    // Set up event listeners
    setupEventListeners();
    
    // Update UI
    updateVectorInputs();
    updateVectorCount();
    updateGraphicalSection();
    
    // Draw initial graph placeholder
    drawGraphPlaceholder();
    
    // Set canvas size based on device
    updateCanvasSize();
    
    // Initialize mobile navigation
    initMobileNav();
    
    // Add resize listener for responsive canvas
    window.addEventListener('resize', handleResize);
});

// ===== Mobile Navigation =====
function initMobileNav() {
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target) && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

// ===== Responsive Canvas Handling =====
function updateCanvasSize() {
    if (!graphCanvas) return;
    
    const container = graphCanvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight || 300;
    
    // Set canvas dimensions
    graphCanvas.width = containerWidth;
    graphCanvas.height = containerHeight;
    
    // If graph is currently displayed, redraw it
    if (graphCanvas.style.display !== 'none') {
        drawGraph();
    }
}

function handleResize() {
    updateCanvasSize();
    
    // Check if we need to switch mobile state
    const wasMobile = isMobile;
    isMobile = window.innerWidth <= 768;
    
    // Update vector inputs if mobile state changed
    if (wasMobile !== isMobile) {
        updateVectorInputs();
    }
}

// ===== Event Listeners Setup =====
function setupEventListeners() {
    // Dimension input change
    dimensionInput.addEventListener('change', () => {
        const newDim = parseInt(dimensionInput.value);
        if (newDim < 2 || newDim > 10) {
            showAlert('error', 'Invalid Dimension', 'Dimension must be between 2 and 10');
            dimensionInput.value = currentDimension;
            return;
        }
        
        currentDimension = newDim;
        
        // Update quick dimension buttons
        updateQuickDimButtons();
        
        // Update vectors to new dimension
        vectors = vectors.map(vector => {
            if (vector.length < currentDimension) {
                // Add zeros for new dimensions
                return [...vector, ...Array(currentDimension - vector.length).fill(0)];
            } else if (vector.length > currentDimension) {
                // Truncate for lower dimensions
                return vector.slice(0, currentDimension);
            }
            return vector;
        });
        
        // If we have fewer vectors than dimension+2, add some
        if (vectors.length < currentDimension + 1 && vectors.length < 10) {
            const vectorsToAdd = Math.min(currentDimension + 1 - vectors.length, 10 - vectors.length);
            for (let i = 0; i < vectorsToAdd; i++) {
                vectors.push(Array(currentDimension).fill(0));
            }
        }
        
        // Update UI
        updateVectorInputs();
        updateVectorCount();
        updateGraphicalSection();
        clearResults();
        
        // Update canvas size
        updateCanvasSize();
        
        showAlert('info', 'Dimension Changed', `Now analyzing vectors in ${currentDimension}D space`);
    });
    
    // Quick dimension buttons
    quickDimBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const dim = parseInt(btn.dataset.dim);
            dimensionInput.value = dim;
            dimensionInput.dispatchEvent(new Event('change'));
        });
    });
    
    // Vector controls
    addVectorBtn.addEventListener('click', addVector);
    removeVectorBtn.addEventListener('click', removeVector);
    clearVectorsBtn.addEventListener('click', clearVectors);
    
    // Analysis button
    analyzeBtn.addEventListener('click', analyzeVectors);
    
    // Random vectors button
    randomBtn.addEventListener('click', generateRandomVectors);
    
    // Graph controls (only for 2D/3D)
    if (rotateBtn) rotateBtn.addEventListener('click', toggleRotation);
    if (exportGraphBtn) exportGraphBtn.addEventListener('click', exportGraph);
    if (toggleLabelsBtn) toggleLabelsBtn.addEventListener('click', toggleLabels);
    
    // Export buttons
    if (exportResultsBtn) exportResultsBtn.addEventListener('click', exportResults);
    if (exportGraphImageBtn) exportGraphImageBtn.addEventListener('click', exportGraphImage);
    if (copyResultsBtn) copyResultsBtn.addEventListener('click', copyResults);
    
    // Example buttons
    exampleBtns.forEach(btn => {
        btn.addEventListener('click', () => loadExample(btn.dataset.example));
    });
    
    // Improve touch experience on mobile
    improveMobileTouch();
}

function improveMobileTouch() {
    // Add touch-friendly class to buttons on mobile
    if (isMobile) {
        document.querySelectorAll('.btn, .btn-icon, .example-btn, .quick-dim-btn').forEach(btn => {
            btn.classList.add('touch-target');
        });
    }
    
    // Prevent zoom on double tap for number inputs
    document.querySelectorAll('.comp-input').forEach(input => {
        input.addEventListener('touchstart', (e) => {
            if (isMobile) {
                e.target.style.fontSize = '16px'; // Prevents iOS zoom
            }
        });
    });
}

// ===== Update Functions =====
function updateQuickDimButtons() {
    quickDimBtns.forEach(btn => {
        const dim = parseInt(btn.dataset.dim);
        if (dim === currentDimension) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function updateGraphicalSection() {
    if (currentDimension <= 3) {
        // Show graphical section for 2D and 3D
        graphicalResults.style.display = 'block';
        highDimNote.style.display = 'none';
    } else {
        // Hide graphical section for higher dimensions
        graphicalResults.style.display = 'none';
        
        // Hide graph if visible
        graphPlaceholder.style.display = 'flex';
        graphCanvas.style.display = 'none';
    }
}

// ===== Vector Management Functions =====
function addVector() {
    if (vectors.length >= 10) {
        showAlert('warning', 'Maximum Vectors Reached', 'You can only add up to 10 vectors');
        return;
    }
    
    // Create new vector with zeros for current dimension
    vectors.push(Array(currentDimension).fill(0));
    
    // Update UI
    updateVectorInputs();
    updateVectorControls();
    updateVectorCount();
    
    showAlert('success', 'Vector Added', `Vector ${vectors.length} added with ${currentDimension} components`);
}

function removeVector() {
    if (vectors.length <= 2) {
        showAlert('warning', 'Minimum Vectors Required', 'At least 2 vectors are required');
        return;
    }
    
    vectors.pop();
    
    // Update UI
    updateVectorInputs();
    updateVectorControls();
    updateVectorCount();
    
    showAlert('info', 'Vector Removed', `Vector removed. Now have ${vectors.length} vectors`);
}

function clearVectors() {
    // Reset to three zero vectors
    vectors = Array(3).fill().map(() => Array(currentDimension).fill(0));
    
    // Update UI
    updateVectorInputs();
    updateVectorControls();
    updateVectorCount();
    clearResults();
    
    showAlert('info', 'Vectors Cleared', 'All vectors have been reset to zero');
}

function updateVectorInputs() {
    vectorInputsContainer.innerHTML = '';
    
    vectors.forEach((vector, index) => {
        const vectorElement = document.createElement('div');
        vectorElement.className = 'vector-input';
        
        const label = document.createElement('div');
        label.className = 'vector-label';
        label.textContent = `v${index + 1}:`;
        
        const components = document.createElement('div');
        components.className = 'vector-components';
        
        // Create input for each component
        vector.forEach((component, compIndex) => {
            const componentGroup = document.createElement('div');
            componentGroup.className = 'component-group';
            
            const compInput = document.createElement('input');
            compInput.type = 'number';
            compInput.className = 'comp-input';
            compInput.value = component;
            compInput.dataset.vectorIndex = index;
            compInput.dataset.componentIndex = compIndex;
            compInput.step = 'any';
            compInput.inputMode = 'decimal';
            
            // Optimize for mobile
            if (isMobile) {
                compInput.setAttribute('inputmode', 'decimal');
                compInput.setAttribute('pattern', '[0-9]*');
            }
            
            // Label components based on dimension
            if (currentDimension <= 3) {
                const labels = ['x', 'y', 'z'];
                compInput.placeholder = labels[compIndex] || `c${compIndex + 1}`;
                compInput.title = `${labels[compIndex] || `Component ${compIndex + 1}`} coordinate`;
            } else {
                compInput.placeholder = `c${compIndex + 1}`;
                compInput.title = `Component ${compIndex + 1}`;
            }
            
            compInput.addEventListener('input', (e) => {
                const vectorIndex = parseInt(e.target.dataset.vectorIndex);
                const componentIndex = parseInt(e.target.dataset.componentIndex);
                const value = parseFloat(e.target.value) || 0;
                
                vectors[vectorIndex][componentIndex] = value;
            });
            
            // Add touch events for better mobile experience
            if (isMobile) {
                compInput.addEventListener('touchstart', function() {
                    this.focus();
                });
            }
            
            const compLabel = document.createElement('div');
            compLabel.className = 'comp-label';
            if (currentDimension <= 3) {
                const labels = ['x', 'y', 'z'];
                compLabel.textContent = labels[compIndex] || `c${compIndex + 1}`;
            } else {
                compLabel.textContent = `c${compIndex + 1}`;
            }
            
            componentGroup.appendChild(compInput);
            componentGroup.appendChild(compLabel);
            components.appendChild(componentGroup);
        });
        
        vectorElement.appendChild(label);
        vectorElement.appendChild(components);
        vectorInputsContainer.appendChild(vectorElement);
    });
    
    // Scroll to bottom when adding new vectors
    vectorInputsContainer.scrollTop = vectorInputsContainer.scrollHeight;
}

function updateVectorControls() {
    removeVectorBtn.disabled = vectors.length <= 2;
    addVectorBtn.disabled = vectors.length >= 10;
}

function updateVectorCount() {
    vectorCountSpan.textContent = vectors.length;
}

// ===== Analysis Functions =====
function analyzeVectors() {
    // Close mobile menu if open
    if (hamburger && hamburger.classList.contains('active')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Validate vectors
    if (!validateVectors()) {
        return;
    }
    
    // Show loading state
    showLoadingState();
    
    // Small delay to show loading and prevent UI freeze
    setTimeout(() => {
        try {
            // Perform linear algebra calculations
            const results = calculateLinearAlgebraResults();
            
            // Display mathematical results
            displayMathematicalResults(results);
            
            // Draw graphical representation only for 2D and 3D
            if (currentDimension <= 3) {
                drawGraph();
            }
            
            // Show success alert
            const status = results.isLinearlyIndependent ? 'independent' : 'dependent';
            showAlert('success', 'Analysis Complete', 
                `${vectors.length} vectors in ${currentDimension}D are linearly ${status}. Rank: ${results.rank}/${vectors.length}`);
            
            // Scroll to results on mobile
            if (isMobile) {
                mathResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } catch (error) {
            // Show error alert
            showAlert('error', 'Analysis Failed', 'An error occurred during analysis. Please check your input vectors.');
            console.error('Analysis error:', error);
            
            // Reset results display
            clearResults();
        }
    }, 50);
}

function validateVectors() {
    // Check if all vectors are zero vectors
    const allZero = vectors.every(vector => 
        vector.every(component => Math.abs(component) < 1e-10)
    );
    
    if (allZero) {
        showAlert('warning', 'Invalid Input', 'Please enter at least one non-zero vector');
        return false;
    }
    
    // Check for NaN or invalid values
    for (let i = 0; i < vectors.length; i++) {
        for (let j = 0; j < vectors[i].length; j++) {
            if (isNaN(vectors[i][j])) {
                showAlert('error', 'Invalid Input', `Vector ${i+1}, component ${j+1} is not a valid number`);
                return false;
            }
        }
    }
    
    return true;
}

function showLoadingState() {
    const loadingHTML = `
        <div class="placeholder-content">
            <div class="spinner"></div>
            <p>Analyzing vectors...</p>
            <p class="dimension-note">Processing ${vectors.length} vectors in ${currentDimension}D space</p>
        </div>
    `;
    
    mathResults.innerHTML = loadingHTML;
}

function calculateLinearAlgebraResults() {
    const results = {
        vectors: vectors.map(v => [...v]),
        dimension: currentDimension,
        rank: 0,
        isLinearlyIndependent: false,
        determinant: null,
        rrefMatrix: [],
        dependencyRelation: null,
        basisVectors: []
    };
    
    // Calculate rank using Gaussian elimination
    results.rank = calculateRank(vectors);
    
    // Determine linear dependency
    results.isLinearlyIndependent = results.rank === vectors.length;
    
    // Calculate determinant for square matrices (when number of vectors equals dimension)
    if (vectors.length === currentDimension) {
        results.determinant = calculateDeterminant(vectors);
    }
    
    // Calculate RREF
    results.rrefMatrix = calculateRREF(vectors);
    
    // Find basis vectors (pivot columns)
    results.basisVectors = findBasisVectors(vectors);
    
    // Find dependency relation if dependent
    if (!results.isLinearlyIndependent) {
        results.dependencyRelation = findDependencyRelation(vectors);
    }
    
    return results;
}

function calculateRank(matrix) {
    // Create a copy to avoid modifying original
    const A = matrix.map(row => [...row]);
    const m = A.length; // number of vectors
    const n = A[0].length; // dimension
    
    let rank = 0;
    
    for (let col = 0; col < n && rank < m; col++) {
        // Find pivot
        let pivotRow = -1;
        for (let row = rank; row < m; row++) {
            if (Math.abs(A[row][col]) > 1e-10) {
                pivotRow = row;
                break;
            }
        }
        
        if (pivotRow === -1) continue;
        
        // Swap rows
        [A[rank], A[pivotRow]] = [A[pivotRow], A[rank]];
        
        // Normalize pivot row
        const pivot = A[rank][col];
        for (let j = col; j < n; j++) {
            A[rank][j] /= pivot;
        }
        
        // Eliminate other rows
        for (let row = 0; row < m; row++) {
            if (row !== rank && Math.abs(A[row][col]) > 1e-10) {
                const factor = A[row][col];
                for (let j = col; j < n; j++) {
                    A[row][j] -= factor * A[rank][j];
                }
            }
        }
        
        rank++;
    }
    
    return rank;
}

function calculateDeterminant(matrix) {
    // Only for square matrices
    const n = matrix.length;
    
    // Create a copy
    const A = matrix.map(row => [...row]);
    let det = 1;
    
    for (let i = 0; i < n; i++) {
        // Find pivot
        let pivotRow = i;
        for (let row = i + 1; row < n; row++) {
            if (Math.abs(A[row][i]) > Math.abs(A[pivotRow][i])) {
                pivotRow = row;
            }
        }
        
        // If pivot is zero, determinant is zero
        if (Math.abs(A[pivotRow][i]) < 1e-10) {
            return 0;
        }
        
        // Swap rows if necessary
        if (pivotRow !== i) {
            [A[i], A[pivotRow]] = [A[pivotRow], A[i]];
            det *= -1; // Row swap changes sign of determinant
        }
        
        // Multiply determinant by pivot
        det *= A[i][i];
        
        // Eliminate below
        for (let row = i + 1; row < n; row++) {
            const factor = A[row][i] / A[i][i];
            for (let col = i; col < n; col++) {
                A[row][col] -= factor * A[i][col];
            }
        }
    }
    
    return det;
}

function calculateRREF(matrix) {
    // Create a copy
    const A = matrix.map(row => [...row]);
    const m = A.length;
    const n = A[0].length;
    
    let lead = 0;
    for (let r = 0; r < m; r++) {
        if (lead >= n) break;
        
        let i = r;
        while (Math.abs(A[i][lead]) < 1e-10) {
            i++;
            if (i === m) {
                i = r;
                lead++;
                if (lead === n) return A;
            }
        }
        
        // Swap rows
        [A[r], A[i]] = [A[i], A[r]];
        
        // Normalize row
        const val = A[r][lead];
        for (let j = 0; j < n; j++) {
            A[r][j] /= val;
        }
        
        // Eliminate other rows
        for (let i = 0; i < m; i++) {
            if (i !== r) {
                const val = A[i][lead];
                for (let j = 0; j < n; j++) {
                    A[i][j] -= val * A[r][j];
                }
            }
        }
        
        lead++;
    }
    
    return A;
}

function findBasisVectors(matrix) {
    const rank = calculateRank(matrix);
    const basis = [];
    
    if (rank === 0) return basis;
    
    // Find pivot columns in RREF
    const rref = calculateRREF(matrix);
    
    for (let col = 0; col < matrix[0].length && basis.length < rank; col++) {
        for (let row = 0; row < matrix.length; row++) {
            if (Math.abs(rref[row][col] - 1) < 1e-10) {
                // Check if this is a pivot (1 in RREF and zeros in other rows)
                let isPivot = true;
                for (let r = 0; r < matrix.length; r++) {
                    if (r !== row && Math.abs(rref[r][col]) > 1e-10) {
                        isPivot = false;
                        break;
                    }
                }
                
                if (isPivot) {
                    basis.push(matrix[row]);
                    break;
                }
            }
        }
    }
    
    return basis;
}

function findDependencyRelation(matrix) {
    const rank = calculateRank(matrix);
    
    if (rank === matrix.length) {
        return "Vectors are linearly independent (no dependency relation).";
    }
    
    const dependentCount = matrix.length - rank;
    
    if (dependentCount === 1) {
        return `There is 1 linearly dependent vector that can be expressed as a linear combination of the other ${rank} vectors.`;
    } else {
        return `There are ${dependentCount} linearly dependent vectors that can be expressed as linear combinations of the other ${rank} vectors.`;
    }
}

function displayMathematicalResults(results) {
    let html = `
        <div class="result-item">
            <div class="result-title"><i class="fas fa-cube"></i> Dimension</div>
            <div class="result-value">${results.dimension}D</div>
            <p>Analysis in ℝ<sup>${results.dimension}</sup> space</p>
        </div>
        
        <div class="result-item">
            <div class="result-title"><i class="fas fa-layer-group"></i> Rank of Matrix</div>
            <div class="result-value">${results.rank} / ${vectors.length}</div>
            <p>The maximum number of linearly independent vectors in the set.</p>
        </div>
        
        <div class="result-item">
            <div class="result-title"><i class="fas fa-link"></i> Linear Dependency</div>
            <div class="result-value ${results.isLinearlyIndependent ? 'independent' : 'dependent'}">
                ${results.isLinearlyIndependent ? 'LINEARLY INDEPENDENT' : 'LINEARLY DEPENDENT'}
            </div>
            <p>${results.isLinearlyIndependent ? 
                'No vector in the set can be written as a linear combination of the others.' : 
                'At least one vector in the set can be written as a linear combination of the others.'}</p>
        </div>
    `;
    
    // Add determinant if available (square matrix)
    if (results.determinant !== null) {
        html += `
            <div class="result-item">
                <div class="result-title"><i class="fas fa-divide"></i> Determinant</div>
                <div class="result-value">${results.determinant.toFixed(6)}</div>
                <p>${Math.abs(results.determinant) < 1e-10 ? 
                    'Zero determinant indicates linear dependency.' : 
                    'Non-zero determinant indicates linear independence.'}</p>
            </div>
        `;
    }
    
    // Add basis vectors if available
    if (results.basisVectors.length > 0) {
        html += `
            <div class="result-item">
                <div class="result-title"><i class="fas fa-vector-square"></i> Basis Vectors (${results.basisVectors.length} found)</div>
                <div class="matrix-display">
        `;
        
        results.basisVectors.forEach((vector, idx) => {
            html += `<div class="matrix-row">`;
            html += `<div class="matrix-cell" style="min-width: 80px; background-color: #f8f9fa; border-right: none;">Basis ${idx + 1}:</div>`;
            vector.forEach(component => {
                html += `<div class="matrix-cell">${component.toFixed(2)}</div>`;
            });
            html += `</div>`;
        });
        
        html += `
                </div>
                <p>These vectors form a basis for the subspace spanned by the input vectors.</p>
            </div>
        `;
    }
    
    // Add RREF matrix
    html += `
        <div class="result-item">
            <div class="result-title"><i class="fas fa-th"></i> Reduced Row Echelon Form (RREF)</div>
            <div class="matrix-display">
    `;
    
    results.rrefMatrix.forEach(row => {
        html += `<div class="matrix-row">`;
        row.forEach(cell => {
            html += `<div class="matrix-cell">${cell.toFixed(2)}</div>`;
        });
        html += `</div>`;
    });
    
    html += `
            </div>
            <p>Pivot columns (with leading 1's) correspond to linearly independent vectors.</p>
        </div>
    `;
    
    // Add dimension info for higher dimensions
    if (currentDimension > 3) {
        html += `
            <div class="dimension-info">
                <h4><i class="fas fa-info-circle"></i> Higher Dimension Note</h4>
                <p>For ${currentDimension}D vectors, graphical representation is not available. The analysis is performed mathematically using rank, determinant, and RREF methods.</p>
                <p>Maximum possible rank in ℝ<sup>${currentDimension}</sup> is ${currentDimension}.</p>
            </div>
        `;
    }
    
    // Add dependency relation if dependent
    if (results.dependencyRelation) {
        html += `
            <div class="result-item">
                <div class="result-title"><i class="fas fa-project-diagram"></i> Dependency Relation</div>
                <p>${results.dependencyRelation}</p>
            </div>
        `;
    }
    
    mathResults.innerHTML = html;
}

function clearResults() {
    mathResults.innerHTML = `
        <div class="placeholder-content">
            <i class="fas fa-calculator"></i>
            <p>Enter vectors and click "Analyze Vectors" to see mathematical results</p>
        </div>
    `;
    
    if (currentDimension <= 3) {
        graphPlaceholder.style.display = 'flex';
        graphCanvas.style.display = 'none';
        
        // Clear canvas
        const ctx = graphCanvas.getContext('2d');
        ctx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
    }
}

// ===== Graph Functions (Only for 2D and 3D) =====
function drawGraph() {
    if (currentDimension > 3) return;
    
    const ctx = graphCanvas.getContext('2d');
    const width = graphCanvas.width;
    const height = graphCanvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Show canvas, hide placeholder
    graphPlaceholder.style.display = 'none';
    graphCanvas.style.display = 'block';
    
    // Draw based on dimension
    if (currentDimension === 2) {
        draw2DGraph(ctx, width, height);
    } else if (currentDimension === 3) {
        draw3DGraph(ctx, width, height);
    }
}

function draw2DGraph(ctx, width, height) {
    const padding = 50;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;
    
    // Draw coordinate system
    ctx.strokeStyle = 'rgba(44, 62, 80, 0.3)';
    ctx.lineWidth = 1;
    
    // X axis
    ctx.beginPath();
    ctx.moveTo(padding, height / 2);
    ctx.lineTo(width - padding, height / 2);
    ctx.stroke();
    
    // Y axis
    ctx.beginPath();
    ctx.moveTo(width / 2, padding);
    ctx.lineTo(width / 2, height - padding);
    ctx.stroke();
    
    // Axis labels
    ctx.fillStyle = 'rgba(44, 62, 80, 0.7)';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('x', width - padding + 10, height / 2 - 5);
    ctx.fillText('y', width / 2 + 10, padding - 10);
    
    // Find max vector magnitude for scaling
    let maxMagnitude = 0;
    vectors.forEach(vector => {
        const magnitude = Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
        if (magnitude > maxMagnitude) maxMagnitude = magnitude;
    });
    
    const scale = maxMagnitude > 0 ? Math.min(graphWidth, graphHeight) / 2 / maxMagnitude * 0.8 : 1;
    
    // Draw vectors
    const colors = ['#2c3e50', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6'];
    
    vectors.forEach((vector, index) => {
        const x = vector[0] * scale;
        const y = -vector[1] * scale; // Invert y for canvas coordinate system
        
        const startX = width / 2;
        const startY = height / 2;
        const endX = startX + x;
        const endY = startY + y;
        
        // Draw vector line
        ctx.strokeStyle = colors[index % colors.length];
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Draw arrowhead
        drawArrowhead(ctx, startX, startY, endX, endY, 10, colors[index % colors.length]);
        
        // Draw vector label
        if (showLabels) {
            ctx.fillStyle = colors[index % colors.length];
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`v${index + 1}`, endX + 15, endY + 5);
        }
    });
    
    // Draw origin label
    ctx.fillStyle = 'rgba(44, 62, 80, 0.7)';
    ctx.font = '12px Arial';
    ctx.fillText('O', width / 2 - 10, height / 2 + 20);
}

function draw3DGraph(ctx, width, height) {
    const padding = 50;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Clear with a subtle gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(248, 249, 250, 0.5)');
    gradient.addColorStop(1, 'rgba(236, 240, 241, 0.5)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Convert rotation angles to radians
    const radX = graphRotation.x * Math.PI / 180;
    const radY = graphRotation.y * Math.PI / 180;
    const radZ = graphRotation.z * Math.PI / 180;
    
    // Rotation matrices
    const rotX = [
        [1, 0, 0],
        [0, Math.cos(radX), -Math.sin(radX)],
        [0, Math.sin(radX), Math.cos(radX)]
    ];
    
    const rotY = [
        [Math.cos(radY), 0, Math.sin(radY)],
        [0, 1, 0],
        [-Math.sin(radY), 0, Math.cos(radY)]
    ];
    
    const rotZ = [
        [Math.cos(radZ), -Math.sin(radZ), 0],
        [Math.sin(radZ), Math.cos(radZ), 0],
        [0, 0, 1]
    ];
    
    // Combine rotations (Z * Y * X)
    const multiplyMatrices = (a, b) => {
        const result = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < 3; k++) {
                    result[i][j] += a[i][k] * b[k][j];
                }
            }
        }
        return result;
    };
    
    const rotation = multiplyMatrices(multiplyMatrices(rotZ, rotY), rotX);
    
    // Find max vector magnitude for scaling
    let maxMagnitude = 0;
    vectors.forEach(vector => {
        const magnitude = Math.sqrt(vector[0] ** 2 + vector[1] ** 2 + vector[2] ** 2);
        if (magnitude > maxMagnitude) maxMagnitude = magnitude;
    });
    
    const scale = maxMagnitude > 0 ? Math.min(width, height) / 3 / maxMagnitude * 0.8 : 1;
    
    // Project 3D point to 2D with perspective
    const project = (x, y, z) => {
        // Apply rotation
        const rx = rotation[0][0] * x + rotation[0][1] * y + rotation[0][2] * z;
        const ry = rotation[1][0] * x + rotation[1][1] * y + rotation[1][2] * z;
        const rz = rotation[2][0] * x + rotation[2][1] * y + rotation[2][2] * z;
        
        // Apply perspective
        const distance = 5;
        const factor = distance / (distance + rz);
        const px = rx * factor * scale;
        const py = ry * factor * scale;
        
        return {
            x: centerX + px,
            y: centerY - py, // Invert y for canvas coordinate system
            depth: rz
        };
    };
    
    // Draw coordinate axes
    const axes = [
        { start: [0, 0, 0], end: [2, 0, 0], color: '#e74c3c', label: 'x' },
        { start: [0, 0, 0], end: [0, 2, 0], color: '#2ecc71', label: 'y' },
        { start: [0, 0, 0], end: [0, 0, 2], color: '#3498db', label: 'z' }
    ];
    
    axes.forEach(axis => {
        const start = project(...axis.start);
        const end = project(...axis.end);
        
        // Draw axis line
        ctx.strokeStyle = axis.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        
        // Draw axis label
        if (showLabels) {
            ctx.fillStyle = axis.color;
            ctx.font = 'bold 16px Arial';
            ctx.fillText(axis.label, end.x + 10, end.y + 10);
        }
    });
    
    // Draw vectors
    const colors = ['#2c3e50', '#e67e22', '#9b59b6', '#1abc9c'];
    
    vectors.forEach((vector, index) => {
        const start = project(0, 0, 0);
        const end = project(vector[0], vector[1], vector[2]);
        
        // Draw vector line
        ctx.strokeStyle = colors[index % colors.length];
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        
        // Draw arrowhead
        drawArrowhead(ctx, start.x, start.y, end.x, end.y, 10, colors[index % colors.length]);
        
        // Draw vector label
        if (showLabels) {
            ctx.fillStyle = colors[index % colors.length];
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`v${index + 1}`, end.x + 15, end.y + 5);
        }
    });
    
    // Draw origin label
    ctx.fillStyle = 'rgba(44, 62, 80, 0.7)';
    ctx.font = '12px Arial';
    ctx.fillText('O', centerX - 15, centerY + 20);
}

function drawArrowhead(ctx, fromX, fromY, toX, toY, size, color) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
        toX - size * Math.cos(angle - Math.PI / 6),
        toY - size * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        toX - size * Math.cos(angle + Math.PI / 6),
        toY - size * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
}

function drawGraphPlaceholder() {
    const ctx = graphCanvas.getContext('2d');
    const width = graphCanvas.width;
    const height = graphCanvas.height;
    
    // Draw a simple coordinate system in the placeholder
    ctx.strokeStyle = 'rgba(44, 62, 80, 0.1)';
    ctx.lineWidth = 1;
    
    // Draw grid
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function toggleRotation() {
    if (currentDimension !== 3) {
        showAlert('warning', 'Rotation Not Available', '3D rotation is only available for 3D vectors');
        return;
    }
    
    isRotating = !isRotating;
    const icon = rotateBtn.querySelector('i');
    
    if (isRotating) {
        icon.classList.remove('fa-sync-alt');
        icon.classList.add('fa-pause');
        startRotation();
        showAlert('info', '3D Rotation Started', 'The 3D graph is now rotating automatically');
    } else {
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-sync-alt');
        showAlert('info', '3D Rotation Stopped', 'The 3D graph rotation has been stopped');
    }
}

function startRotation() {
    if (!isRotating || currentDimension !== 3) return;
    
    graphRotation.y += 1;
    if (graphRotation.y >= 360) graphRotation.y = 0;
    
    drawGraph();
    
    if (isRotating) {
        requestAnimationFrame(() => {
            setTimeout(startRotation, 50);
        });
    }
}

function toggleLabels() {
    showLabels = !showLabels;
    toggleLabelsBtn.classList.toggle('active', showLabels);
    
    if (currentDimension <= 3 && graphCanvas.style.display !== 'none') {
        drawGraph();
        showAlert('info', 'Labels Toggled', `Vector labels are now ${showLabels ? 'visible' : 'hidden'}`);
    }
}

// ===== Utility Functions =====
function generateRandomVectors() {
    vectors = vectors.map(() => {
        const vector = Array(currentDimension);
        
        for (let i = 0; i < currentDimension; i++) {
            // Generate random number between -3 and 3
            vector[i] = (Math.random() * 6 - 3).toFixed(2);
        }
        
        return vector.map(x => parseFloat(x));
    });
    
    updateVectorInputs();
    clearResults();
    
    showAlert('success', 'Random Vectors Generated', `${vectors.length} random vectors created in ${currentDimension}D space`);
}

function loadExample(example) {
    let exampleName = '';
    
    switch(example) {
        case '2D-dependent':
            dimensionInput.value = 2;
            dimensionInput.dispatchEvent(new Event('change'));
            vectors = [[1, 2], [2, 4], [3, 6]]; // All multiples
            exampleName = '2D Dependent Vectors';
            break;
        case '2D-independent':
            dimensionInput.value = 2;
            dimensionInput.dispatchEvent(new Event('change'));
            vectors = [[1, 0], [0, 1], [1, 1]]; // Basis + combination
            exampleName = '2D Independent Vectors';
            break;
        case '3D-dependent':
            dimensionInput.value = 3;
            dimensionInput.dispatchEvent(new Event('change'));
            vectors = [[1, 2, 3], [2, 4, 6], [3, 6, 9]]; // All multiples
            exampleName = '3D Dependent Vectors';
            break;
        case '3D-independent':
            dimensionInput.value = 3;
            dimensionInput.dispatchEvent(new Event('change'));
            vectors = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; // Standard basis
            exampleName = '3D Independent Vectors';
            break;
        case '4D-dependent':
            dimensionInput.value = 4;
            dimensionInput.dispatchEvent(new Event('change'));
            vectors = [[1, 2, 3, 4], [2, 4, 6, 8], [3, 6, 9, 12]];
            exampleName = '4D Dependent Vectors';
            break;
        case '4D-independent':
            dimensionInput.value = 4;
            dimensionInput.dispatchEvent(new Event('change'));
            vectors = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
            exampleName = '4D Independent Vectors';
            break;
    }
    
    updateVectorInputs();
    updateVectorCount();
    updateVectorControls();
    clearResults();
    
    showAlert('success', 'Example Loaded', `${exampleName} loaded successfully`);
}

function exportResults() {
    if (!validateVectors()) {
        showAlert('error', 'Export Failed', 'Please enter valid vectors before exporting');
        return;
    }
    
    try {
        const results = calculateLinearAlgebraResults();
        let text = `Linear Algebra Vector Analysis - MathVortex Labs\n`;
        text += `Generated: ${new Date().toLocaleString()}\n\n`;
        text += `Dimension: ${results.dimension}D\n`;
        text += `Number of vectors: ${vectors.length}\n\n`;
        
        text += `Vectors:\n`;
        vectors.forEach((vector, index) => {
            text += `  v${index + 1} = (${vector.map(x => x.toFixed(4)).join(', ')})\n`;
        });
        
        text += `\nAnalysis Results:\n`;
        text += `  Rank: ${results.rank} of ${vectors.length}\n`;
        text += `  Linear Dependency: ${results.isLinearlyIndependent ? 'Independent' : 'Dependent'}\n`;
        
        if (results.determinant !== null) {
            text += `  Determinant: ${results.determinant.toFixed(6)}\n`;
        }
        
        text += `\nReduced Row Echelon Form:\n`;
        results.rrefMatrix.forEach(row => {
            text += `  [${row.map(val => val.toFixed(4)).join(', ')}]\n`;
        });
        
        if (results.dependencyRelation) {
            text += `\nDependency Relation:\n  ${results.dependencyRelation}\n`;
        }
        
        // Create and download file
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vector-analysis-${results.dimension}D-${new Date().getTime()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showAlert('success', 'Export Successful', 'Analysis results exported as text file');
    } catch (error) {
        showAlert('error', 'Export Failed', 'An error occurred during export');
        console.error('Export error:', error);
    }
}

function exportGraph() {
    if (currentDimension > 3) {
        showAlert('warning', 'Graph Export Not Available', 'Graphical export is only available for 2D and 3D vectors');
        return;
    }
    
    if (graphCanvas.style.display === 'none') {
        showAlert('warning', 'Graph Not Available', 'Please analyze vectors first to generate a graph');
        return;
    }
    
    try {
        const url = graphCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `vector-graph-${currentDimension}D-${new Date().getTime()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        showAlert('success', 'Graph Exported', 'Vector graph exported as PNG image');
    } catch (error) {
        showAlert('error', 'Export Failed', 'An error occurred while exporting the graph');
        console.error('Graph export error:', error);
    }
}

function exportGraphImage() {
    exportGraph(); // Same function as exportGraph
}

function copyResults() {
    if (!validateVectors()) {
        showAlert('error', 'Copy Failed', 'Please enter valid vectors first');
        return;
    }
    
    try {
        const results = calculateLinearAlgebraResults();
        let text = `Linear Algebra Vector Analysis\n`;
        text += `Dimension: ${results.dimension}D\n`;
        text += `Vectors: ${vectors.map((v, i) => `v${i+1}=(${v.map(x => x.toFixed(2)).join(',')})`).join(', ')}\n`;
        text += `Rank: ${results.rank}/${vectors.length}\n`;
        text += `Status: ${results.isLinearlyIndependent ? 'Independent' : 'Dependent'}\n`;
        
        if (results.determinant !== null) {
            text += `Determinant: ${results.determinant.toFixed(4)}\n`;
        }
        
        navigator.clipboard.writeText(text)
            .then(() => showAlert('success', 'Copied to Clipboard', 'Analysis results copied to clipboard'))
            .catch(err => {
                console.error('Could not copy text: ', err);
                showAlert('error', 'Copy Failed', 'Failed to copy results to clipboard');
            });
    } catch (error) {
        showAlert('error', 'Copy Failed', 'An error occurred while copying results');
        console.error('Copy error:', error);
    }
}

// Mobile-specific utility function
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    // Remove event listeners to prevent memory leaks
    window.removeEventListener('resize', handleResize);
});

// Initialize on page load
window.addEventListener('load', function() {
    // Final initialization
    updateCanvasSize();
});
