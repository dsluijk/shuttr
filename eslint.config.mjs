// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  rules: {
    "@stylistic/quotes": ["error", "double"],
    "@stylistic/semi": ["error", "always"],
    "@stylistic/arrow-parens": ["error", "always"],
    "@stylistic/comma-dangle": ["error", "always-multiline"],
    "@stylistic/quote-props": ["error", "as-needed"],
    "@stylistic/indent": ["error", 2],
    "@stylistic/indent-binary-ops": ["error", 2],
    "@stylistic/operator-linebreak": [
      "error",
      "before",
      { overrides: { "=": "after" } },
    ],
    "@stylistic/member-delimiter-style": [
      "error",
      {
        multiline: {
          delimiter: "semi",
          requireLast: true,
        },
        singleline: {
          delimiter: "semi",
          requireLast: false,
        },
        multilineDetection: "brackets",
      },
    ],
    "vue/comma-dangle": [
      "error",
      {
        arrays: "always-multiline",
        objects: "always-multiline",
        functions: "always-multiline",
      },
    ],
    "vue/max-attributes-per-line": [
      "error",
      {
        singleline: {
          max: 1,
        },
        multiline: {
          max: 1,
        },
      },
    ],
    "vue/no-unused-vars": [
      "error",
      {
        ignorePattern: "^_",
      },
    ],
    "vue/attribute-hyphenation": ["error", "never"],
    "vue/multi-word-component-names": ["off"],
    "nuxt/nuxt-config-keys-order": ["off"], // Doesn't work properly
  },
});
