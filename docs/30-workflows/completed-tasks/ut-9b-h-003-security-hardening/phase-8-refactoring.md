# Phase 8: リファクタリング

## メタ情報

| 項目     | 内容                                                |
| -------- | --------------------------------------------------- |
| タスクID | UT-9B-H-003                                         |
| Phase    | 8                                                   |
| タスク名 | SkillCreator IPCセキュリティ強化 - リファクタリング |
| Issue    | #796                                                |
| 作成日   | 2026-02-12                                          |
| 優先度   | 高 (security)                                       |
| 前Phase  | Phase 7: カバレッジ確認                             |

## 目的

TDD の Refactor フェーズとして、テストが全て PASS している状態を維持しながらコード品質を改善する。過度な抽象化を避け、可読性・保守性の向上に焦点を当てる。

## 実行タスク

- Task 1: 配置最適化検討: セキュリティ関数の配置方針を再確認する。
- Task 2: 可読性改善: 正規表現・コメント・命名を統一する。
- Task 3: 重複整理判断: 共通化対象と未タスク化候補を切り分ける。
- Task 4: 回帰確認: 全テストと型チェックの維持を確認する。

### Task 1: validatePath 関数の配置検討

**検討内容**: validatePath を共通ユーティリティに抽出するか

**判断**: skillCreatorHandlers.ts 内に留める

**理由**:

- 現時点での使用箇所は skillCreatorHandlers.ts のみ
- 既に SkillFileManager.ts に類似の validatePath が存在しており、統一は別タスクで行うべき
- スコープが限定的なため、過度な抽象化は不要
- 将来的に他ハンドラーでも使用する場合に抽出する（YAGNI 原則）

**リファクタリング対象（実施する場合）**:

- 関数のJSDocコメントを充実させる（引数・例外・使用例）
- エラークラス `PathTraversalError` を定義して型安全性を高める（要件に応じて）

### Task 2: sanitizeErrorMessage 関数の配置検討

**検討内容**: sanitizeErrorMessage をモジュールレベルの共通関数に抽出するか

**判断**: skillCreatorHandlers.ts 内に留める

**理由**:

- 既に authModeHandlers.ts にも類似実装（`sanitizeErrorMessage`）が存在する
- 2つの実装を共通化するには、両方のハンドラーの要件を統合する設計が必要
- 統合は本タスクのスコープ外（別タスクとして未タスク化を検討）
- 各ハンドラーのサニタイズ要件が微妙に異なる可能性があるため、個別実装が安全

**リファクタリング対象（実施する場合）**:

- 正規表現パターンを名前付き定数に抽出して可読性を向上

```typescript
// Before
message = message.replace(/\/[\w./\\-]+/g, "[path]");

// After
const UNIX_PATH_PATTERN = /\/[\w./\\-]+/g;
const WINDOWS_PATH_PATTERN = /[A-Z]:\\[\w.\\-]+/gi;
const STACK_TRACE_PATTERN = /\n\s+at\s+.*/g;
const SENSITIVE_DATA_PATTERN = /(token|key|password|secret)=\S+/gi;

message = message.replace(UNIX_PATH_PATTERN, "[path]");
```

### Task 3: ALLOWED_SCHEMA_NAMES の定義場所検討

**検討内容**: ALLOWED_SCHEMA_NAMES の定義場所を移動するか

**判断**: skillCreatorHandlers.ts のトップレベル定数として定義を維持

**理由**:

- スキーマ名の検証は validate-schema ハンドラーでのみ使用
- SkillCreatorService 側に定義すると、セキュリティ検証がサービス層に漏れる
- IPCハンドラー層でのセキュリティ検証という原則に合致
- `as const` による型安全性が既に確保されている

**リファクタリング対象（実施する場合）**:

- コメントの充実（各スキーマ名の用途説明）

```typescript
/**
 * 許可されたスキーマ名のホワイトリスト。
 *
 * - "task-spec": タスク仕様スキーマ（SkillCreatorService.validateSchema で使用）
 * - "skill-spec": スキル仕様スキーマ（SkillCreatorService.validateSchema で使用）
 * - "mode": モードスキーマ（SkillCreatorService.validateSchema で使用）
 *
 * 新規スキーマ追加時は以下の手順で更新:
 * 1. ResourceLoader にスキーマファイルを追加
 * 2. この配列にスキーマ名を追加
 * 3. テストにも対応するケースを追加
 */
const ALLOWED_SCHEMA_NAMES = ["task-spec", "skill-spec", "mode"] as const;
```

### Task 4: ハンドラー内の重複コード削減

**検討内容**: 5つのハンドラー共通のパターン（sender検証 → 型検証 → ドメイン検証 → サービス呼び出し → エラーハンドリング）を抽出するか

**判断**: 現状維持（抽出しない）

**理由**:

- 各ハンドラーの引数型・ドメイン検証が異なるため、共通化すると型安全性が低下する
- 過度な抽象化は可読性を損なう
- ハンドラー数が5つと少なく、重複の影響は限定的
- 将来的にハンドラー数が増加した場合に検討する

### Task 5: コードスタイルの統一確認

**確認項目**:

| 項目                     | 基準                                                                 |
| ------------------------ | -------------------------------------------------------------------- |
| 関数の export            | validatePath, sanitizeErrorMessage は非 export（モジュール内部関数） |
| 定数の命名               | UPPER_SNAKE_CASE（ALLOWED_SCHEMA_NAMES）                             |
| エラーメッセージの一貫性 | 全ハンドラーで統一されたメッセージフォーマット                       |
| JSDoc コメント           | 全セキュリティ関数に付与                                             |
| import 文の整理          | 未使用 import がないこと                                             |

## 参照資料

| 資料                      | パス / 場所                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| Phase 1 要件定義          | `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-1-requirements.md`   |
| Phase 2 設計              | `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-2-design.md`         |
| Phase 5 実装              | `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-5-implementation.md` |
| Phase 6 テスト拡充        | `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-6-test-expansion.md` |
| Phase 7 カバレッジ結果    | `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-7-coverage-check.md` |
| セキュリティ実装索引      | `.claude/skills/aiworkflow-requirements/references/security-implementation.md`               |
| セキュリティ設計原則      | `.claude/skills/aiworkflow-requirements/references/security-principles.md`                   |
| IPC セキュリティ仕様      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                 |
| API/Electron セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                 |
| Agent SDK スキルI/F仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`            |
| コード品質ルール          | `.claude/rules/02-code-quality.md`                                                           |
| 既存パス検証              | `apps/desktop/src/main/services/skill/SkillFileManager.ts`                                   |
| 既存エラーサニタイズ      | `apps/desktop/src/main/ipc/authModeHandlers.ts`                                              |

## 統合テスト連携

| 層             | テスト内容                                                        |
| -------------- | ----------------------------------------------------------------- |
| リグレッション | リファクタリング後に全テスト（Phase 4/6）が引き続き PASS すること |
| 既存テスト     | `skillCreatorIpc.integration.test.ts` が引き続き PASS すること    |
| 型チェック     | `pnpm typecheck` が通ること                                       |

## 多角的チェック観点

| 観点       | 仕様参照先                | 確認項目                                            |
| ---------- | ------------------------- | --------------------------------------------------- |
| TDD 原則   | 02-code-quality.md        | テスト全 PASS を維持しながらリファクタリング        |
| コード品質 | 02-code-quality.md        | any 型不使用、strict 型チェック、未使用 import なし |
| YAGNI      | 設計原則                  | 過度な抽象化を避け、現時点で必要な改善のみ実施      |
| 可読性     | development-guidelines.md | 正規表現パターンの名前付き定数化、JSDoc 充実        |

## 既知の Pitfall 対策

| Pitfall                                 | 対策                                                         |
| --------------------------------------- | ------------------------------------------------------------ |
| P11: PostToolUse フックによる Edit 失敗 | リファクタリングは小さな単位で実施し、各ステップでテスト実行 |

## 未タスク化候補

リファクタリング中に発見した改善候補で、本タスクのスコープ外のもの:

| 候補                                      | 優先度 | 理由                                               |
| ----------------------------------------- | ------ | -------------------------------------------------- |
| sanitizeErrorMessage の全ハンドラー共通化 | 中     | authModeHandlers.ts との統合が必要                 |
| validatePath の全ハンドラー共通化         | 中     | SkillFileManager.ts の validatePath との統合が必要 |
| IPCハンドラー共通パターンの抽出           | 低     | ハンドラー数が増加した場合に検討                   |

これらは Phase 10（最終レビュー）または Phase 12（ドキュメント）で未タスク仕様書に変換する。

## 成果物

| 成果物                     | パス                                                |
| -------------------------- | --------------------------------------------------- |
| リファクタリング済みコード | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` |

## 完了条件

- [ ] 正規表現パターンが名前付き定数に抽出されている（sanitizeErrorMessage 内）
- [ ] JSDoc コメントが全セキュリティ関数に付与されている
- [ ] ALLOWED_SCHEMA_NAMES のコメントに各スキーマ名の用途と更新手順が記載されている
- [ ] 未使用の import がないこと
- [ ] 全テスト（Phase 4/6 + 既存 integration）が PASS すること
- [ ] `pnpm typecheck` が通ること
- [ ] `pnpm lint` が通ること
- [ ] 過度な抽象化が行われていないこと（YAGNI 原則準拠）
- [ ] 未タスク化候補がリストアップされていること

## 次Phase

Phase 9: 品質検証 → `phase-9-quality-assurance.md`
