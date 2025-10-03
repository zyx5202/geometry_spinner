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
        
        // RGB cycling system
        this.rgbValues = [0, 255]; // Only 0 and 255 values
        this.currentRgb = { r: 0, g: 0, b: 255 }; // Start with blue
        this.rgbDirection = { r: 1, g: 1, b: -1 }; // Direction for each channel (1 = increasing, -1 = decreasing)
        this.rgbStep = 255; // Step size for RGB changes
        this.currentChannel = 0; // 0 = r, 1 = g, 2 = b
        
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
        
        // Performance monitoring
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        // Mobile optimizations
        if (this.isMobile) {
            this.numLayers = Math.min(this.numLayers, 12); // Reduce layers on mobile for better performance
            this.baseRotationSpeed *= 2.0; // Increase speed on mobile to compensate for lower FPS
            console.log('Mobile device detected - applying optimizations');
        }
        
        // Individual rotation states for each layer
        this.layerRotations = []; // Current rotation angle for each layer
        
        // Speed lock functionality
        this.isSpeedLocked = false;
        this.lockedRotationSpeeds = []; // Store speeds when locked
        
        // Center point
        this.centerX = 0;
        this.centerY = 0;
        
        this.initializeRotations();
        this.setupCanvas();
        this.setupShapeSelector();
        this.startAnimation();
    }
    
    initializeRotations() {
        // Clear existing arrays
        this.rotationSpeeds = [];
        this.layerRotations = [];
        
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
        
        // Layer and size controls
        const numLayersInput = document.getElementById('numLayersInput');
        const layersValueSpan = document.getElementById('layersValue');
        const baseSizeInput = document.getElementById('baseSizeInput');
        const sizeValueSpan = document.getElementById('sizeValue');
        
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
            if (speed >= 0.1 && speed <= 20000) {
                this.baseRotationSpeed = speed;
                
                if (this.isSpeedLocked) {
                    // Update locked speeds with new base speed
                    this.lockedRotationSpeeds = new Array(this.numLayers).fill(speed);
                } else {
                    this.updateRotationSpeeds();
                }
            }
        });
        
        decayInput.addEventListener('input', () => {
            const decay = parseFloat(decayInput.value);
            if (decay >= 0.1 && decay <= 20000) {
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
        
        // Number of layers slider
        numLayersInput.addEventListener('input', () => {
            const layers = parseInt(numLayersInput.value);
            if (layers >= 5 && layers <= 50) {
                this.numLayers = layers;
                layersValueSpan.textContent = layers;
                
                // If speed is locked, unlock it first to prevent duplication
                if (this.isSpeedLocked) {
                    this.isSpeedLocked = false;
                    this.lockedRotationSpeeds = [];
                    if (this.statusElement) {
                        this.statusElement.textContent = 'Speed Lock: OFF - Press SPACE to lock speed';
                    }
                }
                
                this.initializeRotations();
            }
        });
        
        // Base size slider
        baseSizeInput.addEventListener('input', () => {
            const size = parseInt(baseSizeInput.value);
            if (size >= 200 && size <= 2000) {
                this.baseSize = size;
                sizeValueSpan.textContent = size;
            }
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
    
    // Update RGB color by cycling through combinations
    updateRgbColor() {
        const channels = ['r', 'g', 'b'];
        let attempts = 0;
        const maxAttempts = 10; // Prevent infinite loops
        
        do {
            const currentChannelName = channels[this.currentChannel];
            
            // Move current channel in its direction
            this.currentRgb[currentChannelName] += this.rgbDirection[currentChannelName] * this.rgbStep;
            
            // Clamp to valid values
            this.currentRgb[currentChannelName] = Math.max(0, Math.min(255, this.currentRgb[currentChannelName]));
            
            // If we hit a boundary, switch to next channel
            if (this.currentRgb[currentChannelName] === 0 || this.currentRgb[currentChannelName] === 255) {
                // Reverse direction for next time
                this.rgbDirection[currentChannelName] *= -1;
                
                // Move to next channel
                this.currentChannel = (this.currentChannel + 1) % 3;
            }
            
            attempts++;
        } while (this.currentRgb.r === 0 && this.currentRgb.g === 0 && this.currentRgb.b === 0 && attempts < maxAttempts);
        
        // If we somehow still have black after max attempts, force a non-black color
        if (this.currentRgb.r === 0 && this.currentRgb.g === 0 && this.currentRgb.b === 0) {
            this.currentRgb.r = 255; // Force red
        }
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
        
        // Generate next RGB color
        this.updateRgbColor();
        this.targetShapeColor = this.rgbToHex(this.currentRgb.r, this.currentRgb.g, this.currentRgb.b);
        
        // Keep background color unchanged
        this.targetBgColor = this.backgroundColor;
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
        
        // Mobile-specific canvas optimizations
        if (this.isMobile) {
            // Enable hardware acceleration hints
            this.canvas.style.transform = 'translateZ(0)';
            this.canvas.style.willChange = 'transform';
            
            // Reduce canvas resolution on mobile for better performance
            const devicePixelRatio = window.devicePixelRatio || 1;
            if (devicePixelRatio > 1) {
                this.canvas.width = window.innerWidth * devicePixelRatio;
                this.canvas.height = window.innerHeight * devicePixelRatio;
                this.canvas.style.width = window.innerWidth + 'px';
                this.canvas.style.height = window.innerHeight + 'px';
                this.ctx.scale(devicePixelRatio, devicePixelRatio);
            }
        }
    }
    
    startAnimation() {
        this.animate();
    }
    
    animate() {
        if (!this.isAnimating) return;
        
        // Performance monitoring
        this.frameCount++;
        const currentTime = performance.now();
        if (currentTime - this.lastTime >= 1000) { // Every second
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // Log performance info to console
            console.log(`FPS: ${this.fps}, Mobile: ${this.isMobile}, Layers: ${this.numLayers}`);
            
            // Update status with FPS info
            if (this.statusElement) {
                this.statusElement.textContent = `new tab - FPS: ${this.fps}`;
            }
        }
        
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
            // Use locked speeds if speed is locked, otherwise use current speeds
            const speed = this.isSpeedLocked ? this.lockedRotationSpeeds[layer] : this.rotationSpeeds[layer];
            this.layerRotations[layer] += speed;
            
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
        // Don't reverse if speed is locked
        if (this.isSpeedLocked) return;
        
        // Reverse all rotation speeds (make them negative)
        for (let layer = 0; layer < this.rotationSpeeds.length; layer++) {
            this.rotationSpeeds[layer] = -this.rotationSpeeds[layer];
        }
    }

    updateRotationSpeeds() {
        // Don't update speeds if they are locked
        if (this.isSpeedLocked) return;
        
        // Clear existing rotation speeds
        this.rotationSpeeds = [];
        
        // Recalculate rotation speeds for each layer with new parameters
        for (let layer = 0; layer < this.numLayers; layer++) {
            // Calculate rotation speed: fastest for innermost, progressively slower for outer
            const speed = this.baseRotationSpeed * Math.pow(this.speedDecay, this.numLayers - 1 - layer);
            this.rotationSpeeds.push(speed);
        }
    }

    toggleSpeedLock() {
        if (this.isSpeedLocked) {
            // Unlock: restore normal speed behavior
            this.isSpeedLocked = false;
            this.lockedRotationSpeeds = [];
            this.updateRotationSpeeds();
            if (this.statusElement) {
                this.statusElement.textContent = 'Speed Lock: OFF - Press SPACE to lock speed';
            }
        } else {
            // Lock: make all layers rotate at the same speed as the innermost layer
            this.isSpeedLocked = true;
            const innermostSpeed = this.rotationSpeeds[0]; // Innermost layer speed
            this.lockedRotationSpeeds = new Array(this.numLayers).fill(innermostSpeed);
            if (this.statusElement) {
                this.statusElement.textContent = 'Speed Lock: ON - All layers at innermost speed';
            }
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
        } else if (event.key === ' ') {
            event.preventDefault(); // Prevent page scroll
            spindrift.toggleSpeedLock();
        }
    });
}); 
