# Phase 5: 実装

## メタ情報

| 項目       | 内容                                                               |
| ---------- | ------------------------------------------------------------------ |
| Phase      | 5                                                                  |
| 機能名     | UT-TASK-SPEC-TEMPLATE-IMPROVEMENT-001                              |
| タスク名   | task-specification-creator テンプレートの validator 必須見出し強化 |
| 前提Phase  | Phase 4                                                            |
| 後続Phase  | Phase 6                                                            |
| 作成日     | 2026-04-06                                                         |
| ステータス | 完了                                                               |

## 目的

Phase 4 で作成した失敗テストが全て PASS になるよう、validator とテンプレートを修正する（TDD Green 状態）。

## 背景

修正対象は 3 ファイル:

1. `validate-phase12-implementation-guide.js` - `part2_usage_example` チェックロジックの修正
2. `implementation-guide-template.md` - `## Part 2` 配下の `### 使用例` 配置の明確化
3. `documentation-changelog-template.md` - 5 つの必須フィールド追加

## 実行タスク

### タスク1: validator 修正（Part-aware extraction）

**目的**: `part2_usage_example` チェックを確実な検査ロジックに修正する

**実行手順**:

1. `validate-phase12-implementation-guide.js` を開く
2. `extractSection()` を `## Part` 見出し単位で切り出すよう修正する:
   - 変更前: 次の `##` が出た時点で Part 2 を切断
   - 変更後: 次の `## Part \d+` までを Part 2 として保持する
3. `hasUsageExample()` 関数がコードブロック付きを要求する既存ロジックは維持する
4. 修正後の動作を確認するコマンドを記録する

**対象ファイル**: `.claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js`

---

### タスク2: implementation-guide-template.md 修正

**目的**: `## Part 2` 配下の `### 使用例` 配置を維持し、validator と整合させる

**実行手順**:

1. `implementation-guide-template.md` の `## Part 2` セクションを確認する
2. 「validator 最小骨格」セクションに記載された `### 使用例` とテンプレート本体の位置関係を確認する
3. 既存見出しの名称変更は行わず、内部 `##` セクションを維持したまま最小変更で整合を取る

**対象ファイル**: `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`

---

### タスク3: documentation-changelog-template.md 修正

**目的**: メタ情報テーブルに 5 つの必須フィールドを追加する

**実行手順**:

1. `documentation-changelog-template.md` を開く
2. メタ情報テーブルに以下のフィールドを追加する:
   - `| 変更者 | {{AUTHOR}} |`
   - `| 関連 Issue / PR | {{ISSUE_PR_LINK}} |`
   - `| validator 実行結果 | {{VALIDATOR_RESULT}} |`
   - `| current / baseline | {{CURRENT_BASELINE}} |`
   - `| artifacts 同期結果 | {{ARTIFACTS_SYNC_RESULT}} |`
3. 品質チェックリストに新規フィールドの記入確認項目を追加する

**対象ファイル**: `.claude/skills/task-specification-creator/assets/documentation-changelog-template.md`

---

### タスク4: テスト実行確認（TDD Green）

**目的**: Phase 4 で作成した失敗テストが全て PASS になることを確認する

**実行手順**:

1. テストを実行して全件 PASS を確認する
2. 既存テストも PASS していることを確認する

**実行コマンド**:

```bash
pnpm vitest run --reporter=verbose -- validate-phase12-implementation-guide
```

**期待される成果物**:

- `outputs/phase-5/implementation-summary.md`

---

## 参照資料

| 参照資料               | パス                                                                                         | 用途             |
| ---------------------- | -------------------------------------------------------------------------------------------- | ---------------- |
| 設計書                 | `outputs/phase-2/design-document.md`                                                         | 実装の根拠       |
| テスト設計書           | `outputs/phase-4/test-design.md`                                                             | Green 確認の基準 |
| validator              | `.claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js` | 修正対象         |
| 実装ガイドテンプレート | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`          | 修正対象         |
| changelog テンプレート | `.claude/skills/task-specification-creator/assets/documentation-changelog-template.md`       | 修正対象         |

## 統合テスト連携

- Phase 4 のテストが全て PASS したことを実装完了の条件とする
- 既存テストに回帰がないことを確認する

## TDD 検証（Phase 5）

```bash
pnpm vitest run --reporter=verbose -- validate-phase12-implementation-guide
```

**確認項目**:

- [ ] Phase 4 で作成した新規テストが PASS（Green 状態）
- [ ] 既存テストが PASS（回帰なし）

## 成果物

| 成果物       | パス                                        | 内容           |
| ------------ | ------------------------------------------- | -------------- |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | 変更内容の要約 |

## 完了条件

- [ ] `validate-phase12-implementation-guide.js` の `part2_usage_example` チェックが修正されている
- [ ] `implementation-guide-template.md` の `### 使用例` 配置と Part 2 の見出し構造が整合している
- [ ] `documentation-changelog-template.md` に 5 フィールドが追加されている
- [ ] Phase 4 の新規テストが全て PASS している
- [ ] 既存テストに回帰がない
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 6: テスト拡充
