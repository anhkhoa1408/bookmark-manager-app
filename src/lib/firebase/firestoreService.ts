import { adminDb } from "@/lib/firebase/firebase-admin";
import {
  FieldPath,
  Timestamp,
  type DocumentData,
  type Firestore,
  type OrderByDirection,
  type PartialWithFieldValue,
  type Query,
  type UpdateData,
  type WhereFilterOp,
  type WithFieldValue,
  type WriteResult,
} from "firebase-admin/firestore";

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

export class FirestoreRepository<TDocument extends BaseFirestoreDocument> {
  constructor(
    private readonly db: Firestore,
    private readonly collectionName: string,
  ) {}

  async findById(id: string): Promise<FirestoreDocument<TDocument> | null> {
    const snapshot = await this.db.collection(this.collectionName).doc(id).get();

    if (!snapshot.exists) {
      return null;
    }

    return {
      id: snapshot.id,
      ...(snapshot.data() as TDocument),
    };
  }

  async findMany(filters: FirestoreFilter[] = []): Promise<Array<FirestoreDocument<TDocument>>> {
    let query: Query<DocumentData, DocumentData> = this.db.collection(this.collectionName);

    for (const filter of filters) {
      query = query.where(filter.field, filter.operator, filter.value);
    }

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as TDocument),
    }));
  }

  async findPage({
    filters = [],
    orderBy = [],
    limit,
    startAfter = [],
  }: {
    filters?: FirestoreFilter[];
    orderBy?: FirestoreOrderBy[];
    limit: number;
    startAfter?: unknown[];
  }): Promise<Array<FirestoreDocument<TDocument>>> {
    let query: Query<DocumentData, DocumentData> = this.db.collection(this.collectionName);

    for (const filter of filters) {
      query = query.where(filter.field, filter.operator, filter.value);
    }

    for (const order of orderBy) {
      query = query.orderBy(order.field, order.direction);
    }

    if (startAfter.length > 0) {
      query = query.startAfter(...startAfter);
    }

    const snapshot = await query.limit(limit).get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as TDocument),
    }));
  }

  async insert(data: WithFieldValue<CreateFirestoreDocument<TDocument>>): Promise<FirestoreDocument<TDocument>> {
    const now = Timestamp.now();
    const documentRef = await this.db.collection(this.collectionName).add(
      Object.assign({}, data, {
      createdAt: now,
      updatedAt: now,
      deleted: false,
      }),
    );
    const snapshot = await documentRef.get();

    return {
      id: snapshot.id,
      ...(snapshot.data() as TDocument),
    };
  }

  async insertWithGeneratedId(
    data: WithFieldValue<CreateFirestoreDocument<TDocument>>,
  ): Promise<FirestoreDocument<TDocument>> {
    const now = Timestamp.now();
    const documentRef = this.db.collection(this.collectionName).doc();
    const document = Object.assign({}, data, {
      createdAt: now,
      updatedAt: now,
      deleted: false,
    });

    await documentRef.set(document);

    return {
      id: documentRef.id,
      ...(document as TDocument),
    };
  }

  async set(id: string, data: PartialWithFieldValue<TDocument>): Promise<WriteResult> {
    return await this.db
      .collection(this.collectionName)
      .doc(id)
      .set(
        {
          ...data,
          updatedAt: Timestamp.now(),
        },
        { merge: true },
      );
  }

  async update(id: string, data: UpdateData<TDocument>): Promise<WriteResult> {
    return await this.db
      .collection(this.collectionName)
      .doc(id)
      .update({
        ...data,
        updatedAt: Timestamp.now(),
      });
  }

  async delete(id: string): Promise<WriteResult> {
    return await this.update(id, { deleted: true } as UpdateData<TDocument>);
  }

  async hardDelete(id: string): Promise<WriteResult> {
    return await this.db.collection(this.collectionName).doc(id).delete();
  }
}

export class FirestoreService {
  private static instance: FirestoreService;
  private readonly repositories = new Map<string, FirestoreRepository<BaseFirestoreDocument>>();

  private constructor(private readonly db: Firestore) {}

  static getInstance() {
    if (!FirestoreService.instance) {
      FirestoreService.instance = new FirestoreService(adminDb);
    }

    return FirestoreService.instance;
  }

  repository<TDocument extends BaseFirestoreDocument>(collectionName: string): FirestoreRepository<TDocument> {
    const cachedRepository = this.repositories.get(collectionName);

    if (cachedRepository) {
      return cachedRepository as FirestoreRepository<TDocument>;
    }

    const repository = new FirestoreRepository<TDocument>(this.db, collectionName);
    this.repositories.set(collectionName, repository);

    return repository;
  }
}

export const firestoreService = FirestoreService.getInstance();
