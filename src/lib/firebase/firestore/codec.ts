import type { BaseFirestoreDocument, FirestoreDocument, FirestoreFields, FirestoreRestDocument, FirestoreValue } from "./types";
import { FirestoreTimestamp, isFieldValue, Timestamp } from "./values";

export function mapRestDocument<TDocument extends BaseFirestoreDocument>(
  document: FirestoreRestDocument,
): FirestoreDocument<TDocument> {
  return {
    id: document.name.split("/").at(-1) ?? "",
    ...(decodeFields(document.fields ?? {}) as TDocument),
  };
}

export function encodeFields(data: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== undefined && !(isFieldValue(value) && value.kind === "delete"))
      .map(([key, value]) => [key, encodeValue(value)]),
  );
}

export function encodeValue(value: unknown): FirestoreValue {
  if (value === null) {
    return { nullValue: null };
  }

  if (value instanceof FirestoreTimestamp) {
    return { timestampValue: value.toISOString() };
  }

  if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  }

  if (typeof value === "boolean") {
    return { booleanValue: value };
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }

  if (typeof value === "string") {
    return { stringValue: value };
  }

  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map((item) => encodeValue(item)),
      },
    };
  }

  if (typeof value === "object") {
    return { mapValue: { fields: encodeFields(value as Record<string, unknown>) } };
  }

  throw new Error(`Unsupported Firestore value: ${String(value)}`);
}

function decodeFields(fields: FirestoreFields) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]));
}

function decodeValue(value: FirestoreValue): unknown {
  if ("nullValue" in value) {
    return null;
  }

  if ("booleanValue" in value) {
    return value.booleanValue;
  }

  if ("integerValue" in value) {
    return Number(value.integerValue);
  }

  if ("doubleValue" in value) {
    return value.doubleValue;
  }

  if ("timestampValue" in value) {
    return Timestamp.fromISOString(value.timestampValue);
  }

  if ("stringValue" in value) {
    return value.stringValue;
  }

  if ("arrayValue" in value) {
    return (value.arrayValue.values ?? []).map((item) => decodeValue(item));
  }

  return decodeFields(value.mapValue.fields ?? {});
}
