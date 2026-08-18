interface SchemaDataProps {
  data: Record<string, any>
}

/** JSON-LD structured data. Crawlers accept it anywhere in the document, so it renders in place. */
export function SchemaData({ data }: SchemaDataProps) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

export default SchemaData
