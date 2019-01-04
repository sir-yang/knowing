// pages/withdraw/withdraw.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        wattleType: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    // 事件
    withdrawEvent(event) {
        let dataset = event.currentTarget.dataset;
        if (dataset.types === 'wattleType') {
            if (dataset.index == this.data.wattleType) return;
            this.setData({
                wattleType: dataset.index
            })
        } else if (dataset.types === 'withdrawAll') {//全部提现

        } else if (dataset.types === 'upload') { //上传
            
        }
    }

})