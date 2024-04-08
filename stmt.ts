import { Expression, exprType } from "./expr";

export enum stmtType {
    vardeclstmt,
    exprstmt,
    print,
    varAccess
}

export class Statement {
    expr: Expression;
    type: stmtType;

    // var decl
    initializer?: Expression;
    name: string;
    offset: number;

    newVarstatement(name : string, initializer: Expression|undefined, offset: number) :Statement {
        if(initializer === undefined) {
            var zero = new Expression(exprType.primary, undefined, 0);
            this.initializer = zero;
            this.expr = zero;
        } else {
            this.initializer = initializer;
            this.expr = initializer;
        }
        this.name = name;
        this.type = stmtType.vardeclstmt;
        this.offset = offset;
        return this;
    }

    newPrintStatement(expr: Expression): Statement {
        this.expr = expr;
        this.type = stmtType.print;
        return this;
    }

    newExprStatement(expr: Expression):Statement {
        this.type = stmtType.exprstmt;
        this.expr = expr;
        return this;
    }

    newVarAccessStatement(offset: number): Statement {
        this.offset = offset;
        this.type = stmtType.varAccess;
        return this;
    }

    constructor () {
    }

}