import React from 'react';

/**
 * Reusable Formatted Content Renderer Component
 * Parses markdown text strings into rich structured HTML elements
 * supporting headings (#, ##, ###), bold (**text**), bullet points (- / *),
 * numbered lists, blockquotes (>), and clean paragraph spacing.
 */
export function FormattedContentRenderer({ content, className = '' }) {
  if (!content) return null;

  // Helper to parse inline formatting like **bold** text
  const parseInlineFormatting = (text) => {
    if (!text) return '';
    const parts = [];
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const raw = match[0];
      if (raw.startsWith('**') && raw.endsWith('**')) {
        parts.push(
          <strong key={match.index} style={{ color: 'var(--text-main)', fontWeight: 700 }}>
            {raw.slice(2, -2)}
          </strong>
        );
      } else if (raw.startsWith('*') && raw.endsWith('*')) {
        parts.push(
          <em key={match.index} style={{ color: 'var(--text-muted)' }}>
            {raw.slice(1, -1)}
          </em>
        );
      } else if (raw.startsWith('`') && raw.endsWith('`')) {
        parts.push(
          <code 
            key={match.index} 
            style={{ 
              background: 'rgba(99, 102, 241, 0.15)', 
              color: 'var(--primary-indigo)', 
              padding: '2px 6px', 
              borderRadius: '4px', 
              fontSize: '0.9em',
              fontFamily: 'monospace'
            }}
          >
            {raw.slice(1, -1)}
          </code>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Split content into blocks by double newlines or single newlines with headings/lists
  const lines = content.split('\n');
  const blocks = [];
  let currentList = null;

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      return;
    }

    // Bullet list item (- or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemText = trimmed.substring(2);
      if (!currentList) {
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(itemText);
      return;
    }

    // Numbered list item (1. 2. etc)
    if (/^\d+\.\s/.test(trimmed)) {
      const itemText = trimmed.replace(/^\d+\.\s/, '');
      if (!currentList || currentList.type !== 'ol') {
        if (currentList) blocks.push(currentList);
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(itemText);
      return;
    }

    // If we reach a non-list item, push any pending list
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', text: trimmed.substring(4) });
    } else if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', text: trimmed.substring(3) });
    } else if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h1', text: trimmed.substring(2) });
    } else if (trimmed.startsWith('> ')) {
      blocks.push({ type: 'quote', text: trimmed.substring(2) });
    } else {
      blocks.push({ type: 'p', text: trimmed });
    }
  });

  if (currentList) {
    blocks.push(currentList);
  }

  return (
    <div className={`formatted-content ${className}`} style={{ lineHeight: '1.8', fontSize: '1rem' }}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'h1':
            return (
              <h1 
                key={idx} 
                style={{ 
                  fontSize: '1.75rem', 
                  marginTop: '1.5rem', 
                  marginBottom: '0.85rem', 
                  color: 'var(--text-main)', 
                  fontWeight: 800,
                  borderBottom: '2px solid var(--border-indigo)',
                  paddingBottom: '0.4rem'
                }}
              >
                {parseInlineFormatting(block.text)}
              </h1>
            );
          case 'h2':
            return (
              <h2 
                key={idx} 
                style={{ 
                  fontSize: '1.4rem', 
                  marginTop: '1.35rem', 
                  marginBottom: '0.75rem', 
                  color: 'var(--primary-indigo)', 
                  fontWeight: 700 
                }}
              >
                {parseInlineFormatting(block.text)}
              </h2>
            );
          case 'h3':
            return (
              <h3 
                key={idx} 
                style={{ 
                  fontSize: '1.15rem', 
                  marginTop: '1.15rem', 
                  marginBottom: '0.6rem', 
                  color: '#f59e0b', 
                  fontWeight: 700 
                }}
              >
                {parseInlineFormatting(block.text)}
              </h3>
            );
          case 'quote':
            return (
              <blockquote 
                key={idx} 
                style={{ 
                  margin: '1rem 0', 
                  padding: '0.85rem 1.25rem', 
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.08))', 
                  borderLeft: '4px solid var(--primary-indigo)', 
                  borderRadius: '0 8px 8px 0',
                  color: 'var(--text-main)',
                  fontStyle: 'italic'
                }}
              >
                {parseInlineFormatting(block.text)}
              </blockquote>
            );
          case 'ul':
            return (
              <ul key={idx} style={{ paddingLeft: '1.4rem', margin: '0.85rem 0' }}>
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} style={{ marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                    {parseInlineFormatting(item)}
                  </li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={idx} style={{ paddingLeft: '1.4rem', margin: '0.85rem 0' }}>
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} style={{ marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                    {parseInlineFormatting(item)}
                  </li>
                ))}
              </ol>
            );
          case 'p':
          default:
            return (
              <p key={idx} style={{ marginBottom: '0.9rem', color: 'var(--text-main)' }}>
                {parseInlineFormatting(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
