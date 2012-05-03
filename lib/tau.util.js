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
     * @namespace utility
     */
    tau.util = {

      /**
       * apply default value to destination object
       * @param {Object} dest destination object
       * @param {Object} defaultObj default object
       * @returns {Object} applied object
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
       * Get and set the style property on a HTMLElement
       * @param {HTMLElement} elem
       * @param {String} name
       * @param {String} value
       * @returns {String}
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
       * Get computed style on a HTMLElement
       * @param {HTMLElement} elem
       * @param {String} name
       * @param {Boolean} force
       * @returns {String}
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
       * 
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
       * 
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
       * 
       */
      removeCookie: function (name) {
        setCookie(name, -1);
      }
    };
  }

  /**
   * Utility DOM Module
   * @name tau.util.dom
   * @namespace 
   */
  tau.namespace('tau.util.dom', 
  {

    /**
     * Determines whether this dom element has the given className.
     * @param {Object} dom element
     * @param {String} className
     * @returns {Boolean}
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
     * Adds a class name to a given DOM element.
     * @param {Object} dom element
     * @param {String} className
     * @param {String} [prefix]
     * @returns {Boolean}
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
     * Removes a class name from a given element.
     * @param {Object} dom element
     * @param {String} className
     * @returns {Boolean}
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
     * Replace a class with another class for a given element. If no
     * oldClassName is present, the newClassName is simply added.
     * @param {Object} dom element
     * @param {String} oldClassName the class name to be replaced
     * @param {String} newClassName the class name that will be replacing
     *        the old class name
     * @retruns {Boolean}
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
     * Returns HTMLElement represented by the specified component id 
     * @method elementOf
     * @param {String|Object} id component id or HTMLElement id or DOM element를 가지는 객체
     * @return {HTMLElement} DOM element specified by the id
     */
    elementOf: function (id) {
      if (!id)
        return null;
      return document.getElementById(id) || id.element;
    },
    
    /**
     * Wrapper for HTMLElement method.
     * @method appendChild
     * @param {tau.ui.Component || HTMLElement} parent
     * @param {tau.ui.Component || HTMLElement} child The element to
     *        append.
     * @return {HTMLElement} The appended DOM element.
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
     * Removes all DOM elements from their parent (bottom-up).
     * @param {Object|Array} elem DOM element, can pass more than one parameters
     * @returns {Object|Array} Array or removed elements, or a single element 
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
     * Pushes a DOM element to the top of a parent node.
     * @param {Object} parent DOM element to push the node
     * @param {Object} elem DOM element to be pushed
     * @param {Object} handleDisplay True will show pushed DOM and hide old
     * @returns {Boolean} True if the element was pushed properly
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
     * Pops a DOM element from the top of a parent node.
     * @param {Object} parent DOM element to pop the element from
     * @param {Object} elem DOM element to pop
     * @param {Object} handleDisplay True will show pushed DOM and hide old
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
     * Returns the style value from CSSRules.
     * @method getStyleFromCssRule
     * @param {String} selector
     * @param {String} prop
     * @return {String} style value
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
     * 스타일시트에 룰을 추가한다.
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
     * Gets the current position of the element based on page coordinates.  
     * Element must be part of the DOM tree to have page coordinates 
     * (display:none or elements not appended return false).
     * @param {Object} DOM element
     * @return {Array} The XY position of the element
     */
     getXY : function(elem) {
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
      * Element Node를 반환한다.
      * @param {Node} DOM Node
      * @return {HTMLElement} deep-most first DOM element 
      */
     getElementNode: function (node) {
       return node.nodeType === 1 ? node : node.parentElement;
     }
  });
}) (window);
