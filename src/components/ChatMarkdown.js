"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

const LANGUAGE_ALIASES = {
  js: "javascript", jsx: "javascript", ts: "javascript", tsx: "javascript",
  py: "python", sh: "bash", shell: "bash", yml: "yaml",
};

const LINE_COMMENT = {
  python: "#", bash: "#", yaml: "#", ruby: "#", sql: "--",
};

const KEYWORDS = {
  javascript: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "switch", "case", "break", "continue", "class", "extends", "new", "import", "from", "export", "default", "async", "await", "try", "catch", "finally", "throw", "typeof", "instanceof", "this", "super", "null", "undefined", "true", "false", "of", "in", "static", "get", "set"],
  python: ["def", "return", "if", "elif", "else", "for", "while", "class", "import", "from", "as", "try", "except", "finally", "raise", "with", "lambda", "yield", "pass", "break", "continue", "global", "nonlocal", "True", "False", "None", "and", "or", "not", "in", "is", "async", "await", "self"],
  bash: ["if", "then", "else", "fi", "for", "do", "done", "while", "function", "echo", "export", "return", "local", "case", "esac"],
  sql: ["SELECT", "FROM", "WHERE", "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "ON", "GROUP", "BY", "ORDER", "HAVING", "AND", "OR", "NOT", "NULL", "AS", "CREATE", "TABLE", "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "LIMIT"],
  json: [],
  default: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "class", "import", "export", "def", "true", "false", "null", "None", "True", "False"],
};

function resolveLanguage(language) {
  const lang = (language || "").toLowerCase().trim();
  return LANGUAGE_ALIASES[lang] || lang || "default";
}

function highlightCode(code, language) {
  const lang = resolveLanguage(language);
  const lineComment = LINE_COMMENT[lang] || "//";
  const keywordList = KEYWORDS[lang] || KEYWORDS.default;
  const escapedComment = lineComment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const pattern = new RegExp(
    [
      `(${escapedComment}.*)`,
      `(\\/\\*[\\s\\S]*?\\*\\/)`,
      `("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'|\`(?:[^\`\\\\]|\\\\.)*\`)`,
      `(\\b\\d+\\.?\\d*\\b)`,
      keywordList.length ? `(\\b(?:${keywordList.join("|")})\\b)` : "(?!)",
      `([a-zA-Z_$][\\w$]*)(?=\\()`,
    ].join("|"),
    "gm"
  );

  const nodes = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = pattern.exec(code))) {
    if (match.index > lastIndex) nodes.push(code.slice(lastIndex, match.index));
    const [, comment, blockComment, string, number, keyword, fn] = match;
    if (comment !== undefined || blockComment !== undefined) {
      nodes.push(<span key={key++} className="text-zinc-500 italic">{comment ?? blockComment}</span>);
    } else if (string !== undefined) {
      nodes.push(<span key={key++} className="text-emerald-400">{string}</span>);
    } else if (number !== undefined) {
      nodes.push(<span key={key++} className="text-amber-300">{number}</span>);
    } else if (keyword !== undefined) {
      nodes.push(<span key={key++} className="text-fuchsia-400 font-semibold">{keyword}</span>);
    } else if (fn !== undefined) {
      nodes.push(<span key={key++} className="text-sky-400">{fn}</span>);
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < code.length) nodes.push(code.slice(lastIndex));
  return nodes;
}

function CodeBlock({ code, language, onCopyError }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      onCopyError?.("Clipboard access blocked by browser.");
    }
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-[0_4px_24px_rgba(0,0,0,0.4)] max-w-full group/code transition-all duration-300 hover:border-zinc-700/80">
      <div className="bg-zinc-900/90 px-4 py-2 flex justify-between items-center border-b border-zinc-800/80 text-zinc-400">
        <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-orange-500/90 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-glowPulse" />
          {language || "source_code"}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 text-[11px] font-mono hover:text-zinc-100 transition-all py-1 px-2 rounded-lg bg-zinc-800/60 border border-zinc-700/30 hover:border-zinc-600/50 active:scale-95"
        >
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          <span>{copied ? "COPIED" : "COPY"}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-zinc-100 font-mono text-[11px] sm:text-xs leading-relaxed custom-scrollbar selection:bg-orange-500/30">
        <code className="block">{highlightCode(code, language)}</code>
      </pre>
    </div>
  );
}

function parseInline(text, keyPrefix) {
  const nodes = [];
  const regex = /`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    if (match[1] !== undefined) {
      nodes.push(
        <code key={`${keyPrefix}-${key++}`} className="px-1.5 py-0.5 rounded-md bg-zinc-800/70 border border-zinc-700/40 text-orange-300 font-mono text-[0.9em]">
          {match[1]}
        </code>
      );
    } else if (match[2] !== undefined || match[3] !== undefined) {
      nodes.push(
        <strong key={`${keyPrefix}-${key++}`} className="font-bold text-zinc-50">
          {match[2] ?? match[3]}
        </strong>
      );
    } else if (match[4] !== undefined || match[5] !== undefined) {
      nodes.push(
        <em key={`${keyPrefix}-${key++}`} className="italic text-zinc-300">
          {match[4] ?? match[5]}
        </em>
      );
    } else if (match[6] !== undefined) {
      nodes.push(
        <a
          key={`${keyPrefix}-${key++}`}
          href={match[7]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-400 underline decoration-orange-500/40 underline-offset-2 hover:text-orange-300 transition-colors"
        >
          {match[6]}
        </a>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function renderTextBlock(text, keyPrefix) {
  const lines = text.split("\n");
  const blocks = [];
  let currentList = null;

  const flushList = () => {
    if (!currentList) return;
    const Tag = currentList.ordered ? "ol" : "ul";
    blocks.push(
      <Tag key={`${keyPrefix}-list-${blocks.length}`} className={currentList.ordered ? "list-decimal pl-5 space-y-0.5 my-1.5" : "list-disc pl-5 space-y-0.5 my-1.5"}>
        {currentList.items.map((item, i) => (
          <li key={i}>{parseInline(item, `${keyPrefix}-li-${blocks.length}-${i}`)}</li>
        ))}
      </Tag>
    );
    currentList = null;
  };

  lines.forEach((line, idx) => {
    const bulletMatch = line.match(/^\s*[-*]\s+(.*)$/);
    const numberedMatch = line.match(/^\s*\d+\.\s+(.*)$/);

    if (bulletMatch) {
      if (!currentList || currentList.ordered) { flushList(); currentList = { ordered: false, items: [] }; }
      currentList.items.push(bulletMatch[1]);
    } else if (numberedMatch) {
      if (!currentList || !currentList.ordered) { flushList(); currentList = { ordered: true, items: [] }; }
      currentList.items.push(numberedMatch[1]);
    } else {
      flushList();
      if (line.trim() === "" ) {
        blocks.push(<div key={`${keyPrefix}-br-${idx}`} className="h-2" />);
      } else {
        blocks.push(
          <span key={`${keyPrefix}-line-${idx}`} className="block whitespace-pre-wrap">
            {parseInline(line, `${keyPrefix}-t-${idx}`)}
          </span>
        );
      }
    }
  });
  flushList();
  return blocks;
}

export default function ChatMarkdown({ text, onCopyError }) {
  if (!text) return null;
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith("```") && part.endsWith("```")) {
      const match = part.match(/```(\w*)\n?([\s\S]*?)```/);
      const language = match ? match[1] : "";
      const codeContent = match ? match[2] : part.slice(3, -3);
      return <CodeBlock key={index} code={codeContent.trim()} language={language} onCopyError={onCopyError} />;
    }
    return <span key={index}>{renderTextBlock(part, `b${index}`)}</span>;
  });
}
