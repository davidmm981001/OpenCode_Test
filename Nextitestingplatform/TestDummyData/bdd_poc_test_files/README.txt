Test package for frontend upload POC.

Included files:
- requirements-specification.md
- AuthController.cs
- AuthService.cs
- LoginValidator.cs
- LoginRequest.cs
- LoginResult.cs

Suggested upload test:
1. Upload the requirement file.
2. Upload all code files.
3. Send them to the n8n webhook.
4. Verify that the generated BDD includes:
   - successful login
   - empty email/password validations
   - invalid email format
   - invalid credentials
   - inactive account
   - lock after 5 failed attempts
   - locked account
