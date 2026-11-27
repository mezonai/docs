const path = require("path");
const Module = require("module");

const lunrViFixPath = path.resolve(__dirname, "lunrViFold.js");
const searchTokenizePath = path.resolve(__dirname, "searchTokenize.js");

let patched = false;
function installNodeResolveHook() {
  if (patched) return;
  patched = true;
  const origResolve = Module._resolveFilename;
  Module._resolveFilename = function (
    request: string,
    parent: unknown,
    isMain: boolean,
    options: unknown
  ) {
    if (
      request === "lunr-languages/lunr.vi" ||
      request.endsWith("/lunr-languages/lunr.vi") ||
      request.endsWith("\\lunr-languages\\lunr.vi")
    ) {
      return lunrViFixPath;
    }
    return origResolve.call(this, request, parent, isMain, options);
  };
}

installNodeResolveHook();

/**
 * Wires plugins/lunrViFold.js and plugins/searchTokenize.js into both the
 * server-side index builder (via Node Module._resolveFilename) and the
 * browser/worker bundle (via webpack resolve.alias) without patching node_modules.
 */
module.exports = function vietnameseSearchPlugin() {
  installNodeResolveHook();

  let upstreamTokenizePath: string | null = null;
  try {
    upstreamTokenizePath = require.resolve(
      "@easyops-cn/docusaurus-search-local/dist/client/client/utils/tokenize"
    );
  } catch {
    // Ignore when plugin path differs.
  }

  return {
    name: "mezon-vietnamese-search",
    configureWebpack() {
      const alias: Record<string, string> = {
        "lunr-languages/lunr.vi": lunrViFixPath,
      };
      if (upstreamTokenizePath) {
        alias[upstreamTokenizePath] = searchTokenizePath;
      }
      return {
        resolve: {
          alias,
        },
      };
    },
  };
};
