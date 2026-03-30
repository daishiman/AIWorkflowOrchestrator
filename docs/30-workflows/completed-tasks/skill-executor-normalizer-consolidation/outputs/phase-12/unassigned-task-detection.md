# Phase 12 Task 12-4: 未タスク検出レポート

## 検出結果: 1件

### 候補1: SkillStreamMessage / SkillCreatorSdkEvent 型統一

| 項目           | 内容                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------- |
| ソース         | 元タスク仕様書（スコープ外項目）                                                            |
| 内容           | `SkillStreamMessage` と `SkillCreatorSdkEvent` の出力型を統一すること                       |
| 理由           | 2つの lane が異なる出力型を持つのは、SDK 変更時の保守コストが残る                           |
| 優先度         | low                                                                                         |
| 備考           | 本タスクのスコープ外として明示的に除外済み。別タスクとして検討が必要                        |
| 未タスク仕様書 | `docs/30-workflows/unassigned-task/UT-RT-06-SKILL-EXECUTOR-NORMALIZER-CONSOLIDATION-001.md` |
| Issue番号      | #1692                                                                                       |

## 確認ソース

| ソース                | 確認結果                             |
| --------------------- | ------------------------------------ |
| 元タスク仕様書        | 型統一がスコープ外項目として記載済み |
| Phase 3 レビュー結果  | MINOR 指摘なし                       |
| Phase 10 レビュー結果 | blocker なし                         |
| Phase 11 手動テスト   | スコープ外の発見事項なし             |
| コードコメント        | TODO/FIXME/HACK/XXX の新規追加なし   |

## コードスキャン結果

対象ディレクトリ: `apps/desktop/src/main/services/runtime`, `apps/desktop/src/main/services/skill`

新規追加された TODO/FIXME: なし

---

## 苦戦箇所メモ（実装時の教訓）

### 型安全性と二重実装の衝突

実装過程で以下の技術的課題が生じた。未タスク化の背景として記録する。

**問題**: SkillExecutor lane（`SkillStreamMessage` 型）と skill-creator lane（`SkillCreatorSdkEvent` 型）が同じ SDK メッセージを処理するが、型ガードと分岐ロジックが 2 箇所に存在。出力型が異なるため即時統合が困難だった。

**解決策（実装済み）**: 前処理（`asSdkMessageRecord`, `getSdkMessageType`）を `sdkMessageUtils.ts` に共有 utils として分離。型ガード `isValidSDKMessage` を削除し、共有 utils を利用する構成へ移行済み。

**残存課題（未タスク候補1の本質）**: `convertToStreamMessage()` と `normalizeSdkMessage()` のメッセージ分岐ロジック自体はまだ 2 箇所に残存。出力型の統一（上記候補1）が完了しないと、分岐ロジックの完全統合は不可。

**将来への教訓**: 「メッセージ形状検証」と「型変換」を分離すれば、別 lane でも共有可能な層を作れる。出力型の統一は無理に行わず、共通部分から段階的に統合するほうが現実的。
