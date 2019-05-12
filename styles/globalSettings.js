/*
  Hello,this is the world of piggy.
  The settings keeps the world work correctly.
*/
function emptyPage() {
   console.clear();
   document.write("");
   if (location.pathname == "/") {
     window.location.replace("https://files.ypig.tk/homepage");
   }
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
  var common = ["mdl-layout__header","mdl-layout__drawer","mdl-layout__content","mdl-grid","mdl-cell","mdl-card","mdl-layout","mdl-card__supporting-text","mdl-card__title"];
  function detectClasses() {
     if (/Ypiginc/.test("navigator.userAgent") != true) {
       for (var i = 0;i<common.length;i++) {
         if ($("." + common[i]).length < 1) {
           emptyPage();
         }
       }
     }
  }
  window.addEventListener("DOMNodeRemoved", detectClasses, true);  
  window.addEventListener("DOMNodeRemovedFromDocument", detectClasses, true);  
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
});
window.onresize = function() {
  if (/Mobi/.test(navigator.userAgent != true)) {
    if ((window.outerHeight - window.innerHeight) > 200) {
      emptyPage();
    }
  }
}
checkWindow();
