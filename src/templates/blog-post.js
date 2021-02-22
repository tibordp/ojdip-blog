import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import { rhythm, scale } from "../utils/typography"
import { GatsbySeo } from "gatsby-plugin-next-seo"
import { getArticleUrl } from "../utils/url"

import "./blog.css"

const BlogPostTemplate = ({ data, pageContext, location }) => {
  const post = data.markdownRemark
  const siteTitle = data.site.siteMetadata.title
  const canonicalUrl = `${data.site.siteMetadata.siteUrl}${location.pathname}`
  const description = post.frontmatter.description || post.excerpt
  const { previous, next } = pageContext

  return (
    <Layout location={location} title={siteTitle}>
      <GatsbySeo
        title={post.frontmatter.title}
        description={description}
        canonical={canonicalUrl}
        openGraph={{
          title: post.frontmatter.title,
          description,
          url: canonicalUrl,
          type: "article",
          article: {
            publishedTime: post.frontmatter.dateRaw,
          },
        }}
      />
      <article>
        <header>
          <h1
            style={{
              marginTop: rhythm(1),
              marginBottom: 0,
            }}
          >
            {post.frontmatter.title}
          </h1>
          <p
            style={{
              ...scale(-1 / 5),
              display: "block",
              marginBottom: rhythm(1),
            }}
          >
            {post.frontmatter.date}
          </p>
        </header>
        <section dangerouslySetInnerHTML={{ __html: post.html }} />
        <hr
          style={{
            marginBottom: rhythm(1),
          }}
        />
        <footer>
          <Bio />
        </footer>
      </article>

      <nav>
        <ul
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginTop: rhythm(1),
            justifyContent: "space-between",
            listStyle: "none",
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={getArticleUrl(previous)} rel="prev">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={getArticleUrl(next)} rel="next">
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        siteUrl
        author {
          name
        }
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        dateRaw: date(formatString: "YYYY-MM-DD")
        description
      }
    }
  }
`
