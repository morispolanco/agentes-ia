
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const lines = content.split('\n');

  const renderLine = (line: string, index: number) => {
    if (line.startsWith('###')) {
      return <h3 key={index} className="text-xl font-semibold mt-4 mb-2 text-cyan-400">{line.replace('###', '').trim()}</h3>;
    }
    if (line.startsWith('##')) {
      return <h2 key={index} className="text-2xl font-bold mt-6 mb-3 border-b border-slate-600 pb-2 text-cyan-300">{line.replace('##', '').trim()}</h2>;
    }
    if (line.startsWith('#')) {
      return <h1 key={index} className="text-3xl font-extrabold mt-4 mb-4 text-white">{line.replace('#', '').trim()}</h1>;
    }
    if (line.startsWith('* ')) {
      return <li key={index} className="ml-6 list-disc text-slate-300">{line.replace('* ', '').trim()}</li>;
    }
    if (line.trim() === '---') {
        return <hr key={index} className="my-6 border-slate-700" />;
    }

    const formatBold = (text: string) => {
        return text.split('**').map((part, i) =>
            i % 2 === 1 ? <strong key={i} className="font-bold text-slate-100">{part}</strong> : part
        );
    };

    return <p key={index} className="my-2 text-slate-300 leading-relaxed">{formatBold(line)}</p>;
  };
  
  return (
    <div className="prose prose-invert max-w-none">
      {lines.map(renderLine)}
    </div>
  );
};

export default MarkdownRenderer;
