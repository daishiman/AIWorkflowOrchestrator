# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 1                    |
| Phase名    | 要件定義             |
| 前提Phase  | -                    |
| 後続Phase  | Phase 2              |
| ステータス | 未実施               |
| 作成日     | 2026-01-11           |
| 機能名     | history-ipc-handlers |

---

## 目的

IPCハンドラー実装に必要な要件を明確化し、既存仕様との整合性を確認する。
4つのIPCチャンネルの仕様、データ型、エラーハンドリング方針を定義する。

## 背景

履歴/ログ表示UIでは、レンダラープロセスからメインプロセスのHistoryServiceにアクセスする必要がある。Electronのセキュリティモデルに従い、IPCを介した通信を行う。本Phaseでは、その通信仕様の要件を定義する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: システム仕様の確認

**目的**: 既存のUI仕様・セキュリティ仕様を確認し、IPCハンドラーの要件を把握する。

**実行手順**:

1. `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md` を読み、IPCチャンネル名・データ型を確認する
2. `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` を読み、Electronセキュリティ要件を確認する
3. 確認した内容を `outputs/phase-1/requirements-analysis.md` に記録する

**期待される成果物**:

- `outputs/phase-1/requirements-analysis.md`（要件分析結果）

---

### タスク2: IPCチャンネル仕様の定義

**目的**: 4つのIPCチャンネルの詳細仕様を定義する。

**実行手順**:

1. 各チャンネルのパラメータ・戻り値型を定義する
2. Result型パターンの適用方法を決定する
3. エラーコード・エラーメッセージの設計方針を決定する
4. `outputs/phase-1/ipc-channel-spec.md` に仕様を記録する

**期待される成果物**:

- `outputs/phase-1/ipc-channel-spec.md`（IPCチャンネル仕様）

---

### タスク3: 受け入れ基準の定義

**目的**: 実装完了の判定基準を明確に定義する。

**実行手順**:

1. 機能要件（4チャンネルの動作）を定義する
2. 非機能要件（セキュリティ・パフォーマンス）を定義する
3. テスト観点を洗い出す
4. `outputs/phase-1/acceptance-criteria.md` に記録する

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`（受け入れ基準）

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                          |
| ---------------------- | ---------------------------------------------------------------------------- | ----------------------------- |
| 履歴/ログ表示UI仕様    | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md`   | IPCチャンネル名・データ型定義 |
| Electronセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | IPC通信セキュリティ要件       |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | Result型パターン              |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | エラー処理方針                |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "IPC"`

---

## 成果物

| 成果物            | パス                                       | 内容                   |
| ----------------- | ------------------------------------------ | ---------------------- |
| 要件分析結果      | `outputs/phase-1/requirements-analysis.md` | システム仕様の分析結果 |
| IPCチャンネル仕様 | `outputs/phase-1/ipc-channel-spec.md`      | 4チャンネルの詳細仕様  |
| 受け入れ基準      | `outputs/phase-1/acceptance-criteria.md`   | 完了判定の基準         |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 1での統合テスト連携アクション

IPC通信要件（チャンネル名/データフロー）を要件に明記すること。

| 項目          | 内容                                         |
| ------------- | -------------------------------------------- |
| IPC通信要件   | 4チャンネルの通信仕様を明記                  |
| データフロー  | Renderer → Main → HistoryService → DB の流れ |
| エラー伝播    | Result型でのエラー返却仕様を明記             |
| 認証/認可要件 | IPC sender検証の要否を判断                   |

---

## 完了条件

- [ ] ui-ux-history-panel.md の IPC仕様を確認した
- [ ] security-api-electron.md のセキュリティ要件を確認した
- [ ] 4つのIPCチャンネルの仕様を定義した
- [ ] Result型パターンの適用方法を決定した
- [ ] 受け入れ基準を定義した
- [ ] IPC通信要件をドキュメント化した
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（最初のPhase）
- **後続**: Phase 2（設計）へ進む

---

## IPCチャンネル仕様（参考）

| チャンネル                  | パラメータ                                         | 戻り値                                        |
| --------------------------- | -------------------------------------------------- | --------------------------------------------- |
| `history:getFileHistory`    | `fileId: string, options?: PaginationOptions`      | `Result<PaginatedResult<VersionHistoryItem>>` |
| `history:getVersionDetail`  | `conversionId: string`                             | `Result<VersionDetailData>`                   |
| `history:getConversionLogs` | `conversionId: string, options?: LogFilterOptions` | `Result<PaginatedResult<ConversionLog>>`      |
| `history:restoreVersion`    | `fileId: string, conversionId: string`             | `Result<VersionHistoryItem>`                  |

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 実行タスク

- タスク1（システム仕様の確認）: [結果を記入]
- タスク2（IPCチャンネル仕様の定義）: [結果を記入]
- タスク3（受け入れ基準の定義）: [結果を記入]

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

`docs/30-workflows/history-ipc-handlers/phase-2-design.md`
