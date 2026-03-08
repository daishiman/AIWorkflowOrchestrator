# Screenshot Harness の data-testid ベース待機条件標準化 - タスク指示書

## メタ情報

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| タスクID     | UT-10A-F-SCREENSHOT-HARNESS-HARDENING                  |
| タスク名     | Screenshot Harness の data-testid ベース待機条件標準化 |
| 分類         | 改善                                                   |
| 対象機能     | Phase 11 スクリーンショット撮影スクリプト              |
| 優先度       | 中                                                     |
| 見積もり規模 | 小規模                                                 |
| ステータス   | 未実施                                                 |
| 発見元       | TASK-10A-F Phase 11 実行時の苦戦箇所 #8                |
| 発見日       | 2026-03-08                                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-F の Phase 11 実行時、wizard capture script が内部例外メッセージ `スクリーンショット検証用エラー` を待機条件に使用していたが、Store action 側で例外を吸収し `スキル生成に失敗しました` というUIフォールバック文言を表示していた。結果として screenshot harness がタイムアウト失敗し、証跡取得に手戻りが発生した。

### 1.2 問題点・課題

1. **内部例外依存**: `capture-skill-create-wizard-screenshots.mjs` が Store action 内部の例外メッセージに依存して待機条件を設定している
2. **UI文言とのミスマッチ**: Store駆動パターンでは内部例外がStore action内で吸収され、UIには汎用エラーメッセージが表示される
3. **analysis側も同様**: `capture-skill-analysis-view-screenshots.mjs` も `data-testid` ではなくCSSセレクタに依存している箇所がある

### 1.3 放置した場合の影響

- Store駆動移行（TASK-10A-G等）が進むにつれ、同様の screenshot harness 失敗が繰り返される
- Phase 11 の証跡取得に毎回デバッグが必要になり、タスク完了速度が低下
- 新規コンポーネント追加時にも同パターンのミスが発生

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 11 スクリーンショット撮影スクリプトの待機条件を `data-testid` ベースに標準化し、Store駆動パターンとの整合性を確保する。

### 2.2 最終ゴール

- 全 capture スクリプトの待機条件が `data-testid` または UI 実文言を使用
- 内部例外メッセージへの依存が 0件
- 新規 capture スクリプト作成時のテンプレートが整備

### 2.3 スコープ

#### 含むもの

- `capture-skill-create-wizard-screenshots.mjs` の待機条件修正
- `capture-skill-analysis-view-screenshots.mjs` の待機条件修正
- capture スクリプトテンプレートの作成
- 対象コンポーネントへの `data-testid` 属性追加（不足箇所）

#### 含まないもの

- Phase 11 仕様書自体の変更
- 新規コンポーネントの screenshot 撮影追加
- CI/CD への screenshot 自動化組み込み

### 2.4 成果物

- 修正済み capture スクリプト 2件
- capture スクリプトテンプレート
- `data-testid` 追加済みコンポーネント

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-10A-F が完了していること（完了済み: 2026-03-07）
- Playwright がインストール済みであること

### 3.2 依存タスク

| タスクID   | 内容                          | ステータス |
| ---------- | ----------------------------- | ---------- |
| TASK-10A-F | Store駆動ライフサイクルUI統合 | 完了       |

### 3.3 必要な知識

- Playwright の `page.waitForSelector()` / `page.locator()` API
- `data-testid` 設計パターン
- Store駆動パターンにおけるエラーフロー（内部例外→Store state→UI表示）

### 3.4 推奨アプローチ

1. 既存 capture スクリプトの待機条件を棚卸し
2. 各待機条件を `data-testid` ベースに置換
3. 不足する `data-testid` をコンポーネントに追加
4. 全 capture スクリプトを実行して動作確認
5. テンプレートを作成

---

## 4. 実行手順

### Phase構成

小規模タスクのため Phase 4-5-9-12 の4フェーズ構成。

### Phase 4-5: テスト作成→実装

#### 目的

capture スクリプトの待機条件を data-testid ベースに標準化

#### 手順

1. `grep -rn "waitFor\|locator\|querySelector" apps/desktop/scripts/capture-*.mjs` で現在の待機条件を棚卸し
2. 内部例外メッセージに依存する箇所を特定
3. 対応する `data-testid` をコンポーネントに追加
4. capture スクリプトの待機条件を `[data-testid="xxx"]` に置換
5. `pnpm --filter @repo/desktop preview` + capture スクリプト実行で動作確認

#### 成果物

修正済み capture スクリプト + data-testid 追加済みコンポーネント

#### 完了条件

- `grep -rn "スクリーンショット検証用エラー" apps/desktop/scripts/` が 0件
- 全 capture スクリプトが正常完了
- 生成された screenshot が TC と 1:1 で紐付け可能

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 全 capture スクリプトの待機条件が `data-testid` または UI 実文言を使用
- [ ] 内部例外メッセージへの依存が 0件
- [ ] capture スクリプトテンプレートが作成済み

### 品質要件

- [ ] 全 capture スクリプトが正常完了
- [ ] ESLint 0エラー
- [ ] TypeScript型チェック PASS（data-testid 追加コンポーネント）

### ドキュメント要件

- [ ] lessons-learned.md に教訓追記
- [ ] capture スクリプトテンプレートにガイドラインを記載

---

## 6. 検証方法

### テストケース

- wizard capture: 全ステップの screenshot が正常取得
- analysis capture: 全状態（default/error/loading/selection）の screenshot が正常取得
- エラー状態: Store が内部例外を吸収した後の UI 文言で正しく待機

### 検証手順

```bash
# preview サーバー起動
pnpm --filter @repo/desktop preview &

# capture スクリプト実行
pnpm --filter @repo/desktop exec node scripts/capture-skill-create-wizard-screenshots.mjs --output-dir /tmp/test-screenshots
pnpm --filter @repo/desktop exec node scripts/capture-skill-analysis-view-screenshots.mjs --output-dir /tmp/test-screenshots

# 内部例外依存チェック
grep -rn "スクリーンショット検証用エラー\|検証用エラー" apps/desktop/scripts/capture-*.mjs
```

---

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                                       |
| ------------------------------------ | ------ | -------- | ---------------------------------------------------------- |
| data-testid 追加によるテスト影響     | 低     | 低       | data-testid は表示に影響しないため、既存テストへの影響なし |
| preview サーバーの非決定的タイミング | 中     | 中       | `waitForSelector` にタイムアウトと retry を設定            |
| Store エラーフローの変更             | 中     | 低       | Store action のエラーハンドリングは変更しない              |

---

## 8. 参照情報

### 関連ドキュメント

- `lessons-learned.md` - TASK-10A-F 苦戦箇所（ワークフロー系）#8（screenshot harness のUI文言依存）
- `arch-state-management.md` - TASK-10A-F セクション（Store駆動パターンのエラーフロー、苦戦箇所サマリ #5）
- `architecture-implementation-patterns.md` - S26（直接IPC→Store移行パターン）
- `06-known-pitfalls.md` - P53（CLI環境でのスクリーンショット取得制約）

### 参考資料

- TASK-10A-F Phase 11 成果物: `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-11/`
- capture スクリプト: `apps/desktop/scripts/capture-skill-*.mjs`

---

## 9. 備考

### TASK-10A-F からの教訓（苦戦箇所）

1. **内部例外 vs UI文言**: Store action が内部例外を吸収し、UIには汎用エラーメッセージを表示する。capture スクリプトは内部実装ではなく UI 表示を待機条件にすべき
2. **data-testid の事前設計**: コンポーネント実装時に screenshot 撮影を考慮した `data-testid` を付与しておくと、Phase 11 の手戻りが減少
3. **scenario 単位の failure diagnostics**: capture スクリプトに各シナリオの成功/失敗を個別に記録する diagnostics を追加すると、デバッグ効率が向上

### 補足事項

- 本タスクは「テスト基盤改善」であり、機能変更は含まない
- Store 駆動移行（TASK-10A-G）の前に実施すると、Phase 11 の効率が向上する
