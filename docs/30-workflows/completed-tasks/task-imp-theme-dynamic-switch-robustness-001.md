# UT-IMP-THEME-DYNAMIC-SWITCH-ROBUSTNESS-001: テーマ動的切替の再発防止ガード強化

## メタ情報

| 項目         | 内容                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-THEME-DYNAMIC-SWITCH-ROBUSTNESS-001                                          |
| タスク名     | テーマ動的切替の再発防止ガード強化                                                  |
| 分類         | 改善（imp）                                                                         |
| 対象機能     | settingsSlice テーマ動的切替（ThemeMode / resolvedTheme / ThemeSelector / IPC連携） |
| 優先度       | 中                                                                                  |
| 見積もり規模 | 中規模                                                                              |
| ステータス   | 未実施                                                                              |
| 発見元       | UT-UI-THEME-DYNAMIC-SWITCH-001 Phase 12（実装苦戦箇所の再監査）                     |
| 発見日       | 2026-02-25                                                                          |
| 関連タスク   | UT-UI-THEME-DYNAMIC-SWITCH-001, UT-UI-TAILWIND-TOKENS-INTEGRATION-001               |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-UI-THEME-DYNAMIC-SWITCH-001 で `kanagawa-dragon / light / dark / system` の4モード切替は実装完了したが、実装時に「状態責務混在」「Hook依存不安定」「Phase 12証跡同期漏れ」が繰り返し発生した。現状は人手確認に依存する部分が残っており、同種改修時に再発するリスクがある。

### 1.2 問題点・課題

1. `themeMode`（選択値）と `resolvedTheme`（解決値）の責務分離がコード規約として固定化されていない
2. Theme系Hookの依存参照安定性に対する回帰テストが不足し、再実行ループが再発しうる
3. Phase 12で成果物実体は揃っていても、仕様書本体（実行記録）更新漏れを自動検知しにくい

### 1.3 放置した場合の影響

- `system` モード時のテーマ競合バグが再発し、設定画面の信頼性が低下する
- テーマ反映の副作用ループで描画・操作が不安定になる
- ドキュメント監査で差し戻しが発生し、Phase 12完了までの時間が増える

## 2. 何を達成するか（What）

### 2.1 目的

テーマ切替の実装ルールをテスト・検証スクリプト・仕様書更新フローで固定し、同種課題を短時間で再現可能にする。

### 2.2 最終ゴール

- 状態責務分離（`themeMode` / `resolvedTheme`）の回帰ガードがある
- Hook依存安定性の回帰ガードがある
- Phase 12証跡同期漏れを検出できる運用手順と検証ログがある

### 2.3 スコープ

#### 含むもの

- テーマ状態責務分離に関するテストケース拡充（Store/Hook/UI/IPCの境界）
- Theme関連Hookの依存安定性チェック（再実行ループ防止）
- Phase 12証跡同期（成果物実体 + 実行記録）を確認する検証手順の追加
- `aiworkflow-requirements` の関連仕様書（task-workflow / ui-ux-design-system / lessons-learned）への反映

#### 含まないもの

- 新テーマ追加（5モード目以降）
- Tailwindトークン統合作業そのもの（UT-UI-TAILWIND-TOKENS-INTEGRATION-001 の範囲）
- デザイン刷新やUI文言変更

### 2.4 成果物

| 成果物           | 内容                                                                         |
| ---------------- | ---------------------------------------------------------------------------- |
| 回帰テスト拡充   | `settingsSlice` / `useTheme` / `SettingsView` / `themeHandlers` の追加テスト |
| 検証手順書       | Phase 12証跡同期チェックの実行手順とコマンド記録                             |
| 仕様更新         | `task-workflow.md`, `ui-ux-design-system.md`, `lessons-learned.md` の更新    |
| 未タスク検証ログ | `verify-unassigned-links` と `audit-unassigned-tasks` の結果                 |

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-UI-THEME-DYNAMIC-SWITCH-001 の実装内容が現行ブランチに反映済みであること
- `task-specification-creator` と `aiworkflow-requirements` の最新テンプレートが参照可能であること
- `pnpm` / `node` による検証コマンドが実行可能であること

### 3.2 依存タスク

- 先行完了: UT-UI-THEME-DYNAMIC-SWITCH-001
- 並行考慮: UT-UI-TAILWIND-TOKENS-INTEGRATION-001（配色適用面の将来拡張）

### 3.3 必要な知識

- Zustandでの状態責務分離とSelector設計
- Electron IPC（`theme:get-system`, `theme:system-changed`）の契約
- Phase 12の必須成果物・未タスク検出ガイドライン

### 3.4 推奨アプローチ

1. まず状態責務（選択値/適用値）をテストで固定する
2. 次にHook依存の安定性をテストで固定する
3. 最後にPhase 12証跡同期の検証を自動コマンドで固定する
4. 仕様書3点セットを同一ターンで更新し、台帳差分を残さない

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                      | 発見経緯                           | 解決策                                                       | 教訓                                                 |
| ----------------------------------------- | ---------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| `themeMode` と `resolvedTheme` の責務混在 | `system` 選択時の保存値/適用値競合 | SSOTを `themeMode` に固定し、`resolvedTheme` は解決値専用化  | テーマ状態は「選択値」と「適用値」を分離して設計する |
| Hook依存の不安定参照                      | `useEffect` 再実行ループ懸念       | 合成Hookを避け、個別セレクタで依存を安定化                   | UI副作用を持つHookは個別セレクタ前提で実装する       |
| Phase 12証跡同期漏れ                      | 成果物実体と実行記録の乖離         | `outputs/phase-12` と `phase-12-documentation.md` を1対1突合 | 完了判定は「成果物 + 実行記録」の2条件で行う         |

## 4. 実行手順

### Phase構成

1. ガード設計
2. テスト実装
3. ドキュメント・台帳同期
4. 検証・完了判定

### Phase 1: ガード設計

#### 目的

回帰防止対象（状態責務/Hook依存/証跡同期）を明確化する。

#### 手順

1. 親タスクの苦戦箇所を3件抽出する
2. 各課題をテスト観点とドキュメント観点に分割する
3. 検証コマンドと完了条件を定義する

#### 成果物

- ガード対象一覧
- テスト観点マトリクス

#### 完了条件

- 3課題すべてに対し、検証観点が1つ以上定義されている

### Phase 2: テスト実装

#### 目的

状態責務とHook依存の回帰防止テストを追加する。

#### 手順

1. `settingsSlice` の状態責務分離テストを追加する
2. `useTheme` / `useThemeInitializer` の依存安定性テストを追加する
3. `SettingsView` / `themeHandlers` の境界テストを追加する

#### 成果物

- 追加テストコード
- テスト実行ログ

#### 完了条件

- 対象テストがすべてPASSする

### Phase 3: ドキュメント・台帳同期

#### 目的

システム仕様書と未タスク台帳を同期し、追跡可能性を確保する。

#### 手順

1. `task-workflow.md` 残課題テーブルへ本タスクを登録する
2. `ui-ux-design-system.md` の関連タスクへ本タスクを登録する
3. `lessons-learned.md` に必要な教訓追補を行う

#### 成果物

- 更新済み仕様書3点
- 変更履歴エントリ

#### 完了条件

- 各仕様書に本タスクの参照が存在する

### Phase 4: 検証・完了判定

#### 目的

リンク整合・フォーマット整合・仕様準拠を確認する。

#### 手順

1. `verify-unassigned-links.js` を実行する
2. `audit-unassigned-tasks.js --target-file` でフォーマット監査する
3. `verify-all-specs.js --workflow --strict` を実行する

#### 成果物

- 検証ログ
- PASS/FAIL判定

#### 完了条件

- 3検証すべてPASS

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `themeMode` と `resolvedTheme` の責務分離を検証する回帰テストがある
- [ ] Hook依存安定性を検証する回帰テストがある
- [ ] Theme IPC境界の回帰テストがある

### 品質要件

- [ ] 追加テストがPASSする
- [ ] lint/typecheck で新規エラーがない
- [ ] 検証コマンド結果が記録されている

### ドキュメント要件

- [ ] 未タスク仕様書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` に残課題として登録されている
- [ ] `ui-ux-design-system.md` に関連タスクとして登録されている
- [ ] 苦戦箇所が本仕様書の 3.5 に反映されている

## 6. 検証方法

### テストケース

| No  | 観点     | 検証内容                                                      | 期待結果   |
| --- | -------- | ------------------------------------------------------------- | ---------- |
| 1   | 状態責務 | `themeMode` と `resolvedTheme` が同一責務として扱われていない | 競合なし   |
| 2   | Hook依存 | テーマ反映時に不要な再実行ループが発生しない                  | ループなし |
| 3   | IPC境界  | `theme:get-system` / `theme:system-changed` 契約が維持される  | 契約維持   |
| 4   | 証跡同期 | `outputs/phase-12` と実行記録の整合が取れている               | 乖離なし   |

### 検証手順

1. `pnpm --filter @repo/desktop exec vitest run src/renderer/store/slices/settingsSlice.test.ts src/renderer/hooks/useTheme.test.ts src/renderer/views/SettingsView/SettingsView.test.tsx src/main/ipc/themeHandlers.test.ts`
2. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
3. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/task-imp-theme-dynamic-switch-robustness-001.md`
4. `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/ut-ui-theme-dynamic-switch-001 --strict`

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                                             |
| -------------------------------- | ------ | -------- | ---------------------------------------------------------------- |
| テスト追加時の既存モック干渉     | 中     | 中       | 対象テストを個別実行し、初期化順序を固定する                     |
| 仕様書更新漏れ                   | 中     | 中       | 3点セット（task-workflow / ui-ux / lessons）同時更新を必須化する |
| 未タスク台帳と実ファイルの不整合 | 高     | 低       | `verify-unassigned-links.js` を完了条件に固定する                |
| 苦戦箇所が症状だけで終わる       | 中     | 中       | 3.5で「課題/発見経緯/解決策/教訓」を必須記録する                 |

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### 参考資料

- `docs/30-workflows/completed-tasks/ut-ui-theme-dynamic-switch-001/outputs/phase-12/phase12-task-spec-compliance-check.md`
- `docs/30-workflows/completed-tasks/ut-ui-theme-dynamic-switch-001.md`

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
UT-UI-THEME-DYNAMIC-SWITCH-001 実装時の苦戦箇所:
- themeMode / resolvedTheme の責務混在
- Store Hook依存の再実行ループ
- Phase 12証跡と仕様書本体の同期漏れ
```

### 補足事項

同種課題での初動を短縮するため、実装開始前に本仕様書の「3.5 実装課題と解決策」をチェックリストとして読み合わせること。
