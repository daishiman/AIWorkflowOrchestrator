# AIアシスタント画面リデザイン 実装ガイド

## Part 1: 中学生でもわかる説明

まず、なぜ必要かを先に説明します。前の AgentView は、最初に見える情報が多くて「どこから触ればいいか」が少しわかりにくい状態でした。最初の一歩で迷う画面は、機能があっても使われにくくなります。だからこの画面は、最初にやることを絞って、必要なときだけ詳しい設定を見せる形に変えました。

次に何をするかというと、AI にやってほしいことを選んで、実行して、最近の履歴を見るための画面にすることです。たとえばお店のショーケースを想像するとわかりやすいです。ショーケースには人気の商品だけが見やすく並び、詳しい相談は店員さんに聞きにいきます。この画面でも、最初の見た目は「できること」と「実行する」を中心にして、細かい設定は歯車ボタンの中にしまっています。

### Tap & Discover とは何か

Tap & Discover は、「まず軽く触って、必要になったら次の深さへ進む」考え方です。教室のロッカーでたとえると、表にはよく使う道具だけを置いて、細かいものは引き出しの中に入れておく感じです。毎回全部広げないので、使う人が迷いにくくなります。

### 画面の3つの主役

1つ目は「できること」の丸いチップです。これはショーケースの商品札のようなもので、AI が何をできるかを大きく見せます。  
2つ目は実行ボタンです。これはレジのような役割で、選んだものを本当に動かします。何も選んでいないときは押せません。  
3つ目は最近の実行です。これはレシートのようなもので、何をいつやって、成功したか失敗したかがひと目でわかります。

### 詳細設定パネル

右上の歯車ボタンを押すと、横から設定パネルが出ます。これは本棚の表紙の裏ポケットのようなものです。普段は見えませんが、AI の種類や許可の設定を変えたいときだけ開きます。だから、ふだんの画面はすっきり保てます。

### まとめ

| 要素                  | たとえ             | 役割                    |
| --------------------- | ------------------ | ----------------------- |
| SkillChip             | ショーケースの商品 | できることを選ぶ        |
| ExecuteButton         | レジ               | 選んだものを動かす      |
| RecentExecutionList   | レシート           | 最近やったことを見返す  |
| AdvancedSettingsPanel | 裏ポケット         | AI の種類や許可を変える |

## Part 2: 技術的な実装詳細

### TypeScript 型定義

```ts
export type AgentFloatingStatus = "executing" | "completed" | "failed" | "idle";

export type AgentPermissionMode =
  | "default"
  | "acceptEdits"
  | "bypassPermissions"
  | "plan";

export interface ModelCardItem {
  providerId: string;
  modelId: string;
  displayName: string;
  description?: string;
  healthStatus: "healthy" | "degraded" | "unavailable" | "unknown";
  isSelected: boolean;
}
```

```ts
export interface FloatingExecutionBarProps {
  skillName: string;
  status: AgentFloatingStatus;
  startedAt: Date | null;
  progress?: number;
  onStop: () => void;
}
```

### APIシグネチャ

`AgentView` は Renderer から直接 IPC を叩かず、store selector と `window.electronAPI.permissions` を経由する。

```ts
type PermissionApi = {
  getMode?: () => Promise<string>;
  getRemembered?: () => Promise<unknown[]>;
  setMode?: (mode: AgentPermissionMode) => Promise<unknown>;
  clearRemembered?: () => Promise<unknown>;
};
```

主な store シグネチャ:

```ts
const fetchSkills = useFetchSkills();
const executeSkill = useExecuteSkill();
const abortExecution = useAbortSkillExecution();
const setAdvancedSettingsOpen = useSetAdvancedSettingsOpen();
const addExecutionToHistory = useAddExecutionToHistory();
```

### 使用例

使用例として、AgentView 内では以下のように部品を構成する。

```tsx
<div role="radiogroup" aria-label="ツール選択">
  {filteredSkills.map((skill) => (
    <SkillChip
      key={skill.name}
      skillName={skill.name}
      displayName={skill.displayName ?? skill.name}
      isSelected={selectedSkill?.name === skill.name}
      onSelect={() => handleSkillSelect(skill)}
    />
  ))}
</div>

<ExecuteButton
  selectedSkillName={selectedSkillName}
  onExecute={handleExecute}
  isExecuting={isExecuting}
/>
```

```bash
cd apps/desktop && pnpm vitest run src/renderer/views/AgentView/__tests__/AgentView.test.tsx
```

### 状態管理パターン

- `recentExecutions`: 実行履歴を最大10件保持
- `isAdvancedSettingsOpen`: 詳細設定パネルの開閉状態
- P31 対策として、AgentView 配下では一括 store 取得を避け、個別 selector を使う

### マイクロインタラクション

`animations.ts` と `styles.ts` に共通定数を置いている。

| 項目           | 値        |
| -------------- | --------- |
| ホバー         | 200ms     |
| タップ         | 100-150ms |
| スライドイン   | 300ms     |
| スライドアウト | 200ms     |

### 設定項目と定数一覧

| 項目                         | 内容                                                     |
| ---------------------------- | -------------------------------------------------------- |
| `MAX_EXECUTION_HISTORY`      | recent history の上限                                    |
| `permissionMode`             | `default` / `acceptEdits` / `bypassPermissions` / `plan` |
| `rememberedCount === 0`      | reset button を disabled にする条件                      |
| `importedSkills.length > 10` | 検索バー表示条件                                         |

### エラーハンドリング

エラーハンドリングは 2 層で行う。

1. 権限 API が使えない環境では `try/catch` で握り、既定値のまま UI を表示する。
2. 実行失敗時は `FloatingExecutionBar` を `failed` state で表示し、ユーザーに失敗を見せる。

### エッジケース

- エッジケース: `rememberedCount=0` のとき reset を押せない
- エッジケース: `startedAt=null` のとき経過時間は `"00:00"` を表示する
- エッジケース: スキルが 0 件のときは EmptyState を出す
- エッジケース: スキルが 11 件以上のときだけ検索バーを出す

### 補足

- 型アサーション課題 `UT-UI-03-TYPE-ASSERTION-001` は再監査時点で解消済み。残課題は global token 改善 `UT-UI-03-LIGHT-SECONDARY-TEXT-CONTRAST-001` のみ
- Phase 11 の dedicated harness により、main shell 依存を持たず安定してスクリーンショットを撮影できる
