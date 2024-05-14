import { Variable, addGlobalString, fnType, isResolutionPass } from "./main";
import { tokenError } from "./parser";
import { Statement } from "./stmt";
import { Token } from "./token";
import { Type, f32, i32, i64, myType, nullptr, u64, u8, voidtype } from "./type";

export enum exprType {
    unary,
    binary_op,
    assigned_for_use,
    primary,
    grouping,
    identifier,
    deref,
    assign,
    call,
    string,
    number,
    get,
    address,
    slice_array,
    slice_slice,
    undefnd,
    varslice,
    assignIndex,
    assign_array_index,
    assign_slice_index,
    anon_string,
    fn_identifier,
    tmp_identifier,
    if_expr,
    range,
    case,
    null,
    cast,
    struct_literal,
    array_literal
}

export enum identifierType {
    struct,
    variable,
    func,
    array
    //structvar
}

export enum rangeType {
    array,
    slice,
    int
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

    prong:number;

    setters:{ field_offset:number,data_type:Type, value:Expression }[];

    isLiteral():boolean {
        return this.type === exprType.array_literal || this.type === exprType.struct_literal;
    }

    arrayLiteral(setters:{ field_offset:number,data_type:Type, value:Expression }[], data_type:Type) {
        this.datatype = data_type;
        this.setters = setters;
        this.type = exprType.array_literal;
        return this;
    }

    newIfExpr(cond:Expression, left:Expression, right:Expression){
        this.cond = cond;
        this.left = left;
        this.right = right;
        this.type = exprType.if_expr;
        this.datatype = left.datatype;
        return this
    }

    newStructLiteral(setters:{ field_offset:number,data_type:Type, value:Expression }[], data_type:Type) {
        this.type = exprType.struct_literal;
        this.datatype = data_type;
        this.setters = setters;
        return this;
    }

    newExprNull() {
        this.type = exprType.null;
        this.datatype = nullptr;
        return this;
    }

    newExprRange(left:Expression, right:Expression) {
        this.type = exprType.range;
        this.left = left;
        this.right = right;
        this.datatype = left.datatype;
        return this;
    }

    newExprAddress(left:Expression):Expression {
        this.type = exprType.address;
        this.left = left;
        this.datatype = new Type().newPointer(left.datatype);
        return this;
    }

    newAssignForUse(left:Expression, right:Expression):Expression {
        this.type = exprType.assigned_for_use;
        this.datatype = right.datatype;
        this.left = left;
        this.right = right;
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

    newExprSet(expr: Expression, assign:Expression, token:Token):Expression{
        if(!expr.datatype.eql(assign.datatype) && !isResolutionPass() && assign.type !== exprType.undefnd) {
            if(expr.datatype.isInteger() && assign.datatype.isInteger()) {} else {
                tokenError(`Expected ${expr.datatype.toString()} found ${assign.datatype.toString()}`, token);
            }
        }

        this.type = exprType.assign;
        this.left = expr;
        this.right = assign;
        this.datatype = expr.datatype;
        return this;
    }

    newExprBinary(op: Token, left: Expression, right:Expression):Expression{
        this.type = exprType.binary_op;
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
        this.datatype = expr.datatype;
        return this;
    }

    depointerize(id:Expression):Expression {
        return new Expression().newExprDeref(id);
    }

    newExprIdentifier(variable:Variable):Expression{
        this.type = exprType.identifier;
        this.variable = variable;
        if(variable) {
            this.datatype = variable.datatype;

            if(variable.pointerised) {
                return this.depointerize(this);
            }
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

    newExprAssign(left:Expression, val:Expression, token:Token):Expression{
        if(!left.datatype.eql(val.datatype) && !isResolutionPass() && val.type !== exprType.undefnd) {
            if(left.datatype.isInteger() && val.datatype.isInteger()) {} else {
                tokenError(`Expected ${left.datatype.toString()} found ${val.datatype.toString()}`, token);
            }
        }
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

    newExprCase(prong:number, left:Expression) {
        this.prong = prong;
        this.left = left;
        this.type = exprType.case;
        this.datatype = left.datatype;
        return this;
    }



    newExprSlideString(id:Expression):Expression{
        this.type = exprType.slice_array;
        this.left = new Expression().newExprNumber(0);
        this.right = new Expression().newExprNumber(id.bytes.length);
        this.id = id;
        this.datatype = new Type().newSlice(u8)
        this.datatype.kind = myType.slice;
        return this;
    }

    newExprSlice(defs:Expression[]) {
        this.type = exprType.varslice;
        this.defaults = defs;
        this.datatype = new Type().newSlice(u8);
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
        this.datatype = new Type().newSlice(u8);
        return this;
    }
    constructor(){}
}

