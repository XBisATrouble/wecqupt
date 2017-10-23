//map.js
//获取应用实例 
var app = getApp();

Page({
	data: {
		header: {
			defaultValue: '',
			inputValue: '',
			help_status: false
		},
		listCan: [],
		listCant: [],
		first: 1,
		flagCan: 0,
		flagCant: 0
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
			url: app._server + '/api/library/get_map.php',
			method: 'POST',
			data: app.key({
				bid: options.id
			}),
			success: function(res) {

				if(res.data && res.data.status === 200) {
					var list = res.data.data;
					var m = 0, n = 0;
					var list_can = [], list_cant = [];
					for(var i = 0; i < list.length; i++){
						if(list[i].state == 1){
							list_can[m] = list[i];
							m++;
						}else {
							list_cant[n] = list[i];
							n++;
						}
					}
					if(list_can.length != 0){
						_this.setData({
							'flagCan': 1
						});
					}						
					if(list_cant.length != 0){
						_this.setData({
							'flagCant': 1
						});
					}						
					_this.setData({
						'listCan': list_can,
						'listCant': list_cant
					});
				}else{
					app.showErrorModal(res.data.message);
				}
			},
			fail: function(res) {
				app.showErrorModal(res.errMsg);
			}
		});
	}
});