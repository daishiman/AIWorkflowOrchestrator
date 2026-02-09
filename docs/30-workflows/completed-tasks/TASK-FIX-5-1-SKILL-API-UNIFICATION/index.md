---
id: TASK-FIX-5-1
tier: 2
title: SkillAPI二重定義の解消（仕様書準拠）
phase: 1
depends_on: [TASK-FIX-1-1-TYPE-ALIGNMENT, TASK-FIX-4-1-IPC-CONSOLIDATION]
parallel_with: []
blocks: [TASK-FIX-6-1-STATE-MANAGEMENT]
status: pending
priority: high
estimated_complexity: medium
tags: [refactoring, preload, skill-api, ipc, security]
created_at: 2026-02-08
---

# TASK-FIX-5-1: SkillAPI二重定義の解消（仕様書準拠） - メインタスク仕様書

## 概要

Preload層におけるSkillAPIの二重定義（`window.skillAPI` と `window.electronAPI.skill`）を解消し、`window.electronAPI.skill` に一本化するリファクタリングタスク。現在、2つのAPIが共存しており、呼び出し側での参照先分散やテストモックの二重管理が発生している。

## 目的

- `window.skillAPI`（直接公開）と `window.electronAPI.skill`（contextBridge経由）の二重公開を解消
- `window.electronAPI.skill` のみで公開する形式に統一
- 一貫した戻り値型（直接型、OperationResultラッパー不使用）を提供
- セキュリティ原則に準拠したIPC通信を維持

## 背景

### 問題点

| 問題                      | 詳細                                                                                  | 影響                               |
| ------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------- |
| API二重公開               | `window.skillAPI`（直接公開）と `window.electronAPI.skill`（contextBridge経由）が共存 | 呼び出し側で参照先が分散           |
| 戻り値型不統一            | 一部で`OperationResult<T>`、一部で直接型を返却                                        | 呼び出し側で型チェックが一貫しない |
| execute()シグネチャ不一致 | 2つのAPIでexecuteメソッドの引数・戻り値が異なる                                       | 互換性の問題                       |
| スタブ実装と実装の混在    | 一部メソッドがスタブ（未実装）のまま公開されている                                    | 実行時エラーの原因                 |
| テストモック二重管理      | 両方のAPIをモックする必要がある                                                       | テストコードの複雑化               |

### 期待される解決

| 観点         | 解決後の状態                                                              |
| ------------ | ------------------------------------------------------------------------- |
| API公開      | `window.electronAPI.skill` のみ（Single Source of Truth）                 |
| 戻り値型     | safeInvoke/safeOnパターンで直接型を返却                                   |
| セキュリティ | ホワイトリスト検証を維持（ALLOWED_INVOKE_CHANNELS / ALLOWED_ON_CHANNELS） |
| テスト       | 単一のモック対象（`window.electronAPI.skill`）                            |

## スコープ

### 対象

| 対象         | ファイルパス                              | 変更内容                                   |
| ------------ | ----------------------------------------- | ------------------------------------------ |
| SkillAPI定義 | `apps/desktop/src/preload/skill-api.ts`   | 統一API実装（13メソッド）                  |
| Preload公開  | `apps/desktop/src/preload/index.ts`       | skillAPI統合、旧定義削除                   |
| 型定義       | `apps/desktop/src/preload/types.ts`       | SkillAPI型定義更新                         |
| 呼び出し元   | `apps/desktop/src/renderer/**/*.ts`       | 参照先を `window.electronAPI.skill` に統一 |
| テスト       | `apps/desktop/src/**/__tests__/*.test.ts` | モック対象の一本化                         |

### 対象外

| 対象外                    | 理由                                             |
| ------------------------- | ------------------------------------------------ |
| Main ProcessのIPCハンドラ | 既存ハンドラは変更不要（TASK-FIX-4-1で整備済み） |
| 新機能の追加              | リファクタリングタスクのため                     |
| 状態管理の変更            | TASK-FIX-6-1-STATE-MANAGEMENTで実施              |
| OperationResult型の削除   | 後方互換のため型定義は残置                       |

---

## Phase構成

| Phase | 名称                 | 目的                             | ステータス | ドキュメント                                               |
| ----- | -------------------- | -------------------------------- | ---------- | ---------------------------------------------------------- |
| 1     | 要件定義             | 目的・スコープ・受け入れ基準定義 | 未着手     | [phase-01-requirements.md](./phase-01-requirements.md)     |
| 2     | 設計                 | アーキテクチャ・詳細設計         | 未着手     | [phase-02-design.md](./phase-02-design.md)                 |
| 3     | 設計レビューゲート   | 要件・設計の妥当性検証           | 未着手     | [phase-03-design-review.md](./phase-03-design-review.md)   |
| 4     | テスト作成           | TDD: Red（失敗するテスト作成）   | 未着手     | [phase-04-test-creation.md](./phase-04-test-creation.md)   |
| 5     | 実装                 | TDD: Green（テストを通す実装）   | 未着手     | [phase-05-implementation.md](./phase-05-implementation.md) |
| 6     | テスト拡充           | カバレッジ目標達成               | 未着手     | [phase-06-test-expansion.md](./phase-06-test-expansion.md) |
| 7     | テストカバレッジ確認 | カバレッジ目標検証               | 未着手     | [phase-07-coverage.md](./phase-07-coverage.md)             |
| 8     | リファクタリング     | TDD: Refactor（品質改善）        | 未着手     | [phase-08-refactoring.md](./phase-08-refactoring.md)       |
| 9     | 品質保証             | 静的解析・セキュリティ           | 未着手     | [phase-09-quality.md](./phase-09-quality.md)               |
| 10    | 最終レビューゲート   | 全体品質・整合性検証             | 未着手     | [phase-10-final-review.md](./phase-10-final-review.md)     |
| 11    | 手動テスト検証       | 実環境動作確認                   | 未着手     | [phase-11-manual-test.md](./phase-11-manual-test.md)       |
| 12    | ドキュメント更新     | ドキュメント更新・仕様反映       | 未着手     | [phase-12-documentation.md](./phase-12-documentation.md)   |
| 13    | PR作成               | コミット・PR・CI確認             | 未着手     | [phase-13-pr-creation.md](./phase-13-pr-creation.md)       |

---

## 成果物一覧

| 成果物                                                            | Phase | 説明                                | ステータス |
| ----------------------------------------------------------------- | ----- | ----------------------------------- | ---------- |
| `apps/desktop/src/preload/skill-api.ts`                           | 5     | 統一SkillAPI実装（13メソッド）      | 未着手     |
| `apps/desktop/src/preload/index.ts`                               | 5     | skillAPI統合、旧window.skillAPI削除 | 未着手     |
| `apps/desktop/src/preload/types.ts`                               | 5     | SkillAPI型定義更新                  | 未着手     |
| `apps/desktop/src/preload/__tests__/skill-api.test.ts`            | 4, 6  | ユニットテスト                      | 未着手     |
| `apps/desktop/src/preload/__tests__/skill-api.permission.test.ts` | 4, 6  | Permissionテスト                    | 未着手     |
| `outputs/phase-11/manual-test-result.md`                          | 11    | 動作確認レポート                    | 未着手     |
| `outputs/phase-12/implementation-guide.md`                        | 12    | 実装ガイド                          | 未着手     |
| `outputs/phase-12/documentation-changelog.md`                     | 12    | ドキュメント更新履歴                | 未着手     |
| `outputs/phase-12/unassigned-task-detection.md`                   | 12    | 未タスク検出レポート                | 未着手     |

---

## 依存関係

### 前提タスク

| タスクID                       | タイトル           | 依存内容                                         | ステータス |
| ------------------------------ | ------------------ | ------------------------------------------------ | ---------- |
| TASK-FIX-1-1-TYPE-ALIGNMENT    | スキル型定義の統一 | 統一されたスキル型定義（Skill, SkillMetadata等） | 完了       |
| TASK-FIX-4-1-IPC-CONSOLIDATION | IPCチャンネル統合  | 統一されたIPCチャンネル定義（IPC_CHANNELS）      | 完了       |

### 後続タスク

| タスクID                      | タイトル     | 依存内容                                | ステータス |
| ----------------------------- | ------------ | --------------------------------------- | ---------- |
| TASK-FIX-6-1-STATE-MANAGEMENT | 状態管理変更 | 統一されたSkillAPIをZustand Storeで使用 | 未着手     |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                                        | 内容                                           |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| スキルAPI型定義      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Preload API仕様（window.electronAPI.skill）    |
| IPCセキュリティ仕様  | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | スキル実行IPCセキュリティ                      |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | SkillAPI統一パターン（TASK-FIX-5-1セクション） |
| IPCチャンネル仕様    | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPCチャンネル一覧                              |
| Electronセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | Electron IPC設計原則                           |

### 関連ファイル

| ファイル                                               | 説明                                  |
| ------------------------------------------------------ | ------------------------------------- |
| `apps/desktop/src/preload/skill-api.ts`                | 現行SkillAPI実装                      |
| `apps/desktop/src/preload/index.ts`                    | Preload公開エントリポイント           |
| `apps/desktop/src/preload/channels.ts`                 | IPCチャンネル定数定義                 |
| `apps/desktop/src/renderer/store/slices/skillSlice.ts` | Zustand SkillSlice（呼び出し元）      |
| `apps/desktop/src/renderer/views/AgentView/index.tsx`  | AgentViewコンポーネント（呼び出し元） |

---

## 統一後のSkillAPI仕様

### メソッド一覧（13メソッド）

| カテゴリ   | メソッド               | パターン   | 戻り値                             |
| ---------- | ---------------------- | ---------- | ---------------------------------- |
| Skill実行  | execute                | safeInvoke | `Promise<SkillExecutionResponse>`  |
| Skill実行  | onStream               | safeOn     | `() => void`（クリーンアップ関数） |
| Skill実行  | abort                  | safeInvoke | `Promise<void>`                    |
| Skill実行  | getExecutionStatus     | safeInvoke | `Promise<ExecutionInfo \| null>`   |
| Skill実行  | onComplete             | safeOn     | `() => void`（クリーンアップ関数） |
| Skill実行  | onError                | safeOn     | `() => void`（クリーンアップ関数） |
| Permission | onPermissionRequest    | safeOn     | `() => void`（クリーンアップ関数） |
| Permission | sendPermissionResponse | safeInvoke | `Promise<{ success: boolean }>`    |
| Skill管理  | list                   | safeInvoke | `Promise<SkillMetadata[]>`         |
| Skill管理  | getImported            | safeInvoke | `Promise<ImportedSkill[]>`         |
| Skill管理  | rescan                 | safeInvoke | `Promise<SkillMetadata[]>`         |
| Skill管理  | import                 | safeInvoke | `Promise<ImportedSkill>`           |
| Skill管理  | remove                 | safeInvoke | `Promise<void>`                    |

### セキュリティ実装

| 機能               | 実装                                                    | 効果                   |
| ------------------ | ------------------------------------------------------- | ---------------------- |
| safeInvokeパターン | `ALLOWED_INVOKE_CHANNELS`ホワイトリスト検証             | 未許可チャンネルを拒否 |
| safeOnパターン     | `ALLOWED_ON_CHANNELS`ホワイトリスト検証                 | 未許可イベントを拒否   |
| contextBridge      | `exposeInMainWorld('electronAPI', { skill: skillAPI })` | window直接割り当て禁止 |
| クリーンアップ     | `ipcRenderer.removeListener`呼び出し                    | メモリリーク防止       |

---

## 完了条件（全Phase完了時）

### 機能要件

- [ ] `window.skillAPI` が完全に削除されている
- [ ] `window.electronAPI.skill` のみでSkillAPIにアクセス可能
- [ ] 全13メソッドが正常に動作する
- [ ] 既存の呼び出し元（AgentView, skillSlice等）が正常に動作する

### 品質要件

- [ ] 全テスト通過（目標: 210テスト以上）
- [ ] 型エラーなし（`pnpm typecheck` 通過）
- [ ] Lintエラーなし（`pnpm lint` 通過）
- [ ] 手動テスト検証完了
- [ ] カバレッジ基準達成（Line: 80%以上, Branch: 60%以上）

### セキュリティ要件

- [ ] ホワイトリスト検証が全メソッドで機能している
- [ ] contextBridge経由の公開が維持されている
- [ ] クリーンアップ関数が正しく実装されている

### ドキュメント要件

- [ ] 実装ガイドが作成されている（Part 1: 概念説明, Part 2: 技術詳細）
- [ ] 未タスク検出レポートが作成されている
- [ ] interfaces-agent-sdk-skill.md が更新されている

---

## 既知の課題と対処方針

### S1: AgentView型アサーション残存

| 項目 | 内容                                                                                            |
| ---- | ----------------------------------------------------------------------------------------------- |
| 問題 | `AgentView/index.tsx`で`as unknown as Skill[]`型アサーション残存（agentSliceが旧`Skill`型使用） |
| 対処 | 未タスク UT-FIX-5-1-001 として登録、TASK-FIX-6-1で包含予定                                      |
| 教訓 | API統一時は呼び出し側のStore型定義まで影響範囲を調査する                                        |

### S4: OperationResult廃止の影響波及

| 項目 | 内容                                                       |
| ---- | ---------------------------------------------------------- |
| 問題 | `OperationResult<T>`ラッパー廃止で複数ファイルに影響波及   |
| 対処 | Preload層では直接型に統一し、旧定義は後方互換のため残置    |
| 教訓 | 型ラッパー廃止時は`grep -rn`で全使用箇所をリストアップする |

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-02-08 | 初版作成 |
