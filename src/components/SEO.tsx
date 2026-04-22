import * as React from "react";
import { Helmet } from "react-helmet-async";

interface Props {
  title: string;
  description?: string;
  canonical?: string;
}

const HelmetComponent = Helmet as unknown as React.ComponentType<React.PropsWithChildren>;

const SEO = ({ title, description, canonical }: Props) => (
  <HelmetComponent>
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
    {canonical && <link rel="canonical" href={canonical} />}
    <meta property="og:title" content={title} />
    {description && <meta property="og:description" content={description} />}
  </HelmetComponent>
);

export default SEO;
