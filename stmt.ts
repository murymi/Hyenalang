import { Expression } from "./expr";

export enum stmtType {
    vardeclstmt,
    exprstmt
}

export class Statement {
    expr: Expression;
    type: stmtType;

    // var decl
    initializer?: Expression;
    name: string;
    offset: number;

    newVarstatement(name : string, initializer: Expression, offset: number) :Statement {
        this.initializer = initializer;
        this.expr = initializer;
        this.name = name;
        this.type = stmtType.vardeclstmt;
        this.offset = offset;
        return this;
    }

    newExprStatement(expr: Expression):Statement {
        this.type = stmtType.exprstmt;
        this.expr = expr;
        return this;
    }

    constructor () {
    }

}