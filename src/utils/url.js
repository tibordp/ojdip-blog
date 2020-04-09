exports.getArticleUrl = (node) =>
  `/${node.frontmatter.urlDate}${node.fields.slug}`
