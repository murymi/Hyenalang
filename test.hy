struct foo {
    y:u64,
    x:u64
}

impl foo {
    fn new(v:u64, p:u64) foo {
        var struc:foo = undefined;
        struc.y = v;
        struc.x = p;
        return struc;
    }

    fn zero(self:*foo) void {
        self.y = 0;
        self.x = 0;
    }

}


fn main() void {
    var a = foo::new(2,3);
    a.zero();
}