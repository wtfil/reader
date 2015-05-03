#import "ScreenUtil.h"

@implementation ScreenUtil

RCT_EXPORT_MODULE()

- (NSDictionary *)constantsToExport {
    CGFloat width = [UIScreen mainScreen].bounds.size.width;
    CGFloat height = [UIScreen mainScreen].bounds.size.height;

    return @{
        @"width": [NSNumber numberWithInt: roundf(width)],
        @"height": [NSNumber numberWithInt: roundf(height)]
    };
}

@end
