# Implementation Guide: UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE

## メタ情報

| 項目         | 値                                                  |
| ------------ | --------------------------------------------------- |
| Task ID      | UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE         |
| 作成日       | 2026-04-19                                          |
| 対象ファイル | SkillCreatorService.ts, SkillCreatorService.test.ts |

---

## Part 1: 中学生レベルの概念説明

### なぜこの変更が必要だったか

スキルを作るプログラム（SkillCreatorService）には「モード」というものがあります。「新しいスキルを作る（create）」「既存スキルを更新する（update）」「プロンプトを改善する（improve-prompt）」などのモードです。

問題は、`update` と `improve-prompt` のモードが「空っぽ」のまま放置されていたことです。プログラムでは「空っぽの case」があると、次の case に流れてしまいます（fall-through と呼びます）。

**身近な例え**: 電車の乗り換え案内で「A駅→B駅」を選んだのに「A駅→C駅」の電車に乗せられてしまうようなものです。`update` モードを選んだのに「新規作成フロー」が動いてしまっていました。

### 何を修正したか

1. `update` モードが選ばれたら `runUpdateWorkflow()` を呼ぶように修正
2. `improve-prompt` モードが選ばれたら `runImprovePromptWorkflow()` を呼ぶように修正
3. 既存スキルが存在しない場合は適切なエラーを出すようにした（`ensureExistingSkillFiles`）

現時点では「スタブ実装」（処理はしないが、誤動作しないように仕切り壁を作った状態）です。本処理は後続タスクで実装します。

### 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要。代替証跡: テスト実行ログ参照。

---

## Part 2: 開発者向け技術的詳細

### 変更ファイル一覧

| ファイル                                                                     | 変更内容                                                                                     |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | `runUpdateWorkflow` / `runImprovePromptWorkflow` スタブ追加、`ensureExistingSkillFiles` 追加 |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | update/improve-prompt モードのディスパッチテスト追加                                         |

### Before / After

**Before（fall-through バグ）**:

```
case "update":   // コメントのみ → fall-through
case "improve-prompt":  // コメントのみ → fall-through
case "create":   // init_skill.js が誤動作
```

**After（修正後）**:

```
case "update":
  await runUpdateWorkflow() → return skillDir（早期 return）
case "improve-prompt":
  await runImprovePromptWorkflow() → return skillDir（早期 return）
```

### 新規メソッド仕様

#### `ensureExistingSkillFiles(options): Promise<void>`

skillDir 存在チェック + SKILL.md 存在チェック。update/improve-prompt 前処理として呼び出す。不在の場合は `Error` を throw。

#### `runUpdateWorkflow` / `runImprovePromptWorkflow`

スタブ実装。`throwIfAborted(signal)` + `ensureExistingSkillFiles(options)` + `logger.warn("not yet implemented")` のみ。本処理は後続タスクで実装予定。

### エラーハンドリング

| エラー                               | 発生条件                             |
| ------------------------------------ | ------------------------------------ |
| `Error("Skill directory not found")` | skillDir が存在しない                |
| `Error("SKILL.md not found")`        | SKILL.md が存在しない                |
| AbortError                           | 必ず再 throw（AbortSignal 連鎖維持） |

### 今後の拡張時の注意点

- switch 文に新モードを追加する際は必ずスタブ or `throw new Error("not implemented")` を入れること
- コメントのみの状態（fall-through 可能な状態）でマージしない
- `runUpdateWorkflow` 本処理は `UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE`、`runImprovePromptWorkflow` 本処理は `TASK-SC-IMPROVE-PROMPT-IMPL-001` で対応予定

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
