import lunr from "lunr";

function foldVietnamese(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D");
}

/**
 * Client-side query tokenizer matching build-time lunrViFold normalization.
 * Folds Vietnamese diacritics and trims punctuation so prefix/wildcard queries
 * ("tao cl", "mezon do", "tạo clan") hit folded index terms reliably.
 */
export function tokenize(text, language) {
  if (language.length === 1 && ["ja", "jp", "th"].includes(language[0])) {
    return lunr[language[0]].tokenizer(text).map((token) => token.toString());
  }

  let input = String(text || "").toLowerCase();
  if (language.includes("vi")) {
    input = foldVietnamese(input);
  }

  let regExpMatchWords = /[^\s\-.,!?;:'"()[\]{}<>/\\|]+/g;
  if (language.includes("zh")) {
    regExpMatchWords = /\w+|\p{Unified_Ideograph}+/gu;
  }

  return input.match(regExpMatchWords) || [];
}
