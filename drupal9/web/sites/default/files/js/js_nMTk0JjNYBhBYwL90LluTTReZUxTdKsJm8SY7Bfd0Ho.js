/**
 * @file
 * Cherries by @toddmotto, @cferdinandi, @adamfschwartz, @daniellmb.
 *
 * @todo: Use Cash or Underscore when jQuery is dropped by supported plugins.
 */

/* global define, module */
(function (root, factory) {

  'use strict';

  // Inspired by https://github.com/addyosmani/memoize.js/blob/master/memoize.js
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  }
  else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but only CommonJS-like
    // environments that support module.exports, like Node.
    module.exports = factory();
  }
  else {
    // Browser globals (root is window).
    root.dBlazy = factory();
  }
})(this, function () {

  'use strict';

  /**
   * Object for public APIs where dBlazy stands for drupalBlazy.
   *
   * @namespace
   */
  var dBlazy = {};

  // See https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
  if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
  }

  /**
   * Check if the given element matches the selector.
   *
   * @name dBlazy.matches
   *
   * @param {Element} elem
   *   The current element.
   * @param {String} selector
   *   Selector to match against (class, ID, data attribute, or tag).
   *
   * @return {Boolean}
   *   Returns true if found, else false.
   *
   * @see http://caniuse.com/#feat=matchesselector
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
   */
  dBlazy.matches = function (elem, selector) {
    // Check if matches, excluding HTMLDocument, see ::closest().
    if (elem.matches(selector)) {
      return true;
    }

    return false;
  };

  /**
   * Returns device pixel ratio.
   *
   * @return {Integer}
   *   Returns the device pixel ratio.
   */
  dBlazy.pixelRatio = function () {
    return window.devicePixelRatio || 1;
  };

  /**
   * Returns cross-browser window width.
   *
   * @return {Integer}
   *   Returns the window width.
   */
  dBlazy.windowWidth = function () {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || window.screen.width;
  };

  /**
   * Returns cross-browser window width and height.
   *
   * @return {Object}
   *   Returns the window width and height.
   */
  dBlazy.windowSize = function () {
    return {
      width: this.windowWidth,
      height: window.innerHeight
    };
  };

  /**
   * Returns data from the current active window.
   *
   * When being resized, the browser gave no data about pixel ratio from desktop
   * to mobile, not vice versa. Unless delayed for 4s+, not less, which is of
   * course unacceptable.
   *
   * @name dBlazy.activeWidth
   *
   * @param {Object} dataset
   *   The dataset object must be keyed by window width.
   * @param {Boolean} mobileFirst
   *   Whether to use min-width, or max-width.
   *
   * @return {mixed}
   *   Returns data from the current active window.
   */
  dBlazy.activeWidth = function (dataset, mobileFirst) {
    var me = this;
    var keys = Object.keys(dataset);
    var xs = keys[0];
    var xl = keys[keys.length - 1];
    var pr = (me.windowWidth() * me.pixelRatio());
    var ww = mobileFirst ? me.windowWidth() : pr;
    var mw = function (w) {
      // The picture wants <= (approximate), non-picture wants >=, wtf.
      return mobileFirst ? parseInt(w) <= ww : parseInt(w) >= ww;
    };

    var data = keys.filter(mw).map(function (v) {
      return dataset[v];
    })[mobileFirst ? 'pop' : 'shift']();

    return typeof data === 'undefined' ? dataset[ww >= xl ? xl : xs] : data;
  };

  /**
   * Check if the HTML tag matches a specified string.
   *
   * @name dBlazy.equal
   *
   * @param {Element} el
   *   The element to compare.
   * @param {String} str
   *   HTML tag to match against.
   *
   * @return {Boolean}
   *   Returns true if matches, else false.
   */
  dBlazy.equal = function (el, str) {
    return el !== null && el.nodeName.toLowerCase() === str;
  };

  /**
   * Get the closest matching element up the DOM tree.
   *
   * Inspired by Chris Ferdinandi, http://github.com/cferdinandi/smooth-scroll.
   *
   * @name dBlazy.closest
   *
   * @param {Element} el
   *   Starting element.
   * @param {String} selector
   *   Selector to match against (class, ID, data attribute, or tag).
   *
   * @return {Boolean|Element}
   *   Returns null if not match found.
   *
   * @see http://caniuse.com/#feat=element-closest
   * @see http://caniuse.com/#feat=matchesselector
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
   */
  dBlazy.closest = function (el, selector) {
    var parent;
    while (el) {
      parent = el.parentElement;
      if (parent && parent.matches(selector)) {
        return parent;
      }
      el = parent;
    }

    return null;
  };

  /**
   * Returns a new object after merging two, or more objects.
   *
   * Inspired by @adamfschwartz, @zackbloom, http://youmightnotneedjquery.com.
   *
   * @name dBlazy.extend
   *
   * @param {Object} out
   *   The objects to merge together.
   *
   * @return {Object}
   *   Merged values of defaults and options.
   */
  dBlazy.extend = Object.assign || function (out) {
    out = out || {};

    for (var i = 1, len = arguments.length; i < len; i++) {
      if (!arguments[i]) {
        continue;
      }

      for (var key in arguments[i]) {
        if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
          out[key] = arguments[i][key];
        }
      }
    }

    return out;
  };

  /**
   * A simple forEach() implementation for Arrays, Objects and NodeLists.
   *
   * @name dBlazy.forEach
   *
   * @author Todd Motto
   * @link https://github.com/toddmotto/foreach
   *
   * @param {Array|Object|NodeList} collection
   *   Collection of items to iterate.
   * @param {Function} callback
   *   Callback function for each iteration.
   * @param {Array|Object|NodeList} scope
   *   Object/NodeList/Array that forEach is iterating over (aka `this`).
   */
  dBlazy.forEach = function (collection, callback, scope) {
    var proto = Object.prototype;
    if (proto.toString.call(collection) === '[object Object]') {
      for (var prop in collection) {
        if (proto.hasOwnProperty.call(collection, prop)) {
          callback.call(scope, collection[prop], prop, collection);
        }
      }
    }
    else if (collection) {
      for (var i = 0, len = collection.length; i < len; i++) {
        callback.call(scope, collection[i], i, collection);
      }
    }
  };

  /**
   * A simple hasClass wrapper.
   *
   * @name dBlazy.hasClass
   *
   * @param {Element} el
   *   The HTML element.
   * @param {String} name
   *   The class name.
   *
   * @return {bool}
   *   True if the method is supported.
   *
   * @todo remove for el.classList.contains() alone.
   */
  dBlazy.hasClass = function (el, name) {
    if (el.classList) {
      return el.classList.contains(name);
    }
    else {
      return el.className.indexOf(name) !== -1;
    }
  };

  /**
   * A forgiving attribute wrapper with fallback.
   *
   * @name dBlazy.attr
   *
   * @param {Element} el
   *   The HTML element.
   * @param {String} attr
   *   The attr name.
   * @param {String} def
   *   The default value.
   *
   * @return {String}
   *   The attribute value, or fallback.
   */
  dBlazy.attr = function (el, attr, def) {
    def = def || '';
    return el !== null && el.hasAttribute(attr) ? el.getAttribute(attr) : def;
  };

  /**
   * A simple attributes wrapper.
   *
   * @name dBlazy.setAttr
   *
   * @param {Element} el
   *   The HTML element.
   * @param {String} attr
   *   The attr name.
   * @param {Boolean} remove
   *   True if should remove.
   */
  dBlazy.setAttr = function (el, attr, remove) {
    if (el && el.hasAttribute('data-' + attr)) {
      var dataAttr = el.getAttribute('data-' + attr);
      if (attr === 'src') {
        el.src = dataAttr;
      }
      else {
        el.setAttribute(attr, dataAttr);
      }

      if (remove) {
        el.removeAttribute('data-' + attr);
      }
    }
  };

  /**
   * A simple attributes wrapper looping based on the given attributes.
   *
   * @name dBlazy.setAttrs
   *
   * @param {Element} el
   *   The HTML element.
   * @param {Array} attrs
   *   The attr names.
   * @param {Boolean} remove
   *   True if should remove.
   */
  dBlazy.setAttrs = function (el, attrs, remove) {
    var me = this;

    me.forEach(attrs, function (src) {
      me.setAttr(el, src, remove);
    });
  };

  /**
   * A simple attributes wrapper, looping based on sources (picture/ video).
   *
   * @name dBlazy.setAttrsWithSources
   *
   * @param {Element} el
   *   The starting HTML element.
   * @param {String} attr
   *   The attr name, can be SRC or SRCSET.
   * @param {Boolean} remove
   *   True if should remove.
   */
  dBlazy.setAttrsWithSources = function (el, attr, remove) {
    var me = this;
    var parent = el.parentNode || null;
    var isPicture = parent && me.equal(parent, 'picture');
    var targets = isPicture ? parent.getElementsByTagName('source') : el.getElementsByTagName('source');

    attr = attr || (isPicture ? 'srcset' : 'src');

    if (targets.length) {
      me.forEach(targets, function (source) {
        me.setAttr(source, attr, remove);
      });
    }
  };

  /**
   * Checks if image is decoded/ completely loaded.
   *
   * @name dBlazy.isDecoded
   *
   * @param {Image} img
   *   The Image object.
   *
   * @return {bool}
   *   True if the image is loaded.
   */
  dBlazy.isDecoded = function (img) {
    if ('decoded' in img) {
      return img.decoded;
    }

    return img.complete;
  };

  /**
   * Decodes the image.
   *
   * @name dBlazy.decode
   *
   * @param {Image} img
   *   The Image object.
   *
   * @return {Promise}
   *   The Promise object.
   */
  dBlazy.decode = function (img) {
    var me = this;

    if (me.isDecoded(img)) {
      return Promise.resolve(img);
    }

    if ('decode' in img) {
      return img.decode();
    }

    return new Promise(function (resolve, reject) {
      img.onload = function () {
        resolve(img);
      };
      img.onerror = reject();
    });
  };

  /**
   * Updates CSS background with multi-breakpoint images.
   *
   * @name dBlazy.updateBg
   *
   * @param {Element} el
   *   The container HTML element.
   * @param {Boolean} mobileFirst
   *   Whether to use min-width or max-width.
   */
  dBlazy.updateBg = function (el, mobileFirst) {
    var me = this;
    var backgrounds = me.parse(el.getAttribute('data-backgrounds'));

    if (backgrounds) {
      var bg = me.activeWidth(backgrounds, mobileFirst);
      if (bg && bg !== 'undefined') {
        el.style.backgroundImage = 'url("' + bg.src + '")';

        // Allows to disable Aspect ratio if it has known/ fixed heights such as
        // gridstack multi-size boxes.
        if (bg.ratio && !el.classList.contains('b-noratio')) {
          el.style.paddingBottom = bg.ratio + '%';
        }
      }
    }
  };

  /**
   * A simple removeAttribute wrapper.
   *
   * @name dBlazy.removeAttrs
   *
   * @param {Element} el
   *   The HTML element.
   * @param {Array} attrs
   *   The attr names.
   */
  dBlazy.removeAttrs = function (el, attrs) {
    this.forEach(attrs, function (attr) {
      el.removeAttribute('data-' + attr);
    });
  };

  /**
   * A simple wrapper for [add|remove]EventListener.
   *
   * Made public from original bLazy library.
   *
   * @name dBlazy.binding
   *
   * @param {String} which
   *   Whether bind or unbind.
   * @param {Element} el
   *   The HTML element.
   * @param {String} eventName
   *   The event name to add.
   * @param {Function} fn
   *   The callback function.
   * @param {Object|Boolean} params
   *   The optional param passed into a custom event.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
   * @todo remove old IE references after another check.
   */
  dBlazy.binding = function (which, el, eventName, fn, params) {
    if (el && typeof fn === 'function') {
      var defaults = {capture: false, passive: true};
      var extras;
      if (typeof params === 'boolean') {
        extras = params;
      }
      else {
        extras = params ? this.extend(defaults, params) : defaults;
      }
      var bind = function (e) {
        if (el.attachEvent) {
          el[(which === 'bind' ? 'attach' : 'detach') + 'Event']('on' + e.trim(), fn, extras);
        }
        else {
          el[(which === 'bind' ? 'add' : 'remove') + 'EventListener'](e.trim(), fn, extras);
        }
      };

      if (eventName.indexOf(' ') > 0) {
        this.forEach(eventName.split(' '), bind);
      }
      else {
        bind(eventName);
      }
    }
  };

  /**
   * A simple wrapper for event delegation like jQuery.on().
   *
   * Inspired by http://stackoverflow.com/questions/30880757/
   * javascript-equivalent-to-on.
   *
   * @name dBlazy.onoff
   *
   * @param {String} which
   *   Whether on or off.
   * @param {Element} elm
   *   The parent HTML element.
   * @param {String} eventName
   *   The event name to trigger.
   * @param {String} childEl
   *   Child selector to match against (class, ID, data attribute, or tag).
   * @param {Function} callback
   *   The callback function.
   * @param {Object|Boolean} params
   *   The optional param passed into a custom event.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
   */
  dBlazy.onoff = function (which, elm, eventName, childEl, callback, params) {
    params = params || {capture: true, passive: false};
    var bind = function (e) {
      var t = e.target;
      e.delegateTarget = elm;
      while (t && t !== this) {
        if (dBlazy.matches(t, childEl)) {
          callback.call(t, e);
        }
        t = t.parentNode;
      }
    };

    this.binding(which === 'on' ? 'bind' : 'unbind', elm, eventName, bind, params);
  };

  /**
   * A simple wrapper for event delegation like jQuery.on().
   *
   * @name dBlazy.on
   *
   * @param {Element} elm
   *   The parent HTML element.
   * @param {String} eventName
   *   The event name to trigger.
   * @param {String} childEl
   *   Child selector to match against (class, ID, data attribute, or tag).
   * @param {Function} callback
   *   The callback function.
   * @param {Object|Boolean} params
   *   The optional param passed into a custom event.
   */
  dBlazy.on = function (elm, eventName, childEl, callback, params) {
    this.onoff('on', elm, eventName, childEl, callback, params);
  };

  /**
   * A simple wrapper for event detachment.
   *
   * @name dBlazy.off
   *
   * @param {Element} elm
   *   The parent HTML element.
   * @param {String} eventName
   *   The event name to trigger.
   * @param {String} childEl
   *   Child selector to match against (class, ID, data attribute, or tag).
   * @param {Function} callback
   *   The callback function.
   * @param {Object|Boolean} params
   *   The optional param passed into a custom event.
   */
  dBlazy.off = function (elm, eventName, childEl, callback, params) {
    this.onoff('off', elm, eventName, childEl, callback, params);
  };

  /**
   * A simple wrapper for addEventListener.
   *
   * @name dBlazy.bindEvent
   *
   * @param {Element} el
   *   The HTML element.
   * @param {String} eventName
   *   The event name to remove.
   * @param {Function} fn
   *   The callback function.
   * @param {Object|Boolean} params
   *   The optional param passed into a custom event.
   */
  dBlazy.bindEvent = function (el, eventName, fn, params) {
    this.binding('bind', el, eventName, fn, params);
  };

  /**
   * A simple wrapper for removeEventListener.
   *
   * @name dBlazy.unbindEvent
   *
   * @param {Element} el
   *   The HTML element.
   * @param {String} eventName
   *   The event name to remove.
   * @param {Function} fn
   *   The callback function.
   * @param {Object} params
   *   The optional param passed into a custom event.
   */
  dBlazy.unbindEvent = function (el, eventName, fn, params) {
    this.binding('unbind', el, eventName, fn, params);
  };

  /**
   * Executes a function once.
   *
   * @name dBlazy.once
   *
   * @author Daniel Lamb <dlamb.open.source@gmail.com>
   * @link https://github.com/daniellmb/once.js
   *
   * @param {Function} fn
   *   The executed function.
   *
   * @return {Object}
   *   The function result.
   */
  dBlazy.once = function (fn) {
    var result;
    var ran = false;
    return function proxy() {
      if (ran) {
        return result;
      }
      ran = true;
      result = fn.apply(this, arguments);
      // For garbage collection.
      fn = null;
      return result;
    };
  };

  /**
   * A simple wrapper for JSON.parse() for string within data-* attributes.
   *
   * @name dBlazy.parse
   *
   * @param {String} str
   *   The string to convert into JSON object.
   *
   * @return {Object|Boolean}
   *   The JSON object, or false in case invalid.
   */
  dBlazy.parse = function (str) {
    try {
      return JSON.parse(str);
    }
    catch (e) {
      return false;
    }
  };

  /**
   * A simple wrapper to animate anything using animate.css.
   *
   * @name dBlazy.animate
   *
   * @param {Element} el
   *   The animated HTML element.
   * @param {String} animation
   *   Any custom animation name, fallbacks to [data-animation].
   */
  dBlazy.animate = function (el, animation) {
    var me = this;
    var props = [
      'animation',
      'animation-duration',
      'animation-delay',
      'animation-iteration-count'
    ];

    animation = animation || el.dataset.animation;
    el.classList.add('animated', animation);
    me.forEach(['Duration', 'Delay', 'IterationCount'], function (key) {
      if ('animation' + key in el.dataset) {
        el.style['animation' + key] = el.dataset['animation' + key];
      }
    });

    // Supports both BG and regular image.
    var cn = me.closest(el, '.media');
    cn = cn === null ? el : cn;
    var blur = cn.querySelector('.b-blur--tmp');

    function animationEnd() {
      me.removeAttrs(el, props);

      el.classList.add('is-b-animated');
      el.classList.remove('animated', animation);

      me.forEach(props, function (key) {
        el.style.removeProperty(key);
      });

      if (blur !== null && blur.parentNode !== null) {
        blur.parentNode.removeChild(blur);
      }

      me.unbindEvent(el, 'animationend', animationEnd);
    }

    me.bindEvent(el, 'animationend', animationEnd);
  };

  /**
   * Removes common loading indicator classes.
   *
   * @name dBlazy.clearLoading
   *
   * @param {Element} el
   *   The loading HTML element.
   */
  dBlazy.clearLoading = function (el) {
    var me = this;
    // The .b-lazy element can be attached to IMG, or DIV as CSS background.
    // The .(*)loading can be .media, .grid, .slide__content, .box, etc.
    var loaders = [el, me.closest(el, '[class*="loading"]')];

    this.forEach(loaders, function (loader) {
      if (loader !== null) {
        loader.className = loader.className.replace(/(\S+)loading/g, '');
      }
    });
  };

  /**
   * A simple wrapper to delay callback function, taken out of blazy library.
   *
   * Alternative to core Drupal.debounce for D7 compatibility, and easy port.
   *
   * @name dBlazy.throttle
   *
   * @param {Function} fn
   *   The callback function.
   * @param {Int} minDelay
   *   The execution delay in milliseconds.
   * @param {Object} scope
   *   The scope of the function to apply to, normally this.
   *
   * @return {Function}
   *   The function executed at the specified minDelay.
   */
  dBlazy.throttle = function (fn, minDelay, scope) {
    var lastCall = 0;
    return function () {
      var now = +new Date();
      if (now - lastCall < minDelay) {
        return;
      }
      lastCall = now;
      fn.apply(scope, arguments);
    };
  };

  /**
   * A simple wrapper to delay callback function on window resize.
   *
   * @name dBlazy.resize
   *
   * @link https://github.com/louisremi/jquery-smartresize
   *
   * @param {Function} c
   *   The callback function.
   * @param {Int} t
   *   The timeout.
   *
   * @return {Function}
   *   The callback function.
   */
  dBlazy.resize = function (c, t) {
    window.onresize = function () {
      window.clearTimeout(t);
      t = window.setTimeout(c, 200);
    };
    return c;
  };

  /**
   * A simple wrapper for triggering event like jQuery.trigger().
   *
   * @name dBlazy.trigger
   *
   * @param {Element} elm
   *   The HTML element.
   * @param {String} eventName
   *   The event name to trigger.
   * @param {Object} custom
   *   The optional object passed into a custom event.
   * @param {Object} param
   *   The optional param passed into a custom event.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
   * @todo: See if any consistent way for both custom and native events.
   */
  dBlazy.trigger = function (elm, eventName, custom, param) {
    var event;
    var data = {
      detail: custom || {}
    };

    if (typeof param === 'undefined') {
      data.bubbles = true;
      data.cancelable = true;
    }

    // Native.
    // IE >= 9 compat, else SCRIPT445: Object doesn't support this action.
    // https://msdn.microsoft.com/library/ff975299(v=vs.85).aspx
    if (typeof window.CustomEvent === 'function') {
      event = new CustomEvent(eventName, data);
    }
    else {
      event = document.createEvent('CustomEvent');
      event.initCustomEvent(eventName, true, true, data);
    }

    elm.dispatchEvent(event);
  };

  return dBlazy;

});
;
;
/**
 * @file
 * Provides native, Intersection Observer API, or bLazy lazy loader.
 *
 * @todo Decouple Native, Aspect ratio, Picture post 2.3+, or 3+.
 */

(function (Drupal, drupalSettings, _db, window, document) {

  'use strict';

  var _dataAnimation = 'data-animation';
  var _dataDimensions = 'data-dimensions';
  var _dataBg = 'data-backgrounds';
  var _dataRatio = 'data-ratio';
  var _isNativeExecuted = false;
  var _resizeTick = 0;

  /**
   * Blazy public methods.
   *
   * @namespace
   */
  Drupal.blazy = Drupal.blazy || {
    context: null,
    init: null,
    instances: [],
    items: [],
    windowWidth: 0,
    blazySettings: drupalSettings.blazy || {},
    ioSettings: drupalSettings.blazyIo || {},
    revalidate: false,
    options: {},
    globals: function () {
      var me = this;
      var commons = {
        success: me.clearing.bind(me),
        error: me.clearing.bind(me),
        selector: '.b-lazy',
        errorClass: 'b-error',
        successClass: 'b-loaded'
      };

      return _db.extend(me.blazySettings, me.ioSettings, commons);
    },

    clearing: function (el) {
      var me = this;
      var cn = _db.closest(el, '.media');
      var an = _db.closest(el, '[' + _dataAnimation + ']');

      // Clear loading classes.
      _db.clearLoading(el);

      // Reevaluate the element.
      me.reevaluate(el);

      // Container might be the el itself for BG, do not NULL check here.
      me.updateContainer(el, cn);

      // Supports blur, animate.css for CSS background, picture, image, media.
      if (an !== null || me.has(el, _dataAnimation)) {
        _db.animate(an !== null ? an : el);
      }

      // Provides event listeners for easy overrides without full overrides.
      // Runs before native to allow native use this on its own onload event.
      _db.trigger(el, 'blazy.done', {options: me.options});

      // Initializes the native lazy loading once the first found is loaded.
      if (!_isNativeExecuted) {
        _db.trigger(me.context, 'blazy.native', {options: me.options});

        _isNativeExecuted = true;
      }
    },

    isLoaded: function (el) {
      return el !== null && el.classList.contains(this.options.successClass);
    },

    reevaluate: function (el) {
      var me = this;
      var ie = el.classList.contains('b-responsive') && el.hasAttribute('data-pfsrc');

      // In case an error, try forcing it, once.
      if (me.init !== null && _db.hasClass(el, me.options.errorClass) && !_db.hasClass(el, 'b-checked')) {
        el.classList.add('b-checked');

        // This is a rare case, hardly called, just nice to have for errors.
        window.setTimeout(function () {
          if (me.has(el, _dataBg)) {
            _db.updateBg(el, me.options.mobileFirst);
          }
          else {
            me.init.load(el);
          }
        }, 100);
      }

      // @see http://scottjehl.github.io/picturefill/
      if (window.picturefill && ie) {
        window.picturefill({
          reevaluate: true,
          elements: [el]
        });
      }
    },

    has: function (el, attribute) {
      return el !== null && el.hasAttribute(attribute);
    },

    contains: function (el, name) {
      return el !== null && el.classList.contains(name);
    },

    updateContainer: function (el, cn) {
      var me = this;
      var isPicture = _db.equal(el.parentNode, 'picture') && me.has(cn, _dataDimensions);

      // Fixed for effect Blur messes up Aspect ratio Fluid calculation.
      window.setTimeout(function () {
        if (me.isLoaded(el)) {
          // Adds context for effetcs: blur, etc. considering BG, or just media.
          (me.contains(cn, 'media') ? cn : el).classList.add('is-b-loaded');

          // Only applies to ratio fluid.
          if (isPicture) {
            me.updatePicture(el, cn);
          }

          // Basically makes multi-breakpoint BG work for IO or old bLazy once.
          if (me.has(el, _dataBg)) {
            _db.updateBg(el, me.options.mobileFirst);
          }
        }
      });
    },

    updatePicture: function (el, cn) {
      var me = this;
      var pad = Math.round(((el.naturalHeight / el.naturalWidth) * 100), 2);

      cn.style.paddingBottom = pad + '%';

      // Swap all aspect ratio once to reduce abrupt ratio changes for the rest.
      if (me.instances.length > 0) {
        var picture = function (elm) {
          if (!('blazyInstance' in elm) && !('blazyUniform' in elm)) {
            return;
          }

          if ((elm.blazyInstance === cn.blazyInstance) && (_resizeTick > 1 || !('isBlazyPicture' in elm))) {
            _db.trigger(elm, 'blazy.uniform.' + elm.blazyInstance, {pad: pad});
            elm.isBlazyPicture = true;
          }
        };

        // Uniform sizes must apply to each instance, not globally.
        _db.forEach(me.instances, function (elm) {
          Drupal.debounce(picture(elm), 201, true);
        }, me.context);
      }
    },

    /**
     * Attempts to fix for Views rewrite stripping out data URI causing 404.
     *
     * E.g.: src="image/jpg;base64 should be src="data:image/jpg;base64.
     * The "Placeholder" 1px.gif via Blazy UI costs extra HTTP requests. This is
     * a less costly solution, but not bulletproof due to being client-side
     * which means too late to the party. Yet not bad for 404s below the fold.
     * This must be run before any lazy (native, bLazy or IO) kicks in.
     *
     * @todo Remove if a permanent non-client available other than Placeholder.
     */
    fixMissingDataUri: function () {
      var me = this;
      var doc = me.context;
      var sel = me.options.selector + '[src^="image"]:not(.' + me.options.successClass + ')';
      var els = doc.querySelector(sel) === null ? [] : doc.querySelectorAll(sel);

      var fixDataUri = function (img) {
        var src = img.getAttribute('src');
        if (src.indexOf('base64') !== -1 || src.indexOf('svg+xml') !== -1) {
          img.setAttribute('src', src.replace('image', 'data:image'));
        }
      };

      if (els.length > 0) {
        _db.forEach(els, fixDataUri);
      }
    },

    /**
     * Updates the dynamic multi-breakpoint aspect ratio: bg, picture or image.
     *
     * This only applies to Responsive images with aspect ratio fluid.
     * Static ratio (media--ratio--169, etc.) is ignored and uses CSS instead.
     *
     * @param {HTMLElement} cn
     *   The .media--ratio--fluid container HTML element.
     */
    updateRatio: function (cn) {
      var me = this;
      var el = _db.closest(cn, '.blazy');
      var dimensions = _db.parse(cn.getAttribute(_dataDimensions));

      if (!dimensions) {
        me.updateFallbackRatio(cn);
        return;
      }

      // For picture, this is more a dummy space till the image is downloaded.
      var isPicture = cn.querySelector('picture') !== null && _resizeTick > 0;
      var pad = _db.activeWidth(dimensions, isPicture);

      // Provides marker for grouping between multiple instances.
      cn.blazyInstance = el !== null && 'blazyInstance' in el ? el.blazyInstance : null;
      if (pad !== 'undefined') {
        cn.style.paddingBottom = pad + '%';
      }

      // Fix for picture or bg element with resizing.
      if (_resizeTick > 0 && (isPicture || me.has(cn, _dataBg))) {
        me.updateContainer((isPicture ? cn.querySelector('img') : cn), cn);
      }
    },

    updateFallbackRatio: function (cn) {
      // Only rewrites if the style is indeed stripped out by Twig, and not set.
      if (!cn.hasAttribute('style') && cn.hasAttribute(_dataRatio)) {
        cn.style.paddingBottom = cn.getAttribute(_dataRatio) + '%';
      }
    },

    /**
     * Swap lazy attributes to let supportive browsers lazy load them.
     *
     * This means Blazy and even IO should not lazy-load them any more.
     * Ensures to not touch lazy-loaded AJAX, or likely non-supported elements:
     * Video, DIV, etc. Only IMG and IFRAME are supported for now.
     * Due to native init is deferred, the first row is still using IO/ bLazy.
     */
    doNativeLazy: function () {
      var me = this;

      if (!me.isNativeLazy()) {
        return;
      }

      var doc = me.context;
      var sel = me.options.selector + '[loading]:not(.' + me.options.successClass + ')';

      me.items = doc.querySelector(sel) === null ? [] : doc.querySelectorAll(sel);
      if (me.items.length === 0) {
        return;
      }

      var onNativeEvent = function (e) {
        var el = e.target;
        var er = e.type === 'error';

        // Refines based on actual result, runs clearing, animation, etc.
        el.classList.add(me.options[er ? 'errorClass' : 'successClass']);
        me.clearing(el);

        _db.unbindEvent(el, e.type, onNativeEvent);
      };

      var doNative = function (el) {
        // Reset attributes, and let supportive browsers lazy load natively.
        _db.setAttrs(el, ['srcset', 'src'], true);

        // Also supports PICTURE or (future) VIDEO which contains SOURCEs.
        _db.setAttrsWithSources(el, false, true);

        // Blur thumbnail is just making use of the swap due to being small.
        if (me.contains(el, 'b-blur')) {
          el.removeAttribute('loading');
        }
        else {
          // Mark it loaded to prevent bLazy/ IO to do any further work.
          el.classList.add(me.options.successClass);

          // Attempts to make nice with the harsh native, defer clearing, etc.
          _db.bindEvent(el, 'load', onNativeEvent);
          _db.bindEvent(el, 'error', onNativeEvent);
        }
      };

      var onNative = function () {
        _db.forEach(me.items, doNative);
      };

      _db.bindEvent(me.context, 'blazy.native', onNative, {once: true});
    },

    isNativeLazy: function () {
      return 'loading' in HTMLImageElement.prototype;
    },

    isIo: function () {
      return this.ioSettings && this.ioSettings.enabled && 'IntersectionObserver' in window;
    },

    isRo: function () {
      return 'ResizeObserver' in window;
    },

    isBlazy: function () {
      return !this.isIo() && 'Blazy' in window;
    },

    forEach: function (context) {
      var blazies = context.querySelectorAll('.blazy:not(.blazy--on)');

      // Various use cases: w/o formaters, custom, or basic, and mixed.
      // The [data-blazy] is set by the module for formatters, or Views gallery.
      if (blazies.length > 0) {
        _db.forEach(blazies, doBlazy, context);
      }

      // Initializes blazy, we'll decouple features from lazy load scripts.
      // We'll revert to 2.1 if any issue with this.
      initBlazy(context);
    },

    run: function (opts) {
      return this.isIo() ? new BioMedia(opts) : new Blazy(opts);
    },

    afterInit: function () {
      var me = this;
      var doc = me.context;
      var rObserver = false;
      var ratioItems = doc.querySelector('.media--ratio') === null ? [] : doc.querySelectorAll('.media--ratio');
      var shouldLoop = ratioItems.length > 0;

      var loopRatio = function (entries) {
        me.windowWidth = _db.windowWidth();

        // BC with bLazy, native/IO doesn't need to revalidate, bLazy does.
        // Scenarios: long horizontal containers, Slick carousel slidesToShow >
        // 3. If any issue, add a class `blazy--revalidate` manually to .blazy.
        if (!me.isNativeLazy() && (me.isBlazy() || me.revalidate)) {
          me.init.revalidate(true);
        }

        if (shouldLoop) {
          _db.forEach(entries, function (entry) {
            me.updateRatio('target' in entry ? entry.target : entry);
          }, doc);
        }

        _resizeTick++;
        return false;
      };

      var checkRatio = function () {
        return me.isRo() ? new ResizeObserver(loopRatio) : loopRatio(ratioItems);
      };

      // Checks for aspect ratio, onload event is a bit later.
      // Uses ResizeObserver for modern browsers, else degrades.
      rObserver = checkRatio();
      if (rObserver) {
        if (shouldLoop) {
          _db.forEach(ratioItems, function (entry) {
            rObserver.observe(entry);
          }, doc);
        }
      }
      else {
        _db.bindEvent(window, 'resize', Drupal.debounce(checkRatio, 200, true));
      }
    }
  };

  /**
   * Initialize the blazy instance, either basic, advanced, or native.
   *
   * @param {HTMLElement} context
   *   This can be document, or anything weird.
   */
  var initBlazy = function (context) {
    var me = Drupal.blazy;
    var documentElement = context instanceof HTMLDocument ? context : _db.closest(context, 'html');
    var opts = {};

    opts.mobileFirst = opts.mobileFirst || false;

    // Weirdo: documentElement is null after colorbox cbox_close event.
    documentElement = documentElement || document;

    // Set docroot in case we are in an iframe.
    if (!document.documentElement.isSameNode(documentElement)) {
      opts.root = documentElement;
    }

    me.options = _db.extend({}, me.globals(), opts);
    me.context = documentElement;

    // Old bLazy, not IO, might need scrolling CSS selector like Modal library.
    // A scrolling modal with an iframe like Entity Browser has no issue since
    // the scrolling container is the entire DOM. Another use case is parallax.
    var scrollElms = '#drupal-modal, .is-b-scroll';
    if (me.options.container) {
      scrollElms += ', ' + me.options.container.trim();
    }
    me.options.container = scrollElms;

    // Attempts to fix for Views rewrite stripping out data URI causing 404.
    me.fixMissingDataUri();

    // Swap lazy attributes to let supportive browsers lazy load them.
    me.doNativeLazy();

    // Put the blazy/IO instance into a public object for references/ overrides.
    // If native lazy load is supported, the following will skip internally.
    me.init = me.run(me.options);

    // Runs after init.
    me.afterInit();
  };

  /**
   * Blazy utility functions.
   *
   * @param {HTMLElement} elm
   *   The .blazy/[data-blazy] container, not the lazyloaded .b-lazy element.
   *
   * @todo reenable initBlazy here if any issue with the following:
   *   Each [data-blazy] may or may not:
   *     - be ajaxified, be lightboxed, have uniform or different sizes, and
   *       have few more unique features per instance, etc.
   */
  function doBlazy(elm) {
    var me = Drupal.blazy;
    var dataAttr = elm.getAttribute('data-blazy');
    var opts = (!dataAttr || dataAttr === '1') ? {} : (_db.parse(dataAttr) || {});
    var isUniform = me.contains(elm, 'blazy--field') || me.contains(elm, 'block-grid') || me.contains(elm, 'blazy--uniform');
    var instance = (Math.random() * 10000).toFixed(0);
    var eventId = 'blazy.uniform.' + instance;
    var localItems = elm.querySelector('.media--ratio') === null ? [] : elm.querySelectorAll('.media--ratio');

    me.options = _db.extend(me.options, opts);
    me.revalidate = me.revalidate || elm.classList.contains('blazy--revalidate');
    elm.classList.add('blazy--on');
    elm.blazyInstance = instance;

    if (isUniform) {
      elm.blazyUniform = true;
    }

    me.instances.push(elm);

    var swapRatio = function (e) {
      var pad = e.detail.pad || 0;

      if (pad > 10) {
        _db.forEach(localItems, function (cn) {
          cn.style.paddingBottom = pad + '%';
        }, elm);
      }
    };

    // Reduces abrupt ratio changes for the rest after the first loaded.
    // To support resizing, use debounce. To disable use {once: true}.
    if (isUniform && localItems.length > 0) {
      _db.bindEvent(elm, eventId, swapRatio);
    }
  }

  /**
   * Attaches blazy behavior to HTML element identified by .blazy/[data-blazy].
   *
   * The .blazy/[data-blazy] is the .b-lazy container, might be .field, etc.
   * The .b-lazy is the individual IMG, IFRAME, PICTURE, VIDEO, DIV, BODY, etc.
   * The lazy-loaded element is .b-lazy, not its container. Note the hypen (b-)!
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.blazy = {
    attach: function (context) {
      // Drupal.attachBehaviors already does this so if this is necessary,
      // someone does an invalid call. But let's be robust here.
      // Note: context can be unexpected <script> element with Media library.
      context = context || document;

      // Originally identified at D7, yet might happen at D8 with AJAX.
      // Prevents jQuery AJAX messes up where context might be an array.
      if ('length' in context) {
        context = context[0];
      }

      // Runs Blazy with multi-serving images, and aspect ratio supports.
      // W/o [data-blazy] to address various scenarios like custom simple works,
      // or within Views UI which is not easy to set [data-blazy] via UI.
      _db.once(Drupal.blazy.forEach(context));
    }
  };

}(Drupal, drupalSettings, dBlazy, this, this.document));
;
/**
 * @file
 * Provides CSS3 flex based on Flexbox layout.
 *
 * Credit: https://fjolt.com/article/css-grid-masonry
 */

(function (Drupal, _db, _win) {

  'use strict';

  /**
   * Applies height adjustments to each item.
   *
   * @param {HTMLElement} elm
   *   The container HTML element.
   */
  function doFlex(elm) {
    var _box = '.grid';
    var heights = {};
    var box = elm.querySelector(_box);

    if (box === null) {
      return;
    }

    var parentWith = elm.getBoundingClientRect().width;
    var boxWith = box.getBoundingClientRect().width;
    var style = _win.getComputedStyle(box);
    var itemWith = boxWith + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
    var columnWidth = Math.round((1 / (itemWith / parentWith)));
    var items = elm.querySelectorAll(_box);

    function doFlexItem(item, id) {
      var cn = item.querySelector(_box + '__content');
      var cr = cn.getBoundingClientRect();
      var ch = cr.height;
      var curColumn = id % columnWidth;
      var style = _win.getComputedStyle(item);

      if (typeof heights[curColumn] === 'undefined') {
        heights[curColumn] = 0;
      }

      item.style.height = ch + 'px';
      heights[curColumn] += ch + parseFloat(style.marginBottom);

      // If the item has an item above it, then move it to fill the gap.
      if (id - columnWidth >= 0) {
        var nh = id - columnWidth + 1;
        var itemAbove = elm.querySelector(_box + ':nth-of-type(' + nh + ')');
        var prevBottom = itemAbove.getBoundingClientRect().bottom;
        var currentTop = cr.top - parseFloat(style.marginBottom);

        item.style.top = '-' + (currentTop - prevBottom) + 'px';
      }
    }

    function init() {
      _db.forEach(items, doFlexItem);

      var max = Math.max.apply(null, Object.values(heights));
      elm.style.height = max + 'px';
    }

    _db.bindEvent(_win, 'load resize', Drupal.debounce(init, 200, true));

    elm.classList.add('is-b-loading');
    _win.setTimeout(function () {
      elm.classList.remove('is-b-loading');
    }, 600);
  }

  /**
   * Attaches Blazy behavior to HTML element identified by .block-flex.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.blazyFlex = {
    attach: function (context) {
      if ('length' in context) {
        context = context[0];
      }

      var elms = context.querySelectorAll('.block-flex');
      if (elms.length) {
        _db.once(_db.forEach(elms, doFlex, context));
      }
    }
  };

}(Drupal, dBlazy, this));
;
(function(d,a,b){function c(x,n){var q=d("> .slick__slider",n).length?d("> .slick__slider",n):d(n);var C=d("> .slick__arrow",n);var v=q.data("slick")?d.extend({},b.slick,q.data("slick")):d.extend({},b.slick);var s=d.type(v.responsive)==="array"&&v.responsive.length?v.responsive:false;var z=v.appendDots;var A;var m=v.lazyLoad==="blazy"&&a.blazy;var B=q.find(".media--player").length;var w=q.hasClass("unslick");if(!w){v.appendDots=z===".slick__arrow"?C:(z||d(q))}if(s){for(A in s){if(Object.prototype.hasOwnProperty.call(s,A)&&s[A].settings!=="unslick"){s[A].settings=d.extend({},b.slick,g(v),s[A].settings)}}}q.data("slick",v);v=q.data("slick");function e(){if(v.randomize&&!q.hasClass("slick-initiliazed")){f()}if(!w){q.on("init.sl",function(r,o){if(z===".slick__arrow"){d(o.$dots).insertAfter(o.$prevArrow)}var i=q.find(".slick-cloned.slick-active .b-lazy:not(.b-loaded)");if(m&&i.length){a.blazy.init.load(i)}})}if(m){q.on("beforeChange.sl",function(){u(true)})}else{d(".media",q).closest(".slide__content").addClass("is-loading")}q.on("setPosition.sl",function(o,i){h(i)})}function u(o){if(q.find(".b-lazy:not(.b-loaded)").length){var i=q.find(o?".slide:not(.slick-cloned) .b-lazy:not(.b-loaded)":".slick-active .b-lazy:not(.b-loaded)");if(!i.length){i=q.find(".slick-cloned .b-lazy:not(.b-loaded)")}if(i.length){a.blazy.init.load(i)}}}function y(){if(B){j()}if(m){u(false)}}function p(){q.parent().on("click.sl",".slick-down",function(o){o.preventDefault();var i=d(this);d("html, body").stop().animate({scrollTop:d(i.data("target")).offset().top-(i.data("offset")||0)},800,"easeOutQuad" in d.easing&&v.easing?v.easing:"swing")});if(v.mouseWheel){q.on("mousewheel.sl",function(i,o){i.preventDefault();return q.slick(o<0?"slickNext":"slickPrev")})}if(!m){q.on("lazyLoaded lazyLoadError",function(r,o,i){k(i)})}q.on("afterChange.sl",y);if(B){q.on("click.sl",".media__icon--close",j);q.on("click.sl",".media__icon--play",l)}}function k(i){var r=d(i);var t=r.closest(".slide")||r.closest(".unslick");r.parentsUntil(t).removeClass(function(D,E){return(E.match(/(\S+)loading/g)||[]).join(" ")});var o=r.closest(".media--background");if(o.length&&o.find("> img").length){o.css("background-image","url("+r.attr("src")+")");o.find("> img").remove();o.removeAttr("data-lazy")}}function f(){q.children().sort(function(){return 0.5-Math.random()}).each(function(){q.append(this)})}function h(o){var i=o.slideCount<=o.options.slidesToShow;var r=i||o.options.arrows===false;if(q.attr("id")===o.$slider.attr("id")){if(!o.options.centerPadding||o.options.centerPadding==="0"){o.$list.css("padding","")}if(i&&((o.$slideTrack.width()<=o.$slider.width())||d(n).hasClass("slick--thumbnail"))){o.$slideTrack.css({left:"",transform:""})}var t=q.find(".b-loaded ~ .b-loader");if(t.length){t.remove()}C[r?"addClass":"removeClass"]("visually-hidden")}}function j(){q.removeClass("is-paused");if(q.find(".is-playing").length){q.find(".is-playing").removeClass("is-playing").find(".media__icon--close").click()}}function l(){q.addClass("is-paused").slick("slickPause")}function g(i){return w?{}:{slide:i.slide,lazyLoad:i.lazyLoad,dotsClass:i.dotsClass,rtl:i.rtl,prevArrow:d(".slick-prev",C),nextArrow:d(".slick-next",C),appendArrows:C,customPaging:function(E,F){var o=E.$slides.eq(F).find("[data-thumb]")||null;var t='<img alt="'+a.t(o.find("img").attr("alt"))+'" src="'+o.data("thumb")+'">';var D=o.length&&i.dotsClass.indexOf("thumbnail")>0?'<div class="slick-dots__thumbnail">'+t+"</div>":"";var r=E.defaults.customPaging(E,F);return D?r.add(D):r}}}e();q.slick(g(v));p();if(w){q.slick("unslick")}d(n).addClass("slick--initialized")}a.behaviors.slick={attach:function(f){var e=d(".slick",f);if(e&&e.length){d(".slick",f).once("slick").each(c)}}}})(jQuery,Drupal,drupalSettings);
;
