# [#469] [UT-WCE-002] Workspace Chat Edit Main Process

## タスク概要

ワークスペースチャット編集機能のMain Processサービス実装（ファイルI/O、LLM連携、IPCハンドラ）

## メタ情報

- **タスクID**: UT-WCE-002
- **優先度**: 高
- **見積もり規模**: 中規模
- **発見元**: Phase 10（ISSUE-002）, Phase 11

## 成果物

- FileService.ts - ファイル読み書き、言語検出
- ChatEditService.ts - プロンプト構築、LLM連携
- ContextBuilder.ts - コンテキスト構築
- chatEditHandlers.ts - IPCハンドラ
- chatEditApi.ts - Preload API

## 仕様書

docs/30-workflows/unassigned-task/task-workspace-chat-edit-main-process.md

## 依存関係

- workspace-chat-edit 型定義（IPC API）定義済み
- 既存LLM Adapter（OpenAI, Anthropic等）利用可能
- Preload APIパターン確立済み
