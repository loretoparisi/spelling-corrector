## Spelling Corrector
A probabilist spelling corrector that runs in the browser that let to train, correct text and diff results right in the browser.

### How to run

```
$ git clone https://github.com/loretoparisi/spelling-corrector.git
$ cd spelling-corrector/demo
$ python -m SimpleHTTPServer 8181
```

and point your browser to [http://localhost:8181](http://localhost:8181)

### References
This project is based on [speller](https://github.com/past/speller) by [past](https://github.com/past/), that implements the insane famous Peter Norvig's [spell-checker](http://norvig.com/spell-correct.html). For text comparison it uses [JSDiff](https://github.com/kpdecker/jsdiff)
