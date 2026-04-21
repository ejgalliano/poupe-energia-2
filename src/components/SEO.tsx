import { Helmet } from "react-helmet-async";

interface Props {
  title: string;
  description?: string;
  canonical?: string;
}

const SEO = ({ title, description, canonical }: Props) => (
  <Helmet>
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
    {canonical && <link rel="canonical" href={canonical} />}
    <meta property="og:title" content={title} />
    {description && <meta property="og:description" content={description} />}
  </Helmet>
);

export default SEO;
