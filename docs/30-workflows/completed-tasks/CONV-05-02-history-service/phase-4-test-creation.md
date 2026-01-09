# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 4                            |
| Phase名    | テスト作成                   |
| 前提Phase  | Phase 3 (設計レビューゲート) |
| 後続Phase  | Phase 5 (実装)               |
| ステータス | 未実施                       |
| 作成日     | 2026-01-08                   |
| 機能名     | CONV-05-02-history-service   |

---

## 目的

TDD Red フェーズ：期待される動作を検証するテストを実装より先に作成する。

## 背景

Phase 3で承認された設計に基づき、失敗するテスト（Red状態）を作成する。
テストファーストにより、実装の期待動作を明確化する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: tdd-red-green-refactor

**パス**: `.claude/skills/tdd-red-green-refactor/SKILL.md`

**Trigger条件**:

- TDDサイクルのRedフェーズを実行する場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行（Redフェーズのみ）
3. 成果物を下記のパスに出力

**期待される成果物**:

- `packages/shared/src/services/history/__tests__/history-service.test.ts`（コード成果物）
- `outputs/phase-4/test-specification.md`（ドキュメント成果物）

---

### スキル2: test-doubles

**パス**: `.claude/skills/test-doubles/SKILL.md`

**Trigger条件**:

- モック・スタブの設計が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-4/test-cases.md`（モック・スタブ設計含む）

---

## 参照資料

| 参照資料         | パス                                                              | 内容                     |
| ---------------- | ----------------------------------------------------------------- | ------------------------ |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`                          | テスト可能な受け入れ条件 |
| API仕様          | `outputs/phase-2/api-specification.md`                            | サービスAPI・Zodスキーマ |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`                         | 承認済み設計             |
| タスク指示書     | `docs/30-workflows/unassigned-task/task-05-02-history-service.md` | テストケース例           |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料   | パス                                                           | 内容                   |
| ---------- | -------------------------------------------------------------- | ---------------------- |
| テスト規約 | `.claude/skills/aiworkflow-requirements/references/testing.md` | テスト設計ガイドライン |

---

## 成果物

| 成果物       | パス                                                                     | 内容                      |
| ------------ | ------------------------------------------------------------------------ | ------------------------- |
| テストコード | `packages/shared/src/services/history/__tests__/history-service.test.ts` | ユニットテスト（Red状態） |
| テスト仕様書 | `outputs/phase-4/test-specification.md`                                  | テスト設計・観点          |
| テストケース | `outputs/phase-4/test-cases.md`                                          | モック・スタブ設計        |

---

## テストケース設計

### ユニットテスト

タスク指示書のテストケースを参考に以下を作成:

```typescript
describe("HistoryService", () => {
  it("ファイルの履歴一覧を取得できる", async () => {});
  it("ページネーションが正しく動作する", async () => {});
  it("バージョン詳細を取得できる", async () => {});
  it("2バージョン間の差分を取得できる", async () => {});
  it("特定バージョンに復元できる", async () => {});
  it("存在しないバージョンの復元はエラー", async () => {});
  it("最新バージョンを取得できる", async () => {});
  it("バージョン数を取得できる", async () => {});
});
```

### 統合テストシナリオ

| シナリオカテゴリ   | 検証内容                          |
| ------------------ | --------------------------------- |
| データフローテスト | HistoryService→Repository→Mock DB |
| エラーハンドリング | Repository障害時のエラー伝播      |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 4での必須アクション

- [ ] 統合テストシナリオを作成（データフロー/エラーハンドリング）
- [ ] ConversionRepository/FileRepositoryのモック設計
- [ ] Result型エラーハンドリングのテスト設計

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- history-service
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 完了条件

- [ ] 受け入れ基準ごとにユニットテストがある
- [ ] 統合テストシナリオが定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] モック・スタブ設計が完了している
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 1, 2, 3 が完了していること
- **後続**: Phase 5 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

### 使用スキル

- tdd-red-green-refactor: {{result}}
- test-doubles: {{result}}

### TDD状態

- Red状態確認: {{Yes/No}}
- 失敗テスト数: {{数}}

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

`docs/30-workflows/CONV-05-02-history-service/phase-5-implementation.md`
