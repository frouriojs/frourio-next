export const paramToNumText = `const paramToNum = <T extends z.ZodTypeAny>(schema: T) =>
  z.string().or(z.number()).transform<z.infer<T>>((val, ctx) => {
    const numVal = Number(val);
    const parsed = schema.safeParse(isNaN(numVal) ? val : numVal);

    if (parsed.success) return parsed.data;

    parsed.error.issues.forEach((issue) => ctx.addIssue(issue));
  });

`;

export const paramToNumArrText = `const paramToNumArr = <T extends z.ZodTypeAny>(schema: T) =>
  z.array(z.string().or(z.number())).optional().transform<z.infer<T>>((val, ctx) => {
    const numArr = val?.map((v) => {
      const numVal = Number(v);

      return isNaN(numVal) ? v : numVal;
    });
    const parsed = schema.safeParse(numArr);

    if (parsed.success) return parsed.data;

    parsed.error.issues.forEach((issue) => ctx.addIssue(issue));
  });

`;

export const queryToNumText = `const queryToNum = (val: string | undefined) => {
  const num = Number(val);

  return isNaN(num) ? val : num;
}`;

export const queryToNumArrText = `const queryToNumArr = (val: string[]) =>
  val.map((v) => {
    const numVal = Number(v);

    return isNaN(numVal) ? v : numVal;
  })`;

export const queryToBoolText = `const queryToBool = (val: string | undefined) =>
  val === 'true' ? true : val === 'false' ? false : val`;

export const queryToBoolArrText = `const queryToBoolArr = (val: string[]) =>
  val.map((v) => (v === 'true' ? true : v === 'false' ? false : v))`;

export const formDataToNumText = `const formDataToNum = (val: FormDataEntryValue | undefined) => {
  const num = Number(val);

  return isNaN(num) ? val : num;
}`;

export const formDataToNumArrText = `const formDataToNumArr = (val: FormDataEntryValue[]) =>
  val.map((v) => {
    const numVal = Number(v);

    return isNaN(numVal) ? v : numVal;
  })`;

export const formDataToBoolText = `const formDataToBool = (val: FormDataEntryValue | undefined) =>
  val === 'true' ? true : val === 'false' ? false : val`;

export const formDataToBoolArrText = `const formDataToBoolArr = (val: FormDataEntryValue[]) =>
  val.map((v) => (v === 'true' ? true : v === 'false' ? false : v))`;

export const formDataToFileText = `const formDataToFile = (val: FormDataEntryValue | undefined) =>
  val instanceof File || typeof val === 'string' || val === undefined ? val : new File([val], (val as { name: string }).name, val) /* for MSW */`;

export const formDataToFileArrText = `const formDataToFileArr = (val: FormDataEntryValue[]) =>
  val.map((v) => (v instanceof File || typeof v === 'string' ? v : new File([v], (v as { name: string }).name, v) /* for MSW */))`;
