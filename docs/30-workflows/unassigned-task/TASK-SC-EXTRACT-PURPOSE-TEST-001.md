# extractPurposeFromSkillMd frontmatter なしケースのテスト補充 - タスク指示書

## メタ情報

```yaml
issue_number: 2376
```

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | TASK-SC-EXTRACT-PURPOSE-TEST-001                             |
| タスク名     | extractPurposeFromSkillMd frontmatter なしケースのテスト補充 |
| 分類         | 改善                                                         |
| 対象機能     | SkillCreatorService - extractPurposeFromSkillMd メソッド     |
| 優先度       | 低                                                           |
| 見積もり規模 | 小規模                                                       |
| ステータス   | 未実施                                                       |
| 発見元       | Phase 12                                                     |
| 発見日       | 2026-04-21                                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-SC-CREATOR-UPDATE-IMPL-001` で追加された `extractPurposeFromSkillMd()` メソッドは、frontmatter が存在しない SKILL.md を渡した場合に `null` を返す実装になっている。この `null` 返却は `description` フォールバックで吸収される設計だが、このケースの明示的なテストが不在である。

### 1.2 問題点・課題

- `extractPurposeFromSkillMd()` に frontmatter なしの SKILL.md を渡した場合のテストが存在しない
- `null` 返却 → description フォールバックの連鎖が正しく動作することが検証されていない
- 将来のリファクタリング時に null フォールバック契約が壊れても検出できない

### 1.3 放置した場合の影響

- `extractPurposeFromSkillMd()` の null 返却ケースが意図せず変更された場合、テストが検出できない
- frontmatter なしのスキルファイルを update しようとした際に予期しないエラーが発生するリスク

---

## 2. 何を達成するか（What）

### 2.1 目的

`extractPurposeFromSkillMd()` の frontmatter なしケースをテストで明示的にカバーし、null 返却 → description フォールバックの連鎖を検証する。

### 2.2 最終ゴール

- frontmatter なしの SKILL.md に対して `extractPurposeFromSkillMd()` が `null` を返すことがテストで確認されている
- `null` 返却時に description フォールバックが正しく機能することがテストで確認されている

### 2.3 スコープ

#### 含むもの

- `extractPurposeFromSkillMd()` の frontmatter なしケースのユニットテスト追加
- null 返却 → description フォールバック連鎖のテスト追加

#### 含まないもの

- `extractPurposeFromSkillMd()` の実装変更
- frontmatter ありケースのテスト（既存テストでカバー済み）

### 2.4 成果物

- 追加されたテストケース（`SkillCreatorService.test.ts` 内）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-SC-CREATOR-UPDATE-IMPL-001` が完了済み
- 既存テスト（update-TC-01〜06）が全パスしている

### 3.2 依存タスク

- `TASK-SC-CREATOR-UPDATE-IMPL-001`（完了済み）

### 3.3 必要な知識

- `extractPurposeFromSkillMd()` の実装（frontmatter パース → description 抽出 → null 返却）
- Vitest のユニットテストの書き方

### 3.4 推奨アプローチ

- frontmatter なしの文字列（body のみの SKILL.md コンテンツ）を直接 `extractPurposeFromSkillMd()` に渡してテストする
- 返却値が `null` であることを `expect(result).toBeNull()` で検証する
- さらに、`null` を受け取った `runUpdateWorkflow()` が description フォールバックを使うことを検証する

---

## 4. 実行手順

### Phase構成

| Phase | フェーズ名 | 概要             |
| ----- | ---------- | ---------------- |
| 1     | 実装       | テストケース追加 |
| 2     | 検証       | テスト実行と確認 |

### Phase 1: 実装

#### 目的

frontmatter なしケースのテストを追加する。

#### 手順

1. `extractPurposeFromSkillMd()` の実装を `SkillCreatorService.ts` で確認する
2. frontmatter なしケースのテスト入力（body のみの文字列）を作成する
3. `extractPurposeFromSkillMd()` が `null` を返すことを検証するテストを追加する
4. `null` 返却時に `runUpdateWorkflow()` が description を使うことを検証するテストを追加する

#### 成果物

追加されたテストケース

#### 完了条件

テストコードが実装されていること

---

### Phase 2: 検証

#### 目的

テストが正しく動作することを確認する。

#### 手順

1. `pnpm --filter @repo/desktop test` を実行する
2. 新規テストがパスすることを確認する

#### 成果物

テスト実行結果

#### 完了条件

全テストパス

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] frontmatter なしの SKILL.md を渡した場合に `null` が返ることがテストで確認されている
- [ ] `null` 返却時に description フォールバックが正しく機能することがテストで確認されている

### 品質要件

- [ ] 全既存テストがパスする
- [ ] 新規テストがパスする
- [ ] TypeScript 型エラーがない

### ドキュメント要件

- [ ] 特になし

---

## 6. 検証方法

### テストケース

| テストID      | 内容                                               | 期待結果                             |
| ------------- | -------------------------------------------------- | ------------------------------------ |
| extract-TC-01 | frontmatter なしの文字列を渡す                     | `null` が返る                        |
| extract-TC-02 | `null` 返却時に `runUpdateWorkflow()` が実行される | description フォールバックが使われる |

### 検証手順

1. `pnpm --filter @repo/desktop test` で全テストパスを確認

---

## 7. リスクと対策

| リスク                                                        | 影響度 | 発生確率 | 対策                                         |
| ------------------------------------------------------------- | ------ | -------- | -------------------------------------------- |
| `extractPurposeFromSkillMd()` が private で直接テストできない | 中     | 低       | `runUpdateWorkflow()` 経由で間接的に検証する |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`
- `docs/30-workflows/TASK-SC-CREATOR-UPDATE-IMPL-001/` - 親タスクの仕様書

### 参考資料

- `docs/30-workflows/TASK-SC-CREATOR-UPDATE-IMPL-001/outputs/phase-12/unassigned-task-detection.md`

---

## 9. 備考

### 苦戦箇所【記入必須】

> 発見元: `docs/30-workflows/TASK-SC-CREATOR-UPDATE-IMPL-001/outputs/phase-12/unassigned-task-detection.md`

| 項目     | 内容                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------- |
| 症状     | `extractPurposeFromSkillMd()` の frontmatter なしケースのテストが不在                              |
| 原因     | null 返却 → description フォールバック連鎖が「設計上吸収される」として明示的テストが後回しになった |
| 対応     | 本タスクで明示的なテストケースを追加する（フォローアップタスク化）                                 |
| 再発防止 | null 返却パスがある場合は、その連鎖（フォールバック）も含めてテストケースを列挙する                |

### 補足事項

- null 返却 → description フォールバックで吸収される設計のため即座の対応は不要（優先度：低）
- 小規模タスクのため、1〜2時間で完了可能な見積もり
