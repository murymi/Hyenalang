extern fn puts(a:*u8) void;

fn write(data:str) void {
    asm {
        "mov rsi, [rdi+8]"
        "mov rdx, [rdi +0]"
        "mov rdi, 1"
        "mov rax, 1"
        "syscall"
    }
}

fn main() void {
   write("hello world\n");
}