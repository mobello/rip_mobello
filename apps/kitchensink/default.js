$class('tau.demo.kitchensink.Form').extend(tau.ui.SceneController).define({

  /**
   * Constructor
   */
  Form: function() {
    this.setTitle('Form');
    this.selectItems = [{label: 'option1', value: 1},
                        {label: 'option2', value: 2},
                        {label: 'option3', value: 3},
                        {label: 'option4', value: 4}];
  },

  /**
   * loads ui scene
   */
  loadScene: function() {
    var scene = this.getScene();
    scene.setStyleClass({type: 'ios'});

    var panel = new tau.ui.ScrollPanel({
      styles: {
        'display': 'block',
        'width': '98%',
        'margin': 'auto',
      }
    });
    scene.add(panel);

    var select1 = new tau.ui.Select({
      components: this.selectItems,
      styles: {margin: '10px 0'},
      maxSelectableCnt: 2,
    });
    panel.add(select1);

    var select2 = new tau.ui.Select({
      components: this.selectItems,
      styles: {margin: '10px 0'},
      fullscreen: true,
      modal: true,
      maxSelectableCnt: 2,
    });
    panel.add(select2);

    var spinner = new tau.ui.Spinner({styles: {margin: '10px 0'}});
    panel.add(spinner);

    var pickerPanel = new tau.ui.Panel();
    panel.add(pickerPanel);

    var picker = new tau.ui.Picker();
    picker.addSlot({
      slot1: 'Slot1',
      slot2: 'Slot2',
      slot3: 'Slot3',
      slot4: 'Slot4',
    });
    scene.add(picker);

    var pickerButton = new tau.ui.Button({
      label: {normal: 'Picker'},
      styles: {margin: '10px' }
    });
    pickerPanel.add(pickerButton);
    pickerButton.onEvent(tau.rt.Event.TAP, function() {
      picker.open();
    });

    var datePicker = new tau.ui.DatePicker(
        tau.ui.DatePicker.DATETIME);
    scene.add(datePicker);
    var datePickerButton = new tau.ui.Button({
      label: {normal: 'DatePicker'},
      styles: {margin: '10px'}
    });
    pickerPanel.add(datePickerButton);
    datePickerButton.onEvent(tau.rt.Event.TAP, function() {
      datePicker.open();
    });

    var commonStyles = {
      'display': 'block',
      'margin': '0.8em 0',
      'width': '100%',
    };

    var textField = new tau.ui.TextField({styles: commonStyles});

    panel.add(textField);

    var vSegmentedButton = new tau.ui.SegmentedButton({
      vertical: true,
      maxSelectableCnt: 2,
      components: this.selectItems,
      styles: {margin: '1em 0'}
    });
    vSegmentedButton.setSelectedIndexes([ 0 ]);
    panel.add(vSegmentedButton);

    var hSegmentedButton = new tau.ui.SegmentedButton({
      maxSelectableCnt: 2,
      components: this.selectItems,
      styles: {margin: '1em', width: '80%', display: '-webkit-box' }
    });
    hSegmentedButton.setSelectedIndexes([0]);
    panel.add(hSegmentedButton);

    var hSegmentedButton = new tau.ui.SegmentedButton({
      components: this.selectItems,
      selectedIndexes: [0],
      styles: {
        margin: '1em',
        width: '80%',
        display: '-webkit-box'
      },
      styleClass: {type: 'sanmarino'}
    });
    panel.add(hSegmentedButton);

    var slider = new tau.ui.Slider({
      styles: {margin: '1em 0', width: '90%', display: '-webkit-box'}
    });

    panel.add(slider);
    
    var panel2 = new tau.ui.Panel({
        styles: {'display': 'flexbox', '-webkit-box-pack': 'center' }
    });
    panel.add(panel2);

    var switch1 = new tau.ui.Switch({
      tappable: true,
      styles: {margin: '1em'}
    });
    panel2.add(switch1);
    
    var switch2 = new tau.ui.Switch({
        tappable: true,
        value: true,
        styles: {margin: '1em'}
      });
      panel2.add(switch2);

    var panel3 = new tau.ui.Panel({
      styles: {'display': 'flexbox', '-webkit-box-pack': 'center'}
    });
    panel.add(panel3);

    var button = new tau.ui.Button({
      label: {normal: 'Button'},
      styles: {
        'display': 'block',
        'margin': '1em',
        'width': 'auto',
      }
    });
    panel3.add(button);

    var button = new tau.ui.Button({
      label: {normal: 'Button'},
      styles: {
        'display': 'block',
        'margin': '1em',
        'width': 'auto',
      },
      styleClass: {type: 'dark'},
    });
    panel3.add(button);
  }
});