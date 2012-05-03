/**
 * Stocks Demo Application
 * 
 * @version 1.0.0
 * @creation 2012. 3. 27.
 */

/**
 * Main Controller Class. This class is registered config.json 
 * configuration file
 */
$require('/setting.js');
$class('tau.stocks.MainController').extend(tau.ui.SceneController).define({
  
  $static: {
    QUERY: 
      "select * from csv where url='http://download.finance.yahoo.com/d/quotes.csv?s=${stockSymbols}&f=snohgvrj1kja2s7l1c1c&e=.csv' and " +
      "columns='symbol,name,open,high,low,volume,per,market_cap,w52_high,w52_low,avg_daily_volume,short_ratio,last_trade,change,percent_change'",
    URL: "http://query.yahooapis.com/v1/public/yql?format=json&diagnostics=false&q=",
    CHART_URL : "http://ichart.yahoo.com/z?z=s&t=3m&s=",
    
    addStockStorage: function (stock) {
      var stockList = tau.stocks.MainController.getStockListFromStorage() || [];
      stockList.push(stock);
      tau.stocks.MainController.setStockListToStorage(stockList);
    },
    
    getStockListFromStorage: function () {
      var ctx = tau.getCurrentContext();
      var stockList = ctx.getStorage('$stockList');
      
      if (!stockList) {
        var config = ctx.getConfig();
        ctx.setStorage('$stockList', config.STOCK_LIST);
      }
      return ctx.getStorage('$stockList');
    },
    
    getStockValueTypeFromStorage: function () {
      var ctx = tau.getCurrentContext();
      var stockValueType = ctx.getStorage('$stockValueType');
      
      if (tau.isUndefined(stockValueType)) {
        var config = ctx.getConfig();
        ctx.setStorage('$stockValueType', config.STOCK_VALUE_TYPE);
      }
      return ctx.getStorage('$stockValueType');
    },
    
    setStockListToStorage: function (list) {
      var ctx = tau.getCurrentContext();
      ctx.setStorage('$stockList', list);
    },
    
    setStockValueTypeToStorage: function (type) {
      var ctx = tau.getCurrentContext();
      ctx.setStorage('$stockValueType', type || '0');
    },
    
    removeStockStorage: function (symbol) {
      var stockList = tau.stocks.MainController.getStockListFromStorage();
      for(var i=0, len = stockList.length; i < len; i++) {
        if (stockList[i].symbol === symbol) {
          stockList.splice(i);
          break;
        }
      }
      tau.stocks.MainController.setStockListToStorage(stockList);
    }
  },
  
  MainController: function () {
    this._stockList;
    this._stockValueType = 0;
  },
  
  sceneLoaded: function () {
    var table = this.getTable();
    table.loadModel();
  },
  
  loadModel : function(e, payload) {
    var clazz = tau.stocks.MainController;
    this._stockList = clazz.getStockListFromStorage();
    this._stockValueType = clazz.getStockValueTypeFromStorage();
    
    var len = this._stockList.length;
    var table = this.getTable();

    table.addNumOfCells(len);
    if (this._stockList && len) {
      var url, params = [];
      for(var i=0; i < len; i++) {
        params.push(this._stockList[i].symbol);
        if (i < len -1) params.push(',');
      }
      if (params.length) {
        query = clazz.QUERY.replace('${stockSymbols}', params.join(""));
        url = clazz.URL.concat(encodeURIComponent(query));

        tau.log.info('stocks query : '.concat(query));
        tau.log.info('stocks url : '.concat(url));
        
        tau.req({
          type: 'JSONP',
          jsonpCallback:'callback',
          url: url,
          callbackFn: tau.ctxAware(this.handleResult, this)
        }).send();
      }
    }
  },
  
  /**
   * event listener, it will be notified when data to make a cell is ready
   * creates new TableCell instance and adds as a row
   * payload.data: an element of the loaded data(array)
   * payload.index: the index(0-based) of rows
   */
  makeTableCell: function (e, payload) {
    var path = payload.index + payload.offset;
    var item = this._stockList[path];
    
    if (!item) return;
    
    var table = this.getTable();
    var cell = new tau.ui.TableCell({
      id: item.symbol,
      selected: path === 0,
      title: item.symbol || '',
      subTitle: item.last_trade || ' ',
      styles: {
        '-webkit-box-align' : 'center'
      },
      rightItem: new tau.ui.Button({
        label: this.getStockValue(item),
        styleClass: {type: this.getStockValueType(item), size: 'small'},
        styles: {
          width: '80px',
          fontSize: '.5em',
          padding: 0,
          '-webkit-box-pack' : 'center'
        }
      })
    });
    if (path == 0) {
      cell.setStyles({
        'border-top-left-radius' : '10px',
        'border-top-right-radius' : '10px',
      });
    }
    table.add(cell);
    if (cell.isSelected()) table._selectedIdx = [path];
  },  
  
  handleResult: function (resp) {
    
    if (!resp || resp.status !== 200 || resp.responseJSON.error) {
      var that = this;
      tau.confirm('<br />Response error: status='.concat(resp.status, '<br />msg=', 
          resp.responseJSON.error.description, '<br /><br />재시도 하시겠습니까?'), {
        title: 'Error',
        callbackFn: function(returnVal){
          if (returnVal) that.loadModel();
        }
      });
      return;
    }
    
    var row = rows = resp.responseJSON.query.results.row,
      chartURL = tau.stocks.MainController.CHART_URL, 
      cell,
      table = this.getTable();

    if (rows) {
      if (!tau.isArray(rows)) rows = [rows]; 

      for(var i=0; i < rows.length; i++){
        row = rows[i];
        row.chartURL = chartURL.concat(row.symbol, '&q', row.chartType || "l");
        
        cell = table.getComponent(row.symbol);
        if (cell) {
          cell.setSubTitle(row.last_trade || '');
          cell.getRightItem().setLabel(this.getStockValue(row));
          
          if (cell.isSelected()) this.changeDetailInfo(row); 
        }
      }
      tau.stocks.MainController.setStockListToStorage(rows);
      this._stockList = tau.stocks.MainController.getStockListFromStorage();
      this._stockValueType = tau.stocks.MainController.getStockValueTypeFromStorage();
    }
  },
  
  changeDetailInfo: function (item) {
    var scene = this.getScene();
    var stockInfo = scene.getComponent('stockInfo');
    var stockChart = scene.getComponent('detail_chart');

    if (stockInfo) {
      scene.getComponent('detail_title').setText(item.name || '-');
      scene.getComponent('detail_open').setText(item.open || '-');
      scene.getComponent('deatil_mktcap').setText(item.market_cap || '-');
      scene.getComponent('detail_high').setText(item.high || '-');
      scene.getComponent('detail_52whigh').setText(item.w52_high || '-');
      scene.getComponent('detail_low').setText(item.low || '-');
      scene.getComponent('detail_52wlow').setText(item.w52_low);
      scene.getComponent('detail_vol').setText(item.volume);
      scene.getComponent('detail_avgvol').setText(item.avg_daily_volume);
      scene.getComponent('detail_pe').setText('-');
      scene.getComponent('detail_yield').setText('-');
    }
    if (stockChart) stockChart.setSrc(item.chartURL); 
  },
  
  getItem: function (symbol) {
    if (this._stockList) {
      for(var i=0, len = this._stockList.length; i < len; i++) {
        if (this._stockList[i].symbol === symbol) return this._stockList[i];
      }
    }
    return null;
  },
  
  getStockValue: function (item) {
    var value = '-';
    if (this._stockValueType == 0) {
      value = item.short_ratio && item.short_ratio !== 'N/A' ? item.short_ratio + '%' : '-';
    } else if (this._stockValueType == 1) {
      value = (item.change || '-');
    } else if (this._stockValueType == 2) {
      value = item.market_cap || '-';
    }
    return value.replace(/N\/A/gi, '-');
  },
  
  getStockValueType: function (item) {
    return (item.change || 0) > 0 ? 'green' : 'red';
  },

  getTable: function () {
    return this.getScene().getComponent(0);
  },
  
  handleTouchStart: function (e, payload) {
    var src = e.getSource();
    if (src instanceof tau.ui.Button) {
      e.preventDefault();
      e.stopPropagation();
    }
  },
  
  handleTap: function (e, payload) {
    var src = e.getSource();
    if (src instanceof tau.ui.Button){ // price 버튼에 대한 처리
      var type = this._stockValueType,
            table = this.getTable(),
            children = table.getComponents(), 
            cell, item, button;

      e.preventDefault();
      e.stopPropagation();
      
      if (type < 2) {
        type = type + 1;
      } else {
        type = 0;
      }
      this._stockValueType = type;
      
      for(var i=0, len = children.length; i < len; i++) {
        cell = children[i]; 
        item = this.getItem(cell.getId());
        button = cell.getRightItem();
        button.setLabel(this.getStockValue(item));
      }
    }
  },
  
  handleSetting: function (e, payload) {
    var modalCtrl = new tau.stocks.SettingController();
    modalCtrl.onEvent('dismiss', this.handleDismiss, this);
    this.presentModal(modalCtrl, {'layout': 'FULL', 'animate': 'vertical'});
  },
  
  handleCellSelected: function (e, payload) {
    tau.log('handleCellSelected', 1, this);
    var cell = payload.current;
    if (payload.before) payload.before.setSelected(false);
    if (cell) {
      cell.setSelected(true);
      // detail stock data refresh
      var item = this.getItem(cell.getId());
      if (item) {
        this.changeDetailInfo(item);
      } else {
        tau.log(cell.getId() + ' item이 없습니다. ');
      }
    }
  },
  
  handleDismiss: function (e, payload) {
    this.dismissModal(true);
    if (payload) {
      var table = this.getTable();
      table.removeComponents(true);
      table.loadModel();
    }
  }
});