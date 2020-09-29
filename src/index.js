//@ts-check
"use strict";

/**
 * @typedef {string|RegExp|RegExpTemplate} TemplateElement
 */

/**
 * @typedef {TemplateElement|TemplateNode} TemplateInternal
 */

/**
 * @typedef {Object<string, Set<number>} VarIndexMap
 */


/**
 * !!! internal helper function !!!
 * Returns the content string.
 * i.e. the RegExp without slashes notation and flags.
 * @param {RegExp} regexp
 * @returns {string} the processed regexp.
 */
function getRegExpPattern(regexp) {
  // convert to string
  const reStr = regexp.toString();

  // find the index of the last slash
  let endIndex = reStr.length;
  while (reStr[endIndex] !== '/') endIndex--;

  // return the regexp pattern
  return reStr.substring(1, endIndex);
}


/**
 * !!! internal helper function !!!
 *
 * @param {string} regExpPattern pattern to
 * search and slit by vars
 *
 * @returns {string[]} an array with
 * all parts separated by the found variables.
 * The odd positions contain the variables' names.
 */
function splitVars(regExpPattern) {
  return regExpPattern.split( /\\V\s*\{\s*([a-zA-Z]\w*)\s*\}/g );
}

/**
 * !!! internal helper function !!!
 * Process regexp for template.
 * Get pattern, create node if necessary,
 * add node and process variables.
 *
 * @param {RegExp} regexp RegExp to be processed.
 *
 * @param {TemplateNode[]} templateStack
 * the target RegExpTemplate's templateStack.
 *
 * @param {number[]} parents array of indexes of
 * the parents on the templateStack.
 * Only used if the passed regexp generates a new node.
 *
 * @returns {string|TemplateNode} the processed regexp.
 */
function processRegExp(regexp, templateStack, parents) {
  const regExpPattern = getRegExpPattern(regexp);

  const varSplit = splitVars(regExpPattern);

  // if a variable is found then
  // the varSplit array's length is >= 3
  if (varSplit.length >= 3) {
    const node = new TemplateNode(templateStack.length);

    node._body = varSplit;

    templateStack.push(node);
    node._parents = parents;

    node.mapVariables();

    return node;
  }

  return varSplit[0];
}

/**
 * !!! internal helper function !!!
 * Process input element to an valid TemplateInternal.
 *
 * @param {*} element element to process.
 *
 *
 * @param {TemplateNode[]} templateStack
 * the target RegExpTemplate's templateStack.
 *
 * @param {number[]} parents ! to be passed to processRegExp !
 *
 * @returns {TemplateInternal}
 */
function processElement(element, templateStack, parents) {
  if (element instanceof RegExp) {
    return processRegExp(element, templateStack, parents);
  }
  else if (element instanceof RegExpTemplate) {
    return element;
  }
  else {
    throw new TypeError("Strings not implemented yet");
  }
}


/**
 * !!! internal class !!!
 * Used to represent the template internal tree.
 */
class TemplateNode {

  /**
   * @param {number} index index of the node in the templateStack.
   */
  constructor(index) {
    this._index = index;

    /**
     * Store all node's template elements
     * and/or children nodes.
     * @type {TemplateInternal[]}
     */
    this._body = [];

    /**
     * array of indexes of the parent
     * nodes on the templateStack
     * @type {number[]}
     */
    this._parents = null;

    /**
     * Object that maps children' template
     * index to they position in
     * this node's body
     * @type {Object<number, number>}
     */
    this._children = null;

    /**
     * Stores all variables' positions
     * in the node.
     * @type {VarIndexMap}
     */
    this._vars = null;

  }

  /**
   * Adds elements or nodes to the node's body.
   * Also keeps track of the children nodes positions
   * @param {...TemplateInternal} elements
   */
  add(elements) {
    for (const element of arguments) {

      // if the element is a TemplateNode
      // then map its position in this._children
      if (element instanceof TemplateNode) {
        // init children object if necessary
        if (!this._children) {
          this._children = {};
        }

        this._children[element._index] = this._body.length;
      }

      this._body.push(element);
    }
  }

  /**
   * Maps all variables in the node
   * into they positions in the node's body
   */
  mapVariables() {
    /**
     * @type {VarIndexMap}
     */
    const vars = {};

    for (let i = 1; i < this._body.length; i += 2) {
      const escapedVar = ">" + this._body[i];
      if (escapedVar in vars) {
        vars[escapedVar].add(i);
      } else {
        const varSet = new Set();
        varSet.add(i);
        vars[escapedVar] = varSet;
      }
    }

    this._vars = vars;
  }

  /**
   * @param {TemplateNode[]} templateStack
   *
   * @returns {TemplateNode[]}
   * an array with all the chindren nodes
   */
  getParents(templateStack) {
    if (!this._parents) {
      return [];
    }
    return this._parents.map(index => templateStack[index]);
  }

  /**
   *
   * @param {TemplateNode[]} templateStack 
   */
  propagateVars(templateStack) {

    for (const parent of this.getParents(templateStack)) {
      const selfVarNames = Object.getOwnPropertyNames(this._vars);

      if (selfVarNames.length > 0 && !parent._vars) {
        parent._vars = {};
      }

      /**
       * After adding the new positions, this boolean
       * will decide if current parent should propagate as well.
       * It will happen if at least one variable is not defined.
       * @type {boolean}
       */
      let shouldPropagate = false;
      for (const varName of selfVarNames) {
        if (!(varName in parent._vars)) {
          parent._vars[varName] = new Set();
          shouldPropagate = true;
        }

        parent._vars[varName].add(parent._children[this._index]);
      }

      if (shouldPropagate) {
        parent.propagateVars(templateStack);
      }
    }
  }

  /**
   * Compiles all the content of the node to a string.
   * @param {*} compiledNodes
   * @returns {string} the compiled string.
   */
  compile(compiledNodes) {
    let result = "";
    for (let i = 0; i < this._body.length; i++) {
      let currentElement = this._body[i];

      if (currentElement instanceof RegExpTemplate) {
        currentElement = currentElement.compile();
      }

      result += currentElement;
    }
    return result;
  }

}





class RegExpTemplate {

  /**
   * @param {...*} elements - starting elements to be added to the template.
   */
  constructor(...elements) {
    const rootNode = new TemplateNode(0);

    /**
     * @private
     * @type {TemplateNode[]}
     */
    this._templateStack = [rootNode];


    for (const rawElement of elements) {
      const element = processElement(rawElement, this._templateStack, [0]);

      rootNode.add(element);

      if (element instanceof TemplateNode) {
        element.propagateVars(this._templateStack);
      }
    }

  }

  /**
   * Compiles all the template elements to a single RegExp.
   * @returns {RegExp} the compiled RegExp
   */
  compile() {
    /**
     * @type {string[]}
     */
    const compiledNodes = new Array(this._templateStack.length);


    const finalCompilationString = this._templateStack[0].compile(compiledNodes);
    return new RegExp(finalCompilationString);
  }

}
