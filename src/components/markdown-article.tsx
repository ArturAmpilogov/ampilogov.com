/* eslint-disable @next/next/no-img-element */
import { Fragment } from "react";
import type { ReactNode } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { AmphilochosCoinTeaser } from "@/components/amphilochos-coin-teaser";
import { AmphilochosCultEvidence } from "@/components/amphilochos-cult-evidence";
import { AnpilogovoMap } from "@/components/anpilogovo-map";
import { AnpilovkaMap } from "@/components/anpilovka-map";
import { AmphilochiaMap } from "@/components/amphilochia-map";
import { CalendarNameExamples } from "@/components/calendar-name-examples";
import { FamilyMap } from "@/components/family-map";
import { EvidenceRoute } from "@/components/evidence-route";
import { KinshipDiagram } from "@/components/kinship-diagram";
import { KonyaMap } from "@/components/konya-map";
import { KurskOboyanMap } from "@/components/kursk-oboyan-map";
import { MallosMap } from "@/components/mallos-map";
import { OrelEstatesMap } from "@/components/orel-estates-map";
import { OrelEstateTable } from "@/components/orel-estate-table";
import { OrelLinesMap } from "@/components/orel-lines-map";
import { OrelOathPrelude } from "@/components/orel-oath-prelude";
import { OrelServicePrelude } from "@/components/orel-service-prelude";
import { PrilukiMap } from "@/components/priluki-map";
import { PrilukiRecordAnatomy } from "@/components/priluki-record-anatomy";
import { PrilukiScribePrelude } from "@/components/priluki-scribe-prelude";
import { SourceExcerpt } from "@/components/source-excerpt";
import { SurnameVariantsEvidence } from "@/components/surname-variants-evidence";
import { resolveDocumentUrl } from "@/lib/docs";

export function MarkdownArticle({ content, sourcePath }: { content: string; sourcePath: string }) {
  const headingText = (children: ReactNode) =>
    Array.isArray(children) ? children.join("") : String(children ?? "");

  const components: Components = {
    a: ({ href, children, ...props }) => {
      const resolvedHref = resolveDocumentUrl(sourcePath, href);
      const external = resolvedHref?.startsWith("http");
      const sourceReference = resolvedHref?.startsWith("/read/research/sources#s-")
        && /^S-[A-Z0-9-]+$/i.test(headingText(children).trim());
      return (
        <a
          {...props}
          className={sourceReference ? "source-reference" : props.className}
          href={resolvedHref}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
        >
          {children}
        </a>
      );
    },
    p: ({ node, children, ...props }) => {
      const imageNode = node?.children.length === 1
        && node.children[0].type === "element"
        && node.children[0].tagName === "img"
        ? node.children[0]
        : undefined;

      if (imageNode) {
        const src = typeof imageNode.properties.src === "string" ? imageNode.properties.src : undefined;
        const alt = typeof imageNode.properties.alt === "string" ? imageNode.properties.alt : undefined;
        const caption = typeof imageNode.properties.title === "string" ? imageNode.properties.title : alt;
        return (
          <figure className="article-figure">
            <img
              src={src ? resolveDocumentUrl(sourcePath, src) : undefined}
              alt={alt ?? "Фотокопия документа"}
            />
            {caption ? <figcaption>{caption}</figcaption> : null}
          </figure>
        );
      }

      return <p {...props}>{children}</p>;
    },
    img: ({ src, alt, ...props }) => (
      <img
        {...props}
        src={typeof src === "string" ? resolveDocumentUrl(sourcePath, src) : undefined}
        alt={alt ?? "Фотокопия документа"}
      />
    ),
    h2: ({ children, ...props }) => {
      const text = headingText(children);
      const marker = text.match(/\s*\{#([a-z][a-z0-9-]*)\}\s*$/i);
      return (
        <h2 {...props} id={marker?.[1] ?? props.id}>
          {marker ? text.slice(0, marker.index).trimEnd() : children}
        </h2>
      );
    },
    h3: ({ children, ...props }) => {
      const sourceId = headingText(children).match(/^(S-[A-Z0-9-]+)/)?.[1]?.toLowerCase();
      return <h3 {...props} id={sourceId ?? props.id}>{children}</h3>;
    },
  };

  const linkedContent = content.replace(
    /\[(S-[A-Z0-9-]+)\]/g,
    (_, sourceId: string) => `[${sourceId}](/read/research/sources#${sourceId.toLowerCase()})`,
  );
  const sections = linkedContent.split(
    /(\{\{FAMILY_MAP\}\}|\{\{SURNAME_VARIANTS_EVIDENCE\}\}|\{\{ANPILOGOVO_MAP\}\}|\{\{ANPILOVKA_MAP\}\}|\{\{AMPHILOCHIA_MAP\}\}|\{\{KONYA_MAP\}\}|\{\{KURSK_OBOYAN_MAP\}\}|\{\{MALLOS_MAP\}\}|\{\{OREL_ESTATES_MAP\}\}|\{\{OREL_ESTATE_TABLE\}\}|\{\{OREL_LINES_MAP\}\}|\{\{OREL_OATH_PRELUDE\}\}|\{\{OREL_SERVICE_PRELUDE\}\}|\{\{PRILUKI_MAP\}\}|\{\{PRILUKI_RECORD_ANATOMY\}\}|\{\{PRILUKI_SCRIBE_PRELUDE\}\}|\{\{CALENDAR_NAME_EXAMPLES\}\}|\{\{AMPHILOCHOS_CULT_EVIDENCE\}\}|\{\{AMPHILOCHOS_COIN_TEASER\}\}|\{\{KINSHIP:[a-z0-9-]+\}\}|\{\{EVIDENCE_ROUTE:[a-z0-9-]+\}\}|\{\{SOURCE_EXCERPT:[a-z0-9-]+\}\})/g,
  );

  return (
    <div className="markdown-body">
      {sections.map((section, index) => {
        const sourceExcerptId = section.match(/^\{\{SOURCE_EXCERPT:([a-z0-9-]+)\}\}$/)?.[1];
        const kinshipId = section.match(/^\{\{KINSHIP:([a-z0-9-]+)\}\}$/)?.[1];
        const evidenceRouteId = section.match(/^\{\{EVIDENCE_ROUTE:([a-z0-9-]+)\}\}$/)?.[1];
        return (
          <Fragment key={`${sourcePath}-${index}`}>
            {section === "{{FAMILY_MAP}}" ? <FamilyMap /> : null}
            {section === "{{SURNAME_VARIANTS_EVIDENCE}}" ? <SurnameVariantsEvidence /> : null}
            {section === "{{ANPILOGOVO_MAP}}" ? <AnpilogovoMap /> : null}
            {section === "{{ANPILOVKA_MAP}}" ? <AnpilovkaMap /> : null}
            {section === "{{AMPHILOCHIA_MAP}}" ? <AmphilochiaMap /> : null}
            {section === "{{KONYA_MAP}}" ? <KonyaMap /> : null}
            {section === "{{KURSK_OBOYAN_MAP}}" ? <KurskOboyanMap /> : null}
            {section === "{{MALLOS_MAP}}" ? <MallosMap /> : null}
            {section === "{{OREL_ESTATES_MAP}}" ? <OrelEstatesMap /> : null}
            {section === "{{OREL_ESTATE_TABLE}}" ? <OrelEstateTable /> : null}
            {section === "{{OREL_LINES_MAP}}" ? <OrelLinesMap /> : null}
            {section === "{{OREL_OATH_PRELUDE}}" ? <OrelOathPrelude /> : null}
            {section === "{{OREL_SERVICE_PRELUDE}}" ? <OrelServicePrelude /> : null}
            {section === "{{PRILUKI_MAP}}" ? <PrilukiMap /> : null}
            {section === "{{PRILUKI_RECORD_ANATOMY}}" ? <PrilukiRecordAnatomy /> : null}
            {section === "{{PRILUKI_SCRIBE_PRELUDE}}" ? <PrilukiScribePrelude /> : null}
            {section === "{{CALENDAR_NAME_EXAMPLES}}" ? <CalendarNameExamples /> : null}
            {section === "{{AMPHILOCHOS_CULT_EVIDENCE}}" ? <AmphilochosCultEvidence /> : null}
            {section === "{{AMPHILOCHOS_COIN_TEASER}}" ? <AmphilochosCoinTeaser /> : null}
            {kinshipId ? <KinshipDiagram id={kinshipId} /> : null}
            {evidenceRouteId ? <EvidenceRoute id={evidenceRouteId} /> : null}
            {sourceExcerptId ? <SourceExcerpt id={sourceExcerptId} /> : null}
            {!section.startsWith("{{") ? (
              <ReactMarkdown components={components} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
                {section}
              </ReactMarkdown>
            ) : null}
          </Fragment>
        );
      })}
    </div>
  );
}
