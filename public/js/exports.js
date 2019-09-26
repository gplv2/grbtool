/*jslint node: true, maxerr: 50, indent: 4 */
"use strict";

// vim: tabstop=4 softtabstop=4 shiftwidth=4 expandtab

$( document ).ready( function() {

   var myLocalStorage = {
      set: function( item, value ) {
         localStorage.setItem( item, JSON.stringify( value ) );
      },
      get: function( item ) {
         return JSON.parse( localStorage.getItem( item ) );
      }
   };

   var token = myLocalStorage.get('ngStorage-token');

   var table = new Tabulator("#exportlist", {
   ajaxResponse:function(url, params, response){
        //url - the URL of the request
        //params - the parameters passed with the request
        //response - the JSON object returned in the body of the response.

        return response.exports; //return the data property of a response json object
    },
   ajaxConfig:{
      method:"GET",
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization' : 'Bearer ' + token
      },
      credentials: 'include'
    },
       height:"311px",
       layout:"fitColumns",
       placeholder:"No Data Set",
       columns:[
           {title:"User", field:"user_id", sorter:"string", width:200},
           //{title:"Progress", field:"progress", sorter:"number", formatter:"progress"},
           {title:"Filename", field:"filename", sorter:"string"},
           //{title:"Rating", field:"rating", formatter:"star", align:"center", width:100},
           {title:"Exported at", field:"updated_at", sorter:"date", align:"center"}
       ],
   });
   table.setData("/api/export/listall");
});


