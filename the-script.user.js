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
    var zNode       = document.createElement ('div');
    zNode.innerHTML = '<button id="myButton" type="button">' + 'Test</button>';
    zNode.setAttribute ('id', 'myContainer');
    document.body.appendChild (zNode);
    document.getElementById ("myButton").addEventListener ("click", ButtonClickAction, false);

    function ButtonClickAction (zEvent) {
        var selectedKeys = getSelectedKeys();
        var keyLabels = new Array(12);
        keyLabels[0] = "shit";
        keyLabels[6] = "Holy Shit";
        setKeyLabels(keyLabels);
        updateKeyLabels();
    }
    angularInjector("selectRelease", null, function() {

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
  Set the keylabels of keys in selectedKeys
*/

function setKeyLabels(keyLabels) {
    getSelectedKeys().forEach(function(selectedKey) {
        selectedKey.labels = keyLabels;
    });
}

/*
  Update keylabels of keys in selectedKeys
*/

function updateKeyLabels() {
     getAngularScope().multi = getSelectedKeys()[0];
     getAngularScope().updateMulti('labels');
}