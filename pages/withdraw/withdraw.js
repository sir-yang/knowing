let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        account: '',
        moneyVal: '0.00',
        wattleType: 0,
        imgUrl: ''
    },

    state: {
        imgArr: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.showLoading({
            title: '请稍后...',
            mask: true
        })
        this.requestGetAccount();
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

    // 事件
    withdrawEvent(event) {
        let dataset = event.currentTarget.dataset;
        if (dataset.types === 'wattleType') {
            if (dataset.index == this.data.wattleType) return;
            let account = this.data.account;
            if ((account.wechat_deposit == 0 && dataset.index == 0) || (account.code_deposit == 0 && dataset.index == 1)) {
                common.showTimeToast('暂不支持该类型');
                return false;
            }
            this.setData({
                wattleType: dataset.index
            })
        } else if (dataset.types === 'withdrawAll') {//全部提现
            let account = this.data.account;
            this.setData({
                moneyVal: account.remainMoney
            })
        } else if (dataset.types === 'upload') { //上传
            if (this.data.wattleType == 0) {
                common.showTimeToast('仅支持线下提现');
                return false;
            }
            let that = this;
            let imgListArr = [];
            common.uploadImg(1, (photoUrl, tempFilePaths) => {
                photoUrl.forEach((obj) => {
                    // console.log(JSON.parse(obj.data).key);
                    let img = JSON.parse(obj.data).key;
                    imgListArr.push(img);
                });

                that.state.imgArr = imgListArr;
                that.setData({
                    imgUrl: tempFilePaths
                });
            });
        } else if (dataset.types === 'remove') { //删除图片
            this.setData({
                imgUrl: '',
            })
            this.state.imgArr = [];
        }  else if (dataset.types === 'submit') {
            let vals = event.detail.value;
            if (common.isNull(vals.money) || isNaN(vals.money)) {
                common.showTimeToast('请输入正确金额');
                return false;
            }
            vals.type = this.data.wattleType == 0 ? 1 : 2;
            let imgUrl = this.data.imgUrl;
            if (this.data.wattleType == 1) {
                if (common.isNull(imgUrl)) {
                    common.showTimeToast('请上传收款码');
                    return false;
                }

                if (imgUrl.indexOf('http') === -1) {
                    vals.qrCode = this.state.imgArr;
                }
            }

            // 调用接口
            this.requestWithdraw(vals);
        }
    },

    // 个人账户
    requestGetAccount() {
        let that = this;
        let url = 'api/Account/getPage';
        util.httpRequest(url).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                let imgUrl = that.data.imgUrl;
                if (res.results.qrCode) {
                    imgUrl = res.results.qrCode;
                }
                that.setData({
                    account: res.results,
                    imgUrl
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    },

    // 提现
    requestWithdraw(vals) {
        let that = this;
        let url = 'api/Account/deposit';
        util.httpRequest(url, vals, 'POST').then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                
            } else {
                common.showClickModal(res.msg);
            }
        })
    }

})