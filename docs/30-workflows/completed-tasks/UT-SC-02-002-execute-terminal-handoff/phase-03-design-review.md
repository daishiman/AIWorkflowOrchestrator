# Phase 3: 設計レビュー

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 3                                     |
| タスクID | UT-SC-02-002                          |
| 機能名   | UT-SC-02-002-execute-terminal-handoff |
| 作成日   | 2026-03-23                            |

## 目的

Phase 1（要件定義）と Phase 2（設計）の妥当性を検証し、Phase 4 へ進めるかを判定する。

## 実行タスク

1. 要件と設計の整合性を検証する
2. セキュリティ観点のレビューを行う
3. 既存パターンとの一貫性を確認する
4. ゲート判定を行う

## 参照資料

- `docs/30-workflows/UT-SC-02-002-execute-terminal-handoff/phase-01-requirements.md`
- `docs/30-workflows/UT-SC-02-002-execute-terminal-handoff/phase-02-design.md`
- `.claude/rules/04-electron-security.md`（セキュリティルール）
- `.claude/rules/02-code-quality.md`（コード品質ルール）

## 実行手順

### 1. 要件⇔設計の整合性

| AC   | 設計で対応されているか                                                                             | 判定 |
| ---- | -------------------------------------------------------------------------------------------------- | ---- |
| AC-1 | `execute()` に `if (decision.type === "terminal_handoff")` 分岐追加で SkillExecutor 呼び出しを回避 | PASS |
| AC-2 | `{ type: "terminal_handoff", bundle }` を返却する設計                                              | PASS |
| AC-3 | `RuntimeSkillCreatorExecuteResponse` Union型が plan/improve と同一パターンで設計                   | PASS |
| AC-4 | `void decision;` を除去し、`decision` を分岐条件で使用                                             | PASS |
| AC-5 | `integrated_api` パスの既存コードを変更しない設計                                                  | PASS |
| AC-6 | テスト設計で `buildSpy` の引数検証を含む                                                           | PASS |

### 2. セキュリティ観点

| チェック項目                                      | 結果 | 備考                                                   |
| ------------------------------------------------- | ---- | ------------------------------------------------------ |
| terminal_handoff 時に認証不要な処理が実行されない | PASS | 早期リターンにより SkillExecutor が呼ばれない          |
| P62 準拠（DEFAULT_CONFIG fallback なし）          | PASS | fallback ではなく terminal_handoff を返す設計          |
| IPC レスポンスに内部情報が漏洩しない              | PASS | TerminalHandoffBundle のフィールドは公開可能な情報のみ |

### 3. 既存パターンとの一貫性

| 比較項目               | plan()               | improve()            | execute()（設計後）  | 判定 |
| ---------------------- | -------------------- | -------------------- | -------------------- | ---- |
| terminal_handoff 分岐  | `if (decision.type)` | `if (decision.type)` | `if (decision.type)` | PASS |
| 戻り値 Union型         | `PlanResponse`       | `ImproveResponse`    | `ExecuteResponse`    | PASS |
| handoffBuilder.build() | 使用                 | 使用                 | 使用                 | PASS |
| integrated_api パス    | 分岐後に実行         | 分岐後に実行         | 分岐後に実行         | PASS |

### 4. テスト設計の妥当性

| チェック項目                                        | 結果 | 備考                                            |
| --------------------------------------------------- | ---- | ----------------------------------------------- |
| 既存テストの矛盾（L207-246）が解消されている        | PASS | terminal_handoff テストとエラー変換テストに分割 |
| terminal_handoff テストが plan/improve と同パターン | PASS | 同じ spy パターンを使用                         |
| integrated_api パスの既存テストが維持される         | PASS | 1番目のテスト（L163-206）は変更不要             |

## レビュー指摘

### MINOR 指摘

1. **execute() の terminal_handoff 時のプロンプト文言**: `plan()` は `"Skill を作成してください: ${skillSpec}"`、`improve()` は `"スキル "${skillName}" を改善してください: ${feedback}"` と具体的だが、`execute()` の設計では `planResult.skillSpec` から先頭50文字を抽出する。プロンプト文言が3メソッド間で一貫したフォーマットかを Phase 5 実装時に確認すること。

### 対応方針

MINOR 指摘は Phase 5 実装時に確認し、必要に応じて調整する。ブロッカーではないため Phase 4 に進む。

## ゲート判定

| 判定 | 理由                                                                       |
| ---- | -------------------------------------------------------------------------- |
| PASS | 全 AC が設計でカバーされ、セキュリティ・一貫性・テスト設計のレビューを通過 |

**→ Phase 4 へ進む**

## 多角的チェック観点

| 観点               | 適用判断                          | 確認内容                                         |
| ------------------ | --------------------------------- | ------------------------------------------------ |
| セキュリティ       | terminal_handoff でのセキュリティ | SkillExecutor 非呼び出しの保証                   |
| アーキテクチャ     | 3メソッドのパターン統一           | plan/improve/execute の分岐パターンの一貫性      |
| エラーハンドリング | Optional chaining の安全性        | `response.error?.message` 等の null 安全パターン |

## 統合テスト連携

- Phase 3 ではレビューのみ。統合テストの実行は Phase 4 以降で実施する。

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## 成果物

| 成果物           | パス                                      | 説明         |
| ---------------- | ----------------------------------------- | ------------ |
| 設計レビュー報告 | `phase-03-design-review.md`（本ファイル） | レビュー結果 |
| レビューレポート | `outputs/phase-3/design-review-report.md` | レビュー詳細 |

## 完了条件

- [x] 全 AC（AC-1〜AC-6）が設計で対応されていることを確認
- [x] セキュリティ観点のレビューが完了
- [x] 既存パターンとの一貫性が確認されている
- [x] テスト設計の妥当性が確認されている
- [x] ゲート判定が PASS
- [x] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている

## 次のPhase

Phase 4: テスト作成
