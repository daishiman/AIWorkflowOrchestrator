# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 3                                                          |
| 機能名     | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001          |
| タスク名   | SkillLifecyclePanel.tsx 遷移ボタン化（テキストエリア削除） |
| 前提Phase  | Phase 2                                                    |
| 後続Phase  | Phase 4                                                    |
| 作成日     | 2026-04-08                                                 |
| ステータス | pending                                                    |

---

## 目的

Phase 2 の設計を多角的にレビューし、実装前に設計の矛盾・漏れ・整合性を確認する。  
PASS / MINOR / MAJOR の判定を行い、Phase 4 への進行可否を決定する。

---

## 実行タスク

- **設計整合性確認**: 受け入れ基準（AC-1〜AC-8）との整合確認
- **テスト設計確認**: 6 本のテストファイル更新方針の妥当性確認
- **スコープ境界確認**: current facts における settings / wizard 導線との境界が明確か確認
- **state 依存確認**: `approvedSkillSpec` 削除可否の最終判定
- **ゲート判定**: PASS / MINOR / MAJOR の判定

---

## 参照資料

| 資料名         | パス                                          | 用途           |
| -------------- | --------------------------------------------- | -------------- |
| 設計書         | `outputs/phase-2/design-document.md`          | レビュー対象   |
| テスト更新方針 | `outputs/phase-2/test-update-strategy.md`     | レビュー対象   |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`      | 照合基準       |
| 削除対象分析   | `outputs/phase-1/deletion-target-analysis.md` | 削除対象の全量 |

---

## レビューチェックリスト

### 機能要件確認

- [ ] AC-1: `skill-lifecycle-request-input` textarea 削除の設計が明示されている
- [ ] AC-2: `skill-lifecycle-execution-input` textarea 削除の設計が明示されている
- [ ] AC-3: `data-testid="skill-lifecycle-open-wizard-button"` ボタン追加の設計が明示されている
- [ ] AC-4: 削除する state の設計が明示されている
- [ ] AC-5: 6 本のテストファイル更新方針が明示されている
- [ ] AC-6: Phase 9 QA 基準への対応方針が明示されている
- [ ] AC-7: `SkillCreateWizard` 本体実装がスコープ外として明示されている
- [ ] AC-8: IPC チャンネル変更がスコープ外として明示されている

### 設計品質確認

- [ ] `approvedSkillSpec` state の削除可否に根拠がある
- [ ] `onOpenWizard` / `onOpenSettings` prop の型定義が明確である
- [ ] current facts における settings / wizard 導線の境界が明確に定義されている
- [ ] テスト更新方針に漏れがない（6 本全て対象）
- [ ] レイアウト調整の設計が現行デザインと整合している

### 実装可能性確認

- [ ] 設計が単独で実装可能な粒度である
- [ ] TypeScript 型エラーが発生しない設計になっている
- [ ] Tailwind CSS のスタイリング方針が現行コードと整合している

---

## MINOR 追跡テーブル

Phase 3 で MINOR 判定された指摘を追跡する:

| MINOR ID         | 指摘内容 | 解決予定 Phase | 解決確認 Phase | 備考 |
| ---------------- | -------- | -------------- | -------------- | ---- |
| （実行時に記入） | -        | -              | -              | -    |

---

## ゲート判定基準

| 判定     | 条件                                                         | 対応                                       |
| -------- | ------------------------------------------------------------ | ------------------------------------------ |
| PASS     | 全チェックリスト項目が確認済み・重大な問題なし               | Phase 4 へ進行                             |
| MINOR    | 軽微な問題あり（実装中に解決可能）                           | Phase 4 へ進行（MINOR 追跡テーブルに記録） |
| MAJOR    | 設計に重大な問題あり（受け入れ基準との不整合・スコープ逸脱） | Phase 2 へ戻る                             |
| CRITICAL | 根本的な要件誤りあり                                         | Phase 1 へ戻る                             |

---

## 統合テスト連携

- テスト設計観点（data-testid の変更影響）のレビューを実施する
- 6 本のテストファイル全量の更新方針に漏れがないかを確認する
- `data-testid="skill-lifecycle-open-wizard-button"` のテストケース設計が含まれているかを確認する

---

## 成果物

| 成果物           | パス                                         | 説明                               |
| ---------------- | -------------------------------------------- | ---------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`    | レビュー結果と指摘事項             |
| ゲート判定       | `outputs/phase-3/gate-decision.md`           | PASS/MINOR/MAJOR/CRITICAL 判定結果 |
| 矛盾チェック表   | `outputs/phase-3/contradiction-checklist.md` | 矛盾・漏れ・整合の確認結果         |

---

## 完了条件

- [ ] 全チェックリスト項目の確認が完了した
- [ ] ゲート判定（PASS/MINOR/MAJOR/CRITICAL）が記録された
- [ ] MINOR 判定がある場合、追跡テーブルに記録された
- [ ] Phase 4 開始条件が満たされている（PASS または MINOR）
- [ ] 本 Phase 内の全タスクを 100% 実行完了

---

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] ゲート判定結果を記録した
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 --phase 3
```

---

## Phase 4 開始条件

- ゲート判定が PASS または MINOR であること
- MAJOR・CRITICAL の場合は対応する Phase に戻ること

## 次のPhase

Phase 4: テスト作成
