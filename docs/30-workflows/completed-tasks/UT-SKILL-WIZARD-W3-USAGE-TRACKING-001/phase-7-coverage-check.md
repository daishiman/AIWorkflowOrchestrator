# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 7                                                    |
| 前提 Phase | 6（テスト拡充）                                      |
| 後続 Phase | 8（リファクタリング）                                |
| タスクID   | UT-SKILL-WIZARD-W3-USAGE-TRACKING-001                |
| タスク分類 | NON_VISUAL（Renderer 内部の計装のみ / 視覚差分なし） |
| 担当 AC    | AC-7 / AC-8 / AC-9                                   |

---

## 目的

Phase 5（実装）と Phase 6（テスト拡充）の成果物に対して、以下のカバレッジ目標を
数値で確認し、未達の場合は Phase 6 へ戻ってテストを追加する。

| 対象ファイル            | カバレッジ目標                               | 対応 AC |
| ----------------------- | -------------------------------------------- | ------- |
| `trackEvent.ts`         | line / branch / function すべて **100%**     | AC-7    |
| `SkillCreateWizard.tsx` | line / branch / function すべて **90% 以上** | AC-8    |
| `CompleteStep.tsx`      | line / branch / function すべて **90% 以上** | AC-9    |

本 Phase は NON_VISUAL タスクであるため、スクリーンショットは取得しない。
カバレッジレポート（テキスト出力または HTML レポート）を主証跡とする。

---

## 実行タスク

### タスク 1: `trackEvent.ts` カバレッジ確認（目標: 100% / AC-7）

#### 手順 1-1: focused カバレッジレポートを実行する

```bash
pnpm --filter @repo/desktop test:coverage -- \
  --coverage.include="src/renderer/utils/trackEvent.ts"
```

上記コマンドでカバレッジが取得できない場合は、以下の代替コマンドを使用する：

```bash
pnpm --filter @repo/desktop vitest run \
  --coverage \
  src/renderer/utils/__tests__/trackEvent.test.ts
```

#### 手順 1-2: カバレッジ数値を確認する

出力されたカバレッジテーブルから `trackEvent.ts` の行を探し、以下の 4 指標を確認する：

| 指標                     | 確認箇所                        | 目標 |
| ------------------------ | ------------------------------- | ---- |
| Stmts（行カバレッジ）    | `trackEvent.ts` の `%Stmts` 列  | 100  |
| Branch（分岐カバレッジ） | `trackEvent.ts` の `%Branch` 列 | 100  |
| Funcs（関数カバレッジ）  | `trackEvent.ts` の `%Funcs` 列  | 100  |
| Lines（行カバレッジ）    | `trackEvent.ts` の `%Lines` 列  | 100  |

**確認すべき分岐の一覧**:

- `process.env.NODE_ENV !== "production"` の true 分岐（dev 環境で console.info が呼ばれる）
- `process.env.NODE_ENV !== "production"` の false 分岐（prod 環境で console.info が呼ばれない）
- `trackEvent` 関数自体が呼ばれる（function coverage）

スタブの実装が `if (process.env.NODE_ENV !== "production") { console.info(...) }` の
2 分岐のみであるため、Phase 6 で追加したテストケース V・W が存在すれば 100% になるはず。

#### 手順 1-3: 未カバー分岐がある場合の対処

カバレッジが 100% 未満の場合、カバレッジレポートの「Uncovered Lines」列に
未カバーの行番号が表示される。その行番号を確認し、対応するテストケースを
Phase 6 の `trackEvent.test.ts` に追加してから本手順を再実行する。

手順 1-3 が必要になった場合は、その内容を本フェーズの実行記録に記載する。

---

### タスク 2: `SkillCreateWizard.tsx` カバレッジ確認（目標: 90%+ / AC-8）

#### 手順 2-1: focused カバレッジレポートを実行する

```bash
pnpm --filter @repo/desktop test:coverage -- \
  --coverage.include="src/renderer/components/skill/SkillCreateWizard.tsx"
```

上記で期待した結果が得られない場合は、テストファイルを直接指定する：

```bash
pnpm --filter @repo/desktop vitest run \
  --coverage \
  src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
```

#### 手順 2-2: カバレッジ数値を確認する

`SkillCreateWizard.tsx` の行を探し、以下の指標を確認する：

| 指標                     | 目標    |
| ------------------------ | ------- |
| Stmts（行カバレッジ）    | 90 以上 |
| Branch（分岐カバレッジ） | 90 以上 |
| Funcs（関数カバレッジ）  | 90 以上 |
| Lines（行カバレッジ）    | 90 以上 |

#### 手順 2-3: 計装ポイント周辺のカバレッジを個別に確認する

カバレッジレポートの HTML 版（`coverage/index.html`）を参照し、
以下の計装ポイント周辺の行が緑色（covered）になっていることを目視確認する：

1. `useEffect` 内の `trackEvent("skill_wizard_open", ...)` 呼び出し行
2. `useEffect` クリーンアップ内の `trackEvent("skill_wizard_abandon", ...)` 呼び出し行
3. `!wizardCompletedRef.current` の条件分岐（true / false 両ブランチ）
4. `handleStep0Next` 内の `trackEvent("skill_wizard_step_complete", { step: 0, ... })` 行
5. `handleStep0NextFromLlm` 内の `trackEvent("skill_wizard_step_complete", { step: 0, ... })` 行
6. `handleGenerate` 内の `trackEvent("skill_wizard_step_complete", { step: 1, ... })` 行
7. `handleGenerate` 成功時の `trackEvent("skill_wizard_step_complete", { step: 2, ... })` 行
8. `handleExecutePlan` 成功時の `trackEvent("skill_wizard_step_complete", { step: 2, ... })` 行

上記 8 箇所のうち未カバーのものがある場合は、対応するテストケースが Phase 6 に
追加されているか確認し、必要であれば Phase 6 の手順に従ってテストを追加する。

#### 手順 2-4: カバレッジが 90% 未満の場合の対処

90% 未満となっている場合、カバレッジレポートで赤色（uncovered）の行を特定する。
以下の観点でテストを追加する：

- LLM モード（`generationMode === "llm"`）の分岐が未カバーであれば、
  `generationMode` を `"llm"` に切り替えてから操作するテストケースを追加する。
- `handleRetry` 呼び出し経路が未カバーであれば、`handleUnsatisfied` → `onRetry` の
  呼び出しをシミュレートするテストケースを追加する。
- `handleCancelPlan` / `handleCancelTemplateGeneration` が未カバーであれば、
  キャンセルボタンのクリックテストケースを追加する。

追加後、手順 2-1 から再実行する。

---

### タスク 3: `CompleteStep.tsx` カバレッジ確認（目標: 90%+ / AC-9）

#### 手順 3-1: focused カバレッジレポートを実行する

```bash
pnpm --filter @repo/desktop test:coverage -- \
  --coverage.include="src/renderer/components/skill/wizard/CompleteStep.tsx"
```

上記で期待した結果が得られない場合：

```bash
pnpm --filter @repo/desktop vitest run \
  --coverage \
  src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx
```

#### 手順 3-2: カバレッジ数値を確認する

`CompleteStep.tsx` の行を探し、以下の指標を確認する：

| 指標                     | 目標    |
| ------------------------ | ------- |
| Stmts（行カバレッジ）    | 90 以上 |
| Branch（分岐カバレッジ） | 90 以上 |
| Funcs（関数カバレッジ）  | 90 以上 |
| Lines（行カバレッジ）    | 90 以上 |

#### 手順 3-3: 計装コールバック周辺のカバレッジを個別に確認する

カバレッジレポートの HTML 版を参照し、以下の箇所が緑色（covered）になっていることを確認する：

1. `onClick` 内の `trackEvent("skill_wizard_next_action", { action: "execute" })` 行
2. `onClick` 内の `trackEvent("skill_wizard_next_action", { action: "edit" })` 行
3. `onClick` 内の `trackEvent("skill_wizard_next_action", { action: "close" })` 行
4. `action.handler?.()` の optional chaining 分岐（handler あり / handler なし）
5. `feedbackSubmitted` フラグの true / false 分岐（`handleSatisfied` / `handleUnsatisfied`）
6. `hasExternalIntegration` が true の場合のチェックリスト表示分岐
7. `onClose` が存在する場合の閉じるボタン表示分岐

#### 手順 3-4: カバレッジが 90% 未満の場合の対処

90% 未満となっている場合、以下の観点でテストを追加する：

- `hasExternalIntegration=true` での外部連携チェックリスト表示が未カバーであれば、
  `hasExternalIntegration={true}` の props でレンダーするテストを追加する。
- `onClose` prop がある場合の閉じるボタン表示が未カバーであれば、
  `onClose={mockFn}` を渡してレンダーするテストを追加する。
- `feedbackSubmitted` が true の状態でフィードバックボタンが disabled になる分岐が
  未カバーであれば、ボタンを 2 回クリックするテストを追加する。

追加後、手順 3-1 から再実行する。

---

## カバレッジ未達の場合の対処フロー

以下のフロー図に従って対処する。

```
カバレッジ確認
    ↓
目標達成? ──YES──→ Phase 8 へ進む
    ↓ NO
未カバー行を特定する
    ↓
該当テストケースが Phase 6 にあるか？
    ↓ NO              ↓ YES
Phase 6 へ戻り      テストの実行条件・
テストを追加する    mock 設定を見直す
    ↓
テスト追加後、
`pnpm test:run` が全 PASS することを確認する
    ↓
手順を再実行してカバレッジ数値を再確認する
```

Phase 6 へ戻った場合は、追加したテストケースの内容を Phase 6 の実行記録に追記し、
本 Phase の実行記録には「Phase 6 へフィードバックし追加した内容」を記載する。

---

## 完了条件

- [ ] `trackEvent.ts` の Stmts / Branch / Funcs / Lines がすべて 100% であることを確認した（AC-7）
- [ ] `SkillCreateWizard.tsx` の Stmts / Branch / Funcs / Lines がすべて 90% 以上であることを確認した（AC-8）
- [ ] `CompleteStep.tsx` の Stmts / Branch / Funcs / Lines がすべて 90% 以上であることを確認した（AC-9）
- [ ] 計装ポイント 1〜5 の行がすべてカバーされていることを HTML レポートで確認した
- [ ] `skill_wizard_next_action` の 3 アクション行がすべてカバーされていることを HTML レポートで確認した
- [ ] カバレッジ未達があった場合は Phase 6 へフィードバックし、追加後に再確認して目標を達成した
- [ ] `pnpm --filter @repo/desktop test:run` が全 PASS する（Phase 6 からの回帰なし）
