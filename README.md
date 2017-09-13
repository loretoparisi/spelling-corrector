## Spelling Corrector
A probabilist spelling corrector that runs in the browser that let to train, correct text and diff results right in the browser.

### How to run

```
$ git clone https://github.com/loretoparisi/spelling-corrector.git
$ cd spelling-corrector/demo
$ python -m SimpleHTTPServer 8181
```

and point your browser to [http://localhost:8181](http://localhost:8181)

### How to use the Spelling Corrector
The spelling corrector page looks like
![screencapture-localhost-8181-1505308177931](https://user-images.githubusercontent.com/163333/30379099-b187eb3c-9895-11e7-8aec-b392ad13e91e.png)

Click on **train** first to train the spell checker. The console output will tell you the the stopwords loaded and the training time. To run a test of the trained model click on **Test 1** or **Test 2**. You should see an output like

```
{"bad":130,"n":400,"pct":"68","unknown":43,"secs":"6"}
```

To check the spelling on a single word, type the word in the *Single Term* box and click on **correct**. To check the spelling of the whole text, type the text in the left text box below (or leave the example's one) and click on **full text correct**.
In the left pane you have the input source text - possibly mispelled, in the middle box you have the corrected text, and in the right box you can see the differences.



### References
This project is based on [speller](https://github.com/past/speller) by [past](https://github.com/past/), that implements the insane famous Peter Norvig's [spell-checker](http://norvig.com/spell-correct.html). For text comparison it uses [JSDiff](https://github.com/kpdecker/jsdiff)
