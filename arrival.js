'use strict';

/**
 * Arrival
 * Copyright © 2017, Dima Nechepurenko <dimanechepurenko@gmail.com>
 * Published under MIT license.
 *
 * Apply any CSS styles or attributes depending on scroll interaction
 *
 * @param {int} 'data-start' - start point percent. "0" - viewport top, "100" - viewport bottom
 * @param {int} 'data-distance' - distance for arrival in percentage of viewport
 * @example
 *    <node data-arrival data-distance="20" data-start="100"></node>
 */

/**
 * @constructor
 * @param {object} options - instance options
 * @param {object} options.instance - DOM-node that will be animated
 * @param {int} options.start - percent of the screen that is the point of start
 * @param {int} options.distance - percent of the screen that arrival should process
 * @param {int} options.elementBound - top or bottom coordinat of element
 */
class Arrival {
	constructor(options) {
		this.element = options.instance;
		this.start = options.start;
		this.distance = options.distance;
		this.elementBound = options.elementBound;
		this.viewPortHeight;
		this.arrivalDistance;
		this.arrivalStart;

		this.initializeParams();
		this.processArrival();
		this.initializeEvents();
	}

	static scrollTop() {
		return (document.documentElement && document.documentElement.scrollTop) ||
			document.body.scrollTop;
	};

	arrivalPercent(relativeScrollTop) {
		const scrollPercent = relativeScrollTop / (this.arrivalDistance / 100);
		return scrollPercent > 100 ? 100 : Math.round(scrollPercent);
	};

	processArrival() {
		const relativeScrollTop = Arrival.scrollTop() - this.elementBound;
		return this.applyStyles(relativeScrollTop + this.arrivalStart);
	};

	initializeParams() {
		this.viewPortHeight = window.innerHeight;
		this.arrivalDistance = (this.viewPortHeight / 100) * this.distance;
		this.arrivalStart = (this.viewPortHeight / 100) * this.start;

		return this;
	};

	initializeEvents() {
		window.addEventListener('orientationchange', this.initializeParams.bind(this));
		window.addEventListener('resize', this.initializeParams.bind(this));
		document.addEventListener('scroll', this.processArrival.bind(this));
	};
}

class ArrivalColor extends Arrival {
	applyStyles(relativeScrollTop) {
		const alphaChannel = this.arrivalPercent(relativeScrollTop) / 100;

		window.requestAnimationFrame(() => {
			this.element.style.backgroundColor = "rgba(220, 220, 220," + alphaChannel + ")";
		});
	};
}

class ArrivalFadeTranslate extends Arrival {
	applyStyles(relativeScrollTop) {
		const elem = this.element;
		const transform = (100 - this.arrivalPercent(relativeScrollTop)) / 2;
		const opacity = this.arrivalPercent(relativeScrollTop) / 100;

		window.requestAnimationFrame(() => {
			elem.style.opacity = opacity;
			elem.style.transform = 'translateY(' + transform + 'px)';
		});
	};
}

class ArrivalClass extends Arrival {
	applyStyles(relativeScrollTop) {
		if (relativeScrollTop >= 0) {
			this.element.classList.add('is-arrived');
		}
	};
}

class ArrivalParallax extends Arrival {
	constructor(options) {
		super(options);
		this.beta = 0;
		this.gamma = 0;
	}

	onDeviceOrientationChange(event) {
		let beta;
		let gamma;

		if (window.innerHeight > window.innerWidth) {
			beta = Math.round(event.gamma / 6);
			gamma = Math.round(event.beta / 4);
		} else {
			beta = Math.round(event.beta / 6);
			gamma = Math.round(event.gamma / 4);
		}

		this.beta = beta;
		this.gamma = gamma;
		this.processArrival();
	};

	applyStyles(relativeScrollTop) {
		const y = (100 - this.arrivalPercent(relativeScrollTop)) / 2;
		const transformX = this.beta > 10 ? 10 : this.beta;
		const transformY = (y - this.gamma) < 0 ? 0 : (y - this.gamma); // limit gamma to not transform layer more then bottom point

		window.requestAnimationFrame(() => {
			this.element.style.transform = 'translate(' + transformX + 'px, ' + transformY + 'px)';
		});
	};

	initializeEvents() {
		window.addEventListener('orientationchange', this.initializeParams.bind(this));
		window.addEventListener('resize', this.initializeParams.bind(this));
		window.addEventListener('scroll', this.processArrival.bind(this), {passive: true});
		window.addEventListener('touchstart', this.processArrival.bind(this), {passive: true});

		if (window.DeviceOrientationEvent) {
			window.addEventListener('deviceorientation', this.onDeviceOrientationChange.bind(this));
		}
	};
}

document.querySelectorAll('[data-arrival]').forEach(function (inst) {
	if (inst.hasAttribute('data-change-translate')) {
		new ArrivalFadeTranslate({
			instance: inst,
			start: inst.getAttribute('data-start') || 100,
			distance: inst.getAttribute('data-distance') || 30,
			elementBound: inst.getBoundingClientRect().top + Arrival.scrollTop()
		});
	} else if (inst.hasAttribute('data-change-color')) {
		new ArrivalColor({
			instance: inst,
			start: inst.getAttribute('data-start') || 20,
			distance: inst.getAttribute('data-distance') || 20,
			elementBound: inst.getBoundingClientRect().bottom + Arrival.scrollTop()
		});
	} else if (inst.hasAttribute('data-change-class')) {
		new ArrivalClass({
			instance: inst,
			start: inst.getAttribute('data-start') || 50,
			distance: inst.getAttribute('data-distance') || 0,
			elementBound: inst.getBoundingClientRect().top + Arrival.scrollTop()
		});
	} else if (inst.hasAttribute('data-parallax')) {
		new ArrivalParallax({
			instance: inst,
			start: inst.getAttribute('data-start') || 0,
			distance: inst.getAttribute('data-distance') || 100,
			elementBound: inst.getBoundingClientRect().top + Arrival.scrollTop()
		});
	}
});
