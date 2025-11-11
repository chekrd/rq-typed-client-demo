import { Language } from './language.model.ts';

const mockLanguages: Readonly<Array<Language>> = [
  {
    id: 'lang-001',
    name: 'English (United States)',
    codename: 'en-us',
  },
  {
    id: 'lang-002',
    name: 'German (Germany)',
    codename: 'de-de',
  },
  {
    id: 'lang-003',
    name: 'Spanish (Spain)',
    codename: 'es-es',
  },
  {
    id: 'lang-004',
    name: 'French (France)',
    codename: 'fr-fr',
  },
];

export const mock = {
  fetchLanguages: (projectId: string): Promise<Readonly<Array<Language>>> => {
    // In a real implementation, this would fetch languages for the specific project
    console.log(`Fetching languages for project: ${projectId}`);
    return Promise.resolve(mockLanguages);
  },
};
