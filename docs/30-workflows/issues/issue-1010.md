# [#1010] "[UT-IMP-SKILL-IMPORT-RESULT-CONTRACT-GUARD-001] skill import 成功判定・error surface 共通ガード"

## メタ情報

```yaml
task_id: UT-IMP-SKILL-IMPORT-RESULT-CONTRACT-GUARD-001
task_name: skill import 成功判定・error surface 共通ガード
category: 改善
target_feature: `SkillImportDialog`、`SkillCenterView`、`importSkill()` を利用する skill import UI 全般
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-043B Phase 12 再確認
created_date: 2026-03-06
dependencies: []
spec_path: docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design/unassigned-task/task-imp-skill-import-result-contract-guard-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-043B では、`SkillImportDialog` の import 成功判定を「`await importSkill()` が resolve したか」ではなく、「Store の `importedSkills` に対象が反映され、`skillError` が残っていないか」で判定するよう修正した。これは `agentSlice.importSkill()` が failure 時でも throw せず resolve しうる契約だからである。

一方で、同じ `importSkill()` を使う他の導線では、まだ promise resolve を前提に後続 UX を進める実装が残りうる。実際に `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` の `handleAddSkill()` は `await importSkill(skillName)` 後の state 変化を共通 helper で確認しておらず、成功アニメーションや後続 UI 制御が import 結果契約から独立している。

### 1.2 問題点・課題

- `importSkill()` の success/failure 契約が UI ごとにばらつき、同じ store action を使っていても success 判定が統一されていない
- error を panel/dialog/inline で個別判断すると、同一操作で alert が二重表示される再発リスクがある
- `SkillImportDialog` だけ修正しても、`SkillCenterView` など他導線が promise resolve 依存のままだと同種の偽成功 UX が残る
- テスト側も `useAppStore.getState()` を含む post-condition モック契約を共有していないため、copy 修正や success 判定修正のたびに drift しやすい

### 1.3 放置した場合の影響

- skill import UI ごとに success / failure の挙動が揺れ、ユーザーが「追加されたのか失敗したのか」を判断しづらくなる
- `SkillCenterView` などで成功演出や detail 更新が import 実態とずれる可能性がある
- 同種課題のたびに `importSkill` の non-throw 契約を調査し直す必要があり、実装速度が落ちる
- 今回整理した TASK-043B の教訓が局所解に留まり、system spec の再利用価値が下がる

---

## 2. 何を達成するか（What）

### 2.1 目的

skill import UI 全体で、`importSkill()` の成功判定と error surface 表示ルールを共通化し、post-condition ベースの一貫した UX 契約に揃える。

### 2.2 最終ゴール

- `importSkill()` 呼び出し箇所が棚卸しされ、promise resolve 依存の success 判定が残っていない
- `SkillImportDialog` と `SkillCenterView` を含む主要導線で、success 判定が「Store 状態変化」に統一されている
- error surface が 1 操作 1 面の原則で揃い、alert 重複が再発しない
- テストが共通契約に追従し、`useAppStore.getState()` を含む post-condition モックが標準化されている

### 2.3 スコープ

#### 含むもの

- `importSkill()` 呼び出し箇所の棚卸し
- success 判定 helper / utility / hook の導入、または同等の共通化
- `SkillImportDialog`、`useSkillCenter`、必要な skill import UI の修正
- error surface の表示責務整理
- `SkillImportDialog.test.tsx`、`useSkillCenter.test.ts` など関連テストの更新
- `aiworkflow-requirements` への仕様・教訓・関連未タスクの同期

#### 含まないもの

- `skill:list` / `skill:getImported` / `skill:import` の IPC 契約変更
- store action の public API を破壊的に変更すること
- TASK-043B の visual design 再設計
- unrelated な skill 実行系 UI の改修

### 2.4 成果物

| 成果物               | 内容                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| 共通成功判定ルール   | `importSkill()` 後の post-condition 判定 helper / 実装ルール                                        |
| 修正済み UI          | `SkillImportDialog`、`SkillCenterView` など主要 import 導線                                         |
| 更新済みテスト       | `SkillImportDialog` / `useSkillCenter` / 関連 integration test                                      |
| 更新済み system spec | `arch-state-management.md`、`ui-ux-feature-components.md`、`lessons-learned.md`、`task-workflow.md` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-043B の修正内容を把握していること
- `agentSlice.importSkill()` が failure 時に throw せず resolve しうる契約を理解していること
- `SkillCenterView` 系テストをローカルで実行できること

### 3.2 依存タスク

- なし。独立して着手可能

### 3.3 必要な知識

- Zustand Store の post-condition 判定
- React hook / dialog / inline error surface 設計
- Vitest + React Testing Library の Store モック
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` の import 契約

### 3.4 推奨アプローチ

1. `rg -n "importSkill\\(" apps/desktop/src/renderer -g "*.{ts,tsx}"` で callsite を棚卸しする
2. `await importSkill(skillName)` 後に共通 helper で `importedSkills` / `skillError` / 既存 import 状態を判定する
3. success 演出、dialog close、detail 更新、toast 表示などは helper の成功結果にのみ従わせる
4. error は panel/dialog/inline のうち 1 面に限定し、共有 state の二重描画を避ける
5. テストには `useAppStore.getState()` を含む post-condition モックを標準で入れる

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                                 | 発見経緯                                                                      | 解決策                                                               | 教訓                                                        |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------- |
| `importSkill()` が failure 時でも resolve しうる                     | TASK-043B で dialog が catch に入らず偽成功になりかけた                       | success 判定を `importedSkills` 反映 + `skillError` 未残置へ変更した | action の戻り値ではなく Store 状態変化を正本にする          |
| dialog open 中に panel / dialog の alert が二重表示される            | TASK-043B の Phase 11 で error surface 重複を確認した                         | dialog open 中は panel alert を抑止した                              | 1 操作 1 surface を守る                                     |
| `useSkillCenter.handleAddSkill()` など別導線が同契約を共有していない | `await importSkill(skillName)` 後の UX 制御が共通 helper を使っていない       | callsite を棚卸しし、post-condition helper へ寄せる                  | 1箇所直して終わりにせず、同 action 利用箇所を横断で確認する |
| テストが copy と `getState()` 契約に追従しづらい                     | `SkillImportDialog.test.tsx` で copy / close 条件 / Store モックが drift した | `useAppStore.getState()` を含むモック契約を固定する                  | UI copy 変更は見た目だけでなく成功条件テストも同時更新する  |

---

## 4. 実行手順

### Phase構成

4フェーズで進める。callsite 棚卸し、共通ルール設計、実装、検証の順に分離する。

### Phase 1: callsite 棚卸し

#### 目的

`importSkill()` の利用箇所と success / error UX を一覧化する。

#### 手順

1. `rg -n "importSkill\\(" apps/desktop/src/renderer -g "*.{ts,tsx}"` を実行する
2. `SkillImportDialog`、`SkillCenterView`、その他 import UI を分類する
3. 各 callsite が success を何で判定しているかを表にする

#### 成果物

- callsite 一覧
- success/error 判定マトリクス

#### 完了条件

- `importSkill()` 利用箇所が漏れなく列挙されている
- promise resolve 依存箇所が特定されている

### Phase 2: 共通契約設計

#### 目的

post-condition ベースの共通成功判定ルールを決める。

#### 手順

1. 成功条件を `importedSkills` 反映 + `skillError` 未残置 + 既存 import 状態で定義する
2. helper / utility / hook の配置先を決める
3. error surface を panel/dialog/inline のどこに集約するかを導線別に決める

#### 成果物

- 共通契約設計メモ
- helper 配置方針

#### 完了条件

- 各 UI が同じ success 契約を参照できる
- error surface の責務が競合しない

### Phase 3: 実装とテスト更新

#### 目的

共通契約を導線へ適用し、テストを追従させる。

#### 手順

1. `SkillImportDialog` に helper を適用し、既存挙動を維持する
2. `useSkillCenter.handleAddSkill()` へ同じ契約を適用する
3. 必要な skill import UI の success / error 制御を更新する
4. `SkillImportDialog.test.tsx`、`useSkillCenter.test.ts`、関連 integration test を更新する

#### 成果物

- 修正済み UI 実装
- 更新済みテスト

#### 完了条件

- success / failure で UX が期待どおりに分岐する
- alert 重複がない

### Phase 4: 仕様同期と監査

#### 目的

system spec と未タスク運用を同期し、再利用可能な状態にする。

#### 手順

1. `task-workflow.md`、`ui-ux-feature-components.md`、`lessons-learned.md` を更新する
2. 必要に応じて `arch-state-management.md` へ共通契約を追記する
3. `verify-unassigned-links.js`、targeted test、typecheck を実行する

#### 成果物

- 同期済み system spec
- 検証結果

#### 完了条件

- system spec に実装内容と苦戦箇所が反映されている
- 検証コマンドが PASS している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `importSkill()` 利用箇所の棚卸しが完了している
- [ ] 主要導線が post-condition ベースの success 判定へ統一されている
- [ ] error surface が 1 操作 1 面で整理されている

### 品質要件

- [ ] `SkillImportDialog` 系テストが PASS している
- [ ] `useSkillCenter.test.ts` を含む関連テストが PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している

### ドキュメント要件

- [ ] `task-workflow.md` に本未タスクが登録されている
- [ ] `ui-ux-feature-components.md` に関連未タスクが同期されている
- [ ] `lessons-learned.md` に苦戦箇所と簡潔解決手順が同期されている

---

## 6. 検証方法

### テストケース

| テストケース                             | 期待結果                                               |
| ---------------------------------------- | ------------------------------------------------------ |
| import 成功                              | 対象 skill が imported 側へ反映され、success UX が進む |
| import 失敗（resolve だが state 未反映） | success UX が進まず、error surface のみ表示される      |
| dialog open 中の error                   | panel と dialog の alert が二重表示されない            |
| 既存 import 済み skill                   | 再追加導線が偽失敗にならず、同期だけで終わる           |

### 検証手順

```bash
rg -n "importSkill\\(" apps/desktop/src/renderer -g "*.{ts,tsx}"
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillImportDialog.test.tsx \
  src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts
pnpm --filter @repo/desktop typecheck
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design/unassigned-task/task-imp-skill-import-result-contract-guard-001.md
```

---

## 7. リスクと対策

| リスク                                             | 影響度 | 発生確率 | 対策                                                                |
| -------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------- |
| helper 導入で既存 dialog 挙動を壊す                | 中     | 中       | `SkillImportDialog.test.tsx` を先に固定してから共通化する           |
| `SkillCenterView` の追加アニメーション仕様が変わる | 中     | 中       | success / failure の期待挙動をテストで先に定義する                  |
| error surface 整理で copy が変わり query が壊れる  | 低     | 高       | 文言更新と query 更新を同一コミットで実施する                       |
| callsite 棚卸し漏れで契約が再分散する              | 高     | 中       | `rg` 結果を一覧化し、完了条件に「全 callsite レビュー済み」を含める |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design/outputs/phase-12/documentation-changelog.md`
- `docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design/outputs/phase-12/unassigned-task-detection.md`
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### 参考資料

- `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`
- `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`
- `apps/desktop/src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

該当なし。

### 補足事項

- 本未タスクは「TASK-043B が未完了だった」という意味ではなく、そこで得た契約知見を他の skill import UI へ横展開する改善タスクである
- まずは store public API を変えずに共通 helper / ルール化で吸収し、必要になった場合のみ store 契約の追加変更を検討する
