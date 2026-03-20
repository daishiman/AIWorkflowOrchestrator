# Phase 8 簡素化候補の評価

## メタ情報

| 項目       | 値                                                                       |
| ---------- | ------------------------------------------------------------------------ |
| タスクID   | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001                |
| Phase      | 8 - リファクタリング                                                     |
| 作成日     | 2026-03-20                                                               |
| 依存成果物 | outputs/phase-7/coverage-targets.md, outputs/phase-6/edge-case-matrix.md |

---

## 1. Alternative A 再評価: 2 状態簡素化

### 概要

Phase 2 設計時に検討された Alternative A は、`capability` の状態を以下の 2 状態に簡素化する案。

- `active`（利用可能）
- `inactive`（利用不可）

`both` / `none` の区別を廃止し、単一の可否フラグに集約することで contract-matrix を简略化する方針。

### 再評価結果: **棄却維持**

Phase 7 カバレッジ確認において、`both` / `none` を明示的に区別するテストケースが存在することが確認された。

| テストケース | 内容                                                       | `both` / `none` 区別の必要性 |
| ------------ | ---------------------------------------------------------- | ---------------------------- |
| CA-3         | RuntimePolicyResolver が `both` 状態で `fullAccess` を返す | 要                           |
| CA-4         | RuntimePolicyResolver が `none` 状態で `noAccess` を返す   | 要                           |
| CB-4         | AuthModeStatus DTO が `both` 状態を正しく serialize する   | 要                           |
| CB-5         | AuthModeStatus DTO が `none` 状態を正しく serialize する   | 要                           |
| CC-4         | contract consumer が `both` 状態で正しい CTA を表示する    | 要                           |
| CC-5         | contract consumer が `none` 状態で正しい CTA を表示する    | 要                           |

これら 6 件のテストケースを維持したまま `both` / `none` を廃止することは不可能である。また、`both` 状態（Anthropic API キーと Claude API キーの双方が有効）と `none` 状態（いずれも無効）では、ユーザーへの提示 CTA が異なるため、UI/UX 観点でも区別が必要である。

**結論**: Alternative A は Phase 2 時点の棄却判定を維持する。

---

## 2. Alternative B 再評価: CTA 統合

### 概要

Phase 2 設計時に検討された Alternative B は、`blocked` / `unavailable` の CTA 表示を単一のコンポーネントに統合する案。

- `blocked`: ユーザーの操作（設定変更）により解消可能な状態
- `unavailable`: システム側の制約により利用不可な状態

両者を `disabled` という単一 CTA にまとめることで、Renderer 実装を简略化する方針。

### 再評価結果: **棄却維持**

CTA を `blocked` / `unavailable` で分離することによる Renderer 実装コストは、以下の理由から許容範囲内であると判断する。

- **UX 品質への影響**: `blocked` はユーザーが能動的に解消できる状態であり、解消手順へのリンク（設定画面への誘導）を CTA に含める必要がある。`unavailable` にはその誘導が不要であるため、統合すると UX 品質が低下する。
- **実装コストの実態**: CTA 分岐は contract-matrix の状態定義から自明に導出されるため、追加の実装コストは条件分岐 1 箇所に留まる。
- **テスト整合性**: CC-4 / CC-5 を含む CTA 検証テストが `blocked` / `unavailable` の区別に依存しており、統合した場合にテストの再設計が必要になる。

**結論**: Alternative B は Phase 2 時点の棄却判定を維持する。

---

## 3. 採用方針サマリー

| Alternative | 内容                                       | Phase 2 判定 | Phase 8 再評価 | 最終方針 |
| ----------- | ------------------------------------------ | ------------ | -------------- | -------- |
| A           | 2 状態簡素化（`both` / `none` 廃止）       | 棄却         | 棄却維持       | 不採用   |
| B           | CTA 統合（`blocked` / `unavailable` 統合） | 棄却         | 棄却維持       | 不採用   |

再評価において新たな採用候補は発生しなかった。Phase 8 では refactor-boundaries.md に記載した 3 件の実施候補（用語整理・selector 集約・CTA 集約）のみを対象とする。

---

## 4. 実装後確認（Phase 5 完了後）

Phase 5 の実装では `execution-capability.ts` を新規ファイルとして追加し、Concern A/B/C を pure function で実装する方式が採用された。

| 確認項目                                                                 | 結果                                           |
| ------------------------------------------------------------------------ | ---------------------------------------------- |
| Alternative A の棄却判定（both/none 維持）が守られているか               | ✅ resolveCapability() が 4 状態を明示的に返す |
| Alternative B の棄却判定（blocked/unavailable 分離）が守られているか     | ✅ resolveUiState() が 3 状態を区別して返す    |
| resolveCtaContract() が contract-matrix と一致しているか                 | ✅ 59 件のテストで全セルを検証済み             |
| assertNoSilentFallback() / assertNoPrimaryCta() ガードが実装されているか | ✅ execution-capability.ts に実装済み          |

Phase 8 の再評価判定（Alternative A/B ともに不採用）は実装後も維持されている。
