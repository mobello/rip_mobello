$require('http://map.ktgis.com/MapAPI/serviceJSP/Auth.jsp?key=OllehMap1049_rmv3fUFkrC&module=Map,Geocoder');

/**
 * 올레맵을 예제
 * @see <a href="http://map.ktgis.com/MapAPI/apidoc/index.html">olleh map api</a>
 */
$class('tau.sample.Map').extend(tau.ui.SceneController).define(
{
  init: function () {
    var context = tau.getCurrentContext(),
      config = context.getConfig();
    this._timeout = config.timeout || 3000;
    this._timeStamp = new Date().getTime();
  },
  
  sceneDrawn: function () {
    this.loadMap();
  },
  
  loadMap: function () {
    
    // olleh map API library가 로딩이 완료되지 않은 경우 일정시간 기다린다.
    var delay =  new Date().getTime() - this._timeStamp;
    
    if (!window.olleh || !window.olleh.maps) {
      if (delay < this._timeout) {
        window.setTimeout(tau.ctxAware(this.loadMap, this), 250);
      } else {
        tua.alert('Olleh Map API is required');
      }
      return;
    }
    
    
    var panel = this.getScene().getComponent('map'),
      config = tau.getCurrentContext().getConfig();
    
    var _handler = tau.ctxAware(this._handleMapEvent, this);
    
    var latlng = new olleh.maps.Coord(config.latitude, config.longitude),
        event = olleh.maps.event, 
        map;
    
    // Panel컴포넌트 하위로 olleh map을 생성한다.
    map = panel.ollehMap = new olleh.maps.Map(panel.getDOM(), tau.mixin({
          center: latlng,
          mapTypeId: olleh.maps.MapTypeId.ROADMAP
        }, config.mapOptions));

    var marker = new olleh.maps.Marker({
      position: latlng,
      map: map,
      title: config.markerTitle
    });

    
    // 이벤트를 Mobello event subsystem에서 처리하도록 한다.
    event.clearInstanceListeners(map);
    
    event.addListener(map, 'center_changed', _handler);
    event.addListener(map, 'zoom_changed', _handler);
    event.addListener(map, 'maptypeid_changed', _handler);
    event.addListener(map, 'bounds_changed', _handler);

    // olleh map에서 발생한 이벤트에 대해 처리한다.
    panel.onEvent('center_changed', this.handleCenterChanged, this);
    panel.onEvent('zoom_changed', this.handleZoomChanged, this);
  },
  
  handleCenterChanged: function (e, payload) {
    tau.log('centerChanged');
  },
  
  handleZoomChanged: function (e, payload) {
    tau.log('zoomChanged');
    var scene = this.getScene();
    var panel = scene.getComponent('map');
    var ktposition = new olleh.maps.Coord(965913.7, 1928949.52);     
    panel.ollehMap.setCenter(ktposition); 
  },

  /**
   * olleh.maps.event에서 이벤트가 발생했을 때 처리하는 콜백함수
   * @param {Object} event olleh map에서 native Event 객체를 wrapping한 Event 객체
   */
  _handleMapEvent: function (event) {
    if (event) {
      var eventMgr = tau.getRuntime().$eventMgr;
      event.target = event.element;
      eventMgr.handleEvent(event);
    }
  }
  
  /*
  _handleMapEvent: function (event) {
    if (event) {
      this.fireEvent(event.type, event);
    }
  }*/
});