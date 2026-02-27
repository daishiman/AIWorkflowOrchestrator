# TASK-9F Setter Injection 適用 - タスク指示書

## メタ情報

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | UT-9F-SETTER-INJECTION-001                                     |
| タスク名     | SkillShareManager への `setMainWindow()` Setter Injection 実装 |
| 分類         | リファクタリング                                               |
| 対象機能     | TASK-9F スキル共有・インポート機能                             |
| 優先度       | 中                                                             |
| 見積もり規模 | 中規模                                                         |
| ステータス   | 未実施                                                         |
| 発見元       | Phase 10 MINOR-01                                              |
| 発見日       | 2026-02-27                                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 2 設計では、BrowserWindow の生成順序を考慮して `SkillShareManager` に Setter Injection を採用する前提だった。

### 1.2 問題点・課題

現実装は Constructor Injection のみで、進捗通知を Renderer へ安全に通知する拡張点が不足している。

### 1.3 放置した場合の影響

長時間処理のUX改善（進捗表示）を追加する際に、Main Process 側で大きな設計変更が再発する。

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillShareManager` に `setMainWindow(mainWindow)` を追加し、進捗イベント通知の注入経路を確立する。

### 2.2 最終ゴール

- `mainWindow` 未設定時でも安全に動作
- `mainWindow` 設定時は進捗イベント送信可能

### 2.3 スコープ

#### 含むもの

- `SkillShareManager` への Setter 追加
- IPC進捗イベント送信ポイントの追加
- 関連テスト追加

#### 含まないもの

- 進捗UIコンポーネント実装
- 通知デザインの最終調整

### 2.4 成果物

- `apps/desktop/src/main/services/skill/SkillShareManager.ts` の更新
- 進捗通知テスト

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-9F 実装が現状で安定していること
- IPC送信元検証ルール（P42/P44/P45）を維持すること

### 3.2 依存タスク

- 依存なし（単独着手可）

### 3.3 必要な知識

- Electron Main/Renderer 間IPC
- Setter Injection パターン

### 3.4 推奨アプローチ

既存の import/export ロジックを壊さないよう、通知は「オプショナル拡張」として追加する。

---

## 4. 実行手順

### Phase構成

- Phase A: サービス拡張
- Phase B: テストと検証

### Phase A: サービス拡張

#### 目的

安全な Setter Injection を実装する。

#### 手順

1. `private mainWindow: BrowserWindow | null` を追加する。
2. `setMainWindow()` を追加する。
3. 進捗通知ヘルパー（null安全）を追加する。

#### 成果物

`SkillShareManager.ts` の Setter Injection 実装。

#### 完了条件

`mainWindow` 未設定時に例外を出さない。

### Phase B: テストと検証

#### 目的

回帰を防ぎながら進捗通知を検証する。

#### 手順

1. mainWindow 未設定ケースのテストを追加。
2. mainWindow 設定ケースのテストを追加。
3. 既存 TASK-9F テストの回帰確認を実施。

#### 成果物

テストケース追加と実行ログ。

#### 完了条件

追加テスト・既存テストがともに PASS。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `setMainWindow()` が実装されている
- [ ] 進捗通知が null 安全である

### 品質要件

- [ ] 既存 API 契約を破壊しない
- [ ] P42/P44/P45 方針に抵触しない

### ドキュメント要件

- [ ] 実装ガイドか task-workflow に変更点を追記

---

## 6. 検証方法

### テストケース

- `mainWindow` 未設定時に import/export が成功する
- `mainWindow` 設定時に進捗イベントが送信される

### 検証手順

1. `pnpm --filter @repo/desktop test:run -- src/main/services/skill/__tests__/SkillShareManager.test.ts`
2. `pnpm --filter @repo/desktop typecheck`

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                                 |
| ------------------------ | ------ | -------- | ------------------------------------ |
| 進捗送信が既存処理を阻害 | 中     | 中       | 通知失敗を握りつぶし、処理本体を優先 |
| テストモック破損         | 低     | 中       | 依存注入境界を固定してモック最小化   |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-share/outputs/phase-2/architecture-design.md`
- `docs/30-workflows/skill-share/outputs/phase-10/final-review-result.md`

### 参考資料

- `.claude/rules/06-known-pitfalls.md#P34`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

`MINOR-01: setMainWindow Setter Injection 未実装`

### 補足事項

本タスクは UI 実装前に Main Process の拡張点を固定する目的で先行して実施する。
