# TASK-UI-02 Phase 4: テストマトリクス

作成日: 2026-04-06
担当フェーズ: Phase 4（テスト仕様）

---

## 概要

本ドキュメントは TASK-UI-02「ConversationPanel 孤立解消」の実装（Phase 5）に先立つテスト仕様書である。
実際のテストコードは含まない。テストケースの一覧・削除対象・修正対象・ファイル構成・fail-first確認手順を定義する。

**前提**:

- 統合方針: `ConversationalInterview` を正本として採用。`SkillCreatorConversationPanel` を廃止（統合）。
- IPC正本: Runtime IPC（`creatorHandlers.ts` 系）を採用。Session IPC を廃止。
- MINOR修正: `CONFIGURE_API` / `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` の 2 チャンネルハンドラーを `creatorHandlers.ts` へ移管。
- ゲート: MINOR PASS（Phase 3 ゲートドキュメント参照）

---

## 1. AC 対応テストケース一覧

### 受入条件（AC）の定義（Phase 3 ゲートより）

| AC   | 内容                                                                             |
| ---- | -------------------------------------------------------------------------------- |
| AC-1 | `ConversationalInterview` が `skillLifecycle` ルート経由で到達可能であること     |
| AC-2 | Runtime IPC が正本として機能し、Session IPC は完全に廃止されていること           |
| AC-3 | 廃止コンポーネント群が削除され、`interview-widgets` が代替として機能していること |
| AC-4 | デモ HTML / ハーネス TSX が削除され、Vite ビルドエントリからも除去されていること |
| AC-5 | 削除・修正後にテストスイート全体が pass していること（既存テストの維持）         |

---

### テストケース一覧

| テストID | AC   | テストファイルパス（予定）                                                                                    | テスト内容                                                                                                                                                   | テスト種別 | fail-first?                               |
| -------- | ---- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ----------------------------------------- |
| T-01     | AC-1 | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`（既存）                   | `case "skillLifecycle":` ルートが `SkillLifecyclePanel` をレンダリングし、`ConversationalInterview` がマウントされることを確認                               | UT         | no（既存 pass）                           |
| T-02     | AC-1 | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx`（既存）            | skillLifecycle ビューから `ConversationalInterview` への到達経路が統合レベルで機能することを確認                                                             | 統合       | no（既存 pass）                           |
| T-03     | AC-2 | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts`（既存・拡張）                                   | `CONFIGURE_API` チャンネルのハンドラーが `creatorHandlers.ts` の `registerSkillCreatorHandlers()` 内に登録されていることを確認                               | UT         | yes（移管前は fail）                      |
| T-04     | AC-2 | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts`（既存・拡張）                                   | `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` チャンネルのハンドラーが `creatorHandlers.ts` に登録されていることを確認                                           | UT         | yes（移管前は fail）                      |
| T-05     | AC-2 | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts`（既存）                           | Session IPC チャンネル（`START_SESSION`, `ANSWER`）が `main/ipc/index.ts` に登録されていないことを確認（登録テーブルに存在しない）                           | UT         | yes（廃止前は fail）                      |
| T-06     | AC-2 | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorIpcBridge.test.ts`（既存・修正）                | `SkillCreatorIpcBridge` が Session IPC チャンネルのハンドラーを持たないことを確認（Session IPC 部分のテストケースを削除した後も残りのテストが pass）         | UT         | yes（部分削除前は fail 対象ケースが存在） |
| T-07     | AC-3 | `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.test.tsx`（既存）               | `renderInputWidget()` が `single_select` / `multi_select` / `free_text` / `secret` / `confirm` の全 5 種別をレンダリングすること（既存カバレッジの維持）     | UT         | no（既存 pass）                           |
| T-08     | AC-3 | `apps/desktop/src/renderer/components/skill/__tests__/interview-widgets/SingleSelectChips.test.tsx`（既存）   | `SingleSelectChips` が単一選択 UI を正しくレンダリング・操作できることを確認                                                                                 | UT         | no（既存 pass）                           |
| T-09     | AC-3 | `apps/desktop/src/renderer/components/skill/__tests__/interview-widgets/MultiSelectCheckbox.test.tsx`（既存） | `MultiSelectCheckbox` が複数選択 UI を正しくレンダリング・操作できることを確認                                                                               | UT         | no（既存 pass）                           |
| T-10     | AC-3 | `apps/desktop/src/renderer/components/skill/__tests__/interview-widgets/FreeTextInput.test.tsx`（既存）       | interview-widgets 版 `FreeTextInput`（制御コンポーネント）が正しく機能することを確認                                                                         | UT         | no（既存 pass）                           |
| T-11     | AC-3 | `apps/desktop/src/renderer/components/skill/__tests__/interview-widgets/SecretInput.test.tsx`（既存）         | `SecretInput` がシークレット値入力 UI として機能することを確認                                                                                               | UT         | no（既存 pass）                           |
| T-12     | AC-3 | `apps/desktop/src/renderer/components/skill/__tests__/interview-widgets/ConfirmButtons.test.tsx`（既存）      | `ConfirmButtons` が confirm 種別の選択 UI として機能することを確認                                                                                           | UT         | no（既存 pass）                           |
| T-13     | AC-3 | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreatorResultPanel.test.tsx`（移動後）             | `SkillCreatorResultPanel` が `components/skill/` ディレクトリに移動された後、import パスを更新した状態で既存テストが pass することを確認                     | UT         | yes（移動前は import パスエラー）         |
| T-14     | AC-3 | （静的解析・grep）                                                                                            | `SkillCreatorConversationPanel` への参照が renderer コード全体から消えていることを確認（`SkillCreatorConversationPanel` の import が 0 件）                  | 静的確認   | yes（削除前は検出される）                 |
| T-15     | AC-4 | （静的解析・grep）                                                                                            | `phase11-skill-creator-conversation-ui` の参照が `electron.vite.config.ts` のビルドエントリから消えていることを確認                                          | 静的確認   | yes（削除前は検出される）                 |
| T-16     | AC-4 | （静的解析・grep）                                                                                            | `skillCreatorSessionAPI` の参照が `preload/index.ts` および `preload/types.ts` から消えていることを確認                                                      | 静的確認   | yes（廃止前は検出される）                 |
| T-17     | AC-5 | `apps/desktop/src/renderer/components/skill/__tests__/useInterviewState.test.ts`（既存）                      | `useInterviewState` フックの既存テスト全件が変更なしで pass することを確認                                                                                   | UT         | no（既存 pass）                           |
| T-18     | AC-5 | `apps/desktop/src/renderer/components/skill/__tests__/InterviewProgressBar.test.tsx`（既存）                  | `InterviewProgressBar` の既存テストが pass することを確認                                                                                                    | UT         | no（既存 pass）                           |
| T-19     | AC-5 | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.*.test.ts`（既存群）                                     | creatorHandlers 関連の既存テスト群（adapterStatus / applyImprovement / fire-and-forget / sessionResume）が変更後も全 pass することを確認                     | UT         | no（既存 pass）                           |
| T-20     | AC-5 | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.*.test.tsx`（既存群）               | `SkillLifecyclePanel` 関連の既存テスト群（adapter-status / auth-regression / error-persistence / llm-generation / test.tsx）が変更後も全 pass することを確認 | UT         | no（既存 pass）                           |

---

### fail-first 対象テストケースの要件詳細

以下のテストケースは、実装 **前** に実行した時点で fail することを確認（fail-first）し、実装 **後** に pass に変わることで実装の正しさを検証する。

#### T-03 / T-04: `CONFIGURE_API` / `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` の creatorHandlers.ts 移管

**失敗条件（実装前）**:

- `creatorHandlers.ts` を開いて `CONFIGURE_API` / `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` のハンドラー登録箇所を検索しても 0 件

**合格条件（実装後）**:

- `registerSkillCreatorHandlers()` 内に当該チャンネルのハンドラーが登録されており、テストから invoke して Main 側の処理が呼ばれることを確認

#### T-05: Session IPC チャンネル廃止の確認

**失敗条件（実装前）**:

- `main/ipc/index.ts` に `SkillCreatorIpcBridge` の登録コードが残存しており、`START_SESSION` / `ANSWER` チャンネルが依然として登録されている

**合格条件（実装後）**:

- `START_SESSION` / `ANSWER` チャンネルが `main/ipc/index.ts` に存在しない

#### T-06: `SkillCreatorIpcBridge.test.ts` の Session IPC 部分削除後の整合

**失敗条件（実装前）**:

- Session IPC 専用テストケースが残存しているが、対応するハンドラーが削除されているため fail

**合格条件（実装後）**:

- Session IPC テストケースが削除され、残存する非 Session IPC テストケースが全 pass

#### T-13: `SkillCreatorResultPanel.test.tsx` の移動後 import パス整合

**失敗条件（実装前）**:

- テストファイルが `components/skill-creator/__tests__/` に残存しており、移動後の `components/skill/` パスを参照するよう更新していないため import エラー

**合格条件（実装後）**:

- テストファイルが `components/skill/__tests__/` に移動し、import パスが `../SkillCreatorResultPanel` に更新されて pass

---

## 2. 削除対象テストファイル

Phase 2 設計書「1-1. 削除対象ファイル一覧 / テストファイル」および「6-1. 変更によって影響を受ける既存テストファイル」の記載に基づく。

| テストファイルパス                                                                                    | 削除理由                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/SkillCreatorConversationPanel.test.tsx` | テスト対象コンポーネント（`SkillCreatorConversationPanel`）が廃止されるため                                                                   |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/QuestionCard.test.tsx`                  | テスト対象コンポーネント（`QuestionCard`）が廃止されるため                                                                                    |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/ChoiceButton.test.tsx`                  | テスト対象コンポーネント（`ChoiceButton`）が廃止されるため                                                                                    |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/FreeTextInput.test.tsx`                 | テスト対象コンポーネント（skill-creator 版 `FreeTextInput`）が廃止されるため。interview-widgets 版のテストは別途存在し、引き続き維持される    |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/ConversationProgress.test.tsx`          | テスト対象コンポーネント（`ConversationProgress`）が廃止されるため。代替の `InterviewProgressBar.test.tsx` は `skill/__tests__/` に維持される |

**注意**: `SkillCreatorResultPanel.test.tsx` は廃止ではなく **移動・修正** の対象（次節参照）。

---

## 3. 修正対象テストファイル

以下のテストファイルは削除ではなく、import パスの更新または一部テストケースの削除が必要。

| テストファイルパス                                                                              | 変更種別                   | 変更内容の概要                                                                                                                                                                                                                                                                                                               |
| ----------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/SkillCreatorResultPanel.test.tsx` | 移動 + import パス更新     | ファイルを `apps/desktop/src/renderer/components/skill/__tests__/SkillCreatorResultPanel.test.tsx` へ移動し、import パスを `../SkillCreatorResultPanel`（新しい配置先 `components/skill/` を指す）に更新する                                                                                                                 |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorIpcBridge.test.ts`                | 一部テストケース削除       | Session IPC チャンネル（`START_SESSION`, `ANSWER`）を対象としたテストケースを削除する。`CONFIGURE_API` / `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` のハンドラーが `creatorHandlers.ts` へ移管されることにより、これら 2 チャンネルに関するテストも `SkillCreatorIpcBridge.test.ts` から `creatorHandlers.test.ts` へ移動する |
| `apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts`                                   | テストケース追加           | `CONFIGURE_API` および `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` のハンドラーが `registerSkillCreatorHandlers()` で登録されていることを検証するテストケースを追加する（T-03 / T-04 に対応）                                                                                                                                  |
| `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts`                     | テストケース追加または確認 | Session IPC チャンネルが `main/ipc/index.ts` に登録されていないことを検証するテストケースを追加または既存カバレッジを確認する（T-05 に対応）                                                                                                                                                                                 |

---

## 4. テストファイル構成（予定）

実装（Phase 5）完了後の最終的なテストファイル構成を示す。

### `apps/desktop/src/renderer/components/skill/__tests__/`（既存・変更なし）

```
ConversationalInterview.test.tsx          ← 変更なし（正本として維持）
InterviewProgressBar.test.tsx             ← 変更なし
useInterviewState.test.ts                 ← 変更なし
SkillCreatorResultPanel.test.tsx          ← skill-creator/__tests__/ から移動・import パス更新
SkillLifecyclePanel.test.tsx              ← 変更なし
SkillLifecyclePanel.adapter-status.test.tsx  ← 変更なし
SkillLifecyclePanel.auth-regression.test.tsx ← 変更なし
SkillLifecyclePanel.error-persistence.test.tsx ← 変更なし
SkillLifecyclePanel.llm-generation.test.tsx  ← 変更なし
SkillLifecycle.integration.test.tsx       ← 変更なし
interview-widgets/
  SingleSelectChips.test.tsx              ← 変更なし
  MultiSelectCheckbox.test.tsx            ← 変更なし
  FreeTextInput.test.tsx                  ← 変更なし（interview-widgets 版）
  SecretInput.test.tsx                    ← 変更なし
  ConfirmButtons.test.tsx                 ← 変更なし
（その他既存テストファイル群）             ← 変更なし
```

### `apps/desktop/src/renderer/components/skill-creator/__tests__/`（削除後）

```
（ディレクトリごと削除）
```

Phase 2 設計書「2-6」の通り、`skill-creator/` ディレクトリ自体が廃止される予定のため、`__tests__/` サブディレクトリも含めて削除される。

### `apps/desktop/src/main/services/runtime/__tests__/`

```
SkillCreatorIpcBridge.test.ts             ← Session IPC ケースを削除（部分修正）
（その他 RuntimeSkillCreatorFacade.*.test.ts 群）  ← 変更なし
```

### `apps/desktop/src/main/ipc/__tests__/`

```
creatorHandlers.test.ts                   ← CONFIGURE_API / SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED ケース追加
skillCreatorHandlers.security.test.ts     ← Session IPC 廃止確認ケース追加
skillCreatorHandlers.runtime.test.ts      ← 変更なし
skillCreatorHandlers.validation.test.ts   ← 変更なし
skillCreatorIpc.integration.test.ts       ← 変更なし（Session IPC 依存がなければ）
creatorHandlers.adapterStatus.test.ts     ← 変更なし
creatorHandlers.applyImprovement.test.ts  ← 変更なし
creatorHandlers.fire-and-forget.test.ts   ← 変更なし
creatorHandlers.sessionResume.test.ts     ← 変更なし
```

---

## 5. fail-first 確認手順

### 事前確認: 現時点での全テスト pass 状態の記録

```bash
# 全テスト実行（現時点でのベースライン）
cd /path/to/AIWorkflowOrchestrator/.worktrees/task-20260406-175010-wt-8
pnpm --filter @repo/desktop test --run 2>&1 | tee /tmp/phase4-baseline.log
```

### fail-first 確認: 実装前に期待 fail を確認

以下は実装（Phase 5）**開始前**に実行し、T-03 / T-04 / T-05 が fail することを確認するコマンド。

```bash
# T-03 / T-04: CONFIGURE_API / SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED 移管確認
# creatorHandlers.ts にハンドラーが存在しないことを確認（実装前は grep 結果 0 件）
grep -n "CONFIGURE_API\|SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED" \
  apps/desktop/src/main/ipc/creatorHandlers.ts || echo "【期待通り: 未移管】"

# T-05: Session IPC チャンネル廃止前確認（実装前は SkillCreatorIpcBridge の登録コードが残存）
grep -n "SkillCreatorIpcBridge\|registerSkillCreatorIpcBridge" \
  apps/desktop/src/main/ipc/index.ts && echo "【期待通り: 廃止前に登録あり】"

# T-14: SkillCreatorConversationPanel 参照確認（実装前は参照が存在する）
grep -rn "SkillCreatorConversationPanel" \
  apps/desktop/src/renderer/ --include="*.tsx" --include="*.ts" \
  | grep -v "__tests__" | grep -v ".test."

# T-15: Vite エントリポイント確認（実装前は登録されている）
grep -n "phase11-skill-creator-conversation-ui" \
  apps/desktop/electron.vite.config.ts && echo "【期待通り: 廃止前に登録あり】"

# T-16: skillCreatorSessionAPI 残存確認（実装前は残存）
grep -n "skillCreatorSessionAPI" \
  apps/desktop/src/preload/index.ts && echo "【期待通り: 廃止前に参照あり】"
```

### 実装後確認: 全テスト pass を検証

```bash
# デスクトップアプリのテスト全件実行
pnpm --filter @repo/desktop test --run

# 特定テストファイルのみ実行（修正・移動したファイルの確認）
pnpm --filter @repo/desktop test --run \
  creatorHandlers.test.ts \
  SkillCreatorIpcBridge.test.ts \
  SkillCreatorResultPanel.test.tsx \
  ConversationalInterview.test.tsx

# 静的確認: 廃止ファイルの参照が 0 件であることを確認
grep -rn "SkillCreatorConversationPanel\|skillCreatorSessionAPI\|phase11-skill-creator-conversation-ui" \
  apps/desktop/src/ --include="*.tsx" --include="*.ts" \
  | grep -v ".test." || echo "【合格: 参照なし】"

# interview-widgets 全種別のテスト実行
pnpm --filter @repo/desktop test --run interview-widgets
```

### 型チェック（実装後）

```bash
pnpm --filter @repo/desktop typecheck
```

### lint（実装後）

```bash
pnpm --filter @repo/desktop lint
```

---

## 付録: テストカバレッジマッピング

### interview-widgets 5 種別のカバレッジ確認表

| 種別            | 廃止コンポーネント（QuestionCard 内）                                                | 代替コンポーネント                   | 既存テストファイル                               |
| --------------- | ------------------------------------------------------------------------------------ | ------------------------------------ | ------------------------------------------------ |
| `single_select` | `QuestionCard`（default ブランチ）+ `ChoiceButton`                                   | `SingleSelectChips`                  | `interview-widgets/SingleSelectChips.test.tsx`   |
| `multi_select`  | `QuestionCard`（multi_select ブランチ）+ `ChoiceButton`                              | `MultiSelectCheckbox`                | `interview-widgets/MultiSelectCheckbox.test.tsx` |
| `free_text`     | `QuestionCard`（free_text ブランチ）+ skill-creator 版 `FreeTextInput`               | interview-widgets 版 `FreeTextInput` | `interview-widgets/FreeTextInput.test.tsx`       |
| `secret`        | `QuestionCard`（secret ブランチ）+ skill-creator 版 `FreeTextInput`（isSecret=true） | `SecretInput`                        | `interview-widgets/SecretInput.test.tsx`         |
| `confirm`       | `QuestionCard`（confirm ブランチ）+ `ChoiceButton`                                   | `ConfirmButtons`                     | `interview-widgets/ConfirmButtons.test.tsx`      |

### IPC チャンネル移管のカバレッジ確認表

| チャンネル                                       | 移管前の Main 側ハンドラー                    | 移管後の Main 側ハンドラー                                  | テストファイル                                    |
| ------------------------------------------------ | --------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------- |
| `CONFIGURE_API`（`skill-creator:configure-api`） | `SkillCreatorIpcBridge.onConfigureApi()`      | `creatorHandlers.ts` の `registerSkillCreatorHandlers()` 内 | `creatorHandlers.test.ts`（T-03 追加）            |
| `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED`        | `SkillCreatorIpcBridge.onOverwriteApproved()` | `creatorHandlers.ts` の `registerSkillCreatorHandlers()` 内 | `creatorHandlers.test.ts`（T-04 追加）            |
| `START_SESSION`（Session IPC）                   | `SkillCreatorIpcBridge.onStartSession()`      | 廃止                                                        | `SkillCreatorIpcBridge.test.ts`（該当ケース削除） |
| `ANSWER`（Session IPC）                          | `SkillCreatorIpcBridge.onAnswer()`            | 廃止                                                        | `SkillCreatorIpcBridge.test.ts`（該当ケース削除） |
