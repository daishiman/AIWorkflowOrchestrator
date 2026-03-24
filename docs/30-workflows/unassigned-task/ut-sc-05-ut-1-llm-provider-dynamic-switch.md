# UT-SC-05-UT-1: LLM プロバイダーの動的切替対応

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| ID     | UT-SC-05-UT-1                   |
| 検出元 | UT-SC-05-IPC-DI-WIRING Phase 12 |
| 優先度 | High                            |
| 作成日 | 2026-03-24                      |

**優先度変更根拠（Medium → High）**: APIキーは後から設定されるユースケースが主流であり、起動時1回の初期化では初回起動→APIキー未設定→設定→再起動必要というユーザー混乱が高確率で発生する。また初期化失敗時に再試行パスがなく回復なしループに陥るため、Graceful Degradationが永続化するリスクがある。

## 概要

`RuntimeSkillCreatorFacade` の `llmAdapter` は現在 `"anthropic"` プロバイダー固定で起動時に1回だけ取得される。ユーザーが設定画面で別の LLM プロバイダーを選択した場合や、API キーを変更した場合に、アプリ再起動なしで反映されるようにする。

## 背景

Phase 2 設計で案B（`LLMAdapterFactory` をそのまま Facade に注入）を検討したが、`RuntimeSkillCreatorFacadeDeps` の型変更が必要になるため初期実装では案C（IIFE パターン）を採用した。

## 実装方針

1. `RuntimeSkillCreatorFacadeDeps` に `llmAdapterFactory?: typeof LLMAdapterFactory` を追加
2. `plan()` / `improve()` 内で呼び出し時点の最新プロバイダー設定を取得し、`llmAdapterFactory.getAdapter(currentProviderId)` で都度アダプターを取得
3. 設定画面の LLM プロバイダー選択と連携

## 苦戦箇所・知見

- IIFE パターン（`void (async () => { ... })()`）は `safeRegister` の同期インターフェースを変更せずに非同期初期化を実現する手法だが、起動時1回しか実行されないため API キー変更後のアプリ再起動が必須になる制約が発生した
- P57（worktree先送りパターン）の再発: Phase 12 で「PR統合時に実施」として LOGS.md/SKILL.md 更新を先送りし、レビューで検出された。worktree 環境でもスキル正本は実更新が必須
- 因果ループ分析により、初期化失敗→Graceful Degradation→再試行不可 の回復なしループが明らかになり、優先度を Medium→High に引き上げた

## 参照

- `apps/desktop/src/main/ipc/index.ts` L894-935（IIFE パターン）
- Phase 2 設計書 Task 1 案B の評価
