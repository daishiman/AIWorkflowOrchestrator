# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 9                           |
| カテゴリ   | 品質                        |
| 前提Phase  | Phase 8（リファクタリング） |
| ステータス | 未実施                      |

---

## 1. 目的

アクセシビリティ監査とUI/UX品質検証を行い、製品品質を保証する。

---

## 2. タスク一覧

### Task 1: アクセシビリティ監査（axe DevTools）

#### 概要

axe DevToolsを使用して自動アクセシビリティ監査を実行する。

#### 実行手順

1. 開発サーバーを起動: `pnpm --filter @repo/desktop dev`
2. Chromeでaxe DevTools拡張機能を開く
3. 対象コンポーネントを含むページを監査
4. 検出された問題を記録・修正

#### 監査対象

| コンポーネント       | URL/ルート      | 状態 |
| -------------------- | --------------- | ---- |
| FileAttachmentButton | /workspace-chat | [ ]  |
| FileContextList      | /workspace-chat | [ ]  |
| 全体統合             | /workspace-chat | [ ]  |

#### 監査基準

- WCAG 2.1 AA準拠
- Critical/Serious問題: 0件必須
- Moderate問題: 可能な限り修正

#### 成果物

- `accessibility-audit-report.md`

---

### Task 2: キーボードナビゲーションテスト

#### 概要

キーボードのみで全操作が可能かを手動でテストする。

#### テスト項目

| 操作                             | キー        | 期待動作                 | 結果 |
| -------------------------------- | ----------- | ------------------------ | ---- |
| FileAttachmentButtonにフォーカス | Tab         | フォーカスリング表示     | [ ]  |
| ダイアログを開く                 | Enter/Space | ファイル選択ダイアログ   | [ ]  |
| FileContextListにフォーカス      | Tab         | 最初のバッジにフォーカス | [ ]  |
| 次のバッジに移動                 | Tab         | 次のバッジにフォーカス   | [ ]  |
| 前のバッジに移動                 | Shift+Tab   | 前のバッジにフォーカス   | [ ]  |
| バッジを選択                     | Enter/Space | 選択状態に変化           | [ ]  |
| バッジを削除                     | Delete      | バッジが削除される       | [ ]  |

#### 成果物

- `keyboard-navigation-test.md`

---

### Task 3: スクリーンリーダーテスト

#### 概要

VoiceOver（macOS）またはNVDA（Windows）でスクリーンリーダー対応を検証する。

#### テスト項目

| 要素                 | 期待される読み上げ内容         | 結果 |
| -------------------- | ------------------------------ | ---- |
| FileAttachmentButton | "ファイルを添付、ボタン"       | [ ]  |
| FileContextList      | "添付ファイル一覧、リスト"     | [ ]  |
| FileContextBadge     | "{ファイル名}、削除ボタン付き" | [ ]  |
| 空状態               | "ファイルが添付されていません" | [ ]  |
| エラー表示           | "{エラーメッセージ}、アラート" | [ ]  |

#### 成果物

- `screenreader-test.md`

---

### Task 4: 色コントラスト検証

#### 概要

テキストと背景の色コントラストがWCAG基準を満たしているか検証する。

#### 検証基準

- 通常テキスト: 4.5:1以上
- 大きいテキスト: 3:1以上
- UI要素: 3:1以上

#### 検証ツール

- axe DevTools
- Contrast Checker拡張機能

#### 検証対象

| 要素             | 前景色 | 背景色 | コントラスト比 | 判定 |
| ---------------- | ------ | ------ | -------------- | ---- |
| ボタンテキスト   | -      | -      | -              | [ ]  |
| ファイル名       | -      | -      | -              | [ ]  |
| エラーメッセージ | -      | -      | -              | [ ]  |
| 削除ボタン       | -      | -      | -              | [ ]  |

#### 成果物

- `color-contrast-report.md`

---

### Task 5: Storybook作成

#### 概要

全コンポーネントのStorybook Storiesを作成する。

#### 対象コンポーネント

| コンポーネント       | Stories                        | 状態 |
| -------------------- | ------------------------------ | ---- |
| FileAttachmentButton | Default, Disabled              | [ ]  |
| FileContextList      | Empty, WithFiles, WithSelected | [ ]  |
| FileContextBadge     | Default, Active                | [ ]  |
| FileContextDropZone  | Default, Dragging              | [ ]  |
| ApplyControls        | Default, Loading               | [ ]  |
| DiffEditor           | Default                        | [ ]  |
| DiffPreview          | Default                        | [ ]  |
| EditCommandInput     | Default, WithValue             | [ ]  |

#### 配置先

`apps/desktop/src/renderer/features/workspace-chat-edit/stories/`

#### 成果物

- `*.stories.tsx` ファイル群

---

## 3. 完了条件

- [ ] axe DevTools監査でCritical/Serious問題が0件
- [ ] キーボードナビゲーションが全操作で動作
- [ ] スクリーンリーダーで全要素が適切に読み上げられる
- [ ] 色コントラストがWCAG基準を満たしている
- [ ] 全コンポーネントのStorybook Storiesが作成されている

---

## 4. 統合テスト連携【必須】

品質保証で統合テスト結果を確認:

| 品質項目         | 確認内容          | 結果 |
| ---------------- | ----------------- | ---- |
| 機能検証         | 全自動テスト成功  | [ ]  |
| 統合テスト       | 全統合テスト成功  | [ ]  |
| アクセシビリティ | axe監査PASS       | [ ]  |
| UI/UX            | Storybook確認完了 | [ ]  |

---

## 5. 多角的チェック観点

タスクの性質に応じて、以下の観点を確認する:

| 観点             | 適用判断          | 仕様参照先                                       |
| ---------------- | ----------------- | ------------------------------------------------ |
| アクセシビリティ | ✅ axe監査        | `aiworkflow-requirements: arch-ui-components.md` |
| UI/UX            | ✅ キーボード/SR  | `aiworkflow-requirements: arch-ui-components.md` |
| 品質             | ✅ 色コントラスト | -                                                |

---

## 6. サブタスク管理

Phase実行開始時に、以下のサブタスクを作成・管理すること:

1. Task 1: アクセシビリティ監査（axe DevTools）
2. Task 2: キーボードナビゲーションテスト
3. Task 3: スクリーンリーダーテスト
4. Task 4: 色コントラスト検証
5. Task 5: Storybook作成
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに完了に更新すること。

---

## 7. タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 1-5）を100%実行完了
- [ ] 各タスクの成果物（_-report.md, _.stories.tsx）が生成されている
- [ ] 品質基準をすべて満たしている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

---

## 8. 参照情報

### システム仕様

| 仕様                     | パス                                                                      |
| ------------------------ | ------------------------------------------------------------------------- |
| UIコンポーネントパターン | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md` |

### 外部リソース

- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- axe DevTools: https://www.deque.com/axe/devtools/

---

## 9. 次のPhase

Phase 10: 最終レビューゲート
