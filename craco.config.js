module.exports = {
	webpack: {
		configure(webpackConfig, {env, paths}) {
			webpackConfig.experiments = {
				asyncWebAssembly: true,
				syncWebAssembly: true,
				topLevelAwait: true,
			};
			return webpackConfig;
		},
	},
};
