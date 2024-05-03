import { Expression, exprType } from "./expr";
import { Variable, incLocalOffset } from "./main";
import { Type, u64 } from "./type";

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
    inline_asm,
    module,
    switch
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

    //switch
    prongs:Statement[];
    cases:Expression[];

    asm_lines :string[]

    variable:Variable;
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

    // static makeSliceCopy(to: number, from: Expression): Expression[] {
    //     var xpr: Expression[] = [];
    //     xpr.push(
    //         new Expression().newExprSet(
    //             new Expression().newExprGet(
    //                 0,
    //                 new Expression().newExprIdentifier(
    //                     "", to, from.datatype),
    //                 u64
    //             ),
    //             new Expression().newExprGet(0, from, u64)
    //         )
    //     );
// 
    //     xpr.push(
    //         new Expression().newExprSet(
    //             new Expression().newExprGet(
    //                 8,
    //                 new Expression().newExprIdentifier(
    //                     "", to, from.datatype),
    //                 new Type().newPointer(u8)
    //             ),
    //             new Expression().newExprGet(8, from, new Type().newPointer(u8))
    //         )
    //     );
// 
    //     return xpr;
    // }

    newSwitch(cond:Expression,cases:Expression[], prongs:Statement[], else_:Statement) {
        this.cond = cond;
        this.cases = cases;
        this.prongs = prongs;
        this.type = stmtType.switch;
        this.else_ = else_;
        return this;
    }

    newVarstatement(initializer: Expression): Statement {
        this.initializer = initializer;
        this.type = stmtType.vardeclstmt;
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

    //newPrintStatement(expr: Expression): Statement {
    //    this.expr = expr;
    //    this.type = stmtType.print;
    //    return this;
    //}

    static anonLargeReturnVar(expr:Expression, variable:Variable) {
        expr.params.splice(0, 0, new Expression().newExprAddress(
            new Expression().newExprIdentifier(variable)))
        return new Expression().newExprAssign(
            new Expression().newExprIdentifier(variable)
            , expr
        );
    }

    static anonSmallReturnVar(expr:Expression, variable:Variable) {
        return new Expression().newExprAssign(
            new Expression().newExprIdentifier(variable)
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
            var variable = incLocalOffset("", expr.datatype);
            return new Statement().newVarstatement(Statement.anonLargeReturnVar(expr, variable));
        }

        this.expr = expr;
        return this;
    }

    // newVarAccessStatement(offset: number): Statement {
    //     this.offset = offset;
    //     this.type = stmtType.varAccess;
    //     this.datatype = u64;
    //     return this;
    // }

    newAsmStatement(lines: string[]){
        this.type = stmtType.inline_asm;
        this.asm_lines = lines;
        this.datatype = u64;
        return this;
    }

    newModule(name:string,statements:Statement[]):Statement {
        this.type = stmtType.module;
        this.stmts = statements;
        return this;
    }

    constructor() {
    }

}