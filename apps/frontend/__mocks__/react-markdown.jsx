// react-markdownのモック
const ReactMarkdown = ({ children }) => {
  return <div data-testid="markdown-content">{children}</div>;
};

export default ReactMarkdown;
