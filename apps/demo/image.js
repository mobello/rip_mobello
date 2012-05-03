/**
 * ImageView
 */
$class('tau.demo.ImageView').extend(tau.ui.SceneController).define( {
  
  loadScene: function() {
    var image = new tau.ui.ImageView({src: '/img/1.jpg'}); 
    image.setStyles({margin: '10px', width: '100px', height: '100px'});
    image.onEvent(tau.rt.Event.TAP, this.handleTouch, this);
    this.getScene().add(image); 
  },
  
  /**
   * event listener invoked when image component is touched
   * @param e
   * @param payload
   */
  handleTouch: function (e, payload) {
    tau.alert('Image component is touched!');
  }
});
