import Highlight from '../lib/Highlight.js';
import HierarchyBase from './HierarchyBase.js'


class TAHierarchyTable extends HierarchyBase{
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
   * @param {Number} [column=0] - index of column in the table that contains hierarchy (increments from `0`)
   * @param {Boolean} [flat=false] - Should hierarchy be rendered flatly(`true`), or in a tree-fashion (`false`).
   * @param {String} [flatNameDelimiter = '|'] - A delimiter used to separate rowheader labels in flat structure
   *
   * @param {Object} search - config for searching functionality. See {@link HierarchyTable#setupSearch}
   * @param {Boolean} search.enabled=false - flag to be set when enabling the search
   * @param {Boolean} search.immediate=false - flag to be set for serach to happen after each stroke rather than by `timeout`
   * @param {Number} search.timeout=300 - minimal time(in milliseconds) after last keystroke when searching takes place
   * @param {Boolean} [search.searching=false] - this property is mostly for internal use and is set when searching is in progress, which adds a class to the table hiding all rows not matching search
   * @param {String} [search.query=''] - search string
   * @param {HTMLInputElement} search.target - the input element that triggered the search.
   *
   * @param {Array} [data=[]] - array with data if it's passed from outside, rather than acquired from the `source` (HTML table)
   * @param {Array} [blocks=[]] - array with block ids that split hierarchies
   * */
  constructor({source,hierarchy,rowheaders,column = 0,flat = false, flatNameDelimiter = '|',search={},data=[],blocks=[], clearLinks = true} = {}){
    super();
    if(source){this.source=source;} else { throw new ReferenceError('`source` table is not specified for TAHierarchyTable')}
    if(hierarchy){this.hierarchy=hierarchy;} else { throw new ReferenceError('`hierarchy` is not specified for TAHierarchyTable')}
    if(rowheaders){this.rowheaders=rowheaders;} else { throw new ReferenceError('`rowheaders` are not specified for TAHierarchyTable')}
    this.column = column;
    this.blocks = blocks;
    this.flatNameDelimiter = flatNameDelimiter;
    this.clearLinks = clearLinks;
    this.data = this.setUpBlocks(data,blocks,clearLinks);
    this.flat = flat;
    this.search = this.setupSearch(search);

    this.init();
  }

  /**
   * Initializes the hierarchical structure for a table by creating new set of table rows with correct order and additional information in attributes
   * */
  init(){
    let tbody = this.source.querySelector("tbody");
    this.source.querySelector(`thead>tr>td:nth-child(${this.blocks.length>0?this.column:this.column+1})`).classList.add('reportal-hierarchical-header');

    if(tbody.firstChild && tbody.firstChild.nodeType==3){
      tbody.removeChild(tbody.firstChild)
    }
    this.reorderRows(this.data);
  }

  /**
   * Recursive function taking rows according to `hierarchy` object, adding information to that row, retrieving data from the row, and adding this array to `this.data`
   * Each item in the array has a `meta {Object}` (See {@link HierarchyTable#setupMeta}) property that has the following structure:
   *
   * ``` javascript
   * {
   *    collapsed: Boolean, // if true, the row is collapsed, defined if `hasChildren`
   *    hasChildren: Boolean, // if true, it has children
   *    flatName: String, // label for flat view ('/'-separated)
   *    name: String, // label for the current level (single-label without parent prefixes)
   *    nameCell: HTMLTableCellElement, // reference to the `<td>` element that contains the rowheader hierarchical label/name,
   *    block: String, // id of the block the row belongs to
   *    firstInBlock: Boolean, // whether the row is the first in this block, which meatns it has an extra cell at the beginning
   *    id: String, // item id from Reportal table
   *    level: Number, // hierarchy level
   *    parent: String, // parent id of the nested level
   *    row: HTMLTableRowElement // reference to the `tr` element in the table
   * }
   * ```
   *
   * @param {Array} hierarchy=this.hierarchy - array of hierarchy objects from Reportal
   * @param {int} level=0 - depth of the function
   * @param {String} block=null - an item from `blocks` array
   * @param {!Array} array - changed table for children levels
   * @return {Array}
   */
  parseHierarchy({hierarchy=this.hierarchy,level=0,block=null,array,rows,parent=null, clearLinks = true}={}){
    let blockName = null;
    if(block!==null){
      blockName = block.name.toLowerCase();
    }
    return hierarchy.reduce((resultArray,item,index)=>{
        let compoundID = block!==null? `${item.id}_${blockName}` : item.id; //this row is first in the block, which means it contains the first cell as a block cell and we need to indent the cell index when changing names in hierarchical column

        if(this.rowheaders[compoundID]){ //we want to skip those which aren't in rowheaders
          let row = rows[this.rowheaders[compoundID].index],
              firstInBlock = (block!==null && row.rowIndex === block.cell.parentNode.rowIndex), //this row is first in the block, which means it contains the first cell as a block cell and we need to indent the cell index when changing names in hierarchical column
              currentRowArray = HierarchyBase.stripRowData(row,firstInBlock,block);
          resultArray.push(currentRowArray);
          if(parent!=null){
            if(!parent.meta.children)parent.meta.children=[];
            parent.meta.children.push(currentRowArray);
          }

          const hasChildren = item.subcells.reduce((resultFlag, subcell) => {
            let subcellId = block!==null? `${subcell.id}_${blockName}` : subcell.id;
            return resultFlag || !!this.rowheaders[subcellId];
          }, false);

          //build a prototype for a row
          //let flatName = item.name.split(this.flatNameDelimiter).reverse()[0].trim();
          currentRowArray.meta = new this.setupMeta({
            row,
            id: item.id,
            block: block,
            flatName: item.text.trim(),
            name: item.name.trim(),//flatName,
            nameCell: row.children.item(block!==null ? (firstInBlock? this.column: this.column-1) : this.column),
            parent: parent,
            level,
            collapsed: item.subcells.length > 0,
            hasChildren: hasChildren,
            hidden: level > 0
          });

          row.classList.add("level" + level.toString());

          if (level > 0 && clearLinks) {
            this.constructor.clearLink(row);
          }

          // adds a toggle button
          HierarchyBase.addCollapseButton(currentRowArray.meta);
          // initializes row headers according to `this.flat`
          this.updateCategoryLabel(currentRowArray);

          if(item.subcells && item.subcells.length > 0)resultArray = this.parseHierarchy({hierarchy:item.subcells, level:level + 1, block, array:resultArray, rows, parent:currentRowArray, clearLinks });
        }

      return resultArray
    },array);
  }
}

export default TAHierarchyTable;
