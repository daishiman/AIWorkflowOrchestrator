# Phase 9: 品質保証 - 会話型インタビュー UI

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 9                                      |
| Phase名    | 品質保証                               |
| 前提Phase  | Phase 8（リファクタリング）            |
| 後続Phase  | Phase 10（最終レビューゲート）         |
| ステータス | 未実施                                 |
| 作成日     | 2026-04-04                             |
| 機能名     | TASK-P0-06-conversational-interview-ui |

---

## 目的

品質ゲートによる一括判定を実施し、Phase 10（最終レビューゲート）への進行可否を決定する。機能検証、コード品質、テスト網羅性、セキュリティ、アクセシビリティの各観点で品質基準を満たしているかを確認する。

## 背景

Phase 5〜8 で実装・テスト・リファクタリングが完了している。本 Phase では個別の品質観点を横断的に検証し、未達項目があれば対象 Phase に差し戻す。品質ゲートの合否判定は全項目を一括で実施し、部分的な PASS は認めない。

---

## 実行タスク

### タスク1: 機能検証

**目的**: 全ユニットテスト・統合テストが成功することを確認する。

#### 1.1 ユニットテスト実行

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="skill/(ConversationalInterview|useInterviewState|interview-widgets)"
```

#### 1.2 統合テスト実行

```bash
# Phase 7 で定義された統合テストを実行
pnpm --filter @repo/desktop test -- --testPathPattern="skill/(ConversationalInterview|useInterviewState)"
```

#### 判定基準

| チェック項目          | 判定基準                                       | 結果 |
| --------------------- | ---------------------------------------------- | ---- |
| ユニットテスト全 PASS | 失敗テスト 0 件                                | -    |
| 統合テスト全 PASS     | 失敗テスト 0 件                                | -    |
| スキップテスト確認    | `.skip` が付与されたテストがある場合は理由記録 | -    |

---

### タスク2: コード品質

**目的**: Lint・型チェック・フォーマットの品質基準を満たしていることを確認する。

#### 2.1 Lint チェック

```bash
pnpm --filter @repo/desktop lint
```

#### 2.2 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

#### 2.3 フォーマットチェック

```bash
pnpm prettier --check "apps/desktop/src/renderer/components/skill/**/*.{ts,tsx}"
```

#### 判定基準

| チェック項目         | 判定基準                                     | 結果 |
| -------------------- | -------------------------------------------- | ---- |
| Lint エラー 0 件     | ESLint エラーなし（warning は許容）          | -    |
| 型エラー 0 件        | TypeScript strict モードでエラーなし         | -    |
| フォーマット適用済み | Prettier による差分なし                      | -    |
| `any` 型の使用なし   | 変更対象 3 ファイルに `any` が含まれていない | -    |

---

### タスク3: テスト網羅性

**目的**: テストカバレッジが品質基準を満たしていることを確認する。

#### 3.1 カバレッジ計測

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="skill/(ConversationalInterview|useInterviewState|interview-widgets)" --coverage
```

#### 判定基準

| チェック項目                     | 判定基準                                                 | 結果 |
| -------------------------------- | -------------------------------------------------------- | ---- |
| 変更対象ファイルの行カバレッジ   | 80% 以上                                                 | -    |
| 変更対象ファイルの分岐カバレッジ | 70% 以上                                                 | -    |
| 全 5 種 InputKind のテスト存在   | single_select, multi_select, free_text, secret, confirm  | -    |
| undo 操作のテスト存在            | 各 InputKind の undo テスト（secret は空文字復元を含む） | -    |
| バリデーションエラーのテスト存在 | 未入力送信時のエラー表示テスト                           | -    |
| APIキーガイダンスのテスト存在    | 表示条件・ボタンクリック動作のテスト                     | -    |

---

### タスク4: セキュリティ検証

**目的**: secret 種別の取り扱いが安全であることを確認する。

#### チェック項目

| #   | セキュリティ観点              | 確認方法                                                           | 判定基準                                 | 結果 |
| --- | ----------------------------- | ------------------------------------------------------------------ | ---------------------------------------- | ---- |
| 1   | secret 種別 undo の空文字復元 | ユニットテストで secret undo 後の値が空文字であることを検証        | テスト PASS                              | -    |
| 2   | secret 値のメモリ上の保持     | `useInterviewState` で secret 値がセッション終了時にクリアされるか | `reset()` で secretAnswer が初期化される | -    |
| 3   | secret 値のログ出力           | `console.log` / `console.debug` で secret 値が出力されていないか   | grep で検出されないこと                  | -    |
| 4   | secret 値の永続化             | `localStorage` / `sessionStorage` への secret 値保存がないか       | grep で検出されないこと                  | -    |

```bash
# secret 値のログ出力チェック
grep -n "console\.\(log\|debug\|info\).*secret" \
  apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx \
  apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts

# 永続化チェック
grep -n "localStorage\|sessionStorage\|SQLite" \
  apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts
```

---

### タスク5: アクセシビリティ検証

**目的**: アクセシビリティ要件が満たされていることを確認する。

#### チェック項目

| #   | アクセシビリティ観点                | 確認方法                                                         | 判定基準                                               | 結果 |
| --- | ----------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------ | ---- |
| 1   | `role="alert"` バリデーション       | バリデーションエラー表示要素に `role="alert"` が付与されているか | `data-testid="validation-error"` 要素に `role="alert"` | -    |
| 2   | 送信ボタンの `disabled` 属性        | 送信中に `aria-disabled` または `disabled` が設定されているか    | テストで検証済み（AC-8）                               | -    |
| 3   | APIキーガイダンスバナーの認識可能性 | スクリーンリーダーでバナーが認識可能か                           | `role="alert"` または `role="status"` が付与されている | -    |
| 4   | フォーカス管理                      | 新しい質問表示時にフォーカスが入力エリアに移動するか             | 自動フォーカスの実装確認                               | -    |

```bash
# role="alert" の確認
grep -n 'role="alert"\|role=.alert.' \
  apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx
```

---

### タスク6: data-testid 検証

**目的**: Phase 2 で定義した主要 9 項目の data-testid がすべて付与されていることを確認する。

#### チェックリスト

| #   | data-testid                | 付与対象                  | 確認結果 |
| --- | -------------------------- | ------------------------- | -------- |
| 1   | `conversational-interview` | `ConversationalInterview` | -        |
| 2   | `interview-chat-area`      | Chat Message Area         | -        |
| 3   | `interview-input-area`     | Input Widget Area         | -        |
| 4   | `interview-submit`         | 送信ボタン                | -        |
| 5   | `interview-undo`           | undo ボタン               | -        |
| 6   | `validation-error`         | バリデーションエラー      | -        |
| 7   | `api-key-guidance-banner`  | APIキーガイダンス         | -        |
| 8   | `interview-progress-bar`   | `InterviewProgressBar`    | -        |
| 9   | `interview-message-{id}`   | 各メッセージ要素          | -        |

```bash
# data-testid の存在確認
grep -n 'data-testid=' \
  apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx \
  apps/desktop/src/renderer/components/skill/InterviewProgressBar.tsx | \
  grep -o 'data-testid="[^"]*"' | sort -u
```

---

### タスク7: 品質ゲート総合判定

**目的**: 全品質チェック項目の結果を集約し、Phase 10 への進行可否を判定する。

#### 総合判定テーブル

| #   | 品質観点         | 判定基準                          | 結果 | 備考 |
| --- | ---------------- | --------------------------------- | ---- | ---- |
| 1   | 機能検証         | 全テスト PASS                     | -    |      |
| 2   | コード品質       | Lint/型/フォーマット全 PASS       | -    |      |
| 3   | テスト網羅性     | カバレッジ基準達成                | -    |      |
| 4   | セキュリティ     | secret 取り扱い基準達成           | -    |      |
| 5   | アクセシビリティ | role 属性・フォーカス管理基準達成 | -    |      |
| 6   | data-testid      | 主要 9 項目すべて付与             | -    |      |

#### 判定基準

| 判定     | 条件                    | 次のアクション                    |
| -------- | ----------------------- | --------------------------------- |
| **PASS** | **全 6 観点で基準達成** | **Phase 10 へ進行**               |
| MINOR    | 軽微な未達項目あり      | 対象箇所を修正後、Phase 10 へ進行 |
| MAJOR    | 重大な未達項目あり      | Phase 8 または Phase 5 に差し戻し |
| CRITICAL | 致命的な品質問題あり    | Phase 2 に差し戻し、設計見直し    |

---

## 参照資料

| 資料名             | パス                        | 説明                         |
| ------------------ | --------------------------- | ---------------------------- |
| Phase 1 要件定義   | `phase-1-requirements.md`   | AC-1〜AC-9、NFR-01〜NFR-09   |
| Phase 2 設計       | `phase-2-design.md`         | data-testid 一覧、型変換設計 |
| Phase 5 実装       | `phase-5-implementation.md` | 実装詳細                     |
| Phase 8 リファクタ | `phase-8-refactoring.md`    | リファクタリング結果         |
| Issue #1889        | GitHub Issue                | TASK-P0-06 の詳細仕様        |

---

## 統合テスト連携【必須】

品質保証で統合テスト結果を確認する：

| 確認項目                      | 確認方法                                               | 判定基準                                          |
| ----------------------------- | ------------------------------------------------------ | ------------------------------------------------- |
| 統合テスト全 PASS             | Phase 7 の統合テストスイートを再実行                   | 失敗テスト 0 件                                   |
| IPC 接続の健全性              | Session API ↔ ConversationalInterview の統合テスト結果 | 型変換エラーなし、IPC 通信成功                    |
| 全 InputKind エンドツーエンド | 5 種 InputKind の統合テスト結果                        | 全 InputKind で質問受信→回答送信サイクルが動作    |
| P0-06/P0-08 境界維持          | 永続化ロジック混入の grep 検証                         | `useInterviewState.ts` に永続化コードが含まれない |

---

## 成果物

| 成果物           | パス                                | 説明                                  |
| ---------------- | ----------------------------------- | ------------------------------------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | 全 6 観点の品質チェック結果と総合判定 |

---

## 完了条件

- [ ] 機能検証（ユニットテスト + 統合テスト）が全 PASS している
- [ ] Lint エラーが 0 件である
- [ ] 型エラーが 0 件である
- [ ] フォーマットが適用済みである
- [ ] テストカバレッジが基準を満たしている
- [ ] secret 種別 undo の空文字復元が検証されている
- [ ] secret 値のログ出力・永続化がないことが確認されている
- [ ] `role="alert"` がバリデーションエラー要素に付与されている
- [ ] data-testid 主要 9 項目がすべて付与されている
- [ ] 品質ゲート総合判定が PASS である
- [ ] 統合テストが品質保証段階でも継続成功している
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## 次のPhase

Phase 10: 最終レビューゲート → `phase-10-final-review.md`
