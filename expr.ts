import { fnType } from "./main";
import { Token } from "./token";
import { tokenType } from "./token";

export enum exprType {
    unary,
    binary,
    primary,
    grouping,
    identifier,
    assign,
    call,
    string
}

export class Expression {
    type: exprType;

    left: Expression | string | number;
    right?: Expression;
    operator: Token | undefined;
    val: Expression | string | number;

    // var
    offset: number;

    // call
    params: Expression[];
    callee: Expression;
    name: string;
    fntype: fnType;
 
    constructor(type: exprType, operator: Token | undefined, left: Expression | string | number, right?: Expression) {
         if (type === exprType.primary) {
             this.val = left;
         }
     
         this.type = type;
         this.operator = operator;
         this.right = right;
         this.left = left;
     }
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
