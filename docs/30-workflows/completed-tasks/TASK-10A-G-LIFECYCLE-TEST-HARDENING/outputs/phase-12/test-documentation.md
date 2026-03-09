# TASK-10A-G テストドキュメント: スキルライフサイクルテスト堅牢化

## テスト構成一覧

### 概要

| Layer                        | ファイル                              | 基本構成 | TASK-10A-G 追加 | 合計   |
| ---------------------------- | ------------------------------------- | -------- | --------------- | ------ |
| Layer 1: IPC 契約テスト      | `skillHandlers.create.test.ts`        | 14       | 11              | 25     |
| Layer 2: Renderer 統合テスト | `SkillLifecycle.integration.test.tsx` | 10       | 4               | 14     |
| Layer 3: 既存テスト拡張      | `ChatPanel.skill-management.test.tsx` | 12       | 4               | 16     |
| **合計**                     |                                       | **36**   | **19**          | **55** |

---

### Layer 1: IPC 契約テスト（25テスト）

**ファイル**: `apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts`

#### Phase 4 基本テスト（14テスト）

| テストID   | テスト名                                                       | カテゴリ              | 検証内容                                                                                   |
| ---------- | -------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------ |
| TC-G01-001 | 正当なsenderからの呼び出しが成功する                           | Sender検証            | validateIpcSender に正しい引数が渡され、getAllowedWindows コールバックが mainWindow を返す |
| TC-G01-002 | 不正なsenderからの呼び出しがVALIDATION_ERRORで拒否される       | Sender検証            | validateIpcSender が invalid を返した場合に IPC_UNAUTHORIZED エラーで拒否                  |
| TC-G01-003 | description未指定(undefined)でVALIDATION_ERROR                 | P42 3段バリデーション | 型チェック段階で拒否                                                                       |
| TC-G01-004 | description空文字列('')でVALIDATION_ERROR                      | P42 3段バリデーション | 空文字列チェック段階で拒否                                                                 |
| TC-G01-005 | descriptionスペースのみ(' ')でVALIDATION_ERROR                 | P42 3段バリデーション | trim空文字列チェック段階で拒否                                                             |
| TC-G01-006 | description数値型(12345)でVALIDATION_ERROR                     | P42 3段バリデーション | 型チェック段階で拒否（string以外）                                                         |
| TC-G01-007 | options未指定(null)でVALIDATION_ERROR                          | バリデーション        | options が null の場合に拒否                                                               |
| TC-G01-008 | options文字列型('invalid')でVALIDATION_ERROR                   | バリデーション        | options がオブジェクト以外の場合に拒否                                                     |
| TC-G01-009 | 有効な引数でcreateSkillFromWizardに委譲する                    | 正常系                | 正しい引数がサービスに渡され、結果が返る                                                   |
| TC-G01-010 | descriptionがtrim()されてサービスに渡される                    | 正常系                | 前後の空白が除去されてサービスに渡る                                                       |
| TC-G01-011 | サービス例外をCREATE_ERRORでラップする                         | エラーラップ          | サービス例外が CREATE_ERROR コードでラップされる                                           |
| TC-G01-012 | エラーメッセージからファイルパスが除去される（UNIX + Windows） | エラーサニタイズ      | UNIX/Windows パスが `[path]` に置換される                                                  |
| TC-G01-013 | エラーメッセージからトークン情報が除去される                   | エラーサニタイズ      | `token=xxx`、`key=xxx` が `***` にマスクされる                                             |
| TC-G01-014 | 非Errorオブジェクトでデフォルトメッセージを返す                | エラーサニタイズ      | 文字列等の非 Error はデフォルトメッセージに置換                                            |

#### Phase 6 拡充テスト（11テスト）

| テストID   | テスト名                                             | カテゴリ          | 検証内容                               |
| ---------- | ---------------------------------------------------- | ----------------- | -------------------------------------- |
| TC-G01-015 | descriptionが1文字('a')で成功する                    | description境界値 | 最小有効入力の受理                     |
| TC-G01-016 | descriptionが超長文('a'.repeat(10000))で成功する     | description境界値 | 大量入力の受理                         |
| TC-G01-017 | descriptionに日本語('スキル作成テスト')で成功する    | description境界値 | マルチバイト文字の受理                 |
| TC-G01-018 | descriptionに改行('line1\nline2')で成功する          | description境界値 | 改行文字を含む入力の受理               |
| TC-G01-019 | optionsが空オブジェクト({})で成功する                | options境界値     | プロパティなしオブジェクトの受理       |
| TC-G01-020 | optionsに未知プロパティ({ unknown: true })で成功する | options境界値     | 未定義プロパティの透過                 |
| TC-G01-021 | サービスが非同期で拒否される場合にCREATE_ERRORを返す | 非同期エラー      | setTimeout 経由の非同期 reject 処理    |
| TC-G01-022 | サービスが長時間かかる場合でも正常に完了する         | 非同期エラー      | setTimeout 経由の遅延 resolve 処理     |
| TC-G01-023 | Windowsパスが除去される                              | サニタイズ追加    | `C:\Users\...` 形式のパス除去          |
| TC-G01-024 | 複数パスが同時に除去される                           | サニタイズ追加    | 複数の UNIX パスが全て `[path]` に置換 |
| TC-G01-025 | スタックトレースが除去される                         | サニタイズ追加    | `at Function (...)` 形式のスタック除去 |

---

### Layer 2: Renderer 統合テスト（14テスト）

**ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx`

#### Phase 4 基本テスト（10テスト）

| テストID   | テスト名                                                           | カテゴリ           | 検証内容                                                                    |
| ---------- | ------------------------------------------------------------------ | ------------------ | --------------------------------------------------------------------------- |
| TC-G02-001 | createSkill action が存在し呼び出し可能                            | ウィザード起動     | Store に createSkill action が存在する                                      |
| TC-G02-002 | スキルライフサイクル関連の初期状態が正しい                         | ウィザード起動     | currentAnalysis=null, isAnalyzing=false, isImproving=false, skillError=null |
| TC-G02-003 | description入力後に createSkill 経由で作成が呼ばれ、パスが返る     | 作成フロー         | IPC に description と options が正しく渡り、パスが返る                      |
| TC-G02-004 | options が store action に正しく渡る（全オプション有効）           | 作成フロー         | generateTasks/addAgents/addReferences の全 true が渡る                      |
| TC-G02-005 | 作成成功後に fetchSkills が呼ばれ一覧 state が同期される           | 作成フロー         | create 成功後に list + getImported が呼ばれる                               |
| TC-G02-006 | スキル選択後に analyzeSkill が呼ばれ、currentAnalysis が設定される | 分析・改善         | analyze IPC が呼ばれ、結果が Store に保存される                             |
| TC-G02-007 | 改善/再分析フローが store action で完結する                        | 分析・改善         | applyImprovements → analyze の順で呼ばれ、更新された分析結果が設定される    |
| TC-G02-008 | create action 失敗時にエラーメッセージが設定される                 | エラーハンドリング | 失敗時に空文字列が返り、skillError に「スキル作成に失敗」が含まれる         |
| TC-G02-009 | analyze action 失敗後に再試行で回復できる                          | エラーハンドリング | 1回目失敗後に skillError 設定、2回目成功で skillError=null に回復           |
| TC-G02-010 | isAnalyzing / isImproving 中の状態遷移が正しくガードされる         | エラーハンドリング | IPC 呼び出し中は true、完了後は false                                       |

#### Phase 6 拡充テスト（4テスト）

| テストID   | テスト名                                                      | カテゴリ       | 検証内容                                                       |
| ---------- | ------------------------------------------------------------- | -------------- | -------------------------------------------------------------- |
| TC-G02-011 | 下位APIがネットワークエラーでrejectした場合のUI動作           | エラーリカバリ | ECONNREFUSED で skillError が設定される                        |
| TC-G02-012 | create成功後の一覧同期でfetchSkillsが失敗した場合の動作       | エラーリカバリ | create は成功、fetchSkills 失敗でもクラッシュしない            |
| TC-G02-013 | ウィザード表示中に別のstore更新が割り込んでもクラッシュしない | 並行操作       | 分析中の外部 Store 更新後も currentAnalysis が正しく設定される |
| TC-G02-014 | createを連続送信した場合の状態管理                            | 並行操作       | Promise.all で2つの create を並行実行しても両方完了する        |

---

### Layer 3: 既存テスト拡張（16テスト: 既存12 + 追加4）

**ファイル**: `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`

既存の TC-CP-01〜03（12テスト）に、TASK-10A-G で以下の4テストを追加した。Phase 12 では **既存12 + 追加4 = 16テスト** を実行対象として扱う。

| テストID   | テスト名                                       | カテゴリ           | 検証内容                                               |
| ---------- | ---------------------------------------------- | ------------------ | ------------------------------------------------------ |
| TC-G03-001 | スキル作成後にリスト表示が更新される           | ライフサイクル統合 | Store 状態変更後の再レンダーでパネルが正しく表示される |
| TC-G03-002 | 作成キャンセル時にリストが変更されない         | ライフサイクル統合 | パネル閉じ時に追加の fetchSkills 呼び出しがない        |
| TC-G03-003 | 既存テストと同一の基本操作が正常に動作する     | ライフサイクル統合 | パネル開閉と aria-expanded の遷移                      |
| TC-G03-004 | テスト間の状態リークがないことを検証（P9対策） | ライフサイクル統合 | カスタム状態設定→リセット後にデフォルト動作を検証      |

---

## テスト実行コマンド

### 個別実行

```bash
# Layer 1: IPC 契約テスト
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts

# Layer 2: Renderer 統合テスト
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx

# Layer 3: 既存テスト拡張
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

### 全テスト一括実行

```bash
cd apps/desktop && pnpm vitest run \
  src/main/ipc/__tests__/skillHandlers.create.test.ts \
  src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

### カバレッジ付き実行

```bash
cd apps/desktop && pnpm vitest run --coverage \
  src/main/ipc/__tests__/skillHandlers.create.test.ts \
  src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

---

## カバレッジレポートの読み方

### 指標の説明

| 指標              | 意味                                                               | 最低基準 | 推奨基準 |
| ----------------- | ------------------------------------------------------------------ | -------- | -------- |
| Line Coverage     | テスト実行時に通過した行の割合。100行中80行通過なら80%             | 80%      | 90%      |
| Branch Coverage   | if/else/switch 等の分岐の通過率。10分岐中6分岐通過なら60%          | 60%      | 70%      |
| Function Coverage | テスト実行時に呼び出された関数の割合。10関数中8関数呼び出しなら80% | 80%      | 90%      |

### カバレッジが低い場合の対処

1. **Line Coverage が低い**: 未テストのコードパスを特定し、そのパスを通過するテストケースを追加
2. **Branch Coverage が低い**: 条件分岐の全パターン（true/false）をテストしているか確認。特にエラーケースや境界値の分岐が漏れやすい
3. **Function Coverage が低い**: P41 に注意。v8 カバレッジプロバイダはインライン arrow function も独立関数としてカウントする。オプションオブジェクト内のコールバックも明示的に呼び出す必要がある

---

## 新規テスト追加時のガイドライン

### Layer 1 への追加

**ファイル**: `skillHandlers.create.test.ts`

1. 適切な `describe` ブロック末尾に `it` を追加する
2. テスト ID は `TC-G01-XXX` の連番を維持する（現在の最大は TC-G01-025）
3. バリデーションテストは `callAndCatchError()` ヘルパーを活用する
4. エラーテストでは `rejects.toMatchObject({ code, message })` パターンを使用する
5. `beforeEach` でモックがリセットされるため、テスト固有のモック設定は各 `it` 内で行う

**追加例**:

```typescript
it("TC-G01-026: descriptionが配列([])でVALIDATION_ERROR", async () => {
  const handler = getHandler();
  await expect(handler(mockEvent, [], VALID_OPTIONS)).rejects.toMatchObject({
    code: ERROR_CODE_VALIDATION,
    message: ERROR_MSG_DESCRIPTION,
  });
});
```

### Layer 2 への追加

**ファイル**: `SkillLifecycle.integration.test.tsx`

1. 適切な `describe` ブロック末尾に `it` を追加する
2. テスト ID は `TC-G02-XXX` の連番を維持する（現在の最大は TC-G02-014）
3. Store アクションは `store.xxx()` で直接呼び出す（コンポーネントレンダリングは不要）
4. テストデータは `test-data-factory.ts` のファクトリ関数を使用する
5. `mockAPI.xxx.mockResolvedValue()` で IPC 呼び出しの結果を制御する

**追加例**:

```typescript
it("TC-G02-015: autoImproveSkill成功後にisImprovingがfalseになる", async () => {
  mockAPI.autoImprove.mockResolvedValue(undefined);

  await store.autoImproveSkill("target-skill");

  expect(store.isImproving).toBe(false);
  expect(mockAPI.autoImprove).toHaveBeenCalledWith("target-skill");
});
```

### Layer 3 への追加

**ファイル**: `ChatPanel.skill-management.test.tsx`

1. `TC-G03` の `describe` ブロック末尾に `it` を追加する
2. テスト ID は `TC-G03-XXX` の連番を維持する（現在の最大は TC-G03-004）
3. `setStoreState(overrides)` で Store 状態を設定する
4. `fireEvent` のみ使用する（`userEvent` は P39 により使用禁止）
5. `cleanup()` は `afterEach` で自動実行されるが、テスト中に再レンダーする場合は `unmount()` を手動呼び出しする
6. 既存の12テスト（TC-CP-01〜03）のモック構成を変更しないこと

**追加例**:

```typescript
it("TC-G03-005: パネル表示中にスキル選択状態が変わってもパネルが維持される", () => {
  setStoreState();
  const { unmount } = render(<ChatPanel />);

  const toggleButton = screen.getByTestId("skill-management-toggle");
  fireEvent.click(toggleButton);
  expect(screen.getByTestId("mock-skill-management-panel")).toBeInTheDocument();

  unmount();
  setStoreState({ selectedSkillName: "changed-skill" });
  render(<ChatPanel />);

  // パネルは初期状態に戻る（トグル状態は React ローカル state）
  expect(screen.queryByTestId("mock-skill-management-panel")).not.toBeInTheDocument();
});
```

---

## テストデータファクトリ

**ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/helpers/test-data-factory.ts`

| ファクトリ関数                             | 戻り型               | デフォルト値の特徴                                   |
| ------------------------------------------ | -------------------- | ---------------------------------------------------- |
| `createMockCategory(overrides?)`           | `AnalysisCategory`   | name="Code Quality", score=75                        |
| `createMockSuggestion(overrides?)`         | `Suggestion`         | type="prompt", priority="medium", autoFixable=false  |
| `createMockRisk(overrides?)`               | `Risk`               | category="security", level="medium"                  |
| `createMockAppliedImprovement(overrides?)` | `AppliedImprovement` | result="success"                                     |
| `createMockAnalysis(overrides?)`           | `SkillAnalysis`      | overallScore=72, 3カテゴリ, 3提案, 2リスク           |
| `createMockImprovementResult(overrides?)`  | `ImprovementResult`  | applied=1件, skipped/errors=空                       |
| `createHighScoreAnalysis()`                | `SkillAnalysis`      | overallScore=85, 提案/リスクなし                     |
| `createLowScoreAnalysis()`                 | `SkillAnalysis`      | overallScore=35, 4リスク（critical/high/medium/low） |

全ファクトリは `overrides` パラメータでデフォルト値を部分的に上書き可能。テスト間でのデータ再利用と独立性を両立する設計。
