# FileSelector アクセシビリティ改善 タスク仕様書

## 概要

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | FILE-SEL-A11Y-001                                    |
| タスク名   | FileSelector アクセシビリティ改善（WCAG 2.1 AA準拠） |
| ステータス | 仕様書作成完了                                       |
| 作成日     | 2026-01-13                                           |
| 最終更新日 | 2026-01-14                                           |

---

## 背景

Phase 7-2 アクセシビリティレビューにおいて、FileSelectorコンポーネントに以下の重大なWCAG違反が発見された:

1. **フォーカストラップ未実装**（WCAG 2.4.3）: モーダル表示時にフォーカスが移動せず、閉じた後に元の位置に戻らない
2. **aria-expanded/aria-selected未設定**（WCAG 4.1.2）: スクリーンリーダーで状態が読み上げられない
3. **role属性不足**（WCAG 1.3.1）: listbox/optionロールがなく、セマンティクスが不明確

---

## 目的

FileSelectorコンポーネント群（FileSelectorTrigger, FileSelectorModal, FileSelectorFileList）のWCAG 2.1 AA準拠を達成する。

---

## スコープ

### スコープ内

- FileSelectorTrigger.tsx のaria属性追加
- FileSelectorModal.tsx のフォーカストラップ実装
- FileSelectorFileList.tsx のrole/aria属性追加
- aria-live通知の実装
- useFocusTrap カスタムフックの作成

### スコープ外

- カラーテーマ全体の変更
- 他コンポーネントのアクセシビリティ対応
- WCAG AAA準拠

---

## 対象コンポーネント

| コンポーネント       | パス                                                                                   | 変更内容                                 |
| -------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------- |
| FileSelectorTrigger  | `apps/desktop/src/renderer/components/organisms/FileSelector/FileSelectorTrigger.tsx`  | aria-expanded, aria-haspopup, aria-label |
| FileSelectorModal    | `apps/desktop/src/renderer/components/organisms/FileSelector/FileSelectorModal.tsx`    | role="dialog", フォーカストラップ        |
| FileSelectorFileList | `apps/desktop/src/renderer/components/organisms/FileSelector/FileSelectorFileList.tsx` | role="listbox", aria-selected            |
| useFocusTrap（新規） | `apps/desktop/src/renderer/hooks/useFocusTrap.ts`                                      | フォーカストラップカスタムフック         |

---

## 受け入れ基準

| ID   | 基準                                                      | WCAG要件 |
| ---- | --------------------------------------------------------- | -------- |
| AC-1 | モーダル表示時にフォーカスがモーダル内に自動移動する      | 2.4.3    |
| AC-2 | Tabキー押下でフォーカスがモーダル内で循環する             | 2.4.3    |
| AC-3 | Shift+Tabキーで逆順にフォーカスが移動する                 | 2.4.3    |
| AC-4 | モーダル閉じた後、トリガーボタンにフォーカスが戻る        | 2.4.3    |
| AC-5 | Escapeキーでモーダルが閉じる                              | 2.4.3    |
| AC-6 | トリガーボタンのaria-expandedがモーダル開閉状態と同期する | 4.1.2    |
| AC-7 | リスト項目のaria-selectedが選択状態と同期する             | 4.1.2    |
| AC-8 | スクリーンリーダーで「ダイアログ」として認識される        | 4.1.2    |
| AC-9 | ファイル選択時にスクリーンリーダーで読み上げられる        | 4.1.3    |

---

## Phase構成

| Phase | 名称               | 内容                                             |
| ----- | ------------------ | ------------------------------------------------ |
| 1     | 要件定義           | WCAG違反の整理、機能要件と受け入れ基準の定義     |
| 2     | 設計               | useFocusTrap、aria属性、コンポーネント連携の設計 |
| 3     | 設計レビューゲート | WAI-ARIA Practices準拠の確認                     |
| 4     | テスト作成         | TDDテスト作成（フォーカス、aria、キーボード）    |
| 5     | 実装               | useFocusTrap、各コンポーネントのaria属性実装     |
| 6     | テスト拡張         | エッジケース、統合テストの追加                   |
| 7     | カバレッジ検証     | 80%以上のカバレッジ達成確認                      |
| 8     | リファクタリング   | コード品質改善、共通化                           |
| 9     | 品質保証           | Lint、型チェック、ビルド検証                     |
| 10    | 最終レビューゲート | 要件、設計、コード品質の最終確認                 |
| 11    | 手動テスト検証     | VoiceOver/NVDA、キーボードナビゲーション検証     |
| 12    | ドキュメント更新   | システム仕様書、APIドキュメントの更新            |
| 13    | PR作成             | プルリクエスト作成と提出                         |

---

## 参照資料

| 資料                 | パス                                                                       |
| -------------------- | -------------------------------------------------------------------------- |
| ファイルセレクターUI | `.claude/skills/aiworkflow-requirements/references/ui-ux-file-selector.md` |
| WAI-ARIA Dialog      | https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/                     |
| WAI-ARIA Listbox     | https://www.w3.org/WAI/ARIA/apg/patterns/listbox/                          |
| WCAG 2.1 AA          | https://www.w3.org/TR/WCAG21/                                              |

---

## 変更履歴

| バージョン | 日付       | 変更内容                       |
| ---------- | ---------- | ------------------------------ |
| 1.0.0      | 2026-01-13 | Phase 1-11 タスク仕様書作成    |
| 1.1.0      | 2026-01-14 | Phase 12-13 追加、index.md作成 |
