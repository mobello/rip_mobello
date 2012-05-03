/**
 * ToolBar
 */
$class('tau.demo.ToolBar').extend(tau.ui.SceneController).define( {
  loadScene: function () {
    var scene = this.getScene();
    scene.add(new tau.ui.Button());
    var toolbar1 = new tau.ui.ToolBar({
      components: [
        new tau.ui.Button({label: 'btn1'}),
        new tau.ui.Button({label: 'btn2'}),
        new tau.ui.Space({
          type: tau.ui.Space.SEPARATOR,
          styles: {width: '20px'}
        }),
        new tau.ui.Button({label: 'btn3'}),
        new tau.ui.Space({type: 'fixed'}),
        new tau.ui.Button({label: 'btn4'}),
        new tau.ui.Button({label: 'btn5'})
      ]
    });

    var toolbar2 = new tau.ui.ToolBar();
    toolbar2.onEvent(tau.rt.Event.TAP, this.handleTap, this);
    for(var i = 10; i < 20; i++) {
      toolbar2.add(new tau.ui.Button({label: 'btn' + i}));
    }
    
    var toolbar3 = new tau.ui.ToolBar({
      dock: 'bottom',
      components: [
        new tau.ui.Button({label: 'btn20'}),
        new tau.ui.Button({label: 'btn21'})
      ]
    });

    var toolbar4 = new tau.ui.ToolBar({
      dock: 'bottom',
      components: [
        new tau.ui.Button({label: 'btn30'}),
        new tau.ui.Label({
          text: 'toolbar',
          styles: {width: '100px'}
        }),
        new tau.ui.Button({label: 'btn31'})
      ]
    });

    scene.setComponents([toolbar1, toolbar2, toolbar3, toolbar4]);
  },
  
  /**
   * event listener
   * @param e
   * @param payload
   */
  handleTap: function (e, payload) {
    var src = e.getSource();
    if (src instanceof tau.ui.Button){
      tau.alert('' + src.getLabel() + ' tapped!');
    }
  }
});