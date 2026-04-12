# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 1                                              |
| タスクID   | UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001   |
| タスク名   | describe.skip 内の旧 testid 参照クリーンアップ |
| 前提Phase  | -                                              |
| 後続Phase  | Phase 2                                        |
| 作成日     | 2026-04-11                                     |
| ステータス | 未実施                                         |

## 目的

`describe.skip` ブロック内に残存する削除済み testid `skill-lifecycle-request-input` への参照を
対象テストファイル2件から全量調査し、AC-1〜AC-5 を確定する。

## 背景

UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001（Issue #2015）の対応にて、
SkillLifecyclePanel がリクエスト入力フォームから遷移ボタン型 UI へとリファクタリングされた。
この変更に伴い `skill-lifecycle-request-input` testid が削除されたが、
`SkillLifecyclePanel.llm-generation.test.tsx` および
`SkillLifecyclePanel.auth-regression.test.tsx` 内の `describe.skip` ブロックに旧 testid 参照が
残留していることが Phase 12 フィードバック #2 にて検出された。

## P50チェック（Step 0）

```bash
# 対象 testid の残存確認
grep -rn "skill-lifecycle-request-input" apps/desktop/src/renderer/components/skill/__tests__/

# describe.skip ブロックの確認
grep -n "describe.skip" apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
grep -n "describe.skip" apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# 現行 testid 一覧の確認（現行 SkillLifecyclePanel に存在する testid）
grep -rn "data-testid" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

## タスク分類

**type**: refactoring（テストファイルのクリーンアップのみ）
**UI task**: NO（テストファイルのみ変更。UI変更なし）
**NON_VISUAL**: YES

## 実行タスク

- 対象ファイル2件の現状確認: `describe.skip` ブロックの全量と `skill-lifecycle-request-input` 参照箇所を特定する
- 削除対象 testid 参照の全量確認: ファイル全体で旧 testid が使われている箇所を網羅する
- 現行 testid の確認: SkillLifecyclePanel に現在存在する testid 一覧を記録する
- AC-1〜AC-5 の確定: 受け入れ基準を文書化する

## 参照資料

### 実装・コード

| 資料名                            | パス                                                                                                | 用途                       |
| --------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------- |
| LLM生成テストファイル             | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`  | 旧 testid 残存箇所の確認   |
| 認証回帰テストファイル            | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` | 旧 testid 残存箇所の確認   |
| SkillLifecyclePanelコンポーネント | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                | 現行 testid 一覧の確認     |
| 親タスク仕様書                    | `docs/30-workflows/` 内の W1-LIFECYCLE-PANEL-TRANSITION-001 関連ディレクトリ                        | 削除済み testid の経緯確認 |

### システム仕様（aiworkflow-requirements）

| 資料名         | パス                                                                        | 用途              |
| -------------- | --------------------------------------------------------------------------- | ----------------- |
| 品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト品質基準    |
| 教訓           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | testid 管理の教訓 |
| リソースマップ | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`            | 抽出漏れ防止      |

## 受け入れ基準（Acceptance Criteria）

| ID   | 基準                                                                            | 検証方法                                                                                               |
| ---- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| AC-1 | `skill-lifecycle-request-input` testid 参照が全テストファイルから削除されている | `grep -rn "skill-lifecycle-request-input" apps/desktop/src/renderer/components/skill/__tests__/` が0件 |
| AC-2 | `describe.skip` ブロック内の参照も含めて削除・更新されている                    | 対象2ファイルの `describe.skip` ブロック内に旧 testid 参照がないことを確認                             |
| AC-3 | 削除後、テストが現行 UI（遷移ボタン化後）を正しく反映した内容になっている       | テストコードの内容を目視確認                                                                           |
| AC-4 | `pnpm --filter @repo/desktop test:run` が PASS する                             | テストコマンド実行結果が全件PASS                                                                       |
| AC-5 | `pnpm --filter @repo/desktop typecheck` が PASS する                            | 型チェックコマンド実行結果がエラーなし                                                                 |

## 機能要件

| ID    | 要件                                                                                                                   |
| ----- | ---------------------------------------------------------------------------------------------------------------------- |
| FR-01 | `SkillLifecyclePanel.llm-generation.test.tsx` 内の `skill-lifecycle-request-input` 参照が削除または書き換えられている  |
| FR-02 | `SkillLifecyclePanel.auth-regression.test.tsx` 内の `skill-lifecycle-request-input` 参照が削除または書き換えられている |
| FR-03 | `describe.skip` ブロックのスキップ状態が維持されている（スキップを解除しない）                                         |
| FR-04 | 変更後のテストファイルが TypeScript の型チェックをパスする                                                             |

## 非機能要件

| ID     | 要件                                                                 |
| ------ | -------------------------------------------------------------------- |
| NFR-01 | 変更がテストファイルのみに限定されていること（本体コードの変更なし） |
| NFR-02 | 変更による既存のアクティブテストへの回帰がないこと                   |
| NFR-03 | `describe.skip` ブロックの外のテストケースに影響しないこと           |

## 因果ループ分析

**強化ループ（問題継続ループ）**:
削除済み testid の参照が残留 → スキップ状態のため即座にエラーにならない
→ 参照が長期間放置される → testid 管理の信頼性が低下
→ 将来スキップ解除時に初めてエラーが発見される → 修正コストが増大

**バランスループ（修正ループ）**:
旧 testid 参照を削除または書き換え → 参照と実装の整合性が維持される
→ スキップ解除時のリスクが低減 → テストコードの信頼性が向上

## 実行手順

1. 対象ファイル2件を読み込み、`skill-lifecycle-request-input` の参照箇所を全量特定する
2. 各参照が `describe.skip` ブロック内にあることを確認する
3. SkillLifecyclePanel の現行 testid 一覧を確認する
4. 削除方針または書き換え方針を決定する（Phase 2 で確定）
5. AC-1〜AC-5 を受け入れ基準として文書化する
6. 成果物を `outputs/phase-1/` に出力する

## 統合テスト連携

- `pnpm --filter @repo/desktop test:run` でアクティブテストが全件 PASS していることを事前確認
- 変更後も同コマンドが PASS し続けることを検証
- `pnpm --filter @repo/desktop typecheck` が PASS することを確認

## 多角的チェック観点

| 観点         | 確認内容                                                                   |
| ------------ | -------------------------------------------------------------------------- |
| システム思考 | 旧 testid 残留 → スキップで隠蔽 → 将来障害の因果ループを把握する           |
| 影響範囲思考 | 対象2ファイル以外に `skill-lifecycle-request-input` 参照がないか確認する   |
| 改善思考     | 単なる削除でなく、現行 UI を反映した書き換えが適切かどうかを検討する       |
| 逆説思考     | `describe.skip` ブロックを削除せずに参照のみ修正することの妥当性を確認する |

## 成果物

| 成果物       | パス                                                    | 説明                             |
| ------------ | ------------------------------------------------------- | -------------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md`            | 機能要件・非機能要件・調査結果   |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`                | AC-1〜AC-5 の詳細と検証方法      |
| 仕様抽出結果 | `outputs/phase-1/aiworkflow-requirements-extraction.md` | aiworkflow仕様からの関連要件抽出 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 対象ファイル2件の現状確認（未実施）
2. `skill-lifecycle-request-input` 参照箇所の全量特定（未実施）
3. 現行 testid 一覧の確認（未実施）
4. AC-1〜AC-5 の確定（未実施）
5. 成果物出力（未実施）

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001
```

## 次のPhase

Phase 2: 設計
