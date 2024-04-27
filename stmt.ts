import { Expression, exprType, identifierType } from "./expr";
import { addGlobal, incLocalOffset } from "./main";
import { Token } from "./token";
import { Type, myType, u64, u8, voidtype } from "./type";

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
    ret,
    inline_asm
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
    params: { name: string, datatype: Type }[] | undefined
    body: Statement


    // var
    datatype: Type;
    is_global: boolean;

    // struct
    defaults: Expression[] | undefined;

    asm_lines :string[]

    // makeStructInitializer(off: number, datatype: Type): Expression[] {
    //     var exprid = new Expression().newExprIdentifier(
    //         "",
    //         off,
    //         datatype,
    //         identifierType.struct
    //     );
    // 
    //     var initExpr: Expression[] = [];
    //     for (let mem of datatype.members) {
    //         if (mem.default) {
    //             var expr = new Expression().newExprGet(mem.offset, exprid, mem.type);
    //             var set = new Expression().newExprSet(expr, mem.default);
    //             initExpr.push(set);
    //         }
    //     }
    //     return initExpr;
    // }

    // newStructVarStatement(offset: number, defaults: Expression[]) {
// 
    // }

    static makeSliceCopy(to: number, from: Expression): Expression[] {
        var xpr: Expression[] = [];
        xpr.push(
            new Expression().newExprSet(
                new Expression().newExprGet(
                    0,
                    new Expression().newExprIdentifier(
                        "", to, from.datatype, identifierType.variable
                    ),
                    u64
                ),
                new Expression().newExprGet(0, from, u64)
            )
        );

        xpr.push(
            new Expression().newExprSet(
                new Expression().newExprGet(
                    8,
                    new Expression().newExprIdentifier(
                        "", to, from.datatype, identifierType.variable
                    ),
                    new Type().newPointer(u8)
                ),
                new Expression().newExprGet(8, from, new Type().newPointer(u8))
            )
        );

        return xpr;
    }


    newVarstatement(name: string, initializer: Expression, offset: number, datatype: Type): Statement {
        this.initializer = initializer;
        this.type = stmtType.vardeclstmt;
        if (offset < 0) {
            addGlobal(name,
                initializer,
                datatype);
        }
        return this;
    }

    newStructDeclStatement(): Statement {
        this.type = stmtType.structdecl;
        return this;
    }

    newReturnStatement(expr: Expression): Statement {
        this.expr = expr;
        this.type = stmtType.ret;
        return this;
    }

    newIfStatement(cond: Expression, then: Statement, else_: Statement | undefined): Statement {
        this.type = stmtType.ifStmt;
        this.then = then;
        this.else_ = else_;
        this.cond = cond;
        return this;
    }

    newWhileStatement(cond: Expression, then: Statement): Statement {
        this.type = stmtType.whileStmt;
        this.then = then;
        this.cond = cond;
        return this;
    }

    newBreakStatement(): Statement {
        this.type = stmtType.braek;
        return this;
    }

    newExternFnStatement(name: string, params: { name: string, datatype: Type }[]): Statement {
        this.name = name;
        this.params = params;
        return this;
    }

    newNativeFnStatement(name: string): Statement {
        this.name = name;
        this.type = stmtType.nativefn;
        return this;
    }

    newContinueStatement(): Statement {
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

    static anonLargeReturnVar(expr:Expression, offset:number) {
        expr.params.splice(0, 0, new Expression().newExprAddress(
            new Expression().newExprIdentifier("", offset, expr.datatype, identifierType.variable)))
        return new Expression().newExprAssign(
            new Expression().newExprIdentifier("", offset, expr.datatype, identifierType.variable)
            , expr
        );
    }

    static anonSmallReturnVar(expr:Expression, offset:number) {
        return new Expression().newExprAssign(
            new Expression().newExprIdentifier("", offset, expr.datatype, identifierType.variable)
            , expr
        );
    }

    newExprStatement(expr: Expression): Statement {
        this.type = stmtType.exprstmt;

        if(expr.type === exprType.decl_anon_for_get) {
            this.expr = expr;
            return this;
        }

        if(expr.datatype.size > 8 && expr.type === exprType.call) {
            var offset = incLocalOffset("", expr.datatype);
            return new Statement().newVarstatement("", Statement.anonLargeReturnVar(expr, offset), offset, expr.datatype);
        }

        this.expr = expr;
        return this;
    }

    newVarAccessStatement(offset: number): Statement {
        this.offset = offset;
        this.type = stmtType.varAccess;
        return this;
    }

    newAsmStatement(lines: string[]){
        this.type = stmtType.inline_asm;
        this.asm_lines = lines;
        return this;
    }

    constructor() {
    }

}