extern fn puts(a:*u8) void;

fn foo() str {
    return "hello world";
}

fn main() void {
    var a = foo().ptr;
    puts(a);
}