declare module '*.mdx' {
  import type { ComponentType } from 'react';

  export const meta: {
    title: string;
    description: string;
    date: string;
    author: string;
    slug: string;
  };

  const MDXComponent: ComponentType;
  export default MDXComponent;
}
