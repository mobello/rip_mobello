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
     * Singleton Runtime instance getter.
     * @returns {Object} Singleton {@link tau.rt.Runtime} instance
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
     * Returns the configuration for the current module.
     * <p/>
     * If a module name is provided, it will attempt to return the the 
     * configuration for the specified name; otherwise, it will return the 
     * currently running module's configuration object.
     * @param {String} name Name of the module for the requested configuration 
     * @returns {Object} A module's configuration object
     */
    getConfig: function (name) {
      return tau.getRuntime().getModuleConfig(name);
    },

    /**
     * Returns an Application Context for the current application.
     * @returns {Object} Curren't module's {@link tau.rt.ApplicationContext}
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
   * @namespace Runtime Module.
   */
  tau.namespace('tau.rt', /** @lends tau.rt */
  {
    /** 
     * android 여부 
     * @type Boolean 
     */
    isAndroid: /android/i.test(_USERAGENT),
    /** 
     * android 버전 2 여부
     * @type Boolean 
     */
    isAndroidVer2: /android 2./i.test(_USERAGENT),
    /** 
     * ipad 여부
     * @type Boolean 
     */
    isIPad: /ipad/i.test(_USERAGENT),
    /** 
     * iphone 여부
     * @type Boolean 
     */
    isIPhone: /iphone/i.test(_USERAGENT),
    /** 
     * webkit browser 여부
     * @type Boolean 
     */
    isWebkit: /webkit/i.test(_USERAGENT),
    /** 
     * chrome browser 여부
     * @type Boolean 
     */
    isChrome: /chrome/i.test(_USERAGENT),
    /** 
     * safari browser 여부
     * @type Boolean 
     */
    isSafari: /safari/i.test(_USERAGENT),
    /** 
     * ie browser 여부
     * @type Boolean 
     */
    isIE: /msie/i.test(_USERAGENT),
    /** 
     * orientationchange 지원여부
     * @type Boolean 
     */
    hasOrientationChange: ('onorientationchange' in GLOBAL),
    /** 
     * touch 지원여부
     * @type Boolean 
     */
    hasTouch: ('ontouchstart' in GLOBAL) && !/chrome/i.test(_USERAGENT),
    /** 
     * 3D 지원여부
     * @type Boolean 
     */
    has3D: ('WebKitCSSMatrix' in GLOBAL && 'm11' in new WebKitCSSMatrix())
  });


  /** @lends tau.rt.Event */
  $class('tau.rt.Event').define({ //$ tau.rt.Event
    $static: /** @lends tau.rt.Event */{
      /** 탭 이벤트 타입. 화면을 터치한 상태에서 움직이지 않고 뗄 경우 발생 */
      TAP           : 'tap',
      /** 터치 시작 이벤트. 화면에 터치되는 순간 발생 */
      TOUCHSTART    : 'touchstart',
      /** 터치 이동 이벤트. 화면에 터치한 상태에서 떼지않고 이동할 경우 발생 */
      TOUCHMOVE     : 'touchmove',
      /** 터치 종료 이벤트. 터치한 다음 화면에서 뗄 경우 발생 */
      TOUCHEND      : 'touchend',
      /** 
       * 터치 취소 이벤트. Runtime에서 발생하는 이벤트이며 시스템 처리를 위해
       * 사용자 이벤트를 취소시키고자 할 경우 발생
       */
      TOUCHCANCEL   : 'touchcancel',
      /** Gesture 시작 */
      GESTURESTART  : 'gesturestart',
      /** Gesture 이동 */
      GESTUREMOVE   : 'gesturechange',
      /** Gesture 종료 */
      GESTUREEND    : 'gestureend',
      /** css3 transition이 종료된 후 발생 */
      TRANSITIONEND : 'webkitTransitionEnd',

      /** Component가 Container에 추가되면 발생되는 이벤트 */
      COMPADDED     : 'compadded',
      /** Component가 Container에 제거되면 발생되는 이벤트 */
      COMPREMOVED   : 'compremoved',
      /** Component가 draw된 후 발생되는 이벤트 */      
      COMPDRAWN     : 'compdrawn',
      /** Component의 root DOM element가 DOM tree에서 삭제된 후 발생되는 이벤트 */            
      COMPCLEAR     : 'compcleared',

      /** Scene이 로딩된 직후 발생되는 이벤트 */
      SCENELOADED   : 'sceneloaded',
      /** Scene이 그려진 직후 발생되는 이벤트 */
      SCENEDRAWN    : 'scenedrawn',
      /** 값이 변경된 직후 발생되는 이벤트 */
      VALUECHANGE   : 'valueChange',
      /** 사용자 선택이 변경된 직후 발생되는 이벤트 */
      SELECTCHANGE  : 'selectChange',
      /** Orientation 변경 이벤트 */
      ORIENTATION   : 'orientationchange',
      
      /** Ajax 요청이 전송된 직후 발생되는 이벤트 */
      REQ_SENT      : 'requestsent',
      /** Ajax 결과를 받은 직후 발생되는 이벤트 */
      REQ_RECEIVED  : 'requestreceived',
      /** Ajax 요청이 취소될 경우 발생되는 이벤트 */
      REQ_ABORTED   : 'requestaborted',

      /** Runtime Lifecycle에서 INSTALL시 발생되는 이벤트 */
      RT_INSTALL    : 'runtimeinstall',
      /** Runtime Lifecycle에서 UNINSTALL시 발생되는 이벤트 */
      RT_UNINSTALL  : 'runtimeuninstall',
      /** Runtime Lifecycle에서 특정 앱을 실행 직후 발생되는 이벤트 */
      RT_START      : 'runtimestart',
      /** Runtime Lifecycle에서 특정 앱을 중지할 때 발생되는 이벤트 */
      RT_STOP       : 'runtimestop',
      /** Runtime Lifecycle에서 특정 앱을 시작할 때 발생되는 이벤트 */
      RT_LAUNCH     : 'runtimelaunch',
      /** Runtime Lifecycle에서 Runtime이 종료될 때 발생되는 이벤트 */
      RT_TERMINATE  : 'runtimeterminate',
      /** Runtime Lifecycle에서 설치과정을 종료한 직후 발생되는 이벤트 */
      RT_INSTALLED  : 'runtimeinstalled',
      /** Runtime Lifecycle에서 UNINSTALL과정을 종료한 직후 발생되는 이벤트 */
      RT_UNINSTALLED  : 'runtimeuninstalled',
      /** Runtime Lifecycle에서 theme이 load된 직후 발생되는 이벤트 */
      RT_THEME_LOADED  : 'runtimethemeloaded',
      /** Runtime Lifecycle에서 theme이 load가 되고 사용가능하게 된 직후 발생되는 이벤트 */
      RT_THEME_ENABLED  : 'runtimethemeenabled',
      /** Runtime에서 모듈(Module)이 foreground background로 변경될 때 발생되는 이벤트 */
      RT_APP_CHANGE: 'appchange',
      /** Controller가 foreground 또는 background로 변경될 때 발생되는 이벤트 */
      RT_CTRL_CHANGE: 'controllerchange',
              
      /** 이벤트의 단계중 CAPTURING단계를 나타낸다. */
      CAPTURING_PHASE : 1,
      /** 이벤트의 단계중 TARGET단계를 나타낸다. */
      AT_TARGET       : 2,
      /** 이벤트의 단계중 BUBBLING단계를 나타낸다. */
      BUBBLING_PHASE  : 3
    },


    /**
     * @class
     * An Event is the propagating object for fired event.
     * @constructs
     * @param {String} name Event name
     * @param {Object} source Parent {@link tau.rt.EventDelegator} instance
     * @param {Array} touches Every finger currently touching the screen
     * @param {Array} targetTouches Filters touches that started in same node
     * @param {Array} changedTouches Only the touches that initiated the event
     */
    Event: function (name, source, touches, targetTouches, changedTouches) {
      this._name = name;
      this._source = source;
      this._alwaysBubble = false;
      this._stopPropagation = false;
      this._preventDefault = false;
      this.timeStamp = new Date();    
      this.eventPhase = 0; // NONE, if user created mannually
      
      // Touch Event members
      if (touches) {
        this.touches = touches;
        this.targetTouches = targetTouches || touches;
        this.changedTouches = changedTouches || touches;
      }
    },

    /**
     * Returns the event name. 
     * @returns {String} Event Name
     */
    getName: function () {
      return this._name;
    },

    /**
     * Returns the original {@link tau.rt.EventDelegator} from which this 
     * event was created.
     * @returns {Object} EventDelegator object instance
     */
    getSource: function () {
      return this._source;
    },

    /**
     * Stops all further event propagation by ignoring all remaining  
     * listener callback functions and bubbling.
     */ 
    stopPropagation: function () {
      this._stopPropagation = true;
    },

    /**
     * Prevents the propagation from calling the default function.
     */
    preventDefault: function () {
      this._preventDefault = true;
    },

    /**
     * By default, an event will stop propagating if it was handled by at least 
     * one listener. Setting this option will cause it to continue bubbling
     * even if it was processed.
     * @returns {Boolean} True will cause bubbling to occur on all occasions
     */
    alwaysBubble: function () {
      this._alwaysBubble = true;
    }
  });


  /** @lends tau.rt.EventPublisher */
  $class('tau.rt.EventPublisher').define({
    /**
     * @class
     * EventPublisher is used to bind an interesting moment with a single, or 
     * multiple, subroutine(s). Its main purpose is to maintain these functions as
     * listeners to be called back when that interesting moment occurs.
     * <p/>
     * It also manages the state, default behavior, and interruption handling  
     * during event propagation. For example, a user may force an event to stop 
     * propagating by calling the <code>stopPropagation</code> function.
     * <p/> 
     * An interesting moment is defined by a unique name within an object of type
     * {@link tau.rt.EventDelegator}. Therefore, no two identical event name
     * may exist for an EventDelegator.
     * @constructs
     * @param {String} name Event name
     * @param {Object} source Parent {@link tau.rt.EventDelegator} instance
     * @param {Object} opts Event Options
     * @throws {Error} Name/source parameters must be valid
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
     * Initializes/resets the Event.
     * <p/>
     * Null/Undefined parameter will reset the entier event state.
     * @param {Object} opts Event Options
     * @param {Boolean} keepListeners True will keep all previous listeners
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
     * Name defined for this event.
     * @returns {String} Event name
     */
    getName: function () {
      return this._name;
    },

    /**
     * EventDelegator from which this event was originated.
     * @returns {Object} EventDelegator object instance
     */
    getSource: function () {
      return this._source;
    },

    /**
     * Returns all registered callback functions.
     * @param {Boolean} capture if true, returns all the listeners that is
     * invoked on capture phase, otherwise bubble up phase. 
     * @returns {Array} Event listening callback functions
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
     * Executes the callback functions for all listeners on the Event.
     * <p/>
     * Calling {@link Event.stopPropagation} at any time during event 
     * propagation will immediately call the EventPublisher's stoppedFn 
     * function; subsequently, it will interrupt, and stop, the rest of event 
     * propagation.
     * <p/>
     * Additionally, calling {@link Event.preventDefault} will prevent the 
     * EventPublisher's defaultFn from being called.
     * @param {Object} payload Data object to be delivered to the listener
     * @return {Number} Number of event listeners called 
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
     * 
     */
    notifyDefault: function (event, payload) {
      var src = event.getSource();
      if (!event._preventDefault 
          && (src === this._source || this._opts.alwaysDefault)) {
        this._opts.defaultFn.apply(this._source, arguments);
      }
    },
    
    /**
     * Finds listener internal object using specified <code>callbackFn</code>
     * function. if not found, rturns <code>null</code>. The object which will
     * be returned comply with <code>{$fn: xxx, $contexts: []}</code>
     * @param callbackFn event listener function
     * @returns listener internal object
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
     * Attaches an event listener callback function.
     * @param {Function} callbackFn Function to callback when the event occurs 
     * @param {Object} context CallbackFn's 'this' context
     * @param {Boolean} capture indicates event phase, if true then capturing
     * phase other than that bubbling up phase 
     * @returns {Boolean} true if the listener was correctly registered
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
     * Remove one, or all, listening callback function(s).
     * <p/>
     * Calling this function without a parameter will remove all listeners.
     * @param {Function} callbackFn Callback function registered to be removed
     * @param {Object} [context] CallbackFn's 'this' context 
     * @returns {Boolean} true if the listener was correctly unregistered
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


  /** @lends tau.rt.EventDelegator */
  $class('tau.rt.EventDelegator').define({
    $static: {
      DOM_CLASS_ID: 'tau' // Defines a EventDelegator for a DOM node
    },

    /**
     * @class
     * EventDelegator is a loosely-coupled hub for sending and receiving events
     * as well as wiring bubbling relationships with other EventDelegators.
     * <p/>
     * This class can be extended or augmented to any JavaScript object so that  
     * it may publish, fire, and listen to events.
     * <pre>
     *  tau.augment(tau.example.MyClass, tau.rt.EventDelegator);
     *  
     *  var myClass = new tau.example.MyClass();
     *  myClass.publishEvent("interestingMoment", {
     *    antecedentFn: function () {
     *      this.messageIntro = 'This is an interesting message: ';
     *    },
     *    defaultFn: function () {
     *      alert('Some default message.');
     *    }
     *  });
     *
     *  myClass.onEvent("interestingMoment", function (event, payload) {
     *    // Prints 'This is an interesting message: e = mc^2'
     *    alert(this.messageIntro + payload);
     *  });
     *
     *  myClass.fireEvent("interestingMoment", "e = mc^2");
     *  </pre>
     * @constructs
     */
    EventDelegator: function () { //$ tau.rt.EventDelegator
      /** @private Maps event name to tau.rt.EventPublisher */
      this.$publishedEvents = {};
      /** @private Array that manages EventDelegators to bubble up */
      this.$bubbleTargets = [];
    },

    /**
     * Find an event for a corresponding name.
     * <p/>
     * If an event doesn't exist, one will be created when the 
     * <code>create</code> flag set as true.
     * @param {String} name Event name
     * @param {Boolean} create True will create the event if it doesn't exist
     * @returns {Object} An event for a corresponding name, or one auto-created
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
     * Publishes an event to be consumed via a name and a set of options.
     * <p/>
     * Options include a <code>defaultFn</code>, which is the final function to 
     * be called during an event propagation, and a <code>stoppedFn</code>,
     * which is called when a propagation is manually halted by the user.
     * @param {String} eventName Event name
     * @param {Object} opts Event Options
     * @returns {Object} Published event object 
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
     * Fires an event for the corresponding event name or event object.
     * <p/>
     * Firing an event will execute callback listeners and handle any
     * capturing and further propagation required by the bubble up wiring.
     * @param {String|tau.rt.Event} e Event Name or Event object
     * @param {Object} payload Payload object to be carried during propagation 
     * @param {Number} delay milliseconds before the actual event is fired 
     * @returns {Boolean} True if the event was fired without error
     * @exception {TypeError} if the source object of the event is not the same
     * instance of current object.
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
     * Propagates an event for the corresponding event name.
     * <p/>
     * An event will execute callback listeners and handle any additional 
     * propagation set up by bubble up wiring.
     * @param {Object} Event instance
     * @param {Object} payload Payload object to be carried during propagation 
     * @returns {Boolean} True if the event was fired without error
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
     * Subscribes to an event with a callback function.
     * <p/>
     * The callback function will be called when <code>fireEvent</code> 
     * is called at a later time.
     * @param {String} eventName Event name
     * @param {Function} callbackFn Callback function to call on an event
     * @param {Object} context CallbackFn's 'this' context
     * @param {Boolean} capture indicates event phase, if true then capturing
     * phase other than that bubbling up phase 
     * @returns {Boolean} True if the event was registered without error
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
     * Unsubscribes an event for a specific or a callback function.
     * <p/>
     * Providing a <code>callbackFn</code> parameter will only remove the 
     * provided function reference, if it was registered to the event.
     * <p/>
     * If no callback parameter is provided, it will remove the event and
     * all of its listeners.
     * @param {String} eventName Event Name
     * @param {Function} callbackFn Callback function to remove
     * @param {Object} context CallbackFn's 'this' context
     * @returns {Boolean} True if the event was unregistered without error
     * @see tau.rt.EventDelegator.onEvent
     * @see tau.rt.EventDelegator.publishEvent
     */
    unsubscribeEvent: function (eventName, callbackFn, context) {
      var e = this.getEventPublisher(eventName);
      if (e) {
        if (callbackFn) {
          return e.removeListener(callbackFn, context);    // Just remove the callback
        } else {
          throw new ReferenceError('Event listener is not specified for the event:' 
              + eventName + this.currentStack());
        }
      } else if (!eventName) {
        for (eventName in this.$publishedEvents) {
          this.$publishedEvents[eventName].removeListener();
          delete this.$publishedEvents[eventName];
        }
      }
      return false;
    },
    
    /**
     * returns bubbles target objects on the current object hierarchy 
     * except current instance. if no bubble target is found, returns empty
     * array object.
     * @return {Array} it contains bubbling targets except current object
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
     * Returns the bubble target object of this instance. if no bubble target
     * is set, returns null
     * @return {tar.rt.EventDelegator} Bubble target object if set, 
     * otherwise null
     */
    getBubble: function () {
      return (this.$bubbleTargets.length > 0) ? this.$bubbleTargets[0] : null;
    },

    /**
     * Adds a bubble target to propagate when an even fires.
     * @param {Object} eventDelegator Event Delegator object
     * @returns {Boolean} True if bubble delegator was added without error
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
     * Removes a bubble target.
     * @param {Object} eventDelegator Event Delegator object
     * @returns {Boolean} True if bubble delegator was removed without error
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

  /** @lends tau.rt.Gesture */
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
     * @class Gesture Prototype
     * @constructs
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

  /** @lends tau.rt.PinchGesture */
  $class('tau.rt.PinchGesture').extend(tau.rt.Gesture).define({
    /**
     * @class PinchGesture class description goes here
     * @constructs
     */
    PinchGesture: function () {
      this.scale = 1;
      this.velocity = 0;
    }
  });

  /** @lends tau.rt.PanGesture */
  $class('tau.rt.PanGesture').extend(tau.rt.Gesture).define({
    /**
     * @class PanGesture class description goes here
     * @constructs
     */
    PanGesture: function (maxTouches, minTouches) {
      this.maxTouches = maxTouches || 1;
      this.minTouches = minTouches || 1;
      this.translation = 0.0;
      this.velocity = 0;
    }
  });
  
  /** @lends tau.rt.RotationGesture */
  $class('tau.rt.RotationGesture').extend(tau.rt.Gesture).define({
    /**
     * @class RotationGesture class description goes here
     * @constructs
     */
    RotationGesture: function () {
      this.rotation = 1;
      this.velocity = 0;
    }
  });
  
  /** @lends tau.rt.LongPressGesture */
  $class('tau.rt.LongPressGesture').extend(tau.rt.Gesture).define({
    /**
     * @class RotationGesture class description goes here
     * @constructs
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

  /** @lends tau.rt.EventManager */
  $class('tau.rt.EventManager').define({
    /**
     * @class Prototype Event Manager
     * @constructs
     * @param {Object} opt Event Manager options
     * @param {Object} root Root DOM element from which the Events are listened
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
      this.mousedown = false;

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
     * event handler for the registered event listener. This event handler
     * is a callback method from DOM Event system and handles all the events 
     * registered from constructor
     */
    handleEvent: function (e) {
      if (!this._opts.enabled) {
        return;
      }
      //e.stopPropagation(); // stop propagating events further on
      switch (e.type) {
        case 'mousedown':
          this.mousedown = true;
        case 'touchstart': 
          return this.handleTouchEvent(e, tau.rt.Event.TOUCHSTART);
        case 'mousemove':
          if (!this.mousedown) return;
        case 'touchmove':
          e.preventDefault(); // disable browser default event handler
          if ((e.timeStamp - this._timeStamp) >= 33) { //more than 30fps
            this._timeStamp = e.timeStamp;
            return this.handleTouchEvent(e, tau.rt.Event.TOUCHMOVE);
          }
          break;
        case 'mouseup':
          this.mousedown = false;
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
     * Enable/disable event handling.
     * @param {Boolean} value False will disable event handling
     */
    setEnable: function (value) {
      this._opts.enabled = !!value;
    },

    /**
     * Sets the currently active
     * @param {Object} module 
     */
    setActiveModule: function (module) {
      this._activeModule = module;
    },

    /**
     * Iterates up the DOM element's parent hierarchy to find a Tau object
     * ID that houses the element.
     * @param {Object} dom Child DOM element to begin the search
     * @returns {String} If {@link tau.rt.EventDelegator} 
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
     * Finds the corresponding {@link tau.rt.EventDelegator} that matches 
     * the given id in the component hiearchy. 
     * @param {Object} parent Parent EventDelegator to begin the hit test
     * @param {String} id Parent EventDelegator to begin the hit test
     * @returns {Object} Any delegator in the hierarchy that matches the id
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
     * Hit tests for a Tau object from a given DOM element. 
     * @param {Object} dom DOM element to hit test
     * @returns {Object} Tau component object for the given DOM element
     */
    hitTarget: function (dom) {
      var found,
          id = this.findMobelloObjId(dom),
          module = this._activeModule,
          ctrl = module ? module.getRootController() : null;
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
     * Receives a generic DOM event from an element and attempts to delegate it 
     * with a Mobello event to the corresponding {@link tau.rt.EventDelegator}.
     * @param {Object} e DOM event
     * @returns {Boolean} True if the event was fired to a Tau EventDispatcher
     */
    domGenericEvent: function (e) {
      // Find the DOM node's Tau ID, then search & fire Tau-native Event
      var hit = tau.getRuntime().$eventMgr.hitTarget(e.target);
      if (!hit) hit = tau.getRuntime(); // fallback
      return hit.fireEvent(e.type, e.target);
    },
    
    /**
     * Receives a generic DOM event from an element and attempts to delegate it 
     * with a Mobello event to the corresponding {@link tau.rt.EventDelegator}.
     * @param {Object} e DOM event
     * @returns {Boolean} True if the event was fired to a Tau EventDispatcher
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
     * Callback method, Handles all the event occurred on Mobello framework area
     * @param {Event} e native DOM event
     * @param {String} name event name translated into touch event name
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
     * Tracks a touch point.
     * @param {Object} touch Mobile/Browser TouchPoint
     * @param {Object} e DOM event for the corresponding touch point
     * @returns {Object} Tracked touch object
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

  /** @lends tau.rt.Runtime */
  $class('tau.rt.Runtime').extend(tau.rt.EventDelegator).define({

    /**
     * @class
     * Manages module runtime.
     * <p/>
     * System Events Handled:
     * <pre>
     *  "runtimeinstall" (RT_INSTALL): Register module to runtime
     *  "runtimeuninstall" (RT_UNINSTALL): Remove module from registry
     *  "runtimestart" (RT_START): Execute a module (calls init & loadScene)
     *  "runtimestop" (RT_STOP): Stops a running module
     *  "runtimelaunch" (RT_LAUNCH): Automates install & start
     *  "runtimeterminate" (RT_TERMINATE): Automates stop & uninstall
     * </pre>
     * @constructs
     * @extends tau.rt.EventDelegator
     * @param {Object} config Runtime configuration
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
     * Returns clipboard object. Clipboard object is widely used to save DOM
     * node temporarily which is cut from HTML DOM tree.
     * @returns {tau.rt.Clipboard} Clipboard object
     */
    getClipboard: function () {
      return this.$clipboard;
    },
    
    /**
     * need to be concise
     * @param e
     * @param payload
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
     * handles default runtime events; fallback events
     * @override
     */
    propagateEvent: function (e, payload) {
      switch (e.getName()) {
        case tau.rt.Event.SCENEDRAWN:
        case tau.rt.Event.ORIENTATION:
          if (tau.rt.isIPhone) {  // hide URL bar
            window.setTimeout(function () {window.scrollTo(0, 1);}, 100);
          } else if (tau.rt.isAndroid) {
              var elem = document.documentElement,
                  height = window.outerHeight / window.devicePixelRatio;

              if(elem.scrollHeight <  height && height) {
                elem.style.height= height + 'px';
              } else {
                elem.style.height = null;
              }
              window.setTimeout(function () {window.scrollTo(1, 1);}, 100);
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
     * Handles capture event. This event handler is registered as antecedentFn
     * when corresponding event is publishing.
     * @param {tau.rt.Event} e Event Object
     * @param {Object} payload object with the event
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
     * Handles application cache UPDATEREADY event.
     * @param e
     * @param payload
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
     * Returns the names of cached applications as an array format
     * @returns {Array} application names which is cached in local storage
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
     * Removes specified application name from cache
     * @param {String} app application name to remove from cache
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
     * Caches specified application name to local storage
     * @param {String} app application name 
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
     * Registers a module configurations into the Runtime.
     * <p/>
     * If a module name is provided, it will load and register its configuration
     * from the reserved application file path (appname/config.json). If a
     * name isn't provided, it will attempt to the same for Dashboard. 
     * <p/>
     * A module's configuration is required to be registered to the Runtime
     * The notation of JSON object will be as follow.</p>
     * {name: 'appname', sys: true|false, autostart: true|false}
     * before it can be started.
     * @param {Object | Array} apps module information to install 
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
     * Resolves specified apps to appropriate configuration information
     * @param {Array} apps app names to resolve
     * @param {Function} callbackFn callback function notified when resolving
     *    is finished. It's parameter is array of configurations resolved
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
     * Unregisters a module from the Runtime.
     * <p/>
     * Note that a module cannot be uninstalled if it's currently active.
     * Additionally, once it is unregistered, it cannot be started until it has
     * been re-installed. 
     * @param {String} name Module name.
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
     * Instantiates and runs a module by name.
     * <p/>
     * If a module name is provided, and it was registered properly, it will 
     * create a new instance and execute it. Otherwise, it will attempt to 
     * reactivate the top-most module. Finally, if no active module exists, it 
     * will execute the Dashboard.
     * @param {String} name Module name, undefined will restart top-most module
     * @throws {error} No module is active or installed
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
     * Stops and destroys a module using its registered name.
     * <p/>
     * If a module name is provided and is found to be active, it will attempt
     * to stop it. Otherwise, it will try to stop the top-most active module.
     * <p/>
     * Once a module is stopped, it will return control to the next top most 
     * module by starting it.
     * @param {String} name Module name/id, undefined param stops the top module 
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
     * Installs and starts a module from a URL.
     * <p>
     * If a URL parameter name contains <code>app</code>, its value will be used
     * to find and launch the app. Otherwise, it will try to find and launch
     * Dashboard.
     * URL format:
     * <pre>
     *  http://<domain.com>/launcher.html?app=<appname>
     * </pre>
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
     * Stops and uninstalls the specified application.
     * @param {String} name Module name
     */
    terminate: function (name) {
      tau.log.info('Terminating: ' + name, this);
      this.fireEvent(tau.rt.Event.RT_STOP, name);
      this.fireEvent(tau.rt.Event.RT_UNINSTALL, name);
    },

    /**
     * Upates all Runtime resources.
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
     * Returns the version of current runtime.
     * @returns {String} Runtime version number
     */
    getVersion: function () {
      return this._config.version;
    },

    /**
     * Returns Runtime's object.
     * @returns {Object} Runtime configuration
     */
    getConfig: function () {
      return this._config;
    },

    /**
     * Checks if the Runtime was loaded for Multi-App.
     * @returns {Boolean} True if Multiple applications are running
     */
    isMultiApp: function () {
      return !(this._config.singleApp);
    },

    /**
     * Finds a running Module by the module's id or name.
     * <p/>
     * Empty parameter returns the currently running module (top-most in stack).
     * <p/>
     * "*" returns all of the running modules as an array.
     * @param {String} nameId Application name or Id to search ("*" = all)
     * @returns {Array|Object} Found module instance or an array
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
     * Returns the number of running modules.
     * @returns {Number} Size of running modules (excludes dashboard)
     */
    getModuleSize: function () {
      return this._stack.length;
    },

    /**
     * Returns the configuration for the current module.
     * <p/>
     * If a module name is provided, it will attempt to return the the 
     * configuration for the specified name; otherwise, it will return the 
     * currently running module's configuration object.
     * @param {String} name Name of the app for the requested configuration 
     * @returns {Object} A module's configuration object
     */
    getModuleConfig: function (name) {
      if (tau.isString(name)) {
        return this._registry[name];
      } else {
        return this.getModule().getConfig();
      }
    },

    /**
     * Sets the Browser display title.
     * @param {String} title Display title value
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
     * Sets the icon for the Application's platform shortcut.
     * @param {String} path Directory & file location of the icon 
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
     * Sets the splash image location for the Application's platform shortcut. 
     * @param {String} path Directory & file location of the splash image 
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
     * Creatse a stroage context for a given name.
     * <p/>
     * An application's storage context is defined by its name. If no name is 
     * given, it will use the currently running application's context.
     * @param {String} name Application name for the storage context
     * @returns {Object} Storage context for the given name
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
     * @param {String} theme Theme 텍스트
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
    
    addSystemWidget: function (widget) {
      if (!(widget instanceof tau.rt.EventDelegator)) {
        throw new TypeError(widget.toString().concat(
            ' is not an instance of EventDelegator', this.currentStack())); 
      }
      // do not setBubble() with Runtime!!
      this.$widgets.push(widget);
      return widget;
    },
    
    findSystemWidget: function (clazz) {
      var widgets = this.$widgets;
      for (var i = 0, len = widgets.length; i < len; i++) {
        if (widgets[i] instanceof clazz) {
          return widgets[i];
        }
      }
      return null;
    },
    
    getSystemWidgets: function () {
      return this.$widgets;
    }
  });

  /** @lends tau.rt.Module */
  $class('tau.rt.Module').extend(tau.rt.EventDelegator).define({
    $static: /** @lends tau.rt.Module */{
      /**
       * 모듈에 Badge가 설정되었을 때 발생하는 이벤트이며, 설정된 Badge의 값은
       * payload로 전달 받는다.
       */
      EVENT_BADGESET: 'badgeset'
    },
    
    /**
     * @class
     * Base module class extended by Application or Dashboard.
     * <p/>
     * Contains a module's internal lifecycle initiator functions: 
     * <code>doLoadScene</code>, & <code>doDestroy</code>
     * @constructs
     * @param {Object} rt Runtime instance in which the Module will run
     * @param {Object} config Module configuration object
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
     * 로딩하여 Drawing이 완료됐을 때 <code>tau.rt.Event.SCENEDRAWN</code> 이벤트를
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
     * Returns a unique module id.
     * @returns {String} Module id
     */
    getId: function () {
      return this._id;
    },

    /**
     * Returns the current module name.
     * @returns {String} Module name
     */
    getName: function () {
      return this._config.name;
    },

    /**
     * Returns the current module's configuration object.
     * @returns {Object} Module configuration
     */
    getConfig: function () {
      return this._config;
    },

    /**
     * Returns the user-implemented root app controller.
     * @returns {Object} Module's starting root controller
     */
    getRootController: function () {
      var ctrl = this.modalCtrl;
      return (ctrl && ctrl.hasModals()) ? ctrl : this._rootController;
    },

    /**
     * Returns a Storage Manager for the current module used to persist data.
     * @returns {Object} Curren't module's {@link tau.rt.StorageContext} object
     */
    getStorageCtx: function () {
      if (!this._storageCtx) {
        /** @private Storage context for the given module */
        this._storageCtx = new tau.rt.StorageContext(this.getName()); 
      }
      return this._storageCtx;
    },

    /**
     * Persists a badge text or number for the Module.
     * @param {String|Number} Badge value to set
     * @returns {Boolean} True if the badge value was set
     */
    setBadge: function (value) {
      var result = this.getStorageCtx().set('$badge', value);
      if (result) {
        this.fireEvent(tau.rt.Module.EVENT_BADGESET, value);
      }
      return result;
    },

    /**
     * Returns a previously set badge text or number.
     * @returns {String|Number} Previously set badge value
     */
    getBadge: function () {
      return this.getStorageCtx().get('$badge');
    },

    /**
     * Removes any previously set badges value.
     * @returns {Boolean} True if the badge value was cleared
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
     * Notifies the module that it is about to be destroyed by calling the
     * <code>destroy</code> callback method.
     * <p/>
     * It also releases any outstanding component hierarchy and resources.
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
     * Returns the root DOM element for the Module.
     * @returns {Object} DOM element
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
     * Returns the instance of <code>ModalSceneController</code> assiciated 
     * with this Module. 
     * @returns {tau.ui.ModalSceneController} an instance of 
     *  tau.ui.ModalSceneController
     */
    getModalController: function () {
      if (!this.modalCtrl) { // lazy construction
        this.modalCtrl = new tau.ui.ModalSceneController(this);
        this.modalCtrl.doStart();
      }
      return this.modalCtrl;
    }
  });


  /** @lends tau.rt.Application */
  $class('tau.rt.Application').extend(tau.rt.Module).define({
    $static: {
      CONFIG: {
        /** @param {String} classname App's full class name (required) */
        /** @param {String} title Display name (default: App name) */
        /** @param {Number} timeout Max time given for loading a scene in ms */
        /** @param {String} close "dashboard": (Default) Go to Dashboard
         *                        "back": Ends the App & go to previous app
         *                        "exit": Ends the App & goes to Dashboard */
        require       : '/main.js',   // Class source path (default: /main.js)
        icon          : '/icon.png',  // Icon resource path (default: /icon.png)
        version       : '1.0.0',      // Version (default: 1.0.0)
        vendor        : 'Company',    // Vendor name (default: Company)

        /** TODO: Currently unused */
        orientation   : 'portrait',   // Sceen orientation (portrait/landscape)
        language      : 'ko',         // Default language
        region        : 'KR'          // Default regional settings
      }
    },
    
    /**
     * @class
     * Application module.
     * <p/>
     * Note that a module loads asynchronously; i.e. when the browser finishes 
     * loading the main script, it will call <code>loadedFn</code>. Any subsequent
     * logic must be implemented in this callback function to ensure that the
     * module was successfully.
     * @constructs
     * @extends tau.rt.Module
     * @param {Object} rt Runtime instance in which the Application will run
     * @param {Object} config Application configuration object
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
     * 
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
       * JavaScript dependency declaration.
       * <p/>
       * Instructs the runtime to load an external JavaScript script file for 
       * the specified URL. Any unique dependencies defined within an import
       * file will be loaded recursively in a depth-first order.
       * You can specify multiple libraries as argumens.
       * <p/>
       * Note: <code>$require</code> API is only available when the script is
       * in the process of being loaded.
       * <pre>
       *  // Script "lib1.js" & "lib2.js" loaded in sequence. Any $require 
       *  // defintions in "lib1.js" will be loaded prior to "lib2.js"
       *  $require('/lib1.js');
       *  $require('/lib2.js');
       *  ...
       *  $class('MyClass').define({
       *    MyClass() {
       *      $require('/lib3.js'); // *Undefined* Not available post file load
       *    }
       *  });
       * </pre>
       * @param {String} lib JavaScript dependent source URL
       * @see #$class
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

  /** @lends tau.rt.DependencyChain */
  $class('tau.rt.DependencyChain').define({
    /**
     * You can use DependencyChain as follows:
     * <pre>
     * var app = // app name
     * var chain = tau.rt.DependencyChain();
     * chain.setFalllback({
     *   resolve: function (context) {
     *     // do default handling
     *   }
     * });
     * chain.addDependency(new Dependency(app, actualfilepath));
     * chain.addDependency(new Dependency(app, actualfilepath));
     * ...
     * chain.resolve();
     * </pre>
     * @class
     * Class definition for importing libraries that have dependency. This
     * class guarantees that files which is added as a <code>Dependency</code>
     * load in the same order as added
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
     * Sets the default Dependency Object whick is invoked when all the 
     * Dependencies are resolved and there are no more dependencies to resolve.
     * In default fallback Dependency, you can handle default behavior.
     * @param {tau.rt.Dependency} fb default fallback Dependency object
     */
    setFallback: function (fb) {
      this._fb = fb;
    },
    
    /**
     * Enable or disable caching the javascript libraries which has been loaded.
     * Default value is true.
     * @param {Boolean} state specifies the flag whether to cache or not
     *  libraries need to be cached
     */
    setCaching: function (state) {
      this.$opts.noCache = state;
    },
    
    /**
     * 
     * @param state
     */
    setAutoUnloading: function (state) {
      this.$opts.autoUnload = state;
    },
    
    /**
     * 
     * @param timeout
     */
    setTimeout: function (timeout) {
      this.$opts.timeout = timeout;
    },
    
    /**
     * Adds Dependency object. The Dependencis which are added to this 
     * DependencyChain are resolved in the order. You can add 
     * <code>Dependency</code> object into this <code>DependencyChain</code>
     * dynamically at rumtime.
     * @param {tau.rt.Dependency} dependency Dependency object to add
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
     * Resolves the Dependency object that add added so far.
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

  /** @lends tau.rt.Dependency */
  $class('tau.rt.Dependency').define({
    /**
     * @class
     * This class represents external library file that has dependency on active
     * <code>Application</code>. The instance of this class can be added to 
     * <code>tau.rt.DependencyChain</code> object.
     * @constructs
     * @param {String} name application name
     * @param {String} src library file that has dependency on the specified app
     * @see tau.rt.DependencyChain
     */
    Dependency: function (name, src) {
      this._name = name;
      this._src = src;
    },
    
    /**
     * Check to see if current Dependency needs to resolve. If current 
     * Dependency(library file) is loaded already returns <code>false</code>
     * @returns {Boolean} true if current dependency is loaded already
     */
    needToResolve: function () {
      return (this._src && _headerScriptUrls().indexOf(this._src) === -1);
    },
    
    /**
     * Handles the result of resolve process.
     * @param {Object} context Dependency Context
     * @param {Boolean|null} success the status of result. 
     *        If null, the resolution is bypassed.
     * @private
     */
    handleResult: function (context, success) {
      var msg = (success === null) ? ' ignores importing: ' : 
            (success) ? ' imported: ' : ' FAILED to import: ';
      tau.log.info(this._name + msg + '\"' + this._src + '\"',  this);
      context.resolveNext();
    },
    
    /**
     * Do the actual resolution process.
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
  
   /** @lends tau.rt.InstallDependency */
  $class('tau.rt.InstallDependency').extend(tau.rt.Dependency).define({
    /**
     * @class
     * This class represents module configuration file that is required to
     * install Module object on Runtime. The instance of this class can be
     * added to <code>tau.rt.DependencyChain</code> object.
     * @constructs
     * @param {String} name application name
     * @param {String} src config file that Module needs to install
     * @param {boolean} isSys if true current module is system module
     * @see tau.rt.DependencyChain
     */
    InstallDependency: function (name, src, isSys) {
      this._isSys = isSys;
      this.$conf = null;
    },
  
    /**
     * @override
     * @private
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
  
  /** @lends tau.rt.Dashboard */
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
     * @class
     * Dashboard module.
     * <p/>
     * Note that a module loads asynchronously; i.e. when the browser finishes 
     * loading the main script, it will call <code>loadedFn</code>. Any subsequent
     * logic must be implemented in this callback function to ensure that the
     * module was successfully.
     * @constructs Creates new Dashboard instance  
     * @extends tau.rt.Module
     * @param {Object} rt Runtime instance in which the Dashboard will run
     * @param {Object} config Dashboard configuration object
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
     * Overrides parent class's method. takes appropriate actions
     * @param {tau.rt.Event} e Runtime event
     * @param payload paylaod object
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
     * Returns normal columns count. If columns count is not specified in global
     * configuration file(config.json), default value will be 4. 
     * @returns {Number} Column size
     */
    getCols: function () {
      return this._config.dashboard.cols || 4;
    },
    
    /**
     * Returns maximum columns count. If columns count is not specified in global
     * configuration file(config.json), default value will be 5. 
     * @returns {Number} Column size
     */
    getMaxCols: function () {
      return this._config.dashboard.maxcols || 5;
    },

    /**
     * Returns current Dashboard {@link tau.ui.Shortcut} objects as an Array. If
     * no {@link tau.ui.Shortcut} object has been set, returns empty array object
     * @returns {Array} {@link tau.ui.Shortcut} objects
     * @see tau.ui.Shortcut
     */
    getShortcuts: function () {
      return this._shortcuts;
    },
    /**
     * Dashboard에 출력할 Shortcut 객체를 추가한다. 이때 추가할 <code>shortcut</code>
     * 는 <code>tau.ui.Shortcut</code> 객체이어야 하며 독립 객체 또는 배열에 저장된
     * 형태이어야 한다.
     * @param {tau.ui.Shortcut | Array} Dashboard에 추가할 tau.ui.Shortcut 객체
     * @see tau.ui.Shortcut
     */
    addShortcut: function (shortcut) {
        this._shortcuts = this._shortcuts.concat(shortcut);
    },

    /**
     * Removes one or more Dashboard shortcut.
     * @param {Object} args config(shortcut) to be removed
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
     * Finds specified shortcut is stalled already. if installed, this method
     * returns <code>true</code>. Otherwise returns <code>false</cdoe>
     * @param {String} name shortcut name to find
     * @returns {Boolean} if specified Shortcut is installed, 
     * returns <code>true</code>
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

  /** @lends tau.rt.StorageContext */
  $class('tau.rt.StorageContext').define({
    /**
     * @class
     * Handles simple persistent data storage for a given context (id).
     * <p/>
     * A context string (tau.<PlatformID>.<context>') is used to index into
     * the localStorage for saving and retrieving data. Since localStorage does
     * not support objects we use a proxy object to stored <code>put</code> data
     * which is then flushed to localStorage via JSON stringify marshaller.
     * @constructs
     * @param {String} name Storage context, identical IDs will share data
     * @param {Boolean} reloadOnRead Will refresh localStorage data on each get
     * @param {String} platformId Unique id for Tau platform ID
     * @throws {error} Web engine does not support localStorage
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
     * Returns the context name.
     * @returns {String} Returns the context name
     */
    getContextName: function () {
      return this._name;
    },

    /**
     * Sets the key name for the Storage Context.
     * @param {String} name Storage context, identical IDs will share data
     * @returns {Boolean} True if the context was changed properly
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
     * Returns a stored value that was previously <code>set</code> to this
     * storage context.
     * @param {String} key Previously <code>set</code> stored value
     * @returns {Object} Matching object value from the key
     */
    get: function (key) {
      return this._getStorageObj()[key];
    },

    /**
     * Stores a value to this storage context for the corresponding key.
     * @param {String} key A string to be used for finding the matching value 
     * @param {Object} value Object value to store (cannot be functions)
     * @returns {Boolean} True if the value was set properly
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
     * Removes a previously saved value from this storage context.
     * @param {String} key Key for the value to be removed
     * @returns {Boolean} True if the value was removed properly
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
     * Returns the key string for the index in this storage context.
     * @param {Number} index Index to search for the key in the storage context
     * @returns {String} Key string for corresponding index
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
     * Clears all stored key/values from this storage context.
     */
    clear: function () {
      // Clear entire storage, then remove the respective key from localStorage
      this._storage = {};
      localStorage.removeItem(this._ctxKey);
    },

    /**
     * Flush out any remaining data to storage.
     */
    flush: function () {
      localStorage[this._ctxKey] = tau.stringify(this._getStorageObj());
    }
  });


  /** @lends tau.rt.ApplicationContext */
  $class('tau.rt.ApplicationContext').define({
    /**
     * @class
     * Context class that offers access to application resources such as ID, 
     * local storage, resource path resolver, etc.
     * @constructs
     * @param {Object} module Application's {@linek tau.rt.Module} instance
     */
    ApplicationContext: function (module) {
      this._module = module;
    },

    /**
     * Returns a Storage Manager for the current module used to get/set data.
     * @returns {String} Curren't module's ID
     */
    getId: function () {
      return this._module.getId();
    },

    /**
     * Returns an absolute path for a given application resource path.
     * <p/>
     * Resource path must begin with a "/", "$shared", or be a full URL.
     * @param {String} path Relative resource path in the application context
     * @returns {String} Full path for the given relative path
     */
    getRealPath: function (path) {
      return _resolvePath(path, this._module.getName());
    },

    /**
     * Returns the configuration for the application
     */
    getConfig: function () {
      return this._module.getConfig();
    },

    /**
     * Returns an object value for the corresponding key and scope.
     * @param {String} key String key value
     * @param {String} scope Name of the storage scope
     * @return {Object} Instance value for the corresponding key
     */
    getStorage: function (key, scope) {
      return this._getStorageCtx(scope).get(key);
    },

    /**
     * Stores an object value for the corresponding key and scope.
     * @param {String} key String key value
     * @param {String} value Corresponding key's value
     * @param {String} scope Name of the storage scope
     * @returns {Boolean} True if the value was set properly
     */  
    setStorage: function (key, value, scope) {
      return this._getStorageCtx(scope).set(key, value);
    },
  
    /**
     * Removes any value set for the corresponding key and scope.
     * @param {String} key String key value
     * @param {String} scope Name of the storage scope
     */  
    removeStorage: function (key, scope) {
      return this._getStorageCtx(scope).remove(key);
    },

    /**
     * Returns the key for the corresponding index and scope.
     * @param {Number} index Numerical index of the key
     * @param {String} scope Name of the storage scope
     */ 
    storageKey: function (index, scope) {
      return this._getStorageCtx(scope).key(index);
    },

    /**
     * Clears all key/value stored for the corresponding scope.
     * @param {String} scope Name of the storage scope
     */
    clearStorage: function (scope) {
      return this._getStorageCtx(scope).clear();
    },

    /**
     * Persists a badge text or number for the Module.
     * @param {String|Number} Badge value to set
     * @returns {Boolean} True if the badge value was set
     */
    setBadge: function (value) {
      return this._module.setBadge(value);
    },

    /**
     * Returns a previously set badge text or number.
     * @returns {String|Number} Previously set badge value
     */
    getBadge: function () {
      return this._module.getBadge();
    },

    /**
     * Removes any previously set badges value.
     * @returns {Boolean} True if the badge value was cleared
     */
    removeBadge: function () {
      return this._module.removeBadge();
    },

    /**
     * Returns a storage object for the context scope. If a scope isn't provided
     * the default current module's scope will be used.  
     * @param {String} scope Name of the storage scope
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
     * 현재 application의 theme을 변경한다.
     * <p/>
     * @param {String} theme Theme 텍스트
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


  /** @lends tau.rt.Theme */
  $class('tau.rt.Theme').define({

    /**
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
     * theme을 로드한다.
     * <p/>
     * @param {Boolean} enable theme 활성화 여부
     * @param {Function} callbackfn 
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
        theme._css.enable();
      } else {
        theme._css.unload(true);
      }
    },

    /**
     * theme을 언로드한다.
     * @param {Boolean} disabled <code>true</code>이면 link diabled attribute를 diabled로 설정하고 
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
  
  /** @lends tau.rt.ThemeManager */
  $class('tau.rt.ThemeManager').define({

    $static: /** @lends tau.rt.ThemeManager */ {
      DEFAUT_THEME : 'default'
    },

    /**
     * @class
     * default, app의theme을 등록하고, default, app의 theme을 변경해 주는 class.
     * @constructs
     * @param {String} themeName theme 텍스트
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
     * 새로운 theme을 로드하고 이전에 적용되어 있는 theme을 언로드한다.
     * @param {Object} config application의 configuration object
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
     * default {tau.rt.Theme}의 이름을 설정하고, 
     * 현재 application이 default theme으로 설정되어 있는 경우
     * default {tau.rt.Theme}을 load하고 이전에 적용되어 있는 {tau.rt.Theme}은 언로드한다.
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
     * application에 설정된 theme을 등록한다.
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
     * @param {tau.rt.Module} [opts.module] 
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
   * This class defines methods required to mimic clipboard operations
   *  @lends tau.ui.TableSceneController
   */
  $class('tau.rt.Clipboard').define({
    /**
     * Instantiate new Clipboard object. Usually this object maintained by 
     * Runtime object
     * @class
     */
    Clipboard: function() {
      this._buf = {};
    },
    
    /**
     * Cut the specified node from the html DOM tree and holds it's reference
     * in the clipboad object using specified key. Usually the key is the id of
     * specified node
     * @param {String} key the key string to be used to identify the dom
     * @param {Node} node DOM node to be cut from HTML DOM tree
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
     * Paste DOM node identified by the key as a child of specified container
     * node.
     * @param {String} key the key string to be used to identify the dom
     * @param {Node} container Parent DOM node to where the node specified by
     * the key is appended.
     */
    paste: function (key, container) {
      if (this._buf[key]) {
        container.appendChild(this._buf[key]);
        delete this._buf[key];
      }
    },
    
    /**
     * Removes node specifified by the key from the clipboard object.
     * @param {String } key the key string to be used to identify the dom
     */
    remove: function (key) {
      if (this._buf[key]) {
        delete this._buf[key];
      }
    },
    
    /**
     * Removes all the DOM nodes maintained by this clipboard object
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
