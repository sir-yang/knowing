let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        requestStatus: false,
        info: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.requestConfig();
    },

    // 事件
    customerEvent(event) {
        let dataset = event.currentTarget.dataset;
        let url = '';
        if (dataset.types === 'use') {
            url = '/my/pages/useCoupons/useCoupons';
        } else if (dataset.types === 'error') {
            url = '/my/pages/errorInfo/errorInfo';
        } else if (dataset.types === 'refund') {
            url = '/my/pages/refundIssue/refundIssue';
        } else if (dataset.types === 'apply') {
            url = '/my/pages/applyDesc/applyDesc'; //需要跳转到申请说明界面 需更改
        } else if (dataset.types === 'call') {
            common.phoneCall(this.data.info.phone);
            return;
        }

        wx.navigateTo({
            url
        })
    },

    // 客服信息
    requestConfig() {
        let that = this;
        let url = 'api/Configs/serviceCenter';
        util.httpRequest(url).then((res) => {
            if (res.result === 'success') {
                that.setData({
                    requestStatus: true,
                    info: res.results
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    }

})