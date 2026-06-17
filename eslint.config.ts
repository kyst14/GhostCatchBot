import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import path from 'path'
import tseslint from 'typescript-eslint'

export default defineConfig([
	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
		plugins: { js },
		extends: ['js/recommended'],
		languageOptions: { globals: globals.node },
	},
	{
		files: ['**/*.ts'],
		languageOptions: {
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: path.resolve(),
			},
		},
	},
	{
		ignores: ['dist', 'node_modules'],
	},
	...tseslint.configs.recommended,
])
