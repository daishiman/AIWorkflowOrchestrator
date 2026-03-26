# Implementation Guide

## Part 1: 中学生レベルの説明

### 1.1 この task がそろえるもの

この task は、「途中まで進めた作業を、あとで安全に続きから開けるようにする」ための約束を決める作業です。

たとえば読書で、しおりを本にはさむだけでは足りないことがあります。どの本のどの版を読んでいたか、途中で本の中身が入れ替わっていないか、しおりを誰かに動かされていないかも分からないと、間違ったページから再開してしまいます。

Task08 は、この「しおり」だけでなく、「本が同じか」「別の人が動かしていないか」まで確認する約束を作ります。

### 1.2 なぜ必要か

`SkillCreatorWorkflowEngine` は今の状態をメモリに持っていますが、アプリを閉じたり、後で再開したりすると、そのままでは消えます。だから保存先が必要です。

ただし、前と同じ状態か分からないまま続きから開くと危険です。そこで Task08 では、次の 3 つを分けて考えます。

| 項目     | 何を確認するか                       |
| -------- | ------------------------------------ |
| 保存対象 | どの状態を残すか                     |
| 相性判定 | そのまま再開してよいか               |
| 競合判定 | 別の人や別の実行が先に触っていないか |

### 1.3 完成形

- 何を保存するかがはっきりしている
- 中身が変わったら再開を止められる
- 少しだけ場所が変わった場合は warning を出して再開できる
- 途中の細かい実行までは追わず、区切りのよい地点だけ保存する

## Part 2: 技術者向け説明

### 2.1 current canonical facts

Task08 が前提にする current fact は `SkillCreatorWorkflowEngine` と generic session persistence の 2 系統である。

```ts
export interface SkillCreatorResumeTokenEnvelope {
  version: "task-sdk-02-v1";
  planId: string;
  currentPhase: SkillCreatorWorkflowPhase;
  artifactCount: number;
  routeSnapshot?: SkillCreatorRouteSnapshot;
  sourceProvenance?: SkillCreatorWorkflowSourceProvenance;
  updatedAt: string;
}

export interface PersistedSession {
  id: string;
  createdAt: number;
  lastAccessedAt: number;
  isActive: boolean;
  messageCount: number;
  title?: string;
}

export interface SessionStorageSchema {
  sessions: PersistedSession[];
  messages: Record<string, PersistedMessage[]>;
  metadata: StorageMetadata;
}
```

補足:

- engine 側は workflow state を保持できるが、永続化先 contract はまだない。
- generic persistence 側は summary/list/LRU を持てるが、workflow-specific payload を表現していない。

### 2.2 target delta

Task08 では generic summary と workflow payload を分離した persisted contract を追加する。

```ts
type ResumeCompatibilityStatus =
  | "compatible"
  | "compatible_with_warning"
  | "incompatible"
  | "conflict";

interface SkillCreatorCheckpointLease {
  ownerInstanceId: string;
  leaseExpiresAt: string;
}

interface SkillCreatorPersistedWorkflowSession {
  planId: string;
  checkpointType:
    | "review-ready"
    | "execute-complete"
    | "verify-fail"
    | "handoff-ready";
  snapshot: SkillCreatorWorkflowStateSnapshot;
  manifestCacheKey?: string;
  resourceDescriptorHash?: string;
  revision: number;
  lease: SkillCreatorCheckpointLease;
  updatedAt: string;
}

interface EvaluateResumeCompatibilityResult {
  status: ResumeCompatibilityStatus;
  reasons: string[];
  warningCode?: "root_relocated_equivalent";
}
```

### 2.3 API シグネチャ候補

```ts
interface SkillCreatorWorkflowSessionRepository {
  saveCheckpoint(
    checkpoint: SkillCreatorPersistedWorkflowSession,
    expectedRevision?: number,
  ): Promise<void>;

  loadLatestCheckpoint(
    planId: string,
  ): Promise<SkillCreatorPersistedWorkflowSession | null>;

  evaluateResumeCompatibility(input: {
    checkpoint: SkillCreatorPersistedWorkflowSession;
    currentRouteSnapshot?: SkillCreatorRouteSnapshot;
    currentSourceProvenance?: SkillCreatorWorkflowSourceProvenance;
  }): EvaluateResumeCompatibilityResult;

  invalidateCheckpoint(planId: string, reason: string): Promise<void>;
}
```

### 2.4 推奨呼び出し順

1. engine snapshot を phase boundary で取得する。
2. repository が generic session summary と workflow payload を同時に更新する。
3. resume 時に latest checkpoint を読む。
4. compatibility evaluator が version / route / hash / lease / revision を判定する。
5. `compatible` / `compatible_with_warning` の場合のみ engine を hydrate する。

### 2.5 エラーハンドリング

| ケース                         | 期待動作                         |
| ------------------------------ | -------------------------------- |
| version mismatch               | `incompatible` を返す            |
| route mismatch                 | `incompatible` を返す            |
| hash mismatch                  | `incompatible` を返す            |
| root relocation only           | `compatible_with_warning` を返す |
| active lease by another writer | `conflict` を返す                |
| revision mismatch              | `conflict` を返す                |
| workflow payload 不在          | graceful reject                  |

### 2.6 設定可能パラメータ / 定数

| 項目               | 推奨値 / 方針                                  |
| ------------------ | ---------------------------------------------- |
| checkpoint history | latest-only を初回方針                         |
| lease TTL          | 数分単位。heartbeat がないなら短め             |
| schema version     | `task-sdk-08-v1` を persisted payload 側で持つ |
| warning code       | root relocation のみを初回導入                 |
| cleanup policy     | generic session cleanup と整合させる           |

### 2.7 非目標

- mid-stream checkpoint
- rewind / fork
- renderer 側 session list UI
- `agent:resumeSession` との統合
