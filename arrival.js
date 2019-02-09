'use strict';

/**
 * Arrival
 * Copyright © 2017, D.Nechepurenko <dimanechepurenko@gmail.com>
 * Published under MIT license.
 *
 * Apply any CSS styles or attributes depending on scroll interaction
 *
 * @param {int} 'data-start' - start point percent. "0" - viewport bottom, "100" - viewport top
 * @param {int} 'data-stop' - stop point percent. "0" - viewport bottom, "100" - viewport top
 * @example
 *    <node data-arrival data-start="0" data-stop="20"></node>
 */

/**
 * @constructor
 * @param {object} options - instance options
 * @param {object} options.instance - DOM-node on what styles would be applied
 * @param {int} options.start - point of start in the screen percentages. 0 - view bottom, 100% - view top
 * @param {int} options.stop - point of stop in the screen percentages. 0 - view bottom, 100% - view top
 * @param {int} options.applicableChange - unit distance that should be processed. For most CSS values it is 100, for distances it could be any distance.
 */
var Arrival = function(options) {
	this.element = options.instance;
	this.start = options.start;
	this.stop = options.stop;
	this.applicableChange = options.applicableChange || 100;

	this.initializeParams();
	this.initializeEvents();
	this.startArrival();
};

Arrival.prototype = {
	scrollTop: function () {
		return (document.documentElement && document.documentElement.scrollTop) ||
			document.body.scrollTop;
	},
	initializeParams: function () {
		this.viewHeight = window.innerHeight;
		this.arrivalStart = (this.viewHeight / 100) * this.start;
		this.arrivalDistance = ((this.viewHeight / 100) * (this.stop - this.start));
	},
	initializeEvents: function () {
		window.addEventListener('resize', this.initializeParams.bind(this));
		window.addEventListener('scroll', this.startArrival.bind(this));
		window.addEventListener('touchstart', this.startArrival.bind(this));
	},
	startArrival: function () {
		var elementBounds = this.element.getBoundingClientRect();
		var viewRelatedScroll = elementBounds.top - (this.viewHeight);

		if (viewRelatedScroll > 0 || elementBounds.bottom < 0) {
			return false;
		}
		// We apply styles for all visible elements before actual arrival starts to
		// ensure that all rendered as expected and make time for browser to prepare
		// elements. So in `applyStyle` we need to check if scrollY > 0
		return this.applyStyles(Math.abs(viewRelatedScroll) - this.arrivalStart);
	},
	arrivalProgress: function (relativeScrollTop) {
		var scrollPercent = relativeScrollTop / (this.arrivalDistance / this.applicableChange);
		// Maybe we should return raw values?
		return scrollPercent > this.applicableChange ? this.applicableChange : scrollPercent;
	}
};

// Standard non-interactive arrival

var ArrivalClass = function(options) {
	Arrival.call(this, options);
	this.isArrived = false;
};

ArrivalClass.prototype = Object.create(Arrival.prototype);
ArrivalClass.prototype.constructor = ArrivalClass;

ArrivalClass.prototype.applyStyles = function(scrollY) {
	if (!this.isArrived && scrollY >= 0) {
		this.element.classList.add('is-shown');
		this.isArrived = true;
	}
};

// Zoom in

var ArrivalZoomIn = function(options) {
	Arrival.call(this, options);
	this.zoom = options.zoom;
};

ArrivalZoomIn.prototype = Object.create(Arrival.prototype);
ArrivalZoomIn.prototype.constructor = ArrivalZoomIn;

ArrivalZoomIn.prototype.applyStyles = function(scrollY) {
	if (scrollY < 0) {
		return false;
	}
	var easeInOutCubic = function(t) {
		return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
	};
	var elemStyle = this.element.style;
	var progress = (this.zoom / 100) * (100 - this.arrivalProgress(scrollY));
	var transform = 1 + easeInOutCubic(progress);

	window.requestAnimationFrame(function() {
		elemStyle.transform = 'scale(' + transform + ')';
	});
};

// Zoom out

var ArrivalZoomOut = function(options) {
	Arrival.call(this, options);
	this.zoom = options.zoom;
};

ArrivalZoomOut.prototype = Object.create(Arrival.prototype);
ArrivalZoomOut.prototype.constructor = ArrivalZoomOut;

ArrivalZoomOut.prototype.applyStyles = function(scrollY) {
	var easeInOutCubic = function(t) {
		return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
	};
	var elemStyle = this.element.style;
	var progress = (this.zoom / 100) * this.arrivalProgress(scrollY);
	var transform = 1 + easeInOutCubic(progress);

	window.requestAnimationFrame(function() {
		elemStyle.transform = 'scale(' + transform + ')';
	});
};

// Translate Fade

var ArrivalTranslateFade = function(options) {
	Arrival.call(this, options);
};

ArrivalTranslateFade.prototype = Object.create(Arrival.prototype);
ArrivalTranslateFade.prototype.constructor = ArrivalTranslateFade;

ArrivalTranslateFade.prototype.applyStyles = function(scrollY) {
	var elemStyle = this.element.style;
	var transform = this.applicableChange - this.arrivalProgress(scrollY);
	var opacity = this.arrivalProgress(scrollY) / 100;

	window.requestAnimationFrame(function() {
		elemStyle.opacity = opacity;
		elemStyle.transform = 'translateY(' + transform + 'px)';
	});
};

// BgColor

var ArrivalBgColor = function(options) {
	Arrival.call(this, options);
};

ArrivalBgColor.prototype = Object.create(Arrival.prototype);
ArrivalBgColor.prototype.constructor = ArrivalBgColor;

ArrivalBgColor.prototype.applyStyles = function(scrollY) {
	var elemStyle = this.element.style;
	var alphaChannel = this.arrivalProgress(scrollY) / 100;

	window.requestAnimationFrame(function() {
		elemStyle.backgroundColor = "rgba(220, 220, 220," + alphaChannel + ")";
	});
};

// Parallax motion based on arrival with gyroscope engaged

var ArrivalParallax = function(options) {
	Arrival.call(this, options);
	this.image = this.element.getElementsByTagName('img')[0];
	this.layer = document.createElement('span');
	this.limit = 10;
	this.isWaiteForFrame = false;

	this.createHolder();
	if (this.image.complete) {
		this.updateHolder();
	}
	this.initializeAdditionalEvents();
};

ArrivalParallax.prototype = Object.create(Arrival.prototype);
ArrivalParallax.prototype.constructor = ArrivalParallax;

ArrivalParallax.prototype.applyStyles = function(scrollY) {
	if (this.isWaiteForFrame) {
		return;
	}
	var self = this;
	var rawY = this.limit - (scrollY / this.applicableChange);
	self.isWaiteForFrame = true;

	window.requestAnimationFrame(function() {
		self.layer.style.transform = 'translate3d(0,' + -rawY + '%, 0)';
		self.isWaiteForFrame = false;
	});
};

ArrivalParallax.prototype.createHolder = function() {
	this.element.appendChild(this.layer);
	this.updateLimits();
};

ArrivalParallax.prototype.updateHolder = function() {
	var imageSrc = this.image.currentSrc || this.image.src;
	this.layer.style.backgroundImage = 'url("' + imageSrc + '")';
	this.updateLimits();
	this.element.classList.add('js-parallax-loaded');
};

ArrivalParallax.prototype.updateLimits = function() {
	this.applicableChange = this.element.offsetHeight / this.limit;
};

ArrivalParallax.prototype.initializeAdditionalEvents = function() {
	this.image.addEventListener('load', this.updateHolder.bind(this));
	this.image.addEventListener('resize', this.updateLimits.bind(this));
};

// Create instances
function initArrivals() {
	var page = document;
	var arrivals = page.querySelectorAll('[data-arrival]');
	var parallaxes = page.querySelectorAll('picture[data-parallax]');

	if (arrivals.length) {
		page.documentElement.classList.add('js-arrival-enabled');
	}

	for (var arrival = 0; arrival < arrivals.length; arrival++) {
		var instance = arrivals[arrival];

		switch (true) {
			case instance.hasAttribute('data-change-translate'):
				new ArrivalTranslateFade({
					instance: instance,
					start: instance.getAttribute('data-start') || 0,
					stop: instance.getAttribute('data-stop') || 35
				});
				break;
			case instance.hasAttribute('data-change-color'):
				new ArrivalBgColor({
					instance: instance,
					start: instance.getAttribute('data-start') || 100,
					stop: instance.getAttribute('data-stop') || 120
				});
				break;
			case instance.hasAttribute('data-change-class'):
				new ArrivalClass({
					instance: instance,
					start: instance.getAttribute('data-start') || 50,
					stop: instance.getAttribute('data-stop') || 50
				});
				break;
			case instance.hasAttribute('data-change-zoomIn'):
				new ArrivalZoomIn({
					instance: instance,
					start: instance.getAttribute('data-start') || 0,
					stop: instance.getAttribute('data-stop') || 80,
					zoom: instance.getAttribute('data-zoom') || 0.4
				});
				break;
			case instance.hasAttribute('data-change-zoomOut'):
				new ArrivalZoomOut({
					instance: instance,
					start: instance.getAttribute('data-start') || 0,
					stop: instance.getAttribute('data-stop') || 80,
					zoom: instance.getAttribute('data-zoom') || 0.2
				});
				break;
		}
	}

	if (parallaxes.length) {
		page.documentElement.classList.add('js-parallax-enabled');
	}

	for (var parallax = 0; parallax < parallaxes.length; parallax++) {
		var inst = parallaxes[parallax];
		new ArrivalParallax({
			instance: inst,
			start: inst.getAttribute('data-start') || 0,
			stop: inst.getAttribute('data-stop') || 100,
			applicableChange: inst.getAttribute('data-depth') || 100
		});
	}
}
initArrivals();
