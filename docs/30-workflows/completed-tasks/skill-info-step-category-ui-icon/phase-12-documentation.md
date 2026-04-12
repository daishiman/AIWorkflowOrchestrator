# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 12                                   |
| 名称       | ドキュメント更新                     |
| タスクID   | UT-SKILL-WIZARD-CATEGORY-UI-ICON-001 |
| 作成日     | 2026-04-11                           |
| ステータス | 未実施                               |

---

## 目的

- 実装ガイド（Part 1/2）を作成する
- システム仕様書を更新する（Step 1-A〜1-C / Step 2 判定）
- ドキュメント更新履歴を作成する
- 未タスク検出レポートを作成する（0件でも出力必須）
- スキルフィードバックレポートを作成する（改善点なしでも出力必須）

---

## 必須6タスク

### Task 12-1: 実装ガイド作成（2パート構成）

出力先: `outputs/phase-12/implementation-guide.md`

#### Part 1（中学生レベル・初学者向け）

**なぜ必要か（先に説明）:**

アプリのボタンにアイコン（絵文字）と説明文を追加する改善です。たとえば、食堂のメニューに「🍜 ラーメン」と書いてあると、文字だけの「ラーメン」より何の料理かすぐわかりますよね。同じ考え方で、スキルのカテゴリボタンに絵文字と説明文を足して、ユーザーが迷わず選べるようにします。

**何をするか:**

- `CATEGORY_OPTIONS` という「カテゴリの一覧表」に `icon`（絵文字）と `description`（説明文）を追加する
- ボタンの表示を「文字だけ」から「絵文字 ＋ 文字」に変える
- マウスを乗せると説明文がポップアップ（ツールチップ）で表示される

#### Part 2（技術者向け）

**変更ファイル:**

```
apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx
```

**インターフェース定義:**

```typescript
interface CategoryOption {
  value: SkillCategory; // "automation" | "external-integration" | ...
  label: string; // 表示ラベル（例: "自動化"）
  icon: string; // 絵文字アイコン（例: "⚡"）
  description: string; // ツールチップ説明文
}
```

**設定可能な値（CATEGORY_OPTIONS）:**

| value                | label          | icon | description                                |
| -------------------- | -------------- | ---- | ------------------------------------------ |
| automation           | 自動化         | ⚡   | 繰り返し作業の自動化・スケジュール実行     |
| external-integration | 外部連携       | 🔗   | 外部API・Webhookなど外部サービスと連携     |
| data-analysis        | データ分析     | 📊   | データの集計・分析・可視化                 |
| code-support         | コードサポート | 💻   | コードレビュー・生成・リファクタリング支援 |
| other                | その他         | 📦   | 上記カテゴリに当てはまらないスキル         |

**ボタン UI の API シグネチャ:**

```tsx
<button aria-pressed={isSelected} aria-label={label} title={description}>
  <span aria-hidden="true">{icon}</span>
  <span>{label}</span>
</button>
```

`aria-label` は表示ラベルと一致させ、説明は `title` に寄せることで accessible name を短く保つ。

**使用例:**

```tsx
const automation = {
  value: "automation" as SkillCategory,
  label: "自動化",
  icon: "⚡",
  description: "繰り返し作業の自動化・スケジュール実行などのスキル",
};

<button
  type="button"
  aria-label={automation.label}
  title={automation.description}
>
  <span aria-hidden="true">{automation.icon}</span>
  <span>{automation.label}</span>
</button>;
```

**エラーハンドリング:** なし（純粋レンダリング変更）

### Task 12-2: システム仕様書更新（4サブステップ）

#### Step 1-A: タスク完了記録

以下のファイルを更新する：

- [ ] `task-workflow.md` に今回 wave の完了サマリーを追加
- [ ] `task-workflow-completed.md` に `UT-SKILL-WIZARD-CATEGORY-UI-ICON-001` の完了記録を追加
- [ ] `task-workflow-backlog.md` に関連タスクを反映
- [ ] `.claude/skills/aiworkflow-requirements/LOGS.md` に完了エントリを追加
- [ ] `.claude/skills/task-specification-creator/LOGS.md` に完了エントリを追加
- [ ] `.claude/skills/aiworkflow-requirements/SKILL.md` の変更履歴を更新
- [ ] `.claude/skills/task-specification-creator/SKILL.md` の変更履歴を更新
- [ ] `topic-map.md` にセクション追加（新規セクションがある場合）

#### Step 1-B: 実装状況テーブル更新

`UT-SKILL-WIZARD-CATEGORY-UI-ICON-001` のステータスを更新：

- 実装完了の場合: `未実装` → `完了`
- 仕様書作成のみの場合: `spec_created`

#### Step 1-C: 関連タスクテーブル更新

`task-workflow-backlog.md` 内の `UT-SKILL-WIZARD-CATEGORY-UI-ICON-001` エントリを `completed` に更新。

#### Step 2: 新規インターフェース判定

| 確認項目                                  | 判定                        |
| ----------------------------------------- | --------------------------- |
| `CategoryOption` インターフェースは新規か | ✅ 新規（ファイルローカル） |
| `packages/shared/` への追加があるか       | ❌ なし                     |
| IPC チャンネル追加があるか                | ❌ なし                     |

**Step 2 判定: N/A（ファイルローカル定義のため、shared/public contract 変更なし。no-op の理由は `system-spec-update-summary.md` に記録する）**

### Task 12-3: ドキュメント更新履歴作成

出力先: `outputs/phase-12/documentation-changelog.md`

記録フォーマット：

```markdown
## UT-SKILL-WIZARD-CATEGORY-UI-ICON-001 完了同期

### workflow-local 同期

- task-workflow.md: 完了記録 / current facts 更新
- Step 1-A: task-workflow-completed.md 更新
- Step 1-B: 実装状況テーブル更新
- Step 1-C: 関連タスクテーブル更新
- task-workflow-backlog.md: backlog 更新
- Step 2: N/A（ファイルローカルインターフェースのみ）
- `index.md` / `artifacts.json` / `outputs/artifacts.json`: parity 確認
- validator 実行結果: quick_validate / validate_all / verify-all-specs / validate-phase-output / diff -qr
- current / baseline: 分離記録

### global skill sync

- aiworkflow-requirements/LOGS.md: 更新
- task-specification-creator/LOGS.md: 更新
- aiworkflow-requirements/SKILL.md: history 更新
- task-specification-creator/SKILL.md: history 更新
```

### Task 12-4: 未タスク検出レポート作成（0件でも出力必須）

出力先: `outputs/phase-12/unassigned-task-detection.md`

検出ソース：

| ソース                         | 確認内容                                                 |
| ------------------------------ | -------------------------------------------------------- |
| Phase 3 MINOR 指摘             | TECH-M-01（`title` 属性 → カスタムツールチップ化）       |
| Phase 10 MINOR 指摘            | （実施後に記録）                                         |
| Phase 11 手動テスト発見事項    | discovered-issues.md を参照                              |
| コードコメント（TODO/FIXME等） | 実施後に `grep` 確認                                     |
| 並列PR注意事項                 | `UT-SKILL-WIZARD-VALIDATION-MIN-LENGTH-001` との分離確認 |

未タスク候補（現時点で確認済み）：

- `UT-CATEGORY-CUSTOM-TOOLTIP-001`（仮）: `title` 属性をカスタムツールチップに置き換える（TECH-M-01 由来・LOW priority）

### Task 12-5: スキルフィードバックレポート作成（改善点なしでも出力必須）

出力先: `outputs/phase-12/skill-feedback-report.md`

| 観点             | 記録内容         |
| ---------------- | ---------------- |
| テンプレート改善 | （実施後に記録） |
| ワークフロー改善 | （実施後に記録） |
| ドキュメント改善 | （実施後に記録） |

### Task 12-6: phase12-task-spec-compliance-check（[Feedback W1-02b-3] / P4対策・最終確認）

出力先: `outputs/phase-12/phase12-task-spec-compliance-check.md`

```bash
# planned wording の残置確認
rg -n "計画|予定|更新予定|作成待|完了または計画済み|TODO|will be|を予定|仕様策定のみ|保留として記録" \
  outputs/phase-12/*.md

# implementation-guide.md 内の識別子を現行コードで grep 確認
grep -n "CategoryOption\|CATEGORY_OPTIONS\|handleCategoryClick" \
  apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx

# スニペットが型定義と一致しているか確認
grep -n "icon\|description" \
  apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx
```

確認項目:

- Task 12-1〜12-6 の完了
- `implementation-guide.md` / `manual-test-result.md` / `manual-test-report.md` / `manual-test-checklist.md` / `ui-sanity-visual-review.md` / `screenshot-plan.json` / `phase11-capture-metadata.json` の存在
- `task-workflow.md` / `task-workflow-completed.md` / `task-workflow-backlog.md` / `LOGS.md` x2 / `SKILL.md` x2 / `topic-map.md` / `artifacts.json` / `outputs/artifacts.json` の parity
- `phase-12-documentation.md` と `outputs/phase-12/*.md` に planned wording が残っていないこと
- `aria-label` / `CategoryOption` / `handleCategoryClick` の識別子が current facts と一致すること

---

## Phase 12 成果物一覧

| Task      | 成果物ファイル                                           | 必須 |
| --------- | -------------------------------------------------------- | ---- |
| Task 12-1 | `outputs/phase-12/implementation-guide.md`               | ✅   |
| Task 12-2 | `outputs/phase-12/system-spec-update-summary.md`         | ✅   |
| Task 12-3 | `outputs/phase-12/documentation-changelog.md`            | ✅   |
| Task 12-4 | `outputs/phase-12/unassigned-task-detection.md`          | ✅   |
| Task 12-5 | `outputs/phase-12/skill-feedback-report.md`              | ✅   |
| Task 12-6 | `outputs/phase-12/phase12-task-spec-compliance-check.md` | ✅   |

---

## 参照資料

- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `phase-11-manual-test.md` - 手動テスト結果・discovered-issues.md

---

## 統合テスト連携

Phase 12 での同期：

- `task-workflow-completed.md` と `task-workflow-backlog.md` の ledger parity 確認
- `artifacts.json` と `outputs/artifacts.json` の同期確認
- `verify-unassigned-links.js` 実行で `ALL_LINKS_EXIST` 確認

---

## 完了条件

- [ ] Task 12-1: `implementation-guide.md`（Part 1/2）作成
- [ ] Task 12-2: Step 1-A/1-B/1-C 完了・Step 2 N/A 確認
- [ ] Task 12-3: `documentation-changelog.md` 作成
- [ ] Task 12-4: `unassigned-task-detection.md` 作成（0件でも出力）
- [ ] Task 12-5: `skill-feedback-report.md` 作成（改善点なしでも出力）
- [ ] Task 12-6: `phase12-task-spec-compliance-check.md` 作成
- [ ] LOGS.md 2ファイル更新（aiworkflow-requirements + task-specification-creator）
- [ ] SKILL.md 2ファイルの変更履歴更新

---

## タスク100%実行確認【必須】

- [ ] Task 12-1 完了: 実装ガイド（Part 1/2）
- [ ] Task 12-2 完了: システム仕様書更新（Step 1-A〜1-C + Step 2判定）
- [ ] Task 12-3 完了: ドキュメント更新履歴
- [ ] Task 12-4 完了: 未タスク検出レポート
- [ ] Task 12-5 完了: スキルフィードバックレポート
- [ ] Task 12-6 完了: phase12-task-spec-compliance-check

---

## 次Phase

Phase 12 完了後 → **Phase 13: PR作成**（**ユーザーの明示承認後のみ実施**）
