# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 値                                                                           |
| ---------- | ---------------------------------------------------------------------------- |
| Phase      | 7                                                                            |
| タスクID   | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001                                          |
| タスク名   | skill:import IPCハンドラ戻り値型不整合修正（ImportResult→ImportedSkill変換） |
| 機能名     | skill-import-return-type-fix                                                 |
| 分類       | バグ修正                                                                     |
| 作成日     | 2026-02-21                                                                   |
| 前Phase    | Phase 6: テスト拡充                                                          |
| 関連タスク | UT-FIX-SKILL-IMPORT-INTERFACE-001（引数形式修正）                            |

## 目的

Phase 4〜6 で作成・拡充したテストのカバレッジが規定の基準を満たしていることを確認する。基準未達の場合は Phase 6 に戻りテストを追加する。

## 実行タスク

- カバレッジ測定実行
- カバレッジ基準の充足確認
- 未カバー箇所の特定（基準未達の場合）
- Phase 6 への差し戻し判断

## 参照資料

| 資料名                   | パス                                                                                        | 説明                |
| ------------------------ | ------------------------------------------------------------------------------------------- | ------------------- |
| Phase 5 実装仕様書       | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-5-implementation.md`           | 実装分岐の確認      |
| Phase 6 テスト拡充仕様書 | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-6-test-expansion.md`           | 追加テスト一覧      |
| コード品質ルール         | `.claude/rules/02-code-quality.md`                                                          | カバレッジ基準      |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                                        | P41（v8カバレッジ） |
| 実装パターン集           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | カバレッジパターン  |

### システム仕様書参照（aiworkflow-requirements）

| 仕様書                                    | 該当セクション           | 参照目的                                |
| ----------------------------------------- | ------------------------ | --------------------------------------- |
| `interfaces-agent-sdk-skill.md`           | skill:import セクション  | 実装の全分岐を確認するための仕様参照    |
| `security-electron-ipc.md`                | セキュリティ検証パターン | validateIpcSender関連の分岐カバレッジ   |
| `architecture-implementation-patterns.md` | テストカバレッジ戦略     | v8プロバイダのインライン関数対策（P41） |

---

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 根拠                               |
| ----------------- | -------- | -------- | ---------------------------------- |
| Line Coverage     | 80%      | 90%      | `.claude/rules/02-code-quality.md` |
| Branch Coverage   | 60%      | 70%      | 同上                               |
| Function Coverage | 80%      | 90%      | 同上                               |

## 実行手順

### Task 1: カバレッジ測定

#### 1.1 skillHandlers.ts のカバレッジ測定

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/ipc/__tests__/skillHandlers
```

#### 1.2 カバレッジレポート確認

カバレッジレポート出力（`coverage/` ディレクトリ）を確認し、以下を記録する:

| ファイル         | Line % | Branch % | Function % | 基準達成 |
| ---------------- | ------ | -------- | ---------- | -------- |
| skillHandlers.ts | ?      | ?        | ?          | ?        |

### Task 2: 分岐カバレッジ詳細分析

#### 2.1 skill:import ハンドラの全分岐

修正後のハンドラに含まれる分岐を列挙し、テストでカバーされているか確認する:

| #   | 分岐条件                                             | カバーするテスト               |
| --- | ---------------------------------------------------- | ------------------------------ |
| 1   | `!validation.valid`（セキュリティ拒否）              | RT-16, RT-17, RT-18            |
| 2   | `typeof skillName !== "string"`（型不正）            | RT-13, RT-14                   |
| 3   | `skillName.trim() === ""`（空文字列/スペースのみ）   | RT-11, RT-12, RT-15            |
| 4   | `result.success && result.importedCount > 0`（成功） | SH-IMP-01, RT-01, RT-05, RT-06 |
| 5   | `!result.success`（インポート失敗）                  | RT-03, RT-10                   |
| 6   | `result.importedCount === 0`（カウント0）            | RT-09                          |
| 7   | `importedSkill !== null`（スキル取得成功）           | SH-IMP-01, RT-01               |
| 8   | `importedSkill === null`（スキル取得失敗）           | RT-04                          |
| 9   | `result.errors.length > 0`（エラーメッセージあり）   | RT-03, RT-10                   |
| 10  | `result.errors.length === 0`（エラーメッセージなし） | RT-09                          |

#### 2.2 P41準拠: インライン関数カバレッジ

`validateIpcSender` のオプションオブジェクト内の `getAllowedWindows` コールバック（インラインarrow function）が実行されているか確認する。

```typescript
// このインライン関数がv8カバレッジプロバイダで独立関数としてカウントされる
{
  getAllowedWindows: () => [mainWindow],
}
```

**対策**: RT-17 テストで `callArgs[2].getAllowedWindows()` を明示的に呼び出しているため、Function Coverage に貢献する。

### Task 3: 基準達成判定

#### 3.1 判定ロジック

```
IF (Line >= 80% AND Branch >= 60% AND Function >= 80%):
  → PASS: Phase 8 へ進む
ELSE:
  → FAIL: Phase 6 へ戻りテスト追加
```

#### 3.2 基準未達時の対応

基準未達の場合、以下の手順で Phase 6 に戻る:

1. カバレッジレポートの未カバー行を特定
2. 未カバー分岐を列挙
3. 追加テストケースを設計
4. Phase 6 の仕様書に追記
5. テスト追加後、Phase 7 を再実行

#### 3.3 よくある未カバー箇所（予防的チェック）

| 未カバー箇所                              | 追加テスト候補                            |
| ----------------------------------------- | ----------------------------------------- |
| `validateIpcSender` の `valid: true` 分岐 | 正常系テスト（既に SH-IMP-01 等でカバー） |
| `getAllowedWindows` コールバック          | RT-17 で明示的呼び出し（P41準拠）         |
| `result.errors.join(", ")` パス           | RT-10 で複数エラーメッセージテスト        |
| throw の `message` テンプレートリテラル   | RT-09 でエラーなしの場合をカバー          |

### Task 4: カバレッジ結果の記録

#### 4.1 outputs ディレクトリに結果を保存

```
docs/30-workflows/ut-fix-skill-import-return-type-001/outputs/phase-7/
  coverage-summary.md  # カバレッジ結果サマリー
```

#### 4.2 coverage-summary.md のテンプレート

```markdown
# Phase 7 カバレッジ結果

## 測定日時

YYYY-MM-DD HH:MM

## カバレッジ結果

| ファイル         | Line % | Branch % | Function % | 判定      |
| ---------------- | ------ | -------- | ---------- | --------- |
| skillHandlers.ts | XX.XX% | XX.XX%   | XX.XX%     | PASS/FAIL |

## 分岐カバレッジ詳細

| 分岐                        | カバー状況 | テストID            |
| --------------------------- | ---------- | ------------------- |
| セキュリティ拒否            | ✅/❌      | RT-16〜18           |
| 型不正バリデーション        | ✅/❌      | RT-13, RT-14        |
| 空文字列バリデーション      | ✅/❌      | RT-11, RT-12, RT-15 |
| インポート成功 + スキル取得 | ✅/❌      | SH-IMP-01, RT-01    |
| インポート失敗              | ✅/❌      | RT-03, RT-10        |
| importedCount=0             | ✅/❌      | RT-09               |
| getSkillByName null         | ✅/❌      | RT-04               |

## 判定

- [ ] Line Coverage >= 80%: XX.XX%
- [ ] Branch Coverage >= 60%: XX.XX%
- [ ] Function Coverage >= 80%: XX.XX%

**結果**: PASS / FAIL（Phase 6 へ差し戻し）
```

---

## 統合テスト連携

| 観点         | 確認内容                                                                         | 参照仕様                                                                                                                                                                                                                                          |
| ------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IPC契約      | `skill:import` の引数・戻り値・エラー形式の整合を確認                            | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` / `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md` / `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` |
| セキュリティ | `validateIpcSender` と入力バリデーション（`skillName` / `skillIds`）の整合を確認 | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` / `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                                                          |
| E2E整合      | Main → Preload → Renderer で `ImportedSkill` が破綻なく流れることを確認          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                                                                                                                                                 |

## 成果物

| 成果物                   | パス                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| Phase 7 カバレッジ仕様書 | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-7-coverage-verification.md`    |
| カバレッジ結果サマリー   | `docs/30-workflows/ut-fix-skill-import-return-type-001/outputs/phase-7/coverage-summary.md` |

## 完了条件

- [ ] カバレッジ測定が実行されている
- [ ] Line Coverage が 80% 以上である
- [ ] Branch Coverage が 60% 以上である
- [ ] Function Coverage が 80% 以上である
- [ ] P41準拠: getAllowedWindows コールバックのFunction Coverage貢献が確認されている
- [ ] カバレッジ結果サマリーが outputs/phase-7/ に保存されている
- [ ] 基準未達の場合、Phase 6 への差し戻し理由と追加テスト計画が記録されている

## 次Phase

→ Phase 8: リファクタリング（phase-8-refactoring.md）
