struct point {
    x:u8,
    y:u8
}

fn makenum() u32 {
    return 10;
}

fn add(a:u32, b:u32) u32 {
    return a + b;
}

fn main() void {
    var a = add(makenum(), makenum());
    return a;
}