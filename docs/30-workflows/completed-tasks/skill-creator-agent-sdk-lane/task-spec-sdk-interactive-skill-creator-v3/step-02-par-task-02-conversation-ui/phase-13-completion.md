# Phase 13: 完了・PR作成 — Conversation UI（質問受信・回答送信UIコンポーネント）

## メタ情報

| 項目      | 値                       |
| --------- | ------------------------ |
| Phase番号 | 13                       |
| 機能名    | conversation-ui          |
| タスクID  | TASK-SDK-SC-02           |
| 作成日    | 2026-04-02               |
| 依存Phase | Phase 12（ドキュメント） |

## 目的

TASK-SDK-SC-02 の全成果物を最終確認し、コミット・PR 作成を完了する。

## 実行タスク

### Task 13-1: 成果物の最終確認

以下の成果物が全て存在することを確認する。

#### コードコンポーネント成果物

| ファイル                                                                               | 確認ポイント                                                             |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `apps/desktop/src/renderer/components/skill-creator/ChoiceButton.tsx`                  | isSelected/isFreeText/disabled スタイル分岐が実装されている              |
| `apps/desktop/src/renderer/components/skill-creator/FreeTextInput.tsx`                 | isVisible制御・isSecret・Enter送信・空文字バリデーションが実装されている |
| `apps/desktop/src/renderer/components/skill-creator/ConversationProgress.tsx`          | 「質問N/推定合計」形式・role="progressbar"が実装されている               |
| `apps/desktop/src/renderer/components/skill-creator/QuestionCard.tsx`                  | 5タイプ分岐・「その他（自由入力）」常時末尾追加が実装されている          |
| `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx` | IPCリスナー登録・useReducer状態管理・cleanup が実装されている            |

#### テスト成果物

| ファイル                                                                                              | 確認ポイント                          |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/QuestionCard.test.tsx`                  | T-01, T-02, T-03, T-05 が含まれている |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/ChoiceButton.test.tsx`                  | T-03-detail, T-07 が含まれている      |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/FreeTextInput.test.tsx`                 | T-04 が含まれている                   |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/ConversationProgress.test.tsx`          | 進捗表示テストが含まれている          |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/SkillCreatorConversationPanel.test.tsx` | T-06, T-11 が含まれている             |

### Task 13-2: 最終テスト実行

```bash
pnpm --filter @repo/desktop vitest run \
  src/renderer/components/skill-creator/__tests__/ \
  --reporter=verbose
```

期待する結果: 全テスト PASS（T-01 から T-11 以上）

### Task 13-3: PR 作成チェックリスト

PR 作成前に以下を全て確認する:

- [ ] `pnpm --filter @repo/desktop typecheck` が通ること（エラー 0 件）
- [ ] `pnpm --filter @repo/desktop lint` が通ること（エラー 0 件）
- [ ] `pnpm --filter @repo/desktop vitest run` が全件 PASS すること
- [ ] `--no-verify` を使っていないこと（プロジェクトルールで**絶対禁止**）

### Task 13-4: コミットメッセージ案

```
feat(desktop/renderer): TASK-SDK-SC-02 — conversation UI コンポーネント実装

- SkillCreatorConversationPanel: skill-creator:question-received IPC受信・useReducer状態管理・answer送信・cleanup実装
- QuestionCard: 5タイプ分岐（single_select/multi_select/free_text/secret/confirm）実装
- QuestionCard: 「その他（自由入力）」を選択肢の末尾に常に表示
- ChoiceButton: 選択/未選択/isFreeText破線/disabled スタイル実装
- FreeTextInput: isVisible制御・isSecret パスワードマスク・Enter送信・空文字バリデーション実装
- ConversationProgress: 「質問N/推定合計」形式・role="progressbar" 実装
- テスト: T-01〜T-11 全件追加（カバレッジ ≥80%）
- Atomic Design 準拠（Atom×3 / Molecule×1 / Organism×1）
```

### Task 13-5: PR 作成コマンド

```bash
# 1. ブランチが最新の main から派生していることを確認
git log --oneline -5

# 2. 変更ファイルの確認
git status

# 3. ステージング
git add apps/desktop/src/renderer/components/skill-creator/

# 4. コミット（--no-verify 絶対禁止）
git commit -m "feat(desktop/renderer): TASK-SDK-SC-02 — conversation UI コンポーネント実装"

# 5. PR 作成
gh pr create \
  --title "feat(desktop/renderer): TASK-SDK-SC-02 — conversation UI コンポーネント実装" \
  --body "$(cat <<'EOF'
## 概要

TASK-SDK-SC-02: Electron Renderer の質問受信・回答送信 UI コンポーネント群を実装。

## 変更内容

### 新規コンポーネント（全5ファイル）

| コンポーネント | 階層 | 主な機能 |
|---|---|---|
| ChoiceButton | Atom | 選択/未選択・isFreeText破線・disabled対応 |
| FreeTextInput | Atom | isVisible制御・isSecret・Enter送信 |
| ConversationProgress | Atom | 「質問N/推定合計」進捗表示 |
| QuestionCard | Molecule | 5タイプ分岐・「その他」常時末尾追加 |
| SkillCreatorConversationPanel | Organism | IPC統合・useReducer状態管理 |

### 設計上の重要な決定事項

- `single_select` / `multi_select` では `payload.choices` の内容に関わらず「その他（自由入力）」を選択肢の末尾に**常に**追加する
- `secret` タイプは `type="password"` の単行入力フィールドを使用する（Shift+Enter 改行なし）
- `isSubmitting` 中は全入力コンポーネントを `disabled=true` にして重複送信を防止する
- IPCリスナーは `useEffect` の cleanup で確実に解除する

### テスト追加

- T-01〜T-11: 全コンポーネントのユニットテスト・結合テスト・XSSテスト・エッジケース

## 依存タスク

- TASK-SDK-SC-01（完了必須）: QuestionPayload型・IPCチャネル定数

## 並列実行タスク

- step-02-par 内の他タスクとは独立して実装済み
EOF
)"
```

### Task 13-6: タスク完了サマリー

| 項目                         | 内容                                                                   |
| ---------------------------- | ---------------------------------------------------------------------- |
| タスクID                     | TASK-SDK-SC-02                                                         |
| 新規ファイル数               | 5コンポーネント + 5テストファイル = 10ファイル                         |
| Atomic Design 準拠           | Atom×3 / Molecule×1 / Organism×1                                       |
| テスト数                     | T-01〜T-11（基本テスト6 + 拡充テスト5）                                |
| カバレッジ目標               | 全コンポーネント ≥80%                                                  |
| IPC チャネル                 | `SKILL_CREATOR_QUESTION_RECEIVED` / `SKILL_CREATOR_ANSWER`             |
| 依存タスク                   | TASK-SDK-SC-01 のみ（型定義・チャネル定数）                            |
| 並列実行との関係             | step-02-par 内の他タスクとは独立                                       |
| 重要な設計決定               | 「その他（自由入力）」は allowFreeText フラグに関わらず常に末尾に表示  |
| スコープ外として分離した事項 | SDK Session Bridge（Task-01）・質問生成ロジック・Main プロセス側の変更 |

## 参照資料

| 資料名                 | パス                                  |
| ---------------------- | ------------------------------------- |
| Phase 12 ドキュメント  | `phase-12-documentation.md`           |
| Git & ツーリングルール | `CLAUDE.md`（`--no-verify` 絶対禁止） |
| タスク概要             | `index.md`                            |

## 成果物

| 成果物                        | パス                                                                                   | 形式       |
| ----------------------------- | -------------------------------------------------------------------------------------- | ---------- |
| ChoiceButton                  | `apps/desktop/src/renderer/components/skill-creator/ChoiceButton.tsx`                  | TypeScript |
| FreeTextInput                 | `apps/desktop/src/renderer/components/skill-creator/FreeTextInput.tsx`                 | TypeScript |
| ConversationProgress          | `apps/desktop/src/renderer/components/skill-creator/ConversationProgress.tsx`          | TypeScript |
| QuestionCard                  | `apps/desktop/src/renderer/components/skill-creator/QuestionCard.tsx`                  | TypeScript |
| SkillCreatorConversationPanel | `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx` | TypeScript |

## 完了条件

- [ ] 全5コンポーネントが新規作成されていることを確認した
- [ ] 全5テストファイルが作成されていることを確認した
- [ ] 最終テスト実行で全テストが PASS した
- [ ] `pnpm typecheck` がエラー 0 件で完了した
- [ ] `pnpm lint` がエラー 0 件で完了した
- [ ] PR 作成チェックリスト（typecheck / lint / test / no-verify確認）を全て確認した
- [ ] コミットメッセージ案に従いコミットした（`--no-verify` を使用していないこと）
- [ ] PR を作成した
- [ ] タスク完了サマリーを記録した

---

**タスク完了**: TASK-SDK-SC-02 — Conversation UI（質問受信・回答送信UIコンポーネント）
