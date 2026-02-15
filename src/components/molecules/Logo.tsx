export const Logo: React.FC = () => {
  return (
    <section className="flex items-center gap-8">
      <img src="/logo.svg" alt="Logo" width="32" height="32" />
      <h1 className="text-preset-2 dark:text-neutral-0">Bookmark Manager</h1>
    </section>
  );
};
