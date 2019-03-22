function emptyPage() {
  if (/Mobi/.test(navigator.userAgent)) {
    console.clear();
  } else {
    console.clear();
    document.write("");
    window.location.replace("http://files.ypig.tk/empty");
  }
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
