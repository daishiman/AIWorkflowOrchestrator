# [#1589] [TASK-SC-08] onProgress コールバックによるリアルタイムプログレス更新

## メタ情報

```yaml
issue_number: 1589
title: [TASK-SC-08] onProgress コールバックによるリアルタイムプログレス更新
state: OPEN
priority: 中
scale: -
category: -
status: 未実施
created_date: 2026-03-24
updated_date: 2026-03-24
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1589
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

SkillCreatorAPI.onProgress(callback) を接続し、executePlan 実行中にリアルタイムプログレスメッセージを表示する。

## 背景

TASK-SC-06-UI-RUNTIME-CONNECTION では generationProgress に静的テキスト（「計画を生成中...」「スキルを生成中...」）を設定している。
onProgress コールバックを接続することで AI の進捗状況をリアルタイム表示できる。

## 変更対象ファイル

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`（または hooks/useSkillLLMGeneration.ts）
- `preload/skill-creator-api.ts`（onProgress の型確認）

## 受入基準

- [ ] executePlan 実行中に onProgress コールバックが呼ばれる
- [ ] generationProgress がリアルタイム更新される
- [ ] UI のプログレステキストが動的に変化する

## 苦戦箇所（TASK-SC-06 実装知見）

| 苦戦箇所                                     | 問題                                                                           | 解決策                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| generationProgress の Store/Local 二重管理   | Store 経由だが UI 反映には JSX 側で変数宣言・表示が必要                        | useGenerationProgress セレクタ + `aria-live="polite"` で JSX 表示            |
| onProgress コールバックの IPC チャンネル設計 | Main → Renderer push 型は `webContents.send` + `ipcRenderer.on` パターンが必要 | Preload に `safeOn` パターンでリスナー登録し P5（二重登録）を防止            |
| isGenerating ガードと進捗更新の競合          | isGenerating=true の間に onProgress が来ると競合の可能性                       | onProgress は isGenerating=true の間のみ受け入れ、false 転向時にリスナー解除 |

## 参照

- Phase 3 設計レビュー（R-3）
- 指示書: `docs/30-workflows/unassigned-task/TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE.md`
