# scramble-text

`scramble-text` is Express plugin for inserting random elements that makes copying text hard

## Installation

`npm install lukashlavacka/scramble-text`

## Usage

## Jade/Pug

This plugin supports several mode. The best way is to use [jstransformer-scramble-text](https://github.com/lukashlavacka/jstransformer-scramble-text) and use it in your templates.

A more "brutal" approach is to post-process the generated html and insert the random elements that way.

### All post processing modes

Start by adding a reference to `scrambleText` in your main `app.js`

```javascript
const scrambleText = require('scramble-text');
```

### `stupid` mode

Stupid mode uses regex to insert elements. Works fast but not well, matches all text outside elements:

```javascript
app.use(scrambleText({type: 'stupid'}));
```

### `smart` mode

Smart mode parses generated html, walks the element tree and only affects text nodes. Slower but should work a lot better.

```javascript
app.use(scrambleText({type: 'smart'}));
```

### `injectStyle`

Injects style element to hide the gerated elements right before `</head>`

### `style`

Generates content of `style` element, might be usefull if you are calling the `scramble-text` in some other way.

```javascript
app.use(scrambleText({type: 'smart'})); // => u[m] { display:inline-block; width:1px; height:1px; overflow:hidden; margin-left:-1px }
```