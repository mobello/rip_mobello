/**
 * Label
 */
$class('tau.demo.Label').extend(tau.ui.SceneController).define({
  $static: {
    MSG: 'The Label class implements a read-only text view.'
       + 'You can use this class to draw one or multiple lines of static text,'
  },
  
  /**
   * loads default scene
   */
  loadScene: function () {
    var scene = this.getScene(),
        label1 = new tau.ui.Label({id: 'label1'}),
        label2 = new tau.ui.Label(),
        text1 = new tau.ui.TextField({id: 'text1'}),
        button = new tau.ui.Button();
    label1.setStyles({margin: '5px', width:'100px', height:'150px'});
    label1.setNumberOfLines(3);
    label1.setText(tau.demo.Label.MSG);
 
    label2.setStyles({marginLeft: '5px', color: 'blue', bottom: '100px'});
    label2.setText('Enter the number of line:');
 
    text1.setType(tau.ui.TextField.TEXT); // 타입을 설정한다.
    text1.setStyles({marginLeft: '5px', width: '100px', bottom: '50px'});
    text1.setMaxLength(2);
    
    button.setLabel('Change');
    button.setStyles({left: '110px', bottom: '50px'});
    button.onEvent(tau.rt.Event.TAP, this.handleTap, this);
    
    scene.add(label1); 
    scene.add(label2);
    scene.add(text1);  
    scene.add(button);
  },
  
  /**
   * Event listener for button tap event
   */
  handleTap: function () {
    var label,
        scene = this.getScene(),
        field = scene.getComponent('text1'),
        value = window.parseInt(field.getText());
    if (tau.isNumber(value)) {
      label = scene.getComponent('label1');
      label.setNumberOfLines(value);
    }
  }
});
