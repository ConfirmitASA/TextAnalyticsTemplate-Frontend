import Highlight from '../lib/Highlight.js';

class HierarchyTable{
  /**
   * Converts flat view rowheaders into a tree-view rowheaders with ability to switch between views.
   * After hierarchy is initialized, `HierarchyTable.data` array will reflect the rows of the table in their visible order and contain `meta` for each row in the array.
   * When a row is collapsed, a `reportal-table-hierarchy-collapsed` Event is fired.
   * When a row is uncollapsed, a `reportal-table-hierarchy-uncollapsed` Event is fired.
   * When a row is switched to flat-view, a `reportal-table-hierarchy-flat-view` Event is fired.
   * When a row is switched to tree-view, a `reportal-table-hierarchy-tree-view` Event is fired.
   * @param {HTMLTableElement} source - source table that needs a cloned header
   * @param {Array} hierarchy - array of hierarchy objects from Reportal
   * @param {Object} rowheaders - JSON object which contains all table rowheaders with category id and index of table row
   * @param {Number} [hierColumn=0] - index of column in the table that contains hierarchy (increments from `0`)
   * @param {Boolean} [flat=false] - Should hierarchy be rendered flatly(`true`), or in a tree-fashion (`false`).
   *
   * @param {Object} search - config for searching functionality. See {@link HierarchyTable#setupSearch}
   * @param {Boolean} search.enabled=false - flag to be set when enabling the search
   * @param {Boolean} search.immediate=false - flag to be set for serach to happen after each stroke rather than by `timeout`
   * @param {Number} search.timeout=300 - minimal time(in milliseconds) after last keystroke when searching takes place
   * @param {Boolean} [search.searching=false] - this property is mostly for internal use and is set when searching is in progress, which adds a class to the table hiding all rows not matching search
   * @param {String} [search.query=''] - search string
   * @param {HTMLInputElement} search.target - the input element that triggered the search.
   *
   * @param {Array} [data=null] - array with data if it's passed from outside, rather than acquired from the `source` (HTML table)
   * */
  constructor({source,hierarchy,rowheaders,hierColumn = 0,flat = false,search={},data=null} = {}){
    this.source = source;
    this.hierarchy = hierarchy;
    this.rowheaders = rowheaders;
    this.data=data;
    this.column = hierColumn;
    this._collapseEvent = this.constructor.newEvent('reportal-table-hierarchy-collapsed');
    this._uncollapseEvent = this.constructor.newEvent('reportal-table-hierarchy-uncollapsed');
    this._flatEvent = this.constructor.newEvent('reportal-table-hierarchy-flat-view');
    this._treeEvent = this.constructor.newEvent('reportal-table-hierarchy-tree-view');
    this.flat = flat;
    this.search = this.setupSearch(search);
    this.init();
    this.__lastEffectiveParent = null;// we'll store row of parent when doing search for effectiveness of children recursion in `searchRowheaders`
  }

  /**
   * Initializes the hierarchical structure for a table by creating new set of table rows with correct order and additional information in attributes
   * */
  init(){
    this.data = this.data || this.parseHierarchy();
    let tbody = this.source.querySelector("tbody");
    if(tbody.firstChild && tbody.firstChild.nodeType==3){
      tbody.removeChild(tbody.firstChild)
    }
    this.data.forEach((item)=>{tbody.appendChild(item.meta.row);});
  }

  /**
   * This function initializes a prototype for search functionality for hierarchical column
   * @param {Boolean} enabled=false - flag to be set when enabling the search
   * @param {Boolean} immediate=false - flag to be set for serach to happen after each stroke rather than by `timeout`
   * @param {Number} timeout=300 - minimal time(in milliseconds) after last keystroke when searching takes place
   * @param {Boolean} [searching=false] - this property is mostly for internal use and is set when searching is in progress, which adds a class to the table hiding all rows not matching search
   * @param {String} [query=''] - search string
   * @param {HTMLInputElement} target - the input element that triggered the search.
   * @param {Boolean} [visible=false] - search box is visible
   * @param {Boolean} [highlight=true] - search matches will be highlighted
   * */
  setupSearch({enabled = false, immediate = false, timeout=300, searching=false, query='', target, visible=false,highlight = true}={}){
    var _searching = searching,
      self = this,
      _query = query,
      _visible=visible,
      _highlight = highlight? new Highlight({element:[].slice.call(this.source.querySelectorAll(`tbody>tr>td:nth-child(${this.column+1})`)),type:'open'}):null;

    return {
      timeout,
      enabled,
      immediate,
      target,
      highlight:_highlight,
      get query(){return _query},
      set query(val){
        _query = val;
        if(val.length==0 && this.highlight){this.highlight.remove();} // clear highlighting when query length is 0
      },

      get visible(){return _visible},
      set visible(val){
        _visible = val;
        [].slice.call(self.source.parentNode.querySelectorAll('.hierarchy-search')).forEach(button=>{
        val?button.classList.add('visible'):button.classList.remove('visible');});
      },

      get searching(){return _searching},
      set searching(val){
          _searching=val;
          val?self.source.classList.add('reportal-hierarchy-searching'):self.source.classList.remove('reportal-hierarchy-searching');
          if(!val){
            self.collapseAll(); // we want to collapse all expanded rows that could be expanded during search
          }
      }
    }
  }

  /**
   * This function builds a prototype for each row
   * @param {HTMLTableRowElement} row - reference to the `<tr>` element
   * @param {String} id - internal Reportal id for the row
   * @param {String} flatName - default string name ('/'-delimited) for hierarchy
   * @param {String} name - a trimmed version of `flatName` containing label for this item without parent suffices
   * @param {String} parent - internal Reportal id of parent row
   * @param {Number} level - level of hierarchy, increments form `0`
   * @param {Boolean} [hidden=true] - flag set to hidden rows (meaning their parent is in collapsed state)
   * @param {Boolean} [collapsed=undefined] - flag only set to rows which have children (`hasChildren=true`)
   * @param {Boolean} [matches=false] - flag set to those rows which match `search.query`
   * @param {Boolean} [hasChildren=false] - flag set to rows which contain children
   * */
  setupMeta({row,id,flatName,name,parent,level,hidden=true,collapsed,matches=false,hasChildren=false}={}){
    let _hidden = hidden, _collapsed = collapsed, _hasChildren=hasChildren, _matches = matches, self=this;
    return {
      row,
      id,
      flatName,
      name,
      parent,
      level,
      get hasChildren(){return _hasChildren},
      set hasChildren(val){
        _hasChildren = val;
        if(typeof val!=undefined && !val){
          this.row.classList.add('reportal-no-children');
        }
      },
      get hidden(){return _hidden},
      set hidden(val){
        _hidden=val;
        val?this.row.classList.add("reportal-hidden-row"):this.row.classList.remove("reportal-hidden-row");
      },
      get collapsed(){return _collapsed},
      set collapsed(val){
        if(typeof val != undefined && this.hasChildren){
          _collapsed=val;
          if(val){
            this.row.classList.add("reportal-collapsed-row");
            this.row.classList.remove("reportal-uncollapsed-row");
            self.toggleHiddenRows(this);
            this.row.dispatchEvent(self._collapseEvent);
          } else {
            this.row.classList.add("reportal-uncollapsed-row");
            this.row.classList.remove("reportal-collapsed-row");
            self.toggleHiddenRows(this);
            this.row.dispatchEvent(self._uncollapseEvent);
          }
        }
      },
      get matches(){return _matches},
      set matches(val){
        _matches=val;
        if(val){
          this.row.classList.add("matched-search");
        } else {
          this.row.classList.contains("matched-search")?this.row.classList.remove("matched-search"):null;
          if(this.hasChildren){
            this.collapsed=true;
          }
        }
      }
    };

  }

  /**
   * Sets `this.flat`, adds/removes `.reportal-heirarchy-flat-view` to the table and updates labels for hierarchy column to flat/hierarchical view
   * @param {Boolean} val - value to set on `flat`
   * */
  set flat(val){
    this._flat=val;
    val?this.source.classList.add('reportal-heirarchy-flat-view'):this.source.classList.remove('reportal-heirarchy-flat-view');
    // we want to update labels to match the selected view
    if(this.search && this.search.searching && this.search.highlight){this.search.highlight.remove();} //clear highlighting
    if(this.data){
      this.data.forEach((row)=> {
        this.updateCategoryLabel(row);
      });
    }
    //if the search is in progress, we need to model hierarchical/flat search which is basically redoing the search.
    if(this.search && this.search.searching){
      this.search.searching = false; // clears search
      this.search.searching = true; //reinit search
      this.searchRowheaders(this.search.query); //pass the same query
    } else if(this.search && !this.search.searching && !val){
      this.data.forEach((row)=>{this.toggleHiddenRows(row.meta)});
    }

    val?this.source.dispatchEvent(this._flatEvent):this.source.dispatchEvent(this._treeEvent)
  }
  /**
   * getter for `flat`
   * @return {Boolean}
   * */
  get flat(){
    return this._flat;
  }

  /**
   * Replaces category label in the array in the hierarchical column position and in the html row through meta. Replacing it in the array is important for sorting by category.
   * @param {Array} row - an item in the `this.data` Array
   * */
  updateCategoryLabel(row){
    let cell = row.meta.row.children.item(this.column),
      // we want to male sure if there is a link (drill-down content) then we populate the link with new title, else write to the last text node.
      label = cell.querySelector('a')? cell.querySelector('a') : cell.childNodes.item(cell.childNodes.length-1),
      text = this.flat? row.meta.flatName: row.meta.name;
    // update the label in the array
    row[this.column] = text;
    // update the label in the table.
    label.nodeType==3? label.nodeValue=text : label.textContent = text;
  }

  /**
   * Recursive function taking rows according to `hierarchy` object, adding information to that row, retrieving data from the row, and adding this array to `this.data`
   * Each item in the array has a `meta {Object}` property that has the following structure:
   *
   * ``` javascript
   * {
   *    collapsed: Boolean, // if true, the row is collapsed, defined if `hasChildren`
   *    hasChildren: Boolean, // if true, it has children
   *    flatName: String, // label for flat view ('/'-separated)
   *    name: String, // label for the current level (single-label without parent prefixes)
   *    id: String, // item id from Reportal table
   *    level: Number, // hierarchy level
   *    parent: String, // parent id of the nested level
   *    row: HTMLTableRowElement // reference to the `tr` element in the table
   * }
   * ```
   *
   * @param {Array} hierarchy - array of hierarchy objects from reportal
   * @param {int} level - depth of the function
   * @param {Array} array - changedTable for children level
   * @return {Array}
   */
  parseHierarchy(hierarchy=this.hierarchy,level=0,array=[]){
    return hierarchy.reduce((resultArray,item,index,array)=>{
      if(this.rowheaders[item.id]) {
        var row = this.source.querySelectorAll(":scope > tbody > tr")[this.rowheaders[item.id].index];
        row.setAttribute("self-id", item.id);

        if (item.parent) {
          row.setAttribute("parent", item.parent);
        }
        //we need to push to the array before we add arrows/circles to labels so that we have clean labels in array and may sort them as strings
        resultArray.push([].slice.call(row.children).map((td)=> {
          return td.children.length == 0 ? this.constructor._isNumber(td.textContent.trim()) : td.innerHTML
        }));
        let currentRowArray = resultArray[resultArray.length - 1];

        //build a prototype for a row
        currentRowArray.meta = this.setupMeta({
          row: row,
          id: item.id,
          flatName: item.name,
          name: item.name.split('/').reverse()[0].trim(),
          parent: item.parent,
          level: level,
          hasChildren: item.children.length > 0
        });

        row.classList.add("level" + level.toString());

        if (level > 0) {
          currentRowArray.meta.hidden = true;
          this.clearLink(row);
        }
        if (item.children.length > 0) {
          currentRowArray.meta.collapsed = true;
          //currentRowArray.meta.hasChildren=true;
        } else {
          //currentRowArray.meta.hasChildren=false;
          //currentRowArray.meta.collapsed=false;
        }

        // adds a toggle button
        this.addCollapseButton(currentRowArray.meta);
        // initializes row headers according to `this.flat`
        this.updateCategoryLabel(currentRowArray);

        level < 2 ? resultArray = this.parseHierarchy(item.children, level + 1, resultArray) : null;
      }
      return resultArray
    },array);
  }


  /**
   * Inspects if the current string might be converted to number and renders it as number. If string length is 0, returns `null`. If none applies returns the string as is.
   * @param {String} str - value of the cell if not HTML contents
   * @return {Number|null|String}
   * */
  static _isNumber(str){
    if(!isNaN(parseFloat(str)) && parseFloat(str).toString().length ==str.length){
      return parseFloat(str)
    } else if(str.length==0){return null} else {return str}
  }

  /**
   * Removes a drilldown link from elements that are the lowest level of hierarchy and don't need it
   * @param {HTMLTableRowElement} row - row element in the table
   * */
    clearLink(row){
    var link = row.querySelector("a");
    if(link) {
      link.parentElement.textContent = link.textContent;
    }
  }

  /**
   * function to add button to the left of the rowheader
   * @param {Object} meta - meta for the row element in the table
   */
  addCollapseButton(meta){
    var collapseButton = document.createElement("div");
    collapseButton.classList.add("reportal-collapse-button");

    collapseButton.addEventListener('click', () => {meta.collapsed = !meta.collapsed;});

    meta.row.children[this.column].insertBefore(collapseButton,meta.row.children[this.column].firstChild);
    meta.row.children[this.column].classList.add('reportal-hierarchical-cell');
  }

  static newEvent(name){
    //TODO: refactor this code when event library is added
    var event = document.createEvent('Event');
    // Define that the event name is `name`.
    event.initEvent(name, true, true);
    return event;
  }

  /**
   * function to hide or show child rows
   * @param {Object} meta - meta for the row element in the table
   */
  toggleHiddenRows(meta){
    if(meta.hasChildren && this.data){
      let children = this.data.filter((row)=>{return row.meta.parent==meta.id});
      children.forEach((childRow)=>{
        if(meta.collapsed){                                           // if parent (`meta.row`) is collapsed
          childRow.meta.hidden=true;                                  // hide all its children and
          if(childRow.meta.hasChildren && !childRow.meta.collapsed){  // if a child can be collapsed
            childRow.meta.collapsed=true;                             // collapse it and
            this.toggleHiddenRows(childRow.meta);                     // repeat for its children
          }
        } else {                                                      // otherwise make sure we show all children of an expanded row
          childRow.meta.hidden=false;
        }
      });
    }
  }

  /**
   * This function runs through the data and looks for a match in `row.meta.flatName` (for flat view) or `row.meta.name` (for tree view) against the `str`.
   * @param {String} str - expression to match against (is contained in `this.search.query`)
   * //TODO: add higlighting to the matched query in strings
   * */
  searchRowheaders(str){
    let regexp = new RegExp('('+str+')','i');
    this.data.forEach((row)=>{
      if(this.flat){
        row.meta.matches = regexp.test(row.meta.flatName);
        row.meta.hidden=false;
      } else {
        let parent; // we want to temporarily store the parent for recursion to be computationally effective and not to perform filtering of `data` on every sneeze
       if(row.meta.parent.length>0 && this.__lastEffectiveParent!=null && this.__lastEffectiveParent.meta.id == row.meta.parent){
         parent = this.__lastEffectiveParent;
       } else {
         parent = this.__lastEffectiveParent = this.data.find(parent=>parent.meta.id==row.meta.parent);
       }
      // if it has a parent and maybe not matches and the parent has match, then let it and its children be displayed
      if(row.meta.parent.length>0 && !regexp.test(row.meta.name) && parent.meta.matches){
          // just in case it's been covered in previous iteration
          if(!row.meta.matches){row.meta.matches=true}
          row.meta.hidden=parent.meta.collapsed;

        } else { // if has no parent or parent not matched let's test it, maybe it can have a match, if so, display his parents and children
          let matches = regexp.test(row.meta.name);
          row.meta.matches = matches;
            if(matches){
              this.uncollapseParents(row.meta);
            }
          }
      }
    });
    this.search.highlight.apply(str);
  }

  /*
  * Collapses all rows which were previously uncollapsed
  * **/
  collapseAll(){
    this.data.forEach((row)=>{
      let collapsed = row.meta.collapsed;
      if(typeof collapsed != undefined && !collapsed){
        row.meta.collapsed=true;
      }
    });
  }

  /**
   * Uncollapses the immediate parents of a row which `meta` is passed as an attribute. Utility function for serach to uncollapse all parents of a row that was matched during search
   * @param {Object} meta - `row.meta` object. See {@link HierarchyTable#setupMeta} for details
   * */
  uncollapseParents(meta){
    if(meta.parent.length>0){ // if `parent` String is not empty - then it's not top level parent.
      let parent = this.data.find(row => row.meta.id==meta.parent);
      if(parent.meta.collapsed){parent.meta.collapsed=false};
      parent.meta.row.classList.add('matched-search');
      this.uncollapseParents(parent.meta);
    }
  }

}

/*Array.prototype.slice.call(document.querySelectorAll('table.reportal-hierarchy-table:not(.fixed)')).forEach((table)=>{
  var hierarchyTable= new HierarchyTable({source:table,hierarchy:hierarchy,rowheaders:rowheaders,flat:true});
});*/

export default HierarchyTable;
