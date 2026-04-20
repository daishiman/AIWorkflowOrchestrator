# ソリューション設計

## 設計方針

| 観点      | 方針                                                                 |
| --------- | -------------------------------------------------------------------- |
| 実装前提  | `cleanupCancelledSkillDir` と既存テストを正本として扱う              |
| spec 責務 | code patch 指示書ではなく、回帰確認 task と close-out 仕様書にする   |
| 並列化    | Lane A: skill準拠監査、Lane B: 30思考法分析、Lane C: phase spec 整流 |
| 命名      | 全 phase の artifact 名を canonical 一覧に準拠させる                 |

## 変更スコープ

### 変更対象

| 対象                                                            | 変更内容               |
| --------------------------------------------------------------- | ---------------------- |
| `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/*.md` | 仕様書の再構成         |
| `outputs/phase-*/`                                              | canonical 成果物の作成 |
| `artifacts.json` / `outputs/artifacts.json`                     | parity 整合            |

### 変更対象外

| 対象                                                                         | 理由                           |
| ---------------------------------------------------------------------------- | ------------------------------ |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | 実装は既に正しい               |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | 既存テストは回帰根拠として維持 |

## 核心設計決定

### 1. `catch` ベース設計の明文化

```
try {
  // スキル作成処理
} catch (error) {
  await this.cleanupCancelledSkillDir(skillDir, skillDirExistedBefore, signal, error);
  throw error;
} finally {
  // AbortController リセットのみ
}
```

**仕様書に明記すること**:

- クリーンアップは `catch` ブロックで実行される
- `finally` はリソース解放のみ（クリーンアップは行わない）
- `createdByThisRun` は使用していない

### 2. `skillDirExistedBefore` フラグの明文化

```
const skillDirExistedBefore = await this.pathExists(skillDir);
```

**仕様書に明記すること**:

- スキル作成開始**前**に存在確認する
- `existedBefore === true` の場合は cleanup をスキップする（既存保護）
- `abort/cancel` でない通常エラーも cleanup をスキップする

### 3. NON_VISUAL close-out フロー

```
Phase 10 → final-review-result.md
Phase 11 → manual-test-result.md（代替証跡）
Phase 12 → implementation-guide.md（NON_VISUAL 視覚証跡セクション必須）
```

## アーキテクチャ影響

なし。本 task は spec の再構成であり、コードアーキテクチャへの影響はない。
