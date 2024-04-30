struct foo {
    y:u64,
    x:u64
}

import "inc.hy"
import "inc.hy"

impl foo {
    new(v:u64, p:u64) foo {
        var struc:foo = undefined;
        struc.y = v;
        struc.x = p;
        return struc;
    }

    zero(self:*foo) void {
        self.y = 5;
        self.x = 5;
    }

}


fn main() void {
    var a = foo::new(2,3);
    var b = &a.zero();

    return a.y + a.x;
}