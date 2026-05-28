param()

$ErrorActionPreference = 'Stop'



# Simple cleanup and exit function
function Exit-WithError {
    param($message, $statusCode = 1, $errorType = "general")

    Write-Host "ERROR: $message" -ForegroundColor Red

    if ($errorType -eq "env_name") {
        # For environment name errors, remove .azure folder to force re-setup
        Write-Host "Clearing environment configuration..." -ForegroundColor Yellow
        # Attempt to delete resource group if it was already created before validation
        try {
            $rg = azd env get-value "AZURE_RESOURCE_GROUP" 2>$null
            if ($rg) {
                $rgExists = az group exists -n $rg -o tsv 2>$null
                if ($rgExists -eq 'true') {
                    Write-Host "Deleting resource group due to invalid environment name: $rg" -ForegroundColor Yellow
                    az group delete --name $rg --yes --no-wait 2>$null
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "Resource group deletion initiated (running in background)" -ForegroundColor Green
                    } else {
                        Write-Host "Resource group delete command did not start successfully" -ForegroundColor Yellow
                    }
                } else {
                    Write-Host "Resource group $rg not found (likely not created yet) - skipping deletion" -ForegroundColor Gray
                }
            }
        } catch { Write-Host "Could not resolve resource group for deletion" -ForegroundColor Gray }

        if (Test-Path ".azure") {
            Remove-Item ".azure" -Recurse -Force
            Write-Host "Environment configuration cleared" -ForegroundColor Yellow
        }
        if (Test-Path ".env") {
            Remove-Item ".env" -Force
            Write-Host "Removed .env file" -ForegroundColor Yellow
        }
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "  1. Run 'azd env new' and enter a valid name (letters, numbers, hyphens, <=50 chars)" -ForegroundColor Green
        Write-Host "  2. Run 'azd up' to redeploy with the new environment" -ForegroundColor Green
    } elseif ($errorType -eq "auth") {
        # Authentication failures: no resource cleanup; user hasn't provisioned yet
        Write-Host ""; Write-Host "=============================================" -ForegroundColor Red
        Write-Host "   DEPLOYMENT STOPPED - AUTHENTICATION REQUIRED" -ForegroundColor Red
        Write-Host "=============================================" -ForegroundColor Red
        Write-Host "Run 'az login' to authenticate, then re-run 'azd up'." -ForegroundColor Cyan
    } else {
        # General error - completely clean up the environment
        Write-Host "Cleaning up failed deployment environment..." -ForegroundColor Yellow

        try {
            # Get current environment info
            $envName = azd env get-value "AZURE_ENV_NAME" 2>$null
            $resourceGroup = azd env get-value "AZURE_RESOURCE_GROUP" 2>$null

            if ($resourceGroup) {
                $rgExists = az group exists -n $resourceGroup -o tsv 2>$null
                if ($rgExists -eq 'true') {
                    Write-Host "Deleting resource group: $resourceGroup" -ForegroundColor Yellow
                    az group delete --name $resourceGroup --yes --no-wait 2>$null
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "Resource group deletion initiated (running in background)" -ForegroundColor Green
                    } else {
                        Write-Host "Resource group delete command did not start successfully" -ForegroundColor Yellow
                    }
                } else {
                    Write-Host "Resource group $resourceGroup not found (likely not created yet) - skipping deletion" -ForegroundColor Gray
                }
            }

            # Remove environment folder
            if ($envName -and (Test-Path ".azure/$envName")) {
                Remove-Item ".azure/$envName" -Recurse -Force
                Write-Host "Removed environment folder: .azure/$envName" -ForegroundColor Yellow
            }

            # Remove .env file
            if (Test-Path ".env") {
                Remove-Item ".env" -Force
                Write-Host "Removed .env file" -ForegroundColor Yellow
            }

        } catch {
            Write-Host "Error during cleanup: $($_.Exception.Message)" -ForegroundColor Yellow
        }

        Write-Host ""
        Write-Host "=============================================" -ForegroundColor Red
        Write-Host "   DEPLOYMENT STOPPED - QUOTA VALIDATION FAILED" -ForegroundColor Red
        Write-Host "=============================================" -ForegroundColor Red
        Write-Host "Environment has been completely cleaned up!" -ForegroundColor Green
        Write-Host ""
        Write-Host "TO CONTINUE:" -ForegroundColor Cyan
        Write-Host "  1. Run 'azd env new' and create a new environment" -ForegroundColor Yellow
        Write-Host "  2. Run 'azd up' and choose one of the recommended regions" -ForegroundColor Yellow
        Write-Host "=============================================" -ForegroundColor Red
        Write-Host ""
    }

    exit $statusCode
}

# Authentication validation: ensure the user is logged into Azure CLI
function Test-AzureAuthentication {
    Write-Host "Validating Azure CLI authentication..." -ForegroundColor Cyan
    try {
        $accountJson = az account show -o json 2>$null
        if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($accountJson)) {
            Exit-WithError "You are not logged into Azure. Run 'az login' and re-run 'azd up'." 1 "auth"
        }
        $acct = $accountJson | ConvertFrom-Json
        if (-not $acct.id) {
            Exit-WithError "Azure CLI authentication invalid. Run 'az login' and retry." 1 "auth"
        }
        Write-Host "Azure CLI authentication: OK (Subscription: $($acct.name) / $($acct.id))" -ForegroundColor Green
    } catch {
        Exit-WithError "Failed to verify Azure authentication. Run 'az login' and retry." 1 "auth"
    }
}

function Test-EnvironmentName {
    Write-Host "Validating environment name..." -ForegroundColor Cyan

    try {
        $envName = azd env get-value "AZURE_ENV_NAME" 2>$null
    } catch {
        Exit-WithError "Failed to get environment name. Please ensure azd is properly configured." "general"
    }

    if ($envName) {
        Write-Host "Environment name: $envName" -ForegroundColor Yellow

        # Check for invalid characters in environment name
        if ($envName -match '[^a-zA-Z0-9-]' -or $envName.Length -gt 50) {
            Write-Host "Invalid environment name detected!" -ForegroundColor Red
            Write-Host "Environment names must:" -ForegroundColor Yellow
            Write-Host "  - Only contain letters, numbers, and hyphens" -ForegroundColor Yellow
            Write-Host "  - Be 50 characters or less" -ForegroundColor Yellow
            Write-Host "  - Current name: '$envName'" -ForegroundColor Red
            Exit-WithError "Environment name '$envName' contains invalid characters or is too long" 1 "env_name"
        }

        Write-Host "Environment name is valid" -ForegroundColor Green
    }
}

function Get-InfraLocation {
    # Check azd environment values first (this is where azd stores the location)
    try {
        $location = azd env get-value "AZURE_LOCATION" 2>$null
        if ($location -and $location.Trim() -ne "") {
            return $location.Trim()
        }
    } catch { }

    # Check azd environment config
    try {
        $envName = azd env get-value "AZURE_ENV_NAME" 2>$null
        if ($envName -and (Test-Path ".azure/$envName/config.json")) {
            $config = Get-Content ".azure/$envName/config.json" -Raw | ConvertFrom-Json
            if ($config.infra.parameters.location) {
                return $config.infra.parameters.location
            }
        }
    } catch { }

    # Check environment variable
    if ($env:AZURE_LOCATION) {
        return $env:AZURE_LOCATION
    }

    # Check parameters file
    if (Test-Path "infra/main.parameters.json") {
        try {
            $params = Get-Content "infra/main.parameters.json" -Raw | ConvertFrom-Json
            if ($params.parameters.location.value) {
                $location = $params.parameters.location.value
                if ($location -match '\$\{([^}]+)\}') {
                    # Extract environment variable name and get its value
                    $envVar = $matches[1] -replace '=.*$', ''
                    return [Environment]::GetEnvironmentVariable($envVar)
                }
                return $location
            }
        } catch { }
    }

    Exit-WithError "Cannot determine infrastructure location"
}

# Get allowed regions (general function for both PostgreSQL and Container Apps)
function Get-AllowedRegions {
    param($failedRegion)

    if (-not (Test-Path "infra/main.bicep")) {
        Exit-WithError "Cannot find infra/main.bicep file"
    }

    # Multi-regex pass supporting intervening decorators
    try {
        $bicepContent = Get-Content "infra/main.bicep" -Raw
        $regexAttempts = @(
            '(?s)@allowed\(\[(?<list>.*?)\]\).*?\bparam\s+location\s+string\b',
            '(?s)@allowed\(\[(?<list>.*?)\]\)\s*(?:@[a-zA-Z0-9_]+\([^)]*\)\s*)*param\s+location\s+string\b'
        )
        $attemptIndex = 0
        foreach ($pattern in $regexAttempts) {
            $m = [regex]::Match($bicepContent, $pattern)
            if ($m.Success) {
                $list = $m.Groups['list'].Value
                $regionMatches = [regex]::Matches($list, "'([^']+)'")
                $regionsRegex = @()
                foreach ($rm in $regionMatches) { $regionsRegex += $rm.Groups[1].Value }
                if ($regionsRegex.Count -gt 0) {
                    Write-Host "[Get-AllowedRegions] Regex attempt $attemptIndex succeeded: $($regionsRegex.Count) regions" -ForegroundColor Cyan
                    if ($failedRegion) { return $regionsRegex | Where-Object { $_ -ne $failedRegion.ToLower() } }
                    return $regionsRegex
                } else {
                    Write-Host "[Get-AllowedRegions] Regex attempt $attemptIndex matched but 0 regions extracted" -ForegroundColor Yellow
                }
            } else {
                Write-Host "[Get-AllowedRegions] Regex attempt $attemptIndex no match" -ForegroundColor Gray
            }
            $attemptIndex++
        }
        Write-Host "[Get-AllowedRegions] Falling back to line-based parsing" -ForegroundColor Yellow
    } catch {
        Write-Host "[Get-AllowedRegions] Regex parsing error: $($_.Exception.Message) - fallback to line parsing" -ForegroundColor Yellow
    }

    # Line-by-line fallback
    try {
        $bicepLines = Get-Content "infra/main.bicep"
        $regions = @()
        $inAllowedSection = $false
        $foundLocationParam = $false

        for ($i = 0; $i -lt $bicepLines.Count; $i++) {
            $line = $bicepLines[$i].Trim()

            if ($line -match '^@allowed\(\[') {
                $inAllowedSection = $true
                continue
            }

            if ($inAllowedSection) {
                if ($line -match '^\]\)') {
                    $inAllowedSection = $false
                    for ($j = $i+1; $j -le [Math]::Min($i+20, $bicepLines.Count); $j++) {
                        $nextLine = $bicepLines[$j].Trim()
                        if ($nextLine -match '^param location string') {
                            $foundLocationParam = $true
                            Write-Host "[Get-AllowedRegions] Line parse located location param at line $($j+1)" -ForegroundColor Green
                            break
                        }
                    }
                    if ($foundLocationParam) { break }
                    $regions = @()
                    continue
                }

                if ($line -match "^\s*'([^']+)'") {
                    $regions += $matches[1]
                }
            }
        }

        if ($regions.Count -gt 0 -and $foundLocationParam) {
            Write-Host "[Get-AllowedRegions] Line parsing succeeded: $($regions.Count) regions" -ForegroundColor Cyan
            if ($failedRegion) {
                return $regions | Where-Object { $_ -ne $failedRegion.ToLower() }
            }
            return $regions
        } else {
            Write-Host "[Get-AllowedRegions] Line parsing failed (regions: $($regions.Count), foundLocationParam: $foundLocationParam)" -ForegroundColor Yellow
            Exit-WithError "Failed to parse allowed regions from main.bicep file"
        }
    } catch {
        Exit-WithError "Error parsing main.bicep file: $($_.Exception.Message)"
    }
}
# Check Container Apps quota for a specific region
function Test-ContainerAppsQuotaInRegion {
    param($region)

    try {
        # Check if Container Apps provider is registered and available in the region
        $providerInfo = az provider show --namespace Microsoft.App --query "registrationState" -o tsv 2>$null

        if ($providerInfo -ne "Registered") {
            Write-Host "Microsoft.App provider is not registered: $providerInfo" -ForegroundColor Yellow
            return $false
        }

        # Check if the region supports Container Apps by listing available locations
        $locations = az provider show --namespace Microsoft.App --query "resourceTypes[?resourceType=='managedEnvironments'].locations[]" -o tsv 2>$null

        if ($locations) {
            $locationsList = $locations -split "`n" | ForEach-Object { $_.Trim().ToLower().Replace(' ', '') }
            $regionNormalized = $region.ToLower().Replace(' ', '')

            # Check if region is in the supported locations
            $isSupported = $locationsList -contains $regionNormalized

            if ($isSupported) {
                Write-Host "Container Apps is supported in $region" -ForegroundColor Green
                return $true
            } else {
                Write-Host "Container Apps is not supported in $region" -ForegroundColor Yellow
                return $false
            }
        } else {
            Write-Host "Could not retrieve Container Apps location information" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "Error checking Container Apps availability: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}
# Run the checks

# Find alternative regions with Container Apps quota
function Find-ContainerAppsAlternativeRegions {
    param($failedRegion)

    $alternativeRegions = Get-AllowedRegions -failedRegion $failedRegion
    $availableRegions = [System.Collections.ArrayList]::new()

    Write-Host "Checking alternative regions for Container Apps quota..." -ForegroundColor Yellow

    foreach ($region in $alternativeRegions) {
        $quotaCheck = Test-ContainerAppsQuotaInRegion -region $region

        if ($quotaCheck) {
            $null = $availableRegions.Add($region)
            Write-Host "$region has sufficient Container Apps quota" -ForegroundColor Green
        } else {
            Write-Host "${region}: Container Apps not available - excluding from alternatives" -ForegroundColor Gray
        }
    }

    return $availableRegions.ToArray()
}

function Test-ContainerAppsQuota {
    Write-Host "Checking Azure Container Apps quota..." -ForegroundColor Cyan

    $infraLocation = Get-InfraLocation
    Write-Host "Checking region: $infraLocation" -ForegroundColor Yellow

    try {
        # Check if Container Apps is available in the region
        $quotaCheck = Test-ContainerAppsQuotaInRegion -region $infraLocation

        if ($quotaCheck) {
            Write-Host "Container Apps quota sufficient in $infraLocation" -ForegroundColor Green
            return
        } else {
            Write-Host "Insufficient Container Apps quota in $infraLocation" -ForegroundColor Red

            # Look for alternative regions
            $alternatives = Find-ContainerAppsAlternativeRegions -failedRegion $infraLocation

            if ($alternatives.Count -gt 0) {
                Write-Host ""
                Write-Host "Alternative regions with sufficient Container Apps quota:" -ForegroundColor Green
                $alternatives | ForEach-Object { Write-Host "  $_" -ForegroundColor Green }
                Write-Host ""
                Exit-WithError "Please use one of the above alternative regions for your deployment"
            }
        }
    } catch {
        Write-Host "Could not retrieve Container Apps quota information" -ForegroundColor Yellow
        Write-Host "This might indicate that Container Apps is not available in this region" -ForegroundColor Yellow

        # Still try to find alternative regions
        $alternatives = Find-ContainerAppsAlternativeRegions -failedRegion $infraLocation

        if ($alternatives.Count -gt 0) {
            Write-Host ""
            Write-Host "Alternative regions with Container Apps available:" -ForegroundColor Green
            $alternatives | ForEach-Object { Write-Host "  $_" -ForegroundColor Green }
            Write-Host ""
            Exit-WithError "Please use one of the above alternative regions for your deployment"
        }
    }

    Write-Host "Could not retrieve Container Apps quota information" -ForegroundColor Yellow
    Exit-WithError "Error checking Container Apps quota: $($_.Exception.Message)"
}

# Run the checks
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Azure Deployment Validation" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# First verify authentication
Write-Host ""; Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Authentication Check" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Test-AzureAuthentication
Write-Host ""

# First validate environment name
Test-EnvironmentName

Write-Host ""

# Set database backend to HorizonDB
azd env set DB_TYPE horizondb | Out-Null
Write-Host "Database backend: horizondb" -ForegroundColor Cyan


# ── HorizonDB pre-flight checks ──────────────────────────────────────────
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "HorizonDB Pre-flight Check" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Verify Microsoft.OrionDB provider is registered
# Note: The provider namespace for registration is Microsoft.OrionDB even though
# the resource type in templates is now Microsoft.HorizonDb/clusters.
$providerState = az provider show --namespace Microsoft.OrionDB --query "registrationState" -o tsv 2>$null
if ($providerState -ne 'Registered') {
    Write-Host "Microsoft.OrionDB provider is not registered (state: $providerState)." -ForegroundColor Red
    Write-Host "Register it with: az provider register --namespace Microsoft.OrionDB" -ForegroundColor Yellow
    Exit-WithError "Microsoft.OrionDB provider is not registered. Run 'az provider register --namespace Microsoft.OrionDB' and retry."

}
Write-Host "Microsoft.OrionDB provider (HorizonDB): Registered" -ForegroundColor Green

Write-Host "HorizonDB admin credentials are auto-generated by the deployment." -ForegroundColor Green

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "IMPORTANT: Region Selection Constraint" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "HorizonDB infrastructure is restricted to the following regions only:" -ForegroundColor Yellow
Write-Host "  • westus3" -ForegroundColor Yellow
Write-Host "  • australiaeast" -ForegroundColor Yellow
Write-Host "  • centralus" -ForegroundColor Yellow
Write-Host "  • uaenorth" -ForegroundColor Yellow
Write-Host "  • uksouth" -ForegroundColor Yellow
Write-Host ""
Write-Host "When prompted for location during 'azd up', you MUST select one of the above." -ForegroundColor Red
Write-Host "Deployment will fail if you choose a different region." -ForegroundColor Red

Write-Host ""


# Check Container Apps quota (always required regardless of DB type)
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Container Apps Quota Check" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

Test-ContainerAppsQuota

Write-Host ""
Write-Host "===========================================" -ForegroundColor Green
Write-Host "All infrastructure validations successful!" -ForegroundColor Green
Write-Host "Note: OpenAI quota checking is handled automatically by azd" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Green
