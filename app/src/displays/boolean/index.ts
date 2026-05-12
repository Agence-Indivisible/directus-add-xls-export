import { i18n } from '@/lang';
import { defineDisplay } from '@directus/extensions';
import { translate } from '@/utils/translate-literal';
import DisplayBoolean from './boolean.vue';

export default defineDisplay({
	id: 'boolean',
	name: '$t:displays.boolean.boolean',
	description: '$t:displays.boolean.description',
	types: ['boolean'],
	icon: 'check_box',
	component: DisplayBoolean,
	handler: (value, options) => {
		if (value === null || value === undefined) {
			return value;
		}

		const rawOn = options.labelOn ?? null;
		const rawOff = options.labelOff ?? null;

		if (rawOn !== null && rawOff !== null) {
			return value ? translate(rawOn) : translate(rawOff);
		}

		return value ? i18n.global.t('enabled') : i18n.global.t('disabled');
	},
	options: [
		{
			field: 'labelOn',
			name: '$t:displays.boolean.label_on',
			type: 'string',
			meta: {
				interface: 'system-input-translated-string',
				width: 'half',
				options: {
					placeholder: '$t:displays.boolean.label_on_placeholder',
				},
			},
		},
		{
			field: 'labelOff',
			name: '$t:displays.boolean.label_off',
			type: 'string',
			meta: {
				interface: 'system-input-translated-string',
				width: 'half',
				options: {
					placeholder: '$t:displays.boolean.label_off_placeholder',
				},
			},
		},
		{
			field: 'iconOn',
			name: '$t:displays.boolean.icon_on',
			type: 'string',
			meta: {
				interface: 'select-icon',
				width: 'half',
			},
			schema: {
				default_value: 'check',
			},
		},
		{
			field: 'iconOff',
			name: '$t:displays.boolean.icon_off',
			type: 'string',
			meta: {
				interface: 'select-icon',
				width: 'half',
			},
			schema: {
				default_value: 'close',
			},
		},
		{
			field: 'colorOn',
			name: '$t:displays.boolean.color_on',
			type: 'string',
			meta: {
				interface: 'select-color',
				width: 'half',
			},
		},
		{
			field: 'colorOff',
			name: '$t:displays.boolean.color_off',
			type: 'string',
			meta: {
				interface: 'select-color',
				width: 'half',
			},
		},
	],
});
