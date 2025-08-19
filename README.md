# Cascading Spindrift New Tab Extension

A lightweight and captivating Chrome extension that transforms your new tab page into a mesmerizing geometric dance. Watch as nested triangles of the same size spin at progressively slower rates, creating a beautiful cascading effect where the innermost triangle rotates the fastest and each outer triangle spins more slowly, like ripples in a pond.

## Features

### 🎨 **Minimalist Design**
- **Clean Interface**: Pure black background with subtle geometric elements
- **Thin Outlines**: Triangles drawn with thin, high-contrast lines
- **No Fill**: Only outlined shapes for a clean, modern aesthetic
- **Subtle Colors**: Light gray/off-white lines that stand out against the dark background

### 🔄 **Cascading Animation**
- **Progressive Speeds**: Innermost triangle spins fastest, outer triangles progressively slower
- **Smooth Motion**: Uses requestAnimationFrame for 60fps performance
- **Continuous Loop**: Never-ending animation that's captivating and hypnotic
- **Cascading Effect**: Creates a beautiful ripple-like motion pattern

### 🔺 **Nested Geometry**
- **Same Base Size**: All triangles start with the same base size (250px)
- **Perfect Nesting**: Each inner triangle scaled down to fit perfectly inside the outer one
- **Mathematical Precision**: Equilateral triangles with exact proportions
- **Visual Depth**: Opacity varies by layer for enhanced depth perception

### ⚡ **Performance Optimized**
- **2D Canvas Rendering**: Simple, efficient 2D graphics
- **Iterative Algorithm**: Non-recursive approach for optimal performance
- **Individual Rotation States**: Each layer maintains its own rotation angle
- **Resource Conscious**: Low CPU usage for continuous operation

### 🎮 **Interactive Controls**
- **R Key**: Reset the animation to starting position
- **Escape Key**: Pause/resume the animation
- **Responsive**: Automatically adapts to any screen size

## How It Works

### The Cascading Spindrift Algorithm
The extension uses an iterative drawing approach with progressive rotation speeds:

1. **Layer Generation**: Creates 7 nested triangles from largest to smallest
2. **Size Calculation**: Each inner triangle is scaled down by 0.5x to fit perfectly
3. **Progressive Speeds**: Rotation speed decreases by 30% for each outer layer
4. **Individual States**: Each layer maintains its own rotation angle and speed
5. **Cascading Effect**: Creates a beautiful ripple-like motion pattern

### Geometric Parameters
- **Number of Layers**: 7 nested triangles
- **Base Size**: 250 pixels (all triangles start at this size)
- **Scaling Factor**: 0.5x (each inner triangle is half the size)
- **Base Rotation Speed**: 2.0 degrees per frame (innermost triangle)
- **Speed Decay**: 0.7 (each outer triangle rotates at 70% of inner speed)
- **Minimum Size**: 8 pixels (stops when too small)

### Rotation Speed Cascade
- **Layer 0 (Innermost)**: 2.0°/frame (fastest)
- **Layer 1**: 1.4°/frame (70% of layer 0)
- **Layer 2**: 0.98°/frame (70% of layer 1)
- **Layer 3**: 0.686°/frame (70% of layer 2)
- **Layer 4**: 0.48°/frame (70% of layer 3)
- **Layer 5**: 0.336°/frame (70% of layer 4)
- **Layer 6 (Outermost)**: 0.235°/frame (slowest)

### Animation Loop
- **Frame Rate**: Synchronized with browser refresh rate (60fps)
- **Rotation Update**: Each layer rotates at its individual speed
- **Canvas Clearing**: Fresh drawing each frame for smooth motion
- **Endless Loop**: Continuous animation that never stops

## Installation

### Method 1: Load Unpacked Extension
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. Open a new tab to see the cascading spindrift!

### Method 2: Chrome Web Store (Future)
- Extension will be available on the Chrome Web Store for easy installation

## Usage

### Getting Started
1. **New Tab**: Open a new tab to see the cascading spindrift begin
2. **Watch the Cascade**: Observe triangles spinning at different speeds
3. **Ripple Effect**: Enjoy the mesmerizing ripple-like motion pattern
4. **Continuous Motion**: Animation never stops, providing endless fascination

### Controls
- **R Key**: Reset the animation to starting position
- **Escape**: Pause or resume the animation
- **Automatic**: Resizes automatically with browser window

## Technical Details

### Performance Specifications
- **Frame Rate**: Optimized for 60fps smooth animation
- **Drawing Method**: Single canvas clear and redraw per frame
- **Memory Usage**: Minimal storage (only configuration parameters)
- **CPU Usage**: Low computational overhead for continuous operation

### Browser Compatibility
- **Chrome**: Full support (primary target)
- **Edge**: Compatible with Chromium-based versions
- **Other Browsers**: May work with Canvas 2D support

### File Structure
```
Barnsley-Fern-New-Tab/
├── manifest.json      # Extension configuration
├── index.html         # Main HTML interface
├── style.css          # Styling and layout
├── script.js          # Core cascading spindrift logic
├── icon16.png         # Extension icons
├── icon48.png
├── icon128.png
└── README.md          # This file
```

## Customization

### Modifying Parameters
You can adjust various aspects of the cascading spindrift:

- **Number of Layers**: Change `numLayers` for more/fewer nested triangles
- **Base Size**: Modify `baseSize` for larger/smaller triangles
- **Scaling Factor**: Adjust the 0.5 factor for different nesting proportions
- **Base Rotation Speed**: Change `baseRotationSpeed` for faster/slower spinning
- **Speed Decay**: Modify `speedDecay` for different cascading effects
- **Colors**: Update the `strokeStyle` for different line colors

### Adding Features
The modular design makes it easy to add new features:

- **Multiple Spindrift Centers**: Create several cascading groups
- **Color Evolution**: Colors that change over time
- **Different Shapes**: Replace triangles with other geometric forms
- **Interactive Elements**: Click to change rotation speeds or directions

## Troubleshooting

### Common Issues
- **Slow Animation**: Check that hardware acceleration is enabled
- **Extension Not Loading**: Ensure Developer mode is enabled
- **No Animation**: Check browser console for JavaScript errors

### Performance Tips
- **Close Other Tabs**: Reduce memory usage for better performance
- **Update Chrome**: Ensure you're using the latest version
- **Hardware Acceleration**: Enable GPU acceleration in Chrome settings

## Contributing

Contributions are welcome! Areas for improvement include:

- **Animation Enhancements**: Better cascading patterns and effects
- **Geometric Variations**: Different shapes and nesting patterns
- **Performance**: Optimization for even smoother animation
- **UI Improvements**: Better visual design and user experience

## License

This project is open source and available under the MIT License.

## Acknowledgments

- **Canvas 2D API**: For enabling smooth, efficient 2D graphics
- **requestAnimationFrame**: For synchronized, performant animation
- **Chrome Extensions API**: For making this experience possible
- **Geometric Mathematics**: For the beautiful cascading algorithms

---

**Experience the mesmerizing beauty of cascading geometric motion! 🔺✨** 