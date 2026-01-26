# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容            |
| ---------- | --------------- |
| Phase      | 2               |
| Phase名    | 設計            |
| 前提Phase  | Phase 1         |
| 後続Phase  | Phase 3         |
| ステータス | 未実施          |
| 作成日     | 2026-01-25      |
| 機能名     | IPCチャネル定義 |

---

## 目的

TASK-4-1「IPCチャネル定義」の詳細設計を行い、実装方針を確定する。

## 背景

Phase 1で抽出した要件に基づき、`channels.ts`ファイルへの具体的な変更内容を設計する。
既存のコードパターンとの整合性、セキュリティ要件、型安全性を考慮した設計が必要。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: チャネル定数の設計

**目的**: SKILL_CHANNELSオブジェクトの構造を設計する

**実行手順**:

1. 既存の`IPC_CHANNELS`との関係を決定する
   - 選択肢A: `IPC_CHANNELS`内に追加
   - 選択肢B: 別オブジェクト`SKILL_CHANNELS`として定義
2. 命名規則を確定する（例: `SKILL_LIST` vs `SKILL_LIST_ALL`）
3. チャネル値の命名規則を確定する（例: `skill:list` vs `skill:list-all`）
4. グループ分け（ディスカバリー、インポート管理、実行、ストリーミング、権限）を設計する

**期待される成果物**:

- チャネル定数設計書

**設計判断**:

既存コードでは`IPC_CHANNELS`に全チャネルが定義されているため、
同じパターンに従い`IPC_CHANNELS`に追加する方針とする。

既存のスキル関連チャネルとの整合性を考慮:

```typescript
// 既存（維持）
SKILL_LIST_AVAILABLE: "skill:list-available",
SKILL_LIST_IMPORTED: "skill:list-imported",
SKILL_IMPORT: "skill:import",
SKILL_REMOVE: "skill:remove",
// ... 他の既存チャネル

// 新規追加
SKILL_SCAN: "skill:scan",
SKILL_UPDATE: "skill:update",
SKILL_COMPLETE: "skill:complete",
SKILL_ERROR: "skill:error",
SKILL_PERMISSION_REQUEST: "skill:permission:request",
SKILL_PERMISSION_RESPONSE: "skill:permission:response",
```

---

### タスク2: 型定義の設計

**目的**: SkillChannel型の設計を行う

**実行手順**:

1. 既存の`IpcChannel`型パターンを確認する
2. `SkillChannel`型の定義方法を決定する
3. 型のエクスポート方法を設計する

**期待される成果物**:

- 型定義設計書

**設計案**:

```typescript
// 既存パターンに従う
export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

// 新規追加（オプション: スキル専用型が必要な場合）
export type SkillChannel =
  | typeof IPC_CHANNELS.SKILL_LIST_AVAILABLE
  | typeof IPC_CHANNELS.SKILL_LIST_IMPORTED;
// ... その他のスキルチャネル
```

---

### タスク3: ホワイトリスト登録の設計

**目的**: ALLOWED_INVOKE_CHANNELSとALLOWED_ON_CHANNELSへの登録を設計する

**実行手順**:

1. 各チャネルの通信方向を確認する
2. Renderer→Main（invoke）チャネルを特定する
3. Main→Renderer（on）チャネルを特定する
4. 登録位置（既存コメントグループとの整合性）を決定する

**期待される成果物**:

- ホワイトリスト登録設計書

**設計案**:

```typescript
// ALLOWED_INVOKE_CHANNELS に追加（R→M）
IPC_CHANNELS.SKILL_SCAN,             // 新規
IPC_CHANNELS.SKILL_UPDATE,           // 新規
IPC_CHANNELS.SKILL_PERMISSION_RESPONSE, // 新規

// ALLOWED_ON_CHANNELS に追加（M→R）
IPC_CHANNELS.SKILL_COMPLETE,         // 新規
IPC_CHANNELS.SKILL_ERROR,            // 新規
IPC_CHANNELS.SKILL_PERMISSION_REQUEST, // 新規
```

---

### タスク4: 設計書の作成

**目的**: 設計内容を文書化する

**実行手順**:

1. チャネル定数設計を文書化する
2. 型定義設計を文書化する
3. ホワイトリスト設計を文書化する
4. 既存コードへの影響範囲を明記する

**期待される成果物**:

- 設計書（outputs/phase-2/design.md）

---

## 参照資料

| 参照資料            | パス                                                                         | 内容                     |
| ------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| Phase 1成果物       | `outputs/phase-1/requirements.md`                                            | 要件定義書               |
| 既存チャネル定義    | `apps/desktop/src/preload/channels.ts`                                       | 現行コード               |
| IPC通信セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | セキュリティガイドライン |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                         | 内容                     |
| ------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| IPC通信セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | ホワイトリスト方式の詳細 |

---

## 成果物

| 成果物 | パス                        | 内容                                 |
| ------ | --------------------------- | ------------------------------------ |
| 設計書 | `outputs/phase-2/design.md` | チャネル定数、型、ホワイトリスト設計 |

---

## 統合テスト連携（Phase 1〜11は必須）

本Phaseは設計フェーズのため、統合テストの直接的な連携はなし。
設計書に以下を含めること:

- 型チェックによる検証方針
- 静的解析による検証方針

---

## 完了条件

- [ ] チャネル定数の構造を設計した
- [ ] 型定義の方法を設計した
- [ ] ホワイトリスト登録を設計した
- [ ] 設計書を作成した
- [ ] 既存コードへの影響範囲を明確にした

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-4-1-ipc-channels/phase-3-design-review.md`
