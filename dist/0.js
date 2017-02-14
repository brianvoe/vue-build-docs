webpackJsonp([0],{

/***/ 113:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__constants__ = __webpack_require__(117);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__method_chain__ = __webpack_require__(121);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__provide__ = __webpack_require__(122);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__session__ = __webpack_require__(130);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__store__ = __webpack_require__(128);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__usage__ = __webpack_require__(123);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__utilities__ = __webpack_require__(115);
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











const HIDDEN = 'hidden';
const VISIBLE = 'visible';
const PAGE_ID = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__utilities__["a" /* uuid */])();
const SECONDS = 1000;


/**
 * Class for the `pageVisibilityTracker` analytics.js plugin.
 * @implements {PageVisibilityTrackerPublicInterface}
 */
class PageVisibilityTracker {
  /**
   * Registers outbound link tracking on tracker object.
   * @param {!Tracker} tracker Passed internally by analytics.js
   * @param {?Object} opts Passed by the require command.
   */
  constructor(tracker, opts) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__usage__["a" /* trackUsage */])(tracker, __WEBPACK_IMPORTED_MODULE_5__usage__["b" /* plugins */].PAGE_VISIBILITY_TRACKER);

    // Feature detects to prevent errors in unsupporting browsers.
    if (!window.addEventListener) return;

    /** @type {PageVisibilityTrackerOpts} */
    const defaultOpts = {
      sessionTimeout: __WEBPACK_IMPORTED_MODULE_3__session__["a" /* default */].DEFAULT_TIMEOUT,
      // timeZone: undefined,
      // visibleMetricIndex: undefined,
      fieldsObj: {},
      // hitFilter: undefined
    };

    this.opts = /** @type {PageVisibilityTrackerOpts} */ (
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__utilities__["b" /* assign */])(defaultOpts, opts));

    this.tracker = tracker;
    this.lastPageState = null;

    // Binds methods to `this`.
    this.trackerSetOverride = this.trackerSetOverride.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleWindowUnload = this.handleWindowUnload.bind(this);
    this.handleExternalStoreSet = this.handleExternalStoreSet.bind(this);

    // Creates the store and binds storage change events.
    this.store = __WEBPACK_IMPORTED_MODULE_4__store__["a" /* default */].getOrCreate(
        tracker.get('trackingId'), 'plugins/page-visibility-tracker');
    this.store.on('externalSet', this.handleExternalStoreSet);

    // Creates the session and binds session events.
    this.session = new __WEBPACK_IMPORTED_MODULE_3__session__["a" /* default */](
        tracker, this.opts.sessionTimeout, this.opts.timeZone);

    // Override the built-in tracker.set method to watch for changes.
    __WEBPACK_IMPORTED_MODULE_1__method_chain__["a" /* default */].add(tracker, 'set', this.trackerSetOverride);

    document.addEventListener('visibilitychange', this.handleChange);
    window.addEventListener('unload', this.handleWindowUnload);
    if (document.visibilityState == VISIBLE) {
      this.handleChange();
    }
  }

  /**
   * Inspects the last visibility state change data and determines if a
   * visibility event needs to be tracked based on the current visibility
   * state and whether or not the session has expired. If the session has
   * expired, a change to `visible` will trigger an additional pageview.
   * This method also sends as the event value (and optionally a custom metric)
   * the elapsed time between this event and the previously reported change
   * in the same session, allowing you to more accurately determine when users
   * were actually looking at your page versus when it was in the background.
   */
  handleChange() {
    const lastStoredChange = this.validateChangeData(this.store.get());

    /** @type {PageVisibilityStoreData} */
    const change = {
      time: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__utilities__["c" /* now */])(),
      state: document.visibilityState,
      pageId: PAGE_ID,
    };

    if (this.session.isExpired()) {
      if (document.visibilityState == HIDDEN) {
        // Hidden events should never be sent if a session has expired (if
        // they are, they'll likely start a new session with just this event).
        this.store.clear();
      } else {
        // If the session has expired, changes to visible should be considered
        // a new pageview rather than a visibility event.
        // This behavior ensures all sessions contain a pageview so
        // session-level page dimensions and metrics (e.g. ga:landingPagePath
        // and ga:entrances) are correct.

        /** @type {FieldsObj} */
        const defaultFields = {transport: 'beacon'};
        this.tracker.send('pageview',
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__utilities__["d" /* createFieldsObj */])(defaultFields, this.opts.fieldsObj,
                this.tracker, this.opts.hitFilter));

        this.store.set(change);
      }
    } else {
      if (lastStoredChange.pageId == PAGE_ID &&
          lastStoredChange.state == VISIBLE) {
        this.sendPageVisibilityEvent(lastStoredChange);
      }
      this.store.set(change);
    }

    this.lastPageState = document.visibilityState;
  }

  /**
   * Retroactively updates the stored change data in cases where it's known to
   * be out of sync.
   * This plugin keeps track of each visiblity change and stores the last one
   * in localStorage. LocalStorage is used to handle situations where the user
   * has multiple page open at the same time and we don't want to
   * double-report page visibility in those cases.
   * However, a problem can occur if a user closes a page when one or more
   * visible pages are still open. In such cases it's impossible to know
   * which of the remaining pages the user will interact with next.
   * To solve this problem we wait for the next change on any page and then
   * retroactively update the stored data to reflect the current page as being
   * the page on which the last change event occured and measure visibility
   * from that point.
   * @param {PageVisibilityStoreData} lastStoredChange
   * @return {PageVisibilityStoreData}
   */
  validateChangeData(lastStoredChange) {
    if (this.lastPageState == VISIBLE &&
        lastStoredChange.state == HIDDEN &&
        lastStoredChange.pageId != PAGE_ID) {
      lastStoredChange.state = VISIBLE;
      lastStoredChange.pageId = PAGE_ID;
      this.store.set(lastStoredChange);
    }
    return lastStoredChange;
  }

  /**
   * Sends a Page Visibility event with the passed event action and visibility
   * state. If a previous state change exists within the same session, the time
   * delta is tracked as the event label and optionally as a custom metric.
   * @param {PageVisibilityStoreData} lastStoredChange
   * @param {number|undefined=} hitTime A hit timestap used to help ensure
   *     original order when reporting across multiple windows/tabs.
   */
  sendPageVisibilityEvent(lastStoredChange, hitTime = undefined) {
    /** @type {FieldsObj} */
    const defaultFields = {
      transport: 'beacon',
      nonInteraction: true,
      eventCategory: 'Page Visibility',
      eventAction: 'track',
      eventLabel: __WEBPACK_IMPORTED_MODULE_0__constants__["a" /* NULL_DIMENSION */],
    };
    if (hitTime) {
      defaultFields.queueTime = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__utilities__["c" /* now */])() - hitTime;
    }

    const delta = this.getTimeSinceLastStoredChange(lastStoredChange, hitTime);

    // If at least a one second delta exists, report it.
    if (delta) {
      defaultFields.eventValue = delta;

      // If a custom metric was specified, set it equal to the event value.
      if (this.opts.visibleMetricIndex) {
        defaultFields['metric' + this.opts.visibleMetricIndex] = delta;
      }
    }

    this.tracker.send('event',
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__utilities__["d" /* createFieldsObj */])(defaultFields, this.opts.fieldsObj,
            this.tracker, this.opts.hitFilter));
  }

  /**
   * Detects changes to the tracker object and triggers an update if the page
   * field has changed.
   * @param {function(...*)} originalMethod A reference to the overridden
   *     method.
   * @return {function(...*)}
   */
  trackerSetOverride(originalMethod) {
    return (...args) => {
      /** @type {!FieldsObj} */
      const fields = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__utilities__["e" /* isObject */])(args[0]) ? args[0] : {[args[0]]: args[1]};
      if (fields.page && fields.page !== this.tracker.get('page')) {
        if (this.lastPageState == VISIBLE) {
          this.handleChange();
        }
      }
      originalMethod(...args);
    };
  }

  /**
   * Calculates the time since the last visibility change event in the current
   * session. If the session has expired the reported time is zero.
   * @param {PageVisibilityStoreData} lastStoredChange
   * @param {number=} hitTime The timestamp of the current hit, defaulting
   *     to now.
   * @return {number} The time (in ms) since the last change.
   */
  getTimeSinceLastStoredChange(lastStoredChange, hitTime = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__utilities__["c" /* now */])()) {
    const isSessionActive = !this.session.isExpired();
    const timeSinceLastStoredChange = lastStoredChange.time &&
        Math.round((hitTime - lastStoredChange.time) / SECONDS);

    return isSessionActive &&
        timeSinceLastStoredChange > 0 ? timeSinceLastStoredChange : 0;
  }

  /**
   * Handles responding to the `storage` event.
   * The code on this page needs to be informed when other tabs or windows are
   * updating the stored page visibility state data. This method checks to see
   * if a hidden state is stored when there are still visible tabs open, which
   * can happen if multiple windows are open at the same time.
   * @param {PageVisibilityStoreData} newData
   * @param {PageVisibilityStoreData} oldData
   */
  handleExternalStoreSet(newData, oldData) {
    // If the change times are the same, then the previous write only
    // updated the active page ID. It didn't enter a new state and thus no
    // hits should be sent.
    if (newData.time == oldData.time) return;

    // Page Visibility events must be sent by the tracker on the page
    // where the original event occurred. So if a change happens on another
    // page, but this page is where the previous change event occurred, then
    // this page is the one that needs to send the event (so all dimension
    // data is correct).
    if (oldData.pageId == PAGE_ID &&
        oldData.state == VISIBLE) {
      this.sendPageVisibilityEvent(oldData, newData.time);
    }
  }

  /**
   * Handles responding to the `unload` event.
   * Since some browsers don't emit a `visibilitychange` event in all cases
   * where a page might be unloaded, it's necessary to hook into the `unload`
   * event to ensure the correct state is always stored.
   */
  handleWindowUnload() {
    // If the stored visibility state isn't hidden when the unload event
    // fires, it means the visibilitychange event didn't fire as the document
    // was being unloaded, so we invoke it manually.
    if (this.lastPageState != HIDDEN) {
      this.handleChange();
    }
  }

  /**
   * Removes all event listeners and restores overridden methods.
   */
  remove() {
    this.session.destroy();
    __WEBPACK_IMPORTED_MODULE_1__method_chain__["a" /* default */].remove(this.tracker, 'set', this.trackerSetOverride);
    window.removeEventListener('unload', this.handleWindowUnload);
    document.removeEventListener('visibilitychange', this.handleChange);
  }
}


__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__provide__["a" /* default */])('pageVisibilityTracker', PageVisibilityTracker);


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

/***/ 121:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Copyright 2017 Google Inc. All Rights Reserved.
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
 * @fileoverview
 * The functions exported by this module make it easier (and safer) to override
 * foreign object methods (in a modular way) and respond to or modify their
 * invocation. The primary feature is the ability to override a method without
 * worrying if it's already been overridden somewhere else in the codebase. It
 * also allows for safe restoring of an overridden method by only fully
 * restoring a method once all overrides have been removed.
 */


const instances = [];


/**
 * A class that wraps a foreign object method and emit events before and
 * after the original method is called.
 */
class MethodChain {
  /**
   * Adds the passed override method to the list of method chain overrides.
   * @param {!Object} context The object containing the method to chain.
   * @param {string} methodName The name of the method on the object.
   * @param {!Function} methodOverride The override method to add.
   */
  static add(context, methodName, methodOverride) {
    getOrCreateMethodChain(context, methodName).add(methodOverride);
  }

  /**
   * Removes a method chain added via `add()`. If the override is the
   * only override added, the original method is restored.
   * @param {!Object} context The object containing the method to unchain.
   * @param {string} methodName The name of the method on the object.
   * @param {!Function} methodOverride The override method to remove.
   */
  static remove(context, methodName, methodOverride) {
    getOrCreateMethodChain(context, methodName).remove(methodOverride)
  }

  /**
   * Wraps a foreign object method and overrides it. Also stores a reference
   * to the original method so it can be restored later.
   * @param {!Object} context The object containing the method.
   * @param {string} methodName The name of the method on the object.
   */
  constructor(context, methodName) {
    this.context = context;
    this.methodName = methodName;
    this.isTask = /Task$/.test(methodName);

    this.originalMethodReference = this.isTask ?
        context.get(methodName) : context[methodName];

    this.methodChain = [];
    this.boundMethodChain = [];

    // Wraps the original method.
    this.wrappedMethod = (...args) => {
      const lastBoundMethod =
          this.boundMethodChain[this.boundMethodChain.length - 1];

      return lastBoundMethod(...args);
    };

    // Override original method with the wrapped one.
    if (this.isTask) {
      context.set(methodName, this.wrappedMethod);
    } else {
      context[methodName] = this.wrappedMethod;
    }
  }

  /**
   * Adds a method to the method chain.
   * @param {!Function} overrideMethod The override method to add.
   */
  add(overrideMethod) {
    this.methodChain.push(overrideMethod);
    this.rebindMethodChain();
  }

  /**
   * Removes a method from the method chain and restores the prior order.
   * @param {!Function} overrideMethod The override method to remove.
   */
  remove(overrideMethod) {
    const index = this.methodChain.indexOf(overrideMethod);
    if (index > -1) {
      this.methodChain.splice(index, 1);
      if (this.methodChain.length > 0) {
        this.rebindMethodChain();
      } else {
        this.destroy();
      }
    }
  }

  /**
   * Loops through the method chain array and recreates the bound method
   * chain array. This is necessary any time a method is added or removed
   * to ensure proper original method context and order.
   */
  rebindMethodChain() {
    this.boundMethodChain = [];
    for (let method, i = 0; method = this.methodChain[i]; i++) {
      const previousMethod = this.boundMethodChain[i - 1] ||
          this.originalMethodReference.bind(this.context);
      this.boundMethodChain.push(method(previousMethod));
    }
  }

  /**
   * Calls super and destroys the instance if no registered handlers remain.
   */
  destroy() {
    const index = instances.indexOf(this);
    if (index > -1) {
      instances.splice(index, 1);
      if (this.isTask) {
        this.context.set(this.methodName, this.originalMethodReference);
      } else {
        this.context[this.methodName] = this.originalMethodReference;
      }
    }
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = MethodChain;



/**
 * Gets a MethodChain instance for the passed object and method. If the method
 * has already been wrapped via an existing MethodChain instance, that
 * instance is returned.
 * @param {!Object} context The object containing the method.
 * @param {string} methodName The name of the method on the object.
 * @return {!MethodChain}
 */
function getOrCreateMethodChain(context, methodName) {
  let methodChain = instances
      .filter((h) => h.context == context && h.methodName == methodName)[0];

  if (!methodChain) {
    methodChain = new MethodChain(context, methodName);
    instances.push(methodChain);
  }
  return methodChain;
}


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


/***/ }),

/***/ 128:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__event_emitter__ = __webpack_require__(129);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utilities__ = __webpack_require__(115);
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






const AUTOTRACK_PREFIX = 'autotrack';
const instances = {};
let isListening = false;


/**
 * A storage object to simplify interacting with localStorage.
 */
class Store extends __WEBPACK_IMPORTED_MODULE_0__event_emitter__["a" /* default */] {
  /**
   * Gets an existing instance for the passed arguements or creates a new
   * instance if one doesn't exist.
   * @param {string} trackingId The tracking ID for the GA property.
   * @param {string} namespace A namespace unique to this store.
   * @param {Object=} defaults An optional object of key/value defaults.
   * @return {Store} The Store instance.
   */
  static getOrCreate(trackingId, namespace, defaults) {
    const key = [AUTOTRACK_PREFIX, trackingId, namespace].join(':');

    // Don't create multiple instances for the same tracking Id and namespace.
    if (!instances[key]) {
      instances[key] = new Store(key, defaults);
      instances[key].key = key;
      if (!isListening) initStorageListener();
    }
    return instances[key];
  }

  /**
   * @param {string} key A key unique to this store.
   * @param {Object=} defaults An optional object of key/value defaults.
   */
  constructor(key, defaults) {
    super();
    this.key = key;
    this.defaults = defaults || {};
  }

  /**
   * Gets the data stored in localStorage for this store.
   * @return {!Object} The stored data merged with the defaults.
   */
  get() {
    const storedItem = String(window.localStorage &&
        window.localStorage.getItem(this.key));

    if (typeof storedItem != 'string') return {};
    // TODO(philipwalton): Implement schema migrations if/when a new
    // schema version is introduced.
    return parse(storedItem, this.defaults);
  }

  /**
   * Saves the passed data object to localStorage,
   * merging it with the existing data.
   * @param {Object} newData The data to save.
   */
  set(newData) {
    const oldData = this.get();
    const mergedData = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utilities__["b" /* assign */])(oldData, newData);
    window.localStorage &&
        window.localStorage.setItem(this.key, JSON.stringify(mergedData));
  }

  /**
   * Clears the data in localStorage for the current store.
   */
  clear() {
    window.localStorage && window.localStorage.removeItem(this.key);
  }

  /**
   * Removes the store instance for the global instances map. If this is the
   * last store instance, the storage listener is also removed.
   * Note: this does not erase the stored data. Use `clear()` for that.
   */
  destroy() {
    delete instances[this.key];
    if (!Object.keys(instances).length) {
      removeStorageListener();
    }
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Store;



/**
 * Adds a single storage event listener and flips the global `isListening`
 * flag so multiple events aren't added.
 */
function initStorageListener() {
  window.addEventListener('storage', storageListener);
  isListening = true;
}


/**
 * Removes the storage event listener and flips the global `isListening`
 * flag so it can be re-added later.
 */
function removeStorageListener() {
  window.removeEventListener('storage', storageListener);
  isListening = false;
}


/**
 * The global storage event listener.
 * @param {!Event} event The DOM event.
 */
function storageListener(event) {
  const store = instances[event.key];
  if (store) {
    const oldData = parse(event.oldValue, store.defaults);
    const newData = parse(event.newValue, store.defaults);
    store.emit('externalSet', newData, oldData);
  }
}


/**
 * Parses a source string as JSON and merges the result with the passed
 * defaults object. If an error occurs while
 * @param {string} source A JSON string of data.
 * @param {!Object} defaults An object of key/value defaults.
 * @return {!Object} The parsed data object merged with the passed defaults.
 */
function parse(source, defaults) {
  let data;
  try {
    data = /** @type {!Object} */ (JSON.parse(source));
  } catch(err) {
    data = {};
  }
  return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utilities__["b" /* assign */])({}, defaults, data);
}


/***/ }),

/***/ 129:
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


/**
 * An simple reimplementation of the native Node.js EventEmitter class.
 * The goal of this implementation is to be as small as possible.
 */
class EventEmitter {
  /**
   * Creates the event registry.
   */
  constructor() {
    this.registry_ = {};
  }

  /**
   * Adds a handler function to the registry for the passed event.
   * @param {string} event The event name.
   * @param {!Function} fn The handler to be invoked when the passed
   *     event is emitted.
   */
  on(event, fn) {
    this.getRegistry_(event).push(fn);
  }

  /**
   * Removes a handler function from the registry for the passed event.
   * @param {string=} event The event name.
   * @param {Function=} fn The handler to be removed.
   */
  off(event = undefined, fn = undefined) {
    if (event && fn) {
      const eventRegistry = this.getRegistry_(event);
      const handlerIndex = eventRegistry.indexOf(fn);
      if (handlerIndex > -1) {
        eventRegistry.splice(handlerIndex, 1);
      }
    } else {
      this.registry_ = {};
    }
  }

  /**
   * Runs all registered handlers for the passed event with the optional args.
   * @param {string} event The event name.
   * @param {...*} args The arguments to be passed to the handler.
   */
  emit(event, ...args) {
    this.getRegistry_(event).forEach((fn) => fn(...args));
  }

  /**
   * Returns the total number of event handlers currently registered.
   * @return {number}
   */
  getEventCount() {
    let eventCount = 0;
    Object.keys(this.registry_).forEach((event) => {
      eventCount += this.getRegistry_(event).length;
    });
    return eventCount;
  }

  /**
   * Returns an array of handlers associated with the passed event name.
   * If no handlers have been registered, an empty array is returned.
   * @private
   * @param {string} event The event name.
   * @return {!Array} An array of handler functions.
   */
  getRegistry_(event) {
    return this.registry_[event] = (this.registry_[event] || []);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = EventEmitter;



/***/ }),

/***/ 130:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__method_chain__ = __webpack_require__(121);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__store__ = __webpack_require__(128);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utilities__ = __webpack_require__(115);
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







const SECONDS = 1000;
const MINUTES = 60 * SECONDS;


const instances = {};


/**
 * A session management class that helps track session boundaries
 * across multiple open tabs/windows.
 */
class Session {
  /**
   * Gets an existing instance for the passed arguments or creates a new
   * instance if one doesn't exist.
   * @param {!Tracker} tracker An analytics.js tracker object.
   * @param {number} timeout The session timeout (in minutes). This value
   *     should match what's set in the "Session settings" section of the
   *     Google Analytics admin.
   * @param {string=} timeZone The optional IANA time zone of the view. This
   *     value should match what's set in the "View settings" section of the
   *     Google Analytics admin. (Note: this assumes all views for the property
   *     use the same time zone. If that's not true, it's better not to use
   *     this feature).
   * @return {Session} The Session instance.
   */
  static getOrCreate(tracker, timeout, timeZone) {
    // Don't create multiple instances for the same property.
    const trackingId = tracker.get('trackingId');
    if (instances[trackingId]) {
      return instances[trackingId];
    } else {
      return instances[trackingId] = new Session(tracker, timeout, timeZone);
    }
  }

  /**
   * @param {!Tracker} tracker An analytics.js tracker object.
   * @param {number} timeout The session timeout (in minutes). This value
   *     should match what's set in the "Session settings" section of the
   *     Google Analytics admin.
   * @param {string=} timeZone The optional IANA time zone of the view. This
   *     value should match what's set in the "View settings" section of the
   *     Google Analytics admin. (Note: this assumes all views for the property
   *     use the same time zone. If that's not true, it's better not to use
   *     this feature).
   */
  constructor(tracker, timeout, timeZone) {
    this.tracker = tracker;
    this.timeout = timeout || Session.DEFAULT_TIMEOUT;
    this.timeZone = timeZone;

    // Binds methods.
    this.sendHitTaskOverride = this.sendHitTaskOverride.bind(this);

    // Overrides into the trackers sendHitTask method.
    __WEBPACK_IMPORTED_MODULE_0__method_chain__["a" /* default */].add(tracker, 'sendHitTask', this.sendHitTaskOverride);

    // Some browser doesn't support various features of the
    // `Intl.DateTimeFormat` API, so we have to try/catch it. Consequently,
    // this allows us to assume the presence of `this.dateTimeFormatter` means
    // it works in the current browser.
    try {
      this.dateTimeFormatter =
          new Intl.DateTimeFormat('en-US', {timeZone: this.timeZone});
    } catch(err) {
      // Do nothing.
    }

    // Creates the session store and adds change listeners.
    /** @type {SessionStoreData} */
    const defaultProps = {
      hitTime: 0,
      isExpired: false,
    };
    this.store = __WEBPACK_IMPORTED_MODULE_1__store__["a" /* default */].getOrCreate(
        tracker.get('trackingId'), 'session', defaultProps);
  }

  /**
   * Accepts a tracker object and returns whether or not the session for that
   * tracker has expired. A session can expire for two reasons:
   *   - More than 30 minutes has elapsed since the previous hit
   *     was sent (The 30 minutes number is the Google Analytics default, but
   *     it can be modified in GA admin "Session settings").
   *   - A new day has started since the previous hit, in the
   *     specified time zone (should correspond to the time zone of the
   *     property's views).
   *
   * Note: since real session boundaries are determined at processing time,
   * this is just a best guess rather than a source of truth.
   *
   * @param {SessionStoreData=} sessionData An optional sessionData object
   *     which avoids an additional localStorage read if the data is known to
   *     be fresh.
   * @return {boolean} True if the session has expired.
   */
  isExpired(sessionData = this.store.get()) {
    // True if the sessionControl field was set to 'end' on the previous hit.
    if (sessionData.isExpired) return true;

    const currentDate = new Date();
    const oldHitTime = sessionData.hitTime;
    const oldHitDate = oldHitTime && new Date(oldHitTime);

    if (oldHitTime) {
      if (currentDate - oldHitDate > (this.timeout * MINUTES)) {
        // If more time has elapsed than the session expiry time,
        // the session has expired.
        return true;
      } else if (this.datesAreDifferentInTimezone(currentDate, oldHitDate)) {
        // A new day has started since the previous hit, which means the
        // session has expired.
        return true;
      }
    }

    // For all other cases return false.
    return false;
  }

  /**
   * Returns true if (and only if) the timezone date formatting is supported
   * in the current browser and if the two dates are diffinitiabely not the
   * same date in the session timezone. Anything short of this returns false.
   * @param {!Date} d1
   * @param {!Date} d2
   * @return {boolean}
   */
  datesAreDifferentInTimezone(d1, d2) {
    if (!this.dateTimeFormatter) {
      return false;
    } else {
      return this.dateTimeFormatter.format(d1)
          != this.dateTimeFormatter.format(d2);
    }


  }

  /**
   * Keeps track of when the previous hit was sent to determine if a session
   * has expired. Also inspects the `sessionControl` field to handles
   * expiration accordingly.
   * @param {function(!Model)} originalMethod A reference to the overridden
   *     method.
   * @return {function(!Model)}
   */
  sendHitTaskOverride(originalMethod) {
    return (model) => {
      originalMethod(model);

      const sessionData = this.store.get();
      const isSessionExpired = this.isExpired(sessionData);
      const sessionControl = model.get('sessionControl');

      const sessionWillStart = sessionControl == 'start' || isSessionExpired;
      const sessionWillEnd = sessionControl == 'end';

      // Update the stored session data.
      sessionData.hitTime = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utilities__["c" /* now */])();
      if (sessionWillStart) {
        sessionData.isExpired = false;
      }
      if (sessionWillEnd) {
        sessionData.isExpired = true;
      }
      this.store.set(sessionData);
    }
  }

  /**
   * Restores the tracker's original `sendHitTask` to the state before
   * session control was initialized and removes this instance from the global
   * store.
   */
  destroy() {
    __WEBPACK_IMPORTED_MODULE_0__method_chain__["a" /* default */].remove(this.tracker, 'sendHitTask', this.sendHitTaskOverride);
    this.store.destroy();
    delete instances[this.tracker.get('trackingId')];
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Session;



Session.DEFAULT_TIMEOUT = 30; // minutes


/***/ })

});