import {type FlatXoConfig} from 'xo';

export default [
	{
		prettier: true,
		rules: {
			'max-params': ['warn', 6], // Allow up to 6 params
		},
	},
] satisfies FlatXoConfig;
