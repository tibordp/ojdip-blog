import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Image from "gatsby-image"
import { rhythm } from "../utils/typography"

const AboutMePage = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const author = data.site.siteMetadata.author

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="About Me" />
      <h1>About Me</h1>
      <div
        style={{
          display: `flex`,
          flexWrap: `wrap`,
          justifyContent: `center`,
          marginBottom: rhythm(2.5),
        }}
      >
        <Image
          fixed={data.avatar.childImageSharp.fixed}
          alt={author.name}
          style={{
            marginRight: rhythm(1),
            marginBottom: rhythm(1),
            borderRadius: `100%`,
          }}
          imgStyle={{
            borderRadius: `100%`,
          }}
        />
        <section style={{ flex: 1, minWidth: rhythm(12) }}>
          <p>
            Hi, I am <strong>{author.name}</strong>, a software engineer based
            in Dublin, Ireland. Currently I am working as a backend engineer at{" "}
            <a href="https://reddit.com">Reddit</a>.
          </p>
          <p>
            I am passionate about music, human languages, formal languages,
            observability and IPv6.
          </p>
          <p>
            Get in touch by dropping me an email at{" "}
            <a href="mailto:tibor.djurica@ojdip.net">tibor.djurica@ojdip.net</a>
          </p>
        </section>
      </div>
    </Layout>
  )
}

export default AboutMePage

export const pageQuery = graphql`
  query {
    avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
      childImageSharp {
        fixed(width: 250, height: 250) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    site {
      siteMetadata {
        title
        author {
          name
          summary
        }
        social {
          github
          linkedin
        }
      }
    }
  }
`
