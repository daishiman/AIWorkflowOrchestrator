# Settings画面 ErrorBoundary 導入 - タスク指示書

## メタ情報

```yaml
issue_number: 1045
```

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| タスクID     | UT-FIX-SETTINGS-ERROR-BOUNDARY-001   |
| タスク名     | Settings画面 ErrorBoundary 導入      |
| 分類         | 改善                                 |
| 対象機能     | Settings画面全体の例外フォールバック |
| 優先度       | 中                                   |
| 見積もり規模 | 中規模                               |
| ステータス   | 未実施                               |
| 発見元       | Phase 12                             |
| 発見日       | 2026-03-07                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 で ApiKeysSection に5層防御（L1: namespace確認 → L2: shape正規化 → L3: 配列保証 → L4: 要素フィルタ → L5: 例外キャッチ）を実装した。しかし、これは個別コンポーネント単位の防御であり、Settings画面全体に対する最終防御層（ErrorBoundary）が存在しない。

React のレンダリングフェーズのエラー（JSX内の例外）は try-catch では捕捉できず、ErrorBoundary（componentDidCatch）が唯一の防御手段である。設定画面は API キー管理・認証情報を扱うため、中断時の UX 劣化が深刻。

### 1.2 問題点・課題

- S27（Renderer境界5層防御パターン）は個別コンポーネントの防御であり、React レンダリングエラーには無力
- 5層防御はデータフェッチ時のエラーをカバーするが、JSX内の例外（例: `providers.map(...)` 内で型不一致が発生した場合）は捕捉できない
- 現状 Settings画面には ErrorBoundary がなく、レンダリングエラーでアプリ全体が白画面になる

### 1.3 放置した場合の影響

- 障害発生時にユーザーが設定画面から復帰できず、アプリ再起動が必要になる
- API キー登録中のクラッシュで入力データが失われる
- 障害解析に必要なエラー情報（componentDidCatch のスタックトレース）が記録されない

---

## 2. 何を達成するか（What）

### 2.1 目的

Settings画面に ErrorBoundary を導入し、致命的例外時も復帰可能UIを維持する。

### 2.2 最終ゴール

例外発生時にフォールバックUIと再試行導線が表示される。

### 2.3 スコープ

#### 含むもの

- Settingsルートへの ErrorBoundary 配置
- フォールバックUI実装
- 例外ログ最小記録

#### 含まないもの

- 全画面共通ErrorBoundary化
- Sentry等外部連携追加

### 2.4 成果物

- ErrorBoundary 実装
- フォールバックUI
- テストと手動確認結果

---

## 3. どのように実行するか（How）

### 3.1 前提条件

既存の Settings ルーティング構造を把握していること。

### 3.2 依存タスク

- TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 完了

### 3.3 必要な知識

React ErrorBoundary、アクセシビリティ、Vitest。

### 3.4 推奨アプローチ

最小スコープで Settings に限定導入し、UI/文言/再試行動作を検証する。

---

## 4. 実行手順

### Phase構成

- Phase 1: ErrorBoundary 実装
- Phase 2: Settingsへ適用
- Phase 3: テスト・画面検証

### Phase 3: テスト・画面検証

#### 手順

1. 例外スロー用テストコンポーネントでフォールバック表示を確認
2. スクリーンショット証跡を取得

#### 完了条件

- フォールバックUI表示
- 再試行導線確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Settings で例外時に画面崩壊しない
- [ ] 再試行または戻る導線がある

### 品質要件

- [ ] a11y属性を満たす
- [ ] テストPASS

### ドキュメント要件

- [ ] system spec / lessons 同期

---

## 6. 検証方法

### テストケース

- ErrorBoundary内で例外発生
- 再試行で復帰

### 検証手順

1. unit test 実行
2. screenshot 取得

---

## 7. リスクと対策

| リスク               | 影響度 | 発生確率 | 対策                      |
| -------------------- | ------ | -------- | ------------------------- |
| 例外を過剰に握り潰す | 中     | 中       | ログ粒度と表示文言を分離  |
| UX劣化               | 低     | 中       | 最小UI + 明確な再試行導線 |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md` — 設定画面のUI/UX仕様
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` — S27: Renderer境界5層防御パターン（6層目としてErrorBoundary追加を推奨）
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` — v1.14.0: Renderer側防御層の仕様
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` — TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 の教訓
- `.claude/rules/01-architecture.md` — Apple HIG準拠のUI/UXデザイン哲学、WCAG 2.1 AA
- `.claude/rules/06-known-pitfalls.md` — P48, P49
- `docs/30-workflows/06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001/outputs/phase-12/unassigned-task-report.md`

### 参考資料

- `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`

---

## 9. 備考

### 苦戦箇所（TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 からの教訓）

1. **多層防御の限界認識**: 5層防御（L1-L5）を実装しても、React のレンダリングフェーズのエラー（JSX内の例外）は try-catch では捕捉できない。ErrorBoundary（componentDidCatch）が唯一の防御手段であり、S27 パターンの「6層目」として位置づけるべき

2. **防御範囲の粒度判断**: ApiKeysSection 単体の ErrorBoundary と Settings画面全体の ErrorBoundary のどちらが適切か判断が必要。Settings画面全体を推奨（1箇所で全セクションをカバーし、保守コストを最小化）

3. **Apple HIG 準拠のフォールバックUI設計**: エラー時のフォールバックUIは Apple HIG の Clarity 原則に従い、「問題が発生しました」+「リトライ」ボタンの最小構成とする。過剰な装飾やエラー詳細の露出は避ける

### レビュー指摘の原文

```text
UT-2: ErrorBoundary の導入検討 — 現在の防御は個別のフィルタ・バリデーションで実現しているが、
予期しない例外に対する最終防御として Settings画面に ErrorBoundary を配置することで、
画面全体が真っ白になるリスクを軽減できる。
```

### 補足事項

- 中優先度。設定画面改修タイミングで同時実施推奨
- フォールバックUIは `aria-live="assertive"` でスクリーンリーダーに通知（WCAG 2.1 AA）
- ダークモード対応は CSS変数ベースのスタイリングで実現（Apple HIG System Colors 準拠）
