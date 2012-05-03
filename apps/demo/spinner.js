/**
 * Spinner
 */
$class('tau.demo.Spinner').extend(tau.ui.SceneController).define({
  /**
   * create default scene
   */
  loadScene: function() {
    var spinner = new tau.ui.Spinner({
      styles: {margin: '10px'},
      step: 1, 
      min: -150, 
      max: 111, 
      readonly: false,
      value: 33,
      acceleration: false,
      formatFn: this.reformat
    });       
    
    spinner.onEvent(tau.rt.Event.VALUECHANGE, this.handleValueLogging);
    this.getScene().add(spinner);
  },
  
  /**
   * transforms the specified value and returns it
   * @param v
   * @returns {String}
   */
  reformat: function (v) {
    v = v.toFixed(2);
    return "$" + v;    
  },
  
  /**
   * Event handler for ValueChangeEvent on Spinner Component
   * @param e
   * @param payload
   */
  handleValueLogging: function (e, payload) {
    tau.log('Spinner value: '+ payload.value + ', step: '+ payload.step);
  }
});