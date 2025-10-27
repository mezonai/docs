module.exports = function () {
    return {
      name: "redirect-developer-locale",
      async contentLoaded({ actions }) {
        const { addRoute } = actions;
        addRoute({
          path: "/docs/developer",
          exact: false,
          component: "@site/src/components/Redirect/DeveloperRedirect.tsx",
        });
      },
    };
  };
  