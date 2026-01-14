# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 11                               |
| Phase名    | 手動テスト検証                   |
| 前提Phase  | Phase 10                         |
| 後続Phase  | Phase 12                         |
| ステータス | 未実施                           |
| 作成日     | 2026-01-14                       |
| 機能名     | shared-type-export-02-main-index |

---

## 目的

実装した型エクスポートが実際のインポートで正しく動作することを手動で確認する。

## 背景

自動テストでは検証が難しい、実際のユースケースでの動作確認を行う。特に、他のパッケージ（`@repo/desktop`）からのインポートが正常に機能することを確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: インポートテスト用ファイルを作成

**目的**: 型インポートの動作を手動で確認する

**実行手順**:

1. 一時的なテストファイルを作成（検証後に削除）:

```typescript
// packages/shared/src/__manual-test-imports__.ts
// このファイルは手動検証後に削除してください

import type {
  Community,
  CommunitySummary,
  StoredEntity,
  CommunityStructure,
  GraphNode,
  GraphEdge,
} from "../index";

import {
  CommunityErrorCode,
  CommunityDetectionError,
  CommunitySummarizationErrorCode,
  CommunitySummarizationError,
  normalizeEntityName,
} from "../index";

// 型チェック: 以下が正常にコンパイルされることを確認
const testCommunityType = (c: Community): string => c.title;
const testSummaryType = (s: CommunitySummary): string => s.summary;
const testEntityType = (e: StoredEntity): string => e.name;

// 値チェック: 以下が実行時に正常に動作することを確認
console.log("CommunityErrorCode exists:", typeof CommunityErrorCode);
console.log("normalizeEntityName works:", normalizeEntityName("Test Entity"));
```

2. 型チェックを実行:

```bash
pnpm --filter @repo/shared typecheck
```

3. エラーがないことを確認

**期待される成果物**:

- インポートテスト成功

---

### タスク2: IDE補完の確認

**目的**: IDEの型補完が正常に動作することを確認する

**実行手順**:

1. VSCodeまたは使用しているIDEで`packages/shared/index.ts`を開く
2. 以下を入力し、補完候補に型が表示されることを確認:
   - `export type { Com` → `Community`, `CommunitySummary`が候補に出る
   - `export { Communit` → `CommunityErrorCode`, `CommunityDetectionError`が候補に出る

3. 補完が正常に動作することを確認

**期待される成果物**:

- IDE補完確認結果

---

### タスク3: 他パッケージからのインポート確認（オプション）

**目的**: `@repo/desktop`からの型インポートが機能することを確認する

**実行手順**:

1. （Part 3で実施予定のため、本Phaseではスキップ可能）
2. 確認する場合は、`apps/desktop`内でインポートを試行:

```typescript
import type { Community, StoredEntity } from "@repo/shared";
```

3. 型チェックが通ることを確認

**期待される成果物**:

- 他パッケージからのインポート確認結果（オプション）

---

### タスク4: 手動テスト結果を出力

**目的**: Phase 11の成果物として手動テスト結果を出力する

**実行手順**:

1. 以下の内容を含むテスト結果を作成:
   - インポートテスト結果
   - IDE補完確認結果
   - 発見事項（あれば）

2. テストファイルを削除:

```bash
rm packages/shared/src/__manual-test-imports__.ts
```

**期待される成果物**:

- 手動テスト結果（`outputs/phase-11/manual-test-result.md`）

---

## 参照資料

| 参照資料     | パス                       | 内容       |
| ------------ | -------------------------- | ---------- |
| 実装ファイル | `packages/shared/index.ts` | テスト対象 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                   |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| モノレポアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | 型エクスポートパターン |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "test"`

---

## 成果物

| 成果物         | パス                                     | 内容       |
| -------------- | ---------------------------------------- | ---------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | テスト結果 |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 11での統合テスト連携

手動統合テスト（UI/API接続）を確認:

- **パッケージ間インポート**: `@repo/shared` → 他パッケージの型インポート
- **IDE連携**: 型補完、型エラー検出が正常に動作すること

---

## 完了条件

- [ ] インポートテストが成功している
- [ ] IDE補完が正常に動作している
- [ ] テストファイルが削除されている
- [ ] 手動テスト結果が出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json`のPhase 11ステータスを更新

---

## 依存関係

- **前提**: Phase 10 が完了していること（PASS判定）
- **後続**: Phase 12 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/shared-type-export-02-main-index/phase-12-documentation.md`
