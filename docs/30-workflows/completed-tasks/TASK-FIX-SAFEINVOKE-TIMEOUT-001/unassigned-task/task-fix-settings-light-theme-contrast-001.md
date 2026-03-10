# UT-FIX-SETTINGS-LIGHT-THEME-CONTRAST-001: SettingsView ライトテーマ可読性修正

## メタ情報

```yaml
issue_number: 1128
task_id: UT-FIX-SETTINGS-LIGHT-THEME-CONTRAST-001
task_name: SettingsView ライトテーマ可読性修正
category: 修正
target_feature: SettingsView / AccountSection / SettingsCard
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-FIX-SAFEINVOKE-TIMEOUT-001 Phase 11 画面再監査
created_date: 2026-03-10
```

| 項目         | 値                                                  |
| ------------ | --------------------------------------------------- |
| タスクID     | UT-FIX-SETTINGS-LIGHT-THEME-CONTRAST-001            |
| タスク名     | SettingsView ライトテーマ可読性修正                 |
| 分類         | 修正                                                |
| 対象機能     | `apps/desktop/src/renderer/views/SettingsView` 周辺 |
| 優先度       | 中                                                  |
| 見積もり規模 | 小規模                                              |
| ステータス   | 未実施                                              |
| 発見元       | TASK-FIX-SAFEINVOKE-TIMEOUT-001 Phase 11 screenshot |
| 発見日       | 2026-03-10                                          |

## 1. なぜこのタスクが必要か（Why）

Phase 11 screenshot でライトテーマ時に文字色と背景色のコントラストが弱く、主要情報が読みづらい状態を確認した。ダークテーマでは再現せず、テーマトークンと固定色クラスの混在が疑われる。

## 2. 何を達成するか（What）

- ライトテーマで Settings shell の可読性を回復する
- representative screenshot を light/dark 両方で再取得する

## 3. どのように実行するか（How）

### 3.1 推奨アプローチ

1. `text-white` / `text-gray-*` / 固定背景色を洗い出す
2. テーマトークンへ寄せる
3. 再撮影して light/dark 双方を確認する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                  | 解決策                                         | 教訓                                                                        |
| ----------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------- |
| screenshot を取るまでライトテーマ破綻に気づけなかった | representative screenshot を両テーマで固定する | 「機能は非UI」でもユーザーが screen verification を求めたら実画面で確認する |

## 4. 実行手順

1. SettingsView と配下コンポーネントの固定色クラスを確認する
2. ライトテーマで読めない要素をトークンベースへ置換する
3. 再撮影して evidence を更新する

## 5. 完了条件チェックリスト

- [ ] ライトテーマで見出し・本文・ラベルが読める
- [ ] dark theme を回帰させていない
- [ ] screenshot evidence を更新した

## 6. 検証方法

```bash
node apps/desktop/scripts/capture-task-fix-safeinvoke-timeout-phase11.mjs
```

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                          |
| -------------------------------- | ------ | -------- | ----------------------------- |
| ダークテーマの既存デザインを壊す | 中     | 中       | light/dark の両方を再撮影する |

## 8. 参照情報

- `apps/desktop/src/renderer/views/SettingsView/index.tsx`
- `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/outputs/phase-11/screenshots/TC-11-01-settings-shell-light.png`

## 9. 備考

safeInvoke timeout とは別責務の UI 課題として分離する。
