    #import  "FileUtil.h"

@implementation FileUtil


RCT_EXPORT_MODULE()

NSString* getDocumentsRoot() {
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    return [paths objectAtIndex:0];
}


RCT_EXPORT_METHOD(readDir: (NSString *)dirName
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    NSString *documentsDirectory = getDocumentsRoot();
    dirName = [NSString stringWithFormat:@"%@/%@", documentsDirectory, dirName];
    NSError *error;
    NSArray* dir = [[NSFileManager defaultManager]
                    contentsOfDirectoryAtPath: dirName
                    error: &error];
  
    if (error) {
        reject(error);
    } else {
        resolve(dir);
    }
}


RCT_EXPORT_METHOD(readFile: (NSString *)fileName
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  
    NSString *documentsDirectory = getDocumentsRoot();
    
    fileName = [NSString stringWithFormat:@"%@/%@", documentsDirectory, fileName];
    NSError *error;
    
    NSString *fileContents = [[NSString alloc]
                              initWithContentsOfFile: fileName
                              usedEncoding : nil
                              error: &error];
  
    if (error) {
        reject(error);
    } else {
        resolve(fileContents);
    }
}

RCT_EXPORT_METHOD(writeFile: (NSString *)fileName
                  withContents:(NSString *)contents
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    NSString *documentsDirectory = getDocumentsRoot();
    
    fileName = [NSString stringWithFormat:@"%@/%@", documentsDirectory, fileName];
    NSError *error;
    
    [contents writeToFile: fileName
               atomically: NO
               //encoding: NSStringEncodingConversionAllowLossy
               encoding: NSUTF8StringEncoding
               error: &error];
    if (error) {
      reject(error);
    } else {
      resolve(nil);
    }
}

RCT_EXPORT_METHOD(createDir: (NSString *)dirName
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {

    NSString *documentsDirectory = getDocumentsRoot();
    dirName = [NSString stringWithFormat:@"%@/%@", documentsDirectory, dirName];
    NSError *error;

    [[NSFileManager defaultManager]
        createDirectoryAtPath: dirName
        withIntermediateDirectories: YES
        attributes: nil
        error: &error];
    if (error) {
      reject(error);
    } else {
      resolve(nil);
    }
}



@end
