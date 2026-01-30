# 実装ガイド - PermissionDialog コンポーネント

## Part 1: 初学者・中学生レベルの概念説明

### PermissionDialogとは何か？

スマートフォンのアプリを初めて使うとき、「カメラを使っていいですか？」「位置情報を使っていいですか？」という確認画面が出てきますよね。あれは、アプリが勝手にカメラや位置情報を使わないように、あなたの「許可」をもらうための仕組みです。

PermissionDialogは、これとまったく同じ役割を持つ画面です。AIがコンピュータ上で何かの操作をしようとするとき、たとえば「ファイルを読む」「コマンドを実行する」といった操作の前に、ユーザーに「この操作をしていいですか？」と聞く画面を表示します。

### なぜ必要か？

AIは便利ですが、間違った操作をしてしまう可能性もあります。たとえば、大事なファイルを消してしまったり、知らないコマンドを実行してしまったりするかもしれません。

これは、家の鍵に似ています。家族や友人でも、勝手に部屋に入られたら困りますよね。だから「入っていい？」と聞いてもらう。PermissionDialogは、AIにとっての「入っていい？」を聞く仕組みです。

### 3つのボタンの意味

PermissionDialogには3つの選択肢があります。

- **「拒否」** = 「ダメ」。この操作をさせません。
- **「1回許可」** = 「今回だけいいよ」。この1回だけ許可しますが、次に同じ操作をするときはまた聞いてね、という意味です。
- **「許可」** = 「いいよ」。この操作を許可します。

### チェックボックスの意味（「記憶」機能）

ダイアログの中に「このセッション中は同様の操作を自動許可する」というチェック欄があります。

これは、毎回「いいよ」と答えるのが面倒なときに使います。チェックを入れて「許可」を押すと、同じような操作については、次からは聞かれなくなります。ただし、アプリを終了して再度開いたら、またリセットされます。

---

## Part 2: 技術者・開発者レベルの詳細

### 技術仕様

#### コンポーネントAPI

**配置場所**: `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`

**エクスポート**: `apps/desktop/src/renderer/components/skill/index.ts` から名前付きエクスポート

```typescript
// インポート方法
import { PermissionDialog } from "../components/skill";
```

**Props**: なし（Store直結パターン）

このコンポーネントはPropsを受け取らず、Zustand Storeから直接状態を取得します。

```typescript
export const PermissionDialog: React.FC = () => {
  const { pendingPermission, respondToSkillPermission } = useAppStore();
  // ...
};
```

#### Store連携

| Store項目                  | 型                                               | 説明                   |
| -------------------------- | ------------------------------------------------ | ---------------------- |
| `pendingPermission`        | `SkillPermissionRequest \| null`                 | 権限確認待ちリクエスト |
| `respondToSkillPermission` | `(approved: boolean, remember: boolean) => void` | 応答送信関数           |

**内部状態**:

| 状態             | 型        | 初期値  | 説明                 |
| ---------------- | --------- | ------- | -------------------- |
| `rememberChoice` | `boolean` | `false` | 自動許可チェック状態 |

### 型定義

#### SkillPermissionRequest

```typescript
// packages/shared/src/types/skill.ts
interface SkillPermissionRequest {
  executionId: string; // スキル実行ID
  requestId: string; // リクエストID
  toolName: string; // ツール名（例: "Bash", "Read"）
  args: Record<string, unknown>; // ツール引数
  reason?: string; // 操作理由（任意）
}
```

#### SkillPermissionResponse

```typescript
interface SkillPermissionResponse {
  requestId: string;
  approved: boolean;
  remember: boolean;
}
```

### ヘルパー関数

#### formatArgs

```typescript
function formatArgs(args: Record<string, unknown>): string;
```

ツール引数を表示用にフォーマットする内部関数。

**入出力パターン**:

| 条件                      | 入力例                            | 出力                          |
| ------------------------- | --------------------------------- | ----------------------------- |
| `args.command` が文字列   | `{ command: "ls -la" }`           | `"ls -la"`                    |
| `args.path` が文字列      | `{ path: "/tmp/file.txt" }`       | `"/tmp/file.txt"`             |
| command と path 両方存在  | `{ command: "ls", path: "/tmp" }` | `"ls"`（command優先）         |
| command が空文字（falsy） | `{ command: "" }`                 | `'{"command": ""}'`（JSON）   |
| command が文字列以外      | `{ command: 123 }`                | JSON表示にフォールバック      |
| その他                    | `{ query: "test" }`               | `'{"query": "test"}'`（JSON） |

**優先順位**: `command`（文字列） > `path`（文字列） > JSON.stringify

### アクセシビリティ

#### ARIA属性一覧

| 属性               | 値                       | 対象要素       |
| ------------------ | ------------------------ | -------------- |
| `role`             | `"dialog"`               | ダイアログ本体 |
| `aria-modal`       | `"true"`                 | ダイアログ本体 |
| `aria-labelledby`  | `{uniqueId}-title`       | ダイアログ本体 |
| `aria-describedby` | `{uniqueId}-description` | ダイアログ本体 |
| `aria-label`       | `"閉じる"`               | 閉じるボタン   |

`uniqueId` は React の `useId()` で生成される一意のID。

#### フォーカストラップの実装方式

```
useEffect によるキーボードイベントリスナ:
1. Tab キー → ダイアログ内のフォーカス可能要素を循環
2. Shift+Tab → 逆方向に循環
3. 最後の要素 → Tab → 最初の要素に戻る
4. 最初の要素 → Shift+Tab → 最後の要素に移動
```

対象セレクタ: `'button, input[type="checkbox"], [tabindex]:not([tabindex="-1"])'`

#### キーボードショートカット

| キー      | 動作                         |
| --------- | ---------------------------- |
| Escape    | 拒否（handleDeny呼出）       |
| Tab       | 次のフォーカス可能要素へ移動 |
| Shift+Tab | 前のフォーカス可能要素へ移動 |
| Enter     | フォーカス中のボタンを実行   |
| Space     | チェックボックスをトグル     |

#### 初期フォーカス

ダイアログ表示時、「許可」ボタン（`approveButtonRef`）に自動フォーカスされる。

### 使用例

#### 基本的なコンポーネントの配置方法

```tsx
// レイアウトコンポーネント内での配置例
import { PermissionDialog } from "../components/skill";

export const SkillExecutionLayout: React.FC = ({ children }) => {
  return (
    <div>
      {children}
      <PermissionDialog />
    </div>
  );
};
```

#### Storeとの接続パターン

コンポーネント内部で `useAppStore()` を呼び出してStoreに接続するため、配置するだけで動作します。Store側で `pendingPermission` に値をセットすると自動的にダイアログが表示されます。

```typescript
// Store側でのトリガー例（skillSlice内）
setSkillPermissionRequest: (request: SkillPermissionRequest) => {
  set({ pendingPermission: request });
},
```

#### 応答フロー

1. Store に `pendingPermission` がセットされる
2. PermissionDialog が自動表示される
3. ユーザーが3つのボタンのいずれかをクリック
4. `respondToSkillPermission(approved, remember)` が呼ばれる
5. Store が `pendingPermission` を `null` にリセット
6. ダイアログが非表示になる

### エッジケース

| ケース                   | 挙動                                             |
| ------------------------ | ------------------------------------------------ |
| `args` が空オブジェクト  | `{}` とJSON表示される                            |
| `command` が空文字       | falsy判定でJSONフォールバック                    |
| `command` が非文字列型   | typeof チェックでJSONフォールバック              |
| `reason` が空文字        | falsy判定で理由セクション非表示                  |
| XSS攻撃文字列を含むargs  | ReactのJSX自動エスケープにより安全に表示         |
| 長いコマンド文字列       | `overflow-x-auto` による横スクロールで対応       |
| ネストされたオブジェクト | `JSON.stringify(args, null, 2)` でインデント表示 |
