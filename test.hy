extern fn printf(str:*u8, num:u64) void;


var cow = "hello world";

fn main() void {
    var b = cow;

    var c = b;

    c = b;

    printf("%s\n", c.ptr);
}