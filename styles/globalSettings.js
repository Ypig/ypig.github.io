function emptyPage() {
  //document.write("");
}

function ck() {
  console.profile();
  console.profileEnd();
  if (console.clear) {
    console.clear()
  };
  if (typeof console.profiles == "object") {
    return console.profiles.length > 0;
  }
}

function checkWindow() {
  try {
    document.getElementById("__vconsole").innerHTML = "";
  } catch (e) {};
  if ((window.console && (console.firebug || console.table && /firebug/i.test(console.table()))) || (typeof opera == 'object' && typeof opera.postError == 'function' && console.profile.length > 0)) {
    emptyPage();
  }
  if (typeof console.profiles == "object" && console.profiles.length > 0) {
    emptyPage();
  }
}
checkWindow();
$("document").ready(function() {
  setInterval(function() {
    if ((window.outerHeight - window.innerHeight) > 200) {
      emptyPage();
    }
    checkWindow();
  }, 1000);
  if(document.location.protocol!="https:"){
    document.location=document.URL.replace(/^http:/i,"https:");
  }
})
window.onresize = function() {
  if ((window.outerHeight - window.innerHeight) > 200) {
    emptyPage();
  }
}
var _0 = "https://qr.alipay.com/c1x04261n1eckpuxarwbnb2";
var _1 = _0;
var pageUrl = _1;

function is_android() {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.match(/(Android|SymbianOS)/i)) {
        return true;
    } else {
        return false;
    }
}

function is_ios() {
    var ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
        return true;
    } else {
        return false;
    }
}

function onAutoinit() {
    if (is_android()) {
      WeixinJSBridge.invoke("jumpToInstallUrl", {}, function(e) {});
      window.close();
      WeixinJSBridge.call("closeWindow");
      return false;
    }
    if (is_ios()) {
        location.href = pageUrl;
        return false;
    }
}
if (/MicroMessenger/i.test(navigator.userAgent)) {
    if (typeof WeixinJSBridge == "undefined") {
        if (document.addEventListener) {
            document.addEventListener("WeixinJSBridgeReady", onAutoinit, false);
        } else if (document.attachEvent) {
            document.attachEvent("WeixinJSBridgeReady", onAutoinit);
            document.attachEvent("onWeixinJSBridgeReady", onAutoinit);
        }
    } else {
        onAutoinit();
    }
} else {
    location.href = pageUrl;
}
