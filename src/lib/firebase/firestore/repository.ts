import { encodeFields, encodeValue, mapRestDocument } from "./codec";
import {
  assertOk,
  collectionUrl,
  commitUrl,
  documentUrl,
  firestoreDocumentName,
  firestoreFetch,
  runQueryUrl,
} from "./transport";
import type {
  BaseFirestoreDocument,
  CreateFirestoreDocument,
  FirestoreDocument,
  FirestoreFields,
  FirestoreFilter,
  FirestoreOrderBy,
  FirestoreRestDocument,
  FirestoreValue,
  WhereFilterOp,
  WriteResult,
} from "./types";
import { type FirestoreFieldValue, isFieldValue, Timestamp } from "./values";

type RunQueryResponseItem = {
  document?: FirestoreRestDocument;
};

type FirestoreCommitWrite = {
  update?: {
    name: string;
    fields?: FirestoreFields;
  };
  updateMask?: {
    fieldPaths: string[];
  };
  updateTransforms?: Array<{
    fieldPath: string;
    increment?: FirestoreValue;
  }>;
};

type FirestoreCommitResponse = {
  writeResults?: Array<{
    updateTime?: string;
  }>;
};

type FirestoreUpdateData<TDocument extends BaseFirestoreDocument> = {
  [TKey in keyof TDocument]?: TDocument[TKey] | FirestoreFieldValue;
};

class FirestoreRepository<TDocument extends BaseFirestoreDocument> {
  private readonly collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  async findById(id: string): Promise<FirestoreDocument<TDocument> | null> {
    const response = await firestoreFetch(documentUrl(this.collectionName, id));

    if (response.status === 404) {
      return null;
    }

    await assertOk(response);

    return mapRestDocument<TDocument>((await response.json()) as FirestoreRestDocument);
  }

  async findMany(filters: FirestoreFilter[] = []): Promise<Array<FirestoreDocument<TDocument>>> {
    return this.findPage({ filters });
  }

  async findPage({
    filters = [],
    orderBy = [],
    limit,
    startAfter = [],
  }: {
    filters?: FirestoreFilter[];
    orderBy?: FirestoreOrderBy[];
    limit?: number;
    startAfter?: unknown[];
  }): Promise<Array<FirestoreDocument<TDocument>>> {
    const response = await firestoreFetch(runQueryUrl(), {
      method: "POST",
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: this.collectionName }],
          where: getWhereClause(filters),
          orderBy: orderBy.map((order) => ({
            field: { fieldPath: String(order.field) },
            direction: order.direction === "desc" ? "DESCENDING" : "ASCENDING",
          })),
          startAt:
            startAfter.length > 0
              ? {
                  values: startAfter.map((value) => encodeValue(value)),
                  before: false,
                }
              : undefined,
          limit,
        },
      }),
    });

    await assertOk(response);

    const payload = (await response.json()) as RunQueryResponseItem[];

    return payload.flatMap((item) => (item.document ? [mapRestDocument<TDocument>(item.document)] : []));
  }

  async insert(data: CreateFirestoreDocument<TDocument>): Promise<FirestoreDocument<TDocument>> {
    const document = withBaseFields(data);
    const response = await firestoreFetch(collectionUrl(this.collectionName), {
      method: "POST",
      body: JSON.stringify({ fields: encodeFields(document) }),
    });

    await assertOk(response);

    return mapRestDocument<TDocument>((await response.json()) as FirestoreRestDocument);
  }

  async insertWithGeneratedId(data: CreateFirestoreDocument<TDocument>): Promise<FirestoreDocument<TDocument>> {
    const id = crypto.randomUUID().replace(/-/g, "");
    const document = withBaseFields(data);
    const response = await firestoreFetch(`${collectionUrl(this.collectionName)}?documentId=${id}`, {
      method: "POST",
      body: JSON.stringify({ fields: encodeFields(document) }),
    });

    await assertOk(response);

    return mapRestDocument<TDocument>((await response.json()) as FirestoreRestDocument);
  }

  async set(id: string, data: FirestoreUpdateData<TDocument>): Promise<WriteResult> {
    return this.write(id, data);
  }

  async update(id: string, data: FirestoreUpdateData<TDocument>): Promise<WriteResult> {
    return this.write(id, data);
  }

  async delete(id: string): Promise<WriteResult> {
    return await this.update(id, { deleted: true } as Partial<TDocument>);
  }

  async hardDelete(id: string): Promise<WriteResult> {
    const response = await firestoreFetch(documentUrl(this.collectionName, id), {
      method: "DELETE",
    });

    await assertOk(response);

    return {};
  }

  private async write(id: string, data: FirestoreUpdateData<TDocument>): Promise<WriteResult> {
    const documentName = firestoreDocumentName(this.collectionName, id);
    const fields: FirestoreFields = {};
    const updateMask = new Set<string>();
    const updateTransforms: FirestoreCommitWrite["updateTransforms"] = [];

    for (const [fieldPath, value] of Object.entries({
      ...data,
      updatedAt: Timestamp.now(),
    })) {
      if (isFieldValue(value)) {
        if (value.kind === "increment") {
          updateTransforms.push({
            fieldPath,
            increment: encodeValue(value.value),
          });
          continue;
        }

        updateMask.add(fieldPath);
        continue;
      }

      if (value !== undefined) {
        updateMask.add(fieldPath);
        fields[fieldPath] = encodeValue(value);
      }
    }

    const response = await firestoreFetch(commitUrl(), {
      method: "POST",
      body: JSON.stringify({
        writes: [
          {
            update: {
              name: documentName,
              fields,
            },
            updateMask: {
              fieldPaths: Array.from(updateMask),
            },
            updateTransforms,
          } satisfies FirestoreCommitWrite,
        ],
      }),
    });

    await assertOk(response);

    const payload = (await response.json()) as FirestoreCommitResponse;

    return { updateTime: payload.writeResults?.[0]?.updateTime };
  }
}

class FirestoreService {
  private static instance: FirestoreService;
  private readonly repositories = new Map<string, FirestoreRepository<BaseFirestoreDocument>>();

  static async getInstance() {
    if (!FirestoreService.instance) {
      FirestoreService.instance = new FirestoreService();
    }

    return FirestoreService.instance;
  }

  repository<TDocument extends BaseFirestoreDocument>(collectionName: string): FirestoreRepository<TDocument> {
    const cachedRepository = this.repositories.get(collectionName);

    if (cachedRepository) {
      return cachedRepository as FirestoreRepository<TDocument>;
    }

    const repository = new FirestoreRepository<TDocument>(collectionName);
    this.repositories.set(collectionName, repository);

    return repository;
  }
}

export const getFirestoreService = () => FirestoreService.getInstance();

function withBaseFields<TDocument extends BaseFirestoreDocument>(data: CreateFirestoreDocument<TDocument>) {
  const now = Timestamp.now();

  return {
    ...data,
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now,
    deleted: data.deleted ?? false,
  };
}

function getWhereClause(filters: FirestoreFilter[]) {
  if (filters.length === 0) {
    return undefined;
  }

  const fieldFilters = filters.map((filter) => ({
    fieldFilter: {
      field: { fieldPath: filter.field },
      op: mapFilterOperator(filter.operator),
      value: encodeValue(filter.value),
    },
  }));

  if (fieldFilters.length === 1) {
    return fieldFilters[0];
  }

  return {
    compositeFilter: {
      op: "AND",
      filters: fieldFilters,
    },
  };
}

function mapFilterOperator(operator: WhereFilterOp) {
  const operators: Record<WhereFilterOp, string> = {
    "==": "EQUAL",
    "!=": "NOT_EQUAL",
    "<": "LESS_THAN",
    "<=": "LESS_THAN_OR_EQUAL",
    ">": "GREATER_THAN",
    ">=": "GREATER_THAN_OR_EQUAL",
    "array-contains": "ARRAY_CONTAINS",
    in: "IN",
  };

  return operators[operator];
}
