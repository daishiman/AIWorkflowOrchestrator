# UT-FIX-VIEWHISTORY-ACCUMULATION-001 viewHistory セッション中蓄積の上限設定検討 - タスク指示書

## メタ情報

```yaml
task_id: UT-FIX-VIEWHISTORY-ACCUMULATION-001
task_name: viewHistory セッション中蓄積の上限設定検討
category: 設計改善
target_feature: viewHistory（Store / App.tsx）
priority: 低
scale: 小規模
status: 未実施
source_phase: Phase 10/11 最終レビュー・手動テスト
created_date: 2026-03-20
dependencies: [TASK-04]
```

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | UT-FIX-VIEWHISTORY-ACCUMULATION-001        |
| タスク名     | viewHistory セッション中蓄積の上限設定検討 |
| 分類         | 設計改善                                   |
| 対象機能     | viewHistory（Store / App.tsx）             |
| 優先度       | 低                                         |
| 見積もり規模 | 小規模                                     |
| ステータス   | 未実施                                     |
| 発見元       | Phase 10/11 最終レビュー・手動テスト       |
| 発見日       | 2026-03-20                                 |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 10/11 レビューにて `viewHistory`（ビュー履歴）がセッション中に無制限に蓄積される可能性があることが検出された。長時間セッションや頻繁なビュー切り替えを行うユーザーにとって、メモリ使用量が増大するリスクがある。

### 1.2 問題点・課題

- `viewHistory` に上限が設定されていない場合、セッション継続中にエントリが無制限に増加する。
- Zustand Store のメモリ使用量が時間とともに増大する。
- デバッグ時に `viewHistory` の長大なリストが DevTools で確認しにくくなる。

### 1.3 放置した場合の影響

- 長時間利用ユーザーでメモリ圧迫が発生する可能性がある。
- セッション中の `viewHistory` 配列が数百〜数千エントリに達した場合のパフォーマンス劣化。

## 2. 何を達成するか（What）

### 2.1 目的

`viewHistory` のセッション中蓄積に適切な上限を設定し、長時間利用時のメモリ圧迫リスクを排除する。

### 2.2 最終ゴール

1. `viewHistory` の最大エントリ数が定数（例: 100件）で定義されている。
2. 上限超過時に古いエントリから削除される（FIFO）。
3. 上限設定に関するテストが追加されている。

### 2.3 スコープ

#### 含むもの

- `viewHistory` を管理する Store Slice または App.tsx での上限設定
- 上限超過時の FIFO 削除ロジック
- 関連テストの追加

#### 含まないもの

- viewHistory の永続化（セッションをまたいだ保存）
- ユーザー設定画面での上限変更機能

### 2.4 成果物

- 実装差分（上限設定ロジックの追加）
- テスト追加（上限超過時の FIFO 動作確認）

## 3. どのように実行するか（How）

### 3.1 前提条件

- `viewHistory` を管理する Store Slice または App.tsx が存在すること
- 関連テストが実行可能であること

### 3.2 依存タスク

- TASK-04（完了）

### 3.3 必要な知識

- Zustand Store Slice の更新ロジック
- FIFO（First In, First Out）配列操作

### 3.4 推奨アプローチ

1. `viewHistory` を管理するファイルを `grep -rn "viewHistory" apps/desktop/src/` で特定する。
2. 上限値を定数（例: `const VIEW_HISTORY_MAX_SIZE = 100`）として定義する。
3. 新規エントリ追加時に上限チェックを行い、超過した場合は先頭エントリを削除する（slice）。

```typescript
// 例
const VIEW_HISTORY_MAX_SIZE = 100;
const newHistory = [...state.viewHistory, newEntry].slice(
  -VIEW_HISTORY_MAX_SIZE,
);
```

## 4. 実行手順

### Phase 構成

- Phase A: viewHistory 管理箇所の特定と上限ロジックの追加
- Phase B: テスト追加
- Phase C: 仕様同期

### Phase A: viewHistory 管理箇所の特定と上限ロジックの追加

#### 目的

`viewHistory` の蓄積に上限を設ける。

#### 手順

1. `grep -rn "viewHistory" apps/desktop/src/` で管理箇所を特定する。
2. 上限値を定数として定義する。
3. エントリ追加ロジックに上限チェックと FIFO 削除を追加する。

#### 成果物

- 実装差分

#### 完了条件

- `viewHistory` の最大エントリ数が定数で制限されている

### Phase B: テスト追加

#### 目的

上限設定と FIFO 動作をテストで保証する。

#### 手順

1. 対応するテストファイルを開く。
2. 上限超過時に古いエントリが削除されることをテストするケースを追加する。
3. テストを実行して PASS を確認する。

#### 成果物

- テスト差分

#### 完了条件

- 上限・FIFO テストが PASS

### Phase C: 仕様同期

#### 目的

未タスク台帳と仕様書を同期する。

#### 手順

1. `task-workflow.md` の残課題テーブルに本タスクを登録する。
2. `arch-state-management.md` に参照リンクを追加する。

#### 成果物

- 更新済み仕様書

#### 完了条件

- 台帳への登録完了

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `viewHistory` の最大エントリ数が定数で定義されている
- [ ] 上限超過時に古いエントリから削除される（FIFO）

### 品質要件

- [ ] 上限・FIFO テストが PASS
- [ ] TypeScript 型チェックが PASS

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に配置済み
- [ ] `task-workflow.md` 残課題テーブルに登録済み
- [ ] `arch-state-management.md` に参照リンク追加済み

## 6. 検証方法

### テストケース

- Case 1: エントリが上限数 + 1 件追加された場合、最古のエントリが削除される
- Case 2: 上限数以下の場合、全エントリが保持される

### 検証手順

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/store
```

## 7. リスクと対策

| リスク                                      | 影響度 | 発生確率 | 対策                                                |
| ------------------------------------------- | ------ | -------- | --------------------------------------------------- |
| 上限値が小さすぎてユーザー体験が悪化する    | 低     | 低       | 100件を初期値とし、ユーザーフィードバックで調整する |
| FIFO 削除ロジックが既存機能（戻る等）を壊す | 中     | 低       | 既存の viewHistory 依存箇所を全て確認する           |

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/renderer/App.tsx`（viewHistory 管理箇所の候補）
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

### 参考資料

- `.claude/rules/03-state-management.md`（状態管理ルール）
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

### task-workflow への登録候補

```
| UT-FIX-VIEWHISTORY-ACCUMULATION-001 | viewHistory セッション中蓄積の上限設定検討 | 設計改善 | 低 | 未実施 | docs/30-workflows/unassigned-task/task-04-viewhistory-accumulation-limit.md |
```

### 関連仕様書への参照リンク追加候補

- `arch-state-management.md` の viewHistory セクションに本ファイルへのリンクを追加する。

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
UT-FIX-VIEWHISTORY-ACCUMULATION-001: viewHistory のセッション中蓄積の上限設定検討
```

### 補足事項

優先度「低」だが、長時間利用ユーザーへの配慮として対応する。上限値は 100 件を推奨初期値とするが、実際のユースケース分析後に再評価することを推奨する。

## 実装時の注意（苦戦箇所からの教訓）

> TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 で得た教訓。同様の課題を簡潔に解決するための参考情報。

### viewHistory ベース判定パターン

- `viewHistory` は `App.tsx` で管理されているが、Store Slice への移行を検討する場合は P31（Zustand Store Hooks 無限ループ）に注意すること
- `viewHistory` の先頭 / 末尾で「戻る」判定を行っている箇所が他にある場合、上限による FIFO 削除で判定ロジックが壊れないか必ず確認すること
- `grep -rn "viewHistory" apps/desktop/src/` で依存箇所を全件洗い出してから実装すること
- 参照: `.claude/rules/03-state-management.md`（状態管理ルール）、`.claude/rules/06-known-pitfalls.md` P31

### P21/P35: Store 変更時のテストモック連鎖更新

- `viewHistory` を Store Slice に移行した場合、そのセレクタを import する全テストファイルにモックを追加する必要がある
- 事前に `grep -rn "vi.mock.*store" apps/desktop/src/` で影響範囲を調査すること
- 参照: `.claude/rules/06-known-pitfalls.md` P21, P35
