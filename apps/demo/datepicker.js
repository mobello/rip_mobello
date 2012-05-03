/**
 * Picker
 */
$class('tau.demo.DatePicker').extend(tau.ui.SceneController).define({
  loadScene: function() {

    this.dateTimePicker = new tau.ui.DatePicker(tau.ui.DatePicker.DATETIME, {
      locale: "us"
    });

    this.dateOnlyPicker = new tau.ui.DatePicker(tau.ui.DatePicker.DATE_ONLY, {
      locale: "us"
    });

    this.timeOnlyPicker = new tau.ui.DatePicker(tau.ui.DatePicker.TIME_ONLY, {
      locale: "us"
    });

    var toolbar = new tau.ui.ToolBar();

    var datetimeButton = new tau.ui.Button();
    datetimeButton.setLabel("DateTime");
    
    datetimeButton.onEvent(tau.rt.Event.TAP, 
        this.openDateTimePicker, this);
    
    this.dateTimePicker.getDoneButton().onEvent(tau.rt.Event.TAP, 
        this.doneEventHandlerOfDateTimePicker, this);
    this.dateTimePicker.getCancelButton().onEvent(tau.rt.Event.TAP, 
        this.cancelEventHandlerOfDateTimePicker, this);

    var dateOnlyButton = new tau.ui.Button();
    dateOnlyButton.setLabel("DateOnly");
    
    dateOnlyButton.onEvent(tau.rt.Event.TAP, 
        this.openDateOnlyPicker, this);

    this.dateOnlyPicker.getDoneButton().onEvent(tau.rt.Event.TAP, 
        this.doneEventHandlerOfDateOnlyPicker, this);
    this.dateOnlyPicker.getCancelButton().onEvent(tau.rt.Event.TAP, 
        this.cancelEventHandlerOfDateOnlyPicker, this);

    var timeOnlyButton = new tau.ui.Button();
    timeOnlyButton.setLabel("TimeOnly");
    
    timeOnlyButton.onEvent(tau.rt.Event.TAP, 
        this.openTimeOnlyPicker, this);

    this.timeOnlyPicker.getDoneButton().onEvent(tau.rt.Event.TAP, 
        this.doneEventHandlerOfTimeOnlyPicker, this);
    this.timeOnlyPicker.getCancelButton().onEvent(tau.rt.Event.TAP, 
        this.cancelEventHandlerOfTimeOnlyPicker, this);

    toolbar.add(datetimeButton);
    toolbar.add(dateOnlyButton);
    toolbar.add(timeOnlyButton);

    this.getScene().add(toolbar);
    this.getScene().add(this.dateTimePicker);
    this.getScene().add(this.dateOnlyPicker);
    this.getScene().add(this.timeOnlyPicker);
  },
  
  openDateTimePicker: function () {
    this.dateTimePicker.open();
    this.dateTimePicker.moveToNow();
  },  
  
  openDateOnlyPicker: function () {
    this.dateOnlyPicker.open();
    this.dateOnlyPicker.moveToNow();
  },
  
  openTimeOnlyPicker: function () {
    this.timeOnlyPicker.open();
    this.timeOnlyPicker.moveToNow();
  },
  
  doneEventHandlerOfDateTimePicker: function() {
    tau.alert(this.dateTimePicker.getDate());    
  },
  
  cancelEventHandlerOfDateTimePicker: function() {
    this.dateTimePicker.moveToNow();    
  },
  
  doneEventHandlerOfDateOnlyPicker: function (e, payload) {
    tau.alert(this.dateOnlyPicker.getDate());
  },
  
  cancelEventHandlerOfDateOnlyPicker: function (e, payload) {
    this.dateOnlyPicker.moveToNow();
  },
  
  doneEventHandlerOfTimeOnlyPicker: function(e, payload) {
    tau.alert(this.timeOnlyPicker.getDate());
  },
  
  cancelEventHandlerOfTimeOnlyPicker: function(e, payload) {
    this.timeOnlyPicker.moveToNow();
  },
});