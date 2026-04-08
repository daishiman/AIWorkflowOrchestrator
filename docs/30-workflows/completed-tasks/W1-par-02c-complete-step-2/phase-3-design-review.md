# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 3                                         |
| Phase名    | 設計レビュー                              |
| タスクID   | UT-SKILL-WIZARD-W1-COMPLETE-STEP-001      |
| 機能名     | CompleteStep 完了画面再設計（起点画面化） |
| 前提Phase  | Phase 2: 設計                             |
| 次Phase    | Phase 4: テスト作成                       |
| ステータス | pending                                   |
| 作成日     | 2026-04-07                                |

## 目的

Phase 2 の設計を多角的に検証し、実装前に問題点・リスク・改善点を洗い出す。

## 実行タスク

### Task 1: 設計の整合性チェック

以下の観点で設計を検証する:

| チェック項目                                  | 判定基準                                        |
| --------------------------------------------- | ----------------------------------------------- |
| Propsインターフェースの完全性                 | 全FR要件がPropsに反映されているか               |
| onRetry と onQualityFeedback の責務分離       | 単一責務原則を満たしているか                    |
| hasExternalIntegration の条件付き表示ロジック | false時に外部連携チェックリストが非表示になるか |
| feedbackSubmitted フラグの二重送信防止        | 👍/👎それぞれ1回のみ呼び出されるか              |
| generatedSkill コンテキストの扱い             | 表示責務に流し込まず、親コンテキストに留めるか  |

### Task 2: 既存コードとの整合性チェック

```bash
# SkillCreateWizard.tsx での CompleteStep の現行利用状況を確認
grep -n "CompleteStep" apps/desktop/src/renderer/components/skill/wizard/SkillCreateWizard.tsx

# 現行Props渡しの確認
grep -A 10 "<CompleteStep" apps/desktop/src/renderer/components/skill/wizard/SkillCreateWizard.tsx
```

### Task 3: アクセシビリティレビュー

| 要素                     | アクセシビリティ要件                              |
| ------------------------ | ------------------------------------------------- |
| 👍/👎ボタン              | role="button", aria-label="期待通り" / "やり直す" |
| ネクストアクションカード | role="button", aria-label が各カードに必要        |
| チェックボックス         | role="checkbox", aria-checked 状態管理            |
| 完了ヘッダー             | role="status" または aria-live="polite"           |

### Task 4: W2-seq-03a（SkillCreateWizard）との境界確認

CompleteStep が担う責務 vs W2-seq-03aが担う責務を明確化する:

| 責務                               | 担当         |
| ---------------------------------- | ------------ |
| 👎クリック時にonRetry()を呼び出す  | CompleteStep |
| Step 0へのナビゲーション           | W2-seq-03a   |
| 前回formDataのプリフィル状態管理   | W2-seq-03a   |
| 生成結果コンテキストの再表示・復元 | W2-seq-03a   |

### Task 5: リスク評価

| リスク                                   | 影響度 | 対策                                                         |
| ---------------------------------------- | ------ | ------------------------------------------------------------ |
| onExecuteNow/onOpenInEditor が undefined | 中     | オプショナルPropsなのでボタンをdisabledにする                |
| リカバリーフロー時のformData消失         | 高     | W2-seq-03aでformDataをstateに保持し渡す                      |
| generatedSkill が null                   | 低     | CompleteStep は崩れずに描画し、親の context に依存しすぎない |
| 外部ツール名が長い場合のUI崩れ           | 低     | truncate CSSクラスで折り返し防止                             |

## 参照資料

| 資料名     | パス                              | 説明       |
| ---------- | --------------------------------- | ---------- |
| 設計書     | `outputs/phase-2/design.md`       | 直前成果物 |
| 要件定義書 | `outputs/phase-1/requirements.md` | 要件の根拠 |

## 成果物

| 成果物       | パス                               | 説明                       |
| ------------ | ---------------------------------- | -------------------------- |
| レビュー結果 | `outputs/phase-3/design-review.md` | 指摘事項・改善点・承認判定 |

## 完了条件

- [ ] 整合性チェックが全項目完了している
- [ ] 既存コードとの整合性が確認されている
- [ ] アクセシビリティ要件が定義されている
- [ ] W2-seq-03aとの境界が明確になっている
- [ ] リスク評価と対策が記載されている
- [ ] 設計の承認判定（承認 / 要修正）が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 4: テスト作成](./phase-4-test-creation.md)
