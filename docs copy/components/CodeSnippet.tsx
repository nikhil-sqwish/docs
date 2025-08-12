import React, { useState } from 'react';

interface CodeSnippetProps {
  code: string;
}

const CodeSnippet: React.FC<CodeSnippetProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const keywordPattern = /\b(const|let|var|function|return|import|from|interface|type|class|extends|public|private|protected|implements|new|try|catch|finally|throw|if|else|for|while|do|switch|case|break|continue|default|async|await)\b/g;
  const masterPattern = /("([^"]*)"|'([^']*)'|`([^`]*)`)|([^"`']+)/g;

  const highlightLine = (line: string, i: number) => {
    if (line === '') {
      return <div key={i} className="whitespace-pre">&nbsp;</div>;
    }

    const trimmed = line.trim();

    // Comment lines
    if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
      return (
        <div key={i} className="text-[#5c6370] whitespace-pre-wrap">
          {line}
        </div>
      );
    }

    const matches = Array.from(line.matchAll(masterPattern));
    const result: React.ReactNode[] = [];

    for (let m = 0; m < matches.length; m++) {
      const match = matches[m];
      const [full] = match;
      const isString = match[1] !== undefined;

      if (isString) {
        // Strings
        result.push(
          <span key={`${i}-string-${m}`} style={{ color: '#d19a66' }}>
            {full}
          </span>
        );
      } else {
        let lastIndex = 0;
        let keywordMatch;
        keywordPattern.lastIndex = 0;
        const parts: React.ReactNode[] = [];

        while ((keywordMatch = keywordPattern.exec(full)) !== null) {
          const keyword = keywordMatch[0];
          if (keywordMatch.index > lastIndex) {
            parts.push(full.slice(lastIndex, keywordMatch.index));
          }
          parts.push(
            <span key={`${i}-kw-${keywordMatch.index}`} style={{ color: '#61afef', fontWeight: 'bold' }}>
              {keyword}
            </span>
          );
          lastIndex = keywordMatch.index + keyword.length;
        }

        if (lastIndex < full.length) {
          parts.push(full.slice(lastIndex));
        }

        result.push(...parts);
      }
    }

    return (
      <div key={i} className="whitespace-pre-wrap">
        {result}
      </div>
    );
  };

  const highlightedCode = code.split('\n').map((line, i) => highlightLine(line, i));

  return (
    <div className="relative max-w-[700px] text-white overflow-x-auto bg-[#353941] p-4 rounded-lg mt-4 shadow-md">
      <button
        onClick={handleCopy}
        className="hover:bg-[#3e4451] absolute top-2 right-2 px-2 py-2 rounded"
        title="Copy code"
      >
        {copied ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="white" viewBox="0 0 24 24">
            <path d="M9 16.2l-3.5-3.5L4 14l5 5 12-12-1.5-1.5L9 16.2z"></path>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="white" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              d="M7 5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-2v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h2V5Zm2 2h5a3 3 0 0 1 3 3v5h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1v2ZM5 9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H5Z"
              clipRule="evenodd"
            ></path>
          </svg>
        )}
      </button>

      <pre className="font-mono text-sm mt-2 overflow-x-auto">
        <code>{highlightedCode}</code>
      </pre>
    </div>
  );
};

export default CodeSnippet;