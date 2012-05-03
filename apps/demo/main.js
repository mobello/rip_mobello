$require('/control.js');
$require('/dialog.js');
$require('/panel.js');
$require('/bar.js');
$require('/etc.js');
$require('/picker.js');
$require('/spinner.js');

$require('/datepicker.js');

$require('/button.js');
$require('/label.js');
$require('/activityindicator.js');
$require('/image.js');
$require('/modal.js');
$require('/popover.js');
/**
 * demo application class
 */
$class('tau.demo.Demo').extend(tau.ui.SequenceNavigator).define({
  init: function () {
    this.setRootController(new tau.demo.TableController());
  }
});

/**
 * 
 */
$class('tau.demo.TableController').extend(tau.ui.TableSceneController).define({
  /**
   * Constructor, initialize model object as null
   */
  TableController: function () {
    this.model = null;
  },
  
  init: function () {
    tau.demo.TableController.$super.init.apply(this, arguments);
    this.setTitle('Demo');
    var table = new tau.ui.Table({
      group: true,
      sectionSort: tau.ui.ASC_SORT,
      styleClass: {section: 'sectionGroup'}
    });
    var scene = this.getScene();
    scene.setStyleClass({type: 'ios'});
    scene.add(table);
  },
  
  /**
   * loads model to display content on the table component
   * @param {Number} start start index(inclusive 0)
   * @param {Number} size the number of cells to display  on the current page
   * @returns {Number} the number of cells to load
   */
  loadModel: function (start, size) {
    this.model =  [
     {group: 'Control', title: 'Checkbox'},
     {group: 'Control', title: 'Radio'},
     {group: 'Control', title: 'TextField'},
     {group: 'Control', title: 'TextArea'},
     {group: 'Control', title: 'Slider'},
     {group: 'Control', title: 'Switch'},
     {group: 'Control', title: 'Select'},
     {group: 'Control', title: 'SegmentedButton'},
     {group: 'Dialog', title: 'SystemDialog'},
     {group: 'Dialog', title: 'ActionSheet'},
     {group: 'Dialog', title: 'Dialog'},
     {group: 'Panel', title: 'ScrollPanel'},
     {group: 'Panel', title: 'Table'},
     {group: 'Panel', title: 'TextView'},
     {group: 'Panel', title: 'Carousel'},
     {group: 'Bar', title: 'ToolBar'},
     {group: 'Etc', title: 'Badge'},
     {group: 'Etc', title: 'Redraw'},

     {group: 'Spinner', title: 'Spinner'},
     {group: 'Picker', title: 'Picker'},
     {group: 'Picker', title: 'DatePicker'},
     {group: 'Button', title: 'Button'},
     {group: 'Label', title: 'Label'},
     {group: 'ActivityIndicator', title: 'ActivityIndicator'},
     {group: 'Image', title: 'ImageView'},
     {group: 'Modal', title: 'ModalController'},
     {group: 'Popover', title: 'PopoverController'}
     ];
    return this.model.length;
  },
  
  /**
   * Create table cell object and returns that 
   * @param {Number} index current index of the model at which the table cell
   * object is created. 
   * @param {Number} offset the offset from the beginning   
   * @returns {tau.ui.TableCell} newly created TabelCell object
   */
  makeTableCell: function (index, offset) {
    var model = this.model;
    return new tau.ui.TableCell({title: model[index].title, 
      groupName: model[index].group});
  },
  
  /**
   * callback method when user selects specific table cell.
   * @param {tau.ui.TableCell} current current table cell object 
   * @param {tau.ui.TableCell} before just before selected table cell object
   */
  cellSelected: function (current, before) {
    var title = current.getTitle(),
        clazz = $class.forName('tau.demo.' + title),
        ctrl = new clazz();
    ctrl.setTitle(title);
    this.getParent().pushController(ctrl);
  },
  
  /**
   * releases all the occupied object
   */
  destroy: function () {
    this.model = null;
  }
});
