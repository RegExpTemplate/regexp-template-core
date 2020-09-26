
function assertEquals(a,b) {
  if (a !== b) {
    console.error(a, "!==", b);
    console.trace();
  }
}

// test "splitVars"
{
  // no vars
  var a = "no vars here [a-z]+ \\V{ 404 }";
  var s = splitVars(a);
  assertEquals(s.length, 1);
  assertEquals(s[0], a);


  // one var split
  var a = "\\V { a }";
  var s = splitVars(a);
  assertEquals(s.length, 3);
  assertEquals(s[0], "");
  assertEquals(s[1], "a");
  assertEquals(s[2], "");


  // two var split
  var a = "before\\V   {    a    } \\V{ b }after";
  var s = splitVars(a);
  assertEquals(s.length, 5);
  assertEquals(s[0], "before");
  assertEquals(s[1], "a");
  assertEquals(s[2], " ");
  assertEquals(s[3], "b");
  assertEquals(s[4], "after");


  // assertEquals();
}

// test "getRegExpPattern"
{
  assertEquals("\\+", getRegExpPattern(/\+/));
  assertEquals("\\\\+", getRegExpPattern(/\\+/));
  assertEquals("a+b", getRegExpPattern(/a+b/));

  assertEquals("\\?", getRegExpPattern(/\?/));

  assertEquals("x(?=y)", getRegExpPattern(/x(?=y)/));
  assertEquals("x(?!y)", getRegExpPattern(/x(?!y)/));
  assertEquals("(?<=y)x", getRegExpPattern(/(?<=y)x/));
  assertEquals("(?<!y)x", getRegExpPattern(/(?<!y)x/));

  assertEquals("[b-df-hj-np-tv-zB-DF-HJ-NP-TV-Z]", getRegExpPattern(/[b-df-hj-np-tv-zB-DF-HJ-NP-TV-Z]/));


  assertEquals("\\/", getRegExpPattern(/\//));

  assertEquals("\\\\", getRegExpPattern(/\\/));
}

