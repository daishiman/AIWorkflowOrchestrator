# artifacts.json Phase ステータス同期

## メタ情報

```yaml
issue_number: 1735
```

## メタ情報

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| タスクID     | task-imp-artifacts-status-sync-003  |
| タスク名     | artifacts.json Phase ステータス同期 |
| 分類         | 改善（imp）                         |
| 対象機能     | タスク仕様書管理・artifacts.json    |
| 優先度       | 中（P1）                            |
| 見積もり規模 | 小                                  |
| ステータス   | 未実施                              |
| 発見元       | Phase 12                            |
| 発見日       | 2026-03-29                          |

---

## 1. なぜこのタスクが必要か（Why）

### 背景

TASK-P0-01（`SkillCreatorVerificationEngine` Layer 1/2 実装）の完了後、
`docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/artifacts.json` を確認したところ、
トップレベルの `"status"` が `"in_progress"` のまま、かつ Phase 13 が `"pending"` のまま残存していた。
実体上は Phase 12 まで完了（Phase 13 は PR 作成フェーズとして後続ワークフローへ引き継ぎ）しており、
メタデータと実装実態が乖離した状態になっている。

> 現在の artifacts.json の状態（2026-03-29 時点）:
>
> - `"status": "implemented"`（Phase 12 完了まで更新済み）
> - Phase 13 `"status": "pending"`（PR 作成フェーズ未完了のまま）

### 問題点・課題

- artifacts.json のステータスが実態と乖離すると、将来の自動判定ツールや CI/CD スクリプトが誤検知する
- Phase 12 完了判定の信頼性が低下する
- Phase ステータスの手動同期漏れは再発しやすく、蓄積すると追跡困難になる

### 放置した場合の影響

| 影響領域       | 影響                                                                     |
| -------------- | ------------------------------------------------------------------------ |
| 自動判定ツール | `"pending"` や `"in_progress"` を誤って未完了タスクとして検出する        |
| 監査追跡       | artifacts.json を信頼した検証がステータス不整合により不正確になる        |
| Phase 12 品質  | documentation-changelog が artifacts.json の誤情報を参照するリスクがある |

---

## 2. 何を達成するか（What）

### 目的

`docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/artifacts.json` の
ステータスを実態（Phase 12 まで完了済み）に合わせて正確に更新する。

### 最終ゴール

- artifacts.json のトップレベル `"status"` が実態を正確に反映している
- 各 Phase の `"status"` が実際の完了状態と一致している
- 後続ツール・CI/CD スクリプトが正確なステータスを参照できる

### スコープ

**含むもの:**

- `artifacts.json` の `"status"` フィールドを実態に合わせて更新
- Phase 13 の `"status"` を適切な値（`"pending"` または `"skipped"` 等）に更新

**含まないもの:**

- 自動同期機構の実装（別タスクとして分離）
- artifacts.json テンプレートの変更

### 成果物

| 種別 | 成果物                  | 配置先                                                                                    |
| ---- | ----------------------- | ----------------------------------------------------------------------------------------- |
| 更新 | 更新済み artifacts.json | `docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/artifacts.json` |

---

## 3. どのように実行するか（How）

### 前提条件

- `docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/` の各 Phase ドキュメントを参照して実態を把握する

### 推奨アプローチ

1. 各 Phase のドキュメント（`phase-1-requirements.md` 〜 `phase-12-documentation.md`）を確認し、完了状態を把握する
2. outputs/ ディレクトリの実際の成果物ファイルと artifacts.json の記載を突き合わせる
3. トップレベル `"status"` および各 Phase の `"status"` を実態に合わせて更新する
4. Phase 13 については、PR 作成が別ワークフローに引き継がれた経緯を踏まえて適切なステータスを設定する

### ステータス値の基準

| 値              | 意味                             |
| --------------- | -------------------------------- |
| `"completed"`   | Phase の全成果物が生成・確認済み |
| `"pending"`     | 未着手                           |
| `"skipped"`     | スコープ外または別タスクへ移管   |
| `"in_progress"` | 作業中（完了前の状態）           |

---

## 4. 実行手順（Phase 構成）

### Phase 1: 現状調査

- `artifacts.json` の現在のステータスを確認する
- 各 Phase ドキュメントと outputs/ の実ファイルを突き合わせて完了状態を把握する

### Phase 2: ステータス更新

- `artifacts.json` のトップレベル `"status"` を更新する
- Phase 1〜13 の各 `"status"` を実態に合わせて更新する
- Phase 13 のステータスを適切な値（PR 作成が別ワークフローへ引き継がれた旨を反映）に設定する

### Phase 3: 検証・コミット

- 更新後の `artifacts.json` が JSON として正しい構文であることを確認する
- `lastUpdated` を更新日時に合わせて修正する
- 変更をコミットする

---

## 5. 完了条件チェックリスト

- [ ] `artifacts.json` のトップレベル `"status"` が実態を正確に反映している
- [ ] Phase 1〜12 の `"status"` がすべて `"completed"` になっている
- [ ] Phase 13 の `"status"` が適切な値（`"pending"` / `"skipped"` / 別途明確な値）になっている
- [ ] `artifacts.json` の JSON 構文が正しい（`jq . artifacts.json` がエラーなく通る）
- [ ] `lastUpdated` が更新日時に修正されている

---

## 6. 検証方法

### 実行コマンド

```bash
# JSON 構文チェック
jq . docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/artifacts.json

# ステータス一覧確認
jq '.status, (.phases | to_entries[] | {phase: .key, status: .value.status})' \
  docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/artifacts.json
```

### テストケース

| #   | テストケース                            | 入力条件                             | 期待結果                                          |
| --- | --------------------------------------- | ------------------------------------ | ------------------------------------------------- |
| 1   | JSON 構文が正しいこと                   | 更新後の artifacts.json              | `jq .` がエラーなく通る                           |
| 2   | トップレベルステータスが正しいこと      | 更新後の artifacts.json              | Phase 12 完了を反映したステータスが設定されている |
| 3   | 全 Phase ステータスが実態と一致すること | Phase 1〜12 ドキュメントと突き合わせ | 完了済み Phase が `"completed"` になっている      |

---

## 7. リスクと対策

| リスク                            | 影響度 | 発生確率 | 対策                                                                       |
| --------------------------------- | ------ | -------- | -------------------------------------------------------------------------- |
| Phase 13 のステータス判断が不明確 | 低     | 中       | PR 作成が別ワークフローへ引き継がれた旨を `"pending"` で明示する           |
| artifacts.json 構文エラー         | 中     | 低       | 編集後に `jq .` で構文チェックを必ず実施する                               |
| 手動更新による再度の同期漏れ      | 中     | 中       | 自動同期機構の実装は別タスク（task-imp-artifacts-auto-sync）として分離済み |

---

## 8. 参照情報

### ソースファイル

- `docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/artifacts.json` — 更新対象
- `docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/phase-1-requirements.md` 〜 `phase-13-pr-creation.md` — 各 Phase の実態確認
- `docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/outputs/phase-12/documentation-changelog.md` — Phase 12 完了記録

### 関連タスク

- TASK-P0-01: `SkillCreatorVerificationEngine` Layer 1/2 実装（本タスクの前提）
- task-imp-layer12-spec-definition-004: aiworkflow-requirements への Layer 1/2 check ID 体系追記

### 関連ルール

- `.claude/rules/06-known-pitfalls.md` — P4（早期完了記載）、P37（ドキュメント数値の早期固定）

---

## 9. 備考

### 補足事項

- 本タスクは TASK-P0-01 の Phase 12 完了後に発見された手動同期漏れを解消するもの。
- artifacts.json の自動更新機構が存在しないため、実装者が Phase 進捗を手動で反映する必要があるが、実装後の同期が忘れられやすいという構造的な問題がある。
- 自動同期機構の実装は本タスクのスコープ外として意図的に分離している。将来的には artifacts.json の自動更新 Hook またはスクリプトによる解決を検討する。
- Phase 13 は PR 作成フェーズであり、別ワークフロー（`ai:diff-to-pr` 等）に引き継がれているため、`"pending"` のままが適切な可能性がある。実態を確認した上でステータスを設定すること。
