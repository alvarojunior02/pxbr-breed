import js from "@eslint/js";
import globals from "globals";

export default [
    {
        ignores: ["node_modules/**", "assets/**"]
    },
    js.configs.recommended,
    {
        files: ["src/js/**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "script",
            globals: {
                ...globals.browser
            }
        },
        rules: {
            /*
             * The frontend uses classic scripts that share functions through
             * the global browser scope. ESLint cannot resolve declarations
             * located in other script files.
             */
            "no-undef": "off",
            "no-unused-vars": "off",
            "no-console": "off"
        }
    },
    {
        files: ["src/scripts/**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "commonjs",
            globals: {
                ...globals.node,
                fetch: "readonly"
            }
        },
        rules: {
            "no-unused-vars": "warn",
            "no-console": "off"
        }
    }
];
