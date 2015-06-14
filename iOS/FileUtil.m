    #import  "FileUtil.h"

@implementation FileUtil


RCT_EXPORT_MODULE()

NSString* getDocumentsRoot() {
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    return [paths objectAtIndex:0];
}


RCT_EXPORT_METHOD(readDir: (NSString *)dirName
                  errorCallback: (RCTResponseSenderBlock)failureCallback
                  callback: (RCTResponseSenderBlock)successCallback
                  ) {
    
    NSString *documentsDirectory = getDocumentsRoot();
    dirName = [NSString stringWithFormat:@"%@/%@", documentsDirectory, dirName];
    NSError *error;
    NSArray* dir = [[NSFileManager defaultManager]
                    contentsOfDirectoryAtPath: dirName
                    error: &error];

    if (error) {
        failureCallback(@[[error localizedDescription]]);
    } else {
        successCallback(@[dir]);
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
  k
    if (error) {
        reject(error);
    } else {
        resolve(fileContents);
    }
}

RCT_EXPORT_METHOD(writeFile: (NSString *)fileName
                  withContents:(NSString *)contents
                  callback: (RCTResponseSenderBlock)callback) {
    
    NSString *documentsDirectory = getDocumentsRoot();
    
    fileName = [NSString stringWithFormat:@"%@/%@", documentsDirectory, fileName];
    NSError *error;
    
    [contents writeToFile: fileName
               atomically: NO
               //encoding: NSStringEncodingConversionAllowLossy
               encoding: NSUTF8StringEncoding
               error: &error];
    
    callback(error ? @[[error localizedDescription]] : @[[NSNull null]]);
}

RCT_EXPORT_METHOD(createDir: (NSString *)dirName
                  callback: (RCTResponseSenderBlock)callback) {

    NSString *documentsDirectory = getDocumentsRoot();
    dirName = [NSString stringWithFormat:@"%@/%@", documentsDirectory, dirName];
    NSError *error;

    [[NSFileManager defaultManager]
        createDirectoryAtPath: dirName
        withIntermediateDirectories: YES
        attributes: nil
        error: &error];
    
    callback(error ? @[[error localizedDescription]] : @[[NSNull null]]);
}



@end
