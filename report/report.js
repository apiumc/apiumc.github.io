WDK.tpl('report/view', 'report/view', function(root){  
    if (WDK.pivot){
        WDK.pivot(root)
    }else{
        WDK.script('js/umc.pivot.js').wait(function () {
            WDK.pivot(root);
        })
    }
});