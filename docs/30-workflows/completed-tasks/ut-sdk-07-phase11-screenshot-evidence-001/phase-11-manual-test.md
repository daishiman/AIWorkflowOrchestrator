# Phase 11: 手動テスト - UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 11                                        |
| Phase名    | 手動テスト（VISUAL）                      |
| 前提Phase  | Phase 10（最終レビューゲート）            |
| 後続Phase  | Phase 12                                  |
| ステータス | complete                                  |
| 作成日     | 2026-04-06                                |
| 機能名     | ut-sdk-07-phase11-screenshot-evidence-001 |
| VISUAL分類 | **VISUAL**（screenshot が必須成果物）     |

---

## 目的

TASK-SDK-07 で実装した governance bundle UI を手動操作で動作確認し、Phase 11 evidence chain を完成させる 3 枚の screenshot と補助証跡一式を取得する。

---

## 実行タスク

### タスク1: 事前準備

**実行手順**:

1. screenshots ディレクトリが存在しない場合は作成する

```bash
mkdir -p docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots
```

2. `screenshot-plan.json` の capture ID を確認する

```bash
cat docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshot-plan.json 2>/dev/null \
  || echo "screenshot-plan.json が存在しない場合は本タスクの capture ID 定義を使用"
```

capture ID（本タスク定義）:

| capture ID                      | 対象状態                                     |
| ------------------------------- | -------------------------------------------- |
| SCREENSHOT-TASK07-HANDOFF-01    | terminal_handoff 状態の HandoffGuidance 表示 |
| SCREENSHOT-TASK07-DISCLOSURE-01 | disclosure summary セクションの表示          |
| SCREENSHOT-TASK07-INTEGRATED-01 | integrated_api 成功後の状態（対照用）        |

## テストケース

| TC-ID    | シナリオ                                           | capture ID                      | 期待成果物                              |
| -------- | -------------------------------------------------- | ------------------------------- | --------------------------------------- |
| TC-11-01 | terminal_handoff 状態で HandoffGuidance を確認する | SCREENSHOT-TASK07-HANDOFF-01    | `terminal_handoff-handoff-guidance.png` |
| TC-11-02 | disclosure summary を表示して DOM 存在を確認する   | SCREENSHOT-TASK07-DISCLOSURE-01 | `disclosure-summary-display.png`        |
| TC-11-03 | integrated_api 成功後の対照表示を確認する          | SCREENSHOT-TASK07-INTEGRATED-01 | `integrated-api-success-comparison.png` |

---

### タスク2: シナリオA — terminal_handoff HandoffGuidance 表示

**目的**: `terminal_handoff` 状態で `HandoffGuidance` が表示されることを確認しスクリーンショットを取得する。

**実行手順**:

1. API key を未設定（または degraded）状態にする
2. デスクトップアプリを開発モードで起動する

```bash
pnpm --filter @repo/desktop dev
```

3. Skill Creator を開く
4. 任意のスキルを選択し Plan を実行する
5. `terminal_handoff` への遷移（HandoffGuidance の表示）を確認する
6. screenshot を取得し保存する

**保存先**: `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots/terminal_handoff-handoff-guidance.png`

**確認ポイント**:

- `HandoffGuidance` コンポーネントが画面に表示されている
- `terminal_handoff` 状態であることが UI 上で分かる

---

### タスク3: シナリオB — disclosure summary 表示

**目的**: disclosure summary セクションの表示と `data-testid` 属性の存在を確認しスクリーンショットを取得する。

**実行手順**:

1. シナリオA の terminal_handoff 状態から継続する（または再現する）
2. disclosure summary セクションを表示させる（折りたたみがある場合は展開する）
3. `data-testid="skill-lifecycle-disclosure-summary"` が DOM に存在することを確認する

```bash
# DevTools Console で確認（任意）
document.querySelector('[data-testid="skill-lifecycle-disclosure-summary"]')
```

4. disclosure summary の内容が表示された状態で screenshot を取得する

**保存先**: `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots/disclosure-summary-display.png`

**確認ポイント**:

- disclosure summary セクションが展開・表示されている
- `data-testid="skill-lifecycle-disclosure-summary"` に対応する要素が確認できる

---

### タスク4: シナリオC — integrated_api 成功後（対照用）

**目的**: `integrated_api` パスでの正常実行状態を対照用として記録する。

**実行手順**:

1. 有効な API key を設定する
2. アプリを再起動する

```bash
pnpm --filter @repo/desktop dev
```

3. Skill Creator を開く
4. 任意のスキルを選択し Plan を実行する
5. `integrated_api` パスで成功状態になることを確認する
6. screenshot を取得し保存する

**保存先**: `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots/integrated-api-success-comparison.png`

**確認ポイント**:

- `integrated_api` 経由での実行成功状態が表示されている
- HandoffGuidance が表示されていない（`terminal_handoff` との対照が明確）

---

### タスク5: manual-test-result.md への evidence 追記

**目的**: UI task の証跡を `manual-test-result.md` に統合して残す。

**作成内容**:

- `manual-test-result.md` に取得結果 / テストケース / 画面カバレッジマトリクス / 視覚レビュー / 発見事項 / capture metadata を統合して追記する

**確認観点**:

- `manual-test-result.md` に TC-11-01〜TC-11-03 が記録されている
- `manual-test-result.md` に 3 件の screenshot / visual review / coverage が要約されている
- `manual-test-result.md` に 0 件の発見事項でも明記されている
- `manual-test-result.md` に Apple UI/UX 観点の所見が記録されている
- `manual-test-result.md` に TC-ID と PNG の対応が記録されている
- `manual-test-result.md` に capture method / generated-at / source evidence が記録されている

---

### タスク6: manual-test-result.md への evidence 追記

**目的**: TASK-SDK-07 の Phase 11 evidence に本タスクの取得結果を追記する。

**実行手順**:

1. 既存の manual-test-result.md を確認する

```bash
cat docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/manual-test-result.md
```

2. 以下のセクションを追記する

```markdown
---

## UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001 evidence 追記（2026-04-06）

### 取得 screenshot

| capture ID                      | ファイル名                            | 取得日     | 状態   |
| ------------------------------- | ------------------------------------- | ---------- | ------ |
| SCREENSHOT-TASK07-HANDOFF-01    | terminal_handoff-handoff-guidance.png | 2026-04-06 | 取得済 |
| SCREENSHOT-TASK07-DISCLOSURE-01 | disclosure-summary-display.png        | 2026-04-06 | 取得済 |
| SCREENSHOT-TASK07-INTEGRATED-01 | integrated-api-success-comparison.png | 2026-04-06 | 取得済 |

### テストケース

| TC-ID    | シナリオ                                   | 判定 | 備考                              |
| -------- | ------------------------------------------ | ---- | --------------------------------- |
| TC-11-01 | terminal_handoff で HandoffGuidance を取得 | PASS | `SCREENSHOT-TASK07-HANDOFF-01`    |
| TC-11-02 | disclosure summary の表示と DOM 存在を確認 | PASS | `SCREENSHOT-TASK07-DISCLOSURE-01` |
| TC-11-03 | integrated_api 成功後の対照表示を取得      | PASS | `SCREENSHOT-TASK07-INTEGRATED-01` |

### 画面カバレッジマトリクス

| 画面状態           | 必須要素                                           | 証跡                                    |
| ------------------ | -------------------------------------------------- | --------------------------------------- |
| terminal_handoff   | `HandoffGuidance`                                  | `terminal_handoff-handoff-guidance.png` |
| disclosure summary | `data-testid="skill-lifecycle-disclosure-summary"` | `disclosure-summary-display.png`        |
| integrated_api     | success path / 対照表示                            | `integrated-api-success-comparison.png` |

### 視覚レビュー

- `HandoffGuidance` が画面の中心的な案内として読めること
- disclosure summary が HandoffGuidance と重ならず、補助情報として認識できること
- integrated_api の対照表示が terminal_handoff と混同されないこと

### 発見事項

- なし。今回の screenshot 再取得で追加の UI 問題は確認されなかった。

### capture metadata

- capture method: manual re-capture
- generated-at: 2026-04-06
- source evidence: `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots/*.png`

### 確認済み AC

- [x] AC-1: terminal_handoff HandoffGuidance screenshot 取得
- [x] AC-2: disclosure summary screenshot 取得
- [x] AC-3: integrated_api 成功後 screenshot 取得（対照）
- [x] AC-4: screenshots/ ディレクトリへの配置完了
- [x] AC-5: screenshot-plan.json capture ID と対応確認
- [x] AC-6: manual-test-result.md に evidence 追記完了
```

---

## 画面カバレッジマトリクス

| 画面状態           | 必須要素                                           | capture ID | 証跡                                    |
| ------------------ | -------------------------------------------------- | ---------- | --------------------------------------- |
| terminal_handoff   | `HandoffGuidance`                                  | TC-11-01   | `terminal_handoff-handoff-guidance.png` |
| disclosure summary | `data-testid="skill-lifecycle-disclosure-summary"` | TC-11-02   | `disclosure-summary-display.png`        |
| integrated_api     | success path / 対照表示                            | TC-11-03   | `integrated-api-success-comparison.png` |

---

## 参照資料

| 参照資料                | パス                                                                                                                        | 内容                          |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Phase 2 設計書          | `phase-2-design.md`                                                                                                         | 操作シナリオ・capture ID      |
| TASK-SDK-07 実装ガイド  | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-12/implementation-guide.md` | UI 構造・HandoffGuidance 仕様 |
| SkillLifecyclePanel.tsx | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                                        | 対象コンポーネント実装        |

---

## 統合テスト連携

- Phase 12 で `manual-test-result.md` と `phase11-capture-metadata.json` を current facts として集約する
- `artifacts.json` / `outputs/artifacts.json` に Phase 11 artifacts を同期する

## 成果物

| 成果物                                | 配置先                                                                                                           | 内容                           |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| terminal_handoff-handoff-guidance.png | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots/` | AC-1 対応 screenshot           |
| disclosure-summary-display.png        | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots/` | AC-2 対応 screenshot           |
| integrated-api-success-comparison.png | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots/` | AC-3 対応 screenshot（対照用） |
| phase11-capture-metadata.json         | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots/` | capture metadata               |
| manual-test-result.md（追記）         | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/`             | evidence 記録                  |
| screenshot-plan.json                  | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/`             | 撮影計画                       |

---

## 完了条件

- [ ] terminal_handoff-handoff-guidance.png が保存されている（AC-1）
- [ ] disclosure-summary-display.png が保存されている（AC-2）
- [ ] integrated-api-success-comparison.png が保存されている（AC-3）
- [ ] 3 ファイルが `screenshots/` ディレクトリに配置されている（AC-4）
- [ ] screenshot-plan.json の capture ID と対応が確認されている（AC-5）
- [ ] `phase11-capture-metadata.json` が保存され、manual-test-result.md に evidence / テストケース / 画面カバレッジマトリクス / 視覚レビュー / 発見事項 / capture metadata が追記されている（AC-6）

## タスク100%実行確認【必須】

全 AC（AC-1〜AC-6）が充足されていることを確認し、Phase 11 が完了したことを記録すること。

## 統合テスト連携

- 取得した screenshot と `manual-test-result.md` の記録を Phase 12 の同期対象として引き渡す
- `phase11-capture-metadata.json` を Phase 12 の documentation / compliance check から参照可能な状態にする

## 次Phase

Phase 12: ドキュメント更新
