import { off } from "process";
import { fnType, myType } from "./main";
import { Token } from "./token";
import { tokenType } from "./token";

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
    set
}

export enum identifierType {
    struct,
    variable,
    func,
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
    datatype: myType;

    //bytes
    bytes: string;

    // addr
    depth: number;

    //fn id
    idtype: identifierType;

    // custom
    CustomType: any;

    // get
    loadaddr:boolean;

    newExprUnary(op: Token, right:Expression):Expression{
        this.type = exprType.unary;
        this.operator = op;
        this.right = right;
        this.datatype = right.datatype;
        return this;
    }

    newExprGet(offset:number, expr :Expression):Expression{
        this.type = exprType.get;
        this.left = expr;
        this.offset = offset;
        this.loadaddr = false;
        return this;
    }

    newExprSet(expr: Expression, assign:Expression):Expression{
        this.type = exprType.set;
        this.left = expr;
        this.right = assign;
        return this;
    }

    newExprBinary(op: Token, left: Expression, right:Expression):Expression{
        this.type = exprType.binary;
        this.left = left;
        this.right = right;
        this.datatype = left.datatype;
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

    newExprIdentifier(name: string,offset:number, datatype: myType, idtype:identifierType):Expression{
        this.type = exprType.identifier;
        this.datatype = datatype;
        this.offset = offset;
        this.name = name;
        this.idtype = idtype;
        return this;
    }

    newExprDeref(left:Expression, depth:number) :Expression {
        this.left = left;
        this.type = exprType.deref;
        this.depth = depth;
        return this;
    }

    newExprAddr(datatype: myType) :Expression {
        this.type = exprType.identifier;
        this.datatype = datatype;
        return this;
    }

    newExprAssign(val:Expression, offset:number):Expression{
        this.type = exprType.assign;
        this.offset = offset;
        this.left = val;
        return this;
    }

    newExprCall(callee:Expression):Expression{
        this.type = exprType.call;
        this.datatype = callee.datatype;
        return this;
    }

    newExprString(value:string):Expression{
        this.type = exprType.string;
        this.datatype = myType.u8_ptr;
        this.bytes = value;
        return this;
    }

    newExprNumber(val:number):Expression{
        this.type = exprType.number;
        this.val = val;
        return this;
    }

    constructor(){
    }
 
    // constructor(type: exprType, operator: Token | undefined, left: Expression | undefined, datatype:myType, right?: Expression) {
    //      if (type === exprType.primary) {
    //          this.val = left;
    //      }
    //  
    //      this.type = type;
    //      this.operator = operator;
    //      this.right = right;
    //      this.left = left;
    //      this.datatype = datatype;
    //  }
}


    // beginPrint() {
    //     this.print(this);
    // }
    // 
    // print(expr: Expression) {
    //     switch (expr.type) {
    //         case exprType.binary:
    //             this.print(expr.left as Expression);
    //             console.log(expr.operator?.value);
    //             this.print(expr.right as Expression)
    //             break;
    //         case exprType.unary:
    //             console.log("==unary==");
    //             //console.log(expr.operator);
    //             this.print(expr.left as Expression);
    //         case exprType.primary:
    //             console.log("val = " + expr.val);
    //             break;
    //         default:
    //             break;
    //     }
    // }
    // 
    // beginEvaluate(): number {
    //     return this.evaluate(this);
    // }
    // 
    // evaluate(expr: Expression): number {
    //     switch (expr.type) {
    //         case exprType.binary:
    // 
    //             switch (expr.operator?.type) {
    //                 case tokenType.divide:
    //                     return this.evaluate(expr.left as Expression) / this.evaluate(expr.right as Expression);
    //                 case tokenType.multiply:
    //                     return this.evaluate(expr.left as Expression) * this.evaluate(expr.right as Expression);
    // 
    //                 case tokenType.plus:
    //                     return this.evaluate(expr.left as Expression) + this.evaluate(expr.right as Expression);
    //                 case tokenType.minus:
    //                     return this.evaluate(expr.left as Expression) - this.evaluate(expr.right as Expression);
    //                 default:
    //                     throw new Error("unexpected operator");
    //             }
    //         case exprType.unary:
    //             if (expr.operator?.type == tokenType.minus) return -this.evaluate(expr.left as Expression);
    //             throw new Error("unexpected operator");
    //         case exprType.primary:
    //             return expr.val as number;
    //         case exprType.grouping:
    //             return this.evaluate(expr.left as Expression);
    //         default:
    //             throw new Error("Unexpected expression");
    //     }
    // }
