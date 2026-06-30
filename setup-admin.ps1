$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/setup-admin" -Method POST
Write-Host "Resultado: $($response.mensaje)"
Write-Host "Hash generado: $($response.hash)"
Write-Host ""
Write-Host "Credenciales para login:"
Write-Host "  Usuario:   admin"
Write-Host "  Password:  admin123"
