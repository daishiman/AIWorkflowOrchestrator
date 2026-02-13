# 実装ガイド: AgentView無限ループ修正 (UT-FIX-AGENTVIEW-INFINITE-LOOP-001)

## メタ情報

| 項目         | 値                                                    |
| ------------ | ----------------------------------------------------- |
| タスクID     | UT-FIX-AGENTVIEW-INFINITE-LOOP-001                    |
| Phase        | 12 - ドキュメント                                     |
| 作成日       | 2026-02-12                                            |
| 関連Pitfall  | P31（Zustand Store Hooks無限ループ）                  |
| 対象ファイル | `apps/desktop/src/renderer/views/AgentView/index.tsx` |

---

## Part 1: 概念説明（中学生向け）

### 何が起きていたのか？ -- 「伝言ゲームのたらい回し」のたとえ

学校の連絡網を想像してください。

**壊れた連絡網（修正前のAgentView）:**

1. Aさん（AgentView）が「スキル一覧を取ってきて」と連絡網で伝える
2. 連絡網の係（Zustandストア）が「はい、これがスキル一覧です」と**毎回新しい紙に書き直して**返す
3. Aさんは新しい紙をもらうたびに「あれ、紙が変わった。もう一回確認しなきゃ」と思って、再度連絡網を回す
4. また新しい紙が返ってくる → また連絡網を回す → ...
5. これが無限に繰り返される = **無限ループ**

**正常な連絡網（修正後のAgentView）:**

1. Aさんが「スキル一覧を取ってきて」と**専用の直通電話**で伝える
2. 係が「はい、これが取得する方法です」と**いつも同じメモ帳のページ**を指し示す
3. Aさんはメモ帳のページが変わっていないので、「もう知ってる、大丈夫」と判断して連絡を繰り返さない
4. 無限ループが起きない

### 「同じもの」と「毎回新しいもの」の違い

プログラミングでは「見た目が同じ」と「本当に同じもの」は違います。

```
// 毎回新しい箱を作る（見た目は同じだが、箱自体は別物）
const 箱A = { 中身: "りんご" }
const 箱B = { 中身: "りんご" }
// 箱A === 箱B → false（別の箱だから）

// いつも同じ箱を指す（本当に同じもの）
const 箱 = { 中身: "りんご" }
const 指さしA = 箱
const 指さしB = 箱
// 指さしA === 指さしB → true（同じ箱を指しているから）
```

修正前のAgentViewは、「毎回新しい箱」方式で関数を受け取っていました。Reactは箱が変わったと判断して、処理をやり直してしまいます。

修正後は、「いつも同じ箱を指す」方式（個別セレクタHook）に変えました。Reactは箱が変わっていないと正しく判断できるようになり、無限ループが止まりました。

### 修正のまとめ（3行で説明）

1. **問題**: ストアから関数を「まとめ取り」すると、毎回新しい包みで届くので、Reactが「変わった」と誤解する
2. **解決策**: 関数を「個別に直接取り」すると、いつも同じものが届くので、Reactが「変わっていない」と正しく判断する
3. **効果**: AgentView画面がぐるぐる回り続ける問題が解消された

---

## Part 2: 技術者向け実装詳細

### 1. 根本原因の分析

#### Zustandの合成Hook問題（P31）

Zustandの `useAppStore` で複数の状態やアクションをオブジェクトとしてまとめて返す「合成Hook」パターンは、毎回新しいオブジェクト参照を生成します。

```typescript
// 合成Hookの内部動作（毎回新しいオブジェクトを生成）
const useSkillStore = () =>
  useAppStore((state) => ({
    fetchSkills: state.fetchSkills, // 関数参照は安定
    importedSkills: state.importedSkills, // 配列参照は変動
    // ... 他のフィールド
  }));
// ↑ セレクタが返すオブジェクト自体が毎回新しい === 参照不安定
```

AgentViewの修正前コードでは、インラインセレクタで取得したアクション関数をローカルの `useCallback` でラップし、さらに `useEffect` の依存配列に含めていました。

```typescript
// 修正前（無限ループの原因）
const fetchSkillsAction = useAppStore((state) => state.fetchSkills);
const fetchSkills = useCallback(() => {
  fetchSkillsAction();
}, [fetchSkillsAction]); // fetchSkillsAction自体は安定だが、
// 他のインライン取得値との組み合わせで問題が発生

useEffect(() => {
  fetchSkills();
}, [fetchSkills]); // useCallbackの依存配列経由で不安定化
```

### 2. 修正パターン: 個別セレクタHook

#### 設計原則

Zustandのストアから `useAppStore((state) => state.someAction)` で単一のアクション関数を取得すると、Zustandはその関数参照が変わっていないことを検知し、不要な再レンダリングを防止します（shallow comparison）。

```typescript
// store/index.ts に定義された個別セレクタHook
export const useFetchSkills = () => useAppStore((state) => state.fetchSkills);
export const useImportedSkills = () =>
  useAppStore((state) => state.importedSkills);
export const useIsLoadingSkills = () =>
  useAppStore((state) => state.isLoadingSkills);
// ... 22個の個別セレクタ
```

#### AgentView修正後のコード構造

```typescript
// 修正後（個別セレクタHookで安定参照を取得）
import {
  useFetchSkills,
  useImportedSkills,
  useIsLoadingSkills,
  useSkillError,
  // ... 他の個別セレクタ
} from "../../store";

export const AgentView: React.FC<AgentViewProps> = ({ className }) => {
  // 状態 - 個別セレクタ（P31対策）
  const isLoading = useIsLoadingSkills();
  const error = useSkillError();
  const importedSkills = useImportedSkills();
  // ...

  // アクション - 個別セレクタ（P31対策）
  const fetchSkills = useFetchSkills(); // 安定参照
  const selectSkill = useSelectSkill(); // 安定参照
  // ...

  // fetchSkillsは安定参照なので、依存配列に安全に含められる
  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]); // 無限ループしない
};
```

### 3. Before/After比較

| 項目                | 修正前                                                                      | 修正後                                                             |
| ------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| セレクタ方式        | インラインセレクタ `useAppStore((s) => s.xxx)` を直接コンポーネント内に記述 | `store/index.ts` の個別セレクタHook（`useFetchSkills()` 等）を使用 |
| ローカルfetchSkills | `useCallback` でラップ                                                      | 不要（個別セレクタから直接取得）                                   |
| debug console.log   | 複数箇所に存在                                                              | 全て削除                                                           |
| 依存配列の安定性    | 不安定（合成オブジェクト経由）                                              | 安定（Zustandアクション参照は不変）                                |
| 型アサーション      | なし（未移行）                                                              | `as unknown as Skill[]`（P24既知問題、別タスクで対応）             |

### 4. 追加された個別セレクタ一覧

`store/index.ts` に15個の個別セレクタHookを追加:

**状態セレクタ（8個）:**

| Hook名                    | 取得する状態               |
| ------------------------- | -------------------------- |
| `useSkills()`             | `state.skills`             |
| `useAvailableSkills()`    | `state.availableSkills`    |
| `useImportedSkillIds()`   | `state.importedSkillIds`   |
| `useSelectedSkill()`      | `state.selectedSkill`      |
| `useSkillFilter()`        | `state.skillFilter`        |
| `useSkillCategory()`      | `state.skillCategory`      |
| `useIsImportDialogOpen()` | `state.isImportDialogOpen` |
| `useToastMessage()`       | `state.toastMessage`       |

**アクションセレクタ（7個）:**

| Hook名                   | 取得するアクション        |
| ------------------------ | ------------------------- |
| `useSelectSkill()`       | `state.selectSkill`       |
| `useSetSkillFilter()`    | `state.setSkillFilter`    |
| `useSetSkillCategory()`  | `state.setSkillCategory`  |
| `useOpenImportDialog()`  | `state.openImportDialog`  |
| `useCloseImportDialog()` | `state.closeImportDialog` |
| `useShowToast()`         | `state.showToast`         |
| `useClearToast()`        | `state.clearToast`        |

### 5. テストパターン: 個別Hookモック

修正前のテストはストア全体をモックしていましたが、修正後は個別セレクタHookをモックします。

```typescript
// テストでの個別セレクタHookモック
const mockFetchSkills = vi.fn();
const mockSelectSkill = vi.fn();

vi.mock("../../../store", () => ({
  useAppStore: vi.fn(),
  // 状態セレクタ
  useFetchSkills: vi.fn(() => mockFetchSkills),
  useImportedSkills: vi.fn(() => []),
  useIsLoadingSkills: vi.fn(() => false),
  useSkillError: vi.fn(() => null),
  // ... 他のセレクタ
  // アクションセレクタ
  useSelectSkill: vi.fn(() => mockSelectSkill),
  // ...
}));

// 特定テストでのオーバーライド
it("should display loading state", async () => {
  const { useIsLoadingSkills } = await import("../../../store");
  vi.mocked(useIsLoadingSkills).mockReturnValue(true);
  render(<AgentView />);
  expect(screen.getByText("スキルを読み込み中...")).toBeInTheDocument();
});
```

**テストカバレッジ結果:**

| 指標       | 値     |
| ---------- | ------ |
| Statements | 100%   |
| Branches   | 95.65% |
| Functions  | 100%   |
| Lines      | 100%   |
| テスト数   | 53     |

### 6. 依存配列安定性の分析

| 依存配列の変数      | 参照安定性 | 理由                                                    |
| ------------------- | ---------- | ------------------------------------------------------- |
| `fetchSkills`       | 安定       | Zustandアクション関数はストア作成時に一度だけ生成される |
| `openImportDialog`  | 安定       | 同上                                                    |
| `selectSkill`       | 安定       | 同上                                                    |
| `showToast`         | 安定       | 同上                                                    |
| `closeImportDialog` | 安定       | 同上                                                    |
| `importSkillAction` | 安定       | 同上                                                    |
| `removeSkillAction` | 安定       | 同上                                                    |
| `clearToast`        | 安定       | 同上                                                    |
| `setSkillFilter`    | 安定       | 同上                                                    |
| `setSkillCategory`  | 安定       | 同上                                                    |

全てのアクション関数参照が安定しているため、`useEffect` / `useCallback` の依存配列に安全に含めることができます。

---

## 参照資料

- `.claude/rules/06-known-pitfalls.md#P31`: Zustand Store Hooks無限ループ
- `.claude/rules/03-state-management.md`: 状態管理ルール
- `docs/30-workflows/UT-STORE-HOOKS-REFACTOR-001/`: 個別セレクタHookリファクタリング
- `docs/30-workflows/UT-STORE-HOOKS-COMPONENT-MIGRATION-001/`: コンポーネント移行タスク
