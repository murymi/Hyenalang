extern fn printf(str:*u8, int:i32) void;

fn main() void {
    var a = @alignof([50]u64) * 10;
    printf("hello world %d\n", a);
}