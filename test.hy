import "inc.hy" as inc;

fn main() void {
    inc::foo();
    var a = inc::inner::a;
    var b = inc::inner::b;
}