# TASK-UI-02 Phase 2: 設計書

作成日: 2026-04-06
担当フェーズ: Phase 2（設計）

---

## 概要

本設計書は、Phase 1の分析結果を踏まえ、`SkillCreatorConversationPanel`（孤立コンポーネント）を廃止し、`ConversationalInterview`（正本コンポーネント）への統合を実施するための詳細設計をまとめる。

**統合方針**: `ConversationalInterview` を正本として採用し、`SkillCreatorConversationPanel` およびその依存コンポーネント群を廃止する。

---

## 1. 統合設計

### 1-1. 削除対象ファイル一覧

以下のファイルは `SkillCreatorConversationPanel` が唯一の利用箇所であり、統合後は不要となる。

#### Renderer コンポーネント

| ファイルパス                                                                           | 削除理由                                                                                                                                        |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx` | 孤立コンポーネント本体。App.tsx未接続、Phase 11ハーネスのみから参照                                                                             |
| `apps/desktop/src/renderer/components/skill-creator/QuestionCard.tsx`                  | `SkillCreatorConversationPanel` 専用。`ConversationalInterview` は `renderInputWidget()` 関数で代替済み                                         |
| `apps/desktop/src/renderer/components/skill-creator/ChoiceButton.tsx`                  | `QuestionCard` 専用。`ConversationalInterview` は `SingleSelectChips` / `MultiSelectCheckbox` / `ConfirmButtons` で代替済み                     |
| `apps/desktop/src/renderer/components/skill-creator/FreeTextInput.tsx`                 | `QuestionCard` 専用（非制御コンポーネント版）。`ConversationalInterview` は `interview-widgets/FreeTextInput`（制御コンポーネント版）で代替済み |
| `apps/desktop/src/renderer/components/skill-creator/ConversationProgress.tsx`          | `SkillCreatorConversationPanel` 専用。`ConversationalInterview` は `InterviewProgressBar` で代替済み                                            |
| `apps/desktop/src/renderer/components/skill-creator/SkillCreatorResultPanel.tsx`       | 詳細は後述（「移植が必要なもの」参照）                                                                                                          |

#### ハーネスファイル

| ファイルパス                                                          | 削除理由                                                                           |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/phase11-skill-creator-conversation-ui.tsx` | `SkillCreatorConversationPanel` 専用の視覚確認ハーネス。コンポーネント廃止後は不要 |

#### テストファイル

| ファイルパス                                                                                          | 削除理由                                                                        |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/SkillCreatorConversationPanel.test.tsx` | テスト対象コンポーネントが廃止されるため                                        |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/QuestionCard.test.tsx`                  | テスト対象コンポーネントが廃止されるため                                        |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/ChoiceButton.test.tsx`                  | テスト対象コンポーネントが廃止されるため                                        |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/FreeTextInput.test.tsx`                 | テスト対象コンポーネントが廃止されるため（interview-widgets版テストは別途存在） |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/ConversationProgress.test.tsx`          | テスト対象コンポーネントが廃止されるため                                        |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/SkillCreatorResultPanel.test.tsx`       | `SkillCreatorResultPanel` の扱いに連動（後述）                                  |

### 1-2. ConversationalInterviewへの機能移植が必要なもの

Phase 1の比較分析で `SkillCreatorConversationPanel` の「固有機能」として識別された機能のうち、移植要否を判断する。

#### A. 「その他（自由入力）」オプション — 移植不要（廃止）

`QuestionCard.tsx` の `FREE_TEXT_ID` 機能は、選択肢リストに「その他（自由入力）」エントリを動的に追加する機能。

**判断: 移植不要**

根拠:

- Runtime IPCの `SkillCreatorUserInputRequest` の `options` フィールドは Main 側が生成するデータであり、「その他」オプションはサーバーサイドで選択肢として明示的に定義できる
- `ConversationalInterview` の `SingleSelectChips` および `MultiSelectCheckbox` は、Mainから受信した選択肢をそのままレンダリングする設計であり、クライアントサイドでの選択肢注入は責務の混在を招く
- 既存の本番フロー（`SkillLifecyclePanel` → `ConversationalInterview`）でこの機能が不要とされており、現在も問題なく動作していることが確認されている

#### B. 完了後のSkillCreatorResultPanel表示 — SkillLifecyclePanelへ移譲

`SkillCreatorConversationPanel` はセッション完了後に `SkillCreatorResultPanel` を自身の画面内に表示し、スキル出力プレビュー・上書き確認UIを提供していた。

**判断: `SkillLifecyclePanel` への移譲（コンポーネント自体は維持）**

根拠:

- `SkillLifecyclePanel.tsx` はすでに `skillCreatorApi.onOutputReady` の受信を担当しているが（Phase 1分析より）、結果表示UIは独自の実装が必要か、`SkillCreatorResultPanel` を移植して利用するかを後続のPhase 3（実装フェーズ）で確認する
- `SkillCreatorResultPanel.tsx` は `SkillCreatorConversationPanel` への直接依存がなく、独立したコンポーネントとして設計されている（props: `payload`, `onOpenSkill`, `onConfirmOverwrite` を受け取るだけの純粋UIコンポーネント）
- よって `SkillCreatorResultPanel.tsx` は **廃止せず、移動先を変更する**（後述の「最終配置先」参照）

#### C. 完了/エラーの自己表示（terminalState管理） — 移植不要

`SkillCreatorConversationPanel` は `terminalState: "complete" | "error"` を自身で保持し、完了/エラー時に画面全体を切り替えていた。

**判断: 移植不要**

根拠:

- Runtime IPC方式では `workflowSnapshot.currentPhase` の変化を親コンポーネント（`SkillLifecyclePanel`）が監視し、インタビューフェーズの終了を検知する
- `ConversationalInterview` は意図的に「完了状態の自己表示を持たない」設計であり、これは責務分離の観点から正しい
- エラー表示は `onError` コールバックで親に委譲する現行設計を維持する

### 1-3. 変更が必要な既存コードの一覧

| ファイルパス                                                                     | 変更内容                                                                                                                                                                 |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/desktop/src/preload/index.ts`                                              | `skillCreatorSessionAPI` の `contextBridge.exposeInMainWorld` 呼び出し（line 640-643）および fallback ブロック（line 668-672）を削除する                                 |
| `apps/desktop/src/preload/skill-creator-session-api.ts`                          | ファイルごと削除（後述の「Session IPC廃止」参照）。`index.ts` からのimportも削除                                                                                         |
| `apps/desktop/src/main/ipc/index.ts`                                             | `SkillCreatorIpcBridge` の登録コード（line 1078-1086）を削除。ただし Main 側のSession IPCハンドラーが `SkillCreatorIpcBridge` のみで実装されている場合は慎重に確認が必要 |
| `apps/desktop/src/renderer/components/skill-creator/SkillCreatorResultPanel.tsx` | 移動: `skill-creator/` から `skill/` ディレクトリへ移動。インポートパスを更新                                                                                            |

---

## 2. 共有コンポーネント抽出設計

### 2-1. QuestionCard.tsx の扱い — 廃止

`QuestionCard.tsx` は `SkillCreatorConversationPanel` からのみ利用されており、機能的な対応物が `ConversationalInterview` の `renderInputWidget()` 関数として実装済みである。

**判断: 廃止**

根拠:

- `renderInputWidget()` は `single_select`, `multi_select`, `free_text`, `secret`, `confirm` の全種別を `interview-widgets` の専用コンポーネントで処理している
- `QuestionCard` が持つ「ヘッダー表示（title / prompt / reason）」の機能は、`ConversationalInterview` ではチャット形式のアシスタントメッセージ（`msg.inputRequest.title`）として表示される設計で代替されている
- 「その他（自由入力）」オプション機能は前述の通り移植不要と判断

### 2-2. FreeTextInput（同名・異実装問題への対応）

同名の `FreeTextInput` が2箇所に存在する。

| 項目        | skill-creator版（廃止対象）                  | interview-widgets版（正本）                            |
| ----------- | -------------------------------------------- | ------------------------------------------------------ |
| パス        | `components/skill-creator/FreeTextInput.tsx` | `components/skill/interview-widgets/FreeTextInput.tsx` |
| 制御方式    | 非制御（uncontrolled）                       | 制御（controlled: `value` / `onChange` props）         |
| `isSecret`  | あり（パスワード入力化）                     | なし（`SecretInput` が独立コンポーネントとして存在）   |
| `isVisible` | あり（表示/非表示切替）                      | なし                                                   |

**判断: skill-creator版を廃止、interview-widgets版を正本として維持**

`isSecret` と `isVisible` の機能は `SecretInput` コンポーネントおよび条件付きレンダリングで完全に代替可能。

### 2-3. ConversationProgress.tsx の扱い — 廃止

`InterviewProgressBar`（`components/skill/InterviewProgressBar.tsx`）が機能的に対応しており、テストも整備されている。

**判断: 廃止**

`InterviewProgressBar` を正本として維持する。

### 2-4. ChoiceButton.tsx の扱い — 廃止

`SingleSelectChips`、`MultiSelectCheckbox`、`ConfirmButtons` で全種別の選択UIが代替される。

**判断: 廃止**

### 2-5. SkillCreatorResultPanel.tsx の扱い — 移動（維持）

`SkillCreatorResultPanel` は独立したUIコンポーネントであり、`SkillLifecyclePanel` または将来の結果表示コンポーネントから利用する予定のため廃止しない。

**判断: `components/skill-creator/` から `components/skill/` へ移動**

### 2-6. 各コンポーネントの最終配置先ディレクトリ

| コンポーネント                         | 現在のパス                            | 最終配置先                            | 処置 |
| -------------------------------------- | ------------------------------------- | ------------------------------------- | ---- |
| `SkillCreatorConversationPanel`        | `components/skill-creator/`           | —                                     | 廃止 |
| `QuestionCard`                         | `components/skill-creator/`           | —                                     | 廃止 |
| `ChoiceButton`                         | `components/skill-creator/`           | —                                     | 廃止 |
| `FreeTextInput`（skill-creator版）     | `components/skill-creator/`           | —                                     | 廃止 |
| `ConversationProgress`                 | `components/skill-creator/`           | —                                     | 廃止 |
| `SkillCreatorResultPanel`              | `components/skill-creator/`           | `components/skill/`                   | 移動 |
| `ConversationalInterview`              | `components/skill/`                   | `components/skill/`（変更なし）       | 維持 |
| `InterviewProgressBar`                 | `components/skill/`                   | `components/skill/`（変更なし）       | 維持 |
| `useInterviewState`                    | `components/skill/hooks/`             | `components/skill/hooks/`（変更なし） | 維持 |
| `SingleSelectChips`                    | `components/skill/interview-widgets/` | 同（変更なし）                        | 維持 |
| `MultiSelectCheckbox`                  | `components/skill/interview-widgets/` | 同（変更なし）                        | 維持 |
| `FreeTextInput`（interview-widgets版） | `components/skill/interview-widgets/` | 同（変更なし）                        | 維持 |
| `SecretInput`                          | `components/skill/interview-widgets/` | 同（変更なし）                        | 維持 |
| `ConfirmButtons`                       | `components/skill/interview-widgets/` | 同（変更なし）                        | 維持 |

`components/skill-creator/` ディレクトリは `SkillCreatorResultPanel` の移動と上記廃止が完了した後、空になるため**ディレクトリごと削除**できる。

---

## 3. IPC経路選択設計

### 3-1. Runtime IPCを正本とする理由

Runtime IPC（`skill-creator:submit-user-input` / `skill-creator:workflow-state-changed`）を正本IPCとして採用する。根拠は以下の通り。

1. **Pull型アーキテクチャの優位性**: Runtime IPC は `workflowSnapshot` をプロパティとして受け取る Pull 型であり、状態の一貫性を親コンポーネントが管理する。Session IPC の Push 型（Main 起点イベント）はコンポーネント内に非同期リスナーを持つことを強制し、React のレンダリングサイクルと非同期イベントの競合リスクがある。

2. **双方向レスポンスの保証**: Runtime IPC の `submitUserInput` は `invoke` 型であり、送信後に最新の `SkillCreatorWorkflowUiSnapshot` を返す。Session IPC の `sendAnswer` は `void` 戻り値（fire-and-forget）であり、送信成功の確認ができない。

3. **型変換レイヤーの不要化**: Session IPC では `UserInputQuestion` → `SkillCreatorUserInputRequest` への型変換（`mapQuestionToRequest()`）が必要だった。Runtime IPC は `SkillCreatorUserInputRequest` を直接扱う。

4. **高度機能の提供**: Runtime IPC のみが Undo機能（`workflowSnapshot` の履歴管理）、セッション復元（`restoredPendingRequest`）、熟練度フィルタを提供している。

5. **本番接続実績**: `ConversationalInterview` → `SkillLifecyclePanel` → Runtime IPC の経路は現時点で本番接続・動作確認済み。

### 3-2. Session IPC（skillCreatorSessionAPI）の廃止方針

**方針: Session IPC を廃止する**

廃止を選択する理由:

- `SkillCreatorConversationPanel` が唯一の利用者であり、当該コンポーネントを廃止するため利用箇所がゼロになる
- Main 側の `SkillCreatorIpcBridge` は Session IPC チャンネル（`skill-creator:start-session`, `skill-creator:answer` 等）のハンドラーを提供しているが、Runtime IPC側のハンドラーと並列して保守する必要がなくなる
- Session IPC と Runtime IPC が同一の Main プロセスリソース（SkillCreatorSdkSession）を異なる経路から操作する構造は、セッション状態の二重管理リスクを生む

ただし、`SkillCreatorIpcBridge` が Session IPC 専用かどうかは以下の確認が必要（Phase 3への持ち越し事項）:

- `SkillCreatorIpcBridge` が Runtime IPC チャンネルも一部登録している可能性がある
- `SkillCreatorOutputHandler` への参照がある（line 80 of SkillCreatorIpcBridge.ts）

### 3-3. 廃止する場合の削除対象ファイル

| ファイルパス                                                                           | 削除理由                     |
| -------------------------------------------------------------------------------------- | ---------------------------- |
| `apps/desktop/src/preload/skill-creator-session-api.ts`                                | Session IPC クライアント実装 |
| `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx` | 唯一の利用者（再掲）         |
| `apps/desktop/src/renderer/phase11-skill-creator-conversation-ui.tsx`                  | ハーネスファイル（再掲）     |

以下は **削除ではなく変更**:

| ファイルパス                           | 変更内容                                                                                                                                                       |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/preload/index.ts`    | `skillCreatorSessionAPI` の import および `contextBridge.exposeInMainWorld("skillCreatorSessionAPI", ...)` の行を削除                                          |
| `apps/desktop/src/preload/channels.ts` | `SKILL_CREATOR_SESSION_CHANNELS` の再エクスポートを削除（ただし `packages/shared/src/ipc/channels.ts` の定義自体は shared に残す。他の利用箇所がないか要確認） |
| `apps/desktop/src/main/ipc/index.ts`   | `SkillCreatorIpcBridge` の登録コードを削除（Session IPC ハンドラー部分のみ）。Runtime IPC ハンドラーが別クラスで管理されていれば影響なし                       |

### 3-4. IPCアダプターを作るか、直接使うかの判断

**判断: アダプターを作らず、直接使用する（現行設計を維持）**

現在の `ConversationalInterview` は `onSubmit` コールバックを props で受け取る設計であり、IPC への直接依存がない。`SkillLifecyclePanel` が `skillCreatorApi.submitUserInput()` を呼ぶ責務を持つ。この設計はテスタビリティが高く、追加のアダプター層は不要である。

---

## 4. ルーティング変更設計

### 4-1. App.tsxから削除/変更するルート

App.tsx を確認した結果、`SkillCreatorConversationPanel` は App.tsx のいかなるルート定義にも含まれていない（Phase 1で確認済み）。

よって、**App.tsx のルーティング定義に変更は不要**。

`SkillLifecyclePanel` 経由で `ConversationalInterview` がマウントされる経路（`case "skillLifecycle":`）は変更しない。

### 4-2. 削除するルートとエントリポイント

`phase11-skill-creator-conversation-ui.tsx` は独立したReact エントリポイントであり、Viteのビルド設定で参照されている可能性がある。

確認が必要な箇所:

| ファイルパス                                                   | 確認内容                                                                         |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `apps/desktop/vite.config.ts` または `vite.renderer.config.ts` | `phase11-skill-creator-conversation-ui` がエントリポイントとして登録されているか |
| `apps/desktop/electron-builder.yml` または類似のビルド設定     | ハーネスHTMLがパッケージングされているか                                         |

これらの参照も削除対象となる（Phase 3への確認事項）。

### 4-3. ナビゲーション導線の変更点

変更なし。`ConversationalInterview` へのナビゲーション導線は `SkillLifecyclePanel` → `skillLifecycle` ビュー経由で既存のまま維持される。

---

## 5. デモHTMLクリーンアップ設計

### 5-1. 削除対象ファイル

| ファイルパス                                                          | 種別                | 削除理由                                               |
| --------------------------------------------------------------------- | ------------------- | ------------------------------------------------------ |
| `apps/desktop/src/renderer/phase11-skill-creator-conversation-ui.tsx` | ハーネスTSXファイル | `SkillCreatorConversationPanel` 専用の視覚確認ハーネス |

HTMLファイルとしては専用の `.html` エントリファイルが存在するか要確認（Vite マルチエントリ構成の場合）。

確認対象:

| ファイルパス                                                                                            | 確認内容                                                        |
| ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `apps/desktop/index.html` または `apps/desktop/src/renderer/phase11-skill-creator-conversation-ui.html` | ハーネス専用HTMLが存在するか                                    |
| `apps/desktop/vite.config.ts`                                                                           | `input` に `phase11-skill-creator-conversation-ui` が含まれるか |

### 5-2. 参照されている機能で本番コードに必要なものの洗い出し

`phase11-skill-creator-conversation-ui.tsx` を精査した結果、本番コードに必要な固有機能はない。

確認内訳:

| 機能                                                   | ハーネス内での実装                                | 本番コードでの代替                                                    |
| ------------------------------------------------------ | ------------------------------------------------- | --------------------------------------------------------------------- |
| `window.skillCreatorSessionAPI` のモック実装           | スタブ（startSession, sendAnswer, onQuestion 等） | 本番では `preload/skill-creator-session-api.ts` が提供（廃止予定）    |
| `window.skillCreatorAPI` のモック実装（outputReady等） | スタブ                                            | 本番では `preload/skill-creator-api.ts` が提供（Runtime IPC側、維持） |
| `__PHASE11_SKILL_CREATOR_CONVERSATION_UI__` グローバル | ハーネスコントローラー                            | 本番不要（E2Eテスト専用）                                             |

ハーネスの `window.__PHASE11_SKILL_CREATOR_CONVERSATION_UI__` を使用するE2Eテストが存在する場合は、該当テストも削除対象となる（次節で詳述）。

---

## 6. 変更影響範囲

### 6-1. 変更によって影響を受ける既存テストファイル

#### 削除されるテストファイル（コンポーネント廃止に伴う）

| テストファイルパス                                                                                    | 影響理由                                                     |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/SkillCreatorConversationPanel.test.tsx` | テスト対象廃止                                               |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/QuestionCard.test.tsx`                  | テスト対象廃止                                               |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/ChoiceButton.test.tsx`                  | テスト対象廃止                                               |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/FreeTextInput.test.tsx`                 | テスト対象廃止（skill-creator版）                            |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/ConversationProgress.test.tsx`          | テスト対象廃止                                               |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/SkillCreatorResultPanel.test.tsx`       | ファイル移動に伴いimportパスの更新が必要（廃止ではなく修正） |

#### 修正が必要なテストファイル（インポートパス変更）

| テストファイルパス                                                                              | 修正内容                                                                                                                              |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/SkillCreatorResultPanel.test.tsx` | `SkillCreatorResultPanel` の移動先パスに合わせてimportパスを更新。テストファイル自体は `components/skill/__tests__/` へ移動が望ましい |

#### Session IPC廃止による影響テスト

| テストファイルパス                                                               | 影響理由                                                                | 対応                                                                     |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorIpcBridge.test.ts` | `SkillCreatorIpcBridge` がSession IPCチャンネルのハンドラーテストを含む | Session IPC部分のテストケースを削除。Runtime IPC部分（もしあれば）は維持 |

#### 影響なしと判断されるテストファイル

| テストファイルパス                                                                      | 判断理由                                                                                           |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.test.tsx` | 変更対象でなく、正本として維持するため変更不要                                                     |
| `apps/desktop/src/renderer/components/skill/__tests__/useInterviewState.test.ts`        | 同上                                                                                               |
| `apps/desktop/src/renderer/components/skill/__tests__/interview-widgets/*.test.tsx`     | 同上（interview-widgetsは変更なし）                                                                |
| `apps/desktop/src/renderer/components/skill/__tests__/InterviewProgressBar.test.tsx`    | 同上                                                                                               |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel*.test.tsx`    | `SkillLifecyclePanel` のロジック変更がない限り影響なし（`SkillCreatorResultPanel` 移植時に要確認） |

### 6-2. 変更前後のコンポーネント依存関係図

#### 変更前（現状）

```mermaid
graph TD
    subgraph 孤立系（廃止対象）
        H[phase11-skill-creator-conversation-ui.tsx]
        SCCP[SkillCreatorConversationPanel]
        QC[QuestionCard]
        CB[ChoiceButton]
        FTI_OLD[FreeTextInput - skill-creator版]
        CP[ConversationProgress]
        SCRP[SkillCreatorResultPanel]
        SESSION_API[skill-creator-session-api.ts]
        BRIDGE[SkillCreatorIpcBridge - Session IPC側]
        H --> SCCP
        SCCP --> QC
        SCCP --> CP
        SCCP --> SCRP
        SCCP --> SESSION_API
        QC --> CB
        QC --> FTI_OLD
        SESSION_API --> BRIDGE
    end

    subgraph 本番系（維持・正本）
        SLP[SkillLifecyclePanel]
        CI[ConversationalInterview]
        IPB[InterviewProgressBar]
        IW[interview-widgets/]
        UIH[useInterviewState]
        CREATOR_API[skill-creator-api.ts - Runtime IPC]
        SLP --> CI
        SLP --> CREATOR_API
        CI --> IPB
        CI --> IW
        CI --> UIH
    end

    AppTsx[App.tsx] --> SLP
    Preload[preload/index.ts] --> SESSION_API
    Preload --> CREATOR_API
```

#### 変更後（統合後）

```mermaid
graph TD
    subgraph 廃止済み（削除）
        DELETED["削除済みファイル群\n・SkillCreatorConversationPanel\n・QuestionCard\n・ChoiceButton\n・FreeTextInput (skill-creator版)\n・ConversationProgress\n・phase11ハーネス\n・skill-creator-session-api.ts"]
    end

    subgraph 本番系（維持・正本）
        SLP[SkillLifecyclePanel]
        CI[ConversationalInterview]
        IPB[InterviewProgressBar]
        IW[interview-widgets/]
        UIH[useInterviewState]
        SCRP_NEW["SkillCreatorResultPanel\n(components/skill/ に移動)"]
        CREATOR_API[skill-creator-api.ts - Runtime IPC]
        SLP --> CI
        SLP --> CREATOR_API
        SLP --> SCRP_NEW
        CI --> IPB
        CI --> IW
        CI --> UIH
    end

    AppTsx[App.tsx] --> SLP
    Preload[preload/index.ts] --> CREATOR_API
```

---

## 7. Phase 3（実装）への持ち越し事項

設計段階で確認できなかった以下の事項は Phase 3（実装）開始前に確認を要する。

| 事項                                                           | 確認対象ファイル                                                                         | 内容                                                                           |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| ハーネスのViteエントリポイント登録                             | `apps/desktop/vite.config.ts` 等                                                         | `phase11-skill-creator-conversation-ui` がビルドエントリに含まれているか       |
| `SkillCreatorIpcBridge` のRuntime IPC兼用                      | `apps/desktop/src/main/ipc/index.ts`（line 1078-1086）と `SkillCreatorIpcBridge.ts` 全体 | Session IPC専用か、Runtime IPC チャンネルも登録しているか                      |
| `SkillLifecyclePanel` の `onOutputReady` 処理                  | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                     | 結果表示UIが既存実装として存在するか、`SkillCreatorResultPanel` の移植が必要か |
| `SKILL_CREATOR_SESSION_CHANNELS` の他利用箇所                  | `packages/shared/src/ipc/channels.ts` および全体grep                                     | Session IPCチャンネル定数を他に参照するファイルがないか                        |
| E2Eテストでの `__PHASE11_SKILL_CREATOR_CONVERSATION_UI__` 利用 | E2Eテストディレクトリ全体                                                                | ハーネスコントローラーを使うPlaywright等のテストが存在するか                   |
