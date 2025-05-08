import ts from 'typescript';

type GlobalTypeName = 'File' | 'Blob';

const globalTypes: Partial<Record<GlobalTypeName, ts.Type>> = {};

export const getGlobalType = (
  typeName: GlobalTypeName,
  checker: ts.TypeChecker,
): ts.Type | undefined => {
  if (globalTypes[typeName]) return globalTypes[typeName];

  const symbol = checker.resolveName(
    typeName,
    undefined,
    ts.SymbolFlags.Interface |
      ts.SymbolFlags.TypeAlias |
      ts.SymbolFlags.Class |
      ts.SymbolFlags.Value |
      ts.SymbolFlags.Function,
    false,
  );

  if (!symbol) return;

  globalTypes[typeName] = checker.getDeclaredTypeOfSymbol(symbol);

  return globalTypes[typeName];
};
