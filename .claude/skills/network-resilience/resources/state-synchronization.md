# 状態同期設計

## 概要

ローカルとリモートのデータ整合性を保証するための状態同期設計。
競合検出、解決戦略、同期プロトコルを含む。

## 同期モデル

### 1. 楽観的同期（Optimistic）

ローカルで即座に反映し、バックグラウンドでリモート同期。

**特徴**:
- 高い応答性
- オフライン時も操作可能
- 競合解決が必要

**適用条件**:
- [ ] ユーザー体験優先
- [ ] 競合頻度が低い
- [ ] 競合解決が容易

### 2. 悲観的同期（Pessimistic）

リモート確認後にローカル反映。

**特徴**:
- 整合性保証
- 競合なし
- オンライン必須

**適用条件**:
- [ ] データ整合性最優先
- [ ] 常時オンライン
- [ ] 競合回避が重要

### 3. CRDT同期

Conflict-free Replicated Data Types を使用。

**特徴**:
- 自動マージ
- 競合なし
- データ型制限あり

**適用条件**:
- [ ] 複雑なデータ構造
- [ ] 頻繁な同時編集
- [ ] 自動解決が必要

## 競合検出

### バージョンベース

```typescript
interface VersionedData<T> {
  data: T;
  version: number;
  updatedAt: string;
  updatedBy: string;
}

function detectConflict<T>(
  local: VersionedData<T>,
  remote: VersionedData<T>,
  base: VersionedData<T>
): boolean {
  // 両方がベースから変更されている
  return local.version !== base.version &&
         remote.version !== base.version &&
         local.version !== remote.version;
}
```

### ハッシュベース

```typescript
interface HashedData<T> {
  data: T;
  hash: string;        // データのハッシュ
  parentHash: string;  // 変更前のハッシュ
}

function detectConflictByHash<T>(
  local: HashedData<T>,
  remote: HashedData<T>
): boolean {
  // 同じ親から異なる変更が発生
  return local.parentHash === remote.parentHash &&
         local.hash !== remote.hash;
}
```

## 競合解決戦略

### 1. タイムスタンプ優先（Last-Write-Wins）

```typescript
function resolveByTimestamp<T>(
  local: VersionedData<T>,
  remote: VersionedData<T>
): T {
  const localTime = new Date(local.updatedAt).getTime();
  const remoteTime = new Date(remote.updatedAt).getTime();

  return localTime > remoteTime ? local.data : remote.data;
}
```

**メリット**: シンプル、自動解決
**デメリット**: データ損失の可能性、時刻同期依存

### 2. サーバー優先

```typescript
function resolveByServer<T>(
  local: VersionedData<T>,
  remote: VersionedData<T>
): T {
  return remote.data;
}
```

**メリット**: 整合性保証
**デメリット**: ローカル変更が失われる

### 3. マージ戦略

```typescript
function mergeObjects<T extends Record<string, unknown>>(
  local: T,
  remote: T,
  base: T
): T {
  const result: Record<string, unknown> = { ...base };

  for (const key of Object.keys(local)) {
    const localChanged = local[key] !== base[key];
    const remoteChanged = remote[key] !== base[key];

    if (localChanged && !remoteChanged) {
      result[key] = local[key];
    } else if (!localChanged && remoteChanged) {
      result[key] = remote[key];
    } else if (localChanged && remoteChanged) {
      // 両方変更された場合は後勝ち
      result[key] = new Date(local.updatedAt) > new Date(remote.updatedAt)
        ? local[key]
        : remote[key];
    }
  }

  return result as T;
}
```

### 4. 手動解決

```typescript
interface ConflictResolution<T> {
  conflictId: string;
  local: T;
  remote: T;
  resolved?: T;
  resolvedBy?: 'user' | 'auto';
  resolvedAt?: string;
}

async function promptUserResolution<T>(
  conflict: ConflictResolution<T>
): Promise<T> {
  // UIでユーザーに選択を委ねる
  const choice = await showConflictDialog(conflict.local, conflict.remote);

  return choice === 'local' ? conflict.local : conflict.remote;
}
```

## 同期プロトコル

### 1. 完全同期

すべてのデータをサーバーから取得して置換。

```typescript
async function fullSync(): Promise<void> {
  const remoteData = await fetchAllFromServer();
  await replaceLocalData(remoteData);
}
```

**使用タイミング**:
- 初回起動時
- 大きな整合性問題発生時
- ユーザー明示的要求時

### 2. 差分同期

変更があった部分のみ同期。

```typescript
async function deltaSync(since: Date): Promise<void> {
  const changes = await fetchChangesSince(since);

  for (const change of changes) {
    if (change.type === 'create' || change.type === 'update') {
      await upsertLocal(change.data);
    } else if (change.type === 'delete') {
      await deleteLocal(change.id);
    }
  }

  await setLastSyncTime(new Date());
}
```

**使用タイミング**:
- 通常の同期操作
- バックグラウンド同期

### 3. 双方向同期

ローカル変更をアップロードし、リモート変更をダウンロード。

```typescript
async function bidirectionalSync(): Promise<SyncResult> {
  const lastSync = await getLastSyncTime();

  // ローカル変更を取得
  const localChanges = await getLocalChangesSince(lastSync);

  // ローカル変更をアップロード
  const uploadResult = await uploadChanges(localChanges);

  // リモート変更をダウンロード
  const remoteChanges = await fetchChangesSince(lastSync);

  // 競合を検出して解決
  const conflicts = detectConflicts(localChanges, remoteChanges);
  const resolved = await resolveConflicts(conflicts);

  // リモート変更を適用
  await applyRemoteChanges(remoteChanges, resolved);

  return {
    uploaded: uploadResult.count,
    downloaded: remoteChanges.length,
    conflicts: conflicts.length,
    resolved: resolved.length
  };
}
```

## 同期状態管理

### 同期メタデータ

```typescript
interface SyncMetadata {
  lastSyncAt: string;
  lastSyncVersion: number;
  pendingChanges: number;
  conflictCount: number;
  status: 'synced' | 'syncing' | 'pending' | 'conflict' | 'error';
}
```

### 変更追跡

```typescript
interface ChangeLog {
  id: string;
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  timestamp: string;
  synced: boolean;
}
```
