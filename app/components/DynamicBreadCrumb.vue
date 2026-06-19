<script setup lang="ts">
const props = defineProps<{
  url: string
}>()

const collectionMap: Record<string, string> = {
  '50010314-cpifp_los_enlaces': 'cpifp_enlaces',
  '50020125-campusvirtualfp': 'campus_virtual',
  'ayuda': 'ayuda',
  'blog': 'blog',
}

const baseCrumbs = computed(() => {
  const segments = props.url.split('/').filter(Boolean)
  const result: { label: string; path: string }[] = []
  let path = ''
  for (const segment of segments) {
    path += `/${segment}`
    result.push({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      path,
    })
  }
  return result
})

const firstSegment = computed(() => props.url.split('/').filter(Boolean)[0]?.toLowerCase() || '')
const collection = computed(() => collectionMap[firstSegment.value])

const { data: contentItems, refresh } = useAsyncData(
  `breadcrumbs-${props.url}`,
  async () => {
    if (!collection.value) return []
    return queryCollection(collection.value).all()
  },
  { default: () => [] }
)

watch(() => props.url, () => refresh())

const titleMap = computed(() => {
  const map: Record<string, string> = {}
  contentItems.value?.forEach((item) => {
    if (item.path) {
      map[item.path.toLowerCase()] = item.title
    }
  })
  return map
})

const breadcrumbs = computed(() =>
  baseCrumbs.value.map((crumb) => ({
    label: titleMap.value[crumb.path.toLowerCase()] || crumb.label,
    path: crumb.path,
  }))
)
</script>

<template>
  <Breadcrumb>
    <BreadcrumbList>
      <template v-for="(crumb, index) in breadcrumbs" :key="index">
        <BreadcrumbItem v-if="index < breadcrumbs.length - 1" class="hidden md:block">
          <BreadcrumbLink :href="crumb.path">
            {{ crumb.label }}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem v-else>
          <BreadcrumbPage>{{ crumb.label }}</BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator v-if="index < breadcrumbs.length - 1" class="hidden md:block" />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
