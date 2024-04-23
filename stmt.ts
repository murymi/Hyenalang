import { Expression, identifierType } from "./expr";
import { addGlobal } from "./main";
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
    params: { name: string, datatype: Type }[] | undefined
    body: Statement


    // var
    datatype: Type;
    is_global: boolean;

    // struct
    defaults: Expression[] | undefined

    makeStructInitializer(off: number, datatype: Type): Expression[] {
        var exprid = new Expression().newExprIdentifier(
            "",
            off,
            datatype,
            identifierType.struct
        );

        var initExpr: Expression[] = [];
        for (let mem of datatype.members) {
            if (mem.default) {
                var expr = new Expression().newExprGet(mem.offset, exprid, mem.type);
                var set = new Expression().newExprSet(expr, mem.default);
                initExpr.push(set);
            }
        }
        return initExpr;
    }

    newStructVarStatement(offset: number, defaults: Expression[]) {

    }

    makeStringInitializerFromPtr(off: number, string: Expression, datatype: Type) {
        var exprid = new Expression().newExprIdentifier(
            "",
            off,
            datatype,
            identifierType.struct
        );

        var initExpr: Expression[] = [];
        var expr = new Expression().newExprGet(datatype.members[1].offset, exprid, datatype.members[1].type);
        var set = new Expression().newExprSet(expr, string);
        initExpr.push(set);

        var expr2 = new Expression().newExprGet(datatype.members[0].offset, exprid, datatype.members[0].type);
        var set2 = new Expression().newExprSet(expr2, new Expression().newExprNumber(string.bytes.length, false));
        initExpr.push(set2);

        return initExpr;
    }

    newStringVarStatement(name: string, offset: number, str: Expression,is_global: boolean) {
        var datatype = new Type().newStruct([
            { name: "len", datatype: u64, default: undefined },
            { name: "ptr", datatype: new Type().newPointer(u8), default: undefined }
        ]);
        this.is_global = is_global;
        this.defaults = this.makeStringInitializerFromPtr(offset, str, datatype);
        this.type = stmtType.vardeclstmt;
        this.offset = offset;
        this.expr = new Expression();
        this.expr.datatype = datatype;
        this.expr.datatype.kind = myType.slice;
        if (is_global) {
            addGlobal(name, str, datatype);
        }
        return this;
    }

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


    newVarstatement(name: string, initializer: Expression | undefined, offset: number, datatype: Type, is_global: boolean): Statement {
        if (initializer === undefined) {
            if (datatype.kind === myType.slice || datatype.kind === myType.array) {
                this.defaults = this.makeStructInitializer(offset, datatype);
                //console.error(this.defaults);
                this.expr = new Expression();
                this.expr.datatype = voidtype;
                this.expr.datatype.kind = myType.slice;
            } else if (datatype.kind === myType.struct) {
                this.expr = new Expression();
                this.expr.datatype = voidtype;
                this.expr.datatype.kind = myType.struct;
            } else {
                var zero = new Expression().newExprNumber(0);
                this.initializer = zero;
                this.expr = zero;
                this.initializer.datatype = datatype;
            }
        } else {
            if (datatype.kind === myType.slice) {
                // this.defaults = Statement.makeSliceCopy(offset, initializer);
                // this.expr = new Expression();
                // this.expr.datatype = voidtype;
                // this.expr.datatype.kind = myType.slice;
                this.initializer = initializer;
                this.expr = initializer;
            } else {
                this.initializer = initializer;
                this.expr = initializer;
                this.initializer.datatype = datatype;
            }
        }
        this.is_global = is_global;
        this.datatype = datatype;
        //this.initializer.CustomType = custom;
        this.name = name;
        this.type = stmtType.vardeclstmt;
        this.offset = offset;
        if (is_global) {
            addGlobal(name,
                datatype.kind === myType.array ? new Expression() : undefined,
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

    newExprStatement(expr: Expression): Statement {
        this.type = stmtType.exprstmt;
        this.expr = expr;
        return this;
    }

    newVarAccessStatement(offset: number): Statement {
        this.offset = offset;
        this.type = stmtType.varAccess;
        return this;
    }

    constructor() {
    }

}