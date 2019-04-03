let common = getApp().globalData.commonFun;
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function(res) {
        let userInfo = common.getStorage('userInfo');
        let url = '/pages/index/index';
        if (res.from === 'button') {
            // 来自页面内转发按钮
            console.log(res.target)
            url = '/pages/index/index?inviteId=' + userInfo.id;
        }
        return {
            title: '',
            path: url
        }
    }
})