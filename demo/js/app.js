/*
*
* Musixmatch Intelligence Platform SDK
* @modifiedby Loreto Parisi (loreto at musixmatch dot com)
* @2015-2016 Musixmatch Spa.
*/ 

/**
 * Load diff editor
 */
function diffEditor() {

    var a = document.getElementById('a');
    var b = document.getElementById('b');

    var result = document.getElementById('diffresult');
    var self=this;
    this.diffType='diffChars';
    this.changed = function() {
        var diff = JsDiff[self.diffType](a.textContent, b.textContent);
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
        $('#a').text("");
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
}//diffEditor

/**
 * Load spell checker tool
 */
function spellChecker(diffEditor) {

    this.isTrained=false;
    var self=this;

    $.loading(true, { text: 'Loading...', pulse: 'fade'});
    $.get( "data/lyrics.txt", function( data ) {
        $('#a').text(data);
        print("sample text loaded.");
        $.loading(false);
    });
    $("#clean").click(function(event) {
        $("#result > pre")[0].innerHTML="";
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
                    var item={};
                    item.line=lineIndex;
                    item.word=token
                    item.pos=text.indexOf(token);
                    item.correct=speller.correct(token);
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
            //print(correctedText);

            $('#b').text(correctedText);
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

}//spellChecker

$(document).ready(function(){
    // load diff editor
    var df= new diffEditor();
    // load spell checker
    var sp = new spellChecker(df);
});

print = function(str) {
	var old = $("#result > pre")[0].innerHTML;
	$("#result > pre")[0].innerHTML = old + "<br>" + str;
};