# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 1                                 |
| 機能名   | TASK-UI-01-STORE-IPC-ARCHITECTURE |
| タスクID | TASK-UI-01-STORE-IPC-ARCHITECTURE |
| 作成日   | 2026-03-05                        |

## 目的

Store拡張、IPC契約、ViewType拡張の要件を固定し、Phase 2以降で判断の揺れを出さない状態を作る。

## 実行タスク

- 要件抽出: `task-056-ui-01-store-ipc-architecture.md` から機能要件と非機能要件を抽出する。
- 受け入れ基準定義: 各要件に対して検証可能な受け入れ基準を定義する。
- スコープ境界定義: 本タスクの実施範囲と除外範囲を明文化する。
- 依存タスク整理: task-030, task-057, task-058c, task-058e との依存点を列挙する。

## 参照資料

| 資料名                 | パス                                                                                                                                 | 説明                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| 親タスク仕様           | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056-ui-01-store-ipc-architecture.md` | 正本仕様                |
| SubTask仕様            | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056a-b-ipc-contract-security.md`     | IPC契約詳細             |
| resource-map           | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                                                     | 読み込み導線            |
| 状態管理仕様           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                         | Slice分離原則           |
| API一覧                | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                                                                 | IPC命名規則             |
| IPCセキュリティ        | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                         | sender検証・Preload境界 |
| UIナビ仕様             | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                                              | ViewTypeと導線整合      |
| タスク仕様テンプレート | `.claude/skills/task-specification-creator/references/phase-templates.md`                                                            | Phase文書構造           |

## 統合テスト連携

| 項目                  | 内容                                                           |
| --------------------- | -------------------------------------------------------------- |
| 対象統合経路          | Renderer Store -> Preload API -> Main IPC Handler              |
| Phase 1で固定する観点 | IPCチャネル名、引数型、戻り値型、エラー契約                    |
| 後続Phase連携         | Phase 4でRedテスト化、Phase 5でGreen化、Phase 11で画面導線検証 |

## 成果物

| 成果物       | パス                                         | 説明                 |
| ------------ | -------------------------------------------- | -------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件 |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実施範囲・除外範囲   |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証条件一覧         |

## 完了条件

- [ ] 親タスク仕様から要件を抽出した
- [ ] 検証可能な受け入れ基準を定義した
- [ ] 依存タスクと境界を明文化した
- [ ] outputs/phase-1 配下の成果物パスを確定した
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 2: 設計

## 実行手順

### ステップ1: 参照資料確認

本Phaseの参照資料を確認し、前提条件を固定する。

### ステップ2: 実行タスク実施

`実行タスク` に記載した項目を順番に実行し、結果を成果物に記録する。

### ステップ3: 成果物検証

成果物の配置と内容を確認し、完了条件をチェックする。

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                     | 仕様参照先                                                                   |
| ------------------ | -------------------------------------------- | ---------------------------------------------------------------------------- |
| セキュリティ       | IPC/入力検証を含むため適用                   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` |
| UI/UX              | ViewType/AppDock/App遷移を含むため適用       | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`      |
| アーキテクチャ     | Store/IPC/Preload層変更を含むため適用        | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` |
| API設計            | IPC契約変更を含むため適用                    | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`        |
| エラーハンドリング | Handlerエラー応答を含むため適用              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        |
| テスト品質         | テスト追加/拡充/カバレッジ確認を含むため適用 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  |

## サブタスク管理

1. 参照資料の確認
2. 実行タスクの実施
3. 統合テスト連携の更新（Phase 1〜11）
4. 成果物の出力
5. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物を指定パスへ出力
- [ ] 完了条件のチェックを更新
