let moment = require('moment.min.js');
require('moment.zh-cn.js');

moment.locale('zh-cn');
//格式化时间
const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

function formatTime1(date) {
    return moment(date).format('YYYY-MM-DD HH:mm');
}

// 转换为年月日格式
function getFormatDate(date) {
    return moment(date).format('YYYY.MM.DD');
}

function getFormatDate1(data) {
    return moment(data).format('YYYY-MM-DD');
}

function getFormatDate2(data) {
    let myDate = new Date();
    let hou = myDate.getHours();
    let min = myDate.getMinutes();
    if (hou < 10) {
        hou = '0' + hou;
    }
    if (min < 10) {
        min = '0' + min;
    }
    return hou + ":" + min;
}

// function formatNumber(n) {
//   n = n.toString();
//   return n[1] ? n : '0' + n;
// }


//获取当前时间
function getNowFormatDate() {
    return moment().format('YYYY-MM-DD HH:mm');
}

function getDateDiff(dateStr) {
    return moment(dateStr).fromNow();
}

//兼容IOS获取时间戳
function formatTimeStamp(date) {
    let da = moment(date).format('YYYY-MM-DD HH:mm:ss');
    return new Date(Date.parse(da.replace(/-/g, '/'))).getTime();
}

function getDateDiff1(startTime, endTime, diffType) {
    //将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式 
    startTime = startTime.replace(/\-/g, '/');
    endTime = endTime.replace(/\-/g, '/');
    //将计算间隔类性字符转换为小写
    diffType = diffType.toLowerCase();
    let sTime = new Date(startTime); //开始时间
    let eTime = new Date(endTime); //结束时间
    //作为除数的数字
    let timeType = 1;
    switch (diffType) {
        case 'second':
            timeType = 1000;
            break;
        case 'minute':
            timeType = 1000 * 60;
            break;
        case 'hour':
            timeType = 1000 * 3600;
            break;
        case 'day':
            timeType = 1000 * 3600 * 24;
            break;
        default:
            break;
    }
    return parseInt((eTime.getTime() - sTime.getTime()) / parseInt(timeType));
}


// 时间转换（将秒转换为时分秒格式）
function changeTimeFormat(data) {
    let duration;
    let h = parseInt(data / 3600);
    let m = parseInt((data % 3600) / 60);
    let s = (data % 3600) % 60;

    h = h < 10 ? '0' + h : h;
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    if (parseInt(h) > 0) {
        duration = h + ':' + m + ':' + s;
    } else {
        duration = m + ':' + s;
    }
    return duration;
}

// 格式化手机号
function formatPhoneOnkeyUp(mobile) {
    var value = mobile.replace(/\D/g, '').substring(0, 11);
    var valueLen = value.length;
    if (valueLen > 3 && valueLen < 8) {
        value = `${value.substr(0, 3)} ${value.substr(3)}`;
    } else if (valueLen >= 8) {
        value = `${value.substr(0, 3)} ${value.substr(3, 4)} ${value.substr(7)}`;
    }
    return value;
}

function httpRequest(url, data, method) {
    let m = method || 'GET';
    let d = data || {};
    let accessToken = wx.getStorageSync('token');
    console.log(accessToken)
    if (accessToken) {
        let expireAt = wx.getStorageSync('expire_at');
        let now = Date.parse(new Date());
        if (expireAt) {
            if (now < expireAt) {
                return wx.pro.request({
                    url,
                    data: d,
                    method: m
                });
            }
        }
    }

    //移出token
    wx.removeStorageSync('token');
    wx.removeStorageSync('expire_at');
    return wx.pro.login({}).then((res) => {
        console.log(res.code)
        let val = {
            code: res.code
        }
        let url = 'api/Oauth/createToken';
        return wx.pro.request({
            url,
            data: val,
            method: "POST"
        });
    }).then((res) => {
        console.log(res);
        if (res.result === "success") {
            wx.setStorageSync('token', res.results.token);
            let expireIn = (res.results.token_expire * 1000);
            wx.setStorageSync('expire_at', expireIn);
            return wx.pro.request({
                url,
                data: d,
                method: m
            });
        }
    });
}



module.exports = {
    formatTime1,
    formatTime: formatTime,
    getDateDiff,
    getDateDiff1,
    getNowFormatDate,
    httpRequest,
    //时间转换
    changeTimeFormat,
    getFormatDate,
    getFormatDate1,
    getFormatDate2,
    //手机号转换
    formatPhoneOnkeyUp,
    formatTimeStamp
};