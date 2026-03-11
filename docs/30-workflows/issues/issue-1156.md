# [#1156] "[TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001] light theme の shared component 固定色を semantic token へ移行"

## メタ情報

```yaml
task_id: TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001
task_name: light theme の shared component 固定色を semantic token へ移行
category: バグ修正
target_feature: Renderer shared UI（Dashboard / Settings / AgentView 周辺の共通コンポーネント）
priority: 高
scale: 中規模
status: 未実施
source_phase: TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 Phase 11 視覚検証
created_date: 2026-03-11
dependencies: []
spec_path: docs/30-workflows/completed-tasks/light-theme-token-foundation/unassigned-task/task-fix-light-theme-shared-color-migration-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`tokens.css` の light token 契約は是正済みだが、Phase 11 の screenshot（Dashboard / Settings）で補助テキストや境界線の視認性不足が残った。原因は shared component 側で旧 color 値や互換変数を参照している箇所が残っているため。

### 1.2 問題点

- token 基盤を修正しても、shared component で hardcoded color / legacy 変数が残ると実画面で改善が反映されない
- 画面ごとに見え方が異なり、再監査時に「token は正しいのに UI が見づらい」状態が再発する

### 1.3 放置した場合の影響

- light theme の可読性が画面ごとに不均一なまま残る
- 同種の token 修正タスクで毎回手戻りが発生する

---

## 2. 何を達成するか（What）

### 2.1 目的

light theme で問題が出た shared component の固定色を semantic token に統一し、画面ごとの可読性差を解消する。

### 2.2 最終ゴール

1. 対象 shared component から hardcoded color / legacy 参照を除去する
2. light mode で補助テキスト・境界線の視認性が WCAG 基準を満たす
3. Phase 11 screenshot で再現できる状態に固定する

### 2.3 スコープ

#### 含むもの

- shared component の color 参照を semantic token（`--text-*`, `--border-*`, `--bg-*`）へ移行
- 低コントラストが確認された画面（Dashboard / Settings / AgentView）の再検証
- 変更箇所に対応するテスト・証跡更新

#### 含まないもの

- ダークテーマの配色再設計
- レイアウト変更や文言変更

### 2.4 成果物

- shared component の color migration 差分
- 回帰テスト結果（unit/typecheck）
- Phase 11 screenshot 再取得証跡

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001` の token 契約がベースラインとして反映済み
- `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-11/` の screenshot が参照可能

### 3.2 推奨アプローチ

1. 低コントラスト箇所を screenshot 起点で特定し、対象コンポーネントを逆引きする
2. 対象コンポーネントの color 指定を semantic token 参照へ置換する
3. テスト・typecheck・screenshot 再検証を同一ターンで実施する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                        | 発見経緯                                          | 解決策                                                                                                   | 教訓                                                                |
| ------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| token 基盤修正だけでは画面可読性が揃わない  | Phase 11 で Dashboard / Settings の補助文が沈んだ | shared component の参照先を token 契約へ統一する                                                         | token 修正タスクは component migration を未タスクとして必ず分離する |
| 視覚検証が後回しになりやすい                | 実装優先で screenshot 検証が遅れた                | 実装完了条件に screenshot 再取得を含める                                                                 | UI変更は code/test だけで完了判定しない                             |
| 低コントラスト所見が backlog 化されず流れる | Phase 12 で「既存導線あり」と判断されがち         | `docs/30-workflows/completed-tasks/light-theme-token-foundation/unassigned-task/` に正式指示書を作成する | 検出レポートだけで終わらせず、正式未タスク化する                    |

---

## 4. 実行手順

1. `outputs/phase-11/manual-test-result.md` と screenshot から対象 UI 要素を特定する
2. 対象 shared component の color 参照を `var(--text-*)` / `var(--border-*)` / `var(--bg-*)` に統一する
3. hardcoded color 残存を `rg` で監査し、対象コンポーネントから除去する
4. unit test / typecheck を実行し、契約破壊がないことを確認する
5. Phase 11 screenshot を再取得し、可読性を目視確認する
6. 必要なら `task-workflow.md` / `ui-ux-design-system.md` / `lessons-learned.md` を更新する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 対象 shared component の固定色が semantic token へ移行されている
- [ ] light mode の補助テキスト・境界線で低コントラスト所見が解消している

### 品質要件

- [ ] `pnpm --filter @repo/desktop exec vitest run src/renderer/styles/tokens.light-theme.contract.test.ts` が PASS
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS

### ドキュメント要件

- [ ] Phase 11 screenshot 証跡が更新されている
- [ ] 必要な場合は system spec（task-workflow / ui-ux-design-system / lessons）に同期されている

---

## 6. 検証方法

```bash
# 1) fixed color の残存監査（対象ディレクトリは実装に合わせて調整）
rg -n "#[0-9a-fA-F]{3,8}|rgba\\(|rgb\\(" apps/desktop/src/renderer

# 2) token 契約テスト
pnpm --filter @repo/desktop exec vitest run src/renderer/styles/tokens.light-theme.contract.test.ts

# 3) 型検証
pnpm --filter @repo/desktop typecheck

# 4) 画面検証（必要に応じて再撮影）
node apps/desktop/scripts/capture-light-theme-token-foundation-phase11.mjs
```

---

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                                                  |
| -------------------------------------- | ------ | -------- | --------------------------------------------------------------------- |
| migration 範囲が広がり差分が肥大化する | 中     | 中       | 画面単位で対象を分割し、小さく適用する                                |
| token 参照統一で別テーマに副作用が出る | 中     | 低       | light/dark/kanagawa の3テーマで回帰確認する                           |
| screenshot 再取得が環境要因で失敗する  | 中     | 中       | preflight（port / preview）を先に確認し、失敗時は原因を未タスク化する |

---

## 8. 参照情報

- `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-11/manual-test-result.md`
- `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-11/discovered-issues.md`
- `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-12/unassigned-task-detection.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

---

## 9. 備考

- 本タスクは「token foundation 完了後の UI 適用層是正」を扱う。
- 親タスクの実装成果は維持し、差分は shared component の色参照に限定する。
