# Phase 13: PR作成

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 13                               |
| Phase名    | PR作成                           |
| 前提Phase  | Phase 12                         |
| 後続Phase  | なし                             |
| ステータス | pending                          |
| 作成日     | 2026-03-05                       |
| 機能名     | task-056a-a-store-slice-baseline |

## 目的

レビュー可能な提出物を整理し、PR実行時の手順とチェック項目を固定する。

## 実行タスク

- PR情報作成: 変更概要、影響範囲、検証結果を整理
- CI確認計画: 実行コマンドと期待結果を記録
- マージ前確認: チェックリストを確定

## 参照資料

| 参照資料         | パス                                        | 内容           |
| ---------------- | ------------------------------------------- | -------------- |
| Phase 1成果物    | `./phase-1-requirements.md`                 | 要件定義       |
| Phase 2成果物    | `./phase-2-design.md`                       | 設計内容       |
| Phase 5成果物    | `./phase-5-implementation.md`               | 実装内容       |
| Phase 6成果物    | `./phase-6-test-expansion.md`               | テスト拡充結果 |
| Phase 7成果物    | `./phase-7-coverage-check.md`               | カバレッジ結果 |
| Phase 8成果物    | `./phase-8-refactoring.md`                  | リファクタ結果 |
| Phase 9成果物    | `./phase-9-quality-assurance.md`            | 品質結果       |
| Phase 10成果物   | `./phase-10-final-review.md`                | 最終判定       |
| Phase 11成果物   | `./phase-11-manual-test.md`                 | 手動検証結果   |
| ドキュメント更新 | `./phase-12-documentation.md`               | 提出物一覧     |
| 親仕様           | `../../task-056a-a-store-slice-baseline.md` | 受け入れ条件   |

## 実行手順

### Step 1: PR下書き作成

- タイトル、要約、テスト結果を記載する。
- 影響範囲をファイル単位で記載する。

### Step 2: CI確認計画

- `pnpm typecheck` と `pnpm test` の結果欄を用意する。
- 失敗時の再実行手順を記載する。

### Step 3: 最終チェック

- 必須成果物の添付確認を行う。
- レビュワー向け確認ポイントを列挙する。

## 成果物

| 成果物         | パス                                  | 内容             |
| -------------- | ------------------------------------- | ---------------- |
| PR情報         | `outputs/phase-13/pr-info.md`         | 提出テンプレート |
| 最終チェック表 | `outputs/phase-13/final-checklist.md` | 提出前確認項目   |

## 完了条件

- [ ] PR情報テンプレートが作成済み
- [ ] CI確認計画が記録済み
- [ ] 提出前チェック表が作成済み
- [ ] 実際のコミットとPR操作はユーザー指示後に実施する方針が明記済み

## 備考

このPhaseは提出手順の定義のみを扱う。実際のコミットとPR作成は本仕様書作成タスクの対象外。
