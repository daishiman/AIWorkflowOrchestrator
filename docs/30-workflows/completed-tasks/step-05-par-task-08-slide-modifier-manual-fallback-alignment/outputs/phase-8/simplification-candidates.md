# Phase 8: 簡素化候補

## メタ情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 |
| Phase    | 8                                                     |
| 作成日   | 2026-03-23                                            |
| タイプ   | 設計タスク（プロダクションコード変更なし）            |

## 1. 簡素化候補の比較評価

Phase 2 の Alternative 3件に加え、Phase 8 時点で追加検討した候補を評価する。

### 候補 A（Phase 2 Alternative 1）: agent-client.ts 即時削除

| 比較軸       | 詳細                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| 概要         | direct SDK path を即時削除し、stub 関数で fallback card を常時表示           |
| 簡素化の利点 | legacy 管理コストが即座になくなる。cleanup 順序テーブル順序3〜7 が不要       |
| コスト       | slide 機能の完全停止。UT-SLIDE-IMPL-001 の実装完了前に適用不可               |
| 採用条件     | UT-SLIDE-IMPL-001 完了 + Agent SDK adapter の動作確認済み（Gate 順序5 充足） |
| 現時点の判定 | 不採用（Gate 条件未充足）                                                    |

### 候補 B（Phase 2 Alternative 2）: UI 4領域を汎用 banner に簡略化

| 比較軸       | 詳細                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| 概要         | guidance block / fallback card / terminal launcher を1つの banner に統合 |
| 簡素化の利点 | UI コンポーネント数を3つ削減。SlideWorkspace.tsx の条件分岐が減少        |
| コスト       | UX-07 S03 と S04 が別状態として撮影できなくなる。screenshot 契約を違反   |
| 採用条件     | UX-07 要件の変更（ui-ux-realization.md の改訂）が必要                    |
| 現時点の判定 | 不採用（screenshot 契約違反）                                            |

### 候補 C（Phase 2 Alternative 3）: IPC namespace 統一を Task08 で実施

| 比較軸       | 詳細                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| 概要         | slide:sync:\* の legacy channel リネームを Task08 設計タスクで同時実施   |
| 簡素化の利点 | Task09 follow-up を削減し、namespace drift のリスクを早期解消            |
| コスト       | IPC channel リネームはプロダクションコード変更。設計タスクのスコープ逸脱 |
| 採用条件     | Task08 が実装タスクに昇格（スコープ変更が必要）                          |
| 現時点の判定 | 不採用（設計タスクのスコープ外）                                         |

### 候補 D（新規）: 4状態を3状態に削減（guidance 廃止、degraded に統合）

| 比較軸       | 詳細                                                                                   |
| ------------ | -------------------------------------------------------------------------------------- |
| 概要         | guidance 状態を廃止し、degraded 状態内で terminal launcher を条件表示する              |
| 簡素化の利点 | 状態数が4から3に削減。不正遷移パターンも4から2に削減                                   |
| コスト       | UX-07 S04（guidance 状態の screenshot）が不成立。AC-3（slide-specific contract）に違反 |
| 採用条件     | UX-07 要件の変更と AC-3 の再定義が必要                                                 |
| 現時点の判定 | 不採用（AC-3 違反）                                                                    |

### 候補 E（新規）: SlideCapabilityDTO を省略し、uiStatus を直接 IPC で通知

| 比較軸       | 詳細                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------ |
| 概要         | SlideCapabilityDTO 新規 DTO を廃止し、既存の IPC payload に uiStatus/lane フィールドを追加 |
| 簡素化の利点 | 新規 IPC channel 追加不要（MN-01 の指摘が不要になる）。DTO クラス数を増やさない            |
| コスト       | 既存 IPC payload の後方互換性を確認が必要。payload が肥大化し単一責務に違反するリスク      |
| 採用条件     | 既存 IPC channel の payload schema を調査し、追加フィールドの互換性を確認する必要がある    |
| 現時点の判定 | 条件付き検討可（MN-01 フォローアップ時に UT-SLIDE-IMPL-001 が評価する）                    |

## 2. 採用・不採用の総括

| 候補 | 判定     | 次のアクション                                                    |
| ---- | -------- | ----------------------------------------------------------------- |
| A    | 不採用   | Gate 順序5充足後に UT-SLIDE-IMPL-001 が再評価                     |
| B    | 不採用   | UX-07 要件変更がない限り採用不可                                  |
| C    | 不採用   | Task09 follow-up（cleanup 順序6）で実施                           |
| D    | 不採用   | AC-3 / UX-07 変更がない限り採用不可                               |
| E    | 条件付き | UT-SLIDE-IMPL-001 の MN-01 フォローアップ時に payload schema 確認 |

## 3. 設計の簡素化余地まとめ

現時点での設計は必要最小限の複雑性を持つと評価する。

- **状態数4は必要**: degraded と guidance は異なる表示領域（fallback card vs terminal launcher）を持つため、統合不可
- **DTO 2件は適切**: ModifierResponse 拡張（既存互換）と SlideCapabilityDTO（新規）の役割が明確に分離している
- **Cleanup 順序9ステップは妥当**: 各ステップの Gate 条件が依存関係を正確に表現している

唯一の簡素化余地は候補 E（SlideCapabilityDTO の payload 統合）だが、
MN-01 のフォローアップとして実装タスクに委譲する。
