let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        applyData: [{
            id: 3,
            name: "课程知士"
        }, {
            id: 5,
            name: "问答知士"
        }, {
            id: 7,
            name: "知享圈知士"
        }],
        tapIndex: 0
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

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    // 事件
    applyEvent(event) {
        let dataset = event.currentTarget.dataset;
        if (dataset.types === 'choose') {
            let that = this;
            wx.showActionSheet({
                itemList: ["课程知士", "问答知士", "知享圈知士"],
                success(res) {
                    console.log(res.tapIndex);
                    that.setData({
                        tapIndex: res.tapIndex
                    })
                }
            })
        } else if (dataset.types === 'submit') {
            let vals = event.detail.value;
            let applyData = this.data.applyData;
            let tapIndex = this.data.tapIndex;
            if (common.isNull(vals.name)) {
                common.showTimeToast('请输入姓名');
                return false;
            }
            if (common.isNull(vals.phone)) {
                common.showTimeToast('请输入本人手机号');
                return false;
            }
            if (!common.isNull(vals.recommend) && common.isNull(vals.tel)) {
                common.showTimeToast('请输入推荐人手机号');
                return false;
            }
            if (common.isNull(vals.recommend) && !common.isNull(vals.tel)) {
                common.showTimeToast('请输入推荐人姓名');
                return false;
            }
            vals.type = applyData[tapIndex].id;
            vals.wx_form_id = event.detail.formId;

            if (this.data.userInfo.status == applyData[tapIndex]) {
                common.showTimeToast('您已是' + applyData[tapIndex].name);
                return false;
            }
            wx.showLoading({
                title: '正在提交...',
                mask: true
            })
            this.requestApply(vals);
        }
    },

    // 申请接口
    requestApply(vals) {
        let that = this;
        let url = 'api/Apply/save';
        let data = {
            name: vals.name,
            phone: vals.phone,
            type: vals.type,
            wx_form_id: vals.wx_form_id
        }
        if (!common.isNull(vals.recommend)) {
            data.recommend = vals.recommend;
            data.tel = vals.tel;
        }
        util.httpRequest(url, data, 'POST').then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                wx.showModal({
                    title: '提示',
                    content: res.msg,
                    showCancel: false,
                    success() {
                        wx.navigateBack({})
                    }
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    }

})