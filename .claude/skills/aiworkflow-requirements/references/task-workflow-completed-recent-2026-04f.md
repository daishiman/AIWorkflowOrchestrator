# 完了タスク記録 — 2026-04-14

> 親ファイル: [task-workflow-completed.md](task-workflow-completed.md)

---

### タスク: TASK-SW-FIX-UI-001 UI整合性修正（2026-04-14）

| 項目       | 値                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-SW-FIX-UI-001                                                                                          |
| ステータス | **完了（実装 + 仕様同期）**                                                                                 |
| タイプ     | ui-consistency / visual-audit / workflow-sync                                                               |
| 優先度     | 低                                                                                                          |
| 完了日     | 2026-04-14                                                                                                  |
| 対象       | `docs/30-workflows/WC-par-03b-fix-ui/` / `packages/shared/src/types/skillCreator.ts` / `apps/desktop/src/renderer/components/skill/` |
| 成果物     | `docs/30-workflows/WC-par-03b-fix-ui/outputs/phase-12/`                                                     |
| PR         | 未作成（Phase 13 blocked）                                                                                  |

#### 実施内容

- `SkillInfoFormData.category` を `SkillCategory[]` 化し、`resolvePrimarySkillCategory()` で代表カテゴリを決定するようにした
- `SkillInfoStep` / `ConversationRoundStep` / `ApplySummaryCard` / `SkillCreateWizard` の current facts を UI 整合性修正後の内容へ揃えた
- Phase 11 のスクリーンショット 9 枚と DevTools audit PASS を current facts として保存した
- Phase 12 の canonical 6 成果物と root / outputs の artifacts parity を completed で固定した

#### 検証証跡

| コマンド / 証跡 | 結果 |
| --- | --- |
| `pnpm --filter @repo/shared typecheck` | PASS |
| `pnpm --filter @repo/desktop exec tsc --noEmit --pretty false` | PASS |
| `outputs/phase-11/screenshot-manifest.json` | PASS（9 PNGs） |
| `outputs/phase-11/devtools-audit.md` | PASS（Console error count 0） |
| `artifacts.json` / `outputs/artifacts.json` | PASS（parity） |

#### 苦戦箇所

| 苦戦箇所 | 解決策 |
| --- | --- |
| 代表カテゴリを `category[0]` で固定すると選択順に依存する | `resolvePrimarySkillCategory()` に置き換えて優先順位を共通化した |
| Phase 11 証跡と Phase 12 文書の同期がずれやすい | 9 枚のスクリーンショットと audit PASS を Phase 12 側でも明示した |

#### lessons-learned

- UI の current facts は実装・証跡・台帳を同 wave で閉じる
- 配列化した state で単一値を要する経路は、暗黙の先頭参照より明示的な優先順位関数が安全

### タスク: UT-W3-ANALYTICS-STORE-INTEGRATION-001 analytics store integration（2026-04-13）

| 項目       | 値                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------- |
| タスクID   | UT-W3-ANALYTICS-STORE-INTEGRATION-001                                                             |
| ステータス | **完了（実装 + 仕様同期）**                                                                       |
| タイプ     | store / shared-types / workflow-sync                                                              |
| 優先度     | 高                                                                                                |
| 完了日     | 2026-04-13                                                                                        |
| 対象       | `apps/desktop/src/renderer/store/slices/analyticsSlice.ts` / `agentSlice.ts` / shared export sync |
| 成果物     | `docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/outputs/phase-12/`                       |
| PR         | 未作成（Phase 13 blocked）                                                                        |

#### 実施内容

- `analyticsSlice.ts` を `toAnalyticsPayload()` / `sendSkillAnalyticsEvent()` 経由にして payload 構築を明示化した
- `agentSlice.ts` に analytics wiring を追加し、start / complete / error の lifecycle を store 側から送れるようにした
- `packages/shared/src/types/index.ts` と `packages/shared/index.ts` で `SkillAnalyticsEventType` / `SkillAnalyticsEvent` を再公開した
- `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts` と `packages/shared/src/types/__tests__/skill-analytics.test.ts` を追加した
- Phase 12 outputs（implementation-guide / system-spec-update-summary / documentation-changelog / skill-feedback / compliance check）を current facts に更新した
- `artifacts.json` / `outputs/artifacts.json` の parity を completed / blocked で揃えた

#### 検証証跡

| コマンド                                                                                                                                                                          | 結果                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `pnpm --filter @repo/desktop typecheck`                                                                                                                                           | PASS                         |
| `pnpm --filter @repo/shared typecheck`                                                                                                                                            | PASS                         |
| `pnpm --filter @repo/desktop exec vitest run src/renderer/store/slices/__tests__/analyticsSlice.test.ts src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts` | PASS（93 tests）             |
| `pnpm --filter @repo/shared exec vitest run src/types/__tests__/skill-analytics.test.ts`                                                                                          | PASS（9 tests）              |
| `docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/outputs/phase-11/manual-test-result.md`                                                                                  | PASS（30 tests, NON_VISUAL） |

#### 苦戦箇所

| 苦戦箇所                                                   | 解決策                                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| shared export 追加だけでは consumer wiring が見えなくなる  | `agentSlice.ts` で lifecycle の責務を握り、`analyticsSlice.ts` に接続した |
| `SkillAnalyticsEvent` の公開経路が barrel で揺れる         | `types/index.ts` と `packages/shared/index.ts` を同 wave で再公開した     |
| Phase 12 成果物だけ更新して root / outputs parity を落とす | `artifacts.json` と `outputs/artifacts.json` を同値で維持した             |

#### lessons-learned

- 共有型の追加は `definition + types/index + package index + consumer wiring` を 1 wave で閉じる
- helper-based payload conversion は `as unknown as` 依存より追跡しやすい
- NON_VISUAL タスクでも、証跡の主ソースを先に固定しておくと後続の説明がぶれない

---

### タスク: UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001 スキルウィザード Q5 主ツールバッジ表示（2026-04-13）

| 項目       | 値                                                                            |
| ---------- | ----------------------------------------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001                                          |
| ステータス | **完了（実装 + 仕様同期）**                                                   |
| タイプ     | UI改善 / accessibility / conditional-badge                                    |
| 優先度     | 中                                                                            |
| 完了日     | 2026-04-13                                                                    |
| 対象       | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` |
| 成果物     | `docs/30-workflows/ut-skill-wizard-mso-main-tool-ui-001/outputs/phase-12/`    |
| Issue      | #2071                                                                         |
| PR         | 未作成（Phase 13 blocked）                                                    |

#### 実施内容

- Q5 で 2 件以上選択時に先頭選択項目へ「主ツール」バッジを表示する `shouldShowMainToolBadge()` を実装した
- `MAIN_TOOL_BADGE_ENABLED` フラグで将来削除を容易にした設計にした
- `aria-labelledby` で button の accessible name を選択肢テキストに固定し、バッジは `aria-describedby` で補助情報として関連付けた
- 主ツールバッジ関連テスト 11 ケース + 回帰テスト 5 ケースを追加した（TC-1〜TC-6 / FP-MSO-01-02 / CMD-MSO-01 / RG-MSO-Q4/Q6）
- Phase 11 screenshots 5 枚（q5-single-select / q5-multi-select-badge / q3-no-badge / q4-no-badge / q6-no-badge）で視覚証跡を取得した
- Phase 12 outputs 6 件（実装ガイド / system-spec-update-summary / documentation-changelog / unassigned-task-detection / skill-feedback / phase12-compliance-check）を完成した

#### 検証証跡

| コマンド                                                                                        | 結果                       |
| ----------------------------------------------------------------------------------------------- | -------------------------- |
| `pnpm --filter @repo/desktop typecheck`                                                         | PASS                       |
| `pnpm --filter @repo/desktop exec vitest run .../ConversationRoundStep.test.tsx`                | PASS（全テストケース）     |
| `docs/30-workflows/ut-skill-wizard-mso-main-tool-ui-001/outputs/phase-11/manual-test-result.md` | PASS（5 screenshots 取得） |

#### 苦戦箇所

| 苦戦箇所                                                          | 解決策                                                                                 |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| button 内バッジが accessible name に混入して `getByRole` が崩れる | `aria-labelledby` でボタン名を固定し、バッジは `aria-describedby` で補助情報に分離した |
| 暫定バッジの削除箇所が実装段階で散らばりやすい                    | `MAIN_TOOL_BADGE_ENABLED` + `shouldShowMainToolBadge` + 削除手順書の 3 点セットで管理  |

#### lessons-learned

- visual label と accessible name は別管理する（`aria-labelledby` で名前固定、`aria-describedby` で補助情報）
- 見た目のラベルと意味のラベルを分けると、`getByRole` exact match テストが安定する
- 将来削除予定のバッジは機能フラグ + 専用関数 + 削除手順書の 3 点セットで実装する
- 詳細: `lessons-learned-skill-wizard-mso-main-tool-badge.md`

---

# 完了タスク記録 — 2026-04-14

### タスク: UT-SKILL-NAME-PATTERN-001 skill-name-pattern-shared-constant（2026-04-14）

| 項目       | 値                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------- |
| タスクID   | UT-SKILL-NAME-PATTERN-001                                                                 |
| ステータス | **完了（監査 + no-op確認 + docs同期）**                                                   |
| タイプ     | refactoring / audit / docs-sync                                                           |
| 優先度     | medium                                                                                    |
| 完了日     | 2026-04-14                                                                                |
| 対象       | `packages/shared/src/constants/skillName.ts` / `packages/shared/src/constants/index.ts` |
| 成果物     | `docs/30-workflows/ut-skill-name-pattern-001/outputs/phase-12/`                          |
| PR         | Phase 13（ユーザー承認後）                                                                |

#### 実施内容

- Phase 1 で現行 state を監査し `SKILL_NAME_PATTERN` と `MAX_SKILL_NAME_LENGTH` が `skillName.ts` に集約済みと確認（drift なし）
- `SkillScanner.ts` と `init_skill.js` が `@repo/shared/constants` を参照していることを確認
- 既存テスト 60 件 ALL PASS（skillName 11 + manual-import 14 + scanner 35）
- Phase 12 で `docs/00-requirements/18-skills.md` との整合を確認し no-op と判定
- impl-spec-to-skill-sync で `18-skills.md` にセクション 3.2.2.2（定数一元化管理）を追記

#### 検証証跡

| 検証項目                                | 結果                                    |
| --------------------------------------- | --------------------------------------- |
| AC-1〜AC-5 全受入基準                   | PASS                                    |
| `pnpm --filter @repo/shared test`       | 11 tests PASS                           |
| `pnpm --filter @repo/desktop typecheck` | PASS                                    |
| `grep @repo/shared/constants` 全参照    | SkillScanner.ts・init_skill.js 確認済み |

#### 苦戦箇所

| 苦戦箇所                                                                  | 解決策                                                                   |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 過去タスク ID（UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001）との混在 | index.md の発見元を明記し「監査・確認系」として分類した                  |
| Phase 12 の no-op と impl-spec-to-skill-sync 追記推奨の矛盾               | タスクスコープ（drift確認）と監査スコープ（改善余地）は異なると判断し追記 |

# 完了タスク記録 — 2026-04-13

> 親ファイル: [task-workflow-completed.md](task-workflow-completed.md)

---

### タスク: UT-W3-ANALYTICS-STORE-INTEGRATION-001 analytics store integration（2026-04-13）

| 項目       | 値                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------- |
| タスクID   | UT-W3-ANALYTICS-STORE-INTEGRATION-001                                                             |
| ステータス | **完了（実装 + 仕様同期）**                                                                       |
| タイプ     | store / shared-types / workflow-sync                                                              |
| 優先度     | 高                                                                                                |
| 完了日     | 2026-04-13                                                                                        |
| 対象       | `apps/desktop/src/renderer/store/slices/analyticsSlice.ts` / `agentSlice.ts` / shared export sync |
| 成果物     | `docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/outputs/phase-12/`                       |
| PR         | 未作成（Phase 13 blocked）                                                                        |
| 項目       | 値                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------- |
| タスクID   | UT-W3-ANALYTICS-STORE-INTEGRATION-001                                                                |
| ステータス | **完了（実装 + 仕様同期）**                                                                          |
| タイプ     | store / shared-types / workflow-sync                                                                 |
| 優先度     | 高                                                                                                   |
| 完了日     | 2026-04-13                                                                                           |
| 対象       | `apps/desktop/src/renderer/store/slices/analyticsSlice.ts` / `agentSlice.ts` / shared export sync  |
| 成果物     | `docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/outputs/phase-12/`                        |
| PR         | 未作成（Phase 13 blocked）                                                                           |
| 項目       | 値                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------- |
| タスクID   | UT-W3-ANALYTICS-STORE-INTEGRATION-001                                                             |
| ステータス | **完了（実装 + 仕様同期）**                                                                       |
| タイプ     | store / shared-types / workflow-sync                                                              |
| 優先度     | 高                                                                                                |
| 完了日     | 2026-04-13                                                                                        |
| 対象       | `apps/desktop/src/renderer/store/slices/analyticsSlice.ts` / `agentSlice.ts` / shared export sync |
| 成果物     | `docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/outputs/phase-12/`                       |
| PR         | 未作成（Phase 13 blocked）                                                                        |

#### 実施内容

- `analyticsSlice.ts` を `toAnalyticsPayload()` / `sendSkillAnalyticsEvent()` 経由にして payload 構築を明示化した
- `agentSlice.ts` に analytics wiring を追加し、start / complete / error の lifecycle を store 側から送れるようにした
- `packages/shared/src/types/index.ts` と `packages/shared/index.ts` で `SkillAnalyticsEventType` / `SkillAnalyticsEvent` を再公開した
- `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts` と `packages/shared/src/types/__tests__/skill-analytics.test.ts` を追加した
- Phase 12 outputs（implementation-guide / system-spec-update-summary / documentation-changelog / skill-feedback / compliance check）を current facts に更新した
- `artifacts.json` / `outputs/artifacts.json` の parity を completed / blocked で揃えた

#### 検証証跡

| コマンド                                                                                                                                                                          | 結果                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `pnpm --filter @repo/desktop typecheck`                                                                                                                                           | PASS                         |
| `pnpm --filter @repo/shared typecheck`                                                                                                                                            | PASS                         |
| `pnpm --filter @repo/desktop exec vitest run src/renderer/store/slices/__tests__/analyticsSlice.test.ts src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts` | PASS（93 tests）             |
| `pnpm --filter @repo/shared exec vitest run src/types/__tests__/skill-analytics.test.ts`                                                                                          | PASS（9 tests）              |
| `docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/outputs/phase-11/manual-test-result.md`                                                                                  | PASS（30 tests, NON_VISUAL） |

#### 苦戦箇所

| 苦戦箇所                                                   | 解決策                                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| shared export 追加だけでは consumer wiring が見えなくなる  | `agentSlice.ts` で lifecycle の責務を握り、`analyticsSlice.ts` に接続した |
| `SkillAnalyticsEvent` の公開経路が barrel で揺れる         | `types/index.ts` と `packages/shared/index.ts` を同 wave で再公開した     |
| Phase 12 成果物だけ更新して root / outputs parity を落とす | `artifacts.json` と `outputs/artifacts.json` を同値で維持した             |

#### lessons-learned

- 共有型の追加は `definition + types/index + package index + consumer wiring` を 1 wave で閉じる
- helper-based payload conversion は `as unknown as` 依存より追跡しやすい
- NON_VISUAL タスクでも、証跡の主ソースを先に固定しておくと後続の説明がぶれない

---

### タスク: UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001 スキルウィザード Q5 主ツールバッジ表示（2026-04-13）

| 項目       | 値                                                                            |
| ---------- | ----------------------------------------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001                                          |
| ステータス | **完了（実装 + 仕様同期）**                                                   |
| タイプ     | UI改善 / accessibility / conditional-badge                                    |
| 優先度     | 中                                                                            |
| 完了日     | 2026-04-13                                                                    |
| 対象       | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` |
| 成果物     | `docs/30-workflows/ut-skill-wizard-mso-main-tool-ui-001/outputs/phase-12/`    |
| Issue      | #2071                                                                         |
| PR         | 未作成（Phase 13 blocked）                                                    |

#### 実施内容

- Q5 で 2 件以上選択時に先頭選択項目へ「主ツール」バッジを表示する `shouldShowMainToolBadge()` を実装した
- `MAIN_TOOL_BADGE_ENABLED` フラグで将来削除を容易にした設計にした
- `aria-labelledby` で button の accessible name を選択肢テキストに固定し、バッジは `aria-describedby` で補助情報として関連付けた
- 主ツールバッジ関連テスト 11 ケース + 回帰テスト 5 ケースを追加した（TC-1〜TC-6 / FP-MSO-01-02 / CMD-MSO-01 / RG-MSO-Q4/Q6）
- Phase 11 screenshots 5 枚（q5-single-select / q5-multi-select-badge / q3-no-badge / q4-no-badge / q6-no-badge）で視覚証跡を取得した
- Phase 12 outputs 6 件（実装ガイド / system-spec-update-summary / documentation-changelog / unassigned-task-detection / skill-feedback / phase12-compliance-check）を完成した

#### 検証証跡

| コマンド                                                                                        | 結果                       |
| ----------------------------------------------------------------------------------------------- | -------------------------- |
| `pnpm --filter @repo/desktop typecheck`                                                         | PASS                       |
| `pnpm --filter @repo/desktop exec vitest run .../ConversationRoundStep.test.tsx`                | PASS（全テストケース）     |
| `docs/30-workflows/ut-skill-wizard-mso-main-tool-ui-001/outputs/phase-11/manual-test-result.md` | PASS（5 screenshots 取得） |

#### 苦戦箇所

| 苦戦箇所                                                          | 解決策                                                                                 |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| button 内バッジが accessible name に混入して `getByRole` が崩れる | `aria-labelledby` でボタン名を固定し、バッジは `aria-describedby` で補助情報に分離した |
| 暫定バッジの削除箇所が実装段階で散らばりやすい                    | `MAIN_TOOL_BADGE_ENABLED` + `shouldShowMainToolBadge` + 削除手順書の 3 点セットで管理  |

#### lessons-learned

- visual label と accessible name は別管理する（`aria-labelledby` で名前固定、`aria-describedby` で補助情報）
- 見た目のラベルと意味のラベルを分けると、`getByRole` exact match テストが安定する
- 将来削除予定のバッジは機能フラグ + 専用関数 + 削除手順書の 3 点セットで実装する
- 詳細: `lessons-learned-skill-wizard-mso-main-tool-badge.md`

---

### タスク: UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001 スキルウィザード Q5 主ツールバッジ表示（2026-04-13）

| 項目       | 値                                                                            |
| ---------- | ----------------------------------------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001                                          |
| ステータス | **完了（実装 + 仕様同期）**                                                   |
| タイプ     | UI改善 / accessibility / conditional-badge                                    |
| 優先度     | 中                                                                            |
| 完了日     | 2026-04-13                                                                    |
| 対象       | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` |
| 成果物     | `docs/30-workflows/ut-skill-wizard-mso-main-tool-ui-001/outputs/phase-12/`    |
| Issue      | #2071                                                                         |
| PR         | 未作成（Phase 13 blocked）                                                    |

#### 実施内容

- Q5 で 2 件以上選択時に先頭選択項目へ「主ツール」バッジを表示する `shouldShowMainToolBadge()` を実装した
- `MAIN_TOOL_BADGE_ENABLED` フラグで将来削除を容易にした設計にした
- `aria-labelledby` で button の accessible name を選択肢テキストに固定し、バッジは `aria-describedby` で補助情報として関連付けた
- 主ツールバッジ関連テスト 11 ケース + 回帰テスト 5 ケースを追加した（TC-1〜TC-6 / FP-MSO-01-02 / CMD-MSO-01 / RG-MSO-Q4/Q6）
- Phase 11 screenshots 5 枚（q5-single-select / q5-multi-select-badge / q3-no-badge / q4-no-badge / q6-no-badge）で視覚証跡を取得した
- Phase 12 outputs 6 件（実装ガイド / system-spec-update-summary / documentation-changelog / unassigned-task-detection / skill-feedback / phase12-compliance-check）を完成した

#### 検証証跡

| コマンド                                                                                        | 結果                       |
| ----------------------------------------------------------------------------------------------- | -------------------------- |
| `pnpm --filter @repo/desktop typecheck`                                                         | PASS                       |
| `pnpm --filter @repo/desktop exec vitest run .../ConversationRoundStep.test.tsx`                | PASS（全テストケース）     |
| `docs/30-workflows/ut-skill-wizard-mso-main-tool-ui-001/outputs/phase-11/manual-test-result.md` | PASS（5 screenshots 取得） |

#### 苦戦箇所

| 苦戦箇所                                                          | 解決策                                                                                 |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| button 内バッジが accessible name に混入して `getByRole` が崩れる | `aria-labelledby` でボタン名を固定し、バッジは `aria-describedby` で補助情報に分離した |
| 暫定バッジの削除箇所が実装段階で散らばりやすい                    | `MAIN_TOOL_BADGE_ENABLED` + `shouldShowMainToolBadge` + 削除手順書の 3 点セットで管理  |

#### lessons-learned

- visual label と accessible name は別管理する（`aria-labelledby` で名前固定、`aria-describedby` で補助情報）
- 見た目のラベルと意味のラベルを分けると、`getByRole` exact match テストが安定する
- 将来削除予定のバッジは機能フラグ + 専用関数 + 削除手順書の 3 点セットで実装する
- 詳細: `lessons-learned-skill-wizard-mso-main-tool-badge.md`

---

### タスク: TASK-SW-FIX-MODE-MGMT-001 スキルウィザード generationMode廃止・LLM専用化（2026-04-14）

| 項目       | 値                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-SW-FIX-MODE-MGMT-001                                                                                         |
| ステータス | **完了（実装 + 仕様同期）**                                                                                       |
| タイプ     | bug-fix / state-deprecation / flow-correction                                                                     |
| 優先度     | 高                                                                                                                |
| 完了日     | 2026-04-14                                                                                                        |
| 対象       | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` / `wizard/SkillInfoStep.tsx` / wizard テスト群 |
| 成果物     | `docs/30-workflows/WB-par-02a-fix-mode-mgmt/outputs/phase-12/`                                                    |
| PR         | #2148                                                                                                             |

#### 実施内容

- `SkillInfoStep.tsx` から仕様外ラジオボタン（「テンプレートから作成」「LLMで生成」）を完全削除した
- `SkillCreateWizard.tsx` から `generationMode` / `hasActivatedLlmMode` の二重フラグ state を廃止した
- `handleStep0Next` を `goNext()` のみに統一し、Step 0→1→2→3 の正規フローを確立した（`goToStep(2)` の分岐除去）
- TC-06「静的残骸ゼロ確認テスト」を追加し、DOM query で `input[name="generationMode"]` が 0件であることを動的検証した
- Wave A（TASK-SW-FIX-DATAFLOW-001 実装）+ Wave B（本タスク：テスト・ドキュメント）の二段階で完了した

#### 検証証跡

| コマンド                                                            | 結果                   |
| ------------------------------------------------------------------- | ---------------------- |
| `pnpm --filter @repo/desktop typecheck`                             | PASS                   |
| `pnpm --filter @repo/desktop exec vitest run .../SkillCreateWizard` | PASS（36 tests）       |
| grep `generationMode` 全ファイル検索                                | 残存参照ゼロ確認       |
| `outputs/phase-11/screenshots/` 5枚                                 | Step 0ラジオなし確認済 |

#### 苦戦箇所

| 苦戦箇所                                                           | 解決策                                                                           |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Wave A完了後に TDD Red フェーズを実施しても Red 状態を作れなかった | Wave A・B を同時計画し、Phase 4 実施時点で実装未完状態を維持する必要性を認識した |
| 二重フラグ廃止の影響範囲（state/UI/props/呼び出し側）が広範        | 廃止 6ステップ手順（state→UI→props→呼び出し側→grep→DOM確認）を標準化した         |
| Electron 実機起動なしでの視覚証跡確保                              | 36 UT PASS + grep ゼロ確認 + TC-06 DOM query + typecheck の多層防御で代替した    |

#### lessons-learned

- state 廃止は「state削除 → UI削除 → props削除 → 呼び出し側修正 → grep → DOM確認」の 6ステップで完結させる
- TC-06 型の動的廃止検証（DOM query で旧要素が 0件）を廃止系タスクのデフォルトテストとして組み込む
- Wave 分割実施では、TDD Red フェーズを Wave A・B の計画段階で同時設計する
- 詳細: `lessons-learned-skill-wizard-mode-mgmt.md`

---

### タスク: UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 IPC 4層整合CI検証スクリプト（2026-04-14）

| 項目       | 値                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| タスクID   | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001                                                                   |
| ステータス | **spec_created**（docs-only workflow のため completed にしない）                                      |
| タイプ     | Quality Gate / CI Automation / Static Analysis                                                        |
| 優先度     | 高                                                                                                   |
| 完了日     | 2026-04-14                                                                                           |
| 対象       | `scripts/verify-ipc-4layer.cjs`（1,017行）/ `scripts/__tests__/verify-ipc-4layer/`（4ファイル）      |
| CI統合     | `.github/workflows/ci.yml`（`verify-ipc-4layer` ジョブ）                                             |
| 成果物     | `docs/30-workflows/UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001/`                                              |
| PR         | 未作成（Phase 13 blocked）                                                                           |

#### 実施内容

- IPC 4層（shared channels → preload whitelist → main handler → renderer sink）のチャネル定義を自動検証するCIスクリプトを実装した
- Node.js標準ライブラリのみ使用（外部依存ゼロ）で1,017行のスクリプトを構築した
- ステートマシン方式でコメント処理を実装し、文字列リテラル内のコメントパターンを保護した
- `buildConstValueMap()` でspread/定数参照解決を実装した（約80行）
- mainハンドラの6パターン（`ipcMain.handle()`, DI, ラッパー, ファクトリ, 配列スタイル等）に対応した
- テスト4ファイル113テスト全GREENを達成した

#### 検証証跡

| コマンド                                                        | 結果                                                  |
| --------------------------------------------------------------- | ----------------------------------------------------- |
| `node scripts/verify-ipc-4layer.cjs`                            | PASS（既存ギャップ20件は設計制限として文書化）         |
| `pnpm vitest run scripts/__tests__/verify-ipc-4layer`           | PASS（113 tests: parsers 79, validators 19, reporter 8, e2e 7） |
| カバレッジ                                                      | Line 89.88%, Branch 90.97%, Function 94.11%           |

#### 苦戦箇所

| 苦戦箇所                              | 解決策                                                               |
| ------------------------------------- | -------------------------------------------------------------------- |
| コメント処理で文字列内パターンを誤検出 | ステートマシン方式で状態追跡                                         |
| spread/定数参照の展開                  | `buildConstValueMap()` で2段階解決（ローカル優先・外部フォールバック） |
| mainハンドラの多様な登録パターン       | 6パターン個別マッチング                                              |
| ローカルconst vs 外部importの優先度    | ファイル内const優先の2段階解決を実装                                  |
| Rule-1/Rule-2ギャップの解釈           | コードベース既存ギャップとして文書化（スクリプト不具合ではない）       |

#### lessons-learned

- ソースコード静的解析のコメント除去は正規表現ではなくステートマシン方式を使う
- 定数参照解決は「ローカル優先・外部フォールバック」の2段階で行う
- 検証スクリプトの検出結果は「バグ」と断定する前にコードベース側の実態を確認する
- 詳細: `lessons-learned-ipc-4layer-verification-2026-04.md`

---

### タスク: TASK-CI-OPT-001 CI最適化（node_modulesキャッシュ + シャード調整）（2026-04-14）

| 項目       | 値                                                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-CI-OPT-001                                                                                                                          |
| ステータス | **完了（実装 + Phase 12 仕様同期）**                                                                                                     |
| タイプ     | ci-optimization / performance                                                                                                            |
| 優先度     | 高                                                                                                                                       |
| 完了日     | 2026-04-14                                                                                                                               |
| 対象       | `.github/actions/pnpm-install-retry/action.yml` / `.github/workflows/ci.yml` / `apps/desktop/vitest.config.ts`                           |
| 成果物     | `docs/30-workflows/task-ci-optimization-001/outputs/phase-12/`                                                                           |
| PR         | Phase 13 blocked（ユーザー指示待ち）                                                                                                     |

#### 実施内容

- `.github/actions/pnpm-install-retry/action.yml` に `actions/cache@v4` による node_modules キャッシュを追加した
  - キャッシュキー: `${{ runner.os }}-node-modules-${{ hashFiles('pnpm-lock.yaml') }}`
  - キャッシュパス: `node_modules`, `apps/desktop/node_modules`, `apps/web/node_modules`, `packages/shared/node_modules`, `packages/ui/node_modules`
  - キャッシュヒット時は `pnpm install` をスキップする条件を追加した
- `.github/workflows/ci.yml` のテストシャード数を 16 → 17 に変更した
- `apps/desktop/vitest.config.ts` の `CI_MAX_FORKS` を 2 → 3 に変更した（7GB ランナーのバランスポイント）

#### 検証証跡

| コマンド                                         | 結果                                                   |
| ------------------------------------------------ | ------------------------------------------------------ |
| YAML syntax check (python3)                      | PASS（action.yml / ci.yml ともに構文エラーなし）       |
| Phase 11 non-visual smoke test                   | PASS（キャッシュヒット・miss 両経路確認）               |
| Phase 10 AC-1〜AC-6 最終照合                     | PASS（全受入基準クリア）                               |

#### 苦戦箇所

| 苦戦箇所                                                         | 解決策                                                                                          |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| シャード数の最適値判定（16 vs 17）                               | `ファイル数 ÷ シャード数 × 実行時間` の計算式でバランス点を算出し 17 を選択した                 |
| CI ランナー上での実測確認が PR push 前にできない                  | NON_VISUAL smoke test（yaml lint + config 値確認）で代替し、CI-FUTURE-005 として実測を後続タスク化した |
| pnpm 2段階キャッシュ（store + node_modules）の設計選択          | node_modules 直接キャッシュを選択し、store キャッシュとの差別化を設計書に記録した                |

#### lessons-learned

- CI 設定変更は「yaml lint → 値確認 → NON_VISUAL smoke」の 3ステップで検証可能
- シャード数の判定は実測前に数式で仮決めし、CI-FUTURE として実測確認を後続タスク化するパターンが有効
- node_modules キャッシュは pnpm-lock.yaml ハッシュをキーにすることで、lockfile 変更時の自動無効化が保証される
- 詳細: `docs/30-workflows/task-ci-optimization-001/outputs/phase-12/implementation-guide.md`
