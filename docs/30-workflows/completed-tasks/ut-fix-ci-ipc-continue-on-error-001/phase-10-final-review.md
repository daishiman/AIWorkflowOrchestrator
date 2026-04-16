# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 10                                  |
| Phase名    | 最終レビューゲート                  |
| 前提Phase  | Phase 9                             |
| 後続Phase  | Phase 11                            |
| ステータス | 完了                                |
| 作成日     | 2026-04-16                          |
| 機能名     | ut-fix-ci-ipc-continue-on-error-001 |

---

## 目的

Phase 1〜9 で実施した全作業（要件定義・設計・実装・テスト・品質保証）を総括し、
Issue #2196 の受け入れ条件と突き合わせて最終的な判定を行う。
PASS と判定されれば Phase 11（手動テスト）へ進む。

## 背景

- Phase 9（品質保証）で CI 必須ジョブ GREEN と `coverage` 条件付き実行を確認済みの状態でこの Phase に入る
- `continue-on-error: true` の削除が意図通りに機能し、IPC 違反がブロックされることを
  最終的に人間の目でレビューする必要がある
- 本 Phase はゲートとして機能し、問題の深刻度に応じて適切な Phase へ差し戻す

---

## 実行タスク

### タスク1: Issue #2196 受け入れ条件の最終確認

**目的**: 実装結果が Issue #2196 に記載された受け入れ条件を全て満たしていることを確認する

**実行手順**:

1. GitHub の Issue #2196 を開き、受け入れ条件を一覧化する
2. 以下の観点でチェックリストを埋める
   - `.github/workflows/ci.yml` の `verify-ipc-4layer` ジョブに `continue-on-error: true` が存在しないこと
   - ローカルで `node scripts/verify-ipc-4layer.cjs` を実行し Rule-1/2/3 が全 PASS であること
   - CI `verify-ipc-4layer` ジョブが GREEN であること
   - IPC 違反を含む変更を混入させた場合に CI がブロックすること（設計上の確認）
3. 各条件の PASS/FAIL を記録する

**期待される成果物**:

- 受け入れ条件チェックリスト（本 Phase 内で確認・記録）

---

### タスク2: 実装成果物の最終レビュー

**目的**: 変更差分（`.github/workflows/ci.yml`）が意図通りであることをレビューする

**実行手順**:

1. `git diff main -- .github/workflows/ci.yml` を実行し、削除行が `continue-on-error: true` のみであることを確認する
2. `verify-ipc-4layer` ジョブの他のステップや設定に意図しない変更がないことを確認する
3. 追加・変更されたファイルが想定範囲（`ci.yml` のみ）であることを確認する

**期待される成果物**:

- 差分確認結果の記録

---

### タスク3: レビューゲート判定

**目的**: 上記タスク 1・2 の結果を総合し、PASS/MINOR/MAJOR/CRITICAL の判定を行う

**実行手順**:

1. 以下の判定基準に従い、総合判定を決定する
2. 判定結果と根拠を記録する
3. 判定に応じた次のアクションを実行する

**判定基準**:

| 判定     | 条件                                                                   | 次のアクション                      |
| -------- | ---------------------------------------------------------------------- | ----------------------------------- |
| PASS     | 全レビュー観点で問題なし                                               | Phase 11 へ進行                     |
| MINOR    | 軽微な指摘あり（ドキュメントの誤字など実装に影響しない問題）           | 指摘対応後、Phase 11 へ             |
| MAJOR    | 重大な問題あり（CI 設定に不備、テストの欠落、設計との乖離など）        | 影響範囲に応じて Phase 8 へ差し戻し |
| CRITICAL | 致命的な問題あり（IPC 違反がブロックされない、要件の根本的な誤解など） | Phase 1 へ戻りユーザー確認          |

**レビューゲート表**:

| 判定     | 条件                     | 次のアクション              |
| -------- | ------------------------ | --------------------------- |
| PASS     | 全レビュー観点で問題なし | Phase 11 へ進行             |
| MINOR    | 軽微な指摘あり           | 指摘対応後、Phase 11 へ     |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて Phase 8 へ |
| CRITICAL | 致命的な問題あり         | Phase 1 へ戻りユーザー確認  |

**期待される成果物**:

- 最終判定結果（PASS/MINOR/MAJOR/CRITICAL）と根拠の記録

---

### タスク4: レビュー観点チェックリスト

**目的**: 網羅的なレビューを実施するためのチェックリストを確認する

**実行手順**:

1. 以下のレビュー観点チェックリストを順に確認する
2. 全項目に PASS/FAIL/N/A を記録する

**レビュー観点チェックリスト**:

#### 実装観点

- [ ] `continue-on-error: true` が `verify-ipc-4layer` ジョブから削除されている
- [ ] 削除以外の意図しない変更がない
- [ ] `ci.yml` のシンタックスが正常である（YAML 構文エラーなし）

#### 機能観点

- [ ] `node scripts/verify-ipc-4layer.cjs` がローカルで Rule-1/2/3 全 PASS
- [ ] CI `verify-ipc-4layer` ジョブが GREEN
- [ ] CI 必須ジョブ（build を含む）が GREEN
- [ ] `security` ジョブが GREEN
- [ ] `coverage` ジョブが `push` の `main` でのみ success、`pull_request` では skipped である

#### 品質観点

- [ ] Phase 9 の品質保証が完了している
- [ ] 既知の IPC 違反が全て解消されている（前提タスクの完了確認）
- [ ] CI 実行ログに警告・エラーが残存していない

#### セキュリティ・安全性観点

- [ ] `continue-on-error` 削除によって CI パイプラインが過度に脆弱になっていない
- [ ] 将来の IPC 違反がこのジョブによって確実にブロックされる設計になっている

**期待される成果物**:

- チェックリスト全項目の確認結果

---

## 参照資料

| 参照資料                 | パス                                                                                 | 内容                    |
| ------------------------ | ------------------------------------------------------------------------------------ | ----------------------- |
| CI ワークフロー定義      | `.github/workflows/ci.yml`                                                           | 実装対象ファイル        |
| IPC 整合性検証スクリプト | `scripts/verify-ipc-4layer.cjs`                                                      | Rule-1/2/3 検証ロジック |
| 元タスク指示書           | `docs/30-workflows/unassigned-task/task-ipc-4layer-ci-continue-on-error-removal.md`  | 元の指示・背景          |
| GitHub Issue             | https://github.com/daishiman/AIWorkflowOrchestrator/issues/2196                      | 受け入れ条件の正本      |
| タスク仕様書 index       | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/index.md`                     | 全 Phase サマリー       |
| Phase 9 品質保証仕様書   | `docs/30-workflows/ut-fix-ci-ipc-continue-on-error-001/phase-9-quality-assurance.md` | 直前 Phase の完了状態   |

---

## 成果物

| 成果物           | パス                                      | 内容                         |
| ---------------- | ----------------------------------------- | ---------------------------- |
| 最終レビュー結果 | `outputs/phase-10/`（Phase 実行時に生成） | 判定結果・チェックリスト記録 |

---

## 統合テスト連携

CI 実行結果（`verify-ipc-4layer` ジョブの GREEN 確認）を本 Phase のレビュー観点として使用する。
Phase 9 で確認した CI 必須ジョブ GREEN と `coverage` 条件付き実行のエビデンスを本 Phase の判断材料とする。

---

## 完了条件

- [ ] Issue #2196 の全受け入れ条件を確認し、結果を記録している
- [ ] `continue-on-error: true` が削除されていることを差分で確認した
- [ ] `verify-ipc-4layer` ジョブが GREEN であることを確認した
- [ ] CI 必須ジョブ（build を含む）が GREEN であることを確認した
- [ ] `security` ジョブが GREEN であることを確認した
- [ ] `coverage` ジョブが `push` の `main` では success、`pull_request` では skipped であることを確認した
- [ ] IPC Rule-1/2/3 が全 PASS であることを確認した
- [ ] レビューゲート判定（PASS/MINOR/MAJOR/CRITICAL）を決定した
- [ ] PASS または MINOR の場合、Phase 11 へ進む準備ができている

---

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスク（タスク1〜4）を 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] レビューゲート判定結果を明記し、次 Phase への進行可否を確定

---

## 依存関係

- **前提**: Phase 9 が完了していること（CI 必須ジョブ GREEN と `coverage` 条件付き実行を確認済み）
- **後続**: Phase 11（手動テスト）へ進む
