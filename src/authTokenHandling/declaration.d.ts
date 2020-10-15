/*
  Standard import syntax turns d.ts into local declarations.
  This causes problems even when settings typeRoots. It overrides the
  express d.ts file in the @types library, which then throws lint errors on the library import.

  Removing top-file imports from a d.ts file, and using the import()
  function preserves this file as an ambient/global declaration file.
  This desirably merges namespaces instead of overwriting them

  no modification to tsconfig.json needed.

  More information: https://stackoverflow.com/questions/39040108/import-class-in-definition-file-d-ts
*/

declare namespace Express {
  interface Request {
    verifiedAccessToken: import('./IRequestWithToken');
  }
}
