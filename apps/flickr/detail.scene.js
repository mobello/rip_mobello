function initScene() {
  var scene = this.getScene();
  var c383327426 = new tau.ui.LinkUrl(); //{id: 'flickrlink'} // ensure unique id for entire famework!!!
  c383327426.setUrl(this._item.link);
  c383327426.setTitle(this._item.author);
  c383327426.setSubTitle(this._item.published);
  scene.add(c383327426);
  var c1016573787 = new tau.ui.TextView(); //{id: 'flickrtext'}
  c1016573787.setText(this._item.description);
  scene.add(c1016573787);
}