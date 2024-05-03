fn write(data:&u8) void {
    asm {
        "mov rsi, [rdi+8]"
        "mov rdx, [rdi +0]"
        "mov rdi, 1"
        "mov rax, 1"
        "syscall"
    }
}


fn main() void {
    var a = 42;

    switch(a) {
        20 => {
        },
        30..50, 0 => {
            write("hello world\n");
        },
        40 => {

        }, 
        else => {
        }
    }
}