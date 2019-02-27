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
        }],
        schoolList: '',
        schoolIdx: -1,
        collegeList: [],
        collegeIdx: -1,
        educationList: ["学士", "硕士", "博士", "其他"],
        educationIdx: -1
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // wx.showLoading({
        //     title: '请稍后...',
        //     mask: true
        // })
        // common.requestGetCollege(this);
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

    onShow() {
        // this.schoolEvent();
    },

    // 默认数据处理
    schoolEvent() {
        let that = this;
        let schoolList = that.data.schoolList;
        let userInfo = common.getStorage('userInfo');
        let interval = setTimeout(() => {
            if (schoolList && schoolList.length > 0) {
                clearTimeout(interval);
                if (userInfo && userInfo.inform) {
                    if (userInfo.inform.university) {
                        schoolList.forEach((item, index) => {
                            if (item.name == userInfo.inform.university) {
                                let collegeIdx = that.data.collegeIdx;
                                if (userInfo.inform.academy && item.academy.length > 0) {
                                    item.academy.forEach((college, idx) => {
                                        if (college.name == userInfo.inform.academy) {
                                            collegeIdx = idx;
                                        }
                                    })
                                }

                                that.setData({
                                    schoolIdx: index,
                                    collegeList: item.academy,
                                    collegeIdx
                                })
                            }
                        })
                    }
                }
            } else {
                this.schoolEvent();
            }
        }, 1000)
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
            console.log(vals);
            return;

            // 调用接口
            this.requestSaveInfo(vals);
        } else if (dataset.types === 'school') {
            let schoolList = this.data.schoolList;
            this.setData({
                schoolIdx: event.detail.value,
                collegeList: schoolList[event.detail.value].academy,
                collegeIdx: 0
            })
        } else if (dataset.types === 'college') { //选择学院
            this.setData({
                collegeIdx: event.detail.value
            })
        } else if (dataset.types === 'education') {
            this.setData({
                educationIdx: event.detail.value
            })
        }
    },

    // 资料保存
    requestSaveInfo(vals) {
        let that = this;
        let url = 'api/User/save';
        wx.showLoading({
            title: '正在保存...',
            mask: true
        })
        util.httpRequest(url, vals, 'POST').then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                wx.showToast({
                    title: res.msg,
                    icon: 'none',
                    success() {
                        common.getPersonInfo().then((info) => {
                            wx.navigateBack({})
                        })
                    }
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    }
})