extern fn printf(string:*u8, num:u64) void;


fn foo(a:*[1]u8) u64 {
    return a.*.len;
}

fn main() void {

    var y = "hello world";

    var c = &y;

    var d = &c;

    return d.*.*.len;

}