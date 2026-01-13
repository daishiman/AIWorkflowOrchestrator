# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 10                                                   |
| Phase名    | 最終レビューゲート                                   |
| 前提Phase  | Phase 9                                              |
| 後続Phase  | Phase 11                                             |
| ステータス | 未実施                                               |
| 作成日     | 2026-01-13                                           |
| 機能名     | FileSelector アクセシビリティ改善（WCAG 2.1 AA準拠） |

---

## 目的

全体品質・整合性を検証し、手動テストに進む前の最終ゲートを通過させる。

## 背景

Phase 9で品質保証が完了した。手動テスト（Phase 11）に進む前に、以下を最終確認する:

- 要件との整合性
- 設計との整合性
- コード品質
- テストカバレッジ

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 要件との整合性確認

**目的**: Phase 1で定義した要件が全て実装されていることを確認する

**実行手順**:

1. 機能要件チェック:

| 要件                               | 実装状況 | 確認 |
| ---------------------------------- | -------- | ---- |
| フォーカストラップ（useFocusTrap） | TBD      | [ ]  |
| FileSelectorTrigger aria属性       | TBD      | [ ]  |
| FileSelectorModal aria属性         | TBD      | [ ]  |
| FileSelectorFileList role/aria属性 | TBD      | [ ]  |
| aria-live通知                      | TBD      | [ ]  |

2. 受け入れ基準チェック:

| 受け入れ基準                         | 実装状況 | テスト有無 | 確認 |
| ------------------------------------ | -------- | ---------- | ---- |
| AC-1: モーダル表示時フォーカス移動   | TBD      | TBD        | [ ]  |
| AC-2: Tabでフォーカス循環            | TBD      | TBD        | [ ]  |
| AC-3: Shift+Tabで逆順移動            | TBD      | TBD        | [ ]  |
| AC-4: モーダル閉じた後フォーカス復帰 | TBD      | TBD        | [ ]  |
| AC-5: Escapeでモーダル閉じる         | TBD      | TBD        | [ ]  |
| AC-6: aria-expanded同期              | TBD      | TBD        | [ ]  |
| AC-7: aria-selected同期              | TBD      | TBD        | [ ]  |
| AC-8: ダイアログとして認識           | TBD      | TBD        | [ ]  |
| AC-9: 選択時読み上げ                 | TBD      | TBD        | [ ]  |

**期待される成果物**:

- 要件整合性チェック結果（outputs/phase-10/requirements-alignment.md）

---

### タスク2: 設計との整合性確認

**目的**: Phase 2の設計が正しく実装されていることを確認する

**実行手順**:

1. useFocusTrap設計確認:
   - [ ] インターフェースが設計通り
   - [ ] オプションが設計通り
   - [ ] 動作が設計通り

2. aria属性設計確認:
   - [ ] FileSelectorModal: role, aria-modal, aria-labelledby
   - [ ] FileSelectorTrigger: aria-expanded, aria-haspopup, aria-label
   - [ ] FileSelectorFileList: role, aria-selected

3. コンポーネント連携確認:
   - [ ] フォーカスフローが設計通り
   - [ ] イベント伝播が設計通り

**期待される成果物**:

- 設計整合性チェック結果（outputs/phase-10/design-alignment.md）

---

### タスク3: コード品質最終確認

**目的**: コード品質が基準を満たしていることを最終確認する

**実行手順**:

1. 静的解析結果確認:

```bash
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop typecheck
```

2. コードレビュー観点:
   - [ ] 命名が一貫している
   - [ ] 重複コードがない
   - [ ] コメントが適切
   - [ ] エラーハンドリングが適切

3. パフォーマンス確認:
   - [ ] 不要な再レンダリングがない
   - [ ] メモ化が適切

**期待される成果物**:

- コード品質最終確認結果（outputs/phase-10/code-quality-final.md）

---

### タスク4: テストカバレッジ最終確認

**目的**: テストカバレッジが基準を満たしていることを最終確認する

**実行手順**:

1. カバレッジ測定:

```bash
pnpm --filter @repo/desktop test:coverage -- --grep "FileSelector\|useFocusTrap"
```

2. 基準確認:

| 指標              | 基準 | 現在値 | 判定 |
| ----------------- | ---- | ------ | ---- |
| Line Coverage     | 80%+ | TBD    | TBD  |
| Branch Coverage   | 60%+ | TBD    | TBD  |
| Function Coverage | 80%+ | TBD    | TBD  |

3. 全テスト実行:

```bash
pnpm --filter @repo/desktop test:run
```

**期待される成果物**:

- テストカバレッジ最終確認結果（outputs/phase-10/coverage-final.md）

---

### タスク5: システム仕様との整合性確認

**目的**: aiworkflow-requirementsの仕様と実装が整合していることを確認する

**実行手順**:

1. ui-ux-file-selector.md との整合性確認:
   - [ ] アクセシビリティ対応セクションの要件が実装されている
   - [ ] キーボード操作セクションの要件が実装されている

2. ui-ux-design-system.md との整合性確認:
   - [ ] コントラスト比要件を満たしている（1.4.11対応）

**期待される成果物**:

- システム仕様整合性確認結果（outputs/phase-10/spec-alignment.md）

---

### タスク6: 最終レビュー判定

**目的**: 手動テストに進む可否を判定する

**実行手順**:

1. 最終レビュー結果サマリー:

| 確認項目           | 結果 | 備考 |
| ------------------ | ---- | ---- |
| 要件整合性         | TBD  | TBD  |
| 設計整合性         | TBD  | TBD  |
| コード品質         | TBD  | TBD  |
| テストカバレッジ   | TBD  | TBD  |
| システム仕様整合性 | TBD  | TBD  |

2. 最終判定:
   - **PASS**: 全項目合格 → Phase 11へ
   - **MINOR**: 軽微な指摘あり → 指摘対応後Phase 11へ
   - **MAJOR**: 重大な問題あり → 該当Phaseへ戻る
   - **CRITICAL**: 致命的な問題あり → Phase 1へ戻りユーザー確認

**期待される成果物**:

- 最終レビュー判定結果（outputs/phase-10/final-review-decision.md）

---

## 参照資料

| 参照資料                 | パス                                                                       | 内容         |
| ------------------------ | -------------------------------------------------------------------------- | ------------ |
| Phase 1要件              | `outputs/phase-1/`                                                         | 要件定義     |
| Phase 2設計              | `outputs/phase-2/`                                                         | 設計書       |
| Phase 9品質保証          | `outputs/phase-9/`                                                         | 品質保証結果 |
| ファイルセレクターUI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-file-selector.md` | システム仕様 |

---

## 成果物

| 成果物                   | パス                                         | 内容           |
| ------------------------ | -------------------------------------------- | -------------- |
| 要件整合性チェック       | `outputs/phase-10/requirements-alignment.md` | 要件との整合性 |
| 設計整合性チェック       | `outputs/phase-10/design-alignment.md`       | 設計との整合性 |
| コード品質最終確認       | `outputs/phase-10/code-quality-final.md`     | コード品質     |
| テストカバレッジ最終確認 | `outputs/phase-10/coverage-final.md`         | カバレッジ     |
| システム仕様整合性確認   | `outputs/phase-10/spec-alignment.md`         | 仕様との整合性 |
| 最終レビュー判定結果     | `outputs/phase-10/final-review-decision.md`  | 最終判定       |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 10での統合テスト連携アクション

- [ ] 最終レビューで統合テスト結果を確認
- [ ] 全統合テストが成功していることを確認

---

## 完了条件

- [ ] 要件整合性チェックが完了している
- [ ] 設計整合性チェックが完了している
- [ ] コード品質最終確認が完了している
- [ ] テストカバレッジ最終確認が完了している
- [ ] システム仕様整合性確認が完了している
- [ ] 最終レビュー判定がPASSまたはMINORである
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 9（品質保証）が完了していること
- **後続**: Phase 11（手動テスト検証）へ進む

---

## レビューゲート

### レビュー結果判定

| 判定     | 条件                     | 次のアクション            |
| -------- | ------------------------ | ------------------------- |
| PASS     | 全レビュー観点で問題なし | 次のPhaseへ進行           |
| MINOR    | 軽微な指摘あり           | 指摘対応後、次のPhaseへ   |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて戻る      |
| CRITICAL | 致命的な問題あり         | Phase 1へ戻りユーザー確認 |

### 戻り先決定基準

| 問題の種類       | 戻り先                |
| ---------------- | --------------------- |
| 要件の問題       | Phase 1（要件定義）   |
| 設計の問題       | Phase 2（設計）       |
| テスト設計の問題 | Phase 4（テスト）     |
| 実装の問題       | Phase 5（実装）       |
| 品質の問題       | Phase 8（リファクタ） |

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/file-selector-accessibility-improvements/phase-11-manual-testing.md`
