import React from "react"
import { Link } from "gatsby"

import { rhythm, scale } from "../utils/typography"

import { FaEnvelope, FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa"

const Layout = ({ location, title, children }) => {
  const isRootPath = location.pathname === `${__PATH_PREFIX__}/`
  const pageNumber = location.pathname.split("/").filter(Boolean).pop()
  const isPaginatedPath = pageNumber && Boolean(pageNumber.match(/^[0-9]+$/))
  let header

  if (isRootPath || isPaginatedPath) {
    header = (
      <h1
        style={{
          ...scale(1.5),
          marginBottom: rhythm(0.75),
          marginTop: 0,
        }}
      >
        <Link
          style={{
            boxShadow: "none",
            color: "inherit",
          }}
          to={"/"}
        >
          {title}
        </Link>
      </h1>
    )
  } else {
    header = (
      <h3
        style={{
          marginTop: 0,
        }}
      >
        <Link
          style={{
            boxShadow: "none",
            color: "inherit",
          }}
          to={"/"}
        >
          {title}
        </Link>
      </h3>
    )
  }
  return (
    <div
      style={{
        marginLeft: "auto",
        marginRight: "auto",
        maxWidth: rhythm(36),
        padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
      }}
    >
      <header>{header}</header>
      <main>{children}</main>
      <footer
        style={{
          borderTop: "1px solid hsla(0,0%,0%,0.07)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <nav
          style={{
            maxWidth: rhythm(12),
            justifyContent: "space-between",
            flex: 1,
            display: "flex",
            fontSize: rhythm(1.25),
            padding: rhythm(0.75),
          }}
        >
          <a href="https://twitter.com/tibordp">
            <FaTwitter title="My Twitter Profile" />
          </a>
          <a href="https://github.com/tibordp">
            <FaGithub title="My Github Profile" />
          </a>
          <a href="mailto:tibor.djurica@ojdip.net">
            <FaEnvelope title="Email me" />
          </a>
          <a href="https://linkedin.com/in/tibordp">
            <FaLinkedin title="My LinkedIn Profile" />
          </a>
        </nav>
      </footer>
    </div>
  )
}

export default Layout
