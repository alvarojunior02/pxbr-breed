import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        files: ["js/**/*.js", "scripts/**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "script",
            globals: {
                window: "readonly",
                document: "readonly",
                localStorage: "readonly",
                console: "readonly",
                alert: "readonly",
                confirm: "readonly",
                fetch: "readonly",
                FileReader: "readonly",
                Blob: "readonly",
                URL: "readonly"
            }
        },
        rules: {
            "no-unused-vars": "warn",
            "no-undef": "warn",
            "no-console": "off"
        }
    }
];
