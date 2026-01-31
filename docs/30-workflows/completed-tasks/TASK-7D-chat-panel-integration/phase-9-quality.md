# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目      | 内容                           |
| --------- | ------------------------------ |
| Phase     | 9                              |
| Phase名   | 品質保証                       |
| カテゴリ  | 品質                           |
| 機能名    | TASK-7D-chat-panel-integration |
| 作成日    | 2026-01-30                     |
| 前提Phase | Phase 8                        |
| 後続Phase | Phase 10                       |

## 目的

Phase 8 までの実装に対して、コード品質、セキュリティ、パフォーマンス、アクセシビリティの総合的な品質保証を実施する。

## 実行タスク

### タスク1: コード品質チェック

**目的**: 実装コードがプロジェクトの品質基準を満たしていることを確認する。

**手順**:

1. ESLint を全対象ファイルに対して実行する:

```bash
pnpm --filter @repo/desktop lint
```

2. Prettier フォーマットチェックを実行する:

```bash
pnpm --filter @repo/desktop format:check
```

3. TypeScript 型チェックを実行する:

```bash
pnpm --filter @repo/desktop typecheck
```

4. 以下のコード品質観点を手動で確認する:
   - `any` 型が使用されていないこと
   - マジックナンバーが定数化されていること
   - コンポーネント名がファイル名と一致していること
   - 不要な `console.log` が残っていないこと

**期待される成果物**:

- コード品質チェック結果（`outputs/phase-9/code-quality-report.md`）

### タスク2: セキュリティチェック

**目的**: 実装コードにセキュリティ上の問題がないことを確認する。

**手順**:

1. SkillStreamingView を以下の観点で確認する:
   - XSS 脆弱性: `dangerouslySetInnerHTML` を使用していないこと
   - ユーザー入力のサニタイズ: streamingMessages の内容をそのまま HTML として出力していないこと（React の自動エスケープを利用）
   - `pre` タグ内のコンテンツが適切にエスケープされていること
2. ChatPanel を以下の観点で確認する:
   - イベントハンドラが安全であること（クロスサイトスクリプティング等）
   - Store から取得したデータの型検証が行われていること

**期待される成果物**:

- セキュリティチェック結果（`outputs/phase-9/security-check-report.md`）

### タスク3: アクセシビリティ最終確認

**目的**: WCAG 2.1 AA 準拠が達成されていることを最終確認する。

**手順**:

1. 以下の ARIA 属性が正しく設定されていることを確認する:

| コンポーネント           | 属性         | 値                       |
| ------------------------ | ------------ | ------------------------ |
| ストリーミング表示エリア | `role`       | `"log"`                  |
| ストリーミング表示エリア | `aria-live`  | `"polite"`               |
| ストリーミング表示エリア | `aria-label` | `"スキル実行結果"`       |
| 中止ボタン               | `aria-label` | `"スキル実行を中止する"` |
| StatusBadge              | `role`       | `"status"`               |

2. 色覚依存していないことを確認する:
   - StatusBadge のステータスが色だけでなくラベルテキストでも識別できること
   - tool_result の成功/失敗が色だけでなくアイコン（✅/❌）でも識別できること

3. キーボード操作可能性を確認する:
   - 中止ボタンが Tab キーでフォーカス可能であること
   - ToolExecutionHistory の `<details>` が Enter/Space で開閉可能であること

**期待される成果物**:

- アクセシビリティチェック結果（`outputs/phase-9/accessibility-check-report.md`）

### タスク4: 既存機能影響確認

**目的**: ChatPanel の修正が既存のチャット機能に影響を与えていないことを確認する。

**手順**:

1. 既存の StreamingMessage テスト（162 テスト）が全て PASS であることを確認する:

```bash
pnpm --filter @repo/desktop vitest run apps/desktop/src/renderer/components/chat/__tests__/StreamingMessage.test.tsx
```

2. 既存の SkillSelector テストが全て PASS であることを確認する:

```bash
pnpm --filter @repo/desktop vitest run apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx
```

3. 既存の PermissionDialog テストが全て PASS であることを確認する:

```bash
pnpm --filter @repo/desktop vitest run apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx
```

4. 既存の SkillImportDialog テストが全て PASS であることを確認する:

```bash
pnpm --filter @repo/desktop vitest run apps/desktop/src/renderer/components/skill/__tests__/SkillImportDialog.test.tsx
```

**期待される成果物**:

- 既存テスト実行結果ログ（全 PASS）

### タスク5: 全テスト一括実行

**目的**: プロジェクト全体のテストスイートが PASS であることを確認する。

**手順**:

1. 全テストを一括実行する:

```bash
pnpm --filter @repo/desktop vitest run
```

2. 全テストが PASS であることを確認する
3. 失敗するテストがある場合は原因を特定し修正する

**期待される成果物**:

- 全テスト一括実行結果ログ

## 参照資料

| 参照資料           | パス                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| 品質基準           | `.claude/skills/task-specification-creator/references/quality-standards.md`    |
| セキュリティ仕様   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`   |
| UI/UX デザイン原則 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` |

## 統合テスト連携

### このフェーズで確認すべき統合テスト観点

| カテゴリ           | 確認項目                                                       |
| ------------------ | -------------------------------------------------------------- |
| リグレッション     | 既存 162 テスト（StreamingMessage）が全て PASS であること      |
| 既存コンポーネント | SkillSelector/PermissionDialog/SkillImportDialog テストが PASS |
| プロジェクト全体   | @repo/desktop の全テストが PASS であること                     |

## 多角的観点チェック

### Renderer（フロントエンド）層

| 観点                   | 確認項目                                                       |
| ---------------------- | -------------------------------------------------------------- |
| セキュリティ           | XSS 脆弱性（dangerouslySetInnerHTML 不使用）が確認されているか |
| アクセシビリティ       | WCAG 2.1 AA の全 ARIA 属性が正しく設定されているか             |
| 既存機能リグレッション | StreamingMessage 162 テスト等の既存テストが全て PASS であるか  |

## 成果物

| 成果物                   | パス                                            | 種別     |
| ------------------------ | ----------------------------------------------- | -------- |
| コード品質レポート       | `outputs/phase-9/code-quality-report.md`        | document |
| セキュリティレポート     | `outputs/phase-9/security-check-report.md`      | document |
| アクセシビリティレポート | `outputs/phase-9/accessibility-check-report.md` | document |

## 完了条件

- [ ] ESLint がエラーゼロで通る
- [ ] Prettier フォーマットが適用されている
- [ ] TypeScript 型チェックがエラーゼロで通る
- [ ] `any` 型が使用されていない
- [ ] XSS 脆弱性がないことが確認されている
- [ ] ARIA 属性が全て正しく設定されている
- [ ] 色覚依存していないことが確認されている
- [ ] 既存テスト（StreamingMessage 162 テスト）が全て PASS
- [ ] 既存テスト（SkillSelector/PermissionDialog/SkillImportDialog）が全て PASS
- [ ] プロジェクト全体のテストが全て PASS
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: コード品質チェック
3. タスク2: セキュリティチェック
4. タスク3: アクセシビリティ最終確認
5. タスク4: 既存機能影響確認
6. タスク5: 全テスト一括実行
7. 統合テスト連携の実施
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-7D-chat-panel-integration --phase 9
```

## 次のPhase

Phase 10: 最終レビューゲート → [phase-10-final-review.md](phase-10-final-review.md)
