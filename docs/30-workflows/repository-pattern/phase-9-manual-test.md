# Phase 9: 手動テスト検証 - Repository パターン実装

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 9                             |
| Phase名    | 手動テスト検証                |
| 前提Phase  | Phase 8（最終レビューゲート） |
| 後続Phase  | Phase 10（ドキュメント更新）  |
| ステータス | 未実施                        |
| 作成日     | 2026-01-05                    |
| 機能名     | repository-pattern            |
| タスクID   | CONV-04-06                    |

---

## 目的

自動テストでカバーしきれない動作を手動で検証する。
実際のデータベースとの接続、エッジケース、統合動作を確認する。

## 背景

Repository層はデータアクセスの抽象化であり、
実際のDBとの接続動作を手動で確認することで、本番環境での動作を保証する。

---

## 使用スキル

> 本Phaseでは特定のスキルではなく、手動検証を実施します。

---

## 参照資料

| 参照資料         | パス                                         | 内容         |
| ---------------- | -------------------------------------------- | ------------ |
| 要件定義書       | `outputs/phase-1/requirements-definition.md` | 機能要件     |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`     | 受け入れ条件 |
| 最終レビュー結果 | `outputs/phase-8/final-review-result.md`     | レビュー結果 |
| Repositoryコード | `packages/shared/src/db/repositories/`       | 実装         |

---

## 成果物

| 成果物         | パス                                    | 内容           |
| -------------- | --------------------------------------- | -------------- |
| 手動テスト結果 | `outputs/phase-9/manual-test-result.md` | テスト結果記録 |

---

## 完了条件

- [ ] 実際のSQLiteデータベースとの接続動作が確認されている
- [ ] 各Repositoryの主要メソッドが正常動作することを確認
- [ ] エラーハンドリングが適切に動作することを確認
- [ ] ページネーションが正常動作することを確認
- [ ] 手動テスト結果が記録されている
- [ ] 成果物が `outputs/phase-9/` に出力されている
- [ ] `artifacts.json` の Phase 9 が更新されている

---

## 手動テスト項目

### 1. 接続確認

```typescript
// REPL または テストスクリプトで実行
import { createDatabase } from "../client";
import { createRepositories } from "./index";

const db = createDatabase(":memory:");
const repos = createRepositories(db);

// 接続確認
console.log("Repositories created:", Object.keys(repos));
```

### 2. CRUD操作確認

| #   | 操作     | 確認内容                     | 結果 |
| --- | -------- | ---------------------------- | ---- |
| 1   | create   | エンティティが作成されるか   | [ ]  |
| 2   | findById | IDで取得できるか             | [ ]  |
| 3   | findAll  | ページネーションが動作するか | [ ]  |
| 4   | update   | 更新が反映されるか           | [ ]  |
| 5   | delete   | 削除が動作するか             | [ ]  |
| 6   | exists   | 存在確認が正しいか           | [ ]  |
| 7   | count    | 件数が正しいか               | [ ]  |

### 3. エラーハンドリング確認

| #   | シナリオ         | 期待されるResult | 確認結果 |
| --- | ---------------- | ---------------- | -------- |
| 1   | 存在しないID検索 | ok(null)         | [ ]      |
| 2   | 重複キー作成     | err(RAGError)    | [ ]      |
| 3   | 存在しないID更新 | err(RAGError)    | [ ]      |
| 4   | 存在しないID削除 | err(RAGError)    | [ ]      |

### 4. Repository固有機能確認

#### FileRepository

| #   | メソッド       | 確認内容               | 結果 |
| --- | -------------- | ---------------------- | ---- |
| 1   | findByHash     | ハッシュで検索できるか | [ ]  |
| 2   | findByPath     | パスで検索できるか     | [ ]  |
| 3   | findByCategory | カテゴリで検索できるか | [ ]  |
| 4   | softDelete     | 論理削除が動作するか   | [ ]  |

#### ChunkRepository

| #   | メソッド       | 確認内容                   | 結果 |
| --- | -------------- | -------------------------- | ---- |
| 1   | findByFileId   | ファイルIDで検索できるか   | [ ]  |
| 2   | deleteByFileId | 一括削除が動作するか       | [ ]  |
| 3   | findAdjacent   | 隣接チャンクが取得できるか | [ ]  |

#### EntityRepository

| #   | メソッド                    | 確認内容                 | 結果 |
| --- | --------------------------- | ------------------------ | ---- |
| 1   | findByNormalizedNameAndType | 正規化名+タイプで検索    | [ ]  |
| 2   | findByType                  | タイプで検索できるか     | [ ]  |
| 3   | searchByName                | 部分一致検索が動作するか | [ ]  |
| 4   | upsert                      | Upsertが動作するか       | [ ]  |

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 10（ドキュメント更新）へ進む

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 9 実行記録

### テスト結果サマリー

| カテゴリ           | 成功  | 失敗  |
| ------------------ | ----- | ----- |
| 接続確認           | {{N}} | {{N}} |
| CRUD操作           | {{N}} | {{N}} |
| エラーハンドリング | {{N}} | {{N}} |
| 固有機能           | {{N}} | {{N}} |

### 発見事項

- スコープ外の発見事項:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/repository-pattern/phase-10-documentation.md`
