export type Props = {
  tags: string[];
  className?: string;
  decoration?: boolean;
};

export type _Props = Props & {
  linkClass: (tag: string) => string;
};
