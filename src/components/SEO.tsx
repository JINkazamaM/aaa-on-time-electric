import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export default function SEO({
  title = 'AAA On Time Electric | Florida Electrical Contractors',
  description = 'Professional electrical contracting across Florida. 100% on-time service, owned equipment, 24/7 emergency response. Licensed & insured Master Electrician.',
  image = 'https://images.unsplash.com/photo-1621905235277-295096181f21?auto=format&fit=crop&q=80&w=1200',
  url = 'https://aaaontimeelectric.com'
}: SEOProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const metaTags = [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: url },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ];

    metaTags.forEach(({ name, property, content }) => {
      const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;

      if (!meta) {
        meta = document.createElement('meta');
        if (name) meta.setAttribute('name', name);
        if (property) meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }

      meta.setAttribute('content', content);
    });
  }, [title, description, image, url]);

  return null;
}
