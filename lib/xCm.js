var regex = require('../lib/regex');
var crypto = require('crypto');
var moment = require('moment');
var extend = require('extend');
var path = require('path');
var util = require('util');
var fs = require('fs');

var xCm = {
    xLoop: async function (source, result, callback) {
        var index = 0, preTick = 50;
        var isNumber = Number.isInteger(source);
        var isArray = Array.isArray(source);
        var keys = isArray ? null : Object.keys(source);
        var count = isNumber ? source : (isArray ? source.length : keys.length);
        return new Promise((resolve, reject) => {
            try {
                (function chunk() {
                    if (isArray) { if (source.length == 0) { resolve(result); return; } }
                    var pt = preTick;
                    while (pt--) {
                        if (isNumber) {
                            result = callback(index, source, result);
                        } else {
                            result = callback((isArray ? index : source[keys[index]]), source, result);
                        }
                        index++; if (index >= count) { break; }
                    }
                    if (index < count - 1) { setImmediate(chunk); } else { resolve(result); }
                })();
            } catch (err) { reject(err); }
        });
    },
    fullCopy: function (data) { 
        var t1 = {};
        for (var k in data) { 
            t1[k] = data[k];
        }
        return t1;
    },
    readFilter: function (data, list) { 
        var t1 = {};
        list = list.split(',');
        for (var k in data) { 
            if (list.indexOf(k) > -1) {
                t1[k] = xCm.arrayGetter(data[k]);
            } else { 
                t1[k] = data[k];
            }
        }
        return t1;
    },
    saveFilter: function (data, list) { 
        var t1 = {};
        list = list.split(',');
        for (var k in data) { 
            if (list.indexOf(k) > -1) {
                t1[k] = xCm.arrayFilter(data[k]);
            } else { 
                t1[k] = data[k];
            }
        }
        return t1;
    },
    arrayGetter: function (data) { 
        var t1 = [];
        if (data) { 
            t1 = data.replace(/\{/g, '').replace(/\}/g, '').split(',');
        }
        
        return t1
    },
    arrayFilter: function (data) { 
        var t1 = '';
        if (data.length > 0) { 
            for (var i in data) { 
                if (i > 0) t1 += ',';
                t1 += '{' + data[i] + '}';
            }
        }
        return t1;
    },
    walkSync: function (dir, filelist) {
        var path = path || require('path');
        var fs = fs || require('fs'),
            files = fs.readdirSync(dir);
        filelist = filelist || [];
        files.forEach(function (file) {
            if (fs.statSync(path.join(dir, file)).isDirectory()) {
                filelist = xCm.walkSync(path.join(dir, file), filelist);
            }
            else {
                filelist.push(path.join(dir, file));
            }
        });
        return filelist;
    },
    escForm: function (data, target) { 
        var t1 = {};
        for (var key in data) {
            var found = false;
            for (var i in target) {
                if (key == target[i]) {
                    found = true;
                }
            }
            if (!found) t1[key] = data[key];
        }
        return t1;
    },
    autoQuery: function (tag, data, req) { 
        if (tag) {
            extend(data[tag], req.query);
        } else { 
            extend(data, req.query);
        }
        return data;
    },
    autoForm: function (tag, data, req) { 
        if (tag) {
            extend(data[tag], req.body);
        } else { 
            extend(data, req.body);
        }
        return data;
    },
    getErMsg: function (err, SQL) { 
        var msg = new xCm.MsgShow();
        msg.Error(
            '糟糕了! 系統出現錯誤或故障! 請稍後再試!',
            '我們將竭盡所能盡快解決目前所遇到的問題, 如果問題持續, 請盡快通知我們。<br>' +
            JSON.stringify(err, null, 4).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;') +
            '<br>' + err.message 
        );
        return msg.result;
    },
    PushDelayjQuery: function (code, defer) { 
        defer = defer || false;
        defer = defer ? ' defer="defer"' : '';
        return '<script type="text/javascript"' + defer + '>$(function () { setTimeout(function(){' + code + '}, 500); });</script>';
    },
    MsgShow: function () {
        this.IsEmpty = true;
        this.hasError = false;
        this.result = '';
        this.Success = function (header, text) {
            self.IsEmpty = false;
            self.result += '<div class="alert alert-success"><strong style="font-size: 16px;">' + header + '</strong><br>' + text + '</div>';
        }
        this.Warning = function (header, text) {
            self.IsEmpty = false;
            self.result += '<div class="alert alert-warning"><strong style="font-size: 16px;">' + header + '</strong><br>' + text + '</div>';
        }
        this.Info = function (header, text) {
            self.IsEmpty = false;
            self.result += '<div class="alert alert-info"><strong style="font-size: 16px;">' + header + '</strong><br>' + text + '</div>';
        }
        this.Error = function (header, text) {
            self.hasError = true;
            self.IsEmpty = false;
            self.result += '<div class="alert alert-danger"><strong style="font-size: 16px;">' + header + '</strong><br>' + text + '</div>';
        }
        var self = this;
    },
    CtrlStatus: function () { 
        this.hasError = false;
        this.result = '';
        var onChangeReset = function (id) { 
            self.result += xCm.PushDelayjQuery("$(function(){setTimeout(function(){var b='" + id + "';$('#'+b+',#'+b+' input,#'+b+' select,#'+b+' textarea').one('change keyup',function(){var a=$('#'+b);a.parents('.form-group').removeClass('has-success has-error');if(a.closest('div').hasClass('input-group')){a.closest('div').next('.cs-msg').remove()}else{a.closest('div').find('.cs-msg').remove()}})},500)});");
        }
        this.Tips = function (id, text) { 
            self.result += xCm.PushDelayjQuery("$('#" + id + "').parent().append('<span class=\"text-info\">" + text + "</span>');");
        }
        this.Warning = function (id, text, autoReset) { 
            self.result += xCm.PushDelayjQuery("$(function(){setTimeout(function(){var a=$('#" + id + "'),b='text-warning';if(a.closest('div').hasClass('input-group')){a.closest('div').after('<span class=\"cs-msg '+b+'\">" + text + "</span>')}else{a.closest('div').append('<span class=\"cs-msg '+b+'\">" + text + "</span>')}},500)});");
            if (autoReset) onChangeReset(id);
        }
        this.Success = function (id, text, autoReset) { 
            self.result += xCm.PushDelayjQuery("$(function(){setTimeout(function(){var a=$('#" + id + "'),b='text-success';if(a.closest('div').hasClass('input-group')){a.closest('div').after('<span class=\"cs-msg '+b+'\">" + text + "</span>')}else{a.closest('div').append('<span class=\"cs-msg '+b+'\">" + text + "</span>')}},500)});");
            if (autoReset) onChangeReset(id);
        }
        this.Error = function (id, text, autoReset) { 
            self.hasError = true;
            self.result += xCm.PushDelayjQuery("$(function(){setTimeout(function(){var a=$('#" + id + "'),b='text-danger';a.parents('.form-group').addClass('has-error');if(a.closest('div').hasClass('input-group')){a.closest('div').after('<span class=\"cs-msg '+b+'\">" + text + "</span>')}else{a.closest('div').append('<span class=\"cs-msg '+b+'\">" + text + "</span>')}},500)});");
            if (autoReset) onChangeReset(id);
        }
        var self = this;
    },
    numberABC: function (number) {
        return 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z'.split(',')[parseInt(number)];
    },
    enDES: function (plaintext, iv) {
        var key = new Buffer('nW4*G29J');
        var iv = new Buffer(iv ? iv : 0);
        var cipher = crypto.createCipheriv('des-ecb', key, iv);
        cipher.setAutoPadding(true)  //default true
        var ciph = cipher.update(plaintext, 'utf8', 'base64');
        ciph += cipher.final('base64');
        return ciph;
    },
    deDES: function (encrypt_text, iv) {
        var key = new Buffer('nW4*G29J');
        var iv = new Buffer(iv ? iv : 0);
        var decipher = crypto.createDecipheriv('des-ecb', key, iv);
        decipher.setAutoPadding(true);
        var txt = decipher.update(encrypt_text, 'base64', 'utf8');
        txt += decipher.final('utf8');
        return txt;
    },
    RefJsHtml: function (path, defer, callback) {
        fs.stat('.' + path, function (err, data) {
            var d = err ? '' : moment(data.mtime).format('x');
            d = util.format('<script type="text/javascript" src="%s?_t=%s"%s></script>', path, d, defer ? ' defer="defer"' : '');
            callback(d);
        });
    },
    RefCssHtml: function (path, callback) {
        fs.stat('.' + path, function (err, data) {
            var d = err ? '' : moment(data.mtime).format('x');
            d = util.format('<link type="text/css" rel="stylesheet" href="%s?_t=%s"/>', path, d);
            callback(d);
        });
    },
    round: function (val, precision) {
        return Math.round(Math.round(val * Math.pow(10, (precision || 0) + 1)) / 10) / Math.pow(10, (precision || 0));
    },
    int2ABC: function (number) {
        return 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z'.split(',')[parseInt(number)];
    },
    getKM: function (lat1, long1, lat2, long2) {
        var d2r = (Math.PI / 180.0);
        var dlong = (long2 - long1) * d2r;
        var dlat = (lat2 - lat1) * d2r;
        var a = Math.pow(Math.sin(dlat / 2.0), 2) + Math.cos(lat1 * d2r) * Math.cos(lat2 * d2r) * Math.pow(Math.sin(dlong / 2.0), 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = 6367 * c;
        return d;
    },
    checker: function (json) {
        this.data = {};
        this.count = 0;
        this.err = [];
        this.add = function (jsonKey, saveKey, Filter, ErrorCode, Must) {
            if (Must == undefined || Must == null) { Must = true; }
            if (typeof Filter === 'function') {
                if (json[jsonKey] != null && json[jsonKey] != undefined) {
                    if (Filter(json[jsonKey])) {
                        self.data[saveKey] = json[jsonKey]; self.count++;
                    } else {
                        self.err.push(ErrorCode);
                    }
                } else {
                    if (Must) { self.err.push(ErrorCode); }
                }
            } else {
                if (json[jsonKey] != null && json[jsonKey] != undefined) {
                    var tmp_err = 0;
                    for (var i in Filter) {
                        var f = Filter[i];
                        if (!f(json[jsonKey][i])) { tmp_err++; }
                    }
                    if (tmp_err == 0) {
                        self.data[saveKey] = json[jsonKey]; self.count++;
                    } else {
                        self.err.push(ErrorCode);
                    }
                } else {
                    if (Must) { self.err.push(ErrorCode); }
                }
            }
        }
        var self = this;
    },
    md5: function (str) {
        return crypto.createHash('md5').update(str).digest('hex');
    },
    RndArray: function (array) {
        return array[common.RndInt(0, array.length - 1)];
    },
    RndInt: function (min, max) {
        return Math.round(Math.random() * (max - min)) + min;
    },
    RndFloat: function (min, max) {
        return (Math.random() * (max - min)) + min;
    },
    getShortHash: function () { return moment().format('x'); },
    getTimehash: function () {
        var t1 = moment().format('x');
        var t2 = Math.floor((Math.random() * 100000000) + 1);
        var t3 = Math.floor((Math.random() * 100000000) + 1);
        return this.md5(t2 + t1 + t3);
    },
    CheckField: function (req, field) {
        for (var f in field) { if (!req.body[field[f]]) { return false; } }
        return true;
    },
    getIP: function (req) {
        var temp = req.headers['CF-Connecting-IP'] ||
            req.headers['http_cf_connecting_ip'] ||
            req.headers['http_client_ip'] ||
            req.headers['http_x_cluster_client_ip'] ||
            req.headers['http_x_forwarded_for'] ||
            req.headers['http_x_forwarded'] ||
            req.headers['http_x_real_ip'] ||
            req.headers['http_forwarded_for'] ||
            req.headers['http_forwarded'] ||
            req.headers['remote_addrs'] ||
            req.headers['cf_connecting_ip'] ||
            req.headers['client_ip'] ||
            req.headers['x_cluster_client_ip'] ||
            req.headers['x_forwarded_for'] ||
            req.headers['x_forwarded'] ||
            req.headers['x_real_ip'] ||
            req.headers['forwarded_for'] ||
            req.headers['forwarded'] ||
            req.headers['remote_addrs'] ||
            req.headers['cf-connecting-ip'] ||
            req.headers['client-ip'] ||
            req.headers['x-cluster-client-ip'] ||
            req.headers['x-forwarded-for'] ||
            req.headers['x-forwarded'] ||
            req.headers['x-real-ip'] ||
            req.headers['forwarded-for'] ||
            req.headers['forwarded'] ||
            req.headers['remote-addrs'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        temp = regex.FilterIP(temp);
        return !temp ? '127.0.0.1' : temp;
    }
}
module.exports = xCm;