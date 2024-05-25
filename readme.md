### Don't take as serious.


This toy compiler produces unoptimized X86-64 code and works only on linux. The project was abandoned because the target goal was archieved. Most of the syntax design is inspired by <a href="https://ziglang.org
">Zig</a>.

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
### data types
#### signed numbers
i8, i16, i32, i64

#### unsigned numbers
u8, u16, u32, u64

#### bool
true, false

#### void type
void

#### null ptr
null

#### comment
```zig
// Like that
```

### enum
```zig
enum Foo {
    wicked,
    // any constant expression is allowed
    evil = 30,
    man // 31
}

```

### struct
```zig
struct Bar {
    down: i8,
    under: u8,
    over: u64,
    up: i64
}
```

### union
```zig
// size 8
// align 8
union Fuzz {
    sins: u64,
    tragedies: u8
}

```

### Tagged union
```zig
// explicit tag
enum Tag {
    one,
    two,
    night
}

union(Tag) ExpTag {
    one:u8,
    two:u16,
    night:u8
}

// implicit tag
union() ImptTag {
    one:u8,
    two:u16,
    night:u8
}
```
### Array

```zig
var a:[5]u8 = undefined;

// or
var a = []u8{'a', 'b', 'c', 'd', 'e'};

var c = []&u8{"born", "fi", "survive"};

```

### function
```zig
fn fukumean(x:u64, y:u64) u64 {
    return x + y;
}

fn main() void {
    fukumean(56,60);
}

```


### variables
```zig
fn main () void {
    // if undefined, type must be indicated
    var a:i8 = undefined;
    a = 21;

    var b = 22;

    // enum var

    enum Sl {
        you,
        out
    }

    var a_s = Sl.out;
    var b_s = Sl.you;

    // struct var 
    struct Point {
        x:i8,
        y:i8
    }

    var c: Point = undefined;
    c = Point { .x = 1, .y = 2 };
    // assign literal
    var d = Point { .x = 50, .y = 69 };
    // set 
    d.x = 51;
    // get
    var d_y = d.y;

    // Union var
    union Shake {
        ya: u64, 
        bum: i8
    }

    var my_union = Shake { .bum = 10 };


    // array var 
    var undef_array:[20]u64 = undefined;
    var my_array = []u64{1,2,3,4,5};
    // get length of the array
    var array_len = my_array.len;
    // get
    var fist_idx = my_array[0];
    // set
    my_array[0] = 70;

    // u8 slice var
    var title = "face down";
    var title_len = title.len;
    var title_ptr = title.ptr;

    // var slice from array
    var my_slice:&u8 = undefined;
    my_slice = myarray[0..3];

    // get
    var last_slice_idx = myslice[2];
    // set
    myslice[1] = 2;

    // var slice from slice
    var my_slice_slice = my_slice[0..2];

    // var pointer
    var t = 20;
    var ptr: *i32 = &t;
    ptr.* = 21; // makes t = 21
}

```

### if

```
fn main() {
    var a = 0;
    if(a == 0) {

    } else if(a == 1) {

    } else {

    }

    // if captcha
    var a:*u8 = null;
    if(a) |ptr| {

    } else {

    }
} 
```

### while
```zig

fn main () {
    var a = 0;

    while(a < 10) {
        a += 1;
        if(a == 3) continue;

        if(a == 9) break;
    }

    // labelled while
    in: while(true) {
        mid: while(true) {
            out: while(true) {
                break:in;
            }
        }
    }
}

```

### for
```zig
fn main() void {

    // on range
    for(0..10)|idx| {

    }

    // on array
    var a = []u64{1,2,3,4};

    // value
    for(a, 0..)|val, idx| {

    }

    // pointer
    for(a, 0..)|*val, idx| {
        // modifie val through ptr
        val.* = idx;
    }

    // on slice
    for([]u64{1,2,3,4}[0..3])|val| {

    }

    // mix
    for([]u8{'a', 'b', 'c'}, 0.., []u8{1,2,3}[0..3])|a, b, *c| {

    }

    // labelled for
    see: for(0..10)|_| {
        continue: see;
    }
}

```

#### switch

```zig
fn main() void {
    // switch on number
    var a = "1984";
    switch(a.len) {
        1 => {},
        10..30 => {},
        else => {}
    }

    // swich on tagged union

    union() Who {
        me:u64,
        you:u8
    }

    var who = Who { .me = 1 };

    switch(who) {
        .me => |m| {
            // m is 1
        },
        else => {}
    }

}
```

### struct/union functions
```
struct Cow {
    name:&u8,
    age:u8
}

impl cow {
    init(name: &u8, age:u8) Cow {
        return Cow {
            .name = name,
            .age = age
        };
    }

    reage(self:*Cow, age:u8) void {
        self.age = age;
    }

    rename(self:*Cow, name:&u8) void {
        self.name = name;
    }

    getname(self:*Cow) &u8 {
        return self.name;
    }

    getage(self:*Cow) u8 {
        return self.age;
    }
}

fn main() void {
    var cow = Cow::init("Mutune", 4);
    cow.rename("Njiru");
    cow.reage(5);

    var cow_name = cow.getname();
    var cow_age = cow.getage();
}
```



#### references
https://en.wikipedia.org/wiki/Code_generation

https://www.sigbus.info/compilerbook

https://www.cs.usfca.edu/~galles/compilerdesign/x86.pdf

https://www.rust-lang.org/

https://ziglang.org
