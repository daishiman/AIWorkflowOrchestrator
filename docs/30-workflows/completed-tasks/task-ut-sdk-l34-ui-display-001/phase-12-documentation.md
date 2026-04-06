# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 12                             |
| 機能名 | task-ut-sdk-l34-ui-display-001 |
| 作成日 | 2026-04-03                     |

## 目的

実装した内容をシステム仕様書に反映し、技術的理解を促進するドキュメントを作成し、
未完了タスクを検出・記録する。

## 事前チェック【必須】

Phase 12実行前に確認:

- [ ] `outputs/artifacts.json`と各`phase-*.md`記載のartifact名を1対1で照合する
- [ ] Phase 1で記録したタスク分類（UIタスク）を確認し、Phase 11 close-outが完了していること
- [ ] `.claude/rules/06-known-pitfalls.md`のPhase 12関連項目（P1/P2/P3/P4/P25/P27/P29）を確認する

## 実行タスク

| Task      | 内容                                   | 主成果物                                                 |
| --------- | -------------------------------------- | -------------------------------------------------------- |
| Task 12-1 | 技術ドキュメント作成（実装ガイド作成） | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | システムドキュメント更新               | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | ドキュメント更新履歴作成               | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | 未タスク検出（残課題の検出と記録）     | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | スキルフィードバックレポート作成       | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | 準拠チェック（root evidence）          | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 12-1: 技術ドキュメント作成（実装ガイド作成）
- Task 12-2: システムドキュメント更新（aiworkflow-requirements等の更新）
- Task 12-3: ドキュメント更新履歴作成（変更履歴の記録）
- Task 12-4: 未タスク検出（残課題の検出と記録）
- Task 12-5: スキルフィードバックレポート作成（ワークフロー改善点と技術的教訓の記録）
- Task 12-6: 準拠チェック（root evidence: Task 12-1〜12-5 の完了証跡と検証結果の集約）

## 参照資料

| 資料名                     | パス                                                                                    | 説明                                       |
| -------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------ |
| Phase 11/12 実行ガイダンス | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`             | Phase 11/12 の実行・証跡・検証の共通ガイド |
| Phase 12 テンプレ          | `.claude/skills/task-specification-creator/references/phase-template-phase12.md`        | Phase 12 の必須タスク（6つ）と成果物命名   |
| Phase 2成果物              | `outputs/phase-2/design.md`                                                             | 設計前提                                   |
| Phase 5成果物              | `outputs/phase-5/implementation-summary.md`                                             | 実装差分                                   |
| Phase 6成果物              | `outputs/phase-6/test-expansion-report.md`                                              | テスト拡充結果                             |
| Phase 7成果物              | `outputs/phase-7/coverage-report.md`                                                    | カバレッジ結果                             |
| Phase 8成果物              | `outputs/phase-8/refactoring-report.md`                                                 | リファクタリング結果                       |
| Phase 9成果物              | `outputs/phase-9/quality-report.md`                                                     | 品質ゲート結果                             |
| Phase 10成果物             | `outputs/phase-10/final-review-result.md`                                               | 最終レビュー結果                           |
| spec update workflow       | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Task 12-2 の Step 1 / Step 2 の実施順序    |
| validation matrix          | `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md` | Phase 12 完了判定コマンドと PASS 基準      |
| aiworkflow spec guidelines | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`                  | 仕様更新の方針（正本・整合性・追跡可能性） |

## SubAgent分担

| SubAgent | 担当                  | 並列性 | 主な成果物                                                |
| -------- | --------------------- | ------ | --------------------------------------------------------- |
| A        | Task 12-1             | 可     | `implementation-guide.md`                                 |
| B        | Task 12-2             | 可     | `system-spec-update-summary.md`                           |
| C        | Task 12-3 / 12-5      | 可     | `documentation-changelog.md` / `skill-feedback-report.md` |
| D        | Task 12-4             | 可     | `unassigned-task-detection.md`                            |
| E        | Task 12-6（最終検証） | 直列   | `phase12-task-spec-compliance-check.md` / validator 結果  |

## Task 12-1: 実装ガイド作成【必須】

### Part 1: 概念的説明（中学生レベル）

たとえば、スキル検証の結果を「授業の成績表」で考えてみましょう。
今まで全教科の点数がバラバラに並んでいましたが、これからは「数学」「国語」「理科」「社会」の教科ごとにまとめて表示されます。
各教科の横には「何点以下が何人いるか」の小さなバッジが付き、クリックすると折りたたむこともできます。

- **なぜ必要か**: Layer3/4という新しいチェック項目が追加されたのに、UIがバラバラ表示のままでは問題の場所がわからない
- **何をするか**: `SkillLifecyclePanel`のchecks表示を、Layerという「教科別グループ」で整理する

### Part 2: 技術的詳細

```typescript
// 型定義（packages/shared/src/types/skillCreator.ts より）
type RuntimeSkillCreatorVerifyCheckSeverity = "info" | "warning" | "error";

interface RuntimeSkillCreatorVerifyCheck {
  id: string; // "L3-001" 等
  layer: "layer1" | "layer2" | "layer3" | "layer4";
  severity: RuntimeSkillCreatorVerifyCheckSeverity;
  summary: string;
  passed: boolean;
}
```

**主要定数**:

```typescript
const LAYER_ORDER = ["layer1", "layer2", "layer3", "layer4"] as const;

const layerLabels: Record<RuntimeSkillCreatorVerifyCheck["layer"], string> = {
  layer1: "Layer 1 — 必須ファイル構造",
  layer2: "Layer 2 — SKILL.md セクション",
  layer3: "Layer 3 — スキーマ・コンテンツ品質",
  layer4: "Layer 4 — References整合性",
};

const verifyCheckSeverityIcon: Record<
  RuntimeSkillCreatorVerifyCheckSeverity,
  string
> = {
  info: "✓",
  warning: "⚠",
  error: "✗",
};
```

**Hooksパターン**:

```typescript
// グルーピング（派生状態 = useMemo）
const checksByLayer = useMemo(() => {
  const groups: Record<
    RuntimeSkillCreatorVerifyCheck["layer"],
    RuntimeSkillCreatorVerifyCheck[]
  > = {
    layer1: [],
    layer2: [],
    layer3: [],
    layer4: [],
  };
  for (const check of verifyDetail?.checks ?? []) {
    groups[check.layer]?.push(check);
  }
  return groups;
}, [verifyDetail?.checks]); // 依存配列: checks配列のみ

// 開閉状態（ローカルstate: reverify後も保持）
const [expandedLayers, setExpandedLayers] = useState<
  Record<RuntimeSkillCreatorVerifyCheck["layer"], boolean>
>({
  layer1: true,
  layer2: true,
  layer3: true,
  layer4: true,
});
```

**注意点**:

- `expandedLayers`は`verifyDetail`変更で**リセットしない**設計（reverify後の状態保持）
- 空Layerは`LAYER_ORDER.filter(layer => checksByLayer[layer].length > 0)`で非表示
- 集計バッジのCSSは既存`verifyCheckSeverityStyles`のCSS変数を再利用

## Task 12-2: システムドキュメント更新【必須】

> 重要: `task-specification-creator` / `aiworkflow-requirements` の正本更新は Phase 12 完了前に必ず実施する。\
> 「仕様策定のみ」「実行予定」「保留として記録」のような先送り表現のまま Phase 12 を完了扱いにしない。

### Step 1-A: タスク完了記録

- [ ] `aiworkflow-requirements`の関連仕様書に「完了タスク」セクションを追加
- [ ] aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加
- [ ] task-specification-creator/LOGS.mdにタスク完了記録を追加（**2ファイル両方必須** — P1, P25）
- [ ] aiworkflow-requirements/SKILL.md変更履歴テーブルを更新（P29）
- [ ] task-specification-creator/SKILL.md変更履歴テーブルを更新（P29）

### Step 1-B: 実装状況テーブル更新

```bash
# 関連仕様書の検索
grep -rn "UT-SDK-L34-UI-DISPLAY-001" .claude/skills/aiworkflow-requirements/references/
grep -rn "UT-SDK-L34-UI-DISPLAY-001" docs/30-workflows/
```

- `ui-ux-feature-components.md`のverify detail表示パターンを更新（完了）
- `interfaces-agent-sdk-skill.md`のverifyDetail IPC型定義（変更なし）

### Step 1-C: 関連タスクテーブル更新

- `task-workflow.md`の未タスク一覧から`UT-SDK-L34-UI-DISPLAY-001`を完了に更新
- `task-workflow-backlog.md`の残課題一覧と表記を同期する
- `docs/30-workflows/completed-tasks/task-skill-creator-layer34-ui-display.md`のステータス更新

### Step 1-D: topic-map.md 再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

### Step 1-E: artifact parity と root evidence 準備

- `artifacts.json` と `outputs/artifacts.json` の内容一致を確認する
- `phase12-task-spec-compliance-check.md` を root evidence として作成する
- `phase-12-documentation.md` の判断根拠を 1 ファイルへ集約する

### Step 1-F: 未タスクリンク検証

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js \
  --source .claude/skills/aiworkflow-requirements/references/task-workflow.md
```

### Step 1-G: 最終検証

```bash
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/task-specification-creator
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001 --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001 --phase 12
diff -qr docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001/artifacts.json docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001/outputs/artifacts.json

# 先送り表現が残っていないことを確認（Phase 12 完了条件の一部）
rg -n "仕様策定のみ|実行予定|保留として記録" docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001/outputs/phase-12/ || true
```

### Step 2: システム仕様更新判断

**判断**: 契約（IPC型・共有型・外部インターフェース）の更新は不要。Renderer のローカルな UI 実装のみ。
ただし Step 1-A〜1-G（台帳・LOGS・topic-map・検証コマンド固定）は Phase 12 の必須作業として実施する。

→ **Step 2（システム仕様更新）: 不要**（`documentation-changelog.md`に理由を明記）

更新不要の根拠：

- `RuntimeSkillCreatorVerifyCheck`型は変更なし
- IPC型定義（verifyDetail）は変更なし
- 新規エクスポートAPIなし（ローカル定数・Hooks）

## Task 12-3: ドキュメント更新履歴作成

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001
```

## Task 12-4: 未タスク検出【必須・0件でも出力】

```bash
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx \
  --output .tmp/unassigned-candidates.json

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js \
  --source .claude/skills/aiworkflow-requirements/references/task-workflow.md
```

**スコープ外として既知の将来タスク候補**（Phase 3レビューで記録済み）:

| タスク候補                                    | 理由                          |
| --------------------------------------------- | ----------------------------- |
| check IDの日本語ラベルマッピング（i18n対応）  | Phase 1スコープ外・将来検討   |
| severityフィルタ機能（warning以上のみ表示等） | Phase 1スコープ外・将来検討   |
| VerifyLayerGroup.tsxへの分離                  | 100行超の場合のみ・実装後判断 |

## Task 12-5: スキルフィードバックレポート作成【必須】

| セクション         | 記載内容                                                    |
| ------------------ | ----------------------------------------------------------- |
| ワークフロー改善点 | Layer別グルーピングUIのテンプレートパターン化の可否検討     |
| 技術的教訓         | useMemoの依存配列の重要性（reverify時の再計算タイミング）   |
| スキル改善提案     | UIタスクのアコーディオン実装パターンをpatterns.mdに追記候補 |
| 新規Pitfall候補    | verifyDetail更新時のlocal state保持設計の注意点             |

## Task 12-6: 準拠チェック（root evidence）【必須】

`outputs/phase-12/phase12-task-spec-compliance-check.md` に、以下を 1 ファイルで集約する。

- Task 12-1〜12-5 の完了確認（各成果物の存在と要点）
- `artifacts.json` と `outputs/artifacts.json` の一致確認（差分がないこと）
- validator 実行結果（`verify-all-specs.js` / `validate-phase-output.js`）の結果要約
- 未タスク検出の結果（0 件でも「確認済み 0 件」と明記）
- スキルフィードバック（改善点なしの場合もその旨を明記）

## 統合テスト連携【必須】

```bash
# スキル検証（3スキル全Error 0件確認）
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

## 成果物

| 成果物                        | パス                                                     | 必須 | 説明                                       |
| ----------------------------- | -------------------------------------------------------- | ---- | ------------------------------------------ |
| 実装ガイド                    | `outputs/phase-12/implementation-guide.md`               | ✅   | Part 1（概念）+ Part 2（技術）             |
| システム仕様更新サマリー      | `outputs/phase-12/system-spec-update-summary.md`         | ✅   | Step 1-A〜1-D + Step 2判断                 |
| ドキュメント更新履歴          | `outputs/phase-12/documentation-changelog.md`            | ✅   | 更新履歴                                   |
| 未タスク検出レポート          | `outputs/phase-12/unassigned-task-detection.md`          | ✅   | 0件でも出力必須                            |
| スキルフィードバックレポート  | `outputs/phase-12/skill-feedback-report.md`              | ✅   | 改善点なしでも出力必須                     |
| 準拠チェック（root evidence） | `outputs/phase-12/phase12-task-spec-compliance-check.md` | ✅   | Task 12-1〜12-6 の完了証跡と検証結果の集約 |

## 完了条件

- [ ] 実行タスクを「表」と「`- Task 12-X:` 箇条書き」の両方で記載している
- [ ] 実装ガイドPart 1（`たとえば`を含む中学生レベル）が作成されている
- [ ] 実装ガイドPart 2（型定義・Hooksパターン・注意点）が作成されている
- [ ] 【Task 2 Step 1-A】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した
- [ ] 【Task 2 Step 1-A】task-specification-creator/LOGS.mdにタスク完了記録を追加した（P1/P25）
- [ ] 【Task 2 Step 1-A】aiworkflow-requirements/SKILL.md変更履歴テーブルを更新した（P29）
- [ ] 【Task 2 Step 1-A】task-specification-creator/SKILL.md変更履歴テーブルを更新した（P29）
- [ ] 【Task 2 Step 1-C】`task-workflow.md`の未タスクステータスを更新した
- [ ] 【Task 2 Step 1-D】topic-map.mdを再生成した（P2/P27）
- [ ] 【Task 2 Step 1-E】`artifacts.json` と `outputs/artifacts.json` の parity を確認した
- [ ] 【Task 2 Step 1-F】`verify-unassigned-links.js` を実行し、リンク整合を確認した
- [ ] 【Task 2 Step 1-G】`quick_validate.js` / `validate_all.js` / `verify-all-specs.js` / `validate-phase-output.js` / `diff -qr` を実行した
- [ ] 【Task 2 Step 1-G】先送り表現（「仕様策定のみ」「実行予定」「保留として記録」）が Phase 12 成果物から除去されている
- [ ] 【Task 2 Step 2】システム仕様更新不要と判断し`documentation-changelog.md`に理由を明記した
- [ ] 未タスク検出レポートが出力されている（0件でも必須）
- [ ] スキルフィードバックレポートが出力されている（改善点なしでも必須）
- [ ] artifacts.jsonが更新されている
- [ ] 【Task 12-6】`phase12-task-spec-compliance-check.md` が root evidence として作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001 --phase 12
```

## 次のPhase

Phase 13: PR作成
