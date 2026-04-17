# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 1                                    |
| タスクID   | TASK-SW-TODO-001                     |
| 機能名     | conversation-round-step-todo-cleanup |
| 前提Phase  | -                                    |
| 後続Phase  | Phase 2                              |
| 作成日     | 2026-04-15                           |
| ステータス | 未実施                               |

## 目的

`ConversationRoundStep.tsx:456` の `TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001)` コメントの現状を確認し、対象タスクの完了状況を把握した上で、受け入れ基準を定義する。

## 実行タスク

- P50チェック: 対象ファイルの現状確認・TODOコメントの存在確認
- `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` タスクの完了状況調査
- `resolveExternalIntegration` の現在の実装状態確認
- `shouldShowMainToolBadge` 関数の実装確認
- 受け入れ基準（AC-1〜AC-3）の定義
- タスク分類の宣言

## 参照資料

| 資料名                    | パス                                                                          | 用途                           |
| ------------------------- | ----------------------------------------------------------------------------- | ------------------------------ |
| ConversationRoundStep.tsx | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | TODOコメント確認               |
| SkillCreateWizard.tsx     | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | resolveExternalIntegration確認 |
| Phase 1 分析書            | `docs/30-workflows/00-task-spec-design-docs/phase-1-analysis.md`              | 問題4の現状分析                |
| docs/30-workflows/        | `docs/30-workflows/` 配下を検索                                               | 対象タスクの完了状況確認       |

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

```bash
# TODOコメントの現状確認
grep -n "UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001\|shouldShowMainToolBadge\|MAIN_TOOL_BADGE_ENABLED" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx

# ConversationRoundStep.tsx の最近のコミット履歴確認
git log --oneline -10 -- apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx

# resolveExternalIntegration の実装確認
grep -n -A 10 "resolveExternalIntegration" \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx | head -40
```

### 1. `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` タスクの完了状況調査

```bash
# docs/30-workflows/ 配下で対象タスクIDを検索
grep -rn "UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001" docs/30-workflows/

# タスク仕様書ディレクトリが存在するか確認
ls docs/30-workflows/ | grep -i "MSO-RESOLVE-EXTERNAL"

# completed-tasks ディレクトリを確認
ls docs/30-workflows/completed-tasks/ 2>/dev/null | grep -i "MSO-RESOLVE-EXTERNAL"
```

### 2. `shouldShowMainToolBadge` 関数の現状確認

Phase 1 分析書より、現在の実装は以下のとおり：

- `:124-135` に `shouldShowMainToolBadge` 関数が定義されている
- `MAIN_TOOL_BADGE_ENABLED = true` フラグが存在する
- `questionKey === "q5"` かつ `selectedOptions.length >= 2` かつ `selectedOptions[0] === optionValue` の場合に `true` を返す

現在の `resolveExternalIntegration`（`SkillCreateWizard.tsx:177-218`）は `q5Answer.selectedOptions[0]` を主ツールとして参照しており、バッジロジックと一致している。

### 3. 受け入れ基準の定義

完了状況の調査結果に応じて以下の2パターンで受け入れ基準が変わる。

**パターンA: `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` が完了済みの場合**

| ID   | 受け入れ基準                                                                     | 検証方法                                                                             |
| ---- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| AC-1 | `ConversationRoundStep.tsx:456` 付近の TODOコメントが削除されていること          | `grep -n "UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001" ConversationRoundStep.tsx` で0件 |
| AC-2 | `MAIN_TOOL_BADGE_ENABLED` フラグが削除または `true` リテラルに置換されていること | コードの整合性確認                                                                   |
| AC-3 | TypeScript 型チェック（`pnpm typecheck`）がエラーなしで通過すること              | `pnpm typecheck` が 0 error                                                          |

**パターンB: `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` が未完了の場合**

| ID   | 受け入れ基準                                                                                          | 検証方法                    |
| ---- | ----------------------------------------------------------------------------------------------------- | --------------------------- |
| AC-1 | TODOコメントが現状に即した内容へ更新されていること（タスクIDへの参照・削除条件を明記）                | コードレビューで確認        |
| AC-2 | `MAIN_TOOL_BADGE_ENABLED` フラグと `shouldShowMainToolBadge` の存在意義がコメントで明示されていること | コードレビューで確認        |
| AC-3 | TypeScript 型チェック（`pnpm typecheck`）がエラーなしで通過すること                                   | `pnpm typecheck` が 0 error |

### 4. タスク分類の宣言

| 分類項目   | 値                               |
| ---------- | -------------------------------- |
| タスク種別 | 技術的負債解消                   |
| UIタスク   | 非UIタスク（コメント変更のみ）   |
| 可視性     | NON_VISUAL（UIの見た目変更なし） |
| テスト種別 | 静的検証（grep / 型チェック）    |

## 統合テスト連携【必須】

| 判定項目   | 基準    | 結果 |
| ---------- | ------- | ---- |
| 型チェック | PASS    | -    |
| lint       | 0 error | -    |

## 多角的チェック観点

| 観点             | チェック内容                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------- |
| 現状機能性       | 現在 `shouldShowMainToolBadge` はUIとして正常機能しており、バグではない                     |
| トレーサビリティ | `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` の完了状況が確認可能か                           |
| 将来リスク       | コメントを放置した場合、`resolveExternalIntegration` 変更時に削除漏れが生じるリスクがあるか |
| 影響範囲         | コメント変更のみのため、実際の動作への影響はない                                            |

## 成果物

| 成果物       | パス                                         | 説明                                   |
| ------------ | -------------------------------------------- | -------------------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 完了状況調査結果・採用パターン・AC一覧 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証可能なAC一覧                       |

## 完了条件

- [ ] P50チェック実施済み（TODOコメントが `ConversationRoundStep.tsx` に存在することを確認）
- [ ] `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` の完了状況が調査済み
- [ ] `resolveExternalIntegration` の現在の実装が確認済み
- [ ] `shouldShowMainToolBadge` 関数の実装が確認済み
- [ ] 採用パターン（A または B）が決定済み
- [ ] AC-1〜AC-3 が検証可能な形で定義されている
- [ ] タスク分類（技術的負債解消 / 非UIタスク / NON_VISUAL）を宣言済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. P50チェック（TODOコメント存在確認・git log確認）
2. `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` 完了状況調査
3. `resolveExternalIntegration` 実装確認
4. `shouldShowMainToolBadge` 実装確認
5. 採用パターン決定（A or B）
6. 受け入れ基準（AC-1〜AC-3）の定義
7. タスク分類の宣言
8. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 2: 設計
