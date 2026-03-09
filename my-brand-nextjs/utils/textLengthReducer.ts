export const TextLengthReducer = ({ text, maxLength }: { text: string; maxLength: number }) => {
  if (!text) return null;

  const isTextLong = text.length > maxLength;
  const displayedText = isTextLong ? text.slice(0, maxLength) + "..." : text;

  return `${displayedText}...`;
};
