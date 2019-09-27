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

   var customMutator = function(value, data, type, params, component){
      //value - original value of the cell
      //data - the data for the row
      //type - the type of mutation occurring  (data|edit)
      //params - the mutatorParams object from the column definition
      //component - when the "type" argument is "edit", this contains the cell component for the edited cell, otherwise it is the column component for the column

      return "public/"+value; //return the new value for the cell data.
   } ;

   var table = new Tabulator("#exportlist", {
      pagination:"local",       //paginate the data
      paginationSize:8,         //allow 7 rows per page of data
      initialSort:[             //set the initial sort order of the data
         {column:"created_at", dir:"desc"},
      ],
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
              {title:"User", field:"user.name", sorter:"string", width:200},
              //{title:"Progress", field:"progress", sorter:"number", formatter:"progress"},
              {title:"Filename", field:"filename", sorter:"string", formatter: "link", mutator: customMutator},
              //{title:"Rating", field:"rating", formatter:"star", align:"center", width:100},
              {title:"Exported at", field:"created_at", sorter:"datetime", align:"center",  sorterParams:{format:"YYYY-MM-DD hh:mm:ss", alignEmptyValues:"top",}}
          ],
   });
   table.setData("/api/export/listall");
});


