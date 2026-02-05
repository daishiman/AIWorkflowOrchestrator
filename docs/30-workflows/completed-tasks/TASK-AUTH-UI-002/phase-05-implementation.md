# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値               |
| ------ | ---------------- |
| Phase  | 5                |
| 機能名 | TASK-AUTH-UI-002 |
| 作成日 | 2026-02-04       |

## 目的

テストを通すための実装を確認する。**実装済みのため、実装内容の検証と必要に応じた修正を行う。**

## 実行タスク

- 実装確認: 既存実装がシステム仕様に準拠しているか確認
- テスト実行: 全テストがGreenであることを確認
- 必要に応じた修正: テスト失敗時の修正対応

## 参照資料

| 資料名             | パス                                                                         | 説明          |
| ------------------ | ---------------------------------------------------------------------------- | ------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                                      | Phase 4成果物 |
| 実装ファイル       | `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx`    | 対象ファイル  |
| Portal実装パターン | `.claude/skills/aiworkflow-requirements/references/ui-ux-portal-patterns.md` | 仕様準拠確認  |

## 統合テスト連携【必須】

実装確認項目:

| 実装項目             | 内容                            | 確認結果   |
| -------------------- | ------------------------------- | ---------- |
| createPortal         | document.body直下にレンダリング | ▢ 確認待ち |
| State管理            | isAvatarMenuOpen, menuPosition  | ▢ 確認待ち |
| イベントハンドリング | mousedown, keydown              | ▢ 確認待ち |
| useEffect cleanup    | リスナー解除                    | ▢ 確認待ち |

## 実装チェックリスト

### Portal実装（ui-ux-portal-patterns.md準拠）

| 項目                  | 確認内容                                               | 行番号  | 結果 |
| --------------------- | ------------------------------------------------------ | ------- | ---- |
| createPortal import   | `import { createPortal } from "react-dom"`             | 2       | ▢    |
| MenuPosition型        | `interface MenuPosition { top: number; left: number }` | 24-30   | ▢    |
| menuPosition state    | `useState<MenuPosition \| null>(null)`                 | 105     | ▢    |
| calculateMenuPosition | getBoundingClientRect使用                              | 131-138 | ▢    |
| closeAvatarMenu       | useCallback定義                                        | 118-125 | ▢    |
| Portal描画            | `createPortal(..., document.body)`                     | 494-551 | ▢    |
| z-[9999]              | z-indexクラス適用                                      | 501     | ▢    |
| fixed positioning     | `style={{ top, left }}`                                | 502     | ▢    |

### イベントハンドリング

| 項目                 | 確認内容              | 行番号      | 結果 |
| -------------------- | --------------------- | ----------- | ---- |
| アウトサイドクリック | useEffect + mousedown | 162-181     | ▢    |
| Escapeキー           | useEffect + keydown   | 183-198     | ▢    |
| フォーカス管理       | requestAnimationFrame | 200-211     | ▢    |
| cleanup              | removeEventListener   | 各useEffect | ▢    |

### WAI-ARIA属性

| 項目                   | 確認内容               | 行番号        | 結果 |
| ---------------------- | ---------------------- | ------------- | ---- |
| トリガー aria-label    | "アバターを編集"       | 484           | ▢    |
| トリガー aria-expanded | {isAvatarMenuOpen}     | 485           | ▢    |
| トリガー aria-haspopup | "menu"                 | 486           | ▢    |
| メニュー role          | "menu"                 | 499           | ▢    |
| メニュー aria-label    | "アバター編集メニュー" | 500           | ▢    |
| 項目 role              | "menuitem"             | 505, 518, 536 | ▢    |

## テスト実行

```bash
# Portal関連テスト実行
pnpm --filter @repo/desktop test AccountSection.portal

# 全AccountSectionテスト実行
pnpm --filter @repo/desktop test AccountSection
```

## 成果物

| 成果物           | パス                                       | 説明     |
| ---------------- | ------------------------------------------ | -------- |
| 実装確認レポート | `outputs/phase-5/implementation-report.md` | 確認結果 |

## 完了条件

- [ ] 全テストが成功状態（Green）
- [ ] 実装がPortal実装パターンに準拠している
- [ ] WAI-ARIA属性が完備されている
- [ ] useEffect cleanupが適切に実装されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## 次のPhase

Phase 6: テスト拡充
