# TASK-FIX-4-1-IPC-CONSOLIDATION: IPCチャンネル整理

## メタ情報

| 項目         | 内容                                  |
| ------------ | ------------------------------------- |
| タスクID     | TASK-FIX-4-1-IPC-CONSOLIDATION        |
| タスク名     | IPCチャンネルの重複解消（仕様書準拠） |
| 分類         | リファクタリング                      |
| 対象機能     | Electron IPC通信層                    |
| 優先度       | 高                                    |
| 見積もり規模 | 中規模                                |
| ステータス   | 未実施                                |
| 作成日       | 2026-02-04                            |
| 関連Phase    | Phase 4（TASK-4-1の前提修正）         |

---

## 概要

スキル機能のIPCチャンネルが段階的な開発（TASK-3, 4, 7, 9C）で増殖し、同じ機能に対して複数のチャンネルが存在している。仕様書では`skill:list`, `skill:import`, `skill:execute`の3つを基本とするが、現在は10以上のチャンネルが混在。本タスクでは仕様書準拠のIPCチャンネル体系を確立する。

---

## 問題点

| 問題                                            | 影響                                                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| 同じ機能に2つのチャンネル                       | `skill:list` vs `skill:list-available`、`skill:getImported` vs `skill:list-imported` |
| 一部チャンネルがMain Processで未実装            | 呼び出すとエラーまたは無応答                                                         |
| ハードコードされた文字列（`as string`キャスト） | 型安全性とセキュリティチェックバイパス                                               |
| IPC_CHANNELSが2箇所で定義                       | shared vs preloadで重複                                                              |

---

## 目標

1. チャンネル名を仕様書（`skill:list`, `skill:import`, `skill:execute`等）に統一
2. 重複チャンネルを削除
3. ハードコード文字列を`IPC_CHANNELS`定数に置換
4. IPC_CHANNELS定義を単一箇所に集約

---

## Phase構成

| Phase | 名称                 | 説明                           |
| ----- | -------------------- | ------------------------------ |
| 1     | 要件定義             | チャンネル統一の要件を明文化   |
| 2     | 設計                 | マッピングテーブル・統一設計   |
| 3     | 設計レビューゲート   | 設計の妥当性検証               |
| 4     | テスト作成           | TDD Red - 新チャンネルのテスト |
| 5     | 実装                 | TDD Green - チャンネル統一実装 |
| 6     | テスト拡充           | カバレッジ向上                 |
| 7     | テストカバレッジ確認 | 基準達成確認                   |
| 8     | リファクタリング     | TDD Refactor - コード整理      |
| 9     | 品質保証             | 全品質ゲートクリア             |
| 10    | 最終レビューゲート   | 全体品質確認                   |
| 11    | 手動テスト検証       | 実環境での動作確認             |
| 12    | ドキュメント更新     | 仕様書・実装ガイド更新         |
| 13    | PR作成               | コミット・PR・CI確認           |

---

## スコープ

### 含むもの

- スキル関連IPCチャンネルの統一
- 重複チャンネルの削除
- ALLOWED_INVOKE_CHANNELSの整理
- ハードコード文字列の置換

### 含まないもの

- 新しいチャンネルの追加（それはTASK-4-1で実施）
- ハンドラーロジックの変更

---

## システム仕様参照

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                              | 内容                    |
| ------------------------ | --------------------------------------------------------------------------------- | ----------------------- |
| スキルIPCセキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | IPCチャンネル定義・検証 |
| Agent SDKスキル仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | スキル型定義・IPC仕様   |
| Electron IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | IPC通信セキュリティ     |
| Agent Dashboard IPC      | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | エージェントIPC仕様     |

---

## 関連タスク

| タスク                      | 関係                 |
| --------------------------- | -------------------- |
| TASK-4-1 IPCチャンネル定義  | 本タスク完了が前提   |
| TASK-FIX-1-1-TYPE-ALIGNMENT | 型定義統一（完了済） |
| TASK-5-1 SkillAPI Preload   | 関連実装             |

---

## 成果物一覧

| Phase | 成果物               | 配置先                                          |
| ----- | -------------------- | ----------------------------------------------- |
| 1     | 要件定義書           | `outputs/phase-1/requirements-definition.md`    |
| 2     | 設計書               | `outputs/phase-2/architecture-design.md`        |
| 3     | 設計レビュー結果     | `outputs/phase-3/design-review-result.md`       |
| 4     | テスト仕様書         | `outputs/phase-4/test-specification.md`         |
| 5-8   | 実装コード           | `apps/desktop/src/`                             |
| 9     | 品質レポート         | `outputs/phase-9/quality-report.md`             |
| 10    | 最終レビュー結果     | `outputs/phase-10/final-review-result.md`       |
| 11    | 手動テスト結果       | `outputs/phase-11/manual-test-result.md`        |
| 12    | 実装ガイド           | `outputs/phase-12/implementation-guide.md`      |
| 12    | ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   |
| 12    | 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` |
| 13    | PR情報               | `outputs/phase-13/pr-info.md`                   |
