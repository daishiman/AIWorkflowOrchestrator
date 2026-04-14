# Phase 1 成果物: 要件定義書

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## 機能要件

### FR-1: ラジオボタンUI削除

- Step 0（SkillInfoStep）からテンプレート/LLM選択のラジオボタンを完全除去する
- `data-testid="generation-mode-selector"` 要素がDOMに存在しないこと

### FR-2: generationMode state廃止

- `const [generationMode, setGenerationMode] = useState<GenerationMode>("template")` を削除する
- ファイル内に `generationMode` の参照が残存しないこと

### FR-3: hasActivatedLlmMode state廃止

- `const [hasActivatedLlmMode, setHasActivatedLlmMode] = useState(false)` を削除する
- ファイル内に `hasActivatedLlmMode` の参照が残存しないこと

### FR-4: Step 1スキップ禁止

- `handleStep0Next` がStep 1（ConversationRoundStep）へ直接遷移すること
- `goToStep(2)` の直接呼び出しがStep 0の遷移ハンドラに存在しないこと

### FR-5: 正規フローの確立

- Step 0 → Step 1 → Step 2 → Step 3 の順序でウィザードが進行すること
- Step 1（Q1〜Q6インタビュー）がスキップされないこと

## 非機能要件

### NFR-1: 後方互換性

- 既存テスト（SkillCreateWizard.test.tsx）が全件PASSすること
- SkillInfoStep.tsxのprops型変更が既存コンポーネント利用に影響しないこと

### NFR-2: コード品質

- TypeScript型エラーが0件であること
- ESLintエラーが0件であること

### NFR-3: 副作用なし

- 削除した機能以外のウィザード動作（生成・完了・リトライ等）が変化しないこと
