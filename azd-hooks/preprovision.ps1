param()

# Fail on any error
$ErrorActionPreference = 'Stop'

# Non-interactive: default to deploying ACA unless explicitly disabled in azd env
$deployApps = $true
try {
    $envLines = azd env get-values 2>$null
    if ($envLines) {
        # Only accept the single canonical input key: deployapps
        $deployLine = $envLines | Where-Object { $_ -match '^\s*deployapps\s*=' } | Select-Object -First 1
        if ($deployLine) {
            $val = ($deployLine -replace '^\s*deployapps\s*=\s*', '').Trim().ToLower().Trim('"', "'")
            if ($val -match '^(false|0|no)$') { $deployApps = $false }
        }
    }
} catch {
    # If reading env fails, keep default true
}

# Persist normalized setting for consistency downstream
azd env set "DEPLOY_AZURE_CONTAINERAPPS" $deployApps

# Run azd auth login --check-status and capture the output
$userOutput = azd auth login --check-status

# Extract the first email address found in the output
# In case some users may have multiple Entra ID principals associated to their logged in account.
# It takes the string of the return text of the command and
# extracts the first email address it finds in the string.

if ($userOutput -match "[\w\.\-]+@[\w\.\-]+\.\w+")
{
    $email = $matches[0]
    $env:AZURE_PRINCIPAL_NAME = $email

    Write-Host "Extracted email: $env:AZURE_PRINCIPAL_NAME"

    # Write to azd env
    azd env set "AZURE_PRINCIPAL_NAME" "$env:AZURE_PRINCIPAL_NAME"

    Write-Host "User Principal Name Set: $env:AZURE_PRINCIPAL_NAME"
}
else
{
    $errorMessage = "ERROR: No email address found in azd auth output."
    Write-Host $errorMessage
    throw $errorMessage
}


# # To control the deployment of Azure Container Apps
# if (-not $deployApps) {

# }


# Detect the public IP of the deploying machine
# Primary: ipify.org | Fallback: nslookup via OpenDNS (IPv4 only)
Write-Host "Detecting deployer public IP..." -ForegroundColor Cyan

function Get-PublicIpViaNslookup {
    try {
        # OpenDNS resolver returns your public IPv4 when you query myip.opendns.com
        # resolver1.opendns.com (208.67.222.222) forces IPv4 resolution — no IPv6
        $nslookupOutput = nslookup myip.opendns.com resolver1.opendns.com 2>&1
        if ($null -eq $nslookupOutput) { return $null }

        # nslookup output has multiple "Address:" lines:
        # First line → DNS server IP (208.67.222.222) — skip
        # Last line  → our public IPv4 — this is what we want
        $addressLines = ($nslookupOutput | Out-String) -split "`n" |
            Where-Object { $_ -match '^\s*Address[:\s]' }

        $lastLine = $addressLines | Select-Object -Last 1
        if (-not $lastLine) { return $null }

        # Strip "Address:" prefix and any trailing port like "#53"
        $ip = ($lastLine -replace '^\s*Address[:\s]+', '').Trim() -replace '#\d+$', ''

        # Must be a valid IPv4 — reject IPv6 (contains colons) and empty values
        if ($ip -match '^\d{1,3}(\.\d{1,3}){3}$') { return $ip }
        return $null
    } catch {
        return $null
    }
}

$clientIp = $null

# Primary: ipify.org
try {
    $clientIp = (Invoke-RestMethod -Uri 'https://api.ipify.org?format=text' -TimeoutSec 10).Trim()
    if ($clientIp -notmatch '^\d{1,3}(\.\d{1,3}){3}$') {
        Write-Host "WARNING: ipify.org returned non-IPv4 response: $clientIp" -ForegroundColor Yellow
        $clientIp = $null
    } else {
        Write-Host "Deployer public IP detected via ipify.org: $clientIp" -ForegroundColor Green
    }
} catch {
    Write-Host "WARNING: ipify.org unreachable — trying nslookup fallback..." -ForegroundColor Yellow
}

# Fallback: nslookup via OpenDNS (IPv4 only)
if (-not $clientIp) {
    Write-Host "Attempting nslookup fallback via OpenDNS..." -ForegroundColor Yellow
    $clientIp = Get-PublicIpViaNslookup
    if ($clientIp) {
        Write-Host "Deployer public IP detected via nslookup: $clientIp" -ForegroundColor Green
    } else {
        Write-Host "WARNING: nslookup fallback also failed — firewall rule for local machine will be skipped." -ForegroundColor Yellow
    }
}

if ($clientIp) {
    azd env set "DEPLOYER_PUBLIC_IP" $clientIp
    Write-Host "Deployer public IP set to: $clientIp" -ForegroundColor Green
} else {
    azd env set "DEPLOYER_PUBLIC_IP" ""
    Write-Host "Deployer public IP not set — firewall rule for local machine will be skipped." -ForegroundColor Yellow
}


exit 0
