# Phase 12: ドキュメント

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 12                         |
| 機能名 | safety-gate-implementation |
| 作成日 | 2026-03-16                 |

## 目的

UT-06-003 の実装成果物に対して、実装ガイド・システム仕様書更新・未タスク検出の5タスクを完了し、後続タスク（TASK-SKILL-LIFECYCLE-08）の実装者が正確に本実装を利用できる状態にする。

**重要:** Phase 12 は漏れが最も発生しやすい Phase である。Task 1〜5 を必ず全完了させること。一部のみ完了した状態で「完了」と記録しないこと（P4 準拠）。

## Phase 10 MINOR 追跡テーブル

Phase 10 で MINOR 判定された指摘がある場合、Phase 12 で追跡結果を記録する。

| MINOR ID | 指摘内容 | 解決予定Phase | 解決確認Phase | 解決方法 | ステータス |
| -------- | -------- | ------------- | ------------- | -------- | ---------- |
| -        | -        | -             | -             | -        | -          |

> Phase 10 最終レビューレポート（`outputs/phase-10/final-review-report.md`）を確認し、MINOR 判定事項があれば全て未タスク仕様書に変換すること（省略不可）。

## 実行タスク

### Task 1: 実装ガイド作成

成果物パス: `outputs/phase-12/implementation-guide.md`

#### Part 1: 中学生レベルの概念説明（日常例えによる説明）

以下の内容を実装ガイドの Part 1 として記載する。

**比喩:** 映画館の「年齢制限チェック係」の発展版として説明する。

> 映画館に入る前に、チェック係が「この映画は18歳未満お断り（UNSAFE）」「この映画は保護者と一緒なら大丈夫（SAFE_WITH_WARNINGS）」「誰でも見てOK（SAFE）」と3段階で判定する。チェック係は複数の観点（暴力描写・性的表現・言語など5種類）を全部チェックして、最もキビしい結果を採用する。本タスクで作った `DefaultSafetyGate` はまさにこのチェック係の役割を担う。

説明に含める項目:

1. SafetyGate の役割（何をチェックするのか）
2. 3段階のグレード（SAFE / SAFE_WITH_WARNINGS / UNSAFE）が日常のどの状況に対応するか
3. 5種類のチェック（`SafetyCheckId`）が何を検査するか
4. Grade 集約ルール（なぜ最もキビしい結果を採用するのか）
5. DI（依存性注入）の意味（なぜ具体的なサービスに直接依存しないのか）

#### Part 2: 開発者向け技術詳細

以下の内容を実装ガイドの Part 2 として記載する:

**2-1. 型定義と API シグネチャ**

```typescript
// SafetyGatePort インターフェース（変更禁止）
interface SafetyGatePort {
  evaluate(skillName: string): Promise<SafetyGateResult>;
}

// SafetyGateResult 構造
interface SafetyGateResult {
  skillName: string;
  overallGrade: SafetyGrade; // "SAFE" | "SAFE_WITH_WARNINGS" | "UNSAFE"
  details: SafetyCheckDetail[]; // 常に5要素
  evaluatedAt: number; // Unix timestamp (ms)
}

// SafetyCheckDetail 構造
interface SafetyCheckDetail {
  checkId: SafetyCheckId;
  toolName: string;
  riskLevel: ToolRiskLevel;
  status: "blocked" | "warned" | "passed";
  message: string;
}
```

**2-2. DefaultSafetyGate の使用例**

```typescript
// Constructor Injection による利用
const safetyGate = new DefaultSafetyGate(
  permissionStore, // PermissionStoreInterface
  skillMetadataProvider, // SkillMetadataProvider
  ["/etc", "/usr/bin"], // 保護パス一覧
);

const result = await safetyGate.evaluate("my-skill");
// result.overallGrade: "SAFE" | "SAFE_WITH_WARNINGS" | "UNSAFE"
// result.details.length: 5 (常に固定)
```

**2-3. IPC 経由での利用方法**

```typescript
// Renderer から Preload API 経由で呼び出し
const result = await window.electronAPI.skill.evaluateSafety("my-skill");
```

**2-4. 5種の SafetyCheckId と評価結果対応表**

| SafetyCheckId          | blocked 条件                   | warned 条件                              | passed 条件                 |
| ---------------------- | ------------------------------ | ---------------------------------------- | --------------------------- |
| CRITICAL_TOOL_REQUIRED | critical ツールが存在          | -                                        | critical ツールなし         |
| HIGH_TOOL_REQUIRED     | -                              | high ツールが存在                        | high ツールなし             |
| NO_PERMANENT_APPROVAL  | -                              | 恒久許可なしのツールが全てに対して未許可 | 恒久許可付きツールが1件以上 |
| ALL_LOW_TOOLS          | -                              | -                                        | 全ツールが low リスク       |
| PROTECTED_PATH_ACCESS  | 保護パスへ書き込みツールが存在 | -                                        | 保護パスへのアクセスなし    |

**2-5. Grade 集約ルール**

```typescript
// 優先度: UNSAFE > SAFE_WITH_WARNINGS > SAFE
function calculateOverallGrade(details: SafetyCheckDetail[]): SafetyGrade {
  if (details.some((d) => d.status === "blocked")) return "UNSAFE";
  if (details.some((d) => d.status === "warned")) return "SAFE_WITH_WARNINGS";
  return "SAFE";
}
```

**2-6. エラーハンドリング**

| エラーケース             | IPC エラーコード | 挙動                             |
| ------------------------ | ---------------- | -------------------------------- |
| skillName が空文字列     | VALIDATION_ERROR | IPC 層で即座に reject            |
| skillName がスペースのみ | VALIDATION_ERROR | IPC 層で即座に reject（P42準拠） |
| skillName が undefined   | VALIDATION_ERROR | IPC 層で即座に reject            |
| スキルが存在しない       | SKILL_NOT_FOUND  | evaluate() が reject             |

**2-7. テスト時のモック差し替え方法**

```typescript
// SafetyGatePort のモックを作成してテストで利用
const mockSafetyGate: SafetyGatePort = {
  evaluate: vi.fn().mockResolvedValue({
    skillName: "test-skill",
    overallGrade: "SAFE",
    details: [...], // 5要素
    evaluatedAt: Date.now(),
  }),
};
```

成果物パス: `outputs/phase-12/implementation-guide.md`

---

### Task 2: システム仕様書更新

**重要:** Step 1-A〜Step 2 を全て完了させた後に Task 3 で完了を記録すること。途中で「完了」と記載しないこと（P4/P51 準拠）。

#### Step 1-A: タスク完了記録

**1-A-1. 関連仕様書への完了記録**

以下の仕様書を読み取り、UT-06-003 の完了記録セクションを追加する:

| 更新対象仕様書     | パス                                                                                  | 追加内容                           |
| ------------------ | ------------------------------------------------------------------------------------- | ---------------------------------- |
| 安全ゲート仕様     | `.claude/skills/aiworkflow-requirements/references/safety-gate-spec.md`（存在確認後） | UT-06-003 完了タスクセクション追加 |
| タスクワークフロー | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                  | UT-06-003 を完了済みに更新         |

**1-A-2. LOGS.md 2ファイル更新（P1/P25 準拠、両ファイル必須）**

```bash
# 更新対象ファイル（2ファイル必須）
.claude/skills/aiworkflow-requirements/LOGS.md
.claude/skills/task-specification-creator/LOGS.md
```

各 LOGS.md に追記する内容:

- 日付: 2026-03-16
- タスクID: UT-06-003
- タイトル: SafetyGatePort 具象クラス実装（DefaultSafetyGate）
- ステータス: 完了
- 成果物パス: `apps/desktop/src/main/permissions/default-safety-gate.ts`, `apps/desktop/src/main/ipc/handlers/safety-gate.ts`

**1-A-3. SKILL.md 2ファイル更新（P29 準拠、両ファイル必須）**

```bash
# 更新対象ファイル（2ファイル必須）
.claude/skills/aiworkflow-requirements/SKILL.md
.claude/skills/task-specification-creator/SKILL.md
```

各 SKILL.md の変更履歴テーブルに UT-06-003 の完了エントリを追加する。

#### Step 1-B: 実装状況テーブルの更新

以下の仕様書で「未実装」と記録されている UT-06-003 のステータスを「完了」に更新する:

```bash
# 対象ファイルを grep で検索
grep -rn "UT-06-003" .claude/skills/aiworkflow-requirements/references/
```

見つかった各ファイルの UT-06-003 ステータスを `未実装` → `完了（2026-03-16）` に変更する。

#### Step 1-C: 関連タスクテーブルの更新

```bash
# UT-06-003 を参照している仕様書を検索
grep -rn "UT-06-003" .claude/skills/aiworkflow-requirements/references/
grep -rn "safety-gate" .claude/skills/aiworkflow-requirements/references/
```

見つかった各ファイルの関連タスクテーブルで UT-06-003 のステータスを更新する。

#### Step 1-D: topic-map.md 再生成（P2/P27 準拠）

仕様書に変更が加わった（削除・更新・追加を問わず）ため、topic-map.md を必ず再生成する:

```bash
cd .claude/skills/aiworkflow-requirements
node scripts/generate-index.js
```

再生成後、`indexes/topic-map.md` が更新されていることを `git diff --stat` で確認する。

#### Step 2: システム仕様更新（新規インターフェースのため必須）

DefaultSafetyGate は新規クラスであるため、以下のシステム仕様を更新する:

| 更新対象                 | パス                                                                                                   | 追加内容                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Permissionアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-permission-governance.md`（存在確認後）        | DefaultSafetyGate クラスの説明・クラス図を追加 |
| IPC仕様                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                  | `skill:evaluate-safety` ハンドラのエントリ追加 |
| インターフェース仕様     | `.claude/skills/aiworkflow-requirements/references/interfaces-permission-safety-gate.md`（存在確認後） | DefaultSafetyGate の実装詳細を追加             |

**更新内容の最低要件:**

- DefaultSafetyGate クラスのコンストラクタシグネチャ
- `evaluate()` メソッドの型シグネチャ
- 5種 SafetyCheckId と評価ルールの表形式記述
- Grade集約ルールの条件式
- IPC チャンネル名（`skill:evaluate-safety`）

---

### Task 3: documentation-changelog.md 作成

成果物パス: `outputs/phase-12/documentation-changelog.md`

**重要:** Task 1・Task 2 の全 Step が完了した後に changelog を作成する。Step 完了前に「完了」と記載しないこと（P4 準拠）。

changelog に記録する内容:

1. **Task 1: 実装ガイド**
   - Part 1（概念説明）の作成結果
   - Part 2（技術詳細）の作成結果

2. **Task 2: システム仕様書更新**
   - Step 1-A: LOGS.md（2ファイル）の更新結果と更新内容の概要
   - Step 1-A: SKILL.md（2ファイル）の更新結果
   - Step 1-B: 実装状況テーブルの更新結果（更新したファイル名とステータス変更内容）
   - Step 1-C: 関連タスクテーブルの更新結果（更新したファイル名）
   - Step 1-D: topic-map.md 再生成の実行結果（git diff --stat の出力）
   - Step 2: システム仕様更新の結果（更新したファイル名と追加内容の概要）

3. **Task 4: 未タスク検出**
   - 検出件数（0件の場合も必ず記録）
   - 各未タスクのタスクID・タイトル・優先度

4. **Task 5: スキルフィードバック**
   - 改善点の有無（改善点なしの場合も記録）

---

### Task 4: 未タスク検出レポート作成（0件でも必須）

成果物パス: `outputs/phase-12/unassigned-task-detection.md`

#### 検出ソース

以下のソースから未タスクを検出する:

| ソース                           | 内容                                                        | 確認方法                                             |
| -------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------- |
| index.md スコープ外              | PermissionDialog UI（TASK-SKILL-LIFECYCLE-08）等            | index.md の「スコープ外」セクション                  |
| Phase 3 設計レビュー MINOR 指摘  | `outputs/phase-3/design-review-report.md` の MINOR 指摘一覧 | MINOR 指摘が未タスク化されているか確認               |
| Phase 10 最終レビュー MINOR 指摘 | `outputs/phase-10/final-review-report.md` の MINOR 指摘一覧 | MINOR 指摘が未タスク化されているか確認               |
| Phase 11 発見事項 Note/Info      | `outputs/phase-11/discovered-issues.md` の Note/Info 分類   | 未タスク候補として記録されているか確認               |
| コードコメント                   | 実装コード内の TODO コメント                                | `grep -rn "TODO" apps/desktop/src/main/permissions/` |

#### 未タスクが検出された場合の3ステップ（P3/P38/P58 準拠）

未タスクを1件でも検出した場合、以下の3ステップを**全て完了**させること:

**ステップ1:** `docs/30-workflows/unassigned-task/` に独立した指示書ファイルを作成する

- ファイル名: `task-{タスクID}-{機能の英語名}.md`
- 内容: タスク目的・スコープ・受入基準・依存タスク・参照資料

**ステップ2:** `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録する

- タスクID・タイトル・優先度・ステータス（未実施）・発見元を記録

**ステップ3:** 関連仕様書に参照リンクを追加する

- 未タスクに関連する仕様書を grep で特定し、各仕様書の「関連タスク」テーブルに追加

#### 0件の場合

未タスクが0件の場合も `outputs/phase-12/unassigned-task-detection.md` を作成し、「検出件数: 0件」と記録する。

#### `unassigned-task-detection.md` の更新

```bash
grep -rn "UT-06-003" .claude/skills/aiworkflow-requirements/references/unassigned-task-detection.md
```

ファイルが存在する場合、UT-06-003 のステータスと検出件数を更新する。

#### GitHub Issue の Close（再評価クローズの場合）

再評価クローズした未タスクがある場合（P56 準拠）:

```bash
gh issue close <issue_number> --comment "再評価クローズ: [理由を記載]"
```

---

### Task 5: スキルフィードバックレポート作成（改善点なしでも必須）

成果物パス: `outputs/phase-12/skill-feedback-report.md`

#### 記録内容

以下の観点でスキル（ワークフロー）の改善点を検討し、レポートに記録する:

| 観点               | 検討内容                                                |
| ------------------ | ------------------------------------------------------- |
| Phase設計の効率    | Phase 4（テスト）と Phase 5（実装）の分離は有効だったか |
| 仕様書の精度       | Phase 2 の設計書が Phase 5 実装で役立ったか             |
| 落とし穴の発生     | P1〜P59 のどれかに該当するインシデントが発生したか      |
| 新規パターンの発見 | 本タスク固有の改善パターンが発見されたか                |

改善点がない場合は「改善点なし: 理由を明記」として記録する（P28 準拠）。

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| タスク実行ワークフロー | `.claude/rules/05-task-execution.md`                                                        |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                                        |
| IPC 設計               | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |

### タスク固有参照

| 参照資料              | パス                                                                   |
| --------------------- | ---------------------------------------------------------------------- |
| タスク index          | `docs/30-workflows/safety-gate-implementation/index.md`                |
| Phase 2 設計書        | `docs/30-workflows/safety-gate-implementation/phase-2-design.md`       |
| Phase 11 手動テスト   | `docs/30-workflows/safety-gate-implementation/phase-11-manual-test.md` |
| Phase 11 発見事項     | `outputs/phase-11/discovered-issues.md`                                |
| Phase 10 最終レビュー | `outputs/phase-10/final-review-report.md`                              |

## 実行手順

### ステップ1: 実装ガイド作成（Task 1）

1. Part 1（中学生レベル概念説明）を作成する
2. Part 2（開発者向け技術詳細: 型定義・API・使用例・エラー・モック）を作成する

### ステップ2: システム仕様書更新（Task 2）

1. Step 1-A: LOGS.md 2ファイル + SKILL.md 2ファイルを更新する
2. Step 1-B: 実装状況テーブルの UT-06-003 ステータスを更新する
3. Step 1-C: 関連タスクテーブルを更新する
4. Step 1-D: `node scripts/generate-index.js` で topic-map.md を再生成する
5. Step 2: システム仕様書に DefaultSafetyGate の記述を追加する

### ステップ3: documentation-changelog 作成（Task 3）

1. Task 1〜5 の全完了後に作成する（先行作成禁止）
2. 全 Step の実行結果を記録する

### ステップ4: 未タスク検出（Task 4）

1. 5つの検出ソースから未タスクを検出する
2. 検出された場合、3ステップ（指示書・task-workflow登録・仕様書リンク）を全完了する
3. 0件の場合も `unassigned-task-detection.md` を作成する

### ステップ5: スキルフィードバック作成（Task 5）

1. Phase設計効率・仕様書精度・落とし穴発生・新規パターンの4観点で検討する
2. 改善点なしの場合も理由を明記してレポートを作成する

## 統合テスト連携

- Task 2 Step 2 で更新されたシステム仕様書は、TASK-SKILL-LIFECYCLE-08（PermissionDialog 実装）の設計フェーズで参照される
- Task 4 で検出された未タスクが TASK-SKILL-LIFECYCLE-08 に依存する場合、その旨を未タスク指示書に明記する

## 多角的チェック観点（AIが判断）

| 観点           | 確認項目                                                                                  | 仕様参照先                                                         |
| -------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| セキュリティ   | P42 3段バリデーション・P27 チャンネル定数の記述が実装ガイドに含まれているか               | `aiworkflow-requirements: architecture-auth-security.md`           |
| アーキテクチャ | DI 境界維持・SafetyGatePort の使い方が実装ガイド Part 2 に正確に記述されているか          | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| テスタビリティ | テスト時のモック差し替え方法（SafetyGatePort のモック生成例）が実装ガイドに含まれているか | `aiworkflow-requirements: testing-component-patterns.md`           |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                                                                                        | 仕様参照先                                          |
| -------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| バックエンド（Main） | DefaultSafetyGate クラス説明がシステム仕様書（arch-permission-governance.md）に追加されているか | `aiworkflow-requirements: architecture-overview.md` |
| IPC通信              | `skill:evaluate-safety` ハンドラのエントリが api-ipc-system.md に追加されているか               | `aiworkflow-requirements: api-ipc-system.md`        |

**Phase 10 MINOR 追跡:** Phase 10 で MINOR 判定が記録されている場合、全 MINOR 指摘が未タスク仕様書に変換されていることを Task 4 で確認すること（P4 準拠）。

**SF-02（2段階システム仕様更新）:** Step 2 では既存仕様書への追記（第1段階）と topic-map.md 再生成（第2段階）を必ず両方完了させること。

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. Task 1: 実装ガイド作成（Part 1 概念説明 + Part 2 技術詳細）
2. Task 2: システム仕様書更新（Step 1-A〜Step 2 全完了）
3. Task 3: documentation-changelog.md 作成（Task 1-5 全完了後）
4. Task 4: 未タスク検出レポート作成（0件でも必須・3ステップ全完了）
5. Task 5: スキルフィードバックレポート作成（改善点なしでも必須）
6. 成果物の作成・配置（phase12-task-spec-compliance-check.md を含む）
7. 完了条件の検証

## 成果物

| 成果物                         | パス                                                     | 必須                 |
| ------------------------------ | -------------------------------------------------------- | -------------------- |
| 実装ガイド（Part 1 + Part 2）  | `outputs/phase-12/implementation-guide.md`               | 必須                 |
| システム仕様更新サマリー       | `outputs/phase-12/system-spec-update-summary.md`         | 必須                 |
| documentation-changelog        | `outputs/phase-12/documentation-changelog.md`            | 必須                 |
| 未タスク検出レポート           | `outputs/phase-12/unassigned-task-detection.md`          | 必須（0件でも）      |
| スキルフィードバックレポート   | `outputs/phase-12/skill-feedback-report.md`              | 必須（改善なしでも） |
| Phase12 仕様書コンプライアンス | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 必須                 |
| 未タスク指示書（検出件数分）   | `docs/30-workflows/unassigned-task/task-{ID}-*.md`       | 未タスク検出時のみ   |

## 完了条件

### Task 1

- [ ] 実装ガイド Part 1（中学生レベル概念説明）が作成されている
- [ ] 「映画館のチェック係」の比喩を発展させた説明が含まれている
- [ ] 実装ガイド Part 2（開発者向け技術詳細）が作成されている
- [ ] 型定義・API シグネチャ・使用例・エラーハンドリング・テスト時のモック差し替え方法が記載されている

### Task 2

- [ ] LOGS.md が aiworkflow-requirements と task-specification-creator の2ファイル両方更新されている（P1/P25）
- [ ] SKILL.md が aiworkflow-requirements と task-specification-creator の2ファイル両方更新されている（P29）
- [ ] 実装状況テーブルで UT-06-003 が「完了」に更新されている
- [ ] `grep -rn "UT-06-003"` で見つかった全ての関連タスクテーブルが更新されている
- [ ] `node scripts/generate-index.js` を実行して topic-map.md が再生成されている（P2）
- [ ] システム仕様書（arch-permission, api-ipc 等）に DefaultSafetyGate の記述が追加されている
- [ ] `outputs/phase-12/system-spec-update-summary.md` が作成されている（Step 1-A〜Step 2 の実行結果を記録）

### Task 3

- [ ] documentation-changelog.md が作成されている
- [ ] Task 1〜Task 5 の全完了後に作成されている（P4 準拠、先行作成禁止）
- [ ] Step 1-A〜Step 2 の全 Step の実行結果が記録されている

### Task 4

- [ ] `outputs/phase-12/unassigned-task-detection.md` が作成されている（0件の場合も必須）
- [ ] 検出された未タスクの3ステップ（指示書作成・task-workflow 登録・関連仕様書リンク）が全完了している（P3/P58）
- [ ] 未タスク指示書は `docs/30-workflows/unassigned-task/` に配置されている（P38）
- [ ] `.claude/skills/aiworkflow-requirements/references/unassigned-task-detection.md` が更新されている
- [ ] 再評価クローズした未タスクの GitHub Issue が Close されている（P56）

### Task 5

- [ ] スキルフィードバックレポートが作成されている（改善点なしでも必須、P28）

### Task 6（追加）

- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が作成されている
- [ ] 本仕様書（phase-12-documentation.md）の全必須セクションが揃っていることをチェックリストで確認済みである

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/safety-gate-implementation --phase 12
```

## 次Phase

Phase 13: 完了 → `phase-13-completion.md`
