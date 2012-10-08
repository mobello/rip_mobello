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

  //Browser agent
  var _USERAGENT = navigator.userAgent.toLowerCase(),

      // Runtime singleton instance
      _RT = null, 

      // Default Mobello Icon path
      _ICONPATH = 'lib/resources/tauicon.png',

      // Default Splash image path
      _SPLASHPATH = 'lib/resources/tausplash.png',

      // Relative path for Applications
      _APPSPATH = 'apps/',

      // Shared folder path
      _SHAREDPATH = 'shared/',

      // Default Runtime configuration
      _RTCONFIG = {
        id              : 'Mobello_PLATFORM', // Platform ID
        version         : tau.VER,        // Runtime version
        timeout         : 3000,           // App timeout in ms (3 secs.)
        multiInstance   : false,          // Allows multiple same App instances
        gracefulErrors  : false           // Logs/Throws exceptions (true/false) 
      };

  /**
   * Returns header's script URLs
   * @private
   * @returns {array} List of URL strings
   */
  function _headerScriptUrls() {
    var i, p, len, scripts,
        urls = [],
        head = document.getElementsByTagName('head')[0];
    if (head) {
      scripts = head.getElementsByTagName('script');
      for (i = 0, len = scripts.length; i < len; i++) {
        p = scripts[i].src.indexOf('?'); // Remove appended parameters
        urls.push(p === -1 ? scripts[i].src : scripts[i].src.substring(0, p));
      }
    }
    return urls;
  }

  /**
   * Returns a module's full name with its id.
   * @private
   * @param {String} m Module object
   * @returns {String} Full module name
   */
  function _appNameId(m) {
    return m ? m.getName() + ' (' + m.getId() + ')' : 'Undefined';
  }

  /**
   * Returns a resolved URL for a relative (application) resource.
   * <p/>
   * Resource path must begin with a "/", "$shared", or be a full URL.
   * @private
   * @param {String} path App-relative path must be '/' prefixed
   * @param {String} appName Application name (optional)
   * @returns {String} Resolved path for the application name 
   */
  function _resolvePath(path, appName) {
    path = path.trim();
    var a = path.charAt(0) === '/';
    if ('$dashboard' == appName) {
      path = a ? path.substring(1): path;
    } else {
      if (appName && a) {
        path = _APPSPATH + appName.trim() + path;
      } else if (a) {
        path = '..' + path;
      } else if (/^\$shared\//.test(path)) {
        path = path.replace(/^\$shared\//, _SHAREDPATH);
      } else if (!/^(\w+:)?\/\/\/?/.test(path)) {
        tau.log.error('Relative resource must begin with "/": ' + path, 'tau.rt');
        return null;
      }
    }
    a = document.createElement('a');
    a.href = path;
    return a.href;
  }


  /**
   * Runtime API appended to Mobello root namespace
   */
  tau.namespace('tau', 
  /** @lends tau */ 
  {
    /**
     * Singleton으로 생성관리되는 Runtime객체를 반환한다.
     * @returns {Object} Singleton {@link tau.rt.Runtime} 객체
     * @see tau.rt.Runtime
     */
    getRuntime: function () {
      if (!_RT) {
        _RTCONFIG.singleApp = tau.getLauncherParam('app');
        _RTCONFIG.dev = ('true' === tau.getLauncherParam('dev'));
        _RT = new tau.rt.Runtime(_RTCONFIG);
      }
      return _RT;
    },

    /**
     * 현재 모듈에 대한 configuration정보를 반환한다.
     * <p/>
     * 모듈 이름이 명시되면 해당 모듈에 해당하는
     * configuration정보를 찾아 반환하며 그렇지 않을 경우 현재
     * 동작하고 있는 모듈의 configuration정보를 반환한다.
     * @param {String} [name] configuration정보를 찾고자하는 모듈의 이름
     * @returns {Object} 모듈의 configuration정보
     */
    getConfig: function (name) {
      return tau.getRuntime().getModuleConfig(name);
    },

    /**
     * 현재 실행되고 있는 application의 Context정보를 반환한다.
     * @returns {tau.rt.ApplicationContext} 현재 실행중인
     * 모듈의 {@link tau.rt.ApplicationContext}
     * @see tau.rt.ApplicationContext
     */
    getCurrentContext: function () {
      var app = tau.getRuntime().getModule();
      if (app instanceof tau.rt.Application) {
        return new tau.rt.ApplicationContext(app);
      }
      return null;
    }
  });


  /**
   * @name tau.rt
   * @namespace Mobello의 Runtime Module들을 정의한다.
   */
  tau.namespace('tau.rt', /** @lends tau.rt */ {
    /** 
     * 현재 실행중인 디바이스가 안드로이드 단말인지 확인한다.
     * 반환한다.
     * @type Boolean 
     */
    isAndroid: /android/i.test(_USERAGENT),
    /** 
     * 현재 실행중인 디바이스가 안드로이드2 단말인지 확인한다.
     * @type Boolean 
     */
    isAndroidVer2: /android 2./i.test(_USERAGENT),
    /** 
     * 현재 실행중인 디바이스가 아이패드 단말인지 확인한다.
     * @type Boolean 
     */
    isIPad: /ipad/i.test(_USERAGENT),
    /** 
     * 현재 실행중인 디바이스가 아이폰 단말인지 확인한다.
     * @type Boolean 
     */
    isIPhone: /iphone/i.test(_USERAGENT),
    /** 
     * 현재 실행중인 브라우저가 webkit기반 브라우저인지 확인한다.
     * @type Boolean 
     */
    isWebkit: /webkit/i.test(_USERAGENT),
    /** 
     * 현재 실행중인 브라우저가 chrome 브라우저인지 확인한다.
     * @type Boolean 
     */
    isChrome: /chrome/i.test(_USERAGENT),
    /** 
     * 현재 실행중인 브라우저가 safari 브라우저인지 확인한다.
     * @type Boolean 
     */
    isSafari: /safari/i.test(_USERAGENT),
    /** 
     * 현재 실행중인 브라우저가 IE 브라우저인지 확인한다.
     * @type Boolean 
     */
    isIE: /msie/i.test(_USERAGENT),
    /** 
     * 현재 실행중인 디바이스가 orientationchange 지원하는지
     * 확인한다.
     * @type Boolean 
     */
    hasOrientationChange: ('onorientationchange' in GLOBAL),
    /** 
     * 현재 실행중인 디바이스가 touch 이벤트를 지원하는지 확인한다.
     * @type Boolean 
     */
    hasTouch: ('ontouchstart' in GLOBAL) && !/chrome/i.test(_USERAGENT),
    /** 
     * 현재 실행중인 디바이스가 3D를 지원하는지 확인한다.
     * @type Boolean 
     */
    has3D: ('WebKitCSSMatrix' in GLOBAL && 'm11' in new WebKitCSSMatrix())
  });


  /** @lends tau.rt.Event */
  $class('tau.rt.Event').define({ //$ tau.rt.Event
    $static: /** @lends tau.rt.Event */{
      /**
       * 탭 이벤트. 화면을 터치한 상태에서 움직이지 않고 뗄 경우 발생
       * @type String
       */
      TAP: 'tap',
      /**
       * 터치 시작 이벤트. 화면에 터치되는 순간 발생
       * @type String
       */
      TOUCHSTART: 'touchstart',
      /**
       * 터치 이동 이벤트. 화면에 터치한 상태에서 떼지않고 이동할 경우 발생 
       * @type String
       */
      TOUCHMOVE: 'touchmove',
      /** 
       * 터치 종료 이벤트. 터치한 다음 화면에서 뗄 경우 발생 
       * @type String
       */
      TOUCHEND: 'touchend',
      /** 
       * 터치 취소 이벤트. Runtime에서 발생하는 이벤트이며 시스템 처리를 위해
       * 사용자 이벤트를 취소시키고자 할 경우 발생
       * @type String
       */
      TOUCHCANCEL: 'touchcancel',
      /** 
       * Gesture 시작 이벤트
       * @type String
       */
      GESTURESTART: 'gesturestart',
      /**
       * Gesture 이동 이벤트
       * @type String
       */
      GESTUREMOVE: 'gesturechange',
      /** 
       * Gesture 종료 이벤트
       * @type String
       */
      GESTUREEND: 'gestureend',
      /** 
       * css3 transition이 종료된 후 발생되는 이벤트
       * @type String
       */
      TRANSITIONEND : 'webkitTransitionEnd',
      /** 
       * Component가 Container에 추가되면 발생되는 이벤트 
       * @type String
       */
      COMPADDED: 'compadded',
      /** 
       * Component가 Container에 제거되면 발생되는 이벤트
       * @type String
       */
      COMPREMOVED: 'compremoved',
      /** 
       * Component가 draw된 후 발생되는 이벤트 
       * @type String
       */      
      COMPDRAWN: 'compdrawn',
      /** 
       * Component의 root DOM element가 DOM tree에서 삭제된 후 발생되는 이벤트
       * @type String
       */            
      COMPCLEAR: 'compcleared',
      /** 
       * Scene이 로딩된 직후 발생되는 이벤트
       * @type String
       */
      SCENELOADED: 'sceneloaded',
      /**
       * Scene이 그려진 직후 발생되는 이벤트 
       * @type String
       */
      SCENEDRAWN: 'scenedrawn',
      /** 
       * 값이 변경된 직후 발생되는 이벤트 
       * @type String
       */
      VALUECHANGE: 'valueChange',
      /** 
       * 사용자 선택이 변경된 직후 발생되는 이벤트 
       * @type String
       */
      SELECTCHANGE: 'selectChange',
      /** 
       * Orientation 변경 이벤트 
       * @type String
       */
      ORIENTATION: 'orientationchange',
      
      /** 
       * Ajax 요청이 전송된 직후 발생되는 이벤트 
       * @type String
       */
      REQ_SENT: 'requestsent',
      /** 
       * Ajax 결과를 받은 직후 발생되는 이벤트 
       * @type String
       */
      REQ_RECEIVED: 'requestreceived',
      /** 
       * Ajax 요청이 취소될 경우 발생되는 이벤트 
       * @type String
       */
      REQ_ABORTED: 'requestaborted',

      /**
       * Runtime Lifecycle에서 INSTALL시 발생되는 이벤트 
       * @type String
       */
      RT_INSTALL: 'runtimeinstall',
      /**
       * Runtime Lifecycle에서 UNINSTALL시 발생되는 이벤트 
       * @type String
       */
      RT_UNINSTALL: 'runtimeuninstall',
      /** 
       * Runtime Lifecycle에서 특정 앱을 실행 직후 발생되는 이벤트 
       * @type String
       */
      RT_START: 'runtimestart',
      /** 
       * Runtime Lifecycle에서 특정 앱을 중지할 때 발생되는 이벤트 
       * @type String
       */
      RT_STOP: 'runtimestop',
      /** 
       * Runtime Lifecycle에서 특정 앱을 시작할 때 발생되는 이벤트 
       * @type String
       */
      RT_LAUNCH: 'runtimelaunch',
      /**
       * Runtime Lifecycle에서 Runtime이 종료될 때 발생되는 이벤트 
       * @type String
       */
      RT_TERMINATE: 'runtimeterminate',
      /** 
       * Runtime Lifecycle에서 설치과정을 종료한 직후 발생되는 이벤트 
       * @type String
       */
      RT_INSTALLED: 'runtimeinstalled',
      /** 
       * Runtime Lifecycle에서 UNINSTALL과정을 종료한 직후 발생되는 이벤트 
       * @type String
       */
      RT_UNINSTALLED: 'runtimeuninstalled',
      /** 
       * Runtime Lifecycle에서 theme이 load된 직후 발생되는 이벤트 
       * @type String
       */
      RT_THEME_LOADED: 'runtimethemeloaded',
      /** 
       * Runtime Lifecycle에서 theme이 load가 되고 사용가능하게 된 직후 발생되는 이벤트
       * @type String
       */
      RT_THEME_ENABLED: 'runtimethemeenabled',
      /** 
       * Runtime에서 모듈(Module)이 foreground background로 변경될 때 발생되는 이벤트
       * @type String
       */
      RT_APP_CHANGE: 'appchange',
      /** 
       * Controller가 foreground 또는 background로 변경될 때 발생되는 이벤트 
       * @type String
       */
      RT_CTRL_CHANGE: 'controllerchange',
      /** 
       * 이벤트의 단계중 CAPTURING단계를 나타낸다.
       * @type Number
       */
      CAPTURING_PHASE: 1,
      /** 
       * 이벤트의 단계중 TARGET단계를 나타낸다.
       * @type Number
       */
      AT_TARGET: 2,
      /** 
       * 이벤트의 단계중 BUBBLING단계를 나타낸다. 
       * @type Number
       */
      BUBBLING_PHASE: 3
    },

    /**
     * Mobello에서는 자체정의된 이벤트 시스템을 사용한다.
     * Mobello에서 제공하는 UI 컴포넌트로 부터 발생되는 다양한
     * 이벤트는 tau.rt.Event 객체를 나타낸다.<p/>
     * UI관련 대부분의 클래스는 tau.rt.EventDelegator를 상속받아
     * 정의된다.
     * @class
     * Mobello에서 사용되는 클래스를 정의한다.
     * @constructs
     * @param {String} name 이벤트 이름
     * @param {tau.rt.EventDelegator} source 이벤트가 발생되는 {@link tau.rt.EventDelegator} 객체
     * @param {Array} touches 현재 화면을 터치했을 때 손가락별
     * 터치정보
     * @param {Array} targetTouches 동일한 노드에서 시작한 터치정보를 필터일한다.
     * @param {Array} changedTouches 이벤트를 최초 발생시킨 터치정보
     */
    Event: function (name, source, touches, targetTouches, changedTouches) {
      this._name = name;
      this._source = source;
      this._alwaysBubble = false;
      this._stopPropagation = false;
      this._preventDefault = false;
      /**
       * 이벤트가 밸생된 시점의 timestamp정보
       * @type Date
       */
      this.timeStamp = new Date();    
      /**
       * 발생된 이벤트의 단계를 나타낸다.<p/>
       * 디벤트 단계는 각각 {@link tau.rt.Event.CAPTURING_PHASE},
       * {@link tau.rt.Event.AT_TARGET}, {@link tau.rt.Event.BUBBLING_PHASE}
       * 가 있다.
       *
       * @type Number
       */
      this.eventPhase = 0; // NONE, if user created mannually
      
      // Touch Event members
      if (touches) {
        this.touches = touches;
        this.targetTouches = targetTouches || touches;
        this.changedTouches = changedTouches || touches;
      }
    },

    /**
     * 현재 이벤트 이름을 반환한다.
     * @returns {String} 이벤트 명 
     */
    getName: function () {
      return this._name;
    },

    /**
     * 이벤트가 발생된 원본객체({@link tau.rt.EventDelegator})를 반환한다.
     * @returns {Object} EventDelegator 객체 
     */
    getSource: function () {
      return this._source;
    },

    /**
     * 이후의 이벤트 propagation작업을 취소한다. 따라서 Bubbling
     * up단계에 등록된 이벤트 리스너는 동작하지 않는다.
     */ 
    stopPropagation: function () {
      this._stopPropagation = true;
    },

    /**
     * 이벤트의 default function이 수행되지 않도록 한다.
     */
    preventDefault: function () {
      this._preventDefault = true;
    },

    /**
     * 발생된 이벤트가 적어도 한개의 이벤트 리스너에 의해
     * 처리되었다면 이 이벤트는 더이상 propagation되지 않는다.
     * 하지만 alwaysBubble() 메소드를 호출하면 이벤트가
     * 처리되더라도 계속해서 Bubbling되도록 한다.
     */
    alwaysBubble: function () {
      this._alwaysBubble = true;
    }
  });


  /** @lends tau.rt.EventPublisher.prototype */
  $class('tau.rt.EventPublisher').define({
    /**
     * 명시된 파라미터를 이용하여 새로운 EventPublisher 객체를
     * 생성한다.
     * @class
     * EventPublisher는 이벤트가 발생되면 해당 이벤트 리스너와
     * 바인딩 시키는 작업을 수행한다.<p/>
     * 이 클래스의 주요 기능은 callback function 등록
     * 및 관리하고 이벤트가 발생될 시점에 해당
     * callback function들이 정상적으로 호출될 수 있도록 한다.
     * <p/>
     * 또한 이벤트 발생과정의 상태, 기본 동작,
     * 예외상황처리 등을 처리한다. 예를 들어,
     * 사용자가 이벤트를 더이상 propagation시키지
     * 않고자 할 경우 stopPropagation()메소드를
     * 호출하여 더이상 이벤트가 bubbling되지
     * 않도록 할 수 있다.
     * @constructs
     * @param {String} name 이벤트 명
     * @param {Object} source 이벤트를 발생시킨 원본 {@link tau.rt.EventDelegator}객체 
     * @param {Object} [opts] 이벤트 옵션 
     * @param {Function} [opts.antecedentFn] 이벤트 발생시
     * 가장 먼저 호출될 핸들러
     * @param {Function} [opts.defaultFn] 이벤트 발생시
     * 최종적으로 호출될 핸들러
     * @param {Function} [opts.stoppedFn] 이벤트가 중단되었을
     * 때 호출될 핸들러
     * @param {Boolean} [opts.alwaysBubble = false] true이면 항상 이벤트가
     * Bubbling될도록 한다. 
     * @param {Boolean} [opts.alwaysDefault = true] true이면 항상
     * defaultFn 핸들러가 수행되도록 한다. 
     * @param {Boolean} [opts.gracefulErrors = false] false이면 오류 발생시
     * 더이상 진행하지 않고 즉시 중단한다.
     * @throws {Error} 이벤트 이름 또는 source가 명시되지 않을
     * 경우
     */
    EventPublisher: function (name, source, opts) {
      if (!name || !source) {
        throw new Error("tau.rt.EventPublisher: invalid parameters.");
      }
      /** @private Event name */
      this._name = name;
      /** @private Source EventDelegator from which the event ware fired */
      this._source = source;

      this.init(opts);
    },

    /**
     * 이벤트를 초기화하거나 재설정 한다.
     * <p/>
     * 파라미터를 'null' 또는 'undefined' 로 설정할 경우 모든 이벤트
     * 상태를 리셋한다.
     * @param {Object} [opts] 이벤트 옵션 
     * @param {Boolean} [keepListeners] true이면 이전에 등록된
     * 리스너들을 유지시킨다.
     * @returns {tau.rt.EventPublisher} this 객체
     */
    init: function (opts, keepListeners) {
      /** @private Event Options */
      this._opts = tau.mixin({
        /**
         * The foremost function that is to be called before all other 
         * registered event listeners. In general, initialization/startup code 
         * for a set of event listeners are implemented here.
         * @param {Object} event {@link tau.rt.Event} instance
         * @param {Object} payload Data object to be delivered to the listener
         */
        antecedentFn: function (event, payload) {},

        /**
         * The final function to be called after all the registered event 
         * listener callbacks have been executed. In general, cleanup 
         * code for a set of event listeners are implemented here.
         * <p/>
         * If only a single static routine is required for a particular event, 
         * this routine should be implemented.
         * @param {Object} event {@link tau.rt.Event} instance
         * @param {Object} payload Data object to be delivered to the listener
         */
        defaultFn: function (event, payload) {},

        /**
         * This function is called when an event's propagation have been halted 
         * by calling {@link Event.stopPropagation}.
         * @param {Object} event {@link tau.rt.Event} instance
         * @param {Object} payload Payload instance to deliver to event handler
         */
        stoppedFn: function (event, payload) {},

        /**
         * Disabling <code>alwaysBubble</code> will prevent any further bubbling 
         * up if an event listener was handled within the EventDelegator.
         */
        alwaysBubble: false,

        /**
         * Disabling <code>alwaysDefaults</code> will prevent any calls to
         * <code>antecedentFn</code> & <code>defaultFn</code> during bubbling 
         */
        alwaysDefault: true,

        /**
         * Disabling <code>gracefulErrors</code> will stop the rest of the event 
         * propagation if an exception occurs within an event listener.
         * @type Boolean
         */
        gracefulErrors: false
      }, opts, true);

      if (!keepListeners) {
        /** @private Registered event callback functions */
        this._listeners = []; // {$fn: xxx, $contexts: []}
      }

      return this;
    },

    /**
     * 현재 이벤트의 이름을 반환한다.
     * @returns {String} 이벤트 명
     */
    getName: function () {
      return this._name;
    },

    /**
     * 이벤트가 발생된 원본 객체를 반환한다.
     * @returns {tau.rt.EventDelegator} 이벤트를 발생시킨 원본 객체
     * @see tau.rt.EventDelegator
     */
    getSource: function () {
      return this._source;
    },

    /**
     * 등록된 모든 callback 리스너 함수들을 반환한다. 
     * @param {Boolean} [capture = false] true이면 capture단계에
     * 등록된 모든 리스너들을 반환하고 그렇지 않을면 bubble up단계의
     * 리스너들을 반환한다.
     * @returns {Array} callback이벤트 리스너 함수 배열
     */
    getListeners: function (capture) {
      var listeners = this._listeners,
          results = [],
          phase = capture ? 1 : 2;
      for (var i = 0, len = listeners.length; i < len; i++) {
        if ((listeners[i].$fn.capture & phase) == phase) { // BIT-AND operation
          results.push(listeners[i]);
        }
      }
      return results;
    },

    /**
     * 이벤트에 등록된 모든 callback 리스너들을 실행한다.
     * <p/>
     * event propagation중 {@link tau.rt.Event.stopPropagation}을
     * 호출하면 더이상 bubbling을 진행하지 않고
     * EventPublisher의 stoppedFn 함수가 호출된다.
     * <p/>
     * 추가적으로 {@link tau.rt.Event.preventDefault}을 호출하면
     * EventPublisher의 defaultFn 함수가 호출된다.
     * @param {tau.rt.Event} event 이벤트 객체
     * @param {Object} [payload] 리스너에게 전달될 데이터 객체
     * @return {Number} 호출된 리스너의 개수
     */
    notifyListeners: function (event, payload) {
      var i, len, ctxs, listeners,
          phase = event.eventPhase;
  
      if (phase == tau.rt.Event.AT_TARGET) { // retrieve both phase listeners
        listeners = this.getListeners(true);
        var add = this.getListeners(false);
        listeners = (listeners.length > 0) ? listeners.concat(add) : add;
        add = null;
      } else {
        listeners = this.getListeners(phase == tau.rt.Event.CAPTURING_PHASE); 
      }
      if ((phase < tau.rt.Event.BUBBLING_PHASE) && this._opts.alwaysDefault) {
        // antecedentFn is invoked on capture and target phase
        this._opts.antecedentFn.apply(this._source, arguments);
      }
      // Execute callback functions for all listeners
      for (i = 0, len = listeners.length; i < len; i++) {
        try {
          ctxs = listeners[i].$contexts;
          for (var j = 0, ctxlen = ctxs.length; j < ctxlen; j++) {
            listeners[i].$fn.apply(ctxs[j] || this._source, arguments);
          }
        } catch (ex) {
          // If graceful errors is set, log error and continue event callback
          if (this._opts.gracefulErrors) {
            tau.log.error('Error occured during event listener: ' + ex, this);
          } else {
            if (ex.stack) { // chrome
              tau.log(ex.stack);
            } else {
              throw ex;
            }
          }
        } finally {
          if (event._stopPropagation) {
            this._opts.stoppedFn.apply(this._source, arguments);
            break;
          }
        }
      }
      return i;
    },
    
    /**
     * 이벤트에 등록된 Default 실행함수를 호출한다.
     * @param {tau.rt.Event} event 이벤트 객체
     * @param {Object} [payload] 리스너에게 전달될 데이터 객체
     */
    notifyDefault: function (event, payload) {
      var src = event.getSource();
      if (!event._preventDefault 
          && (src === this._source || this._opts.alwaysDefault)) {
        this._opts.defaultFn.apply(this._source, arguments);
      }
    },
    
    /**
     * 명시된 callbackFn을 이용하여 listener 내장 객체를 찾아
     * 반환한다. 만약 발견된 내장객체가 없으면
     * <code>null</code>을 반환한다. <p/>
     * 반환된 객체는 다음과 같은 형태를 가진다.</p>
     * {$fn: xxx, $contexts: []}
     *
     * @param callbackFn 이벤트 리스너 함수
     * @returns listener 내장 객체
     */
    intern: function (callbackFn) {
      var listeners = this._listeners;
      for (var i = 0, len = listeners.length; i < len; i++) {
        if (listeners[i].$fn === callbackFn) {
          return listeners[i];
        }
      }
      return null;
    },

    /**
     * 이벤트 리스너 함수를 등록한다.
     * @param {Function} callbackFn 등록한 이벤트 리스너 함수
     * @param {Object} [context] callback function에서 this로
     * 사용할 객체. 명시되지 않으면 생성자의 source로 지정된
     * 객체를 사용한다.
     * @param {Boolean} [capture = false] true이면 capture 단계, 
     * 그렇지 않으면 bubble up 단계를 나타낸다.
     * @returns {Boolean} 이벤트 리스너가 성공적으로 등록되었으면
     * true를 반환한다.
     */
    addListener: function (callbackFn, context, capture) {
      if (!tau.isFunction(callbackFn)) {
        throw new TypeError('Specified event listener is not a function: '
            + callbackFn + this.currentStack());
      }
      if (context && !tau.isObject(context)) {
        throw new TypeError('Specified event context is not an Object type: '
            + context + this.currentStack());
      }
      var listener = this.intern(callbackFn);
      // 1(Capture), 2(Bubble), 3 (Both)
      callbackFn.capture |= (capture ? 1 : 2); // BIT-OR operation
      if (!listener) {
        listener = {'$fn': callbackFn, '$contexts': []};
        this._listeners.push(listener);
      }
 
      context = context || this._source;
      if (listener.$contexts.indexOf(context) === -1) {
        listener.$contexts.push(context);
      }
      return true;
    },

    /**
     * 등록된 callback리스너중 명시된 리스너를 삭제한다. 
     * <p/>
     * 파라미터를 사용하지 않고 이 메소드를 호출하면 등록된
     * 모든 리스너들을 삭제한다.
     * @param {Function} callbackFn 삭제하고자 하는 callback 리스너
     * @param {Object} [context] callback리스너와 연관된
     * context 객체
     * @returns {Boolean} 성공적으로 삭제되었으면 true를
     * 반환한다.
     */
    removeListener: function (callbackFn, context) {
      if (callbackFn) {
        // Single listener remove
        var listener = this.intern(callbackFn);
        if (listener) {
          var c = listener.$contexts.indexOf(context || this._source);
          if (c != -1) {
            listener.$contexts.splice(c, 1); // remove
          }
          if (listener.$contexts.length === 0) {
            listener.$fn = undefined;
            this._listeners.splice(this._listeners.indexOf(listener), 1);
          }
        }
      } else {
        // Remove all listeners & contexts
        if (this._listeners.length > 0) {
          this._listeners.splice(0); // delete all elements
        }
      }
      return true;
    }
  });

  /** @lends tau.rt.EventDelegator.prototype */
  $class('tau.rt.EventDelegator').define({
    $static: {
      DOM_CLASS_ID: 'tau' // Defines a EventDelegator for a DOM node
    },

    /**
     * 새로운 EventDelegator객체를 생성한다.
     * @example
     * $class('tau.example.MyClass').extend(tau.rt.EventDelegator).define({
     *   MyClass: function () {
     *     this.publishEvent("interestingMoment", {
     *       antecedentFn: function () {
     *         this.messageIntro = 'This is an interesting message: ';
     *       },
     *       defaultFn: function () {
     *         alert('Some default message.');
     *       }
     *     });
     *   },
     *   ...
     * });
     *
     * @example
     * var myClass = new tau.example.MyClass();
     *
     * myClass.onEvent("interestingMoment", function (event, payload) {
     *   // Prints 'This is an interesting message: e = mc^2'
     *   alert(this.messageIntro + payload);
     * });
     *
     * myClass.fireEvent("interestingMoment", "e = mc^2");
     *
     * @class
     * EventDelegator는 이벤트를 전송하고 받기위해 필요한 허브역할을
     * 수행한다. 뿐만 아니라 상위 EventDelegator와
     * Bubbling관계를 형성한다.
     * <p/>
     * 이 클래스는 다른 Mobello 클래스 정의시 상속받을 수
     * 있으며 이를 통해 이벤트를 publish하고, fire할 수 있으며
     * 또한 등록된 이벤트에 대해 listening을 수행할 수 있다.
     * @constructs
     */
    EventDelegator: function () { //$ tau.rt.EventDelegator
      /** @private Maps event name to tau.rt.EventPublisher */
      this.$publishedEvents = {};
      /** @private Array that manages EventDelegators to bubble up */
      this.$bubbleTargets = [];
    },

    /**
     * 명시된 이벤트 이름과 매핑되는 {@link tau.rt.EventPublisher}를
     * 찾아 반환한다. 만약 기존에 존재하지 않고 create가 true이면
     * 새로운 {@link tau.rt.EventPublisher}를 생성하여 반환한다.
     * <p/>
     * @param {String} name 이벤트 명
     * @param {Boolean} [create] 기존에 존재하지 않는 상태에서 true이면
     * 새로운 EventPublisher를 생성하여 반환한다.
     * @returns {tau.rt.EventPublisher} 이벤트 이름과 매핑되는 
     * {@link tau.rt.EventPublisher} 객체
     */
    getEventPublisher: function (name, create) {
      var e = this.$publishedEvents[name];
      if (!e && create) {
        e = new tau.rt.EventPublisher(name, this);
        this.$publishedEvents[name] = e;
      }
      return e;
    },

    /**
     * 명시된 이벤트 이름과 옵션을 이용하여 이벤트를
     * 공시(publish)한다. 먄약 eventName이 명시되지 않으면
     * null을 반환한다.
     * @param {String} eventName 이벤트 명
     * @param {Object} [opts] 이벤트 옵션
     * @param {Function} [opts.defaultFn] event
     * propagation상에서 제일 마지막에 호출될 핸들러
     * @param {Function} [opts.stoppedFn] event
     * propagation과정이 인위적인 방법으로 중단되었을 경우
     * 호출될 핸들러
     * @returns {tau.rt.EventPublisher} Publish된 객체
     * @see tau.rt.EventPublisher
     * @see tau.rt.EventDelegator.unsubscribeEvent
     */
    publishEvent: function (eventName, opts) {
      if (eventName) {
        var e = this.getEventPublisher(eventName, true);
        if (e) {
          return e.init(opts, true);
        }
      }
      return null;
    },


    /**
     * 명시된 이벤트 이름 또는 이벤트 객체를 이용하여 이벤트를
     * 발생시킨다.
     * <p/>
     * 이벤트가 발생되면 capture단계와 bubbling-up단계를
     * 거치면서 등록된 리스너들을 실행시킨다.
     * <p/>
     * 파라미터 중 delay가 0이상의 값을 가질 경우
     * Async방식으로 등록된 이벤트 리스너가 호출되지만 -1일
     * 경우 Sync 방식으로 이벤트 리스너가 실행되어 시간지체가
     * 발생되지 않는다.
     * @param {String|tau.rt.Event} e 이벤트명 또는 이벤트 객체
     * @param {Object} payload 이벤트 발생시 같이 전송될 데이터 객체
     * @param {Number} delay 실제 이벤트가 발생될 때까지의 시간(milliseconds)
     * @returns {Boolean} 정상적으로 이벤트가 발생되면 true를 반환
     * @exception {TypeError} 이벤트의 source객체가 현재 인스턴스와 다를 경우
     * @see tau.rt.EventDelegator.onEvent
     */
    fireEvent: function (e, payload, delay) {
      var that = this,
          args = arguments;
      if (tau.isString(e)) {
        args[0] = new tau.rt.Event(e, that);
      }
      
      if (e._stopPropagation) {
        return false;
      }
      function fire() {
        that._capture(args[0]);
        if (!args[0]._stopPropagation) {
          args[0].eventPhase = tau.rt.Event.AT_TARGET; // 2; target phase
          that.propagateEvent.apply(that, args);
        }
      };
      if (delay === undefined) delay = 0;
      (delay >= 0) ? window.setTimeout(fire, delay) : fire();
    },
    
    /**
     * process capturing phase for the specified event.
     * @param {tau.rt.Event} e Event Object to handle capturing phase
     * @private
     */
    _capture: function (e) {
      var publisher, path = this.lookupBubbles();
      e.eventPhase = tau.rt.Event.CAPTURING_PHASE;
      
      while (path.length != 0 && !e._stopPropagation) {
        publisher = path.pop().getEventPublisher(e.getName());
        if (publisher) {
          publisher.notifyListeners(e);
        }
      }
      path.splice(0);
    },

    /**
     * 발생된 이벤트를 다음 EventDelegator로
     * propatation시킨다.(bubble-up)
     * <p/>
     * 이벤트는 등록된 콜백 리스너들을 실행히키고 계속해서
     * Bubble-up 과정을 진행해 나간다.
     * @param {Object} Event 객체
     * @param {Object} [payload] 이벤트 발생시 전될되는 데이터 객체
     * @returns {Boolean} 정상적으로 이벤트가 처리되었을 경우 true를 반환
     * @see tau.rt.EventDelegator.fireEvent
     */
    propagateEvent: function (event, payload) {
      if (!event) {
        return false;
      }
      var bubble, 
          fired = false,
          publisher = this.getEventPublisher(event.getName());

      // Fire the antecedent function first, then rest of the event listeners
      if (publisher) {
        fired = publisher.notifyListeners.apply(publisher, arguments) > 0;
      }
      if (event.eventPhase !== tau.rt.Event.BUBBLING_PHASE) {
        event.eventPhase = tau.rt.Event.BUBBLING_PHASE;
      }
      // Continue bubbling up if it wasn't stopped or local event wasn't fired
      if (!event._stopPropagation && (!fired || event._alwaysBubble 
          || (publisher && publisher._opts.alwaysBubble))) {
        bubble = this.getBubble();
        fired = (bubble && bubble.propagateEvent.apply(bubble, arguments));
      }
      // Call final default function if it wasn't prevented
      if (publisher) {
        publisher.notifyDefault.apply(publisher, arguments);
      }
      return fired;
    },

    /**
     * 이벤트가 발생되었을 때 처리할 callback 핸들러를 등록한다.
     * <p/>
     * callback 핸들러는 향후 {@link tau.rt.EventDelegator#fireEvent}
     * 메소드가 호출되었을 때 실행된다.
     * @param {String} eventName 이벤트 명
     * @param {Function} callbackFn 이벤트가 발생되었을 때 수행될 callback 핸들러
     * @param {Object} context callback핸들러 내에서 사용할 'this' 객체.
     * 명시되지 않으면 생성자의 source로 지정된 객체를 사용한다.
     * @param {Boolean} [capture = false] 이벤트 단계를 지정한다. 
     * true이면 capture단계이며 그렇지 않을 경우 bubble-up단계가 된다.
     * @returns {Boolean} 정상적으로 등록되었으면 true를 반환
     * @see tau.rt.EventDelegator.fireEvent
     */
    onEvent: function (eventName, callbackFn, context, capture) {
      var e = this.getEventPublisher(eventName, true);
      if (e) {
        return e.addListener(callbackFn, context, capture);
      }
      return false;
    },
  
    /**
     * 등록된 이벤트의 리스닝을 해제한다.
     * <p/>
     * callbackFn을 기술할 경우 해당 리스너가 사전에 등록되어 있다면
     * 명시된 리스너만 해제시킨다.
     * <p/>
     * 만약 callbackFn이 기술되지 않았거나 null이면 등록된
     * 모든 이벤트와 리스너들을 제거한다.
     * @param {String} eventName 이벤트 명
     * @param {Function} callbackFn 제거할 이벤트 리스너
     * @param {Object} context 이벤트 리스너에사 사용할 'this' 객체
     * @returns {Boolean} 정상적으로 이벤트가 해제되었다면 true를 반환
     * @see tau.rt.EventDelegator.onEvent
     * @see tau.rt.EventDelegator.publishEvent
     */
    unsubscribeEvent: function (eventName, callbackFn, context) {
      var e = this.getEventPublisher(eventName);
      if (e) {
        if (callbackFn) {
          return e.removeListener(callbackFn, context); // Just remove the callback
        } else { // removes all the listeners
          for (eventName in this.$publishedEvents) {
            this.$publishedEvents[eventName].removeListener();
            delete this.$publishedEvents[eventName];
          }
          return true;
        }
      } 
      return false;
    },
    
    /**
     * 객체들의 구조상에서 bubble-up을 거치게 될 모든 target객체들을 
     * 찾아 반환하며 이때 이 메소드를 호출하는 객체 자신은
     * 배제된다. 만약 bubble-up 을 거칠 target객체가 존재하지
     * 않을 겨우 공백의 배열 객체를 반환한다.
     * @return {Array} 현재 자신을 제외한 모든 bubble-up target 객체들을
     * 저장하고 있는 배열
     */
    lookupBubbles: function () {
      var results = [],
          target = this.getBubble();
      while (target) {
        results.push(target);
        target = target.getBubble();
      }
      return results;
    },
    
    /**
     * 현재 인스턴스의 bubble-target 객체를 반환한다. 만약
     * bubble-target 객체가 존재하지 않으면 null을 반환한다.
     * @return {tar.rt.EventDelegator} bubble-target 객체,
     * 없으면 null을 반환
     */
    getBubble: function () {
      return (this.$bubbleTargets.length > 0) ? this.$bubbleTargets[0] : null;
    },

    /**
     * 이벤트가 발생될 경우 bubble-up시킬 target 객체를
     * 설정한다. target 객체로 설정되는 클래스는 
     * {@link tau.rt.EventDelegator}를 상속받아 구현되어야 한다.
     * @param {tau.rt.EventDelegator} eventDelegator Event Delegator 객체
     * @returns {Boolean} 정상적으로 설정되었다면 true를 반환한다.
     * @see tau.rt.EventDelegator.removeBubble
     */
    setBubble: function (eventDelegator) {
      if (eventDelegator instanceof tau.rt.EventDelegator && 
          this !== eventDelegator) {
        return tau.arr(this.$bubbleTargets).pushUnique(eventDelegator);
      }
      return false;
    },

    /**
     * 명시된 bubble-target객체를 제거한다. 이때
     * bubble-target객체는 {@link tau.rt.EventDelegator}를
     * 상속받아야 한다.
     * @param {tau.rt.EventDelegator} eventDelegator Event Delegator 객체
     * @returns {Boolean} 정상적으로 제거되었다면 true를 반환한다.
     * @see tau.rt.EventDelegator.setBubble
     */
    removeBubble: function (eventDelegator) {
      if (eventDelegator instanceof tau.rt.EventDelegator) {
        return !!tau.arr(this.$bubbleTargets).remove(eventDelegator);
      } else if (!eventDelegator) {
        this.$bubbleTargets = [];
      }
      return false;
    }
  });

  /** @lends tau.rt.Gesture.prototype */
  $class('tau.rt.Gesture').define({
    // Gesture states
    $static: /** @lends tau.rt.Gesture */ {
      /** @type Integer */
      STATE_STATIC: 0,
      /** @type Integer */
      STATE_START: 1,
      /** @type Integer */
      STATE_CHANGE: 2,
      /** @type Integer */
      STATE_END: 3
    },

    /**
     * 새로운 Gesture 객체를 생성한다.
     * @class
     * Gesture 에 관한 기능들을 정의한 클래스
     * @constructs
     * @ignore
     */
    Gesture: function () {
      this.eventMgr = tau.getRuntime().$eventMgr;
      this.state = tau.rt.Gesture.STATE_STATIC;
      this.name = 'gesture';
      this.tsStart = new Date();
      this.tsCurrent = new Date();
    },
    start: function (event) {
    },
    change: function (event) {
    },
    end: function (event) {
    },
    cancel: function (event) {
    }
  });

  /** @lends tau.rt.PinchGesture.prototype */
  $class('tau.rt.PinchGesture').extend(tau.rt.Gesture).define({
    /**
     * @class PinchGesture class description goes here
     * @constructs
     * @extends tau.rt.Gesture
     * @ignore
     */
    PinchGesture: function () {
      this.scale = 1;
      this.velocity = 0;
    }
  });

  /** @lends tau.rt.PanGesture.prototype */
  $class('tau.rt.PanGesture').extend(tau.rt.Gesture).define({
    /**
     * @class PanGesture class description goes here
     * @constructs
     * @extends tau.rt.Gesture
     * @ignore
     */
    PanGesture: function (maxTouches, minTouches) {
      this.maxTouches = maxTouches || 1;
      this.minTouches = minTouches || 1;
      this.translation = 0.0;
      this.velocity = 0;
    }
  });
  
  /** @lends tau.rt.RotationGesture.prototype */
  $class('tau.rt.RotationGesture').extend(tau.rt.Gesture).define({
    /**
     * @class RotationGesture class description goes here
     * @constructs
     * @extends tau.rt.Gesture
     * @ignore
     */
    RotationGesture: function () {
      this.rotation = 1;
      this.velocity = 0;
    }
  });
  
  /** @lends tau.rt.LongPressGesture.prototype */
  $class('tau.rt.LongPressGesture').extend(tau.rt.Gesture).define({
    /**
     * @class RotationGesture class description goes here
     * @constructs
     * @ignore
     */
    LongPressGesture: function (duration, numTouches, moveTreshold) {
      this.name = 'longpress';
      this.duration = duration || 100;
      this.numTouches = numTouches || 1;
      this.moveThreshold = moveTreshold || 10;
    },

    start: function (event, touch, track) {
      var me = this,
          gesturesArr = tau.arr(this.eventMgr._gestures);
      tau.log.debug(' Longpress Gesture Start: ' + this.tsCurrent, this);
      gesturesArr.pushUnique(this);
      this.timeoutId = setTimeout(function () {
        if (event._source) {
          tau.log.debug('longpress is due, firing event!', this);
          event._source.propagateEvent(event);
        }
        gesturesArr.remove(me);
      }, this.duration);
    },

    change: function (event, touch, track) {
      var deltaX = touch.pageX - track.pageX, 
          deltaY = touch.pageY - track.pageY,
          absDeltaX = Math.abs(deltaX),
          absDeltaY = Math.abs(deltaY);
      if (absDeltaX > this.moveThreshold || absDeltaY > this.moveThreshold) {
        clearTimeout(this.timeoutId);
        tau.arr(this.eventMgr._gestures).remove(this);
        tau.log.debug('MOVED touch, canceled', this);
      }
    },

    end: function (event, touch, track) {
      if (tau.arr(this.eventMgr._gestures).remove(this)) {
        clearTimeout(this.timeoutId);
        tau.log.debug('clickedup, ending Longpress callback', this);
      }
    },

    cancel: function (event, touch, track) {
      
    }
  });

  /** @lends tau.rt.EventManager.prototype */
  $class('tau.rt.EventManager').define({
    /**
     * 명시된 파라미터를 이용하여 새로운 객체를 생성한다.
     * EventManager객체는 {@link tau.rt.Runtime}에서
     * Signleton으로 생성, 관리된다.
     * @class
     * Mobello의 이벤트 처리 시스템을 위한 기능들을 정의한다.
     * @constructs
     * @param {Object} opt Event Manager 생성 옵션
     * @param {Boolean} [opt.enabled = true] false이면 Mobello의 이벤트 시스템이
     * 동작하지 않음
     * @param {Number} [touchMoveThreshold = 5] Touch Move이벤트가 발생할
     * 때 까지의 최소시간
     * @param {Object} root 이벤트를 리스닝하기 위한 Root DOM 앨리먼트
     */
    EventManager: function (opts, root) { //$ tau.rt.EventManager

      this._opts = tau.mixin(opts, {
        enabled: true,
        touchMoveThreshold: 5, // 5px is ideal
        touchEndThreshold: 25,
        tapThreshold: 8,
        tapHoldInterval: 250,
        tapDoubleThreshold: 800,
        swipeThreshold: 35,
        swipeTime: 1000,
        scrollThreshold: 10,
        scrollResetTime: 300
      });

      /** @private Track history map by track ID */
      this._history = {};
      this._gestures = [];
      this._timeStamp = 0;
      
      /* this is used for preventing mouse move event on PC. There is no
       * need to process mouse move event without mouse button clicking */
      this._mousedown = false;

      // Registration for DOM listeners used by the Mobello Framework
      // By default, document is used because it allows events to be handled
      // when the mouse is moved outside the browser.
      this._root = root || document; //document.getElementById('tau');
      var events = (tau.rt.hasTouch) 
          ? 'click,touchstart,touchmove,touchend,touchcancel,orientationchange'
          : 'click,mousedown,mousemove,mouseup';
      this._listenEvents(this._root, events.split(','), true);

      if (!tau.rt.hasOrientationChange || tau.rt.isAndroid) { // 'resize' event is special case on PC, Android
        this._listenEvents(window, 'resize', true);
      }
      
      events = 'keyup,keydown,keypress,blur,'.concat(tau.rt.Event.TRANSITIONEND);
      this._listenEvents(this._root, events.split(','), true);

      if (tau.rt.isAndroid) this._previousOrientation = 0;
    },
    
    /**
     * registers event listeners for the specified event names(array)
     * @param {Object} from Object(window or DOM) from which listeners listen to
     * @param {Array} names event names to listen to
     * @param {Boolean} capture if true, handles event listeners 
     * on capture phase of DOM event propagation process.
     * @private
     */
    _listenEvents: function (from, names, capture) {
      if (!tau.isArray(names)) {
        names = [names];
      }
      for (var i = 0, len = names.length; i < len; i++) {
        from.addEventListener(names[i], this, capture);
      }
    },
    
    /**
     * 등록된 이벤트가 발생할 경우 처리작업을 수행한다.<p/>
     * 이 메소드는 DOM객체를 통해 직접 이벤트를 listening하며 생성자에서
     * 등록된 모든 이벤트들을 처리한다.
     * @param {Event} e DOM 이벤트
     */
    handleEvent: function (e) {
      if (!this._opts.enabled) {
        return;
      }
      //e.stopPropagation(); // stop propagating events further on
      switch (e.type) {
        case 'mousedown':
          this._mousedown = true;
        case 'touchstart': 
          return this.handleTouchEvent(e, tau.rt.Event.TOUCHSTART);
        case 'mousemove':
          if (!this._mousedown) return;
        case 'touchmove':
          e.preventDefault(); // disable browser default event handler
          if ((e.timeStamp - this._timeStamp) >= 33) { //more than 30fps
            this._timeStamp = e.timeStamp;
            return this.handleTouchEvent(e, tau.rt.Event.TOUCHMOVE);
          }
          break;
        case 'mouseup':
          this._mousedown = false;
        case 'touchend':
          return this.handleTouchEvent(e, tau.rt.Event.TOUCHEND);
        case 'touchcancel':
          return this.handleTouchEvent(e, tau.rt.Event.TOUCHCANCEL);
        case 'orientationchange':
        case 'resize':
          return this.domOrientationChange(e);
        case 'click':
          e.preventDefault(); // disable default browser behavior
          break;
        default :
          return this.domGenericEvent(e);
      }
    },

    /**
     * 이벤트 시스템을 enable/disable시킨다. <p/>
     * 애니메이션 작업이 진행중에 사용자 이벤트를 처리하지 못도하독 하기 위해서는
     * 현재 동작중인 이벤트 시스템을 잠시 중지시킬 필요가 있다. 이때 이 메소드를
     * 활용한다.
     * @param {Boolean} value false일경우 event handling작업을 중지한다.
     */
    setEnable: function (value) {
      this._opts.enabled = !!value;
    },

    /**
     * 현재 실행중인 모듈을 설정한다.
     * @param {tau.rt.Module} module 현재 실행중인 모듈
     * @see tau.rt.Module
     */
    setActiveModule: function (module) {
      this._activeModule = module;
    },

    /**
     * 명시된 DOM 노드로 부터 Mobello객체를 찾아내어 그 id를 반환한다.
     * 만약 발견된 Mobello객체가 없으면 undefined가 반환된다.
     * @param {Object} dom 검색을 하기위한 DOM 객체
     * @returns {String} Mobello객체의 id
     */
    findMobelloObjId: function (dom) {
      var id;
      while (dom) {
        id = dom.id;
        if ((id && tau.util.dom.hasClass(dom, 'tau')) || id === 'tau-root') {
          break;
        }
        dom = dom.parentElement;
      }
      return id;
    },

    /** 
     * 컴포넌트 트리에서 명시된 id와 일치하는 {@link tau.rt.EventDelegator}
     * 객체(컴포넌트)를 찾아 반환한다.<p/>
     * 만약 일치하는 컴포넌트가 존재하지 않으면 null을 반환한다.
     * @param {Object} delegator hit 테스트를 시작하기 위한 부모 
     * EventDelegator 객체
     * @param {String} id 컴포넌트 id
     * @returns {Object} 명시된 id와 일치하는 컴포넌트 객체
     */
    findDelegator: function (delegator, id) {
      var i, children, len, _id = id.split(tau.ui.ID_SEPARATOR)[0];
      if (id && delegator) {
        if (tau.isFunction(delegator.getId) && (delegator.getId(true) == id)) {
          return delegator;
        } else if (delegator.hasOwnProperty(_id)) {
          return delegator[_id];
          
        }
        
        if (tau.isFunction(delegator.getSubDelegators)) {
          // Recursively search children components until hit
          children = delegator.getSubDelegators();
          if (children) {
            if (tau.isArray(children)) {
              for (i = 0, len = children.length; i < len; i++) {
                delegator = this.findDelegator(children[i], id);
                if (delegator) {
                  return delegator;
                }
              }
            } else if (children.hasOwnProperty(_id)) {
              return children[_id];
            }
          } 
        }
      }
      return null;
    },
    
    /**
     * DOM 일리먼트 내에서 Mobello컴포넌트를 찾아내는 작업을 수행한다.<p/>
     * 만약 발견된 컴포넌트가 존재하지 않으면 null을 반환한다.
     * @param {Object} dom hit테스트하기 위한 DOM 객체
     * @returns {Object} Mobello 컴포넌트
     */
    hitTarget: function (dom) {
      var found,
          id = this.findMobelloObjId(dom),
          module = this._activeModule,
          ctrl = module ? module.getActiveDelegator() : null;
      if (id && id !== 'tau-root') {
        found = this.findDelegator(ctrl, id);
        if (found) return found;
        
        var widgets = tau.getRuntime().getSystemWidgets();
        for (var i = 0, len = widgets.length; i < len; i++) {
          // if oid exits, searches designated UI Component
          found = this.findDelegator(widgets[i], id);
          if (found) return found;
        }
      }
      return null;
    },

    /**
     * 일반 DOM 이벤트를 처리한다. <p/>
     * 일반 DOM 이벤트를 받아 {@link tau.rt.EventDelegator}객체가 처리할 수 있는
     * Mobello객체를 생성한다음 이벤트를 발생시킨다.
     * @param {Object} e DOM 이벤트
     * @returns {Boolean} 이벤트가 성공적으로 발생되었다면 true를 반환
     */
    domGenericEvent: function (e) {
      // Find the DOM node's Tau ID, then search & fire Tau-native Event
      var hit = tau.getRuntime().$eventMgr.hitTarget(e.target);
      if (!hit) hit = tau.getRuntime(); // fallback
      return hit.fireEvent(e.type, e.target);
    },
    
    /**
     * orientationchange, resize이벤트를 받아 {@link tau.rt.Event.ORIENTATION}
     * 이벤트를 발생시킨다.
     * @param {Object} e DOM 이벤트
     * @returns {Boolean} 정상적으로 이벤트가 발생되었다면 true를 반환
     */
    domOrientationChange: function (e) {
      var target = e.target;
      if (target === window || target === document) {
        var orientation = window.orientation;
        if (tau.rt.isAndroid) {
          if (orientation !== this._previousOrientation) {
            this._previousOrientation = orientation;
          } else {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        }
        return tau.getRuntime().fireEvent(tau.rt.Event.ORIENTATION, orientation);
      }
      return false;
    },
    
    /**
     * Mobello Framework 영역에서 발생되는 모든 터치 이벤트를 처리한다.
     * @param {Event} e native DOM 이벤트
     * @param {String} name 이벤트 명
     */
    handleTouchEvent: function (e, name) {
      var i, track, event, target,
          touches = tau.rt.hasTouch ? e.changedTouches : [this._mouseTouch(e)];
      for (i = 0; i < touches.length; i++) {
        track = this.trackHistory(touches[i], e, name);
        //if track is undefined(user hasn't touch the screen),
        //no need to generate event in mobile environment
        if (!track) break;
        if (name === tau.rt.Event.TOUCHMOVE && !(track.move && !track.end)) {
          return; // ignore move event if don't meet moving threshold
        }
        event = new tau.rt.Event(name, track.target, touches, 
            e.targetTouches, e.changedTouches);
        target = track.target ? track.target : tau.getRuntime();
        target.fireEvent(event, null, -1); // no delay
        
        if (track.end && !track.move) {
          /** @inner No movement meant that a component was Tapped */
          target.fireEvent(new tau.rt.Event(tau.rt.Event.TAP, 
              track.target, touches, e.targetTouches, e.changedTouches));
        }
      }
    },

    /**
     * 터치 이벤트의 History를 tracking한다. TouchMove 이벤트가 발생할 경우
     * 매번 새로운 이벤트를 생성하는 것이 아니라 기존에 생성된 이벤트를
     * 재활용한다.
     * @param {Object} touch Mobile/Browser TouchPoint
     * @param {Object} e TouchPoint에 대한 DOM 이벤트
     * @param {String} type 이벤트 명
     * @returns {Object} Tracked 터치객체
     */
    trackHistory: function (touch, e, type) {
      var track = this._history[touch.identifier];
      if (track) {
        // Update current event & touch
        track.event = e;
        track.touch = touch;
        track.end = (type === tau.rt.Event.TOUCHEND
                    || type === tau.rt.Event.TOUCHCANCEL);
        if (track.end) {
          delete this._history[touch.identifier];
        }
        // Set touch move flag by comparing its first position to the current
        if (!track.move && (Math.abs(track.startPageX - touch.pageX) 
                            + Math.abs(track.startPageY - touch.pageY)) 
                                >= this._opts.touchMoveThreshold) {
          track.move = true;
        }
      } else if (type === tau.rt.Event.TOUCHSTART) {
        // Start tracking a touch
        track = this._history[touch.identifier] = {
          startEvent: e,
          startPageX: touch.pageX,
          startPageY: touch.pageY,
          event: e,
          touch: touch,
          target: this.hitTarget(e.target), // Find Tau component
          move: false,
          end: false
        };
      }
      return track;
    },
    
    /**
     * Creates a Touch object using a generic, none-touch, DOM event.
     * @private
     * @param {Object} e DOM event object
     * @returns {Object} Touch object
     */
    _mouseTouch: function (e) {
      return { 
        identifier: 'mouse', 
        clientX: e.clientX, clientY: e.clientY, 
        screenX: e.screenX, screenY: e.screenY, 
        pageX: e.pageX, pageY: e.pageY, 
        target: e.target
      };
    },

    /**
     * Logs a DOM event's touch positions.
     * @private
     * @param {Object} e DOM event object
     */
    _logTouches: function (e) {
      /** @inner */
      function touchCoords(touches) {
        var i, 
            result = [];
        result.push(touches.length + ' [');
        for (i = 0; i < touches.length; i++) {
          result.push(touches[i].identifier || (i + 1));
          result.push(':(' + touches[i].pageX + ', ' + touches[i].pageY + ')');
          if (i !== touches.length - 1) {
            result.push(', ');
          }
        }
        result.push(']');
        return result.join('');
      }
      if (tau.rt.hasTouch) {
        tau.log.debug(e.type + ': touches ' + touchCoords(e.touches));
        tau.log.debug(e.type + ': changedTouches ' + touchCoords(e.changedTouches));
        tau.log.debug(e.type + ': targetTouches ' + touchCoords(e.targetTouches));
      } else {
        tau.log.debug(e.type + ' touches[' + touchCoords([e]) + ']');
      }
    }
  });

  /** @lends tau.rt.Runtime.prototype */
  $class('tau.rt.Runtime').extend(tau.rt.EventDelegator).define({

    /**
     * 명시된 config정보를 이용하여 새로운 객체를 생성한다.
     * @class
     * 모듈({@link tau.rt.Module})의 동작을 관리한다.
     * <p/>
     * 내부적으로 사용되는 시스템 이벤트는 다음과 같다.
     * <ul>
     *   <li>{@link tau.rt.Event.RT_INSTALL}: 모듈을 Runtime에 등록한다.</li>
     *   <li>{@link tau.rt.Event.RT_UNINSTALL}: 모듈을 Runtime으로부터 제거한다.</li>
     *   <li>{@link tau.rt.Event.RT_START}: 모듈을 실행시킨다.</li>
     *   <li>{@link tau.rt.Event.RT_STOP}: 모듈의 동작을 중지시킨다.</li>
     *   <li>{@link tau.rt.Event.RT_LAUNCH}: Runtime을 구동시킨다.</li>
     *   <li>{@link tau.rt.Event.RT_TERMINATE}: Runtime을 중지시킨다.</li>
     * </ul>
     * @constructs
     * @extends tau.rt.EventDelegator
     * @param {Object} config Runtime configuration 정보
     * @extends tau.rt.EventDelegator
     */
    Runtime: function (config) { //$ tau.rt.Runtime
      if (_RT) {
        throw new Error('tau.rt.Runtime: Only one runtime instance may exist!');
      }
      /** @private Maps module name to a configuration */
      this._registry = {}; 
      /** @private Module active stack */
      this._stack = [];
      /** @private Runtime config */
      this._config = config;
      /** @private Runtime queue, handled via execute() */
      //this.$queue = new tau.JobQueue();
      /** @private supported themes */
      this.$themeMgr = new tau.rt.ThemeManager(this);
      
      this.$widgets = [];
      
      this.$userapps; // application names loaded from cookie value
      
      /** @private Runtime DOM element references */
      this.$dom = {
        head: document.getElementsByTagName('head')[0],
        root: document.createElement('div') // Root runtime DOM element
      };
      this.$dom.root.setAttribute('id', 'tau-root');
      tau.util.dom.appendChild(document.body, this.$dom.root);

      /** @private  Event Managers handles all System Event processing */
      this.$eventMgr = new tau.rt.EventManager();
      
      /** @private listen to update event of application cache */
      if (GLOBAL.applicationCache && GLOBAL.navigator.onLine) {
        GLOBAL.applicationCache.addEventListener(
            'updateready', this.handleUpdateReady, false);
      }

      // Runtime module event handlers
      var bootstrap = [tau.rt.Event.RT_INSTALL, tau.rt.Event.RT_UNINSTALL,
                       tau.rt.Event.RT_START,   tau.rt.Event.RT_STOP,
                       tau.rt.Event.RT_TERMINATE, tau.rt.Event.RT_INSTALLED];
      for (var i = 0, len = bootstrap.length; i < len; i++) {
        this.publishEvent(bootstrap[i], { defaultFn: this.handleBootstrap });
      }
      
      var events = [tau.rt.Event.TOUCHSTART, 
                    tau.rt.Event.TOUCHMOVE, 
                    tau.rt.Event.TAP,
                    tau.rt.Event.TOUCHEND];
      for (var i = 0, len = events.length; i < len; i++) {
        this.publishEvent(events[i], {
          antecedentFn: this.handleCaptureEvent
        });
      }
      // clipboard for storing DOM of background apps
      this.$clipboard = new tau.rt.Clipboard();
    },
    
    /**
     * 시스템 내부 클립보드 객체를 반환한다. 클립보드 객체는 Temporary로
     * DOM객체를 저장하기 위해 사용된다.
     * @returns {tau.rt.Clipboard} Clipboard 객체
     */
    getClipboard: function () {
      return this.$clipboard;
    },
    
    /**
     * 시스템 이벤트 중 Lifecycle과 관련된 이벤트들을 처리한다.
     * @param {tau.rt.Event} e 이벤트 객체
     * @param {Object} payload 이벤트 발생시 전달되는 데이터 객체
     */
    handleBootstrap: function (e, payload) {
      switch (e.getName()) {
        case tau.rt.Event.RT_INSTALL:
          this.install(payload);
          break;
        case tau.rt.Event.RT_UNINSTALL:
          this.uninstall(payload);
          break;
        case tau.rt.Event.RT_START:
          this.start(payload);
          break;
        case tau.rt.Event.RT_STOP:
          this.stop(payload);
          break;
        case tau.rt.Event.RT_TERMINATE:
          this.terminate(payload);
          break;
      }
    },
    
    /**
     * callback 메소드로써 부모클래스의 메소드를 오버라이드하여 
     * Runtime이벤트를 처리한다. 
     * @override
     */
    propagateEvent: function (e, payload) {
      switch (e.getName()) {
        case tau.rt.Event.SCENEDRAWN:
        case tau.rt.Event.ORIENTATION:
          if (tau.rt.isIPhone) {  // hide URL bar
            if(document.height <= window.outerHeight + 10) {
              var elem = document.documentElement;
              elem.style.height= (window.innerHeight + 60) + 'px';
              window.setTimeout(function () {
                window.scrollTo(0, 0);
                var elem = document.documentElement;
                elem.style.height= window.innerHeight + 'px';
              }, 100);
            } else {
              setTimeout( function(){ window.scrollTo(0, 0); }, 0 );
            }
          } else if (tau.rt.isAndroid) {
              var elem = document.documentElement,
                  height = window.outerHeight / window.devicePixelRatio;
              if(elem.scrollHeight <  height && height) {
                elem.style.height= height + 'px';
              } else {
                elem.style.height = null;
              }
              window.setTimeout(function () {
                window.scrollTo(1, 1);
                var elem = document.documentElement;
                elem.style.height= (window.outerHeight / window.devicePixelRatio) + 'px';
              }, 250);
          }
          break;
      }
      if (!e._stopPropagation) { // propagates events to system widgets
        for (var widgets = this.$widgets, i = 0, len = widgets.length;
            i < len; i++) {
          widgets[i].propagateEvent(e, payload);
        }
      }
      tau.rt.Runtime.$super.propagateEvent.apply(this, arguments);
    },
    
    /**
     * Capture단계의 이벤트를 처리한다. 이 메소드는 이벤트로 publishing할 때
     * antecedentFn로 등록되어 있다.
     * @param {tau.rt.Event} e Event 객체
     * @param {Object} payload 이벤트 발생시 전달되는 데이터 객체
     * @see tau.rt.EventDelegator#publishEvent
     */
    handleCaptureEvent: function (e, payload) {
     for (var publisher, widgets = this.$widgets, i = 0, len = widgets.length; 
         i < len; i++) {
       publisher = widgets[i].getEventPublisher(e.getName());
       if (publisher) {
         publisher.notifyListeners(e);
       }
     }
    },
    
    /**
     * Cache가 변경되었을 때 변경된 내용을 Local Cache에 적용한다.
     * @param {Event} e Cache 변경 이벤트(html5)
     * @param {Object} payload 이벤트 발생시 전달되는 데이터 객체
     */
    handleUpdateReady: function (e, payload) {
      var appCache = GLOBAL.applicationCache;
      if (appCache.status == appCache.UPDATEREADY) {
        appCache.swapCache();
        tau.log('Application cache is updated!');
      }
    },
    
    /**
     * SystemDock 객체를 반환한다. 만약 현재 생성된 SystemDock객체가 존재하지 않으면
     * 새로운 객체를 생성하여 반환한다.
     * @return {tau.ui.SystemDock} 시스템 객체
     */
    getSystemDock: function () {
      var widget = this.findSystemWidget(tau.ui.SystemDock);
      if (widget) return widget;
      var config = this.getModuleConfig('$dashboard');
      return this.addSystemWidget(new tau.ui.SystemDock(config.systemdock));
    },
    
    /**
     * SystemDialog 객체를 반환한다. 만약 현재 생성된 SystemDialog객체가 존재하지 않으면
     * 새로운 객체를 생성하여 반환한다.
     * @return {tau.ui.SystemDialog} 시스템 다이얼로그 객체
     */
    getSystemDialog: function () {
      var widget = this.findSystemWidget(tau.ui.SystemDialog);
      if (widget) return widget;

      widget = new tau.ui.SystemDialog();
      widget.draw(this.$dom.root);
      return this.addSystemWidget(widget);
    },
    
    /**
     * 쿠키 저장소에 Caching된 앱들에 대한 이름을 배열 형태로 반환한다.
     * @returns {Array} 쿠키에 저장되어 있는 앱 이름에 대한 배열
     */
    getCached: function () {
      var cookie;
      if (!this.$userapps) {
        cookie = tau.util.getCookie('$userapps');
        this.$userapps = cookie ? tau.parse(cookie) : [];
      }
      return this.$userapps;
    },

    /**
     * 명시된 이름의 앱을 Cache로 부터 삭제한다.
     * @param {String} app 삭제할 앱 이름
     * @private
     */
    _uncache: function (app) {
      var apps = this.getCached();
      if (apps.indexOf(app) !== -1) {
        apps.splice(apps.indexOf(app), 1);
        tau.util.setCookie('$userapps', tau.stringify(apps), 365);
        try {
          window.applicationCache.update(); // async processing
        } catch (e) {
          tau.log.debug(
          'You need to go online to update application cache(uninstall): ' + e);
        }
      }
    },
    
    /**
     * 명시된 앱 이름을 쿠키 저장소에 저장한다.
     * @param {String} app Caching할 앱의 이름
     * @private
     */
    _cache: function (app) {
      var apps = this.getCached();
      if (apps && apps.indexOf(app) === -1) {
        apps.push(app);
        tau.util.setCookie('$userapps', tau.stringify(apps), 365);
        try {
          window.applicationCache.update(); // async processing
        } catch (e) {
          tau.log.debug(
            'You need to go online to update application cache(install): ' + e);
        }
      }
    },
    
    /**
     * 명시된 모듈 configuration정보를 Runtime에 등록한다.
     * <p/>
     * Module이름이 명시되면 해당 모듈의 configuration정보를 지정된 패스로
     * 부터(appname/config.json) 로딩한다. 만약 이름이 명시되지 않으면
     * Dashboard를 위한 configuration정보를 로딩한다.
     * <p/>
     * 명시된 앱이 Runtime에 등록되기 위해서는 반드시 configuration정보가
     * 필요하며 configuration정보의 포맷은 다음과 같이 JSON형태로 기술한다.
     * <p/>
     * 명시된 모듈의 설치가 완료되면 {@link tau.rt.Event.RT_INSTALLED} 이벤트가
     * 발생된다. 이때 payload객체는 설치된 앱들의 configuration정보가 된다.
     *
     * @example
     * // config.json
     * config({
     *   name: 'appname',
     *   version: '1.0.0', 
     *   classname: 'foo.Bar'
     *   ...
     * });
     *
     * @param {Object | Array} apps install할 모듈의 정보
     */
    install: function (apps) {
      var rt = this;
      apps = tau.isArray(apps) ? apps : [apps];
      this.resolve(apps, function (confs) {
        var conf;
        for (var i = 0, len = confs.length; i < len; i++) {
          conf = confs[i];
          rt._registry[conf.name] = conf; // register conf
          if (conf.$mutable) {
            rt._cache(conf.name);
          }
        }
        (rt.getModule() || rt).fireEvent(tau.rt.Event.RT_INSTALLED, confs);
        if (rt._registry[apps[0].name] && apps[0].autostart) {
          rt.start(apps[0].name);
        }
      });
    },
    
    /**
     * 명시된 앱 이름을 이용하여 해당 앱의 config정보를 찾아낸다. 작업이
     * 완료되면 명시된 callback메소드가 호출된다.
     * @param {Array} apps resolve할 앱이름들(배열)
     * @param {Function} callbackFn resolving작업이 종료되면 호출될
     * callback함수. 이 함수의 파라미터는 resolve된 config정보의 배열이 된다.
     */
    resolve: function (apps, callbackFn) {
      var src, chain;
      GLOBAL.config = function (conf) { // global wide function
        GLOBAL.config.current = conf; // refer to InstallDependency#handleResult
      };
      chain = new tau.rt.DependencyChain();
      for (var i = 0, len = apps.length; i < len; i++) {
        src = _resolvePath('/config.json', apps[i].name);
        chain.addDependency(
            new tau.rt.InstallDependency(apps[i].name, src, apps[i].sys));
      }
      chain.setAutoUnloading(true);
      chain.setFallback({
        resolve: function (context) {
          delete GLOBAL.config;
          var conf, confs = [], dependencies = context.getDependencies();
          for (var i = 0, len = dependencies.length; i < len; i++) {
            if (!(conf = dependencies[i].$conf)) continue;
            confs.push(conf); // register conf
          }
          if (callbackFn && tau.isFunction(callbackFn)) {
            callbackFn(confs);
          }
        }
      });
      chain.resolve();
    },
    

    /**
     * 명시된 모듈의 이름을 Runtime으로 부터 삭제한다.
     * <p/>
     * 주의: 명시된 모듈의 현재 active모듈이면 Runtime으로 부터 삭제가
     * 불가능하다. 또한 삭제된 모듈을 다시 설치되기전 까지는 재시작이
     * 불가능하다.
     * @param {String} name Module 이름
     * @see tau.rt.Module
     */
    uninstall: function (name) {
      // Ensure that the module was installed and not active
      var config = this._registry[name];
      if (this.getModule(name)) {
        this.fireEvent(tau.rt.Event.RT_STOP, name);
        tau.log.info('Stopping instantiated module before uninstalling: ' 
            + name, this);
      }
      tau.log.info('Uninstalling module: ' + name, this);
      delete this._registry[name];
      (this.getModule() || this).fireEvent(tau.rt.Event.RT_UNINSTALLED, config);
      this._uncache(name);
      // Recursively uninstall remaining parameters
      if (arguments.length > 1) {
        this.uninstall.apply(this, Array.prototype.slice.call(arguments, 1));
      }
    },

    /**
     * 명시된 이름의 모듈의 Lifecycle을 시작한다.
     * <p/>
     * 명시된 이름에 해당하는 Module이 정상적으로 설치되어 있다면 새로운
     * 객체를 생성하고 실행시킨다. 그렇지 않으면 지금까지 실행된 Module들중
     * 가장 최근에 실행한 Module을 구동시킨다. 마지막으로 현재 active모듈이
     * 존재하지 않으면 Dashboard를 구동시킨다.
     * @param {String} name Module 명, undefined 이면 가장 최근에
     * 실행한 Module을 재기동 한다.
     * @throws {error} 기동되거나 시작된 Module이 존재하지 않을 경우
     * @see tau.rt.Module
     */
    start: function (name) {
      var stack, cur,
          config = this._registry[name],
          module = this.getModule(name);
      //!this._config.multiInstance -> not support multiInstance by default now 
      if (!module) {
        module = (name === '$dashboard') ? new tau.rt.Dashboard(this, config)
            : new tau.rt.Application(this, config);
      }
      if (!module || !(module instanceof tau.rt.Module)) {
        throw new Error('tau.rt.Runtime: no module active or installed!');
      }
      // Always de-activate module first to properly maintain active stack.
      // e.g. Some modules that restart must be moved from a lower active 
      // stack to the top (currently running).
      // tau.arr(this._stack).remove(module);
      stack = tau.arr(this._stack);
      if (cur = stack.peek()) { // already existing module
        this.$clipboard.cut(cur.getId(), cur.getDOM());
        cur.setVisible(false);
      }
      if (this._stack.length > 0) {
        stack.remove(module);
      }
      if (!stack.pushUnique(module)) {
        throw new Error('Same module instance already exists: ' + name);
      }
      this.refresh(); // update system dock
      // Set active module & run module
      this.$eventMgr.setActiveModule(module);
      this.$themeMgr.loadTheme( // load theme before starting module
          {'config': module.getConfig(), 'module': module});
      if (module.isBusy()) { // instance exists already
        this.$clipboard.paste(module.getId(), this.$dom.root);
        module.setVisible(true);
        tau.log.info('Switching: ' + _appNameId(module), this);
        this.fireEvent(new tau.rt.Event(tau.rt.Event.RT_APP_CHANGE, this), 
            {'fg': module, 'bg': cur});
      } else {
        tau.log.info('Starting: ' + _appNameId(module), this);
        try {
          module.start();
        } catch (ex) {
          tau.log.error('Starting module failed: ' + _appNameId(module) 
              +'\n\t' + ex, this);
          this.fireEvent(tau.rt.Event.RT_STOP, module.getName());
        }
      }
    },
    
    /**
     * 명시된 이름에 해당하는 Module의 Lifecycle을 중지하고 destroy시킨다.
     * <p/>
     * Module이름이 명시되고 해당 Module이 존재하면 그 모듈을 중지시키고
     * 그렇지 않으면 실행된 Module들 중 가장 최근에 실행된 Module을 찾아
     * 중지 시킨다.<p/>
     * Module이 중지되면 Control을 그 다음으로 최근에 실행된 Module로 넘긴다음
     * lifecycle을 실행시킨다.
     * @param {String} name Module 이름/id, undefined
     * 이면 현재 실행중인 Module을 중지시킨다.
     */
    stop: function (name) {
      // Find the running module, otherwise Stop currently running module;
      var isActive,
          module = this.getModule(name) || this.getModule();
      if (module) {
        if (this._stack.length <= 0) {
          tau.log.error('Stopping last remaining module is prohibited', this);
        } else if (module.getName() === '$dashboard') {
          tau.log.error('Stopping Dashboard is prohibited', this);
        } else {
          tau.log.info('Stopping: ' + _appNameId(module), this);
          // Stop the module and fire event to start top-most active module
          isActive = this._stack[this._stack.length - 1] === module;
          if (isActive) {
            this.$eventMgr.setActiveModule(null); // Clear active module
          }
          try {
            this.$clipboard.remove(module.getId());
            module.stop();
          } catch (ex) {
            tau.log.error('Exception occurred during Stop: ' + ex, this);
            // If graceful error option is not set, we re-throw exception 
            if (!this._config.gracefulErrors) {
              throw ex;
            }
          } finally {
            tau.arr(this._stack).remove(module); // Remove from active stack
            if (isActive) {
              this.fireEvent(tau.rt.Event.RT_START); // Restart top-most module
            } else {
              this.refresh();
            }
          }
        }
      } else {
        tau.log.error('Stopping failed for invalid module: ' + name, this);
      }
    },

    /**
     * 브라우저의 URL로 부터 Mobello의 Runtime을 launch시킨다.
     * <p>
     * URL 파라미터에 app을 포함하고 있으면 그 값으로 지정된 앱을 구동시킨다.
     * 만약 명시된 app 파라미터가 없으면 Dashboard를 구동시킨다.<p/>
     * URL 포맷은 다음과 같다.
     * @example
     * http://&lt;domain.com>/launcher.html?app=&lt;appname>
     */
    launch: function () {
      this._drawMask('Loading...');
      var app = this.getConfig().singleApp;
      if (!app) app = '$dashboard';
      function handler (e, payload) {
        this.unsubscribeEvent(tau.rt.Event.RT_INSTALLED, handler, this);
        this._clearMask();
        if (payload[0] && app === payload[0].name) {
          this.setTitle(payload[0].title);
          this.setIcon(payload[0].icon);
          if (payload[0].splash) this.setSplash(payload[0].splash);
          tau.log.LEVEL = payload[0].loglevel;
        } else {
          window.alert('앱('+ app + ')을 실행할 수 없습니다.\n앱 이름이 정확한지 확인하십시오.');
        }
      };
      this.onEvent(tau.rt.Event.RT_INSTALLED, handler, this);
      this.fireEvent(tau.rt.Event.RT_INSTALL, {name: app, autostart: true, sys: true});
    },

    /**
     * 명시된 이름의 Module을 중지하고 uninstall시킨다.
     * @param {String} name Module 명
     */
    terminate: function (name) {
      tau.log.info('Terminating: ' + name, this);
      this.fireEvent(tau.rt.Event.RT_STOP, name);
      this.fireEvent(tau.rt.Event.RT_UNINSTALL, name);
    },

    /**
     * Runtime 리소스들을 업데이트 시킨다. Multi-tasking모드일 경우 SystemDock
     * 정보를 갱신한다.
     */
    refresh: function () {
      var rt = this;
      function deferRefresh() {
        rt.getSystemDock().draw(rt.$dom.root, true);
      }
      if (this.isMultiApp()) { // Update system dock contents
        window.setTimeout(deferRefresh, 50);
      }
    },

    /**
     * 현재 Runtime의 버전정보를 반환한다.
     * @returns {String} Runtime의 버전정보
     */
    getVersion: function () {
      return this._config.version;
    },

    /**
     * Runtime의 configuration정보를 반환한다.
     * @returns {Object} Runtime configuration 정보
     */
    getConfig: function () {
      return this._config;
    },

    /**
     * Multi-tasking모드인지 확인하고 그 결과를 true/false로 반환한다.
     * @returns {Boolean} true이면 multi-tasking모드 임
     */
    isMultiApp: function () {
      return !(this._config.singleApp);
    },

    /**
     * 명시된 모듈 이름 또는 id를 이용하여 Module 객체를 찾아 반환한다.
     * <p/>
     * nameId를 명시하지 않으면 현재 실행중인 Module을 반환한다.
     * <p/>
     * 파라미터로 "*"을 사용하면 지금까지 실행된 모둔 Module에 
     * 대한정보를 Array형태로 반환한다.
     * @param {String} nameId Application name 또는 Id ("*" = all)
     * @returns {Array|tau.rt.Module} 검색된 Module 또는 Module 배열
     */
    getModule: function (nameId) {
      if (!nameId && this._stack.length > 0) {
        return this._stack[this._stack.length - 1];  // Current
      } else if (nameId === '*') {
        return Array.prototype.slice.call(this._stack, 0);
      } else if (nameId) {
        // Find module by name or id
        for (var m, i = 0; i < this._stack.length; i++) {
          m = this._stack[i];
          if (m.getId() === nameId || m.getName() === nameId) {
            return m;
          }
        }
      } 
      return null;
    },

    /**
     * 현재 실행되고 있는 Module의 개수를 반환한다.
     * @returns {Number} 현재 구동중인 Module의 개수
     */
    getModuleSize: function () {
      return this._stack.length;
    },

    /**
     * 명시된 이름에 해당하는 Module을 찾아 그 configuration정보를 반환한다.
     * <p/>
     * 만약 Module이름이 명시되지 않으면 현재 구동중인 Module의 configuration
     * 정보를 반환한다.
     * @param {String} name 찾고자 하는 Module의 이름
     * @returns {Object} 모듈의 configuration정보
     */
    getModuleConfig: function (name) {
      if (tau.isString(name)) {
        return this._registry[name];
      } else {
        return this.getModule().getConfig();
      }
    },

    /**
     * 브라우저의 title을 설정한다.
     * @param {String} title 설정할 title값
     */
    setTitle: function (title) {
      if (!this.$dom.title) {
        this.$dom.title = document.createElement('title');
        this.$dom.head.insertBefore(this.$dom.title, this.$dom.head.firstChild);
      } else {
        this.$dom.title.removeChild(this.$dom.title.firstChild);
      }
      this.$dom.title.appendChild(document.createTextNode(title));
    },

    /**
     * 아이폰일 경우 바탕화면으로 가기를 위한 아이콘을 설정한다.
     * @param {String} path icon에 대한 경로정보
     */
    setIcon: function (path) {
      if (!this.$dom.icon) {
        this.$dom.icon = document.createElement('link');
        this.$dom.icon.setAttribute('rel', 'apple-touch-icon');
        this.$dom.head.appendChild(this.$dom.icon);
      }
      this.$dom.icon.setAttribute('href', path);        
    },

    /**
     * 아이폰일 경우 초기 구동시 출력할 splash이미지를 설정한다.
     * @param {String} path Splash이미지에대한 경로
     */
    setSplash: function (path) {
      if (!this.$dom.splash) {
        this.$dom.splash = document.createElement('link');
        this.$dom.splash.setAttribute('rel', 'apple-touch-startup-image');
        this.$dom.head.appendChild(this.$dom.splash);
      }
      this.$dom.splash.setAttribute('href', path);        
    },

    /**
     * 명시된 이름으로 StorageContext를 생성하여 반환한다.
     * <p/>
     * 앱의 StorageContext는 이름을 기준으로 생성된다. 만약 이름이 주어지지
     * 않으면 현재 구동중인 앱을 이름을 사용한다.
     * 면약 현재 실행중인 Module이 존재하지 않으면 null을 반환한다.
     * @param {String} name StorageContext 생성을 위한 앱 이름
     * @returns {tau.rt.StorageContext} 해당 앱 이름으로 생성된 Storage context 객체
     * @see tau.rt.StorageContext
     */
    createStorageCtx: function (name) {
      if (tau.isString(name)) {
        return new tau.rt.StorageContext(name); 
      } else if (this.getModule()) {
        return new tau.rt.StorageContext(this.getModule().getName());
      }
      return null;
    },

    /**
     * Draws a mask message.
     * @param {String} msg Mask message 
     * @private
     */
    _drawMask: function (msg) {
      if (!this.$dom.mask) {
        this.$dom.mask = document.createElement('div');
        this.$dom.mask.setAttribute('style', 'margin-top:100px; text-align:center; font-family: sans-serif');
        this.$dom.root.appendChild(this.$dom.mask);
      }
      this.$dom.mask.innerHTML = msg;
    },

    /**
     * Clears mask.
     * @private
     */
    _clearMask: function () {
      if (this.$dom.mask && this.$dom.root.removeChild(this.$dom.mask)) {
        delete this.$dom.mask;
      }
    },

    /**
     * 전체 default theme을 변경한다.
     * <p/>
     * @param {String} themeName Theme 텍스트
     */
    setTheme: function (themeName) {
      this.$themeMgr.setDefaultTheme(themeName);
    },

    /**
     * config에 적용되어 있는 theme으로 초기화한다.
     */
    resetTheme: function () {
      if (this.isMultiApp()){ // multi app
        this.$themeMgr.resetTheme(this.getModuleConfig('$dashboard'));
      } else {
        var context = tau.getCurrentContext();
        if (context) {
          context.resetTheme();
        }
      }
    },
    
    /**
     * 명시된 위젯을 Runtime에 등록한다. 등록할 위젯은 반드시
     * {@link tau.rt.EventDelegator}를 상속받아야 한다.
     * @param {tau.rt.EventDelegator} widget 시스템적으로 사용할 Widget객체
     * @throws {TypeError} 명시된 객체가 tau.rt.EventDelegator를 상속받은
     * 클래스가 아닐 경우
     */
    addSystemWidget: function (widget) {
      if (!(widget instanceof tau.rt.EventDelegator)) {
        throw new TypeError(widget.toString().concat(
            ' is not an instance of EventDelegator', this.currentStack())); 
      }
      // do not setBubble() with Runtime!!
      this.$widgets.push(widget);
      return widget;
    },
    
    /**
     * 명시된 클래스에 해당하는 System Widget의 인스턴스를 찾아 반환한다.ㅕ
     * 만약 일치하는 System Widget이 존재하지 않으면 null을 반환한다.
     * @param {Class} clazz 시스템 위젯 클래스
     */
    findSystemWidget: function (clazz) {
      var widgets = this.$widgets;
      for (var i = 0, len = widgets.length; i < len; i++) {
        if (widgets[i] instanceof clazz) {
          return widgets[i];
        }
      }
      return null;
    },
    
    /**
     * Runtime에 등록된 모든 System Widget을 배열형태로 반환한다.
     * @returns {Array} Runtime에 등록된 모든 System Widget
     */
    getSystemWidgets: function () {
      return this.$widgets;
    }
  });

  /** @lends tau.rt.Module.prototype */
  $class('tau.rt.Module').extend(tau.rt.EventDelegator).define({
    $static: /** @lends tau.rt.Module */{
      /**
       * 모듈에 Badge가 설정되었을 때 발생하는 이벤트이며, 설정된 Badge의 값은
       * payload로 전달 받는다.
       */
      EVENT_BADGESET: 'badgeset'
    },
    
    /**
     * 명시된 파라미터를 이용하여 새로운 Module객체를 생성한다.
     * @class
     * Application 또는 Dashboard의 부모클래스
     * <p/>
     * 이 클래스의 인스턴스는 start메소드를 통해 Lifecycle이 시작된다.
     * @constructs
     * @param {tau.rt.Runtime} rt Runtime 인스턴스
     * @param {Object} config Module configuration 객체
     * @throws {Error} rt 또는 config가 명시되지 않았거나 부적절할 경우(null)
     * @extends tau.rt.EventDelegator
     */
    Module: function (rt, config) { //$ tau.rt.Module
      if (!rt || !config) {
        throw new Error('tau.rt.Module: invalid runtime/config');
      }
      /** @private Module configuration object */
      this._config = config;
      /** @private Runtime instance */
      this._rt = rt;

      this.setBubble(this._rt);
      this._isVisible = false;
      this._isReady = false; // set true when theme is loaded
    },
    
    /**
     * 설정된 파라미터의 값에 따라 현재 모듈을 화면에 보이도록 하거나 보이지 않도록 한다.
     * <code>visible</code> 값이 false일 경우 현재 모듈을 화면에서 사라지며 CSS 스타일
     * Proeprty인 display 값이 'none'으로 처리되어 실제 DOM Operation 도 발생하지
     * 않는다.<p/>
     * Multi-App 모드일 경우 Runtime에서 현재 실행중인 App을 background나 foreground
     * 로 처리할 때 이 메소드를 이용한다.   
     * @param {Boolean} visible if true, module is rendered on screen
     */
    setVisible: function (visible) {
      var dom = this.getDOM();
      if (visible) {
        var anim = this._config.animation;
        if (tau.isUndefined(anim) || anim) { // animation
          tau.fx.fadeIn(dom, {
            duration: 300
          });
        } else {
          dom.style.display = '';
        }
      } else {
        dom.style.display = 'none';
      }
      this._isVisible = visible;
    },
    
    /**
     * 이벤트 서브시스템 메소드를 Override하며 현재 SceneController에서 Scene을
     * 로딩하여 Drawing이 완료됐을 때 {@link tau.rt.Event.SCENEDRAWN} 이벤트를
     * 받아 화면에 출력하는 기능을 수행한다. 
     * @override
     */
    propagateEvent: function (e) {
      switch (e.getName()) {
        case tau.rt.Event.SCENEDRAWN: // async call
          if (!this._isVisible) {
            this.setVisible(true);
          }
          break;
        case tau.rt.Event.RT_THEME_ENABLED:
          if (this._isReady && !this._rootController.$isStarted) {
            this._rootController.doStart();
          }
          this._isReady = true;
          break;
        default:
          break;
      }
      tau.rt.Module.$super.propagateEvent.apply(this, arguments);
    },
    
    /**
     * 현재 Module의 id를 반환한다.
     * @returns {String} Module id
     */
    getId: function () {
      return this._id;
    },

    /**
     * 현재 Module의 이름을 반환한다.
     * @returns {String} Module 이름
     */
    getName: function () {
      return this._config.name;
    },

    /**
     * 현재 Module의 configuration객체를 반환한다.
     * @returns {Object} Module configuration
     */
    getConfig: function () {
      return this._config;
    },

    /**
     * 사용자가 구현한 앱의 RootController를 반환한다.
     * @returns {Object} Module이 구동될 때 실행되는 controller 객체
     */
    getRootController: function () {
      return this._rootController;
    },

    /**
     * Event System상에서 Module의 현재 이벤트를 처리하게 될 EventDelegator를
     * 찾아 반환한다. 만약 ModalController가 실행중이면 이 Controller의
     * 객체를 반환하고 그렇지 않으면 root controlle를 반환한다.
     * @returns {tau.rt.EventDelegator} 현재 이벤트를 처리하게 될
     * EventDelegator객체
     */
    getActiveDelegator: function () {
      var ctrl = this.modalCtrl;
      return (ctrl && ctrl.hasModals()) ? ctrl : this._rootController;
    },

    /**
     * 데이터를 persistent하게 저장하기 위한 현재 모듈의 StorageManager를
     * 반환한다.
     * @returns {tau.rt.StorageContext} 현재 모듈의
     * {@link tau.rt.StorageContext} 객체
     */
    getStorageCtx: function () {
      if (!this._storageCtx) {
        /** @private Storage context for the given module */
        this._storageCtx = new tau.rt.StorageContext(this.getName()); 
      }
      return this._storageCtx;
    },

    /**
     * 현재 Module에 대한 Badge 문자열 또는 숫자를
     * persistent하게 저장한다.
     * @param {String|Number} value 설정할 Badge 값
     * @returns {Boolean} 성공적으로 설정되었으면 true를 반환
     */
    setBadge: function (value) {
      var result = this.getStorageCtx().set('$badge', value);
      if (result) {
        this.fireEvent(tau.rt.Module.EVENT_BADGESET, value);
      }
      return result;
    },

    /**
     * 설정된 Badge값을 반환한다.
     * @returns {String|Number} 설정된 Badge 값
     */
    getBadge: function () {
      return this.getStorageCtx().get('$badge');
    },

    /**
     * 설정된 Badge값을 제거한다.
     * @returns {Boolean} 성공적으로 제거되었으면 true를 반환
     */
    removeBadge: function () {
      var result = this.getStorageCtx().remove('$badge');
      if (result) {
        this.fireEvent(tau.rt.Module.EVENT_BADGESET);
      }
      return result;
    },
    
    /**
     * 현재 모듈의 Lifecycle이 시작되었는지를 확인한다. 만약 <code>true</code>를 반환하면
     * 현재 모듈과 Controller의 Lifecycle 시작되었음을 의미한다.
     * @returns {Boolean} 모듈의 Lifecycle이 시작되었으면 <code>true</code>를 반환
     */
    isBusy: function () {
      return (this._rootController && this._rootController.$isStarted);
    },

    /**
     * Module의 Lifecycle을 시작한다. 모듈의 Lifecycle이 시작되면 먼저 RootController
     * 의 존재를 확인하고 설정된 RootController가 존재하면 RootController의 Lifecycle
     * 도 시작한다.
     * @throws {ReferenceError} RootController가 설정되지 않았을 경우
     */
    start: function () {
      // load theme asynchronously, process in parallel
      var dom = this.getDOM();
      // Push module element to top of DOM stack
      if (!dom.parentNode) {
        tau.util.dom.pushElement(this._rt.$dom.root, dom);
      }
      if (!this._rootController) {
        throw new ReferenceError('RootController is not set on module: ' 
            + this.getName());
      }
      // Link Event Delegators if the app wasn't preivously started
      if (!this._rootController.$parent) {
        this._rootController.setParent(this);
      }
      if (!this.isBusy()) {
        dom.style.opacity = 0; // must retain the space!
        if (this._isReady) { //theme is loaded asynchronously! See event handler
          this._rootController.doStart();
        }
        this._isReady = true;
      }
    },

    /**
     * 현재 모듈의 Lifecycle을 중지시킨다. 내부적으로 Module의
     * destory메소드가 호출되며 이 메소드 내에서 더이상
     * 사용하지 않는 리소스들을 clear시킨다.
     * <p/>
     * Event hierarch상의 모든 관계도 이 메소드가 호출됨과
     * 동시에 해제 된다.
     */
    stop: function () {
      try {
        tau.getRuntime().$themeMgr.unloadTheme(this.getConfig());
        // Verify & run user implementation of destroy()
        if (this._rootController instanceof tau.ui.Controller) {
          this._rootController.doDestroy();
        } else {
          tau.log.info('Destruction: \"' + this._config.classname
              + '\" is an invalid controller', this);
        }
      } finally {
        // Module resource cleanup
        this.removeBubble(this._rt);
        this._rootController.$parent = null;
        this._rootController = null;
        this._storageCtx = null;
        this._config = null;
        this._rt = null;
        this._id = null;
        if (this.modalCtrl) { //terminates the lifecycle of ModalSceneController
          this.modalCtrl.doDestroy();
          delete this.modalCtrl;
        }
        if (this._dom) {
          tau.util.dom.removeElements(this._dom);
          this._dom = null;
        }
      }
    },

    /**
     * 현재 Module이 위치하고 있는 DOM 앨리먼트를 찾아
     * 반환한다.
     * @returns {Object} DOM 앨리먼트
     */
    getDOM: function () {
      if (!this._dom) {
        /** @private Frame DOM element */
        this._dom = document.createElement('div');
        this._dom.setAttribute('id', this._id); // Defined in App/Dashboard
        tau.util.dom.addClass(this._dom, 'tau-application');
      }
      return this._dom;
    },
    
    /**
     * 현재 모듈과 연관된 ModalSceneController 인스턴스를
     * 반환한다.
     * @returns {tau.ui.ModalSceneController} ModalSceneController 객체
     */
    getModalController: function () {
      if (!this.modalCtrl) { // lazy construction
        this.modalCtrl = new tau.ui.ModalSceneController(this);
        this.modalCtrl.doStart();
      }
      return this.modalCtrl;
    }
  });


  /** @lends tau.rt.Application.prototype */
  $class('tau.rt.Application').extend(tau.rt.Module).define({
    $static: {
      CONFIG: {
        require       : '/main.js',   // Class source path (default: /main.js)
        icon          : '/icon.png',  // Icon resource path (default: /icon.png)
        version       : '1.0.0',      // Version (default: 1.0.0)
        vendor        : 'Company',    // Vendor name (default: Company)

        /* TODO: Currently unused */
        orientation   : 'portrait',   // Sceen orientation (portrait/landscape)
        language      : 'ko',         // Default language
        region        : 'KR'          // Default regional settings
      }
    },
    
    /**
     * 명시된 파라미터를 이용하여 새로운 Application객체를
     * 생성한다.
     * @class
     * 개발자들이 개발한 앱을 추상화한 클래스이며 관련된 기능들을
     * 정의한다.
     * <p/>
     * Application은 관련된 모듈을 Async방식으로
     * 로딩한다. 따라서 Application객체의 start메소드가
     * 호출되어다 하더라도 즉시 실행되는 것이 아니라
     * Application에서 필요로 하는 리소스가 모두 로딩된
     * 후에 Lifecycle을 시작한다.
     * @constructs
     * @extends tau.rt.Module
     * @param {tau.rt.Runtime} rt Mobello Runtime 객체
     * @param {Object} config Application configuration 객체
     * @param {String} [config.require = '/main.js'] App실행시
     * 로딩할 메인 js 파일
     * @param {String} [config.icon = '/icon.png'] App의 default
     * 아이콘, 아이폰의 경우 바탕화면에 생성할 아이콘에 해당
     * @param {String} [config.version = '1.0.0'] App의 default 버전
     * @param {String} [config.vendor = 'Company'] App 제작사 명
     * @param {String} config.classname App실행시 최초로 로딩할
     * Controller클래스 명(full class name)
     * @param {String} config.title 화면에 출력할 앱 이름
     * @param {String} [config.timeout] Scene을 로딩하기 위해 소요되는
     * 최대 시간(millisecond). 생략할 경우 브라우저 timeout사용
     */
    Application: function (rt, config) {
      this._config = tau.mixin(config, tau.rt.Application.CONFIG); // override default
      if (!tau.isNamespace(config.classname)) {
        throw new Error('tau.rt.Application: invalid application class name, ' 
            + config.classname);
      } else if (!tau.isNamespace(config.name)) {
        throw new Error('tau.rt.Application: invalid module name, \"' 
            + config.name + '\"');
      }

      /** @private Unique module id */
      this._id = tau.genId('m');

      /** @private User application */
      this._rootController = null;
    },
    
    /**
     * 부모클래스의 start메소드를 오버라이드하며 Application
     * 실행시 필요한 외부 라이브러리들을 먼저 로딩한 후
     * Lifecycle을 시작한다.
     * @see tau.rt.Module#start
     */
    start: function () {
      var app = this,
        config = this.getConfig();
        dependencies = new tau.rt.DependencyChain();
      dependencies.setCaching(config.dev);
      // sets default fallback Depenedency
      dependencies.setFallback({
        resolve: function (context) {
          var clazz;
          // All import completed: disable require, create class, & callback
          delete $require;
          try {
            clazz = $class.forName(config.classname);
          } catch (ex) {
            throw new Error('tau.rt.Application: Could not find Application'
                + ' class definition: \"' + config.classname + '\"');
          }
    
          // Create an instance of application implementation class
          app._rootController = new clazz();
    
          // Ensure the main application extends a controller
          if (!(app._rootController instanceof tau.ui.Controller)) {
            throw new Error('tau.rt.Application: Main application \"' 
                + config.classname + '\" must extend a tau.ui.Controller');
          }
          tau.rt.Application.$super.start.apply(app, arguments);
        }
      });
      
      /**
       * Application실행시 필요한 자바스크립트 파일을
       * 로딩한다.
       * <p/>
       * Runtime으로 하여금 명시된 URL의 자바스크립트 라이브러리(lib)를 로딩
       * 하도록 한다. $require로 로딩하는 자바스크립트는
       * 명시된 순서대로 로딩될 수 있도록 Depth-first 알고리즘에 의해
       * 로딩순서를 보장한다. 따라서 로딩되는 외부 라이브러리에서
       * $require를 통해 또 다른 파일을 로딩하더라도 그
       * 로딩순서를 보장해 준다.<p/>
       * $require의 파라미터로 복수개의 라이브러리를 comma(,) 로 분리하여
       * 기술할 수도 있다.
       * <p/>
       * 주의: $require API는 스크립트파일이 로딩되는 시점에만
       * 유효하며, 모든 스크립트가 로딩이 완료된 후에는 사용이
       * 불가능하다.
       * @example
       * // Script "lib1.js" & "lib2.js" loaded in sequence. Any $require 
       * // defintions in "lib1.js" will be loaded prior to "lib2.js"
       * $require('/lib1.js');
       * $require('/lib2.js');
       * ...
       * $class('MyClass').define({
       *   MyClass() {
       *     $require('/lib3.js'); // *Undefined* Not available post file load
       *   }
       * });
       * @example
       * $require('lib1.js', 'lib2.js'); // you can specify this way
       *
       * @param {String} lib JavaScript dependent source URL
       * @see $class
       */
      $require = function (lib) {
        for (var i = 0, len = arguments.length; i < len; i++) {
          var src = _resolvePath(arguments[i], config.name);
          dependencies.addDependency(new tau.rt.Dependency(config.name, src));
        }
      };
    
      if (!tau.isArray(config.require)) {
        config.require = [config.require];
      }
      $require.apply(this, config.require);
      dependencies.resolve();
    }
  });

  /** @lends tau.rt.DependencyChain.prototype */
  $class('tau.rt.DependencyChain').define({
    /**
     * 새로운 객체를 생성하며 다음과 같이 DependencyChain을 사용할 수 있다.
     * @example
     * var app = // app name
     * var chain = tau.rt.DependencyChain();
     * chain.setFalllback({
     *   resolve: function (context) {
     *     // do default handling
     *   }
     * });
     * chain.addDependency(new Dependency(app, 'actualfilepath'));
     * chain.addDependency(new Dependency(app, 'actualfilepath'));
     * ...
     * chain.resolve();
     * 
     * @class
     * 연관성이 있는 클래스들을 로딩하기 위한  Chain을
     * 구성하고 resolve 메소드를 호출하면 Chain으로 구성된
     * 라이브러리들을 순서대로 로딩될 수 있도록 보장한다.
     * @constructs
     */
    DependencyChain: function () {
      this._offset = this._index = 0; // track current resolve position
      this._fb = null; // fallback dependency
      this._dependencies = [];
      this.$opts = {
          noCache: false,
          autoUnlaod: false,
          timeout: 30000 // 30 seconds
      };
    },
    
    /**
     * Default Dependency객체를 설정한다. 이 객체는 모든
     * Denendency가 resolve고 더이상 실행할 Dependency가
     * 존재하지 않을 경우 최종적으로 수행된다.
     * @param {tau.rt.Dependency} fb default fallback Dependency 객체
     */
    setFallback: function (fb) {
      this._fb = fb;
    },
    
    /**
     * 로딩된 자바스크립트 라이브러리를 캐싱할 것인지를
     * 설정한다. 기본 값은 true이다.
     * @param {Boolean} [state = true] false이면 Caching을 수행하지 않는다.
     */
    setCaching: function (state) {
      this.$opts.noCache = state;
    },
    
    /**
     * 스크립트가 로딩된 후에 자동으로 로딩된 스크립트를
     * unloading한다. 기본값은 false이다.
     * @param {Boolean} [state = false] true이면 로딩된 스크립트를
     * 자동으로 unloading
     */
    setAutoUnloading: function (state) {
      this.$opts.autoUnload = state;
    },
    
    /**
     * 스크립트가 로딩 완료될때 까지의 시간을 나타내며 millisecond로 표현한다.
     * @param {Number} [timeout] 스크립트가 로딩 완료될때 까지의 시간
     */
    setTimeout: function (timeout) {
      this.$opts.timeout = timeout;
    },
    
    /**
     * Dependency객체를 추가한다. DependencyChain에 추가되는
     * Dependency객체는 추가되는 순서대로 resolve된다.
     * @param {tau.rt.Dependency} dependency 추가할 Dependency 객체
     * @see tau.rt.Dependency
     */
    addDependency: function (dependency) {
      var suffix = this._dependencies.splice(this._offset + this._index++);
      this._dependencies.push(dependency);
      for (var i = 0, len = suffix.length; i < len; i++) {
        this._dependencies.push(suffix[i]);
      }
    },
    
    /**
     * Dependency로 추가된 외부 라이브러리들의 로딩작업을
     * 수행한다. DependencyChain은 등록된 Dependency의
     * resolve순서를 보장한다.
     */
    resolve: function () {
      var that = this;
      // context object should have <code>resolveNext</code> method!!! 
      var context = tau.mixin({ // context object which is created on the fly
        getDependencies: function () { // returns all the dependency objects
          return that._dependencies;
        },
        resolveNext: function () { // resolves next dependency object
          var current = that._offset++;
          that._index = 0; // reset index
          if (current < that._dependencies.length) {
            var dependency = that._dependencies[current];
            dependency.resolve(this);
          } else if (that._fb && current === that._dependencies.length) {
            that._fb.resolve(this);
          }
        }
      }, this.$opts, true);
      context.resolveNext();
    }
  });

  /** @lends tau.rt.Dependency.prototype */
  $class('tau.rt.Dependency').define({
    /**
     * 명시된 파라미터를 이용하여 새로운 객체를 생성한다.
     * 이 클래스의 인스턴스는 {@link tau.rt.DependencyChain} 객체에
     * 추가된다.
     * @class
     * 이 클래스는 현재 샐행할 {@link tau.rt.Application}과 의존관계가 있는
     * 외부 라이브러리 파일을 나타낸다.
     * @constructs
     * @param {String} name 어플리케이션 이름
     * @param {String} src 명시된 어플리케이션과 의존성이 있는
     * 외부 라이브러리 파일
     * @see tau.rt.DependencyChain
     */
    Dependency: function (name, src) {
      this._name = name;
      this._src = src;
    },
    
    /**
     * 현재 Dependency로 표현된 외부라이브러리가 먼저
     * resolving 되어 있는지 여부를 확인하고 그 결과를
     * 반환한다. 만약 기존에 resolve되어 있다면 false를
     * 반환한다.
     * @returns {Boolean} 만약 기존에 해당 라이브러리가 로딩되었다면
     * false를 반환한다.
     */
    needToResolve: function () {
      return (this._src && _headerScriptUrls().indexOf(this._src) === -1);
    },
    
    /**
     * Resolving 프로세스의 결과를 처리한다. 이때 사용되는
     * context는 DependencyContext로써 내부적으로 생성된다.
     * DependencyContext가 제공하는 메소드는
     * getDependencies(),와 resolveNext()메소드가 있다.
     * @param {Object} context 내부적으로 생성된 DependencyContext 객체
     * @param {Boolean|null} success 결과 상태, 만약 null이면
     * resolving과정이 bypass된 것을 의미한다.
     */
    handleResult: function (context, success) {
      var msg = (success === null) ? ' ignores importing: ' : 
            (success) ? ' imported: ' : ' FAILED to import: ';
      tau.log.info(this._name + msg + '\"' + this._src + '\"',  this);
      context.resolveNext();
    },
    
    /**
     * 실제 Resolving작업을 수행한다.
     * @param {Object} context Dependency Context
     */
    resolve: function (context) {
      if (typeof $require !== 'undefined') {
        $require.path = this._src; // remember current file path
      }
      if (this.needToResolve()) {
        (new tau.ScriptHelper({ // proceeds asynchronously
          noCache: context.noCache,
          timeout: context.timeout,
          autoUnload: context.autoUnload,
          callbackFn: tau.curry(this.handleResult, this, context, true),
          timeoutFn: tau.curry(this.handleResult, this, context, false)
        })).load(this._src);
      } else {
        this.handleResult(context, null); // notice second paramter is null
      }
    }
  });
  
   /** @lends tau.rt.InstallDependency.prototype */
  $class('tau.rt.InstallDependency').extend(tau.rt.Dependency).define({
    /**
     * 명시된 파라미터를 이용하여 새로운 객체를 생성한다. 새로
     * 생성된 인스턴스는 {@link tau.rt.DependencyChain} 객체에
     * 추가된다.
     * @class
     * 이 클래스는 각 어플리케이션별 필요한 config파일을
     * 로딩하기 위한 기능들을 구현한다.
     * @constructs
     * @param {String} name 어플리케이션 이름
     * @param {String} src {@link tau.rt.Module}이 설치되기 위해
     * 필요한 config file
     * @param {boolean} isSys 현재 {@link tau.rt.Module}이 시스템
     * 모듈이면 true를 사용한다.
     * @extends tau.rt.Dependency
     * @see tau.rt.DependencyChain
     */
    InstallDependency: function (name, src, isSys) {
      this._isSys = isSys;
      this.$conf = null;
    },
  
    /**
     * 부모클래스의 메소드를 Override하여 config 파일의 정보를
     * 처리한다.
     * @param {Object} context 내부적으로 생성된 DependencyContext 객체
     * @param {Boolean|null} success 결과 상태, 만약 null이면
     */
    handleResult: function (context, success) {
      if (success) {
        var conf = GLOBAL.config.current;
        conf = tau.isString(conf) ? tau.parse(conf) : conf;
        conf.name = this._name;
        conf.$mutable = !this._isSys; // need to fix!!
        if (!conf.icon) {
          conf.icon = conf.apps ? _ICONPATH : '/icon.png'; // if dashboard
        }
        conf.icon = _resolvePath(conf.icon, conf.name);
        conf.splash = conf.splash ? _resolvePath(conf.splash, conf.name) : null;
        if (!conf.title) { // if not specified, use app name instead
          conf.title = conf.name;
        }
        this.$conf = conf;
      } else {
        tau.log.error('Unable to INSTALL module: ' + this._name);
      }
      tau.rt.InstallDependency.$super.handleResult.apply(this, arguments);
    }
  });
  
  /** @lends tau.rt.Dashboard.prototype */
  $class('tau.rt.Dashboard').extend(tau.rt.Module).define({
    
    $static: {
      CONFIG: {
        version       : '1.0.0',      // Dashboard version (required)
        vendor        : 'KT',  // Vendor name
        
        /** TODO: Currently unused */
        language      : 'ko',         // Default language
        region        : 'KR'          // Default regional settings
      }
    },

    /**
     * 명시된 파라미터를 이용하여 새로운 Dashboard객체를
     * 생성한다.
     * @class
     * Multi-Tasking을 위한 Dashboard기능을 구현하는 클래스
     * @constructs
     * @extends tau.rt.Module
     * @param {Object} rt Runtime 인스턴스
     * @param {Object} config Dashboard config 객체
     */
    Dashboard: function (rt, config) { //$ tau.rt.Dashboard
      this._config = tau.mixin(config, tau.rt.Dashboard.CONFIG); // override default
      /** @private Unique module id */
      this._id = "tau-dashboard";
      
      /** @private reference for DashboardPanel */
      this.panel = null;

      /** @private Applications that are visible to the user */
      this._shortcuts = [];
      
      /** @private RootController that creates Dashboard screen */
      this._rootController = this._newController(config.dashboard);
    },
    
    /**
     * 부모클래스의 메소드를 Override하여 Install관련 이벤트를
     * 처리하며 그 이외의 이벤트들을 부모클래스로
     * Delegation시킨다.
     * @param {tau.rt.Event} e 이벤트 객체
     * @param {Object} payload 이벤트를 통해 전달되는 데이터
     * 객체
     * @see tau.rt.Module.propagateEvent
     */
    propagateEvent: function (e, payload) {
      switch (e.getName()) {
        case tau.rt.Event.RT_INSTALLED:
          this._rootController.addShortcuts(payload);
          break;
        case tau.rt.Event.RT_UNINSTALLED:
          this._rootController.removeShortcut(payload);
          break;
      }
      tau.rt.Dashboard.$super.propagateEvent.apply(this, arguments);
    },
    
    /**
     * Dashboard화면을 구성하기 위한 SceneController 객체를 로딩한다. 사용자가 설정한
     * Custom SceneController 클래스가 설정되어 있다면 이 클래스를 로딩하여 
     * SceneController로 사용한다. 만약 설정된 Custom SceneController클래스가 없다면
     * Default SceneController인 <code>tau.ui.DashboardController</code>의 
     * 객체를 반환한다. Custom SceneController 클래스는 환경설정파일인 
     * <code>config.json</code>에서 설정한다. 이때 키는 다음과 같이 사용한다.
     * <p/>
     * 사용자가 Custom SceneController를 만들기 위해서는 반드시 
     * <code>tau.ui.DashboardController</code>를 상속받아 작성해야 한다. 
     * <pre>
     * config({
     *   ...
     *   dashboard    : {columns: 4, controller: ''}
     *   ...
     * });
     * </pre>
     * @param {Object} cofig global configuration object
     * @returns {tau.ui.DashboardController} Dashboard화면 구성을 위해 사용할 
     * SceneController 객체
     * @throws {TypeError} 사용자가 작성한 SceneController 클래스가
     * <code>tau.ui.DashboardController</code>을 상속받지 않았을 경우
     * @private
     */
    _newController: function (config) {
      var usrclazz = config ? config.controller : null;
      if (usrclazz) {
        usrclazz = $class.forName(usrclazz);
        var instance = new usrclazz(this); 
        if (!(instance instanceof tau.ui.DashboardController)) {
          throw new TypeError(instance.toString().concat(
              ' is not an instance of DashboardController', this.currentStack()));
        }
        return instance;
      }
      return new tau.ui.DashboardController(this); // fallback controller
    },
    
    /**
     * Dashboard에서 Shortcut을 출력하기 위해 사용할 컬럼의
     * 개수를 반환한다. Default값은 4이다.
     * @returns {Number} Shortcut을 표시할 컬럼 개수
     */
    getCols: function () {
      return this._config.dashboard.cols || 4;
    },
    
    /**
     * Shortcut을 표시하기 위한 최대 컬럼의 개수를 반환한다.
     * Default값은 5이다.
     * @returns {Number} 최대 컬럼 개수
     */
    getMaxCols: function () {
      return this._config.dashboard.maxcols || 5;
    },

    /**
     * 현재 Dashboard에 표시된 {@link tau.ui.Shortcut}객체들을
     * 배열로 반환한다. 만약 Shortcut이 존재하지 않는다면
     * 공백의 배열을 반환한다.
     * @returns {Array} {@link tau.ui.Shortcut} 객체를 가지는
     * 배열
     * @see tau.ui.Shortcut
     */
    getShortcuts: function () {
      return this._shortcuts;
    },

    /**
     * Dashboard에 출력할 Shortcut 객체를 추가한다. 이때 추가할 <code>shortcut</code>
     * 는 <code>tau.ui.Shortcut</code> 객체이어야 하며 독립 객체 또는 배열에 저장된
     * 형태이어야 한다.
     * @param {tau.ui.Shortcut | Array} shortcut Dashboard에 추가할 tau.ui.Shortcut 객체
     * @see tau.ui.Shortcut
     */
    addShortcut: function (shortcut) {
        this._shortcuts = this._shortcuts.concat(shortcut);
    },

    /**
     * Dashboard에 표현된 Shortcut객체들 중 한개 이상의 Shortcut을 삭제한다.
     * @param {tau.ui.Shortcut} args 삭제할 Shortcut 객체
     * @see tau.ui.Shortcut
     */
    removeShortcut: function () {
      var module = this._rt.getModule(),
          curModuleConf = module ? module.getConfig() : null;
      for (var i = 0; i < arguments.length; i++) {
        if (curModuleConf !== arguments[i]) { // Cannot remove running app
          tau.arr(this._shortcuts).remove(arguments[i]);
        } else {
          tau.log.info('Cannot remove active module: ' 
              + arguments[i].name, this);
        }
      }
    },
    
    /**
     * 명시된 Shortcut이름이 현재 Dashboard에 등록되어 있는지
     * 확인하고 그 결과를 반환한다. Dashboard에 명시된
     * Shortcut이 설치되어 있으면 true를 반환한다.
     * @param {String} name shortcut 이름
     * @returns {Boolean} 명시된 Shortcut이 설치되어 있으면
     * true를 반환한다.
     */
    hasShortcut: function (name) {
      var shortcuts = this.getShortcuts();
      for (var i = 0, len = shortcuts.length; i < len; i++) {
        if (shortcuts[i].name === name) { // compare class name ??
          return true;
        }
      }
      return false;
    }
  });

  /** @lends tau.rt.StorageContext.prototype */
  $class('tau.rt.StorageContext').define({
    /**
     * 명시된 파라미터를 이용하여 새로운 객체를 생성한다.
     * 인덱스로 사용될 name 값을 이용하여 localStorage에
     * 데이터를 저장하고 추출한다.
     * <p/>
     * localStorage는 객체 저장을 지원하지 않지만 내부적으로
     * 저장된 객체를 stringify메소드를 통해 문자열로 변환한
     * 다음 localStorage객체에 저장한다.
     * @class
     * Persistent한 데이터 저장소를 관리하기 위한 기능들을
     * 정의한다.
     * @constructs
     * @param {String} name Storage context 이름
     * @param {Boolean} reloadOnRead true이면 값을 가져올 때 마다
     * localStorage를 refresh한다.
     * @param {String} platformId 유일한 아이디 값
     * @throws {Error} 브라우저가 localStorage를 지원하지
     * 않을 경우
     */
    StorageContext: function (name, reloadOnRead, platformId) {
      if (!localStorage) {
        throw new Error('tau.rt.StorageContext: Web localStorage unsupported');
      }
      /** @private Platform ID must be unique to the device application */
      this._platformId = platformId || _RTCONFIG.id;
      /** @private Reloads data from localStorage for each _getStorage call */
      this._reloadOnRead = reloadOnRead;
      if (!this.setContextName(name)) {
        throw new Error('tau.rt.StorageContext: invalid context name: ' + name);
      }
      return this;
    },

    /**
     * If the storage instance was not initialized, it will fetch the context
     * indexed localStorage value.
     * @private
     * @returns {Object} Contexted localStorage object
     */
    _getStorageObj: function () {
      if (!this._storage || this._reloadOnRead) {
        var storage = localStorage[this._ctxKey];
        if (tau.isString(storage)) {
          this._storage = tau.parse(storage);
        } else {
          this._storage = {};
        }
      }
      return this._storage;
    },

    /**
     * 생성자에서 설정한 Context의 이름을 반환한다.
     * @returns {String} Context이름
     */
    getContextName: function () {
      return this._name;
    },

    /**
     * StorageContext의 이름을 설정한다. <p/>
     * 동일한 이름의 Context는 데이터를 공유한다.
     * @param {String} name Storage context 이름
     * @returns {Boolean} context이름이 정상적으로 설정되었다먼 true를 반환
     */
    setContextName: function (name) {
      if (tau.isString(name) && this._name !== name) {
        /** @private Name used for localStorage: 'tau.<PlatformID>.<ctxName>' */
        this._name = name;
        /** @private LocalStorage key: 'tau.<PlatformID>.<name>' */
        this._ctxKey = 'tau.' + this._platformId + '.' + this._name;
        this._storage = null; // Remove previously set storage
        return true;
      }
      return false;
    },

    /**
     * 명시된 key에 해당하는 값을 반환한다.
     * @param {String} key 값을 set하기 위해 사용된 key
     * @returns {Object} 해당하는 키에 설정된 값
     * @see tau.rt.StorageContext#set
     */
    get: function (key) {
      return this._getStorageObj()[key];
    },

    /**
     * 명시된 키를 이용하여 value를 저장한다.
     * @param {String} key 값을 저장하기 위한 key 문자열
     * @param {Object} value 저장하기 위한 객체
     * @returns {Boolean} 값이 정상적으로 저장되었다면 true를
     * 반환한다.
     */
    set: function (key, value) {
      if (tau.isString(key) && tau.isValue(value)) {
        // Set respective storage data key/value, then flush to localStorage
        this._getStorageObj()[key] = value;
        this.flush();
        return true;
      }
      return false;
    },

    /**
     * 현재 StorageContext에 저장된 값들 중 명시된 키(key)에
     * 해당하는 값을 제거한다.
     * @param {String} key 삭제할 값의 키
     * @returns {Boolean} 정상적으로 삭제되었다면 true를 반환한다.
     */
    remove: function (key) {
      // Set respective storage data from key, then flush to localStorage
      if (delete this._getStorageObj()[key]) {
        this.flush();
        return true;
      }
      return false;
    },

    /**
     * 명시된 인덱스에 해당하는 키를 StorageContext에서 찾아 반환한다.
     * @param {Number} index 인덱스 값
     * @returns {String} key 문자열
     */
    key: function (index) {
      var k, 
          i = 0,
          storage = this._getStorageObj();
      // Search index key value
      for (k in storage) {
        if (storage.hasOwnProperty(k)) {
          if (index === i) {
            return k;
          }
          i++;
        }
      }
      return null;
    },

    /**
     * 현재 StorageContext에 저장된 모든 값(key/value)을
     * 삭제한다.
     */
    clear: function () {
      // Clear entire storage, then remove the respective key from localStorage
      this._storage = {};
      localStorage.removeItem(this._ctxKey);
    },

    /**
     * Temporary로 가지고 있는 객체를 localStorage객체로
     * 저장한다. 이때 저장될 객체는 stringify메소드를 통해
     * 문자열로 변환된다.
     */
    flush: function () {
      localStorage[this._ctxKey] = tau.stringify(this._getStorageObj());
    }
  });


  /** @lends tau.rt.ApplicationContext.prototype */
  $class('tau.rt.ApplicationContext').define({
    /**
     * 명시된 파라미터를 이용하여 새로운 객체를 생성한다.
     * @class
     * Application의 정보인 ID, localStorage등의 정보에 접근할
     * 수 있는 기능을 정의한다.
     * @constructs
     * @param {Object} module 어플리케이션의 {@link tau.rt.Module} 객체
     */
    ApplicationContext: function (module) {
      this._module = module;
    },

    /**
     * 현재 모듈({@link tau.rt.Module})의 ID를 반환한다.
     * @returns {String} 현재 모듈의 ID
     */
    getId: function () {
      return this._module.getId();
    },

    /**
     * 명시된 리소스 경로에 대한 절대경로를 반환한다.
     * <p/>
     * 리소스는 반드시 "/", "$shared", 또는 전체경로 형태로
     * 표현되어야 한다.
     * @param {String} path 리소스의 상대경로
     * @returns {String} 명시된 상대경로를 바탕으로한 절대경로
     */
    getRealPath: function (path) {
      return _resolvePath(path, this._module.getName());
    },

    /**
     * 현재 {@link tau.rt.Application}의 config정보를 반환한다.
     * @returns {Object} 현재 Application의 config정보
     */
    getConfig: function () {
      return this._module.getConfig();
    },

    /**
     * 명시된 파라미터를 바탕으로 {@link tau.rt.StorageContext}를 반환한다.
     * @param {String} key 키로 사용할 문자열
     * @param {String} scope Storage scope 이름
     * @return {tau.rt.StorageContext} 명시된 키에 해당하는 StorageContext객체
     * @see tau.rt.StorageContext
     */
    getStorage: function (key, scope) {
      return this._getStorageCtx(scope).get(key);
    },

    /**
     * 명시된 객체를 키와 범위를 이용하여 저장한다.
     * @param {String} key 키로 사용할 문자열
     * @param {String} value 저장할 객체
     * @param {String} scope Storage scope 이름
     * @returns {Boolean} 성공적으로 저장되었으면 true를
     * 반환한다.
     */  
    setStorage: function (key, value, scope) {
      return this._getStorageCtx(scope).set(key, value);
    },
  
    /**
     * 명시된 키와 scope를 이용하여 저장된 값을 삭제한다.
     * @param {String} key 키로 사용할 문자열
     * @param {String} scope Storage scope 이름
     */  
    removeStorage: function (key, scope) {
      return this._getStorageCtx(scope).remove(key);
    },

    /**
     * 명시된 인덱스와 scope에 해당하는 키를 반환한다.
     * @param {Number} index 찾고자 하는 키의 인덱스
     * @param {String} scope storage scope 이름
     */ 
    storageKey: function (index, scope) {
      return this._getStorageCtx(scope).key(index);
    },

    /**
     * 명시된 scope에 저장된 모든 값들을 삭제한다.
     * @param {String} scope storage scope 이름
     */
    clearStorage: function (scope) {
      return this._getStorageCtx(scope).clear();
    },

    /**
     * 현재 모듈에 설정된 Badge 값을 저장한다.
     * @param {String|Number} value 저장할 Badge 값
     * @returns {Boolean} 성공적으로 저장이 되었다면 true를
     * 반환
     */
    setBadge: function (value) {
      return this._module.setBadge(value);
    },

    /**
     * 현재 모듈에 설정된 Badge값을 반환한다.
     * @returns {String|Number} 설정된 Badge 값
     */
    getBadge: function () {
      return this._module.getBadge();
    },

    /**
     * 현재 모듈에 설정된 Badge값을 삭제한다.
     * @returns {Boolean} 정상적으로 삭제되었다면 true를
     * 반환한다.
     */
    removeBadge: function () {
      return this._module.removeBadge();
    },

    /**
     * 명시된 scope에 해당하는 StorageContext를 반환한다. 만약
     * scope가 명시되지 않으면 현재 모듈의 scope가 사용된다.
     * @param {String} scope storage scope 이름
     * @private
     */
    _getStorageCtx: function (scope) {
      if (!scope) {
        return this._module.getStorageCtx();
      } else if (tau.isNamespace(scope)) {
        scope = '$' + scope; // Append $ to the scope name for uniqueness
        if (!this._ctx) {
          this._ctx = [];
        }
        if (!this._ctx[scope]) {
          this._ctx[scope] = new tau.rt.StorageContext(scope);
        }
        return this._ctx[scope];
      }
      throw new Error('tau.rt.ApplicationContext: Invalid scope namespace, \"' 
          + scope + '\"');
    },
    
    /**
     * 현재 application의 theme을 명시된 themeName으로 변경한다.
     * <p/>
     * @param {String} themeName 변경할 Theme 이름
     */
    setTheme: function (themeName){
      tau.getRuntime().$themeMgr.setTheme(this.getConfig(), themeName);
    },
    
    /**
     * config에 설정된 default theme로 초기화한다.
     */
    resetTheme: function () {
      tau.getRuntime().$themeMgr.resetTheme(this.getConfig());
    }

  });


  /** @lends tau.rt.Theme.prototype */
  $class('tau.rt.Theme').define({

    /**
     * 명시된 themeName을 이용하여 새로운 객체를 생성한다.
     * @class
     * 테마에 해당하는 css파일을 동적으로 로드하고 언로드해 주는 class
     * @constructs
     * @param {String} themeName theme 텍스트
     */
    Theme: function (themeName){
      this._themeName = themeName;
      this._loaded = false;
    },

    /**
     * 생성자에 명시된 theme 이름을 이용하여 theme을 로드한다.
     * <p/>
     * @param {Boolean} enable theme 활성화 여부
     * @param {Function} callbackfn Theme이 로드되면 호출될
     * callback 함수
     */
    load: function (enable, callbackfn) {
      var theme = this;
      if (!theme.isLoded()){
        if (!theme._css){
          theme._css = new tau.ScriptHelper({
            type: 'css',
            url: 'lib/resources/themes/' + theme._themeName + '/tau.css'
          });
        }
        theme._css.load(null, function () {
          theme._loaded = true;
          if (tau.isFunction(callbackfn)) callbackfn();
        });
      } else {
        theme._loaded = true;
        if (tau.isFunction(callbackfn)) callbackfn();
      }
      if (enable) {
        theme._css.reload();
      } else {
        theme._css.unload(true);
      }
    },

    /**
     * 현재 사용하고 있는 theme을 언로드한다.
     * @param {Boolean} disabled <code>true</code>이면 
     * link diabled attribute를 diabled로 설정하고 
     * _loaded property는 그대로 true로 유지한다.  
     */
    unload: function (disabled) {
      if (this.isLoded()){
        this._css.unload(disabled);
      }
      if (!disabled) {
        this._loaded = false;
      }
    },

    /**
     * theme이 로드되어 있는지 여부를 체크한다.
     * @return {Boolean} theme 로드 여부
     */
    isLoded: function () {
      return this._loaded;
    }
  });
  
  /** @lends tau.rt.ThemeManager.prototype */
  $class('tau.rt.ThemeManager').define({

    $static: /** @lends tau.rt.ThemeManager */ {
      DEFAUT_THEME : 'default'
    },

    /**
     * 명시된 {@link tau.rt.Runtime}을 이용하여 새로운 객체를
     * 생성한다.
     * @class
     * default, app의theme을 등록하고, default, app의 theme을 변경해 주는 class.
     * @constructs
     * @param {tau.rt.Runtime} rt Runtime 객체
     */
    ThemeManager: function (rt){
      /** @private Runtime instance */
      this._rt = rt;
      /** @private supported themes */
      this._themes = {};
      this._currentTheme = null;
      this._defaultThemeName = null;
    },

    /**
     * default theme의 이름을 반환한다.
     * @return {String} default theme 이름
     * @private
     */
    _getDefaultThemeName: function () {
      if (!this._defaultThemeName){
        if (this._rt.isMultiApp()){ // multi app
          var themeName, 
              storageCtx = this._rt.createStorageCtx('$dashboard'),
              config = this._rt.getModuleConfig('$dashboard');
          if (storageCtx) {
              themeName = storageCtx.get('$theme');
          }
          this._defaultThemeName = themeName || config.theme;
        }
        this._defaultThemeName = this._defaultThemeName || tau.rt.ThemeManager.DEFAUT_THEME;
      }
      return this._defaultThemeName;
    },

    /**
     * application의 theme의 이름을 반환한다.
     * @param {Object} config application의 configuration object
     * @return {String} theme 이름
     * @private
     */
    _getThemeName: function (config) {
      var storageCtx = this._rt.createStorageCtx(config.name);
      return storageCtx.get('$theme') || config.theme || this._getDefaultThemeName();
    },

    /**
     * {@link tau.rt.Theme} instance를 반환한다.
     * <p/>
     * 키에 해당하는 {@link tau.rt.Theme} instance가 존재하지 않은 경우에는
     * {@link tau.rt.Theme} instance을 생성해서 반환한다.
     * @param {String} themeName theme 객체를 가져오기 위한 theme 이름
     * @return {tau.rt.Theme} theme {@link tau.rt.Theme} instance
     * @private
     */
    _getTheme: function (themeName) {
      if (!tau.isString(themeName)){
        return null;
      }
      if (!this._themes.hasOwnProperty(themeName)){
        this._themes[themeName] = new tau.rt.Theme(themeName);
      }
      return this._themes[themeName];
    },
    
    /**
     * application의 theme의 이름을 설정하고 
     * 새로운 theme을 로드하며 이전에 적용되어 있는 theme을 언로드한다.
     * @param {Object} config application의 configuration 객체
     * @param {String} themeName 설정할 theme 이름
     */
    setTheme: function (config, themeName){
      var manager = this;
      
      function themeloaded () {
        this.loadTheme({config: config, themeName: themeName});
        var storageCtx = this._rt.createStorageCtx(config.name);
        if (storageCtx){
          storageCtx.set('$theme', themeName);
        }
        this._rt.unsubscribeEvent(tau.rt.Event.RT_THEME_LOADED, themeloaded);
      };
      
      if (this.register(config, themeName)){
        themeloaded.call(this, config, themeName);
      } else {
        this._rt.onEvent(tau.rt.Event.RT_THEME_LOADED, themeloaded, manager);
      }
    },

    /**
     * default {@link tau.rt.Theme}의 이름을 설정하고, 
     * 현재 application이 default theme으로 설정되어 있는 경우
     * default {@link tau.rt.Theme}을 load하고 이전에 적용되어 있는 
     * {@link tau.rt.Theme}은 언로드한다.
     * @param {String} themeName 설정할 theme 이름
     */
    setDefaultTheme: function (themeName) {
      var module, config;
      
      if (themeName != this._defaultThemeName){
        this._defaultThemeName = themeName;
        
        if (this._rt.isMultiApp()){ // multi app
          var storageCtx = this._rt.createStorageCtx('$dashboard');
          module = this._rt.getModule();
          if (module){
            config = module.getConfig();
            
            if (storageCtx) {
              storageCtx.set('$theme', themeName);
            }
            if (themeName == this._getThemeName(config)){
              this.loadTheme({config : config, themeName : themeName});
            }
          }
        } else { // single app
          module = this._rt.getModule();
          if (module){
            config = module.getConfig();
            this.setTheme(config, themeName);
          }
        }
      }
    },
    
    /**
     * application에 설정된 theme을 등록한다.<p/>
     * Theme이 로딩되면 Runtime객체에
     * {@link tau.rt.Event.RT_THEME_LOADED}이벤트가 발생된다.
     * @param {Object} config application의 configuration object
     * @param {String} themeName 등록할 theme 이름
     */
    register: function (config, themeName) {
      var theme, manager = this;
      if (tau.isUndefined(themeName)) {
        themeName = this._getThemeName(config);
      }
      theme = this._getTheme(themeName);
      if (theme){
        if (!theme.isLoded()){
          theme.load(false, function(){
            manager._rt.fireEvent(tau.rt.Event.RT_THEME_LOADED, config.name);
          });
          return false;
        }
      }
      return true;
    },
    
    unregister: function (themeName) {
      //TODO
    },
    
    /**
     * 새로운 theme을 로드하고 이전에 적용되어 있는 theme은 언로드한다.
     * <p/>
     * themeName이 없는 경우에는 현재 application에 설정되어 있는 theme을 로드한다.
     * @param {Object} opts 
     * @param {Object} [opts.config] Module config
     * @param {String} [opts.themeName] Loading할 theme 이름
     * @param {tau.rt.Module} [opts.module] Theme과 관련된
     * Module 객체
     */
    loadTheme: function (opts){
      var manager = this,
          module, themeName, config, newTheme;
      
      if (opts){
        config = opts.config;
        themeName = opts.themeName;
        module = opts.module;
      }
      
      if (!themeName){
        if (!config){
          module = manager._rt.getModule();
          if (module){
            config = module.getConfig();
          }
        }
        themeName = this._getThemeName(config);
      }
      
      if (tau.isString(themeName)){
        newTheme = this._getTheme(themeName);
        
        if (newTheme){
          newTheme.load(true, function(){
            if (manager._currentTheme && manager._currentTheme !== newTheme){
              manager._currentTheme.unload(true);
            }
            manager._currentTheme = newTheme;
            if (module) {
              module.fireEvent(tau.rt.Event.RT_THEME_ENABLED);
            } else {
              manager._rt.fireEvent(tau.rt.Event.RT_THEME_ENABLED);
            }
          });
          return false;
        }
      }
      if (module) {
        module.fireEvent(tau.rt.Event.RT_THEME_ENABLED);
      } else {
        manager._rt.fireEvent(tau.rt.Event.RT_THEME_ENABLED);
      }
      return true;
    },
    
    /**
     * appplication에 적용되어 있는 theme을 언로드한다.
     * <p/>
     * @param {Object} config application의 configuration object
     */
    unloadTheme: function (config) {
      var theme, defaultTheme;
      if (config){
        theme = this._getTheme(config.theme);
        if (theme){
          defaultTheme = this._getTheme(this._getDefaultThemeName());
          if (defaultTheme) defaultTheme.load(true);
        }
      }
    },

    /**
     * appplication의 config에 적용되어 있는 theme으로 초기화한다.
     * <p/>
     * @param {Object} config application의 configuration object
     */
    resetTheme: function (config) {
      var storageCtx = this._rt.createStorageCtx(config.name);
      if (storageCtx){
        storageCtx.remove('$theme');
      }
      if (config.name === '$dashboard'){
        this._defaultThemeName = null;
      }
      this.loadTheme({config : config});
    }
  });

  /**
   *  @lends tau.rt.Clipboard.prototype
   */
  $class('tau.rt.Clipboard').define({
    /**
     * 새로운 Clipboard객체를 생성한다. 이 객체는 주로
     * Runtime에 의해 유지관리 된다.
     * @class
     * Temporary로 생성되는 DOM객체들을 저장하기 위한 기능들을
     * 정의한 클래스이다.
     * @constructs
     */
    Clipboard: function() {
      this._buf = {};
    },
    
    /**
     * 명시된 DOM 노드를 HTML DOM트리로 부터 잘라내서
     * Clipboard객체 내부에 관리한다. 이때 DOM 객체는 명시된
     * 키(key)로 유지 관리되며, id로 사용된다.
     * @param {String} key DOM노드를 관리하기 위한 키 문자열
     * @param {Node} node HTML DOM트리에서 잘라낸 DOM 노드
     */
    cut: function (key, node) {
      if (node.parentNode) {
        if (!key) {
          key = node.id = tau.genId('clip');
        }
        this._buf[key] = node.parentNode.removeChild(node);
      }
    },
    
    /**
     * 명시된 키로 저장된 DOM노드를 container의 자식노드로
     * 추가한다.
     * @param {String} key DOM노드를 관리하기 위한 키 문자열
     * @param {Node} container DOM노드가 추가될 부모노드
     */
    paste: function (key, container) {
      if (this._buf[key]) {
        container.appendChild(this._buf[key]);
        delete this._buf[key];
      }
    },
    
    /**
     * 명시된 키로 관리되고 있는 DOM노드를 Clipboard로 부터
     * 삭제한다.
     * @param {String } key DOM노드를 관리하기 위한 키 문자열
     */
    remove: function (key) {
      if (this._buf[key]) {
        delete this._buf[key];
      }
    },
    
    /**
     * Clipboard에 의해 관리되는 모든 DOM 노드들을
     * 삭제한다.
     */
    clear: function () {
      var p, buf = this._buf;
      for (p in buf) {
        if (buf.hasOwnProperty(p)) {
          delete this._buf[p];
        }
      }
    }
  });
}) (window);
