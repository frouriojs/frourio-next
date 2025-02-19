import ts from 'typescript';

const TYPE_NAMES = ['string', 'number', 'boolean'] as const;

type TypeName = (typeof TYPE_NAMES)[number];

export type PropOption = {
  name: string;
  typeName: TypeName;
  isOptional: boolean;
  isArray: boolean;
};

export const getPropOptions = (checker: ts.TypeChecker, target: ts.Symbol): PropOption[] | null => {
  const type =
    target.valueDeclaration && checker.getTypeOfSymbolAtLocation(target, target.valueDeclaration);

  if (!type) return null;

  return type
    .getProperties()
    .map((p) =>
      target.valueDeclaration
        ? getPropOption(checker, checker.getTypeOfSymbolAtLocation(p, target.valueDeclaration), p)
        : null,
    )
    .filter((t) => t !== null);
};

export const inferZodType = (checker: ts.TypeChecker, target: ts.Symbol): ts.Symbol | null => {
  const type =
    target.valueDeclaration && checker.getTypeOfSymbolAtLocation(target, target.valueDeclaration);

  return type?.getProperty('_output') ?? null;
};

export const getValidatorOption = (checker: ts.TypeChecker, prop: ts.Symbol): PropOption | null =>
  prop.valueDeclaration
    ? getPropOption(checker, checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration), prop)
    : null;

const isArrayType = (type: ts.Type): boolean => {
  if (type.symbol?.name === 'Array') return true;

  if (type.flags & ts.TypeFlags.Object) {
    const objectType = type as ts.ObjectType;

    if (objectType.objectFlags & ts.ObjectFlags.Reference) {
      const referenceType = objectType as ts.TypeReference;

      return referenceType.target.symbol.name === 'Array';
    }
  }

  return false;
};

const getArrayElementType = (type: ts.Type): ts.Type | null => {
  if (isArrayType(type)) {
    const objectType = type as ts.ObjectType;

    if (objectType.objectFlags & ts.ObjectFlags.Reference) {
      const referenceType = objectType as ts.TypeReference;
      const typeArguments = referenceType.typeArguments;

      if (typeArguments && typeArguments.length > 0) return typeArguments[0];
    }
  }

  return null;
};

const getPropOption = (
  checker: ts.TypeChecker,
  type: ts.Type,
  prop: ts.Symbol,
): PropOption | null => {
  const nonNullableType = checker.getNonNullableType(type);
  const arrayElementType = getArrayElementType(nonNullableType);
  const targetType = arrayElementType ?? nonNullableType;

  for (const typeName of TYPE_NAMES) {
    const returnResult = (type: ts.Type): PropOption | null =>
      (
        type.isIntersection()
          ? type.types.some((t) => checker.typeToString(t) === typeName)
          : checker.typeToString(type) === typeName
      )
        ? {
            name: prop.getName(),
            typeName,
            isOptional: (prop.flags & ts.SymbolFlags.Optional) !== 0,
            isArray: !!arrayElementType,
          }
        : null;
    const result =
      checker.typeToString(targetType) === typeName
        ? returnResult(targetType)
        : targetType.isUnion()
          ? (targetType.types.map(returnResult).find((t) => t !== null) ?? null)
          : returnResult(targetType);

    if (result) return result;
  }

  return null;
};
