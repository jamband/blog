export type Props = {
  tags: string[];
  className?: string;
};

export type _Props = Props & {
  match: (tag: string) => boolean;
};
