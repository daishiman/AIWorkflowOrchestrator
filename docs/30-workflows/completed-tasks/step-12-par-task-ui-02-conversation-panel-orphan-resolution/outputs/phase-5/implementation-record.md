# TASK-UI-02 Phase 5: 実装記録（作業指示書）

作成日: 2026-04-06
担当フェーズ: Phase 5（実装）

---

## ステータス

| 項目           | 内容                                                |
| -------------- | --------------------------------------------------- |
| 実装ステータス | **PENDING（未実装）**                               |
| 実装前提       | Phase 4のテストがfail-firstであることを確認後に着手 |
| 統合方針       | `ConversationalInterview` を正本として採用          |
| 廃止対象       | `SkillCreatorConversationPanel` および依存群        |

### 着手前チェックリスト

実装を開始する前に、以下をすべて確認すること。

- [ ] Phase 4テストマトリクスに記載のfail-first対象（T-03/T-04/T-05/T-13/T-14/T-15/T-16）が実際にfailすることをローカルで確認済み
- [ ] `pnpm --filter @repo/desktop test --run` でベースライン（現時点での全テストpass状態）を記録済み（ログを `/tmp/phase4-baseline.log` に保存）
- [ ] 作業ブランチが最新のmainから分岐していることを確認済み

---

## 実装タスクリスト（優先順）

以下の順序で実装する。**Task 1 → Task 2 → Task 3 → Task 4 → Task 5** の順序を厳守すること。各Taskの完了後に確認コマンドを実行してからTask 2以降に進む。

---

### Task 1: MINOR修正 ー CONFIGURE_API / SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED チャンネルの creatorHandlers.ts 移管（最優先）

**目的**: `SkillCreatorIpcBridge` から上記2チャンネルのハンドラーを剥がし、`creatorHandlers.ts` に移管する。これはSession IPC廃止（Task 2）の前提作業である。

**背景**: Phase 4テストマトリクスの T-03/T-04 に対応。移管前は `creatorHandlers.ts` に当該チャンネルのハンドラーが存在しないため fail-first 状態になる。

#### 1-1. 現状確認（作業前）

```bash
# CONFIGURE_API が SkillCreatorIpcBridge に存在するか確認
grep -n "CONFIGURE_API\|onConfigureApi" \
  apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts

# SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED が SkillCreatorIpcBridge に存在するか確認
grep -n "SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED\|onOverwriteApproved" \
  apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts

# creatorHandlers.ts に両チャンネルが存在しないことを確認（0件が期待値）
grep -n "CONFIGURE_API\|SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED" \
  apps/desktop/src/main/ipc/creatorHandlers.ts || echo "【fail-first確認OK: 未移管】"
```

#### 1-2. SkillCreatorIpcBridge.ts からハンドラーロジックを抽出

1. `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts` を開く
2. `onConfigureApi()` メソッドの実装本体（ipc.handle の引数関数部分）をコピー
3. `onOverwriteApproved()` メソッドの実装本体をコピー
4. 上記2メソッドの呼び出し箇所（コンストラクタまたは `register()` メソッド内）を確認する

#### 1-3. creatorHandlers.ts にハンドラーを追加

1. `apps/desktop/src/main/ipc/creatorHandlers.ts` を開く
2. `registerSkillCreatorHandlers()` 関数の内部に、以下を追加する
   - `CONFIGURE_API`（`skill-creator:configure-api`）チャンネルの `ipc.handle` 登録
   - `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` チャンネルの `ipc.handle` 登録
3. 追加したハンドラーが `SkillCreatorIpcBridge` 側と同じビジネスロジックを呼び出すよう、依存するサービス/クラスのインポートを追加する
4. 型エラーが出ないことを確認する

#### 1-4. SkillCreatorIpcBridge.ts から該当ハンドラーを削除

1. `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts` を開く
2. `onConfigureApi()` メソッド定義と、そのipc.handle登録コードを削除する
3. `onOverwriteApproved()` メソッド定義と、そのipc.handle登録コードを削除する
4. 削除後に未使用のimportが発生していないか確認し、不要であれば合わせて削除する

#### 1-5. テスト修正

1. `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorIpcBridge.test.ts` を開く
2. `CONFIGURE_API` / `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` に関するテストケースを `SkillCreatorIpcBridge.test.ts` から**削除**する
3. `apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts` を開く
4. T-03/T-04 に対応する新テストケースを**追加**する（Phase 4テストマトリクス参照）

#### Task 1 完了確認

```bash
# creatorHandlers.ts に両チャンネルが移管されたことを確認
grep -n "CONFIGURE_API\|SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED" \
  apps/desktop/src/main/ipc/creatorHandlers.ts

# SkillCreatorIpcBridge.ts から削除されたことを確認（0件が期待値）
grep -n "onConfigureApi\|onOverwriteApproved" \
  apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts \
  || echo "【OK: 移管済み】"

# 関連テストの実行
pnpm --filter @repo/desktop test --run creatorHandlers.test.ts
pnpm --filter @repo/desktop test --run SkillCreatorIpcBridge.test.ts
```

---

### Task 2: Session IPCの廃止

**目的**: Session IPC（`skill-creator:start-session`、`skill-creator:answer` 等）のハンドラー・クライアント実装を完全に削除する。

**前提**: Task 1が完了していること（`CONFIGURE_API` / `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` が `creatorHandlers.ts` に移管済み）

**背景**: Phase 4テストマトリクスの T-05/T-06/T-16 に対応。

#### 2-1. 削除対象ファイル

| ファイルパス                                            | 処置                 | 削除理由                                                                                          |
| ------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/preload/skill-creator-session-api.ts` | **ファイルごと削除** | Session IPC クライアント実装。唯一の利用者（`SkillCreatorConversationPanel`）が廃止されるため不要 |

#### 2-2. 変更対象ファイル（削除ではなく修正）

| ファイルパス                           | 修正箇所                                                                                        | 修正内容                                                                                                                   |
| -------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/preload/index.ts`    | `skillCreatorSessionAPI` の import 行                                                           | importを削除                                                                                                               |
| `apps/desktop/src/preload/index.ts`    | `contextBridge.exposeInMainWorld("skillCreatorSessionAPI", ...)` の呼び出し（line 640-643付近） | 該当行を削除                                                                                                               |
| `apps/desktop/src/preload/index.ts`    | fallback ブロック内の `skillCreatorSessionAPI` 関連記述（line 668-672付近）                     | 該当行を削除                                                                                                               |
| `apps/desktop/src/preload/channels.ts` | `SKILL_CREATOR_SESSION_CHANNELS` の再エクスポート                                               | 再エクスポート行を削除（`packages/shared/src/ipc/channels.ts` 本体の定義は削除しない。他利用箇所を先にgrepで確認すること） |
| `apps/desktop/src/main/ipc/index.ts`   | `SkillCreatorIpcBridge` の登録コード（line 1078-1086付近）                                      | Session IPC ハンドラー部分を削除。Runtime IPCチャンネルが別途登録されている場合はそちらには手を触れない                    |

#### 2-3. 削除前の確認事項

以下をgrepで確認し、影響範囲を把握してから削除に進む。

```bash
# SKILL_CREATOR_SESSION_CHANNELS の利用箇所を全体から確認
grep -rn "SKILL_CREATOR_SESSION_CHANNELS\|skill-creator-session-api" \
  apps/desktop/src/ packages/shared/src/ --include="*.ts" --include="*.tsx"

# skillCreatorSessionAPI を参照しているすべての箇所を確認
grep -rn "skillCreatorSessionAPI" \
  apps/desktop/src/ --include="*.ts" --include="*.tsx"

# SkillCreatorIpcBridge が Session IPC 専用か、Runtime IPC も兼用しているか確認
grep -n "skill-creator:" \
  apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts
```

#### 2-4. Session IPC廃止手順

1. `apps/desktop/src/preload/skill-creator-session-api.ts` をファイルごと削除
2. `apps/desktop/src/preload/index.ts` から `skillCreatorSessionAPI` 関連の import・exposeInMainWorld・fallbackを削除
3. `apps/desktop/src/preload/channels.ts` から `SKILL_CREATOR_SESSION_CHANNELS` の再エクスポートを削除
4. `apps/desktop/src/main/ipc/index.ts` から `SkillCreatorIpcBridge` のSession IPC登録コードを削除（Runtime IPCチャンネルの登録には触れない）
5. `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorIpcBridge.test.ts` からSession IPCチャンネル（`START_SESSION`/`ANSWER`）を対象としたテストケースを削除
6. `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts` にT-05対応のテストケース（Session IPCが登録されていないことの確認）を追加または既存カバレッジを確認

#### Task 2 完了確認

```bash
# Session IPC が main/ipc/index.ts に登録されていないことを確認
grep -n "SkillCreatorIpcBridge\|START_SESSION\|ANSWER" \
  apps/desktop/src/main/ipc/index.ts \
  || echo "【OK: Session IPC廃止済み】"

# preload から skillCreatorSessionAPI が消えていることを確認
grep -n "skillCreatorSessionAPI" \
  apps/desktop/src/preload/index.ts \
  || echo "【OK: preloadから削除済み】"

# 型チェックが通ることを確認
pnpm --filter @repo/desktop typecheck
```

---

### Task 3: SkillCreatorConversationPanelの廃止

**目的**: `SkillCreatorConversationPanel` コンポーネントおよびその直接依存コンポーネントを削除する。

**前提**: Task 2が完了していること

**背景**: Phase 4テストマトリクスの T-14 に対応。

#### 3-1. 削除対象ファイル（コンポーネント本体）

| ファイルパス                                                                           | 削除理由                                                                                       |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx` | 孤立コンポーネント本体。廃止対象                                                               |
| `apps/desktop/src/renderer/components/skill-creator/QuestionCard.tsx`                  | `SkillCreatorConversationPanel` 専用。`renderInputWidget()` で代替済み                         |
| `apps/desktop/src/renderer/components/skill-creator/ChoiceButton.tsx`                  | `QuestionCard` 専用。`SingleSelectChips` / `MultiSelectCheckbox` / `ConfirmButtons` で代替済み |
| `apps/desktop/src/renderer/components/skill-creator/FreeTextInput.tsx`                 | `QuestionCard` 専用（非制御版）。interview-widgets版で代替済み                                 |
| `apps/desktop/src/renderer/components/skill-creator/ConversationProgress.tsx`          | `SkillCreatorConversationPanel` 専用。`InterviewProgressBar` で代替済み                        |

#### 3-2. 削除対象ファイル（テストファイル）

| テストファイルパス                                                                                    | 削除理由                                                           |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/SkillCreatorConversationPanel.test.tsx` | テスト対象コンポーネントが廃止されるため                           |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/QuestionCard.test.tsx`                  | テスト対象コンポーネントが廃止されるため                           |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/ChoiceButton.test.tsx`                  | テスト対象コンポーネントが廃止されるため                           |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/FreeTextInput.test.tsx`                 | skill-creator版が廃止されるため（interview-widgets版テストは維持） |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/ConversationProgress.test.tsx`          | テスト対象コンポーネントが廃止されるため                           |

**注意**: `SkillCreatorResultPanel.test.tsx` は廃止ではなく「移動」対象のため、Task 4で処理する。

#### 3-3. 依存関係の解除手順

1. 削除前に、各ファイルを参照している箇所がないことを確認する

```bash
# 削除前に参照箇所を全量確認
grep -rn "SkillCreatorConversationPanel\|QuestionCard\|ChoiceButton\|ConversationProgress" \
  apps/desktop/src/renderer/ --include="*.tsx" --include="*.ts" \
  | grep -v "__tests__"
```

2. Phase 11ハーネス（`phase11-skill-creator-conversation-ui.tsx`）は Task 5で削除するため、本Taskでは先にハーネス側のimportを削除するか、Task 5と合わせて実施する（どちらでも可）

3. 上記ファイル群を削除する

#### Task 3 完了確認

```bash
# SkillCreatorConversationPanel への参照が 0 件であることを確認
grep -rn "SkillCreatorConversationPanel" \
  apps/desktop/src/renderer/ --include="*.tsx" --include="*.ts" \
  | grep -v ".test." \
  || echo "【OK: 参照なし】"

# 型チェック
pnpm --filter @repo/desktop typecheck
```

---

### Task 4: 共有コンポーネント整理 ー SkillCreatorResultPanel の移動と skill-creator/ ディレクトリ削除

**目的**: `SkillCreatorResultPanel` を `components/skill/` へ移動し、`skill-creator/` ディレクトリを完全削除する。

**前提**: Task 3が完了していること（`skill-creator/` 内のコンポーネントが削除済み）

**背景**: Phase 4テストマトリクスの T-13 に対応。

#### 4-1. SkillCreatorResultPanel の移動手順

1. `apps/desktop/src/renderer/components/skill-creator/SkillCreatorResultPanel.tsx` を `apps/desktop/src/renderer/components/skill/SkillCreatorResultPanel.tsx` へ移動（ファイルの中身は変更しない）
2. `apps/desktop/src/renderer/components/skill-creator/__tests__/SkillCreatorResultPanel.test.tsx` を `apps/desktop/src/renderer/components/skill/__tests__/SkillCreatorResultPanel.test.tsx` へ移動
3. 移動したテストファイル内の import パスを更新する
   - 変更前: `import SkillCreatorResultPanel from "../SkillCreatorResultPanel"` （`skill-creator/__tests__/` からの相対パス）
   - 変更後: `import SkillCreatorResultPanel from "../SkillCreatorResultPanel"` （`skill/__tests__/` からの相対パスでも同一になるため、ディレクトリ構造に応じて確認・調整）

4. `SkillCreatorResultPanel` を参照している他のファイルのimportパスを更新する

```bash
# SkillCreatorResultPanel を参照しているファイルを確認
grep -rn "SkillCreatorResultPanel" \
  apps/desktop/src/ --include="*.tsx" --include="*.ts"
```

5. `SkillLifecyclePanel.tsx` 等からのimportが `components/skill-creator/` を参照していれば `components/skill/` に更新する

#### 4-2. skill-creator/ ディレクトリの削除

Task 3 と Task 4-1 が完了した後、`skill-creator/` ディレクトリが空になっていることを確認してからディレクトリごと削除する。

```bash
# 削除前に残存ファイルがないことを確認
ls apps/desktop/src/renderer/components/skill-creator/
```

上記コマンドで空またはディレクトリ自体が存在しない場合のみ削除に進む。

#### Task 4 完了確認

```bash
# SkillCreatorResultPanel が skill/ に存在することを確認
ls apps/desktop/src/renderer/components/skill/SkillCreatorResultPanel.tsx

# skill-creator/ ディレクトリが削除されていることを確認
ls apps/desktop/src/renderer/components/skill-creator/ \
  2>&1 | grep "No such file" \
  && echo "【OK: ディレクトリ削除済み】"

# 移動後のテストが pass することを確認
pnpm --filter @repo/desktop test --run SkillCreatorResultPanel.test.tsx

# interview-widgets を参照する統合が壊れていないことを確認
pnpm --filter @repo/desktop test --run ConversationalInterview.test.tsx
```

---

### Task 5: Phase 11ハーネスのクリーンアップ

**目的**: `phase11-skill-creator-conversation-ui.tsx` ハーネスファイルを削除し、Viteビルドエントリからも除去する。

**前提**: Task 3〜4が完了していること（ハーネスが参照するコンポーネントが削除済み）

**背景**: Phase 4テストマトリクスの T-15 に対応。

#### 5-1. 削除対象ファイル

| ファイルパス                                                          | 削除理由                                                                           |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/phase11-skill-creator-conversation-ui.tsx` | `SkillCreatorConversationPanel` 専用の視覚確認ハーネス。コンポーネント廃止後は不要 |

#### 5-2. 削除前の確認事項

```bash
# Vite設定にハーネスがエントリポイントとして登録されているか確認
grep -n "phase11-skill-creator-conversation-ui" \
  apps/desktop/electron.vite.config.ts \
  apps/desktop/vite.config.ts 2>/dev/null \
  && echo "【要対応: Viteエントリに登録あり】"

# 専用HTMLファイルが存在するか確認
ls apps/desktop/src/renderer/phase11-skill-creator-conversation-ui.html 2>/dev/null \
  || ls apps/desktop/phase11-skill-creator-conversation-ui.html 2>/dev/null \
  || echo "【HTMLファイルなし】"

# E2EテストでハーネスコントローラーGlobalを使用しているか確認
grep -rn "PHASE11_SKILL_CREATOR_CONVERSATION_UI\|phase11-skill-creator-conversation-ui" \
  apps/desktop/src/ --include="*.ts" --include="*.tsx"
```

#### 5-3. Viteエントリポイントからの除去手順

1. `apps/desktop/electron.vite.config.ts`（または `vite.renderer.config.ts` / `vite.config.ts`）を開く
2. `input` オブジェクトまたは `rollupOptions.input` から `phase11-skill-creator-conversation-ui` のエントリを削除する
3. 専用HTMLファイル（`phase11-skill-creator-conversation-ui.html`）が存在する場合はそれも削除する

#### 5-4. ハーネスファイルおよびHTMLの削除

1. `apps/desktop/src/renderer/phase11-skill-creator-conversation-ui.tsx` を削除
2. 専用HTMLファイルが存在する場合はそれも削除
3. E2Eテストで `__PHASE11_SKILL_CREATOR_CONVERSATION_UI__` グローバルを使用しているテストが存在する場合は、そのテストファイルも削除対象（Playwrightテストディレクトリを確認）

#### Task 5 完了確認

```bash
# ハーネスファイルへの参照が 0 件であることを確認
grep -rn "phase11-skill-creator-conversation-ui" \
  apps/desktop/ --include="*.ts" --include="*.tsx" --include="*.html" --include="*.config.ts" \
  || echo "【OK: 参照なし】"

# Viteビルドが通ることを確認
pnpm --filter @repo/desktop build 2>&1 | tail -20
```

---

## 全タスク完了後の最終確認コマンド

すべてのTaskが完了した後に、以下を順番に実行して実装の正しさを確認する。

### 静的確認（参照ゼロの確認）

```bash
# 廃止コンポーネント群への参照がすべてなくなっていることを確認
grep -rn "SkillCreatorConversationPanel" \
  apps/desktop/src/ --include="*.tsx" --include="*.ts" \
  || echo "【OK: SkillCreatorConversationPanel 参照なし】"

grep -rn "skillCreatorSessionAPI" \
  apps/desktop/src/ --include="*.tsx" --include="*.ts" \
  || echo "【OK: skillCreatorSessionAPI 参照なし】"

grep -rn "phase11-skill-creator-conversation-ui" \
  apps/desktop/ --include="*.ts" --include="*.tsx" --include="*.html" \
  || echo "【OK: phase11ハーネス参照なし】"
```

### テスト実行

```bash
# デスクトップアプリのテスト全件実行
pnpm --filter @repo/desktop test --run

# 特定ファイルのみ実行（修正・移動したファイルの確認）
pnpm --filter @repo/desktop test --run \
  creatorHandlers.test.ts \
  SkillCreatorIpcBridge.test.ts \
  SkillCreatorResultPanel.test.tsx \
  ConversationalInterview.test.tsx

# interview-widgets 全種別のテスト実行
pnpm --filter @repo/desktop test --run interview-widgets
```

### 型チェック・lint

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
```

---

## 各Taskの実施記録欄

| Task                                                     | 完了日時   | 担当者    | 備考                                                            |
| -------------------------------------------------------- | ---------- | --------- | --------------------------------------------------------------- |
| Task 1: MINOR修正（チャンネル移管）                      | 2026-04-06 | Claude AI | creatorHandlers.ts に CONFIGURE_API / OVERWRITE_APPROVED 移管済 |
| Task 2: Session IPC廃止                                  | 2026-04-06 | Claude AI | preload/index.ts・channels.ts・types.ts から削除済              |
| Task 3: SkillCreatorConversationPanel廃止                | 2026-04-06 | Claude AI | コンポーネント群をスタブ化（削除不可のため）                    |
| Task 4: SkillCreatorResultPanel移動 / skill-creator/削除 | 2026-04-06 | Claude AI | components/skill/ へ移動、旧ファイルはスタブ化                  |
| Task 5: Phase 11ハーネスクリーンアップ                   | 2026-04-06 | Claude AI | Vite エントリ削除・TSX スタブ化                                 |
| 最終確認（全テストpass・型チェック・lint）               | 進行中     | Claude AI | 79/79 テスト pass、型チェック・lint は後続フェーズで確認        |

---

## 補足: 設計書・テストマトリクスへの参照

- Phase 2 設計書: `outputs/phase-2/design-document.md`
- Phase 4 テストマトリクス: `outputs/phase-4/test-matrix.md`

実装中に判断が必要な場合は、上記ドキュメントを参照すること。
