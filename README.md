# Arrival

> Apply any CSS styles or attributes depending on scroll interaction

Zero dependency plugin with declarative interface to set classes or apply some styles on elements depending on scroll position.

![Example](example.gif)

With full ability to use CSS you could achieve silky smooth animation effects by using repaint-less CSS-technics and easy to handle GPU or CPU rendering with full set of browser optimizations.

This component designed to be customized in project. In example we have 3 types of scroll effects:

* add class
* change `background-color`
* change `transform` and `opacity` properties
* change `transform` properties and make parallax effect

It is hard to believe that all will be used in real project, so feel free to keep only what you need. By removing sub-classes and modify initialization.

In example you could instantiate component like this:

```html
<div data-arrival data-change-translate></node>
```

You can declarative set configuration for particular instance if needed. Ex:

```html
<div data-arrival data-distance="20" data-start="100"></node>
```

## Attributes

* `data-distance` - the distance that effect will be applicable in percentage of viewport 
* `data-start` - start point of effect. 0 - viewport top, 100 - viewport bottom 

Supports: IE9+, Evergreen browsers.

Copyright © 2017, Dima Nechepurenko. Published under MIT license.
