
var regex = {
    IsFloat: function (str) { return typeof str === 'number' ? true : false; },
    IsNum: function (str) { return /^[0-9]+$/.test(str); },
    IsStr: function (str) { return /^[a-zA-Z0-9]+$/.test(str); },
    IsEng: function (str) { return /^[a-zA-Z\ ]+$/.test(str); },
    IsText: function (str) { return /^[\u4e00-\u9fa5\uff01-\uff5a\u3008-\u3030a-zA-Z0-9\ \(\)\/\,\.\-\[\]\!\\\　]+$/.test(str); },
    IsID: function (str) { return /^[a-zA-Z][a-zA-Z0-9_-]{3,50}$/.test(str); },
    IsCardBrand: function (str) { return /^(VISA|Master)$/.test(str); },
    IsExpiry: function (str) { return /^(0[1-9]|1[0-2])\/(1[6-9]|[2-9][0-9])$/.test(str); },
    IsNickName: function (str) { return /^[\u4e00-\u9fa5a-zA-Z0-9]{1,20}$/.test(str); },
    IsFullName: function (str) { return /^[\u4e00-\u9fa5a-zA-Z0-9\ ]{2,40}$/.test(str); },
    IsAddress: function (str) { return /^[\u4e00-\u9fa5a-zA-Z0-9\-\_\,\.\(\)\s]{5,200}$/.test(str); },
    IsPassword: function (str) { return /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9\.\,\`\~\!\@\#\$\%\^\&\*\(\)\-\+\{\}\[\]]{8,20}$/.test(str); },
    IsGoodPassword: function (str) { return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\.\,\`\~\!\@\#\$\%\^\&\*\(\)\-\+\{\}\[\]])[a-zA-Z0-9\.\,\`\~\!\@\#\$\%\^\&\*\(\)\-\+\{\}\[\]]{8,20}$/.test(str); },
    IsEmail: function (str) { return /^[a-zA-Z][\w\.-]*[a-zA-Z0-9]@[a-zA-Z0-9][\w\.-]*[a-zA-Z0-9]\.[a-zA-Z][a-zA-Z\.]*[a-zA-Z]$/.test(str); },
    IsDate: function (str) { return /^((((1[6-9]|[2-9]\d)\d{2})-(0?[13578]|1[02])-(0?[1-9]|[12]\d|3[01]))|(((1[6-9]|[2-9]\d)\d{2})-(0?[13456789]|1[012])-(0?[1-9]|[12]\d|30))|(((1[6-9]|[2-9]\d)\d{2})-0?2-(0?[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))-0?2-29-))$/.test(str); },
    IsDatetime: function (str) { return /^((((1[6-9]|[2-9]\d)\d{2})-(0?[13578]|1[02])-(0?[1-9]|[12]\d|3[01]))|(((1[6-9]|[2-9]\d)\d{2})-(0?[13456789]|1[012])-(0?[1-9]|[12]\d|30))|(((1[6-9]|[2-9]\d)\d{2})-0?2-(0?[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))-0?2-29-)) (20|21|22|23|[0-1]+\d):[0-5]+\d:[0-5]+\d$/.test(str); },
    IsTimeMin: function (str) { return /^(20|21|22|23|[0-1]+\d):[0-5]+\d$/.test(str); },
    IsTimeSec: function (str) { return /(20|21|22|23|[0-1]+\d):[0-5]+\d:[0-5]+\d/.test(str); },
    IsLat: function (str) {
        if (typeof str === 'number') {
            if (str > 22.06774463945894 && str < 22.57589587134169) {
                return true;
            } else { return false; }
        } else { return false; }
    },
    IsLng: function (str) {
        if (typeof str === 'number') {
            if (str > 113.75948574648442 && str < 114.48732998476567) {
                return true;
            } else { return false; }
        } else { return false; }
    },
    IsMD5: function (str) { return /^[a-zA-Z0-9]{32}$/.test(str); },
    IsHKtel: function (str) { return /^[235689][0-9]{7}$/.test(str); },
    IsHKmobile: function (str) { return /^[5689][0-9]{7}$/.test(str); },
    CheckArray: function (str, array) { for (i in array) { if (str == array[i]) { return true; } } return false; },
    IsBoolean: function (str) { if (typeof str === 'boolean') { return true; } else { return false; } },
    IsSP: function (str) { return /[\;\:\""\'\<\>\\[\]\{\}\?\/\\\~\`\!\@\#\$\%\^\&\*\(\)\|]/.test(str); },
    IsIP: function (str) { return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(str); },
    FilterNum: function (str) { try { return str.match(/[0-9]/g)[0]; } catch (e) { return ''; } },
    FilterStr: function (str) { try { return str.match(/[0-9a-zA-Z]/g)[0]; } catch (e) { return ''; } },
    FilterIP: function (str) { try { return str.match(/(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/)[0]; } catch (e) { return ''; } },
    IsBarCode: function (str) { return /^[0-9]{12}$/.test(str); },
    IsUserType: function (str) { return /^(USER_CUST|USER_DRIVE)$/.test(str); },
    GetCardBrand: function (str) {
        var tmp = ''; tmp = '' + str + ''; str = tmp;
        var item = function (regex, length, brand) { this.brand = brand; this.regex = regex; this.length = length; }
        var info = [
            new item(/^(51|52|53|54|55)/, 16, 'Master'),
            new item(/^(4)/, 16, 'VISA'), new item(/^(4)/, 13, 'VISA'),
            new item(/^(34|37)/, 15, 'AMEX'),
            new item(/^(6011)/, 16, 'Discover'),
            new item(/^(300|301|302|303|304|305|36|38)/, 14, 'DinersClub'),
            new item(/^(3)/, 16, 'JCB'), new item(/^(2131|1800)/, 15, 'JCB'),
            new item(/^(2014|2149)/, 15, 'enRoute')
        ];
        for (var i in info) { if (str.length == info[i].length && info[i].regex.test(str)) { return info[i].brand; } }
        return 'Unknown';
    },
    IsCreditCard: function (str) {
        var tmp = ''; tmp = '' + str + ''; str = tmp;
        if (regex.GetCardBrand(str) == 'Unknown') { return false; }
        var luhnChk = function (a) { return function (c) { for (var l = c.length, b = 1, s = 0, v; l;)v = parseInt(c.charAt(--l), 10), s += (b ^= 1) ? a[v] : v; return s && 0 === s % 10 } } ([0, 2, 4, 6, 8, 1, 3, 5, 7, 9]);
        return luhnChk(str);
    }
}
module.exports = regex;