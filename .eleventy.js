module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy('assets');
    eleventyConfig.addPassthroughCopy('style.css');
    eleventyConfig.addPassthroughCopy('main.js');
    eleventyConfig.addPassthroughCopy('images');

    eleventyConfig.addCollection('docs', function (collectionApi) {
        return collectionApi.getFilteredByGlob('docs/*.md');
    });

    return {
        dir: {
            input: '.',
            includes: '_includes',
            data: '_data',
            output: '_site'
        },
        pathPrefix: '/',
        templateFormats: ['md', 'njk', 'html'],
        markdownTemplateEngine: 'njk',
        htmlTemplateEngine: 'njk',
        dataTemplateEngine: 'njk'
    };
};
