import { Helmet } from 'react-helmet-async'

interface SchemaDataProps {
  data: Record<string, any>
}

export function SchemaData({ data }: SchemaDataProps) {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(data)}
      </script>
    </Helmet>
  )
}

export default SchemaData
