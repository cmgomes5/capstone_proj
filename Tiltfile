# Tiltfile for Virtual DM Application
# This file configures Tilt to build and deploy the Virtual DM app to k3d

# Load extensions
load('ext://restart_process', 'docker_build_with_restart')

# Configuration
app_name = 'virtual-dm'
registry = 'virtual-dm-registry:5000'
image_name = registry + '/' + app_name

# Configure registry settings for k3d
default_registry(registry)

# Build the Docker image
docker_build(
    image_name,
    context='.',
    dockerfile='./Dockerfile',
    # Live update for faster development
    live_update=[
        # Sync source code changes
        sync('./virtual-dm/src', '/app/src'),
        sync('./virtual-dm/public', '/app/public'),
        sync('./virtual-dm/package.json', '/app/package.json'),
        # Restart the container when package.json changes
        run('npm install', trigger=['./virtual-dm/package.json']),
    ],
    # Only rebuild when these files change
    only=[
        './virtual-dm/',
        './Dockerfile',
    ],
)

# Deploy Kubernetes manifests
k8s_yaml(kustomize('./manifests'))

# Configure port forwarding for local access
k8s_resource(
    'virtual-dm',
    port_forwards=['3000:3000'],
    resource_deps=[],
)

# Set up local development URL
local_resource(
    'virtual-dm-url',
    cmd='echo "Virtual DM available at: http://localhost:3000"',
    resource_deps=['virtual-dm'],
)

# Optional: Add a resource to show logs
k8s_resource(
    'virtual-dm',
    labels=['app'],
)

print("🎲 Virtual DM Tilt Configuration Loaded!")
print("📝 Access your D&D Combat Tracker at: http://localhost:3000")
print("🔧 Use 'tilt down' to stop all resources")