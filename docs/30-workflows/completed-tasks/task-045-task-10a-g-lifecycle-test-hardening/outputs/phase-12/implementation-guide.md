# TASK-10A-G 実装ガイド: スキルライフサイクル統合テスト強化

## メタ情報

| 項目       | 値         |
| ---------- | ---------- |
| タスクID   | TASK-10A-G |
| 作成日     | 2026-03-10 |
| テスト総数 | 52件       |

---

# Part 1: 概念説明（中学生レベル）

## 1. テストの品質ゲート -- 工場の品質検査ライン

工場で製品を作るとき、完成品をいきなり出荷することはありません。原材料の受入検査、組み立て後の動作確認、出荷前の最終検査と、**各工程に検査ポイント**が設けられています。どこか1つでも不合格になれば、その製品は次の工程に進めません。

ソフトウェア開発にも同じ仕組みがあります。コードを書いたら、まず「型が正しいか」（原材料の品質）、次に「テストが全部通るか」（動作確認）、最後に「カバレッジ基準を満たすか」（出荷基準）を順番にチェックします。1つでも通らなければ、コードは本番環境に入れません。

TASK-10A-G では以下の品質ゲートを設けています。

| ゲート     | 工場で言うと       | チェック内容                          |
| ---------- | ------------------ | ------------------------------------- |
| TypeCheck  | 原材料の規格検査   | TypeScript の型が全て正しいか         |
| G1テスト   | 部品の単体検査     | IPC ハンドラが仕様通りに動くか        |
| G2テスト   | 組み立て品の検査   | Store と IPC の連携が正しいか         |
| G3テスト   | 完成品の動作検査   | 画面が正しく切り替わるか              |
| カバレッジ | 検査漏れのチェック | コードの何%がテストで確認されているか |
| 回帰テスト | 過去製品の再検査   | 既存の機能が壊れていないか            |

## 2. 3層テスト構造（G1/G2/G3） -- レンガの検査、壁の検査、建物の検査

家を建てるとき、3つのレベルで検査を行います。

**レンガの検査（G1）**: 1つ1つのレンガが割れていないか、大きさが合っているかを確認します。レンガ1個が不良品なら、壁を作る前に弾きます。

ソフトウェアでは、G1 は **IPC ハンドラ（skill:create）の単体テスト**です。「入力が空文字のとき正しくエラーを返すか」「不正な送信元からのリクエストを拒否するか」など、1つの部品が仕様通りに動くかを確認します。

**壁の検査（G2）**: レンガを積み上げて壁にしたとき、まっすぐ立っているか、強度は十分かを確認します。レンガ単体は合格でも、接着剤（モルタル）との相性が悪ければ壁は崩れます。

ソフトウェアでは、G2 は **Store 駆動のライフサイクル統合テスト**です。「スキルを作成したあと、一覧が自動更新されるか」「分析を開始したら読み込み中の状態になるか」など、複数の部品が連携して正しく動くかを確認します。

**建物の検査（G3）**: 完成した建物に住人が実際に住んで、ドアが開くか、電気がつくかを確認します。壁は頑丈でも、ドアの蝶番が合っていなければ住めません。

ソフトウェアでは、G3 は **ChatPanel 結線テスト**です。「スキル管理ボタンを押したらパネルが表示されるか」「実行中はボタンが無効になるか」など、ユーザーが実際に操作する画面が正しく動くかを確認します。

```
G1（レンガ）     G2（壁）          G3（建物）
   |                |                  |
   v                v                  v
IPC ハンドラ → Store 連携 → ChatPanel 画面
(14テスト)     (21テスト)      (17テスト)
```

## 3. 障害切り分け -- 車の故障診断

車が動かなくなったとき、整備士は「エンジン」「バッテリー」「タイヤ」のどこが原因かを順番に調べます。いきなりエンジンを分解するのではなく、まずバッテリーの電圧を測り、次にエンジンの音を聞き、最後にタイヤの状態を見ます。

テストの障害切り分けも同じです。

| 車で言うと          | テストで言うと | 確認方法                                     |
| ------------------- | -------------- | -------------------------------------------- |
| バッテリー切れ      | G1だけ失敗     | IPC層（skillHandlers.ts）を確認              |
| エンジン故障        | G2だけ失敗     | Store層（agentSlice.ts）を確認               |
| タイヤパンク        | G3だけ失敗     | UI結合点（ChatPanel.tsx）を確認              |
| バッテリー+エンジン | G1とG2が失敗   | 共有インターフェース（型定義等）の変更を確認 |
| 全部動かない        | 全て失敗       | 共有依存（shared パッケージ）の破壊を確認    |

重要なのは「1つずつ確認する」ことです。G1 が壊れているのに G2 を直そうとしても意味がありません。**G1 から順番に**確認します。

## 4. IPC契約テスト -- 郵便の書式チェック

手紙を出すとき、郵便局は封筒の書式を厳しくチェックします。

- **宛先がない**: 差し戻し（description が undefined）
- **宛先が空白**: 差し戻し（description が空文字）
- **切手が貼っていない**: 差し戻し（options が null）
- **差出人不明**: 差し戻し（sender 検証失敗）

書式が正しい手紙だけが、配達先（skillService.createSkillFromWizard）に届けられます。

IPC契約テストは、この郵便局のチェックをコードで自動化したものです。不正な入力は早い段階で拒否し、正しい入力だけが処理されることを保証します。

特に「空白だけの文字列」のチェック（P42対策）は重要です。`"   "` のように見えない空白だけで構成された宛先は、人間の目には「何か書いてある」ように見えますが、実際には意味のある内容がありません。`.trim()` で空白を除去してから「空っぽかどうか」をチェックする3段階バリデーションが必須です。

---

# Part 2: 開発者向け実装詳細

## 1. テストの実行方法

### 前提条件

テストは必ず `apps/desktop` ディレクトリから実行すること（P40対策）。

```bash
cd apps/desktop
```

### G1: Main IPC skill:create 契約テスト（14件）

```bash
# 個別実行
pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts

# カバレッジ付き実行
pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts --coverage
```

**テスト構成:**

| カテゴリ | テスト数 | 検証内容                             |
| -------- | -------- | ------------------------------------ |
| VAL      | 6        | 入力バリデーション（P42準拠3段）     |
| DEL      | 3        | 正常系委譲（trim、引数渡し）         |
| ERR      | 3        | エラーハンドリング（サニタイズ含む） |
| SEC      | 2        | sender検証（validateIpcSender）      |

### G2: Store 駆動ライフサイクル統合テスト（21件）

```bash
# 個別実行
pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx

# カバレッジ付き実行
pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx --coverage
```

**テスト構成:**

| カテゴリ | テスト数 | 検証内容                              |
| -------- | -------- | ------------------------------------- |
| CL       | 3        | create -> fetchSkills 連鎖            |
| LA       | 3        | analyzeSkill 状態遷移                 |
| AI       | 3        | applySkillImprovements 状態遷移       |
| VAL      | 6        | Store層バリデーション（Phase 6 追加） |
| GUARD    | 3        | API未定義ガード（Phase 6 追加）       |
| SD       | 3        | セレクタ安定性・テスト間分離          |

### G3: ChatPanel 結線テスト（17件）

```bash
# 個別実行
pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx

# カバレッジ付き実行
pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx --coverage
```

**テスト構成:**

| カテゴリ | テスト数 | 検証内容                            |
| -------- | -------- | ----------------------------------- |
| TC-CP-01 | 4        | 初期表示・マウント時の fetchSkills  |
| TC-CP-02 | 5        | スキル管理パネル操作                |
| TC-CP-03 | 3        | スキル実行中ガード                  |
| G3-INT   | 3        | toggle / 排他表示 / executing guard |
| G3-ISO   | 2        | テスト間分離（P9対策）              |

### 全体一括実行

```bash
# 3ファイル一括（52テスト）
pnpm vitest run \
  src/main/ipc/__tests__/skillHandlers.create.test.ts \
  src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx

# カバレッジ付き一括
pnpm vitest run \
  src/main/ipc/__tests__/skillHandlers.create.test.ts \
  src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx \
  --coverage

# シャッフル実行（順序依存テスト検出 - P9対策）
pnpm vitest run \
  src/main/ipc/__tests__/skillHandlers.create.test.ts \
  src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx \
  --sequence.shuffle
```

### 回帰テスト（skillHandlers 関連全体）

```bash
# 既存テスト含む全 skillHandlers テスト
pnpm vitest run src/main/ipc/__tests__/skillHandlers

# Store 関連の回帰
pnpm vitest run src/renderer/store/__tests__/agentSlice.skill-lifecycle.test.ts
```

## 2. 障害切り分け手順

テストが失敗した場合、以下の順序で原因を特定する。

### Step 1: G1 の確認（IPC層）

```bash
pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts
```

**G1 が失敗する場合:**

| 失敗パターン     | 確認ファイル                                          | 修正アプローチ                                |
| ---------------- | ----------------------------------------------------- | --------------------------------------------- |
| VAL テスト失敗   | `src/main/ipc/skillHandlers.ts` L684-700              | バリデーションロジックの確認                  |
| DEL テスト失敗   | `src/main/ipc/skillHandlers.ts` L701-720              | skillService.createSkillFromWizard の引数確認 |
| ERR テスト失敗   | `src/main/ipc/skillHandlers.ts` L721-732              | sanitizeErrorMessage の呼び出し確認           |
| SEC テスト失敗   | `src/main/ipc/skillHandlers.ts` L684-690              | validateIpcSender の引数・戻り値確認          |
| インポートエラー | `src/main/ipc/__tests__/skillHandlers.create.test.ts` | モック設定の確認（vi.mock パス）              |

### Step 2: G2 の確認（Store層）

G1 が全 PASS であることを確認してから G2 を調査する。

```bash
pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx
```

**G2 が失敗する場合:**

| 失敗パターン     | 確認ファイル                                              | 修正アプローチ                        |
| ---------------- | --------------------------------------------------------- | ------------------------------------- |
| CL テスト失敗    | `src/renderer/store/slices/agentSlice.ts` L854-900        | createSkill / fetchSkills の連鎖確認  |
| LA テスト失敗    | `src/renderer/store/slices/agentSlice.ts` L901-930        | analyzeSkill の状態遷移確認           |
| AI テスト失敗    | `src/renderer/store/slices/agentSlice.ts` L931-962        | applySkillImprovements の状態遷移確認 |
| VAL テスト失敗   | 同上                                                      | Store層バリデーションの確認           |
| GUARD テスト失敗 | `src/renderer/components/skill/__tests__/` テストファイル | electronAPI モック設定の確認          |
| SD テスト失敗    | テストファイルの `beforeEach`                             | 状態リセット処理の確認（P9）          |

### Step 3: G3 の確認（UI層）

G1・G2 が全 PASS であることを確認してから G3 を調査する。

```bash
pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

**G3 が失敗する場合:**

| 失敗パターン   | 確認ファイル                                 | 修正アプローチ                   |
| -------------- | -------------------------------------------- | -------------------------------- |
| INT テスト失敗 | `src/renderer/components/chat/ChatPanel.tsx` | toggle / 排他表示ロジックの確認  |
| ISO テスト失敗 | テストファイルの `beforeEach`                | Store/モックリセットの確認（P9） |
| CP テスト失敗  | `src/renderer/components/chat/ChatPanel.tsx` | SkillManagementPanel の結線確認  |

### 複合障害パターン

| パターン       | 原因推定                 | 確認手順                                  |
| -------------- | ------------------------ | ----------------------------------------- |
| G1 + G2 が失敗 | 共有インターフェース変更 | `packages/shared/src/` の型定義変更を確認 |
| G2 + G3 が失敗 | Store の API 変更        | セレクタ/アクション名の変更を確認         |
| 全て失敗       | 共有依存の破壊           | `pnpm --filter @repo/shared build` を実行 |

## 3. テスト追加時のガイドライン

### G1: 新しい IPC ハンドラ追加時

1. `skillHandlers.create.test.ts` のパターンに従い、同ディレクトリに `skillHandlers.<operation>.test.ts` を作成する
2. 以下の4カテゴリを必ず含める:
   - **VAL**: P42準拠の3段バリデーション（型チェック、空文字列、trim空文字列）
   - **DEL**: 正常系の委譲テスト（引数が trim されて渡されるか）
   - **ERR**: エラーハンドリング（sanitizeErrorMessage 適用）
   - **SEC**: sender 検証（validateIpcSender）
3. `beforeEach` で `vi.clearAllMocks()` を必ず実行する（P9対策）
4. `expectHandlerError` ヘルパーパターンを再利用してアサーションを共通化する

### G2: 新しいライフサイクル遷移追加時

1. `SkillLifecycle.integration.test.tsx` に新しい `describe` ブロックを追加する
2. 状態遷移テストでは **中間状態**（isLoading=true 等）と **最終状態** の両方を検証する
3. `beforeEach` で `useAppStore.getState().resetAgentState()` を実行する（P9対策）
4. `fireEvent` を使用する（`userEvent` は使用禁止 - P39対策）
5. 個別セレクタのみ使用する（合成 Hook 禁止 - P31対策）
6. `.filter()` / `.map()` で新しい配列を返すセレクタには `useShallow` を適用する（P48対策）

### G3: 既存テスト整合確認・更新時

1. `ChatPanel.skill-management.test.tsx` の既存 `describe` 構造を尊重する
2. 新規テストは適切なグループ（TC-CP-XX / G3-INT / G3-ISO）に追加する
3. `beforeEach` で `vi.clearAllMocks()` と Store 状態の再設定を実行する（P9対策）
4. UI の存在/不在チェックには `getByTestId` / `queryByTestId` を使い分ける
5. `aria-disabled` 属性のテストには `getAttribute('aria-disabled')` を使用する

### 共通の注意事項

| Pitfall | 対策                                                        |
| ------- | ----------------------------------------------------------- |
| P9      | `beforeEach` で状態を完全リセットする                       |
| P13     | タイマー操作が必要な場合は `advanceTimersByTime` を使う     |
| P31     | 合成 Hook（useXxxStore()）を使わず個別セレクタを使う        |
| P39     | happy-dom 環境では `fireEvent` のみ使用する                 |
| P40     | テスト実行は `cd apps/desktop` から行う                     |
| P42     | 文字列入力のバリデーションは3段（型/空文字列/trim空文字列） |
| P48     | 派生セレクタには `useShallow` を適用する                    |
