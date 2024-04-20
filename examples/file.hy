extern fn puts(str:*u8) void;
extern fn fopen(filename:*u8, mode:*u8) *void;
extern fn fputs(data:*u8, file:*void) i32;
extern fn fclose(file:*void) void;

fn main () void {
    var file = fopen("hello.txt", "w");

    if(file) {
        fputs("hello. Bla Bla Bla", file);
        fclose(file);
    } else {
        puts("failed to open file");
    }
}