extern fn printf(string:*u8, num:u64) void;


fn main() void {

    var x = "hello world";

    var c:[3]str = undefined;

    c[2] = x;

    return c[2].len;

}