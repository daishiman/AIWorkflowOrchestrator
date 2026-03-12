# SettingsView 統合テスト act() warning 解消 - タスク指示書

## メタ情報

```yaml
issue_number: 1074
legacy_aliases:
  - UT-08-001
```

| 項目         | 内容                                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID     | UT-FIX-SETTINGS-INTEGRATION-ACT-WARNING-001                                                                                                 |
| タスク名     | SettingsView 統合テストの `act()` warning 解消                                                                                              |
| 分類         | 改善                                                                                                                                        |
| 対象機能     | `SettingsView.integration.test.tsx` / `settings-test-harness.ts`                                                                            |
| 優先度       | 低                                                                                                                                          |
| 見積もり規模 | 小規模                                                                                                                                      |
| ステータス   | 未実施                                                                                                                                      |
| 発見元       | Phase 12 再監査（`TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001`、親タスクは `08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001`） |
| 発見日       | 2026-03-12                                                                                                                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`SettingsView.integration.test.tsx` は 18 テストすべて PASS しているが、`ApiKeysSection` の `useEffect` 内 `apiKey.list()` 完了後の state 更新が `act()` 境界の外で発生し、stderr に warning が継続出力される。2026-03-12 の Phase 12 再監査でも同 warning を再確認した。

### 1.2 問題点・課題

1. 代表テストが PASS でも stderr が汚れ、実際の regressions と品質ノイズの判別が鈍る。
2. `visual blocker ではない` ことを理由に 0 件報告で閉じると、Phase 12 の未タスク判定が甘くなる。
3. `SettingsView` 系 follow-up を追うときに、warning の根本原因と対処パターンが task spec に固定されていない。

### 1.3 放置した場合の影響

- Settings 系統の統合テスト追加時に同じ warning を見逃しやすくなる。
- CI ログの可読性が下がり、真の失敗を拾いにくくなる。
- Phase 12 の「0件でも report は出した」という事実だけが残り、残課題導線が失われる。

---

## 2. 何を達成するか（What）

### 2.1 目的

`SettingsView.integration.test.tsx` 実行時の `act()` warning を 0 件にし、対象 warning を継続監視なしで閉じられる状態にする。

### 2.2 最終ゴール

- `pnpm --filter @repo/desktop exec vitest run src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx` 実行時に `Warning: An update to ApiKeysSection inside a test was not wrapped in act(...)` が出ない。
- 18 テストが引き続き PASS する。
- 変更内容と再利用ルールが workflow / system spec へ同期される。

### 2.3 スコープ

#### 含むもの

- `SettingsView.integration.test.tsx` の INT-05/06/07 周辺の待機・assert 見直し
- `settings-test-harness.ts` の補助修正（必要な場合のみ）
- warning 解消後の targeted vitest 実行とドキュメント同期

#### 含まないもの

- `SettingsView` 本体 UI 仕様の変更
- `ApiKeysSection` 本番ロジックの機能追加
- Settings 以外の test suite 横断改修

### 2.4 成果物

- warning 解消済みの `apps/desktop/src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx`
- 必要時の `apps/desktop/src/renderer/views/SettingsView/__tests__/settings-test-harness.ts` 更新
- 再検証結果を反映した Phase 12 出力または follow-up 記録

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `pnpm --filter @repo/desktop exec vitest run ...` を current worktree で実行できること
- `SettingsView` 系の既存回帰テストがローカルで再現できること

### 3.2 依存タスク

- `08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001`
- `TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001` の Phase 12 再監査記録

### 3.3 必要な知識

- React Testing Library の `act()` / `waitFor()` / 非同期 effect 待機
- happy-dom 環境での `fireEvent` と非同期 state 更新の扱い
- `ApiKeysSection` が `SettingsView` 描画時に副作用を起こす構成

### 3.4 推奨アプローチ

`ApiKeysSection` の非同期ロード完了を明示的に待つか、対象ケースだけ同期 mock へ寄せる。PASS/FAIL だけでなく stderr の消失を完了条件に含める。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                                                                      | 解決策                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SettingsView` を real composition で描画すると、テスト対象外でも `ApiKeysSection` の非同期 effect が走る | status 表示だけを見るテストでも `ApiKeysSection` の更新完了を待つ                                                                                                                                                                                       |
| happy-dom では `userEvent` より `fireEvent` + `act(async () => ...)` の方が安定する                       | event API を混在させず、既存 harness パターンに揃える                                                                                                                                                                                                   |
| PASS した test warning を `visual blocker ではない` として 0件扱いしやすい                                | stderr warning と Phase 10 residual note を照合し、follow-up task として閉じる                                                                                                                                                                          |
| historical copy と legacy root backlog が混在すると、どの未タスクを継続更新すべきかぶれやすい             | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/unassigned-task/task-fix-settings-integration-act-warning-001.md` を workflow 正本に固定し、`task-workflow` / `ui-ux-feature-components` / `lessons-learned` を同じ ID で同期する |

---

## 4. 実行手順

### Phase構成

- Phase 1: warning 再現
- Phase 2: 最小修正
- Phase 3: 検証と同期

### Phase 1: warning 再現

#### 目的

再現条件と warning 発生ケースを固定する。

#### 手順

1. `pnpm --filter @repo/desktop exec vitest run src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx` を実行する。
2. stderr の `act()` warning 発生ケースを記録する。
3. `INT-05/06/07` と `ApiKeysSection` 非同期 effect の相関を確認する。

#### 成果物

- warning 再現ログ
- 発生ケース一覧

#### 完了条件

- warning の発生ケースがテスト名単位で特定されている。

### Phase 2: 最小修正

#### 目的

機能仕様を変えずに warning だけを解消する。

#### 手順

1. `SettingsView.integration.test.tsx` の対象ケースへ待機を追加するか、必要最小限の harness 修正を行う。
2. 過剰な sleep や広域 mock でなく、`ApiKeysSection` 更新完了に依存した待機へ寄せる。
3. 18 テスト全体の期待値が変わっていないことを確認する。

#### 成果物

- 修正済み test 差分

#### 完了条件

- warning 解消のための変更が対象 test/harness に閉じている。

### Phase 3: 検証と同期

#### 目的

warning 解消を再現可能な形で閉じる。

#### 手順

1. 対象 vitest を再実行し、18 PASS と warning 0 件を確認する。
2. 必要に応じて関連 workflow / system spec の follow-up 記録を更新する。
3. 既存 warning と新規 warning が混ざっていないことを確認する。

#### 成果物

- 再検証ログ
- 更新済み follow-up 記録

#### 完了条件

- stderr に `act()` warning が残らず、18 テスト PASS が確認できる。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `SettingsView.integration.test.tsx` の 18 テストが PASS する
- [ ] `act()` warning が 0 件になる
- [ ] `SettingsView` / `ApiKeysSection` の本番仕様を変更していない

### 品質要件

- [ ] warning 解消の理由がコード差分から読める
- [ ] 追加した待機は対象ケースに限定されている
- [ ] happy-dom 前提の event / async パターンを崩していない

### ドキュメント要件

- [ ] 必要なら親 workflow または follow-up 記録へ結果を同期した
- [ ] `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/unassigned-task/` の配置と参照先整合を保った

---

## 6. 検証方法

### テストケース

| テストケース | 確認内容                                            |
| ------------ | --------------------------------------------------- |
| TC-01        | 対象 suite 単独実行で 18 テスト PASS する           |
| TC-02        | stderr に `not wrapped in act(...)` が出ない        |
| TC-03        | `providers` fallback 系テストが既存どおり PASS する |

### 検証手順

1. `pnpm --filter @repo/desktop exec vitest run src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx` を実行する。
2. テスト結果を確認し、stderr を目視で確認する。
3. 必要なら `rg -n "act\\(\\.\\.\\.\\)"` でログ断片を再確認する。

---

## 7. リスクと対策

| リスク                                             | 影響度 | 発生確率 | 対策                                                |
| -------------------------------------------------- | ------ | -------- | --------------------------------------------------- |
| 待機追加で test が不必要に遅くなる                 | 低     | 中       | 対象ケースだけに待機を閉じる                        |
| 非同期 mock の変更で既存 fallback ケースが壊れる   | 中     | 低       | 18 テスト全体を再実行する                           |
| warning を消すために本番コードへ不要な変更を入れる | 中     | 低       | 本番コード変更は原則禁止とし、test/harness に閉じる |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-10/final-review-result.md`
- `docs/30-workflows/08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001/outputs/phase-12/unassigned-task-detection.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`

### 参考資料

- `apps/desktop/src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx`
- `apps/desktop/src/renderer/views/SettingsView/__tests__/settings-test-harness.ts`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
Warning: An update to ApiKeysSection inside a test was not wrapped in act(...).
```

### 補足事項

- 2026-03-12 の再監査時点では、機能回帰はなく warning のみが残っている。
- historical follow-up として `docs/30-workflows/completed-tasks/unassigned-task/task-ut-08-001-settings-act-warning-guard.md` があるが、completed workflow 配下で再接続した正本は本ファイルとする。
