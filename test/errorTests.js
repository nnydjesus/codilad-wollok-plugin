import { parser } from '../src/parser'
import textErrors from '../src/modules/errors.json'
import chalk from 'chalk';

console.log(chalk.bgYellow(chalk.blue("Probar que se genera el error correcto cuando le falta la {")));
var code = "object pepita }"
var result = parser.parse(code)

if (result.hasError()) {
    var error = result.errors()[0]
    if (error.message == textErrors.object.LBRACE) {
        console.log(chalk.green("Los mensajes son iguales: "));
        console.log(chalk.yellow(error.message).tab());
    } else {
        console.log(chalk.green("No se genero el mensaje correcto"));
    }
} else {
    console.log(chalk.red("No tiro error"));
}


function testParseOK(label, code){
    console.log(chalk.bgYellow(chalk.blue(label)));
    var result = parser.parse(code)
    console.log(result.toString())
    if (result.hasError()) {
        console.log(chalk.red("Ocurrió errores"));
        console.log(chalk.red(result.errors()));
    } else {
        console.log(chalk.green("Test Passed OK"));
    }    
}

testParseOK("Parsear un package vacio", "package test { }")
testParseOK("Parsear un package con un objeto declarado", "package test {  object pepita{ } }")
testParseOK("Parsear una clase con parent", "class Golondrina() inherits Pajaro(){ }")
testParseOK("Parsear un mixin vacio", "mixin test { }")
testParseOK("Parsear un package con varios elementos", "package test { class Golondriana(){} object pepita inherits Golondrina(){ } }")
testParseOK("Parsear un imports", "import lala import lala.lala.com package test { }")
testParseOK("Parsear la declaracion de una variable simple", "object pepita { var energia = 100 - (44 + 232) }")
testParseOK("Parsear la declaracion de una variable sin asignacion", "object pepita { var energia }")
testParseOK("Parsear la declaracion de una expresion compleja", "object pepita { var energia = (100 - (44 + 232)) >= (39*3/34) }")
testParseOK("Parsear la declaracion de un metodo", "object pepita { method volar(km){ } }")
