import { Expression } from "./expr";
import { Token } from "./token";
import { Type } from "./type";

export enum stmtType {
    vardeclstmt,
    exprstmt,
    print,
    varAccess,
    block,
    ifStmt,
    whileStmt,
    contineu,
    braek,
    externfn,
    nativefn,
    structdecl,
    ret
}

export class Statement {
    expr: Expression;
    type: stmtType;

    // var decl
    initializer?: Expression;
    name: string;
    offset: number;

    // block
    stmts: Statement[];

    //if
    cond: Expression;
    then: Statement;
    else_: Statement | undefined;

    // fn
    params: { name: string, datatype: Type }[]|undefined
    body: Statement


    // var
    datatype:Type;


    newVarstatement(name : string, initializer: Expression|undefined, offset: number, datatype:Type) :Statement {
        if(initializer === undefined) {
            var zero = new Expression().newExprNumber(0);
            this.initializer = zero;
            this.expr = zero;
        } else {
            this.initializer = initializer;
            this.expr = initializer;
        }
        this.initializer.datatype = datatype;
        this.datatype = datatype;
        //this.initializer.CustomType = custom;
        this.name = name;
        this.type = stmtType.vardeclstmt;
        this.offset = offset;
        return this;
    }

    newStructDeclStatement() :Statement {
        this.type = stmtType.structdecl;
        return this;
    }

    newReturnStatement(expr: Expression):Statement {
        this.expr = expr;
        this.type = stmtType.ret;
        return this;
    }

    newIfStatement(cond: Expression, then:Statement, else_:Statement | undefined) :Statement {
        this.type = stmtType.ifStmt;
        this.then = then;
        this.else_ = else_;
        this.cond = cond;
        return this;
    }

    newWhileStatement(cond: Expression, then:Statement) :Statement {
        this.type = stmtType.whileStmt;
        this.then = then;
        this.cond = cond;
        return this;
    }

    newBreakStatement(): Statement{
        this.type = stmtType.braek;
        return this;
    }

    newExternFnStatement(name: string, params: { name: string, datatype: Type }[]):Statement {
        this.name = name;
        this.params = params;
        return this;
    }

    newNativeFnStatement(name: string) :Statement {
        this.name = name;
        this.type = stmtType.nativefn;
        return this;
    }

    newContinueStatement():Statement {
        this.type = stmtType.contineu;
        return this;
    }

    newBlockStatement(stmts: Statement[]): Statement {
        this.stmts = stmts;
        this.type = stmtType.block;
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