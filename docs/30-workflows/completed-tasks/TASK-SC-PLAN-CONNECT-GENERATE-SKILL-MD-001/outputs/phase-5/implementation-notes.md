# Phase 5: 実装ノート

## 変更概要

**対象ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

### 変更1: logger フィールド追加

```typescript
private readonly logger = {
  error: (msg: string, meta?: unknown) =>
    console.error(`[SkillCreatorService] ${msg}`, meta),
  warn: (msg: string, meta?: unknown) =>
    console.warn(`[SkillCreatorService] ${msg}`, meta),
};
```

**理由**: null フォールバック時のログ出力と generateSkillMd 内のエラーログに必要。
既存コードに影響を与えないよう private readonly フィールドとして追加。

### 変更2: `void structurePlan;` 削除

**変更前** (line 132):

```typescript
void structurePlan; // 将来 generateSkillMd へ渡す（タスクA完了後に接続）
```

**変更後**: 行ごと削除

**理由**: 本タスクの接続実装が完了したため不要。

### 変更3: SKILL.md 生成ブロック置換

**変更前** (旧 lines 179-224): 全モード共通の汎用プラン生成ブロック

**変更後**:

```typescript
// SKILL.md生成: structurePlan がある場合は generateSkillMd、ない場合は ensureSkillMdExists
if (structurePlan) {
  await this.generateSkillMd(skillDir, structurePlan);
} else {
  this.logger.error(
    "structurePlan is null, falling back to ensureSkillMdExists",
  );
  await this.ensureSkillMdExists(skillDir, options.name, options.description);
}
```

**理由**: `structurePlan` が存在する場合（create モード成功時）は plan データを活用した SKILL.md 生成を行い、ない場合（null / 他モード）はテンプレートベースの fallback を直接呼ぶ。

### 変更4: `generateSkillMd` プライベートメソッド追加

`runCreateWorkflow` と `generateTaskSpecs` の間に追加。

**実装ポイント**:

- `StructurePlanJson` → workflow 形式への変換（既存テスト TC-01〜07 互換）
- `generate_skill_md.js --plan <tmpPlanPath> --output <skillMdPath>` で呼び出し
- `fs.access` チェック（既存テスト TC-05 互換）
- catch ブロックで `ensureSkillMdExists` へ fallback（TC-CONNECT-4）
- finally で tmpFile クリーンアップ（TC-06）

---

## テスト実行結果（Green確認）

```
✓ src/main/services/skill/__tests__/SkillCreatorService.test.ts (76 tests) 172ms
```

- 既存テスト TC-01〜TC-07: PASS（workflow 形式変換で互換性確保）
- 新規テスト TC-CONNECT-1〜4, IT-CONNECT-1〜2: PASS

## void structurePlan 削除確認

`void structurePlan;` は完全に削除済み。残存なし。

## diff 要約

| 変更種別 | 行数                                                   |
| -------- | ------------------------------------------------------ |
| 追加     | +73行（logger + if/else + generateSkillMd メソッド）   |
| 削除     | -47行（void structurePlan + 旧 SKILL.md 生成ブロック） |
| 純増     | +26行                                                  |
