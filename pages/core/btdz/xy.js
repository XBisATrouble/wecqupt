// xy.js
// 获取应用实例
var app = getApp();
Page({
  data: {
    list: [],
    academyName: '',
    first: 1
  },

  togglePage: function (e) {
    var id = e.currentTarget.id, data = {};
    data.show = [];
    for (var i = 0, len = this.data.class.length; i < len; i++) {
        data.show[i] = false;
    }
    if(this.data.first){
      this.setData(data);
      this.data.first = 0;
    }
    data.show[id] = !this.data.show[id];
    this.setData(data);
  },

  // 展示考试详情
  slideDetail: function(e) {
    var id = e.currentTarget.dataset.id, 
        list = this.data.list;
    // 每次点击都将当前open换为相反的状态并更新到视图，视图根据open的值来切换css
    for (var i = 0, len = list.length; i < len; ++i) {
      if (i == id) {
        list[i].open = !list[i].open;
      } else {
        list[i].open = false;
      }
    }
    this.setData({
      list: list
    });
  },

  loginHandler: function (options) {
    if(options.key){
      this.setData({
        'main.mainDisplay': false,
        'header.defaultValue': options.key,
        'header.inputValue': options.key
      });
      this.search();
    }
  },

  onLoad: function(options){
    var _this = this;
    app.loginLoad(function(){
      _this.loginHandler.call(_this, options);
    });    
    wx.request({
      url: app._server + '/api/btdz/get_club.php',
      data: options,
      success: function(res) {
        if(res.data && parseInt(res.data.status) === 200){
          var list = res.data.data;  
          var academyName = list[0].academy_name;            
          _this.setData({
            'list': list,
            'academyName': academyName
          });          
        }
        else{
          app.showErrorModal(res.data.message);
        }
      },
      fail: function(res) {
        app.showErrorModal(res.errMsg);
      }
    });
  }

});