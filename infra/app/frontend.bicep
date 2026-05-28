metadata description = 'Creates Frontend Azure Container App.'
param name string
param location string = resourceGroup().location
param tags object = {}

param containerAppsEnvironmentName string
param containerRegistryName string
param addPorts bool
param identityName string
param serviceName string = 'frontend'
param environmentVariables array = []
param secrets array = []
param addexposedport int
param addtargetport int

resource webIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: identityName
  location: location
}

module frontendapp '../core/host/container-app.bicep' = {
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
    secrets: secrets
    targetPort: 80
  }
}

output SERVICE_WEB_IDENTITY_PRINCIPAL_ID string = webIdentity.properties.principalId
output SERVICE_WEB_IDENTITY_NAME string = webIdentity.name
output SERVICE_WEB_NAME string = frontendapp.outputs.name
output SERVICE_WEB_URI string = frontendapp.outputs.uri
output SERVICE_WEB_IMAGE_NAME string = frontendapp.outputs.imageName

output uri string = frontendapp.outputs.uri
