# UT-TASK-RT-04-SETTINGS-VS-LIFECYCLE-BOUNDARY-001: APIキー導線の責務境界再確定

## メタ情報

| 項目         | 内容                                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID     | UT-TASK-RT-04-SETTINGS-VS-LIFECYCLE-BOUNDARY-001                                                                                            |
| 発見元       | TASK-RT-04 実装レビュー                                                                                                                     |
| 発見日       | 2026-03-29                                                                                                                                  |
| 優先度       | 中                                                                                                                                          |
| 種別         | 仕様整合                                                                                                                                    |
| ステータス   | resolved (2026-03-29)                                                                                                                       |
| 関連ファイル | apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx, docs/30-workflows/step-08-par-task-rt-04-api-key-management-ui/index.md |

## 背景

task spec と実装で主導線/補助導線の記述が曖昧だったため、 drift リスクがあった。  
2026-03-29 の wave で `SettingsView` を主導線、`SkillLifecyclePanel` を補助導線として明文化した。

## 対応内容

1. `index.md` の現行コード事実へ `SkillLifecyclePanel` 行を追加した。
2. AC-1 を「`SettingsView` 主導線 / `SkillLifecyclePanel` 補助導線」へ更新した。
3. クイックガイドに契約再利用ルールを明記した。

## 受入基準

- [x] 主導線/補助導線が確定している
- [x] workflow 文書と実装が同じ導線を参照している
- [x] `apiKey:*` と `auth-key:*` の契約境界が文書化されている
