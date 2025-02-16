export const projects = [
  { dir: 'nextjs-appdir', output: 'out/lib' },
  { dir: 'nextjs-src-appdir', output: 'src/out/lib' },
  { dir: 'nextjs-stable-appdir', output: 'out/lib' },
].flatMap(
  (
    project,
  ): {
    dir: string;
    output: string | undefined;
    enableStatic: boolean;
  }[] => [
    { ...project, output: undefined, enableStatic: true },
    {
      ...project,
      output: `${project.output}/basic`,
      enableStatic: false,
    },
    {
      ...project,
      output: `${project.output}/static`,
      enableStatic: true,
    },
    {
      ...project,
      output: `${project.output}/ignore`,
      enableStatic: true,
    },
  ],
);
