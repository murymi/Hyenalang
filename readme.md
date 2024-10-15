# Hyena Compiler Documentation
**Warning**: This toy compiler is basic as hell. It spits out X86-64 code that works only on Linux. If you were expecting miracles, turn around! This thing got abandoned after we hit the bare minimum. Syntax? We shamelessly ripped it from [Zig](https://ziglang.org) because, why not?

---

## Hello, world! (What else were you expecting?)
### file: hello.hyena
```zig
fn scream_out_loud(data: &u8) void {
    asm {
        "mov rsi, [rdi+8]"   // Put the string address in rsi
        "mov rdx, [rdi+0]"   // Load length, or whatever, into rdx
        "mov rdi, 1"         // Put 1 in rdi (stdout, duh)
        "mov rax, 1"         // Syscall write
        "syscall"            // Do the thing
    }
}

fn main() void {
    scream_out_loud("Hello, filthy world!\n");
}
```

---

## Compilation (Press buttons and hope)
```shell
make FILE=hello.hyena
make bin
./tmp  # If this works, you're blessed
```

---

## Data Types (Basic stuff, nothing fancy)
### Signed numbers
- i8, i16, i32, i64: Negative or positive, your pick.

### Unsigned numbers
- u8, u16, u32, u64: Only positive because they’re too optimistic.

### Bool
- `true`, `false`: Like your ex’s promises.

### Void type
- `void`: The abyss. The nothingness. Also known as "who cares?"

### Null pointer
- `null`: Because sometimes, life gives you nothing.

### Comments
```zig
// This is how you tell the compiler to ignore your whining.
```

---

## Enum (Organized chaos)
```zig
enum DrunkenChoices {
    beer,
    tequila = 30,  // Advanced level
    whiskey  // 31: Life's mistakes start here
}
```

---

## Struct (A way to pretend we're organized)
```zig
struct Hangover {
    headache: i8,
    regret: u8,
    number_of_texts_sent: u64,
    hours_of_blackout: i64
}
```

---

## Union (A mess inside a mess)
```zig
union Sobriety {
    shots_taken: u64,
    stupid_decisions_made: u8
}
```

---

## Arrays (A bunch of things in a row)
```zig
var last_nights_drinks: [5]u8 = undefined;  // Because who remembers?

// or
var drinks = []u8{'beer', 'wine', 'vodka', 'rum', 'whiskey'};
var regrets = []&u8{"I shouldn't have", "Why did I text?", "Never again"};
```

---

## Functions (Do something, maybe.)
```zig
fn add_regrets(x: u64, y: u64) u64 {
    return x + y;
}

fn main() void {
    add_regrets(56, 60);  // No regrets? Ha!
}
```

---

## Variables (Things you can screw with)
```zig
fn main() void {
    var bad_decision: i8 = undefined;  // A variable to hold your next mistake
    bad_decision = 21;

    var drunkness_level = 22;  // No need to explain

    // Enum example
    enum Choices {
        yes,
        hell_no
    }

    var my_choice = Choices.hell_no;
    var your_choice = Choices.yes;

    // Struct example
    struct Weekend {
        friday: i8,
        saturday: i8
    }

    var my_weekend: Weekend = undefined;
    my_weekend = Weekend { .friday = 1, .saturday = 2 };

    var my_sunday = Weekend { .friday = 50, .saturday = 69 };
    my_sunday.friday = 51;
    var saturday_morning = my_sunday.saturday;

    // Union example
    union StateOfMind {
        clarity: u64,
        chaos: i8
    }

    var current_state = StateOfMind { .chaos = 10 };

    // Array example
    var blackout_periods: [20]u64 = undefined;
    var my_mistakes = []u64{1, 2, 3, 4, 5};
    var mistakes_count = my_mistakes.len;

    var first_mistake = my_mistakes[0];  // The biggest one
    my_mistakes[0] = 70;  // Fixing the first mistake

    // u8 slice
    var memory_loss = "still drunk";
    var mem_loss_len = memory_loss.len;
    var mem_loss_ptr = memory_loss.ptr;

    var mistake_slice: &u8 = undefined;
    mistake_slice = my_mistakes[0..3];

    var last_mistake = mistake_slice[2];  // The last one (or so you thought)
    mistake_slice[1] = 2;  // Denial

    var regret_slice = mistake_slice[0..2];

    // Pointer (You’re getting fancy now, huh?)
    var brain_cells_left = 20;
    var ptr_to_brain: *i32 = &brain_cells_left;
    ptr_to_brain.* = 21;  // Slightly better!
}
```

---

## Control Structures (Basic stuff to stop screwing up)

### `if` (But it won’t stop you)
```zig
fn main() {
    var brain = 0;
    if (brain == 0) {
        // Do something dumb
    } else if (brain == 1) {
        // Slightly better but still bad
    } else {
        // Complete disaster
    }
}
```

### Loops (`while` you're still trying)
```zig
fn main() {
    var attempts = 0;

    while (attempts < 10) {
        attempts += 1;
        if (attempts == 3) continue;  // Skip the embarrassing one

        if (attempts == 9) break;  // Call it quits
    }

    // Labelled while loops, because you love pain
    in: while (true) {
        mid: while (true) {
            out: while (true) {
                break :in;  // Abort mission!
            }
        }
    }
}
```

---

## Switch (For when you're indecisive AF)
```zig
fn main() void {
    var bad_decision = "1984";
    switch (bad_decision.len) {
        1 => {},
        10..30 => {},  // In for a ride
        else => {}  // Life spiraling out of control
    }

    union() Choices {
        sober: u64,
        wasted: u8
    }

    var decision = Choices { .sober = 1 };

    switch (decision) {
        .sober => |clear_mind| {
            // Yeah, right.
        },
        else => {}  // You're drunk again
    }
}
```
---

## Struct/Union Functions (Giving cows midlife crises)

```zig
struct Cow {
    name: &u8,  // The poor thing's name
    age: u8     // How many years it’s suffered on this earth
}

impl Cow {
    // Create a cow with a name and age, no refunds.
    init(name: &u8, age: u8) Cow {
        return Cow {
            .name = name,
            .age = age
        };
    }

    // Because cows also get old and grumpy.
    reage(self: *Cow, age: u8) void {
        self.age = age;  // "I’m old now, moo."
    }

    // Sometimes, even cows wanna reinvent themselves.
    rename(self: *Cow, name: &u8) void {
        self.name = name;  // "Call me Beyoncé now, peasant."
    }

    // Because asking a cow for its name is somehow necessary.
    getname(self: *Cow) &u8 {
        return self.name;  // "My name’s Cow, you human idiot."
    }

    // For when you're too drunk to remember how old your cow is.
    getage(self: *Cow) u8 {
        return self.age;  // "I’m ancient, moo."
    }
}

fn main() void {
    // Meet Mutune, the OG cow, age 4.
    var cow = Cow::init("Mutune", 4);

    // But now Mutune wants a fancy new name.
    cow.rename("Njiru");  // Midlife cow crisis.

    // Also, Mutune... err Njiru... aged like cheese. Now 5.
    cow.reage(5);

    // Let’s check how old this troublemaker is now.
    var cow_name = cow.getname();
    var cow_age = cow.getage();

    // And now you've wasted your time learning about a damn cow.
}
```