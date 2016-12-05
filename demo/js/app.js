/*
 * Copyright (c) 2009 Panagiotis Astithas
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

var Settings = {
    WRAP_CHARS : 50
}

/*
 * Spelling Corrector
 * inspired by http://blog.astithas.com/2009/08/spell-checking-in-javascript.html
 * Improved and Modified by
 * @author Loreto Parisi (loretoparisi at gmail com)
*/ 

/**
 * Simple WordWrap Editor
 */
function Editor() {

    /**
     * Word wrap
     */
    this._wordwrap = function (start, stop, params) {
        if (typeof start === 'object') {
            params = start;
            start = params.start;
            stop = params.stop;
        }
        if (typeof stop === 'object') {
            params = stop;
            start = start || params.start;
            stop = undefined;
        }
        if (!stop) {
            stop = start;
            start = 0;
        }

        if (!params) params = {};
        var mode = params.mode || 'soft';
        var re = mode === 'hard' ? /\b/ : /(\S+\s+)/;

        return function (text) {
            var chunks = text.toString()
                .split(re)
                .reduce(function (acc, x) {
                    if (mode === 'hard') {
                        for (var i = 0; i < x.length; i += stop - start) {
                            acc.push(x.slice(i, i + stop - start));
                        }
                    }
                    else acc.push(x)
                    return acc;
                }, []);

            return chunks.reduce(function (lines, rawChunk) {
                if (rawChunk === '') return lines;

                var chunk = rawChunk.replace(/\t/g, '    ');

                var i = lines.length - 1;
                if (lines[i].length + chunk.length > stop) {
                    lines[i] = lines[i].replace(/\s+$/, '');

                    chunk.split(/\n/).forEach(function (c) {
                        lines.push(
                            new Array(start + 1).join(' ')
                            + c.replace(/^\s+/, '')
                        );
                    });
                }
                else if (chunk.match(/\n/)) {
                    var xs = chunk.split(/\n/);
                    lines[i] += xs.shift();
                    xs.forEach(function (c) {
                        lines.push(
                            new Array(start + 1).join(' ')
                            + c.replace(/^\s+/, '')
                        );
                    });
                }
                else {
                    lines[i] += chunk;
                }

                return lines;
            }, [ new Array(start + 1).join(' ') ]).join('\n');
        };
    };

    /**
     * Hard word wrap
     */
    this.hardWrap = function (text, start, stop) {
        return this._wordwrap(start, stop, { mode : 'hard' })(text);
    };

    /**
     * Soft word wrap
     */
    this.softWrap = function (text, start, stop, params) {
        return this._wordwrap(start, stop, params)(text);
    };


}//Editor

/**
 * Load diff editor
 */
function DiffEditor() {

    var a = document.getElementById('a');
    var b = document.getElementById('b');

    var result = document.getElementById('diffresult');
    var self=this;
    this.diffType='diffWords';
    this.changed = function() {
        var diffOpt={
            ignoreWhitespace : true,
            ignoreCase : true    
        };
        var diff = JsDiff[self.diffType](a.textContent, b.textContent, diffOpt);
        var fragment = document.createDocumentFragment();
        for (var i=0; i < diff.length; i++) {

            if (diff[i].added && diff[i + 1] && diff[i + 1].removed) {
                var swap = diff[i];
                diff[i] = diff[i + 1];
                diff[i + 1] = swap;
            }

            var node;
            if (diff[i].removed) {
                node = document.createElement('del');
                node.appendChild(document.createTextNode(diff[i].value));
            } else if (diff[i].added) {
                node = document.createElement('ins');
                node.appendChild(document.createTextNode(diff[i].value));
            } else {
                node = document.createTextNode(diff[i].value);
            }
            fragment.appendChild(node);
        }

        result.textContent = '';
        result.appendChild(fragment);
    }//changed

    $("#clean_diff").click(function(event) {
        $('#a').text("");
        $('#b').text("");
        $('#diffresult').text("");
    });

    window.onload = function() {
        onDiffTypeChange(document.querySelector('#diff_box [name="diff_type"]:checked'));
        self.changed();
    };

    function cleanContents() {
        $('#b').text("");
        $('#diffresult').text("");
        self.changed();    
    }

    function cleanContentsAndReload() {
        cleanContents();
        self.changed();    
    }

    a.onpaste = b.onpaste = cleanContents;
    a.onchange = b.onchange = cleanContentsAndReload;

    if ('oninput' in a) {
        a.oninput = b.oninput = self.changed;
    } else {
        a.onkeyup = b.onkeyup = self.changed;
    }

    function onDiffTypeChange(radio) {
        self.diffType = radio.value;
    }

    var radio = document.getElementsByName('diff_type');
    for (var i = 0; i < radio.length; i++) {
        radio[i].onchange = function(e) {
            onDiffTypeChange(e.target);
            self.changed();
        }
    }
}//DiffEditor

/**
 * Load spell checker tool
 */
function SpellChecker(diffEditor,wordWrapEditor) {

    this.isTrained=false;
    this.stopWords=[];
    var self=this;

    $.loading(true, { text: 'Loading...', pulse: 'fade'});
    $.get( "data/stopwords.txt", function( data ) {
        self.stopWords = data.split(',');
        print(self.stopWords.length + " stopwords loaded.");
    });
    $.get( "data/sample.txt", function( data ) {
        $('#a').text(data);
        print("sample text loaded.");
        $.loading(false);
    });
    $("#clean").click(function(event) {
        $("#result > pre")[0].innerHTML="";
    });
    $("#format_text").click(function(event) {
        $('#a').text( wordWrapEditor.softWrap($('#a').text(),0,Settings.WRAP_CHARS) );
    });
	$("#correct_text").click(function(event) {
        if(!self.isTrained) {
            print("Please train first.");
            return;    
        }
		$.loading(true, { text: 'Working...', pulse: 'fade'});

         var text=$('#a').text(); // text
         var lines=text.split(/\n/); // lines
         var tokens=text.split(/\s+/); // tokens
         
         print("Lines:"  + lines.length );
         print("Tokens:"  + tokens.length );

         var corrections=[];
         setTimeout(function () {
             lines.forEach(function(line,lineIndex) { // line
                var tokens=line.split(/\s+/); // tokens
                var line_corrections=[];
                tokens.forEach(function(token) { // tokens
                    token=token.trim();
                    var item={};
                    item.line=lineIndex;
                    item.word=token
                    item.pos=text.indexOf(token);
                    // ignore stopwords
                    var isStopWord=self.stopWords.indexOf( token.toLowerCase() )>-1;
                    if( token != "" ) {
                        if( isStopWord ) {
                            item.correct=token;
                        } else {
                            item.correct=speller.correct(token);
                        }
                    } else {
                        item.correct="";    
                    }
                    line_corrections.push( item );
                });
                corrections.push( line_corrections );
            });
            $.loading(false);
            print( JSON.stringify( corrections ) );
            var correctedWords=[];
            var correctedText='';
            corrections.forEach(function(line_corrections) {
                var correctedWordsLine=[];
                line_corrections.forEach(function(item) {
                    var token=item.correct;
                    correctedWordsLine.push(token);
                });
                var correctedTextLine=correctedWordsLine.join(" ");
                correctedWords.push(correctedTextLine);
            });
            correctedText=correctedWords.join("\n");
            
            $('#b').text( wordWrapEditor.softWrap(correctedText,0,Settings.WRAP_CHARS)  );
            diffEditor.changed();


         }, 0);

    });
    $("#correct_word").click(function(event) {
        if(!self.isTrained) {
            print("Please train first.");
            return;    
        }
		$.loading(true, { text: 'Working...', pulse: 'fade'});
        var word = $('#word')[0].value;
            setTimeout(function () {
                print(speller.correct(word));
                $.loading(false, { text: 'Working...', pulse: 'fade'});
            }, 0);
    });
	$("#train").click(function(event) {
		$.loading(true, { text: 'Working...', pulse: 'fade'});
		var t0 = new Date();
		$.get("data/big.txt", null, function (data, textStatus) {
			var t1 = new Date();
			print("Loaded file in " + (t1 - t0) + " msec");
			var lines = data.split("\n");
			var count = lines.length;
			lines.forEach(function (line) {
				setTimeout(function () {
					speller.train(line);
					count--;
					if (count == 0) {
						var t2 = new Date();
                        self.isTrained=true;
						print("Trained in " + (t2 - t1) + " msec");
						$.loading(false, { text: 'Working...', pulse: 'fade'});
					}
				}, 0);
			});
		}, "text");
	});
	var work = function(event) {
		$.loading(true, { text: 'Working...', pulse: 'fade'});
		var worker = new Worker("js/worker.js");
		worker.onmessage = function (e) {
			print(e.data);
			$.loading(false, { text: 'Working...', pulse: 'fade'});
		};
		worker.postMessage(this.id + "@" + JSON.stringify(speller.nWords));
	};
	$("#tests1").click(work);
	$("#tests2").click(work);

}//SpellChecker

$(document).ready(function(){

    // load word wrap editor
    var ww = new Editor();
    // load diff editor
    var df= new DiffEditor(ww);
    // load spell checker
    var sp = new SpellChecker(df,ww);
});

print = function(str) {
	var old = $("#result > pre")[0].innerHTML;
	$("#result > pre")[0].innerHTML = old + "<br>" + str;
};