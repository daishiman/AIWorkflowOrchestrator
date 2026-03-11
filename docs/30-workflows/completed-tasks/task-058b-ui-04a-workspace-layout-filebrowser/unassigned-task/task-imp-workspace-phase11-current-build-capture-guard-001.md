# UT-IMP-WORKSPACE-PHASE11-CURRENT-BUILD-CAPTURE-GUARD-001: Workspace Phase 11 current build capture ガード

## メタ情報

```yaml
issue_number: 1140
task_id: UT-IMP-WORKSPACE-PHASE11-CURRENT-BUILD-CAPTURE-GUARD-001
task_name: Workspace Phase 11 current build capture ガード
category: 改善
target_feature: Workspace Layout / worktree screenshot capture / visual review
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-UI-04A-WORKSPACE-LAYOUT Phase 11/12 再監査
created_date: 2026-03-10
dependencies:
  - TASK-UI-04A-WORKSPACE-LAYOUT
```

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | UT-IMP-WORKSPACE-PHASE11-CURRENT-BUILD-CAPTURE-GUARD-001 |
| タスク名     | Workspace Phase 11 current build capture ガード          |
| 分類         | 改善                                                     |
| 対象機能     | Workspace 系 UI の worktree screenshot 再取得運用        |
| 優先度       | 中                                                       |
| 見積もり規模 | 小規模                                                   |
| ステータス   | 未実施                                                   |
| 発見元       | TASK-UI-04A-WORKSPACE-LAYOUT Phase 11/12 再監査          |
| 発見日       | 2026-03-10                                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UI-04A-WORKSPACE-LAYOUT の Phase 11 再撮影では、複数 worktree で Vite preview の参照元が揺れ、current worktree の UI ではなく別 source の build が表示される状況が発生した。今回の再監査では `apps/desktop/out/renderer` を static server で直接配信する運用で回避できたが、まだ共通スクリプトや検証ガードとしては実装されていない。

### 1.2 問題点・課題

- screenshot capture の参照元固定が手作業で、current worktree build を保証する仕組みがない
- Workspace 系 UI で重要だった `reverse resize`、`watch callback ref`、`light theme contrast` の確認が capture 手順と一体化されていない
- 04B / 04C や他の workspace UI タスクで同じ再監査を行う際、再び source drift や見た目の取りこぼしを起こしやすい

### 1.3 放置した場合の影響

- 正しいブランチの UI を撮ったつもりで別 build の画面を証跡化する可能性が残る
- screenshot PASS でも panel resize や watcher 更新、light theme 視認性の回帰を見逃す
- worktree を使う UI タスクの Phase 11/12 が人依存になり、再現性と説明責任が落ちる

---

## 2. 何を達成するか（What）

### 2.1 目的

Workspace 系 UI の screenshot 再取得で current worktree build を capture 元として固定し、再監査時に確認すべき visual / interaction 観点を標準化する。

### 2.2 最終ゴール

1. current worktree の `apps/desktop/out/renderer` を capture 元として自動配信または自動検証できる
2. capture metadata に worktree path、asset hash、serve source が記録される
3. Workspace UI の再監査で `reverse resize`、`watch 更新`、`light theme contrast` を毎回同じ手順で確認できる

### 2.3 スコープ

#### 含むもの

- Workspace 系 screenshot capture の current build source pinning
- capture metadata / verification checklist の標準化
- `task-specification-creator` / `aiworkflow-requirements` / 対象 workflow への運用反映

#### 含まないもの

- `WorkspaceView` の新機能追加
- 04B / 04C の chat / preview 機能本体実装
- Playwright 全体基盤の大規模刷新

### 2.4 成果物

- current build static serve を扱う共通 capture helper または wrapper script
- Workspace UI 向け capture metadata 追加項目
- 更新済み Phase 11/12 ガイドと system spec の再利用導線

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `pnpm build` で `apps/desktop/out/renderer` を生成できること
- Phase 11 capture script が Playwright で実行可能であること
- `validate-phase11-screenshot-coverage.js` と `verify-unassigned-links.js` が利用可能であること

### 3.2 依存タスク

- `TASK-UI-04A-WORKSPACE-LAYOUT`

### 3.3 必要な知識

- worktree 環境での Vite preview / static serve の違い
- Workspace Layout の panel resize / watcher / preview 更新契約
- Phase 11 screenshot coverage と Phase 12 未タスク監査運用

### 3.4 推奨アプローチ

1. current worktree の build artifact を static server で配信する共通手順をスクリプト化する
2. capture metadata に worktree path、asset hash、serve source、確認観点を保存する
3. Workspace UI の Phase 11 checklist に `reverse resize`、`watch 更新`、`light theme contrast` の 3 観点を追加する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                             | 発見経緯                                                                            | 解決策                                                                                             | 教訓                                                                              |
| ------------------------------------------------ | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| worktree の Vite preview が別 source を指した    | TASK-UI-04A の再撮影で current branch の harness が表示されないケースを確認         | `pnpm build` 後の `apps/desktop/out/renderer` を static server で配信して current build を固定した | worktree screenshot は dev server を盲信せず、current build artifact を起点にする |
| right preview panel の resize が逆転しやすい     | 右 panel に左用 drag 計算を流用すると見た目だけでは誤判定しやすかった               | `direction: "reverse"` を明示し、drag 後 screenshot で幅変化を確認した                             | Workspace UI の screenshot は見た目だけでなく interaction 結果を証跡化する        |
| watch hook が callback identity 変更で再登録した | `onFileChanged` を dependency に置いたまま refresh すると watch start/stop が揺れた | callback ref 分離へ変更し、watch lifecycle dependency を限定した                                   | watcher 系は callback ref と lifecycle dependency を分ける                        |
| light theme の補助テキストが screenshot で沈んだ | 実機では読めても証跡画像で hierarchy が弱く見えた                                   | chip / text / status bar を局所調整し、Apple UI/UX 観点で再撮影した                                | light theme は dark と別に visual review する                                     |

---

## 4. 実行手順

### Phase構成

- Phase A: source pinning 設計
- Phase B: capture helper 実装
- Phase C: visual / interaction checklist 統合
- Phase D: 仕様同期と検証

### Phase A: source pinning 設計

#### 目的

current build を screenshot 元として固定する仕様を決める。

#### 手順

1. 既存の capture script と static serve 手順を棚卸しする
2. current worktree path、asset hash、serve source を metadata に残す方式を決める
3. preview source drift を検知する fail 条件を定義する

#### 成果物

- source pinning 設計メモ
- metadata 追加項目一覧

#### 完了条件

- current build を特定する手順が 1 つに固定されている

### Phase B: capture helper 実装

#### 目的

manual な static serve 起動をスクリプト化し、current build capture を自動化する。

#### 手順

1. `apps/desktop/out/renderer` を配信する helper または wrapper script を追加する
2. capture 前後で起動・停止・ポート利用・serve source を記録する
3. capture metadata に worktree path / asset hash / serve source を追記する

#### 成果物

- 更新済み capture helper
- 更新済み metadata 出力

#### 完了条件

- current worktree build 以外を参照した場合に検知できる

### Phase C: visual / interaction checklist 統合

#### 目的

Workspace UI 固有の再発観点を screenshot 運用へ組み込む。

#### 手順

1. `reverse resize` の確認手順を manual test / screenshot matrix に追加する
2. `watch 更新` の確認観点を metadata または checklist に追加する
3. `light theme contrast` の目視判定項目を固定する

#### 成果物

- 更新済み checklist
- 更新済み screenshot matrix / metadata

#### 完了条件

- 3観点が Phase 11 証跡で毎回確認できる

### Phase D: 仕様同期と検証

#### 目的

未タスクを再利用できる形で仕様書と workflow に反映する。

#### 手順

1. `task-workflow.md` / `ui-ux-feature-components.md` / `lessons-learned.md` を更新する
2. `verify-unassigned-links.js` と `audit-unassigned-tasks.js --diff-from HEAD` を実行する
3. 必要に応じて `generate-index.js` を再実行し、topic-map / keywords を同期する

#### 成果物

- 更新済み system spec
- 監査結果

#### 完了条件

- 未タスク指示書と system spec の参照が一致し、監査が PASS する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] current build static serve を再利用できる helper または wrapper script がある
- [ ] capture metadata に worktree path / serve source / asset hash が残る
- [ ] Workspace UI 再監査で `reverse resize` / `watch 更新` / `light theme contrast` を確認できる

### 品質要件

- [ ] current worktree 以外の build を誤って証跡化しない
- [ ] capture 実行後に `validate-phase11-screenshot-coverage` が PASS する
- [ ] `audit-unassigned-tasks --json --diff-from HEAD` が `currentViolations=0` になる

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` と `ui-ux-feature-components.md` に未タスク導線がある
- [ ] `lessons-learned.md` に苦戦箇所と再利用手順が参照されている

---

## 6. 検証方法

### テストケース

- Case 1: current worktree build を配信した状態で screenshot capture が完走する
- Case 2: metadata に worktree path / serve source / asset hash が保存される
- Case 3: `reverse resize` / `watch 更新` / `light theme contrast` の証跡が揃う
- Case 4: `verify-unassigned-links` と `audit-unassigned-tasks` が PASS する

### 検証手順

```bash
pnpm build
python3 -m http.server 4173 --directory apps/desktop/out/renderer
node apps/desktop/scripts/capture-task-058b-workspace-layout-phase11.mjs
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

> completed workflow 配下へ移動した後は `--target-file` の監査対象外になるため、差分監査は `--diff-from HEAD` を使用する。

---

## 7. リスクと対策

| リスク                                             | 影響度 | 発生確率 | 対策                                                                                         |
| -------------------------------------------------- | ------ | -------- | -------------------------------------------------------------------------------------------- |
| 既存の worktree 初期化タスクと責務が重複する       | 中     | 中       | `@repo/shared` ビルド初期化ではなく capture source pinning に責務を限定する                  |
| visual review が主観的になりやすい                 | 中     | 中       | `reverse resize` / `watch 更新` / `light theme contrast` を checklist と metadata で固定する |
| static serve helper の停止漏れでポート競合を起こす | 中     | 中       | 起動・停止・使用ポートを metadata とログへ記録し、既存ポート競合ガードと併用する             |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/outputs/phase-11/phase11-capture-metadata.json`

### 参考資料

- `apps/desktop/scripts/capture-task-058b-workspace-layout-phase11.mjs`
- `apps/desktop/src/renderer/views/WorkspaceView/hooks/usePanelResize.ts`
- `apps/desktop/src/renderer/views/WorkspaceView/hooks/useFileWatcher.ts`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
worktree の preview source が揺れる場合は current build を static 配信し、
reverse resize / watcher callback ref / light theme contrast を同じ再監査セットで確認する。
```

### 補足事項

- 04B / 04C の後続実装とは別に、「Workspace 系 UI を正しく再監査する運用」を独立責務で切り出した未タスクである。
- すでに 04A 本体の実装・テスト・スクリーンショットは完了しており、本未タスクはその再利用性を高めるための改善である。
