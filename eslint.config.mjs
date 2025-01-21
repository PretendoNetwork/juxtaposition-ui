/* eslint-disable import/no-unresolved -- We don't care about resolving imports */
// @ts-check

import eslint from '@eslint/js';
import eslintCommentPlugin from '@eslint-community/eslint-plugin-eslint-comments/configs';
import stylisticPlugin from '@stylistic/eslint-plugin';
// @ts-expect-error importPlugin is not typed
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';
import globals from 'globals';

/**
 * Typed to any as the type is incompatible for some reason - it works!
 * @type {any}
 */
const stylisticConfig = stylisticPlugin.configs.customize({
	indent: 'tab',
	quotes: 'single',
	semi: true,
	commaDangle: 'never',
	braceStyle: '1tbs'
});

/**
 * Typed to any as the type is incompatible for some reason - it works!
 * @type {any}
 */
const eslintCommentPluginConfig = eslintCommentPlugin.recommended;

export default tseslint.config(
	{
		// https://eslint.org/docs/rules/
		extends: [eslint.configs.recommended],
		rules: {
			'require-atomic-updates': 'off', // This rule is widely controversial and causes false positives
			'no-console': 'off',
			'prefer-const': 'error',
			'no-var': 'error',
			'no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^ignore' }
			],
			'one-var': ['error', 'never']
		}
	},
	{
		// https://typescript-eslint.io/rules/
		extends: [tseslint.configs.recommended],
		files: ['**/*.ts', '**/*.d.ts'],
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_' }
			],
			'@typescript-eslint/no-inferrable-types': 'off',
			'@typescript-eslint/explicit-function-return-type': 'error',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-empty-object-type': ['off'],
			'@typescript-eslint/no-import-type-side-effects': 'error',
			'@typescript-eslint/consistent-type-imports': ['error', {
				fixStyle: 'separate-type-imports'
			}]
		}
	},
	{
		// https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/
		extends: [eslintCommentPluginConfig],
		rules: {
			'@eslint-community/eslint-comments/disable-enable-pair': ['error', { allowWholeFile: true }],
			'@eslint-community/eslint-comments/require-description': 'error'
		}
	},
	{
		// https://eslint.style/rules
		extends: [stylisticConfig],
		rules: {
			'@stylistic/no-extra-semi': 'error',
			'@stylistic/yield-star-spacing': ['error', 'after'],
			'@stylistic/operator-linebreak': ['error', 'after', { overrides: { '?': 'before', ':': 'before' } }],
			'@stylistic/curly-newline': ['error', {
				multiline: true,
				consistent: true
			}],
			'@stylistic/object-curly-newline': ['error', {
				multiline: true,
				consistent: true
			}]
		}
	},
	{
		// https://www.npmjs.com/package/eslint-plugin-import
		extends: [importPlugin.flatConfigs.recommended, importPlugin.flatConfigs.warnings],
		rules: {
			'import/order': ['warn', {
				'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
				'newlines-between': 'never'
			}],
			'import/first': 'error',
			'import/consistent-type-specifier-style': ['error', 'prefer-top-level']
		}
	},
	{
		// https://www.npmjs.com/package/eslint-plugin-import - but specifically for TypeScript
		extends: [importPlugin.flatConfigs.typescript],
		files: ['**/*.ts', '**/*.d.ts'],
		settings: {
			'import/resolver': {
				typescript: {
					alwaysTryTypes: true,
					project: './tsconfig.json'
				},
				node: true
			}
		}
	},
	{
		// Allow browser globals in webfiles
		languageOptions: {
			globals: {
				...globals.browser,
				Pjax: false // loaded from pjax.min.js
			}
		},
		files: ['src/webfiles/**/*.js']
	},
	{
		// Rules that apply to the 3DS (CTR) and Wii U (Portal) browsers
		files: ['src/webfiles/ctr/**/*.js', 'src/webfiles/portal/**/*.js'],
		rules: {
			'no-var': 'off' // 3DS and Wii U browsers need to use var
		},
		languageOptions: {
			globals: {
				...globals.browser,
				wiiuBrowser: false,
				wiiuSound: false,
				wiiuMainApplication: false,
				wiiuErrorViewer: false,
				wiiuMemo: false,
				wiiuDialog: false,
				wiiu: false,
				cave: false,
				Olv: false
			}
		}
	},
	{
		// Add node.js globals to files outside of the webfiles directory
		languageOptions: {
			globals: {
				...globals.node,
				...globals.builtin
			}
		},
		ignores: ['src/webfiles/**/*.js']
	},
	{
		ignores: [
			'scripts/*',
			'dist/*',
			'**/*.min.js'
		]
	}
);
