# UT-IMP-TASK-056D-PHASE11-SCREENSHOT-CAPTURE-PATH-GUARD-001 タスク指示書

## メタ情報

```yaml
issue_number: 983
task_id: UT-IMP-TASK-056D-PHASE11-SCREENSHOT-CAPTURE-PATH-GUARD-001
task_name: Phase 11スクリーンショット再撮影の出力先・ポートpreflightガード
category: 改善
target_feature: TASK-UI-01-D Phase 11/12 再監査運用
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-UI-01-D Phase 12 再確認（2026-03-05）
created_date: 2026-03-05
dependencies: [TASK-UI-01-D-VIEWTYPE-ROUTING-NAV]
spec_path: docs/30-workflows/completed-tasks/task-imp-task-056d-phase11-screenshot-capture-path-guard-001.md
```

| 項目         | 内容                                                            |
| ------------ | --------------------------------------------------------------- |
| タスクID     | UT-IMP-TASK-056D-PHASE11-SCREENSHOT-CAPTURE-PATH-GUARD-001      |
| タスク名     | Phase 11スクリーンショット再撮影の出力先・ポートpreflightガード |
| 分類         | 改善                                                            |
| 優先度       | 中                                                              |
| 見積もり規模 | 小規模                                                          |
| ステータス   | 未実施                                                          |
| 発見元       | TASK-UI-01-D Phase 12 再確認                                    |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`capture-task-056-phase11-screenshots.mjs` は `task-056` 固定パスへ保存する実装で、`task-056d` の再監査時に手動コピーが必要だった。  
また `--strictPort` と固定ポート（5177）運用のため、既存プロセスがいると preflight なしで再撮影手順が不安定になる。

### 1.2 問題点

- 出力先が workflow 非依存で、Phase 11 証跡配置がドリフトしやすい。
- ポート競合時の分岐ルールが明文化されておらず、証跡の再現性が落ちる。

### 1.3 放置時の影響

- Phase 11 証跡の自動取得が再監査で再利用しにくい。
- Phase 12 完了判定までの工数が増え、手順ミスが再発する。

## 2. 何を達成するか（What）

### 2.1 目的

スクリーンショット再撮影を「workflow別の出力先」「ポート競合preflight付き」の手順へ標準化する。

### 2.2 最終ゴール

1. 再撮影スクリプトが workflow 引数で保存先を切り替えられる。
2. ポート競合時に `停止` / `再利用` / `別ポート` の分岐が記録できる。
3. `phase-11-12-guide.md` と `skill-creator/patterns.md` に運用ルールが反映される。

### 2.3 スコープ

#### 含むもの

- `apps/desktop/scripts/capture-task-056-phase11-screenshots.mjs` の出力先パラメータ化
- preflight（`lsof` / health check）と分岐ログの追加
- 運用仕様書の同期

#### 含まないもの

- TASK-UI-01-D 以外の画面仕様変更
- Playwrightテストケースの大幅な追加

## 3. どのように実行するか（How）

### 3.1 前提条件

- `apps/desktop` で `pnpm` と `playwright` が実行できること
- `task-specification-creator` の Phase 11/12 ガイド更新権限があること

### 3.2 依存タスク

- TASK-UI-01-D-VIEWTYPE-ROUTING-NAV（完了）

### 3.3 推奨アプローチ

1. スクリプトに `--workflow`（または `--output-dir`）を追加する。
2. 実行前にポート競合を検査し、分岐を標準ログへ残す。
3. ガイドとパターンへ同時反映して再発防止する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                       | 発見経緯                                         | 解決策                                   | 教訓                                       |
| ---------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------- | ------------------------------------------ |
| 固定出力先により証跡が別workflowへ保存される               | TASK-UI-01-D再撮影で `task-056` 配下へ保存された | workflow引数で保存先を動的解決する       | 証跡保存先はタスクごとに引数化する         |
| `Port 5177 is already in use` でも作業が継続し判定が揺れる | 再撮影実行時に strictPort エラーを確認           | preflight を必須化し、分岐結果を記録する | 失敗時分岐を仕様化しないと再監査で再発する |

## 4. 実行手順

1. スクリプト更新:
   - `--workflow` で保存先を `docs/30-workflows/<workflow>/outputs/phase-11/screenshots` へ解決
   - `--strictPort` 失敗時に `既存サーバ再利用` 分岐を追加
2. ドキュメント更新:
   - `phase-11-12-guide.md` に preflight と分岐記録を追記
   - `skill-creator/references/patterns.md` に成功/失敗パターンを追加
3. 検証:
   - 実際に再撮影を実行し、対象workflowに5枚が保存されることを確認
   - `validate-phase11-screenshot-coverage` がPASSすることを確認

## 5. 完了条件チェックリスト

- [ ] 再撮影スクリプトが workflow 別保存先に対応している
- [ ] ポート競合 preflight と分岐ログが実装されている
- [ ] 対象workflow配下にスクリーンショットが保存される
- [ ] `validate-phase11-screenshot-coverage` が PASS
- [ ] 関連ガイド（task-spec / skill-creator）へ反映されている

## 6. 検証方法

```bash
pnpm --filter @repo/desktop exec node apps/desktop/scripts/capture-task-056-phase11-screenshots.mjs --workflow docs/30-workflows/task-056d-viewtype-routing-nav
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/task-056d-viewtype-routing-nav
```

## 7. リスクと対策

| リスク                 | 影響                 | 対策                                    |
| ---------------------- | -------------------- | --------------------------------------- |
| workflow引数の入力ミス | 別ディレクトリへ保存 | `test -d` で存在確認し、失敗時は中断    |
| ポート分岐の条件漏れ   | 撮影失敗を見逃す     | preflightの結果を標準出力と成果物へ記録 |

## 8. 参照情報

- `apps/desktop/scripts/capture-task-056-phase11-screenshots.mjs`
- `docs/30-workflows/task-056d-viewtype-routing-nav/outputs/phase-11/`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/skill-creator/references/patterns.md`

## 9. 備考

この未タスクは機能不具合ではなく、Phase 11/12 再監査運用の再現性向上を目的とした改善タスク。
