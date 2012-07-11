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
/** @lends tau.ui.Controller.prototype */
$class('tau.ui.Controller').extend(tau.rt.EventDelegator).define({
  /**
   * 생성자, 주어진 Scene객체를 이용하여 Controller객체를 생성한다.
   * 
   * @class
   * 컨트롤러는 {@link tau.ui.Controller.doStart}, 
   * {@link tau.ui.Controller.doDestory} 메소드들을 통해
   * Scene의 Lifecycle을 관리한다.
   * @constructs
   * @extends tau.rt.EventDelegator
   * @param {Object} [opts] 컨트롤러 생성자 옵션, Optionize를
   * 통해 초기 값을 설정할 수 있다.
   * @property {Boolean} $isStarted  Controller의 Lifecycle이 시작되었는지
   * 상태를 저장한다.
   */
  Controller: function (opts) {//$ tau.ui.Controller
    /** @private Delegators attached to this instance that needs hit testing */
    this.$subDelegators = [];
    /** @private Controller options */
    //this.$opts = {}; // obsolete
    //return this;
  },

  /**
   * Framework 레벨 함수로써 Controller의 Lifecycle을 시작한다.
   * Lifecycle이 시작될 때 init메소드를 호출하여 Controller의
   * 초기화 작업을 진행 될 수 있도록 한다.
   * 이미 Lifecycle이 시작된 Controller는 더이상 initialize작업을
   * 수행하지 않는다<p/>
   * 
   * Controller의 Lifecycle이 시작되었는지 확인을 위해서는
   * 현재 인스턴스의 $isStarted property 값을 확인하면
   * 된다.<p/>
   */
  doStart: function () {
    if (!this.$isStarted) {
      this.init();
      this.$isStarted = true;
    }
  },
  
  /**
   * Framework 레벨 함수로써 Controller의 Lifecycle을 종료하고
   * 사용중인 모든 리소스들을 해제한다.
   * 이때 내부적으로 destory 메소드가 호출된다.
   */
  doDestroy: function () {
    try {
      if (this.$subDelegators) {
        for(var i=0, len = this.$subDelegators.length; i < len; i++) {
          this.$subDelegators[i].destroy();
        }
      }
      this.destroy();
    } finally {
      this.unsubscribeEvent();
      this.removeBubble();
      this.$isStarted = false;
      this.$subDelegators = [];
      this.$parent = null;
    }
  },
  
  /**
   * 파라미터로 받은 parent Controller를 현재 Controller의 부모
   * Controller로 설정함으로써 Controller의 Hierarchy를 구성한다. </p>
   * 주어진 Controller가 부모 Controller로 설정되면 Event Bubbling관계도
   * 같이 설정되어 자식 Controller에서 발생된 이벤트는 부모
   * Controller에서도 처리가 가능해진다.
   * @param {tau.ui.Controller} parent 부모 Controller 객체
   * @throws {TypeError} 명시된 파라미터가 tau.ui.Controller의 객체가 아닐 경우
   */
  setParent: function (parent) {
    if (!parent instanceof tau.ui.Controller) {
      throw new TypeError(parent + ' is not an instance of tau.ui.Controller: '
          + this.currentStack());
    }
    this.$parent = parent;
    if (parent) {
      this.setBubble(parent);
    }
  },

  /**
   * 컨트롤러의 부모 컨트롤러를 반환한다.
   * @returns {tau.ui.Controller} 부모 컨트롤러 
   */
  getParent: function () {
    return this.$parent;
  },

  /**
   * 컨트롤러의 제목을 반환한다. 설정되지 않은 경우 클래스명을 사용한다.
   * @returns {String} 컨트롤러의 제목, 설정되지 않은 경우 클래스명
   */
  getTitle: function () {
    return this.$title || this.$classname; // default title is its class name
  },

  /**
   * 컨트롤러의 제목을 설정한다.<p/>
   * 주의: {@link tau.ui.ParallelNavigator}를 통해
   * Controller를 설정할 경우 title은 반드시 클래스 생성자에서
   * 설정되어야 한다. 그렇지 않을 경우 Active 탭이 아닌
   * 탭의 Controller는 Lifecycle이 시작되지 않은
   * 상태이므로 title이 출력되지 않는 현상이 발생된다.
   * @param {String} title 컨트롤러 제목
   * @returns {Boolean} 제목이 정상적으로 설정된 경우 true
   */
  setTitle: function (title) {
    if (tau.isString(title)) {
      this.$title = title;
      return true;
    }
    return false;
  },

  /**
   * 컨트롤러에 있는 모든 하위 {@link tau.rt.EventDelegator}을 반환한다. 
   * @returns {Array} 하위 EventDelegators를 앨리먼트로 가지는 배열 객체
   */
  getSubDelegators: function () {
    return this.$subDelegators;
  },
  
  /**
   * 컨트롤러의 초기화 콜백 함수
   * 초기화 수행을 하기 위해서는 오버라이드해야한다.
   */
  init: function () {
  },

  /**
   * 컨트롤러의 destroy 콜백 함수. 리소스를 클린업하기 위해 오버라이드해야한다.
   */
  destroy: function () {
  }

});


//------------------------------------------------------------------------------
/** @lends tau.ui.SceneController.prototype */
$class('tau.ui.SceneController').extend(tau.ui.Controller).define({
  /**
   * 생성자, 주어진 Scene객체 또는 Scene파일을 이용하여 객체를 생성한다.
   * @class
   * 사용자화면(scene)의 생성과 사용자로 부터의 반응을
   * 처리하기 위한 기능을 정의한다.<p/>
   * @constructs
   * @extends tau.ui.Controller
   * @param {Object} [opts] 컨트롤러 생성자 옵션
   */
  SceneController: function (opts) {//$ tau.ui.SceneController

    // Prototype(cached) initScene not defined, set to load default named scene 
    // file name on next onLoadScene. (Set only on the first contructor call)
    // Default scene url: <ctrl path> + <simple ctrl name> + '.scene.js' 
    this.$optionize = tau.mixin(this.$optionize, {
      handler: {
        /** @inner dynamic scene file loading path */
        scene: function (prop, scene) {
          if (tau.isString(scene) 
              && arguments.callee.caller !== this.loadScene) { 
            this.clearScene();
            if (scene.trim().indexOf('/') == 0) {
              this.initScene = tau.getCurrentContext().getRealPath(scene);
            } else {
              this.initScene = tau.resolveURL(scene);        
            }
            return true;
          } else {
            this.setScene(scene);
          }
        }
      }
    }, 'remix');
  },
  
  /**
   * 이벤트 Subsystem메소드를 Override한 메소드이다.
   * SceneController에서 SCENELOADED이벤트가 발생하면 SceneController에 있는 시스템
   * 메소드인 doDraw를 호출한다.<p/>
   * Scene은 Asynchronous하게 로딩되기 때문에 Scene의 로딩이 완료되기 전에 Draw가 진행
   * 되면 화면이 정상적으로 그려지지 않는다. 따라서 <code>tau.rt.Event.SCENELOADED</code>
   * 이벤트를 받은 다음 이후 과정인 Draw를 수행해야 한다.
   * @param {tau.rt.Event} e Mobello 이벤트 객체
   */
  propagateEvent: function (e) {
    switch (e.getName()) {
      case tau.rt.Event.SCENELOADED: // async call
        this.doDraw();
        break;
    }
    tau.ui.SceneController.$super.propagateEvent.apply(this, arguments);
  },
  
  /**
   * Controller Lifecycle 메소드를 Override한다. initialize 작업을 완료한 후에
   * Scene이 로딩되어 있지 않다면 Scene 로딩 작업을 수행한다. 이때 수행되는 Scene 로딩
   * 작업은 Asynchronous하게 진행된다.
   * @see tau.ui.Controller.doStart
   */
  doStart: function () {
    tau.ui.SceneController.$super.doStart.apply(this, arguments);
    this.loadScene(); // load scene asynchronously if so, it returns no delay
    var comps = this.getScene().getComponents();
    if (comps && comps.length > 0) { // user loaded scene programmatically
      this.sceneLoaded();
      this.doDraw();
    }
  },
  
  /**
   * SceneController가 소유하고 있는 Scene의 Drawing작업을 수행한다. 먼저 Drawing
   * 작업을 수행하기 전에 Scene에 정의된 컴포넌트들이 모듀 Loading되어 있어야 하며 이 작업은
   * Asynchronous하게 진행된다.<p/>
   * Drawing작업이 완려되면 <code>tau.rt.Event.SCENEDRAWN</code> 이벤트가 발생된다.
   */
  doDraw: function () {
    var parent = this.getParent();
    if (this.getScene().draw(parent.getDOM(tau.ui.CONTENT_KEY))) {
      this.sceneDrawn();
      var e = new tau.rt.Event(tau.rt.Event.SCENEDRAWN, this);
      e.alwaysBubble();
      this.fireEvent(e);
    }
  },

  /**
   * 현재 컨트롤러에 설정된 Navigation Bar를 반환한다.
   * @returns {tau.ui.NavigationBar} 현재 컨트롤러에 할당된 Navigation Bar
   */
  getNavigationBar: function () {
    if (!this.$navBar) {
      this.$navBar = new tau.ui.NavigationBar();
      this.$navBar.setTitleItem(this.getTitle());
    }
    return this.$navBar;
  },

  /**
   * 현재 컨트롤러에 Navigation Bar에 설정한다.
   * @param {tau.ui.NavigationBar} navBar Navigation Bar 객체
   * @returns {Boolean} 설정되면 true
   */
  setNavigationBar: function (navBar) {
    if (navBar instanceof tau.ui.NavigationBar) {
      // Destroy old Navigation Bar
      if (this.$navBar) {
        this.$navBar.destroy();
      }
      this.$navBar = navBar;
      return true;
    }
    return false;
  },

  /**
   * 현재 컨트롤러에 설정된 Tool Bar를 반환한다.
   * @returns {tau.ui.ToolBar} 현재 컨트롤러에 설정된 Tool Bar
   */
  getToolBar: function () {
    if (!this.$toolBar) {
      this.$toolBar = new tau.ui.Scene();
    }
    return this.$toolBar;
  },

  /**
   * 현재 컨트롤러에 Tool Bar를 설정한다.
   * @param {Object} toolBar Tool Bar 객체
   * @returns {Boolean} 설정되었다면 true
   */
  setToolBar: function (toolBar) {
    var tb = this.$toolBar;
    if (toolBar instanceof tau.ui.ToolBar) {
      // Destroy old Tool Bar
      if (tb) {
        tb.destroy();
      }
      this.$toolBar = toolBar;
      return true;
    }
    return false;
  },

  /**
   * 컨트롤러가 관리하는 scene을 반환한다.
   * @returns {tau.ui.Scene} 컨트롤러가 관리하는 scene 객체
   */
  getScene: function () {
    if (!(this.$scene instanceof tau.ui.Scene)) {
      this.setScene(new tau.ui.Scene());
    }
    return this.$scene;
  },

  /**
   * 컨트롤러에{@link tau.ui.Scene}을 설정한다.
   * @param {Object} scene 설정할 scene 객체
   * @returns {Boolean} scene이 설정되었으면 true
   */
  setScene: function (scene) {
    if (scene instanceof tau.ui.Scene && this.$scene !== scene) {
      this.clearScene();
      tau.arr(this.$subDelegators).pushUnique(scene);
      this.$scene = scene;
      return true;
    }
    return false;
  },

  /**
   * 컨트롤러에 {@link tau.ui.Scene}을 제거한다.
   */
  clearScene: function () {
    if (this.$scene) { // destroy/cleanup old scene
      tau.arr(this.$subDelegators).remove(this.$scene);
      this.$scene.destroy();
      this.$scene = null;
    }
  },

  /**
   *  Frawmework 레벨 함수로써 Controller의 모든 리소스를 삭제하고
   *  Scene을 Clear한다.
   */
  destroy: function () {
    tau.ui.SceneController.$super.destroy.apply(this, arguments);
    this.clearScene();
  },

  /**
   * <code>{@link tau.ui.SceneController}</code> 가 관리하는
   * Scene의 최상위 DOM 앨리먼트를 반환한다.
   * @returns {HTMLElement} scene을 Rendering하기 위한 HTML DOM 객체
   */
  getDOM: function () {
    return this.getScene().getDOM();
  },

  /**
   * Controller가 관리하는 Scene을 로드한다
   * 개발자가 직접 프로그래밍을 통해 Scene을 생성하기 위해서는
   * 이 메소드를 Override해서 컴포넌트를 통해 직접 화면을
   * 구성해야 한다.
   * <p/>
   * 먄약 NamingConvention에 따라 SceneController가 있는 
   * 폴더 내에 Scene파일과 CS(Compiled Scene)파일이
   * 생성되었다면 SceneController의 loadScene() 메소드를
   * 구현하지 않아도 자동으로 해당 CS파일을 로딩하여 Scene을 구성한다.
   * <p/>
   * NamingConvention에 의해 자동으로 Scene을 로딩하지 못하는
   * 경우 즉, 해당 CS파일이 다른 폴더에 있거나 아니면
   * NamingConvention이 다를 경우 SceneController의 인스턴스를
   * 생성할 때 로딩하고자 하는 CS파일을 직접 지정함으로써 편리하게
   * 해당 Scene을 로딩할 수도 있다.<p/>
   *
   * @example
   * // Programming으로 직접 Scene 생성
   * $class('sample.FooController').extend(tau.ui.SceneController).define({
   *   ...
   *
   *   loadScene: function () { // creates scene manually
   *     var label, button,
   *         scene = this.getScene();
   *     label = new tau.ui.Label({text: 'Name: '});
   *     scene.add(label);
   *     button = new tau.ui.Button({label: 'Mobello'});
   *     scene.add(button);
   *   }
   *
   *   ...
   * });
   *
   * @example
   * // Naming Convention에 의한 Scene Loading
   * // SceneController 클래스 명
   * $class('sample.FooController').extend(tau.ui.SceneController).define({
   *   ...
   * });
   *
   * // Scene파일 명
   * foo.scene
   *
   * // CS(Compiled Scene)파일 명
   * foo.scene.js
   *
   * @example
   * // 직접 CS파일을 지정하여 Scene을 Loading
   * // FooController에서 'dir'폴더에 있는 'bar.scene.js'
   * // CS파일을 로딩하여 Scene을 구성
   *
   * var ctrl = new sample.FooController({scene: '/dir/bar.scene.js'});
   */
  loadScene: function () {
    var classname, clazz, filepath,
        that = this; 
    
    function _loadScene() { //fallback method
      if  (tau.isFunction(that.initScene)) {
        that.initScene();
      }
      that.sceneLoaded();
      that.doDraw();
    }
    if (tau.isFunction(that.initScene)) {
      that.initScene(); // synchronous
    } else {
      classname = that.$classname;
      clazz = $class.forName(classname);
      filepath = clazz.$filepath;
      if (!tau.isFunction(that.initScene) 
          && !this.hasOwnProperty('initScene')) {
        clazz.prototype.initScene = 
          filepath.substring(0, filepath.lastIndexOf('/') + 1)
            + classname.substring(classname.lastIndexOf('.') + 1)
              .replace(/[Cc]ontroller$/, '').toLowerCase() + '.scene.js';
      }
      new tau.ScriptHelper({
        callbackFn: function () {
          tau.log.debug('Scene file loaded: ' + that.initScene, that);
          if (tau.isString(clazz.prototype.initScene)) {
            clazz.prototype.initScene = window.initScene;
          } else {
            that.initScene = window.initScene;
          }
          window.initScene = undefined; // delete imported initScene function
          _loadScene();
        },
        timeoutFn: function () {
          tau.log.debug('Scene file is unavailable: ' + that.initScene, that);
          _loadScene();
        }
      }).load(that.initScene);
    }
  },

  /**
   * 컨트롤러의 sceneLoaded 콜백 함수로써 생성한 Scene이
   * 최종적으로 화면에 그려지기 전에 이미 로딩된 
   * Scene에 동적인 방법으로 수정을 가하고자
   * 할 경우 이 메소드를 통해서 구현한다.
   * 
   */
  sceneLoaded: function () {
  },

  /**
   * Scene이 로딩되면 내부적으로 관련 Component의 트리가
   * 구성되며 화면에 그려진다. Scene을 구성하는 모든 컴포넌트가
   * 화면에 그려진 다음 이 메소드가 호출된다. <p/>
   * 일반적으로 화면이 모두 생성된 후 처리해야할 작업들을
   * 이 메소드를 통해서 구현한다.
   */
  sceneDrawn: function () {
  },

  /**
   * 명시된 콘트롤러(ctrl)를 이용하여 Modal화면을 생성한다.<p/>
   * Modal화면을 생성할때 다양한 옵션을 통해 Modal화면의
   * 특성을 조정할 수 있다.
   * @example
   * $class('sample.FooController').extend(tau.ui.SceneController).define({
   *   loadScene: function () {
   *     var btn = new tau.ui.Button({label: 'Show modal!'});
   *     btn.onEvent(tau.rt.Event.TAP, this.handleClick, this);
   *     this.getScene().add(btn);
   *   },
   *
   *   handleClick: function(e, payload) {
   *     var modalCtrl = new sample.ModalController();
   *     // presents modal scene
   *     this.presentModal(modalCtrl, {layout: 'FORM', 'animate': 'vertical'});
   *   }
   * });
   * @param {tau.ui.Controller} ctrl tau.ui.Controller를
   * 상속받은 클래스
   * @param {Object} [opts] Modal화면의 생성 옵션
   * @param {String} [opts.layout = 'FULL'] Modal화면의 형태를 나타내며
   * 'FULL', 'PAGE', 'FORM' 중의 하나를 사용할 수 있다. 
   * @param {String} [opts.animate = 'vertical'] Animation을
   * 통해 Modal화면이 출력되는 방향을 나타낸다. 'vertical' 또는 'horizontal'의
   * 값을 사용할 수 있다.
   */
  presentModal: function (ctrl, opts) {
    var mctrl = tau.getRuntime().getModule().getModalController();
    mctrl.present(ctrl, opts);
  },
  
  /**
   * 현재 출력되어 있는 Modal화면을 사라지게 한다. 이때
   * animated 파라미터를 이용하여 Animation을 적용여부를
   * 설정할 수 있다.<p/>
   * SceneController의 presentModal()메소드를 통해 새로운
   * Modal Scene을 생성하며 dismissModal()메소드를 통해 새로
   * 띄운 Modal Scene을 삭제하는 역할을 수행한다.
   * 만약 present된 SceneController(presentModal의 파라미터)의
   * dismissModal()메소드를 호출하면 내부적으로 ModalScene을
   * 띄운 SceneController로 Delegation되어 최상위에 있는 Modal
   * Scene을 삭제할 수 있다.
   * @example
   * $class('sample.ModalController').extend(tau.ui.SceneController).define({
   *   loadScene: function () {
   *     var btn = new tau.ui.Button({label: 'Hide modal'});
   *     btn.onEvent(tau.rt.Event.TAP, this.handleDismiss, this);
   *   },
   *
   *   handleDismiss: function (e, payload) {
   *     this.dismissModal(true); // dismiss modal scene
   *   }
   * });
   * @param {Boolean} animated true일 경우 animation을 적용하여 사라지게 한다.
   */
  dismissModal: function (animated) {
    var mctrl = tau.getRuntime().getModule().getModalController();
    mctrl.dismiss(this, animated);
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.ModalSceneController.prototype */
$class('tau.ui.ModalSceneController').extend(tau.ui.Controller).define({
  
  $static: /** @lends tau.ui.ModalSceneController */ {
    /**
     * 출력될 Modal Scene의 크기를 나타내며 화면 전체영역을
     * 차지한다.
     */
    LAYOUT_FULL: {width: '100', height: '100'},
    /**
     * 출력될 Modal Scene의 크기를 나타내며 페이지 형태로
     * 출력한다. 넓이는 768필셀이며 높이는 전체 화면의 높이가
     * 된다.
     */
    LAYOUT_PAGE: {width: 768, height: '100'}, // ipad fix, think more!
    /**
     * 츨력될 Modal Scene의 크기를 나타내며 입력폼의 형태로
     * 출력한다. 넓이는 540픽셀이며 높이는 575픽셀의 영역을
     * 차지한다.
     */
    LAYOUT_FORM: {width: 540, height: 575}, // ipad fix, think more!

    /**
     * Dim형태로 처리하기 위한 MASK DOM에 해당하는 키,
     * getDOM()메소드의 파라미터로 사용
     */
    MASK_KEY: 'tau-modal-mask'
  },
  
  /**
   * 명시된 {@link tau.rt.Module}을 이용하여 새로운 객체를 생성한다.
   * @class
   * 이 클래스는 Module 내부에서 동작하며 사용자 Application은
   * 하나의 ModalSceneController만 가질 수 있다.
   * ModalSceneController는 사용자에게 보여줄
   * SceneController를 Layer형태로 관리하며 특정시점에 하나의
   * Scene만을 화면으로 출력한다.
   * @constructs
   * @extends tau.ui.Controller
   * @param {tau.rt.Module} module 사용자 Application 객체
   * @see tau.rt.Module
   */
  ModalSceneController: function (module) {
    this._module = module;
    this._modals = []; // maintain stack of modal controllers{ctrl: XX, opts:XX}
    this._zIndex = 99993; // higher than PickerComponent(99992)
  },
  
  /**
   * Lifecycle이 시작되었을 때 초기화 작업을 수행한다. 
   */
  init: function () {
    tau.ui.ModalSceneController.$super.init.apply(this, arguments);
    if (!this._module || !(this._module instanceof tau.rt.Module)) {
      throw new ReferenceError('Invalid current module: ' 
          + this._module + this.currentStack());
    }
    var cssText, mask,
        rt = tau.getRuntime(),
        root = this._module.getDOM(),
        dom = root.getElementsByClassName('tau-modal')[0];
    this.setParent(this._module);
    rt.onEvent('orientationchange', this.handleOrientationChange, this);
    if (!dom) { // not defined, define it lazilly
      dom = document.createElement('div');
      dom.setAttribute('class', 'tau-modal');
      root.appendChild(dom);
    }

    mask = dom.getElementsByClassName(tau.ui.ModalSceneController.MASK_KEY)[0];
    if (!mask) {
      mask = document.createElement('div');
      cssText = 'display:none; top:0px; left:0px; position:fixed;'.concat(
          'width:100%; height:100%; opacity:0.6; background-color:#000000; ',
          'z-index:', this._zIndex);
      mask.style.cssText = cssText;
      tau.util.dom.addClass(mask, tau.ui.ModalSceneController.MASK_KEY);   
      dom.appendChild(mask);
    }
  },
  
  /**
   * Sub Event Delegator들을 반환한다. 이때 반환되는 Sub Event
   * Delegator는 내부적으로 관리하는 SceneController중
   * 최상위 Layer에 있는 Controller가 된다.
   * @returns {Array} 최상위 SceneController 배열(한개의
   * 앨리먼트만 가짐)
   * @see tau.ui.Controller#getSubDelegators
   */
  getSubDelegators: function () {
    var modal = this.peekModal();
    return modal ? [modal.ctrl] : [];
  },
  
  /**
   * Dispatch된 이벤트를 처리한다. 내부적으로 처리할 이벤트가
   * 없으면 상위 Event Delegator로 Bubble up 시킨다.
   * @param {tau.rt.Event} e Mobello Event object
   * @param {Object} payload 이벤트와 같이 전달되는 데이터 객체
   * @see tau.rt.EventDelegator#propagateEvent
   */
  propagateEvent: function (e, payload) {
    switch (e.getName()) {
      case tau.rt.Event.SCENEDRAWN:
        this.handleSceneDrawn(e, payload);
      default: 
        break;
    }
    tau.ui.ModalSceneController.$super.propagateEvent.apply(this, arguments);
  },
  
  /**
   * {@link tau.rt.Event.SCENEDRAWN}이벤트를 처리하는 핸들러
   * 메소드이다. 이 메소드에서 animate 옵션이 설정되어 있다면
   * 애니메이션 효과를 처리한다.
   * @param {tau.rt.Event} e {@link tau.rt.Event.SCENEDRAWN}
   * 이벤트
   * @param {Object} payload 이벤트와 같이 전달되는 데이터 객체
   */
  handleSceneDrawn: function (e, payload) {
    var current = this.peekModal();
    if (current.opts && current.opts.animate) {
      this.animate(current.opts.animate, true, tau.ctxAware(cleanup, this));
    } else {
      cleanup.call(this);
    }
    /** @private */
    function cleanup() {
      var old = this.peekModal(1); // before of current modal
      if (old) { // hides active modal scene which will be under the hood!
        old.ctrl.getDOM().style.display = 'none';
      }
    }
  },
  
  /**
   * 애니메이션 옵션이 설정되어 있다면 실제 애니메이션 효과를
   * 처리한다.<p/>
   * 마약 정의되지 않은 애니메이션 타입이 설정되었다면 
   * ReferenceError가 발생된다.
   * @param {String} type 애니메이션 타입. 'vertical' 또는 'horizontal' 
   * @param {Boolean} visible true이면 Scene이 나타나고 그렇지 않으면 사라진다.
   * @param {Function} callbackFn 애니메이션이 종료되면 호출되는 callback 함수
   * @throws {ReferenceError} 정의된 애니메이션 타입이
   * 설정되지 않았을 경우
   */
  animate: function (type, visible, callbackFn) {
    type = type.charAt(0).toUpperCase() + type.slice(1);
    var fn = this['transit'.concat(type)];
    if (fn) {
      fn.call(this, visible, callbackFn);
    } else {
      throw new ReferenceError('Can not handle animation type: ' + type);
    }
  },
  
  /**
   * ModalSceneController가 관리하고 있는 SceneControlle가
   * 있는지 확인하고 결과를 반환한다. 내부적으로 관리하는
   * SceneController가 한개 이상이 있을 경우 true를 반환한다.
   * @returns {Boolean} 만약 관리하는 SceneController가 있으면 true를 반환한다.
   */
  hasModals: function () {
    return (this._modals.length > 0);
  },
  
  /**
   * {@link tau.ui.Controller} 를 Modal Controller로 설정한다.
   * 만약 동일한 Controller가 먼저 설정되어 있다면 아무런 
   * 동작도 발생하지 않는다. <p/>
   * modal로 명시된 파라미터는 다음과 같은 형태를 가진다.
   * @example
   * // anatomy of modal parameter
   * {
   *   ctrl: tau.ui.Controller를 상속받은 클래스의 객체
   *   opts: 사용될 옵션으로 JSON객체로 표현한다.
   * }
   * @param {Object} modal Modal Controller를 설정하기 위한 객체
   */
  pushModal: function (modal) {
    var modals = this._modals;
    if (modals.indexOf(modal) == -1) { // push unique
      modals.push(modal);
    }
  },
  
  /**
   * Modal 객체의 Stack에서 최상위에 있는 Modal객체를
   * 제거하고 그 값을 반환한다.
   * @returns {Object} 삭제된 Modal 객체
   */
  popModal: function () {
    return this._modals.pop();
  },
  
  /**
   * ModalSceneController가 관리하는 DOM영역에서 최상위 DOM
   * 앨리먼트를 찾아 반환한다. 만약 ModalSceneController의
   * Dim영역에 해당하는 DOM앨리먼트를 찾고자할 경우 key의
   * 값으로 {@link tau.ui.ModalSceneController.MASK_KEY}를 사용한다.
   * @param {String} [key] 생략하면 Modal 영역에 해당하는
   * DOM앨리먼트를 반환하며, Dim영역을 반환하고자 할 경우
   * {@link tau.ui.ModalSceneController.MASK_KEY}를 사용한다.
   * @returns Modal영역 또는 Dim영역에 해당하는 HTML
   * DOM앨리먼트
   */
  getDOM: function (key) {
    var dom = this._module.getDOM().getElementsByClassName('tau-modal')[0];
    if (key === tau.ui.ModalSceneController.MASK_KEY) { // default is root element
      return dom.getElementsByClassName(key)[0];
    }
    return dom;
  },
  
  /**
   * Modal 객체의 Stack에서 최상위 객체의 Reference를
   * 반환한다. 만약 idx로 인덱스를 지정하면 해당 Modal객체의
   * Reference를 반환한다.
   * index의 값을 1로 설정할 경우 실제 index는 stack.length - 2에 해당하는
   * Modal객체가 된다.
   * @param {Number} [idx] Modal 객체의 Stack에 적용할
   * 인덱스(역순)
   * @returns {Object} 명시된 인덱스에 해당하는 Modal객체의
   * Reference 또는 Stack의 최상위 객체(idx 를 생략할 경우)
   */
  peekModal: function (idx) {
    if (!idx) idx = 0;
    return this._modals[this._modals.length - (1 + idx)];
  },
  
  /**
   * 화면을 흐릿하게 만들며 이 영역에 대해서는 사용자 이벤트를
   * 더이상 처리하지 않는다.
   */
  dim: function () {
    var mask = this.getDOM(tau.ui.ModalSceneController.MASK_KEY);
    if (mask) {
      mask.style.display = 'block';
    }
  },
  
  /**
   * Dim된 영역을 제거한다. 이후 부터는 사용자 이벤트를
   * 받아들이고 처리한다.
   */
  undim: function () {
    var mask = this.getDOM(tau.ui.ModalSceneController.MASK_KEY);
    if (mask) {
      mask.style.display = 'none';
    }
  },
  
  /**
   * 기기의 Orientation이 변경되었을 경우 위치를 재조정하는
   * 작업을 수행한다.
   * @param {Object} modal Modal 객체
   */
  adjustDimension: function (modal) {
    var top = left = '0';
    if (!modal) {
      modal = this.peekModal();
    }
    if (!modal) return;

    var dimension, width, height,
        dom = modal.ctrl.getDOM(),
        layout = 'FULL';

    if (modal.opts && modal.opts.layout) {
      layout = modal.opts.layout;
    }
    dimension = tau.ui.ModalSceneController['LAYOUT_' + layout];
    width = dimension.width;
    height = dimension.height;
    if (width !== '100') {
      left = (tau.getWidth() - width) / 2;
    }
    if (height !== '100') {
      top = (tau.getHeight() - height) / 2;
    }
    dom.style.removeProperty('-webkit-transform');
    dom.style.top = top + 'px';
    dom.style.left = left + 'px';
    dom.style.width = width + (tau.isString(width) ? '%' : 'px');
    dom.style.height = height + (tau.isString(height) ? '%' : 'px');
  },

  /**
   * 명시된 파라미터의 값에 따라 시스템 이벤트를 enable 또는 diable시킨다.
   * @param {Boolean} enable true이면 시스템 이벤트를 처리하지 않는다.
   *  system events
   * @private
   */
  _shieldSystemEvents: function (enable) {
    var eventMgr = tau.getRuntime().$eventMgr;
    eventMgr.setEnable(!(enable || false)); // disable user event
  },

  /**
   * 명시된 Controller를 화면에 출력한다. 이때 옵션으로 화면의
   * layout과 animation타입을 설정할 수 있다. 자세한 내용은
   * {@link tau.ui.SceneController.presentModal}을 참조하면
   * 된다.
   * @param {tau.ui.Controller} ctrl {@link tau.ui.Controller} 객체
   * @param {Object} [opts] JSON객체로 표현하며 layout과 animation타입을 설정한다.
   * @param {String} [opts.layout = 'FULL'] Modal화면의 형태를 나타내며
   * 'FULL', 'PAGE', 'FORM' 중의 하나를 사용할 수 있다.
   * @param {String} [opts.animate = 'vertical'] Animation을 통해 Modal화면이
   * 출력되는 방향을 나타낸다. 'vertical' 또는 'horizontal'의 값을 사용할 수 있다.
   * @see tau.ui.SceneController#presentModal
   */
  present: function (ctrl, opts) {
    if (!this.hasModals()) {
      this.dim();
    }
    var dom,
        old = this.peekModal(),
        zIndex = old ? old.ctrl.getDOM().style.zIndex : this._zIndex;
    zIndex = window.parseInt(zIndex) + 1;
    this.pushModal({'ctrl': ctrl, 'opts': opts});
    ctrl.setParent(this);
    // animation will be processed in handleSceneDrawn method
    dom = ctrl.getDOM();
    dom.style.zIndex = zIndex;
    dom.style.backgroundColor = '#ffffff';
    this.adjustDimension();
    if (opts && opts.animate) {
      dom.style.visibility = 'hidden';
    }
    ctrl.doStart();
  },
  
  /**
   * 현재 출력되어 있는 Modal Scene을 제거한 다음 Modal Scene을 시작한
   * Scene으로 돌아가거나 이전 ModalScene상태로
   * 되돌아간다.<p/>
   * 만약 여러개의 SceneController를 Modal로 띄워졌을 경우
   * 최상위에 있는 SceneController를 사라지게 한다.
   * @param {tau.ui.Controller} ctrl Modal Scene을 생성하기 위한 Controller
   * @param {Boolean} animated true이면 Animation이 적용된다.
   */
  dismiss: function (ctrl, animate) {
    var tobe = this.peekModal(1);
    if (tobe) { // reveals to be modal scene!
      this.adjustDimension(tobe);
      tobe.ctrl.getDOM().style.display = '';
    }
    var current = this.peekModal();
    // TODO dismiss if current is equal to ctrl(parameter)
    if (animate && current.opts && current.opts.animate) {
      this._shieldSystemEvents(true);
      if (current.opts.animate) {
        try {
          this.animate(current.opts.animate, false, tau.ctxAware(cleanup, this));
        } catch (e) {
          this._shieldSystemEvents(false);
          tau.log.error('Can not animate: ' + e);
        }
      }
    } else {
      cleanup.call(this);
    }
    /** @inner */
    function cleanup() {
      var popped = this.popModal();
      popped.ctrl.setParent(null);
      popped.ctrl.removeBubble(this);
      try {
        popped.ctrl.doDestroy();
      } finally {
        this._shieldSystemEvents(false);
      }
      if (!this.hasModals()) {
        this.undim();
      }
    }
  },
  
  /**
   * Orientation변경 이벤트를 처리한다.
   * @param {tau.rt.Event} e Orientation 변경 이벤트
   * @param {Object} payload 이벤트 객체와 같이 전달되는
   * 데이터 객체
   */
  handleOrientationChange: function (e, payload) {
    this.adjustDimension();
  },
  
  /**
   * Animation효과를 처리한다. Modal Scene이 밑에서 부터 위로
   * 출력되고 반대방향으로 사라지도록 한다.
   * @param {Boolean} visible true이면 ModalScene이 출력되며 false일 경우
   * 사라지도록 처리한다.
   * @param {Function} [callbackFn] Animation이 종료되면 호출되는 callback함수
   * @see tau.ui.ModalSceneController#animate
   */
  transitVertical: function (visible, callbackFn) {
    var anim,
        dom = this.peekModal().ctrl.getDOM(),
        px = dom.style.top.indexOf('px'),
        height = offset = tau.getHeight();
    if (px != -1) {
      offset = height - window.parseInt(dom.style.top.substring(0, px));
      if (visible) {
        offset = '-'.concat(offset);
      }
    }
    if (visible) {
      dom.style.top = height + 'px';
      dom.style.visibility = 'visible';
    }
    anim = new tau.fx.Transition({
      timingFunction: 'ease-in-out',
      duration: tau.rt.hasTouch ? '0.25s' : '0.5s'
    });
    
    anim.setStyle('-webkit-transform', 'translateY(' + offset + 'px)', {
      onEnd: callbackFn
    });
    anim.animate(dom);
  },
  
  /**
   * Animation효과를 처리한다. Modal Scene이 왼쪽에서
   * 오른쪽으로 출력되고 반대방향으로 사라지도록 한다.
   * Handles the animation effect that transit current modal scene from left
   * to right if <code>visible</code> is true, otherwise then reverse order
   * @param {Boolean} visible true이면 ModalScene이 출력되며 false일 경우
   * 사라지도록 처리한다.
   * @param {Function} [callbackFn] Animation이 종료되면 호출되는 callback함수
   * terminates.
   * @see tau.ui.ModalSceneController#animate
   */
  transitHorizontal: function (visible, callbackFn) {
    //@ FIXME implement animation effect here
    callbackFn();
  },
  
  /**
   * 현재 Controller의 모든 리소스를 삭제하고 Lifecycle을
   * 종료한다.
   */
  destroy: function () {
    this._modals.splice(0);
    tau.ui.ModalSceneController.$super.destroy.apply(this, arguments);
    this.removeBubble(this._module);
    this.setParent(null);
    this._module = null;
    tau.getRuntime().unsubscribeEvent('orientationchange', 
        this.handleOrientationChange, this);
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.NavigationController.prototype */
$class('tau.ui.NavigationController').extend(tau.ui.Controller).define({
  
  $static: /** @lends tau.ui.NavigationController */{
    /** $dom에서 toolbar DOM에 해당하는 key값 */
    TOOLBAR_KEY: 'toolBar'
  },

  /**
   * 자체적으로 객체를 생성하지 않으며 Navigation 관련 클래스
   * 작성시 공통으로 사용될 기능들을 정의한다.
   * @class
   * Navigation관련 기능들을 정의한다. Scene Navigation관련
   * 클래스를 작성하기 위해서는 NavigationController 클래스를
   * 상속받아 구현한다. 일반적으로 많이 사용되는 Scene
   * Navigation관련 클래스는 
   * {@link tau.ui.SequenceNavigator}와 
   * {@link tau.ui.ParallelNavigator}가 있다.
   * @constructs
   * @extends tau.ui.Controller
   */
  NavigationController: function () {//$ tau.ui.NavigationController
    /** @private Navigated controller list { ctrl, nav, tool } */
    this.$list = [];
    /** @private Navigator DOM nodes */
    this.$renderData = this.renderer.initialize();
    /** @private Event Manager used to disable input during animation */
    this.$eventMgr = tau.getRuntime().$eventMgr;
  },

  /**
   * 이벤트 Subsystem의 메소드를 Override한다.<p/>
   * Scene 로딩은 Asynchronous하게 수행되어 SceneController에서 
   * Drawing을 완료했을 때 발생되는 {@link tau.rt.Event.SCENEDRAWN}
   * 이벤트를 받아 다음 Navigation작업을 수행하도록 한다.
   * @param {tau.rt.Event} e 이벤트 객체
   */
  propagateEvent: function (e) {
    var active = this.getActive();
    switch (e.getName()) {
      case tau.rt.Event.SCENEDRAWN:
        if (!active.isDrawn) {
          this.handleSceneDrawn(active);
          active.isDrawn = true;
        }
        break;
      default:
        break;
    }
    tau.ui.NavigationController.$super.propagateEvent.apply(this, arguments);
  },
  
  /**
   * Scene이 Drawing된 이후의 로직을 처리할 수 있도록 한다.(Scene Loading은
   * Async로 처리되므로 Drawing 종료 시점을 알 수 없음) <p/>
   * 상속받은 클래스에서 관련 로직을 구현한다.
   * 
   * @param {Object} active NavigationController에서 Active상태인 Controller
   */
  handleSceneDrawn: function (active) {
    // dummy function, child controller will override this method 
  },
  
  /**
   * Navigator에 푸쉬한 컨트롤러 갯수.
   * @returns {Number} 현재 컨트롤러 갯수
   */
  getSize: function () {
    return this.$list.length;
  },

  /**
   * NavigationController에서 현재 유효한 NavigationBar를 반환한다.
   * @returns {tau.ui.NavigationBar} 현재 유효한 {@link tau.ui.NavigationBar}
   */
  getActiveNavigationBar: function () {
    var active = this.getActive();
    return active ? active.nav : null;
  },

  /**
   * NavigationController에서 현재 유효한 ToolBar를 반환한다.
   * 만약 active tool bar가 존재하지 않으면 null을 반환한다.
   * @returns {tau.ui.ToolBar} 현재 유효한 {@link tau.ui.ToolBar}
   */
  getActiveToolBar: function () {
    var active = this.getActive();
    return active ? active.tool : null;
  },

  /**
   * NavigationController에서 현재 유효한 컨트롤러를 반환한다.
   * @returns {tau.ui.Controller} 현재 유효한 {@link tau.ui.Controller}
   */
  getActiveController: function () {
    var active = this.getActive();
    return active ? active.ctrl : null;
  },

  /**
   * 관리하고 있는 모든 컨트롤러를 destroy한다.
   */
  doDestroy: function () {
    tau.ui.NavigationController.$super.doDestroy.apply(this, arguments);

    // Destroy all sub controllers
    for (var item, i = this.$list.length; i--; ) {
      item = this.$list[i];
      item.ctrl.doDestroy();
      if (item.nav) item.nav.destroy();
      if (item.tool) item.tool.destroy();
    }
    this.renderer.release(this.$renderData);
    this.$list = [];
  },

  /**
   * 현재 컨트롤러에 있는 모든 하위 {@link tau.rt.EventDelegator}를 반환한다.
   * 컨포넌 hit test과정에서 에서 사용됨.
   * @returns {Array} 하위(EventDelegators)을 가지는 배열
   */
  getSubDelegators: function () {
    var active = this.getActive(), 
        children = tau.ui.NavigationController.$super.getSubDelegators.apply(
            this, arguments) || [];
    if (active) {
      if (active.ctrl) children = children.concat(active.ctrl);
      if (active.nav) children = children.concat(active.nav);
      if (active.tool) children = children.concat(active.tool);
    }
    return children;
  },
  
  /**
   * Controller Lifecycle메소드를 Override하며 현재
   * Controller의 Lifecycle을 시작한다.
   * @see tau.ui.Controller#doStart
   */
  doStart: function () {
    var parent = this.getParent();

    tau.util.dom.pushElement(parent.getDOM(tau.ui.CONTENT_KEY), this.getDOM());
    tau.ui.NavigationController.$super.doStart.apply(this, arguments);
  },

  /**
   * NavigationController가 차지하는 영역에서 주어진 파라미터(key)에
   * 따라 관련된 DOM객체를 반환한다. 만약 key가 지정되지 않으면
   * 현재 NavigationController의 최상위 DOM앨리먼트를 찾아 반환한다.
   * 만약 NavigationController의 Content영역에 해당하는 DOM앨리먼트를
   * 반환하고자 한다면 'tau.ui.CONTENT_KEY'를 사용하면 된다.
   * 
   * @param {String} [key] NavigationController의 각 영영에 해당되는 키 값
   * @returns {HTMLElement} DOM element
   */
  getDOM: function (key) {
    return this.renderer.getParentElement(this.$renderData, key);
  },
  
  /**
   * 지정된 컨트롤러의 {@link tau.ui.NavigationBar}scene을 생성한다.
   * @private
   * @param {tau.ui.Controller} controller  Navigation Bar를 복사하기 위한 컨트롤러
   * @param {Object} [opts] Navigation Bar옵션
   * @returns {Object} 컨트롤러에 의해 생성된 Navigation Bar 인스턴스 
   */
  _createNavigationBar: function (controller, opts) {
    return new tau.ui.Scene();
  },

  /**
   * TODO: needs implementation for generic tool bar controls
   * 지정된 컨트롤러의 {@link tau.ui.ToolBar} scene을 생성한다.
   * @private
   * @param {Object} controller Tool Bar를 복사할 컨트롤러
   * @param {Object} [opts] Tool Bar옵션
   * @returns {Object} 지정된 컨트롤러의 의해 생성된 Tool Bar 인스턴스 
   */
  _createToolBar: function (controller, opts) {
    return new tau.ui.Scene();
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.SequenceNavigator.prototype */
$class('tau.ui.SequenceNavigator').extend(tau.ui.NavigationController).define({
  $static: /** @lends tau.ui.SequenceNavigator */{
    // Default animation options
    DEFAULT_ANIM_OPTS: { 
      duration: 400, 
      override: true,
      timingFunction: 'ease-in-out'
    },

    /** $dom에서 NavigationBar DOM에 해당하는 key값 */
    NAVBAR_KEY: 'navBar',
    EVENT_PUSH_START  : 'pushStart',
    EVENT_PUSH_FINISH : 'pushFinish',
    EVENT_POP_START   : 'popStart',
    EVENT_POP_FINISH  : 'popFinish'
  },

  /**
   * 생성자, 새로운 객체를 생성한다.
   * @class
   * 화면(scene)의 순차적인 네비게이션(depth) 이력을 관리한다.
   * <p/>
   * SequenceNavigator는 {@link tau.ui.Scene}을 직접적으로
   * 관리하는 것이 아니라 다른 {@link tau.ui.Controller}들을 관리한다.
   * <p/>
   * {@link tau.ui.SequenceNavigator#pushController}가 호출될 때 마다 컨트롤러는
   * Navigator의 history 스택에 푸쉬하고 
   * {@link tau.ui.SequenceNavigator#popController}이 
   * 호출될 때 마다 history 스택에서 제거되며 이전 컨트롤러의 
   * scene은 사용자에게 반환된다.  
   * <p/>
   * SequenceNavigator는 네비게이션 이력뿐만 아니라 하위 컨트롤러의 상태를
   * 관리한다. 또한 자동적으로 생성되는 네비게이션 관련 컨트롤을 지원한다.
   * (이전 버튼, 네이게이션 제목)  
   * <p/>
   * 내부적으로 SequenceNavigator는 Navigation Bar, Tool Bar, 컨텐트 
   * scene을 관리하기 위해 각각의 루트 DOM element를 관리한다.
   * 따라서 push, pop 되고 있는 컨트롤러는 특정한 scene 노드를
   * 루트 element에 추가하고 삭제한다.
   * @param {Object} [opts] 컨트롤러 옵션
   * @extends tau.ui.Controller
   * @constructs
   */
  SequenceNavigator: function (opts) {//$ tau.ui.SequenceNavigator
  },
  
  /**
   * SeqenceNavigator에서 이동할 다음 Scene으로의 Navigation작업을 수행한다.
   * @param {Object} active 다음으로 이동할 Scene의 정보를 가지고 있는 
   * NavigationController객체
   */
  handleSceneDrawn: function (active) {
    this.$eventMgr.setEnable(false); // Disable event handling during push
    var that = this;
    var old = this.$list[this.$list.length - 2];
    function pushDone() {
      that.$eventMgr.setEnable(true); // Re-enable event handling
      active.opts.pushedFn();
      var e = new tau.rt.Event(tau.rt.Event.RT_CTRL_CHANGE, that);
      that.fireEvent(e, {'fg': active, 'bg': old});
      if (old) {
        tau.getRuntime().getClipboard().cut(
            old.ctrl.getDOM().id, old.ctrl.getDOM());
      }
    }
    
    active.nav = this._createNavigationBar(active.ctrl);
    active.nav.setTitleItem(active.ctrl.getTitle()); // be careful; async
    this.renderer.renderPush(this.$renderData, active, old, pushDone);
  },
  
  /**
   * Controller의 Lifecycle 메소드를 Override한다.<p/>
   * 
   * 만약 SequenceNavigator의 RootController가 설정되어 있으면 RootController의
   * Lifecycle을 시작시킨다. RootController가 설정되어 있지 않다면 오류가 발생된다.
   * 
   * @throws {EvalError} RootController가 설정되어 있지 않을 경우
   * @see tau.ui.Controller#doStart
   */
  doStart: function () {
    tau.ui.SequenceNavigator.$super.doStart.apply(this, arguments);
    if (this.getSize() !== 1) {
      throw new EvalError('RootController of SequenceNavigator['
          + this.$classname + '] has not been set!');
    }
    var ctrl = this.getActive().ctrl;
    if (!ctrl.$isStarted) {
      ctrl.doStart();
    }
  },
  
  /** 
   * SequenceNavigator의 RootController를 설정한다. SequnceNavigator의 RootController
   * 는 init() 메소드를 통해 먼저 설정이 되어야 한다.
   * 옵션항목은 pushController() 메소드를 참조하면 된다.
   * @param {Object} controller 컨트롤러
   * @param {Object} opts Controller 설정을 위한 옵션 객체
   * @throws {TypeError} 설정될 controller가 tau.ui.Controller의 객체가 아닐 경우
   * @throws {EvalError} 이미 RootController가 설정되어 있을 경우
   * @see tau.ui.SequenceNavigator#pushController
   */
  setRootController: function (controller, opts) {
    if (this.getSize() !== 0) {
      throw new EvalError('RootController of SequenceNavigator(' 
          + this + ') is already set');
    }
    this._push(controller, tau.mixin({
        pushedFn: tau.emptyFn,
        poppedFn: tau.emptyFn,
        hideNavigationBar: !!this._hideNavigationBar,
        animation: false
      }, opts, true));
  },
  
  /**
   * 명시된 Controller의 push작업을 수행한다.
   * @private
   */
  _push: function (controller, opts) {
    if (!controller instanceof tau.ui.Controller) {
      throw new TypeError('Specified controller is not an instance of '
          + 'tau.ui.Controller: ' + controller + this.currentStack());
    }
    var active;
    if (this.$list.length < this.$list.push({ ctrl: controller })) {
      active = this.getActive(); // Current controller being pushed
      active.opts = tau.mixin({
        pushedFn: tau.emptyFn,
        poppedFn: tau.emptyFn,
        hideNavigationBar: !!this._hideNavigationBar,
        animation: this.$list.length <= 1 ? false : true
      }, opts, true);
      controller.setParent(this);
    }
    return active;
  },
  
  /** 
   * Navigator에 Scene Controller를 푸쉬한다.
   * <p/>
   * 컨트롤러를 푸쉬하는 것은 컨트롤러의 scene을 그리는 것과 동일하다.
   * 새로운 scene은 랜더링되고 현재 보여지고 있는 scene은
   * 사라지게 된다.
   * <p/>
   * 푸쉬된 컨트롤러의 Navigation Bar, Tool Bar, content는 
   * 생성되거나 복사(사용자에 의해서)되어 애니메이션과 더불어 랜더링된다.
   * @example
   * var opts = {
   *     // Does not display the navigation bar
   *     hideNavigationBar: true,
   *
   *     // Pushed done callback
   *     pushedFn: function () {
   *       tau.log('pushed My Scene Controller');
   *     },
   *
   *     // Popped done callback
   *     poppedFn: function () {
   *       tau.log('popped My Scene Controller');
   *     },
   *
   *     animation: true
   *   };
   *
   * var ctrl = new tau.ui.SceneController(
   *    {title: 'My Scene Controller'}, opts);
   *
   * sequenceNavigator.pushController(ctrl);
   *
   * @param {Object} controller 푸쉬할 컨트롤러
   * @param {Object} [opts] push컨트롤러 옵션
   * @param {Boolean} [opts.hideNavigationBar = false] true이면  NavigationBar를
   * 숨긴다.
   * @param {Function} [opts.pushedFn] Controller가 pushe된 후
   * 실행되는 callback 함수
   * @param {Boolean} [opts.animation = true] true이면 Push 또는 Pop될 때
   * 애니메이션 효과를 사용
   */
  pushController: function (controller, opts) {
    if (!controller) {
      throw new ReferenceError('Controller is not defined. '
          .concat('Check parameter of pushController(controller, opts)!'));
    }
    var active = this.getActive();
    if (!active) {
      throw new ReferenceError(
          'RootController of SequenceNavigator must be initialized in init method: '
          .concat(this.$classname));
    }
    if (active.ctrl === controller) {
      throw new EvalError('Specified controller('.concat(controller) 
          .concat(') is double pushed:').concat(this.$classname));
    }
    active = this._push(controller, opts);
    if (active && !controller.$isStarted) {
      if (active.opts.animation) { // prevent flickering
        controller.getDOM().style.visibility = 'hidden';
      }
      controller.doStart();
    }
  },

  /**
   * 스택에서 최상위 컨트롤러를 꺼내고 이전에 저장된 컨트롤러의 scene을 출력한다.
   * <p/>
   * 컨트롤러를 스택에서 꺼내는 작업은 scene을 draw하는 것도 동일하다. 즉 이전 scene은
   * 스크린에 랜더링 되고 현재 scene은 화면에서 사라진다.
   * <p/>
   * 스택에서 꺼낸 컨트롤러는 애니메이션이 완료된 이후
   * destroy된다.
   * @param {Number} depth 컨트롤러 꺼낼 갯수 (default: 1)
   * @param {Object} [opts] pop컨트롤러 옵션
   * @param {Boolean} [opts.hideNavigationBar = false] true이면  NavigationBar를
   * 숨긴다.
   * @param {Function} [opts.poppedFn] Controller가 pop된 후
   * 실행되는 callback 함수
   * @param {Boolean} [opts.animation = true] true이면 Push 또는 Pop될 때
   * 애니메이션 효과를 사용
   * @returns {Object} 스택에서 꺼낸 컨트롤러 인스턴스
   */
  popController: function (depth, opts) {
    if (this.$list.length > 1) {
      var that = this,
          popped = this.$list.pop(),
          active = this.getActive();
      if (popped && popped.ctrl instanceof tau.ui.Controller) {
        this.$eventMgr.setEnable(false); // Disable event handling during pop
        popped.opts = tau.mixin(popped.opts, opts, true); // Override options

        /** @inner Destroys (clears) out-going controllers and scenes  */
        function popDone() {
          that.$eventMgr.setEnable(true); // Re-enable event handling

          // Clean up & destroy popped controller
          var content = that.getDOM(tau.ui.CONTENT_KEY);
          content.removeChild(popped.ctrl.getDOM());
          if (popped.nav) popped.nav.destroy();
          if (popped.tool) popped.tool.destroy();
          /** @inner Delayed cleanup for slow controllers (e.g. big Table) */
          window.setTimeout(function () {
            popped.ctrl.doDestroy();
          }, 500);
          popped.opts.poppedFn();
          
          var e = new tau.rt.Event(tau.rt.Event.RT_CTRL_CHANGE, that);
          that.fireEvent(e, {'fg': active, 'bg': popped});
          // On deep pop, go to at-most, root controller
          if (depth > 1 && that.$list.length > 1) {
            that.popController(--depth);
          }
        }
        if (active) {
          tau.getRuntime().getClipboard().paste(
              active.ctrl.getDOM().id, this.getDOM(tau.ui.CONTENT_KEY));
        }
        
        // Draw popping animation
        this.renderer.renderPop(that.$renderData, popped, active, popDone);
        return popped.ctrl;
      }
    }
    return null;
  },

  /**
   * Navigator에서 현재 화면에 출력된 SceneController의 정보를
   * 가지고 있는 객체를 반환한다. <p/>
   * 이때 반환되는 객체는 다음의 형태를 가진다.
   * @example
   * var ctrl = // instance of SequenceNavigator
   * var active = ctrl.getActive();
   * // active is { ctrl: &lt;scene controller>, opts: &lt;options> }
   *
   * @returns {Object} 현재 유효한 Object
   */
  getActive: function () {
    return this.$list[this.$list.length - 1]; // peek
  },

  /**
   * 화면에 출력된느 Navigation Bar을 숨긴다.
   * @param {Boolean} value Navigation Bar을 숨긴다면 true를
   * 사용
   */
  setHideNavigationBar: function (value) {
    this._hideNavigationBar = !!value;
  },
  
  /**
   * 지정된 컨트롤러의 {@link tau.ui.NavigationBar} scene을 생성한다.
   * @private
   * @param {Object} controller  Navigation Bar를 복사하기 위한 컨트롤러
   * @param {Object} [opts] Navigation Bar옵션
   * @returns {Object} 컨트롤러에 의해 생성된 Navigation Bar 인스턴스 
   */
  _createNavigationBar: function (controller, opts) {
    var navBar, leftItem, rightItem, titleItem, prev, backText, eventPub, backFn; 

    // Clone the navigation scene from a scene controller if it's set
    if (controller instanceof tau.ui.SceneController
        && controller.$navBar instanceof tau.ui.NavigationBar) {
      //TODO: Need a better way to clone (may contain circular references)
      navBar = tau.clone(controller.getNavigationBar(), true, 
          ['$bubbleTargets', '_parent', '$isDrawn', '$subDelegators','_source', '$publishedEvents']);
    }
    if (!navBar) {
      navBar = new tau.ui.NavigationBar();
    }

    // Create navigation buttons and titles
    leftItem = navBar.getMapItem(tau.ui.NavigationBar.LEFT_KEY); 
    rightItem = navBar.getMapItem(tau.ui.NavigationBar.RIGHT_KEY);
    titleItem = navBar.getTitleItem();

    // No Custom Left button set by controller: auto-generate using prev Scene
    if (!leftItem && !(this.$parent instanceof tau.ui.SequenceNavigator 
        && this.$list.length == 1)) {
      leftItem = new tau.ui.Button({styleClass: {shape: 'back'}});
      if (this.$list[0].ctrl !== controller) {
        // Navigated sub scene: "Go Back" button pops the current controller
        prev = this.$list[this.$list.length - 2];
        if (prev) {
          // Navigation bar's button/title as back button
          if (prev.nav instanceof tau.ui.NavigationBar) {
            backText = prev.nav.getBackButtonText(); // Explicitly defined text
            if (!backText && tau.isString(prev.nav.getTitleItem())) {
              backText = prev.nav.getTitleItem(); // Previous navigation title
            }
          }
          // Controller's title as back button
          if (!backText && prev.ctrl instanceof tau.ui.Controller) {
            backText = prev.ctrl.getTitle(); // Previous Controller's title
          }
        }
        leftItem.setLabel(tau.isString(backText) ? backText: 'Back');
        navBar.setLeftItem(leftItem);
      }
    }

    // Automaticaly add pop controller handlers left button if none assigned
    if (leftItem instanceof tau.ui.Button 
        && leftItem.getStyleClass() && 'back' === leftItem.getStyleClass().shape) {
      /** @inner Pops current controller */
      backFn = backFn || function (e, payload) {
        controller.$parent.popController();
      };
      eventPub = leftItem.getEventPublisher(tau.rt.Event.TAP);
      if (eventPub && eventPub._opts) {
        eventPub._opts.defaultFn = backFn; // Only overwrite default function
      } else {
        leftItem.publishEvent(tau.rt.Event.TAP, {
          defaultFn: backFn // New back button event handling
        });
      }
    }

    // Title  auto-generation
    if (!titleItem) {
      navBar.setTitleItem(controller.getTitle() || this.getTitle());
    }

    if (rightItem) {
      navBar.setRightItem(rightItem);
    }
    return navBar;
  },
 
  /**
   * 이전으로 가기 버턴에 사용할 문자열을 설정한다.
   * // TODO 사용처?
   * @private
   */
  _setBackButtonText: function (backButton) {
    var prev = this.$list[this.$list.length - 2];
    var backText;
     if (prev) {
       // Navigation bar's button/title as back button
       if (prev.nav instanceof tau.ui.NavigationBar) {
         backText = prev.nav.getBackButtonText(); // Explicitly defined text
         if (!backText && tau.isString(prev.nav.getTitleItem())) {
           backText = prev.nav.getTitleItem(); // Previous navigation title
         }
       }
       // Controller's title as back button
       if (!backText && prev.ctrl instanceof tau.ui.Controller) {
         backText = prev.ctrl.getTitle(); // Previous Controller's title
       }
     }
     
     backButton.setLabel(tau.isString(backText) ? backText: 'Back');
   },
  
  /**
   * // TODO 사용처? 
   * @private
   */
   _setBackButtonFn: function (controller, backButton) {
     //button insert Back button Function
     var backFn = backFn || function (e, payload) {
       controller.$parent.popController();
     };
     var eventPub = backButton.getEventPublisher(tau.rt.Event.TAP);
     if (eventPub && eventPub._opts) {
       eventPub._opts.defaultFn = backFn; // Only overwrite default function
     } else {
       backButton.publishEvent(tau.rt.Event.TAP, {
         defaultFn: backFn // New back button event handling
       });
     }
   }
});


//------------------------------------------------------------------------------
/** @lends tau.ui.ParallelNavigator.prototype */
$class('tau.ui.ParallelNavigator').extend(tau.ui.NavigationController).define({

  $static: /** @lends tau.ui.ParallelNavigator */{
    /** $dom에서 tabbar DOM에 해당하는 key값 */
    TABBAR_KEY: 'tabBar'
  },

  
  /**
   * 생성자, 새로운 ParallelNavigator객체를 생성한다.
   * @class 
   * 화면(Scene)의 병렬적인(tab) 네비게이션 상태를 관리한다.
   * <p/>
   * SequenceNavigator는 {@link tau.ui.Scene}을 직접적으로
   * 관리하는 것이 아니라 다른 {@link tau.ui.Controller}들을 관리한다. 
   * <p/>
   * {@link tau.ui.SequenceNavigator}와 달리 ParallelNavigator는 정적인
   * 컨트롤러들을 관리한다. 즉 선형목록에 저장한다. 그래서 컨트롤러의 그룹을 
   * {@link tau.ui.ParallelNavigator#setControllers}을 통해 설정하면
   * 탭바에 선택할 수 있는 아이템의 숫자가 정해진다.
   * 추가적으로 새로운 컨트롤러의 그룹이 리셋되지 않는 한 한번 설정되면
   * 새로운 컨트롤러는 추가될 수 없다. 내부적으로 ParallelNavigator는
   * Tab Bar, Tool Bar, 컨텐트 scene을 관리하기 위해 각각의
   * 루트 DOM element를 관리한다.
   * 컨트롤러들의 그룹을 설정하는 것은 scene 노드들을 유효한 탭 
   * scene을 가지는 각각의 루트 element에 추가하는 것이다.
   * @constructs
   * @param {Object} [opts] 컨트롤러 옵션
   * @extends tau.ui.Controller
   */
  ParallelNavigator: function (opts) {//$ tau.ui.ParallelNavigator
  },
  
  /**
   * Scene의 Drawing이 종료되었을 때 로직을 처리한다. Scene 로딩은 Async로 처리 되므로
   * {@link tau.rt.Event.SCENEDRAWN} 이벤트를 받아 처리한다. 이벤트 처리 로직은
   * 상위 클래스에 정의되어 있다.
   * active 객체는 다음과 같은 형태를 가진다.
   * @example
   * //active has form of { ctrl: &lt;scene controller>, opts: &lt;options> }
   *
   * @param {Object} active 다음으로 이동할 Scene의 정보를 가지고 있는 
   * NavigationController 데이터 객체
   */
  handleSceneDrawn: function (active) {
    this.$eventMgr.setEnable(false); // Disable event handling during push
    active.ctrl.getDOM().style.display = ''; // Enable display

    // Set selected Tab indicator
    for (var i = 0, comps = this.$tabBar.getComponents(), len = comps.length; i < len; i++) {
      comps[i].setSelected(this.$index == i);
    }

    // Draw tab bar
    if (active.opts.hideTabBar) {
      this.renderer.hideTabbar(this.$renderData);
    } else {
      this.renderer.showTabbar(this.$renderData);
    }
    this.$tabBar.draw(this.renderer.getParentElement(this.$renderData, 
        tau.ui.ParallelNavigator.TABBAR_KEY, true));

    if (active.tool) {
      active.tool.draw(this.renderer.getParentElement(this.$renderData, 
        tau.ui.NavigationController.TOOLBAR_KEY, true));
    }
    active.opts.indexedFn(active.ctrl, this.$index); // indexed callback
    this.$eventMgr.setEnable(true);// Re-enable event handling
    
    if (this.$prev) { // prevent flickering
      var dom = this.$prev.ctrl.getDOM();
      tau.getRuntime().getClipboard().cut(dom.id, dom);
      dom.style.display = 'none';
      delete this.$prev; // for memory efficiency
    }
  },
  
  /**
   * Controller Lifecycle메소드를 Override한다. init()에서 설정된 Controller가 있으면
   * 첫(index 0)번째 Controller의 Lifecycle을 시작한다.
   */
  doStart: function () {
    tau.ui.ParallelNavigator.$super.doStart.call(this);
    if (this.$list.length > 0 && !this.getActive()) {
      this.setIndex(0);
    }
  },

  /** 
   * Tab Bar에 의해 네이게이션될 컨트롤러들을 설정한다.
   * <p/>
   * 첫번째 인덱스의 컨트롤러는 선택된 탭으로 설정된다.
   * @param {Array} controllers 컨트롤러 배열
   * @param {Object} [opts] Default ParallelNavigator Controller옵션 
   * @param {Function} [opts.indexedFn] 인덱스가 바뀌었을 때
   * 실행되는 callback 함수
   * @param {Boolean} [opts.hideTabBar = false] true이면 탭바를 숨긴다.
   */
  setControllers: function (controllers, opts) {
    var len;

    if (controllers && (len = controllers.length)) {
      if (this.$list && this.$list.length > 0) {
        this.doDestroy(); // Remove previously set control items
      }
      for (var tab, i = 0; i < len; i++) {
        tab = {
          ctrl: controllers[i],
          opts: tau.mixin({
            indexedFn: tau.emptyFn, 
            hideTabBar: !!this._hideTabBar,
            animation: false
          }, opts, true)
        };
        if (tab.ctrl instanceof tau.ui.Controller && tab.ctrl !== this
            && this.$list.length < this.$list.push(tab)) {
          tab.ctrl.setParent(this);
        }
      }
      /** @private Tab bar */
      this.$tabBar = new tau.ui.TabBar({controllers: controllers});
    }
  },

  /**
   * 지정된 인덱스에 해당하는 컨트롤러로 탭을 이동한다.
   * <p/>
   * 컨트롤러 인덱스를 설정하는 것은 해당 인덱스의 컨트롤러를 랜더링함과
   * 동시에 이전 컨트롤러를 삭제하는 것을 의미한다.
   * @example
   * var opts = {
   *   // Does not display the tool bar
   *   hideToolBar: true,
   *
   *   // Navigation index callback
   *   indexedFn: function (ctrl, index) {
   *     tau.log('indexed: ' + index + ', title: ' + ctrl.getTitle());
   *   }
   * };
   * 
   * parallelNavigator.setIndex(0, opts);
   *
   * @param {Number} index 탭 이동할 컨트롤러 인덱스
   * @param {Object} [opts] Indexed controller옵션
   * @param {Function} [opts.indexedFn] 인덱스가 바뀌었을 때
   * 실행되는 callback 함수
   * @param {Boolean} [opts.hideTabBar = false] true이면 탭바를 숨긴다
   * @throws {RangeError} 명시된 index가 범위를 벗어났을 때
   */
  setIndex: function (index, opts) {
    if (index < 0 || index >= this.$list.length) {
      throw new RangeError('Specified index is out of range: '.concat(index). 
          concat(this.currentStack()));
    }
    if (this.$index == index) return; // if same index, do nothing 

    this.$prev = this.getActive();
    this.$index = index; // change active controller

    // Ensure to load new tab
    var active = this.getActive();
    if (active) {
      active.opts = tau.mixin(active.opts, opts, true); // override old opts
      tau.getRuntime().getClipboard().paste(
          active.ctrl.getDOM().id, this.getDOM(tau.ui.CONTENT_KEY));
      if (!active.ctrl.$isStarted) {
        active.ctrl.doStart(); // progress asynchronously!
      } else {
        this.handleSceneDrawn(active);
      }
      var e = new tau.rt.Event(tau.rt.Event.RT_CTRL_CHANGE, this);
      this.fireEvent(e, {'fg': active, 'bg': this.$prev});
    }
  },
  
  /**
   * 현재 컨트롤러에 설정된 TabBar를 반환한다.
   * @returns {Object} 현재 컨트롤러에 할당된 TabBar
   */
  getTabBar: function () {
    return this.$tabBar;
  },

  /**
   * Navigator에서 현재 화면에 출력된 SceneController의 정보를
   * 가지고 있는 객체를 반환한다.
   * 이때 반환되는 객체는 다음의 형태를 가진다.
   *
   * @example
   * var ctrl = // instance of ParallelNavigator
   * var active = ctrl.getActive();
   * // active is { ctrl: &lt;scene controller>, opts: &lt;options> }
   * 
   * @returns {Object} 현재 동작중인 Controller 데이터 객체
   */
  getActive: function () {
    return this.$list[this.$index];
  },

  /**
   * Tab Bar을 숨긴다.
   * @param {Boolean} value Tab Bar을 숨긴다면 true
   */
  setHideTabBar: function (value) {
    this._hideTabBar = !!value;
    for (var i = 0; i < this.$list.length; i++) {
      this.$list[i].opts.hideTabBar = this._hideTabBar;
    }
  },

  /**
   * 컨트롤러에서 관리하는 모든 컨트롤러를 destroy한다.
   */
  doDestroy: function () {
    tau.ui.ParallelNavigator.$super.doDestroy.apply(this, arguments);
    if (this.$tabBar) {
      this.$tabBar.destroy();
      delete this.$tabBar;
    }
    delete this.$index;
  },

  /**
   * 현재 컨트롤러의 모든 하위{@link tau.rt.EventDelegator}을 반환한다.:
   * 컨포넌트 히트 테스트에서 사용됨.
   * @returns {Array} 하위(EventDelegators)을 가지는 배열
   */
  getSubDelegators: function () {
    var children = tau.ui.ParallelNavigator.$super.getSubDelegators.apply(this, 
        arguments) || [];
    if (this.$tabBar) {
      children = children.concat(this.$tabBar.getSubDelegators());
    }
    return children;
  }
});

//------------------------------------------------------------------------------
/** 
 * @lends tau.ui.DashboardController.prototype
 */
$class('tau.ui.DashboardController').extend(tau.ui.SceneController).define({    
  /**
   * 주어진 <code>Dashboard</code>파라미터를 이용하여 새로운
   * Controller객체를 생성한다.
   * Custom 클래스를 global config 파일에 아래의 예제와 같이 
   * controller 키로 등록해 주면 자동으로 인식한다.
   * @example
   * $class('foo.ExtendedController').extend(tau.ui.DashboardController).define({
   *   ...
   * });
   *
   * // config.json(global)
   * {
   *   ...
   *   dashboard: {controller: 'foo.ExtendedController'}
   *   ...
   * }
   * @class
   * Dashboard의 UI를 구성하는 SceneController 클래스이다.
   * DashboardController 클래스는 Dashboard를 구현하기 위해 
   * UI Framework에서 기본으로 사용하는 SceneController이며, 사용자가 직접 UI를
   * 커스터마이징을 하기 위해서는 {@link tau.ui.DashboardController}를 상속받아
   * 구현해야 한다.
   * @constructs
   * @extends tau.ui.SceneController
   * @param {tau.rt.Dashboard} Dashboard 객체
   * @see tau.ui.SceneController
   */
  DashboardController: function (dashboard) {
    this._db = dashboard;
    this._panel = null; // dashboard panel
    this._editable = false;
    this._preinstalled = false;
    
    this._drifter = null;
    this._swapTarget = null;
    this._ul = null;
    this._movingShortcutsCount = 0;
    this._continuousMutation = true;//dashboard.getContinuousMutation();
    this._FORCE_SWINGBACK = "FORCE_SWINGBACK";
  },
  
  /**
   * DashboardController의 초기화 작업을 수행한다.
   */
  init: function() {
    var rt = tau.getRuntime(); // do not implement listener in init() method 
    rt.onEvent(tau.rt.Event.ORIENTATION, this.handleOrientationChange, this);
    rt.onEvent(tau.rt.Module.EVENT_BADGESET, this.handleBadgeChanage, this);
  },
  
  /**
   * {@link tau.rt.Event.RT_INSTALLED} 이벤트를 처리한다. 만약 동일한
   * App이 먼저 설치되어 있다면 경고창을 출력하고 현재 처리를 종료한다.
   * 이때 전달되는 payload는 설치된 앱들의 config정보를 갖고 있는 배열이 된다.
   * @param {tau.rt.Event} e {@link tau.rt.Event.RT_INSTALLED}
   * @param {Array} confs 설치할 App별 정보를 갖고 있는 configuration 객체
   */
  addShortcuts: function (confs) { // callback from Dashboard
    var shortcut,
        panel = this._panel,
        rt = tau.getRuntime();
    for (var i = 0, len = confs.length; i < len; i++) {
      if (this._preinstalled && this._db.hasShortcut(confs[i].name)) {
        tau.alert('앱('+ confs[i].title + ')이 이미 설치되어 있습니다', {
          title : '경고',
          callbackFn: function (type) { } // none; need to fix
        });
        return;
      }
      this._db.addShortcut(confs[i]);
      appCtx = rt.createStorageCtx(confs[i].name);
      shortcut = new tau.ui.Shortcut(confs[i]);
      shortcut.setBadge(appCtx.get('$badge'));
      panel.add(shortcut);
    }
    if (this._preinstalled) { // user installed
      window.setTimeout(function () {panel.render(false);}, 300); // effect
    } else {
      panel.render(false);
      this._preinstalled = true;
    }
  },
  
  /**
   * Runtime에서 App이 삭제되면 발생되는
   * {@link tau.rt.Event.RT_UNINSTALLED} 이벤트를 처리한다.
   * 이때 전달되는 conf는 {name: xxx}의 형태를 가진다. 
   * payload.name은 삭제된 app의 이름을 나타낸다.
   * @param {Object} conf {name: xxx} 의 형태를 가진 객체
   */
  removeShortcut: function (conf) { // callback from Dashboard
    var shortcut = this._panel.findShortcut(conf.name);
    this._db.removeShortcut(conf);
    if (shortcut) {
      this._panel.removeShortcut(shortcut);
    }
  },
  
  /**
   * Override 메소드이며 Dashboard 화면을 생성한다. 상속받은 클래스가 
   * 이 메소드를 Override할 경우 반드시 super 메소드를 호출해 주어야 한다.
   * @throws {TypeError} Custom 영역으로 생성한 객체가 
   * {@link tau.ui.Component}의 인스턴스가 아닐경우
   * @see tau.ui.SceneController#loadScene
   */
  loadScene: function () {
    var scene = this.getScene();
    var custom = this.loadHeader();
    if (custom && !(custom instanceof tau.ui.Component)) {
      throw new TypeError('Header area of dashboard is not a Component: ',
          this.currentStack());
    }
    if (custom) {
      scene.add(custom);
    }
    // mixins to extend Panel component
    this._panel = this.loadShortcutPanel();
    scene.add(this._panel);
    var custom = this.loadFooter();
    if (custom && !(custom instanceof tau.ui.Component)) {
      throw new TypeError('Footer area of dashboard is not a Component: ',
          this.currentStack());
    }
    if (custom) {
      scene.add(custom);
    }       
  },
  
  /**
   * Scene이 화면에 Rendering이 완료되면 호출되는 Callback함수
   * @see tau.ui.SceneController#sceneDrawn
   */
  sceneDrawn: function () {
    var i, len, 
        installs = [], 
        apps = this._db.getConfig().apps;
    for (i = 0, len = apps.length; i < len; i++) {
      installs.push({name: apps[i], sys: true});
    }
    
    apps = tau.getRuntime().getCached();
    for (i = 0, len = apps.length; i < len; i++) {
      installs.push({name: apps[i], sys: false});
    }
    tau.getRuntime().install(installs);
    tau.ui.DashboardController.$super.sceneDrawn.apply(this, arguments);
  },
  
  /**
   * Scene이 로딩되었을 때 발생되는 이벤트를 처리한다. 이 메소드에서는
   * Dashboard에서 발생되는 다양한 이벤트를 처리하기 위해 이벤트 리스너들을
   * 등록한다. 
   * @see tau.ui.SceneController#sceneLoaded
   */
  sceneLoaded: function () {
    var scene = this.getScene();
    scene.onEvent(tau.ui.Shortcut.EVENT_LONGPRESS, this.handleLongPress, this);
    scene.onEvent(tau.rt.Event.TOUCHSTART, this.handleTouchStart, this, true);
    scene.onEvent(tau.rt.Event.TOUCHEND, this.handleTouchEnd, this, true);
    scene.onEvent(tau.ui.Shortcut.EVENT_DELETE, this.handleShortcutDelete, this);
    // table does not occupy whole screen, so listen to tap event for scene area
    scene.onEvent(tau.rt.Event.TAP, this.handleBoardTap, this);
    
  },
  
  /**
   * 사용자가 Shortcut을 오랫동안 누르고 있을 때 발생되는 
   * {@link tau.ui.Shortcut.EVENT_LONGPRESS}이벤트를 처리한다. 현재
   * Shortcut들이 삭제가능한 상태가 아니라면 삭제가능하도록 Badge를
   * 표시한다. 
   * @param {tau.rt.Event} e {@link tau.ui.Shortcut.EVENT_LONGPRESS} 이벤트
   * @param {Number} payload Shortcut이 눌려진 시간(ms) 
   */
  handleLongPress: function (e, payload) {        
    if (!this._editable){
      this._editable = !this._editable;
      this.toggleDeletable(this._editable);
    }
    
    var target = payload.event.touches[0].target;
    if(target.getAttribute("class").indexOf(tau.ui.Shortcut.ICON_CLASS) > -1 && this._movingShortcutsCount == 0){
      target = target.parentNode.parentNode;
      if(!this._drifter){
        this.makeMutable(target);
      }else{
        if(this._drifter == target){
           this.swingback();      
           e.preventDefault();
           return false;    
        }
      }
    }
  },
 
  /**
   * need to refactoring
   * @private
   */
  makeMutable: function(target){
    this._editable = true;
    this.toggleDeletable(this._editable);
    
    this._drifter = target == undefined ? this._drifter : target;
    this.toggleVibrate();

    tau.util.dom.addClass(this._drifter, 'moving');
    tau.util.dom.addClass(this._drifter.firstChild.firstChild, 'moving_inner');           
  },
 
  /**
   * need to refactoring
   * @private
   */
  toggleVibrate: function(){    
      var divs = document.querySelectorAll(".shortcuts");
      if(this._drifter){
        for(var i=0; i<divs.length; i++){
          if(this._drifter == divs[i] || !divs[i].firstChild) continue;
          tau.util.dom.addClass(divs[i], 'replacable');
          tau.util.dom.addClass(divs[i].firstChild.firstChild, 'replacable_inner');
        }
      }else{
        for(var i=0; i<divs.length; i++){  
          if(this._drifter == divs[i] || !divs[i].firstChild) continue;
          tau.util.dom.removeClass(divs[i], 'replacable');
          tau.util.dom.removeClass(divs[i].firstChild.firstChild, 'replacable_inner');
        }
      }
  },
 
  /**
   * need to refactoring
   * @private
   */
  handleTouchStart: function(e, payload){    
    var target = e.touches[0].target;
    if(target.getAttribute("class").indexOf(tau.ui.Shortcut.ICON_CLASS) > -1 && this._movingShortcutsCount == 0){
      target = target.parentNode.parentNode;
      if (this._drifter) {
      }else{
      }
    }
  },
  
  /**
   * need to refactoring 
   * @param e
   * @param payload
   * @returns {Boolean}
   * @private
   */
  handleTouchEnd: function(e, payload){
    var target = e.touches[0].target;
    if(target.getAttribute("class").indexOf(tau.ui.Shortcut.ICON_CLASS) > -1 && this._movingShortcutsCount == 0){      
      target = target.parentNode.parentNode;
      
      if (this._drifter) {
        if(this._drifter == target){
          return false;
        }
        this.shiftItems(this._drifter, target);
      }else{
      }
    }
  },
  
  /**
   * need to refactoring 
   * @param fs
   * @private
   */
  swingback: function(fs) {
    if(!this._continuousMutation || fs === this._FORCE_SWINGBACK){
      if(this._drifter){
        tau.util.dom.removeClass(this._drifter, 'moving');
        if(this._drifter.firstChild){
          tau.util.dom.removeClass(this._drifter.firstChild.firstChild, 'moving_inner');
        }
      }
      this._drifter = null;
      this.toggleVibrate();
      this._editable = false;
      this.toggleDeletable(this._editable);
    }
    this._swapTarget = null;
  },
  
  /**
   * need to refactoring
   * @param newItem
   * @param targetItem
   * @private
   */
  swapItems: function(newItem, targetItem){
    var newTop = newItem.style.top;
    var newLeft = newItem.style.left;

    this._swapTarget = targetItem;
    this.moveItemToPosition(targetItem, newItem, newTop, newLeft);
    this.moveItemToAnotherItemPosition(newItem, targetItem);
  },
  
  /**
   * need to refactoring 
   * @param newItem
   * @param targetItem
   * @private
   */
  shiftItems: function(newItem, targetItem){    
    var divs = this._ul.children;
    var newIndex = this.indexOf(newItem);
    var targetIndex = this.indexOf(targetItem);
    var direction = newIndex < targetIndex ? "DESC" : "ASC";
    var startIndex = newIndex < targetIndex ? newIndex : targetIndex;
    var endIndex = newIndex > targetIndex ? newIndex : targetIndex;
  
    var targetTop = targetItem.style.top;
    var targetLeft = targetItem.style.left;
    
    if(direction == "ASC"){
      for(var i=startIndex; i<endIndex; i++){
        divs[i].firstChild.style.webkitTransitionDelay = (i*30) + "ms";
        this.moveItemToAnotherItemPosition(divs[i].firstChild, divs[i+1].firstChild);          
      }
    }else{
      for(var i=endIndex; i>startIndex; i--){
        divs[i].firstChild.style.webkitTransitionDelay = (i*30) + "ms";
        this.moveItemToAnotherItemPosition(divs[i].firstChild, divs[i-1].firstChild);              
      }
    }

    this.moveItemToPosition(newItem, targetItem, targetTop, targetLeft);

  },
  
  /**
   * need to refactoring
   * @private
   * @param e
   * @param t
   * @param x
   * @param y
   * @private
   */
  _ontransitionEnd: function(e, t, x, y){
    if(e.propertyName == "-webkit-transform"){
      e.target.style.webkitTransitionTimingFunction = "";
      e.target.style.webkitTransitionDuration = "";
      e.target.style.webkitTransform = "";
      e.target.style.cssText = "top:"+(parseInt(e.target.style.top) + x)+"px;left:"+(parseInt(e.target.style.left) + y)+"px;" + "width:"+this.widthAlpha + "px;height:"+this.heightAlpha+"px;";
      
      if(this._drifter == e.target){        
        if(this._swapTarget){        
          var a = t.parentElement;
          var bIndex = this.indexOf(this._drifter);
          if(x > 0 || y > 0){
            a = this._drifter.parentElement;
            bIndex = this.indexOf(t);
          }
          this._ul.insertBefore(this._ul.children[bIndex], a);
          this._ul.insertBefore(a, (this._ul.children[bIndex]).nextSibling);
        }else{        
          var target = t.parentElement;
          if(this.indexOf(this._drifter) < this.indexOf(t)){
            target = target.nextSibling;
          }
          this._ul.insertBefore(this._drifter.parentElement, target);    
        }
        this.swingback();
      }
    }      
  },
  
  /**
   * need to refactoring 
   * @param item
   * @returns {Number}
   * @private
   */
  indexOf: function(item){
    var divs = this._ul.children;
    for(var i=0; i<divs.length; i++){
      if(item == divs[i].firstChild){
        return i;
      }
    }
    return -1;
  },
  
  /**
   * need to refactoring
   * @private 
   */
  setInitialPosition: function(){
    var divs = document.querySelectorAll(".shortcuts");    
    for(var i=0; i<divs.length; i++){
      divs[i].style.top = !divs[i].style.top ? divs[i].offsetTop + "px" : divs[i].style.top;
      divs[i].style.left = !divs[i].style.left ? divs[i].offsetLeft + "px" : divs[i].style.left;
    }
  },
  
  /**
   * need to refactoring
   * @param o1
   * @param o2
   * @private
   */
  moveItemToAnotherItemPosition: function(o1, o2){
    if(!o1.style.top || !o1.style.left){
      this.setInitialPosition();
    }
    if(!o2.style.top || !o2.style.left){
      this.setInitialPosition();
    }
    this.moveItemToPosition(o1, o2, o2.style.top, o2.style.left);
  },
  
  /**
   * need to refactoring
   * @param o1
   * @param o2
   * @param top
   * @param left
   * @private
   */
  moveItemToPosition: function(o1, o2, top, left){
    if(!o1.style.top || !o1.style.left){
      this.setInitialPosition();
    }

    var self = this;
    var tempY = parseInt(top) - parseInt(o1.style.top);
    var tempX = parseInt(left) - parseInt(o1.style.left);
    
    o1.style.webkitTransitionTimingFunction = "ease-in";
    o1.style.webkitTransitionDuration = "0.5s";
    o1.style.webkitTransform = "translate3d("+tempX+"px, "+tempY+"px, 0)";
    this._movingShortcutsCount++;
    o1.addEventListener("webkitTransitionEnd", function(e){
      if(e.propertyName == "-webkit-transform"){
        self._ontransitionEnd(e, o2, tempY, tempX);
        e.target.removeEventListener("webkitTransitionEnd", arguments.callee);
        self._movingShortcutsCount--;
      }
    });
  },
  
  /**
   * 사용자가 Shortcut의 삭제 Badge를 터치했을 때 발생되는 이벤트를 처리한다.
   * 이때 같이 전달 받는 payload는 없음(undefined)
   * @param {tau.rt.Event} e {@link tau.ui.Shortcut.EVENT_DELETE} 이벤트
   * @param {Object} payload 이벤트와 같이 전달되는 데이터
   * 객체(없음)
   */
  handleShortcutDelete: function (e, payload) {
    var shortcut = e.getSource();
    tau.confirm('앱('.concat(shortcut.getTitle(),')을 삭제하시겠습니까?'), {
      title: '확인', 
      callbackFn: function(returnVal){
        if (returnVal === true) {
          window.setTimeout(function () {
            tau.getRuntime().fireEvent(
                tau.rt.Event.RT_UNINSTALL, shortcut.getName());
          }, 200);
        }
      }
    });
  },
  
  /**
   * 사용자가 Dashboard의 Shortcut을 터치했을 때 발생하는 이벤트를 처리한다. 사용자가
   * 터치한 Shortcut을 확인하고 해당 앱을 실행시킨다. 만약 Shortcut이 아닌 Board를
   * 터치했을 때 현재 Editing모드이면 Editing모드를 해제한다.
   * @param {tau.rt.Event} e 사용자가 Shortcut을 터치했을 때 발생하는
   * {@link tau.rt.Event.TAP} 이벤트
   */
  handleBoardTap: function (e) {
    if(this._movingShortcutsCount != 0){
      return false;
    }
    var src = e.getSource();
    if (!(src instanceof tau.ui.Shortcut) && this._editable) {
      this._editable = false;
      this.toggleDeletable(this._editable);      
      this.swingback(this._FORCE_SWINGBACK);
    } else if (src instanceof tau.ui.Shortcut && !this._editable) {
      tau.getRuntime().fireEvent(tau.rt.Event.RT_START, src.getName());
    }
  },
  
  /**
   * 기기의 Orientation이 변경되었을 때 Dashboard의 Short Layout을 변경한다.
   * @param {tau.rt.Event} e Orientation Change 이벤트
   */
  handleOrientationChange: function (e) {
    this.swingback(this._FORCE_SWINGBACK);
    this._panel.render(true);    
  },
  
  /**
   * Module에 badge 값이 변경되었을 경우 발생되는 이벤트를 처리한다. 이때 변경되는 bage의
   * 값은 payload로 전달된다.
   * @see tau.rt.Module.EVENT_BADGESET
   * @param {tau.rt.Event} e Badge가 변경되었을 때 발생되는 이벤트
   */
  handleBadgeChanage: function (e, payload) {
    var shortcut, src = e.getSource();
    if (src instanceof tau.rt.Module) {
      if (shortcut = this._panel.findShortcut(src.getName())) {
        shortcut.setBadge(payload); // payload is badge value;
      }
    }
  },
  
  /**
   * flag의 상태에 따라 Shortcut에 삭제 Badge를 출력하거나 삭제한다.
   * @param {Boolean} flag true이면 삭제 Badge를 출력 그렇지 않으면 삭제
   */
  toggleDeletable: function (flag) {
    var shortcuts =  this._panel.getComponents();
    for (var i = 0, len = shortcuts.length; i < len; i++) {
      if (shortcuts[i].isMutable()) {
        shortcuts[i].deletable(flag);
      }
    }
  },
  
  /**
   * Dashboard를 커스터마이징하기 위한 확장 메소드이며 기본으로 제공되는 Dashboard를
   * 커스터마이징하고자 할 경우 이 메소드를 Override해서 구현한다. 이 메소드에서 생성되는
   * UI는 Dashboard에서 상단에 위치하게 된다. 이 메소드를 통해 반환되는 객체는
   * {@link tau.ui.Component}>의 인스턴스이어야 한다.
   * @return {tau.ui.Component} Dashboard의 상단에 추가할 UI
   */
  loadHeader: function () {
    
    var banner = new tau.ui.Panel({baseStyleClass: 'tau-dashboard-banner'});
    var logo = new tau.ui.Label({
      text:"Mobello",
      styles:{
        padding:"5px",
        font:"20px/1.5em TrebuchetMS",
        color:"white",
        "font-weight": "bold",
        "text-shadow": "0 -1px 0 rgba(0,0,0,0.3)"
          }});
    banner.add(logo);
    
    return banner;
  },

  /**
   * Dashboard에 Shortcut을 출력하는 Panel을 생성하여 반환한다. Dashboard를 커스터마이징
   * 하고자 할 경우 상속받은 클래스에서 이 메소드를 Override하지 않도록 권고한다. 이 메소드를
   * 통해 생성되는 Panel은 UI Framework에서 제공하는 동작을 구현하고 있으므로 사용자가
   * 직접 수정할 경우 예기치 않는 오류가 발생할 수 있다.
   * @returns {tau.ui.Panel} Shortcut이 출력되는 Panel 객체
   */
  loadShortcutPanel: function () {
    var self = this;
    var db = this._db,
        panel = new tau.ui.Panel({styles: {width: '100%'}}),
        overrides = { // override methods definition
      /**
       * 현재 Shortcut Panel에 출력을 위한 컬럼개수를 반환한다. 만약 Device의 넓이가
       * 최대 Shortcut을 출력할 수 있는 개수를 초과할 경우 최대 출력 가능한 컬럼 개수를
       * 반환한다.
       * @private
       */
      _getCols: function () {
        var o = tau.senseOrientation();
        var cols = (o == 'landscape') ? db.getMaxCols() : db.getCols();
        var availcols = window.parseInt(tau.getWidth()/70);
        //70px is optimal width of shortcut
        return (availcols < cols) ? availcols : cols;
      },
      
      /**
       * Shortcut을 Rendering하기 위해 Layout을 잡는다.
       * @private
       */
      render: function (refresh) {
        var width = tau.getWidth();
        var height = tau.getHeight();
        
        self.widthAlpha = 80;
        self.heightAlpha = 90;

        self.widthMin = 80;
        self.widthMax = 200;
        
        self.heightMin = 90;
        self.heightMax = tau.rt.isIPad ? 120 : self.heightMin; 
        
        self.ipadPortraitWidth = 768;
        self.ipadLandScapeHeight = 768;
        
        self.widthAlpha = width / (width > self.ipadPortraitWidth ? 5 : 4);          
        self.widthAlpha = Math.min(Math.max(self.widthAlpha, self.widthMin), self.widthMax);
        self.heightAlpha = height / (height > self.ipadLandScapeHeight ? 5 : 4);          
        self.heightAlpha = Math.min(Math.max(self.heightAlpha, self.heightMin), self.heightMax);
          
        
        var i, parent, len,
            comps = this.getDrawableComponents();            

        parent = this.getDOM();        
        var dashboardSection = parent.firstChild;        
        if(!dashboardSection || refresh){

          if (refresh && dashboardSection) { // fix location here!
            parent.removeChild(dashboardSection);
            comps = this.getComponents();
          }          
          dashboardSection = document.createElement('div');
          parent.appendChild(dashboardSection);
          
          self._ul = document.createElement("ul");
          dashboardSection.appendChild(self._ul);
          
          
          dashboardSection.setAttribute("class", "tau-dashboard_section");

          self._ul.setAttribute("class", "tau-dashboard_ul");
        }

        self._ul = dashboardSection.firstChild;
        var li = null;
        var subDiv = null;

        for (len = this.getComponents().length, i = len - comps.length;
        i < len; i++) {
          comp = refresh ? comps[i] : comps.shift();
          comp.clear();
          
          li = document.createElement("li");
          li.setAttribute("class", "dashboard_li");
          li.setAttribute("shortcut_name", comp._name);
          li.style.width= (0 + self.widthAlpha)+"px";
          li.style.height= (0 + self.heightAlpha)+"px";
          
          subDiv = document.createElement("div");
          subDiv.style.width = (0 + self.widthAlpha)+"px";
          subDiv.style.height = (0 + self.heightAlpha)+"px";
          subDiv.setAttribute("class", "shortcuts movable");
          li.appendChild(subDiv);
          self._ul.appendChild(li);
          
          comp.draw(subDiv);
        }       
        
        self.setInitialPosition();
//        if(self._drifter){
//          self.makeMutable();
//        }
        if(refresh === false){
          this.balloonConfig = {
              top:{
                initialPosTop: -200,              
                initialPosLeft: 30,
                className: "addToHomeIpad",
                translateAmount: 210
              },
              
              bottom:{
                initialPosTop: -200,              
                initialPosLeft: 40,
                className: "addToHomeIphone",
                translateAmount: 417                
              }              
          };
          if(tau.rt.isIPad || tau.rt.isIPhone){
            this.balloonConfig.OSVersion = navigator.appVersion.match(/OS (\d+_\d+)/i);
            this.balloonConfig.OSVersion = this.balloonConfig.OSVersion[1] ? +this.balloonConfig.OSVersion[1].replace('_', '.') : 0;
          }else{
            this.balloonConfig.OSVersion = -1;
          }
          
          this.balloonConfig.firstVisit = localStorage.getItem('addToHomeVisit') == null;
  
          if (!self.balloon 
              && window.navigator.standalone === false 
              && (tau.rt.isIPad || tau.rt.isIPhone)){
            //window.navigator.standalone === false){
            //when navigator.standalone is NOT undefined and is false.
             this.showBalloon(
                "Install this web app on your device: tap '%icon' and " +
                "then 'Add to Home Screen'.");
          }
          if (this.balloonConfig.firstVisit 
              && !self.balloon 
              && window.navigator.standalone === true 
              && (tau.rt.isIPad || tau.rt.isIPhone)){
            this.showBalloon(
                "Long touch this portion to open 'system dock'"
                , true, 20, null, true);
          }
        }
      },
      
      showBalloon: function(text, position, spacer, delay, addSession){
        var cfg = tau.rt.isIPad && position !== true ? this.balloonConfig.top : this.balloonConfig.bottom;        
        
        self.balloon = document.createElement('div');
        self.balloon.id='addToHomeScreen';
         
        self.balloon.className = cfg.className;
        self.balloon.style.cssText += 'position:absolute; top:'+(cfg.initialPosTop)+'px; left:'+(cfg.initialPosLeft)+'px';
        self.balloon.innerHTML = text.replace('%icon', this.balloonConfig.OSVersion >= 4.2 ? '<span class="addToHomeShare"></span>' : '<span class="addToHomePlus">+</span>');
        self.balloon.innerHTML += '<span class="addToHomeArrow"></span>';
        self.balloon.innerHTML += '<span class="addToHomeClose">\u00D7</span>';

        var sceneDOM = self.getScene().getDOM();
        sceneDOM.appendChild(self.balloon);
        
        

        if(tau.rt.isIPhone || position === true){
          cfg.initialPosLeft = (tau.getWidth() / 2) - (self.balloon.offsetWidth / 2);
          self.balloon.style.cssText += 'position:absolute; top:'+(cfg.initialPosTop)+'px; left:'+(cfg.initialPosLeft)+'px';
        }
        
        self.balloon.addEventListener("click", function(e){
          sceneDOM.removeChild(e.currentTarget);
          if(addSession){
            localStorage.setItem('addToHomeVisit', 1);
          }              
        });
        window.setTimeout(function(){
          self.balloon.style.webkitTransitionDuration = "1s";
          self.balloon.style.webkitTransitionTimingFunction = "ease-out";
          if(tau.rt.isIPhone || position === true){
            cfg.translateAmount = (-(cfg.initialPosTop) + tau.getHeight()) - self.balloon.offsetHeight - 10;
          }
          self.balloon.style.webkitTransform = 'translate3d(0,' + (cfg.translateAmount - (tau.isNumber(spacer) ? spacer : 0)) + 'px,0)';              
          
          self.balloon.addEventListener("webkitTransitionEnd", function(e){
            setTimeout(function(){
              if(self.balloon){
                sceneDOM.removeChild(e.target);
                if(addSession){
                  localStorage.setItem('addToHomeVisit', 1);
                }       
              }
            }, 5000);
          });
        }, tau.isNumber(delay)?delay:2000);
      },

      /**
       * 현재 Panel에 출력된 Shortcut 컴포넌트들 중에서 주어진 이름의 Shortcut을 찾아
       * 반환한다. 만약 해당하는 이름(name)의 Shurtcut컴포넌트가 존재하지 않으면
       * null을 반환한다.
       * @param {String} name Shurtcut컴포넌트의 이름
       * @private
       */
      findShortcut: function (name) {
        var shortcuts = this.getComponents();    
        for (var i = 0, len = shortcuts.length; i < len; i++) {
          if (name === shortcuts[i].getName()) {
            return shortcuts[i];
          }
        }
        return null;
      },
      
      /**
       * Dashboard에서 지정된 Shortcut을 삭제한다. 삭제된 Shortcut 자리에는
       * 이후에 있는 Shortcut들이 자동으로 자리를 채우게 된다.
       * @param {tau.ui.Shortcut} shortcut 삭제하고자 하는 Shortcut 객체
       * @private
       */
      removeShortcut: function (shortcut) {          
        var shortcuts = this.getComponents(),
            idx = shortcuts.indexOf(shortcut),
            dom = shortcut.getDOM(),
            parent = dom.parentNode;
        var selfIndex = self.indexOf(parent);
        var drifterIndex = self.indexOf(self._drifter);
        shortcuts.splice(idx, 1);
        parent.removeChild(dom);
        (function shift() { // parent is always TD tag
          if (parent.nextSibling) {
            parent = parent.nextSibling;
          } else if (parent.parentNode.nextSibling) {
            parent = parent.parentNode.nextSibling.firstChild;
          } else { // last one - empty node so, delete it!
            if (parent.parentNode.childNodes.length > 1) {
              parent.parentNode.removeChild(parent);
            } else { // remove TR tag
              parent.parentNode.parentNode.removeChild(parent.parentNode);
            }
            parent = null;
          }
          if (parent) {
            dom = parent.firstChild;
            if (parent.previousSibling) {
              parent.previousSibling.appendChild(dom);
            } else {// first
              parent.parentNode.previousSibling.lastChild.appendChild(dom);
            }
            window.setTimeout(shift, 150);
          }
        })();

        if(drifterIndex < 0 || drifterIndex == selfIndex){
          self.swingback(self._FORCE_SWINGBACK);
          if(selfIndex == 0){
            self._drifter = self._ul.children[0];
          }else if(selfIndex > 0){
            self._drifter = self._ul.children[selfIndex -1];
          }
          self.makeMutable(self._drifter.firstChild);
        }      
      }
    };
    return tau.mixin(panel, overrides, true);
  },
  
  /**
   * Dashboard를 커스터마이징하기 위한 확장 메소드이며 기본으로 제공되는 Dashboard를
   * 커스터마이징하고자 할 경우 이 메소드를 Override해서 구현한다. 이 메소드에서 생성되는
   * UI는 Dashboard에서 하단에 위치하게 된다. 이 메소드를 통해 반환되는 객체는
   * <code>tau.ui.Component</code>의 인스턴스이어야 한다.
   * @return {tau.ui.Component} Dashboard의 하단에 추가할 UI
   */
  loadFooter: function () {
    // do nothing
  },
  
  /** 
   * Lifecycle 메소드로서 Dashboard 앱에 종료될 때 호출되는 Callback메소드이다. 
   */
  destroy: function () {
    var rt = tau.getRuntime();
    rt.unsubscribeEvent(tau.rt.Event.ORIENTATION, this.handleOrientationChange, this);
    rt.unsubscribeEvent(tau.rt.Module.EVENT_BADGESET, this.handleBadgeChanage, this);
    rt.unsubscribeEvent(tau.rt.Event.RT_INSTALLED, this.handleInstallation, this);
    delete this._db;
    delete this._panel;
    tau.log.info('Destroying \"$dashboard\"', this);
  }
});

//------------------------------------------------------------------------------
/**
 * @lends tau.ui.TableSceneController.prototype
 */
$class('tau.ui.TableSceneController').extend(tau.ui.SceneController).define({
  
  /**
   * 새로운 TableSceneController객체를 생성한다.
   * @class
   * TableSceneController는 Table 컴포넌트를 사용하는 Scene을
   * 만들 때 테이블 처리 기능을 쉽게 할 수 있도록 만은
   * 클래스이다. 이 클래스를 이용해 데이터 로딩, TableCell
   * 객체 생성등과 같은 작업들을 편리하게 수행할 수 있다.<p/>
   * 현재는 가장 기본적인 기능만 구현되어 있으며 향후
   * 편집모드등 부가적인 기능들이 추가될 예정이다.<p>
   * 추가적인 기능을 구현하려면 이 클래스를 상속받아 필요한
   * 메소드를 Override하면 된다.
   * @constructs
   * @extends tau.ui.SceneController
   * @see tau.ui.SceneController
   */
  TableSceneController: function () {
    
  },
  
  /**
   * 초기화 작업을 수행한다. 이 메소드 내에서
   * {@link tau.rt.Event.RT_CTRL_CHANGE}를 {@link tau.rt.Runtime}에 등록한다.
   * @see tau.ui.Controller#init
   */
  init: function () {
    tau.ui.TableSceneController.$super.init.apply(this, arguments);
    var rt = tau.getRuntime();
    rt.onEvent(tau.rt.Event.RT_CTRL_CHANGE, this.controllerChanged, this);
  },
  
  /**
   * 사용할 Default 테이블 컴포넌트를 로딩한다.
   * @see tau.ui.SceneController#loadScene
   */
  loadScene: function () {
    var table = this.getTable();
    if (!table) { // table component can be set in init() method
      this.getScene().add(new tau.ui.Table());
    }
  },

  /**
   * Scene이 로딩된 이후의 작업을 수행한다. 이 메소드 내에서는
   * 사용할 각종 이벤트 리스너들을 등록한다.
   * @see tau.ui.SceneController#sceneLoaded
   */
  sceneLoaded: function () {
    var table = this.getTable();
    if (!(table instanceof tau.ui.Table)) {
      throw new TypeError('Specified Component is not Table Component: ' 
          + table + this.currentStack());
    }
    table.onEvent(tau.ui.Table.EVENT_MODEL_LOAD, this._handleModelLoad, this);
    table.onEvent(tau.ui.Table.EVENT_CELL_LOAD, this._handleCellLoad, this);
    table.onEvent(tau.rt.Event.SELECTCHANGE, this._handleCellSelected, this);
    table.loadModel(true);

    this._orientation = tau.senseOrientation() || (tau.getHeight() + ',' + tau.getWidth());
  },
  
  /**
   * {@link tau.ui.Table.EVENT_MODEL_LOAD} 이벤트에 대한
   * 리스터 메소드. 내부적으로 loadModel()메소드를 호출한다.
   * 이 메소드의 결과 값이 0 보다 크면
   * {@link tau.ui.TableSceneController#addNumOfCells}메소드를
   * 호출한다.
   * @private
   * @param {tau.rt.Event} e {@link tau.ui.Table.EVENT_MODEL_LOAD} 이벤트
   * @param {Object} payload 이벤트와 같이 전달되는 데이터 객체
   */
  _handleModelLoad: function (e, payload) {
    var table = e.getSource(),
        count = this.loadModel(payload.start, payload.size);
    if (count && count > 0) {
      table.addNumOfCells(count);
    }
  },
  
  /**
   * {@link tau.ui.Table.EVENT_CELL_LOAD} 이벤트 처리를 위한
   * 핸들러 메소드. 내부적으로
   * {@link tau.ui.TableSceneController#makeTableCell}메소드를
   * 호출하고 결과를 테이블 컴포넌트에 추가한다.
   * @private 
   * @param {tau.rt.Event} e {@link tau.ui.Table.EVENT_CELL_LOAD} 이벤트
   * @param {Object} payload 이벤트와 같이 전달되는 데이터
   * 객체
   */
  _handleCellLoad: function (e, payload) {
    var table = e.getSource(),
        cell = this.makeTableCell(payload.index, payload.offset);
    if (cell && cell instanceof tau.ui.TableCell) {
      table.add(cell);
    }
  },
  
  /**
   * {@link tau.rt.Event.SELECTCHANGE} 이벤트 처리를 위한
   * 핸들러 메소드. 사용자가 TalbleCell을 터치했을 때 발생되는
   * 이벤트를 처리한다.
   * @private
   * @param {tau.rt.Event} e {@link tau.rt.Event.SELECTCHANGE} 이벤트
   * @param {Object } payload 이벤트와 같이 전달되는 데이터
   * 객체
   */
  _handleCellSelected: function (e, payload) {
    this.cellSelected(payload.current, payload.before);
  },
  
  /**
   * TableSceneController에 의해 관리되는 {@link tau.ui.Table}
   * 객체를 반환한다.
   * @returns {tau.ui.Table} 테이블 컴포넌트
   */
  getTable: function () {
    var comps = this.getScene().getComponents();
    return (comps.length && comps.length > 0) ? comps[0] : null;
  },
  
  /**
   * {@link tau.rt.Event.RT_CTRL_CHANGE} 이벤트를 처리하기
   * 위한 핸들러 메소드. Controller가 변경되었을 때 현재
   * 선택된 TableCell을 선택해제시킨다.
   * @param {tau.rt.Event} e {@link tau.rt.Event.RT_CTRL_CHANGE} 이벤트
   * @param {Object} payload payload object
   */
  controllerChanged: function (e, payload) {
    var table, 
        cur = this,
        src = e.getSource(),
        ceil = payload.fg.ctrl;
    if (!src instanceof tau.ui.SequenceNavigator) {
      return;
    }
    while (cur instanceof tau.ui.Controller) {
      if (cur === ceil) { // if hits ceil controller
        table = this.getTable();
        if (table) {
          var o = tau.senseOrientation() || (tau.getHeight() + ',' + tau.getWidth());
          if (o !== this._orientation) {
            this._orientation = o;
            table.refresh();
          }
          table.clearSelection();
        }
        break;
      }
      cur = cur.getParent();
    }
  },
  
  /**
   * 모델 데이터를 로딩한다. 데이터를 로딩하기 위해서는
   * 상속받은 클래스에서 이 메소드를 반드시 Override해서
   * 구현해야 한다.
   * @example
   * $class('sample.Foo').extend(tau.ui.TableSceneController).define({
   *   ...
   *
   *   loadModel: function (start, size) {
   *     var table = this.getTable(),
   *         offset = start + size;
   *
   *     function loaded(resp) {
   *       if (resp.status === 200) {
   *         this.model = resp.responseJSON;
   *         if (offset < this.model.length) {
   *           size = this.model.length - offset;
   *         }
   *         table.addNumOfCells(size);
   *       }
   *     }
   *     tau.req({ // call sync
   *       type: 'JSONP',
   *       jsonpCallback:'jsoncallback',
   *       url: this.url,
   *       callbackFn: tau.ctxAware(loaded, this)
   *     }).send();
   *   },
   *
   *   ...
   * });
   * @param {Number} start 로딩할 행의 시작 인덱스(inclusive)
   * @param {Number} size 로딩할 TableCell의 개수
   * @returns {Number} 로딩된 데이터의 개수
   */
  loadModel: function (start, size) {
    return -1;
  },
  
  /**
   * 새로운 {@link tau.ui.TableCell}객체를 생성하여 반환한다.
   * 새로운 TableCell을 생성하기 위해서는 이 메소드를
   * Override해서 해당 기능을 구현하면 된다. <p/>
   * 첫번째 파라미터인 index는 offset을 기준으로 몇번째
   * TableCell인지를 나타내며, offset은 이전까지 테이블에
   * 로딩된 TableCell의 개수를 나타낸다.
   * @example
   * $class('sample.Foo').extend(tau.ui.TableSceneController).define({
   *   ...
   *
   *   makeTableCell: function(index, offset) {
   *     var cell = new tau.ui.TableCell();
   *     cell.setTitle(this.model[offset + index].title);
   *     return cell;
   *   },
   *
   *   ...
   * });
   *
   * @param {Number} index offset을 기준으로 상대적인 인덱스
   * @param {Number} offset 이전까지 테이블에 로딩된 전체
   * TableCell의 개수
   * @returns {tau.ui.TableCell} 새로 생성된 {@link tau.ui.TableCell}객체
   */
  makeTableCell: function (index, offset) {
    return null;
  },
  
  /**
   * 상용자가 테이블의 선택되지 않은 셀을 터치할 때 호출되는
   * 콜백 메소드. 사용자 정의 기능을 추가하려면 이 메소드를
   * Override해서 구현하면 된다.
   * @param {tau.ui.TableCell} current 현재 선택된 TableCell 객체
   * @param {tau.ui.TableCell} before 이전에 선택됐던 TableCell 객체
   */
  cellSelected: function (current, before) {
    // do nothing
  },
  
  /**
   * 현재 TableSceneControllr에서 사용된 모든 리소스를
   * 해제한다.
   * @see tau.ui.SceneController#destroy
   */
  destroy: function () {
    tau.ui.TableSceneController.$super.destroy.apply(this, arguments);
    tau.getRuntime().unsubscribeEvent(
        tau.rt.Event.RT_CTRL_CHANGE, this.controllerChanged, this);
  }
});

//------------------------------------------------------------------------------
/** @lends tau.ui.PopoverController.prototype */
$class('tau.ui.PopoverController').extend(tau.ui.Controller).define({

  $static: /** @lends tau.ui.PopoverController */ {
    /** getDOM()메소드를 통해 Content HTML DOM을 가져오기 위한 키 */
    CONTENT_KEY : 'content',
    /** getDOM()메소드를 통해 Masking HTML DOM을 가져오기 위한 키 */
    MASKING_KEY : 'masking',
    /** getDOM()메소드를 통해 Direction HTML DOM을 가져오기 위한 키 */ 
    DIRECTION_KEY : 'direction',
    /** Popover 창이 나타나게 될 위치 지정: 상단  */ 
    UP_DIRECTION : 'up',
    /** Popover 창이 나타나게 될 위치 지정: 하단  */ 
    DOWN_DIRECTION : 'down',
    /** Popover 창이 나타나게 될 위치 지정: 왼쪽  */ 
    LEFT_DIRECTION : 'left',
    /** Popover 창이 나타나게 될 위치 지정: 오른쪽  */ 
    RIGHT_DIRECTION : 'right'
  },

  /**
   * 생성자, 새로운 PopoverController객체를 생성한다.
   * <p/>{@link tau.ui.Controller} 플로팅된 Layer형태 나타나게 한다.
   * <p/>
   * <p/>
   * <code>PopoverController</code>의 크기는 생성자에 전달되는 width, height를 객체 타입으로 아래와 같이 전달한다. 
   * size값을 생성자에 전달하지 않으면 기본값은 width 300px , height 500px로 지정되어 있다.
   * @example 
   *  var popoverCtrl = new tau.ui.PopoverController({
   *      width: '300px',
   *      height: '500px'
   *    });
   * @class 
   * 현재 스크린에 대한 포커스를 잃지 않고 작은 영역에 추가적인 내용을 보여주기 위한 용도로 사용한다.
   * PopoverController는 플로팅 한 영역을 잡아주는 역할을 하며, 그 안에 내용은 
   * presentCtrl 함수에 전달되는 {@link tau.ui.Controller}들이 채우는 역할을 한다.
   * @constructs
   * @extends tau.ui.Controller
   * @param {String} [opts.width] PopoverController의 넓이 크기(px단위)  
   * @param {String} [opts.height] PopoverController의 높이 크기(px단위) 
   * 
   * 
   */
  PopoverController: function (size) {
    this._directionSize = 10; //direction 삼각형 만드는 border사이즈.
    var borderWidth = tau.util.dom.getStyleFromCssRule('.tau-popoverController', 'border-width');
    var paddingWidth = tau.util.dom.getStyleFromCssRule('.tau-popoverController', 'padding');
    this._contentMargin = 0; //content를 감싸는 껍데기의 두께(border와 padding으로 구성됨).  
    //px support 체크
    if (borderWidth) {
      if ('px' === borderWidth.substring(borderWidth.length - 2)) {
        borderWidth = parseInt(borderWidth, 10);
        this._contentMargin += borderWidth*2;
      } else {
        throw new TypeError('Only Support pixel unit , Modify border-width of tau-popoverController ')
      }
    }
    
    if (paddingWidth) {
      if ('px' === paddingWidth.substring(paddingWidth.length - 2)) {
        paddingWidth = parseInt(paddingWidth, 10);
        this._contentMargin += paddingWidth*2;
      } else {
        throw new TypeError('Only Support pixel unit , Modify padding of tau-popoverController ')
      }
    } 
    
    //width 총합 체크 
    
    if (size) {
      if (typeof size != 'object') {
        throw new TypeError('Specified size is not object type '
            + size);
      }
    
      this.size = {
        width : parseInt(size.width) + this._contentMargin +'px',
        height : parseInt(size.height) + this._contentMargin + 'px'
      }; 
    } else {
      this.size = {width : '306px', height : '506px'};
    }
    
    this._controller = null;
    this._targetComponent = null;
    
    this.visible = false;
  },
  /**
   * Override 메소드이며 초기화 작업을 수행한다.
   * @see tau.ui.Controller.init
   */
  init: function () {
    this.$renderData = this.renderer.initialize();
    var rt = tau.getRuntime();
    rt.onEvent(tau.rt.Event.ORIENTATION, this._handleOrientationChange, this);
    
    //Chrome Browser Bug about CSS
    var cssRules = document.styleSheets[0].cssRules || document.styleSheets[0].rules;
    if (cssRules === null) {
           
      var rootDom = this.getDOM();
      
      var themeName = tau.getRuntime().$themeMgr._getDefaultThemeName();
      
      if('ios' === themeName) {
        this._contentMargin = 14;
      } else {
        this._contentMargin = 6;
      }
      
      this.size.width = parseInt(this.size.width) + this._contentMargin + 'px';
      this.size.height = parseInt(this.size.height) + this._contentMargin + 'px';
      
    }
    
  },
  /**
   * doStart 함수는 lifecycle 관련 메소드로 시스템이 호출하므로 직접적으로 호출하지 않는다.
   */
  doStart: function () {
    tau.ui.PopoverController.$super.doStart.apply(this, arguments);
  },
  /**
   * propagateEvent 함수는 Event관 메소드로 시스템이 호출하므로 직접적으로 호출하지 않는다.
   */
  propagateEvent: function (e) {
    tau.ui.PopoverController.$super.propagateEvent.apply(this, arguments);
  },
  /**
   * PopoverController가 차지하는 영역에서 주어진 파라미터(key)에 따라 해당되는 DOM객체를
   * 반환한다. 만약 key가 지정되지 않으면 현재 PopoverController 최상위 DOM앨리먼트를
   * 찾아 반환한다. 만약 PopoverController Content영역에 해당하는 DOM앨리먼트를
   * 반환하고자 한다면 'tau.ui.CONTENT_KEY'를 사용하면 된다.
   * 
   * @param {String} key NavigationController의 각 영영에 해당되는 키 값
   * @returns {HTMLElement} DOM element
   */
  getDOM: function (key) {
    return this.renderer.getParentElement(this.$renderData, key);
  },
  /**
   * 현재 컨트롤러의 모든 하위{@link tau.rt.EventDelegator}을 반환한다.:
   * 컨포넌트 히트 테스트에서 사용됨.
   * @returns {Array} 하위(EventDelegators)을 가지는 배열
   */
  getSubDelegators: function () {
    var children = 
      tau.ui.PopoverController.$super.getSubDelegators.apply(this,arguments) || [];
    children.push(this._controller);
    return children;
  },
  
  /**
   * PopoverController가 현재 보여지는 상태인지 리턴한다.
   * 
   * @param {String} key NavigationController의 각 영영에 해당되는 키 값
   * @returns {Boolean} Popover의 보여지는 상태값
   */
  isVisible: function () {
    return this.visible;
  },
  /**
   * <code>PopoverController</code>를 화면에 표시하게 하는 함수이다.
   * <code>presentCtrl</code>함수는 2개의 필수 파라미터를 필요로 한다. 
   * 1번째는 플로팅된 영역에 내용을 채워주는 controller이다.
   * 2번째는 <code>PopoverController</code>의 위치의 기준점에 해당하는 component이다.
   * <p/>
   * popover된 <code>PopoverController</code>의 삭제 처리는 두가지 방법으로 설정할 수 있다.
   * toggle방식과 masking 방식이다. toggle 방식은 생성 이벤트가 다시 호출 되면 이미 생성된 
   * <code>PopoverController</code>가 삭제된다. masking 방식은 <code>PopoverController</code>의 
   * 영역이외 부분을 터치하게 되면 자동으로 <code>PopoverController</code>는 삭제 처리 된다. toggle은 기본 값이다.
   * masking 처리를 하려면 opts값에 masking : true 값을 입력하면 된다. 
   * <p/>
   * <code>PopoverController</code>가 나타날 때 파라미터인 component에 기준으로 어느 쪽에 표시되게 할 지 설정할 수 있다. 
   * 방향은 상하좌우 4가지로 설정할 수 있다. DOWN 방향이 기본 값이다.
   * <pre>
   * {
   *  masking: true | false, 
   *      - default false
   *  direction: tau.ui.PopoverController.UP_DIRECTION
   *       | tau.ui.PopoverController.DOWN_DIRECTION
   *       | tau.ui.PopoverController.LEFT_DIRECTION
   *       | tau.ui.PopoverController.RIGHT_DIRECTION 
   *      - default tau.ui.PopoverController.DOWN_DIRECTION
   * 
   * }
   * </pre> 
   * <p/>
   * !! 주의 사항 !!
   * 파라미터로 전달되는 controller는 <code>PopoverController</code>가 삭제될 때 같이 삭제 처리 된다.
   * 따라서 <code>PopoverController</code>를 나타나게 하는 이벤트에서 controller의 생성자함수를 통해 
   * 새로 생성해서 파라미터로 전달 하여야 한다.
   * 
   * @example
   * this.button.OnEvent(tau.ui.Event.TAP,function () {
   *  this.popover = new PopoverController({ width : '200px', height : '300px' });
   *  var ctrl = new com.web.PopoverScene(); //사용자가 만든 controller
   *  this.popover.presentCtrl(ctrl, this.tabbarButton, {
   *    masking : true,
   *    direction : tau.ui.PopoverController.RIGHT_DIRECTION  
   *    });
   * 
   * });
   * 
   * 
   * @param {tau.ui.Controller} ctrl 
   * @param {tau.ui.Component} component
   * @param {Object} [opts] <code>PopoverController</code>를 표시하기 위한 옵션
   * @param {Boolean} [opts.masking] toggle이 방식이 아닌 masking처리 방식으로 삭제 처리 
   * @param {String} [opts.direction] direction 의 4가지 방향 
   * <ul>
   *  <li><code>'tau.ui.PopoverController.UP_DIRECTION'</code></li>
   *  <li><code>'tau.ui.PopoverController.DOWN_DIRECTION'</code></li>
   *  <li><code>'tau.ui.PopoverController.LEFT_DIRECTION'</code></li>
   *  <li><code>'tau.ui.PopoverController.RIGHT_DIRECTION'</code></li>
   * </ul>
   * @param 

   */
  presentCtrl: function (ctrl, component, opts) {
    if (!ctrl instanceof tau.ui.Controller) {
      throw new TypeError('Specified controller is not an instance of '
          + 'tau.ui.Controller: ' + ctrl);
    }
    if (!component instanceof tau.ui.Component) {
      throw new TypeError('Specified component is not an instance of '
          + 'tau.ui.Component: ' + component);
    }
    var masking = false;
    var direction = tau.ui.PopoverController.DOWN_DIRECTION;
    if (opts) {
      if (opts.masking) {
        if (typeof  opts.masking !== 'boolean') {
          throw new TypeError("Specified opts.masking is not boolean type :"
              + opts.masking);
        }
        masking = opts.masking;
      }
      if(opts.direction){
        if (opts.direction !== tau.ui.PopoverController.DOWN_DIRECTION
            && opts.direction !== tau.ui.PopoverController.UP_DIRECTION
            && opts.direction !== tau.ui.PopoverController.LEFT_DIRECTION
            && opts.direction !== tau.ui.PopoverController.RIGHT_DIRECTION) {
          throw new TypeError("Specified opts.direction is incorrect value :"
              + opts.direction);
        }
        direction = opts.direction;
      }
    }
    if (this.visible) {
      this.dismiss();
    } else {
      this.doStart();
      this._controller = ctrl;
      this._targetComponent = component;
      var scene = component.getScene();
      var rootCtrl = tau.getRuntime().getModule().getRootController();
      var position = this._getPositionPopoverCtrl(component.getDOM(), direction);
      var directionPosition = this._getDirectionPos(
          component.getDOM() , direction , this._directionSize);
      this.visible = true;
      //popover position
      var popoverDom = this.getDOM();
      popoverDom.style.top = position.y+'px';
      popoverDom.style.left = position.x+'px';
      //popover size
      popoverDom.style.width = this.size.width;
      popoverDom.style.height = this.size.height;
      //popover content size
      var popoverContentDom = this.getDOM(tau.ui.PopoverController.CONTENT_KEY);
      popoverContentDom.style.width = parseInt(this.size.width)
                                      -this._contentMargin + 'px';
      popoverContentDom.style.height = parseInt(this.size.height)
                                      -this._contentMargin + 'px';
      //direction position
      var popoverDirectionDom = this.getDOM(tau.ui.PopoverController.DIRECTION_KEY);
      popoverDirectionDom.style.top = directionPosition.y + 'px';
      popoverDirectionDom.style.left = directionPosition.x + 'px';
      this._settingDirectionStyle(popoverDirectionDom, direction);
      //Event
      tau.arr(rootCtrl.$subDelegators).pushUnique(this);
      ctrl.setParent(this);
      //insert DOM
      tau.util.dom.appendChild(scene.getDOM(), this.getDOM());
      //masking
      var maskingDom = this.getDOM(tau.ui.PopoverController.MASKING_KEY);
      if (masking) {
        var that = this;
        this._maskingFn = function () {
          that.dismiss();
        };
        if (tau.rt.hasTouch) {
          maskingDom.addEventListener('touchend',this._maskingFn);
        } else {
          maskingDom.addEventListener('click',this._maskingFn);
        }
        
      } else {
        maskingDom.style.display = 'none';
      }
      //starting
      ctrl.doStart();
    }    
  },
  /**
   * <code>PopoverController</code>를 삭제하는 함수이다.
   */
  dismiss: function () {
    if (this._maskingFn) {
      var maskingDom = this.getDOM(tau.ui.PopoverController.MASKING_KEY);
      if (tau.rt.hasTouch) {
        maskingDom.removeEventListener('touchend',this._maskingFn);
      } else {
        maskingDom.removeEventListener('click',this._maskingFn);        
      }
      
      this._maskingFn = null;
    }  
    var rt = tau.getRuntime();
    rt.unsubscribeEvent(tau.rt.Event.ORIENTATION, this._handleOrientationChange, this);
    var rootCtrl = rt.getModule().getRootController();  
    tau.arr(rootCtrl.$subDelegators).remove(this);
    this.visible = false;
    this.renderer.release(this.$renderData);
    this._controller.setParent(null);
    this._controller.removeBubble(this);
    this._controller = null;
    this._targetComponent = null;
    this.doDestroy();
  },
  
  /**
   * doDestroy 함수는 lifecycle 관련 메소드로 시스템이 호출하므로 직접적으로 호출하지 않는다.
   */
  doDestroy: function () {
    tau.ui.PopoverController.$super.doDestroy.apply(this, arguments);
  },
  
  /**
   * resize시 <code>PopoverController</code>를 삭제하는 이벤트 핸들
   * @private 
   */
  _handleOrientationChange : function () {
    this.dismiss();
  },
  
  /**
   * <code>PopoverController</code>가 위치해야할 x, y 좌표를 리턴
   * @private
   * @param element component의 element 
   * @param direction <code>PopoverController</code>의 direction
   * @returns {object}
   */
  _getPositionPopoverCtrl : function (element, direction) {
    var result = { x : null , y : null };
    var winWidth = window.innerWidth;
    var winHeight = window.innerHeight;
    var xy = tau.util.dom.getXY(element);
    var elementLeft = xy[0];
    var elementTop = xy[1];
    var position = {
        x : elementLeft+element.offsetWidth/2,
        y : elementTop+element.offsetHeight/2
    };
    var popoverSize = this.size;
    var paddingSize = 5;
    var directionSize = this._directionSize;
    var areaPosition = this._checkPosition(position.x, position.y);
    var checkWidthSize = parseInt(popoverSize.width)/2 + paddingSize;
    var checkHeightSize = parseInt(popoverSize.height)/2 + paddingSize;
    ////up and down direction X좌표 위치 찾기.
    //position이 왼쪽에 쏠려 있으면 popover의 width를 고려해서 위치를 잡는다.
    //1. element의 x좌표가 popover width/2보다 크면 가운데 위치 시킨다.
    //2. element의 x좌표가 popover width/2보다 작으면 왼쪽에 paddingSize 떨어진 곳에 위치시킨다.
    if (direction === tau.ui.PopoverController.DOWN_DIRECTION
        || direction === tau.ui.PopoverController.UP_DIRECTION) {
      if (areaPosition.areaX == 2) {
        if ((winWidth - position.x) > checkWidthSize) {
          result.x = position.x - parseInt(popoverSize.width)/2;
        } else {
          result.x = winWidth - parseInt(popoverSize.width) - paddingSize;
        }
      } else {
        //area 왼쪽 또는 가운데는 사이즈 체크후 위치 체크
        if (position.x > checkWidthSize) {
          //가운데 위치 시키다.
          result.x = position.x - parseInt(popoverSize.width)/2;
        } else {
          //왼쪽으로 쏠려 있게 위치 시키다.
          result.x = paddingSize;
        }
      }
      if (direction === tau.ui.PopoverController.UP_DIRECTION) {
        result.y = position.y - directionSize - parseInt(popoverSize.height) - element.offsetHeight/2;
      } else {
        result.y = position.y + directionSize + element.offsetHeight/2;
      }
    } else {
      ////left and right direction Y좌표 위치 찾기.
      //position이 오른쪽에 쏠려 있으면 popover의 width를 고려해서 위치를 잡는다.
      //1. element의 y좌표가 popover height/2보다 크면 가운데 위치 시킨다.
      //2. element의 x좌표가 popover height/2보다 작으면 아래에 paddingSize 떨어진 곳에 위치시킨다.
      if (areaPosition.areaY == 2) {
        if ((winHeight - position.y) > checkHeightSize) {
          result.y = position.y - parseInt(popoverSize.height)/2;
        } else {
          result.y = winHeight - parseInt(popoverSize.height) - paddingSize;
        }
      } else {
        if (position.y > checkHeightSize) {
          result.y = position.y - parseInt(popoverSize.height)/2;
        } else {
          result.y = paddingSize;
          }
      }
      if (direction === tau.ui.PopoverController.LEFT_DIRECTION) {
        result.x = position.x - parseInt(popoverSize.width) - directionSize - element.offsetWidth/2;
      } else {
        result.x = position.x + directionSize + element.offsetWidth/2;
      }
    }
    return result;
  },
  
  /**
   * 4구역으로 분할하여 현재 x, y 좌표가 어느쪽 구역인지 리턴함
   * @private 
   * @param x element의 중심 x좌표 
   * @param y element의 중심 y좌표 
   * @returns {object}
   */
  _checkPosition : function (x, y) {
    var winWidth = window.innerWidth;
    var winHeight = window.innerHeight;
    //width 구역을 2구역으로 나눔 왼쪽 , 오른쪽 구석
    var widthRange = winWidth/2;
    //height 구역을 2구역으로 나눔 위쪽 , 아래쪽 구석
    var heightRange = winHeight/2;
    var result = { areaX : 2, areaY : 2 };
    //areaX: 1은 왼쪽구석 , 2는 오른쪽 구석
    //areaY: 1은 위쪽구석 , 2는 아래쪽 구석
    if (x <= widthRange) {
      //왼쪽구석이다.
      result.areaX = 1;
    }
    if (y <= heightRange) {
      //위쪽 구석이다.
      result.areaY = 1;
    }
    return result;
  },
  /**
   * direction 에 따른 삼각형의 위치좌표값을 리턴한다.
   * @private 
   * @param element component의 element 
   * @param direction
   * @param directionSize
   * @returns {x,y}
   */
  _getDirectionPos : function (element, direction, directionSize) {
    var result = {x : null, y : null};
    var xy = tau.util.dom.getXY(element);
    var elementLeft = xy[0];
    var elementTop = xy[1];
    var position = {
        x : elementLeft+element.offsetWidth/2,
        y : elementTop+element.offsetHeight/2
      };
    var eleOffsetHeightHalf = element.offsetHeight/2;
    var eleOffsetWidthHalf = element.offsetWidth/2;
    switch (direction) {
    case tau.ui.PopoverController.UP_DIRECTION:
      result.x = position.x - directionSize;
      result.y = position.y - eleOffsetHeightHalf - directionSize;
      break;
    case tau.ui.PopoverController.DOWN_DIRECTION:
      result.x = position.x - directionSize;
      result.y = position.y + eleOffsetHeightHalf;
      break;
    case tau.ui.PopoverController.RIGHT_DIRECTION:
      result.x = position.x + eleOffsetWidthHalf;
      result.y = position.y - directionSize;
      break;
    case tau.ui.PopoverController.LEFT_DIRECTION:
      result.x = position.x - eleOffsetWidthHalf - directionSize;
      result.y = position.y - directionSize;
      break;
    }
    return result;
  },
  
  /**
   * direction에 맞게 삼각형을 스타일을 setting
   * @param dom direction 삼각형의 dom객체 
   * @param direction 
   */
  _settingDirectionStyle : function (dom, direction) {
    switch (direction) {
    case tau.ui.PopoverController.UP_DIRECTION:
      dom.style.borderRightColor = 'transparent';
      dom.style.borderLeftColor = 'transparent';
      dom.style.borderBottomWidth = '0px';
      break;
    case tau.ui.PopoverController.DOWN_DIRECTION:
      dom.style.borderRightColor = 'transparent';
      dom.style.borderLeftColor = 'transparent';
      dom.style.borderTopWidth = '0px';
      break;
    case tau.ui.PopoverController.RIGHT_DIRECTION:
      dom.style.borderTopColor = 'transparent';
      dom.style.borderBottomColor = 'transparent';
      dom.style.borderLeftWidth = '0px';
      break;
    case tau.ui.PopoverController.LEFT_DIRECTION:
      dom.style.borderTopColor = 'transparent';
      dom.style.borderBottomColor = 'transparent';
      dom.style.borderRightWidth = '0px';
      break;
    }
  }
});
