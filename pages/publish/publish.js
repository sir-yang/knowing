Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabIndex: 0,
        tutorTk: 'hide',//导师选择弹框
        checkList: [{
                id: 1,
                value: "导师1"
            },
            {
                id: 2,
                value: "导师2"
            },
            {
                id: 3,
                value: "导师3"
            },
            {
                id: 4,
                value: "导师4"
            },
            {
                id: 5,
                value: "导师5"
            },
        ]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },

    // 事件
    publishEvent(event) {
        let dataset = event.currentTarget.dataset;
        if (dataset.types === 'tab') {
            if (dataset.index == this.data.tabIndex) return;
            this.setData({
                tabIndex: dataset.index
            })
        } else if (dataset.types === 'tutor') {
            let checkList = this.data.checkList;
            let index = dataset.index;
            let leng = 0;
            checkList.forEach((item) => {
                if (item.checked && !checkList[index].checked) {
                    leng += 1;
                }
            })
            if (leng > 2) {
                wx.showToast({
                    title: '最多选择3个导师',
                    icon: 'none'
                })
                return false;
            }
            if (checkList[index].checked) {
                checkList[index].checked = false;
            } else {
                checkList[index].checked = true;
            }
            this.setData({
                checkList
            })
        } else if (dataset.types === 'removeTutor') {
            let checkList = this.data.checkList;
            let id = dataset.id;
            checkList.forEach((item) => {
                if (item.id == id) {
                    item.checked = false;
                }
            })
            this.setData({
                checkList
            })
        } else if (dataset.types === 'closeTk') {
            this.setData({
                tutorTk: 'hide'
            })
        } else if (dataset.types === 'showTutor'){
            this.setData({
                tutorTk: 'show'
            })
        }
    },

    checkboxChange(e) {
        console.log(e);
        if (e.detail.value.length > 3) {
            wx.showToast({
                title: '最多选择3个',
                icon: ''
            })
        }
    }
})