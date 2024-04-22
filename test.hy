extern fn printf(str:*u8, num:u64, num:u64) void;


struct foo {
    x: u64,
    y: u64
}

fn main() void {
    var a:foo;
    a.y = 90;
    a.x = 89;
    var c = a;

    printf("%d %d", c.y, c.x);
}