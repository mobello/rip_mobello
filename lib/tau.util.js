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
(function (global) {

  /** @deprecated module */
  if (typeof tau == 'undefined') {
    tau = {};
  }
  if (typeof tau.util == 'undefined') {

    /**
     * @namespace
     * 편리하게 사용할 수 있는 Utility 메소드들을 정의한다.
     */
    tau.util = {

      /**
       * default 값을 목적 객체(dest)에 적용한다.
       * @example
       * tau.util.applyDefault({foo: 'bar'}, {aaa: 'bbb', ccc: 'ddd'});
       * // returns {"foo":"bar","aaa":"bbb","ccc":"ddd"}
       *
       * @param {Object} dest 목적 객체
       * @param {Object} defaultObj default객체
       * @returns {Object} Default값이 적용된 객체
       */
      applyDefault: function(dest, defaultObj, deep) {
        var c, p;
        if (dest == null && !deep) {
          dest = defaultObj;
          return dest;
        }
        if ((typeof defaultObj) == "object") {
          c = defaultObj.constructor;
          switch (c) {
          case Object:
            dest = dest||{};
            break;
          case Array:
            dest = dest||[];
            break;
          default:
            dest = defaultObj;
            return dest;
          }
          for (p in defaultObj) {
            if (dest[p] === undefined) {
              if (deep) {
                dest[p] = tau.util.applyDefault(undefined, defaultObj[p], deep);
              } else {
                dest[p] = defaultObj[p];
              }
            }
          }
        } else {
          dest = defaultObj;
        }
        return dest;
      },

      /**
       * 명시된 HTML 앨리먼트에 스타일을 설정하거나, value가
       * 명시되지 않으면 해당 스타일 이름에 해당하는 값을
       * 반환한다.
       * @param {HTMLElement} elem HTML 앨리먼트
       * @param {String} name 스타일 이름
       * @param {String} value 스타일 값
       * @returns {String} value가 명시되지 않았을 경우
       * style이름에 해당하는 값
       */
      style: function(elem, name, value) {
        if (!tau.isElement(elem) || !name) return undefined;

        if ((name === "width" || name === "height") && parseFloat(value) < 0) {
          value = undefined;
        }

        var style = elem.style, 
            set = value !== undefined;

        name = tau.camelize(name);
        
        if (set) style[name] = value;

        return style[name];
      },

      /**
       * 명시된 앨리먼트의 computed style 값을 반환한다.
       * @param {HTMLElement} elem HTML 앨리먼트
       * @param {String} name 스타일 이름
       * @param {Boolean} [force = false] false일 경우 현재
       * style에 명시된 name있을 경우 그 값을 반환한다.
       * @returns {String|Number} computed style 값
       */
      getComputedStyle: function(elem, name, force) {
        var style = elem.style, val, currentStyle;

        if (!force && style && style[name]) {
          val = style[name];
        } else if (name === "width" || name === "height") {
          val = (name === "width") ? elem.clientWidth : elem.clientHeight;
          if (val == 0) {
            var prevStyle = {},
              props = {
                position: "absolute",
                visibility: "hidden",
                display: "block"
              };

            for ( var key in props) {
              prevStyle[key] = style[key];
              style[key] = props[key];
            }
            val = (name === "width") ? elem.clientWidth : elem.clientHeight;

            for ( var key in props) {
              style[key] = prevStyle[key];
            }
          }
          val = Math.max(0, Math.round(val));

        } else if (document.defaultView && document.defaultView.getComputedStyle) {
          var defaultView = elem.ownerDocument.defaultView;
  
          if (!defaultView) return null; 
  
          var computedStyle = defaultView.getComputedStyle(elem, null);

          name = tau.underscore(name).replace(/_/g, '-');

          if (computedStyle) val = computedStyle.getPropertyValue(name); 

          if (name === "opacity" && val === "") val = "1"; 

        } else if (currentStyle = elem.currentStyle) {
          val = currentStyle[name] || currentStyle[tau.camelize(name)];
  
          if (/^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i.test(val)) {
            style = elem.style;
            var left = style.left,
              runtimeStyle = elem.runtimeStyle,
              rsLeft = runtimeStyle.left;
            
            runtimeStyle.left = currentStyle.left;
            style.left = (name === "font-size") ? "1em" : (val || 0);
            val = style.pixelLeft + "px";

            style.left = left;
            runtimeStyle.left = rsLeft;
          }
        }
        return val;
      },

      /**
       * 명시된 쿠기값을 설정한다.
       * @param {String} name 쿠키 이름
       * @param {String} value 쿠키 값
       * @param {Number} [days] 쿠키가 유지될 기간(날자로 입력). 만약 명시되지
       * 않으면 세션이 종료됨과 동시에 쿠키값이 사라진다.
       */
      setCookie: function (name, value, days) {
        var date, expires = '';
        if (days) {
          date = new Date();
          date.setTime(date.getTime() + (days * 24 * 3600 * 1000));
          expires = "; expires=" + date.toGMTString();
        }
        document.cookie = name.concat('=', encodeURI(value), expires, '; path=/');
      },
      
      /**
       * 명시된 이름에 해당하는 쿠키값을 반환한다.
       * @param {String} name 쿠키 이름
       */
      getCookie: function (name) {
        var cookie,
            delimiter = name.concat('='),
            cookies = document.cookie.split(';');
        for (var i = cookies.length - 1; i >= 0; i--) {
          cookie = cookies[i].replace(/^\s+/, ''); // LTrim
          if (cookie.indexOf(delimiter) == 0) {
            return decodeURI(cookie.substring(delimiter.length));
          }
        }
        return null;
      },
      
      /**
       * 명시된 이름에 해당하는 쿠키값을 삭제한다.
       * @param {String} name 쿠키 이름
       */
      removeCookie: function (name) {
        setCookie(name, -1);
      }
    };
  }

  /**
   * @name tau.util.dom
   * @namespace 
   * DOM 조작과 관련된 Utility메소드들을 정의한다.
   */
  tau.namespace('tau.util.dom', /** @lends tau.util.dom */{

    /**
     * 명시된 HTML앨리먼트에 CSS className이 설정되었는지 확인하고
     * 그 결과를 반환한다.
     * @param {HTMLElement} element HTML DOM 앨리먼트
     * @param {String} className CSS클래스 이름
     * @param {String} [prefix] prefix 문자열
     * @returns {Boolean} 명시된 className이 설정되어 있다면
     * true를 반환한다.
     */
    hasClass: function(element, className, prefix) {
      if (element) {
        var classList = element.classList;
        className = (prefix || '') + className;
        if (classList){
          return classList.contains(className);
        } else {
          var elementClassName = element.className;
          return (elementClassName.length > 0 && (elementClassName == className || new RegExp(
              "(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
        }
      }
      return false;
    },

    /**
     * 명시된 HTML앨리먼트에 className을 설정한다.
     * @param {HTMLElement} element HTML DOM 앨리먼트
     * @param {String} className CSS 클래스 이름
     * @param {String} [prefix] prefix 문자열
     * @returns {Boolean} 성공적으로 CSS class가 설정되었다면
     * true를 반환한다.
     */
    addClass: function(element, className, prefix) {
      // Tag the DOM node as an EventDelegator
      if (!element || !className) {
        return false;
      }
      className = (prefix || '') + className;
      
      var classList = element.classList;
      if (classList){
        classList.add(className);
        return true;
      } else {
        if (!tau.util.dom.hasClass(element, className)) {
          element.className += (element.className ? ' ' : '') + className;
          return true;
        }
      }
      return false;
    },

    /**
     * 명시된 HTML DOM에서 className을 제거한다.
     * @param {HTMLElement} element HTML DOM 앨리먼트
     * @param {String} className css 클래스 이름
     * @param {String} prefix prefix 문자열
     * @returns {Boolean} 설공적으로 CSS class가 삭제되었다면
     * true를 반환한다.
     */
    removeClass: function(element, className, prefix) {
      if (element && className) {
        className = (prefix || '') + className;
        var classList = element.classList;
        if (classList){
          classList.remove(className);
        } else {
          element.className = element.className.replace(
              new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ')
              .replace(/^\s+/, '').replace(/\s+$/, '');
        }
        return true;
      }
      return false;
    },

    /**
     * 명시된 HTML앨리먼트에서 oldClassName 스타일 클래스를 newClassName 스타일
     * 클래스로 교체한다.<p/>
     * 만약 oldClassName가 설정되어 있지 않다면 newClassName스타일 클래스가
     * 추가된다.
     * @param {HTMLElement} dom HTML DOM 앨리먼트
     * @param {String} oldClassName 교체될 스타일 클래스 이름
     * @param {String} newClassName 교체할 스타일 클래스 이름
     * @retruns {Boolean} 성공적으로 스타일 클래스가
     * 교체되었다면 true를 반환한다.
     */
    replaceClass: function(element, oldC, newC, prefix) {
      if (element){
        if (oldC) {
          oldC = (prefix || '') + oldC;
        }
        if (newC){
          newC = (prefix || '') + newC;
        }
        
        var classList = element.classList;
        if (classList){
          if (oldC){
            classList.remove(oldC);
          }
          classList.add(newC);
        } else {
          if (tau.util.dom.hasClass(element, oldC)) {
            element.className = element.className.replace(
                new RegExp("(^|\\s+)" + oldC + "(\\s+|$)"), ' ' +newC).replace(
                    /^\s+/, '').replace(/\s+$/, '');
          } else {
            tau.util.dom.addClass(element, newC);
          }
        }
        return true;
      }
      return false;
    },
    
    /**
     * 명시된 id를 이용하여 해당 HTML 앨리먼트를 찾아
     * 반환한다.
     * @param {String|Object} id 컴포넌트 id 또는 HTMLElement id
     * 또는 element키로 DOM element를 가지는 객체
     * @return {HTMLElement} DOM element specified by the id
     */
    elementOf: function (id) {
      if (!id)
        return null;
      return document.getElementById(id) || id.element;
    },
    
    /**
     * HTMLElement의 메소드인 appencChild메소드의
     * Wrapper메소드
     * @param {tau.ui.Component || HTMLElement} parent 부모
     * HTML 앨리먼트 또는 Mobello 컴포넌트
     * @param {tau.ui.Component || HTMLElement} child 추가할 HTML앨리먼트
     * 또는 Mobello 컴포넌트
     * @return {HTMLElement} 새롭게 추가된 DOM 앨리먼트
     */
    appendChild: function(parent, child) {

      var parentElem = null;
      var childElem = null;

      if (tau.isElement(parent) || tau.isFragment(parent)) {
        parentElem = parent;
      } else if (parent instanceof tau.ui.Component) {
        parentElem = tau.util.dom.elementOf(parent.getId());
      }
      if (!parentElem)
        return;

      if (tau.isElement(child) || tau.isFragment(child)) {
        childElem = child;
      } else if (child instanceof tau.ui.Component) {
        childElem = tau.util.dom.elementOf(child.getId());
      }
      if (!childElem)
        return;
      parentElem.appendChild(childElem);
    },

    /** 
     * 명시된 HTML 앨리먼트를 부모 노드로 부터 삭제한다.
     * 삭제할 앨리먼트를 comma(,)로 분리하여 복수개를 지정할
     * 수 있다.
     * @param {HTMLElement|Array} elem 삭제할 DOM앨리먼트, 1개 이상의 
     * 파라미터를 기술할 수 있다.
     * @returns {Object|Array} 삭제된 HTML DOM앨리먼트
     */
    removeElements: function (elem) {
      var i, e, r, elems, removed; 
      if (arguments.length === 1 && elem.parentNode) {
        return elem.parentNode.removeChild(elem); // Remove a single DOM element
      } else if (arguments.length > 1) {
        elems = arguments;                        // Multiple parameters
      } else if (!tau.isString(elem) && elem.length) {
        elems = elem;                             // Single array parameter
      }

      // Handles Paramter/Element list removal
      removed = [];
      if (elems) {
        for (i = elems.length - 1; i >= 0; i--) {
          e = elems[i];
          r = null;
          if (e.length) {
            r = tau.util.dom.removeElements(e); // Recursively remove a list
          } else if (e.parentNode) {
            r = e.parentNode.removeChild(e);    // Remove single DOM directly
          }

          // Update removed DOM list
          if (tau.isArray(r)) {
            removed.unshift.apply(removed, r);
          } else if (r) {
            removed.unshift(r);
          }
        }
      }
      return removed;
    },

    /**
     * 명시된 HTML 앨리먼트(elem)를 parent 노드의 첫번째
     * child로 추가한다.
     * @param {HTMLElement} parent 부모 HTML 앨리먼트 노드
     * @param {HTMLElement} elem 추가할 HTML 앨리먼트 노드
     * @param {Boolean} handleDisplay true이면 push되는 노드는 출력되게하고
     * 이전에 있던 노드는 보이지 않도록 처리한다.
     * @returns {Boolean} 명시된 앵ㄹ리먼트(elm)가 성공적으로 추가되었으면
     * true를 반환한다.
     */
    pushElement: function (parent, elem, handleDisplay) {
      if (handleDisplay && elem) { 
        elem.style.display = '';
      }
      if (parent.children && parent.children[0]) {
        if (handleDisplay) {
          parent.children[0].style.display = 'none';
        }
        return parent.insertBefore(elem, parent.children[0]) !== null;
      } else {
        return parent.appendChild(elem) !== null;
      }
    },

    /**
     * parent 노드의 Child노드들 중 첫번째 child노드를
     * 제거하고 제거된 노드를 반환한다.
     * @param {HTMLElement} parent 부모 HTML 앨리먼트 노드
     * @param {HTMLElement} elem 삭제할 DOM 앨리먼트
     * @param {Booelean} handleDisplay true이고 elem가 성공적으로 
     * 제거되었으면 parent노드의 첫번째 child를 보이도록 처리한다.
     */
    popElement: function (parent, elem, handleDisplay) {
      if (!parent) {
        parent = elem.parent;
      }
      if (parent && elem && parent.removeChild(elem)) {
        if (handleDisplay && parent.children && parent.children[0]) {
          parent.children[0].style.display = '';
        }
        return elem;
      }
      return null;
    },

    /**
     * 명시된 CSS selector를 이용하여 CSS 스타일 값을
     * 반환한다.
     * Returns the style value from CSSRules.
     * @param {String} selector CSS Selector
     * @param {String} prop CSS 프로퍼티
     * @return {String} style 값
     */
    getStyleFromCssRule : function(selector, prop) {
      prop = tau.camelize(prop);
      var oStyleSheet = document.styleSheets;
      if (oStyleSheet){
        for(var i=0; i < oStyleSheet.length; i++){
          var cssRules = oStyleSheet[i].cssRules || oStyleSheet[i].rules;
          if (cssRules){
            for(var j=0; j < cssRules.length; j++){
              if (cssRules[j].selectorText === selector){
                return cssRules[j].style[prop];
              }
            }
          }
        }
      }
      return null;
    },

    /**
     * 스타일시트에 룰(rule)을 추가한다.
     * @example
     * tau.util.dom.insertStyleRule("#componentId {height : 200px !important; width : 200px !important;}");
     * @param {String} rule select와 style declaration을 기술한다.
     * @return {Number} index 추가된 인덱스. 에러가 발생하면 -1을 리턴한다.
     */
    insertStyleRule: function (rule) {
      var styleSheets = document.styleSheets,
          styleSheet = styleSheets[styleSheets.length - 1],
          index = styleSheet.cssRules ? styleSheet.cssRules.length - 1 : 0;
      if (index < 0){
        index = 0;
      }
      if (styleSheet){
        styleSheet.insertRule(rule, index);
        return index;
      }
      return -1;
    },

    /**
     * 스타일시트에서 인덱스에 해당하는 룰을 삭제한다.
     * @param {String} index 스타일룰을 삭제할 인덱스
     * @return {Boolean} 성공여부
     */
    deleteStyleRule: function (index) {
      var styleSheets = document.styleSheets,
          styleSheet = styleSheets[styleSheets.length - 1];
      if (styleSheet){
        styleSheet.deleteRule(index);
        return true;
      }
      return false;
    },
    
    /**
     * 편재 페이지를 기반으로 명시된 HTML앨리먼트의 x, y좌표를 반환한다.
     * (display:none 이거나 HTML 앨리먼트 트리에 포함되지 않은
     * 앨리먼트는 정확한 값을 반환하지 못한다.)
     * @param {HTMLElement} elem HTML DOM 앨리먼트
     * @return {Array} 명시된 앨리먼트의 XY position [x, y]
     */
     getXY: function(elem) {
         var body = document.getElementById('tau-root'),
             dom = parent = elem,
             x = y = 0;
  
         if (!dom || dom === body) {
             return [0, 0];
         }
  
         while (parent) {
             x += parent.offsetLeft;
             y += parent.offsetTop;
  
             if(parent != dom) {
                 // For webkit, we need to add parent's clientLeft/Top as well.
                 x += parent.clientLeft || 0;
                 y += parent.clientTop || 0;
             }
  
             parent = parent.offsetParent;
         }
  
         // Safari absolute incorrectly account for body offsetTop.
         if (tau.rt.isWebkit && tau.util.style(elem, 'position') === 'absolute') {
             y -= body.offsetTop;
         }
  
         parent = dom.parentElement;
         while (parent && parent != body) {
             x -= parent.scrollLeft;
             y -= parent.scrollTop;
             parent = parent.parentElement;
         }
         return [x, y];
     },
     
     /**
      * Element Node(nodeType == 1)를 반환한다. 명시된 노드가
      * Element가 아닐경우 parent 중에서 Element Node를 찾아
      * 반환한다.
      *
      * @example
      * Node.ELEMENT_NODE == 1
      * Node.ATTRIBUTE_NODE == 2
      * Node.TEXT_NODE == 3
      * Node.CDATA_SECTION_NODE == 4
      * Node.ENTITY_REFERENCE_NODE == 5
      * Node.ENTITY_NODE == 6
      * Node.PROCESSING_INSTRUCTION_NODE == 7
      * Node.COMMENT_NODE == 8
      * Node.DOCUMENT_NODE == 9
      * Node.DOCUMENT_TYPE_NODE == 10
      * Node.DOCUMENT_FRAGMENT_NODE == 11
      * Node.NOTATION_NODE == 12
      * 
      * @param {HTMLNode} DOM 노드
      * @return {HTMLElement} deep-most first DOM element 
      */
     getElementNode: function (node) {
       return node.nodeType === 1 ? node : node.parentElement;
     }
  });
}) (window);
