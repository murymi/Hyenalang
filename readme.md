## NB. Don't take as a serious

### hello world
##### file: hello.hyn
```hyena
    extern fn puts(str:*u8) void;

    fn main () void {
        puts("Hello, World");
    }
```

### compile
```shell
make FILE=hello.hyn
./tmp
```