# スキル実行タイムアウト処理 - タスク指示書

## メタ情報

```yaml
issue_number: 414
```

| 項目         | 内容                             |
| ------------ | -------------------------------- |
| タスクID     | TASK-SKILL-EXEC-TIMEOUT          |
| タスク名     | スキル実行タイムアウト処理の実装 |
| 分類         | 改善                             |
| 対象機能     | SkillService.executeSkill        |
| 優先度       | 低                               |
| 見積もり規模 | 小規模                           |
| ステータス   | 未実施                           |
| 発見元       | Phase 12（ドキュメント更新）     |
| 発見日       | 2026-01-18                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在の`SkillService.executeSkill`実装にはタイムアウト処理が含まれていない。長時間実行されるスキルや、実行がハングした場合に無限に待ち続けてしまう可能性がある。

### 1.2 問題点・課題

- 長時間実行スキルでUIがフリーズする可能性
- ハングした実行を中断する手段がない
- リソースリーク（メモリ、接続等）のリスク

### 1.3 放置した場合の影響

- ユーザー体験の低下（無限ローディング）
- アプリケーションの応答性低下
- 潜在的なメモリリーク

---

## 2. 何を達成するか（What）

### 2.1 目的

スキル実行にタイムアウト機能を追加し、一定時間経過後に自動的にキャンセルできるようにする。

### 2.2 最終ゴール

- デフォルトタイムアウト（例: 30秒）を設定可能
- スキル単位でタイムアウトをオーバーライド可能
- タイムアウト発生時に適切なエラーを返却
- AbortSignalによる中断サポート

### 2.3 スコープ

#### 含むもの

- AbortController/AbortSignalを使用したタイムアウト実装
- デフォルトタイムアウト設定
- スキル定義でのタイムアウトカスタマイズ
- タイムアウトエラー型の追加

#### 含まないもの

- UI側のキャンセルボタン（別タスクで対応）
- 実行進捗のストリーミング通知（別タスク）

### 2.4 成果物

- タイムアウト機能付き`executeSkill`
- 設定定数（デフォルトタイムアウト値）
- テストケース追加

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- skill-execution-implementation（Phase 1-12）が完了していること

### 3.2 依存タスク

- skill-execution-implementation（完了済み）
- TASK-SKILL-EXEC-LOGIC（実行ロジック実装）が先に完了していることが望ましい

### 3.3 必要な知識

- TypeScript
- AbortController/AbortSignal
- Promise race pattern

### 3.4 推奨アプローチ

```typescript
// AbortSignalを使用したタイムアウト実装
async executeSkill(
  skillId: string,
  params?: Record<string, unknown>,
  options?: { timeout?: number; signal?: AbortSignal }
): Promise<SkillRunResult> {
  const timeout = options?.timeout ?? DEFAULT_SKILL_TIMEOUT;
  const controller = new AbortController();

  // 外部からのAbortSignalをリンク
  if (options?.signal) {
    options.signal.addEventListener('abort', () => controller.abort());
  }

  // タイムアウトタイマー
  const timeoutId = setTimeout(() => {
    controller.abort(new Error('Skill execution timed out'));
  }, timeout);

  try {
    return await this.doExecute(skillId, params, controller.signal);
  } finally {
    clearTimeout(timeoutId);
  }
}
```

---

## 4. 実行手順

### Phase構成

3フェーズ構成（小規模改善）

### Phase 1: 設計

#### 目的

タイムアウト機能の設計を行う

#### 手順

1. `SkillExecuteOptions`型を定義
2. デフォルトタイムアウト値を設定（例: 30000ms）
3. エラー型を追加（`SkillTimeoutError`）

#### 成果物

- 型定義追加
- 設定定数追加

#### 完了条件

- 型定義が完了
- 設定値が定義されている

### Phase 2: 実装

#### 目的

タイムアウト機能を実装する

#### 手順

1. `SkillService.executeSkill`にoptions引数を追加
2. AbortControllerを使用したタイムアウト実装
3. IPC Handlerのオプション対応
4. Preload APIのオプション対応

#### 成果物

- 更新された`SkillService.ts`
- 更新されたIPCハンドラー
- 更新されたPreload API

#### 完了条件

- タイムアウト時にエラーが返却される
- 既存機能が正常に動作する

### Phase 3: テスト・ドキュメント

#### 目的

品質を確認し、ドキュメントを更新する

#### 手順

1. タイムアウトテストケースを追加
2. システム仕様書を更新
3. 実装ガイドを更新

#### 成果物

- テストケース追加
- ドキュメント更新

#### 完了条件

- 全テストがPASS
- ドキュメントが更新されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] デフォルトタイムアウトが設定されている
- [ ] タイムアウト発生時にエラーが返却される
- [ ] カスタムタイムアウト値を指定できる
- [ ] 外部AbortSignalと連携できる

### 品質要件

- [ ] タイムアウトテストケースが追加されている
- [ ] 全テストがPASS

### ドキュメント要件

- [ ] システム仕様書が更新されている

---

## 6. 検証方法

### テストケース

| TC-ID    | テスト内容                 | 期待結果                       |
| -------- | -------------------------- | ------------------------------ |
| TC-T-001 | デフォルトタイムアウト発生 | タイムアウトエラーが返却される |
| TC-T-002 | カスタムタイムアウト       | 指定した時間でタイムアウト     |
| TC-T-003 | タイムアウト前に完了       | 正常結果が返却される           |
| TC-T-004 | AbortSignalによる中断      | 中断エラーが返却される         |

### 検証手順

1. 自動テストを実行
2. 長時間スキルをシミュレートして手動確認

---

## 7. リスクと対策

| リスク                 | 影響度 | 発生確率 | 対策                     |
| ---------------------- | ------ | -------- | ------------------------ |
| 既存機能への影響       | 中     | 低       | 後方互換性を維持         |
| タイムアウト値の最適化 | 低     | 中       | 設定可能にして調整可能に |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-execution-implementation/outputs/phase-12/implementation-guide.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`

### 参考資料

- MDN: AbortController - https://developer.mozilla.org/en-US/docs/Web/API/AbortController

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
長時間実行されるスキルに対するタイムアウト処理が未実装。
```

### 補足事項

- 実行ロジック実装（TASK-SKILL-EXEC-LOGIC）と同時に実装することで効率的
