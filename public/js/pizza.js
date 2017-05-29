(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.geos = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
var jxon = require('jxon');


function geojsontoosm(geojson) {
    var features = geojson.features || geojson.length>0 ? geojson : [geojson]

    var nodes = [], nodesIndex = {},
        ways = [],
        relations = [];

    features.forEach(function(feature) { // feature can also be a pure GeoJSON geometry object
        // todo: GeometryCollection?
        var properties = feature.properties || {},
            geometry = feature.geometry || feature
        // todo: validity check
        // todo: ids if (feature.id && feature.id.match(/^(node|way|relation)\/(\d+)$/)) id = …
        switch (geometry.type) {
        case "Point":
            processPoint(geometry.coordinates, properties, nodes, nodesIndex)
        break;
        case "LineString":
            processLineString(geometry.coordinates, properties, ways, nodes, nodesIndex)
        break;
        case "Polygon":
            processMultiPolygon([geometry.coordinates], properties, relations, ways, nodes, nodesIndex)
        break;
        case "Multipolygon":
            processMultiPolygon(geometry.coordinates, properties, relations, ways, nodes, nodesIndex)
        break;
        default:
            console.error("unknown or unsupported geometry type:", geometry.type);
        }
    });

    //console.log(nodes, ways, relations)
    var lastNodeId = -1,
        lastWayId = -1,
        lastRelationId = -1
    function jxonTags(tags) {
        var res = []
        for (var k in tags) {
            res.push({
                "@k": k,
                "@v": tags[k]
            })
        }
        return res
    }
    var jxonData = {
        osm: {
            "@version": "0.6",
            "@generator": "geojsontoosm",
            "node": nodes.map(function(node) {
                node.id = lastNodeId--
                return {
                    "@id": node.id,
                    "@lat": node.lat,
                    "@lon": node.lon,
                    // todo: meta
                    "tag": jxonTags(node.tags)
                }
            }),
            "way": ways.map(function(way) {
                way.id = lastWayId--
                return {
                    "@id": way.id,
                    "nd": way.nodes.map(function(nd) { return {"@ref": nd.id} }),
                    "tag": jxonTags(way.tags)
                }
            }),
            "relation": relations.map(function(relation) {
                relation.id = lastRelationId--
                return {
                    "@id": relation.id,
                    "member": relation.members.map(function(member) {
                        return {
                            "@type": member.type,
                            "@ref": member.elem.id,
                            "@role": member.role
                        }
                    }),
                    "tag": jxonTags(relation.tags)
                    // todo: meta
                }
            })
        } 
    }
    // todo: sort by id
    return jxon.jsToString(jxonData)
}

function getNodeHash(coords) {
    return JSON.stringify(coords)
}
function emptyNode(coordinates, properties) {
    return {
        tags: properties,
        lat: coordinates[1],
        lon: coordinates[0]
    }
    // todo: meta
    // todo: move "nodesIndex[hash] = node" here
}

function processPoint(coordinates, properties, nodes, nodesIndex) {
    var hash = getNodeHash(coordinates),
        node
    if (!(node = nodesIndex[hash])) {
        nodes.push(node = emptyNode(coordinates, properties))
        nodesIndex[hash] = node
    } else {
        for (var k in properties) {
            node.tags[k] = properties[k]
        }
        // todo: meta
    }
}

function processLineString(coordinates, properties, ways, nodes, nodesIndex) {
    var way = {
        tags: properties,
        nodes: []
    }
    ways.push(way)
    // todo: meta
    coordinates.forEach(function(point) {
        var hash = getNodeHash(point),
            node
        if (!(node = nodesIndex[hash])) {
            nodes.push(node = emptyNode(point, {}))
            nodesIndex[hash] = node
        }
        way.nodes.push(node)
    })
}

function processMultiPolygon(coordinates, properties, relations, ways, nodes, nodesIndex) {
    // simple area with only 1 ring: -> closed way
    if (coordinates.length === 1 && coordinates[0].length === 1)
        return processLineString(coordinates[0][0], properties, ways, nodes, nodesIndex)
    // multipolygon
    var relation = {
        tags: properties,
        members: []
    }
    relation.tags["type"] = "multipolygon"
    relations.push(relation)
    // todo: meta
    coordinates.forEach(function(polygon) {
        polygon.forEach(function(ring, index) {
            var way = {
                tags: {},
                nodes: []
            }
            ways.push(way)
            relation.members.push({
                elem: way,
                type: "way",
                role: index===0 ? "outer" : "inner"
            })
            ring.forEach(function(point) {
                var hash = getNodeHash(point),
                    node
                if (!(node = nodesIndex[hash])) {
                    nodes.push(node = emptyNode(point, {}))
                    nodesIndex[hash] = node
                }
                way.nodes.push(node)
            })
        })
    })
}

module.exports = geojsontoosm;

},{"jxon":3}],3:[function(require,module,exports){
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

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory(window));
    } else if (typeof exports === 'object') {
        if (typeof window === 'object' && window.DOMImplementation) {
            // Browserify. hardcode usage of browser's own XMLDom implementation
            // see https://github.com/tyrasd/jxon/issues/18
            module.exports = factory(window);
        } else {
            // Node. Does not work with strict CommonJS, but
            // only CommonJS-like environments that support module.exports,
            // like Node.
            module.exports = factory(require('xmldom'));
        }
    } else {
        // Browser globals (root is window)
        root.JXON = factory(window);
    }
}(this, function (xmlDom) {

    return new (function () {
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
        sParseValues = true, /* you can customize these values */
        aCache = [], rIsNull = /^\s*$/, rIsBool = /^(?:true|false)$/i;

      function parseText (sValue) {
        if (!sParseValues) return sValue;
        if (rIsNull.test(sValue)) { return null; }
        if (rIsBool.test(sValue)) { return sValue.toLowerCase() === "true"; }
        if (isFinite(sValue)) { return parseFloat(sValue); }
        if (sAutoDate && isFinite(Date.parse(sValue))) { return new Date(sValue); }
        return sValue;
      }

      function EmptyTree () { }
      EmptyTree.prototype.toString = function () { return "null"; };
      EmptyTree.prototype.valueOf = function () { return null; };

      function objectify (vValue) {
        return vValue === null ? new EmptyTree() : vValue instanceof Object ? vValue : new vValue.constructor(vValue);
      }

      function createObjTree (oParentNode, nVerb, bFreeze, bNesteAttr) {
        var
          nLevelStart = aCache.length, bChildren = oParentNode.hasChildNodes(),
          bAttributes = oParentNode.nodeType === oParentNode.ELEMENT_NODE && oParentNode.hasAttributes(), bHighVerb = Boolean(nVerb & 2);

        var
          sProp, vContent, nLength = 0, sCollectedTxt = "",
          vResult = bHighVerb ? {} : /* put here the default value for empty nodes: */ (sEmptyTrue ? true : '');

        if (bChildren) {
          for (var oNode, nItem = 0; nItem < oParentNode.childNodes.length; nItem++) {
            oNode = oParentNode.childNodes.item(nItem);
            if (oNode.nodeType === 4) { sCollectedTxt += oNode.nodeValue; } /* nodeType is "CDATASection" (4) */
            else if (oNode.nodeType === 3) { sCollectedTxt += oNode.nodeValue.trim(); } /* nodeType is "Text" (3) */
            else if (oNode.nodeType === 1 && !(sIgnorePrefixed && oNode.prefix)) { aCache.push(oNode); } /* nodeType is "Element" (1) */
          }
        }

        var nLevelEnd = aCache.length, vBuiltVal = parseText(sCollectedTxt);

        if (!bHighVerb && (bChildren || bAttributes)) { vResult = nVerb === 0 ? objectify(vBuiltVal) : {}; }

        for (var nElId = nLevelStart; nElId < nLevelEnd; nElId++) {
          sProp = aCache[nElId].nodeName;
          if (sLowCase) sProp = sProp.toLowerCase();
          vContent = createObjTree(aCache[nElId], nVerb, bFreeze, bNesteAttr);
          if (vResult.hasOwnProperty(sProp)) {
            if (vResult[sProp].constructor !== Array) { vResult[sProp] = [vResult[sProp]]; }
            vResult[sProp].push(vContent);
          } else {
            vResult[sProp] = vContent;
            nLength++;
          }
        }

        if (bAttributes) {
          var
            nAttrLen = oParentNode.attributes.length,
            sAPrefix = bNesteAttr ? "" : sAttrsPref, oAttrParent = bNesteAttr ? {} : vResult;

          for (var oAttrib, oAttribName, nAttrib = 0; nAttrib < nAttrLen; nLength++, nAttrib++) {
            oAttrib = oParentNode.attributes.item(nAttrib);
            oAttribName = oAttrib.name;
            if (sLowCase) oAttribName = oAttribName.toLowerCase();
            oAttrParent[sAPrefix + oAttribName] = parseText(oAttrib.value.trim());
          }

          if (bNesteAttr) {
            if (bFreeze) { Object.freeze(oAttrParent); }
            vResult[sAttrProp] = oAttrParent;
            nLength -= nAttrLen - 1;
          }
        }

        if (nVerb === 3 || (nVerb === 2 || nVerb === 1 && nLength > 0) && sCollectedTxt) {
          vResult[sValProp] = vBuiltVal;
        } else if (!bHighVerb && nLength === 0 && sCollectedTxt) {
          vResult = vBuiltVal;
        }

        if (bFreeze && (bHighVerb || nLength > 0)) { Object.freeze(vResult); }

        aCache.length = nLevelStart;

        return vResult;
      }

      function loadObjTree (oXMLDoc, oParentEl, oParentObj) {
        var vValue, oChild;

        if (oParentObj.constructor === String || oParentObj.constructor === Number || oParentObj.constructor === Boolean) {
          oParentEl.appendChild(oXMLDoc.createTextNode(oParentObj.toString())); /* verbosity level is 0 or 1 */
          if (oParentObj === oParentObj.valueOf()) { return; }
        } else if (oParentObj.constructor === Date) {
          oParentEl.appendChild(oXMLDoc.createTextNode(oParentObj.toGMTString()));
        }

        for (var sName in oParentObj) {
          vValue = oParentObj[sName];
          if (vValue === null) vValue = {};
          if (isFinite(sName) || vValue instanceof Function) { continue; } /* verbosity level is 0 */
          // when it is _
          if (sName === sValProp) {
            if (vValue !== null && vValue !== true) { oParentEl.appendChild(oXMLDoc.createTextNode(vValue.constructor === Date ? vValue.toGMTString() : String(vValue))); }
          } else if (sName === sAttrProp) { /* verbosity level is 3 */
            for (var sAttrib in vValue) { oParentEl.setAttribute(sAttrib, vValue[sAttrib]); }
          } else if (sName === sAttrsPref+'xmlns') {
            // do nothing: special handling of xml namespaces is done via createElementNS()
          } else if (sName.charAt(0) === sAttrsPref) {
            oParentEl.setAttribute(sName.slice(1), vValue);
          } else if (vValue.constructor === Array) {
            for (var nItem = 0; nItem < vValue.length; nItem++) {
              oChild = oXMLDoc.createElementNS(vValue[nItem][sAttrsPref+'xmlns'] || oParentEl.namespaceURI, sName);
              loadObjTree(oXMLDoc, oChild, vValue[nItem]);
              oParentEl.appendChild(oChild);
            }
          } else {
            oChild = oXMLDoc.createElementNS((vValue || {})[sAttrsPref+'xmlns'] || oParentEl.namespaceURI, sName);
            if (vValue instanceof Object) {
              loadObjTree(oXMLDoc, oChild, vValue);
            } else if (vValue !== null && vValue !== true) {
              oChild.appendChild(oXMLDoc.createTextNode(vValue.toString()));
            } else if (!sEmptyTrue && vValue === true) {
              oChild.appendChild(oXMLDoc.createTextNode(vValue.toString()));

            }
            oParentEl.appendChild(oChild);
          }
        }
      }

      this.xmlToJs = this.build = function (oXMLParent, nVerbosity /* optional */, bFreeze /* optional */, bNesteAttributes /* optional */) {
        var _nVerb = arguments.length > 1 && typeof nVerbosity === "number" ? nVerbosity & 3 : /* put here the default verbosity level: */ 1;
        return createObjTree(oXMLParent, _nVerb, bFreeze || false, arguments.length > 3 ? bNesteAttributes : _nVerb === 3);
      };

      this.jsToXml = this.unbuild = function (oObjTree, sNamespaceURI /* optional */, sQualifiedName /* optional */, oDocumentType /* optional */) {
        var documentImplementation = xmlDom.document && xmlDom.document.implementation || new xmlDom.DOMImplementation();
        var oNewDoc = documentImplementation.createDocument(sNamespaceURI || null, sQualifiedName || "", oDocumentType || null);
        loadObjTree(oNewDoc, oNewDoc.documentElement || oNewDoc, oObjTree);
        return oNewDoc;
      };

      this.config = function(o) {
        if (typeof o === 'undefined') {
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
        for (var k in o) {
          switch(k) {
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
              DOMParser = new xmlDom.DOMParser({
                  errorHandler: parserErrorHandler,
                  locator: {}
              });
              break;
            default:
              break;
          }
        }
      };

      this.stringToXml = function(xmlStr) {
        if (!DOMParser) DOMParser = new xmlDom.DOMParser();
        return DOMParser.parseFromString(xmlStr, 'application/xml');
      };

      this.xmlToString = function (xmlObj) {
        if (typeof xmlObj.xml !== "undefined") {
          return xmlObj.xml;
        } else {
          return (new xmlDom.XMLSerializer()).serializeToString(xmlObj);
        }
      };

      this.stringToJs = function(str) {
        var xmlObj = this.stringToXml(str);
        return this.xmlToJs(xmlObj);
      };

      this.jsToString = this.stringify = function(oObjTree, sNamespaceURI /* optional */, sQualifiedName /* optional */, oDocumentType /* optional */) {
        return this.xmlToString(
          this.jsToXml(oObjTree, sNamespaceURI, sQualifiedName, oDocumentType)
        );
      };
    })();

}));

},{"xmldom":1}]},{},[2])(2)
});