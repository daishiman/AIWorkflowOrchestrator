# Phase 9: 品質検証 - TASK-9F スキル共有・インポート機能

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase番号  | 9                                              |
| Phase名    | 品質検証                                       |
| 目的       | 定義された品質基準をすべて満たすことを検証する |
| 前提Phase  | Phase 8 (リファクタリング)                     |
| 後続Phase  | Phase 10 (最終レビュー)                        |
| ステータス | 未実施                                         |
| 作成日     | 2026-02-27                                     |
| 機能名     | skill-share                                    |

---

## 目的

定義された品質基準をすべて満たすことを検証する。
静的解析（Lint）、型チェック、セキュリティチェック、テスト最終実行を通じて、Phase 5-8 の実装・リファクタリング結果が品質ゲートを通過することを確認する。

---

## 実行タスク

### タスク1: 静的解析（Lint検証）

**目的**: ESLint エラー・警告を0件にする

**コマンド**:

```bash
pnpm --filter @repo/desktop lint
pnpm --filter @repo/shared lint
```

**チェック項目**:

- [ ] ESLint エラー: 0件
- [ ] ESLint 警告: 0件
- [ ] Prettier フォーマット適用済み
- [ ] 未使用 import が存在しない
- [ ] `any` 型が使用されていない

### タスク2: 型チェック検証

**目的**: TypeScript 型エラーを0件にする

**コマンド**:

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck
```

**チェック項目**:

- [ ] TypeScript コンパイルエラー: 0件
- [ ] 暗黙的 `any` の排除
- [ ] 厳格モード（`strict: true`）準拠
- [ ] P32準拠: `packages/shared/src/types/skill-share.ts` と `apps/desktop/src/preload/types.ts` の型整合性確認
- [ ] ShareTarget ユニオン型の型ガードが正確に動作

### タスク3: セキュリティ検証

**目的**: IPCセキュリティ要件を全て満たしていることを確認する

**検証項目**:

#### 3-1. P42準拠3段バリデーション（全IPCハンドラ）

| ハンドラ                 | 検証対象引数               | 3段バリデーション                |
| ------------------------ | -------------------------- | -------------------------------- |
| `skill:importFromSource` | `source.type`              | typeof → === "" → .trim() === "" |
| `skill:importFromSource` | `source.repo` (github)     | typeof → === "" → .trim() === "" |
| `skill:importFromSource` | `source.gistId` (gist)     | typeof → === "" → .trim() === "" |
| `skill:importFromSource` | `source.localPath` (local) | typeof → === "" → .trim() === "" |
| `skill:importFromSource` | `source.url` (url)         | typeof → === "" → .trim() === "" |
| `skill:export`           | `skillName`                | typeof → === "" → .trim() === "" |
| `skill:export`           | `destination.type`         | typeof → === "" → .trim() === "" |
| `skill:validateSource`   | `source.type`              | typeof → === "" → .trim() === "" |

#### 3-2. パストラバーサル防止検証

- [ ] `source.localPath` が `~/.aiworkflow/skills/` 配下であることを検証
- [ ] `../` を含むパスが拒否される
- [ ] シンボリックリンクによるディレクトリ脱出が拒否される

#### 3-3. Sender検証

- [ ] 全ハンドラで `validateIpcSender` が呼び出されている
- [ ] 不正なウィンドウからのリクエストが拒否される

#### 3-4. エラーサニタイズ確認

- [ ] エラーレスポンスに内部ファイルパスが含まれていない
- [ ] エラーレスポンスにAPIキー・トークンが含まれていない
- [ ] スタックトレースがRenderer側に送信されていない

### タスク4: テスト最終実行

**目的**: 全テストの成功を確認する

**コマンド**:

```bash
# SkillShareManager ユニットテスト
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillShareManager.test.ts

# IPCハンドラテスト
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.share.test.ts

# shared パッケージビルド
pnpm --filter @repo/shared build
```

**チェック項目**:

- [ ] SkillShareManager テスト: 全件パス
- [ ] IPCハンドラテスト: 全件パス
- [ ] shared パッケージ: ビルド成功

### タスク5: 依存関係検証

**目的**: 幽霊依存（P8対策）がないことを確認する

**検証手順**:

1. `apps/desktop/package.json` に Octokit（`@octokit/rest` または `octokit`）が宣言されているか確認
2. `packages/shared/package.json` に新規追加した依存がある場合、宣言されているか確認
3. `pnpm --filter @repo/desktop exec -- node -e "require('@octokit/rest')"` でインポート成功を確認

**チェック項目**:

- [ ] Octokit が `apps/desktop/package.json` の `dependencies` に宣言されている
- [ ] `packages/shared` に追加した依存（該当する場合）が `package.json` に宣言されている
- [ ] `pnpm install` 後に依存解決エラーがない

---

## 参照資料

| 参照資料             | パス                                                                      | 内容                   |
| -------------------- | ------------------------------------------------------------------------- | ---------------------- |
| Phase 5 実装仕様     | `docs/30-workflows/skill-share/phase-5-implementation.md`                 | 品質検証対象の実装範囲 |
| セキュリティ仕様     | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` | IPCセキュリティ検証    |
| IPC仕様              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`      | バリデーション仕様     |
| リファクタ後コード   | `apps/desktop/src/main/services/skill/SkillShareManager.ts`               | Phase 8成果物          |
| リファクタリング記録 | `outputs/phase-8/refactoring-report.md`                                   | Phase 8成果物          |

---

## システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                              | 内容                             |
| --------------------- | --------------------------------------------------------------------------------- | -------------------------------- |
| セキュリティ          | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | IPC Sender検証仕様               |
| IPC仕様               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | チャネル定義・バリデーション     |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | Phase 1-6 IPC契約検証            |
| エラーハンドリング    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | エラーカテゴリ定義               |
| 型定義                | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | ShareTarget/Result型整合性       |
| Preloadセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | contextBridge公開境界の検証      |
| 品質要件              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | テスト品質・非機能要件の最終確認 |

---

## 品質ゲート

### 機能検証

- [ ] SkillShareManager ユニットテスト全件成功
- [ ] IPCハンドラテスト全件成功
- [ ] shared パッケージビルド成功

### コード品質

- [ ] ESLint エラー: 0件
- [ ] ESLint 警告: 0件
- [ ] TypeScript 型エラー: 0件
- [ ] Prettier フォーマット適用済み

### テスト網羅性

- [ ] Line Coverage 80%以上（推奨90%）
- [ ] Branch Coverage 60%以上（推奨70%）
- [ ] Function Coverage 80%以上（推奨90%）

### セキュリティ

- [ ] P42準拠3段バリデーション: 全IPCハンドラで実装済み
- [ ] パストラバーサル防止: 検証済み
- [ ] Sender検証: 全ハンドラで `validateIpcSender` 実装済み
- [ ] エラーサニタイズ: 内部情報漏洩なし

### 依存関係

- [ ] 幽霊依存なし（P8対策）
- [ ] `package.json` に全依存が宣言済み

---

## 統合テスト連携【必須】

品質検証で統合テスト結果を確認:

| 品質項目     | 確認内容                                     | 結果 |
| ------------ | -------------------------------------------- | ---- |
| 機能検証     | SkillShareManager + IPCハンドラ テスト全成功 | -    |
| ビルド検証   | shared パッケージビルド成功                  | -    |
| カバレッジ   | Line 80%+ / Branch 60%+ / Function 80%+      | -    |
| セキュリティ | P42/P44/P45準拠チェック完了                  | -    |
| 依存関係     | 幽霊依存なし                                 | -    |

---

## 実行手順

### Step 1: 静的解析・型チェック

1. タスク1（Lint検証）のコマンドを実行
2. エラーがある場合は修正
3. タスク2（型チェック検証）のコマンドを実行
4. 型エラーがある場合は修正

### Step 2: セキュリティ検証

1. タスク3の検証項目を1件ずつ確認
2. P42準拠3段バリデーションを全ハンドラで確認
3. パストラバーサル防止テストを実行
4. Sender検証を全ハンドラで確認
5. エラーサニタイズを全ハンドラで確認

### Step 3: テスト最終実行

1. タスク4のコマンドを実行
2. 全テストパスを確認
3. カバレッジがPhase 7基準値以上であることを確認

### Step 4: 依存関係検証

1. タスク5の検証手順を実行
2. 幽霊依存がないことを確認

### Step 5: 品質レポート作成

1. 全検証結果を `outputs/phase-9/quality-report.md` に記録
2. 品質ゲートの判定結果を記載

---

## 成果物

| 成果物       | パス                                | 内容         |
| ------------ | ----------------------------------- | ------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質検証結果 |

---

## 品質レポートテンプレート

```markdown
# 品質レポート - Phase 9: TASK-9F スキル共有・インポート機能

## 実行日時

{{DATETIME}}

## 品質ゲート結果

### 機能検証

| 項目                     | 結果      |
| ------------------------ | --------- |
| SkillShareManager テスト | PASS/FAIL |
| IPCハンドラテスト        | PASS/FAIL |
| shared パッケージビルド  | PASS/FAIL |

### コード品質

| 項目                | 結果      |
| ------------------- | --------- |
| ESLint エラー       | 0件 / N件 |
| ESLint 警告         | 0件 / N件 |
| TypeScript 型エラー | 0件 / N件 |
| Prettier適用        | PASS/FAIL |

### テスト網羅性

| 指標     | 結果 | 最低基準 | 推奨基準 | 判定      |
| -------- | ---- | -------- | -------- | --------- |
| Line     | XX%  | 80%      | 90%      | PASS/FAIL |
| Branch   | XX%  | 60%      | 70%      | PASS/FAIL |
| Function | XX%  | 80%      | 90%      | PASS/FAIL |

### セキュリティ

| 項目                  | 結果      |
| --------------------- | --------- |
| P42 3段バリデーション | PASS/FAIL |
| パストラバーサル防止  | PASS/FAIL |
| Sender検証            | PASS/FAIL |
| エラーサニタイズ      | PASS/FAIL |

### 依存関係

| 項目             | 結果      |
| ---------------- | --------- |
| 幽霊依存チェック | PASS/FAIL |
| package.json宣言 | PASS/FAIL |

## 総合判定

{{PASS/FAIL}}

## 次のアクション

Phase 10 へ進行 / 問題修正が必要
```

---

## 完了条件

- [ ] タスク1: ESLint エラー0件、警告0件
- [ ] タスク2: TypeScript 型エラー0件
- [ ] タスク3: セキュリティ検証項目全てパス（P42/パストラバーサル/Sender検証/エラーサニタイズ）
- [ ] タスク4: 全テストパス
- [ ] タスク5: 幽霊依存なし
- [ ] 品質ゲート全項目クリア
- [ ] 品質レポートが `outputs/phase-9/quality-report.md` に出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## スキル100%実行確認【必須】

```bash
# Lint
pnpm --filter @repo/desktop lint
pnpm --filter @repo/shared lint

# 型チェック
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck

# テスト実行
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillShareManager.test.ts
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.share.test.ts

# shared ビルド
pnpm --filter @repo/shared build
```

Phase完了時に `artifacts.json` の Phase 9 ステータスを `completed` に更新すること。

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜5）を100%実行完了
- [ ] 各タスクの完了状態を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` の Phase 9 ステータスを更新

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-share/phase-10-final-review.md`

---

## 備考

- P40対策: テスト実行は `cd apps/desktop && pnpm vitest run` で実行し、プロジェクトルートからは実行しない
- P32対策: 型チェック時は `packages/shared` と `apps/desktop` の両方を検証する
- P8対策: Octokit の `package.json` 宣言を必ず確認する（テスト環境では通るが実行時にモジュール未検出になる）
- セキュリティ検証は手作業での確認も含む（テストだけではカバーしきれない項目がある）
