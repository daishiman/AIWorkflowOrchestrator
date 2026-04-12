# describe.skip 内の旧 testid 参照クリーンアップ - タスク指示書

## メタ情報

```yaml
task_id: UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001
task_name: describe.skip 内の旧 testid 参照クリーンアップ
category: クリーンアップ
target_feature: SkillLifecyclePanel テストファイル
priority: 低
scale: 小規模
status: 未実施
source: UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 Phase 12 skill-feedback-report.md
created_date: 2026-04-08
dependencies:
  - UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001（完了済み）
wave: post-W1（独立実行可能）
```

| 項目         | 内容                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001                              |
| タスク名     | describe.skip 内の旧 testid 参照クリーンアップ                            |
| 分類         | クリーンアップ                                                            |
| 対象機能     | SkillLifecyclePanel テストファイル                                        |
| 優先度       | 低                                                                        |
| 見積もり規模 | 小規模                                                                    |
| ステータス   | 未実施                                                                    |
| 発見元       | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 Phase 12 フィードバック |
| 発見日       | 2026-04-08                                                                |
| タスク分類   | NON_VISUAL（テストファイルのみ変更、視覚差分なし）                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001` の実装（PR#2036 + 本タスク）において、
`skill-lifecycle-request-input` および `skill-lifecycle-execution-input` の testid が
UI から削除された。

しかし、`SkillLifecyclePanel.llm-generation.test.tsx` と
`SkillLifecyclePanel.auth-regression.test.tsx` の `describe.skip` ブロック内に、
削除済みの `skill-lifecycle-request-input` testid 参照が残存している。

### 1.2 問題点・課題

- `describe.skip` 内のテストは実行されないため、現在は CI 上の問題は発生しない
- しかし将来 `describe.skip` を外したとき、存在しない testid を参照するテストが突然失敗する
- コードを読む際に「なぜ削除されたはずの testid が参照されているのか」と混乱を招く
- Phase 12 フィードバックでは「`skip` されている旧テストは未タスク検出の対象として明示的に記録する」
  という改善提案が出された

### 1.3 放置した場合の影響

- `describe.skip` を解除した際に、実態と乖離したテストが紛れ込む
- 新しい開発者が「削除済みのはずの testid がテストに存在する」ことで混乱する
- テストファイルの保守性が下がる

### 1.4 苦戦箇所（引き継ぎ知見）

| 苦戦箇所                                                           | 原因・背景                                                                                                | 推奨アプローチ                                                                                    |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `describe.skip` の扱いが実装タスクと分離されていた                 | Wave 1 のタスクは UI 変更に集中しており、`describe.skip` 内の古い参照は「いつか直す」として後回しになった | Phase 5 実装完了時に「`describe.skip` 内も含めて testid 参照を一斉更新する」チェックを追加する    |
| testid 参照の grep 対象が `describe.skip` 内まで及ばない場合がある | 通常の testid 存在チェックは skip されたブロックを実行しないため、実際に壊れているかどうかが分かりにくい  | `git grep` で `getByTestId\|data-testid` を全ファイルに対して実行し、削除済み testid がないか確認 |

---

## 2. 何を達成するか（What）

### 2.1 目的

削除済みの testid (`skill-lifecycle-request-input`) への参照を
`describe.skip` ブロックを含む全テストファイルから除去する。

### 2.2 受入条件（AC）

| AC   | 内容                                                                            |
| ---- | ------------------------------------------------------------------------------- |
| AC-1 | `skill-lifecycle-request-input` testid 参照が全テストファイルから削除されている |
| AC-2 | `describe.skip` ブロック内の参照も含めて削除・更新されている                    |
| AC-3 | 削除後、テストが現行 UI（遷移ボタン化後）を正しく反映した内容になっている       |
| AC-4 | `pnpm --filter @repo/desktop test:run` が PASS する                             |
| AC-5 | `pnpm --filter @repo/desktop typecheck` が PASS する                            |

### 2.3 スコープ

含むもの:

- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`
  内の `describe.skip` ブロックから `skill-lifecycle-request-input` 参照を削除または更新
- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx`
  内の `describe.skip` ブロックから `skill-lifecycle-request-input` 参照を削除または更新
- 削除するか、現行 UI に対応した testid に書き換えるかの判断

含まないもの:

- `SkillLifecyclePanel.tsx` 本体の変更
- 新しいテストケースの追加
- `describe.skip` 自体の解除（スキップ状態はそのまま維持する）

### 2.4 成果物

| 種別 | ファイルパス                                                                                        |
| ---- | --------------------------------------------------------------------------------------------------- |
| 修正 | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`  |
| 修正 | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001` が完了済みであること（Phase 12 完了確認済み）
- 現行の `SkillLifecyclePanel.tsx` に `skill-lifecycle-execution-input` も存在しないことを確認

### 3.2 推奨アプローチ

1. `SkillLifecyclePanel.llm-generation.test.tsx` の `describe.skip` ブロックを確認する
2. `skill-lifecycle-request-input` を参照する行を特定する
3. その行が「削除された UI 要素への参照」であれば削除し、必要に応じて代替の testid
   （`skill-lifecycle-open-wizard-button` 等）への参照に書き換えるか検討する
4. `SkillLifecyclePanel.auth-regression.test.tsx` でも同様に実施する
5. `pnpm --filter @repo/desktop test:run` を実行して全テスト PASS を確認する

---

## 4. 実行手順（Phase 1-13 の概要）

| Phase | 名称             | 主な作業（要点）                                                     |
| ----- | ---------------- | -------------------------------------------------------------------- |
| 1     | 要件定義         | 対象ファイルの `describe.skip` 内の旧 testid 参照を全量調査、AC 確定 |
| 2     | 設計             | 削除するか書き換えるかの方針決定（現行 UI との対応）                 |
| 3     | 設計レビュー     | 方針に矛盾・漏れがないか確認                                         |
| 4     | テスト作成       | 変更前後の影響範囲確認テスト（通常は省略可能な小規模タスク）         |
| 5     | 実装             | `describe.skip` 内の旧 testid 参照の削除・書き換え                   |
| 6     | テスト拡充       | 変更後の回帰テスト実行                                               |
| 7     | カバレッジ確認   | 変更後のカバレッジ変化がないこと確認                                 |
| 8     | リファクタリング | コード品質の確認                                                     |
| 9     | 品質保証         | `pnpm typecheck` / `pnpm lint` / `pnpm test` の全通過確認            |
| 10    | 最終レビュー     | AC-1〜AC-5 の充足確認                                                |
| 11    | 手動テスト       | NON_VISUAL: Vitest 全テスト PASS 確認                                |
| 12    | ドキュメント更新 | Phase 12 canonical 6 成果物の作成                                    |
| 13    | PR 作成          | ユーザー明示承認後のみ実施（blocked 維持）                           |

---

## 5. 完了条件チェックリスト

- [ ] AC-1: `skill-lifecycle-request-input` 参照が全テストファイルから削除されている
- [ ] AC-2: `describe.skip` ブロック内も含めて削除・更新されている
- [ ] AC-3: 削除後のテストが現行 UI を正しく反映している
- [ ] AC-4: `pnpm --filter @repo/desktop test:run` が PASS する
- [ ] AC-5: `pnpm --filter @repo/desktop typecheck` が PASS する
- [ ] Phase 12 canonical 6 成果物が揃っている

---

## 6. 検証方法

```bash
# 対象 testid の残存確認
grep -r "skill-lifecycle-request-input" apps/desktop/src/renderer/components/skill/__tests__/

# 全テスト実行
pnpm --filter @repo/desktop test:run

# 型チェック
pnpm --filter @repo/desktop typecheck
```

---

## 7. リスクと対策

| リスク                                             | 影響度 | 発生確率 | 対策                                                                      |
| -------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------- |
| `describe.skip` 内のテストが想定外のロジックを含む | 中     | 低       | 削除前に内容を精読し、現行仕様に必要なケースがあれば別途 issue に切り出す |
| 削除により関連テストのカバレッジが変化する         | 低     | 低       | カバレッジ変化が生じた場合は Phase 7 で記録するが、特段の対応は不要       |

---

## 8. 参照情報

| ドキュメント                                               | パス                                                                                                |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Phase 12 スキルフィードバック（フィードバック #2 参照）    | `outputs/phase-12/skill-feedback-report.md`                                                         |
| 現行 SkillLifecyclePanel テスト（主テスト）                | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`                 |
| llm-generation テスト（対象）                              | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`  |
| auth-regression テスト（対象）                             | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` |
| UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 Phase 12 | `outputs/phase-12/`                                                                                 |
