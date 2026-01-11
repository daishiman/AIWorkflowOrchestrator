# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 2                    |
| Phase名    | 設計                 |
| 前提Phase  | Phase 1              |
| 後続Phase  | Phase 3              |
| ステータス | 未実施               |
| 作成日     | 2026-01-11           |
| 機能名     | history-ipc-handlers |

---

## 目的

IPCハンドラーの詳細設計を行い、実装方針を確定する。
ファイル構成、関数インターフェース、エラーハンドリング戦略を設計する。

## 背景

Phase 1で定義した要件に基づき、具体的な実装設計を行う。Electronのベストプラクティスに従い、セキュアで保守性の高い設計を目指す。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ファイル構成の設計

**目的**: IPCハンドラーのファイル構成と配置を決定する。

**実行手順**:

1. 既存のIPCハンドラー構成（`apps/desktop/src/main/ipc/`）を確認する
2. historyHandlers.ts の配置場所を決定する
3. 関連ファイル（型定義、ユーティリティ）の配置を決定する
4. `outputs/phase-2/file-structure.md` に記録する

**期待される成果物**:

- `outputs/phase-2/file-structure.md`（ファイル構成設計）

---

### タスク2: 関数インターフェースの設計

**目的**: IPCハンドラー関数のインターフェースを設計する。

**実行手順**:

1. `registerHistoryHandlers` 関数のシグネチャを設計する
2. HistoryServiceとの依存関係を設計する（DI方式）
3. 各ハンドラーのパラメータ・戻り値型を設計する
4. `outputs/phase-2/interface-design.md` に記録する

**期待される成果物**:

- `outputs/phase-2/interface-design.md`（インターフェース設計）

---

### タスク3: エラーハンドリング設計

**目的**: エラー発生時の処理方針を設計する。

**実行手順**:

1. Result型パターンの適用方法を設計する
2. エラーコード体系を設計する
3. ログ出力方針を決定する
4. `outputs/phase-2/error-handling-design.md` に記録する

**期待される成果物**:

- `outputs/phase-2/error-handling-design.md`（エラーハンドリング設計）

---

### タスク4: 設計書の統合

**目的**: 全設計内容を統合した設計書を作成する。

**実行手順**:

1. タスク1〜3の成果物を統合する
2. クラス図・シーケンス図を作成する
3. `outputs/phase-2/design-document.md` に統合設計書を作成する

**期待される成果物**:

- `outputs/phase-2/design-document.md`（統合設計書）

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                          |
| ---------------------- | ---------------------------------------------------------------------------- | ----------------------------- |
| 履歴/ログ表示UI仕様    | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md`   | IPCチャンネル名・データ型定義 |
| Electronセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | IPC通信セキュリティ要件       |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | Result型パターン              |

---

## 成果物

| 成果物                 | パス                                       | 内容                 |
| ---------------------- | ------------------------------------------ | -------------------- |
| ファイル構成設計       | `outputs/phase-2/file-structure.md`        | ファイル配置の設計   |
| インターフェース設計   | `outputs/phase-2/interface-design.md`      | 関数シグネチャの設計 |
| エラーハンドリング設計 | `outputs/phase-2/error-handling-design.md` | エラー処理の設計     |
| 統合設計書             | `outputs/phase-2/design-document.md`       | 全設計の統合         |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 2での統合テスト連携アクション

IPC契約（チャンネル・パラメータ・戻り値型）を設計に反映すること。

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| IPC契約定義  | 各チャンネルのパラメータ・戻り値型を明確化    |
| 統合ポイント | HistoryService との接続インターフェースを設計 |
| エラー契約   | Result型でのエラー形式を統一                  |

---

## 完了条件

- [ ] ファイル構成が設計された
- [ ] 関数インターフェースが設計された
- [ ] エラーハンドリング方針が決定された
- [ ] 統合設計書が作成された
- [ ] IPC契約が明確に定義された
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 設計概要（参考）

### ファイル構成

```
apps/desktop/src/main/
├── ipc/
│   ├── historyHandlers.ts      # IPCハンドラー実装
│   ├── __tests__/
│   │   └── historyHandlers.test.ts
│   └── index.ts                # エクスポート追加
├── services/
│   └── HistoryService.ts       # 既存（依存先）
└── main.ts                     # ハンドラー登録追加
```

### 関数シグネチャ

```typescript
// historyHandlers.ts
export function registerHistoryHandlers(historyService: HistoryService): void;
```

### シーケンス図

```
Renderer          preload           Main               HistoryService
   |                 |                |                      |
   |-- invoke ------>|                |                      |
   |                 |-- ipcMain.handle -->|                 |
   |                 |                |-- getFileHistory --->|
   |                 |                |<-- Result<...> ------|
   |                 |<-- Result<...> ---|                   |
   |<-- Result<...> -|                |                      |
```

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 実行タスク

- タスク1（ファイル構成の設計）: [結果を記入]
- タスク2（関数インターフェースの設計）: [結果を記入]
- タスク3（エラーハンドリング設計）: [結果を記入]
- タスク4（設計書の統合）: [結果を記入]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/history-ipc-handlers/phase-3-design-review.md`
