import { Variable, addGlobalString, fnType } from "./main";
import { Statement } from "./stmt";
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
    slice_array,
    slice_slice,
    undefnd,
    varslice,
    assignIndex,
    //address_set
    assign_array_index,
    assign_slice_index,
    deref_array_index,
    deref_slice_index,
    anon_string,
    decl_anon_for_get,
    fn_identifier,
    tmp_identifier,
    if_expr
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

    //struct
    offset:number;

    // var
    num: number;

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

    variable:Variable

    cond:Expression;

    newIfExpr(cond:Expression, left:Expression, right:Expression){
        this.cond = cond;
        this.left = left;
        this.right = right;
        this.type = exprType.if_expr;
        this.datatype = left.datatype;
        return this
    }

    newExprAddressSet(left:Expression, right:Expression) {
        this.left = left;// a deref
        this.right = right;
        this.type = exprType.assignIndex;
        //console.error("*****************************************");
        this.datatype = left.datatype;
        return this;
    }

    newExprAssignArrayIndex(left:Expression, right:Expression) {
        this.left = left;
        this.right = right;
        this.type = exprType.assign_array_index;
        this.datatype = left.datatype
        return this;
    }

    newExprAssignSliceIndex(left:Expression, right:Expression) {
        this.left = left;
        this.right = right;
        this.type = exprType.assign_slice_index;
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

    newExprIdentifier(variable:Variable):Expression{
        this.type = exprType.identifier;
        this.variable = variable;
        if(variable) {
            this.datatype = variable.datatype;
        }
        return this;
    }


    newExprFnIdentifier(name: string,datatype: Type):Expression{
        this.type = exprType.fn_identifier;
        this.datatype = datatype;
        this.datatype.kind = datatype.kind;
        this.name = name;
        return this;
    }

    newExprTemplateIdentifier(name: string):Expression{
        this.type = exprType.tmp_identifier;
        this.name = name;
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
        this.datatype = left.datatype;
        return this;
    }

    newExprCall(callee:Expression, datatype:Type, args:Expression[], fnT:fnType):Expression{
        this.type = exprType.call;
        this.callee = callee;
        this.datatype = datatype;
        this.params = args;
        this.fntype = fnT;
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

    newExprString(strng:string):Expression {
        var label = addGlobalString(strng);
        this.label = label;
        this.bytes = strng;
        this.type = exprType.string;
        this.datatype = new Type().newSlice(u8);
        return this;
    }

    newExprSlideString(id:Expression):Expression{
        this.type = exprType.slice_array;
        this.left = new Expression().newExprNumber(0);
        this.right = new Expression().newExprNumber(id.bytes.length);
        this.id = id;
        //this.datatype = new Type().newPointer(u8);
        this.datatype = new Type().newStruct("slice",[
             { name: "len", datatype: u64, default: undefined },
             { name: "ptr", datatype: new Type().newPointer(u8), default: undefined }
         ])
        this.datatype.kind = myType.slice;
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
        this.type = exprType.slice_array;
        this.left = begin;
        this.right = end;
        this.id = expr;
        this.datatype = new Type().newSlice(expr.datatype.base);
        return this;
    }

    newExprSlideSlice(expr:Expression, begin:Expression, end:Expression) {
        this.type = exprType.slice_slice;
        this.left = begin;
        this.right = end;
        this.id = expr;
        this.datatype = new Type().newSlice(expr.datatype.base);
        this.datatype.kind = myType.slice;
        return this;
    }

    newExprUndefined() {
        this.type = exprType.undefnd;
        this.datatype = voidtype;
        return this;
    }

    newExprAnonString(offset:number) {
        this.type = exprType.anon_string;
        this.offset = offset;
        this.datatype = str;
        return this;
    }

    newExprDeclAnonForGet(left:Expression, right:Expression):Expression {
        this.left = left;
        this.right = right;
        this.datatype = right.datatype;
        this.type = exprType.decl_anon_for_get;
        return this;
    }

    

    constructor(){
    }
 
}

