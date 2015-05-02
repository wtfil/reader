//
//  FileUtil.m
//  AwesomeProject
//
//  Created by ifi on 5/2/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import  "FileUtil.h"

@implementation FileUtil

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(readFile:(NSString *)fileName
                  errorCallback:(RCTResponseSenderBlock)failureCallback
                  callback:(RCTResponseSenderBlock)successCallback) {
    
    // Create an array of directory Paths, to allow us to get the documents directory
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    
    // The documents directory is the first item
    NSString *documentsDirectory = [paths objectAtIndex:0];
    
    // Create a string that prepends the documents directory path to a text file name
    // using NSString's stringWithFormat method.
    fileName = [NSString stringWithFormat:@"%@/%@", documentsDirectory, fileName];
    
    // Initialize an NSError variable
    NSError *readError;
    
    // Allocate a string and initialize it with the contents of the file via
    // the initWithContentsOfFile instance method.
    NSString *fileContents = [[NSString alloc]
                              initWithContentsOfFile: fileName
                              usedEncoding : nil
                              error: &readError
                              ];
    

    if (readError) {
        failureCallback(@[[readError localizedDescription]]);
    } else {
        successCallback(@[fileContents]);
    }
}

@end
