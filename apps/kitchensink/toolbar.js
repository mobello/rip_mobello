$class('tau.demo.kitchensink.Toolbar').extend(tau.ui.SceneController).define({
  /**
   * Constructor
   */
  Toolbar: function() {
    this.setTitle('Toolbar');
  },

  /**
   * create default scene
   */
  loadScene: function() {
    var scene = this.getScene();
    var toolBar1 = new tau.ui.ToolBar({dock: 'top'});
    var commonLabel = {normal: 'Button'};
    var button = new tau.ui.Button({
      label: commonLabel,
      styleClass: {type: 'sanmarino'},
      styles: {display: 'block'}
    });
    toolBar1.add(button);
    
    var label = new tau.ui.Label({
      text: 'Toolbar',
      styles: {color: 'white'}
    });
    toolBar1.add(label);
    
    var button = new tau.ui.Button({
      label: commonLabel,
      styleClass: {type: 'blue'},
      styles: {display: 'block'}
    });
    toolBar1.add(button);
    scene.add(toolBar1);

    var toolBar2 = new tau.ui.ToolBar({
      dock: 'top',
      styleClass: {type: 'dark'}
    });
    
    var button2 = new tau.ui.Button({
      label: {normal: 'Button'},
      styleClass: {type: 'dark'},
      styles: {display: 'block'}
    });
    
    var label2 = new tau.ui.Label({
      text: 'Toolbar (dark)',
      styles: {color: 'white'}
    });
    toolBar2.add(button2);
    toolBar2.add(label2);
    
    var button3 = new tau.ui.Button({
      label: {normal: 'Button'},
      styleClass: {type: 'red'},
      styles: {display: 'block'}
    });
    toolBar2.add(button3);
    scene.add(toolBar2);
  }
});