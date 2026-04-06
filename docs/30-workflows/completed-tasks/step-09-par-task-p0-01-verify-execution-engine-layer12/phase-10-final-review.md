# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 値                                                                           |
| ---------- | ---------------------------------------------------------------------------- |
| Phase番号  | 10                                                                           |
| Phase名    | 最終レビューゲート                                                           |
| 対象タスク | TASK-P0-01: verify 実行エンジン（Layer 1/2 コア + Layer 3/4 互換）の仕様整合 |
| 関連Issue  | #1886                                                                        |
| タスク種別 | バックエンド Main Process 実装（UI変更なし、IPC変更なし）                    |
| 実施者     | Claude Code                                                                  |

## 目的

実装完了後、全体的な品質・整合性を検証する。  
本Phaseでは AC（受け入れ基準）全達成・設計原則遵守・型契約整合・スコープ外変更の有無を包括的にレビューし、PASS/MINOR/MAJOR/CRITICAL の判定を下す。

## 実行タスク

### Task 10-1: AC（受け入れ基準）全達成確認

以下の AC-1 〜 AC-10 をすべて満たしていることを確認する。

| AC番号 | 内容                                                                                               | 判定 |
| ------ | -------------------------------------------------------------------------------------------------- | ---- |
| AC-1   | `SkillCreatorVerificationEngine` クラスが実装されている                                            | -    |
| AC-2   | Layer 1 チェック（ディレクトリ構造・必須ファイル存在確認）が実装されている                         | -    |
| AC-3   | Layer 2 チェック（SKILL.md セクション構造検証）が実装されている                                    | -    |
| AC-4   | `RuntimeSkillCreatorVerifyCheck` 型が `packages/shared/src/types/skillCreator.ts` に定義されている | -    |
| AC-5   | `RuntimeSkillCreatorFacade` に `verificationEngine` が注入・統合されている                         | -    |
| AC-6   | 全ユニットテストが PASS している                                                                   | -    |
| AC-7   | テストカバレッジ ≥ 80% を達成している                                                              | -    |
| AC-8   | IPC 変更が含まれていない                                                                           | -    |
| AC-9   | UI 変更が含まれていない                                                                            | -    |
| AC-10  | `any` 型が実装ファイルに存在しない                                                                 | -    |

### Task 10-2: 独立モジュール設計原則の遵守確認

- `SkillCreatorVerificationEngine` が他のサービスに依存していないこと
- 依存は抽象インターフェースのみであること
- `RuntimeSkillCreatorFacade` を介した統合パターンが正しく実装されていること

### Task 10-3: P0-02 との型契約整合確認

- 後続タスク TASK-P0-02（閉ループ）が消費する型（`RuntimeSkillCreatorVerifyCheck` 等）が正しく定義されていること
- 型の破壊的変更が含まれていないこと
- `RuntimeSkillCreatorVerifyCheck.layer` が current facts の 4-layer 互換を維持していること
- 型エクスポートが `packages/shared/src/types/skillCreator.ts` から行われていること

### Task 10-4: skill-fixture-runner との役割分担確認

- `SkillCreatorVerificationEngine` の責務がスキルフィクスチャ検証（`skill-fixture-runner`）と重複していないこと
- Layer 1/2 コアと current facts の Layer 3/4 互換チェックが skill-fixture-runner のチェックとの役割分担で明確であること
- 境界が曖昧な場合は `outputs/phase-10/final-review-result.md` に記録する

### Task 10-5: スコープ外変更の有無確認

以下のファイルが変更されていないことを確認する。

- IPC チャンネル定義ファイル（`packages/shared/src/ipc/channels.ts` 等）
- Preload スクリプト（`apps/desktop/src/preload/` 配下）
- UI コンポーネント（`apps/desktop/src/renderer/` 配下）
- `RuntimeSkillCreatorFacade.ts` の Facade統合以外の箇所への影響

スコープ外変更が発見された場合は MAJOR 以上の判定とし、変更を差し戻す。

### Task 10-6: 判定と MINOR 指摘の未タスク化

以下の判定基準に従い総合判定を行う。

| 判定     | 基準                                                           |
| -------- | -------------------------------------------------------------- |
| PASS     | 全 AC 達成・スコープ外変更なし・設計原則遵守                   |
| MINOR    | 軽微な改善点あり（機能には影響なし）・次スプリント以降で対応可 |
| MAJOR    | AC 未達成または設計原則違反あり・本スプリント内で修正が必要    |
| CRITICAL | スコープ外の破壊的変更あり・即時ロールバックが必要             |

- MAJOR/CRITICAL の場合は該当 Phase に戻り修正を行う
- MINOR 指摘は `outputs/phase-10/final-review-result.md` に記録し、未タスクとして Issue 化する

## 参照資料

- `phase-2-design.md`（設計の前提）
- `phase-5-implementation.md`（実装の前提）
- `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`
- `packages/shared/src/types/skillCreator.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts`
- `outputs/phase-9/quality-report.md`（前 Phase の品質レポート）

## 統合テスト連携

- Phase 9 の品質ゲート通過を前提とする
- Phase 11（手動テスト）の事前チェックとして機能する

## 成果物

| 成果物           | パス                                      | 必須 |
| ---------------- | ----------------------------------------- | ---- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | 必須 |

### `final-review-result.md` 記載項目

- 実行日時
- 総合判定: PASS / MINOR / MAJOR / CRITICAL
- AC-1 〜 AC-10 の個別判定結果
- 設計原則遵守確認結果
- P0-02 型契約整合確認結果
- skill-fixture-runner 役割分担確認結果
- スコープ外変更有無
- MINOR 指摘一覧（0 件でも記載）
- MAJOR/CRITICAL 指摘がある場合の対応方針

## 完了条件

- [ ] 本 Phase 内の全タスク（Task 10-1 〜 10-6）を 100% 実行完了
- [ ] AC-1 〜 AC-10 が全て PASS
- [ ] 総合判定が PASS または MINOR
- [ ] MINOR 指摘が未タスク化されている（0 件の場合は記録のみ）
- [ ] スコープ外変更が存在しない
- [ ] `outputs/phase-10/final-review-result.md` が出力されている

## 次の Phase

Phase 11: 手動テスト検証（`phase-11-manual-test.md`）
