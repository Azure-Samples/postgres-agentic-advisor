metadata description = 'Creates an Azure Cognitive Services (Azure OpenAI) account, custom RAI content filter policy (severity threshold: High for all categories, Asynchronous_filter mode), and model deployments.'

// Core account parameters
param name string
param location string = resourceGroup().location
param tags object = {}
@description('The custom subdomain name used to access the API. Defaults to the value of the name parameter.')
param customSubDomainName string = name
param disableLocalAuth bool = false
param deployments array = []
param kind string = 'OpenAI'
@allowed(['Enabled', 'Disabled'])
param publicNetworkAccess string = 'Enabled'

@description('Whether to deploy a custom RAI content filter policy with High severity thresholds for all categories.')
param deployContentFilter bool = true

// Account SKU / networking
param accountSku object = {
  name: 'S0'
}
param allowedIpRules array = []
param networkAcls object = empty(allowedIpRules)
  ? {
      defaultAction: 'Allow'
    }
  : {
      ipRules: allowedIpRules
      defaultAction: 'Deny'
    }

// Name of the custom RAI content filter policy
var contentFilterPolicyName = 'model-content-filter'

// Cognitive Services (Azure OpenAI) account
resource aiaccount 'Microsoft.CognitiveServices/accounts@2026-03-01' = {
  name: name
  location: location
  tags: tags
  kind: kind
  properties: {
    customSubDomainName: customSubDomainName
    publicNetworkAccess: publicNetworkAccess
    networkAcls: networkAcls
    disableLocalAuth: disableLocalAuth
  }
  sku: accountSku
}

// Custom RAI content filter policy.
// Uses Asynchronous_filter mode (recommended for API version >= 2024-10-01 per Microsoft docs).
// Individual filters set blocking: true, so content exceeding the severity threshold is blocked.
// Covers Hate, Selfharm, Sexual, Violence (Prompt & Completion) and Jailbreak + Indirect Attack (Prompt only).
resource raiPolicy 'Microsoft.CognitiveServices/accounts/raiPolicies@2026-03-01' = if (deployContentFilter) {
  parent: aiaccount
  name: contentFilterPolicyName
  properties: {
    basePolicyName: 'Microsoft.Default'
    mode: 'Asynchronous_filter'
    contentFilters: [
      {
        name: 'Hate'
        severityThreshold: 'High'
        blocking: true
        enabled: true
        source: 'Prompt'
      }
      {
        name: 'Hate'
        severityThreshold: 'High'
        blocking: true
        enabled: true
        source: 'Completion'
      }
      {
        name: 'Selfharm'
        severityThreshold: 'High'
        blocking: true
        enabled: true
        source: 'Prompt'
      }
      {
        name: 'Selfharm'
        severityThreshold: 'High'
        blocking: true
        enabled: true
        source: 'Completion'
      }
      {
        name: 'Sexual'
        severityThreshold: 'High'
        blocking: true
        enabled: true
        source: 'Prompt'
      }
      {
        name: 'Sexual'
        severityThreshold: 'High'
        blocking: true
        enabled: true
        source: 'Completion'
      }
      {
        name: 'Violence'
        severityThreshold: 'High'
        blocking: true
        enabled: true
        source: 'Prompt'
      }
      {
        name: 'Violence'
        severityThreshold: 'High'
        blocking: true
        enabled: true
        source: 'Completion'
      }
      // Jailbreak and Indirect Attack are binary (no severityThreshold) — Prompt only
      {
        name: 'Jailbreak'
        blocking: true
        enabled: true
        source: 'Prompt'
      }
      {
        name: 'Indirect Attack'
        blocking: true
        enabled: true
        source: 'Prompt'
      }
    ]
  }
}

// Serialise model deployments; ensure they depend on policy if created
@batchSize(1)
resource openaideployment 'Microsoft.CognitiveServices/accounts/deployments@2024-10-01' = [
  for deployment in deployments: {
    parent: aiaccount
    name: deployment.name
    properties: {
      model: deployment.model
      raiPolicyName: deployContentFilter ? contentFilterPolicyName : null
    }
    sku: deployment.?sku ?? {
      name: 'Standard'
      capacity: 20
    }
    dependsOn: [raiPolicy]
  }
]

// Outputs
output endpoint string = aiaccount.properties.endpoint
output id string = aiaccount.id
output name string = aiaccount.name
output apiKey string = aiaccount.listKeys().key1
// modelInfos output excludes keys to avoid secret exposure via deployment outputs.
output modelInfos array = [
  for d in deployments: {
    name: d.name
    endpoint: aiaccount.properties.endpoint
  }
]

// Provide a secure reference output for the account id so parent template can fetch keys directly without re-exposing them.
output accountResourceId string = aiaccount.id

// Name of the deployed RAI content filter policy (empty string when deployContentFilter is false)
output contentFilterPolicyName string = deployContentFilter ? contentFilterPolicyName : ''
