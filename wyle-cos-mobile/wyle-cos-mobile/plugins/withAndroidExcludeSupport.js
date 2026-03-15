const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withAndroidExcludeSupport(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') return config;
    const exclusion = `
subprojects {
    configurations.all {
        exclude group: 'com.android.support'
    }
}
`;
    if (!config.modResults.contents.includes("exclude group: 'com.android.support'")) {
      config.modResults.contents += exclusion;
    }
    return config;
  });
};
