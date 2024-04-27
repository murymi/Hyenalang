struct foa { a:i8 }
struct fob { a:foa }
struct foc { a:fob }
struct fod { a:foc }
struct foe { a:fod }



struct point {
    x:u64,
    y:u64
}


fn makepoint() point {
    var a:point = undefined;

    return a;
}

fn usepoint(p:point) void {
    return p.y;
}

fn main() void {
   usepoint(makepoint());
}