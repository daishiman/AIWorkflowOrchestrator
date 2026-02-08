# [#745] "[task-flaky-boundary-audit-001] toBeGreaterThan使用箇所のフレーキーリスク監査"

## メタ情報

```yaml
task_id: task-flaky-boundary-audit-001
task_name: toBeGreaterThan使用箇所のフレーキーリスク監査
category: 改善（テスト品質）
target_feature: テストコード全体
priority: 中
scale: 小規模
status: 未実施
source_phase: fix-chat-history-flaky-test-001 Phase 12
created_date: 2026-02-07
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-flaky-boundary-audit-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

fix-chat-history-flaky-test-001 で、`toBeGreaterThan(0)` を使用したテストがフレーキー（不安定）になる問題を修正しました。この問題の根本原因は、`toBeGreaterThan(N)` が境界値 N を含まないため、タイミング依存のテストで期待値がちょうど N になった場合にテストが失敗することでした。

### 1.2 問題点・課題

**現在の実装状態**:

- コードベース内に `toBeGreaterThan` を使用しているテストが複数存在
- これらのテストが `waitFor` や非同期処理と組み合わせて使用されている場合、同様のフレーキー問題が発生する可能性がある

**検出済みの該当ファイル**:

- `apps/desktop/src/preload/__tests__/claudeCliApi.test.ts` - 6箇所
- `apps/desktop/src/features/search/__tests__/SearchPanel.test.tsx` - 1箇所
- `apps/desktop/src/features/search/__tests__/WorkspaceSearchPanel.test.tsx` - 2箇所
- `apps/desktop/src/features/search/__tests__/integration/WorkspaceSearchIntegration.test.tsx` - 6箇所

### 1.3 放置した場合の影響

| 影響領域         | 影響度 | 説明                                              |
| ---------------- | ------ | ------------------------------------------------- |
| CI/CD信頼性      | Medium | ランダムにテストが失敗し、開発フローが阻害される  |
| 開発者体験       | Medium | フレーキーテストの調査に時間を浪費する            |
| テストカバレッジ | Low    | フレーキーテストを回避するために.skipが乱用される |

---

## 2. 何を達成するか（What）

### 2.1 目的

`toBeGreaterThan` が非同期処理と組み合わせて使用されている箇所を特定し、フレーキーリスクを評価・修正する。

### 2.2 最終ゴール

- コードベース内のすべての `toBeGreaterThan` 使用箇所をレビュー
- 非同期処理（`waitFor`, `act`, タイマー等）と組み合わせて使用されている箇所を特定
- フレーキーリスクが高い箇所を `toBeGreaterThanOrEqual` に置換

### 2.3 スコープ

#### 含むもの

- `toBeGreaterThan` の全使用箇所の検索
- 非同期コンテキストでの使用箇所の特定
- リスク評価と修正

#### 含まないもの

- `toBeLessThan` など他の境界値マッチャーの監査（将来対応）
- 新規テストの追加

### 2.4 成果物

| 種別         | 成果物                       | 配置先                                             |
| ------------ | ---------------------------- | -------------------------------------------------- |
| 監査レポート | フレーキーリスク評価レポート | `docs/30-workflows/task-flaky-boundary-audit-001/` |
| 実装         | テストコード修正             | 該当テストファイル                                 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] fix-chat-history-flaky-test-001 が完了していること
- [ ] 06-known-pitfalls.md に P19 が記録されていること

### 3.2 依存タスク

**先に完了している必要があるタスク**:

- fix-chat-history-flaky-test-001（完了済み）

### 3.3 必要な知識・スキル

- Vitest/Jest のマッチャー仕様
- 非同期テストパターン
- フレーキーテストの原因分析

### 3.4 推奨アプローチ

1. **grep検索**: `toBeGreaterThan` の全使用箇所を検索
2. **コンテキスト分析**: 各使用箇所が非同期処理と組み合わせて使用されているかを確認
3. **リスク評価**: フレーキーリスクを高/中/低で評価
4. **修正**: リスクが高い箇所を `toBeGreaterThanOrEqual` に置換

### 3.5 実装課題と解決策（fix-chat-history-flaky-test-001からの学び）

本タスクの発見元である fix-chat-history-flaky-test-001 で苦戦した箇所と解決策を記録する。

#### P1: LOGS.md 2ファイル更新漏れ

| 項目       | 内容                                                                                    |
| ---------- | --------------------------------------------------------------------------------------- |
| **問題**   | documentation-changelog.md で「該当なし」と記載したが、LOGS.md×2 の更新は全タスクで必須 |
| **解決策** | Phase 12 Step 1-A チェックリストを機械的に確認。「該当なし」と判断する前に必ず確認      |
| **参照**   | `.claude/rules/06-known-pitfalls.md#P1`                                                 |

#### P3: 未タスク管理の3ステップ不完全

| 項目       | 内容                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| **問題**   | 未タスク検出レポートは作成したが、指示書作成とテーブル登録が漏れ                     |
| **解決策** | 3ステップ（①指示書 → ②残課題テーブル → ③関連仕様書リンク）全完了まで Task 4 は未完了 |
| **参照**   | `.claude/rules/06-known-pitfalls.md#P3`                                              |

#### P19: フレーキーテストの境界値問題

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| **問題**   | `toBeGreaterThan(5)` が境界値 5 を含まないため、CI で時々失敗 |
| **解決策** | `toBeGreaterThanOrEqual(5)` に変更して境界値を許容            |
| **参照**   | `.claude/rules/06-known-pitfalls.md#P19`                      |

#### P20: バグ修正タスクでの Phase 12 スキップ誤判断

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| **問題**   | バグ修正だから LOGS.md / SKILL.md 更新不要と誤判断              |
| **解決策** | タスク規模に関係なく、Phase 12 の全チェックリストを機械的に実行 |
| **参照**   | `.claude/rules/06-known-pitfalls.md#P20`                        |

#### クロスリファレンス

- **落とし穴ドキュメント**: `.claude/rules/06-known-pitfalls.md` P1, P3, P19, P20
- **失敗パターン**: `.claude/skills/aiworkflow-requirements/references/patterns.md` 失敗パターンセクション

---

## 4. 実行手順

### Phase 1: 検索と特定

#### 目的

`toBeGreaterThan` の使用箇所を特定し、非同期コンテキストかどうかを分類する。

#### 実行コマンド

```bash
# toBeGreaterThan の使用箇所を検索
grep -rn "toBeGreaterThan" --include="*.test.ts" --include="*.test.tsx" apps/ packages/

# 非同期コンテキスト（waitFor, act, async）との組み合わせを確認
grep -rn -B5 "toBeGreaterThan" --include="*.test.ts" --include="*.test.tsx" apps/ packages/ | grep -E "(waitFor|act\(|async)"
```

#### 成果物

| 成果物   | パス                                                                | 内容         |
| -------- | ------------------------------------------------------------------- | ------------ |
| 検索結果 | `docs/30-workflows/task-flaky-boundary-audit-001/search-results.md` | 使用箇所一覧 |

#### 完了条件

- [ ] 全使用箇所の一覧作成完了
- [ ] 非同期コンテキストの分類完了

---

### Phase 2: リスク評価

#### 目的

各使用箇所のフレーキーリスクを評価する。

#### 評価基準

| リスクレベル | 条件                                             |
| ------------ | ------------------------------------------------ |
| 高           | `waitFor` 内で使用 + 期待値が 0 または境界値近傍 |
| 中           | 非同期処理後に使用 + タイミング依存の可能性あり  |
| 低           | 同期処理内での使用 または 明確に大きな値との比較 |

#### 成果物

| 成果物       | パス                                                                 | 内容             |
| ------------ | -------------------------------------------------------------------- | ---------------- |
| リスク評価表 | `docs/30-workflows/task-flaky-boundary-audit-001/risk-assessment.md` | リスクレベル一覧 |

#### 完了条件

- [ ] 全使用箇所のリスク評価完了
- [ ] 高リスク箇所の特定完了

---

### Phase 3: 修正

#### 目的

高リスク箇所を `toBeGreaterThanOrEqual` に置換する。

#### 修正方針

- `toBeGreaterThan(0)` → `toBeGreaterThanOrEqual(1)` または `toBeGreaterThan(0)` のまま（意図が明確な場合）
- 各修正はテストの意図を確認した上で実施

#### 成果物

| 成果物         | パス               | 内容                     |
| -------------- | ------------------ | ------------------------ |
| 修正済みテスト | 該当テストファイル | 境界値マッチャー置換済み |

#### 完了条件

- [ ] 高リスク箇所の修正完了
- [ ] 全テスト成功
- [ ] ESLint/TypeScriptエラーなし

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `toBeGreaterThan` 使用箇所の全数調査完了
- [ ] リスク評価完了
- [ ] 高リスク箇所の修正完了

### 品質要件

- [ ] 修正後の全テスト成功（10回連続実行で安定）
- [ ] ESLint/TypeScriptエラーゼロ

### ドキュメント要件

- [ ] 監査レポート作成完了
- [ ] testing-component-patterns.md への教訓追記

---

## 6. 検証方法

### 6.1 テストケース

| #   | テストケース                               | 期待結果             | 検証ポイント                   |
| --- | ------------------------------------------ | -------------------- | ------------------------------ |
| 1   | 修正後のテストを10回連続実行               | 10回全てPASS         | フレーキーテストの安定化を確認 |
| 2   | CIで修正後のテストを3回実行                | 3回全てPASS          | CI環境での安定性を確認         |
| 3   | `toBeGreaterThanOrEqual`への置換が正しいか | 境界値を許容する動作 | 意図通りの修正か確認           |

### 6.2 検証手順

1. `pnpm --filter @repo/desktop test` で修正対象テストを実行
2. 10回連続実行スクリプト: `for i in {1..10}; do pnpm test -- path/to/file.test.ts && echo "Run $i: PASS"; done`
3. 全て PASS であれば検証完了

### 6.3 成功基準

- [ ] 修正対象の全テストが10回連続でPASS
- [ ] CIパイプラインで3回連続PASS
- [ ] `toBeGreaterThan` 使用箇所が0件（grep結果が空）

---

## 7. リスクと対策

| リスク                              | 影響度 | 発生確率 | 対策                                                      |
| ----------------------------------- | ------ | -------- | --------------------------------------------------------- |
| toBeGreaterThanOrEqualへの置換漏れ  | 中     | 高       | grep自動検出結果を全数確認、チェックリストで追跡          |
| 意図的なtoBeGreaterThan使用の誤置換 | 高     | 低       | 各箇所のコンテキストを確認し、「最低N回以上」の意図か判定 |
| テスト失敗時の根本原因誤判断        | 高     | 中       | 各修正箇所で10回連続実行し、安定性を個別確認              |
| 修正による既存テストの破壊          | 高     | 低       | 修正前後で全テストを実行し、他のテストへの影響を確認      |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/rules/06-known-pitfalls.md` - P19: フレーキーテストの境界値問題
- `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` - テストパターン仕様

### 関連タスク

- fix-chat-history-flaky-test-001（発見元タスク）

### 参考資料

- [Vitest Assertion API - toBeGreaterThan](https://vitest.dev/api/expect.html#toBeGreaterThan)
- [Testing Library - waitFor](https://testing-library.com/docs/dom-testing-library/api-async/#waitfor)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

該当なし（Phase 12 未タスク検出による発見）

### 補足事項

- `toBeGreaterThan(0)` は「1以上」を期待する場合に使用されることが多いが、境界値ちょうど0の場合に失敗する
- 非同期テストでは `toBeGreaterThanOrEqual` を優先的に使用することで、タイミング依存のフレーキーを防止できる
- 本タスクで得られた知見は testing-component-patterns.md に追記し、将来の同様問題を防止する
