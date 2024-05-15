### Don't take as serious.

### hello world
##### file: hello.hyena
```zig
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
   write("hello world\n");
}
```

### compile
```shell
make FILE=hello.hyena
make bin
./tmp
```
#### references
https://en.wikipedia.org/wiki/Code_generation

https://www.sigbus.info/compilerbook

https://www.cs.usfca.edu/~galles/compilerdesign/x86.pdf

https://www.rust-lang.org/

https://ziglang.org
