import type { Timestamp } from "./values";

export type FirestoreValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { timestampValue: string }
  | { stringValue: string }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: FirestoreFields } };

export type FirestoreFields = Record<string, FirestoreValue>;

export type FirestoreRestDocument = {
  name: string;
  fields?: FirestoreFields;
};

export type FieldPath = string;
export type OrderByDirection = "asc" | "desc";
export type WhereFilterOp = "==" | "!=" | "<" | "<=" | ">" | ">=" | "array-contains" | "in";
export type WriteResult = { updateTime?: string };

export type BaseFirestoreDocument = {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deleted: boolean;
};

export type FirestoreFilter = {
  field: string;
  operator: WhereFilterOp;
  value: unknown;
};

export type FirestoreOrderBy = {
  field: string | FieldPath;
  direction?: OrderByDirection;
};

export type FirestoreDocument<TDocument extends BaseFirestoreDocument> = TDocument & {
  id: string;
};

export type CreateFirestoreDocument<TDocument extends BaseFirestoreDocument> = Omit<
  TDocument,
  keyof BaseFirestoreDocument
> &
  Partial<BaseFirestoreDocument>;
