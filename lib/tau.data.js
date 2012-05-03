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
(function(global) {

      /**
       * Request option context maker.
       * @private
       * @param {Object} opts Request options
       * @returns {Object} Request context
       */
  var _createRequestOpts = function (opts) {
        opts = tau.mixin({
          // Default Request Options
          type: 'GET',              // 'GET', 'POST', 'JSONP'
          contentType: 'application/x-www-form-urlencoded',
          encoding: 'UTF-8',
          async: true,
          timeout: 5000,            // Default timeout is 5 seconds
          silent: false,            // Does not fire system events
          url: ''                   // URL used to send the request
          /** @param {String} params Parameters used by POST request */
          /** @param {String} username User name for an authentication */
          /** @param {String} password Password for an authentication */
          /** @param {String} callbackParam JSONP callback param key */
        }, opts, true);
        return opts;
      },

      /**
       * Creates equest timeout handler.
       * <p/>
       * Timeout callback handled via request ctx.responseProxy.
       * @private
       * @param {Object} ctx Request context
       * @returns {Number} Timer id if the timeout was set, undefined otherwise
       */
      _createTimeout = function (ctx) {
        if (ctx.timeout > 0) {
          /** Request timed out, notify callback handler 
           * @inner */
          return setTimeout(function () {
            // Timeout Error call by passing in an error response
            if (tau.isFunction(ctx.responseProxy)) {
              ctx.responseProxy(new _Response(408, 'Client Request Timeout'));
            }
          }, ctx.timeout);
        }
        return undefined;
      },

      /**
       * Notifies a runtime system event.
       * @private
       * @param {Object} ctx Request context
       * @param {String} eventName Event name
       */
      _fireSysEvent = function (eventName, ctx) {
        if (!ctx.silent) {
          tau.getRuntime().fireEvent(eventName, ctx.id);
        }
      },

      /**
       * @class
       * A response corresponding to a XML/XSS/Proxy request.
       * @constructs
       * @private
       * @param {Number} status Request status
       * @param {String} statusText Status in string
       * @param {String} contType Content type (e.g. html/text)
       * @param {String} respText Content in text
       * @param {String} respXML Content in XML
       */
      _Response = function (status, statusText, contType, respText, respXML) {
        this.status = status || 0;
        this.statusText = statusText || '';
        this.contentType = contType || '';
        this.responseText = respText || '';
        if (contType && contType.indexOf('application/json') != -1) {
          this.responseJSON = tau.isString(respText) ? tau.parse(respText) : respText;
        } else {
          if (!respXML) {
            respXML = (new DOMParser()).parseFromString(respText);
          }
          this.responseXML = respXML || null;
        }
      };


  /** @lends tau.data.XMLRequest */
  $class('tau.data.XMLRequest').define({
    /**
     * @class
     * XMLHttpRequest wrapped request helper.
     * <p/>
     * System Events Fired:
     * <pre>
     *  Request sent: "requestsent" (tau.rt.Event.REQ_SENT)
     *  Request received: "requestreceived" (tau.rt.Event.REQ_RECEIVED)
     *  Request aborted: "requestaborted" (tau.rt.Event.REQ_ABORTED)
     * </pre>
     * @constructs
     */
    XMLRequest: function (opts) {
      /** @private Default options */
      this._opts = _createRequestOpts(opts);
      /** @private Maps request id to per XMLRequest instance */
      this._registry = {};
    },

    /**
     * Sends a request using XMLHttpRequest.
     * @param {String} url URL to send the 
     * @param {Function} callbackFn Request success/fail callback function
     * @param {Object} opts Overrideable request options
     * @returns {String} Request id
     */
    send: function (url, callbackFn, opts) {
      var that = this,
          ctx = tau.mixin({
        id: tau.genId('xml'),
        req: new XMLHttpRequest(),
        timestamp: new Date().getTime(),
        url: tau.isString(url) ? url : undefined,
        callbackFn: tau.isFunction(callbackFn) ? callbackFn : undefined,

        /**
         * Handles both XHR state changes and native response errors.
         * (will be assigned to XMLHttpRequest.XHR.onreadystatechange)
         * <p/>
         * Note: client-aborted requests must not be handled here because 
         * aborted request must not call the <code>callbackFn</code>.
         * @inner
         * @param {Object} event XHR request or error Response
         */
        responseProxy: function (event) {
          var resp = null;
          if (ctx.req 
              && (ctx.req.readyState === 4 || event instanceof _Response)) {
            ctx.req.onreadystatechange = null; // Avoid timeout race condition 

            if (event instanceof _Response) {
              // Error initiated by the client: abort XHR
              ctx.req.abort();
              resp = event;
            } else {
              // Successfully received response via XHR (status: 200 - 299)
              resp = new _Response(ctx.req.status, ctx.req.statusText, 
                            ctx.req.getResponseHeader('Content-Type'), 
                            ctx.req.responseText, ctx.req.responseXML);
            }
            tau.log.debug('status: ' + resp.statusText + '(' + ctx.id + ')', that);

            if (tau.isFunction(ctx.callbackFn)) {
              ctx.callbackFn(resp);  // Client callback with native response
            }

            ctx.release();
            _fireSysEvent(tau.rt.Event.REQ_RECEIVED, ctx);
          }
        },

        /** Releases all of the request resource for this closure. 
         * @inner */
        release: function () {
          if (ctx.timeoutId) {
            clearTimeout(ctx.timeoutId);
          }
          delete that._registry[ctx.id];
          ctx.req = null; // Prevent closure memory leak on onreadystatechange
        }
      }, tau.mixin(tau.mixin({}, opts), this._opts));
      ctx.req.onreadystatechange = ctx.responseProxy;

      if (ctx.async) {
        this._registry[ctx.id] = ctx; // Async request registration
        ctx.timeoutId = _createTimeout(ctx);
      }

      if (document.URL.indexOf('http://') == -1) {
        throw new Error('Under original scheme of \''
            + document.URL.substring(0, document.URL.indexOf(':') + 3)
            + '\' your request can not be handled as XHR: '
            + ctx.url + this.currentStack());
      }
      // Send XHR request
      try {
        _fireSysEvent(tau.rt.Event.REQ_SENT, ctx);
        if (ctx.url.indexOf('http://') == 0 
            && ctx.url.indexOf('http://' + document.domain) == -1) {
          ctx.referer = ctx.url;  // tunnel proxy
          ctx.url =  './proxy';
        }
        ctx.req.open(ctx.type, ctx.url, ctx.async, ctx.username, ctx.password);
        if (ctx.referer) {
          ctx.req.setRequestHeader('x-tau-uri', ctx.referer);
        }
        ctx.req.setRequestHeader('Content-type', ctx.contentType);
        ctx.req.send(ctx.type.toUpperCase() === 'GET' ? 
            null : tau.url(ctx.url, ctx.params).query());

        // Synchronous response can do callback immediately after
        if (!ctx.async) {
          ctx.callbackFn(new _Response(ctx.req.status, ctx.req.statusText, 
                          ctx.req.getResponseHeader('Content-Type'), 
                          ctx.req.responseText, ctx.req.responseXML));
          _fireSysEvent(tau.rt.Event.REQ_RECEIVED, ctx);
        }
      } catch (ex) {
        // Notify error to client (request abort done in responseProxy)
        ctx.responseProxy(new _Response(400, ex.name + '(' + ex.code + '): ' 
            + ex.message));
      }

      return ctx.id;
    },

    /**
     * Aborts a request previously sent using its id.
     * @param {String} id Request id
     */
    abort: function (id) {
      var ctx = this._registry[id];
      if (ctx) {
        tau.log.debug('aborted (' + ctx.id + ')', this);
        ctx.req.onreadystatechange = null; // Avoid timeout race condition
        ctx.req.abort();
        ctx.release();
        _fireSysEvent(tau.rt.Event.REQ_ABORTED, ctx);
      }
    },

    /** No need to Garbage collect XMLHttpRequest; empty function. */
    gc: tau.emptyFn
  });


  /** @lends tau.data.XSSRequest */
  $class('tau.data.XSSRequest').define({
    /**
     * @class
     * Cross Script loading request helper.
     * <p/>
     * System Events Fired:
     * <pre>
     *  Request sent: "requestsent" (tau.rt.Event.REQ_SENT)
     *  Request received: "requestreceived" (tau.rt.Event.REQ_RECEIVED)
     *  Request aborted: "requestaborted" (tau.rt.Event.REQ_ABORTED)
     * </pre>
     * @constructs
     */
    XSSRequest: function (opts) {
      /** @private Default options */
      this._opts = _createRequestOpts(opts);
      // JSONP namespace Must be globally accessible
      this._opts.jsonpNamespace = this._opts.jsonpNamespace || this.$classname;
      /** @private Maps request id to request per JSONP namespace */
      this._registry = $class.forName(this._opts.jsonpNamespace);
    },

    /**
     * Sends a request using dynamic script loading.
     * @param {String} url URL to send the 
     * @param {Function} callbackFn Request success/fail callback function
     * @param {Object} opts Request options
     * @returns {String} Request id
     */
    send: function (url, callbackFn, opts) {
      var that = this,
          ctx = tau.mixin({
        id: tau.genId('xss'),
        req: new tau.ScriptHelper(),
        timestamp: new Date().getTime(),
        url: tau.isString(url) ? url : undefined,
        callbackFn: tau.isFunction(callbackFn) ? callbackFn : undefined,

        // Mimics xhr.readyState:
        // 0 Uninitialized, 1 Loading, 2 Loaded, 3 Interactive, 4 Complete
        readyState: 0,

        /** Mimics xhr.send(). 
         * @inner */
        send: function () {
          if (ctx.readyState === 0) {
            ctx.readyState = 1; // open() was called successfully

            // Internal request ready, send request via script loading
            ctx.req.ctx.setAttribute('id', ctx.id);
            ctx.req.load(ctx.url, ctx.release);  // called after responseProxy

            ctx.readyState = 2; // The request was successfully sent
            return ctx.id;
          }
          return null;
        },

        /**
         * Uused to process successful responses or errors, and to call 
         * client's <code>callbackFn</code> function.
         * <p/>
         * Mimics the behavior of the <code>XMLHttpRequest</code>'s
         * <code>onreadystatechange</code> function in handling requests. 
         * Accordingly, the XHR states are imitated by the 
         * <code>readyState</code> variable. 
         * <p/>
         * If the <code>_Response</code> instance is the <code>value</code> of 
         * the parameter, an error has occurred to the request. Otherwise, 
         * the <code>value</code> is the actual request sent from the server.
         * <p/>
         * Note: client-aborted requests must not be handled here because 
         * aborted request must not call the <code>callbackFn</code>.
         * @inner
         * @param value {Object} Payload from the server or Error Response
         */
        responseProxy: function (value) {
          var resp = null;
          if (ctx.readyState === 2) {
            ctx.readyState = 3; // Currently receiving data

            if (value instanceof _Response) {
              // Error initiated by the client: cannot abort script load
              resp = value;
            } else {
              // Successfully received response via Proxy (status: 200 - 299)
              if (tau.isString(value)) {
                resp = new _Response(200, 'OK', 'html/text', value, '');
              } else {
                resp = new _Response(200, 'OK', 'application/json', value, '');
              }
            }
            ctx.readyState = 4;
            tau.log.debug('status: ' + resp.statusText + ' (' + ctx.id + ')', that);

            if (tau.isFunction(ctx.callbackFn)) {
              ctx.callbackFn(resp); // Client callback with native response              
            }

            // Must not release req here because script loading cannot be 
            // canceled; the server will eventually execute this callback.
            // Just stop any withstanding timeouts.
            if (ctx.timeoutId) {
              clearTimeout(ctx.timeoutId);
            }
            _fireSysEvent(tau.rt.Event.REQ_RECEIVED, ctx);
          }
        },

        /** Releases all of req's resources.
         * @inner */
        release: function () {
          delete that._registry[ctx.id];
          ctx.req.unload();
          ctx.readyState = 0;
        },

        /**
         * Checks if the request context has timed out.
         * @inner
         * @param {Number} buff Extra buffer in Milliseconds before the timeout 
         */
        isTimedOut: function (buff) {
          return ctx.readyState >= 2 && (new Date().getTime() - ctx.timestamp
              - (buff || 0)) >= ctx.timeout;
        }
      }, tau.mixin(tau.mixin({}, opts), this._opts));

      // XSS is always async: register request ctx and setup timeout
      that._registry[ctx.id] = ctx;
      ctx.timeoutId = _createTimeout(ctx);

      // JSONP requests need callback parameters
      if ('JSONP' === ctx.type.toUpperCase()) {
        ctx.url = tau.url(ctx.url).appendParam(
                    ctx.jsonpCallback || 'callback', 
                    ctx.jsonpNamespace + '.' + ctx.id + '.responseProxy').ctx;
      }
      _fireSysEvent(tau.rt.Event.REQ_SENT, ctx);

      return ctx.send();
    },

    /**
     * Aborts a request previously sent by its id.
     * @param {String} id Request id
     * @ignore 
     */
    abort: function (id) {
      var ctx = this._registry[id];
      if (ctx && ctx.readyState === 2) {
        tau.log.debug('aborted (' + ctx.id + ')', this);
        ctx.readyState = 4;
        if (ctx.timeoutId) {
          clearTimeout(ctx.timeoutId);
        }
        _fireSysEvent(tau.rt.Event.REQ_ABORTED, ctx);
      }
    },

    /**
     * Garbage-collect any unprocessed or withstanding requests.
     * @param buff {Number} Additional timeout buffer
     */
    gc: function (buff) {
      tau.forEach(this._registry, function (i, ctx) {
        if (ctx && tau.isFunction(ctx.isTimedOut) && ctx.isTimedOut(buff)) {
          ctx.release();
        }
      });
    }
  });
})(window);