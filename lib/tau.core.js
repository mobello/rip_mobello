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

    _ANCHOR = null,
    
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
    /**
     * 개발자들의 개발편의를 위해 자주 사용되는 Utility
     * 메소드들을 최상위 네임스페이스에 정의하고 개발할 때 쉽게 접근할
     * 수 있도록 한다.
     * @namespace 최상위 네임스페이스, 앱 개발시 빈번히 사용되는 Utility
     * 멤소드들을 정의한다. 하위 네임스페이스로는 
     * <code>rt, ui, util, fx, data</code>가 있다.
     **/
    tau = {

      // Mobello Framework version
      VER: '0.9.0',
      
      /**
       * Mobello Framework이 차지하는 전체 화면의 너비를
       * 픽셀단위로 반환한다.<p/>
       * Mobello Framework이 차지하는 넓이는 HTML에서 id가
       * 'tau-root'로 지정된 앨리면트가 차지하는 영역의 넓이가 된다.
       * @returns {Number} 전체화면에서 넓이에 해당하는 픽셀크기
       */
      getWidth: function () {
        return tau.getDimension().width;
      },
      
      /**
       * Mobello Framework이 차지하는 전체 화면의 높이를
       * 픽셀단위로 반환한다.<p/>
       * Mobello Framework이 차지하는 높이는 HTML에서 id가
       * 'tau-root'로 지정된 앨리먼트가 차지하는 영역의 높이가
       * 된다.
       * @returns {Number} 전체화면에서 높이에 해당하는 픽셀크기 
       */
      getHeight: function () {
        return tau.getDimension().height;
      },

      /**
       *  Mobello Framework이 차지하는 전체 화면의 크기를 객체
       *  형태로 반환한다. <p/>
       *  반환되는 객체에 width, height 프로퍼티가 있으며 이를
       *  통해 넓이와 높이 값을 확인할 수 있다.
       *  @example
       *  var dim = tau.getDemension();
       *  tau.log(dim.width); // width value
       *  tau.log(dim.height); // height value
       *  @returns {Object} Mobello Framework이 차지하는 전체 화면의
       *  크기를(width, height) 저장하고 있는 객체
       **/
      getDimension: function () {
        if (!_ROOT_DOM) {
         _ROOT_DOM = document.getElementById('tau-root'); 
        }
        if (_ROOT_DOM) {
          return {width: (_ROOT_DOM.clientWidth || _ROOT_DOM.offsetWidth),
                  height: (_ROOT_DOM.clientHeight || _ROOT_DOM.offsetHeight)};
        }
        return {width: window.innerWidth, height: window.innerHeight};
      },
      
      /**
       * Normalize된 typeof 함수로서 대상 객체의 종류에 따라
       * 일관된 형태로 타입을 문자열로 반환한다.(예를 들면,
       * 대상 객체가 null일경우 JavaScript의 내장 typeof 를
       * 사용하면 'object'를 반환하지만 tau.typeOf를 사용하면
       * 'null'을 반환한다)
       * <p/>
       * Normalize된 JavaScript의 타입은 다음과 같다
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
       * @example
       * tau.typeOf('foo'); // 'string'
       * tau.typeOf(123); // 'number'
       * tau.typeOf([]); // 'array'
       * tau.typeOf({}); // 'object'
       * tau.typeOf(null); 'null'
       * tau.typeOf(new Date); // 'date'
       * tau.typeOf(true); // 'boolean'
       *
       * @param {Object} obj JavaScript 객체
       * @returns {String} Normalize된 JavaScript 타입(문자열)
       */
      typeOf: function (obj) {
        return _OBJ2TYPE[Object.prototype.toString.call(obj)] 
            || (obj ? 'object' : obj === null ? 'null' : 'undefined');
      },

      /**
       * 명시된 객체(obj)가 'undefined' 인지를 확인하고 그
       * 결과를 Boolean값으로 반환한다.
       * @example
       * tau.isUndefined(undefined); // true
       * tau.isUndefined(); // true
       * tau.isUndefined(null); // false
       * tau.isUndefined(0); // false
       * tau.isUndefined(''); // false
       *
       * @param {Object} obj JavaScript 객체
       * @returns {Boolean} 객체가 undefined이면 true를 그렇지
       * 않으면 false를 반환한다.
       */
      isUndefined: function (obj) {
        return typeof obj == 'undefined';
      },

      /**
       * 명시된 객체가 숫자인지를 확인하고 그 결과를
       * Boolean값으로 반환한다.
       * @example
       * tau.isNumber(0); // true
       * tau.isNumber(2.3); // true
       * tau.isNumber('foo'); // false
       *
       * @param {Object} obj JavaScript 객체
       * @returns {Boolean} 객체가 숫자이면 true를 그렇지 않으면
       * false를 반환한다.
       */
      isNumber: function (obj) {
        return typeof obj == 'number' && isFinite(obj);
      },

      /**
       * 명시된 객체가 Boolean의 값인지 확인하고 그 결과를
       * true/false로 반환한다.
       * @example
       * tau.isBoolean(true); // true
       * tau.isBoolean(false); // true
       * tau.isBoolean({}); // false
       * tau.isBoolean([]); // false
       *
       * @param {Object} obj JavaScript 객체
       * @returns {Boolean} 만약 명시된 객체가 boolean이면 true를 그렇지
       * 않으면 false를 반환한다.
       */
      isBoolean: function (obj) {
        return typeof obj == 'boolean';
      },

      /**
       * 명시된 객체가 String인지 확인하고 그 결과를
       * true/false로 반환한다.
       * @example
       * tau.isString(123); // false
       * tau.isString('foo'); // true
       * tau.isString(''); // true
       *
       * @param {Object} obj JavaScript 객체
       * @returns {Boolean} 만약 명시된 객체가 String이면 true를 그렇지 않으면
       * false를 반환한다.
       */
      isString: function (obj) {
        return typeof obj == 'string';
      },

      /**
       * 명시된 객체가 function 또는 class인지 확인하고 그 결과를
       * true/false로 반환한다.
       * @example
       * tau.isFunction(123); // false
       * tau.isFunction(new Function()); // true
       * tau.isFunction(tau.isString); // true
       *
       * @param {Object} obj JavaScript 객체 
       * @returns {Boolean} 명시된 객체가 function이면 true를 그렇지 않으면
       * false를 반환한다.
       */
      isFunction: function (obj) {
        return tau.typeOf(obj) === 'function';
      },

      /**
       * 명시된 객체가 인스턴스인지 확인하고 그 결과를
       * true/false로 반환한다. 만약 명시된 객체가
       * function인지 같이 확인하고자 한다면 isFunction 파라미터의
       * 값을 true로 설정하면 된다.
       * @example
       * tau.isObject({}); // true
       * tau.isObject([]); // true
       * tau.isObject(new Function()); // false
       * tau.isObject(new Function(), true); // true
       *
       * @param {Object} obj JavaScript 객체 
       * @param {Boolean} isFunction true 일경우 function객체도
       * true를 반환한다.
       * @returns {Boolean} 명시된 객체가 Object 또는 function일경우 true를
       * 그렇지 않을 경우 false를 반환한다.
       */
      isObject: function (obj, isFunction) {
        return obj && ((typeof obj == 'object') 
            || (isFunction && tau.isFunction(obj))) || false;
      },

      /**
       * 명시된 객체가 Date인지 확인하고 그 결과를
       * true/false로 반환한다.
       * @example
       * tau.isDate(new Date()); // true
       * tau.isDate({}); // false
       *
       * @param {Object} obj JavaScript 객체
       * @returns {Boolean} 명시된 객체가 Date일경우 true를
       * 그렇지 않을경우 false를 반환한다.
       */
      isDate: function (obj) {
        return tau.typeOf(obj) === 'date';
      },

      /**
       * 명시된 객체가 적절한 값을 가지는지 확인하고 그 결과를
       * true/false로 반환한다. 그 값이 undefined/null/NaN/""
       * 이 아닐경우 true를 반환한다.
       * @example
       * tau.isValue({}); // true
       * tau.isValue([]); // true
       * tau.isValue(null); // false
       * tau.isValue(undefined); // false
       * tau.isValue(''); // false
       *
       * @param {Object} obj JavaScript 객체
       * @returns {Boolean} 명시된 객체가 undefined, null, NaN, "" 이 아닐경우
       * true를 반환하고 그렇지 않을경우 false를 반환한다.
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
       * 명시된 객체가 배열인지 확인하고 그 결과를
       * true/false로 반환한다.
       * @example
       * tau.isArray([]); // true
       * tau.isArray({}); // false
       *
       * @param {Object} obj JavaScript 객체
       * @param {Boolean} relaxed 좀더 확장된 형태의 배열인지 확인하기 위한
       * 옵션(즉, 상속관계를 허용한다)
       * @returns {Boolean} 명시된 객체가 배열일경우 true를 반환하고 그렇지
       * 않을경우  false를 반환한다.
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
       * 명시된 객체가 HTML DOM앨리먼트 타입인지 확인하고 그 결과를
       * true/false로 반환한다.
       * @example
       * tau.isElement(document.createElement('div')); // true
       * tau.isElement(document.createTextNode('foo')); // false
       *
       * @param {Object} obj JavaScript 객체 
       * @returns {Boolean} 명시된 객체가 DOM 앨리먼트 타입이면
       * true를 그렇지 않으면 false를 반환한다.
       */
      isElement: function (obj) {
        return !!(obj && obj.nodeType === 1);
      },
      
      /**
       * 명시된 객체가 HTML DOM Fragment인지 확인하고 그
       * 결과를 true/false로 반환한다.
       * @example
       * tau.isFragment(document.createElement('div')); // false
       * tau.isFragment(document.createDocumentFragment()); // true
       *
       * @param {Object} obj JavaScript 객체 
       * @returns {Boolean} 명시된 객체가 DOM Fragment이면
       * true를 그렇지 않으면 false를 반환한다.
       */
      isFragment: function (obj) {
        return !!(obj && obj.nodeType === 11);
      },

      /**
       * Checks if an object is a Hash.
       * @private
       * @deprecated this method is not supported
       * @param {Object} obj JavaScript object
       * @returns {Boolean} True if object is a Hash
       */
      isHash: function (obj) {
        return obj instanceof Hash;
      },

      /**
       * 명시된 문자열이 네임스페이스 형태인지 확인하고 그
       * 결과를 true/false로 반환한다.
       * @example
       * tau.isNamespace('foo'); // true
       * tau.isNamespace('foo.bar'); // true
       * tau.isNamespace('foo,bar'); // false
       * tau.isNamespace('foo-bar'); // false
       *
       * @param {String} ns 네임스페이스 문자열
       * @returns {Boolean} 명시된 문자열이 적법한 네임스페이스 문자열이면 
       * true를 반환하고 그렇지 않으면 false를 반환한다.
       */
      isNamespace: function (ns) {
        return tau.isString(ns) && /^[\w]+(\.[\w]+)*$/.test(ns);
      },

      /**
       * 아무런 작업을 하지 않는 Dummy function.
       * <p/>
       * 오류를 발생시키지 않고 이전에 정의된 function을
       * disable시키기 위히 주로 사용된다.
       */
      emptyFn: function () {
      },
      
      /**
       * 명시된 function을 호출할 때 function에 정의된
       * 파라미터 외에 추가적인 파라미터를 넘기고자 할 경우
       * 사용한다. 추가하고자 하는 파라미터의 개수에는 제한이
       * 없다.
       * <p/>
       * @example
       * function showArguments() {
       *   alert(Array.prototype.join.call.join(arguments, ', '));
       * }
       * showArguments(1, 2, 3);
       * // -> alerts "1, 2, 3"
       * var f = tau.curry(showArguments, this, 1, 2, 3);
       * f('a', 'b');
       * // -> alerts "a, b, 1, 2, 3"
       *
       * @param {Function} fn 최종적으로 호출할 function
       * @param {Object} ctx context 객체
       * @param {Arguments} [args] 추가적으로 넘기고자 하는 파라미터
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
       * 명시된 function을 호출할 때 사용할 context를
       * 지정한다. 이벤트 핸들러 또는 callback메소드 내에서
       * this 키워드를 이용해서 Closure로 된 객체에 접근하고자
       * 할 때 유용하게 하용할 수 있다.
       * <p/>
       * @example
       * ...
       * loadModel: function (start, size) {
       *   this.flickr = null;
       *
       *   function loaded(resp) {
       *     if (resp.status === 200) {
       *       // callback 메소드에서 this 키워드를 이용해
       *       // flicker접근 가능!
       *       this.flickr = resp.responseJSON;
       *     }
       *   }
       *
       *   if (!this.flickr) {
       *     tau.req({
       *       type: 'JSONP',
       *       jsonpCallback:'jsoncallback',
       *       url: this.url,
       *       callbackFn: tau.ctxAware(loaded, this) // <--
       *     });
       *   }
       * }
       * ...
       *
       * @param {Function} fn 원본 메소드, 이 메소드 내에서 사용하는 기존의
       * context를 다른 context로 변경하여 사용할 수 있다.
       * @param {Object} [ctx] Context 객체(ex. this)
       * @returns {Function} 명시된 context를 이용하여 감싸진
       * function, 이 function 내에서 this 키워드를 활용하여 주어진 context의
       * property들을 접근할 수 있다.
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
       * 단말의 Orientation을 감지하여 그 값을 반환한다. 이때
       * 반환되는 값은 'landscape' 또는 'portrait'중의 하나가
       * 된다.
       * @returns {String} Orientation 상태. 'landscape' 또는 'portrait'
       */
      senseOrientation: function () {
        var o = window.orientation;
        if (tau.isNumber(o)) { // if 0, resolves as false
          return (Math.abs(o) === 90) ? 'landscape' : 'portrait';
        }
        return undefined;
      },
      
      /**
       * 브라우저의 URL창을 통해 Mobello Framework을 실행시킬
       * 때 파라미터를 명시하였다면 그 파라미터의 키와 매핑된
       * 값을 반환한다.
       * @example
       * http://localhost/tau/laucher.html?aaa=bbb
       * tau.getLauncherParam('aaa'); // returns 'bbb'
       * 
       * @param {String} key 파라미터 키 
       * @returns {String} 파리미터 키에 해당하는 값 
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
       * $class()를 이용하여 생성하는 모든 클래스는 내부적으로
       * tau.TObject를 상속받는다. 따라서 다음과 같이
       * instanceof 를 통해 Mobello 객체인지 확인할 수 있다.
       * @example
       * var foo = // Mobello 클래스 인스턴스 
       * if (foo instanceof tau.TObject) {} // true 
       * @private
       */
      TObject: (function () {
        var obj = function TObject() {};
        obj.prototype.$classname = 'tau.TObject';
        
        /**
         * 현재 객체를 문자열로 변환하여 반환한다. 
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
       * 소스(src) 객체의 프로퍼티들을 대상(dest) 객체에
       * 추가하여 대상 객체에서도 소스 객체의 프로퍼티들에
       * 접근할 수 있도록 한다.
       * <p/>
       * 오직 소스 객체(상속된 프로퍼티 배제)에 있는 프로퍼티들만이
       * 대상객체로 복사된다.
       *
       * @example
       * var src = {
       *   level: 'low',
       *   opts: {one: 1, two: 2},
       *   add: function (a, b) {
       *     return a + b;
       *   }
       * };
       *
       * var dest = {
       *   level: 'high',
       *   opts: {three: 3, four: 4},
       *   multiply: function (a, b) {
       *     return a * b;
       *   }
       * }
       * var d = tau.mixin(dest, src); // mixin
       * d.multiply(2, 3); // 6
       * d.add(2, 3); // 5 (mixed in)
       * d.level; // 'high'
       *
       * d = tau.mixin(dest, src, true); // override
       * d.level; // 'low' (overridden)
       * d.opts; // {one: 1, two: 2}
       *
       * d = tau.mixin(dest, src, 'remix'); // 'remix'
       * d.opts; // {one: 1, two: 2, three: 3, four: 4}
       *
       * d = tau.mixin(dest, src, true, ['level', 'add']); // 'filter'
       * d.add(2, 3); // 5
       * d.level; // 'low'
       * d.opts; // {three: 3, four: 4}
       *
       * @param {Object} dest 프로퍼티들을 적용되는 목적 객체 또는 클래스
       * @param {Object} src 프로퍼티들을 복사하기 위한 소스 객체 또는 클래스
       * @param {Boolean|String} [override] Override 또는 'remix' (recursive mix)
       * @param {Array} [filter] 소스 객체에 존재하면서 목적 객체에
       * 복사하고자 하는 프로퍼티들에 대한 배열
       * @returns {Object} 소스객체에 있는 프로퍼티들이 적용된 대상 객체
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
       * 소스(src) 클래스 프로퍼티들을 대상(dest) 클래스에
       * 추가한다.
       * <p/>
       * 객체의 인스턴스를 augment할 경우 해당 객체에 대해서만
       * 프로퍼티들이 적용되며, 클래스 프로퍼티(prototype)을
       * augment할 경우 이후 생성되는 해당 클래스로 생성하는
       * 모든 인스턴스에 프로퍼티들이 적용된다(new 생성자를
       * 통해 성생되는 객체)
       *
       * @param {Object} dest 대상(목적) 객체 또는 클래스. 이 객체 
       * 또는 클래스로 프로퍼티들이 추가된다.
       * @param {Object} src 소스 클래스. 추가하고자 하는 프로프티를
       * 가지고 있는 클래스
       * @param {Boolean} [override] 대상객체에 소스객체와 동일한 프로퍼티를
       * 가지고 있다면 덮어쓸지 결정한다.
       * @param {Array} [filter] 적용하고자 하는 프로퍼티 이름에 대한 배열
       * @returns {Object} 프로퍼티들이 적용된 목적 객체 또는 클래스
       * @throws {Error} 대상 또는 소스 파라미터가 적절하지 않을 경우
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
       * JavaScript의 네임스페이스를 정의한다.
       * <p/>
       * 기존에 정의된 네임스페이스 구조에서 정의된
       * 네임스페이스가 존재하지 않는다면 기존의 네임스페이스
       * 구조를 덮어쓰지 않고 새로운 네임스페이스를 추가한다.
       * <p/>
       * 네임스페이스의 문법이 적절하지 않거나 기존에 있는
       * 네임스페이스를 덮어쓰려고할 경우 Error가 발생된다.
       * @example
       * tau.namespace('foo.bar'); // creates namespace 'foo.bar'
       * tau.namespace('foo.bar', {name: 'mobell'});
       * foo.bar.name; // 'mobell'
       *
       * tau.namespace('foo.bar.baz', function () { return 'mobello';});
       * foo.bar.baz(); // 'mobello'
       *
       * @param {String} ns 선언할 네임스페이스 문자열
       * @param {Object|Function} [attach] 네임스페이스에 추가할 
       * 프로퍼티 또는 Function
       * @param {Boolean} [overwrite] true이면 기존의 네임스페이스를 덮어쓴다.
       * @returns {Boolean} 적어도 하나이상의 네임스페이스가 수정되었다면
       * true를 반환한다.
       * @throws {Error} 네임스페이스의 형식이 적절하지 않거나 이전에 동일한
       * 이름의 네임스페이스가 정의되어 있을 경우
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
       * 명시된 객체(obj)를 복제하여 새로운 객체를 리턴한다. 
       * 복제에 사용할수 있는 객체로는 object, function, array, date, RegExp이
       * 가능하다.
       * @example
       * var original = new tau.ScriptHelper();
       * alert(original !== tau.clone(original)); // true
       *
       * @param {Object} obj 복제하고자 하는 객체
       * @param {Boolean} [deep] 재귀적인 방법으로 내부 프로퍼티들을 모두 복제한다.
       * @param {Array} [ignore] deep clone하지 않을 프로퍼티들의 배열
       * @returns {Object} 새롭게 복제된 객체
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
       * 자식 클래스가 부모클래스의 프로퍼티들을 상속받도록 한다.
       * <p/>
       * 새로운 프로퍼티와 메소드들을 추가하고자 할 경우 <code>props</code>
       * 파라미터를 통해 기술해야 한다. 부모클래스에서 동일한 이름의 
       * 프로퍼티를 가지고 있을 경우 자식클래스에 의해 오버라이드 된다.
       * <p/>
       * 추가적으로, 자식클래스에서는 <code>superclass</code>
       * 프로퍼티를 통해 부모클래스의 메소드와 프로퍼티들에
       * 접근할 수 있다.
       * <p/>
       * 주의: 정상적인 상속을 위해 자식클래스는 생성자 안에서 부모클래스의
       * 생성자를 호출해야 한다. 
       * @example
       * function tau.example.MySubClass() {
       *   tau.example.MySubClass.superclass.constructor.apply(this, arguments);
       * }
       * tau.extend(tau.example.MySubClass, tau.example.MyClass);
       *
       * @param {Object} child 자식 클래스
       * @param {Object} parent 상속받고자 하는 부모 클래스
       * @param {Object} [props] 추가 또는 오버라이드하고자 하는 프로퍼티
       * @returns {Object} 명시된 프로퍼티가 적용된 상속받은 클래스
       * @throws {Error} child, parent 파라미터가 클래스(function)가 아닐경우
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
       * 클래스 프로퍼티 이름(prop)과 새로운 인스턴스
       * 스크립트(string) 또는 function을 위용하여
       * lazy-loading getter function을 생성한다.
       * <p/>
       * 주의: <code>prop</code>파라미터로 지정된 프로퍼티
       * 이름과 prototype의 프로퍼티 이름이 정확히 일치해야
       * 한다.
       * @example
       * MyClass.prototype = {
       *   getFoo: tau.getterFactory('getFoo', 'new tau.URLHelper'),
       *   getBar: tau.getterFactory('getBar', function () { return []; })
       * }
       *
       * @param {String} prop 클래스의 프로퍼티 이름
       * @param {String|Function} instanceFactory 인스턴스 스크립트 또는 function
       * @param {Array} [instanceFactory] instanceFactory 호출시 사용할 라파미터 배열
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
       * 객체의 프로퍼티들의 값을 이에 상응하는 프로퍼트 setter function을 통해
       * 설정되도록 한다.
       * <p/>
       * 기본 동작은 Camelcase로 구성된 setter function을
       * 호출한다. 즉, 특정 객체가 <code>foo</code>라는
       * 프로퍼티를 가지고 있다면 이 프로퍼트에 해당하는 값을
       * <code>setFoo</code> function의 파라미터로 활용해 설정한다.
       * <p/>
       * Optionize는 opts 파라미터를 활용해 customizing할 수
       * 있다. customizing할 수 있는 옵션들로
       * <code>override, filter, defaultFn, handler</code>가 있다.
       * @example
       * var myobj = {
       *   _name: 'mobello',
       *   version: '1.0',
       *
       *   setName: function (name) {
       *     this._name = name;
       *   },
       *
       *   setVersion: function (ver) {
       *     this.version = ver;
       *   }
       * };
       * // myobj._name -> 'mobello'
       *
       * tau.optionize(myobj, {name: 'hello mobello'});
       * // myobj._name -> 'hello mobello'
       * 
       * tau.optionize(myobj, {version: '2.0'});
       * // myobj.version -> '1.0' (has same property)
       *
       * tau.optionize(myobj, {version: '2.0'}, {override: true});
       * // myobj.version -> '2.0' (override)
       *
       * tau.optionize(myobj, {name: 'hello', version: '3.0'}, 
       *    {override: true, filter: ['version']}); 
       * // myobj._name -> 'hello mobello'
       * // myobj.version -> '3.0'
       *
       * tau.optionize(myobj, {name: 'hello', version: '3.0'}, 
       *    {override: true, filter: ['version', 'name']}); 
       * // myobj._name -> 'hello'
       * // myobj.version -> '3.0'
       *
       * tau.optionize(myobj, {name: 'hello'}, {
       *   handler: {
       *     name: function (p, v) { // property, value
       *       this._name = v + ' mobello again'
       *     }
       *   }
       * });
       * // myobj._name -> 'hello mobello again'
       *
       * @param {Object} dest 프로퍼티를 적용될 목적 객체 또는 클래스
       * @param {Object} src 적용하고자 하는 소스 객체
       * @param {Object} [opts] 옵션: override, filter, handler, defaultFn
       * @param opts.override Boolean으로 표현되며 true일 경우
       * 기존의 값을 덮어 쓴다.
       * @param opts.filter Array로 표현되며 optionize
       * 적용하고자 하는 프로퍼티들을 배열로 기술한다.
       * @param opts.handler Object로 기술하며 해당 프로퍼티를
       * 키로 하고 value는 custom function으로 기술한다.
       * @param opts.defaultFn default function을
       * override한다. Camelcase의 setter가 아닌 다른 방법으로 값을 설정하고자
       * 할 경우 defaultFn을 확장해서 사용한다.
       * @returns {Object} 프로퍼티들이 적용된 목적 객체
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
       * 배열 또는 배열과 같은 객체들의 각 앨리먼트들
       * Iteration하면서 <code>callbackFn</code>을 호출한다.
       * 이때 <code>callbackFn</code>의 파라미터로 배열의 값과
       * 인덱스(또는 프로퍼티), 그리고 원본 객체를 넘겨 받는다.
       * @example
       * var myarr = ['mobello', '1.0'];
       * tau.forEach(myarr, function (a, b, c) {
       *   alert(a + ', ' + b + ', ' + c);
       * }, myarr);
       * 
       * // prints 
       * // mobello, 0, mobello,1.0
       * // 1.0, 1, mobello,1.0
       * 
       * var myobj = { name: 'mobello', version: '1.0' };
       * tau.forEach(myobj, function (a, b, c) {
       *   alert(a + ', ' + b + ', ' + c);
       * }, myobj);
       * // prints
       * // mobello, name, [object Object]
       * // 1.0, version, [object Object]
       *
       * @param {Object} obj 배열 또는 배열과 같은
       * 객체(associateve array)
       * @param {Function} callbackFn 각 iteration마다 호출될 callback function.
       * callback function의 파라미터(3개)는 차례대로 값, 배열의 인덱스
       * 또는 객체의 프로퍼티, 원본객체가 된다.
       * @param {Object} context CallbackFn 내에서 사용할 'this' context
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
       * 소스(src) 배열을 목적(dest) 배열로 합친다음 결과를
       * 반환한다.
       * @example
       * var src = ['mobello', '1.0'];
       * var dest = ['hello', 'world'];
       * tau.merge(dest, src); // ["hello", "world", "mobello", "1.0"]
       *
       * @param {Array} dest 합쳐질 목적 배열
       * @param {Array} src 원본배열
       * @returns {Array} 소스 배열과 합쳐진 목적 배열
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
       * 문자열의 앞, 뒤에 있는 공백 문자열을 모두제거하여
       * 반환한다.
       * @example
       * var str = ' hello mobello  ';
       * str = tau.trim(str); // 'hello mobello'
       *
       * @param {String} text 공백을 제거할 문자열
       * @returns {String} 공백이 제거된 문자열
       */
      trim: function (text) {
        return (text || '').replace(/^\s+/, '').replace(/\s+$/, '');
      },

      /**
       * '-'(dash)로 연결된 문자열을 CamelCase로 변환하여
       * 반환한다.
       * @example
       * var str = 'foo-bar';
       * str = tau.camelize(str); // fooBar
       *
       * @param {String} text Camelize할 문자열
       * @returns {String} Cameliz된 문자열
       */
      camelize: function (text, isLowerCase) {
        return text.replace(/-([a-z])/ig, function (all, letter) {
          return letter.toUpperCase();
        });
      },

      /**
       * Camelize된 문자열을 underscore('_')로 분리된 문자열로
       * 변환하여 반환한다.
       * @example
       * var str = 'fooBar';
       * str = tau.underscore(str); // foo_bar
       *
       * @param {String} text underscore로 치환환 Camelcase
       * 문자열
       * @returns {String} Underscore로 치환된 문자열
       */
      underscore: function (text) {
        return text.replace(/::/g, '/')
                   .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
                   .replace(/([a-z\d])([A-Z])/g, '$1_$2')
                   .replace(/-/g, '_')
                   .toLowerCase();
      },

      /**
       * 상대경로의 URL을 절대경로의 URL로 치환하여 반환한다.
       * <p/>
       * base가 명시되어 있어있고 URL이 상대경로이면 base를
       * 이용하여 절대경로를 생성한 다음 결과를 반환한다.
       * <p/>
       * 주의: 상대경로는 http, ftp등의 scheme을 명시하지
       * 않으며 <code>./</code>, <code>../</code>,
       * <code>/</code>, <code>//</code> 등으로 시작하거나
       * prefix가 없이 시작한다.
       * @example
       * tau.resolveURL('foo.html');
       * // "file:///E:/workspace/mobell/src/foo.html" (current path)
       *
       * tau.resolveURL('foo.html', 'http://bar.com/');
       * // "http://bar.com/foo.html"
       *
       * @param {String} url Any URL
       * @param {String} [base] 사용할 Base URL, 명시되지 않으면 '/'을 사용
       * @returns {String} Base URL을 사용한 절대 경고의 URL
       */
      resolveURL: function (url, base) {
        var c,
            a = _ANCHOR || (_ANCHOR = GLOBAL.document.createElement('a'));
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
       * @private
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
       * 명시된 text가 JSON 포맷인지 확인하여 결과를
       * true/false로 반환한다.
       * @example
       * tau.isJSON('[aaa, bbb]'); // false
       * tau.isJSON('['aaa', 'bbb']'); // true
       * tau.isJSON('[1, 2, 3]'); // true
       * tau.isJSON('{aaa, bbb}'); // false
       * tau.isJSON('{"aaa": "bbb"}'); // true
       *
       * @param {String} text JSON 포맷인지 확인할 문자열
       * @returns {Boolean} 주어진 문자열이 JSON 포맷이면
       * true를 반환한다.
       * @see <a href="http://www.JSON.org/json.js">www.JSON.org/json.js</a>
       */
      isJSON: function (text) {
        return (/^[\],:{}\s]*$/.test(
            text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                .replace(/(?:^|:|,)(?:\s*\[)+/g, '')));
      },

      /**
       * JavaScript 값을 JSON형태의 텍스트로 변환하여 반환한다.
       * <p/>
       * 브라우저의 Native코드가 지원이되면
       * <code>JSON.stringify</code>를 사용하고 그렇지
       * 않으면 Douglas Crockford의 구현체를 사용한다.
       * @example
       * tau.stringify({aaa: 'bbb'}); // '{"aaa":"bbb"}'
       * tau.stringify({aaa: 'bbb'}, null, 2);
       * // '{
       * //    "aaa": "bbb"
       *  // }'
       * 
       * @param {Object|String|Number|Boolean} value
       * 변환하고자 하는 값
       * @param {Function|Array} replacer function일 경우
       * custom변환을 가능하게 하고, 배열일 경우 변환하고자
       * 하는 프로퍼티를 배열로 명시한다.
       * @param {String|Number} space indentation으로 표현하기
       * 위해 사용한다.
       * @returns {Object} 주어진 값을 문자열로 변환한 값
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
       * Displays specified message(msg) on the dialog panel. You can use this
       * method as a convenient method if you want to dispaly alert message.
       * 
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
