# Tiltfile for Virtual DM Application
# This file configures Tilt to build and deploy the Virtual DM app to k3d

# Load extensions
load('ext://restart_process', 'docker_build_with_restart')

# Configuration
app_name = 'virtual-dm'
image_name = app_name

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

# Configure ClickHouse operator resource
k8s_resource(
    workload='clickhouse-operator',
    labels=['clickhouse']
)

# Configure ClickHouse installation with port forwarding
k8s_resource(
    new_name='chi-virtual-dm-db',
    objects=[
        'virtual-dm-clickhouse:ClickHouseInstallation:default'
    ],
    labels=['clickhouse'],
    port_forwards=[
        port_forward(8123, 8123, name="http_port", link_path="/play"),
        port_forward(9000, 9000, name="tcp_port")
    ],
    # Track the StatefulSet pods created by the ClickHouse operator
    extra_pod_selectors=[
        {'clickhouse.altinity.com/chi': 'virtual-dm-clickhouse'},
        {'clickhouse.altinity.com/cluster': 'clickhouse'}
    ]
)

# Configure port forwarding for local access
k8s_resource(
    'virtual-dm',
    port_forwards=['3000:3000'],
    resource_deps=['chi-virtual-dm-db'],
)

# Optional: Add a resource to show logs
k8s_resource(
    'virtual-dm',
    labels=['app'],
)