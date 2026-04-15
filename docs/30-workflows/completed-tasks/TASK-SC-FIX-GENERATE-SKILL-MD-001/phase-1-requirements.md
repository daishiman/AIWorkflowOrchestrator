# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 1                                 |
| Phase名    | 要件定義                          |
| 対象機能   | TASK-SC-FIX-GENERATE-SKILL-MD-001 |
| 前提Phase  | -                                 |
| 次Phase    | Phase 2: 設計                     |
| ステータス | pending                           |
| 作成日     | 2026-04-14                        |

## 目的

`generate_skill_md.js` 呼び出しの引数ミスマッチという真の論点を固定し、
修正スコープと検証可能な完了基準（AC-1〜AC-5）を定義する。

## 実行タスク

### Task 1: 真の論点の固定

`SkillCreatorService.ts:155-158` の現状コードを記録する：

```typescript
const generateResult = await this.scriptExecutor.execute(
  "generate_skill_md.js",
  ["--path", skillDir],
);
```

`generate_skill_md.js` の仕様では `skillName` を含む構造計画 JSON を `--plan <json>` で受け取り、`--output <path>` へ SKILL.md を出力する。
`--path` は当スクリプトに存在しない引数であるため、スクリプトはオプション解析エラーで終了コード非ゼロを返す。
結果として `generateResult.success` が常に `false` になり、SKILL.md 生成はフォールバック経路に落ちる：

```typescript
if (!generateResult.success) {
  await this.ensureSkillMdExists(skillDir, options.name, options.description);
}
```

`ensureSkillMdExists` フォールバックが生成する SKILL.md は YAML フロントマターを持つが、
`## Task一覧` は持たないため、スキル仕様書としては最小構成に留まる。

### Task 2: 解決アプローチの決定（B案採用）

検討したアプローチ：

**A案**: `generate_skill_md.js` スクリプト自体を `--path` 引数対応に修正する

- 問題: スクリプトの仕様変更は影響範囲が広く、他の呼び出し箇所が存在する可能性がある

**B案（採用）**: `SkillCreatorService` 側で `skillName` と `workflow.summary` を含む最小構造計画 JSON を組み立て、
tmp json ファイルに書いて `--plan` / `--output` 引数で渡す。finally 節で cleanup する。

- 理由: スクリプトの仕様に合わせてサービス側を修正する方が変更範囲が局所的かつ安全

B案の実装イメージ：

```typescript
// tmp jsonファイルを生成してスクリプトに --plan / --output で渡す
const tmpPlanPath = path.join(os.tmpdir(), `skill-plan-${randomUUID()}.json`);
try {
  const plan = {
    skillName: options.name,
    workflow: {
      summary: options.description,
      anchors: [],
      trigger: {
        description: `Use when ${options.name} is requested`,
        keywords: [options.name],
      },
      phases: [],
      tasks: [],
    },
    directories: {},
    files: [],
  };
  await fs.writeFile(tmpPlanPath, JSON.stringify(plan), "utf-8");
  const generateResult = await this.scriptExecutor.execute(
    "generate_skill_md.js",
    ["--plan", tmpPlanPath, "--output", path.join(skillDir, "SKILL.md")],
  );
  if (!generateResult.success) {
    await this.ensureSkillMdExists(skillDir, options.name, options.description);
  }
} finally {
  await fs.unlink(tmpPlanPath).catch(() => {});
}
```

### Task 3: 受入条件の確定

- AC-1: `generate_skill_md.js` が終了コード 0 で完了する
- AC-2: 生成 SKILL.md に `## Task一覧` セクションが含まれる
- AC-3: 生成 SKILL.md に YAML フロントマター（`---` ブロック）が含まれる
- AC-4: スクリプト不在時（または終了コード非ゼロ時）は `ensureSkillMdExists` フォールバックが正常に機能する
- AC-5: tmp json ファイルが finally 節で確実に削除される（スクリプト成功・失敗どちらの場合も）

### Task 4: スコープ境界

**含む**:

- `SkillCreatorService.ts:152-165` の修正（`--plan` / `--output` 引数対応・tmp JSON 生成・cleanup）
- `SkillCreatorService.test.ts` の対応テスト追加・更新

**含まない**:

- `generate_skill_md.js` スクリプト自体の変更
- `ensureSkillMdExists` の変更
- `init_skill.js` 呼び出しロジックの変更
- IPC 契約変更
- PR 作成

## 参照資料

| 資料名                     | パス                                                                         | 説明                   |
| -------------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| SkillCreatorService        | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | 問題箇所（行 152-165） |
| SkillCreatorService テスト | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | 既存テスト確認         |

## 統合テスト連携

- Phase 4 で AC-1〜AC-5 を 1:1 でカバーするテストケースを定義する
- Phase 10 で AC-1〜AC-5 とテストの対応表を最終確認する

## 成果物

| 成果物     | パス                              | 説明                             |
| ---------- | --------------------------------- | -------------------------------- |
| 要件定義書 | `outputs/phase-1/requirements.md` | 真の論点・受入条件・スコープ境界 |

## 完了条件

- [ ] 真の論点（引数ミスマッチ）が明文化されている
- [ ] B案採用の理由が記録されている
- [ ] AC-1〜AC-5 が検証可能な形で定義されている
- [ ] 含む / 含まないスコープが明確である
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次 Phase

→ [Phase 2: 設計](./phase-2-design.md)
