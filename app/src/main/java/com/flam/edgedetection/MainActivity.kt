package com.flam.edgedetection

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.SurfaceTexture
import android.hardware.camera2.*
import android.media.ImageReader
import android.os.Bundle
import android.os.Handler
import android.os.HandlerThread
import android.util.Log
import android.util.Size
import android.view.Surface
import android.view.TextureView
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private lateinit var textureView: TextureView
    private lateinit var btnToggle: Button
    private lateinit var tvStatus: TextView
    private lateinit var tvFps: TextView
    
    private var cameraDevice: CameraDevice? = null
    private var captureSession: CameraCaptureSession? = null
    private var backgroundThread: HandlerThread? = null
    private var backgroundHandler: Handler? = null
    private var imageReader: ImageReader? = null
    
    private var isProcessingEnabled = true
    private var frameCount = 0
    private var lastFpsTime = System.currentTimeMillis()
    
    private val CAMERA_PERMISSION_REQUEST = 100
    private val TAG = "EdgeDetectionViewer"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        initializeViews()
        setupClickListeners()
        
        if (checkCameraPermission()) {
            setupCamera()
        } else {
            requestCameraPermission()
        }
    }
    
    private fun initializeViews() {
        textureView = findViewById(R.id.textureView)
        btnToggle = findViewById(R.id.toggleButton)
        tvStatus = findViewById(R.id.statusText)
        tvFps = findViewById(R.id.fpsText)
        
        updateStatus("Initializing camera...")
    }
    
    private fun setupClickListeners() {
        btnToggle.setOnClickListener {
            isProcessingEnabled = !isProcessingEnabled
            btnToggle.text = if (isProcessingEnabled) "Raw View" else "Edge Detection"
            updateStatus(if (isProcessingEnabled) "Edge detection enabled" else "Raw camera view")
        }
    }
    
    private fun checkCameraPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            this, Manifest.permission.CAMERA
        ) == PackageManager.PERMISSION_GRANTED
    }
    
    private fun requestCameraPermission() {
        ActivityCompat.requestPermissions(
            this, arrayOf(Manifest.permission.CAMERA), CAMERA_PERMISSION_REQUEST
        )
    }
    
    override fun onRequestPermissionsResult(
        requestCode: Int, permissions: Array<String>, grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == CAMERA_PERMISSION_REQUEST) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                setupCamera()
            } else {
                Toast.makeText(this, "Camera permission required", Toast.LENGTH_LONG).show()
                finish()
            }
        }
    }
    
    private fun setupCamera() {
        startBackgroundThread()
        
        textureView.surfaceTextureListener = object : TextureView.SurfaceTextureListener {
            override fun onSurfaceTextureAvailable(surface: SurfaceTexture, width: Int, height: Int) {
                openCamera()
            }
            
            override fun onSurfaceTextureSizeChanged(surface: SurfaceTexture, width: Int, height: Int) {}
            override fun onSurfaceTextureDestroyed(surface: SurfaceTexture): Boolean = true
            override fun onSurfaceTextureUpdated(surface: SurfaceTexture) {
                updateFpsCounter()
            }
        }
    }
    
    private fun openCamera() {
        try {
            val manager = getSystemService(CAMERA_SERVICE) as CameraManager
            val cameraId = manager.cameraIdList[0] // Use back camera
            
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.CAMERA) 
                != PackageManager.PERMISSION_GRANTED) {
                return
            }
            
            manager.openCamera(cameraId, stateCallback, backgroundHandler)
            updateStatus("Opening camera...")
            
        } catch (e: CameraAccessException) {
            Log.e(TAG, "Failed to open camera", e)
            updateStatus("Failed to open camera")
        }
    }
    
    private val stateCallback = object : CameraDevice.StateCallback() {
        override fun onOpened(camera: CameraDevice) {
            cameraDevice = camera
            createCameraPreviewSession()
            updateStatus("Camera ready")
        }
        
        override fun onDisconnected(camera: CameraDevice) {
            camera.close()
            cameraDevice = null
            updateStatus("Camera disconnected")
        }
        
        override fun onError(camera: CameraDevice, error: Int) {
            camera.close()
            cameraDevice = null
            updateStatus("Camera error: $error")
        }
    }
    
    private fun createCameraPreviewSession() {
        try {
            val texture = textureView.surfaceTexture!!
            texture.setDefaultBufferSize(1280, 720)
            
            val surface = Surface(texture)
            
            // Create ImageReader for frame processing
            imageReader = ImageReader.newInstance(640, 480, android.graphics.ImageFormat.YUV_420_888, 2)
            imageReader?.setOnImageAvailableListener(imageAvailableListener, backgroundHandler)
            
            val surfaces = listOf(surface, imageReader?.surface)
            
            cameraDevice?.createCaptureSession(surfaces, object : CameraCaptureSession.StateCallback() {
                override fun onConfigured(session: CameraCaptureSession) {
                    captureSession = session
                    
                    try {
                        val requestBuilder = cameraDevice?.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW)
                        requestBuilder?.addTarget(surface)
                        requestBuilder?.addTarget(imageReader?.surface!!)
                        
                        // Set auto-focus and auto-exposure
                        requestBuilder?.set(CaptureRequest.CONTROL_AF_MODE, CaptureRequest.CONTROL_AF_MODE_CONTINUOUS_PICTURE)
                        requestBuilder?.set(CaptureRequest.CONTROL_AE_MODE, CaptureRequest.CONTROL_AE_MODE_ON)
                        
                        val request = requestBuilder?.build()
                        session.setRepeatingRequest(request!!, null, backgroundHandler)
                        
                        updateStatus("Camera preview started")
                        
                    } catch (e: CameraAccessException) {
                        Log.e(TAG, "Failed to start preview", e)
                        updateStatus("Failed to start preview")
                    }
                }
                
                override fun onConfigureFailed(session: CameraCaptureSession) {
                    updateStatus("Camera configuration failed")
                }
            }, backgroundHandler)
            
        } catch (e: CameraAccessException) {
            Log.e(TAG, "Failed to create preview session", e)
            updateStatus("Failed to create preview session")
        }
    }
    
    private val imageAvailableListener = ImageReader.OnImageAvailableListener { reader ->
        val image = reader.acquireLatestImage()
        image?.let {
            if (isProcessingEnabled) {
                // Process frame with OpenCV (will implement JNI call here)
                processFrame(it)
            }
            it.close()
        }
    }
    
    private fun processFrame(image: android.media.Image) {
        // TODO: Convert image to byte array and pass to native code
        // For now, just log that we're processing
        Log.d(TAG, "Processing frame: ${image.width}x${image.height}")
    }
    
    private fun updateFpsCounter() {
        frameCount++
        val currentTime = System.currentTimeMillis()
        val elapsed = currentTime - lastFpsTime
        
        if (elapsed >= 1000) {
            val fps = (frameCount * 1000f / elapsed).toInt()
            runOnUiThread {
                tvFps.text = "FPS: $fps"
            }
            frameCount = 0
            lastFpsTime = currentTime
        }
    }
    
    private fun updateStatus(status: String) {
        runOnUiThread {
            tvStatus.text = status
        }
    }
    
    private fun startBackgroundThread() {
        backgroundThread = HandlerThread("CameraBackground").apply {
            start()
            backgroundHandler = Handler(looper)
        }
    }
    
    private fun stopBackgroundThread() {
        backgroundThread?.quitSafely()
        try {
            backgroundThread?.join()
            backgroundThread = null
            backgroundHandler = null
        } catch (e: InterruptedException) {
            Log.e(TAG, "Interrupted while stopping background thread", e)
        }
    }
    
    override fun onResume() {
        super.onResume()
        startBackgroundThread()
        if (textureView.isAvailable) {
            openCamera()
        }
    }
    
    override fun onPause() {
        closeCamera()
        stopBackgroundThread()
        super.onPause()
    }
    
    private fun closeCamera() {
        captureSession?.close()
        captureSession = null
        
        cameraDevice?.close()
        cameraDevice = null
        
        imageReader?.close()
        imageReader = null
    }
    
    // Native method for OpenCV processing (will implement in native-lib.cpp)
    external fun processImageWithOpenCV(data: ByteArray, width: Int, height: Int): ByteArray
    
    companion object {
        init {
            System.loadLibrary("edgedetection")
        }
    }
}