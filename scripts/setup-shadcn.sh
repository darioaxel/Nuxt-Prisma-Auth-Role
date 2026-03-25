#!/bin/bash
# Script para instalar shadcn-vue

echo "🎨 Instalando shadcn-vue..."
npx shadcn-vue@latest init

echo "📦 Instalando componentes..."
npx shadcn-vue@latest add button card input label badge avatar separator switch checkbox select dropdown-menu table sidebar collapsible

echo "✅ Listo!"
