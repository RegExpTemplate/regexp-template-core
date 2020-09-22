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

  // remove flags and last slash
  let endIndex = reStr.length;
  while (reStr[--endIndex] !== "/") {}

  // return all except the first slash
  return reStr.substring(1, endIndex);
}


/**
 * !!! internal helper function !!!
 * Process input element to an valid TemplateInternal.
 * @param {*} element
 * @returns {TemplateInternal}
 */
function processElement(element) {
  if (element instanceof RegExp) {
    const regExpElements = getRegExpPattern(element);

    // TEMP will change when vars are introduced
    const varSplit = [regExpElements];

    return varSplit[0];
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
    this._body = [];
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
      const processedElement = processElement(element);

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
