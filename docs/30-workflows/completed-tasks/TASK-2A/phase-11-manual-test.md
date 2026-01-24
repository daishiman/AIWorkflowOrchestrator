# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 11                             |
| Phase名    | 手動テスト検証                 |
| 前提Phase  | Phase 10（最終レビューゲート） |
| 後続Phase  | Phase 12（ドキュメント更新）   |
| ステータス | 未実施                         |
| 作成日     | 2026-01-24                     |
| 機能名     | TASK-2A: SkillScanner          |

---

## 目的

実環境での動作確認を行う。自動テストでは検証できない UX やエッジケースを手動で検証し、問題を発見する。

## 背景

SkillScanner は実際のファイルシステム（~/.aiworkflow/skills/, ~/.claude/skills/）にアクセスする。モックを使用した自動テストでは検証できない実環境での動作を確認する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 自動テスト全実行

**目的**: 手動テスト前に自動テストが全てパスすることを確認する

**実行手順**:

1. 関連する全自動テストを実行する：

```bash
pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/services/skill/__tests__/
```

2. テスト結果を確認し、全てパスしていることを確認する

3. `outputs/phase-11/automated-test-result.md` に結果を記録する

**期待される成果物**:

- `outputs/phase-11/automated-test-result.md`

---

### タスク2: 実環境スキャンテスト

**目的**: 実際のスキルディレクトリをスキャンして動作確認する

**実行手順**:

1. 実環境でスキャンを実行するテストスクリプトを作成・実行する：

```typescript
// apps/desktop/src/main/services/skill/__manual-tests__/scan-real-skills.ts
import { SkillScanner } from "../SkillScanner";

async function main() {
  const scanner = new SkillScanner();
  const skills = await scanner.scanAll();

  console.log(`Found ${skills.length} skills:`);
  skills.forEach((skill) => {
    console.log(`- ${skill.name} (readonly: ${skill.readonly})`);
    console.log(`  agents: ${skill.agents.length}`);
    console.log(`  references: ${skill.references.length}`);
    console.log(`  scripts: ${skill.scripts.length}`);
  });
}

main().catch(console.error);
```

2. 以下の項目を確認する：

| TC-ID  | テスト項目                                     | 期待結果                               | 結果 |
| ------ | ---------------------------------------------- | -------------------------------------- | ---- |
| TC-001 | ~/.aiworkflow/skills/ のスキルがスキャンされる | スキル一覧に含まれる                   | □    |
| TC-002 | ~/.claude/skills/ のスキルがスキャンされる     | スキル一覧に含まれる（readonly: true） | □    |
| TC-003 | agents/ 配下のファイルが取得される             | agents 配列に含まれる                  | □    |
| TC-004 | references/ 配下のファイルが取得される         | references 配列に含まれる              | □    |
| TC-005 | SKILL.md の description が正しく取得される     | description フィールドに値がある       | □    |

3. `outputs/phase-11/real-scan-result.md` に結果を記録する

**期待される成果物**:

- `outputs/phase-11/real-scan-result.md`

---

### タスク3: エッジケーステスト

**目的**: 自動テストでカバーしきれないエッジケースを検証する

**実行手順**:

1. 以下のエッジケースを手動で検証する：

| TC-ID  | テスト項目                                       | 期待結果                       | 結果 |
| ------ | ------------------------------------------------ | ------------------------------ | ---- |
| TC-101 | ~/.aiworkflow/skills/ が存在しない状態でスキャン | ディレクトリが自動作成される   | □    |
| TC-102 | 空の SKILL.md を持つスキルをスキャン             | エラーにならず、空データで取得 | □    |
| TC-103 | 非常に大きな SKILL.md（10KB+）をスキャン         | 正常にパースされる             | □    |
| TC-104 | 深くネストしたディレクトリ構造をスキャン         | 正常にスキャンされる           | □    |
| TC-105 | 特殊文字を含むスキル名（日本語、スペース等）     | 正常にスキャンされる           | □    |

2. `outputs/phase-11/edge-case-result.md` に結果を記録する

**期待される成果物**:

- `outputs/phase-11/edge-case-result.md`

---

### タスク4: パフォーマンステスト

**目的**: 実環境でのパフォーマンスを検証する

**実行手順**:

1. スキャン時間を計測する：

```typescript
const start = Date.now();
const skills = await scanner.scanAll();
const duration = Date.now() - start;
console.log(`Scan completed in ${duration}ms for ${skills.length} skills`);
```

2. 以下のパフォーマンス基準を確認する：

| TC-ID  | テスト項目                    | 目標       | 結果 |
| ------ | ----------------------------- | ---------- | ---- |
| TC-201 | 全スキルのスキャン時間        | 3秒以内    | □    |
| TC-202 | 連続スキャン（5回）での安定性 | 時間が安定 | □    |
| TC-203 | メモリ使用量の確認            | 安定       | □    |

3. `outputs/phase-11/performance-result.md` に結果を記録する

**期待される成果物**:

- `outputs/phase-11/performance-result.md`

---

### タスク5: 発見課題の記録

**目的**: 手動テストで発見した課題を記録する

**実行手順**:

1. 発見した課題を以下の形式で記録する：

| 課題ID | 概要               | 重要度   | 対応方針           |
| ------ | ------------------ | -------- | ------------------ |
| ISS-01 | （例：課題の概要） | 高/中/低 | 修正/将来対応/受容 |

2. 重要度「高」の課題がある場合は、Phase 10 の戻り先に従って修正する

3. `outputs/phase-11/discovered-issues.md` に記録する

**期待される成果物**:

- `outputs/phase-11/discovered-issues.md`

---

### タスク6: 手動テスト結果サマリー

**目的**: 手動テスト結果を総合評価する

**実行手順**:

1. 以下のサマリーを作成する：

```markdown
## テストカテゴリ別結果

### 機能テスト（正常系）

| TC-ID  | 機能                | 期待結果             | 結果 | 備考 |
| ------ | ------------------- | -------------------- | ---- | ---- |
| TC-001 | aiworkflow スキャン | スキル一覧に含まれる | PASS |      |

### エッジケーステスト（異常系）

| TC-ID  | 状況             | 期待結果       | 結果 | 備考 |
| ------ | ---------------- | -------------- | ---- | ---- |
| TC-101 | ディレクトリ不在 | 自動作成される | PASS |      |

### パフォーマンステスト

| TC-ID  | テスト項目   | 目標    | 結果 | 備考 |
| ------ | ------------ | ------- | ---- | ---- |
| TC-201 | スキャン時間 | 3秒以内 | PASS |      |
```

2. `outputs/phase-11/manual-test-result.md` に総合結果を記録する

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`

---

## 参照資料

| 参照資料             | パス                                                   | 内容             |
| -------------------- | ------------------------------------------------------ | ---------------- |
| Phase 5 実装         | `apps/desktop/src/main/services/skill/SkillScanner.ts` | テスト対象コード |
| Phase 9 品質保証結果 | `outputs/phase-09/`                                    | 品質検証結果     |

---

## 成果物

| 成果物             | パス                                        | 内容               |
| ------------------ | ------------------------------------------- | ------------------ |
| 自動テスト結果     | `outputs/phase-11/automated-test-result.md` | 自動テスト実行結果 |
| 実環境スキャン結果 | `outputs/phase-11/real-scan-result.md`      | 実スキャン結果     |
| エッジケース結果   | `outputs/phase-11/edge-case-result.md`      | エッジケース検証   |
| パフォーマンス結果 | `outputs/phase-11/performance-result.md`    | 性能検証           |
| 発見課題           | `outputs/phase-11/discovered-issues.md`     | 発見した課題       |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md`    | 総合結果           |

---

## 統合テスト連携

**Phase 11 では統合テストとの関連として**:

- IPC ハンドラー経由での動作確認（将来の統合テスト観点）
- Renderer Process からの呼び出しシナリオの想定

---

## 完了条件

- [ ] 自動テストが全てパスしている
- [ ] 実環境スキャンテスト（TC-001〜TC-005）がパスしている
- [ ] エッジケーステスト（TC-101〜TC-105）がパスしている
- [ ] パフォーマンステスト（TC-201〜TC-203）が目標を達成している
- [ ] 発見課題が記録されている（課題がない場合も明記）
- [ ] 手動テスト結果サマリーが作成されている
- [ ] 重要度「高」の未解決課題がない

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 10（最終レビューゲート）が完了していること
- **後続**: Phase 12（ドキュメント更新）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-2A/phase-12-documentation.md`
