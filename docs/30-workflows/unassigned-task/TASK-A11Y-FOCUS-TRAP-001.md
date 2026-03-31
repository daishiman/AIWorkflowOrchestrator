# モーダル表示中の背景フォーカストラップ是正 - タスク指示書

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | TASK-A11Y-FOCUS-TRAP-001                   |
| タスク名     | モーダル表示中の背景フォーカストラップ是正 |
| 分類         | 改善                                       |
| 対象機能     | Onboarding / アクセシビリティ              |
| 優先度       | 高                                         |
| 見積もり規模 | 小規模                                     |
| ステータス   | 未実施                                     |
| 発見元       | `UT-UIUX-PLAYWRIGHT-E2E-001` Phase 11      |
| 発見日       | 2026-03-31                                 |
| Issue番号    | #1810                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`UT-UIUX-PLAYWRIGHT-E2E-001` の Phase 11（3層評価）において、Onboarding オーバーレイ表示中の
Semantic Layer（`ui-ux-layer1`）テスト `SEM-006` が `chat-main` と `sidebar-navigation` の
2 surface で FAIL している。

### 1.2 問題点・課題

dialog 外のナビゲーション要素へ Tab キーでフォーカスが到達できる状態になっている。
WCAG 2.1 SC 2.1.2（キーボードトラップ）の要件として、モーダルダイアログ表示中は
ダイアログ外へのフォーカス移動を防止しなければならない。

### 1.3 放置した場合の影響

- スクリーンリーダーユーザーがモーダル表示中に背景コンテンツを誤操作する可能性がある
- `ui-ux-layer1 SEM-006` が FAIL のまま残り、アクセシビリティ品質が低下し続ける
- 将来的な WCAG 準拠チェックで指摘を受けるリスクがある

---

## 2. 何を達成するか（What）

### 2.1 目的

Onboarding オーバーレイ表示中に背景ナビゲーションと main content を完全にフォーカス不可にし、
`SEM-006` を両 surface で PASS させる。

### 2.2 最終ゴール

- `pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer1 --grep "SEM-006"` が
  `chat-main` / `sidebar-navigation` 両方で PASS する状態

### 2.3 スコープ

#### 含むもの

- Onboarding オーバーレイ表示中の inert 化対象の DOM 監査
- 背景の focusable 要素が残る root / portal の特定と修正
- `inert` 属性付与範囲の拡張、または focus trap owner の App shell 側への移設
- `ui-ux-layer1 SEM-006` の PASS 確認

#### 含まないもの

- `ui-ux-layer2` の visual baseline 更新
- Onboarding 以外のモーダルへの適用（別タスク化推奨）
- WCAG 全項目の再監査

### 2.4 成果物

- 修正済みコンポーネント（inert 化対象の拡張 or focus trap 再設計）
- `ui-ux-layer1 SEM-006` PASS の playwright テスト結果

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `UT-UIUX-PLAYWRIGHT-E2E-001` Phase 11 の `discovered-issues.md` を読んで失敗状況を確認済みであること
- Playwright E2E 環境が動作すること（`playwright.config.ts` の `ui-ux-layer1` プロジェクト設定）

### 3.2 依存タスク

なし（単独実行可能）

### 3.3 必要な知識

- HTML `inert` 属性の動作（サブツリー全体のインタラクティビティを無効化）
- focus trap の実装パターン（`focus-trap` ライブラリ or 自前実装）
- Playwright `getByRole` / `keyboard.press` を使ったアクセシビリティ検証

### 3.4 推奨アプローチ

1. Onboarding オーバーレイ表示時に `<main>` / `<nav>` 要素に `inert` 属性を付与する
2. オーバーレイ非表示時に `inert` 属性を除去する
3. Portal 経由でレンダリングされている場合は Portal の外側コンテナにも `inert` を追加する

---

## 4. 実行手順

### Phase構成

| Phase | 内容       | 目安 |
| ----- | ---------- | ---- |
| 1     | 調査・設計 | 1h   |
| 2     | 実装       | 2h   |
| 3     | テスト確認 | 0.5h |

### Phase 1: 調査・設計

#### 目的

inert 化が必要な DOM 要素を特定し、実装方針を確定する。

#### 手順

1. `apps/desktop/src/renderer/components/organisms/OnboardingWizard/index.tsx` を読み、
   オーバーレイの表示制御ロジックを確認する
2. DevTools でオーバーレイ表示時の DOM 構造を確認し、focusable 要素が残る箇所を特定する
3. `inert` 属性付与範囲と、Portal 使用有無を確認する

#### 成果物

- 修正対象ファイル一覧と実装方針メモ

#### 完了条件

- inert 化対象 DOM と実装方針が確定している

### Phase 2: 実装

#### 目的

`inert` 属性付与により背景コンテンツへのフォーカス到達を防止する。

#### 手順

1. Onboarding オーバーレイが表示される際に `<main>` / `<nav>` 等のルート要素に `inert` を付与する
2. オーバーレイ非表示時に `inert` を除去する
3. Portal（React Portals）経由のレンダリングがある場合は Portal コンテナにも `inert` を追加する

#### 成果物

- 修正済み `OnboardingWizard/index.tsx`（またはその呼び出し元）

#### 完了条件

- `inert` 付与・除去のロジックが実装されている

### Phase 3: テスト確認

#### 目的

`SEM-006` が両 surface で PASS することを確認する。

#### 手順

1. `pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer1 --grep "SEM-006"` を実行する
2. `chat-main` / `sidebar-navigation` の両方が PASS であることを確認する

#### 成果物

- PASS 証跡のスクリーンショットまたはテスト出力

#### 完了条件

- `SEM-006` 2件がともに PASS している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `SEM-006` chat-main が PASS
- [ ] `SEM-006` sidebar-navigation が PASS
- [ ] dialog 表示中に背景ナビゲーションへ Tab 到達しない

### 品質要件

- [ ] `pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer1` で SEM-006 関連テストが PASS
- [ ] 既存の `ui-ux-layer1` テストが新たに FAIL しない

### ドキュメント要件

- [ ] Phase 12 close-out 時に `unassigned-task-detection.md` の formalized 欄を更新する

---

## 6. 検証方法

### テストケース

| テストID          | 内容                                         | 確認コマンド                                              |
| ----------------- | -------------------------------------------- | --------------------------------------------------------- |
| SEM-006-chat-main | チャット画面がモーダル表示中にフォーカス不可 | `playwright test --project=ui-ux-layer1 --grep "SEM-006"` |
| SEM-006-sidebar   | サイドバーがモーダル表示中にフォーカス不可   | 同上                                                      |

### 検証手順

```bash
pnpm --filter @repo/desktop exec playwright test \
  --project=ui-ux-layer1 \
  --grep "SEM-006"
```

---

## 7. リスクと対策

| リスク                                     | 影響度 | 発生確率 | 対策                                                        |
| ------------------------------------------ | ------ | -------- | ----------------------------------------------------------- |
| `inert` 付与範囲が狭く Portal 内要素が残る | 高     | 中       | DevTools で全 focusable 要素を逐一確認する                  |
| `inert` 除去タイミングのずれによるUI破損   | 中     | 低       | useEffect cleanup で確実に除去する                          |
| 他の modal / dialog への副作用             | 中     | 低       | `ui-ux-layer1` 全テストを実行して既存テストの変化を確認する |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/ut-uiux-playwright-e2e-001/outputs/phase-11/discovered-issues.md`
- `.claude/skills/aiworkflow-requirements/references/testing-playwright-e2e.md`
- `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`

### 参考資料

- [WCAG 2.1 SC 2.1.2 No Keyboard Trap](https://www.w3.org/TR/WCAG21/#no-keyboard-trap)
- [HTML `inert` attribute spec](https://html.spec.whatwg.org/multipage/interaction.html#inert)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
SEM-006: dialog 外の focusable 要素へ Tab 到達可能
  - surface: chat-main (FAIL)
  - surface: sidebar-navigation (FAIL)
  発見元: UT-UIUX-PLAYWRIGHT-E2E-001 Phase 11 ui-ux-layer1
```

### 補足事項

- Layer 2 visual baseline drift（`error-display` / `loading-state` / `dark-mode`）は別の MEDIUM 課題として
  `discovered-issues.md` に記録済み。本タスクとは独立して扱う。
