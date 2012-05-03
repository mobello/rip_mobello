/**
 * 
 */
$class('tau.sample.RSS').extend(tau.ui.SequenceNavigator).define({
  init: function () {
    var tableCtrl = new tau.sample.RSSTableController({title: 'Bloter.net'});
    this.setRootController(tableCtrl);
  }
});

/**
 * 
 */
$class('tau.sample.RSSTableController').extend(tau.ui.TableSceneController).define({
  
  /**
   * 
   */
  RSSTableController: function () {
    this.feeds = null;
  },
  
  /**
   * 
   */
  init: function () {
    tau.sample.RSSTableController.$super.init.apply(this, arguments);
    var nav = this.getNavigationBar();
    nav.setBackButtonText('리스트 보기');
  },
  
  /**
   * 
   */
  loadScene: function () {
    var table = new tau.ui.Table({moreCell: true, listSize: 10});
    this.getScene().add(table);
  },
  
  /**
   * 
   * @param start
   * @param size
   * @returns {Number}
   */
  loadModel: function (start, size) {
    var table = this.getTable(),
          yql = 'http://query.yahooapis.com/v1/public/yql?q=',
          rssUrl = 'http://feeds.feedburner.com/Bloter?format=xml';
    var url = yql + encodeURIComponent('select * from xml where url="' + rssUrl + '"') + '&format=json';         
 
    if (!this.feeds) {
      function loaded(resp) {
        if (resp.status === 200 && resp.responseJSON && resp.responseJSON.query) {
          var doc = resp.responseJSON.query.results;
          if (!doc) {
            throw new Error('Unable to fetch RSS feed from ' + url);
          }
          this.feeds = doc.rss.channel.item;
          table.addNumOfCells(size);
        } else {
          alert('Error: ' + resp.statusText);
        }
      };
      tau.req({
        type: 'JSONP',
        url: url,
        callbackFn: tau.ctxAware(loaded, this)
      }).send();
    } else {
      size = (start < this.feeds.length) ? size : 0;
      table.addNumOfCells(size);
    }
    return -1;
  },
  
  /**
   * 
   * @param index
   * @param offset
   * @returns {tau.ui.TableCell}
   */
  makeTableCell: function (index, offset) {
    var imgView,
        cell = new tau.ui.TableCell({styleClass: {size: 'auto'}}),
        data = this.feeds[offset + index];
    cell.setTitle(data.title);
    cell.setSubTitle(data.description);
    imgView = new tau.ui.ImageView({
      src: 'http://www.feedburner.com/fb/feed-styles/images/itemqube2.gif',
      styles: {width: '16px', height: '16px'}
    });
    cell.setLeftItem(imgView);
    return cell;
  },
  
  /**
   * 
   * @param current
   * @param before
   */
  cellSelected: function (current, before) {
    var path, title, detail,
        table = this.getTable();
    if (current instanceof tau.ui.TableCell) {
      path = table.indexOf(current).pop(); // index is array
      title = (path + 1) + " of " + table.getNumberOfCells();
      detail = new tau.sample.RSSDeatilController({'title': title, 'model': this.feeds[path]});
      this.getParent().pushController(detail); 
    }
  },
  
  /**
   * 
   */
  destroy: function () {
    this.feeds = null;
  }
});

/**
 * RSSFeed sample application class
 */
$class('tau.sample.RSSDeatilController').extend(tau.ui.SceneController).define({
  
  setModel: function (model) {
    this.model = model;
  },

  loadScene: function () { 
    var link = new tau.ui.LinkUrl();
    link.setStyle('height', '60px');
    link.setTitle(this.model.title);
    link.setUrl(this.model.link);
    link.setSubTitle(this.model.creator + '<br/>'+ this.model.pubDate);

    var textView = new tau.ui.TextView();  
    textView.setStyle('top', '60px');
    textView.setText(this.model.encoded);

    // scene에 TextView컴포넌트를 추가한다.
    this.getScene().add(link);
    this.getScene().add(textView); 
  }
});