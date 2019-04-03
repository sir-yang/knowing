let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let userInfo = common.getStorage('userInfo');
        this.setData({
            userInfo
        })
    },

    // 事件
    settingEvent(event) {
        let dataset = event.currentTarget.dataset;
        let url = '';
        if (dataset.types === 'info') {
            url = '/my/pages/personalInfo/personalInfo';
        } else if (dataset.types === 'customer') { // 客服
            url = '/my/pages/customer/customer';
        } else if (dataset.types === 'about') { // 关于
            url = '/my/pages/about/about';
        } else if (dataset.types === 'invite') { //邀请
            url = '/my/pages/invite/invite';
        } else if (dataset.types === 'sign') { //登出
            this.requestSignOut();
            return;
        }

        wx.navigateTo({
            url
        })
    },

    // 调用登出
    requestSignOut() {
        wx.showModal({
            title: '提示',
            content: "确定退出登录",
            showCancel: true,
            success(_res) {
                if (_res.confirm) {
                    let url = 'api/Login/loginOut';
                    util.httpRequest(url).then((res) => {
                        if (res.result === 'success') {
                            wx.showToast({
                                title: res.msg,
                                icon: 'none',
                                success() {
                                    wx.switchTab({
                                        url: '/pages/enjoyCircle/enjoyCircle'
                                    })
                                }
                            })
                        } else {
                            common.showClickModal(res.msg);
                        }
                    })
                }
            }
        });
    }
})