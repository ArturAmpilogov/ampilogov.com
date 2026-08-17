/* eslint-disable @next/next/no-img-element */
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { resolveDocumentUrl } from "@/lib/docs";

export function MarkdownArticle({ content, sourcePath }: { content: string; sourcePath: string }) {
  const components: Components = {
    a: ({ href, children, ...props }) => {
      const resolvedHref = resolveDocumentUrl(sourcePath, href);
      const external = resolvedHref?.startsWith("http");
      return (
        <a
          {...props}
          href={resolvedHref}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
        >
          {children}
        </a>
      );
    },
    img: ({ src, alt, ...props }) => (
      <figure className="article-figure">
        <img
          {...props}
          src={typeof src === "string" ? resolveDocumentUrl(sourcePath, src) : undefined}
          alt={alt ?? "Фотокопия документа"}
        />
        {alt ? <figcaption>{alt}</figcaption> : null}
      </figure>
    ),
  };

  return (
    <div className="markdown-body">
      <ReactMarkdown components={components} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
