webpackJsonp([3],{

/***/ 112:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_dom_utils__ = __webpack_require__(120);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__provide__ = __webpack_require__(122);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__usage__ = __webpack_require__(123);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utilities__ = __webpack_require__(115);
/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */








/**
 * Class for the `outboundLinkTracker` analytics.js plugin.
 * @implements {OutboundLinkTrackerPublicInterface}
 */
class OutboundLinkTracker {
  /**
   * Registers outbound link tracking on a tracker object.
   * @param {!Tracker} tracker Passed internally by analytics.js
   * @param {?Object} opts Passed by the require command.
   */
  constructor(tracker, opts) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__usage__["a" /* trackUsage */])(tracker, __WEBPACK_IMPORTED_MODULE_2__usage__["b" /* plugins */].OUTBOUND_LINK_TRACKER);

    // Feature detects to prevent errors in unsupporting browsers.
    if (!window.addEventListener) return;

    /** @type {OutboundLinkTrackerOpts} */
    const defaultOpts = {
      events: ['click'],
      linkSelector: 'a, area',
      shouldTrackOutboundLink: this.shouldTrackOutboundLink,
      fieldsObj: {},
      attributePrefix: 'ga-',
      // hitFilter: undefined,
    };

    this.opts = /** @type {OutboundLinkTrackerOpts} */ (
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__utilities__["b" /* assign */])(defaultOpts, opts));

    this.tracker = tracker;

    // Binds methods.
    this.handleLinkInteractions = this.handleLinkInteractions.bind(this);

    // Creates a mapping of events to their delegates
    this.delegates = {};
    this.opts.events.forEach((event) => {
      this.delegates[event] = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_dom_utils__["b" /* delegate */])(document, event, this.opts.linkSelector,
          this.handleLinkInteractions, {composed: true, useCapture: true});
    });
  }

  /**
   * Handles all interactions on link elements. A link is considered an outbound
   * link if its hostname property does not match location.hostname. When the
   * beacon transport method is not available, the links target is set to
   * "_blank" to ensure the hit can be sent.
   * @param {Event} event The DOM click event.
   * @param {Element} link The delegated event target.
   */
  handleLinkInteractions(event, link) {
    if (this.opts.shouldTrackOutboundLink(link, __WEBPACK_IMPORTED_MODULE_0_dom_utils__["c" /* parseUrl */])) {
      const href = link.getAttribute('href') || link.getAttribute('xlink:href');
      const url = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_dom_utils__["c" /* parseUrl */])(href);

      /** @type {FieldsObj} */
      const defaultFields = {
        transport: 'beacon',
        eventCategory: 'Outbound Link',
        eventAction: event.type,
        eventLabel: url.href,
      };

      if (!navigator.sendBeacon &&
          linkClickWillUnloadCurrentPage(event, link)) {
        // Adds a new event handler at the last minute to minimize the chances
        // that another event handler for this click will run after this logic.
        window.addEventListener('click', function(event) {
          // Checks to make sure another event handler hasn't already prevented
          // the default action. If it has the custom redirect isn't needed.
          if (!event.defaultPrevented) {
            // Stops the click and waits until the hit is complete (with
            // timeout) for browsers that don't support beacon.
            event.preventDefault();
            defaultFields.hitCallback = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__utilities__["g" /* withTimeout */])(function() {
              location.href = href;
            });
          }
        });
      }

      /** @type {FieldsObj} */
      const userFields = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__utilities__["b" /* assign */])({}, this.opts.fieldsObj,
          __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__utilities__["h" /* getAttributeFields */])(link, this.opts.attributePrefix));

      this.tracker.send('event', __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__utilities__["d" /* createFieldsObj */])(
          defaultFields, userFields, this.tracker, this.opts.hitFilter, link));
    }
  }

  /**
   * Determines whether or not the tracker should send a hit when a link is
   * clicked. By default links with a hostname property not equal to the current
   * hostname are tracked.
   * @param {Element} link The link that was clicked on.
   * @param {Function} parseUrlFn A cross-browser utility method for url
   *     parsing (note: renamed to disambiguate when compiling).
   * @return {boolean} Whether or not the link should be tracked.
   */
  shouldTrackOutboundLink(link, parseUrlFn) {
    const href = link.getAttribute('href') || link.getAttribute('xlink:href');
    const url = parseUrlFn(href);
    return url.hostname != location.hostname &&
        url.protocol.slice(0, 4) == 'http';
  }

  /**
   * Removes all event listeners and instance properties.
   */
  remove() {
    Object.keys(this.delegates).forEach((key) => {
      this.delegates[key].destroy();
    });
  }
}


__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__provide__["a" /* default */])('outboundLinkTracker', OutboundLinkTracker);


/**
 * Determines if a link click event will cause the current page to upload.
 * Note: most link clicks *will* cause the current page to unload because they
 * initiate a page navigation. The most common reason a link click won't cause
 * the page to unload is if the clicked was to open the link in a new tab.
 * @param {Event} event The DOM event.
 * @param {Element} link The link element clicked on.
 * @return {boolean} True if the current page will be unloaded.
 */
function linkClickWillUnloadCurrentPage(event, link) {
  return !(
      // The event type can be customized; we only care about clicks here.
      event.type != 'click' ||
      // Links with target="_blank" set will open in a new window/tab.
      link.target == '_blank' ||
      // On mac, command clicking will open a link in a new tab. Control
      // clicking does this on windows.
      event.metaKey || event.ctrlKey ||
      // Shift clicking in Chrome/Firefox opens the link in a new window
      // In Safari it adds the URL to a favorites list.
      event.shiftKey ||
      // On Mac, clicking with the option key is used to download a resouce.
      event.altKey ||
      // Middle mouse button clicks (which == 2) are used to open a link
      // in a new tab, and right clicks (which == 3) on Firefox trigger
      // a click event.
      event.which > 1);
}


/***/ }),

/***/ 115:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_dom_utils__ = __webpack_require__(120);
/* harmony export (immutable) */ __webpack_exports__["d"] = createFieldsObj;
/* harmony export (immutable) */ __webpack_exports__["h"] = getAttributeFields;
/* unused harmony export domReady */
/* harmony export (immutable) */ __webpack_exports__["i"] = debounce;
/* harmony export (immutable) */ __webpack_exports__["g"] = withTimeout;
/* unused harmony export camelCase */
/* harmony export (immutable) */ __webpack_exports__["f"] = capitalize;
/* harmony export (immutable) */ __webpack_exports__["e"] = isObject;
/* unused harmony export toArray */
/* harmony export (immutable) */ __webpack_exports__["c"] = now;
/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */





/**
 * Accepts default and user override fields and an optional tracker, hit
 * filter, and target element and returns a single object that can be used in
 * `ga('send', ...)` commands.
 * @param {FieldsObj} defaultFields The default fields to return.
 * @param {FieldsObj} userFields Fields set by the user to override the
 *     defaults.
 * @param {Tracker=} tracker The tracker object to apply the hit filter to.
 * @param {Function=} hitFilter A filter function that gets
 *     called with the tracker model right before the `buildHitTask`. It can
 *     be used to modify the model for the current hit only.
 * @param {Element=} target If the hit originated from an interaction
 *     with a DOM element, hitFilter is invoked with that element as the
 *     second argument.
 * @return {!FieldsObj} The final fields object.
 */
function createFieldsObj(defaultFields, userFields,
    tracker = undefined, hitFilter = undefined, target = undefined) {
  if (typeof hitFilter == 'function') {
    const originalBuildHitTask = tracker.get('buildHitTask');
    return {
      buildHitTask: (/** @type {!Model} */ model) => {
        model.set(defaultFields, null, true);
        model.set(userFields, null, true);
        hitFilter(model, target);
        originalBuildHitTask(model);
      },
    };
  } else {
    return assign({}, defaultFields, userFields);
  }
}


/**
 * Retrieves the attributes from an DOM element and returns a fields object
 * for all attributes matching the passed prefix string.
 * @param {Element} element The DOM element to get attributes from.
 * @param {string} prefix An attribute prefix. Only the attributes matching
 *     the prefix will be returned on the fields object.
 * @return {FieldsObj} An object of analytics.js fields and values
 */
function getAttributeFields(element, prefix) {
  const attributes = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_dom_utils__["a" /* getAttributes */])(element);
  const attributeFields = {};

  Object.keys(attributes).forEach(function(attribute) {
    // The `on` prefix is used for event handling but isn't a field.
    if (attribute.indexOf(prefix) === 0 && attribute != prefix + 'on') {
      let value = attributes[attribute];

      // Detects Boolean value strings.
      if (value == 'true') value = true;
      if (value == 'false') value = false;

      const field = camelCase(attribute.slice(prefix.length));
      attributeFields[field] = value;
    }
  });

  return attributeFields;
}


/**
 * Accepts a function to be invoked once the DOM is ready. If the DOM is
 * already ready, the callback is invoked immediately.
 * @param {!Function} callback The ready callback.
 */
function domReady(callback) {
  if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', function fn() {
      document.removeEventListener('DOMContentLoaded', fn);
      callback();
    });
  } else {
    callback();
  }
}


/**
 * Returns a function, that, as long as it continues to be called, will not
 * actually run. The function will only run after it stops being called for
 * `wait` milliseconds.
 * @param {!Function} fn The function to debounce.
 * @param {number} wait The debounce wait timeout in ms.
 * @return {!Function} The debounced function.
 */
function debounce(fn, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}


/**
 * Accepts a function and returns a wrapped version of the function that is
 * expected to be called elsewhere in the system. If it's not called
 * elsewhere after the timeout period, it's called regardless. The wrapper
 * function also prevents the callback from being called more than once.
 * @param {!Function} callback The function to call.
 * @param {number=} wait How many milliseconds to wait before invoking
 *     the callback.
 * @return {!Function} The wrapped version of the passed function.
 */
function withTimeout(callback, wait = 2000) {
  let called = false;
  const fn = function() {
    if (!called) {
      called = true;
      callback();
    }
  };
  setTimeout(fn, wait);
  return fn;
}


/**
 * A small shim of Object.assign that aims for brevity over spec-compliant
 * handling all the edge cases.
 * @param {!Object} target The target object to assign to.
 * @param {...Object} sources Additional objects who properties should be
 *     assigned to target.
 * @return {!Object} The modified target object.
 */
const assign = Object.assign || function(target, ...sources) {
  for (let source, i = 0; source = sources[i]; i++) {
    for (let key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
  return target;
};
/* harmony export (immutable) */ __webpack_exports__["b"] = assign;



/**
 * Accepts a string containing hyphen or underscore word separators and
 * converts it to camelCase.
 * @param {string} str The string to camelCase.
 * @return {string} The camelCased version of the string.
 */
function camelCase(str) {
  return str.replace(/[\-\_]+(\w?)/g, function(match, p1) {
    return p1.toUpperCase();
  });
}


/**
 * Capitalizes the first letter of a string.
 * @param {string} str The input string.
 * @return {string} The capitalized string
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


/**
 * Indicates whether the passed variable is a JavaScript object.
 * @param {*} value The input variable to test.
 * @return {boolean} Whether or not the test is an object.
 */
function isObject(value) {
  return typeof value == 'object' && value !== null;
}


/**
 * Accepts a value that may or may not be an array. If it is not an array,
 * it is returned as the first item in a single-item array.
 * @param {*} value The value to convert to an array if it is not.
 * @return {!Array} The array-ified value.
 */
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}


/**
 * @return {number} The current date timestamp
 */
function now() {
  return +new Date();
}


/*eslint-disable */
// https://gist.github.com/jed/982883
/** @param {?=} a */
const uuid = function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)};
/* harmony export (immutable) */ __webpack_exports__["a"] = uuid;

/*eslint-enable */


/***/ }),

/***/ 116:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = matches;
const proto = window.Element.prototype;
const nativeMatches = proto.matches ||
      proto.matchesSelector ||
      proto.webkitMatchesSelector ||
      proto.mozMatchesSelector ||
      proto.msMatchesSelector ||
      proto.oMatchesSelector;


/**
 * Tests if a DOM elements matches any of the test DOM elements or selectors.
 * @param {Element} element The DOM element to test.
 * @param {Element|string|Array<Element|string>} test A DOM element, a CSS
 *     selector, or an array of DOM elements or CSS selectors to match against.
 * @return {boolean} True of any part of the test matches.
 */
function matches(element, test) {
  // Validate input.
  if (element && element.nodeType == 1 && test) {
    // if test is a string or DOM element test it.
    if (typeof test == 'string' || test.nodeType == 1) {
      return element == test ||
          matchesSelector(element, /** @type {string} */ (test));
    } else if ('length' in test) {
      // if it has a length property iterate over the items
      // and return true if any match.
      for (let i = 0, item; item = test[i]; i++) {
        if (element == item || matchesSelector(element, item)) return true;
      }
    }
  }
  // Still here? Return false
  return false;
}


/**
 * Tests whether a DOM element matches a selector. This polyfills the native
 * Element.prototype.matches method across browsers.
 * @param {!Element} element The DOM element to test.
 * @param {string} selector The CSS selector to test element against.
 * @return {boolean} True if the selector matches.
 */
function matchesSelector(element, selector) {
  if (typeof selector != 'string') return false;
  if (nativeMatches) return nativeMatches.call(element, selector);
  const nodes = element.parentNode.querySelectorAll(selector);
  for (let i = 0, node; node = nodes[i]; i++) {
    if (node == element) return true;
  }
  return false;
}


/***/ }),

/***/ 117:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


const VERSION = '2.0.1';
/* harmony export (immutable) */ __webpack_exports__["e"] = VERSION;

const DEV_ID = 'i5iSjo';
/* harmony export (immutable) */ __webpack_exports__["b"] = DEV_ID;


const VERSION_PARAM = '_av';
/* harmony export (immutable) */ __webpack_exports__["d"] = VERSION_PARAM;

const USAGE_PARAM = '_au';
/* harmony export (immutable) */ __webpack_exports__["c"] = USAGE_PARAM;


const NULL_DIMENSION = '(not set)';
/* harmony export (immutable) */ __webpack_exports__["a"] = NULL_DIMENSION;



/***/ }),

/***/ 118:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__matches__ = __webpack_require__(116);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__parents__ = __webpack_require__(119);
/* harmony export (immutable) */ __webpack_exports__["a"] = closest;



/**
 * Gets the closest parent element that matches the passed selector.
 * @param {Element} element The element whose parents to check.
 * @param {string} selector The CSS selector to match against.
 * @param {boolean=} shouldCheckSelf True if the selector should test against
 *     the passed element itself.
 * @return {Element|undefined} The matching element or undefined.
 */
function closest(element, selector, shouldCheckSelf = false) {
  if (!(element && element.nodeType == 1 && selector)) return;
  const parentElements =
      (shouldCheckSelf ? [element] : []).concat(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__parents__["a" /* default */])(element));

  for (let i = 0, parent; parent = parentElements[i]; i++) {
    if (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__matches__["a" /* default */])(parent, selector)) return parent;
  }
}


/***/ }),

/***/ 119:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = parents;
/**
 * Returns an array of a DOM element's parent elements.
 * @param {!Element} element The DOM element whose parents to get.
 * @return {!Array} An array of all parent elemets, or an empty array if no
 *     parent elements are found.
 */
function parents(element) {
  const list = [];
  while (element && element.parentNode && element.parentNode.nodeType == 1) {
    element = /** @type {!Element} */ (element.parentNode);
    list.push(element);
  }
  return list;
}


/***/ }),

/***/ 120:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__lib_closest__ = __webpack_require__(118);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__lib_delegate__ = __webpack_require__(124);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__lib_dispatch__ = __webpack_require__(125);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__lib_get_attributes__ = __webpack_require__(126);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__lib_matches__ = __webpack_require__(116);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__lib_parents__ = __webpack_require__(119);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__lib_parse_url__ = __webpack_require__(127);
/* unused harmony reexport closest */
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_1__lib_delegate__["a"]; });
/* unused harmony reexport dispatch */
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_3__lib_get_attributes__["a"]; });
/* unused harmony reexport matches */
/* unused harmony reexport parents */
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return __WEBPACK_IMPORTED_MODULE_6__lib_parse_url__["a"]; });











/***/ }),

/***/ 122:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__constants__ = __webpack_require__(117);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utilities__ = __webpack_require__(115);
/* harmony export (immutable) */ __webpack_exports__["a"] = provide;
/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */






/**
 * Provides a plugin for use with analytics.js, accounting for the possibility
 * that the global command queue has been renamed or not yet defined.
 * @param {string} pluginName The plugin name identifier.
 * @param {Function} pluginConstructor The plugin constructor function.
 */
function provide(pluginName, pluginConstructor) {
  const gaAlias = window.GoogleAnalyticsObject || 'ga';
  window[gaAlias] = window[gaAlias] || function(...args) {
    (window[gaAlias].q = window[gaAlias].q || []).push(args);
  };

  // Adds the autotrack dev ID if not already included.
  window.gaDevIds = window.gaDevIds || [];
  if (window.gaDevIds.indexOf(__WEBPACK_IMPORTED_MODULE_0__constants__["b" /* DEV_ID */]) < 0) {
    window.gaDevIds.push(__WEBPACK_IMPORTED_MODULE_0__constants__["b" /* DEV_ID */]);
  }

  // Formally provides the plugin for use with analytics.js.
  window[gaAlias]('provide', pluginName, pluginConstructor);

  // Registers the plugin on the global gaplugins object.
  window.gaplugins = window.gaplugins || {};
  window.gaplugins[__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utilities__["f" /* capitalize */])(pluginName)] = pluginConstructor;
}


/***/ }),

/***/ 123:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__constants__ = __webpack_require__(117);
/* harmony export (immutable) */ __webpack_exports__["a"] = trackUsage;
/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */





const plugins = {
  CLEAN_URL_TRACKER: 1,
  EVENT_TRACKER: 2,
  IMPRESSION_TRACKER: 3,
  MEDIA_QUERY_TRACKER: 4,
  OUTBOUND_FORM_TRACKER: 5,
  OUTBOUND_LINK_TRACKER: 6,
  PAGE_VISIBILITY_TRACKER: 7,
  SOCIAL_WIDGET_TRACKER: 8,
  URL_CHANGE_TRACKER: 9,
  MAX_SCROLL_TRACKER: 10,
};
/* harmony export (immutable) */ __webpack_exports__["b"] = plugins;



const PLUGIN_COUNT = Object.keys(plugins).length;



/**
 * Tracks the usage of the passed plugin by encoding a value into a usage
 * string sent with all hits for the passed tracker.
 * @param {!Tracker} tracker The analytics.js tracker object.
 * @param {number} plugin The plugin enum.
 */
function trackUsage(tracker, plugin) {
  trackVersion(tracker);
  trackPlugin(tracker, plugin);
}


/**
 * Converts a hexadecimal string to a binary string.
 * @param {string} hex A hexadecimal numeric string.
 * @return {string} a binary numeric string.
 */
function convertHexToBin(hex) {
  return parseInt(hex || '0', 16).toString(2);
}


/**
 * Converts a binary string to a hexadecimal string.
 * @param {string} bin A binary numeric string.
 * @return {string} a hexadecimal numeric string.
 */
function convertBinToHex(bin) {
  return parseInt(bin || '0', 2).toString(16);
}


/**
 * Adds leading zeros to a string if it's less than a minimum length.
 * @param {string} str A string to pad.
 * @param {number} len The minimum length of the string
 * @return {string} The padded string.
 */
function padZeros(str, len) {
  if (str.length < len) {
    let toAdd = len - str.length;
    while (toAdd) {
      str = '0' + str;
      toAdd--;
    }
  }
  return str;
}


/**
 * Accepts a binary numeric string and flips the digit from 0 to 1 at the
 * specified index.
 * @param {string} str The binary numeric string.
 * @param {number} index The index to flip the bit.
 * @return {string} The new binary string with the bit flipped on
 */
function flipBitOn(str, index) {
  return str.substr(0, index) + 1 + str.substr(index + 1);
}


/**
 * Accepts a tracker and a plugin index and flips the bit at the specified
 * index on the tracker's usage parameter.
 * @param {Object} tracker An analytics.js tracker.
 * @param {number} pluginIndex The index of the plugin in the global list.
 */
function trackPlugin(tracker, pluginIndex) {
  const usageHex = tracker.get('&' + __WEBPACK_IMPORTED_MODULE_0__constants__["c" /* USAGE_PARAM */]);
  let usageBin = padZeros(convertHexToBin(usageHex), PLUGIN_COUNT);

  // Flip the bit of the plugin being tracked.
  usageBin = flipBitOn(usageBin, PLUGIN_COUNT - pluginIndex);

  // Stores the modified usage string back on the tracker.
  tracker.set('&' + __WEBPACK_IMPORTED_MODULE_0__constants__["c" /* USAGE_PARAM */], convertBinToHex(usageBin));
}


/**
 * Accepts a tracker and adds the current version to the version param.
 * @param {Object} tracker An analytics.js tracker.
 */
function trackVersion(tracker) {
  tracker.set('&' + __WEBPACK_IMPORTED_MODULE_0__constants__["d" /* VERSION_PARAM */], __WEBPACK_IMPORTED_MODULE_0__constants__["e" /* VERSION */]);
}


/***/ }),

/***/ 124:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__closest__ = __webpack_require__(118);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__matches__ = __webpack_require__(116);
/* harmony export (immutable) */ __webpack_exports__["a"] = delegate;



/**
 * Delegates the handling of events for an element matching a selector to an
 * ancestor of the matching element.
 * @param {!Node} ancestor The ancestor element to add the listener to.
 * @param {string} eventType The event type to listen to.
 * @param {string} selector A CSS selector to match against child elements.
 * @param {!Function} callback A function to run any time the event happens.
 * @param {Object=} opts A configuration options object. The available options:
 *     - useCapture<boolean>: If true, bind to the event capture phase.
 *     - deep<boolean>: If true, delegate into shadow trees.
 * @return {Object} The delegate object. It contains a destroy method.
 */
function delegate(
    ancestor, eventType, selector, callback, opts = {}) {
  // Defines the event listener.
  const listener = function(event) {
    let delegateTarget;

    // If opts.composed is true and the event originated from inside a Shadow
    // tree, check the composed path nodes.
    if (opts.composed && typeof event.composedPath == 'function') {
      const composedPath = event.composedPath();
      for (let i = 0, node; node = composedPath[i]; i++) {
        if (node.nodeType == 1 && __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__matches__["a" /* default */])(node, selector)) {
          delegateTarget = node;
        }
      }
    } else {
      // Otherwise check the parents.
      delegateTarget = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__closest__["a" /* default */])(event.target, selector, true);
    }

    if (delegateTarget) {
      callback.call(delegateTarget, event, delegateTarget);
    }
  };

  ancestor.addEventListener(eventType, listener, opts.useCapture);

  return {
    destroy: function() {
      ancestor.removeEventListener(eventType, listener, opts.useCapture);
    },
  };
}


/***/ }),

/***/ 125:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export default */
/**
 * Dispatches an event on the passed element.
 * @param {!Element} element The DOM element to dispatch the event on.
 * @param {string} eventType The type of event to dispatch.
 * @param {Object|string=} eventName A string name of the event constructor
 *     to use. Defaults to 'Event' if nothing is passed or 'CustomEvent' if
 *     a value is set on `initDict.detail`. If eventName is given an object
 *     it is assumed to be initDict and thus reassigned.
 * @param {Object=} initDict The initialization attributes for the
 *     event. A `detail` property can be used here to pass custom data.
 * @return {boolean} The return value of `element.dispatchEvent`, which will
 *     be false if any of the event listeners called `preventDefault`.
 */
function dispatch(
    element, eventType, eventName = 'Event', initDict = {}) {
  let event;
  let isCustom;

  // eventName is optional
  if (typeof eventName == 'object') {
    initDict = eventName;
    eventName = 'Event';
  }

  initDict.bubbles = initDict.bubbles || false;
  initDict.cancelable = initDict.cancelable || false;
  initDict.composed = initDict.composed || false;

  // If a detail property is passed, this is a custom event.
  if ('detail' in initDict) isCustom = true;
  eventName = isCustom ? 'CustomEvent' : eventName;

  // Tries to create the event using constructors, if that doesn't work,
  // fallback to `document.createEvent()`.
  try {
    event = new window[eventName](eventType, initDict);
  } catch(err) {
    event = document.createEvent(eventName);
    const initMethod = 'init' + (isCustom ? 'Custom' : '') + 'Event';
    event[initMethod](eventType, initDict.bubbles,
                      initDict.cancelable, initDict.detail);
  }

  return element.dispatchEvent(event);
}


/***/ }),

/***/ 126:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = getAttributes;
/**
 * Gets all attributes of an element as a plain JavaScriot object.
 * @param {Element} element The element whose attributes to get.
 * @return {!Object} An object whose keys are the attribute keys and whose
 *     values are the attribute values. If no attributes exist, an empty
 *     object is returned.
 */
function getAttributes(element) {
  const attrs = {};

  // Validate input.
  if (!(element && element.nodeType == 1)) return attrs;

  // Return an empty object if there are no attributes.
  const map = element.attributes;
  if (map.length === 0) return {};

  for (let i = 0, attr; attr = map[i]; i++) {
    attrs[attr.name] = attr.value;
  }
  return attrs;
}


/***/ }),

/***/ 127:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = parseUrl;
const HTTP_PORT = '80';
const HTTPS_PORT = '443';
const DEFAULT_PORT = RegExp(':(' + HTTP_PORT + '|' + HTTPS_PORT + ')$');


const a = document.createElement('a');
const cache = {};


/**
 * Parses the given url and returns an object mimicing a `Location` object.
 * @param {string} url The url to parse.
 * @return {!Object} An object with the same properties as a `Location`.
 */
function parseUrl(url) {
  // All falsy values (as well as ".") should map to the current URL.
  url = (!url || url == '.') ? location.href : url;

  if (cache[url]) return cache[url];

  a.href = url;

  // When parsing file relative paths (e.g. `../index.html`), IE will correctly
  // resolve the `href` property but will keep the `..` in the `path` property.
  // It will also not include the `host` or `hostname` properties. Furthermore,
  // IE will sometimes return no protocol or just a colon, especially for things
  // like relative protocol URLs (e.g. "//google.com").
  // To workaround all of these issues, we reparse with the full URL from the
  // `href` property.
  if (url.charAt(0) == '.' || url.charAt(0) == '/') return parseUrl(a.href);

  // Don't include default ports.
  let port = (a.port == HTTP_PORT || a.port == HTTPS_PORT) ? '' : a.port;

  // PhantomJS sets the port to "0" when using the file: protocol.
  port = port == '0' ? '' : port;

  // Sometimes IE incorrectly includes a port for default ports
  // (e.g. `:80` or `:443`) even when no port is specified in the URL.
  // http://bit.ly/1rQNoMg
  const host = a.host.replace(DEFAULT_PORT, '');

  // Not all browser support `origin` so we have to build it.
  const origin = a.origin ? a.origin : a.protocol + '//' + host;

  // Sometimes IE doesn't include the leading slash for pathname.
  // http://bit.ly/1rQNoMg
  const pathname = a.pathname.charAt(0) == '/' ? a.pathname : '/' + a.pathname;

  return cache[url] = {
    hash: a.hash,
    host: host,
    hostname: a.hostname,
    href: a.href,
    origin: origin,
    pathname: pathname,
    port: port,
    protocol: a.protocol,
    search: a.search,
  };
}


/***/ })

});