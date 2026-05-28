targetScope = 'resourceGroup'

@minLength(1)
@maxLength(64)
@description('Name which is used for each resource')
param name string

@description('Environment name for resource token generation')
param environmentName string = name

@minLength(1)
@description('Location for the Resources')
@allowed([
  'australiaeast'
  'centralus'
  'uaenorth'
  'uksouth'
  'westus3'
])
@metadata({
  azd: {
    type: 'location'
    usageName : [
      'OpenAI.GlobalStandard.gpt-5, 150'
      'OpenAI.GlobalStandard.text-embedding-3-small, 70'
    ]
  }
})
param location string

@description('Whether to deploy Azure OpenAI resources')
param deployAzureOpenAI bool = true

@description('Whether to deploy the RAI content filter policy on the Azure OpenAI resource')
param deployContentFilter bool = true

@description('Version of the Azure OpenAI API to use for chat models')
param azureOpenAIAPIVersion string = '2025-01-01-preview'

@description('Version of the Azure OpenAI API to use for embedding models')
param azureEmbedAIAPIVersion string = '2024-10-21'

// Chat completion model parameters
@description('Name of the chat model to deploy')
param chatModelName string

@description('Name of the model deployment')
param chatDeploymentName string

@description('Version of the chat model to deploy')
param chatDeploymentVersion string = ''

@description('Sku of the chat deployment')
param chatDeploymentSku string

@description('Capacity of the chat deployment')
param chatDeploymentCapacity int

//arize-phoenix
@description('Name of the identity attached to backend app')
var arizeAppIdentityName = 'id-arize'

@description('Name of the Arize Phoenix app database')
var arizeDatabaseName = 'arize_db'

// Embedding model parameters
@description('Name of the embedding model to deploy')
param embedModelName string

@description('Name of the embedding model deployment')
param embedDeploymentName string

@description('Version of the embedding model to deploy')
param embedDeploymentVersion string = ''

@description('Sku of the embeddings model deployment')
param embedDeploymentSku string

@description('Capacity of the embedding deployment')
param embedDeploymentCapacity int

@description('Public IP of the machine running azd up — used for HorizonDB firewall rule')
param deployerPublicIp string = ''


// Computed values
@description('Unique string creation')
var resourceToken = toLower(uniqueString(subscription().id, resourceGroup().id, location, environmentName))

@description('Prefix to be used for all resources')
var prefix = '${toLower(name)}-${resourceToken}'

@description('HorizonDB cluster name (auto-generated)')
var horizonDbClusterName = take('${toLower(name)}-${take(resourceToken, 8)}-horizondb', 55)

@description('Tags to be applied to all resources')
var tags = { 'azd-env-name': name }

// Resource names
@description('Name of the frontend app')
var frontendAppName = 'rt-frontend'

@description('Name of the identity attached to frontend app')
var frontAppIdentityName = 'id-rt-frontend'

@description('Name of the backend app')
var backendAppName = 'rt-backend'

@description('Name of the identity attached to backend app')
var backendAppIdentityName = 'id-rt-backend'

@description('Name of the Backend app database')
var backendappDatabaseName = 'agentic_advisor'

@description('Name of PostgreSQL server port')
var postgresServerPort = '5432'

@description('Flags to control additional port mapping')
param addPortsFE bool = false
param addPortsBE bool = false
param addPortsArize bool = true

param arizeExPort int = 4317
param arizeTgPort int = 4317

@description('Additional port mapping for Azure Container Apps')
param feExPort int = 0
param feTgPort int = 0
param beExPort int = 0
param beTgPort int = 0

// OpenAI model deployments configuration
var modelDeployments = [
  {
    name: chatDeploymentName
    model: union({
      format: 'OpenAI'
      name: chatModelName
    }, empty(chatDeploymentVersion) ? {} : { version: chatDeploymentVersion })
    sku: {
      name: chatDeploymentSku
      capacity: chatDeploymentCapacity
    }
  }
  {
    name: embedDeploymentName
    model: union({
      format: 'OpenAI'
      name: embedModelName
    }, empty(embedDeploymentVersion) ? {} : { version: embedDeploymentVersion })
    sku: {
      name: embedDeploymentSku
      capacity: embedDeploymentCapacity
    }
  }
]

@description('UTC timestamp used to make the HorizonDB nested deployment name unique on re-runs')
param horizonDbDeploymentSuffix string = utcNow('yyyyMMddHHmm')

// HorizonDB cluster — native Bicep resource (Microsoft.HorizonDb/clusters@2026-01-20-preview).
module horizonDbServer 'horizondb/horizondb.bicep' = {
  name: 'horizondb-${horizonDbDeploymentSuffix}'
  params: {
    location: location
    clusterName:      horizonDbClusterName
    deploymentSuffix: horizonDbDeploymentSuffix
    scriptIdentityId: webIdentity.id
    deployerPublicIp: deployerPublicIp  // Optional: for firewall rule for deployed machine IP
  }
}

// HorizonDB FQDN — read directly from the cluster resource output (includes the hash segment)
var resolvedHorizonDbHost = horizonDbServer.outputs.clusterFqdn

// Arize Phoenix Database URL to connect with (HorizonDB password auth)
var arizeSQLUrl = 'postgresql://${horizonDbServer.outputs.adminLogin}:${horizonDbServer.outputs.adminPassword}@${resolvedHorizonDbHost}:${postgresServerPort}/${arizeDatabaseName}'


// Container apps environment and container registry
module containerApps 'core/host/container-apps-env-registry.bicep' = {
  name: 'container-apps'
  params: {
    name: 'app'
    location: location
    containerAppsEnvironmentName: '${prefix}-containerapps-env'
    containerRegistryName: '${replace(prefix, '-', '')}registry'
  }
}

// OpenAI module - always deployed for backend functionality
module openAI 'core/ai/cognitiveservices.bicep' = {
  name: 'openai'
  params: {
    name: '${prefix}-openai'
    location: location
    tags: tags
    disableLocalAuth: false
    deployments: modelDeployments
    deployContentFilter: deployContentFilter
  }
}

// Key vault module - deployed after OpenAI to get the keys
module keyVault 'core/keyvault/keyvault.bicep' = {
  name: 'keyVault'
  params: {
    location: location
    keyVaultName: take('${take(replace(prefix, '-', ''), 8)}${take(resourceToken, 7)}-keyvault', 24)
    postgresDatabase: backendappDatabaseName
    postgresHost: resolvedHorizonDbHost
    openAIendpoint: openAI.outputs.endpoint
    openAIApiKey: openAI.outputs.apiKey
    backendIdentityName: webIdentity.name
    arizeSQLUrl: arizeSQLUrl
    backendClientId: webIdentity.properties.clientId
    horizonDbPassword: horizonDbServer.outputs.adminPassword
    horizonDbUser: horizonDbServer.outputs.adminLogin

  }
}

// Create backend app identity
resource webIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: backendAppIdentityName
  location: location
}

// Attach key vault access policy to the Backend app identity
resource keyvrole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(webIdentity.id, resourceGroup().id, '4633458b-17de-408a-b874-0445c86b69e6')
  properties: {
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')
    principalId: webIdentity.properties.principalId
  }
}

// Create Arize app identity
@description('Name of the Arize app identity')
resource arizewebIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: arizeAppIdentityName
  location: location
}

// Attach key vault access policy to the Arize app identity
@description('Key vault role assignment for the Arize app identity')
resource arizekeyvrole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(arizewebIdentity.id, resourceGroup().id, '4633458b-17de-408a-b874-0445c86b69e6')
  properties: {
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')
    principalId: arizewebIdentity.properties.principalId
  }
}

// Attach ACR pull role to the Backend app identity
resource acrPullRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(webIdentity.id, resourceGroup().id, '7f951dda-4ed3-4680-a7ca-43fe172d538d')
  scope: resourceGroup()
  properties: {
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d')
    principalId: webIdentity.properties.principalId
  }
}

// Grant the deploying user Key Vault Secrets Officer so postprovision can write KV secrets
// Role ID 'b86a8fe4-44ce-4948-aee5-eccb2c155cd7' = Key Vault Secrets Officer
resource deployerKvSecretsOfficer 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, deployer().objectId, 'b86a8fe4-44ce-4948-aee5-eccb2c155cd7')
  scope: resourceGroup()
  properties: {
    principalType: 'User'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b86a8fe4-44ce-4948-aee5-eccb2c155cd7')
    principalId: deployer().objectId
  }
}

// Attach Cognitive Services OpenAI Contributor role to the Backend app identity
resource openAIRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(webIdentity.id, resourceGroup().id, 'a001fd3d-188f-4b5d-821b-7da978bf7442')
  scope: resourceGroup()
  properties: {
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'a001fd3d-188f-4b5d-821b-7da978bf7442')
    principalId: webIdentity.properties.principalId
  }
}

// Grant webIdentity Contributor on the RG so the deployment script can write HorizonDB firewall rules
// Role ID 'b24988ac-6180-42a0-ab88-20f7382dd24c' = Contributor
resource scriptContributorRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(webIdentity.id, resourceGroup().id, 'b24988ac-6180-42a0-ab88-20f7382dd24c')
  scope: resourceGroup()
  properties: {
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b24988ac-6180-42a0-ab88-20f7382dd24c')
    principalId: webIdentity.properties.principalId
  }
}

// Check if all required secrets exist in the Key Vault
resource checkSecrets 'Microsoft.Resources/deploymentScripts@2023-08-01' = {
  name: 'checkSecrets'
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${webIdentity.id}': {}
    }
  }
  kind: 'AzureCLI'
  properties: {
    azCliVersion: '2.70.0'
    scriptContent: '''
      #!/bin/bash
      set -e
      KEYVAULT_NAME="${KEYVAULT_NAME}"
      SECRETS=("postgres-host" "postgres-database" "azure-openai-endpoint" "backend-identity-name" "backend-client-id" "db-password" "db-user")

      for SECRET in "${SECRETS[@]}"; do
        echo -e "\nChecking if secret $SECRET exists in Key Vault $KEYVAULT_NAME..."
        az keyvault secret show --vault-name "$KEYVAULT_NAME" --name "$SECRET" > /dev/null 2>&1
        if [ $? -ne 0 ]; then
          echo -e "\nSecret $SECRET does not exist in Key Vault $KEYVAULT_NAME."
          exit 1
        fi
      done

      echo "All secrets exist in Key Vault $KEYVAULT_NAME."
    '''
    forceUpdateTag: uniqueString(resourceGroup().id)
    retentionInterval: 'PT1H'
    timeout: 'PT10M'
    environmentVariables: [
      {
        name: 'KEYVAULT_NAME'
        value: take('${take(replace(prefix, '-', ''), 8)}${take(resourceToken, 7)}-keyvault', 24)
      }
    ]
  }
  dependsOn: [
    keyVault
  ]
}

@description('Secrets for the Arize Phoenix app')
var arizeSecrets = {
  keyVaultReferences: [
    {
      name: 'phoenix-sql-database-url'
      keyVaultUrl: '${keyVault.outputs.keyVaultUri}secrets/phoenix-sql-database-url'
    }
  ]
}

// Secrets for the Backend app
var backendSecrets = {
  keyVaultReferences: [
    {
      name: 'postgres-host'
      keyVaultUrl: '${keyVault.outputs.keyVaultUri}secrets/postgres-host'
    }
    {
      name: 'postgres-database'
      keyVaultUrl: '${keyVault.outputs.keyVaultUri}secrets/postgres-database'
    }
    {
      name: 'azure-openai-endpoint'
      keyVaultUrl: '${keyVault.outputs.keyVaultUri}secrets/azure-openai-endpoint'
    }
    {
      name: 'azure-openai-api-key'
      keyVaultUrl: '${keyVault.outputs.keyVaultUri}secrets/azure-openai-api-key'
    }
    {
      name: 'backend-identity-name'
      keyVaultUrl: '${keyVault.outputs.keyVaultUri}secrets/backend-identity-name'
    }
    {
      name: 'backend-client-id'
      keyVaultUrl: '${keyVault.outputs.keyVaultUri}secrets/backend-client-id'
    }
    {
      name: 'db-password'
      keyVaultUrl: '${keyVault.outputs.keyVaultUri}secrets/db-password'
    }
    {
      name: 'db-user'
      keyVaultUrl: '${keyVault.outputs.keyVaultUri}secrets/db-user'
    }
  ]
}

// Environment variables for the Backend app
var backendEnv = [
  {
    name: 'DB_HOST'
    secretRef: 'postgres-host' // pragma: allowlist secret
  }
  {
    name: 'DB_NAME'
    secretRef: 'postgres-database' // pragma: allowlist secret
  }
  {
    name: 'DB_PORT'
    value: '5432'
  }
  {
    name: 'DB_USER'
    secretRef: 'db-user' // pragma: allowlist secret
  }
  {
    name: 'DB_PASSWORD'
    secretRef: 'db-password' // pragma: allowlist secret
  }
  {
    name: 'CHAT_HISTORY_DB_TABLE_NAME'
    value: 'chat_history' // pragma: allowlist secret
  }
  {
    name: 'AZURE_OPENAI_ENDPOINT'
    secretRef: 'azure-openai-endpoint' // pragma: allowlist secret
  }
  {
    name: 'AZURE_OPENAI_API_KEY'
    secretRef: 'azure-openai-api-key' // pragma: allowlist secret
  }
  {
    name: 'AZURE_IDENTITY_NAME'
    secretRef: 'backend-identity-name' // pragma: allowlist secret
  }
  {
    name: 'AZURE_OPENAI_CHAT_MODEL'
    value: chatModelName
  }
  {
    name: 'AZURE_OPENAI_CHAT_DEPLOYMENT_NAME'
    value: chatDeploymentName
  }
  {
    name: 'AZURE_OPENAI_EMBEDDING_MODEL'
    value: embedModelName
  }
  {
    name: 'AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME'
    value: embedDeploymentName
  }
  {
    name: 'AZURE_OPENAI_API_VERSION'
    value: azureOpenAIAPIVersion
  }
  {
    name: 'AZURE_CLIENT_ID'
    secretRef: 'backend-client-id' // pragma: allowlist secret
  }
  {
    name: 'APP_VERSION'
    value: '0.1.0'
  }
  {
    name: 'ENVIRONMENT'
    value: 'prod'
  }
  {
  name: 'SEC_FILES_SEEDING_BATCH_SIZE'
  value: '200'
  }
  {
    name: 'NEWS_ARTICLES_SEEDING_BATCH_SIZE'
    value: '200'
  }
  {
    name: 'VECTOR_STORE_COLLECTION_NAME_SEC_FILINGS'
    value: 'sec_filings'
  }
  {
    name: 'VECTOR_STORE_COLLECTION_NAME_NEWS_ARTICLES'
    value: 'news_articles'
  }
  {
    name: 'STOCK_PRICE_DROP_THRESHOLD_PERCENTAGE'
    value: '25'
  }
  {
    name: 'TOP_K_NEWS_ARTICLES'
    value: '10'
  }
  {
    name: 'TOP_K_SEC_FILINGS'
    value: '5'
  }
  {
    name: 'DB_TYPE'
    value: 'horizondb'
  }
  {
    name: 'PHOENIX_COLLECTOR_ENDPOINT'
    value: '${arize.outputs.SERVICE_WEB_URI}/v1/traces'
  }
  {
    name: 'PHOENIX_BASE_URL'
    value: arize.outputs.SERVICE_WEB_URI
  }
]

@description('Environment variables for the Arize Phoenix app')
var arizeEnv = [
  {
    name: 'PHOENIX_SQL_DATABASE_URL'
    secretRef: 'phoenix-sql-database-url' // pragma: allowlist secret
  }
  {
    name: 'PHOENIX_PORT'
    value: '6006'
  }
]

@description('Environment variables for the Frontend app')
var frontendEnv = [
  {
    name: 'VITE_API_BASE_URL'
    value: 'https://${backendAppName}.${containerApps.outputs.defaultDomain}'
  }
]

// Frontend app module
module frontend 'app/frontend.bicep' = {
  name: 'frontend'
  params: {
    name: frontendAppName
    location: location
    tags: tags
    identityName: frontAppIdentityName
    containerAppsEnvironmentName: containerApps.outputs.environmentName
    containerRegistryName: containerApps.outputs.registryName
    addPorts: addPortsFE
    addexposedport: feExPort
    addtargetport: feTgPort
    environmentVariables: frontendEnv
    secrets: []
  }
}

// Backend app module
module backend 'app/backend.bicep' = {
  name: 'backend'
  params: {
    name: backendAppName
    location: location
    tags: tags
    identityName: backendAppIdentityName
    containerAppsEnvironmentName: containerApps.outputs.environmentName
    containerRegistryName: containerApps.outputs.registryName
    addPorts: addPortsBE
    addexposedport: beExPort
    addtargetport: beTgPort
    environmentVariables: backendEnv
    secrets: backendSecrets
  }
  dependsOn: [ checkSecrets ]
}

// Arize Phoenix module
module arize 'core/arize-phoenix/arize.bicep' = {
  name: 'arize'
  params: {
    name: 'arize'
    location: location
    tags: tags
    identityName: arizeAppIdentityName
    containerAppsEnvironmentName: containerApps.outputs.environmentName
    containerRegistryName: containerApps.outputs.registryName
    // params to add 1 additional port, required for this service
    addPorts: addPortsArize
    addexposedport: arizeExPort
    addtargetport: arizeTgPort
    environmentVariables: arizeEnv
    secrets: arizeSecrets
  }
  dependsOn: [ checkSecrets ]
}

// Outputs
output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
output AZURE_KEY_VAULT_NAME string = keyVault.outputs.keyVaultName

output AZURE_CONTAINER_ENVIRONMENT_NAME string = containerApps.outputs.environmentName
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = containerApps.outputs.registryLoginServer
output AZURE_CONTAINER_REGISTRY_NAME string = containerApps.outputs.registryName

output RESOURCE_GROUP_ID string = resourceGroup().id

output POSTGRES_HOST string = resolvedHorizonDbHost
output POSTGRES_NAME string = backendappDatabaseName
output POSTGRES_USERNAME string = horizonDbServer.outputs.adminLogin
output POSTGRES_DATABASE string = backendappDatabaseName
output DB_TYPE string = 'horizondb'



output AZURE_OPENAI_ENDPOINT string = deployAzureOpenAI ? openAI.outputs.endpoint : ''
output AZURE_OPENAI_API_VERSION string = deployAzureOpenAI ? azureOpenAIAPIVersion : ''
output AZURE_OPENAI_CHAT_DEPLOYMENT string = deployAzureOpenAI ? chatDeploymentName : ''
output AZURE_OPENAI_CHAT_DEPLOYMENT_VERSION string = deployAzureOpenAI ? chatDeploymentVersion : ''
output AZURE_OPENAI_CHAT_DEPLOYMENT_CAPACITY int = deployAzureOpenAI ? chatDeploymentCapacity : 1
output AZURE_OPENAI_CHAT_DEPLOYMENT_SKU string = deployAzureOpenAI ? chatDeploymentSku : ''
output AZURE_OPENAI_CHAT_MODEL string = deployAzureOpenAI ? chatModelName : ''
output AZURE_OPENAI_EMBED_DEPLOYMENT string = deployAzureOpenAI ? embedDeploymentName : ''
output AZURE_OPENAI_EMBED_DEPLOYMENT_VERSION string = deployAzureOpenAI ? embedDeploymentVersion : ''
output AZURE_OPENAI_API_VERSION_EMBED string = deployAzureOpenAI ? azureEmbedAIAPIVersion : ''
output AZURE_OPENAI_EMBED_DEPLOYMENT_CAPACITY int = deployAzureOpenAI ? embedDeploymentCapacity : 1
output AZURE_OPENAI_EMBED_DEPLOYMENT_SKU string = deployAzureOpenAI ? embedDeploymentSku : ''
output AZURE_OPENAI_EMBED_MODEL string = deployAzureOpenAI ? embedModelName : ''

output SERVICE_BACKEND_IDENTITY_PRINCIPAL_ID string = backend.outputs.SERVICE_WEB_IDENTITY_PRINCIPAL_ID
output SERVICE_BACKEND_IDENTITY_NAME string = backend.outputs.SERVICE_WEB_IDENTITY_NAME
output SERVICE_BACKEND_NAME string = backend.outputs.SERVICE_WEB_NAME
output SERVICE_BACKEND_URI string = backend.outputs.SERVICE_WEB_URI
output SERVICE_BACKEND_IMAGE_NAME string = backend.outputs.SERVICE_WEB_IMAGE_NAME

output SERVICE_FRONTEND_IDENTITY_PRINCIPAL_ID string = frontend.outputs.SERVICE_WEB_IDENTITY_PRINCIPAL_ID
output SERVICE_FRONTEND_IDENTITY_NAME string = frontend.outputs.SERVICE_WEB_IDENTITY_NAME
output SERVICE_FRONTEND_NAME string = frontend.outputs.SERVICE_WEB_NAME
output SERVICE_FRONTEND_URI string = frontend.outputs.SERVICE_WEB_URI
output SERVICE_FRONTEND_IMAGE_NAME string = frontend.outputs.SERVICE_WEB_IMAGE_NAME

output SERVICE_ARIZE_URI string = arize.outputs.SERVICE_WEB_URI
output SERVICE_ARIZE_IDENTITY_PRINCIPAL_ID string = arize.outputs.SERVICE_WEB_IDENTITY_PRINCIPAL_ID
output ARIZE_SQL_URI string = arizeSQLUrl
