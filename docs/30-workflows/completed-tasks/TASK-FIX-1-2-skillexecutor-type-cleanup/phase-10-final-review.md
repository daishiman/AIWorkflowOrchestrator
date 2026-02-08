# Phase 10: 最終レビューゲート

## メタ情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| Phase    | 10                                        |
| タスクID | TASK-FIX-1-2-SKILLEXECUTOR-TYPE-CLEANUP   |
| タスク名 | SkillExecutor内の重複型定義を共有型に統一 |
| 機能名   | skillexecutor-type-cleanup                |
| 分類     | リファクタリング                          |
| 作成日   | 2026-02-07                                |

## 目的

リファクタリング完了後、全体的な品質・整合性を検証し、手動テストフェーズへの移行可否を判定する。

## 判定基準

| 判定     | 条件             | 対応                                      |
| -------- | ---------------- | ----------------------------------------- |
| PASS     | 全観点で問題なし | Phase 11へ進行                            |
| MINOR    | 軽微な指摘あり   | 未完了タスクとして記録後Phase 11へ進行    |
| MAJOR    | 重大な問題あり   | 影響範囲に応じて戻り先を決定（Phase 5-8） |
| CRITICAL | 致命的な問題あり | Phase 1へ戻りユーザーと要件を再確認       |

## レビュー観点

### 1. 要件充足性

| チェック項目                          | 基準               | 結果     |
| ------------------------------------- | ------------------ | -------- |
| ローカル型定義6つが削除されている     | 全6つ削除          | [ ] PASS |
| @repo/shared の共有型に統一されている | import文が更新済み | [ ] PASS |
| 動作に変更がない                      | 全テスト成功       | [ ] PASS |

### 2. 型安全性（本タスク重点項目）

| チェック項目                      | 基準           | 結果     |
| --------------------------------- | -------------- | -------- |
| `as any` 型アサーション           | 増加なし       | [ ] PASS |
| `as unknown` 型アサーション       | 増加なし       | [ ] PASS |
| `@ts-ignore` / `@ts-expect-error` | 増加なし       | [ ] PASS |
| TypeScript strict mode            | 全ファイル通過 | [ ] PASS |

### 3. コード品質

| チェック項目          | 基準         | 結果     |
| --------------------- | ------------ | -------- |
| ESLint エラー         | 0件          | [ ] PASS |
| Prettier フォーマット | 差分なし     | [ ] PASS |
| 未使用 import         | 0件          | [ ] PASS |
| コード重複            | 新規発生なし | [ ] PASS |

### 4. テスト品質

| チェック項目   | 基準                     | 結果     |
| -------------- | ------------------------ | -------- |
| ユニットテスト | 全件 PASS                | [ ] PASS |
| 統合テスト     | 全件 PASS                | [ ] PASS |
| カバレッジ維持 | ベースラインから低下なし | [ ] PASS |

### 5. アーキテクチャ整合性

| チェック項目     | 基準                     | 結果     |
| ---------------- | ------------------------ | -------- |
| モノレポ構造準拠 | apps → packages 依存のみ | [ ] PASS |
| 共有型の配置     | packages/shared に配置   | [ ] PASS |
| 循環依存         | 発生なし                 | [ ] PASS |

## 参照資料

| 資料名               | パス                                         | 説明          |
| -------------------- | -------------------------------------------- | ------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 設計書               | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`         | Phase 8成果物 |
| 品質レポート         | `outputs/phase-9/quality-report.md`          | Phase 9成果物 |

## 実行手順

### ステップ1: 変更差分の確認

```bash
# 変更されたファイルの確認
git diff --name-only HEAD~N  # N = コミット数

# 型定義関連の変更確認
git diff HEAD~N -- 'apps/desktop/src/main/skills/SkillExecutor.ts'
git diff HEAD~N -- 'packages/shared/src/types/'
```

### ステップ2: 要件充足性の確認

1. SkillExecutor.ts 内のローカル型定義が削除されていることを確認
2. @repo/shared への import が正しく設定されていることを確認
3. 型の使用箇所で互換性が保たれていることを確認

### ステップ3: 型安全性の確認

```bash
# 型アサーションの差分確認
git diff HEAD~N -- '*.ts' | grep -c "as any\|as unknown" || echo "0"

# TypeScript型チェック
pnpm typecheck
```

### ステップ4: コード品質の確認

```bash
# ESLint
pnpm lint

# Prettier
pnpm format:check
```

### ステップ5: テストの確認

```bash
# 全テスト実行
pnpm test

# カバレッジ確認
pnpm test:coverage
```

### ステップ6: レビュー判定

上記チェック項目すべてを確認し、判定を行う。

## 統合テスト連携【必須】

最終レビューで統合テスト結果を確認:

| レビュー項目 | 確認内容                    | 結果     |
| ------------ | --------------------------- | -------- |
| 全テスト結果 | ユニット/統合テスト全て成功 | [ ] PASS |
| カバレッジ   | 基準達成（維持）            | [ ] PASS |
| 型チェック   | TypeScript strict mode 通過 | [ ] PASS |
| 静的解析     | ESLint/Prettier 通過        | [ ] PASS |

## MINOR判定時の対応【重要】

MINOR判定の場合、以下の手順で未タスクを記録する:

1. 指摘事項を未タスク仕様書として記録
2. `docs/30-workflows/unassigned-task/` に指示書を作成
3. `task-workflow.md` の残課題テーブルに登録
4. 関連仕様書に参照リンクを追加

**注意**: MINOR指摘は「機能影響なし」でも省略不可。

## 成果物

| 成果物           | パス                                      | 説明            |
| ---------------- | ----------------------------------------- | --------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | 判定結果と詳細  |
| 指摘事項一覧     | `outputs/phase-10/review-findings.md`     | 発見した問題点  |
| 未タスク仕様書   | `outputs/phase-10/minor-issues.md`        | MINOR指摘の記録 |

## 完了条件

- [ ] 全レビュー観点で確認完了
- [ ] 判定結果が記録されている（PASS/MINOR/MAJOR/CRITICAL）
- [ ] MINOR指摘がある場合、未タスク仕様書が作成されている
- [ ] 統合テスト結果が確認されている
- [ ] 最終レビュー結果が `outputs/phase-10/` に出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## レビュー結果テンプレート

```markdown
# 最終レビュー結果

## 判定: {{PASS/MINOR/MAJOR/CRITICAL}}

## レビュー実施日: {{DATE}}

## レビュー観点別結果

### 要件充足性

- 結果: {{PASS/FAIL}}
- 詳細: {{DETAILS}}

### 型安全性

- 結果: {{PASS/FAIL}}
- 詳細: {{DETAILS}}

### コード品質

- 結果: {{PASS/FAIL}}
- 詳細: {{DETAILS}}

### テスト品質

- 結果: {{PASS/FAIL}}
- 詳細: {{DETAILS}}

### アーキテクチャ整合性

- 結果: {{PASS/FAIL}}
- 詳細: {{DETAILS}}

## 指摘事項

### MINOR指摘

1. {{ISSUE_1}}
2. {{ISSUE_2}}

### 対応方針

{{ACTION_PLAN}}

## 次Phase移行可否

{{YES/NO}} - {{REASON}}
```

## サブタスク管理

Phase実行開始時に、以下のサブタスクを順次実行すること:

1. 参照資料の確認
2. 変更差分の確認
3. 各レビュー観点の確認（5観点）
4. 統合テスト結果の確認
5. レビュー判定の実施
6. 成果物の作成・配置
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに完了を記録すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-FIX-1-2-skillexecutor-type-cleanup --phase 10
```

## 次のPhase

Phase 11: 手動テスト検証
