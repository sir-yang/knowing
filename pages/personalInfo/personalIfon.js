let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: '',
        tabIndex: 0,
        genderData: [{
            id: 1,
            name: "男"
        }, {
            id: 2,
            name: "女"
        }]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        // wx.showLoading({
        //     title: '请稍后...',
        //     mask: true
        // })
        let userInfo = common.getStorage('userInfo');
        if (userInfo) {
            let tabIndex = this.data.tabIndex;
            tabIndex = userInfo.gender == 1 ? 0 : 1;
            this.setData({
                userInfo,
                tabIndex
            })
        }
    },

    // 事件
    personalEvent(event) {
        let dataset = event.currentTarget.dataset;
        if (dataset.types === 'gender') {
            wx.showActionSheet({
                itemList: ["男", "女"],
                success(res) {
                    tabIndex: res.tabIndex
                }
            })
        } else if (dataset.types === 'submit') {
            let vals = event.detail.value;
            if (common.isNull(vals.name)) {
                common.showTimeToast('请输入真实姓名');
                return false;
            }

            let genderData = this.data.genderData;
            let tabIndex = this.data.tabIndex;
            vals.gender = genderData[tabIndex].id;

            // 调用接口
            this.requestSaveInfo(vals);
        }
    },

    // 资料保存
    requestSaveInfo(vals) {
        let that = this;
        let url = 'api/User/save';
        util.httpRequest(url, vals, 'POST').then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                common.getPersonInfo().then((info) => {})
            } else {
                common.showClickModal(res.msg);
            }
        })
    }
})