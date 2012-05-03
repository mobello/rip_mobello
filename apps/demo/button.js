/**
 * Button
 */
$class('tau.demo.Button').extend(tau.ui.SceneController).define( {
  
  /**
   * create scene using button and radio components
   */
  loadScene: function() {
    this.buttons = [];
    this.labels = ['Disable', 'Highlight', 'Select', 'Default', 'Default'];
    var i, scene = this.getScene();
        
    this.buttons.push(new tau.ui.Button());
    this.buttons.push(new tau.ui.Button({styleClass: {type: 'dark'}})); 
    this.buttons.push(new tau.ui.Button({styleClass: {type: 'red'}}));  
    this.buttons.push(new tau.ui.Button({styleClass: {type: 'khaki'}}));
    this.buttons.push(new tau.ui.Button({styleClass: {type: 'green'}}));
    
    for (i = 0, len = this.buttons.length; i < len; i++) {
      this.buttons[i].setLabel(this.labels[i]);
      this.buttons[i].setStyle('position', 'relative');
      this.buttons[i].setStyle('top', '50px');
      this.buttons[i].setStyle('width', '100%');
    }
    
    this.button = new tau.ui.Button();
    this.button.setStyles({height: '100px', width: '100px'});
    this.button.setLabel( {  // 상태별 라벨을 설정한다.
      normal: 'default',
      disabled: null,
      selected: 'selected',
      highlighted: 'highlighted'
    });
    this.button.setTextColor( { // 상태별 텍스트 색을 설정한다.
      normal: 'black',
      disabled: 'gray',
      selected: 'red',
      highlighted: 'blue'
    });
    this.button.setBackgroundColor( { // 상태별 배경색을 설정한다.
      normal: '#AAAAAA',
      disabled: '#DDDDDD',
      selected: '#EEEEEE',
      highlighted: '#CCCCCC'
    });

    this.button.setBackgroundImage({// 상태별 배경이미지를 설정한다.
      normal: null,
      disabled: '/img/2.jpg',
      selected: '/img/3.jpg',
      highlighted: '/img/4.jpg'
    });
    scene.add(this.button);
    
    var disabled = new tau.ui.Radio();
    disabled.setStyles({top: '25px', right: '100px'});
    
    var selected = new tau.ui.Radio();
    selected.setStyles({top: '55px', right: '100px'});
    
    var reset = new tau.ui.Radio();
    reset.setStyles({top: '85px', right: '100px'});
    
    var group = new tau.ui.RadioGroup();    
    group.setComponents([disabled, selected, reset]);
    group.onEvent(tau.rt.Event.SELECTCHANGE, this.handleRadioEvent, this);
    scene.add(group);

    var disabledLabel = new tau.ui.Label();
    disabledLabel.setStyles({top: '20px', right: '10px'});
    disabledLabel.setText('disableAll');
    scene.add(disabledLabel);
    
    var selectedLabel = new tau.ui.Label();
    selectedLabel.setStyles({top: '50px', right: '10px'});
    selectedLabel.setText('selectAll');
    scene.add(selectedLabel);

    var resetLabel = new tau.ui.Label();
    resetLabel.setStyles({top: '80px', right: '10px'});
    resetLabel.setText('reset');
    scene.add(resetLabel);
    
    for (i = 0, len = this.buttons.length; i < len; i++) {
      scene.add(this.buttons[i]);
      this.buttons[i].onEvent(tau.rt.Event.TAP, this.handleButtonEvent, this);
    }
  },
  
  /**
   * Event handler when user clicks Radio button
   * @param e
   * @param payload
   */
  handleRadioEvent: function (e, payload) {
    var group = e.getSource(),
        buttons = this.buttons,
        disabled = (0 === group.getSelectedIndex()),
        selected = (1 === group.getSelectedIndex());
    for (i = 0, len = buttons.length; i < len; i++) {
      buttons[i].setDisabled(disabled);
      buttons[i].setSelected(selected);
    }
  },
  
  /**
   * Event handler when user clicks button component
   * @param e
   * @param payload
   */
  handleButtonEvent: function (e, payload) {
    var btn = e.getSource();
    if (btn.isDisabled()) return;
    
    var idx = this.buttons.indexOf(btn);
    switch (idx) {
      case 0: // disable
        this.button.setDisabled(!this.button.isDisabled());
        btn.setLabel(this.labels[idx] + ': ' + this.button.isDisabled());
        break;
      case 1: // highlight
        this.button.setHighlighted(!this.button.isHighlighted());
        btn.setLabel(this.labels[idx] + ': ' + this.button.isHighlighted());
        break;
      case 2: // select
        this.button.setSelected(!this.button.isSelected());
        btn.setLabel(this.labels[idx] + ': ' + this.button.isSelected());
        break;
    }
  }
});