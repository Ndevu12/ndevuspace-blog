// Server-side syntax highlighting for article HTML.
//
// The rich-text editor highlights code blocks only as in-editor decorations —
// serialized content arrives as plain `<pre><code>` (usually without a
// language class). This module rewrites those blocks with highlight.js token
// markup at render time, using the same engine (and therefore the same
// `hljs-*` class vocabulary) as the editor.

import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import cssLang from "highlight.js/lib/languages/css";
import diff from "highlight.js/lib/languages/diff";
import go from "highlight.js/lib/languages/go";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import plaintext from "highlight.js/lib/languages/plaintext";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";

const LANGUAGES = {
  bash,
  css: cssLang,
  diff,
  go,
  java,
  javascript,
  json,
  markdown,
  plaintext,
  python,
  rust,
  sql,
  typescript,
  xml,
  yaml,
} as const;

for (const [name, definition] of Object.entries(LANGUAGES)) {
  hljs.registerLanguage(name, definition);
}

/**
 * Stored blocks rarely carry a language class, so detection runs against
 * this subset — constraining it keeps highlightAuto accurate.
 */
const AUTO_DETECT_LANGUAGES = Object.keys(LANGUAGES);

/** Matches editor-serialized code blocks: <pre><code class="language-x">…</code></pre> */
const CODE_BLOCK_RE =
  /<pre><code(?:\s+class="([^"]*)")?>([\s\S]*?)<\/code><\/pre>/g;

const NAMED_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

function decodeEntities(html: string): string {
  return html
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&#x([\da-fA-F]+);/g, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (entity) => NAMED_ENTITIES[entity]);
}

/**
 * Rewrite every `<pre><code>` block in article HTML with highlight.js token
 * markup, wrapped in a `.code-block` container that carries the resolved
 * language for the CSS chip. Blocks that fail to highlight are left as-is.
 */
export function highlightCodeBlocks(html: string): string {
  if (!html.includes("<pre>")) return html;

  return html.replace(CODE_BLOCK_RE, (block, className, encoded) => {
    try {
      const code = decodeEntities(encoded);
      const declared = /language-([\w-]+)/.exec(className ?? "")?.[1];

      const result =
        declared && hljs.getLanguage(declared)
          ? hljs.highlight(code, { language: declared })
          : hljs.highlightAuto(code, AUTO_DETECT_LANGUAGES);

      const language = result.language ?? "code";
      return (
        `<div class="code-block" data-language="${language}">` +
        `<pre><code class="hljs">${result.value}</code></pre>` +
        `</div>`
      );
    } catch {
      return block;
    }
  });
}
