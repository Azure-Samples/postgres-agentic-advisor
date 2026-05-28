metadata description = 'Creates Backend Azure Container App.'
param name string
param location string = resourceGroup().location
param tags object = {}

param containerAppsEnvironmentName string
param containerRegistryName string
param addPorts bool
param identityName string
param serviceName string = 'backend'
param environmentVariables array = []
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

module backendapp '../core/host/container-app.bicep' = {
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
    env: union(
      environmentVariables, []
    )
    secrets: keyvaultIdentitySecrets
    targetPort: 8000
  }
}

output SERVICE_WEB_IDENTITY_PRINCIPAL_ID string = webIdentity.properties.principalId
output SERVICE_WEB_IDENTITY_NAME string = webIdentity.name
output SERVICE_WEB_NAME string = backendapp.outputs.name
output SERVICE_WEB_URI string = backendapp.outputs.uri
output SERVICE_WEB_IMAGE_NAME string = backendapp.outputs.imageName
output SERVICE_WEB_CLIENT_ID string = webIdentity.properties.clientId

output uri string = backendapp.outputs.uri
