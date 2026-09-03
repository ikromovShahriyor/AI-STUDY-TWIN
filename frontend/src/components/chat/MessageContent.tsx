"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface MessageContentProps {
  content: string;
  isStreaming?: boolean;
}

export const MessageContent: React.FC<MessageContentProps> = ({ content, isStreaming }) => {
  if (!content) return null;

  const blocks = parseBlocks(content);

  return (
    <div className="message-content-wrapper" style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "heading": {
            const fontSizes: Record<number, string> = {
              1: "18px",
              2: "16px",
              3: "15px",
              4: "14px"
            };
            const size = fontSizes[block.level || 3] || "15px";
            return (
              <div
                key={idx}
                style={{
                  fontSize: size,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginTop: idx > 0 ? "8px" : "0px",
                  marginBottom: "2px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "4px",
                    height: "16px",
                    borderRadius: "2px",
                    background: "var(--gradient-brand)"
                  }}
                />
                <span>{renderInline(block.content)}</span>
              </div>
            );
          }

          case "divider":
            return (
              <hr
                key={idx}
                style={{
                  border: "none",
                  borderTop: "1px solid var(--border-glass)",
                  margin: "8px 0"
                }}
              />
            );

          case "list":
            return (
              <ul
                key={idx}
                style={{
                  margin: "4px 0",
                  paddingLeft: "4px",
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px"
                }}
              >
                {block.items?.map((item, itemIdx) => (
                  <li
                    key={itemIdx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      lineHeight: 1.6
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: "var(--accent-cyan)",
                        marginTop: "8px",
                        flexShrink: 0
                      }}
                    />
                    <div style={{ flex: 1 }}>{renderInline(item)}</div>
                  </li>
                ))}
              </ul>
            );

          case "numbered-list":
            return (
              <ol
                key={idx}
                style={{
                  margin: "4px 0",
                  paddingLeft: "4px",
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px"
                }}
              >
                {block.items?.map((item, itemIdx) => (
                  <li
                    key={itemIdx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      lineHeight: 1.6
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: "20px",
                        height: "20px",
                        borderRadius: "6px",
                        background: "rgba(139, 92, 246, 0.2)",
                        color: "var(--accent-purple)",
                        fontSize: "11px",
                        fontWeight: 700,
                        marginTop: "2px",
                        flexShrink: 0
                      }}
                    >
                      {itemIdx + 1}
                    </span>
                    <div style={{ flex: 1 }}>{renderInline(item)}</div>
                  </li>
                ))}
              </ol>
            );

          case "code":
            return <CodeBlockView key={idx} code={block.content} language={block.language} />;

          case "quote":
            return (
              <blockquote
                key={idx}
                style={{
                  margin: "6px 0",
                  padding: "8px 12px",
                  borderLeft: "3px solid var(--accent-purple)",
                  background: "rgba(139, 92, 246, 0.08)",
                  borderRadius: "0 8px 8px 0",
                  fontStyle: "italic",
                  color: "var(--text-secondary)"
                }}
              >
                {renderInline(block.content)}
              </blockquote>
            );

          case "paragraph":
          default:
            return (
              <p
                key={idx}
                style={{
                  margin: 0,
                  lineHeight: 1.65,
                  wordBreak: "break-word"
                }}
              >
                {renderInline(block.content)}
              </p>
            );
        }
      })}

      {isStreaming && (
        <span
          style={{
            display: "inline-block",
            width: "8px",
            height: "14px",
            backgroundColor: "var(--accent-purple)",
            marginLeft: "4px",
            verticalAlign: "middle"
          }}
          className="animate-pulse"
        />
      )}
    </div>
  );
};

// Code Block with Copy button
const CodeBlockView: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        margin: "8px 0",
        borderRadius: "var(--radius-sm)",
        overflow: "hidden",
        border: "1px solid var(--border-glass)",
        background: "#080c16"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 12px",
          background: "rgba(255, 255, 255, 0.03)",
          borderBottom: "1px solid var(--border-glass)",
          fontSize: "11px",
          color: "var(--text-muted)",
          fontFamily: "var(--font-code)"
        }}
      >
        <span>{language || "code"}</span>
        <button
          onClick={handleCopy}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            background: "transparent",
            border: "none",
            color: copied ? "var(--accent-emerald)" : "var(--text-secondary)",
            cursor: "pointer",
            fontSize: "11px"
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>{copied ? "Nusxalandi!" : "Nusxa olish"}</span>
        </button>
      </div>
      <pre
        style={{
          padding: "12px",
          margin: 0,
          overflowX: "auto",
          fontFamily: "var(--font-code)",
          fontSize: "13px",
          lineHeight: 1.5,
          color: "#e2e8f0"
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Block Parser
interface Block {
  type: "paragraph" | "heading" | "list" | "numbered-list" | "code" | "divider" | "quote";
  content: string;
  level?: number;
  items?: string[];
  language?: string;
}

function parseBlocks(rawText: string): Block[] {
  const blocks: Block[] = [];
  const lines = rawText.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code blocks
    if (line.trim().startsWith("```")) {
      const language = line.trim().replace(/^```/, "").trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // Skip closing ```
      blocks.push({
        type: "code",
        content: codeLines.join("\n"),
        language
      });
      continue;
    }

    const trimmed = line.trim();

    // Empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // Dividers: ---, ***, ___
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: "divider", content: "" });
      i++;
      continue;
    }

    // Headings: #, ##, ###, ####
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        content: headingMatch[2]
      });
      i++;
      continue;
    }

    // Blockquote: >
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({
        type: "quote",
        content: quoteLines.join(" ")
      });
      continue;
    }

    // Numbered list: 1. or 1)
    if (/^\d+[\.\)]\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length) {
        const itemLine = lines[i].trim();
        const itemMatch = itemLine.match(/^\d+[\.\)]\s+(.+)$/);
        if (itemMatch) {
          listItems.push(itemMatch[1]);
          i++;
        } else if (itemLine === "") {
          // Empty line might break list or continue
          if (i + 1 < lines.length && /^\d+[\.\)]\s+/.test(lines[i + 1].trim())) {
            i++;
          } else {
            break;
          }
        } else {
          break;
        }
      }
      blocks.push({
        type: "numbered-list",
        content: "",
        items: listItems
      });
      continue;
    }

    // Bullet list: *, -, +, •
    if (/^[\*\-\+•]\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length) {
        const itemLine = lines[i].trim();
        const itemMatch = itemLine.match(/^[\*\-\+•]\s+(.+)$/);
        if (itemMatch) {
          listItems.push(itemMatch[1]);
          i++;
        } else if (itemLine === "") {
          if (i + 1 < lines.length && /^[\*\-\+•]\s+/.test(lines[i + 1].trim())) {
            i++;
          } else {
            break;
          }
        } else {
          break;
        }
      }
      blocks.push({
        type: "list",
        content: "",
        items: listItems
      });
      continue;
    }

    // Normal Paragraph (accumulate consecutive lines that aren't other elements)
    const pLines: string[] = [trimmed];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith(">") &&
      !/^(\-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim()) &&
      !/^\d+[\.\)]\s+/.test(lines[i].trim()) &&
      !/^[\*\-\+•]\s+/.test(lines[i].trim())
    ) {
      pLines.push(lines[i].trim());
      i++;
    }

    blocks.push({
      type: "paragraph",
      content: pLines.join(" ")
    });
  }

  return blocks;
}

// Inline renderer: Bold (** or __), Italic (* or _), Inline Code (`...`), Links [text](url)
function renderInline(text: string): React.ReactNode {
  if (!text) return null;

  // Regex tokens:
  // 1: `code`
  // 2: **bold**
  // 3: *italic*
  // 4: [label](url)
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|(?<!\*)\*[^*]+\*(?!\*)|(?<!_)_[^_]+_(?!_)|\[([^\]]+)\]\(([^)]+)\))/g;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  let keyCounter = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];

    if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code
          key={`code-${keyCounter++}`}
          style={{
            background: "rgba(139, 92, 246, 0.15)",
            border: "1px solid rgba(139, 92, 246, 0.25)",
            color: "var(--accent-cyan)",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "12px",
            fontFamily: "var(--font-code)"
          }}
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong
          key={`bold-${keyCounter++}`}
          style={{
            fontWeight: 700,
            color: "#ffffff"
          }}
        >
          {renderInline(token.slice(2, -2))}
        </strong>
      );
    } else if (token.startsWith("__") && token.endsWith("__")) {
      nodes.push(
        <strong
          key={`bold-${keyCounter++}`}
          style={{
            fontWeight: 700,
            color: "#ffffff"
          }}
        >
          {renderInline(token.slice(2, -2))}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodes.push(
        <em
          key={`italic-${keyCounter++}`}
          style={{
            fontStyle: "italic",
            color: "var(--text-primary)"
          }}
        >
          {renderInline(token.slice(1, -1))}
        </em>
      );
    } else if (token.startsWith("_") && token.endsWith("_")) {
      nodes.push(
        <em
          key={`italic-${keyCounter++}`}
          style={{
            fontStyle: "italic",
            color: "var(--text-primary)"
          }}
        >
          {renderInline(token.slice(1, -1))}
        </em>
      );
    } else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        nodes.push(
          <a
            key={`link-${keyCounter++}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--accent-cyan)",
              textDecoration: "underline",
              textUnderlineOffset: "3px"
            }}
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        nodes.push(token);
      }
    } else {
      nodes.push(token);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.substring(lastIndex));
  }

  return <>{nodes}</>;
}
