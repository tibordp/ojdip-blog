---
title: "Adieu, WordPress"
date: "2020-04-07"
---

When I started this blog 8 years ago, I had the sincere intention of posting on a regular basis. As evidenced by the 6 year hiatus, this has obviously not been the case. Combined with the fact that I no longer use French on a regular basis and regularly bore people with my vivid dreams, this relevant XKCD[&trade;](https://www.reddit.com/r/RelevantXKCD/) is very relevant (you be the judge on panel four).

[![XKCD 621](./images/superlative.png "XKCD 621")](https://xkcd.com/621/)

The nifty XKCD ice breaker aside, I have also been putting off doing something about the fact that the hosting for this blog was almost as neglected as the blog itself, which gave me a perfect excuse to finally make a new post.

### Exit WordPress

Ojdip.net was initially hosted at Hetzner on a small VPS running LAMP stack. In 2015 I moved from Slovenia to Czech Republic for a job at Microsoft and I made a big mistake of cancelling my phone number plan before I made sure all the services connected to it were updated. My hosting plan was one of these. I had also lost the root password, which made it impossible for me to keep the server up-to-date. As I no longer had the phone number for SMS-based 2FA, I was not able to convince Hetzner to reset my root password (to their credit, I am glad that they were unwilling to do so - they did offer to send a verification letter to my registered address, but I obviously no longer lived there).

Luckily the years of neglect came to my advantage. The kernel was so old at that point that I was easily able to find an exploit to get root access using just a non-privileged user via SSH. At which point I was able to build a new server at DigitalOcean, migrate the blog there, switch the DNS records, shutdown the old server and let it expire along with the credit card that paid for it.

That was 4 years ago. I have since moved countries again - I now live in Ireland and work for Reddit. I tried to keep the server and the WordPress installation reasonably up-to-date, but I grew increasingly frustrated with WordPress. The admin panel was a mess, with every single extension I was using injecting ads for their premium offerings, the whole thing was slow and bloated and generally not very nice.

In 2019 I unsuccessfully tried to [lift-and-shift it to my Kubernetes cluster](https://github.com/helm/charts/tree/master/stable/wordpress), to at least have all my personal projects deployed under the same umbrella. It was unbearingly slow with a `ReadWrite` PersistentVolumeClaim due to thousands of small files, which do not seem to play well with networked file systems, so I quickly gave up instead of trying to make it work.

Over the last weekend I finally ditched WordPress along with `ocean01.ojdip.net` which was my last server in a traditional sense. I am now fully cloud native!

### Enter Gatsby

I do not consider myself a frontend developer and I generally try to steer clear of HTML, CSS and Javascript. I have to admit though that I do quite enjoy React after gaining some experience with it both at my day job and personal projects. I also heard that [JAMstack is a hot new thing](https://swizec.com/blog/its-never-been-this-easy-to-build-a-webapp/swizec/9295) in &lt;current year&gt;[^1], so I decided to give [Gatsby](https://www.gatsbyjs.org/) a go.

The basic template I used for this blog is [gatsby-starter-blog](https://github.com/gatsbyjs/gatsby-starter-blog). I did a few tweaks, like adding the [about me page](/about), changing the styling a bit and added [$\KaTeX$](https://www.gatsbyjs.org/packages/gatsby-remark-katex/) for rendering math equations. Otherwise, this is pretty much the vanilla Gatsby Starter Blog.

Finally I imported my posts from WordPress using [this tool](https://github.com/lonekorean/wordpress-export-to-markdown). I had to manually re-format the code blocks and equations, but otherwise it pretty much worked out of the box.

[^1]: I do realize that [the concept has been around for a while](https://jamstack.wtf/), but I have never heard of it before 2020.

### Deployment

The last part was deploying the blog somewhere. Not being a huge fan of using yet another hosting service to the mix, I initially tried to [Dockerize it](https://github.com/gatsbyjs/gatsby-docker) and serve it from Kubernetes. It definitely worked, but there was a slight problem: I did not want to compromise and have my blog be accessible via IPv4 only.

This probably deserves another blog post, but IPv6 support in Kubernetes is still very poor, at least when it comes to managed offerings from cloud providers. For some other projects, my standard trick was to put Cloudflare in front of it, but that would require me to sign DNS NS records over to them. I am reluctant to do this because of the MX records. My primary email address is under the same domain and if I lost access to it, I would be in deep trouble.

So I decided to go with the more traditional deployment strategy [using S3 and Cloudfront](https://www.gatsbyjs.org/docs/deploying-to-s3-cloudfront/). This blog is entirely static, so it can be served by pretty much anything, but I already use AWS for a bunch of other stuff, so it made sense.

### What now?

Exit Wordpress, enter Gatsby, now I have a shiny static blog with no infrastructure to maintain. There was some collateral damage, some small PHP apps I wrote a decade ago that were also hosted on the same server. I was able to move [some elsewhere](http://tibordp.github.io/gator-calculus/), others, like a French verb conjugator that was apparantly still getting traffic, I deemed an acceptable loss.

I am now absolutely definitely pinky promise incentivized to write more often! If I do not, I [accept pull requests](https://github.com/tibordp/ojdip-blog) for guest posts 😉
