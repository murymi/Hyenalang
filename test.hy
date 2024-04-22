extern fn printf(str:*u8, num:u64) void;


fn main() void {
    var cow = "hello world";
    var b = cow;

    printf("%s\n", b.ptr);
}