export function TextLines({ lines }: { lines: string[] }) {
  return lines.map((line, index) => <span className="d-block" key={index}>{line}</span>);
}
