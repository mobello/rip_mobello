/*
   Copyright (c) 2012 KT Corp.
  
   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Lesser General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Lesser General Public License for more details.

   You should have received a copy of the GNU Lesser General Public License
   along with This program.  If not, see <http://www.gnu.org/licenses/>.
*/
(function (GLOBAL) {

      // Mapping of normalized type names for tau.typeOf()
  var _OBJ2TYPE = {
      '[object Boolean]'  : 'boolean',
      '[object Number]'   : 'number',
      '[object String]'   : 'string',
      '[object Function]' : 'function',
      '[object Object]'   : 'object',
      '[object Array]'    : 'array',
      '[object Date]'     : 'date',
      '[object RegExp]'   : 'regexp',
      '[object Error]'    : 'error'
    },

    // Sub module map
    _MODULE = {},

    // Unique id seed (incremented as new IDs are created)
    _idSeed = new Date().getTime(),

    // URL RegExp 
    _URLREGEXP = /^(\w+:)?\/\/\/?([^\/?#]+)/,

    // Root URL
    _ROOTURL = (function () {
      var parts = _URLREGEXP.exec(GLOBAL.location.href);
      return _OBJ2TYPE[Object.prototype.toString.call(parts)] === 'array' ? 
          parts[0] : GLOBAL.location.protocol + '//' + GLOBAL.location.host;
    }) (),
    
    _ROOT_DOM = null,
    
    // requestAnimationFrame
    _requestAnimationFrame = (function() {
      return window.requestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.oRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(callback) { return setTimeout(callback, 17); };
    })(),
    
    // cancelRequestAnimationFrame
    _cancelRequestAnimationFrame = (function () {
        return window.cancelRequestAnimationFrame
        || window.webkitCancelAnimationFrame
        || window.webkitCancelRequestAnimationFrame
        || window.mozCancelRequestAnimationFrame
        || window.oCancelRequestAnimationFrame
        || window.msCancelRequestAnimationFrame
        || clearTimeout;
    })();


  if (typeof tau == 'undefined') {
    /** @namesapce Tau Framework Root Namespace */
    tau = {

      // Mobello Framework version
      VER: '1.0',
      
      /**
       * Mobello Framework이 허용하는 전체 화면 너비
       * @returns {Number} 
       */
      getWidth: function () {
       if (!_ROOT_DOM) {
         _ROOT_DOM = document.getElementById('tau-root'); 
       }
       return _ROOT_DOM ? (_ROOT_DOM.clientWidth || _ROOT_DOM.offsetWidth) : window.innerWidth;
      },
      
      /**
       * Mobello Framework이 허용하는 전체 화면 높이
       * @returns {Number} 
       */
      getHeight: function () {
        if (!_ROOT_DOM) {
         _ROOT_DOM = document.getElementById('tau-root'); 
       }
       return _ROOT_DOM ? (_ROOT_DOM.clientHeight || _ROOT_DOM.offsetHeight) : window.innerHeight;
      },
      
      /**
       * Normalized typeof function that returns a consistent type of the object 
       * in string type. (e.g. JavaScript's native typeof operator will return 
       * 'object' for null)
       * <p/>
       * Normalized JavaScript types
       * <pre>
       *   ARRAY:       'array'
       *   BOOLEAN:     'boolean'
       *   DATE:        'date'
       *   ERROR:       'error'
       *   FUNCTION:    'function'
       *   NUMBER:      'number'
       *   NULL:        'null'
       *   OBJECT:      'object'
       *   REGEXP:      'regexp'
       *   STRING:      'string'
       *   UNDEFINED:   'undefined'
       * </pre>
       * @param {Object} obj JavaScript object
       * @returns {String} Normalized object type
       * @example tau.typeOf(null) === 'null'
       */
      typeOf: function (obj) {
        return _OBJ2TYPE[Object.prototype.toString.call(obj)] 
            || (obj ? 'object' : obj === null ? 'null' : 'undefined');
      },

      /**
       * Checks if an object is undefined.
       * @param {Object} obj JavaScript object
       * @returns {Boolean} True if object is undefined
       */
      isUndefined: function (obj) {
        return typeof obj == 'undefined';
      },

      /**
       * Checks if an object is a number.
       * @param {Object} obj JavaScript object
       * @returns {Boolean} True if object is a number
       */
      isNumber: function (obj) {
        return typeof obj == 'number' && isFinite(obj);
      },

      /**
       * Checks if an object is a boolean.
       * @param {Object} obj JavaScript object
       * @returns {Boolean} True if object is a boolean
       */
      isBoolean: function (obj) {
        return typeof obj == 'boolean';
      },

      /**
       * Checks if an object is a string.
       * @param {Object} obj JavaScript object
       * @returns {Boolean} True if object is a string
       */
      isString: function (obj) {
        return typeof obj == 'string';
      },

      /**
       * Checks if an object is a function/class.
       * @param {Object} obj JavaScript object
       * @returns {Boolean} True if object is a function
       */
      isFunction: function (obj) {
        return tau.typeOf(obj) === 'function';
      },

      /**
       * Checks if an object is an instance [or a function].
       * @param {Object} obj JavaScript object
       * @param {Boolean} isFunction True will also cause functions to succeed
       * @returns {Boolean} True if the parameter is an object or a function
       */
      isObject: function (obj, isFunction) {
        return obj && ((typeof obj == 'object') 
            || (isFunction && tau.isFunction(obj))) || false;
      },

      /**
       * Checks if an object is a date.
       * @param {Object} obj JavaScript object
       * @returns {Boolean} true if object is a date
       */
      isDate: function (obj) {
        return tau.typeOf(obj) === 'date';
      },

      /**
       * Checks if an object is valid value: Not undefined/null/NaN/"".
       * @param {Object} obj JavaScript object
       * @returns {Boolean} true if object is not undefined, null, NaN, nor "".
       */
      isValue: function (obj) {
        var t = tau.typeOf(obj);
        switch (t) {
        case 'undefined':
        case 'null':
          return false;
        case 'number':
          return isFinite(obj);
        case 'string':
          return '' !== obj;
        }
        return !!(t);
      },

      /**
       * Checks if an object is a array.
       * @param {Object} obj JavaScript object
       * @param {Boolean} relaxed Less rigorous check (i.e. allows inheritance)
       * @returns {Boolean} true if object is an array
       */
      isArray: function (obj, relaxed) {
        if (!relaxed) {
          return Array.isArray(obj);
        } else {
          // Handles arrays inheritance and arrays from external frame/window
          return obj && (typeof obj == 'object'
              && typeof obj.length == 'number'
              && typeof obj.splice == 'function'
              && !obj.propertyIsEnumerable('length')) || (obj instanceof Array);
        }
      },

      /**
       * Checks if an object is a DOM element.
       * @param {Object} obj JavaScript object
       * @returns {Boolean} True if object is a DOM element
       */
      isElement: function (obj) {
        return !!(obj && obj.nodeType === 1);
      },
      
      /**
       * Checks if an object is a DOM fragment.
       * @param {Object} obj JavaScript object
       * @returns {Boolean} True if object is a DOM fragment
       */
      isFragment: function (obj) {
        return !!(obj && obj.nodeType === 11);
      },

      /**
       * Checks if an object is a Hash.
       * @param {Object} obj JavaScript object
       * @returns {Boolean} True if object is a Hash
       */
      isHash: function (obj) {
        return obj instanceof Hash;
      },

      /**
       * Checks if a string is a namespace format.
       * @param {String} ns Namespace
       * @returns {Boolean} True if the parameter is a valid namespace
       */
      isNamespace: function (ns) {
        return tau.isString(ns) && /^[\w]+(\.[\w]+)*$/.test(ns);
      },

      /**
       * Empty Function that does no operation.
       * <p/>
       * Used to disable previously declared function without causing errors.
       */
      emptyFn: function () {
      },
      
      /**
       * Call the specified function with the additional arguments.
       * @param {Function} fn function to call
       * @param {Object} ctx context object
       * @param {Arguments} additional arguments
       * <p/>
       * @example
       * function showArguments() {
       *   alert(Array.prototype.join.call.join(arguments, ', '));
       * }
       * showArguments(1, 2, 3);
       * // -> alerts "1, 2, 3"
       *  var f = tau.curry(showArguments, this, 1, 2, 3);
       * f('a', 'b');
       * // -> alerts "a, b, 1, 2, 3"
       */
      curry: function (fn, ctx, args) {
        if (!arguments.length) {
          throw new SyntaxError('method reference to curry is missing!');
        }
        if (arguments.length == 1) return arguments[0];
        var _fn = fn, args = Array.prototype.slice.call(arguments, 2);
        return function () {
          var arr = Array.prototype,
              a = arr.concat.call(arr.slice.call(arguments), args);
          return _fn.apply(ctx, a);
        };
      },
      
      /**
       * Invokes specified function with given context. This method is efficient
       * when a method reference is used as an event handler or callback
       * function
       * <p/>
       * When the original method is invoked the method call is delegated to
       * wrapped function and eventually call the original method with the
       * specified context. 
       * @param {Function} fn original function to wrap with specified context
       * @param {Object} ctx Context object(ex. this)
       * @returns {Function} Wrapped function with the specified context
       */
      ctxAware: function (fn, ctx) {
        if (!tau.isFunction(fn)) {
          throw new TypeError('Specified handler is not Function type: ' + fn);
        }
        var _fn = fn;
        return function () {
          _fn.apply(ctx || null, arguments);
        };
      },
      
      /**
       * Sense orientation of the device and returns the value of orientation
       * if the device is on landscape then returns 'landscape' otherwise
       * 'portrait'
       * @returns {String} 'landscape' or 'portrait'
       */
      senseOrientation: function () {
        var o = window.orientation;
        if (tau.isNumber(o)) { // if 0, resolves as false
          return (Math.abs(o) === 90) ? 'landscape' : 'portrait';
        }
        return undefined;
      },
      
      /**
       * Returns the value of specified parameter of query string which you 
       * typed when you lauch Mobello framework in the browser url field such as
       * http://localhost/tau/laucher.html?aaa=bbb
       * in which case if you set the key as 'aaa' then this method returs
       * 'bbb'
       * @param {String} key the key you specified when Mobello is lauching
       * @returns {String} the value corresponding to the key
       */
      getLauncherParam: function (key) {
        var exp, parts,
            url = document.URL;
        if (url.indexOf('launcher.html?') === -1)
           return undefined;
        exp = new RegExp('[\\?&]'.concat(key,'=([^&#]*)'));
        parts = exp.exec(url);
        return (parts && parts[1]) ? parts[1] : undefined;
      },

      /**
       * Implicit Mobello Object, when a class is defined using $class() signature,
       * the instance of that class is always extends tau.TObject 
       * @private
       */
      TObject: (function () {
        var obj = function TObject() {};
        obj.prototype.$classname = 'tau.TObject';
        
        /**
         * prints the name of current object
         */
        obj.prototype.toString = function () {
          return '[object '.concat(this.$classname, ']');
        };
        
        /**
         * returns current call stack information, Too many calls to this method
         * degrades the performance so use this method carefully!
         * TODO: additional information need to be defined 
         * @return
         */
        obj.prototype.currentStack = function  () {
          var that = this, current = arguments.callee.caller;
          return  {
            toString: function () {
              var cs = ' @'.concat(that.$classname);
              for(var name in that) {
                if (that[name] === current) {
                  return cs.concat('.', name, '();');
                }
              }
              return cs;
            }
          };
        };
        return obj;
      })(),
      
      /**
       * Mixes object/class properties to an object instance/class.
       * <p/>
       * Only the properties that are owned by the source will be copied to the 
       * destination object.
       * @param {Object} dest Destination object/class to apply the properties
       * @param {Object} src Source object/class to receive the properties from
       * @param {Boolean|String} override Override or 'remix' (recursively mix)
       * @param {Array} filter List of property names to mix from src
       * @returns {Object} Destination object/class with the applied properties
       */
      mixin: function (dest, src, override, filter) {
        dest = dest || {};
        if (src !== dest) {
          // Copy properties on override or if it doesn't already exist
          for (var p in src) {
            // Copy owned/filtered src properties to undefined/overriden dest
            if (src.hasOwnProperty(p) && (override || dest[p] === undefined)
                && (!filter || filter.indexOf(p) > -1)) {
              // Recursively mix or overwrite to dest property
              if (override === 'remix' && tau.isObject(dest[p])) {
                dest[p] = tau.mixin(dest[p], src[p], override, filter);
              } else {
                dest[p] = src[p];
              }
            }
          }
        }
        return dest;
      },

      /**
       * Augments class properties to an object instance/class.
       * <p/>
       * Augmenting an object instance will give properties only to that 
       * instance. Augmenting an object's prototype will give the properties 
       * to all instances derived by from that object via the new operator.
       * <p/>
       * Additionally, the augmented class' constructor will be called via 
       * proxy upon any one of its function call.
       * @param {Object} dest Destination object/class to apply the properties
       * @param {Object} src Source class to receive the properties from
       * @param {Boolean} override Override existing properties to destination
       * @param {Array} filter List of property names to filter from src
       * @returns {Object} Destination object/class with the applied properties
       * @throws {Error} Destination/source parameters must not be invalid
       */
      augment: function (dest, src, override, filter) {
        var p, srcProp, makeProxyFn, proxyFn, originalFn,
            isDestProto = tau.isObject(dest.prototype),
            destProto = dest.prototype,
            destTarget = dest.prototype || dest,
            srcProto = src.prototype;

        // Prototype augmentation: make proxy functions to call constructor
        if (isDestProto && src) {
          proxyFn = {};
          originalFn = {};
          /** @inner Maps an original function to a proxy function. */
          makeProxyFn = function (m) {
            /**
             * Proxy members functions are assigned to each original members. 
             * When one is called, it will execute the instance's contructor, 
             * so that it can inherit any of its this assigments, and re-attach
             * all the original members and properties.
             * @inner
             */
            proxyFn[m] = function () {
              // Re-attach all the original properties prior to constructor call
              for (var i in originalFn) {
                if (originalFn.hasOwnProperty(i) && (this[i] === proxyFn[i])) {
                  this[i] = originalFn[i];
                }
              }
              src.apply(this); // src constructor call to inherit this props
              return originalFn[m].apply(this, arguments); // original function
            };
            return proxyFn[m];
          };

          // Iterate through source properties and create/attach proxy props
          for (p in srcProto) {
            if (srcProto.hasOwnProperty(p)) {
              if ((!tau.isArray(filter) || (filter.indexOf(p) > -1))
                  && (override || !destProto[p])) {
                srcProp = srcProto[p];
                if (tau.isFunction(srcProp)) {
                  // Save original properties to originalFn and attach the proxy
                  originalFn[p] = srcProp;
                  destProto[p] = makeProxyFn(p);
                } else {
                  // No need to create proxy members, just attach the property
                  destProto[p] = srcProp;
                }
              }
            }
          }
        }

        // Mixes source prototype properties to destTarget (prototype)
        tau.mixin(destTarget, srcProto, override, filter);

        // Object instance augmentation: call source constructor to get props
        if (!isDestProto) {
          src.apply(destTarget);
        }

        return destTarget;
      },

      /**
       * Declares a namespace.
       * <p/>
       * An undefined namespace and any of its sub parts will be declared 
       * without overwriting any previously defined namespaces hierarchy.
       * <p/>
       * An exception occurs if the namespace syntax is incorrect or a function
       * attempts to overwrite an existing namespace. 
       * @param {String} ns Namespace declaration
       * @param {Object|Function} attach Properties/Function to add to namespace
       * @param {Boolean} overwrite Overwrites existing namespace
       * @returns {Boolean} true if at least one namespace part was modified
       * @throws {Error} Invalid namespace format or existing namespace
       */
      namespace: function (ns, attach, overwrite) {
        var i, len, parts, isFn, parent,
            modified = false;
        if (!tau.isNamespace(ns)) {
          throw new SyntaxError('tau.namespace: invalid namespace, ' + ns);
        }

        parent = GLOBAL;
        parts = ns.split('.');
        isFn = tau.isFunction(attach);
        // Validate each namespace parts (create one if it doesn't exist)
        for (i = 0, len = isFn ? parts.length - 1 : parts.length; i < len; i++) {
          if (typeof parent[parts[i]] == 'undefined') {
            parent[parts[i]] = {};
            modified = true;
          } else if (!overwrite && tau.isFunction(parent[parts[i]]) 
              && i < len - 1) {
            // Any parent part in the namespace must not be a function
            throw new Error('tau.namespace: \"' + parts.slice(0, i + 1)
                .join('.') + '\" function was previously defined in hierarchy');
          }
          parent = parent[parts[i]];
        }

        if (isFn) {
          // Function assignment for the last portion of namespace
          if (overwrite || typeof parent[parts[i]] == 'undefined') {
            parent[parts[i]] = attach;
            modified = true;
          } else {
            throw new Error('tau.namespace: \"' + ns + '\" definition ' 
                + ' already exists, cannot be overridden');
          }
        } else {
          // Attach properties to the final namespace part; does not overwrite
          for (i in attach) {
            if (typeof parent[i] == 'undefined' && attach.hasOwnProperty(i)) {
              parent[i] = attach[i];
              modified = true;
            }
          }
        }

        return modified;
      },

      /**
       * Clones a new instance of an object, function, array, dates & RegExp.
       * <pre>
       *   var original = new tau.ScriptHelper();
       *   alert(original !== tau.clone(original)); // true
       * </pre>
       * @param {Object} obj Object to clone
       * @param {Boolean} deep Recursively deep copy inner property instances
       * @param {Array} ignore List of properties to not deep clone
       * @returns {Object} New cloned version of the parameter
       */
      clone: function (obj, deep, ignore) {
        var F, cloned, p, 
            t = (obj instanceof HTMLElement) ? null : tau.typeOf(obj);
        switch (t) {
        case 'object':
        case 'error':
          if (obj.constructor === Object.prototype.constructor) {
            cloned = {}; // JSON object
          } else {
            /** @inner Cloning instance's state is preserved as a new Class. */
            F = function () {};
            F.prototype = obj; // obj changes are applied to cloned's prototype
            cloned = new F();
          }
          break;
        case 'function':
          /** @inner Cloning function is callbed by a new function. */
          cloned = function () {
            obj.apply(this, arguments);
          };
          cloned.prototype = obj.prototype;
          break;
        case 'array':
          cloned = [];
          break;
        case 'date':
          cloned = new Date(obj);
          break;
        case 'regexp':
          cloned = new RegExp(obj.source);
          break;
        default:
          return obj;
        }

        // Copy, or recursively deep copy, properties to cloned's 'this'
        for (p in obj) {
          if (obj.hasOwnProperty(p) 
              && (!ignore || ignore.indexOf(p) === -1)) {
            cloned[p] = !deep ? obj[p] : tau.clone(obj[p], deep, ignore);
          }
        }
        return cloned;
      },

      /**
       * Extends the parent class properties to the child class.
       * <p/>
       * New properties and methods must be provided by the <code>props</code> 
       * parameter; any parent properties with the identical name in the class
       * hierarchy will be overridden in the child class.
       * <p/>
       * Additionally, extended class will have a <code>superclass</code> 
       * property to access its parent methods and properties.
       * <p/>
       * Note that the child class must call the parent constructor in its own
       * constructor to property inherit declaration made by the parent.
       * @example
       * function tau.example.MySubClass() {
       *   tau.example.MySubClass.superclass.constructor.apply(this, arguments);
       * }
       * tau.extend(tau.example.MySubClass, tau.example.MyClass);
       * @param {Object} child Child/Sub class to apply properties to
       * @param {Object} parent Parent/Super class to inherit properties from
       * @param {Object} props Properties to add/override to the child class
       * @returns {Object} New extended class with the applied properties
       * @throws {Error} Parent/child parameter must be classes (functions).
       */
      extend: function (child, parent, props) {
        var p, F;
        // Only allow Classes (functions) as parameters
        if (!tau.isFunction(child) || !tau.isFunction(parent)) {
          throw new Error('tau.extend: parameters must be classes.');
        }

        // Create prototype inheritance references for the child class
        /** @inner */
        F = function () {};
        F.prototype = parent.prototype;
        child.prototype = new F();
        child.prototype.constructor = child;

        // Child class can call parent's methods via the superclass property.
        // If the parent's constructor is the Object itself, we must reassign
        // the constructor to itself for proper super call
        child.superclass = parent.prototype;
        if (parent != Object
            && parent.prototype.constructor == Object.prototype.constructor) {
          parent.prototype.constructor = parent;
        }

        // Add/Override extended functions the child class
        for (p in props) {
          if (props.hasOwnProperty(p)) {
            child.prototype[p] = props[p];
          }
        }

        return child;
      },

      /**
       * Creates a lazy-loading getter function using a class property name and 
       * a new instance script/function for a privately scoped object.
       * <p/>
       * Note: It's critical to properly match the <code>prop</code> parameter 
       * to the assigned prototype property name.  
       * <pre>
       *   MyClass.prototype = {
       *     getFoo: tau.getterFactory('getFoo', 'new tau.URLHelper'),
       *     getBar: tau.getterFactory('getBar', function () { return []; })
       *   }
       * </pre>
       * @param {String} prop Name of the assigned prototype property
       * @param {String|Function} instanceFactory New instance script/function
       * @param {Array} instanceFactory Arguments for the instanceFactory
       * @returns {Function} Lazy-loading getter function
       */
      getterFactory: function (prop, instanceFactory, instanceFactoryArgs) {
        instanceFactory = (typeof instanceFactory == 'string' ?
            new Function('return ' + instanceFactory + ';') : instanceFactory);
        instanceFactoryArgs = (typeof instanceFactoryArgs == 'array') ?
            instanceFactoryArgs : undefined;
        /** @inner First-call function that creates an instance of the object */
        return function () {
          // Creates a new closure object for the class instance
          var instance = instanceFactory.apply(this, instanceFactoryArgs);
          /** @inner Replaces the getter function with the closed instance */
          this[prop] = function () {
            return instance;
          };
          return instance;
        };
      },

      /**
       * Delegates an object's properties to their respective setter functions.
       * <p/>
       * Default functionality will call the appropriate camelcase named setter 
       * function. e.g. An object containing a property named <code>foo</code> 
       * will call <code>setFoo</code> function with its value as parameter.
       * <p/>
       * Optionize can be futher customized to designate a new default handler 
       * (opts.defaultFn) as well as unique handlers for each property name
       * (opt.handler.<property>).
       * @param {Object} dest Destination object/class to apply the properties
       * @param {Object} src Source object to apply
       * @param {Object} opts Options: overwrite, filter, defaultFn, handler
       * @returns {Object} Destination object/class with the applied properties
       */
      optionize: function (dest, src, opts) {
        dest = dest || {};
        opts = tau.mixin({
          override: false,
          /**
           * Default Propery handler: calls set<PropName>() function on dest
           * @inner
           * @param {Object} p Property Name
           * @param {Object} v Property value
           */
          defaultFn: function (p, v) {
            var fn = dest['set' + p.charAt(0).toUpperCase() + p.slice(1)];
            if (tau.isFunction(fn)) {
              fn.call(dest, v);
            }
          }
        }, opts, true);
        if (src !== dest) {
          for (var p in src) {
            if (src.hasOwnProperty(p) && (opts.override || !dest[p])
                && (!tau.isArray(opts.filter) || (opts.filter.indexOf(p) > -1))) {
              if (!opts.handler || !(tau.isFunction(opts.handler[p]))) {
                opts.defaultFn.call(dest, p, src[p]);              
              } else {
                opts.handler[p].call(dest, p, src[p]);
              }
            }
          }
        }
        return dest;
      },

      /**
       * Iterates through an array, or array-like, object by calling the
       * <code>callbackFn</code> function with an index value, index and Array or array-like object as
       * its parameter.
       * @param {Object} obj Array or array-like object
       * @param {Function} callbackFn Function to call on each iteration 
       * @param {Object} context CallbackFn's 'this' context
       */
      forEach: function (obj, callbackFn, context) {
        var p; 
        if (!tau.isArray(obj)) {
          for (p in obj) {
            if (callbackFn.call(context, obj[p], p, obj) === false) {
              break;
            }
          }
        } else {
          obj.forEach(callbackFn, context);
        }
      },

      /**
       * Merges two arrays from <code>src</code> to <code>dest</code>.
       * @param {Array} dest Destination object 
       * @param {Array} src Source object
       * @returns {Array} Destination object with the merged contents of source
       */
      merge: function (dest, src) {
        var i,
            j = 0;
        if (typeof src.length == "number") {
          for (i = src.length; j < i; j++) {
            dest[dest.length++] = src[j];
          }
        } else {
          while (src[j] !== undefined) {
            dest[dest.length++] = src[j++];
          }
        }
        return dest;
      },

      /**
       * Trims any existing spaces to the left/right of a string.
       * @param {String} text String value to trim
       * @returns {String} Trimmed string
       */
      trim: function (text) {
        return (text || '').replace(/^\s+/, '').replace(/\s+$/, '');
      },

      /**
       * Converts a string separated by dashes into a camelCase equivalent.
       * <p/>
       * e.g. 'foo-bar' --> 'fooBar'
       * @param {String} text String value to camelize
       * @returns {String} Camelized string
       */
      camelize: function (text, isLowerCase) {
        return text.replace(/-([a-z])/ig, function (all, letter) {
          return letter.toUpperCase();
        });
      },

      /**
       * Converts a camelized string into a series of words separated by an 
       * underscore ("_").
       * <p/>
       * e.g. 'fooBar' --> 'foo_bar'
       * @param {String} text String value to underscore
       * @returns {String} Underscored string
       */
      underscore: function (text) {
        return text.replace(/::/g, '/')
                   .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
                   .replace(/([a-z\d])([A-Z])/g, '$1_$2')
                   .replace(/-/g, '_')
                   .toLowerCase();
      },

      /**
       * Resolves a relative URL to an absolute.
       * <p/>
       * If a base is provided and the URL is relative, the resolved result 
       * will have the base prepended.
       * <p/>
       * Note: A relative URL has no http, ftp, etc, prefix.  It may begin with
       * <code>./</code>, <code>../</code>, <code>/</code>, <code>//</code>,
       * or without any prefix.
       * @param {String} url Any URL
       * @param {String} base Base URL to prepend, if null uses '/'
       * @returns {String} An absolute URL with the base prefixed 
       */
      resolveURL: function (url, base) {
        var c,
            a = GLOBAL.document.createElement('a');
        url = url || '';
        if (tau.isString(base) && !_URLREGEXP.test(url)) {
          if (/^\w|\.\./.test(url)) {          // Direct & Sub (..)
            url = base + url;
          } else if (/^\.\/|\.\\/.test(url)) { // Current (./)
            url = base + url.substring(2);
          }
        }

        // Resolve an absolute URL (/ or \\ must be resolved to root host name)
        c = url.charAt(0);
        a.href = (c === '/' || c === '\\' ? _ROOTURL + url : url);
        return a.href;
      },

      /**
       * TODO: prototype needs more implementation
       */
      stacktrace: function (fn, depth) {

        /** @inner Returns arguments type and value as an array */
        function typeOfArgs() {
          var args = Array.prototype.slice.call(arguments);
          for (var t, i = 0; i < args.length; i++) {
            switch (t = tau.typeOf(args[i])) {
            case 'undefined':
            case 'null':
            case 'object':
              args[i] = '{' + t + '}';
              break;
            case 'array':
              args[i] = '{' + t + '}[' + String(args[i]) + ']';
              break;
            case 'function':
              args[i] = '{' + t + '}' + (args[i].name || args[i].fnName || '');
              break;
            default:
              args[i] = '{' + t + '}' + String(args[i]);
            }
          }
          return args;
        }

        var stack = [];
        fn = (fn && fn.caller) ? fn : arguments.callee.caller; // Stacktrace to fn = stacktrace caller
        while (fn && (!depth || stack.length < depth)) {
          stack.unshift({
            fn: fn.prototype.constructor,
            args: Array.prototype.slice.call(fn.arguments),
            name: (fn.name || fn.fnName || 
                    (/function\s*([\w\-$]+)?\s*\(/i.test(fn.toString()) ? 
                        RegExp.$1 || '<anonymous>' : '<anonymous>')
                  ) + '(' + typeOfArgs.apply(this, fn.arguments).join(', ') + ')'
            /** url, line, or column position cannot be parsed in Safari */
          });
          fn = fn.caller;
        }
        return stack;
      },

      /**
       * Checks if a string is in JSON format.
       * @param {String} text String to check
       * @returns {Boolean} True if the text is in JSON format
       * @see <a href="http://www.JSON.org/json.js">www.JSON.org/json.js</a>
       */
      isJSON: function (text) {
        return (/^[\],:{}\s]*$/.test(
            text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                .replace(/(?:^|:|,)(?:\s*\[)+/g, '')));
      },

      /**
       * Converts a valid JavaScript value to a valid JSON text string.
       * <p/>
       * Uses browser native <code>JSON.stringify</code> function if it's 
       * available; otherwise uses Douglas Crockford's implementation available
       * in the public domain.
       * @param {Object|String|Number|Boolean} value Any Javascript value
       * @param {Function|Array} replacer Determines how object are stringified 
       * @param {String|Number} space Specifies indentation of nested structures
       * @returns {Object} String representation of a JavaScript object
       * @see <a href="http://www.JSON.org/json.js">www.JSON.org/json.js</a>
       */
      stringify: function (value, replacer, space) {
        return _MODULE.json.stringify(value, replacer, space);
      },

      /**
       * Converts a valid JSON text into a JavaScript value.
       * <p/>
       * Uses browser native <code>JSON.parse</code> function if it's available;
       * otherwise uses Douglas Crockford's implementation available in the 
       * public domain.
       * @param {String} text JSON text to produce an object or array
       * @param {Function} reviver Callback to alter text contents in return obj 
       * @returns {Object} Converted JSON object
       * @see <a href="http://www.JSON.org/json.js">www.JSON.org/json.js</a>
       */
      parse: function (text, reviver) {
        if (!text) return null;
        return _MODULE.json.parse(text, reviver);
      },

      /**
       * Generates a randomized unique id.
       * <p/>
       * Providing a <code>null</code>/<code>''</code> parameter will return 
       * an numberical/string id without a prefix. 
       * @param {String} pre Optional prefix to the id (default prefix: 'tau') 
       * @return {String|Number} A unique random id
       */
      genId: function (pre) {
        return (typeof pre == 'undefined' ? 'tau' : pre) + (++_idSeed);
      },

      /**
       * Logs a message.
       * <pre>
       *  Log levels (tau.log.*):
       *   DEBUG  : 1
       *   INFO   : 2
       *   WARN   : 3 (default)
       *   ERROR  : 4
       *   FATAL  : 5
       *   NONE   : 6
       * </pre>
       * @param {String} msg Log message
       * @param {Number} level Log level: 1(debug) - 6(none)
       * @param {String|Class} src Prepends where the logging is done
       * @returns {String} logged message
       */
      log: function (msg, level, src) {
        if (tau.log.LEVEL <= (level || tau.log.WARN)) {
          // Prepends class/context from which the logging is done
          if (level == tau.log.DEBUG) {
            msg = '[' + new Date().getMilliseconds() + '] ' + msg;
          }
          if (tau.isString(src)) {
            msg = '[' + src + '] ' + msg;
          } else if (tau.isObject(src) && src.$classname) {
            msg = '[' + src.$classname + '] ' + msg;
          }
          console.log(msg);
        }
        return msg;
      },

      arr: function (context, opts) {
        return new tau.ArrayHelper(context, opts); 
      },

      dom: function (context, opts) {
        return null;
      },

      url: function (context, opts) {
        return new tau.URLHelper(context, opts);
      },

      req: function (opts) {
        if (opts && opts.type && opts.type.toUpperCase() === 'JSONP') {
          return new tau.data.XSSRequest(opts);
        } else {
          return new tau.data.XMLRequest(opts);
        }
      },
      
      /**
       * @param {String} msg
       * @param {Object} [opts]
       * @param {String} [opts.title] 다이얼로그 제목
       * @param {String} [opts.okText='ok'] 확인버튼 텍스트
       * @param {Function} [opts.callbackFn] ok 버튼을 터치후에 호출되는 콜백함수 
       */
      alert: function (msg, opts) {
        var dialog = tau.getRuntime().getSystemDialog();
        if (!dialog.isActive()){
          dialog.open(tau.ui.SystemDialog.ALERT_TYPE, msg, opts);
        } 
      },

      /**
       * @param {String} msg
       * @param {Object} [opts]
       * @param {String} [opts.title] 다이얼로그 제목
       * @param {String} [opts.okText='ok'] 확인버튼 텍스트
       * @param {String} [opts.cacelText='cancel'] 취소버튼 텍스트
       * @param {Function} [opts.callbackFn] ok, cancel 버튼을 터치후에 호출되는 콜백함수 
       */
      confirm: function (msg, opts) {
        var dialog = tau.getRuntime().getSystemDialog();
        if (!dialog.isActive()){
          dialog.open(tau.ui.SystemDialog.TYPE_CONFIRM, msg, opts);
        }
      },

      /**
       * @param {String} msg
       * @param {Object} [opts]
       * @param {String} [opts.title] 다이얼로그 제목
       * @param {String} [opts.okText='ok'] 확인버튼 텍스트
       * @param {String} [opts.cacelText='cancel'] 취소버튼 텍스트
       * @param {String} [opts.placeholderLabel] 입력 placeholder 텍스트.
       * @param {Function} [opts.callbackFn] ok, cancel 버튼을 터치후에 호출되는 콜백함수 
       */
      prompt: function (msg, opts) {
        var dialog = tau.getRuntime().getSystemDialog();
        if (!dialog.isActive()){
          dialog.open(tau.ui.SystemDialog.PROMPT_TYPE, msg, opts);
        }
      },
      
      /**
       * The requestAnimationFrame method is used to signal to the user agent that a script-based animation needs 
       * to be resampled. When requestAnimationFrame(callback) is called, the user agent MUST schedule a script-based 
       * animation resampling by appending to the end of the animation frame request callback list an entry whose handle 
       * is a user-agent-defined integer greater than zero that uniquely identifies the entry in the list, 
       * whose callback is callback and whose cancelled flag is false.
       * @param {Function} callback A parameter specifying a function to call when it's time to update 
       *                             your animation for the next repaint
       */
      requestAnimationFrame: function (callback) {
        return _requestAnimationFrame.call(window, callback);
      },

      /**
       * The cancelRequestAnimationFrame method is used to cancel a previously made request to schedule an animation 
       * frame update. When cancelRequestAnimationFrame(handle) is called, the user agent MUST set the cancelled flag 
       * to true for the entry in the animation frame request callback list whose handle is handle. 
       * If there is no entry in the list with the given handle, then this function does nothing.
       * @param {String} requestid
       */
      cancelRequestAnimationFrame: function (requestid) {
        return _cancelRequestAnimationFrame.call(window, requestid);
      }
    };
  }


  /**
   * Class declaration function.
   * <p/>
   * Used to begin a class declaration, from which, subsequent chained function
   * calls can be applied to <code>extend</code> an existing class, add one or
   * more <code>mixin</code> classes, and finally, <code>define</code> the 
   * declared class namespace.
   * <pre>
   *   $class('com.mycompany.MyClass').extend(com.mycompany.MySuper).define({
   *     $static: {                     // Static variables
   *       MAX_SIZE: 1000
   *     },
   *     MyClass: function (a, b) {},   // Class constructor
   *     foo: function () {}            // Class member
   *   });
   * </pre>
   * @param {String} name Class name to be defined
   * @returns {Object} Class definition skeleton used to extend or define
   */
  $class = function (name) {
    /** test */
    var lang = { 'name': name };

    /** assigns the file path on which this class is defined */ 
    if (typeof $require != 'undefined') {
      lang.path = $require.path;
    }
    
    /**
     * Extends a previously defined class (Temporary static method).
     * @inner
     * @param {Function} superclass A defined class/function reference
     * @returns {Object} Class definition skeleton used to extend or define
     */
    lang.extend = function (superclass) {
      if (!tau.isFunction(superclass)) {
        throw new Error('$class.extend: cannot extend undefined class, \"' 
            + superclass + '\"');
      }
      this.$super = superclass;
      delete this.extend;
      return this;
    };

    /**
     * Mixes each object's properties to the defined class prototype (it will 
     * not overwrite existing properties).
     * @inner
     * @param {Object} arg Mixin objects are applied in called parameter order
     * @returns {Object} Class definition skeleton used to extend or define
     */
    lang.mixin = function () {
      this.mixins = arguments;
      delete this.mixin;
      return this;
    };

    /**
     * Defines a class with the given properties (Temporary static method).
     * <p/>
     * The parameter's property function labeled <code>constructor</code>,
     * if defined, will be used as the constructor for the defining class.
     * <p/>
     * There are three system-defined properties:
     * <code>$super</code>: Access to super class' properties
     * <code>$classname</code>: Class name in string
     * <code>$filepath</code>: file path in string
     * @inner
     * @param {Object} m Properties to add/override to the defining class
     * @returns {Object} Class definition skeleton used to extend or define
     * @throws {Error} Duplicate class definition
     */
    lang.define = function (m) {
      var p, len, parent, cls, mm,
          sup = this.$super || tau.TObject,
          localName = this.name.substring(this.name.lastIndexOf('.') + 1),
          construct = (tau.isObject(m) && m.hasOwnProperty(localName)) 
              ? m[localName] : undefined;
      cls = function () {
          if (!this.$dist) this.$dist = 0;
          this.$dist++;
          sup.apply(this, arguments);       // Super constructor call
          this.$dist--;
          if (tau.isFunction(construct)) {
            construct.apply(this, arguments); // Instance constructor call
          }
          if (this.$dist == 0) { // it's time to optionize
            var arg0 = arguments[0];
            if (arguments.length > 0 && arg0 && arg0.constructor === Object 
                && arg0.$optionize !== false) {
              // not applicable if '$optionize:false' is specified in the object
              tau.optionize(this, arg0, this.$optionize);
              delete this.$optionize;
            }
            delete this.$dist;
          }
        };

     /** @inner Create inheritance from a super class */
      parent = function () {};
      parent.prototype = sup.prototype;
      cls.prototype = new parent();
      cls.prototype.constructor = cls;

      cls.$super = sup.prototype; // Super class reference (static)

      // If the super class constructor is JavaScript's native Object, it must
      // be reassigned to its own function definition; otherwise, the sub
      // class super constructor call will not pass its arguments properly.
      if (sup !== Object
          && sup.prototype.constructor === Object.prototype.constructor) {
        sup.prototype.constructor = sup;
      }

      // Define static properties/methods
      for (p in m.$static) {
        if (m.$static.hasOwnProperty(p)) {
          cls[p] = m.$static[p];
        }
      }

      // Define prototype properties/methods
      for (p in m) {
        if (m.hasOwnProperty(p) && p !== '$static') {
          cls.prototype[p] = m[p];
          // Attach class function names for stacktrace (<classname>.<fn name>)
//          if (tau.isFunction(cls.prototype[p]) 
//              && !tau.isValue(cls.prototype[p].name)) {
//            cls.prototype[p].fnName = this.name + '.' + p;
//          }
        }
      }
      cls.prototype.$classname = this.name; // Class name property (instance)
      cls.prototype.$filepath = this.path; // File path property (instance)

      // Define full namespace for the class, throw exception on duplicate
      if (!tau.namespace(this.name, cls)) {
        throw new Error('$class.define: \"' + this.name +'\" already defined');
      }

      // Apply mixin properties 
      for (p = 0, len = this.mixins ? this.mixins.length : 0; p < len; p++) {
        //tau.mixin(cls.prototype, this.mixins[p]);
        //tweaked for efficiency by genie
        if (p == 0) {
          cls.mixins = [];
        }
        mm = this.mixins[p].prototype;
        if (mm) {
          cls.mixins.push(mm.$classname);
        } else {
          mm = this.mixins[p];
        }
        tau.mixin(cls.prototype, mm);
      }
      
      cls.prototype.isMixinOf = function (mixin) {
        for (var i = 0; cls.mixins && i < cls.mixins.length; i++) {
          if (cls.mixins[i] ===  mixin.prototype.$classname) {
            return true;
          }
        }
        return (cls.$super.isMixinOf) ? cls.$super.isMixinOf(mixin) : false;
      };

      // Remove static properties used for class definition
      delete this.name;
      delete this.mixins;
      delete this.$super;
      delete this.define;
    };

    return lang;
  };

  /**
   * Returns the <code>Function/Class</code> reference associated with the given
   * string namespace.
   * @example
   *  var clazz = $class.forName('tau.example.MyClass');
   *  var instance = new clazz();
   * @param {String} ns Fully qualified name of the desired Function/Class
   * @returns {Function} <code>Function/Class</code> for the specified namespace
   * @throws {Error} Undefined namespace
   */
  $class.forName = function (ns) {
    var i, len,  
        parts = ns.split('.'),
        ref = GLOBAL;
    // Validate each namespace parts (create one if it doesn't exist)
    for (i = 0, len = parts.length; i < len; i++) {
      if (typeof ref[parts[i]] === 'undefined') {
        // Any ref part in the namespace must not be a function
        throw new Error('$class.forName: \"' + ns + '\" is undefined');
      }
      ref = ref[parts[i]];
    }
    return ref;
  };

  /** @lends tau.ScriptHelper */
  $class('tau.ScriptHelper').define({

    /**
     * @class
     * Dynamically loads a JavaScript (opts.type = 'script') or CSS link 
     * (opts.type = 'css') DOM element into the document's head.
     * <pre>
     *   <script type="text/javascript" src="..."></script>
     *   <link type="text/css" rel='stylesheet' media="screen" href="..."></link>
     * </pre>
     * <p/>
     * Options:
     * <pre>
     *   type       : {String} css or script
     *   url        : {String} URL address for the script
     *   callbackFn : {Function} Success callback function
     *   timeoutFn  : {Function} Timeout callback function (prevents callbackFn)
     *   timeout    : {Number} Time in milliseconds for the script to load
     *   context    : {Object} Callback function's this context
     *   noCache    : {Boolean} Same script files URLs are not cached
     *   autoUnload : {Boolean} Calls unload() after loading script
     *   charset    : {String} Chararcter encoding
     * </pre>
     * @constructs
     * @param {Object} opts ScriptHelper options
     */
    ScriptHelper: function (opts) {
      this._opts = tau.mixin({}, opts);
      this._opts.head = tau.isElement(this._opts.head) ? 
          this._opts.head : GLOBAL.document.getElementsByTagName('head')[0];
      if (this._opts.type !== 'css') {
        this.ctx = GLOBAL.document.createElement('script');
        this.ctx.setAttribute('type', 'text/javascript');
      } else {
        this.ctx = GLOBAL.document.createElement('link');
        this.ctx.setAttribute('type', 'text/css');
        this.ctx.setAttribute('rel', 'stylesheet');
        this.ctx.setAttribute('media', 'screen');
      }
      this.setCharset(this._opts.charset);
    },

    /**
     * Sets the character set for the script being loaded.
     * @param charset {String} Chracter set code
     */
    setCharset: function (charset) {
      if (tau.isString(charset)) {
        this.ctx.setAttribute('charset', charset);        
      }
    },
    
    enable: function () {
      this._opts.head.appendChild(this.ctx);
    },

    /**
     * Loads a JavaScript source by dynamically injecting a script element 
     * under the head element. The <code>callbackFn</code> function will be 
     * called when the script becomes fully loaded.
     * <p/>
     * Ensure that any functions calls to the importing script is done after it 
     * has been loaded.
     * @param {String} url JavaScript source URL to import
     * @param {Function} callbackFn Dynamic loading complete callback function
     * @param {Function} timeoutFn Timeout callback function (opt.timeout)
     * @returns {Object} The appended DOM element
     */
    load: function (url, callbackFn, timeoutFn) {
      var timeoutId,
          opts = this._opts,
          that = this;
      url = url || opts.url;
      if (opts.type !== 'css') {
        callbackFn = callbackFn || opts.callbackFn;
        timeoutFn = timeoutFn || opts.timeoutFn;
        if (opts.timeout > 0 && tau.isFunction(timeoutFn)) {
          /** @inner Script load timeout */
          timeoutId = window.setTimeout(function () {
            that.ctx.onload = null; // prevent success callback
            if (that._opts.autoUnload) that.unload(); // unload script element
            timeoutFn.call(that._opts.context || this);
          }, opts.timeout);
        } else if (this.ctx.onerror !== undefined) {
          this.ctx.onerror = function () {
            that.unload(); // unload script element
            timeoutFn.call(that._opts.context || this);
          };
        }
        /** @inner Script load success */
        this.ctx.onload = function () {
          if (timeoutId) window.clearTimeout(timeoutId);   // prevent timeout callback
          if (that._opts.autoUnload) that.unload(); // unload script element
          if (that.ctx.onerror) that.ctx.onerror = null;
          callbackFn.call(that._opts.context || this);
        };
        // noCache flag will prevent the browser from caching the script
        this.ctx.setAttribute('src', 
            !opts.noCache ? url : url + '?' + tau.genId(null));
      } else {
        this.ctx.setAttribute('href', url);
        opts.head.appendChild(this.ctx);
        /*
         * 개발자 모드인 경우 이미지 태그를 통해 css파일을 로딩하지 않도록 처리함. 
         * 브라우저에서 css파일을 이미지로 인식해서 css 디버그 하기 어려움
         */
        var rt = tau.getRuntime();
        if (tau.rt.isAndroidVer2 || rt && rt.getConfig().dev) {
          if (tau.isFunction(callbackFn)) callbackFn.call(that._opts.context || this);
          return true;
        }

        var img = document.createElement('img');
        img.style.display = 'none';
        img.src = url;
        
        function loaded() {
          img.onerror = null;
          delete that.timeoutId;
          document.body.removeChild(img);
          if (tau.isFunction(callbackFn)) callbackFn.call(that._opts.context || this);
        }
        img.onerror = function () {
          if (that.timeoutId) {
            clearTimeout(that.timeoutId);
            delete that.timeoutId;
            loaded();
          }
        };
        that.timeoutId = window.setTimeout(loaded, opts.timeout || 700);
        return document.body.appendChild(img);
      }
      return opts.head.appendChild(this.ctx);
    },

    /**
     * Unloads the DOM element.
     */
    unload: function () {
      this._opts.head.removeChild(this.ctx);
    }
  });

  
  /** @lends tau.ArrayHelper */
  $class('tau.ArrayHelper').define({
    /**
     * @class
     * Utilitiy functions for an Array. [tau.arr]
     * <p/>
     * Each function will try to apply the array utility operation to its 
     * 'this.ctx' object as its context. If one isn't set, then it use the
     * function's 'this'.
     * <pre>
     *   var a = ['a', 'b', 'c', 'a'];
     *   if (new tau.ArrayHelper(a).unique().pushUnique('e')) {
     *     alert(a); // a = ['a', 'b', 'c', 'e']);
     *   }
     *   if (tau.ArrayHelper.prototype.pushUnique.call(a, 'f')) {
     *     alert(a); // a = ['a', 'b', 'c', 'e', 'f']);
     *   }
     * </pre>
     * @constructs
     * @param {Object|Array} context  
     */
    ArrayHelper: function (context) {
      if (tau.isArray(context)) {
        this.ctx = context;
      } else {
        this.ctx = Array.prototype.slice.call(context);
      }
    },

    /**
     * Removes any duplicate items in the array.
     * @returns {Object} 'this' instance
     */
    unique: function () {
      var i,
          ctx = !!this.ctx ? this.ctx : this;
      for (i = 1; i < ctx.length; i++) {
        if (ctx.indexOf(ctx[i]) !== i) {
          ctx.splice(i--, 1);
        }
      }
      return this;
    },

    /**
     * Appends a value uniquely onto the end of the array; no duplicates.
     * @param {Object} value Object to be pushed into the array
     * @returns {Boolean} True if the value was pushed
     */
    pushUnique: function (value) {
      var ctx = !!this.ctx ? this.ctx : this;
      if (ctx.indexOf(value) === -1) {
        return ctx.length < ctx.push(value);
      }
      return false;
    },

    /**
     * Prepends a value uniquely onto to the front of the array; no duplicates.
     * @param {Object} args Objects to be prepended into the array
     * @returns {this} ArrayHelper context instance
     */
    unshiftUnique: function (value) {
      var ctx = !!this.ctx ? this.ctx : this;
      if (ctx.indexOf(value) === -1) {
        return ctx.length < shift.push(value);
      }
      return false;
    },

    /**
     * Removes a element from the list by value.
     * @param {Object} args Objects to be removed from the array
     * @param {Boolean} all True will remove all instances of the value
     * @returns {Number} Number of values removed (0 [null/false] = none)
     */
    remove: function (value, all) {
      var count = 0,
          ctx = !!this.ctx ? this.ctx : this,
          i = ctx.indexOf(value);
      while (i > -1) {
        if (ctx.splice(i, 1)[0] === value) {
          count++;
        }
        i = !all ? -1 : ctx.indexOf(value);
      }
      return count;
    },

    /**
     * Returns the last element of to pop() without actually popping.
     * @returns {Object} Last array item
     */
    peek: function () {
      var ctx = !!this.ctx ? this.ctx : this;
      return ctx[ctx.length - 1];
    }
  });


  /** @lends tau.URLHelper */
  $class('tau.URLHelper').define({
    /**
     * @class
     * URL parse/management helper. [tau.url]
     * <p/>
     * Uses the 'this.ctx' mechanic, see {@link tau.ArrayHelper}.
     * @constructs
     * @param {String} context URL string
     * @param {Object|String} params URL parameters
     */
    URLHelper: function (context, params) {
      if (tau.isString(context)) {
        this.ctx = context;
      } else {
        this.ctx = String(context);
      }
      if (params) {
        if (tau.isString(params)) {
          this.ctx = this.ctx + ((this.ctx.indexOf('?') > -1) ? '&' : '?') 
              + params;
        } else {
          tau.forEach(params, function (value, i) {
            this.append(i, value);
          }, this);
        }
      }
    },

    /**
     * Checks if a URL is a remote domain from the original document.
     * @returns {Boolean} True if the URL is in the same domain
     */
    isRemote: function () {
      var ctx = !!this.ctx ? this.ctx : this;
      return tau.resolveURL(ctx).indexOf(_ROOTURL) !== 0; 
    },

    /**
     * Returns the host name for the URL.
     * @returns {String} Host name
     */
    host: function () {
      var parts = _URLREGEXP.exec(!!this.ctx ? this.ctx : this);
      return (!tau.isArray(parts) || !parts.length > 2) ? null : parts[2]; 
    },

    /**
     * Returns the protocol name for the URL.
     * @returns {String} Protocol name
     */
    protocol: function () {
      var parts = _URLREGEXP.exec(!!this.ctx ? this.ctx : this);
      return (!tau.isArray(parts) || !parts.length > 1) ? null : parts[1]; 
    },

    /**
     * Returns the query string for the URL.
     * @returns {String} Query string
     */
    query: function () {
      var ctx = !!this.ctx ? this.ctx : this;
      return ctx.substring(ctx.indexOf('?') + 1);
    },

    /**
     * Returns all matching parameters values from a URL.
     * @param {String} name Parameter name to search
     * @param {Boolean} all True will return an list of all parameter values
     * @returns {Object|Array} A single parameter value or a list all values
     */
    param: function (name, all) {
      var i, len, parts, search, 
          ctx = !!this.ctx ? this.ctx : this,
          values = [],
          nameRegExp = new RegExp('[\\?&]' + name + '=([^&#]*)', 'g');
      // Search all parameter name instances and add to the values array
      while ((search = nameRegExp.exec(ctx))) {
        if (search && search[1]) {
          parts = search[1].split(',');
          for (i = 0, len = parts.length; i < len; i++) {
            values.push(parts[i]);
          }
        }
      }
      return !all ? values[0] : values;
    },

    /**
     * Returns a map of parameter names and their matching parameter values
     * from a URL.
     * @param {Boolean} all True will return an list of all parameter values
     * @returns {Object} Map containing parameter names to value arrays
     */
    paramMap: function (all) {
      var search, 
          ctx = !!this.ctx ? this.ctx : this,
          result = {};
      // Find parameters and map them to their respective values
      while ((search = /[\\?&]([^&#=]*)/g.exec(ctx))) {
        if (search && search[1] && !(search[1] in result)) {
          result[search[1]] = this.param(search[1], all);
        }
      }
      return result;
    },

    /**
     * Resolves a relative URL to an absolute.
     * <p/>
     * If a base is provided and the URL is relative, the resolved result will
     * have the base prepended.
     * <p/>
     * A relative URL has no http, ftp, etc, prefix.  It may begin with
     * <code>./</code>, <code>../</code>, <code>/</code>, <code>//</code>,
     * or a direct resource name.
     * @param {String} base Base URL to prepend, if null uses '/'
     * @returns {Object} 'this' instance
     */
    resolve: function (base) {
      if (!!this.ctx) {
        this.ctx = tau.resolveURL(this.ctx, base);
        return this;
      } else {
        return tau.resolveURL(this, base);
      }
    },

    /**
     * Appends/Overwrites a parameter to a URL.
     * @param {String} name Parameter name
     * @param {String} value Parameter value
     * @param {Boolean} overwrite True overwrites existing parameter values
     * @returns {Object} 'this' instance
     */
    appendParam: function (name, value, overwrite) {
      var parts, 
          ctx = !!this.ctx ? this.ctx : this;
      if (tau.isString(name)) {
        if (overwrite) {
          // Search for all parameters and overwrite it with the one provided
          ctx = ctx.replace(new RegExp('[&]' + name + '=([^&#]*)', 'g'), '');
          parts = new RegExp('[\\?]' + name + '=([^&#]*)', 'g').exec(ctx);
          if (parts && parts[0]) {
            ctx = ctx.replace(parts[0], '?' + name + '=' + value);
          } else {
            overwrite = false;
          }
        }
        if (!overwrite) {
          ctx = ctx + ((ctx.indexOf('?') > -1) ? '&' : '?') + name + '=' + value;
        }
      }
      if (!!this.ctx) {
        this.ctx = ctx;
        return this;
      } else {
        return ctx;
      }
    }
  });


  /** @lends tau.JobQueue.prototype */
  $class('tau.JobQueue').define(
  {
    $static: {
      /** @inner Default until that checks the iteration */
      DEFAULT_UNTIL: function () {
        return this.iteration <= 0; // this === job instance
      },
      /** @inner Until to stop on next job call */
      CANCELED_UNTIL: function () {
        return true;
      }
    },

    /**
     * @class
     * Job Queue.
     * @constructs
     */
    JobQueue: function (opts) {
      /** @private _running Currently running job */
      /** @private _paused Queue paused value */
      /** @private _queue Job queue array */
      this._queue = [];
      /** @private _opts JobQueue options */
      this._opts = tau.mixin({
        idSeed    : 0,      /** @param {Number} ID seed */
        autoRun   : false   /** @param {Boolean} Automatically run after add */
      }, opts, true);
    },

    /**
     * Checks if there is an job currently running.
     * @returns {Boolean} True if an job is running
     */
    isRunning: function () {
      return !!this._running;
    },

    /**
     * Checks if the queue is paused.
     * @returns {Boolean} True if the queue is paused
     */
    isPaused: function () {
      return !!this._paused;
    },

    /**
     * Returns the size of the queue (includes currently running job).
     * @returns {Number} Size of the the queue
     */
    size: function () {
      if (!this.isRunning()) {
        this.next(); // Flush out previously completed job
      }
      return this._queue.length;
    },

    /**
     * Returns a job reference.
     * @param {Number|Function|Object} j Job id/function/reference to find
     * @returns {Object} Job object (null = job not found)
     */
    get: function (j) {
      return this._queue[this.indexOf(j)];
    },

    /**
     * Returns the immidiate next job object.
     * @returns {Object} Next job object (null = no jobs in queue)
     */
    next: function () {
      var i, j, next; 
      while (this._queue.length && (next = this._queue[0])) {
        if (next.until()) {
          this._queue.shift(); // Job finished; remove & continue onto next
          next = null;
          continue;
        } else if (tau.isNumber(next.delay)) {
          // Next must be delayed, reorder queue with most waited job in front
          for (i = 1; i < this._queue.length; i++) {
            j = this._queue[i];
            if (j.timeStamp + (j.delay || 0) 
                < next.timeStamp + (next.delay || 0)) {
              next = this._queue.splice(i, 1)[0];
              this._queue.unshift(next);
            }
          }
        }
        return next;
      }
      return null;
    },

    /**
     * Starts the execution for jobs in the quueue.
     * @param {Function|Object} j Job function/reference to add & run first
     * @returns {Object} <code>this</code> instance
     */
    run: function (j) {
      var i, wait, job, 
          jobQueue = this;

      // Add the jobs to the front of the queue
      if (arguments.length > 0) {
        for (i = arguments.length - 1; i > -1; i--) {
          // Automaticaly unpause if a job is added via run
          if (this._queue.length < this.insert(arguments[i], 0)._queue.length
              && this.isPaused()) {
            this._paused = false;
          }          
        }
      }

      // Run all available jobs in proper order
      // No need to re-delay when the next job is the currently waiting job
      while (!this.isPaused() && !this.isRunning() 
          && (job = this.next()) && this._waiting !== job) {
        if (this._waiting) {
          clearTimeout(this._waiting.delayId); // Clear any waiting job
          delete this._waiting.delayId;
          delete this._waiting;
        }
        wait = !tau.isNumber(job.delay) ? 
            0 : job.delay - (new Date().getTime() - job.timeStamp);
        if (wait > 0) {
          this._waiting = job; // Set as the current job in waiting
          /** @inner Next job needs to be delayed, re-run job after wait */
          this._waiting.delayId = setTimeout(function () {
            delete jobQueue._waiting.delayId;
            delete jobQueue._waiting;
            jobQueue.run.call(jobQueue);
          }, wait);
        } else if (this._execute(job)) { // No waiting needed, execute the job
          continue;
        }
        break;
      }
      return this;
    },

    /**
     * Pauses the running queue.
     * @param {Boolean} unpause True will unpause the queue
     * @returns {Object} <code>this</code> instance
     */
    pause: function (unpause) {
      this._paused = !unpause;
      return this;
    },

    /**
     * Resumes the execution of the queue if it was paused previously 
     * @returns {Object} <code>this</code> instance
     */
    resume: function () {
      this._paused = false;
      return this.run.apply(this, arguments);
    },

    /**
     * Stops and clears any job remaining in the queue.
     * @returns {Object} <code>this</code> instance
     */
    reset: function () {
      this.cancel();
      this._queue = [];
      this._paused = false;
      return this;
    },

    /**
     * Returns the index of an job.
     * @param {Number|Function|Object} j Job id/function/reference to find
     * @returns {Number} Index of the job (-1 = not found)
     */
    indexOf: function (j) {
      var i, 
          type = tau.typeOf(j);
      switch (type) {
      case 'function':
        type = 'fn';
        break;
      case 'number':
        type = 'id';
        break;
      default: 
        return this._queue.indexOf(j); // Find by job object reference
      }
      // Find by Job id/function
      for (i = 0; i < this._queue.length; i++) {
        if (this._queue[i][type] === j) {
          return i;
        }
      }
      return -1;
    },

    /**
     * Adds a (or multiple arguments) job to the end of the queue.
     * @param {Function|Object} j Job function/reference to add
     * @returns {Object} <code>this</code> instance
     */
    add: function (j) {
      for (var i = 0; i < arguments.length; i++) {
        this.insert(arguments[i]);
      }
      if (!this.isRunning() && this._opts.autoRun) {
        this.run();
      }
      return this;
    },

    /**
     * Inserts a job to a specified position in the queue.
     * <p/>
     * Does not automatically run the jobs in the queue.
     * @param {Object} job Job reference with properties to inset
     * @param {Number} pos Insert position
     * @returns {Object} <code>this</code> instance
     */
    insert: function (j, pos) {
      if (tau.isFunction(j)) {
        this._insert({ fn: j });
      } else if (j && tau.isFunction(j.fn)) {
        this._insert(j, pos, j.delay);
      }
      return this;
    },

    /**
     * Removes a job (or multiple jobs) from the queue.
     * @param {Number|Function|Object} j Job id/function/reference to remove
     * @returns {Object} <code>this</code> instance
     */
    remove: function (j) {
      // Remove must: exist and not be running
      var idx = this.indexOf(arguments[0]);
      if (idx > -1 && this._running !== this._queue[idx]) {
        this._queue.splice(idx, 1);
      }
      if (arguments.length > 1) { // Recurse for multiple parameters 
        this.remove.apply(this, Array.prototype.slice.call(arguments, 1));
      }
      return this;
    },

    /**
     * Cancels & removes a job (or multiple jobs) from the queue.
     * <p/>
     * Not providing a parameter will stop the currently running job.
     * @param {Number|Function|Object} j Job id/function/reference to cancel
     * @returns {Object} <code>this</code> instance
     */
    cancel: function (j) {
      var idx;
      if (j) {
        idx = this.indexOf(j);
      } else if (this.isRunning()) {
        idx = 0; // No parameter, cancel the currently running job (first 
      }
      if (idx > -1) {
        this._queue[idx].cancel();
      }
      if (arguments.length > 1) { // Recurse for multiple parameters 
        this.remove.apply(this, Array.prototype.slice.call(arguments, 1));
      }
      return this;
    },

    /**
     * Promotes, or demotes, a job to a specific position in the queue.
     * @param {Function|Number|Object} j Job function/id/reference to promote
     * @param {Number} pos New index position (default 0, top of the queue)
     * @returns {Object} <code>this</code> instance
     */
    promote: function (j, pos) {
      // New index pos (default is 0)
      pos = pos >= this._queue.length ? 
          this._queue.length - 1 : (pos <= 0 ? 0 : pos || 0);

      // Promote must: exist, new position be different, and not be running
      var idx = this.indexOf(j);
      if (idx > -1 && pos != idx && this._running !== this._queue[idx]) {
        j = this._queue.splice(idx, 1)[0]; // Remove from queue and re-index
        if (pos === 0 && this.isRunning()) {
          pos = 1; // Insert just after currently running job
        }
        this._queue.splice(pos, 0, j);
      }
      return this;
    },

    /**
     * Creates and inserts a job into the queue.
     * @private
     * @param {Object} job Job reference with properties to add
     * @param {Number} pos Insert position
     * @prarm {Number} delay Add job after a secified milliseconds
     */
    _insert: function (job, pos, delay) {
      var jobQueue = this;
      job = tau.mixin(job, {
        /** @param {Number} id Unqiue ID that defines the job */
        id: ++this._opts.idSeed,
        /** @param {Number} timestamp Job creation timestamp */
        timeStamp : new Date().getTime()
      }, true);
      job = tau.mixin(job, {
        /** @param {Function} fn Job's execution function */
        fn        : tau.emptyFn,
        /** @param {Object} context "this" context for the fn */
        context   : job,
        /** @param {Number} iteration Number of time to run the job */
        iteration : 1,
        /** @param {Function} until Job's completion check function */
        until     : tau.JobQueue.DEFAULT_UNTIL,
        /** @param {Number} idle Milliseconds between each execution. 
         *  Note: Undefined/negative value will ignore cancel interruption */
        idle      : 0,
        /** @param Cancels a job (cont flag will continue execution) */
        cancel    : function (cont) {
                      jobQueue._cancel.call(jobQueue, this, cont);
                    }
        /** @param {Function} exception Exception callback function */
        /** @param {Array} arguments Parameters for the fn */
        /** @param {Number} delay Milliseconds to wait to be run after insert 
         *  Note: Setting negative value will raise its ranking for next() */
        /** @param {Boolean} stopNext Stops the next job execution */
      });

      if (!tau.isNumber(pos)) {
        this._queue.push(job);
      } else {
        pos = pos >= this._queue.length ? 
            this._queue.length - 1 : (pos <= 0 ? 0 : pos || 0);
        if (pos === 0 && this.isRunning()) {
          pos = 1; // Insert just after currently running job
        }
        this._queue.splice(pos, 0, job);
      }
      return pos;
    },

    /**
     * Executes a job.
     * @private
     * @param {Object} job Job reference to cancel
     * @returns {Boolean} True indicates to continue calling the next job
     */
    _execute: function (job) {
      var jobQueue = this;
      if (this._queue.indexOf(job) !== -1) {

        /** @inner Call the job's function then releases run properties */
        function doExecute() {
          if (tau.log.isLevel(tau.log.DEBUG)) {
            tau.log.debug(String.prototype.concat('Executing ' + job.fn.name,
              tau.isNumber(job.delay) ? '(delay ' + job.delay + 'ms)' : '',
              job.idleId ? '(idle ' + job.idle + 'ms, ' + job.idleId + ')' : ''
            ), 'Job-' + job.id);
          }
          if (job.idleId) {
            delete job.idleId; // Pause done, remove to avoid cancel handling
          }
          try {
            job.fn.apply(job.context || jobQueue, job.arguments);
          } catch (ex) {
            // Callback for the job's exception exeception
            tau.log.error('Unexpected exception is occurred: ' + ex);
            if (tau.isFunction(job.exception)) {
              job.exception.call(job, ex);
            }
          }
          return jobQueue._complete.call(jobQueue, job, job.idle >= 0);
        }

        this._running = job; // Set as the current job being run

        // Increment execution iteration
        if (tau.isNumber(job.iteration)) {
          job.iteration--;
        } else {
          job.iteration = 0;
        }

        // Run the job after some idle time or right away
        if (tau.isNumber(job.idle) && job.idle >= 0) {
          job.idleId = setTimeout(doExecute, job.idle);
        } else {
          return doExecute();
        }
      }
      return false;
    },

    /**
     * Cancels a job.
     * @private
     * @param {Object} job Job reference to cancel
     * @param {Boolean} cont contiue running the queue
     */
    _cancel: function (job, cont) {
      if (tau.log.isLevel(tau.log.DEBUG)) {
        tau.log.debug(String.prototype.concat(
          this._running === job ? 'Stopped ' : 'Canceled ',
          '(waited ' + (new Date().getTime() - job.timeStamp) + 'ms)'),
        'Job-' + job.id);
      }
      job.until = tau.JobQueue.CANCELED_UNTIL;
      this.remove(job);
      this._complete(job, cont);
    },

    /**
     * Clears a job's properties and the queue running state.
     * @param {Object} job Job refernce to complete
     * @param {Boolean} rerun Call a chained run
     * @returns {Boolean} True indicates to continue calling the next job
     */
    _complete: function (job, rerun) {
      if (job.delayId) {
        clearTimeout(job.delayId); // Stops any jobs waiting by a delay
        delete job.delayId;
      }
      if (job.idleId) {
        clearTimeout(job.idleId); // Stops currently idling job
        delete job.idleId;
      }
      if (this._running === job) {
        this._running = false; // Set running to false to allow next job to run
        if (rerun && !job.stopNext) {
          this.run(); // Continue running the queue
        } else {
          this.next(); // Flush completed job
        }
        return !job.stopNext;
      }
      return false;
    }
  });


  /**
   * Mixin class to to get/set registered objects into an array and a map.
   * <p/>
   * TODO: Documentation
   * @name tau.MapArray
   * @class
   */
  $class('tau.MapArray').define(
  /** @lends tau.MapArray.prototype */
  {
    getArray: tau.getterFactory('getArray', '[]'),

    getKeys: tau.getterFactory('getKeys', '[]'),

    getMap: tau.getterFactory('getMap', '{}'),

    length: function () {
      return this.getArray().length;
    },

    indexOf: function (value, isKey) {
      if (!isKey) {
        return this.getArray().indexOf(value);
      } else {
        return this.getKeys().indexOf(value);
      }
    },

    get: function (key) {
      var array = this.getArray();
      if (-1 < key && key < array.length) {
        return array[key];
      } else {
        return this.getMap()[key];
      }
    },

    set: function (value, key, unique) {
      var idx = -1, 
          array = this.getArray(),
          keys = this.getKeys(),
          map = this.getMap();
      if (!unique || array.indexOf(value) === -1) {
        if (-1 < key && key < array.length) { // Replace by index
          idx = Number(key);
          key = undefined;
        } else if (map.hasOwnProperty(key)) { // Replace by key
          idx = keys.indexOf(key);
        }
        if (array.hasOwnProperty(idx)) { // Replace
          array[idx] = value;
          if (map.hasOwnProperty(keys[idx])) {
            delete map[keys[idx]]; // Remove any previously mapped key value
          }
          keys[idx] = key;
        } else if (array.length < array.push(value)) { // Append
          idx = keys.push(key) - 1;
        }
        if (tau.isString(key) && -1 < idx && idx < array.length) {
          map[key] = value;
        }
      }
      return idx;
    },

    insert: function (value, key, unique) {
      var idx = -1, 
          array = this.getArray(),
          keys = this.getKeys(),
          map = this.getMap();
      if (!unique || array.indexOf(value) === -1) {
        if (-1 < key && key < array.length) { // Insert by index
          idx = Number(key);
          key = undefined;
          array.splice(idx, 0, value);
          keys.splice(idx, 0, key);
        } else if (!map.hasOwnProperty(key) && 
              array.length < array.push(value)) { // Append
          idx = keys.push(key) - 1;
        }
        if (tau.isString(key) && -1 < idx && idx < array.length) {
          map[key] = value;
        }
      }
      return idx;
    },

    remove: function (value, isKey) {
      var idx = -1, 
          array = this.getArray(),
          keys = this.getKeys(),
          map = this.getMap();
      if (!isKey) {
        idx = array.indexOf(value);
      } else if (-1 < value && value < array.length) { // Remove by index
        idx = Number(value);
      } else if (map.hasOwnProperty(value)) { // Remove by key
        idx = keys.indexOf(value);
      }
      if (-1 < idx && idx < array.length) {
        if (map.hasOwnProperty(keys[idx])) {
          delete map[keys[idx]]; // Remove any mapped key value
        }
        array.splice(idx, 1);
        keys.splice(idx, 1);
        return true;
      }
      return false;
    },

    clear: function () {
      // Next call to each prototype will create a new instance
      delete this.getArray;
      delete this.getKeys;
      delete this.getMap;
    },

    forEach: function (callbackFn, context) {
      tau.forEach(this.getArray(), callbackFn, context);
    },

    toArray: function () {
      return Array.prototype.slice.call(this.getArray());
    },

    toMap: function () {
      return tau.clone(this.getMap());
    }
  });


  /**
   * Mixin class to to get/set registered objects for an array and/or a map.
   * <p/>
   * The <code>getMapItem</code> & <code>setMapItem</code> functions are used to
   * store/retrieve an object instance to a matching string key name.
   * Additionally, <code>getArrayItems</code> function can be used directly to
   * accessed this instance's array.
   * <p/>
   * <code>getAllItems</code> will return a new array containing unique items
   * maintained by the registry.
   * @name tau.ItemRegistry
   * @class
   * TODO: Need a v2.0 of an Array/Map management class
   */
  $class('tau.ItemRegistry').define(
  /** @lends tau.ItemRegistry.prototype */
  {
    /** Returns a new list containing a all unique registered items. */
    getAllItems: function () {
      var i, 
          array = [];
      if (this._registryArray) {
        for (i = 0; i < this._registryArray.length; i++) {
          if (array.indexOf(this._registryArray[i]) === -1) {
            array.unshift(this._registryArray[i]);
          }
        }
      }
      for (i in this._registryMap) {
        if (this._registryMap.hasOwnProperty(i) 
            && array.indexOf(this._registryMap[i]) === -1) {
          array.unshift(this._registryMap[i]);
        }
      }
      return array.length > 0 ? array : null;
    },

    /** Return the item registry array. */
    getArrayItems: function () {
      if (!this._registryArray) {
        /** @private Lazily create a registry if one doesn't already exit  */
        this._registryArray = [];
      }
      return this._registryArray;
    },
    
    /** Returns the corresponding object for the key name from registry map. */
    getMapItem: function (name) {
      if (tau.isString(name)) {
        if (!this._registryMap) {
          /** @private Lazily create a registry if one doesn't already exit */
          this._registryMap = {};
        }
        return this._registryMap[name];
      }
      return null;
    },

    /** Saves an object to the registry map for the corresponding key name. */
    setMapItem: function (name, value) {
      if (tau.isString(name) && value) {
        if (!this._registryMap) {
          /** @private Lazily create a registry if one doesn't already exit */
          this._registryMap = {};
        }
        this._registryMap[name] = value;
        return true;
      }
      return false;
    },

    /** Clears an item in registry map by key or all with no argument. */
    clearMapItem: function (arg) {
      if (arg === null) {
        this._registryMap = {};
        return true;
      } else if (this._registryMap && tau.isString(arg)) {
        delete this._registryMap[arg];
        return true;
      }
      return false;
    }
  });


  // JSON Module
  _MODULE.json = (function (JSON) {
    JSON = JSON || {};
    if (!tau.isFunction(JSON.stringify)) {

      // stringify private variables
      var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
          gap,
          indent,
          meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
          },
          rep;

      /** @inner Format integers to have at least two digits. */ 
      function f(n) {
        return n < 10 ? '0' + n : n;
      }

      /** @inner Safely put quotes around a string, even for control chars. */ 
      function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable,
            /** @inner */
            function (a) {
              var c = meta[a];
              return typeof c == 'string' ? c : 
                  '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' : '"' + string + '"';
      }
    
      /** @inner Produce a string from holder[key]. */
      function str(key, holder) {
        var i, // The loop counter.
            k, // The member key.
            v, // The member value.
            length, 
            mind = gap, 
            partial, 
            value = holder[key];

        // If the value has a toJSON method, call it to obtain a replacement value.
        if (value && typeof value == 'object') {
          if (typeof value.toJSON == 'function') {
            value = value.toJSON(key);
          } else if (Object.prototype.toString.call(value) === '[object Date]') {
            // Handle ISO date conversion separately, because unlike the original 
            // source, we do not modify native prototypes  
            value = isFinite(value.valueOf()) ?
                value.getUTCFullYear()     + '-' +
                f(value.getUTCMonth() + 1) + '-' +
                f(value.getUTCDate())      + 'T' +
                f(value.getUTCHours())     + ':' +
                f(value.getUTCMinutes())   + ':' +
                f(value.getUTCSeconds())   + 'Z' : null;
          }
        }

        // Replace values if replaces function was passed
        if (typeof rep == 'function') {
          value = rep.call(holder, key, value);
        }
    
        // Converts values to string for respective types
        switch (typeof value) {
        case 'string':
          return quote(value);
    
        case 'number':
          return isFinite(value) ? String(value) : 'null';
    
        case 'boolean':
        case 'null':
          return String(value);
    
        case 'object':
          if (!value) {
            return 'null';
          }
          gap += indent;
          partial = [];
    
          if (Object.prototype.toString.apply(value) === '[object Array]') {
            length = value.length;
            for (i = 0; i < length; i += 1) {
              partial[i] = str(i, value) || 'null';
            }
            v = partial.length === 0 ? '[]' : gap ? 
                  '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : 
                  '[' + partial.join(',') + ']';
            gap = mind;
            return v;
          }
    
          if (rep && typeof rep == 'object') {
            length = rep.length;
            for (i = 0; i < length; i += 1) {
              k = rep[i];
              if (typeof k == 'string') {
                v = str(k, value);
                if (v) {
                  partial.push(quote(k) + (gap ? ': ' : ':') + v);
                }
              }
            }
          } else {
            for (k in value) {
              if (Object.hasOwnProperty.call(value, k)) {
                v = str(k, value);
                if (v) {
                  partial.push(quote(k) + (gap ? ': ' : ':') + v);
                }
              }
            }
          }
    
          v = partial.length === 0 ? '{}' : gap ? 
              '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : 
              '{' + partial.join(',') + '}';
          gap = mind;
          return v;
        }
      }

      /**
       * Converts a valid JavaScript value to a valid JSON text string.
       * A direct integration of Douglas Crockford's <code>JSON.stringify</code> 
       * implementation available in the public domain.
       * @see http://www.JSON.org/json2.js (2010-03-20)
       * @throws {Error} Invalid replacer
       * @private
       */
      JSON.stringify = function (value, replacer, space) {
        var i,
            gap = '',
            indent = '';

        // Setup space character for numbers/string
        if (typeof space == 'number') {
          for (i = 0; i < space; i += 1) {
            indent += ' ';
          }
        } else if (typeof space == 'string') {
          indent = space;
        }

        // If there is a replacer, it must be a function or an array.
        rep = replacer;
        if (replacer && typeof replacer != 'function'
            && (typeof replacer != 'object' 
            || typeof replacer.length != 'number')) {
          throw new Error('JSON.stringify');
        }

        return str('', { '' : value });
      };
    }

    /* JSON.parse definition */
    if (!tau.isFunction(JSON.parse)) {

      // parse private variables
      var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

      /**
       * Converts a valid JSON text into a JavaScript value.
       * A direct integration of Douglas Crockford's <code>JSON.parse</code>
       * implementation available in the public domain.
       * @see http://www.JSON.org/json2.js (2010-03-20)
       * @throws {Error} Invalid JSON formated text
       * @private
       */
      JSON.parse = function (text, reviver) {
        var j;

        /**
         * Inner helper function used to recursively walk the resulting 
         * structure so that modifications can be made. 
         * @inner
         */
        function walk(holder, key) {
          var k, v, value = holder[key];
          if (value && typeof value == 'object') {
            for (k in value) {
              if (Object.hasOwnProperty.call(value, k)) {
                v = walk(value, k);
                if (v !== undefined) {
                  value[k] = v;
                } else {
                  delete value[k];
                }
              }
            }
          }
          return reviver.call(holder, key, value);
        }

        // Replace certain Unicode characters with escape sequences.
        text = String(text);
        cx.lastIndex = 0;
        if (cx.test(text)) {
          /** @inner */
          text = text.replace(cx, function (a) {
            return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
          });
        }

        // Run the text against RegExp that look for non-JSON patterns
        if (tau.isJSON(text)) {

          // Compile the text into a JavaScript structure
          j = eval('(' + text + ')');

          // Walk the reviver
          return typeof reviver == 'function' ? walk( { '' : j }, '') : j;
        }

        throw new SyntaxError('JSON.parse');
      };
    }
    return JSON;
  }) (GLOBAL.JSON);


  /** Utility log levels */
  tau.namespace('tau.log', {
    LEVEL   : 1,     // Logging level 
    DEBUG   : 1,
    INFO    : 2,
    WARN    : 3,
    ERROR   : 4,
    FATAL   : 5,
    NONE    : 6,

    /** Checks if the current logging level */
    isLevel: function (level) {
      return tau.log.LEVEL <= level;
    },
    /** Debug logging */
    debug: function (msg, src) {
      tau.log(msg, tau.log.DEBUG, src);
    },
    /** Information logging */
    info: function (msg, src) {
      tau.log(msg, tau.log.INFO, src);
    },
    /** Warning logging */
    warn: function (msg, src) {
      tau.log(msg, tau.log.WARN, src);
    },
    /** Error logging */
    error: function (msg, src) {
      tau.log(msg, tau.log.ERROR, src);
    },
    /** Fatal logging */
    fatal: function (msg, src) {
      tau.log(msg, tau.log.FATAL, src);
    }
  });

  /** Utility handler functions */
  tau.namespace('tau.optionize', {
    /** onEvent optionize registration util function */
    onEvent: function (name, callbackFn) {
      this.onEvent(name, callbackFn, this);
    }
  });
}) (window);