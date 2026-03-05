# UT-UI-01-NAV-ACCESSIBILITY-POLISH-001 ナビゲーション視認性・モバイル配置改善 - タスク指示書

## メタ情報

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | UT-UI-01-NAV-ACCESSIBILITY-POLISH-001          |
| タスク名     | AppDock のコントラスト改善とモバイル配置最適化 |
| 分類         | 改善                                           |
| 対象機能     | TASK-UI-01-STORE-IPC-ARCHITECTURE              |
| 優先度       | 中                                             |
| 見積もり規模 | 小規模                                         |
| ステータス   | 未実施                                         |
| 発見元       | Phase 11 手動テスト（Apple UI/UX視覚検証）     |
| 発見日       | 2026-03-05                                     |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

AppDock のアイコン/境界線コントラストが低く、モバイル表示時のナビ配置も最適化余地があることを手動テストで確認した。

### 1.2 問題点・課題

- 低コントラスト環境でナビアイコンの判読性が落ちる
- 390x844 で固定サイド配置のため、モバイル操作導線が最短化されていない

### 1.3 放置した場合の影響

アクセシビリティ評価の低下と、モバイル操作時の認知負荷増加につながる。

## 2. 何を達成するか（What）

### 2.1 目的

AppDock の視認性とモバイルナビゲーションの操作性を改善する。

### 2.2 最終ゴール

- AppDock の主要アイコン/区切り線が WCAG AA 相当の視認性を満たす
- モバイル表示時にボトムナビゲーションとして自然に操作できる

### 2.3 スコープ

#### 含むもの

- AppDock 配色/境界線トークン調整
- モバイル時のレイアウト最適化（ボトム配置含む）
- 関連コンポーネントテスト更新

#### 含まないもの

- 情報設計そのものの刷新（メニュー数・役割変更）
- 新規画面追加

### 2.4 成果物

- `AppDock` のスタイル更新
- 画面証跡（Desktop/Mobile）
- テスト更新結果

## 3. どのように実行するか（How）

### 3.1 前提条件

- `apps/desktop/src/renderer/components/organisms/AppDock/index.tsx` の現行スタイル把握
- Design Token (`hig-*`) の利用方針確認

### 3.2 依存タスク

- TASK-UI-01-STORE-IPC-ARCHITECTURE（完了）

### 3.3 必要な知識

- Tailwind + Design Token の配色設計
- Apple HIG / WCAG AA のコントラスト観点

### 3.4 推奨アプローチ

1. コントラスト改善を先行適用して Desktop/Mobile 双方の可読性を確認する。
2. モバイル時の配置変更は既存操作導線を壊さない段階的変更で行う。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                       | 発見経緯                                                                                     | 解決策                                                                             | 教訓                                                          |
| -------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 検証コマンド経路のドリフト | Phase 12 再監査時にグローバルCLI依存で実行環境差分が発生しやすかった                         | `node .claude/skills/task-specification-creator/scripts/*.js` に実体経路を固定する | 再監査コマンドは「実体パス固定」を前提に設計する              |
| 画面証跡時刻の同期漏れ     | 再撮影後に `manual-test-result.md` / `screenshot-coverage.md` の時刻が古いまま残りやすかった | 再撮影直後に `stat` で時刻を採番し、成果物と台帳へ同時反映する                     | UI証跡更新は「再撮影→時刻同期→coverage検証」を1ターンで閉じる |
| 再撮影後の残留プロセス     | `vite` / `capture-*` が残留して次工程で競合しやすかった                                      | `ps -ef` で残留を確認し、不要プロセスを停止してから次工程へ進む                    | UI再撮影は cleanup までを完了条件に含める                     |

## 4. 実行手順

### Phase構成

1. 現状計測
2. スタイル調整
3. テスト・画面検証
4. 仕様同期

### Phase 1: 実装

#### 目的

コントラストと配置の改善を実コードへ反映する。

#### 手順

1. AppDock のアイコン色/境界線色を調整する。
2. モバイル時の配置（下部固定）を実装する。
3. `AppDock.test.tsx` の期待値を更新する。

#### 成果物

UI実装差分 + テスト差分

#### 完了条件

Desktop/Mobile で視認性が改善し、既存遷移が維持されること。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] AppDock の視認性が改善されている
- [ ] モバイル時のナビ配置が最適化されている

### 品質要件

- [ ] 関連テストが PASS する
- [ ] 手動スクリーンショット検証が PASS する

### ドキュメント要件

- [ ] `task-workflow.md` の残課題ステータスを更新する
- [ ] 関連仕様書（ui-ux-navigation / ui-ux-components）を更新する

## 6. 検証方法

### テストケース

- ナビ表示（desktop/mobile）
- 各ボタン遷移
- モバイル時のレイアウト

### 検証手順

1. `pnpm --filter @repo/desktop exec vitest run src/renderer/components/organisms/AppDock/AppDock.test.tsx`
2. スクリーンショットを Desktop/Mobile で再取得し、視認性を目視確認する。

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                                             |
| ---------------------------------- | ------ | -------- | ------------------------------------------------ |
| 配色変更で既存テーマと不整合が発生 | 中     | 中       | 既存トークンに寄せた最小変更 + Light/Dark 両確認 |
| モバイル配置変更で誤タップ増加     | 中     | 低       | タップ領域と間隔をテストで固定                   |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/task-056-ui-01-store-ipc-architecture/outputs/phase-11/manual-test-result.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`

### 参考資料

- `.claude/rules/06-known-pitfalls.md`

## 9. 備考

本タスクは機能追加ではなく UX 品質改善を目的とする。IPC 契約や Store 型の変更は原則行わない。
