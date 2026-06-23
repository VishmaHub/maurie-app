export type FormDataRecord = Readonly<Record<string, FormDataEntryValue | FormDataEntryValue[]>>;

/** Converts FormData to a schema-friendly record while retaining repeated fields. */
export function formDataToRecord(formData: FormData): FormDataRecord {
  const result: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};

  for (const [key, value] of formData.entries()) {
    const existingValue = result[key];

    if (typeof existingValue === "undefined") {
      result[key] = value;
      continue;
    }

    result[key] = Array.isArray(existingValue) ? [...existingValue, value] : [existingValue, value];
  }

  return result;
}
