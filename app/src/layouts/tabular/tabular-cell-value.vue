<script setup lang="ts">
import type { HeaderRaw } from '@/components/v-table/types';
import { getScalarDisplayValues } from '@/utils/format-field-display-value';
import type { Item } from '@directus/types';
import { computed } from 'vue';

const props = defineProps<{
	item: Item;
	header: HeaderRaw;
	getFromAliasedItem: (item: Item, key: string) => unknown;
}>();

const value = computed(() => props.getFromAliasedItem(props.item, props.header.value));
const scalarValues = computed(() => getScalarDisplayValues(value.value));
</script>

<template>
	<span v-if="scalarValues" class="display-values">
		<template v-for="(scalarValue, scalarIndex) in scalarValues" :key="scalarIndex">
			<render-display
				:value="scalarValue"
				:display="header.field.display"
				:options="header.field.displayOptions"
				:interface="header.field.interface"
				:interface-options="header.field.interfaceOptions"
				:type="header.field.type"
				:collection="header.field.collection"
				:field="header.field.field"
			/>
			<span v-if="scalarIndex < scalarValues.length - 1">,&nbsp;</span>
		</template>
	</span>
	<render-display
		v-else
		:value="value"
		:display="header.field.display"
		:options="header.field.displayOptions"
		:interface="header.field.interface"
		:interface-options="header.field.interfaceOptions"
		:type="header.field.type"
		:collection="header.field.collection"
		:field="header.field.field"
	/>
</template>

<style scoped>
.display-values {
	display: inline;
}
</style>
