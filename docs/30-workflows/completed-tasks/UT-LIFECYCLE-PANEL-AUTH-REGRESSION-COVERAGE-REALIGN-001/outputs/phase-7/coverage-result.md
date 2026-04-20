# coverage-result.md

## Phase 7: カバレッジ結果

### targeted run

- コマンド: `pnpm --filter @repo/desktop exec vitest run --reporter=verbose src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx`
- 結果: `21 tests / 21 passed`

### 保証点カバレッジ

| 保証点                             | 対応テスト                    | 判定 |
| ---------------------------------- | ----------------------------- | ---- |
| rapid click で `auth:login` 非発火 | `TC-06`                       | PASS |
| rerender で `auth:login` 非発火    | `TC-07`                       | PASS |
| `onOpenSkillWizard` 非発火         | `TC-GUARD-01a`                | PASS |
| `onOpenWizard` 非発火              | `TC-GUARD-01b`                | PASS |
| `handleSessionStartNew` 非発火     | `TC-GUARD-01c`                | PASS |
| mount / unmount 境界               | `AUTH-REGRESS-INTEGRATION-02` | PASS |

### 判定

AC-002, AC-003, AC-004, AC-006 を満たす targeted coverage を確認した。
