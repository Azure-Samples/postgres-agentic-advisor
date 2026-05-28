@description('Azure region — HorizonDB supported regions during preview')
param location string

@description('Name of the HorizonDB cluster')
param clusterName string

@description('Number of vCores per node')
param vCores int = 4

@description('Number of replicas')
param replicaCount int = 1

@description('PostgreSQL major version')
param version string = '17'

@description('Admin username for the cluster')
// Fixed — no need to expose as a parameter
var administratorLogin = 'horizonAdmin'

@secure()
@description('Auto-generated admin password — meets complexity: uppercase, lowercase, digit, special char')
param administratorLoginPassword string = 'Hz1!${replace(newGuid(), '-', '')}'

@description('Unique suffix for deployment script name — passed from main.bicep via utcNow()')
param deploymentSuffix string

@description('Resource ID of the user-assigned managed identity used to run the deployment script')
param scriptIdentityId string

@description('Public IP of the machine running azd up — used for HorizonDB firewall rule')
param deployerPublicIp string = ''


// ── HorizonDB Cluster (native Bicep — Microsoft.HorizonDb/clusters@2026-01-20-preview) ──
resource horizonDbCluster 'Microsoft.HorizonDb/clusters@2026-01-20-preview' = {
  name: clusterName
  location: location
  properties: {
    administratorLogin: administratorLogin
    administratorLoginPassword: administratorLoginPassword
    createMode: 'Create'
    vCores: vCores
    replicaCount: replicaCount
    version: version
  }
}

output clusterName string = horizonDbCluster.name
output clusterFqdn string = horizonDbCluster.properties.?fullyQualifiedDomainName ?? '${clusterName}.${location}.horizondb.azure.com'
output adminLogin string = administratorLogin
@secure()
output adminPassword string = administratorLoginPassword

// ── Deployment script: add firewall rule + create agentic_advisor database ───
// Runs after cluster is Succeeded. Uses az rest for firewall (pool exists by then)
// and psql for DB creation (no databases sub-resource in HorizonDb API).
#disable-next-line use-stable-resource-identifiers
resource setupScript 'Microsoft.Resources/deploymentScripts@2023-08-01' = {
  name: 'horizondb-setup-${deploymentSuffix}'
  location: location
  kind: 'AzureCLI'
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${scriptIdentityId}': {}
    }
  }
  properties: {
    azCliVersion: '2.70.0'
    retentionInterval: 'PT2H'
    timeout: 'PT25M'
    forceUpdateTag: deploymentSuffix
    environmentVariables: [
      { name: 'PGHOST',       value: horizonDbCluster.properties.?fullyQualifiedDomainName ?? '${clusterName}.${location}.horizondb.azure.com' }
      { name: 'PGPORT',       value: '5432' }
      { name: 'PGUSER',       value: administratorLogin }
      { name: 'PGPASSWORD',   secureValue: administratorLoginPassword }
      { name: 'PGSSLMODE',    value: 'require' }
      { name: 'APP_DB',       value: 'agentic_advisor' }
      { name: 'ARM_ENDPOINT', value: environment().resourceManager }
      { name: 'CLUSTER_NAME', value: clusterName }
      { name: 'POOL_NAME',    value: 'pool1' }
      { name: 'DEPLOYER_PUBLIC_IP', value: deployerPublicIp }
    ]
    scriptContent: '''
      #!/bin/bash
      set -e

      # ── Step 1: Add firewall rule via az rest (pool1 exists once cluster is Succeeded) ──
      echo "=== Adding firewall rule via Azure REST API ==="
      SUBSCRIPTION=$(az account show --query id -o tsv)
      RESOURCE_GROUP=$(az resource show --ids "$AZ_SCRIPTS_USER_ASSIGNED_IDENTITY" --query resourceGroup -o tsv 2>/dev/null || echo "")

      # Get resource group from the identity resource ID passed as env var
      RG=$(echo "$AZ_SCRIPTS_USER_ASSIGNED_IDENTITY" | cut -d'/' -f5)

      az rest --method PUT \
        --url "${ARM_ENDPOINT%/}/subscriptions/${SUBSCRIPTION}/resourceGroups/${RG}/providers/Microsoft.HorizonDb/clusters/${CLUSTER_NAME}/pools/${POOL_NAME}/firewallRules/AllowAzureServices?api-version=2026-01-20-preview" \
        --body '{"properties":{"startIpAddress":"0.0.0.0","endIpAddress":"0.0.0.0","description":"Allow Azure services"}}' \
        2>&1 && echo "Firewall rule added." || echo "WARNING: Firewall rule failed — continuing anyway"

      # ── Step 1b: Add deployer machine IP firewall rule (if provided) ──────────────
      if [ -n "$DEPLOYER_PUBLIC_IP" ] && [ "$DEPLOYER_PUBLIC_IP" != "" ]; then
        echo "=== Adding firewall rule for deployer IP: $DEPLOYER_PUBLIC_IP ==="
        az rest --method PUT \
          --url "${ARM_ENDPOINT%/}/subscriptions/${SUBSCRIPTION}/resourceGroups/${RG}/providers/Microsoft.HorizonDb/clusters/${CLUSTER_NAME}/pools/${POOL_NAME}/firewallRules/AllowDeployerMachine?api-version=2026-01-20-preview" \
          --body "{\"properties\":{\"startIpAddress\":\"${DEPLOYER_PUBLIC_IP}\",\"endIpAddress\":\"${DEPLOYER_PUBLIC_IP}\",\"description\":\"Deployer machine IP - added by azd\"}}" \
          2>&1 && echo "Deployer IP firewall rule added." || echo "WARNING: Deployer IP firewall rule failed — continuing anyway"
      else
        echo "No deployer IP provided — skipping personal firewall rule."
      fi


      # ── Step 2: Install psql and create database ──────────────────────────
      echo "=== Installing psql client ==="
      # AzureCLI container is Microsoft Azure Linux 3.0 — uses tdnf
      tdnf install -y postgresql 2>&1 | tail -3
      echo "psql: $(psql --version)"

      echo "=== Waiting for cluster to accept connections ==="
      for i in $(seq 1 24); do
        if psql -d postgres -c "SELECT 1" > /dev/null 2>&1; then
          echo "Cluster ready (attempt $i)"
          break
        fi
        echo "Attempt $i/24 — waiting 15s..."
        sleep 15
        if [ "$i" -eq 24 ]; then
          echo "ERROR: Cluster not ready after 24 attempts"
          exit 1
        fi
      done

      echo "=== Creating database '$APP_DB' ==="
      EXISTS=$(psql -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$APP_DB'")
      if [ "$EXISTS" = "1" ]; then
        echo "Database '$APP_DB' already exists — skipping"
      else
        psql -d postgres -c "CREATE DATABASE $APP_DB"
        echo "Database '$APP_DB' created successfully"
      fi

      echo "=== Creating database 'arize_db' ==="
      EXISTS=$(psql -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='arize_db'")
      if [ "$EXISTS" = "1" ]; then
        echo "Database 'arize_db' already exists — skipping"
      else
        psql -d postgres -c "CREATE DATABASE arize_db"
        echo "Database 'arize_db' created successfully"
      fi

      echo "=== Installing extensions in '$APP_DB' ==="
      for EXT in vector pg_diskann azure_ai age; do
        psql -d "$APP_DB" -c "CREATE EXTENSION IF NOT EXISTS $EXT CASCADE" \
          && echo "Extension '$EXT' ready." \
          || echo "WARNING: Extension '$EXT' failed — may not be supported, continuing"
      done
    '''
  }
}
