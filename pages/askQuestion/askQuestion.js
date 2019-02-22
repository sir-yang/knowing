let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        typeTabArr: [],
        typeTab: 0,
        imgList: [],
        contentVal: '',
        moneyData: [],
        moneyVal: '',
        moneyIndex: 0
    },

    state: {
        imgArr: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.requestGetCate();
    },

    // 事件
    askQuestionEvent(event) {
        let that = this;
        let dataset = event.currentTarget.dataset;
        if (dataset.types === 'typeTab') {
            if (dataset.index == that.data.typeTab) return;
            that.setData({
                typeTab: dataset.index
            })
        } else if (dataset.types === 'upload') {
            let imgList = that.data.imgList;
            let imgListArr = that.state.imgArr;
            if (imgList.length >= 12) {
                common.showClickModal('请先删除部分图片');
                return false;
            }
            common.uploadImg((12 - imgList.length), (photoUrl, tempFilePaths) => {
                tempFilePaths.forEach((url) => {
                    imgList.push(url);
                });

                photoUrl.forEach((obj) => {
                    //console.log(JSON.parse(obj.data).key);
                    let img = JSON.parse(obj.data).key;
                    imgListArr.push(img);
                });

                that.state.imgArr = imgListArr;
                that.setData({
                    imgList
                });
            });
        } else if (dataset.types === 'removeImg') {
            let imgList = that.data.imgList;
            let imgArr = that.state.imgArr;
            let index = dataset.index;
            imgList.splice(index, 1);
            imgArr.splice(index, 1);
            that.state.imgArr = imgArr;
            that.setData({
                imgList
            })
        } else if (dataset.types === 'content') {
            that.setData({
                contentVal: event.detail.value
            })
        } else if (dataset.types === 'money') {
            if (dataset.index == that.data.moneyIndex) return;
            that.setData({
                moneyIndex: dataset.index,
                moneyVal: ''
            })
        } else if (dataset.types === 'temporary') { //暂存
            let data = that.getSubmitVal();
            console.log(data);
            if (!data) return;

            data.typeTab = that.data.typeTab;
            data.imgArr = that.data.imgList;
            data.moneyIndex = that.data.moneyIndex;
            let vals = {
                type: 1,
                data
            }

            wx.showLoading({
                title: '数据保存中...',
                mask: true
            })
            // 调用暂存
            common.requestCache(that, vals);
        } else if (dataset.types === 'submit') { //提交
            let vals = that.getSubmitVal();
            if (!vals) return;
            vals.wx_form_id = event.detail.formId;
            this.requestSubmit(vals);
        } else if (dataset.types === 'moneyIpt') {
            let m = event.detail.value
            if (m > this.data.getMoney.ask_money) {
                common.showClickModal("提问金额不能大于" + this.data.getMoney.ask_money);
                m = this.data.getMoney.ask_money
            }
            that.setData({
                moneyVal: m
            })
        }
    },

    // 其他金额获取焦点
    focusIpt() {
        this.setData({
            moneyIndex: -1
        })
    },
    // 获取数据
    getSubmitVal() {
        let that = this;
        let typeTabArr = that.data.typeTabArr;
        let typeTab = that.data.typeTab;
        let data = {
            type: typeTabArr[typeTab].id
        }

        if (that.data.imgList.length > 0) {
            data.qImg = that.state.imgArr;
        }
        if (that.data.contentVal == '') {
            common.showTimeToast('请填写提问内容');
            return false;
        }
        data.question = that.data.contentVal;

        if (that.data.moneyIndex != -1) {
            let moneyData = that.data.moneyData;
            data.askMoney = moneyData[that.data.moneyIndex];
        } else {
            if (that.data.moneyVal == '') {
                common.showTimeToast('请选择围观金额');
                return false;
            }
            data.askMoney = that.data.moneyVal;
        }
        return data;
    },

    // 调用分类
    requestGetCate() {
        let that = this;
        let data = {
            type: 1
        }
        common.requestCate(data, (res) => {
            // 获取提问金额
            common.requestGetMoney(that);
            if (res.result === 'success') {
                that.setData({
                    typeTabArr: res.results
                })

                // 调用缓存
                common.requestGetCache(that, {
                    type: 1
                }, (da) => {
                    console.log(da);
                    if (da) {
                        if (da.status == 1) {
                            let askData = da.content.data;
                            if (askData) {
                                that.setData({
                                    typeTab: askData.typeTab,
                                    imgList: askData.imgArr,
                                    contentVal: askData.question,
                                    moneyIndex: askData.moneyIndex,
                                    moneyVal: askData.moneyIndex == -1 ? askData.askMoney : ''
                                })
                                that.state.imgArr = askData.qImg;
                            }
                        }
                    }
                });
            } else {
                common.showClickModal(res.msg);
            }
        })
    },

    // 提交
    requestSubmit(vals) {
        let that = this;
        let url = 'api/Answer/save';
        wx.showLoading({
            title: '',
            mask: true
        })
        util.httpRequest(url, vals, 'POST').then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                if (Number(vals.askMoney) > 0) {
                    common.requestPay(res.results, (status, res_1) => {
                        if (status == 'success') {
                            wx.showModal({
                                title: '提示',
                                content: '支付成功',
                                showCancel: false,
                                success() {
                                    wx.navigateBack({})
                                }
                            })
                        } else {
                            common.showClickModal('支付失败');
                        }
                    })
                } else {
                    wx.showModal({
                        title: '提示',
                        content: '提问成功',
                        showCancel: false,
                        success() {
                            wx.navigateBack({})
                        }
                    })
                }
            } else {
                common.showClickModal(res.msg);
            }
        })
    }
})