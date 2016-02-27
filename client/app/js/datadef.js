'use strict';

angular.module('navotron.datadef', [])

.factory('datadef', function() {

    var datadef = {};

    // DATADEFINITIONS
    // --------------------------------------------------

    // SearchParams is { search: String, ordering: String }
        // search           - The search string, will match *searchstring*.
        // ordering         - For asending order "name", for descending "-name".
        // limit            - Maximum number of items to return.
        // offset           - The offset indicates the starting position of the query.

    datadef.SP1 = { search: '', ordering: '', limit: '', offset: '' };
    datadef.SP2 = { search: '', ordering: 'name', limit: '0', offset: '10' };
    datadef.SP3 = { search: '', ordering: '-name', limit: '10', offset: '10' };
    datadef.SP4 = { search: 'linu', ordering: 'name', limit: '10', offset: '100' };

    // RestUrl is string:
    // interp. the URL used in rest calls.

        // | URL                                                    | VERB   | RESPONSE           |
        // ----------------------------------------------------------------------------------------
        // | /workareas                                             | GET    | LIST all WORKAREAS |
        // | /workareas                                             | POST   | SAVE WORKAREA      |
        // | /workareas/<integer>                                   | GET    | SHOW WORKAREA      |
        // | /workareas/<integer>                                   | PUT    | UPDATE WORKAREA    |
        // | /workareas/<integer>                                   | DELETE | DELETE WORKAREA    |

    datadef.RURL_WORKAREA_LIST = '/workareas';
    datadef.RURL_WORKAREA_DETAIL = '/workareas/123';

        // | URL                                                    | VERB   | RESPONSE           |
        // ----------------------------------------------------------------------------------------
        // | /workareas/<integer>/nodes                             | GET    | LIST all NODES     |
        // | /workareas/<integer>/nodes                             | POST   | SAVE NODE          |
        // | /workareas/<integer>/nodes/<integer>                   | GET    | SHOW NODE          |
        // | /workareas/<integer>/nodes/<integer>                   | PUT    | UPDATE NODE        |
        // | /workareas/<integer>/nodes/<integer>                   | DELETE | DELETE NODE        |

    datadef.RURL_NODE_LIST = '/workareas/123/nodes';
    datadef.RURL_NODE_DETAIL = '/workareas/123/nodes/123';

        // | URL                                                    | VERB   | RESPONSE              |
        // -------------------------------------------------------------------------------------------
        // | /workareas/<integer>/keywords                             | GET    | LIST all KEYWORDS  |
        // | /workareas/<integer>/keywords                             | POST   | SAVE KEYWORDS      |
        // | /workareas/<integer>/keywords/<integer>                   | GET    | SHOW KEYWORDS      |
        // | /workareas/<integer>/keywords/<integer>                   | PUT    | UPDATE KEYWORDS    |
        // | /workareas/<integer>/keywords/<integer>                   | DELETE | DELETE KEYWORDS    |

    datadef.RURL_NODE_LIST = '/workareas/123/nodes';
    datadef.RURL_NODE_DETAIL = '/workareas/123/nodes/123';

    // WorkArea is { hash_id : Integer, site_url : String, owner : Integer }:
        // hash_id          - the hash_id of the workarea
        // site_url         - the site_url of the workarea
        // owner            - the owner of the workarea
        // interp. a representation of the workarea

    datadef.WA1 = { 'hash_id' : 'asdasd', 'site_url' : 'http://linus-little-haven.se', 'owner' : 1, 'country': 'SE' };
    datadef.WA2 = { 'hash_id' : 'fwergwvfd', 'site_url' : 'http://my-special-place.se', 'owner' : 1, 'country': 'SE' };
    datadef.WA3 = { 'hash_id' : 'asdascdscae', 'site_url' : 'http://the-rankor-cave.se', 'owner' : 2, 'country': 'SE' };

        // function fn_for_work_area(wa) {
        //  return wa['hash_id']... wa['site_url']... wa['site_url']...
        // }


    // Element is { id : String, childNodes : (listof Element), nodeName : String, innerText : String, getAttribute : function() }:
        // id               - the id of the html element
        // childNodes       - the childNodes under a html element
        // nodeName         - the name of the node
        // innerText        - the text of the element
        // getAttribute     - a function that returns the attribute value from a element
        // interp. a html element in the dom

    //jscs:disable validateIndentation
    datadef.HTML1 = $.parseHTML(
        ['<ul>',
            '<li id="1" name="Home">',
                '<div>Home</div>',
            '</li>',
            '<li id="5" name="Category">',
                '<div>Category</div>',
                '<span>',
                    '<ul>',
                        '<li id="2" name="Produkt 1">',
                            '<div>Produkt 1</div>',
                        '</li>',
                        '<li id="3" name="Product 2">',
                            '<div>Product 2</div>',
                        '</li>',
                        '<li id="4" name="Product 3">',
                            '<div>Product 3</div>',
                        '</li>',
                    '</ul>',
                '</span>',
            '</li>',
        '</ul>'].join('\n'));
    //jscs:enable validateIndentation

        // function fn_for_element(n) {
        //  return n['id']... n['nodeName']... n['childNodes']... n['childNodes']...
        // }


    // SearchQuery is { keywords : (listof String), country : String, limit : Integer }
        // keywords         - Specifies the list of keywords to search against.
        // country          - Specifies the territory to search within. Two letter ISO country code or "global".
        // limit            - Specifies the number of returned results. (deafult 10)

    datadef.SQ1 = {
        'keywords': ['vår', 'fast elpris', 'elavtal'],
        'country': 'se',
        'limit': 100,
    };

    datadef.SQ2 = {
        'keywords': ['party', 'moped'],
        'country': 'en',
        'limit': 100,
    };

    datadef.SQ3 = {
        'keywords': ['i_do_not_exist_as_a_keyword', 'neither_do_I_my_friend'],
        'country': 'en',
        'limit': 100,
    };

        // function fn_for_search_query(n) {
        //  return n['keywords']... n['country']... n['limit']...
        // }


    // Keyword is { volume : Integer, timestamp : String, country : String, keyword : String }
        // volume           - Number of searches.
        // timestamp        - Has the highest date value from the specified range of dates.
        // country          - Specifies the territory to search within. Two letter ISO country code or 'global'.
        // keyword          - The keword that was searched for.

    datadef.SV1 = {
        'volume': 5400,
        'timestamp': '2014-08-01',
        'country': 'EN',
        'keyword': 'comics'
    };

    datadef.SV2 = {
        'volume': 9900,
        'timestamp': '2014-08-01',
        'country': 'EN',
        'keyword': 'comic'
    };

    datadef.SV3 = {
        'volume': 9900,
        'timestamp': '2014-08-01',
        'country': 'EN',
        'keyword': 'batman comic'
    };

    datadef.SV4 = {
        'volume': 70,
        'timestamp': '2014-08-01',
        'country': 'EN',
        'keyword': 'green lantern comic'
    };

    datadef.SV5 = {
        'volume': 390,
        'timestamp': '2014-08-01',
        'country': 'EN',
        'keyword': 'superman comic'
    };

        // function fn_for_search_query(n) {
        //  return n['volume']... n['timestamp']... n['country']... n['keyword']...
        // }


    // SearchVolumeResult is { result : (listof Keyword), total : Integer, took :  Integer }
        // result           - The result of the search on keywords with search volume, can be empty
        // total            - The amount of keywords that where returned in the request
        // took             - The amount of time the request took in milliseconds. (I think)

    datadef.SVR1 = {
        'results': [
            datadef.SV1,
            datadef.SV2,
            datadef.SV3
        ],
        'total': 3,
        'took': 2
    };

    datadef.SVR2 = {
        'results': [],
        'total': 0,
        'took': 2
    };

        // function fn_for_search_query(n) {
        //  return n['results']... n['total']... n['took']...
        // }

    // Node is { id : Integer, name : String, children : (listof Node), keywords : (listof Keyword) }:
        // id           - the id for the node
        // name         - the name of the node
        // children     - a list of childnodes, can be empty
        // keywords     - a list of keywords connected to the node
        // parentNode   - the parent node id
        // workarea     - the hash_id of the workarea
        // index        - an index to indicate the order of the nodes
        // interp. a representation of a node i in a treestructure

    datadef.N1 = { 'id' : '1', 'index': 0, 'parentNode' : null, 'workarea' : '1',  'name' : 'Home', 'children' : [], 'keywords' : [] };
    datadef.N2 = { 'id' : '2', 'index': 0, 'parentNode' : 5, 'workarea' : '1',  'name' : 'Superman', 'children' : [], 'keywords' : [datadef.SV5] };
    datadef.N3 = { 'id' : '3', 'index': 1, 'parentNode' : 5, 'workarea' : '1',  'name' : 'Batman', 'children' : [], 'keywords' : [datadef.SV3] };
    datadef.N4 = { 'id' : '4', 'index': 2, 'parentNode' : 5, 'workarea' : '1',  'name' : 'Green Lantern', 'children' : [], 'keywords' : [datadef.SV4] };
    datadef.N5 = { 'id' : '5', 'index': 1, 'parentNode' : null, 'workarea' : '1',  'name' : 'Comics', 'children' : [datadef.N2, datadef.N3, datadef.N4], 'keywords' : [datadef.SV1, datadef.SV2] };
    datadef.N6 = { 'id' : '6', 'index': 2, 'parentNode' : null, 'workarea' : '1',  'name' : 'About us', 'children' : [], 'keywords' : [] };
    datadef.N7 = { 'id' : '7', 'index': 3, 'parentNode' : null, 'workarea' : '1',  'name' : 'Contact us', 'children' : [], 'keywords' : [] };

        // EXAMPLE:
        // root
        // - Home
        // - Category
        //      - Product 1
        //      - Product 2
        //      - Product 3
        // - About us
        // - Contact us

        // function fn_for_node(n) {
        //  return n['id']... n['name']... n['children']... n['keywords']...
        // }

    return datadef;

});
