import { Expression } from "./expr";

export class Statement {
    expr: Expression;
    constructor (expr: Expression) {
        this.expr = expr;
    }
}