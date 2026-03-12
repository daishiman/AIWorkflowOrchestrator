# Phase 2 アーキテクチャ設計

## 概要

Task03 では `SkillManagementPanel` の list view に単一の lifecycle session card を追加し、`作成 -> 実行 -> 改善` を 1 画面で閉じる。既存の `SkillCreateWizard` は詳細設定用の二次導線へ縮退させる。

## 主要な設計決定

| 項目            | 決定                                                                      | 理由                                                                           |
| --------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 一次導線        | `SkillManagementPanel` list view の session card                          | 既存 Skill Center 導線を維持したまま create / execute / improve を一体化できる |
| create API      | `window.electronAPI.skill.create`                                         | 既に `SkillService.createSkillFromWizard()` 経由で安定している                 |
| internal engine | `window.electronAPI.skillCreator.detectMode` と `validateSkill`           | モード判定と妥当性確認だけを UI 補助情報として使う                             |
| execute API     | `agentSlice.executeSkill`                                                 | 権限、stream、execution state を store へ集約できる                            |
| improve API     | `agentSlice.analyzeSkill` / `applySkillImprovements` / `autoImproveSkill` | 現行 `SkillAnalysisView` と同じ store 契約を再利用できる                       |
| wizard 位置づけ | 「詳細設定で作成する」secondary action                                    | 既存機能を残しつつ一次導線の重複を解消できる                                   |

## レイヤ責務

| レイヤ         | 主要要素                                                       | 責務                                                                |
| -------------- | -------------------------------------------------------------- | ------------------------------------------------------------------- |
| Renderer UI    | `SkillManagementPanel`, 新規 session card                      | prompt 入力、mode ヒント、create / execute / improve 操作、結果表示 |
| Renderer Store | `agentSlice`                                                   | create 後の skill 一覧更新、execute 状態、analysis 状態、error 管理 |
| Preload        | `skill`, `skillCreator`                                        | invoke 制限付き API 公開                                            |
| Main           | `SkillService`, `SkillCreatorService`, existing skill handlers | skill 作成、実行、分析、改善の実処理                                |

## コンポーネント構成

```text
SkillManagementPanel
├─ LifecycleSessionCard          ← 新規
│  ├─ PromptForm
│  ├─ ModeHint
│  ├─ CreatedSkillSummary
│  ├─ ExecutionSummary
│  └─ ImprovementSummary
├─ Imported skills section       ← 既存
├─ Available skills section      ← 既存
└─ SkillImportDialog             ← 既存
```

## 導線の正規フロー

1. ユーザーが自然言語 prompt を入力する。
2. `window.electronAPI.skillCreator.detectMode(prompt)` を呼び、内部モード判定をヒントとして表示する。
3. `createSkill(description, options)` を呼び、生成された `path` から skill 名を導出する。
4. `fetchSkills()` 完了後に `selectSkillByName(skillName)` で選択状態を同期する。
5. `executeSkill(prompt)` を実行し、streaming と execution status を session card に表示する。
6. `analyzeSkill(skillName)` と `autoImproveSkill(skillName)` を同じ session card から実行する。

## UI 契約

| 要素                   | 表示条件                          | 補足                                             |
| ---------------------- | --------------------------------- | ------------------------------------------------ |
| lifecycle session card | list view 常時                    | 一次導線                                         |
| mode hint              | prompt が空でない時               | `create` / `update` / `collaborative` 判定を表示 |
| execute ボタン         | create 成功後                     | 生成された skill がある時のみ活性                |
| improve ボタン         | execute 後または skill 選択済み時 | analyze / auto improve を提供                    |
| wizard 起動ボタン      | 常時                              | 詳細設定が必要な時の二次導線                     |

## 既存要素との境界

| 既存要素                  | 維持する責務               | Task03 で変える点                                                |
| ------------------------- | -------------------------- | ---------------------------------------------------------------- |
| `SkillCreateWizard`       | 詳細設定付きの create      | list view の主導線ではなく secondary action にする               |
| `SkillAnalysisView`       | 既存の個別分析画面         | session card では結果要約を表示し、詳細分析画面は残す            |
| imported / available list | 一覧管理、編集、削除、追加 | list view 上部に session card を追加するだけで既存操作は保持する |

## リスクと抑制策

| リスク                   | 内容                                                 | 抑制策                                                                |
| ------------------------ | ---------------------------------------------------- | --------------------------------------------------------------------- |
| 二重導線の混乱           | session card と wizard の役割が重複する              | wizard の文言を「詳細設定で作成する」に固定する                       |
| create 後の handoff 失敗 | path から skill 名を正しく復元できない               | `path.basename(path)` を共通関数化して selection を同期する           |
| improve 表示の複雑化     | `SkillAnalysisView` と session card の責務が競合する | session card は summary に限定し、詳細操作は analysis view を保持する |
