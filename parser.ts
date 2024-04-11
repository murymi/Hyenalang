import { Token } from "./token";
import { tokenType } from "./token";
import { Expression, identifierType } from "./expr";
import { exprType } from "./expr";
import { Statement, stmtType } from "./stmt";
import { addGlobal, beginScope, endScope, fnType, getFn, getLocalOffset, inStruct, incLocalOffset, myType, pushFunction, pushStruct, resetCurrentFunction, resetCurrentStruct, setCurrentFuction, setCurrentStruct } from "./main";


export class Parser {
    tokens: Token[];
    current: number;
    
    match(types: tokenType[]): boolean {
        for (let T of types) {
            if (this.check(T)) {
                this.advance();
                return true;
            }
        }
        return false;
    }
    
    advance(): Token {
        if (this.moreTokens()) this.current++;
        return this.previous();
    }
    
    check(type: tokenType): boolean {
        if (!this.moreTokens()) return false;
        return this.peek().type === type;
    }
    
    moreTokens(): boolean { return this.peek().type != tokenType.eof; }
    
    peek(): Token { return this.tokens[this.current]; }
    
    previous(): Token { return this.tokens[this.current - 1]; }
    
    expect(type, name): Token {
        if (this.peek().type !== type) {
            this.tokenError("Expected " + name, this.peek());
        }
        return this.advance();
    }
    
    tokenError(message: string, token:Token):void {
        console.log(message+" - [ line: " + token.line + " col: " + token.col+" ]");
        process.exit();
    }
    
    primary(): Expression {
        if (this.match([tokenType.identifier])) {
            var offset = getLocalOffset(this.previous().value as string);
                if(offset === -1) {
                    //console.log("============Func name detected");
                    return new Expression().newExprIdentifier(this.previous().value as string, offset, myType.void, identifierType.func);
                }
                return new Expression().newExprIdentifier(this.previous().value as string, offset, myType.void, identifierType.variable);
            }
            
            if(this.match([tokenType.string])) {
            var expr = new Expression().newExprString(this.previous().value as string);
            //addGlobal()
            return expr;
        }

        if (this.match([tokenType.number])) {
            return new Expression().newExprNumber(this.previous().value as number);
        }

        if (this.match([tokenType.leftparen])) {
            var expr = this.expression();
            this.expect(tokenType.rightparen, ")");
            return new Expression().newExprGrouping(expr);

        }

        //console.log(this.peek());
        this.tokenError("unexpected token", this.peek());
        throw new Error("Unexpected token");
        
    }

    finishCall(callee: Expression):Expression {
        var args: Expression[] = [];
        if(!this.check(tokenType.rightparen)) {
            do {
                args.push(this.expression());
            } while (this.match([tokenType.comma]));
        }
        var fntok = this.expect(tokenType.rightparen,") after params");
        //console.log(callee.name);
        var fn = getFn(callee.name as string);
        var expr = new Expression().newExprCall(callee);;
        expr.callee = callee;
        if(fn.arity !== args.length) {
            this.tokenError(fn.name+" expects "+fn.arity+" args but "+args.length+" provided.", fntok);
        }
        expr.params = args;
        expr.fntype = fn.type;
        return expr;
    }

    call(): Expression {
        var expr = this.primary();

        // should return identifier

        if(this.match([tokenType.leftparen])) {
            //console.log("==================");
            expr = this.finishCall(expr);
        } else if (this.match([tokenType.dot])) {

        }

        return expr;
    }

    unary(): Expression {
        if (this.match([tokenType.minus])) {
            var operator = this.previous();
            var right = this.unary();
            return new Expression().newExprUnary(operator, right);
        }

        if (this.match([tokenType.andsand])) {
            var operator = this.previous();
            var depth = 1;
            while(this.match([tokenType.andsand])) {
                depth++;
            }
            var right = this.unary();
            //console.log(right.type === exprType.identifier);
            return new Expression().newExprDeref(right,depth);
        }

        return this.call();
    }

    factor(): Expression {
        var expr = this.unary();
        while (this.match([tokenType.divide, tokenType.multiply])) {
            var operator = this.previous();
            var right = this.unary();
            expr = new Expression().newExprBinary(operator, expr, right);
        }
        return expr;
    }

    term(): Expression {
        var expr = this.factor();

        while (this.match([tokenType.plus, tokenType.minus])) {
            var operator = this.previous();
            var right = this.factor();
            expr = new Expression().newExprBinary(operator, expr, right);
        }

        return expr;
    }

    comparisson(): Expression {
        var expr = this.term();

        while (this.match([tokenType.less, tokenType.greater])) {
            var operator = this.previous();
            var right = this.term();
            expr = new Expression().newExprBinary(operator, expr, right);
        }

        return expr;
    }

    assign(): Expression {
        var expr = this.comparisson();
        var equals:Token;
        if (this.match([tokenType.equal])) {
            equals = this.previous();
            var val = this.assign();
            if (expr.type === exprType.identifier) {
                var n = new Expression().newExprAssign(val, expr.offset);
                return n;
            }

            this.tokenError("Unexpected assignment", equals);
        }

        return expr;
    }

    expression(): Expression {
        return this.assign();
    }

    ExprStatement(): Statement {

        var expr = this.expression();
        this.expect(tokenType.semicolon, ";");
        var stmt = new Statement().newExprStatement(expr);
        return stmt;
    }

    printStatement(): Statement {
        var val = this.expression();
        this.expect(tokenType.semicolon, ";");
        return new Statement().newPrintStatement(val);
    }

    block(): Statement {
        beginScope();
        var stmts: Statement[] = [];
        while (!this.check(tokenType.rightbrace) && this.moreTokens()) {
            stmts.push(this.declaration());
        }
        this.expect(tokenType.rightbrace, "}");
        endScope();
        return new Statement().newBlockStatement(stmts);
    }

    re_turn() :Statement {
        if(this.match([tokenType.semicolon])) {
            var expr = new Expression().newExprNumber(0);
            expr.datatype = myType.void;
            return new Statement().newReturnStatement(expr);
        }

        var expr = this.expression();
        this.expect(tokenType.semicolon, ";");
        return new Statement().newReturnStatement(expr);
    }

    statement(): Statement {

        if (this.match([tokenType.contineu])) {
            this.expect(tokenType.semicolon, ";");
            return new Statement().newContinueStatement();
        }

        if (this.match([tokenType.braek])) {
            this.expect(tokenType.semicolon, ";");
            return new Statement().newBreakStatement();
        }

        if (this.match([tokenType.print])) {
            return this.printStatement();
        }

        if (this.match([tokenType.leftbrace])) {
            return this.block();
        }

        if(this.match([tokenType.return])) {
            return this.re_turn();
        }

        if (this.match([tokenType.if])) {
            this.expect(tokenType.leftparen, "( after if");
            var cond = this.expression();
            this.expect(tokenType.rightparen, ") after condition");
            var then = this.statement();
            var else_: Statement | undefined = undefined;
            if (this.match([tokenType.else])) {
                else_ = this.statement();
            }

            return new Statement().newIfStatement(cond, then, else_);
        }

        if (this.match([tokenType.while])) {
            this.expect(tokenType.leftparen, "( after while");
            var cond = this.expression();
            this.expect(tokenType.rightparen, ") after condition");
            var then = this.statement();

            return new Statement().newWhileStatement(cond, then);
        }

        return this.ExprStatement();
    }

    parseType() {
        //this.expect(tokenType.colon, ": after variable name");
        var is_ptr = false;
        if(this.match([tokenType.leftsquare])) {
            is_ptr = true;
            this.expect(tokenType.rightsquare, "] expected");
        }
        //console.log(this.peek());
        switch(this.advance().type) {
            case tokenType.u8:
                if(is_ptr) return myType.u8_ptr;
                return myType.u8;
            case tokenType.u16:
                if(is_ptr) return myType.u16_ptr;
                return myType.u16;
            case tokenType.u32:
                if(is_ptr) return myType.u32_ptr;
                return myType.u32;
            case tokenType.u64:
                if(is_ptr) return myType.u64_ptr;
                return myType.u64;
            case tokenType.i8:
                if(is_ptr) return myType.i8_ptr;
                return myType.i8;
            case tokenType.i16:
                if(is_ptr) return myType.i16_ptr;
                return myType.i16;
            case tokenType.i32:
                if(is_ptr) return myType.i32_ptr;
                return myType.i32;
            case tokenType.i64:
                if(is_ptr) return myType.i64_ptr;
                return myType.i64;
            case tokenType.void:
                if(is_ptr) return myType.void_ptr;
                return myType.void;
            case tokenType.identifier:
                //console.log("============");
                return myType.void_ptr;
            default:
                //throw new Error("unhandled case");
                break;
        }

        this.tokenError("Expected type", this.peek());
        return myType.void;
    }

    varDeclaration(): Statement {
        var name = this.expect(tokenType.identifier, "var name");
        var initializer: Expression | undefined;
        var type: any|undefined = undefined;

        if (this.match([tokenType.equal])) {
            initializer = this.expression();
            //this.expect(tokenType.semicolon, ";");
            if(initializer.type === exprType.string) {
                addGlobal(name.value as string, initializer.bytes as string, initializer.datatype);
                initializer.name = name.value as string;
            }
            type = initializer.datatype;
        } else if(this.match([tokenType.colon])){
            type = this.parseType()
            //console.log(type)
        }
        //console.log(inStruct());

        if(this.match([tokenType.equal])) {
            initializer = this.expression();

            if(initializer.type === exprType.string) {
                addGlobal(name.value as string, initializer.bytes as string, initializer.datatype);
                initializer.name = name.value as string;
            }
            type = initializer.datatype;
        }

        //if(type === undefined){
            //console.log(type);
            //this.tokenError("Expect type--", this.peek());
        //}

        this.expect(tokenType.semicolon, ";");
        var offset = incLocalOffset(name.value as string, 2);
        return new Statement().newVarstatement(name.value as string, initializer, offset, type);
    }

    externFuncDeclaration(): Statement {
        this.expect(tokenType.fn, "expected fn");
        var name = this.expect(tokenType.identifier, "fn name");
        this.expect(tokenType.leftparen, "( after fn name");
        var params: Token[] = [];
        if (!this.check(tokenType.rightparen)) {
            while (true) {
                var param = this.expect(tokenType.identifier, "param name");
                params.push(param);
                if (!this.check(tokenType.comma)) break;
                this.advance();
            }
        }
        this.expect(tokenType.rightparen, ") after params");
        var type = this.parseType();
        this.expect(tokenType.semicolon, ";");
        pushFunction(name.value as string, params, params.length, fnType.extern, [], type);
        return new Statement().newExternFnStatement(name.value as string, params);
    }

    nativeFuncDeclaration():Statement {
        var name = this.expect(tokenType.identifier, "fn name");
        this.expect(tokenType.leftparen, "( after fn name");
        var params: Token[] = [];
        if (!this.check(tokenType.rightparen)) {
            while (true) {
                var param = this.expect(tokenType.identifier, "param name");
                params.push(param);
                if (!this.check(tokenType.comma)) break;
                this.advance();
            }
        }
        this.expect(tokenType.rightparen, ") after params");
        var type = this.parseType();
        var currFn = pushFunction(name.value as string,params, params.length, fnType.native, [], type);
        this.expect(tokenType.leftbrace, "function body");
        setCurrentFuction(currFn);
        var body = this.block();
        resetCurrentFunction(body);
        return new Statement().newNativeFnStatement(name.value as string);
    }

    structDeclaration():Statement {
        var name = this.expect(tokenType.identifier, "expect struct name").value as string;
        //console.log("========");
        var currstruct = pushStruct(name);
        this.expect( tokenType.leftbrace, "Expect struct body");
        var strucmembers: Statement[] = [];
        setCurrentStruct(currstruct);
        while(!this.check(tokenType.rightbrace)) {
            var tok = this.peek();
            //console.log("==================");
            var member = this.varDeclaration();
            if(member.type !== stmtType.vardeclstmt) {
                this.tokenError("Expect var declararion", tok);
            }

            strucmembers.push(member);
        }


        this.expect(tokenType.rightbrace, "Expect } after struct body");
        resetCurrentStruct(strucmembers);
        //console.log(strucmembers);
        return new Statement().newStructDeclStatement();
    }

    declaration(): Statement {
        if (this.match([tokenType.var])) {
            return this.varDeclaration();
        }

        if (this.match([tokenType.extern])) {
            return this.externFuncDeclaration();
        }

        if(this.match([tokenType.fn])) {
            return this.nativeFuncDeclaration();
        }

        if(this.match([tokenType.struct])) {
            return this.structDeclaration();
        }

        return this.statement();
    }

    parse(): Statement[] {
        var stmts: Statement[] = [];
        while (this.moreTokens()) {
            stmts.push(this.declaration());
        }

        //console.log(stmts.length);
        return stmts;
    }

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.current = 0;
    }
}
