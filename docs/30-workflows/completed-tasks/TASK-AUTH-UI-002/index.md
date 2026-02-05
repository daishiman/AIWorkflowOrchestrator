# TASK-AUTH-UI-002: アバターメニューz-index修正

## メタ情報

| 項目         | 内容                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| タスクID     | AUTH-UI-002                                                            |
| タスク名     | アバターメニューz-index修正                                            |
| 分類         | バグ修正                                                               |
| 対象機能     | AccountSection                                                         |
| 優先度       | 高                                                                     |
| 見積もり規模 | 小規模                                                                 |
| ステータス   | **実装完了・検証待ち**                                                 |
| Issue        | [#283](https://github.com/daishiman/AIWorkflowOrchestrator/issues/283) |
| 発見元       | ユーザーフィードバック                                                 |
| 発見日       | 2025-12-10                                                             |
| 関連タスク   | AUTH-UI-001                                                            |
| 作成日       | 2026-02-04                                                             |

---

## 1. 背景（Why）

### 1.1 問題の概要

AUTH-UI-001でz-index値を`z-[9999]`に修正したが、GlassPanelの`backdrop-blur`によって新しいスタッキングコンテキストが作成されるため、z-indexが親GlassPanel内でしか効果を持たない。

### 1.2 技術的原因

CSSのスタッキングコンテキスト（Stacking Context）は以下のプロパティで作成される：

- `backdrop-filter: blur()`
- `filter`
- `transform`
- `opacity < 1`

GlassPanelコンポーネントが`backdrop-blur`を使用しているため、子要素のz-indexは親のスタッキングコンテキスト内でのみ有効になる。

### 1.3 影響

- アバター編集メニューがProfile CardのGlassPanel内にある
- 連携サービスセクション（別のGlassPanel）の下にメニューが隠れる
- ユーザーがアバターメニューのボタンをクリックできない

### 1.4 放置した場合

- アバターのアップロード・変更・削除ができない
- ユーザー体験が著しく低下

---

## 2. 目的（What）

### 2.1 達成目標

アバター編集メニューが常に最前面に表示され、クリック可能になる。

### 2.2 最終ゴール

アバター編集メニューが連携サービスセクションの上に表示される。

### 2.3 スコープ

#### 含むもの

- アバター編集メニューをPortalでレンダリングする修正
- メニュー位置の計算ロジック追加
- WAI-ARIA Menu Pattern準拠のアクセシビリティ対応

#### 含まないもの

- GlassPanelコンポーネント自体の修正
- 他のポップアップ・メニューの修正

---

## 3. 実装状況（現在の状態）

### 3.1 実装完了

以下のファイルで実装が完了している：

| ファイル                                                                                       | 状態 | 内容                 |
| ---------------------------------------------------------------------------------------------- | ---- | -------------------- |
| `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx`                      | ✅   | createPortal実装済み |
| `apps/desktop/src/renderer/components/organisms/AccountSection/AccountSection.portal.test.tsx` | ✅   | Portalテスト実装済み |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-portal-patterns.md`                   | ✅   | システム仕様記載済み |

### 3.2 実装内容

```
実装済み機能:
├── createPortalによるdocument.body直下レンダリング
├── MenuPosition型（top, left座標）
├── calculateMenuPosition()ヘルパー関数
├── closeAvatarMenu()ヘルパー関数
├── アウトサイドクリックハンドラー（useEffect）
├── Escapeキーハンドラー（useEffect）
├── WAI-ARIA属性（role, aria-expanded, aria-haspopup）
└── フォーカス管理（requestAnimationFrame）
```

---

## 4. 解決策（How）

### 4.1 技術的アプローチ

ReactのcreatePortalを使用して、アバター編集メニューを`document.body`直下にレンダリングする。これによりGlassPanelのスタッキングコンテキストから脱出し、z-indexが正しく機能する。

### 4.2 参照システム仕様

| 参照資料             | パス                                                                                        | 内容                            |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------------------- |
| Portal実装パターン   | `.claude/skills/aiworkflow-requirements/references/ui-ux-portal-patterns.md`                | Portal基本パターン、ARIA対応    |
| UIコンポーネント設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | Apple HIG準拠、アクセシビリティ |
| テストパターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | テスト設計パターン              |

---

## 5. Phase構成

| Phase | 名称                 | 内容                           | 状態     |
| ----- | -------------------- | ------------------------------ | -------- |
| 1     | 要件定義             | 要件・受け入れ基準の明文化     | 実行待ち |
| 2     | 設計                 | アーキテクチャ設計の確認       | 実行待ち |
| 3     | 設計レビューゲート   | 実装の妥当性検証               | 実行待ち |
| 4     | テスト作成           | テスト設計・追加テスト作成     | 実行待ち |
| 5     | 実装                 | 実装済み確認・必要に応じて修正 | 実行待ち |
| 6     | テスト拡充           | カバレッジ向上                 | 実行待ち |
| 7     | テストカバレッジ確認 | 基準達成確認                   | 実行待ち |
| 8     | リファクタリング     | コード品質改善                 | 実行待ち |
| 9     | 品質保証             | 品質ゲートクリア               | 実行待ち |
| 10    | 最終レビューゲート   | 最終品質確認                   | 実行待ち |
| 11    | 手動テスト検証       | UI/UX検証                      | 実行待ち |
| 12    | ドキュメント更新     | 仕様書・ガイド更新             | 実行待ち |
| 13    | PR作成               | PR作成・CI確認                 | 実行待ち |

---

## 6. 成果物一覧

### Phase別成果物

| Phase | 成果物                   | パス                                         |
| ----- | ------------------------ | -------------------------------------------- |
| 1     | 要件定義書               | `outputs/phase-1/requirements-definition.md` |
| 2     | アーキテクチャ設計書     | `outputs/phase-2/architecture-design.md`     |
| 3     | 設計レビュー結果         | `outputs/phase-3/design-review-result.md`    |
| 4     | テスト仕様書             | `outputs/phase-4/test-specification.md`      |
| 5     | 実装確認レポート         | `outputs/phase-5/implementation-report.md`   |
| 6     | カバレッジレポート       | `outputs/phase-6/coverage-report.md`         |
| 7     | カバレッジ確認結果       | `outputs/phase-7/coverage-report.md`         |
| 8     | リファクタリングレポート | `outputs/phase-8/refactoring-report.md`      |
| 9     | 品質レポート             | `outputs/phase-9/quality-report.md`          |
| 10    | 最終レビュー結果         | `outputs/phase-10/final-review-result.md`    |
| 11    | 手動テスト結果           | `outputs/phase-11/manual-test-result.md`     |
| 12    | 実装ガイド               | `outputs/phase-12/implementation-guide.md`   |
| 13    | PR情報                   | `outputs/phase-13/pr-info.md`                |

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                              |
| -------------------------- | ------ | -------- | --------------------------------- |
| メニュー位置がずれる       | 中     | 中       | getBoundingClientRectで正確に計算 |
| スクロール時に位置がずれる | 低     | 低       | fixedポジションで対応             |
| イベントリスナー解除漏れ   | 高     | 低       | useEffect cleanupで必ず解除       |

---

## 8. 参照ドキュメント

- [Portal実装パターン](/.claude/skills/aiworkflow-requirements/references/ui-ux-portal-patterns.md)
- [React Portal公式ドキュメント](https://react.dev/reference/react-dom/createPortal)
- [CSS Stacking Context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context)
- [WAI-ARIA Menu Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu/)

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-02-04 | 1.0.0      | 初版作成 |
