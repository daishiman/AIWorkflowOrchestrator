# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 5                                     |
| 機能名 | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| 作成日 | 2026-02-11                            |
| 状態   | **完了**                              |

## 目的

Phase 4 で作成したテストを通すための最小限の実装を行う。

## 実行タスク

- Setter Injection 実装: setSkillExecutor メソッドの実装
- 委譲ロジック実装: executeSkill から SkillExecutor.execute への委譲
- 型変換実装: Skill → SkillMetadata の変換関数実装
- エラーハンドリング: 初期化チェック、スキル存在チェック

## 参照資料

| 資料名       | パス                                     | 説明          |
| ------------ | ---------------------------------------- | ------------- |
| 設計書       | `outputs/phase-2/architecture-design.md` | Phase 2成果物 |
| テスト仕様書 | `outputs/phase-4/test-specification.md`  | Phase 4成果物 |

## 実装内容

### 1. Setter Injection の実装

```typescript
// SkillService.ts (追加部分)
private skillExecutor: SkillExecutor | null = null;

/**
 * SkillExecutor を Setter Injection で設定
 * BrowserWindow 準備後に呼び出される
 */
setSkillExecutor(executor: SkillExecutor): void {
  this.skillExecutor = executor;
}
```

### 2. executeSkill の委譲ロジック

```typescript
async executeSkill(request: SkillExecutionRequest): Promise<SkillExecutionResponse> {
  // 1. SkillExecutor の初期化確認
  if (!this.skillExecutor) {
    throw new Error('SkillExecutor is not initialized');
  }

  // 2. スキル存在確認
  const skill = this.getSkillById(request.skillId);
  if (!skill) {
    throw new SkillNotFoundError(`Skill not found: ${request.skillId}`);
  }

  // 3. インポート状態確認
  if (!skill.isImported) {
    throw new SkillNotImportedError(`Skill not imported: ${request.skillId}`);
  }

  // 4. 型変換: Skill → SkillMetadata
  const metadata = this.convertToSkillMetadata(skill);

  // 5. SkillExecutor に委譲
  return this.skillExecutor.execute(request, metadata);
}
```

### 3. 型変換関数

```typescript
private convertToSkillMetadata(skill: Skill): SkillMetadata {
  return {
    skillId: skill.id,
    name: skill.name,
    description: skill.description || '',
    version: skill.version || '1.0.0',
    author: skill.author,
    capabilities: skill.capabilities || [],
  };
}
```

## 統合テスト連携【必須】

| 実装項目           | 内容                                          |
| ------------------ | --------------------------------------------- |
| API接続            | SkillService → SkillExecutor → SDK の経路確立 |
| エラーハンドリング | 初期化エラー、スキル未検出エラーの適切な伝播  |
| 状態同期           | Setter Injection による遅延初期化の実現       |

## アーキテクチャ層別実装

| 層           | 実装観点                               | 実装ファイル                                           |
| ------------ | -------------------------------------- | ------------------------------------------------------ |
| Main Process | Setter Injection、バリデーション、委譲 | `apps/desktop/src/main/services/skill/SkillService.ts` |
| 型定義       | Skill ↔ SkillMetadata 変換             | 同上（private メソッド）                               |

## 実装時の注意事項（既知のPitfall対策）

| Pitfall ID | 注意事項                                             | 対策                                  |
| ---------- | ---------------------------------------------------- | ------------------------------------- |
| P34        | 遅延初期化が必要な依存オブジェクトの DI パターン選択 | Setter Injection パターンを採用       |
| P35        | DI 追加時のテストモック大規模修正                    | 既存テストに mockSkillExecutor を追加 |

## 成果物

| 成果物     | パス                                                   | 説明     |
| ---------- | ------------------------------------------------------ | -------- |
| 実装コード | `apps/desktop/src/main/services/skill/SkillService.ts` | 委譲実装 |

## 完了条件

- [x] すべてのテストが成功状態（Green）
- [x] 実装が最小限に抑えられている
- [x] Setter Injection が実装されている
- [x] 型変換が実装されている
- [x] アーキテクチャ層別の実装が適切に配置されている
- [x] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm test -- --grep "SkillService.executeSkill"

# 確認項目
# - [x] テストが成功することを確認（Green状態）
```

## 次のPhase

Phase 6: テスト拡充
