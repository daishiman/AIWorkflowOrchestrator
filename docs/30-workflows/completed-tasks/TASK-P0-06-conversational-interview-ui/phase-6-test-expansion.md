# Phase 6: テスト拡充 - 会話型インタビュー UI

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 6                                      |
| Phase名    | テスト拡充                             |
| 前提Phase  | Phase 5（実装）                        |
| 後続Phase  | Phase 7（カバレッジ確認）              |
| ステータス | 未実施                                 |
| 作成日     | 2026-04-04                             |
| 機能名     | TASK-P0-06-conversational-interview-ui |
| Issue      | #1889                                  |

---

## 目的

Phase 5の実装完了後に、エッジケース・エラーハンドリング・アクセシビリティ・回帰テストを追加し、テストの堅牢性とカバレッジを向上させる。Phase 4で設計した基本テストケースでは捕捉できない境界条件や異常系を重点的にカバーする。

## 背景

Phase 5で全テスト（CT-26件、UT-16件、IT-6件）がGreen状態に到達した。しかし、以下の観点で追加テストが必要である:

1. **エッジケース**: 空配列、null値、極端な入力長などの境界条件
2. **エラーハンドリング**: IPC通信エラー、セッションエラー、タイムアウト
3. **アクセシビリティ**: ARIA属性、キーボード操作、スクリーンリーダー対応
4. **回帰テスト**: 既存機能の破壊がないことの確認

---

## 実行タスク

### タスク1: エッジケーステストの追加

**目的**: 境界条件でのUIの安定動作を検証する。

#### 追加テストケース一覧

| テストID | describe     | it                                                                   | 対応FR |
| -------- | ------------ | -------------------------------------------------------------------- | ------ |
| EX-01    | エッジケース | options が空配列の `single_select` でUIがクラッシュしない            | FR-01  |
| EX-02    | エッジケース | options が空配列の `multi_select` でUIがクラッシュしない             | FR-01  |
| EX-03    | エッジケース | `free_text` で非常に長いテキスト（10000文字）が入力可能              | FR-01  |
| EX-04    | エッジケース | `free_text` でホワイトスペースのみの入力がバリデーションエラーになる | FR-07  |
| EX-05    | エッジケース | `secret` でコピー＆ペーストによる値入力が正しく処理される            | FR-01  |
| EX-06    | エッジケース | 連続undoで最初の質問より前に戻らない（currentStepIndex >= 0）        | FR-06  |
| EX-07    | エッジケース | `multi_select` で全optionを選択→一部解除→送信が正しく動作する        | FR-01  |
| EX-08    | エッジケース | pendingRequest が null のときに入力エリアが表示されない              | FR-01  |
| EX-09    | エッジケース | totalSteps が 0 のとき InterviewProgressBar が適切に表示される       | FR-04  |
| EX-10    | エッジケース | proficiency 切替後にメッセージ履歴が維持される                       | FR-03  |

---

### タスク2: エラーハンドリングテストの追加

**目的**: IPC通信エラーやセッション異常時のUIの安全な挙動を検証する。

#### 追加テストケース一覧

| テストID | describe           | it                                                                   | 対応FR |
| -------- | ------------------ | -------------------------------------------------------------------- | ------ |
| EH-01    | エラーハンドリング | `session-error` 受信時にエラーメッセージが表示される                 | FR-02  |
| EH-02    | エラーハンドリング | `session-error` 受信後もundo操作が可能                               | FR-06  |
| EH-03    | エラーハンドリング | 送信中にエラーが発生した場合、isSubmitting が false にリセットされる | FR-08  |
| EH-04    | エラーハンドリング | apiKeyStatus が `"unknown"` のときガイダンスバナーが表示されない     | FR-05  |
| EH-05    | エラーハンドリング | onOpenApiKeySettings が未定義のときボタンが非表示またはdisabled      | FR-05  |
| EH-06    | エラーハンドリング | question-received で不正なkindが受信された場合にクラッシュしない     | FR-01  |

---

### タスク3: アクセシビリティテストの追加

**目的**: WCAG準拠とキーボード操作のテストを追加する。

#### 追加テストケース一覧

| テストID | describe         | it                                                                         | 対応NFR |
| -------- | ---------------- | -------------------------------------------------------------------------- | ------- |
| A11Y-01  | アクセシビリティ | バリデーションエラーが `role="alert"` 属性を持つ                           | NFR-05  |
| A11Y-02  | アクセシビリティ | 送信ボタンに適切な `aria-label` または可視テキストがある                   | NFR-05  |
| A11Y-03  | アクセシビリティ | undoボタンに適切な `aria-label` または可視テキストがある                   | NFR-05  |
| A11Y-04  | アクセシビリティ | APIキーガイダンスバナーが `role="status"` 属性を持つ                       | NFR-05  |
| A11Y-05  | アクセシビリティ | `free_text` 入力フィールドに適切な `aria-label` がある                     | NFR-05  |
| A11Y-06  | アクセシビリティ | `secret` 入力フィールドの `type="password"` が設定されている               | NFR-07  |
| A11Y-07  | アクセシビリティ | キーボード Tab キーで入力ウィジェット→送信ボタンの順にフォーカスが移動する | NFR-05  |

---

### タスク4: 回帰テスト（Regression Check）

**目的**: Phase 5の実装により既存機能が破壊されていないことを確認する。

**実行手順**:

1. 対象テストスイートの全件実行

```bash
# P0-06関連テスト全件実行
pnpm --filter @repo/desktop test -- --testPathPattern="skill/(ConversationalInterview|useInterviewState|interview-widgets)"

# skill-creator関連テスト全件実行
pnpm --filter @repo/desktop test -- --testPathPattern="skill-creator"
```

2. 隣接コンポーネントへの影響確認

```bash
# SkillCreator全体のテスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="skill"
```

3. 回帰チェックリスト

| #   | チェック項目                                                                 | 確認方法       | 判定 |
| --- | ---------------------------------------------------------------------------- | -------------- | ---- |
| 1   | 既存の ConversationalInterview テストが全て PASS                             | テスト実行     | -    |
| 2   | 既存の useInterviewState テストが全て PASS                                   | テスト実行     | -    |
| 3   | interview-widgets の全テストが PASS                                          | テスト実行     | -    |
| 4   | SkillCreatorConversationPanel の既存テストが PASS                            | テスト実行     | -    |
| 5   | Props追加により既存の ConversationalInterview 利用箇所でコンパイルエラーなし | 型チェック     | -    |
| 6   | 新規Propsがオプショナルであり、既存の呼び出し側の変更が不要                  | コードレビュー | -    |

---

### タスク5: テスト実行と結果記録

**目的**: Phase 6で追加した全テストを実行し、結果を記録する。

**実行手順**:

```bash
# 全テストの実行（Phase 4 + Phase 6 追加分）
pnpm --filter @repo/desktop test -- --testPathPattern="skill/(ConversationalInterview|useInterviewState|interview-widgets)"

# テスト結果サマリー
pnpm --filter @repo/desktop test -- --testPathPattern="skill/(ConversationalInterview|useInterviewState)" 2>&1 | grep -E "Tests:|Test Suites:"
```

**期待される結果**:

- Phase 4テスト（CT/UT/IT）: 全て PASS
- Phase 6追加テスト（EX/EH/A11Y）: 全て PASS
- 既存テスト: 全て PASS（regressionなし）

---

## 参照資料

| 資料名             | パス                                                                                    | 説明                    |
| ------------------ | --------------------------------------------------------------------------------------- | ----------------------- |
| Phase 1 要件定義   | `phase-1-requirements.md`                                                               | NFR-05〜NFR-09          |
| Phase 2 設計       | `phase-2-design.md`                                                                     | 各InputKindのフロー仕様 |
| Phase 4 テスト仕様 | `phase-4-test-creation.md`                                                              | 基本テストケース一覧    |
| Phase 5 実装       | `phase-5-implementation.md`                                                             | 実装サマリー            |
| 既存テスト         | `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.test.tsx` | 拡張対象テストファイル  |
| 既存テスト         | `apps/desktop/src/renderer/components/skill/__tests__/useInterviewState.test.ts`        | 拡張対象テストファイル  |
| Issue #1889        | GitHub Issue                                                                            | TASK-P0-06の詳細仕様    |

---

## 統合テスト連携【必須】

統合テストの拡充:

| カテゴリ               | 追加シナリオ                                                        | テストID    | 確認状態 |
| ---------------------- | ------------------------------------------------------------------- | ----------- | -------- |
| エラーハンドリング統合 | session-error 受信 → エラー表示 → undo可能 → 再送信可能のフルフロー | EH-01〜03   | 設計済み |
| APIキー異常系統合      | apiKeyStatus 遷移: unknown → not_set → configured の状態遷移フロー  | EH-04〜05   | 設計済み |
| エッジケース統合       | 空options/null pendingRequest/極端入力での安定動作                  | EX-01〜10   | 設計済み |
| アクセシビリティ統合   | ARIA属性・キーボード操作の全コンポーネント横断検証                  | A11Y-01〜07 | 設計済み |
| 回帰テスト             | 既存テストスイート全件実行による破壊検知                            | タスク4     | 設計済み |

---

## 成果物

| 成果物               | パス                                        | 説明                                   |
| -------------------- | ------------------------------------------- | -------------------------------------- |
| 拡張テストケース一覧 | `outputs/phase-6/expanded-test-cases.md`    | EX-10件 + EH-6件 + A11Y-7件 = 23件追加 |
| 回帰テスト結果       | `outputs/phase-6/regression-test-result.md` | 既存テスト全件PASS確認記録             |
| テスト実行結果       | `outputs/phase-6/test-execution-result.md`  | Phase 4 + Phase 6 全テストの実行結果   |

---

## 完了条件

- [ ] エッジケーステスト（EX-01〜EX-10）が追加されている
- [ ] エラーハンドリングテスト（EH-01〜EH-06）が追加されている
- [ ] アクセシビリティテスト（A11Y-01〜A11Y-07）が追加されている
- [ ] Phase 6追加テスト全件が PASS している
- [ ] 回帰テスト: 既存テスト全件が PASS している（regressionなし）
- [ ] 回帰テスト: interview-widgets テスト全件が PASS している
- [ ] 回帰テスト: skill-creator 関連テスト全件が PASS している
- [ ] 新規Propsの追加が既存コード（型チェック含む）に影響していないことが確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 7: カバレッジ確認 → `phase-7-coverage-check.md`
