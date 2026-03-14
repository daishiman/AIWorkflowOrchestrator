# Phase 13 PR作成 - PR サマリ下書き

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| タスクID   | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001 |
| Phase      | 13                                       |
| 作成日     | 2026-03-14                               |
| ステータス | completed                                |

---

## PR タイトル（案）

```
design(runtime): Skill / Agent / Skill Creator の runtime ルーティング統一設計
```

---

## PR 概要

### Summary

1. **RuntimePolicyResolver 設計** — `authMode` と `apiKey` から `RuntimeDecision` を解決する共通エントリーポイントを設計。`integrated_api` / `terminal_handoff` の2分岐を Skill / Agent / Creator 全 surface が統一して利用できる。
2. **TerminalHandoffBundle 設計** — `claude_code` モードまたは API key 不在時にエラーではなく `handoff bundle`（`launcher`, `promptBundle`, `cwd`, `suggestedCommand`, `runbook`）を返す仕様を定義。
3. **UI/UX 状態統一** — execution bar / permission dialog / handoff card / result summary の状態定義とマイクロコピーを統一。internal role（Planner/Executor/Improver）は UI に露出せず job 名で統一。

### 変更の種類

- [x] 設計ドキュメント（実装コード変更なし）
- [ ] 機能追加
- [ ] バグ修正
- [ ] リファクタリング

---

## 影響範囲

### 対象 surface

| Surface            | 変更内容                                                   | 変更種別 |
| ------------------ | ---------------------------------------------------------- | -------- |
| Skill 実行         | `SkillExecutor.execute()` に `runtimeDecision?` 追加       | 設計のみ |
| Agent 実行         | `AgentExecutor.start()` に `runtimeDecision?` 追加         | 設計のみ |
| Skill Creator      | `SkillCreatorService`（Planner/Executor/Improver）設計     | 設計のみ |
| preflight          | `skillExecutionAuthPreflight` を auth-mode 分岐で拡張      | 設計のみ |
| IPC                | `skill:handoff` / `agent:handoff` / `creator:handoff` 追加 | 設計のみ |
| UI（Renderer）     | execution bar / handoff card / permission dialog 状態定義  | 設計のみ |
| Claude CLI surface | terminal handoff の受け口定義                              | 設計のみ |

### 後方互換性

- 既存 IPC チャンネル（`skill:execute`, `agent:query` 等）は変更なし
- `RuntimeDecision` は optional parameter で既存シグネチャを維持
- `SkillExecutor.getApiKey()` は `@deprecated` タグを付与して3段階で移行予定

---

## 成果物一覧

| Phase | 成果物                                                   | 内容                                       |
| ----- | -------------------------------------------------------- | ------------------------------------------ |
| 1     | `outputs/phase-1/requirements-definition.md`             | 現状経路棚卸し・既存保証・新規要件         |
| 1     | `outputs/phase-1/scope-definition.md`                    | IN/OUT scope・制約・受入基準 AC-1〜5       |
| 2     | `outputs/phase-2/design-summary.md`                      | レイヤー設計・RuntimePolicyResolver        |
| 2     | `outputs/phase-2/contract-matrix.md`                     | IPC/state/runtime/security/errorコード契約 |
| 2     | `outputs/phase-2/ui-ux-realization.md`                   | 画面構成・状態定義・マイクロコピー         |
| 3     | `outputs/phase-3/design-review-report.md`                | PASS（MINOR-01）・Phase4承認               |
| 4     | `outputs/phase-4/test-matrix.md`                         | TC-4-01〜TC-4-17 の17テストケース          |
| 5     | `outputs/phase-5/implementation-plan.md`                 | 実装計画（新規3ファイル・DI設計）          |
| 6     | `outputs/phase-6/regression-plan.md`                     | REG-6-01〜REG-6-19 回帰テスト設計          |
| 7     | `outputs/phase-7/coverage-plan.md`                       | カバレッジ目標（新規90%/70%/90%）          |
| 8     | `outputs/phase-8/refactor-plan.md`                       | 責務分離・@deprecated 移行計画             |
| 9     | `outputs/phase-9/qa-checklist.md`                        | 信頼・UX・契約整合チェックリスト           |
| 10    | `outputs/phase-10/final-review-report.md`                | PASS・リリースブロッカーなし               |
| 11    | `outputs/phase-11/manual-test-result.md`                 | 全4TC PASS（設計レビュー方式）             |
| 11    | `outputs/phase-11/screenshot-plan.json`                  | P53準拠・自動化候補登録                    |
| 12    | `outputs/phase-12/implementation-guide.md`               | Part 1（中学生向け）+ Part 2（技術者向け） |
| 12    | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A/1-B/1-C + Step 2 要否判定         |
| 12    | `outputs/phase-12/documentation-changelog.md`            | 17ファイル変更履歴・artifacts整合          |
| 12    | `outputs/phase-12/unassigned-task-detection.md`          | 11件未タスク検出・formalize状況            |
| 12    | `outputs/phase-12/skill-feedback-report.md`              | 改善観点・次回提言                         |
| 12    | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜5 全 completed 確認             |

---

## 受入基準確認

| ID   | 基準                                                                                      | 状態 |
| ---- | ----------------------------------------------------------------------------------------- | ---- |
| AC-1 | runtime と auth-mode の現状経路が Skill / Agent / Creator / Hook / CLI まで整理されている | ✅   |
| AC-2 | 維持すべき preflight と permission 契約が抜き出されている                                 | ✅   |
| AC-3 | 設計スコープ（IN / OUT）が明確に定義されている                                            | ✅   |
| AC-4 | terminal handoff の対象範囲が定義されている                                               | ✅   |
| AC-5 | skill-lifecycle Task03 が参照できる runtime policy interface の必要事項が特定されている   | ✅   |

---

## Test Plan

本タスクは設計専用（実装コード変更なし）のため、通常のテスト実行は対象外。

設計品質の検証方法:

- Phase 3 設計レビュー: PASS（MINOR-01）
- Phase 10 最終レビュー: PASS（リリースブロッカー0件）
- Phase 11 手動テスト: 全4TC PASS（設計ドキュメントレビュー方式、P53準拠）

---

## 後続タスク（実装フェーズ）

本 PR はあくまで**設計ドキュメント**の成果物。以下の実装タスクは後続ワークフローで対応:

| 優先度 | タスク候補                       | 概要                                           |
| ------ | -------------------------------- | ---------------------------------------------- |
| high   | RuntimePolicyResolver 実装       | `src/main/services/runtime/` 新規作成          |
| high   | TerminalHandoffBuilder 実装      | `src/main/services/runtime/` 新規作成          |
| high   | SkillExecutor 拡張               | `runtimeDecision?` + `getApiKey()` @deprecated |
| high   | AgentExecutor 拡張               | `runtimeDecision?` 追加                        |
| high   | skillExecutionAuthPreflight 拡張 | auth-mode 分岐追加                             |
| medium | SkillCreatorService 実装         | Planner/Executor/Improver roles                |
| medium | UI コンポーネント実装            | handoff card / execution bar 状態実装          |
| medium | System spec 7ファイル更新        | workflow-ai-runtime-authmode 等                |

---

## 完了条件

- [x] PR 用の説明素材が揃っている
- [x] 受入基準 AC-1〜AC-5 が全て確認済み
- [x] 全 Phase（1-12）の成果物が `outputs/phase-N/` に出力済み
- [x] 後続実装タスク候補が整理されている
