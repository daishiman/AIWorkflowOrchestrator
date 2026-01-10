# Phase 4: テスト作成（TDD: Red） - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 4                          |
| Phase名    | テスト作成（TDD: Red）     |
| 前提Phase  | Phase 3 (設計レビュー)     |
| 後続Phase  | Phase 5 (実装)             |
| ステータス | 未実施                     |
| 作成日     | 2026-01-10                 |
| 機能名     | community-detection-leiden |

---

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。Leidenアルゴリズムとコミュニティ検出機能のテストケースを網羅的に設計・実装する。

## 背景

TDD（テスト駆動開発）の第1フェーズとして、テストを先に作成することで仕様を明確化し、実装の品質を担保する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: tdd-principles

**パス**: `.claude/skills/tdd-principles/SKILL.md`

**Trigger条件**:
テスト駆動開発の原則に従ったテスト設計が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-4/test-specification.md`（テスト仕様書）

---

### スキル2: boundary-value-analysis

**パス**: `.claude/skills/boundary-value-analysis/SKILL.md`

**Trigger条件**:
境界値テスト、エッジケースの特定が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-4/test-cases.md`（テストケース一覧）

---

### スキル3: integration-testing

**パス**: `.claude/skills/integration-testing/SKILL.md`

**Trigger条件**:
コンポーネント間の連携テスト設計が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-4/integration-test-design.md`（統合テスト設計書）

---

## 参照資料

| 参照資料       | パス                                                                         | 内容               |
| -------------- | ---------------------------------------------------------------------------- | ------------------ |
| Phase 1成果物  | `outputs/phase-1/acceptance-criteria.md`                                     | 受け入れ基準       |
| Phase 2成果物  | `outputs/phase-2/architecture-design.md`                                     | アーキテクチャ設計 |
| Phase 3成果物  | `outputs/phase-3/design-review-result.md`                                    | 設計レビュー結果   |
| 元タスク指示書 | `docs/30-workflows/unassigned-task/task-08-02-community-detection-leiden.md` | テストケース例     |

---

## 成果物

| 成果物           | パス                                                                      | 内容                     |
| ---------------- | ------------------------------------------------------------------------- | ------------------------ |
| テスト仕様書     | `outputs/phase-4/test-specification.md`                                   | テスト設計               |
| テストケース一覧 | `outputs/phase-4/test-cases.md`                                           | 境界値・エッジケース     |
| 統合テスト設計書 | `outputs/phase-4/integration-test-design.md`                              | 統合テスト設計           |
| テストファイル   | `packages/shared/src/services/graph/__tests__/community-detector.test.ts` | 実際のテストコード       |
| テストファイル   | `packages/shared/src/services/graph/__tests__/leiden-algorithm.test.ts`   | Leidenアルゴリズムテスト |

---

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ     | 検証内容                                 | テストファイル              |
| -------------------- | ---------------------------------------- | --------------------------- |
| GraphStore連携テスト | getEntity/getRelation経由のデータ取得    | `*.integration.test.ts`     |
| データフローテスト   | GraphStore → Leiden → Community → DB保存 | `*.flow.test.ts`            |
| エラーハンドリング   | GraphStore障害時のResult.err伝播         | `*.error.test.ts`           |
| 再現性テスト         | 同一seed指定時の結果一致                 | `*.reproducibility.test.ts` |

---

## テストケース設計指針

### LeidenAlgorithm テストケース

```typescript
describe("LeidenAlgorithm", () => {
  it("コミュニティを検出できる", async () => {
    // resolution: 1.0 でコミュニティ検出
    // 期待: communities.length > 0, totalModularity > 0
  });

  it("階層的なコミュニティ構造を生成する", async () => {
    // maxLevels: 3 で階層検出
    // 期待: levels <= 3, 親子関係が設定されている
  });

  it("resolution パラメータでコミュニティサイズが変わる", async () => {
    // resolution: 0.5 vs 2.0 で比較
    // 期待: 高解像度でより多くのコミュニティ
  });

  it("seedを指定すると再現可能な結果が得られる", async () => {
    // 同一seed指定で2回実行
    // 期待: 結果が一致
  });

  it("空のグラフでもエラーにならない", async () => {
    // nodes: [], edges: []
    // 期待: 空のCommunityStructureが返る
  });
});
```

### CommunityDetector テストケース

```typescript
describe("CommunityDetector", () => {
  it("検出結果を保存・取得できる", async () => {
    // detect() → saveResults() → getCommunitiesByLevel()
    // 期待: 保存したコミュニティが取得できる
  });

  it("エンティティが属するコミュニティを取得できる", async () => {
    // getCommunitiesForEntity(entityId)
    // 期待: 該当エンティティのコミュニティリスト
  });

  it("GraphStoreからデータを正しく取得できる", async () => {
    // モックGraphStoreでデータ取得テスト
    // 期待: ノードとエッジが正しく取得される
  });
});
```

---

## 完了条件

- [ ] 受け入れ基準ごとにユニットテストがある
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている（Line 80%+）
- [ ] 境界値テストが含まれている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5 へ進む

---

## スキルフィードバック記録（Phase完了後に記入）

| スキル                  | 結果 | 備考 |
| ----------------------- | ---- | ---- |
| tdd-principles          |      |      |
| boundary-value-analysis |      |      |
| integration-testing     |      |      |

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/community-detection-leiden/phase-5-implementation.md`
