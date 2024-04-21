extern fn printf(str:*u8, num:u64, num:u64) void;

fn main() void {
    var numbers:[10]u64;
    var i = 0;

    while(i < numbers.len) {
        numbers[i] = i;
        i = i + 1;
    }

    i = 0;

    while(i < numbers.len) {
        printf("[%d] %d\n", i, numbers[i]);
        i = i + 1;
    }
}