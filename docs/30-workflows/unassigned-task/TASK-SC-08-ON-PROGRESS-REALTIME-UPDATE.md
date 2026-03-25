# TASK-SC-08: onProgress コールバックによるリアルタイムプログレス更新

## 概要

SkillCreatorAPI.onProgress(callback) を接続し、executePlan 実行中に
リアルタイムプログレスメッセージを表示する。
Phase 3 設計レビューで特定した未タスク（R-3）。

## 背景

TASK-SC-06-UI-RUNTIME-CONNECTION では generationProgress に静的テキスト
（「計画を生成中...」「スキルを生成中...」）を設定している。
onProgress コールバックを接続することで AI の進捗状況をリアルタイム表示できる。

## 変更対象ファイル

- apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx（または hooks/useSkillLLMGeneration.ts）
- preload/skill-creator-api.ts（onProgress の型確認）

## 受入基準

- executePlan 実行中に onProgress コールバックが呼ばれる
- generationProgress がリアルタイム更新される
- UI のプログレステキストが動的に変化する

## 苦戦箇所（TASK-SC-06 実装知見）

| 苦戦箇所                                     | 問題                                                                                                                          | 解決策                                                                              |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| generationProgress の Store/Local 二重管理   | `setGenerationProgress` は Store 経由だが、UI 表示に反映するには JSX 側で `generationProgress` 変数を宣言・表示する必要がある | useGenerationProgress のセレクタ呼出し + `aria-live="polite"` で JSX 表示を追加する |
| onProgress コールバックの IPC チャンネル設計 | Main → Renderer への push 型通信は `ipcMain.handle` ではなく `webContents.send` + `ipcRenderer.on` パターンが必要             | Preload に `safeOn` パターンでリスナー登録し、P5（リスナー二重登録）を防止する      |
| isGenerating ガードと進捗更新の競合          | isGenerating=true の間に onProgress が来ると、UI 更新とガード判定が競合する可能性                                             | onProgress は isGenerating=true の間のみ受け入れ、false 転向時にリスナーを解除する  |

## 参照

- Phase 3 設計レビュー（R-3）
- TASK-SC-06-UI-RUNTIME-CONNECTION 実装ガイド
