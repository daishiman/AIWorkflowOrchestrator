# Phase 10: 最終レビューゲート

## メタ情報

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| フェーズ番号 | 10                                  |
| フェーズ名   | 最終レビューゲート                  |
| カテゴリ     | ゲート                              |
| 機能名       | task-imp-permission-readable-ui-001 |
| タスク名     | PermissionDialog 人間可読UI改善     |
| GitHub Issue | #585                                |
| 作成日       | 2026-01-30                          |
| ステータス   | pending                             |

---

## 目的

Phase 1〜9 の全成果物を総合的にレビューし、リリース品質に達しているかを最終判定する。PASS/MINOR/MAJOR/CRITICAL のいずれかで判定する。

---

## タスク

- Task 1: 要件充足レビュー
  - Phase 1の要件定義書に記載された全要件が実装されているか確認する
  - 未タスク指示書（`task-imp-permission-readable-ui-001.md`）の完了条件チェックリストを全項目確認する
  - GitHub Issue #585 の要件が全て満たされているか確認する

- Task 2: 実装品質レビュー
  - `permissionDescriptions.ts` のコード品質を確認する（可読性、保守性、型安全性）
  - `PermissionDialog.tsx` の変更が既存コードと一貫しているか確認する
  - 10種類以上のツール説明テンプレートが実装されているか確認する
  - デフォルトテンプレートが正常に機能するか確認する

- Task 3: テスト品質レビュー
  - テストカバレッジが基準（Line 80%, Branch 60%, Function 80%）を満たしているか確認する
  - テストケースが要件を網羅しているか確認する
  - エッジケース・セキュリティテストが含まれているか確認する
  - 既存テストが壊れていないか確認する

- Task 4: セキュリティ・アクセシビリティ最終確認
  - XSS防止が確実に実装されているか確認する
  - `dangerouslySetInnerHTML` が不使用であることを確認する
  - ARIA属性が正しく実装されているか確認する
  - キーボード操作が仕様通り動作するか確認する

- Task 5: 全体整合性確認
  - TypeScriptエラー 0件を確認する
  - ESLintエラー 0件を確認する
  - 全テストPASSを確認する
  - 変更ファイル一覧と影響範囲を確認する

---

## 参照資料

| ドキュメント              | パス                                                                       | 説明             |
| ------------------------- | -------------------------------------------------------------------------- | ---------------- |
| Phase 1要件定義書         | `outputs/phase-1/requirements-definition.md`                               | 要件充足確認基準 |
| Phase 2設計書             | `outputs/phase-2/design-document.md`                                       | 設計準拠確認基準 |
| Phase 7カバレッジレポート | `outputs/phase-7/coverage-report.md`                                       | カバレッジ基準   |
| Phase 9品質保証レポート   | `outputs/phase-9/quality-assurance-report.md`                              | 品質チェック結果 |
| 未タスク指示書            | `docs/30-workflows/unassigned-task/task-imp-permission-readable-ui-001.md` | 元タスク完了条件 |

---

## 手順

### Task 1 実行手順

1. Phase 1の要件定義書を読み込み、各要件の実装状況を確認する
2. 未タスク指示書のセクション5「完了条件チェックリスト」を全項目確認する：
   - [ ] Bash, Read, Write, Edit, Glob, Grep等に日本語説明対応
   - [ ] 未定義ツールにデフォルト説明表示
   - [ ] 詳細展開UIが機能する
   - [ ] キーボードでの展開/折りたたみ操作可能
   - [ ] 全テストPASS
   - [ ] TypeScriptエラー0件
   - [ ] ESLintエラー0件
   - [ ] Line Coverage 80%以上維持

### Task 2 実行手順

1. `permissionDescriptions.ts` のソースコードを読み込みレビューする
2. `PermissionDialog.tsx` の変更差分をレビューする
3. コードの一貫性・可読性を評価する

### Task 3 実行手順

1. Phase 7のカバレッジレポートを確認する
2. テストケース一覧を確認し、要件カバレッジを評価する
3. 全テスト実行：
   ```bash
   cd apps/desktop && npx vitest run src/renderer/components/skill/__tests__/
   ```

### Task 4 実行手順

1. セキュリティチェック：
   - `grep -r "dangerouslySetInnerHTML" apps/desktop/src/renderer/components/skill/`
   - XSS対策の実装を確認
2. アクセシビリティチェック：
   - ARIA属性の実装を確認
   - キーボード操作テストの結果を確認

### Task 5 実行手順

1. 品質チェック実行：
   ```bash
   cd apps/desktop && npx tsc --noEmit
   cd apps/desktop && npx eslint src/renderer/components/skill/
   cd apps/desktop && npx vitest run src/renderer/components/skill/__tests__/
   ```
2. 変更ファイル一覧を確認：
   ```bash
   git diff --name-only
   ```

---

## レビューゲート判定基準

| 判定     | 条件                                       | 対応                                                              |
| -------- | ------------------------------------------ | ----------------------------------------------------------------- |
| PASS     | 全要件充足・品質基準達成                   | Phase 11へ進む                                                    |
| MINOR    | 軽微な改善点がある（リリースに影響なし）   | 指摘事項を記録しPhase 11へ進む。MINOR事項は未タスク文書を作成する |
| MAJOR    | 重要な品質問題がある                       | 該当Phaseに差し戻し                                               |
| CRITICAL | セキュリティ・アクセシビリティの深刻な問題 | Phase 2から再検討                                                 |

### MINOR判定時の未タスク文書作成フロー

MINOR判定の場合、以下の手順で未タスク文書を作成する：

1. MINOR判定事項を一覧化する
2. 各事項について `docs/30-workflows/unassigned-task/` 配下に未タスク指示書を作成する
3. 未タスク指示書は `unassigned-task-guidelines.md` のフォーマットに従う
4. 未タスク指示書のファイル名: `task-imp-{feature}-{nnn}.md`
5. Phase 12 Task 4（未タスク検出レポート）でMINOR事項を参照する

---

## 統合テストアクション

| カテゴリ         | 確認内容                               |
| ---------------- | -------------------------------------- |
| 全体整合性       | Phase 1〜9の成果物が一貫しているか確認 |
| セキュリティ     | XSS防止の最終確認                      |
| アクセシビリティ | ARIA属性・キーボード操作の最終確認     |
| テスト品質       | カバレッジ基準の最終確認               |

---

## 成果物

| 成果物名             | パス                                      | 種別     | 説明                   |
| -------------------- | ----------------------------------------- | -------- | ---------------------- |
| 最終レビューレポート | `outputs/phase-10/final-review-report.md` | document | 最終レビュー結果と判定 |

---

## 完了条件

- [ ] 要件充足レビューが実施されている
- [ ] 実装品質レビューが実施されている
- [ ] テスト品質レビューが実施されている
- [ ] セキュリティ・アクセシビリティ最終確認が実施されている
- [ ] 全体整合性確認が実施されている
- [ ] PASS/MINOR/MAJOR/CRITICALのいずれかで判定されている
- [ ] 判定結果がPASSまたはMINOR
- [ ] 成果物 `outputs/phase-10/final-review-report.md` が生成されている

---

## 次のフェーズ

Phase 11: 手動テスト検証 → UIの目視確認・動作確認
