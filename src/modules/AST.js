import _ from 'underscore'
import errorText from './errors.json'

const ENTER = "\n"

var tabFunction = function() {
    var tab = new Array(2).join('  ')
    return tab + this.toString().trim().split(ENTER).join(ENTER + tab) + ENTER
}

String.prototype.tab = tabFunction
Number.prototype.tab = tabFunction
Boolean.prototype.tab = tabFunction

Array.prototype.serializeElements = function() {
    if (this.length > 0) {
        return this.map(element => element.toString()).join("")
    }
    return ""
}

class Location {
    constructor(start, end) {
        this.first_line = start.first_line
        this.last_line = start.last_line
        this.first_column = end.first_column
        this.last_column = end.last_column
    }

    toString() {
        return JSON.stringify(this)
    }
}

class WFile {
    constructor(imports, location) {
        this.imports = imports
        this.location = location
        this.elements = []
    }

    setElements(elements) {
        this.elements = elements
        return this
    }

    hasError() {
        return this.error || this.elements.some(element => element.hasError())
    }

    toString() {
        return "( WFile" + 
            ENTER + this.imports.map(element => "import " + element).join("\n") +
            ENTER + this.elements.serializeElements() +
        ")"
    }

    errors() {
        let errors = _.flatten(this.elements.map(element => element.errors()))
        if (this.error) {
            errors.push(this.error)
        }
        return errors
    }
}

class WClass {
    constructor(name, parent, members, location) {
        this.name = name
        this.parent = parent
        this.members = members
        this.location = location
    }

    hasError() {
        return this.error || this.parent.hasError() || this.members.hasError()
    }

    errors() {
        let errors = this.members.errors().concat(this.parent.errors())
        if (this.error) {
            errors.push(this.error)
        }
        return errors
    }

    toString() {
        var rep = "( " + this.constructor.name +": " + this.name.tab() +
            ENTER + this.parent.toString() +
            ENTER + this.members.toString() +
            ")"
        return rep.tab()
    }
}

class Package {
    constructor(name, elements, location) {
        this.name = name
        this.elements = elements
        this.location = location
    }

    hasError() {
        return this.error || this.elements.some(element => element.hasError())
    }

    errors() {
        let errors = _.flatten(this.elements.map(element => element.errors()))
        if (this.error) {
            errors.push(this.error)
        }
        return errors
    }

    toString() {
        var rep = "( Package: " + this.name.tab() +
            ENTER + this.elements.serializeElements() +
            ")"
        return rep.tab()
    }
}

class NamedObject extends WClass {}

class Mixin {
    constructor(name, members, location) {
        this.name = name
        this.members = members
        this.location = location
    }

    hasError() {
        return this.error || this.members.hasError()
    }

    errors() {
        let errors = this.members.errors().concat(this.parent.errors())
        if (this.error) {
            errors.push(this.error)
        }
        return errors
    }

    toString() {
        var rep = "( Mixin: " + this.name.tab() +
            ENTER + this.members.toString() +
            ")"
        return rep.tab()
    }
}



class Members {
    constructor() {
        this.members = []
    }

    addMember(member) {
        this.members.push(member)
        return this
    }

    hasError() {
        return this.error || this.members.some(member => member.hasError())
    }

    errors() {
        let errors = _.flatten(this.members.map(member => member.errors()))
        if (this.error) {
            errors.push(this.error)
        }
        return errors
    }

    toString() {
        return this.members.serializeElements()
    }
}

class ASTError {

    constructor(err, ast) {
        this.ast = ast
        this.location = err.hash.loc
        this.expected = err.hash.expected
        this.token = err.hash.token
        err.used = true
        this.message = errorText[this.ast][this.expected[0].replace('"', '').replace('"', '')]
        if(!this.message)
            this.message = err.hash.errStr
    }

    hasError() {
        return true
    }

    errors() {
        return [this]
    }

    toString() {
        return this.message
    }

    defaultToString() {
        var rep = "( ASTError" + ENTER +
            "in: " + this.ast + ENTER +
            "expected: " + this.expected + ENTER +
            "token: " + this.token + ENTER +
            ")"
        return rep.tab()
    }


}


class Parent {

    constructor(name, params, location) {
        this.name = name
        this.params = params
        this.location = location
    }

    toString() {
        var rep = "( Parent:" + this.name + ENTER +
            JSON.stringify(this.params) +
            ")"
        return rep.tab()
    }

    hasError() {
        return this.error
    }

    errors() {
        let errors = []
        if (this.error) {
            errors.push(this.error)
        }
        return errors
    }
}

class VarDeclaration {

    constructor(name, value, writeable, location) {
        this.name = name
        this.value = value
        this.writeable = writeable
        this.location = location
    }

    hasError() {
        return this.error || this.value? this.value.hasError(): false
    }

    errors() {
        let errors = this.value ? this.value.errors() : []
        if (this.error) {
            errors.push(this.error)
        }
        return errors
    }

    toString() {
        if (this.error) {
            var rep = this.error.toString()
        } else {
            var rep = "( VarDeclaration" + ENTER +
                (this.writeable + " " + this.name).tab() +
                (this.value? this.value.toString():"") +
                ")"
        }

        return rep.tab()
    }

}

class Method{

    constructor(name, params, block, location) {
        this.name = name
        this.params = params
        this.block = block
        this.location = location
    }

    hasError() {
        return this.error 
    }

    errors() {
        let errors = []
        if (this.error) {
            errors.push(this.error)
        }
        return errors
    }

    toString() {
        if (this.error) {
            var rep = this.error.toString()
        } else {
            var rep = "( Method" + ENTER +
                this.name.tab() +
                ")"
        }

        return rep.tab()
    }

}

class ExprValue {
    constructor(value, location) {
        this.location = location
        this.value = value
    }

    toString() {
        var rep = "(" + this.constructor.name + ENTER +
            this.value +
            ")"
        return rep.tab()
    }

    hasError() {
        return this.error
    }

    errors() {
        let errors =  []
        if (this.error) {
            errors.push(this.error)
        }
        return errors
    }
}

class ExprConstNum extends ExprValue {}

class ExprConstBool extends ExprValue {}

class ExprVar extends ExprValue {}

class UnaryExpr {
    constructor(expresion, location) {
        this.location = location
        this.expresion = expresion;
    }

     toString() {
        var rep = "(" + this.constructor.name + ENTER +
            this.expresion.toString +
            ")"
        return rep.tab()
    }

    hasError() {
        return this.error || this.expresion.hasError()
    }

    errors() {
        let errors = this.expresion ? this.expresion.errors() : []
        if (this.error) {
            errors.push(this.error)
        }
        return errors
    }
}

class ExprNot extends UnaryExpr {
    get isConstant() {
        return this.expresion.isConstant;
    }

    eval() {
        return !this.expresion.eval()
    }
}
class StmtReturn extends UnaryExpr {}

//Exp Binarias
class BinaryExpr extends UnaryExpr {
    constructor(expresion, secExpresion, location) {
        super(expresion, location)
        this.secondExpresion = secExpresion;
    }

    get isConstant() {
        return this.expresion.isConstant && this.secondExpresion.isConstant;
    }

    toString() {
        var rep = "(" + this.constructor.name + ENTER +
            this.expresion.toString() +
            this.secondExpresion.toString() +
            ")"
        return rep.tab()
    }
}

class ExprAdd extends BinaryExpr {
    eval() {
        return this.expresion.eval() + this.secondExpresion.eval();
    }
}
class ExprSub extends BinaryExpr {
    eval() {
        return this.expresion.eval() - this.secondExpresion.eval();
    }
}
class ExprNe extends BinaryExpr {
    eval() {
        return this.expresion.eval() != this.secondExpresion.eval();
    }
}
class ExprEq extends BinaryExpr {
    eval() {
        return this.expresion.eval() == this.secondExpresion.eval();
    }
}
class ExprLt extends BinaryExpr {
    eval() {
        return this.expresion.eval() <= this.secondExpresion.eval();
    }
}
class ExprGe extends BinaryExpr {
    eval() {
        return this.expresion.eval() >= this.secondExpresion.eval();
    }
}
class ExprLe extends BinaryExpr {
    eval() {
        return this.expresion.eval() < this.secondExpresion.eval();
    }
}
class ExprMul extends BinaryExpr {
    eval() {
        return this.expresion.eval() * this.secondExpresion.eval();
    }
}
class ExprDiv extends BinaryExpr {
    eval() {
        return this.expresion.eval() / this.secondExpresion.eval();
    }
}
class ExprOr extends BinaryExpr {
    eval() {
        return this.expresion.eval() || this.secondExpresion.eval();
    }
}
class ExprAnd extends BinaryExpr {
    eval() {
        return this.expresion.eval() && this.secondExpresion.eval();
    }
}
class ExprGt extends BinaryExpr {
    eval() {
        return this.expresion.eval() > this.secondExpresion.eval();
    }
}


export default {
    Location,
    WFile,
    NamedObject,
    Members,
    VarDeclaration,
    ExprConstNum,
    ExprConstBool,
    ExprVar,
    ExprAdd,
    ExprSub,
    ExprNe,
    ExprEq,
    ExprLt,
    ExprGe,
    ExprLe,
    ExprMul,
    ExprDiv,
    ExprOr,
    ExprAnd,
    ExprGt,
    ASTError,
    Package,
    WClass,
    Method,
    Mixin,
    Parent
}