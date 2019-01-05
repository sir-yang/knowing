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
        moneyVal: '',
        moneyIndex: -1
    },

    state: {
        imgArr: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.requestGetCate();
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

    // 事件
    askQuestionEvent(event) {
        let that = this;
        let dataset = event.currentTarget.dataset;
        if (dataset.types === 'typeTab') {
            if (dataset.index == that.data.typeTab) return; 
            that.setData({
                typeTab: dataset.index
            })
        } else if(dataset.types === 'upload') {
            let imgList = [];
            let imgListArr = [];
            common.uploadImg(9, (photoUrl, tempFilePaths) => {
                tempFilePaths.forEach((url) => {
                    imgList.push(url);
                });

                photoUrl.forEach((obj) => {
                    //console.log(JSON.parse(obj.data).url);
                    let img = {
                        oss_object: JSON.parse(obj.data).url
                    };
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
            imgList = imgList.splice(index, 1);
            imgArr = imgArr.splice(index, 1);
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
            if (data) common.setStorage('askData', data);
        } else if (dataset.types === 'submit') { //提交
            let vals = that.getSubmitVal();
            vals.wx_form_id = event.detail.formId;
            this.requestSubmit(vals);
        } else if (dataset.types === 'moneyIpt') {
            that.setData({
                moneyVal: event.detail.value
            })
        }
    },

    // 获取数据
    getSubmitVal() {
        let that = this;
        let typeTabArr = that.data.typeTabArr;
        let typeTab = that.data.typeTab;
        let data = {
            type: typeTabArr[typeTab].id
        }

        if (that.state.imgArr.length > 0) {
            data.img = that.state.imgArr;
        }
        if (that.data.contentVal != "") {
            data.content = that.data.contentVal;
        }
        if (that.data.moneyIndex == -1 && that.data.moneyVal == '') {
            common.showTimeToast('请选择围观金额');
            return;
        } else {
            data.money = 1;
        }
        return data;
    },

    // 调用分类
    requestGetCate() {
        let that = this;
        common.requestCate((res) => {
            if (res.result === 'success') {
                that.setData({
                    typeTabArr: res.results
                })
                that.requestList(0);
            } else {
                common.showClickModal(res.msg);
            }
        })
    },

    // 提交
    requestSubmit(vals) {
        let that = this;

    }
})