import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useQueryClient } from '../queries/useQueryClient.ts';
import { getContentType } from '../queries/contentTypes/getContentType.ts';
import { getContentTypes } from '../queries/contentTypes/getContentTypes.ts';
import { languagesQuery } from '../queries/languages/getLanguages.ts';
import { updateContentType } from '../queries/contentTypes/updateContentType.ts';
import { contentTypeKeys } from '../queries/contentTypes/contentTypeKeys.ts';
import styles from './App.module.css';

const PROJECT_ID = 'project-001';

export const App = () => {
  const [selectedContentTypeId, setSelectedContentTypeId] = useState('article');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>React Query Typed Client Demo</h1>
        <p className={styles.subtitle}>
          Demonstrating type-safe imperative query client methods
        </p>
      </header>
      <div className={styles.grid}>
        <ContentTypeSelector
          selectedId={selectedContentTypeId}
          onSelect={setSelectedContentTypeId}
        />
        <ContentTypeDetail contentTypeId={selectedContentTypeId} />
        <TypeSafeCacheAccess contentTypeId={selectedContentTypeId} />
        <LanguagesList />
      </div>
    </div>
  );
};

const ContentTypeSelector = ({ selectedId, onSelect }: { readonly selectedId: string; readonly onSelect: (id: string) => void }) => {
  const { data, isLoading, error } = useQuery(getContentTypes(PROJECT_ID));

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>1. Content Types List</h2>
      {isLoading && <p>Loading content types...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      {data && (
        <div>
          <p className={styles.info}>
            Total: {data.pagination.count} types
          </p>
          <div className={styles.buttonGroup}>
            {data.data.map((ct) => (
              <button
                key={ct.id}
                onClick={() => onSelect(ct.codename)}
                className={selectedId === ct.codename ? styles.buttonSelected : styles.button}
              >
                {ct.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

const ContentTypeDetail = ({ contentTypeId }: { readonly contentTypeId: string }) => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery(getContentType(PROJECT_ID, contentTypeId));

  const mutation = useMutation({
    ...updateContentType,
    onMutate: () => {
      // Pass the typed query client through the mutation context
      return { client: queryClient };
    },
  });

  const handleUpdate = () => {
    if (!data) return;

    mutation.mutate({
      projectId: PROJECT_ID,
      contentType: {
        ...data,
        name: `${data.name} (Updated)`,
      },
    });
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>2. Content Type Detail & Update</h2>
      {isLoading && <p>Loading content type...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      {data && (
        <div>
          <div className={styles.detailBox}>
            <p><strong>Name:</strong> {data.name}</p>
            <p><strong>Codename:</strong> {data.codename}</p>
            <p><strong>Last Modified:</strong> {new Date(data.lastModified).toLocaleString()}</p>
          </div>
          <button
            onClick={handleUpdate}
            disabled={mutation.isPending}
            className={styles.buttonPrimary}
          >
            {mutation.isPending ? 'Updating...' : 'Update Content Type'}
          </button>
          {mutation.isSuccess && (
            <p className={styles.successMessage}>
              ✓ Successfully updated! (Cache automatically updated)
            </p>
          )}
        </div>
      )}
    </section>
  );
};

const TypeSafeCacheAccess = ({ contentTypeId }: { readonly contentTypeId: string }) => {
  const queryClient = useQueryClient();

  // Get the query key for the current content type
  const queryKey = contentTypeKeys.queryKeys.detail(PROJECT_ID, contentTypeId);

  // Type-safe cache read - TypeScript knows this returns ContentType | undefined
  const cachedData = queryClient.getQueryData(queryKey);

  // Type-safe cache write
  const handleManualCacheUpdate = () => {
    queryClient.setQueryData(queryKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        name: `${old.name} [Manually Updated]`,
        lastModified: new Date().toISOString(),
      };
    });
  };

  return (
    <section className={styles.sectionHighlight}>
      <h2 className={styles.sectionTitle}>
        3. Type-Safe Imperative Cache Access 🎯
      </h2>
      <p className={styles.text}>
        This demonstrates the key innovation: fully type-safe imperative query client methods.
      </p>
      <div className={styles.codeBox}>
        <p><strong>Query Key:</strong></p>
        <code className={styles.code}>
          {JSON.stringify(queryKey, null, 2)}
        </code>
      </div>
      <div className={styles.codeBox}>
        <p><strong>Cached Data (via getQueryData):</strong></p>
        <code className={styles.code}>
          {cachedData ? JSON.stringify(cachedData, null, 2) : 'Not in cache yet'}
        </code>
      </div>
      <button
        onClick={handleManualCacheUpdate}
        disabled={!cachedData}
        className={styles.buttonPrimary}
      >
        Manually Update Cache (setQueryData)
      </button>
      <div className={styles.benefits}>
        <p className={styles.benefitsTitle}>
          <strong>Type Safety Benefits:</strong>
        </p>
        <ul className={styles.benefitsList}>
          <li>queryClient.getQueryData() returns ContentType | undefined (fully typed!)</li>
          <li>queryClient.setQueryData() only accepts ContentType data</li>
          <li>TypeScript autocomplete works for all cache operations</li>
          <li>Compile-time errors if you try to set wrong data type</li>
        </ul>
      </div>
    </section>
  );
};

const LanguagesList = () => {
  const { data, isLoading } = useQuery(languagesQuery(PROJECT_ID));

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>4. Languages (Different Entity)</h2>
      {isLoading && <p>Loading languages...</p>}
      {data && (
        <div>
          <p className={styles.languageList}><strong>Languages:</strong></p>
          <div className={styles.buttonGroup}>
            {data.map((lang) => (
              <div
                key={lang.id}
                className={styles.languageTag}
              >
                {lang.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
