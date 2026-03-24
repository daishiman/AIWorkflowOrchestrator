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

## 参照

- Phase 3 設計レビュー（R-3）
- TASK-SC-06-UI-RUNTIME-CONNECTION 実装ガイド
