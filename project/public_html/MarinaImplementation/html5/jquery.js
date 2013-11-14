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
});

