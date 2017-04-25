export function stringToken(yytext) {
    switch (yytext) {
        case 'object':
            return 'OBJECT'
        case 'if':
            return 'IF'
        case 'else':
            return 'ELSE'
        case 'return':
            return 'RETURN'
        case 'while':
            return 'WHILE'
        case 'and':
            return 'AND'
        case 'or':
            return 'OR'
        case 'not':
            return 'NOT'
        case 'true':
            return 'TRUE'
        case 'false':
            return 'FALSE'
        case 'Bool':
            return 'BOOL'
        case 'Int':
            return 'INT'
        case 'Vec':
            return 'VEC'
        case 'and':
            return 'AND'
        case 'inherits':
            return 'INHERITS'
        case 'var':
            return 'VAR'
        case 'const':
            return 'CONST'
        case 'class':
            return 'CLASS'
        case 'mixin':
            return 'MIXIN'
        case 'package':
            return 'PACKAGE'
        case 'import':
            return 'IMPORT'
        case 'method':
            return 'METHOD'
        default:
            return 'ID'
    }
}

export const grammar = {
    "lex": {
        "rules": [
            ["\\s+", "/* skip whitespace */"],
            ["//[/ a-zA-Z0-9,:_()/><!=+.]*", "/* skip comment */"],
            ["$", "return 'EOF'"],
            ["[0-9]+", "return 'NUM'"],
            ["\\(", "return 'LPAREN'"],
            ["\\)", "return 'RPAREN'"],
            ["\\[", "return 'LBRACK'"],
            ["\\]", "return 'RBRACK'"],
            ["\\{", "return 'LBRACE'"],
            ["\\}", "return 'RBRACE'"],
            ["\\,", "return 'COMMA'"],
            ["\\.", "return 'DOT'"],
            ["\\=", "return 'ASSIGN'"],
            ["\\:", "return 'COLON'"],
            ["\\#", "return 'HASH'"],
            ["\\<=", "return 'LE'"],
            ["\\>=", "return 'GE'"],
            ["\\<", "return 'LT'"],
            ["\\>", "return 'GT'"],
            ["\\==", "return 'EQ'"],
            ["\\!=", "return 'NE'"],
            ["\\+", "return 'PLUS'"],
            ["\\-", "return 'MINUS'"],
            ["\\*", "return 'TIMES'"],
            ["\\/", "return 'DIV'"],
            ["\\;", "return 'SEPARATOR'"],
            ["[a-zA-Z][a-zA-Z0-9_]*", "return stringToken(yytext)"],
            ["^$", "return 'ε'"],
        ]
    },

    "tokens": "OBJECT, CLASS, MIXIN, PACKAGE, IMPORT, METHOD, BOOL, INT, VEC, TRUE, FALSE, AND, ELSE, FUN, IF, NOT, OR, RETURN, WHILE, INHERITS, VAR, LBRACE, RBRACE,SEPARATOR,.",

    "operators": [
        ["left", "TIMES", "DIV"],
        ["left", "PLUS", "MINUS"],
        ["nonassoc", "LE", "GE", "LT", "GT", "EQ", "NE"],
        ["left", "NOT"],
        ["left", "AND", "OR"]
    ],

    "bnf": {

        "expressions": [
            ["programa EOF", "return $1"]
        ],

        "programa": [
            ["imports", "$$ = new WFile($1, new Location(@1, @1))"],
            ["programa libraryElements", "$1.setElements($2)"]
        ],

        "imports":[
            ["", "$$ = [];"],
            ["import imports", "$2.push($1); $$ = $2"],
        ],

        "import":[
            ["IMPORT qualifiedName", "$$ = $2;"],
        ],

        "qualifiedName":[
            ["ID", "$$ = $1"],
            ["ID DOT qualifiedName", "$$ = $1+$2+$3"],
        ],
        
        "libraryElements": [
            ["", "$$ = [];"],
            ["libraryElement libraryElements", "$2.push($1); $$ = $2"],
        ],

        "libraryElement": [
            ["object", "$$ = $1;"],
            ["class", "$$ = $1;"],
            ["package", "$$ = $1;"],
            ["mixin", "$$ = $1;"]
        ],

        "class": [
            ["CLASS ID LPAREN RPAREN inherits LBRACE membersVar RBRACE", "$$ = new WClass($2, $5, $7, new Location(@1, @8))"],
            ["error", "$$ =new ASTError(this._$.error, 'class');"],
        ],

        "mixin": [
            ["MIXIN ID LBRACE membersVar RBRACE", "$$ = new Mixin($2, $4, new Location(@1, @5))"],
            ["error", "$$ =new ASTError(this._$.error, 'mixin');"],
        ],

        "object": [
            ["OBJECT ID inherits LBRACE membersVar RBRACE", "$$ = new NamedObject($2, $3, $5, new Location(@1, @6))"],
            ["error", "$$ =new ASTError(this._$.error, 'object');"],
        ],

        "package": [
            ["PACKAGE ID LBRACE package_elements RBRACE", "$$ = new Package($2, $4, new Location(@1, @5))"],
            ["error", "$$ =new ASTError(this._$.error, 'package');"]
        ],
        
        "package_elements": [
            ["", "$$ = []"],
            ["class package_elements", "$2.push($1); $$ = $2"],
            ["object package_elements", "$2.push($1); $$ = $2"],
        ],

        "param_list": [
            ["param", "$$ = [$1]"],
            ["param COMMA param_list", "$3.push($1); $$ = $3"]
        ],

        "param": [
            ["ID", "$$ = {type:'param', id: $1, first_line:@1.first_line, last_line:@1.last_line, first_column: @1.first_column, last_column:@1.last_column};"]
        ],

        "params": [
            ["", "$$ = [];"],
            ["param_list", "$$ = $1;"]
        ],

        "inherits": [
            ["", "$$ = new Parent('Object', [], new Location(@1, @1))"],
            ["INHERITS ID LPAREN params RPAREN ", "$$ = new Parent($2, $4, new Location(@1, @5));"],
        ],

        "membersVar": [
            ["", "$$ = new Members()"],
            ["member separator membersVar ", "$$ = $3.addMember($1)"],
        ],

        "separator": [
            ["", "$$ = $1"],
            ["SEPARATOR", "$$ = $1"]
        ],

        "ASSIGN?": [
            ["", "$$ = undefined"],
            ["ASSIGN", "$$ = $1"]
        ],

        "member": [
            ["variable", "$$ = $1"],
            ["method", "$$ = $1"],
        ],

        "variable": [
            ["writeable ID ASSIGN? expresion?", "$$ = new VarDeclaration($2, $4, $1, new Location(@1, @4))"],
            ["error", "$$ =new ASTError(this._$.error, 'Var');"]
        ],

        "method": [
            ["METHOD ID LPAREN params RPAREN LBRACE block RBRACE", "$$ = new Method($2, $4, $7, new Location(@1, @8))"]
        ],

        "block": [
            ["", "$$ = {}"]
        ],

        "writeable": [
            ["VAR", "$$ = $1"],
            ["CONST", "$$ = $1"],
        ],

        "lista_expresiones_no_vacia": [
            ["expresion", "$$ = new Arrays($1)"],
            ["expresion COMMA lista_expresiones_no_vacia", "$$ = $3.add($1);"]
        ],

        "lista_expresiones": [
            ["", "$$ = new Arrays();"],
            ["lista_expresiones_no_vacia", "$$ = $1;"]
        ],

        "expresion": [
            ["expresion_atomica", "$$ = $1"],
            ["expresion_aditiva", "$$ = $1"],
            ["expresion_multiplicativa", "$$ = $1"],
            ["expresion_logica", "$$ = $1"],
            ["expresion_relacional", "$$ = $1"],
        ],

        "expresion?": [
            ["", "$$ = undefined"],
            ["expresion", "$$ = $1"],
        ],

        "expresion_atomica": [
            ["ID", "$$ = new ExprVar($1, new Location(@1, @1))"],
            ["NUM", "$$ = new ExprConstNum(yytext, new Location(@1, @1))"],
            ["TRUE", "$$ = new ExprConstBool('True', new Location(@1, @1))"],
            ["FALSE", "$$ = new ExprConstBool('False', new Location(@1, @1))"],
            ["LPAREN expresion RPAREN", "$$ = $2"],
            ["error", "$$ =new ASTError(this._$.error, 'expresion_atomica');"],
        ],

        "expresion_multiplicativa": [
            ["expresion TIMES expresion", "$$ = new ExprMul($1,$3, new Location(@1, @3))"],
            ["expresion  expresion", "$$ = new ExprMul($1,$3, new Location(@1, @3))"],
            ["expresion DIV expresion", "$$ = new ExprDiv($1,$3, new Location(@1, @3))"],
        ],

        "expresion_aditiva": [
            ["expresion PLUS expresion", "$$ = new ExprAdd($1,$3, new Location(@1, @3))"],
            ["expresion MINUS expresion", "$$ = new ExprSub($1,$3, new Location(@1, @3))"],
            ["error", "$$ =new ASTError(this._$.error, 'expresion_aditiva');"],
        ],

        "expresion_relacional": [
            ["expresion LE expresion", "$$ = new ExprLe($1,$3, new Location(@1, @3))"],
            ["expresion GE expresion", "$$ = new ExprGe($1,$3, new Location(@1, @3))"],
            ["expresion LT expresion", "$$ = new ExprLt($1,$3, new Location(@1, @3))"],
            ["expresion GT expresion", "$$ = new ExprGt($1,$3, new Location(@1, @3))"],
            ["expresion EQ expresion", "$$ = new ExprEq($1,$3, new Location(@1, @3))"],
            ["expresion NE expresion", "$$ = new ExprNe($1,$3, new Location(@1, @3))"],
        ],

        "expresion_logica": [
            ["expresion AND expresion", "$$ = new ExprAnd($1, $3, new Location(@1, @3))"],
            ["expresion OR expresion", "$$ = new ExprOr($1, $3, new Location(@1, @3))"],
            ["NOT expresion ", "$$ = new ExprNot($2, new Location(@1, @2))"],
        ],


    }
};