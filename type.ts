import { Expression, exprType } from "./expr";
import { Function } from "./main";
import { Statement, stmtType } from "./stmt";
import { Token } from "./token";

function typeError(message:string, tok: Token|undefined) {
    if(tok) {
        console.log(message+": [ line:"+tok.line + " col:"+ tok.col+" ]");
    } else {
        console.log(message);
    }
    process.exit();
}

function generateCode(expr: Expression) {
    //console.log(expr);
    switch (expr.type) {
        case exprType.binary:
            //if(expr.left)
            break;
        case exprType.unary:
            break;
        case exprType.primary:
            break;
        case exprType.grouping:
            break;
        case exprType.assign:
            break;
        case exprType.identifier:
            break;
        case exprType.call:
            break;
        case exprType.string:
            break;
        default:
            throw new Error("Unexpected expression");
    }
}

function stmtTypeCheck(stmt: Statement) {
    switch (stmt.type) {
        case stmtType.exprstmt:
            break;
        case stmtType.vardeclstmt:
            break;
        case stmtType.block:
            //stmt.stmts.forEach((s, i) => { genStmt(s, i + labeloffset + 1); })
            break
        case stmtType.ifStmt:
            break;
        case stmtType.whileStmt:
            break;
        case stmtType.braek:
            break;
        case stmtType.contineu:
            break;
        case stmtType.ret:
            break;
        default: break;
    }
}

function fnTypeCheck(fns:Function[]) {
    
}