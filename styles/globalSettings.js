function emptyPage() {
   console.clear();
   document.write("");
   window.location.replace(window.location.href.replace("https://ypig.tk/","https://files.ypig.tk/"));
}

function ck() {
  console.profile();
  console.profileEnd();
  if (console.clear) {
    console.clear();
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

$("document").ready(function() {
  setInterval(function() {
    if (/Mobi/.test(navigator.userAgent) != true) {
      if ((window.outerHeight - window.innerHeight) > 200) {
        emptyPage();
      }
    }
  }, 1000);
  var x = document.createElement('div');
  Object.defineProperty(x, 'id', {
      get:function(){
          emptyPage();
      }
  });
  console.log(x);
  
  if(document.location.protocol!="https:"){
    document.location=document.URL.replace(/^http:/i,"https:");
  }
  if (location.href=="https://ypig.tk/"|| location.href=="https://ypig.tk/?isUpdateRead=true"||location.href=="https://ypig.tk/api/function_load?path=https://ypig.tk/functions/ps&image=image" || location.href=="https://ypig.tk/functions/ps") {
    console.log("statusok");
  } else {
    document.write("站点维护，就开放个ps，别怪我哦！");
  }
});
window.onresize = function() {
  if (/Mobi/.test(navigator.userAgent != true)) {
    if ((window.outerHeight - window.innerHeight) > 200) {
      emptyPage();
    }
  }
}
checkWindow();
