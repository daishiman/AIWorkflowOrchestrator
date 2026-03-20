# UT-EXEC-01: scope-definition.md への execution-capability.ts パス追記

| 項目         | 値                                                                              |
| ------------ | ------------------------------------------------------------------------------- |
| タスクID     | UT-EXEC-01                                                                      |
| タスク名     | scope-definition.md への execution-capability.ts パス追記                       |
| 分類         | ドキュメント整備                                                                |
| 対象機能     | execution-responsibility-realignment / scope-definition                         |
| 優先度       | 高                                                                              |
| 見積もり規模 | 小規模（1ファイル修正）                                                         |
| ステータス   | 未着手                                                                          |
| 発見元       | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 Phase 10 MINOR-1 指摘 |
| 発見日       | 2026-03-20                                                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 背景

TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001（Task01）にて、実行責任契約の基盤型として `packages/shared/src/types/execution-capability.ts` を新規作成した。しかし、ワークフローのスコープ定義文書である `scope-definition.md` の canonical doc set（D. Implementation Anchor 節）には、このファイルパスが追記されていない。

### 問題点

現在 `scope-definition.md` の D. Implementation Anchor 節には以下の2ファイルのみが記載されている:

- `packages/shared/src/types/auth-mode.ts`
- `RuntimePolicyResolver.ts`

Task01 で新規作成した `packages/shared/src/types/execution-capability.ts` が記載されておらず、canonical doc set とソースコードの実態が乖離している。

### 放置時の影響

1. **後続タスクの実装漏れ**: canonical doc set を参照して作業する開発者が `execution-capability.ts` の存在を認識できず、関連する型定義の更新・参照を見落とす
2. **設計レビューの判断ミス**: Phase 3 設計レビューで Implementation Anchor の網羅性を検証する際、不完全なリストに基づいて PASS 判定を出してしまう
3. **仕様書と実装の信頼性低下**: canonical doc set が実態と乖離した状態が続くと、仕様書全体の信頼性が損なわれ、開発者が仕様書を参照しなくなる

---

## 2. 何を達成するか（What）

### 目的

`scope-definition.md` の canonical doc set（D. Implementation Anchor 節）に `packages/shared/src/types/execution-capability.ts` を追加し、ソースコードの実態と仕様書の記載を一致させる。

### 最終ゴール

`scope-definition.md` の D. Implementation Anchor 節に3ファイルが記載されている状態:

1. `packages/shared/src/types/auth-mode.ts`（既存）
2. `RuntimePolicyResolver.ts`（既存）
3. `packages/shared/src/types/execution-capability.ts`（追加）

### スコープ

#### 含む

- `scope-definition.md` の D. Implementation Anchor 節への1行追記

#### 含まない

- `execution-capability.ts` の内容変更
- `scope-definition.md` の他の節の変更
- 他の仕様書への変更

### 成果物

| 成果物                       | パス                                                                                    | 内容                                                               |
| ---------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 更新済み scope-definition.md | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/scope-definition.md` | D. Implementation Anchor 節に `execution-capability.ts` パスを追記 |

---

## 3. どのように実行するか（How）

### 前提条件

- `docs/30-workflows/ai-runtime-execution-responsibility-realignment/scope-definition.md` が存在すること
- `packages/shared/src/types/execution-capability.ts` が存在すること

### 依存タスク

- TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001（完了済み）: `execution-capability.ts` を作成したタスク

### 推奨アプローチ

1. `scope-definition.md` を開く
2. D. Implementation Anchor 節を特定する
3. 既存の2ファイルのリストの末尾に `packages/shared/src/types/execution-capability.ts` を追加する
4. 追記内容が既存のリスト形式（マークダウンリスト or テーブル）と統一されていることを確認する

---

## 4. 実行手順

### Phase 1: 現状確認（所要時間: 5分）

1. `scope-definition.md` を開き、D. Implementation Anchor 節の現在の記載内容を確認する
2. `packages/shared/src/types/execution-capability.ts` が実際に存在することを確認する
   ```bash
   ls -la packages/shared/src/types/execution-capability.ts
   ```
3. 既存のリスト形式（箇条書き / テーブル / コードブロック）を確認する

### Phase 2: 追記（所要時間: 5分）

1. D. Implementation Anchor 節の既存ファイルリストの末尾に以下を追加する:
   - `packages/shared/src/types/execution-capability.ts`
2. 追記時、既存エントリと同じフォーマット（インデント、記法、説明の有無）に揃える
3. ファイルを保存する

### Phase 3: 検証（所要時間: 5分）

1. 追記した内容が正しいパスであることを確認する
   ```bash
   grep "execution-capability" docs/30-workflows/ai-runtime-execution-responsibility-realignment/scope-definition.md
   ```
2. 既存エントリのフォーマットと統一されていることを目視確認する
3. マークダウンの構文エラーがないことを確認する

### Phase 4: コミット（所要時間: 5分）

1. 変更をステージングする
   ```bash
   git add docs/30-workflows/ai-runtime-execution-responsibility-realignment/scope-definition.md
   ```
2. コミットメッセージ例:
   ```
   docs(scope-definition): add execution-capability.ts to Implementation Anchor
   ```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `scope-definition.md` の D. Implementation Anchor 節に `packages/shared/src/types/execution-capability.ts` が記載されている
- [ ] 記載されたパスが実際のファイルパスと一致している
- [ ] 既存の2ファイル（`auth-mode.ts`, `RuntimePolicyResolver.ts`）の記載が変更されていない

### 品質要件

- [ ] 追記エントリのフォーマットが既存エントリと統一されている
- [ ] マークダウン構文エラーがない

### ドキュメント要件

- [ ] コミットメッセージが変更内容を正確に反映している

---

## 6. 検証方法

1. **パス存在確認**: `ls packages/shared/src/types/execution-capability.ts` でファイルが存在すること
2. **記載確認**: `grep -c "execution-capability" docs/30-workflows/ai-runtime-execution-responsibility-realignment/scope-definition.md` の結果が 1 以上であること
3. **既存エントリ保持確認**: `grep -c "auth-mode" docs/30-workflows/ai-runtime-execution-responsibility-realignment/scope-definition.md` の結果が変更前と同じであること
4. **差分確認**: `git diff docs/30-workflows/ai-runtime-execution-responsibility-realignment/scope-definition.md` で追記行のみが差分として表示されること

---

## 7. リスクと対策

| リスク                                           | 影響度 | 発生確率 | 対策                                                       |
| ------------------------------------------------ | ------ | -------- | ---------------------------------------------------------- |
| scope-definition.md のフォーマットが想定と異なる | 低     | 低       | Phase 1 で現状確認し、実際のフォーマットに合わせて追記する |
| パスの typo                                      | 中     | 低       | 実ファイルパスを `ls` で確認してからコピー&ペーストする    |
| 既存エントリの意図しない変更                     | 中     | 低       | `git diff` で追記行のみが差分であることを確認する          |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント            | パス                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------- |
| scope-definition.md     | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/scope-definition.md` |
| execution-capability.ts | `packages/shared/src/types/execution-capability.ts`                                     |
| auth-mode.ts            | `packages/shared/src/types/auth-mode.ts`                                                |

### 関連タスク

| タスクID                                                  | タスク名                 | 関係                                 |
| --------------------------------------------------------- | ------------------------ | ------------------------------------ |
| TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 | 実行責任契約基盤の型定義 | 本タスクの発見元（Phase 10 MINOR-1） |

### 過去の教訓（Pitfall 参照）

| Pitfall ID | 内容                                                           | 本タスクとの関連                                                                                          |
| ---------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| P57        | 設計タスクにおける Phase 12 システム仕様書更新の先送りパターン | 「計画文」ではなく「実績ベース」で記録する原則。scope-definition も実ファイル作成時に同時更新すべきだった |
| P58        | 設計タスクにおける未タスク指示書の配置省略                     | 「設計タスクだから」という理由で指示書作成を省略しない。P3/P38 の3ステップは必須                          |
| P26        | システム仕様書更新遅延                                         | 仕様書の更新を「PRマージ後」に先送りせず、実装完了時点で更新する                                          |

---

## 9. 備考: 実装時の苦戦箇所と教訓

### 教訓1: P57（planned wording ドリフト）

TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 の Phase 12 において、システム仕様書の「実更新」ではなく「計画文」（planned wording）を残してしまう問題が発生した。具体的には、`system-spec-update-summary.md` に「更新予定」と記載したが、対象の仕様書ファイル自体は未更新のまま放置された。

**対策**: Phase 12 では planned wording を一切残さず、実績ベースの記録のみを行う。「更新予定」「後日対応」といった文言は禁止し、実際にファイルを更新してからその結果を記録する。

### 教訓2: P58（設計タスクにおける未タスク指示書の配置省略）

「設計タスクだから」という理由で `docs/30-workflows/unassigned-task/` への独立した指示書ファイルの作成を省略した。「本レポート内で完了」という代替措置を採用したが、P3/P38 で定められた3ステップ（1. 指示書作成 → 2. task-workflow.md 残課題テーブル登録 → 3. 関連仕様書リンク追加）は設計タスクであっても例外なく必須である。後続の監査ツールが指示書パスを参照できず不整合が発生した。

**対策**: タスクの種類（設計/実装/ドキュメント）に関わらず、未タスク指示書は必ず `docs/30-workflows/unassigned-task/` に独立ファイルとして作成する。

### 教訓3: canonical doc set への新規ファイル追記漏れ

`execution-capability.ts` を新規作成した Phase 5 の時点で `scope-definition.md` の canonical doc set を更新すべきだったが、Phase 10 の最終レビューで MINOR-1 として初めて指摘された。新規ファイル作成と canonical doc set 更新は常にセットで実施すべきである。

**対策**: 新規ファイルを作成する際は、以下を同時に確認・更新する:

1. `scope-definition.md` の canonical doc set に新規ファイルパスが含まれるべきか確認する
2. 含まれるべき場合は、ファイル作成と同じコミットで `scope-definition.md` を更新する
3. Phase 5 完了チェックリストに「canonical doc set との整合性確認」を含める
