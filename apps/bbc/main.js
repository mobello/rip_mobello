$require('/list.js');

$class('tau.bbc.Main').extend(tau.ui.SequenceNavigator).define({
  init: function () {  
    this.setRootController(new tau.bbc.ListController());
  }
});