# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 1                                  |
| 機能名 | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| 作成日 | 2026-02-05                         |

## 目的

2つのskillAPI定義の差異を完全に把握し、統一に必要な要件を明確化する。

## 前提条件

- TASK-FIX-1-1-TYPE-ALIGNMENT が完了していること（型定義統一済み）
- TASK-FIX-4-1-IPC-CONSOLIDATION が完了していること（IPCチャンネル統一済み）

## 参照資料

| 資料名                       | パス                                                | 説明                    |
| ---------------------------- | --------------------------------------------------- | ----------------------- |
| 仕様書§4                     | `specification.md` §4                               | API定義の正本           |
| SkillAPIインターフェース仕様 | `interfaces-agent-sdk-skill.md` 行227-293           | Preload API型定義       |
| Electronセキュリティ仕様     | `security-api-electron.md` 行30-48                  | IPC通信セキュリティ原則 |
| 実装パターン（IPC統合）      | `architecture-implementation-patterns.md` 行203-240 | チャンネル統合パターン  |
| APIエンドポイント            | `api-endpoints.md`                                  | Desktop IPC APIサマリー |

## 実行タスク

### Task 1: 両APIの完全なメソッドリストアップ

#### 目的

`preload/skill-api.ts`（API#1）と`renderer/preload/index.ts`（API#2）の全メソッドを列挙し、差異を可視化する。

#### 手順

1. `apps/desktop/src/preload/skill-api.ts` を読み込み、全メソッドをリストアップする
2. `apps/desktop/src/renderer/preload/index.ts` のskillAPI部分を読み込み、全メソッドをリストアップする
3. 以下の観点で比較表を作成する:
   - メソッド名
   - 引数の型
   - 戻り値の型
   - 実装状態（実装済み/スタブ）
   - 使用元

#### 期待される比較表フォーマット

| メソッド | API#1 (preload/skill-api.ts)                                          | API#2 (renderer/preload/index.ts)                                        | 差異             |
| -------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------- |
| execute  | `(request: SkillExecutionRequest) => Promise<SkillExecutionResponse>` | `(skillId: string, params?) => Promise<OperationResult<SkillRunResult>>` | シグネチャ不一致 |
| list     | `() => Promise<SkillMetadata[]>`                                      | `() => Promise<OperationResult<Skill[]>>`                                | 戻り値型不一致   |
| ...      | ...                                                                   | ...                                                                      | ...              |

### Task 2: 呼び出し元の完全マッピング

#### 目的

全呼び出し元を特定し、移行時の影響範囲を把握する。

#### 手順

1. 以下のコマンドで`window.skillAPI`の使用箇所を特定:

```bash
grep -rn "window\.skillAPI\|window\.electronAPI\.skill" apps/desktop/src/renderer/
```

2. 各呼び出し元について以下を記録:
   - ファイルパス
   - 使用しているAPI（API#1 or API#2）
   - 呼び出しメソッド
   - 引数の使い方
   - 戻り値の利用方法

#### 期待される呼び出し元マップ

| 呼び出し元             | 使用API | 使用メソッド                                       | アクセスパス               |
| ---------------------- | ------- | -------------------------------------------------- | -------------------------- |
| useSkillExecution.ts   | API#1   | execute, onStream, abort                           | `window.skillAPI`          |
| useSkillPermission.ts  | API#1   | onPermissionRequest, sendPermissionResponse        | `window.skillAPI`          |
| usePermissionDialog.ts | API#1   | onPermissionRequest, sendPermissionResponse        | `window.skillAPI`          |
| skillSlice.ts          | API#2   | list, getImported, rescan, import, remove, execute | `window.electronAPI.skill` |

### Task 3: 仕様書§4との照合

#### 目的

`specification.md §4` で定義されたAPI仕様と現状の差異を明確化する。

#### 手順

1. `docs/30-workflows/skill-import-agent-system/specification.md` の§4（API定義）を読み込む
2. 仕様書で定義されたメソッド一覧を抽出
3. 現行の両APIと仕様書の差異を表にまとめる

### Task 4: 前提タスク完了状態の確認

#### 目的

依存タスクの完了状態を確認し、本タスクの実行可能性を検証する。

#### 手順

1. TASK-FIX-1-1-TYPE-ALIGNMENT の完了成果物を確認:
   - `packages/shared/src/types/skill.ts` の型定義が統一されていること
   - `SkillExecutionRequest`, `SkillExecutionResponse` 等が正しく定義されていること

2. TASK-FIX-4-1-IPC-CONSOLIDATION の完了成果物を確認:
   - IPCチャンネル名が `preload/channels.ts` に一元管理されていること
   - 重複チャンネルが排除されていること

## システム開発観点チェック

| 観点             | 確認項目                              | 参照仕様書                                |
| ---------------- | ------------------------------------- | ----------------------------------------- |
| セキュリティ     | Preload Scriptのcontextbridge公開範囲 | `security-api-electron.md`                |
| アーキテクチャ   | Electron Main-Renderer間通信パターン  | `architecture-implementation-patterns.md` |
| インターフェース | SkillAPI統一インターフェース          | `interfaces-agent-sdk-skill.md`           |
| API設計          | IPCチャンネル設計                     | `api-endpoints.md`                        |

## Electronデスクトップアプリ観点

| 層       | 確認項目                         |
| -------- | -------------------------------- |
| Preload  | contextBridgeでの公開APIの一元化 |
| Renderer | 呼び出し元のアクセスパス統一     |
| IPC通信  | チャンネル定義との整合性         |

## 統合テスト連携【必須】

| カテゴリ           | 確認項目                                           | 期待結果                     |
| ------------------ | -------------------------------------------------- | ---------------------------- |
| API接続            | 統一skillAPI全メソッドのIPC疎通要件を定義          | 全13メソッドの接続要件リスト |
| データフロー       | Renderer→Preload→Main→Preload→Rendererのフロー確認 | データフロー図の要件定義     |
| エラーハンドリング | IPC通信エラー時のRenderer側表示要件                | エラーハンドリング要件リスト |
| 状態同期           | スキルインポート/削除後の一覧更新要件              | リアルタイム反映要件         |

## 成果物

| 成果物           | パス                                           | 説明               |
| ---------------- | ---------------------------------------------- | ------------------ |
| API比較分析表    | `outputs/phase-1/api-comparison.md`            | 両APIの差異分析    |
| 呼び出し元マップ | `outputs/phase-1/caller-mapping.md`            | 全呼び出し元の特定 |
| 仕様書照合結果   | `outputs/phase-1/spec-alignment.md`            | 仕様書との差異     |
| 前提確認結果     | `outputs/phase-1/prerequisite-verification.md` | 依存タスク確認結果 |

## 完了条件

- [ ] API#1（preload/skill-api.ts）の全13メソッドがリストアップされている
- [ ] API#2（renderer/preload/index.ts）の全6メソッドがリストアップされている
- [ ] 重複・差異の比較表が作成されている
- [ ] 全呼び出し元（4ファイル以上）が特定・記録されている
- [ ] 仕様書§4との照合が完了している
- [ ] TASK-FIX-1-1, TASK-FIX-4-1の完了が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計
