# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 8                                 |
| Phase名    | リファクタリング（TDD: Refactor） |
| タスクID   | TASK-9A                           |
| 前提Phase  | Phase 7（カバレッジ確認）         |
| 後続Phase  | Phase 9（品質保証）               |
| ステータス | 未着手                            |
| 作成日     | 2026-02-26                        |
| 機能名     | TASK-9A-skill-editor              |

---

## 目的

TDD の Refactor フェーズとして、テストを維持しながらスキルエディター機能全体（SkillFileManager / IPCハンドラー / SkillEditor UI）のコード品質を向上させる。
重複コードの抽出、SOLID原則の適用、命名の統一を実施し、保守性を改善する。

## 背景

Phase 5〜7 で実装した3つのサブタスク（TASK-9A-A: SkillFileManager、TASK-9A-B: IPCハンドラー、TASK-9A-C: SkillEditor UI）は、各レイヤーで類似のバリデーション・エラーハンドリングパターンを繰り返している。
統合的なリファクタリングにより、レイヤー横断での品質向上と今後の機能拡張時の保守性を確保する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: SkillFileManager の重複コード分析・抽出

**目的**: SkillFileManager内のバックアップ作成ロジックとバリデーションロジックの重複を特定・抽出する

**実行手順**:

1. `apps/desktop/src/main/services/skill/SkillFileManager.ts` を読み込む
2. バックアップ作成ロジックの重複箇所を特定する
3. パスバリデーションロジックの重複箇所を特定する
4. SRP（単一責務原則）の観点でファイル操作とバックアップ管理の分離を検討する
5. 抽出・分離する場合は実装し、全テストがパスすることを確認する
6. 分離しない場合はその理由を記録する

**分析観点**:

| 観点                       | 確認内容                                                                |
| -------------------------- | ----------------------------------------------------------------------- |
| バックアップロジック重複   | writeFile/deleteFile/restoreBackup で同一のバックアップ作成処理がないか |
| パスバリデーション重複     | 各メソッドで同一の安全パス検証処理が繰り返されていないか                |
| SRP適用                    | ファイル操作とバックアップ管理が1クラスに混在していないか               |
| エラーハンドリングパターン | 各メソッドのcatchブロックで同一パターンが繰り返されていないか           |

**判断基準**:

| 判断     | 条件                                                              |
| -------- | ----------------------------------------------------------------- |
| 抽出する | 3行以上の完全に同一のコードブロックが4箇所以上ある場合            |
| 分離する | バックアップ管理のメソッドが4つ以上あり独立した責務を形成する場合 |
| 見送る   | 抽出・分離すると可読性が低下し、テストの保守コストが増加する場合  |

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/ --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-8/skillfilemanager-refactoring-analysis.md`

---

### タスク2: IPCハンドラー3段バリデーションの共通化

**目的**: 6つのファイル編集IPCハンドラーに共通する3段バリデーション（型チェック → 空文字列 → トリム空文字列）を共通関数に抽出する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillFileHandlers.ts` の6ハンドラーを読み込む
2. 各ハンドラーの `validateIpcSender` → パスバリデーション → try/catch パターンを分析する
3. P42準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が各ハンドラーで重複していないか確認する
4. 共通バリデーション関数の抽出可否を判断する
5. 抽出する場合は実装し、全テスト（65テスト）がパスすることを確認する

**抽出候補**:

```typescript
// Before: 各ハンドラーで繰り返されるパターン
if (typeof skillName !== "string" || skillName.trim() === "") {
  throw { code: "VALIDATION_ERROR", message: "..." };
}
if (typeof filePath !== "string" || filePath.trim() === "") {
  throw { code: "VALIDATION_ERROR", message: "..." };
}

// After: 共通バリデーション関数（検討）
function validateStringArg(value: unknown, argName: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: `${argName} must be a non-empty string`,
    };
  }
  return value.trim();
}
```

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillFileHandlers --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-8/ipc-validation-commonization.md`

---

### タスク3: パストラバーサル防止ロジックの抽出

**目的**: 複数箇所に散在するパストラバーサル防止ロジックを共通ユーティリティとして抽出する

**実行手順**:

1. `SkillFileManager.ts` と `skillFileHandlers.ts` でパストラバーサル防止ロジックの使用箇所を特定する
2. `validatePath` 関数の呼び出しパターンが統一されているか確認する
3. パス正規化（`path.normalize`）→ ベースディレクトリ内判定 → 結果返却の3ステップが各箇所で一貫しているか確認する
4. 不統一箇所がある場合は共通化し、全テストがパスすることを確認する

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run --reporter=verbose --grep "path traversal"
```

**期待される成果物**:

- `outputs/phase-8/path-traversal-extraction.md`

---

### タスク4: SkillEditorコンポーネントの状態管理最適化

**目的**: SkillEditorコンポーネントの状態管理が Zustand 設計原則（個別セレクタベース）に準拠していることを確認・改善する

**実行手順**:

1. `apps/desktop/src/renderer/components/skill/SkillEditor.tsx` を読み込む
2. `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx` を読み込む
3. `apps/desktop/src/renderer/store/slices/skillSlice.ts` の状態管理パターンを確認する
4. 以下の観点で改善ポイントを特定する

**状態管理チェックリスト**:

| チェック項目             | 確認内容                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------- |
| 個別セレクタ使用         | 合成Store Hook（`useXxxStore()`）ではなく個別セレクタを使用しているか（P31対策）   |
| useEffect依存配列        | アクション関数を依存配列に含める場合、個別セレクタ経由で取得しているか             |
| useState適切使用         | コンポーネント固有のUI状態（フォーム入力、モーダル開閉）にuseStateを使用しているか |
| 不要な再レンダリング防止 | Store全体の一括分割代入をしていないか                                              |
| ファイルツリー状態管理   | ファイルツリーのexpand/collapse状態がパフォーマンスに影響していないか              |

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/ --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-8/skill-editor-state-optimization.md`

---

### タスク5: 命名規則・型定義統一確認

**目的**: スキルエディター機能の全ファイルで命名規則と型定義が統一されていることを確認する

**実行手順**:

1. 全対象ファイルの命名パターンを確認する
2. P45対策として、IPCハンドラーの引数名が実際の値のセマンティクスと一致しているか確認する
3. boolean変数に `is`/`has`/`can`/`should` プレフィックスが使われているか確認する
4. 全テストがパスすることを確認する

**命名規則チェックリスト**:

| チェック項目         | 基準                                                     |
| -------------------- | -------------------------------------------------------- |
| 型名                 | PascalCase（例: `SkillReadFileArgs`）                    |
| 関数名               | camelCase（例: `readFile`）                              |
| 定数名               | UPPER_SNAKE_CASE（例: `SKILL_READ_FILE`）                |
| boolean変数          | `is`/`has`/`can`/`should` プレフィックス                 |
| 引数名セマンティクス | 実際の値と一致（P45対策: skillId→skillName等の乖離なし） |

**対象ファイル**:

| ファイル                                                         | 確認内容             |
| ---------------------------------------------------------------- | -------------------- |
| `apps/desktop/src/main/services/skill/SkillFileManager.ts`       | サービス層命名       |
| `apps/desktop/src/main/ipc/skillFileHandlers.ts`                 | IPCハンドラー命名    |
| `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`     | UIコンポーネント命名 |
| `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx` | UIコンポーネント命名 |
| `apps/desktop/src/renderer/store/slices/skillSlice.ts`           | Store命名            |
| `apps/desktop/src/preload/skill-api.ts`                          | Preload API命名      |
| `apps/desktop/src/preload/types.ts`                              | 型定義命名           |

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-8/naming-type-unification.md`

---

## 参照資料

| 参照資料                 | パス                                                             | 内容                   |
| ------------------------ | ---------------------------------------------------------------- | ---------------------- |
| SkillFileManager         | `apps/desktop/src/main/services/skill/SkillFileManager.ts`       | サービス層実装         |
| IPCハンドラー            | `apps/desktop/src/main/ipc/skillFileHandlers.ts`                 | Main Processハンドラー |
| SkillEditor UI           | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`     | UIコンポーネント       |
| SkillCodeEditor          | `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx` | コードエディター       |
| Skill Store              | `apps/desktop/src/renderer/store/slices/skillSlice.ts`           | 状態管理               |
| Preload API              | `apps/desktop/src/preload/skill-api.ts`                          | Preload API実装        |
| Preload型定義            | `apps/desktop/src/preload/types.ts`                              | 型定義                 |
| テストファイル           | `apps/desktop/src/main/ipc/__tests__/skillFileHandlers*.test.ts` | IPCテスト              |
| Phase 1 要件成果物       | `outputs/phase-1/`                                               | 要件・受入基準         |
| Phase 2 設計成果物       | `outputs/phase-2/`                                               | 設計仕様               |
| Phase 5 実装成果物       | `outputs/phase-5/`                                               | 実装サマリー           |
| Phase 6 テスト成果物     | `outputs/phase-6/`                                               | 拡張テスト・カバレッジ |
| Phase 7 カバレッジ成果物 | `outputs/phase-7/`                                               | カバレッジ判定結果     |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                        | 内容             |
| ---------------- | ------------------------------------------------------------------------------------------- | ---------------- |
| セキュリティ原則 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC セキュリティ |
| コード品質基準   | `.claude/rules/02-code-quality.md`                                                          | 品質ルール       |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | DIパターン、品質 |
| 状態管理ルール   | `.claude/rules/03-state-management.md`                                                      | Zustand設計原則  |

---

## 成果物

| 成果物                     | パス                                                       | 内容                        |
| -------------------------- | ---------------------------------------------------------- | --------------------------- |
| SkillFileManagerリファクタ | `outputs/phase-8/skillfilemanager-refactoring-analysis.md` | 重複分析・抽出結果          |
| IPCバリデーション共通化    | `outputs/phase-8/ipc-validation-commonization.md`          | 3段バリデーション共通化結果 |
| パストラバーサル抽出       | `outputs/phase-8/path-traversal-extraction.md`             | パス検証ロジック抽出結果    |
| SkillEditor状態最適化      | `outputs/phase-8/skill-editor-state-optimization.md`       | 状態管理改善結果            |
| 命名・型定義統一           | `outputs/phase-8/naming-type-unification.md`               | 命名規則・型統一確認結果    |

---

## 統合テスト連携

> リファクタ後の統合テスト継続成功を確認する

| 確認項目                    | 基準                                    |
| --------------------------- | --------------------------------------- |
| 全ユニットテスト            | 100% パス                               |
| IPCハンドラーテスト（65件） | 全テストケースPASS                      |
| UIコンポーネントテスト      | SkillEditor/SkillCodeEditor全テストPASS |
| SkillFileManagerテスト      | サービス層テスト全件PASS                |
| セキュリティテスト          | パストラバーサル・sender検証PASS        |
| カバレッジ維持              | リファクタ前と同等以上                  |

---

## TDD検証

### TDD サイクル確認

```bash
# リファクタリング中は継続的にテスト実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillFileHandlers --watch
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/ --watch
```

**確認項目**:

- [ ] リファクタリング後もIPCハンドラーテスト（65件）が全て成功する
- [ ] リファクタリング後もSkillFileManagerテストが全て成功する
- [ ] リファクタリング後もUIコンポーネントテストが全て成功する

---

## 完了条件

- [ ] SkillFileManagerの重複コード分析と抽出判断（実施または見送り理由記録）が完了している
- [ ] IPCハンドラーの3段バリデーション共通化判断が完了している
- [ ] パストラバーサル防止ロジックの統一確認が完了している
- [ ] SkillEditorコンポーネントの状態管理がZustand設計原則に準拠している
- [ ] 命名規則・型定義が全ファイルで統一されている
- [ ] 全てのテストがパスしている
- [ ] カバレッジがリファクタ前と同等以上である

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認
- [ ] テストが継続してGreen状態であることを確認

---

## 依存関係

- **前提**: Phase 7 が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9A-skill-editor/phase-9-quality-assurance.md`
