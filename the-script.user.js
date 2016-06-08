// ==UserScript==
// @name         TKG Helper Extension Script
// @namespace    https://github.com/kairyu/the-script
// @version      0.1
// @description  TKG Helper Extension Script
// @author       KaiRyu & Hging & 一个不知名的小辣鸡
// @match        http://www.keyboard-layout-editor.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    angularInjector("selectRelease", null, function() {
        var selectedKeys = getSelectedKeys();
        if(selectedKeys.length > 1 || selectedKeys.length === 0) {
            console.log("THE only works when you select one key instead of multiple keys or no key");
        }
        else {
            var keyLabels = new Array(12);
            keyLabels[0] = "shit";
            keyLabels[6] = "Holy Shit";
            setKeyLabels(keyLabels);
            updateKeyLabels();
        }
    });
})();

/*
  To inject an angular function
  arguments:
  name: the original name of the function you want to inject
  preFunc: the function you want to inject before the original function is executed
  postFunc: the function you want to inject after the original function is executed

*/

function angularInjector(name, preFunc, postFunc) {
    var originalFunc = angular.element($('body')).scope()[name];
    angular.element($('body')).scope()[name] = function() {
        var originRet = originalFunc.apply(angular.element($('body')).scope(), arguments);
        if(preFunc) {
            preFunc.apply(window, arguments);
        }
        if(postFunc) {
            postFunc.apply(window, arguments);
        }
        return originRet;
    };
}

/*
  Get the scope
*/

function getAngularScope() {
    return angular.element($('body')).scope();
}

/*
  Get selectedKeys
*/

function getSelectedKeys() {
    return getAngularScope().selectedKeys;

}

/*
  Set the keylabels of the last key in selectedKeys
*/

function setKeyLabels(keyLabels) {
    getSelectedKeys().last().labels = keyLabels;
}

/*
  Update keylabels of the last key in selectedKeys
*/

function updateKeyLabels() {
    getAngularScope().multi = getSelectedKeys().last();
    getAngularScope().updateMulti('labels');
}