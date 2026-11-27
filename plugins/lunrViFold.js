/**
 * Enhanced Vietnamese language support for lunr / lunr-languages.
 * Fixes two defects in upstream lunr-languages/lunr.vi.js:
 *   1. wordCharacters omitted NFC precomposed Vietnamese letters (U+00C0..U+1EFF),
 *      leaving trailing punctuation attached to tokens ("clan,", "khoản.").
 *   2. Adds a registered diacritic-folding stemmer ("stemmer-vi") so both
 *      accented ("tạo clan", "Mezon Đồng") and unaccented ("tao clan", "mezon dong")
 *      queries resolve cleanly across build-time indexing and browser search.
 */
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define(factory);
  } else if (typeof exports === "object") {
    module.exports = factory();
  } else {
    factory()(root.lunr);
  }
})(this, function () {
  function foldVietnamese(str) {
    return String(str)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\u0111/g, "d")
      .replace(/\u0110/g, "D");
  }

  return function (lunr) {
    if (typeof lunr === "undefined") {
      throw new Error("Lunr is not present.");
    }
    if (typeof lunr.stemmerSupport === "undefined") {
      throw new Error("Lunr stemmer support is not present.");
    }

    lunr.vi = function () {
      this.pipeline.reset();
      this.pipeline.add(
        lunr.vi.trimmer,
        lunr.vi.stopWordFilter,
        lunr.vi.stemmer
      );
      if (this.searchPipeline) {
        this.searchPipeline.reset();
        this.searchPipeline.add(lunr.vi.stemmer);
      }
    };

    // Unbracketed character ranges so lunr.multiLanguage can concatenate cleanly with \w.
    lunr.vi.wordCharacters =
      "\\u00C0-\\u024F\\u1E00-\\u1EFF\\u0300-\\u036F";

    lunr.vi.trimmer = lunr.trimmerSupport.generateTrimmer(
      "\\w" + lunr.vi.wordCharacters
    );
    lunr.Pipeline.registerFunction(lunr.vi.trimmer, "trimmer-vi");

    lunr.vi.stemmer = function (token) {
      return token.update(function (s) {
        return foldVietnamese(s);
      });
    };
    lunr.Pipeline.registerFunction(lunr.vi.stemmer, "stemmer-vi");

    lunr.vi.stopWordFilter = lunr.generateStopWordFilter(
      "là cái nhưng mà".split(" ")
    );
    lunr.Pipeline.registerFunction(lunr.vi.stopWordFilter, "stopWordFilter-vi");
  };
});
