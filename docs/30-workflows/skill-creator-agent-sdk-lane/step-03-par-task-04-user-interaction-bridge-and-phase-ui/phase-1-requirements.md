# Phase 1: 要件定義

## 目的

AI からの質問を UI に安全に橋渡しし、ユーザーが段階的に答えられる体験を定義する。

## 実行タスク

- question type 定義
- choice / free text / secret input 定義
- phase と UI 表示の分離方針定義
- source provenance / 構成差分 warning をどの surface に出すか定義

## 前提依存

- Task01 の phase / entry-exit 契約
- Task02 の `awaitingUserInput` owner と lane response baseline

## 成果物

- question type 一覧
- UI input surface の対応表
- interaction state contract

## 境界メモ

- 入口導線の最終決定は Task05、verify / re-entry surface は Task06 が担う

## 完了条件

- [ ] ユーザーが全部を最初に言語化しなくてよい設計になっている
- [ ] dynamic source root / 構成差分を UI に説明できる責務境界がある
- [ ] interaction state と mainline navigation の責務境界が分離されている
- [ ] **本Phase内の全タスクを100%実行完了**
