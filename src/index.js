//@ts-check
"use strict";

/**
 * @typedef {string|RegExp|RegExpTemplate} TemplateElement
 */

/**
 * @typedef {TemplateElement|TemplateNode} TemplateInternal
 */

/**
 * @typedef {Object<string, Set<number>>} VarIndexMap
 */

 /**
  * @typedef {Map<TemplateNode, Set<number>>} ChildrenIndexMap
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
 * @returns {string|TemplateNode} the processed regexp.
 */
function processRegExp(regexp, templateStack) {
  const regExpPattern = getRegExpPattern(regexp);

  const varSplit = splitVars(regExpPattern);

  // if a variable is found then
  // the varSplit array's length is >= 3
  if (varSplit.length >= 3) {
    const node = new TemplateNode(templateStack.length);

    node._body = varSplit;

    templateStack.push(node);

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
 * @returns {TemplateInternal}
 */
function processElement(element, templateStack) {
  if (element instanceof RegExp) {
    return processRegExp(element, templateStack);
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
     * Set with all the parent nodes
     * @type {Set<TemplateNode>}
     */
    this._parents = null;

    /**
     * Maps of children to they positions
     * in this node's body.
     * @type {ChildrenIndexMap}
     */
    this._children = new Map();

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

        // init Set if necessary for element in
        // this node's children map.
        let childMap = this._children.get(element);
        if (!childMap) {
          childMap = new Set();
          this._children.set(element, childMap);
        }

        childMap.add(this._body.length);
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
   * Propagates the vars of the node
   * to all the nodes above.
   */
  propagateVars() {
    // stop if is the root node
    if (!this._parents) return;

    for (const parent of this._parents) {
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

        // the parent var positions are the ones there before
        // plus the positions of the child node propagating
        parent._children.get(this).forEach(index => {
          parent._vars[varName].add(index);
        });
      }

      if (shouldPropagate) {
        parent.propagateVars();
      }
    }
  }


  /**
   * Replaces the variable with the varValue given
   * for the current node and all its subnodes.
   * When replaced, the variable will be removed
   * from the current node and in its subnodes.
   *
   * @param {*} varName name of the variable to replace
   * @param {*} varValue value to replace in the variable
   * @param {Map<TemplateNode, Set<number>>} varIndexes
   * indexes of the leaves of the variable
   * @see RegExpTemplate.prototype.applyVars
   */
  replaceVar(varName, varValue, varIndexes) {

    this._vars[">" + varName].forEach(index => {
      const element = this._body[index];
      if (element instanceof TemplateNode) {
        element.replaceVar(varName, varValue, varIndexes);
      } else {
        this._body[index] = varValue;
      }
    });

    delete this._vars[">" + varName];
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
      const element = processElement(rawElement, this._templateStack);

      rootNode.add(element);

      // if the new element is a new node
      if (element instanceof TemplateNode) {
        element._parents = new Set();
        element._parents.add(rootNode);

        element.mapVariables();

        element.propagateVars();
      }
    }

  }

  /**
   * Replace the key variables in template,
   * with the values passed.
   * @param {*} vars variables to replace
   * @returns {RegExpTemplate} returns the template it self for chaining.
   */
  applyVars(vars) {
    {
      for (const varName of Object.getOwnPropertyNames(vars)) {

        // process var value
        const varValue = processElement(vars[varName], this._templateStack);

        /**
         * @type {Map<TemplateNode, Set<number>>}
         */
        const varIndexes = new Map();

        // replace var with the processed value
        this._templateStack[0].replaceVar(varName, varValue, varIndexes);

      }
    }

    return this;
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
