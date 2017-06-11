/*jslint node: true, maxerr: 50, indent: 4 */

"use strict";

var my_history = new Object();
var start_time = 0;

/*
$(window).resize(function () {
    var canvaswidth=$('#map-wrap').parent().css('width');
    $('#map-wrap').css("width", canvaswidth);
}
*/

var canvaswidth = $( '#map' ).parent().css( 'width' );
var w = $( "#map" ).width();
$( '#map' ).css( "height", w * 4 / 7 );

initmap();

var myLocalStorage = {
    set: function( item, value ) {
        localStorage.setItem( item, JSON.stringify( value ) );
    },
    get: function( item ) {
        return JSON.parse( localStorage.getItem( item ) );
    }
};

$( document ).ready( function() {
    if ( !library ) {
        var library = {};
    }

    $( '#radio' ).buttonset();
    library.json = {
        syntaxHighlight: function( json ) {
            json = json.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
            return json.replace( /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function( match ) {
                var cls = 'number';
                if ( /^"/.test( match ) ) {
                    if ( /:$/.test( match ) ) {
                        cls = 'key';
                    } else {
                        cls = 'string';
                    }
                } else if ( /true|false/.test( match ) ) {
                    cls = 'boolean';
                } else if ( /null/.test( match ) ) {
                    cls = 'null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            } );
        }
    };


    $( "#reqbutton" ).click( function( event ) {
        event.preventDefault();

        $( 'body' ).css( 'cursor', 'wait' );

        // Get some values from elements on the page:
        var mt = $( "#mediatype" ).val();
        var mc = $( "#mediacount" ).val();

        var token = myLocalStorage.get( 'ngStorage-token' );

        var url = "/api/data";

        // Get history data

        $( '#cblist input[type=radio]' ).each( function( i, item ) {
            if ( $( this ).is( ':checked' ) ) {
                if ( console && console.log ) {
                    //console.log($(this));
                }
                var name = $( this ).closest( 'div' ).attr( 'data-name' );
                var val = $( this ).val();
                my_history[ name ] = val;
                console.log( val );
                console.log( name );
            }
        } );
        // return true;

        var fdata = {};

        /* Gather form data */
        fdata[ 'type' ] = mt;
        fdata[ 'user_id' ] = parseInt( $( '#userid' ).val() );
        fdata[ 'request_id' ] = $( '#requestid' ).val()
        fdata[ 'quantity' ] = parseInt( mc );
        fdata[ 'exclude' ] = [];
        fdata[ 'history' ] = {};

        var size = Object.keys( my_history ).length;
        if ( size !== 0 ) {
            fdata[ 'history' ] = my_history;
        }

        $( '#msg' ).html( 'Calling API : <pre class="json">' + library.json.syntaxHighlight( JSON.stringify( fdata, null, 4 ) ) + '</pre>' );

        // Filing out the json freeform text field
        $( '#apidata' ).html( JSON.stringify( fdata ) );

        // Assign handlers immediately after making the request,
        $.ajax( {
                method: "POST",
                url: url,
                data: JSON.stringify( fdata ),
                cache: false,
                beforeSend: function( xhr, settings ) {
                    if ( token ) {
                        xhr.setRequestHeader( 'Authorization', 'Bearer ' + token );
                    }
                    xhr.setRequestHeader( 'Content-Type', 'application/json' );
                    xhr.overrideMimeType( 'application/json' );
                    start_time = new Date().getTime();
                }
            } )
            .done( function( data ) {
                var request_time = new Date().getTime() - start_time;
                if ( console && console.log ) {
                    //console.log( "success" );
                    //console.log( data );
                }

                $( '#map-wrap' ).empty();

                /* add the results to the empty API pane */
                $( '#map-wrap' ).append( '<form id="myform">' );
                $( '#myform' ).append( '<div id="divcblist">' );
                $( '#divcblist' ).append( '<fieldset id="cblist">' );

                /*
                                var container = $('#cblist');
                                var inputs = container.find('input');
                                var id = inputs.length+1;
                */
                function addOption( hash, crid, result ) {
                    //console.log(result);
                    //var crid=Object.keys(result)[0];
                    //var label=result[crid];

                    $( '#cblist' ).append( '<div class="widget" id="widget_' + hash + '" data-name="' + crid + '">' );
                    // $('#widget_'+hash).append('<h3>'+result+'</>');
                    $( '#widget_' + hash ).append( '<fieldset id="fset_' + hash + '">' );
                    $( '#fset_' + hash ).append( '<legend>' + result + ':</legend>' );

                    var optioncontainer = $( '#fset_' + hash );
                    $( '<input />', {
                        type: 'radio',
                        id: 'radio1_' + hash,
                        name: 'radio_group_' + hash,
                        value: 'positive'
                    } ).appendTo( optioncontainer );
                    $( '<label />', {
                        'for': 'radio1_' + hash,
                        text: 'Positive'
                    } ).appendTo( optioncontainer );

                    $( '<input />', {
                        type: 'radio',
                        id: 'radio2_' + hash,
                        name: 'radio_group_' + hash,
                        value: 'neutral'
                    } ).appendTo( optioncontainer );
                    $( '<label />', {
                        'for': 'radio2_' + hash,
                        text: 'Neutral'
                    } ).appendTo( optioncontainer );

                    $( '<input />', {
                        type: 'radio',
                        id: 'radio3_' + hash,
                        name: 'radio_group_' + hash,
                        value: 'negative'
                    } ).appendTo( optioncontainer );
                    $( '<label />', {
                        'for': 'radio3_' + hash,
                        text: 'Negative'
                    } ).appendTo( optioncontainer );

                    //$('<input />', { type: 'radio', id: 'radio0_'+hash , name: 'radio_group_'+hash}).appendTo(optioncontainer);
                    //$('<label />', { 'for': 'radio0_'+hash, text: 'None' }).appendTo(optioncontainer);

                    $( "#fset_" + hash + " > input" ).checkboxradio();
                    $( "#fset_" + hash ).controlgroup();
                }

                //console.log(data);return true;
                //console.log(data.results);return;
                $.each( data.results, function( i, result ) {
                    // var crid=Object.keys(result)[0];
                    // var label=result[crid];
                    //console.log(i);

                    var hash = md5( i ); // "2063c1608d6e0baf80249c42e2be5804"

                    var $myDiv = $( '#' + 'cb' + hash );
                    if ( !$myDiv.length ) {
                        //console.log( result );
                        //$('<input />', { type: 'checkbox', id: 'cb'+hash, value: result }).appendTo(container);
                        //$('<label />', { 'for': 'cb'+hash, text: result }).appendTo(container);
                        addOption( hash, i, result );
                        //id++;
                    }
                } );

                /* none of the above option */
                //var container = $('#divcblist');

                $( '#cblist' ).append( '<form class="widget" id="cb_none_div">' );
                var container = $( '#cb_none_div' );
                $( '<input />', {
                    type: 'checkbox',
                    id: 'cb_none',
                    value: 'None of the above',
                    class: ''
                } ).appendTo( container );
                $( '<label />', {
                    'for': 'cb_none',
                    text: 'None of the above',
                    class: 'col-md-offset-0 col-md-3 control-label',
                    style: 'margin-top: 15px'
                } ).appendTo( container );
                $( '#cb_none_div > input' ).checkboxradio();

                $( '<button />', {
                    type: 'button',
                    id: 'recmore',
                    text: 'Again',
                    class: "btn btn-primary pull-left col-md-offset-0 col-md-2",
                    style: 'margin-top: 15px; margin-left: 10px'
                } ).appendTo( container );

                $( '#recmore' ).click( function( event ) {
                    $( "#reqbutton" ).click();
                } );

                $( '#cb_none_div > input' ).click( function( event ) {
                    event.preventDefault();
                    $( '#cblist input[type=radio]' ).each( function( i, item ) {
                        if ( console && console.log ) {
                            console.log( $( item ).val() );
                        }
                        if ( $( item ).val() == 'negative' ) {
                            $( this ).click();
                            //$(this).prop("checked", true);
                        }
                    } );
                } );

                /*
                                $('#cblist input[type=radio]:nth-child(2)').each(function (i,item) {
                                    if($(this).is(':checked')) {
                                        console.log($(this));
                                    }
                                });
                */

                $( "#testbutton" ).click( function( event ) {
                    event.preventDefault();
                    $( '#cblist input[type=radio]' ).each( function( i, item ) {
                        if ( $( this ).is( ':checked' ) ) {
                            //console.log($(this).closest('div').attr('data-name'));
                            if ( console && console.log ) {
                                console.log( $( this ) );
                                console.log( $( this ).closest( 'div' ) );
                            }
                        }
                    } );
                } );

                $( '#msg' ).append( '<p>Success API : ' + JSON.stringify( data ) + ' (in ' + request_time + 'ms.)</p>' );
                $( '#msg > p:last-child' ).removeClass().addClass( "alert alert-success" );
            } )
            .fail( function( data ) {
                var request_time = new Date().getTime() - start_time;
                $( '#msg' ).append( '<div>Failure API : ' + JSON.stringify( data.responseJSON ) + ' (in ' + request_time + 'ms.) </div>' );
                $( '#msg > div:last-child' ).removeClass().addClass( "alert alert-warning" );
                if ( console && console.log ) {
                    console.log( data );
                    console.log( "error" );
                }
                return false;
            } )
            .always( function() {
                $( 'body' ).css( 'cursor', 'default' );
                $( '#msg' ).append( '<p>Status API : Request finished<p>' );
                if ( console && console.log ) {
                    //console.log( "finished" );
                }
            } );
    } );

    function reviver2( key, val ) {
        if ( key === 'quantity' ) {
            return parseInt( val );
        } else if ( typeof val === 'string' ) {
            // restore ' (undo JSON_HEX_APOS)
            val = val.replace( /\u0027/g, "'" );
            // return val.replace(/\s+/g, ' '); // remove extra spaces
            return val;
        } else {
            return val; // return unchanged
        }
    }

    $( "#codebutton" ).click( function( event ) {
        event.preventDefault();

        $( 'body' ).css( 'cursor', 'wait' );

        var token = myLocalStorage.get( 'ngStorage-token' );

        var url = "/api/data";

        var fdata = new Object();

        try {
            var str = $( '#apidata' ).val();
            fdata = JSON.parse( str, reviver2 );
            if ( console && console.log ) {
                console.log( fdata );
            }
        } catch ( e ) {
            $( '#msg' ).html( '<p>Error API : JSON does not pass validation,  check syntax of the data in the JSON text field' );
            $( '#msg' ).html( e );
            $( 'body' ).css( 'cursor', 'default' );
            return false;
        }

        var size = fdata.length;
        if ( size == 0 ) {
            $( '#msg' ).html( '<p>Error API : Please enter valid data in the JSON text field' );
            $( 'body' ).css( 'cursor', 'default' );
            return false;
        }

        //fdata['token'] = token;

        $( '#msg' ).html( '<p>Calling API : ' + JSON.stringify( fdata ) + '</p>' );

        // Assign handlers immediately after making the request,
        $.ajax( {
                method: "POST",
                url: url,
                data: JSON.stringify( fdata ),
                cache: false,
                beforeSend: function( xhr, settings ) {
                    xhr.setRequestHeader( 'Authorization', 'Bearer ' + token );
                    xhr.setRequestHeader( 'Content-Type', 'application/json' );
                    xhr.overrideMimeType( 'application/json' );
                }
            } )
            .done( function( data ) {
                if ( console && console.log ) {
                    //console.log( "Sample of data:", data.slice( 0, 100 ) );
                    //console.log( "success" );
                    //console.log( data );
                }

                $( '#map-wrap' ).append( '<form id="myform">' );

                $( '#myform' ).append( '<div id="divcblist">' );
                $( '#divcblist' ).append( '<fieldset id="cblist">' );

                var container = $( '#cblist' );
                var inputs = container.find( 'input' );
                var id = inputs.length + 1;

                // Iterate over all existing checkboxes remove from suggestion list when missing
                var fdata = {};

                $( '#cblist input[type=checkbox]' ).each( function( i, item ) {
                    // console.log(this.value);
                    var md5id = $( this ).attr( 'id' );

                    var found = false;
                    $.each( data.results, function( i, result ) {
                        var hash = md5( result );
                        if ( 'cb' + hash == md5id ) {
                            found = true;
                            return found;
                        }
                    } );
                    if ( !found ) {
                        $( this ).parent().remove();
                    }
                } );
                // console.log (my_history);

                /*
                                //if ($(this).is(":checked")) 
                */

                // Iterate over presented results and add to list when missing
                $.each( data.results, function( i, result ) {
                    var hash = md5( result );

                    var $myDiv = $( '#' + 'cb' + hash );
                    if ( !$myDiv.length ) {
                        //console.log( result );
                        $( '<input />', {
                            type: 'checkbox',
                            id: 'cb' + hash,
                            value: result
                        } ).appendTo( container );
                        $( '<label />', {
                            'for': 'cb' + hash,
                            text: result
                        } ).appendTo( container );
                        id++;
                    }
                } );

                // $('#myform').append('</fieldset></div>');
                // $('#map-wrap').append('</form');

                $( '#msg' ).append( '<p>Success API : ' + JSON.stringify( data ) + '</p>' );
            } )
            .fail( function( data ) {
                if ( console && console.log ) {
                    console.log( data );
                    console.log( "error" );
                }
                $( '#msg' ).append( '<p>Failure API : ' + JSON.stringify( data.responseJSON ) + '</p>' );
                return false;
            } )
            .always( function() {
                $( 'body' ).css( 'cursor', 'default' );
                $( '#msg' ).append( '<p>Status API : Request finished<p>' );
                if ( console && console.log ) {
                    //console.log( "finished" );
                }
            } );
        // return true;
    } );

    $( "#resetbutton" ).click( function( event ) {
        event.preventDefault();
        $( '#msg' ).html( '<p>Clear input</p>' );
        $( 'body' ).css( 'cursor', 'wait' );
        $( '#address' ).val( "" );

        //for (var member in my_history) delete my_history[member];
        //$('#apidata').empty();
        $( 'body' ).css( 'cursor', 'default' );
    } );
} );