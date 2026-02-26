# Phase 12 実装ガイド

## Part 1: 概念説明（中学生レベル）

### skill:execute って何？

アプリの中には「スキル」と呼ばれる小さなお手伝いプログラムがたくさん入っています。
`skill:execute` は、ユーザーが「このスキルを動かして」とリクエストする**注文窓口**です。

### お店の注文に例えると

ファミレスを想像してください。

1. **お客さん（Renderer/画面）** が注文票に「ハンバーグ定食」と書いて渡す
2. **受付（Preload）** が注文票を厨房に渡す
3. **厨房（Main Process）** が「ハンバーグ定食」を「メニュー番号 No.12」に変換して調理開始
4. 料理ができたら結果をお客さんに返す

ここで重要なのは:

- お客さんは**メニューの名前**（ハンバーグ定食 = `skillName`）で注文する
- 厨房は内部的に**メニュー番号**（No.12 = `skillId`）で管理している
- 受付が「名前 → 番号」の変換を仲介する

### skillName と skillId の違い

| 概念      | 例え                                 | プログラム上                           |
| --------- | ------------------------------------ | -------------------------------------- |
| skillName | メニューの名前（「ハンバーグ定食」） | 人が読める名前（`"code-review"` など） |
| skillId   | メニュー番号（No.12）                | 内部管理用のID（`"abc123def"` など）   |

### バリデーション（入力チェック）の意味

注文を受け付ける前に、注文票がちゃんと書かれているか確認します。

1. **文字で書いてある？** → 数字や空欄だったら「書き直してください」（型チェック）
2. **何か書いてある？** → 白紙だったら「何を注文しますか？」（空文字チェック）
3. **スペースだけじゃない？** → 「　　」だけだったら「ちゃんと書いてください」（trim チェック）

この3段チェックで、変な注文が厨房に届かないようにしています。

### なぜこの修正が必要だったの？

以前は、注文票の書き方がお店の部署によってバラバラでした。
ある部署は「メニュー名で注文して」、別の部署は「メニュー番号で注文して」と言っていて混乱していました。
今回の修正で、**どちらの注文方法でも受け付けられる**ようにしつつ、内部的には番号で統一処理するようになりました。

---

## Part 2: 技術者向け実装詳細

### 型定義

#### 正式外部契約: SkillExecutionRequest（@repo/shared）

```typescript
// packages/shared/src/types/skill.ts L306-315
export interface SkillExecutionRequest {
  /** 使用するスキル名 */
  skillName: string;

  /** ユーザープロンプト */
  prompt: string;

  /** 作業ディレクトリ（省略時はデフォルト） */
  workingDirectory?: string;
}
```

#### 後方互換契約（インライン型）

```typescript
{ skillId: string; params?: Record<string, unknown> }
```

#### ハンドラ引数のユニオン型

```typescript
args: SkillExecutionRequest | { skillId: string; params?: Record<string, unknown> }
```

### 型ガード: isSkillNameRequest

```typescript
// apps/desktop/src/main/ipc/skillHandlers.ts L231-236
const isSkillNameRequest = (
  payload: SkillExecutionRequest | { skillId: string },
): payload is SkillExecutionRequest =>
  typeof payload === "object" && payload !== null && "skillName" in payload;
```

- `"skillName"` プロパティの存在で `SkillExecutionRequest` と判定
- `payload === null` ガードにより null安全

### 実装フロー

```
Renderer → Preload(safeInvoke) → Main Handler
                                    ├→ validateIpcSender(event, channel, opts)
                                    ├→ isSkillNameRequest(args) で分岐判定
                                    │
                                    ├─ [skillName パス]
                                    │   ├→ P42準拠3段バリデーション(skillName)
                                    │   ├→ scanAvailableSkills() でスキル一覧取得
                                    │   ├→ skills.find(item => item.name === args.skillName)
                                    │   ├→ 不存在: { success: false, error: "スキルが見つかりません" }
                                    │   └→ executeSkill(skill.id, { prompt: args.prompt })
                                    │
                                    └─ [skillId パス]
                                        ├→ P42準拠3段バリデーション(skillId)
                                        └→ executeSkill(args.skillId, args.params)
```

### 3段バリデーションパターン（P42準拠）

```typescript
// skillName パス（L240-248）
if (typeof args.skillName !== "string" || args.skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}

// skillId パス（L249-253）
if (typeof args?.skillId !== "string" || args.skillId.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillId must be a non-empty string",
  };
}
```

3段バリデーションの段階:

1. `typeof !== "string"`: 型チェック（数値、undefined、null を拒否）
2. 暗黙的 `=== ""` チェック: `.trim() === ""` が空文字列も検出
3. `.trim() === ""`: 空白のみ文字列（`"   "`）を拒否

### エッジケースと対処

| エッジケース                         | 対処                                                                   | コード位置 |
| ------------------------------------ | ---------------------------------------------------------------------- | ---------- |
| skillName が空文字/空白のみ/型不一致 | VALIDATION_ERROR を throw                                              | L240-248   |
| skillId が空文字/空白のみ/型不一致   | VALIDATION_ERROR を throw                                              | L249-253   |
| skillName に一致するスキルが不存在   | `{ success: false, error: "スキルが見つかりません" }`                  | L261-263   |
| skillService.executeSkill が例外送出 | `{ success: false, error: error.message }` でラップ                    | L276-281   |
| executeSkill のタイムアウト          | SkillExecutor 内部のタイムアウト機構で処理。ハンドラは例外として catch | L276-281   |
| validateIpcSender 検証失敗           | `toIPCValidationError(validation)` で例外送出                          | L228-229   |
| args が null/undefined               | isSkillNameRequest の `payload !== null` ガードで安全に処理            | L234       |

### テスト構成

| ファイル                           | テスト数 | 主な検証内容                                                       |
| ---------------------------------- | -------- | ------------------------------------------------------------------ |
| `skillHandlers.execute.test.ts`    | 23       | skillNameパス正常系/異常系、skillIdパス正常系/異常系、スキル不存在 |
| `skillHandlers.validation.test.ts` | 55       | 3段バリデーション全パターン、型不正入力、空白文字列                |
| `skillHandlers.delegate.test.ts`   | 12       | SkillService委譲確認、エラー伝播、レスポンス形式                   |
| **合計**                           | **90**   |                                                                    |

### カバレッジ目標

| 指標                   | 目標値   |
| ---------------------- | -------- |
| Line Coverage          | 90% 以上 |
| Branch Coverage        | 85% 以上 |
| High優先度ケース実行率 | 100%     |

### 関連する既知の落とし穴

| ID  | 内容                                     | 本実装での対策                                        |
| --- | ---------------------------------------- | ----------------------------------------------------- |
| P42 | .trim() バリデーション漏れ               | skillName/skillId の両パスで3段バリデーション実装済み |
| P44 | IPC契約不整合（Preload vs Main）         | ユニオン型 + 型ガードで両契約を安全に処理             |
| P45 | 引数命名ドリフト（skillId vs skillName） | 正式契約は skillName、後方互換は skillId と明確に分離 |

## 完了記録

- [x] Task 12-1 完了
- [x] Part 1: 日常例え（ファミレス注文）による概念説明
- [x] Part 1: skillName/skillId の違い、バリデーションの意味を説明
- [x] Part 2: 型定義（SkillExecutionRequest、ユニオン型、isSkillNameRequest）
- [x] Part 2: 実装フロー図、3段バリデーションパターン
- [x] Part 2: エッジケース7件（不明スキル名、サービス例外、タイムアウト含む）
- [x] Part 2: テスト構成と既知の落とし穴対応表
- [x] Phase 12 Task 1 実行率: 100%
