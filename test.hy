extern fn printf(str:*u8) void;

fn main() void {
    var a:[20]u8;
    a[0] = 70;
    return a[0];
}