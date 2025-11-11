export type ContentType = {
  readonly id: string;
  readonly name: string;
  readonly codename: string;
  readonly lastModified: string;
};

export type ContentTypes = {
  readonly data: Readonly<Array<ContentType>>;
  readonly pagination: {
    readonly count: number;
    readonly nextPage: string | null;
  };
};
