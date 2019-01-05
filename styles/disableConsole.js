function emptyPage(){
     document.write("")
}
function ck() {
    console.profile();
    console.profileEnd();
    if(console.clear) { console.clear() };
    if (typeof console.profiles =="object"){
        return console.profiles.length > 0;
    }
}
function checkWindow(){
if( (window.console && (console.firebug || console.table && /firebug/i.test(console.table()) )) || (typeof opera == 'object' && typeof opera.postError == 'function' && console.profile.length > 0)){
  emptyPage();
}
if(typeof console.profiles =="object"&&console.profiles.length > 0){
  emptyPage();
}
}
checkWindow();
$("document").ready(function(){
    while(true){
    if((window.outerHeight-window.innerHeight)>200){
         emptyPage();
    }
    checkWindow();
    }
})
window.onresize = function(){
if((window.outerHeight-window.innerHeight)>200){
   emptyPage();
}
}
