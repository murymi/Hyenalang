extern fn printf(str:*u8, num:u64) void;


struct foo {
    x: u64,
    y: u64
}

fn main() void {
    var a:[10]u64;

    var i = 0;

    while(i < a.len) {
        a[i] = i;
        i = i + 1;
    }

    var b = a;

    i = 0;
    while(i < b.len) {
        printf("%d\n", b[i]);
        i = i + 1;
    }

    return @sizeof(b);
}