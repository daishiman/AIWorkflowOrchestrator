# 完了タスク記録 — 2026-04-08

> 親ファイル: [task-workflow-completed.md](task-workflow-completed.md)

---

### タスク: UT-SKILL-WIZARD-W2-seq-03a SkillCreateWizard オーケストレーション更新（2026-04-08）

| 項目       | 値                                                                  |
| ---------- | ------------------------------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03a                                          |
| ステータス | **完了（Phase 12 完了 / Phase 13 blocked）**                        |
| タイプ     | UI implementation / wizard redesign / orchestration                 |
| 優先度     | 高                                                                  |
| 完了日     | 2026-04-08                                                          |
| 対象       | `SkillCreateWizard.tsx` / `GenerateStep.tsx` / `CompleteStep.tsx`   |
| 成果物     | `docs/30-workflows/completed-tasks/W2-seq-03a-skill-create-wizard/` |
| PR         | 未作成（Phase 13 blocked）                                          |

#### 実施内容

**SkillCreateWizard.tsx（オーケストレーション更新）**

- テンプレート生成モード（`generationMode: 'template'`）を廃止し、LLM専用化
- `formData` / `answers` / `smartDefaults` / `skillPath` の state を追加
- `inferSmartDefaults()`: 大小文字不問の推論（purpose 文字列を toLowerCase() してから includes() 判定）
  - slack / github / notion → 外部連携ツール判定
  - scheduled → スケジュール判定
  - code → フォーマット判定
- `handleStep0Next()`: Step 0 フォーム送信 → SmartDefault 推論 → Step 1 遷移
- `handleGenerate(method)`: LLM 生成実行（generationLockRef + isGenerating で二重呼び出し防止）
- `handleRetry()`: `formData` 保持 + `answers` / `skillPath` / `generationError` リセット

**GenerateStep.tsx**

- `generationMode` prop 廃止
- 再入防止: `generationLockRef`（useRef）+ `isGenerating`（useState）の二重ガード
  - useRef: レンダリング非同期に安全（即時参照可能）
  - useState: UI表示制御（ボタン disabled など）

**CompleteStep.tsx**

- `skillPath` 表示を追加（生成されたスキルのファイルパスを完了画面に表示）
- `hasExternalIntegration` / `externalToolName` の条件付き表示
  - 外部連携（Slack / GitHub / Notion）がある場合のみ外部連携セクションを表示

**テスト整備**

- `SkillCreateWizard.W2-seq-03a.test.tsx`: W2-seq-03a 専用テスト追加
- `SkillCreateWizard.store-integration.test.tsx`: Store 統合テスト更新
- `GenerateStep.test.tsx` / `CompleteStep.test.tsx`: コンポーネント単体テスト更新

#### 検証証跡

- `pnpm --filter @repo/desktop typecheck`: PASS
- `pnpm --filter @repo/desktop exec eslint src/renderer/components/skill/SkillCreateWizard.tsx src/renderer/components/skill/wizard/GenerateStep.tsx src/renderer/components/skill/wizard/CompleteStep.tsx`: PASS
- `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillCreateWizard.W2-seq-03a.test.tsx src/renderer/components/skill/__tests__/SkillCreateWizard.store-integration.test.tsx src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx`: PASS
- Phase 12 成果物: `outputs/phase-12/` 6ファイル作成・同期済み

#### 苦戦箇所

| #   | 苦戦箇所                                  | 解決策                                                                |
| --- | ----------------------------------------- | --------------------------------------------------------------------- |
| 1   | `inferSmartDefaults()` の大小文字不問対応 | `toLowerCase()` してから `includes()` で判定                          |
| 2   | `handleGenerate` の二重呼び出し防止       | `generationLockRef`（useRef）+ `isGenerating`（useState）の二重ガード |
| 3   | `handleRetry` でどの state を保持すべきか | ユーザー入力（`formData`）を保持し生成結果のみリセット                |

#### Phase 12 未タスク（非ブロッカー）

- `resolveExternalIntegration()` のツール名対応表を定数に切り出す（改善候補）
- テスト名の「復帰」「やり直し」「リトライ」表現を統一（改善候補）
- Phase 11 証跡スクリーンショットの命名規則（TC-11-xx-...形式）の明文化（改善候補）

詳細は `outputs/phase-12/skill-feedback-report.md` を参照。

#### 依存関係

- 先行: W0-seq-01（SkillInfoFormData 型定義）/ W0-seq-02（inferSmartDefaults 実装）/ W1-par-02a（SkillInfoStep）/ W1-par-02d（LifecyclePanel ウィザード遷移）
- 後続: W3-seq-04（Skill生成実行処理）

#### lessons-learned

- `references/lessons-learned-skill-wizard-redesign.md` を参照
