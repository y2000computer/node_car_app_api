var extend = require('extend');
var async = require('async');
var path = require('path');
var hb = require('handlebars');
var fs = require('fs');
var xCm = require('../lib/xCm');
var xHandlebars = require('../lib/xHandlebars');

var xView = {
    // Pre-Load all the views when app.js load first time.
    Init: function () {
        xCm.langInit();
        var fast = process.argv[2] == 'fast' ? true : false;
        if (fast) console.log('\x1b[33m%s', 'xView.Init() => With fast mode...');
        // Register All Helper
        xHandlebars.Init(hb);
        var path = path || require('path');
        var files = xCm.walkSync('view');
        function msg(m, a, b) { console.log('xView.Init() => ' + a + ' - ' + b + ' : ' + m); /*console.timeEnd('used'); console.time('used');*/ }
        function autoReload(f, ff) {
            var fsTimeout;
            fs.watch(ff, function (e, fname) {
                if (e != 'change') return true;
                xView.views[f].hb = hb.compile(fs.readFileSync(ff, 'utf-8'));
                xView.views[f].Render();
                msg('Reloaded', f, ff);
            });
        }
        for (var i in files) {
            var f = files[i].replace(/view[\\|\/]/, '').replace(/\.hbs/, '').replace(/\\/g, '/');
            xView.views[f] = new xView.View(hb.compile(fs.readFileSync(files[i], 'utf-8')));
            if (!fast) xView.views[f].Render();
            msg(fast ? 'Loaded' : 'Compiled', f, files[i]);
            autoReload(f, files[i]);
        }
        files = xCm.walkSync('cms/view');
        for (var i in files) {
            var f = 'cms.' +  files[i].replace(/cms[\\|\/]view[\\|\/]/, '').replace(/\.hbs/, '').replace(/\\/g, '/');
            xView.views[f] = new xView.View(hb.compile(fs.readFileSync(files[i], 'utf-8')));
            if (!fast) xView.views[f].Render();
            msg(fast ? 'Loaded' : 'Compiled', f, files[i]);
            autoReload(f, files[i]);
        }
        console.log('%s\x1b[0m', 'xView.Init() => Completed!');
    },
    // Views List
    views: {},
    // View Object
    View: function (hb) {
        this.hb = hb;
        this.Render = function (data) { return self.hb(data); }
        var self = this;
    },
    Alone: function (res, view, data, img) { 
        // Chech View exist.
        if (!xView.views[view]) throw new Error('"'  + view + '" View isn\'t exist, plaese check the code and make sure here had View to render.');
        // xIMG.Load() before send the page.
        if (img) { img.Load(loadView); } else { loadView(); }
        // Load default template and render final page.
        function loadView() {
            var html = '';
            // Link Js + Css
            data = data || {};
            data = extend(data, { lang: res.req.lang, langlink: res.req.langlink });
            html = xView.views[view].Render(data);
            res.send(html);
        }
    },
    Single: function (res, view, data, img) { 
        // Chech View exist.
        if (!xView.views[view]) throw new Error('"'  + view + '" View isn\'t exist, plaese check the code and make sure here had View to render.');
        // xIMG.Load() before send the page.
        if (img) { img.Load(loadView); } else { loadView(); }
        // Load default template and render final page.
        function loadView() {
            var html = '';
            // Link Js + Css
            var link = [];
            var cmsA = view.startsWith('cms.') ? '/cms' : '';
            var cmsB = view.startsWith('cms.') ? 'cms.' : '';
            async.waterfall(
                [
                    function (cb) { xCm.RefCssHtml(cmsA + '/rs/css/default.css', function (d) { link.push(d); cb(); }); },
                    function (cb) { xCm.RefCssHtml(cmsA + '/rs/css/style.css', function (d) { link.push(d); cb(); }); },
                    function (cb) { xCm.RefJsHtml(cmsA + '/rs/js/framework.js', false, function (d) { link.push(d); cb(); }); },
                    function (cb) { xCm.RefJsHtml(cmsA + '/rs/js/xxDream.js', true, function (d) { link.push(d); cb(); }); }
                ], Layout
            );
            // Layout + Body
            function Layout() {
                // Render Single hbs
                data = data || {};
                data['link'] = link;
                data = extend(data, { lang: res.req.lang, langlink: res.req.langlink });
                html = xView.views[view].Render(data)
                res.send(html);
            }
        }
    },
    Layout: function (res, view, data, img) { 
        // Chech View exist.
        if (!xView.views[view]) throw new Error('"'  + view + '" View isn\'t exist, plaese check the code and make sure here had View to render.');
        // xIMG.Load() before send the page.
        if (img) { img.Load(loadView); } else { loadView(); }
        // Load default template and render final page.
        function loadView() {
            var html = '';
            // Link Js + Css
            var link = [];
            var cmsA = view.startsWith('cms.') ? '/cms' : '';
            var cmsB = view.startsWith('cms.') ? 'cms.' : '';
            var vPath = ''
            vPath = view.startsWith('cms.') ? 'cms.' : vPath;
            vPath = view.startsWith('api.') ? 'api.' : vPath;
            async.waterfall(
                [
                    function (cb) { xCm.RefCssHtml(cmsA + '/rs/css/default.css', function (d) { link.push(d); cb(); }); },
                    function (cb) { xCm.RefCssHtml(cmsA + '/rs/css/style.css', function (d) { link.push(d); cb(); }); },
                    function (cb) { xCm.RefJsHtml(cmsA + '/rs/js/framework.js', false, function (d) { link.push(d); cb(); }); },
                    function (cb) { xCm.RefJsHtml(cmsA + '/rs/js/xxDream.js', true, function (d) { link.push(d); cb(); }); }
                ], Layout
            );
            // Layout + Body
            function Layout() {
                // Render Single hbs and Layout only
                data = extend(data, { lang: res.req.lang, langlink: res.req.langlink });
                var head = extend({
                    title: '',
                    desc: null,
                    keyword: null,
                    link: link
                }, res.head);
                html = xView.views[vPath + 'xLayout'].Render({
                    lang: res.req.lang,
                    langlink: res.req.langlink,
                    langcode: res.req.langcode,
                    head: head,
                    html: xView.views[view].Render(data),
                    layout: true
                });
                res.send(html);
            }
        }
    },
    // Output HTML to Client
    Render: function (res, view, data, img) {
        // Chech View exist.
        if (!xView.views[view]) throw new Error('"'  + view + '" View isn\'t exist, plaese check the code and make sure here had View to render.');
        // xIMG.Load() before send the page.
        if (img) { img.Load(loadView); } else { loadView(); }
        // Load default template and render final page.
        function loadView() {
            var html = '';
            // Link Js + Css
            var link = [];
            var cmsA = view.startsWith('cms.') ? '/cms' : '';
            var vPath = ''
            var style2 = view.startsWith('api.') ? '2' : '';
            vPath = view.startsWith('cms.') ? 'cms.' : vPath;
            vPath = view.startsWith('api.') ? 'api.' : vPath;         
            async.waterfall(
                [
                    function (cb) { xCm.RefCssHtml(cmsA + '/rs/css/default.css', function (d) { link.push(d); cb(); }); },
                    function (cb) { xCm.RefCssHtml(cmsA + '/rs/css/style' + style2 + '.css', function (d) { link.push(d); cb(); }); },
                    function (cb) { xCm.RefJsHtml(cmsA + '/rs/js/framework.js', false, function (d) { link.push(d); cb(); }); },
                    function (cb) { xCm.RefJsHtml(cmsA + '/rs/js/xxDream.js', true, function (d) { link.push(d); cb(); }); }
                ], Layout
            );
            // Layout + Body
            function Layout() {
                // Default html SEO tag.
                var head = extend({
                    title: '',
                    desc: null,
                    keyword: null,
                    link: link
                }, res.head);
                data = extend(data, { lang: res.req.lang, langlink: res.req.langlink });
                // Render All hbs
                html = xView.views[vPath + 'xLayout'].Render({
                    lang: res.req.lang,
                    langlink: res.req.langlink,
                    langcode: res.req.langcode,
                    head: head,
                    html: xView.views[vPath + "xHeader"].Render({
                        lang: res.req.lang,
                        langlink: res.req.langlink,
                        langcode: res.req.langcode,
                        login: res.req.user ? true : false,
                        _url: res.req.p[1],
                        xhead: res.req.xhead
                    }) +
                    xView.views[view].Render(data) +
                    xView.views[vPath + "xFooter"].Render({
                        lang: res.req.lang,
                        langlink: res.req.langlink,
                        langcode: res.req.langcode,
                    })
                });
                res.send(html);
            }
        }
    }
}
module.exports = xView;