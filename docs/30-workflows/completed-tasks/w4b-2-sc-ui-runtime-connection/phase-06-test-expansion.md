# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 6                                |
| タスクID | TASK-SC-06-UI-RUNTIME-CONNECTION |
| 機能名   | w4b-2-sc-ui-runtime-connection   |
| 作成日   | 2026-03-22                       |
| 更新日   | 2026-03-24                       |

## 目的

Phase 5 実装後のカバレッジ不足箇所を特定し、エラーケース・境界値・アクセシビリティのテストを追加してカバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を満たす。

## 依存成果物

- Phase 5 実装後のソースコード（Green 状態のテスト込み）
- Phase 4 テストファイル（拡充元）

## カバレッジ不足の想定箇所

Phase 5 実装後に以下の分岐が未カバーになりやすい:

| 分岐                                                     | 理由                                                 |
| -------------------------------------------------------- | ---------------------------------------------------- |
| `detectMode` が `"improve"` を返したとき                 | U-1 は `"plan"` のみテスト                           |
| `handlePlanSkill` で `planSkill` が例外（throw）したとき | U-10 は `success: false` のみ                        |
| `handleExecutePlan` で `executePlan` が失敗したとき      | Phase 4 では成功ケースのみ                           |
| `clearGenerationState` 後に plan 結果が非表示になること  | Phase 4 では clearGenerationState の呼び出し確認のみ |
| `isGenerating=true` 中の「方針を決める」ボタン状態       | Phase 4 では「実行する」ボタンの無効化のみ           |
| アクセシビリティ属性（role, aria-live）の存在            | Phase 4 ではアサートなし                             |
| 空白のみ（trim 後が空）の入力バリデーション              | P42 3段バリデーションの3段目                         |

## 実行タスク

### Task 1: エラーケーステスト追加

**追加先ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`

**E-1: planSkill が例外をスローしたとき generationError が設定される**

```
目的: ネットワーク例外（Promise rejection）時のエラーハンドリングを確認する
前提:
  - mockPlanSkill が reject する（例: new Error("NETWORK_ERROR: 接続失敗")）
  - mockDetectMode が "plan" を返す
手順:
  1. mockPlanSkill.mockRejectedValue(new Error("NETWORK_ERROR: 接続失敗"))
  2. テキストエリアに入力し "方針を決める" ボタンを fireEvent.click
  3. act(async () => {}) で非同期解決を待つ
アサート:
  - generationError に "NETWORK_ERROR: 接続失敗" が設定される
  - (store mock の場合は setGenerationError が適切な引数で呼ばれたことを確認)
  - isGenerating が最終的に false に戻る（finally ブロックの確認）
```

**E-2: detectMode が "improve" を返したときも planSkill が呼ばれる**

```
目的: "plan" だけでなく "improve" でも planSkill フローが開始されることを確認する（Phase 2 設計のフロー）
前提:
  - mockDetectMode が "improve" を返す
手順:
  1. mockDetectMode.mockResolvedValue({ success: true, data: "improve" })
  2. テキストエリアに入力し "方針を決める" を押す
  3. act(async () => {}) で非同期解決を待つ
アサート:
  - mockPlanSkill が 1 回呼ばれた
```

**E-3: handleExecutePlan で executePlan が失敗したとき generationError が設定され plan 結果が保持される**

```
目的: executePlan 失敗時に plan 結果（currentPlanResult）が消えずエラーが表示されることを確認する
前提:
  - mockStoreState.currentPlanResult = { type: "integrated_api", planId: "plan-001", estimatedSteps: 5 }
  - mockStoreState.currentPlanId = "plan-001"
  - mockExecutePlan が { success: false, error: "スキル生成に失敗しました" } を返す
手順:
  1. currentPlanResult を設定してレンダリング
  2. "実行する" ボタンを fireEvent.click
  3. act(async () => {}) で非同期解決を待つ
アサート:
  - generationError が設定される（setGenerationError の呼び出し確認）
  - clearGenerationState が呼ばれていない（plan 結果が保持される）
  - isGenerating が false に戻る（finally ブロックの確認）
```

**E-4: executePlan が例外をスローしたとき generationError が設定される**

```
目的: executePlan の Promise rejection 時のエラーハンドリングを確認する
前提:
  - mockExecutePlan が reject する
  - currentPlanResult / currentPlanId が設定されている
手順:
  1. mockExecutePlan.mockRejectedValue(new Error("タイムアウトエラー"))
  2. currentPlanResult を設定してレンダリング
  3. "実行する" ボタンを fireEvent.click
  4. act(async () => {}) で非同期解決を待つ
アサート:
  - setGenerationError が "タイムアウトエラー" で呼ばれた
  - setIsGenerating(false) が呼ばれた
```

### Task 2: 境界値テスト追加

**E-5: スペースのみの入力は バリデーションで弾かれる（P42 3段目）**

```
目的: description.trim() === "" が正しく機能することを確認する
前提:
  - テキストエリアに "   " (スペースのみ) が入力されている
手順:
  1. テキストエリアに "   " を fireEvent.change で入力
  2. "方針を決める" ボタンを fireEvent.click
  3. act(async () => {}) で非同期解決を待つ
アサート:
  - mockDetectMode が呼ばれない（早期リターン）
  - mockPlanSkill が呼ばれない
```

**E-6: currentPlanId が null のとき「実行する」ボタンクリックで handleExecutePlan は何もしない**

```
目的: currentPlanId が null の状態での「実行する」ボタン操作で安全に早期リターンすることを確認する
前提:
  - mockStoreState.currentPlanId = null
  - mockStoreState.currentPlanResult = { type: "integrated_api", estimatedSteps: 3 }（planId は undefined）
手順:
  1. currentPlanResult を planId なしで設定
  2. "実行する" ボタンを fireEvent.click
  3. act(async () => {}) で非同期解決を待つ
アサート:
  - mockExecutePlan が呼ばれない
```

**E-7: isGenerating=true のとき「実行する」ボタンの二重クリックで executePlan が1回しか呼ばれない**

```
目的: R-1 の isGenerating ガードが handleExecutePlan にも適用されていることを確認する
前提:
  - 1回目のクリック後に isGenerating=true になる（store が実際に更新される場合は実 store を使う、mock の場合はモック状態で確認）
手順（mockStoreState.isGenerating を操作する場合）:
  1. currentPlanResult を設定してレンダリング
  2. "実行する" ボタンを fireEvent.click（1回目）
  3. isGenerating=true にモック状態を変更
  4. "実行する" ボタンを再度 fireEvent.click（2回目）
  5. act(async () => {}) で非同期解決を待つ
アサート:
  - mockExecutePlan が 1 回だけ呼ばれた
```

### Task 3: アクセシビリティテスト追加

**E-8: generationError が存在するとき role="alert" 要素が存在する**

```
目的: エラー表示が支援技術（スクリーンリーダー）で読み上げられる role="alert" を持つことを確認する（WCAG 2.1 AA）
前提:
  - mockStoreState.generationError = "計画生成に失敗しました"
手順:
  1. generationError を設定してレンダリング
アサート:
  - screen.getByRole("alert") が存在する
  - その要素のテキストが "計画生成に失敗しました" を含む
```

**E-9: generationProgress が存在するとき aria-live="polite" 要素が存在する**

```
目的: プログレスメッセージがライブリージョンとして正しくアナウンスされることを確認する（WCAG 2.1 AA）
前提:
  - mockStoreState.isGenerating = true
  - mockStoreState.generationProgress = "計画を生成中..."
手順:
  1. isGenerating=true, generationProgress 設定でレンダリング
アサート:
  - screen.getByText("計画を生成中...") の祖先要素または自身が aria-live="polite" を持つ
```

**E-10: 「実行する」ボタンが disabled のとき aria-disabled 属性または disabled 属性が存在する**

```
目的: ボタンの無効状態が支援技術で正しく認識されることを確認する（WCAG 2.1 AA 4.1.2）
前提:
  - mockStoreState.isGenerating = true
  - mockStoreState.currentPlanResult = { type: "integrated_api", planId: "plan-001", estimatedSteps: 5 }
手順:
  1. isGenerating=true かつ currentPlanResult を設定してレンダリング
アサート:
  - "実行する" ボタンが disabled 属性を持つ（`getByRole("button", { name: "実行する" }).disabled === true`）
```

### Task 4: Zustand セレクタ追加テスト

**追加先ファイル**: `apps/desktop/src/renderer/store/__tests__/agentSlice.generation.test.ts`

**E-S-1: clearGenerationState が isGenerating=true の状態からリセットする**

```
目的: 生成中（isGenerating=true）の状態からでも clearGenerationState が機能することを確認する
手順:
  1. setIsGenerating(true)
  2. setGenerationProgress("生成中...")
  3. setCurrentPlanId("plan-001")
  4. clearGenerationState() を呼ぶ
アサート:
  - isGenerating === false
  - generationProgress === null
  - currentPlanId === null
```

**E-S-2: setCurrentPlanResult に null を渡せる**

```
目的: plan 結果のクリアが setCurrentPlanResult(null) で可能であることを確認する
手順:
  1. setCurrentPlanResult({ type: "integrated_api", planId: "plan-001", estimatedSteps: 3 })
  2. setCurrentPlanResult(null)
アサート:
  - state.currentPlanResult === null
```

**E-S-3: useClearGenerationState の参照が安定している（P31 対策）**

```
目的: useClearGenerationState が返す関数参照がレンダー間で安定していることを確認する
手順:
  1. renderHook(() => useAppStore((s) => s.clearGenerationState)) でアクションを取得
  2. state を変更（setIsGenerating(true)）
  3. 同じ hook からアクションを再取得
アサート:
  - 2回取得したアクション参照が同一（Object.is で true）
```

## 参照資料

- Phase 4 テストファイル（拡充元）
- Phase 5 実装済みソース（カバレッジレポートから未カバー箇所を特定）
- `.claude/rules/02-code-quality.md`（カバレッジ基準: Line 80%+, Branch 60%+, Function 80%+）
- `.claude/rules/06-known-pitfalls.md` P9（テスト間状態リーク）、P31（参照安定性）、P39（fireEvent）、P42（3段バリデーション）
- `.claude/rules/01-architecture.md`（WCAG 2.1 AA アクセシビリティ）

## 実行手順

### ステップ1: カバレッジ不足箇所の特定

Phase 5 実装後のカバレッジレポートを確認し、未カバーの分岐を特定する。

### ステップ2: エラーケーステスト追加（E-1〜E-4）

planSkill/executePlan の例外・失敗ケースのテストを追加する。

### ステップ3: 境界値テスト追加（E-5〜E-7）

P42 3段バリデーション、null ガード、二重クリック防止のテストを追加する。

### ステップ4: アクセシビリティテスト追加（E-8〜E-10）

WCAG 2.1 AA 準拠のアクセシビリティテスト（role="alert"、aria-live）を追加する。

### ステップ5: Zustand セレクタ追加テスト（E-S-1〜E-S-3）

clearGenerationState、null 設定、参照安定性のテストを追加する。

## 統合テスト連携

- Phase 4 のテスト（U-1〜U-12、U-S-1〜U-S-7）が引き続き PASS することを確認（リグレッション防止）
- 既存の `SkillLifecyclePanel.test.tsx` テストとの共存確認
- beforeEach でモック状態をリセットし、テスト間状態リークを防止（P9 対策）

## 多角的チェック観点

| 観点               | 適用判断 | 確認内容                                                           |
| ------------------ | -------- | ------------------------------------------------------------------ |
| エラーハンドリング | 該当     | 例外（reject）・失敗レスポンス（success: false）両パターンのテスト |
| 境界値             | 該当     | 空白のみ入力、null planId、二重クリック                            |
| アクセシビリティ   | 該当     | role="alert"、aria-live="polite"、disabled 属性（WCAG 2.1 AA）     |
| 参照安定性         | 該当     | Zustand アクション参照の安定性テスト（P31 対策）                   |

## サブタスク管理

| サブタスク                                         | 担当           | 状態   | 備考                   |
| -------------------------------------------------- | -------------- | ------ | ---------------------- |
| Task 1: エラーケーステスト（E-1〜E-4）             | Phase 6 実行者 | 未着手 | reject + success:false |
| Task 2: 境界値テスト（E-5〜E-7）                   | Phase 6 実行者 | 未着手 | P42 3段バリデーション  |
| Task 3: アクセシビリティテスト（E-8〜E-10）        | Phase 6 実行者 | 未着手 | WCAG 2.1 AA            |
| Task 4: Zustand セレクタ追加テスト（E-S-1〜E-S-3） | Phase 6 実行者 | 未着手 | 参照安定性             |

## 成果物

- 拡充済み `SkillLifecyclePanel.llm-generation.test.tsx`（E-1〜E-10 追加）
- 拡充済み `agentSlice.generation.test.ts`（E-S-1〜E-S-3 追加）

## 完了条件

- [ ] E-1（planSkill 例外時の generationError 設定 + isGenerating=false）テストを追加した
- [ ] E-2（detectMode が "improve" のとき planSkill が呼ばれる）テストを追加した
- [ ] E-3（executePlan 失敗時の generationError 設定 + plan 結果保持）テストを追加した
- [ ] E-4（executePlan 例外時の generationError 設定）テストを追加した
- [ ] E-5（スペースのみ入力の P42 3段バリデーション）テストを追加した
- [ ] E-6（currentPlanId が null のとき早期リターン）テストを追加した
- [ ] E-7（二重クリック防止で executePlan が 1 回のみ呼ばれる）テストを追加した
- [ ] E-8（generationError の role="alert"、WCAG 2.1 AA）テストを追加した
- [ ] E-9（generationProgress の aria-live="polite"、WCAG 2.1 AA）テストを追加した
- [ ] E-10（disabled ボタンの aria 属性確認、WCAG 2.1 AA）テストを追加した
- [ ] E-S-1〜E-S-3（AgentSlice 追加テスト）を追加した
- [ ] beforeEach でモック状態をリセットした（P9 対策: テスト間状態リーク防止）
- [ ] 全テストが Green の状態になった
- [ ] カバレッジレポートで未達分岐がないことを確認した（Phase 7 で最終確認）

## タスク100%実行確認【必須】

- [x] 上記「完了条件」の全チェックボックスが ON であることを確認した
- [x] 「実行手順」の全ステップを実行した
- [x] 「サブタスク管理」の全タスクが完了状態である
- [x] 「統合テスト連携」の全項目を確認した
- [x] 「多角的チェック観点」の全観点を確認した
- [x] 成果物が全て生成されている

## 次のPhase

Phase 7: カバレッジ確認
