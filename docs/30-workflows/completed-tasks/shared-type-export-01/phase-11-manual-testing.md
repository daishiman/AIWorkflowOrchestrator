# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 11                    |
| Phase名    | 手動テスト検証        |
| 前提Phase  | Phase 10              |
| 後続Phase  | Phase 12              |
| ステータス | 未実施                |
| 作成日     | 2026-01-13            |
| 機能名     | shared-type-export-01 |

---

## 目的

実環境での動作確認を行い、型エクスポートが実際に使用可能であることを手動で検証する。

## 背景

自動テストだけでは検証できない実環境での動作を確認する。型エクスポートの場合、実際のインポート文が正しく解決されることを確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 型インポート検証

**目的**: 実際のインポート文が正しく動作することを確認する

**実行手順**:

1. 開発環境で新しいTypeScriptファイルを作成
2. `@repo/shared/services/graph` から型をインポート
3. IDEの補完が正しく機能することを確認
4. コンパイルエラーがないことを確認

**検証コード例**:

```typescript
// test-import.ts (一時ファイル)
import type {
  Community,
  CommunitySummary,
  StoredEntity,
  CommunityDetectionOptions,
} from "@repo/shared/services/graph";

import {
  CommunityErrorCode,
  normalizeEntityName,
} from "@repo/shared/services/graph";

// 型が正しくインポートされていることを確認
const checkType = (entity: StoredEntity): void => {
  console.log(entity.name);
};

// enumが正しくインポートされていることを確認
console.log(CommunityErrorCode.NOT_FOUND);

// 関数が正しくインポートされていることを確認
console.log(normalizeEntityName("Test Entity"));
```

**期待される成果物**:

- 手動検証結果（出力: `outputs/phase-11/import-verification.md`）

---

### タスク2: IDE補完確認

**目的**: IDEの型補完が正しく機能することを確認する

**実行手順**:

1. VSCode/Cursorでプロジェクトを開く
2. `import { } from "@repo/shared/services/graph"` を入力
3. 補完候補に全ての型・enum・関数が表示されることを確認
4. スクリーンショットまたはテキストで記録

**確認項目**:

| 項目                                | 確認結果 |
| ----------------------------------- | -------- |
| Community型が補完候補に表示         | -        |
| StoredEntity型が補完候補に表示      | -        |
| CommunityErrorCodeが補完候補に表示  | -        |
| normalizeEntityNameが補完候補に表示 | -        |

**期待される成果物**:

- IDE補完確認結果（出力: `outputs/phase-11/ide-completion.md`）

---

### タスク3: 既存コードとの互換性確認

**目的**: 既存のコードが影響を受けていないことを確認する

**実行手順**:

1. `services/graph/` 内の既存ファイルを確認
2. 既存のインポートが壊れていないことを確認
3. 開発サーバーが正常に起動することを確認

**実行コマンド**:

```bash
# 開発サーバー起動（エラーがないことを確認）
pnpm --filter @repo/shared dev
```

**期待される成果物**:

- 互換性確認結果（出力: `outputs/phase-11/compatibility-check.md`）

---

## 参照資料

| 参照資料       | パス                | 内容         |
| -------------- | ------------------- | ------------ |
| Phase 10成果物 | `outputs/phase-10/` | 最終レビュー |

---

## 成果物

| 成果物         | パス                                      | 内容               |
| -------------- | ----------------------------------------- | ------------------ |
| インポート検証 | `outputs/phase-11/import-verification.md` | 手動インポート確認 |
| IDE補完確認    | `outputs/phase-11/ide-completion.md`      | IDE動作確認        |
| 互換性確認     | `outputs/phase-11/compatibility-check.md` | 既存コード互換性   |

---

## 統合テスト連携（Phase 1〜11は必須）

### 手動統合テスト（UI/API接続）

本タスクは型エクスポートのみのため、UI/API接続テストは該当なし。代わりに:

- 型インポートの手動検証
- IDE補完の動作確認
- 既存コードとの互換性確認

を実施する。

---

## 完了条件

- [ ] 型インポートが正しく動作することを確認
- [ ] IDE補完が正しく機能することを確認
- [ ] 既存コードに影響がないことを確認
- [ ] 開発サーバーが正常に起動することを確認
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` の Phase 11 ステータスを `completed` に更新

---

## 依存関係

- **前提**: Phase 10（最終レビューゲート）が完了していること
- **後続**: Phase 12（ドキュメント更新）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/shared-type-export-01/phase-12-documentation.md`
