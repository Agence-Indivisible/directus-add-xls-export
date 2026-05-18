import { useAliasFields } from '@/composables/use-alias-fields';
import { useExtension } from '@/composables/use-extension';
import { useFieldsStore } from '@/stores/fields';
import { getRelatedCollection } from '@/utils/get-related-collection';
import { renderDisplayStringTemplate } from '@/utils/render-string-template';
import type { Field, Item } from '@directus/types';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { computed } from 'vue';

function formatRelatedArrayForExport(collection: string, field: Field, value: Record<string, any>[]) {
	const relatedCollections = getRelatedCollection(collection, field.field);
	if (!relatedCollections) return value.map((item) => JSON.stringify(item)).join(', ');

	const fieldsStore = useFieldsStore();
	const targetCollection = relatedCollections.junctionCollection ?? relatedCollections.relatedCollection;
	const template =
		field.meta?.display_options?.template ??
		(() => {
			const primaryKeyField = fieldsStore.getPrimaryKeyFieldForCollection(relatedCollections.relatedCollection);
			const primaryKeyFieldPath = relatedCollections.path
				? [...relatedCollections.path, primaryKeyField?.field].join('.')
				: primaryKeyField?.field;

			return primaryKeyFieldPath ? `{{ ${primaryKeyFieldPath} }}` : null;
		})();

	if (!template) return value.map((item) => JSON.stringify(item)).join(', ');

	return value
		.map((item) => renderDisplayStringTemplate(targetCollection, template, item))
		.filter((item) => item !== null && item !== undefined && item !== '')
		.join(', ');
}

async function formatFieldValueForExport(collection: string, field: Field | null, value: unknown) {
	if (value === undefined || value === null) return value;

	if (Array.isArray(value)) {
		if (field && getRelatedCollection(collection, field.field)) {
			return formatRelatedArrayForExport(collection, field, value as Record<string, any>[]);
		}

		const formattedValues = await Promise.all(value.map((item) => formatFieldValueForExport(collection, field, item)));

		return formattedValues
			.filter((item) => item !== null && item !== undefined && item !== '')
			.map((item) => (typeof item === 'object' ? JSON.stringify(item) : item))
			.join(', ');
	}

	const display = useExtension(
		'display',
		computed(() => field?.meta?.display ?? null),
	);

	if (display.value?.handler) {
		const result = display.value.handler(value, field?.meta?.display_options ?? {}, {
			interfaceOptions: field?.meta?.options ?? {},
			field: field ?? undefined,
			collection,
		});

		return result instanceof Promise ? await result : result;
	}

	return value;
}

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

			parsedItem[name] = await formatFieldValueForExport(collection, fieldsUsed[key], value);
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

