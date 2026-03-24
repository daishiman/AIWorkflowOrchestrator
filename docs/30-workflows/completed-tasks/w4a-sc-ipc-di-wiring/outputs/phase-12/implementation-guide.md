# 実装ガイド: RuntimeSkillCreatorFacade DI 配線完了

## Part 1: 中学生レベル概念説明

### DI（依存性注入）とは？

レストランに例えると、シェフ（`RuntimeSkillCreatorFacade`）が料理を作るには3つの道具が必要です:

1. **食材置き場**（`skillFileManager`）: レシピファイル（SKILL.md）を取りに行く倉庫
2. **AI 調理アシスタント**（`llmAdapter`）: 「この料理をもっと美味しくするには？」と聞ける AI
3. **レシピ本棚**（`resourceLoader`）: プロンプトテンプレートが入っている本棚

今まではシェフに「名前」と「作業台」だけ渡して、AI アシスタントもレシピ本棚も食材置き場も渡していませんでした。そのためシェフは「道具がないので料理できません（スタブ応答）」と答えるしかなかった。

今回の修正は、シェフに全ての道具を渡すようにすること。ただし、AI アシスタント（`llmAdapter`）は「API キー」という入館証がないと来てくれないので、入館証がない場合は「AI アシスタントなし」で今まで通りの対応になります。

### IIFE パターンとは？

道具を渡す場面で、AI アシスタントの手配には少し時間がかかります（非同期処理）。でも「道具を渡す手続き」自体は「すぐ終わる」というルールがあります（`track()` の `() => void` 型制約）。

そこで「手続きの中で、裏で AI アシスタントを呼んでから道具を渡す」という IIFE パターン（即時実行関数式）を使います。手続き自体はすぐ「開始しました」と報告し、裏で非同期に完了します。

## Part 2: 開発者向け実装詳細

### 変更ファイル

`apps/desktop/src/main/ipc/index.ts`（1ファイルのみ）

### 追加 import

```typescript
import { LLMAdapterFactory } from "../adapters/llm/LLMAdapterFactory";
import type { ILLMAdapter } from "../adapters/llm/types";
import { ResourceLoader } from "../services/skill/ResourceLoader";
import { DEFAULT_SKILL_CREATOR_PATH } from "../services/skill/constants";
```

### DI 配線の変更内容

`track("registerSkillCreatorHandlers", ...)` ブロック内で:

1. **IIFE パターン導入**: `void (async () => { ... })()` で非同期処理を内包
2. **`llmAdapter` 取得**: `LLMAdapterFactory.getAdapter("anthropic")` を try-catch で安全に取得。失敗時は `undefined`
3. **`resourceLoader` 生成**: `new ResourceLoader(DEFAULT_SKILL_CREATOR_PATH)`
4. **`skillFileManager` 参照**: L702 で既に生成済みのインスタンスを親スコープから参照
5. **3依存を `RuntimeSkillCreatorFacade` コンストラクタに注入**

### 設計判断

| 判断                                 | 理由                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------- |
| IIFE パターン採用（案C）             | `track()` は `fn: () => void` 型のみ対応。`safeRegister()` は Promise を await しない |
| anthropic プロバイダー固定           | 初期実装として最も利用頻度の高いプロバイダーを固定。動的切替は UT-1 で対応予定        |
| try-catch + undefined フォールバック | P34 準拠。API キー未設定環境では Graceful Degradation が正しい動作                    |

### API キー動的変更の制約

`llmAdapter` はアプリ起動時の API キーで初期化される。アプリ実行中に設定画面で API キーを変更しても反映されない。**API キー設定後にはアプリの再起動が必要**。

### テスト結果

| テストスイート                            | テスト数 | 結果     |
| ----------------------------------------- | -------- | -------- |
| RuntimeSkillCreatorFacade.test.ts         | 15       | PASS     |
| RuntimeSkillCreatorFacade.plan.test.ts    | 20       | PASS     |
| RuntimeSkillCreatorFacade.improve.test.ts | 21       | PASS     |
| skillCreatorHandlers.runtime.test.ts      | 5        | PASS     |
| skillCreatorHandlers.validation.test.ts   | 46       | PASS     |
| skillCreatorHandlers.security.test.ts     | 45       | PASS     |
| skillCreatorIpc.integration.test.ts       | 71       | PASS     |
| **合計**                                  | **223**  | **PASS** |

### カバレッジ（RuntimeSkillCreatorFacade.ts）

| 指標              | 結果   | 基準 |
| ----------------- | ------ | ---- |
| Line Coverage     | 91.48% | 80%+ |
| Branch Coverage   | 77.39% | 60%+ |
| Function Coverage | 100%   | 80%+ |
