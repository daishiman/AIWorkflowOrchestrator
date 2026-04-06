# TASK-UI-02 Phase 6: テスト拡充計画

作成日: 2026-04-06
担当フェーズ: Phase 6（テスト拡充）

---

## ステータス

| 項目           | 内容                                                        |
| -------------- | ----------------------------------------------------------- |
| 実装ステータス | **PENDING（未実装）**                                       |
| 実装前提       | Phase 5（実装）が完了し、テストスイート全体がpassであること |
| 位置づけ       | Phase 4テストマトリクスを補完する追加テストケースの計画書   |

### 着手前チェックリスト

- [ ] Phase 5の全Taskが完了済みであることを確認
- [ ] `pnpm --filter @repo/desktop test --run` で全テストがpassしていることを確認
- [ ] `pnpm --filter @repo/desktop typecheck` が通っていることを確認

---

## 概要

本ドキュメントは、Phase 4テストマトリクスで定義された基本テストケース（T-01〜T-20）を補完するための追加テスト計画である。以下の3領域を対象とする。

1. **interview-widgets 5種別の追加テストケース** — 既存テストでカバーされていない正常系・異常系・インタラクションのケースを補完
2. **IPC経路切り替えのエッジケース** — Runtime IPCタイムアウト・エラーレスポンス時のUI挙動を保護
3. **統合テスト計画** — `ConversationalInterview` と `SkillLifecyclePanel` の共存・協調動作を確認

---

## 1. interview-widgets 5種別の追加テストケース

### 1-1. SingleSelectChips（`single_select`）

**対象ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/interview-widgets/SingleSelectChips.test.tsx`

| テストID | 種別             | テストケース名                                                           | 期待動作                                                                                                 |
| -------- | ---------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| W-SS-01  | 正常系           | 選択肢が3件以上あるとき、全件レンダリングされる                          | `options` プロパティに渡した件数分のボタン/チップが画面上に存在する                                      |
| W-SS-02  | 正常系           | 選択肢が1件のとき、1件のみレンダリングされる                             | 1件のみ表示され、レイアウト崩れが発生しない                                                              |
| W-SS-03  | 正常系           | 選択肢をクリックすると `onSelect` が呼ばれ、選択済みスタイルになる       | `onSelect` が選択値を引数として1回呼ばれ、選択済みを示すスタイル（aria-pressedまたはクラス）が付与される |
| W-SS-04  | 正常系           | すでに選択済みの選択肢は選択済みスタイルで表示される                     | `value` プロパティで渡した値に対応するチップが初期状態から選択済みスタイルになっている                   |
| W-SS-05  | 異常系           | `options` が空配列のとき、選択肢エリアが空でレンダリングエラーにならない | 選択肢コンテナが空で表示され、コンソールエラーが発生しない                                               |
| W-SS-06  | インタラクション | キーボード（Enter/Space）で選択肢を選択できる                            | フォーカス状態でEnterまたはSpaceを押すと `onSelect` が呼ばれる                                           |

---

### 1-2. MultiSelectCheckbox（`multi_select`）

**対象ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/interview-widgets/MultiSelectCheckbox.test.tsx`

| テストID | 種別             | テストケース名                                                           | 期待動作                                                                                                 |
| -------- | ---------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| W-MC-01  | 正常系           | 複数の選択肢が独立してチェックできる                                     | 選択肢Aをチェックし、選択肢Bをチェックすると、両方がチェック済み状態になる                               |
| W-MC-02  | 正常系           | チェック済みの選択肢を再クリックするとチェックが外れる                   | `onSelect` が呼ばれ、その選択肢がチェック済みでなくなる                                                  |
| W-MC-03  | 正常系           | `value` プロパティで複数初期選択値を渡すと初期状態から複数選択済みになる | 渡した値のインデックスに対応するチェックボックスが初期状態でチェック済み                                 |
| W-MC-04  | 異常系           | `options` が空配列のとき、チェックボックスエリアが空でエラーにならない   | 空のコンテナが表示され、コンソールエラーが発生しない                                                     |
| W-MC-05  | インタラクション | キーボード（Space）でチェックボックスを切り替えられる                    | フォーカス状態でSpaceを押すとチェック状態が切り替わる                                                    |
| W-MC-06  | インタラクション | `maxSelect` 制限がある場合、上限を超えると追加選択できない               | 上限件数を選択済みの状態で別の選択肢をクリックしても選択されず、上限到達を示すUI状態（非活性など）になる |

---

### 1-3. FreeTextInput - interview-widgets版（`free_text`）

**対象ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/interview-widgets/FreeTextInput.test.tsx`

| テストID | 種別             | テストケース名                                                                     | 期待動作                                                                     |
| -------- | ---------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| W-FT-01  | 正常系           | `value` プロパティの値がテキストフィールドに表示される                             | 制御コンポーネントとして `value` が反映される                                |
| W-FT-02  | 正常系           | テキスト入力時に `onChange` が呼ばれる                                             | 文字を入力するたびに `onChange` が現在の入力値を引数として呼ばれる           |
| W-FT-03  | 正常系           | `placeholder` プロパティが設定されているとき、入力前にプレースホルダーが表示される | `placeholder` テキストが空入力状態で表示される                               |
| W-FT-04  | 異常系           | `disabled` プロパティがtrueのとき、入力が無効化される                              | テキストフィールドが非活性状態になり、文字入力しても `onChange` が呼ばれない |
| W-FT-05  | インタラクション | Enterキーで送信イベントが発火する（`onSubmit` がある場合）                         | Enterキー押下時に `onSubmit` が呼ばれる（`onSubmit` propが存在する場合のみ） |

---

### 1-4. SecretInput（`secret`）

**対象ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/interview-widgets/SecretInput.test.tsx`

| テストID | 種別             | テストケース名                                                       | 期待動作                                                                       |
| -------- | ---------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| W-SI-01  | 正常系           | デフォルト状態では入力値がマスク表示（`type="password"`）される      | input要素の `type` 属性が `password` であり、入力値が伏字表示される            |
| W-SI-02  | 正常系           | 表示切替ボタン（目のアイコン等）をクリックすると平文表示に切り替わる | input要素の `type` 属性が `text` に変わり、入力値が平文で見える                |
| W-SI-03  | 正常系           | もう一度切替ボタンをクリックするとマスク表示に戻る                   | input要素の `type` 属性が `password` に戻る                                    |
| W-SI-04  | 正常系           | `value` プロパティと `onChange` が制御コンポーネントとして機能する   | `value` が反映され、文字入力で `onChange` が呼ばれる                           |
| W-SI-05  | 異常系           | `disabled` プロパティがtrueのとき、入力と表示切替が無効化される      | テキストフィールドおよび切替ボタンが非活性になる                               |
| W-SI-06  | インタラクション | アクセシビリティ: 切替ボタンに適切な `aria-label` が設定されている   | 「パスワードを表示」「パスワードを非表示」等の `aria-label` がボタンに存在する |

---

### 1-5. ConfirmButtons（`confirm`）

**対象ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/interview-widgets/ConfirmButtons.test.tsx`

| テストID | 種別             | テストケース名                                                                | 期待動作                                                                   |
| -------- | ---------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| W-CB-01  | 正常系           | 「はい」「いいえ」相当の2つのボタンがレンダリングされる                       | confirm種別に対応する2つのボタンが存在する                                 |
| W-CB-02  | 正常系           | 「はい」ボタンをクリックすると `onSelect` がtrueまたは対応する値で呼ばれる    | `onSelect` がyes/true相当の値を引数として呼ばれる                          |
| W-CB-03  | 正常系           | 「いいえ」ボタンをクリックすると `onSelect` がfalseまたは対応する値で呼ばれる | `onSelect` がno/false相当の値を引数として呼ばれる                          |
| W-CB-04  | 異常系           | `disabled` プロパティがtrueのとき、両ボタンが非活性になる                     | 両ボタンのdisabled属性がtrueになり、クリックしても `onSelect` が呼ばれない |
| W-CB-05  | インタラクション | キーボード（Enter/Space）でボタンを操作できる                                 | フォーカス状態のボタンでEnterまたはSpaceを押すと `onSelect` が呼ばれる     |

---

## 2. IPC経路切り替えのエッジケース計画

### 2-1. Runtime IPCタイムアウト時のUI表示仕様

**背景**: `ConversationalInterview` の `onSubmit` が呼ぶ `skillCreatorApi.submitUserInput()` はElectron IPC `invoke` 型であり、Mainプロセスが応答しない場合にタイムアウトが発生しうる。このとき、UIが適切にフィードバックを表示することを保護するテストが必要。

**対象ファイル（新規追加または既存拡張）**:

- `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.ipc-edge.test.tsx`（新規）
  または
- `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.test.tsx`（既存ファイルへの追加）

| テストID  | テストケース名                                                     | シナリオ                                                                          | 期待動作                                                                 | 実装メモ                                                                                                               |
| --------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| IPC-TO-01 | submitUserInput がタイムアウト時、送信ボタンが非活性に戻る         | `onSubmit` に渡したコールバックがPromise rejectを返す（タイムアウトシミュレート） | 送信ボタンが再度活性化されるか、エラー表示が出て再送信可能になる         | `onSubmit` プロパティをモックし `new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 0))` を返す |
| IPC-TO-02 | submitUserInput がタイムアウト時、`onError` コールバックが呼ばれる | 同上                                                                              | `onError` プロパティに渡したモックが呼ばれ、エラーオブジェクトを受け取る | `onError` propのvitest mock関数が呼ばれたことを検証                                                                    |
| IPC-TO-03 | タイムアウト中はローディングインジケーターが表示される             | `onSubmit` が解決しない状態でユーザーが送信操作をする                             | 送信中であることを示すUI（スピナー、ボタンのloading状態等）が表示される  | `onSubmit` がresolveしないPromiseを返す間の中間状態を検証                                                              |

---

### 2-2. IPCエラーレスポンス時の挙動仕様

**背景**: `submitUserInput` がエラーオブジェクト（ネットワークエラー、権限エラー等）を返した場合のUI挙動を保護する。

**対象ファイル**: 上記 `ConversationalInterview.ipc-edge.test.tsx` または既存テストファイルへの追加

| テストID  | テストケース名                                                   | シナリオ                                                           | 期待動作                                                   | 実装メモ                                                                       |
| --------- | ---------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| IPC-ER-01 | IPC エラー時に `onError` が呼ばれる                              | `onSubmit` コールバックがエラーをthrowまたはreject                 | `onError` propが呼ばれ、コンポーネントが送信前の状態に戻る | エラーメッセージの文字列内容の検証は不要（UIの状態回復のみ検証）               |
| IPC-ER-02 | IPC エラー後に再送信できる                                       | `onSubmit` が初回エラー、2回目正常に解決するよう設定               | エラー後に再びフォーム入力・送信が可能な状態になっている   | `onSubmit` のモックを `mockRejectedValueOnce` + `mockResolvedValueOnce` で設定 |
| IPC-ER-03 | 権限エラー（401/403相当）時は `onError` にエラー種別が伝達される | `onSubmit` が `{ code: "PERMISSION_DENIED" }` 形式のエラーをreject | `onError` に渡されたエラーオブジェクトにコードが含まれる   | エラーコードの存在確認のみ。メッセージの正確な文言は問わない                   |

---

### 2-3. `useInterviewState` のエッジケース

**対象ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/useInterviewState.test.ts`（既存ファイルへの追加）

| テストID  | テストケース名                                                                             | シナリオ                                                 | 期待動作                                                                                             |
| --------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| UIH-EC-01 | workflowSnapshot が null から有効な値に切り替わったとき、stateが正しく初期化される         | `workflowSnapshot` propをnull → 有効なオブジェクトに変更 | フックが新しいsnapshotを参照してstateを更新する                                                      |
| UIH-EC-02 | workflowSnapshot の `currentPhase` が `interview` 以外のとき、インタビューUIが非表示になる | `currentPhase: "complete"` を渡す                        | `isInterviewActive` 相当のフラグがfalseになる（またはConversationalInterviewが非マウント状態になる） |

---

## 3. 統合テスト計画

### 3-1. ConversationalInterviewとSkillLifecyclePanelの共存確認

**目的**: `SkillCreatorConversationPanel` 廃止後も `ConversationalInterview` が `SkillLifecyclePanel` 経由で正常に機能することを統合レベルで保護する。

**対象ファイル（既存）**: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx`

#### 追加すべきテストケース

| テストID | テストケース名                                                                         | シナリオ                                                                                 | 期待動作                                                                                | テスト種別 |
| -------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------- |
| INT-01   | skillLifecycle ビューにおいて ConversationalInterview がマウントされる                 | `SkillLifecyclePanel` を `workflowSnapshot` の `currentPhase: "interview"` で描画        | `ConversationalInterview` コンポーネントがDOMに存在する                                 | 統合       |
| INT-02   | interview-widgets の各種 widget が ConversationalInterview 内で表示される              | `workflowSnapshot` に `inputRequest.userInputKind: "single_select"` が含まれる状態で描画 | `SingleSelectChips` に対応するUI要素がDOMに存在する                                     | 統合       |
| INT-03   | ユーザーが選択肢を選んで送信すると skillCreatorApi.submitUserInput が呼ばれる          | `SingleSelectChips` をクリックして送信操作                                               | モック化した `skillCreatorApi.submitUserInput` が正しい引数で呼ばれる                   | 統合       |
| INT-04   | SkillCreatorResultPanel が skill/ に移動後も SkillLifecyclePanel から参照できる        | `workflowSnapshot.currentPhase: "complete"` でResultPanelが表示されるシナリオ            | `SkillCreatorResultPanel` コンポーネントがDOMに表示される（importパス変更後も機能する） | 統合       |
| INT-05   | skill-creator/ ディレクトリ削除後も ConversationalInterview 周辺のテストが全passとなる | Phase 5実装完了後の回帰テスト確認                                                        | 既存テスト T-07〜T-20 が引き続きpass                                                    | 回帰       |

---

### 3-2. IPC移管後の creatorHandlers 統合テスト

**目的**: `CONFIGURE_API` / `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` が `creatorHandlers.ts` に移管された後、End-to-End（Main〜Renderer間）の IPC 呼び出しが機能することを保護する。

**対象ファイル**: `apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts`（既存ファイルへの追加）

| テストID | テストケース名                                                               | シナリオ                                                                                  | 期待動作                                                                                                                                                                            | テスト種別           |
| -------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| ICH-01   | CONFIGURE_API ハンドラーが正しいサービスを呼び出す                           | `ipcMain.invoke("skill-creator:configure-api", payload)` をシミュレート                   | `SkillCreatorConfigService.configure()` 相当のメソッドが正しい引数で呼ばれる                                                                                                        | UT（MainプロセスUT） |
| ICH-02   | SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED ハンドラーが正しいサービスを呼び出す | `ipcMain.invoke(SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED_channel, payload)` をシミュレート | 上書き承認フローが起動される                                                                                                                                                        | UT（MainプロセスUT） |
| ICH-03   | 移管後も既存の creatorHandlers テストがすべてpass                            | CONFIGURE_API / OVERWRITE_APPROVED 追加後にフルテスト実行                                 | `creatorHandlers.adapterStatus.test.ts` / `creatorHandlers.applyImprovement.test.ts` / `creatorHandlers.fire-and-forget.test.ts` / `creatorHandlers.sessionResume.test.ts` が全pass | 回帰                 |

---

## 4. テストファイル構成（Phase 6完了後）

Phase 6完了後に追加・変更されるテストファイルの一覧。

### 新規追加ファイル

| ファイルパス                                                                                     | 内容                                                                             |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.ipc-edge.test.tsx` | IPC-TO-01〜03 / IPC-ER-01〜03 のエッジケーステスト（既存ファイルへの追加でも可） |

### 既存ファイルへの追加ケース

| ファイルパス                                                                                          | 追加テストID  |
| ----------------------------------------------------------------------------------------------------- | ------------- |
| `apps/desktop/src/renderer/components/skill/__tests__/interview-widgets/SingleSelectChips.test.tsx`   | W-SS-01〜06   |
| `apps/desktop/src/renderer/components/skill/__tests__/interview-widgets/MultiSelectCheckbox.test.tsx` | W-MC-01〜06   |
| `apps/desktop/src/renderer/components/skill/__tests__/interview-widgets/FreeTextInput.test.tsx`       | W-FT-01〜05   |
| `apps/desktop/src/renderer/components/skill/__tests__/interview-widgets/SecretInput.test.tsx`         | W-SI-01〜06   |
| `apps/desktop/src/renderer/components/skill/__tests__/interview-widgets/ConfirmButtons.test.tsx`      | W-CB-01〜05   |
| `apps/desktop/src/renderer/components/skill/__tests__/useInterviewState.test.ts`                      | UIH-EC-01〜02 |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx`            | INT-01〜05    |
| `apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts`                                         | ICH-01〜03    |

---

## 5. Phase 6完了確認コマンド

```bash
# interview-widgets 全種別テスト実行
pnpm --filter @repo/desktop test --run interview-widgets

# useInterviewState テスト実行
pnpm --filter @repo/desktop test --run useInterviewState

# 統合テスト実行
pnpm --filter @repo/desktop test --run SkillLifecycle.integration

# creatorHandlers テスト実行（全ファイル）
pnpm --filter @repo/desktop test --run creatorHandlers

# 全テスト実行（最終確認）
pnpm --filter @repo/desktop test --run

# 型チェック
pnpm --filter @repo/desktop typecheck
```

---

## 補足: Phase 4テストマトリクスとの対応関係

本ドキュメントのテストケースはPhase 4テストマトリクスの補完であり、Phase 4テストケース（T-01〜T-20）を置き換えるものではない。

| Phase 4テストID                                     | Phase 6での補完                                                   |
| --------------------------------------------------- | ----------------------------------------------------------------- |
| T-07（ConversationalInterview 全5種別レンダリング） | W-SS / W-MC / W-FT / W-SI / W-CB で各widget単体の詳細ケースを追加 |
| T-08〜T-12（各widget既存テスト）                    | W-XX シリーズで異常系・インタラクションを追加                     |
| T-03/T-04（MINOR修正チャンネル移管）                | ICH-01〜03 でMainプロセス側の呼び出し確認を追加                   |
| T-01/T-02（skillLifecycleルート確認）               | INT-01〜05 で統合レベルの詳細ケースを追加                         |

---

## 参照ドキュメント

- Phase 2 設計書: `outputs/phase-2/design-document.md`
- Phase 4 テストマトリクス: `outputs/phase-4/test-matrix.md`
- Phase 5 実装記録: `outputs/phase-5/implementation-record.md`
