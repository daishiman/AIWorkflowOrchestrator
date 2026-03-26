# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 11                                       |
| 機能名     | UT-SC-02-005-preload-execute-type-update |
| 作成日     | 2026-03-25                               |
| ステータス | PENDING                                  |

---

## 目的

自動テストでカバーしきれない観点（実際のアプリケーション動作・UI挙動）を手動で検証する。
型修正が実際のランタイムに影響を与えないことを確認する。

---

## 参照資料

- `outputs/phase-2/design-document.md`
- `outputs/phase-5/green-state-verification.md`
- `outputs/phase-6/test-expansion-results.md`
- `outputs/phase-8/refactoring-log.md`
- `phase-10-final-review.md`
- `outputs/phase-10/final-review-result.md`
- `outputs/phase-7/coverage-report.md`
- `outputs/phase-9/quality-report.md`
- `docs/30-workflows/completed-tasks/UT-SC-02-005.md`

---

## タスク種別判定

| 項目             | 判定                                          |
| ---------------- | --------------------------------------------- |
| タスク種別       | バグ修正（型修正）                            |
| UI 変更          | 最小限（terminal_handoff の暫定ハンドリング） |
| E2E テスト必要性 | 低（型レベルの修正が主）                      |
| 手動確認の重点   | ランタイムエラー不在の確認                    |

---

## docs-only テンプレ要素

本タスクは型修正が主であるため、以下の docs-only 確認も実施する。

- [ ] SKILL.md から family file へ辿れるか
- [ ] validator command を再実行できるか
  - `pnpm typecheck`
  - `pnpm --filter @repo/desktop test`

---

## 実行タスク

### 手動テストシナリオ

#### シナリオ 1: アプリ起動確認

1. `pnpm --filter @repo/desktop dev` でアプリを起動する
2. アプリが正常に起動し、メイン画面が表示されることを確認する
3. コンソールにランタイムエラーが出力されていないことを確認する

**期待結果**: アプリが正常起動し、エラーなし

#### シナリオ 2: Skill Creator フロー実行

1. Skill Creator 画面に遷移する
2. `planSkill` を実行し、プラン結果が正常に表示されることを確認する
3. `executePlan` を実行し、実行結果が正常に表示されることを確認する
4. コンソールに型関連のエラーやワーニングが出力されていないことを確認する

**期待結果**: planSkill → executePlan フロー全体がエラーなく完了する

#### シナリオ 3: terminal_handoff レスポンスのハンドリング

1. executePlan の結果に `terminal_handoff` 型が含まれるケースを確認する（該当する場合）
2. 型ナロイングにより `terminal_handoff` 分岐で早期リターンし、通常成功パスへ進まないことを確認する
3. UI にクラッシュや不正表示が発生しないことを確認する

**期待結果**: terminal_handoff 型が正しくハンドリングされ、UI が正常動作する

---

### 設計文書ウォークスルー

型定義・インターフェースの整合を grep で確認する。

#### 確認項目

- [ ] `grep -r "RuntimeSkillCreatorExecuteResponse" --include="*.ts" --include="*.tsx"` で型定義の使用箇所を確認
- [ ] `grep -r "executePlan" --include="*.ts" --include="*.tsx"` で executePlan の呼び出し箇所を確認
- [ ] `grep -r "terminal_handoff" --include="*.ts" --include="*.tsx"` で terminal_handoff のハンドリング箇所を確認
- [ ] IPC 3層（Main → Preload → Renderer）の各層で型が一致していることを確認
- [ ] plan / improve / execute の3メソッドで Union 型の扱いが統一されていることを確認

---

### ウォークスルーシナリオ発見事項リアルタイム分類欄

| #   | 発見日時 | 分類                         | 内容             | 影響度              | 対応         | ステータス      |
| --- | -------- | ---------------------------- | ---------------- | ------------------- | ------------ | --------------- |
| 1   | -        | BUG / IMPROVEMENT / QUESTION | （発見時に記入） | HIGH / MEDIUM / LOW | （対応内容） | OPEN / RESOLVED |

**分類定義**:

- **BUG**: 実装上の不具合（修正必須）
- **IMPROVEMENT**: 改善提案（本タスク外で対応可）
- **QUESTION**: 確認が必要な事項

---

## 統合テスト連携【必須】

本 Phase の手動テスト結果は、Phase 12（ドキュメント更新）の記述内容に反映される。

| 連携先 Phase | 連携内容                                         |
| ------------ | ------------------------------------------------ |
| Phase 10     | レビュー結果で PASS / MINOR であることが前提条件 |
| Phase 12     | 手動テストで検出された事項をドキュメントに反映   |

---

## 成果物/実行手順

### 実行手順

1. 手動テストシナリオ 1〜3 を順に実施する
2. 設計文書ウォークスルーで型契約の整合を確認する
3. 発見事項があれば分類テーブルへ記録する
4. 必須成果物と補助成果物を `outputs/phase-11/` に配置する

### 必須成果物

| 成果物             | パス                                     | 内容                                              |
| ------------------ | ---------------------------------------- | ------------------------------------------------- |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md` | 各シナリオの実行結果（PASS / FAIL）               |
| 手動テストレポート | `outputs/phase-11/manual-test-report.md` | テスト実行の詳細レポート                          |
| 発見事項一覧       | `outputs/phase-11/discovered-issues.md`  | ウォークスルーで発見された事項（0件でも出力必須） |

---

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断 | 仕様参照先                                             |
| ------------------ | -------- | ------------------------------------------------------ |
| セキュリティ       | 適用     | `aiworkflow-requirements: security-api-electron.md`    |
| アーキテクチャ     | 適用     | `aiworkflow-requirements: architecture-*.md`           |
| API設計            | 適用     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| エラーハンドリング | 適用     | `aiworkflow-requirements: error-handling.md`           |
| UI/UX              | 非適用   | -                                                      |
| データ整合性       | 非適用   | -                                                      |
| パフォーマンス     | 非適用   | -                                                      |
| アクセシビリティ   | 非適用   | -                                                      |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断 | 仕様参照先                                             |
| -------------------------- | -------- | ------------------------------------------------------ |
| IPC通信                    | 適用     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | 適用     | `aiworkflow-requirements: security-api-electron.md`    |
| フロントエンド（Renderer） | 適用     | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | 非適用   | -                                                      |
| ローカルストレージ         | 非適用   | -                                                      |

---

## 完了条件

- [ ] 全手動テストシナリオを実行した
- [ ] 設計文書ウォークスルーを実施した
- [ ] 発見事項をリアルタイム分類欄に記録した（0件の場合はその旨を記載）
- [ ] 必須成果物 3 ファイルを全て作成した
- [ ] BUG 分類の発見事項が 0 件、または全件対処済みである

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

- [ ] 手動テストシナリオ 1〜3 を全て実行した
- [ ] 設計文書ウォークスルーの確認項目を全て実行した
- [ ] ウォークスルー発見事項テーブルを更新した
- [ ] 必須成果物を所定パスに出力した
- [ ] 完了条件を全て満たした

---

## 次Phase

Phase 12: ドキュメント更新 → `phase-12-documentation.md`
