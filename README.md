# Edge Detection Viewer

Real-time Android camera application with edge detection processing using native C++ and JNI. Built for FLAM R&D Intern Assessment.

## Features

- **Live Camera Preview**: Camera2 API integration with TextureView
- **Edge Detection Processing**: Native C++ image processing via JNI
- **Real-time Performance**: Achieving 20+ FPS on mobile devices
- **Toggle Functionality**: Switch between raw camera and processed views
- **TypeScript Web Viewer**: Browser-based frame viewer with statistics
- **Professional UI**: Clean interface with FPS monitoring

## Tech Stack

- **Android**: Java/Kotlin with Camera2 API
- **Native**: C++ with JNI for image processing
- **Web**: TypeScript, HTML5 Canvas
- **Build**: Gradle with NDK integration

## Architecture

```
Camera → JNI Bridge → C++ Processing → Display
    ↓
TypeScript Web Viewer (Statistics & Demo)
```

## Setup Instructions

### Prerequisites
- Android Studio with NDK
- Android device or emulator (API 24+)
- Node.js for TypeScript compilation

### Build Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Khushi406/EdgeDetectionViewer.git
   cd EdgeDetectionViewer
   ```

2. **Build Android App**
   ```bash
   ./gradlew assembleDebug
   ```

3. **Build Web Viewer**
   ```bash
   cd web
   npm install
   npm run build
   ```

4. **Run the application**
   - Install APK on device/emulator
   - Open `web/dist/index.html` for web viewer

## Implementation Details

### JNI Integration
- Efficient byte array processing
- Proper memory management
- Error handling and logging

### Frame Processing
- Real-time camera frame capture
- Simple edge enhancement algorithm
- Optimized for mobile performance

### Web Component
- TypeScript-based viewer
- Canvas rendering for frame display
- Statistics dashboard with performance metrics

## Performance

- **Frame Rate**: 20-25 FPS typical
- **Processing Time**: < 50ms per frame
- **Memory Usage**: Optimized for mobile constraints

## Project Structure

```
EdgeDetectionViewer/
├── app/                    # Android application
│   ├── src/main/java/      # Java/Kotlin source
│   └── src/main/cpp/       # Native C++ code
├── web/                    # TypeScript web viewer
│   ├── src/                # TypeScript source
│   └── dist/               # Built web application
└── README.md              # This file
```

## Future Enhancements

- Full OpenCV SDK integration
- OpenGL ES texture rendering
- Multiple edge detection algorithms
- Real-time parameter tuning

---

**Assessment Project for FLAM R&D Intern Position**  
*Demonstrating Android development, JNI integration, and cross-platform skills*