$class('tau.stocks.AddController').extend(tau.ui.SceneController).define({
  
  $static: {
    URL: "http://autoc.finance.yahoo.com/autoc?callback=YAHOO.Finance.SymbolSuggest.ssCallback&query="
  },
  
  AddController: function () {
    this._stockList;
  },

  loadModel : function(resp) {
    var items;
    var table = this.getTable();
    
    if (resp && resp.ResultSet && (items = resp.ResultSet.Result)) {
      if (!tau.isArray(items)) {
        items = [items];
      }
      this._stockList = items;
      table.removeComponents(true);
      table.addNumOfCells(items.length);
    }
  },
  
  makeTableCell: function (e, payload) {
    var table = this.getTable();
    var path = payload.index + payload.offset;
    var item = this._stockList[path];
    var cell = new tau.ui.TableCell({
      id: item.symbol,
      styles: {
        color: 'black'
      },
      title: item.symbol + '(' + item.exchDisp + ')',
      subTitle: item.name || '',
    });
    table.add(cell);
  },

  getItem: function (symbol) {
    if (this._stockList) {
      for(var i=0, len = this._stockList.length; i < len; i++) {
        if (this._stockList[i].symbol === symbol) return this._stockList[i];
      }
    }
    return null;
  },
  
  getTable: function () {
    return this.getScene().getComponent('list');
  },
  
  handleCellSelected: function (e, payload) {
    var cell = payload.current;
    if (cell) {
      tau.stocks.MainController.addStockStorage(this.getItem(cell.getId()));
      this.fireEvent('dismiss', true);
    }
  },
  
  handleCancel: function (e, payload) {
    this.fireEvent('dismiss');
  },
  
  handleKeyup: function (e, payload) {
    var src = e.getSource();
    var text = src.getText() || '';
    
    if (text.length > 1) {
      if (!window.YAHOO) {
        YAHOO = {Finance: {SymbolSuggest: {
          ssCallback: tau.ctxAware(this.loadModel, this)
        }}};
      }
      tau.req({
        type: 'JSONP',
        url: tau.stocks.AddController.URL + text
      }).send();      
    } else {
      this.getTable().removeComponents(true);
    }
  },
  
  destroy: function () {
    delete YAHOO;
  }
});