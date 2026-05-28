metadata description = 'Creates Arize Azure Container App.'
param name string
param location string = resourceGroup().location
param tags object = {}

param containerAppsEnvironmentName string
param containerRegistryName string
param identityName string
param serviceName string = 'arize'
param environmentVariables array = []
param addPorts bool
@secure()
param secrets object = {}

param addexposedport int
param addtargetport int

resource webIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: identityName
  location: location
}

var keyvaultIdentitySecrets = [for secret in secrets.keyVaultReferences: {
  name: secret.name
  keyVaultUrl: secret.keyVaultUrl
  identity: webIdentity.id
}]

module arize '../host/container-app.bicep' = {
  name: '${serviceName}-container-app-module'
  params: {
    name: name
    location: location
    tags: union(tags, { 'azd-service-name': serviceName })
    identityName: webIdentity.name
    containerAppsEnvironmentName: containerAppsEnvironmentName
    containerRegistryName: containerRegistryName
    addPorts: addPorts
    addexposedport: addexposedport
    addtargetport: addtargetport
    registries: [
      {
        server: '${containerRegistryName}.azurecr.io'
        identity: webIdentity.id
  }]
    env: environmentVariables
    secrets: keyvaultIdentitySecrets
    targetPort: 6006
  }
}

output SERVICE_WEB_IDENTITY_PRINCIPAL_ID string = webIdentity.properties.principalId
output SERVICE_WEB_IDENTITY_NAME string = webIdentity.name
output SERVICE_WEB_ID string = webIdentity.id
output SERVICE_WEB_NAME string = arize.outputs.name
output SERVICE_WEB_URI string = arize.outputs.uri
output SERVICE_WEB_IMAGE_NAME string = arize.outputs.imageName
output SERVICE_WEB_TAG_NAME object = { 'azd-service-name': serviceName }
output uri string = arize.outputs.uri
output arizeprincipalId string = webIdentity.properties.principalId
