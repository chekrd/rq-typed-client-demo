import { ContentType, ContentTypes } from './contentType.model.ts';

const allContentTypes: Readonly<Array<ContentType>> = [
  {
    id: 'ct-001',
    name: 'Article',
    codename: 'article',
    lastModified: '2025-01-15T10:30:00Z',
  },
  {
    id: 'ct-002',
    name: 'Author',
    codename: 'author',
    lastModified: '2025-01-14T15:20:00Z',
  },
  {
    id: 'ct-003',
    name: 'Product',
    codename: 'product',
    lastModified: '2025-01-13T09:45:00Z',
  },
  {
    id: 'ct-004',
    name: 'Category',
    codename: 'category',
    lastModified: '2025-01-12T14:10:00Z',
  },
];

const mockContentTypesByCodename: Record<string, ContentType> = {
  article: {
    id: 'ct-001',
    name: 'Article',
    codename: 'article',
    lastModified: '2025-01-15T10:30:00Z',
  },
  author: {
    id: 'ct-002',
    name: 'Author',
    codename: 'author',
    lastModified: '2025-01-14T15:20:00Z',
  },
  product: {
    id: 'ct-003',
    name: 'Product',
    codename: 'product',
    lastModified: '2025-01-13T09:45:00Z',
  },
};

export const mock = {
  fetchContentTypes: (
    projectId: string,
    filter?: Record<string, string>,
  ): Promise<ContentTypes> => {
    // In a real implementation, this would fetch content types for the specific project
    console.log(`Fetching content types for project: ${projectId}`);

    let filteredTypes = allContentTypes;

    if (filter?.name) {
      filteredTypes = allContentTypes.filter((ct) =>
        ct.name.toLowerCase().includes(filter.name.toLowerCase()),
      );
    }

    return Promise.resolve({
      data: filteredTypes,
      pagination: {
        count: filteredTypes.length,
        nextPage: null,
      },
    });
  },

  fetchContentType: (
    projectId: string,
    contentTypeId: string,
  ): Promise<ContentType> => {
    // In a real implementation, this would fetch content type for the specific project
    console.log(`Fetching content type ${contentTypeId} for project: ${projectId}`);

    const contentType = mockContentTypesByCodename[contentTypeId];
    if (!contentType) {
      return Promise.reject(
        new Error(`Content type with ID '${contentTypeId}' not found`),
      );
    }

    return Promise.resolve(contentType);
  },

  updateContentType: (contentType: ContentType): Promise<ContentType> => {
    return Promise.resolve({
      ...contentType,
      lastModified: new Date().toISOString(),
    });
  },
};
