
var a = "hello world\n";

extern fn puts(char:*u8) void;

fn main() void {

    puts("hello");
}