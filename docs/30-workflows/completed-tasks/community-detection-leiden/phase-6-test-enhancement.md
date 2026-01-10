# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 6                          |
| Phase名    | テスト拡充                 |
| 前提Phase  | Phase 5 (実装)             |
| 後続Phase  | Phase 7 (カバレッジ確認)   |
| ステータス | 未実施                     |
| 作成日     | 2026-01-10                 |
| 機能名     | community-detection-leiden |

---

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標を達成する。統合テストを拡充し、フロントエンド・バックエンド接続の品質を確保する。

## 背景

TDDの第2フェーズ（Green）完了後、リファクタリングに進む前にテストを十分に拡充する必要がある。カバレッジが不足している状態でリファクタリングを行うと、バグの見逃しリスクが高まる。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: test-coverage-analysis

**パス**: `.claude/skills/test-coverage-analysis/SKILL.md`

**Trigger条件**:
テストカバレッジの分析・改善が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-6/coverage-report.md`（カバレッジ分析結果）

---

### スキル2: integration-testing

**パス**: `.claude/skills/integration-testing/SKILL.md`

**Trigger条件**:
統合テストの拡充が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-6/integration-test.md`（統合テスト実行結果）
- 追加の統合テストファイル

---

## 参照資料

| 参照資料      | パス                                         | 内容           |
| ------------- | -------------------------------------------- | -------------- |
| Phase 4成果物 | `outputs/phase-4/test-specification.md`      | テスト仕様     |
| Phase 4成果物 | `outputs/phase-4/integration-test-design.md` | 統合テスト設計 |
| 実装コード    | `packages/shared/src/services/graph/`        | 対象コード     |

---

## 成果物

| 成果物             | パス                                                | 内容               |
| ------------------ | --------------------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                | カバレッジ分析結果 |
| 統合テスト結果     | `outputs/phase-6/integration-test.md`               | 統合テスト実行結果 |
| 追加テストファイル | `packages/shared/src/services/graph/__tests__/*.ts` | 追加テストコード   |

---

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

---

## 結合テストカバレッジ基準

| 指標                         | 目標 |
| ---------------------------- | ---- |
| APIエンドポイント            | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| 外部連携ポイント             | 100% |

---

## 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）:

| テストカテゴリ     | 検証項目                                 | 目標 |
| ------------------ | ---------------------------------------- | ---- |
| GraphStore連携     | getEntity/getRelation経由のデータ取得    | 100% |
| データフロー       | GraphStore → Leiden → Community → DB保存 | 100% |
| エラーハンドリング | GraphStore障害時のResult.err伝播         | 80%+ |
| 再現性             | 同一seed指定時の結果一致                 | 100% |
| 境界値             | 空グラフ、1ノード、maxLevels境界         | 100% |

---

## 実行手順

### 1. カバレッジ測定

```bash
pnpm --filter @repo/shared test:coverage
```

### 2. ギャップ分析

- 未到達の行/分岐/関数を特定
- 統合テスト不足領域を特定

### 3. 追加テスト作成

追加すべきテストケース:

#### LeidenAlgorithm 追加テスト

```typescript
describe("LeidenAlgorithm - 追加テスト", () => {
  it("minCommunitySize以下のコミュニティはマージされる", async () => {});
  it("maxIterationsに達すると収束判定する", async () => {});
  it("disconnected graphでも正しく動作する", async () => {});
  it("self-loopエッジを正しく処理する", async () => {});
});
```

#### CommunityDetector 追加テスト

```typescript
describe("CommunityDetector - 追加テスト", () => {
  it("存在しないentityIdでもエラーにならない", async () => {});
  it("deleteAll後にsaveResultsが正しく動作する", async () => {});
  it("concurrent detectでも正しく動作する", async () => {});
});
```

### 4. 統合テスト再実行

```bash
pnpm --filter @repo/shared test:integration
```

---

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成（API 100%, シナリオ 100%/80%）
- [ ] 統合テストの追加が完了している
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 5 が完了していること
- **後続**: Phase 7 へ進む

---

## スキルフィードバック記録（Phase完了後に記入）

| スキル                 | 結果 | 備考 |
| ---------------------- | ---- | ---- |
| test-coverage-analysis |      |      |
| integration-testing    |      |      |

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/community-detection-leiden/phase-7-coverage-verification.md`
