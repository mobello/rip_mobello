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
       * @class
       * Mobello에서 생성하는 모든 객체는 tau.TObject를 상속받는다.
       * @see $class
       */
      TObject: (function () {
        var obj = function TObject() {};
        obj.prototype.$classname = 'tau.TObject';
        
        /**
         * 현재 객체를 문자열로 변환하여 반환한다. 일반적으로
         * Mobello클래스가 foo.Bar로 정의되었다면 반환되는
         * 문자열은 "[object foo.Bar]"가 된다.
         * @example
         * var v = new foo.Bar();
         * v.toString(); // '[object foo.Bar]'
         * @name toString
         * @function
         * @memberOf tau.TObject.prototype
         * @returns {String} 객체를 표현하는 문자열
         */
        obj.prototype.toString = function () {
          return '[object '.concat(this.$classname, ']');
        };
        /**
         * 현재 callstack의 정보를 반환한다. 이 메소드의
         * 호출이 빈번히 발생할 경우 성능저하가 발생할 수
         * 있으므로 신중하게 사용해야 한다.
         * @example
         * var aa = ...
         * aa.currentStack().toString();
         * // prints callstack as a String
         *
         * @name currentStack
         * @function
         * @memberOf tau.TObject.prototype
         * @returns {Object} 현재의 callstack 정보를 담고있는
         * 객체
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
            /* url, line, or column position cannot be parsed in Safari */
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
       * tau.isJSON('["aaa", "bbb"]'); // true
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
       * @param {Function|Array} [replacer] function일 경우
       * custom변환을 가능하게 하고, 배열일 경우 변환하고자
       * 하는 프로퍼티를 배열로 명시한다.
       * @param {String|Number} [space] indentation으로 표현하기
       * 위해 사용한다. 공백 또는 indentation할 숫자
       * @returns {Object} 주어진 값을 문자열로 변환한 값
       * @see <a href="http://www.JSON.org/json.js">www.JSON.org/json.js</a>
       */
      stringify: function (value, replacer, space) {
        return _MODULE.json.stringify(value, replacer, space);
      },

      /**
       * JSON포맷의 문자열을 JavaScript 객체로 변환하여
       * 반환한다.
       * <p/>
       * 브라우저에서 기능을 지원하면 브라우저 내장 메소드인
       * <code>JSON.parse</code>를 활용하며 그렇지 않을 경우 
       * Douglas Crockford's의 구현체를 활용한다.
       * @example
       * tau.parse('{}'); // {}
       * tau.parse('true'); // true
       * tau.parse('"foo"'); // "foo"
       * tau.parse('[1, 5, "false"]'); // [1, 5, "false"]
       * tau.parse('null'); // null
       *
       * var val = JSON.parse('{"p": 5}', 
       *        function(k, v) { if (k === "") return v; return v * 2; });
       * // val is {p: 10}
       *
       * @param {String} text 객체로 변환하기 위한 JSON 형태의 문자열
       * @param {Function} [reviver] Callback function, 최종 값을 생성하기
       * 전에 Customizing할 수 있다.
       * @returns {Object} 변환된 JSON 객체
       * @see <a href="http://www.JSON.org/json.js">www.JSON.org/json.js</a>
       */
      parse: function (text, reviver) {
        if (!text) return null;
        return _MODULE.json.parse(text, reviver);
      },

      /**
       * 중복되지 않는 랜덤숫자를 생성하여 반환한다. 주로
       * 컴포넌트 아이디 생성에 활용된다.
       * <p/>
       * 파라미터로 <code>null</code> 또는 <code>''</code>를
       * 사요하면 prefix를 사용하지 않는 숫자 또는 문자열 형태의 id를
       * 생성하여 반환한다.
       * @example
       * tau.genId(); // "tau1339376987400"
       * tau.getId(null); // 1339376987401
       * tau.genId(''); // "1339376987402"
       * tau.genId('mobello'); // "mobello1339376987403"
       *
       * @param {String} [pre] 생성될 id앞에 붙이는 prefix (default: 'tau') 
       * @return {String|Number} 유일하게 생성된 id값
       */
      genId: function (pre) {
        return (typeof pre == 'undefined' ? 'tau' : pre) + (++_idSeed);
      },

      /**
       * 주어진 메시지를 로깅한다.
       * <pre>
       *  Log levels (tau.log.*):
       *   DEBUG  : 1
       *   INFO   : 2
       *   WARN   : 3 (default)
       *   ERROR  : 4
       *   FATAL  : 5
       *   NONE   : 6
       * </pre>
       * @example
       * tau.log('mobello'); // "mobello"
       * tau.log('mobello', 1); // "[614] mobello"
       * tau.log('mobello', 3, 'debug'); // "[debug] mobello"
       *
       * @param {String} msg 로그로 남길 메시지
       * @param {Number} [level] 로깅레벨: 1(debug) - 6(none)
       * @param {String|Class} [src] 로깅메시지 앞에 붙일 문자열
       * @returns {String} 포맷된 로깅 메시지
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

      /**
       * <code>tau.ArrayHelper</code>클래스를 쉽게 사용할 수
       * 있도록 하기 위한 Utility 메소드이다.
       * @example
       * var a = ['a', 'b', 'c', 'a'];
       * tau.arr(a).unique().pushUnique('e');
       * alert(a); // a = ['a', 'b', 'c', 'e']);
       *
       * @param {Object|Array} context native 배열 객체
       * @returns {tau.ArrayHelper} 새롭게 생성한 <code>tau.ArrayHelper</code> 객체
       * @see tau.ArrayHelper
       */
      arr: function (context) {
        return new tau.ArrayHelper(context); 
      },

      /**
       * <code>tau.URLHelper</code>클래스를 쉽게 사용할 수
       * 있도록 하기 위한 Utility 메소드이다.
       * @example
       * var url = tau.url('http://foo.bar?aaa=bbb');
       * url.isRemote(); // true
       * url.host(); // 'foo.bar'
       * url.protocol(); // 'http:'
       * url.query(); // 'aaa=bbb'
       * url.param('aaa'); // 'bbb'
       *
       * var url = tau.url('http://foo.bar', {ccc: 'ddd', eee: 'fff'});
       * url.param('ccc'); // 'ddd'
       *
       * @param {Object} context URL 문자열
       * @param {Object} [opts] JSON객체 타입의 URL 파리미터
       * @returns {tau.URLHelper} 새롭게 생성한
       * <code>tau.URLHelper</code>객체
       * @see tau.URLHelper
       */
      url: function (context, opts) {
        return new tau.URLHelper(context, opts);
      },

      /**
       * 네트워크 API를 쉽게 사용할 수 있도록 하기 위한
       * Utility 메소드이다.
       * <p/>
       * opts.type의 값이 <code>jsonp</code>일 경우 
       * <code>tau.data.XSSRequest</code> 클래스의 인스턴스를 생성해서 반환하며
       * 그렇지 않을 경우 <code>tau.data.XMLRequest</code>
       * 클래스의 인스턴스를 생성하여 반환한다.
       * @example
       * var req = tau.req({type: 'JSONP', url:
       * 'http://foo.bar', callbackFn: function (resp) {
       *    tau.log(resp.responseJSON);}});
       * req.send();
       *
       * @param {Object} opts 네트워크 Request 생성하기 위한
       * 옵션들. JSON 객체 포맷
       * @param {String} [opts.type='GET'] Request의 형식을 나타내며,
       * GET, POST, JSONP 셋중의 하나를 가진다.
       * @param {String} [opts.encoding='UTF-8'] Character Encoding을
       * 명시한다.
       * @param {Number} [opts.timeout=5000] Request timeout을 나타내며
       * Default값은 5초이다.
       * @param {String} opts.url Request URL 문자열
       * @param {Object} [opts.params] Request 파라미터(JSON
       * 객체 포맷, ex; {key1: 'value1', ke2: 'value2'})
       * @param {String} [opts.jsonpCallback='callback']
       * JSONP통신시 callback파라미터의 키를 지정한다.
       * @param {Boolean} [opts.async=true] 동기 비동기를 지정한다.
       * true일 경우 비동기로 통신을 한다. XSSRequest일 경우
       * 항상 비동기(async)로 통신을 수행한다.
       * @param {Function} [opts.callbackFn] 통신을 수행한
       * 결과를 처리하기 위한 Callback 메소드
       * @returns {tau.data.XSSRequest|tau.data.XMLRequest}  opts.type의 값에 
       * 따라 새롭게 생성된 Request객체
       */
      req: function (opts) {
        if (opts && opts.type && opts.type.toUpperCase() === 'JSONP') {
          return new tau.data.XSSRequest(opts);
        } else {
          return new tau.data.XMLRequest(opts);
        }
      },
      
      /**
       * 명시된 메시지를 경고창을 통해 출력한다. 경고메시지를
       * 출력하고자 할 경우 이 메소드를 통해 편리하게 출력할
       * 수 있다.
       * @param {String} msg 출력할 메시지
       * @param {Object} [opts] 경고창의 속정을 정의하기 위한 객체
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
       * 명시된 메시지를 확인창을 통해 출력한다. 사용자로 부터
       * 동의를 얻기 위해 메시지를 출력하고자 할 경우 편리하게 사용할
       * 수 있다.
       * @param {String} msg 출력하고자 하는 메시지
       * @param {Object} [opts] 확인창의 속정을 정의하기 위한 객체
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
       * 명시된 메시지를 사용자로 부터 입력을 받기 위한 창을
       * 통해 출력한다. 
       * @param {String} msg 사용자 입력창에 출력할 메시지
       * @param {Object} [opts] 입력창의 속정을 정의하기 위한 객체
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
       *
       * The requestAnimationFrame method is used to signal to the user agent that a script-based animation needs 
       * to be resampled. When requestAnimationFrame(callback) is called, the user agent MUST schedule a script-based 
       * animation resampling by appending to the end of the animation frame request callback list an entry whose handle 
       * is a user-agent-defined integer greater than zero that uniquely identifies the entry in the list, 
       * whose callback is callback and whose cancelled flag is false.
       * @param {Function} callback A parameter specifying a function to call when it's time to update 
       *                             your animation for the next repaint
       * @private
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
       * @private
       */
      cancelRequestAnimationFrame: function (requestid) {
        return _cancelRequestAnimationFrame.call(window, requestid);
      }
    };
  }

  /**
   * JavaScript에서 객체지향 클래스를 정의할 수 있도록 한다.
   * 이 방법을 사용하면 한번의 정의를 통해 객체지향 방법에서
   * 제공하는 추상화, 상속, 다형성, 캡슐화(정보은닉) 기법을
   * 구현할 수 있다.
   * <p/>
   * 편리한 방법으로 클래스를 정의하기 위해 사용되며
   * method-chain의 방법을 통해 부모클래스를 
   * 상속(<code>extend</code>)하고, 관련 클래스들을
   * <code>mixin</code>할 수 있으며, 최종적으로
   * <code>define</code>을 통해 클래스에서 제공할 메소드들을 정의할 수 있다.
   * @example
   * // class definition
   * $class('com.mycompany.MySuper').define({
   *   $static: {                     // Static variables
   *     MAX_SIZE: 1000
   *   },
   *
   *   MySuper: function (a, b) { // Class constructor
   *     this._a = a;
   *     this._b = b;
   *   },
   *
   *   foo: function () { // Class member
   *     return this._a + this._b;
   *   },
   *
   *   getMax: function () {
   *     return com.mycompany.MySuper.MAX_SIZE;
   *   }
   * });
   *
   * $class('com.mycompany.MyClass').extend(com.mycompany.MySuper).define({
   *   foo: function () { // override
   *     return this._a * this._b;
   *   },
   *
   *   bar: function () {
   *     return this._a - this._b;
   *   }
   * });
   * 
   * @example
   * // usage
   * var my = new com.mycompany.MySuper(3, 2);
   * my.foo(); // 5
   * my.getMax(); // 1000
   * my.getMax() === com.mycompany.MySuper.MAX_SIZE; // true
   *
   * my = new com.mycompany.MyClass(3, 2);
   * my.foo(); // 6
   * my.bar(); // 1
   *
   * @param {String} name 생성하고자 하는 클래스명(문자열)(네임스페이스 포함)
   * @returns {tau.Class} 클래스정의를 위한 시스템 클래스 객체(extend 또는
   * define을 통해 Chaining할 수 있음)
   */
  $class = function (name) {
    /** 
     * Mobello 프레임워크에서 클래스 정의시 생성되는 시스템 클래스.
     * $class('foo.Bar').define({ ... });와 같이
     * 클래스를 정의할 경우 시스템 내부적으로 클래스의 객체를 생성하게
     * 되며 개별 클래스 시스템을 구성하기 위한
     * 기능들을 정의한다. 클래스 정의가 종료됨가 동시에 이
     * 클래스의 객체도 사라진다.
     * <p/>
     * Mobello 클래스 시스템을 통해 객체지향 언어에서 얻을 수
     * 있는 추상화, 상속, 다형성, 캡슐화(정보은닉)를활 용할 수
     * 있으며 이를 위해 다음과 같은 메소드들을 지원한다.
     * <ul>
     *   <li>extend: 상속관계를 정의한다.</li> 
     *   <li>mixin: 자주사용하는 기능들을 별도의 클래스로
     *   모듈과 하고 이들 기능들을 클래스 정의시 재사용한다. </li>
     *   <li>define: 정의된 클래스의 멤버함수들을 정의한다.</li>
     * </ul>
     * 주의: 사용자가 직접 클래스의 인스턴스를 생성할 수
     * 없으며 시스템 내부적으로 인스턴스가 생성된다.
     *
     * @example
     * $class('foo.Bar').extend(foo.Baz).define({
     *   Bar: function () { // Constructor
     *     // ...
     *   },
     *
     *   say: function () { // Member function
     *     // ...
     *   }
     * });
     * @class
     * Mobello의 클래스 시스템으로 외부에서는 접근이 제한된다.
     * @name tau.Class
     * @class
     * @see $class
     */
    var lang = { 'name': name };

    /** assigns the file path on which this class is defined */ 
    if (typeof $require != 'undefined') {
      lang.path = $require.path;
    }
    
    /**
     * 기존에 정의의된 클래스를 상속(확장)한다. 기존의
     * 클래스를 상속할 경우 부모클래스에 있는 모든 기능들을
     * 활용할 수 있으며 추가적으로 확장된 기능들을 정의할 수
     * 있다. 또한 부모클래스에 정의된 기능을 오버라이드하여
     * 기능을 확장할 수도 있다.
     * @example
     * $class('com.mycompany.MySuper').define({
     *   $static: {                     // Static variables
     *     MAX_SIZE: 1000
     *   },
     *
     *   MySuper: function (a, b) { // Class constructor
     *     this._a = a;
     *     this._b = b;
     *   },
     *
     *   foo: function () { // Class member
     *     return this._a + this._b;
     *   },
     *
     *   getMax: function () {
     *     return com.mycompany.MySuper.MAX_SIZE;
     *   }
     * });
     *
     * $class('com.mycompany.MyClass').extend(com.mycompany.MySuper).define({
     *   foo: function () { // override
     *     return this._a * this._b;
     *   },
     *
     *   bar: function () { // add new function
     *     return this._a - this._b;
     *   }
     * });
     *
     * @name extend
     * @function
     * @memberOf tau.Class.prototype
     * @param {Function} superclass 상속할 부모클래스를 지정한다.
     * @returns {tau.Class} 클래스를 생성하기 위한 시스템 클래스 객체
     * @throws {Error} superclass가 클래스가 아닐 경우
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
     * 명시된 클래스의 멤버들을 현재 클래스의 기능으로
     * 가져온다. 만약 기존에 동일한 멤버들이 존재한다면
     * 덮어쓰지 않는다.
     * @example
     * $class('com.mycompany.MySuper').mixin(com.mycompany.Util).define({
     *   ...
     * });
     *
     * @example
     * $class('com.mycompany.MySuper').mixin( // more than one class
     *     com.mycompany.Util, com.mycompany.Common).define({ //
     *   ...
     * });
     *
     * @name mixin
     * @function
     * @memberOf tau.Class.prototype
     * @param {Object} args mixin할 클래스, 다수개의 클래스를 명시할 수 있다.
     * @returns {tau.Class} 클래스를 생성하기 위한 시스템 클래스 객체
     */
    lang.mixin = function () {
      this.mixins = arguments;
      delete this.mixin;
      return this;
    };

    /**
     * 현재 클래스가 특정 클래스를 상속받았다면 상속한 부모클래스를 가리킨다.
     * @example
     * $class('com.mycompany.MySuper').define({
     *   foo: function () { // override
     *     return 'MySuper';
     *   }
     * });
     *
     * $class('com.mycompany.MyClass').extend(com.mycompany.MySuper).define({
     *   foo: function () { // override
     *     var msg = com.mycompany.MyClass.$super.foo.apply(this, arguments);
     *     return msg + ' and MyClass';
     *   }
     * });
     * 
     * @example
     * var my = new com.mycompany.MyClass();
     * my.foo(); // prints 'MySuper and MyClass'
     *
     * @name $super
     * @field
     * @type tau.TObject
     * @memberOf tau.Class
     */
    /**
     * 현재 인스턴스의 클래스명을 가리킨다.
     * @example
     * $class('foo.Bar').define({
     *   ...
     * });
     * 
     * @example
     * var bar = new foo.Bar();
     * bar.$classname // 'foo.Bar'
     *
     * @name $classname
     * @field
     * @type String
     * @memberOf tau.TObject.prototype
     */
    /**
     * 명시된 클래스가 현재 객체에 mixin되었는지 여부를
     * 확인하고 결과를 true/false로 반환한다.
     * @example
     * $class('foo.Bar').mixin(foo.Baz).define({
     *   ...
     * });
     *
     * @example
     * var bar = new foo.Bar();
     * bar.isMixinOf(foo.Baz); // true
     *
     * @name isMixinOf
     * @function
     * @memberOf tau.TObject.prototype
     * @param {Object} target 현재 객체에 mixin이 적용되었는지
     * 확인하고자 하는 클래스
     * @returns {Boolean} 현재 객체에 명시된 클래스가
     * mixin되었다면 true를 그렇지 않으면 false를
     * 반환한다.
     */
    /**
     * 현재 클래스가 정의된 물리적 파일 이름을 가리킨다.
     * @example
     * // this class is defined in 'file://.../src/main.js'
     * $class('foo.Bar').define({
     *   ...
     * });
     *
     * @example 
     * foo.Bar.$filepath // 'file://.../src/main.js'
     *
     * @name $filepath
     * @field
     * @type String
     * @memberOf tau.Class
     */

    /**
     * 클래스의 멤버들을 정의한다.
     * <p/>
     * 클래스의 생성자를 정의할 수 있으며 생성자는 클래스의
     * 이름과 동일한 이름의 메소드로 정의한다.
     * @example
     * $class('com.mycompany.MySuper').define({
     *   MySuper: function () { // constructor
     *
     *   },
     *
     *   foo: function (a, b) { // member function
     *
     *   }
     * });
     * <p/>
     *
     * @name define
     * @function
     * @memberOf tau.Class.prototype
     * @param {Object} m 클래스 정의를 위한 멤버들
     * @throws {Error} 기존에 동일한 클래스가 이미 정의되어 있을 경우
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
      cls.$filepath = this.path; // File path property (static)

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
   * tau.Class에 대한 접근자로 사용하며 tau.Class의
   * static메소드들을 이용할 수 있다. 일반적으로
   * tau.Class 객체는 내부적으로 생성되고 사용자에게 노출되지
   * 않지만 static 메소드들은 접근이 가능하다.
   * <p/>
   * 예를들어 문자열을 가지고 클래스객체를 생성하기 위한 메소드인
   * forName()을 다음과 같이 사용할 수 있다.
   * @example
   * var clazz = $class.forName('tau.example.MyClass');
   * var instance = new class();
   *
   * @see tau.Class
   * @name $class
   * @field
   * @memberOf $global
   */

  /**
   * 명시된 클래스 이름(네임스페이스 포함)에 해당하는
   * <code>Function/Class</code>를 찾아 반환한다.<p/>
   * 주의: forName() 메소드는 tau.Class 의 static 메소드이지만
   * 시스템 내부 클래스이므로 외부에서는 접근이 불가능하다.
   * 따라서 $class.forName()형태로 사용해야 한다.
   * @example
   * var clazz = $class.forName('tau.example.MyClass');
   * var instance = new clazz();
   *
   * @param {String} ns 네임스페이스에 준수하여 생성된 Function 또는 클래스
   * @returns {Function|Class} 명시된 클래스 네임스페이스에 해당하는
   * <code>Function/Class</code>
   * @throws {Error} 명시된 네임스페이스의 Class 또는 Function이
   * 정의되어 있지 않을 경우
   * @name forName
   * @function
   * @memberOf tau.Class
   * @see $global.$class
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

  /** @lends tau.ScriptHelper.prototype */
  $class('tau.ScriptHelper').define({

    /**
     * 명시된 옵션들을 이용하여 외부의 자바스크립트 또는 CSS파일을 동적으로 로딩한다.
     * @example
     * &lt;script type="text/javascript" src="...">&lt;/script>
     * &lt;link type="text/css" rel='stylesheet' media="screen" href="...">&lt;/link>
     *
     * @class
     * 동적인 방법으로 자바스크립트(opts.type = 'script') 또는
     * CSS 링크(opts.type = 'css')를 로딩한다. 동적으로
     * 자바스크립트를 로딩하기 위해 document의 head 앨리먼트 내에
     * script 또는 lilnk 앨리먼트를 생성하는 형태로 해당 스크립트를 로딩한다.
     * 
     * @constructs
     * @param {Object} opts ScriptHelper 객체 생성시 사용할 수
     * 있는 옵션들
     * @param {String} [otps.type = 'script'] 'css' 또는 'script'
     * @param {String} [otps.url] 스크립트에 대한 URL 주소,
     * 만약 생략하면 load() 메소드를 통해 기술할 수 있다.
     * @param {Function} [otps.callbackFn] 성공적으로
     * 로딩되었을 때 호출되는 Callback 메소드
     * @param {Function} [otps.timeoutFn] 타임아웃이 되었을 때
     * 호출되는 Callback 메소드
     * @param {Number} [otps.timeout] 스크립트가 로딩
     * 완료될때 까지의 시간. millisecond로 표현한다.
     * @param {Object} [otps.context] callback 함수 내에서
     * 사용될 'this' 객체
     * @param {Boolean} [otps.noCache = false] 기존에 동일한 스크립트 파일이
     * 로딩되어 있더라도 새롭게 로딩한다.
     * @param {Boolean} [otps.autoUnload = false] 로딩이
     * 완료되면 로딩된 스크립트를 자동으로 unloading한다.
     * @param {String} [otps.charset] Characterset 인코딩을
     * 지정한다. 생략하면 setCharset()메소드를 통해 지정할 수
     * 있다.
     * @see tau.req
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
     * 로딩될 스크립트의 character set을 지정한다. 일반적으로
     * 'utf-8'을 지정하면 무난하다.
     * @param {String} charset 지정하고자 하는 Chracter set
     */
    setCharset: function (charset) {
      if (tau.isString(charset)) {
        this.ctx.setAttribute('charset', charset);
      }
    },
    
    /**
     * head 앨리먼트 하부에 script앨리먼트를 동적으로
     * 삽입함으로써 해당 스크립트를 동적으로 로딩한다.
     * 해당 스크립트가 성공적으로 로딩되었을 때 <code>callbackFn</code>
     * 메소드가 호출된다.
     * <p/>
     * Async방법으로 로딩되므로 로딩할 스크립트에 정의된
     * 메소드들은 반드시 로딩할 스크립트가 완전히 로딩된
     * 후에 호출되어야 한다.
     * @param {String} url 로딩할 JavaScript 소스 URL
     * @param {Function} [callbackFn] 로딩이 완료된 후에 호출될 callback 메소드
     * @param {Function} [timeoutFn] Timeout이 발생되었을 경우 호출될 callback 메소드
     * @returns {Element} 새롭게 추가된 DOM 앨리먼트
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
     * 기존에 로딩된 스크립트를 Unloading한다. head 앨리먼트
     * 내에 생성되어 있는 scrpt 앨리먼트를 삭제한다.
     */
    unload: function () {
      var head = this._opts.head,
          children = head.childNodes;
      for (var i = children.length - 1; i  >= 0 ; i--) {
        if (children[i] === this.ctx) {
          head.removeChild(this.ctx);
          break;
        }
      }
    },

    /**
     * 기존에 로딩된 스크립트를 Unloading한다음 새롭게
     * 로딩한다.
     */
    reload: function () {
      this.unload();
      this._opts.head.appendChild(this.ctx);
    },
  });
  
  /** @lends tau.ArrayHelper.prototype */
  $class('tau.ArrayHelper').define({
    /**
     * Array 객체를 편리하게 사용할 수 있도록 하기 위한
     * Utility 클래스이다.
     * @class
     * Array 객체를 편리하게 사용할 수 있도록 하기 위한
     * Utility 클래스이다.
     * @example
     * var a = ['a', 'b', 'c', 'a'];
     * if (new tau.ArrayHelper(a).unique().pushUnique('e')) {
     *   alert(a); // a = ['a', 'b', 'c', 'e']);
     * }
     * if (tau.ArrayHelper.prototype.pushUnique.call(a, 'f')) {
     *   alert(a); // a = ['a', 'b', 'c', 'e', 'f']);
     * }
     * @constructs
     * @param {Object|Array} context
     * @see tau.arr
     */
    ArrayHelper: function (context) {
      if (tau.isArray(context)) {
        this.ctx = context;
      } else {
        this.ctx = Array.prototype.slice.call(context);
      }
    },

    /**
     * 배열에서 중복된 항목이 있으면 제거한다.
     * @example
     * var arr = new tau.ArrayHelper([1, 2, 3, 3]);
     * arr.unique(); // [1, 2, 3]
     * @returns {tau.ArrayHelper} 'this' 객체
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
     * 명시된 값을 배열을 맨 마지막에 추가한다. 중복된 값이
     * 있으면 추가하지 않는다.
     * @example
     * var arr = new tau.ArrayHelper([1, 2, 3]);
     * arr.pushUnique(4); // [1, 2, 3, 4]
     *
     * @param {Object} value 배열에 추가하고자 하는 값
     * @returns {Boolean} 명시된 값이 배열에 추가되었으면
     * true를 그렇지 않으면 false를 반환한다.
     */
    pushUnique: function (value) {
      var ctx = !!this.ctx ? this.ctx : this;
      if (ctx.indexOf(value) === -1) {
        return ctx.length < ctx.push(value);
      }
      return false;
    },

    /**
     * 명시된 값을 배열의 맨 앞부분에 삽입한다. 만약 중복된
     * 값이 있으면 추가하지 않는다.
     * @example
     * var arr = new tau.ArrayHelper([1, 2, 3, 4]);
     * arr.unshiftUnique(5); // [5, 1, 2, 3, 4]
     * @param {Object} value 배열에 추가하고자 하는 값
     * @returns {Boolean} 명시된 값이 배열에 추가되었으면
     * true를 그렇지 않으면 false를 반환한다.
     */
    unshiftUnique: function (value) {
      var ctx = !!this.ctx ? this.ctx : this;
      if (ctx.indexOf(value) === -1) {
        return ctx.length < ctx.unshift(value);
      }
      return false;
    },

    /**
     * 배열에서 명시된 값을 제거한다.
     * @example
     * var arr = new tau.ArrayHelper([5, 1, 2, 3, 4]);
     * arr.remove(5); // [1, 2, 3, 4]
     *
     * @param {Object} value 배열에서 제거될 값
     * @param {Boolean} all true이면 동일한 모든 값을 제거한다.
     * @returns {Number} 제거된 값의 개수 (0 [null/false] = none)
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
     * 배열에서 맨 마지막에 위치한 값을 반환한다. 이때 배열의
     * 변화는 발생되지 않는다.
     * @example
     * var arr = new tau.ArrayHelper([1, 2, 3]);
     * arr.peek(); // 3
     *
     * @returns {Object} 배열에서의 맨 마지막 값
     */
    peek: function () {
      var ctx = !!this.ctx ? this.ctx : this;
      return ctx[ctx.length - 1];
    }
  });


  /** @lends tau.URLHelper.prototype */
  $class('tau.URLHelper').define({
    /**
     * URL을 편리하게 조작할 수 있도록 하는 Helper
     * 클래스이다. 이 클래스를 좀더 편리하게 사용할 수
     * 있도록 {@link tau.url}() Utility 메소드를
     * 지원한다.
     * @class
     * URL을 파싱하고 관리하는 Helper클래스
     * @example
     * var url = new tau.URLHelper('http://foo.com');
     * url.protocol(); // 'http:'
     * url.host(); // 'foo.com'
     *
     * @constructs
     * @param {String} context URL 문자열 
     * @param {Object|String} [params] URL에 추가할 파라미터 
     * @see tau.url
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
            this.appendParam(i, value);
          }, this);
        }
      }
    },

    /**
     * URL이 현재 Document를 기준으로 원격 도메인인지 확인하고
     * 그 결과를 true/false로 반환한다.
     * 
     * @returns {Boolean} 만약 URL이 원격도메인이면 true를 반환한다.
     */
    isRemote: function () {
      var ctx = !!this.ctx ? this.ctx : this;
      return tau.resolveURL(ctx).indexOf(_ROOTURL) !== 0; 
    },

    /**
     * URL에 명시된 호스트 이름을 반환한다.
     * @example
     * var url = new tau.URLHelper('http://foo.com');
     * url.host(); // 'foo.com'
     *
     * @returns {String} 호스트 명
     */
    host: function () {
      var parts = _URLREGEXP.exec(!!this.ctx ? this.ctx : this);
      return (!tau.isArray(parts) || !parts.length > 2) ? null : parts[2]; 
    },

    /**
     * URL에 사용된 프로토콜을 반환한다.
     * @example
     * var url = new tau.URLHelper('http://foo.com');
     * url.protocol(); // 'http:'
     *
     * @returns {String} 프로토콜 이름
     */
    protocol: function () {
      var parts = _URLREGEXP.exec(!!this.ctx ? this.ctx : this);
      return (!tau.isArray(parts) || !parts.length > 1) ? null : parts[1]; 
    },

    /**
     * URL에 사용된 Query String을 반환한다.
     * @example
     * var url = new tau.URLHelper('http://foo.com', {aaa: 'bbb', ccc: 'ddd'});
     * url.query(); // "aaa=bbb&ccc=ddd"
     *
     * @returns {String} Query string
     */
    query: function () {
      var ctx = !!this.ctx ? this.ctx : this;
      return ctx.substring(ctx.indexOf('?') + 1);
    },

    /**
     * URL에서 명시된 파라미터 키에 해당하는 값들을 모두 반환한다.
     * @example
     * var url = new tau.URLHelper('http://foo.com', 'aaa=bbb&ccc=ddd&ccc=eee');
     * url.query(); // "aaa=bbb&ccc=ddd&ccc=eee"
     * url.param('ccc'); // "ddd"
     * url.param('ccc', true); // ["ddd", "eee"]
     *
     * @param {String} name 찾고자 하는 파라미터 이름
     * @param {Boolean} all true이면 일치하는 모든 파라미터의 값을
     * 배열로 반환한다.
     * @returns {String|Array} 하나 또는 배열형태의 파라미터 값
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
     * URL에 명시된 파라미터의 키와 값을 맵 형태로 반환한다.
     * @example
     * var url = new tau.URLHelper('http://foo.com', 'aaa=bbb&ccc=ddd&ccc=eee');
     * url.paramMap(); // {"aaa":"bbb","ccc":"ddd"}
     * url.paramMap(true) // {"aaa":["bbb"],"ccc":["ddd","eee"]}
     *
     * @param {Boolean} all true이면 해당키와 매핑되는 모든 값을 반환한다.
     * @returns {Object} 파라미터 맵
     */
    paramMap: function (all) {
      var search, 
          ctx = !!this.ctx ? this.ctx : this,
          pattern = /[\\?&]([^&#=]*)/g;
          result = {};
      // Find parameters and map them to their respective values
      while ((search = pattern.exec(ctx))) {
        if (search && search[1] && !(search[1] in result)) {
          result[search[1]] = this.param(search[1], all);
        }
      }
      return result;
    },

    /**
     * 상대경로의 URL을 절대경로의 URL로 변환한다.
     * <p/>
     * 만약 base가 설정되어 있고 URL이 상대경로이면 리턴되는 결과는 base가
     * prepend된 형태가 된다.
     * <p/>
     * 상대경로는 http, ftp 등과 같은 prefix로 기술되지 않고 ./, ../, /, //와
     * 같이 기술된다.
     * @example
     * var url = new tau.URLHelper('foo.html', 'aaa=bbb&ccc=ddd&ccc=eee');
     * url.resolve('http://aaa.bbb/');
     * // prints "http://aaa.bbb/foo.html?aaa=bbb&ccc=ddd&ccc=eee"
     *
     * @param {String} base prepend할 base URL, 만약 null이면 '/'을 사용한다.
     * @returns {Object} 'this' 객체
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
     * URL의 파라미터를 추가하거나 기존의 것을 덮어쓴다.
     * @example
     * var url = new tau.URLHelper('foo.html', 'aaa=bbb');
     * url.appendParam('ccc', 'ddd');
     * url.query(); // "aaa=bbb&ccc=ddd"
     *
     * @param {String} name 파라미터 이름
     * @param {String} value 파라미터 값
     * @param {Boolean} overwrite true이면 기존의 값을 덮어쓴다.
     * @returns {Object} 'this' 객체 
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
  $class('tau.JobQueue').define({
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
     * @ignore
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
     * @private
     */
    isRunning: function () {
      return !!this._running;
    },

    /**
     * Checks if the queue is paused.
     * @returns {Boolean} True if the queue is paused
     * @private
     */
    isPaused: function () {
      return !!this._paused;
    },

    /**
     * Returns the size of the queue (includes currently running job).
     * @returns {Number} Size of the the queue
     * @private
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
     * @private
     */
    get: function (j) {
      return this._queue[this.indexOf(j)];
    },

    /**
     * Returns the immidiate next job object.
     * @returns {Object} Next job object (null = no jobs in queue)
     * @private
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
     * @private
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
     * @private
     */
    pause: function (unpause) {
      this._paused = !unpause;
      return this;
    },

    /**
     * Resumes the execution of the queue if it was paused previously 
     * @returns {Object} <code>this</code> instance
     * @private
     */
    resume: function () {
      this._paused = false;
      return this.run.apply(this, arguments);
    },

    /**
     * Stops and clears any job remaining in the queue.
     * @returns {Object} <code>this</code> instance
     * @private
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
     * @private
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
     * @private
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
     * @private
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
     * @private
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
     * @private
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
     * @private
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
     * @private
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
   * 등록된 객체를 배열 또는 맵 객체에 편리하게 get/set할 수 있는 기능을
   * 제공한다.
   * <p/>
   * @name tau.MapArray
   * @class
   * 맵 또는 배열객체에 값을 저장하고 가져올 수 있는 기능을 정의한다.
   */
  $class('tau.MapArray').define(/** @lends tau.MapArray.prototype */ {
    /**
     * 배열 형태로 등록된 모든 항목을 반환한다.
     * @returns {Array} 등록된 값에 대한 배열
     * @function
     */
    getArray: tau.getterFactory('getArray', '[]'),

    /**
     * 맵 객체의 모든 키를 배열 형태로 반환한다.
     * @returns {Array} 맵 객체의 키에 대한 배열
     * @function
     */
    getKeys: tau.getterFactory('getKeys', '[]'),

    /**
     * 맵 형태로 등록된 모든 객체를 반환한다.
     * @returns {Object} 맵 객체
     * @function
     */
    getMap: tau.getterFactory('getMap', '{}'),

    /**
     * 등록된 배열객체의 길이를 반환한다.
     * @returns {Number} 배열객체의 길이
     */
    length: function () {
      return this.getArray().length;
    },

    /**
     * 명시된 값의 인덱스를 찾아 반환한다. 만약 isKey가 true이면 맵에 등록된
     * 키의 인덱스를 반환하고 그렇지 않으면 배열 객체에서 명시된 값의
     * 인덱스를 찾아 반환한다.
     * @param {Object} value 인덱스를 확인하고자 하는 객체
     * @param {Boolean} [isKey = false] true이면 맵객체의 키를 나타낸다.
     * @returns {Number} 명시된 값의 인덱스
     */
    indexOf: function (value, isKey) {
      if (!isKey) {
        return this.getArray().indexOf(value);
      } else {
        return this.getKeys().indexOf(value);
      }
    },

    /**
     * 명시된 키에 해당하는 값을 찾아 반환한다. <p/>
     * key가 숫자이면 배열에서 해당 인덱스의 값을 반환하고 그렇지
     * 않으면 맵 객체에서 해당키에 해당하는 값을 찾아 반환한다.
     * @param {String|Number} key 배열객체의 인덱스 또는 맵객체의 키
     * @returns {Object} 해당 키에 해당하는 값
     */
    get: function (key) {
      var array = this.getArray();
      if (-1 < key && key < array.length) {
        return array[key];
      } else {
        return this.getMap()[key];
      }
    },

    /**
     * 명시된 값을 설정한다. 만약 기존에 해당 키에 값이 설정되어 있었다면
     * 그 값을 덮어쓴다.<p/>
     * 만약 unique가 true이면 배열객체에 저장되는 값이
     * 유일하도록 보장하며 기존에 동일한 값이 저장되어 있다면 아무런 동작을
     * 수행하지 않는다.
     * @param {Object} value 설정하고자 하는 값
     * @param {String|Number} key 배열객체의 인덱스 또는 맵객체의 키
     * @param {Boolean} [unique = false] 배열객체에 값의 중복을 배제한다.
     * @returns {Number} 새롭게 설정된 값의 인덱스
     */
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

    /**
     * 기존의 값에 명시된 값을 추가한다. 만약 배열 객체에 값을 추가할 경우
     * key로 지정된 인덱스에 값을 추가하며 이후의 배열을 한 칸씩 뒤로
     * 밀리게 된다.
     * @param {Object} value 추가하고자 하는 객체
     * @param {String|Number} key 배열객체의 인덱스 또는 맵객체의 키
     * @param {Boolean} [unique = false] 배열객체에 값의 중복을 배제한다.
     * @returns {Number} 새로추가된 값의 인덱스
     */
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

    /**
     * 명시된 값을 배열 또는 맵 객체로 부터 삭제한다. isKey가 true이면
     * 맵 객체로 부터 키로 지정된 값을 삭제한다.
     * @param {String|Number} value 배열객체의 인덱스 또는 맵객체의 키
     * @param {Boolean} [isKey = false] true이면 value가 맵객체의 키를 나타낸다.
     * @returns {Boolean} 정상적으로 삭제가 되었으면 true를 반환한다.
     */
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

    /**
     * 등록된 모든 배열과 맵 객체를 삭제한다.
     */
    clear: function () {
      // Next call to each prototype will create a new instance
      delete this.getArray;
      delete this.getKeys;
      delete this.getMap;
    },

    /**
     * 배열 객체일 경우 각 배열을 iteration 할 때마다 명시된 callbackFn을 
     * 호출한다.
     * @param {Function} callbackFn 각 배열을 방문할 때마다
     * 호출되는 callback함수
     * @param {Object} context CallbackFn 내에서 사용할 'this' context
     */
    forEach: function (callbackFn, context) {
      tau.forEach(this.getArray(), callbackFn, context);
    },

    /**
     * 새로운 배열객체를 생성하여 반환한다. 이때 반환되는 배열 객체의
     * 값을 변경하더라도 기존의 배열객체에는 영향을 주지 않는다.
     * @returns {Array} 동일한 값을 가지는 새로운 배열 객체
     */
    toArray: function () {
      return Array.prototype.slice.call(this.getArray());
    },

    /**
     * 새로운 맵 객체를 생성하여 반환한다. 이때 반환되는 맵 객체의
     * 값을 변경하더라도 기존의 맵객체에는 영향을 주지 않는다.
     * @returns {Object} 동일한 값을 가지는 새로운 맵 객체
     */
    toMap: function () {
      return tau.clone(this.getMap());
    }
  });


  /**
   * 맵 또는 배열 객체에 값을 저장하고 추출할 수 있는 기능을 정의한 클래스
   * <p/>
   * getMapItem과 setMapItem 메소드는 name으로 지정된 키를 이용하여 값을
   * 추출하거나 설정할 수 있도록 한다.
   * 추가적으로, getArrayItems 메소드는 내부적으로 가지고 있는 배열객체를
   * 반환한다.
   * <p/>
   * getAllItems 메소드는 ItemRegistry로 관리되는 모든 값을 배열 형태로
   * 반환한다.
   * @name tau.ItemRegistry
   * @see tau.MapArray
   * @class
   * 맵 또는 배열 객체에 값을 저장하고 추출할 수 있는 기능을 정의한 클래스
   */
  $class('tau.ItemRegistry').define(/** @lends tau.ItemRegistry.prototype */ {
    /**
     * 등록된 모든 값을 배열 형태로 반환한다. 이때 반환되는 값은 중복되지
     * 않는다.
     * @returns {Array} 등록된 모든 값을 가지고 있는 배열
     */
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

    /** 
     * 등록된 값중 배열형태르 등록된 객체를 반환한다.
     * @returns {Array} 배열 형태로 등록된 값
     */
    getArrayItems: function () {
      if (!this._registryArray) {
        /** @private Lazily create a registry if one doesn't already exit  */
        this._registryArray = [];
      }
      return this._registryArray;
    },
    
    /**
     * 등록된 값중 Map형태로 등록된 값들 중에서 키(name)에 해당하는 값을 찾아
     * 반환한다. 만약 키에 해당하는 값이 없을 경우 null을 반환한다.
     * @param {String} name 맵 객체에서 찾고자 하는 키
     * @returns {Object} 명시된 키에 해당하는 값
     */
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

    /** 
     * 명시된 키를 이용하여 값을 등록한다.
     * @param {String} name 맵 객체에 저장할 때 사용할 키
     * @param {Object} value 해당 키에 저장하고자 하는 객체
     * @returns {Boolean} 값이 정상적으로 설정되었다면 true를 반환한다.
     */
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

    /**
     * 명시된 키의 값을 삭제한다. 삭제하고자 하는 키가 null일 경우
     * 맴 객체에 설정된 모든 값을 삭제한다.
     * @param {String} arg 삭제하고자 하는 맵 객체의 키
     * @returns {Boolean} 정상적으로 삭제되었다면 true를 반환한다.
     */
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
