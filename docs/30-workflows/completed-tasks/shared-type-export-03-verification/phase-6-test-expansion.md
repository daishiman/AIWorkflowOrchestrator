# Phase 6: 追加検証テスト

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase番号  | 6                             |
| Phase名    | 追加検証テスト                |
| 目的       | 修正後の網羅的な再検証        |
| 前提Phase  | Phase 5（インポートパス修正） |
| 推定作業量 | 小                            |

---

## 1. 目的

Phase 5で修正を行った場合、その修正が他の部分に影響を与えていないことを確認するための追加検証を実施する。

---

## 2. 実行タスク

### Task 6-1: 関連パッケージの型チェック

#### 目的

修正の影響範囲を確認するため、関連する全パッケージの型チェックを実行する。

#### 検証対象

| パッケージ    | コマンド                                | 理由                       |
| ------------- | --------------------------------------- | -------------------------- |
| @repo/shared  | `pnpm --filter @repo/shared typecheck`  | 修正元パッケージ           |
| @repo/desktop | `pnpm --filter @repo/desktop typecheck` | 主要消費パッケージ         |
| @repo/web     | `pnpm --filter @repo/web typecheck`     | 共有パッケージ使用の可能性 |
| @repo/ui      | `pnpm --filter @repo/ui typecheck`      | 共有パッケージ使用の可能性 |

#### 成果物

| 成果物                 | 配置先                                      |
| ---------------------- | ------------------------------------------- |
| 関連パッケージ検証結果 | `outputs/phase-6/related-packages-check.md` |

#### 完了条件

- [ ] 全関連パッケージの型チェックが実行されている
- [ ] 結果が記録されている
- [ ] 新たなエラーが発生していない

---

### Task 6-2: インポートパス検証

#### 目的

Community型が正しくインポートできることを検証する。

#### 検証内容

```typescript
// 期待されるインポートパターン
import type {
  Community,
  CommunitySummary,
  CommunityDetectionOptions,
  CommunityDetectionResult,
  CommunityStructure,
} from "@repo/shared/services/graph";

import {
  CommunityErrorCode,
  CommunityDetectionError,
} from "@repo/shared/services/graph";
```

#### 確認方法

1. `@repo/desktop`内のインポート文を検索

   ```bash
   grep -r "from.*@repo/shared.*graph" apps/desktop/src/
   ```

2. 各インポートが正しく解決されることを確認

#### 成果物

| 成果物             | 配置先                                   |
| ------------------ | ---------------------------------------- |
| インポート検証結果 | `outputs/phase-6/import-verification.md` |

#### 完了条件

- [ ] 全てのCommunity型インポートが正しく解決される
- [ ] 型エクスポート（export type）と値エクスポート（export）が正しく使い分けられている

---

### Task 6-3: 下位互換性検証

#### 目的

既存のインポートパスが引き続き動作することを確認する。

#### 確認対象

| インポートパス                              | 状態        | 確認方法                         |
| ------------------------------------------- | ----------- | -------------------------------- |
| `from "./types"` (services/graph内部)       | ✅ 継続動作 | services/graph内のファイルを確認 |
| `from "../graph/types"` (他サービス)        | ✅ 継続動作 | 他サービスからの参照を確認       |
| `from "@repo/shared/services/graph"` (新規) | ✅ 新規追加 | 新しいインポートパスの動作確認   |

#### 確認コマンド

```bash
# 内部インポートの確認
grep -r 'from.*"\.\/types"' packages/shared/src/services/graph/

# 相対インポートの確認
grep -r 'from.*"\.\.\/graph\/types"' packages/shared/src/services/
```

#### 成果物

| 成果物             | 配置先                                            |
| ------------------ | ------------------------------------------------- |
| 下位互換性検証結果 | `outputs/phase-6/backward-compatibility-check.md` |

#### 完了条件

- [ ] 既存のインポートパスが引き続き動作する
- [ ] 新しいインポートパスが正しく動作する
- [ ] 下位互換性が維持されている

---

## 3. 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                   |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| モノレポアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | 型エクスポートパターン |

### Phase 5成果物

| 成果物                   | 参照目的         |
| ------------------------ | ---------------- |
| modifications.md         | 修正内容の確認   |
| post-fix-verification.md | 修正後の検証結果 |

---

## 4. 成果物一覧

| 成果物                 | ファイル名                        | 必須 |
| ---------------------- | --------------------------------- | ---- |
| 関連パッケージ検証結果 | `related-packages-check.md`       | ✅   |
| インポート検証結果     | `import-verification.md`          | ✅   |
| 下位互換性検証結果     | `backward-compatibility-check.md` | ✅   |

---

## 5. 完了条件

### 機能要件

- [ ] 全関連パッケージの型チェックがPASS
- [ ] 全てのインポートパスが正しく解決される
- [ ] 下位互換性が維持されている

### 品質要件

- [ ] 新たなエラーが発生していない
- [ ] 既存機能への影響がない
- [ ] 検証結果が正確に記録されている

### Phase完了時の必須アクション

1. 上記成果物を `outputs/phase-6/` に出力
2. artifacts.json の phase-6 ステータスを更新
3. 各タスクを100%実行し、完遂した旨を明記
