import fs from 'fs';
import path from 'path';
import AST from './modules/AST';
import _ from 'underscore';
import { Parser } from 'jison-nny';
import { grammar, stringToken } from './modules/Grammar';

_(global).extend(AST)
_(global).extend({ stringToken: stringToken })

export const parser = new Parser(grammar, undefined, { debug: false });

parser.yy.parseError = function(str, hash, ExceptionClass) {
    // console.log(hash.expected)
    var err = new ExceptionClass(str, hash);
    if (hash.recoverable) {
        return err
    }
    throw err
};

export const parse = (code) => {
    return parser.parse(code)
}

// try {
//     // var file = 'example.wlk'
//     // fs.readFile(path.join(__dirname, '', `${file}`), 'utf8', (code) => {
//     var code = "object kaka inherits adsfsdf()   var cuenta  1234 }"
//     var result = parse(code)
//     console.log(result);
//     console.log(result.toString());
//     console.log(result.errors());
//     // })

// } catch (err) {
//     console.log(err);
// }