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
    var modalCtrl = new tau.demo.ModalSceneNavigator();
    modalCtrl.onEvent('dismiss', this.handleDismiss, this);
    var layout = tau.rt.isIPhone ? 'FULL' : 'FORM';
    this.presentModal(modalCtrl, {'layout': layout, 'animate': 'vertical'});
    
  },
  
  /**
   * event listener invoked when dismiss event of modal controller is fired
   * @param e
   * @param payload
   */
  handleDismiss: function (e, payload) {
    this.dismissModal(true);
  }
});

/**
 * ModalSceneNavigator demo class
 */
$class('tau.demo.ModalSceneNavigator').extend(tau.ui.SequenceNavigator).define({
  
  /**
   * 
   */
  ModalSceneNavigator: function (layout) {
    this.setRootController(new tau.demo.ModalSceneController({
      'title': 'Modal', 'layout': layout}));
  }
});

/**
 * ModalSceneController demo class
 */
$class('tau.demo.ModalSceneController').extend(tau.ui.SceneController).define({
  
  /**
   * 
   * @param layout
   */
  setLayout: function (layout) {
    this.layout = layout;
  },
  
  /**
   * 
   */
  loadScene: function () {
    var btn = new tau.ui.Button({
      'label': 'Hide modal', 
      'styles': {top: '100px', left: '50px'}
    });
    btn.onEvent(tau.rt.Event.TAP, this.fireDismiss, this);
    var btn1 = new tau.ui.Button({
      'label': 'New modal', 
      'styles': {top: '150px', left: '50px'}
    });
    btn1.onEvent(tau.rt.Event.TAP, this.newModal, this);
    var scene = this.getScene();
    scene.add(btn);
    scene.add(btn1);
  },
  
  /**
   * 
   */
  newModal: function () {
    if (!this.layout) {
      this.layout = tau.rt.isIPhone ? 'FULL' : 'PAGE';
    } 
    var modalCtrl = new tau.demo.ModalSceneNavigator('FULL');
    modalCtrl.onEvent('dismiss', this.handleDismiss, this);
    this.presentModal(modalCtrl, {layout: this.layout, animate: 'vertical'});
  },
  
  /**
   * 
   */
  handleDismiss: function (e, payload) {
    this.dismissModal(true);
  },
  
  /**
   * 
   */
  fireDismiss: function (e, payload) {
    this.fireEvent('dismiss');
  }
});