# Security Tests Summary

## Created Test Files

| Test Category  | Location                                                               | Cases |
| -------------- | ---------------------------------------------------------------------- | ----- |
| iframe sandbox | `apps/desktop/src/renderer/security/__tests__/iframe-sandbox.test.tsx` | 15    |
| CSP            | `apps/desktop/src/renderer/security/__tests__/csp.test.tsx`            | 20    |

## Security Test Coverage

### iframe sandbox Tests

- **sandbox属性の存在確認**
  - sandbox属性が設定されている
  - 空文字列でない

- **禁止されるsandbox機能**
  - allow-scripts 禁止
  - allow-popups 禁止
  - allow-top-navigation 禁止
  - allow-forms 禁止
  - allow-modals 禁止
  - allow-pointer-lock 禁止
  - allow-downloads 禁止

- **許可されるsandbox機能**
  - allow-same-origin 許可

- **攻撃シナリオ防御**
  - スクリプト実行防止
  - ポップアップ防止
  - 親ウィンドウナビゲーション防止
  - フォーム送信防止
  - alert/confirm/prompt防止

### CSP Tests

- **CSPディレクティブ**
  - script-src 'none'
  - connect-src 'none'
  - form-action 'none'
  - frame-ancestors 'none'
  - base-uri 'none'
  - object-src 'none'
  - default-src 'self'
  - style-src (unsafe-inline許可)
  - img-src (data:, https:許可)

- **攻撃シナリオ防御**
  - 外部スクリプト読み込み防止
  - インラインスクリプト防止
  - データ送信防止
  - フォーム送信防止
  - ベースURLハイジャック防止

## Test Status

All tests are in **Red** state (failing) as per TDD Phase 4 requirements.

## Run Commands

```bash
# Run security tests
pnpm --filter @repo/desktop test -- security
pnpm --filter @repo/desktop test -- iframe-sandbox
pnpm --filter @repo/desktop test -- csp
```
