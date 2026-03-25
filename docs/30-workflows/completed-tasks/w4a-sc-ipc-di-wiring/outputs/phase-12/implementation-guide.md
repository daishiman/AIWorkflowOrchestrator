# UT-SC-05-IPC-DI-WIRING 実装ガイド

## Part 1: 中学生レベル概念説明

### DI（依存性注入）とは

レストランに例えると、シェフ（RuntimeSkillCreatorFacade）が料理を作るには、
食材（skillFileManager）、調理器具（llmAdapter）、レシピ本（resourceLoader）が必要です。

今まではシェフに「食材と名前」だけ渡して、調理器具もレシピ本も渡していなかったため、
シェフは「料理できません」と答えるしかありませんでした。

今回の修正は、シェフに全ての道具を渡すようにすることです。
特に `skillFileManager`（レシピファイルの読み書き担当）が最後の欠けたピースでした。

## Part 2: 開発者向け実装詳細

### 変更内容

**変更ファイル**: `apps/desktop/src/main/ipc/index.ts`（1ファイルのみ）

**変更箇所**: L910 - `RuntimeSkillCreatorFacade` コンストラクタに `skillFileManager` を1行追加

```typescript
const runtimeSkillCreatorService = skillExecutor
  ? new RuntimeSkillCreatorFacade({
      skillExecutor,
      authKeyService,
      skillFileWriter,
      resourceLoader,
      skillFileManager, // improve() / applyImprovement() で SKILL.md 読み書きに使用
    })
  : undefined;
```

### 依存注入の全体像

| 依存               | 注入方式                     | 用途                                              |
| ------------------ | ---------------------------- | ------------------------------------------------- |
| `skillExecutor`    | コンストラクタ DI            | execute() でスキル実行                            |
| `authKeyService`   | コンストラクタ DI            | 認証モード判定                                    |
| `skillFileWriter`  | コンストラクタ DI            | execute() でスキルファイル永続化                  |
| `resourceLoader`   | コンストラクタ DI            | plan()/improve() でエージェントプロンプト読み込み |
| `skillFileManager` | コンストラクタ DI (今回追加) | improve()/applyImprovement() で SKILL.md 読み書き |
| `llmAdapter`       | Setter Injection (P34)       | plan()/improve() で LLM API 呼び出し              |

### 設計判断の根拠

- **P34（遅延初期化 DI パターン）**: `llmAdapter` は非同期取得が必要なため、
  Setter Injection（fire-and-forget IIFE パターン）で注入。失敗時は `undefined` のまま
  Graceful Degradation が動作する
- **P65（dead-end namespace）**: 新しい IPC namespace を追加せず、
  既存の `skill-creator:*` を使用
- **`track()` 関数は同期コールバックのまま**: `() => void` 型を変更せず、
  非同期処理は IIFE パターンで内包

### テスト結果

- 全テスト: 7ファイル / 232件 ALL PASS
- カバレッジ: Line 91.54%, Branch 77.77%, Function 100%
- ESLint/TypeScript/Prettier: ALL PASS
