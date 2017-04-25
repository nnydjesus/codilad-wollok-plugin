import { parser } from './parser'

/*
 *  Place copyright or other info here...
 */

(function(global, $) {

    // Define core
    var codiad = global.codiad,
        scripts = document.getElementsByTagName('script'),
        path = scripts[scripts.length - 1].src.split('?')[0],
        curpath = path.split('/').slice(0, -1).join('/') + '/';

    // Instantiates plugin
    $(function() {
        codiad.Wollok.init();
    });

    codiad.Wollok = {

        // Allows relative `this.path` linkage
        path: curpath,

        init: function() {

            // Start your plugin here...
            amplify.subscribe('active.onSave', function(path) {
                setTimeout(function() {
                    this.parse()
                }.bind(this), 50);
            }.bind(this));

            amplify.subscribe('active.onFocus', function(path) {
                setTimeout(function() {
                    this.parse()
                }.bind(this), 50);
            }.bind(this));

        },

        parse: function() {
            codiad.editor.getActive().getSession().clearAnnotations();
            var sourceCode = codiad.editor.getActive().getValue()

            try {
                var result = parser.parse(sourceCode)
                if (result.hasError()) {
                    result.errors().forEach((error) => {
                        this.reportError(error)
                    })
                }
            } catch (err) {
                this.reportError(err)
                return err;
            }
        },

        reportError: function(err) {
            codiad.editor.getActive().getSession().setAnnotations([{
                row: err.location.first_line - 1,
                column: err.location.first_column,
                text: err.message,
                type: 'error'
            }]);
        },

        /**
         * 
         * This is where the core functionality goes, any call, references,
         * script-loads, etc...
         * 
         */

        SOME_METHOD: function() {
            alert('Hello World');
        }

    };

})(window, jQuery);