# Phase 1: 要件定義

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 1                           |
| 機能名 | conversational-interview-ui |
| 作成日 | 2026-03-29                  |

## 目的

会話型インタビューUI の要件を定義し、受入基準・スコープ・依存関係を明確化する。

## 実行タスク

- 受入基準の定義
- スコープ（含む/含まない）の明確化
- 依存関係の特定
- 現行コードアンカーの特定
- 非機能要件の確認
- P50チェック（既実装状態の調査）
- 受入基準抽出と source scope の固定

## 参照資料

| 資料名            | パス                                        | 説明           |
| ----------------- | ------------------------------------------- | -------------- |
| lane 共通不変条件 | `../root-workflow-pack/index.md`            | 共通方針       |
| remediation pack  | `../p0-verify-manifest-remediation-pack.md` | 全体タスク構成 |

## 実行手順

### ステップ0: P50チェック（既実装状態の調査）

既存の実装・型・IPC・UI コンポーネントの有無を確認し、既実装の重複作成を防ぐ。

```bash
git log --oneline -20 -- apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
rg -n "SkillCreatorWorkflowEngine|submitUserInput|UserInputKind" apps/ packages/
```

### ステップ1: 受入基準を定義する

index.md の受入基準セクションに基づき、AC-1..N を検証可能な形で列挙する。

### ステップ2: スコープを明確化する

実装対象と非対象を明確に区分し、責務境界を定義する。

### ステップ3: 依存関係を特定する

上流・下流タスクとの関係、共有リソースの競合可能性を分析する。

### ステップ4: 受入基準抽出と source scope を固定する

system spec と current code anchor の 1:1 対応を `spec-extraction-map.md` に記録する。

## 統合テスト連携

Phase 4 以降の統合テスト設計に向け、AC と検証手段の対応をメモ化する（後続フェーズで詳細化）。

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断                    | 仕様参照先                                   |
| ---------------- | --------------------------- | -------------------------------------------- |
| UI/UX            | 会話型 UI のため必須        | `aiworkflow-requirements: ui-ux-*.md`        |
| IPC通信          | plan 連携があるため必須     | `aiworkflow-requirements: api-ipc-*.md`      |
| アーキテクチャ   | 状態所有権の整理が必要      | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ | keyboard 操作要件があるため | `aiworkflow-requirements: ui-ux-*.md`        |

## 成果物

| 成果物           | パス                                     | 説明                                             |
| ---------------- | ---------------------------------------- | ------------------------------------------------ |
| spec extraction  | `outputs/phase-1/spec-extraction-map.md` | system spec と current code anchor の 1:1 対応表 |
| scope definition | `outputs/phase-1/scope-definition.md`    | source scope / 非対象 / 依存境界の固定           |

## 完了条件

- [ ] 受入基準が全て定義されている
- [ ] スコープが明確に定義されている
- [ ] 依存関係が特定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. 受入基準の抽出
3. スコープと依存関係の固定
4. spec-extraction-map の作成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物が全て作成されている

## 次のPhase

Phase 2: 設計
