/**
 * Picker
 */
$class('tau.demo.Picker').extend(tau.ui.SceneController).define({
  init: function() {
    this.appCtx = tau.getCurrentContext(); // 현재 앱의 컨텍스트 정보를 가져온다.
  },

  loadScene: function() {
    var scene = this.getScene();
    this.picker = new tau.ui.Picker();
    var showMore = screen.width > 320 && screen.height > 480;
    this.slot = {};
    this.slot.redSlot = this.picker.addSlot(null, {
      begin: 0,
      end: 255,
      prefix: "R" + (showMore ? "ed": "") + "(",
      postfix: ")",
      highlight: 189
    });
    this.slot.greenSlot = this.picker.addSlot(null, {
      begin: 0,
      end: 255,
      prefix: "G" + (showMore ? "reen": "") + "(",
      postfix: ")",
      highlight: 19
    });
    this.slot.blueSlot = this.picker.addSlot(null, {
      begin: 0,
      end: 255,
      prefix: "B" + (showMore ? "lue": "") + "(",
      postfix: ")",
      highlight: 89
    });

    var doneButton = this.picker.getDoneButton();
    doneButton.onEvent(tau.rt.Event.TAP, this.handleClickDone, this);
    
    var cancelButton = this.picker.getCancelButton();
    cancelButton.onEvent(tau.rt.Event.TAP, this.handleClickCancel, this);
    
    this.picker.onEvent(
        tau.rt.Event.VALUECHANGE,
        this.handleChangeValueOfPicker,this
    );
    scene.add(this.picker);

    var toolbar = new tau.ui.ToolBar();

    var buttonOpen = new tau.ui.Button();
    buttonOpen.setLabel("Open RGB");
    buttonOpen.onEvent(tau.rt.Event.TAP, this.handleOpenPicker, this);

    var buttonAddSlot = new tau.ui.Button();
    buttonAddSlot.setLabel("Add Slot");
    buttonAddSlot.onEvent(tau.rt.Event.TAP, this.handleAddSlot , this);

    var buttonAddSeparator = new tau.ui.Button();
    buttonAddSeparator.setLabel("Separator");
    buttonAddSeparator.onEvent(tau.rt.Event.TAP, this.handleAddSeparator, this);

    var buttonRemoveSlot = new tau.ui.Button();
    buttonRemoveSlot.setLabel("remove slot");
    buttonRemoveSlot.onEvent(tau.rt.Event.TAP, this.handleRemoveSlot, this);

    var buttonDisable = new tau.ui.Button();
    buttonDisable.setLabel("disable");
    buttonDisable.onEvent(tau.rt.Event.TAP, this.handleDisablePickerItem, this);
    
    
    var buttonGetValues = new tau.ui.Button();
    buttonGetValues.setLabel("values");
    buttonGetValues.onEvent(tau.rt.Event.TAP, this.handleGetPickerValues, this);

    var buttonGetTexts = new tau.ui.Button();
    buttonGetTexts.setLabel("texts");
    buttonGetTexts.onEvent(tau.rt.Event.TAP, this.handleGetPickerText, this);

    var buttonMoveTo = new tau.ui.Button();
    buttonMoveTo.setLabel("cherry");
    buttonMoveTo.onEvent(tau.rt.Event.TAP, this.handleSpinToCherryValue, this);

    toolbar.add(buttonOpen);
    toolbar.add(buttonAddSlot);
    toolbar.add(buttonAddSeparator);
    toolbar.add(buttonDisable);
    toolbar.add(buttonRemoveSlot);
    toolbar.add(buttonGetValues);
    toolbar.add(buttonGetTexts);
    toolbar.add(buttonMoveTo);
    scene.add(toolbar);

    var toolbar3 = new tau.ui.ToolBar({dock: 'bottom'});
    toolbar3.add(new tau.ui.Button({label: 'btn1'}));
    toolbar3.add(new tau.ui.Button({label: 'btn2'}));
    scene.add(toolbar3);
    
    scene.setStyles({
      backgroundColor: "#000000"
    });
  },
  /**
   * event handler called back when doneButton is touched
   */
  handleClickDone: function () {
    tau.log("DONE");
  },
  /**
   * event handler called back when cancelButton is touched
   */
  handleClickCancel: function () {
    tau.log("CANCEL");
  },
  /**
   * Event handler for ValueChangeEvent on Picker Component
   * @param e
   * @param payload
   */
  handleChangeValueOfPicker: function (e, payload) {
    var slotIndex = payload.slotIndex;
    var v = payload.values;
    var t = payload.texts;
    tau.log('slotIndex: '+ slotIndex + ', value: '+ v + ',text: '+ t);
    this.changeColor(v[0], v[1], v[2]);     
  },
  /**
   * event handler called back when buttotnOpen is touched
   */
  handleOpenPicker: function () {
    this.picker.open();
  },
  /**
   * event handler called back when buttotnAddSlot is touched
   */
  handleAddSlot: function () {
    if (this.picker.size > 4) {
      tau.alert("You cannot add slot, because it is full. ");
      return;
    }
    if (this.picker.size == 3) {
      this.picker.addSlot({
        dummy1: "dummy1", dummy2: "dummy2",
        dummy3: "dummy3", dummy4: "dummy4"
      });
    } else if (this.picker.size == 4) {
      this.picker.addSlot({
        fake1: "fake1", fake2: "fake2",
        fake3: "fake3", fake4: "fake4"
      });
    }
  },
  /**
   * event handler called back when buttonAddSeparator is touched
   */
  handleAddSeparator: function () {
    if (this.picker.size > 4) {
      tau.alert("You cannot add slot, because it is full. ");  
      return;
    }
    separatorSlot = this.picker.addSeparator("$");
  },
  /**
   * event handler called back when buttonRemoveSlot is touched
   */
  handleRemoveSlot: function () {
    var that = this;
    if (this.picker.size < 4) {
      tau.alert("You cannot delete slot, because you don't add slot. " +
      		"Only you can delete added slot.");
      return;
    }
    var slotID = undefined;

    tau.prompt(
        "Only you can delete added slot, you cannot delete RGB slot." +
    		"input slot number [4~" + (this.picker.size) + "]" , 
  		{
        title: 'delete?',
        placeholderLabel: '4',
        callbackFn: function(returnVal) {
          try {
            slotID = parseInt(returnVal) - 1;
            if (tau.isNumber(slotID) && slotID > 2) {
              that.picker.removeSlot(slotID);
            }
          } catch (exx) {
            slotID = undefined;
            tau.log.debug(ex);
          }
        }
  		}
    );
  },
  /**
   * event handler called back when buttonDisable is touched
   */
  handleDisablePickerItem: function () {
    this.picker.setDisabledItem(0, 0, 2);
    this.picker.setDisabledItem(0, 54, 1);
    this.picker.setDisabledItem(0, 35, 15);
    this.picker.setDisabledItem(0, 99, 2);
    this.picker.setDisabledItem(1, 0, 1);
    this.picker.setDisabledItem(1, 55, 12);
    this.picker.setDisabledItem(1, 93, 1);
    this.picker.setDisabledItem(1, 159, 50);
    this.picker.setDisabledItem(1, 204, 50);
    this.picker.setDisabledItem(2, 0, 11);
    this.picker.setDisabledItem(2, 23, 1);
    this.picker.setDisabledItem(2, 123, 40);
    this.picker.setDisabledItem(2, 223, 11);
  },
  /**
   * event handler called back when buttonGetValues is touched
   */
  handleGetPickerValues: function () {
    tau.alert(this.picker.getValues());
  },
  /**
   * event handler called back when buttonGetTexts is touched
   */
  handleGetPickerText: function() {
    tau.alert(this.picker.getTexts());
  },
  
  /**
   * event handler called back when buttonMoveTo is touched
   */
  handleSpinToCherryValue: function() {
    // that.changeColor(toolbar, 255,255,0);
    if (!this.picker.isOpened()) {
      tau.alert("please, open the picker.");
      return;
    }
    this.picker.spinTo(this.slot.redSlot, 189);
    this.picker.spinTo(this.slot.greenSlot, 19);
    this.picker.spinTo(this.slot.blueSlot, 89);
  },
  
  changeColor: function (red, green, blue) {
    var hexValue = this.colorToHex(
        'rgb(' + red + ', ' + green + ', '+ blue + ')');
    // toolbar.setBackgroundColor({normal:hexValue});
    this.getScene().setStyles({backgroundColor: hexValue});
  },

  colorToHex: function (color) {
    if (color.substr(0, 1) === '#') {
      return color;
    }
    var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);

    var red = parseInt(digits[2]);
    var green = parseInt(digits[3]);
    var blue = parseInt(digits[4]);

    var rgb = blue | (green << 8) | (red << 16);

    var padded = rgb.toString(16) + "";

    for ( var i = 6 - padded.length; i > 0; i--) {
      padded = "0" + padded;
    }
    return digits[1] + '#' + padded;
  }
});