let common = getApp().globalData.commonFun;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        wx.showLoading({
            title: '请稍后...',
            mask: true
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        let that = this;
        let token = common.getAccessToken();
        if (token) {
            common.getPersonInfo().then((info) => {
                wx.hideLoading();
                that.setData({
                    userInfo: info
                })
            })
        } else {
            getApp().globalData.tokenUpdated = function () {
                console.log('update success');
                common.getPersonInfo().then((info) => {
                    wx.hideLoading();
                    console.log(info);
                    that.setData({
                        userInfo: info
                    })
                })
            };
        }
    },

    // 事件
    myEvent(event) {
        let dataset = event.currentTarget.dataset;
        let url = '';
        if (dataset.types === 'share') {//分享
            url = '/pages/shareList/shareList';
        } else if (dataset.types === 'reply') {//回答
            url = '/pages/myReply/myReply';
        } else if (dataset.types === 'fans') {//粉丝
            url = '/pages/attentionList/attentionList?status=1';
        } else if (dataset.types === 'attention') {//关注
            url = '/pages/attentionList/attentionList?status=2';
        } else if (dataset.types === 'wenda') {//问答
            url = '/pages/wenda/wenda';
        } else if (dataset.types === 'wallet') {//钱包
            url = '/pages/wallet/wallet';
        } else if (dataset.types === 'apply') {//申请
            url = '/pages/apply/apply';
        } else if (dataset.types === 'set') {//设置
            url = '/pages/setting/setting';
        } else if (dataset.types === 'wenda') {//问答
            url = '/pages/wallet/wallet';
        }

        wx.navigateTo({
            url
        })
    }


})