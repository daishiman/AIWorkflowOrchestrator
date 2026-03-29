# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 1                                   |
| 機能名 | session-resume-renderer-integration |
| 作成日 | 2026-03-29                          |

## 目的

セッション復元のレンダラー統合の要件を定義し、受入基準・スコープ・依存関係に加えて、SDK `session_id`、`resume` / `continue` / `forkSession`、manifest 互換性判定を明確化する。

## 実行タスク

- 受入基準の定義
- スコープ（含む/含まない）の明確化
- 依存関係の特定
- `session_id` 保存契約の定義
- resume 可否の互換性判定条件の定義
- 現行コードアンカーの特定
- 非機能要件の確認

## 参照資料

| 資料名            | パス                                                                           | 説明                  |
| ----------------- | ------------------------------------------------------------------------------ | --------------------- |
| lane 共通不変条件 | `../root-workflow-pack/index.md`                                               | 共通方針              |
| remediation pack  | `../p0-verify-manifest-remediation-pack.md`                                    | 全体タスク構成        |
| RT-06             | `../step-08-par-task-rt-06-claude-sdk-message-contract-normalization/index.md` | SDK `session_id` 契約 |

## 実行手順

### ステップ1: 受入基準を定義する

index.md の受入基準セクションに基づき、具体的な検証可能な条件を列挙する。

### ステップ2: スコープを明確化する

実装対象と非対象を明確に区分し、責務境界を定義する。

### ステップ3: 依存関係を特定する

上流・下流タスクとの関係、共有リソースの競合可能性を分析する。

### ステップ4: session resume 契約を定義する

- `session_id` を永続化対象に含める
- `sourceRoot` / `manifestHash` / `resolvedSkillPath` で resume 互換性を判定する
- 非互換時は resume せず新規セッションへフォールバックする

## 成果物

| 成果物          | パス                                     | 説明           |
| --------------- | ---------------------------------------- | -------------- |
| spec extraction | `outputs/phase-1/spec-extraction-map.md` | 要件抽出マップ |

## 完了条件

- [ ] 受入基準が全て定義されている
- [ ] スコープが明確に定義されている
- [ ] 依存関係が特定されている
- [ ] `session_id` と resume 互換性判定の要件が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
