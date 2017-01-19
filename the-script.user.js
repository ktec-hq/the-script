(function() {
    'use strict';

    // ==UserScript==
    // @name         TKG Helper Extension Script
    // @namespace    https://github.com/ktec-hq/the-script
    // @version      1.0
    // @description  TKG Helper Extension Script
    // @author       Kai Ryu & Hging & Chen Yang & yangdigi
    // @match        http://www.keyboard-layout-editor.com/*
    // @grant        GM_getResourceText
    // @grant        GM_setClipboard
    // @grant        GM_xmlhttpRequest
    // @connect      tkg.io
    // @resource     list https://tkg.io/keyboard/list.json
    // ==/UserScript==

    (function() {
        init(); //init the THE script
        $(window).on('click', function(e) {
            var curElement = document.activeElement.id;
            var selectedKeys = getSelectedKeys();
            var keyLabels = new Array(12);
            if( e.which == 2){
                if(curElement == 'keyboard'){
                    e.returnValue=false;
                    if(selectedKeys.length == 1) {
                        keyLabels[0]= selectedKeys[0].width+"x";
                        if(selectedKeys[0].height > 1) keyLabels[3] = selectedKeys[0].height+"h";
                        setKeyLabels(keyLabels);
                    }
                }
            }
        });

        $(window).keydown(function(e) {
            var code = e.keyCode;
            //判断当前是否在键盘区
            var curElement = document.activeElement.id;
            if(curElement == 'keyboard'){
                //屏蔽浏览器按键
                e.returnValue=false;
                if(e.shiftKey) {
                    if(code == 188) code = 16;  //<. to Shift
                    else if(code == 190) code = 316;  //>. to RShift
                    else if(code == 68) code = 46;  //D to Del
                    else if(code == 13) code = 313;  //Enter to PEnter
                    else if(code == 80) code = 346;  //P to Prints Screen
                    else if(code == 66){    //B 清空按键
                        for(var i=0;i<12;i++) {
                            var keyLabels = new Array(12);
                            keyLabels[i] = '';
                            setKeyLabels(keyLabels);
                        }
                        return;
                    }
                    else return;
                }
                if(e.ctrlKey) {
                    if(code == 188) code = 17;
                    else if(code == 190) code = 317;
                    else return;
                }
                if(e.altKey) {
                    if(code == 188) code = 18;
                    else if(code == 190) code = 318;
                    else if((code > 36) && (code < 41)) ;
                    else return;
                }
                if((!e.shiftKey) && (code == 46 )) return;   //del

                var selectedKeys = getSelectedKeys();
                //判断是否只选择了一个按键
                if(selectedKeys.length === 1) {
                    var keyLabels = new Array(12);
                    if (selectedKeys[0].profile.indexOf("SA") > -1 ) {  //profile = SA DSA NDSA
                        var textSize;
                        if(((code>64)&&(code<91))||((code>95)&&(code<112))){
                            textSize = 10;
                            keyLabels[4] = label[code].top.toUpperCase();
                        }else if(!label[code].bottom){
                            textSize = 4;
                            keyLabels[4] = label[code].top.toUpperCase();
                        }else{
                            textSize = 5;
                            keyLabels[1] = label[code].top;
                            keyLabels[7] = label[code].bottom;
                        }
                        setDefaultTextSize(textSize);
                    }else{
                        keyLabels[0] = label[code].top;
                        keyLabels[6] = label[code].bottom;
                    }
                    setKeyLabels(keyLabels);
                }
            }
        });

    })();

    /* Add THE functions*/
    function init() {
        //alert('本插件只能配合tkg.io网站使用');
        injectTheCss();
        //Add Copy to clipboard function
        var clipboardButton = $('<div class="btn-group pull-right" style="margin-right: 4px;"><button type="button" class="btn btn-success" id="clipboard-button"><i class="fa fa-clipboard"></i> Copy to Clipboard</button></div>');
        clipboardButton.insertAfter($('div.btn-group.pull-right').last());
        $('button#clipboard-button').bind('click', function() {
            GM_setClipboard(getAngularScope().serialized);
        });
        //add nav-tab
        var navTab = $('.nav.nav-tabs');  //find the bottom nav-tab
        if(navTab !== null) {
            //generate nav-tab
            var theTab = '<li ng-class="{active:selTab==6}"><a ng-click="selTab=6" data-toggle="tab"><i class="fa fa-magic"></i> TKG Helper Extension</a></li>';
            navTab.append(theTab);
            bindAngular(navTab);
            //generate tab content tab-content
        }
        injectKtecPresets();
    }

    function injectGlobalCss(css) {
        var head, style;
        head = document.getElementsByTagName('head')[0];
        if (!head) { return; }
        style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        head.appendChild(style);
    }

    function injectTheCss() {
        var dropdownSubmenu = `.dropdown-submenu{position:relative;}
.dropdown-submenu>.dropdown-menu{top:0;left:100%;margin-top:-6px;margin-left:-1px;-webkit-border-radius:0 6px 6px 6px;-moz-border-radius:0 6px 6px 6px;border-radius:0 6px 6px 6px;}
.dropdown-submenu:hover>.dropdown-menu{display:block;}
.dropdown-submenu>a:after{display:block;content:" ";float:right;width:0;height:0;border-color:transparent;border-style:solid;border-width:5px 0 5px 5px;border-left-color:#cccccc;margin-top:5px;margin-right:-10px;}
.dropdown-submenu:hover>a:after{border-left-color:#ffffff;}
.dropdown-submenu.pull-left{float:none;}.dropdown-submenu.pull-left>.dropdown-menu{left:-100%;margin-left:10px;-webkit-border-radius:6px 0 6px 6px;-moz-border-radius:6px 0 6px 6px;border-radius:6px 0 6px 6px;}`;
        injectGlobalCss(dropdownSubmenu);
    }

    function injectKtecPresets() {
        var menu = $($('ul.nav.navbar-nav')[0]);
        var template = '<li class="dropdown" dropdown=""><a class="dropdown-toggle" dropdown-toggle="" aria-haspopup="true" aria-expanded="false"><i class="fa fa-wheelchair"></i> TKG Preset <b class="caret"></b></a><ul class="dropdown-menu" id="tkg-preset"></li>';
        $(template).insertAfter(menu.children().eq(0));
        var tkgDropdown = $('ul#tkg-preset');
        var labels = '<li class="dropdown-header" id="first-party">First Party</li><li class="divider"></li><li class="dropdown-header" id="second-party">Second Party</li><li class="divider"></li><li class="dropdown-header" id="third-party">Third Party</li>';
        tkgDropdown.prepend(labels);
        var kimeraMenu = '<li class="dropdown-submenu"><a>Kimera Presets</a><ul class="dropdown-menu" id="kimera-presets"></ul></li>';
        $(kimeraMenu).insertAfter($('li.dropdown-header#first-party'));
        var keyboardList = GM_xmlhttpRequest({ method : "GET", headers: {"Accept": "application/json"}, url : 'https://tkg.io/keyboard/list.json', onload : function (response) {
            if(response.status == 200) {
                var keyboardList = JSON.parse(response.responseText);
                addTkgPreset(keyboardList);
            } else {
                console.log("Unable to get keyboard list");
            }
        }});
        bindAngular(menu.children().eq(1));
    }

    function parseKeyboardName(name) {
        var result = name.match(/^(.*)\((.*)\)$/);
        var main, variant;
        if (result) {
            main = normalizeString(result[1]);
            variant = normalizeString(result[2]);
        }
        else {
            main = normalizeString(name);
        }
        return { "main": main, "variant": variant };
    }

    function normalizeString(str) {
        var rsc = /[\s\/-]/g;
        return str.trim().replace(rsc, '_').toLowerCase();
    }

    /*Add TKG keyboard preset*/
    function addTkgPreset(keyboardList) {
        $(keyboardList).each(function() {
            var keyboardName = this.name;
            var keyboardGroup = this.group;
            var keyboardId = this.name.replace(/[\s\/\(\)\+]/g, '-');
            requestKeyboardConfig(keyboardName, keyboardId, keyboardGroup);
        });
        requestKimeraPresets();
    }

    /* request config file */
    function requestKeyboardConfig(keyboardName, keyboardId, keyboardGroup){
        var main = parseKeyboardName(keyboardName).main;
        var variant = parseKeyboardName(keyboardName).variant;
        GM_xmlhttpRequest({ method : "GET", headers: {"Accept": "application/json"}, url : 'https://kai.tkg.io/keyboard/config/' + main +'.json', onload : function (response) {
            if(response.status == 200) {
                var config = JSON.parse(response.responseText);
                if(config.default_layers !== undefined) {
                    keyboardDefaultLayers[keyboardId] = {"default_layers": config.default_layers, "default_layer_mode": config.default_layer_mode};
                    var template = '<li>' +'<a id="' + keyboardId + '">' + keyboardName + '</a>'+ '</li>';
                    $(template).insertAfter($('li#' + keyboardGroup));
                    $('a#' + keyboardId).bind('click', updatePreset);
                }
            }
        }});
        if(variant !== undefined) {
            GM_xmlhttpRequest({ method : "GET", headers: {"Accept": "application/json"}, url : 'https://kai.tkg.io/keyboard/config/' + main +'.json', onload : function (response) {
                if(response.status == 200) {
                    var config = JSON.parse(response.responseText);
                    if(config.default_layers !== undefined) {
                        keyboardDefaultLayers[keyboardId].default_layers =  config.default_layers;
                    }
                    if(config.default_layer_mode !== undefined) {
                        keyboardDefaultLayers[keyboardId].default_layer_mode =  config.default_layer_mode;
                    }
                }
            }});
        }
    }

    /*request kimera presets from https://kai.tkg.io/keyboard/config/kimera-config.json */
    function requestKimeraPresets() {
        GM_xmlhttpRequest({ method : "GET", headers: {"Accept": "application/json"}, url : 'https://kai.tkg.io/keyboard/config/kimera-config.json', onload : function (response) {
            if(response.status == 200) {
                var presets = JSON.parse(response.responseText).presets;
                presets.forEach(function(preset) {
                    var keyboardName = preset.name;
                    var keyboardId = preset.name.replace(/[\s\/\(\)\+]/g, '-');
                    var template = '<li>' +'<a id="' + keyboardId + '">' + keyboardName + '</a>'+ '</li>';
                    keyboardDefaultLayers[keyboardId] = {"default_layers": preset.default_layers, "matrix_map_raw": preset.matrix_map_raw};
                    $('ul#kimera-presets').append(template);
                    $('a#' + keyboardId).bind('click', updatePreset);
                });
            }
        }});
    }

    /*update preset*/
    function updatePreset(o) {
        if(keyboardDefaultLayers[o.currentTarget.id].default_layers) {
            getAngularScope().serialized = keyboardDefaultLayers[o.currentTarget.id].default_layers;
            getAngularScope().updateFromSerialized();
        } else {
            alert('Mother Fucker');
        }
    }
    /*
    compile the new content in order to link with current scope
    */
    function bindAngular(a) {
        angular.element(document).injector().invoke(function($compile) {
            var scope = angular.element(a).scope();
            $compile(a)(scope);
        });
    }

    /*  To inject an angular function
    arguments:
  name: the original name of the function you want to inject
    preFunc: the function you want to inject before the original function is executed
    postFunc: the function you want to inject after the original function is executed
    */

    function angularInjector(name, preFunc, postFunc) {
        var originalFunc = angular.element($('body')).scope()[name];
        angular.element($('body')).scope()[name] = function() {
            if(preFunc) {
                preFunc.apply(window, arguments);
            }
            var originRet = originalFunc.apply(angular.element($('body')).scope(), arguments);
            if(postFunc) {
                postFunc.apply(window, arguments);
            }
            return originRet;
        };
    }

    /*  Get the scope*/
    function getAngularScope() {
        return angular.element($('body')).scope();
    }

    /*  Get selectedKeys*/
    function getSelectedKeys() {
        return getAngularScope().selectedKeys;

    }

    /*  Set the keylabels of keys in selectedKeys*/
    function setKeyLabels(keyLabels) {
        for(var i=0; i<12; i++) {
            if(keyLabels[i] || keyLabels[i] !== getAngularScope().multi.labels[i]) {
                getAngularScope().multi.labels = keyLabels;
                getAngularScope().updateMulti('labels', i);
            }
        }
    }

    /*  Set the keylabels of keys in selectedKeys*/
    function setDefaultTextSize(textSize) {
        getSelectedKeys().forEach(function(selectedKey) {
            selectedKey.default.textSize = textSize;
        });
    }

    var label = {
        8 : {'top':'Backspace'},
        9 : {'top':'Tab'},
        13 : {'top':'Enter'},
        313 : {'top':'PEnter'},
        16 : {'top':'Shift'},
        316 : {'top':'RShift'},
        17 : {'top':'Ctrl'},
        317 : {'top':'RCtrl'},
        18 : {'top':'Alt'},
        318 : {'top':'RAlt'},
        19 : {'top':'Pause', 'bottom':''},
        20 : {'top':'Caps Lock', 'bottom':''},
        27 : {'top':'Esc'},
        32 : {'top':'Space'},
        33 : {'top':'Page Up'},
        34 : {'top':'Page Down'},
        35 : {'top':'End', 'bottom':''},
        36 : {'top':'Home', 'bottom':''},
        37 : {'top':'←'},
        38 : {'top':'↑'},
        39 : {'top':'→'},
        40 : {'top':'↓'},
        45 : {'top':'Ins'},
        46 : {'top':'Del'},
        48 : {'top':')','bottom':'0'},
        49 : {'top':'!','bottom':'1'},
        50 : {'top':'@','bottom':'2'},
        51 : {'top':'#','bottom':'3'},
        52 : {'top':'$','bottom':'4'},
        53 : {'top':'%','bottom':'5'},
        54 : {'top':'^','bottom':'6'},
        55 : {'top':'&','bottom':'7'},
        56 : {'top':'*','bottom':'8'},
        57 : {'top':'(','bottom':'9'},
        65 : {'top':'A'},
        66 : {'top':'B'},
        67 : {'top':'C'},
        68 : {'top':'D'},
        69 : {'top':'E'},
        70 : {'top':'F'},
        71 : {'top':'G'},
        72 : {'top':'H'},
        73 : {'top':'I'},
        74 : {'top':'J'},
        75 : {'top':'K'},
        76 : {'top':'L'},
        77 : {'top':'M'},
        78 : {'top':'N'},
        79 : {'top':'O'},
        80 : {'top':'P'},
        81 : {'top':'Q'},
        82 : {'top':'R'},
        83 : {'top':'S'},
        84 : {'top':'T'},
        85 : {'top':'U'},
        86 : {'top':'V'},
        87 : {'top':'W'},
        88 : {'top':'X'},
        89 : {'top':'Y'},
        90 : {'top':'Z'},
        91 : {'top':'Win'},
        92 : {'top':'RWin'},
        93 : {'top':'Menu'},
        96 : {'top':'0','bottom':'Ins'},
        97 : {'top':'1','bottom':'End'},
        98 : {'top':'2','bottom':'↓'},
        99 : {'top':'3','bottom':'PgDn'},
        100 : {'top':'4','bottom':'←'},
        101 : {'top':'5'},
        102 : {'top':'6','bottom':'→'},
        103 : {'top':'7','bottom':'Home'},
        104 : {'top':'8','bottom':'↑'},
        105 : {'top':'9','bottom':'PgUp'},
        106 : {'top':'*'},
        107 : {'top':'+'},
        109 : {'top':'-'},
        110 : {'top':'.','bottom':'Del'},
        111 : {'top':'/'},
        112 : {'top':'F1'},
        113 : {'top':'F2'},
        114 : {'top':'F3'},
        115 : {'top':'F4'},
        116 : {'top':'F5'},
        117 : {'top':'F6'},
        118 : {'top':'F7'},
        119 : {'top':'F8'},
        120 : {'top':'F9'},
        121 : {'top':'F10'},
        122 : {'top':'F11'},
        123 : {'top':'F12'},
        144 : {'top':'Num Lock'},
        145 : {'top':'Scroll Lock'},
        346 : {'top':'Print Screen'},
        186 : {'top':':','bottom':';'},
        187 : {'top':'+','bottom':'='},
        188 : {'top':'<','bottom':','},
        189 : {'top':'_','bottom':'-'},
        190 : {'top':'>','bottom':'.'},
        191 : {'top':'?','bottom':'/'},
        192 : {'top':'~','bottom':'`'},
        219 : {'top':'{','bottom':'['},
        220 : {'top':'|','bottom':'\\'},
        221 : {'top':'}','bottom':']'},
        222 : {'top':'"','bottom':'\''}
    };
    var keyboardDefaultLayers = {};

})();
