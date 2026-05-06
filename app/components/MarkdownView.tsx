'use client';

interface Props {
  content: string;
  className?: string;
}

export default function MarkdownView({ content, className = '' }: Props) {
  const lines = content.split('\n');

  return (
    <div className={`text-sm text-slate-700 space-y-1.5 ${className}`}>
      {lines.map((line, i) => {
        // Table rows
        if (line.startsWith('|')) {
          const cells = line.split('|').filter((c) => c.trim() !== '');
          const isSep = cells.every((c) => /^[-:\s]+$/.test(c));
          if (isSep) return null;
          return (
            <div key={i} className="flex gap-2 text-xs font-mono border-b border-slate-100 pb-1">
              {cells.map((cell, j) => (
                <span key={j} className="flex-1 min-w-0 truncate" dangerouslySetInnerHTML={{ __html: renderInline(cell.trim()) }} />
              ))}
            </div>
          );
        }
        // H2
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-sm font-bold text-slate-800 mt-3 mb-1" dangerouslySetInnerHTML={{ __html: renderInline(line.slice(3)) }} />;
        }
        // H3
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-xs font-semibold text-slate-700 mt-2 mb-0.5 uppercase tracking-wide" dangerouslySetInnerHTML={{ __html: renderInline(line.slice(4)) }} />;
        }
        // H1
        if (line.startsWith('# ')) {
          return <h1 key={i} className="text-base font-bold text-slate-900 mt-2" dangerouslySetInnerHTML={{ __html: renderInline(line.slice(2)) }} />;
        }
        // Bullet
        if (line.match(/^[-*] /)) {
          return (
            <div key={i} className="flex gap-1.5 items-start">
              <span className="text-blue-400 mt-0.5 shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: renderInline(line.slice(2)) }} />
            </div>
          );
        }
        // Horizontal rule
        if (line.trim() === '---') {
          return <hr key={i} className="border-slate-200 my-2" />;
        }
        // Empty line
        if (line.trim() === '') {
          return <div key={i} className="h-1" />;
        }
        // Normal paragraph
        return <p key={i} dangerouslySetInnerHTML={{ __html: renderInline(line) }} />;
      })}
    </div>
  );
}

function renderInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-slate-100 px-1 rounded text-xs font-mono text-blue-700">$1</code>');
}
