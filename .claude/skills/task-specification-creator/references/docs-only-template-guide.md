---
title: docs-only タスク向けガイド
description: コード実装を伴わない docs-only タスクでの Phase 1-13 運用ガイド
created: 2026-04-19
source: TASK-LOGS-ARCHIVE-POLICY-001 skill-feedback-report
---

# docs-only タスク向け Phase 運用ガイド

## Phase 5（実装）の読み替え
docs-only タスクでは「実装」= 対象ドキュメントファイルの作成・更新。
コード変更なし。

## Phase 6〜9（テスト・QA）の読み替え
| Phase | 通常 | docs-only 読み替え |
|-------|------|--------------------|
| 6 | テスト拡充 | 内容整合確認・cross-reference チェック |
| 7 | カバレッジ確認 | インデックス網羅確認（topic-map / quick-reference） |
| 8 | リファクタリング | 500行超過の責務分離・semantic filename 確認 |
| 9 | QA | mirror sync 確認・diff -q ゼロ確認 |

## Phase 11（手動テスト）の読み替え
NON_VISUAL として以下を manual-test-result.md に記録する：
- 対象ファイルの存在確認（ls / Glob）
- 内容整合確認（grep / diff）
- mirror 同期確認（diff -q）
スクリーンショット不要。

## verify_existing モード
既存ファイルが存在する場合は Phase 2〜3 で verify_existing 判定を実施し、
重複実装を防止すること。

## Findings 対応追跡
F-001〜F-NNN で管理し、各 Phase への引き継ぎコメントを付与すること。
