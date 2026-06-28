import nextConfig from "eslint-config-next"

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      ".open-next/**",
      ".wrangler/**",
      "node_modules/**",
      "cloudflare-env.d.ts",
      "next-env.d.ts",
    ],
  },
  ...nextConfig,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
]

export default eslintConfig
