$require('http://map.ktgis.com/MapAPI/serviceJSP/Auth.jsp?key=OllehMap1049_rmv3fUFkrC&module=Map,Geocoder');

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

    var latlng = new olleh.maps.Coord(config.latitude, config.longitude),
        map = new olleh.maps.Map(panel.getDOM(), tau.mixin({
          center: latlng,
          mapTypeId: olleh.maps.MapTypeId.ROADMAP
        }, config.mapOptions));

    new olleh.maps.Marker({
        position: latlng,
        map: map,
        title: config.markerTitle
    });
  }
});