# TASK-UI-02 Phase 3: 設計レビューゲート

作成日: 2026-04-06
担当フェーズ: Phase 3（設計レビュー）

---

## 概要

本ドキュメントは Phase 2 設計書の妥当性を検証し、Phase 4（テスト作成）への移行可否を判断するゲートドキュメントである。
各確認項目は実際のコードおよびドキュメントを読んだ結果に基づく。

---

## 1. コンポーネント再利用性チェック

### 1-1. QuestionCard等の削除予定コンポーネントの影響範囲確認

削除対象コンポーネントの参照箇所を実際のコードで確認した。

**調査結果**:

`SkillCreatorConversationPanel` の参照箇所:

- `apps/desktop/src/renderer/phase11-skill-creator-conversation-ui.tsx`（ハーネスのみ）
- `apps/desktop/src/renderer/components/skill-creator/__tests__/SkillCreatorConversationPanel.test.tsx`（テストのみ）

`QuestionCard` / `ChoiceButton` / `FreeTextInput`（skill-creator版）/ `ConversationProgress` の参照箇所:

- 全て `SkillCreatorConversationPanel` または当該コンポーネント専用テストファイルのみが参照
- `App.tsx`、`SkillLifecyclePanel.tsx`、その他の本番コンポーネントからは**一切参照されていない**

`SkillCreatorResultPanel` の参照箇所:

- `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx`（line 11、line 285）
- `apps/desktop/src/renderer/components/skill-creator/__tests__/SkillCreatorResultPanel.test.tsx`（テストファイル）

**判定: 影響範囲は自己完結しており、設計通りの削除が安全に実施可能**

削除予定コンポーネントは `skill-creator/` 内部で完結した依存構造を持ち、本番系（`skill/`、`App.tsx`）への漏れ出しがない。

### 1-2. interview-widgetsが代替として機能することの確認

`ConversationalInterview.tsx` のコードを確認した結果、以下が確認された:

| 廃止コンポーネント              | 代替コンポーネント                     | 実装確認                                          |
| ------------------------------- | -------------------------------------- | ------------------------------------------------- |
| `QuestionCard`（single_select） | `SingleSelectChips`                    | `ConversationalInterview.tsx` line 452-460 で確認 |
| `QuestionCard`（multi_select）  | `MultiSelectCheckbox`                  | line 462-470 で確認                               |
| `QuestionCard`（free_text）     | `FreeTextInput`（interview-widgets版） | line 472-480 で確認                               |
| `QuestionCard`（secret）        | `SecretInput`                          | line 482-490 で確認                               |
| `QuestionCard`（confirm）       | `ConfirmButtons`                       | line 492-500 で確認                               |
| `ConversationProgress`          | `InterviewProgressBar`                 | line 284-288 で確認                               |

`renderInputWidget()` 関数が全5種別（`single_select`, `multi_select`, `free_text`, `secret`, `confirm`）を switch 分岐で完全に処理しており、代替として機能することが確認された。

### 1-3. 依存方向の妥当性（共有→固有の方向のみ）

設計書で定義された最終配置先に基づき、依存方向を確認した。

```
変更前:
  skill-creator/ ←→ skill/  （双方向に参照が散在）

変更後:
  skill/ ← SkillLifecyclePanel  （skill/ 内のコンポーネントを SkillLifecyclePanel が使用）
  skill/interview-widgets/ はSkill固有の共有コンポーネント群
```

- `ConversationalInterview` は `skill/interview-widgets/` のコンポーネントのみに依存（下位への一方向）
- `SkillLifecyclePanel` が `ConversationalInterview` を利用する（上位→下位の一方向）
- `SkillCreatorResultPanel` を `skill/` に移動することで、`skill-creator/` への逆参照がなくなる

**判定: 依存方向は共有→固有の一方向に統一され、妥当**

---

## 2. IPC経路整合性確認

### 2-1. Runtime IPCを正本とする判断の確認

実際のコード確認によりRuntime IPCが正本であることを再確認した。

`apps/desktop/src/preload/skill-creator-api.ts` で確認された `SkillCreatorAPI` インターフェースは以下を含む:

- `submitUserInput`: `SKILL_CREATOR_SUBMIT_USER_INPUT` チャンネルを使用（invoke型）
- `onWorkflowStateChanged`: `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` チャンネルを使用（on型）
- `onOutputReady`: `SKILL_CREATOR_OUTPUT_READY` チャンネルを使用（on型）
- `confirmOverwrite`: `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` チャンネルを使用（invoke型）
- `openSkill`: `SKILL_CREATOR_OPEN_SKILL` チャンネルを使用（invoke型）

これらはすべて `ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS` によるホワイトリスト制御を経由しており、セキュリティパターンに準拠している。

Main側ハンドラーは `apps/desktop/src/main/ipc/creatorHandlers.ts` で `registerSkillCreatorHandlers()` として登録されており（`index.ts` の `registerSkillCreatorIpcBridge` とは**別系統**で管理）、`SKILL_CREATOR_SUBMIT_USER_INPUT` が creatorHandlers.ts line 355 に、`SKILL_CREATOR_WORKFLOW_STATE_CHANGED` が line 111/119 にそれぞれ登録されていることを確認した。

**判定: Runtime IPCを正本とする判断は適切**

### 2-2. Session IPC廃止の影響チェック（IPC契約チェックリスト観点）

Session IPC廃止により影響を受けるファイルを確認した。

| 影響ファイル                                                                                          | 現状の参照                                                         | 廃止後の対応     |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------- |
| `apps/desktop/src/preload/index.ts` line 595, 641-642, 670-672                                        | `skillCreatorSessionAPI` をimport・exposeInMainWorld・fallback登録 | 3箇所を削除      |
| `apps/desktop/src/preload/types.ts` line 1852                                                         | `skillCreatorSessionAPI: SkillCreatorSessionAPI` の型定義          | 削除             |
| `apps/desktop/src/renderer/phase11-skill-creator-conversation-ui.tsx` line 52, 75                     | `window.skillCreatorSessionAPI` のモック実装                       | ファイルごと削除 |
| `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx`                | `window.skillCreatorSessionAPI` を直接参照                         | ファイルごと削除 |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/SkillCreatorConversationPanel.test.tsx` | `window.skillCreatorSessionAPI` をモック                           | ファイルごと削除 |

`SKILL_CREATOR_SESSION_CHANNELS`（`packages/shared/src/ipc/channels.ts`）の他の利用箇所は `SkillCreatorIpcBridge.ts` のみであり（grep結果で確認）、Bridge廃止後は shared 側のチャンネル定義も参照箇所がゼロになる。ただし shared 側の定義自体は削除の必要性が低いため、設計書通り「削除ではなく残す」判断で問題ない。

**判定: 影響範囲は設計書の記載と一致しており、廃止手順は妥当**

### 2-3. SkillCreatorIpcBridgeのRuntime IPC兼用有無の確認結果

Phase 2設計書で「Phase 3への持ち越し事項」として記載されていた確認事項を実コード（`SkillCreatorIpcBridge.ts`全体）で確認した。

**確認結果**:

`SkillCreatorIpcBridge` が登録するIPCチャンネルは以下の4つのみ:

1. `SKILL_CREATOR_SESSION_CHANNELS.START_SESSION`（Session IPC）
2. `SKILL_CREATOR_SESSION_CHANNELS.ANSWER`（Session IPC）
3. `SKILL_CREATOR_EXTERNAL_API_CHANNELS.CONFIGURE_API`（外部API設定）
4. `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED`（上書き承認）

このうち、チャンネル3と4について追加確認が必要と判断した。

**`CONFIGURE_API`（`skill-creator:configure-api`）について**:

- `preload/skill-creator-api.ts` の `configureExternalApi()` が `IPC_CHANNELS.CONFIGURE_API` を呼ぶ（line 502）
- Runtime IPC側（`skill/SkillLifecyclePanel.tsx`）で `configureExternalApi` が使用されているか確認したところ、`SkillLifecyclePanel` からの直接呼び出しは**確認されなかった**
- `skill/ExternalApiConfigForm.tsx` が存在するが、props経由でコールバックを受け取る設計

**`SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED`について**:

- `preload/skill-creator-api.ts` の `confirmOverwrite()` が `IPC_CHANNELS.SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` を呼ぶ（line 534）
- これはRuntime IPC経由の `SkillCreatorAPI.confirmOverwrite()` から呼ばれる可能性があり、`SkillCreatorIpcBridge` が廃止されると **Renderer側からの上書き承認がMain側で処理されなくなるリスクがある**

**重要な発見**: `SkillCreatorIpcBridge` は「Session IPC専用」ではなく、Runtime IPC経由で使用される `confirmOverwrite` と、外部API設定の `configureExternalApi` のMain側ハンドラーも担当している。Runtime IPCハンドラー（`creatorHandlers.ts`）に `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` と `CONFIGURE_API` のハンドラーが登録されているかどうかを確認したところ、`creatorHandlers.ts` にはこれら2チャンネルのハンドラーは**登録されていない**。

**結論**: `SkillCreatorIpcBridge` をそのまま全廃すると、`confirmOverwrite`（上書き承認）と `configureExternalApi`（外部API設定）が機能しなくなる。

**設計修正が必要（MINOR）**: Session IPCチャンネル（`START_SESSION`, `ANSWER`）の登録のみを廃止し、`CONFIGURE_API` と `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` のハンドラーは維持するか、`creatorHandlers.ts` に移管する。

### 2-4. セキュリティパターン準拠確認

`preload/skill-creator-api.ts` の実装を確認した。

- `safeInvoke()`: `ALLOWED_INVOKE_CHANNELS` によるホワイトリスト制御あり（line 370-371）
- `safeOn()`: `ALLOWED_ON_CHANNELS` によるホワイトリスト制御あり（line 409-411）
- `invokeWithTimeout()` ユーティリティを経由（タイムアウト制御あり）
- Main側 `SkillCreatorIpcBridge.ts` の `assertSender()`: `event.sender.id !== this.window.webContents.id` チェックあり（line 501-505）

Runtime IPC主系（`creatorHandlers.ts`）もセキュリティパターンが準拠していることを、既存テスト（`creatorHandlers.test.ts`、`skillCreatorHandlers.runtime.test.ts`）の存在から確認した。

**判定: セキュリティパターン準拠は確認済み**

---

## 3. ナビゲーション契約準拠確認

### 3-1. App.tsxの変更不要という判断の妥当性

`App.tsx` を実際に確認した結果:

- `SkillCreatorConversationPanel` は `App.tsx` のいずれの箇所にも**import されておらず、ルート定義にも存在しない**（grep結果で確認）
- `ConversationalInterview` は `App.tsx` に直接インポートされておらず、`SkillLifecyclePanel` 経由でのみ参照される
- `SkillLifecyclePanel` は `case "skillLifecycle":` ルート（line 344-350）と `renderAdvancedSkillCenterView()` 内（line 387-393）の2箇所で正常にマウントされている

**判定: App.tsx変更不要という判断は妥当**

`SkillCreatorConversationPanel` がもともとApp.tsxに接続されていないため、廃止してもナビゲーション契約への影響はゼロである。

### 3-2. ConversationalInterviewへの到達性確認

実際の到達経路を確認した。

```
App.tsx
  └── case "skillLifecycle": → SkillLifecyclePanel
          └── ConversationalInterview（SkillLifecyclePanel line 1738 にマウント確認済み）
```

- `SkillLifecyclePanel` は `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` として存在
- `ConversationalInterview` は `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` として存在
- `useInterviewState` フック、`InterviewProgressBar`、`interview-widgets/` サブコンポーネントも全て `skill/` ディレクトリに存在

**判定: ConversationalInterviewへの到達性は確認済み。本番接続済み。**

### 3-3. TASK-UI-01との矛盾がないことの確認

TASK-UI-01は「SkillLifecyclePanelの一次導線昇格」を担当しており、最新コミット（`e13170bdd`）で完了済みである。

App.tsx の確認結果:

- `case "skillLifecycle":` のルートが既に `SkillLifecyclePanel` を指している
- `normalizeSkillLifecycleView()` が skillLifecycle関連のビュー正規化を担当
- `dockCurrentView` の計算で `currentView === "skillLifecycle"` → `"skillCenter"` に正規化されている（ドック表示用）

TASK-UI-01で導入されたルート昇格は `SkillLifecyclePanel` → `ConversationalInterview` の経路を使用しており、TASK-UI-02の設計（`ConversationalInterview` を正本として維持、App.tsx変更不要）と**矛盾しない**。

**判定: TASK-UI-01との矛盾なし**

---

## 4. AC対応確認

| AC   | 設計での対応                                                                                                                                                                                                                                | 検証可能性                                                                                                                  | 判定                                                                              |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| AC-1 | `ConversationalInterview`（正本）を維持し、`SkillCreatorConversationPanel`（孤立）を廃止する設計が明確化されている。`ConversationalInterview` は `SkillLifecyclePanel` 経由で本番接続済みであり、正式ルートを持つ                           | 手動テスト: `skillLifecycle` ビューで `ConversationalInterview` が表示されることを確認 / UT: `App.tsx` のルーティングテスト | PASS                                                                              |
| AC-2 | Runtime IPC（`skill-creator-api.ts`）を正本とし、Session IPC（`skill-creator-session-api.ts`）を廃止する設計が明確化されている。設計書セクション3に根拠・削除対象ファイルが列挙されている                                                   | 設計レビュー: 本ゲートで確認 / UT: Session IPCチャンネルの削除後にRuntime IPC経由で正常動作することをテスト                 | PASS（ただし2-3の修正反映が前提）                                                 |
| AC-3 | 廃止対象（`QuestionCard`, `ChoiceButton`, `FreeTextInput`(skill-creator版), `ConversationProgress`）と採用対象（`interview-widgets/`各種）の整理が設計書セクション2に明確に記載されている。`SkillCreatorResultPanel` の移動先も確定している | コードレビュー: 設計書2-6「最終配置先ディレクトリ」と実際のファイル削除・移動が一致することを確認                           | PASS                                                                              |
| AC-4 | 削除対象ファイルの一覧が設計書セクション1、3、5に列挙されている。Viteビルドエントリ（`electron.vite.config.ts` line 75-78）の `phase11-skill-creator-conversation-ui` 削除も確認が必要                                                      | grep検索: 実装後に `phase11-skill-creator-conversation-ui` と `skillCreatorSessionAPI` が全コードから消えることで確認       | PASS（Viteエントリ削除対応を含むこと）                                            |
| AC-5 | 廃止コンポーネントのテスト削除リスト、`SkillCreatorResultPanel.test.tsx` の移動・修正方針、`SkillCreatorIpcBridge.test.ts` の Session IPC部分削除方針が設計書セクション6に記載されている                                                    | `pnpm test` 実行: 実装後に全テストがpassすることを確認                                                                      | PASS（2-3のMINOR修正で `SkillCreatorIpcBridge` の整理方針が明確になることが前提） |

---

## 5. ゲート判定

### 判定: **MINOR**

### 根拠

Phase 2設計書は全体として論理的に整合しており、主要な設計判断（Runtime IPC正本採用、統合方針、コンポーネント廃止/維持の区分）は適切である。ナビゲーション契約への影響もなく、TASK-UI-01との矛盾もない。

ただし、Phase 3の確認（2-3: `SkillCreatorIpcBridge` のRuntime IPC兼用有無の確認）において、**設計書が見落としていた影響範囲**が1件発見された。

### 発見されたMINOR修正事項

**修正事項**: `SkillCreatorIpcBridge` の廃止方針の精緻化

**現状の設計書記載（Phase 2セクション3-2, 3-3）**:

> `apps/desktop/src/main/ipc/index.ts` の `SkillCreatorIpcBridge` 登録コード（line 1078-1086）を削除。Session IPC ハンドラー部分のみ削除。

**発見された問題**:
`SkillCreatorIpcBridge` は Session IPCチャンネル（`START_SESSION`, `ANSWER`）に加え、以下も登録している:

- `CONFIGURE_API`（`skill-creator:configure-api`）: Runtime IPC経由の `configureExternalApi()` が Main側で処理されるのはこのハンドラー
- `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED`: Runtime IPC経由の `confirmOverwrite()` が Main側で処理されるのはこのハンドラー

`creatorHandlers.ts` にはこれら2チャンネルのハンドラーが存在しないため、`SkillCreatorIpcBridge` を丸ごと廃止すると上書き承認と外部API設定が機能不全に陥る。

**必要な修正内容**:
Phase 5（実装）開始前に、Phase 2設計書セクション3-2および3-3の記載を以下のいずれかに更新すること:

**選択肢A（推奨）**: `SkillCreatorIpcBridge` を段階的に廃止する。Session IPCチャンネル（`START_SESSION`, `ANSWER`）の登録のみを削除し、`CONFIGURE_API` と `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` のハンドラーは `creatorHandlers.ts` へ移管する。

**選択肢B**: `SkillCreatorIpcBridge` のクラス自体は維持しつつ、Session IPCに関係するメソッド（`onStartSession`, `onAnswer`, `emitQuestionReceived`, `emitSessionComplete`, `emitSessionError`）を削除する。ただし `onConfigureApi` と `onOverwriteApproved` は維持する。

この修正は Phase 2設計書の**更新（セクション3-2, 3-3の追記）**で対応可能であり、設計全体の差し戻しを要するものではない。

### 次のステップ

本判定（MINOR）を受けて、以下の手順で Phase 4 に進む:

1. Phase 2設計書セクション3-2および3-3に `CONFIGURE_API` / `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` ハンドラーの扱いを追記する（または本ゲートドキュメントをその代替記録として参照する）
2. Phase 4（テスト作成）の `test-matrix.md` に、`CONFIGURE_API` / `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` の移管先ハンドラーを検証するテストケースを追加する
3. Phase 5（実装）で選択肢A/Bのいずれかを採用してハンドラー移管を実施する

---

## 付録: Phase 3 持ち越し事項の確認結果

Phase 2設計書セクション7に記載された全確認事項の調査結果。

| 確認事項                                                       | 確認対象                                     | 確認結果                                                                                                                                                                          |
| -------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ハーネスのViteエントリポイント登録                             | `apps/desktop/electron.vite.config.ts`       | **登録されている**。`phase11-skill-creator-conversation-ui` が line 75-78 でビルドエントリに含まれている。削除対象                                                                |
| `SkillCreatorIpcBridge` のRuntime IPC兼用                      | `SkillCreatorIpcBridge.ts` 全体              | **兼用している**（`CONFIGURE_API`, `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED`）。本文2-3参照                                                                                       |
| `SkillLifecyclePanel` の `onOutputReady` 処理                  | `SkillLifecyclePanel.tsx`                    | `SkillCreationResultPanel`（別コンポーネント）が存在し、`SkillLifecyclePanel` から使用されている（line 74, 1906）。`SkillCreatorResultPanel`（skill-creator版）の移植は不要と確認 |
| `SKILL_CREATOR_SESSION_CHANNELS` の他利用箇所                  | `packages/shared/src/ipc/channels.ts` + grep | `SkillCreatorIpcBridge.ts` のみが参照。他の参照なし。shared側定義は削除不要                                                                                                       |
| E2Eテストでの `__PHASE11_SKILL_CREATOR_CONVERSATION_UI__` 利用 | 全体grep                                     | `phase11-skill-creator-conversation-ui.tsx` 内でのみ定義・使用。E2Eテストでの利用は確認されなかった                                                                               |

**補足（SkillCreatorResultPanel移植不要の根拠）**: `SkillLifecyclePanel` はすでに `SkillCreationResultPanel`（`components/skill/SkillCreationResultPanel.tsx`）を利用している。このコンポーネントは `plan`, `execute`, `verify` 結果を表示するRuntime IPC専用の結果パネルであり、`SkillCreatorResultPanel`（Session IPC時代のスキル出力プレビュー）とは別物である。ただし `SkillCreatorResultPanel` 自体は独立したUIコンポーネントとして設計書通り `skill/` ディレクトリへ移動して維持する方針は変わらない。
