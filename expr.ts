import { addGlobalString, fnType } from "./main";
import { Token } from "./token";
import { Type, f32, i32, i64, myType, str, u64, u8, voidtype } from "./type";

export enum exprType {
    unary,
    binary,
    primary,
    grouping,
    identifier,
    deref,
    assign,
    call,
    string,
    number,
    get,
    //set,
    //arrayget,
    //arrayset,
    address,
    asld,
    ssld,
    undefnd,
    varslice
    //address_set
}

export enum identifierType {
    struct,
    variable,
    func,
    array
    //structvar
}

export class Expression {
    type: exprType;

    left: Expression | undefined;
    right?: Expression;
    operator: Token | undefined;

    // number
    val: number;

    // var
    offset: number;

    // call
    params: Expression[];
    callee: Expression;
    name: string;
    fntype: fnType;

    //
    datatype: Type;

    //bytes
    bytes: string;

    // addr
    depth: number;

    //fn id
    idtype: identifierType;

    // var
    labelinitialize:boolean;
    label: number;

    // var
    is_glob:boolean;

    //struct
    defaults:Expression[]

    //slice
    id:Expression

    newExprAddressSet(left:Expression, right:Expression) {
        this.left = left;// a deref
        this.right = right;
        this.type = exprType.assign;
        this.datatype = left.datatype;
        return this;
    }

    newExprAddress(left:Expression):Expression {
        this.type = exprType.address;
        this.left = left;
        this.datatype = new Type().newPointer(left.datatype);
        return this;
    }

    newExprUnary(op: Token, right:Expression):Expression{
        this.type = exprType.unary;
        this.operator = op;
        this.right = right;
        this.datatype = right.datatype;
        return this;
    }

    newExprGet(offset:number, expr :Expression, datatype:Type):Expression{
        this.type = exprType.get;
        this.left = expr;
        this.offset = offset;
        //this.left.offset = offset;
        this.datatype = datatype;
        return this;
    }

    newExprSet(expr: Expression, assign:Expression):Expression{
        this.type = exprType.assign;
        this.left = expr;
        this.right = assign;
        this.datatype = expr.datatype;
        return this;
    }

    newExprBinary(op: Token, left: Expression, right:Expression):Expression{
        this.type = exprType.binary;
        this.left = left;
        this.right = right;
        this.datatype = left.datatype;
        this.operator = op;
        return this;
    }

    newExprPrimary():Expression{
        this.type = exprType.primary;
        return this;
    }

    newExprGrouping(expr: Expression):Expression{
        this.left = expr;
        this.type = exprType.grouping;
        return this;
    }

    newExprIdentifier(name: string,offset:number, datatype: Type, idtype:identifierType):Expression{
        this.type = exprType.identifier;
        this.datatype = datatype;
        this.datatype.kind = datatype.kind;
        this.offset = offset;
        this.name = name;
        this.idtype = idtype;
        return this;
    }

    newExprDeref(left:Expression) :Expression {
        this.left = left;
        this.type = exprType.deref;
        this.datatype = left.datatype.base;
        return this;
    }

    newExprAssign(left:Expression, val:Expression):Expression{
        this.type = exprType.assign;
        this.right = val;
        this.left = left;
        this.datatype = left.datatype
        return this;
    }

    newExprCall(callee:Expression, datatype:Type):Expression{
        this.type = exprType.call;
        this.callee = callee;
        this.datatype = datatype;
        return this;
    }

    newExprNumber(val:number, isfloat?:boolean):Expression{
        this.type = exprType.number;
        this.val = val;
        this.datatype = i32;
        if(isfloat){
            if(isfloat) {
                this.datatype = f32;
            }
        }
        return this;
    }

    newExprBoolean(val:number):Expression{
        this.type = exprType.number;
        this.val = val;
        this.datatype = u8;
        return this;
    }

    newExprString(val:string):Expression{
        this.type = exprType.string;
        this.bytes = val;
        //this.datatype = new Type().newPointer(u8);
        this.datatype = new Type().newStruct([
             { name: "len", datatype: u64, default: undefined },
             { name: "ptr", datatype: new Type().newPointer(u8), default: undefined }
         ])
        this.datatype.kind = myType.string;
        this.label = addGlobalString(val);
        this.labelinitialize = true;
        return this;
    }

    newExprSlice(defs:Expression[]) {
        this.type = exprType.varslice;
        this.defaults = defs;
        this.datatype = str;
        this.datatype.kind = myType.slice;
        return this;
    }

    newExprSlideArray(expr:Expression, begin:Expression, end:Expression) {
        this.type = exprType.ssld;
        this.left = begin;
        this.right = end;
        this.id = expr;
        this.datatype = new Type().newStruct([
            { name: "len", datatype: u64, default: undefined },
            { name: "ptr", datatype: new Type().newPointer(expr.datatype.members[1].type.base), default: undefined }
        ])
        //console.log(expr.datatype);
        //this.datatype.base = new Type().newPointer(expr.datatype.members[1].type.base);
        this.datatype.kind = myType.slice;
        return this;
    }

    newExprUndefined() {
        this.type = exprType.undefnd;
        this.datatype = voidtype;
        return this;
    }

    constructor(){
    }
 
}

