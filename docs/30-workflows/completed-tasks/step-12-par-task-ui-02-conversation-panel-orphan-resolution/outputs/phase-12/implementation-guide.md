# TASK-UI-02 Phase 12: 実装ガイド

作成日: 2026-04-06
担当フェーズ: Phase 12（ドキュメント更新）

---

## Part 1: 中学生レベルの概念説明

### 問題: 2つの「同じような画面」が存在し、片方が使えない状態だった

このアプリには「スキルを作るときの会話画面」が 2 つありました。

- **古い会話画面** (`SkillCreatorConversationPanel`): コードとしては存在していたが、アプリのどこからも「入り口」がつながっていなかった。まるで廊下の奥に部屋があるのに、その廊下に入るドアが外からふさがれていたようなもの。
- **新しい会話画面** (`ConversationalInterview`): こちらは正しく「入り口」につながっており、実際にユーザーが使える状態だった。

たとえば、学校に体育館が 2 つあって、片方は入り口の鍵がなくて誰も使えない状態と同じです。使えない体育館にも照明や設備が整っているのに、電気代や管理費だけかかってしまいます。

### なぜ「使えない画面」を放置すると問題なのか

1. **メンテナンスコスト**: 使われていないコードでも、アプリの他の部分が変わるたびに壊れていないか確認しなければならない
2. **混乱の原因**: 新しい開発者が「この画面はどこで使うの？」と疑問に持ち、無駄な調査時間が生まれる
3. **通信経路の問題**: 古い画面は「古い通信方法（Session IPC）」を使っており、新しい安全な通信方法（Runtime IPC）とは別の経路を使っていた。2 つの通信経路を並行して管理するのはリスクが高い

### 解決方法

古い会話画面（`SkillCreatorConversationPanel`）を廃止して、コードを空にしました。代わりに、すでに動いている新しい会話画面（`ConversationalInterview`）だけを使うようにしました。これにより、「会話画面は 1 つ、通信経路も 1 つ」という整理されたシステムになりました。

---

## Part 2: 技術詳細

### 2-1. 統合方針

**採用した方針**: `SkillCreatorConversationPanel` を廃止し、`ConversationalInterview` に一本化。

- Phase 1 分析で `SkillCreatorConversationPanel` が App.tsx に接続されておらず孤立していることを確認
- `ConversationalInterview` が `SkillLifecyclePanel` 経由で正規ルートに接続されていることを確認
- Phase 2 設計で「廃止（stub化）+ SkillCreatorResultPanel の skill/ ディレクトリへの移動」を決定

### 2-2. 変更内容一覧

#### 廃止コンポーネント（`export {}` stub 化）

| ファイルパス                                                                 | 廃止理由                                                  |
| ---------------------------------------------------------------------------- | --------------------------------------------------------- |
| `src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx`    | 孤立コンポーネント本体。App.tsx 未接続                    |
| `src/renderer/components/skill-creator/QuestionCard.tsx`                     | `ConversationalInterview` の `renderInputWidget()` で代替 |
| `src/renderer/components/skill-creator/ChoiceButton.tsx`                     | `SingleSelectChips` / `MultiSelectCheckbox` で代替        |
| `src/renderer/components/skill-creator/FreeTextInput.tsx`（skill-creator版） | `interview-widgets/FreeTextInput`（制御版）で代替         |
| `src/renderer/components/skill-creator/ConversationProgress.tsx`             | `InterviewProgressBar` で代替                             |
| `src/renderer/phase11-skill-creator-conversation-ui.tsx`                     | Phase 11 ハーネス。Vite エントリも削除済み                |
| `src/preload/skill-creator-session-api.ts`                                   | no-op stub として残存（TypeScript型互換のため）           |

#### 移動コンポーネント

| 旧パス                                                              | 新パス                                                      |
| ------------------------------------------------------------------- | ----------------------------------------------------------- |
| `src/renderer/components/skill-creator/SkillCreatorResultPanel.tsx` | `src/renderer/components/skill/SkillCreatorResultPanel.tsx` |

#### IPC ハンドラー移管（Phase 3 MINOR 対応）

| チャンネル                                | 旧担当                  | 新担当               |
| ----------------------------------------- | ----------------------- | -------------------- |
| `skill-creator:configure-api`             | `SkillCreatorIpcBridge` | `creatorHandlers.ts` |
| `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` | `SkillCreatorIpcBridge` | `creatorHandlers.ts` |

#### バグ修正（Phase 6 発見）

- `SecretInput.tsx`: トグルボタンに `disabled={disabled}` プロパティが欠落していた（W-SI-05）
- 修正: `disabled={disabled}` を追加し、`disabled:cursor-not-allowed disabled:opacity-50` クラスを付与

### 2-3. IPC 経路の選択理由と使い分けルール

| 種別        | 使用箇所                                         | 理由                                                                                          |
| ----------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Runtime IPC | `ConversationalInterview` → `creatorHandlers.ts` | `safeInvoke()` / `safeOn()` によるホワイトリスト検証付き。`assertSender()` でセキュリティ確保 |
| Session IPC | ~~`SkillCreatorConversationPanel`~~（廃止）      | 廃止。Renderer 側は no-op stub                                                                |

**ルール**: 新規のスキル作成 IPC は必ず `skill-creator-api.ts` の `safeInvoke()` / `safeOn()` 経由で行う。`ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS` ホワイトリストへの追加が必要。

### 2-4. 共有コンポーネントの配置

```
apps/desktop/src/renderer/components/
  skill/                              ← 正本コンポーネント置き場
    ConversationalInterview.tsx       ← 会話 UI 本体（5種別ウィジェット）
    SkillCreatorResultPanel.tsx       ← 結果表示（skill-creator/ から移動）
    SkillLifecyclePanel.tsx           ← 外側コンテナ（App.tsx から接続）
    interview-widgets/                ← ウィジェット群（5種別）
      SingleSelectChips.tsx
      MultiSelectCheckbox.tsx
      FreeTextInput.tsx
      SecretInput.tsx
      ConfirmButtons.tsx
      InterviewProgressBar.tsx
  skill-creator/                      ← 全ファイルが export {} stub（機能的空ディレクトリ）
```

### 2-5. クリーンアップした孤立参照一覧

| 参照種別                                    | 場所                                                                   | 状態                                    |
| ------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------- |
| `SkillCreatorConversationPanel` live import | `App.tsx`（元々未接続）                                                | 接続なし確認済み                        |
| Phase 11 Vite エントリ                      | `electron.vite.config.ts`                                              | エントリなし確認済み                    |
| Session IPC Renderer 呼び出し               | `preload/skill-creator-session-api.ts`                                 | no-op stub に置換済み                   |
| Phase 11 capture harness HTML               | `apps/desktop/src/renderer/phase11-skill-creator-conversation-ui.html` | capture 用に保持（production build 外） |

補足: `phase11-skill-creator-conversation-ui.html` は `apps/desktop/scripts/capture-skill-creator-conversation-ui-phase11.mjs` が参照する証跡ハーネスであり、production ルートではない。対応するスクリーンショットは root の `outputs/phase-11/task-sdk-sc-02/screenshots/` に保存されている。

### 2-6. テスト追加サマリー（Phase 4/6）

| テストファイル                                   | 追加したテストケース                                         |
| ------------------------------------------------ | ------------------------------------------------------------ |
| `interview-widgets/SingleSelectChips.test.tsx`   | W-SS-01（3 options rendering）, W-SS-05（empty options）     |
| `interview-widgets/MultiSelectCheckbox.test.tsx` | W-MC-02（toggle checked）, W-MC-04（empty）, W-MC-06 todo    |
| `interview-widgets/FreeTextInput.test.tsx`       | W-FT-01（value prop）                                        |
| `interview-widgets/SecretInput.test.tsx`         | W-SI-04（value prop）, W-SI-05（disabled toggle）            |
| `interview-widgets/ConfirmButtons.test.tsx`      | W-CB-04（両ボタン disabled）, W-CB-05/05b（click）           |
| `useInterviewState.test.ts`                      | UIH-EC-01（requestId accumulation）, UIH-EC-02（reset）      |
| `ConversationalInterview.ipc-edge.test.tsx`      | IPC-TO-01〜03, IPC-ER-01〜02, IPC-ER-03 todo（新規ファイル） |
| `SkillLifecycle.integration.test.tsx`            | INT-01〜INT-04 追加                                          |
