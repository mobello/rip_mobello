/**
 * Activityindicator 
 */
$class('tau.demo.ActivityIndicator').extend(tau.ui.SceneController).define({
  /**
   * create scene with ActivityIndicator and Button component
   */
  loadScene: function () {
    this.setTitle('ActivityIndicator');

    var scene = this.getScene(),
      button = new tau.ui.Button({
        label: 'stop', 
        styles: {top: '50%', left: '40%'}
      }),
      activityindicator = new tau.ui.ActivityIndicator({
        id: 'activityindicator',
        autoStart: true,
        message: 'Loading...', 
        styles: {height: '50%'}
      });
    button.onEvent(tau.rt.Event.TAP, this.toggleIndicator, this);
    scene.setStyleClass({type: 'ios'});
    scene.setComponents([button, activityindicator]);
  },
  
  /**
   * If an user touches the button this callback method will be invoked.
   */
  toggleIndicator: function (e, payload) {
    var button = e.getSource(),
      activityindicator = this.getScene().getComponent('activityindicator');

    if (activityindicator.isLoading()){
      button.setLabel('start');
      activityindicator.end();
    } else {
      button.setLabel('stop');
      activityindicator.start(1000);
    }
  }
});