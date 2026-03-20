# UT-FIX-AGENTVIEW-CTA-ACT-WRAP-001 AgentView.cta.test.tsx act() ラップ未適用 warning 解消 - タスク指示書

## メタ情報

```yaml
task_id: UT-FIX-AGENTVIEW-CTA-ACT-WRAP-001
task_name: AgentView.cta.test.tsx act() ラップ未適用 warning 解消
category: テスト品質修正
target_feature: AgentView.cta.test.tsx
priority: 低
scale: 小規模
status: 未実施
source_phase: Phase 10/11 最終レビュー・手動テスト
created_date: 2026-03-20
dependencies: [TASK-04]
```

## メタ情報

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| タスクID     | UT-FIX-AGENTVIEW-CTA-ACT-WRAP-001                      |
| タスク名     | AgentView.cta.test.tsx act() ラップ未適用 warning 解消 |
| 分類         | テスト品質修正                                         |
| 対象機能     | AgentView.cta.test.tsx                                 |
| 優先度       | 低                                                     |
| 見積もり規模 | 小規模                                                 |
| ステータス   | 未実施                                                 |
| 発見元       | Phase 10/11 最終レビュー・手動テスト                   |
| 発見日       | 2026-03-20                                             |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 10/11 レビューにて `AgentView.cta.test.tsx` のテスト実行時に `act()` ラップが未適用の箇所があり、React のテスト warning が出力されていることが検出された。

### 1.2 問題点・課題

- `act()` ラップなしで状態更新を伴う操作を行うと、React が `Warning: An update to ... inside a test was not wrapped in act(...)` を出力する。
- テスト出力が warning で汚染され、本当のエラーを見落としやすくなる（P20 パターン）。
- P39（happy-dom 環境での `userEvent` 非互換）との兼ね合いで `fireEvent` + `act()` を使用する必要がある。

### 1.3 放置した場合の影響

- テスト実行時の warning が継続的に出力され続ける。
- CI ログが汚染され、将来の実際の問題の発見が遅れる。
- 後続開発者がこのテストを参照して同種の誤りを踏襲する。

## 2. 何を達成するか（What）

### 2.1 目的

`AgentView.cta.test.tsx` の `act()` 未適用箇所を修正し、テスト実行時の React warning をゼロにする。

### 2.2 最終ゴール

1. `AgentView.cta.test.tsx` のテスト実行時に React `act()` warning が出力されない。
2. 全テストが PASS している。
3. `fireEvent` 呼び出しが適切に `act()` または `await act(async () => {...})` でラップされている。

### 2.3 スコープ

#### 含むもの

- `AgentView.cta.test.tsx` の `act()` ラップ追加
- happy-dom 環境における `fireEvent` + `act()` パターンへの統一（P39 対策）

#### 含まないもの

- AgentView のプロダクションコードの変更
- 他テストファイルの同種修正

### 2.4 成果物

- テスト差分（`AgentView.cta.test.tsx` の `act()` ラップ追加）

## 3. どのように実行するか（How）

### 3.1 前提条件

- `apps/desktop/src/renderer/components/agent/__tests__/AgentView.cta.test.tsx` が存在すること
- happy-dom テスト環境で実行可能であること

### 3.2 依存タスク

- TASK-04（完了）

### 3.3 必要な知識

- React Testing Library の `act()` / `await act(async () => {...})` パターン
- P39（happy-dom 環境での `userEvent` 非互換）→ `fireEvent` を使用すること
- P40（テスト実行ディレクトリ依存）→ `apps/desktop/` ディレクトリから実行すること

### 3.4 推奨アプローチ

1. テストを実行して warning の発生箇所を特定する。
2. 非同期状態更新を伴う `fireEvent` 呼び出しを `await act(async () => { fireEvent.xxx(el) })` でラップする。
3. 同期的な状態更新のみの場合は `act(() => { fireEvent.xxx(el) })` でラップする。

```typescript
// P39 準拠: happy-dom では userEvent ではなく fireEvent を使用
// act() ラップ必須
await act(async () => {
  fireEvent.click(ctaButton);
});
```

## 4. 実行手順

### Phase 構成

- Phase A: warning 発生箇所の特定と act() ラップ追加
- Phase B: テスト実行確認
- Phase C: 仕様同期

### Phase A: warning 発生箇所の特定と act() ラップ追加

#### 目的

`AgentView.cta.test.tsx` の `act()` 未適用箇所を特定し修正する。

#### 手順

1. `cd apps/desktop && pnpm vitest run src/renderer/components/agent/__tests__/AgentView.cta.test.tsx 2>&1 | grep "Warning"` で warning 発生箇所を特定する。
2. 各 warning に対応する `fireEvent` 呼び出しを `act()` でラップする。
3. `userEvent` が使用されている場合は P39 準拠で `fireEvent` に置換する。

#### 成果物

- `AgentView.cta.test.tsx` の差分

#### 完了条件

- `act()` ラップが全ての非同期状態更新箇所に適用されている

### Phase B: テスト実行確認

#### 目的

修正後に warning が消えて全テストが PASS することを確認する。

#### 手順

1. `apps/desktop/` ディレクトリ内で `pnpm vitest run src/renderer/components/agent/__tests__/AgentView.cta.test.tsx` を実行する（P40 準拠）。
2. テスト結果と標準エラー出力に `Warning: An update to ... was not wrapped in act(...)` が含まれていないことを確認する。
3. 全テストが PASS することを確認する。

#### 成果物

- テスト実行結果（warning なし）

#### 完了条件

- 全テスト PASS、warning 0 件

### Phase C: 仕様同期

#### 目的

未タスク台帳と仕様書を同期する。

#### 手順

1. `task-workflow.md` の残課題テーブルに本タスクを登録する。

#### 成果物

- 更新済み仕様書

#### 完了条件

- 台帳への登録完了

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `AgentView.cta.test.tsx` の全テストが PASS

### 品質要件

- [ ] テスト実行時に `act()` 関連 warning が出力されない
- [ ] P39 準拠: `fireEvent` + `act()` パターンが使用されている
- [ ] P40 準拠: `apps/desktop/` ディレクトリから実行して PASS

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に配置済み
- [ ] `task-workflow.md` 残課題テーブルに登録済み

## 6. 検証方法

### テストケース

- Case 1: テスト実行出力に `Warning: An update to ... was not wrapped in act(...)` が含まれない
- Case 2: 全テストが PASS

### 検証手順

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260320-113406-wt-2/apps/desktop
pnpm vitest run src/renderer/components/agent/__tests__/AgentView.cta.test.tsx 2>&1 | grep -E "PASS|FAIL|Warning"
```

## 7. リスクと対策

| リスク                                          | 影響度 | 発生確率 | 対策                                                 |
| ----------------------------------------------- | ------ | -------- | ---------------------------------------------------- |
| act() ラップでテストが非同期化し遅くなる        | 低     | 低       | タイムアウト設定を確認する                           |
| userEvent を fireEvent に置換すると挙動が変わる | 低     | 中       | P39 パターン確認後、既存の期待値が正しいか再確認する |

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/renderer/components/agent/__tests__/AgentView.cta.test.tsx`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

### 参考資料

- `.claude/rules/06-known-pitfalls.md`（P39: happy-dom 環境での userEvent 非互換、P40: テスト実行ディレクトリ依存）
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

### task-workflow への登録候補

```
| UT-FIX-AGENTVIEW-CTA-ACT-WRAP-001 | AgentView.cta.test.tsx act() ラップ未適用 warning 解消 | テスト品質修正 | 低 | 未実施 | docs/30-workflows/unassigned-task/task-04-agentview-cta-act-wrap.md |
```

### 関連仕様書への参照リンク追加候補

- テスト品質ガイドラインに P39 対策として本ファイルへのリンクを追加する。

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
UT-FIX-AGENTVIEW-CTA-ACT-WRAP-001: AgentView.cta.test.tsx の act() ラップ未適用 warning 解消
```

### 補足事項

P39（happy-dom 環境での `userEvent` 非互換）および P40（テスト実行ディレクトリ依存）に注意して修正すること。
`userEvent.setup()` を使用している箇所がある場合は `fireEvent` + `act()` パターンに置換する。

## 実装時の注意（苦戦箇所からの教訓）

> TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 で得た教訓。同様の課題を簡潔に解決するための参考情報。

### P39: happy-dom 環境での act() + fireEvent パターン

- happy-dom 環境では `userEvent.setup()` が Symbol 操作エラーを起こす。`fireEvent` + `act()` に置き換えること
- 非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む
- 参照: `.claude/rules/06-known-pitfalls.md` P39

### P40: テスト実行ディレクトリ依存

- モノレポ環境では `cd apps/desktop && pnpm exec vitest run src/...` で実行すること
- プロジェクトルートからの実行では `vitest.config.ts` の happy-dom 設定が読み込まれずテストが失敗する
- 参照: `.claude/rules/06-known-pitfalls.md` P40
