# RepoFluent agent instructions

## Mandatory source-file layout

- These rules apply to all frontend and backend production code, test code, and generated code committed to the repository.
- Every named type must have its own source file. This includes classes, abstract classes, records, structs, interfaces, enums, delegates, and TypeScript type aliases.
- A source file MUST NOT declare more than one named type, including nested types.
- A named type MUST NOT be split across multiple source files. Do not introduce partial types.
- Name each type's file after the type, using the language's established filename convention.
- Do not use container classes or namespaces-as-classes to group multiple type declarations. Use the language namespace/module system and imports instead.
- Declaration-free barrel files may re-export types, but the declarations themselves must remain in their individual files.

## Angular components

- Every Angular component MUST use three separate, adjacent files: a `.ts` class file, an `.html` template file, and an `.scss` stylesheet file.
- Component metadata MUST reference the external files with `templateUrl` and `styleUrl`/`styleUrls`.
- Inline `template`, `styles`, or `style` metadata is prohibited, even for short or empty content.
- Keep the three component filenames on the same basename (for example, `lesson-page.component.ts`, `.html`, and `.scss`).

## Change checklist

- Before finishing a change, scan every changed source file for multiple type declarations.
- When adding or changing an Angular component, verify that its TypeScript, HTML, and SCSS files all exist and that no template or style content is inline.
- Run the affected backend and frontend builds and tests after structural refactors.
