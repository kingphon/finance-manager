# K8s Deployment Guide for Finance Manager

## Overview

This document explains the Kubernetes deployment setup for the Finance Manager application on a k3s cluster running on a GCP VM.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Cloudflare                               │
│   dashboard.cash-pilot.shop ──┐                                  │
│   api.cash-pilot.shop ────────┼──► VM IP (35.247.190.183)       │
└───────────────────────────────┼─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                      GCP VM (cash-pilot)                         │
│                      k3s Cluster                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Traefik Ingress                          │ │
│  │   /dashboard.* ──► frontend:80                              │ │
│  │   /api.* ──────► backend:8000                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │   Frontend   │    │   Backend    │    │ External Secrets │  │
│  │   (Next.js)  │    │  (FastAPI)   │    │    Operator      │  │
│  └──────────────┘    └──────┬───────┘    └────────┬─────────┘  │
│                             │                      │            │
└─────────────────────────────┼──────────────────────┼────────────┘
                              │                      │
                              ▼                      ▼
                    ┌──────────────┐      ┌───────────────────┐
                    │   Supabase   │      │ GCP Secret Manager│
                    │  (Postgres)  │      │                   │
                    └──────────────┘      └───────────────────┘
```

## What Was Configured

### 1. Kubernetes Manifests (`k8s/`)

#### `namespace.yaml`
Creates a dedicated namespace `finance-manager` to isolate resources.

#### `backend.yaml`
- **Deployment**: Runs the FastAPI backend container
- **Service**: Exposes backend internally on port 8000
- **Image**: Pulled from GCP Artifact Registry
- **Secrets**: `DATABASE_URL` injected from Kubernetes secret (synced from GCP Secret Manager)

#### `frontend.yaml`
- **Deployment**: Runs the Next.js frontend container
- **Service**: Exposes frontend internally on port 80 (maps to container port 3000)
- **Image**: Pulled from GCP Artifact Registry
- **Environment**: `NEXT_PUBLIC_API_URL` set to `https://api.cash-pilot.shop`

#### `ingress.yaml`
- Routes traffic based on hostname:
  - `dashboard.cash-pilot.shop` → frontend service
  - `api.cash-pilot.shop` → backend service
- Uses Traefik ingress controller (default in k3s)

#### `external-secret.yaml`
- **ClusterSecretStore**: Configures connection to GCP Secret Manager
- **ExternalSecret**: Syncs `finance-manager-db-url` from GCP to Kubernetes secret `backend-secrets`

### 2. GCP Secret Manager

Stores sensitive configuration securely:

| Secret Name | Description |
|-------------|-------------|
| `finance-manager-db-url` | PostgreSQL connection string for Supabase |

**Why use Secret Manager?**
- Secrets are not stored in git
- Centralized secret management
- Automatic rotation support
- Audit logging

### 3. External Secrets Operator (ESO)

Installed via Helm to sync secrets from GCP Secret Manager to Kubernetes.

**How it works:**
1. ESO reads from GCP Secret Manager using the VM's service account
2. Creates/updates Kubernetes secrets automatically
3. Refreshes every hour (configurable)

### 4. GCP IAM Permissions

The VM's service account (`599840013666-compute@developer.gserviceaccount.com`) was granted:

| Role | Purpose |
|------|---------|
| `roles/secretmanager.secretAccessor` | Read secrets from GCP Secret Manager |
| `roles/artifactregistry.reader` | Pull container images from Artifact Registry |

### 5. VM Configuration

The GCP VM was updated with:
- **Scope**: `cloud-platform` (allows access to all GCP APIs)
- **New IP**: `35.247.190.183` (changed after restart)

### 6. Image Pull Authentication

Created `gcr-secret` in Kubernetes to authenticate with GCP Artifact Registry:
- Uses OAuth2 access token from VM's service account
- Allows k3s to pull private container images

## Cloudflare DNS Setup

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `dashboard` | `35.247.190.183` | Proxied ☁️ |
| A | `api` | `35.247.190.183` | Proxied ☁️ |

**Note:** Update these records if the VM IP changes.

## Current Issue

The backend cannot connect to Supabase because:
1. Supabase direct connection (`db.*.supabase.co`) only has IPv6
2. The GCP VM doesn't have IPv6 connectivity
3. Need to use the Supabase **pooler connection** which has IPv4

**Solution:** Get the pooler connection string from Supabase dashboard:
- Go to **Project Settings → Database → Connection string → URI (Pooler)**

## Deployment Commands

### Deploy from local machine:
```bash
# Copy files to VM
gcloud compute scp k8s/*.yaml cash-pilot:~/ --zone=asia-southeast1-c

# SSH and apply
gcloud compute ssh cash-pilot --zone=asia-southeast1-c --command="
  sudo kubectl apply -f ~/namespace.yaml
  sudo kubectl apply -f ~/external-secret.yaml
  sudo kubectl apply -f ~/backend.yaml
  sudo kubectl apply -f ~/frontend.yaml
  sudo kubectl apply -f ~/ingress.yaml
"
```

### Check status:
```bash
gcloud compute ssh cash-pilot --zone=asia-southeast1-c --command="
  sudo kubectl get pods -n finance-manager
  sudo kubectl get externalsecret -n finance-manager
"
```

### View logs:
```bash
gcloud compute ssh cash-pilot --zone=asia-southeast1-c --command="
  sudo kubectl logs -n finance-manager -l app=backend --tail=50
"
```

### Update a secret in GCP:
```bash
echo -n "new-secret-value" | gcloud secrets versions add finance-manager-db-url --data-file=-

# Refresh in k8s
gcloud compute ssh cash-pilot --zone=asia-southeast1-c --command="
  sudo kubectl delete externalsecret backend-secrets -n finance-manager
  sudo kubectl apply -f ~/external-secret.yaml
  sudo kubectl rollout restart deployment backend -n finance-manager
"
```

## File Structure

```
k8s/
├── namespace.yaml        # Namespace definition
├── backend.yaml          # Backend deployment + service
├── frontend.yaml         # Frontend deployment + service
├── ingress.yaml          # Ingress rules for routing
└── external-secret.yaml  # GCP Secret Manager integration
```

## GitHub Actions CI/CD

The `.github/workflows/build-and-push.yml` workflow:
1. Builds Docker images on push to `main`
2. Pushes to GCP Artifact Registry
3. SSHs to VM and applies k8s manifests
4. Restarts deployments to pull new images

## Security Considerations

1. **No hardcoded secrets**: All secrets stored in GCP Secret Manager
2. **No service account keys**: Uses Workload Identity Federation for GitHub Actions, VM service account for k3s
3. **Private container registry**: Images stored in private GCP Artifact Registry
4. **HTTPS via Cloudflare**: SSL termination at Cloudflare proxy

## Troubleshooting

### Pods stuck in ImagePullBackOff
```bash
# Check if gcr-secret exists and is valid
sudo kubectl get secret gcr-secret -n finance-manager

# Recreate if needed
ACCESS_TOKEN=$(gcloud auth print-access-token)
sudo kubectl delete secret gcr-secret -n finance-manager
sudo kubectl create secret docker-registry gcr-secret \
  --namespace=finance-manager \
  --docker-server=asia-southeast1-docker.pkg.dev \
  --docker-username=oauth2accesstoken \
  --docker-password="$ACCESS_TOKEN"
```

### ExternalSecret not syncing
```bash
# Check status
sudo kubectl describe externalsecret backend-secrets -n finance-manager

# Common issues:
# - VM doesn't have secretmanager.secretAccessor role
# - VM doesn't have cloud-platform scope
# - Secret name mismatch
```

### Backend can't connect to database
```bash
# Check the secret value
sudo kubectl get secret backend-secrets -n finance-manager -o jsonpath='{.data.DATABASE_URL}' | base64 -d

# Common issues:
# - Wrong password
# - Using IPv6-only hostname (use pooler instead)
# - Firewall blocking outbound connections
```
