
function assertEquals(a,b) {
  if (a !== b) {
    console.error(a, "!==", b);
  }
}


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

