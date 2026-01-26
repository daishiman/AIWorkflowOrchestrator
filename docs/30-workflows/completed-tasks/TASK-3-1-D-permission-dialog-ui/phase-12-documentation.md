# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 12                              |
| Phase名    | ドキュメント                    |
| 前提Phase  | Phase 11                        |
| 後続Phase  | Phase 13                        |
| ステータス | 未実施                          |
| 作成日     | 2026-01-25                      |
| 機能名     | TASK-3-1-D-permission-dialog-ui |

---

## 目的

実装内容のドキュメントを作成し、将来の保守性を確保する。

## 背景

Phase 11までで実装と検証が完了した。コードの理解と保守を容易にするためのドキュメントを作成する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: API ドキュメント作成

**目的**: skillAPI permission拡張のAPIドキュメントを作成する

**実行手順**:

1. `outputs/phase-12/api-documentation.md` を作成:

   ````markdown
   # skillAPI Permission拡張 APIドキュメント

   ## 概要

   skillAPIにPermission要求処理機能を追加。

   ## メソッド

   ### onPermission

   - 説明: Main ProcessからのPermission要求をリッスン
   - 引数: callback: (request: SkillPermissionRequest) => void
   - 戻り値: () => void (cleanup関数)
   - 使用例:
     ```typescript
     const cleanup = window.skillAPI.onPermission((request) => {
       console.log("Permission requested:", request);
     });
     ```
   ````

   ### respondPermission
   - 説明: Permission要求に応答
   - 引数: response: SkillPermissionResponse
   - 戻り値: Promise<boolean>
   - 使用例:
     ```typescript
     await window.skillAPI.respondPermission({
       requestId: "xxx",
       approved: true,
       rememberChoice: false,
     });
     ```

   ```

   ```

**期待される成果物**:

- `outputs/phase-12/api-documentation.md`: APIドキュメント

---

### タスク2: IPC通信ドキュメント作成

**目的**: IPC通信フローのドキュメントを作成する

**実行手順**:

1. `outputs/phase-12/ipc-documentation.md` を作成:

   ```markdown
   # Skill Permission IPC通信ドキュメント

   ## チャネル定義

   | チャネル名               | 方向            | 用途               |
   | ------------------------ | --------------- | ------------------ |
   | SKILL_PERMISSION_REQUEST | Main → Renderer | Permission要求送信 |
   | SKILL_PERMISSION_RESPOND | Renderer → Main | Permission応答送信 |

   ## シーケンス図

   [シーケンス図をMermaid形式で記載]

   ## データ形式

   [型定義の詳細を記載]
   ```

**期待される成果物**:

- `outputs/phase-12/ipc-documentation.md`: IPC通信ドキュメント

---

### タスク3: コンポーネントドキュメント作成

**目的**: SkillStreamDisplay Permission統合のドキュメントを作成する

**実行手順**:

1. `outputs/phase-12/component-documentation.md` を作成:

   ```markdown
   # SkillStreamDisplay Permission統合ドキュメント

   ## 概要

   SkillStreamDisplayコンポーネントにPermissionDialog統合を実装。

   ## 状態管理

   - pendingPermission: 現在のPermission要求（null | SkillPermissionRequest）

   ## イベントハンドラ

   - handleApprove: 許可時の処理
   - handleDeny: 拒否時の処理

   ## コンポーネント構成

   [コンポーネント図を記載]
   ```

**期待される成果物**:

- `outputs/phase-12/component-documentation.md`: コンポーネントドキュメント

---

### タスク4: 変更履歴作成

**目的**: 本タスクでの変更内容を記録する

**実行手順**:

1. `outputs/phase-12/changelog.md` を作成:

   ```markdown
   # TASK-3-1-D 変更履歴

   ## 変更ファイル

   | ファイル                                                              | 変更種別 | 内容                    |
   | --------------------------------------------------------------------- | -------- | ----------------------- |
   | apps/desktop/src/preload/channels.ts                                  | 修正     | チャネル追加            |
   | apps/desktop/src/preload/skill-api.ts                                 | 修正     | permission メソッド追加 |
   | apps/desktop/src/preload/types.ts                                     | 修正     | 型定義追加              |
   | apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx | 修正     | PermissionDialog統合    |

   ## 追加されたテスト

   [テストファイル一覧]

   ## 依存関係への影響

   [影響範囲の記載]
   ```

**期待される成果物**:

- `outputs/phase-12/changelog.md`: 変更履歴

---

## 参照資料

| 参照資料    | パス                | 内容     |
| ----------- | ------------------- | -------- |
| Phase 2設計 | `outputs/phase-2/`  | 設計情報 |
| 実装コード  | `apps/desktop/src/` | 実装参照 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                        | 内容                |
| ------------------------- | --------------------------------------------------------------------------- | ------------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | 既存APIドキュメント |

---

## 成果物

| 成果物                     | パス                                          | 内容             |
| -------------------------- | --------------------------------------------- | ---------------- |
| APIドキュメント            | `outputs/phase-12/api-documentation.md`       | skillAPI拡張説明 |
| IPC通信ドキュメント        | `outputs/phase-12/ipc-documentation.md`       | IPC仕様          |
| コンポーネントドキュメント | `outputs/phase-12/component-documentation.md` | UI統合説明       |
| 変更履歴                   | `outputs/phase-12/changelog.md`               | 変更内容記録     |

---

## 完了条件

- [ ] APIドキュメントが作成されている
- [ ] IPC通信ドキュメントが作成されている
- [ ] コンポーネントドキュメントが作成されている
- [ ] 変更履歴が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11（手動テスト）が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-3-1-D-permission-dialog-ui/phase-13-pr-creation.md`
