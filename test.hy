extern fn puts(a:*u8) void;


fn main() void {
   var a = "hello world\n";
   puts(a.ptr);
}