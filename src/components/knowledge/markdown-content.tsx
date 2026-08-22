import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export function MarkdownContent({ content, className }: { content: string; className?: string }) {
  if (!content.trim()) {
    return <p className="text-sm text-muted-foreground">Sem conteúdo ainda.</p>;
  }

  return (
    <div
      className={cn(
        "prose prose-sm prose-invert max-w-none",
        "prose-headings:font-semibold prose-headings:text-foreground",
        "prose-p:text-foreground/90 prose-li:text-foreground/90 prose-strong:text-foreground",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        "prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-xs prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:rounded-md prose-pre:border prose-pre:border-border prose-pre:bg-muted/40",
        "prose-blockquote:border-l-primary/40 prose-blockquote:text-muted-foreground",
        "prose-hr:border-border prose-table:text-sm prose-th:text-foreground",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
