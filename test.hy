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

    fn add(self:*foo) void {
        self.y = self.y + 1;
        self.x = self.x + 1;
    }

    fn see() void {}
}


fn main() void {
    var a = foo::new(2,3);
    a.add();
    a.see();
}