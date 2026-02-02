# Phase 1: ギャップ分析

## 分析日: 2026-02-02

## ギャップ一覧（部分カバー: 4件）

### SkillExecutor（3件）

| テストID | ギャップ種類     | 概要                                                                                                                                             | 対応関数/ファイル                                               | 優先度     |
| -------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | ---------- |
| SE-02    | アサーション不足 | 「スキル未発見エラー」の専用テストがない。現在はmax concurrent exceededのテストのみ。存在しないスキル名でexecuteした際の明示的なエラー検証が必要 | `SkillExecutor.execute()` / `SkillExecutor.ts`                  | P1（必須） |
| SE-07    | 未実装           | `createHooks`メソッドの直接テストがない。PreToolUse/PostToolUseフック関数の生成と戻り値構造の検証が必要                                          | `SkillExecutor.createHooks()` / `SkillExecutor.ts`              | P1（必須） |
| SE-08    | 未実装           | `handlePermissionResponse`メソッドの直接テストがない。PermissionResolverの`resolveRequest`呼び出しの検証が必要                                   | `SkillExecutor.handlePermissionResponse()` / `SkillExecutor.ts` | P1（必須） |

### PermissionResolver（1件）

| テストID | ギャップ種類     | 概要                                                                                                                                         | 対応関数/ファイル                                               | 優先度     |
| -------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------- |
| PR-03    | アサーション不足 | `rememberChoice: true`を含む応答の明示的検証がない。resolveRequestの呼び出しでrememberChoiceフラグが正しく伝播されることを検証する必要がある | `PermissionResolver.resolveRequest()` / `PermissionResolver.ts` | P2（重要） |

## ギャップ優先度サマリー

| 優先度                                | 件数 | 対象                |
| ------------------------------------- | ---- | ------------------- |
| P1（必須: 正常系基本動作）            | 3    | SE-02, SE-07, SE-08 |
| P2（重要: 異常系/エラーハンドリング） | 1    | PR-03               |
| P3（推奨: 境界値/エッジケース）       | 0    | -                   |

## 対応方針

### SE-02: execute - スキル未発見エラー

- **対応**: 存在しないスキル名で`execute`を呼び出し、適切なエラーメッセージでrejectされることを検証するテストを追加
- **モック**: 既存のSDKモック設定を利用

### SE-07: createHooks - Hooks作成

- **対応**: `createHooks(executionId)`を直接呼び出し、戻り値がPreToolUse/PostToolUseプロパティを持つオブジェクトであることを検証
- **モック**: PermissionResolver/PermissionStoreのモック

### SE-08: handlePermissionResponse - 権限応答

- **対応**: `handlePermissionResponse(requestId, approved, rememberChoice)`を呼び出し、PermissionResolverの`resolveRequest`が正しい引数で呼ばれることを検証
- **モック**: PermissionResolverインスタンスのスパイ

### PR-03: waitForResponse - 記憶選択

- **対応**: `resolveRequest`でrememberChoice=trueの応答を送り、waitForResponseの結果にrememberChoiceが含まれることを検証
- **モック**: 不要（純粋ロジック）

## 追加テスト工数見積

- 追加テストケース: 4件（部分カバーの補強）
- 新規テストコード行数見積: 約60〜80行
- 既存テストの破壊リスク: 低（既存describe/itブロックに追加のみ）
