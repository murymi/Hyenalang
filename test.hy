extern fn printf(str:*u8, num:u64) void;

fn main() void {
    var a = "hello world";
    
    var i = 0;
    while(i < a.len) {
        i = i + 1;
    }

    i = 0;


    while(i < a.len) {
        printf("%c ", a[i]);
        i = i + 1;
    }

}