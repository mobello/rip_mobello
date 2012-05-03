/**
 * rss.js   1.0.0   2010. 6. 16.
 * @author genie(genie@ktinnotz.com)
 *
 * Copyright 2010 KT Innotz, Inc. All rights reserved.
 * KT INNOTZ PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 */


/**
 * RSS Feed class
 */
$class('tau.sample.RSSFeed').define({
  /**
   * Constructor, requires rss xml document
   */
  RSSFeed: function (rss) {
    var channel = rss .getElementsByTagName("channel")[0];
    this._asObject(this, channel);
    
    this._items = channel.getElementsByTagName("item");
    // public property for item count
    this.count = this._items.length;
  },
  
/**
 * 지정된 element가 자식 element를 가지고 있는지 조사한다.
   */
  _hasElement: function (el) {
    var children = el.childNodes;
    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeType == 1) {
        return true;
      }
    }
    return false;
  },
  
  /**
   *  특정 element를 JSON 객체로 변환한다.
   */
  _asObject: function (obj, el) {
    var children = el.childNodes;
    for (var i = 0; i < children.length; i++) {
      // ELEMENT_TYPE and not item
      if (children[i].nodeType == 1 && children[i].tagName != 'item') {
        if (this._hasElement(children[i])) {
          obj[children[i].tagName] = {};
          this._asObject(obj[children[i].tagName], children[i]);
        } else if (children[i].firstChild) { // leaf node
          obj[children[i].tagName] = children[i].firstChild.nodeValue;
        } else if (children[i].tagName == 'media:thumbnail') {
          var attr = children[i].attributes;
          var value = {};
          for(var j=0; j < attr.length; j++){
            value[attr[j].nodeName] = attr[j].nodeValue;
          }
          obj[children[i].tagName] = value;
        }
      }
    }
    return obj;
  },

  /**
   * 지정된 인덱스의 rss 아이템을 반환한다.
   */
  getItem: function (index) {
    var item = this._items[index];
    return this._asObject({}, item);
  }
});
