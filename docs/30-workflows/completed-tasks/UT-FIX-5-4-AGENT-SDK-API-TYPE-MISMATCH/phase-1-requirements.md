# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 1                                      |
| Phase名    | 要件定義                               |
| 前提Phase  | -                                      |
| 後続Phase  | Phase 2                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-02-10                             |
| 機能名     | ut-fix-5-4-agent-sdk-api-type-mismatch |
| タスクID   | UT-FIX-5-4                             |

---

## 目的

AgentSDKAPI インターフェースの `abort()` メソッドの型定義不一致を修正するための要件を明確化する。

## 背景

現在、`abort()` メソッドの型定義と実装に不一致がある：

| ファイル                                     | 現状の型定義         | 実装の戻り値    |
| -------------------------------------------- | -------------------- | --------------- |
| `apps/desktop/src/preload/types.ts` (行1289) | `abort: () => void;` | `Promise<void>` |
| `packages/shared/src/agent/types.ts` (行236) | `abort(): void;`     | `Promise<void>` |

この不一致により：

- TypeScript の型チェックが実装と乖離している
- `abort()` の戻り値を `await` できない
- 中断処理の完了を適切に待機できない

### 技術的根拠

`safeInvoke()` は `ipcRenderer.invoke()` をラップしており、`invoke()` は常に `Promise` を返す。
したがって、`abort()` の戻り値型は `void` ではなく `Promise<void>` が正しい。

> 参照: security-electron-ipc.md - safeInvokeラッパーパターン

---

## 実行タスク

### タスク1: 要件抽出

**目的**: 型定義不一致から機能要件・非機能要件を抽出する

**実行手順**:

1. 修正対象ファイルを特定する
2. `abort()` メソッドの呼び出し箇所を調査する
3. 型修正による影響範囲を特定する

**期待される成果物**:

- 機能要件一覧（FR-001〜FR-002）
- 非機能要件一覧（NFR-001〜NFR-002）

---

### タスク2: 受け入れ基準作成

**目的**: 各要件に対して検証可能な受け入れ基準を定義する

**実行手順**:

1. 型定義変更の検証方法を定義する
2. TypeScript コンパイルエラーがないことを確認する方法を定義する
3. 既存機能への影響がないことを確認する方法を定義する

**期待される成果物**:

- 受け入れ基準定義書

---

### タスク3: FR/NFR分類と優先度設定

**目的**: 要件を分類し、実装優先度を決定する

**実行手順**:

1. 要件をFR/NFRに分類する
2. 優先度（Must/Should/Could）を設定する
3. 依存関係を特定する

**期待される成果物**:

- 優先度付き要件一覧
- 依存関係マップ

---

## 参照資料

| 参照資料        | パス                                                                                        | 内容                 |
| --------------- | ------------------------------------------------------------------------------------------- | -------------------- |
| Agent IPC API   | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | Agent SDK IPC定義    |
| Preload型定義   | `apps/desktop/src/preload/types.ts`                                                         | AgentSDKAPI型定義    |
| 共有型定義      | `packages/shared/src/agent/types.ts`                                                        | AgentSDK型定義       |
| IPC実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン集       |
| IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | safeInvokeパターン   |
| AgentSDKAPI仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | インターフェース定義 |

---

## 成果物

| 成果物       | パス                                         | 内容             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲         |

---

## 統合テスト連携【必須】

接続要件（API/認証/データフロー）を要件に明記する:

| 接続要件カテゴリ | 記載内容                         |
| ---------------- | -------------------------------- |
| IPC通信          | `agent:abort` チャンネルの型契約 |
| API契約          | AgentSDKAPI インターフェース定義 |
| 型安全性         | Preload/Shared 間の型一貫性      |

---

## アーキテクチャ層別要件

| 層                  | 確認観点                                              |
| ------------------- | ----------------------------------------------------- |
| Preload（types.ts） | AgentSDKAPI.abort の戻り値型を `Promise<void>` に変更 |
| Shared（types.ts）  | AgentSDK.abort の戻り値型を `Promise<void>` に変更    |
| 呼び出し箇所        | `await abort()` パターンへの対応確認                  |
| TypeScript          | 型チェック通過の確認                                  |

---

## 既知の落とし穴への対応

| Pitfall ID | 問題                | 対応策                                                 |
| ---------- | ------------------- | ------------------------------------------------------ |
| P23        | API二重定義の型管理 | preload/types.ts と shared/agent/types.ts を同時に更新 |
| P24        | Store型定義不統一   | 正本（shared）とPreload層の型を一致させる              |

---

## 完了条件

- [ ] 修正対象ファイルが特定されている（2ファイル）
- [ ] `abort()` メソッドの呼び出し箇所が調査されている
- [ ] 型修正による影響範囲が特定されている
- [ ] 各要件に受け入れ基準がある
- [ ] FR/NFRが分類されている
- [ ] 優先度が設定されている
- [ ] 接続要件（IPC型契約）が明記されている
- [ ] アーキテクチャ層別の要件が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（ワークフロー開始Phase）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-FIX-5-4-AGENT-SDK-API-TYPE-MISMATCH/phase-2-design.md`
