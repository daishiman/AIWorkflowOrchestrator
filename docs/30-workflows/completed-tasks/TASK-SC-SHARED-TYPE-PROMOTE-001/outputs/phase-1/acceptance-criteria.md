# Phase 1: 受け入れ基準（AC-1〜AC-5）

## タスク情報

| 項目     | 内容                            |
| -------- | ------------------------------- |
| タスクID | TASK-SC-SHARED-TYPE-PROMOTE-001 |
| Phase    | 1                               |
| 作成日   | 2026-04-16                      |
| 判断結果 | ローカル定義維持・即クローズ    |

---

## 受け入れ基準

### AC-1 (棚卸し完了)

**基準**: `StructurePlanJson` の全参照箇所が `reference-inventory.md` に記録されていること。

**充足状況**: ✅ PASS

- `outputs/phase-1/reference-inventory.md` に全5参照行（1ファイル）が記録済み
- `grep -rn "StructurePlanJson" apps/ packages/` の結果を網羅

---

### AC-2 (初手判断)

**基準**: 参照箇所が 1 箇所のみなら、その場でローカル維持・クローズを記録し、Phase 2 以降へ進まないこと。

**充足状況**: ✅ PASS

- 参照ファイル数: 1 (`SkillCreatorService.ts`)
- 判断: ローカル定義維持・即クローズ
- Phase 2 以降: **実施しない**

---

### AC-3 (昇格条件)

**基準**: 参照箇所が 2 箇所以上なら、`packages/shared/src/types/skillCreator.ts` への昇格判断が理由とともに記録されること。

**充足状況**: N/A（参照箇所が 1 ファイルのみのため、この AC は適用外）

---

### AC-4 (Single Source of Truth)

**基準**: 昇格実施の場合、ローカル定義が削除されており、`StructurePlanJson` の定義が `packages/shared/src/types/skillCreator.ts` のみに存在すること。

**充足状況**: N/A（昇格不実施のため適用外）

- 現状: `StructurePlanJson` は `SkillCreatorService.ts` のみに存在（Single Source of Truth 維持済み）

---

### AC-5 (テスト全PASS)

**基準**: 昇格実施の場合、既存の全テストが PASS すること。昇格しない場合は変更なし。

**充足状況**: ✅ PASS（変更なし）

- 本タスクでは実装コードの変更を行わない
- 既存テストへの影響: ゼロ

---

## 総合判定

| AC   | 判定 | 備考                               |
| ---- | ---- | ---------------------------------- |
| AC-1 | PASS | 棚卸し完了・1ファイルのみ確認      |
| AC-2 | PASS | ローカル維持・クローズ判断記録済み |
| AC-3 | N/A  | 昇格不要のため適用外               |
| AC-4 | N/A  | 昇格不要のため適用外               |
| AC-5 | PASS | 変更なし・既存テスト影響なし       |

**Phase 1 完了**: タスクを即クローズして完了。Phase 2〜11 はスキップ。

---

_生成日: 2026-04-16_
_タスク: TASK-SC-SHARED-TYPE-PROMOTE-001_
