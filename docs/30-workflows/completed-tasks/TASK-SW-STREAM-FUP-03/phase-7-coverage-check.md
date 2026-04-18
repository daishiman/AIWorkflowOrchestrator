# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 7                         |
| Phase名    | カバレッジ確認            |
| 対象機能   | TASK-SW-STREAM-FUP-03     |
| 前提Phase  | Phase 6: テスト拡充       |
| 次Phase    | Phase 8: リファクタリング |
| ステータス | 未実施                    |
| 作成日     | 2026-04-17                |

## 目的

変更した関数・ブロックの line / branch coverage を可視化し、カバレッジ目標を達成する。

## カバレッジ対象（変更ファイルのみ）

| 対象ファイル                                                  | 対象スコープ                                   |
| ------------------------------------------------------------- | ---------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 変更したワークフローメソッドと新規フェーズ定数 |

全ファイル一律の広域カバレッジは対象外。変更した関数・ブロックのみを計測する。

## カバレッジ目標

| 対象                                     | line | branch |
| ---------------------------------------- | ---- | ------ |
| `PROGRESS_FLOW_BY_MODE` の mode 分岐     | 100% | 100%   |
| `emitProgressStep` helper                | 100% | 100%   |
| `createSkill()` の mode dispatch         | 100% | 100%   |
| `onProgress` が `undefined` 時の安全分岐 | 100% | 100%   |

## カバレッジ計測コマンド

```bash
pnpm --filter @repo/desktop test -- \
  --testPathPattern="SkillCreatorService.progress" \
  --coverage \
  --coverageDirectory=coverage/TASK-SW-STREAM-FUP-03 \
  --collectCoverageFrom="apps/desktop/src/main/services/skill/SkillCreatorService.ts"
```

## AC 対応表

| AC   | テスト（TC）        | カバレッジ確認              |
| ---- | ------------------- | --------------------------- |
| AC-1 | TC-14（create回帰） | create フロー変更なし       |
| AC-2 | TC-01〜TC-04        | collaborative フロー全分岐  |
| AC-3 | TC-05〜TC-07        | orchestrate フロー全分岐    |
| AC-4 | TC-08〜TC-10        | update フロー全分岐         |
| AC-5 | TC-11〜TC-13        | improve-prompt フロー全分岐 |
| AC-6 | 既存14件            | 回帰確認                    |
| AC-7 | TC-15〜TC-25        | percentage 単調増加ガード   |
| AC-8 | TC-15〜TC-18        | undefined 安全分岐          |

## 実行タスク

既存成果物と前後 Phase の差分を照合する。

- 受入条件と実装結果の整合を確認する。
- 必要な修正を後続 Phase へ引き継ぐ。

## 参照資料

- `artifacts.json`
- `outputs/artifacts.json`
- 関連する前後 Phase の成果物

## 統合テスト連携

- 検証結果は後続 Phase の品質ゲートへ引き継ぐ。
- 自動テスト結果と矛盾しないことを確認する。

## 成果物

| 成果物                                   | パス                                                       |
| ---------------------------------------- | ---------------------------------------------------------- |
| TASK-SW-STREAM-FUP-03-coverage-report.md | `outputs/phase-7/TASK-SW-STREAM-FUP-03-coverage-report.md` |

## 完了条件

- [ ] カバレッジ計測を実行した
- [ ] 変更した全関数・ブロックで line/branch 100% を達成した
- [ ] AC対応表の全件が対応するテストでカバーされている
- [ ] 成果物が生成されている

## タスク100%実行確認【必須】

- [ ] カバレッジ計測コマンドを実行した
- [ ] 目標カバレッジを達成した
- [ ] AC対応表を作成した
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
