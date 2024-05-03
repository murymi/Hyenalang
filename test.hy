fn write(data:&u8) void {
    asm {
        "mov rsi, [rdi+8]"
        "mov rdx, [rdi +0]"
        "mov rdi, 1"
        "mov rax, 1"
        "syscall"
    }
}


fn test_eq(a:u64, b:u64) void {
    if(a == b) {
        write("ok\n");
        return;
    }

    write("fail\n");
}

fn main() void {
    test_eq("kwenda huko\n".len, 12);
}