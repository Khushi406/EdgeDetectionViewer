#include <jni.h>
#include <string>
#include <android/log.h>
// #include <opencv2/opencv.hpp>
// #include <opencv2/imgproc.hpp>

#define LOG_TAG "EdgeDetectionViewer"
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

extern "C" JNIEXPORT jstring JNICALL
Java_com_flam_edgedetection_MainActivity_stringFromJNI(
        JNIEnv* env,
        jobject /* this */) {
    std::string hello = "EdgeDetectionViewer Native Library Ready!";
    return env->NewStringUTF(hello.c_str());
}

extern "C" JNIEXPORT jbyteArray JNICALL
Java_com_flam_edgedetection_MainActivity_processImageWithOpenCV(
        JNIEnv* env,
        jobject /* this */,
        jbyteArray inputArray,
        jint width,
        jint height) {
    
    LOGD("Processing image with OpenCV: %dx%d", width, height);
    
    // Get input data
    jbyte* inputData = env->GetByteArrayElements(inputArray, nullptr);
    jsize inputLength = env->GetArrayLength(inputArray);
    
    if (inputData == nullptr) {
        LOGE("Failed to get input array elements");
        return nullptr;
    }
    
    try {
        // Simple placeholder processing (grayscale edge effect)
        // TODO: Replace with OpenCV when SDK is integrated
        
        // Calculate output size (RGB format)
        int outputSize = width * height * 3;
        jbyteArray outputArray = env->NewByteArray(outputSize);
        
        if (outputArray == nullptr) {
            LOGE("Failed to create output array");
            env->ReleaseByteArrayElements(inputArray, inputData, JNI_ABORT);
            return nullptr;
        }
        
        jbyte* outputData = env->GetByteArrayElements(outputArray, nullptr);
        if (outputData == nullptr) {
            LOGE("Failed to get output array elements");
            env->ReleaseByteArrayElements(inputArray, inputData, JNI_ABORT);
            return nullptr;
        }
        
        // Simple processing: Create edge-like effect
        for (int i = 0; i < width * height; i++) {
            unsigned char pixel = (unsigned char)(inputData[i] & 0xFF);
            unsigned char processed = (pixel > 128) ? 255 : 0;
            
            // Set RGB values (grayscale edge effect)
            outputData[i * 3] = processed;     // R
            outputData[i * 3 + 1] = processed; // G
            outputData[i * 3 + 2] = processed; // B
        }
        
        // Clean up
        env->ReleaseByteArrayElements(inputArray, inputData, JNI_ABORT);
        env->ReleaseByteArrayElements(outputArray, outputData, 0);
        
        LOGD("Simple edge processing completed successfully");
        return outputArray;
        
    } catch (std::exception& e) {
        LOGE("Processing Exception: %s", e.what());
        env->ReleaseByteArrayElements(inputArray, inputData, JNI_ABORT);
        return nullptr;
    }
}

extern "C" JNIEXPORT jboolean JNICALL
Java_com_flam_edgedetection_MainActivity_initializeOpenCV(
        JNIEnv* env,
        jobject /* this */) {
    
    LOGD("Initializing native library...");
    
    try {
        // Placeholder initialization - ready for OpenCV integration
        LOGD("Native library initialized successfully - Ready for OpenCV");
        return JNI_TRUE;
    } catch (std::exception& e) {
        LOGE("Native library initialization failed: %s", e.what());
        return JNI_FALSE;
    }
}