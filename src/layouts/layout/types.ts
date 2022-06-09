export type Props = {
  title: string;
  children: React.ReactNode;
};

export type _Props = Props & {
  isPost: boolean;
};
