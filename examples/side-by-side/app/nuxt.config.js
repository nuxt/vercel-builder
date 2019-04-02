const { resolve } = require('path');

module.exports = {
	mode: 'universal',

	/*
	 ** Headers of the page
	 */
	head: {
		title: 'APP',
		meta: [
			{ charset: 'utf-8' },
			{
				name: 'viewport',
				content: 'width=device-width, initial-scale=1'
			},
			{
				hid: 'description',
				name: 'description',
				content: 'some text description dog'
			}
		],
		link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
	},

	// We want our admin build to be in a different src than our app build
	srcDir: __dirname,
	buildDir: '_nuxt/app',
	lambdaName: 'index', // main app should be index

	/*
	 ** Customize the progress-bar color
	 */
	loading: { color: '#000' },

	build: {
		// I have set this up to be specifically at root...
		publicPath: '_nuxt/app',

		// add support for ~/shared
		extend(config) {
			// Add '~/shared' as an alias.
			config.resolve.alias.shared = resolve(__dirname, '../shared');
			config.resolve.alias['~shared'] = resolve(__dirname, '../shared');
		}
	}
};
