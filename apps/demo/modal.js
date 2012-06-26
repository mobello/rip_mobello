/**
 * ModalController demo class
 */
$class('tau.demo.ModalController').extend(tau.ui.SceneController).define({
  
  /**
   * 
   */
  loadScene: function () {
    var btn = new tau.ui.Button({
        label: 'Show modal!', 
        'styles': {top: '50px', left: '50px'}
    });
    btn.onEvent(tau.rt.Event.TAP, this.handleClick, this);
    this.getScene().add(btn);
  },
  
  /**
   * event listener invoked when button compoment is touched
   * @param e
   * @param payload
   */
  handleClick: function(e, payload) {
    var modalCtrl = new tau.demo.ModalSceneController();
    var layout = tau.rt.isIPhone ? 'FULL' : 'FORM';
    this.presentModal(modalCtrl, {'layout': layout, 'animate': 'vertical'});
    
  }
});


/**
 * ModalSceneController demo class
 */
$class('tau.demo.ModalSceneController').extend(tau.ui.SceneController).define({
  
  /**
   * Constructor
   */
  ModalSceneController: function () {
    this._layout; // memorize current layout
  },
  
  /**
   * 
   */
  loadScene: function () {
    var btn = new tau.ui.Button({
      'label': 'Hide modal', 
      'styles': {top: '100px', left: '50px'}
    });
    btn.onEvent(tau.rt.Event.TAP, this.handleDismiss, this);
    var btn1 = new tau.ui.Button({
      'label': 'New modal', 
      'styles': {top: '150px', left: '50px'}
    });
    btn1.onEvent(tau.rt.Event.TAP, this.newModal, this);
    var scene = this.getScene();
    scene.setStyle('border', '3px solid');
    scene.add(btn);
    scene.add(btn1);
  },
  
  /**
   * 
   */
  newModal: function () {
    var layout = this._layout; 
    if (!layout) {
      layout = tau.rt.isIPhone ? 'FULL' : 'PAGE';
    } 
    var modalCtrl = new tau.demo.ModalSceneController();
    modalCtrl._layout = 'FULL';
    this.presentModal(modalCtrl, {'layout': layout, 'animate': 'vertical'});
  },
  
  /**
   * 
   */
  handleDismiss: function (e, payload) {
    this.dismissModal(true);
  }
});