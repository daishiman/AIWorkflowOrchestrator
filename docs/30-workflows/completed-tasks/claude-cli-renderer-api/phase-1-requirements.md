# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 1                       |
| Phase名    | 要件定義                |
| 前提Phase  | -                       |
| 後続Phase  | Phase 2                 |
| ステータス | 未実施                  |
| 作成日     | 2026-01-17              |
| 機能名     | claude-cli-renderer-api |

---

## 目的

Claude CLI Renderer API実装の要件を定義し、既存実装の状況を確認する。

## 背景

Phase 10最終レビューにて「contextBridge API公開がpreloadで未実装」との指摘があった。本Phaseでは、この指摘に対する実態調査と要件整理を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 指摘事項の確認

**目的**: 元の指摘内容を正確に理解する

**実行手順**:

1. `docs/30-workflows/unassigned-task/task-claude-cli-renderer-api.md`を読み、指摘内容を確認する
2. 指摘された問題点（contextBridge API公開がpreloadで未実装）の詳細を把握する
3. 期待される成果物（`window.claudeCliAPI`の公開）を理解する

**期待される成果物**:

- 指摘事項の要約
- 期待される機能一覧

---

### タスク2: 既存実装の調査

**目的**: 現在のPreload API実装状況を確認する

**実行手順**:

1. `apps/desktop/src/preload/index.ts`を読み、`claudeCliAPI`の実装有無を確認する
2. `apps/desktop/src/preload/channels.ts`を読み、Claude CLI関連のIPCチャンネルを確認する
3. `apps/desktop/src/preload/types.ts`を読み、`ClaudeCliAPI`型の定義を確認する
4. `contextBridge.exposeInMainWorld("claudeCliAPI", claudeCliAPI)`の記述を確認する

**期待される成果物**:

- 既存実装状況レポート
- 実装済み/未実装の機能一覧

---

### タスク3: 要件定義書の作成

**目的**: 確認した情報を基に要件定義書を作成する

**実行手順**:

1. 機能要件を整理する（以下のAPIが利用可能であること）:
   - `checkInstallation()`: CLI存在確認
   - `listSkills(request?)`: スキル一覧取得
   - `getSkillDetail(request)`: スキル詳細取得
   - `executeScript(request)`: スクリプト実行
   - `terminateSession(request)`: セッション終了
   - `listSessions()`: セッション一覧取得
   - `getSession(request)`: セッション詳細取得
   - `onSessionOutput(callback)`: 出力ストリーミング購読
   - `onSessionStatus(callback)`: 状態変更購読
2. 非機能要件を整理する（型安全性、セキュリティ、パフォーマンス）
3. 要件定義書を`outputs/phase-1/requirements.md`に出力する

**期待される成果物**:

- `outputs/phase-1/requirements.md`（要件定義書）

---

### タスク4: 実装状況判定

**目的**: 既存実装が要件を満たしているか判定する

**実行手順**:

1. タスク2で確認した既存実装とタスク3で定義した要件を比較する
2. 以下の判定を行う:
   - 全要件を満たしている → 「既存実装で十分」
   - 一部不足している → 「追加実装が必要」
   - 未実装 → 「新規実装が必要」
3. 判定結果を`outputs/phase-1/implementation-status.md`に出力する

**期待される成果物**:

- `outputs/phase-1/implementation-status.md`（実装状況判定書）

---

## 参照資料

| 参照資料               | パス                                                                         | 内容               |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------ |
| 元タスク指示書         | `docs/30-workflows/unassigned-task/task-claude-cli-renderer-api.md`          | 指摘内容・要件     |
| Preload API実装        | `apps/desktop/src/preload/index.ts`                                          | 既存実装           |
| IPCチャンネル定義      | `apps/desktop/src/preload/channels.ts`                                       | チャンネル一覧     |
| 型定義                 | `apps/desktop/src/preload/types.ts`                                          | ClaudeCliAPI型     |
| Claude CLI連携パターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | アーキテクチャ設計 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                      |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------- |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | Claude CLI連携パターン    |
| セキュリティ原則       | `.claude/skills/aiworkflow-requirements/references/security-principles.md`   | Electron IPC セキュリティ |

---

## 成果物

| 成果物         | パス                                       | 内容             |
| -------------- | ------------------------------------------ | ---------------- |
| 要件定義書     | `outputs/phase-1/requirements.md`          | 機能・非機能要件 |
| 実装状況判定書 | `outputs/phase-1/implementation-status.md` | 既存実装の評価   |

---

## 統合テスト連携（Phase 1〜11は必須）

IPC接続要件（Main→Renderer）を要件に明記する。具体的には:

- Preload APIがMain Processの`ClaudeCliManager`と正しく通信できること
- ストリーミングイベント（`onSessionOutput`, `onSessionStatus`）が正しく購読できること
- エラーハンドリングが適切に行われること

---

## 完了条件

- [ ] 元の指摘事項を確認し、期待される機能一覧を整理した
- [ ] 既存実装（`apps/desktop/src/preload/index.ts`等）を調査した
- [ ] 要件定義書（`outputs/phase-1/requirements.md`）を作成した
- [ ] 実装状況判定書（`outputs/phase-1/implementation-status.md`）を作成した
- [ ] IPC接続要件を要件定義書に明記した

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（開始Phase）
- **後続**: Phase 2へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/claude-cli-renderer-api/phase-2-design.md`
