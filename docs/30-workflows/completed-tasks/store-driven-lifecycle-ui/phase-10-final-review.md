# Phase 10: 最終レビュー

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 10                        |
| タスクID | TASK-10A-F                |
| 機能名   | store-driven-lifecycle-ui |
| 作成日   | 2026-03-08                |

## 目的

Store 駆動統合の実装完了後の多角的品質・整合性検証を行い、PASS/MINOR/MAJOR/CRITICAL の判定を下す。MINOR 指摘は未タスク仕様書に変換する（省略不可）。

## 実行タスク

- Store 駆動統一の完全性検証: 全修正対象ファイルで直接 IPC 呼び出しが排除されていることの最終確認
- P31/P48 防止パターンの準拠検証: 個別セレクタ・`useShallow` 適用の網羅性確認
- 型安全性検証: `any` / `as` / `!` の残存確認
- アクセシビリティ検証: WCAG 2.1 AA 準拠の確認
- TASK-10A-G 回帰観点の網羅性検証: 後続統合テストへの引き渡し観点が定義されていることの確認
- 判定と指摘事項整理: レビュー判定を記録し、MINOR 指摘は未タスク化

## 参照資料

| 資料名           | パス                                                                                                                                         | 説明                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Phase 1 要件定義 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-1-requirements.md`                                                        | FR/NFR/AC 定義             |
| Phase 9 品質検証 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-9-quality-assurance.md`                                                   | Lint/型チェック/テスト結果 |
| タスク実行ルール | `.claude/rules/05-task-execution.md`                                                                                                         | レビュー判定基準           |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`                                                                                                         | P31/P48/P49 対策           |
| 元タスク仕様書   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-044-task-10a-f-store-driven-lifecycle-ui.md` | 完了条件の照合             |

### システム仕様（aiworkflow-requirements）

| 資料名           | パス                                                                                        | 使用目的                       |
| ---------------- | ------------------------------------------------------------------------------------------- | ------------------------------ |
| 状態管理仕様     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Store 設計原則との整合性確認   |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン準拠の最終確認     |
| UI 設計原則      | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | a11y・操作一貫性の最終確認     |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | カバレッジ基準・パフォーマンス |
| タスク運用ルール | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                  | 品質ゲート判定と差戻し条件     |

### 前提 Phase 成果物

| 資料名       | パス                                                                                       | 用途                     |
| ------------ | ------------------------------------------------------------------------------------------ | ------------------------ |
| Phase 2 設計 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-2-design.md`            | 設計方針との最終照合     |
| Phase 5 実装 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-5-implementation.md`    | 実装内容の最終確認       |
| Phase 8 記録 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-8-refactoring.md`       | リファクタリング結果確認 |
| Phase 9 記録 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-9-quality-assurance.md` | 品質検証結果確認         |

## 実行手順

### ステップ 1: 元タスク完了条件の最終照合

元タスク仕様書（task-044）の完了条件を 1 件ずつ検証する。

| 完了条件                                                          | 検証方法                                                 | 結果           |
| ----------------------------------------------------------------- | -------------------------------------------------------- | -------------- |
| CreateWizard/AnalysisView の直接 IPC 依存排除方針が定義されている | Phase 2 設計仕様書に排除方針セクションが存在するか確認   | （実行時記入） |
| Store action 経由の状態遷移が定義されている                       | Phase 2 の状態遷移表（成功/失敗/再試行）が存在するか確認 | （実行時記入） |
| P31 対策が明文化されている                                        | Phase 2 に P31 対策セクションが存在するか確認            | （実行時記入） |
| TASK-10A-G へ引き渡す回帰観点が定義されている                     | Phase 2 に回帰観点テーブルが存在するか確認               | （実行時記入） |
| 本タスクでは実装・コミット・PR を行わないことが明記されている     | 元タスク仕様書のメタ情報に記載があるか確認               | （実行時記入） |

### ステップ 2: Store 駆動統一の完全性検証

修正対象ファイル全 5 件で直接 IPC 呼び出しが排除されていることを最終確認する。

```bash
# 実行コードとしての window.electronAPI.skill.* 呼び出しを検出
grep -rn "window\.electronAPI\.skill\." \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx \
  apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts \
  apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx
```

**期待結果:** 0 件

各ファイルの Store action 経由パターンを確認する。

| ファイル                 | 期待される Store action 経由パターン                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| SkillCreateWizard.tsx    | `useCreateSkill()` で取得した action を呼び出す                                               |
| useSkillAnalysis.ts      | `useAnalyzeSkill()` / `useApplySkillImprovements()` / `useAutoImproveSkill()` を使用する      |
| SkillManagementPanel.tsx | 個別セレクタ経由で状態を取得し、Renderer から `window.electronAPI.skill.*` を直接呼び出さない |

### ステップ 3: P31/P48 防止パターンの最終検証

| チェック項目                           | 検証コマンド/方法                                               | 期待結果              |
| -------------------------------------- | --------------------------------------------------------------- | --------------------- |
| 合成 Store Hook 直接使用               | `grep -rn "useAgentStore()" <修正対象5ファイル>`                | 0 件                  |
| `useEffect` 依存配列に合成 Hook 戻り値 | 修正対象ファイル内の全 `useEffect` を目視確認                   | 0 件                  |
| `.filter()` / `.map()` セレクタ        | `grep -rn "\.filter\|\.map" store/index.ts` で skill 関連を確認 | `useShallow` 適用済み |
| P48 回帰テストの PASS                  | agentSlice-p31-regression テストの結果確認                      | 全 PASS               |

### ステップ 4: 型安全性の最終検証

| チェック項目                      | 検証コマンド                                                 | 期待結果                           |
| --------------------------------- | ------------------------------------------------------------ | ---------------------------------- |
| `any` 型の新規導入                | `grep -n ": any\|as any" <修正対象5ファイル>`                | 0 件                               |
| `as` キャスト残存                 | `grep -n " as " <修正対象5ファイル>`                         | 理由コメント付きの例外のみ         |
| non-null assertion 残存           | `grep -n "\!" <修正対象5ファイル> \| grep -v "!=\|!=="`      | 0 件（P48 準拠）                   |
| `@ts-ignore` / `@ts-expect-error` | `grep -n "@ts-ignore\|@ts-expect-error" <修正対象5ファイル>` | 0 件（理由コメント付きの例外のみ） |

### ステップ 5: アクセシビリティ検証（WCAG 2.1 AA）

| チェック項目                                             | 検証方法                                           | 期待結果                               |
| -------------------------------------------------------- | -------------------------------------------------- | -------------------------------------- |
| ボタンの `disabled` 属性がスクリーンリーダーで認識される | `disabled` 属性が HTML native 属性で設定されている | `aria-disabled` 不要                   |
| ローディング状態の通知                                   | `aria-busy` または `aria-live` が設定されている    | 分析中/改善中に視覚以外で通知          |
| エラーメッセージの関連付け                               | `aria-describedby` でエラー要素と入力を関連付け    | エラー時にスクリーンリーダーで読み上げ |
| キーボード操作                                           | Tab / Enter / Escape で全操作が可能                | フォーカストラップなし                 |
| コントラスト比                                           | ボタン/テキストが 4.5:1 以上                       | 通常テキスト基準を充足                 |

### ステップ 6: TASK-10A-G 回帰観点の網羅性検証

Phase 2 設計仕様書に以下の回帰観点が定義されていることを確認する。

| 回帰観点                                     | Phase 2 での定義有無 | 結果           |
| -------------------------------------------- | -------------------- | -------------- |
| スキル作成後に一覧が同期されること           | 定義済みであること   | （実行時記入） |
| 分析完了後に結果が Store に反映されること    | 定義済みであること   | （実行時記入） |
| 改善適用後に再分析が可能であること           | 定義済みであること   | （実行時記入） |
| エラー発生時に UI が適切な状態に遷移すること | 定義済みであること   | （実行時記入） |
| loading 状態中にボタンが disabled になること | 定義済みであること   | （実行時記入） |

### ステップ 7: レビュー判定

**判定基準（05-task-execution.md 準拠）:**

| 判定     | 条件                                                         | 対応                               |
| -------- | ------------------------------------------------------------ | ---------------------------------- |
| PASS     | 全完了条件充足、品質基準準拠、回帰なし                       | Phase 11 へ進む                    |
| MINOR    | 軽微な改善点あり（機能影響なしでも省略不可）                 | 未タスク仕様書に変換後 Phase 11 へ |
| MAJOR    | 要件未充足または重大な品質問題                               | 影響範囲に応じて Phase 1-5 に戻る  |
| CRITICAL | 根本的な設計問題（Store 駆動統一の方針自体に問題がある場合） | Phase 1 に戻り要件再確認           |

**MAJOR/CRITICAL の具体的な差戻し基準:**

| 問題                                            | 判定     | 差戻し先 |
| ----------------------------------------------- | -------- | -------- |
| `window.electronAPI` の実行コード呼び出しが残存 | MAJOR    | Phase 5  |
| P31 違反（合成 Store Hook の使用）が残存        | MAJOR    | Phase 5  |
| 型エラーが解消されていない                      | MAJOR    | Phase 5  |
| テストが FAIL している                          | MAJOR    | Phase 4  |
| Store action の状態遷移設計に根本的な問題がある | CRITICAL | Phase 1  |
| 直接 IPC 排除方針自体が不適切                   | CRITICAL | Phase 1  |

### ステップ 8: MINOR 指摘の未タスク化（該当する場合）

MINOR 指摘がある場合、以下の 3 ステップを全て実施する（P3 対策）:

1. `docs/30-workflows/skill-import-agent-system/tasks/unassigned-task/` に未タスク指示書を作成
2. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録
3. 関連仕様書に参照リンクを追加

**未タスク化の対象例:**

| 指摘内容                                        | 未タスク ID 例                |
| ----------------------------------------------- | ----------------------------- |
| SkillEditor.tsx にも同パターンの直接 IPC が残存 | UT-FIX-SKILL-EDITOR-STORE-001 |
| a11y の `aria-live` 属性が未設定                | UT-FIX-SKILL-A11Y-001         |
| テストカバレッジが Branch 60% 未満の箇所        | UT-FIX-SKILL-COVERAGE-001     |

## 統合テスト連携（Phase 1-11 は必須）

- 全テストの PASS 結果を最終確認（Phase 9 の結果を参照）
- Store 統合テスト（`*.store-integration.test.tsx`）の結果を最終確認
- agentSlice 関連テスト全件の PASS 結果を最終確認
- TASK-10A-G の回帰テスト観点が Phase 2 設計仕様書に定義済みであることを確認

## 多角的チェック観点

| #   | チェック観点                    | 確認内容                                                         | 結果           |
| --- | ------------------------------- | ---------------------------------------------------------------- | -------------- |
| 1   | Store 駆動統一の完全性          | 修正対象 5 ファイルで直接 IPC 呼び出し 0 件                      | （実行時記入） |
| 2   | P31/P48 防止パターンの準拠      | 合成 Hook 0 件、派生セレクタに `useShallow` 適用済み             | （実行時記入） |
| 3   | 型安全性                        | `any` / `as` / `!` の残存が理由コメント付き例外のみ              | （実行時記入） |
| 4   | アクセシビリティ（WCAG 2.1 AA） | disabled/loading/error 状態がスクリーンリーダーで認識可能        | （実行時記入） |
| 5   | TASK-10A-G 回帰観点の網羅       | 作成後一覧同期・分析結果反映・改善後再分析・エラー遷移・disabled | （実行時記入） |
| 6   | 状態遷移の完全性                | 成功/失敗/再試行の全パスが定義・テスト済み                       | （実行時記入） |
| 7   | テスト網羅性                    | Phase 4-6 の全テスト PASS、カバレッジ基準充足                    | （実行時記入） |
| 8   | 後方互換性                      | 既存の agentSlice 呼び出しパターンが変更されていない             | （実行時記入） |

## 成果物

| 成果物           | パス                                                                                   | 説明           |
| ---------------- | -------------------------------------------------------------------------------------- | -------------- |
| 最終レビュー記録 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-10-final-review.md` | 本ドキュメント |

## 完了条件

- [ ] 元タスク完了条件（task-044）の全 5 項目が充足されていることを確認済み
- [ ] Store 駆動統一の完全性が検証済み（直接 IPC 呼び出し 0 件）
- [ ] P31/P48 防止パターンが全セレクタで準拠していることを確認済み
- [ ] 型安全性が検証済み（`any` / `as` / `!` の不正残存なし）
- [ ] アクセシビリティが WCAG 2.1 AA 基準で検証済み
- [ ] TASK-10A-G 回帰観点が全項目定義済みであることを確認済み
- [ ] 多角的チェック観点の全 8 項目が実施されている
- [ ] レビュー判定（PASS/MINOR/MAJOR/CRITICAL）が記録されている
- [ ] MINOR 指摘がある場合、全て未タスク仕様書に変換済み（省略不可、P3 対策で 3 ステップ完了）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 11: 手動テスト
