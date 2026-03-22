# Phase 7 成果物: カバレッジ目標

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| タスクID   | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001            |
| Phase      | 7                                                            |
| 成果物種別 | カバレッジ目標                                               |
| 作成日     | 2026-03-22                                                   |
| 依存成果物 | phase-4/test-matrix.md, phase-6/regression-expansion-plan.md |

---

## 1. カバレッジ基準（プロジェクト標準）

| 指標              | 最低基準 | 推奨基準 | 基準元             |
| ----------------- | -------- | -------- | ------------------ |
| Line Coverage     | 80%      | 90%      | 02-code-quality.md |
| Branch Coverage   | 60%      | 70%      | 02-code-quality.md |
| Function Coverage | 80%      | 90%      | 02-code-quality.md |

---

## 2. 対象ファイル別カバレッジ目標

### 2.1 packages/shared/src/types/handoff.ts

| 指標              | 最低基準 | 推奨基準 | 理由                                                                 |
| ----------------- | -------- | -------- | -------------------------------------------------------------------- |
| Line Coverage     | 90%      | 95%      | adapter 関数は全パスが短く網羅が容易                                 |
| Branch Coverage   | 70%      | 80%      | capability 3パス (guidance-only / terminal-handoff / integrated-api) |
| Function Coverage | 90%      | 100%     | `toHandoffGuidance` 1関数のみ、全条件網羅が必須                      |

**必須カバーブランチ**:

- `capability === "guidance-only"` パス (UT-A-1〜3)
- `capability === "terminal-handoff"` パス (UT-A-4〜5)
- `capability === "integrated-api"` パス (UT-A-6)
- `guidance: undefined` の fallback パス (UT-A-2)
- `reason: undefined` の fallback パス (UT-A-5)

**P41 対策** (v8 カバレッジプロバイダのインライン関数):

- `toHandoffGuidance` 内の条件式のコールバックは明示的にテストから呼び出すこと

---

### 2.2 apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts

| 指標              | 最低基準 | 推奨基準 | 理由                                                             |
| ----------------- | -------- | -------- | ---------------------------------------------------------------- |
| Line Coverage     | 80%      | 90%      | `buildForSurface()` + `buildContextSummary()` の 2メソッド       |
| Branch Coverage   | 60%      | 70%      | surfaceType の 3パス (agent / skill / docs) + バリデーション分岐 |
| Function Coverage | 80%      | 90%      | public メソッドは全て対象。private は間接テストで可              |

**必須カバーブランチ**:

- `surfaceType === "agent"` パス
- `surfaceType === "skill"` パス
- `surfaceType === "docs"` パス
- `suggestedCommand === ""` のバリデーションエラーパス (EC-1-1)
- `suggestedCommand.trim() === ""` のバリデーションエラーパス (EC-1-2)
- `bundle.launcher?.reason` が `undefined` の fallback パス

---

### 2.3 apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts

| 指標              | 最低基準 | 推奨基準 | 理由                                                           |
| ----------------- | -------- | -------- | -------------------------------------------------------------- |
| Line Coverage     | 80%      | 90%      | `resolve()` の 3capability パス                                |
| Branch Coverage   | 60%      | 70%      | guidance-only / terminal-handoff / integrated-api + エラーパス |
| Function Coverage | 80%      | 90%      | `resolve()` メソッドの全パスカバー                             |

**必須カバーブランチ**:

- `capability === "integrated-api"` パス (IT-B-3)
- `capability === "guidance-only"` パス (IT-B-1)
- `capability === "terminal-handoff"` パス (IT-B-2)
- `resolver が例外をスロー` エラーパス (IT-B-4)
- `toHandoffGuidance()` が `null` を返すパス (integrated-api 経由なのでこのパスへの到達は防止すること)

---

### 2.4 apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/index.tsx

| 指標              | 最低基準 | 推奨基準 | 理由                                                |
| ----------------- | -------- | -------- | --------------------------------------------------- |
| Line Coverage     | 80%      | 90%      | copy / dismiss の 2操作 + null render パス          |
| Branch Coverage   | 60%      | 70%      | `handoffGuidance != null` 分岐 + copy 成功/失敗分岐 |
| Function Coverage | 80%      | 90%      | P41 対策: clipboard callback も検証対象             |

**必須カバーブランチ**:

- `handoffGuidance != null` のレンダーパス (UT-B-1〜4)
- `handoffGuidance === null` の null render パス (UT-B-5)
- copy ボタンクリック時の `navigator.clipboard.writeText` 呼び出し (UT-B-3)
- dismiss ボタンクリック時の `onDismiss` 呼び出し (UT-B-4)

**P41 対策**: v8 カバレッジプロバイダは `onClick={() => navigator.clipboard.writeText(terminalCommand)}` のような インライン arrow function を独立関数としてカウントする。テストで明示的に `mockWriteText.mock.calls[0]` の呼び出しを確認すること。

---

### 2.5 apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx

| 指標              | 最低基準 | 推奨基準 | 理由                                               |
| ----------------- | -------- | -------- | -------------------------------------------------- |
| Line Coverage     | 80%      | 90%      | capability 5状態 × CTA 組み合わせ                  |
| Branch Coverage   | 60%      | 70%      | 5capability パス + handoff 分岐 + Task06 stub 分岐 |
| Function Coverage | 80%      | 90%      | レンダー関数 + ハンドラ関数の全テスト              |

**必須カバーブランチ**:

- `handoffGuidance != null && capability === "handoff"/"terminal-handoff"` → `TerminalHandoffCard` パス (MN-3 対応)
- `capability === "guidance-only"` → `GuidanceBlock` パス (MN-3 対応)
- `capability === "terminalSurface"` → launcher CTA stub パス (Task06 placeholder)
- `capability === "none" && hasResolutionAction === true` → blocked パス (REG-B-1)
- `capability === "none" && hasResolutionAction === false` → unavailable パス (REG-B-2)

---

### 2.6 apps/desktop/src/main/services/runtime/assertNoSilentFallback.ts (新規)

| 指標              | 最低基準 | 推奨基準 | 理由                          |
| ----------------- | -------- | -------- | ----------------------------- |
| Line Coverage     | 90%      | 100%     | 防御関数は全パスカバーが必須  |
| Branch Coverage   | 70%      | 80%      | スロー/非スローの全組み合わせ |
| Function Coverage | 100%     | 100%     | 1関数のみ                     |

**必須カバーブランチ** (P62 対策):

- `capability === "none" && uiState === "ready"` → エラースロー (UT-C-1)
- `capability === "none" && uiState !== "ready"` → 正常 (UT-C-2, UT-C-4)
- `capability !== "none"` → 正常 (UT-C-3)

---

## 3. カバレッジ計測コマンド

```bash
# packages/shared のカバレッジ計測
cd packages/shared && pnpm vitest run --coverage src/types/handoff

# apps/desktop のカバレッジ計測（対象ファイル指定）
cd apps/desktop && pnpm vitest run --coverage \
  src/main/services/runtime/TerminalHandoffBuilder \
  src/main/services/runtime/assertNoSilentFallback \
  src/main/services/skill/SkillDocsCapabilityResolver \
  src/renderer/components/organisms/TerminalHandoffCard \
  src/renderer/components/organisms/ExecutionEnvironment

# カバレッジレポート確認
open coverage/index.html
```

---

## 4. 未達時の対処フロー

```
カバレッジ計測
  ↓
Branch Coverage < 60% ?
  ├─ YES → Phase 6 に戻って境界ケーステスト追加 (edge-case-matrix.md 参照)
  └─ NO ↓
Function Coverage < 80% ?
  ├─ YES → P41 確認: インライン arrow function のテスト追加
  └─ NO ↓
Line Coverage < 80% ?
  ├─ YES → 未到達行を特定して追加テスト作成
  └─ NO → Phase 8 (リファクタリング) へ
```

---

## 5. Task06 依存テストのカバレッジ除外設定

REG-M2-1〜4 は `.skip` でマークするため、Task06 依存コードのカバレッジは現時点では低くなる。これは意図的な除外であり、Phase 7 のカバレッジ基準の対象外とする。

```typescript
// vitest.config.ts での除外設定例（Task06 完成後に削除）
coverage: {
  exclude: [
    // Task06 依存の Terminal Dock セッション管理（stub のみ実装）
    "**/TerminalDock/**",
  ],
}
```
