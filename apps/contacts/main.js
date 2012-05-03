$require('/info.js');

/**
 * Contact sample application class
 */
$class('tau.sample.ContactsController').extend(tau.ui.SequenceNavigator).define({
  init: function() {
    this.setRootController(new tau.sample.ContactListController());
  }
});

/**
 * Contact table list use with TableSceneController
 */
$class('tau.sample.ContactListController').extend(tau.ui.TableSceneController).define({
  /**
   * Constructor, initialize model object as null
   */
  ContactListController: function () {
    this._model = null;
  },
  
  init: function () {
    this.setTitle('주소록');
    var table = new tau.ui.Table({
      group: true,
      sectionSort: tau.ui.ASC_SORT,
      styleClass: {
        section: 'sectionGroup'
      }
    });
    var scene = this.getScene();
    scene.setStyleClass({type: 'ios'});
    scene.add(table);   
    tau.sample.ContactListController.$super.init.apply(this, arguments);
  },
  
  /**
   * loads model to display content on the table component
   * @param {Number} start start index(inclusive 0)
   * @param {Number} size the number of cells to display on the current
   *        page
   * @returns {Number} the number of cells to load
   */
  loadModel: function (start, size) {
    // in real world the model will be loaded from storage like DB
    this._model = tau.getRuntime().getModule().getConfig().model;
    return this._model.length;
  },
  
  /**
   * Create table cell object and returns that
   * @param {Number} index current index of the model at which the table
   *        cell object is created.
   * @param {Number} offset the offset from the beginning
   * @returns {tau.ui.TableCell} newly created TabelCell object
   */
  makeTableCell: function(index, offset) {
    var model = this._model;
    return new tau.ui.TableCell({
      title: model[index].name,
      groupName: model[index].group
    });
  },
  
  /**
   * callback method when user selects specific table cell.
   * @param {tau.ui.TableCell} current current table cell object
   * @param {tau.ui.TableCell} before just before selected table cell
   *        object
   */
  cellSelected: function(current, before) {
    var contact = this.findContact(current.getTitle());
    if (contact) {
      this.getParent().pushController( new tau.sample.ContactInfo(contact));
    }
  },
  
  /**
   * 
   * @param name
   * @returns
   */
  findContact: function (name) {
    for (var i = 0, len = this._model.length; i < len; i++) {
      if (this._model[i].name === name) {
        return this._model[i];
      }
    }
    return null;
  },
  
  /**
   * releases all the occupied object
   */
    destroy: function() {
      this._model = null;
    }
});
