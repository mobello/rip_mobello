/**
 * Badge application class
 */
$class('tau.demo.Badge').extend(tau.ui.SceneController).define( {

  /**
   * loads default scene
   */
  loadScene: function () {
    var btn1, btn2, btn3, btn4,
        scene = this.getScene(),
        msg = new tau.ui.Label(
            {id: 'label1', styles: {width: '100%', margin: '5px'}}),
        
        textField = new tau.ui.TextField({
          id: 'txt1',
          type: tau.ui.TextField.TEXT,
          styles: {width: '50%', margin: '5px'},
          maxLength: 20,
          text: 'text'
        });
    
    scene.add(msg);
    scene.add(textField);
    
    btn1 = new tau.ui.Button({label: 'Text', styles: {width: '100%'}});
    btn1.onEvent(tau.rt.Event.TAP, this.handleMathBtnTap, this);
    scene.add(btn1);
    
    btn2 = new tau.ui.Button({label: 'Add', styles: {width: '100%'}});
    btn2.onEvent(tau.rt.Event.TAP, this.handleMathBtnTap, this);
    scene.add(btn2);
    
    btn3 = new tau.ui.Button({label: 'Subtract', styles: {width: '100%'}});
    btn3.onEvent(tau.rt.Event.TAP, this.handleMathBtnTap, this);
    scene.add(btn3);
    
    btn4 = new tau.ui.Button({label: 'Clear', styles: {width: '100%'}});
    btn4.onEvent(tau.rt.Event.TAP, this.handleMathBtnTap, this);
    scene.add(btn4);
  },
  
  /**
   * callback method invoked after the scene loading is finished
   */
  sceneLoaded: function () {
    var badge = tau.getCurrentContext().getBadge(),
        label = this.getScene().getComponent('label1');
    label.setText(badge ? 'Badge value: ' + badge : 'Badge is not set.');
  },

  /**
   * event handler invoked when each button is touched
   * @param e
   * @param payload
   */
  handleMathBtnTap: function (e, payload) {
    var text,
        src = e.getSource(),
        label = src.getLabel(), // button component
        appCtx = tau.getCurrentContext(),
        badge = appCtx.getBadge(),
        msg = this.getScene().getComponent('label1');
    if (!tau.isNumber(badge) && (label === 'Add' || label === 'Subtract')) {
      badge = 0;
    }
    switch (label) {
      case 'Text':
        var txt = this.getScene().getComponent('txt1');
        badge = txt.getText();
        break;
      case 'Add':
        badge++;
        break;
      case 'Subtract':
        badge--;
        break;
      case 'Clear':
        appCtx.removeBadge();
        badge = null;
        break;
    }
    if (badge !== null) {
      tau.getCurrentContext().setBadge(badge);
      text = 'Badge value: ' + badge;
    } else {
      text = 'Badge is not set.';
    }
    msg.setText(text);
  }
});

/**
 * Redraw 
 */
$class('tau.demo.Redraw').extend(tau.ui.SceneController).define( {
  /**
   * load default scene
   */
  loadScene: function() {
    var scene = this.getScene(),
        button1 = new tau.ui.Button({label: 'add'}),
        button2 = new tau.ui.Button({label: 'remove'}),
        button3 = new tau.ui.Button({label: 'update'}),
        label = new tau.ui.Label({id: 'label1'}),
        panel = new tau.ui.ScrollPanel({id: 'panel1'});
    
    this.rightBtn = new tau.ui.Button({id: 'rightBtn', label: 'Clear'}),
    this.rightBtn.onEvent(tau.rt.Event.TAP, this.handleClear, this);
    
    button1.setStyles({marginTop: '5px', left: '1%', width: '30%'});
    button2.setStyles({marginTop: '5px', left: '34.5%', width: '30%'});
    button3.setStyles({marginTop: '5px', right: '1%', width: '30%'});
    
    panel.setStyles({'marginTop': '100px', height: '300px', background: 'maroon'});
    label.setStyles({top: '5px', right: '0px', color: 'white'});
    panel.add(label);
    
    button1.onEvent(tau.rt.Event.TAP, this.handleAdd, this);
    button2.onEvent(tau.rt.Event.TAP, this.handleRemove, this);
    button3.onEvent(tau.rt.Event.TAP, this.handleUpdate, this);

    scene.add(button1);
    scene.add(button2);
    scene.add(button3);
    scene.add(panel);
  },
  
  /**
   * event handler when add button is touched
   * @param e
   * @param payload
   */
  handleAdd: function (e, payload) {
    var scene = this.getScene(),
        panel = scene.getComponent('panel1'),
        label = scene.getComponent('label1'),
        count = panel.getComponents().length - 1,
        item = new tau.ui.Button();
    item.setLabel(count + ' item');
    item.setStyles({top: (count * 100) +'px'});
    panel.add(item);
    label.setText(count + 'th item is added');
  },
  
  /**
   * event handler when remove button is touched
   * @param e
   * @param payload
   */
  handleRemove: function (e, payload) {
    var scene = this.getScene(),
        panel = scene.getComponent('panel1'),
        label = scene.getComponent('label1');
    var count = panel.getComponents().length - 1;
    if (count > 0){
      panel.remove(count);
      label.setText((count-1) + 'th item is removed');
    }
  },
  
  /**
   * event handler when update button is touched
   * @param e
   * @param payload
   */
  handleUpdate: function (e, payload) {
    var nav,
        scene = this.getScene(),
        parent = this.getParent();
    scene.update();
    if (parent instanceof tau.ui.SequenceNavigator) {
      this.rightBtn.setVisible(true);
      nav = parent.getActiveNavigationBar();
      nav.setRightItem(this.rightBtn);
      nav.setVisible(true);
    }
  },
  
  /**
   * event handler when clear button is touched
   * @param e
   * @param payload
   */
  handleClear: function (e, payload) {
    var scene = this.getScene(),
        panel = scene.getComponent('panel1'),
        label = scene.getComponent('label1');
    
    for(var i = 1, len = panel.getComponents().length; i < len; i++){
      // do not delete label component
      panel.remove(1);
    }
    scene.update();
    label.setText('All components are cleared');
    this.rightBtn.setVisible(false);
  }
});