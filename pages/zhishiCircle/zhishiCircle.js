let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        requestStatus: false,
        pageName: 'zhishiCircle',
        bannerArr: [],
        tabIndex: -1,
        list: [],
        searchVal: '',
        schoolList: [],
        schoolTab: 0, //顶部学校索引

        // 登录注册相关
        educationList: ["学士", "硕士", "博士", "其他"],
        educationIdx: -1,
        loginRegistTk: 'hide',
        showLogin: 'hide', //登录
        showRegist: 'hide', //注册
        showForget: 'hide', //忘记密码
        showPerfect: ['hide', 'hide', 'hide', 'hide'], //0:完善信息 1:学生 2:教师 3:其他
        identity: 1, //注册角色
        genderId: 1,
        CountdownVal: '发送验证码',
        CountdownTime: 60,
        onClick: true,
        clearTimeout: true,
        phoneVal: '',
        passwordVal: '',
        confirmVal: '',
        codeVal: ''
    },

    state: {
        hasmore: true,
        offset: 0, //从第几条数据开始查询
        limit: 10, //每页条数
        pageOnShow: false,
        isOnReachBottom: true,
        isonPullDownRefresh: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let that = this;
        wx.showLoading({
            title: '请稍后...',
            mask: true
        })

        that.requestGetBanner();
        that.requestGetCate();
        that.requestList(0);
        common.requestGetCollege(that);
    },

    onShow() {
        let that = this;
        common.getPersonInfo().then((userInfo) => {
            if (userInfo) {
                if (userInfo.statusId == 1) { //判断是否调用右上角消息通知
                    common.requestMessage(that);
                }
            }
        })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        this.state.isonPullDownRefresh = true;
        this.state.offset = 0;
        this.state.hasmore = true;
        this.requestList(0);
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        if (this.state.isonPullDownRefresh) return;
        if (!this.state.isOnReachBottom) return;
        if (!this.state.hasmore) return;
        this.state.offset = this.state.offset + this.state.limit;
        this.requestList(this.state.offset);
        this.state.isOnReachBottom = false;
    },

    // ==============  登录 注册  ============ //
    loginRegistEvent(event) {
        common.loginRegistEvent(event, this);
    },

    // 点击事件
    zhishiEvent(event) {
        let dataset = event.currentTarget.dataset;
        if (dataset.types === 'tab') {
            if (dataset.index == this.data.tabIndex) return;
            this.setData({
                tabIndex: dataset.index,
                searchVal: '',
                list: []
            })

            this.state.offset = 0;
            this.requestList(0);
        } else if (dataset.types === 'school') {//学校切换
            this.setData({
                schoolTab: event.detail.value
            })
        } else if (dataset.types === 'ipt') {
            this.setData({
                searchVal: event.detail.value
            })
        } else if (dataset.types === 'search') {
            this.state.offset = 0;
            this.requestList(0);
        } else if (dataset.types === 'message') {
            common.isLoginRegist(this, () => {
                wx.navigateTo({
                    url: '/common/pages/message/message'
                })
            });
        } else if (dataset.types === 'detail') {
            let that = this;
            common.isLoginRegist(that, () => {
                let list = that.data.list;
                let index = dataset.index;
                wx.navigateTo({
                    url: '/zhishi/pages/zhishiDetail/zhishiDetail?id=' + list[index].id
                })
            });
        }
    },

    // 获取banner
    requestGetBanner() {
        let that = this;
        let url = 'api/Configs/banner';
        util.httpRequest(url).then((res) => {
            if (res.result === 'success') {
                that.setData({
                    bannerArr: res.results
                })
            } else {
                common.showClickModal(res.msg);
            }
        });
    },

    // 调用分类接口
    requestGetCate() {
        let that = this;
        let data = {
            type: 3
        }
        common.requestCate(data, (res) => {
            if (res.result === 'success') {
                that.setData({
                    typeTabArr: res.results
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    },

    // 获取知士列表
    requestList(offset) {
        let that = this;
        let url = 'api/User/getPage';
        let data = {
            offset,
            limit: that.state.limit,
        }

        if (that.data.searchVal != '') {
            data.key = that.data.searchVal;
        }

        if (that.data.tabIndex != -1) {
            let typeTabArr = that.data.typeTabArr;
            data.type = typeTabArr[that.data.tabIndex].id;
        }

        // 切换类型是显示
        if (that.state.pageOnShow) {
            wx.showLoading({
                title: '',
                mask: true
            })
        }
        util.httpRequest(url, data).then((res) => {
            wx.hideLoading();
            if (res.result === 'success') {
                let handle = common.dataListHandle(that, res, that.data.list, offset);
                that.setData({
                    requestStatus: true,
                    list: handle.list,
                    hasNext: handle.hasNext
                })
            } else {
                common.showClickModal(res.msg);
            }
        });
    }
})