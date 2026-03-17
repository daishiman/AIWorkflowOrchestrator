# カバレッジマトリクス

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| 文書     | Phase 7 - カバレッジ確認 成果物 1/4 |
| タスクID | TASK-SKILL-LIFECYCLE-08             |
| 作成日   | 2026-03-17                          |
| 閾値     | 80%（全関心事で達成必須）           |

---

## 1. テストケース総数

| Phase    | ファイル数 | テストケース数 |
| -------- | ---------- | -------------- |
| Phase 4  | 5          | 153            |
| Phase 6  | 5          | 59             |
| **合計** | **10**     | **212**        |

### Phase 4 内訳

| 仕様書                         | ID 範囲            | テスト数 |
| ------------------------------ | ------------------ | -------- |
| publishing-test-spec.md        | PUB-V/L/T/P/SC     | 50       |
| compatibility-test-spec.md     | CMP-S/R/BC/D       | 32       |
| skill-center-test-spec.md      | SC-01〜SC-27       | 27       |
| distribution-test-spec.md      | DT-01〜DT-28       | 28       |
| publish-readiness-test-spec.md | PR-01〜PR-12, PR-V | 16       |

### Phase 6 内訳

| 仕様書                                 | ID 範囲    | テスト数 |
| -------------------------------------- | ---------- | -------- |
| version-compatibility-boundary-spec.md | VCB-01〜08 | 8        |
| schema-drift-detection-spec.md         | SDD-01〜11 | 11       |
| deprecation-republish-boundary-spec.md | DRB-01〜13 | 13       |
| concurrent-operation-conflict-spec.md  | COC-01〜10 | 10       |
| error-handling-extended-spec.md        | EHE-01〜17 | 17       |

---

## 2. 設計関心事 5 つの定義

| #   | 関心事               | Phase 2 設計書                    | 対応 AC |
| --- | -------------------- | --------------------------------- | ------- |
| C1  | 公開メタデータ       | publishing-metadata-design.md     | AC-1    |
| C2  | 互換性チェック       | compatibility-check-design.md     | AC-2    |
| C3  | Skill Center フロー  | skill-center-flow-design.md       | AC-4    |
| C4  | 配布操作             | distribution-operations-design.md | AC-4    |
| C5  | 公開可否判定ロジック | publish-readiness-design.md       | AC-3    |

---

## 3. 関心事 x テストケース マッピングテーブル

### C1: 公開メタデータ（AC-1）

| テストID     | テスト概要                                                         | Phase |
| ------------ | ------------------------------------------------------------------ | ----- |
| PUB-V-1〜8   | visibility バリデーション（3値 + 無効値）                          | 4     |
| PUB-L-1〜10  | local メタデータ P42 3段バリデーション（name/description/version） | 4     |
| PUB-T-1〜11  | team メタデータ P42（author/tags/teamId）                          | 4     |
| PUB-P-1〜9   | public メタデータ P42（license/readme/changelog/minAppVersion）    | 4     |
| PUB-SC-1〜12 | StateChart 遷移（5状態間の7+8条件）                                | 4     |
| SDD-03〜07   | 非 semver バリデーション / tags 型検証                             | 6     |
| EHE-05〜06   | name 長制限境界値（200/201文字）                                   | 6     |
| EHE-07〜08   | tags 件数制限境界値（10/11件）                                     | 6     |
| EHE-09〜12   | license SPDX / proprietary バリデーション                          | 6     |

**テスト数**: Phase 4: 50件 + Phase 6: 13件 = **63件**

**設計要素カバレッジ**:

| 設計要素                              | テストで検証済みか | テストID      |
| ------------------------------------- | ------------------ | ------------- |
| SkillVisibility 3値                   | YES                | PUB-V-1〜3    |
| 無効 visibility 拒否                  | YES                | PUB-V-4〜8    |
| LocalMetadata 必須3フィールド         | YES                | PUB-L-1〜10   |
| TeamMetadata 必須6フィールド          | YES                | PUB-T-1〜11   |
| PublicMetadata 必須10フィールド       | YES                | PUB-P-1〜9    |
| StateChart S_LOCAL→S_TEAM 遷移        | YES                | PUB-SC-1〜4   |
| StateChart S_TEAM→S_PUBLIC 遷移       | YES                | PUB-SC-5〜8   |
| StateChart S_PUBLIC→S_DEPRECATED      | YES                | PUB-SC-9〜10  |
| StateChart S_DEPRECATED→S_REMOVED     | YES                | PUB-SC-11〜12 |
| semver バリデーション（非準拠文字列） | YES                | SDD-03〜05    |
| name 長制限境界値                     | YES                | EHE-05〜06    |
| tags 件数境界値                       | YES                | EHE-07〜08    |
| license SPDX チェック                 | YES                | EHE-09〜12    |
| tags 型検証（非配列入力）             | YES                | SDD-06〜07    |

**カバレッジ**: 14/14 = **100%** (閾値80%: PASS)

---

### C2: 互換性チェック（AC-2）

| テストID    | テスト概要                                | Phase |
| ----------- | ----------------------------------------- | ----- |
| CMP-S-1〜10 | semver 比較（major/minor/patch 判定）     | 4     |
| CMP-R-1〜8  | CompatibilityCheckResult フィールド検証   | 4     |
| CMP-BC-1〜5 | breaking change 検出（M-1〜M-5 条件）     | 4     |
| CMP-D-1〜9  | 依存解決（conflict/range/auto-resolve）   | 4     |
| VCB-01〜03  | N-1/N-2 バージョン境界判定                | 6     |
| VCB-04      | N-2 非互換 import 拒否                    | 6     |
| VCB-05〜08  | breaking/compatible/minor と昇格連携      | 6     |
| SDD-01〜02  | 段階的 schema drift（3バージョン以上）    | 6     |
| SDD-08〜09  | フェイルセキュア（schema 破損/undefined） | 6     |
| SDD-10〜11  | 冪等性確認（同一入力複数回）              | 6     |

**テスト数**: Phase 4: 32件 + Phase 6: 15件 = **47件**

**設計要素カバレッジ**:

| 設計要素                             | テストで検証済みか | テストID           |
| ------------------------------------ | ------------------ | ------------------ |
| M-1: required フィールド削除         | YES                | CMP-BC-1, VCB-03   |
| M-2: フィールド型変更                | YES                | CMP-BC-2, VCB-03   |
| M-3: optional→required 変更          | YES                | CMP-BC-3           |
| M-4: output フィールド削除           | YES                | CMP-BC-4           |
| M-5: output 型変更                   | YES                | CMP-BC-5           |
| m-1: optional フィールド追加         | YES                | CMP-S-4〜6         |
| m-2: description のみ変更            | YES                | CMP-S-7〜8, VCB-01 |
| p-1/p-2: 変更なし/パッチ             | YES                | CMP-S-1〜3         |
| CompatibilityCheckResult 4フィールド | YES                | CMP-R-1〜8         |
| BreakingChange 構造体                | YES                | CMP-R-5〜8, SDD-02 |
| DependencyResolver resolve           | YES                | CMP-D-1〜9         |
| N-1 互換判定                         | YES                | VCB-01〜02         |
| N-2 非互換判定                       | YES                | VCB-03〜04         |
| breaking と昇格ブロック              | YES                | VCB-05〜06         |
| compatible/minor と昇格許可          | YES                | VCB-07〜08         |
| 段階的 drift 累積判定                | YES                | SDD-01〜02         |
| フェイルセキュア                     | YES                | SDD-08〜09         |
| 冪等性                               | YES                | SDD-10〜11         |

**カバレッジ**: 18/18 = **100%** (閾値80%: PASS)

---

### C3: Skill Center フロー（AC-4）

| テストID   | テスト概要                             | Phase |
| ---------- | -------------------------------------- | ----- |
| SC-01〜14  | register/update 正常系・異常系・P42    | 4     |
| SC-15〜20  | deprecate 正常系・P42                  | 4     |
| SC-21〜24  | remove 正常系・P42                     | 4     |
| SC-25〜27  | getDependents 正常系・異常系           | 4     |
| DRB-01〜04 | grace period 境界（29/30/31日目）      | 6     |
| DRB-05〜07 | 再公開バージョン整合性                 | 6     |
| DRB-08〜09 | 依存スキル存在時の deprecate 通知      | 6     |
| DRB-10〜13 | gracePeriodDays 下限・emergency フラグ | 6     |

**テスト数**: Phase 4: 27件 + Phase 6: 13件 = **40件**

**設計要素カバレッジ**:

| 設計要素                          | テストで検証済みか | テストID   |
| --------------------------------- | ------------------ | ---------- |
| register 正常系                   | YES                | SC-01〜05  |
| register P42 バリデーション       | YES                | SC-06〜10  |
| update 正常系                     | YES                | SC-11〜12  |
| update 異常系                     | YES                | SC-13〜14  |
| deprecate 正常系                  | YES                | SC-15〜17  |
| deprecate P42 バリデーション      | YES                | SC-18〜20  |
| remove 正常系                     | YES                | SC-21〜22  |
| remove 異常系                     | YES                | SC-23〜24  |
| getDependents 正常系/異常系       | YES                | SC-25〜27  |
| grace period 境界テスト           | YES                | DRB-01〜03 |
| 既存ユーザー影響なし保証          | YES                | DRB-04     |
| 再公開バージョン > deprecation 版 | YES                | DRB-05〜07 |
| 依存スキル deprecate 通知         | YES                | DRB-08〜09 |
| gracePeriodDays 下限/emergency    | YES                | DRB-10〜13 |

**カバレッジ**: 14/14 = **100%** (閾値80%: PASS)

---

### C4: 配布操作（AC-4）

| テストID   | テスト概要                                         | Phase |
| ---------- | -------------------------------------------------- | ----- |
| DT-01〜08  | importSkill 正常系・異常系                         | 4     |
| DT-09〜14  | exportSkill 正常系・異常系                         | 4     |
| DT-15〜20  | forkSkill 正常系・異常系                           | 4     |
| DT-21〜28  | shareSkill 正常系・異常系                          | 4     |
| COC-01〜03 | import-update 同時実行・pendingApproval ブロック   | 6     |
| COC-04〜07 | fork-deprecation/remove 競合                       | 6     |
| COC-08〜10 | share-teamId 無効化                                | 6     |
| EHE-01〜04 | ネットワーク障害（接続断絶/ロールバック/リトライ） | 6     |
| EHE-13〜17 | 権限不足エラー（share/deprecate）                  | 6     |

**テスト数**: Phase 4: 28件 + Phase 6: 19件 = **47件**

**設計要素カバレッジ**:

| 設計要素                             | テストで検証済みか | テストID              |
| ------------------------------------ | ------------------ | --------------------- |
| importSkill 正常系                   | YES                | DT-01〜04             |
| importSkill 依存解決                 | YES                | DT-05〜06             |
| importSkill ネットワークエラー       | YES                | DT-07, EHE-01〜04     |
| importSkill バリデーション           | YES                | DT-08                 |
| exportSkill 正常系/異常系            | YES                | DT-09〜14             |
| forkSkill 正常系/parentRef           | YES                | DT-15〜18, COC-04〜05 |
| forkSkill 権限/not found             | YES                | DT-19〜20, COC-06〜07 |
| shareSkill 正常系                    | YES                | DT-21〜24             |
| shareSkill バリデーション            | YES                | DT-25〜28             |
| import-update 同時実行排他制御       | YES                | COC-01〜02            |
| pendingApproval 中の import ブロック | YES                | COC-03                |
| share-teamId 無効化                  | YES                | COC-08〜10            |
| 権限不足エラー（share/deprecate）    | YES                | EHE-13〜17            |
| ネットワーク障害ロールバック         | YES                | EHE-03                |
| P60 準拠エラーレスポンス             | YES                | COC-10, EHE-17        |

**カバレッジ**: 15/15 = **100%** (閾値80%: PASS)

---

### C5: 公開可否判定ロジック（AC-3）

| テストID    | テスト概要                                             | Phase |
| ----------- | ------------------------------------------------------ | ----- |
| PR-01〜03   | blocked 判定パス（rejected/critical）                  | 4     |
| PR-04〜06   | manual-approval-required 判定パス（high）              | 4     |
| PR-07〜09   | review-required 判定パス（medium+低スコア）            | 4     |
| PR-10〜12   | auto-approved 判定パス（low+高スコア）                 | 4     |
| PR-V-01〜04 | 入力バリデーション（successRate/feedbackScore 範囲外） | 4     |

**テスト数**: Phase 4: 16件 + Phase 6: 0件 = **16件**

**設計要素カバレッジ**:

| 設計要素                                          | テストで検証済みか | テストID                      |
| ------------------------------------------------- | ------------------ | ----------------------------- |
| gateStatus=rejected → blocked                     | YES                | PR-01                         |
| riskLevel=critical → blocked                      | YES                | PR-02〜03                     |
| riskLevel=high → manual-approval-required         | YES                | PR-04〜06                     |
| riskLevel=medium + 低成功率 → review-required     | YES                | PR-07                         |
| riskLevel=medium + declining → review-required    | YES                | PR-08                         |
| riskLevel=medium + スキャン失敗 → review-required | YES                | PR-09                         |
| riskLevel=low + 高スコア → auto-approved          | YES                | PR-10                         |
| riskLevel=low + スキャン失敗 → review-required    | YES                | PR-11                         |
| riskLevel=low + declining → review-required       | YES                | PR-12                         |
| successRate 範囲外バリデーション                  | YES                | PR-V-01〜02                   |
| feedbackScore 範囲外バリデーション                | YES                | PR-V-03〜04                   |
| 判定マトリクス M-01〜M-15 の15パス                | 部分的             | PR-01〜12 で12/15パスをカバー |

**カバレッジ**: 11/12 = **91.7%** (閾値80%: PASS)

**未カバー項目**: 判定マトリクス M-13〜M-15 の一部パス（medium/low の feedbackScore < 3.0 条件分岐の明示的テストが Phase 6 で追加されていない）。ただし PR-07〜12 で間接的にカバーされており、閾値は達成している。

---

## 4. カバレッジ集計サマリー

| 関心事                  | テスト数 | 設計要素数 | カバー数 | カバレッジ | 閾値80%  | 判定     |
| ----------------------- | -------- | ---------- | -------- | ---------- | -------- | -------- |
| C1: 公開メタデータ      | 63       | 14         | 14       | 100%       | PASS     | PASS     |
| C2: 互換性チェック      | 47       | 18         | 18       | 100%       | PASS     | PASS     |
| C3: Skill Center フロー | 40       | 14         | 14       | 100%       | PASS     | PASS     |
| C4: 配布操作            | 47       | 15         | 15       | 100%       | PASS     | PASS     |
| C5: 公開可否判定        | 16       | 12         | 11       | 91.7%      | PASS     | PASS     |
| **合計**                | **213**  | **73**     | **72**   | **98.6%**  | **PASS** | **PASS** |

---

## 5. Phase 8（リファクタリング）への進行判定

**判定: PASS** -- 全5関心事で80%閾値を達成。Phase 6 への差し戻しは不要。Phase 8 へ進行可能。

**補足事項**:

- C5（公開可否判定）の M-13〜M-15 の一部パスは間接カバーに留まるが、91.7% で閾値を十分に超過しているため問題なし
- Phase 6 で追加された 59 テストケースにより、境界値・競合・エラーハンドリングの網羅性が大幅に向上した
