# UT-FIX-APP-CONSOLE-LOG-001 App.tsx プロダクションコード console.log 残存修正 - タスク指示書

## メタ情報

```yaml
task_id: UT-FIX-APP-CONSOLE-LOG-001
task_name: App.tsx プロダクションコード console.log 残存修正
category: コード品質修正
target_feature: App.tsx
priority: 中
scale: 小規模
status: 未実施
source_phase: Phase 10/11 最終レビュー・手動テスト
created_date: 2026-03-20
dependencies: [TASK-04]
```

## メタ情報

| 項目         | 内容                                              |
| ------------ | ------------------------------------------------- |
| タスクID     | UT-FIX-APP-CONSOLE-LOG-001                        |
| タスク名     | App.tsx プロダクションコード console.log 残存修正 |
| 分類         | コード品質修正                                    |
| 対象機能     | App.tsx                                           |
| 優先度       | 中                                                |
| 見積もり規模 | 小規模                                            |
| ステータス   | 未実施                                            |
| 発見元       | Phase 10/11 最終レビュー・手動テスト              |
| 発見日       | 2026-03-20                                        |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 10/11 レビューにて `App.tsx` にプロダクションコードとして `console.log` が残存していることが検出された。

### 1.2 問題点・課題

- `console.log` はデバッグ用途のコードであり、プロダクションコードに残存するべきでない。
- ブラウザの DevTools コンソールに不要なログが出力され、セキュリティ上の情報漏洩リスクがある（P20 パターン）。
- ESLint の `no-console` ルールに違反する可能性がある。

### 1.3 放置した場合の影響

- 開発時のデバッグログがエンドユーザーに露出する。
- セキュリティレビューで指摘対象になる。
- コードレビューでの指摘が継続的に発生する。

## 2. 何を達成するか（What）

### 2.1 目的

`App.tsx` からプロダクションコードに不要な `console.log` を除去し、コード品質を維持する。

### 2.2 最終ゴール

1. `App.tsx` から全ての `console.log` が除去されている。
2. ESLint の `no-console` チェックが PASS する。
3. 必要なデバッグログがある場合は `electron-log` 等のロガーで環境別制御に移行する。

### 2.3 スコープ

#### 含むもの

- `App.tsx` の `console.log` 除去
- 必要に応じた `electron-log` または開発環境ガード（`process.env.NODE_ENV !== 'production'`）への置換

#### 含まないもの

- 他ファイルの `console.log` 対応（別タスク scope）
- App.tsx のロジック変更

### 2.4 成果物

- 実装差分（`App.tsx` の `console.log` 除去）

## 3. どのように実行するか（How）

### 3.1 前提条件

- `apps/desktop/src/renderer/App.tsx` が存在すること

### 3.2 依存タスク

- TASK-04（完了）

### 3.3 必要な知識

- ESLint `no-console` ルール
- `electron-log` の使い方（置換が必要な場合）
- 開発環境ガードパターン（P20 対策）

### 3.4 推奨アプローチ

1. `grep -n "console.log" apps/desktop/src/renderer/App.tsx` で残存箇所を特定する。
2. デバッグ目的のログは削除する。
3. 必要なロギングは `process.env.NODE_ENV !== 'production'` でガードするか `electron-log` に移行する。

## 4. 実行手順

### Phase 構成

- Phase A: console.log の特定と除去
- Phase B: Lint 確認
- Phase C: 仕様同期

### Phase A: console.log の特定と除去

#### 目的

`App.tsx` の不要な `console.log` を除去する。

#### 手順

1. `App.tsx` を開き、全ての `console.log` 呼び出しを特定する。
2. デバッグ目的のログを削除する。必要なログは `electron-log` または開発環境ガードに置換する。
3. ファイルを保存する。

#### 成果物

- `App.tsx` の差分

#### 完了条件

- `App.tsx` に `console.log` が残存しない

### Phase B: Lint 確認

#### 目的

ESLint チェックが通ることを確認する。

#### 手順

1. `pnpm --filter @repo/desktop lint` を実行する。
2. `no-console` エラーが出ないことを確認する。

#### 成果物

- Lint 実行結果

#### 完了条件

- Lint PASS

### Phase C: 仕様同期

#### 目的

未タスク台帳と仕様書を同期する。

#### 手順

1. `task-workflow.md` の残課題テーブルに本タスクを登録する。
2. 関連仕様書に参照リンクを追加する。

#### 成果物

- 更新済み仕様書

#### 完了条件

- 台帳への登録完了

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `App.tsx` から全ての `console.log` が除去されている

### 品質要件

- [ ] `pnpm --filter @repo/desktop lint` が PASS
- [ ] 関連テストが PASS

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に配置済み
- [ ] `task-workflow.md` 残課題テーブルに登録済み

## 6. 検証方法

### テストケース

- Case 1: `grep -n "console.log" apps/desktop/src/renderer/App.tsx` が0件を返す

### 検証手順

```bash
grep -n "console.log" apps/desktop/src/renderer/App.tsx
pnpm --filter @repo/desktop lint
```

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                                    |
| ------------------------------------ | ------ | -------- | ------------------------------------------------------- |
| 必要なデバッグログを誤って削除する   | 低     | 中       | 削除前にログの目的をコメントで確認する                  |
| 置換後のロガーが本番環境でも出力する | 中     | 低       | `NODE_ENV` ガードまたは `electron-log` レベル設定で対応 |

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/renderer/App.tsx`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

### 参考資料

- `.claude/rules/06-known-pitfalls.md`（P20: テスト環境でのログ出力汚染）
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

### task-workflow への登録候補

```
| UT-FIX-APP-CONSOLE-LOG-001 | App.tsx プロダクションコード console.log 残存修正 | コード品質修正 | 中 | 未実施 | docs/30-workflows/unassigned-task/task-04-app-console-log-cleanup.md |
```

### 関連仕様書への参照リンク追加候補

- `development-guidelines.md` のコード品質セクションに本ファイルへのリンクを追加する。

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
UT-FIX-APP-CONSOLE-LOG-001: App.tsx の console.log がプロダクションコードに残存
```

### 補足事項

P20（テスト環境でのログ出力汚染）の防止策として、プロダクションコードから `console.log` を除去する。

## 実装時の注意（苦戦箇所からの教訓）

> TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 で得た教訓。同様の課題を簡潔に解決するための参考情報。

### 特記事項

- このタスクはシンプルな `console.log` 除去であり、特に複雑な落とし穴はない
- 削除前に `grep -n "console.log" apps/desktop/src/renderer/App.tsx` で全箇所を確認してから一括対応すること
- 必要なロギングは `process.env.NODE_ENV !== 'production'` ガードか `electron-log` に移行する（P20 対策）
- 参照: `.claude/rules/06-known-pitfalls.md` P20
