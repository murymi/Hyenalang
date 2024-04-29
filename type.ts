import { Expression, exprType } from "./expr";
import { Function, getCurrentFile, setCurrentFile, setPreviousFile } from "./main";
import { Statement, stmtType } from "./stmt";
import { Token } from "./token";

export class Module {
    name: string;
    children: Module[];
    file: string;
    id: number;
    constructor(name: string) {
        this.name = name;
        this.children = [];
        this.file = getCurrentFile();
        this.id = modules.length;
    }
}

var modules: Module[] = [];
var module_stack: Module[] = [];

export function pushModule(mod: Module) {
    //setCurrentFile(mod.file);
    modules.push(mod);
    module_stack.push(modules[modules.length - 1]);
}

export function popModule() {
    //console.error(modules);
    //setPreviousFile();
    module_stack.pop();
}

export function appendModule(mod: Module) {
    (module_stack.at(-1) as Module).children.push(mod);
    module_stack.push(mod)
}

export function getPresentModule(): number {
    //console.log(module_stack, modules)
    return (module_stack.at(-1) as Module).id
}

function moduleNotFoundError(name: string) {
    throw new Error(`module ${name} not found`);
}

function recursiveSearch(name: string, mods: Module[]):Module|null {
    for (let m of mods) {
        if (m.name === name) return m;
        if(m.children.length > 0) {
            var mod = recursiveSearch(name, m.children);
            if (mod) return mod;
        }
    }

    return null;

}

// function recursive(name:string, mod:Module) {
//     if(mod.name === name) return mod.id;
//     return recursiveSearch(name, mod.children);
// }

export function searchModule(name: string): number {
    //console.error(modules, modules.find((m)=> m===name), name);
    //var n = modules.find((m) => m.name === name)
    //if (n) return n.id;
    var num = recursiveSearch(name, modules);
    if(num) return num.id;

    //if (n >= 0) return n;
    console.log(modules[1]);
    moduleNotFoundError(name);
    return -1;
}

export function searchModuleById(id: number) {
    return modules.find((m) => m.id === id)
}

export function searchModuleChildren(id: number, child: string): number {
    var mod = searchModuleById(id);
    var modchld = searchModule(child);
    if (mod === undefined) {
        moduleNotFoundError("++" + child);
    }
    var num = mod?.children.find((c) => c.id === modchld);
    if (num) return num.id;
    console.error(mod?.children)
    moduleNotFoundError("--" + child)
    return -1;
}

export enum myType {
    u8,
    u16,
    u32,
    u64,
    i8,
    i16,
    i32,
    i64,
    f32,
    f64,
    void,
    struct,
    enum,
    slice,
    string,
    ptr,
    array,
    bool
}

export function alignTo(align: number, n: number): number {
    return (n + align - 1) & ~(align - 1);
}

export function isNumber(T: Type): boolean {
    switch (T.kind) {
        case myType.u8:
        case myType.u16:
        case myType.u32:
        case myType.u64:
        case myType.i8:
        case myType.i16:
        case myType.i32:
        case myType.i64:
            return true;
        default: return false;
    }
}


export class Type {
    kind: myType;
    size: number;
    align: number;

    base: Type;
    arrayLen: number;
    members: { name: string, offset: number, type: Type, default: Expression | undefined }[];
    returnType: myType;

    enumvalues: { name: string, value: number }[];
    name: string;
    mod_id: number;

    newPointer(base: Type) {
        this.base = base;
        this.size = 8;
        this.align = 8;
        this.kind = myType.ptr;
        return this;
    }

    newArray(base: Type, len: number) {
        this.kind = myType.array;
        this.arrayLen = len;
        this.base = base;
        this.size = base.size * len;
        this.align = base.align;
        return this;
    }

    newStruct(name: string, mems: { name: string, datatype: Type, default: Expression | undefined }[]) {
        this.name = name;
        //this.mod_id = getPresentModule() as string;
        this.members = [];
        this.kind = myType.struct;
        var offt = 0;
        this.align = 0;
        mems.forEach((m) => {
            offt = alignTo(m.datatype.align, offt);
            this.members.push({ name: m.name, offset: offt, type: m.datatype, default: m.default });
            offt += m.datatype.size;

            if (this.align < m.datatype.align) {
                this.align = m.datatype.align;
            }
        });
        this.size = alignTo(this.align, offt);
        return this;
    }

    newUnion(name: string, mems: { name: string, datatype: Type, default: Expression | undefined }[]) {
        this.name = name;
        this.members = [];
        this.kind = myType.struct;
        var offt = 0;
        this.align = 0;
        var lagest = 0;
        mems.forEach((m) => {
            offt = alignTo(m.datatype.align, offt);
            //offt += m.datatype.size;

            if (this.align < m.datatype.align) {
                this.align = m.datatype.align;
            }

            if (lagest < m.datatype.size) {
                lagest = m.datatype.align;
            }
        });

        mems.forEach((m) => {
            this.members.push({ name: m.name, offset: offt, type: m.datatype, default: m.default });
        })

        this.size = alignTo(this.align, lagest);
        //console.error(offt);
        return this;
    }

    newEnum(name: string, mems: { name: string, value: number }[]) {
        this.mod_id = getPresentModule();
        this.kind = myType.enum;
        this.size = 4;
        this.align = 4;
        this.enumvalues = mems;
        this.name = name;
        return this;
    }

    newType(t: myType, size: number, align: number) {
        this.kind = t;
        this.size = size;
        this.align = align;
        return this;
    }

    constructor() {
        this.mod_id = 0;
    }
}

//console.error(myType.i64);
export var i64 = new Type().newType(myType.i64, 8, 8);
export var i32 = new Type().newType(myType.i32, 4, 4);
export var i16 = new Type().newType(myType.i16, 2, 2);
export var i8 = new Type().newType(myType.i8, 1, 1);
export var u64 = new Type().newType(myType.u64, 8, 8);
export var u32 = new Type().newType(myType.u32, 4, 4);
export var u16 = new Type().newType(myType.u16, 2, 2);
export var voidtype = new Type().newType(myType.void, 1, 1);
export var bool = new Type().newType(myType.bool, 1, 1);
export var u8 = new Type().newType(myType.u8, 1, 1);
export var f32 = new Type().newType(myType.f32, 4, 4);
export var enm = new Type().newType(myType.enum, 4, 4);
export var str = new Type().newStruct("str", [
    { name: "len", datatype: u64, default: undefined },
    { name: "ptr", datatype: new Type().newPointer(u8), default: undefined }
]);



function typeError(message: string, tok: Token | undefined) {
    if (tok) {
        console.error(message + ": [ line:" + tok.line + " col:" + tok.col + " ]");
    } else {
        console.error(message);
    }
    process.exit();
}

function generateCode(expr: Expression) {
    //console.error(expr);
    switch (expr.type) {
        case exprType.binary:
            //if(expr.left)
            break;
        case exprType.unary:
            break;
        case exprType.primary:
            break;
        case exprType.grouping:
            break;
        case exprType.assign:
            break;
        case exprType.identifier:
            break;
        case exprType.call:
            break;
        case exprType.string:
            break;
        default:
            throw new Error("Unexpected expression");
    }
}

function stmtTypeCheck(stmt: Statement) {
    switch (stmt.type) {
        case stmtType.exprstmt:
            break;
        case stmtType.vardeclstmt:
            break;
        case stmtType.block:
            //stmt.stmts.forEach((s, i) => { genStmt(s, i + labeloffset + 1); })
            break
        case stmtType.ifStmt:
            break;
        case stmtType.whileStmt:
            break;
        case stmtType.braek:
            break;
        case stmtType.contineu:
            break;
        case stmtType.ret:
            break;
        default: break;
    }
}

function fnTypeCheck(fns: Function[]) {

}