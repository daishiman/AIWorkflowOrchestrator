// ESLint config for Next.js 16 backend
// eslint-config-next@16+ natively supports ESLint flat config
import nextConfig from "eslint-config-next/core-web-vitals";

const config = [
  ...nextConfig,
  {
    ignores: [
      "**/__tests__/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      ".next/**",
      "out/**",
      "node_modules/**",
      "coverage/**",
      "next-env.d.ts",
    ],
  },
];

export default config;
