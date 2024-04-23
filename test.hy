extern fn printf(str:*u8, num:u64) void;


struct foo {
    x: u64,
    y: u64
}

var a = "hello world";

fn main() void {

    var b = a[0:5];

    var c = b[1:5];

    var i = 0;

    while(i < c.len) {
        printf("%c\n", c[i]);
        i = i + 1;
    }
}