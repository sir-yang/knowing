let common = getApp().globalData.commonFun;
let util = getApp().globalData.utilFun;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        requestStatus: false,
        pageName: 'my',
        userInfo: '',
        logo: '',

        // 登录注册相关
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

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        wx.showLoading({
            title: '请稍后...',
            mask: true
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        let that = this;
        that.setData({
            requestStatus: false,
            loginRegistTk: 'hide',
            showLogin: 'hide',
            showPerfect: ['hide', 'hide', 'hide', 'hide'],
            phoneVal: '',
            passwordVal: '',
            codeVal: ''
        })

        common.isLoginRegist(that, (info) => {
            wx.hideLoading();
            if (info.statusId == 1) {
                that.setData({
                    userInfo: info,
                    requestStatus: true
                })
                // 消息状态
                common.requestMessage(that);
            }
        });
    },

    // ==============  登录 注册  ============ //
    loginRegistEvent(event) {
        common.loginRegistEvent(event, this);
    },

    // 事件
    myEvent(event) {
        let dataset = event.currentTarget.dataset;
        let url = '';
        if (dataset.types === 'share') {//分享
            url = '/pages/shareList/shareList';
        } else if (dataset.types === 'reply') {//回答
            url = '/pages/myReply/myReply';
        } else if (dataset.types === 'fans') {//粉丝
            url = '/pages/attentionList/attentionList?status=1';
        } else if (dataset.types === 'attention') {//关注
            url = '/pages/attentionList/attentionList?status=2';
        } else if (dataset.types === 'wenda') {//问答
            url = '/pages/wenda/wenda';
        } else if (dataset.types === 'wallet') {//钱包
            url = '/pages/wallet/wallet';
        } else if (dataset.types === 'apply') {//申请
            url = '/pages/apply/apply';
        } else if (dataset.types === 'set') {//设置
            url = '/pages/setting/setting';
        } else if (dataset.types === 'wenda') {//问答
            url = '/pages/wallet/wallet';
        } else if (dataset.types === "invite") {
            url = "/pages/invite/invite"
        } else if (dataset.types === 'avatar') { //更换头像
            let that = this;
            wx.showModal({
                title: '提示',
                content: '是否更换头像？',
                success(res) {
                    if (res.confirm) {
                        let logo = '';
                        let logoImg = '';
                        common.uploadImg(1, (photoUrl, tempFilePaths) => {
                            tempFilePaths.forEach((url) => {
                                logo = url;
                            });

                            photoUrl.forEach((obj) => {
                                //console.log(JSON.parse(obj.data).key);
                                let img = JSON.parse(obj.data).key;
                                logoImg = img;
                            });
                            
                            that.uplodFace(logoImg, logo);
                        });
                    }
                }
            })
            return;
        }

        wx.navigateTo({
            url
        })
    },

    // 修改头像
    uplodFace(logoImg, logo) {
        let that =  this;
        let url = 'api/User/face';
        util.httpRequest(url, {
            avatarUrl: logoImg
        }, 'POST').then((res) => {
            if (res.result === 'success') {
                that.setData({
                    logo
                });
                wx.showToast({
                    title: res.msg,
                    icon: 'none'
                })
            } else {
                common.showClickModal(res.msg);
            }
        })
    }


})