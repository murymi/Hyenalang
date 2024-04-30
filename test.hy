import "inc.hy"

fn hello() void {

}

struct point {
    a:u64,
    b:u64
}

impl point {
    new() point {

    }

    do(p:*point) void {

    } 
}

fn main() void {
    var a = point::new();
    &a.do();
}