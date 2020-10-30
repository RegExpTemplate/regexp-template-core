/*
 * Example of a url matching
 *
 * note: This is just for demonstration and
 * might not be ready to be used.
 *
 * Authors: André Jesus Brito
 */


// all supported protocols
const protocols = /(https|http|file|ws)/;

// regular expression to match all valid domains
const domainRegExp = /(([a-zA-Z0-9.])+)/;

// regular expression to match the path
const pathRegExp = /(\/([a-zA-Z0-9./])+)/;

// the query regular expression template
const queryTemplate = new RegExpTemplate(
  // required question mark
  '?',

  // first param (required)
  /(\V{ param })/,

  // more params (optional)
  /(&(\V{ param }))*/,

).applyVars({
  param: /[a-zA-Z0-9%]+=[a-zA-Z0-9%]+/,
});



// complete url expression template
const urlTemplate = new RegExpTemplate(
  // force start
  /^/,

  // protocol part (optional) regular expression via applyVars
  /(\V{ protocolSection }\:\/\/)?/,

  // domain part (required) as a regular expression
  domainRegExp,

  // path part (optional) as other regular expression
  /(\V{ pathRegExp })?/,

  // query part (optional) as a subtemplate via applyVars
  /(\V{ queryTemplate })?/,

  // force end
  /$/
).applyVars({
  protocolSection: protocols,
  pathRegExp: pathRegExp,
  queryTemplate: queryTemplate,
});

// the complete url regular expression ready to be used
const urlRegExp = urlTemplate.compile();
// outputs: /((https|http|file|ws)\:\/\/)?(([a-zA-Z0-9.])+)(\/([a-zA-Z0-9./])+)(\?([a-zA-Z0-9%]+=[a-zA-Z0-9%]+)(&([a-zA-Z0-9%]+=[a-zA-Z0-9%]+))*)?/


// match all
urlRegExp.exec('www.google.com');
urlRegExp.exec('https://www.google.com/saved');

// does not match
urlRegExp.exec('ws://');
urlRegExp.exec('?only=path');
