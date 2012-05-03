$require('/add.js');
$class('tau.stocks.SettingController').extend(tau.ui.SceneController).define({
  
  SettingController: function () {
    this._stockList;
    this._stockValueType = tau.stocks.MainController.getStockValueTypeFromStorage() || 0;
    this._changed = false;
  },
  
  sceneLoaded: function () {
    var table = this.getTable();
    table.loadModel();
  },
  
  loadModel : function(e, payload) {
    this._stockList = tau.stocks.MainController.getStockListFromStorage();
    var len = this._stockList.length;
    var table = this.getTable();
    table.addNumOfCells(len);
  },

  /**
   * event listener, it will be notified when data to make a cell is ready
   * creates new TableCell instance and adds as a row
   * payload.data: an element of the loaded data(array)
   * payload.index: the index(0-based) of rows
   */
  makeTableCell: function (e, payload) {
    var table = this.getTable();
    var path = payload.index + payload.offset;
    var item = this._stockList[path];
    
    var cell = new tau.ui.TableCell({
      id: item.symbol,
      styles: {
        color: 'black'
      },
      title: item.symbol + '(' + (item.exchDisp || '') + ')',
      subTitle: item.name || '',
      disabled: true,
      leftItem: new tau.ui.Button({
        styles: {
          width: '44px',
          height: '44px',
          border: 'none',
          backgroundImage: 'url(/img/minus.png)',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'transparent',
          backgroundSize: '24px 24px',
          backgroundPosition: 'center center'
        }
      }),
      rightItem: new tau.ui.Button({
        label: 'Delete',
        visible: false,
        styleClass: {type: 'red', size: 'small'},
        styles: {
          height: '44px'
        }
      })
    });
    table.add(cell);
  },
  
  getTable: function () {
    return this.getScene().getComponent(1);
  },
  
  handleCellSelected: function (e, payload) {
    if (payload.before) payload.before.setSelected(false);
    if (payload.current) payload.current.setSelected(false);
  },
  
  handleTap: function (e, payload) {
    var cell, src = e.getSource();

    if (src instanceof tau.ui.Button) {
      cell = src.getParent();
      if (src === cell.getLeftItem()) {
        if (this._deleteButton) {
          this._deleteButton.setVisible(false);
          delete this._deleteButton;
        }
        this._deleteButton = cell.getRightItem();
        this._deleteButton.setVisible(true);
      } else if (src === cell.getRightItem()) {
        this.removeItem(cell.getId());
        this.getTable().remove(cell, true);
        this._changed = true;
      }
    } else if (this._deleteButton) {
      this._deleteButton.setVisible(false);
      delete this._deleteButton;
    }
  },
  
  handleDone: function (e, payload) {
    this.fireEvent('dismiss', this._changed);
    if (this._changed) {
      tau.stocks.MainController.setStockListToStorage(this._stockList);
      tau.stocks.MainController.setStockValueTypeToStorage(this._stockValueType);
    }
  },
  
  handleAdd: function (e, payload) {
    var modalCtrl = new tau.stocks.AddController();
    modalCtrl.onEvent('dismiss', this.handleDismiss, this);
    this.presentModal(modalCtrl, {'layout': 'FULL', 'animate': 'vertical'});
  },
  
  handleDismiss: function (e, payload) {
    this.dismissModal(true);
    if (payload) {
      this._changed = true;
      var table = this.getTable();
      table.removeComponents();
      table.loadModel();
    }
  },
  
  handleStockValueType: function (e, payload) {
    if (payload && payload.selectedIndexes) {
      var index = payload.selectedIndexes[0];
      this._stockValueType = index;
      this._changed = true;
    }
  },
  
  removeItem: function (symbol) {
    if (this._stockList) {
      for(var i=0, len = this._stockList.length; i < len; i++) {
        if (this._stockList[i].symbol === symbol) {
          this._stockList.splice(i);
          return;
        }
      }
    }
  }
});