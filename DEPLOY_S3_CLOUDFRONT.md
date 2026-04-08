# Guía de Despliegue: S3 + CloudFront (mx-central-1)

Esta guía te lleva paso a paso por la configuración de infraestructura en AWS
para servir este frontend React desde S3 + CloudFront.

> **Prerrequisitos:** AWS CLI configurado localmente, acceso a tu cuenta AWS.

---

## Arquitectura Final

```
Usuario → CloudFront (global)
             ├── /api/*  → Tu backend (ALB, ECS, EC2, etc.)
             └── /*      → S3 Bucket (mx-central-1)
```

CloudFront actúa como punto único de entrada:
- Sirve el frontend estático desde S3.
- Hace proxy de las llamadas `/api/*` a tu backend (sin necesidad de CORS).

---

## Paso 1 – Crear el bucket S3

```bash
# Crear el bucket en México (mx-central-1)
aws s3api create-bucket \
  --bucket biblia-frontend-prod \
  --region mx-central-1 \
  --create-bucket-configuration LocationConstraint=mx-central-1

# Bloquear todo acceso público directo (CloudFront usará OAC)
aws s3api put-public-access-block \
  --bucket biblia-frontend-prod \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

> Guarda el nombre del bucket: `biblia-frontend-prod` (o el que elijas).

---

## Paso 2 – Solicitar certificado SSL en ACM

> ⚠️ **OBLIGATORIO:** CloudFront solo acepta certificados de la región `us-east-1`.

```bash
# Solicitar certificado (cambia tudominio.com por el tuyo)
aws acm request-certificate \
  --domain-name tudominio.com \
  --subject-alternative-names www.tudominio.com \
  --validation-method DNS \
  --region us-east-1
```

Guarda el ARN del certificado que devuelve este comando. Luego valida el dominio
agregando los registros CNAME que te muestra la consola de ACM.

---

## Paso 3 – Crear Origin Access Control (OAC) para S3

OAC es la forma moderna y segura de que CloudFront acceda a S3 (reemplaza OAI).

1. Ve a la consola de **CloudFront** → **Origin access**.
2. Haz clic en **Create control setting**.
3. Configura:
   - **Name:** `biblia-frontend-oac`
   - **Origin type:** S3
   - **Signing behavior:** Sign requests (recommended)
4. Guarda y copia el **ID del OAC**.

---

## Paso 4 – Crear la distribución CloudFront

Ve a **CloudFront** → **Create distribution** y configura:

### Origins (Orígenes)

#### Origin 1 – S3 (Frontend estático)
| Campo | Valor |
|---|---|
| Origin domain | `biblia-frontend-prod.s3.mx-central-1.amazonaws.com` |
| Origin access | Origin access control settings (OAC) → selecciona el OAC creado |
| Name | `S3-biblia-frontend` |

#### Origin 2 – Backend (API)
| Campo | Valor |
|---|---|
| Origin domain | URL de tu backend (ej: `api.tudominio.com`) |
| Protocol | HTTPS only |
| Name | `Backend-API` |

### Behaviors (Comportamientos)

#### Behavior 1 – API (debe ir PRIMERO en la lista)
| Campo | Valor |
|---|---|
| Path pattern | `/api/*` |
| Origin | `Backend-API` |
| Viewer protocol policy | Redirect HTTP to HTTPS |
| Allowed HTTP methods | GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE |
| Cache policy | `CachingDisabled` (ID: `4135ea2d-6df8-44a3-9df3-4b5a84be39ad`) |
| Origin request policy | `AllViewerExceptHostHeader` |

#### Behavior 2 – Frontend SPA (Default `/*`)
| Campo | Valor |
|---|---|
| Path pattern | Default (`*`) |
| Origin | `S3-biblia-frontend` |
| Viewer protocol policy | Redirect HTTP to HTTPS |
| Allowed HTTP methods | GET, HEAD |
| Cache policy | `CachingOptimized` |
| Compress objects | Yes |

### Configuración General
| Campo | Valor |
|---|---|
| Price class | Use all edge locations (o "Use only North America and Europe") |
| Alternate domain names (CNAMEs) | `tudominio.com`, `www.tudominio.com` |
| Custom SSL certificate | Selecciona el certificado ACM de `us-east-1` |
| Default root object | `index.html` |

### Manejo de errores para React Router (SPA)

En la pestaña **Error pages**, agrega estas dos reglas:

| HTTP error code | Response page path | HTTP response code |
|---|---|---|
| 403 | `/index.html` | 200 |
| 404 | `/index.html` | 200 |

Esto hace que React Router maneje las rutas como `/strongs/G123` correctamente.

---

## Paso 5 – Adjuntar política de bucket S3 para OAC

Después de crear la distribución, CloudFront te mostrará una política de bucket
lista para copiar. Ve a **S3** → tu bucket → **Permissions** → **Bucket policy**
y pégala. Se verá similar a:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::biblia-frontend-prod/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::TU_ACCOUNT_ID:distribution/TU_DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

---

## Paso 6 – Configurar DNS

En tu proveedor de DNS (Route 53 u otro):

```
tudominio.com     ALIAS / CNAME  → dXXXXXXXXXXXXX.cloudfront.net
www.tudominio.com ALIAS / CNAME  → dXXXXXXXXXXXXX.cloudfront.net
```

Si usas **Route 53**:
- Tipo de registro: **A**
- Alias: **Yes**
- Route traffic to: **CloudFront distribution**

---

## Paso 7 – Configurar GitHub Actions Secrets

Ve a tu repositorio en GitHub → **Settings** → **Secrets and variables** → **Actions**
y agrega los siguientes secrets:

| Secret | Valor |
|---|---|
| `AWS_ACCESS_KEY_ID` | Access key de un IAM user/role con permisos S3 + CloudFront |
| `AWS_SECRET_ACCESS_KEY` | Secret de ese IAM user |
| `S3_BUCKET_NAME` | `biblia-frontend-prod` (nombre del bucket) |
| `CLOUDFRONT_DISTRIBUTION_ID` | ID de la distribución (ej: `E1XXXXXXXXXXXXX`) |
| `REACT_APP_API_URL` | URL base de tu backend (si la usas en el código) |

---

## Paso 8 – Permisos IAM para el pipeline

El IAM user/role usado por GitHub Actions necesita esta política mínima:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::biblia-frontend-prod",
        "arn:aws:s3:::biblia-frontend-prod/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::TU_ACCOUNT_ID:distribution/TU_DISTRIBUTION_ID"
    }
  ]
}
```

---

## Flujo completo de un despliegue

```
git push → main
    ↓
GitHub Actions
    ↓
npm ci + npm run build  (genera /build)
    ↓
aws s3 sync → S3 (mx-central-1)
    ↓
CloudFront invalidation /* → usuarios reciben la nueva versión
```

---

## Archivos que ya NO necesitas (pueden eliminarse)

- `Dockerfile` — ya no se construye ni despliega una imagen Docker
- `nginx.conf` — el proxy y el routing SPA los maneja CloudFront
- `.dockerignore` — ya no aplica

> Puedes mantenerlos si quieres conservar la opción de correr la app localmente
> con Docker para desarrollo.

