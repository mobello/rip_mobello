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
/**
 * renderer의 html template을 innerHTML형태로 넣어 DOM element를 얻기 위해 
 * 사용하는 임시 parent DOM element
 */
tau.ui.DummyDom = document.createElement('div'); 

/**
 * 기본 랜더러
 * @class
 * @private
 */
tau.ui.BaseRenderer = {
  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau',
  
  /**
   * style Class 
   * <p />
   * template에서 사용하는 style Class를 정의한다.
   */
  $styleClass: {
  },  
  
  /** 
   * html template
   * style class는 <code>${key}</code>로 묶어서 표시한다.
   * {@link $base}, {@link $styleClass}에 설정되어 있는 style class가 <code>${key}</code>를 대체한다.
   */
  _template: ['<div class=${base}></div>'],
  
  /**
   * 초기화 함수
   * <p/>
   * DOM element를 성하는 오브젝트를 반환한다.
   * @param {Object} opts
   * @returns {Object} $renderData base style class와 $dom 구조를 가지는 객체 base style class와 $dom 구조를 가지는 객체
   */
  initialize: function (opts) {
    this._clonedDOM = {};
    
    var $renderData, 
        base;

    // option으로 넘어온 styleClass를 설정함.
    if (tau.isObject(opts)){
      if (tau.isString(opts.baseStyleClass)) {
        base = opts.baseStyleClass;
      }
    }
    if (!base) {
      base = this.$base;
    }
    
    $renderData = {$dom: {}, $base: base, $style: {}};
    
    this._initializeDOM($renderData.$dom, $renderData.$base, 
        this._createElement($renderData.$dom, $renderData.$base, tau.ui.ROOT_KEY, this._template));
    return $renderData;
  },
  
  /**
   * $dom 구조를 설정한다.
   * <p/> 
   * 최상위 {@link tau.ui.ROOT_KEY}를 제외한 나머지에 대해서 설정하면 된다.
   * @param {Object} $dom key에 해당하는 DOM Element를 가지는 객체
   * @param {String} $base base style class
   * @param {HTMLElement} root root가 되는 DOM Element
   */
  _initializeDOM: function ($dom, $base, root) {},
  
  /**
   * html template에 따라 DOM을 생성하고 <code>options</code>에 지정된 값이 없으면
   * 기본적으로 root DOM Element를 parent Element로 appendChild하고 
   * $dom에 key값으로 생성된 DOM을 저장한다.
   * $dom에 key값이 이미 DOM Element가 있으면 그 값을 반환한다.
   * @param {Object} $dom key에 해당하는 DOM Element를 가지는 객체
   * @param {String} $base base style class
   * @param {String} key $dom에 저장할 키값
   * @param {Array} template HTML 템플릿 
   * @param {Object} [options]
   * @param {String} [options.parentKey] appendChild할 부모 DOM Element가 되는 key값
   * @param {HTMLElement} [options.parentElement] appendChild할 부모 DOM Element
   * @param {String} [options.refChildKey] insertBefore할 이전 DOM Element가 되는 key값
   * @param {HTMLElement} [options.refChild] insertBefore할 이전 DOM Element
   */
  _createElement: function ($dom, $base, key, template, options) {
    var dom = $dom[key],
        html, parentKey,
        cloned = this._clonedDOM[key] ? true : false,
        parentElement, refChild;
    
    if (dom) {  // 이미 DOM Eement가 존재하는 경우 skip한다.
      return dom; 
    }
    
    if ($base === this.$base) { // base style class인 경우 이미 생성되어 있는 DOM Element를 cloned해서 사용한다.
      cloned = true;
    }
    if (!cloned || cloned && !this._clonedDOM[key]) {
      html = template.join("");
      html = html.split('${base}').join($base);
      for(var prop in this.$styleClass) {
        html = html.split('${' + prop + '}').join(this.$styleClass[prop]);
      }
      if (options) {
        for(var prop in options.styleClass) {
          html = html.split('${' + prop + '}').join(options.styleClass[prop]);
        }
      }
      tau.ui.DummyDom.innerHTML = html;
      dom = tau.ui.DummyDom.firstChild.cloneNode(true);
      
      if (cloned) {
        this._clonedDOM[key] = dom;
        dom = dom.cloneNode(true);
      }
      tau.ui.DummyDom.innerHTML = '';
    } else if (cloned) {
      dom = this._clonedDOM[key].cloneNode(true);
    }

    if (tau.isString(key)) {  // key가 존재하는 경우에만 $dom에 설정한다.
      $dom[key] = dom; 
    }
    
    if (key !== tau.ui.ROOT_KEY) {
      if (!options) {
        parentElement = this.getParentElement({$dom: $dom, $base: $base}, key);
        if (parentElement === dom) {
          parentElement = $dom[tau.ui.ROOT_KEY];
        }
      } else {
        parentKey = options.parentKey;
        parentElement = options.parentElement;
        refChild = options.refChild;
        refChildKey = options.refChildKey;
        
        if (refChildKey){
          refChild = $dom[refChildKey];
        }
        if (refChild) {
          parentElement = refChild.parentNode || parentElement || $dom[tau.ui.ROOT_KEY];
        } else if (refChildKey) {
          refChild = $dom[refChildKey];
        }
      }
      
      if (tau.isString(parentKey)) {
        $dom[parentKey].appendChild(dom);
      } else if (refChild && parentElement) {
        parentElement.insertBefore(dom, refChild);
      } else if (parentElement) {
        parentElement.appendChild(dom);
      }
    }
    return dom;
  },
  
  /**
   * DOM element가 $dom의 property인지 체크한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체 
   * @param {HTMLElement} elem 체크할 DOM element
   * @param {String} key $dom 키값 
   * @returns {Boolean}
   */
  hasElement: function ($renderData, elem, key) {
    var $dom = $renderData.$dom;
    
    elem = tau.util.dom.getElementNode(elem);
    if (tau.isString(key)) {
      return $dom[key] === elem;
    } else {
      // Search all component elements
      for (var p in $dom) {
        if ($dom.hasOwnProperty(p) && $dom[p] === elem) {
          return true;
        }
      }
      return false;
    }
  },
  
  /**
   * DOM element가 $dom의 property 명을 반환한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {HTMLElement} elem 반환할 DOM element
   * @returns {String}
   */
  getElemPropertyName: function ($renderData, elem) {
    var $dom = $renderData.$dom;
    elem = tau.util.dom.getElementNode(elem);    
    for (var p in $dom) {
      if ($dom.hasOwnProperty(p) && $dom[p] === elem) {
        return p;
      }
    }
    return null;
  },

  /**
   * $dom의 key가 추가될 parent DOM element를 반환한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} key $dom 키값
   * @param {Boolean} [createElement=true]
   * @returns {HTMLElement}
   * @see tau.ui.BaseRenderer.getParentElement
   */
  getParentElement: function ($renderData, key, createElement) {
    var $dom = $renderData.$dom;
    if (key === tau.ui.CONTENT_KEY){
      return $dom[tau.ui.CONTENT_KEY] || $dom[tau.ui.ROOT_KEY];
    }
    return $dom[tau.ui.ROOT_KEY];
  },
  
  /**
   * base style Class를 설정한다.
   * <p /> 
   * base style class를 변경하면 하위에 base style class를 prefix인 style class를 변경한다. 
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} base 기본 style class
   */
  setBaseStyleClass: function ($renderData, base) {
    var newStyleClass,
        styleClass,
        nodes,
        dom = $renderData.$dom[tau.ui.ROOT_KEY];
    
    tau.util.dom.replaceClass(dom, $renderData.$base, base);
    for(var prop in this.$styleClass) {
      styleClass = this.$styleClass[prop];
      newStyleClass = $renderData.$base + styleClass;
      nodes = dom.getElementsByClassName(newStyleClass);
      
      for(var i = 0, len = nodes.length; i < len; i++) {
        tau.util.dom.replaceClass(nodes[i], newStyleClass, base + styleClass);
      }
    }
    $renderData.$base = base;
  },  
  
  /**
   * 스타일 속성을 수정한다.
   * <p />
   * 반환값이 <code>false</code>인 경우에는 root DOM element에 스타일을 적용하지 않는다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} attr 스타일 속성
   * @param {String} value 스타일 값
   * @param {String} [rootId] root DOM Element ID. style rule을 추가할 때 필요한 값.  
   * @returns {Boolean} <code>true</code>이면 root dom에 반영한다.
   * @see tau.ui.BaseRenderer.updateStyle
   */
  updateStyle: function ($renderData, attr, value, rootId) {
    var $dom = $renderData.$dom,
        dom = $dom[tau.ui.ROOT_KEY];

    switch(attr){
    case 'background':
    case 'backgroundImage':
    case 'background-image':
    case 'border-image':
    case 'borderImage':
      var appCtx = tau.getCurrentContext();
      var urls = value.split(',');
      var index, url, returnVal = true;
      for(var i=0, len = urls.length; i < len; i++) {
        url = urls[i].trim();
        
        if ((index = url.indexOf('url(')) != -1) {
          url = url.substring(index + 4, url.indexOf(')'));
          if (url) {
            url = url.replace(/\"/g,'').replace(/\'/g,'');
            value = value.replace(url, appCtx.getRealPath(url));
            returnVal = false;
          }
        }
      }
      if (!returnVal) tau.util.style(dom, attr, value); 
      return returnVal;
    case 'left':
    case 'right':
    case 'top':
    case 'bottom':
      var position = dom.style.position;
      if (!position || position === 'static'){
        dom.style.position = 'absolute';
        if (!$renderData.$style.display && !dom.style.display) {
          $renderData.$style.display = '_tau-disp-block';
          tau.util.dom.addClass(dom, '_tau-disp-block');
        }
      } 
      break;
    case 'position':
      if (value === 'relative' && $renderData.$style.display === '_tau-disp-block'){
        tau.util.dom.removeClass(dom, '_tau-disp-block');
      }
      break;
    case 'display':
      if (!value || value === 'none') break;
      else if (value.indexOf('inline-box') > -1) value = 'inline-flexbox';
      else if (value.indexOf('box') > -1) value = 'flexbox';

      var disp = $renderData.$style.display;
      $renderData.$style.display = 'tau-disp-' + value;
      dom.style.display = null;
      tau.util.dom.replaceClass(dom, disp, value, 'tau-disp-');
      return false;
    }
    return true;
  },
  
  /**
   * 스타일시트에 룰을 추가한다.
   * @example
   * renderer.addStyleRule(this.getId(true), "", "height: 200px !important; width: 200px !important;");
   * renderer.addStyleRule(this.getId(true), " > item", "color: red !important");
   * @param {String} rootId root DOM ID
   * @param {String} selector 셀렉터
   * @param {String} cssText 스타일 정의를 기술해야한다.
   */
  addStyleRule: function (rootId, selector, cssText, replace) {
    if (!this._styleSheet){
      var style = document.createElement('style');
      document.getElementsByTagName('head')[0].appendChild(style);
      this._styleSheet = document.styleSheets[document.styleSheets.length - 1];
    }
    
    var index = -1,
        cssRules = this._styleSheet.cssRules || this._styleSheet.rules;
    
    selector = '#'.concat(rootId, ' ', selector);
    
    if (replace) {
      for(var i=cssRules.length; i--; ){
        if (cssRules[i].selectorText === selector){
          index = i;
          break;
        }
      }
    }
    
    if (index == -1) {
      index = cssRules && cssRules.length > 0 ? cssRules.length - 1 : 0;
    } else {
      cssRules[index].style.cssText = cssText;
      return;
    }
    this._styleSheet.insertRule(selector + "{" + cssText + "}", index);
  },  
  
  /**
   * 스타일시트에 룰을 삭제한다.
   * @param {String} rootId root DOM ID
   * @param {String} selector 셀렉터
   * @param {Boolean} [bReplace] true이면 이전에 추가되어 있는 셀렉터에 해당하는 룰을 대체한다.
   */
  deleteStyleRule: function (rootId, selector) {
    if (this._styleSheet){
      selector = '#' + rootId + selector;

      var cssRules = this._styleSheet.cssRules || this._styleSheet.rules;
    
      for(var i=cssRules.length; i--; ){
        if (cssRules[i].selectorText === selector){
          index = i;
          break;
        }
      }
    
      if (index != -1) {
        this._styleSheet.deleteRule(index);
      }
    }
  },  
  
  /**
   * 인스턴스 DOM 스타일 클래스를 반환한다. 
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체 
   * @param {String} prop 스타일 속성
   * @returns {String} 스타일 클래스
   */
  getStyle: function ($renderData, prop) {
    var $dom = $renderData.$dom,
        dom = $dom[tau.ui.ROOT_KEY], value = null;
    
    if (dom.id && tau.util.dom.elementOf(dom.id)) {
      value = tau.util.getComputedStyle(dom, prop, false);
    } else {
      value = tau.util.style(dom, prop);
    }
    return value;
  },
  
  /**
   * TODO: animation 고려해야함.
   * 개별 Element에 대해 release한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} key $dom에서 release할 키값 
   */
  releaseElement: function ($renderData, key) {
    this._releaseElement($renderData, key);
  },
  
  /**
   * TODO: animation 고려해야함.
   * 개별 Element에 대해 release한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} key $dom에서 release할 키값
   */
  _releaseElement: function ($renderData, key) {
    var $dom = $renderData.$dom,
        dom = $dom[key],
        parentNode;
    
    if (dom) {
      if (parentNode = dom.parentNode) {
        parentNode.removeChild(dom);
      }
      delete dom;
    }
  },
  
  /**
   * 리소스를 해제한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   */
  release: function ($renderData) {
    var $dom = $renderData.$dom;
    for (var p in $dom) {
      if ($dom.hasOwnProperty(p)) {
        tau.util.dom.removeElements($dom[p]);
        delete $dom[p];
      }
    }
    delete $renderData.$dom;
  }
};

/**
 * Renders Component
 * @class
 * @private
 */
tau.ui.Component.prototype.renderer = tau.mixin({
  renderDone: function ($renderData, refresh) {
    //dummy method, descendant object can implement this method to customize
  }
}, tau.ui.BaseRenderer);

/**
 * Renders Control
 * @class
 * @private
 */
tau.ui.Control.renderer = {
  /**
   * state상태를 업데이트 한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체 
   * @param {String} value 상태값 
   *  <ul>
   *    <li>{@link tau.ui.Control.SELECTED}</li>
   *    <li>{@link tau.ui.Control.HIGHLIGHTED}</li>
   *    <li>{@link tau.ui.Control.DISABLED}</li>
   *  </ul> 
   */
  updateControl: function ($renderData, value) {
    var $dom = $renderData.$dom,
        $base = $renderData.$base,
        root = $dom[tau.ui.ROOT_KEY];
    switch (value) {
    case tau.ui.Control.SELECTED:
      tau.util.dom.addClass(root, '-selected', $base);
      tau.util.dom.removeClass(root, '-highlighted', $base);
      tau.util.dom.removeClass(root, '-disabled', $base);
      break;
    case tau.ui.Control.HIGHLIGHTED:
      tau.util.dom.removeClass(root, '-selected', $base);
      tau.util.dom.addClass(root, '-highlighted', $base);
      tau.util.dom.removeClass(root, '-disabled', $base);
      break;
    case tau.ui.Control.DISABLED:
      tau.util.dom.removeClass(root, '-selected', $base);
      tau.util.dom.removeClass(root, '-highlighted', $base);
      tau.util.dom.addClass(root, '-disabled', $base);
      break;
    default:
      tau.util.dom.removeClass(root, '-disabled', $base);
      tau.util.dom.removeClass(root, '-selected', $base);
      tau.util.dom.removeClass(root, '-highlighted', $base);
    }
  }
};


/**
 * Renders Button
 * @class
 * @private
 */
tau.ui.Button.prototype.renderer = tau.mixin({
  /** @lends tau.ui.Button.prototype.renderer.prototype*/

  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-button',

  /**
   * style Class 
   * <p />
   * template에서 사용하는 style Class를 정의한다.
   */
  $styleClass: tau.mixin({
    text: '-text',
    badge: '-badge',
    icon: '-icon'
  }, tau.ui.Button.$super.renderer.$styleClass),
  
  _templateLabel: ['<div class=${base}${text}></div>'],
  _templateBadge: ['<div class=${base}${badge}></div>'],
  _templateIcon: ['<div class=${base}${icon}></div>'],
  
  /**
   * button 라벨를 업데이트 한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param value
   */
  updateLabel: function ($renderData, value) {
    var elem = this._createElement($renderData.$dom, $renderData.$base, 
        tau.ui.Button.LABEL_KEY, this._templateLabel);
    if (!tau.isValue(value)) {
      value = '';
    }
    elem.innerHTML = value;
  },
  
  /**
   * button badge를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Object} value
   * @param {String} [value.src] 배지 이미지 URL
   * @param {String} [value.label] 배지 텍스트
   * @param {String} [x=right] 
   *  <ul>
   *    <li>left</li>
   *    <li>right</li>
   *    <li>center</li>
   *  </ul>
   * @param {String} [y=top]
   *  <ul>
   *    <li>top</li>
   *    <li>bottom</li>
   *    <li>middle</li>
   *  </ul>
   * @see tau.ui.Button.setBadge
   */
  updateBadge: function ($renderData, value, x, y) {
    if (tau.isUndefine(x)){
      x = 'right';
    }
    if (tau.isUndefine(y)){
      y = 'top';
    }
    var elem = this._createElement($renderData.$dom, $renderData.$base, tau.ui.Button.BADGE_PREFIX + x + y, 
        this._templateBadge);
    if (value){
      if (value.src){
        // TODO
      }
      if (value.label){
        elem.innerHTML = value.label;
      }
    }
  },
  
  /**
   * 아이콘을 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param value 아이콘 URL
   */
  updateIcon: function ($renderData, value) {
    var $dom = $renderData.$dom,
        $base = $renderData.$base,
        elem = this._createElement($dom, $base, tau.ui.Button.ICON_KEY, this._templateIcon);
    if (value) {
      elem.setAttribute('src', value);
      tau.util.dom.addClass($dom[tau.ui.ROOT_KEY], this.$styleClass.icon, $base);
    } else if (elem.src) {
      elem.removeAttribute('src');
      tau.util.dom.removeClass($dom[tau.ui.ROOT_KEY], this.$styleClass.icon, $base);
    }
  },

  /**
   * 텍스트 색을 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param value 텍스트 색상
   */
  updateTextColor: function ($renderData, value) {
    var $dom = $renderData.$dom;
    tau.util.style($dom[tau.ui.ROOT_KEY], 'color', value);
  },

  /**
   * 배경색을 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} value 배경색
   */
  updateBackgroundColor: function ($renderData, value) {
    var $dom = $renderData.$dom;
    tau.util.style($dom[tau.ui.ROOT_KEY], 'background-color', value);
  },

  /**
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param value
   */
  updateBackgroundImage: function ($renderData, value) {
    var $dom = $renderData.$dom;
    if (value) {
      var appCtx = tau.getCurrentContext();
      value = "url(" + appCtx.getRealPath(value) + ")";
    }
    tau.util.style($dom[tau.ui.ROOT_KEY], 'background-image', value);
  }

}, tau.ui.Button.$super.renderer);

/**
 * Renders Picker
 * @class
 * @private
 */
tau.ui.Picker.prototype.renderer = tau.mixin({
  /** @lends tau.ui.Picker.prototype.renderer.prototype */
  Z_INDEX:99992,
  cellHeight: 44,
  friction: 0.003,
  slots_refer: [],
  pickers: {},
  openningPosition: -255,
  isOpened: [],
  c_slot: [],
  cID: null,
  sID: null,
  _valueChangedCallBack: [],
  _ignoreCallBack: [],

  $base: 'tau-picker',
  $styleClass: {
    header: '-header',
    cancel: '-cancel',
    done: '-done',
    slotswrapper: '-slotswrapper',
    slots: '-slots',
    frame: '-frame',
    separator: '-separator',
    slot: '-slot'
  },
  
  _template: [ '<div>', '<div class=\'${base}${header}\'>',
//      '<span class=\'tau-button ${base}${cancel}\'>Cancel</span>',
//      '<span class=\'tau-button ${base}${done}\'>Done</span>',
      '</div>', '<div class=\'${base}${slotswrapper}\'>',
      '<div class=\'${base}${slots}\'>', '</div>', '</div>',
      '<div class=\'${base}${frame}\'>', '</div>', '</div>' ],

  _initializeDOM: function ($dom, $base, root) {
    $dom[tau.ui.ROOT_KEY] = root;

    $dom[tau.ui.Picker.HEADER] = root.firstChild;
    $dom[tau.ui.Picker.SLOT_CONTAINER] = root.childNodes[1].firstChild;
    $dom[tau.ui.Picker.CANCEL_BUTTON] = root.firstChild.firstChild;
    $dom[tau.ui.Picker.DONE_BUTTON] = root.firstChild.childNodes[1];

    $dom[tau.ui.ROOT_KEY].style.top = window.innerHeight
        + window.pageYOffset + "px";

    this.swWrapper = $dom[tau.ui.ROOT_KEY];
    this.swSlotWrapper = root.childNodes[1];
    this.swSlots = root.childNodes[1].firstChild;
    this.swFrame = root.childNodes[2];
  },

  /**
   * picker 를 화면에 표시 한다.
   * @param componentId
   * @param $renderData
   */
  open: function (componentId, $renderData) {
    this.cID = componentId;
    var $dom = $renderData.$dom;
    
    $dom[tau.ui.ROOT_KEY].style.zIndex = this.Z_INDEX;
    this.closeOthers(componentId, $renderData);
    $dom[tau.ui.ROOT_KEY].style.visibility = 'visible';
    this.translate($dom[tau.ui.ROOT_KEY], this.openningPosition);
    this.isOpened[componentId] = true;
    this.updatePosition(componentId, $renderData);
  },

  closeOthers: function (componentId, $renderData) {
    this.cID = componentId;
    var $dom = $renderData.$dom;

    var rootEl = null;
    for (var i in this.pickers) {
      if (i != componentId) {
        rootEl = document.getElementById(i);
        if(!rootEl){
          continue;
        }
        this._close(i, rootEl);
      }
    }
  },

  /**
   * $dom의 key가 추가될 parent DOM element를 반환한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} key $dom 키값  
   * @returns {HTMLElement}
   * @see tau.ui.BaseRenderer.getParentElement
   */
  getHeaderElement: function ($renderData) {
    var $dom = $renderData.$dom;   
    return $dom[tau.ui.Picker.HEADER];
  },
  
  /**
   * 현재 picker 가 화면에 표시중인지를 boolean 값으로 반환한다.
   * @param componentId
   * @returns
   */
  isOpened: function (componentId) {
    return this.isOpened[componentId];
  },

  /**
   * onresize, onorientationchange Event 에 화면에 표시된 Picker Component 의
   * 위치를 update 한다.
   * @param componentId
   * @param $renderData
   */
  updatePosition: function (componentId, $renderData) {
    this.cID = componentId;
    var rootEl = null;
    for (var i in this.pickers) {
      rootEl = document.getElementById(i);

      if(!rootEl){
        continue;
      }
      if (!this.isOpened[i]) {
        rootEl.style.visibility = 'hidden';
      }

      rootEl.style.top = tau.getHeight() + window.pageYOffset + "px";
    }
  },

  /**
   * 화면에 표시된 Picker Component 를 숨긴다.
   * @param componentId
   * @param $renderData
   */
  close: function (componentId, $renderData) {
    this.cID = componentId;
    var $dom = $renderData.$dom;
    this._close(componentId, $dom[tau.ui.ROOT_KEY]);
  },
  
  _close: function (componentId, rootEl) {
    this.translate(rootEl, 0);
    rootEl.style.visibility = 'hidden';
    this.isOpened[componentId] = false;            
  },
  
  /**
   * Picker DOM Object 를 transform 한다.
   * @param $renderData
   * @param positionInPX
   */
  translate: function (rootEl, positionInPX) {
    rootEl.style.webkitTransitionTimingFunction = "ease-out";
    rootEl.style.webkitTransitionDuration = "400ms";
    rootEl.style.webkitTransform = "translate3d(0, "
        + (positionInPX) + "px, 0)";
  },

  /**
   * 실제 동작 하는 slot 이 아닌, Separator 를 추가 한다.
   * @param componentId
   * @param $renderData
   * @param placeHolder
   * @param options
   * @returns {Number} 추가된 Slot ID, Slot 의 변경작업에 사용된다.
   */
  addSeparator: function (componentId, $renderData, placeHolder,
      options) {
    this.cID = componentId;
    var $dom = $renderData.$dom;
    var slot = document.createElement("div");
    slot.setAttribute("class", this.$base + this.$styleClass.separator);
    placeHolder = placeHolder == undefined || null ? "" : placeHolder;
    var _html = [];
    _html.push("<ul>");
    _html.push("<li uid='");
    _html.push(placeHolder);
    _html.push("'>");
    _html.push(placeHolder);
    _html.push("</li>");

    _html.push("</ul>");
    slot.innerHTML = _html.join("");

    slot.firstChild.type = tau.ui.Picker.TYPE_SEPARATOR;
    if (options && options.position) {
      $dom[tau.ui.Picker.SLOT_CONTAINER]
          .insertBefore(
              slot,
              $dom[tau.ui.Picker.SLOT_CONTAINER].childNodes[options.position]);
      this.slots_refer[componentId].splice(options.position, 0,
          slot.firstChild);
    } else {
      $dom[tau.ui.Picker.SLOT_CONTAINER].appendChild(slot);
      this.slots_refer[componentId].push(slot.firstChild);
    }

    return this.slots_refer[componentId].length - 1;
  },

  /**
   * 추가된 Slot 를 Picker 에서 제거 한다.
   * @param componentId
   * @param $renderData
   * @param index
   */
  removeSlot: function (componentId, $renderData, index) {
    this.cID = componentId;
    var $dom = $renderData.$dom;
    if (this.slots_refer[componentId].length > 1) {
      $dom[tau.ui.Picker.SLOT_CONTAINER]
          .removeChild($dom[tau.ui.Picker.SLOT_CONTAINER].childNodes[index]);
      this.slots_refer[componentId].splice(index, 1);
    }
  },

  contains: function (arr, obj) {
    if (tau.isArray(arr)) {
      for (var i in arr) {
        if (obj === arr[i]) {
          return true;
        }
      }
      return false;
    } else {
      return arr == obj;
    }
  },

  /**
   * Slot 을 추가 한다.
   * @param componentId
   * @param $renderData
   * @param data
   * @param options
   * @returns {Number} 추가된 Slot 의 ID, 해당 Slot 의 변경 작업에 사용 된다.
   */
  addSlot: function (componentId, $renderData, data, options, valueChangedCallBack) {
    this.cID = componentId;
    options = options ? options: {};

    var $dom = $renderData.$dom;
    var prefix = options.prefix != undefined ? options.prefix: '';
    var postfix = options.postfix != undefined ? options.postfix: '';
    var highlight = options.highlight != undefined ? options.highlight
       : null;
    var disabled = options.disabled != undefined ? options.disabled
       : null;

    var dummyPref = "DUMMY" + componentId + this.slots_refer[componentId].length;
    if (!data) {
      if (!options) {
        throw new Error("");
      } else if (tau.isNumber(options.begin)
          && tau.isNumber(options.end)) {
        data = new Object();
        var step = options.step ? parseInt(options.step): 1;
        for (var i = options.begin; i <= options.end; i = i + step) {
          data[dummyPref + i] = i;
        }
      }
    }

    var slot = document.createElement("div");
    slot.setAttribute("class", this.$base + this.$styleClass.slot);
    var _html = [];
    _html.push("<ul>");
    var dummyStriped = "";
    for (var i in data) {
      _html.push("<li uid='");
      var dummyStriped = i;
      if (dummyStriped.indexOf(dummyPref) == 0) {
        dummyStriped = i.replace(dummyPref, "");
      }

      _html.push(dummyStriped);

      if (this.contains(disabled, dummyStriped)) {
        _html.push(" class='tau-datepicker-slot-item-disabled' ");
      }
      _html.push("'>");

      if (this.contains(highlight, dummyStriped)) {
        _html
            .push("<label class='tau-datepicker-slot-item-highlight'>");
      }

      _html.push(prefix);
      _html.push(data[i]);
      _html.push(postfix);

      if (this.contains(highlight, dummyStriped)) {
        _html.push("</label>");
      }
      _html.push("</li>");
    }

    _html.push("</ul>");
    slot.innerHTML = _html.join("");

    slot.firstChild.slotYPosition = 0;
    slot.firstChild.style.webkitTransitionTimingFunction = "cubic-bezier(0, 0, 0.2, 1)";
    slot.firstChild.slotMaxScroll = this.swSlotWrapper.clientHeight
        - slot.firstChild.clientHeight - 86;
    slot.firstChild.slotWidth = slot.offsetWidth;
    slot.infinite = options && options.infinite
        && (options.infinite == true) ? true: false;

    slot.firstChild.type = tau.ui.Picker.TYPE_SLOT;
    if (options && options.position) {
      $dom[tau.ui.Picker.SLOT_CONTAINER]
          .insertBefore(
              slot,
              $dom[tau.ui.Picker.SLOT_CONTAINER].childNodes[options.position]);
      this.slots_refer[componentId].splice(options.position, 0,
          slot.firstChild);
    } else {
      $dom[tau.ui.Picker.SLOT_CONTAINER].appendChild(slot);
      this.slots_refer[componentId].push(slot.firstChild);
    }

    if (options && options.selectedAt) {
      if (options.selectedAt < 0
          || options.selectedAt > slot.firstChild.children.length - 1) {
        tau.log.error("selectedAt[" + (options.selectedAt)
            + "] property is out of bound[0-"
            + (slot.firstChild.children.length - 1) + "].");
      } else {
        slot.firstChild.memoryPosition = options.selectedAt;
        this.setPosition(slot.firstChild,
            -(options.selectedAt * this.cellHeight));
      }
    }
    this.slots_refer[componentId][this.slots_refer[componentId].length - 1].callbackFn = valueChangedCallBack; 
    this.slots_refer[componentId][this.slots_refer[componentId].length - 1]
        .addEventListener("webkitTransitionEnd", valueChangedCallBack, false);

    return this.slots_refer[componentId].length - 1;
  },

  /**
   * 현재 slide 중인 slot object 를 반환 한다.
   * @param componentId
   * @param e
   * @returns
   */
  getTargetSlot: function (componentId, e) {
    return this.slots_refer[componentId][this.getTargetSlotIndex(
        componentId, e)];
  },

  getSlotIndex: function (componentId, slot) {
    for (var i=0; i < this.slots_refer[componentId].length; i++) {
      if (this.slots_refer[componentId][i] === slot) {
        return i;
      }
    }
    return -1;
  },
  
  /**
   * 현재 slide 중인 slot 의 index 를 반환 한다.
   * @param componentId
   * @param e
   * @returns
   */
  getTargetSlotIndex: function (componentId, e) {
    this.cID = componentId;
    var slot = 0;
    var clientX = -1;
    try {
      clientX = e.targetTouches[0].clientX;
    } catch (ex) {
      clientX = e.touches[0].clientX;
    }
    var xPos = clientX - this.swSlots.offsetLeft;
    for (var i = 0; i < this.slots_refer[componentId].length; i += 1) {
      slot += this.slots_refer[componentId][i].offsetWidth;
      if (xPos < slot) {
        this.sID = i;
        return i;
      }
    }
    return null;
  },
  /**
   * 현재 Event 가 발생 한 slot 의 item index 를 반환 한다.
   * @param e
   * @returns {Number}
   */
  getTargetItemRelative: function (e) {
    var clientY = -1;
    try {
      clientY = e.targetTouches[0].clientY;
    } catch (ex) {
      clientY = e.touches[0].clientY;
    }
    var yPos = clientY - this.swSlots.offsetTop;
    var yPosRelative = parseInt(this.swWrapper.style.top) - yPos;
    var itemIndex = parseInt(yPosRelative / this.cellHeight) - 2;
    return itemIndex;
  },

  /**
   * 
   */
  jump: function (componentId, e) {
    this.cID = componentId;
    this.c_slot[componentId] = this.getTargetSlot(componentId, e);
    if (this.c_slot[componentId].parentElement.getAttribute('class') == this.$base
        + this.$styleClass.separator) {
      return false;
    }
    var itemIndex = this.getTargetItemRelative(e);
    this.scrollTo(this.c_slot[componentId],
        this.c_slot[componentId].slotYPosition
            + (this.cellHeight * itemIndex));
    
  },

  /**
   * 해당 slot 에서 disabled 된 item 개수를 반환 한다.
   */
  getDisabledItemCount: function (componentId, slotIndex) {
    this.cID = componentId;
    if (slotIndex < 0
        || slotIndex >= this.slots_refer[componentId].length) {
      throw new Error("invalid slot index[" + slotIndex + "].");
    }

    if (this.slots_refer[componentId][slotIndex].type != tau.ui.Picker.TYPE_SLOT) {
      throw new Error("slot[" + slotIndex + "] is a separator.");
    }
    var count = 0;
    for (var i = 0; i < this.slots_refer[componentId][slotIndex].childNodes.length; i++) {
      if (this.slots_refer[componentId][slotIndex].childNodes[i]
          .getAttribute('class') != null
          && this.slots_refer[componentId][slotIndex].childNodes[i]
              .getAttribute('class').indexOf('disabled') > -1) {
        count++;
      }
    }

    return count;
  },

  /**
   * 해당 slot 의 item 에 disable 설정을 한다.
   * @param componentId
   * @param slotIndex
   * @param startIndex 시작 index
   * @param count 설정 할 개수
   */
  setDisabledItem: function (componentId, slotIndex, startIndex, count) {
    this.cID = componentId;
    if (slotIndex < 0
        || slotIndex >= this.slots_refer[componentId].length) {
      throw new Error("invalid slot index[" + slotIndex + "].");
    }

    if (this.slots_refer[componentId][slotIndex].type != tau.ui.Picker.TYPE_SLOT) {
      throw new Error("slot[" + slotIndex + "] is a separator.");
    }

    if (startIndex < 0
        || startIndex >= this.slots_refer[componentId][slotIndex].childNodes.lengh) {
      throw new Error("invalid item index[" + startIndex + "].");
    }

    if (count < 0
        || startIndex + count > this.slots_refer[componentId][slotIndex].childNodes.length) {
      throw new Error("invalid count[" + count + "].");
    }

    if (this.getDisabledItemCount(componentId, slotIndex) + count >= this.slots_refer[componentId][slotIndex].childNodes.length) {
      throw new Error("too much disabled items. maximum ="
          + this.slots_refer[componentId][slotIndex].childNodes.length
          + ".");
    }

    var max = startIndex + count;
    for (var i = startIndex; i < max; i++) {
      if (this.slots_refer[componentId][slotIndex].childNodes[i]
          .getAttribute('class') != null
          && this.slots_refer[componentId][slotIndex].childNodes[i]
              .getAttribute('class').indexOf(
                  'tau-datepicker-slot-item-disabled') > -1) {
        continue;
      }
      tau.util.dom.addClass(
          this.slots_refer[componentId][slotIndex].childNodes[i],
          "tau-datepicker-slot-item-disabled");
    }

    var currentIndex = this
        .getSelectedIndex(this.slots_refer[componentId][slotIndex]);

    var validItemPosition = this.validateItemPosition(this.slots_refer[componentId][slotIndex], currentIndex);
    
    this.scrollTo(this.slots_refer[componentId][slotIndex], -(validItemPosition * this.cellHeight), "300ms", true);             
  },

  /**
   * 해당 slot 의 item 에 enable 설정을 한다.
   * @param componentId
   * @param slotIndex
   * @param startIndex 시작 index
   * @param count 설정 할 개수
   */
  setEnabledItem: function (componentId, slotIndex, startIndex, count) {
    this.cID = componentId;
    if (slotIndex < 0
        || slotIndex >= this.slots_refer[componentId].length) {
      throw new Error("invalid slot index[" + slotIndex + "].");
    }

    if (this.slots_refer[componentId][slotIndex].type != tau.ui.Picker.TYPE_SLOT) {
      throw new Error("slot[" + slotIndex + "] is a separator.");
    }

    if (startIndex < 0
        || startIndex >= this.slots_refer[componentId][slotIndex].childNodes.lengh) {
      throw new Error("invalid item index[" + startIndex + "].");
    }

    if (count < 0
        || startIndex + count > this.slots_refer[componentId][slotIndex].childNodes.length) {
      throw new Error("invalid count[" + count + "].");
    }

    var max = startIndex + count;
    for (var i = startIndex; i < max; i++) {
      tau.util.dom.removeClass(
          this.slots_refer[componentId][slotIndex].childNodes[i],
          "tau-datepicker-slot-item-disabled");
    }
  },

  /**
   * 특정 item 으로 touchmove event 없이 바로 이동 한다.
   * @param componentId
   * @param slotIndex
   * @param itemIndex 이동 할 item index
   * @param ignoreCallBack true 값이 설정 될 경우, EVENT_VALUE_CHANGED Event에
   *        bind 된 handler 를 무시 한다.(parameter 생략 가능)
   */
  spinTo: function (componentId, slotIndex, itemIndex) {
    this.cID = componentId;

    if (slotIndex < 0
        || slotIndex >= this.slots_refer[componentId].length) {
      throw new Error("invalid slot index[" + slotIndex + "].");
    }

    if (itemIndex < 0
        || itemIndex >= this.slots_refer[componentId][slotIndex].childNodes.lengh) {
      throw new Error("invalid item index[" + itemIndex + "].");
    }

    this.scrollTo(this.slots_refer[componentId][slotIndex],
        -(itemIndex * this.cellHeight), "500ms");
  },

  /**
   * TouchStart 에 반응 할 handler
   * @param componentId
   * @param e
   * @returns {Boolean}
   */
  startSpinning: function (componentId, e) {
    this.cID = componentId;
    this.c_slot[componentId] = this.getTargetSlot(componentId, e);
    if (!this.c_slot[componentId]
        || this.c_slot[componentId].parentElement.getAttribute('class') == this.$base
            + this.$styleClass.separator) {
      return false;
    }
    this.startY = e.targetTouches[0].clientY;

    this.c_slot[componentId].style.webkitTransitionDuration = "0";
    this.c_slot[componentId].slotMaxScroll = this.swSlotWrapper.clientHeight
        - this.c_slot[componentId].clientHeight - 86;

    var theTransform = window
        .getComputedStyle(this.c_slot[componentId]).webkitTransform;
    theTransform = new WebKitCSSMatrix(theTransform).m42;
    
    if (theTransform != this.c_slot[componentId].slotYPosition) {
      this.setPosition(this.c_slot[componentId], theTransform);
    }

    this.scrollStartY = this.c_slot[componentId].slotYPosition;
    this.scrollStartTime = e.timeStamp;
    return true;
  },

  lockScreen: function (e) {
    e.preventDefault();
    e.stopPropagation();
  },

  /**
   * TouchMove 에 반응 할 handler
   * @param componentId
   * @param e
   * @returns {Boolean}
   */
  spin: function (componentId, e) {
    this.lockScreen(e);
    this.cID = componentId;
    if (!this.c_slot[componentId]
        || this.c_slot[componentId].parentElement.getAttribute('class') == this.$base
            + this.$styleClass.separator) {
      return false;
    }

    var topDelta = e.targetTouches[0].clientY - this.startY;

    if (this.c_slot[componentId].slotYPosition > 0
        || this.c_slot[componentId].slotYPosition < this.c_slot[componentId].slotMaxScroll) {
      topDelta /= 2;
    }

    this.setPosition(this.c_slot[componentId],
        this.c_slot[componentId].slotYPosition + topDelta, "0");
    this.startY = e.targetTouches[0].clientY;
    if (e.timeStamp - this.scrollStartTime > 80) {
      this.scrollStartY = this.c_slot[componentId].slotYPosition;
      this.scrollStartTime = e.timeStamp;
    }
  },

  /**
   * TouchEnd 에 반응 할 handler
   * @param componentId
   * @param e
   * @returns {Boolean}
   */
  endSpinning: function (componentId, e) {
    this.cID = componentId;
    if (!this.c_slot[componentId]
        || this.c_slot[componentId].parentElement.getAttribute('class') == this.$base
            + this.$styleClass.separator) {
      return false;
    }

    if (this.c_slot[componentId].slotYPosition > 0
        || this.c_slot[componentId].slotYPosition < this.c_slot[componentId].slotMaxScroll) {
      this.scrollTo(this.c_slot[componentId],
          this.c_slot[componentId].slotYPosition > 0 ? 0
             : this.c_slot[componentId].slotMaxScroll);

      return false;
    }

    var scrollDistance = this.c_slot[componentId].slotYPosition
        - this.scrollStartY;
    if (scrollDistance < this.cellHeight / 1.5
        && scrollDistance > -this.cellHeight / 1.5) {
      if (this.c_slot[componentId].slotYPosition % this.cellHeight) {
        this.scrollTo(this.c_slot[componentId], Math
            .round(this.c_slot[componentId].slotYPosition
                / this.cellHeight)
            * this.cellHeight, "100ms");
      }else{
        var slotIndex = this.getTargetSlotIndex(componentId, e);
        this.slots_refer[componentId][slotIndex].callbackFn(null, this.c_slot[componentId]);
      }

      return false;
    }

    var scrollDuration = e.timeStamp - this.scrollStartTime;
    var newDuration = (2 * scrollDistance / scrollDuration)
        / this.friction;
    var newScrollDistance = (this.friction / 2)
        * (newDuration * newDuration);
    if (newDuration < 0) {
      newDuration = -newDuration;
      newScrollDistance = -newScrollDistance;
    }
    var newPosition = this.c_slot[componentId].slotYPosition
        + newScrollDistance;

    if (newPosition > 0) {
      newPosition /= 2;
      newDuration /= 3;
      if (newPosition > this.swSlotWrapper.clientHeight / 4) {
        newPosition = this.swSlotWrapper.clientHeight / 4;
      }
    } else {
      if (newPosition < this.c_slot[componentId].slotMaxScroll) {
        newPosition = (newPosition - this.c_slot[componentId].slotMaxScroll)
            / 2 + this.c_slot[componentId].slotMaxScroll;
        newDuration /= 3;
        if (newPosition < this.c_slot[componentId].slotMaxScroll
            - this.swSlotWrapper.clientHeight / 4) {
          newPosition = this.c_slot[componentId].slotMaxScroll
              - this.swSlotWrapper.clientHeight / 4;
        }
      } else {
        newPosition = Math.round(newPosition / this.cellHeight)
            * this.cellHeight;
      }
    }

    if (newPosition > 0) {
      newPosition = 0;
    } else if (newPosition < this.c_slot[componentId].slotMaxScroll) {
      newPosition = this.c_slot[componentId].slotMaxScroll;
    }

    this.scrollTo(this.c_slot[componentId], Math.round(newPosition),
        Math.round(newDuration) + "ms");
    return true;
  },

  /**
   * 현재 화면에 표시되고 있는 Item 들의 value array 를 반환한다.
   * @param componentId
   * @returns {Array}
   */
  getValues: function (componentId) {
    this.cID = componentId;
    var returnValue = [];
    var index = -1;
    var children = null;
    for (var i in this.slots_refer[componentId]) {

      if (this.slots_refer[componentId][i].parentElement
          .getAttribute('class') == this.$base
          + this.$styleClass.separator) {
        continue;
      }
      index = this.getSelectedIndex(this.slots_refer[componentId][i]);
      children = this.slots_refer[componentId][i].children;

      try {
        returnValue.push(children[index].getAttribute('uid'));
      } catch (e) {
        tau.log.debug(e);
      }
    }

    return returnValue;
  },

  /**
   * 현재 화면에 표시되고 있는 Item 들의 text array 를 반환한다.
   * @param componentId
   * @returns {Array}
   */
  getTexts: function (componentId) {
    this.cID = componentId;
    var returnValue = [];
    var index = -1;
    var children = null;
    for (var i in this.slots_refer[componentId]) {
      if (this.slots_refer[componentId][i].parentElement
          .getAttribute('class') == this.$base
          + this.$styleClass.separator) {
        continue;
      }
      index = this.getSelectedIndex(this.slots_refer[componentId][i]);
      children = this.slots_refer[componentId][i].children;

      try {
        returnValue.push(children[index].innerText);
      } catch (e) {
        tau.log.debug(e);
      }
    }
    return returnValue;
  },

  /**
   * 해당 Slot 이 표시 하고 있는 item 의 index 를 반환 한다.
   * @param slot
   * @returns
   */
  getSelectedIndex: function (slot) {
    try {
      return -Math.round(slot.slotYPosition / this.cellHeight);
    } catch (ex) {
      return 0;
    }
  },

  setPosition: function (slot, pos, runtime) {    
    slot.slotYPosition = pos;
    slot.style.webkitTransitionDuration = runtime == undefined ? "100ms"
       : runtime;
    slot.style.webkitTransform = "translate3d(0, " + pos + "px, 0)";    
  },

  scrollTo: function (slot, dest, runtime) {
    if (dest > 0 || dest < -(slot.offsetHeight - (this.cellHeight * 2))) {
      return false;
    }
    
    this.setPosition(slot, dest, runtime);           
  },

  /**
   * spin 이 발생 할 때 마다, 선택된 item 이 disabled 이면 spin 방향을 반영 해서 가장 가까운
   * enabled item 의 index 를 반환 한다.
   * @param slot
   * @param itemIndex
   * @returns
   */
  validateItemPosition: function (slot, itemIndex) {
    if (slot.childNodes[itemIndex].getAttribute('class') != null
        && slot.childNodes[itemIndex].getAttribute('class').indexOf(
            'tau-datepicker-slot-item-disabled') > -1) {

      var direction = slot.memoryPosition > itemIndex ? -1: 1;

      var newItemIndex = itemIndex + direction;

      slot.memoryPosition = itemIndex;
      // MIN, MAX Boundary 로 자동 spin 될때
      if (direction > 0) { // 아래로 scroll 했을때
        if (newItemIndex >= slot.childNodes.length) {
          slot.memoryPosition = newItemIndex;
          newItemIndex = newItemIndex - 1;
        }
      } else {
        if (newItemIndex < 0) {
          slot.memoryPosition = newItemIndex;
          newItemIndex = newItemIndex + 1;
        }
      }
      return arguments.callee(slot, newItemIndex);
    }

    return itemIndex;
  }
}, tau.ui.Picker.$super.renderer);

/**
 * Renders Spinner
 * @class
 * @private
 */
tau.ui.Spinner.prototype.renderer = tau.mixin({
  /** @lends tau.ui.Spinner.prototype.renderer.prototype */

  $base: 'tau-spinner',
  $styleClass: {
    control: '-control'
  },
  _template: [ '<div>',
  '<span class=\'tau-spinner-button\'>-</span>',
      '<input class=\'${base}${control}\' type=\'text\'></input>',
      '<span class=\'tau-spinner-button\'>+</span>', '</div>' ],
  _initializeDOM: function ($dom, $base, root) {
    $dom[tau.ui.ROOT_KEY] = root;
    $dom[tau.ui.Spinner.DECREASE_KEY] = root.firstChild;
    $dom[tau.ui.Spinner.VALUE_KEY] = root.childNodes[1];
    $dom[tau.ui.Spinner.INCREASE_KEY] = root.childNodes[2];
    // return $dom;
  },

  setIncreaseText: function ($renderData, text) {
    var $dom = $renderData.$dom;
    $dom[tau.ui.Spinner.INCREASE_KEY].innerText = text;
  },

  setDecreaseText: function ($renderData, text) {
    var $dom = $renderData.$dom;
    $dom[tau.ui.Spinner.DECREASE_KEY].innerText = text;
  },
  
  getValue: function ($renderData) {
    var $dom = $renderData.$dom;
    return $dom[tau.ui.Spinner.VALUE_KEY].value;
  },

  /**
   * @param {Object} $dom
   * @param value
   */
  updateValue: function ($renderData, value) {
    var elem = this._renderValue($renderData);
    if (!tau.isValue(value)) {
      value = '';
    }
    // elem.innerHTML = value;
    elem.value = value;

  },

  /**
   * @param {Object} $dom
   */
  _renderValue: function ($renderData) {
    var $dom = $renderData.$dom;
    var elem = $dom[tau.ui.Spinner.VALUE_KEY];

    if (!elem) {
      elem = document.createElement('input');
      $dom[tau.ui.ROOT_KEY].appendChild(elem);
      $dom[tau.ui.Spinner.VALUE_KEY] = elem;
    }
    return elem;
  },

  /**
   * @param {Object} $dom
   * @param value
   */
  updateReadOnly: function ($renderData, value) {
    var $dom = $renderData.$dom;
    var elem = $dom[tau.ui.Spinner.VALUE_KEY];
    if (value) {
      elem.setAttribute('readonly', true);
    } else if (elem.readOnly) {
      elem.removeAttribute('readonly');
    }
  },

  /**
   * @param {Object} $dom
   * @param value
   */
  updateSize: function ($renderData, value) {
    var $dom = $renderData.$dom;
    var elem = $dom[tau.ui.Spinner.VALUE_KEY];
    if (tau.isNumber(value)) {
      elem.setAttribute('size', value);
    }
  }

}, tau.ui.Spinner.$super.renderer);

/**
 * Renders TextField
 * @class
 * @private
 */
tau.ui.TextField.prototype.renderer = tau.mixin({
  /** @lends tau.ui.TextField.prototype.renderer.prototype*/

  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-textfield',

  /**
   * style Class 
   * <p />
   * template에서 사용하는 style Class를 정의한다.
   */
  $styleClass: {
    placeholderimage: '-placeholderimage',
    hasplaceholderimage: '-hasplaceholderimage',
    hasclearbutton: '-hasclearbutton',
    clearbutton: '-clearbutton'
  },

  /** 
   * html template
   * style class는 <code>${key}</code>로 묶어서 표시한다.
   * {@link $base}, {@link $styleClass}에 설정되어 있는 style class가 <code>${key}</code>를 대체한다.
   */
  _template: ['<div>',
                '<input class=${base}-control type="text"></input>',
              '</div>'],
              
  _templatePlaceholderImage: ['<img class=${base}${placeholderimage}></img>'],
  _templateClearbutton: ['<button class=${base}${clearbutton}></button>'],
  
  /**
   * $dom 구조를 설정한다.
   * <p/> 
   * 최상위 {@link tau.ui.ROOT_KEY}를 제외한 나머지에 대해서 설정하면 된다.
   * @param {Object} $dom key에 해당하는 DOM Element를 가지는 객체
   * @param {String} $base base style class
   * @param {HTMLElement} root root가 되는 DOM Element
   * @see tau.ui.BaseRenderer._initializeDOM
   */
  _initializeDOM: function ($dom, $base, root) {
    $dom[tau.ui.TextField.TEXT_KEY] = root.firstChild;
  },
  
  /**
   * input 타입을 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} value
   *  <ul>
   *    <li>{@link tau.ui.TextField.TEXT}</li>
   *    <li>{@link tau.ui.TextField.PASSWORD}</li>
   *    <li>{@link tau.ui.TextField.NUMBER}</li>
   *    <li>{@link tau.ui.TextField.URL}</li>
   *    <li>{@link tau.ui.TextField.EMAIL}</li>
   *    <li>{@link tau.ui.TextField.TEL}</li>
   *    <li>{@link tau.ui.TextField.SEARCH}</li>
   *  </ul>
   */
  updateType: function ($renderData, value) {
    var $dom = $renderData.$dom;
    
    switch (value) {
    case tau.ui.TextField.TEXT:
    case tau.ui.TextField.PASSWORD:
    case tau.ui.TextField.NUMBER:
    case tau.ui.TextField.URL:
    case tau.ui.TextField.EMAIL:
    case tau.ui.TextField.TEL:
    case tau.ui.TextField.SEARCH:
      $dom[tau.ui.TextField.TEXT_KEY].setAttribute('type', value);
      break;
    default:
      $dom[tau.ui.TextField.TEXT_KEY].setAttribute('type', 'text');
    }
  },

  /**
   * 입력된 텍스트를 반환한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @returns {String}
   */
  getText: function ($renderData) {
    var $dom = $renderData.$dom;
    return $dom[tau.ui.TextField.TEXT_KEY].value;
  },

  /**
   * 텍스트를 입력한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} value
   */
  updateText: function ($renderData, value) {
    var $dom = $renderData.$dom;
    $dom[tau.ui.TextField.TEXT_KEY].value = value;
  },

  /**
   * 최대 허용 입력수를 지정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Number} value 허용 입력수
   */
  updateMaxLength: function ($renderData, value) {
    var $dom = $renderData.$dom,
        elem = $dom[tau.ui.TextField.TEXT_KEY];
    if (value) {
      elem.setAttribute('maxlength', value);
    } else if (elem.maxLength) {
      elem.removeAttribute('maxlength');
    }
  },

  /**
   * 읽기 여부를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Boolean} value
   */
  updateReadOnly: function ($renderData, value) {
    var $dom = $renderData.$dom,
        elem = $dom[tau.ui.TextField.TEXT_KEY];
    if (value) {
      elem.setAttribute('readonly', true);
    } else if (elem.readOnly) {
      elem.removeAttribute('readonly');
    }
  },

  /**
   * placeholder 텍스트를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} value placeholder 텍스트
   */
  updatePlaceholderLabel: function ($renderData, value) {
    var $dom = $renderData.$dom,
        elem = $dom[tau.ui.TextField.TEXT_KEY];
    if (value) {
      elem.setAttribute('placeholder', value);
    } else if (elem.placeholder) {
      elem.removeAttribute('placeholder');
    }    
  },
  
  /**
   *placeholder 이미지를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} value 이미지 URL
   */
  updatePlaceholderImage: function ($renderData, value) {
    if (value) {
      var $dom = $renderData.$dom,
          $base =  $renderData.$base,
          elem = this._createElement($dom, $base, tau.ui.TextField.HOLDERIMAGE_KEY, 
              this._templatePlaceholderImage, {refChildKey: tau.ui.TextField.TEXT_KEY});

      var appCtx = tau.getCurrentContext();
      elem.setAttribute('src', appCtx.getRealPath(value));
    } else {
      this.releaseElement($renderData, tau.ui.TextField.HOLDERIMAGE_KEY);
    }
  },

  /**
   * clear button 사용 여부를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Boolean} value clear button 사용 여부  
   */
  updateClearButton: function ($renderData, value) {
    var $dom = $renderData.$dom,
        $base =  $renderData.$base,
        elem = this._createElement($dom, $base, tau.ui.TextField.CLEAR_KEY, this._templateClearbutton);
    if (value) {
      elem.style.display = '';
    } else {
      elem.style.display = 'none';
    }
  },
  
  /**
   * state상태를 업데이트 한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체 
   * @param {String} value 상태값 
   *  <ul>
   *    <li>{@link tau.ui.Control.SELECTED}</li>
   *    <li>{@link tau.ui.Control.HIGHLIGHTED}</li>
   *    <li>{@link tau.ui.Control.DISABLED}</li>
   *  </ul>
   * @see tau.ui.Control.renderer.updateControl
   */
  updateControl: function ($renderData, state) {
    var $dom = $renderData.$dom;
    $dom[tau.ui.TextField.TEXT_KEY].disabled = (state === tau.ui.Control.DISABLED);
  },

  /**
   * focus한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체 
   */
  focus: function ($renderData) {
    $renderData.$dom[tau.ui.TextField.TEXT_KEY].focus();
  },

  /**
   * blur한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체 
   */
  blur: function ($renderData) {
    $renderData.$dom[tau.ui.TextField.TEXT_KEY].blur();
  }

}, tau.ui.TextField.$super.renderer);

/**
 * Renders Label
 * @class
 * @private
 */
tau.ui.Label.prototype.renderer = tau.mixin({
  /** @lends tau.ui.Label.prototype.renderer.prototype*/

  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-label',

  /**
   * style Class 
   * <p />
   * template에서 사용하는 style Class를 정의한다.
   */
  $styleClass: {
    text: '-text'
  },

  /** 
   * html template
   * style class는 <code>${key}</code>로 묶어서 표시한다.
   * {@link $base}, {@link $styleClass}에 설정되어 있는 style class가 <code>${key}</code>를 대체한다.
   */
  _template: ['<div>',
                '<span class=${base}${text}></span>',
              '</div>'],
  
  /**
   * $dom 구조를 설정한다.
   * <p/> 
   * 최상위 {@link tau.ui.ROOT_KEY}를 제외한 나머지에 대해서 설정하면 된다.
   * @param {Object} $dom key에 해당하는 DOM Element를 가지는 객체
   * @param {String} $base base style class
   * @param {HTMLElement} root root가 되는 DOM Element
   * @see tau.ui.BaseRenderer._initializeDOM
   */
  _initializeDOM: function ($dom, $base, root) {
    $dom[tau.ui.Label.TEXT_KEY] = root.firstChild;
  },
  
  /**
   * 텍스트를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} value
   */
  updateText: function ($renderData, value) {
    var $dom = $renderData.$dom;
    $dom[tau.ui.Label.TEXT_KEY].innerHTML = value;
  },
  
  /**
   * 보여줄 라인수를 설정한다.
   * <p />
   * 설정하지 않은 경우 Label의 사이즈가 허용하는 범위에서 텍스트가 보여진다.
   * FIXME: line-height chrome에서 버그...
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Number} numberOfLines
   */
  updateNumberOfLines: function ($renderData, numberOfLines){
    var $dom = $renderData.$dom,
          unit = 'em', 
          fontSize = 1, 
          height = 'auto';

    if (numberOfLines > 0) {
      fontSize = unit= $dom[tau.ui.ROOT_KEY].style.fontSize || '1em';
      
      if (fontSize) {
        // absolute-size에 대해 추후에 지원해야함.
        fontSize = parseFloat(fontSize);
        if (unit.indexOf('%') != -1) {
          unit = '%';
        } else {
          unit = unit.replace(fontSize, '');
        }

        switch (unit) {
        case '%':
        case 'em':
          fontSize = 1;
          break;
          break;
        }
        height = (numberOfLines * fontSize )+ unit;
      }
    }
    $dom[tau.ui.Label.TEXT_KEY].style.height = height; 
  }
}, tau.ui.Label.$super.renderer);

/**
 * TODO : 임시로 만든 컴포넌트
 * Renders LinkUrl
 * @class
 * @private
 */
tau.ui.LinkUrl.prototype.renderer = tau.mixin({
  /** @lends tau.ui.LinkUrl.prototype.renderer.prototype*/

  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-linkurl',

  /**
   * style Class 
   * <p />
   * template에서 사용하는 style Class를 정의한다.
   */
  $styleClass: {
    title: '-title',
    subtitle: '-subtitle'
  },  

  /** 
   * html template
   * style class는 <code>${key}</code>로 묶어서 표시한다.
   * {@link $base}, {@link $styleClass}에 설정되어 있는 style class가 <code>${key}</code>를 대체한다.
   */
  _template: ['<div>',
                '<span class=${base}${title}></span>',
              '</div>'],
              
  _templateSubtitle: ['<div class=${base}${subtitle}></div>'],

  /**
   * $dom 구조를 설정한다.
   * <p/> 
   * 최상위 {@link tau.ui.ROOT_KEY}를 제외한 나머지에 대해서 설정하면 된다.
   * @param {Object} $dom key에 해당하는 DOM Element를 가지는 객체
   * @param {String} $base base style class
   * @param {HTMLElement} root root가 되는 DOM Element
   * @see tau.ui.BaseRenderer._initializeDOM
   */
  _initializeDOM: function ($dom, $base, root) {
    $dom[tau.ui.LinkUrl.TITLE_KEY] = root.firstChild;
  },
  
  /**
   * 제목을 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} title
   */
  updateTitle: function ($renderData, title){
    var $dom = $renderData.$dom;
    $dom[tau.ui.LinkUrl.TITLE_KEY].innerHTML = title || '';
  },

  /**
   * 부제목을 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} subtitle
   */
  updateSubtitle: function ($renderData, subtitle){
    var elem = this._createElement($renderData.$dom, $renderData.$base, tau.ui.LinkUrl.SUBTITLE_KEY, 
        this._templateSubtitle);
    elem.innerHTML = subtitle || '';
  },
  
  /**
   * 링크 경로를 업데이트 한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} url
   */
  updateURL: function ($renderData, url) {
    var doc = document,
        link = document.getElementById('tau_linkUrl');
    if (!link) {
      link = doc.createElement('a');
      link.setAttribute('id', 'tau_linkUrl');
      doc.body.appendChild(link);
    }
    link.setAttribute('href', url);
    var ev = doc.createEvent('MouseEvents');
    ev.initMouseEvent('click', true, true, null, 1,
        0, 0, 0, 0, false, false, false, false, 0, null);
    link.dispatchEvent(ev);
  }
  
}, tau.ui.LinkUrl.$super.renderer);

/**
 * Renders ImageView
 * @class
 * @private
 */
tau.ui.ImageView.prototype.renderer = tau.mixin({
  /** @lends tau.ui.ImageView.prototype.renderer.prototype*/

  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-imageview',

  _template: ['<img></img>'],
  
  
  /**
   * 이미지 경로를 변경환다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} src
   */
  updateSrc: function ($renderData, src) {
    var $dom = $renderData.$dom;
    if (src) {
      var appCtx = tau.getCurrentContext();
      src = appCtx.getRealPath(src);
      $dom[tau.ui.ROOT_KEY].src = src;
    } else {
      $dom[tau.ui.ROOT_KEY].src = null;
    }
  }
}, tau.ui.ImageView.$super.renderer);

/**
 * Renders ActivityIndicator
 * @class
 * @private
 */
tau.ui.ActivityIndicator.prototype.renderer = tau.mixin({
  /** @lends tau.ui.ActivityIndicator.prototype.renderer.prototype*/

  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-activityindicator',
  
  /**
   * style Class 
   * <p />
   * template에서 사용하는 style Class를 정의한다.
   */
  $styleClass: {
    icon: '-icon',
    message: '-message'
  },

  /** 
   * html template
   * style class는 <code>${key}</code>로 묶어서 표시한다.
   * {@link $base}, {@link $styleClass}에 설정되어 있는 style class가 <code>${key}</code>를 대체한다.
   */
  _template: ['<div style="display: none;">',
                '<span class=${base}${icon}></span>',
                '<span class=${base}${message}></span>',
              '</div>'],
  
  /**
   * $dom 구조를 설정한다.
   * <p/> 
   * 최상위 {@link tau.ui.ROOT_KEY}를 제외한 나머지에 대해서 설정하면 된다.
   * @param {Object} $dom key에 해당하는 DOM Element를 가지는 객체
   * @param {String} $base base style class
   * @param {HTMLElement} root root가 되는 DOM Element
   * @see tau.ui.BaseRenderer._initializeDOM
   */
   _initializeDOM: function ($dom, $base, root) {
    $dom[tau.ui.ActivityIndicator.ICON_KEY] = root.firstChild;
    $dom[tau.ui.ActivityIndicator.MESSAGE_KEY] = root.childNodes[1];
  },
  
  /**
   * 메세제를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} message
   */
  updateMessage: function ($renderData, message) {
    var $dom = $renderData.$dom;
    $dom[tau.ui.ActivityIndicator.MESSAGE_KEY].innerHTML = message;
  }

}, tau.ui.ActivityIndicator.$super.renderer);

/**
 * Renders ScrollPanel
 * @class
 * @private
 */
tau.ui.ScrollPanel.prototype.renderer = tau.mixin({
  /** @lends tau.ui.ScrollPanel.prototype.renderer.prototype*/

  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-scrollpanel',

  /**
   * style Class 
   * <p />
   * template에서 사용하는 style Class를 정의한다.
   */
  $styleClass: {
    container: '-container',
    content: '-content',
    scroller: 'tau-scroller',
    vertical: '-vertical',
    horizontal: '-horizontal',
    pulldown: 'tau-pulldown',
    pullup: 'tau-pullup',
    icon: '-icon',
    label: '-label',
    release: '-release',
    loading: '-loading'
  },

  /** 
   * html template
   * style class는 <code>${key}</code>로 묶어서 표시한다.
   * {@link $base}, {@link $styleClass}에 설정되어 있는 style class가 <code>${key}</code>를 대체한다.
   */
  _template: ['<div>',
                '<div class=${base}${container}>',
                  '<div class=${scroller}',
                    ' style="',
                      '-webkit-transition-property: -webkit-transform;',
                      '-webkit-transition-timing-function: cubic-bezier(0, 0, 0.25, 1); ',
                      '-webkit-transform: ', 'translate', (tau.rt.has3D ? '3d(' : '(') , '0,0' , tau.rt.has3D ? ',0)' : ')' , ');',
                      '-webkit-transition-duration: 0ms;',
                   '">',
                   '<div class="${base}${content}', (tau.rt.isIPad || tau.rt.isChrome) ? ' tau-preserve3d"' : '"', '></div>',
                  '</div>',
                '</div>',
              '</div>'],
              
  _templatePulldownToRefresh: ['<div class=${pulldown}>',
                                 '<div class=${pulldown}${icon}></div>',
                                 '<div class="${pulldown}${label}"></div>',
                               '</div>'],
                                           
  _templatePullupToRefresh: ['<div class=${pullup}>',
                              '<div class=${pullup}${icon}></div>',
                              '<div class=${pullup}${label}></div>',
                            '</div>'],

  /**
   * $dom 구조를 설정한다.
   * <p/> 
   * 최상위 {@link tau.ui.ROOT_KEY}를 제외한 나머지에 대해서 설정하면 된다.
   * @param {Object} $dom key에 해당하는 DOM Element를 가지는 객체
   * @param {String} $base base style class
   * @param {HTMLElement} root root가 되는 DOM Element
   * @see tau.ui.BaseRenderer._initializeDOM
   */
  _initializeDOM: function ($dom, $base, root) {
    var container = root.firstChild;
    
    $dom[tau.ui.ScrollPanel.WRAPPER_KEY] = container;
    $dom[tau.ui.ScrollPanel.SCROLLER_KEY] = container.firstChild;
    $dom[tau.ui.CONTENT_KEY] = container.firstChild.firstChild;
  },
  
  /**
   * 스크롤러 높이 혹은 너비를 초기화한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Boolean} hScroll 수평 스크롤 여부  
   * @param {Boolean} vScroll 수직 스크롤 여부  
   */
  initScrollerSize: function ($renderData, hScroll, vScroll) {
    var $dom = $renderData.$dom,
        wrapper = $dom[tau.ui.ScrollPanel.WRAPPER_KEY],
        root = wrapper.parentNode,
        parent = root.parentNode,
        wrapperWidth, wrapperHeight,
        width, height,
        computedStyle;
    
    // container size 초기화
    wrapper.style.height = null;
    wrapper.style.width = null;
    
    if ((!hScroll && !vScroll) || !parent) {
      return;
    }
    
    height = parent.clientHeight;
    width = parent.clientWidth;

    if (height) {
      height = height - root.offsetTop;
      
      computedStyle = document.defaultView.getComputedStyle(wrapper, null);
      
      if (computedStyle) {
        wrapperHeight = parseInt(computedStyle.getPropertyValue('height'));
      }

      height = Math.min(wrapperHeight, height);
      
      if (height) {
        wrapper.style.height = height + 'px';
      }
    }

    if (width) {
      width = width - root.offsetLeft;

      computedStyle = document.defaultView.getComputedStyle(wrapper, null);
      
      if (computedStyle) {
        wrapperWidth = parseInt(computedStyle.getPropertyValue('width'));
      }
      
      width = Math.min(wrapperWidth, width);

      if (width) {
        wrapper.style.width = width + 'px';
      }
    }
    
    if (hScroll && !vScroll) {
      tau.util.dom.replaceClass($dom[tau.ui.ScrollPanel.SCROLLER_KEY], 
          'tau-vscroll', 'tau-hscroll');
    } else if (vScroll && !hScroll) {
      tau.util.dom.replaceClass($dom[tau.ui.ScrollPanel.SCROLLER_KEY], 
          'tau-hscroll', 'tau-vscroll');
    }
  },
  
  /**
   * 스크롤러 높이 혹은 너비를 반환한다.
   * <p />
   * 내부적으로 스크롤러에 포함되어 있는 컨텐츠의 크기를 고려해서 스크롤러 높이를 설정한후에 반환한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Boolean} vertical <code>vScroll</code>이 있는 경우 <code>true<code> 
   *                  <code>hScroll</code>인 경우 <code>false</code> 
   * @param {String} [overflow=hidden]
   *  <ul>
   *    <li>visible</li>
   *    <li>hidden</li>
   *  </ul>
   * @returns {Number}
   */
  getScrollerSize: function ($renderData, vertical, overflow) {
    
    var $dom = $renderData.$dom,
        style = vertical ? 'Height' : 'Width';
    
    if (!$dom[tau.ui.ROOT_KEY].parentNode) return 0;
    
    if (!vertical && $dom._pullup) {
      return $dom[tau.ui.CONTENT_KEY]['scroll' + style] - $dom._pullup.offsetWidth;  
    }

    return $dom[tau.ui.CONTENT_KEY]['scroll' + style];
  },
  
  /**
   * wrapper 높이를 반환한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Boolean} vertical <code>vScroll</code>이 있는 경우 <code>true<code> 
   *                  <code>hScroll</code>인 경우 <code>false</code>
   * @returns {Number} 
   */  
  getScrollSize: function ($renderData, vertical) {
    var $dom = $renderData.$dom,
        size = 0,
        style = vertical ? 'Height' : 'Width';

    if ($dom._pullup) {
      size = size + $dom._pullup['offset' + style];
    }
    return $dom[tau.ui.ScrollPanel.SCROLLER_KEY]['client' + style] - size;
  },
  
  /**
   * pullDownToRefresh를 상태에 따라 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} pullToRefresh <code>down</code> 혹은 <code>up</code>
   * @param {Boolean} vertical  
   * @param {Number} type 
   *   <ul>
   *    <li>{@link tau.ui.ScrollPanel.PULL_PULLTOREFREH}</li>
   *    <li>{@link tau.ui.ScrollPanel.RELEASE_PULLTOREFREH}</li>
   *    <li>{@link tau.ui.ScrollPanel.LOADING_PULLTOREFREH}</li>
   *    <li>{@link tau.ui.ScrollPanel.COMPLEATE_PULLTOREFREH}</li>
   *   </ul>
   * @param {String} text
   */
  updatePullToRefresh: function ($renderData, pullToRefresh, vertical, type, text) {
    var $dom = $renderData.$dom,
        $base = $renderData.$base,
        key = '_pull' + pullToRefresh,
        pull = $dom[key],
        pullLabel = $dom[key + 'Label'],
        prefix = this.$styleClass['pull' + pullToRefresh],
        template,
        margin = vertical ? 'marginTop' : 'marginLeft';
    
    if (!pull) { // pullDownToRefresh 설정이 되지 않은 경우 DOM Element를 생성
      template = this['_templatePull' + pullToRefresh + 'ToRefresh'];
      
      if (pullToRefresh === 'down') {
        pull = this._createElement($dom, $base, key, 
            template, {refChild: $dom[tau.ui.ScrollPanel.SCROLLER_KEY].firstChild});
      } else {
        pull = this._createElement($dom, $base, key, 
            template, {parentKey: tau.ui.ScrollPanel.SCROLLER_KEY});
      }
      tau.util.dom.addClass(pull, vertical ? this.$styleClass.vertical : 
        this.$styleClass.horizontal, this.$styleClass['pull' + pullToRefresh]);
      
      pullLabel = pull.childNodes[1];
      $dom[key + 'Label'] = pullLabel;
    }
    
    switch (type) {
    case tau.ui.ScrollPanel.PULL_PULLTOREFREH:
      tau.util.dom.removeClass(pull, this.$styleClass.loading, prefix);
      tau.util.dom.removeClass(pull, this.$styleClass.release, prefix);
      pullLabel.innerHTML = text;
      $dom[tau.ui.ScrollPanel.SCROLLER_KEY].style[margin] = 0;
      break;
    case tau.ui.ScrollPanel.RELEASE_PULLTOREFREH:
      tau.util.dom.addClass(pull, this.$styleClass.release, prefix);
      pullLabel.innerHTML = text;
      break;
    case tau.ui.ScrollPanel.LOADING_PULLTOREFREH:
      pullLabel.innerHTML = text;
      tau.util.dom.replaceClass(pull, this.$styleClass.release, this.$styleClass.loading, prefix);
      if (pullToRefresh === 'down') {
        $dom[tau.ui.ScrollPanel.SCROLLER_KEY].style[margin] = 
          this.getPullToRefreshSize($renderData, pullToRefresh, vertical) + 'px';
      } else {
        $dom[tau.ui.ScrollPanel.SCROLLER_KEY].style[margin] = 
          -this.getPullToRefreshSize($renderData, pullToRefresh, vertical) + 'px';
      }
      break;
    case tau.ui.ScrollPanel.COMPLEATE_PULLTOREFREH:
      tau.util.dom.removeClass(pull, this.$styleClass.loading, prefix);
      pullLabel.innerHTML = text;
      $dom[tau.ui.ScrollPanel.SCROLLER_KEY].style[margin] = 0 ;
      if (pullToRefresh === 'up') {
        if (!vertical) {
          $dom._pullup.style.left = this.getScrollerSize($renderData, false) + 'px';  
        } else {
          $dom._pullup.style.top = this.getScrollerSize($renderData, true) + 'px';
        }
      } 
      break;
    }
  },
  
  /**
   * horizontal인 경우 pullUpToRefresh 위치를 설정해 준다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   */
  initPullUpToRefresh: function ($renderData, vertical) {
    var $dom = $renderData.$dom,
      style = vertical ? 'top' : 'left',
      offset = $dom._pullup.style[style];

    if (!offset) {
      $dom._pullup.style[style] = this.getScrollerSize($renderData, vertical) + 'px';
    }
  },
  
  /**
   * pullToRefresh height 반환
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} pullToRefresh <code>down</code> 혹은 <code>up</code>
   * @param {Boolean} vertical
   * @returns {Number}
   */
  getPullToRefreshSize: function ($renderData, pullToRefresh, vertical) {
    var $dom = $renderData.$dom, 
        size;

    if (pullToRefresh === 'up') {
      size = $dom._pullup[vertical ? 'offsetHeight' : 'offsetWidth'];
    } else {
      size = $dom._pulldown[vertical ? 'offsetHeight' : 'offsetWidth'];
    }
    return size;
  }  
  
}, tau.ui.ScrollPanel.$super.renderer);

/**
 * Renders Table
 * @class
 * @private
 */
tau.ui.Table.prototype.renderer = tau.mixin({
  /** @lends tau.ui.Table.prototype.renderer.prototype*/

  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-table',

  /**
   * style Class 
   * <p />
   * template에서 사용하는 style Class를 정의한다.
   */
  $styleClass: tau.mixin({
    hasfooter: '-hasfooter',
    hasheader: '-hasheader',
    hasmore: '-hasmore',
    more: '-more',
    header: '-header',
    footer: '-footer',
    paginationbar: 'tau-paginationbar',
    page: '-page'
  }, tau.ui.Table.$super.renderer.$styleClass),
  
  _templateHeader: ['<hedaer class=${base}${header}></header>'],
  _templateFooter: ['<footer class=${base}${footer}></footer>'],
  _templatePage: ['<div class=${base}${page}></div>'],
  _templateMore: ['<div class=${base}${more}></div>'],

  /**
   * $dom의 key가 추가될 parent DOM element를 반환한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} key $dom 키값 
   * @param {Boolean} [createElement=true] 
   * @returns {HTMLElement}
   * @see tau.ui.BaseRenderer.getParentElement
   */
  getParentElement: function ($renderData, key, createElement) {
    var $dom = $renderData.$dom,
        $base = $renderData.$base;
    switch (key) {
    case tau.ui.Table.HEADER_KEY:
      if (!createElement) {
        return $dom[key];
      } else {
        return this._createElement($dom, $base, tau.ui.Table.HEADER_KEY, this._templateHeader, 
            {refChildKey: tau.ui.ScrollPanel.WRAPPER_KEY});
      }
    case tau.ui.Table.FOOTER_KEY:
      if (!createElement) {
        return $dom[key];
      } else {
        return this._createElement($dom, $base, tau.ui.Table.FOOTER_KEY, this._templateFooter);
      }
    case tau.ui.Table.PAGINATION_KEY:
      return $dom[tau.ui.ScrollPanel.WRAPPER_KEY];
    case tau.ui.Table.MORE_KEY:
      if (!createElement) {
        return $dom[key];
      } else {
        return this._createElement($dom, $renderData.$base, tau.ui.Table.MORE_KEY, this._templateMore, { 
          parentKey: tau.ui.ScrollPanel.SCROLLER_KEY});
      }
    default:
      return tau.ui.Table.$super.renderer.getParentElement.apply(this, arguments);
    }
  },
  
  /**
   * 스타일 속성을 수정한다.
   * <p />
   * 반환값이 <code>false</code>인 경우에는 root DOM element에 스타일을 적용하지 않는다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} attr 스타일 속성
   * @param {String} value 스타일 값
   * @param {String} [rootId] root DOM Element ID. style rule을 추가할 때 필요한 값.  
   * @returns {Boolean} <code>true</code>이면 root dom에 반영한다.
   * @see tau.ui.BaseRenderer.updateStyle
   */
  updateStyle: function ($renderData, attr, value, rootId) {
    var $dom = $renderData.$dom,
         renderer;
    switch(attr){
      case 'cellHeight':
        if (value === 'auto'){
          tau.util.dom.addClass($dom[tau.ui.ROOT_KEY], 'auto');
        } else {
          tau.util.dom.removeClass($dom[tau.ui.ROOT_KEY], 'auto');
          // FIXME 사용자가 tableCell의 baseStyleClass를 바꾼 경우 문제가 있음.
          renderer = tau.ui.TableCell.prototype.renderer;
          this.addStyleRule(rootId, " .tau." + renderer.$base, "height:" + value, true);
        }
        return false;
      case 'cellLeftItemWidth':
        renderer = tau.ui.TableCell.prototype.renderer;
        this.addStyleRule(rootId, " ." + renderer.$base + 
            renderer.$styleClass.leftitem,  "width:" + value, true);
        return false;
      case 'cellRightItemWidth':
        renderer = tau.ui.TableCell.prototype.renderer;
        this.addStyleRule(rootId, " ." + renderer.$base + 
            renderer.$styleClass.rightitem,  "width:" + value, true);
      return false;
    }
    return true;
  },
  
  /**
   * 스크롤러 높이 혹은 너비를 반환한다.
   * <p />
   * 내부적으로 스크롤러에 포함되어 있는 컨텐츠의 크기를 고려해서 스크롤러 높이를 설정한후에 반환한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Boolean} vertical <code>vScroll</code>이 있는 경우 <code>true<code> 
   *                  <code>hScroll</code>인 경우 <code>false</code> 
   * @param {String} [overflow=hidden]
   *  <ul>
   *    <li>visible</li>
   *    <li>hidden</li>
   *  </ul>
   * @returns {Number}
   * @overrides
   */
  getScrollerSize: function ($renderData, vertical, overflow) {
    
    var size = tau.ui.Table.$super.renderer.getScrollerSize.apply(this, arguments); 

    if (!vertical) return size;
    
    if (size) {
      var moreCell = $renderData.$dom[tau.ui.Table.MORE_KEY];
      if (moreCell) size = size + moreCell.offsetHeight;
    }
    return size;
  },
  
  /**
   * horizontal인 경우 pullUpToRefresh 위치를 설정해 준다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   */
  initPullUpToRefresh: tau.emptyFn,  
  
  /**
   * 페이지에 해당하는 리스트의 DOM element를 반환한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Number} pageNo
   * @param {Boolean} [append]
   * @returns {HTMLElement}
   */
  getPageNode: function ($renderData, pageNo, append) {
    var $dom = $renderData.$dom,
        parent = $dom[tau.ui.CONTENT_KEY],
        pageNodes = parent.getElementsByClassName('$' + pageNo),
        curPageNode = pageNodes[0];
    if (!curPageNode){
      curPageNode = this._createElement($dom, $renderData.$base, null, this._templatePage, { 
        parentElement: tau.isUndefined(append) || append ? parent : null});
      tau.util.dom.addClass(curPageNode, '$' + pageNo);
    }
    return curPageNode;
  },  

  /**
   * 페이지네이션바의 위치를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} dock
   *  <ul>
   *    <li>{@link tau.ui.PaginationBar.TOP_DOCK}</li>
   *    <li>{@link tau.ui.PaginationBar.BOTTOM_DOCK}</li>
   *    <li>{@link tau.ui.PaginationBar.LEFT_DOCK}</li>
   *    <li>{@link tau.ui.PaginationBar.RIGHT_DOCK}</li>
   *  </ul>
   * @param {Boolean} refresh
   */
  updatePaginationDock: function ($renderData, dock, refresh) {
    var $dom = $renderData.$dom, 
        base = $renderData.$base + this.$styleClass.content + '-',
        content = $dom[tau.ui.CONTENT_KEY];
    
    tau.util.dom.addClass(content, dock, base);
    
    if (refresh){
      switch (dock) {
      case tau.ui.PaginationBar.TOP_DOCK:
        tau.util.dom.removeClass(content, tau.ui.PaginationBar.RIGHT_DOCK, base);
        tau.util.dom.removeClass(content, tau.ui.PaginationBar.BOTTOM_DOCK, base);
        tau.util.dom.removeClass(content, tau.ui.PaginationBar.LEFT_DOCK, base);
        break;
      case tau.ui.PaginationBar.BOTTOM_DOCK:
        tau.util.dom.removeClass(content, tau.ui.PaginationBar.TOP_DOCK, base);
        tau.util.dom.removeClass(content, tau.ui.PaginationBar.LEFT_DOCK, base);
        tau.util.dom.removeClass(content, tau.ui.PaginationBar.RIGHT_DOCK, base);
        break;
      case tau.ui.PaginationBar.LEFT_DOCK:
        tau.util.dom.removeClass(content, tau.ui.PaginationBar.BOTTOM_DOCK, base);
        tau.util.dom.removeClass(content, tau.ui.PaginationBar.TOP_DOCK, base);
        tau.util.dom.removeClass(content, tau.ui.PaginationBar.RIGHT_DOCK, base);
        break;
      case tau.ui.PaginationBar.RIGHT_DOCK:
        tau.util.dom.removeClass(content, tau.ui.PaginationBar.TOP_DOCK, base);
        tau.util.dom.removeClass(content, tau.ui.PaginationBar.BOTTOM_DOCK, base);
        tau.util.dom.removeClass(content, tau.ui.PaginationBar.LEFT_DOCK, base);
        break;
      }
    }
  },
  
  /**
   * 하단에 텍스트를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} text
   */
  updateFooter: function ($renderData, text){
    var elem = this.getParentElement($renderData, tau.ui.Table.FOOTER_KEY, true);
    elem.innerHTML = text;
  },
  
  /**
   * 상단 텍스트를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} text
   */
  updateHeader: function ($renderData, text){
    var elem = this.getParentElement($renderData, tau.ui.Table.HEADER_KEY, true);    
    elem.innerHTML = text;
  },
  
  /**
   * 페이지에 해당하는 리스트페이지를 업데이트 한다.
   * <p />
   * 이전 페이지는 감추고 새로운 페이지는 보여준다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Number} activePageNo
   * @param {Number} [prevPageNo]
   * @return {Boolean} 페이지에 해당하는 리스드 노드가 없는 경우 <code>true</code>
   */
  updatePage: function ($renderData, activePageNo, prevPageNo) {
    var $dom = $renderData.$dom,
        activePageNode = this.getPageNode($renderData, activePageNo, false),
        prevPageNode;
    
    if (prevPageNo){
      prevPageNode = this.getPageNode($renderData, prevPageNo, false);
    }
    
    if (prevPageNode && prevPageNode !== activePageNode){
      tau.util.dom.removeClass(prevPageNode, this.$styleClass.page + '-selected', $renderData.$base);
    }
    if (activePageNode){
      tau.util.dom.addClass(activePageNode, this.$styleClass.page + '-selected', $renderData.$base);
    }
    if (!activePageNode.parentNode){
      $dom[tau.ui.CONTENT_KEY].appendChild(activePageNode);
      return true;
    }
    return false;
  },
  
  getTableSectionFromIndexChar: function ($renderData, indexChar) {
    var $dom = $renderData.$dom,
        container = $dom[tau.ui.CONTENT_KEY],
        section = container.getElementsByClassName(indexChar)[0];
    
    if (section) {
      return decodeURIComponent(section.getAttribute('data-section'));
    }
    return null; 
  }
}, tau.ui.Table.$super.renderer);


/**
 * Renders TableSection
 * @class
 * @private
 */
tau.ui.TableSection.prototype.renderer = tau.mixin({
  /** @lends tau.ui.TableSection.prototype.renderer.prototype*/

  ROTATE90:new tau.fx.Animation({
    to: {'-webkit-transform': 'rotate(-90deg)'}
  }, {duration: 500, override:true}),
  
  ROTATE0:new tau.fx.Animation({
    to: {'-webkit-transform': 'rotate(0deg)'}
  }, {duration: 500, override:true}),
  
  OPEN:new tau.fx.Animation({
    to: {'height': 'auto'}
  }, {delay: 500, override:true}),
  
  CLOSE:new tau.fx.Animation({
    to: {'height': '0'}
  }, {delay: 500, override:true}),


  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-tablesection',

  /**
   * style Class 
   * <p />
   * template에서 사용하는 style Class를 정의한다.
   */
  $styleClass: {
    container: '-container',
    content: '-content',
    header: '-header',
    arrow: '-arrow',
    bar: '-bar',
    fold: '-fold',
    accordion: '-accordion',
    close: '-close'
  },

  /** 
   * html template
   * style class는 <code>${key}</code>로 묶어서 표시한다.
   * {@link $base}, {@link $styleClass}에 설정되어 있는 style class가 <code>${key}</code>를 대체한다.
   */
  _template: ['<section>',
                '<div class=${base}${container}>',
                  '<h1 class=${base}${header}></h1>',
                  '<div class=${base}${arrow}></div>',
                  '<div class=${base}${bar}></div>',
                '</div>',
                '<ul class=${base}${content}></ul>', 
              '</section>'],
  
  _templateFoldbutton: ['<div class=${base}${fold}></div>'],
  
  /**
   * $dom 구조를 설정한다.
   * <p/> 
   * 최상위 {@link tau.ui.ROOT_KEY}를 제외한 나머지에 대해서 설정하면 된다.
   * @param {Object} $dom key에 해당하는 DOM Element를 가지는 객체
   * @param {String} $base base style class
   * @param {HTMLElement} root root가 되는 DOM Element
   * @see tau.ui.BaseRenderer._initializeDOM
   */
  _initializeDOM: function ($dom, $base, root) {
    $dom[tau.ui.TableSection.HEADER_KEY] = root.firstChild.firstChild;
    $dom[tau.ui.TableSection.BAR_KEY] = root.firstChild;
    $dom[tau.ui.CONTENT_KEY] = root.childNodes[1];
  },


  /**
   * TableSection이 추가되어야할 이전 DOM element를 찾아서 반환한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {HTMLElement} parent
   * @param {String} id
   * @returns {HTMLElement}
   */
  getPrevNode: function ($renderData, parent, section) {
    var findNode = null, 
        lastChild,
        $base = $renderData.$base;
    
    parent = parent.getElementsByClassName($base)[0];
    if (parent) {
      lastChild = parent.parentNode.lastChild;
    } else {
      return null;
    }

    section = encodeURIComponent(section);
    
    if (lastChild && lastChild.getAttribute('data-section') > section && 
        tau.util.dom.hasClass(lastChild, $base)){
      
      while(lastChild && lastChild.getAttribute('data-section') > section && 
          tau.util.dom.hasClass(lastChild, $base)){
        findNode = lastChild;
        lastChild = lastChild.previousSibling;
      }
      return findNode;
    }
    return null;
  },
  
  /**
   * 섹션 텍스트를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} text
   * @param {String} char
   */
  updateGroupstring: function ($renderData, text) {
    var $dom = $renderData.$dom;
    
    $dom[tau.ui.ROOT_KEY].setAttribute('data-section', encodeURIComponent(text));

    if (text === null) {
      this.releaseElement($renderData, tau.ui.TableSection.BAR_KEY);
    } else {
      $dom[tau.ui.TableSection.HEADER_KEY].innerHTML = decodeURIComponent(text);
    }
  },
  
  /**
   * 인덱스바에 대한 인덱스를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} oldChar
   * @param {String} newChar
   */
  updateIndexChar: function ($renderData, oldChar, newChar) {
    var $dom = $renderData.$dom;
    tau.util.dom.replaceClass($dom[tau.ui.ROOT_KEY], oldChar, newChar);
  },

  /**
   * 섹션을 펴고 접힐수 있는 여부를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Boolean} foldable 펼치고 접을 수 있는지 여부
   */
  setFoldable: function ($renderData, foldable){
    var $dom = $renderData.$dom,
        $base = $renderData.$base;
    
    if (foldable) {
      if (!$dom[tau.ui.TableSection.FOLD_KEY]) {
        $dom[tau.ui.TableSection.FOLD_KEY] = this._createElement($dom, $base, 
            tau.ui.TableSection.FOLD_KEY, this._templateFoldbutton, 
            {parentKey: tau.ui.TableSection.BAR_KEY});
        tau.util.dom.addClass($dom[tau.ui.ROOT_KEY], this.$styleClass.accordion, $base);
      }
    } else {
      this.releaseElement($renderData, tau.ui.TableSection.FOLD_KEY);
    }
  },
  
  /**
   * 섹션을 펴고 접힐수 있는 여부를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Boolean} folded 펼칠지 여부
   * @param {Function} [callbackFn] open, close하고 난 후에 호출되는 콜백함수
   * @param {Boolean} [animated=false] animation 여부
   */
  setFolded: function ($renderData, folded, callbackFn, animated){
    var $dom = $renderData.$dom,
        $base = $renderData.$base,
        elem = $dom[tau.ui.TableSection.FOLD_KEY],
        root = $dom[tau.ui.ROOT_KEY], 
        option1 = {onEnd: callbackFn, override:true}, 
        option2 = {override:true};
    
    if (!elem) {
      return;
    }
    
    if (!animated) {
      option1.delay = 0;
      option2.duration = '1ms';
    }
    
    if (!folded){
      tau.util.dom.removeClass(root, this.$styleClass.close, $base);
      tau.ui.TableSection.prototype.renderer.OPEN.animate($dom[tau.ui.CONTENT_KEY], option1);
      tau.ui.TableSection.prototype.renderer.ROTATE90.animate(elem, option2);
    } else {
      tau.util.dom.addClass(root, this.$styleClass.close, $base);
      tau.ui.TableSection.prototype.renderer.CLOSE.animate($dom[tau.ui.CONTENT_KEY], option1);
      tau.ui.TableSection.prototype.renderer.ROTATE0.animate(elem, option2);
    }
  }
  
}, tau.ui.TableSection.$super.renderer);

  
/**
 * Renders IndexBar
 * @class
 * @private
 */
tau.ui.IndexBar.prototype.renderer = tau.mixin({
  /** @lends tau.ui.IndexBar.prototype.renderer.prototype*/

  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-indexbar',

  /**
   * style Class 
   * <p />
   * template에서 사용하는 style Class를 정의한다.
   */
  $styleClass: {
    content: '-content',
    index: '-index'
  },

  /** 
   * html template
   * style class는 <code>${key}</code>로 묶어서 표시한다.
   * {@link $base}, {@link $styleClass}에 설정되어 있는 style class가 <code>${key}</code>를 대체한다.
   */
  _template: ['<nav>',
                '<ol class=${base}${content}></ol>',
              '</nav>'],
              
  _templateIndex: ['<li class=${base}${index}></li>'],

  /**
   * $dom 구조를 설정한다.
   * <p/> 
   * 최상위 {@link tau.ui.ROOT_KEY}를 제외한 나머지에 대해서 설정하면 된다.
   * @param {Object} $dom key에 해당하는 DOM Element를 가지는 객체
   * @param {String} $base base style class
   * @param {HTMLElement} root root가 되는 DOM Element
   * @see tau.ui.BaseRenderer._initializeDOM
   */
  _initializeDOM: function ($dom, $base, root) {
    $dom[tau.ui.CONTENT_KEY] = root.firstChild;
  },
  
  /**
   * 인덱스를 랜더링한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Array} indexes
   */
  renderIndex: function ($renderData, indexes) {
    var $dom = $renderData.$dom,
        text, id, elem, 
        fragment = document.createDocumentFragment();

    for (var i=0, len = indexes.length; i < len; i++){
      text = indexes[i];
      if (text === '*'){
        id = encodeURIComponent(text) + i;
      } else{
        id = encodeURIComponent(text);
      }
      elem = this._createElement($dom, $renderData.$base, id, this._templateIndex, {parentElement: fragment});
      elem.setAttribute('id', id);
      elem.innerHTML = text;
      delete $dom[id];
    }
    $dom[tau.ui.CONTENT_KEY].appendChild(fragment);
  },
  
  
  /**
   * 현재 선택되어 있는 인덱스를 반환한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {HTMLElement} elem
   * @returns {String}
   */
  getSelectedIndex: function ($renderData, elem) {
    var $dom = $renderData.$dom,
        root = $dom[tau.ui.ROOT_KEY], 
        container = $dom[tau.ui.CONTENT_KEY],
        element, selectedIndex,
        indexElement = container.firstChild,
        height = tau.util.dom.getXY(root)[1] + (root.offsetHeight / 2), x, y;
    
    if (!indexElement){
      return null;
    }

    x = tau.util.dom.getXY(indexElement)[0] + indexElement.offsetWidth / 2;
    y = elem.pageY;

    element = document.elementFromPoint(x, y);

    if (element && 
        element.parentNode === container){
      selectedIndex = element.id;
    } else if (element === container){
      if (y < height){
        selectedIndex = indexElement.id;
      } else {
        selectedIndex = container.lastChild.id;
      }
    }
    return selectedIndex;
  }
}, tau.ui.IndexBar.$super.renderer);

/**
 * Renders TableCell
 * @private
 */
tau.ui.TableCell.prototype.renderer = tau.mixin({
  /** @lends tau.ui.TableCell.prototype.renderer.prototype*/

  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-tablecell',

  /**
   * style Class 
   * <p />
   * template에서 사용하는 style Class를 정의한다.
   */
  $styleClass: {
    contentitem: '-contentitem',
    title: '-title',
    subtitle: '-subtitle',
    leftitem: '-leftitem',
    rightitem: '-rightitem'
  },

  /** 
   * html template
   * style class는 <code>${key}</code>로 묶어서 표시한다.
   * {@link $base}, {@link $styleClass}에 설정되어 있는 style class가 <code>${key}</code>를 대체한다.
   */
  _template: ['<li>',
                '<div class=${base}${contentitem}></div>',
              '</li>'],
              
  _templateTitle: ['<div class=${base}${title}></div>'],
  
  _templateSubtitle: ['<div class=${base}${subtitle}></div>'],
  
  _templateLeftitem: ['<div class=${base}${leftitem}></div>'],
  
  _templateRightitem: ['<div class=${base}${rightitem}></div>'],
  
  /**
   * renderer 내부에서 사용하는 $dom의 key
   * {@link tau.ui.TableCell.LEFT_KEY}의 parent가 되는 key
   */
  _LEFT_PARENT_KEY: '_left_parent',

  /**
   * renderer 내부에서 사용하는 $dom의 key
   * {@link tau.ui.TableCell.RIGHT_KEY}의 parent가 되는 key
   */
  _RIGHT_PARENT_KEY: '_right_parent',

  /**
   * $dom 구조를 설정한다.
   * <p/> 
   * 최상위 {@link tau.ui.ROOT_KEY}를 제외한 나머지에 대해서 설정하면 된다.
   * @param {Object} $dom key에 해당하는 DOM Element를 가지는 객체
   * @param {String} $base base style class
   * @param {HTMLElement} root root가 되는 DOM Element
   * @see tau.ui.BaseRenderer._initializeDOM
   */
  _initializeDOM: function ($dom, $base, root) {
    $dom[tau.ui.CONTENT_KEY] = root.firstChild;
  },
  
  /**
   * $dom의 key가 추가될 parent DOM element를 반환한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} key $dom 키값
   * @param {Boolean} [createElement=false] 
   * @returns {HTMLElement}
   * @see tau.ui.BaseRenderer.getParentElement
   */
  getParentElement: function ($renderData, key, createElement) {
    var $dom = $renderData.$dom,
        $base = $renderData.$base;
    switch (key) {
    case tau.ui.CONTENT_KEY:
      return $dom[key];
    case tau.ui.TableCell.LEFT_KEY:
      if (createElement) {
        this._createElement($dom, $base, this._LEFT_PARENT_KEY, 
            this._templateLeftitem, {refChildKey: tau.ui.CONTENT_KEY});
      }
      return $dom[this._LEFT_PARENT_KEY];
    case tau.ui.TableCell.RIGHT_KEY:
      if (createElement) {
        this._createElement($dom, $base, this._RIGHT_PARENT_KEY, 
            this._templateRightitem);
      }
      return $dom[this._RIGHT_PARENT_KEY];
    default:
      return tau.ui.TableCell.$super.renderer.getParentElement.apply(this, arguments);
    }
  },
  
  /**
   * 스타일 속성을 수정한다.
   * <p />
   * 반환값이 <code>false</code>인 경우에는 root DOM element에 스타일을 적용하지 않는다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} attr 스타일 속성
   * @param {String} value 스타일 값
   * @param {String} [rootId] root DOM Element ID. style rule을 추가할 때 필요한 값.  
   * @returns {Boolean} <code>true</code>이면 root dom에 반영한다.
   * @see tau.ui.BaseRenderer.updateStyle
   */
  updateStyle: function ($renderData, attr, value, rootId) {
    var styleClass;
        
    switch(attr){
      case 'cellLeftItemWidth':
        styleClass = $renderData.$styleClass;
        styleClass = styleClass ? styleClass.leftitem || 
            this.$styleClass.leftitem : this.$styleClass.leftitem;
        this.addStyleRule(rootId, " ." + $renderData.$base + styleClass,  
            "width:" + value, true);
        return false;
      case 'cellRightItemWidth':
        styleClass = $renderData.$styleClass;
        styleClass = styleClass ? styleClass.rightitem || 
            this.$styleClass.rightitem : this.$styleClass.rightitem;
        this.addStyleRule(rootId, " ." + $renderData.$base + styleClass,
            "width:" + value, true);
      return false;
    }
    return true;
  },  
  
  /**
   * 제목, 부제목을 clear한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   */
  clearContentItem: function ($renderData){
    var $dom = $renderData.$dom;
    $dom[tau.ui.CONTENT_KEY].innerHTML = null;
  },
  
  /**
   * 제목을 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} title
   */
  updateTitle: function ($renderData, title){
    var elem = this._createElement($renderData.$dom, $renderData.$base, tau.ui.TableCell.TITLE_KEY, 
        this._templateTitle, {parentKey: tau.ui.CONTENT_KEY});
    elem.innerHTML = title || '';
  },
  
  /**
   * 부제목을 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} subtitle
   */
  updateSubtitle: function ($renderData, subtitle){
    var elem = this._createElement($renderData.$dom, $renderData.$base, tau.ui.TableCell.SUBTITLE_KEY, 
        this._templateSubtitle, {parentKey: tau.ui.CONTENT_KEY});
    elem.innerHTML = subtitle || '';
  }
  
}, tau.ui.TableCell.$super.renderer);

/**
 * Renders Panel
 * @class
 * @private
 */
tau.ui.Panel.prototype.renderer = tau.mixin({
  /** @lends tau.ui.Panel.prototype.renderer.prototype*/
  
  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-panel'
}, tau.ui.Panel.$super.renderer);

/**
 * Renders TextView
 * @class
 * @private
 */
tau.ui.TextView.prototype.renderer = tau.mixin({
  /** @lends tau.ui.TextView.prototype.renderer.prototype*/
  
  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-textview',

  /**
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} text
   */
  updateText: function ($renderData, text) {
    var $dom = $renderData.$dom;
    text = text || '';
    $dom[tau.ui.CONTENT_KEY].innerHTML = text.replace(/\n/gi, '<br />');
  }
}, tau.ui.TextView.$super.renderer);

/**
 * Renders Slider
 * @class
 * @private
 */
tau.ui.Slider.prototype.renderer = tau.mixin({
  /** @lends tau.ui.Slider.prototype.renderer.prototype*/

  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-slider',

  /**
   * style Class 
   * <p />
   * template에서 사용하는 style Class를 정의한다.
   */
  $styleClass: {
    container: '-container',
    horizontal: '-horizontal',
    vertical: '-vertical',
    beforebar: '-beforebar',
    thumb: '-thumb',
    afterbar: '-afterbar'
  },

  /** 
   * html template
   * style class는 <code>${key}</code>로 묶어서 표시한다.
   * {@link $base}, {@link $styleClass}에 설정되어 있는 style class가 <code>${key}</code>를 대체한다.
   */
  _template: ['<div class=${base}>', 
                '<div class=${base}${container}>',
                  '<div class=${base}${beforebar}></div>',
                  '<div class=${base}${thumb}></div>',
                  '<div class=${base}${afterbar}></div>',
                 '</div>', 
              '</div>'],
  
  /**
   * $dom 구조를 설정한다.
   * <p/> 
   * 최상위 {@link tau.ui.ROOT_KEY}를 제외한 나머지에 대해서 설정하면 된다.
   * @param {Object} $dom key에 해당하는 DOM Element를 가지는 객체
   * @param {String} $base base style class
   * @param {HTMLElement} root root가 되는 DOM Element
   * @see tau.ui.BaseRenderer._initializeDOM
   */
  _initializeDOM: function ($dom, $base, root) {
    var container = root.firstChild; 
    $dom[tau.ui.CONTENT_KEY] = container;
    $dom[tau.ui.Slider.BEFOREBAR_KEY] = container.firstChild;
    $dom[tau.ui.Slider.THUMB_KEY] = container.childNodes[1];
    $dom[tau.ui.Slider.AFTERBAR_KEY] = container.childNodes[2];
  },
  
  /**
   * slider를 vertical로 출력할지 여부를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Boolean} vertical
   */
  updateVertical: function ($renderData, vertical){
    var $dom = $renderData.$dom,
        root = $dom[tau.ui.ROOT_KEY];
    if (vertical){
      tau.util.dom.replaceClass(root, this.$styleClass.horizontal, 
          this.$styleClass.vertical, $renderData.$base);
    } else {
      tau.util.dom.replaceClass(root, this.$styleClass.vertical, 
          this.$styleClass.horizontal, $renderData.$base);
    }
  },
  
  /**
   * thumb 위치를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Boolean} vertical
   * @param {Number} position
   */
  updateThumb: function ($renderData, vertical, position){
    var $dom = $renderData.$dom,
        thumb = $dom[tau.ui.Slider.THUMB_KEY];
    if(vertical){
      tau.util.style($dom[tau.ui.Slider.BEFOREBAR_KEY], 'height', 
          (thumb.offsetHeight + position) + 'px');
      tau.util.style(thumb, 'top', position + 'px');
    } else {
      tau.util.style($dom[tau.ui.Slider.BEFOREBAR_KEY], 'width', 
          (thumb.offsetWidth + position) + 'px');
      tau.util.style(thumb, 'left', position + 'px');
    }
  },
  
  /**
   * Slider의 fixed 위치를 반환한다.
   * <p />
   * <ul>
   *  <li><code>horizontal</code>: left position</li>
   *  <li><code>vertical</code>: top position</li>
   * </ul>
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Boolean} vertical
   * @param {HTMLElement} touch
   * @returns {Number}
   */
  getThumbPosition: function ($renderData, vertical, touch){
    var $dom = $renderData.$dom;
    if (touch){
      var position = tau.util.dom.getXY($dom[tau.ui.CONTENT_KEY]);
      if(vertical){
        return touch.pageY - position[1];
      } else {
        return touch.pageX - position[0];
      }
    } else {
      return vertical ? 
          $dom[tau.ui.Slider.THUMB_KEY].offsetTop :
          $dom[tau.ui.Slider.THUMB_KEY].offsetLeft;
    }
    return 0;
  },

  /**
   * Slider의 thumb이 이동할 수 있는 거리를 반환한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Boolean} vertical
   * @returns {Number} 
   */
  getRange: function ($renderData, vertical){
    var $dom = $renderData.$dom,
        range;
    if(vertical){
      range = $dom[tau.ui.CONTENT_KEY].offsetHeight - 
      $dom[tau.ui.Slider.THUMB_KEY].offsetHeight;
    } else {
      range = $dom[tau.ui.CONTENT_KEY].offsetWidth - 
      $dom[tau.ui.Slider.THUMB_KEY].offsetWidth;
    }
    return range;
  }
}, tau.ui.Slider.$super.renderer);


/**
 * Renders Switch
 * @private
 */
tau.ui.Switch.prototype.renderer = tau.mixin({
  /** @lends tau.ui.Switch.prototype.renderer.prototype*/

  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-switch',
  
  /**
   * on에 대한 텍스트를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} text
   */
  updateOnText: function ($renderData, text) {
    var $dom = $renderData.$dom;
    $dom[tau.ui.Slider.BEFOREBAR_KEY].innerHTML = text;
  },

  /**
   * off에 대한 텍스트를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} text
   */
  updateOffText: function ($renderData, text) {
    var $dom = $renderData.$dom;
    $dom[tau.ui.Slider.AFTERBAR_KEY].innerHTML = text;
  },
  
  /**
   * thumb 위치를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Boolean} vertical
   * @param {Number} position
   * @see tau.ui.Slider.renderer.updateThumb
   */
  updateThumb: function ($renderData, vertical, position){
    var $dom = $renderData.$dom;
    tau.util.style($dom[tau.ui.Slider.AFTERBAR_KEY], vertical ? 'top' : 'left', 
        position + 'px');
    tau.ui.Switch.$super.renderer.updateThumb.apply(this, arguments);
  }

}, tau.ui.Switch.$super.renderer);


/**
 * Renders TextArea
 * @class
 * @private
 */
tau.ui.TextArea.prototype.renderer = tau.mixin({
  /** @lends tau.ui.TextArea.prototype.renderer.prototype*/
  
  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-textarea',

  /**
   * style Class 
   * <p />
   * template에서 사용하는 style Class를 정의한다.
   */
  $styleClass: tau.mixin({
    control: '-control'
  }, tau.ui.TextArea.$super.renderer.$styleClass),
  
  _templateControl: ['<textarea class=${base}${control}>',
// TODO               tau.rt.isIPhone ? ' style="overflow: scroll; -webkit-overflow-scrolling: touch;" ' : '', '>',
                     '</textarea>'],

  /**
   * $dom 구조를 설정한다.
   * <p/> 
   * 최상위 {@link tau.ui.ROOT_KEY}를 제외한 나머지에 대해서 설정하면 된다.
   * @param {Object} $dom key에 해당하는 DOM Element를 가지는 객체
   * @param {String} $base base style class
   * @param {HTMLElement} root root가 되는 DOM Element
   * @see tau.ui.BaseRenderer._initializeDOM
   */
  _initializeDOM: function ($dom, $base, root) {
    tau.ui.Table.$super.renderer._initializeDOM.apply(this, arguments);
    this._createElement($dom, $base, tau.ui.TextArea.CONTROL_KEY, 
        this._templateControl, {parentKey: tau.ui.ScrollPanel.WRAPPER_KEY});
  },

  /**
   * 편집모드인지 확인한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @returns {Boolean}
   */
  isEditMode: function ($renderData) {
    var $dom = $renderData.$dom;
    return ($dom[tau.ui.TextArea.CONTROL_KEY].style.display !== 'none');
  },

  /**
   * 보기모드로 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   */
  updateViewMode: function ($renderData) {
    var $dom = $renderData.$dom, 
        elem = $dom[tau.ui.TextArea.CONTROL_KEY];
    $dom[tau.ui.CONTENT_KEY].innerHTML = elem.value.replace(/\n/gi, '<br />');
    elem.blur();
    elem.style.display = 'none';
    $dom[tau.ui.ScrollPanel.SCROLLER_KEY].style.opacity = '1';
  },
  
  /**
   * 현재 입력되어 있는 텍스트를 반환한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @returns {String}
   */
  getText: function ($renderData) {
    var $dom = $renderData.$dom;
    return $dom[tau.ui.TextArea.CONTROL_KEY].value;
  },
  
  /**
   * 편집모드로 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Number} scrollStartY
   */
  updateEditMode: function ($renderData, scrollStartY) {
    var $dom = $renderData.$dom,
        control = $dom[tau.ui.TextArea.CONTROL_KEY];
    $dom[tau.ui.ScrollPanel.SCROLLER_KEY].style.opacity = '0';
    
//    if (!tau.rt.isIPhone) {
//      control.scrollTop = scrollStartY ? Math.abs(scrollStartY) : 0;
//    }
    control.scrollTop = scrollStartY ? Math.abs(scrollStartY) : 0;
    control.style.display = '';
  },
  
  /**
   * focus한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체 
   */
  focus: function ($renderData) {
    $renderData.$dom[tau.ui.TextArea.CONTROL_KEY].focus();
  },

  /**
   * blur한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체 
   */
  blur: function ($renderData) {
    $renderData.$dom[tau.ui.TextArea.CONTROL_KEY].blur();
  },
  
  /**
   * placeholder 텍스트를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} value
   */
  updatePlaceholderLabel: function ($renderData, value) {
    var $dom = $renderData.$dom,
        control = $dom[tau.ui.TextArea.CONTROL_KEY];
    if (value) {
      control.setAttribute('placeholder', value);
    } else if (control.placeholder) {
      control.removeAttribute('placeholder');
    }
  },
  
  /**
   * 텍스트를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} text
   */
  updateText: function ($renderData, text) {
    var $dom = $renderData.$dom;
    $dom[tau.ui.TextArea.CONTROL_KEY].value = text;
    this.updateViewMode($renderData);
  },
  
  /**
   * 스타일 속성을 수정한다.
   * <p />
   * 반환값이 <code>false</code>인 경우에는 root DOM element에 스타일을 적용하지 않는다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} attr 스타일 속성
   * @param {String} value 스타일 값
   * @param {String} [rootId] root DOM Element ID. style rule을 추가할 때 필요한 값.  
   * @returns {Boolean} <code>true</code>이면 root dom에 반영한다.
   * @see tau.ui.BaseRenderer.updateStyle
   */
  updateStyle: function ($renderData, attr, value, rootId){
    var $dom = $renderData.$dom;
    if (attr === 'height' && value.indexOf('%') === -1){
      $dom[tau.ui.TextArea.CONTROL_KEY].style.height = value;
    }
    return true;
  }
}, tau.ui.TextArea.$super.renderer);


/**
 * Renders CheckBox
 * @class
 * @private
 */
tau.ui.Checkbox.prototype.renderer = tau.mixin({
  /** @lends tau.ui.Checkbox.prototype.renderer.prototype*/

  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-checkbox'
}, tau.ui.Checkbox.$super.renderer);

/**
 * Renders Radio
 * @class
 * @private
 */
tau.ui.Radio.prototype.renderer = tau.mixin({
  /** @lends tau.ui.Radio.prototype.renderer.prototype*/

  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-radio',

  /**
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} groupid
   */
  updateGroupid: function ($renderData, groupid){
    var $dom = $renderData.$dom;
    $dom[tau.ui.ROOT_KEY].setAttribute('name', groupid);
  }
  
}, tau.ui.Radio.$super.renderer);


/**
 * Renders RadioGroup
 * @class
 * @private
 */
tau.ui.RadioGroup.prototype.renderer = tau.mixin({
  /** @lends tau.ui.RadioGroup.prototype.renderer.prototype*/

  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-radiogroup',
  /**
   * 선택되어 있는 인덱스를 반환한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} id
   */
  getSelectedIndex: function ($renderData, id) {
    var groupid = $renderData.$dom[tau.ui.ROOT_KEY].id,
        radios = document.getElementsByName(groupid);
    
    for(var i=0, len = radios.length; i < len; i++) {
      if (radios[i].id === id){
        return i;
      }
    }
    return -1;
  }
  
}, tau.ui.RadioGroup.$super.renderer);


/**
 * Renders Carousel
 * @class
 * @private
 */
tau.ui.Carousel.prototype.renderer = tau.mixin({
  /** @lends tau.ui.Carousel.prototype.renderer.prototype*/
  
  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-carousel',
  
  /**
   * vertical로 출력할지 여부를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Boolean} vertical
   */
  updateVertical: function ($renderData, vertical){
    var $dom = $renderData.$dom,
        root = $dom[tau.ui.ROOT_KEY];
    if (vertical){
      tau.util.dom.replaceClass(root, this.$styleClass.horizontal, this.$styleClass.vertical, $renderData.$base);
    } else {
      tau.util.dom.replaceClass(root, this.$styleClass.vertical, this.$styleClass.horizontal, $renderData.$base);
    }
  },
  
  /**
   * 하위 아이템의 크기(너비)를 설정한다.
   * <p /> 
   * <code>vertical</code>여부에 따라 높이, 너비를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Boolean} vertical
   */
  updatePageSize: function ($renderData, vertical) {
    var $dom = $renderData.$dom,
        root = $dom[tau.ui.ROOT_KEY], 
        child = $dom[tau.ui.CONTENT_KEY].firstChild,
        style, size;
    
    if (vertical){
      style = 'height';
      size = root.clientHeight + 'px';
    } else {
      style = 'width';
      size = root.clientWidth + 'px';
    }
    
    while(child){
      child.style[style] = size;
      child = child.nextSibling;
    }
  }
}, tau.ui.Carousel.$super.renderer);

/**
 * Renders CarouselIndicator
 * @class
 * @private
 */
tau.ui.CarouselIndicator.prototype.renderer = tau.mixin({
  /** @lends tau.ui.CarouselIndicator.prototype.renderer.prototype*/

  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-carousel-indicator',

  /**
   * style Class 
   * <p />
   * template에서 사용하는 style Class를 정의한다.
   */
  $styleClass: {
    selected: '-button-selected',
    indexvisible: '-indexvisible'
  },

  /** 
   * html template
   * style class는 <code>${key}</code>로 묶어서 표시한다.
   * {@link $base}, {@link $styleClass}에 설정되어 있는 style class가 <code>${key}</code>를 대체한다.
   */
  _template: ['<nav></nav>'],
  
  /**
   * 현재 이동방향을 반환한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {HTMLElement} target
   * @param {Boolean} vertical
   * @returns {String} 이동방향
   *  <ul>
   *    <li>next</li>
   *    <li>prev</li>
   *  </ul>
   */
  getDirection: function ($renderData, target, vertical) {
    var $dom = $renderData.$dom,
        $base = $renderData.$base,
        button = $dom[tau.ui.ROOT_KEY].getElementsByClassName($base + this.$styleClass.selected)[0], 
        direction = 'next';
    
    if (button){
      var xy = tau.util.dom.getXY(button);
      if (vertical){
        position = parseFloat(xy[1] + 
            button.offsetHeight / 2);
        if (target.clientY < position){
          direction = 'prev';
        } else if (target.clientY === position){
          direction = null;
        }
      } else {
        position = parseFloat(xy[0] + 
            button.offsetWidth / 2);
        if (target.clientX < position){
          direction = 'prev';
        } else if (position === target.clientX){
          direction = null;
        }
      }
      return direction;
    }
  },
  
  /**
   * CarouselIndicator 버튼 인덱스를 표시할지 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Boolean} indexvisible
   */
  updateIndexVisible: function ($renderData, indexvisible) {
    var $dom = $renderData.$dom,
        $base = $renderData.$base;
    
    if (indexvisible) {
      tau.util.dom.addClass($dom[tau.ui.ROOT_KEY], this.$styleClass.indexvisible, $base);
    } else {
      tau.util.dom.removeClass($dom[tau.ui.ROOT_KEY], this.$styleClass.indexvisible, $base); 
    }
  }
}, tau.ui.CarouselIndicator.$super.renderer);

/**
 * Renders ToolBar
 * @class
 * @private
 */
tau.ui.ToolBar.prototype.renderer = tau.mixin({
  /** @lends tau.ui.ToolBar.prototype.renderer.prototype*/
  
  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-toolbar',
  
  /**
   * toolbar의 위치를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} dock
   *   <ul>
   *    <li>{@link tau.ui.ToolBar.TOP_DOCK}</li>
   *    <li>{@link tau.ui.ToolBar.BOTTOM_DOCK}</li>
   *   </ul>
   */
  updateDock: function ($renderData, dock) {
    var $dom = $renderData.$dom,
        toolbars, top, length, 
        root = $dom[tau.ui.ROOT_KEY],
        parent = root.parentNode,
        height = root.offsetHeight;

    toolbars = parent.getElementsByClassName($renderData.$base + '-' + dock);
    top = parseFloat(parent.style['padding-' + dock]) || 0, 
    length = toolbars.length ? toolbars.length : 0;
    
    parent.style['padding-' + dock] = top + height + 'px';
    root.style[dock] = length * height + 'px';
    tau.util.dom.addClass(root, '-' + dock, $renderData.$base);
  },
  
  /**
   * 스타일 속성을 수정한다.
   * <p />
   * 반환값이 <code>false</code>인 경우에는 root DOM element에 스타일을 적용하지 않는다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} attr 스타일 속성
   * @param {String} value 스타일 값
   * @param {String} [rootId] root DOM Element ID. style rule을 추가할 때 필요한 값.  
   * @returns {Boolean} <code>true</code>이면 root dom에 반영한다.
   * @see tau.ui.BaseRenderer.updateStyle
   */
  updateStyle: function ($renderData, attr, value, rootId) {
    var $dom = $renderData.$dom;
    switch(attr){
      case 'top':
        $dom[tau.ui.ROOT_KEY].style.marginTop = value;
        return false;
      case 'bottom':
        $dom[tau.ui.ROOT_KEY].style.marginBottom = value;
        return false;
    }
    return true;
  }

}, tau.ui.ToolBar.$super.renderer);

/**
 * Renders Space
 * @class
 * @private
 */
tau.ui.Space.prototype.renderer = tau.mixin({
  /** @lends tau.ui.Space.prototype.renderer.prototype*/

  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-space',

  /**
   * style Class 
   * <p />
   * template에서 사용하는 style Class를 정의한다.
   */
  $styleClass: {
    sep: '-sep',
    flex: '-flex',
    fixed: '-fixed'
  },
  
  /**
   * space 타입을 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} type
   *  <ul>
   *    <li>{@link tau.ui.Space.FIXED}</li>
   *    <li>{@link tau.ui.Space.FLEXIBLE}</li>
   *    <li>{@link tau.ui.Space.SEPARATOR}</li>
   *  </ul>
   * @param {String} [oldType]
   *  <ul>
   *    <li>{@link tau.ui.Space.FIXED}</li>
   *    <li>{@link tau.ui.Space.FLEXIBLE}</li>
   *    <li>{@link tau.ui.Space.SEPARATOR}</li>
   *  </ul>
   */
  updateType: function ($renderData, type, oldType) {
    tau.util.dom.replaceClass($renderData.$dom[tau.ui.ROOT_KEY], oldType, type, 
        $renderData.$base + '-');
  },
  
  /**
   * 스타일 속성을 수정한다.
   * <p />
   * 반환값이 <code>false</code>인 경우에는 root DOM element에 스타일을 적용하지 않는다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} attr 스타일 속성
   * @param {String} value 스타일 값
   * @param {String} [rootId] root DOM Element ID. style rule을 추가할 때 필요한 값.  
   * @returns {Boolean} <code>true</code>이면 root dom에 반영한다.
   * @see tau.ui.BaseRenderer.updateStyle
   */
  updateStyle: function ($renderData, attr, value, rootId){
    var $dom = $renderData.$dom,
        root = $dom[tau.ui.ROOT_KEY];
    switch(attr){
      case 'width': 
        if (tau.util.dom.hasClass(root, this.$styleClass.sep, $renderData.$base)){
          var margin = parseFloat(value);
          if (margin > 0){
            value = value.replace(margin, margin / 2);
            root.style.marginLeft = value ;
            root.style.marginRight = value;
          }
        }
        return false;
    }
    return true;
  }

  
}, tau.ui.Space.$super.renderer);

/**
 * Renders PaginationBar
 * @class
 * @private
 */
tau.ui.PaginationBar.prototype.renderer = tau.mixin({
  /** @lends tau.ui.PaginationBar.prototype.renderer.prototype*/
  
  FADE_OUT:new tau.fx.Animation({
    from: {opacity: 1},
    to: {opacity: 0}
  }, {duration: '3s'}),

  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-paginationbar',

  /**
   * style Class 
   * <p />
   * template에서 사용하는 style Class를 정의한다.
   */
  $styleClass: {
    first: '-first',
    last: '-last',
    prev: '-prev',
    next: '-next',
    page: '-page',
    index: '-index',
    pager: '-pager',
    pageinfo: '-pageinfo'
  },

  /** 
   * html template
   * style class는 <code>${key}</code>로 묶어서 표시한다.
   * {@link $base}, {@link $styleClass}에 설정되어 있는 style class가 <code>${key}</code>를 대체한다.
   */
  _template: ['<div>',
                '<div class=${base}${pager}></div>',
              '</div>'],
              
  _templatePageinfo: ['<div class=${base}${pageinfo}></div>'],
  _templateFirst: ['<div class=${base}${first}></div>'],
  _templateLast: ['<div class=${base}${last}></div>'],
  _templatePrev: ['<div class=${base}${prev}></div>'],
  _templateNext: ['<div class=${base}${next}></div>'],

  /**
   * $dom 구조를 설정한다.
   * <p/> 
   * 최상위 {@link tau.ui.ROOT_KEY}를 제외한 나머지에 대해서 설정하면 된다.
   * @param {Object} $dom key에 해당하는 DOM Element를 가지는 객체
   * @param {String} $base base style class
   * @param {HTMLElement} root root가 되는 DOM Element
   * @see tau.ui.BaseRenderer._initializeDOM
   */
  _initializeDOM: function ($dom, $base, root) {
    $dom[tau.ui.PaginationBar.PAGER_KEY] = root.firstChild;
  },

  
  /**
   * $dom의 key가 추가될 parent DOM element를 반환한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} key $dom 키값
   * @param {Boolean} [createElement=true] 
   * @returns {HTMLElement}
   * @see tau.ui.BaseRenderer.getParentElement
   */
  getParentElement: function ($renderData, key, createElement) {
    var $dom = $renderData.$dom;
    switch (key) {
    case tau.ui.PaginationBar.PAGER_KEY:
      return $dom[key];
    default:
      return tau.ui.PaginationBar.$super.renderer.getParentElement.apply(this, arguments);
    }
  },
  
  /**
   * 맨처음 맨마지막 버튼을 랜더링한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   */
  renderFirstLastButton: function ($renderData) {
    var $dom = $renderData.$dom,
        root = $dom[tau.ui.ROOT_KEY];
    this._createElement($dom, $renderData.$base, tau.ui.PaginationBar.FIRST_KEY, this._templateFirst, 
        {parentElement: root, refChild: root.firstChild});
    this._createElement($dom, $renderData.$base, tau.ui.PaginationBar.LAST_KEY, this._templateLast);
  },
  
  /**
   * 이전 다음 버튼을 랜더링한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   */
  renderPrevNextButton: function ($renderData) {
    var $dom = $renderData.$dom,
        root = $dom[tau.ui.ROOT_KEY];
    this._createElement($dom, $renderData.$base, tau.ui.PaginationBar.PREV_KEY, this._templatePrev, {
      parentElement: root, refChild: $dom[tau.ui.PaginationBar.PAGER_KEY]});
    this._createElement($dom, $renderData.$base, tau.ui.PaginationBar.NEXT_KEY, this._templateNext, {
      parentElement: root, refChild: $dom[tau.ui.PaginationBar.LAST_KEY] || root.lastChild});
  },
  
  /**
   * 페이저를 랜더링한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Number} pageSize
   * @param {String} type
   *  <ul>
   *    <li>{@link tau.ui.PaginationBar.NORMAL_TYPE}</li>
   *    <li>{@link tau.ui.PaginationBar.SLIDER_TYPE}</li>
   *  </ul>
   * @param {String} dock
   *  <ul>
   *    <li>{@link tau.ui.PaginationBar.TOP_DOCK}</li>
   *    <li>{@link tau.ui.PaginationBar.BOTTOM_DOCK}</li>
   *    <li>{@link tau.ui.PaginationBar.LEFT_DOCK}</li>
   *    <li>{@link tau.ui.PaginationBar.RIGHT_DOCK}</li>
   *  </ul>
   * @returns {HTMLElement}
   */
  renderPager: function ($renderData, pageSize, type, dock) {
    var $dom = $renderData.$dom,
        pager = $dom[tau.ui.PaginationBar.PAGER_KEY]; 
    
    type = type || tau.ui.PaginationBar.NORMAL_TYPE;
    tau.util.dom.addClass($dom[tau.ui.ROOT_KEY], '-' + dock, $renderData.$base);

    switch (type) {
    case tau.ui.PaginationBar.NORMAL_TYPE:
      if (pageSize > 0 && !pager.hasChildNodes()){
        var fragment = document.createDocumentFragment(), 
            elem = document.createElement('li');
        tau.util.dom.addClass(elem, this.$styleClass.index, $renderData.$base);
        while(pageSize--){
          fragment.insertBefore(elem.cloneNode(false));
        }
        pager.appendChild(fragment);
      }
      break;
    case tau.ui.PaginationBar.SLIDER_TYPE:
      this._createElement($dom, $renderData.$base, '_pageinfo', this._templatePageinfo);
      break;
    }
    return pager;
  },
  
  /**
   * 페이지 업데이트
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Number} start
   * @param {Number} end
   * @param {Number} active
   * @param {Number} preActive
   * @param {Number} pageSize
   * @param {String} type
   *  <ul>
   *    <li>{@link tau.ui.PaginationBar.NORMAL_TYPE}</li>
   *    <li>{@link tau.ui.PaginationBar.SLIDER_TYPE}</li>
   *  </ul>
   */
  updatePage: function ($renderData, start, end, active, preActive, pageSize, type) {
    var $dom = $renderData.$dom,
         type = type || tau.ui.PaginationBar.NORMAL_TYPE,
         pager = $dom[tau.ui.PaginationBar.PAGER_KEY];
     
     if (type === tau.ui.PaginationBar.NORMAL_TYPE) {
       if (!pager || !pager.hasChildNodes()){
         pager = this.renderPager($renderData, pageSize, type);
       }
       for (var i=0, pageNo = start, pageNode = pager.firstChild; pageNode; pageNode = pageNode.nextSibling, i++, pageNo++){
         if (preActive === i && pageNo !== active) {
           tau.util.dom.removeClass(pageNode, this.$styleClass.index + '-selected', 
               $renderData.$base);
         } else if (pageNo === active){
           tau.util.dom.addClass(pageNode, this.$styleClass.index + '-selected', 
               $renderData.$base);
         }
         
         if (pageNo > end){
           pageNode.style.display = 'none';
         } else {
           pageNode.innerHTML = pageNo;
           pageNode.style.display = '';
         }
       }
     } else if (type === tau.ui.PaginationBar.SLIDER_TYPE){
       this.updatePageInfo($renderData, active);
     }
   },
   
  /**
   * 현재 선택된 페이지 정보를 보여준다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Number} pageNo
   */
  updatePageInfo: function ($renderData, pageNo) {
    var $dom = $renderData.$dom, 
        elem = this._createElement($dom, $renderData.$base, '_pageinfo', 
            this._templatePageinfo);
    elem.innerHTML = 'p. ' + pageNo;
    this.FADE_OUT.animate(elem);
    // TODO animation 수정해야함. anim?
   },
   
  /**
   * <code>elem</code>에 해당하는 페이지 번호를 반환한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {HTMLElement} elem
   * @returns
   */
  getPageNo: function ($renderData, elem) {
    var $dom = $renderData.$dom;
    elem = tau.util.dom.getElementNode(elem);
     if ($dom[tau.ui.PaginationBar.PAGER_KEY] === elem.parentNode){
       tau.util.dom.addClass(elem, this.$styleClass.index + '-selected', 
           $renderData.$base);
       return elem.innerHTML;
     }
     return null;
   }
}, tau.ui.PaginationBar.$super.renderer);


/**
 * Renders SegmentedButton
 * @class
 * @private
 */
tau.ui.SegmentedButton.prototype.renderer = tau.mixin({
  /** @lends tau.ui.SegmentedButton.prototype.renderer.prototype*/

  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-segmentedbutton',
  
  /**
   * style Class 
   * <p />
   * template에서 사용하는 style Class를 정의한다.
   */
  $styleClass: {
    item: '-item',
    vertical: '-vertical',
    horizontal: '-horizontal',
    multiple: '-multiple',
    selected: '-item-selected'
  },
  
  /**
   * vertical로 보여질지 여부를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Boolean} vertical
   */
  updateVertical: function ($renderData, vertical){
    var $dom = $renderData.$dom,
        root = $dom[tau.ui.ROOT_KEY];
    if (vertical){
      tau.util.dom.replaceClass(root, this.$styleClass.horizontal, this.$styleClass.vertical, $renderData.$base);
    } else {
      tau.util.dom.replaceClass(root, this.$styleClass.vertical, this.$styleClass.horizontal, $renderData.$base);
    }
  },
  
  /**
   * 멀티로 선택가능한 여부를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Boolean} multiple
   */
  updateMuliple: function ($renderData, multiple){
    var $dom = $renderData.$dom;
    if (multiple){
      tau.util.dom.addClass($dom[tau.ui.ROOT_KEY], this.$styleClass.multiple, $renderData.$base);
    } else {
      tau.util.dom.removeClass($dom[tau.ui.ROOT_KEY], this.$styleClass.multiple, $renderData.$base);
    }
  },

  /**
   * vertical로 보여진 경우가 아닌 경우
   * maxWidth를 설정해 준다.
   * <p /> 
   * box-flex:1로 되어 있지만 텍스트가 길어지게 되면 자동으로 늘어난다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Number} len
   * @throws {TypeError} 명시된 len이 {Number}가 아닌 경우
   */
  updateWidth: function ($renderData, len) {
    if (!tau.isNumber(len)) {
      throw new TypeError(len + ' is not Number: '
          + this.currentStack());
    }
    var item = $renderData.$styleClass ? $renderData.$styleClass.item || 
        this.$styleClass.item: this.$styleClass.item ;
    
    this.addStyleRule($renderData.$dom[tau.ui.ROOT_KEY].id, ' > .' + 
        $renderData.$base + item, 'width:' + (1 / len * 100) + '%', true);
  }
}, tau.ui.SegmentedButton.$super.renderer);


/**
 * Renders Select
 * @class
 * @private
 */
tau.ui.Select.prototype.renderer = tau.mixin({
  /** @lends tau.ui.Select.prototype.renderer.prototype*/

  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-select',

  /**
   * style Class 
   * <p />
   * template에서 사용하는 style Class를 정의한다.
   */
  $styleClass: {
    control: '-control',
    title: '-control-title',
    mask: '-mask',
    popup: '-popup',
    popuptitle: '-popup-title',
    close: '-popup-close',
    item: '-item',
    multiple: '-multiple',
    selected: '-item-selected',
    full: '-popup-full',
    badge: '-badge',
    badgelabel: '-badge-label',
    arrow: '-popup-arrow'
  },

  /** 
   * html template
   * style class는 <code>${key}</code>로 묶어서 표시한다.
   * {@link $base}, {@link $styleClass}에 설정되어 있는 style class가 <code>${key}</code>를 대체한다.
   */
  _template: [
    '<div>',
      '<div class=${base}${control}><div class=${base}${title}></div></div>',
    '</div>'],

  _templateBadge: [
     '<div class=${base}${badge}>',
       '<span class=${base}${badgelabel}></span>',
     '</div>'],

  _templatePopup: [
    '<div class=${base}${popup} style="display:none">',
      '<div class=${base}${popuptitle} style="display: none">',
        '<h1 style="display: none"></h1>',
      '</div>',
      '<div class=${base}${arrow}></div>',
    '</div>'],

 /**
  * $dom 구조를 설정한다.
  * <p/> 
  * 최상위 {@link tau.ui.ROOT_KEY}를 제외한 나머지에 대해서 설정하면 된다.
  * @param {Object} $dom key에 해당하는 DOM Element를 가지는 객체
  * @param {String} $base base style class
  * @param {HTMLElement} root root가 되는 DOM Element
  * @see tau.ui.BaseRenderer._initializeDOM
  */
  _initializeDOM: function ($dom, $base, root) {
    var popup = this._createElement($dom, $base, tau.ui.Select.POPUP_KEY, 
        this._templatePopup, {parentElement: document.createDocumentFragment()}),
        titleContainer = popup.firstChild;

    $dom[tau.ui.Select.CONTROL_KEY] = root.firstChild;
    $dom[tau.ui.Select.CLOSE_KEY] = titleContainer;
    
    $dom._title = $dom[tau.ui.Select.CONTROL_KEY].firstChild;
    $dom._titleContainer = titleContainer;
    $dom._popupTitle = titleContainer.firstChild;
  },

  /**
   * $dom의 key가 추가될 parent DOM element를 반환한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} key $dom 키값
   * @param {Boolean} [createElement=true]
   * @returns {HTMLElement}
   * @see tau.ui.BaseRenderer.getParentElement
   */
  getParentElement: function ($renderData, key, createElement) {
    var $dom = $renderData.$dom;
    switch (key) {
    case tau.ui.Select.POPUP_KEY:
    case tau.ui.Select.CLOSE_KEY:
      return $dom[key];
    default:
      return tau.ui.Select.$super.renderer.getParentElement.apply(this, arguments);
    }
  },  
  
  /**
   * DOM element가 $dom의 property 명을 반환한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {HTMLElement} elem 반환할 DOM element
   * @returns {String}
   */
  getElemPropertyName: function ($renderData, elem) {
    var $dom = $renderData.$dom;
    elem = tau.util.dom.getElementNode(elem);
    if (elem){
      if (elem === $dom._title || elem === $dom._badge || elem.parentNode === $dom._badge){
        return tau.ui.Select.CONTROL_KEY;
      }
      return tau.ui.Select.$super.renderer.getElemPropertyName($renderData, elem);
    }
    return null;
  },
  
  /**
   * popup을 fullscrenn으로 보여줄지 여부를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Boolean} fullScreen
   */
  updateFullScreen: function ($renderData, fullScreen){
    var $dom = $renderData.$dom,
        $base = $renderData.$base,
        popup = $dom[tau.ui.Select.POPUP_KEY];
    if (fullScreen){
      tau.util.dom.addClass(popup, this.$styleClass.full, $base);
      popup.style.height = tau.getHeight() - 8 + 'px';
      popup.style.width = tau.getWidth() - 8 + 'px';
    } else {
      tau.util.dom.removeClass(popup, this.$styleClass.full, $base);
    }
  },
  
  /**
   * 멀티로 선택가능한 여부를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Boolean} multiple
   * @overrides
   */
  updateMuliple: function ($renderData, multiple){
    var $dom = $renderData.$dom;
    if (multiple){
      tau.util.dom.addClass($dom[tau.ui.Select.POPUP_KEY], this.$styleClass.multiple, $renderData.$base);
    } else {
      tau.util.dom.removeClass($dom[tau.ui.Select.POPUP_KEY], this.$styleClass.multiple, $renderData.$base);
    }
  },  
  
  /**
   * 현재 선택된 아이템 개수를 배지에 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} value
   */
  updateBadge: function ($renderData, value) {
    var $dom = $renderData.$dom,
        $base = $renderData.$base,
        elem = $dom._badge;
    if (!elem && value){
      elem = this._createElement($dom, $base, '_badge', this._templateBadge, {parentKey: tau.ui.Select.CONTROL_KEY});
      $dom._badgeLabel = elem.firstChild;
    }
    if (value){
      $dom._badgeLabel.innerHTML = value;
      elem.style.display = '';
    } else if (elem){
      elem.style.display = 'none';
    }
  },
  
  /**
   * popup의 제목을 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} title
   */
  updatePopupTitle: function ($renderData, title, visible) {
    var $dom = $renderData.$dom,
        popupTitle = $dom._popupTitle;
    
    if (visible) $dom._titleContainer.style.display = visible ? '' : 'none';
    
    if (title){
      popupTitle.innerHTML = title;
      popupTitle.style.display = '';
    } else {
      popupTitle.style.display = 'none';
      popupTitle.innerHTML = null;
    }
  },

  /**
   * popup을 보여준다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   */
  showPopup: function ($renderData) {
    var $dom = $renderData.$dom,
        $base = $renderData.$base,
        popup = $dom[tau.ui.Select.POPUP_KEY], 
        popupStyle = popup.style;
    
    // popup이 full 모드인지 구분해서 처리한다.
    
    if (tau.util.dom.hasClass(popup, this.$styleClass.full, $base)) {
      popupStyle.bottom = 0;
      popupStyle.top = 0;
      popupStyle.left = 0;
      popupStyle.right = 0;
    } else {

      var control = $dom[tau.ui.Select.CONTROL_KEY],
        height = tau.getHeight(),
        width = tau.getWidth(),
        xy = tau.util.dom.getXY(control), 
        x, y;

      if ((y = xy[1]) > height / 2){
        popupStyle.bottom = (height - y) + 'px';
        popupStyle.top = 'auto';
      } else {
        popupStyle.bottom = 'auto';
        popupStyle.top = (y + control.offsetHeight) + 'px';
      }
      
      if ((x=xy[0]) > width / 2){
        popupStyle.right = (width - x - control.offsetWidth) + 'px';
        popupStyle.left = 'auto';
      } else {
        popupStyle.right = 'auto';
        popupStyle.left = x + 'px';
      }
    }
    // FIXME
    //$dom[tau.ui.Select.MASK_KEY].style.display = '';
    popupStyle.display = '';
  },
  
  /**
   * popup을 닫는다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   */
  closePopup: function ($renderData) {
    var $dom = $renderData.$dom;
    // FIXME
    //$dom[tau.ui.Select.MASK_KEY].style.display = 'none';
    $dom[tau.ui.Select.POPUP_KEY].style.display = 'none';
  },
  
  /**
   * 선택된 아이템의 텍스트를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} title
   */
  updateTitle: function ($renderData, title){
    var $dom = $renderData.$dom;
    $dom._title.innerHTML = title || null;
  },
  
  /**
   * @see tau.ui.Segmentedbutton.renderer.updateVertical
   * @overrides
   */
  updateVertical: tau.emptyFn,
  
  /**
   * @see tau.ui.Segmentedbutton.renderer.updateWidth
   * @overrides
   */
  updateWidth: tau.emptyFn
  
}, tau.ui.Select.$super.renderer);


/**
 * Renders Dialog
 * @class
 * @private
 */
tau.ui.Dialog.prototype.renderer = tau.mixin({
  /** @lends tau.ui.Dialog.prototype.renderer.prototype*/

  OPEN: new tau.fx.Transition(),

  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-dialog',
  
  /**
   * style Class 
   * <p />
   * template에서 사용하는 style Class를 정의한다.
   */
  $styleClass: tau.mixin({
    popup: '-popup',
    popuptitle: '-popup-title',
    close: '-popup-close',
    full: '-popup-full',
    arrow: '-popup-arrow',
    content: '-content',
    small: '-small',
    large: '-large' 
  }, tau.ui.Dialog.$super.renderer.$styleClass),
  
  /** 
   * html template
   * style class는 <code>${key}</code>로 묶어서 표시한다.
   * {@link $base}, {@link $styleClass}에 설정되어 있는 style class가 <code>${key}</code>를 대체한다.
   */
  _template: [
    '<div>',
      '<div class=${base}${popup} style="display: none">',
        '<div class=${base}${popuptitle} style="display: none">',
          '<div class=${base}${close} style="display: none"></div>',
          '<h1 style="display: none"></h1>',
        '</div>',
        '<div class=${base}${arrow} style="display: none"></div>',
      '</div>',
    '</div>'],
  
  /**
   * $dom 구조를 설정한다.
   * <p/> 
   * 최상위 {@link tau.ui.ROOT_KEY}를 제외한 나머지에 대해서 설정하면 된다.
   * @param {Object} $dom key에 해당하는 DOM Element를 가지는 객체
   * @param {String} $base base style class
   * @param {HTMLElement} root root가 되는 DOM Element
   * @see tau.ui.BaseRenderer._initializeDOM
   */
  _initializeDOM: function ($dom, $base, root) {
    var  popup = root.childNodes[0],
        panel,
        titleContainer = popup.firstChild;
    
    $dom[tau.ui.Dialog.POPUP_KEY] = popup;
    $dom[tau.ui.Dialog.CLOSE_KEY] = titleContainer.firstChild;
    $dom._titleContainer = titleContainer;
    $dom._popupTitle = titleContainer.childNodes[1];
    $dom._arrow = popup.childNodes[1];
    
    panel = this._createElement($dom, $base + this.$styleClass.content, tau.ui.CONTENT_KEY, 
        tau.ui.Dialog.$super.renderer._template, {parentKey: tau.ui.Dialog.POPUP_KEY});
    panel.className = $base + this.$styleClass.content;
    tau.ui.Dialog.$super.renderer._initializeDOM($dom, $base, panel);
  },
  
  /**
   * $dom의 key가 추가될 parent DOM element를 반환한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} key $dom 키값 
   * @param {Boolean} [createElement=true]
   * @returns {HTMLElement}
   * @see tau.ui.BaseRenderer.getParentElement
   */
  getParentElement: function ($renderData, key, createElement) {
    var $dom = $renderData.$dom;
    switch (key) {
    case tau.ui.Dialog.POPUP_KEY:
      return $dom[key];
    default:
      return tau.ui.Dialog.$super.renderer.getParentElement.apply(this, arguments);
    }
  },  

  /**
   * popup을 닫는 버튼을 보여줄지 여부를 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {Boolean} show
   */
  updateCloseBtn: function ($renderData, show){
    var $dom = $renderData.$dom;
    $dom[tau.ui.Dialog.CLOSE_KEY].style.display = show ? '' : 'none';
    if (show || $dom._popupTitle.innerHTML){
      $dom._titleContainer.style.display = '';
    } else {
      $dom._titleContainer.style.display = 'none';
    }
  },

  /**
   * popup의 제목을 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} title
   */
  updatePopupTitle: function ($renderData, title) {
    var $dom = $renderData.$dom,
        titleElem = $dom._popupTitle;
    if (title){
      titleElem.innerHTML = title;
      titleElem.style.display = '';
      $dom._titleContainer.style.display = '';
    } else {
      if ($dom[tau.ui.Dialog.CLOSE_KEY].style.display === 'none'){
        $dom._titleContainer.style.display = 'none';
      }
      titleElem.style.display = 'none';
      titleElem.innerHTML = null;
    }
  },

  /**
   * <code>elem</code>근처에 popup을 보여준다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {HTMLElement} elem
   */
  showby: function ($renderData, elem) {
    var $dom = $renderData.$dom,
        popup = $dom[tau.ui.Dialog.POPUP_KEY],
        root = $dom[tau.ui.ROOT_KEY],
        style = popup.style,
        arrowStyle = $dom._arrow.style,
        styleText = [],
        arrowStyleText = [];
    
    root.style.opacity = 0;
    root.style.display = null;
    
    if (!elem){
      style.cssText = '';
      arrowStyle.cssText = '';
      tau.util.dom.replaceClass(root, this.$styleClass.small, 
          this.$styleClass.large, $renderData.$base);
      return;  
    }
    tau.util.dom.replaceClass(root, this.$styleClass.large, 
        this.$styleClass.small, $renderData.$base);
    
    var xy = tau.util.dom.getXY(elem), 
        x = xy[0],
        y = xy[1],
        height = tau.getHeight(),
        width = tau.getWidth(),
        elemWidth = elem.offsetWidth;

    if (y > height / 2){
      styleText.push('bottom:', height - y + 20, 'px;');
      arrowStyleText.push('border-top-color: inherit;');
      arrowStyleText.push('bottom:-20px;');
    } else {
      styleText.push('top:', y + 20, 'px;');      
      arrowStyleText.push('border-bottom-color: inherit;');
      arrowStyleText.push('top:-20px;');
    }
    
    if (x > width / 2){
      styleText.push('right:', width - x - elemWidth, 'px;'); 
      arrowStyleText.push('left: 80%;');
    } else if (x > width / 2 - elemWidth / 2 &&
        x < width / 2 + elemWidth / 2){
      styleText.push('left:', width / 2 - elemWidth / 2, 'px;');
      arrowStyleText.push('left: 45%;');
    } else {
      styleText.push('left:', x, 'px;');      
      arrowStyleText.push('left: 10%;');
    }
    
    if (!style.width){
      styleText.push('min-width:', '30%;');
      styleText.push('max-width:', '50%;');
      
    }
    if (!style.height) {
      styleText.push('min-height:', '30%;');
      styleText.push('max-height:', '50%;');
    }
    
    arrowStyle.cssText = arrowStyleText.join('');
    style.cssText = styleText.join('');
    
    if (!style.width){
      style.width = '50%';
    }
    if (!style.height) {
      style.height = '50%';
    }
  },
  
  /**
   * popup을 보여준다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @parm {Object} [opts] 
   * @parm {Boolean} [opts.animated]
   * @parm {tau.fx.Transition} [opts.animation]
   */
  open: function ($renderData, opts) {
    var $dom = $renderData.$dom,
        popup = $dom[tau.ui.Dialog.POPUP_KEY], anim;
    
    if (opts && opts.animated){
      if (opts.animation){
        anim = opts.animation;
      } else {
        anim = tau.ui.Dialog.prototype.renderer.OPEN;
        switch (opts.dir) {
        case tau.ui.DOWN_DIR:
          popup.style.webkitTransform = 'translateY(-100%)';
          break;
        case tau.ui.LEFT_DIR:
          popup.style.webkitTransform = 'translateX(100%)';
          break;
        case tau.ui.RIGHT_DIR:
          popup.style.webkitTransform = 'translateX(-100%)';
          break;
        default:
          popup.style.webkitTransform = 'translateY(100%)';
          break;
        }
        anim.setStyle('-webkit-transform', 'translate3d(0, 0, 0)', {
          onEnd: function (e){
            e.target.style.webkitTransform = '';
          }});
      }
      popup.style.opacity = 1;
      anim.animate(popup);
    } else {
      popup.style.opacity = 1;
    }
    $dom[tau.ui.ROOT_KEY].style.opacity = 1;
  },

  /**
   * popup을 닫는다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   */
  close: function ($renderData) {
    var $dom = $renderData.$dom;
    $dom[tau.ui.Dialog.POPUP_KEY].style.opacity = 0;
  }
}, tau.ui.Dialog.$super.renderer);


/**
 * Renders ActionSheet
 * @class
 * @private
 */
tau.ui.ActionSheet.prototype.renderer = tau.mixin({
  /** @lends tau.ui.ActionSheet.prototype.renderer.prototype*/

  OPEN: new tau.fx.Transition(),

  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-actionsheet',

  /**
   * style Class 
   * <p />
   * template에서 사용하는 style Class를 정의한다.
   */
  $styleClass: {
    mask: '-mask',
    popup: '-popup',
    full: '-popup-full',
    arrow: '-popup-arrow',
    small: '-small',
    large: '-large' ,
    title: '-title'
  },

  /** 
   * html template
   * style class는 <code>${key}</code>로 묶어서 표시한다.
   * {@link $base}, {@link $styleClass}에 설정되어 있는 style class가 <code>${key}</code>를 대체한다.
   */
  _template: ['<div>',
                '<div class=${base}${mask}></div>',
                '<div class=${base}${popup} style="display: none">',
                  '<div class=${base}${arrow} style="display: none"></div>',
                  '<div class=${base}${title} style="display: none"></div>',
                '</div>',
              '</div>'],

  /**
   * $dom 구조를 설정한다.
   * <p/> 
   * 최상위 {@link tau.ui.ROOT_KEY}를 제외한 나머지에 대해서 설정하면 된다.
   * @param {Object} $dom key에 해당하는 DOM Element를 가지는 객체
   * @param {String} $base base style class
   * @param {HTMLElement} root root가 되는 DOM Element
   * @see tau.ui.BaseRenderer._initializeDOM
   */
  _initializeDOM: function ($dom, $base, root) {
    var panel;
    $dom[tau.ui.Dialog.MASK_KEY] = root.childNodes[0];
    $dom[tau.ui.Dialog.POPUP_KEY] = root.childNodes[1];
    $dom._arrow = root.childNodes[1].firstChild;
    $dom._popupTitle = root.childNodes[1].childNodes[1];
    
    panel = this._createElement($dom, $base + this.$styleClass.content, tau.ui.CONTENT_KEY, 
        tau.ui.Dialog.$super.renderer._template, {parentKey: tau.ui.Dialog.POPUP_KEY});
    panel.className = $base + this.$styleClass.content;
    tau.ui.Dialog.$super.renderer._initializeDOM($dom, $base, panel);
  },  
  
  /**
   * $dom의 key가 추가될 parent DOM element를 반환한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} key $dom 키값
   * @param {Boolean} [createElement=true] 
   * @returns {HTMLElement}
   * @see tau.ui.BaseRenderer.getParentElement
   */
  getParentElement: function ($renderData, key, createElement) {
    var $dom = $renderData.$dom;
    switch (key) {
    case tau.ui.Dialog.CLOSE_KEY:
      return $dom[tau.ui.Dialog.POPUP_KEY];
    default:
      return tau.ui.ActionSheet.$super.renderer.getParentElement.apply(this, arguments);
    }
  },    
  
  /**
   * popup을 보여준다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @parm {Object} [opts] 
   * @parm {Boolean} [opts.animated]
   * @parm {tau.fx.Transition} [opts.animation]
   * @see tau.ui.Dialog.renderer.open
   */
  open: function ($renderData, opts) {
    var $dom = $renderData.$dom,
         popup = $dom[tau.ui.Dialog.POPUP_KEY],
         close = $dom[tau.ui.Dialog.POPUP_KEY].childNodes[2],
         closeButtonHeight = close ? close.offsetHeight : 0,
         buttons = $dom[tau.ui.CONTENT_KEY].getElementsByClassName('tau-button'),
         buttonHeight = (buttons && buttons.length) > 0 ? 
             buttons[0].offsetHeight * buttons.length : 0;
    
    if (opts) {
      var height = opts.dom ? $dom[tau.ui.Dialog.POPUP_KEY].offsetHeight : tau.getHeight();
      $dom[tau.ui.CONTENT_KEY].style.maxHeight = height - closeButtonHeight - 10 + 'px';
    }
    popup.style.maxHeight = buttonHeight + closeButtonHeight + 20 + 'px';
    
    tau.ui.ActionSheet.$super.renderer.open.apply(this, arguments);
  },
  
  /**
   * popup의 제목을 설정한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} title
   */
  updatePopupTitle: function ($renderData, title) {
    var $dom = $renderData.$dom,
        titleElem = $dom._popupTitle;
    if (title){
      titleElem.innerHTML = title;
      titleElem.style.display = '';
    } else {
      titleElem.innerHTML = null;
      titleElem.style.display = 'none';
    }
  }
}, tau.ui.ActionSheet.$super.renderer);


/**
 * Renders SequenceNavigator
 * @class
 * @private
 */
tau.ui.SequenceNavigator.prototype.renderer = tau.mixin({

  // Navigation Animations
  ANIM: new tau.fx.Transition({
    timingFunction: 'ease-in-out', 
    duration: tau.rt.hasTouch ? '0.25s' : '0.5s'}),
  ANIM_IN_FADE: new tau.fx.Transition({
    timingFunction: 'ease', 
    duration: tau.rt.hasTouch ? '0.25s' : '0.5s'}),
  ANIM_OUT_FADE: new tau.fx.Transition({
    timingFunction: 'ease', 
    duration: tau.rt.hasTouch ? '0.25s' : '0.5s'}),

  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-sequencenavigator',

  /**
   * style Class 
   * <p />
   * template에서 사용하는 style Class를 정의한다.
   */
  $styleClass: {
    navigationContainer: 'tau-navbar',
    toolbarContainer: 'toolBar', // TODO: 삭제될 예정
    content: '-content',
    hasnavigationbar: 'tau-navbar-padding'
  },

  /** 
   * html template
   * style class는 <code>${key}</code>로 묶어서 표시한다.
   * {@link $base}, {@link $styleClass}에 설정되어 있는 style class가 <code>${key}</code>를 대체한다.
   */
  _template: ['<div class="${base} ${hasnavigationbar}">',
                '<div class=${navigationContainer}></div>',
                '<div class=${toolbarContainer}></div>',
                '<div class=${base}${content}></div>',
              '</div>'],

  /**
   * $dom 구조를 설정한다.
   * <p/> 
   * 최상위 {@link tau.ui.ROOT_KEY}를 제외한 나머지에 대해서 설정하면 된다.
   * @param {Object} $dom key에 해당하는 DOM Element를 가지는 객체
   * @param {String} $base base style class
   * @param {HTMLElement} root root가 되는 DOM Element
   * @see tau.ui.BaseRenderer._initializeDOM
   */
  _initializeDOM: function ($dom, $base, root) {
    $dom[tau.ui.SequenceNavigator.NAVBAR_KEY] = root.childNodes[0];
    $dom[tau.ui.NavigationController.TOOLBAR_KEY] = root.childNodes[1];
    $dom[tau.ui.CONTENT_KEY] = root.childNodes[2];
  },
              
  /**
   * $dom의 key가 추가될 parent DOM element를 반환한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} key $dom 키값
   * @param {Boolean} [createElement=true] 
   * @returns {HTMLElement}
   * @see tau.ui.BaseRenderer.getParentElement
   */
  getParentElement: function ($renderData, key, createElement) {
    var $dom = $renderData.$dom;
    switch (key) {
    case tau.ui.CONTENT_KEY:
      return $dom[key];
    default:
      return tau.ui.BaseRenderer.getParentElement.apply(this, arguments);
    }
  },
  
  /**
   * push을 위한 render.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체 DOM structure
   * @param {Object} pushed 들어오는 Controller 컨텐트
   * @param {Object} active 나가는 Controller 컨텐트
   * @param {function} callbackFn Draw가 완료된 후 호출되는 콜백함수
   */
  renderPush: function ($renderData, pushed, active, callbackFn) {
    var $dom = $renderData.$dom,
        pushedCtrlDOM = pushed.ctrl.getDOM(),
        pushedNavDOM = pushed.nav.getDOM(),
        pushedCtrlDOMWidth = pushedCtrlDOM.offsetWidth;
    
    // Option to disable navigation bar
    if (pushed.opts.hideNavigationBar) {
      $dom[tau.ui.SequenceNavigator.NAVBAR_KEY].style.display = 'none';
      tau.util.dom.removeClass($dom[tau.ui.ROOT_KEY], this.$styleClass.hasnavigationbar);
    } else if (active && !active.opts.hideNavigationBar) {
      $dom[tau.ui.SequenceNavigator.NAVBAR_KEY].style.display = '';
      tau.util.dom.addClass($dom[tau.ui.ROOT_KEY], this.$styleClass.hasnavigationbar);
    }

    if (pushed.nav) {
      //pushedNavDOM.style.display = 'none'; // title max-width를 설정하기 위해 'none'으로 처리하면 안됨.
      pushedNavDOM.style.opacity = 0;
      pushed.nav.draw($dom[tau.ui.SequenceNavigator.NAVBAR_KEY]);
    }
    if (pushed.opts && pushed.opts.animation) {      
      pushedCtrlDOM.style.display = 'none';
      pushedCtrlDOM.style.left = pushedCtrlDOMWidth + 'px'; // Align to the right of active
      pushedCtrlDOM.style.visibility = 'visible';
      pushedCtrlDOM.style.display = null;
      
      // Animate the parent content element
      this.ANIM.setStyle('-webkit-transform', 'translateX(-' + pushedCtrlDOMWidth + 'px)', { 
        onEnd: function (e) {
          active.ctrl.getDOM().style.display  = 'none';
          e.target.style.webkitTransform = null;
          pushedCtrlDOM.style.left  = null;
          callbackFn();
      }
      });

      // Animate incoming/outgoing navigation bars
      this.ANIM_IN_FADE.setStyle('opacity', '1');
      this.ANIM_IN_FADE.setStyle('-webkit-transform', 'translateX(0)', {
        onEnd: function (e) {
          e.target.style.zIndex = null;
        }
      });

      this.ANIM_OUT_FADE.setStyle('opacity', '0');
      this.ANIM_OUT_FADE.setStyle('-webkit-transform', 'translateX(-' + pushedCtrlDOMWidth/2 + 'px)', { 
        onEnd: function (e) {
          e.target.style.display  = 'none';
        }
      });
      
      pushed.nav.setStyles({
        opacity: 0, // prevents nav bar flicker
        zIndex: 1,
        webkitTransform: 'translateX(' +  pushedCtrlDOMWidth/2 + 'px)',
      });
      pushed.nav.setVisible(true);      
      
      
      var self = this;
      
      window.setTimeout(function(){        
        self.ANIM.animate($dom[tau.ui.CONTENT_KEY], {delay:-1});
        self.ANIM_IN_FADE.animate(pushedNavDOM, {delay:-1});
        self.ANIM_OUT_FADE.animate(active.nav.getDOM(), {delay:-1});
      }, 0);      
    } else {
      if (pushed.nav) {
        
        pushed.nav.setStyles({
          opacity: 1,
        });
        pushed.nav.setVisible(true);      
      }
      // Coordinate to same positions even after non-animated push
      if (active && active.ctrl) {
        active.nav.getDOM().style.display = 'none';
      }
      callbackFn();
    }
  },

  /**
   * pop을 위한 render.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체 DOM structure
   * @param {Object} popped 나가는 Controller 컨텐트
   * @param {Object} active 들어오는 Controller 컨텐트
   * @param {function} callbackFn Draw가 완료된 후 호출되는 콜백함수
   */
  renderPop: function ($renderData, popped, active, callbackFn) {
    var $dom = $renderData.$dom,
        activeCtrlDOM, activeCtrlDOMWidth;
    
    // Align incoming/outgoing contents next to each other
    if (active && active.ctrl) {
      activeCtrlDOM = active.ctrl.getDOM();
      activeCtrlDOM.style.left  = '-100%';
    }

    // Option to disable navigation bar
    if (active.opts.hideNavigationBar) {
      $dom[tau.ui.SequenceNavigator.NAVBAR_KEY].style.display = 'none';
      tau.util.dom.removeClass($dom[tau.ui.ROOT_KEY], this.$styleClass.hasnavigationbar);
    } else if (popped && popped.opts.hideNavigationBar) {
      $dom[tau.ui.SequenceNavigator.NAVBAR_KEY].style.display = '';
      tau.util.dom.addClass($dom[tau.ui.ROOT_KEY], this.$styleClass.hasnavigationbar);
    }

    /** @inner Clears navigation bar position and executes callback */
    function doCallback() {
      if (active.nav) { // Properly displays non-animated/hideNavigationBar pops 
        active.nav.setStyles({
          opacity: null,
          left: null
        });
        active.nav.setVisible(true);
      }
      callbackFn();
    }

    if (active.nav) {
      active.nav.setStyles({
        opacity: 0
      });
//      active.nav.setVisible(true);
      active.nav.draw($dom[tau.ui.SequenceNavigator.NAVBAR_KEY]);
    }
    if (active.tool) {
      active.tool.draw($dom[tau.ui.NavigationController.TOOLBAR_KEY]);
      active.tool.getDOM().style.display = '';
    }

    if (popped.opts && popped.opts.animation) {

      // Animate the parent content element
      activeCtrlDOM.style.display  = '';
      activeCtrlDOMWidth = activeCtrlDOM.offsetWidth;
      this.ANIM.setStyle('-webkit-transform', 'translateX(' + activeCtrlDOMWidth + 'px)', { 
        onEnd: function (e) {
          activeCtrlDOM.style.left  = null;
          e.target.style.webkitTransform = null;
          popped.ctrl.getDOM().style.display = 'none';
          callbackFn();
        }
      });

      // Animate incoming/outgoing navigation bars
      if (popped && popped.nav) {
        
        this.ANIM_OUT_FADE.setStyle('opacity', '0');
        this.ANIM_OUT_FADE.setStyle('-webkit-transform', 'translateX(' + activeCtrlDOMWidth / 2 + 'px)', { 
          onEnd: function (e) {
            e.target.style.display  = 'none';
            e.target.style.webkitTransform = null;
          }
        });
        this.ANIM_OUT_FADE.animate(popped.nav.getDOM()); 
      }
      
      this.ANIM_IN_FADE.setStyle('opacity', '1');
      this.ANIM_IN_FADE.setStyle('-webkit-transform', 'translateX(0)', {
        onEnd: function (e) {
          e.target.style.zIndex  = null;
        }
      });
      
      active.nav.setStyles({
        webkitTransform: 'translateX(-' + activeCtrlDOMWidth / 2  +'px)',
        zIndex: 1
      });
      
      active.nav.setVisible(true);
      
      var self = this;
      window.setTimeout(function(){       
        self.ANIM.animate($dom[tau.ui.CONTENT_KEY], {delay:-1});
        self.ANIM_IN_FADE.animate(active.nav.getDOM(), {delay:-1});
      }, 0);
      
    } else {
      // Coordinate to same positions even after non-animated pop
      activeCtrlDOM.style.left = '';
      active.nav.setVisible(true);
      doCallback();
    }
  }
}, tau.ui.BaseRenderer);

/**
 * Renders ParallelNavigator
 * @class
 * @private
 */
tau.ui.ParallelNavigator.prototype.renderer = tau.mixin({

  /**
   * root DOM element에 설정되는 기본 style Class
   */
  $base: 'tau-tabbarnavigator',

  /**
   * style Class 
   * <p />
   * template에서 사용하는 style Class를 정의한다.
   */
  $styleClass: {
    hastabbar: 'tau-hastabbar',
    tabbar: 'tau-tabbar',
    content: '-content'
  },  

  /** 
   * html template
   * style class는 <code>${key}</code>로 묶어서 표시한다.
   * {@link $base}, {@link $styleClass}에 설정되어 있는 style class가 <code>${key}</code>를 대체한다.
   */
  _template: ['<div class="tau ${base} ${hastabbar}">',
                '<div class=${tabbar}></div>',
                '<div class=toolBar></div>',
                '<div class=${base}${content}></div>',
              '</div>'],
  
  /**
   * $dom 구조를 설정한다.
   * <p/> 
   * 최상위 {@link tau.ui.ROOT_KEY}를 제외한 나머지에 대해서 설정하면 된다.
   * @param {Object} $dom key에 해당하는 DOM Element를 가지는 객체
   * @param {String} $base base style class
   * @param {HTMLElement} root root가 되는 DOM Element
   * @see tau.ui.BaseRenderer._initializeDOM
   */
  _initializeDOM: function ($dom, $base, root) {
    $dom[tau.ui.ParallelNavigator.TABBAR_KEY] = root.childNodes[0];
    $dom[tau.ui.NavigationController.TOOLBAR_KEY] = root.childNodes[1];
    $dom[tau.ui.CONTENT_KEY] = root.childNodes[2];
  },

  
  /**
   * $dom의 key가 추가될 parent DOM element를 반환한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   * @param {String} key $dom 키값 
   * @param {Boolean} [createElement=true]
   * @returns {HTMLElement}
   * @see tau.ui.BaseRenderer.getParentElement
   */
  getParentElement: function ($renderData, key, createElement) {
    var $dom = $renderData.$dom;
    switch (key) {
    case tau.ui.ParallelNavigator.TABBAR_KEY:
      return $dom[key];
    default:
      return tau.ui.BaseRenderer.getParentElement.apply(this, arguments);
    }
  },
  
  /**
   * tabbar를 보여준다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   */
  showTabbar: function ($renderData) {
    var $dom = $renderData.$dom;
    $dom[tau.ui.ParallelNavigator.TABBAR_KEY].style.display = '';
    tau.util.dom.addClass($dom[tau.ui.ROOT_KEY], this.$styleClass.hastabbar);
  },

  /**
   * tabbar를 보이지 않게 한다.
   * @param {Object} $renderData base style class와 $dom 구조를 가지는 객체
   */
  hideTabbar: function ($renderData) {
    var $dom = $renderData.$dom;
    $dom[tau.ui.ParallelNavigator.TABBAR_KEY].style.display = 'none';
    tau.util.dom.removeClass($dom[tau.ui.ROOT_KEY], this.$styleClass.hastabbar);
  }

}, tau.ui.BaseRenderer);

/**
 * Renders PopoverController
 * @class
 * @private
 */
tau.ui.PopoverController.prototype.renderer = tau.mixin({
  $base: 'tau-popoverController',
  $styleClass: {
    masking: '-masking',
    content: '-content',
    direction: '-direction'
  },
  _template:['<div class=${base}>',
             '<div class=${base}${direction}></div>',
             '<div class=${base}${content}></div>',
             '<div class=${base}${masking}></div>',
             '</div>'],
             
  _initializeDOM: function ($dom, $base, root) {
    $dom[tau.ui.PopoverController.DIRECTION_KEY] = root.childNodes[0];    
    $dom[tau.ui.PopoverController.CONTENT_KEY] = root.childNodes[1];
    $dom[tau.ui.PopoverController.MASKING_KEY] = root.childNodes[2];
  },
  
  getParentElement: function ($renderData, key, createElement) {
    var $dom = $renderData.$dom;
    switch (key) {
    case tau.ui.PopoverController.CONTENT_KEY:
    case tau.ui.PopoverController.MASKING_KEY:
    case tau.ui.PopoverController.DIRECTION_KEY:
      return $dom[key];
    default:
      return tau.ui.BaseRenderer.getParentElement.apply(this, arguments);
    }
  },
}, tau.ui.BaseRenderer);

/**
 * @class
 * @private
 */
tau.ui.Mask.prototype.renderer = tau.mixin({
  $base: 'tau-mask',
  
  $styleClass: {
    fullscreen: '-fullscreen',
  },
  
  updateFullscreen: function ($renderData, fullscreen) {
    var $dom = $renderData.$dom;
    if (fullscreen) {
      tau.util.dom.addClass($dom[tau.ui.ROOT_KEY], 
          this.$styleClass.fullscreen, $renderData.$base);
    } else {
      tau.util.dom.removeClass($dom[tau.ui.ROOT_KEY], 
          this.$styleClass.fullscreen, $renderData.$base);
    }
  }
}, tau.ui.BaseRenderer);