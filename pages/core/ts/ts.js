//ts.js
//获取应用实例
var app = getApp();

Page({
  data: {
    header: {
      defaultValue: '',
      inputValue: '',
      help_status: false
    },
    main: {
      mainDisplay: true, // main 显示的变化标识
      total: 0,
      sum: 0,
      page: 0,
      message: '上滑加载更多'
    },
    testData: [],
    messageObj: { // 查询失败的提示信息展示对象
      messageDisplay: true,
      message: '' 
    },
    hotBook: [],
    hotDisplay: false
  },

  bindClearSearchTap: function (e) {
    this.setData({
      'main.mainDisplay': true,
      'main.total': 0,
      'main.sum': 0,
      'main.page': 0,
      'main.message': '上滑加载更多',
      'testData': [],
      'header.inputValue': '',
      'hotDisplay': false,
      'messageObj.messageDisplay': true
    });
  },

  bindSearchInput: function(e) {
    this.setData({
      'header.inputValue': e.detail.value,
      'main.total': 0,
      'main.sum': 0,
      'main.page': 0,
      'main.message': '上滑加载更多',
      'testData': []
    });
    if(!this.data.messageObj.messageDisplay){
      this.setData({
        'messageObj.messageDisplay': true,
        'messageObj.message': ''
      });
    }
    return e.detail.value;
  },

  // 点击搜索
  bindConfirmSearchTap: function () {
    this.setData({
      'main.total': 0,
      'main.sum': 0,
      'main.page': 0,
      'main.message': '上滑加载更多',
      'testData': []
    });
    this.search();
  },

  // 上滑加载更多
  onReachBottom: function(){
    if(this.data.main.message != '已全部加载' && this.data.main.message != '正在加载中'){
      this.search();
    }
  },

  // 搜索
  search: function (key) {

    var that = this,
        inputValue = key || that.data.header.inputValue,
        messageDisplay = false,
        message = '',
        reDdata = null,
        numberSign = false; // 用户输入的是姓名还是学号的标识
      
    // 消除字符串首尾的空格
    function trim(str) {

      return str.replace(/(^\s*)|(\s*$)/g, '');
    }

    inputValue = trim(inputValue);

    // 抽离对messageObj的设置成一个单独的函数
    function setMessageObj(messageDisplay, message) {

      that.setData({
        'messageObj.messageDisplay': messageDisplay,
        'messageObj.message': message
      });
    }

    // 对输入的是空格或未进行输入进行处理
    if (inputValue === '') {

      this.setData({
        'main.mainDisplay': true
      });

      return false;
    }

    // 防止注入攻击
    function checkData(v) {

        var temp = v;
          
        v = v.replace(/\\|\/|\.|\'|\"|\<|\>/g, function (str) { return ''; });
        v = trim(v);

        messageDisplay = v.length < temp.length ? false : true;
        message = '请勿输入非法字符!';

        return v;
    }

    // 对输入进行过滤
    inputValue = checkData(inputValue);

    setMessageObj(messageDisplay, message);
    this.setData({
       'header.inputValue': inputValue
    });

    // 存在非法输入只会提示错误消息而不会发送搜索请求
    if (messageDisplay === false) { 
      return false;
    }

    // 对输入类型进行处理 inputValue:String
    if (!isNaN(parseInt(inputValue, 10))) {

      numberSign = true;
    }

    // 处理成功返回的数据
    function doSuccess(data, messageDisplay) {

      var rows = data.data;
      //console.log(data,rows)

      // 对数据进行自定义加工 给每个数据对象添加一些自定义属性
      function doData(data) {
        if (data === null) {
          doFail();
          return false;
        }
        var curData = null,
            curSm = null,
            //curIsbn = null,
            len = data.length;
        // 若查询没有查出结果，则直接显示提示信息并退出
        

        // 对书名的匹配部分进行高亮划分
        function doBookName(str, bookName) {

          var activeName = '',
              arrSm = bookName.split(''),
              strIndex = bookName.indexOf(str),
              strLength = str.length;
          if(strIndex == -1){
            return {
              activeName: '',
              bookName: bookName
            };
          }else{
            activeName = bookName.substr(strIndex, strLength);
            arrSm.splice(strIndex, strLength);
            bookName = arrSm.join('');

            return {
              activeName: activeName || '',
              bookName: bookName || ''
            };
          }
        }

        // 对ISBN的匹配部分进行高亮划分
        // function doIsbn(str, isbn) {

        //   var activeIsbn = '',
        //       arrIsbn = isbn.split(''),
        //       strIndex = isbn.indexOf(str),
        //       strLength = str.length;
        //   if(strIndex == -1){
        //     return {
        //       activeIsbn: '',
        //       isbn: isbn
        //     };
        //   }else{
        //     activeIsbn = isbn.substr(strIndex, strLength);
        //     arrIsbn.splice(strIndex, strLength);
        //     isbn = arrIsbn.join('');

        //     return {
        //       activeIsbn: activeIsbn || '',
        //       isbn: isbn || ''
        //     };
        //   }
        // }

        for (var i = 0; i < len; i++) {

          curData = data[ i ];
          curSm = numberSign ? curData.bookName : doBookName(inputValue, curData.bookName);
          //curIsbn = !numberSign ? curData.isbn : doIsbn(inputValue, curData.isbn);
          curData.display = false; // 添加控制隐藏列表信息显示的标识
          curData.headImg = curData.headImg || '/images/core/ts.png';
          curData.activeName =  curSm.activeName || '';
          //curData.activeIsbn =  curIsbn.activeIsbn || '';
          curData.normalSm =  numberSign ? curSm : curSm.bookName;
          //curData.normalIsbn =  !numberSign ? curIsbn : curIsbn.isbn;
        }
        data[0].display = true; //第一条自动展开

        return data;
      }
     
      reDdata = doData(rows);
      
      //若reDdata===false, 查询没有结果
      if (reDdata === false) {
        return false;
      }
      that.setData({
        'testData': that.data.testData.concat(reDdata),
        'main.mainDisplay': false,
        'main.total': data.data.length,
        'main.sum': that.data.main.sum + data.data.length,
        'messageObj.messageDisplay': messageDisplay,
        'main.message': '已全部加载',
        'hotDisplay': true
      });
      wx.hideToast();

      // if (reDdata.length === 1) {
      //   that.bindOpenList(0);
      // }
      // if(data.total <= that.data.main.sum) {
      //   that.setData({
      //     'main.message': '已全部加载'
      //   });
      // }


    }
    
    // 处理没找到搜索到结果或错误情况
    function doFail(err) {

      var message = typeof err === 'undefined' ? '未搜索到相关结果' : err;
      that.setData({
        'hotDisplay': true
      });
      setMessageObj(false, message);
      wx.hideToast();
    }
    
    that.setData({
      'main.message': '正在加载中',
      'main.page': that.data.main.page + 1
    });
    app.showLoadToast();
    wx.request({
      url: app._server + '/api/library/get_bookinfo.php',
      method: 'POST',
      data: app.key({
        title: inputValue,
        page: that.data.main.page
      }),
      success: function(res) {
        
        if(res.data && res.data.status === 200) {          
          doSuccess(res.data, true);
          //console.log(res.data.data.length)
        }else{

          app.showErrorModal(res.data.message);
          doFail(res.data.message);
        }
      },
      fail: function(res) {
        
        app.showErrorModal(res.errMsg);
        doFail(res.errMsg);
      }
    });

  },

  // main——最优
  // 展开列表详情
  bindOpenList: function (e) {
    var index = !isNaN(e) ? e : parseInt(e.currentTarget.dataset.index),
        data = {};

    for(var i = 0; i < this.data.testData.length; i++){
      if(i == index){
        data['testData['+i+'].display'] = !this.data.testData[index].display;
      }
      else{
        data['testData['+i+'].display'] = false;      
      }      
    }    
    this.setData(data);
  },
  //分享
  onShareAppMessage: function(){
    return {
      title: '图书分享',
      desc: 'We重邮 - 图书查询',
      path: '/pages/core/ts/ts'
    };
  },

  onLoad: function(options){
    var _this = this;
    app.loginLoad(function(){
      _this.loginHandler.call(_this, options);
    });
    wx.request({
      url: app._server + '/api/library/get_hot_books.php',
      method: 'POST',
      data:'',
      success: function(res) {
        if(res.data && res.data.status === 200) {
          var hotBook = res.data.data;

          _this.setData({
            'hotBook': hotBook
          });
        }else{
          app.showErrorModal(res.data.message);
        }
      },
      fail: function(res) {
        app.showErrorModal(res.errMsg);
      }
    });

  },
  //让分享时自动登录
  loginHandler: function (options) {
    if(options.key){
      this.setData({
        'main.mainDisplay': false,
        'header.defaultValue': options.key,
        'header.inputValue': options.key,
        'hotDisplay': true
      });
      this.search();
    }
  },

  tapHelp: function(e){
    if(e.target.id == 'help'){
      this.hideHelp(); 
    }
  },
  showHelp: function(e){
    this.setData({
      'header.help_status': true
    });
  },
  hideHelp: function(e){
    this.setData({
      'header.help_status': false
    });
  }
});