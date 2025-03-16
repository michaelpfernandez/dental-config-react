# Security Policy

## Known Development Dependencies Issues

### Current Status (as of March 16, 2025)

The following security notices are for **development dependencies only** and do not affect the production build or deployed application.

#### High Severity

1. **nth-check < 2.0.1**
   - Dependency Path: react-scripts → @svgr/webpack → nth-check
   - Impact: Development environment only
   - Status: To be addressed in next maintenance cycle
   - Risk Level: Low (no production impact)

#### Moderate Severity

1. **postcss < 8.4.31**

   - Dependency Path: react-scripts → resolve-url-loader → postcss
   - Impact: Development environment only
   - Status: To be addressed in next maintenance cycle
   - Risk Level: Low (no production impact)

2. **esbuild <= 0.24.2**
   - Dependency Path: vitest → vite-node → esbuild
   - Impact: Local development server only
   - Status: To be addressed in next maintenance cycle
   - Risk Level: Low (affects local development only)

### Action Plan

1. **Short Term**

   - Continue development as these issues don't affect production
   - Monitor for updates to react-scripts and vitest

2. **Medium Term**

   - Update development dependencies when compatible versions are available
   - Run full test suite after updates
   - Verify build process integrity

3. **Long Term**
   - Implement regular dependency audits
   - Consider alternative build tools if issues persist

## Reporting Security Issues

If you discover a security vulnerability in this project, please follow these steps:

1. **Do Not** open a public GitHub issue
2. Contact the project maintainers directly
3. Provide detailed information about the vulnerability
4. Allow reasonable time for response and resolution

## Production Security

The dental application implements several security measures:

1. Authentication and authorization
2. Protected routes
3. Action-based permissions
4. Secure data handling

These core security features are unaffected by the development dependency issues listed above.
