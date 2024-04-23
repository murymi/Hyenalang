extern fn printf(str:*u8, num:u64) void;


struct foo {
    x: u64,
    y: u64
}

var a:[10]u8;

fn main() void {
    var i = 0;
    while(i < a.len) {
        a[i] = i;
        i = i + 1;
    }

    var b = a[0:8];

    i = 0;

    while(i < b.len) {
        printf("%d\n", b[i]);
        i = i + 1;
    }
}