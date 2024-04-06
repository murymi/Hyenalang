enum exprType{
    unary,
    binary
}

class Expression {
    type: exprType;

    left: Expression;
    right: Expression;
    operator: Token;

    constructor(type) {

    }
}