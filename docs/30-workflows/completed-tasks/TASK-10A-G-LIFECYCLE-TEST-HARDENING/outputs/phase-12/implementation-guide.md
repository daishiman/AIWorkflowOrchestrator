# TASK-10A-G 実装ガイド: スキルライフサイクルテスト堅牢化

## Part 1: 概念説明

### なぜ必要か

なぜこの仕組みが必要かというと、スキル作成まわりは Main 側の約束、Store の状態遷移、ChatPanel の既存導線が同時に関わるため、どこか1か所だけ見ても壊れ方を見逃しやすいからである。

### 何をするか

この機能でできることは、3つの検査地点を用意して「入口での約束違反」「途中工程の流れ」「既存製品との組み合わせ崩れ」を別々に見つけることだ。

### テストの3層構造 --- 「品質検査工場」のたとえ

TASK-10A-G では、スキル作成ウィザードの品質を保証するために3つのテスト層を設計した。これは「品質検査工場」の仕組みに似ている。

#### Layer 1: IPC 契約テスト --- 「受付窓口の書類チェック係」

工場の入口には受付窓口がある。ここでは、持ち込まれた書類（入力データ）に記入漏れや不正な内容がないかチェックする係がいる。

実際のソフトウェアでは、Electron アプリの Main プロセスにある `skill:create` ハンドラーがこの「受付窓口」にあたる。このハンドラーは以下をチェックする:

- **送り主の確認**: 正しいウィンドウからの呼び出しかどうか（不審な送り主は拒否）
- **書類の記入チェック**: `description`（スキルの説明文）が空でないか、数値ではないか、スペースだけではないか
- **オプション用紙の形式チェック**: `options` がオブジェクト形式かどうか（文字列や null は拒否）

不正な入力は工場の中（サービス層）に一切入れない。これが「契約テスト」の基本的な考え方。

#### Layer 2: Renderer 統合テスト --- 「製造ラインの流れを確認する検査員」

工場の中には製造ラインがある。原材料の投入から製品の完成まで、各工程が正しい順番で動いているかを確認する検査員がいる。

実際のソフトウェアでは、Zustand Store のアクションを通じた一連のフローがこの「製造ライン」にあたる:

1. **スキル作成**: `createSkill` アクション → IPC 呼び出し → スキル一覧の再取得
2. **スキル分析**: `analyzeSkill` アクション → 分析結果の Store 保存
3. **スキル改善**: `applySkillImprovements` アクション → 改善適用 → 再分析

各工程の間で「材料が正しく次の工程に渡されているか」「エラーが起きたときに製造ラインが安全に停止するか」を確認する。

#### Layer 3: 既存テスト拡張 --- 「新しい部品が既存製品と合うか確認する係」

工場に新しい部品（スキル管理機能）が届いたとき、既存の製品（ChatPanel）と組み合わせても問題なく動くかを確認する係がいる。

実際のソフトウェアでは、ChatPanel コンポーネントに4つのスキル管理テストを追加した。重要なのは、既存の12テストが壊れないこと。新しい部品を追加したせいで、今まで動いていた機能が壊れたら意味がない。

---

### なぜテストを書くのか --- 「自動監視カメラ」

テストは工場に設置された「自動監視カメラ」のようなもの。コードを変更するたびに、監視カメラが自動的に全工程をチェックしてくれる。

- 新しい機能を追加したとき: 既存の機能が壊れていないか自動でチェック
- バグを修正したとき: 同じバグが再発しないか自動で監視
- リファクタリングしたとき: 動作が変わっていないか自動で確認

人間がすべてのパターンを毎回手動で確認するのは現実的ではない。テストがあれば「変更してよいかどうか」を数秒で判断できる。

たとえば教室で提出物を集める場面を考えるとわかりやすい。名前の書き忘れを入口で止め、提出後は名簿と枚数を見比べ、最後に既存の保管棚へ正しく収まるかを見る。TASK-10A-G の3層テストはこの流れと同じ役割分担になっている。

### 契約テストとは何か --- 「約束を自動で守る仕組み」

`skill:create` ハンドラーには「約束」がある:

- `description` は文字列で、空でなく、スペースだけでもダメ
- `options` はオブジェクト形式でなければならない
- エラーメッセージにはファイルパスやトークン情報を含めない（セキュリティ）

契約テストは、この「約束」が守られ続けているかを毎回自動で確認する仕組み。誰かがコードを変更して約束を破ってしまったら、テストが即座に「約束違反」を検出する。

---

## Part 2: 開発者向け実装詳細

### 3層テスト構成

| Layer   | テストファイル                        | テスト数               | 対象                         | 環境      |
| ------- | ------------------------------------- | ---------------------- | ---------------------------- | --------- |
| Layer 1 | `skillHandlers.create.test.ts`        | 25 (基本14 + 拡充11)   | Main プロセス IPC ハンドラー | Node.js   |
| Layer 2 | `SkillLifecycle.integration.test.tsx` | 14 (基本10 + 拡充4)    | Zustand Store アクション統合 | happy-dom |
| Layer 3 | `ChatPanel.skill-management.test.tsx` | 4 (既存12テストと共存) | ChatPanel UI コンポーネント  | happy-dom |

### TypeScript 型定義

```ts
type SkillCreateOptions = {
  generateTasks?: boolean;
  addAgents?: boolean;
  addReferences?: boolean;
};

interface SkillCreateRequest {
  description: string;
  options: SkillCreateOptions;
}
```

### APIシグネチャ

`skill:create` の APIシグネチャは `handler(event, description: string, options: SkillCreateOptions)` で扱う。Renderer 側では `window.electronAPI.skill.create(description, options)` を Store action の下位依存としてのみ使う。

### 使用例

```ts
await store.createSkill("quality gate for lifecycle tests", {
  generateTasks: true,
  addAgents: true,
  addReferences: false,
});
```

### Layer 1: IPC 契約テスト

**ファイル**: `apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts`

**テスト対象**: `registerSkillHandlers` が登録する `skill:create` チャンネルのハンドラー

**モック戦略**:

```
vi.mock("electron")                              # ipcMain.handle をキャプチャ
vi.mock("../../infrastructure/security/ipc-validator.js")  # validateIpcSender の結果制御
vi.mock("../../services/skill/SkillService")     # サービス層を分離
vi.mock("electron-store")                        # PermissionStore 依存を解消
vi.mock("electron-log")                          # ログ出力を抑制
vi.mock("../../services/skill/SkillForker.js")   # 未使用依存の解消
vi.mock("../../services/skill/SkillAnalyzer.js") # 未使用依存の解消
vi.mock("../../services/skill/SkillImprover.js") # 未使用依存の解消
vi.mock("../../services/skill/PromptOptimizer.js") # 未使用依存の解消
vi.mock("../../services/skill/SkillExecutor.js") # 未使用依存の解消
```

**ハンドラーキャプチャパターン**:

`ipcMain.handle` のモック実装で、登録されたハンドラーを `Map` にキャプチャする。テスト内で `handlers.get("skill:create")` を呼び出してハンドラーを直接テストする。

**エラーキャッチヘルパー**:

`callAndCatchError()` ヘルパーで try-catch の重複を排除。`expect.unreachable()` でハンドラーがエラーを投げなかった場合にテスト失敗させる。

**テストカテゴリ**:

| カテゴリ                    | テストID        | 内容                                   |
| --------------------------- | --------------- | -------------------------------------- |
| Sender 検証                 | TC-G01-001, 002 | validateIpcSender の正当/不正ケース    |
| P42 準拠 3段バリデーション  | TC-G01-003〜008 | undefined/空文字/スペース/型不正       |
| 正常系                      | TC-G01-009, 010 | サービス委譲、trim() 適用              |
| エラーラップ                | TC-G01-011      | サービス例外の CREATE_ERROR ラップ     |
| エラーサニタイズ            | TC-G01-012〜014 | パス除去/トークン除去/非Error対応      |
| Phase 6: description 境界値 | TC-G01-015〜018 | 1文字/超長文/日本語/改行               |
| Phase 6: options 境界値     | TC-G01-019, 020 | 空オブジェクト/未知プロパティ          |
| Phase 6: 非同期エラー       | TC-G01-021, 022 | 非同期 reject/長時間処理               |
| Phase 6: サニタイズ追加     | TC-G01-023〜025 | Windows パス/複数パス/スタックトレース |

**実行コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts
```

### Layer 2: Renderer 統合テスト

**ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx`

**テスト対象**: `agentSlice` の Store アクション（`createSkill`, `analyzeSkill`, `applySkillImprovements`, `autoImproveSkill`）を通じたライフサイクル統合フロー

**モック戦略**:

コンポーネントレンダリングではなく、Store アクションを直接呼び出すアプローチ。`createTestStore()` で `agentSlice` のインスタンスを生成し、`mockSet` / `mockGet` で状態変更をトラッキングする。`window.electronAPI.skill` をグローバルモックとして設定し、IPC 呼び出しの結果を制御する。

**テストデータファクトリ**:

`test-data-factory.ts` で以下のファクトリ関数を提供:

- `createMockAnalysis(overrides?)`: SkillAnalysis オブジェクト（デフォルト overallScore: 72）
- `createMockSuggestion(overrides?)`: Suggestion オブジェクト
- `createMockRisk(overrides?)`: Risk オブジェクト
- `createMockAppliedImprovement(overrides?)`: AppliedImprovement オブジェクト
- `createHighScoreAnalysis()`: スコア85の分析結果
- `createLowScoreAnalysis()`: スコア35の分析結果

各ファクトリは `overrides` パラメータでデフォルト値を部分的に上書きできる。

**テストカテゴリ**:

| カテゴリ           | テストID        | 内容                                                     |
| ------------------ | --------------- | -------------------------------------------------------- |
| ウィザード起動     | TC-G02-001, 002 | action 存在確認、初期状態検証                            |
| 作成フロー         | TC-G02-003〜005 | create 委譲、options 渡し、fetchSkills 同期              |
| 分析・改善         | TC-G02-006, 007 | analyzeSkill 結果設定、改善→再分析フロー                 |
| エラーハンドリング | TC-G02-008〜010 | create 失敗、リトライ回復、状態遷移ガード                |
| Phase 6: リカバリ  | TC-G02-011〜014 | ネットワークエラー、fetchSkills 失敗、割り込み、連続送信 |

**実行コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx
```

### Layer 3: 既存テスト拡張

**ファイル**: `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`

**テスト対象**: ChatPanel コンポーネントのスキル管理パネル導線

**モック戦略**:

- Store モック: `vi.mock("../../../store")` で `useAppStore` と `useSkillStore` をモック化。`mockStoreState` 変数で状態を制御
- コンポーネントモック: `SkillSelector`, `SkillImportDialog`, `PermissionDialog`, `SkillStreamingView`, `SkillManagementPanel` を簡易モックに置換
- `setStoreState(overrides)` ヘルパーで各テスト用の状態を設定

**既存テストとの共存**:

TC-CP-01〜03 が既存12テスト、TC-G03-001〜004 が TASK-10A-G で追加した4テスト。同一ファイル内で `describe` ブロックを分離して共存。

**実行コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

### 全テスト一括実行

```bash
cd apps/desktop && pnpm vitest run \
  src/main/ipc/__tests__/skillHandlers.create.test.ts \
  src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

---

### エラーハンドリング

- Layer 1 は `VALIDATION_ERROR` / `CREATE_ERROR` とサニタイズ済みメッセージを検証する
- Layer 2 は Store action が `skillError` を設定し、再試行で回復できることを検証する
- Layer 3 は既存導線を壊さずにエラー状態へ遷移できることを確認する

### エッジケース

- `description` が 1 文字、超長文、日本語、改行を含むケース
- `options` が空オブジェクト、未知プロパティを含むケース
- 非同期 reject / 遅延 resolve / 複数パス混在エラーのサニタイズ

### 設定可能なパラメータと定数一覧

| 項目                     | 用途                          | 例                                                              |
| ------------------------ | ----------------------------- | --------------------------------------------------------------- |
| `generateTasks`          | 作成時に tasks まで生成するか | `true`                                                          |
| `addAgents`              | agents ひな形を追加するか     | `true`                                                          |
| `addReferences`          | references ひな形を追加するか | `false`                                                         |
| `DEFAULT_CREATE_OPTIONS` | Layer 2 で使う既定値          | `{ generateTasks: true, addAgents: true, addReferences: true }` |

### トラブルシューティング

#### P9: テスト間の状態リーク

**症状**: テストの実行順序によって結果が変わる

**原因**: モジュールスコープの変数（`mockStoreState` 等）がテスト間で共有される

**対策**: 全テストファイルで `beforeEach` に `vi.clearAllMocks()` と状態リセットを配置。Layer 3 では `TC-G03-004` で状態リークがないことを明示的に検証している。

#### P31: Zustand Store Hooks 無限ループ

**症状**: `useEffect` の依存配列に合成 Store Hook の戻り値関数を含めると無限再レンダー

**対策**: Layer 2 では Store アクションを直接呼び出すアプローチを採用し、コンポーネントレンダリングを行わないため P31 の影響を回避している。

#### P39: happy-dom 環境での userEvent 非互換

**症状**: `userEvent.setup()` が `TypeError: Symbol(...)` で失敗

**対策**: 全テストファイルで `fireEvent` のみを使用。`@testing-library/user-event` は import しない。非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む。

#### P40: テスト実行ディレクトリ依存

**症状**: プロジェクトルートから実行すると `document is not defined` エラー

**対策**: 必ず `cd apps/desktop` してからテストを実行する。`pnpm --filter @repo/desktop exec vitest run` でも可。

#### P42: trim() バリデーション漏れ

**症状**: スペースのみの入力がバリデーションを通過する

**対策**: Layer 1 の TC-G01-005 でスペースのみ入力（`"   "`）のテストを実施。3段バリデーション（型チェック → 空文字列 → trim 空文字列）を検証。

#### P48: useShallow 未適用による無限ループ

**症状**: `.filter()` / `.map()` で配列を返す派生セレクタが毎回新しい参照を返す

**対策**: Layer 2 では Store アクションの直接呼び出しアプローチのため影響を受けない。Layer 3 では Store をモック化しているため影響を受けない。新規セレクタ追加時は `useShallow` の適用要否を確認すること。
