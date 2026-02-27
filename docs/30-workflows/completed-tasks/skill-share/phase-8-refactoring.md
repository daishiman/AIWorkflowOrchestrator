# Phase 8: リファクタリング（TDD: Refactor） - TASK-9F スキル共有・インポート機能

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase番号  | 8                                  |
| Phase名    | リファクタリング                   |
| 目的       | 動作を変えずにコード品質を改善する |
| 前提Phase  | Phase 7 (カバレッジ確認)           |
| 後続Phase  | Phase 9 (品質検証)                 |
| ステータス | 未実施                             |
| 作成日     | 2026-02-27                         |
| 機能名     | skill-share                        |

---

## 目的

TDD の Refactor フェーズとして、動作を変えずにコード品質を改善する。
Phase 4-7 で作成・拡充したテストが継続成功することを確認しながら、SkillShareManager およびIPCハンドラのリファクタリングを行う。

---

## 実行タスク

### タスク1: コードスメル検出・改善点特定

**目的**: SkillShareManager と関連ファイルの改善すべき箇所を特定する

**対象ファイル**:

| ファイル          | パス                                                        | 確認内容                                                   |
| ----------------- | ----------------------------------------------------------- | ---------------------------------------------------------- |
| SkillShareManager | `apps/desktop/src/main/services/skill/SkillShareManager.ts` | メインサービスの全メソッド                                 |
| IPCハンドラ       | `apps/desktop/src/main/ipc/skillHandlers.share.ts`          | skill:importFromSource, skill:export, skill:validateSource |
| 共有型定義        | `packages/shared/src/types/skill-share.ts`                  | ShareTarget, ImportResult, ExportResult                    |

**チェック観点**:

- [ ] 重複コードの有無（importFromGitHub / importFromGist / importFromUrl / importFromLocal 間の共通処理）
- [ ] メソッドの長さ（20行以上は分割検討）
- [ ] 循環複雑度（10以上は分割検討）
- [ ] 命名の適切さ（P45準拠: 引数名がセマンティクスと一致しているか）
- [ ] 単一責任原則の遵守（1メソッド1責務）
- [ ] Magic number の有無（サイズ制限値、リトライ回数、タイムアウト値）

### タスク2: Strategy Pattern 適用検討

**目的**: importFrom\* メソッド群に Strategy Pattern を適用し、共通インターフェースを抽出する

**実行手順**:

1. 各インポートメソッド（importFromGitHub, importFromGist, importFromUrl, importFromLocal）の共通処理を分析
2. 共通インターフェースの抽出可否を判断
3. Strategy Pattern 適用が有効な場合のみ実施（過剰な抽象化は避ける）

**判断基準**:

| 条件                                         | 判断       |
| -------------------------------------------- | ---------- |
| 4メソッド間で3行以上の共通処理が存在         | 適用を検討 |
| 各メソッドが独立したロジックで共通点が少ない | 適用しない |
| 今後のソース種別追加が計画されている         | 適用を検討 |

**適用する場合のインターフェース設計**:

```typescript
interface ImportStrategy {
  validate(source: ShareTarget): Promise<{ valid: boolean; error?: string }>;
  fetch(source: ShareTarget): Promise<SkillFiles>;
  install(skillName: string, files: SkillFiles): Promise<ImportResult>;
}
```

### タスク3: 共通バリデーションロジックの抽出

**目的**: IPCハンドラとサービス層で重複するバリデーションロジックを共通化する

**対象パターン**:

- P42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）の共通化
- ShareTarget の type 別フィールド検証の共通化
- パストラバーサル検証の共通化

**実行手順**:

1. 各ハンドラ（skill:importFromSource, skill:export, skill:validateSource）のバリデーションコードを比較
2. 共通パターンをユーティリティ関数に抽出
3. 抽出後に各ハンドラから呼び出しを差し替え
4. テスト実行で動作が変わらないことを確認

### タスク4: エラーハンドリングパターンの統一

**目的**: Result<T, E> パターンに基づくエラーハンドリングの統一

**確認項目**:

- [ ] SkillShareManager の全メソッドが Result<T, E> パターンで戻り値を返している
- [ ] エラーコードがエラーカテゴリ（Validation: 1000-1999, Business: 2000-2999, External: 3000-3999）に準拠
- [ ] GitHub API エラー（rate limit, 認証失敗, 404）が External Service Error（3000-3999）にマッピング
- [ ] ファイルシステムエラーが Infrastructure Error（4000-4999）にマッピング
- [ ] エラーメッセージにパスワード・APIキー・内部パスが含まれていない

### タスク5: Magic Number の定数化

**目的**: コード内のハードコード値を定数に抽出する

**対象候補**:

| ハードコード値           | 定数名                   | 配置先            |
| ------------------------ | ------------------------ | ----------------- |
| スキルサイズ制限（10MB） | `MAX_SKILL_SIZE_BYTES`   | SkillShareManager |
| リトライ最大回数         | `MAX_RETRY_COUNT`        | SkillShareManager |
| リトライ初期待機時間     | `INITIAL_RETRY_DELAY_MS` | SkillShareManager |
| GitHub API タイムアウト  | `GITHUB_API_TIMEOUT_MS`  | SkillShareManager |
| Gist API タイムアウト    | `GIST_API_TIMEOUT_MS`    | SkillShareManager |

### タスク6: テスト継続成功確認

**目的**: リファクタリング後も全テストが通ることを確認する

**コマンド**:

```bash
# SkillShareManager テスト
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillShareManager.test.ts

# IPCハンドラテスト
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.share.test.ts

# shared パッケージビルド確認
pnpm --filter @repo/shared build
```

**確認項目**:

- [ ] SkillShareManager のユニットテスト全件パス
- [ ] IPCハンドラのバリデーションテスト全件パス
- [ ] カバレッジがPhase 7の基準値を下回っていない（Line 80%+, Branch 60%+, Function 80%+）

---

## 参照資料

| 参照資料           | パス                                                                                        | 内容                           |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 1 要件定義   | `docs/30-workflows/skill-share/phase-1-requirements.md`                                     | 受け入れ条件との動作同等性確認 |
| Phase 2 設計       | `docs/30-workflows/skill-share/phase-2-design.md`                                           | 設計制約（責務分離・依存方向） |
| Phase 6 テスト拡充 | `docs/30-workflows/skill-share/phase-6-test-expansion.md`                                   | 回帰対象の追加テスト観点       |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Strategy, DI パターン          |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | Result<T,E>パターン            |
| 開発ガイドライン   | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | コーディング規約               |
| 実装コード         | `apps/desktop/src/main/services/skill/SkillShareManager.ts`                                 | Phase 5成果物                  |
| カバレッジレポート | `outputs/phase-7/coverage-final-report.md`                                                  | Phase 7成果物                  |

---

## システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                                        | 内容                          |
| ------------------ | ------------------------------------------------------------------------------------------- | ----------------------------- |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Strategy Pattern, DI パターン |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | Result<T,E> パターン定義      |
| 開発ガイドライン   | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | SOLID原則、クリーンコード規約 |
| 型定義             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | ShareTarget系の契約維持確認   |

---

## 統合テスト連携【必須】

リファクタ後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillShareManager.test.ts
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.share.test.ts
```

| 確認項目                     | 結果 |
| ---------------------------- | ---- |
| SkillShareManager テスト成功 | -    |
| IPCハンドラテスト成功        | -    |
| shared ビルド成功            | -    |
| カバレッジ維持               | -    |

---

## 実行手順

### Step 1: コードスメル検出

1. タスク1のチェック観点に基づき、対象ファイルを確認
2. 改善点を `outputs/phase-8/refactoring-report.md` に記録
3. 改善優先順位を決定（重複コード > Magic number > 命名改善 > パターン適用）

### Step 2: リファクタリング実施

1. 各リファクタリングを小さな単位で実施（1変更1コミット推奨）
2. 各変更後にテストを実行（タスク6のコマンド）
3. テストが失敗した場合は変更を取り消し、別のアプローチを検討

### Step 3: 最終確認

1. 全テスト実行で継続成功を確認
2. カバレッジがPhase 7基準値以上であることを確認
3. リファクタリングレポートを完成

---

## リファクタリングチェックリスト

### SOLID原則

- [ ] **S**: 単一責任 — SkillShareManager の各メソッドが単一の責任を持つ
- [ ] **O**: 開放閉鎖 — 新しいインポートソース追加時に既存コードを修正せずに拡張可能
- [ ] **L**: リスコフ置換 — Strategy Pattern 適用時に各Strategy が共通インターフェースを完全に実装
- [ ] **I**: インターフェース分離 — 不要な依存がない（ImportStrategy が過大でない）
- [ ] **D**: 依存性逆転 — Octokit 等の外部依存が抽象に依存している

### クリーンコード

- [ ] 意図が明確な命名（P45準拠: セマンティクスに合致する引数名）
- [ ] 短いメソッド（20行以下推奨）
- [ ] 低い循環複雑度（10以下推奨）
- [ ] 適切なコメント（Why を説明、What は省略）
- [ ] Magic number の定数化完了

---

## 成果物

| 成果物                   | パス                                                        | 内容               |
| ------------------------ | ----------------------------------------------------------- | ------------------ |
| リファクタ後コード       | `apps/desktop/src/main/services/skill/SkillShareManager.ts` | 改善後の実装       |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md`                     | 変更内容と判断記録 |

---

## 完了条件

- [ ] タスク1: コードスメルが検出・記録されている
- [ ] タスク2: Strategy Pattern の適用判断が記録されている（適用/不適用の理由を明記）
- [ ] タスク3: 共通バリデーションロジックの抽出が完了（または不要と判断した理由を記録）
- [ ] タスク4: エラーハンドリングが Result<T, E> パターンに統一されている
- [ ] タスク5: Magic number が定数化されている
- [ ] タスク6: 全テストが継続成功している
- [ ] カバレッジがPhase 7基準値（Line 80%+, Branch 60%+, Function 80%+）を維持
- [ ] SOLID原則チェックリスト全項目確認済み
- [ ] クリーンコードチェックリスト全項目確認済み
- [ ] リファクタリングレポートが `outputs/phase-8/refactoring-report.md` に出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## スキル100%実行確認【必須】

```bash
# テスト実行で動作変更がないことを確認
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillShareManager.test.ts
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.share.test.ts

# カバレッジ確認
cd apps/desktop && pnpm vitest run --coverage src/main/services/skill/SkillShareManager.ts

# shared パッケージビルド
pnpm --filter @repo/shared build
```

Phase完了時に `artifacts.json` の Phase 8 ステータスを `completed` に更新すること。

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜6）を100%実行完了
- [ ] 各タスクの完了状態を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` の Phase 8 ステータスを更新

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-share/phase-9-quality-assurance.md`

---

## 備考

- Strategy Pattern の適用は「過剰な抽象化」にならない範囲で判断する。4メソッド間で共通処理が3行未満であれば適用しない
- リファクタリングでファイル分割を行う場合、テストファイルのimportパスも更新が必要
- P45準拠: リファクタリング中に引数名のセマンティクス不一致を発見した場合は修正する（skillId → skillName 等）
- 各変更は小さな単位で行い、変更後は必ずテストを実行すること
