class CascadingSpindrift {
    constructor() {
        this.canvas = document.getElementById('spindriftCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.statusElement = document.getElementById('status');
        
        // Animation state
        this.isAnimating = true;
        this.animationId = null;
        
        // Shape configuration
        this.currentShape = 'square';
        this.numSides = 4;
        this.numLayers = 20; // Number of nested triangles
        this.baseSize = 1000; // Base size for all triangles (they'll be scaled down)
        this.minSize = 5; // Stop when triangles become too small
        
        // Color configuration - Homebrew terminal colors
        this.shapeColor = '#00ff00'; // Default shape color (bright green)
        this.backgroundColor = '#1a1a1a'; // Default background color (dark gray)
        
        // Random color mode
        this.randomColorMode = false;
        this.colorChangeSpeed = 5; // Frames between color changes
        this.colorChangeCounter = 0;
        this.colorPalette = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
            '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
            '#10ac84', '#ee5253', '#0abde3', '#ff6b6b', '#48dbfb',
            '#1dd1a1', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3'
        ];
        this.currentColorIndex = 0;
        
        // Smooth color transition properties
        this.transitionFrames = 60; // Number of frames for smooth transition
        this.transitionCounter = 0;
        this.isTransitioning = false;
        this.startShapeColor = '#00ff00';
        this.targetShapeColor = '#00ff00';
        this.startBgColor = '#1a1a1a';
        this.targetBgColor = '#1a1a1a';
        
        // Rotation parameters - cascading speeds
        this.baseRotationSpeed = 5.3; // Base rotation speed (degrees per frame)
        this.speedDecay = 0.97; // Each outer triangle rotates at 80% of inner triangle speed
        this.rotationSpeeds = []; // Array to store individual rotation speeds
        
        // Individual rotation states for each layer
        this.layerRotations = []; // Current rotation angle for each layer
        
        // Center point
        this.centerX = 0;
        this.centerY = 0;
        
        this.initializeRotations();
        this.setupCanvas();
        this.setupShapeSelector();
        this.startAnimation();
    }
    
    initializeRotations() {
        // Initialize rotation speeds and angles for each layer
        // Innermost triangle (layer 0) has the fastest rotation
        for (let layer = 0; layer < this.numLayers; layer++) {
            // Calculate rotation speed: fastest for innermost, progressively slower for outer
            const speed = this.baseRotationSpeed * Math.pow(this.speedDecay, this.numLayers - 1 - layer);
            this.rotationSpeeds.push(speed);
            
            // Initialize rotation angle for each layer
            this.layerRotations.push(0);
        }
    }
    
    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Add click listener to reverse rotation direction
        this.canvas.addEventListener('click', () => this.reverseRotation());
    }
    
    setupShapeSelector() {
        // Tab switching functionality
        const tabButtons = document.querySelectorAll('.tab-button');
        const sidesInput = document.getElementById('sidesInput');
        const currentShapeSpan = document.getElementById('currentShape');
        
        // Speed and decay controls
        const baseSpeedInput = document.getElementById('baseSpeedInput');
        const decayInput = document.getElementById('decayInput');
        
        // Color controls
        const shapeColorInput = document.getElementById('shapeColorInput');
        const bgColorInput = document.getElementById('bgColorInput');
        
        // Random color controls
        const randomColorModeButton = document.getElementById('randomColorMode');
        const colorChangeSpeedSlider = document.getElementById('colorChangeSpeed');
        const speedValueSpan = document.getElementById('speedValue');
        
        // Tab button click handlers
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                tabButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
                
                // Get shape type and update
                const shapeType = button.dataset.shape;
                this.updateShape(shapeType);
            });
        });
        
        // Real-time change handlers (no more Apply buttons needed)
        sidesInput.addEventListener('input', () => {
            const sides = parseInt(sidesInput.value);
            if (sides >= 3 && sides <= 20) {
                this.numSides = sides;
                this.updateCurrentShapeDisplay();
            }
        });
        
        baseSpeedInput.addEventListener('input', () => {
            const speed = parseFloat(baseSpeedInput.value);
            if (speed >= 0.1 && speed <= 2000) {
                this.baseRotationSpeed = speed;
                this.updateRotationSpeeds();
            }
        });
        
        decayInput.addEventListener('input', () => {
            const decay = parseFloat(decayInput.value);
            if (decay >= 0.1 && decay <= 2000) {
                this.speedDecay = decay;
                this.updateRotationSpeeds();
            }
        });
        
        shapeColorInput.addEventListener('input', () => {
            this.shapeColor = shapeColorInput.value;
        });
        
        bgColorInput.addEventListener('input', () => {
            this.backgroundColor = bgColorInput.value;
            document.body.style.backgroundColor = this.backgroundColor;
        });
        
        // Random color mode button
        randomColorModeButton.addEventListener('click', () => {
            this.toggleRandomColorMode();
        });
        
        // Color change speed slider
        colorChangeSpeedSlider.addEventListener('input', () => {
            this.colorChangeSpeed = parseInt(colorChangeSpeedSlider.value);
            speedValueSpan.textContent = this.colorChangeSpeed;
        });
        
        // Initialize shape display
        this.updateCurrentShapeDisplay();
        
        // Set up menu toggle functionality
        this.setupMenuToggle();
        
        // Set default colors in the UI
        this.updateColorInputs();
    }
    
    setupMenuToggle() {
        const menuToggle = document.getElementById('menuToggle');
        const shapeSelector = document.getElementById('shapeSelector');
        
        menuToggle.addEventListener('click', () => {
            if (shapeSelector.classList.contains('hidden')) {
                shapeSelector.classList.remove('hidden');
                menuToggle.textContent = '✕';
            } else {
                shapeSelector.classList.add('hidden');
                menuToggle.textContent = '-_-';
            }
        });
    }
    
    updateColorInputs() {
        // Update color input fields with current values
        document.getElementById('shapeColorInput').value = this.shapeColor;
        document.getElementById('bgColorInput').value = this.backgroundColor;
        
        // Set body background color
        document.body.style.backgroundColor = this.backgroundColor;
    }
    
    // Helper function to convert hex color to RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    // Helper function to interpolate between two RGB colors
    interpolateColor(color1, color2, factor) {
        return {
            r: Math.round(color1.r + (color2.r - color1.r) * factor),
            g: Math.round(color1.g + (color2.g - color1.g) * factor),
            b: Math.round(color1.b + (color2.b - color1.b) * factor)
        };
    }
    
    // Helper function to convert RGB to hex
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
    
    // Helper function to get current interpolated color
    getCurrentInterpolatedColor(startColor, targetColor, progress) {
        const startRgb = this.hexToRgb(startColor);
        const targetRgb = this.hexToRgb(targetColor);
        
        if (!startRgb || !targetRgb) return startColor;
        
        const interpolated = this.interpolateColor(startRgb, targetRgb, progress);
        return this.rgbToHex(interpolated.r, interpolated.g, interpolated.b);
    }
    
    toggleRandomColorMode() {
        this.randomColorMode = !this.randomColorMode;
        const button = document.getElementById('randomColorMode');
        
        if (this.randomColorMode) {
            button.textContent = 'Random Color Mode: ON';
            button.classList.add('active');
            // Start smooth transition to first random colors
            this.startSmoothTransition();
        } else {
            button.textContent = 'Random Color Mode: OFF';
            button.classList.remove('active');
            // Start smooth transition back to default colors
            this.startSmoothTransitionToDefaults();
        }
    }
    
    startSmoothTransition() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        this.transitionCounter = 0;
        
        // Set start colors to current colors
        this.startShapeColor = this.shapeColor;
        this.startBgColor = this.backgroundColor;
        
        // Set target colors to next palette colors
        this.targetShapeColor = this.colorPalette[this.currentColorIndex];
        const bgColorIndex = (this.currentColorIndex + 10) % this.colorPalette.length;
        this.targetBgColor = this.colorPalette[bgColorIndex];
    }
    
    startSmoothTransitionToDefaults() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        this.transitionCounter = 0;
        
        // Set start colors to current colors
        this.startShapeColor = this.shapeColor;
        this.startBgColor = this.backgroundColor;
        
        // Set target colors to defaults
        this.targetShapeColor = '#00ff00';
        this.targetBgColor = '#1a1a1a';
    }
    
    updateRandomColors() {
        if (!this.randomColorMode || this.isTransitioning) return;
        
        // Start smooth transition to next colors
        this.startSmoothTransition();
        
        // Move to next color index for next transition
        this.currentColorIndex = (this.currentColorIndex + 1) % this.colorPalette.length;
    }
    
    updateShape(shapeType) {
        this.currentShape = shapeType;
        
        // Set number of sides based on shape type
        switch (shapeType) {
            case 'triangle':
                this.numSides = 3;
                break;
            case 'square':
                this.numSides = 4;
                break;
            case 'pentagon':
                this.numSides = 5;
                break;
            case 'hexagon':
                this.numSides = 6;
                break;
            case 'custom':
                // Keep current numSides for custom
                break;
        }
        
        // Update input field and display
        document.getElementById('sidesInput').value = this.numSides;
        this.updateCurrentShapeDisplay();
    }
    
    updateCurrentShapeDisplay() {
        const currentShapeSpan = document.getElementById('currentShape');
        const shapeNames = {
            3: 'Triangle',
            4: 'Square',
            5: 'Pentagon',
            6: 'Hexagon'
        };
        
        const shapeName = shapeNames[this.numSides] || `${this.numSides}-gon`;
        currentShapeSpan.textContent = `${shapeName} (${this.numSides} sides)`;
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Center the triangles
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }
    
    startAnimation() {
        this.animate();
    }
    
    animate() {
        if (!this.isAnimating) return;
        
        // Handle smooth color transitions
        if (this.isTransitioning) {
            this.transitionCounter++;
            const progress = this.transitionCounter / this.transitionFrames;
            
            if (progress >= 1) {
                // Transition complete
                this.isTransitioning = false;
                this.shapeColor = this.targetShapeColor;
                this.backgroundColor = this.targetBgColor;
                document.body.style.backgroundColor = this.backgroundColor;
                
                // Update color inputs
                document.getElementById('shapeColorInput').value = this.shapeColor;
                document.getElementById('bgColorInput').value = this.backgroundColor;
                
                // If random mode is on, schedule next transition
                if (this.randomColorMode) {
                    this.colorChangeCounter++;
                    if (this.colorChangeCounter >= this.colorChangeSpeed) {
                        this.updateRandomColors();
                        this.colorChangeCounter = 0;
                    }
                }
            } else {
                // Update colors during transition
                this.shapeColor = this.getCurrentInterpolatedColor(this.startShapeColor, this.targetShapeColor, progress);
                this.backgroundColor = this.getCurrentInterpolatedColor(this.startBgColor, this.targetBgColor, progress);
                document.body.style.backgroundColor = this.backgroundColor;
            }
        } else if (this.randomColorMode) {
            // Normal random color mode (when not transitioning)
            this.colorChangeCounter++;
            if (this.colorChangeCounter >= this.colorChangeSpeed) {
                this.updateRandomColors();
                this.colorChangeCounter = 0;
            }
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw all nested triangles
        this.drawNestedPolygons();
        
        // Update rotation for each layer
        this.updateRotations();
        
        // Continue animation
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    drawNestedPolygons() {
        // Draw polygons from largest to smallest (outer to inner)
        for (let layer = 0; layer < this.numLayers; layer++) {
            // Calculate size: each inner polygon is scaled down to fit inside the outer one
            // For regular polygons, the scaling factor is approximately 0.9
            const size = this.baseSize * Math.pow(0.9, layer);
            
            // Stop if polygon becomes too small
            if (size < this.minSize) break;
            
            // Calculate opacity based on layer (outer polygons more visible)
            //const opacity = Math.max(0.15, 1 - (layer * 0.12));
            const opacity = 1;
            
            // Draw the polygon for this layer with its individual rotation
            this.drawPolygonLayer(size, opacity, this.layerRotations[layer]);
        }
    }
    
    drawPolygonLayer(size, opacity, rotation) {
        this.ctx.save();
        
        // Set drawing style - thin, outlined shapes with custom color
        this.ctx.strokeStyle = `${this.shapeColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = 'transparent'; // No fill, only outline
        
        // Move to center and apply this layer's rotation
        this.ctx.translate(this.centerX, this.centerY);
        this.ctx.rotate(rotation * Math.PI / 180);
        
        // Draw polygon with specified number of sides
        this.drawPolygon(size, this.numSides);
        
        this.ctx.restore();
    }
    
    drawPolygon(size, sides) {
        this.ctx.beginPath();
        
        // Calculate angle between vertices
        const angleStep = (2 * Math.PI) / sides;
        
        // Start from the top vertex
        const startAngle = -Math.PI / 2; // Start from top
        
        // Draw the polygon
        for (let i = 0; i <= sides; i++) {
            const angle = startAngle + (i * angleStep);
            const x = Math.cos(angle) * size / 2;
            const y = Math.sin(angle) * size / 2;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        // Stroke the polygon outline
        this.ctx.stroke();
    }
    
    updateRotations() {
        // Update rotation for each layer at different speeds
        for (let layer = 0; layer < this.numLayers; layer++) {
            this.layerRotations[layer] += this.rotationSpeeds[layer];
            
            // Keep rotation angles manageable (optional)
            if (this.layerRotations[layer] > 360) {
                this.layerRotations[layer] -= 360;
            }
        }
    }
    
    stopAnimation() {
        this.isAnimating = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    resumeAnimation() {
        if (!this.isAnimating) {
            this.isAnimating = true;
            this.startAnimation();
        }
    }
    
    reset() {
        this.stopAnimation();
        
        // Reset all rotation angles
        for (let layer = 0; layer < this.numLayers; layer++) {
            this.layerRotations[layer] = 0;
        }
        
        // Restart animation
        this.resumeAnimation();
    }

    reverseRotation() {
        // Reverse all rotation speeds (make them negative)
        for (let layer = 0; layer < this.rotationSpeeds.length; layer++) {
            this.rotationSpeeds[layer] = -this.rotationSpeeds[layer];
        }
    }

    updateRotationSpeeds() {
        // Clear existing rotation speeds
        this.rotationSpeeds = [];
        
        // Recalculate rotation speeds for each layer with new parameters
        for (let layer = 0; layer < this.numLayers; layer++) {
            // Calculate rotation speed: fastest for innermost, progressively slower for outer
            const speed = this.baseRotationSpeed * Math.pow(this.speedDecay, this.numLayers - 1 - layer);
            this.rotationSpeeds.push(speed);
        }
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const spindrift = new CascadingSpindrift();
    
    // Add keyboard shortcuts for testing
    document.addEventListener('keydown', (event) => {
        if (event.key === 'r' || event.key === 'R') {
            spindrift.reset();
        } else if (event.key === 'Escape') {
            if (spindrift.isAnimating) {
                spindrift.stopAnimation();
                spindrift.statusElement.textContent = 'Animation Paused - Press ESC to resume';
            } else {
                spindrift.resumeAnimation();
            }
        }
    });
}); 
