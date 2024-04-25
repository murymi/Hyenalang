extern fn puts(string:*u8) void;


fn main() void {
    # make a u8 array
    # another comment
    # another
    # yeah
    
    var x:[5]u8 = undefined;
    x[0] = 'y';


    puts(x.ptr);
}