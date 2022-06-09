export type Props = {
  tags: string[];
  className?: string;
  decoration?: boolean;
};

export type _Props = Props & {
  match: (tag: string) => boolean;
};
