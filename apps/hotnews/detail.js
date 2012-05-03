$class('tau.sample.hotnews.DetailController').extend(tau.ui.SceneController).define({
  /**
   * 
   * @param article
   */
  DetailController: function(article) {
    this.article = article;
  },

  /**
   * 
   * @param e
   * @param payload
   */
  popScene: function(e, payload) {
    var parent = this.getParent();
    parent.popController();
  },

  /**
   * 
   */
  sceneLoaded: function() {
    var textView1 = this.getScene().getComponent('textView1');
    if (textView1) {
      textView1.renderer.addStyleRule(textView1.getId(true), 'img',
          'max-width: 100%;');
    }
  }
});