# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 1                               |
| Phase名    | 要件定義                        |
| カテゴリ   | 要件                            |
| 前提Phase  | -                               |
| 後続Phase  | Phase 2                         |
| ステータス | 未実施                          |
| 作成日     | 2026-01-16                      |
| 機能名     | skill-ipc-handlers-registration |

---

## 目的

修正対象のスコープと影響範囲を明確にし、バグ修正の要件を確定する。

## 背景

`skill:list-imported` IPCハンドラーが登録されていないため、Agent画面でスキル一覧が表示されない。この問題の根本原因と修正範囲を特定する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: エラー状況の確認

**目的**: 現在発生しているエラーの詳細を把握する

**実行手順**:

1. エラーログを確認し、発生しているエラーメッセージを記録する
2. エラーが発生するタイミング（Agent画面アクセス時）を特定する
3. 影響を受ける機能（スキル一覧、インポート、削除）をリストアップする

**期待される成果物**:

- エラー状況レポート

---

### タスク2: 根本原因の確認

**目的**: エラーの根本原因を特定する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` を確認し、ハンドラー実装が存在することを確認
2. `apps/desktop/src/main/ipc/index.ts` を確認し、`registerSkillHandlers` が呼び出されていないことを確認
3. `apps/desktop/src/preload/channels.ts` でチャネル定義が正しいことを確認

**期待される成果物**:

- 根本原因分析レポート

---

### タスク3: 修正スコープの特定

**目的**: 修正が必要なファイルと範囲を特定する

**実行手順**:

1. 修正対象ファイルをリストアップする
2. 追加が必要なインポート文を特定する
3. 追加が必要な依存関係（SkillService等）を特定する

**期待される成果物**:

- 修正スコープ定義

---

## 参照資料

| 参照資料               | パス                                                                         | 内容           |
| ---------------------- | ---------------------------------------------------------------------------- | -------------- |
| スキル管理サービス仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | IPC API仕様    |
| IPC通信セキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | sender検証要件 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料              | パス                                                                         | 内容                |
| --------------------- | ---------------------------------------------------------------------------- | ------------------- |
| architecture-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | スキル管理サービス  |
| security-api-electron | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | IPC通信セキュリティ |

---

## 成果物

| 成果物           | パス                              | 内容                     |
| ---------------- | --------------------------------- | ------------------------ |
| 要件定義レポート | `outputs/phase-1/requirements.md` | エラー状況・根本原因分析 |
| 修正スコープ定義 | `outputs/phase-1/scope.md`        | 修正対象ファイル一覧     |

---

## 統合テスト連携（Phase 1〜11は必須）

IPC通信要件を要件に明記:

- `skill:list-available` - スキルスキャン
- `skill:list-imported` - インポート済み取得
- `skill:import` - スキルインポート
- `skill:remove` - インポート解除
- `skill:get-detail` - スキル詳細取得

---

## 完了条件

- [ ] エラーメッセージとスタックトレースを記録した
- [ ] 根本原因（registerSkillHandlers未呼び出し）を確認した
- [ ] 修正対象ファイル（index.ts）を特定した
- [ ] 必要な依存関係（SkillService等）を特定した

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし
- **後続**: Phase 2 へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 実行タスク

- （記入）

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

`docs/30-workflows/skill-ipc-handlers-registration/phase-2-design.md`
