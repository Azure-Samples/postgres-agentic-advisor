param()

# postdeploy.ps1 — Validates database migration and seeding after deployment.
#
# ── How to run locally ────────────────────────────────────────────────────────
#   1. Get your HorizonDB connection details. After any azd deployment run:
#        azd env get-value POSTGRES_HOST        ← the cluster host
#        az keyvault secret show --vault-name <kv> --name db-user     --query value -o tsv
#        az keyvault secret show --vault-name <kv> --name db-password --query value -o tsv
#      (find <kv> with: azd env get-value AZURE_KEY_VAULT_NAME)
#
#   2. Paste those values into the .env file at the project root:
#        DB_HOST=<your-cluster>.postgres.database.azure.com
#        DB_USER=horizonAdmin
#        DB_PASSWORD=<your-password>
#
#   3. Run from the project root:
#        pwsh ./azd-hooks/postdeploy.ps1
#
# ── Connection resolution order (automatic — no code changes needed) ──────────
#   1. azd env (POSTGRES_HOST) + Key Vault creds   — used during cloud azd up
#   2. .env file at project root                   — used for local testing
#   3. Shell environment variables                 — used for CI / overrides
#
# Exit codes: 0 = all validation steps passed, 1 = failure or timeout

$ErrorActionPreference = 'Continue'

# ── Helpers ───────────────────────────────────────────────────────────────────
function Read-DotEnv ([string]$path) {
    $vals = @{}
    if (-not (Test-Path $path)) { return $vals }
    foreach ($line in Get-Content $path) {
        if ($line -match '^\s*#' -or $line -notmatch '=') { continue }
        $k, $v = $line.Split('=', 2)
        $v = $v.Trim().Trim('"').Trim("'")   # strip surrounding quotes e.g. KEY="value"
        $vals[$k.Trim()] = $v
    }
    return $vals
}

function Format-Duration ([int]$secs) {
    $m = [int]($secs / 60); $s = $secs % 60
    return "${m}m ${s}s"
}

# ── Resolve credentials ───────────────────────────────────────────────────────
# Step 1: azd env + Key Vault (cloud deployment)
$kvName = azd env get-value AZURE_KEY_VAULT_NAME 2>$null
$dbHost = azd env get-value POSTGRES_HOST        2>$null
$dbName = azd env get-value POSTGRES_DATABASE    2>$null
if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = 'agentic_advisor' }

# Reject azd error messages (they appear in stdout when no env is active)
if ($dbHost -like 'ERROR:*') { $dbHost = $null }
if ($dbName -like 'ERROR:*') { $dbName = $null }
if ($kvName -like 'ERROR:*') { $kvName = $null }

$dbUser = $null
$dbPass = $null
if (-not [string]::IsNullOrWhiteSpace($kvName)) {
    $dbUser = az keyvault secret show --vault-name $kvName --name 'db-user'     --query value -o tsv 2>$null
    $dbPass = az keyvault secret show --vault-name $kvName --name 'db-password' --query value -o tsv 2>$null
}

# Step 2: .env file at project root (local testing)
$envFilePath = Join-Path (Split-Path $PSScriptRoot) '.env'
$dotenv = Read-DotEnv $envFilePath
if ([string]::IsNullOrWhiteSpace($dbHost) -or $dbHost -like 'placeholder*') { $dbHost = $dotenv['DB_HOST'] }
if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = $dotenv['DB_NAME'] }
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = $dotenv['DB_USER'] }
if ([string]::IsNullOrWhiteSpace($dbPass)) { $dbPass = $dotenv['DB_PASSWORD'] }

# Step 3: shell environment variables (CI / override)
if ([string]::IsNullOrWhiteSpace($dbHost)) { $dbHost = $env:DB_HOST }
if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = $env:DB_NAME }
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = $env:DB_USER }
if ([string]::IsNullOrWhiteSpace($dbPass)) { $dbPass = $env:DB_PASSWORD }

# Vector store collection names — drive a strict Step 4 check by name (from
# backend settings) instead of counting whatever vector tables happen to exist.
$newsCol = $dotenv['VECTOR_STORE_COLLECTION_NAME_NEWS_ARTICLES']
$secCol  = $dotenv['VECTOR_STORE_COLLECTION_NAME_SEC_FILINGS']
if ([string]::IsNullOrWhiteSpace($newsCol)) { $newsCol = $env:VECTOR_STORE_COLLECTION_NAME_NEWS_ARTICLES }
if ([string]::IsNullOrWhiteSpace($secCol))  { $secCol  = $env:VECTOR_STORE_COLLECTION_NAME_SEC_FILINGS }
$strictVectorCheck = (-not [string]::IsNullOrWhiteSpace($newsCol)) -and (-not [string]::IsNullOrWhiteSpace($secCol))

# ── Banner ────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "    Database Migration Validation" -ForegroundColor Cyan
Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# Skip validation if HorizonDB is not deployed (empty DB_HOST)
if ([string]::IsNullOrWhiteSpace($dbHost) -or $dbHost -like 'placeholder*') {
    Write-Host "  ⏭️  HorizonDB not deployed — skipping validation." -ForegroundColor Yellow
    exit 0
}
Write-Host "  ⏱️  Validation may take up to 15 minutes..." -ForegroundColor Cyan

# ── Guards ────────────────────────────────────────────────────────────────────
if ([string]::IsNullOrWhiteSpace($dbUser) -or [string]::IsNullOrWhiteSpace($dbPass)) {
    Write-Host ""
    Write-Host "  ⚠️  DB credentials not found. Add to .env file:" -ForegroundColor Yellow
    Write-Host "      DB_USER=horizonAdmin" -ForegroundColor DarkGray
    Write-Host "      DB_PASSWORD=<your-password>" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "      Get these values with:" -ForegroundColor Yellow
    Write-Host "        azd env get-value POSTGRES_HOST" -ForegroundColor DarkGray
    Write-Host "        az keyvault secret show --vault-name `$(azd env get-value AZURE_KEY_VAULT_NAME) --name db-password --query value -o tsv" -ForegroundColor DarkGray
    exit 0
}
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Host ""
    Write-Host "  ⚠️  psql not found. Install PostgreSQL client tools:" -ForegroundColor Yellow
    Write-Host "      Linux   : sudo apt-get install postgresql-client  # Debian/Ubuntu" -ForegroundColor DarkGray
    Write-Host "              sudo yum install postgresql           # RHEL/CentOS" -ForegroundColor DarkGray
    Write-Host "      Windows : winget install PostgreSQL.PostgreSQL" -ForegroundColor DarkGray
    Write-Host "      Mac     : brew install libpq && brew link --force libpq" -ForegroundColor DarkGray
    exit 0
}

# ── Connection ────────────────────────────────────────────────────────────────
$env:PGPASSWORD = $dbPass
$connStr = "host=$dbHost port=5432 dbname=$dbName user=$dbUser sslmode=require"

Write-Host ""
Write-Host "  🔌 Connecting to HorizonDB: $dbHost..." -ForegroundColor Cyan
$connTest = (psql $connStr -c '\q' 2>&1 | ForEach-Object { "$_" })
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Connection failed: $connTest" -ForegroundColor Red
    Write-Host "     Ensure your IP is whitelisted in the HorizonDB firewall rules." -ForegroundColor Yellow
    exit 1
}
Write-Host "  ✓ Connected successfully." -ForegroundColor Green

# ── Validation SQL ────────────────────────────────────────────────────────────
# Step 4 - Vector stores: when settings supply the expected collection names,
# run a strict per-name check (catches missing/empty collections by name).
# Otherwise fall back to a generic count of any populated vector-typed table.
if ($strictVectorCheck) {
    Write-Host "  🔎 Step 4 vector store check: strict ($newsCol, $secCol)" -ForegroundColor DarkCyan
    $newsColSql = $newsCol -replace "'", "''"
    $secColSql  = $secCol  -replace "'", "''"
    $vectorStoresCte = @"
vector_stores AS (
  SELECT
    'Step 4 - Vector stores' AS step,
    (COUNT(*) FILTER (WHERE populated))::text || '/' || COUNT(*)::text || ' collections populated'
      || COALESCE(' (missing: ' || string_agg(name, ', ') FILTER (WHERE NOT populated) || ')', '') AS found,
    CASE WHEN COUNT(*) FILTER (WHERE populated) = COUNT(*) THEN 'OK' ELSE 'INCOMPLETE' END AS status
  FROM (
    SELECT
      e.name,
      EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        JOIN pg_stat_user_tables s ON s.relid = c.oid
        WHERE n.nspname = 'public'
          AND c.relkind = 'r'
          AND c.relname = e.name
          AND s.n_live_tup > 0
      ) AS populated
    FROM (VALUES ('$newsColSql'), ('$secColSql')) AS e(name)
  ) sub
)
"@
} else {
    Write-Host "  ⚠️  Step 4 vector store check: generic (set VECTOR_STORE_COLLECTION_NAME_* in .env to enable strict check)" -ForegroundColor Yellow
    $vectorStoresCte = @'
vector_stores AS (
  SELECT 'Step 4 - Vector stores' AS step,
    COUNT(*)::text || ' collections populated' AS found,
    CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'EMPTY' END AS status
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_stat_user_tables s ON s.relid = c.oid
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND s.n_live_tup > 0
    AND EXISTS (
      SELECT 1 FROM pg_attribute a
      JOIN pg_type t ON t.oid = a.atttypid
      WHERE a.attrelid = c.oid AND a.attnum > 0 AND t.typname = 'vector'
    )
)
'@
}

$validationSql = @"
WITH
extensions AS (
  SELECT 'Step 1 - Extensions' AS step,
    COALESCE(string_agg(extname, ', ' ORDER BY extname), 'none') AS found,
    CASE WHEN COUNT(*) = 4 THEN 'OK' ELSE 'INCOMPLETE (' || COUNT(*) || '/4)' END AS status
  FROM pg_extension
  WHERE extname IN ('vector', 'pg_diskann', 'azure_ai', 'age')
),
schema_tables AS (
  -- Count every user table in the public schema except those with a vector
  -- column (those are reported separately under Step 4 - Vector stores).
  SELECT 'Step 2 - Schema tables' AS step,
    COUNT(*)::text || ' tables created' AS found,
    CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'EMPTY' END AS status
  FROM pg_tables t
  WHERE t.schemaname = 'public'
    AND NOT EXISTS (
      SELECT 1
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_type tp ON tp.oid = a.atttypid
      WHERE n.nspname = t.schemaname
        AND c.relname = t.tablename
        AND a.attnum > 0
        AND tp.typname = 'vector'
    )
),
schema_column AS (
  SELECT 'Step 2b - alert.supply_chain_path' AS step,
    COALESCE(MAX(column_name), 'MISSING') AS found,
    CASE WHEN MAX(column_name) IS NOT NULL THEN 'OK' ELSE 'MISSING' END AS status
  FROM information_schema.columns
  WHERE table_name = 'alert' AND column_name = 'supply_chain_path'
),
seed AS (
  SELECT 'Step 3 - Seed data' AS step,
    COUNT(*)::text || '/7 tables seeded' AS found,
    CASE WHEN COUNT(*) = 7 THEN 'OK' ELSE 'INCOMPLETE' END AS status
  FROM pg_stat_user_tables
  WHERE relname IN ('user','client','security','security_price','account_holding','workflow_trigger','meeting')
    AND n_live_tup > 0
),
$vectorStoresCte,
mem0 AS (
  SELECT 'Step 5 - mem0 preferences' AS step,
    COUNT(*)::text || ' rows' AS found,
    CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'EMPTY' END AS status
  FROM mem0_client_preferences
),
graph AS (
  SELECT 'Step 6 - News graph (AGE)' AS step,
    COALESCE(MAX(name), 'MISSING') AS found,
    CASE WHEN MAX(name) IS NOT NULL THEN 'OK' ELSE 'MISSING' END AS status
  FROM ag_catalog.ag_graph
  WHERE name = 'agentic_advisor_graph'
)
SELECT step, found, status FROM extensions
UNION ALL SELECT step, found, status FROM schema_tables
UNION ALL SELECT step, found, status FROM schema_column
UNION ALL SELECT step, found, status FROM seed
UNION ALL SELECT step, found, status FROM vector_stores
UNION ALL SELECT step, found, status FROM mem0
UNION ALL SELECT step, found, status FROM graph
ORDER BY step;
"@

# ── Run validation query ──────────────────────────────────────────────────────
# Returns a PSCustomObject with .Rows (array) and .Error (string or $null).
# Using PSCustomObject avoids PowerShell's array-flattening bug when returning
# multiple values from a function via "return $array, $value".
function Invoke-Validation {
    $tmpSql = [System.IO.Path]::GetTempFileName() + '.sql'
    try {
        $validationSql | Set-Content -Path $tmpSql -Encoding UTF8
        $raw = (psql $connStr -t -A -F '|' -f $tmpSql 2>&1 | ForEach-Object { "$_" })
        if ($LASTEXITCODE -ne 0) {
            return [PSCustomObject]@{ Rows = @(); Error = ($raw -join "`n") }
        }
        $rows = [System.Collections.Generic.List[object]]::new()
        foreach ($line in $raw) {
            $line = ([string]$line).Trim()
            if ([string]::IsNullOrWhiteSpace($line)) { continue }
            $parts = $line.Split('|')
            if ($parts.Count -ge 3) {
                $rows.Add([PSCustomObject]@{
                    Step   = $parts[0].Trim()
                    Found  = $parts[1].Trim()
                    Status = $parts[2].Trim()
                })
            }
        }
        return [PSCustomObject]@{ Rows = $rows.ToArray(); Error = $null }
    } finally {
        Remove-Item $tmpSql -ErrorAction SilentlyContinue
    }
}

# ── Display validation table ──────────────────────────────────────────────────
function Show-ValidationTable ([array]$rows) {
    Write-Host ""
    Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    foreach ($row in $rows) {
        $stepPad  = $row.Step.PadRight(36)
        $foundPad = $row.Found.PadRight(36)
        if ($row.Status -eq 'OK') {
            Write-Host ("  {0} | {1} | " -f $stepPad, $foundPad) -NoNewline -ForegroundColor White
            Write-Host $row.Status -ForegroundColor Green
        } else {
            Write-Host ("  {0} | {1} | " -f $stepPad, $foundPad) -NoNewline -ForegroundColor White
            Write-Host $row.Status -ForegroundColor Yellow
        }
    }
    Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
}

# ── Polling loop ──────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  🔍 Validating migration status..." -ForegroundColor Cyan

$maxAttempts  = 15   # 15 × 60s = 15 minutes
$pollInterval = 60
$startTime    = Get-Date
$attempt      = 0
$allOk        = $false
$lastRows     = @()

while ($attempt -lt $maxAttempts) {
    $attempt++
    $result = Invoke-Validation

    if ($null -ne $result.Error) {
        Write-Host ""
        Write-Host "  ⚠️  Query error (attempt $attempt): $($result.Error)" -ForegroundColor Yellow
        Write-Host "     Retrying in ${pollInterval}s. If this persists, check query syntax or contact @Shazil." -ForegroundColor DarkGray
        if ($attempt -lt $maxAttempts) { Start-Sleep -Seconds $pollInterval }
        continue
    }

    $lastRows = $result.Rows

    $incomplete = $lastRows | Where-Object { $_.Status -ne 'OK' }
    if ($incomplete.Count -eq 0) { $allOk = $true; break }

    Write-Host "  ⏳ Migration in progress... ($([int]((Get-Date) - $startTime).TotalSeconds)s elapsed)" -ForegroundColor DarkCyan
    if ($attempt -lt $maxAttempts) { Start-Sleep -Seconds $pollInterval }
}

# ── Final report ──────────────────────────────────────────────────────────────
$elapsed = [int]((Get-Date) - $startTime).TotalSeconds
Write-Host ""

# Show validation table at the end (success or failure)
Show-ValidationTable $lastRows

if ($allOk) {
    Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "  ✅ DATABASE MIGRATION COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  All validation checks passed:" -ForegroundColor Green
    foreach ($row in $lastRows) {
        Write-Host "    ✓ $($row.Step): $($row.Found)" -ForegroundColor Green
    }
    Write-Host ""
    Write-Host "  Total validation time: $(Format-Duration $elapsed)" -ForegroundColor Green
    Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    exit 0
} else {
    Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
    Write-Host "  ❌ DATA VALIDATION MONITORING FAILED" -ForegroundColor Red
    Write-Host ""
    $failed = $lastRows | Where-Object { $_.Status -ne 'OK' }
    if ($failed.Count -gt 0) {
        Write-Host "  The following checks did not pass:" -ForegroundColor Red
        foreach ($row in $failed) {
            Write-Host "    ✗ $($row.Step): $($row.Status) — $($row.Found)" -ForegroundColor Red
        }
    }
    Write-Host ""
    Write-Host "  Timeout reached after $(Format-Duration $elapsed)." -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "  Check the backend container logs for more details." -ForegroundColor Yellow
    Write-Host "  Re-run the migration from the backend container if required." -ForegroundColor Yellow
    Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
    exit 1
}
