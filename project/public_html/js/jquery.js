$(document).ready(function() {
        $( "#accordion" ).accordion({
            heightStyle: "content"});
	$( "#sortable" ).sortable({
            containment: 'parent'
        });
        $( "#sortable" ).disableSelection();
	$( "#slider-range-max" ).slider({
            range: "max",
            min: 0,
            max: 10,
            value: 0,
            slide: function( event, ui ) {
                $( "#amountHidden" ).val( ui.value );
            }
        });
        $( "#amountHidden" ).val($( "#slider-range-max" ).slider( "value" ) );
        $("#up").button({
                icons: {
                    primary: "broom"
                }
        });
        $("#gif").button({
                icons: {
                    primary: "wand"
                }
        });
        $("#mov").button({
                icons: {
                    primary: "mov"
                }
        });
         $("#rotateButton").button({
                icons: {
                    primary: "wand"
                }
        });
        $("#bgImg").button({
            icons: {
                primary: "imac"
            }
        });
        $("#addImg").button({
            icons: {
                primary: "lens"
            }
        });
        $("#play").button({
            icons: {
                primary: "ui-icon-play"
            }
        });
        $("#pause").button({
            icons: {
                primary: "ui-icon-stop"
            }
        });
        $("#saveParents").button({
            icons: {
                primary: "wand"
            }
        });
        
         
});

