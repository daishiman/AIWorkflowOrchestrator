# Phase 12: 実装ガイド — TASK-FIX-IPC-SKILL-NAME-001

## Part 1: 中学生向け説明

### 1.1 同じ受付番号を二回出してしまった話

たとえば、受付で整理券を配るときに、同じ番号を二回出してしまったらどうなるでしょう。二回目で止まると、後ろに並んでいる人が進めません。

なぜ必要かというと、1つでも重複すると後ろの処理が止まってしまうからです。

#### 何をするか

今回の修正は、同じ番号を二回出さないようにして、前から順番に全部進めるようにしたことです。

### 1.2 名前の札を機械向けにそろえる話

たとえば、おもちゃ箱に貼る名前札に、ひらがなや大文字や記号が混ざっていると、箱に貼る機械が読みにくくなります。

なぜ必要かというと、読めない札があるとスキル作成が途中で止まるからです。

#### 何をするか

そこで、まず小文字にそろえ、使えない記号は線に変え、線が続きすぎたら 1 本にまとめ、端だけ残った線は外します。そうすると、機械が読める形になります。

### 1.3 この修正でよくなったこと

| 変わったこと                             | うれしい点             |
| ---------------------------------------- | ---------------------- |
| 同じ受付番号が二重登録されない           | 後ろの処理が止まらない |
| 日本語や大文字を含む入力でも名前が整う   | 失敗しにくくなる       |
| すでにある名前とぶつかったら連番で避ける | 既存の箱を壊さない     |

## Part 2: 開発者向け

### 2.1 変更対象

| ファイル                                                                      | 変更内容                                            |
| ----------------------------------------------------------------------------- | --------------------------------------------------- |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                                | `skill-creator:get-adapter-status` の重複登録を削除 |
| `apps/desktop/src/main/services/skill/SkillService.ts`                        | `toWizardSkillName()` を kebab-case 正規化に更新    |
| `apps/desktop/src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts`   | 回帰テスト追加                                      |
| `apps/desktop/src/main/services/skill/__tests__/SkillService.test.ts`         | 境界値テスト・衝突回避テスト追加                    |
| `apps/desktop/src/main/ipc/__tests__/creatorHandlers.governanceState.test.ts` | カバレッジ補完テスト追加                            |
| `docs/00-requirements/08-api-design.md`                                       | IPC ハンドラ一意性を追記                            |
| `docs/00-requirements/18-skills.md`                                           | 自動生成時の正規化規則を追記                        |

### 2.2 TypeScript 型定義とシグネチャ

```ts
interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface SkillCreatorImproveSuggestion {
  section: string;
  before: string;
  after: string;
  reason: string;
}

function registerRuntimeSkillCreatorHandlers(
  mainWindow: BrowserWindow,
  runtimeSkillCreatorService?: RuntimeSkillCreatorFacade,
): void;

function toWizardSkillName(description: string): string;

async function createSkillFromWizard(
  description: string,
  options: {
    generateTasks: boolean;
    addAgents: boolean;
    addReferences: boolean;
  },
): Promise<{ path: string }>;
```

### 2.3 API/CLI シグネチャ

| API                                   | シグネチャ                                            | 役割                                     |
| ------------------------------------- | ----------------------------------------------------- | ---------------------------------------- |
| `registerRuntimeSkillCreatorHandlers` | `(mainWindow, runtimeSkillCreatorService?) => void`   | `skill-creator:*` の Main 側ハンドラ登録 |
| `toWizardSkillName`                   | `(description: string) => string`                     | 自然文からスキル名を正規化               |
| `createSkillFromWizard`               | `(description, options) => Promise<{ path: string }>` | ウィザード経由のスキル作成               |
| `ipcMain.handle`                      | `channel, handler`                                    | 同一チャネルの重複登録を避ける必要がある |

### 2.4 使用例

```ts
const normalizedName = service["toWizardSkillName"]("My Skill");
// normalizedName === "my-skill"

const result = await service.createSkillFromWizard("マイスキル", {
  generateTasks: false,
  addAgents: false,
  addReferences: false,
});

console.log(result.path);
// /test/skills/new-skill もしくは衝突時は /test/skills/new-skill-2
```

### 2.5 エラーハンドリング

- `runtimeSkillCreatorService` がない場合は `RUNTIME_SKILL_CREATOR_UNAVAILABLE` を返す
- `prompt` / `planId` / `skillName` などの必須入力が空なら `validationError` を返す
- `registerRuntimeSkillCreatorHandlers()` は `ipcMain.handle()` を一度だけ登録する
- `createSkillFromWizard()` は `fs.access()` で既存ディレクトリを確認し、衝突時は `-2` 以降の連番を採る

### 2.6 エッジケース

- 日本語だけの入力は `new-skill`
- 特殊文字だけの入力は `new-skill`
- 大文字混在は小文字化される
- アンダースコアはハイフンに変わる
- 先頭・末尾のハイフンは除去される
- 50 文字を超える説明は先頭 50 文字に切り詰める
- `test-skill` のような既存の英小文字・ハイフン入力はそのまま維持される

### 2.7 設定項目と定数

| 項目                                | 値                                           | 意味                                    |
| ----------------------------------- | -------------------------------------------- | --------------------------------------- |
| `RUNTIME_SKILL_CREATOR_UNAVAILABLE` | `Runtime Skill Creator は現在利用できません` | Main 側サービス未注入時の共通メッセージ |
| `SKILL_NAME_PATTERN` 相当           | `/^[a-z0-9]+(-[a-z0-9]+)*$/`                 | `init_skill.js` と同じ受け入れ規則      |
| フォールバック名                    | `new-skill`                                  | 正規化後に空文字になるときの既定値      |
| 連番サフィックス                    | `-2` 以降                                    | 既存ディレクトリとの衝突回避            |
| 切り詰め長                          | `50` 文字                                    | ウィザード入力の上限                    |

### 2.8 変更の意図

- Bug 1 は「同じ受付番号を二回出していた」状態をなくす修正
- Bug 2 は「名前札を機械が読める形にそろえる」修正
- 公開 IPC の形は変えず、Main process の内部だけを整えた

### 2.9 非 UI タスクの扱い

このタスクは `NON_VISUAL` であり、画面レイアウト変更はない。
そのため Phase 11 はスクリーンショットではなく、`outputs/phase-11/manual-test-result.md` の自動テスト証跡で確認する。
