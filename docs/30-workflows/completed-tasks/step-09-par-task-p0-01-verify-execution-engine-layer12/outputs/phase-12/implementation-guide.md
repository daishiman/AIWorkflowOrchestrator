# TASK-P0-01: SkillCreatorVerificationEngine Implementation Guide

## Part 1: 中学生レベルの説明

スキルを作ったあと、「必要な紙が全部そろっているか」と「書き方がルール通りか」を、自動で見てくれる見張り役を足すタスクです。料理で言えば、材料が全部あるかを見るのが Layer 1、分量や手順の書き方が抜けていないかを見るのが Layer 2 です。

この仕組みが必要なのは、作った直後にミスへ気づけるようにするためです。今の workflow では「確認する予定」は書いてあっても、確認役そのものがないので、後ろの task が前提を信じすぎる危険があります。

## Part 2: 技術詳細

### Public API

```ts
class SkillCreatorVerificationEngine {
  verify(skillDir: string): Promise<RuntimeSkillCreatorVerifyCheck[]>;
}
```

### クラス構造

```
SkillCreatorVerificationEngine
  └── verify(skillDir)
      ├── validateLayer1(skillDir)  // 構造検証
      │   ├── L1-001: SKILL.md existence
      │   ├── L1-002: agents/ directory existence
      │   ├── L1-003: agents/ has files
      │   ├── L1-004: references/ existence (warning)
      │   └── L1-005: output-schema.json existence (warning)
      └── validateLayer2(skillDir)  // コンテンツ検証
          ├── L2-001: SKILL.md H1 heading
          ├── L2-002: overview section (## 概要)
          ├── L2-003: Trigger section
          ├── L2-004: Anchors section (warning)
          ├── L2-005: agent H1 heading (per .md file)
          ├── L2-006: agent responsibility section (per .md file)
          └── L2-007: output-schema.json JSON validity
```

### 型拡張

```ts
// packages/shared/src/types/skillCreator.ts:576
interface RuntimeSkillCreatorVerifyCheck {
  id: string;
  layer: "layer1" | "layer2" | "layer3" | "layer4"; // layer1/layer2 追加
  severity: "info" | "warning" | "error";
  summary: string;
  evidenceSummary?: string;
}
```

既存の Layer 3/4 コードは影響を受けない (union type の拡張は backward compatible)。339 既存テスト全通過確認済み。

### Facade Injection パターン

```ts
// RuntimeSkillCreatorFacadeDeps に追加
verificationEngine?: SkillCreatorVerificationEngine;

// RuntimeSkillCreatorFacade に追加
async verifySkill(skillDir: string): Promise<RuntimeSkillCreatorVerifyCheck[]>
// engine 未 inject 時は空配列を返す (graceful degradation)
```

### 共通ユーティリティ

`SkillCreatorVerificationEngine.ts` 内の private helpers:

- `createCheck(id, layer, severity, summary, evidenceSummary)` — check result 生成
- `fileExists(path)` / `directoryExists(path)` — fs 存在チェック
- `readFileContent(path)` — graceful ファイル読み込み (null on error)
- `hasMarkdownSection(content, heading)` — Markdown セクション検出
- `hasH1Heading(content)` — H1 heading 検出

### テスト戦略

- **Fixture**: `os.tmpdir()` に一時ディレクトリを作成し、`createSkillFixture()` ヘルパーで構造を組み立て
- **テスト数**: 25 (17 baseline + 8 edge cases)
- **カバレッジ**: L1-001〜L1-005, L2-001〜L2-007 の全 pass/fail/edge case
- **Facade**: T-FAC-01 (inject あり) / T-FAC-02 (inject なし)

### 変更ファイル一覧

| ファイル                                                                                  | 変更種別             |
| ----------------------------------------------------------------------------------------- | -------------------- |
| `packages/shared/src/types/skillCreator.ts`                                               | 型拡張 (layer union) |
| `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                | 新規作成 (359行)     |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                     | injection point 追加 |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` | 新規作成 (~490行)    |

### Phase 11 手動テスト結果

- TC-11-01: `.agents/skills/task-specification-creator` で 27 checks (errors: 2, warnings: 11)
- TC-11-02: SKILL.md のみ → 9 checks、部分 fail
- TC-11-03: 空ディレクトリ → 9 checks、全 error + graceful degradation
- TC-11-04: 結果型の全フィールド存在確認

### 発見事項 (Note)

- N-01: 実スキルの SKILL.md セクション名が L2 チェックと一致しないケースあり (スコープ外)
- N-02: agent spec の `## 責務` が別名で書かれているケースで warning (スコープ外)
