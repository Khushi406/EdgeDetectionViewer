#include <jni.h>
#include <string>
#include <android/log.h>
#include <opencv2/opencv.hpp>
#include <opencv2/imgproc.hpp>

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
        // Create OpenCV Mat from input data (assuming NV21 format from camera)
        cv::Mat yuvImage(height + height/2, width, CV_8UC1, (unsigned char*)inputData);
        cv::Mat rgbImage;
        cv::Mat grayImage;
        cv::Mat blurredImage;
        cv::Mat edgesImage;
        
        // Convert YUV to RGB
        cv::cvtColor(yuvImage, rgbImage, cv::COLOR_YUV2RGB_NV21);
        
        // Convert to grayscale for edge detection
        cv::cvtColor(rgbImage, grayImage, cv::COLOR_RGB2GRAY);
        
        // Apply Gaussian blur to reduce noise
        cv::GaussianBlur(grayImage, blurredImage, cv::Size(5, 5), 0);
        
        // Apply Canny edge detection
        cv::Canny(blurredImage, edgesImage, 50, 150);
        
        // Convert edges back to RGB for display
        cv::Mat outputRgb;
        cv::cvtColor(edgesImage, outputRgb, cv::COLOR_GRAY2RGB);
        
        // Calculate output size
        int outputSize = outputRgb.rows * outputRgb.cols * 3;
        jbyteArray outputArray = env->NewByteArray(outputSize);
        
        if (outputArray == nullptr) {
            LOGE("Failed to create output array");
            env->ReleaseByteArrayElements(inputArray, inputData, JNI_ABORT);
            return nullptr;
        }
        
        // Copy processed data to output array
        jbyte* outputData = env->GetByteArrayElements(outputArray, nullptr);
        if (outputData == nullptr) {
            LOGE("Failed to get output array elements");
            env->ReleaseByteArrayElements(inputArray, inputData, JNI_ABORT);
            return nullptr;
        }
        
        memcpy(outputData, outputRgb.data, outputSize);
        
        // Clean up
        env->ReleaseByteArrayElements(inputArray, inputData, JNI_ABORT);
        env->ReleaseByteArrayElements(outputArray, outputData, 0);
        
        LOGD("OpenCV Canny edge detection completed successfully");
        return outputArray;
        
    } catch (cv::Exception& e) {
        LOGE("OpenCV Exception: %s", e.what());
        env->ReleaseByteArrayElements(inputArray, inputData, JNI_ABORT);
        return nullptr;
    }
}

extern "C" JNIEXPORT jboolean JNICALL
Java_com_flam_edgedetection_MainActivity_initializeOpenCV(
        JNIEnv* env,
        jobject /* this */) {
    
    LOGD("Initializing OpenCV...");
    
    try {
        // Test OpenCV functionality
        cv::Mat testMat = cv::Mat::zeros(100, 100, CV_8UC3);
        LOGD("OpenCV initialized successfully - Version: %s", CV_VERSION);
        return JNI_TRUE;
    } catch (cv::Exception& e) {
        LOGE("OpenCV initialization failed: %s", e.what());
        return JNI_FALSE;
    }
}