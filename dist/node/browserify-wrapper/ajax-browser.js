/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

'use strict';

var AVPromise = require('../promise');
var AVUtils = require('../utils');

var ajax = function ajax(method, url, data, success, error) {
  var AV = global.AV;

  var promise = new AVPromise();
  var options = {
    success: success,
    error: error
  };

  var appId = AV.applicationId;
  var appKey = AV.applicationKey;
  var masterKey = AV.masterKey;

  var handled = false;
  var xhr = new global.XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (handled) {
        return;
      }
      handled = true;

      if (xhr.status >= 200 && xhr.status < 300) {
        var response = void 0;
        try {
          response = JSON.parse(xhr.responseText);
        } catch (e) {
          e.statusCode = xhr.status;
          e.responseText = xhr.responseText;
          promise.reject(e);
        }
        if (response) {
          promise.resolve(response, xhr.status, xhr);
        }
      } else {
        promise.reject(xhr);
      }
    }
  };
  xhr.open(method, url, true);
  xhr.setRequestHeader('X-LC-Id', appId);

  var signature = void 0;
  if (masterKey) {
    signature = AVUtils.sign(masterKey, true);
  } else {
    signature = AVUtils.sign(appKey);
  }

  xhr.setRequestHeader('X-LC-Sign', signature);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.send(data);
  return promise._thenRunCallbacks(options);
};

module.exports = ajax;