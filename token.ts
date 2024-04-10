//import process from "process";

export enum tokenType {
    plus,
    minus,
    multiply,
    divide,
    number,
    undef,
    leftparen,
    rightparen,
    semicolon,
    identifier,
    var,
    equal,
    print,
    leftbrace,
    rightbrace,
    bang,
    greater,
    less,
    if,
    else,
    while,
    braek,
    contineu,
    extern,
    fn,
    comma,
    string,
    eof
};

export class Token {
    type: tokenType;
    value: string | number;
    line: number;
    col:number;

    constructor(type: tokenType, value: string | number, line:number, col:number) {
        this.type = type;
        this.value = value;
        this.col = col;
        this.line = line;
    }
}

export class Lexer {
    current: number;
    text: string;
    line: number;
    col:number;

    constructor(text: string) {
        this.current = 0;
        this.text = text;
    }

    expect(char: string) {
        if(this.peek() === char){
            this.advance();
            return;
        }

        throw new Error("Expected "+char);
    }

    peek() {
        if (!this.moreTokens()) return "eof";
        return this.text[this.current];
    }

    advance() {
        this.current++;
        this.col++;
        return this.text[this.current - 1];
    }

    moreTokens() {
        return this.current < this.text.length;
    }

    isSpace(text: string): boolean {
        if (text == ' ' || text === '\t' || text == '\n') return true;
        return false;
    }

    isAlpha(text: string): boolean {
        return /^[a-z]$/.test(text);
    }

    isNumber(text: string): boolean {
        return /^[0-9]$/.test(text);
    }

    number(): number {
        var start = this.current;
        while (this.moreTokens()) {
            if (!this.isNumber(this.peek())) break;
            this.advance();
        }
        var str = this.text.substring(start, this.current);
        return parseFloat(str);
    }

    readString():Token {
        this.advance();
        var start = this.current;
        while(this.moreTokens() && this.peek() !== '"' && this.peek() !== '\n') {
            this.advance();
        }
        this.expect('"');
        var value = this.text.substring(start, this.current-1);
        return new Token(tokenType.string, value, this.line, this.col);
    }

    identifier(): Token {
        var start = this.current;
        while (this.moreTokens()) {
            if (!this.isAlpha(this.peek())) break;
            this.advance();
        }
        var str = this.text.substring(start, this.current);
        if (str === "var") return new Token(tokenType.var, str, this.line, this.col);
        if (str === "print") return new Token(tokenType.print, str, this.line, this.col);
        if (str === "if") return new Token(tokenType.if, str, this.line, this.col);
        if (str === "else") return new Token(tokenType.else, str, this.line, this.col);
        if (str === "while") return new Token(tokenType.while, str, this.line, this.col);
        if (str === "break") return new Token(tokenType.braek, str, this.line, this.col);
        if(str === "continue") return new Token(tokenType.contineu, str, this.line, this.col);
        if(str === "extern") return new Token(tokenType.extern, str, this.line, this.col);
        if(str === "fn") return new Token(tokenType.fn, str, this.line, this.col)

        return new Token(tokenType.identifier, str, this.line, this.col);
    }

    tokenError(message:string): void {
        console.log(message+" - [ line: " + this.line + " col: " + this.col+" ]");
        process.exit();
    }



    lex(): Token[] {
        var tokens: Token[] = [];
        this.line = 0;
        this.col = 1;

        while (true) {
            let char = this.peek();

            //console.log("token => ", char);
            if (this.isNumber(char)) {
                tokens.push(new Token(tokenType.number, this.number(), this.line, this.col));
            } else if (this.isSpace(char)) {
                if(this.advance() === '\n') { 
                    this.col = 1; this.line++; 
                } else this.col++;
                continue;
            }
            else if (char === "+") {
                tokens.push(new Token(tokenType.plus, "+", this.line, this.col));
                this.advance();
            } else if (char === "-") {
                tokens.push(new Token(tokenType.minus, "-", this.line, this.col));
                this.advance();
            } else if (char === "/") {
                tokens.push(new Token(tokenType.divide, "/", this.line, this.col));
                this.advance();
            } else if (char === "*") {
                tokens.push(new Token(tokenType.multiply, "*", this.line, this.col));
                this.advance();
            }  else if (char === ",") {
                tokens.push(new Token(tokenType.comma, ",", this.line, this.col));
                this.advance();
            }else if (char === '(') {
                tokens.push(new Token(tokenType.leftparen, "(", this.line, this.col));
                this.advance();
            } else if (char === ';') {
                tokens.push(new Token(tokenType.semicolon, ";", this.line, this.col));
                this.advance();
            } else if (char === '>') {
                tokens.push(new Token(tokenType.greater, ">", this.line, this.col));
                this.advance();
            } else if (char === '!') {
                tokens.push(new Token(tokenType.bang, "!", this.line, this.col));
                this.advance();
            } else if (char === '<') {
                tokens.push(new Token(tokenType.less, "<", this.line, this.col));
                this.advance();
            } else if (char === ')') {
                tokens.push(new Token(tokenType.rightparen, ")",this.line, this.col));
                this.advance();
            } else if (char === '}') {
                tokens.push(new Token(tokenType.rightbrace, "}", this.line, this.col));
                this.advance();
            } else if (char === '{') {
                tokens.push(new Token(tokenType.leftbrace, "{", this.line, this.col));
                this.advance();
            } else if (char === '=') {
                tokens.push(new Token(tokenType.equal, "=", this.line, this.col));
                this.advance();
            } else if (char === '"') {
               tokens.push(this.readString());
            } else if (this.isAlpha(char)) {
                tokens.push(this.identifier());
            } else if (char === "eof") {
                tokens.push(new Token(tokenType.eof, "eof", this.line, this.col));
                break;
            } else {
                //console.log(char);
                this.tokenError("unexpected token "+ char);
            }

        }

        return tokens;
    }
}