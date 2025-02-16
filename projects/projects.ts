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
  }[] => [
    { ...project, output: undefined },
    {
      ...project,
      output: `${project.output}/basic`,
    },
  ],
);
