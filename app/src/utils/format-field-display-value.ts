import { useExtension } from '@/composables/use-extension';
import { useFieldsStore } from '@/stores/fields';
import { getRelatedCollection } from '@/utils/get-related-collection';
import { renderDisplayStringTemplate } from '@/utils/render-string-template';
import type { Field } from '@directus/types';
import { computed } from 'vue';

function isScalarArray(value: unknown[]): boolean {
	return value.every((entry) => entry === null || entry === undefined || typeof entry !== 'object');
}

function isRelationItemArray(collection: string, fieldKey: string, value: unknown[]): boolean {
	const relationField = fieldKey.split('.')[0]!;
	if (!getRelatedCollection(collection, relationField)) return false;

	return value.some((entry) => typeof entry === 'object' && entry !== null);
}

function formatRelatedArrayForExport(collection: string, fieldKey: string, field: Field, value: Record<string, any>[]) {
	const relationField = fieldKey.split('.')[0]!;
	const relatedCollections = getRelatedCollection(collection, relationField);
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

export function getScalarDisplayValues(value: unknown): unknown[] | null {
	if (!Array.isArray(value) || value.length === 0) return null;
	if (!isScalarArray(value)) return null;

	return value.filter((entry) => entry !== null && entry !== undefined);
}

export async function formatFieldDisplayValue(
	collection: string,
	field: Field | null,
	fieldKey: string,
	value: unknown,
) {
	if (value === undefined || value === null) return value;

	if (Array.isArray(value)) {
		if (field && isRelationItemArray(collection, fieldKey, value)) {
			return formatRelatedArrayForExport(collection, fieldKey, field, value as Record<string, any>[]);
		}

		const formattedValues = await Promise.all(
			value.map((item) => formatFieldDisplayValue(collection, field, fieldKey, item)),
		);

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
