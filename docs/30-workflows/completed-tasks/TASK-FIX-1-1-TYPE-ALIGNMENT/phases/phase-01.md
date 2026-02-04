# Phase 1: 要件定義

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 1                           |
| 機能名 | TASK-FIX-1-1-TYPE-ALIGNMENT |
| 作成日 | 2026-02-04                  |

## 目的

型定義統一タスクの要件を明確化し、受け入れ基準を定義する。

## 実行タスク

### Task 1: 要件抽出

型定義の重複・矛盾を特定し、統一要件を抽出する。

**現状の型定義矛盾**:

| 型名                     | ファイル             | 問題点                                   |
| ------------------------ | -------------------- | ---------------------------------------- |
| `SkillStreamMessage`     | `skill.ts`           | Discriminated Union形式、5種類のtype     |
| `SkillStreamMessage`     | `skill-execution.ts` | Interface形式、4種類のtype（互換性なし） |
| `SkillExecutionRequest`  | 両ファイル           | フィールド構成が異なる                   |
| `SkillStreamMessageType` | 両ファイル           | enum値が異なる                           |

### Task 2: 受け入れ基準作成

各要件に対して検証可能な受け入れ基準を定義する。

**機能要件**:

| ID    | 要件                              | 受け入れ基準                          |
| ----- | --------------------------------- | ------------------------------------- |
| FR-01 | `SkillStreamMessage`が単一定義    | `skill.ts`のみに定義が存在            |
| FR-02 | `SkillExecutionRequest`が単一定義 | `skill.ts`のみに定義が存在            |
| FR-03 | 呼び出し元が正しいimportを使用    | `@repo/shared`からのimportのみ        |
| FR-04 | 仕様書準拠の型構造                | `specification.md §5.1`の型定義と一致 |

**非機能要件**:

| ID     | 要件               | 受け入れ基準                |
| ------ | ------------------ | --------------------------- |
| NFR-01 | TypeScript型安全性 | `pnpm typecheck` エラーなし |
| NFR-02 | 既存テストの維持   | 全既存テストがPASS          |
| NFR-03 | 後方互換性         | ランタイムエラーなし        |

### Task 3: FR/NFR 分類と優先度設定

| 優先度 | 要件ID | 理由                   |
| ------ | ------ | ---------------------- |
| 高     | FR-01  | メイン課題（矛盾解消） |
| 高     | FR-02  | 関連する重複定義       |
| 高     | NFR-01 | ビルド成功必須         |
| 高     | NFR-02 | 機能退行防止           |
| 中     | FR-03  | import整理             |
| 中     | FR-04  | 仕様準拠               |
| 低     | NFR-03 | ランタイム確認         |

## 参照資料

| 資料名                | パス                                                                              | 説明                   |
| --------------------- | --------------------------------------------------------------------------------- | ---------------------- |
| 仕様書                | `docs/30-workflows/skill-import-agent-system/specification.md`                    | §5.1 型定義            |
| 元タスク指示書        | `tasks/task-fix-1-1-type-alignment.md`                                            | 発見経緯・背景         |
| 型定義（正）          | `packages/shared/src/types/skill.ts`                                              | 統合先                 |
| 型定義（統合対象）    | `packages/shared/src/types/skill-execution.ts`                                    | 削除予定               |
| interfaces-agent-sdk  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | スキル型定義仕様       |
| api-ipc-agent         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | IPCチャンネル定義      |
| arch-state-management | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | 状態管理アーキテクチャ |

## 統合テスト連携【必須】

型統一における接続要件を明記:

| 接続要件カテゴリ | 記載内容                                        |
| ---------------- | ----------------------------------------------- |
| IPC通信          | Main-Renderer間のSkillStreamMessage型の一貫性   |
| 状態管理         | Zustand storeでのSkillExecutionStatus型の整合性 |
| SDK連携          | Claude Agent SDKとの型互換性維持                |

## アーキテクチャ層別要件

| 層                     | 確認観点                            |
| ---------------------- | ----------------------------------- |
| Shared（@repo/shared） | 型定義の単一化、エクスポートの整理  |
| Main Process           | IPC ハンドラーでの型使用箇所        |
| Renderer Process       | コンポーネント・Hooksでの型使用箇所 |
| IPC通信                | チャンネル型定義の整合性            |

## 成果物

| 成果物         | パス                                         | 説明             |
| -------------- | -------------------------------------------- | ---------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| 型棚卸しリスト | `outputs/phase-1/type-inventory.md`          | 現状の型定義一覧 |

## 完了条件

- [ ] 全ての型定義矛盾が特定されている
- [ ] 各要件に受け入れ基準がある
- [ ] FR/NFRが分類されている
- [ ] 型棚卸しリストが作成されている
- [ ] 接続要件（IPC/状態管理/SDK）が明記されている
- [ ] アーキテクチャ層別の要件が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計
