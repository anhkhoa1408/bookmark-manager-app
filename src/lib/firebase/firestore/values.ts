export type FirestoreFieldValue =
  | {
      kind: "delete";
    }
  | {
      kind: "increment";
      value: number;
    };

export class FirestoreTimestamp {
  private readonly date: Date;

  private constructor(date: Date) {
    this.date = date;
  }

  static now() {
    return new FirestoreTimestamp(new Date());
  }

  static fromISOString(value: string) {
    return new FirestoreTimestamp(new Date(value));
  }

  toDate() {
    return this.date;
  }

  toMillis() {
    return this.date.getTime();
  }

  toISOString() {
    return this.date.toISOString();
  }
}

export const Timestamp = FirestoreTimestamp;

export type Timestamp = FirestoreTimestamp;

export const FieldValue = {
  delete: (): FirestoreFieldValue => ({ kind: "delete" }),
  increment: (value: number): FirestoreFieldValue => ({ kind: "increment", value }),
};

export function isFieldValue(value: unknown): value is FirestoreFieldValue {
  return (
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    (value.kind === "delete" || value.kind === "increment")
  );
}
