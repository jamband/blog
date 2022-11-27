export type Props = {
  tags: Array<string>;
  className?: string;
};

export type _Props = Props & {
  match: (tag: string) => boolean;
};
