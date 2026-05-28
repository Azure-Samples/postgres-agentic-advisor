param location string

@description('PostgreSQL Backend Database to store in Key Vault')
@secure()
param postgresDatabase string

@description('PostgreSQL / HorizonDB Hostname to store in Key Vault')
@secure()
param postgresHost string

@description('Azure OpenAI endpoint URL to store in Key Vault')
@secure()
param openAIendpoint string

@description('Azure OpenAI API key to store in Key Vault')
@secure()
param openAIApiKey string

@description('Arize SQL DATABASE URL to store in Key Vault')
@secure()
param arizeSQLUrl string

@description('Backend managed identity name to store in Key Vault')
param backendIdentityName string

@description('Backend managed identity client ID to store in Key Vault')
param backendClientId string

@description('Name of the key vault')
param keyVaultName string

@secure()
@description('HorizonDB admin password')
param horizonDbPassword string

@description('HorizonDB admin username')
param horizonDbUser string

resource keyVault 'Microsoft.KeyVault/vaults@2024-11-01' = {
  name: keyVaultName
  location: location
  properties: {
    enabledForDeployment: false
    enabledForTemplateDeployment: true
    enabledForDiskEncryption: false
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
    provisioningState: 'Succeeded'
    sku: {
      name: 'standard'
      family: 'A'
    }
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
}

resource postgresDB 'Microsoft.KeyVault/vaults/secrets@2024-11-01' = {
  parent: keyVault
  name: 'postgres-database'
  properties: {
    value: postgresDatabase
  }
}

resource postgresHostURL 'Microsoft.KeyVault/vaults/secrets@2024-11-01' = {
  parent: keyVault
  name: 'postgres-host'
  properties: {
    value: postgresHost
  }
}

resource openAIendpointURL 'Microsoft.KeyVault/vaults/secrets@2024-11-01' = {
  parent: keyVault
  name: 'azure-openai-endpoint'
  properties: {
    value: openAIendpoint
  }
}

resource openAIApiKeySecret 'Microsoft.KeyVault/vaults/secrets@2024-11-01' = {
  parent: keyVault
  name: 'azure-openai-api-key'
  properties: {
    value: openAIApiKey
  }
}

resource backendIdentityNameSecret 'Microsoft.KeyVault/vaults/secrets@2024-11-01' = {
  parent: keyVault
  name: 'backend-identity-name'
  properties: {
    value: backendIdentityName
  }
}

resource backendClientIdSecret 'Microsoft.KeyVault/vaults/secrets@2024-11-01' = {
  parent: keyVault
  name: 'backend-client-id'
  properties: {
    value: backendClientId
  }
}

resource arizeSQLEndpoint 'Microsoft.KeyVault/vaults/secrets@2024-11-01' = {
  parent: keyVault
  name: 'phoenix-sql-database-url'
  properties: {
    value: arizeSQLUrl
  }
}

// HorizonDB secrets
resource dbPasswordSecret 'Microsoft.KeyVault/vaults/secrets@2024-11-01' = {
  parent: keyVault
  name: 'db-password'
  properties: {
    value: horizonDbPassword
  }
}

resource dbUserSecret 'Microsoft.KeyVault/vaults/secrets@2024-11-01' = {
  parent: keyVault
  name: 'db-user'
  properties: {
    value: horizonDbUser
  }
}

output keyVaultName string = keyVault.name
output keyVaultUri string = keyVault.properties.vaultUri
