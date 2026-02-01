# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目      | 内容                                |
| --------- | ----------------------------------- |
| Phase     | 9                                   |
| Phase名   | 品質保証                            |
| カテゴリ  | 品質                                |
| 機能名    | TASK-7D-chatpanel-agent-integration |
| 作成日    | 2026-01-31                          |
| 前提Phase | Phase 5                             |
| 後続Phase | Phase 10                            |

## 目的

定義された品質基準をすべて満たすことを検証する。TypeScript型安全性、Lint、テストカバレッジ、アクセシビリティを包括的に確認する。

## 実行タスク

### タスク1: 自動テスト完全実行

**目的**: 全自動テストの完全成功を確認する。

**手順**:

1. 全テスト実行:
   ```bash
   pnpm --filter @repo/desktop test
   ```
2. 既存テスト57件 + 新規テスト全件がPASSであることを確認する
3. 失敗テストがある場合はPhase 5に戻って修正する

### タスク2: コード品質検証

**目的**: Lint・型チェック・フォーマットの完全クリアを確認する。

**手順**:

1. TypeScript型チェック:
   ```bash
   pnpm --filter @repo/desktop typecheck
   ```
2. ESLint:
   ```bash
   pnpm lint
   ```
3. Prettier:
   ```bash
   pnpm prettier --check "apps/desktop/src/renderer/components/chat/**/*.tsx" "apps/desktop/src/renderer/components/skill/**/*.tsx"
   ```

### タスク3: アクセシビリティ検証

**目的**: WCAG 2.1 AA準拠を確認する。

**手順**:

1. SkillStreamingViewのアクセシビリティ属性を確認する:
   - `role="log"`, `aria-live="polite"`, `aria-label="スキル実行結果"` がストリーミングエリアに設定されている
   - `aria-label="スキル実行を中止する"` が中止ボタンに設定されている
   - `role="status"` がStatusBadgeに設定されている
2. PermissionDialogのフォーカストラップが動作することを確認する
3. キーボードナビゲーション（Tab、Escape）が正常に動作することを確認する

### タスク4: セキュリティ検証

**目的**: Electron固有のセキュリティリスクがないことを確認する。

**手順**:

1. Renderer ProcessからMain Processへの直接アクセスがないことを確認する
2. IPC通信が既存のPreload API（window.skillAPI/window.agentAPI）経由であることを確認する
3. XSS脆弱性がないことを確認する（dangerouslySetInnerHTML未使用等）

## 品質ゲート

| ゲート項目       | 基準                             | 結果       |
| ---------------- | -------------------------------- | ---------- |
| 機能検証         | 全自動テスト成功                 | {{RESULT}} |
| コード品質       | TypeScript/ESLint/Prettierクリア | {{RESULT}} |
| テスト網羅性     | Line 95%+, Branch 85%+           | {{RESULT}} |
| アクセシビリティ | WCAG 2.1 AA準拠                  | {{RESULT}} |
| セキュリティ     | XSS/IPC安全性確認                | {{RESULT}} |

## 統合テスト連携【必須】

| 品質項目   | 確認内容                       | 結果       |
| ---------- | ------------------------------ | ---------- |
| 機能検証   | 全自動テスト成功               | {{RESULT}} |
| 統合テスト | コンポーネント間連携テスト成功 | {{RESULT}} |
| a11yテスト | アクセシビリティテスト成功     | {{RESULT}} |

## 成果物

| 成果物       | パス                                | 種別     |
| ------------ | ----------------------------------- | -------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | document |

## 完了条件

- [ ] 全自動テストがPASS（既存57件 + 新規）
- [ ] TypeScript型チェックがエラーゼロ
- [ ] ESLint/PrettierがPASS
- [ ] Line Coverage 95%以上
- [ ] Branch Coverage 85%以上
- [ ] WCAG 2.1 AAアクセシビリティ確認完了
- [ ] セキュリティ確認完了（XSS/IPC安全性）
- [ ] 品質レポートが出力されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. タスク1: 自動テスト完全実行
2. タスク2: コード品質検証
3. タスク3: アクセシビリティ検証
4. タスク4: セキュリティ検証
5. 成果物の作成・配置
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7D-chatpanel-agent-integration --phase 9
```

## 次のPhase

Phase 10: 最終レビューゲート → [phase-10-final-review.md](phase-10-final-review.md)
