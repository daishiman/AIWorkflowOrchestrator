# AccountSection header 統合完全実装 - タスク指示書

## メタ情報

| 項目         | 内容                                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| タスクID     | UT-TASK06-003                                                                   |
| タスク名     | AccountSection header 統合完全実装                                              |
| 分類         | UI改善                                                                          |
| 対象機能     | Settings Header / AccountSection / terminal launcher 導線                       |
| 優先度       | 低                                                                              |
| 見積もり規模 | 中規模                                                                          |
| ステータス   | 未実施                                                                          |
| 発見元       | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 Phase 10 MINOR-03 / Phase 11 DI-0004 |
| 発見日       | 2026-03-17                                                                      |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

AccountSection は末尾移動までで止まり、header 一体化と terminal launcher 常設導線が未完了。

### 1.2 問題点・課題

- Settings 上部での導線一貫性が不足。
- Phase 11 で launcher 要素検出が PARTIAL。

### 1.3 放置した場合の影響

- 利用者が terminal 起動導線を見つけにくい。
- 認証状態とアカウント表示の文脈が分断される。

## 2. 何を達成するか（What）

### 2.1 目的

Account 情報と terminal launcher を Settings header に統合し、常時アクセス導線を確立する。

### 2.2 最終ゴール

- Header に account 要素 + launcher CTA を常設。
- `data-testid` を固定し Phase 11 証跡を安定化。

### 2.3 スコープ

#### 含むもの

- `AppShellHeader` と `AccountSection` の責務再編。
- terminal launcher CTA の配置。
- 画面証跡ハーネスの selector 追加。

#### 含まないもの

- terminal 実行ロジック刷新。
- 認証基盤変更。

### 2.4 成果物

- Header 統合実装。
- Phase 11 キャプチャ安定化。

## 3. どのように実行するか（How）

### 3.1 前提条件

Settings 現行UIが最新であること。

### 3.2 依存タスク

- TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001（完了）

### 3.3 必要な知識

- レスポンシブ UI 設計
- testid 設計

### 3.4 推奨アプローチ

1. Header のレイアウト枠を先に定義。
2. AccountSection の要素を段階移設。
3. launcher testid を追加し screenshot テストを更新。

## 4. 実行手順

1. Header/AccountSection の現状責務を整理。
2. UI 実装と testid 追加。
3. Phase 11 capture script を更新。

## 5. 完了条件チェックリスト

- [ ] Header に account + launcher が常設される
- [ ] Phase 11 で launcher が機械検出できる
- [ ] mobile/desktop で崩れない

## 6. 検証方法

- `pnpm --filter @repo/desktop exec vitest run src/renderer/**/SettingsView*.test.tsx`
- `pnpm --filter @repo/desktop exec node scripts/capture-task-06-main-chat-settings-runtime-sync-phase11.mjs`

## 7. リスクと対策

| リスク                  | 影響度 | 発生確率 | 対策                     |
| ----------------------- | ------ | -------- | ------------------------ |
| Header 過密で可読性低下 | 中     | 中       | 画面幅別レイアウトを分岐 |
| 既存導線との競合        | 中     | 低       | CTA 優先順位を仕様化     |

## 8. 参照情報

- `apps/desktop/src/renderer/components/organisms/AccountSection/`
- `apps/desktop/src/renderer/views/SettingsView/index.tsx`

## 9. 備考

Task06 の DI-0004 から formalize。Phase 12 で登録済み。
