# validateDOMNesting警告修正 - タスク指示書

## メタ情報

```yaml
issue_number: 595
```

## メタ情報

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| タスクID     | TASK-DOM-NESTING-001                                   |
| タスク名     | validateDOMNesting警告修正（History UIコンポーネント） |
| 分類         | バグ修正                                               |
| 対象機能     | History UI / DOM構造                                   |
| 優先度       | 低                                                     |
| 見積もり規模 | 小規模                                                 |
| ステータス   | 未実施                                                 |
| 発見元       | Phase 12（ui-history-integration.md 残課題セクション） |
| 発見日       | 2026-01-31                                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

History UIコンポーネント（VersionHistory, VersionDetail, ConversionLogs, RestoreDialog等）の実装において、ReactのvalidateDOMNesting警告が発生している。この警告はHTMLのDOM構造ルール（例: `<p>`内に`<div>`を配置してはならない等）に違反していることを示す。ui-history-integration.md の残課題としてCONV-05-03への依存付きで記録されている。

### 1.2 問題点・課題

- Reactのコンソールに`validateDOMNesting`警告が出力される
- HTML仕様違反のDOM構造がブラウザ間で異なる挙動を引き起こす可能性がある
- アクセシビリティツール（スクリーンリーダー等）が誤ったDOM構造を正しく解釈できない場合がある

### 1.3 放置した場合の影響

- 機能的には動作するが、コンソールに警告が継続的に出力される
- ブラウザのHTMLパーサーが暗黙的にDOM構造を修正するため、意図しないレイアウト崩れが発生するリスク
- アクセシビリティの品質が低下する可能性
- コード品質のシグナルとして、他の開発者に誤解を与える

---

## 2. 何を達成するか（What）

### 2.1 目的

History UIコンポーネントのDOM構造をHTML仕様に準拠した形に修正し、validateDOMNesting警告を解消する。

### 2.2 最終ゴール

- Reactコンソールに`validateDOMNesting`警告が出力されない
- History UIの表示・機能に変化がない（視覚的回帰なし）
- 既存テスト（94.43%カバレッジ）が全てPASS

### 2.3 スコープ

#### 含むもの

- History UIコンポーネント内のDOM構造修正
- 対象コンポーネント:
  - `VersionHistory`
  - `VersionDetail`
  - `ConversionLogs`
  - `RestoreDialog`
  - 関連するカスタムHooksのJSX出力
- 修正後の視覚的回帰テスト

#### 含まないもの

- History UIの機能追加・変更
- History UIのスタイル変更（DOM構造修正に伴う最小限のCSS調整は含む）
- 他のコンポーネントのDOM構造修正

### 2.4 成果物

| 成果物             | パス                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| 修正コンポーネント | `apps/desktop/src/renderer/components/history/` 内の該当ファイル           |
| テスト更新         | `apps/desktop/src/renderer/components/history/__tests__/` 内の該当ファイル |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- History UIコンポーネントが実装済み（CONV-05-02完了）
- テストが存在し実行可能

### 3.2 依存タスク

| タスクID   | 内容                 | ステータス |
| ---------- | -------------------- | ---------- |
| CONV-05-02 | 履歴取得サービス実装 | 完了       |

### 3.3 必要な知識

- HTML仕様: コンテンツモデル（Flow content, Phrasing content, Interactive content等）
- React: コンポーネントのDOM出力構造
- CSS: `display`プロパティによるレイアウトの違い（`block` vs `inline`要素）

### 3.4 推奨アプローチ

1. 開発者ツールのコンソールでvalidateDOMNesting警告を全件抽出
2. 各警告の該当箇所を特定（親要素→子要素の不正なネスト）
3. 親要素または子要素のHTML要素を変更（例: `<p>` → `<div>`、`<div>` → `<span>`）
4. 変更に伴うCSS影響を確認・修正
5. 視覚的変化がないことを確認

---

## 4. 実行手順

### Phase構成

小規模タスクのため、簡易フェーズ構成（2-3 Phase）で実行。

### Phase 1: 警告特定

#### 目的

全てのvalidateDOMNesting警告を特定する。

#### 手順

1. History UIを表示した状態でブラウザコンソールを確認
2. `validateDOMNesting` を含む警告を全件リスト化
3. 各警告に対応するコンポーネントと行番号を特定

#### 成果物

- 警告リスト（コンポーネント名、親要素、子要素、行番号）

#### 完了条件

- 全てのvalidateDOMNesting警告が一覧化されている

### Phase 2: 修正・テスト

#### 目的

DOM構造の修正とテスト。

#### 手順

1. 各警告箇所のDOM構造を修正
2. CSS影響がある場合は最小限の調整
3. 既存テストを実行して全件PASSを確認
4. ブラウザコンソールで警告が解消されたことを確認

#### 成果物

- 修正済みコンポーネント

#### 完了条件

- validateDOMNesting警告が0件
- 既存テスト全件PASS
- 視覚的変化なし

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] validateDOMNesting警告が0件になる
- [ ] History UIの表示に視覚的変化がない
- [ ] History UIの機能に影響がない

### 品質要件

- [ ] TypeScript strict PASS
- [ ] ESLint PASS
- [ ] Prettier PASS
- [ ] 既存テスト全件PASS（カバレッジ維持: 94.43%以上）

### ドキュメント要件

- [ ] ui-history-integration.mdの残課題セクションが更新されている

---

## 6. 検証方法

### テストケース

| #   | テストケース                     | 期待結果                    |
| --- | -------------------------------- | --------------------------- |
| 1   | History UI表示時のコンソール確認 | validateDOMNesting警告が0件 |
| 2   | VersionHistoryコンポーネント表示 | 表示に変化なし              |
| 3   | VersionDetailコンポーネント表示  | 表示に変化なし              |
| 4   | ConversionLogsコンポーネント表示 | 表示に変化なし              |
| 5   | RestoreDialogコンポーネント表示  | 表示に変化なし              |
| 6   | 既存ユニットテスト実行           | 全件PASS                    |

### 検証手順

1. `pnpm --filter @repo/desktop test` でテスト実行
2. `pnpm --filter @repo/desktop dev` で開発サーバー起動
3. ブラウザコンソールで`validateDOMNesting`をフィルタし、0件であることを確認
4. 各コンポーネントの表示を目視確認

---

## 7. リスクと対策

| リスク                            | 影響度 | 発生確率 | 対策                                                           |
| --------------------------------- | ------ | -------- | -------------------------------------------------------------- |
| DOM構造変更によるレイアウト崩れ   | 中     | 中       | 変更前後のスクリーンショット比較、CSSの`display`プロパティ確認 |
| テスト内のDOM構造アサーション変更 | 低     | 中       | テストのセレクターをrole/data-testidベースに変更               |
| 修正箇所の見落とし                | 低     | 低       | 全コンポーネントを網羅的にレンダリングして確認                 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント         | パス                                                                          |
| -------------------- | ----------------------------------------------------------------------------- |
| 履歴UI統合仕様       | `.claude/skills/aiworkflow-requirements/references/ui-history-integration.md` |
| 履歴パネルUI仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md`    |
| UIコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`       |

### 参考資料

- MDN HTML Content Categories: Flow content, Phrasing content, Interactive contentのルール
- React validateDOMNesting: DOM構造検証の仕組み

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
ui-history-integration.md L216:
| validateDOMNesting警告修正 | CONV-05-03 | 低 | - |
```

### 補足事項

- 典型的な修正パターン:
  - `<p>` 内の `<div>` → `<p>` を `<div>` に変更、または `<div>` を `<span>` に変更
  - `<a>` 内の `<a>` → ネスト解消
  - `<button>` 内の `<button>` → ネスト解消
- CSSの`display: block`/`display: inline`が変わる場合、スタイル調整が必要
- CONV-05-03（UIコンポーネント実装）と並行して修正するのが効率的
