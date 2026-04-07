# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 6                                           |
| 機能名     | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001      |
| タスク名   | Skill Creator approval request surface 接続 |
| 前提Phase  | Phase 5                                     |
| 後続Phase  | Phase 7                                     |
| 作成日     | 2026-04-06                                  |
| ステータス | pending                                     |

## 目的

Phase 4 の基本テストに加え、fail path・エッジケース・回帰ガードを追加してテスト網羅性を高める。

## 実行タスク

- fail path テスト: 許可されていないチャンネルへの `safeOn` 呼び出し、型不整合などの異常系を検証
- エッジケーステスト: 複数回購読・多重アンサブスクライブ・コールバック未登録時の動作を検証
- 回帰ガード: 既存の `respondToApproval` / `getDisclosureInfo` が壊れていないことを確認
- UI エッジケース: approval UI が非表示状態から表示状態へ遷移する際の副作用を検証

## 拡張テストケース一覧

| TC-ID      | 対象                                  | 観点                                  | 期待結果                            |
| ---------- | ------------------------------------- | ------------------------------------- | ----------------------------------- |
| TC-APPR-11 | `onApprovalRequest` 多重購読          | 2回購読した場合のコールバック呼び出し | 両コールバックが呼ばれる            |
| TC-APPR-12 | アンサブスクライブ後の再購読          | unsubscribe → 再購読の順序性          | 再購読後のコールバックのみ呼ばれる  |
| TC-APPR-13 | 存在しないチャンネルへの safeOn       | ALLOWED_ON_CHANNELS 外チャンネル      | console.error が呼ばれ空関数が返る  |
| TC-APPR-14 | `respondToApproval` 非影響確認        | 回帰ガード                            | 既存の respondToApproval が正常動作 |
| TC-APPR-15 | `getDisclosureInfo` 非影響確認        | 回帰ガード                            | 既存の getDisclosureInfo が正常動作 |
| TC-APPR-16 | approval payload が null の場合       | SkillLifecyclePanel の null ガード    | approval UI が表示されない          |
| TC-APPR-17 | approve 後に pendingApproval がクリア | UI 状態リセット                       | approval UI が非表示になる          |
| TC-APPR-18 | reject 後に pendingApproval がクリア  | UI 状態リセット                       | approval UI が非表示になる          |

## 参照資料

| 参照資料         | パス                                        | 説明           |
| ---------------- | ------------------------------------------- | -------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md`     | Phase 4 成果物 |
| Red結果          | `outputs/phase-4/red-test-result.md`        | Phase 4 成果物 |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | Phase 5 成果物 |
| 統合テスト計画   | `outputs/phase-4/integration-test-plan.md`  | Phase 4 成果物 |
| 契約差分         | `outputs/phase-5/contract-diff.md`          | Phase 5 成果物 |

## 実行手順

1. Phase 5 成果物を確認する。
2. 拡張テストケース（TC-APPR-11〜18）をテストファイルに追加する。
3. 回帰テストを実行して既存機能に影響がないことを確認する。
4. 全テスト（TC-APPR-01〜18）が Green であることを確認する。
5. 成果物を記録する。

## 成果物

| 成果物           | パス                                        | 説明                         |
| ---------------- | ------------------------------------------- | ---------------------------- |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | 追加テストケース一覧         |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | 既存機能非影響確認           |
| 異常系結果       | `outputs/phase-6/edge-case-result.md`       | fail path / エッジケース結果 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] TC-APPR-11〜18 が全て定義・実行されている
- [ ] 回帰テストで既存機能への影響がないことを確認
- [ ] 全テストが Green であることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-sdk-07-approval-request-surface-001
```

## 次のPhase

Phase 7: テストカバレッジ確認
