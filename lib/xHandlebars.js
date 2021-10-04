var extend = require('extend');
var async = require('async');
var path = require('path');
var hb = require('handlebars');
var fs = require('fs');
var xCm = require('../lib/xCm');
var moment = require('moment');

var xHandlebars = {
    Init: function (hb) {
        function reg(name, callback) { 
            console.log('xHandlebars.Init() => ' + name);
            hb.registerHelper(name, callback);
        }

        reg('ifCond', function (v1, operator, v2, options) {
            switch (operator) {
                case '==':
                    return (v1 == v2) ? options.fn(this) : options.inverse(this);
                case '===':
                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                case '!=':
                    return (v1 != v2) ? options.fn(this) : options.inverse(this);
                case '!==':
                    return (v1 !== v2) ? options.fn(this) : options.inverse(this);
                case '<':
                    return (v1 < v2) ? options.fn(this) : options.inverse(this);
                case '<=':
                    return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                case '>':
                    return (v1 > v2) ? options.fn(this) : options.inverse(this);
                case '>=':
                    return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                case '&&':
                    return (v1 && v2) ? options.fn(this) : options.inverse(this);
                case '||':
                    return (v1 || v2) ? options.fn(this) : options.inverse(this);
                default:
                    return options.inverse(this);
            }
        });
        reg('xDate', function (data) { 
            return data ? moment(data).format('YYYY-MM-DD HH:mm:ss') : '';
        });
        reg('NotEmpty', function (data, option) { 
            return data == '' ? option.inverse(this) : option.fn(this);
        });
        reg('langText', function (lang, name) { 
            if (!lang || !name) return '';
            name = name.split('.');
            return xCm.lang[name[0]][name[1]][lang];
        });
        reg('langFilter', function (lang, data, name) { 
            if (!lang || !data) return '';
            return data[name + '_' + lang];
        });
        reg('star', function (data) {
            data = data || 0;
            var half = data % 2 == 1;
            var star = Math.floor(data / 2);
            var out = '';
            for (var i = 0; i < star; i++) { 
                out += '<i class="fa fa-star"></i>';
            }
            if (half) { 
                star += 1;
                out += '<i class="fa fa-star-half-o"></i>';
            }
            star = 5 - star;
            for (var i = 0; i < star; i++) { 
                out += '<i class="fa fa-star-o"></i>';
            }
            return '<div class="star">' + out + '</div>';;
        });
        reg('fivestar', function (data) {
            data = data || 0;
            data = data * 2;
            var half = data % 2 == 1;
            var star = Math.floor(data / 2);
            var out = '';
            for (var i = 0; i < star; i++) { 
                out += '<i class="fa fa-star"></i>';
            }
            if (half) { 
                star += 1;
                out += '<i class="fa fa-star-half-o"></i>';
            }
            star = 5 - star;
            for (var i = 0; i < star; i++) { 
                out += '<i class="fa fa-star-o"></i>';
            }
            return '<div class="star">' + out + '</div>';;
        });
        reg('rating', function (name, data) {
            try {
                if (!data) data = '';
                var t1 = '';
                var half = 'full';
                for (var i = 10; i > 0; i-=1) { 
                    var id = name + 'star' + i;
                    var selected = data == i ? ' checked="checked"' : '';
                    t1 += '<input type="radio" id="' + id + '" name="' + name + '" value="' + i + '" ' + selected + '/><label class="' + half + '" for="' + id + '" title="' + i + '分"></label>';
                    half = half == 'half' ? 'full' : 'half';
                }
                return '<fieldset id="' + name + '" class="rating">' + t1 + '</fieldset>';
            } catch (ex) { return ''; }
        });
        reg('ioReplace', function (data, a, b) { 
            return data == 0 ? a : b;
        });
        reg('regStatus', function (data) { 
            var result = 'unknow';
            switch (data) { 
                case 0: result = '等候驗證'; break;
                case 1: result = '基本資料'; break;
                case 777: result = '完成'; break;
                case 999: result = '封鎖'; break;    
            }
            return result;
        });
        reg('fbStatus', function (data) { 
            return data == 0 ? '否' : '是';
        });
        reg('raw-helper', function (options) { return options.fn(); });
        reg('xIMG', function (img) { return img ? img.result : ''; });
        reg('timeSelect', function (name, data) { 
            data = data == undefined || data == null ? '' : data.indexOf(':') > -1 ? data.replace(/\:/g, '') : data;
            var out = '';
            for (var i = 600; i <= 2300; i += 15) { 
                var v = i.toString().length == 3 ? '0' + i : i.toString();
                var s = v == data ? ' selected' : '';
                var t = v.split('');
                t = t[0] + t[1] + ':' + t[2] + t[3];
                out += '<option value="' + v + '"' + s + '>' + t + '</option>';
                if (t.split(':')[1] == '45') { i = parseInt(i) + 40; }
            }
            return '<select id="' + name + '" name="' + name + '" class="form-control center" style="text-align:center;background-position:93% 50%">' + out + '</select>';
        });
        reg('checked', function (defVal, dataVal) { return defVal == dataVal ? ' checked ' : ''; });
        reg('current', function (_url, key) {
            if (key != null && key != undefined && _url != undefined && _url != null) {
                _url = _url.split(',');
                if (typeof key != 'string') key = key.toString();
                key = key.split(',');
                for (var i in key) {
                    for (var u in _url) {
                        if (_url[u] == key[i]) return ' class="active"';
                    }
                }
                return '';
            } else { return ''; }
        });
        reg('current2', function (_url, key) {
            if (key != null && key != undefined && _url != undefined && _url != null) {
                _url = _url.split(',');
                key = key.split(',');
                for (var i in key) {
                    for (var u in _url) {
                        if (_url[u] == key[i]) return ' active';
                    }
                }
                return '';
            } else { return ''; }
        });
        reg('current3', function (_url, key) {
            return _url + ',' + key;
        });

        reg('certDisplay', function (cert) {
            if (cert == null || cert == undefined || cert == '0' || cert == '') {
                return '未上傳證書';
            } else {
                return '是';
            }
        });

        reg('money', function (n) { 
            n = parseFloat(n);
            return "$" + n.toFixed(2).replace(/./g, function(c, i, a) {
                return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
            });
        });

        reg('mapData', function (a, b, c, d) {
            if (a == null || a == undefined || b == null || b == undefined) return '';
            c = typeof c === 'number' ? c : 1;
            d = typeof d === 'string' ? d : ',';
            var t1 = '';
            if (typeof a === 'number') a = a.toString();
            if (a.indexOf('{') > - 1) a = a.replace(/\{/g, '').replace(/\}/g, '');
            if (!Array.isArray(a)) a = a.split(',');
            b = b.split(',');
            for (var i in a) {
                if (i > 0) t1 += d;
                t1 += b[parseInt(a[i]) - c];
            }
            if (t1 == 'undefined') return '';
            return t1;
        });

        reg('checked', function (a, b) { return a == b ? ' checked ' : ''; });
        function hb_check(data, value) { data = Array.isArray(data) ? data : data.split(','); for (var i in data) { if (data[i] == value) { return true; } } return false; }
        function hb_group(type, name, option, col, data, offset) {
            offset = offset == null || offset == undefined || typeof offset === 'object' ? 0 : offset;
            var out = '<table id="' + name + '" class="checkgroup"><tr>';
            var c = 0, o = option.split(',');
            for (var i = 1; i <= o.length; i++) {
                var checked = false;
                if (c == col) { out += '</tr><tr>'; c = 1; } else { c++; };
                if ( data != undefined && data != null && data[name] != undefined && data[name] != null) { if (typeof data[name] === 'number') data[name] = data[name].toString(); checked = hb_check(data[name], (i+offset)); }
                checked = checked ? ' checked ' : '';
                out += '<td><input id="' + name + (i+offset) + '" type="' + type + '" name="' + name + '" value="' + (i+offset) + '"' + checked + '/><label for="' + name + (i+offset) + '"><span></span>' + o[i - 1] + '</label></td>';
            }
            return out + '</tr></table>';
        }
        reg('radiogroup', function (name, option, col, data, offset) { return hb_group('radio', name, option, col, data, offset); });
        reg('checkgroup', function (name, option, col, data, offset) { return hb_group('checkbox', name, option, col, data, offset); });
        function xhb_group(type, name, option, col, data, offset) {
            offset = offset == null || offset == undefined || typeof offset === 'object' ? 0 : offset;
            var out = '<ul id="' + name + '" class="xcheckgroup">';
            var c = 0, o = option.split(',');
            for (var i = 1; i <= o.length; i++) {
                var checked = false;
                if ( data != undefined && data != null && data[name] != undefined && data[name] != null) { if (typeof data[name] === 'number') data[name] = data[name].toString(); checked = hb_check(data[name], (i+offset)); }
                checked = checked ? ' checked ' : '';
                out += '<li><input id="' + name + (i+offset) + '" type="' + type + '" name="' + name + '" value="' + (i+offset) + '"' + checked + '/><label for="' + name + (i+offset) + '"><span></span>' + o[i - 1] + '</label></li>';
            }
            return out + '</ul>';
        }
        reg('xCheckgroup', function (name, option, col, data, offset) { return xhb_group('checkbox', name, option, col, data, offset); });

        reg('SelectRender', function (name, title, option, data, start) { 
            if (typeof name != 'string') return '';
            option = option || '';
            if (typeof option == 'string') { option = option.split(','); }
            var out = '';
            for (var i in option) { 
                var opt = option[i];
                var select = (parseInt(i) + start) == data ? ' selected' : '';
                out += '<option value="' + (parseInt(i) + start) + '"' + select + '>' + opt + '</option>';
            }
            out = '<optgroup label="' + title + '">' + out + '<optgroup>';
            return '<select id="' + name + '" name="' + name + '" title="' + title + '" class="selectpicker" data-style="btn-full btn-default" data-width="100%">' + out + '</select>';
        });
        reg('xSelectRender', function (name, title, option, data, start) { 
            if (typeof name != 'string') return '';
            option = option || '';
            if (typeof option == 'string') { option = option.split(','); }
            var out = '';
            for (var i in option) { 
                var opt = option[i];
                var select = (parseInt(i) + start) == data ? ' selected' : '';
                out += '<option value="' + (parseInt(i) + start) + '"' + select + '>' + opt + '</option>';
            }
            out = '<optgroup label="' + title + '">' + out + '<optgroup>';
            return '<select id="' + name + '" name="' + name + '" title="' + title + '" class="selectpicker" data-style="btn-default" data-width="100%">' + out + '</select>';
        });
        

        reg('NormalSelect', function (name, title, option, data, start) { 
            if (typeof name != 'string') return '';
            option = option || '';
            if (typeof option == 'string') { option = option.split(','); }
            var out = '';
            for (var i in option) { 
                var opt = option[i];
                var select = (parseInt(i) + start) == data ? ' selected' : '';
                out += '<option value="' + (parseInt(i) + start) + '"' + select + '>' + opt + '</option>';
            }
            out = '<optgroup label="' + title + '">' + out + '<optgroup>';
            return '<select id="' + name + '" name="' + name + '" title="' + title + '" class="form-control">' + out + '</select>';
        });
        

        reg('mapEdit', function (list) {
            var out = '';
            var sub = function (list) {
                for (var a in list) {
                    out += '<div class="items sub">';
                    var key = Object.keys(list[a])[0];
                    var val = list[a][key];
                    out += '<div class="input-group" style="padding-top:5px;">';
                    out += '<span class="input-group-addon bars"><i class="fa fa-bars"></i></span>';
                    out += '<input type="text" class="form-control" value="' + key + '"/>';
                    out += '<span class="input-group-btn"><a class="del-bt btn btn-danger" href="javascript:;"><i class="fa fa-remove"></i></a><a class="add-bt btn btn-primary" href="javascript:;"><i class="fa fa-plus"></i></a></span>';
                    out += '</div>';
                    if (val) {
                        out += '<div class="sort">';
                        sub(val);
                        out += '</div>';
                    }
                    out += '</div>';
                }
        
            }

            for (var a in list) {
                var key = Object.keys(list[a])[0];
                var val = list[a][key];
                out += '<div class="items">';
                out += '<div class="input-group" style="padding-top:5px;">';
                out += '<span class="input-group-addon bars"><i class="fa fa-bars"></i></span>';
                out += '<input type="text" class="form-control" value="' + key + '"/>';
                out += '<span class="input-group-btn"><a class="del-bt btn btn-danger" href="javascript:;"><i class="fa fa-remove"></i></a><a class="add-bt btn btn-primary" href="javascript:;"><i class="fa fa-plus"></i></a></span>';
                out += '</div>';
                if (val) {
                    out += '<div class="sort">';
                    sub(val);
                    out += '</div>';
                }
                out += '</div>';
            }

            return '<div class="main sort">' + out + '</div>';
        });
        reg('mapShow', function (list) {
            var out = '';
            var sub = function (list) {
        
                for (var a in list) {
                    var key = Object.keys(list[a])[0];
                    var val = list[a][key];
                    out += '<div class="items"><i class="fa fa-check-circle"></i><span>' + key + '</span>';
                    if (val) {
                        out += '<div class="sub">';
                        sub(val);
                        out += '</div>';
                    }
                    out += '</div>';
                }
            }

            for (var a in list) {
                var key = Object.keys(list[a])[0];
                var val = list[a][key];
                out += '<div class="items"><i class="fa fa-check-circle"></i><span>' + key + '</span>';
                if (val) {
                    out += '<div class="sub">';
                    sub(val);
                    out += '</div>';
                }
                out += '</div>';
            }

            return '<div class="mapping-show">' + out + '</div>';
        });
        reg('mapSelect', function (list) {
            var out = '';
            var sub = function (list) {
        
                for (var a in list) {
                    var key = Object.keys(list[a])[0];
                    var val = list[a][key];
                    var ground = val ? '' : ' ground';
                    out += '<div class="items' + ground + '"><div class="item"><div class="check"></div><span>' + key + '</span></div>';
                    if (val) {
                        out += '<div class="sub">';
                        sub(val);
                        out += '</div><div class="icon"></div>';
                    }
                    out += '</div>';
                }
            }

            for (var a in list) {
                var key = Object.keys(list[a])[0];
                var val = list[a][key];
                out += '<div class="root items"><div class="item"><div class="check"></div><span>' + key + '</span></div>';
                if (val) {
                    out += '<div class="sub">';
                    sub(val);
                    out += '</div><div class="icon"></div>';
                }
                out += '</div>';
            }

            return '<div class="mapping-show">' + out + '</div>';
        });
    }
}
module.exports = xHandlebars;