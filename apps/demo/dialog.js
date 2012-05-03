/**
 * SystemDialog application class
 */
$class('tau.demo.SystemDialog').extend(tau.ui.SceneController).define({
  $static: { // text message for displaying in the text area
    MSG: 'The TextArea class implements the behavior for a scrollable, '
      + 'multiline text region. The class supports the display of text using '
      + 'a custom font, color, and alignment and also supports text editing. '
      + 'You typically use a text area to display multiple lines of text, such '
      + 'as when displaying the body of a large text document. This class does'
      + 'not support multiple styles for text. The font, color, and text '
      + 'alignment attributes you specify always apply to the entire contents '
      + 'of the text view. To display more complex styling in your application,'
      + 'you need to use a iframe and render your content using HTML.'
      + 'Managing the Keyboard when the user taps in an editable text view, '
      + 'that text view becomes the first responder and automatically asks the '
      + 'system to display the associated keyboard.'
  },

  /**
   * creates default scene
   */
  loadScene: function () {
    var scene = this.getScene(),
        labels = [];
    
    for (var i = 0; i < 3; i++) {
      labels.push(new tau.ui.Label({
        id: 'label' + i, 
        styles: {width: '30%', marginTop: '5px'}
      }));
    }
    var btn1 = new tau.ui.Button({
      label: 'alert',
      styles: {width: '50%', margin: '5px'}
    });    
    btn1.onEvent(tau.rt.Event.TAP, this.handleAlert, this);
    scene.add(btn1);
    scene.add(labels[0]);
    
    var btn2 = new tau.ui.Button({
      label: 'confirm', 
      styles: {width: '50%', margin: '5px'}
    });
    btn2.onEvent(tau.rt.Event.TAP, this.handleConfirm, this);
    scene.add(btn2);
    scene.add(labels[1]);
    
    var btn3 = new tau.ui.Button({
      label: 'prompt', 
      styles: {width: '50%', margin: '5px'}
    });
    btn3.onEvent(tau.rt.Event.TAP, this.handlePrompt, this);
    scene.add(btn3);
    scene.add(labels[2]);
  },
  
  /**
   * event handler called back when the alert button is touched
   * @param e
   * @param payload
   */
  handleAlert: function (e, payload) {
    var label = this.getScene().getComponent('label0');
    tau.alert(tau.demo.SystemDialog.MSG, {
      title: 'alert', 
      callbackFn: function (returnVal) {
        label.setText(returnVal);
      }
    });
  },
  
  /**
   * event handler called back when the confirm button is touched
   * @param e
   * @param payload
   */
  handleConfirm: function (e, payload) {
    var label = this.getScene().getComponent('label1');
    tau.confirm(tau.demo.SystemDialog.MSG, {
      title: 'confirm', 
      callbackFn: function(returnVal){
        label.setText(returnVal);
      }
    });
  },
  
  /**
   * event handler called back when the prompt button is touched
   * @param e
   * @param payload
   */
  handlePrompt: function (e, payload) {
    var label = this.getScene().getComponent('label2');
    tau.prompt('Please enter your name', {
      title: 'prompt', 
      placeholderLabel: 'name...',
      callbackFn: function(returnVal){
        label.setText(returnVal);
      }
    });
  }
});

/**
 * ActionSheet application class
 */
$class('tau.demo.ActionSheet').extend(tau.ui.SceneController).define( {

  /**
   * loads default scene
   */
  loadScene: function() {
    var actionsheet, label, button0, button1, button2,
        scene = this.getScene();
    
    this.i = 0;
    
    label = new tau.ui.Label(
          {id: 'label1', text: 'Selected index is ', styles: {margin: '10px'}});
    
    button0 = new tau.ui.Button({label: 'Button2',styleClass: {type: 'red'} });
    button0.onEvent(tau.rt.Event.TAP, this.handleButtonTap, this);
    actionsheet = new tau.ui.ActionSheet({
      id: 'sheet1',
      showCloseBtn: true,
      popupTitle: 'TEST',
      components: [
        {label: 'Button1'},
        button0,
        new tau.ui.Button({label: 'Button3',  styleClass: {type: 'red'}})
      ]
    });
    
    actionsheet.onEvent(tau.rt.Event.SELECTCHANGE, this.handleSelectChange, this);
    button1 = new tau.ui.Button({
      label: 'ShowBottom',
      styles: {bottom: 0, right: '0'}
    });
    button1.onEvent(tau.rt.Event.TAP, this.handleShowBottomBtnTap, this);
    
    button2 = new tau.ui.Button({
      label: 'ShowFloat', 
      styles: {margin: '10px', width: '40%'}
    });
    button2.onEvent(tau.rt.Event.TAP, this.handleShowFloatBtnTap, this);
    
    scene.add(button2);
    scene.add(label);
    scene.add(actionsheet);
    scene.add(button1);
  },
  
  /**
   * Event handler invoked when button0 is touched
   * @param e
   * @param payload
   */
  handleButtonTap: function (e, payload) {
    var src = e.getSource();
    tau.alert(src.getLabel() + ' is tapped!');
  },
  
  /**
   * event handler invoked when buttons on actionsheet is touched
   * @param e
   * @param payload
   */
  handleSelectChange: function (e, payload) {
    var label = this.getScene().getComponent('label1');
    label.setText('Selected index is ' + payload);
  },
  
  /**
   * event handler invoked when ShowFloat button is touched
   * @param e
   * @param payload
   */
  handleShowFloatBtnTap: function (e, payload) {
    var sheet = this.getScene().getComponent('sheet1');
    var label = this.getScene().getComponent('label1');
    sheet.open({comp: label, dir: this.i++ % 4});
  },
  
  /**
   * event handler invoked when ShowBottom button is touched
   * @param e
   * @param payload
   */
  handleShowBottomBtnTap: function (e, payload) {
    var sheet = this.getScene().getComponent('sheet1');
    sheet.open({dir: this.i++ % 4});
  }
});

/**
 * Dialog application class
 */
$class('tau.demo.Dialog').extend(tau.ui.SceneController).define({

  /**
   * load initial scene
   */
  loadScene: function() {
    var dialog, label, button1, button2,
        comps = [],
        scene = this.getScene(); 
    
    this.i = 0;

    label = new tau.ui.Label(
        {id: 'label1', text: 'Position here!', styles: {margin: '5px'}});
      
    for (var i = 0; i < 50; i++) {
      comps.push(new tau.ui.Button(
            {label: 'btn' + i,  styleClass: {type:'red'}}));
    }
    dialog = new tau.ui.Dialog({
      id: 'dialog1',
      popupTitle: 'Buttons',
      /*showCloseBtn: true,*/
      modal: true,
      components: comps
    });
    dialog.onEvent(tau.rt.Event.TAP,  this.handleDialogTap, this);
    
    button1 = new tau.ui.Button({
      label: 'Full', 
      styles: {bottom: '0', right: '0'}
    });
    button1.onEvent(tau.rt.Event.TAP,  this.handleFullBtnTap, this);
    
    button2 = new tau.ui.Button({
      label: 'Show', 
      styles: {margin: '5px', width: '40%'}
    });
    button2.onEvent(tau.rt.Event.TAP,  this.handleShowBtnTap, this);
    
    scene.add(button2);
    scene.add(label);
    scene.add(dialog);
    scene.add(button1);
  },
  
  /**
   * event handler invoked when one of buttons on dialog is touched
   * @param e
   * @param payload
   */
  handleDialogTap: function (e, payload) {
    var src = e.getSource();
    if (src instanceof tau.ui.Button) {
      tau.alert(src.getLabel() + ' is tapped!');
    }
  },
  
  /**
   * event handler invoked when Full button is touched
   * @param e
   * @param payload
   */
  handleFullBtnTap: function (e, payload) {
    var dialog = this.getScene().getComponent('dialog1');
    dialog.open({dir: this.i++ % 4});
  },
  
  /**
   * event handler invoked when Show button is touched
   * @param e
   * @param payload
   */
  handleShowBtnTap: function (e, payload) {
    var dialog = this.getScene().getComponent('dialog1');
    var label =  this.getScene().getComponent('label1');
    // shows the dialog around the specified label component
    dialog.open({comp: label, dir: this.i++ % 4});
  }
});