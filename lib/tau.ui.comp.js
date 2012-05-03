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
tau.namespace('tau.ui', {
  /** 최상위 DOM Element를 가리키는 키값 */
  ROOT_KEY: 'root', 
  /** 하위 DOM Element를 추가할 수 있는 부모 DOM Element를 가리키는 키값 */
  CONTENT_KEY: 'content',
    
  /** 방향: 위로 */
  UP_DIR: 0,
  /** 방향: 아래로 */
  DOWN_DIR: 1,
  /** 방향: 왼쪽로 */
  LEFT_DIR: 2,
  /** 방향: 오른쪽으로 */
  RIGHT_DIR: 3,
  
  /** 인덱스순으로 정렬 */
  INDEX_SORT: 0,
  /** 텍스트순으로 오름차순 정렬 */
  ASC_SORT: 1,
  /** 텍스트순으로 내림차순 정렬 */
  DESC_SORT: 2,
  
  /** id 분리자 */
  ID_SEPARATOR: '__'

});

//------------------------------------------------------------------------------
/** 
 * Drawable은 독립적으로 인스턴스를 생성하지 않고 다른 컴포넌트 클래스에 Mixin
 * 되어 사용된다.
 * UI컴포넌트 객체들을 랜더링하기 위해 사용되는 DOM element를 캡슐화한다. 
 * <p/>
 * {@link tau.ui.Drawable.draw} 함수를 호출하면 객체가 관리하는 DOM element를 
 * 부모 element의 하위 노드로 추가하는 것이다.
 * <br/>
 * 이전에 랜더링한 컨텐트를 클리어하기 위해 {@link tau.ui.Drawable.clear}함수를 
 * 호출해서 부모 DOM element로 부터 관리하고 있는 DOM element를 삭제할 수 있다.
 * <br/>
 * 나머지 멤버 함수들은 객체가 관리하고 있는 DOM element를 조작하는데 도움을 준다.
 * 특히 {@link tau.ui.Drawable.getDOM}함수는 컴포넌트의 UI를 직접 조작하기 위해 
 * 클라이트에서 사용하는 DOM 접근자이다.
 * @name tau.ui.Drawable
 * @class
 */
$class('tau.ui.Drawable').define(
/** @lends tau.ui.Drawable */
{
  /**
   * 현재 인스턴스의 DOM 앨리먼트의 ID를 반환한다. 만약 현재 생성된 DOM 앨리먼트의 ID가
   * 존재하지 않을 경우 새로운 ID를 생성해서 반환하며, 이때 생성된 ID는 현재 인스턴스의
   * DOM 앨리먼트 ID가 된다.
   * <p />
   * DOM Element ID를 반환하기 위해서는 <code>systemId</code>를 <code>true</code>로 설정한다.
   * @param {Boolean} [systemId] 내부 ID를 반환하고자 한다면 <code>true</code>로 설정한다. 
   * @returns {String} DOM 앨리먼트의 ID
   */
  getId: function (systemId) {
    if (!this.$id) {
      /** @private DOM element ID created lazily */
      this.$id = tau.genId();
    }
    return this.$id;
  },
  
  /**
   * 인스턴스가 스크린에 그려졌는지 체크한다.
   * @param {Boolean} [checkDom=false] 실제 DOM element가 id를 가지고 DOM 트리상에 존재하는지
   * 체크할 경우 <code>true</code>를 , 그렇지 않을 경우 <code>false</code>를 전달한다.
   * @returns {Boolean} 이전에 {@see tau.ui.Drawable.draw}가 호출되어 화면에
   * 그려진 상태일 경우 <code>true</code>, 그렇지 않을 경우 <code>false</code>를 반환한다.
   */
  isDrawn: function (checkDom) {
    return !checkDom ? this.$isDrawn : tau.util.dom.elementOf(this.getId(true)) ? true : false;
  },

  /**
   * 인스턴스의 컨텐트를 draw한다.
   * <p/>
   * 기본 {@link tau.ui.Drawable}은 DOM element를 {@link tau.ui.Drawable.getDOM}으로 
   * 가져온 DOM element를 통해 부모 노드의 최상위 위치에 추가한다. 추가한 이후에는 DOM element에 
   * 컨텐츠(id, 스타일 클래스)를 지정한다.
   * <p/>
   * 이 함수를 오버라이딩하려면 부모, 하위 element가 그것의 하위 element들이 그려지기 전에 
   * DOM 트리에 추가되는 것을 보장해야한다.
   * <pre>
   * draw: function (parent, refresh) {
   *   ...
   *   // calling draw will ensure parent & this.getDOM() are attached
   *   if (tau.ui.Drawable.prototype.draw.apply(this, arguments)) {
   *     for (var i = 0; i < children.length; i++) {
   *       children[i].draw(this.getDOM(), refresh); 
   *     }
   *     return true;
   *   }
   *   return false;
   * }
   * </pre>
   * @param {HTMLElement} parent 컨텐츠를 렌더링할 부모 DOM element
   * @param {Boolean} [refresh=false] <code>true</code>일 경우 화면을 refresh한다.
   * @param {HTMLElement} [refChild]컨텐츠를 렌더링할 이전 Child DOM element
   * @returns {Boolean} 실제 컨텐츠가 이 메소드에 의해 draw 되었다면 <code>true</code>. 
   */
  draw: function (parent, refresh, refChild) {
    this.$isDrawn = false;
    
    this.beforeRender(refresh);
    
    // Enables DOM's display and attaches the parent element to the instance's 
    var dom = this.getDOM(), styleClass, $base;

    if (refresh && dom.parentNode && parent !== dom.parentNode) {
      dom.parentNode.removeChild(dom);
    }

    // Do not redraw, unless refreshed above
    if (!this.isDrawn(true)) {
      if (refChild && parent === refChild.parentNode){
        parent.insertBefore(dom, refChild);
      } else if (tau.isNumber(this.$index) && this.$index > -1){
        parent.insertBefore(dom, parent.childNodes[this.$index]);
        delete this.$index;
      } else {
        tau.util.dom.appendChild(parent, dom);
      }
    }
    if (!this.isDrawn()) {
      // Configure the scene's DOM element
      dom.setAttribute('id', this.getId(true));
      if (!tau.util.dom.hasClass(dom, tau.rt.EventDelegator.DOM_CLASS_ID)) {
        dom.className = tau.rt.EventDelegator.DOM_CLASS_ID + ' ' 
        + dom.className;
      }
      $base = this.getBaseStyleClass();
      styleClass = this.getStyleClass();
      tau.util.dom.addClass(dom, $base);
      if (styleClass){
        for (var prop in styleClass){
          tau.util.dom.addClass(dom, styleClass[prop], $base + '-');
        }
      }
    }
    this.render(refresh);
    
    this.afterRender(refresh);
    
    return (this.$isDrawn = true);
  },
  
  /**
   * 랜더링 전처리를 수행한다.
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   */
  beforeRender: function (refresh) {
    //tau.log('beforeRender..', 1, this);
  },
  
  /**
   * 랜더링을 수행한다.
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   */
  render: function (refresh) {
    //tau.log('render..', 1, this);
  },

  /**
   * 랜더링을 후처리를 수행한다.
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   */
  afterRender: function (refresh) {
    //tau.log('afterRender..', 1, this);
  },
  
  /**
   * DOM 트리에서 DOM 참조를 삭제하고 DOM 참조를 다시 설정해 준다.
   */
  clear: function () {
    this.$isDrawn = false;
    var dom = (this._dom) ? this._dom : tau.util.dom.elementOf(this.getId(true));
    if (dom) {
      // Detach DOM element from its parent then remove it altogether 
      tau.util.dom.removeElements(dom);
      if (dom) this._dom = dom; 
    }
  },

  /**
   * DOM 트리에서 DOM 참조를 삭제하고 DOM 참조를 클리어 한다. 
   */
  destroy: function () {
    this.clear();

    this.$id = null;
    
    delete this._dom;
    delete this.$renderData;
  },

  /**
   * 인스턴스의 메인 DOM 기본 스타일 클래스를 반환한다.
   * @returns {String} DOM 노드의 스타일 클래스
   */
  getBaseStyleClass: function () {
    return this._getRenderData().$base;
  },

  /**
   * 인스턴스의 메인 DOM 기본 스타일 클래스를 설정한다.
   * @param {String} baseStyleClass 컴포넌트 스타일 클래스.
   */
  setBaseStyleClass: function (baseStyleClass) {
    this._getRenderData().$base = baseStyleClass;
  },

  /**
   * 인스턴스의 메인 DOM 스타일 클래스를 반환한다.
   * @returns {Object} DOM 노드의 스타일 클래스
   */
  getStyleClass: function () {
    return this._getRenderData().$styleClass;
  },

  /**
   * 인스턴스의 메인 DOM 스타일 클래스를 설정한다.
   * @param {Object} styleClass 컴포넌트 스타일 클래스.
   * @param [styleClass.base] 컴포넌트 기본 스타일 클래스
   * @param [styleClass.shape] 컴포넌트 모양에 대한 스타일 클래스
   * @param [styleClass.degree] 컴포넌트 styleClass.shape에 대해 강, 기본, 약으로 설정.
   * <ul>
   *  <li><code>strong</code></li>
   *  <li><code>weak</code></li>
   * </ul>
   * @param [styleClass.size] 컴포넌트 크기에 대한 스타일 클래스
   * @param [styleClass.type] 컴포넌트 타입에 대한 스타일 클래스
   */
  setStyleClass: function (styleClass) {
    this._getRenderData().$styleClass = tau.mixin({}, styleClass);
  },

  /**
   * 인스턴스 DOM 스타일 클래스를 반환한다. 
   * @param {String} prop 스타일 속성
   * @returns {String} 스타일 클래스
   */
  getStyle: function(prop) {
    var $dom = {};
    $dom[tau.ui.ROOT_KEY] = this.getDOM();
    return tau.ui.BaseRenderer.getStyle.call(this, {$dom: $dom} , prop);
  },

  /**
   * DOM 스타일을 설정한다.
   * @param {Object} styles 스타일 객체
   * @see tau.ui.Drawable.setStyle
   */
  setStyles: function(styles) {
    for ( var prop in styles) {
      if (styles.hasOwnProperty(prop)){
        this.setStyle(prop, styles[prop]);
      }
    }
  },

  /**
   * DOM 스타일을 설정한다.
   * @param {String} attr 스타일 속성
   * @param {String} val 스타일 값
   * @throws {RangeError} 명시된 val이 허용하는 값 범위를 벗어났을 때
   */
  setStyle: function (attr, val) {
    /**
     * TODO: layout이 처리되면 주석을 해제한다.
   * <p />
     * 다음 속성에 대해서는 일부 값만 적용됨을 유의한다.
     * <code>display</code>속성에 대해서는
     * <ul>
     *   <li>'block'</li>
     *   <li>'inline'</li>
     *   <li>'none'</li>
     *   <li>''</li>
     *   <li>null</li>
     * </ul>
     * 값만 허용한다.
     * @ignore
    */
    /*
    if (attr === 'display' && !(val === 'inline' ||  val === 'block' || 
      val === 'none' || !val)) {
        throw new RangeError('display 속성은 "inline", "block", "none", "", null 만 허용합니다.: '.concat(val). 
                concat(this.currentStack()));
  }*/
    
    var dom = this.getDOM();

    if (tau.ui.BaseRenderer.updateStyle.call(this, this._getRenderData(), attr, 
        val, this.getId(true))){
      tau.util.style(dom, attr, val);
    }
  },
  
  /**
   * 랜더링하는데 필요한 정보를 반환한다.
   * <p />
   * @returns {$renderData}
   * <ul>
   *  <li>$renderData.$dom</li>
   *  <li>$renderData.$base</li>
   *  <li>$renderData.$styleClass</li>
   *  <li>$renderData.$style</li>
   * </ul>
   * @private
   */
  _getRenderData: function () {
    if (!this.$renderData) {
      this.$renderData = {$dom: {}, $base: null, $styleClass: {}, $style: {}}; 
      this.$renderData.$dom[tau.ui.ROOT_KEY] = this.getDOM();
    }
    return this.$renderData; 
  },

  /**
   * 인스턴스의 표시여부를 설정한다.
   * @param {Boolean} visible <code>true</code>의 경우 표시한다.
   */
  setVisible: function(visible) {
    this.setStyle('display', visible ? '' : 'none');
  },
  
  /**
   * 현재의 Drawing 객체가 화면에 표시된 상태인지 아닌지를 반환한다.
   * @returns {Boolean} 화면에 출력(표시)된 상태이면 <code>true</code>, 그렇지 않으면 <code>false</code>
   */
  isVisible: function () {
    return !(this.getStyle('display') === 'none') && 
    (this.getDOM().offsetWidth || this.getDOM().offsetHeight); 
  },

  /**
   * {@link tau.ui.Drawable} 인스턴스의 루트 DOM element를 반환한다.
   * <p/>
   * 루트 DOM element가 없는 경우 DOM element를 생성해서 반환한다.
   * <code>key</code>가 있는 경우 해당 키의 parent가 되는 DOM Element를 반환한다.
   * <code>createElement</code>가 <code>true</code>인 경우 parent DOM Element를 생성해서 반환한다.
   * @param {String} key 키값
   * @param {Boolean} [createElement=false] 
   * @returns {HTMLElement} DOM element
   */
  getDOM: function (key, createElement) {
    if (arguments.length == 0 || key === tau.ui.ROOT_KEY || createElement) {
      if (!this._dom) {
        var dom = tau.util.dom.elementOf(this.getId(true));
        if (dom) return dom;

        /** @private DOM element reference instantiated lazily */
        this._dom = document.createElement('div');
      }
      return this._dom;
    }
    return null;
  }
});


//------------------------------------------------------------------------------
/**
 * ContainerDrawable는 독립적으로 인스턴스를 생성하지 않고 다른 컴포넌트 클래스에 Mixin
 * 되어 사용된다.
 * <p/>
 * 컨테이너 하위에 있는 컴포넌트, 아이템을 draw, clear 하는 클래스이다.
 * @name tau.ui.ContainerDrawable
 * @class
 */
$class('tau.ui.ContainerDrawable').define(
/** @lends tau.ui.ContainerDrawable */    
{
  /**
   * draw할 컴포넌트 배열을 반환한다.
   * @returns {tau.ui.Component[]}
   * @private
   */
  getDrawableComponents: function () {
    if (!this.$drawableComponents) {
      this.$drawableComponents = [];
    }
    return this.$drawableComponents;
  },

  /**
   * clear할 컴포넌트 배열을 반환한다.
   * @returns {tau.ui.Component[]}
   * @private
   */
  getClearableComponents: function () {
    if (!this.$clearableComponents) {
      this.$clearableComponents = [];
    }
    return this.$clearableComponents;
  },

  /**
   * 컴포넌트 트리에서 제거된 컴포넌트를 DOM Tree에서 제거한다.
   * @private
   */
  clearRemovedComponents: function () {
    var clearableComponents = this.getClearableComponents();
    for (var i = clearableComponents.length; i--; ){
      clearableComponents[i].clear();
    }
    this.$clearableComponents = null;
  },
  
  /**
   * 컴포넌트 랜더링을 수행한다.
   * @param {tau.ui.Component|Number} comp 컴포넌트 혹은 특정 인덱스
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @throws {TypeError} 명시된 comp가 {@link tau.ui.Component}의 객체가 아닐 경우
   * @throws {RangeError} 명시된 comp가 범위를 벗어났을 때
   * @private
   */
  drawComponent: function (comp, refresh) {
    if (tau.isNumber(comp)) {
      if (comp < 0 || comp > this.getComponents().length) {
        throw new RangeError('Specified index is out of range: '.concat(comp). 
            concat(this.currentStack()));
      }
      comp = this.getComponent(comp);
    }
    if (!(comp instanceof tau.ui.Component)) {
      throw new TypeError(comp + ' is not an instance of tau.ui.Component: '
          + this.currentStack());
    }
    var parent = comp.getParent();
    comp.draw(parent.getDOM(tau.ui.CONTENT_KEY, true), refresh, this.getRefChildDOM(comp));
  },
  
  /**
   * 컴포넌트 배열의 랜더링을 수행한다.
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @private
   */
  drawComponents: function (refresh) {
    this.clearRemovedComponents();
    
    var drawableComponents = this.getDrawableComponents(),
        deferThreshold = tau.isUndefined(this.deferThreshold) ? 
            drawableComponents.length : this.deferThreshold, 
        len = drawableComponents.length < deferThreshold ? 
            drawableComponents.length : deferThreshold;
    
    for (var i = 0; i < len; i++) {
      var comp = drawableComponents.shift();
      if (comp) {
        this.drawComponent(comp, refresh);
      }
    }
    if (drawableComponents.length > 0) {
      window.setTimeout(tau.ctxAware(this.drawComponents, this), 
          this.deferTimeout);
    } else {
      this.drawComponentsDone();
    }
  },
  
  /**
   * 하위 컴포넌트가 랜더링이 완료된 후 처리하기 위한 함수이다.
   * <p /> 
   * 필요한 경우 사용자가 구현해야함.
   * @private 
   */
  drawComponentsDone: tau.emptyFn,
  
  /**
   * 아이템 랜더링을 수행한다.
   * @param {String} key 
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @private
   */
  drawItem: function (key, refresh) {
    var comp = this.getMapItem(key);
    if (comp) {
      var parent = comp.getParent(); 
      comp.draw(parent.getDOM(key, true), refresh, this.getRefChildDOM(key));
    }
  },
  
  /**
   * 기준이 되는 DOM Element를 반환한다.
   * <p /> 
   * <code>refChildDOM</code> 이전에 컴포넌트를 DOM Element를 추가하기 위해서 사용한다. 
   * @param {String|tau.ui.Component} key key값 혹은 컴포넌트
   * @returns {HTMLElement}
   * @see tau.ui.Drawable.draw
   */
  getRefChildDOM: function (key) {
    return null;
  }
});


//------------------------------------------------------------------------------
/**
 * Container는 독립적으로 인스턴스를 생성하지 않고 {@link tau.ui.Drawable} 클래스에 Mixin
 * 되어 사용된다.
 * 컨테이너는 {@link tau.ui.Component} 를 하위로 포함해서 관리하는 클래스이다.
 * <p/>
 * 컴포넌트는 Container 클래스를 mixin해서 composite 컴포넌트를 만들 수 있다.
 * {@link tau.ui.Container.add} 함수를 호출해서 추가한 컴포넌트의 부모/버블링
 * 관계를 설정한다. 
 * @mixins tau.ui.ContainerDrawable
 * @name tau.ui.Container
 * @class
 */
$class('tau.ui.Container').mixin(tau.ui.ContainerDrawable).define(
/** @lends tau.ui.Container */
{
  /**
   * 컴포넌트를 하위 아이템으로 추가한다.
   * <p/>
   * 컴포넌트의 부모/버블링 관계 설정을 하고 
   * 컴포넌트에서 이벤트를 처리하지 않아도 현재 인스턴스에서 처리하도록 한다.
   * <code>immediate</code>가 <code>false</code>인 경우 {@link tau.rt.Event.COMPADDED}
   * 이벤트를 발생시킨다.
   * @param {tau.ui.Component} comp 현재 인스턴스에 추가할 컴포넌트
   * @param {Number} [index] 특정 위치에 컴포넌트 DOM element를 추가한다. 
   * @param {Boolean} [immediate=false]컴포넌트를 바로 draw할지 설정한다. 
   * <code>false</code>이면 객체가 draw할 때 일괄적으로 DOM Tree에 반영된다. 
   * @returns {Boolean} 컴포넌트가 추가가 완료되었다면 <code>true</code>
   * @throws {TypeError} 명시된 comp가 {@link tau.ui.Component}의 객체가 아닐 경우
   * @throws {RangeError} 명시된 index가 범위를 벗어났을 때
   */
  add: function (comp, index, immediate) {
    var delegator = this.getDelegator(),
        children = this.getComponents();

    if (!(comp instanceof tau.ui.Component)) {
      throw new TypeError(comp + ' is not an instance of tau.ui.Component: '
          + this.currentStack());
    }

    if (tau.isNumber(index) && index > children.length) {
      index = null;
    }
    
    if (tau.isNumber(index) && (index < 0 && index != -1)) {
      throw new RangeError('Specified index is out of range: '.concat(index). 
          concat(this.currentStack()));
    }
    
    var success = false;
    
    if (tau.isNumber(index)) {
      if (children.indexOf(comp) == -1) {
        children.splice(index,0, comp);
        success = true;
      }
    } else {
      success = tau.arr(children).pushUnique(comp);
    }
    
    
    if (success) {
      parent = comp.getParent();
      if (parent) {
        parent.remove(comp, immediate);
      }
      
      comp.setParent(delegator);
      comp.setBubble(delegator);

      // FIXME
      if (tau.isNumber(index)) comp.$index = index;
      
      if (tau.arr(this.getDrawableComponents()).pushUnique(comp) && 
          delegator.isDrawn() ){
        if (immediate) {
          this.drawComponents(true);
        } else {
          comp.fireEvent(tau.rt.Event.COMPADDED, {parent: delegator, comp: comp}, -1);
        }
      }
      return true;
    }
    return false;
  },
  
  /**
   * delegator를 반환한다.
   * @returns {tau.ui.Drawable}
   */
  getDelegator: function () {
    return this.$delegator || this;
  },
  
  /**
   * delegator를 설정한다.
   * @param {tau.ui.Drawable} delegator
   * @throws {TypeError} 명시된 파라미터가 tau.ui.Drawable의 객체가 아닐 경우
   */
  setDelegator: function (delegator) {
    if (!delegator || !delegator.isMixinOf(tau.ui.Drawable)) {
      throw new TypeError(delegator + ' is not an instance of tau.ui.Drawable: '
          + this.currentStack());
    }
    this.$delegator = delegator;
  },
  
  /**
   * 인덱스에 해당하는 컴포넌트를 반환한다.
   * @param {Number|String} index 배열 혹은 컴포넌트 ID
   * @throws {RangeError} 명시된 index가 범위를 벗어났을 때
   * @returns {tau.ui.Component} 인덱스에 해당하는 컴포넌트를 반환한다.
   */
  getComponent: function (index) {
    
    if (tau.isString(index)) {
      var array = [];
      var items = this.getMapItems();
      var components = this.getComponents(), comp = null;
      
      if (items) {
        for(var i in items) array.push(items[i]);
      }
      array = array.concat(components);
      
      for(var i=0, len = array.length; i < len; i++) {
        comp = array[i];
        
        if (comp) {
          if (comp.getId(index.indexOf(tau.ui.ID_SEPARATOR) > -1 ? 
              true : false) === index) return comp;
          else if (comp.isMixinOf(tau.ui.Container) && 
              (comp = comp.getComponent(index))) {
            return comp;
          }
          comp = null;
        }
      }
      return comp;
    } else if (tau.isNumber(index)) {
      if (index < 0 || index >= this.getComponents().length) {
        throw new RangeError('Specified index is out of range: '.concat(index). 
            concat(this.currentStack()));
      }
      return this.getComponents()[index];
    } else {
      throw new TypeError(index + ' is not a String or Number' + this.currentStack());
    }
    
  },
  
  /**
   * 순차적인 컴포넌트 리스트를 반환한다.
   * @returns {Array}
   */
  getComponents: function () {
    if (!this.$components) {
      this.$components = [];
    }
    return this.$components;
  },
  
  /**
   * 맵을 반환한다.
   * @returns {Object}
   */
  getMapItems: function () {
    if (!this.$mapItems) {
      this.$mapItems = {};
    }
    return this.$mapItems;
  },
  
  /** Returns the corresponding object for the key name from registry map. */
  getMapItem: function (name) {
    return this.getMapItems()[name];
  },
  
  /**
   * 현재의 Scene에서 명시된 컴포넌트가 존재하는지 조사한다. 만약 존재하면 <code>true</code>
   * 를 그렇지 않으면 <code>false</code>를 반환한다.
   * @param comp
   * @returns {boolean} 명시된 컴포넌트가 현재의 <code>Scene</code>에 존재하면
   * <code>true</code>를 반환한다.
   */
  hasComponent: function (comp) {
    var parent = comp.getParent(); 
    if (this.getDelegator() === parent || (parent instanceof tau.ui.Component 
        && this.hasComponent(parent))) {
      return true;
    }
    return false;
  },
  
  /**
   * 컴포넌트 인덱스를 반환한다.
   * <p />
   * @param {tau.ui.Component} comp 컴포넌트
   * @return {Index} 인덱스
   */
  indexOf: function (comp) {
    var i, index = [-1],
        components = this.getComponents();
    
    if (comp.getParent() === this.getDelegator()) {
      index[0] = components.indexOf(comp);
    } else {
      for (var subIndex = 0, len = components.length; subIndex < len; subIndex++) {
        if (components[subIndex].isMixinOf(tau.ui.Container) && 
            (i = components[subIndex].indexOf(comp)) && i[0] !== -1) {
          index[0] = subIndex;
          index = index.concat(i);
          break;
        }
      }
    }
    return index;
  },
  
  /**
   * 리소스를 해제한다.
   */
  release: function () {
    this.destoryAll();
    delete this.$delegator;
    delete this.$components;
    delete this.$mapItems;
    delete this.$drawableComponents;
    delete this.$clearableComponents;
    tau.log('container destroy..', 1, this);
  },
  
  /**
   * 컴포넌트를 삭제한다.
   * <p/>
   * 컴포넌트의 부모/버블링 관계 설정을 삭제한다.
   * <code>immediate</code>가 <code>false</code>인 경우 {@link tau.rt.Event.COMPREMOVED}
   * 이벤트를 발생시킨다.
   * @param {tau.ui.Component|Number} arg 삭제할 컴포넌트 혹은 인덱스
   * @param {Boolean} [immediate=false] 컴포넌트를 바로 draw할지 설정한다. 
   * <code>false</code>이면 객체가 draw할 때 일괄적으로 DOM Tree에 반영된다. 
   * @returns {Boolean} 컴포넌트가 삭제가 완료되었다면 <code>true</code>
   */
  remove: function (arg, immediate) {
    if (!tau.isUndefined(arg)) {
      var delegator = this.getDelegator(),
          comp, 
          children = this.getComponents(),
          returnVal = false;
      if (arg instanceof tau.ui.Component) {
        comp = arg;
      } else if (tau.isNumber(arg)) {
        comp = children[arg];
      }
      
      if (comp && !(comp instanceof tau.ui.Component)) {
        throw new TypeError(arg + ' is not an instance of tau.ui.Component' +
            'or Number: ' + this.currentStack());
      }
      if (comp.getParent() !== delegator) {
        tau.log.error(arg +' is not a child of '.concat(delegator, this.currentStack()));
        return false;
      }
      
      if (comp.isDrawn()){
        if (immediate) {
          comp.clear();
        } else {
          tau.arr(this.getClearableComponents()).pushUnique(comp);
          comp.fireEvent(tau.rt.Event.COMPREMOVED, {parent: delegator, comp: comp}, -1);
        }
      } else {
        tau.arr(this.getDrawableComponents()).remove(comp);
      }
      comp.removeBubble(delegator);
      comp.setParent(null);
      
      returnVal = tau.arr(children).remove(comp);
      
      if (returnVal)
        return true;
      
      if (!tau.isNumber(arg)) {
        var mapItems = this.getMapItems();
        for(var prop in mapItems) {
          if (mapItems[prop] === comp) {
            return this.removeMapItem(prop, immediate);
          }
        }
      }
    }
    return false;
  },
  
  /**
   * 컴포넌트, 아이템 모두를 삭제한다.
   * <p/>
   * 컴포넌트의 부모/버블링 관계 설정을 삭제한다.
   * @param {Boolean} [immediate=false]컴포넌트를 바로 draw할지 설정한다. 
   * <code>false</code>이면 객체가 draw할 때 일괄적으로 DOM Tree에 반영된다. 
   */
  removeAll: function (immediate) {
    this.removeComponents(immediate);
    this.removeMapItems(immediate);
  },
  
  /**
   * 컴포넌트, 아이템 모두를 삭제한다.
   * <p/>
   * 컴포넌트의 부모/버블링 관계 설정을 삭제한다.
   * @param {Boolean} [immediate=false]컴포넌트를 바로 draw할지 설정한다. 
   * <code>false</code>이면 객체가 draw할 때 일괄적으로 DOM Tree에 반영된다. 
   */
  destoryAll: function () {
    var components = this.getComponents(), comp;
    for(var i=0, len = components.length; i < len; i++) {
      comp = components[i];
      if (comp) comp.destroy();
    }
    for(var prop in this.getMapItems()) {
      comp = this.getMapItem(prop);
      if (comp instanceof tau.ui.Component) comp.destroy();
    }
  },
  
  /**
   * 컴포넌트 모두를 삭제한다.
   * <p/>
   * 컴포넌트의 부모/버블링 관계 설정을 삭제한다.
   * @param {Boolean} [immediate=false]컴포넌트를 바로 draw할지 설정한다. 
   * <code>false</code>이면 객체가 draw할 때 일괄적으로 DOM Tree에 반영된다. 
   */
  removeComponents: function (immediate) {
    for(var i=0, len = this.getComponents().length; i < len; i++) {
      this.remove(0, immediate);
    }
    this.$components = [];
  },
  
  /**
   * 특정 key에 해당하는 아이템을 삭제한다.
   * <p/>
   * 컴포넌트의 부모/버블링 관계 설정을 삭제한다. 
   * @param {String} key 삭제할 아이템 key
   * @param {Boolean} [immediate=false]컴포넌트를 바로 draw할지 설정한다. 
   * <code>false</code>이면 객체가 draw할 때 일괄적으로 DOM Tree에 반영된다. 
   * @returns {Boolean} 컴포넌트가 삭제가 완료되었다면 <code>true</code>
   */
  removeMapItem: function (key, immediate) {
    if (tau.isString(key)) {
      var comp = this.getMapItem(key),
          delegator = this.getDelegator();
      if (comp instanceof tau.ui.Component){
        comp.removeBubble(delegator);
        comp.setParent(null);
        if (comp.isDrawn()){
          if (immediate) {
            comp.clear();
          } else {
            comp.fireEvent(tau.rt.Event.COMPREMOVED, {parent: delegator, comp: comp}, -1);
          }
        }
        return delete this.getMapItems()[key];
      }
    }
    return false;
  },
  
  /**
   * 특정 key에 해당하는 아이템을 삭제한다.
   * <p/>
   * 컴포넌트의 부모/버블링 관계 설정을 삭제한다. 
   * @param {Boolean} [immediate=false]컴포넌트를 바로 draw할지 설정한다. 
   * <code>false</code>이면 객체가 draw할 때 일괄적으로 DOM Tree에 반영된다. 
   */
  removeMapItems: function (immediate) {
    for(var prop in this.getMapItems()) {
      this.removeMapItem(prop, immediate);
    }
    this.$mapItems = {};
  },
  
  /**
   * 존재하는 컴포넌트를 새로운 컴포넌트로 대체한다.
   * @param {Object} oldComponent 제거할 컴포넌트 참조
   * @param {Object} newComponent 대체할 컴포넌트 참조
   * @param {Boolean} [immediate=false]컴포넌트를 바로 draw할지 설정한다.
   * @returns {Boolean} 대체가 되었으면 <code>true</code>
   */
  replace: function (oldComponent, newComponent, immediate) {
    if (newComponent instanceof tau.ui.Component) {
      this.remove(oldComponent, immediate);
      return this.add(newComponent, immediate);
    }
    return false;
  },

  /**
   * 컴포넌트 배열을 설정한다.
   * @param {tau.ui.Component[]} comps 설정할 컴포넌트 배열
   * @param {Boolean} [immediate=false]컴포넌트를 바로 draw할지 설정한다.
   * @initoption
   */
  setComponents: function (comps, immediate) {
    this.removeComponents(immediate);
    
    for (var i = 0, len = comps.length; i < len; i++) {
      this.add(comps[i], immediate);
    }
  },
  
  /**
   * 컴포넌트 아이템을 맵에 설정한다.
   * <p/>
   * 이전에 설정한 아이템의 부모/버블링 관계는 제거한다.
   * @param {Object} key 컴포넌트 키
   * @param {Object} value 추가할 컴포넌트
   * @param {Boolean} [immediate=false]컴포넌트를 바로 draw할지 설정한다.
   * @returns {Boolean} <code>true</code> if the component item was set
   */
  setMapItem: function (key, value, immediate) {
    var delegator = this.getDelegator(),
        oldItem = this.getMapItem(key);
    if (oldItem instanceof tau.ui.Component) {
      oldItem.removeBubble(delegator);
      oldItem.setParent(null);
      if (oldItem.isDrawn() && immediate) {
        oldItem.clear();
      }
    } else if (delegator.isDrawn() && immediate && delegator.renderer){
      // TODO : item이 아닌 경우에 대한 release가 필요함. - 추후 정리할 필요가 있음.
      // FIXME
      //delegator.renderer.releaseElement(delegator.$renderData, key);
    }

    if (value instanceof tau.ui.Component){
      value.setParent(delegator);
      value.setBubble(delegator);
      
      if (delegator.isDrawn() && immediate) {
        this.getMapItems()[key] = value;
        this.drawItem(key, immediate);
        return true;
      }
    } else if (!value) {
      return this.removeMapItem(key, immediate);
    }
    return this.getMapItems()[key] = value;
  }
});


//------------------------------------------------------------------------------
/** @lends tau.ui.Scene */
$class('tau.ui.Scene').extend(tau.rt.EventDelegator)
    .mixin(tau.ui.Container, tau.ui.Drawable).define({
  /**
   * 생성자, 새로운 Scene객체를 생성한다.
   * @class Scene은 단일 스크린을 가지고 내부에 컴포넌트를 배치하고 관리하는 클래스이다.
   * @extends tau.rt.EventDelegator
   * @mixins tau.ui.Container
   * @mixins tau.ui.Drawable
   * @constructs
   */
  Scene: function (opts) {//$ tau.ui.Scene
    this.setBaseStyleClass('tau-scene');
    /** @private Delegators attached to this instance that needs hit testing */
    this.$subDelegators = {};
  },
  
  /**
   * 랜더링을 수행한다.
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @overrides tau.ui.Drawable.render
   * @private
   */
  render: function (refresh) {
    this.drawComponents(refresh);
  },
  
  /**
   * tau.rt.EventDelegator.getBubble()를 Override하며 UI 컴포넌트에서 발생된
   * 이벤트는 사용자가 등록한 EventHandler를 처리한 다음 최종적으로는 Runtime이 
   * 처리하도록 Delegation 시킨다. 
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] Payload object to be carried during propagation 
   * @returns {Boolean} <code>true</code> if the event was fired without error
   * @see tau.rt.EventDelegator.propagateEvent
   */
  getBubble: function () {
    return tau.getRuntime();
  },
  
  /**
   * 인덱스 또는 id에 해당하는 컴포넌트를 반환한다.
   * @param {Number|String} index 배열 혹은 컴포넌트 ID
   * @returns {tau.ui.Component} 인덱스에 해당하는 컴포넌트를 반환한다.
   * @throws {RangeError} 명시된 index가 범위를 벗어났을 때
   * @overrides
   * @see tau.ui.Container.getComponent
   */
  getComponent: function (index) {
    var delegators = this.$subDelegators,
      drawableComponents;
    
    if (delegators && this.isDrawn() && tau.isString(index) &&
        Object.keys(delegators).length > 0 &&
        (!(drawableComponents = this.getDrawableComponents()) || 
            drawableComponents.length == 0)){
      return delegators[index];
    }
    return tau.ui.Container.prototype.getComponent.apply(this, arguments);
  },
  
  /**
   * 이벤트를 propagate한다.
   * <p/>
   * 이벤트는 콜백 리스너를 실행하고 추가적으로 버블업이 설정되었으면 버블업하면서 propagation을 수행한다.
   * @overrides tau.rt.EventDelegator.prototype.propagateEvent
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @returns {Boolean} 이벤트가 에러없이 fire되었으면 <code>true</code>
   * @see tau.rt.EventDelegator.propagateEvent
   */
  propagateEvent: function (e, payload) {
    try {
      switch (e.getName()) {
        case tau.rt.Event.COMPDRAWN:
          this.handleRegister.apply(this, arguments);
          break;
        case tau.rt.Event.COMPCLEAR:
          this.handleUnRegister.apply(this, arguments);
          break;
        case tau.rt.Event.COMPADDED:
        case tau.rt.Event.COMPREMOVED:
          this.handleDirtyParent.apply(this, arguments);
          break;
      }
    }  catch (ex) {
      if (this._opts && this._opts.gracefulErrors) {
        tau.log.error("Error occured during event handler: " + ex, this);
      } else {
        throw ex;
      }
    } finally {
      // take current control to the default handler
      tau.ui.Scene.$super.propagateEvent.apply(this, arguments);
    }
  },
  
  /**
   * 리소스를 destroy한다.
   */
  destroy: function () {
    this.release();
    
    this.$subDelegators = null;
    this.$dirtyParents = null;
    
    tau.ui.Drawable.prototype.destroy.apply(this, arguments);
  },

  /**
   * 컴포넌트가 추가, 삭제된 부모 컴포넌트를 저장한다.
   * @param {Object} payload
   * @param {tau.ui.Container} payload.parent 부모 컨테이너
   * @param {tau.ui.Component} payload.comp 추가, 삭제된 컴포넌트
   */
  handleDirtyParent: function(e, payload) {
    if (this.$isDrawn && payload.parent !== this){
      if (!this.$dirtyParents){
        this.$dirtyParents = [];
      }
      tau.arr(this.$dirtyParents).pushUnique(payload.parent);
    }
  },
  
  /**
   * 컴포넌트를 컴포넌트 맵에 등록한다.
   * @param {tau.ui.Component} comp 등록할 컴포넌트
   */
  handleRegister: function(e, comp) {
    this.$subDelegators[comp.getId()] = comp;
  },

  /**
   * 컴포넌트 맵에서 해당 컴포넌트를 삭제한다.
   * @param {tau.ui.Component} comp 삭제할 컴포넌트
   */
  handleUnRegister: function (e, comp) {
    delete this.$subDelegators[comp.getId()];
  },

  /**
   * 컴포넌트 트리가 변경되었다면 변경된 사항에 대해서 redraw해준다.
   */
  update: function () {
    if (!this.$isDrawn) {
      return;
    }
    var dp = this.$dirtyParents;
    this.draw(this.getDOM().parentNode, true);
    
    if (dp){
      for (var i=0, len = dp.length; i < len; i++){
        dp[i].draw(dp[i].getDOM().parentNode, true);
      }
    }
    this.$dirtyParents = null;
  },

  /**
   * scene에 있는 모든 하위 컴포넌트들을 반환한다. : 컴포넌트 히트 테스트에 사용됨
   * @returns {Array} 하위(EventDelegators)을 가지는 배열
   */
  getSubDelegators: function () {
    return this.$subDelegators;
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.NavigationBar */
$class('tau.ui.NavigationBar').extend(tau.ui.Scene).define({
  // Navigation Scene Items
  $static: /** @lends tau.ui.NavigationBar */ {
    /** 제목 아이템 키 */
    TITLE_KEY: 'title',
    /** 왼쪽 아이템 키 */
    LEFT_KEY: 'left',
    /** 오른쪽 아이템 키 */
    RIGHT_KEY: 'right'
  },

  /**
   * 생성자, 새로운 NavigationBar객체를 생성한다.
   * @class 3개의 하위 컴포넌트(Title, LeftItem, RightItem)를 관리하는 
   * Navigation Bar Scene.
   * <p/>
   * {@link tau.ui.SequenceNavigator}에서 일반적으로 최상위 부분에 표시되고,
   * scene을 네비게이션할 수 있는 컨트롤 컴포넌트(이전 버튼)를 포함하고 있다.
   * <p/>
   * @extends tau.ui.Scene
   * @constructs 
   */
  NavigationBar: function () {//$ tau.ui.NavigationBar
    this.setBaseStyleClass('tau-navigationbar');
  },
  
  /**
   * 인스턴스의 표시여부를 설정한다.
   * @param {Boolean} visible <code>true</code>의 경우 표시한다.
   * @overrides
   */
  setVisible: function(visible) {
    tau.ui.Drawable.prototype.setVisible.apply(this, arguments);
    if (visible && this.isDrawn()) this._centerTitle();
  },

  /**
   * 아이템을 랜더링을 수행한다.
   * @param {String} key 
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @private
   * @overrides
   */
  drawItem: function (key, refresh) {
    switch (key) {
    case tau.ui.NavigationBar.TITLE_KEY:
      this._drawTitleItem(refresh);
      break;
    case tau.ui.NavigationBar.LEFT_KEY:
      this._drawLeftItem(refresh);
      break;
    case tau.ui.NavigationBar.RIGHT_KEY:
      this._drawRightItem(refresh);
      break;
    }
    if (refresh && this.isDrawn()) this._centerTitle();
  },
  
  /**
   * 특정 key에 해당하는 아이템을 삭제한다.
   * <p/>
   * 컴포넌트의 부모/버블링 관계 설정을 삭제한다. 
   * @param {String} key 삭제할 아이템 key
   * @param {Boolean} [immediate=false]컴포넌트를 바로 draw할지 설정한다. 
   * <code>false</code>이면 객체가 draw할 때 일괄적으로 DOM Tree에 반영된다. 
   * @returns {Boolean} 컴포넌트가 삭제가 완료되었다면 <code>true</code>
   * @overrides
   */
  removeMapItem: function (key, immediate) {
    if (tau.ui.NavigationBar.$super.removeMapItem.apply(this, arguments)) {
      if (immediate && this.isDrawn()) this._centerTitle(); 
      return true;
    }
    return false;
  },
  
  /**
   * Navigation Bar를 위한 Title 아이템을 반환한다.
   * @returns {Object|String} TitleItem 컴포넌트/스트링
   */
  getTitleItem: function () {
    return this.getMapItem(tau.ui.NavigationBar.TITLE_KEY);
  },

  /**
   * Navigation Bar에 Title 아이템을 설정한다.
   * @param {Object|String} titleItem 설정할 Title 아이템
   * @returns {Boolean} Title 아이템이 설정되었다면 <code>true</code>
   */
  setTitleItem: function (titleItem) {
    if (titleItem && !tau.isString(titleItem) && !(titleItem 
        instanceof tau.ui.Component)) {
      throw new TypeError(titleItem + ' is not an instance of tau.ui.Component' +
          'or String: ' + this.currentStack());
    }
    return this.setMapItem(tau.ui.NavigationBar.TITLE_KEY, titleItem, true);
  },

  /**
   * Navigation Bar를 위한 Left 아이템을 반환한다.
   * @returns {Object|String} LeftItem 컴포넌트
   */
  getLeftItem: function () {
    var item = this.getMapItem(tau.ui.NavigationBar.LEFT_KEY);
    if (!item) {
      item = new tau.ui.Button();
      tau.util.dom.addClass(item.getDOM(), 'back');
      tau.util.dom.addClass(item.getDOM(), 'leftitem', this.getBaseStyleClass());
      this.setMapItem(tau.ui.NavigationBar.LEFT_KEY, item);
    }
    return item;
  },

  /**
   * Navigation Bar에 Left 아이템을 설정한다.
   * @param {tau.ui.Component} leftItem 설정할 Left 아이템
   * @returns {Boolean} Left 아이템이 설정되었다면 <code>true</code>
   */
  setLeftItem: function (item) {
    if (item && !(item instanceof tau.ui.Component)) {
      throw new TypeError(item + ' is not an instance of tau.ui.Component: '
          + this.currentStack());
    } else if (!item) {
      return this.removeLeftItem();
    }
    return this.setMapItem(tau.ui.NavigationBar.LEFT_KEY, item, true);
  },
  
  /**
   * Navigation Bar에 Left 아이템을 삭제한다.
   * @returns {Boolean} Left 아이템이 삭제되었다면 <code>true</code>, 안되었다면 <code>false</code>
   */
  removeLeftItem: function () {
    var item = this.getMapItem(tau.ui.NavigationBar.LEFT_KEY);
    if(item){
      this.removeMapItem(tau.ui.NavigationBar.LEFT_KEY, true);
      if (this.isDrawn()){
        tau.util.dom.removeClass(this.getDOM(), '-hasleftitem', 
            this.getBaseStyleClass());
      }
      return true;
    }    
    return false;
  }, 
  
  /**
   * Navigation Bar를 위한 Right 아이템을 반환한다.
   * @returns {tau.ui.Component} RightItem 컴포넌트
   */
  getRightItem: function () {
    var item = this.getMapItem(tau.ui.NavigationBar.RIGHT_KEY);
    if (!item) {
      item = new tau.ui.Button();
      tau.util.dom.addClass(item.getDOM(), '-rightitem', this.getBaseStyleClass());
      this.setMapItem(tau.ui.NavigationBar.RIGHT_KEY, item);
    }
    return item;
  },

  /**
   * Navigation Bar에 Right 아이템을 설정한다.
   * @param {tau.ui.Component} item 설정할 Right 아이템
   * @returns {Boolean} Right 아이템이 설정되었다면 <code>true</code>
   */
  setRightItem: function (item) {
    if (item && !(item instanceof tau.ui.Component)) {
      throw new TypeError(item + ' is not an instance of tau.ui.Component: '
          + this.currentStack());
    }
    if (!item) {
      tau.util.dom.removeClass(this.getDOM(), '-hasrightitem', 
          this.getBaseStyleClass());
    }
    return this.setMapItem(tau.ui.NavigationBar.RIGHT_KEY, item, true);
  },

  /**
   * 뒤로가기 버튼 텍스트를 반환한다.
   * @returns {String} 뒤로가기 버튼 텍스트
   */
  getBackButtonText: function () {
    return this._backButtonText ? this._backButtonText : '';
  },

  /**
   * 뒤로가기 버튼 텍스트 아이템을 설정한다.
   * <p/>
   * 뒤로가기 버튼은 이전 scene으로 가기 위해 사용된다. scene의 제목을 대신해서 설정하고자 할 때
   * 특정한 텍스를 지정해서 설정한다. 
   * @param {String} text 뒤로가기 버튼 텍스트
   * @returns {Boolean} 텍스트가 설정되었다면 <code>true</code>
   */
  setBackButtonText: function (text) {
    if (tau.isString(text)) {
      /** @private Back button text */
      this._backButtonText = text;
      return true;
    }
    return false;
  },

  /**
   * 랜더링을 수행한다.
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @overrides
   * @private
   */
  render: function (refresh) {
    this.drawItem(tau.ui.NavigationBar.LEFT_KEY, refresh);
    this.drawItem(tau.ui.NavigationBar.TITLE_KEY, refresh);
    this.drawItem(tau.ui.NavigationBar.RIGHT_KEY, refresh);
    this._centerTitle();
  },

  /**
   * Navigation Bar의 Title아이템을 draw한다.
   * @param {Boolean} [refresh=false] <code>true</code>이면 이전 컨텐츠를 클리어하고 다시 draw한다.
   * @returns {Boolean} 실제 컨텐츠가 이 메소드에 의해 draw 되었다면 <code>true</code>
   */
  _drawTitleItem: function (refresh) {
    var parent = this.getDOM(),
        contentElem,
        titleItem = this.getTitleItem(),
        contentStlyeClass = this.getBaseStyleClass() + '-content',
        titleStlyeClass = this.getBaseStyleClass() + '-title';
    
    // Draw Navigation Title item
    contentElem = parent.getElementsByClassName(contentStlyeClass)[0]; // Use old title
    
    if (!contentElem) {
      contentElem = document.createElement('div');
      tau.util.dom.addClass(contentElem, contentStlyeClass);
      parent.appendChild(contentElem);
    }

    if (tau.isString(titleItem)) {
      var html = [];
      html.push('<div class="tau-navigationbar-content-lspace"></div>');
      html.push('<h1 class=' + titleStlyeClass + '>' + titleItem + '</h1>');
      html.push('<div class="tau-navigationbar-content-rspace"></div>');
      contentElem.innerHTML = html.join('');
      return true;
    } else if (titleItem instanceof tau.ui.Component) {
      contentElem.innerHTML = null;
      return titleItem.draw(contentElem, refresh);
    }
    return false;
  },
  
  /**
   * Navigation Bar의 Left아이템을 draw한다.
   * @param {Boolean} [refresh=false] <code>true</code>이면 이전 컨텐츠를 클리어하고 다시 draw한다.
   * @returns {Boolean} 실제 컨텐츠가 이 메소드에 의해 draw 되었다면 <code>true</code>
   */
  _drawLeftItem: function (refresh) {
    var parent = this.getDOM(),
        item = this.getMapItem(tau.ui.NavigationBar.LEFT_KEY); 
    if (refresh) {
      tau.util.dom.popElement(parent, 
          parent.getElementsByClassName(this.getBaseStyleClass() + '-leftitem')[0]);
    }
    if (item instanceof tau.ui.Component) {
      tau.util.dom.addClass(item.getDOM(), '-leftitem', this.getBaseStyleClass());
      tau.util.dom.addClass(parent, '-hasleftitem', this.getBaseStyleClass());
      return item.draw(parent, refresh, parent.firstChild);
    }
    return false;
  },

  /**
   * Navigation Bar의 Right아이템을 draw한다.
   * @param {Boolean} [refresh=false] <code>true</code>이면 이전 컨텐츠를 클리어하고 다시 draw한다.
   * @returns {Boolean} 실제 컨텐츠가 이 메소드에 의해 draw 되었다면 <code>true</code>
   */
  _drawRightItem: function (refresh) {
    var parent = this.getDOM(),
        item = this.getMapItem(tau.ui.NavigationBar.RIGHT_KEY); 
    if (refresh) {
      tau.util.dom.popElement(parent, 
          parent.getElementsByClassName(this.getBaseStyleClass() + '-rightitem')[0]);
    }
    if (item instanceof tau.ui.Component) {
      tau.util.dom.addClass(item.getDOM(), '-rightitem', this.getBaseStyleClass());
      tau.util.dom.addClass(parent, '-hasrightitem', this.getBaseStyleClass());
      return item.draw(parent, refresh);
    }
    return false;
  },

  /**
   * NavigationBar title이 있는 경우 가운데에 위치하도록 한다.
   */
  _centerTitle: function () {
    if (!this.isDrawn()) {
      return;
    }
    var $base = this.getBaseStyleClass(),
        dom = this.getDOM(),
        leftitem = this.getMapItem(tau.ui.NavigationBar.LEFT_KEY), 
        rightitem = this.getMapItem(tau.ui.NavigationBar.RIGHT_KEY),
        leftspace = dom.getElementsByClassName($base + '-content-lspace')[0],
        rightspace = dom.getElementsByClassName($base + '-content-rspace')[0];

    if (leftitem && rightitem) {
      if (leftitem.isVisible() && rightitem.isVisible()) {
        if (leftspace) leftspace.style.display = null;
        if (rightspace) rightspace.style.display = null;
      } else if (leftitem.isVisible()) {
        if (leftspace) leftspace.style.display = null;
        if (rightspace) {
          rightspace.style.maxWidth = leftitem.getDOM().offsetWidth + "px";
          rightspace.style.display = 'block';
        } 
      } else if (rightitem.isVisible()) {
        if (leftspace) {
          leftspace.style.maxWidth = rightitem.getDOM().offsetWidth + "px";
          leftspace.style.display = 'block';
        }
        if (rightspace) rightspace.style.display = null;
      } else {
        if (leftspace) leftspace.style.display = null;
        if (rightspace) rightspace.style.display = null;
      }
    } else if (leftitem && leftitem.isVisible()) {
      if (leftspace) leftspace.style.display = null;
      if (rightspace) {
        rightspace.style.maxWidth = leftitem.getDOM().offsetWidth  + "px";
        rightspace.style.display = 'block';
      }
    } else if (rightitem && rightitem.isVisible()) {
      if (rightspace) rightspace.style.display = null;
      if (leftspace) {
        leftspace.style.maxWidth = rightitem.getDOM().offsetWidth + "px";
        leftspace.style.display = 'block';
      }
    } else {
      if (leftspace) leftspace.style.display = null;
      if (rightspace) rightspace.style.display = null;
    }
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.TabBar */
$class('tau.ui.TabBar').extend(tau.ui.Scene).define({
  
  // TabBar UI type
  $static: /** @lends tau.ui.TabBar */ {
    /** scroll TabBar UI TYPE. Tab이 많아 지게 되는 경우 스크롤이 생긴다. */
    SCROLL_TYPE: 'scroll',
    /** 
     * scroll TabBar UI TYPE. Tab이 많아 지게 되는 경우 More Tab이 생겨서 
     * More Tab을 눌렸을 때 나머지 탭을 보여준다. 
     */
    MORE_TYPE: 'more'
  },
  
  /**
   * 생성자, 새로운 TabBar객체를 생성한다.
   * @class 
   * <p />
   * {@link tau.ui.ParallelNavigator}에 설정된 {@link tau.ui.SceneController}에 접근하기 위한 
   * 버튼 컴포넌트를 관리하는 Scene.
   * @extends tau.ui.Scene
   * @constructs 
   * @param {Object} [opts] TabBar 옵셥
   */
  TabBar: function (opts) {//$ tau.ui.TabBar
    this.setBaseStyleClass('tau-tabbar');
    this._type = tau.ui.TabBar.SCROLL_TYPE;
    this._container = this;
    
    if (!opts || !opts.type) {
      switch(this._type) {
      case tau.ui.TabBar.SCROLL_TYPE :
        this._setScrollTypeMode();
        break;
      }
    }
    
    this.$optionize = tau.mixin(this.$optionize, {
      handler: {
        /**
         * 탭바 타입을 설정한다. 
         * 타입 기본값은 {@link tau.ui.TabBar.SCROLL_TYPE}. 추후 {@link tau.ui.TabBar.MORE_TYPE} 지원할 예정임.
         * @param {String} prop Function name
         * @param {String} type 탭바 타입. 
         *  <ul>
         *    <li>{@link tau.ui.TabBar.SCROLL_TYPE}</li>
         *    <li>{@link tau.ui.TabBar.MORE_TYPE}</li>
         *  </ul>
         */
        type: function (prop, val) {
          if (!tau.isString(val)) {
            throw new TypeError(prop.concat(' option is not String: ', val, this.currentStack()));
          }
          this._type = type;
        }
      }
    }, 'remix');
  },
  
  /**
   * 컴포넌트 배열을 설정한다.
   * <p />
   * 내부적으로 아무런 처리를 하지 않는다. {@link tau.ui.Tabbar}
   * @overrides
   */
  setComponents: tau.emptyFn,
  
  /**
   * 스크롤타입 설정
   * @private
   */
  _setScrollTypeMode: function () {
    var that = this;
    this._container = new tau.ui.ScrollPanel({
      bounce: false, vScroll: false, hScroll: true, hScrollbar: false, page: true});
    
    tau.mixin(this._container, {
      refresh: function () {
        if (!this.isDrawn(true) || !this.isVisible()){
          return;
        }
        var width = this.wrapper.offsetWidth,
            tabbar = this.getParent(),
            len = tabbar.getComponents().length,
            buttonWidth = this.$renderData.$dom[tau.ui.CONTENT_KEY].firstElementChild.offsetWidth,
            count = width / buttonWidth;
    
        tabbar.getMapItem('prev').setVisible(false);
        
        if (len > count){
          this._scroll = true;
          tabbar.getMapItem('next').setVisible(true);
          tau.util.dom.removeClass(tabbar.getDOM(), '-noscroll', tabbar.getBaseStyleClass());
        } else {
          this._scroll = false;
          tau.util.dom.addClass(tabbar.getDOM(), '-noscroll', tabbar.getBaseStyleClass());
          tabbar.getMapItem('next').setVisible(false);
        }
        tau.ui.ScrollPanel.prototype.refresh.apply(this, arguments);
      },
      
      handleScrollEnd: function () {
        var tabbar = this.getParent();
        
        if (this.x == 0){
          tabbar.getMapItem('prev').setVisible(false);
        } else if (this._scroll){
          tabbar.getMapItem('prev').setVisible(true);
        }
        if (this.x == this.maxScrollX){
          tabbar.getMapItem('next').setVisible(false);
        } else if (this._scroll){
          tabbar.getMapItem('next').setVisible(true);
        }
        tau.ui.ScrollPanel.prototype.handleScrollEnd.apply(this, arguments);
      }
    }, true);
    
    this.setMapItem('prev',  new tau.ui.Button({
      baseStyleClass: 'tau-tab-prev',
      tap: function (){
        that.getMapItem('content').scrollToPage('prev', 0);
      },
      visible: false
    }));
    this.setMapItem('next', new tau.ui.Button({
      baseStyleClass: 'tau-tab-next', 
      tap: function (){
        that.getMapItem('content').scrollToPage('next', 0);
      },
      visible: false
      })
    );
    this.setMapItem('content', this._container);
  },
  
  /**
   * 스크롤타입 Tabbar를 draw한다.
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @private 
   */
  _drawScrollType: function (refresh) {
    this.drawItem('prev');
    this.drawItem('content');
    this.drawItem('next');
  },
  
  /**
   * 랜더링을 수행한다.
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @overrides
   * @private
   */
  render: function (refresh) {
    if (this._type) {
      this.setStyleClass({type: this._type});
      
      switch(this._type) {
      case tau.ui.TabBar.SCROLL_TYPE :
        this._drawScrollType(refresh);
        break;
      }
    }
  },
  
  /**
   * 순차적인 컴포넌트 리스트를 반환한다.
   * @returns {tau.ui.Component[]}
   * @overrides
   * @see tau.ui.Container.getComponents
   */
  getComponents: function () {
    return this._container.getComponents();
  },
  
  
  /**
   * 컴포넌트를 하위 아이템으로 추가한다.
   * <p/>
   * 컴포넌트의 부모/버블링 관계 설정을 하고 
   * 컴포넌트에서 이벤트를 처리하지 않아도 현재 인스턴스에서 처리하도록 한다.
   * <code>immediate</code>가 <code>false</code>인 경우 {@link tau.rt.Event.COMPADDED}
   * 이벤트를 발생시킨다.
   * @param {tau.ui.Component} comp 현재 인스턴스에 추가할 컴포넌트
   * @param {Number} [index] 특정 위치에 컴포넌트 DOM element를 추가한다. 
   * @param {Boolean} [immediate=false]컴포넌트를 바로 draw할지 설정한다. 
   * <code>false</code>이면 객체가 draw할 때 일괄적으로 DOM Tree에 반영된다. 
   * @returns {Boolean} 컴포넌트가 추가가 완료되었다면 <code>true</code>
   * @throws {TypeError} 명시된 comp가 {@link tau.ui.Component}의 객체가 아닐 경우
   * @throws {RangeError} 명시된 index가 범위를 벗어났을 때
   * @overrides
   * @see tau.ui.Container.add
   */
  add: function (comp, index, immediate) {
    return this._container.add(comp, index, immediate);
  },
  
  /**
   * 컴포넌트를 삭제한다.
   * <p/>
   * 컴포넌트의 부모/버블링 관계 설정을 삭제한다. 
   * @param {tau.ui.Component|Number} arg 삭제할 컴포넌트 혹은 인덱스
   * @param {Boolean} [immediate=false]컴포넌트를 바로 draw할지 설정한다. 
   * <code>false</code>이면 객체가 draw할 때 일괄적으로 DOM Tree에 반영된다. 
   * @returns {Boolean} 컴포넌트가 삭제가 완료되었다면 <code>true</code>
   * @overrides
   * @see tau.ui.Container.remove
   */
  remove: function (arg, immediate) {
    return this._container.remove(arg, immediate);
  },
  
  
  /** 
   * Tab Bar에 의해 네이게이션될 컨트롤러들을 설정한다.
   * <p/>
   * 컨트롤러 그룹은 {@link tau.ui.ParallelNavigator.createTabBar}를 통해 scene을 생성하는데 
   * 사용될 것이다. 그리고 첫번째 인덱스의 컨트롤러는 선택된 탭으로 설정된다.
   * @param {Array} controllers 컨트롤러 배열 
   * @see {tau.ui.ParallelNavigator.setControllers}
   */
  setControllers: function (controllers){
    if (this._controllers === controllers){
      return;
    }
    
    this._controllers = controllers;
    
    var i, len, callback;

    /** @inner Creates a callback for setIndex with the corresponding index */
    function createSetIndexFn(parent, index) {
      return function (e, id) {
        parent.setIndex(index);
      };
    }
    
    // Creates tab select button callbacks
    for (i = 0, len = controllers.length; i < len; i++) {
      // Create callback for tab navigation
      callback = createSetIndexFn(controllers[i].$parent, i);
      this.add(new tau.ui.Button({
        baseStyleClass: 'tau-tab',
        label: controllers[i].getTitle(),
        tap: callback
      }));
    }
  }
});


//------------------------------------------------------------------------------
/** @lends tau.ui.Component */
$class('tau.ui.Component').extend(tau.rt.EventDelegator)
    .mixin(tau.ui.Drawable).define({

  /**
   * 생성자, 새로운 Component객체를 생성한다.
   * 
   * @class 컴포넌트는 scene에 표시할 수 있고 사용자와 상호작용할 수 있는 GUI 객체이다.
   * 전형적인 그래피컬 사용자 인터페이스의 버튼, 체크 박스, 라디오 등이 있다.
   * Component 클래스는 기본 클래스로써 확장해서 새로운 컴포넌트를 생성할 수 있다.
   * @constructs
   * @extends tau.rt.EventDelegator
   * @mixins tau.ui.Drawable
   */
  Component: function() {//$ tau.ui.Component
    /** @private 부모 {@link tau.ui.Container} 객체 */
    this._parent = null;

    if (!tau.isUndefined(this.renderer)) {
      if (this.renderer.initialize){
        /** @private 랜더링 데이터 객체 
         * <ul>
         *  <li><code>$renderData.$dom</code></li>
         *  <li><code>$renderData.$base</code></li>
         * </ul>
         */
        this.$renderData = this.renderer.initialize(arguments);
        this.setBaseStyleClass(this.$renderData.$base);
        /** @private root DOM Element */
        this._dom = this.$renderData.$dom[tau.ui.ROOT_KEY];
      }
    }
    this.$optionize = tau.mixin(this.$optionize, {
      handler: { /** @lends tau.ui.Component */
      /**
       * 컴포넌트 아이디를 설정한다.
       * <p />
       * 아이디를 지정하게 되면 컴포넌트 아이디와 컴포넌트 DOM Element 아이디가 달라진다. 
       * {@link tau.ui.Component.getId} 호출시 파라미터 <code>true</code>로 설정하면 컴포넌트 DOM Element를 반환한다. 
       * @initoption {String} 
       */
        id: function (prop, val) {
          if (!tau.isString(val)) {
            throw new TypeError(prop.concat(' option is not String: ', val, this.currentStack()));
          } else if (val.indexOf(tau.ui.ID_SEPARATOR) > -1) {
            throw new Error(prop.concat(' option does now allow "', tau.ui.ID_SEPARATOR, '":', val,this.currentStack()));
          }
          this._id = val;
        }
      }
    }, 'remix');
  },

  /**
   * 현재 컴포넌트의 ID를 반환한다. 만약 현재 생성된 컴포넌트의 ID가
   * 존재하지 않을 경우 새로운 ID를 생성해서 반환한다.
   * 생성자에서 ID를 설정한 경우 
   * @param {Boolean} [systemId=false] 내부 ID를 반환하고자 한다면 <code>true</code>로 설정한다.
   * @returns {String} DOM 앨리먼트의 ID
   * @see tau.ui.Drawable.getId
   * @overrides
   */
  getId: function (systemId) {
    if (!this.$id) {
      /** @private DOM element ID created lazily */
      if (this._id) {
        this.$id = this._id + tau.ui.ID_SEPARATOR + tau.genId();
      } else {
        this.$id = tau.genId();
      }
    }

    if (!systemId && this._id) return this._id;

    return this.$id;
  },
  
  /**
   * 컴포넌트를 draw한다.
   * <p />
   * 성공적으로 draw되면 {@link tau.rt.Event.COMPDRAWN} 이벤트를 발생시킨다.
   * @overrides tau.ui.Drawable.prototype.draw
   * @param {HTMLElement} parent 컨텐츠를 렌더링할 부모 DOM element
   * @param {Boolean} [refresh=false] <code>true</code>이면 이전 컨텐츠를 클리어하고 다시 draw한다.
   * @param {HTMLElement} [refChild] 컨텐츠를 렌더링할 이전 Child DOM element
   * @return {Boolean} 성공적으로 draw된 경우 <code>true</code> 반환
   */
  draw: function(parent, refresh, refChild) {
    if (tau.ui.Drawable.prototype.draw.apply(this, arguments)) {
      this.fireEvent(tau.rt.Event.COMPDRAWN, this);
      return true;
    }
    return false;
  },
  
  /**
   * 인스턴스의 메인 DOM 기본 스타일 클래스를 설정한다.
   * @param {String} baseStyleClass 컴포넌트 스타일 클래스.
   * @overrides
   */
  setBaseStyleClass: function (baseStyleClass) {
    if (baseStyleClass != this.getBaseStyleClass()) {
      this.renderer.setBaseStyleClass(this.$renderData, baseStyleClass);
    }
    tau.ui.Drawable.prototype.setBaseStyleClass.apply(this, arguments);
  },

  /**
   * 컴포넌트에 연관된 scene을 반환한다.
   * @returns {Object} 컨트롤러가 관리하는 scene 객체
   */
  getScene: function () {
    var parent = this.getParent();
    if (parent instanceof tau.ui.Scene){
      return parent;
    } else if (parent instanceof tau.ui.Component){
      return parent.getScene();
    }
    return null;
  },
  
  
  /**
   * <code>{@link tau.ui.Drawable}</code> 인스턴스의 루트 DOM element를 반환한다.
   * <p/>
   * 루트 DOM element가 없는 경우 DOM element를 생성해서 반환한다.
   * <code>key</code>가 있는 경우 해당 키의 parent가 되는 DOM Element를 반환한다.
   * <code>createElement</code>가 <code>true</code>인 경우 parent DOM Element를 생성해서 반환한다.
   * @param {String} key $dom 키값
   * @param {Boolean} [createElement=false] 
   * @returns {HTMLElement} DOM element
   * @overrides
   */
  getDOM: function (key, createElement) {
    return this.renderer.getParentElement(this.$renderData, key, createElement);
  },
  
  /**
   * DOM 트리에서 DOM 참조를 삭제하고 DOM 참조를 클리어 한다.
   * <p />
   * clear되면 {@link tau.rt.Event.COMPCLEAR} 이벤트를 발생시킨다.
   * @overrides
   * @see tau.ui.Drawable.clear 
   */
  clear: function () {
    tau.ui.Drawable.prototype.clear.apply(this, arguments);
    if (this._parent) this.fireEvent(tau.rt.Event.COMPCLEAR, this);
  },
  
  /**
   * 리소스를 destroy한다.
   * @see tau.ui.Drawable.destroy
   * @overrides
   */
  destroy: function () {
    //tau.log('release..', 1, this);
    if (this.isMixinOf(tau.ui.Container)) {
      this.release();
    }
    
    this.removeBubble();
    this.unsubscribeEvent();// purge resource
    
    if (this._parent && this._parent.isMixinOf(tau.ui.Container)) {
      this._parent.remove(this, true);
    }
    
    this._parent = null;

    if (this.renderer && this.renderer.release) {
      this.renderer.release(this.$renderData);
    }

    this._id = null;
    tau.ui.Drawable.prototype.destroy.apply(this, arguments);
  },

  /**
   * 랜더링을 후처리를 수행한다.
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   */
  afterRender: function (refresh) {
    //tau.log('afterRender..', 1, this);
    if (!tau.isUndefined(this.renderer)) {
      if (this.renderer.renderDone){
        this.renderer.renderDone(this.$renderData, refresh);
      }
    }
  },
  
  /**
   * DOM 스타일을 설정한다.
   * @param {String} attribute 스타일 속성
   * @param {String} value 스타일 값
   * @see tau.ui.Drawable.setStyle
   */
  setStyle: function(attr, val) {
    if (this.renderer.updateStyle(this.$renderData, attr, val, this.getId(true))){
      tau.ui.Drawable.prototype.setStyle.apply(this, arguments);
    }
  },
  
  /**
   * 인스턴스 DOM 스타일 클래스를 반환한다. 
   * @param {String} prop 스타일 속성
   * @returns {String} 스타일 클래스
   * @see tau.ui.Drawable.getStyle
   */
  getStyle: function(prop) {
    return this.renderer.getStyle.call(this, this.$renderData, prop);
  },  
  
  /**
   * 이벤트를 propagate한다.
   * <p/>
   * 이벤트는 콜백 리스너를 실행하고 추가적으로 버블업이 설정되었으면 버블업하면서 propagation을 수행한다.
   * @overrides tau.rt.EventDelegator.prototype.propagateEvent
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @returns {Boolean} 이벤트가 에러없이 fire되었으면 <code>true</code>
   * @see tau.rt.EventDelegator.propagateEvent
   */
  propagateEvent: function (e, payload) {
    try {
      switch (e.getName()) {
        case tau.rt.Event.TOUCHSTART:
          this.handleTouchStart.apply(this, arguments);
          break;
        case tau.rt.Event.TOUCHMOVE:
          this.handleTouchMove.apply(this, arguments);
          break;
        case tau.rt.Event.TOUCHEND:
          this.handleTouchEnd.apply(this, arguments);
          break;
        case tau.rt.Event.TAP:
          this.handleTap.apply(this, arguments);
          break;
        case tau.rt.Event.TOUCHCANCEL:
          this.handleTouchCancel.apply(this, arguments);
          break;
        case 'keyup':
          this.handleKeyUp.apply(this, arguments);
          break;
        case tau.rt.Event.VALUECHANGE:
          this.handleValueChange.apply(this, arguments);
          break;
        case tau.rt.Event.SELECTCHANGE:
          this.handleSelectChange.apply(this, arguments);
          break;
        case 'blur':
          this.handleBlur.apply(this, arguments);
          break;
      }
    }  catch (ex) {
      if (this._opts && this._opts.gracefulErrors) {
        tau.log.error("Error occured during event handler: " + ex, this);
      } else {
        throw ex;
      }
    } finally {
      // take current control to the default handler
      tau.ui.Component.$super.propagateEvent.apply(this, arguments);
    }
  },
  
  /**
   * 이벤트 {@link tau.rt.Event.TOUCHSTART} 처리 함수
   * <p/>
   * 이벤트 {@link tau.rt.Event.TOUCHSTART}를 처리하기 위해서는 오버라이드해야한다.
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @private
   */
  handleTouchStart: function (e, payload) {
   //dummy method, descendant object can implement this method to customize
   //tau.log('handleTouchStart', 1, this); 
  },
  
  /**
   * 이벤트 {@link tau.rt.Event.TOUCHMOVE} 처리 함수
   * <p/>
   * 이벤트 {@link tau.rt.Event.TOUCHMOVE} 를 처리하기 위해서는 오버라이드해야한다.
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @private
   */
  handleTouchMove: function (e, payload) {
    //dummy method, descendant object can implement this method to customize
    //tau.log('handleTouchMove', 1, this);
  },

  /**
   * 이벤트 {@link tau.rt.Event.TOUCHEND} 처리 함수
   * <p/>
   * 이벤트 {@link tau.rt.Event.TOUCHEND}를 처리하기 위해서는 오버라이드해야한다.
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @private
   */
  handleTouchEnd: function (e, payload) {
    //dummy method, descendant object can implement this method to customize
    //tau.log('handleTouchEnd', 1, this);
  },

  /**
   * 이벤트 {@link tau.rt.Event.TOUCHCANCEL} 처리 함수
   * touchcancel event를 처리하기 위해서는 오버라이드해야한다.
   */
  handleTouchCancel: function (e, payload) {
    //dummy method, descendant object can implement this method to customize
    //tau.log('handleTouchCancel', 1, this);
  },

  /**
   * 이벤트 {@link tau.rt.Event.TAP} 처리 함수
   * <p/>
   * 이벤트 {@link tau.rt.Event.TAP}를 처리하기 위해서는 오버라이드해야한다.
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @private
   */
  handleTap: function (e, payload) {
    //dummy method, descendant object can implement this method to customize
    //tau.log('handleTap', 1, this);
  },
  
  /**
   * keyup 이벤트 처리 함수
   * <p/>
   * keyup event를 처리하기 위해서는 오버라이드해야한다.
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @private
   */
  handleKeyUp: function (e, payload) {
    //dummy method, descendant object can implement this method to customize
    //tau.log('handleKeyUP', 1, this);
  },
  
  /**
   * 이벤트 {@link tau.rt.Event.VALUECHANGE} 처리 함수
   * <p/>
   * 이벤트 {@link tau.rt.Event.VALUECHANGE}를 처리하기 위해서는 오버라이드해야한다.
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @private
   */
  handleValueChange: function (e, payload) {
    //dummy method, descendant object can implement this method to customize
    //tau.log('handleValueChange', 1, this);
  },
  
  /**
   * 이벤트 {@link tau.rt.Event.SELECTCHANGE} 처리 함수
   * <p/>
   * 이벤트 {@link tau.rt.Event.SELECTCHANGE}를 처리하기 위해서는 오버라이드해야한다.
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @private
   */
  handleSelectChange: function (e, payload) {
    //dummy method, descendant object can implement this method to customize
    //tau.log('handleSelectChange', 1, this);
  },
  
  /**
   * 이벤트 blur 처리 함수
   * <p/>
   * 이벤트 blur를 처리하기 위해서는 오버라이드해야한다.
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @private
   */
  handleBlur: function (e, payload) {
    //dummy method, descendant object can implement this method to customize
    //tau.log('handleBlur', 1, this);
  },
  
  /**
   * 현재 컴포넌트의 부모를 반환한다.
   * @returns {tau.ui.Component| tau.ui.Scene} parent 컴포넌트의 부모
   */
  getParent: function() {
    return this._parent;
  },

  /**
   * 컴포넌트의 부모를 설정한다.
   * @param {tau.ui.Component| tau.ui.Scene} parent 컴포넌트의 부모
   * @private
   */
  setParent: function(parent) {
    this._parent = parent;
  }
});


//------------------------------------------------------------------------------
/**
 * 독립적인 인스턴스를 생성하지 않고 다른 컴포넌트의 Mixin형태로 사용된다.
 * Control 클래스는 컨트롤 객체를 위한 기본 클래스이다.
 * 컨트롤 객체의 상태를 관리하고 반영해 주는 클래스이다.
 * 컴포넌트는 Control 클래스를 mixin해서 컨트롤 기능을 사용할 수 있다.
 * @name tau.ui.Control
 * @class
 */
$class('tau.ui.Control').define(
/** @lends tau.ui.Control */
{
  $static: /** @lends tau.ui.Control */{
    /** 일반적인 상태 */
    NORMAL: 'normal',
    /** disable 상태 */
    DISABLED: 'disabled',
    /** 선택되었을 때의 상태 */
    SELECTED: 'selected',
    /** highlighted 상태 */
    HIGHLIGHTED: 'highlighted'
  },
  
  /**
   * disable 여부를 반환한다.
   * @returns {Boolean}
   */
  isDisabled: function () {
    return this.$control === tau.ui.Control.DISABLED;
  },

  /**
   * state의 disable여부를 설정한다.
   * @param {Boolean} value
   */
  setDisabled: function (value) {
    value = (!!value ? tau.ui.Control.DISABLED : tau.ui.Control.NORMAL);
    if (this.$control !== value) {
      this.$control = value;
      this.handleControlChanged(value);
    }
  },

  /**
   * selected 여부를 반환한다.
   * @returns {Boolean}
   */
  isSelected: function () {
    return this.$control === tau.ui.Control.SELECTED;
  },

  /**
   * state의 selected 여부를 설정한다.
   * @param {Boolean} value
   */
  setSelected: function (value) {
    value = (!!value ? tau.ui.Control.SELECTED : tau.ui.Control.NORMAL);
    if (!this.isDisabled() && this.$control !== value) {
      this.$control = value;
      this.handleControlChanged(value);
    }
  },

  /**
   * highlighted 여부를 반환한다.
   * @returns {Boolean}
   */
  isHighlighted: function () {
    return this.$control === tau.ui.Control.HIGHLIGHTED;
  },

  /**
   * state의 highlighted 여부를 설정한다.
   * @param {Boolean} value
   */
  setHighlighted: function (value) {
    value = (!!value ? tau.ui.Control.HIGHLIGHTED : tau.ui.Control.NORMAL);
    if (!this.isDisabled() && this.$control !== value) {
      this.$control = value;
      this.handleControlChanged(value);
    }
  },

  /**
   * state 변경되었을 때 state를 DOM element에 반영해 준다.
   * @param {String} state
   * @private
   */
  handleControlChanged: function (state) {
    tau.ui.Control.renderer.updateControl(this.$renderData, state, this.$styleClass);
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.Panel */
$class('tau.ui.Panel').extend(tau.ui.Component).mixin(tau.ui.Container).define({

  /**
   * 생성자, 새로운 Panel객체를 생성한다.
   * 
   * @class 하위로 컴포넌트를 포함할 수 있는 기본 컨테이너 컴포넌트이다.
   * @constructs
   * @extends tau.ui.Component
   * @mixins tau.ui.Container
   * @param {Object} [opts] Panel 옵션
   * @see tau.ui.Component 옵션을 상속받고 있음.
   */
  Panel: function (opts){//$ tau.ui.Panel
  },
  
  /**
   * 랜더링을 수행한다.
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @overrides
   * @private
   */
  render: function (refresh) {
    this.drawComponents(refresh);
  }
});


//------------------------------------------------------------------------------
/** @lends tau.ui.Scrollbar */
$class('tau.ui.Scrollbar').define({
  $static: /** @lends tau.ui.Scrollbar */ {
    /** @static */
    TRANSLATEOPEN: 'translate' + (tau.rt.has3D ? '3d(' : '('),
    /** @static */
    TRANSLATECLOSE: tau.rt.has3D ? ',0)' : ')',
    UID: 0
  },
  
  /**
   * 생성자, 스크롤바 표시방향과 부모 DOM Element를 이용하여 새로운 객체를 생성한다.
   * @class ScrollPanel에서 touch 이벤트가 발생하면 스크롤 정보를 표시하기 위해 
   * 사용되는 클래스이다.
   * <p/>
   * 스크롤 바는 {@link tau.ui.ScrollPanel}에서만 사용하는 클래스이다.
   * @constructs
   * @param {Boolean}     vertical 수직 방향 여부
   * @param {HTMLElement} wrapper 컨텐츠를 렌더링할 부모 DOM element
   */
  Scrollbar: function(vertical, wrapper){//$ tau.ui.Scrollbar
    var that = this, style;
    that.dir = vertical ? 'vertical' : 'horizontal';
    that.vertical = vertical;
    that.uid = ++tau.ui.Scrollbar.UID;
  
    // Create main scrollbar
    that.bar = document.createElement('div');
  
    style = 'position:absolute;top:0;left:0;-webkit-transition-timing-function:cubic-bezier(0,0,0.25,1);pointer-events:none;-webkit-transition-duration:0;-webkit-transition-delay:0;-webkit-transition-property:-webkit-transform;z-index:10;background:#969c9f;' +
      '-webkit-transform:' + tau.ui.Scrollbar.TRANSLATEOPEN + '0,0' + tau.ui.Scrollbar.TRANSLATECLOSE + ';' +
      (!vertical ? '-webkit-border-radius:3px 2px;min-width:6px;min-height:5px' : '-webkit-border-radius:2px 3px;min-width:5px;min-height:6px');
  
    that.bar.setAttribute('style', style);
  
    // Create scrollbar wrapper
    that.wrapper = document.createElement('div');
    style = '-webkit-mask:-webkit-canvas(scrollbar' + that.uid + that.dir + ');position:absolute;z-index:10;pointer-events:none;opacity:0;-webkit-transition-duration:300ms;-webkit-transition-delay:0;-webkit-transition-property:opacity;' +
      (!vertical ? 'bottom:2px;left:2px;right:7px;height:5px' : 'top:2px;right:2px;bottom:7px;width:5px;');
    that.wrapper.setAttribute('style', style);
  
    // Add scrollbar to the DOM
    that.wrapper.appendChild(that.bar);
    wrapper.appendChild(that.wrapper);
  },
  
  /**
   * 스크롤 윈도우의 width 혹은 height 그리고 스크롤의 width 혹은 height를 초기화한다.
   */
  init: function (scroll, size) {
    var that = this, ctx;
    // Create scrollbar mask
    if (!that.vertical) {
      if (that.maxSize != that.wrapper.offsetWidth) {
        that.maxSize = that.wrapper.offsetWidth;
        ctx = document.getCSSCanvasContext("2d", "scrollbar" + that.uid + that.dir, that.maxSize, 5);
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.beginPath();
        ctx.arc(2.5, 2.5, 2.5, Math.PI/2, -Math.PI/2, false);
        ctx.lineTo(that.maxSize-2.5, 0);
        ctx.arc(that.maxSize-2.5, 2.5, 2.5, -Math.PI/2, Math.PI/2, false);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      if (that.maxSize != that.wrapper.offsetHeight) {
        that.maxSize = that.wrapper.offsetHeight;
        ctx = document.getCSSCanvasContext("2d", "scrollbar" + that.uid + that.dir, 5, that.maxSize);
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.beginPath();
        ctx.arc(2.5, 2.5, 2.5, Math.PI, 0, false);
        ctx.lineTo(5, that.maxSize-2.5);
        ctx.arc(2.5, that.maxSize-2.5, 2.5, 0, Math.PI, false);
        ctx.closePath();
        ctx.fill();
      }
    }
  
    that.size = Math.max(Math.round(that.maxSize * that.maxSize / size), 6);
    that.maxScroll = that.maxSize - that.size;
    that.toWrapperProp = that.maxScroll / (scroll - size);
    that.bar.style[!that.vertical ? 'width' : 'height'] = that.size + 'px';
  },

  /**
   * 현재 스크롤바를 특정 위치로 이동시킨다.
   * @param {Number} pos 이동시킬 위치
   */
  setPosition: function (pos) {
    var that = this;
    
    if (that.wrapper.style.opacity != '1') {
      that.show();
    }
  
    pos = Math.round(that.toWrapperProp * pos);
  
    if (pos < 0) {
      pos = pos + pos*3;
      if (that.size + pos < 7) {
        pos = -that.size + 6;
      }
    } else if (pos > that.maxScroll) {
      pos = pos + (pos-that.maxScroll)*3;
      if (that.size + that.maxScroll - pos < 7) {
        pos = that.size + that.maxScroll - 6;
      }
    }
  
    pos = !that.vertical
      ? tau.ui.Scrollbar.TRANSLATEOPEN + pos + 'px,0' + tau.ui.Scrollbar.TRANSLATECLOSE
      : tau.ui.Scrollbar.TRANSLATEOPEN + '0,' + pos + 'px' + tau.ui.Scrollbar.TRANSLATECLOSE;
  
    that.bar.style.webkitTransform = pos;
  },

  /**
   * 스크롤바를 표시한다.
   */
  show: function () {
    if (tau.rt.has3D) {
      this.wrapper.style.webkitTransitionDelay = '0';
    }
    this.wrapper.style.opacity = '1';
  },
  
  /**
   * 스크롤바를 숨긴다.
   */
  hide: function () {
    if (tau.rt.has3D) {
      this.wrapper.style.webkitTransitionDelay = '350ms';
    }
    this.wrapper.style.opacity = '0';
  },
  
  /**
   * DOM 트리에서 스크롤바 DOM element를 삭제한다.
   */
  remove: function () {
    this.wrapper.parentNode.removeChild(this.wrapper);
    return null;
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.ScrollPanel */
$class('tau.ui.ScrollPanel').extend(tau.ui.Component).mixin(
    tau.ui.Container).define({
  
  $static: /** @lends tau.ui.ScrollPanel */{
    TRANSLATEOPEN: 'translate' + (tau.rt.has3D ? '3d(' : '('),
    TRANSLATECLOSE: tau.rt.has3D ? ',0)' : ')',

    PULL_PULLTOREFREH: 0,
    RELEASE_PULLTOREFREH: 1,
    LOADING_PULLTOREFREH: 2,
    COMPLEATE_PULLTOREFREH: 3,
    
    /** $dom의 wrapper DOM에 해당하는 키 */
    WRAPPER_KEY: 'wrapper',
    /** $dom의 scroller DOM에 해당하는 키 */
    SCROLLER_KEY: 'scroller'
  },

  /**
   * 생성자, 새로운 객체를 생성한다.
   * @class ScrollPanel은 scene의 사이즈보다 큰 컨텐츠를 화면에 보여지도록 스크롤을 제공하는 클래스이다.
   * <p/>
   * 자동으로 컨텐트가 사이즈보다 크게 되면 수직 스크롤바 혹은 수평 스크롤바를 지원하는 컨테이너 클래스이다.
   * @constructs
   * @extends tau.ui.Component
   * @mixins tau.ui.Container
   * @param {Object}  [opts] ScrollPanel 옵션
   * @param {Boolean} [opts.bounce]
   * @param {Boolean} [opts.momentum]
   * @param {String}  [opts.overflow]
   * @param {Boolean} [opts.hScroll]
   * @param {Boolean} [opts.vScroll]
   * @param {Boolean} [opts.hScrollbar]
   * @param {Boolean} [opts.vScrollbar]
   * @param {Boolean} [opts.snap=false]
   * @param {Boolean} [opts.page=false]
   * @param {String}  [opts.pullToRefresh=false]
   * <ul>
   *  <li><code>'both'</code></li>
   *  <li><code>'down'</code></li>
   *  <li><code>'up'</code></li>
   * </ul>
   * @param {String}  [opts.pullDownLabel]
   * @param {String}  [opts.pullUpLabel]
   * @param {Function}[opts.pullDownFn]
   * @param {Function}[opts.pullUpFn]
   * @see tau.ui.Component
   */
  ScrollPanel: function (opts) {//$ tau.ui.ScrollPanel   
    this.x = 0;
    this.y = 0;
    
    this.wrapper = this.$renderData.$dom[tau.ui.ScrollPanel.WRAPPER_KEY];
    this.element = this.$renderData.$dom[tau.ui.ScrollPanel.SCROLLER_KEY];
    
    this._bounce= tau.rt.has3D;
    this._momentum= tau.rt.has3D;
    //overflow= 'hidden';
    this._hScroll= tau.rt.has3D;
    this._vScroll= tau.rt.has3D;
    this._hScrollbar= tau.rt.has3D;
    this._vScrollbar= tau.rt.has3D;
    this._snap= false;
    this._page= false;
    this._pullToRefresh= false;
    this._pulldownLabel= ['Pull down to refresh...', 'Release to refresh...', 'Loading...'];
    this._pullupLabel= ['Pull up to refresh...', 'Release to refresh...', 'Loading...'];
    this._pulldownFn= tau.emptyFn;
    this._pullupFn= tau.emptyFn;
    
    this.$optionize = tau.mixin(this.$optionize, {
      handler: {
        /**
         * bounce 설정
         * @param {String} prop Function name
         * @param {Boolean} val bounce 여부
         */
        bounce: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          this._bounce = val;
        },
        /**
         * momentum 설정
         * @param {String} prop Function name
         * @param {Boolean} val momentum 여부
         */
        momentum: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          this._momentum = val;
        },
        /**
         * hScroll 설정
         * @param {String} prop Function name
         * @param {Boolean} val hScroll 여부
         */
        hScroll: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          this._hScroll = val;
        },
        /**
         * vScroll 설정
         * @param {String} prop Function name
         * @param {Boolean} val vScroll 여부
         */
        vScroll: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          this._vScroll = val;
        },
        /**
         * hScrollbar 설정
         * @param {String} prop Function name
         * @param {Boolean} val hScrollbar 여부
         */
        hScrollbar: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          this._hScrollbar = val;
        },
        /**
         * vScrollbar 설정
         * @param {String} prop Function name
         * @param {Boolean} val vScrollbar 여부
         */
        vScrollbar: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          this._vScrollbar = val;
        },
        /**
         * snap 설정
         * @param {String} prop Function name
         * @param {Boolean} val snap 여부
         */
        snap: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          this._snap = val;
        },
        /**
         * overflow 설정
         * @param {String} prop Function name
         * @param {String} val overflow
         */
        overflow: function (prop, val) {
          if (!tau.isString(val)) {
            throw new TypeError(prop.concat(' option is not String: ', val, this.currentStack()));
          }
          this._overflow = val;
          this.element.style.overflow = val;
        },
        /**
         * page 설정 - page 단위로 scroll 지원.
         * @param {String} prop Function name
         * @param {Boolean} val page 여부
         */
        page: function (prop, val) {
          if (!tau.isBoolean(val) && !tau.isObject(val)) {
            throw new TypeError(prop.concat(' option is not String or Object: ', val, this.currentStack()));
          }
          this._page = val;
        },
        /**
         * pullToRefresh 설정
         * @param {String} prop Function name
         * @param {String} val pullToRefresh
         * <ul>
         *  <li><code>false</code></li>
         *  <li><code>'both'</code></li>
         *  <li><code>'down'</code></li>
         *  <li><code>'up'</code></li>
         * </ul>
         */
        pullToRefresh: function (prop, val) {
          if (!tau.isBoolean(val) && !tau.isString(val)) {
            throw new TypeError(prop.concat(' option is not Boolean or String: ', val, this.currentStack()));
          }
          if (val !== 'both' && val !== 'down' && val !== 'up') {
            throw new RangeError(prop.concat(' option is out of range: ', val, this.currentStack()));
          } 
          if (val){
            this._pullToRefresh = val;
            this._bound = val;
            this._pullToRefreshDir = this._vScroll;
          }
        },
        /**
         * pullDownLabel 설정
         * @param {String} prop Function name
         * @param {String} val 텍스트
         */
        pullDownLabel: function (prop, val) {
          if (!tau.isArray(val)) {
            throw new TypeError(prop.concat(' option is not Array: ', val, this.currentStack()));
          }
          if (val.length > 3) {
            throw new RangeError(prop.concat(' option is out of range: ', val, this.currentStack()));
          }
          this._pulldownLabel = val;
        },
        /**
         * pullUpLabel 설정
         * @param {String} prop Function name
         * @param {String} val 텍스트
         */
        pullUpLabel: function (prop, val) {
          if (!tau.isArray(val)) {
            throw new TypeError(prop.concat(' option is not Array: ', val, this.currentStack()));
          }
          this._pullupLabel = val;
        },
        /**
         * pullDownFn 설정
         * @param {String} prop Function name
         * @param {Function} val pullDown 콜백함수
         */
        pullDownFn: function (prop, val) {
          if (!tau.isFunction(val)) {
            throw new TypeError(prop.concat(' option is not Function: ', val, this.currentStack()));
          }
          this._pulldownFn = val;
        },
        /**
         * pullUpFn 설정
         * @param {String} prop Function name
         * @param {Function} val pullUp 콜백함수
         */
        pullUpFn: function (prop, val) {
          if (!tau.isFunction(val)) {
            throw new TypeError(prop.concat(' option is not Function: ', val, this.currentStack()));
          }
          this._pullupFn = val;
        }
      }
    }, 'remix');

    this.onEvent(tau.rt.Event.TRANSITIONEND, this._handleTransitionEnd, this);
    this.onEvent(tau.rt.Event.COMPDRAWN, function (e, payload) {
      e.alwaysBubble();
      if (e.getSource() === this) {
        tau.getRuntime().onEvent(tau.rt.Event.ORIENTATION, this.refresh, this);
      }
    }, this);
  },

  /**
   * 랜더링을 수행한다.
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @overrides
   * @private
   */
  render: function (refresh) {
    if (refresh && this._scrollTop) {
      this.scrollTo(0, 0, '0ms');
      delete this._scrollTop;
    }

    if (this._pullToRefresh && !refresh) {
      if (this._pullToRefresh !== 'up') 
        this.setPullToRefrehState(tau.ui.ScrollPanel.PULL_PULLTOREFREH, 'down');
      if (this._pullToRefresh !== 'down') 
        this.setPullToRefrehState(tau.ui.ScrollPanel.PULL_PULLTOREFREH, 'up');
    }
    this.drawComponents(refresh);
  },
  
  /**
   * 컴포넌트, 아이템 모두를 삭제한다.
   * <p/>
   * 컴포넌트의 부모/버블링 관계 설정을 삭제한다.
   * @param {Boolean} [immediate=false]컴포넌트를 바로 draw할지 설정한다. 
   * <code>false</code>이면 객체가 draw할 때 일괄적으로 DOM Tree에 반영된다.
   * @see tau.ui.Container.removeAll
   * @overrides 
   */
  removeAll: function (immediate) {
    if (immediate) {
      this.scrollTo(0, 0, '0ms');
      delete this._scrollTop;
    } else {
      this._scrollTop = true;
    } 
    return tau.ui.Container.prototype.removeAll.apply(this, arguments);
  },

  /**
   * 하위 컴포넌트가 랜더링이 완료된 후 처리하기 위한 함수이다.
   * @private
   * @see tau.ui.ContainerDrawable.drawComponentsDone
   */
  drawComponentsDone: function () {
    // refresh 상태를 false로 초기화함. 해당값이 <code>true</code>인 경우 refresh를 처리하지 않는다.
    this._refreshDone = false;
    this._scrollReqId = tau.requestAnimationFrame(tau.ctxAware(this.initScroll, this));
  },
  
  /**
   * scroll에 대한 초기화를 수행한다. scrollbar를 생성하지는 않는다.
   * @private
   */
  initScroll: function () {
    if (!this.isVisible()) {
      return;
    }
    if (this._scrollReqId) {
      tau.cancelRequestAnimationFrame(this._scrollReqId);
      delete this._scrollReqId;
    }
    
    // 스크롤 영역을 초기화함.
    this.renderer.initScrollerSize(this.$renderData, this._hScroll, this._vScroll);
    
    // pullToRefresh 초기화
    if (this._pullToRefresh) {
      this._refreshPullToRefresh('down');
      this._refreshPullToRefresh('up');
    }
  },

  /**
   * ScrollPanel의 속성값을 초기화하고 scroll을 생성한다.
   */
  refresh: function () {
    if (!this.isVisible()) {
      return;
    }
    
    // touchstart일 때 refresh를 호출한다. 그러나 이미 initScroll를 한 상태이기 때문에 skip한다.
    if (arguments.callee.caller !== this.handleTouchStart) {
      this._refreshDone = false;
      this.initScroll();
    }
    
    var that = this, resetX = that.x, resetY = that.y, snap;
    
    if (that._hScroll){
      that.scrollerWidth = that.renderer.getScrollerSize(that.$renderData, false);
      that.scrollWidth = that.renderer.getScrollSize(that.$renderData, false);
    } else {
      that.scrollerWidth = 0;
      that.scrollWidth = 0;
    }
    if (that._vScroll){
      that.scrollerHeight = that.renderer.getScrollerSize(that.$renderData, true);
      that.scrollHeight = that.renderer.getScrollSize(that.$renderData, true);
    } else {
      that.scrollerHeight = 0;
      that.scrollHeight = 0;
    }
    that.maxScrollX = that.scrollWidth - that.scrollerWidth;
    that.maxScrollY = that.scrollHeight - that.scrollerHeight;
    that.directionX = 0;
    that.directionY = 0;

    if (that.scrollX) {
      if (that.maxScrollX >= 0) {
        resetX = 0;
      } else if (that.x < that.maxScrollX) {
        resetX = that.maxScrollX;
      }
    }
    if (that.scrollY) {
      if (that.maxScrollY >= 0) {
        resetY = 0;
      } else if (that.y < that.maxScrollY) {
        resetY = that.maxScrollY;
      }
    }
    // Snap
    if (that._snap) {
      that.maxPageX = -Math.floor(that.maxScrollX/that.scrollWidth);
      that.maxPageY = -Math.floor(that.maxScrollY/that.scrollHeight);
  
      snap = that._getSnap(resetX, resetY);
      resetX = snap.x;
      resetY = snap.y;
    }
  
    if (resetX !== that.x || resetY !== that.y) {
      that.setTransitionTime('0');
      that.setPosition(resetX, resetY, true);
    }
    
    that.scrollX = that._pullToRefreshDir === false || that.scrollerWidth > that.scrollWidth;
    //pullToRefresh 기능을 사용하거나 현재 panel 높이보다 클 경우에만 scoll 생긴다.
    that.scrollY = that._pullToRefreshDir || that.scrollerHeight > that.scrollHeight;

    // Update horizontal scrollbar
    if (that._hScroll && that._hScrollbar && that.scrollX) {
      that.scrollBarX = that.scrollBarX || new tau.ui.Scrollbar(false, that.wrapper);
      that.scrollBarX.init(that.scrollWidth, that.scrollerWidth);
    } else if (that.scrollBarX) {
      that.scrollBarX = that.scrollBarX.remove();
    }
  
    // Update vertical scrollbar  
    if (that._vScroll && that._vScrollbar && that.scrollY) {
      that.scrollBarY = that.scrollBarY || new tau.ui.Scrollbar(true, that.wrapper);
      that.scrollBarY.init(that.scrollHeight, that.scrollerHeight);
    } else if (that.scrollBarY) {
      that.scrollBarY = that.scrollBarY.remove();
    }
    this._refreshDone = true;
  },
  
  /**
   * 특정좌표로 스크롤바를 이동시킨다.
   * @param {Number} x left 포지션
   * @param {Number} y top 포지션
   * @param {Boolean} hideScrollBars 스크롤바 표시 여부
   */
  setPosition: function (x, y, hideScrollBars) {
    var that = this;
    
    that.x = x;
    that.y = y;
  
    that.element.style.webkitTransform = tau.ui.ScrollPanel.TRANSLATEOPEN + 
      that.x + 'px,' + that.y + 'px' + tau.ui.ScrollPanel.TRANSLATECLOSE;
    
    if (that._pullToRefresh && that._pullToRefresh !== 'down') {
      if (that._vScroll)
        that.renderer.initPullUpToRefresh(that.$renderData, true);
      if (that._hScroll)
        that.renderer.initPullUpToRefresh(that.$renderData, false);
    }

    // Move the scrollbars
    if (!hideScrollBars) {
      if (that.scrollBarX) {
        that.scrollBarX.setPosition(that.x);
      }
      if (that.scrollBarY) {
        that.scrollBarY.setPosition(that.y);
      }
    }
  },

  /**
   * 스크롤 이동 지연시간을 설정한다.
   * @param {Number} time 지연시간
   */
  setTransitionTime: function(time) {
    var that = this;
    
    time = time || '0';
    that.element.style.webkitTransitionDuration = time;
    
    if (that.scrollBarX) {
      that.scrollBarX.bar.style.webkitTransitionDuration = time;
      that.scrollBarX.wrapper.style.webkitTransitionDuration = '300ms';
    }
    if (that.scrollBarY) {
      that.scrollBarY.bar.style.webkitTransitionDuration = time;
      that.scrollBarY.wrapper.style.webkitTransitionDuration ='300ms';
    }
  },
    

  /**
   * 이벤트 {@link tau.rt.Event.TOUCHSTART} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see tau.ui.Component.handleTouchStart
   * @private
   */
  handleTouchStart: function(e, payload) {
    
    if (!this._refreshDone) {
      this.refresh();
    }

    if (!this.scrollX && !this.scrollY){
      return;
    }
    var that = this,
        style, matrix;

    e.preventDefault();
    //e.stopPropagation();
    
    that.scrolling = true;

    that.moved = false;
  
    that.setTransitionTime('0');
  
    // Check if the scroller is really where it should be
    if (that._momentum || that._snap) {
      style = window.getComputedStyle(that.element);
      if (style.webkitTransform && style.webkitTransform !== 'none') {
        matrix = new WebKitCSSMatrix(style.webkitTransform);
      }
      if (matrix && (matrix.e !== that.x || matrix.f !== that.y)) {
        this.unsubscribeEvent(tau.rt.Event.TRANSITIONEND, this._handleTransitionEnd, this);
        that.setPosition(matrix.e, matrix.f);
        that.moved = true;
      }
    }
  
    that.touchStartX = e.changedTouches[0].pageX;
    that.scrollStartX = that.x;
  
    that.touchStartY = e.changedTouches[0].pageY;
    that.scrollStartY = that.y;
  
    that.scrollStartTime = e.timeStamp;
  
    that.directionX = 0;
    that.directionY = 0;
  },

  /**
   * 이벤트 {@link tau.rt.Event.TOUCHMOVE} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see tau.ui.Component.handleTouchMove
   * @private
   */
  handleTouchMove: function(e, payload) {
    if (!this.scrollX && !this.scrollY){
      return;
    }
    if (!this.scrolling) {
      return;
    }
    var that = this,
      pageX = e.changedTouches[0].pageX,
      pageY = e.changedTouches[0].pageY,
      leftDelta = that.scrollX ? pageX - that.touchStartX : 0,
      topDelta = that.scrollY ? pageY - that.touchStartY : 0,
      newX = that.x + leftDelta,
      newY = that.y + topDelta;

    // TODO : ScrollPanel이 이중으로 된 경우에 문제가 발생할 수 있음. 우선 주석 처리함.
    // e.stopPropagation();

    that.touchStartX = pageX;
    that.touchStartY = pageY;
  
    // Slow down if outside of the boundaries
    if (newX >= 0 || newX < that.maxScrollX) {
      newX = that._bounce ? Math.round(that.x + leftDelta / 3) : (newX >= 0 || that.maxScrollX>=0) ? 0 : that.maxScrollX;
      if (that._pullToRefresh && that._pullToRefreshDir === false){
        that._updatePullToRefresh(newX);
      }
    } else if ((leftDelta == 0 && topDelta == 0) || // delta값에 변화가 없는 경우 scroll이 끝났다고 판단한다.
        (!this._hScroll && this._vScroll && topDelta == 0) ||
        (!this._vScroll && this._hScroll && leftDelta == 0)){
      //this.scrolling = false;
      this.moved = false;
      that.resetPosition();
      return;
    }

    if (newY >= 0 || newY < that.maxScrollY) { 
      newY = that._bounce ? Math.round(that.y + topDelta / 3) : (newY >= 0 || that.maxScrollY>=0) ? 0 : that.maxScrollY;
      if (that._pullToRefresh && that._pullToRefreshDir){
        that._updatePullToRefresh(newY);
      }
    } else if ((leftDelta == 0 && topDelta == 0) || // delta값에 변화가 없는 경우 scroll이 끝났다고 판단한다.
        (!this._hScroll && this._vScroll && topDelta == 0) ||
        (!this._vScroll && this._hScroll && leftDelta == 0)){
      //this.scrolling = false;
      this.moved = false;
      that.resetPosition();
      return;
    }
// tweaked touch move frame ratio as 30fps in EventManager
//    if (Math.abs(leftDelta) < 4 && Math.abs(topDelta) < 4) { 
//      return;
//    }
    that.setPosition(newX, newY);
    that.moved = true;
    that.directionX = leftDelta > 0 ? -1 : 1;
    that.directionY = topDelta > 0 ? -1 : 1;
  },

  /**
   * 이벤트 {@link tau.rt.Event.TOUCHEND} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see tau.ui.Component.handleTouchEnd
   * @private
   */
  handleTouchEnd: function (e, payload) {
    if (this._page){
      return this.handlePageTouchEnd(e);
    }
    return this.handleDefaultTouchEnd(e);
  },
  
  /**
   * page단위로 이벤트 {@link tau.rt.Event.TOUCHEND} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @private
   */
  handlePageTouchEnd: function(e) {
    if ((!this.scrollX && !this.scrollY) || 
        !this.scrolling || !this.moved){
      return false;
    }
    e.preventDefault();
    e.stopPropagation();
    
    this.scrolling = false;
    if (this.scrollX) {
      if (this.directionX == 1){
        this.scrollToPage('next', 0);
      } else if (this.directionX == -1) {
        this.scrollToPage('prev', 0);
      }
    } else if (this.scrollY) {
      if (this.directionY == 1){
        this.scrollToPage(0, 'next');
      } else if (this.directionY == -1) {
        this.scrollToPage(0, 'prev');
      }
    }
    return true;
  },
  
  /**
   * 기본 이벤트 {@link tau.rt.Event.TOUCHEND} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @private
   */
  handleDefaultTouchEnd: function(e) {
    if ((!this.scrollX && !this.scrollY) || 
        !this.scrolling){
      return false;
    }
    
    var that = this,
      time = e.timeStamp - that.scrollStartTime,
      momentumX, momentumY,
      newDuration = 0,
      newPositionX = that.x, newPositionY = that.y,
      snap;

    that.scrolling = false;
  
    if (!that.moved) {
      that.resetPosition();
      return;
    }


    if (that._pullToRefresh) {
      that._loadPullToRefresh('down');
      that._loadPullToRefresh('up');
    }
    
    if (!that._pullToRefresh && !that._snap && time > 250) {// Prevent slingshot effect
      that.resetPosition();
      return;
    }
    
  
    if (that._momentum) {
      momentumX = that.scrollX === true
        ? that.momentum(that.x - that.scrollStartX,
                time,
                that._bounce ? -that.x + that.scrollWidth/5 : -that.x,
                that._bounce ? that.x + that.scrollerWidth - that.scrollWidth + that.scrollWidth/5 : that.x + that.scrollerWidth - that.scrollWidth)
        : { dist: 0, time: 0 };
  
      momentumY = that.scrollY === true
        ? that.momentum(that.y - that.scrollStartY,
                time,
                that._bounce ? -that.y + that.scrollHeight/5 : -that.y,
                that._bounce ? that.y + that.scrollerHeight - that.scrollHeight + that.scrollHeight/5 : that.y + that.scrollerHeight - that.scrollHeight)
        : { dist: 0, time: 0 };

      newDuration = Math.max(Math.max(momentumX.time, momentumY.time), 1);    // The minimum animation length must be 1ms
      newPositionX = that.x + momentumX.dist;
      newPositionY = that.y + momentumY.dist;
    }
  
    if (that._snap) {
      snap = that._getSnap(newPositionX, newPositionY);
      newPositionX = snap.x;
      newPositionY = snap.y;
      newDuration = Math.max(snap.time, newDuration);
    }

    that.scrollTo(newPositionX, newPositionY, newDuration + 'ms');
  },
  
  /**
   * tau.rt.Event.TRANSITIONEND 이벤트 처리 함수
   */
  _handleTransitionEnd: function () {
    this.unsubscribeEvent(tau.rt.Event.TRANSITIONEND, this._handleTransitionEnd, this);
    this.resetPosition();
  },

  /**
   * 스크롤 바가 스크롤 패널영역을 벗어나게 되면 경계값으로 설정하고 스크롤을 이동시킨다. 
   */
  resetPosition: function () {
    var that = this,
      resetX = that.x,
      resetY = that.y;
  
    if (that.x >= 0) {
      resetX = 0;
    } else if (that.x < that.maxScrollX) {
      resetX = that.maxScrollX;
    }
  
    //if (that.y >= 0 || that.maxScrollY > 0) {
    if (that.y >= 0) {
      resetY = 0;
    } else if (that.y < that.maxScrollY) {
      resetY = that.maxScrollY;
    }
    
    if (resetX !== that.x || resetY !== that.y) {
      that.scrollTo(resetX, resetY);
    } else {
      if (that.moved) {
        that.handleScrollEnd();   // Execute custom code on scroll end
        that.moved = false;
      }

      // Hide the scrollbars
      if (that.scrollBarX) {
        that.scrollBarX.hide();
      }
      if (that.scrollBarY) {
        that.scrollBarY.hide();
      }
    }
  },
  
  /**
   * snap 값 객체를 반환한다.
   * <p/>
   * @param {Number} x left 포지션 
   * @param {Number} y top 포지션
   * @return {Object} snap 값 객체
   */  
  _getSnap: function (x, y) {
    var that = this, time;
  
    if (that.directionX > 0) {
      x = Math.floor(x/that.scrollWidth);
    } else if (that.directionX < 0) {
      x = Math.ceil(x/that.scrollWidth);
    } else {
      x = Math.round(x/that.scrollWidth);
    }
    that.pageX = -x;
    x = x * that.scrollWidth;
    if (x > 0) {
      x = that.pageX = 0;
    } else if (x < that.maxScrollX) {
      that.pageX = that.maxPageX;
      x = that.maxScrollX;
    }
  
    if (that.directionY > 0) {
      y = Math.floor(y/that.scrollHeight);
    } else if (that.directionY < 0) {
      y = Math.ceil(y/that.scrollHeight);
    } else {
      y = Math.round(y/that.scrollHeight);
    }
    that.pageY = -y;
    y = y * that.scrollHeight;
    if (y > 0) {
      y = that.pageY = 0;
    } else if (y < that.maxScrollY) {
      that.pageY = that.maxPageY;
      y = that.maxScrollY;
    }
  
    // Snap with constant speed (proportional duration)
    time = Math.round(Math.max(
        Math.abs(that.x - x) / that.scrollWidth * 500,
        Math.abs(that.y - y) / that.scrollHeight * 500
      ));
      
    return { x: x, y: y, time: time };
  },
  
  /**
   * 특정 좌표로 스크롤을 이동시킨다.
   * @param {Number} destX left 포지션 
   * @param {Number} destY top 포지션
   * @param {Number} runtime 시간
   */    
  scrollTo: function (destX, destY, runtime) {
    var that = this;
    
    if (that.x === destX && that.y === destY) {
      that.resetPosition();
      return;
    }
  
    that.moved = true;
    that.setTransitionTime(runtime || '350ms');
    that.setPosition(destX, destY);
  
    if (runtime==='0' || runtime==='0s' || runtime==='0ms') {
      that.resetPosition();
    } else {
      this.onEvent(tau.rt.Event.TRANSITIONEND, this._handleTransitionEnd, this);
    }
  },
  
  /**
   * 특정 좌표로 스크롤을 이동시킨다.
   * @param {Number} pageX left 포지션 
   * @param {Number} pageY top 포지션
   * @param {Number} runtime 시간
   */    
  scrollToPage: function (pageX, pageY, runtime) {
    var that = this, snap;
  
    that.pageX = -Math.round(that.x / that.scrollWidth);
    that.pageY = -Math.round(that.y / that.scrollHeight);
      
    if (pageX === 'next') {
      pageX = ++that.pageX;
    } else if (pageX === 'prev') {
      pageX = --that.pageX;
    }
  
    if (pageY === 'next') {
      pageY = ++that.pageY;
    } else if (pageY === 'prev') {
      pageY = --that.pageY;
    }
    pageX = -pageX * that.scrollWidth;
    pageY = -pageY * that.scrollHeight;

    if (that._snap){
      snap = that._getSnap(pageX, pageY);
      pageX = snap.x;
      pageY = snap.y;
    }

    if (pageX >= 0) {
      pageX = 0;
    } else if (Math.abs(pageX) + that.scrollWidth > that.scrollerWidth){
      pageX = -(that.scrollerWidth - that.scrollWidth);
    }
    
    if (pageY >= 0){
      pageY = 0;
    } else if (Math.abs(pageY) + that.scrollHeight > that.scrollerHeight){
      pageY = -(that.scrollerHeight - that.scrollHeight);
    }
    that.scrollTo(pageX, pageY, runtime || '500ms');
  },
  
  /**
   * 특정 좌표로 스크롤을 이동시킨다.
   */    
  scrollToElement: function (el, runtime) {
    el = typeof el == 'object' ? el : this.element.querySelector(el);
  
    if (!el) {
      return;
    }
  
    var that = this,
      x = that.scrollX ? -el.offsetLeft : 0,
      y = that.scrollY ? -el.offsetTop : 0;
  
    if (x >= 0) {
      x = 0;
    } else if (x < that.maxScrollX) {
      x = that.maxScrollX;
    }
  
    if (y >= 0) {
      y = 0;
    } else if (y < that.maxScrollY) {
      y = that.maxScrollY;
    }
  
    that.scrollTo(x, y, runtime);
  },
  
  /**
   * 운동량을 계산해서 이동 거리, 이동 지연시간 정보를 가지는 객체를 반환한다.
   * @param {Number} dist 움직인 거리
   * @param {Number} time touch 이벤트가 발생한 시간
   * @param {Number} maxDistUpper 상위 최대 경계값
   * @param {Number} maxDisLower 하위 최대 경계값
   * @return {Object} 이동거리, 이동 지연시간 정보 객체
   */    
  momentum: function (dist, time, maxDistUpper, maxDistLower) {
    var friction = 2.5,
      deceleration = 1.2,
      speed = Math.abs(dist) / time * 1000,
      newDist = speed * speed / friction / 1000,
      newTime = 0;
  
    // Proportinally reduce speed if we are outside of the boundaries 
    if (dist > 0 && newDist > maxDistUpper) {
      speed = speed * maxDistUpper / newDist / friction;
      newDist = maxDistUpper;
    } else if (dist < 0 && newDist > maxDistLower) {
      speed = speed * maxDistLower / newDist / friction;
      newDist = maxDistLower;
    }
    
    newDist = newDist * (dist < 0 ? -1 : 1);
    newTime = speed / deceleration;

    return { dist: Math.round(newDist), time: Math.round(newTime) };
  },
  
  /**
   * 스크롤이 완료된 후 커스텀 코드를 실행시키려면 오버라이드 하면 된다.
   * @see tau.ui.ScrollPanel.resetPosition
   */
  handleScrollEnd: function () {},
  
  /**
   * 리소스를 destroy한다.
   * @see tau.ui.Component.destroy
   * @overrides
   */
  destroy: function () {
    tau.getRuntime().unsubscribeEvent(tau.rt.Event.ORIENTATION, this.refresh, this);
    if (this.scrollBarX) this.scrollBarX = this.scrollBarX.remove();
    if (this.scrollBarY) this.scrollBarY = this.scrollBarY.remove();
    tau.ui.ScrollPanel.$super.destroy.apply(this, arguments);
  },
  
  /**
   * pullToRefres를 초기화한다.
   * @param {String} pullToRefresh
   * @private
   */
  _refreshPullToRefresh: function (pullToRefresh) {
    
    if (this._pullToRefresh !== pullToRefresh && this._pullToRefresh !== 'both') return;
    
    if (pullToRefresh === 'down') {
      if (this._pulldownToRefreshTimeout){
        clearTimeout(this._pulldownToRefreshTimeout);
        delete this._pulldownToRefreshTimeout;
      }
    } else {
      if (this._pullupToRefreshTimeout){
        clearTimeout(this._pullupToRefreshTimeout);
        delete this._pullupToRefreshTimeout;
      }
    } 
    // FIXME
    if (this.getPullToRefreshState(pullToRefresh) === tau.ui.ScrollPanel.LOADING_PULLTOREFREH) {
      this.setPullToRefrehState(tau.ui.ScrollPanel.COMPLEATE_PULLTOREFREH, pullToRefresh);
    } else {
      this.setPullToRefrehState(tau.ui.ScrollPanel.PULL_PULLTOREFREH, pullToRefresh);
    }
  },
  
  /**
   * pullToRefresh update
   * @param {Number} newPosition
   * @private
   */
  _updatePullToRefresh: function (newPosition) {
    if (this._pullToRefresh !== 'up' && this.getPullToRefreshState('down') !== 
      tau.ui.ScrollPanel.LOADING_PULLTOREFREH){ // down이나 both인 경우

      var offsetdown = this.renderer.getPullToRefreshSize(this.$renderData, 'down', this._pullToRefreshDir);
      if (newPosition >= offsetdown) {
        this.setPullToRefrehState(tau.ui.ScrollPanel.RELEASE_PULLTOREFREH, 'down');
      } else if (this.getPullToRefreshState('down') === tau.ui.ScrollPanel.RELEASE_PULLTOREFREH) {
        this.setPullToRefrehState(tau.ui.ScrollPanel.PULL_PULLTOREFREH, 'down');
      }
    }
    if (this._pullToRefresh !== 'down' && this.getPullToRefreshState('up') !== 
      tau.ui.ScrollPanel.LOADING_PULLTOREFREH){ // up이나 both인 경우
      var bounce, direction,
          offsetup = this.renderer.getPullToRefreshSize(this.$renderData, 'up', this._pullToRefreshDir);
      if (this._pullToRefreshDir){
        bounce = this.maxScrollY - offsetup;
        direction = this.directionY;
      } else {
        bounce = this.maxScrollX - offsetup;
        direction = this.directionX;
      }

      if (newPosition < bounce && direction === 1) {
        this.setPullToRefrehState(tau.ui.ScrollPanel.RELEASE_PULLTOREFREH, 'up');
      } else if (this.getPullToRefreshState('up') === tau.ui.ScrollPanel.RELEASE_PULLTOREFREH){
        this.setPullToRefrehState(tau.ui.ScrollPanel.PULL_PULLTOREFREH, 'up');
      }
    }
  },  
  
  /**
   * pullToRefresh를 로드한다.
   * @param {String} pullToRefresh
   * @private
   */
  _loadPullToRefresh: function (pullToRefresh) {
    
    if (this._pullToRefresh !== pullToRefresh && this._pullToRefresh !== 'both') return;

    if (this.getPullToRefreshState(pullToRefresh) !== tau.ui.ScrollPanel.RELEASE_PULLTOREFREH) return;

    this.setPullToRefrehState(tau.ui.ScrollPanel.LOADING_PULLTOREFREH, pullToRefresh);
    
    var callbackFn = this['_pull' + pullToRefresh + 'Fn'];
    
    if (callbackFn) window.setTimeout(callbackFn, 500);
    if (this['_pull' + pullToRefresh + 'ToRefreshTimeout']) 
      clearTimeout(this['_pull' + pullToRefresh + 'ToRefreshTimeout']);
    
    this['_pull' + pullToRefresh + 'ToRefreshTimeout'] = window.setTimeout(
        tau.ctxAware(this.refresh, this), 7000);
  },
  
  /**
   * PullToRefresh 상태를 설정한다.
   * <p />
   * pullToRefresh값이 없는 경우 현재 설정되어 있는 <code>down</code> 혹은 <code>up</code>의 상태를 업데이트 한다.
   * 그러나 <code><both/code>인 경우 Error를 throw한다.
   * @param {Number} [state]
   * @param {String} [pullToRefresh]
   * @throws {TypeError} 명시된 pullToRefresh이가 <code>down</code> 혹은 <code>up</code>이 아닐 경우
   */
  setPullToRefrehState: function (state, pullToRefresh) {
    if (tau.isUndefined(pullToRefresh)) pullToRefresh = this._pullToRefresh;

    if (!pullToRefresh || pullToRefresh === 'both') throw new TypeError('pullToRefresh is not down or up: '.
        concat(pullToRefresh, this.currentStack()));

    if (this.getPullToRefreshState(pullToRefresh) === state) return;
    
    var label = this.getPullToRefreshLabel(state, pullToRefresh);
    
    this['_pull' + pullToRefresh + 'ToRefreshState'] = state;
    
    this.renderer.updatePullToRefresh(
        this.$renderData, pullToRefresh, this._pullToRefreshDir, state, label);
  },

  /**
   * pullToRefreh의 상태를 반환한다.
   * <p />
   * pullToRefresh값이 없는 경우 현재 설정되어 있는 <code>down</code> 혹은 <code>up</code>의 상태를 반환한다.
   * 그러나 <code><both</code>인 경우 Error를 throw한다.
   * @param {String} [pullToRefresh]
   * @throws {TypeError} 명시된 pullToRefresh이가 <code>down</code> 혹은 <code>up</code>이 아닐 경우
   */
  getPullToRefreshState: function (pullToRefresh) {
    if (tau.isUndefined(pullToRefresh)) pullToRefresh = this._pullToRefresh;

    if (!pullToRefresh || pullToRefresh === 'both') throw new TypeError('pullToRefresh is not down or up: '.
        concat(pullToRefresh, this.currentStack()));
    
    var state = this['_pull' + pullToRefresh + 'ToRefreshState'];
    return tau.isUndefined(state) ? -1 : state;
  },
  
  /**
   * 상태에 따른 보여줄 텍스트를 반환한다.
   * <p />
   * state값이 없는 경우 현재 상태의 텍스트를 반환한다.
   * @param {Number} [state]
   * @param {String} [pullToRefresh]
   * @throws {TypeError} 명시된 pullToRefresh이가 <code>down</code> 혹은 <code>up</code>이 아닐 경우
   */
  getPullToRefreshLabel: function (state, pullToRefresh) {
    if (tau.isUndefined(pullToRefresh)) pullToRefresh = this._pullToRefresh;

    if (!pullToRefresh || pullToRefresh === 'both') throw new TypeError('pullToRefresh is not down or up: '.
        concat(pullToRefresh, this.currentStack()));
    
    if (tau.isUndefined(state)) {
      state = this.getPullToRefreshState(pullToRefresh);
    }
    
    var labels = this['_pull' + pullToRefresh + 'Label'];
    if (state == tau.ui.ScrollPanel.COMPLEATE_PULLTOREFREH && 
        labels.length == 3) state = 0;

    return labels ? labels[state] : null;
  }  
});

//------------------------------------------------------------------------------
/** @lends tau.ui.Button */
$class('tau.ui.Button').extend(tau.ui.Component).mixin(
    tau.ui.Control).define({
  
  $static: /** @lends tau.ui.Button */ {
    
    /** $dom의 label DOM에 해당하는 키 */
    LABEL_KEY: 'label',
    /** $dom의 icon DOM에 해당하는 키 */
    ICON_KEY: 'icon',
    /** $dom의 badge DOM에 해당하는 prefix */
    BADGE_PREFIX: 'badge'
  },
  
  /**
   * 생성자, 새로운 Button객체를 생성한다.
   * 
   * @class Button 클래스는 기본적으로 제공하는 버튼 컴포넌트이다.
   * <p/>
   * {@link tau.ui.Button.setLabel} 함수를 통해 기본 라벨을 설정할 수 있고,
   * 추가적으로 상태(disabled/highlighted/selected)에 따라서 라벨을 지정할 수 있다.
   * 또한 텍스트 색상, 배경이미지, 배경 색상을 지정할 수 있다.
   * {@link tau.ui.Control}을 mixin해서 컴포넌트 상태에 따라 설정된 속성들이 
   * 반영된다.
   * 
   * @example
   *  // 버튼 컴포넌트를 생성한다.
   *  var button = new tau.ui.Button();
   *  
   *  // 버튼 컴포넌트 스타일을 지정한다.
   *  button.setStyles({height: '100px', width: '100px'});
   *  
   *  // 버튼 컴포넌트의 라벨 속성을 설정한다.
   *  button.setLabel( {
   *   normal: 'default',
   *   disabled: 'disable',
   *   selected: 'selected',
   *   highlighted: 'highlighted'
   *  });
   *  
   *  // 버튼 컴포넌트의 클릭 이벤트를 처리한다.
   *  button.onEvent(tau.rt.Event.TAP, function(e, payload) {
   *   alert('버튼 클릭');
   * });
   *  // 버튼 컴포넌트를 scene에 추가한다. 
   * this.getScene().add(button);
   *  
   * @constructs
   * @extends tau.ui.Component
   * @mixins tau.ui.Control
   */
  Button: function () {//$ tau.ui.Button
    this.$control = tau.ui.Control.NORMAL;

    this.$optionize = tau.mixin(this.$optionize, {
      handler: { /** @lends tau.ui.Button */
      /**
       * 이벤트 {@link tau.rt.Event.TAP}를 처리하기 위한 콜백 함수를 설정한다.
       * @events 
       * @initoption {Function} 
       */
        tap: tau.optionize.onEvent // register tap onEvent
      }
    }, 'remix');
  },

  /**
   * Button의 라벨을 반환한다.
   * @param  {String} [key='normal'] 상태값  다음 키 값만 허용된다. {'normal', 'highlighted', 'selected', 'diasabled'} 
   * @returns {String} label 라벨
   */
  getLabel: function(key) {
    if (tau.isUndefined(key)) {
      key = tau.ui.Control.NORMAL;
    } else if (key !== tau.ui.Control.NORMAL &&
        key !== tau.ui.Control.DISABLED && key !== tau.ui.Control.SELECTED && 
        key !== tau.ui.Control.HIGHLIGHTED) {
      throw new RangeError(' key is out of range: '.concat(key, this.currentStack()));
    }
    if (!this._label) return null; 

    var label = this._label[key];
    return tau.isUndefined(label) ? this._label[tau.ui.Control.NORMAL] : label;
  },
  
  /**
   * Button에 라벨을 설정한다.
   * @example
   *  var button = new tau.ui.Button();
   *  button.setLabel({
   *   normal: 'default',
   *   disabled: 'disable',
   *   selected: 'selected',
   *   highlighted: 'highlighted'});
   * @param {String|Object} label 설정할 라벨
   */
  setLabel: function(label) {
    if (!this._label){
      this._label = {
        normal: undefined,
        disabled: undefined,
        selected: undefined,
        highlighted: undefined
      };
    }
    var old = this._label[this.$control];
    if (tau.isString(label)) {
      this._label.normal = label;
    } else if (tau.isObject(label)) {
      tau.mixin(this._label, label, true);
    }
    if (old !== this._label[this.$control]) {
      this.renderer.updateLabel(this.$renderData, this._label[this.$control]);
    }
  },
  
  /**
   * Button의 텍스트 색상을 반환한다.
   * @param  {String} [key='normal'] 상태값  다음 키 값만 허용된다. {'normal', 'highlighted', 'selected', 'diasabled'} 
   * @returns {String} textColor
   */
  getTextColor: function(key) {
    if (tau.isUndefined(key)) {
      key = tau.ui.Control.NORMAL;
    } else if (key !== tau.ui.Control.NORMAL && 
        key !== tau.ui.Control.DISABLED && key !== tau.ui.Control.SELECTED &&
        key !== tau.ui.Control.HIGHLIGHTED) {
      throw new RangeError(' key is out of range: '.concat(key, this.currentStack()));
    }
    if (!this._textColor) return null; 

    var textColor = this._textColor[key];
    return tau.isUndefined(textColor) ? this._textColor[tau.ui.Control.NORMAL] : textColor;
  },

  /**
   * Button에 라벨 텍스트 색상을 설정한다.
   * @example
   *  var button = new tau.ui.Button();
   *  button.setTextColor( {
   *   normal: 'black',
   *   selected: 'red',
   *   disabled: 'gray',
   *   highlighted: 'blue'});
   * @css
   * @param {String|Object} textColor 설정할 텍스트 color
   */
  setTextColor: function(textColor) {
    if (!this._textColor){
      this._textColor = {
        normal: null,
        disabled: null,
        selected: null,
        highlighted: null
      };
    }
    var old = this._textColor[this.$control];
    if (tau.isString(textColor)) {
      this._textColor.normal = textColor;
    } else if (tau.isObject(textColor)) {
      tau.mixin(this._textColor, textColor, true);
    }
    if (old !== this._textColor[this.$control]) {
      this.renderer.updateTextColor(this.$renderData, this._textColor[this.$control]);
    }
  },
  /**
   * Button의 배경 색상을 반환한다.
   * @param  {String} [key='normal'] 상태값  다음 키 값만 허용된다. {'normal', 'highlighted', 'selected', 'diasabled'} 
   * @returns {String} backgroundColor 배경색상
   */
  getBackgroundColor: function(key) {
    if (tau.isUndefined(key)) {
      key = tau.ui.Control.NORMAL;
    } else if (key !== tau.ui.Control.NORMAL && 
        key !== tau.ui.Control.DISABLED && key !== tau.ui.Control.SELECTED &&
        key !== tau.ui.Control.HIGHLIGHTED) {
      throw new RangeError(' key is out of range: '.concat(key, this.currentStack()));
    }
    if (!this._backgroundColor) return null; 

    var backgroundColor = this._backgroundColor[key];
    return tau.isUndefined(backgroundColor) ? this._backgroundColor[tau.ui.Control.NORMAL] : backgroundColor;
  },

  /**
   * Button에 배경 색상을 설정한다.
   * @example
   *  var button = new tau.ui.Button();
   *  button.setBackgroundColor( {
   *   normal: '#AAAAAA',
   *   selected: '#EEEEEE',
   *   disabled: '#DDDDDD',
   *   highlighted: '#CCCCCC'});
   * @css  
   * @param {String|Object} backgroundColor 설정할 backgorund color
   */
  setBackgroundColor: function(backgroundColor) {
    if (!this._backgroundColor){
      this._backgroundColor = {
        normal: null,
        disabled: null,
        selected: null,
        highlighted: null
      };
    }
    var old = this._backgroundColor[this.$control];
    if (tau.isString(backgroundColor)) {
      this._backgroundColor.normal = backgroundColor;
    } else if (tau.isObject(backgroundColor)) {
      tau.mixin(this._backgroundColor, backgroundColor, true);
    }
    if (old !== this._backgroundColor[this.$control]) {
      this.renderer.updateBackgroundColor(this.$renderData, this._backgroundColor[this.$control]);
    }
  },
  
  /**
   * Button의 backgroundImage를 반환한다.
   * @param  {String} [key='normal'] 상태값  다음 키 값만 허용된다. {'normal', 'highlighted', 'selected', 'diasabled'} 
   * @returns {String} backgroundImage
   */
  getBackgroundImage: function(key) {
    if (tau.isUndefined(key)) {
      key = tau.ui.Control.NORMAL;
    } else if (key !== tau.ui.Control.NORMAL && 
        key !== tau.ui.Control.DISABLED && key !== tau.ui.Control.SELECTED &&
        key !== tau.ui.Control.HIGHLIGHTED) {
      throw new RangeError(' key is out of range: '.concat(key, this.currentStack()));
    }
    if (!this._backgroundImage) return null; 

    var backgroundImage = this._backgroundImage[key];
    return tau.isUndefined(backgroundImage) ? this._backgroundImage[tau.ui.Control.NORMAL] : backgroundImage;
  },

  /**
   * Button에 배경이미지를 설정한다.
   * @example
   *  this.appCtx = tau.getCurrentContext();
   *  var button = new tau.ui.Button();
   *  button.setBackgroundImage( {
   *   normal: null,
   *   disabled: '/img/2.jpg',
   *   selected: '/img/3.jpg',
   *   highlighted: '/img/4.jpg'};
   * @css
   * @param {String|Object} backgroundImage 설정할 배경이미지
   */  
  setBackgroundImage: function(backgroundImage) {
    if (!this._backgroundImage){
      this._backgroundImage = {
        normal: null,
        disabled: null,
        selected: null,
        highlighted: null
      };
    }
    var old = this._backgroundImage[this.$control];
    if (tau.isString(backgroundImage)) {
      this._backgroundImage.normal = backgroundImage;
    } else if (tau.isObject(backgroundImage)) {
      tau.mixin(this._backgroundImage, backgroundImage, true);
    }
    if (old !== this._backgroundImage[this.$control]) {
      this.renderer.updateBackgroundImage(this.$renderData, this._backgroundImage[this.$control]);
    }
  },

  /**
   * @param {String} state
   * @see tau.ui.Control.handleControlChanged
   * @private
   */
  handleControlChanged: function (state) {
    tau.ui.Control.prototype.handleControlChanged.apply(this, arguments);
    if (this._label){
      this.renderer.updateLabel(this.$renderData, this.getLabel(state));
    }
    if (this._textColor){
      this.renderer.updateTextColor(this.$renderData, this.getTextColor(state));
    }
    if (this._backgroundColor){
      this.renderer.updateBackgroundColor(this.$renderData, this.getBackgroundColor(state));
    }
    if (this._backgroundImage){
      this.renderer.updateBackgroundImage(this.$renderData, this.getBackgroundImage(state));
    }
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.TextField */
$class('tau.ui.TextField').extend(tau.ui.Component).mixin(
    tau.ui.Control).define({

  $static: /** @lends tau.ui.TextField */ {
    /** TextField 입력 타입 : 텍스트*/
    TEXT: 'text',
    /** TextField 입력 타입 : 패스워드*/
    PASSWORD: 'password',
    /** TextField 입력 타입 : 숫자*/
    NUMBER: 'Number',
    /** TextField 입력 타입 : URL*/
    URL: 'url',
    /** TextField 입력 타입 : 이메일*/
    EMAIL: 'email',
    /** TextField 입력 타입 : 전화번호*/
    TEL: 'tel',  
    /** TextField 입력 타입 : 검색*/
    SEARCH: 'search',

    /** $dom의 text DOM에 해당하는 키 */
    TEXT_KEY: 'text',
    /** $dom의 clear button DOM에 해당하는 키 */
    CLEAR_KEY: 'clear',
    /** $dom의 placeholderImage DOM에 해당하는 키 */
    HOLDERIMAGE_KEY: 'image'
  },

  /**
   * 생성자, 새로운 TextField객체를 생성한다.
   * 
   * @class TextField는 단일 행의 텍스트 편집을 할 수 있도록 지원하는 텍스트 컴퍼넌트이다.
   * <p/>
   * 텍스트 입력 타입({@link tau.ui.TextField.TEXT}, 
   * {@link tau.ui.TextField.PASSWORD},{@link tau.ui.TextField.NUMBER},
   * {@link tau.ui.TextField.URL},{@link tau.ui.TextField.EMAIL}
   * {@link tau.ui.TextField.TEL},{@link tau.ui.TextField.SEARCH})을
   * {@link tau.ui.TextField.setType} 설정할 수 있고, 
   * 고정적으로 출력되는 이미지를 {@link tau.ui.TextField.setPlaceholderImage}와, 
   * 텍스트를 설정 {@link tau.ui.TextField.setPlaceholderLabel}할 수 있다.
   * <p/>
   * 또한 텍스트가 TextField 컴포넌트에 있으면 삭제 버튼을 보여서 텍스트를 
   * 클리어 {@link tau.ui.TextField.setClearButtonMode}하고 
   * TextField 컴포넌트를 클릭했을 때 곧바로 이전에 입력한 텍스르를 클리어 하게
   * 설정 {@link tau.ui.TextField.setClearsOnBeginEditing} 할 수 있다.
   * <pre>
   *  // TextField 컴포넌트를 생성한다.
   *  var text = new tau.ui.TextField();
   *  
   *  // TextField 타입을 설정한다.
   *  text.setType(tau.ui.TextField.TEXT);
   *  text.setPlaceholderLabel('input');
   *  text.setPlaceholderImage('/demo/img/1.png');
   *  text.setText("텍스를 입력하세요");
   *  text.setClearButtonMode(false);
   *  text.setStyle('width', '120px');
   *  text.setClearsOnBeginEditing(true);
   *  
   *  // TextField 컴포넌트를 scene에 추가한다.
   *  this.getScene().add(text);
   * </pre>  
   * @constructs
   * @extends tau.ui.Component
   * @mixins tau.ui.Control
   * @param {Object} [opts] TextField 옵션
   * @see tau.ui.Component 옵션을 상속받고 있음.
   */
  TextField: function (opts) {
    /** @private clear button 사용 여부 */
    this._clearButtonMode = false;

    /** @private edit 하기 위해 TextField를 touch했을 때 text를 clear할지 여부 */
    this._clearsOnBeginEditing = false;
    
    /**
     * ios의 경우 textfield에 focus인 상태(keyboard가 올라온 상태)에서 애니메이션이 발생할 경우 
     * keyboard가 내려가지 않아서 화면이 제대로 랜더링 안되는 버그가 있어서
     * touchstart 이벤트가 발생할 때 blur 이벤트 보다 먼저 발생하기 때문에 강제로 textfield를 blur시키도록 함. 
     * 화면이 제대로 
     */
    var textfield = this;
    if (tau.rt.hasTouch) { 
      this.onEvent(tau.rt.Event.COMPDRAWN, function (e, payload) {
        e.alwaysBubble();
        tau.getRuntime().onEvent(tau.rt.Event.TOUCHSTART, textfield.handleBlur, textfield);
      });
    }
  },
  
  /**
   * 리소스를 destroy한다.
   * @see tau.ui.Component.destroy
   * @overrides
   */
  destroy: function () {
    if (tau.rt.hasTouch) {
      tau.getRuntime().unsubscribeEvent(tau.rt.Event.TOUCHSTART, this.handleBlur, this);
    }
    tau.ui.TextField.$super.destroy.apply(this, arguments);
  },

  /**
   * TODO: clearButtonMode 정리가 필요함.
   * 클리어 버튼 모드인지 체크한다.
   * @returns {Boolean} <code>true</code>이면 클리어 버튼 모드임.
   */
  isClearButtonMode: function() {
    return this._clearButtonMode;
  },

  /**
   * 텍스트필드에 클리어 버튼 모드를 설정한다.
   * <code>true</code>이면 텍스트 필드에 텍스트가 있을 때 클리어 버튼이 보인다.
   * @param {Boolean} clearButtonMode 클리어 버튼 모드
   */
  setClearButtonMode: function(clearButtonMode) {
    this._clearButtonMode = clearButtonMode;
  },

  /**
   * 텍스트 필드의 텍스트를 편집하기 위해 터치했을 때 현재 있는 텍스트를 클리어할지 여부를 체크한다.
   * @returns {Boolean} 텍스트를 클리어할지 여부
   */
  isClearsOnBeginEditing: function() {
    return this._clearsOnBeginEditing;
  },

  /**
   * 텍스트 필드의 텍스트를 편집하기 위해 터치했을 때 현재 있는 텍스트를 클리어할지 여부를 설정한다.
   * @param {Boolean} clearsOnBeginEditing <code>true</code>이면 텍스트를 클리어 한다.
   */
  setClearsOnBeginEditing: function(clearsOnBeginEditing) {
    this._clearsOnBeginEditing = clearsOnBeginEditing;
  },

  /**
   * keyup 이벤트 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @private
   */
  handleKeyUp: function (e, payload){
    if (!this.isDisabled() && this.isClearButtonMode()) {
      this.renderer.updateClearButton(this.$renderData, !!this.getText());
    }
  },
  
  /**
   * 이벤트 blur 처리 함수
   * <p/>
   * 이벤트 blur를 처리하기 위해서는 오버라이드해야한다.
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see {tau.ui.Component.handleBlur} 
   * @private
   */
  handleBlur: function (e, payload) {
    if (e.getSource() !== this) this.renderer.blur(this.$renderData);

    this.setHighlighted(false);
  },
  
  /**
   * 이벤트 {@link tau.rt.Event.TAP} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see {tau.ui.Component.handleTap}
   * @private
   */
  handleTap: function (e, payload){
    var hit = e.changedTouches[0];
    // Begin editing or clear button touch sets the text to ''
    if (!this.isDisabled()) {
      this.setHighlighted(true);
      if (this.isClearsOnBeginEditing() 
          || hit && this.renderer.hasElement(this.$renderData, 
              hit.target, tau.ui.TextField.CLEAR_KEY))  {
        this.setText('');
      }
      this.renderer.focus(this.$renderData);
    }
  },

  /**
   * 텍스트필드 타입을 반환한다.
   * @return {String} type 텍스트필드 타입
   */
  getType: function() {
    return this._type;
  },

  /**
   * 텍스트필드 타입을 설정한다.
   * @param {String} type
   */
  setType: function(type) {
    if (this._type !== type){
      this._type = type;
      this.renderer.updateType(this.$renderData, type);
    }
  },

  /**
   * 텍스트를 반환한다.
   * @return {String} text 텍스트필드에 설정된 텍스트
   */
  getText: function() {
    return this.renderer.getText(this.$renderData) || '';
  },

  /**
   * 텍스트를 설정한다.
   * @return {String} value 텍스트필드에 설정할 텍스트
   */
  setText: function(value) {
    var old = this.getText();
    if (old !== value) {
      this.renderer.updateText(this.$renderData, value);
      if (this.isClearButtonMode()) {
        this.renderer.updateClearButton(this.$renderData, !!this.getText());
      }
    }
  },

  /**
   * placeholder 라벨을 반환한다.
   * @return {String} placeholderLabel placeholder 라벨
   */
  getPlaceholderLabel: function() {
    return this._placeholderLabel;
  },

  /**
   * placeholder 라벨을 설정한다.
   * 텍스트필드에 텍스트가 없는 경우 고정적으로 표시된다.
   * @param {String} placeholderLabel placeholder 라벨
   */
  setPlaceholderLabel: function(placeholderLabel) {
    if (this._placeholderLabel !== placeholderLabel){
      this._placeholderLabel = placeholderLabel;
      this.renderer.updatePlaceholderLabel(this.$renderData, placeholderLabel);
    }
  },

  /**
   * 텍스트필드가 읽기전용인지 체크한다. <code>true</code>이면 읽기전용이다.
   * @returns {Boolean} readOnly 읽기전용 여부
   */
  isReadOnly: function() {
    return this._readonly;
  },

  /**
   * 텍스트필드에 읽기전용 여부를 설정한다.
   * @param {Boolean} readOnly <code>true</code>이면 읽기전용
   */
  setReadOnly: function(readOnly) {
    if (this._readonly !== readOnly){
      this._readonly = readOnly;
      this.renderer.updateReadOnly(this.$renderData, readOnly);
    }
  },

  /**
   * 텍스트필드에 placeholder 이미지를 설정한다.
   * @param {String} image image url 
   * {@link tau.ui.ImageView} 객체 혹은 {@link tau.ui.ImageView} 옵션 
   */
  setPlaceholderImage: function(src){
    this.renderer.updatePlaceholderImage(this.$renderData, src);
  },

  /**
   * 텍스트필드의 텍스트 입력 제한값을 반환한다.
   * @returns {Number} 텍스트필드의 텍스트 입력 제한값
   */
  getMaxLength: function () {
    return this._maxlength || -1;
  },

  /**
   * 텍스트필드의 텍스트 입력 제한값을 설정한다.
   * @param {Number} length 텍스트 입력 제한값
   */
  setMaxLength: function(length) {
    if (this._maxlength !== length){
     this._maxlength = length; 
     this.renderer.updateMaxLength(this.$renderData, length);
    }
  },

  /**
   * @param {String} state
   * @see tau.ui.Control.handleControlChanged
   * @private
   */
  handleControlChanged: function (state) {
    tau.ui.Control.prototype.handleControlChanged.apply(this, arguments);
    this.renderer.updateControl(this.$renderData, state);
  }

});

//------------------------------------------------------------------------------
/** @lends tau.ui.TextArea */
$class('tau.ui.TextArea').extend(tau.ui.ScrollPanel).mixin(
    tau.ui.Control).define({
      
  $static: /** @lends tau.ui.TextArea */ {
    
    /** $dom의 control DOM에 해당하는 키 */
    CONTROL_KEY: 'control'
  },
      
  /**
   * 생성자, 새로운 TextArea컴포넌트를 생성한다.
   * 
   * @class TextArea 객체는 복수개의 행을 가진 텍스트를 편집하는 컴포넌트이다.
   * <p/> 
   * {@link tau.ui.TextField} 객체와 마찬가지로 고정 라벨을 설정 {@link tau.ui.TextArea.setPlaceholderLabel} 할 수 있다.
   * 차이점은 TextArea는 제한 없이 행을 추가할 수 있는 텍스트 편집 컴포넌트이다.
   * @example
   * // TextArea 컴포넌트를 생성한다.  
   * var textarea = new tau.ui.TextArea();
   * 
   *  // 스타일을 설정한다.
   * textarea.setStyle('top', '100px');
   * textarea.setStyle('width', '300px');
   * textarea.setStyle('height', '300px');
   *  
   *  // 고정라벨을 설정한다.
   * textarea.setPlaceholderLabel('텍스트를 입력해 주세요.');
   *  // TextArea 컴포넌트를 scene에 추가한다.
   * this.getScene().add(textarea);
   * 
   * @constructs
   * @extends tau.ui.ScrollPanel
   * @mixins tau.ui.Control
   * @param {Object} [opts] TextArea 옵션
   * 다음 옵션들은 사용하지 않는다. 이 옵션들은 무시된다.
   * <ul>
   *  <li>hScroll</li>
   *  <li>hScrollbar</li>
   *  <li>pullToRefresh</li>
   *  <li>pullDownLabel</li>
   *  <li>pullUpLabel</li>
   *  <li>pullDownFn</li>
   *  <li>pullUpFn</li>
   * </ul>
   * @see tau.ui.ScrollPanel 옵션을 상속받고 있음.
   */
  TextArea: function (opts) {//$ tau.ui.TextArea
    /** @private 수평 스크롤 여부 */
    this._hScroll = false;
    /** @private 수평 스크롤바 표시 여부 */
    this._hScrollbar = false;
    
    this.$optionize = tau.mixin(this.$optionize, {
      handler: {
        /** @overrides */
        hScroll: tau.emptyFn,
        /** @overrides */
        hScrollbar: tau.emptyFn,
        /** @overrides */
        pullToRefresh: tau.emptyFn,
        /** @overrides */
        pullDownLabel: tau.emptyFn,
        /** @overrides */
        pullUpLabel: tau.emptyFn,
        /** @overrides */
        pullDownFn: tau.emptyFn,
        /** @overrides */
        pullUpFn: tau.emptyFn,
      }
    }, 'remix');
    
    /**
     * ios의 경우 textfield에 focus인 상태(keyboard가 올라온 상태)에서 애니메이션이 발생할 경우 
     * keyboard가 내려가지 않아서 화면이 제대로 랜더링 안되는 버그가 있어서
     * touchstart 이벤트가 발생할 때 blur 이벤트 보다 먼저 발생하기 때문에 강제로 textfield를 blur시키도록 함. 
     * 화면이 제대로 
     */
    var textarea = this;
    if (tau.rt.hasTouch) { 
      this.onEvent(tau.rt.Event.COMPDRAWN, function (e, payload) {
        e.alwaysBubble();
        tau.getRuntime().onEvent(tau.rt.Event.TOUCHSTART, textarea.handleBlur, textarea);
      });
    }
  },
  
  /**
   * 이벤트 keyup 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @private
   */
  handleKeyUp: function (e, payload){
    this._dirty = true;
  },
  
  /**
   * 이벤트 blur 처리 함수
   * <p/>
   * 이벤트 blur를 처리하기 위해서는 오버라이드해야한다.
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @private
   */
  handleBlur: function (e, payload) {
    var src = e.getSource();
    
    if ((src !== this && e.getName() === tau.rt.Event.TOUCHSTART) || 
        (e.getName() === 'blur' && this.renderer.isEditMode(this.$renderData))) {
      this.renderer.updateViewMode(this.$renderData);
      this.setHighlighted(false);
      e.preventDefault();
      e.stopPropagation();
    } else if (e.getName() === 'blur' && this.renderer.isEditMode(this.$renderData)){
      this.renderer.updateViewMode(this.$renderData);
      this.setHighlighted(false);
    }
  },

  /**
   * 이벤트 {@link tau.rt.Event.TOUCHSTART} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see tau.ui.Component.handleTouchStart
   * @private
   */
  handleTouchStart: function (e, payload){
    if (!this.renderer.isEditMode(this.$renderData)){
      if (this._dirty){
        this.refresh();
        this._dirty = false;
      }
      tau.ui.TextArea.$super.handleTouchStart.apply(this, arguments);
    }
  },

  /**
   * 이벤트 {@link tau.rt.Event.TOUCHMOVE} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see tau.ui.Component.handleTouchMove
   * @private
   */
  handleTouchMove: function(e, payload) {
    if (!this.renderer.isEditMode(this.$renderData)){
      tau.ui.TextArea.$super.handleTouchMove.apply(this, arguments);
    }
  },
  
  /**
   * 이벤트 {@link tau.rt.Event.TOUCHEND} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see tau.ui.Component.handleTouchEnd
   * @private
   */
  handleTouchEnd: function (e, payload) {
    if (!this.renderer.isEditMode(this.$renderData)){
      tau.ui.TextArea.$super.handleTouchEnd.apply(this, arguments);
    }
  },

  /**
   * 이벤트 {@link tau.rt.Event.TAP} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see {tau.ui.Component.handleTap}
   * @private
   */
  handleTap: function (e, payload){
    e.preventDefault();
    e.stopPropagation();

    this.setHighlighted(true);
    if (!this.renderer.isEditMode(this.$renderData)){
      this.renderer.updateEditMode(this.$renderData, this.scrollStartY);
    }
    this.renderer.focus(this.$renderData);
  },
  
  /**
   * 리소스를 destroy한다.
   * @see tau.ui.Component.destroy
   * @overrides
   */
  destroy: function () {
    if (tau.rt.hasTouch) {
      tau.getRuntime().unsubscribeEvent(tau.rt.Event.TOUCHSTART, this.handleBlur, this);
    }
    tau.ui.TextArea.$super.destroy.apply(this, arguments);
  },
  
  /**
   * placeholder 라벨을 설정한다.
   * TextArea에 텍스트가 없는 경우 고정적으로 표시된다.
   * @param {String} placeholderLabel placeholder 라벨
   */
  setPlaceholderLabel: function (placeholderLabel) {
    if (this._placeholderLabel !== placeholderLabel){
      this._placeholderLabel = placeholderLabel;
      this.renderer.updatePlaceholderLabel(this.$renderData, placeholderLabel);
    }
  },

  /**
   * placeholder 라벨을 반환한다.
   * @return {String} placeholder 라벨
   */
  getPlaceholderLabel: function () {
    return this._placeholderLabel;
  },

  /**
   * 텍스트를 반환한다.
   * @return {String}
   */
  getText: function () {
    return this.renderer.getText(this.$renderData);
  },

  /**
   * 텍스트를 설정한다.
   * @paran {String} text 텍스트
   */
  setText: function (text) {
    this.renderer.updateText(this.$renderData, text);
  }  
});

//------------------------------------------------------------------------------
/** @lends tau.ui.PaginationBar */
$class('tau.ui.PaginationBar').extend(tau.ui.Component).mixin(
    tau.ui.Container).define({

  $static: /** @lends tau.ui.PaginationBar */ {
    /** 한번에 보여줄 페이지 수 */
    PAGE_SIZE: 5,
    
    /** 페이지 네이션 일반 타입 */
    NORMAL_TYPE: 0,
    /** 페이지 네이션 슬라이더 타입 */
    SLIDER_TYPE: 1,
    
    /** 페이지 네이션 상단에 위치 */
    TOP_DOCK: 'top',
    /** 페이지 네이션 하단에 위치 */
    BOTTOM_DOCK: 'bottom',
    /** 페이지 네이션 왼쪽에 위치 */
    LEFT_DOCK: 'left',
    /** 페이지 네이션 오른쪽에 위치 */
    RIGHT_DOCK: 'right',

    /** $dom의 prev button DOM에 해당하는 키 */
    PREV_KEY: 'prev',
    /** $dom의 next button DOM에 해당하는 키 */
    NEXT_KEY: 'next',
    /** $dom의 first button DOM에 해당하는 키 */
    FIRST_KEY: 'first',
    /** $dom의 last button DOM에 해당하는 키 */
    LAST_KEY: 'last',
    /** $dom의 pager DOM에 해당하는 키 <p/> pager item에 해당하는 키 */
    PAGER_KEY: 'pager'
  },
  
  /**
   * 생성자, 새로운 PaginationBar 객체를 생성한다.
   * 
   * @class PaginationBar는 {@link tau.ui.Table}에서 페이지네이션 처리를 위해 사용되는 클래스이다.
   * <p/>
   * @constructs
   * @extends tau.ui.Component
   * @mixins tau.ui.Container
   * @param {Object} [opts] PaginationBar 옵션
   * @param {String} [opts.type=tau.ui.PaginationBar.NORMAL_TYPE] 페이지네이션바 타입 
   * <ul>
   *  <li>{@link tau.ui.PaginationBar.NORMAL_TYPE} 페이지 버튼을 클릭하는 일반적으로 웹에서 제공하는 형태</li>
   *  <li>{@link tau.ui.PaginationBar.SLIDER_TYPE} 슬라이드를 통해서 원하는 페이지로 접근하는 형태</li>
   * </ul>
   * @param {Number} [opts.pageSize=tau.ui.PaginationBar.PAGE_SIZE] <code>opts.type</code>이 <code>default</code>인 경우 보여지는 페이지번호의 개수
   * @param {Number} [opts.listSize=tau.ui.Table.PAGE_LIST_SIZE] 페이지에서 보여지는 리스트의 개수. 설정을 하지 않은 경우 {@link tau.ui.Table.PAGE_LIST_SIZE}의 값으로 설정된다.
   * @param {Number} [opts.dock=tau.ui.PaginationBar.BOTTOM_DOCK] 페이지네이션 바가 보여질 위치
   * <ul>
   *  <li>{@link tau.ui.PaginationBar.TOP_DOCK} 테이블 상단 </li>
   *  <li>{@link tau.ui.PaginationBar.BOTTOM_DOCK} 테이블 하단</li>
   *  <li>{@link tau.ui.PaginationBar.LEFT_DOCK} 테이블 왼쪽</li>
   *  <li>{@link tau.ui.PaginationBar.RIGHT_DOCK} 테이블 오른쪽</li>
   * </ul>
   * @see tau.ui.Component 옵션을 상속받고 있음.
   */
  PaginationBar: function (opts) {//$ tau.ui.PaginationBar
    /** @private 페이지네이션바 타입 */
    this._type = tau.ui.PaginationBar.NORMAL_TYPE;
    /** @private 페이지 개수 */
    this._pageSize = tau.ui.PaginationBar.PAGE_SIZE;
    /** @private 목록 개수 */
    this._listSize = tau.ui.Table.PAGE_LIST_SIZE;
    /** @private 페이지네이션바 위치 */
    this._dock = tau.ui.PaginationBar.BOTTOM_DOCK;
    /** @private 이전, 다음 버튼 표시 여부 */
    this._prevNextBotton = true;
    /** @private 처음, 마지막 버튼 표시 여부 */
    this._firstLastButton = true;
    /** @private 페이지 정보 표시 여부 */
    this._pageInfo = false;
    /** @private 현재 페이지 */
    this._activePageNo = 1;
    
    this.$optionize = tau.mixin(this.$optionize, {
      handler: {
        /**
         * type 설정
         * @param {String} prop Function name
         * @param {String} val 페이지네이션바 타입 
         * <ul>
         *  <li>{@link tau.ui.PaginationBar.NORMAL_TYPE} 페이지 버튼을 클릭하는 일반적으로 웹에서 제공하는 형태</li>
         *  <li>{@link tau.ui.PaginationBar.SLIDER_TYPE} 슬라이드를 통해서 원하는 페이지로 접근하는 형태</li>
         * </ul>
         */
        type: function (prop, val) {
          switch (val) {
          case tau.ui.PaginationBar.SLIDER_TYPE:
            this.setPageInfoVisible(true);
            break;
          case tau.ui.PaginationBar.NORMAL_TYPE:
            break;
          default:
            throw new RangeError(prop.concat(' option is out of range: ', val, this.currentStack()));
            break;
          }
          this._type = val;
        },
        /**
         * pageSize 설정
         * @param {String} prop Function name
         * @param {Number} val 보여지는 페이지번호의 개수 
         */
        pageSize: function (prop, val) {
          if (val < 0) {
            throw new RangeError(prop.concat(' option is out of range: ', val, this.currentStack()));
          }
          this._pageSize = val;
        },
        /**
         * listSize 설정
         * @param {String} prop Function name
         * @param {Number} val 페이지에서 보여지는 리스트의 개수. 설정을 하지 않은 경우 {@link tau.ui.Table.PAGE_LIST_SIZE}의 값으로 설정된다. 
         */
        listSize: function (prop, val) {
          if (val < 0) {
            throw new RangeError(prop.concat(' option is out of range: ', val, this.currentStack()));
          }
          this._listSize = val;
        },

        /**
         * listSize 설정
         * @param {String} prop Function name
         * @param {Number} val  페이지네이션 바가 보여질 위치
         * <ul>
         *  <li>{@link tau.ui.PaginationBar.TOP_DOCK} 테이블 상단 </li>
         *  <li>{@link tau.ui.PaginationBar.BOTTOM_DOCK} 테이블 하단</li>
         *  <li>{@link tau.ui.PaginationBar.LEFT_DOCK} 테이블 왼쪽</li>
         *  <li>{@link tau.ui.PaginationBar.RIGHT_DOCK} 테이블 오른쪽</li>
         * </ul>
         */
        dock: function (prop, val) {
          switch (val) {
          case tau.ui.PaginationBar.TOP_DOCK:
          case tau.ui.PaginationBar.BOTTOM_DOCK:
          case tau.ui.PaginationBar.LEFT_DOCK:
          case tau.ui.PaginationBar.RIGHT_DOCK:
            break;
          default:
            throw new RangeError(prop.concat(' option is out of range: ', val, this.currentStack()));
            break;
          }
          this._dock = val;
        }
      }
    }, 'remix');
  },

  /**
   * 현재 페이지번호를 반환한다.
   * @returns {Number}
   */
  getActivePageNo: function () {
    return this._activePageNo || 1;
  },
  
  /**
   * 리스트 인덱스가 포함되어 있는 페이지 번호를 반환한다.
   * @param {Nubmer} listNo 리스트 인덱스번호
   * @returns {Number}
   */
  getPageNo: function (listNo) {
    return Math.ceil(listNo / (this.getListSize())) || 1;
  },

  /**
   * 이벤트 {@link tau.rt.Event.TAP} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see {tau.ui.Component.handleTap}
   * @private
   */
  handleTap: function (e, payload){
    var target = e.touches[0].target,
        hit = this.renderer.getElemPropertyName(this.$renderData, target);
    switch (hit) {
      case tau.ui.PaginationBar.PREV_KEY:
        this.update(this._activePageNo - 1);
        break;
      case tau.ui.PaginationBar.NEXT_KEY:
        this.update(this._activePageNo + 1);
        break;
      case tau.ui.PaginationBar.FIRST_KEY:
        this.update(1);
        break;
      case tau.ui.PaginationBar.LAST_KEY:
        this.update(this._last);
        break;
      case 'root': 
      case tau.ui.PaginationBar.PAGER_KEY: 
        break;
      default:
        if (!hit){
          var pageNo = parseInt(this.renderer.getPageNo(this.$renderData, target));
          if (tau.isNumber(pageNo)){
            this.update(pageNo);
          }
        }
        break;
    }
  },
  
  /**
   * 페이지네이션바 타입을 반환한다.
   * <ul>
   *   <li>{@link tau.ui.PaginationBar.NORMAL_TYPE}</li>
   *   <li>{@link tau.ui.PaginationBar.SLIDER_TYPE}</li>
   * </ul>
   * @returns {String}
   */
  getType: function () {
    return this._type;
  },
  
  /**
   * 페이저 객체를 반환한다.
   * @returns {Object}
   */
  getPager: function () {
    return this.getMapItem(tau.ui.PaginationBar.PAGER_KEY);
  },
  
  /**
   * 페이지네이션 바 위치를 반환한다.
   * <ul>
   *  <li>tau.</li>
   * </ul>
   * @returns
   */
  getDock: function () {
    return this._dock;
  },
  
  /**
   * 리스트 총 개수를 설정한다.
   * @param {Number} totalCount 
   */
  setTotalCount: function (totalCount){
    this._totalCount = totalCount;
    if (this._totalCount > 0) {
      this.update();
    }
  },
  
  /**
   * 리스트 총 개수를 반환한다.
   * @returns {Number}
   */
  getTotalCount: function () {
    return this._totalCount;
  },
  
  /**
   * 화면에 보여질 페이지 개수를 반환한다.
   * @returns {Number}
   */
  getPageSize: function (){
    return this._pageSize;
  },
  
  /**
   * 페이지에 보여질 리스트 개수를 반환한다.
   * @returns {Number}
   */
  getListSize: function () {
    return this._listSize;
  },
  
  /**
   * 이전 다음 버튼을 보여줄지 여부를 설정한다.
   * @param {Boolean} value
   */
  setPrevNextButtonVisible: function (value){
    this._prevNextBotton = value;
  },
  
  /**
   * 이전 다음 버튼을 보여줄지 여부를 체크한다.
   * @returns {Boolean}
   */
  isPrevNextButtonVisible: function () {
    return this._prevNextBotton;
  },
  
  /**
   * 처음 마지막 버튼을 보여줄지 여부를 설정한다.
   * @param {Boolean} value
   */
  setFirstLastButtonVisible: function (value){
    this._firstLastButton = value;
  },

  /**
   * 처음 마지막 버튼을 보여줄지 여부를 체크한다.
   * @returns {Boolean}
   */
  isFirstLastButtonVisible: function () {
    return this._firstLastButton;
  },
  
  /**
   * 현재 선택한 페이지 정보를 보여부줄지 여부를 설정한다.
   * @param {Boolean} value
   */
  setPageInfoVisible: function (value) {
    this._pageInfo = value;
  },
  
  /**
   * 현재 선택한 페이지 정보를 보여줄지 여부를 체크한다.
   * @returns {Boolean}
   */
  isPageInfoVisible: function () {
    return this._pageInfo;
  },
  
  /**
   * 페이지 값들을 update한다.
   * @param {Number} [active] 보여줄 페이지번호
   */
  update: function (active) {
    var prevPageNo = this._activePageNo,
        prevActiveIndex = (prevPageNo - 1) % this.getPageSize(),
        totalCount = this.getTotalCount(), bounce,
        pager = this.getPager(), parent = this.getParent();
    
    if (tau.isUndefined(totalCount) && parent instanceof tau.ui.Table){
      totalCount = parent.getTotalCount();
    }
    
    this._last = Math.ceil(totalCount / this.getListSize());
    if (active > this._last || active < 1){
      return;
    }
    
    this._activePageNo = active > 0 ? active : 1;
    
    bounce = parseInt((this._activePageNo - 1)/ this.getPageSize()) * this.getPageSize();

    this._start = bounce > 0 ? bounce + 1 : 1;
    
    if (this._start < this._activePageNo && this._start === this._end){
      ++this._start;
    }
    
    bounce = this._start + this.getPageSize() - 1;
    
    this._end = this._last < bounce ? this._last : bounce;
    
    this.renderer.updatePage(this.$renderData, this._start, this._end, this._activePageNo, 
        prevActiveIndex, this.getPageSize(), this.getType());
    if (pager){
      pager.setMaxValue(this._last);
      pager.setValue(this._activePageNo, true, true);
    }
    
    var table = this.getParent();
    if (table instanceof tau.ui.Table) {
      table.updatePagination(this._activePageNo, prevPageNo);
    }
  },
  
  /**
   * 랜더링을 수행한다.
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @see tau.ui.Component.render
   * @private 
   */
  render: function (refresh) {
    var pager = this.getPager();

    if (!pager && this.getType() === tau.ui.PaginationBar.SLIDER_TYPE) {
      var slider = new tau.ui.Slider({
        tickSize : 1, 
        minValue: 1,
        value: 1, 
        vertical: this._dock === tau.ui.PaginationBar.LEFT_DOCK || 
        this._dock === tau.ui.PaginationBar.RIGHT_DOCK
      });
      
      this.setMapItem(tau.ui.PaginationBar.PAGER_KEY, slider);
      
      slider.onEvent(tau.rt.Event.TOUCHMOVE, function(e, payload){
        var activePageNo = e.getSource().getValue();
        this.renderer.updatePageInfo(this.$renderData, activePageNo);
      }, this);
      
      slider.onEvent(tau.rt.Event.TOUCHEND, function(e, payload){
        var activePageNo = e.getSource().getValue();
        if (this.getActivePageNo() != activePageNo) {
          this.update(activePageNo);
        }
      }, this);
    }
    
    if (this.isFirstLastButtonVisible()){
      this.renderer.renderFirstLastButton(this.$renderData);
    } else if (refresh) {
      this.renderer.release(this.$renderData, tau.ui.PaginationBar.FIRST_KEY);
      this.renderer.release(this.$renderData, tau.ui.PaginationBar.LAST_KEY);
    }
    if (this.isPrevNextButtonVisible()){
      this.renderer.renderPrevNextButton(this.$renderData);
    } else if (refresh) {
      this.renderer.release(this.$renderData, tau.ui.PaginationBar.PREV_KEY);
      this.renderer.release(this.$renderData, tau.ui.PaginationBar.NEXT_KEY);
    }
    this.renderer.renderPager(this.$renderData,
        this.getPageSize(), this.getType(), this.getDock());
    
    this.drawItem(tau.ui.PaginationBar.PAGER_KEY, refresh);

    return tau.ui.PaginationBar.$super.render.apply(this, arguments);
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.Table */
$class('tau.ui.Table').extend(tau.ui.ScrollPanel).define({
  $static: /** @lends tau.ui.Table */ {
    DEFER_THRESHOLD: 20,
    PAGE_LIST_SIZE: 10,
    
    /** 한글 indexbar 타입 */
    INDEXBAR_KR: 'KR',
    /** 영문 indexbar 타입 */
    INDEXBAR_EN: 'EN',

    /** model load 이벤트 */
    EVENT_MODEL_LOAD: 'modelload',
    /** row load 이벤트 */
    EVENT_CELL_LOAD: 'cellload',
    
    /** $dom의 header DOM에 해당하는 키 <p /> header 아이템  키 */
    HEADER_KEY: 'header',
    /** $dom의 footer DOM에 해당하는 키 <p /> footer 아이템  키 */
    FOOTER_KEY: 'footer',
    /** more 아이템  key */
    MORE_KEY: 'more',
    /** indexbar 아이템  키 */
    INDEXBAR_KEY: 'indexBar',
    /** pagination 아이템  키 */
    PAGINATION_KEY: 'pagination',
    /** indicator 아이템  키 */
    INDICATOR_KEY: 'indicator'
  },

  /**
   * 생성자, 새로운 Table객체를 생성한다. 객체 생성시 그룹핑여부 지정하여 객체를 생성한다. 
   * @class Table는 header, footer, {@link tau.ui.TableCell} 컴포넌트를 
   * 컨텐트로 포함하는 컴포넌트이다.
   * <p/>
   * 사용자에 의해 직접 {@link tau.ui.Table.add}를 호출해서
   * {@link tau.ui.TableCell} 컴포넌트를 추가할 수도 있고, 
   * {@link tau.ui.Table.EVENT_MODEL_LOAD} 이벤트에 대한 리스너로 Table을 구성할 데이터를 가져오고,
   * {@link tau.ui.Table.setModel} 함수를 호출해서 row별로  
   * {@link tau.ui.Table.EVENT_CELL_LOAD} 이벤트에 대한 리스너를 등록해서 {@link tau.ui.TableCell}을 구성할 수 있다. 
   * <p/>
   * add 함수로 Table 컴포넌트를 구성하는 예제  
   * <pre>
   *   // Table 컴포넌트 객체를 생성한다.
   *   var table = new tau.ui.Table();
   *   
   *   // Table 컴포넌트를 scene에 추가한다.
   *   this.getScene().add(table);
   * 
   *   // Table header, footer아이템에 텍스트를 설정한다.
   *   table.setHeaderItem('header');
   *   table.setFooterItem('footer');
   *   
   *   // TableCell을 생성해서 Table 컴포넌트에 추가한다.
   *   for (var i=0, j=1; i < 100; i++, j++){
   *     var cell = new tau.ui.TableCell();
   *     cell.setTitle('cell ' + i);
   *     cell.setLeftItem(new tau.ui.ImageView({src: 'demo/img/' + parseInt(j % 10) + '.png')});
   *     table.add(cell);
   *   }
   * </pre>
   * <p/>
   * Table 데이터를 가져와서 tablecell을 구성하는 예제
   * <pre>
   * {
   *   ...
   *   // Table 컴포넌트를 구성하기 위해 데이터를 가져오는 콜백함수를 설정한다.
   *   table.onEvent(tau.ui.Table.EVENT_MODEL_LOAD, this.loadModel, this);
   * 
   *    // Table 컴포넌트가 랜더링될 때 TableCell 컴포넌트를 구성하기 위한 콜백함수를 설정한다.
   *   table.onEvent(tau.ui.Table.EVENT_CELL_LOAD, this.drawCell, this);
   *   ...
   * },
   * 
   * loadModel: function (e, payload) {
   *   var table = e.getSource(),
   *       start = payload.start,
   *       end = payload.end;
   *   ...
   *   // 데이터가 로드된 후 해당 데이터에 대해서 row별로 tau.ui.Table.EVENT_CELL_LOAD 이벤트를 발생시킨다.
   *   table.setModel(model);
   *   ...
   * },
   * 
   * 
   * drawCell: function (e, payload) {
   *   var table = e.getSource();
   *   var cell = new tau.ui.TableCell();
   *   cell.setTitle(payload.model.title);
   *   table.add(cell);
   * }
   * 
   * </pre>
   * @constructs
   * @extends tau.ui.ScrollPanel
   * @param {Object} [opts] Table 옵션
   * @param {Number} [opts.listSize=10] 
   * @param {Object} [opts.pagination] {@link tau.ui.PaginationBar} 옵션
   * @param {Boolean|Object} [opts.moreCell] 더보기 셀 사용여부 혹은 더보기 셀에 대한 {@link tau.ui.TableCell} 옵션 
   * @param {Boolean | Object} [opts.indicator] ActivityIndicator 사용여부 혹은 {@link tau.ui.ActivityIndicator} 옵션
   *  <p /> 
   *  {@link tau.ui.ActivityIndicator}를 설정한다.
   *  데이터를 가져오기전에 자동으로 indicator를 보여주고 {@link tau.ui.Table.setModel}를 호출한후에 
   *  자동으로 indicator를 사라지게 한다.
   * @param {Boolean} [opts.group=false] group 설정 여부
   * @param {Number} [opts.sectionSort=tau.ui.ASC_SORT] 섹션 정렬 방식
   *   <ul>
   *    <li>tau.ui.INDEX_SORT</li>
   *    <li>tau.ui.ASC_SORT</li>
   *    <li>tau.ui.DESC_SORT</li>
   *   </ul>
   * @param {Number} [opts.cellSort=tau.ui.INDEX_SORT] 테이블 셀 정렬 방식
   *   TODO
   *   <ul>
   *    <li>tau.ui.INDEX_SORT</li>
   *    <li>tau.ui.ASC_SORT</li>
   *    <li>tau.ui.DESC_SORT</li>
   *   </ul>
   * @param {Boolean|String} [opts.indexBar=false] 인덱스바 사용여부 혹은 인덱스바 타입
   * <ul>
   *  <li>{@link tau.ui.Table.INDEXBAR_KR}</li>
   *  <li>{@link tau.ui.Table.INDEXBAR_EN}</li>
   * </ul>
   * @param {Boolean} [opts.foldable=false] 하위 {@link tau.ui.TableSection}들을 펼칠 수 있는 여부
   * 다음 옵션들은 사용하지 않는다. 이 옵션들은 무시된다.
   * <ul>
   *  <li>hScroll</li>
   *  <li>hScrollbar</li>
   * </ul>
   * @see tau.ui.ScrollPanel 옵션을 상속받고 있음.
   */
  Table: function(opts) {//$ tau.ui.Table
    this._numberOfSections;
    this._numberOfRowsInSection;
    
    this.deferThreshold = tau.ui.Table.DEFER_THRESHOLD;
    
    /** @private 섹션 정보 */
    this._section = {};
    
    /**
     * The number of table rows at which to display the index list on
     * the right edge of the table.
     */
    this._sectionIndexMinimumDisplayRowCount;

    /** true if the rows can be selected */
    this._allowsSelection = false;

    /**
     * allow the table view to be editable (this must be true for
     * swipe-to-delete)
     */
    this._editable = false;

    /** boolean to control the editing state of the table view */
    this._editing = false;

    /**
     * the filter attribute to be used when searching. this property
     * maps to your data object or a property on the row object
     */
    this._filterAttribute = null;
    
    /** TODO  @private 데이터소스 */
    this._dataSource = null;
    
    /** @private 목록 개수 */
    this._listSize = tau.ui.Table.PAGE_LIST_SIZE;
    
    /** @private 그룹화 여부 */
    this._grouped = false;
    
    /** @private 섹션 펼지 닫힘 가능 여부 */
    this._foldable = false;

    /** @private 인덱스바 사용여부 */
    this._indexBarEnabled = false;
    
    /** @private 더 보기 셀 사용여부 */
    this._moreCellEnabled = false;
    
    /** @private 섹션 정렬 방식 */
    this._sectionSort = tau.ui.ASC_SORT;
    
    /** @private 수평 스크롤 여부 */
    this._hScroll = false;
    
    this.$optionize = tau.mixin(this.$optionize, {
      handler: {
        /**
         * group 설정
         * @param {String} prop Function name
         * @param {Boolean} val 그룹핑 여부 
         */
        group: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', 
                val, this.currentStack()));
          }
          this._grouped = val;
        },
        
        /**
         * 섹션 정렬 방식 설정
         * @param {String} prop Function name
         * @param {Number} [val=tau.ui.Table.ASC_SORT]
         *   <ul>
         *    <li>tau.ui.INDEX_SORT</li>
         *    <li>tau.ui.ASC_SORT</li>
         *    <li>tau.ui.DESC_SORT</li>
         *   </ul>
         */
        sectionSort: function (prop, val) {
          if (!tau.isNumber(val) || val < 0 || val > 2) {
            throw new RangeError(prop.concat(' option is out of range: ', val, 
                this.currentStack()));
          }          
          this._sectionSort = val;
        },
        
        /**
         * foldable 설정
         * @param {String} prop Function name
         * @param {Boolean} val fold 여부 
         */
        foldable: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', 
                val, this.currentStack()));
          }
          this._foldable = val;
        },
        
        /**
         * listSize 설정
         * @param {String} prop Function name
         * @param {Number} val 페이지에서 보여지는 리스트의 개수. 설정을 하지 않은 경우 {@link tau.ui.Table.PAGE_LIST_SIZE}의 값으로 설정된다. 
         */
        listSize: function (prop, val) {
          if (val < 0) {
            throw new RangeError(prop.concat(' option is out of range: ', val, this.currentStack()));
          }
          this._listSize = val;
        },
        
        /**
         * pagination 설정
         * @param {String} prop Function name
         * @param {Boolean} val 페이지네이션 여부 
         */
        pagination: function (prop, val) {
          if (!tau.isBoolean(val) && !tau.isObject(val)) {
            throw new TypeError(prop.concat(' option is not String or Object: ', 
                val, this.currentStack()));
          }
          if (val === false) return;

          this.setMapItem(tau.ui.Table.PAGINATION_KEY, new tau.ui.PaginationBar(val));
        },
        
        /**
         * 인덱스바 타입을 설정한다. 
         * @param {String} prop Function name
         * @param {String} val 인덱스바 타입
         * <ul>
         *  <li>{@link tau.ui.Table.INDEXBAR_KR}</li>
         *  <li>{@link tau.ui.Table.INDEXBAR_EN}</li>
         * </ul>
         */  
        indexBar: function (prop, val) {

          if (!tau.isBoolean(val) && !tau.isString(val)) {
            throw new TypeError(prop.concat(' option is not Boolean or Object: ', 
                val, this.currentStack()));
          }
          if (val === false) {
            return;
          } else if (val !== tau.ui.Table.INDEXBAR_KR && 
              val !== tau.ui.Table.INDEXBAR_EN) {
            throw new RangeError(prop.concat(' option is out of range: ', 
                val, this.currentStack()));
          } 
          
          this._indexBarEnabled = val;
          this._vScrollbar = false;
          
          val = val || tau.ui.Table.INDEXBAR_KR;
          var indexBar = new tau.ui.IndexBar(val);
          this.setMapItem(tau.ui.Table.INDEXBAR_KEY, indexBar);
          if (this._dataSource && this._dataSource._opts){
            this._dataSource.opts.getGroupName = function(instance){
              return indexBar.getIndexChar(instance, this.groupField);
            };
          }
        },

        /**
         * {@link tau.ui.ActivityIndicator}를 설정한다.
         * 데이터를 가져오기전에 자동으로 indicator를 보여주고 {@link tau.ui.Table.setModel}를 호출한후에 
         * 자동으로 indicator를 사라지게 한다.  
         * @param {String} prop Function name
         * @param {Boolean | Object} val 옵션
         */
        indicator: function (prop, val) {

          if (!tau.isBoolean(val) && !tau.isObject(val)) {
            throw new TypeError(prop.concat(' option is not Boolean or Object: ', 
                val, this.currentStack()));
          }
          
          if (val) {
            this.setMapItem(tau.ui.Table.INDICATOR_KEY, 
                new tau.ui.ActivityIndicator(tau.mixin({message: 'Loading...'}, val, true)));
            this._indicator = this.getIndicatorItem();
          }
        },
        
        /**
         * 테이블 more cell를 설정한다.
         * @param {String} prop Function name
         * @param {Boolean | Object} val {@link tau.ui.TableCell} 옵션
         */   
        moreCell: function (prop, val) {

          if (!tau.isBoolean(val) && !tau.isObject(val)) {
            throw new TypeError(prop.concat(' option is not Boolean or Object: ', 
                val, this.currentStack()));
          }
          
          if (val) {
            this._moreCellEnabled = true;
            this.setMapItem(tau.ui.Table.MORE_KEY, new tau.ui.TableCell(
                tau.mixin({
                  title: 'more',
                  leftItem: new tau.ui.ActivityIndicator(),
                  visible: false
                }, val, true)
              )
            );
          }
        },
        /** @overrides */
        hScroll: tau.emptyFn
      }
    }, 'remix');
  },
 
  /**
   * 상위 클래스의 메소드를 Override한다. 선택된 테이블 Cell이 변경되었을 경우를
   * 처리한다.
   */
  propagateEvent: function (e, payload) {
    switch (e.getName()) {
    case tau.ui.TableCell.EVENT_SELECTED:
      this.handleCellSelected(e, payload);
      e.stopPropagation();
      break;
    case tau.ui.TableSection.EVENT_FOLDED:
      this.refresh();
      break;
    }
    tau.ui.Table.$super.propagateEvent.apply(this, arguments);
  },
  
  /**
   * 버튼을 통해 TableSection을 접고 펼칠 수 있는 기능이 가능할 지 설정한다.
   * @param {Boolean} enable
   */
  setFoldable: function (enable) {
    this._foldable = enable;
    if (this.isDrawn() && this._grouped) {
      var sections = this.getComponents();
      
      for(var i=0, len = sections.length; i < len; i++) {
        if (sections[i] instanceof tau.ui.TableSection) {
          tableSection.setFoldable(enable);
        }
      }
    }
  },
  
  /**
   * 해당하는 배열의 섹션을 펼친다.
   * @param {Number[]|String[]} indexes 섹션 인덱스 배열 혹은 섹션 그룹텍스트 배열
   */
  setFoldedSections: function (indexes) {
    if (!tau.isArray(indexes)) {
      throw new TypeError('indexes is not Array: '.concat(indexes, this.currentStack()));
    }
    this._foldedIndexes = indexes;
    
    if (this.isDrawn()) {
      this._foldSections();
    }
  },
  
  /**
   * 섹션을 펼친다.
   */
  _foldSections: function () {
    var tableSection, 
        indexes = this._foldedIndexes;
    
    if (!indexes)
      return;

    for(var i=0, len = indexes.length; i < len; i++) {
      if (tau.isNumber(indexes[i])) {
        tableSection = this.getComponent(indexes[i]);
      } else if (tau.isString(indexes[i])) {
        tableSection = this.getTableSectionFromGroupName(indexes[i]);
      } else {
        throw new TypeError(i + ' index is not Nubmer of String: '.
            concat(indexes[i], this.currentStack()));
      }
      tableSection.setFolded(true);
    }
    delete this._foldedIndexes;
  },
  
  /**
   * TableSection을 접고 펼칠 수 있는 지 여부를 반환한다.
   * @returns {Boolean}
   */
  isFoldable: function () {
    return this._foldable || false;
  },
  
  /**
   * 컴포넌트를 삭제한다.
   * <p/>
   * 컴포넌트의 부모/버블링 관계 설정을 삭제한다. 
   * @param {tau.ui.Component|Number} arg 삭제할 컴포넌트 혹은 인덱스
   * @param {Boolean} [immediate=false]컴포넌트를 바로 draw할지 설정한다. 
   * <code>false</code>이면 객체가 draw할 때 일괄적으로 DOM Tree에 반영된다. 
   * @returns {Boolean} 컴포넌트가 삭제가 완료되었다면 <code>true</code>
   * @overrides
   * @see tau.ui.Container.remove
   */
  remove: function (arg, immediate) {
    var children = this.getComponents(),
        _section;
    
    if (arg instanceof tau.ui.Component) {
      _section = arg;
    } else if (tau.isNumber(arg)) {
      _section = children[arg];
    }
    if (_section instanceof tau.ui.TableSection && this._section){
      delete this._section[encodeURIComponent(_section.getGroupName())];
    }
    return tau.ui.Table.$super.remove.apply(this, arguments);
  },
  
  /**
   * <code>{@link tau.ui.Drawable}</code> 인스턴스의 루트 DOM element를 반환한다.
   * <p/>
   * 루트 DOM element가 없는 경우 DOM element를 생성해서 반환한다.
   * <code>key</code>가 있는 경우 해당 키의 parent가 되는 DOM Element를 반환한다.
   * <code>createElement</code>가 <code>true</code>인 경우 parent DOM Element를 생성해서 반환한다.
   * @param {String} key $dom 키값
   * @param {Boolean} [createElement=false] 
   * @returns {HTMLElement} DOM element
   * @overrides
   */
  getDOM: function (key, createElement) {
    if (key === tau.ui.CONTENT_KEY) {
      var pagination = this.getPaginationItem();
      
      if (pagination) {
        var i = this.getComponents().length - this.getDrawableComponents().length,
        pageNo = pagination.getPageNo(i);
        return this.renderer.getPageNode(this.$renderData, pageNo);
      }
    }
    return tau.ui.PaginationBar.$super.getDOM.apply(this, arguments);
  },
  
  /**
   * 인덱스바의 인덱스(텍스트)에 해당하는 {@link tau.ui.TableSection}을 반환한다.
   * <p >
   * 해당하는 TableSection이 없는 경우 가장 인접한 {@link tau.ui.TableSection}을 반환한다.
   * @param {String} indexChar 인덱스바 인덱스
   * @returns {tau.ui.TableSection}
   */
  getTableSectionFromIndexChar: function (indexChar) {
    var indexBar = this.getMapItem(tau.ui.Table.INDEXBAR_KEY);
    if (indexBar) {
      var sectionType = indexBar.getSectionType(),
          tableSection,
          index = sectionType.indexOf(decodeURIComponent(indexChar));
      
      for(var i= index; i >=0; i--) {
        tableSection = this.getTableSectionFromGroupName(
            this.renderer.getTableSectionFromIndexChar(this.$renderData, sectionType[i]));
        if (tableSection) {
          return tableSection;
        }
      }
    }
    return null;
  },
  
  /**
   * 인덱스바의 인덱스(텍스트)에 해당하는 {@link tau.ui.TableSection}을 반환한다.
   * @param {String} groupName 그룹텍스트
   * @returns {tau.ui.TableSection}
   */
  getTableSectionFromGroupName: function (groupName, create) {
    var section = null;

    if (groupName && !tau.isString(groupName)) {
      throw new TypeError('groupName is not String: '.concat(groupName, this.currentStack()));
    }
    if (groupName) {
      section = encodeURIComponent(groupName);
    }
    
    var tableSection = this._section[section];
    
    if (create && !tableSection ) {
      this._section[section] = new tau.ui.TableSection({
        groupName: groupName,
        foldable: this._foldable});
      tableSection = this._section[section]; 
    }
    return tableSection;
  },
  
  /**
   * 페이지네이션바를 업데이트한다.
   * <p/>
   * 이전 페이지번호는 해제하고 현재 페이지번호가 선택되도록 업데이트한다.
   * @param {Number} activePageNo 현재 페이지번호
   * @param {Number} prevPageNo 이전 페이지번호
   */
  updatePagination: function (activePageNo, prevPageNo) {
    // 데이터가 없는 경우 가져와야 함.
    if (this.renderer.updatePage(this.$renderData, activePageNo, prevPageNo)){
      this.loadModel();
    }
    this.scrollTo(0,0, '0ms');
  },

  /**
   * 아이템을 랜더링을 수행한다.
   * @param {String} key 
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @private
   * @overrides
   */
  drawItem: function (key, refresh) {
    var item = this.getMapItem(key);
    switch (key) {
    case tau.ui.Table.HEADER_KEY:
      if (tau.isString(item)) {
        this.renderer.updateHeader(this.$renderData, item);
        return;
      }
      break;
    case tau.ui.Table.FOOTER_KEY:
      if (tau.isString(item)) {
        this.renderer.updateFooter(this.$renderData, item);
        return;
      }
      break;
    }
    tau.ui.Table.$super.drawItem.apply(this, arguments);
  },
  
  /**
   * 랜더링을 수행한다.
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @overrides
   * @private
   */
  render: function (refresh) {
    var  paginationItem = this.getPaginationItem();

    this.drawItem(tau.ui.Table.INDICATOR_KEY, refresh);
    this.drawItem(tau.ui.Table.MORE_KEY, refresh);
    this.drawItem(tau.ui.Table.HEADER_KEY, refresh);
    this.drawItem(tau.ui.Table.FOOTER_KEY, refresh);
    
    if (paginationItem){
      this.renderer.updatePaginationDock(this.$renderData, paginationItem.getDock(), refresh);
      this.drawItem(tau.ui.Table.PAGINATION_KEY, refresh);
    }
    
    this.drawItem(tau.ui.Table.INDEXBAR_KEY, refresh);
    
    this._foldSections();
    
    return tau.ui.Table.$super.render.apply(this, arguments);
  },
  
  /**
   * 페이지네이션바 아이템을 반환한다.
   * @returns {tau.ui.PaginationBar} 페이지네이션바
   */
  getPaginationItem: function () {
    return this.getMapItem(tau.ui.Table.PAGINATION_KEY);
  },
  
  /**
   * 페이지네이션을 위해 리스트의 총 개수를 반환한다.
   * <p/>
   * {@tau.ui.PaginationBar.getTotalCount}에서 값이 없을 경우
   * 데이블셀 개수를 반환한다.
   * @returns {Number}
   */
  getTotalCount: function () { 
    var totalCount = 0,
        pagination = this.getPaginationItem();
    if (pagination){
      totalCount = pagination.getTotalCount();
    }
    return totalCount || this.getComponents().length;
  },
  
  /**
   * @name tau.ui.Table.setStyle
   * @function
   * 스타일을 설정한다.
   * <p/>
   * <ul>
   *  <li>
   *    <code>cellHeight</code> : 셀의 크기를 설정할 수 있다.
   *    val를 <code>'auto'</code>로 설정한 경우에는
   *    테이블 셀의 <code>title</code>, <code>subTitle</code>의 크기에 따라 테이블 셀의 크기가 늘어난다.
   *  </li>
   *  <li><code>cellLeftItemWidth</code> 셀의 leftItem의 width를 설정할 수 있다.</li>
   *  <li><code>cellRightItemWidth</code> 셀의 leftItem의 width를 설정할 수 있다.</li>
   * <ul>
   *  
   * @example
   * var table = new tau.ui.Table({styles: {cellHeight: 'auto'});
   * table.setStyle('cellHeight', 'auto');
   * table.setStyle('cellHeight', '100px');
   * table.setStyle('cellLeftItemWidth', '100px');
   * table.setStyle('cellRightItemWidth', '30%');
   * @overrides tau.ui.Drawable.prototype.setStyle
   * @param {String} attr 스타일 속성
   * @param {String} val 스타일 값
   * @see tau.ui.Drawable.setStyle
   * @see tau.ui.Table.renderer.updateStyle
   */

  /**
   * @name tau.ui.Table.setStyleClass
   * @function
   * 인스턴스의 메인 DOM 스타일 클래스를 설정한다.
   * @example
   * var table = tau.ui.Table();
   * table.setStyleClass({
   *  cellContent: 'titleleft',
   *  cellHeight: 'auto',
   *  section: 'sectiongroup'
   * });
   * @param {Object} styleClass 컴포넌트 스타일 클래스. 
   * @param [styleClass.shape] 컴포넌트 모양에 대한 스타일 클래스
   * @param [styleClass.degree] 컴포넌트 styleClass.shape에 대해 강, 기본, 약으로 설정.
   * <ul>
   *  <li><code>strong</code></li>
   *  <li><code>weak</code></li>
   * </ul>
   * @param [styleClass.size]컴포넌트 크기에 대한 스타일 클래스. <code>auto</code> 값 설정 가능하다. contentitem 크기에 따라 자동으로 늘어난다.
   * @param [styleClass.type] 컴포넌트 타입에 대한 스타일 클래스
   * @param [styleClass.cellContent] 테이블셀 에 대한 스타일 클래스.
   *  다음값이 설정이 가능하다.  
   *  <ul>
   *    <li><code>titleleft</code> title이 왼쪽 subtitle이 오른쪽에 위치한다.</li>
   *    <li><code>titleright</code>  title이 오르쪽 subtitle이 왼쪽에 위치한다.</li>
   *  </ul>
   * @param [styleClass.cellHeight] 테이블셀 크기에 대한 스타일 클래스. <code>auto</code> 값 설정 가능하다.
   * @param [styleClass.section] 섹션에 대한 스타일 클래스. <code>sectionGroup</code> 값 설정 가능하다.
   * @returns {Boolean} 스타일 클래스 설정이 완료된 경우 <code>true</code>
   * @see tau.ui.Drawable.setStyleClass
   */
  
  /**
   * 테이블에 데이터소스를 설정한다.
   * @param {Object} datasource 데이터소스
   */
  setDatasource: function (datasource){
    if (datasource) {
      if (this._dataSource) {
        this._dataSource.unsubscribeEvent(tau.ui.Table.EVENT_MODEL_LOAD, this.setModel, this);
      }
      datasource.onEvent(tau.ui.Table.EVENT_MODEL_LOAD, this.setModel, this);
    }
    this._dataSource = datasource;
  },

  /**
   * 이벤트 {@link tau.rt.Event.TOUCHSTART} 처리 함수
   * <p/>
   * 이벤트 {@link tau.rt.Event.TOUCHSTART}를 처리하기 위해서는 오버라이드해야한다.
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @private
   */
  handleTouchStart: function (e, payload) {
    tau.ui.Table.$super.handleTouchStart.apply(this, arguments);
    if (!this._refreshDone) this.initScroll();
  },
  
  /**
   * 선택된 테이블 셀이 변경되었을 경우를 처리한다. 
   * @param {tau.rt.Event} e <code>tau.ui.TableCell.EVENT_SELECTED</code>이벤트
   * @param {Object} payload payload object
   */
  handleCellSelected: function (e, payload) {
    var before,
        current = e.getSource(); // selected cell
    if (this._selectedIdx) {
      before = this.cellAt(this._selectedIdx);
      if (before) before.setSelected(false);
    }
    if (current === this.getMapItem(tau.ui.Table.MORE_KEY)) {
      current.setSelected(false);

      var indicator = current.getLeftItem();
      if (indicator instanceof tau.ui.ActivityIndicator) this._indicator = indicator;
      this.loadModel(this._indicator ? true : false);
      return;
    }
    this._selectedIdx = this.indexOf(current);
    this.fireEvent(tau.rt.Event.SELECTCHANGE, 
        {'current': current, 'before': before});
  },
  
  /**
   * 하위 컴포넌트가 랜더링이 완료된 후 처리하기 위한 함수이다.
   * @private
   * @see tau.ui.ScrollPanel.drawComponentsDone
   */
  drawComponentsDone: function () {
    var pagination = this.getPaginationItem();
    if (pagination){
      pagination.update(1);
    }
    tau.ui.Table.$super.drawComponentsDone.apply(this, arguments);
  },

  /**
   * FIXME section이 있는 경우 section 내부에서의 index임.
   * 선택된 셀의 인덱스를 반환한다.
   * @return {Number} 선택된 셀의 인덱스
   */
  getSelectedIndex: function () {
    return this._selectedIdx;
  },

  /**
   * 셀에 설정된 텍스트에서 섹션 텍스트를 반환한다.
   * <p/>
   * {@link tau.ui.IndexBar}가 설정되어 있는 경우 
   * {@link tau.ui.IndexBar.getIndexChar}를 반환한다. 그렇지 않은 경우
   * {@link tau.ui.TableCell.getTitle}의 첫번째 인덱스의
   * 텍스트를 반환한다.
   * @param {tau.ui.TableCell} cell 셀 컴포넌트
   * @return {String}
   */
  getGroupName: function (cell){
    var string  = groupName =  cell.getGroupName();

    if (this._indexBarEnabled){
      if (this._dataSource){
        string = this._dataSource.getGroupName(groupName);
      } else {
        var indexBar = this.getMapItem(tau.ui.Table.INDEXBAR_KEY);
        string = indexBar.getIndexChar(groupName);
      }
    } else if (this._dataSource){
      string = this._dataSource.getGroupName(groupName);
    }
    return string ? decodeURIComponent(string) : null;
  },
  
  /**
   * 컴포넌트를 하위 아이템으로 추가한다.
   * <p/>
   * 컴포넌트의 부모/버블링 관계 설정을 하고 
   * 컴포넌트에서 이벤트를 처리하지 않아도 현재 인스턴스에서 처리하도록 한다.
   * <code>immediate</code>가 <code>false</code>인 경우 {@link tau.rt.Event.COMPADDED}
   * 이벤트를 발생시킨다.
   * @param {tau.ui.TableCell|tau.ui.TableSection} comp 현재 인스턴스에 추가할 컴포넌트
   * @param {Number} [index] 특정 위치에 컴포넌트 DOM element를 추가한다. 
   * @param {Boolean} [immediate=false]컴포넌트를 바로 draw할지 설정한다. 
   * <code>false</code>이면 객체가 draw할 때 일괄적으로 DOM Tree에 반영된다. 
   * @returns {Boolean} 컴포넌트가 추가가 완료되었다면 <code>true</code>
   * @throws {TypeError} 명시된 comp가 {@link tau.ui.TableCell}, {@link tau.ui.TableSection}의 객체가 아닐 경우
   * @throws {RangeError} 명시된 index가 범위를 벗어났을 때
   * @overrides
   */
  add: function (comp, index, immediate) {
    if (this._grouped) {
      var groupName, tableSection;
      
      if (comp instanceof tau.ui.TableCell) {
        
        groupName = this.getGroupName(comp);
        tableSection = this.getTableSectionFromGroupName(groupName, true);
        tableSection.add(comp, index, immediate);

        if (this._sectionSort !== tau.ui.INDEX_SORT) { // 섹션 정렬
          var array= [];
          if (this._section){
            for (var prop in this._section) {
              array.push(prop);
            }
            array.sort();
            if (this._sectionSort === tau.ui.DESC_SORT) array.reverse();
          }
          index = array.indexOf(encodeURIComponent(groupName));
          array = null;
        }
        
      } else if (comp instanceof tau.ui.TableSection) {
        tableSection = comp;
        groupName = tableSection.getGroupName();
        
        if (!this.getTableSectionFromGroupName(groupName)){
          this._section[encodeURIComponent(groupName)] = tableSection;
        }
      }
      comp = tableSection;
      var indexBar = this.getMapItem(tau.ui.Table.INDEXBAR_KEY);
      if (indexBar) {
        // FIXME
        tableSection.setIndexChar(indexBar.getIndexChar(groupName));
      }
      
    } else if (!(comp instanceof tau.ui.TableCell) && 
        !(comp instanceof tau.ui.TableSection)){
      throw new TypeError(comp + " is not an instance of tau.ui.TableCell or " +
          "tau.ui.TableSection: " + this.currentStack());
    }
    return tau.ui.Container.prototype.add.call(this, comp, index, immediate);
  },
  
  /**
   * 테이블 indicator를 반환한다.
   * @return {tau.ui.ActivityIndicator} indicator
   */ 
  getIndicatorItem: function () {
    return this.getMapItem(tau.ui.Table.INDICATOR_KEY);
  },

  /**
   * 테이블 header를 반환한다.
   * @return {String|tau.ui.Component} header
   */ 
  getHeaderItem: function () {
    return this.getMapItem(tau.ui.Table.HEADER_KEY);
  },

  /**
   * 테이블 header를 설정한다.
   * @param {String|tau.ui.Component} headerItem header 텍스트|header 아이템 컴포넌트
   * @return {Boolean} header가 설정완료되면 <code>true</code>를 반환한다.
   */ 
  setHeaderItem: function (headerItem) {
    if (tau.isString(headerItem) || 
        headerItem instanceof tau.ui.Component || !headerItem) {

      if (this.isDrawn()) {
        if (tau.isString(headerItem)){
          this.renderer.updateHeader(this.$renderData, headerItem);
        } else if (this.getHeaderItem() instanceof tau.ui.Component) {
          this.renderer.releaseElement(this.$renderData, tau.ui.Table.HEADER_KEY);
        } else if (tau.isString(this.getHeaderItem())) {
          this.renderer.updateHeader(this.$renderData, null);
        }
      }
      return this.setMapItem(tau.ui.Table.HEADER_KEY, headerItem, true);
    }
    return false;
  },

  /**
   * 테이블 footer를 반환한다.
   * @return {String|tau.ui.Component} footer
   */ 
  getFooterItem: function () {
    return this.getMapItem(tau.ui.Table.FOOTER_KEY);
  },
  
  /**
   * 테이블 footer를 설정한다.
   * @param {String|tau.ui.Component} footerItem footer 텍스트|footer 아이템 컴포넌트
   * @return {Boolean} header가 설정완료되면 <code>true</code>를 반환한다.
   */   
  setFooterItem: function (footerItem) {
    if (tau.isString(footerItem) || 
        footerItem instanceof tau.ui.Component || !footerItem) {

      if (this.isDrawn()) {
        if (tau.isString(footerItem)){
          this.renderer.updateFooter(this.$renderData, footerItem);
        } else if (this.getFooterItem() instanceof tau.ui.Component) {
          this.renderer.releaseElement(this.$renderData, tau.ui.Table.FOOTER_KEY);
        } else if (tau.isString(this.getFooterItem())) {
          this.renderer.updateFooter(this.$renderData, null);
        }
      }
      return this.setMapItem(tau.ui.Table.FOOTER_KEY, footerItem);
    }
    return false;
  },  
  
  /**
   * 테이블 more cell를 반환한다.
   * @return {tau.ui.TableCell}
   */ 
  getMoreCellItem: function () {
    return this.getMapItem(tau.ui.Table.MORE_KEY);
  },
  
  /**
   * 셀 더 가져오기 부분을 설정한다.
   * @private
   * @param {Boolean} visible 셀 더 가져오기 표시 여부
   */
  _setMoreCell: function (visible) {
    if (this.getPaginationItem()){
      // TODO : totalCount가 없는 경우 more버튼 말고 next 버튼으로 처리하는것이 어떻까?
      return;
    }
    if (visible && this._moreCellEnabled) {
      var moreItem = this.getMoreCellItem();
      moreItem.setSelected(false);
      moreItem.setVisible(visible);
    } else {
      this.renderer.releaseElement(this.$renderData, tau.ui.Table.MORE_KEY);
    }
  },

  /**
   * 지정된 인덱스에 해당하는 TableCell을 반환한다.
   * @param {Array} index 검색하고자 하는 TableCell의 인덱스 
   * @returns {tau.ui.TableCell} 인덱스에 해당하는 TableCell 객체
   * @throws {TypeError} 인덱스 객체가 Array가 아닐경우  
   */
  cellAt: function (index) {
    var item, items;
    if (!index.length) {
      throw new TypeError('Invalid index notation in Table!');
    }
    items = this.getComponents();
    for (var i = 0, len = index.length; i < len; i++) {
      item = items[index[i]];
      if (item && item.isMixinOf(tau.ui.Container)) { // if TableSection
        items = item.getComponents();
      }
    }
    return item;
  },
  
  /**
   * 데이터를 불러온다.
   * <p/>
   * 데이터소스가 설정된 경우 데이터소스에서 데이터를 불러오고, 그렇지 않은 경우
   * {@link tau.ui.Table.EVENT_MODEL_LOAD} 이벤트에 대한 리스너를 통해 데이터를 불어온다.
   * @param {Boolean} [useIndicator]
   */
  loadModel: function (useIndicator) {
    var pgNo, start, size,
        pagination = this.getPaginationItem();
    
    if (pagination) {
      pgNo = pagination.getActivePageNo();
      size = pagination.getListSize();
      start = ((pgNo - 1) * size);
    } else {
      size = this._listSize;
      start = this.getNumberOfCells();
    }
    
    if (useIndicator === true && this._indicator) {
      this._indicator.start();
    }
    
    if (this._dataSource) {
      this._dataSource.loadModel();
    } else {
      this.fireEvent(tau.ui.Table.EVENT_MODEL_LOAD, {'start': start, 
        'size': size, 'page': pgNo});
    }
  },
  
  /**
   * 테이블에 표현할 Cell의 개수를 설정한다.
   * 내부적으로 {@link tau.ui.Table.EVENT_CELL_LOAD} 이벤트를 발생시킨다.
   * @param {Number} num count for table cell to load 
   */
  addNumOfCells: function (num) {
    var pagination,
        offset = this.getNumberOfCells();

    if (num == 0) {
      this._setMoreCell(false);
      // pagination 처리
      pagination = this.getPaginationItem();
      if (pagination) {
        pagination.setTotalCount(offset);
      }
    } else {
      num = num || this._listSize;
      for (var i = 0; i < num; i++) {
        this.fireEvent(tau.ui.Table.EVENT_CELL_LOAD, 
            {'index': i, 'offset': offset}, -1); // -1: no async
      }

      if (this.isDrawn(true)){
        this.defer = true;
        var scene = this.getScene();
        if (scene){
          scene.update();
        }
      }

      this._setMoreCell(this._dataSource 
          ? this._dataSource.hasNext() : num >= this._listSize);
    }

    this.endActivityIndicator();
  },

  /**
   * 현재 활성화되어 있는 ActivityIndicator를 끝마친다.
   */
  endActivityIndicator: function () {
    if (this._indicator) this._indicator.end();
  },
  
  /**
   * 현재 테이블의 TableCell개수를 반환한다.
   * @returns {Number} TableCell의 개수
   */
  getNumberOfCells: function () {
    var count = 0, items = this.getComponents();
    if (this._grouped) {
      for (var i = 0, len = items.length; i < len; i++) {
        count += items[i].getComponents().length;
      }
    } else {
      count = items.length;
    }
    return count;
  },

  /**
   * 현태 테이블에서 선택된 Cell의 선택해제 시킨다.
   */
  clearSelection: function () {
    var cell;
    if (this._selectedIdx) {
      cell = this.cellAt(this._selectedIdx);
      cell.setSelected(false);
      delete this._selectedIdx;
    }
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.TableSection */
$class('tau.ui.TableSection').extend(tau.ui.Component).mixin(
    tau.ui.Container).define({

  $static: /** @lends tau.ui.TableSection */ {
    /** $dom의 header DOM에 해당하는 키 */
    HEADER_KEY: 'header',
    /** $dom의 bar DOM에 해당하는 키 */
    BAR_KEY: 'bar',
    /** $dom의 fold 버튼 DOM에 해당하는 키 */
    FOLD_KEY: 'fold',
    /** 펼치고 접혔을때 이벤트 */
    EVENT_FOLDED: 'folded'
  },

  /**
   * 생성자, 새로운 TableSection객체를 생성한다. 
   * 
   * @class 하위 컴포넌트인 {@link tau.ui.TableCell}에 대한 그룹핑을 위한 컴포넌트이다.
   * <p/>
   * {@link tau.ui.Table} 컴포넌트 내부에서만 사용되는 컴포넌트이다. 
   * @constructs
   * @extends tau.ui.Component
   * @mixins tau.ui.Container
   * @param {Object} opts TableSection 옵션
   * @param {Boolean} [opts.foldable=false] 버튼을 통해 TableSection을 접고 펼칠 수 있는 기능이 가능할 지 설정한다. 
   * @param {Boolean} [opts.descending=false] 그룹텍스트 내림차순 여부
   * @see tau.ui.Component
   */
  TableSection: function (opts) {//$ tau.ui.TableSection
    /** @private 내림차순 여부 */
    this._descending = false;
    /** @private 섹션 펼지 닫힘 가능 여부 */
    this._foldable = false;
    /** @private 섹션 펼지 닫힘 여부 */
    this._folded = false;
    
    this._groupName = null;

    this.$optionize = tau.mixin(this.$optionize, {
      handler: {
        /**
         * descending 설정
         * @param {String} prop Function name
         * @param {Boolean} val descending 여부 
         */
        descending: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          this._descending = val;
          
        },
        /**
         * foldable 설정
         * @param {String} prop Function name
         * @param {Boolean} val fold 여부 
         */
        foldable: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          this._foldable = val;
        }
      }
    }, 'remix');
  },
  
  /**
   * 이벤트 {@link tau.rt.Event.TAP} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see {tau.ui.Component.handleTap}
   * @private
   */
  handleTap: function (e, payload){
    if (this.isFoldable() && e.getSource() === this){
      this.setFolded(!this.isFolded(), true);
    }
  },
  
  /**
   * groupName 설정
   * @param {String} val 그룹텍스트 
   */
  setGroupName: function (val) {
    this._groupName = val;
  },
  
  /**
   * indexbar에 대한 인덱스 문자
   * @param {String} indexChar
   */
  setIndexChar: function (indexChar) {
    if (this._indexChar !== indexChar) {
      this.renderer.updateIndexChar(this.$renderData, this._indexChar, indexChar);
      this._indexChar = indexChar;
    }
  },
  
  /**
   * 인덱스 문자를 반환한다.
   * @returns {String}
   */
  getIndexChar: function () {
    return this._indexChar;
  },
  
  /**
   * TableSection을 접고 펼칠 수 있는 지 여부를 반환한다.
   * @returns {Boolean}
   */
  isFoldable: function () {
    return this._foldable || false;
  },
  
  /**
   * TableSection을 접을 지, 펼지 여부 설정
   * @param {Boolean} folded
   * @param {Boolean} [animated=false]
   */
  setFolded: function (folded, animated) {
    if (this.isFoldable() && this.isFolded() !== folded) {
      var that = this, callbackFn;
      if (this.isDrawn()) {
        callbackFn = function () {
          that.fireEvent(tau.ui.TableSection.EVENT_FOLDED);
        };
        this.renderer.setFolded(this.$renderData, folded, callbackFn, animated);
      }
      this._folded = folded;
    }
  },
  
  /**
   * 접여져 있는지 여부 체크
   * @returns {Boolean}
   */
  isFolded: function () {
    return this._folded;
  },
  
  /**
   * 섹션 텍스트를 반환한다.
   * @see tau.ui.Table.getGroupName
   * @return {String} 
   */
  getGroupName: function (){
    if (this._groupName === '%23'){
      this._groupName = '~';
    }
    return this._groupName;
  },
  
  /**
   * 랜더링을 수행한다.
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @private
   */
  render: function (refresh) {
    if (this._foldable || refresh) {
      this.renderer.setFoldable(this.$renderData, this._foldable);
      this.renderer.setFolded(this.$renderData, this._folded);
    }
    this.renderer.updateGroupstring(this.$renderData, this.getGroupName());
    this.drawComponents(refresh);
  }
}); 

//------------------------------------------------------------------------------
/** @lends tau.ui.IndexBar */
$class('tau.ui.IndexBar').extend(tau.ui.Component).mixin(
    tau.ui.Control).define({
  $static: /** @lends tau.ui.IndexBar */ {
    /** 한글 인덱스바에 출력할 인덱스 텍스트 */
    KR_INDEXBAR  : 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎA*F*K*P*U*Z#',
    /** 한글 인덱스 섹션 */
    KR_SECTIONS  : 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎABCDEFGHIJKLMNOPQRSTUVWXYZ#',
    /** 한글 인덱스 섹션 필터링 */
    KR_SECTIONS_FILTER: 'ㄲㄸㅃㅆㅉ',
    /** 영문 인덱스바에 출력할 인덱스 텍스트 */
    EN_INDEXBAR  : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#',
    /** 영문 인덱스 섹션 */
    EN_SECTIONS  : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'
  },

  /**
   * 생성자, 새로운 IndexBar객체를 생성한다. 객체 생성시 인덱트바 타입과 부모 DOM Element
   * 를 이용하여 객체를 생성한다.
   * 
   * @class 인덱스바는 테이블의 섹션으로 빠르게 이동하는데 사용된다.
   * <p/>
   * 사용자가 인덱스바의 아이템을 터치하면 인덱스와 근접한 {@link tau.ui.Table} 컴포넌트의 
   * 섹션 영역으로 이동한다.
   * 현재 {@link tau.ui.Table}에서만 사용되고 있다.  
   * @constructs
   * @extends tau.ui.Component
   * @mixins tau.ui.Control 
   * @param {type} type 인덱스바 타입
   * <ul>
   *  <li>{@link tau.ui.Table.INDEXBAR_KR}</li>
   *  <li>{@link tau.ui.Table.INDEXBAR_EN}</li>
   * </ul>
   * @see tau.ui.Component
   */
  IndexBar: function (type) {//$ tau.ui.IndexBar
    if (type !== tau.ui.Table.INDEXBAR_KR && type !== tau.ui.Table.INDEXBAR_EN) {
      throw new RangeError('type is out of range: '.concat(type, this.currentStack()));
    }
    /** @private 인덱스바 타입 */
    this._type = type;
    /** @private 선택된 인덱스 */
    this._selectedIndex = -1;
  },
  
  
  /**
   * 인덱스 텍스트를 반환한다.
   * @param {Object} model 데이터모델
   * @param {String} groupField 그룹필드
   * @return {String} 인덱스 텍스트
   */   
  getIndexChar: function (model, groupField){
    
    switch(this._type){
      case tau.ui.Table.INDEXBAR_KR: return this.getIndexChar_KR(model, groupField);
      case tau.ui.Table.INDEXBAR_EN: return this.getIndexChar_EN(model, groupField);
    }
  },

  /**
   * 한글 인덱스바에서 인덱스 텍스트를 반환한다.
   * @private
   * @param {Object} model 데이터모델
   * @param {String} groupField 그룹필드
   * @return {String} 인덱스 텍스트
   */   
  getIndexChar_KR: function(model, groupField){
    var letter,  
        limitChar = /[~!\#$^&\=+|:;?"<,.>']/,
        groupName, groupCode, index,
        letters = this.getSectionType();
    
    if (tau.isObject(model)){
      groupName = model.get(groupField).trim().replace(limitChar, "")[0];
      groupCode = model.get(groupField).trim().replace(limitChar, "").charCodeAt(0);
    } else if (tau.isString(model)){
      groupName = model.trim().replace(limitChar, "")[0];
      groupCode = model.trim().replace(limitChar, "").charCodeAt(0);
    }
    
    index = letters.indexOf(groupName);
    
    if (groupName >= '0' && groupName <= '9') {
      return '#';
    }
    
    if (index == -1){
      letter = groupCode - 0xAC00;
      index = parseInt(((letter - (letter % 28)) / 28) / 21);
    }
    if (tau.ui.IndexBar.KR_SECTIONS_FILTER.indexOf(letters[index]) != -1) {
      index = index -1;
    }
    return letters[index] || groupName;
  },

  /**
   * 알파벳 인덱스바에서 인덱스 텍스트를 반환한다.
   * @private
   * @param {Object} model 데이터모델
   * @param {String} groupField 그룹필드
   * @return {String} 인덱스 텍스트
   */   
  getIndexChar_EN: function(model, groupField){
    var limitChar = /[~!\#$^&\=+|:;?"<,.>']/,
        groupName, index,
        letters = this.getSectionType();
    
    if (tau.isObject(model)){
      groupName = model.get(groupField).trim().replace(limitChar, "")[0];
    } else if (tau.isString(model)){
      groupName = model.trim().replace(limitChar, "")[0];
    }
    groupName = (groupName || '').toUpperCase();
    
    index = letters.indexOf(groupName);
    
    if (groupName >= '0' && groupName <= '9') {
      return '#';
    }
    return letters[index] || groupName;
  },

  /**
   * 인덱스바의 타입을 설정한다.
   * @param {String} type 인덱스바 타입
   * <ul>
   *  <li>{@link tau.ui.Table.INDEXBAR_KR}</li>
   *  <li>{@link tau.ui.Table.INDEXBAR_EN}</li>
   * </ul>
   */   
  setType: function (type){
    this._type = type; 
  },

  /**
   * 인덱스바의 타입을 반환한다.
   * @return {String} 인덱스바 타입
   */   
  getType: function (){
    return this._type;
  },

  /**
   * 인덱스바의 인덱스 스트링들 반환한다.
   * <p/>
   * 랜더러에서 인덱스바에 인덱스를 출력하기 위해 사용됨.
   * @return {String} 인덱스 스트링
   */   
  getIndexBarType: function (){
    switch(this._type){
      case tau.ui.Table.INDEXBAR_KR: return tau.ui.IndexBar.KR_INDEXBAR;
      case tau.ui.Table.INDEXBAR_EN: return tau.ui.IndexBar.EN_INDEXBAR;
    }
    return null;
  },

  /**
   * 인덱스바의 섹션 스트링을 반환한다.
   * @return {String} 섹션 스트링
   */   
  getSectionType: function (){
    switch(this._type){
      case tau.ui.Table.INDEXBAR_KR: return tau.ui.IndexBar.KR_SECTIONS;
      case tau.ui.Table.INDEXBAR_EN: return tau.ui.IndexBar.EN_SECTIONS;
    }
    return null;
  },
  
  /**
   * 이벤트 {@link tau.rt.Event.TOUCHSTART} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see tau.ui.Component.handleTouchStart
   * @private
   */
  handleTouchStart: function (e, payload){
    this.setHighlighted(true);
    this.handleTouchMove(e);
  },

  /**
   * 이벤트 {@link tau.rt.Event.TOUCHEND} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see tau.ui.Component.handleTouchEnd
   * @private
   */
  handleTouchEnd: function (e, payload) {
    e.preventDefault();
    e.stopPropagation();
    var that = this;
    window.setTimeout(function(){
      that.setHighlighted(false);
    }, 300);
    this._selectedIndex = null;
  },

  /**
   * 이벤트 {@link tau.rt.Event.TOUCHMOVE} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see tau.ui.Component.handleTouchMove
   * @private
   */
  handleTouchMove: function(e, payload) {
    if (e.getName() === tau.rt.Event.TOUCHMOVE) {
      e.preventDefault();
      e.stopPropagation();
    }
    var selectedIndex = this.renderer.getSelectedIndex(this.$renderData, e.touches[0]);
    if (selectedIndex && this._selectedIndex != selectedIndex){
      var parent = this.getParent();
      if (parent instanceof tau.ui.Table){
        var section = parent.getTableSectionFromIndexChar(selectedIndex);
        if (section instanceof tau.ui.TableSection) {
          parent.scrollToElement(section.getDOM(), '0ms');
        }
      }
      this._selectedIndex = selectedIndex;
    }
  },
  
  /**
   * 랜더링을 수행한다.
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @private
   */
  render: function (refresh) {
    if (!refresh){
      var indexes = this.getIndexBarType();
      if (indexes){
        this.renderer.renderIndex(this.$renderData, indexes);
      }
    }
    return tau.ui.IndexBar.$super.render.apply(this, arguments);
  }
});


//------------------------------------------------------------------------------
/** @lends tau.ui.TableCell */
$class('tau.ui.TableCell').extend(tau.ui.Component).mixin(
    tau.ui.Control).define({

  $static: /** @lends tau.ui.TableCell */ {
    
    /** $dom의 content DOM에 해당하는 키 <p /> title 아이템  키 */
    TITLE_KEY: 'title',
    /** $dom의 content DOM에 해당하는 키 <p /> subtitle 아이템  키 */
    SUBTITLE_KEY: 'subtitle',
    /** $dom의 left DOM에 해당하는 키 <p /> left 아이템  키 */
    LEFT_KEY: 'left',
    /** $dom의 right DOM에 해당하는 키 <p /> right 아이템  키 */
    RIGHT_KEY: 'right',
    /** cell selection 이벤트 */
    EVENT_SELECTED: 'cellselected',
  },
  
  /**
   * 생성자, 새로운 TableCell객체를 생성한다.
   * 
   * @class 테이블 셀은 테이블 객체의 하위 컴포넌트로서 하나의 행에 해당하며 행에 대한
   * UI를 구성하고 액션을 정의할 수 있다.
   * <p/>
   * {@link tau.ui.Table} 객체에서는 TableCell 객체만 추가할 수 있다.
   * <pre>
   *  // TableCell 컴포넌트를 생성한다.
   * var cell = new tau.ui.TableCell();
   *  // 제목을 설정한다.
   * cell.setTitle('cell1');
   *  // 왼쪽 아이템을 설정한다.
   * cell.setLeftItem(new tau.ui.ImageView({src: '/demo/img/1.png'}));
   * </pre>
   * @extends tau.ui.Component
   * @mixins tau.ui.Control
   * @mixins tau.ui.Container
   * @constructs
   * @param {Object} [opts] TableCell 옵션
   * @see tau.ui.Component 옵션을 상속받고 있음
   */
  TableCell: function (opts) {//$ tau.ui.TableCell
    
    /** @private left, right, content item을 관리하기 위한 container 객체 */
    this._container = new tau.ui.Container({delegator: this});
    
    this._groupName = null;

    this.$optionize = tau.mixin(this.$optionize, {
      handler: {
        tap: tau.optionize.onEvent // register tap onEvent
      }
    }, 'remix');
  },
  
  /**
   * @name tau.ui.TableCell.setStyleClass
   * @function 
   * 인스턴스의 메인 DOM 스타일 클래스를 설정한다.
   * @example
   * var cell = tau.ui.TableCell();
   * cell.setStyleClass({
   *  content: 'titleleft',
   *  size: 'auto'
   * });
   * @param {Object} styleClass 컴포넌트 스타일 클래스.
   * @param [styleClass.shape] 컴포넌트 모양에 대한 스타일 클래스
   * @param [styleClass.degree] 컴포넌트 styleClass.shape에 대해 강, 기본, 약으로 설정.
   * <ul>
   *  <li><code>strong</code></li>
   *  <li><code>weak</code></li>
   * </ul>
   * @param [styleClass.size]컴포넌트 크기에 대한 스타일 클래스. <code>auto</code> 값 설정 가능하다. contentitem 크기에 따라 자동으로 늘어난다.
   * @param [styleClass.type] 컴포넌트 타입에 대한 스타일 클래스
   * @param [styleClass.content] 컴포넌트 컨텐트 아이템에 대한 스타일 클래스.
   *  다음값이 설정이 가능하다.  
   *  <ul>
   *    <li><code>titleleft</code> title이 왼쪽 subtitle이 오른쪽에 위치한다.</li>
   *    <li><code>titleright</code>  title이 오르쪽 subtitle이 왼쪽에 위치한다.</li>
   *  </ul>
   * @returns {Boolean} 스타일 클래스 설정이 완료된 경우 <code>true</code>
   * @see tau.ui.Drawable.setStyleClass
   */

  /**
   * @name tau.ui.TableCell.setStyle
   * @function 
   * 스타일을 설정한다.
   * <p/>
   * <ul>
   *  <li><code>cellLeftItemWidth</code> 셀의 leftItem의 width를 설정할 수 있다.</li>
   *  <li><code>cellRightItemWidth</code> 셀의 leftItem의 width를 설정할 수 있다.</li>
   * <ul>
   *  
   * @example
   * var tableCell = new tau.ui.TableCell({styles: {cellHeight: 'auto'});
   * tableCell.setStyle('cellLeftItemWidth', '100px');
   * tableCell.setStyle('cellRightItemWidth', '30%');
   * @overrides tau.ui.Drawable.prototype.setStyle
   * @param {String} attr 스타일 속성
   * @param {String} val 스타일 값
   * @see tau.ui.Drawable.setStyle
   * @see tau.ui.TableCell.renderer.updateStyle
   */
  
  /**
   * 랜더링을 수행한다.
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @private
   */
  render: function (refresh) {
    var contentItem = this.getContentItem();
    
    this._container.drawItem(tau.ui.TableCell.LEFT_KEY, refresh);

    if (contentItem) {
      this._container.drawItem(tau.ui.CONTENT_KEY, refresh);
    } else {
      this.renderer.updateTitle(this.$renderData, this.getTitle());
      if (this.getSubTitle()){
        this.renderer.updateSubtitle(this.$renderData, this.getSubTitle());
      }
    }
    this._container.drawItem(tau.ui.TableCell.RIGHT_KEY, refresh);
    return tau.ui.TableCell.$super.render.apply(this, arguments);
  },

  /**
   * 이벤트 {@link tau.rt.Event.TOUCHCANCEL} 가 발생했을의 처리로직을 구현하며 현재
   * TableCell이 선택되어 있는 상황이면 이를 선택되지 않은 상태로 반전한다.
   * @param {tau.rt.Event} e Event 객체
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체
   * @private
   */
  handleTouchCancel: function (e, payload) {
    if (!this.isDisabled()) {
      if (this.isHighlighted()) {
        this.setHighlighted(false);
      }
    }
    tau.ui.TableCell.$super.handleTouchCancel.apply(this, arguments);
  },
  
  /**
   * 이벤트 {@link tau.rt.Event.TOUCHSTART} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see tau.ui.Component.handleTouchStart
   * @private
   */
  handleTouchStart: function (e, payload){
    if (!this.isDisabled()){
      var that = this;
      if (this.timeout) {
        clearTimeout(this.timeout);
        delete this.timeout;
      }
      this.timeout = window.setTimeout(function () {
        that.setHighlighted(true);
      }, 100);
    }
  },

  /**
   * 이벤트 {@link tau.rt.Event.TOUCHMOVE} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see tau.ui.Component.handleTouchMove
   * @private
   */
  handleTouchMove: function(e, payload) {
    if (this.timeout) {
      clearTimeout(this.timeout);
      delete this.timeout;
    }
    if (!this.isDisabled()){
      if (this.isHighlighted()){
        this.setHighlighted(false);
      }
    }
  },
  
  /**
   * 이벤트 {@link tau.rt.Event.TAP} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see {tau.ui.Component.handleTap}
   * @private
   */
  handleTap: function (e, payload){
    if (this.timeout) {
      clearTimeout(this.timeout);
      delete this.timeout;
    }
    e.preventDefault();

    if (!this.isDisabled()) {
      if (!this.isSelected()) {
        this.setSelected(true);
        this.fireEvent(tau.ui.TableCell.EVENT_SELECTED);
      }
    }
  },
  
  /**
   * Content 아이템을 반환한다.
   * @returns {Object|String} 컴포넌트/스트링
   */
  getContentItem: function () {
    return this._container.getMapItem(tau.ui.CONTENT_KEY);
  },

  /**
   * content 아이템을 설정한다.
   * @param {tau.ui.Component} contentItem 설정할 아이템
   * @returns {Boolean} Content 아이템이 설정되었다면 <code>true</code>
   * @throws {TypeError} 명시된 comp가 {@link tau.ui.Component}의 객체가 아닐 경우
   */
  setContentItem: function (contentItem) {
    if (contentItem instanceof tau.ui.Component) {
      this.renderer.clearContentItem(this.$renderData);
      return this._container.setMapItem(tau.ui.CONTENT_KEY, contentItem, true);
    } else if (!contentItem) {
      return this._container.removeMapItem(tau.ui.CONTENT_KEY, true);
    } else {
      throw new TypeError(contentItem + " is not an instance of tau.ui.Component: "
          + this.currentStack());
    }
    return false;
  },

  /**
   * Left 아이템을 반환한다.
   * @returns {tau.ui.Component} LeftItem 컴포넌트
   */
  getLeftItem: function () {
    return this._container.getMapItem(tau.ui.TableCell.LEFT_KEY);
  },

  /**
   * Left 아이템을 설정한다.
   * @param {tau.ui.Component} leftItem 설정할 Left 아이템
   * @returns {Boolean} Left 아이템이 설정되었다면 <code>true</code>
   * @throws {TypeError} 명시된 comp가 {@link tau.ui.Component}의 객체가 아닐 경우
   */
  setLeftItem: function (leftItem) {
    if (leftItem instanceof tau.ui.Component) {
      return this._container.setMapItem(tau.ui.TableCell.LEFT_KEY, leftItem, true);
    } else if (!leftItem) { 
      return this._container.removeMapItem(tau.ui.TableCell.LEFT_KEY, true);
    } else {
      throw new TypeError(leftItem + " is not an instance of tau.ui.Component: "
          + this.currentStack());
    }
    return false;
  },

  /**
   * Right 아이템을 반환한다.
   * @returns {tau.ui.Component} RightItem 컴포넌트
   */
  getRightItem: function () {
    return this._container.getMapItem(tau.ui.TableCell.RIGHT_KEY);
  },

  /**
   * Right 아이템을 설정한다.
   * @param {tau.ui.Component} rightItem 설정할 Right 아이템
   * @returns {Boolean} Right 아이템이 설정되었다면 <code>true</code>
   * @throws {TypeError} 명시된 rightItem가 {@link tau.ui.Component}의 객체가 아닐 경우
   */
  setRightItem: function (rightItem) {
    if (rightItem instanceof tau.ui.Component) {
      return this._container.setMapItem(tau.ui.TableCell.RIGHT_KEY, rightItem, true);
    } else if (!rightItem) {
      return this._container.removeMapItem(tau.ui.TableCell.RIGHT_KEY, true);
    } else {
      throw new TypeError(rightItem + " is not an instance of tau.ui.Component: "
          + this.currentStack());
    }
    return false;
  },
  
  /**
   * 셀의 메인 제목을 설정한다.
   * @param {String} title 메인 제목
   */
  setTitle: function(title) {
    if (this._title !== title){
      this._title = title;
      if (!this.getContentItem() && this.isDrawn()){
        this.renderer.updateTitle(this.$renderData, title);
      }
    }
  },

  /**
   * 셀의 메인 제목을 반환한다.
   * @return {String} 메인 제목
   */
  getTitle: function() {
    return this._title;
  },
  
  /**
   * 셀의 부제목을 설정한다.
   * @param {String} title 메인 제목
   */
  setSubTitle: function(subtitle) {
    if (this._subtitle !== subtitle){
      this._subtitle = subtitle;
      if (!this.getContentItem() && this.isDrawn()){
        this.renderer.updateSubtitle(this.$renderData, subtitle);
      }
    }
  },
  
  /**
   * 셀의 부제목을 반환한다.
   * @return {String} 부제목
   */
  getSubTitle: function() {
    return this._subtitle;
  },
  
  /**
   * 그룹텍스트를 설정한다.
   * TODO : 이벤트 처리 해야함.
   * @param {String} groupName
   */
  setGroupName: function(groupName) {
    this._groupName = groupName;
    if (this.isDrawn()){
      this.fireEvent('changeGroupName');
    }
  },
  
  /**
   * 그룹텍스트를 반환한다.
   * @returns {String}
   */
  getGroupName: function() {
    return this._groupName;
  },
  
  /**
   * 리소스를 destory한다.
   * @see tau.ui.Component.destory
   */
  destroy: function () {
    this._container.release();
    return tau.ui.TableCell.$super.destroy.apply(this, arguments);
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.ImageView */
$class('tau.ui.ImageView').extend(tau.ui.Component).define({

  /**
   * 생성자, 이미지 경로를 이용하여 새로운 객체를 생성한다.
   * 
   * @class 이미지 뷰는 단일 이미지를 표시하거나 여러 이미지를 애니메이션으로 동작하게
   * 표시해주는 컴포넌트이다.
   * <p/>
   * 이미지들을 애니메이션 동작하기 위해 duration과 frequency를 컨트롤할 수 있다.
   * TODO : 여러 이미지 제공
   * <pre>
   * // 이미지 경로를 지정해서 ImageView 컴포넌트를 생성한다.
   * var image = new tau.ui.ImageView({src: '/img/1.jpg'});
   * 
   * // 스타일을 설정한다.
   * image.setStyle('width', '100px');
   * image.setStyle('height', '100px');
   * // ImageView 컴포넌트를 scene에 추가한다.
   * this.getScene().add(image);
   * </pre>
   * 
   * @constructs
   * @extends tau.ui.Component
   * @param {Object} [opts] ImageView 옵션
   * @see tau.ui.Component 옵션을 상속받고 있음
   */
  ImageView: function(opts) {//$ tau.ui.ImageView
  },

  /**
   * 이미지 경로를 설정한다.
   * @param {String} src 이미지 경로
   */
  setSrc: function(src) {
    if (this._src !== src) {
      this._src = src;
      this.renderer.updateSrc(this.$renderData, src);
    }
  },
  
  /**
   * 이미지 경로를 반환한다.
   * @returns {String}
   */
  getSrc: function () {
    return this._src;
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.Label */
$class('tau.ui.Label').extend(tau.ui.Component).define({

  $static: /** @lends tau.ui.Label */ {
    /** $dom의 text DOM에 해당하는 키 */
    TEXT_KEY: 'text'
  },

  /**
   * @class 라벨 객체는 scene에 텍스트를 배치하기 위한 컴퍼넌트이다.
   * <p/>
   * 라벨은 단일행 혹은 여러 행의 읽기 전용 텍스트를 표시한다.
   * {@link tau.ui.Label.setNumberOfLines}를 통해서 출력할 행 수를 설정한다.  
   * <pre>
   * // Label 컴포넌트를 생성한다.
   * var label = new tau.ui.Label();
   * 
   * label.setStyle('width', '100px');
   * label.setStyle('height', '100px');
   * 
   * // 출력한 행수를 지정한다. 
   * label.setNumberOfLines(3);
   * label.setText('hello world');
   * 
   * // Label 컴포넌트를 scene에 추가한다.
   * this.getScene().add(label);
   * </pre>
   * 
   * @constructs
   * @extends tau.ui.Component
   * @param {Object} [opts] Label 옵션
   * @see tau.ui.Component 옵션을 상속받고 있음
   */
  Label: function(opts) {//$ tau.ui.Label
    /** @private 화면에 표시할 텍스트 라인 수 */
    this._numberOfLines = 0;
  },

  /**
   * 라벨 텍스트를 반환한다.
   * @returns {String} text 라벨 텍스트
   */
  getText: function() {
    return this._text;
  },

  /**
   * 라벨 텍스트를 설정한다.
   * @param {String} text 라벨 텍스트
   */
  setText: function(text) {
    if (this._text !== text){
      this._text = text;
      this.renderer.updateText(this.$renderData, text);
    }
  },

  /**
   * 표시할 라벨 행의 수를 반환한다.
   * @returns {Number} 라벨 행의 수
   */
  getNumberOfLines: function() {
    return this._numberOfLines;
  },

  /**
   * 표시할 라벨 행의 수를 설정합니다.
   * @param {Number} numberOfLines 라벨 행의 수
   */
  setNumberOfLines: function(numberOfLines) {
    if (this._numberOfLines !== numberOfLines){
      this.renderer.updateNumberOfLines(this.$renderData, numberOfLines);
    }
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.TextView */
$class('tau.ui.TextView').extend(tau.ui.ScrollPanel).define({
  
  /**
   * 생성자, 새로운 TextView객체를 생성한다.
   * 
   * @class 텍스트 뷰 객체는 여러 행의 읽기 전용 텍스트를 표시하는 컴포넌트이다.
   * <p/>
   * Label 컴포넌트와는 다르게 텍스트 뷰 객체 사이즈보다 텍스트가 커지는 경우 스크롤을
   * 지원한다.
   * <pre> 
   * // TextView 컴포넌트를 생성한다.
   * var textView = new tau.ui.TextView();
   * // 스타일을 지정한다.
   * textView.setStyles({width: '320px', height: '300px'});
   * // 텍스트를 설정한다.
   * textView.setText('텍스트를 많이 입력해야 스크롤이 생깁니다.');
   * // TextView 컴포넌트를 scene에 추가한다.
   * this.getScene().add(textView);
   * </pre>
   * 
   * @extends tau.ui.ScrollPanel
   * @constructs
   * @param {Object} [opts] TextView 옵션
   * @see tau.ui.ScrollPanel 옵션을 상속받고 있음
   */
  TextView: function (opts) {//$ tau.ui.TextView
  },

  /**
   * 텍스트를 반환한다.
   * @returns {String} 텍스트
   */
  getText: function() {
    return this._text;
  },

  /**
   * 텍스트를 설정한다.
   * @param {String} text 텍스트
   */
  setText: function(text) {
    if (this._text !== text){
      this.renderer.updateText(this.$renderData, text);
    }
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.LinkUrl */
$class('tau.ui.LinkUrl').extend(tau.ui.Component).define({

  $static: /** @lends tau.ui.LinkUrl */ {
    /** $dom의 title DOM에 해당하는 키 */
    TITLE_KEY: 'title',
    /** $dom의 subtitle DOM에 해당하는 키 */
    SUBTITLE_KEY: 'subtitle'
  },
  
  /**
   * LinkUrl 생성자
   * @class 링크를 생성하기 위해 사용되는 클래스
   * @extends tau.ui.Component
   * @constructs
   * @param {Object} [opts] LinkUrl 옵션
   * @see tau.ui.Component 옵션을 상속받고 있음
   */
  LinkUrl: function (opts) {//$ tau.ui.LinkUrl
  },
  
  /**
   * 이벤트 {@link tau.rt.Event.TAP} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see {tau.ui.Component.handleTap}
   * @private
   */
  handleTap: function (e, payload){
    var url = this.getUrl();
    if (url.indexOf("http://") == -1 && url.indexOf("https://") == -1) {
      url = "http://" + this.getUrl();
    }
    this.renderer.updateURL(this.$renderData, url);
  },
  
  getTitle: function() {
    return this._title;
  },

  setTitle: function(title) {
    if (this._title !== title){
      this._title = title;
      this.renderer.updateTitle(this.$renderData, title);
    }
  },

  setSubTitle: function(subTitle) {
    if (this._subTitle !== subTitle){
      this._subTitle = subTitle;
      this.renderer.updateSubtitle(this.$renderData, subTitle);
    }
  },

  getSubTitle: function() {
    return this._subTitle;
  },

  setUrl: function(url) {
    this._url = url;
  },

  getUrl: function() {
    return this._url;
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.ActivityIndicator */
$class('tau.ui.ActivityIndicator').extend(tau.ui.Component).define({

  $static: /** @lends tau.ui.ActivityIndicator */ {
    /** $dom의 icon 속성 키 */
    ICON_KEY: 'icon',
    /** $dom의 message 속성 키 */
    MESSAGE_KEY: 'message'
  },
  
  /**
   * TODO : 아이콘 교체하는 API부분 처리해야함
   * 생성자, 새로운 ActivityIndicator객체를 생성한다.
   * 
   * @class 작업의 진행상황을 이미지로 보여주는 컴포넌트이다.
   * <p/>
   * 진행상황을 {@link tau.ui.ActivityIndicator.start}, 
   * {@link tau.ui.ActivityIndicator.end}로 진행상황을 제어할 수 있다.
   * <pre>
   * var button, activityindicator, bStart = true;
   * // ActivityIndicator 컴포넌트를 생성한다.
   * activityindicator = new tau.ui.ActivityIndicator();
   * // indicator를 화면에 표시한다.
   * activityindicator.start();
   * 
   * button = new tau.ui.Button();
   * button.setLabel('end');
   * button.setStyles({left: '100px'});
   * 
   * // 버튼 컴포넌트를 클릭하면 indicator를 종료 혹은 다시 시작하게 한다. 
   * button.onEvent(tau.rt.Event.TAP, function(){
   *   if (bStart){
   *     button.setLabel('start');
   *     activityindicator.end();
   *     bStart = false; 
   *   } else {
   *     button.setLabel('end');
   *     activityindicator.start(1000);
   *     bStart = true;
   *   }
   * });
   * </pre>
   * @constructs
   * @extends tau.ui.Component
   * @param {Object}  [opts] ActivityIndicator optios
   * @param {Boolean} [opts.autoStart] 자동으로 시작할지 여부
   * @see tau.ui.Component
   */
  ActivityIndicator: function(opts) {//$ tau.ui.ActivityIndicator
    this._loading = false;
    this._autoStart = false;
    
    this.$optionize = tau.mixin(this.$optionize, {
      handler: {
        /**
         * 자동으로 시작되도록 설정
         * @param {String} prop Function name
         * @param {Boolean} val 자동으로 시작할지 여부 
         */
        autoStart: function (prop, val) {
          this._autoStart = true;
        }
      }
    }, 'remix');
 },
 
 /**
  * 랜더링을 수행한다.
  * @param {Boolean} [refresh=false] 리프레쉬 여부
  * @private
  */
 render: function (refresh) {
   if (this._autoStart) {
     this.start();
   }
   return tau.ui.ActivityIndicator.$super.render.apply(this, arguments);
 }, 
 /**
  * 메세지를 설정한다.
  * @param {String} message 메세지
  */ 
 setMessage: function (message) {
   if (this._meesage !== message){
     this._meesage = message;
     this.renderer.updateMessage(this.$renderData, message);
   }
 },

 /**
  * 메세지를 반환한다.
  * @return {String} 메세지
  */ 
 getMessage: function () {
   return this._meesage;
 },

 /**
  * indicator를 표시한다.
  * <p/>
  * 타임스탬프를 지정하면 해당 시간 이후에 indicator가 표시된다.
  * @param {Number} time 타임스탬프
  */ 
 start: function (time) {
   var that = this;
   if (this._timer){
     window.clearTimeout(this._timer);
   }
   if (this.isLoading()) {
     return;
   }
   this._loading = true;
   
   if (time) {
     this._timer = window.setTimeout(function () {
       that.setVisible(true);
     }, time);
   } else {
     that.setVisible(true);
   }
 },

 /**
  * indicator를 끝낸다.
  */ 
 end: function () {
   delete this._autoStart;
   
   if (!this.isLoading()) {
     return;
   }
   
   if (this._timer) {
     window.clearTimeout(this._timer);
   }
   this.setVisible(false);
   this._loading = false;
 },
 
 /**
  * 현재 loading중인지 여부 조사
  * @returns {Boolean}
  */
 isLoading: function () {
   return this._loading;
 }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.Slider */
$class('tau.ui.Slider').extend(tau.ui.Component).mixin(
    tau.ui.Control).define({
  $static: /** @lends tau.ui.Slider */ {
    /** @private */
    START: 1,
    /** @private */
    END: 2,
      
    /** $dom의 thumb DOM에 해당하는 키 */
    THUMB_KEY: 'thumb',
    /** $dom의 beforebar DOM에 해당하는 키 */
    BEFOREBAR_KEY: 'beforebar',
    /** $dom의 afterbar DOM에 해당하는 키 */
    AFTERBAR_KEY: 'afterbar'
  },
  
  /**
   * 생성자, 새로운 Slider객체를 생성한다. 객체 생성시 슬라이더 표시방향, 최소값, 최대값,
   * 초기화값, 틱 사이즈를 이용하여 객체를 생성한다.
   * 
   * @class Slider는 값의 지속적인 범위에서 하나의 값을 선택하는 데 사용되는 컴포넌트이다.
   * <p/>
   * Slider 바 축을 따라서 thumb을 이동 혹은 바를 터치해서 값을 선택할 수 있다.
   * Slider는 값이 변경된 경우 {@link tau.rt.Event.VALUECHANGE} 이벤트를
   * {@link tau.rt.EventDelegator.fireEvent}한다.
   * 사용자는 {@link tau.rt.Event.VALUECHANGE} 이벤트를 {@link tau.rt.EventDelegator.onEvent}로 콜백함수를 
   * 지정해서 처리할 수 있다. 
   * <pre>
   * // 수평방향의 Slider 컴포넌트를 생성한다.
   * var slider = new tau.ui.Slider();
   * // 수직방향의 Slider 컴포넌트를 생성한다. (최소값 0, 최대값 200, 초기값 50) 
   * var slider1 = new tau.ui.Slider({vertical: true, minValue: 0, maxValue: 200, value: 50};
   * 
   * // 수직방향의 Slider의 스타일을 설정한다.
   * slider1.setStyle("top", "100px");
   * // valueChanged 이벤트를 처리한다.
   * slider1.onEvent(tau.rt.Event.VALUECHANGE, function(e, payload){
   *  if (slider1.getValue() == 100){
   *    alert('100입니다.');
   *  }
   * };
   * //scene에 Slider 컴포넌트를 추가한다.
   * this.getScene().add(slider);
   * this.getScene().add(slider1);
   * </pre>
   * @constructs
   * @extends tau.ui.Component
   * @mixins tau.ui.Control
   * @param {Object}  [opts] Slider 옵션
   * @param {Boolean} [opts.vertical=false] 수직 방향 여부
   * @param {Boolean} [opts.tappable=false] bar를 tap하면 thume이 해당 영역으로 이동 여부
   * @see tau.ui.Component
   */
  Slider: function(opts) {//$ tau.ui.Slider
    /** @private 슬라이더 이동 상태 */
    this._sliderState = tau.ui.Slider.END;
    /** @private 최소값 */
    this._minValue = 0;
    /** @private 최대값 */
    this._maxValue = this._minValue  + 10;
    /** @private 값 */
    this._value = this._minValue;
    /** @private 한번에 움직일 수 있는 값 */
    this._tickSize;  // TODO : 범위에 따라서 기본값을 설정해 주어야 함.
    
    /** @private 수직출력 여부 */
    this._vertical = false;
    /** @private 바를 tap했을 때 움직이게 할지 여부 */
    this._tappable = false;
    
    this.$optionize = tau.mixin(this.$optionize, {
      handler: {
        /**
         * vertical 설정
         * @param {String} prop Function name
         * @param {Boolean} val vertical 여부 
         */        
        vertical: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          this._vertical = val;
        },
        /**
         * bar를 tap하면 thume이 해당 영역으로 이동할 수 있게 함.
         * @param {String} prop Function name
         * @param {Boolean} val barTouch 여부 
         */        
        tappable: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          this._tappable = val;
        }
      }
    }, 'remix');
  },
  
  /**
   * 슬라이더 수직 방향 여부를 반환한다.
   * @returns {Boolean}
   */
  isVertical: function (){
    return this._vertical;
  },
  
  /**
   * 틱사이즈를 반환한다.
   * @returns {Number}
   */
  getTickSize: function () {
    return this._tickSize;
  },
  
  /**
   * 틱사이즈를 설정한다.
   * @param {Number} tickSize
   */
  setTickSize: function (tickSize) {
    this._tickSize = tickSize;
  },
  
  /**
   * 최소값을 설정한다.
   * @param {Number} min=0
   */
  setMinValue: function (min) {
    this._minValue = min;
  },
  
  /**
   * 최대값을 설정한다.
   * @param {Number} max
   */
  setMaxValue: function (max) {
    this._maxValue = max;
  },
  
  /**
   * 슬라이더의 값을 반환한다.
   * @return {Number}
   */  
  getValue: function () {
    return this._value;
  },

  /**
   * 슬라이더의 값을 설정한다.
   * <p/>
   * 슬라이더 값을 설정한 후 {@link tau.rt.Event.VALUECHANGE} 이벤트를 fire시킨다.
   * @param {Number} value 슬라이더 값
   * @param {Boolean} move <code>true</code>면 값에 따라 슬라이더 thumb을 이동시킨다.
   * @param {Boolean} tick <code>true</code>면 틱사이즈에 따라 슬라이더 값을 설정한다.
   */  
  setValue:function (value, move, tick) {
    if (tau.isUndefined(value)){
      return null;
    }

    if (tick && this._tickSize && value != this._minValue  && value != this._maxValue){
      var rest = (value % this._tickSize) / this._tickSize * 100;
      value = Math.floor(value / this._tickSize) * this._tickSize;
      if (rest >= this._threadholdPercent){
        value = value + this._tickSize;
      }
    }
    
    if (move){
      var position = this._getThumbPosition(value);
      
      // TODO : animation 적용
      this.renderer.updateThumb(this.$renderData, this._vertical, position);
    }
    if (this._value != value){
      this._value = value;
      if (this.isDrawn()){
        this.fireEvent(tau.rt.Event.VALUECHANGE);
      }
    }
  },

  /**
   * <p/>
   * thumb이 틱사이즈안에서 퍼센트로 지정한 값을 초과하면 의 최대 경계값까지 이동한다.
   * 그렇지 않은 경우에는 틱사이즈의 최소경계값까지 이동한다.
   * <p/>
   * @param {Boolean} enabled <code>true</code>이면 thumb이 틱사이즈의 최대 혹은 최소 경계값 이동한다.
   * @param {Number} percent 틱사이즈 범위안에서 경계가 되는 퍼센트값
   */ 
  setThreshold: function (enabled, percent) {
    this._threshold = enabled;
    this._threadholdPercent = percent || 60;
  },  
  
  /**
   * 이벤트 {@link tau.rt.Event.TAP} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see {tau.ui.Component.handleTap}
   * @private
   */
  handleTap: function (e, payload) {
    this.handleTouchStart(e, payload);
    var touch =  e.touches[0], target = touch.target; 
    
    if (this._tappable && 
        !this.renderer.hasElement(this.$renderData, target, tau.ui.Slider.THUMB_KEY)){
      var position = this.renderer.getThumbPosition(this.$renderData, this._vertical, touch);
      this.setValue(this._getThumbValue(position), true, true);
    }
  },
  
  /**
   * 이벤트 {@link tau.rt.Event.TOUCHSTART} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see tau.ui.Component.handleTouchStart
   * @private
   */
  handleTouchStart: function (e, payload) {
    e.preventDefault();
    var touch = e.touches[0], target = touch.target;
    if (this.renderer.hasElement(this.$renderData, target, tau.ui.Slider.THUMB_KEY)){
      e.stopPropagation();
      this._sliderState = tau.ui.Slider.START;
    } else {
      this._sliderState = tau.ui.Slider.END;
    }
  },
  
  /**
   * 이벤트 {@link tau.rt.Event.TOUCHEND} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see tau.ui.Component.handleTouchEnd
   * @private
   */
  handleTouchEnd: function (e, payload) {
    e.preventDefault(); 
    if (this._sliderState === tau.ui.Slider.START && this._tickSize){
      this.setValue(this._value, true, true);
    }
    this._sliderState = tau.ui.Slider.END;
  },
  
  /**
   * 이벤트 {@link tau.rt.Event.TOUCHMOVE} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see tau.ui.Component.handleTouchMove
   * @private
   */
  handleTouchMove: function(e, payload) {
    e.preventDefault();
    if (this._sliderState === tau.ui.Slider.END){
      return;
    }
    e.stopPropagation();
    var touch = e.touches[0],
        uiRange = this.renderer.getRange(this.$renderData, this._vertical),
        position = this.renderer.getThumbPosition(this.$renderData, this._vertical, touch);

    if (position > 0 && position < uiRange){
      this.renderer.updateThumb(this.$renderData, this._vertical, position);
      this.setValue(this._getThumbValue(position), false, 
          this._tickSize ? true : false);
    } else if (position >= uiRange){
      this.setValue(this._maxValue, true);
    } else if (position <= 0){
      this.setValue(this._minValue, true);
    }
  },

  /**
   * 랜더 함수 후처리
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @private
   */
  render: function(refresh) {
    tau.ui.Slider.$super.render.apply(this, arguments);
    this.renderer.updateVertical(this.$renderData, this._vertical);
  },
  
  /**
   * 랜더 함수 후처리
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   */
  afterRender: function(refresh) {
    tau.ui.Slider.$super.afterRender.apply(this, arguments);
    this.renderer.updateThumb(this.$renderData, this._vertical, this._getThumbPosition(this._value));
    
  },
  
  /**
   * thumb 위치로 슬라이더의 값을 반환한다.
   * @private
   * @param {Number} position thumb의 위치
   */
  _getThumbValue: function(position){
    var ratio, 
        range = this._maxValue - this._minValue,
        uiRange = this.renderer.getRange(this.$renderData, this._vertical);
    
    if (position >= uiRange){
      return this._maxValue;
    } else if (position <= 0){
      return this._minValue;
    }
    ratio = parseFloat(range / uiRange);
    return parseFloat(this._minValue + (ratio * position));
  },
  
  /**
   * 슬라이더의 값으로 thumb 위치를 반환한다.
   * @private
   * @param {Number} value 슬라이더 값
   */
  _getThumbPosition: function(value){
    var range = this._maxValue - this._minValue,
        uiRange = this.renderer.getRange(this.$renderData, this._vertical);
    return (value === this._minValue) ? 0 : 
      parseFloat(uiRange / range) * ( value - this._minValue);
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.Checkbox */
$class('tau.ui.Checkbox').extend(tau.ui.Component).mixin(
    tau.ui.Control).define({

  /**
   * 생성자, 새로운 Checkbox객체를 생성한다. 객체 생성시 check여부를 이용하여 객체를
   * 생성한다.
   * 
   * @class 체크 박스는, <code>true</code>/false 의 상태를 취할 수가 있는 컴포넌트이다.
   * <p/> 
   * 체크 박스를 터치하면 그 상태를 <code>true</code> 으로부터 <code>false</code>로, 또는 <code>false</code> 로부터 <code>true</code>로 변경할 수가 있다.
   * <pre>
   * // CheckBox를 생성한다.(체크된 상태로)
   * var checkbox = new tau.ui.Checkbox({value: true});
   *  // 스타일을 적용한다.
   * checkbox.setStyles({
   *   width: '100px',
   *   height: '100px'
   * });
   * // touch 이벤트를 처리한다. 
   * checkbox.onEvent(tau.rt.Event.TAP, function(e, payload){
   *   alert(checkbox.isSelected());
   * });
   * // CheckBox 컴포넌트를 scene에 추가한다.
   * this.getScene().add(checkbox);
   * </pre>
   * 
   * @constructs
   * @extends tau.ui.Component
   * @mixins tau.ui.Control 
   * @param {Object} [opts] Checkbox 옵션
   * @see tau.ui.Component 옵션을 상속받고 있음
   */
  Checkbox: function(opts) {//$ tau.ui.Checkbox
    this.$optionize = tau.mixin(this.$optionize, {
      handler: {
        tap: tau.optionize.onEvent // register tap onEvent
      }
    }, 'remix');
  },
  
  /**
   * 이벤트 {@link tau.rt.Event.TAP} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see {tau.ui.Component.handleTap}
   * @private
   */
  handleTap: function (e, payload){
    if (this.isDisabled()) {
      return false;
    }
    this.setSelected(!this.isSelected());
  },

  /**
   * state의 disable여부를 설정한다.
   * @param {Boolean} value
   * @overrides
   */
  setDisabled: function (value) {
    if (this.isDisabled() !== value){
      tau.ui.Control.prototype.setDisabled.call(this, value);
    }
  },
  
  /**
   * state의 selected 여부를 설정한다.
   * @param {Boolean} value
   * @overrides
   */
  setSelected: function (value) {
    if (this.isSelected() !== value){
      tau.ui.Control.prototype.setSelected.call(this, value);
    }
  },
  
  /**
   * 값을 반환한다.
   * @return {Object} 체크박스의 값
   */
  getValue: function() {
    return this._value || null;
  },

  /**
   * 값을 설정한다.
   * @param {Object} value 체크박스의 값
   */
  setValue: function(value) {
    this._value = value;
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.Radio */
$class('tau.ui.Radio').extend(tau.ui.Checkbox).define({
  /**
   * 생성자, 새로운 객체를 생성한다. 객체 생성시 체크여부와 라디오그룹 아이디를 이용하여
   * 객체를 생성한다.
   * 
   * @class 단일 라디오는 CheckBox 컴포넌트와 동일하지만, 
   * 라디오 컴포넌트가 RadioGroup으로 설정된 경우 그룹으로 묶인 라디오 컴포넌트는 한개만 선택된다.
   * TODO : 예제 작성해야함.
   * <pre>
   * var radio1 = new tau.ui.Radio(null, true);
   * radio1.setStyles({
   *   width: '100px',
   *   height: '100px'
   * });
   * radio1.setValue(1);
   * this.getScene().add(radio1);
   * 
   * var radio2 = new tau.ui.Radio(null, true);
   * radio2.setValue(2);
   * radio2.setStyles({
   *   width: '100px',
   *   height: '100px'
   * });
   * this.getScene().add(radio2);
   * 
   * var radioGroup = new tau.ui.RadioGroup();
   * radioGroup.addRadio([radio1, radio2]);
   * this.getScene().add(radioGroup);
   * 
   * radioGroup.onEvent(tau.rt.Event.TAP, function(e, payload){
   *   alert('value :' + radioGroup.getValue() + ', index :' + radioGroup.getSelectedIndex() +'');
   * });
   * </pre>
   * 
   * @constructs
   * @extends tau.ui.Checkbox
   * @param {Object} [opts] Radio 옵션
   * @see tau.ui.Checkbox 옵션을 상속받고 있음
   */
  Radio: function(opts) {//$ tau.ui.Radio
    this.$optionize = tau.mixin(this.$optionize, {
      handler: {
        tap: tau.optionize.onEvent // register tap onEvent
      }
    }, 'remix');
  },
  
  /**
   * 그룹아이디를 설정한다.
   * @return {String} 그룹아이디
   */  
  setGroupid: function (groupid){
    this._groupid = groupid;
    this.renderer.updateGroupid(this.$renderData, groupid);
  },
  
  /**
   * 그룹아이디를 반환한다.
   * @return {String} 그룹아이디
   */  
  getGroupid: function() {
    return this._groupid;
  },
  
  /**
   * 이벤트 {@link tau.rt.Event.TAP} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see {tau.ui.Component.handleTap}
   * @private
   */
  handleTap: function (e, payload){
    if (this.isDisabled()) {
      e.stopPropagation();
      return false;
    }
    if (this.isSelected()){
      this.setSelected(true);
    }
    e.alwaysBubble();
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.RadioGroup */
$class('tau.ui.RadioGroup').extend(tau.ui.Component).mixin(
    tau.ui.Control, tau.ui.Container).define({
  /**
   * TODO refactoring
   * 생성자, 새로운 RadioGroup컴포넌트 객체를 생성한다.
   * 
   * @class 라디오 컴포넌트를 그룹으로 관리해주는 컴포넌트이다.
   * <p/> 
   * 라디오 그룹에서는 하나의 라디오 컴포넌트만 선택될 수 있다.
   * <code>groupid</code>가 동일한 {@link tau.ui.Radio} 객체가 {@link tau.rt.Event.TAP} 이벤트가 발생하면
   * RadioGroup에서는 <code>payload.current</code> <code>payload.before</code> component에 대한 payload를 가진 
   * {@link tau.rt.Event.SELECTCHANGE} 이벤트를 발생시킨다.
   * 
   * @constructs
   * @extends tau.ui.Component
   * @mixins tau.ui.Control
   * @mixins tau.ui.Container
   * @param {Object} opts RadioGroup 옵션
   * @see tau.ui.Component
   */
  RadioGroup: function(opts) {//$ tau.ui.RadioGroup
  },
  
  /**
   * state의 disable여부를 설정한다.
   * @param {Boolean} value
   * @overrides
   */
  setDisabled: function (value) {
    if (this.isDisabled() !== value){
      tau.ui.Control.prototype.setDisabled.apply(this, arguments);
      var children = this.getComponents();
      for (var i = 0, len = children.length; i < len; i++) {
        children[i].setDisabled(disabled);
      }
    }
  },
  
  /**
   * 컴포넌트를 하위 아이템으로 추가한다.
   * <p/>
   * 컴포넌트의 부모/버블링 관계 설정을 하고 
   * 컴포넌트에서 이벤트를 처리하지 않아도 현재 인스턴스에서 처리하도록 한다.
   * <code>immediate</code>가 <code>false</code>인 경우 {@link tau.rt.Event.COMPADDED}
   * 이벤트를 발생시킨다.
   * @param {tau.ui.Radio|Object} comp 현재 인스턴스에 추가할 컴포넌트 혹은 컴포넌트 옵션. 
   *         <code>Object</code>인 경우 {@link tau.ui.Radio}을 생성한 후 추가한다. 
   * @param {Number} [index] 특정 위치에 컴포넌트 DOM element를 추가한다. 
   * @param {Boolean} [immediate=false]컴포넌트를 바로 draw할지 설정한다. 
   * <code>false</code>이면 객체가 draw할 때 일괄적으로 DOM Tree에 반영된다. 
   * @returns {Boolean} 컴포넌트가 추가가 완료되었다면 <code>true</code>
   * @throws {TypeError} 명시된 comp가 {@link tau.ui.Button}의 객체가 아닐 경우
   * @throws {RangeError} 명시된 index가 범위를 벗어났을 때
   * @overrides
   */
  add: function (comp, index, immediate) {
    if (comp && comp.constructor === Object ) {
      comp = new tau.ui.Radio(comp);
    } 
    
    if (!(comp instanceof tau.ui.Radio)) {
      throw new TypeError(comp + " is not an instance of tau.ui.Radio or " +
          "tau.ui.Radio's option: " + this.currentStack());
    }
    
    comp.setGroupid(this.getId(true));
    
    comp.onEvent(tau.rt.Event.TAP, function (e, payload) {
      var radio = e.getSource(), before = this._selectedRadio;
      if (radio instanceof tau.ui.Radio){
        if (this._selectedRadio !== radio){
          if (this._selectedRadio){
            this._selectedRadio.setSelected(false);
          }
          this._selectedRadio = radio;
          this._selectedRadio.setSelected(true);
        }
        this.fireEvent(tau.rt.Event.SELECTCHANGE, 
            {'current': radio, 'before': before});
      }
    }, this);
    
    if (comp.isSelected()){
      if (this._selectedRadio) {
        this._selectedRadio.setSelected(false);
      }
      this._selectedRadio = comp;
    }
    return tau.ui.Container.prototype.add.apply(this, arguments);
  },
  
  /**
   * 현재 선택된 라디오 컴포넌트 인덱스를 반환한다.
   * @return {Number} 인덱스
   */  
  getSelectedIndex: function() {
    if (!this._selectedRadio) {
      return -1;
    }
    return this.renderer.getSelectedIndex(this.$renderData, 
        this._selectedRadio.getId(true));
  },

  /**
   * 현재 선택된 라디오 컴포넌트의 값을 반환한다.
   * @return {Object} 값
   */  
  getValue: function() {
    var selectedRadio = this._selectedRadio;
    if (selectedRadio)
      return selectedRadio.getValue();
    return null;
  },
  
  /**
   * 랜더 함수 후처리
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   */
  render: function(refresh) {
    this.drawComponents(refresh);
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.Carousel */
$class('tau.ui.Carousel').extend(tau.ui.ScrollPanel).mixin(
    tau.ui.Control).define({
  
  $static: /** @lends tau.ui.Carousel */ {
    DEFER_THRESHOLD: 2,
    
    /** $dom의 indicator DOM에 해당하는 키 <p /> indicator 아이템 키 */
    INDICATOR_KEY: 'indicator'
  },
    
  /**
   * 생성자, 새로운 Carousel컴포넌트를 생성한다. 객체 생성시 Carousel의 출력방향을
   * 지정하여 객체를 생성한다.
   * 
   * @class 패널안에 여러 페이지 아이템을 가지고 슬라이드 이전, 다음으로 이동하거나 혹은 
   * indicator를 터치해서 새로운 페이지 아이템으로 이동하게 도와 주는 컴포넌트이다.
   * <p/>
   * {@link tau.ui.Carousel.add}함수로 {@link tau.ui.Panel} 컴포넌트를 생성해서 추가하거나,
   * {@link tau.ui.Component} 인스턴스를 추가하면 내부에서 자동으로 
   * {@link tau.ui.Panel}를 생성해서 컴포넌트를 추가해 준다.
   *  
   * <pre>
   * // 수직, 수평방향의 Carousel 컴폰넌트를 생성한다. 
   * var carousel1 = new tau.ui.Carousel({vertical: true}),
   *     carousel2 = new tau.ui.Carousel(),
   *     panel1 = new tau.ui.Panel(),
   *     panel2 = new tau.ui.Panel(),
   *     panel3 = new tau.ui.Panel(),
   *     panel4 = new tau.ui.Panel(),
   *     panel5 = new tau.ui.Panel(),
   *     panel6 = new tau.ui.Panel(),
   *     panel7 = new tau.ui.Panel();
   * // 스타일을 설정한다.
   * carousel1.setStyles({'top': '0px', 'height': '200px'});
   * carousel2.setStyles({'top': '200px', 'height': '200px'});
   * 
   * // Carousel 컴포넌트에 추가할 Panel 컴포넌트의 스타일을 설정한다.
   * panel1.setStyle('backgroundColor', 'red');
   * panel2.setStyle('backgroundColor', 'orange');
   * panel3.setStyle('backgroundColor', 'yellow');
   * panel4.setStyle('backgroundColor', 'green');
   * 
   * panel5.setStyle('backgroundColor', 'blue');
   * panel6.setStyle('backgroundColor', 'indigo');
   * panel7.setStyle('backgroundColor', 'violet');
   * 
   * // Panel컴포넌트를 Carousel 컴포넌트에 추가한다.
   * carousel1.setComponets([panel1, panel2, panel3, panel4 ]);
   * carousel2.setComponets([panel5, panel6, panel7]);
   * // Carousel 컴포넌트를 scene에 추가한다.
   * this.getScene().add(carousel1);
   * this.getScene().add(carousel2);
   * </pre>
   * 
   * @constructs
   * @extends tau.ui.ScrollPanel
   * @mixins tau.ui.Control 
   * @param {Object}  [opts] Carousel 옵션
   * @param {Boolean} [opts.indexVisible] 인덱스를 표시할 지 여부
   * @param {Boolean} [opts.vertical] 수직 스크롤여부 <code>false</code>이면 수평 스크롤 된다.
   * 다음 옵션들은 사용하지 않는다. 이 옵션들은 무시된다.
   * <ul>
   *  <li>vScroll</li>
   *  <li>hScroll</li>
   *  <li>page</li>
   *  <li>snap</li>
   * </ul>
   * @see tau.ui.ScrollPanel
  */
  Carousel: function (opts){//$ tau.ui.Carousel
    this.deferThreshold = tau.ui.Carousel.DEFER_THRESHOLD;
    this.setMapItem(tau.ui.Carousel.INDICATOR_KEY, new tau.ui.CarouselIndicator());
    /** @private 현재 인덱스*/
    this._activeIndex = 0;
    /** @private indicator 인덱스 정보 보여줄지 여부 */
    this._indexVisible = false;
    /** @private 수직 여부 */
    this._vertical = false;
    /** @private 수직 스크롤바 표시 여부 */
    this._vScrollbar = false; 
    /** @private 수평 스크롤바 표시 여부 */
    this._hScrollbar = false; 
    /** @private 수직 스크롤 가능 여부 */
    this._vScroll = false; 
    /** @private 수평 스크롤 가능 여부 */
    this._hScroll = true; 
    /** @private 페이지단위 스크롤 가능 여부 */
    this._page = true; 
    /** @private 스냅 스크롤 가능 여부 */
    this._snap = false;
    
    this.$optionize = tau.mixin(this.$optionize, {
      handler: {
        /**
         * 인덱스를 표시할 지 여부
         * @param {String} prop Function name
         * @param {Boolean} val index 출력 여부 
         */          
        indexVisible: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          this._indexVisible = val;
          
          var indicator = this.getMapItem(tau.ui.Carousel.INDICATOR_KEY);
          if (indicator)
            indicator.setIndexVisible(val);
        },
        /**
         * 수직 스크롤여부 <code>false</code>이면 수평 스크롤 된다.
         * @param {String} prop Function name
         * @param {Boolean} val vertical 여부 
         */          
        vertical: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          if (val) {
            this._vScroll = true;
            this._hScroll = false;
            this._vertical = val;
          }
        },
        /** @overrides */
        vScroll: tau.emptyFn,
        /** @overrides */
        hScroll: tau.emptyFn,
        /** @overrides */
        page: tau.emptyFn,
        /** @overrides */
        snap: tau.emptyFn
      }
    }, 'remix');
  },
  
  /**
   * 컴포넌트를 하위 아이템으로 추가한다.
   * <p/>
   * 컴포넌트의 부모/버블링 관계 설정을 하고 
   * 컴포넌트에서 이벤트를 처리하지 않아도 현재 인스턴스에서 처리하도록 한다.
   * <code>immediate</code>가 <code>false</code>인 경우 {@link tau.rt.Event.COMPADDED}
   * 이벤트를 발생시킨다.
   * @param {tau.ui.Component|tau.ui.Panel|Object} comp 현재 인스턴스에 추가할 컴포넌트 혹은 컴포넌트 옵션.
   *         <code>Object</code>인 경우 {@link tau.ui.Panel}을 생성한 후 추가한다. 또한
   *         {@link tau.ui.Component}인 경우 내부적으로{@link tau.ui.Panel}를 생성해서 하위로 추가한다. 
   * @param {Number} [index] 특정 위치에 컴포넌트 DOM element를 추가한다. 
   * @param {Boolean} [immediate=false]컴포넌트를 바로 draw할지 설정한다. 
   * <code>false</code>이면 객체가 draw할 때 일괄적으로 DOM Tree에 반영된다. 
   * @returns {Boolean} 컴포넌트가 추가가 완료되었다면 <code>true</code>
   * @throws {TypeError} 명시된 comp가 {@link tau.ui.Button}의 객체가 아닐 경우
   * @throws {RangeError} 명시된 index가 범위를 벗어났을 때
   * @overrides
   */
  add: function (comp, index, immediate) {
    
    index = index || this.getComponents().length;
    
    if (comp && comp.constructor === Object ) {
      comp = new tau.ui.Panel(comp);
    } else if (!(comp instanceof tau.ui.Panel) && comp instanceof 
        tau.ui.Component) {
      comp = new tau.ui.Panel({components: [comp]});
    }
    if (!(comp instanceof tau.ui.Panel)) {
      throw new TypeError(comp + " is not an instance of tau.ui.Component or tau.ui.Panel's option: "
          + this.currentStack());
    }

    var indicator = this.getMapItem(tau.ui.Carousel.INDICATOR_KEY);
    if (indicator) {
      var label = index.toString();
      indicator.add({label: this._indexVisible ? label : null});
    }
    return tau.ui.Container.prototype.add.apply(this, arguments);
  },

  /**
   * 스크롤이 완료된 후 커스텀 코드를 실행시키려면 오버라이드 하면 된다.
   * @see tau.ui.ScrollPanel.resetPosition
   */
  handleScrollEnd: function() {
    this.pagingComplete = false;
  },

  /**
   * page 단위로 scroll할 때 이벤트 {@link tau.rt.Event.TOUCHEND}를 처리
   * <p/>
   * @param {tau.rt.Event} e Event 인스턴스
   * @private
   */
  handlePageTouchEnd: function (e) {
    if (tau.ui.Carousel.$super.handlePageTouchEnd.apply(this, arguments)){
      var indicator = this.getMapItem(tau.ui.Carousel.INDICATOR_KEY), 
          index;
      
      if (!this._vertical){
        this.pageX = -Math.round(this.x / this.scrollWidth);
        index = this.pageX;
      } else {
        this.pageY = -Math.round(this.y / this.scrollHeight);
        index = this.pageY;
      }
      
      if (index > -1 && index < this.getComponents().length){
        this._activeIndex = index;
        indicator.setActiveIndicator(index);
      }
      return true;
    }
    return false;
  },

  /**
   * 이벤트 {@link tau.rt.Event.TOUCHSTART} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see tau.ui.Component.handleTouchStart
   * @private
   */
  handleTouchStart: function (e, payload){
    if (this.pagingComplete){
      return;
    }
    tau.ui.Carousel.$super.handleTouchStart.apply(this, arguments);
    var comp = e.getSource(), 
        indicator = this.getMapItem(tau.ui.Carousel.INDICATOR_KEY),
        dir = 'next', index;
        
    if (comp instanceof tau.ui.Button && comp.getParent() === indicator){
      dir = indicator.getDirection(comp);
    } else if (indicator === comp){
      dir = indicator.renderer.getDirection(indicator.$renderData, e.touches[0], this._vertical);
    } else {
      return;
    }

    this.scrolling = false;
    this.moved = false;
    
    if (dir) {
      e.preventDefault();
      e.stopPropagation();
      
      var direction = dir === 'next' ? 1 : -1;
      index = this._activeIndex +  direction;
      
      if (index > -1 && index < this.getComponents().length){
        this.pagingComplete = true;
        if (!this._vertical){
          this.scrollToPage(dir, 0);
        } else {
          this.scrollToPage(0, dir); 
        }
        this._activeIndex = index;
        indicator.setActiveIndicator(index);
      }
    }
  },

  /**
   * 랜더링을 수행한다.
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @private
   */
  render: function (refresh) {
    this.renderer.updateVertical(this.$renderData, this._vertical);
    this.drawItem(tau.ui.Carousel.INDICATOR_KEY, refresh);
    
    return tau.ui.Carousel.$super.render.apply(this, arguments);
  },
  
  /**
   * scroll에 대한 초기화를 수행한다. scrollbar를 생성하지는 않는다.
   * @private
   * @overrides
   */
  initScroll: function () {
    tau.ui.Carousel.$super.initScroll.apply(this, arguments);
    if (this.isVisible()) {
      this.renderer.updatePageSize(this.$renderData, this._vertical);
    }
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.CarouselIndicator */
$class('tau.ui.CarouselIndicator').extend(tau.ui.Component).mixin(
    tau.ui.Container, tau.ui.Control).define({
  /**
   * 생성자, 새로운 CarouselIndicator를 생성한다. 객체 생성시 표시방향을 설정하여 객체를
   * 생성한다.
   * 
   * @class Carousel 컴포넌트에서 indicator을 터치하면 현재 선택된 indicator의 버튼을
   * 기준을 고려해서 이전, 다음 페이지로 이동시킨다.
   * <p/> 
   * CarouselIndicator는 {@link tau.ui.Carousel} 컴포넌트에서만 내부적으로 사용된다.
   * @constructs
   * @extends tau.ui.Component
   * @mixins tau.ui.Control
   * @mixins tau.ui.Container
   * @param {Object}  [opts] CarouselIndicator 옵션
   * @see tau.ui.Component
   */
  CarouselIndicator: function (opts) {//$ tau.ui.CarouselIndicator
    /** @private 현재 인덱스 */
    this._activeIndex = 0;
    /** @private indicator 인덱스 정보 보여줄지 여부 */
    this._indexVisible = false;
  },
  
  /**
   * 컴포넌트를 하위 아이템으로 추가한다.
   * <p/>
   * 컴포넌트의 부모/버블링 관계 설정을 하고 
   * 컴포넌트에서 이벤트를 처리하지 않아도 현재 인스턴스에서 처리하도록 한다.
   * <code>immediate</code>가 <code>false</code>인 경우 {@link tau.rt.Event.COMPADDED}
   * 이벤트를 발생시킨다.
   * @param {tau.ui.Button|Object} comp 현재 인스턴스에 추가할 컴포넌트 혹은 컴포넌트 옵션. 
   *         <code>Object</code>인 경우 {@link tau.ui.Button}을 생성한 후 추가한다.
   * @param {Number} [index] 특정 위치에 컴포넌트 DOM element를 추가한다. 
   * @param {Boolean} [immediate=false]컴포넌트를 바로 draw할지 설정한다. 
   *         <code>false</code>이면 객체가 draw할 때 일괄적으로 DOM Tree에 반영된다. 
   * @returns {Boolean} 컴포넌트가 추가가 완료되었다면 <code>true</code>
   * @throws {TypeError} 명시된 comp가 {@link tau.ui.Button}의 객체가 아닐 경우
   * @throws {RangeError} 명시된 index가 범위를 벗어났을 때
   * @overrides
   */
  add: function (comp, index, immediate) {
    
    index = index || this.getComponents().length;

    if (comp && comp.constructor === Object ) {
      comp = new tau.ui.Button(comp);
    } 
    
    if (!(comp instanceof tau.ui.Button)) {
      throw new TypeError(comp + " is not an instance of tau.ui.Button or tau.ui.Button's option: "
          + this.currentStack());
    }
    comp.setBaseStyleClass(this.getBaseStyleClass() + '-button');
    if (index == 0){
      comp.setSelected(true);
    }
    return tau.ui.Container.prototype.add.apply(this, arguments);
  },
  
  /**
   * 현재 선택된 indicator 버튼 컴포넌트를 반환한다. 
   * @return {@link tau.ui.Button} 현재 선택된 버튼 컴포넌트
   */
  getActiveButton: function (){
    return this.getComponents()[this._activeIndex];
  },

  /**
   * 현재 선택된 indicator 버튼 인덱스를 반환한다. 
   * @return {Number} 현재 선택된 버튼 인덱스
   */
  getActiveIndicatorIndex: function (){
    return this._activeIndex;
  },

  /**
   * indicator 버튼을 설정한다. 
   * @param {Number} index 버튼 인덱스
   */
  setActiveIndicator: function (index){
    var newIndicator = this.getComponents()[index],
        children = this.getComponents();
      
    if (newIndicator){
      children[this._activeIndex].setSelected(false);
      newIndicator.setSelected(true);
      this._activeIndex = index;
    }
  },

  /**
   * 지정된 버튼을 기준으로 이동방향이 이전('prev') 혹은 다음('next')인지 반환한다.
   * @param {tau.ui.Button} comp 버튼 컴포넌트
   * @return {String} 이동방향('prev'/'next')
   */
  getDirection: function (comp){
    if (!(comp instanceof tau.ui.Button) || 
        comp === this.getActiveButton()){
      return null;
    }
    var children = this.getComponents();
    for (var i = 0; i < this._activeIndex; i++){
      if (comp === children[i]){
        return 'prev';
      }
    }
    return 'next';
  },
  
  /**
   * 인덱스를 표시할 지 여부
   * @param {Boolean} visible index 출력 여부 
   */          
  setIndexVisible: function (visible) {
    if (!tau.isBoolean(visible)) {
      throw new TypeError('visible option is not Boolean: '.concat(visible, this.currentStack()));
    }
    if (this._indexVisible !== visible) {
      this.renderer.updateIndexVisible(this.$renderData, visible);
    }
    this._indexVisible = visible;
  },  
  
  /**
   * 랜더링을 수행한다.
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @private
   */
  render: function (refresh) {
    this.drawComponents(refresh);
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.Switch */
$class('tau.ui.Switch').extend(tau.ui.Slider).define({
  /**
   * 생성자, 새로운 Switch컴포넌트 객체를 생성한다. 객체 생성시 스위치 표시방향을 이용하여
   * 객체를 생성한다.
   * 
   * @class 슬라이더({@link tau.ui.Slider}) 값이 0아니면 1로 정해진 컴포넌트
   * <pre>
   * // 수평, 수직 방향의 Swith 컴포넌트를 생성한다.
   * var defaultSwitch = new tau.ui.Switch(),
   *     verticalSwitch = new tau.ui.Switch({vertical: true});
   * // 스타일을 설정한다.    
   * defaultSwitch.setStyle('top', '0px');
   * defaultSwitch.setStyle('width', '200px');
   * verticalSwitch.setStyle('top', '100px');
   * // Switch 컴포넌트를 scene에 추가한다.
   * this.getScene().add(defaultSwitch);
   * this.getScene().add(verticalSwitch);
   * </pre>
   * 
   * @constructs
   * @extends tau.ui.Slider
   * @param {Object} [opts] Switch 옵션
   * @see tau.ui.Slider 옵션을 상속받고 있음
   */
  Switch: function (opts) {//$ tau.ui.Switch
    /** @private 최소값 */
    this._minValue = 0;
    /** @private 최대값 */
    this._maxValue = 1;
    /** @private 한번에 움직일 수 있는 값 */
    this._tickSize = 1;
    
    var that = this;
    this.publishEvent(tau.rt.Event.VALUECHANGE, {
      antecedentFn: function (e){
        if (that.getValue() != 1 && that.getValue() != 0) {
          e.preventDefault();
          e.stopPropagation();
        } 
        that.setSelected(that.getValue() == 1);
      }
    });
  },
  
  /**
   * on에 대한 텍스트를 설정한다.
   * @param {String} text
   */
  setOnText: function (text) {
   this.renderer.updateOnText(this.$renderData, text); 
  },

  /**
   * off에 대한 텍스트를 설정한다.
   * @param {String} text
   */
  setOffText: function (text) {
    this.renderer.updateOffText(this.$renderData, text);
  }
});


//------------------------------------------------------------------------------
/** @lends tau.ui.ToolBar */
$class('tau.ui.ToolBar').extend(tau.ui.ScrollPanel).define({

  $static: /** @lends tau.ui.ToolBar */ {
    /** ToolBar top 위치 */
    TOP_DOCK: 'top',
    /** ToolBar bottom 위치 */
    BOTTOM_DOCK: 'bottom'
  },
  
  /**
   * 생성자, 새로운 툴바 컴포넌트를 생성한다.
   * @class 주로 {@link tau.ui.Button}을 하위 컴포넌트로 가지는 바 형태의 컴포넌트
   * @constructs
   * @extends tau.ui.ScrollPanel
   * @param {Object} [opts] ToolBar 옵션
   * @param {String} [opts.dock=tau.ui.ToolBar.TOP] dock
   * <ul>
   *  <li>{@link tau.ui.ToolBar.TOP}</li>
   *  <li>{@link tau.ui.ToolBar.BOTTOM}</li>
   * </ul>
   * @param {Boolean} [opts.vScrollbar=false] 
   * 다음 옵션은 사용할 수 없다. 
   * <ul>
   *  <li>vScroll</li>
   *  <li>vScrollbar</li>
   *  <li>pullToRefresh</li>
   *  <li>pullDownLabel</li>
   *  <li>pullUpLabel</li>
   *  <li>pullDownFn</li>
   *  <li>pullUpFn</li>
   * </ul>
   * @see tau.ui.ScrollPanel 옵션을 상속받고 있음
   */
  ToolBar: function (opts) {//$ tau.ui.ToolBar

    this._dock = tau.ui.ToolBar.TOP_DOCK;
    this._vScroll = false;
    this._vScrollbar = false;
    this._hScrollbar = false;
    
    this.$optionize = tau.mixin(this.$optionize, {
      handler: {
        /**
         * dock 설정
         * @param {String} prop
         * @param {String} val dock 
         * <ul>
         *  <li>{@link tau.ui.ToolBar.TOP}</li>
         *  <li>{@link tau.ui.ToolBar.BOTTOM}</li>
         * </ul>
         */
        dock: function (prop, val) {
          if (val !== tau.ui.ToolBar.TOP_DOCK && val !== tau.ui.ToolBar.BOTTOM_DOCK) {
            throw new RangeError(prop.concat(' option is out of range: ', val, this.currentStack()));
          }
          this._dock = val;
        },
        /** @overrides */
        vScroll: tau.emptyFn,
        /** @overrides */
        vScrollbar: tau.emptyFn,
        /** @overrides */
        pullToRefresh: tau.emptyFn,
        /** @overrides */
        pullDownLabel: tau.emptyFn,
        /** @overrides */        
        pullUpLabel: tau.emptyFn,
        /** @overrides */
        pullDownFn: tau.emptyFn,
        /** @overrides */
        pullUpFn: tau.emptyFn
      }
    }, 'remix');
  },
  
  /**
   * 버튼 컴포넌트를 하위 아이템으로 추가한다.
   * <p/>
   * 컴포넌트의 부모/버블링 관계 설정을 하고 
   * 컴포넌트에서 이벤트를 처리하지 않아도 현재 인스턴스에서 처리하도록 한다.
   * @param {tau.ui.Button|
   *  tau.ui.Space|
   *  tau.ui.TextField|
   *  tau.ui.Slider|
   *  tau.ui.Checkbox|
   *  tau.ui.ImageView|
   *  tau.ui.ActivityIndicator|
   *  tau.ui.Label|
   *  tau.ui.SegmentedButton} comp 현재 인스턴스에 추가할 컴포넌트
   * @param {Number} [index] 특정 위치에 컴포넌트 DOM element를 추가한다. 
   * @returns {Boolean} 컴포넌트가 추가가 완료되었다면 <code>true</code>
   * @ignore
   * TODO 추가할 수 있는 컴포넌트에 대해 제한할 지를 결정해야한다. 
   */
  /*
  add: function (comp, index) {
    if (comp instanceof tau.ui.Button || 
        comp instanceof tau.ui.Space ||
        comp instanceof tau.ui.TextField ||
        comp instanceof tau.ui.Slider ||
        comp instanceof tau.ui.Checkbox ||
        comp instanceof tau.ui.ImageView || 
        comp instanceof tau.ui.ActivityIndicator || 
        comp instanceof tau.ui.Label || 
        comp instanceof tau.ui.SegmentedButton) {
      return tau.ui.ToolBar.$super.add.apply(this, arguments);
    }
    return false;
  },*/
  
  /**
   * 랜더링을 수행한다.
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @private
   */
  render: function (refresh) {
    if (!refresh) {
      this.renderer.updateDock(this.$renderData, this.getDock());
    }
    return tau.ui.ToolBar.$super.render.apply(this, arguments);
  },
  
  /**
   * 위치를 반환한다.
   * @return {String}
   */
  getDock: function () {
    return this._dock;
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.Space */
$class('tau.ui.Space').extend(tau.ui.Component).define({

  $static: /** @lends tau.ui.Space */ {
    /** Space 길이가 고정된다. */
    FIXED: 'fixed', 
    /** 빈 공간만큼 Space가 차지하게 된다. */
    FLEXIBLE: 'flex',
    /** Space 길이가 고정되고 분리자가 표시된다. */
    SEPARATOR: 'sep'
  },
  
  /**
   * 생성자, 새로운 Space컴포넌트 객체를 생성한다. 
   * @class 툴바 컴포넌트 {@link tau.ui.ToolBar}에서 공백을 주기 위해 사용되는 컴포넌트이다.
   * @constructs
   * @extends tau.ui.Component
   * @param {Object} [opts] Space 옵션
   * @see tau.ui.Component 옵션을 상속받고 있음
   */
  Space: function (opts) {//$ tau.ui.Space
    /** @private Space 타입 */
    this._type = tau.ui.Space.FLEXIBLE;
  },
  
  /**
   * 타입을 설정한다.
   * @param {String} type Space 타입
   * <ul>
    * <li> {@link tau.ui.Space.FIXED} </li>
   *  <li> {@link tau.ui.Space.FLEXIBLE} </li>
   *  <li> {@link tau.ui.Space.SEPARATOR} </li>
   * </ul>
   **/
  setType: function (type) {
    switch (type) {
    case tau.ui.Space.FIXED:
    case tau.ui.Space.FLEXIBLE:
    case tau.ui.Space.SEPARATOR:
      break;
    default:
      throw new RangeError('Specified type is out of range: '
          .concat(type, this.currentStack()));
      break;
    }
    if (this.isDrawn() && this.getType() !== type){
      this.renderer.updateType(this.$renderData, type, this.getType());
    }
    this._type = type;
  },
  
  /**
   * Space Type을 반환한다.
   * @returns {String} type
   * <ul>
    * <li> {@link tau.ui.Space.FIXED} </li>
   *  <li> {@link tau.ui.Space.FLEXIBLE} </li>
   *  <li> {@link tau.ui.Space.SEPARATOR} </li>
   * </ul>
   */
  getType: function () {
    return this._type;
  },
  
  /**
   * 랜더링을 수행한다.
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @private
   */
  render: function (refresh) {
    this.renderer.updateType(this.$renderData, this.getType());
    return tau.ui.Space.$super.render.apply(this, arguments);
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.SystemDock */
$class('tau.ui.SystemDock').extend(tau.rt.EventDelegator).mixin(tau.ui.Drawable).define({
  $static: /** @lends tau.ui.SystemDock */ {
    /** Dock 핸들의 높이, Default 값은 28px */
    HANDLE_HEIGHT: 28,
    /** DOM에서 Dock을 식별하기 위해 사용(for class name) */
    PLACE_HOLDER: 'tau-dock',
    /** Dock의 높이(핸들높이 제외), Default 값은 113px */
    HEIGHT: 113,
    /** SystemDock Resource Path */
    ICON_PATH: 'lib/resources/images/systemdock/'

  },
  
  /**
   * Runtime내부에서 사용되며 시스템 메뉴로서 사용자가 Scene의 최상위 부분에서 밑으로
   * Swipe할 경우 커튼이 밑으로 내려오는 것처럼 시스템 메뉴(Dock)를 보여준다. 사용자는
   * 이 메뉴를 이용해서 Dashboard의 홈 화면으로 이동할 수 있다. 이 SystemDock은 
   * SingleApp일 경우에는 출력하지 않으며, MultiApp으로 동작할 경우에만 출력된다. 
   * 
   * @class 새로운 SystemDock객체를 생성한다. 새롭게 생성된 객체는 Runtime의 property
   * 로 설정된다. Runtime이 생성될 때 설정되며 한번 설정된 이후에는 변경을 해서는 안된다.
   * @mixins tau.ui.Drawable
   * @param {Object} [opts] SystemDock 옵션
   * @see tau.rt.Runtime.start
   * @constructs
   */
  SystemDock: function (opts) { //$ tau.ui.SystemDock
    this._pos = 0;
    this._hidden = true;
    this._isActive = false;
    this._dockHeight = tau.ui.SystemDock.HEIGHT;
    this._maxShortcuts = 3; // default value
    this._attached = 2; // Dock attaches to: 1 = top, 2 = bottom
    
    var home = new tau.ui.Shortcut({name: '$dashboard', title: 'Home', 
          icon: tau.ui.SystemDock.ICON_PATH + 'tauicon.png'});
    home.setBubble(this);
    this._shortcuts = [home];
    this._active = null; // active shortcut
    this._vapor = null; // temporary deleted shortcut
    this._editable = false; // flag that enable removing shortcuts
    
    var events = [tau.rt.Event.TOUCHSTART, tau.rt.Event.TOUCHMOVE, 
                  tau.rt.Event.TOUCHEND];
    for (var i = 0, len = events.length; i < len; i++) {
      this.publishEvent(events[i], { // listening to capture events
        antecedentFn: this.handleCapturEvent
      });
    }
    tau.getRuntime().onEvent( // listening to badge change event
        tau.rt.Module.EVENT_BADGESET, this.handleBadgeChanage, this);
  },

  /**
   * Overrides parent and handles default bubbling up events
   * @param {tau.rt.Event} e Event object
   * @param {Object} payload payload object if exists
   * @private
   */
  propagateEvent: function (e, payload) {
    tau.ui.SystemDock.$super.propagateEvent.apply(this, arguments);
    switch (e.getName()) {
      case tau.rt.Event.RT_STOP:
          this._removeShortcut(payload);
        break;
      case tau.rt.Event.RT_START:
        this._active = payload; // active shortcut
        this.arrangeShortcuts();
        break;
      case tau.rt.Event.TAP:
        this.handleTap(e, payload);
        break;
      case tau.rt.Event.TRANSITIONEND:
        if (this.assertTarget(payload)) {
          this.handleTransitionEnd(e);
        }
        break;
      case tau.rt.Event.ORIENTATION:
        this.draw(tau.getRuntime().$dom.root, true);
        break;
      case tau.ui.Shortcut.EVENT_LONGPRESS:
        this.changeEditable(true);
        break;
      case tau.ui.Shortcut.EVENT_CLOSE:
        this.handleShortcutClose(e, payload);
        break;
      default:
        break;
    }
  },

  /**
   * 사용자 앱에서 Badge를 변경할 경우 발생되는 이벤트를 처리한다. 현재 동작 중인 Shourtcut
   * 을 찾아 이벤트를 통해 전달 받은 badge값을 설정한다.
   * @param {tau.rt.Event} e Badge가 변경되었을 때 발생되는 이벤트
   * @param payload {String} 변경된 badge 값
   */
  handleBadgeChanage: function (e, payload) {
    var shortcut, src = e.getSource();
    if (src instanceof tau.rt.Module) {
      if (shortcut = this._findShortcut(src.getName())) {
        shortcut.setBadge(payload); // payload is badge value;
      }
    }
  },
  
  /**
   * 사용자가 Shortcut을 터치했을 때 발생되는 탭 이벤트를 처리한다. 탭을 터치했을 때 발생할
   * 수 있는 시나리오는 다음과 같다.
   * <ul>
   * <li>터치된 Shortcut이 Dashboard가 아니고 Shortcut이 Editable(삭제가능)한 상태이면
   * 현재 이벤트의 진행을 종료한다. 화면의 변화가 발생하지 않는다.</li>
   * <li>터치된 Shortcut이 Dashboard이고 현재 화면이 Dashboard 상태이면 이벤트의 진행을
   * 종료하고 끝낸다.</li>
   * <li>Shortcut 이외의 부분에 터치를 했을 경우 현재 상태가 Editable한 상태이면 반대상태로
   * 변경한다. 그렇지 않을 경우 아무런 반응을 하지 않는다.
   * <li>위의 경우를 제외하면 터치된 Shortcut에 해당하는 앱을 실행한다.
   * </ul>
   * @param {tau.rt.Event} e Shortcut을 터치했을 때 발생된 이벤트
   */
  handleTap: function (e) { // tapping is to indicate starting new apps
    var name, src = e.getSource();
    if (src instanceof tau.ui.Shortcut) {
      name = src.getName();
      if ('$dashboard' != name && this._editable) {
        e.stopPropagation();
        return;
      }
      this.close();
      if ('$dashboard' === name && !tau.getCurrentContext()) {
        e.stopPropagation();
        return;
      }
      tau.getRuntime().fireEvent(tau.rt.Event.RT_START, name);
    } else if (this._editable) { // tap remainder area
      this.changeEditable(false);
    }
  },
  
  /**
   * Shourtcut에서 발생된 {@link tau.ui.Shortcut.EVENT_CLOSE}를 처리한다. 현재
   * 이벤트가 Shourtct에서 발생된 이벤트이면 해당하는 Shortcut의 앱을 종료한다.
   * @param {tau.rt.Event} e Shurtcut에서 발생된 {@link tau.ui.Shortcut.EVENT_CLOSE}
   * 이벤트. 이 이벤트는 Shortcut이 Editable한 상태에서 발생된다.
   * @param {Object} payload 이벤트 발생시 동반되는 payload 객체 
   */
  handleShortcutClose: function (e, payload) {
    var src = e.getSource();
    if (src instanceof tau.ui.Shortcut) {
      tau.getRuntime().fireEvent(tau.rt.Event.RT_STOP, src.getName());
    }
  },
  
  /**
   * 이벤트 Delegation구조를 위하 하위로 가지고 있는 Shurtcut객체들을 반환한다.
   * @returns {Array} SubDelegator 배열
   * @see tau.rt.EventManager.findDelegator
   * @private
   */
  getSubDelegators: function () {
    return this._shortcuts;
  },
  
  /**
   * 현재 SystemDock이 가지고 있는 Shortcut객체들 중 명시된 이름에 해당하는 Shourtcut을
   * 찾아 반환한다. 만약 동일한 이름을 가진 Shortcut객체가 존재하지 않으면 null을 반환한다.
   * @param {String} name 찾고자 하는 Shortcut의 이름
   * @returns {tau.ui.Shortcut} 명시된 이름에 해당하는 Shortcut객체, 존재하지 않으면
   * null을 반환한다.
   * @private
   */
  _findShortcut: function (name) {
    var shortcuts = this._shortcuts;
    for (var i = 0, len = shortcuts.length; i < len; i++) {
      if (name === shortcuts[i].getName()) {
        return shortcuts[i];
      }
    }
    return null;
  },
  
  /**
   * 현재 SystemDock이 가지고 있는 Shortcut객체들 중 명시된 이름에 해당하는 Shortcut을
   * 제거한다. 만약 해당하는 이름의 Shortcut이 존재하지 않으면 아무런 반응을 하지 않는다.
   * 이때 DOM 노드에서 Shortcut을 완전히 삭제하기 위해 parent node를 찾아 같이 삭제한다.
   * 이 부분은 향후 수정이 필요!!
   * @param {String} name 삭제할 Shortcut의 이름
   * @private
   */
  _removeShortcut: function (name) {
    var ul = null, li = null, 
        max = this._availableSize(),
        shortcuts = this._shortcuts,
        found = this._findShortcut(name);
    if (tau.arr(shortcuts).remove(found) == 1) {
      this._vapor = name;
      found.removeBubble(this);
      li = found.getDOM().parentNode;
      li.style.visibility = 'hidden'; // fake
      ul = li.parentNode;
      window.setTimeout(tau.ctxAware(removeIt, this), 200);
    }
    /**@inner */
    function removeIt() {
      tau.util.dom.removeElements(li); // <li> element
      this.arrangeShortcuts();
      this._vapor = null;
      if (this._shortcuts.length >= max) {
        found = this._shortcuts[max - 1];
        li = document.createElement('li');
        found.draw(li, true);
        ul.appendChild(li);
        found.removable(true);
      }
    }
  },
  
  /**
   * 화면에서 출력 가능한 Shortcut의 개수를 계산해서 반환한다. 환경파일에 명시된 maxShortcuts
   * 값 보다 현재 화면에 출력할 수 있는 Shortcut의 개수가 적으면 화면에 출력가능한 값을 반환
   * 하고 그렇지 않으면 출력할 수 있는 최대 값을 반환한다.
   * @returns {Number} 출력 가능한 Shortcut의 개수
   * @private
   */
  _availableSize: function () {
    var cols = this._maxShortcuts,
        availcols = window.parseInt(tau.getWidth()/80);
    //70px is optimal width of shortcut
    return (availcols < cols) ? availcols : cols;
  },
  
  /**
   * 화면에 출력할 Shortcut들의 순서를 정력한다. 이때 정렬되는 순서는 MRU(Most Recently Used)
   * 알고리즘에 따른다. 항상 첫번째 위치하는 Shortcut은 Home으로 가기 위한 것으로 채워진다.
   */
  arrangeShortcuts: function () {
    var shortcut, i, config, name,
        rt = tau.getRuntime(),
        shortcuts = this._shortcuts.slice(0, 1); // dashboard(home)
    var modules = tau.getRuntime().getModule('*');
    for (i = (modules.length - 1); i >= 0; i--) {
      config = modules[i].getConfig();
      name = config.name;
      if (name === '$dashboard' || this._vapor === name
          || (!this._vapor && this._active === name)) {
        continue;
      }
      shortcut = this._findShortcut(name);
      if (!shortcut) {
        shortcut = new tau.ui.Shortcut(config);
        appCtx = rt.createStorageCtx(name);
        shortcut.setBadge(appCtx.get('$badge'));
        shortcut.setBubble(this);
      }
      shortcuts.push(shortcut);
    }
    this._shortcuts.splice(0);
    this._shortcuts = shortcuts;
  },
  
  /**
   * Shortcut들을 삭제 가능한 상태로 변경한다. 명시된 state의 값에 따라 <code>true</code>이면 Shortcut
   * 을 삭제할 수 있도록 Badge를 출력하고 그렇지 않으면 badge를 삭제한다.
   * @param {Boolean} state 수정 가능한 상태(true: 삭제 가능)
   */
  changeEditable: function (state) {
    var shortcuts = this._shortcuts;
    for (var i = 1, len = shortcuts.length; i < len; i++) {
      shortcuts[i].removable(state);
    }
    this._editable = state;
  },
  
  /**
   * 현재 Shortcut들을 SystemDock에서 제거할 수 있는 상태(Editing)인지를 반환한다. 제거
   * 가능한 상태이면 <code>true</code>를 그렇지 않으면 false를 반환한다.
   * @returns {Boolean} Shortcut을 제거할 수 있는 상태면 <code>true</code>, 그렇지 않으면 <code>false</code>를
   * 반환
   */
  isEditable: function () {
    return this._editable;
  },
  
  /**
   * captures capture phase events. if SystemDock is activated it stops
   * propagation not to deliver the event to the target component
   * @param {tau.rt.Event} e Event object
   * @param {Object} payload payload object if exists
   */
  handleCapturEvent: function (e, payload) {
    switch (e.getName()) {
      case tau.rt.Event.TOUCHSTART:
        this.handleTouchStart(e);
        break;
      case tau.rt.Event.TOUCHMOVE:
        this.handleTouchMove(e);
        break;
      case tau.rt.Event.TOUCHEND:
        this.handleTouchEnd(e);
        break;
      default:
        break;
    }
  },
  
  /**
   * tau.ui.Drawable.draw()메소드를 Override하며 실제 DOM을 이용해서 SystemDock
   * 을 화면에 그리는 작업을 수행한다.
   * @param {HTMLElement} parent 컨텐츠를 렌더링할 부모 DOM element
   * @param {Boolean} [refresh=false] <code>true</code>이면 이전 컨텐츠를 클리어하고 다시 draw한다.
   * @param {HTMLElement} [refChild] 컨텐츠를 렌더링할 이전 Child DOM element
   * @see tau.ui.Drawable.draw
   * @returns {Boolean} 실제 컨텐츠가 이 메소드에 의해 draw 되었다면 <code>true</code>.
   */
  draw: function (parent, refresh, refChild) { // override Drawable.draw()
    if (this._editable) {
      return;
    }
    var ul, li, div,
        shortcuts = this._shortcuts,
        max = this._availableSize(),
        dom = this.getDOM();
    if (!this.isDrawn() || refresh) {
      this.setStyle('display', 'none');
      tau.util.dom.addClass(dom, tau.ui.SystemDock.PLACE_HOLDER);
      dom.innerHTML = ''; // clears all

      ul = document.createElement('ul');
      // Shortcuts for running modules; do not show top-most active module
      for (var i = 0, len = shortcuts.length; i < len && i < max; i++) {
        li = document.createElement('li');
        shortcuts[i].draw(li, true);
        ul.appendChild(li);
      }
      dom.appendChild(ul);
      div = document.createElement('div');
      div.setAttribute('class', 'tau-dock-handle');
      var h = (this._attached == 1) ? '-15px' : (this._dockHeight + 15) + 'px';
      div.setAttribute('style', 'bottom:' + h);
      dom.appendChild(div);
    }
    if (this._attached == 1) {
      dom.style.top = '-'.concat(this._dockHeight, 'px');
    } else {
      dom.style.top = ''.concat(tau.getHeight(), 'px');
    }
    dom.style.opacity = '1';
    dom.style.webkitTransitionProperty = '-webkit-transform';
    dom.style.webkitTransitionDuration = '400ms';
    return tau.ui.Drawable.prototype.draw.apply(this, arguments);    
  },

  /**
   * 사용자가 Dock 핸들을 터치한 상태에서 아래 위로 Swipe할 경우 Dock의 Swipe이벤트를
   * 받아 해당 위치로 이동시킨다.
   * 
   * @param {Number} pos 핸들이 이동될 위치(y coordination)
   * @throws {TypeError} 명시된 파라미터의 타입이 숫자가 아닐 경우
   * @private
   */
  _setPosition: function (pos) {
    if (!tau.isNumber(pos)) {
      throw new TypeError('Specified argument is not Number: '.concat(
          pos, this.currentStack()));
    }
    this._pos = pos;
    this.getDOM().style.webkitTransform = 'translate3d(0,' + pos + 'px,0)';

    pos = this._attached == 1 ? pos : -pos;
    if (pos === this._dockHeight) {
      this._hidden = false;
    } else if (pos === 0) {
      this._hidden = true;
      if (this._editable) {
        this.changeEditable(false);
      }
    }
  },

  /**
   * Sets max number of shortcuts in the dock.
   * @param {Number} value Max number of shortcuts to display
   */
  setMaxShortcuts: function (value) {
    this._maxShortcuts = value;      
  },
  
  /**
   * SystemDock이 화면의 어느 부분에 위치할지를 설정한다. 설정한 값이 '1'이면 상단, '2'이면
   * 하단에 위치한다.
   * @param {Number} attached SystemDock이 위치할 영역(1: 상단, 2: 하단)
   */
  setAttached: function (attached) {
    this._attached = attached;
  },

  /**
   * 명시된 파라미터(DOM 노드)가 System Dock을 나타내는 노드인지를 확인하여 결과를 반환한다.
   * @param {HTMLElement} dom System Dock에 속한 노드인지 확인 할 DOM 앨리먼트
   * @returns {Boolean} 명시된 DOM 앨리먼트가 System Dock영역에 속할 경우 <code>true</code>,
   * 그렇지 않을 경우 <code>false</code>를 반환한다.
   * @throws {TypeError} 명시된 파라미터가 DOM 앨리먼트가 아닐 경우
   */
  assertTarget: function (dom) {
    if (!tau.isElement(dom)) {
      throw new TypeError('Specified argument is not DOM element: '.concant(
          dom, this.currentStack()));
    }
    for (var n = dom; n.id !== 'tau' && tau.isElement(n); n = n.parentNode) {
      if (tau.util.dom.hasClass(n, tau.ui.SystemDock.PLACE_HOLDER)) {
        return true;
      }
    }
    return false;
  },
  
  /**
   * Checks if the y position is touching the Dock handle
   * @param {Number} y Browsers's y position (pageY)
   * @returns {Boolean} <code>true</code> if the Dock handle is touched
   */
  isHandleTouched: function (y) {
    if (this._attached == 1) {
      return y <= tau.ui.SystemDock.HANDLE_HEIGHT;
    } else {
      return y >= tau.getHeight() - tau.ui.SystemDock.HANDLE_HEIGHT;
    }
  },
  
  /**
   * SystemDock을 동작 가능한 상태로 만든다.
   * @private
   */
  _activate: function (e) {
    this._isActive = true;
    e.preventDefault();
    e.stopPropagation();
    this.getDOM().style.webkitTransitionDuration = '0';
    this.startPos = this._pos;
    this.startDelta = e.touches[0].pageY - this._pos;
  },

  /**
   * 사용자의 터치 이벤트를 처리하며 터치 시작점이 임계영역(tau.ui.SystemDock.HANDLE_HEIGHT)
   * 내부에서 시작될 경우 Dock을 활성화 시킨다. 사용자가 임계영역 내에서 터치한 상태로 250ms
   * 이상 가만히 있으면 자동으로 System Dock의 핸들이 표시된다.
   * @param {tau.rt.Event} e 사용자 이벤트(tau.rt.Event.TOUCHSTART)
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @private
   */
  handleTouchStart: function (e, payload) {
    var y = e.touches[0].pageY, that = this,
        target = tau.util.dom.getElementNode(e.touches[0].target),
        isHandle = tau.util.dom.hasClass(target, 'tau-dock-handle');
    if (isHandle || this.isHandleTouched(y)) {
      if (that.isVisible()) { // SystemDock is opened already
        that._activate(e);
      } else {
        that._timer = window.setTimeout(function () {
          var src = e.getSource();
          that.setVisible(true);
          if (src) {
            src.fireEvent(tau.rt.Event.TOUCHCANCEL);
            src = null;
          }
          that._activate(e);
          that._timer = null;
        }, 250);
      }
    }
  },

  /**
   * 사용자가 터치한 다음 이동할 때 발생되는 이벤트를 처리하며 이동 방향(상,하)에 따라
   * System Dock의 핸들을 같이 이동시킨다. 사용자가 System Dock영역에 터치해서 Dock이
   * 활성화 되었을 경우에만 이벤트를 처리한다.
   * @param {tau.rt.Event} e 사용자 이벤트(tau.rt.Event.TOUCHMOVE)
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @private
   */
  handleTouchMove: function (e, payload) {
    if (!this._isActive) { // if current state is not active then returns
      if (this._timer) {
        window.clearTimeout(this._timer);
      }
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    if (!this.isVisible()) {
      this.setVisible(true);
    }
    var delta = e.touches[0].pageY - this.startDelta;
    if (this._attached == 1) {
      if (delta < 0) {
        delta = 0;
      } else if (delta > this._dockHeight) {
        delta = this._dockHeight;
      }
    } else {
      if (-delta < 0) {
        delta = 0;
      } else if (-delta > this._dockHeight) {
        delta = -this._dockHeight;
      }
    }
    this._setPosition(delta);
  },
  
  /**
   * 사용자가 터치 동작을 종료할 때 발생되는 이벤트를 처리하며 Dock을 위로 위로 밀어 올릴 때
   * 종료시점의 터치 지점이 Dock 높이의 1/3보다 클 자동으로 다시 원래상태(펴진상태)로 
   * 복귀하며 그렇지 않을 경우 자동으로 닫는다. Dock이 펴진 상태에서 Dock이외의 부분을 
   * 사용자가 터치하면 자동으로 Dock을 사라지도록 한다.
   * @param {tau.rt.Event} e 사용자 이벤트(tau.rt.Event.TOUCHEND)
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @private
   */
  handleTouchEnd: function (e, payload) {
    if (this._timer) {
      window.clearTimeout(this._timer);
    }
    if (this._isActive) {
      e.preventDefault();
      e.stopPropagation();
      this._isActive = false;
      if (this._pos === 0) {
        return this.setVisible(false);
      }
      var strokeLength = this._pos - this.startPos;
      strokeLength *= strokeLength < 0 ? -1 : 1;
      if (strokeLength > 3) {   // It seems that on Android is almost impossibile to have a tap without a minimal shift, 3 pixels seems a good compromise
        this.getDOM().style.webkitTransitionDuration = '200ms';
        if (this._attached == 1) {
          if (this._pos == this._dockHeight || !this._hidden) {
            this._setPosition(this._pos > this._dockHeight/3 ? this._dockHeight : 0);
          } else {
            this._setPosition(this._pos > this._dockHeight ? this._dockHeight : 0);
          }
        } else {
          if (this._pos == this._dockHeight || !this._hidden) {
            this._setPosition(-this._pos > this._dockHeight/3 ? -this._dockHeight : 0);
          } else {
            this._setPosition(-this._pos > this._dockHeight ? -this._dockHeight : 0);
          }
        }
      } else {
        this.getDOM().style.webkitTransitionDuration = '400ms';
        //this._setPosition(!this._hidden ? this._dockHeight : 0);
        this._setPosition(0);
      }
    } else if (!this.assertTarget(tau.util.dom.getElementNode(e.touches[0].target))) {
      this.close();
    }
  },
  
  /**
   * 애니메이션이 종료되었을 때 현재의 위치가 닫힌 상태로 있으면 자동으로 Dock의 핸들을
   * 사라지도록 처리한다.
   * @param {tau.rt.Event} e 사용자 이벤트(DOMGenericEvent; tau.rt.Event.TRANSITIONEND)
   * @returns
   */
  handleTransitionEnd: function (e) {
    if (this._pos === 0) {
      this.setVisible(false);
    }
  },
  
  /**
   * Drawable.serVisible()을 override하며 Dock을 화면(Scene)에 출력한다.
   * 화면에 Drawing되기 전에는 isVisible()을 호출할 경우 항상 <code>false</code>를 반환한다.
   * draw()메소드가 수행 된 이후에만 setVisible()메소드가 정상 동작한다.
   * @param {Boolean} visible <code>true</code>이면 화면에 출력하며 <code>false</code>일 경우 화면에서 삭제한다. 
   * @returns
   */
  setVisible: function (visible) { // override Drawable.setVisible()
    if (this.isDrawn()) {
      tau.ui.Drawable.prototype.setVisible.apply(this, arguments);
    }
  },
  
  /**
   * System Dock을 오픈한다.
   */
  open: function () {
    this.setVisible(true);
    this._setPosition(this._dockHeight);      
  },
  
  /**
   * System Dock을 닫는다.(화면에서 지워짐)
   */
  close: function () {
    this._setPosition(0);
    this.setVisible(false);
  },
  
  /**
   * System Dock을 오픈된 상태에서는 닫으며, 닫힌 경우에는 오픈한다.
   */
  toggle: function () {
    if (this._hidden) {
      this.open();
    } else {
      this.close();
    }
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.SegmentedButton */
$class('tau.ui.SegmentedButton').extend(tau.ui.Component).mixin(tau.ui.Container,
    tau.ui.Control).define({

  /**
   * 생성자, 새로운 SegmentedButton컴포넌트 객체를 생성한다. 
   * <p/>
   * 다중값을 설정하거나, 하나의 값만 설정할 수 있는 컴포넌트.
   * 하나의 화면에 보여질 수 있는 정도의 리스트인 경우 적합함.
   * (리스트가 많은 경우 scroll을 제공할 수 있으나 {@link tau.ui.Select} 컴포넌트를 사용하는 것이 바람직함)
   * @class 
   * @constructs
   * @extends tau.ui.Component
   * @example
   * segmentedButton1 = new tau.ui.SegmentedButton({
   *  components: [
   *   {label: 'options1'},
   *   {label: 'options2'},
   *   new tau.ui.Button({label: 'options3', styles: {backgroundColor: 'red'}),
   *  ],
   *  maxSelectableCnt: 2,
   *  selectedIndexes: [0],
   *  valueChange: function (e, payload) {
   *    var selectedIndexes = payload.selectedIndexes;
   *    var deselectedIndexes = payload.deselectedIndexes;
   *  }
   * });
   * @param {Object} [opts] SegmentedButton 옵션
   * @param {Boolean}[opts.vertical=false] 수직 방향 여부
   * @param {Boolean}[opts.toggle=false] 토글 허용 여부. <code>opts.multiple</code>이 <code>true</code>인 경우에만 설정할 수 있다.
   * @param {Number} [opts.maxSelectableCnt] 아이템 선택 제한 수. <code>opts.multiple</code>이 <code>true</code>인 경우에만 설정할 수 있다.
   * @param {Function}[opts.valueChange] 아이템이 선택이 변경되었을 때 호출되는 콜백함수.
   * @see tau.ui.Component 옵션을 상속받고 있음
   */
  SegmentedButton: function (opts) {//$ tau.ui.SegmentedButton
    
    /** @private 최초에 선택한 인덱스 배열 */
    this._initSelectedIndexes = [];
    /** @private 선택된 인덱스 배열 */
    this._selectedIndexes = [];
    /** @private 현재 선택가능한 수 */
    this._selectableCnt = 1;
    /** @private 최대 선택가능한 수 */
    this._maxSelectableCnt = 1;
    
    /** @private 수직단위로 화면에 출력할지 여부 */
    this._vertical = false;
    /** @private 선택한 아이템을 해제할수 있는지 여부 */
    this._togglable = false;
    /** @private 여러개를 선택할 수 있는지 여부 */
    this._multiple = false;
    
    this.$optionize = tau.mixin(this.$optionize, {
      handler: {
        /**
         * vertical 설정
         * @param {String} prop Function name
         * @param {Boolean} val vertical 여부 
         */
        vertical: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          this._vertical = val;
        },
        /**
         * toggle 설정
         * @param {String} prop Function name
         * @param {Boolean} val toggle 여부 
         */
        togglable: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          this._togglable = val;
        },
        /**
         * 선택할 가능 개수 설정
         * @param {String} prop Function name
         * @param {Number} val 선택할 가능 개수 
         */
        maxSelectableCnt: function (prop, val) {
          if (!tau.isNumber(val)) {
            throw new TypeError(prop.concat(' option is not Number: ', val, this.currentStack()));
          }
          this._maxSelectableCnt = val;
          
          if (val > 1) {
            this._selectableCnt = this._maxSelectableCnt;
            this._multiple = true;
            if (!opts.togglable) {
              this._togglable = true;
            }
          }
        },
        valueChange: tau.optionize.onEvent, // register tap onEvent
        tap: tau.optionize.onEvent // register tap onEvent
      }
    }, 'remix');
  },
  
  /**
   * 컴포넌트를 하위 아이템으로 추가한다.
   * <p/>
   * 컴포넌트의 부모/버블링 관계 설정을 하고 
   * 컴포넌트에서 이벤트를 처리하지 않아도 현재 인스턴스에서 처리하도록 한다.
   * <code>immediate</code>가 <code>false</code>인 경우 {@link tau.rt.Event.COMPADDED}
   * 이벤트를 발생시킨다.
   * @param {tau.ui.Button|Object} comp 현재 인스턴스에 추가할 컴포넌트 혹은 컴포넌트 옵션. 
   *         <code>Object</code>인 경우 {@link tau.ui.Button}을 생성한 후 추가한다.
   * @param {Number} [index] 특정 위치에 컴포넌트 DOM element를 추가한다. 
   * @param {Boolean} [immediate=false]컴포넌트를 바로 draw할지 설정한다. 
   *         <code>false</code>이면 객체가 draw할 때 일괄적으로 DOM Tree에 반영된다. 
   * @returns {Boolean} 컴포넌트가 추가가 완료되었다면 <code>true</code>
   * @throws {TypeError} 명시된 comp가 {@link tau.ui.Button}의 객체가 아닐 경우
   * @throws {RangeError} 명시된 index가 범위를 벗어났을 때
   * @overrides
   */
  add: function (comp, index, immediate) {
    
    index = index || this.getComponents().length;

    if (comp && comp.constructor === Object ) {
      comp = new tau.ui.Button(comp);
    } 
    
    if (!(comp instanceof tau.ui.Button)) {
      throw new TypeError(comp + " is not an instance of tau.ui.Button or tau.ui.Button's option: "
          + this.currentStack());
    }
    comp.setBaseStyleClass(this.$renderData.$base + '-item');
    
    if (immediate && !this._vertical) {
      this.renderer.updateWidth(this.$renderData, this.getComponents().length + 1);
    }
    
    return tau.ui.Container.prototype.add.apply(this, arguments);
  },


  /**
   * 이벤트 {@link tau.rt.Event.TAP} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see {tau.ui.Component.handleTap}
   * @private
   */
  handleTap: function (e, payload){
    e.preventDefault();
    e.stopPropagation();

    var comp = e.getSource(),
        index = this.getComponents().indexOf(comp),
        selectedIndexes = this.getSelectedIndexes(),
        selected = false;
    
    if (selectedIndexes.indexOf(index) != -1){
      selected = true;
    }
    
    if (index > -1){
      if (selected && this._togglable) {
        this.toggle(index);
      } else if (!selected){
        this.select(index);
      }
    }
  },
  
  /**
   * 랜더링을 수행한다.
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @private
   */
  render: function (refresh) {
    this.renderer.updateVertical(this.$renderData, this._vertical);
    this.renderer.updateMuliple(this.$renderData, this._multiple);
    this.drawComponents();
    if (!this._vertical) {
      this.renderer.updateWidth(this.$renderData, this.getComponents().length);
    }
    return tau.ui.SegmentedButton.$super.render.apply(this, arguments);
  },
  
  /**
   * 현재 선택된 인덱스를 리턴한다.
   * @returns {Number[]}
   */
  getSelectedIndexes: function () {
    return this._selectedIndexes;
  },

  /**
   * index에 해당하는 아이템을 선택한다.
   * <p />
   * draw된 상태이면 {@link tau.rt.Event.VALUECHANGE} 이벤트를 발생시킨다.
   * 이때 payload로 새롭게 선택된 인덱스 배열 <code>payload.selectedIndexes</code>과
   * 선택해제된 인덱스 배열 정보 <code>payload.deselectedIndexes</code>를 전달한다.
   * @param {Number[]} indexes 선택할 인덱스
   * @returns {Boolean} 선택되었으면 <code>true</code>를 반환한다.
   */
  setSelectedIndexes: function (indexes) {
    if (!tau.isArray(indexes)){
      throw new TypeError(indexes + ' is not an instance of Number[]: '
          + this.currentStack());
    }
    
    this._valueChangeEnabled = false;
    
    var selectedIndexes = this.getSelectedIndexes(),
        deselectedIndexes = tau.clone(selectedIndexes);

    if (this.isDrawn()){
      for(var i = 0, len = selectedIndexes.length; i < len; i++) {
        if (indexes.indexOf(selectedIndexes[i]) > -1){
          deselectedIndexes = selectedIndexes.slice(i, 0);
        }
      }
      for (var i = 0, len = deselectedIndexes.length; i < len; i++){
        this.deselect(deselectedIndexes[i]);
      }
    }
    
    for (var i = 0, len = indexes.length; i < len; i++){
      this.select(indexes[i]);
    }
    
    delete this._valueChangeEnabled;
    
    if (!this.isDrawn()){
      this._initSelectedIndexes = tau.clone(indexes);
    }
    if (this.isDrawn() && arguments.callee.caller !== this.refresh){
      return this.fireEvent(tau.rt.Event.VALUECHANGE, {
        deselectedIndexes: deselectedIndexes,
        selectedIndexes: indexes
      });
    }
    return true;
  },
  
  /**
   * 특정 인덱스를 가지는 아이템을 선택한다.
   * <p />
   * draw된 상태이면 {@link tau.rt.Event.SELECTCHANGE} 이벤트가 발생한다.
   * 이때 payload로 새롭게 선택된 인덱스 배열 <code>payload.selectedIndexes</code>과
   * 선택해제된 인덱스 배열 정보 <code>payload.deselectedIndexes</code>를 전달한다.
   * @param {Number} index 선택할 아이템의 인덱스
   * @throws {TypeError} 명시된 index가 범위를 벗어났을 때
   * @throws {RangeError} 명시된 index가 범위를 벗어났을 때
   */
  select: function (index) {
    if (!tau.isNumber(index)){
      throw new TypeError('Specified index is not Number: ', index, this.currentStack());    
    } else if (tau.isNumber(index) && index < 0 || index >= this.getComponents().length){
      throw new RangeError('Specified index is out of range: '.concat(index). 
          concat(this.currentStack()));
    }
    var deselectedIndexes = [];
    if (this._multiple) {
      if (this._selectableCnt === 0) {
        tau.alert('더이상 선택할 수 없습니다.');
        return false;
      } else {
        this._selectableCnt--;
        tau.arr(this._selectedIndexes).pushUnique(index);
      }
    } else {
      deselectedIndexes[0] = this.getSelectedIndexes()[0];
      this._selectableCnt = 0;
      this._selectedIndexes[0] = index;
      if (deselectedIndexes[0] != index && deselectedIndexes[0] > -1) {
        this.getComponent(deselectedIndexes[0]).setSelected(false);
      } else {
        deselectedIndexes = [];
      }
    }
    this.getComponent(index).setSelected(true);
    
    if (this.isDrawn() && this._valueChangeEnabled !== false){
      this.fireEvent(tau.rt.Event.VALUECHANGE, {selectedIndexes : [index], deselectedIndexes: deselectedIndexes});
    }
  },
  
  /**
   * 특정 인덱스를 가지는 아이템을 선택한다.
   * <p />
   * draw된 상태이면 {@link tau.rt.Event.SELECTCHANGE} 이벤트가 발생한다.
   * 이때 payload로 새롭게 선택된 인덱스 배열 <code>payload.selectedIndexes</code>과
   * 선택해제된 인덱스 배열 정보 <code>payload.deselectedIndexes</code>를 전달한다.
   * @param {Number} index 선택할 아이템의 인덱스
   * @throws {RangeError} 명시된 index가 범위를 벗어났을 때
   */
  deselect: function (index) {
    if (index < 0 || index >= this.getComponents().length){
      throw new RangeError('Specified index is out of range: '.concat(val). 
          concat(this.currentStack()));
    }
    this.getComponent(index).setSelected(false);
    
    tau.arr(this._selectedIndexes).remove(index);
    
    if (this.isDrawn() && this._valueChangeEnabled !== false){
      this.fireEvent(tau.rt.Event.VALUECHANGE, {selectedIndexes: [], deselectedIndexes: [index]});
    }
  },  
  
  /**
   * index에 해당하는 아이템을 토글한다.
   * draw된 상태이면 {@link tau.rt.Event.SELECTCHANGE} 이벤트가 발생한다.
   * 이때 payload로 새롭게 선택된 인덱스 배열 <code>payload.selectedIndexes</code>과
   * 선택해제된 인덱스 배열 정보 <code>payload.deselectedIndexes</code>를 전달한다.
   * @param {Number} index 선택할 인덱스
   * @returns {Boolean} 선택되었으면 <code>true</code>를 반환한다. 
   */
  toggle: function (index) {
    if (!this._togglable){
      return;
    }
    var selectedIndexes = this.getSelectedIndexes(),
        selected = false;

    if (selectedIndexes == index || this._multiple && selectedIndexes.indexOf(index) != -1){
      selected = true;
    }
    
    selected = !selected;
    
    this._selectableCnt = this._selectableCnt + (selected ? -1 : 1);
    
    this.getComponent(index).setSelected(selected);
    
    if (selected){
      if (this._multiple){
        tau.arr(this._selectedIndexes).pushUnique(index);
      } else {
        this._selectableCnt = 0;
        this._selectedIndexes[0] = index;
      }
    } else {
      if (this._multiple){
        tau.arr(this._selectedIndexes).remove(index);
      } else {
        this._selectableCnt = 1;
        this._selectedIndexes = [];
      }
    }
    if (this.isDrawn()){
      if (selected) {
        this.fireEvent(tau.rt.Event.VALUECHANGE, {selectedIndexes: [index], deselectedIndexes: []});
      } else {
        this.fireEvent(tau.rt.Event.VALUECHANGE, {selectedIndexes: [], deselectedIndexes: [index]});
      }
    }
    return selected;
  },

  /**
   * 초기화한다.
   */
  refresh: function () {
    if (!this._multiple){
      this._selectableCnt = 1;
    } else {
      this._selectableCnt = this._maxSelectableCnt;
    }
    this.setSelectedIndexes(this._initSelectedIndexes);
  }  
});


//------------------------------------------------------------------------------
/** @lends tau.ui.Select */
$class('tau.ui.Select').extend(tau.ui.SegmentedButton).define({

  $static: /** @lends tau.ui.Select */ {
    /** $dom의 popup DOM에 해당하는 키 <p /> popup 아이템 키 */
    POPUP_KEY: 'popup',
    /** $dom의 mask DOM에 해당하는 키 */
    MASK_KEY: 'mask',
    /** $dom의 control DOM에 해당하는 키 */
    CONTROL_KEY: 'control',
    /** $dom의 close button DOM에 해당하는 키 */
    CLOSE_KEY: 'close'
  },
  
  /**
   * 생성자, 새로운 Select컴포넌트 객체를 생성한다. 
   * <p/>
   * 다중값을 설정하거나, 하나의 값만 설정할 수 있는 컴포넌트.
   * 기능적으로 {@link tau.ui.SegmentdButton}과 유사하나 
   * 현재 선택된 값만 화면에 출력되고 값을 변경할 때 팝업 형태로 리스트가 나와 선택하는 형태임.
   * @class 
   * @constructs
   * @extends tau.ui.SegmentedButton
   * @example 
   * select1 = new tau.ui.Select({
   *   components: [
   *     {label : 'option1'},
   *     new tau.ui.Button({label: 'option2'}),
   *     {label : 'option3'}
   *   ],
   *   placeHolder: 'select',
   *   popupTitle: 'options'
   *   fullscreen: true,
   *   modal: true,
   *   selectedIndexes: [0, 1],
   *   maxSelectableCnt: 2
   * });
   *
   * @param {Object}  [opts] Select 옵션
   * @param {String}  [opts.popupTitle] 팝업의 제목
   * @param {Boolean} [opts.fullscreen=false] 전체 화면으로 리스트를 출력할지 여부를 설정한다.
   * @param {String}  [opts.placeHolder] 값이 설정되지 않았을 때 표시해 주는 텍스트
   * @param {Boolean} [opts.showCloseBtn=false] 닫힘 버튼을 보여줄지 여부를 설정한다.
   * @param {Boolean} [opts.modal=false] modal 여부를 설정한다. 기본값은 <code>false</code>이고 mask 영역을 클릭하면 팝업이 닫힌다.
   * @param {Function}[opts.closeFn] popup이 닫힌후에 호출되는 콜백함수
   * @see tau.ui.SegmentedButton
   */
  Select: function (opts) {//$ tau.ui.Select
    /** @private fullscreen 여부 */
    this._fullscreen = false;
    /** @private modal 여부 */
    this._modal = false;
    /** @private 닫힌 버튼 보여줄지 여부 */
    this._showCloseBtn = false;
    /** @private 닫힌후에 호출되는 콜백함수 */
    this._closeFn = tau.emptyFn;
    /** @private 팝업 제목 */
    this._popupTitle = null;
    /** @private placeHoler 텍스트 */
    this._placeHolder = null;
    
    this.setMapItem(tau.ui.Select.POPUP_KEY, new tau.ui.ScrollPanel());
    this.setMapItem(tau.ui.Select.MASK_KEY, new tau.ui.Mask({visible: false}));
    
    var events = [tau.rt.Event.TOUCHSTART, tau.rt.Event.TOUCHMOVE, 
                  tau.rt.Event.TOUCHEND];
    for (var i = 0, len = events.length; i < len; i++) {
      this.getPopupItem().publishEvent(events[i], { // listening to capture events
        antecedentFn: this.handleCaptureEvent
      });
    }

    this.$optionize = tau.mixin(this.$optionize, {
      handler: {
        /**
         * fullscreen 설정
         * @param {String} prop Function name
         * @param {Boolean} val fullscreen 여부 
         */
        fullscreen: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          if (val && !opts.hasOwnProperty('showCloseBtn')) {
            this._showCloseBtn = true;
          }
          this._fullscreen = val;
        },
        /**
         * 닫기 버튼 설정
         * @param {String} prop Function name
         * @param {Boolean} val 닫기 버튼 여부 
         */
        showCloseBtn: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          this._showCloseBtn = val;
        },
        /**
         * modal 설정
         * @param {String} prop Function name
         * @param {Boolean} val modal 여부 
         */
        modal: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          if (val && !opts.hasOwnProperty('showCloseBtn')) {
            this._showCloseBtn = true;
          }
          this._modal = val;
        },
        /**
         * closeFn 콜백함수 설정
         * @param {String} prop Function name
         * @param {Function} val closeFn 콜백함수 
         */
        closeFn: function (prop, val) {
          if (!tau.isFunction(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          this._closeFn = val;
        },
        /**
         * 팝업 제목 설정
         * @param {String} prop Function name
         * @param {String} val 팝업 제목 
         */
        popupTitle: function (prop, val) {
          if (!tau.isString(val)) {
            throw new TypeError(prop.concat(' option is not String: ', val, this.currentStack()));
          }
          this._popupTitle = val;
        },
        /**
         * placeHolder 설정
         * @param {String} prop Function name
         * @param {String} val placeHolder 
         */
        placeHolder: function (prop, val) {
          if (!tau.isString(val)) {
            throw new TypeError(prop.concat(' option is not String: ', val, this.currentStack()));
          }
          this._placeHolder = val;
        }
      }
    }, 'remix');
  },
  
  /**
   * 컴포넌트를 하위 아이템으로 추가한다.
   * <p/>
   * 컴포넌트의 부모/버블링 관계 설정을 하고 
   * 컴포넌트에서 이벤트를 처리하지 않아도 현재 인스턴스에서 처리하도록 한다.
   * <code>immediate</code>가 <code>false</code>인 경우 {@link tau.rt.Event.COMPADDED}
   * 이벤트를 발생시킨다.
   * @param {tau.ui.Button|Object} comp 현재 인스턴스에 추가할 컴포넌트 혹은 컴포넌트 옵션. 
   *         <code>Object</code>인 경우 {@link tau.ui.Button}을 생성한 후 추가한다.
   * @param {Number} [index] 특정 위치에 컴포넌트 DOM element를 추가한다. 
   * @param {Boolean} [immediate=false]컴포넌트를 바로 draw할지 설정한다. 
   *         <code>false</code>이면 객체가 draw할 때 일괄적으로 DOM Tree에 반영된다. 
   * @returns {Boolean} 컴포넌트가 추가가 완료되었다면 <code>true</code>
   * @throws {TypeError} 명시된 comp가 {@link tau.ui.Button}의 객체가 아닐 경우
   * @throws {RangeError} 명시된 index가 범위를 벗어났을 때
   * @overrides
   */
  add: function (comp, index, immediate) {
    
    index = index || this.getComponents().length;
    
    if (comp && comp.constructor === Object ) {
      comp = new tau.ui.Button(comp);
    } 
    
    if(!(comp instanceof tau.ui.Button)) {
      throw new TypeError(comp + " is not an instance of tau.ui.Button or " +
          "tau.ui.Button's option: " + this.currentStack());
    }
    var styleClass = this.$renderData.$styleClass ? this.$renderData.$styleClass.item : 
      this.renderer.$styleClass.item; 
    comp.setBaseStyleClass(this.getBaseStyleClass() + styleClass);
    
    if (this.getPopupItem().add(comp)) {
      comp.setParent(this);
      return true;
    }
    return false; 
  },
  
  /**
   * <code>{@link tau.ui.Drawable}</code> 인스턴스의 루트 DOM element를 반환한다.
   * <p/>
   * 루트 DOM element가 없는 경우 DOM element를 생성해서 반환한다.
   * <code>key</code>가 있는 경우 해당 키의 parent가 되는 DOM Element를 반환한다.
   * <code>createElement</code>가 <code>true</code>인 경우 parent DOM Element를 생성해서 반환한다.
   * @param {String} key $dom 키값
   * @param {Boolean} [createElement=false] 
   * @returns {HTMLElement} DOM element
   * @overrides
   */
  getDOM: function (key, createElement) {
    var scene;
    if (key === tau.ui.CONTENT_KEY) {
      var popup = this.getPopupItem();
      return popup.getDOM(key, createElement);
    } else if (key === tau.ui.Select.POPUP_KEY && (scene = this.getScene())) {
      var popup = this.getPopupItem();
      if (!popup.isDrawn()) {
        var dom = tau.ui.Select.$super.getDOM.apply(this, arguments);
        tau.util.dom.appendChild(scene.getDOM(), dom);
        return dom;
      }
    }
    return tau.ui.Select.$super.getDOM.apply(this, arguments);
  },
  
  /**
   * 순차적인 컴포넌트 리스트를 반환한다.
   * @returns {Array}
   * @overrides
   * @see tau.ui.Container.getComponents
   */
  getComponents: function () {
    return this.getPopupItem().getComponents();
  },
  
  /**
   * popup 아이템을 반환한다.
   * @returns {tau.ui.ScrollPanel}
   */
  getPopupItem: function () {
    return this.getMapItem(tau.ui.Select.POPUP_KEY);
  },
  
  /**
   * mask 아이템을 반환한다.
   * @returns {tau.ui.Mask}
   */
  getMaskItem: function () {
    return this.getMapItem(tau.ui.Select.MASK_KEY);
  },  
  
  /**
   * close 아이템을 반환한다.
   * @returns {tau.ui.Button}
   */
  getCloseItem: function () {
    var item = null;
    if (this._showCloseBtn) {
      item = this.getMapItem(tau.ui.Select.CLOSE_KEY);
      if (!item)
        item = new tau.ui.Button({baseStyleClass : 'tau-select-popup-close'});
        this.setMapItem(tau.ui.Select.CLOSE_KEY, item);
    }
    return item;
  },

  /**
   * 이벤트 {@link tau.rt.Event.VALUECHANGE} 처리 함수
   * <p/>
   * 이벤트 {@link tau.rt.Event.VALUECHANGE}를 처리하기 위해서는 오버라이드해야한다.
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @private
   */
  handleValueChange: function (e, palyoad) {
    if (!this._multiple){
      this._updateTitle();
    }
    tau.ui.Select.$super.handleValueChange.apply(this, arguments);
  },
  
  /**
   * 랜더링을 수행한다.
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @private
   */
  render: function (refresh) {
    this._updateTitle();
    this.renderer.updateFullScreen(this.$renderData, this._fullscreen);
    this.renderer.updateMuliple(this.$renderData, this._multiple);
    this.renderer.updatePopupTitle(this.$renderData, this._popupTitle, this._fullscreen);

    this.drawItem(tau.ui.Select.POPUP_KEY, refresh);
    this.drawItem(tau.ui.Select.MASK_KEY, refresh);
    if (this._showCloseBtn) {
      this.getCloseItem();
      this.drawItem(tau.ui.Select.CLOSE_KEY, refresh);
    }
  },
  
  /**
   * 선택된 리스트의 제목, 배지를 업데이트한다.
   */
  _updateTitle: function () {
    var title = this.getSelectedTitle(), 
        length = this._maxSelectableCnt - this._selectableCnt;
    if (!length) {
      title = this._placeHolder;
    }
    this.renderer.updateTitle(this.$renderData, title);
    this.renderer.updateBadge(this.$renderData, length);
    
    if (this.isDrawn()){
      this.getMaskItem().setVisible(false);
      this.renderer.closePopup(this.$renderData);
      if (this._closeFn){
        this._closeFn();
      }
    }
  },
  
  /**
   * 현재 선택된 타이틀을 리턴한다.
   * @returns {String[]}
   */
  getSelectedTitle: function () {
    var indexes = this.getSelectedIndexes(),
        selectedTitles = [];
    for (var i=indexes.length; i--;){
      selectedTitles[i] = this.getComponent(indexes[i]).getLabel(tau.ui.Control.NORMAL);
    }
    return selectedTitles;
  },

  
  /**
   * 이벤트 {@link tau.rt.Event.TAP} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see {tau.ui.Component.handleTap}
   * @private
   */
  handleTap: function (e, payload) {
    e.preventDefault();
    e.stopPropagation();

    var comp = e.getSource();
    
    if (comp === this) {
      this.getMaskItem().setVisible(true);
      this.renderer.showPopup(this.$renderData);
      this.getPopupItem().refresh();
    } else if (comp === this.getCloseItem()) {
      this._updateTitle();
    } else if (comp === this.getMaskItem() && !this._modal) {
      this._updateTitle();
    } else {
      var index =  this.indexOf(comp)[0];
      if (index > -1) {
        var selectedIndexes = this.getSelectedIndexes(), 
            selected = selectedIndexes.indexOf(index) > -1;
        
        if (selected && this._togglable) {
          this.toggle(index);
        } else if (!selected){
          this.select(index);
        }
      }
    }
  },

  /**
   * @param {tau.rt.Event} e Event object
   * @param {Object} payload payload object if exists
   * @private
   */
  handleCaptureEvent: function (e, payload) {
    switch (e.getName()) {
      case tau.rt.Event.TOUCHSTART:
      case tau.rt.Event.TOUCHMOVE:
      case tau.rt.Event.TOUCHEND:
        e.preventDefault();
        e.stopPropagation();
        break;
    }
  },
  
  /**
   * 초기화한다.
   */
  refresh: function () {
    tau.ui.Select.$super.refresh.apply(this, arguments);
    this._updateTitle();
  }
});


//------------------------------------------------------------------------------
/** @lends tau.ui.SystemDialog */
$class('tau.ui.SystemDialog').extend(tau.rt.EventDelegator).mixin(
    tau.ui.Drawable).define({
  
  $static: /** @lends tau.ui.SystemDialog */ {
    /** alert 타입 */
    ALERT_TYPE: 0,
    /** confirm 타입 */
    COFIRM_TYPE: 1,
    /** prompt 타입 */
    PROMPT_TYPE: 2,
    
    /** OK 버튼 텍스트 */
    OK_MSG: 'ok',
    /** cancel 버튼 텍스트 */
    CANCEL_MSG: 'cancel'
  },

  /**
   * Runtime내부에서 사용되며 시스템 다이얼로그로서 사용자가 javascript에서 제공하는 
   * <code>alert</code>, <code>confirm</code>, <code>prompt</code>와 같은 기능을 제공한다.
   * 단 javascript에서 제공하는 popup boxes는 poup boxes가 실행중에는 그 이후 코드가 실행되지 않고 
   * 블락이 되나 시스템 다이얼로그는 블락되지 않고 이후 코드가 실행된다. 이후 코드가 실행되지 않고 확인 버튼을 누른후에
   * 실행하고자 한다면 콜백함수를 통해 처리할 수 있다.
   * @class 새로운 SystemDialog객체를 생성한다. 새롭게 생성된 객체는 Runtime의 property
   * 로 설정된다. Runtime이 생성될 때 설정되며 한번 설정된 이후에는 변경을 해서는 안된다.
   * @mixins tau.ui.Drawable
   * @constructs
   */
  SystemDialog: function () {//$ tau.ui.SystemDialog
    this._panel = new tau.ui.ScrollPanel();
    this._textfield = new tau.ui.TextField({clearButtonMode: true});
    this.setBaseStyleClass('tau-systemdialog');
  },
  
  propagateEvent: function (e, payload) {
    tau.ui.SystemDialog.$super.propagateEvent.apply(this, arguments);
    switch (e.getName()) {
      case tau.rt.Event.RT_STOP:
        this.close();
        break;
    }
  },
  
  /**
   * 현재 컨트롤러에 있는 모든 하위{@link tau.rt.EventDelegator}을 반환한다.:
   * 컨포넌트 히트 테스트에서 사용됨.
   * @returns {Array} 하위(EventDelegators)을 가지는 배열
   */
  getSubDelegators: function () {
    return [this._panel, this._textfield];
  },
  
  isActive: function () {
    if (this.getDOM().style.display === 'none'){
      this._active = false;
    }
    return this._active;
  },
  
  /**
   * 다이얼로그를 보여준다.
   * @param {Number} type 다이얼로그 타입
   * @param {String} msg 다이얼로그 메세지
   * @param {Object} [opts] 시스템 다이얼로그 옵션
   * @param {String} [opts.title] 다이얼로그 제목
   * @param {String} [opts.okText] 확인버튼 텍스트
   * @param {String} [opts.cacelText] 취소버튼 텍스트
   * @param {String} [opts.placeholderLabel] 입력 placeholder 텍스트. {@link tau.ui.SystemDialog.PROMPT_TYPE}인 경우에만 설정가능하다.
   */
  open: function (type, msg, opts) {
    delete this.opts;
    
    this.opts = opts;
    this._active = true;
    this.type = type;
    
    var okText = tau.ui.SystemDialog.OK_MSG, 
        cacelText = tau.ui.SystemDialog.CANCEL_MSG,
        panel = this._panel, 
        dom = this.getDOM(),
        nest = dom.firstChild,
        panelDOM = nest.childNodes[1],
        ok = nest.childNodes[2].childNodes[1],
        cacel = nest.childNodes[2].firstChild,
        title;
    
    panel.$renderData.$dom[tau.ui.CONTENT_KEY].innerHTML = msg || null;
    
    if (opts){
      title = opts.title;
      okText = opts.okText || okText;
      cacelText = opts.cacelText || cacelText;
    }
    nest.firstChild.innerHTML = title || '';
    ok.innerHTML = okText;
    cacel.innerHTML = cacelText;
    
    if (type === tau.ui.SystemDialog.ALERT_TYPE) {
      cacel.style.display = 'none';
    } else {
      cacel.style.display = '';
    }
    
    nest.style.opacity = '0';
    this.setVisible(true);

    tau.util.style(panelDOM, 'height', panelDOM.offsetHeight + 'px');
    
    if (type === tau.ui.SystemDialog.PROMPT_TYPE) {
      var placeholderLabel = opts && opts.placeholderLabel || null;
      this._textfield.setVisible(true);
      this._textfield.setPlaceholderLabel(placeholderLabel);
      tau.util.style(panel.getDOM(), 'height', 
          panelDOM.offsetHeight - this._textfield.getDOM().offsetHeight  +'px');
    } else {
      this._textfield.setVisible(false);
      tau.util.style(panel.getDOM(), 'height', '');
    }
    
    panel.refresh();
    panel.scrollTo(0,0, '0ms');
    nest.style.opacity = '1';
  },
  
  /**
   * 다이얼로그를 닫는다.
   * @param {Object} type 취소, 확인 버튼 눌르고 난후에 넘어오는 반환값
   */
  close: function (type) {
    if (!this._active){
      return;
    }
    if (this.type === tau.ui.SystemDialog.PROMPT_TYPE && this._textfield){
      if (type){
        type = this._textfield.getText();
      } else {
        type = '';
      }
      this._textfield.setText(null);
    }

    delete this.type;
    this.setVisible(false);
    this._active = false;
    
    if (this.opts){
      this.opts.callbackFn(type);
      delete this.opts;
    }
  },
  
  /**
   * 이벤트 {@link tau.rt.Event.TOUCHSTART} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @private
   */
  handleTouchStart: function (e, payload){
    if (!this._active){
      return;
    }
    var target = tau.util.dom.getElementNode(e.touches[0].target);
    if (target === this._panel.getDOM()){
      this._panel.handleTouchStart(e, payload);
    }
  },
  
  /**
   * 이벤트 {@link tau.rt.Event.TOUCHMOVE} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @private
   */
  handleTouchMove: function(e, payload) {
    if (!this._active){
      return;
    }
    var target = tau.util.dom.getElementNode(e.touches[0].target);
    if (target === this._panel.getDOM()){
      this._panel.handleTouchMove(e, payload);
    }
  },
  
  /**
   * 이벤트 {@link tau.rt.Event.TOUCHEND} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @private
   */
  handleTouchEnd: function (e, payload) {
    if (!this._active){
      return;
    }
    var target = tau.util.dom.getElementNode(e.touches[0].target);
    if (target === this._panel.getDOM()){
      this._panel.handleTouchEnd(e, payload);
    }
  },
  
  _template: ['<div class="tau-systemdialog-popup">',
                '<h1 class="tau-systemdialog-popup-title"></h1>', 
                '<div class="tau-systemdialog-msg"></div>', 
                '<div class="tau-systemdialog-control">', 
                  '<div class="tau-systemdialog-control-cancel" onclick="tau.getRuntime().getSystemDialog().close(false);"></div>', 
                  '<div class="tau-systemdialog-control-ok" onclick="tau.getRuntime().getSystemDialog().close(true);"></div>',
                 '</div>',
              '</div>',
              '<div class="tau-systemdialog-mask"></div>'],
  
  /**
   * 컴포넌트를 draw한다.
   * @overrides tau.ui.Drawable.prototype.draw
   * @param {HTMLElement} parent 컨텐츠를 렌더링할 부모 DOM element
   * @param {Boolean} [refresh=false] <code>true</code>이면 이전 컨텐츠를 클리어하고 다시 draw한다.
   * @param {HTMLElement} [refChild] 컨텐츠를 렌더링할 이전 Child DOM element 
   * @see tau.ui.Drawable.draw
   */
  draw: function (parent, refresh, refChild) {
    var dom = this.getDOM(), 
        container;
    this.setVisible(false);
    if (!this.isDrawn()) {
      dom.innerHTML = this._template.join('');
      container = dom.firstChild.childNodes[1];
      this._panel.draw(container);
      this._textfield.setVisible(false);
      this._textfield.draw(container);
    }
    return tau.ui.Drawable.prototype.draw.apply(this, arguments);
  }
});


//------------------------------------------------------------------------------
/** @lends tau.ui.Dialog */
$class('tau.ui.Dialog').extend(tau.ui.ScrollPanel).define({

  $static: /** @lends tau.ui.Dialog */ {
    /** $dom의 mask DOM에 해당하는 키 */
    MASK_KEY: 'mask',
    /** $dom의 popup DOM에 해당하는 키 */
    POPUP_KEY: 'popup',
    /** $dom의 close button DOM에 해당하는 키 */
    CLOSE_KEY: 'close'
  },


  /**
   * 생성자, 새로운 Dialog컴포넌트 객체를 생성한다. 
   * @class 
   * @constructs
   * @extends tau.ui.ScrollPanel
   * @example 
   * var dialog = new tau.ui.Dialog({
   *   dir: tau.ui.UP_DIR,
   *   components: 
   *   ['button1',
   *    'button2',
   *    new tau.ui.Button({label: 'button3', styles: {backgroundColor: 'red'})
   *    ]
   * }); 
   * @param {Object}  [opts] Dialog 옵션
   * @param {Boolean} [opts.fullscreen=false] 전체 화면으로 리스트를 출력할지 여부를 설정한다.
   * @param {Boolean} [opts.modal=false] modal 여부를 설정한다. 기본값은 <code>false</code>이고 mask 영역을 클릭하면 팝업이 닫힌다.
   * @param {Boolean} [opts.showCloseBtn=false] 닫힘 버튼을 보여줄지 여부를 설정한다.
   * @param {Boolean} [opts.animated=true] 애니메이션 적용여부
   * @param {Function}[opts.closeFn] popup이 닫힌후에 호출되는 콜백함수
   * @param {Number}  [opts.dir] 애니메이션 방향 
   * <ul>
   *  <li>{@link tau.ui.UP_DIR}</li>
   *  <li>{@link tau.ui.DOWN_DIR}</li>
   *  <li>{@link tau.ui.LEFT_DIR}</li>
   *  <li>{@link tau.ui.RIGHT_DIR}</li>
   * </ul>
   * @param {String}  [opts.popupTitle] 팝업의 제목
   * @see tau.ui.ScrollPanel
   */
  Dialog: function (opts) {//$ tau.ui.Dialog
    
    this._fullscreen = false;
    this._dir = tau.ui.UP_DIR;
    this._modal = false;
    this._animated = true;
    this._showCloseBtn = false;
    this._closeFn = tau.emptyFn;
    this._popupTitle = null;
    
    this._hScroll = false;
    
    this.setMapItem(tau.ui.Dialog.MASK_KEY, new tau.ui.Mask({visible: false}));
    
    this.$optionize = tau.mixin(this.$optionize, {
      handler: {
        /**
         * fullscreen 설정
         * @param {String} prop Function name
         * @param {Boolean} val fullscreen 여부 
         */
        fullscreen: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          if (val && !opts.hasOwnProperty('showCloseBtn')) {
            this._showCloseBtn = true;
          }
          this._fullscreen = val;
        },
        /**
         * 닫기 버튼 설정
         * @param {String} prop Function name
         * @param {Boolean} val 닫기 버튼 여부 
         */
        showCloseBtn: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          this._showCloseBtn = val;
        },
        /**
         * dir 설정
         * @param {String} prop Function name
         * @param {Number} val 애니메이션 방향 
         * <ul>
         *  <li>{@link tau.ui.UP_DIR}</li>
         *  <li>{@link tau.ui.DOWN_DIR}</li>
         *  <li>{@link tau.ui.LEFT_DIR}</li>
         *  <li>{@link tau.ui.RIGHT_DIR}</li>
         * </ul> 
         */
        dir: function (prop, val) {
          switch (val) {
          case tau.ui.UP_DIR:
          case tau.ui.DOWN_DIR:
          case tau.ui.LEFT_DIR:
          case tau.ui.RIGHT_DIR:
            break;
          default:
            throw new RangeError(prop.concat(' option is out of range: ', val, this.currentStack()));
            break;
          }
          this._dir = val;
        },
        /**
         * modal 설정
         * @param {String} prop Function name
         * @param {Boolean} val modal 여부 
         */
        modal: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          if (val && !opts.hasOwnProperty('showCloseBtn')) {
            this._showCloseBtn = true;
          }
          this._modal = val;
        },
        /**
         * animation 설정
         * @param {String} prop Function name
         * @param {Boolean} val animation 여부 
         */
        animated: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          this._animated = val;
        },
        /**
         * closeFn 콜백함수 설정
         * @param {String} prop Function name
         * @param {Function} val closeFn 콜백함수 
         */
        closeFn: function (prop, val) {
          if (!tau.isFunction(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          this._closeFn = val;
        },
        /**
         * 팝업 제목 설정
         * @param {String} prop Function name
         * @param {String} val 팝업 제목 
         */
        popupTitle: function (prop, val) {
          if (!tau.isString(val)) {
            throw new TypeError(prop.concat(' option is not String: ', val, this.currentStack()));
          }
          this._popupTitle = val;
        }
      }
    }, 'remix');
  },
  
  /**
   * mask 아이템을 반환한다.
   * @returns {tau.ui.Mask}
   */
  getMaskItem: function () {
    return this.getMapItem(tau.ui.Dialog.MASK_KEY);
  },  
  
  /**
   * @param {Obejct} [opts] 
   * @param {tau.ui.Component} [opts.comp] 컴포넌트 근처에 Dialog를 표시한다.
   * @param {Boolean}[opts.animated=true] 애니메이션 적용여부
   * @param {Number}  [opts.dir] 애니메이션 방향 
   * <ul>
   *  <li>{@link tau.ui.UP_DIR}</li>
   *  <li>{@link tau.ui.DOWN_DIR}</li>
   *  <li>{@link tau.ui.LEFT_DIR}</li>
   *  <li>{@link tau.ui.RIGHT_DIR}</li>
   * </ul>
   */
  open: function (opts) {
    var dom;
    if (opts){
      if (opts.comp instanceof tau.ui.Component){
        dom = opts.comp.getDOM();
      } else if (opts.dom) {
        dom = opts.dom;
      }
    }
    // TODO 정리
    this.getMaskItem().setVisible(true);
    this.renderer.showby(this.$renderData, dom);
    this.refresh();
    this.renderer.open(this.$renderData, tau.mixin({
      animated: this._animated, 
      dir: this._dir,
      dom: dom
    }, opts, true));
  },
  
  /**
   * Dialog를 보이지 않게 한다.
   */
  close: function () {
    this.getMaskItem().setVisible(false);
    this.setVisible(false);
    this.renderer.close(this.$renderData);
    if (this._closeFn){
      this._closeFn();
    }
  },
  
  /**
   * 이벤트 {@link tau.rt.Event.TAP} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see {tau.ui.Component.handleTap}
   * @private
   */
  handleTap: function (e, payload) {
    var src = e.getSource();
    if (this._showCloseBtn && this.renderer.hasElement(this.$renderData,
        e.touches[0].target, tau.ui.Dialog.CLOSE_KEY) || (!this._modal &&
            src === this.getMaskItem())){
      this.close();
    }
  },
  
  /**
   * 랜더 함수 전처리
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   */
  beforeRender: function (refresh) {
    this.setVisible(false);
    return tau.ui.Dialog.$super.beforeRender.apply(this, arguments);
  },
  
  /**
   * 랜더링을 수행한다.
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @private
   */
  render: function (refresh) {
    this.renderer.updatePopupTitle(this.$renderData, this._popupTitle);
    this.renderer.updateCloseBtn(this.$renderData, this._showCloseBtn);
    this.drawItem(tau.ui.Dialog.MASK_KEY);
    return tau.ui.Dialog.$super.render.apply(this, arguments);
  }
});


//------------------------------------------------------------------------------
/** @lends tau.ui.ActionSheet */
$class('tau.ui.ActionSheet').extend(tau.ui.Dialog).define({

  /**
   * 생성자, 새로운 ActionSheet컴포넌트 객체를 생성한다. 
   * <p/>
   * 팝업 형태로 버튼들을 표시하고 버튼을 눌렸을 때 {@link tau.rt.Event.SELECTCHANGE} 이벤트를 받아서 처리할 수 있다.
   * @class 
   * @constructs
   * @extends tau.ui.Dialog
   * @example 
   * var actionsheet = new tau.ui.ActionSheet({
   *   dir: tau.ui.UP_DIR,
   *   components: 
   *   [{label: 'button1'},
   *    {label: 'button2'},
   *    new tau.ui.Button({label: 'button3', styles: {backgroundColor: 'red'})
   *    ]
   * }); 
   * @param {Object} [opts] ActionSheet 옵션
   * @see tau.ui.Dialog 옵션을 상속받고 있음
   */
  ActionSheet: function (opts) {//$ tau.ui.ActionSheet
    this.$optionize = tau.mixin(this.$optionize, {
      handler: {
        /**
         * 닫기 버튼 설정
         * @overrides
         * @param {String} prop Function name
         * @param {Boolean} val 닫기 버튼 여부 
         */
        showCloseBtn: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          if (val) {
            this.setMapItem(tau.ui.Dialog.CLOSE_KEY, new tau.ui.Button({
              label: 'cancel', styleClass: {type: 'dark'}}));
          }
          this._showCloseBtn = val;
        },
        selectChange: tau.optionize.onEvent // register tap onEvent
      }
    }, 'remix');
  },

  /**
   * 컴포넌트를 하위 아이템으로 추가한다.
   * <p/>
   * 컴포넌트의 부모/버블링 관계 설정을 하고 
   * 컴포넌트에서 이벤트를 처리하지 않아도 현재 인스턴스에서 처리하도록 한다.
   * <code>immediate</code>가 <code>false</code>인 경우 {@link tau.rt.Event.COMPADDED}
   * 이벤트를 발생시킨다.
   * @param {tau.ui.Button|Object} comp 현재 인스턴스에 추가할 컴포넌트 혹은 컴포넌트 옵션. 
   *         <code>Object</code>인 경우 {@link tau.ui.Button}을 생성한 후 추가한다.
   * @param {Number} [index] 특정 위치에 컴포넌트 DOM element를 추가한다. 
   * @param {Boolean} [immediate=false]컴포넌트를 바로 draw할지 설정한다. 
   * <code>false</code>이면 객체가 draw할 때 일괄적으로 DOM Tree에 반영된다. 
   * @returns {Boolean} 컴포넌트가 추가가 완료되었다면 <code>true</code>
   * @throws {TypeError} 명시된 comp가 {@link tau.ui.Button}의 객체가 아닐 경우
   * @throws {RangeError} 명시된 index가 범위를 벗어났을 때
   * @overrides
   */
  add: function (comp, index, immediate) {
    if (comp && comp.constructor === Object ) {
      comp = new tau.ui.Button(comp);
    }
    if (!(comp instanceof tau.ui.Button)){
      throw new TypeError(comp + " is not an instance of tau.ui.Button or tau.ui.Button's option: "
          + this.currentStack());
    }
    return tau.ui.Container.prototype.add.apply(this, arguments);
  },

  
  /**
   * close 아이템을 반환한다.
   * @returns {tau.ui.Button}
   */
  getCloseItem: function () {
    return this.getMapItem(tau.ui.Dialog.CLOSE_KEY);
  },
  
  /**
   * 이벤트 {@link tau.rt.Event.TAP} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see {tau.ui.Component.handleTap}
   * @private
   */
  handleTap: function (e, payload) {
    var src = e.getSource(), 
      parent = src.getParent();

    if (src === this.getCloseItem()){
      this.close();
      this.fireEvent(tau.rt.Event.SELECTCHANGE, -1);
    } else if (parent === this){
      this.close();
      this.fireEvent(tau.rt.Event.SELECTCHANGE, this.indexOf(src));
    } else if (!this._modal && src === this.getMaskItem()){
      this.close();
    }
  },
  
  /**
   * 랜더링을 수행한다.
   * @param {Boolean} [refresh=false] 리프레쉬 여부
   * @private
   */
  render: function (refresh) {
    this.renderer.updatePopupTitle(this.$renderData, this._popupTitle);
    this.drawItem(tau.ui.Dialog.CLOSE_KEY, refresh);
    this.drawItem(tau.ui.Dialog.MASK_KEY);
    this.drawComponents(refresh);
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.Shortcut */
$class('tau.ui.Shortcut').extend(tau.ui.Component).mixin(tau.ui.Control).define({
  $static: /** @lends tau.ui.Shortcut */{
    TEXT_LENGTH: 8,
    PRESS_THRESHOLD: 600,
    EVENT_CLOSE: 'shortcutclose',
    EVENT_DELETE: 'shortcutdelete',
    EVENT_LONGPRESS: 'shortcutlongpress',
    ICON_CLASS: 'tau-shortcut-icon'
  },
  
  /**
   * opts 파라미터를 이용하여 새로운 객체를 생성한다. 객체를 생성한 후 객체의
   * 메소드를 통해 값을 설정할 수도 있자만 opt를 이용하여 객체를 생성하면 훨씬 짧은코드로
   * 쉽게 객체를 생성할 수 있다.
   * <pre>
   * var shortcut = new tau.ui.Shortcut();
   * shortcut.setName('xxx');
   * shortcut.setTitle('xxx');
   * ...
   * 
   *  or
   * 
   * var shortcut = new tau.ui.Shortcut({name: 'xxx', title: 'xxx', ...});
   * </pre>
   * @class
   * Dashboard 에 생성될 Shortcut을 정의한다. 이 클래스는 Dashboard
   * 에서만 사용되는 것이 아니라 범용적으로 사용될 수 있도록 제작되었다.
   * @constructs
   * @param {Object} opts Dashboard에 대한 환경설정정보
   * @extends tau.ui.Component
   * @mixins tau.ui.Control
   */
  Shortcut: function (opts) {
    this._presstimer = null;
    this.$optionize = tau.mixin(this.$optionize, {
      handler: {
        '$mutable': function (prop, val) {
          this.mutable = val;
        }
      }
    }, 'remix');
  },
  
  /**
   * 현재 Shortcut이 삭제 가능한지 여부를 반환한다. 만약 삭제되지 않는
   * App일 경우 <code>false</code>를 그렇지 않으면 <code>true</code>를 
   * 반환한다. 삭제되지 않는 App은 시스템 App임을 의미한다.
   * @returns {Boolean} 삭제되지 않는 앱(시스템)일 경우 <code>false</code>를 반환, 사용자가 설치한
   * 앱일 경우 <code>true</code>를 반환한다.
   */
  isMutable: function () {
    return this.mutable;
  },
  
  /**
   * 사용자가 Shortcut을 터치했을 때 발생되는 이벤트를 처리합니다. Shortcut을 
   * {@link tau.ui.Shortcut.PRESS_THRESHOLD}보다오래 누르고 있으면
   * {@link tau.ui.Shortcut.EVENT_LONGPRESS}이벤트가 발생된다.
   * @param {tau.rt.Event} e 사용자가 Shortcut을 터치 시작했을 때 발생하는 이벤트
   * @param {Object} payload 이벤트에 동반하는 payload
   * @see tau.ui.Shortcut.PRESS_THRESHOLD
   * @see tau.ui.Shortcut.PRESS_THRESHOLD
   * @private
   */
  handleTouchStart: function (e, payload) {
    var that = this;
    this._longPressed = false;
    this._presstimer = window.setTimeout(function () {
      that.fireEvent(tau.ui.Shortcut.EVENT_LONGPRESS,
          {pressThreshold: tau.ui.Shortcut.PRESS_THRESHOLD, event:e});
      that._longPressed = true;
    }, tau.ui.Shortcut.PRESS_THRESHOLD);
    // @ TODO 아이콘 터치시 Effect 처리
  },
  
  /**
   * 사용자가 Shortcut을 터치한 다음 이동할 때 발생되는 이벤트를 처리한다. 이때 사용자가
   * Shortcut을 누르고 있었던 상태에서 {@link tau.ui.Shortcut.EVENT_LONGPRESS}가
   * 발생되지 않았다면 설정된 Timer를 해제한다.
   * @param {tau.rt.Event} e 사용자가 Shortcut을 터치후 이동할 때 발생하는 이벤트
   * @param {Object} payload 이벤트에 동반하는 payload
   * @private
   */
  handleTouchMove: function (e, payload) {
    if (this._presstimer) {
      window.clearTimeout(this._presstimer);
      this._presstimer = null;
    }
    // @ TODO 아이콘 Effect 제거
  },
  
  /**
   * 사용자가 Shortcut을 터치 직후(이동없음) 발생되는 이벤트를 처리한다. 
   * 현재 터치된 부분이 Shortcut의 종료 badge일 경우 
   * {@link tau.ui.Shortcut.EVENT_CLOSE} 이벤트를 발생시킨다.
   * @param {tau.rt.Event} e 사용자가 Shortcut을 터치 직후 발생하는 이벤트
   * @param {Object} payload 이벤트에 동반하는 payload
   */
  handleTap: function (e, payload) {
    if (!this._longPressed && e.getSource() === this && e.touches) {
      var event = null, 
          hasClass = tau.util.dom.hasClass, 
          dom = this.getDOM();
      for (var t = e.touches[0].target; t !== dom; t = t.parentNode) {
        if (hasClass(t, 'tau-shortcut-close')) {
          event = tau.ui.Shortcut.EVENT_CLOSE;
        } else if (hasClass(t, 'tau-shortcut-delete')) {
          event = tau.ui.Shortcut.EVENT_DELETE;
        }
        if (event) {
          this.fireEvent(event);// fire event
          break;
        }
      }
    }
  },
  
  /**
   * 사용자가 Shortcut에서 손을 떼었을 때 발생되는 이벤트를 처리한다. 만약 LongPress Timer
   * 가 동작중이고 아직 {@link tau.ui.Shortcut.EVENT_LONGPRESS}이벤트가 발생되지 
   * 않은 상태이면 Timer를 해제한다.
   * @param {tau.rt.Event} e 사용자가 Shortcut을 손에서 뗄때 발생되는 이벤트
   * @param {Object} payload 이벤트에 동반하는 payload
   */
  handleTouchEnd: function (e, payload) {
    if (this._presstimer) {
      window.clearTimeout(this._presstimer);
      this._presstimer = null;
    }
    // @ TODO 아이콘 터치 종료시 Effect 처리
  },
  
  /**
   * Shortcut을 통해 실행할 앱의 이름을 설정한다.
   * @param {String} name 설정할 앱의 이름
   */
  setName: function (name) {
    this._name = name;
  },
  
  /**
   * 현재 Shortcut에 설정된 앱의 이름을 반환한다. 만약 설정된 이름이 없으면 undefined를 반환한다.
   * @returns {String} 실행할 앱의 이름
   */
  getName: function () {
    return this._name;
  },
  
  /**
   * Shortcut을 통해 화면에 출력하고자 하는 타이틀을 설정한다.
   * @param {String} title 설정하고자 하는 Shortcut의 타이틀
   */
  setTitle: function (title) {
    this._title = title;
  },
  
  /**
   * Shortcut에 설정된 타이틀을 반환한다. 만약 설정된 Title이 없으면 undefined를 반환한다.
   * @returns {String} Shortcut에 설정된 타이틀
   */
  getTitle: function () {
    return this._title;
  },
  
  /**
   * Shortcut에 출력될 아이콘의 패스를 설정한다. 이때 설정할 아이콘 패스는 Full path로 입력한다.
   * @param {String} icon Shortcut에 출력될 아이콘의 Full path
   */
  setIcon: function (icon) {
    this._icon = icon;
  },
  
  /**
   * 현재 Shortcut에 설정된 icon의 path를 반환한다.
   * @returns {String} icon의 경로(path)
   */
  getIcon: function () {
    return this._icon;
  },
  
  /**
   * Shortcut을 SystemDock에서 삭제 가능한 상태로 변경한다. 
   * 이 상태가 되면 Shortcut에 삭제를 위한 badge 가 출력된다.
   * @param {Boolean} state <code>true</code>이면 Shortcut을 삭제 가능한 상태로 설정, 그렇지 않으면
   * 원 상태로 복구 한다.
   */
  removable: function (state) {
    if (this.isDrawn()) {
      var badge = state ? '-' : undefined;
      this._drawBadge('tau-shortcut-close', badge);
    }
  },
  
  /**
   * Shortcut을 Dashboard에서 삭제 가능한 상태로 변경한다. 
   * 이 상태가 되면 Shortcut에 삭제를 위한 badge 가 출력된다.
   * @param {Boolean} state <code>true</code>이면 Shortcut을 삭제 가능한 상태로 설정, 그렇지 않으면
   * 원 상태로 복구 한다.
   */
  deletable: function (state) {
    if (this.isDrawn()) {
      var badge = state ? 'X' : undefined;
      this._drawBadge('tau-shortcut-delete', badge);
    }
  },
  
  /**
   * Shortcut에 Badge를 설정한다. 앱과 관련된 정보를 출력하기 위한 Badge와 삭제를 위한
   * Badge를 동시에 설정할 수 있다. 정보 표시를 위한 Badge를 설정하기 위해서는 클래스 이름을
   * 'tau-shortcut-badge'로 하고 삭제를 위한 Badge를 설정하기 위해서는 'tau-shortcut-close'로 한다.  
   * @param {String} cls 표현하고자 하는 Badge의 클래스 이름(삭제: .tau-shortcut-close, Badge: tau-shortcut-badge)   
   */
  _drawBadge: function (cls, value) {
    var dom = this.getDOM();
    var children = dom.getElementsByClassName(cls); // NodeList
    var holder = (children.length > 0) ? children[0] : null;
    if (holder) {
      if (value) { // change value
        holder.firstChild.innerHTML = value;
      } else { // remove badge
        dom.removeChild(holder);
      }
    } else if (value) { // create new badge
      var e = document.createElement('div');
      e.setAttribute('class', cls);
      e.innerHTML = '<span class="tau-shortcut-badge-label">' + value + '</span>';
      dom.appendChild(e);
    }
  },
  
  /**
   * 현재 Shortcut에 Badge를 설정한다. 이때 설정되는 Badge는 바로 화면에 반영된다.
   * @param {String} badge 화면에 출력할 Badge 정보
   */
  setBadge: function (badge) {
    if (this.isDrawn()) { // if drawn by Drawable
      this._drawBadge('tau-shortcut-badge', badge);
    }
    this._badge = badge;
  },
  
  /**
   * 현재 Shortcut에 설정된 Badge정보를 반환한다. 만약 설정된 Badge정보가 없으면 
   * undefined를 반환한다.
   * @returns {String} 현재 설정된 Badge정보
   */
  getBadge: function () {
    return this._badge;
  },
  
  /**
   * 상위클래스의 메소드를 Override하며 실제 화면에 Shortcut을 Rendering하는 작업을
   * 수행한다. 현재 Shortcut 객체는 자체적으로 Renderer를 가지고 있지 않다.
   * @param {Boolean} refresh <code>true</code>일 경우 화면을 refresh한다.
   * @see tau.ui.Component.render
   * @private
   */
  render: function (refresh) {
    var html = [],
      title = this._title;
    if (title.length > tau.ui.Shortcut.TEXT_LENGTH) {
      title = title.slice(0, tau.ui.Shortcut.TEXT_LENGTH);
    }
    tau.util.dom.addClass(this.getDOM(), 'tau-shortcut');
    html.push('<div class="'+tau.ui.Shortcut.ICON_CLASS+'" style="background-image: ');
    html.push('url(' + this._icon + ')"></div>');
    html.push(title);
    this.getDOM().innerHTML = html.join('');
    if (this._badge) {
      this.setBadge(this._badge);
    }
  }
});


//------------------------------------------------------------------------------
/** @lends tau.ui.Spinner */
$class('tau.ui.Spinner').extend(tau.ui.Component).mixin(tau.ui.Control).define({
  $static: /** @lends tau.ui.Spinner */
  {
    /** $dom의 value DOM에 해당하는 키 */
    VALUE_KEY: 'value_key',
    /** $dom의 increase DOM에 해당하는 키 */
    INCREASE_KEY: 'increase_key',
    /** $dom의 decrease DOM에 해당하는 키 */
    DECREASE_KEY: 'decrease_key'
  },

  /**
   * 생성자, 새로운 Spinner객체를 생성한다.
   * @class Spinner 클래스는 기본적으로 제공하는 버튼 컴포넌트이다. *
   * @example // 버튼 컴포넌트를 생성한다. var spinner = new tau.ui.Spinner({ step:1,
   *          min:-150, max:100, readonly:false, formatFn:function (v){ v =
   *          v.toFixed(2); return '$'+v; } });
   *          this.getScene().add(spinner);
   * @constructs
   * @extends tau.ui.Component
   * @mixins tau.ui.Control
   * @param {Object} [opts] Spinner 옵션
   * @param {Number} [opts.value] 초기값
   * @param {Number} [opts.step] 증분값
   * @param {Number} [opts.min] 최소
   * @param {Number} [opts.max] 최대
   * @param {Boolean} [opts.readonly] 읽기전용여부
   * @param {Boolean} [opts.acceleration] tab n hold Event 에서 가속 기능 사용 여부
   * @param {Boolean} [opts.disabled] 
   * @param {Number} [opts.size] 표시할 자리수
   * @param {Function} [opts.formatFn] display 될 값을 계산하는 함수.
   * @param {String} [opts.increaseText] 증가 button 에 표시 할 문자
   * @param {String} [opts.decreaseText] 감소 button 에 표시 할 문자.
   * @see tau.ui.Component 옵션을 상속받고 있음
   */
  Spinner: function (opts) {// $ tau.ui.Spinner
    this._accelerationStartCount = 4;
    this._normalSpeed = 300;
    this._accelerationRate = 3;
    this._accelerationSpeed = this._normalSpeed / this._accelerationRate;
    this.options = {
      value: 0,
      step: 1,
      min: null,
      max: null,
      readonly: false,
      acceleration: true,
      disabled: false,
      size: 5,
      formatFn: function (_val) {
        // return '$ ' + _val;
        return _val;
      },
      increaseText: '+',
      decreaseText: '-'
    };

    tau.mixin(this.options, opts, true);
    //this.value = this.options.value;
    
    this.setReadOnly(this.options.readonly);   
    this.setValue(this.options.value, true/*does not fire value change event.*/);
    this.setSize(this.options.size);

    this.setIncreaseText(this.options.increaseText);
    this.setDecreaseText(this.options.decreaseText);

    if (this.options.min > this.options.max) {;
      tau.log.error('min(' + (this.options.min) + ') < max('
          + (this.options.max) + ')');
      throw new Error('min(' + (this.options.min) + ') < max('
          + (this.options.max) + ')');
    }

    if (this.options.step < 0) {
      tau.log.error('step value can not be negative.');
      throw new Error('step value can not be negative.');
    }
  },

  /**
   * 텍스트필드가 읽기전용인지 체크한다. <code>true</code>이면 읽기전용이다.
   * @returns {Boolean} readOnly 읽기전용 여부
   */
  isReadOnly: function () {
    return this._readonly;
  },

  /**
   * 증가 Button 의 Text 를 변경 한다.  
   * default 는 '+'
   */
  setIncreaseText: function (text){
    if(!text || text == ''){
      throw new Error('increase text can not be empty.['+text+']');
    }
    this.renderer.setIncreaseText(this.$renderData, text);
  },
  
  /**
   * 감소 Button 의 Text 를 변경 한다.  
   * default 는 '-'
   */
  setDecreaseText: function (text){
    if(!text || text == ''){
      throw new Error('decrease text can not be empty.['+text+']');
    }
    this.renderer.setDecreaseText(this.$renderData, text);
  },
  
  /**
   * 텍스트필드에 읽기전용 여부를 설정한다.
   * @param {Boolean} readOnly <code>true</code>이면 읽기전용
   */
  setReadOnly: function (readOnly) {
    if (this._readonly !== readOnly) {
      this._readonly = readOnly;
      this.renderer.updateReadOnly(this.$renderData, readOnly);
    }
  },

  /**
   * Spinner 의 가로 크기를 설정한다.
   * @param {Number} size 0보다 큰 정수
   */
  setSize: function (size) {
    if (this._size !== size && size > 0) {
      this._size = size;
      this.renderer.updateSize(this.$renderData, size);
    }
  },

  /**
   * 현재 표시되고 있는 value 에서 Number 만 반환한다.
   * @returns {Number} value 현재값
   */
  getRawValue: function () {
    return this.value;
  },

  /**
   * 현재 표시되고 있는 value 그대로를 반환한다.
   * @returns {String} value 현재값
   */
  getValue: function () {
    return this.renderer.getValue(this.$renderData);
  },

  /**
   * 현재값을 설정 한다.
   * @param {Number} _val 설정값
   */
  setValue: function (_val, isDefaultValue) {
    if(!tau.isNumber(_val)){
      if(_val.indexOf('.') > 0){
        _val = parseFloat(_val);
      }else{
        _val = parseInt(_val);
      }
    }
    this.rollback = this.value;
    try {
      this.value = _val;
      this.accumulator = 0;
      (this._threadFactory(this, 0, isDefaultValue))();
    } catch (e) {
      throw e;
      this.setValue(this.rollback, isDefaultValue);
    } finally {
      this.accumulator = 0;
    }
  },

  /**
   * 현재값을 설정 하기전에 validate(min, max 비교) 하기 위한 function.
   * @param {Number} _val 설정값
   * @private
   */
  validate: function (_val) {
    var result;
    if (this.options.min && (this.options.min > _val)) {
      result = this.options.min;
    } else if (this.options.max && (this.options.max < _val)) {
      result = this.options.max;
    } else {
      result = _val;
    }
    this.value = result;
    return this.options.formatFn(result);
  },

  /**
   * TAP_N_HOLD Event 중, 값을 Set 하기 위한 closure 를 생성 한다.
   * @param {Object} self
   * @param {Number} acc 가속을 Simulation 하기 위한 가산값.
   * @private
   */
  _threadFactory: function (self, acc, isDefaultValue) {
    return function () {
      if (self.options.acceleration
          && self.accumulator == self._accelerationStartCount) {
        clearInterval(self.threadID);
        self.threadID = setInterval(arguments.callee,
            self._accelerationSpeed);
        acc = (acc < 0 ? -1: 1) * (self.options.step * self._accelerationRate);
      }
      
      self.renderer.updateValue(self.$renderData, self.validate(eval(self.value
          + acc)));
      if(isDefaultValue != undefined && isDefaultValue === true){
        //do nothing.
      } else {
        self.fireEvent(tau.rt.Event.VALUECHANGE, {'value':self.getRawValue(), 'step':acc});
      }
      self.accumulator++;
    };
  },

  /**
   * touchStart 이벤트 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체
   * @private
   */
  handleTouchStart: function (e, payload) {
    var target = e.touches[0].target, 
    hit = this.renderer.getElemPropertyName(this.$renderData, target);
    this.accumulator = 0;
    switch (hit) {
    case tau.ui.Spinner.INCREASE_KEY:
      var thread = this._threadFactory(this, this.options.step);
      this.threadID = setInterval(thread, this._normalSpeed);
      break;
    case tau.ui.Spinner.DECREASE_KEY:
      var thread = this._threadFactory(this, -(this.options.step));
      this.threadID = setInterval(thread, this._normalSpeed);
      break;
    case tau.ui.Spinner.VALUE_KEY:
      // do nothing.
      break;
    default:
      tau.log.debug('Spinner handle Touch start default case.');
      break;
    }

  },

  /**
   * touchEnd 이벤트 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체
   * @private
   */
  handleTouchEnd: function (e, payload) {
    if (this.threadID) {
      clearInterval(this.threadID);
      this.accumulator = 0;
    }
  },

  /**
   * tap 이벤트 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체
   * @private
   */
  handleTap: function (e, payload) {
    var target = e.touches[0].target, hit = this.renderer
        .getElemPropertyName(this.$renderData, target);
    var increaseFn = this._threadFactory(this, this.options.step);
    var decreaseFn = this._threadFactory(this, -(this.options.step));
    switch (hit) {
    case tau.ui.Spinner.INCREASE_KEY:
      increaseFn();
      break;
    case tau.ui.Spinner.DECREASE_KEY:
      decreaseFn();
      break;
    case tau.ui.Spinner.VALUE_KEY:
      // do nothing.
      break;
    default:
      tau.log.debug('Spinner handle Tap default case.');
      break;
    }
  },

  /**
   * blur 이벤트 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체
   * @private
   */
  handleBlur: function (e, payload) {
    var v = this.$renderData.$dom[tau.ui.Spinner.VALUE_KEY].value;
    try {
      v = v.replace(/[^0-9\.]+/g, '');
      
      this.setValue(v);
    } catch (e) {
      this.setValue(this.value);
    }
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.Picker */
$class('tau.ui.Picker').extend(tau.ui.Component).mixin(tau.ui.Control).define({
  size: 0,
  $static: {
    SLOT_CONTAINER: 'slot_container',
    HEADER: 'header',
    CANCEL_BUTTON: 'cancel_button',
    DONE_BUTTON: 'done_button',
    EVENT_CANCEL_TAP: 'event_cancel',
    EVENT_DONE_TAP: 'event_done',
    EVENT_VALUE_CHANGED: 'value_changed',
    TYPE_SLOT: 'type_slot',
    TYPE_SEPARATOR: 'type_separator'
  },
  
  /**
   * 생성자, 새로운 Picker객체를 생성한다.
   * @class Picker 는 확정된 값(list) 를 선택 할 수 있도록 작성된 Class 이다.
   * @example // var pickerObj = new tau.ui.Picker();
   * @constructs
   * @extends tau.ui.Component
   * @mixins tau.ui.Control
   * @param {Object} [opts] Picker 옵션
   * @see tau.ui.Component 옵션을 상속받고 있음
   */
  Picker: function (opts) {
    var id = this.getId(true);
    this.renderer.slots_refer[id] = [];
    this.renderer.pickers[id] = this;

    this._done = new tau.ui.Button({
      label:'Done',
      parent:this, 
      bubble:this,
    });
    this._done.onEvent(tau.rt.Event.TAP, this._defaultDoneAction, this);
    tau.util.dom.addClass(this._done.getDOM(), 'tau-picker-done');
    
    this._cancel = new tau.ui.Button({
      label: 'Cancel',
      parent:this, 
      bubble:this,
    });
    this._cancel.onEvent(tau.rt.Event.TAP, this._defaultCancelAction, this);

    tau.util.dom.addClass(this._cancel.getDOM(), 'tau-picker-cancel');
    
    this.swContainer = this.$renderData.$dom[tau.ui.Picker.SLOT_CONTAINER];
    
    this.onEvent(tau.rt.Event.COMPDRAWN, function (e, payload) {
      e.alwaysBubble();
      if (e.getSource() === this) {
        tau.getRuntime().onEvent(tau.rt.Event.ORIENTATION, this.handleOrientationChange, this);
      }
    }, this);
  },
  
  render: function(){
    this._done.draw(this.renderer.getHeaderElement(this.$renderData));
    this._cancel.draw(this.renderer.getHeaderElement(this.$renderData));
  },
  
  getDoneButton: function(){
    return this._done;
  },
  
  getCancelButton: function(){
    return this._cancel;
  },
  /**
   * 추가된 Slot 을 remove 하는 function. 
   * @param index {Number} Slot 을 add 할때 반환된 Slot Index 값 
   */
  removeSlot: function (index) {
    this.size--;
    this.renderer.removeSlot(this.getId(true), this.$renderData, index);
  },
  
  /**
   * 생성된 Picker 에 Slot 을 Add 한다.
   * <pre>
   * 사용 가능한 option.
   * begin {Number}: data 를 명시하지 않고, begin property 로 시작 값을 설정 한다. end property 와 함께 설정 되어야 유효 하다.
   * end {Number}: data 를 명시하지 않고, begin property 로 마지막 값을 설정 한다. begin property 와 함께 설정 되어야 유효 하다.
   * highlight {Number | Array of Number}: 특정 item 을 highlight 표시 한다.
   * disabled {Number | Array of Number}: 특정 item 을 disabled 처리 한다.
   * prefix {String}: 모든 item 의 text 에 대해서 prefix 를 append 한다.(value 에는 반영되지 않음.)
   * postfix {String}: 모든 item 의 text 에 대해서 postfix 를 append 한다.(value 에는 반영되지 않음.)
   * </pre>
   * @example pickerObj.addSlot(['JavaScript', 'HTML', 'CSS', 'DOM', 'BOM']);
   * pickerObject.addSlot({name:value, name1:value1, name2:value2});
   * pickerObject.addSlot(null, {begin:1, end:12, highlight:[0,2,5], diabled:6, prefix:'[', postfix:']월'});
   * @param data {Array | Object | null}
   * @param options {Object} add slot option.
   * @returns {Number} 추가된 Slot 의 Index.
   */
  addSlot: function (data, options) {
    this.size++;
    return this.renderer.addSlot(this.getId(true), this.$renderData, data, options, this._handleWebkitTransitionEnd());
  },
  
  /**
   * 여러개의 Slot 을 한꺼번에 추가 한다.
   * @example pickerObj.addSlots([
   *  {data:['JavaScript', 'HTML', 'CSS', 'DOM', 'BOM']},
   *  {data:{name:value, name1:value1, name2:value2}},
   *  {data:null, options:{begin:1, end:12}}
   * ]);
   * @param slots {Array}
   * @returns {Array of Number} 추가된 Slot 들의 Indexes.
   */
  addSlots: function (slots) {
    var slotIndexes = [];
    for (var i in slots) {
     slotIndexes.push(this.addSlot(slots[i].data, slots[i].options));
    }
    return slotIndexes;
  },
  
  /**
   * picker 가 화면에 표시 되고 있는지 여부를 반환한다. 
   * @returns {boolean}
   */
  isOpened: function () {
    return this.renderer.isOpened(this.getId(true));
  },
  
  /**
   * 추가된 slot 의 item 을 선택 할 수 없게 설정 한다.
   * @param slotIndex {Number}
   * @param startIndex {Number} 시작 index
   * @param count {Number} 설정 할 개수
   */
  setDisabledItem: function (slotIndex, startIndex, count) {
    this.renderer.setDisabledItem(this.getId(true),slotIndex, startIndex, count);
  },
  
  /**
   * 추가된 slot 의 item 을 선택 할 수 있게 설정 한다.
   * @param slotIndex {Number}
   * @param startIndex {Number} 시작 index
   * @param count {Number} 설정 할 개수
   */
  setEnabledItem: function (slotIndex, startIndex, count) {
    this.renderer.setEnabledItem(this.getId(true),slotIndex, startIndex, count);
  },
  
  /**
   * 생성된 Picker 에 Separator 을 Add 한다.
   * @param placeHolder {String} Separator 에 고정될 문자열값.
   * @returns
   */
  addSeparator: function (placeHolder) {
    this.size++;
    return this.renderer.addSeparator(this.getId(true), this.$renderData, placeHolder);
  },
  /**
   * cancel Event Handler 가 정의되면 override 될 private 함수
   * @private
   */
  _defaultCancelAction: function () {
    this.close();
  },
  /**
   * done Event Handler 가 정의되면 override 될 private 함수
   * @private
   */
  _defaultDoneAction: function () {
    this.close();
  },
  /**
   * 생성된 Picker 를 화면에 표시한다.
   */
  open: function () {
    this.renderer.open(this.getId(true), this.$renderData);
  },
  /**
   * 화면에 표시 되고 있는 Picker 를 내린다.
   */
  close: function () {
    this.renderer.close(this.getId(true), this.$renderData);
  },
  /**
   * 현재 선택된 값(Array of String)을 반환 한다.
   * 화면에 표시되는 Picker Slot 의 값과 다를수 있다.(name != value)
   * @returns [Array]
   */
  getValues: function () {
    return this.renderer.getValues(this.getId(true));
  },
  /**
   * 현재 화면에 표시되는 값(Array of String)을 반환 한다.
   * @returns [Array]
   */
  getTexts: function () {
    return this.renderer.getTexts(this.getId(true));
  },
  /**
   * 특정 Slot 의 선택을 변경 한다.
   * @param slotIndex {Number} 변경 할 Slot 의 Index(addSlot 함수의 반환값).
   * @param itemIndex {Number} 변경 할 Item 의 Index
   * @param ignoreCallBack {Boolean} EVENT_VALUE_CHANGED 의 handler 가 정의 되어있을 경우 , 무시 할 수 있도록 설정 한다.
   */
  spinTo: function (slotIndex, itemIndex) {
    this.renderer.spinTo(this.getId(true), slotIndex, itemIndex);
  },
  
  /**
   * 기기의 orientation 이 변경 되었을때 Picker 의 Layout 및 위치를 변경 한다.
   * @param e
   * @param payload
   * @private
   */
  handleOrientationChange: function (e, payload) {
    this.renderer.updatePosition(this.getId(true), this.$renderData);
  },
  
  /**
   * 이벤트 {@link tau.rt.Event.TAP} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see {tau.ui.Component.handleTap}
   * @private
   */
  handleTap: function (e, payload) {
    var src = e.getSource();

    if (src == this._done || src == this._cancel) {
      return;
    }
    var target = e.touches[0].target, hit = this.renderer
        .getElemPropertyName(this.$renderData, target);
    if(hit == tau.ui.Picker.HEADER){
      return;
    }

    this.renderer.jump(this.getId(true), e);  
  },
  /**
   * 이벤트 {@link tau.rt.Event.TOUCHSTART} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see tau.ui.Component.handleTouchStart
   * @private
   */
  handleTouchStart: function (e, payload) {
    var target = e.touches[0].target, 
      hit = this.renderer.getElemPropertyName(this.$renderData, target), 
      src = e.getSource();

    if (hit != tau.ui.Picker.HEADER && src != this._done && src != this._cancel) {
      this.renderer.startSpinning(this.getId(true), e);
    }
  },
  /**
   * 이벤트 {@link tau.rt.Event.TOUCHMOVE} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see {tau.ui.Component.handleTouchMove}
   * @private
   */
  handleTouchMove: function (e, payload) {
    var target = e.touches[0].target, 
      hit = this.renderer.getElemPropertyName(this.$renderData, target), 
      src = e.getSource();

    if (hit != tau.ui.Picker.HEADER && src != this._done && src != this._cancel) {
      this.renderer.spin(this.getId(true), e);
    }
  },
  /**
   * 이벤트 {@link tau.rt.Event.TOUCHEND} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see {tau.ui.Component.handleTouchEnd}
   * @private
   */
  handleTouchEnd: function (e, payload) {
    try{
        this.renderer.endSpinning(this.getId(true), e);
    }catch(ex){}
  },
  
  _handleWebkitTransitionEnd : function() {
    var self = this;    
    return function (e, slot){
      if(e != null){
        slot = e.target == undefined ? e : e.target;
      }
      var selectedIndex = self.renderer.getSelectedIndex(slot);
      var slotIndex = self.renderer.getSlotIndex(self.getId(true), slot);
      slot.memoryPosition = slot.memoryPosition == undefined ? 0 : slot.memoryPosition;
  
      var validItemPosition = self.renderer.validateItemPosition(slot, selectedIndex);
      
      if (selectedIndex != validItemPosition) {
        setTimeout(function() {
          self.renderer.scrollTo(slot, -(validItemPosition * self.renderer.cellHeight), "100ms");
        }, 150);
      } else {
        if (slot.memoryPosition == selectedIndex) {// 값 변경이 없었다면 그냥 return;
          return;
        }
        slot.memoryPosition = validItemPosition;
        self.fireEvent(tau.rt.Event.VALUECHANGE, {'slotIndex': slotIndex, 'values': self.getValues(), 'texts': self.getTexts()});
      }
    };
  },
  
  /**
   * 리소스를 destory한다.
   * @see tau.ui.Component.destory
   */
  destroy: function () { 
    delete this.renderer.pickers[this.getId()];
    tau.getRuntime().unsubscribeEvent(tau.rt.Event.ORIENTATION, this.handleOrientationChange, this);
    return tau.ui.Picker.$super.destroy.apply(this, arguments);
  }
});


//------------------------------------------------------------------------------
/** @lends tau.ui.DatePicker */
$class('tau.ui.DatePicker').extend(tau.ui.Picker).mixin(tau.ui.Control).define({
  now: new Date(),
  LOCALE: null,
  hourMemory: -1,
  todayIndex: 0,
  MINUTE_STEP: 5,
  $static: {
    DATETIME: 'datetime',
    DATE_ONLY: 'date_only',
    TIME_ONLY: 'time_only',
    MONTH_BEGIN: 1,
    MONTH_END: 12,
    DATE_BEGIN: 1,
    DATE_END: 31,
    SUPPORTED_LOCALE: {
      /* dateformat
       * Y: Full Year (2010)
       * M: Month in Integer (11)
       * D: Day in Integer (31)
       * MM: Month in Short String (Jan)
       * MMM: Month in Full String (January)
       * ':': separator
       */
      KOREAN: {
        id:'ko',
        dateFormat: 'Y:M:D'
     },
      US_ENG: {
        id: 'us',
        dateFormat: 'MM:D:Y'
      }
    },
    DAYS: {
      ko: ['일', '월', '화', '수', '목', '금', '토'],
      us: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    }, 
    AMPM: {
      ko: {AM: '오전', PM: '오후'},
      us: {AM: 'AM', PM: 'PM'}
    },
    YEAR: {
      ko: '년',
      us: 'Year'
    },
    MONTH: {
      ko: '월',
      us: {
        shorten: {1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'},
        fully: {1: 'January', 2: 'February', 3: 'March', 4: 'April', 5: 'May', 6: 'June', 7: 'July', 8: 'August', 9: 'September', 10: 'October', 11: 'November', 12: 'December'}          
      }
    },
    DAY: {
      ko: '일'
    },
    TODAY:{
      ko: '오늘',
      us: 'Today'
    }
  },
  
  /**
   * 생성자, 새로운 DatePicker객체를 생성한다.
   * @class DatePicker는 날짜 및 시간을 선택 할 수 있도록 Picker Component 를 확장 한 Class 이다.
   * @example var datePickerObj = new tau.ui.DatePicker(tau.ui.DatePicker.DATETIME, {});
   * @constructs
   * @extends tau.ui.Picker
   * @mixins tau.ui.Control
   * @param {String} type DatePicker.DATETIME, DatePicker.DATE_ONLY, DatePicker.TIME_ONLY
   * @param {Object} [opts] DatePicker 옵션
   * @param {String} [opts.locale] locale 을 명시 할 필요가 있을때 사용 한다. 명시 하지 않았을 경우 browser 기본값 사용. 
   * @see tau.ui.Picker 옵션을 상속받고 있음 
   */
  DatePicker: function (type, opts) {
    this.type = type;    
    this.LOCALE = opts && opts.locale ? opts.locale : this._getClientLocale();
           
    if (!this._validateSupportedLocale(this.LOCALE)) {
      tau.log.error('Does not support locale '+(this.LOCALE));
      this.LOCALE = tau.ui.DatePicker.SUPPORTED_LOCALE.KOREAN.id;
    }
    
    switch (this.type) {
    case tau.ui.DatePicker.DATE_ONLY:
      this._setDateSlots(type, opts);
      break;
    case tau.ui.DatePicker.DATETIME:
      this._setDateSlots(type, opts);
      this._setTimeSlots(type, opts);
      break;
    case tau.ui.DatePicker.TIME_ONLY:
      this._setTimeSlots(type, opts);
      break;
    default:
      throw new Error('undefined Picker Type:['+type+'].');
          break;
    }            
  },
  
  /**
   * 현재 client 의 locale(accept language) 를 반환 한다.
   * @private
   */
  _getClientLocale: function () {
    var locale = tau.ui.DatePicker.SUPPORTED_LOCALE.KOREAN.id;
    if (navigator ) {
      if (navigator.language ) {
          locale = navigator.language;
      }
      else if (navigator.browserLanguage ) {
          locale =  navigator.browserLanguage;
      }
      else if (navigator.systemLanguage ) {
          locale =  navigator.systemLanguage;
      }
      else if (navigator.userLanguage ) {
          locale =  navigator.userLanguage;
      }
      
      if (locale.indexOf('-') > -1) {
        locale = locale.substring(0, locale.indexOf('-'));
      }
    }else{
      tau.log.error('navigator object not defined.');
    }
    return locale;
  },
    
  /**
   * 지원 가능한 locale 인지 검사 한다.
   * @param locale
   * @returns {Boolean} 지원가능한 locale 일 경우 <code>true</code>
   * @private
   */
  _validateSupportedLocale: function (locale) {
    for (var i in tau.ui.DatePicker.SUPPORTED_LOCALE) {
      if (tau.ui.DatePicker.SUPPORTED_LOCALE[i].id == locale) {
         return true;
      }
    }
    return false;
  },
  
  /**
  * 현재 날짜, 시간으로 slot 을 이동 한다.
  */
  moveToNow: function () {
    var nowLocal = new Date();
    var hour = nowLocal.getHours();
    switch (this.type) {
    case tau.ui.DatePicker.DATE_ONLY:
      var thisMonth = nowLocal.getMonth();
      var toDay = nowLocal.getDate();
      var thisYear = nowLocal.getFullYear();
      switch (this.LOCALE) {
      case tau.ui.DatePicker.SUPPORTED_LOCALE.KOREAN.id:
        this.spinTo(0, 0);
        this.spinTo(1, thisMonth);
        this.spinTo(2, toDay -1);
        break;
      case tau.ui.DatePicker.SUPPORTED_LOCALE.US_ENG.id:
        this.spinTo(0, thisMonth);
        this.spinTo(1, toDay -1);
        
        var yearIndex = 0;
        for(var i=this.minimumYear; i<this.maximumYear; i++,yearIndex++){
          if(i == thisYear){
            break;
          }
        }
        
        this.spinTo(2, yearIndex);
        break;
      }         
      break;
    case tau.ui.DatePicker.DATETIME:
      this.spinTo(0, this.todayIndex);
      this.spinTo(1, hour > 11 ? 1 : 0);
      this.spinTo(2, (hour > 11 ? hour  - 12 : hour) - 1);
      this.spinTo(3, parseInt(nowLocal.getMinutes() / this.MINUTE_STEP));
      break;
    case tau.ui.DatePicker.TIME_ONLY:
      this.spinTo(0, hour > 11 ? 1 : 0);
      this.spinTo(1, (hour > 11 ? hour  - 12 : hour) - 1);
      this.spinTo(2, parseInt(nowLocal.getMinutes() / this.MINUTE_STEP));
      break;
    default:
      throw new Error('undefined Picker Type:['+type+'].');
      break;
    }        
  },
  
  /**
   * 입력받은 년, 월의 최대 날짜(2011년02월을 입력 한 경우, 28)를 반환 한다.
   *
   * @param year
   * @param month 0~11
   * 
   * @returns {Number}
   * @private
   */
  _getDaysOfMonth: function (year, month) {
    return 32 - new Date(year, month, 32).getDate();
  },
  
  /**
   * Picker 에 날짜 형식 Slot, Separator 를 추가 한다.
   * locale 에 따라 변경된다.
   * @param type
   * @param opts
   * @private
   */
  _setDateSlots: function (type, opts) {
    var self = this;
    opts = opts ? opts : {};  
    
    var minimumDate = opts.minimum && tau.isDate(opts.minimum) ? opts.minimum : new Date();
    var maximumDate = opts.maximum && tau.isDate(opts.maximum) ? opts.maximum : new Date();                   
   
    if (!(opts.minimum && tau.isDate(opts.minimum)) && !(opts.maximum && tau.isDate(opts.maximum))) {           
      minimumDate.setDate(-182);
      maximumDate.setTime(minimumDate.getTime() + ((365) * 60 * 60 * 24 * 1000));
    }else{
      if (minimumDate.getTime() > maximumDate.getTime()) {
        throw new Error('minimum date > maximum date');
      }
    }    

    this.minimumYear = minimumDate.getFullYear();
    this.maximumYear = maximumDate.getFullYear();
    
    if (type == tau.ui.DatePicker.DATETIME) {                    
      var datesOfYear = {};
      var tmpDate = new Date();
      var highlightIndex = null;
      for (var i=minimumDate.getTime(), index=0; i<maximumDate.getTime(); index++, i=(i+(60*60*24*1000))) {
        tmpDate.setTime(i);           
        if ((tmpDate.getFullYear() == this.now.getFullYear()) && (tmpDate.getMonth() == this.now.getMonth()) && (tmpDate.getDate() == this.now.getDate())) {            
          this.todayIndex = index;
          highlightIndex = i;
        }
        datesOfYear[tmpDate.getTime()] = this._formatDate(tmpDate);            
      }
      
      this.addSlot(datesOfYear, {highlight: highlightIndex});
    }else{// if date only.
      var todayInt = (this.now.getFullYear() * 10000) + (this.now.getMonth() * 100) + this.now.getDate();
      var mindayInt = (minimumDate.getFullYear() * 10000) + (minimumDate.getMonth() * 100) + minimumDate.getDate();
      var maxdayInt = (maximumDate.getFullYear() * 10000) + (maximumDate.getMonth() * 100) + maximumDate.getDate();
      
      var showToday = todayInt >= mindayInt && todayInt <= maxdayInt;
      
      var monthSlotIndex = -1;
      var daySlotIndex = -1;
      var yearSlotIndex = -1;
      
      var yearOpts = {
          begin:minimumDate.getFullYear(), 
          end:maximumDate.getFullYear(),
          highlight: showToday ? this.now.getFullYear() : null 
      };
      var monthOpts = {
          begin:minimumDate.getFullYear() == maximumDate.getFullYear() ? minimumDate.getMonth() + 1 : tau.ui.DatePicker.MONTH_BEGIN,
          end:minimumDate.getFullYear() == maximumDate.getFullYear() ? maximumDate.getMonth() + 1 : tau.ui.DatePicker.MONTH_END,
          highlight: showToday ? this.now.getMonth()+1 : null
      };
      var dayOpts = {
          begin:minimumDate.getFullYear() == maximumDate.getFullYear() && minimumDate.getMonth() == maximumDate.getMonth() ? minimumDate.getDate() : tau.ui.DatePicker.DATE_BEGIN,
          end:minimumDate.getFullYear() == maximumDate.getFullYear() && minimumDate.getMonth() == maximumDate.getMonth()  ? maximumDate.getDate() : tau.ui.DatePicker.DATE_END,
          highlight: showToday ? this.now.getDate() : null
      };
      switch (this.LOCALE) {
      case tau.ui.DatePicker.SUPPORTED_LOCALE.KOREAN.id:
          yearOpts.postfix = tau.ui.DatePicker.YEAR[this.LOCALE];
          monthOpts.postfix = tau.ui.DatePicker.MONTH[this.LOCALE];
          yearSlotIndex = this.addSlot(null, yearOpts);
          monthSlotIndex = this.addSlot(null, monthOpts);
          daySlotIndex = this.addSlot(null, dayOpts);
        break;
      case tau.ui.DatePicker.SUPPORTED_LOCALE.US_ENG.id:
        var months = tau.ui.DatePicker.MONTH[this.LOCALE].fully;
        if (minimumDate.getFullYear() == maximumDate.getFullYear()) {
          for (var i in months) {
            if (monthOpts.begin > i || monthOpts.end < i) {
              delete months[i];
            }
          }
        }
        delete monthOpts.begin;
        delete monthOpts.end;

        monthSlotIndex = this.addSlot(months, monthOpts);
        daySlotIndex = this.addSlot(null, dayOpts);
        yearSlotIndex = this.addSlot(null, yearOpts);
        break;
      }
      this.onEvent(tau.rt.Event.VALUECHANGE, function (e, payload) {
        if(!payload || !payload.slotIndex, !payload.values){
          return;
        }
        var values = payload.values, slotIndex = payload.slotIndex;
        if (slotIndex != daySlotIndex) {
          var year = values[yearSlotIndex];
          var month = values[monthSlotIndex];
          var daysOfMonth = self._getDaysOfMonth(year, month-1);
          self.setEnabledItem(daySlotIndex, 0, daysOfMonth);
          self.setDisabledItem(daySlotIndex, daysOfMonth, tau.ui.DatePicker.DATE_END - daysOfMonth);
          }
      });
    }
   },
   
   /**
    * DATETIME type 일 경우, 하나의 Slot 에 날짜를 표시 하기 위한 String 을 생성 한다.
    * locale 에 따라 변경 된다.
    * @param date
    * @returns {String}
    * @private
    */
  _formatDate: function (date) {
    switch (this.LOCALE) {
    case tau.ui.DatePicker.SUPPORTED_LOCALE.KOREAN.id:
      return (date.getMonth() + 1) + (tau.ui.DatePicker.MONTH[this.LOCALE]) + 
        date.getDate() + (tau.ui.DatePicker.DAY[this.LOCALE] + ' ') + 
        '<label class=tau-datepicker-slot-item-day>'+ 
        tau.ui.DatePicker.DAYS[this.LOCALE][date.getDay()]+'</label>';          
    case tau.ui.DatePicker.SUPPORTED_LOCALE.US_ENG.id:
      return ('<label class=\'tau-datepicker-slot-item-day\'>'+ 
          tau.ui.DatePicker.DAYS[this.LOCALE][date.getDay()]+ 
          '</label> ')+(tau.ui.DatePicker.MONTH[this.LOCALE].shorten[date.getMonth()+1]) + ' ' + date.getDate();                  
    default:
      return (date.getMonth() + 1) + (tau.ui.DatePicker.MONTH[this.LOCALE]) + 
        date.getDate() + (tau.ui.DatePicker.DAY[this.LOCALE] + ' ') + 
        '<label class=tau-datepicker-slot-item-day>'+ 
        tau.ui.DatePicker.DAYS[this.LOCALE][date.getDay()]+'</label>';
    }
  },
  
  /**
   * Picker 에 시간 형식 Slot, Separator 를 추가 한다.
   * @param type
   * @param opts
   * @private
   */
  _setTimeSlots: function (type, opts) {
    this.addSlot({
      am: '<label class=\'tau-datepicker-slot-item-ampm\'>' + tau.ui.DatePicker.AMPM[this.LOCALE]['AM'] + '</label>', 
      pm: '<label class=\'tau-datepicker-slot-item-ampm\'>' + tau.ui.DatePicker.AMPM[this.LOCALE]['PM'] + '</label>'
    }, null);
    this.addSlot(null, {begin:1, end:12});
    this.addSlot(null, {begin:0, end:59, step:this.MINUTE_STEP});
  
    var ampmSlotIndex = this.type == tau.ui.DatePicker.DATETIME ? 1 : 0;
    var hourSlotIndex = this.type == tau.ui.DatePicker.DATETIME ? 2 : 1;
    var self = this;
    this.onEvent(tau.rt.Event.VALUECHANGE, function (e, payload) {
      if(!payload || !payload.slotIndex|| !payload.values){
        return;
      }
      var values = payload.values, slotIndex = payload.slotIndex;
      if (slotIndex != hourSlotIndex) {
        return;
      }
      if (self.hourMemory != 12 && values[hourSlotIndex] == 12) {
        self.spinTo(ampmSlotIndex, 1, true);
        
      }else if (self.hourMemory == 12 && values[hourSlotIndex] != 12) {
        self.spinTo(ampmSlotIndex, 0, true);
        
      }
      self.hourMemory = values[hourSlotIndex];
    });
  },
  
  /**
   * 현재 선택된 날짜(시간) 값을 javascript Date Object 로 반환 한다.
   * @returns {Date}
   */
  getDate: function () {
    var toReturn = new Date();
    var values = this.getValues();
    
    switch (this.type) {
      case tau.ui.DatePicker.DATETIME:
        toReturn.setTime(parseInt(values[0]));
        toReturn.setHours(this._getHour(values[2], values[1]), parseInt(values[3]), 0, 0);
        break;
      case tau.ui.DatePicker.DATE_ONLY:
        switch (this.LOCALE) {
        case tau.ui.DatePicker.SUPPORTED_LOCALE.KOREAN.id:
          toReturn.setFullYear(values[0]);
          toReturn.setMonth(values[1]-1);
          toReturn.setDate(values[2]);
          break;
        case tau.ui.DatePicker.SUPPORTED_LOCALE.US_ENG.id:
          toReturn.setMonth(values[0]-1);
          toReturn.setDate(values[1]);
          toReturn.setFullYear(values[2]);
          break;
        }         
        toReturn.setHours(0,0,0);
        break;
      case tau.ui.DatePicker.TIME_ONLY:
        toReturn.setTime(0);
        toReturn.setHours(this._getHour(values[1], values[0]), parseInt(values[2]), 0, 0);
        break;
    }
    
    return toReturn;
  },
  
  /**
   * 오전/오후가 적용된 시간값을 계산 해서 반환 한다.
   * @param hour
   * @param ampm
   * @returns {Number} Hour
   */
  _getHour: function (hour, ampm) {
      hour = parseInt(hour);
      if (ampm == 'am') {
        if (hour == 12) {
          return 0;
        }else{
          return hour;
        }
      }else{
        if (hour == 12) {
          return hour;
        }else{
          return hour + 12;
        }
      }
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.Mask */
$class('tau.ui.Mask').extend(tau.ui.Component).define({
  
  /**
   * 생성자, 새로운 Mask객체를 생성한다.
   * 
   * @class Mask는 주로 {@link tau.ui.Container} 컴포넌트에서 배경을 mask하기 위해 사용된다.
   * @constructs
   * @extends tau.rt.EventDelegator
   * @mixins tau.ui.Drawable
   */
  Mask: function () {
    
    this._fullscreen = true;
    
    this.$optionize = tau.mixin(this.$optionize, {
      handler: { /** @lends tau.ui.Mask */
        /**
         * fullscreen 설정
         */
        fullscreen: function (prop, val) {
          if (!tau.isBoolean(val)) {
            throw new TypeError(prop.concat(' option is not Boolean: ', val, this.currentStack()));
          }
          this._fullscreen = val;
        }
      }
    }, 'remix');
  },

  /**
   * 컴포넌트를 draw한다.
   * @overrides tau.ui.Drawable.prototype.draw
   * @param {HTMLElement} parent 컨텐츠를 렌더링할 부모 DOM element
   * @param {Boolean} [refresh=false] <code>true</code>일 경우 화면을 refresh한다.
   * @param {HTMLElement} [refChild]컨텐츠를 렌더링할 이전 Child DOM element
   * @returns {Boolean} 실제 컨텐츠가 이 메소드에 의해 draw 되었다면 <code>true</code>.
   * @see tau.ui.Component.draw
   */
  draw: function (parent, refresh, refChild) {
    if (this._fullscreen) {
      parent = this.getScene().getDOM();
      this.renderer.updateFullscreen(this.$renderData, true);
    }
    return tau.ui.Mask.$super.draw.call(this, parent, refresh, refChild);
  },
  
  /**
   * 이벤트 {@link tau.rt.Event.TOUCHMOVE} 처리 함수
   * @param {tau.rt.Event} e Event 인스턴스
   * @param {Object} [payload] propagation동안 전송할 수 있는 payload 객체 
   * @see {tau.ui.Component.handleTouchMove}
   * @private
   */
  handleTouchMove: function (e, payload) {
    e.preventDefault();
    e.stopPropagation();
  }
});