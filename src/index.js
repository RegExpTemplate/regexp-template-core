"use strict";

/**
 * @typedef {string|RegExp|RegExpTemplate} TemplateElement
 */

/**
 * @typedef {TemplateElement|TemplateNode} TemplateInternal
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

  }

  /**
   * Adds elements or nodes to the node's body.
   * @param {...TemplateInternal} elements
   */
  add() {
    this._body.push(...arguments);
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


    for (const element of elements) {
      const processedElement = processElement(element, this._templateStack, [0]);

      rootNode.add(processedElement);
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
