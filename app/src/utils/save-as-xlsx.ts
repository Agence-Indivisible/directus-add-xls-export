import { useAliasFields } from '@/composables/use-alias-fields';
import { useExtension } from '@/composables/use-extension';
import { useFieldsStore } from '@/stores/fields';
import type { Field, Item } from '@directus/types';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { computed } from 'vue';

export async function saveAsXLSX(collection: string, fields: string[], items: Item[]) {
	const fieldsStore = useFieldsStore();

	const fieldsUsed: Record<string, Field | null> = {};

	for (const key of fields) {
		fieldsUsed[key] = fieldsStore.getField(collection, key);
	}

	const { getFromAliasedItem } = useAliasFields(fields, collection);

	const parsedItems: Array<Record<string, any>> = [];

	for (const item of items) {
		const parsedItem: Record<string, any> = {};

		for (const key of fields) {
			let name: string;

			const keyParts = key.split('.');

			if (keyParts.length > 1) {
				const names = keyParts.map((fieldKey, index) => {
					const pathPrefix = keyParts.slice(0, index);
					const field = fieldsStore.getField(collection, [...pathPrefix, fieldKey].join('.'));
					return field?.name ?? fieldKey;
				});

				name = names.join(' -> ');
			} else {
				name = fieldsUsed[key]?.name ?? key;
			}

			const value = getFromAliasedItem(item, key);

			const display = useExtension(
				'display',
				computed(() => fieldsUsed[key]?.meta?.display ?? null),
			);

			parsedItem[name] =
				value !== undefined && value !== null && display.value?.handler
					? await display.value.handler(value, fieldsUsed[key]?.meta?.display_options ?? {}, {
							interfaceOptions: fieldsUsed[key]?.meta?.options ?? {},
							field: fieldsUsed[key] ?? undefined,
							collection,
					  })
					: value;
		}

		parsedItems.push(parsedItem);
	}

	const worksheet = XLSX.utils.json_to_sheet(parsedItems);
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Export');

	const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

	const now = new Date();
	const dateString = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

	saveAs(
		new Blob([buffer], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		}),
		`${collection}-${dateString}.xlsx`,
	);
}

