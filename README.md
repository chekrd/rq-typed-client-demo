# React Query Typed Client Demo

A demonstration of a fully type-safe wrapper around React Query's imperative query client methods.

## 🚀 Quick Start

```bash
# Install dependencies (use your preferred package manager)
npm install

# Run the demo application
npm run dev

# Visit http://localhost:5173 in your browser
```

The demo application will show you:
- Type-safe cache reads with `getQueryData`
- Type-safe cache writes with `setQueryData`
- Hierarchical query invalidation
- Real-time cache inspection

## 🎯 The Problem

React Query's imperative query client methods like `getQueryData` and `setQueryData` are not fully type-safe by default:

```typescript
// ❌ Not type-safe - data type is unknown
const data = queryClient.getQueryData(someQueryKey);

// ❌ Can set wrong data type - no compile-time error
queryClient.setQueryData(contentTypeKey, { wrong: 'data' });
```

## ✨ The Solution

This demo implements a type system that maps query keys to their cache models, enabling:

1. **Fully typed cache reads**: `getQueryData` returns the correct type based on the query key
2. **Fully typed cache writes**: `setQueryData` only accepts data matching the query key's type
3. **Autocomplete everywhere**: TypeScript knows about all your query keys and their data types
4. **Compile-time safety**: Impossible to set wrong data type in the cache

```typescript
// ✅ Fully type-safe - data is ContentType | undefined
const data = queryClient.getQueryData(contentTypeKeys.queryKeys.detail(projectId, detailId));

// ✅ Type-safe - only accepts ContentType data
queryClient.setQueryData(contentTypeKeys.queryKeys.detail(projectId, detailId), (old) => {
  return { ...old, name: 'Updated' }; // TypeScript validates this!
});
```

## 🏗️ Architecture

### 1. Hierarchical Query Keys

Query keys are organized hierarchically with **filter keys** (for invalidation) and **query keys** (for specific queries):

```typescript
// src/queries/contentTypes/contentTypeKeys.ts
export const contentTypeKeys = {
  filterKeys: {
    all: [{ type: 'contentType' }] as const,
    allForEnvironment: (projectId: string) =>
      [{ ...contentTypeKeys.filterKeys.all[0], projectId }] as const,
    detailsForEnvironment: (projectId: string) =>
      [
        {
          ...contentTypeKeys.filterKeys.allForEnvironment(projectId)[0],
          scope: 'detail',
        },
      ] as const,
    listsForEnvironment: (projectId: string) =>
      [
        {
          ...contentTypeKeys.filterKeys.allForEnvironment(projectId)[0],
          scope: 'list',
        },
      ] as const,
  },
  queryKeys: {
    detail: (projectId: string, detailId: string) =>
      [
        {
          ...contentTypeKeys.filterKeys.detailsForEnvironment(projectId)[0],
          detailId,
        },
      ] as const,
    list: (projectId: string, filter?: Record<string, string>) =>
      [
        {
          ...contentTypeKeys.filterKeys.listsForEnvironment(projectId)[0],
          filter: filter ?? {},
        },
      ] as const,
  },
} as const;
```

### 2. Type Mapping System

The `QueryKeyMap` type creates a map between query keys and their cache models:

```typescript
// Map query key names to their cache models
type QueryKeyNameToCacheModel = {
  readonly detail: ContentType;  // detail query returns ContentType
  readonly list: ContentTypes;   // list query returns ContentTypes
};

// Generate the complete type map
export type ContentTypeKeyMap = QueryKeyMap<typeof contentTypeKeys, QueryKeyNameToCacheModel>;
```

### 3. TypedQueryClient

A wrapper around React Query's `QueryClient` with typed methods:

```typescript
// src/queries/typedQueryClient.type.ts
export type TypedQueryClient = Omit<QueryClient, InsufficientlyTypedQueryClientMethods> & {
  readonly getQueryData: <TQueryKey extends QueryKeysUnion<AllEntityKeyMap>>(
    queryKey: TQueryKey,
  ) => CacheModelForKey<TQueryKey, AllEntityKeyMap> | undefined;

  readonly setQueryData: <TQueryKey extends QueryKeysUnion<AllEntityKeyMap>>(
    queryKey: TQueryKey,
    updater: Updater<
      CacheModelForKey<TQueryKey, AllEntityKeyMap> | undefined,
      CacheModelForKey<TQueryKey, AllEntityKeyMap> | undefined
    >,
    options?: SetDataOptions,
  ) => CacheModelForKey<TQueryKey, AllEntityKeyMap> | undefined;

  // ... other typed methods (getQueriesData, getQueryState, setQueriesData)
};
```

### 4. Global Type Registration

Module augmentation registers all query keys globally:

```typescript
// src/queries/register.d.ts
type QueryKey = AllKeysUnion<ContentTypeKeyMap | LanguageKeyMap>;

declare module '@tanstack/react-query' {
  interface Register {
    queryKey: QueryKey;
    defaultError: Error;
  }
}
```

## 🌟 Most Interesting Parts of This Demo

### 1. **Type-Safe Cache Access** (`src/app/App.tsx:121-140`)
The `TypeSafeCacheAccess` component demonstrates the core innovation:

```typescript
const queryKey = contentTypeKeys.queryKeys.detail(PROJECT_ID, contentTypeId);

// TypeScript knows this returns ContentType | undefined
const cachedData = queryClient.getQueryData(queryKey);

// TypeScript ensures you can only set ContentType data
queryClient.setQueryData(queryKey, (old) => {
  if (!old) return old;
  return {
    ...old,
    name: `${old.name} [Manually Updated]`,
    lastModified: new Date().toISOString(),
  };
});
```

**Why it's interesting:** TypeScript automatically infers the correct type based on the query key. You get autocomplete and compile-time errors if you try to set the wrong data type.

### 2. **Query Key Type Mapping** (`src/queries/contentTypes/contentTypeKeys.ts:42-55`)
The mapping between query key names and their cache models:

```typescript
/**
 * Map query key names to their cache models.
 * This tells the type system what data each query returns.
 */
type QueryKeyNameToCacheModel = {
  readonly detail: ContentType;  // detail queries return ContentType
  readonly list: ContentTypes;   // list queries return ContentTypes
};

/**
 * Generate the complete type map for content type queries.
 * This enables full type safety when accessing the cache.
 */
export type ContentTypeKeyMap = QueryKeyMap<typeof contentTypeKeys, QueryKeyNameToCacheModel>;
```

**Why it's interesting:** This simple declaration enables all the type safety. The `QueryKeyMap` utility type does the heavy lifting to create the complete type map.

### 3. **TypedQueryClient** (`src/queries/typedQueryClient.type.ts:40-47`)
The typed wrapper around React Query's QueryClient:

```typescript
readonly setQueryData: <TQueryKey extends QueryKeysUnion<AllEntityKeyMap>>(
  queryKey: TQueryKey,
  updater: Updater<
    CacheModelForKey<TQueryKey, AllEntityKeyMap> | undefined,
    CacheModelForKey<TQueryKey, AllEntityKeyMap> | undefined
  >,
  options?: SetDataOptions,
) => CacheModelForKey<TQueryKey, AllEntityKeyMap> | undefined;
```

**Why it's interesting:** The `CacheModelForKey` type automatically extracts the correct cache model type from the query key. This is the "magic" that makes everything type-safe.

### 4. **Hierarchical Query Keys** (`src/queries/contentTypes/contentTypeKeys.ts:4-40`)
Keys are structured hierarchically for powerful invalidation:

```typescript
contentTypeKeys.filterKeys.all                              // Invalidates ALL content type queries
contentTypeKeys.filterKeys.allForEnvironment(projectId)     // Invalidates all for environment
contentTypeKeys.filterKeys.detailsForEnvironment(projectId) // Invalidates only details
contentTypeKeys.filterKeys.listsForEnvironment(projectId)   // Invalidates only lists
contentTypeKeys.queryKeys.detail(projectId, detailId)       // Specific detail query
```

**Why it's interesting:** You can invalidate at any level of granularity while maintaining type safety. The hierarchy is built using object spreading and `as const`.

### 5. **Mutation with Typed Cache Updates** (`src/queries/contentTypes/updateContentType.ts`)
Mutations use `mutationOptions()` with typed context:

```typescript
export const updateContentType = mutationOptions<
  ContentType,
  Error,
  Variables,
  { client: TypedQueryClient }
>({
  mutationFn: async (variables: Variables): Promise<ContentType> => {
    // API call simulation
    return { ...variables.contentType, lastModified: new Date().toISOString() };
  },

  onSuccess: async (data, variables, context) => {
    const queryClient = context.client; // TypedQueryClient from context

    // TypeScript validates this is ContentType
    queryClient.setQueryData(
      contentTypeKeys.queryKeys.detail(variables.projectId, data.id),
      () => data
    );

    // Invalidate related queries
    await queryClient.invalidateQueries({
      queryKey: contentTypeKeys.filterKeys.listsForEnvironment(variables.projectId),
    });
  },
});
```

**Why it's interesting:** The mutation receives the typed query client through the context, enabling type-safe cache manipulation. The context is provided via `onMutate` in the component.

### 6. **Advanced Type Utilities** (`src/queries/queryKeyMap.type.ts`)
Complex TypeScript utilities that power the system:

- `GetQueryKeysForKey`: Filters query keys that extend a filter key
- `KeyNamesToQueryKeys`: Maps all key names to their possible query keys
- `CacheModelForKey`: Extracts the cache model type for a specific query key

**Why it's interesting:** These utilities use advanced TypeScript features (conditional types, mapped types, type inference) to create a fully automated type system with zero runtime overhead.

## 📁 Project Structure

```
src/
├── queries/                   # Core query infrastructure
│   ├── queryKeyMap.type.ts    # ⭐ Type utilities for key-to-cache-model mapping
│   ├── typedQueryClient.type.ts  # ⭐ Typed QueryClient wrapper
│   ├── useQueryClient.ts      # Hook returning TypedQueryClient
│   ├── register.d.ts          # Global type registration
│   ├── contentTypes/          # Content type entity
│   │   ├── contentTypeKeys.ts       # ⭐ Query keys + type map
│   │   ├── contentType.model.ts     # ContentType type definitions
│   │   ├── contentType.service.mock.ts  # Mock API service
│   │   ├── getContentType.ts        # Detail query
│   │   ├── getContentTypes.ts       # List query
│   │   └── updateContentType.ts     # ⭐ Mutation with cache updates
│   └── languages/             # Language entity
│       ├── languageKeys.ts          # Query keys + type map
│       ├── language.model.ts        # Language type definitions
│       ├── language.service.mock.ts # Mock API service
│       └── getLanguages.ts          # List query
└── app/
    └── App.tsx                # ⭐ Demo application

⭐ = Most interesting files to review
```

## 📋 Additional Commands

```bash
# Type check
npm run typecheck

# Build for production
npm run build

# Preview production build
npm run preview
```

## 💡 Key Features Demonstrated

### 1. Type-Safe Cache Reads

```typescript
const queryClient = useQueryClient();

// TypeScript knows this returns ContentType | undefined
const cachedContentType = queryClient.getQueryData(
  contentTypeKeys.queryKeys.detail(projectId, detailId)
);

// You get full autocomplete on the data
console.log(cachedContentType?.name);
console.log(cachedContentType?.codename);
```

### 2. Type-Safe Cache Writes

```typescript
// TypeScript ensures you can only set ContentType data
queryClient.setQueryData(
  contentTypeKeys.queryKeys.detail(projectId, detailId),
  (old) => {
    if (!old) return old;
    return {
      ...old,
      name: 'Updated Name',
      // TypeScript would error if you tried to add invalid properties
    };
  }
);
```

### 3. Type-Safe Mutations

```typescript
// Spread mutation options and provide typed query client via context
const mutation = useMutation({
  ...updateContentType,
  onMutate: () => ({ client: queryClient }),
});

// In updateContentType.ts, the mutation is defined with mutationOptions():
export const updateContentType = mutationOptions<
  ContentType,
  Error,
  Variables,
  { client: TypedQueryClient }
>({
  mutationFn: async (variables: Variables) => { /* ... */ },

  onSuccess: async (data, variables, context) => {
    const queryClient = context.client; // TypedQueryClient from context

    // Fully type-safe cache update
    queryClient.setQueryData(
      contentTypeKeys.queryKeys.detail(variables.projectId, data.id),
      () => data
    );

    // Type-safe invalidation
    await queryClient.invalidateQueries({
      queryKey: contentTypeKeys.filterKeys.listsForEnvironment(variables.projectId),
    });
  },
});
```

### 4. Hierarchical Invalidation

```typescript
// Invalidate all content type queries
await queryClient.invalidateQueries({
  queryKey: contentTypeKeys.filterKeys.all,
});

// Invalidate all queries for specific environment
await queryClient.invalidateQueries({
  queryKey: contentTypeKeys.filterKeys.allForEnvironment(projectId),
});

// Invalidate only detail queries for environment
await queryClient.invalidateQueries({
  queryKey: contentTypeKeys.filterKeys.detailsForEnvironment(projectId),
});

// Invalidate only list queries for environment
await queryClient.invalidateQueries({
  queryKey: contentTypeKeys.filterKeys.listsForEnvironment(projectId),
});
```

## 🎓 Learning Resources

### Key Files to Study

1. **`queryKeyMap.type.ts`**: Complex type utilities that power the type system
2. **`contentTypeKeys.ts`**: Example of hierarchical key structure and type mapping
3. **`typedQueryClient.type.ts`**: How to wrap QueryClient with better types
4. **`updateContentType.ts`**: Type-safe mutation with cache updates
5. **`App.tsx`**: Working examples of type-safe cache access

### Type System Flow

```
Query Key Definition
        ↓
QueryKeyMap Type Utility
        ↓
ContentTypeKeyMap (entity-specific map)
        ↓
AllEntityKeyMap (union of all entities)
        ↓
TypedQueryClient (uses map for type inference)
        ↓
Type-safe imperative methods
```

## 🔍 Benefits

1. **Type Safety**: Impossible to put wrong data in the cache
2. **Better DX**: Full autocomplete for query keys and cache data
3. **Refactoring Safety**: Changing data models updates types everywhere
4. **Documentation**: Types serve as inline documentation
5. **Fewer Bugs**: Catch errors at compile-time instead of runtime

## 📝 Notes

This is a minimal demo focused on the type system. In a production application, you would also want:

- Error boundaries and error handling
- Loading states and skeletons
- Retry logic and network error handling
- Optimistic updates
- Persistence layer
- More complex query patterns (infinite queries, dependent queries, etc.)

## 🤝 Contributing

This demo is meant to showcase the type system for React Query maintainers and the community. Feel free to explore, modify, and learn from the implementation!

## 📄 License

MIT
