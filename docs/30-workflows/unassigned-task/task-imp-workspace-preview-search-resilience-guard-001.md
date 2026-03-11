# UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001: Workspace Preview/Search resilience ガード

## メタ情報

```yaml
issue_number: 1161
task_id: UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001
task_name: Workspace Preview/Search resilience ガード
category: 改善
target_feature: Workspace Preview / QuickFileSearch / renderer resilience / error taxonomy
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-UI-04C-WORKSPACE-PREVIEW Phase 12 follow-up
created_date: 2026-03-11
dependencies:
  - TASK-UI-04C-WORKSPACE-PREVIEW
```

| 項目         | 内容                                                                  |
| ------------ | --------------------------------------------------------------------- |
| タスクID     | UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001                  |
| タスク名     | Workspace Preview/Search resilience ガード                            |
| 分類         | 改善                                                                  |
| 対象機能     | Workspace Preview / QuickFileSearch / renderer resilience / error分類 |
| 優先度       | 中                                                                    |
| 見積もり規模 | 中規模                                                                |
| ステータス   | 未実施                                                                |
| 発見元       | TASK-UI-04C-WORKSPACE-PREVIEW Phase 12 follow-up                      |
| 発見日       | 2026-03-11                                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UI-04C-WORKSPACE-PREVIEW では、`QuickFileSearch` の fuzzy ranking、preview 読み込みの timeout / retry、structured preview の fallback 分離を task 内で収束できた。一方で、同種の preview/search UI を今後追加する場合、同じ難所を毎回 feature ごとに再発見してしまう状態が残っている。

### 1.2 問題点・課題

- fuzzy search の「一致判定」と「順位補正」が utility と test に昇格しておらず、別 UI で false positive を再発しやすい
- preview / inspector 系 `invoke` の renderer timeout + retry が feature 局所実装のままで、別画面へ再利用しづらい
- parse failure / transport failure / no-match の error taxonomy が 04C の知見として分散しており、UI surface の設計判断が属人的になりやすい
- Phase 12 では親 task の苦戦箇所を 0件判定で閉じた後に、共通ガードへ formalize する条件が明文化されていない

### 1.3 放置した場合の影響

- 次の Workspace 系 UI や preview/search 系 UI で `score=0` 候補混入、loading 固着、fallback 喪失を繰り返す
- Main / Preload 契約を増やさずに解ける問題まで IPC 拡張で対応しようとして責務が広がる
- Phase 12 の `unassigned-task-detection.md` / `spec-update-summary.md` / `documentation-changelog.md` が「実装時には閉じたが、再利用ガードとしては未整理」という中途半端な状態になりやすい

---

## 2. 何を達成するか（What）

### 2.1 目的

Workspace Preview / QuickFileSearch で露出した 3 つの難所を、再利用可能な utility / contract / system spec ガードへ昇格し、類似タスクでの初動を短縮する。

### 2.2 最終ゴール

1. fuzzy ranking が `no match -> []` と stable sort を保証する shared utility / test を持つ
2. preview / inspector 系の読み込みで renderer timeout + retry の標準 helper または標準契約が定義される
3. parse failure / transport failure / renderer crash / no-match の UI 応答が仕様書上で一貫する
4. 親 task の苦戦箇所を未タスクへ formalize した場合、Phase 12 成果物と system spec が同じ ID / 同じ件数で同期される

### 2.3 スコープ

#### 含むもの

- fuzzy search score utility の抽出または標準化
- `score=0` 除外、stable sort、top 10 制御のテスト追加
- preview 読み込みの renderer timeout / retry utility または hook 契約化
- parse / read / timeout / crash / no-match の error taxonomy 整理
- `task-workflow.md` / `ui-ux-feature-components.md` / `ui-ux-search-panel.md` / `architecture-implementation-patterns.md` / `error-handling.md` / `lessons-learned.md` への同期
- Phase 12 の 0件→1件再同期ルールを `task-specification-creator` に反映

#### 含まないもの

- 04C 自体の UI リデザイン
- `file:read` IPC 契約そのものの全面変更
- 新しい preview renderer エンジンの導入
- Workspace Chat 本体（04B）の機能追加

### 2.4 成果物

- 本未タスク指示書
- fuzzy search / preview resilience / error taxonomy の標準化コードまたは仕様差分
- 更新済み system spec 正本
- 更新済み Phase 12 成果物
- 検証ログ（links / audit / relevant tests）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-UI-04C-WORKSPACE-PREVIEW` の current 実装と Phase 12 成果物が参照可能であること
- `apps/desktop` の targeted tests と `pnpm --filter @repo/desktop typecheck` が実行可能であること
- `.claude/skills/aiworkflow-requirements/` と `.claude/skills/task-specification-creator/` を canonical root として更新できること

### 3.2 依存タスク

- `TASK-UI-04C-WORKSPACE-PREVIEW`

### 3.3 必要な知識

- `useQuickFileSearch` の ranking 実装
- `PreviewPanel` の loading / fallback / error surface
- renderer からの `Promise.race` / retry 制御
- Phase 12 の未タスク監査（`verify-unassigned-links` / `audit-unassigned-tasks`）

### 3.4 推奨アプローチ

1. ranking / preview / error surface / docs sync を別 concern として切り分ける
2. match 判定、timeout 制御、error taxonomy を pure rule と UI 契約に分離する
3. 親 task の苦戦箇所 3件を `3.5 実装課題と解決策` に固定し、system spec と unassigned-task を同じ ID で同期する
4. Phase 12 成果物は `unassigned-task-detection.md` / `spec-update-summary.md` / `documentation-changelog.md` / 必要なら `phase12-task-spec-compliance-check.md` を同一ターンで再同期する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                     | 発見経緯                                                                         | 解決策                                                                        | 教訓                                                                   |
| -------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| fuzzy search の順位補正が非一致候補まで通る              | TASK-UI-04C で subsequence score 0 に boost が乗り、query 非一致ファイルが残った | match 判定を先に行い、補正は一致済み候補だけへ適用する                        | fuzzy ranking は「一致判定」と「順位補正」を別責務にする               |
| preview 用 `file:read` が hang すると loading が固着する | Main 応答待ちだけに依存すると Renderer が復帰しなかった                          | `Promise.race` による timeout と限定 retry を Renderer 層に閉じる             | preview / inspector 系 invoke は renderer timeout + retry を標準にする |
| structured preview parse error を fatal と同列に扱う     | JSON/YAML 整形失敗で raw source fallback まで失われた                            | parse failure を recoverable error として banner + source fallback に分離する | transport failure と parse failure を同じ error surface に載せない     |

### 3.6 SubAgent 分担

| SubAgent   | 関心ごと                       | 主担当成果物                                            |
| ---------- | ------------------------------ | ------------------------------------------------------- |
| SubAgent-A | fuzzy ranking / search utility | score utility、`no match -> []`、stable sort test       |
| SubAgent-B | preview read resilience        | timeout / retry helper、loading 解放契約、preview test  |
| SubAgent-C | error taxonomy / fallback UI   | parse / transport / crash / no-match 分離、UI contract  |
| SubAgent-D | docs / Phase 12 sync           | unassigned-task、task-workflow、system spec、validators |

---

## 4. 実行手順

### Phase構成

- Phase A: 04C 難所の責務分解
- Phase B: search / preview resilience の標準化
- Phase C: error taxonomy と system spec 同期
- Phase D: Phase 12 成果物と監査の再同期

### Phase A: 04C 難所の責務分解

#### 目的

親 task の苦戦箇所を、再利用対象と task 内で閉じた修正対象に分離する。

#### 手順

1. `useQuickFileSearch`、`PreviewPanel`、関連 test を確認し、再利用価値のある責務を列挙する。
2. `fuzzy match`、`renderer timeout/retry`、`error taxonomy` を別 concern として整理する。
3. system spec に記録すべき文脈を feature spec / search panel / architecture patterns / error handling に割り当てる。

#### 成果物

- concern 分解メモ
- 更新対象ファイル一覧

#### 完了条件

- 3つの難所が distinct concern として説明できる

### Phase B: search / preview resilience の標準化

#### 目的

類似 UI へ横展開できる utility / contract を定義する。

#### 手順

1. fuzzy ranking の match gate、stable sort、top 10 制御を utility / test へ昇格する。
2. preview 読み込みの timeout / retry 契約を helper か hook rule として定義する。
3. loading 解除条件を success / timeout / fatal のいずれかで必ず閉じるようにする。

#### 成果物

- search resilience 仕様またはコード差分
- preview resilience 仕様またはコード差分

#### 完了条件

- `score=0` 候補混入と loading 固着の両方を機械的に防げる

### Phase C: error taxonomy と system spec 同期

#### 目的

parse / transport / crash / no-match の UI 応答を正本仕様へ固定する。

#### 手順

1. `ui-ux-feature-components.md`、`ui-ux-search-panel.md`、`architecture-implementation-patterns.md`、`error-handling.md` に関連未タスク導線を追加する。
2. `task-workflow.md` と `lessons-learned.md` に親 task の関連未タスクを登録する。
3. 必要に応じて `generate-index.js` を実行し、aiworkflow spec index を再生成する。

#### 成果物

- 更新済み system spec 正本
- 関連未タスク導線

#### 完了条件

- 04C の教訓から本未タスクへ辿れる入口が複数仕様書で一致している

### Phase D: Phase 12 成果物と監査の再同期

#### 目的

0件で閉じた Phase 12 成果物を、formalized unassigned task 1件として再同期する。

#### 手順

1. `outputs/phase-12/unassigned-task-detection.md`、`spec-update-summary.md`、`documentation-changelog.md` を 1件前提へ更新する。
2. 必要なら `phase12-task-spec-compliance-check.md` も同じ件数へ合わせる。
3. `verify-unassigned-links.js`、`audit-unassigned-tasks.js --json --diff-from HEAD --target-file ...`、relevant tests を実行する。
4. `.claude` 正本から `.agents` mirror へ同期し、`diff -qr` で差分がないことを確認する。

#### 成果物

- 更新済み Phase 12 成果物
- 監査結果

#### 完了条件

- 未タスク 1件の件数、ID、参照先が workflow / outputs / system spec で一致する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] fuzzy ranking の match gate と stable sort が仕様または code/test に固定されている
- [ ] preview 読み込みの renderer timeout + retry 契約が再利用可能な形で整理されている
- [ ] parse / transport / crash / no-match の UI 応答が仕様上区別されている

### 品質要件

- [ ] relevant tests が PASS する
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS する
- [ ] `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/unassigned-task/task-imp-workspace-preview-search-resilience-guard-001.md` で `currentViolations.total = 0`
- [ ] `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` が PASS する

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に存在する
- [ ] `task-workflow.md` の 04C 節と残課題テーブルに同じ ID が登録されている
- [ ] `ui-ux-feature-components.md` / `ui-ux-search-panel.md` / `architecture-implementation-patterns.md` / `error-handling.md` / `lessons-learned.md` に関連未タスク導線がある
- [ ] 04C の `unassigned-task-detection.md` / `spec-update-summary.md` / `documentation-changelog.md` が 1件前提で再同期されている

---

## 6. 検証方法

### テストケース

- Case 1: query 非一致時に候補が 0 件になる
- Case 2: same-score 候補で stable sort が維持される
- Case 3: `file:read` timeout 時に loading が解除され、fatal surface へ遷移する
- Case 4: JSON/YAML parse failure 時に banner + source fallback が維持される
- Case 5: 未タスク 1件の ID / 参照先が workflow / outputs / system spec で一致する

### 検証手順

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/views/WorkspaceView/hooks/__tests__/useQuickFileSearch.test.ts \
  src/renderer/views/WorkspaceView/__tests__/PreviewPanel.test.tsx \
  src/renderer/views/WorkspaceView/__tests__/PreviewErrorBoundary.test.tsx

pnpm --filter @repo/desktop typecheck

node .claude/skills/aiworkflow-requirements/scripts/generate-index.js

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD \
  --target-file docs/30-workflows/unassigned-task/task-imp-workspace-preview-search-resilience-guard-001.md

diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
```

---

## 7. リスクと対策

| リスク                                                                | 影響度 | 発生確率 | 対策                                                                                    |
| --------------------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------------------- |
| 04C 専用改善のまま終わり、別 UI に横展開されない                      | 中     | 高       | utility / contract / spec の 3 層で再利用形へ昇格する                                   |
| retry を parse failure にまで適用して UX が悪化する                   | 中     | 中       | transport 系だけ retryable とし、parse 系は fallback に限定する                         |
| Phase 12 成果物だけ更新して task-workflow / feature spec が追随しない | 高     | 中       | Step 1-C と Step 2 を同一ターンで更新し、`verify-unassigned-links` と diff を必須化する |
| `.claude` と `.agents` の内容差分で参照先がぶれる                     | 中     | 中       | `.claude` を canonical root、`.agents` を mirror として同期後に `diff -qr` で確認する   |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/`
- `docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/outputs/phase-12/unassigned-task-detection.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`
- `.claude/skills/aiworkflow-requirements/references/error-handling.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/task-specification-creator/references/patterns.md`

### 参考資料

- `apps/desktop/src/renderer/views/WorkspaceView/hooks/useQuickFileSearch.ts`
- `apps/desktop/src/renderer/views/WorkspaceView/components/PreviewPanel.tsx`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
TASK-UI-04C の実装では 3 件の難所を task 内で解消したが、同種の preview/search UI で繰り返す可能性が高い。次回は fuzzy no-match、renderer timeout+retry、parse fallback を共通ガードとして最初から適用できるようにする。
```

### 補足事項

この未タスクは 04C の不具合再修正ではなく、苦戦箇所を次回の短縮導線へ昇格するための共通化タスクである。実装時は feature 局所責務を保ちながら、spec と test を先に固めることを優先する。
