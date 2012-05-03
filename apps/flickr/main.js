/**
 * Flickr Demo Application
 * 
 * @version 1.1.0
 * @creation 2011. 10. 10.
 * 
 * Copyright 2010 KT Innotz, Inc. All rights reserved. KT INNOTZ
 * PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 */

/**
 * Main Controller Class. This class is registered config.json 
 * configuration file
 */
$class('tau.sample.fr.Flickr').extend(tau.ui.SequenceNavigator).define({

  init: function () {
    var config = tau.getCurrentContext().getConfig();
    this.url = config.flickrUrl + '?tags=' + config.flickrTags 
      + '&tagmode=any&format=json';
    this.setRootController(new tau.sample.fr.ListController(this.url));
  },

  /**
   * frees resource no more needed
   */
  destroy: function () { 
    this.url = null; 
  }
});

/** 
 * Class for FlickerListController
 * This class will be loading scene using compiled scene file(list.scene.js)
 */
$class('tau.sample.fr.ListController').extend(tau.ui.TableSceneController).define({
  /**
   * Default constructor
   */
  ListController: function (url) {
    this.url = url;
    this.flickr = null;
  },
  
  /**
   * Set Back button text on the navigation bar
   */
  init: function () {
    tau.sample.fr.ListController.$super.init.apply(this, arguments);
    var nav = this.getNavigationBar();
    nav.setBackButtonText('Home');
    this.setTitle('Flickr');
    this.getScene().add(
        new tau.ui.Table({moreCell: true, listSize: 10, indicator: true}));
  },
  
  /**
   * event listener, it will be notified when data to make a cell is ready
   * creates new TableCell instance and adds as a row
   * payload.data: an element of the loaded data(array)
   * payload.index: the index(0-based) of rows
   */
  makeTableCell: function (index, offset) {
    var cell = new tau.ui.TableCell();
    cell.setTitle(this.flickr.items[offset + index].title);
    return cell;
  },
  
  /**
   * event listener, it will be notified when the table component is ready
   * load flickr data from flickr server
   */
  loadModel: function (start, size) {
    var table = this.getTable();

    function loaded(resp) {
      if (resp.status === 200) {
        this.flickr = resp.responseJSON;
        table.addNumOfCells(size);
      } else {
        table.endActivityIndicator();
        tau.confirm('<br> Response error: status=' + resp.status + ' msg=' + resp.statusText + '<br><br> 재시도 하시겠습니까?', {
          title: 'Error',
          callbackFn: function(returnVal){
            table.endActivityIndicator();
            if (returnVal) table.loadModel(true);
          }
        });
      }
    };
    if (!this.flickr) {
      tau.req({
        type: 'JSONP',
        jsonpCallback:'jsoncallback',
        url: this.url,
        callbackFn: tau.ctxAware(loaded, this)
      }).send();
    } else {
      size = (start < this.flickr.items.length) ? size : 0;
      table.addNumOfCells(size);
    }
  },

  /**
   * event listener, it will be notified when a user touches table cell
   */
  cellSelected: function (current, before) {
    var table = this.getTable();
    if (current instanceof tau.ui.TableCell) {
      var path = table.indexOf(current).pop(); // index is array
      var item = this.flickr.items[path];
      var detailController = new tau.sample.fr.DetailController(item);
      this.getParent().pushController(detailController); 
    }
  },
  
  /**
   * Frees resources no longer used
   */
  destroy: function () {
    tau.sample.fr.ListController.$super.destroy.apply(this, arguments);
    this.url = null;
    this.flickr = null;
  }
});

/**
 * Scene controller for showing Flickr Detail information. 
 * This class will be loading scene using compiled scene file(detail.scene.js) 
 */
$class('tau.sample.fr.DetailController').extend(tau.ui.SceneController).define({
  /**
   * Constructor
   * @param {Object} item flickr individual item
   */
  DetailController: function(item) { 
    this._item = item;
  },
  
  /**
   * Frees resources no longer used
   */
  destroy: function () {
    tau.sample.fr.DetailController.$super.destroy.apply(this, arguments);
    this._item = null;
  }
});