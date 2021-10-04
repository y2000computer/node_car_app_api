var crypto = require('crypto');
var regex = require('../lib/regex');
var common = {
    round: function (val, precision) {
        return Math.round(Math.round(val * Math.pow(10, (precision || 0) + 1)) / 10) / Math.pow(10, (precision || 0));
    },
    numberABC: function (number) {
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
    getTimehash: function () {
        var t1 = new Date().getTime().toString();
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
module.exports = common;