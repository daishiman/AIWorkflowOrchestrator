# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 1                                         |
| タスクID   | UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001  |
| 機能名     | skill-wizard/resolve-external-integration |
| 前提Phase  | -                                         |
| 後続Phase  | Phase 2                                   |
| 作成日     | 2026-04-15                                |
| ステータス | pending                                   |

## 目的

`resolveExternalIntegration` の複数ツール並列処理対応の要件を固定する。

## 背景

`skill-wizard-multi-select-options` タスクで Q5 回答型が `selectedOptions: string[]` に変更されたが、
`resolveExternalIntegration` は `selectedOptions[0]` のみを参照している（M-01 TODO）。
この非対称性により、ユーザーが複数の外部ツールを選択しても先頭の1件しか統合情報が取得されないという問題が生じている。

本タスクでは複数ツールを並列で処理できるよう関数シグネチャとロジックを刷新し、M-01 TODO コメントを削除する。
また `UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001`（#2071 完了済み）で追加された「主ツール」バッジを不要にするため、
バッジ表示ロジック（`MAIN_TOOL_BADGE_ENABLED` フラグ・`shouldShowMainToolBadge` 関数）の削除も本タスクのスコープに含む。

本ワークフローは GitHub Issue #2069（CLOSED）に対応する仕様であり、本Phaseではコード実装を行わず要件を固定する。

## 実行タスク

- P50チェック: `resolveExternalIntegration` と `ConversationRoundStep.tsx` の現状確認・既実装 inventory 調査
- carry-over確認: `UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001`（#2071 完了済み）からの引き継ぎ事項（バッジ削除手順）の確認
- 受け入れ基準定義: AC-1〜AC-7 を検証可能な形で固定
- タスク分類宣言: **NON_VISUAL**（Renderer 内部ロジック変更のみ・スクリーンショット証跡不要）

## 参照資料

| 資料名                          | パス                                                                                             | 用途                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| GitHub Issue                    | [#2069](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2069)                         | 要件原本（CLOSED）                                                       |
| resolveExternalIntegration 実装 | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                               | selectedOptions[0] 参照箇所・M-01 TODO コメントの確認                    |
| 対象コンポーネント              | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                    | バッジ削除対象（MAIN_TOOL_BADGE_ENABLED・shouldShowMainToolBadge）の確認 |
| テストファイル                  | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`     | バッジ関連テスト（TC-1〜TC-6）削除対象の確認                             |
| 前タスク仕様書 Phase 1          | `docs/30-workflows/completed-tasks/ut-skill-wizard-mso-main-tool-ui-001/phase-1-requirements.md` | バッジ実装の背景・削除容易性設計の確認                                   |
| 前タスク仕様書 Phase 2          | `docs/30-workflows/completed-tasks/ut-skill-wizard-mso-main-tool-ui-001/phase-2-design.md`       | バッジ削除手順（TODO コメント方針）の確認                                |

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

```bash
# 対象ファイルの最近のコミット履歴確認
git log --oneline -10 -- apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
git log --oneline -10 -- apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx

# resolveExternalIntegration の selectedOptions[0] 参照・M-01 TODO を確認
grep -n "selectedOptions\[0\]\|M-01\|resolveExternalIntegration" \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx

# バッジ実装の現状確認
grep -n "MAIN_TOOL_BADGE_ENABLED\|shouldShowMainToolBadge\|主ツール\|mainToolBadgeId" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx

# テストファイルのバッジ関連テスト確認（TC-1〜TC-6）
grep -n "主ツール\|mainToolBadge\|MAIN_TOOL_BADGE" \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
```

### 1. carry-over確認: 前タスクとの関係

前タスク `UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001`（#2071 完了済み）からの carry-over 内容:

| 項目          | 内容                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------- |
| 発見元        | UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001 Phase 2 設計（AC-4 削除容易性対応方針）                   |
| 削除対象      | `MAIN_TOOL_BADGE_ENABLED` フラグ・`shouldShowMainToolBadge` 関数・バッジ JSX・バッジ関連テスト |
| TODO コメント | `// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001)` が削除の目印として付与されている           |
| 前タスク教訓  | バッジ削除対象は `ConversationRoundStep.tsx` 単一ファイルに局所化されており、削除影響は最小    |

```bash
# TODO コメントの存在確認
grep -rn "UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001" \
  apps/desktop/src/renderer/components/skill/
```

### 2. resolveExternalIntegration の現状確認

```bash
# 関数シグネチャの確認
grep -n "resolveExternalIntegration\|function resolve\|const resolve" \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx

# 呼び出し箇所の確認
grep -n "resolveExternalIntegration(" \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx

# 返り値の型・マージ処理の確認
grep -n "apiEndpoint\|authMethod\|mainOperations\|ExternalIntegration" \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
```

### 3. 受け入れ基準の固定

| ID   | 受け入れ基準                                                                                         | 検証方法                                                                    |
| ---- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| AC-1 | `resolveExternalIntegration` が `string[]` を受け取り、複数ツールを並列で処理できる                  | Vitest テスト: 複数要素の入力で並列処理（Promise.all）されることを確認      |
| AC-2 | 各ツールの統合情報（API エンドポイント・認証方式・主要操作）がそれぞれ取得・マージされる             | Vitest テスト: 返り値に複数ツール分の情報がマージされていることを確認       |
| AC-3 | 単一ツール選択時は従来と同一の動作を維持する（後方互換性）                                           | Vitest テスト: `["toolA"]` 入力で既存と同等の返り値が得られることを確認     |
| AC-4 | 空配列 `[]` や未対応ツールに対して安全にフォールバックする                                           | Vitest テスト: 例外が発生せず空/デフォルト値が返ることを確認                |
| AC-5 | `SkillCreateWizard.tsx` の `resolveExternalIntegration` 呼び出し箇所が複数ツールを渡すよう更新される | コードレビュー: `selectedOptions` 全体が渡されていることを確認              |
| AC-6 | `resolveExternalIntegration` のテストカバレッジが 90% 以上                                           | `pnpm --filter @repo/desktop test --coverage` でカバレッジレポートを確認    |
| AC-7 | `// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001)` コメントが全て削除される                         | `grep -rn "UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001"` で0件であることを確認 |

### 4. タスク分類宣言

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| タスク種別   | 実装タスク                                           |
| UI変更       | なし（バッジ削除は内部ロジック整理に伴う副次的変更） |
| VISUAL分類   | NON_VISUAL（スクリーンショット証跡不要）             |
| Phase 11必須 | 不要                                                 |

## 統合テスト連携【必須】

| 判定項目               | 基準 | 結果 |
| ---------------------- | ---- | ---- |
| ユニットテストLine     | 90%+ | -    |
| ユニットテストBranch   | 80%+ | -    |
| ユニットテストFunction | 90%+ | -    |

## 成果物

| 成果物       | パス                                         | 説明                         |
| ------------ | -------------------------------------------- | ---------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件・AC一覧 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証可能な AC-1〜AC-7 一覧   |

## 完了条件

- [ ] P50チェック実施済み（`resolveExternalIntegration` が `selectedOptions[0]` のみ参照していることを確認）
- [ ] M-01 TODO コメントの存在箇所を特定済み
- [ ] `MAIN_TOOL_BADGE_ENABLED`・`shouldShowMainToolBadge`・バッジ JSX の実装箇所を特定済み
- [ ] テストファイルのバッジ関連テスト（TC-1〜TC-6）の存在を確認済み
- [ ] `// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001)` コメントの存在箇所を特定済み
- [ ] carry-over（前タスク UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001 の削除容易性設計）の内容を確認済み
- [ ] AC-1〜AC-7 が検証可能な形で定義されている
- [ ] タスク分類（**実装タスク / NON_VISUAL**）を宣言済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. P50チェック（resolveExternalIntegration の現状・M-01 TODO・バッジ実装の存在確認）
2. carry-over 確認（前タスク UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001 の引き継ぎ事項）
3. resolveExternalIntegration のシグネチャ・呼び出し箇所の確認
4. バッジ削除対象ファイル・箇所の特定
5. 受け入れ基準（AC-1〜AC-7）の固定
6. タスク分類宣言（NON_VISUAL）
7. 成果物の出力
8. 完了条件の判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 2: 設計
