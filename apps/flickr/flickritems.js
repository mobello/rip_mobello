/**
 * Class for Flickr
 */
$class('tau.sample.fr.FlickrItems').define({
  FlickrItems: function (data) {
    this.data = data;
  },

  /**
   * 
   */
  getCount: function () {
    return (this.data.items) ? this.data.items.length : -1;
  },
  
  /**
   * 
   */
  getItem: function (idx) {
    return this.data.items[idx];
  },
  
  /**
   * 
   */
  getItems: function () {
    return this.data.items;
  }
});