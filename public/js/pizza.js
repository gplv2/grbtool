( function( f ) {
    if ( typeof exports === "object" && typeof module !== "undefined" ) {
        module.exports = f()
    } else if ( typeof define === "function" && define.amd ) {
        define( [], f )
    } else {
        var g;
        if ( typeof window !== "undefined" ) {
            g = window
        } else if ( typeof global !== "undefined" ) {
            g = global
        } else if ( typeof self !== "undefined" ) {
            g = self
        } else {
            g = this
        }
        g.geos = f()
    }
} )( function() {
    var define, module, exports;
    return ( function e( t, n, r ) {
        function s( o, u ) {
            if ( !n[ o ] ) {
                if ( !t[ o ] ) {
                    var a = typeof require == "function" && require;
                    if ( !u && a ) return a( o, !0 );
                    if ( i ) return i( o, !0 );
                    var f = new Error( "Cannot find module '" + o + "'" );
                    throw f.code = "MODULE_NOT_FOUND", f
                }
                var l = n[ o ] = {
                    exports: {}
                };
                t[ o ][ 0 ].call( l.exports, function( e ) {
                    var n = t[ o ][ 1 ][ e ];
                    return s( n ? n : e )
                }, l, l.exports, e, t, n, r )
            }
            return n[ o ].exports
        }
        var i = typeof require == "function" && require;
        for ( var o = 0; o < r.length; o++ ) s( r[ o ] );
        return s
    } )( {
        1: [ function( require, module, exports ) {

        }, {} ],
        2: [ function( require, module, exports ) {
            var jxon = require( 'jxon' );


            function geojsontoosm( geojson ) {
                var features = geojson.features || geojson.length > 0 ? geojson : [ geojson ];

                var nodes = [],
                    nodesIndex = {},
                    ways = [],
                    relations = [];

                features.forEach( function( feature ) { // feature can also be a pure GeoJSON geometry object
                    // todo: GeometryCollection?
                    var properties = feature.properties || {},
                        geometry = feature.geometry || feature
                    // todo: validity check
                    // todo: ids if (feature.id && feature.id.match(/^(node|way|relation)\/(\d+)$/)) id = …
                    switch ( geometry.type ) {
                        case "Point":
                            processPoint( geometry.coordinates, properties, nodes, nodesIndex )
                            break;
                        case "LineString":
                            processLineString( geometry.coordinates, properties, ways, nodes, nodesIndex )
                            break;
                        case "Polygon":
                            processMultiPolygon( [ geometry.coordinates ], properties, relations, ways, nodes, nodesIndex )
                            break;
                        case "Multipolygon":
                            processMultiPolygon( geometry.coordinates, properties, relations, ways, nodes, nodesIndex )
                            break;
                        default:
                            console.error( "unknown or unsupported geometry type:", geometry.type );
                    }
                } );

                //console.log(nodes, ways, relations)
                var lastNodeId = -1,
                    lastWayId = -1,
                    lastRelationId = -1

                function jxonTags( tags ) {
                    var res = []
                    for ( var k in tags ) {
                        res.push( {
                            "@k": k,
                            "@v": tags[ k ]
                        } )
                    }
                    return res
                }
                var jxonData = {
                    osm: {
                        "@version": "0.6",
                        "@generator": "geojsontoosm",
                        "node": nodes.map( function( node ) {
                            node.id = lastNodeId--
                                return {
                                    "@id": node.id,
                                    "@lat": node.lat,
                                    "@lon": node.lon,
                                    // todo: meta
                                    "tag": jxonTags( node.tags )
                                }
                        } ),
                        "way": ways.map( function( way ) {
                            way.id = lastWayId--
                                return {
                                    "@id": way.id,
                                    "nd": way.nodes.map( function( nd ) {
                                        return {
                                            "@ref": nd.id
                                        }
                                    } ),
                                    "tag": jxonTags( way.tags )
                                }
                        } ),
                        "relation": relations.map( function( relation ) {
                            relation.id = lastRelationId--
                                return {
                                    "@id": relation.id,
                                    "member": relation.members.map( function( member ) {
                                        return {
                                            "@type": member.type,
                                            "@ref": member.elem.id,
                                            "@role": member.role
                                        }
                                    } ),
                                    "tag": jxonTags( relation.tags )
                                    // todo: meta
                                }
                        } )
                    }
                }
                // todo: sort by id
                return jxon.jsToString( jxonData )
            }

            function getNodeHash( coords ) {
                return JSON.stringify( coords )
            }

            function emptyNode( coordinates, properties ) {
                return {
                    tags: properties,
                    lat: coordinates[ 1 ],
                    lon: coordinates[ 0 ]
                }
                // todo: meta
                // todo: move "nodesIndex[hash] = node" here
            }

            function processPoint( coordinates, properties, nodes, nodesIndex ) {
                var hash = getNodeHash( coordinates ),
                    node
                if ( !( node = nodesIndex[ hash ] ) ) {
                    nodes.push( node = emptyNode( coordinates, properties ) )
                    nodesIndex[ hash ] = node
                } else {
                    for ( var k in properties ) {
                        node.tags[ k ] = properties[ k ]
                    }
                    // todo: meta
                }
            }

            function processLineString( coordinates, properties, ways, nodes, nodesIndex ) {
                var way = {
                    tags: properties,
                    nodes: []
                }
                ways.push( way )
                // todo: meta
                coordinates.forEach( function( point ) {
                    var hash = getNodeHash( point ),
                        node
                    if ( !( node = nodesIndex[ hash ] ) ) {
                        nodes.push( node = emptyNode( point, {} ) )
                        nodesIndex[ hash ] = node
                    }
                    way.nodes.push( node )
                } )
            }

            function processMultiPolygon( coordinates, properties, relations, ways, nodes, nodesIndex ) {
                // simple area with only 1 ring: -> closed way
                if ( coordinates.length === 1 && coordinates[ 0 ].length === 1 )
                    return processLineString( coordinates[ 0 ][ 0 ], properties, ways, nodes, nodesIndex )
                // multipolygon
                var relation = {
                    tags: properties,
                    members: []
                }
                relation.tags[ "type" ] = "multipolygon"
                relations.push( relation )
                // todo: meta
                coordinates.forEach( function( polygon ) {
                    polygon.forEach( function( ring, index ) {
                        var way = {
                            tags: {},
                            nodes: []
                        }
                        ways.push( way )
                        relation.members.push( {
                            elem: way,
                            type: "way",
                            role: index === 0 ? "outer" : "inner"
                        } )
                        ring.forEach( function( point ) {
                            var hash = getNodeHash( point ),
                                node
                            if ( !( node = nodesIndex[ hash ] ) ) {
                                nodes.push( node = emptyNode( point, {} ) )
                                nodesIndex[ hash ] = node
                            }
                            way.nodes.push( node )
                        } )
                    } )
                } )
            }

            module.exports = geojsontoosm;

        }, {
            "jxon": 3
        } ],
        3: [ function( require, module, exports ) {
            /*
             * JXON framework - Copyleft 2011 by Mozilla Developer Network
             *
             * Revision #1 - September 5, 2014
             *
             * https://developer.mozilla.org/en-US/docs/JXON
             *
             * This framework is released under the GNU Public License, version 3 or later.
             * http://www.gnu.org/licenses/gpl-3.0-standalone.html
             *
             * small modifications performed by the iD project:
             * https://github.com/openstreetmap/iD/commits/18aa33ba97b52cacf454e95c65d154000e052a1f/js/lib/jxon.js
             *
             * small modifications performed by user @bugreport0
             * https://github.com/tyrasd/JXON/pull/2/commits
             *
             * some additions and modifications by user @igord
             * https://github.com/tyrasd/JXON/pull/5/commits
             *
             * adapted for nodejs and npm by Martin Raifer <tyr.asd@gmail.com>
             */

            /*
             * Modifications:
             * - added config method that excepts objects with props:
             *   - valueKey (default: keyValue)
             *   - attrKey (default: keyAttributes)
             *   - attrPrefix (default: @)
             *   - lowerCaseTags (default: true)
             *   - trueIsEmpty (default: true)
             *   - autoDate (default: true)
             * - turning tag and attributes to lower case is optional
             * - optional turning boolean true to empty tag
             * - auto Date parsing is optional
             * - added parseXml method
             *
             */

            ( function( root, factory ) {
                if ( typeof define === 'function' && define.amd ) {
                    // AMD. Register as an anonymous module.
                    define( factory( window ) );
                } else if ( typeof exports === 'object' ) {
                    if ( typeof window === 'object' && window.DOMImplementation ) {
                        // Browserify. hardcode usage of browser's own XMLDom implementation
                        // see https://github.com/tyrasd/jxon/issues/18
                        module.exports = factory( window );
                    } else {
                        // Node. Does not work with strict CommonJS, but
                        // only CommonJS-like environments that support module.exports,
                        // like Node.
                        module.exports = factory( require( 'xmldom' ) );
                    }
                } else {
                    // Browser globals (root is window)
                    root.JXON = factory( window );
                }
            }( this, function( xmlDom ) {

                return new( function() {
                    var
                        sValProp = "keyValue",
                        sAttrProp = "keyAttributes",
                        sAttrsPref = "@",
                        sLowCase = true,
                        sEmptyTrue = true,
                        sAutoDate = true,
                        sIgnorePrefixed = false,
                        parserErrorHandler,
                        DOMParser,
                        sParseValues = true,
                        /* you can customize these values */
                        aCache = [],
                        rIsNull = /^\s*$/,
                        rIsBool = /^(?:true|false)$/i;

                    function parseText( sValue ) {
                        if ( !sParseValues ) return sValue;
                        if ( rIsNull.test( sValue ) ) {
                            return null;
                        }
                        if ( rIsBool.test( sValue ) ) {
                            return sValue.toLowerCase() === "true";
                        }
                        if ( isFinite( sValue ) ) {
                            return parseFloat( sValue );
                        }
                        if ( sAutoDate && isFinite( Date.parse( sValue ) ) ) {
                            return new Date( sValue );
                        }
                        return sValue;
                    }

                    function EmptyTree() {}
                    EmptyTree.prototype.toString = function() {
                        return "null";
                    };
                    EmptyTree.prototype.valueOf = function() {
                        return null;
                    };

                    function objectify( vValue ) {
                        return vValue === null ? new EmptyTree() : vValue instanceof Object ? vValue : new vValue.constructor( vValue );
                    }

                    function createObjTree( oParentNode, nVerb, bFreeze, bNesteAttr ) {
                        var
                            nLevelStart = aCache.length,
                            bChildren = oParentNode.hasChildNodes(),
                            bAttributes = oParentNode.nodeType === oParentNode.ELEMENT_NODE && oParentNode.hasAttributes(),
                            bHighVerb = Boolean( nVerb & 2 );

                        var
                            sProp, vContent, nLength = 0,
                            sCollectedTxt = "",
                            vResult = bHighVerb ? {} : /* put here the default value for empty nodes: */ ( sEmptyTrue ? true : '' );

                        if ( bChildren ) {
                            for ( var oNode, nItem = 0; nItem < oParentNode.childNodes.length; nItem++ ) {
                                oNode = oParentNode.childNodes.item( nItem );
                                if ( oNode.nodeType === 4 ) {
                                    sCollectedTxt += oNode.nodeValue;
                                } /* nodeType is "CDATASection" (4) */
                                else if ( oNode.nodeType === 3 ) {
                                    sCollectedTxt += oNode.nodeValue.trim();
                                } /* nodeType is "Text" (3) */
                                else if ( oNode.nodeType === 1 && !( sIgnorePrefixed && oNode.prefix ) ) {
                                    aCache.push( oNode );
                                } /* nodeType is "Element" (1) */
                            }
                        }

                        var nLevelEnd = aCache.length,
                            vBuiltVal = parseText( sCollectedTxt );

                        if ( !bHighVerb && ( bChildren || bAttributes ) ) {
                            vResult = nVerb === 0 ? objectify( vBuiltVal ) : {};
                        }

                        for ( var nElId = nLevelStart; nElId < nLevelEnd; nElId++ ) {
                            sProp = aCache[ nElId ].nodeName;
                            if ( sLowCase ) sProp = sProp.toLowerCase();
                            vContent = createObjTree( aCache[ nElId ], nVerb, bFreeze, bNesteAttr );
                            if ( vResult.hasOwnProperty( sProp ) ) {
                                if ( vResult[ sProp ].constructor !== Array ) {
                                    vResult[ sProp ] = [ vResult[ sProp ] ];
                                }
                                vResult[ sProp ].push( vContent );
                            } else {
                                vResult[ sProp ] = vContent;
                                nLength++;
                            }
                        }

                        if ( bAttributes ) {
                            var
                                nAttrLen = oParentNode.attributes.length,
                                sAPrefix = bNesteAttr ? "" : sAttrsPref,
                                oAttrParent = bNesteAttr ? {} : vResult;

                            for ( var oAttrib, oAttribName, nAttrib = 0; nAttrib < nAttrLen; nLength++, nAttrib++ ) {
                                oAttrib = oParentNode.attributes.item( nAttrib );
                                oAttribName = oAttrib.name;
                                if ( sLowCase ) oAttribName = oAttribName.toLowerCase();
                                oAttrParent[ sAPrefix + oAttribName ] = parseText( oAttrib.value.trim() );
                            }

                            if ( bNesteAttr ) {
                                if ( bFreeze ) {
                                    Object.freeze( oAttrParent );
                                }
                                vResult[ sAttrProp ] = oAttrParent;
                                nLength -= nAttrLen - 1;
                            }
                        }

                        if ( nVerb === 3 || ( nVerb === 2 || nVerb === 1 && nLength > 0 ) && sCollectedTxt ) {
                            vResult[ sValProp ] = vBuiltVal;
                        } else if ( !bHighVerb && nLength === 0 && sCollectedTxt ) {
                            vResult = vBuiltVal;
                        }

                        if ( bFreeze && ( bHighVerb || nLength > 0 ) ) {
                            Object.freeze( vResult );
                        }

                        aCache.length = nLevelStart;

                        return vResult;
                    }

                    function loadObjTree( oXMLDoc, oParentEl, oParentObj ) {
                        var vValue, oChild;

                        if ( oParentObj.constructor === String || oParentObj.constructor === Number || oParentObj.constructor === Boolean ) {
                            oParentEl.appendChild( oXMLDoc.createTextNode( oParentObj.toString() ) ); /* verbosity level is 0 or 1 */
                            if ( oParentObj === oParentObj.valueOf() ) {
                                return;
                            }
                        } else if ( oParentObj.constructor === Date ) {
                            oParentEl.appendChild( oXMLDoc.createTextNode( oParentObj.toGMTString() ) );
                        }

                        for ( var sName in oParentObj ) {
                            vValue = oParentObj[ sName ];
                            if ( vValue === null ) vValue = {};
                            if ( isFinite( sName ) || vValue instanceof Function ) {
                                continue;
                            } /* verbosity level is 0 */
                            // when it is _
                            if ( sName === sValProp ) {
                                if ( vValue !== null && vValue !== true ) {
                                    oParentEl.appendChild( oXMLDoc.createTextNode( vValue.constructor === Date ? vValue.toGMTString() : String( vValue ) ) );
                                }
                            } else if ( sName === sAttrProp ) { /* verbosity level is 3 */
                                for ( var sAttrib in vValue ) {
                                    oParentEl.setAttribute( sAttrib, vValue[ sAttrib ] );
                                }
                            } else if ( sName === sAttrsPref + 'xmlns' ) {
                                // do nothing: special handling of xml namespaces is done via createElementNS()
                            } else if ( sName.charAt( 0 ) === sAttrsPref ) {
                                oParentEl.setAttribute( sName.slice( 1 ), vValue );
                            } else if ( vValue.constructor === Array ) {
                                for ( var nItem = 0; nItem < vValue.length; nItem++ ) {
                                    oChild = oXMLDoc.createElementNS( vValue[ nItem ][ sAttrsPref + 'xmlns' ] || oParentEl.namespaceURI, sName );
                                    loadObjTree( oXMLDoc, oChild, vValue[ nItem ] );
                                    oParentEl.appendChild( oChild );
                                }
                            } else {
                                oChild = oXMLDoc.createElementNS( ( vValue || {} )[ sAttrsPref + 'xmlns' ] || oParentEl.namespaceURI, sName );
                                if ( vValue instanceof Object ) {
                                    loadObjTree( oXMLDoc, oChild, vValue );
                                } else if ( vValue !== null && vValue !== true ) {
                                    oChild.appendChild( oXMLDoc.createTextNode( vValue.toString() ) );
                                } else if ( !sEmptyTrue && vValue === true ) {
                                    oChild.appendChild( oXMLDoc.createTextNode( vValue.toString() ) );

                                }
                                oParentEl.appendChild( oChild );
                            }
                        }
                    }

                    this.xmlToJs = this.build = function( oXMLParent, nVerbosity /* optional */ , bFreeze /* optional */ , bNesteAttributes /* optional */ ) {
                        var _nVerb = arguments.length > 1 && typeof nVerbosity === "number" ? nVerbosity & 3 : /* put here the default verbosity level: */ 1;
                        return createObjTree( oXMLParent, _nVerb, bFreeze || false, arguments.length > 3 ? bNesteAttributes : _nVerb === 3 );
                    };

                    this.jsToXml = this.unbuild = function( oObjTree, sNamespaceURI /* optional */ , sQualifiedName /* optional */ , oDocumentType /* optional */ ) {
                        var documentImplementation = xmlDom.document && xmlDom.document.implementation || new xmlDom.DOMImplementation();
                        var oNewDoc = documentImplementation.createDocument( sNamespaceURI || null, sQualifiedName || "", oDocumentType || null );
                        loadObjTree( oNewDoc, oNewDoc.documentElement || oNewDoc, oObjTree );
                        return oNewDoc;
                    };

                    this.config = function( o ) {
                        if ( typeof o === 'undefined' ) {
                            return {
                                valueKey: sValProp,
                                attrKey: sAttrProp,
                                attrPrefix: sAttrsPref,
                                lowerCaseTags: sLowCase,
                                trueIsEmpty: sEmptyTrue,
                                autoDate: sAutoDate,
                                ignorePrefixNodes: sIgnorePrefixed,
                                parseValues: sParseValues,
                                parserErrorHandler: parserErrorHandler
                            };
                        }
                        for ( var k in o ) {
                            switch ( k ) {
                                case 'valueKey':
                                    sValProp = o.valueKey;
                                    break;
                                case 'attrKey':
                                    sAttrProp = o.attrKey;
                                    break;
                                case 'attrPrefix':
                                    sAttrsPref = o.attrPrefix;
                                    break;
                                case 'lowerCaseTags':
                                    sLowCase = o.lowerCaseTags;
                                    break;
                                case 'trueIsEmpty':
                                    sEmptyTrue = o.trueIsEmpty;
                                    break;
                                case 'autoDate':
                                    sAutoDate = o.autoDate;
                                    break;
                                case 'ignorePrefixedNodes':
                                    sIgnorePrefixed = o.ignorePrefixedNodes;
                                    break;
                                case 'parseValues':
                                    sParseValues = o.parseValues;
                                    break;
                                case 'parserErrorHandler':
                                    parserErrorHandler = o.parserErrorHandler;
                                    DOMParser = new xmlDom.DOMParser( {
                                        errorHandler: parserErrorHandler,
                                        locator: {}
                                    } );
                                    break;
                                default:
                                    break;
                            }
                        }
                    };

                    this.stringToXml = function( xmlStr ) {
                        if ( !DOMParser ) DOMParser = new xmlDom.DOMParser();
                        return DOMParser.parseFromString( xmlStr, 'application/xml' );
                    };

                    this.xmlToString = function( xmlObj ) {
                        if ( typeof xmlObj.xml !== "undefined" ) {
                            return xmlObj.xml;
                        } else {
                            return ( new xmlDom.XMLSerializer() ).serializeToString( xmlObj );
                        }
                    };

                    this.stringToJs = function( str ) {
                        var xmlObj = this.stringToXml( str );
                        return this.xmlToJs( xmlObj );
                    };

                    this.jsToString = this.stringify = function( oObjTree, sNamespaceURI /* optional */ , sQualifiedName /* optional */ , oDocumentType /* optional */ ) {
                        return this.xmlToString(
                            this.jsToXml( oObjTree, sNamespaceURI, sQualifiedName, oDocumentType )
                        );
                    };
                } )();

            } ) );

        }, {
            "xmldom": 1
        } ]
    }, {}, [ 2 ] )( 2 )
} );
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3Nlci1yZXNvbHZlL2VtcHR5LmpzIiwibm9kZV9tb2R1bGVzL2dlb2pzb250b29zbS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9nZW9qc29udG9vc20vbm9kZV9tb2R1bGVzL2p4b24vaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIiLCJ2YXIganhvbiA9IHJlcXVpcmUoJ2p4b24nKTtcblxuXG5mdW5jdGlvbiBnZW9qc29udG9vc20oZ2VvanNvbikge1xuICAgIHZhciBmZWF0dXJlcyA9IGdlb2pzb24uZmVhdHVyZXMgfHwgZ2VvanNvbi5sZW5ndGg+MCA/IGdlb2pzb24gOiBbZ2VvanNvbl0gO1xuXG4gICAgdmFyIG5vZGVzID0gW10sIG5vZGVzSW5kZXggPSB7fSxcbiAgICAgICAgd2F5cyA9IFtdLFxuICAgICAgICByZWxhdGlvbnMgPSBbXTtcblxuICAgIGZlYXR1cmVzLmZvckVhY2goZnVuY3Rpb24oZmVhdHVyZSkgeyAvLyBmZWF0dXJlIGNhbiBhbHNvIGJlIGEgcHVyZSBHZW9KU09OIGdlb21ldHJ5IG9iamVjdFxuICAgICAgICAvLyB0b2RvOiBHZW9tZXRyeUNvbGxlY3Rpb24/XG4gICAgICAgIHZhciBwcm9wZXJ0aWVzID0gZmVhdHVyZS5wcm9wZXJ0aWVzIHx8IHt9LFxuICAgICAgICAgICAgZ2VvbWV0cnkgPSBmZWF0dXJlLmdlb21ldHJ5IHx8IGZlYXR1cmVcbiAgICAgICAgLy8gdG9kbzogdmFsaWRpdHkgY2hlY2tcbiAgICAgICAgLy8gdG9kbzogaWRzIGlmIChmZWF0dXJlLmlkICYmIGZlYXR1cmUuaWQubWF0Y2goL14obm9kZXx3YXl8cmVsYXRpb24pXFwvKFxcZCspJC8pKSBpZCA9IOKAplxuICAgICAgICBzd2l0Y2ggKGdlb21ldHJ5LnR5cGUpIHtcbiAgICAgICAgY2FzZSBcIlBvaW50XCI6XG4gICAgICAgICAgICBwcm9jZXNzUG9pbnQoZ2VvbWV0cnkuY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMsIG5vZGVzLCBub2Rlc0luZGV4KVxuICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIkxpbmVTdHJpbmdcIjpcbiAgICAgICAgICAgIHByb2Nlc3NMaW5lU3RyaW5nKGdlb21ldHJ5LmNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzLCB3YXlzLCBub2Rlcywgbm9kZXNJbmRleClcbiAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJQb2x5Z29uXCI6XG4gICAgICAgICAgICBwcm9jZXNzTXVsdGlQb2x5Z29uKFtnZW9tZXRyeS5jb29yZGluYXRlc10sIHByb3BlcnRpZXMsIHJlbGF0aW9ucywgd2F5cywgbm9kZXMsIG5vZGVzSW5kZXgpXG4gICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiTXVsdGlwb2x5Z29uXCI6XG4gICAgICAgICAgICBwcm9jZXNzTXVsdGlQb2x5Z29uKGdlb21ldHJ5LmNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzLCByZWxhdGlvbnMsIHdheXMsIG5vZGVzLCBub2Rlc0luZGV4KVxuICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJ1bmtub3duIG9yIHVuc3VwcG9ydGVkIGdlb21ldHJ5IHR5cGU6XCIsIGdlb21ldHJ5LnR5cGUpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvL2NvbnNvbGUubG9nKG5vZGVzLCB3YXlzLCByZWxhdGlvbnMpXG4gICAgdmFyIGxhc3ROb2RlSWQgPSAtMSxcbiAgICAgICAgbGFzdFdheUlkID0gLTEsXG4gICAgICAgIGxhc3RSZWxhdGlvbklkID0gLTFcbiAgICBmdW5jdGlvbiBqeG9uVGFncyh0YWdzKSB7XG4gICAgICAgIHZhciByZXMgPSBbXVxuICAgICAgICBmb3IgKHZhciBrIGluIHRhZ3MpIHtcbiAgICAgICAgICAgIHJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBcIkBrXCI6IGssXG4gICAgICAgICAgICAgICAgXCJAdlwiOiB0YWdzW2tdXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNcbiAgICB9XG4gICAgdmFyIGp4b25EYXRhID0ge1xuICAgICAgICBvc206IHtcbiAgICAgICAgICAgIFwiQHZlcnNpb25cIjogXCIwLjZcIixcbiAgICAgICAgICAgIFwiQGdlbmVyYXRvclwiOiBcImdlb2pzb250b29zbVwiLFxuICAgICAgICAgICAgXCJub2RlXCI6IG5vZGVzLm1hcChmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5pZCA9IGxhc3ROb2RlSWQtLVxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQGlkXCI6IG5vZGUuaWQsXG4gICAgICAgICAgICAgICAgICAgIFwiQGxhdFwiOiBub2RlLmxhdCxcbiAgICAgICAgICAgICAgICAgICAgXCJAbG9uXCI6IG5vZGUubG9uLFxuICAgICAgICAgICAgICAgICAgICAvLyB0b2RvOiBtZXRhXG4gICAgICAgICAgICAgICAgICAgIFwidGFnXCI6IGp4b25UYWdzKG5vZGUudGFncylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIFwid2F5XCI6IHdheXMubWFwKGZ1bmN0aW9uKHdheSkge1xuICAgICAgICAgICAgICAgIHdheS5pZCA9IGxhc3RXYXlJZC0tXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgXCJAaWRcIjogd2F5LmlkLFxuICAgICAgICAgICAgICAgICAgICBcIm5kXCI6IHdheS5ub2Rlcy5tYXAoZnVuY3Rpb24obmQpIHsgcmV0dXJuIHtcIkByZWZcIjogbmQuaWR9IH0pLFxuICAgICAgICAgICAgICAgICAgICBcInRhZ1wiOiBqeG9uVGFncyh3YXkudGFncylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIFwicmVsYXRpb25cIjogcmVsYXRpb25zLm1hcChmdW5jdGlvbihyZWxhdGlvbikge1xuICAgICAgICAgICAgICAgIHJlbGF0aW9uLmlkID0gbGFzdFJlbGF0aW9uSWQtLVxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQGlkXCI6IHJlbGF0aW9uLmlkLFxuICAgICAgICAgICAgICAgICAgICBcIm1lbWJlclwiOiByZWxhdGlvbi5tZW1iZXJzLm1hcChmdW5jdGlvbihtZW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdHlwZVwiOiBtZW1iZXIudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkByZWZcIjogbWVtYmVyLmVsZW0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAcm9sZVwiOiBtZW1iZXIucm9sZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgXCJ0YWdcIjoganhvblRhZ3MocmVsYXRpb24udGFncylcbiAgICAgICAgICAgICAgICAgICAgLy8gdG9kbzogbWV0YVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0gXG4gICAgfVxuICAgIC8vIHRvZG86IHNvcnQgYnkgaWRcbiAgICByZXR1cm4ganhvbi5qc1RvU3RyaW5nKGp4b25EYXRhKVxufVxuXG5mdW5jdGlvbiBnZXROb2RlSGFzaChjb29yZHMpIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoY29vcmRzKVxufVxuZnVuY3Rpb24gZW1wdHlOb2RlKGNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGFnczogcHJvcGVydGllcyxcbiAgICAgICAgbGF0OiBjb29yZGluYXRlc1sxXSxcbiAgICAgICAgbG9uOiBjb29yZGluYXRlc1swXVxuICAgIH1cbiAgICAvLyB0b2RvOiBtZXRhXG4gICAgLy8gdG9kbzogbW92ZSBcIm5vZGVzSW5kZXhbaGFzaF0gPSBub2RlXCIgaGVyZVxufVxuXG5mdW5jdGlvbiBwcm9jZXNzUG9pbnQoY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMsIG5vZGVzLCBub2Rlc0luZGV4KSB7XG4gICAgdmFyIGhhc2ggPSBnZXROb2RlSGFzaChjb29yZGluYXRlcyksXG4gICAgICAgIG5vZGVcbiAgICBpZiAoIShub2RlID0gbm9kZXNJbmRleFtoYXNoXSkpIHtcbiAgICAgICAgbm9kZXMucHVzaChub2RlID0gZW1wdHlOb2RlKGNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzKSlcbiAgICAgICAgbm9kZXNJbmRleFtoYXNoXSA9IG5vZGVcbiAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKHZhciBrIGluIHByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIG5vZGUudGFnc1trXSA9IHByb3BlcnRpZXNba11cbiAgICAgICAgfVxuICAgICAgICAvLyB0b2RvOiBtZXRhXG4gICAgfVxufVxuXG5mdW5jdGlvbiBwcm9jZXNzTGluZVN0cmluZyhjb29yZGluYXRlcywgcHJvcGVydGllcywgd2F5cywgbm9kZXMsIG5vZGVzSW5kZXgpIHtcbiAgICB2YXIgd2F5ID0ge1xuICAgICAgICB0YWdzOiBwcm9wZXJ0aWVzLFxuICAgICAgICBub2RlczogW11cbiAgICB9XG4gICAgd2F5cy5wdXNoKHdheSlcbiAgICAvLyB0b2RvOiBtZXRhXG4gICAgY29vcmRpbmF0ZXMuZm9yRWFjaChmdW5jdGlvbihwb2ludCkge1xuICAgICAgICB2YXIgaGFzaCA9IGdldE5vZGVIYXNoKHBvaW50KSxcbiAgICAgICAgICAgIG5vZGVcbiAgICAgICAgaWYgKCEobm9kZSA9IG5vZGVzSW5kZXhbaGFzaF0pKSB7XG4gICAgICAgICAgICBub2Rlcy5wdXNoKG5vZGUgPSBlbXB0eU5vZGUocG9pbnQsIHt9KSlcbiAgICAgICAgICAgIG5vZGVzSW5kZXhbaGFzaF0gPSBub2RlXG4gICAgICAgIH1cbiAgICAgICAgd2F5Lm5vZGVzLnB1c2gobm9kZSlcbiAgICB9KVxufVxuXG5mdW5jdGlvbiBwcm9jZXNzTXVsdGlQb2x5Z29uKGNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzLCByZWxhdGlvbnMsIHdheXMsIG5vZGVzLCBub2Rlc0luZGV4KSB7XG4gICAgLy8gc2ltcGxlIGFyZWEgd2l0aCBvbmx5IDEgcmluZzogLT4gY2xvc2VkIHdheVxuICAgIGlmIChjb29yZGluYXRlcy5sZW5ndGggPT09IDEgJiYgY29vcmRpbmF0ZXNbMF0ubGVuZ3RoID09PSAxKVxuICAgICAgICByZXR1cm4gcHJvY2Vzc0xpbmVTdHJpbmcoY29vcmRpbmF0ZXNbMF1bMF0sIHByb3BlcnRpZXMsIHdheXMsIG5vZGVzLCBub2Rlc0luZGV4KVxuICAgIC8vIG11bHRpcG9seWdvblxuICAgIHZhciByZWxhdGlvbiA9IHtcbiAgICAgICAgdGFnczogcHJvcGVydGllcyxcbiAgICAgICAgbWVtYmVyczogW11cbiAgICB9XG4gICAgcmVsYXRpb24udGFnc1tcInR5cGVcIl0gPSBcIm11bHRpcG9seWdvblwiXG4gICAgcmVsYXRpb25zLnB1c2gocmVsYXRpb24pXG4gICAgLy8gdG9kbzogbWV0YVxuICAgIGNvb3JkaW5hdGVzLmZvckVhY2goZnVuY3Rpb24ocG9seWdvbikge1xuICAgICAgICBwb2x5Z29uLmZvckVhY2goZnVuY3Rpb24ocmluZywgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciB3YXkgPSB7XG4gICAgICAgICAgICAgICAgdGFnczoge30sXG4gICAgICAgICAgICAgICAgbm9kZXM6IFtdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3YXlzLnB1c2god2F5KVxuICAgICAgICAgICAgcmVsYXRpb24ubWVtYmVycy5wdXNoKHtcbiAgICAgICAgICAgICAgICBlbGVtOiB3YXksXG4gICAgICAgICAgICAgICAgdHlwZTogXCJ3YXlcIixcbiAgICAgICAgICAgICAgICByb2xlOiBpbmRleD09PTAgPyBcIm91dGVyXCIgOiBcImlubmVyXCJcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICByaW5nLmZvckVhY2goZnVuY3Rpb24ocG9pbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgaGFzaCA9IGdldE5vZGVIYXNoKHBvaW50KSxcbiAgICAgICAgICAgICAgICAgICAgbm9kZVxuICAgICAgICAgICAgICAgIGlmICghKG5vZGUgPSBub2Rlc0luZGV4W2hhc2hdKSkge1xuICAgICAgICAgICAgICAgICAgICBub2Rlcy5wdXNoKG5vZGUgPSBlbXB0eU5vZGUocG9pbnQsIHt9KSlcbiAgICAgICAgICAgICAgICAgICAgbm9kZXNJbmRleFtoYXNoXSA9IG5vZGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgd2F5Lm5vZGVzLnB1c2gobm9kZSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZW9qc29udG9vc207XG4iLCIvKlxuICogSlhPTiBmcmFtZXdvcmsgLSBDb3B5bGVmdCAyMDExIGJ5IE1vemlsbGEgRGV2ZWxvcGVyIE5ldHdvcmtcbiAqXG4gKiBSZXZpc2lvbiAjMSAtIFNlcHRlbWJlciA1LCAyMDE0XG4gKlxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9KWE9OXG4gKlxuICogVGhpcyBmcmFtZXdvcmsgaXMgcmVsZWFzZWQgdW5kZXIgdGhlIEdOVSBQdWJsaWMgTGljZW5zZSwgdmVyc2lvbiAzIG9yIGxhdGVyLlxuICogaHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2dwbC0zLjAtc3RhbmRhbG9uZS5odG1sXG4gKlxuICogc21hbGwgbW9kaWZpY2F0aW9ucyBwZXJmb3JtZWQgYnkgdGhlIGlEIHByb2plY3Q6XG4gKiBodHRwczovL2dpdGh1Yi5jb20vb3BlbnN0cmVldG1hcC9pRC9jb21taXRzLzE4YWEzM2JhOTdiNTJjYWNmNDU0ZTk1YzY1ZDE1NDAwMGUwNTJhMWYvanMvbGliL2p4b24uanNcbiAqXG4gKiBzbWFsbCBtb2RpZmljYXRpb25zIHBlcmZvcm1lZCBieSB1c2VyIEBidWdyZXBvcnQwXG4gKiBodHRwczovL2dpdGh1Yi5jb20vdHlyYXNkL0pYT04vcHVsbC8yL2NvbW1pdHNcbiAqXG4gKiBzb21lIGFkZGl0aW9ucyBhbmQgbW9kaWZpY2F0aW9ucyBieSB1c2VyIEBpZ29yZFxuICogaHR0cHM6Ly9naXRodWIuY29tL3R5cmFzZC9KWE9OL3B1bGwvNS9jb21taXRzXG4gKlxuICogYWRhcHRlZCBmb3Igbm9kZWpzIGFuZCBucG0gYnkgTWFydGluIFJhaWZlciA8dHlyLmFzZEBnbWFpbC5jb20+XG4gKi9cblxuIC8qXG4gICogTW9kaWZpY2F0aW9uczpcbiAgKiAtIGFkZGVkIGNvbmZpZyBtZXRob2QgdGhhdCBleGNlcHRzIG9iamVjdHMgd2l0aCBwcm9wczpcbiAgKiAgIC0gdmFsdWVLZXkgKGRlZmF1bHQ6IGtleVZhbHVlKVxuICAqICAgLSBhdHRyS2V5IChkZWZhdWx0OiBrZXlBdHRyaWJ1dGVzKVxuICAqICAgLSBhdHRyUHJlZml4IChkZWZhdWx0OiBAKVxuICAqICAgLSBsb3dlckNhc2VUYWdzIChkZWZhdWx0OiB0cnVlKVxuICAqICAgLSB0cnVlSXNFbXB0eSAoZGVmYXVsdDogdHJ1ZSlcbiAgKiAgIC0gYXV0b0RhdGUgKGRlZmF1bHQ6IHRydWUpXG4gICogLSB0dXJuaW5nIHRhZyBhbmQgYXR0cmlidXRlcyB0byBsb3dlciBjYXNlIGlzIG9wdGlvbmFsXG4gICogLSBvcHRpb25hbCB0dXJuaW5nIGJvb2xlYW4gdHJ1ZSB0byBlbXB0eSB0YWdcbiAgKiAtIGF1dG8gRGF0ZSBwYXJzaW5nIGlzIG9wdGlvbmFsXG4gICogLSBhZGRlZCBwYXJzZVhtbCBtZXRob2RcbiAgKlxuKi9cblxuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgICAgIGRlZmluZShmYWN0b3J5KHdpbmRvdykpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyAmJiB3aW5kb3cuRE9NSW1wbGVtZW50YXRpb24pIHtcbiAgICAgICAgICAgIC8vIEJyb3dzZXJpZnkuIGhhcmRjb2RlIHVzYWdlIG9mIGJyb3dzZXIncyBvd24gWE1MRG9tIGltcGxlbWVudGF0aW9uXG4gICAgICAgICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3R5cmFzZC9qeG9uL2lzc3Vlcy8xOFxuICAgICAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHdpbmRvdyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBOb2RlLiBEb2VzIG5vdCB3b3JrIHdpdGggc3RyaWN0IENvbW1vbkpTLCBidXRcbiAgICAgICAgICAgIC8vIG9ubHkgQ29tbW9uSlMtbGlrZSBlbnZpcm9ubWVudHMgdGhhdCBzdXBwb3J0IG1vZHVsZS5leHBvcnRzLFxuICAgICAgICAgICAgLy8gbGlrZSBOb2RlLlxuICAgICAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoJ3htbGRvbScpKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgICAgIHJvb3QuSlhPTiA9IGZhY3Rvcnkod2luZG93KTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uICh4bWxEb20pIHtcblxuICAgIHJldHVybiBuZXcgKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhclxuICAgICAgICBzVmFsUHJvcCA9IFwia2V5VmFsdWVcIixcbiAgICAgICAgc0F0dHJQcm9wID0gXCJrZXlBdHRyaWJ1dGVzXCIsXG4gICAgICAgIHNBdHRyc1ByZWYgPSBcIkBcIixcbiAgICAgICAgc0xvd0Nhc2UgPSB0cnVlLFxuICAgICAgICBzRW1wdHlUcnVlID0gdHJ1ZSxcbiAgICAgICAgc0F1dG9EYXRlID0gdHJ1ZSxcbiAgICAgICAgc0lnbm9yZVByZWZpeGVkID0gZmFsc2UsXG4gICAgICAgIHBhcnNlckVycm9ySGFuZGxlcixcbiAgICAgICAgRE9NUGFyc2VyLFxuICAgICAgICBzUGFyc2VWYWx1ZXMgPSB0cnVlLCAvKiB5b3UgY2FuIGN1c3RvbWl6ZSB0aGVzZSB2YWx1ZXMgKi9cbiAgICAgICAgYUNhY2hlID0gW10sIHJJc051bGwgPSAvXlxccyokLywgcklzQm9vbCA9IC9eKD86dHJ1ZXxmYWxzZSkkL2k7XG5cbiAgICAgIGZ1bmN0aW9uIHBhcnNlVGV4dCAoc1ZhbHVlKSB7XG4gICAgICAgIGlmICghc1BhcnNlVmFsdWVzKSByZXR1cm4gc1ZhbHVlO1xuICAgICAgICBpZiAocklzTnVsbC50ZXN0KHNWYWx1ZSkpIHsgcmV0dXJuIG51bGw7IH1cbiAgICAgICAgaWYgKHJJc0Jvb2wudGVzdChzVmFsdWUpKSB7IHJldHVybiBzVmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gXCJ0cnVlXCI7IH1cbiAgICAgICAgaWYgKGlzRmluaXRlKHNWYWx1ZSkpIHsgcmV0dXJuIHBhcnNlRmxvYXQoc1ZhbHVlKTsgfVxuICAgICAgICBpZiAoc0F1dG9EYXRlICYmIGlzRmluaXRlKERhdGUucGFyc2Uoc1ZhbHVlKSkpIHsgcmV0dXJuIG5ldyBEYXRlKHNWYWx1ZSk7IH1cbiAgICAgICAgcmV0dXJuIHNWYWx1ZTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gRW1wdHlUcmVlICgpIHsgfVxuICAgICAgRW1wdHlUcmVlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFwibnVsbFwiOyB9O1xuICAgICAgRW1wdHlUcmVlLnByb3RvdHlwZS52YWx1ZU9mID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gbnVsbDsgfTtcblxuICAgICAgZnVuY3Rpb24gb2JqZWN0aWZ5ICh2VmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHZWYWx1ZSA9PT0gbnVsbCA/IG5ldyBFbXB0eVRyZWUoKSA6IHZWYWx1ZSBpbnN0YW5jZW9mIE9iamVjdCA/IHZWYWx1ZSA6IG5ldyB2VmFsdWUuY29uc3RydWN0b3IodlZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY3JlYXRlT2JqVHJlZSAob1BhcmVudE5vZGUsIG5WZXJiLCBiRnJlZXplLCBiTmVzdGVBdHRyKSB7XG4gICAgICAgIHZhclxuICAgICAgICAgIG5MZXZlbFN0YXJ0ID0gYUNhY2hlLmxlbmd0aCwgYkNoaWxkcmVuID0gb1BhcmVudE5vZGUuaGFzQ2hpbGROb2RlcygpLFxuICAgICAgICAgIGJBdHRyaWJ1dGVzID0gb1BhcmVudE5vZGUubm9kZVR5cGUgPT09IG9QYXJlbnROb2RlLkVMRU1FTlRfTk9ERSAmJiBvUGFyZW50Tm9kZS5oYXNBdHRyaWJ1dGVzKCksIGJIaWdoVmVyYiA9IEJvb2xlYW4oblZlcmIgJiAyKTtcblxuICAgICAgICB2YXJcbiAgICAgICAgICBzUHJvcCwgdkNvbnRlbnQsIG5MZW5ndGggPSAwLCBzQ29sbGVjdGVkVHh0ID0gXCJcIixcbiAgICAgICAgICB2UmVzdWx0ID0gYkhpZ2hWZXJiID8ge30gOiAvKiBwdXQgaGVyZSB0aGUgZGVmYXVsdCB2YWx1ZSBmb3IgZW1wdHkgbm9kZXM6ICovIChzRW1wdHlUcnVlID8gdHJ1ZSA6ICcnKTtcblxuICAgICAgICBpZiAoYkNoaWxkcmVuKSB7XG4gICAgICAgICAgZm9yICh2YXIgb05vZGUsIG5JdGVtID0gMDsgbkl0ZW0gPCBvUGFyZW50Tm9kZS5jaGlsZE5vZGVzLmxlbmd0aDsgbkl0ZW0rKykge1xuICAgICAgICAgICAgb05vZGUgPSBvUGFyZW50Tm9kZS5jaGlsZE5vZGVzLml0ZW0obkl0ZW0pO1xuICAgICAgICAgICAgaWYgKG9Ob2RlLm5vZGVUeXBlID09PSA0KSB7IHNDb2xsZWN0ZWRUeHQgKz0gb05vZGUubm9kZVZhbHVlOyB9IC8qIG5vZGVUeXBlIGlzIFwiQ0RBVEFTZWN0aW9uXCIgKDQpICovXG4gICAgICAgICAgICBlbHNlIGlmIChvTm9kZS5ub2RlVHlwZSA9PT0gMykgeyBzQ29sbGVjdGVkVHh0ICs9IG9Ob2RlLm5vZGVWYWx1ZS50cmltKCk7IH0gLyogbm9kZVR5cGUgaXMgXCJUZXh0XCIgKDMpICovXG4gICAgICAgICAgICBlbHNlIGlmIChvTm9kZS5ub2RlVHlwZSA9PT0gMSAmJiAhKHNJZ25vcmVQcmVmaXhlZCAmJiBvTm9kZS5wcmVmaXgpKSB7IGFDYWNoZS5wdXNoKG9Ob2RlKTsgfSAvKiBub2RlVHlwZSBpcyBcIkVsZW1lbnRcIiAoMSkgKi9cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbkxldmVsRW5kID0gYUNhY2hlLmxlbmd0aCwgdkJ1aWx0VmFsID0gcGFyc2VUZXh0KHNDb2xsZWN0ZWRUeHQpO1xuXG4gICAgICAgIGlmICghYkhpZ2hWZXJiICYmIChiQ2hpbGRyZW4gfHwgYkF0dHJpYnV0ZXMpKSB7IHZSZXN1bHQgPSBuVmVyYiA9PT0gMCA/IG9iamVjdGlmeSh2QnVpbHRWYWwpIDoge307IH1cblxuICAgICAgICBmb3IgKHZhciBuRWxJZCA9IG5MZXZlbFN0YXJ0OyBuRWxJZCA8IG5MZXZlbEVuZDsgbkVsSWQrKykge1xuICAgICAgICAgIHNQcm9wID0gYUNhY2hlW25FbElkXS5ub2RlTmFtZTtcbiAgICAgICAgICBpZiAoc0xvd0Nhc2UpIHNQcm9wID0gc1Byb3AudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICB2Q29udGVudCA9IGNyZWF0ZU9ialRyZWUoYUNhY2hlW25FbElkXSwgblZlcmIsIGJGcmVlemUsIGJOZXN0ZUF0dHIpO1xuICAgICAgICAgIGlmICh2UmVzdWx0Lmhhc093blByb3BlcnR5KHNQcm9wKSkge1xuICAgICAgICAgICAgaWYgKHZSZXN1bHRbc1Byb3BdLmNvbnN0cnVjdG9yICE9PSBBcnJheSkgeyB2UmVzdWx0W3NQcm9wXSA9IFt2UmVzdWx0W3NQcm9wXV07IH1cbiAgICAgICAgICAgIHZSZXN1bHRbc1Byb3BdLnB1c2godkNvbnRlbnQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2UmVzdWx0W3NQcm9wXSA9IHZDb250ZW50O1xuICAgICAgICAgICAgbkxlbmd0aCsrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChiQXR0cmlidXRlcykge1xuICAgICAgICAgIHZhclxuICAgICAgICAgICAgbkF0dHJMZW4gPSBvUGFyZW50Tm9kZS5hdHRyaWJ1dGVzLmxlbmd0aCxcbiAgICAgICAgICAgIHNBUHJlZml4ID0gYk5lc3RlQXR0ciA/IFwiXCIgOiBzQXR0cnNQcmVmLCBvQXR0clBhcmVudCA9IGJOZXN0ZUF0dHIgPyB7fSA6IHZSZXN1bHQ7XG5cbiAgICAgICAgICBmb3IgKHZhciBvQXR0cmliLCBvQXR0cmliTmFtZSwgbkF0dHJpYiA9IDA7IG5BdHRyaWIgPCBuQXR0ckxlbjsgbkxlbmd0aCsrLCBuQXR0cmliKyspIHtcbiAgICAgICAgICAgIG9BdHRyaWIgPSBvUGFyZW50Tm9kZS5hdHRyaWJ1dGVzLml0ZW0obkF0dHJpYik7XG4gICAgICAgICAgICBvQXR0cmliTmFtZSA9IG9BdHRyaWIubmFtZTtcbiAgICAgICAgICAgIGlmIChzTG93Q2FzZSkgb0F0dHJpYk5hbWUgPSBvQXR0cmliTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgb0F0dHJQYXJlbnRbc0FQcmVmaXggKyBvQXR0cmliTmFtZV0gPSBwYXJzZVRleHQob0F0dHJpYi52YWx1ZS50cmltKCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChiTmVzdGVBdHRyKSB7XG4gICAgICAgICAgICBpZiAoYkZyZWV6ZSkgeyBPYmplY3QuZnJlZXplKG9BdHRyUGFyZW50KTsgfVxuICAgICAgICAgICAgdlJlc3VsdFtzQXR0clByb3BdID0gb0F0dHJQYXJlbnQ7XG4gICAgICAgICAgICBuTGVuZ3RoIC09IG5BdHRyTGVuIC0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoblZlcmIgPT09IDMgfHwgKG5WZXJiID09PSAyIHx8IG5WZXJiID09PSAxICYmIG5MZW5ndGggPiAwKSAmJiBzQ29sbGVjdGVkVHh0KSB7XG4gICAgICAgICAgdlJlc3VsdFtzVmFsUHJvcF0gPSB2QnVpbHRWYWw7XG4gICAgICAgIH0gZWxzZSBpZiAoIWJIaWdoVmVyYiAmJiBuTGVuZ3RoID09PSAwICYmIHNDb2xsZWN0ZWRUeHQpIHtcbiAgICAgICAgICB2UmVzdWx0ID0gdkJ1aWx0VmFsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJGcmVlemUgJiYgKGJIaWdoVmVyYiB8fCBuTGVuZ3RoID4gMCkpIHsgT2JqZWN0LmZyZWV6ZSh2UmVzdWx0KTsgfVxuXG4gICAgICAgIGFDYWNoZS5sZW5ndGggPSBuTGV2ZWxTdGFydDtcblxuICAgICAgICByZXR1cm4gdlJlc3VsdDtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gbG9hZE9ialRyZWUgKG9YTUxEb2MsIG9QYXJlbnRFbCwgb1BhcmVudE9iaikge1xuICAgICAgICB2YXIgdlZhbHVlLCBvQ2hpbGQ7XG5cbiAgICAgICAgaWYgKG9QYXJlbnRPYmouY29uc3RydWN0b3IgPT09IFN0cmluZyB8fCBvUGFyZW50T2JqLmNvbnN0cnVjdG9yID09PSBOdW1iZXIgfHwgb1BhcmVudE9iai5jb25zdHJ1Y3RvciA9PT0gQm9vbGVhbikge1xuICAgICAgICAgIG9QYXJlbnRFbC5hcHBlbmRDaGlsZChvWE1MRG9jLmNyZWF0ZVRleHROb2RlKG9QYXJlbnRPYmoudG9TdHJpbmcoKSkpOyAvKiB2ZXJib3NpdHkgbGV2ZWwgaXMgMCBvciAxICovXG4gICAgICAgICAgaWYgKG9QYXJlbnRPYmogPT09IG9QYXJlbnRPYmoudmFsdWVPZigpKSB7IHJldHVybjsgfVxuICAgICAgICB9IGVsc2UgaWYgKG9QYXJlbnRPYmouY29uc3RydWN0b3IgPT09IERhdGUpIHtcbiAgICAgICAgICBvUGFyZW50RWwuYXBwZW5kQ2hpbGQob1hNTERvYy5jcmVhdGVUZXh0Tm9kZShvUGFyZW50T2JqLnRvR01UU3RyaW5nKCkpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIHNOYW1lIGluIG9QYXJlbnRPYmopIHtcbiAgICAgICAgICB2VmFsdWUgPSBvUGFyZW50T2JqW3NOYW1lXTtcbiAgICAgICAgICBpZiAodlZhbHVlID09PSBudWxsKSB2VmFsdWUgPSB7fTtcbiAgICAgICAgICBpZiAoaXNGaW5pdGUoc05hbWUpIHx8IHZWYWx1ZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7IGNvbnRpbnVlOyB9IC8qIHZlcmJvc2l0eSBsZXZlbCBpcyAwICovXG4gICAgICAgICAgLy8gd2hlbiBpdCBpcyBfXG4gICAgICAgICAgaWYgKHNOYW1lID09PSBzVmFsUHJvcCkge1xuICAgICAgICAgICAgaWYgKHZWYWx1ZSAhPT0gbnVsbCAmJiB2VmFsdWUgIT09IHRydWUpIHsgb1BhcmVudEVsLmFwcGVuZENoaWxkKG9YTUxEb2MuY3JlYXRlVGV4dE5vZGUodlZhbHVlLmNvbnN0cnVjdG9yID09PSBEYXRlID8gdlZhbHVlLnRvR01UU3RyaW5nKCkgOiBTdHJpbmcodlZhbHVlKSkpOyB9XG4gICAgICAgICAgfSBlbHNlIGlmIChzTmFtZSA9PT0gc0F0dHJQcm9wKSB7IC8qIHZlcmJvc2l0eSBsZXZlbCBpcyAzICovXG4gICAgICAgICAgICBmb3IgKHZhciBzQXR0cmliIGluIHZWYWx1ZSkgeyBvUGFyZW50RWwuc2V0QXR0cmlidXRlKHNBdHRyaWIsIHZWYWx1ZVtzQXR0cmliXSk7IH1cbiAgICAgICAgICB9IGVsc2UgaWYgKHNOYW1lID09PSBzQXR0cnNQcmVmKyd4bWxucycpIHtcbiAgICAgICAgICAgIC8vIGRvIG5vdGhpbmc6IHNwZWNpYWwgaGFuZGxpbmcgb2YgeG1sIG5hbWVzcGFjZXMgaXMgZG9uZSB2aWEgY3JlYXRlRWxlbWVudE5TKClcbiAgICAgICAgICB9IGVsc2UgaWYgKHNOYW1lLmNoYXJBdCgwKSA9PT0gc0F0dHJzUHJlZikge1xuICAgICAgICAgICAgb1BhcmVudEVsLnNldEF0dHJpYnV0ZShzTmFtZS5zbGljZSgxKSwgdlZhbHVlKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHZWYWx1ZS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgICAgIGZvciAodmFyIG5JdGVtID0gMDsgbkl0ZW0gPCB2VmFsdWUubGVuZ3RoOyBuSXRlbSsrKSB7XG4gICAgICAgICAgICAgIG9DaGlsZCA9IG9YTUxEb2MuY3JlYXRlRWxlbWVudE5TKHZWYWx1ZVtuSXRlbV1bc0F0dHJzUHJlZisneG1sbnMnXSB8fCBvUGFyZW50RWwubmFtZXNwYWNlVVJJLCBzTmFtZSk7XG4gICAgICAgICAgICAgIGxvYWRPYmpUcmVlKG9YTUxEb2MsIG9DaGlsZCwgdlZhbHVlW25JdGVtXSk7XG4gICAgICAgICAgICAgIG9QYXJlbnRFbC5hcHBlbmRDaGlsZChvQ2hpbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvQ2hpbGQgPSBvWE1MRG9jLmNyZWF0ZUVsZW1lbnROUygodlZhbHVlIHx8IHt9KVtzQXR0cnNQcmVmKyd4bWxucyddIHx8IG9QYXJlbnRFbC5uYW1lc3BhY2VVUkksIHNOYW1lKTtcbiAgICAgICAgICAgIGlmICh2VmFsdWUgaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgICAgICAgbG9hZE9ialRyZWUob1hNTERvYywgb0NoaWxkLCB2VmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2VmFsdWUgIT09IG51bGwgJiYgdlZhbHVlICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgIG9DaGlsZC5hcHBlbmRDaGlsZChvWE1MRG9jLmNyZWF0ZVRleHROb2RlKHZWYWx1ZS50b1N0cmluZygpKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFzRW1wdHlUcnVlICYmIHZWYWx1ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICBvQ2hpbGQuYXBwZW5kQ2hpbGQob1hNTERvYy5jcmVhdGVUZXh0Tm9kZSh2VmFsdWUudG9TdHJpbmcoKSkpO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvUGFyZW50RWwuYXBwZW5kQ2hpbGQob0NoaWxkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy54bWxUb0pzID0gdGhpcy5idWlsZCA9IGZ1bmN0aW9uIChvWE1MUGFyZW50LCBuVmVyYm9zaXR5IC8qIG9wdGlvbmFsICovLCBiRnJlZXplIC8qIG9wdGlvbmFsICovLCBiTmVzdGVBdHRyaWJ1dGVzIC8qIG9wdGlvbmFsICovKSB7XG4gICAgICAgIHZhciBfblZlcmIgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiB0eXBlb2YgblZlcmJvc2l0eSA9PT0gXCJudW1iZXJcIiA/IG5WZXJib3NpdHkgJiAzIDogLyogcHV0IGhlcmUgdGhlIGRlZmF1bHQgdmVyYm9zaXR5IGxldmVsOiAqLyAxO1xuICAgICAgICByZXR1cm4gY3JlYXRlT2JqVHJlZShvWE1MUGFyZW50LCBfblZlcmIsIGJGcmVlemUgfHwgZmFsc2UsIGFyZ3VtZW50cy5sZW5ndGggPiAzID8gYk5lc3RlQXR0cmlidXRlcyA6IF9uVmVyYiA9PT0gMyk7XG4gICAgICB9O1xuXG4gICAgICB0aGlzLmpzVG9YbWwgPSB0aGlzLnVuYnVpbGQgPSBmdW5jdGlvbiAob09ialRyZWUsIHNOYW1lc3BhY2VVUkkgLyogb3B0aW9uYWwgKi8sIHNRdWFsaWZpZWROYW1lIC8qIG9wdGlvbmFsICovLCBvRG9jdW1lbnRUeXBlIC8qIG9wdGlvbmFsICovKSB7XG4gICAgICAgIHZhciBkb2N1bWVudEltcGxlbWVudGF0aW9uID0geG1sRG9tLmRvY3VtZW50ICYmIHhtbERvbS5kb2N1bWVudC5pbXBsZW1lbnRhdGlvbiB8fCBuZXcgeG1sRG9tLkRPTUltcGxlbWVudGF0aW9uKCk7XG4gICAgICAgIHZhciBvTmV3RG9jID0gZG9jdW1lbnRJbXBsZW1lbnRhdGlvbi5jcmVhdGVEb2N1bWVudChzTmFtZXNwYWNlVVJJIHx8IG51bGwsIHNRdWFsaWZpZWROYW1lIHx8IFwiXCIsIG9Eb2N1bWVudFR5cGUgfHwgbnVsbCk7XG4gICAgICAgIGxvYWRPYmpUcmVlKG9OZXdEb2MsIG9OZXdEb2MuZG9jdW1lbnRFbGVtZW50IHx8IG9OZXdEb2MsIG9PYmpUcmVlKTtcbiAgICAgICAgcmV0dXJuIG9OZXdEb2M7XG4gICAgICB9O1xuXG4gICAgICB0aGlzLmNvbmZpZyA9IGZ1bmN0aW9uKG8pIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB2YWx1ZUtleTogc1ZhbFByb3AsXG4gICAgICAgICAgICAgICAgYXR0cktleTogc0F0dHJQcm9wLFxuICAgICAgICAgICAgICAgIGF0dHJQcmVmaXg6IHNBdHRyc1ByZWYsXG4gICAgICAgICAgICAgICAgbG93ZXJDYXNlVGFnczogc0xvd0Nhc2UsXG4gICAgICAgICAgICAgICAgdHJ1ZUlzRW1wdHk6IHNFbXB0eVRydWUsXG4gICAgICAgICAgICAgICAgYXV0b0RhdGU6IHNBdXRvRGF0ZSxcbiAgICAgICAgICAgICAgICBpZ25vcmVQcmVmaXhOb2Rlczogc0lnbm9yZVByZWZpeGVkLFxuICAgICAgICAgICAgICAgIHBhcnNlVmFsdWVzOiBzUGFyc2VWYWx1ZXMsXG4gICAgICAgICAgICAgICAgcGFyc2VyRXJyb3JIYW5kbGVyOiBwYXJzZXJFcnJvckhhbmRsZXJcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgayBpbiBvKSB7XG4gICAgICAgICAgc3dpdGNoKGspIHtcbiAgICAgICAgICAgIGNhc2UgJ3ZhbHVlS2V5JzpcbiAgICAgICAgICAgICAgc1ZhbFByb3AgPSBvLnZhbHVlS2V5O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2F0dHJLZXknOlxuICAgICAgICAgICAgICBzQXR0clByb3AgPSBvLmF0dHJLZXk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYXR0clByZWZpeCc6XG4gICAgICAgICAgICAgIHNBdHRyc1ByZWYgPSBvLmF0dHJQcmVmaXg7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbG93ZXJDYXNlVGFncyc6XG4gICAgICAgICAgICAgIHNMb3dDYXNlID0gby5sb3dlckNhc2VUYWdzO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3RydWVJc0VtcHR5JzpcbiAgICAgICAgICAgICAgc0VtcHR5VHJ1ZSA9IG8udHJ1ZUlzRW1wdHk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYXV0b0RhdGUnOlxuICAgICAgICAgICAgICBzQXV0b0RhdGUgPSBvLmF1dG9EYXRlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2lnbm9yZVByZWZpeGVkTm9kZXMnOlxuICAgICAgICAgICAgICBzSWdub3JlUHJlZml4ZWQgPSBvLmlnbm9yZVByZWZpeGVkTm9kZXM7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncGFyc2VWYWx1ZXMnOlxuICAgICAgICAgICAgICBzUGFyc2VWYWx1ZXMgPSBvLnBhcnNlVmFsdWVzO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3BhcnNlckVycm9ySGFuZGxlcic6XG4gICAgICAgICAgICAgIHBhcnNlckVycm9ySGFuZGxlciA9IG8ucGFyc2VyRXJyb3JIYW5kbGVyO1xuICAgICAgICAgICAgICBET01QYXJzZXIgPSBuZXcgeG1sRG9tLkRPTVBhcnNlcih7XG4gICAgICAgICAgICAgICAgICBlcnJvckhhbmRsZXI6IHBhcnNlckVycm9ySGFuZGxlcixcbiAgICAgICAgICAgICAgICAgIGxvY2F0b3I6IHt9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgdGhpcy5zdHJpbmdUb1htbCA9IGZ1bmN0aW9uKHhtbFN0cikge1xuICAgICAgICBpZiAoIURPTVBhcnNlcikgRE9NUGFyc2VyID0gbmV3IHhtbERvbS5ET01QYXJzZXIoKTtcbiAgICAgICAgcmV0dXJuIERPTVBhcnNlci5wYXJzZUZyb21TdHJpbmcoeG1sU3RyLCAnYXBwbGljYXRpb24veG1sJyk7XG4gICAgICB9O1xuXG4gICAgICB0aGlzLnhtbFRvU3RyaW5nID0gZnVuY3Rpb24gKHhtbE9iaikge1xuICAgICAgICBpZiAodHlwZW9mIHhtbE9iai54bWwgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICByZXR1cm4geG1sT2JqLnhtbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gKG5ldyB4bWxEb20uWE1MU2VyaWFsaXplcigpKS5zZXJpYWxpemVUb1N0cmluZyh4bWxPYmopO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB0aGlzLnN0cmluZ1RvSnMgPSBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgdmFyIHhtbE9iaiA9IHRoaXMuc3RyaW5nVG9YbWwoc3RyKTtcbiAgICAgICAgcmV0dXJuIHRoaXMueG1sVG9Kcyh4bWxPYmopO1xuICAgICAgfTtcblxuICAgICAgdGhpcy5qc1RvU3RyaW5nID0gdGhpcy5zdHJpbmdpZnkgPSBmdW5jdGlvbihvT2JqVHJlZSwgc05hbWVzcGFjZVVSSSAvKiBvcHRpb25hbCAqLywgc1F1YWxpZmllZE5hbWUgLyogb3B0aW9uYWwgKi8sIG9Eb2N1bWVudFR5cGUgLyogb3B0aW9uYWwgKi8pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueG1sVG9TdHJpbmcoXG4gICAgICAgICAgdGhpcy5qc1RvWG1sKG9PYmpUcmVlLCBzTmFtZXNwYWNlVVJJLCBzUXVhbGlmaWVkTmFtZSwgb0RvY3VtZW50VHlwZSlcbiAgICAgICAgKTtcbiAgICAgIH07XG4gICAgfSkoKTtcblxufSkpO1xuIl19