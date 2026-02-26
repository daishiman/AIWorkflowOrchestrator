# [#777] "[UT-FIX-7-1-003] IPC レスポンスパターン統一"

## メタ情報

```yaml
task_id: UT-FIX-7-1-003
task_name: IPC レスポンスパターン統一
category: リファクタリング
target_feature: スキル管理 IPC ハンドラー
priority: 低
scale: 中規模
status: 未実施
source_phase: -
created_date: 2026-02-11
dependencies: []
spec_path: /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260209-202059-wt2/docs/30-workflows/completed-tasks/unassigned-task/task-ut-fix-7-1-003-ipc-response-pattern-unification.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在の skillHandlers.ts では、エラーハンドリングに2つの異なるパターンが混在している：

1. **成功/失敗オブジェクトパターン**: `{ success: true, data } / { success: false, error }`
2. **throw パターン**: `throw toIPCValidationError(validation)` または `throw { code, message }`

また、サービス層では Result<T, E> パターンが推奨されているが（02-code-quality.md）、IPC 層との統合が不明確である。

### 1.2 問題点・課題

- 同一ファイル内でエラーハンドリングパターンが混在
- Renderer 側でのエラー処理が複雑化（try-catch と success チェックの両方が必要）
- 新規ハンドラー追加時にどちらのパターンを使うべきか不明確
- パターンの選択基準がドキュメント化されていない

### 1.3 放置した場合の影響

- エラーハンドリングの一貫性が損なわれる
- バグの温床になる（Renderer側でのエラー検出漏れ）
- 新規開発者の学習コスト増大
- コードレビューでの指摘が増加

---

## 2. 何を達成するか（What）

### 2.1 目的

skillHandlers.ts 内のエラーハンドリングパターンを統一し、明確なガイドラインを策定する。

### 2.2 最終ゴール

- 全ハンドラーで統一されたエラーハンドリングパターンが使用されている
- パターン選択の基準がドキュメント化されている
- Renderer 側でのエラー処理が簡潔化されている

### 2.3 スコープ

#### 含むもの

- skillHandlers.ts 内のパターン統一
- エラーハンドリングガイドラインの策定
- 必要に応じて Preload/Renderer 側の修正

#### 含まないもの

- 他の IPC ハンドラーファイルの修正（別タスクとして検出）
- Result<T, E> パターンのサービス層全体への導入
- エラーコード体系の全面見直し

### 2.4 成果物

| 成果物                             | パス                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| 統一済み skillHandlers.ts          | `apps/desktop/src/main/ipc/skillHandlers.ts`                                         |
| IPC エラーハンドリングガイドライン | `.claude/skills/aiworkflow-requirements/references/ipc-error-handling-guidelines.md` |
| 更新済みテスト                     | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                          |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION が完了していること
- エラーハンドリングポリシーの決定

### 3.2 依存タスク

| タスクID                              | 依存内容             |
| ------------------------------------- | -------------------- |
| TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION | 対象コードの実装完了 |

### 3.3 必要な知識

- Electron IPC エラーハンドリング
- TypeScript Result パターン
- Preload API 設計

### 3.4 システム仕様書参照

| 仕様書                    | 参照セクション                     |
| ------------------------- | ---------------------------------- |
| `02-code-quality.md`      | エラーハンドリング原則             |
| `error-handling.md`       | Result<T, E> パターン              |
| `04-electron-security.md` | IPC セキュリティ、エラーサニタイズ |

### 3.5 実装課題と解決策（TASK-FIX-7-1からの学び）

TASK-FIX-7-1-EXECUTE-SKILL-DELEGATIONの実装で遭遇した課題と解決策を記録する。
このタスクを実行する際の参考情報として活用すること。

#### 課題1: SkillExecutionResponse型の設計

| 観点   | 内容                                                                                            |
| ------ | ----------------------------------------------------------------------------------------------- |
| 問題   | IPC層（skillHandlers.ts）とサービス層（SkillExecutor.ts）で使用する型が異なる                   |
| 解決策 | SkillExecutorの型を正本とし、IPC層で型変換を実施。SkillMetadata型への変換ロジックを明示的に分離 |
| 参照   | `interfaces-agent-sdk-executor.md` - 型変換パターン                                             |

#### 課題2: Result<T, E> vs throw の混在

| 観点   | 内容                                                                                                    |
| ------ | ------------------------------------------------------------------------------------------------------- |
| 問題   | SkillService.executeSkill()はthrow、SkillExecutor.execute()はSkillExecutionResponseを返すパターンが混在 |
| 解決策 | 今回はSkillExecutorの戻り値をそのまま返す形に統一。将来的にResult<T, E>パターンへの完全移行を検討       |
| 参照   | `error-handling.md` - Result<T, E>パターン                                                              |

#### 課題3: エラーコードの一貫性

| 観点   | 内容                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------ |
| 問題   | SkillExecutionErrorCodeとIPCエラーコードの対応関係が不明確                                       |
| 解決策 | SkillExecutionErrorCodeを正本とし、IPC層ではそのまま使用。将来的にマッピングテーブルの作成を検討 |
| 参照   | `error-handling.md` - エラーカテゴリ                                                             |

#### システム仕様書参照

| 仕様書                                    | 参照セクション         | 適用内容                |
| ----------------------------------------- | ---------------------- | ----------------------- |
| `interfaces-agent-sdk-executor.md`        | SkillExecutionResponse | レスポンス型定義        |
| `error-handling.md`                       | エラーカテゴリ         | エラーコード範囲        |
| `architecture-implementation-patterns.md` | 型変換パターン         | IPC層変換               |
| `lessons-learned.md`                      | 型変換                 | Skill→SkillMetadata変換 |

### 3.6 推奨アプローチ

#### 統一パターン案

**推奨: 成功/失敗オブジェクトパターンへの統一**

理由：

- Electron IPC では throw したエラーがシリアライズの問題を起こす可能性がある
- Preload 層の safeInvoke で一貫してエラーをハンドリングできる
- Renderer 側でのエラー判定が明確（`if (!result.success)`）

```typescript
// 統一パターン
type IPCResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

// ハンドラー実装
ipcMain.handle(IPC_CHANNELS.SKILL_LIST, async (event) => {
  const validation = validateIpcSender(event, ...);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
      code: "IPC_VALIDATION_ERROR",
    };
  }

  try {
    const result = await skillService.scanAvailableSkills();
    return { success: true, data: result.skills };
  } catch (error) {
    return {
      success: false,
      error: isError(error) ? error.message : "Unknown error",
      code: "INTERNAL_ERROR",
    };
  }
});
```

#### 移行対象

| 現在のパターン                 | 変更後                                   |
| ------------------------------ | ---------------------------------------- |
| `throw toIPCValidationError()` | `return { success: false, error, code }` |
| `throw { code, message }`      | `return { success: false, error, code }` |
| 暗黙の throw（catch なし）     | try-catch で wrap                        |

---

## 4. 実行手順

### Phase構成

標準 Phase 1-13 に従う。

### Phase 2: 設計

#### 目的

パターン選択の決定とガイドライン策定

#### 手順

1. 現在のパターン使用状況を整理
2. 統一パターンを決定（成功/失敗オブジェクト推奨）
3. IPCResult<T> 型定義の設計
4. ガイドラインドキュメントの構成決定

### Phase 5: 実装

#### 手順

1. IPCResult<T> 型を定義（既存 types.ts に追加）
2. skillHandlers.ts の throw パターンを成功/失敗オブジェクトに変換
3. 全ハンドラーで一貫したパターンを適用
4. Preload 側の safeInvoke でエラー処理を確認
5. ガイドラインドキュメント作成

### Phase 4/6: テスト

#### 手順

1. エラーケースのテストを更新（throw → success: false）
2. 新しいレスポンス形式でアサーション更新
3. Renderer 側の統合テストでエラー処理を検証

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 全ハンドラーが IPCResult<T> パターンを使用している
- [ ] throw パターンが除去されている（validation エラー含む）
- [ ] エラーコードが全エラーレスポンスに含まれている

### 品質要件

- [ ] 既存テストが全て PASS（レスポンス形式の更新含む）
- [ ] Lint エラーなし
- [ ] 型エラーなし

### ドキュメント要件

- [ ] IPC エラーハンドリングガイドラインが作成されている
- [ ] パターン選択の理由が記載されている

---

## 6. 検証方法

### テストケース

| #   | テストケース             | 期待結果                                           |
| --- | ------------------------ | -------------------------------------------------- |
| 1   | IPC バリデーションエラー | `{ success: false, code: "IPC_VALIDATION_ERROR" }` |
| 2   | サービス層エラー         | `{ success: false, code: "INTERNAL_ERROR" }`       |
| 3   | スキル未発見エラー       | `{ success: false, code: "SKILL_NOT_FOUND" }`      |
| 4   | 正常系                   | `{ success: true, data: {...} }`                   |

### 検証手順

1. `pnpm test apps/desktop/src/main/ipc/__tests__/skillHandlers*` を実行
2. 全テストが PASS することを確認
3. 開発サーバーでエラーケースを手動検証
4. DevTools で IPC レスポンスのフォーマットを確認

---

## 7. リスクと対策

| リスク                      | 影響度 | 発生確率 | 対策                                   |
| --------------------------- | ------ | -------- | -------------------------------------- |
| Renderer 側のエラー処理破綻 | 高     | 中       | Preload の safeInvoke で吸収           |
| 既存テストの大量修正        | 中     | 高       | sed/正規表現で一括置換                 |
| エラー情報の欠落            | 中     | 低       | エラーコードと詳細メッセージを両方返す |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント           | パス                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| コード品質ルール       | `.claude/rules/02-code-quality.md`                                    |
| エラーハンドリング仕様 | `.claude/skills/aiworkflow-requirements/references/error-handling.md` |
| Electron セキュリティ  | `.claude/rules/04-electron-security.md`                               |

### 参考資料

- Electron IPC ベストプラクティス
- TypeScript Result パターン実装例
- TASK-FIX-5-1 safeInvoke パターン

---

## 9. 備考

### 発見経緯

```
TASK-FIX-7-1 Phase 12 コード品質確認:
skillHandlers.ts 内で throw パターンと { success, data/error } パターンが混在。
- L57, L79: throw toIPCValidationError()
- L63, L108, 他: return { success: false, error }
02-code-quality.md の Result<T, E> パターン推奨に関連し、統一が必要と判断。
```

### 補足事項

- この統一は skillHandlers.ts を対象とするが、成功した場合は他の IPC ハンドラーにも展開を検討
- safeInvoke パターン（TASK-FIX-5-1）との整合性を考慮
- エラーコード体系は既存の SkillExecutionErrorCode を参考に拡張

### 代替案

**throw パターンへの統一**も検討可能だが、以下の理由から非推奨：

- Electron IPC でのシリアライズ問題
- Preload 層での try-catch が必須になる
- エラー情報の構造化が困難
