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
(function() {
  if (typeof tau == 'undefined') {
    tau = {};
  }
  if (typeof tau.fx == 'undefined') {
    /**
     * functionality related to visual effects
     * @namespace
     */
    tau.fx = {
      /**
       * 애니메이션할 타겟오브젝트의 속성값을 파싱하기 위한 RegExp 상수
       * @constant
       */
      _RFXNUM: /^([+-]=)?([\d+-.]+)(.*)$/,
      /**
       * 현재 obj의 속성값을 가져온다.
       * @param {tau.ui.Component|Element} obj 대상 Object
       * @param {String} name 속성이름
       * @param {Boolean} force
       * @returns {Number} 속성값
       */
      _getAppearance: function(obj, name, force) {
        if (obj === undefined)
          return;
        // component인 경우
        if (obj.getDOM) {
          obj = obj.getDOM();
          // return obj.getStyle(name);
        }
        // obj[name]이 있으면서 obj.style이 없는 경우나 obj.style[name]이 없는 경우
        if (obj[name] != null && (!obj.style || obj.style[name] == null)) {
          return obj[name];
        }
        return parseFloat(tau.util.getComputedStyle(obj, name, force)) || 0;
      },
      /**
       * obj의 속성값 세팅한다.
       * @param {tau.ui.Component|Element} obj 대상 Object
       * @param {String} name 속성이름
       * @param {Number|String} value 속성값
       * @param {String} unit 속성의 단위값 (px|%)
       * @returns {Boolean} 속성값
       */
      _setAppearance: function(obj, name, value, unit) {
        if (obj === undefined)
          return false;
        unit = unit || "";
        // component인 경우
        if (obj.getDOM) {
          obj = obj.getDOM();
        }
        obj.style[name] = value + unit;
        return true;
      },
      /** @ignore */
      Transitable: {
        _onTransitionEnd: function(e) {
          if (this._transitableElem) {
            this._transitableElem.style["-webkit-transition"] = "";
          }
        },
        /**
         * This method is called whenever an event occurs of the type for which the EventListener interface was registered. 
         */
        handleEvent: function(e) {
          switch(e.type) {
            case tau.rt.Event.TRANSITIONEND :
              this._onTransitionEnd(e);
              break;
          }
        },
        registerTransitable: function(elem) {
          if (elem) {
            this._transitableElem = elem;
            elem.addEventListener(tau.rt.Event.TRANSITIONEND, this, false);
          }
        },
        unregisterTransitable: function() {           
          if (this._transitableElem) {
            elem.removeEventListener(tau.rt.Event.TRANSITIONEND, this, false);
            delete this._transitableElem;
          }
        },
        /**
         * property
         * duration
         * timingFunction
         * delay
         * @ignore
         */
        putTransition: function(p, dr, tf, dl) {
          if (!this._transitions) {
            this._transitions = {};
          }
          this._transitions[p] = {
            dr: dr,
            tf: tf,
            dl: dl
          };
        },
        removeTransition: function(p) {
          if (this._transitions) {
            delete this._transitions[p];
          }
        },
        transit: function(props) {
          if (!this._transitableElem) return;
          var tArray = [];
          var tString = "";
          var p;
          for (p in this._transitions) {
            tString = p;
            if (this._transitions[p]["dr"]) {
              tString += " " + this._transitions[p]["dr"];
            }
            if (this._transitions[p]["tf"]) {
              tString += " " + this._transitions[p]["tf"];
            }
            if (this._transitions[p]["dl"]) {
              tString += " " + this._transitions[p]["dl"];
            }
            tArray.push(tString);
          }
          this._transitableElem.style["-webkit-transition"] = tArray; 
          for (p in props) {
            this._transitableElem.style[p] = props[p];
          }
        }
      },
      /**
       * Returns an animation that will fade target from its current opacity to
       * fully opaque.
       * @param {Element} elem
       * @param {Object} opts
       */
      fadeIn: function(elem, opts) {
        if (elem.style.display == "none") {
          elem.style.display = "";
          elem.style.opacity = 0;
        }
        BuiltIn.FADEIN.animate(elem, opts);
      },
      /**
       * Returns an animation that will fade target from its current opacity to
       * fully transparent.
       * @param {Element} elem
       * @param {Object} opts
       */
      fadeOut: function(elem, opts) {
        if (elem.style.display == "none") {
          elem.style.display = "";
        }
        BuiltIn.FADEOUT.animate(elem, opts);
      },
      combine: function(anims) {
        return new tau.fx._Combine(anims);
      },
      chain: function(anims) {
        return new tau.fx._Chain(anims);
      },
      /**
       * @class Playable Mixin Object
       * @static
       */
      Playable: {
        /**
         * start 에 호출될 메서드
         */
        _start: function() {
          //implements
        },
        /**
         * pause 에 호출될 메서드
         */
        _pause: function() {
          //implements
        },
        /**
         * resume 에 호출될 메서드
         */
        _resume: function() {
          //implements
        },
        /**
         * end 에 호출될 메서드
         */
        _end: function() {
          //implements
        },
        /**
         * Whether animation is running or not
         * @return {Boolean}
         */
        isRunning: function() {
          return this._running;
        },
        /**
         * Whether animation is paused or not
         * @return {Boolean}
         */
        isPaused: function() {
          return this._paused;
        },
        /**
         * Play/Resume animation
         */
        play: function() {
          if (!this.isRunning()) {
            if (this.isPaused()) {
              this._resume();
            } else {
              this._start();
            }
          }
          this._running = true;
          this._paused = false;
          return this;
        },
        /**
         * Pause animation
         */
        pause: function() {
          if (this.isRunning()) {
            this._pause();
          }
          this._running = false;
          this._paused = true;
          return this;
        },
        /**
         * Stop animation
         */
        stop: function() {
          if (this.isRunning() || this.isPaused()) {
            this._end();
          }
          this._running = false;
          this._paused = false;
          return this;
        }
      }
    };

    /**
     * @lends tau.fx.Transition
     */
    $class('tau.fx.Transition').define({
      $static: 
      /**
       * @static
       * @lends tau.fx.Transition
       */
      {
        /**
         * default options 
         */
        DEFAULT_OPTIONS: {
          duration: "0.25s",
          timingFunction: "ease-in-out",
          delay: "0s"
        }
      },
      /**
       * Creates new Transition
       * @class Creates new Transition
       * @constructs
       */
      Transition: function(options) {
        this._id = (new Date() - 0) + Math.floor(Math.random() * 100);
        this._style = {};
        this._options =  tau.mixin(options, tau.fx.Transition.DEFAULT_OPTIONS);
      },
      setStyle: function(name, value, options) {
        this._style[name] = {
          value: value||"",
          options: options||{}
        };
      },
      _run: function() {
        if (tau.rt.isIPad){ // ipad인 경우 flicker 현상이 발생함. 
          tau.util.dom.addClass(this._target, 'tau-preserve3d');
        }

        var tArray = [], tString = "",
            p, dr, tf, dl;
        this._cnt = 0;
        this._target.addEventListener(tau.rt.Event.TRANSITIONEND, this, false);
        for (p in this._style) {
          tString = p;
          dr = this._style[p].options["duration"] || this._options["duration"];
          tf = this._style[p].options["timingFunction"] || this._options["timingFunction"];
          dl = this._style[p].options["delay"] || this._options["delay"];
          tArray.push(p + " " + dr + " " + tf + " " + dl);
        }
        this._target.style["-webkit-transition"] = tArray; 
//        this._target.style["-moz-transition"] = tArray.toString();
        for (p in this._style) {
          this._target.style[p] = this._style[p].value;
          this._cnt++;
        }
      },
      animate: function(target, animOpts) {
        if (target) {
          this._target = target;
          var self = this;
          var delay = 0;
          if(animOpts && tau.isObject(animOpts)){
            if(tau.isNumber(animOpts.delay)){
              delay = animOpts.delay;
            }
          }
          
          if(delay > -1){
            window.setTimeout(function(){self._run();}, delay);
          }else{
            self._run();
          }
        }
      },
      _onTransitionEnd: function(e) {
        if (this._target && this._target == e.target) {
          if (this._style[e.propertyName] && this._style[e.propertyName].options.onEnd) {
            this._style[e.propertyName].options.onEnd(e);
          }
          this._cnt--;
          if (this._cnt < 1) {
            this._target.style["-webkit-transition"] = "";
            this._target.removeEventListener(tau.rt.Event.TRANSITIONEND, this, false);
          }
          if (tau.rt.isIPad){
            tau.util.dom.removeClass(this._target, 'tau-preserve3d');
          }
        }
      },
      /**
       * This method is called whenever an event occurs of the type for which the EventListener interface was registered. 
       */
      handleEvent: function(e) {
        switch(e.type) {
          case tau.rt.Event.TRANSITIONEND :
            this._onTransitionEnd(e);
            break;
        }
      }
    });

    /**
     * stylesheet for css3 animation
     * @private
     */
    var animStylesheet = (function() {
      if (typeof WebKitCSSKeyframesRule == "undefined") {
        return null;
      }
      var style = document.createElement('style');
      document.getElementsByTagName('head')[0].appendChild(style);
      var s = document.styleSheets[document.styleSheets.length - 1];
      var map = {};
      return {
        getCssText: function(selector) {
          if (map[selector]) {
            return s.cssRules[map[selector]].cssText;
          }
        },
        setRule: function(selector, declaration) {
          if (map[selector]) {
            s.deleteRule[map[selector]];
          }
          map[selector] = s.cssRules.length;
          if (s.insertRule) {
            s.insertRule(selector + '{' + declaration + '}', s.cssRules.length);
          }
          else { /* IE */
            s.addRule(selector, declaration, -1);
          }
        }
      };
    })();

    /**
     * manager for javascript animation => 애니메이션 Timer
     * @private
     */
    var manager = {
      _timer: 0,
      _running: {},
      _startTimer: function() {
        if (!manager._timer) {
          manager._timer = setInterval(manager._runFrame, 1);
        }
      },
      _stopTimer: function() {
        clearInterval(manager._timer);
        manager._timer = 0;
      },
      /**
       * 등록된 모든 animation의 runFrame을 실행한다.
       */
      _runFrame: function() {
        var done = true;
        for (var i in manager._running) {
          if (manager._running[i]._runFrame) {
            done = false;
            manager._running[i]._runFrame();
          }
        }
  
        if (done) {
          manager._stopTimer();
        }
      },
      add: function(anim) {
        if (anim._id) {
          manager._running[anim._id] = anim;
          manager._startTimer();
        }
      },
      remove: function(anim) {
        if (anim._id) {
          delete manager._running[anim._id];
        }
      }
    };
    
    /**
     * CSS3 Animation Unit
     * <pre>
     * TODO:
     *  1. 차후에 JsAnimUnit 과 event 명 통합
     *  2. event 처리방식을 Event System 에 통합시킬지 결정할 것
     *  3. JsAnimUnit과의 관계 정리
     *   방안1) 구조적으로 통합하던지 (하나의 클래스에서 분기처리) 
     *   방안2) 아예 분리하던지 (동일 클래스명에 파일자체를 분리하여 로딩)
     * </pre>
     */
    var CssAnimUnit = function(anim, tid, elem, opts) {
      this.anim = anim;
      this.tid = tid;
      this.elem = elem;
      this.opts = opts;
      this.running = false;
    };
    CssAnimUnit.prototype = /** @lends CssAnimUnit */ {
      /**
       * <pre>
       * 이벤트 공통 핸들러
       *  1. 자신이 발생시킨 event 확인
       *  2. 이벤트 type 에 따라 분기
       * </pre>
       * @param e
       * @return
       * @ignore
       */
      handleEvent: function(e) {
        if (e.animationName != this.anim._id) return; 
        switch(e.type) {
          case "webkitAnimationStart" :
            this._onStart(e);
            break;
          case "webkitAnimationEnd" :
            this._onEnd(e);
            break;
          case "webkitAnimationIteration" :
            this._onIteration(e);
            break;
        }
      },
      _onStart: function(e) {
        if (this.opts.onStart) {
          this.opts.onStart(e);
        }
      },
      _onIteration: function(e) {
        if (this.opts.onIteration) {
          this.opts.onIteration(e);
        }
      },
      _onEnd: function(e) {
        // 추가옵션 선처리
        var p;
        if (this.opts.override) {
          for (p in this.opts.lastStyle) {
            e.target.style[p] = this.opts.lastStyle[p];
          }
        }
        if (this.opts.onEnd) {
          this.opts.onEnd(e);
        }
//        tau.log("end(CssAnimUnit):"+this.tid + ","+e.target.style["-webkit-animation"]);
//        tau.log(new RegExp("(^|,)(\\s)*" + this.anim._id + "(\\w|\\s|-)*(,|$)").test(e.target.style["-webkit-animation"]));
        // style 에서 자신의 animation 만 제거

        e.target.style["-webkit-animation"] = e.target.style["-webkit-animation"].replace(
            new RegExp("(^|,)(\\s)*" + this.anim._id + "(\\w|\\s|-)*(,|$)"), ",").replace(/^,+/, '').replace(/,+$/, '');
        // animation 이 끝나면 이벤트 핸들러 제거
        e.target.removeEventListener("webkitAnimationStart", this, false);
        e.target.removeEventListener("webkitAnimationEnd", this, false);
        e.target.removeEventListener("webkitAnimationIteration", this, false);
        
        if (tau.rt.has3D){
          tau.util.dom.removeClass(e.target, 'preserve3d');
        }
        
        // animation 객체에서 자신을 제거
        delete this.anim._targets[this.tid];
        // 메모리를 위해?
        delete this.anim;
        delete this.elem;
      },
      run: function() {
        var animStyle = this.anim._id + " " 
            + this.opts.duration + ((typeof this.opts.duration == "number")?"ms ":" ") 
            + this.opts.timingFunction + " " 
            + this.opts.delay + ((typeof this.opts.delay == "number")?"ms ":" ")
            + this.opts.iterationCount + " "
            + this.opts.direction;
        this.running = true;
        if (this.elem.style["-webkit-animation"]) {
          this.elem.style["-webkit-animation"] += "," + animStyle;
        } else {
          this.elem.style["-webkit-animation"] = animStyle;
        }
        if (tau.rt.has3D){
          tau.util.dom.addClass(this.elem, 'preserve3d');
        }
        this.elem.addEventListener("webkitAnimationStart", this, false);
        this.elem.addEventListener("webkitAnimationEnd", this, false);
        this.elem.addEventListener("webkitAnimationIteration", this, false);
      }
    };

    /**
     * Javascript Animation Unit
     * <pre>
     * TODO: CssAnimUnit 클래스의 todo 참고 
     * </pre>
     * @private
     */
    var JsAnimUnit = function(anim, tid, elem, opts) {
      this._id = tid;
      this.anim = anim;
      this.tid = tid;
      this.elem = elem;
      this.opts = opts;
      this.running = false;
      this._animAttrs = {
        origin: {},
        startTime: 0,
        elapsedTime: 0,
        iterations: 1
      };
    };
    JsAnimUnit.prototype = {
      /**
       * target 에 Event를 발생시킨다.
       * @param {String} name Event의 name
       * @ignore
       */
      _fireEvent: function(name) {
        var obj = this.elem;
        var e;
        if (document.createEvent) { // DOM Model
          e = document.createEvent("Events");
          e.initEvent(name, true, false);
        } else if (document.createEventObject) { // IE Model
          e = document.createEventObject();
        } else {
          return;
        }
  
        e.animationName = this.anim._id;
        e.elapsedTime = this._animAttrs.elapsedTime;
  
        if (obj.dispatchEvent) {
          obj.dispatchEvent(e);
        } else if (obj.fireEvent) {
          obj.fireEvent("on" + name, e);
        }
      },
      /**
       * <pre>
       * 이벤트 공통 핸들러
       *  1. 자신이 발생시킨 event 확인
       *  2. 이벤트 type 에 따라 분기
       * </pre>
       * @param e
       * @return
       * @ignore
       */
      handleEvent: function(e) {
        // 자신이 발생시킨 event 만 처리
        if (e.animationName != this.anim._id) return; 
        switch(e.type) {
          case "animationstart" :
            this._onStart(e);
            break;
          case "animationend" :
            this._onEnd(e);
            break;
          case "animationiteration" :
            this._onIteration(e);
            break;
        }
      },
      _onStart: function(e) {
        if (this.opts.onStart) {
          this.opts.onStart(e);
        }
      },
      _onIteration: function(e) {
        if (this.opts.onIteration) {
          this.opts.onIteration(e);
        }
      },
      _onEnd: function(e) {
        if (this.opts.onEnd) {
          this.opts.onEnd(e);
        }
        // animation 이 끝나면 이벤트 핸들러 제거
        e.target.removeEventListener("animationstart", this, false);
        e.target.removeEventListener("animationend", this, false);
        e.target.removeEventListener("animationiteration", this, false);
        // animation 객체에서 자신을 제거
        delete this.anim._targets[this.tid];
        // 메모리를 위해?
        delete this.anim;
        delete this.elem;
      },
      
      /**
       * 애니메이션 Timer 에 의해 호출되는 메서드
       * @private
       */
      _runFrame: function() {
        var target = this.elem;
        var opts = this._animAttrs.opts;
        var keys = this._animAttrs.keys;
  
        // calculate elapsed time
        var elapsed = (new Date() - 0) - this._animAttrs.startTime;

        // adapt to delay time
        var t = (elapsed - opts.delay);
        if (t < 0) {
          return;
        } else if (this._animAttrs.elapsedTime == 0) {
          this._startFrame();
        }
        // adapt to duration time
        t = (t < opts.duration) ? t : opts.duration;
  
        // apply animation
        for (var p in keys._parts) {
          var end = parseFloat(keys._parts[p][2]);
          var val = 0;
          val = opts.timingFunction(t, keys.from[p], end - keys.from[p],
              opts.duration);
          try {
            tau.fx._setAppearance(target, p, val, keys._parts[p][3]);
          } catch (e) {
          }
        }
  
        this._animAttrs.elapsedTime = elapsed;
        // fire custom event(tween)
//        this._fireEvent("animationtween");
        if (elapsed >= opts.duration) {
          this._endFrame();
        }
      },
      
      /**
       * 첫 frame에 수행할 작업
       * @ignore
       */
      _startFrame: function() {
        var target = this.elem;
        var keys = this._animAttrs.keys;
        // apply from value
        for (var p in keys.from) {
          if (this._animAttrs.origin[p] === undefined) {
            this._animAttrs.origin[p] = target.style[p];
          }
          tau.fx._setAppearance(target, p, keys.from[p]);
        };
      },
      
      /**
       * 마지막 frame에 수행할 작업
       * @private
       */
      _endFrame: function() {
        var target = this.elem;
        var keys = this._animAttrs.keys;
        var p;
        // apply to value
        if (this.opts.override) {
          for (p in this.opts.lastStyle) {
            target.style[p] = this.opts.lastStyle[p];
          }
        } else {
          for (p in this._animAttrs.origin) {
            target.style[p] = this._animAttrs.origin[p];
          };
        }
        if (this._animAttrs.opts.iterationCount > this._animAttrs.iterations) {
          this._fireEvent("animationiteration");
          this._animAttrs.iterations++;
          this._animAttrs.elapsedTime = 0;
          this._animAttrs.startTime = new Date() - this._animAttrs.elapsedTime;
        } else {
          this._animAttrs.iterations = 1;
          this._end();
        }
      },
      /**
       * destroy 메서드
       * @private
       */
      _end: function() {
        delete this._animAttrs.keys;
        delete this._animAttrs.opts;
        this._animAttrs.startTime = 0;
        manager.remove(this);
        // fire animationend event
        this._fireEvent("animationend");
        this._animAttrs.elapsedTime = 0;
      },
      
      /**
       * 초기화 메서드
       * @private
       */
      _initAnimAttrs: function() {
        var target = this.elem;
        var opts = this.opts;
        var keys = {
          from: {},
          to: {},
          _parts: {}
        };
        if (typeof opts.timingFunction != "function") {
          opts.timingFunction = tau.fx.easing[opts.timingFunction];
        }
        // from
        for (var p in this.anim._keyframes.from) {
          keys.from[p] = this.anim._keyframes.from[p];
        }
        if (keys.from.x) {
          if (!keys.from.left) {
            keys.from.left = keys.from.x;
          }
          delete keys.from.x;
        }
        if (keys.from.y) {
          if (!keys.from.top) {
            keys.from.top = keys.from.y;
          }
          delete keys.from.y;
        }
        // to
        for (var p in this.anim._keyframes.to) {
          keys.to[p] = this.anim._keyframes.to[p];
        }
        if (keys.to.x) {
          if (!keys.to.left) {
            keys.to.left = keys.to.x;
          }
          delete keys.to.x;
        }
        if (keys.to.y) {
          if (!keys.to.top) {
            keys.to.top = keys.to.y;
          }
          delete keys.to.y;
        }
        
        for (var p in keys.to) {
          this._animAttrs.origin[p] = target.style[p];
          var parts = tau.fx._RFXNUM.exec(keys.to[p]);
          if (parts) {
            keys._parts[p] = parts;
            if (keys.from[p] == null) {
              var unit = keys._parts[p][3] || "px";
              if (unit !== "px") {
                var start = tau.fx._getAppearance(target, p, true) || 0;
                var end = parseFloat(keys._parts[p][2]) || 1;
                tau.fx._setAppearance(target, p, end, unit);
                start = (end / tau.fx._getAppearance(target, p, true)) * start;
                tau.fx._setAppearance(target, p, start, unit);
                keys.from[p] = start;
              } else {
                keys.from[p] = tau.fx._getAppearance(target, p, true);
              }
            } else {
              keys.from[p] = parseFloat(keys.from[p]);
            }
          }
        }
        this._animAttrs.opts = opts;
        this._animAttrs.keys = keys;
      },
      run: function() {
        this._initAnimAttrs();
        this._animAttrs.startTime = new Date() - this._animAttrs.elapsedTime;
//        tau.log("run(JsAnimUnit):"+this.tid);
        this.running = true;
        this.elem.addEventListener("animationstart", this, false);
        this.elem.addEventListener("animationend", this, false);
        this.elem.addEventListener("animationiteration", this, false);
        manager.add(this);
        // fire animationstart event
        this._fireEvent("animationstart");
      }
    };

    /** @lends tau.fx.Animation */
    $class('tau.fx.Animation').define({
      $static: /** @lends tau.fx.Animation */ {
        _toCssText: function (obj) {
          var text = "", sub, i, j;
          for (i in obj) {
            sub = obj[i];
            text += i + "{";
            for (j in sub) {
              text += j + ":" + sub[j] + ";"; 
            }
            text += "} ";
          }
          return text;
        },
        /**
         * animation default keyframes 
         */
        DEFAULT_KEYFRAMES: {
          from: {},
          to: {}
        },
        /**
         * animation default options 
         */
        DEFAULT_OPTIONS: {
          duration: 250,
          timingFunction: "ease-in-out",
          delay: 0,
          iterationCount: 1,
          direction: "normal",
          override: false
        }
      },
      /**
       * Creates new Animation
       * @class Creates new Animation
       * @param {Object} keyframes keyframes of animation
       * @param {Object} keyframes.from
       * @param {Object} keyframes.to
       * @param {Object} opts default options of animation
       * @param {Number} opts.duration Duration of animation
       * @param {String|Function} opts.timingFunction timing function
       *        {@link tau.fx.easing}
       * @param {Number} opts.delay Delay of animation
       * @param {Number} opts.iterationCount count to repeat animation
       * @param {Boolean} opts.override override style after animation
       * @constructs
       */
      Animation: function(keyframes, opts) {
        this._id = "a" + (new Date() - 0) + Math.floor(Math.random() * 100);
        this._keyframes =  tau.mixin(keyframes, tau.fx.Animation.DEFAULT_KEYFRAMES);
        this._opts =  tau.mixin(opts, tau.fx.Animation.DEFAULT_OPTIONS);
        this._targets = {};
        this._useCSS3 = (animStylesheet != null);
        if (this._useCSS3) {
          animStylesheet.setRule("@-webkit-keyframes " + this._id, tau.fx.Animation._toCssText(this._keyframes));
        }
      },
      _run: function() {
        var tid;
        for(tid in this._targets) {
          if (!this._targets[tid].running) {
            this._targets[tid].run();
          }
        }
      },
      /**
       * @param {Element} elem apply to DOMElement
       * @param {Object} opts individual options 
       */
      animate: function(elem, opts) {
        if (!elem) {
          return;
        }
        opts = tau.mixin(opts, this._opts);
        if (opts.override) {
          opts.lastStyle = this._keyframes.to;
        }
        var self = this,
            tid = "au" + (new Date() - 0) + Math.floor(Math.random() * 100);
        this._targets[tid] = (this._useCSS3) ? new CssAnimUnit(this, tid, elem, opts) : new JsAnimUnit(this, tid, elem, opts);

        window.setTimeout(function(){self._run();}, 0);
      }
    });

    /**
     * built-in Animation instances
     * @private
     */
    var BuiltIn = {
      FADEIN: new tau.fx.Animation({
        from: {
          opacity: 0
        },
        to: {
          opacity: 1
        }
      },{
        duration: 1000,
        override: true
      }),
      FADEOUT: new tau.fx.Animation({
        from: {
          opacity: 1
        },
        to: {
          display: "none",
          opacity: 0
        }
      },{
        duration:1000,
        override:true
      })
    };

    
    /**
     * @lends tau.fx.Anim.prototype
     */
    $class('tau.fx.Anim').mixin(tau.fx.Playable).define({
      $static: 
      /**
       * @static
       * @lends tau.fx.Anim
       */
      {
        /**
         * animation default keyframes 
         */
        DEFAULT_KEYFRAMES: {
          from: {},
          to: {}
        },
        /**
         * animation default options 
         */
        DEFAULT_OPTIONS: {
          duration: 250,
          timingFunction: "ease-in-out",
          delay: 0,
          reset: false,
          iterationCount: 1, // TODO:나중에 구현
          direction: "normal" // TODO:나중에 구현
        }
      },
      /**
       * Creates new Animation
       * @class Creates new Animation
       * @param {Component} target Component object for animation
       * @param {Object} keyframes
       * @param {Object} keyframes.from
       * @param {Object} keyframes.to
       * @param {Object} options Options of animation
       * @param {Number} options.duration Duration of animation
       * @param {String|Function} options.timingFunction timing function
       *        {@link tau.fx.easing}
       * @param {Number} options.delay Delay of animation
       * @borrows tau.fx.Playable.isPaused as #isPaused
       * @borrows tau.fx.Playable.isRunning as #isRunning
       * @borrows tau.fx.Playable.pause as #pause
       * @borrows tau.fx.Playable.play as #play
       * @borrows tau.fx.Playable.stop as #stop
       * @constructs
       */
      Anim: function(target, keyframes, options) {
        this._id = (new Date() - 0) + Math.floor(Math.random() * 100);
        this._running = false;
        this._paused = false;
        this._target = target;
        this._animAttrs = {
          origin: {},
          startTime: 0,
          elapsedTime: 0,
          iterations: 1
        };
//        this._options = tau.util.applyDefault(options, tau.fx.Anim.DEFAULT_OPTIONS, true);
//        this._keyframes = tau.util.applyDefault(keyframes, tau.fx.Anim.DEFAULT_KEYFRAMES, true);
        this._options =  tau.mixin(options, tau.fx.Anim.DEFAULT_OPTIONS);
        this._keyframes =  tau.mixin(keyframes, tau.fx.Anim.DEFAULT_KEYFRAMES);
      },
      /**
       * 필요한 경우, event attrs 를 추가 해준다.
       * _fireEvent 에서 호출된다.
       * @param {Event} e 오리지널 Event
       */
      _addEventAttrs: function(e) {
        e.animationName = this._id;
        e.animationTarget = this._target;
        e.elapsedTime = this._animAttrs.elapsedTime;
      },
      /**
       * target 에 Event를 발생시킨다.
       * @param {String} name Event의 name
       */
      _fireEvent: function(name) {
        var obj = this._target;
        if (obj.getDOM) {
          obj = obj.getDOM();
        }
        if (document.createEvent) { // DOM Model
          var e = document.createEvent("Events");
          e.initEvent(name, true, false);
        } else if (document.createEventObject) { // IE Model
          var e = document.createEventObject();
        } else {
          return;
        }
  
        // event attrs 추가
        e.tauEventId = this._id;
        this._addEventAttrs(e);
  
        if (obj.dispatchEvent) {
          obj.dispatchEvent(e);
        } else if (obj.fireEvent) {
          obj.fireEvent("on" + name, e);
        }
      },
      /**
       * 애니메이션 Timer 에 의해 호출되는 메서드
       */
      _runFrame: function() {
        var target = this._target;
        var opts = this._animAttrs.opts;
        var keys = this._animAttrs.keys;
  
        // calculate elapsed time
        var elapsed = (new Date() - 0) - this._animAttrs.startTime;
  
        // adapt to delay time
        var t = (elapsed - opts.delay);
        if (t < 0) {
          return;
        } else if (this._animAttrs.elapsedTime == 0) {
          this._startFrame();
        }
        // adapt to duration time
        t = (t < opts.duration) ? t : opts.duration;
  
        // apply animation
        for (var p in keys._parts) {
          var end = parseFloat(keys._parts[p][2]);
          var val = 0;
          val = opts.timingFunction(t, keys.from[p], end - keys.from[p],
              opts.duration);
          // document.getElementById('log1').value =
          // this._get("playState")+":"+t + ":" + val + "\n"
          // + document.getElementById('log1').value;
          try {
            tau.fx._setAppearance(target, p, val, keys._parts[p][3]);
          } catch (e) {
          }
        }
  
        this._animAttrs.elapsedTime = elapsed;
        // fire custom event(tween)
        this._fireEvent("animationtween");
        if (elapsed >= opts.duration) {
          this._endFrame();
        }
      },
      /**
       * 첫 frame에 수행할 작업
       */
      _startFrame: function() {
        var target = this._target;
        var keys = this._animAttrs.keys;
        // apply from value
        for (var p in keys.from) {
          if (this._animAttrs.origin[p] === undefined) {
            this._animAttrs.origin[p] = target.style[p];
          }
          tau.fx._setAppearance(target, p, keys.from[p]);
        };
      },
      /**
       * 마지막 frame에 수행할 작업
       */
      _endFrame: function() {
        var target = this._target;
        var keys = this._animAttrs.keys;
        // apply to value
        for (var p in keys.to) {
          tau.fx._setAppearance(target, p, keys.to[p]);
        };
        if (this._animAttrs.opts.iterationCount > this._animAttrs.iterations) {
          this._fireEvent("animationiteration");
          this._animAttrs.iterations++;
          this._animAttrs.elapsedTime = 0;
          this._animAttrs.startTime = new Date() - this._animAttrs.elapsedTime;
        } else {
          this._animAttrs.iterations = 1;
          if (this._options.reset) {
            for (var p in this._animAttrs.origin) {
              target.style[p] = this._animAttrs.origin[p];
            };
          }
          this.stop();
        }
      },
      /**
       * 초기화 메서드
       */
      _initAnimAttrs: function() {
        var target = this._target;
        var opts = this._options;
        var keys = {
          from: {},
          to: {},
          _parts: {}
        };
        if (typeof opts.timingFunction != "function") {
          opts.timingFunction = tau.fx.easing[opts.timingFunction];
        }
        // from
        for (var p in this._keyframes.from) {
          keys.from[p] = this._keyframes.from[p];
        }
        if (keys.from.x) {
          if (!keys.from.left) {
            keys.from.left = keys.from.x;
          }
          delete keys.from.x;
        }
        if (keys.from.y) {
          if (!keys.from.top) {
            keys.from.top = keys.from.y;
          }
          delete keys.from.y;
        }
        // to
        for (var p in this._keyframes.to) {
          keys.to[p] = this._keyframes.to[p];
        }
        if (keys.to.x) {
          if (!keys.to.left) {
            keys.to.left = keys.to.x;
          }
          delete keys.to.x;
        }
        if (keys.to.y) {
          if (!keys.to.top) {
            keys.to.top = keys.to.y;
          }
          delete keys.to.y;
        }
        
        for (var p in keys.to) {
          this._animAttrs.origin[p] = target.style[p];
          var parts = tau.fx._RFXNUM.exec(keys.to[p]);
          if (parts) {
            keys._parts[p] = parts;
            if (keys.from[p] == null) {
              var unit = keys._parts[p][3] || "px";
              if (unit !== "px") {
                var start = tau.fx._getAppearance(target, p, true) || 0;
                var end = parseFloat(keys._parts[p][2]) || 1;
                tau.fx._setAppearance(target, p, end, unit);
                start = (end / tau.fx._getAppearance(target, p, true)) * start;
                tau.fx._setAppearance(target, p, start, unit);
                keys.from[p] = start;
              } else {
                keys.from[p] = tau.fx._getAppearance(target, p, true);
              }
            } else {
              keys.from[p] = parseFloat(keys.from[p]);
            }
          }
        }
        this._animAttrs.opts = opts;
        this._animAttrs.keys = keys;
      },
      /**
       * play() 에 호출될 메서드
       */
      _start: function() {
        this._initAnimAttrs();
        this._animAttrs.startTime = new Date() - this._animAttrs.elapsedTime;
        manager.add(this);
        // fire animationstart event
        this._fireEvent("animationstart");
      },
      /**
       * pause() 에 호출될 메서드
       */
      _pause: function() {
        this._animAttrs.startTime = 0;
        manager.remove(this);
        // fire custom event(pause)
        this._fireEvent("animationpause");
      },
      /**
       * play() 에 호출될 메서드
       */
      _resume: function() {
        this._animAttrs.startTime = new Date() - this._animAttrs.elapsedTime;
        manager.add(this);
        // fire custom event(resume)
        this._fireEvent("animationresume");
      },
      /**
       * stop() 에 호출될 메서드
       */
      _end: function() {
        delete this._animAttrs.keys;
        delete this._animAttrs.opts;
        this._animAttrs.startTime = 0;
        manager.remove(this);
        // fire animationend event
        this._fireEvent("animationend");
        this._animAttrs.elapsedTime = 0;
      },
      /**
       * Add Event Listener
       * @param {String} name valid event names => animationstart|animationend|animationpause|animationresume|animationtween
       * @param {Function} handler event handler function
       */
      onEvent: function(name, handler) {
        var obj = this._target;
        if (obj.getDOM) {
          obj = obj.getDOM();
        }
        var id = this._id;
        var animHandler = function(evt) {
          if (evt.tauEventId && evt.tauEventId == id) {
            handler(evt);
          }
        };
        if (obj.addEventListener) {
          obj.addEventListener(name, animHandler, false);
        } else if (obj.attachEvent) {
          obj.attachEvent("on" + name, animHandler);
        }
      }
    });

    /** @lends tau.fx._Combine# */
    $class('tau.fx._Combine').mixin(tau.fx.Playable).define({
      /**
       * Creates combined Animation
       * @class Creates combined Animation
       * @param {Array} anims animation object array
       * @borrows tau.fx.Playable.isPaused as #isPaused
       * @borrows tau.fx.Playable.isRunning as #isRunning
       * @borrows tau.fx.Playable.pause as #pause
       * @borrows tau.fx.Playable.play as #play
       * @borrows tau.fx.Playable.stop as #stop
       * @constructs
       */
      _Combine: function(anims) {
        this._anims = anims;
      },
      /**
       * play() 에 호출될 메서드
       */
      _start: function() {
        for (var i in this._anims) {
          if (this._anims[i].play) {
            this._anims[i].play();
          }
        }
      },
      /**
       * pause() 에 호출될 메서드
       */
      _pause: function() {
        for (var i in this._anims) {
          if (this._anims[i].pause) {
            this._anims[i].pause();
          }
        }
      },
      /**
       * play() 에 호출될 메서드
       */
      _resume: function() {
        for (var i in this._anims) {
          if (this._anims[i].play) {
            this._anims[i].play();
          }
        }
      },
      /**
       * stop() 에 호출될 메서드
       */
      _end: function() {
        for (var i in this._anims) {
          if (this._anims[i].stop) {
            this._anims[i].stop();
          }
        }
        this._running = false;
        this._paused = false;
      },
      /**
       * Whether animation is running or not
       * @return {Boolean}
       */
      isRunning: function() {
        for (var i in this._anims) {
          if (this._anims[i].isRunning()) {
            return true;
          }
        }
        return false;
      }
    });

    /** @lends tau.fx._Chain# */
    $class('tau.fx._Chain').mixin(tau.fx.Playable).define({
      /**
       * Creates chained Animation
       * @class Creates chained Animation
       * @param {Array} anims animation object array
       * @borrows tau.fx.Playable.isPaused as #isPaused
       * @borrows tau.fx.Playable.isRunning as #isRunning
       * @borrows tau.fx.Playable.pause as #pause
       * @borrows tau.fx.Playable.play as #play
       * @borrows tau.fx.Playable.stop as #stop
       * @constructs
       */
      _Chain: function(anims) {
        this._id = (new Date() - 0) + Math.floor(Math.random() * 100);
        this._anims = anims;
        this._currIdx = -1;
      },
      /**
       * animation manager에 의해 호출될 메서드
       */
      _runFrame: function() {
        if (!this._anims[this._currIdx].isRunning()) {
          this._currIdx++;
          if (this._anims.length > this._currIdx) {
            this._anims[this._currIdx].play();
          } else {
            this.stop();
          }
        }
      },
      /**
       * play() 에 호출될 메서드
       */
      _start: function() {
        this._currIdx = 0;
        if (this._anims.length > this._currIdx) {
          this._anims[this._currIdx].play();
          manager.add(this);
        }
      },
      /**
       * pause() 에 호출될 메서드
       */
      _pause: function() {
        if (this._anims[this._currIdx].isRunning()) {
          this._anims[this._currIdx].pause();
        }
        manager.remove(this);
      },
      /**
       * play() 에 호출될 메서드
       */
      _resume: function() {
        if (this._anims[this._currIdx].isPaused()) {
          this._anims[this._currIdx].play();
        }
        manager.add(this);
      },
      /**
       * stop() 에 호출될 메서드
       */
      _end: function() {
        if (this._anims.length > this._currIdx && this._anims[this._currIdx].isRunning()) {
          this._anims[this._currIdx].stop();
        }
        manager.remove(this);
        this._currIdx = -1;
      }
    });

    // from webkit source files UnitBezier.h, AnimationBase.cpp
    var solveCubicBezierFunction = function(p1x, p1y, p2x, p2y, t, duration) {
      function sampleCurveX(t) {
        // `ax t^3 + bx t^2 + cx t' expanded using Horner's rule.
        return ((ax * t + bx) * t + cx) * t;
      }
      function sampleCurveY(t) {
        return ((ay * t + by) * t + cy) * t;
      }
      function sampleCurveDerivativeX(t) {
        return (3.0 * ax * t + 2.0 * bx) * t + cx;
      }
      // Given an x value, find a parametric value it came from.
      function solveCurveX(x, epsilon) {
        var t0, t1, t2, x2, d2, i;
        function fabs(n) {
          if (n >= 0) {
            return n;
          } else {
            return 0 - n;
          }
        }
        // First try a few iterations of Newton's method -- normally very fast.
        for (t2 = x, i = 0; i < 8; i++) {
          x2 = sampleCurveX(t2) - x;
          if (fabs(x2) < epsilon) {
            return t2;
          }
          d2 = sampleCurveDerivativeX(t2);
          if (fabs(d2) < 1e-6) {
            break;
          }
          t2 = t2 - x2 / d2;
        }
        // Fall back to the bisection method for reliability.
        t0 = 0.0;
        t1 = 1.0;
        t2 = x;
        if (t2 < t0) {
          return t0;
        }
        if (t2 > t1) {
          return t1;
        }
        while (t0 < t1) {
          x2 = sampleCurveX(t2);
          if (fabs(x2 - x) < epsilon) {
            return t2;
          }
          if (x > x2) {
            t0 = t2;
          } else {
            t1 = t2;
          }
          t2 = (t1 - t0) * .5 + t0;
        }
        // Failure.
        return t2;
      }
      function solve(x, epsilon) {
        return sampleCurveY(solveCurveX(x, epsilon));
      }

      // The epsilon value we pass to UnitBezier::solve given that the animation
      // is going to run over |dur| seconds. The longer the animation, the more
      // precision we need in the timing function result to avoid ugly
      // discontinuities.
      function solveEpsilon(duration) {
        return 1.0 / (200.0 * duration);
      }

      // Calculate the polynomial coefficients, implicit first and last control
      // points are (0,0) and (1,1).
      var ax = 0, bx = 0, cx = 0, ay = 0, by = 0, cy = 0;
      cx = 3.0 * p1x;
      bx = 3.0 * (p2x - p1x) - cx;
      ax = 1.0 - cx - bx;
      cy = 3.0 * p1y;
      by = 3.0 * (p2y - p1y) - cy;
      ay = 1.0 - cy - by;

      return solve(t, solveEpsilon(duration));
    };

    /**
     * easing functions t: current time, b: beginning value, c: change in value,
     * d: duration
     * @namespace easing functions
     * @static
     * @see <a
     *      href="http://www.timotheegroleau.com/Flash/experiments/easing_function_generator.htm">Easing
     *      Function Generator</a>
     * @see <a href="http://code.google.com/p/tweener/">Tweener</a>
     */
    tau.fx.easing = {
      ease: function(t, b, c, d) {
        return c * solveCubicBezierFunction(0.25, 0.1, 0.25, 1.0, t / d, 1) + b;
      },
      "ease-in": function(t, b, c, d) {
        return c * solveCubicBezierFunction(0.42, 0, 1.0, 1.0, t / d, 1) + b;
      },
      "ease-out": function(t, b, c, d) {
        return c * solveCubicBezierFunction(0, 0, 0.58, 1.0, t / d, 1) + b;
      },
      "ease-in-out": function(t, b, c, d) {
        return c * solveCubicBezierFunction(0.42, 0, 0.58, 1.0, t / d, 1) + b;
      },
      /**
       * simple linear tweening - no easing, no acceleration
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeNone: function(t, b, c, d) {
        return c * t / d + b;
      },
      /**
       * quadratic easing in - accelerating from zero velocity
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeInQuad: function(t, b, c, d) {
        return c * (t /= d) * t + b;
      },
      /**
       * quadratic easing out - decelerating to zero velocity
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeOutQuad: function(t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
      },
      /**
       * quadratic easing in/out - acceleration until halfway, then deceleration
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeInOutQuad: function(t, b, c, d) {
        if ((t /= d / 2) < 1)
          return c / 2 * t * t + b;
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
      },
      /**
       * cubic easing in - accelerating from zero velocity
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeInCubic: function(t, b, c, d) {
        return c * (t /= d) * t * t + b;
      },
      /**
       * cubic easing out - decelerating to zero velocity
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeOutCubic: function(t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b;
      },
      /**
       * cubic easing in/out - acceleration until halfway, then deceleration
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeInOutCubic: function(t, b, c, d) {
        if ((t /= d / 2) < 1)
          return c / 2 * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t + 2) + b;
      },
      /**
       * cubic easing out/in - deceleration until halfway, then acceleration
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeOutInCubic: function(t, b, c, d) {
        if (t < d / 2)
          return tau.fx.easing.easeOutCubic(t * 2, b, c / 2, d);
        return tau.fx.easing.easeInCubic((t * 2) - d, b + c / 2, c / 2, d);
      },
      /**
       * quartic easing in - accelerating from zero velocity
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeInQuart: function(t, b, c, d) {
        return c * (t /= d) * t * t * t + b;
      },
      /**
       * quartic easing out - decelerating to zero velocity
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeOutQuart: function(t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
      },
      /**
       * quartic easing in/out - acceleration until halfway, then deceleration
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeInOutQuart: function(t, b, c, d) {
        if ((t /= d / 2) < 1)
          return c / 2 * t * t * t * t + b;
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
      },
      /**
       * quartic easing out/in - deceleration until halfway, then acceleration
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeOutInQuart: function(t, b, c, d) {
        if (t < d / 2)
          return tau.fx.easing.easeOutQuart(t * 2, b, c / 2, d);
        return tau.fx.easing.easeInQuart((t * 2) - d, b + c / 2, c / 2, d);
      },
      /**
       * quintic easing in - accelerating from zero velocity
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeInQuint: function(t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
      },
      /**
       * quintic easing out - decelerating to zero velocity
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeOutQuint: function(t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
      },
      /**
       * quintic easing in/out - acceleration until halfway, then deceleration
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeInOutQuint: function(t, b, c, d) {
        if ((t /= d / 2) < 1)
          return c / 2 * t * t * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
      },
      /**
       * quintic easing out/in - deceleration until halfway, then acceleration
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeOutInQuint: function(t, b, c, d) {
        if (t < d / 2)
          return tau.fx.easing.easeOutQuint(t * 2, b, c / 2, d);
        return tau.fx.easing.easeInQuint((t * 2) - d, b + c / 2, c / 2, d);
      },
      /**
       * sinusoidal easing in - accelerating from zero velocity
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeInSine: function(t, b, c, d) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
      },
      /**
       * sinusoidal easing out - decelerating to zero velocity
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeOutSine: function(t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
      },
      /**
       * sinusoidal easing in/out - accelerating until halfway, then
       * decelerating
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeInOutSine: function(t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
      },
      /**
       * sinusoidal easing out/in - decelerating until halfway, then
       * accelerating
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeOutInSine: function(t, b, c, d) {
        if (t < d / 2)
          return tau.fx.easing.easeOutSine(t * 2, b, c / 2, d);
        return tau.fx.easing.easeInSine((t * 2) - d, b + c / 2, c / 2, d);
      },
      /**
       * exponential easing in - accelerating from zero velocity
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeInExpo: function(t, b, c, d) {
        return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b - c * 0.001;
      },
      /**
       * exponential easing out - decelerating to zero velocity
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeOutExpo: function(t, b, c, d) {
        return (t == d) ? b + c : c * 1.001 * (-Math.pow(2, -10 * t / d) + 1)
            + b;
      },
      /**
       * exponential easing in/out - accelerating until halfway, then
       * decelerating
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeInOutExpo: function(t, b, c, d) {
        if (t == 0)
          return b;
        if (t == d)
          return b + c;
        if ((t /= d / 2) < 1)
          return c / 2 * Math.pow(2, 10 * (t - 1)) + b - c * 0.0005;
        return c / 2 * 1.0005 * (-Math.pow(2, -10 * --t) + 2) + b;
      },
      /**
       * exponential easing out/in - decelerating until halfway, then
       * accelerating
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeOutInExpo: function(t, b, c, d) {
        if (t < d / 2)
          return tau.fx.easing.easeOutExpo(t * 2, b, c / 2, d);
        return tau.fx.easing.easeInExpo((t * 2) - d, b + c / 2, c / 2, d);
      },
      /**
       * circular easing in - accelerating from zero velocity
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeInCirc: function(t, b, c, d) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
      },
      /**
       * circular easing out - decelerating to zero velocity
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeOutCirc: function(t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
      },
      /**
       * circular easing in/out - acceleration until halfway, then deceleration
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeInOutCirc: function(t, b, c, d) {
        if ((t /= d / 2) < 1)
          return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
      },
      /**
       * circular easing out/in - deceleration until halfway, then acceleration
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeOutInCirc: function(t, b, c, d) {
        if (t < d / 2)
          return tau.fx.easing.easeOutCirc(t * 2, b, c / 2, d);
        return tau.fx.easing.easeInCirc((t * 2) - d, b + c / 2, c / 2, d);
      },
      /**
       * elastic easing in - accelerating from zero velocity
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeInElastic: function(t, b, c, d, a, p) {
        var s;
        if (t == 0)
          return b;
        if ((t /= d) == 1)
          return b + c;
        if (!p)
          p = d * .3;
        if (!a || a < Math.abs(c)) {
          a = c;
          s = p / 4;
        } else
          s = p / (2 * Math.PI) * Math.asin(c / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s)
            * (2 * Math.PI) / p))
            + b;
      },
      /**
       * elastic easing out - decelerating to zero velocity
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeOutElastic: function(t, b, c, d, a, p) {
        var s;
        if (t == 0)
          return b;
        if ((t /= d) == 1)
          return b + c;
        if (!p)
          p = d * .3;
        if (!a || a < Math.abs(c)) {
          a = c;
          s = p / 4;
        } else
          s = p / (2 * Math.PI) * Math.asin(c / a);
        return (a * Math.pow(2, -10 * t)
            * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
      },
      /**
       * elastic easing in/out - acceleration until halfway, then deceleration
       * @param {Number} t current time
       * @param {Number} b beginning value
       * @param {Number} c change in value
       * @param {Number} d duration time
       * @returns {Number} current value
       */
      easeInOutElastic: function(t, b, c, d, a, p) {
        var s;
        if (t == 0)
          return b;
        if ((t /= d / 2) == 2)
          return b + c;
        if (!p)
          p = d * (.3 * 1.5);
        if (!a || a < Math.abs(c)) {
          a = c;
          s = p / 4;
        } else
          s = p / (2 * Math.PI) * Math.asin(c / a);
        if (t < 1)
          return -.5
              * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s)
                  * (2 * Math.PI) / p)) + b;
        return a * Math.pow(2, -10 * (t -= 1))
            * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
      },
      easeOutInElastic: function(t, b, c, d, a, p) {
        if (t < d / 2)
          return tau.fx.easing.easeOutElastic(t * 2, b, c / 2, d, a, p);
        return tau.fx.easing.easeInElastic((t * 2) - d, b + c / 2, c / 2, d, a,
            p);
      },
      easeInBack: function(t, b, c, d, s) {
        if (s == undefined)
          s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
      },
      easeOutBack: function(t, b, c, d, s) {
        if (s == undefined)
          s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
      },
      easeInOutBack: function(t, b, c, d, s) {
        if (s == undefined)
          s = 1.70158;
        if ((t /= d / 2) < 1)
          return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
      },
      easeOutInBack: function(t, b, c, d, s) {
        if (t < d / 2)
          return tau.fx.easing.easeOutBack(t * 2, b, c / 2, d, s);
        return tau.fx.easing.easeInBack((t * 2) - d, b + c / 2, c / 2, d, s);
      },
      easeInBounce: function(t, b, c, d) {
        return c - tau.fx.easing.easeOutBounce(d - t, 0, c, d) + b;
      },
      easeOutBounce: function(t, b, c, d) {
        if ((t /= d) < (1 / 2.75)) {
          return c * (7.5625 * t * t) + b;
        } else if (t < (2 / 2.75)) {
          return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
        } else if (t < (2.5 / 2.75)) {
          return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
        } else {
          return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
        }
      },
      easeInOutBounce: function(t, b, c, d) {
        if (t < d / 2)
          return tau.fx.easing.easeInBounce(t * 2, 0, c, d) * .5 + b;
        else
          return tau.fx.easing.easeOutBounce(t * 2 - d, 0, c, d) * .5 + c * .5
              + b;
      },
      easeOutInBounce: function(t, b, c, d) {
        if (t < d / 2)
          return tau.fx.easing.easeOutBounce(t * 2, b, c / 2, d);
        return tau.fx.easing.easeInBounce((t * 2) - d, b + c / 2, c / 2, d);
      }
    }; // tau.fx.easing
    /**
     * Synonym for {@link tau.fx.easing.easeNone}
     * @param {Number} t current time
     * @param {Number} b beginning value
     * @param {Number} c change in value
     * @param {Number} d duration time
     * @returns {Number} current value
     * @function
     */
    tau.fx.easing.linear = tau.fx.easing.easeNone;
  }
})();