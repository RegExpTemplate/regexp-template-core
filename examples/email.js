/*
 * Example of an email matching
 *
 * note: This is just for demonstration and
 * might not be ready to be used.
 *
 * Authors: Gildson Bezerra da Silva
 */


// regular expression to match the username
const usernameRegExp = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+/;

// regular expression to match the server mail domain
const serverDomainRegExp = /[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*/;


// complete email expression template
const emailTemplate = new RegExpTemplate(
  // force start
  /^/,

  // username part as a regular expression
  usernameRegExp,

  // at symbol
  /@/,

  // server mail domain part as a regular expression
  serverDomainRegExp,

  // force end
  /$/
);

// the complete email regular expression ready to be used
const emailRegExp = emailTemplate.compile();
// outputs: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/


// match all
emailRegExp.exec('username@email.com');
emailRegExp.exec('user.name@email.com');
emailRegExp.exec('username@email.me.net');

// does not match
emailRegExp.exec('username.email.com');
emailRegExp.exec('@email.com');
emailRegExp.exec('username@.email.com');
