# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 1                                                    |
| Phase名    | 要件定義                                             |
| 前提Phase  | なし                                                 |
| 後続Phase  | Phase 2                                              |
| ステータス | 未実施                                               |
| 作成日     | 2026-01-13                                           |
| 機能名     | FileSelector アクセシビリティ改善（WCAG 2.1 AA準拠） |

---

## 目的

FileSelectorコンポーネント群（FileSelectorTrigger, FileSelectorModal, FileSelectorFileList）のWCAG 2.1 AA準拠を達成するための要件を明確化し、受け入れ基準を定義する。

## 背景

Phase 7-2 アクセシビリティレビューにおいて、FileSelectorコンポーネントに以下の重大なWCAG違反が発見された:

1. **フォーカストラップ未実装**（WCAG 2.4.3）: モーダル表示時にフォーカスが移動せず、閉じた後に元の位置に戻らない
2. **aria-expanded/aria-selected未設定**（WCAG 4.1.2）: スクリーンリーダーで状態が読み上げられない
3. **role属性不足**（WCAG 1.3.1）: listbox/optionロールがなく、セマンティクスが不明確

これらの問題により、スクリーンリーダーユーザーやキーボードユーザーがFileSelectorを正しく操作できない状態にある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 現状分析と課題整理

**目的**: 既存のアクセシビリティ問題を網羅的に整理する

**実行手順**:

1. `apps/desktop/src/renderer/components/organisms/FileSelector/` 配下の全コンポーネントを確認
2. 以下の課題を現状ファイルと対応付けて整理:
   | No. | 重要度 | WCAG基準 | ファイル | 問題 |
   | --- | -------- | -------- | ------------------------ | -------------------------------------- |
   | 1 | MAJOR | 2.4.3 | FileSelectorModal.tsx | モーダル表示時にフォーカスが移動しない |
   | 2 | MAJOR | 2.4.3 | FileSelectorModal.tsx | モーダル閉じた後にフォーカスが戻らない |
   | 3 | MAJOR | 4.1.2 | FileSelectorTrigger.tsx | aria-expanded未設定 |
   | 4 | MAJOR | 4.1.2 | FileSelectorFileList.tsx | aria-selected未設定 |
   | 5 | MODERATE | 1.3.1 | FileSelectorFileList.tsx | role="listbox"と"option"がない |
   | 6 | MODERATE | 4.1.2 | FileSelectorTrigger.tsx | aria-label未設定 |
   | 7 | MINOR | 4.1.3 | FileSelectorFileList.tsx | 選択時のaria-live通知がない |
   | 8 | MINOR | 1.4.11 | 全ファイル | カスタムカラーのコントラスト比未検証 |

3. システム仕様との整合性確認（ui-ux-file-selector.md参照）

**期待される成果物**:

- 現状分析レポート（outputs/phase-1/current-state-analysis.md）

---

### タスク2: 機能要件定義

**目的**: WCAG 2.1 AA準拠に必要な機能要件を定義する

**実行手順**:

1. フォーカス管理要件を定義:
   - モーダル表示時: フォーカスをモーダル内の最初のフォーカス可能要素に移動
   - モーダル内: Tabキーでフォーカスがモーダル内で循環（フォーカストラップ）
   - モーダル終了時: フォーカスをトリガー要素に戻す

2. aria属性要件を定義:
   - FileSelectorTrigger: `aria-expanded`, `aria-haspopup="dialog"`, `aria-label`
   - FileSelectorModal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`
   - FileSelectorFileList: `role="listbox"`, `role="option"`, `aria-selected`

3. 通知要件を定義:
   - 選択変更時: `aria-live="polite"` で状態変更を通知

**期待される成果物**:

- 機能要件定義書（outputs/phase-1/functional-requirements.md）

---

### タスク3: 受け入れ基準定義

**目的**: テスト可能な受け入れ基準を定義する

**実行手順**:

1. フォーカス管理の受け入れ基準:
   - [ ] AC-1: モーダル表示時にフォーカスがモーダル内に自動移動する
   - [ ] AC-2: Tabキー押下でフォーカスがモーダル内で循環する
   - [ ] AC-3: Shift+Tabキーで逆順にフォーカスが移動する
   - [ ] AC-4: モーダル閉じた後、トリガーボタンにフォーカスが戻る
   - [ ] AC-5: Escapeキーでモーダルが閉じる

2. aria属性の受け入れ基準:
   - [ ] AC-6: トリガーボタンのaria-expandedがモーダル開閉状態と同期する
   - [ ] AC-7: リスト項目のaria-selectedが選択状態と同期する
   - [ ] AC-8: スクリーンリーダーで「ダイアログ」として認識される

3. 通知の受け入れ基準:
   - [ ] AC-9: ファイル選択時にスクリーンリーダーで読み上げられる

**期待される成果物**:

- 受け入れ基準一覧（outputs/phase-1/acceptance-criteria.md）

---

### タスク4: スコープと制約の文書化

**目的**: 本タスクのスコープと制約を明確にする

**実行手順**:

1. スコープ内を文書化:
   - FileSelectorTrigger.tsx のaria属性追加
   - FileSelectorModal.tsx のフォーカストラップ実装
   - FileSelectorFileList.tsx のrole/aria属性追加
   - aria-live通知の実装
   - useFocusTrap カスタムフックの作成

2. スコープ外を文書化:
   - カラーテーマ全体の変更
   - 他コンポーネントのアクセシビリティ対応
   - WCAG AAA準拠
   - WorkspaceFileSelectorモード（既にアクセシビリティ対応済みの場合）

3. 制約を文書化:
   - 既存のUI/UXを大きく変更しない
   - パフォーマンスへの影響を最小限にする
   - 既存テストを破壊しない

**期待される成果物**:

- スコープ定義書（outputs/phase-1/scope-definition.md）

---

## 参照資料

| 参照資料                 | パス                                                                                 | 内容                                         |
| ------------------------ | ------------------------------------------------------------------------------------ | -------------------------------------------- |
| ファイルセレクターUI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-file-selector.md`           | FileSelectorの既存仕様とアクセシビリティ要件 |
| デザインシステム         | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`           | コントラスト比要件とカラー定義               |
| 未タスク指示書           | `docs/30-workflows/unassigned-task/task-file-selector-accessibility-improvements.md` | 元の課題発見レポート                         |

---

## 成果物

| 成果物           | パス                                         | 内容                           |
| ---------------- | -------------------------------------------- | ------------------------------ |
| 現状分析レポート | `outputs/phase-1/current-state-analysis.md`  | 既存の課題と対象ファイルの整理 |
| 機能要件定義書   | `outputs/phase-1/functional-requirements.md` | WCAG準拠に必要な機能要件       |
| 受け入れ基準一覧 | `outputs/phase-1/acceptance-criteria.md`     | テスト可能な受け入れ基準       |
| スコープ定義書   | `outputs/phase-1/scope-definition.md`        | スコープ内外と制約の定義       |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 1での統合テスト連携アクション

- [ ] 接続要件の明記: FileSelectorコンポーネント間のイベント伝播要件
- [ ] フォーカス管理の統合ポイント: モーダル開閉時のフォーカス移動
- [ ] スクリーンリーダー連携: aria-live通知のタイミング要件

---

## 完了条件

- [ ] 現状分析レポートが作成されている
- [ ] 機能要件定義書が作成されている
- [ ] 受け入れ基準一覧が作成されている
- [ ] スコープ定義書が作成されている
- [ ] 全ての要件がWCAG 2.1 AAに準拠している
- [ ] システム仕様（ui-ux-file-selector.md）との整合性が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（独立して開始可能）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/file-selector-accessibility-improvements/phase-2-design.md`
