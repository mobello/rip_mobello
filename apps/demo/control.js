/**
 * Checkbox
 */
$class('tau.demo.Checkbox').extend(tau.ui.SceneController).define({
  loadScene: function () {
    var checkbox = new tau.ui.Checkbox({selected: true});
    checkbox.setStyles({left: '10px', top: '10px'});
    checkbox.onEvent(tau.rt.Event.TAP, this.handleTap, this);
    this.getScene().add(checkbox);  
  },
  
  /**
   * Event handler invoked when user clicks checkbox
   * @param e
   * @param payload
   */
  handleTap: function (e, payload) {
    var checkbox = e.getSource();
    tau.alert('Checkbox is ' + (checkbox.isSelected() ? 'selected' : 'unselected'));
  }
});

/**
 * Radio
 */
$class('tau.demo.Radio').extend(tau.ui.SceneController).define( {
  loadScene: function () {
    var radioGroup = new tau.ui.RadioGroup();
    var radio1 = new tau.ui.Radio({value: 1});
    radio1.setStyles({left: '10px', top: '20px'});
    
    var radio2 = new tau.ui.Radio({value: 2});
    radio2.setStyles({left: '110px', top: '20px'});
    radioGroup.setComponents([radio1, radio2]);
    
    radioGroup.onEvent(tau.rt.Event.SELECTCHANGE, this.handleRadioTouch, this);
    this.getScene().add(radioGroup);
  },
  
  handleRadioTouch: function (e, payload) {
    var  group = e.getSource();
    tau.alert('index:' + group.getSelectedIndex() + ' value:' + group.getValue());
  }
});

/**
 * TextField
 */
$class('tau.demo.TextField').extend(tau.ui.SceneController).define( {
  loadScene: function () {
    var text = new tau.ui.TextField({type: tau.ui.TextField.TEXT});
    text.setPlaceholderLabel('Enter text value!');
    text.setPlaceholderImage('/img/1.jpg');
    text.setClearButtonMode(true);  
    text.setStyles({top: '10px', left: '10px', width: '90%'});
    text.setClearsOnBeginEditing(true); 
    this.getScene().add(text);
  }
});

/**
 * TextArea
 */
$class('tau.demo.TextArea').extend(tau.ui.SceneController).define( {
  loadScene: function () {
    var textarea = new tau.ui.TextArea(); 
    textarea.setStyles({left: '10px', top: '10px', width: '90%', height: '50%'});
    textarea.setPlaceholderLabel('Enter long text value');
    this.getScene().add(textarea);
  }
});

/**
 * Slider
 */
$class('tau.demo.Slider').extend(tau.ui.SceneController).define( {
  loadScene: function () {
    var slider1, slider2, slider3, label1, label2, label3,
        scene = this.getScene();
    slider1 = new tau.ui.Slider({
      id: 's1',
      tickSize: 0.1,
      enabledBarTouch: true,
      enabledThreshold: 50,
      styles: {marginTop: '5px', width: '80%'}
    });
    
    slider2 = new tau.ui.Slider({
      id: 's2',
      vertical: false, 
      minValue: 0, 
      maxValue: 200, 
      value: 50, 
      tickSize: 50,
      enabledBarTouch: true,
      styles: {marginTop: '5px', width: '80%'}
    });
    
    slider3 = new tau.ui.Slider({
      id: 's3',
      vertical: true, 
      minValue: 0, 
      maxValue: 5, 
      value: 1, 
      tickSize: 1,
      styles: {marginLeft: '10px', width: '80%'}
    });
    
    label1 = new tau.ui.Label(
        {id: 'l1', text: slider1.getValue(), styles: {width: '15%'}});
    label2 = new tau.ui.Label(
        {id: 'l2', text: slider2.getValue(), styles: {width: '15%'}});
    label3 = new tau.ui.Label(
        {id: 'l3', text: slider3.getValue(), styles: {width: '15%'}});
    
    scene.onEvent(tau.rt.Event.VALUECHANGE, this.handleValueChange, this);
    scene.add(slider1);
    scene.add(label1);
    scene.add(slider2);
    scene.add(label2);
    scene.add(slider3);
    scene.add(label3);
  },
  
  /**
   * Event listener
   * @param e
   * @param payload
   */
  handleValueChange: function (e, payload) {
    var source = e.getSource();
    var label = this.getScene().getComponent('l' + source.getId().charAt(1));
    label.setText(window.parseInt(source.getValue()));
  }
});

/**
 * Switch
 */
$class('tau.demo.Switch').extend(tau.ui.SceneController).define({
  loadScene: function () {
    var defaultSwitch, verticalSwitch, label,
        scene = this.getScene();
    
    defaultSwitch = new tau.ui.Switch({
      id: 'ds',
      styles: {margin: '5px', width: '50%'},
      onText: 'on', 
      offText: 'off'
    });
    
    verticalSwitch = new tau.ui.Switch({
      id: 'vs',
      styles: {margin: '5px', width: '50%'},
      vertical: true, 
      enabledThreshold: true,
      enabledBarTouch: true
    });
    
    label = new tau.ui.Label({
      id: 'slabel',
      left: '20px',
      text: defaultSwitch.getValue() + ',' + verticalSwitch.getValue()
    });
    
    scene.onEvent(tau.rt.Event.VALUECHANGE, this.handleValueChange, this);
    scene.add(defaultSwitch);
    scene.add(verticalSwitch);
    scene.add(label);
  },
  
  /**
   * Event listener
   * @param e
   * @param payload
   */
  handleValueChange: function (e, payload) {
    var scene = this.getScene();
    var ds = scene.getComponent('ds');
    var vs = scene.getComponent('vs');
    var label = scene.getComponent('slabel');
    label.setText(ds.getValue() + ',' + vs.getValue());
  }
});

/**
 * Select
 */
$class('tau.demo.Select').extend(tau.ui.SceneController).define( {
  
  /**
   * creates new scene
   */
  loadScene: function () {
    var scene = this.getScene(),
        options = [],
        button = new tau.ui.Button({
            label: 'refresh', styles: {marginTop: '5px', width: '100%'}});
    button.onEvent(tau.rt.Event.TAP, this.handleTap, this);
    
    for (var i = 1; i <= 15; i++) {
      options.push({label: 'option' + i, value: i});
    }
    
    var select1 = new tau.ui.Select({
      id: 's1',
      components: options.slice(0, 15),
      placeHolder: 'select',
      fullscreen: true,
      modal: true,
      styles: {marginTop: '5px'},
      maxSelectableCnt: 2,
    }); 
    
    var select2 = new tau.ui.Select({
      id: 's2',
      components: options.slice(0, 5),
      maxSelectableCnt: 2,
      selectedIndexes: [1, 2],
      styles: {marginTop: '5px'},
      togglable: false
    }); 
    
    var select3 = new tau.ui.Select({
      id: 's3',
      components: [
        {label: '1234567890', value: 1},
        {label: 'abcdefghijklmnopqrstuvwxyz', value: 2},
        {label: 'ㄱㄴㄷ', value: 3}
      ],
      /*toggle: true,*/
      selectedIndexes: [1],
      styles: {top: '50%'}
    });
    select3.onEvent(tau.rt.Event.VALUECHANGE, this.handleValueChange, this);
    
    scene.add(button);  
    scene.add(select1);  
    scene.add(select2);  
    scene.add(select3);  
  },
  
  /**
   * Event handler for tap event on Button Component
   * @param e
   * @param payload
   */
  handleTap: function (e, payload) {
    var scene = this.getScene();
    scene.getComponent('s1').refresh();
    scene.getComponent('s2').refresh();
    scene.getComponent('s3').refresh();
  },
  
  /**
   * Event handler for ValueChangeEvent on Select Component
   * @param e
   * @param payload
   */
  handleValueChange: function (e, payload) {
    tau.alert('Selected index is '+ e.getSource().getSelectedIndexes()[0]);
  }
});

/**
 * SegmentedButton
 */
$class('tau.demo.SegmentedButton').extend(tau.ui.SceneController).define( {
  
  loadScene: function () {
    var segment1, segment2, segment3,
        scene = this.getScene(),
        panel = new tau.ui.Panel({id: 'images'});
        button = new tau.ui.Button({label: 'refresh'});
    panel.setStyles(
        {padding: '10%', marginTop: '5px', height: '30%', width: '90%'});
    button.setStyles({width: '100%', marginTop: '5px'});
    button.onEvent(tau.rt.Event.TAP, this.handleTapEvent, this);
    
    segment1 = new tau.ui.SegmentedButton({
      id: 'seg1',
      styles: {marginLeft: '5px', marginTop: '5px'},
      maxSelectableCnt: 2,
      components: 
        [{label: 'option1', value: 1},
         {label: 'option2', value: 2},
         {label: 'option3', value: 3}]
    });
    segment1.onEvent(tau.rt.Event.VALUECHANGE, this.handleValueChange, this);
    
    for (var i = 0; i < 3; i++){
      panel.add(new tau.ui.ImageView({
        src: '/img/' + 'baskin' + i +'.png',
        styles: {height: '100%', width: '33%', opacity: 0.3}
      }));
    }
    
    segment2 = new tau.ui.SegmentedButton({
      id: 'seg2',
      styles: {marginLeft: '5px', marginTop: '5px'},
      vertical: true,
      components: [
        {label: 'pint', value:1},
        {label: 'quarter', value:2},
        {label: 'family', value:3},
        {label: 'half gallon', value:4} ],
      selectedIndexes: [2]
    }); 
    
    segment3 = new tau.ui.SegmentedButton({
      id: 'seg3',
      styles: {marginLeft: '5px', marginTop: '5px'},
      components: 
        [{label: 'Syrup no', value:false},
         {label: 'Syrup yes', value:true}],
      selectedIndexes: [0]
    });
    segment3.onEvent(tau.rt.Event.VALUECHANGE, this.handleValueChange, this);
    
    scene.add(button);  
    scene.add(segment1);  
    scene.add(panel);
    scene.add(segment2);  
    scene.add(segment3);  
  },
  
  /**
   * Event listener for button tap event
   * @param e
   * @param payload
   */
  handleTapEvent: function (e, payload) {
    var scene = this.getScene();
    scene.getComponent('seg1').refresh();
    scene.getComponent('seg2').refresh();
    scene.getComponent('seg3').refresh();
    
    var images = scene.getComponent('images').getComponents();
    for(var i = 0, len = images.length; i < len; i++){
      images[i].setStyles({opacity: 0.3});
    }
  },
  
  /**
   * Event handler for value change event
   * @param e
   * @param payload
   */
  handleValueChange: function (e, payload) {
    var i, len, images, color,
        scene = this.getScene(),
        src = e.getSource(),
        panel = scene.getComponent('images'),
        selectedIndexes = payload.selectedIndexes,
        deselectedIndexes = payload.deselectedIndexes;
    
    if (src.getId() === 'seg1') {
      images = panel.getComponents();
      for(i = 0, len = selectedIndexes.length; i < len; i++) {
        images[selectedIndexes[i]].setStyles({opacity: 1});
      }
      for(i = 0, len = deselectedIndexes.length; i < len; i++) {
        images[deselectedIndexes[i]].setStyles({opacity: 0.3});
      }
    } else if (src.getId() === 'seg3') {
      color = (selectedIndexes[0] === 1) ? 'red' : '';
      panel.setStyles({backgroundColor: color});
    }
  }
});