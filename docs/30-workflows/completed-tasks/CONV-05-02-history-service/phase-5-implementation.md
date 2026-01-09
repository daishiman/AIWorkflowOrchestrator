# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 5                          |
| Phase名    | 実装                       |
| 前提Phase  | Phase 4 (テスト作成)       |
| 後続Phase  | Phase 6 (テスト拡充)       |
| ステータス | 未実施                     |
| 作成日     | 2026-01-08                 |
| 機能名     | CONV-05-02-history-service |

---

## 目的

TDD Green フェーズ：テストを通す最小限の実装を行う。

## 背景

Phase 4で作成した失敗するテスト（Red状態）を成功させる（Green状態）実装を行う。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: clean-code-practices

**パス**: `.claude/skills/clean-code-practices/SKILL.md`

**Trigger条件**:

- クリーンコードに従った実装が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `packages/shared/src/services/history/history-service.ts`（コード成果物）
- `packages/shared/src/services/history/types.ts`（コード成果物）

---

### スキル2: repository-pattern

**パス**: `.claude/skills/repository-pattern/SKILL.md`

**Trigger条件**:

- リポジトリパターンに従った実装が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-5/implementation-summary.md`

---

## 参照資料

| 参照資料     | パス                                                                     | 内容                 |
| ------------ | ------------------------------------------------------------------------ | -------------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md`                                  | 期待動作             |
| テストコード | `packages/shared/src/services/history/__tests__/history-service.test.ts` | Redテスト            |
| API仕様      | `outputs/phase-2/api-specification.md`                                   | インターフェース定義 |
| タスク指示書 | `docs/30-workflows/unassigned-task/task-05-02-history-service.md`        | 実装仕様詳細         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                          | 内容       |
| ---------------- | ------------------------------------------------------------- | ---------- |
| コーディング規約 | `.claude/skills/aiworkflow-requirements/references/coding.md` | コード規約 |

---

## 成果物

| 成果物       | パス                                                      | 内容                 |
| ------------ | --------------------------------------------------------- | -------------------- |
| 履歴サービス | `packages/shared/src/services/history/history-service.ts` | HistoryServiceクラス |
| 型定義       | `packages/shared/src/services/history/types.ts`           | 型・スキーマ定義     |
| 実装サマリー | `outputs/phase-5/implementation-summary.md`               | 実装内容の概要       |

---

## 実装指針

### ファイル構成

```
packages/shared/src/services/history/
├── history-service.ts    # HistoryServiceクラス
├── types.ts              # 型定義・Zodスキーマ
├── index.ts              # エクスポート
└── __tests__/
    └── history-service.test.ts
```

### 実装内容（タスク指示書より）

- `IHistoryService` インターフェースの実装
- `HistoryService` クラス
  - `getFileHistory()` - 履歴一覧取得
  - `getVersionDetail()` - バージョン詳細取得
  - `getVersionDiff()` - 差分取得
  - `restoreToVersion()` - バージョン復元
  - `getLatestVersion()` - 最新バージョン取得
  - `getVersionCount()` - バージョン数取得

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 5での必須アクション

- [ ] フロント/バック接続の実装（Repository層連携）
- [ ] テスト支援コード整備（モックファクトリ等）
- [ ] エラーハンドリングの統合パターン実装

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- history-service
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 完了条件

- [ ] Phase 4のテストがすべて成功している（Green状態）
- [ ] HistoryServiceクラスが実装されている
- [ ] 型定義（types.ts）が実装されている
- [ ] エクスポート（index.ts）が設定されている
- [ ] TypeScript型エラーがない
- [ ] ESLint警告がない
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 使用スキル

- clean-code-practices: {{result}}
- repository-pattern: {{result}}

### TDD状態

- Green状態確認: {{Yes/No}}
- 成功テスト数: {{数}}

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

`docs/30-workflows/CONV-05-02-history-service/phase-6-test-expansion.md`
