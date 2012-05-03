/**
 * NestedList Demo Application
 * 
 * @version 1.0.0
 * @creation 2012. 02. 21.
 */
$class('tau.sample.list.NestedList').extend(tau.ui.SequenceNavigator).define({
  init: function () {
    var config = tau.getCurrentContext().getConfig();
    this.setRootController(new tau.sample.list.ListController(config.data));
  }
});

$class('tau.sample.list.ListController').extend(tau.ui.TableSceneController).define({
  ListController: function (model) {
    this.model = model;
  },
  
  loadModel: function (start, size) {
    var table = this.getTable();
    table.addNumOfCells(this.model.items.length);
  },
  
  makeTableCell: function (index, offset) {
    var cell = new tau.ui.TableCell();
    cell.setTitle(this.model.items[offset + index].title);
    return cell;
  },

  cellSelected: function (current, before) {
    var table = this.getTable();
    if (current instanceof tau.ui.TableCell) {
      var path = table.indexOf(current).pop(); // index is array
      var item = this.model.items[path];
      if (item.items) {
        var detailController = new tau.sample.list.ListController(item);
        this.getParent().pushController(detailController); 
      }
    }
  },
  
  destroy: function () {
    this.model = null;
  }
});