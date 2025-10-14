module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy('assets');
    eleventyConfig.addPassthroughCopy('style.css');
    eleventyConfig.addPassthroughCopy('main.js');
    eleventyConfig.addPassthroughCopy('images');

    eleventyConfig.addCollection('docs', function (collectionApi) {
        return collectionApi.getFilteredByGlob("docs/*.md").sort((a, b) => {
            return (a.data.order || 0) - (b.data.order || 0);
        });
    });

    return {
        dir: {
            input: '.',
            includes: '_includes',
            data: '_data',
            output: '_site'
        },
        pathPrefix: '/docs/',
        templateFormats: ['md', 'njk', 'html'],
        markdownTemplateEngine: 'njk',
        htmlTemplateEngine: 'njk',
        dataTemplateEngine: 'njk'
    };
};
